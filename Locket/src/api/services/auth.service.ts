import { apiGet, apiPost } from '../client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  CheckEmailResponse,
  CheckUsernameResponse,
} from '../../types/api.types';

export async function registerApi(body: RegisterRequest) {
  return apiPost<AuthResponse, RegisterRequest>('/auth/register', body);
}

export async function loginApi(body: LoginRequest) {
  return apiPost<AuthResponse, LoginRequest>('/auth/login', body);
}

export async function sendOtpApi(body: SendOtpRequest) {
  return apiPost<SendOtpResponse, SendOtpRequest>('/auth/send-otp', body);
}

export async function verifyOtpApi(body: VerifyOtpRequest) {
  return apiPost<VerifyOtpResponse, VerifyOtpRequest>('/auth/verify-otp', body);
}

export async function resetPasswordApi(body: ResetPasswordRequest) {
  return apiPost<ResetPasswordResponse, ResetPasswordRequest>('/auth/reset-password', body);
}

export async function checkEmailApi(email: string) {
  return apiGet<CheckEmailResponse>(`/auth/check-email/${encodeURIComponent(email)}`);
}

export async function checkUsernameApi(username: string) {
  return apiGet<CheckUsernameResponse>(`/auth/check-username/${encodeURIComponent(username)}`);
}


