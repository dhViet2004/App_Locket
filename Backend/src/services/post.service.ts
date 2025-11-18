import { Post, IPost } from '../models/post.model';
import { Friendship } from '../models/friendship.model';
import { Device } from '../models/device.model';
import { Types } from 'mongoose';

/**
 * Class PostService - Xử lý business logic cho Post
 */
export class PostService {
  /**
   * Tạo bài viết mới (Upload Moment)
   * @param userId - ID của user tạo post
   * @param imageUrl - URL ảnh đã upload lên Cloudinary/S3
   * @param caption - Nội dung caption (optional)
   * @returns Post document đã tạo
   */
  async createPost(userId: string, imageUrl: string, caption?: string): Promise<IPost> {
    // 1. Logic Lưu trữ: Tạo bản ghi mới trong post.model
    const post = await Post.create({
      author: new Types.ObjectId(userId),
      imageUrl,
      caption: caption || undefined,
      visibility: 'friends',
      reactionCount: 0,
      commentCount: 0,
      reactionCounts: {},
    });

    // 2. Logic Cập nhật Widget (Thông báo)
    const postId = typeof post._id === 'string' ? post._id : (post._id as Types.ObjectId).toString();
    await this.sendNotificationsToFriends(userId, postId);

    return post;
  }

  /**
   * Gửi thông báo đến bạn bè khi có post mới
   * @param userId - ID của user tạo post
   * @param postId - ID của post vừa tạo
   */
  private async sendNotificationsToFriends(userId: string, postId: string): Promise<void> {
    // 2.1. Tìm tất cả bạn bè đã chấp nhận (status: 'accepted')
    const friendships = await Friendship.find({
      $or: [
        { userA: new Types.ObjectId(userId), status: 'accepted' },
        { userB: new Types.ObjectId(userId), status: 'accepted' },
      ],
    });

    // 2.2. Lấy danh sách friend IDs
    const friendIds = friendships.map((friendship) => {
      const userAId = friendship.userA.toString();
      const userBId = friendship.userB.toString();
      return userAId === userId ? userBId : userAId;
    });

    if (friendIds.length === 0) {
      return;
    }

    // 2.3. Tìm tất cả FCM tokens của bạn bè từ device.model
    const devices = await Device.find({
      user: { $in: friendIds.map((id) => new Types.ObjectId(id)) },
    });

    const tokens = devices.map((device) => device.pushToken);

    if (tokens.length === 0) {
      return;
    }

    // 2.4. Gọi hàm giả lập mockSendNotification
    this.mockSendNotification(tokens, postId);
  }

  /**
   * Hàm giả lập gửi notification
   * @param tokens - Mảng FCM tokens
   * @param postId - ID của post
   */
  private mockSendNotification(tokens: string[], postId: string): void {
    console.log(`Đã gửi notification đến ${tokens.length} thiết bị để cập nhật Widget.`);
    console.log(`Post ID: ${postId}`);
    console.log(`Tokens: ${tokens.join(', ')}`);

    // TODO: Thực tế sẽ gọi:
    // - Expo Push API: https://docs.expo.dev/push-notifications/sending-notifications/
    // - FCM: https://firebase.google.com/docs/cloud-messaging
  }
}

// Export instance để sử dụng
export const postService = new PostService();

