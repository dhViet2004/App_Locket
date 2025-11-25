import type { Message } from '../../../src/api/services/chat.service';
import type { AuthUser } from '../../../src/types/api.types';

/**
 * Format thời gian hiển thị cho message
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins}m`;

  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Kiểm tra xem message có phải của user hiện tại không
 */
export function isMyMessage(
  message: Message | null | undefined,
  user: AuthUser | null | undefined,
): boolean {
  if (!message || !message.senderId || !user?.id) {
    return false;
  }

  // Kiểm tra senderId là Object hay String
  let senderIdValue: string;
  
  if (typeof message.senderId === 'string') {
    senderIdValue = message.senderId;
  } else if (message.senderId && typeof message.senderId === 'object' && '_id' in message.senderId) {
    senderIdValue = String(message.senderId._id || '');
  } else {
    return false;
  }

  const currentUserId = String(user.id || '');
  return senderIdValue === currentUserId;
}

/**
 * Lấy initials từ tên (để hiển thị trong avatar placeholder)
 */
export function getInitials(name: string): string {
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

