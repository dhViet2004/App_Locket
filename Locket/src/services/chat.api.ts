import { apiClient } from '../api/client';
import type { ApiResponse } from '../types/api.types';

/**
 * Interface cho Message từ Backend
 */
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

/**
 * Response từ API lấy tin nhắn
 * GET /chat/conversations/:id/messages?page=1
 */
export interface MessagesApiResponse {
  data: Message[];
  message: string;
}

/**
 * Response từ API gửi tin nhắn
 * POST /chat/messages
 */
export interface SendMessageApiResponse {
  data: Message;
  message: string;
}

/**
 * Lấy danh sách tin nhắn của một conversation
 * @param conversationId - ID của conversation
 * @param page - Số trang (mặc định: 1)
 * @returns Promise<MessagesApiResponse>
 */
export async function fetchMessages(
  conversationId: string,
  page: number = 1,
): Promise<MessagesApiResponse> {
  try {
    const response = await apiClient.get<ApiResponse<{ data: Message[] }>>(
      `/chat/conversations/${conversationId}/messages`,
      {
        params: { page },
      },
    );

    // Xử lý response structure theo yêu cầu: { data: { data: Message[] }, message: string }
    if (response.data && response.data.data) {
      return {
        data: Array.isArray(response.data.data) ? response.data.data : [],
        message: response.data.message || 'Messages retrieved successfully',
      };
    }

    // Fallback nếu structure khác
    return {
      data: [],
      message: response.data.message || 'No messages found',
    };
  } catch (error: any) {
    console.error('[Chat API] Error fetching messages:', error);
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch messages',
    );
  }
}

/**
 * Gửi tin nhắn (text hoặc image)
 * @param conversationId - ID của conversation
 * @param content - Nội dung tin nhắn (text hoặc URL ảnh)
 * @param type - Loại tin nhắn: 'text' hoặc 'image'
 * @param imageFile - File ảnh (FormData) nếu type là 'image'
 * @returns Promise<SendMessageApiResponse>
 */
export async function sendMessage(
  conversationId: string,
  content: string,
  type: 'text' | 'image' = 'text',
  imageFile?: FormData,
): Promise<SendMessageApiResponse> {
  try {
    // Nếu type là 'image' và có imageFile (FormData)
    if (type === 'image' && imageFile) {
      const response = await apiClient.post<ApiResponse<Message>>(
        '/chat/messages',
        imageFile,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60s timeout cho upload ảnh
        },
      );

      return {
        data: response.data.data,
        message: response.data.message || 'Message sent successfully',
      };
    }

    // Nếu type là 'text' hoặc không có imageFile
    const response = await apiClient.post<ApiResponse<Message>>('/chat/messages', {
      conversationId,
      content,
      type,
    });

    return {
      data: response.data.data,
      message: response.data.message || 'Message sent successfully',
    };
  } catch (error: any) {
    console.error('[Chat API] Error sending message:', error);
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to send message',
    );
  }
}

/**
 * Helper function để tạo FormData cho việc gửi ảnh
 * @param conversationId - ID của conversation
 * @param imageUri - URI của ảnh (local hoặc remote)
 * @param content - Nội dung text kèm theo (optional)
 * @returns FormData
 */
export function createImageFormData(
  conversationId: string,
  imageUri: string,
  content?: string,
): FormData {
  const formData = new FormData();

  // Thêm conversationId
  formData.append('conversationId', conversationId);

  // Thêm content nếu có
  if (content) {
    formData.append('content', content);
  }

  // Tạo file object từ URI
  const filename = imageUri.split('/').pop() || 'image.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  // Thêm file ảnh
  formData.append('image', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  return formData;
}

/**
 * Gửi tin nhắn ảnh (wrapper function tiện lợi)
 * @param conversationId - ID của conversation
 * @param imageUri - URI của ảnh
 * @param content - Nội dung text kèm theo (optional)
 * @returns Promise<SendMessageApiResponse>
 */
export async function sendImageMessage(
  conversationId: string,
  imageUri: string,
  content?: string,
): Promise<SendMessageApiResponse> {
  const formData = createImageFormData(conversationId, imageUri, content);
  return sendMessage(conversationId, content || '', 'image', formData);
}

