import { Router, Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { requireAuth } from '../middlewares/auth.middleware';
import * as postController from '../controllers/post.controller';
import * as reactionController from '../controllers/reaction.controller';
import * as commentController from '../controllers/comment.controller';

const router = Router();

// Type cho multer file
type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

// Cấu hình multer để lưu file vào memory (buffer) để upload lên Cloudinary
const storage = multer.memoryStorage();

// Chỉ chấp nhận file ảnh
const fileFilter = (_req: Request, file: MulterFile, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * POST /posts
 * Tạo bài viết mới (Upload Moment)
 * Body: multipart/form-data
 *   - image: File (required)
 *   - caption: string (optional)
 *   - locationName: string (optional)
 *   - lat: number (optional)
 *   - lng: number (optional)
 *   - visibility: 'friends' | 'private' (optional, default: 'friends')
 */
router.post('/', requireAuth, upload.single('image'), postController.create);

/**
 * POST /posts/:id/react
 * Thêm hoặc cập nhật reaction cho một post
 * Body: { type: ReactionType }
 */
router.post('/:id/react', requireAuth, reactionController.addReaction);

/**
 * DELETE /posts/:id/react
 * Xóa reaction của user trên một post
 */
router.delete('/:id/react', requireAuth, reactionController.removeReaction);

/**
 * GET /posts/:id/react
 * Lấy reaction của user trên một post
 */
router.get('/:id/react', requireAuth, reactionController.getUserReaction);

/**
 * POST /posts/:id/comment
 * Tạo comment mới trên một post
 * Body: { content: string, parentCommentId?: string, mentions?: string[] }
 */
router.post('/:id/comment', requireAuth, commentController.createComment);

/**
 * GET /posts/:id/comments
 * Lấy danh sách comments của một post
 * Query params: page, limit
 */
router.get('/:id/comments', commentController.getPostComments);

export default router;

