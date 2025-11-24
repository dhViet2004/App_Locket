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

export type PostVisibility = 'friends' | 'private';

export interface Post {
  _id: string;
  author: string | AuthUser;
  imageUrl: string;
  caption?: string;
  visibility: PostVisibility;
  reactionCount: number;
  commentCount: number;
  reactionCounts: Record<string, number>;
  viewers: string[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CaptionSuggestionResponse {
  caption: string;
}

export interface FriendSummary extends AuthUser {
  friendshipId: string;
  acceptedAt: string;
}

export interface FriendsListResponse {
  friends: FriendSummary[];
  count: number;
}


