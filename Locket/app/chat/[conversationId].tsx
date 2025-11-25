import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/context/AuthContext';
import type { Message } from '../../src/api/services/chat.service';
import { useChatMessages } from './hooks/useChatMessages';
import { useTyping } from './hooks/useTyping';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { TypingIndicator } from './components/TypingIndicator';

export default function ChatDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ conversationId: string }>();
  const { conversationId } = params;
  const { user, token } = useAuth();
  const [inputText, setInputText] = useState('');

  const {
    messages,
    loading,
    loadingMore,
    sending,
    hasMore,
    flatListRef,
    loadMoreMessages,
    sendMessage,
    sendImage,
  } = useChatMessages({
    conversationId: conversationId || '',
    token,
    userId: user?.id,
  });

  const { isTyping, typingUserId, handleTypingChange } = useTyping({
    conversationId: conversationId || '',
    userId: user?.id,
  });

  // Handle input change with typing indicator
  const handleInputChange = (text: string) => {
    setInputText(text);
    handleTypingChange(text);
  };

  // Handle send message
  const handleSend = async () => {
    if (!inputText.trim() || sending || !conversationId || !user) return;
    const content = inputText;
    setInputText('');
    
    try {
      await sendMessage(content, user);
    } catch (error: any) {
      // Hiển thị Alert khi có lỗi
      Alert.alert(
        'Lỗi gửi tin nhắn',
        error.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.',
        [{ text: 'OK' }],
      );
    }
  };

  // Handle pick and send image
  const handlePickImage = async () => {
    if (sending || !conversationId || !user) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Cần quyền truy cập thư viện ảnh để gửi ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        try {
          await sendImage(result.assets[0].uri, user);
        } catch (error: any) {
          // Hiển thị Alert khi có lỗi
          Alert.alert(
            'Lỗi gửi ảnh',
            error.message || 'Không thể gửi ảnh. Vui lòng thử lại.',
            [{ text: 'OK' }],
          );
        }
      }
    } catch (error: any) {
      console.error('[Chat] Error picking image:', error);
      Alert.alert(
        'Lỗi',
        'Không thể chọn ảnh. Vui lòng thử lại.',
        [{ text: 'OK' }],
      );
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (!item || !item._id) {
      return null;
    }
    return <MessageBubble message={item} />;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#666" />
      <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
      <Text style={styles.emptySubtext}>Bắt đầu trò chuyện</Text>
    </View>
  );

  const renderHeader = () => {
    if (loadingMore) {
      return (
        <View style={styles.loadMoreContainer}>
          <ActivityIndicator size="small" color="#FFFFFF" />
        </View>
      );
    }
    return null;
  };

  if (loading) {
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        </SafeAreaView>
      </>
    );
  }

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
          <View style={styles.headerSpacer} />
        </View>

        {/* Messages List */}
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  renderItem={renderMessage}
                  keyExtractor={(item, index) => {
                    if (!item || !item._id) {
                      return `invalid-${index}`;
                    }
                    return item._id;
                  }}
            contentContainerStyle={
              messages.length === 0 ? styles.emptyListContainer : styles.messagesList
            }
            ListEmptyComponent={renderEmptyState}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            inverted={true}
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.1}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
            onContentSizeChange={() => {
              if (messages.length > 0 && !loadingMore && flatListRef.current) {
                requestAnimationFrame(() => {
                  if (flatListRef.current && messages.length > 0) {
                    try {
                      flatListRef.current.scrollToIndex({
                        index: 0,
                        animated: false,
                        viewOffset: 0,
                        viewPosition: 0,
                      });
                    } catch (error) {
                      try {
                        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
                      } catch (e) {
                        console.warn('[Chat] Failed to scroll:', e);
                      }
                    }
                  }
                });
              }
            }}
          />

          {/* Typing Indicator */}
          <TypingIndicator isVisible={isTyping && !!typingUserId} />

          {/* Input Area */}
          <ChatInput
            inputText={inputText}
            onInputChange={handleInputChange}
            onSend={handleSend}
            onPickImage={handlePickImage}
            sending={sending}
          />
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 16,
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
  loadMoreContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});
