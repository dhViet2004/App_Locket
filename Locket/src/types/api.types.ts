export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Auth
export interface AuthUser {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface SendOtpRequest {
  identifier: string;
}

export interface SendOtpResponse {
  message: string;
  expiresIn: number;
  type: 'email' | 'phone';
}

export interface VerifyOtpRequest {
  identifier: string;
  code: string;
}

export interface VerifyOtpResponse extends AuthResponse {
  isNewUser: boolean;
}

export interface ResetPasswordRequest {
  identifier: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangeEmailRequest {
  password: string;
  newEmail: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CheckEmailResponse {
  available: boolean;
}

export interface CheckUsernameResponse {
  available: boolean;
}


