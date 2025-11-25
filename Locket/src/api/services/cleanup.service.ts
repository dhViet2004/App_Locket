import { apiPostForm } from '../client';

export interface CleanupResponse {
    result: string; // Base64 data URI
}

export async function cleanupImageApi(formData: FormData) {
    return apiPostForm<CleanupResponse>('/cleanup', formData);
}
