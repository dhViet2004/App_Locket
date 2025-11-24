import { apiGet, apiPatchForm, apiPost } from '../client';
import type { AuthUser, ChangeEmailRequest } from '../../types/api.types';

export async function getUserProfileApi() {
  return apiGet<AuthUser>('/users/me');
}

export async function updateAvatarApi(formData: FormData) {
  return apiPatchForm<AuthUser>('/users/avatar', formData);
}

export async function changeEmailApi(payload: ChangeEmailRequest) {
  return apiPost<AuthUser, ChangeEmailRequest>('/users/change-email', payload);
}

