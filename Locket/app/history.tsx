import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HistoryScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Mock data for history feed - matching the sample image
  const historyData = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=600&fit=crop&crop=center',
      message: 'm đúng k Tuyết',
      sender: {
        name: 'be',
        avatar: 'https://res.cloudinary.com/dh1o42tjk/image/upload/v1761231281/taskmanagement/avatars/a0hsc7oncibdgnvhbgbp.jpg',
        time: '3h'
      }
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop&crop=center',
      message: 'Chào buổi sáng!',
      sender: {
        name: 'Alice',
        avatar: 'https://via.placeholder.com/40x40/666/fff?text=A',
        time: '5h'
      }
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop&crop=center',
      message: 'Hôm nay trời đẹp quá',
      sender: {
        name: 'Bob',
        avatar: 'https://via.placeholder.com/40x40/666/fff?text=B',
        time: '1d'
      }
    }
  ];

  const quickReactions = ['💛', '🔥', '🥰', '😂'];

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleQuickReaction = (emoji: string) => {
    console.log('Quick reaction:', emoji);
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleChat = () => {
    console.log('Open chat');
  };

  const handleFriends = () => {
    console.log('Open friends list');
  };

  const handleCamera = () => {
    router.push('/home');
  };

  const handleGrid = () => {
    console.log('Open grid view');
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          navigationBarColor: '#000000',
          statusBarStyle: 'light',
          statusBarBackgroundColor: '#000000'
        }} 
      />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleProfile} style={styles.headerButton}>
            <Ionicons name="person-outline" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleFriends} style={styles.friendsButton}>
            <Ionicons name="people-outline" size={20} color="#fff" />
            <Text style={styles.friendsText}>3 Bạn bè</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleChat} style={styles.headerButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Main Content - History Feed */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {historyData.map((item, index) => (
            <View key={item.id} style={styles.feedItem}>
              {/* Image Container - matching camera size from home/photo-preview */}
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.feedImage} />
                {item.message && (
                  <View style={styles.messageOverlay}>
                    <Text style={styles.messageText}>{item.message}</Text>
                  </View>
                )}
              </View>
              
              {/* Sender Info */}
              <View style={styles.senderInfo}>
                <Image source={{ uri: item.sender.avatar }} style={styles.senderAvatar} />
                <View style={styles.senderDetails}>
                  <Text style={styles.senderName}>{item.sender.name}</Text>
                  <Text style={styles.senderTime}>{item.sender.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Interaction Area */}
        <View style={styles.interactionArea}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Gửi tin nhắn..."
              placeholderTextColor="#666"
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Quick Reactions */}
          <View style={styles.quickReactions}>
            {quickReactions.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reactionButton}
                onPress={() => handleQuickReaction(emoji)}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.reactionButton}
              onPress={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Ionicons name="add" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={handleGrid} style={styles.navButton}>
            <Ionicons name="grid-outline" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleCamera} style={styles.cameraButton}>
            <View style={styles.cameraButtonInner} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  friendsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  feedItem: {
    marginBottom: 30,
    alignItems: 'center',
  },
  imageContainer: {
    width: screenWidth - 20, // Same as cameraContainer in home.tsx
    height: screenWidth - 20, // Same as cameraContainer in home.tsx  
    alignSelf: 'center',
    borderRadius: 70, // Same as cameraContainer in home.tsx
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  feedImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#111',
  },
  messageOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  senderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  senderDetails: {
    marginLeft: 12,
  },
  senderName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  senderTime: {
    color: '#999',
    fontSize: 14,
    marginTop: 2,
  },
  interactionArea: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#111',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
  },
  messageInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 5,
  },
  sendButton: {
    marginLeft: 10,
    padding: 5,
  },
  quickReactions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  reactionEmoji: {
    fontSize: 18,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  navButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffd700',
  },
  cameraButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
  },
});
