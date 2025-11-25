import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { isAxiosError } from 'axios';
import { useAuth, DEFAULT_AVATAR_URL } from "../src/context/AuthContext";
import { buildCreatePostFormData, createPostApi, type UploadImageFile } from "../src/api/services/post.service";
import { getFriendsApi } from "../src/api/services/friendship.service";
import type { PostVisibility } from "../src/types/api.types";
import CaptionSuggestion from "../src/components/CaptionSuggestion";
import { Canvas, Path, Skia, useCanvasRef } from "@shopify/react-native-skia";
import * as ImageManipulator from 'expo-image-manipulator';
import { PanResponder, Platform } from 'react-native';
import { cleanupImageApi } from "../src/api/services/cleanup.service";
import * as FileSystem from 'expo-file-system/legacy';

const { width: screenWidth } = Dimensions.get('window');

type RecipientEntry = {
  id: string;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  isGroup?: boolean;
};

const GROUP_RECIPIENT: RecipientEntry = {
  id: 'all',
  name: 'Tất cả',
  avatar: '👥',
  isGroup: true,
};
export default function PhotoPreviewScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams();
  const { user, token } = useAuth();
  const [selectedRecipients, setSelectedRecipients] = useState(['all']);
  const [friendRecipients, setFriendRecipients] = useState<RecipientEntry[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [visibility] = useState<PostVisibility>('friends');
  const [isSending, setIsSending] = useState(false);

  // Magic Eraser State
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [paths, setPaths] = useState<any[]>([]);
  const [isCleaning, setIsCleaning] = useState(false);
  const canvasRef = useCanvasRef();
  const [eraserPhotoUri, setEraserPhotoUri] = useState<string | null>(null);

  const currentPhotoUri = eraserPhotoUri || (Array.isArray(photoUri) ? photoUri[0] : photoUri);

  const resolvedPhotoUri = useMemo(() => {
    return currentPhotoUri;
  }, [currentPhotoUri]);


  const recipients = useMemo(() => {
    return [GROUP_RECIPIENT, ...friendRecipients];
  }, [friendRecipients]);

  useEffect(() => {
    let isMounted = true;

    const fetchFriends = async () => {
      setIsLoadingFriends(true);
      try {
        const response = await getFriendsApi();
        const friends = response.data?.friends ?? [];
        if (!isMounted) {
          return;
        }
        const mappedRecipients: RecipientEntry[] = friends.map(friend => ({
          id: friend.friendshipId || friend.id,
          name: friend.displayName || friend.username,
          avatarUrl: friend.avatarUrl,
        }));
        setFriendRecipients(mappedRecipients);
      } catch (error) {
        console.warn('[PhotoPreview] Failed to load friends', error);
      } finally {
        if (isMounted) {
          setIsLoadingFriends(false);
        }
      }
    };

    fetchFriends();

    return () => {
      isMounted = false;
    };
  }, []);

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

  // PanResponder for drawing
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponderCapture: () => true,

    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const newPath = Skia.Path.Make();
      newPath.moveTo(locationX, locationY);
      setPaths((current) => [...current, { path: newPath, color: "white" }]);
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setPaths((current) => {
        if (current.length === 0) return current;
        const lastItem = current[current.length - 1];
        lastItem.path.lineTo(locationX, locationY);
        return [...current];
      });
    },
  }), []);

  const handleCleanup = async () => {
    if (!resolvedPhotoUri) return;
    setIsCleaning(true);

    try {
      const imageSnapshot = canvasRef.current?.makeImageSnapshot();
      if (!imageSnapshot) {
        Alert.alert("Lỗi", "Chưa có vùng chọn");
        setIsCleaning(false);
        return;
      }

      const maskBase64 = imageSnapshot.encodeToBase64();

      // Save mask to file using expo-file-system
      const maskFileName = `mask_${Date.now()}.png`;
      const maskPath = `${FileSystem.cacheDirectory}${maskFileName}`;

      // Write base64 to file (use string 'base64' instead of EncodingType enum)
      await FileSystem.writeAsStringAsync(maskPath, maskBase64, {
        encoding: 'base64',
      });

      // Small delay to ensure file is flushed to disk
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Mask saved to:', maskPath);

      const PHOTO_SIZE = screenWidth - 20;

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        resolvedPhotoUri as string,
        [{ resize: { width: PHOTO_SIZE, height: PHOTO_SIZE } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      const formData = new FormData();
      // @ts-ignore
      formData.append('image', {
        uri: manipulatedImage.uri,
        type: 'image/jpeg',
        name: 'resized.jpg'
      });
      // @ts-ignore - Send mask as file
      formData.append('mask', {
        uri: maskPath,
        type: 'image/png',
        name: 'mask.png'
      });

      console.log('Sending to backend...');
      const response = await cleanupImageApi(formData);

      if (response.data && response.data.result) {
        setEraserPhotoUri(response.data.result);
        setPaths([]);
        setIsEraserMode(false);

        // Clean up temp mask file
        try {
          await FileSystem.deleteAsync(maskPath, { idempotent: true });
        } catch (e) {
          console.log('Failed to delete temp mask:', e);
        }
      } else {
        Alert.alert("Lỗi Server", "Không nhận được kết quả từ server");
      }

    } catch (error: any) {
      console.error("Error cleaning up:", error);
      Alert.alert("Lỗi", error.message || "Đã có lỗi xảy ra");
    } finally {
      setIsCleaning(false);
    }
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

          {isEraserMode && (
            <View
              style={styles.canvasLayer}
              {...panResponder.panHandlers}
            >
              <Canvas ref={canvasRef} style={{ flex: 1 }}>
                {paths.map((p, index) => (
                  <Path
                    key={index}
                    path={p.path}
                    color="white"
                    style="stroke"
                    strokeWidth={30}
                    strokeCap="round"
                    strokeJoin="round"
                  />
                ))}
              </Canvas>
            </View>
          )}

          {!isEraserMode && (
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
          )}
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
        {isEraserMode ? (
          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                setIsEraserMode(false);
                setPaths([]);
                setEraserPhotoUri(null); // Reset if cancelled? Or keep? Let's reset if they cancel.
              }}
            >
              <Ionicons name="close" size={24} color="#fff" />
              <Text style={styles.controlLabel}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sendButton, isCleaning && styles.sendButtonDisabled, { backgroundColor: '#ff4444' }]}
              onPress={handleCleanup}
              disabled={isCleaning}
            >
              {isCleaning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="sparkles" size={28} color="#fff" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                setIsEraserMode(false);
                setPaths([]);
                // Keep the eraserPhotoUri as the current photo
              }}
            >
              <Ionicons name="checkmark" size={24} color="#fff" />
              <Text style={styles.controlLabel}>Xong</Text>
            </TouchableOpacity>
          </View>
        ) : (
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

            <TouchableOpacity style={styles.controlButton} onPress={() => setIsEraserMode(true)} disabled={isSending}>
              <Ionicons name="color-wand" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
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
                ) : recipient.avatarUrl ? (
                  <Image source={{ uri: recipient.avatarUrl }} style={styles.recipientImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {recipient.avatar || recipient.name.charAt(0).toUpperCase()}
                  </Text>
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
          {isLoadingFriends && (
            <View style={styles.loadingRecipients}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.loadingText}>Đang tải bạn bè...</Text>
            </View>
          )}
          {!isLoadingFriends && friendRecipients.length === 0 && (
            <View style={styles.loadingRecipients}>
              <Ionicons name="information-circle" size={18} color="#fff" />
              <Text style={styles.loadingText}>Chưa có bạn bè nào</Text>
            </View>
          )}
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
  recipientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  loadingRecipients: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  loadingText: {
    color: '#aaa',
    marginLeft: 6,
    fontSize: 12,
  },
  canvasLayer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 100,
    elevation: 10,
  },
  controlLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});
