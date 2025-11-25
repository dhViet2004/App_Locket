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
  Modal,
  TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import {
  getConversationsApi,
  createOrGetConversationApi,
  type Conversation,
  type Message,
} from '../src/api/services/chat.service';
import { getFriendsApi } from '../src/api/services/friendship.service';
import type { FriendSummary } from '../src/types/api.types';
import socketService from '../src/services/socket';

// Bot AI ID - Tự động tạo conversation với Bot khi load
const BOT_AI_ID = '692570398a0f1e0dd9fc6396';

export default function MessagesScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const botConversationCreatedRef = React.useRef(false);

  // Load conversations từ API
  useEffect(() => {
    if (!token) {
      console.log('[Messages] No token available');
      setLoading(false);
      return;
    }

    const loadConversations = async () => {
      try {
        setLoading(true);
        console.log('[Messages] Loading conversations with token:', token.substring(0, 20) + '...');
        const response = await getConversationsApi(1, 50);
        console.log('[Messages] API Response success:', response.success);
        console.log('[Messages] API Response data:', response.data ? 'exists' : 'null');
        
        if (response.success && response.data) {
          const conversations = response.data.conversations || [];
          console.log('[Messages] Conversations loaded:', conversations.length);
          console.log('[Messages] First conversation:', conversations[0] ? JSON.stringify(conversations[0], null, 2) : 'none');
          setConversations(conversations);

          // Tự động tạo conversation với Bot AI nếu chưa có (chỉ chạy 1 lần)
          if (!botConversationCreatedRef.current && user?.id) {
            const hasBotConversation = conversations.some((conv) => {
              return conv.participants.some(
                (p) => String(p._id) === String(BOT_AI_ID)
              );
            });

            if (!hasBotConversation) {
              console.log('[Messages] Bot conversation not found, creating automatically...');
              // Đánh dấu ngay để tránh tạo lại nhiều lần
              botConversationCreatedRef.current = true;
              
              try {
                const botConvResponse = await createOrGetConversationApi(BOT_AI_ID);
                if (botConvResponse.success && botConvResponse.data) {
                  console.log('[Messages] Bot conversation created successfully');
                  // Reload conversations để hiển thị conversation với Bot
                  const reloadResponse = await getConversationsApi(1, 50);
                  if (reloadResponse.success && reloadResponse.data) {
                    setConversations(reloadResponse.data.conversations || []);
                  }
                }
              } catch (botError: any) {
                console.error('[Messages] Error creating bot conversation:', botError);
                // Reset flag nếu lỗi để có thể thử lại lần sau
                botConversationCreatedRef.current = false;
              }
            } else {
              // Đã có conversation với Bot rồi, đánh dấu để không kiểm tra lại
              botConversationCreatedRef.current = true;
            }
          }
        } else {
          console.warn('[Messages] API returned unsuccessful response:', {
            success: response.success,
            message: response.message,
            data: response.data,
          });
          setConversations([]);
        }
      } catch (error: any) {
        console.error('[Messages] Error loading conversations:', error);
        if (error.response) {
          console.error('[Messages] Error response:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          });
        } else if (error.request) {
          console.error('[Messages] No response received:', error.request);
        } else {
          console.error('[Messages] Error setting up request:', error.message);
        }
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [token, user?.id]);

  // Kết nối Socket và lắng nghe new_message để cập nhật conversations
  useEffect(() => {
    if (!token) return;

    // Đảm bảo socket đã kết nối
    if (!socketService.isConnected()) {
      socketService.connect(token);
    }

    // Lắng nghe new_message để cập nhật lastMessage của conversation
    const handleNewMessage = (data: { message: Message }) => {
      const { message } = data;
      console.log('[Messages] New message received:', message);

      // Cập nhật conversation trong danh sách
      setConversations((prev) => {
        const conversationIndex = prev.findIndex(
          (conv) => conv._id === message.conversationId
        );

        if (conversationIndex !== -1) {
          // Conversation đã tồn tại, cập nhật lastMessage và di chuyển lên đầu
          const updated = [...prev];
          const conversation = updated[conversationIndex];
          updated.splice(conversationIndex, 1); // Xóa khỏi vị trí cũ
          updated.unshift({
            // Thêm vào đầu với lastMessage mới
            ...conversation,
            lastMessage: {
              _id: message._id,
              content: message.content,
              type: message.type,
              senderId: message.senderId,
              createdAt: message.createdAt,
              updatedAt: message.updatedAt,
            },
            lastMessageAt: message.createdAt,
          });
          return updated;
        } else {
          // Conversation chưa tồn tại, có thể cần reload danh sách
          // Hoặc tạo conversation mới nếu cần
          console.log('[Messages] Conversation not found, may need to reload');
          return prev;
        }
      });
    };

    socketService.on('new_message', handleNewMessage);

    // Cleanup
    return () => {
      socketService.off('new_message');
    };
  }, [token]);

  // Load danh sách bạn bè khi mở modal
  const loadFriends = async () => {
    if (!token) return;

    try {
      setLoadingFriends(true);
      const response = await getFriendsApi();
      
      if (response.success && response.data) {
        // Map data để đảm bảo có id (backend có thể trả về _id)
        const friendsData = (response.data.friends || []).map((friend: any) => ({
          ...friend,
          id: friend.id || friend._id, // Đảm bảo có id
        }));
        setFriends(friendsData);
      }
    } catch (error) {
      console.error('[Messages] Error loading friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  // Mở modal chọn bạn bè
  const handleOpenFriendsModal = () => {
    setShowFriendsModal(true);
    loadFriends();
  };

  // Tạo conversation với bạn bè được chọn
  const handleSelectFriend = async (friend: FriendSummary) => {
    if (!token || !friend.id) {
      console.log('[Messages] Cannot create conversation: missing token or friend.id', {
        hasToken: !!token,
        friendId: friend.id,
      });
      return;
    }

    try {
      console.log('[Messages] Creating conversation with friend:', friend.id);
      const response = await createOrGetConversationApi(friend.id);
      console.log('[Messages] Create conversation response:', {
        success: response.success,
        hasData: !!response.data,
        data: response.data,
      });
      
      if (response.success && response.data) {
        // Backend trả về conversation trực tiếp trong data (không có nested conversation)
        // Response structure: { success: true, data: { _id: "...", participants: [...], ... } }
        const conversation = response.data as Conversation;
        
        console.log('[Messages] Conversation data:', conversation);
        console.log('[Messages] Conversation _id:', conversation._id);
        
        if (!conversation || !conversation._id) {
          console.error('[Messages] Invalid conversation data:', {
            hasData: !!response.data,
            data: response.data,
            conversation,
          });
          return;
        }
        
        setShowFriendsModal(false);
        setSearchQuery('');
        
        // Navigate đến chat detail
        router.push({
          pathname: '/chat/[conversationId]' as any,
          params: { conversationId: conversation._id },
        });
        
        // Reload conversations để cập nhật danh sách
        try {
          const conversationsResponse = await getConversationsApi(1, 50);
          if (conversationsResponse.success && conversationsResponse.data) {
            setConversations(conversationsResponse.data.conversations || []);
          }
        } catch (reloadError) {
          console.error('[Messages] Error reloading conversations:', reloadError);
        }
      } else {
        console.warn('[Messages] Create conversation failed:', {
          success: response.success,
          hasData: !!response.data,
          message: response.message,
        });
      }
    } catch (error: any) {
      console.error('[Messages] Error creating conversation:', error);
      console.error('[Messages] Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        stack: error?.stack,
      });
    }
  };

  // Lọc bạn bè theo search query
  const filteredFriends = friends.filter((friend) => {
    const query = searchQuery.toLowerCase();
    const displayName = (friend.displayName || friend.username || '').toLowerCase();
    const username = (friend.username || '').toLowerCase();
    return displayName.includes(query) || username.includes(query);
  });

  const getOtherParticipant = (conversation: Conversation) => {
    if (!user?.id) {
      console.log('[Messages] No user ID available');
      return null;
    }
    
    // Backend trả về _id, AuthUser có id (không có underscore)
    // So sánh bằng string để đảm bảo chính xác
    const currentUserId = String(user.id);
    const otherParticipant = conversation.participants.find(
      (p) => String(p._id) !== currentUserId
    );
    
    return otherParticipant || conversation.participants[0] || null;
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
      ? item.lastMessage!.type === 'image'
        ? '📷 Ảnh'
        : item.lastMessage!.content
      : 'Chưa có câu trả lời nào!';

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => {
          router.push({
            pathname: '/chat/[conversationId]' as any,
            params: { conversationId: item._id },
          });
        }}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {otherUser.avatarUrl ? (
            <Image source={{ uri: otherUser.avatarUrl }} style={styles.avatar} />
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
              <Text style={styles.timeText}>{formatTime(item.lastMessageAt)}</Text>
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tin nhắn</Text>
          <TouchableOpacity
            style={styles.newMessageButton}
            onPress={handleOpenFriendsModal}
          >
            <Ionicons name="create-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
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

        {/* Modal chọn bạn bè */}
        <Modal
          visible={showFriendsModal}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowFriendsModal(false)}
          accessibilityViewIsModal={true}
        >
          <SafeAreaView style={styles.modalContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowFriendsModal(false);
                  setSearchQuery('');
                }}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Chọn bạn bè</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm bạn bè..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Friends List */}
            {loadingFriends ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            ) : (
              <FlatList
                data={filteredFriends}
                renderItem={({ item }) => {
                  const displayName = item.displayName || item.username;
                  return (
                    <TouchableOpacity
                      style={styles.friendItem}
                      onPress={() => handleSelectFriend(item)}
                    >
                      <View style={styles.avatarContainer}>
                        {item.avatarUrl ? (
                          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                              {getInitials(displayName)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.friendInfo}>
                        <Text style={styles.friendName}>{displayName}</Text>
                        <Text style={styles.friendUsername}>@{item.username}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  <View style={styles.modalEmptyContainer}>
                    <Ionicons name="people-outline" size={64} color="#666" />
                    <Text style={styles.modalEmptyText}>
                      {searchQuery ? 'Không tìm thấy bạn bè' : 'Chưa có bạn bè nào'}
                    </Text>
                  </View>
                }
              />
            )}
          </SafeAreaView>
        </Modal>
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
  newMessageButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  modalHeaderSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: '#666666',
  },
  modalEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  modalEmptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },
});
