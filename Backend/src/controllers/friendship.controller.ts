import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendRequest, acceptRequest, rejectRequest } from '../services/friendship.service';
import { ok } from '../utils/apiResponse';
import { ApiError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Gửi lời mời kết bạn
 * POST /friendships/request
 * Body: { toUserId: string }
 */
export const sendFriendRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { toUserId } = req.body;

  if (!toUserId) {
    throw new ApiError(400, 'toUserId is required');
  }

  const friendship = await sendRequest(req.userId, toUserId);

  return res.status(201).json(ok(friendship, 'Friend request sent successfully'));
});

/**
 * Chấp nhận lời mời kết bạn
 * POST /friendships/:requestId/accept
 */
export const acceptFriendRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { requestId } = req.params;

  if (!requestId) {
    throw new ApiError(400, 'requestId is required');
  }

  const friendship = await acceptRequest(requestId, req.userId);

  return res.status(200).json(ok(friendship, 'Friend request accepted successfully'));
});

/**
 * Từ chối hoặc hủy lời mời kết bạn
 * POST /friendships/:requestId/reject
 */
export const rejectFriendRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { requestId } = req.params;

  if (!requestId) {
    throw new ApiError(400, 'requestId is required');
  }

  await rejectRequest(requestId, req.userId);

  return res.status(200).json(ok(null, 'Friend request rejected successfully'));
});
