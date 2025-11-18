import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { postService } from '../services/post.service';
import { ok, ApiError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadToCloudinary } from '../utils/cloudinary';

// Định nghĩa type cho Multer file
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  location?: string; // URL sau khi upload lên Cloudinary/S3
  path?: string;
  filename?: string;
}

// Extend AuthRequest để có file type
interface PostRequest extends Omit<AuthRequest, 'file'> {
  file?: MulterFile;
}

/**
 * Tạo bài viết mới (Upload Moment)
 * POST /posts
 * Body: multipart/form-data với file (image) và caption (optional)
 */
export const create = asyncHandler(async (req: PostRequest, res: Response) => {
  // Kiểm tra authentication
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'Unauthorized');
  }

  // Lấy userId từ req.user._id
  const userId = req.user._id.toString();

  // Lấy file từ multer (sẽ được thêm vào req.file)
  const file = req.file;
  if (!file) {
    throw new ApiError(400, 'Image file is required');
  }

  // Upload file lên Cloudinary
  let imageUrl: string;
  try {
    if (!file.buffer) {
      throw new ApiError(400, 'File buffer is required');
    }

    const uploadResult = await uploadToCloudinary(file.buffer, 'locket/posts', {
      quality: 'auto',
      fetch_format: 'auto',
    } as any);
    
    // Lấy URL từ Cloudinary (hoặc từ req.file.location nếu đã có)
    imageUrl = uploadResult.secure_url || file.location || '';
    
    if (!imageUrl) {
      throw new ApiError(500, 'Failed to get image URL');
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new ApiError(500, 'Failed to upload image to cloud storage');
  }

  // Lấy caption từ body
  const { caption } = req.body;

  // Gọi PostService.createPost với URL này
  const post = await postService.createPost(userId, imageUrl, caption);

  // Trả về Response 201 kèm theo thông tin bài post vừa tạo
  return res.status(201).json(ok(post, 'Post created successfully'));
});
