import { Response, Request } from 'express';
import { PremiumRequest } from '../middlewares/subscription.middleware';
import { feedService } from '../services/feed.service';
import { ok, ApiError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Lấy feed của user
 * GET /api/feed?page=1&limit=20
 * 
 * Hàm getFeed phải lấy isPremium từ req và chuyển page, limit từ query params vào Service
 */
export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const premiumReq = req as unknown as PremiumRequest;
  
  // Kiểm tra authentication
  if (!premiumReq.userId || !premiumReq.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  // Lấy page và limit từ query params
  const page = Math.max(parseInt((premiumReq.query?.page as string) || '1'), 1);
  const limit = Math.min(Math.max(parseInt((premiumReq.query?.limit as string) || '20'), 1), 100); // Max 100 items
  
  // Lấy isPremium từ req (đã được set bởi checkPremiumStatus middleware)
  const isPremium = premiumReq.isPremium || false;

  // Gọi FeedService.getFeed với các tham số
  const feed = await feedService.getFeed(premiumReq.userId, isPremium, page, limit);

  return res.status(200).json(ok(feed, 'Feed retrieved successfully'));
});

