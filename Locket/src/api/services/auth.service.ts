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
import { mapUserResponse } from './user.service';

export async function registerApi(body: RegisterRequest) {
  const response = await apiPost<AuthResponse, RegisterRequest>('/auth/register', body);
  
  // Map user._id thành user.id
  if (response.success && response.data?.user) {
    return {
      ...response,
      data: {
        ...response.data,
        user: mapUserResponse(response.data.user),
      },
    };
  }
  
  return response;
}

export async function loginApi(body: LoginRequest) {
  const response = await apiPost<AuthResponse, LoginRequest>('/auth/login', body);
  
  // Map user._id thành user.id
  if (response.success && response.data?.user) {
    return {
      ...response,
      data: {
        ...response.data,
        user: mapUserResponse(response.data.user),
      },
    };
  }
  
  return response;
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


