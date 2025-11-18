import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { checkPremiumStatus } from '../middlewares/subscription.middleware';
import * as feedController from '../controllers/feed.controller';

const router = Router();

/**
 * GET /feed
 * Lấy feed của user (bài viết từ bạn bè + quảng cáo nếu không premium)
 * Query params:
 *   - page: number (optional, default: 1)
 *   - limit: number (optional, default: 20)
 */
router.get('/', requireAuth, checkPremiumStatus, feedController.getFeed);

export default router;

