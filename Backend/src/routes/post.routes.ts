import { Router, Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { requireAuth } from '../middlewares/auth.middleware';
import { checkNSFW } from '../middlewares/nsfw.middleware';
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
 * 
 * Middleware order:
 * 1. requireAuth - Kiểm tra authentication
 * 2. upload.single('image') - Nhận file từ multer
 * 3. checkNSFW - Kiểm tra nội dung nhạy cảm
 * 4. postController.create - Tạo bài viết
 */
router.post('/', requireAuth, upload.single('image'), checkNSFW, postController.create);

/**
 * POST /posts/suggest-caption
 * Gợi ý caption cho ảnh sử dụng Groq AI
 * Body (option 1): multipart/form-data
 *   - image: File (required)
 * Body (option 2): application/json
 *   - base64Image: string (required) - Base64 encoded image với prefix data:image/...;base64,
 * 
 * Response: { success: true, data: { caption: string } }
 */
router.post('/suggest-caption', requireAuth, upload.single('image'), postController.suggestCaption);

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

/**
 * GET /posts/history/:friendId
 * Lấy lịch sử posts giữa current user và một friend
 * Query params: page (default: 1), limit (default: 20), groupByMonth (default: false)
 * 
 * Response: {
 *   success: true,
 *   data: {
 *     posts: Post[],
 *     pagination: { page, limit, total, totalPages },
 *     grouped?: { "January 2024": Post[], ... } // Only if groupByMonth=true
 *   }
 * }
 */
router.get('/history/:friendId', requireAuth, postController.getHistory);

/**
 * GET /posts/:id
 * Lấy thông tin chi tiết một bài viết theo ID
 * Populate thông tin người đăng (Author) để hiển thị Avatar/Tên
 * 
 * Response: {
 *   success: true,
 *   data: {
 *     _id: string,
 *     author: { _id, username, displayName, avatarUrl },
 *     imageUrl: string,
 *     caption: string,
 *     location: { name, lat, lng },
 *     ...
 *   }
 * }
 */
router.get('/:id', postController.getById);

/**
 * PUT /posts/:id
 * Cập nhật bài viết (chỉ cho phép sửa caption hoặc location)
 * Không cho phép sửa ảnh (muốn đổi ảnh phải xóa đi đăng lại)
 * 
 * Body: {
 *   caption?: string,
 *   location?: { name?: string, lat?: number, lng?: number }
 * }
 * 
 * Yêu cầu: Người sửa phải là chủ bài viết (req.user.id === post.author.id)
 * 
 * Response: {
 *   success: true,
 *   data: Post (đã cập nhật)
 * }
 */
router.put('/:id', requireAuth, postController.update);

/**
 * DELETE /posts/:id
 * Xóa bài viết
 * 
 * Yêu cầu: Người xóa phải là chủ bài viết (req.user.id === post.author.id)
 * 
 * Lưu ý: Khi xóa bài trong DB, sẽ gọi API Cloudinary xóa luôn tấm ảnh đó trên đám mây
 * 
 * Response: {
 *   success: true,
 *   data: { postId: string },
 *   message: "Post deleted successfully"
 * }
 */
router.delete('/:id', requireAuth, postController.remove);

export default router;

