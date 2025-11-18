import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as friendshipController from '../controllers/friendship.controller';

const router = Router();

/**
 * POST /friendships/request
 * Gửi lời mời kết bạn
 * Body: { toUserId: string }
 */
router.post('/request', requireAuth, friendshipController.sendFriendRequest);

/**
 * POST /friendships/:requestId/accept
 * Chấp nhận lời mời kết bạn
 */
router.post('/:requestId/accept', requireAuth, friendshipController.acceptFriendRequest);

/**
 * POST /friendships/:requestId/reject
 * Từ chối hoặc hủy lời mời kết bạn
 */
router.post('/:requestId/reject', requireAuth, friendshipController.rejectFriendRequest);

export default router;

