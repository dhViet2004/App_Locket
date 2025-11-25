import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import type { Message } from '../../../src/api/services/chat.service';
import { formatTime, isMyMessage, getInitials } from '../utils/chat.utils';
import { useAuth } from '../../../src/context/AuthContext';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { user } = useAuth();
  const isMine = isMyMessage(message, user);

  if (!message || !message._id) {
    return null;
  }

  const senderName = message.senderId?.displayName || message.senderId?.username || 'User';
  const avatarUrl = message.senderId?.avatarUrl;

  return (
    <View
      style={[
        styles.messageContainer,
        isMine ? styles.myMessageContainer : styles.otherMessageContainer,
      ]}
    >
      {/* Avatar chỉ hiển thị cho tin nhắn của người khác */}
      {!isMine && (
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{getInitials(senderName)}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.messageContent}>
        {/* Tên người gửi chỉ hiển thị cho tin nhắn của người khác */}
        {!isMine && (
          <Text style={styles.senderName}>{senderName}</Text>
        )}

        <View
          style={[
            styles.messageBubble,
            isMine ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          {message.type === 'image' ? (
            <Image source={{ uri: message.content }} style={styles.messageImage} />
          ) : (
            <Text style={[styles.messageText, isMine && styles.myMessageText]}>
              {message.content}
            </Text>
          )}
          <Text style={[styles.messageTime, isMine && styles.myMessageTime]}>
            {formatTime(message.createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 4,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333333',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageContent: {
    flex: 1,
    maxWidth: '75%',
  },
  senderName: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
    marginLeft: 4,
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#333333',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

