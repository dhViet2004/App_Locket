import { apiPostForm } from '../client';
import type {
  CaptionSuggestionResponse,
  Post,
  PostVisibility,
} from '../../types/api.types';

export interface UploadImageFile {
  uri: string;
  name: string;
  type: string;
}

export interface CreatePostFormOptions {
  caption?: string;
  visibility?: PostVisibility;
  locationName?: string;
  lat?: number;
  lng?: number;
}

export function buildCreatePostFormData(
  image: UploadImageFile,
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

function buildSuggestCaptionFormData(image: UploadImageFile) {
  const formData = new FormData();
  formData.append('image', image as any);
  return formData;
}

export async function suggestCaptionApi(image: UploadImageFile) {
  const formData = buildSuggestCaptionFormData(image);
  return apiPostForm<CaptionSuggestionResponse>(
    '/posts/suggest-caption',
    formData,
    { timeout: 60000 },
  );
}


