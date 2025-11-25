import { apiGet, apiPost, apiPostForm } from '../client';
import type { ApiResponse } from '../../types/api.types';

export interface Message {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  content: string;
  type: 'text' | 'image';
  createdAt: string;
  updatedAt: string;
}

export interface MessagesResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type?: 'text' | 'image';
}

export interface SendMessageResponse {
  message: Message;
}

export interface Conversation {
  _id: string;
  participants: {
    _id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  }[];
  lastMessage?: {
    _id: string;
    content: string;
    type: 'text' | 'image';
    senderId: {
      _id: string;
      username: string;
      displayName?: string;
      avatarUrl?: string;
    };
    createdAt: string;
  } | null;
  lastMessageAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateConversationRequest {
  otherUserId: string;
}

// Backend trả về conversation trực tiếp trong data, không phải { conversation: ... }
export type CreateConversationResponse = Conversation;

/**
 * Lấy danh sách conversations của user hiện tại
 * GET /chat/conversations?page=1&limit=20
 */
export async function getConversationsApi(
  page: number = 1,
  limit: number = 20,
): Promise<ApiResponse<ConversationsResponse>> {
  return apiGet<ConversationsResponse>('/chat/conversations', { page, limit });
}

/**
 * Tạo hoặc lấy conversation giữa hai user
 * POST /chat/conversations
 * Body: { otherUserId: string }
 */
export async function createOrGetConversationApi(
  otherUserId: string,
): Promise<ApiResponse<CreateConversationResponse>> {
  return apiPost<CreateConversationResponse, CreateConversationRequest>(
    '/chat/conversations',
    { otherUserId },
  );
}

/**
 * Lấy danh sách messages của một conversation
 * GET /chat/conversations/:conversationId/messages?page=1&limit=50
 */
export async function getMessagesApi(
  conversationId: string,
  page: number = 1,
  limit: number = 50,
): Promise<ApiResponse<MessagesResponse>> {
  return apiGet<MessagesResponse>(
    `/chat/conversations/${conversationId}/messages`,
    { page, limit },
  );
}

/**
 * Gửi message
 * POST /chat/messages
 * Body: { conversationId: string, content: string, type?: 'text' | 'image' }
 */
export async function sendMessageApi(
  body: SendMessageRequest,
): Promise<ApiResponse<SendMessageResponse>> {
  return apiPost<SendMessageResponse, SendMessageRequest>('/chat/messages', body);
}

/**
 * Gửi message với ảnh
 * POST /chat/messages
 * Body: FormData với conversationId, content (optional), và file (image)
 */
export async function sendImageMessageApi(
  conversationId: string,
  imageUri: string,
  content?: string,
): Promise<ApiResponse<SendMessageResponse>> {
  const formData = new FormData();
  formData.append('conversationId', conversationId);
  if (content) {
    formData.append('content', content);
  }
  
  // Tạo file object từ URI
  const filename = imageUri.split('/').pop() || 'image.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  
  formData.append('image', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  return apiPostForm<SendMessageResponse>('/chat/messages', formData, {
    timeout: 60000, // 60s timeout cho upload ảnh
  });
}

