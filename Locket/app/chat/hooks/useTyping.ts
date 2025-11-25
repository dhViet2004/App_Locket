import { useState, useEffect, useRef, useCallback } from 'react';
import socketService from '../../../src/services/socket';

interface UseTypingProps {
  conversationId: string;
  userId: string | undefined;
}

export function useTyping({ conversationId, userId }: UseTypingProps) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingEmitRef = useRef<number>(0);
  const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen to typing events from socket
  useEffect(() => {
    if (!conversationId || !userId) return;

    const handleTyping = (data: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      // Backend có thể trả về conversationId dạng "conversation:ID" hoặc chỉ "ID"
      const normalizedRoomId = data.conversationId.includes(':') 
        ? data.conversationId.split(':')[1] 
        : data.conversationId;
      const currentRoomId = conversationId;

      // So sánh userId dạng string
      const dataUserId = String(data.userId || '');
      const currentUserId = String(userId || '');

      // Chỉ xử lý nếu là conversation hiện tại và không phải chính mình
      if (normalizedRoomId === currentRoomId && dataUserId !== currentUserId) {
        setIsTyping(data.isTyping);
        setTypingUserId(data.isTyping ? dataUserId : null);

        // Tự động ẩn typing indicator sau 3 giây nếu không có update
        if (data.isTyping) {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTypingUserId(null);
          }, 3000);
        } else {
          // Nếu nhận stop_typing, ẩn ngay
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
          }
        }
      }
    };

    socketService.on('user_typing', handleTyping);

    return () => {
      socketService.off('user_typing');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [conversationId, userId]);

  // Handle typing change with debounce
  const handleTypingChange = useCallback(
    (text: string) => {
      if (!conversationId) return;

      const now = Date.now();
      const timeSinceLastEmit = now - lastTypingEmitRef.current;

      // Clear timeout stop typing trước đó
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
        stopTypingTimeoutRef.current = null;
      }

      if (text.length > 0) {
        // Emit typing_start nếu đã quá 2 giây kể từ lần cuối
        if (timeSinceLastEmit > 2000) {
          socketService.sendTyping(conversationId);
          lastTypingEmitRef.current = now;
        }

        // Emit typing_stop sau 1 giây nếu user dừng gõ
        stopTypingTimeoutRef.current = setTimeout(() => {
          socketService.sendStopTyping(conversationId);
          stopTypingTimeoutRef.current = null;
        }, 1000);
      } else {
        // Nếu xóa hết text, gửi stop_typing ngay
        socketService.sendStopTyping(conversationId);
        lastTypingEmitRef.current = 0; // Reset để lần gõ tiếp theo sẽ emit ngay
      }
    },
    [conversationId],
  );

  // Cleanup timeouts khi unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
      }
    };
  }, []);

  return {
    isTyping,
    typingUserId,
    handleTypingChange,
  };
}

