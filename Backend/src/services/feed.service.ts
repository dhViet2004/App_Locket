import { Post, IPost } from '../models/post.model';
import { Friendship } from '../models/friendship.model';
import { Ad, IAd } from '../models/ad.model';
import { Types } from 'mongoose';
import { ApiError } from '../utils/apiResponse';

/**
 * Interface cho FeedItem - mỗi item có thể là post hoặc ad
 */
export interface FeedItem {
  type: 'post' | 'ad';
  data: IPost | IAd;
}

/**
 * Class FeedService - Xử lý business logic cho Feed
 */
export class FeedService {
  /**
   * Lấy feed của user (bài viết từ bạn bè + quảng cáo nếu không premium)
   * @param userId - ID của user
   * @param isPremium - Trạng thái premium của user
   * @param page - Số trang (default: 1)
   * @param limit - Số lượng items mỗi trang (default: 20)
   * @returns Mảng FeedItem (post hoặc ad)
   */
  async getFeed(
    userId: string,
    isPremium: boolean,
    page: number = 1,
    limit: number = 20
  ): Promise<FeedItem[]> {
    try {
      // 1. Lấy danh sách bạn bè: Truy vấn friendship.model để lấy danh sách ID của bạn bè (chỉ status: 'accepted')
      const friendships = await Friendship.find({
        $or: [
          { userA: new Types.ObjectId(userId), status: 'accepted' },
          { userB: new Types.ObjectId(userId), status: 'accepted' },
        ],
      });

      // Xử lý lỗi nếu không tìm thấy bạn bè
      if (friendships.length === 0) {
        // Không có bạn bè, trả về mảng rỗng hoặc có thể trả về bài viết của chính user
        // Ở đây ta vẫn cho phép xem bài viết của chính mình
      }

      // Lấy danh sách friend IDs
      const friendIds = friendships.map((friendship) => {
        const userAId = friendship.userA.toString();
        const userBId = friendship.userB.toString();
        return userAId === userId ? userBId : userAId;
      });

      // Thêm chính user vào để xem bài viết của mình
      const authorIds = [...new Set([...friendIds, userId])];

      // 2. Lấy bài viết: Truy vấn post.model để lấy bài viết của các ID bạn bè vừa tìm được
      // Phân trang theo page và limit. Populate thông tin tác giả.
      const skip = (page - 1) * limit;
      
      // Lấy nhiều posts hơn để có thể chèn ads
      const postsToFetch = isPremium ? limit : limit * 2; // Lấy gấp đôi nếu có ads

      const posts = await Post.find({
        author: { $in: authorIds.map((id) => new Types.ObjectId(id)) },
        visibility: { $in: ['friends', 'private'] },
        deletedAt: null,
      })
        .populate('author', 'username displayName avatarUrl') // Populate thông tin tác giả
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(postsToFetch)
        .lean();

      // Xử lý lỗi nếu không tìm thấy bài viết
      if (posts.length === 0) {
        return [];
      }

      // 3. Convert posts thành FeedItem
      let feedItems: FeedItem[] = posts.map((post) => ({
        type: 'post' as const,
        data: post as unknown as IPost,
      }));

      // 4. Logic chèn Quảng cáo (Monetization)
      if (!isPremium) {
        // Nếu isPremium là false: Query ad.model.ts để lấy một danh sách quảng cáo đang hoạt động
        const activeAds = await this.getActiveAds('feed');

        if (activeAds.length > 0) {
          // Chèn quảng cáo này vào mảng kết quả của Feed: Cứ sau 20 bài viết thì chèn 1 quảng cáo
          const adInterval = 20; // Cứ sau 20 posts thì chèn 1 ad
          const result: FeedItem[] = [];
          let adIndex = 0;

          for (let i = 0; i < feedItems.length; i++) {
            result.push(feedItems[i]);

            // Chèn ad sau mỗi 20 posts (index 19, 39, 59, ...)
            if ((i + 1) % adInterval === 0 && adIndex < activeAds.length) {
              const ad = activeAds[adIndex % activeAds.length];
              result.push({
                type: 'ad' as const,
                data: ad as unknown as IAd,
              });

              // Tăng impression count
              await Ad.findByIdAndUpdate(ad._id, {
                $inc: { impressionCount: 1 },
              });

              adIndex++;
            }
          }

          feedItems = result;
        }
      }

      // 5. Giới hạn số lượng items theo limit
      return feedItems.slice(0, limit);
    } catch (error) {
      console.error('Error in FeedService.getFeed:', error);
      throw new ApiError(500, 'Failed to get feed');
    }
  }

  /**
   * Lấy danh sách quảng cáo đang hoạt động cho placement
   * @param placement - Vị trí hiển thị quảng cáo
   * @returns Mảng quảng cáo đang active
   */
  private async getActiveAds(placement: 'feed' | 'splash' | 'banner'): Promise<IAd[]> {
    const now = new Date();

    // Query ads đang active (startAt <= now và endAt >= now hoặc null)
    const ads = await Ad.find({
      placement,
      isActive: true,
      $and: [
        {
          $or: [{ startAt: null }, { startAt: { $lte: now } }],
        },
        {
          $or: [{ endAt: null }, { endAt: { $gte: now } }],
        },
      ],
    })
      .sort({ priority: -1, createdAt: -1 })
      .limit(10)
      .lean();

    return ads as unknown as IAd[];
  }
}

// Export instance để sử dụng
export const feedService = new FeedService();

