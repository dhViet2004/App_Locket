import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { isAxiosError } from 'axios';
import { useAuth, DEFAULT_AVATAR_URL } from "../src/context/AuthContext";
import { buildCreatePostFormData, createPostApi, type UploadImageFile } from "../src/api/services/post.service";
import type { PostVisibility } from "../src/types/api.types";
import CaptionSuggestion from "../src/components/CaptionSuggestion";

const { width: screenWidth } = Dimensions.get('window');
export default function PhotoPreviewScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams();
  const { user, token } = useAuth();
  const [selectedRecipients, setSelectedRecipients] = useState(['all']);
  const [messageText, setMessageText] = useState('');
  const [visibility] = useState<PostVisibility>('friends');
  const [isSending, setIsSending] = useState(false);

  const resolvedPhotoUri = useMemo(() => {
    if (Array.isArray(photoUri)) {
      return photoUri[0];
    }
    return photoUri;
  }, [photoUri]);





  const recipients = [
    { id: 'all', name: 'Tất cả', avatar: '👥', isGroup: true },
    { id: 'be', name: 'be', avatar: '👤' },
    { id: 'mynh', name: 'MyNh...', avatar: '👤' },
    { id: 'tn', name: 'TN', avatar: '👤' },
  ];

  const toggleRecipient = (id: string) => {
    if (id === 'all') {
      setSelectedRecipients(['all']);
    } else {
      setSelectedRecipients(prev => {
        const filtered = prev.filter(r => r !== 'all');
        if (filtered.includes(id)) {
          return filtered.filter(r => r !== id);
        } else {
          return [...filtered, id];
        }
      });
    }
  };

  const imageFile = useMemo<UploadImageFile | null>(() => {
    if (!resolvedPhotoUri) {
      return null;
    }

    const normalizedUri =
      Platform.OS === 'ios'
        ? (resolvedPhotoUri as string).replace('file://', '')
        : (resolvedPhotoUri as string);

    const filename =
      (resolvedPhotoUri as string).split('/').pop() ?? 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename.toLowerCase());
    const extension = match ? match[1] : 'jpg';
    const type =
      extension === 'jpg' ? 'image/jpeg' : `image/${extension || 'jpeg'}`;

    return {
      uri: normalizedUri,
      name: filename,
      type,
    };
  }, [resolvedPhotoUri]);

  const handleSend = async () => {
    if (isSending) {
      return;
    }

    if (!token) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để tiếp tục.');
      router.push('/login');
      return;
    }

    if (!imageFile || !resolvedPhotoUri) {
      Alert.alert('Thiếu ảnh', 'Không tìm thấy ảnh để gửi. Vui lòng chụp lại.');
      router.back();
      return;
    }

    try {
      setIsSending(true);

      const formData = buildCreatePostFormData(
        imageFile,
        {
          caption: messageText.trim() || undefined,
          visibility,
        }
      );

      const response = await createPostApi(formData);
      const createdPost = response.data;

      const newPhoto = {
        id: createdPost._id,
        image: createdPost.imageUrl,
        message: createdPost.caption || '',
        sender: {
          name: user?.displayName || user?.username || 'Bạn',
          avatar: user?.avatarUrl || DEFAULT_AVATAR_URL,
          time: 'Vừa xong',
        },
        recipients: selectedRecipients,
        timestamp: createdPost.createdAt,
      };

      router.push({
        pathname: '/history',
        params: {
          newPhoto: JSON.stringify(newPhoto),
        },
      });
    } catch (error) {
      console.error('Error creating post:', error);
      let message = 'Không thể gửi ảnh. Vui lòng thử lại.';
      if (isAxiosError(error)) {
        message = (error.response?.data as { message?: string })?.message || message;
      }
      Alert.alert('Lỗi', message);
    } finally {
      setIsSending(false);
    }
  };


  const handleCancel = () => {
    // Logic hủy và quay lại
    if (isSending) {
      return;
    }
    router.back();
  };

  const handleAddText = () => {
    // Logic thêm text
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gửi đến...</Text>
        
      </View>

      <View style={styles.mainContent}>
        {/* Photo Container - matching camera size from home */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: resolvedPhotoUri as string || 'https://via.placeholder.com/300x400/333/fff?text=Photo+Preview' }}
            style={styles.photo}
            resizeMode="cover"
          />
          
          <View style={styles.messageOverlay}>
            <TextInput
              style={styles.messageInput}
              placeholder="Thêm một tin nhắn"
              placeholderTextColor="#999"
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
          </View>
        </View>

        {/* Page Indicator */}
        <View style={styles.pageIndicator}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <CaptionSuggestion
          image={imageFile}
          disabled={isSending}
          onApply={setMessageText}
        />

        {/* Control Buttons */}
        <View style={styles.controlButtons}>
          <TouchableOpacity style={styles.controlButton} onPress={handleCancel} disabled={isSending}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="paper-plane" size={28} color="#fff" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={handleAddText} disabled={isSending}>
            <Text style={styles.textIcon}>Aa</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.recipientsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recipientsList}>
          {recipients.map((recipient) => (
            <TouchableOpacity
              key={recipient.id}
              style={[
                styles.recipientItem,
                selectedRecipients.includes(recipient.id) && styles.selectedRecipient
              ]}
              onPress={() => toggleRecipient(recipient.id)}
            >
              <View style={[
                styles.recipientAvatar,
                selectedRecipients.includes(recipient.id) && styles.selectedRecipientAvatar
              ]}>
                {recipient.isGroup ? (
                  <Ionicons name="people" size={20} color="#fff" />
                ) : (
                  <Text style={styles.avatarText}>{recipient.avatar}</Text>
                )}
              </View>
              <Text style={[
                styles.recipientName,
                selectedRecipients.includes(recipient.id) && styles.selectedRecipientName
              ]}>
                {recipient.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  photoContainer: {
    width: screenWidth - 20, // Same as cameraContainer in home.tsx
    height: screenWidth - 20, // Same as cameraContainer in home.tsx
    alignSelf: 'center',
    borderRadius: 70, // Same as cameraContainer in home.tsx
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  photo: {
    width: '100%',
    height: '100%',
    // No borderRadius here since container handles it
    backgroundColor: '#000',
  },
  messageOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageInput: {
    color: '#fff',
    fontSize: 16,
    minHeight: 20,
    maxHeight: 100,
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  sendButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  textIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recipientsContainer: {
    paddingBottom: 20,
  },
  recipientsList: {
    paddingHorizontal: 20,
  },
  recipientItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  recipientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  selectedRecipientAvatar: {
    backgroundColor: '#ffd700',
  },
  avatarText: {
    fontSize: 20,
  },
  recipientName: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  selectedRecipientName: {
    color: '#ffd700',
  },
  selectedRecipient: {
    // Additional styling for selected state
  },
});
