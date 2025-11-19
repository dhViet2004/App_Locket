import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { postService } from '../services/post.service';
import { groqService } from '../services/groq.service';
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

/**
 * Gợi ý caption cho ảnh sử dụng Groq AI
 * POST /posts/suggest-caption
 * Body: multipart/form-data với file (image) HOẶC JSON với base64Image
 */
export const suggestCaption = asyncHandler(async (req: PostRequest, res: Response) => {
  // Kiểm tra authentication
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'Unauthorized');
  }

  // Kiểm tra Groq service có sẵn sàng không
  if (!groqService.isAvailable()) {
    throw new ApiError(503, 'Caption suggestion service is not available. Please configure GROQ_API_KEY.');
  }

  let imageBuffer: Buffer;

  // Cách 1: Nhận file từ multipart/form-data (multer)
  if (req.file && req.file.buffer) {
    imageBuffer = req.file.buffer;
  }
  // Cách 2: Nhận base64 từ JSON body
  else if (req.body.base64Image) {
    try {
      // Parse base64 string (có thể có prefix data:image/...;base64,)
      const base64String = req.body.base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
      imageBuffer = Buffer.from(base64String, 'base64');
    } catch (error) {
      throw new ApiError(400, 'Invalid base64 image format');
    }
  } else {
    throw new ApiError(400, 'Image is required. Send as multipart/form-data file or JSON with base64Image field.');
  }

  // Kiểm tra image buffer hợp lệ
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new ApiError(400, 'Invalid image data');
  }

  try {
    // Gọi Groq service để generate caption
    const caption = await groqService.suggestCaption(imageBuffer);

    // Trả về caption
    return res.status(200).json(ok({ caption }, 'Caption suggested successfully'));
  } catch (error) {
    console.error('[Post Controller] Error suggesting caption:', error);
    throw new ApiError(
      500,
      error instanceof Error ? error.message : 'Failed to generate caption suggestion'
    );
  }
});
