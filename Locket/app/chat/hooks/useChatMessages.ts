import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getMessagesApi,
  sendMessageApi,
  sendImageMessageApi,
  type Message,
} from '../../../src/api/services/chat.service';
import socketService from '../../../src/services/socket';

interface UseChatMessagesProps {
  conversationId: string;
  token: string | null;
  userId: string | undefined;
}

export function useChatMessages({ conversationId, token, userId }: UseChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const flatListRef = useRef<any>(null);

  // Load initial messages
  useEffect(() => {
    if (!conversationId || !token) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await getMessagesApi(conversationId, 1, 50);

        if (response.success && response.data) {
          const messagesArray = response.data.messages || [];
          const validMessages = messagesArray.filter((msg) => msg && msg._id);
          
          // Reverse để có [mới nhất, ..., cũ nhất] cho inverted FlatList
          const reversedMessages = [...validMessages].reverse();
          setMessages(reversedMessages);

          const pagination = response.data.pagination || {};
          const hasMoreValue = pagination.page < pagination.totalPages;
          setHasMore(hasMoreValue);
          setPage(1);

          // Scroll to bottom sau khi load
          setTimeout(() => {
            if (reversedMessages.length > 0 && flatListRef.current) {
              try {
                flatListRef.current.scrollToIndex({ index: 0, animated: false });
              } catch (error) {
                flatListRef.current.scrollToOffset({ offset: 0, animated: false });
              }
            }
          }, 100);
        }
      } catch (error) {
        console.error('[Chat] Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversationId, token]);

  // Socket connection and listeners
  useEffect(() => {
    if (!conversationId || !token) return;

    if (!socketService.isConnected()) {
      socketService.connect(token);
    }

    socketService.joinConversation(conversationId);

    const handleNewMessage = (data: { message: Message }) => {

      setMessages((prev) => {
        if (!data.message || !data.message._id) {
          console.warn('[Chat] Invalid message from socket:', data.message);
          return prev;
        }

        const messageId = data.message._id;

        // Kiểm tra duplicate: theo _id hoặc temp ID
        const exists = prev.some((msg) => {
          if (!msg || !msg._id) return false;
          // Nếu là temp message, kiểm tra theo conversationId và content
          if (msg._id.startsWith('temp-')) {
            return (
              msg.conversationId === data.message.conversationId &&
              msg.content === data.message.content &&
              msg.senderId?._id === data.message.senderId?._id
            );
          }
          // Nếu là message thật, kiểm tra theo _id
          return msg._id === messageId;
        });

        if (exists) {
          return prev;
        }

        // Loại bỏ temp message nếu có (khi socket message đến sau API response)
        const cleanPrev = prev.filter((msg) => {
          if (!msg || !msg._id) return false;
          // Nếu là temp message và có cùng content/conversationId, loại bỏ
          if (msg._id.startsWith('temp-')) {
            return !(
              msg.conversationId === data.message.conversationId &&
              msg.content === data.message.content &&
              msg.senderId?._id === data.message.senderId?._id
            );
          }
          return true;
        });

        // Thêm message mới vào ĐẦU mảng (cho inverted FlatList)
        return [data.message, ...cleanPrev];
      });

      // Scroll to bottom (index 0 cho inverted FlatList)
      setTimeout(() => {
        if (flatListRef.current) {
          try {
            flatListRef.current.scrollToIndex({ index: 0, animated: true });
          } catch (error) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
          }
        }
      }, 100);
    };

    socketService.on('new_message', handleNewMessage);

    return () => {
      socketService.off('new_message');
      socketService.leaveConversation(conversationId);
    };
  }, [conversationId, token]);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || loadingMore || !conversationId) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await getMessagesApi(conversationId, nextPage, 50);

      if (response.success && response.data && response.data.messages.length > 0) {
        const messagesArray = response.data.messages || [];
        const validMessages = messagesArray.filter((msg) => msg && msg._id);
        const reversedNewMessages = [...validMessages].reverse();

        setMessages((prev) => {
          const cleanPrev = prev.filter((msg) => msg && msg._id);
          const cleanNew = reversedNewMessages.filter((msg) => msg && msg._id);
          return [...cleanPrev, ...cleanNew];
        });

        const pagination = response.data.pagination || {};
        const hasMoreValue = pagination.page < pagination.totalPages;
        setHasMore(hasMoreValue);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('[Chat] Error loading more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, page, conversationId]);

  // Send text message với Optimistic UI
  const sendMessage = useCallback(
    async (content: string, user: any) => {
      if (!content.trim() || sending || !conversationId) return;

      socketService.sendStopTyping(conversationId);
      setSending(true);

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const trimmedContent = content.trim();

      // B1: Tạo temp message và hiển thị ngay (Optimistic UI)
      const tempMessage: Message = {
        _id: tempId,
        conversationId,
        senderId: {
          _id: user?.id || '',
          username: user?.username || '',
          displayName: user?.displayName,
          avatarUrl: user?.avatarUrl,
        },
        content: trimmedContent,
        type: 'text',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setMessages((prev) => {
        const cleanPrev = prev.filter((msg) => msg && msg._id);
        return [tempMessage, ...cleanPrev];
      });

      // Scroll to bottom ngay
      setTimeout(() => {
        if (flatListRef.current) {
          try {
            flatListRef.current.scrollToIndex({ index: 0, animated: true });
          } catch (error) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
          }
        }
      }, 100);

      try {
        // B2: Gọi API
        const response = await sendMessageApi({
          conversationId,
          content: trimmedContent,
          type: 'text',
        });

        // B3: Xử lý response
        // Backend có thể trả về: data: Message hoặc data: { message: Message }
        let realMessage: Message | null = null;
        
        if (response.success && response.data) {
          // Trường hợp 1: data là Message trực tiếp (backend trả về ok(message, ...))
          if ((response.data as any)._id && (response.data as any).conversationId) {
            realMessage = response.data as unknown as Message;
          }
          // Trường hợp 2: data có field message (theo interface SendMessageResponse)
          else if ((response.data as any).message) {
            realMessage = (response.data as any).message as Message;
          }
        }
        
        if (!realMessage || !realMessage._id) {
          console.error('[Chat] Invalid message from API:', {
            success: response.success,
            hasData: !!response.data,
            data: response.data,
            message: response.message,
          });
          setMessages((prev) =>
            prev.filter((msg) => msg && msg._id && msg._id !== tempId),
          );
          throw new Error(response.message || 'Invalid message response from server');
        }

        setMessages((prev) => {
          // Kiểm tra xem socket đã nhận message chưa
          const socketMessageExists = prev.some(
            (msg) => msg && msg._id && msg._id === realMessage!._id && !msg._id.startsWith('temp-'),
          );

          if (socketMessageExists) {
            // Socket đã nhận message, chỉ cần xóa temp message
            return prev.filter((msg) => msg && msg._id && msg._id !== tempId);
          } else {
            // Socket chưa nhận, thay thế temp bằng real message
            const filtered = prev.filter((msg) => msg && msg._id && msg._id !== tempId);
            return [realMessage!, ...filtered];
          }
        });
      } catch (error: any) {
        // B4: Xử lý lỗi
        console.error('[Chat] Error sending message:', error);
        setMessages((prev) =>
          prev.filter((msg) => msg && msg._id && msg._id !== tempId),
        );
        // Có thể thêm Alert ở đây nếu cần
        throw error; // Re-throw để component có thể xử lý
      } finally {
        setSending(false);
      }
    },
    [conversationId, sending],
  );

  // Send image message với Optimistic UI
  const sendImage = useCallback(
    async (imageUri: string, user: any) => {
      if (sending || !conversationId) return;

      setSending(true);

      const tempId = `temp-image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // B1: Tạo temp message và hiển thị ngay (Optimistic UI)
      const tempMessage: Message = {
        _id: tempId,
        conversationId,
        senderId: {
          _id: user?.id || '',
          username: user?.username || '',
          displayName: user?.displayName,
          avatarUrl: user?.avatarUrl,
        },
        content: imageUri, // Local URI tạm thời
        type: 'image',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setMessages((prev) => {
        const cleanPrev = prev.filter((msg) => msg && msg._id);
        return [tempMessage, ...cleanPrev];
      });

      // Scroll to bottom ngay
      setTimeout(() => {
        if (flatListRef.current) {
          try {
            flatListRef.current.scrollToIndex({ index: 0, animated: true });
          } catch (error) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
          }
        }
      }, 100);

      try {
        // B2: Gọi API
        const response = await sendImageMessageApi(conversationId, imageUri);

        // B3: Xử lý response
        // Backend có thể trả về: data: Message hoặc data: { message: Message }
        let realMessage: Message | null = null;
        
        if (response.success && response.data) {
          // Trường hợp 1: data là Message trực tiếp (backend trả về ok(message, ...))
          if ((response.data as any)._id && (response.data as any).conversationId) {
            realMessage = response.data as unknown as Message;
          }
          // Trường hợp 2: data có field message (theo interface SendMessageResponse)
          else if ((response.data as any).message) {
            realMessage = (response.data as any).message as Message;
          }
        }
        
        if (!realMessage || !realMessage._id) {
          console.error('[Chat] Invalid image message from API:', {
            success: response.success,
            hasData: !!response.data,
            data: response.data,
            message: response.message,
          });
          setMessages((prev) =>
            prev.filter((msg) => msg && msg._id && msg._id !== tempId),
          );
          throw new Error(response.message || 'Invalid image message response from server');
        }

        setMessages((prev) => {
          // Kiểm tra xem socket đã nhận message chưa
          const socketMessageExists = prev.some(
            (msg) => msg && msg._id && msg._id === realMessage!._id && !msg._id.startsWith('temp-'),
          );

          if (socketMessageExists) {
            // Socket đã nhận message, chỉ cần xóa temp message
            return prev.filter((msg) => msg && msg._id && msg._id !== tempId);
          } else {
            // Socket chưa nhận, thay thế temp bằng real message
            const filtered = prev.filter((msg) => msg && msg._id && msg._id !== tempId);
            return [realMessage!, ...filtered];
          }
        });
      } catch (error: any) {
        // B4: Xử lý lỗi
        console.error('[Chat] Error sending image:', error);
        setMessages((prev) =>
          prev.filter((msg) => msg && msg._id && msg._id !== tempId),
        );
        throw error; // Re-throw để component có thể xử lý
      } finally {
        setSending(false);
      }
    },
    [conversationId, sending],
  );

  return {
    messages,
    loading,
    loadingMore,
    sending,
    hasMore,
    flatListRef,
    loadMoreMessages,
    sendMessage,
    sendImage,
  };
}

