import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import type { ApiResponse } from '../types/api.types';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Attach auth token if available (you can replace this later with secure storage)
apiClient.interceptors.request.use((config) => {
  // TODO: inject real token from secure storage / context
  return config;
});

export async function apiGet<T>(url: string, params?: Record<string, any>) {
  const res = await apiClient.get<ApiResponse<T>>(url, { params });
  return res.data;
}

export async function apiPost<T, B = unknown>(url: string, body?: B) {
  const res = await apiClient.post<ApiResponse<T>>(url, body);
  return res.data;
}

export async function apiPostForm<T>(
  url: string,
  form: FormData,
  config?: { timeout?: number },
) {
  const res = await apiClient.post<ApiResponse<T>>(url, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: config?.timeout ?? 60000,
  });
  return res.data;
}

export async function apiPatch<T, B = unknown>(url: string, body?: B) {
  const res = await apiClient.patch<ApiResponse<T>>(url, body);
  return res.data;
}

export async function apiPatchForm<T>(url: string, form: FormData) {
  const res = await apiClient.patch<ApiResponse<T>>(url, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}


