import { apiGet, apiPatchForm } from '../client';
import type { AuthUser } from '../../types/api.types';

export async function getUserProfileApi() {
  return apiGet<AuthUser>('/users/me');
}

export async function updateAvatarApi(formData: FormData) {
  return apiPatchForm<AuthUser>('/users/avatar', formData);
}

