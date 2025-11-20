import { Router, Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { requireAuth } from '../middlewares/auth.middleware';
import * as userController from '../controllers/user.controller';

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
 * POST /api/users/profile
 * Cập nhật profile của user
 * Body: multipart/form-data
 *   - avatar: File (optional) - Avatar image
 *   - displayName: string (optional)
 *   - bio: string (optional, max 150 chars)
 * 
 * Middleware order:
 * 1. requireAuth - Kiểm tra authentication
 * 2. upload.single('avatar') - Nhận file từ multer (optional)
 * 3. userController.updateProfile - Cập nhật profile
 * 
 * Response: { success: true, message: "Profile updated successfully", data: User }
 */
router.post('/profile', requireAuth, upload.single('avatar'), userController.updateProfile);

export default router;

