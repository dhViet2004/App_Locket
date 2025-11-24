import { apiPostForm } from '../client';
import type { Post, PostVisibility } from '../../types/api.types';

export interface CreatePostFormOptions {
  caption?: string;
  visibility?: PostVisibility;
  locationName?: string;
  lat?: number;
  lng?: number;
}

export function buildCreatePostFormData(
  image: { uri: string; name: string; type: string },
  options: CreatePostFormOptions = {},
) {
  const formData = new FormData();
  formData.append('image', image as any);

  if (options.caption) {
    formData.append('caption', options.caption);
  }

  if (options.visibility) {
    formData.append('visibility', options.visibility);
  }

  if (options.locationName) {
    formData.append('locationName', options.locationName);
  }

  if (typeof options.lat === 'number') {
    formData.append('lat', String(options.lat));
  }

  if (typeof options.lng === 'number') {
    formData.append('lng', String(options.lng));
  }

  return formData;
}

export async function createPostApi(formData: FormData) {
  return apiPostForm<Post>('/posts', formData);
}


