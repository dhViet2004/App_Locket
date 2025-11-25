export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Auth
export interface AuthUser {
  _id: string;
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

// Pending Friend Requests
export interface PendingRequest {
  _id: string;
  requestedBy: {
    _id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export interface PendingRequestsResponse {
  requests: PendingRequest[];
  count: number;
}

// Feed
export interface FeedPostAuthor {
  _id: string;
  id?: string;
  username: string;
  avatarUrl?: string;
  displayName?: string;
}

export interface FeedPost {
  _id: string;
  author: FeedPostAuthor;
  imageUrl: string;
  caption?: string;
  visibility: PostVisibility;
  reactionCount: number;
  commentCount: number;
  reactionCounts: Record<string, number>;
  viewers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedItem {
  type: 'post' | 'ad';
  data: FeedPost;
}

export interface FeedPagination {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface FeedResponse {
  data: FeedItem[];
  pagination: FeedPagination;
}


