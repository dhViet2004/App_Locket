import { Response } from 'express';
import { User } from '../models/user.model';
import { buildCrud } from '../utils/crudFactory';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError, ok } from '../utils/apiResponse';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';

// Định nghĩa type cho Multer file
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// Extend AuthRequest để có file type
interface ProfileRequest extends Omit<AuthRequest, 'file'> {
  file?: MulterFile;
  body: {
    displayName?: string;
    bio?: string;
  };
}

/**
 * Cập nhật profile của user
 * POST /api/users/profile
 * Body: multipart/form-data
 *   - avatar: File (optional) - Avatar image
 *   - displayName: string (optional)
 *   - bio: string (optional, max 150 chars)
 */
export const updateProfile = asyncHandler(async (req: ProfileRequest, res: Response) => {
  if (!req.user || !req.userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const userId = req.userId;
  const { displayName, bio } = req.body;
  const avatarFile = req.file;

  // Validate bio length
  if (bio && bio.length > 150) {
    throw new ApiError(400, 'Bio must be 150 characters or less');
  }

  // Tìm user hiện tại
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Cập nhật các trường text
  if (displayName !== undefined) {
    user.displayName = displayName.trim() || undefined;
  }
  if (bio !== undefined) {
    user.bio = bio.trim() || undefined;
  }

  // Xử lý avatar upload nếu có
  if (avatarFile) {
    try {
      // Xóa avatar cũ nếu có
      if (user.avatarPublicId) {
        try {
          await deleteFromCloudinary(user.avatarPublicId);
        } catch (error) {
          console.error('[User] Error deleting old avatar:', error);
          // Không throw error, tiếp tục upload avatar mới
        }
      }

      // Upload avatar mới lên Cloudinary
      const uploadResult = await uploadToCloudinary(
        avatarFile.buffer,
        'locket/avatars',
        {
          width: 400,
          height: 400,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto',
        }
      );

      user.avatarUrl = uploadResult.secure_url;
      user.avatarPublicId = uploadResult.public_id;
    } catch (error) {
      console.error('[User] Error uploading avatar:', error);
      throw new ApiError(500, 'Failed to upload avatar');
    }
  }

  // Lưu user đã cập nhật
  await user.save();

  // Trả về user đã cập nhật (loại bỏ passwordHash)
  const userObj = user.toObject();
  delete (userObj as any).passwordHash;

  return res.status(200).json(ok(userObj, 'Profile updated successfully'));
});

export const { list, getById, create, updateById, removeById } = buildCrud(User);
