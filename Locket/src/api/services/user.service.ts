import { apiGet, apiPatchForm, apiPost } from '../client';
import type { AuthUser, ChangeEmailRequest, ChangePasswordRequest } from '../../types/api.types';

// Helper function để map _id thành id (dùng chung cho tất cả API trả về user)
export function mapUserResponse(userData: any): AuthUser {
  if (!userData) return userData;
  
  // Nếu đã có id thì giữ nguyên, nếu có _id thì map thành id
  if (userData._id && !userData.id) {
    const { _id, ...rest } = userData;
    return {
      ...rest,
      id: String(_id),
    } as AuthUser;
  }
  
  return userData as AuthUser;
}

export async function getUserProfileApi() {
  const response = await apiGet<any>('/users/me');
  
  // Map response data từ _id sang id
  if (response.success && response.data) {
    return {
      ...response,
      data: mapUserResponse(response.data),
    };
  }
  
  return response as any;
}

export async function updateAvatarApi(formData: FormData) {
  return apiPatchForm<AuthUser>('/users/avatar', formData);
}

export async function changeEmailApi(payload: ChangeEmailRequest) {
  return apiPost<AuthUser, ChangeEmailRequest>('/users/change-email', payload);
}

export async function changePasswordApi(payload: ChangePasswordRequest) {
  return apiPost<AuthUser, ChangePasswordRequest>('/users/change-password', payload);
}

