import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Participant {
  _id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

interface LastMessage {
  _id: string;
  content: string;
  type: 'text' | 'image';
  senderId: Participant;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: LastMessage | null;
  lastMessageAt?: string | null;
}

export default function MessagesScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Dữ liệu mẫu
  const getMockConversations = (): Conversation[] => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return [
      {
        _id: '1',
        participants: [
          {
            _id: 'user1',
            username: 'alice',
            displayName: 'Alice Nguyen',
            avatarUrl: undefined,
          },
          {
            _id: 'current',
            username: 'me',
            displayName: 'Tôi',
          },
        ],
        lastMessage: {
          _id: 'msg1',
          content: 'Xin chào! Bạn có khỏe không?',
          type: 'text',
          senderId: {
            _id: 'user1',
            username: 'alice',
            displayName: 'Alice Nguyen',
          },
          createdAt: oneHourAgo.toISOString(),
        },
        lastMessageAt: oneHourAgo.toISOString(),
      },
      {
        _id: '2',
        participants: [
          {
            _id: 'user2',
            username: 'bob',
            displayName: 'Bob Tran',
            avatarUrl: undefined,
          },
          {
            _id: 'current',
            username: 'me',
            displayName: 'Tôi',
          },
        ],
        lastMessage: {
          _id: 'msg2',
          content: '📷 Ảnh',
          type: 'image',
          senderId: {
            _id: 'user2',
            username: 'bob',
            displayName: 'Bob Tran',
          },
          createdAt: threeHoursAgo.toISOString(),
        },
        lastMessageAt: threeHoursAgo.toISOString(),
      },
      {
        _id: '3',
        participants: [
          {
            _id: 'user3',
            username: 'charlie',
            displayName: 'Charlie Le',
            avatarUrl: undefined,
          },
          {
            _id: 'current',
            username: 'me',
            displayName: 'Tôi',
          },
        ],
        lastMessage: {
          _id: 'msg3',
          content: 'Cảm ơn bạn đã giúp đỡ!',
          type: 'text',
          senderId: {
            _id: 'current',
            username: 'me',
            displayName: 'Tôi',
          },
          createdAt: oneDayAgo.toISOString(),
        },
        lastMessageAt: oneDayAgo.toISOString(),
      },
      {
        _id: '4',
        participants: [
          {
            _id: 'user4',
            username: 'diana',
            displayName: 'Diana Pham',
            avatarUrl: undefined,
          },
          {
            _id: 'current',
            username: 'me',
            displayName: 'Tôi',
          },
        ],
        lastMessage: {
          _id: 'msg4',
          content: 'Hẹn gặp lại vào tuần sau nhé!',
          type: 'text',
          senderId: {
            _id: 'user4',
            username: 'diana',
            displayName: 'Diana Pham',
          },
          createdAt: twoDaysAgo.toISOString(),
        },
        lastMessageAt: twoDaysAgo.toISOString(),
      },
      {
        _id: '5',
        participants: [
          {
            _id: 'user5',
            username: 'emma',
            displayName: 'Emma Vo',
            avatarUrl: undefined,
          },
          {
            _id: 'current',
            username: 'me',
            displayName: 'Tôi',
          },
        ],
        lastMessage: null,
        lastMessageAt: null,
      },
      {
        _id: '6',
        participants: [
          {
            _id: 'user6',
            username: 'frank',
            displayName: 'Frank Hoang',
            avatarUrl: undefined,
          },
          {
            _id: 'current',
            username: 'me',
            displayName: 'Tôi',
          },
        ],
        lastMessage: {
          _id: 'msg6',
          content: 'Bạn có muốn đi xem phim không?',
          type: 'text',
          senderId: {
            _id: 'user6',
            username: 'frank',
            displayName: 'Frank Hoang',
          },
          createdAt: oneWeekAgo.toISOString(),
        },
        lastMessageAt: oneWeekAgo.toISOString(),
      },
    ];
  };

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      const mockData = getMockConversations();
      setConversations(mockData);
      setLoading(false);
    }, 500);
  }, []);

  const getOtherParticipant = (conversation: Conversation): Participant | null => {
    const currentUserId = 'current';
    return conversation.participants.find(p => p._id !== currentUserId) || conversation.participants[0] || null;
  };

  const formatTime = (dateString?: string | null): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks}w`;
    
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths}mo`;
  };

  const getInitials = (name: string): string => {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const otherUser = getOtherParticipant(item);
    if (!otherUser) return null;

    const displayName = otherUser.displayName || otherUser.username;
    const hasMessage = item.lastMessage && item.lastMessage.content;
    const messagePreview = hasMessage 
      ? (item.lastMessage!.type === 'image' ? '📷 Ảnh' : item.lastMessage!.content)
      : 'Chưa có câu trả lời nào!';

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => {
          // TODO: Navigate to chat detail screen
          console.log('Open conversation:', item._id);
        }}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {otherUser.avatarUrl ? (
            <Image
              source={{ uri: otherUser.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {displayName}
            </Text>
            {item.lastMessageAt && (
              <Text style={styles.timeText}>
                {formatTime(item.lastMessageAt)}
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.messagePreview,
              !hasMessage && styles.emptyMessagePreview,
            ]}
            numberOfLines={1}
          >
            {messagePreview}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#666" />
      <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
      <Text style={styles.emptySubtext}>Bắt đầu trò chuyện với bạn bè của bạn</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          navigationBarColor: '#000000',
          statusBarStyle: 'light',
          statusBarBackgroundColor: '#000000',
        }}
      />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tin nhắn</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={
              conversations.length === 0 ? styles.emptyListContainer : undefined
            }
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333333',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
  },
  messagePreview: {
    fontSize: 14,
    color: '#999999',
  },
  emptyMessagePreview: {
    color: '#666666',
    fontStyle: 'italic',
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#333333',
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

