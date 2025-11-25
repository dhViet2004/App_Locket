import { Text, View, StyleSheet, TouchableOpacity, Dimensions, ScrollView, TextInput, Modal, PanResponder, Animated, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, CameraType, FlashMode } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import * as ScreenOrientation from 'expo-screen-orientation';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useAuth } from "../src/context/AuthContext";
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { getFriendsApi, sendFriendRequestByUsernameApi, getPendingRequestsApi, acceptFriendRequestApi } from "../src/api/services/friendship.service";
import type { PendingRequest } from "../src/types/api.types";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [friendCount, setFriendCount] = useState(0);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [acceptingRequestId, setAcceptingRequestId] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    }).catch((error: unknown) => console.warn('Failed to set audio mode', error));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchFriendCount = async () => {
      try {
        const response = await getFriendsApi();
        const nextCount = response.data?.count ?? response.data?.friends?.length ?? 0;
        if (isMounted) {
          setFriendCount(nextCount);
        }
      } catch (error) {
        console.warn('[Home] Failed to fetch friend count', error);
      }
    };

    fetchFriendCount();

    return () => {
      isMounted = false;
    };
  }, []);

  // Hide debug text in development
  if (__DEV__) {
    console.warn = () => { };
    console.log = () => { };
  }

  // Modal drag animation
  const modalHeight = useRef(new Animated.Value(screenHeight * 0.6)).current;

  const handleTakePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        // Get current orientation
        const orientation = await ScreenOrientation.getOrientationAsync();
        console.log('Current orientation:', orientation);

        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          skipProcessing: false, // Ensure proper orientation handling
          exif: true, // Include EXIF data for proper orientation
        });
        console.log('Photo taken:', photo.uri);

        // Navigate to photo preview screen with photo URI and orientation
        router.push({
          pathname: '/photo-preview',
          params: {
            photoUri: photo.uri,
            orientation: orientation.toString()
          }
        });
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  const toggleCameraType = () => {
    setCameraType(current =>
      current === 'back' ? 'front' : 'back'
    );
  };

  const toggleFlash = () => {
    setFlashMode(current =>
      current === 'off' ? 'on' : 'off'
    );
  };

  const openFriendsModal = async () => {
    setShowFriendsModal(true);
    await fetchPendingRequests();
  };

  const fetchPendingRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const response = await getPendingRequestsApi();
      const data = response.data as any;
      setPendingRequests(data?.requests || []);
    } catch (error) {
      console.error('[Home] Failed to fetch pending requests:', error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setAcceptingRequestId(requestId);
    try {
      await acceptFriendRequestApi(requestId);

      // Remove from pending list
      setPendingRequests(prev => prev.filter(req => req._id !== requestId));

      // Refresh friend count
      const response = await getFriendsApi();
      const nextCount = response.data?.count ?? response.data?.friends?.length ?? 0;
      setFriendCount(nextCount);

      // Show success message
      setRequestMessage({ type: 'success', text: 'Đã chấp nhận lời mời kết bạn' });
      setTimeout(() => setRequestMessage(null), 3000);
    } catch (error: any) {
      console.error('[Home] Failed to accept request:', error);
      const errorMsg = error.response?.data?.message || 'Không thể chấp nhận lời mời';
      setRequestMessage({ type: 'error', text: errorMsg });
      setTimeout(() => setRequestMessage(null), 3000);
    } finally {
      setAcceptingRequestId(null);
    }
  };

  const closeFriendsModal = () => {
    setShowFriendsModal(false);
    modalHeight.setValue(screenHeight * 0.6);
  };

  const handleSendFriendRequest = async () => {
    if (!searchText.trim()) return;

    setIsSendingRequest(true);
    setRequestMessage(null);

    try {
      await sendFriendRequestByUsernameApi(searchText.trim());
      setRequestMessage({ type: 'success', text: `Đã gửi lời mời kết bạn đến ${searchText}` });
      setSearchText('');

      // Refresh friend count
      const response = await getFriendsApi();
      const nextCount = response.data?.count ?? response.data?.friends?.length ?? 0;
      setFriendCount(nextCount);

      // Clear message after 3 seconds
      setTimeout(() => setRequestMessage(null), 3000);
    } catch (error: any) {
      console.error('[Home] Friend request error:', error);
      console.error('[Home] Error response:', error.response?.data);

      let errorMsg = 'Đã có lỗi xảy ra';

      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMsg = `Không tìm thấy người dùng "${searchText}"`;
      } else if (error.response?.status === 400) {
        errorMsg = error.response.data?.message || 'Yêu cầu không hợp lệ';
      } else if (error.message) {
        errorMsg = error.message;
      }

      setRequestMessage({ type: 'error', text: errorMsg });

      // Clear error after 3 seconds
      setTimeout(() => setRequestMessage(null), 3000);
    } finally {
      setIsSendingRequest(false);
    }
  };

  // Gesture handlers for navigation
  const handleGestureEvent = (event: any) => {
    // Track gesture progress if needed
  };

  const handleGestureStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY, velocityX, velocityY } = event.nativeEvent;

      // Swipe down to go to history
      if (translationY > 50 && velocityY > 500) {
        router.push('/history');
      }
      // Swipe left to go to profile
      else if (translationX < -50 && velocityX < -500) {
        router.push('/profile');
      }
    }
  };

  // PanResponder for modal drag
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        modalHeight.setOffset((modalHeight as any)._value);
        modalHeight.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        const newHeight = screenHeight * 0.6 - gestureState.dy;
        const clampedHeight = Math.max(screenHeight * 0.4, Math.min(screenHeight * 0.9, newHeight));
        modalHeight.setValue(clampedHeight - screenHeight * 0.6);
      },
      onPanResponderRelease: (evt, gestureState) => {
        modalHeight.flattenOffset();
        const currentHeight = (modalHeight as any)._value;
        const velocity = gestureState.vy;

        if (velocity > 0.5 || currentHeight < screenHeight * 0.5) {
          // Close modal
          Animated.timing(modalHeight, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            setShowFriendsModal(false);
            modalHeight.setValue(screenHeight * 0.6);
          });
        } else if (velocity < -0.5 || currentHeight > screenHeight * 0.7) {
          // Expand modal
          Animated.timing(modalHeight, {
            toValue: screenHeight * 0.9,
            duration: 200,
            useNativeDriver: false,
          }).start();
        } else {
          // Return to default
          Animated.timing(modalHeight, {
            toValue: screenHeight * 0.6,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

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
      <StatusBar style="light" backgroundColor="#000000" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {/* Profile Avatar */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              console.log('[Home] Profile button pressed');
              console.log('[Home] Navigation state before push:', {
                hasUser: !!user,
                userId: user?.id,
                username: user?.username,
              });
              router.push('/profile');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.profileIcon}>
              {user?.avatarUrl ? (
                <Image
                  source={{
                    uri: user.avatarUrl
                  }}
                  style={styles.profileAvatar}
                />
              ) : (
                <FontAwesome5 name="user-circle" size={24} color="white" />
              )}
            </View>
          </TouchableOpacity>

          {/* Friends Button */}
          <TouchableOpacity style={styles.friendsButton} onPress={openFriendsModal}>
            <FontAwesome5 name="user-friends" size={14} color="white" />
            <Text style={styles.friendsText}> Bạn bè</Text>
            <View style={styles.friendCountBadge}>
              <Text style={styles.friendCountText}>{friendCount}</Text>
            </View>
          </TouchableOpacity>

          {/* Chat Icon */}
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/messages')}>
            <View style={styles.chatIcon}>
              <Ionicons name="chatbubble-outline" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <PanGestureHandler
          onGestureEvent={handleGestureEvent}
          onHandlerStateChange={handleGestureStateChange}
        >
          <View style={styles.mainContent}>
            {/* Camera Viewfinder */}
            <View style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={cameraType}
                flash={flashMode}
                onCameraReady={() => setIsCameraReady(true)}
                enableTorch={flashMode === 'on'}
              />
            </View>

            {/* Camera Controls Footer */}
            <View style={styles.footer}>
              {/* Flash Button */}
              <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
                <MaterialCommunityIcons
                  name="flash-outline"
                  size={40}
                  color={flashMode === 'on' ? '#FF8C00' : 'white'}
                />
              </TouchableOpacity>

              {/* Shutter Button */}
              <TouchableOpacity style={styles.shutterButton} onPress={handleTakePicture}>
                <View style={styles.shutterButtonInner}>
                  <View style={styles.shutterButtonCore} />
                </View>
              </TouchableOpacity>

              {/* Camera Flip Button */}
              <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
                <FontAwesome name="refresh" size={34} color="white" />
              </TouchableOpacity>
            </View>

            {/* History Label */}
            <Link href="/history" asChild>
              <TouchableOpacity style={styles.historyContainer}>
                <Text style={styles.historyText}>Lịch sử</Text>
                <MaterialIcons name="keyboard-arrow-down" size={34} color="white" />
              </TouchableOpacity>
            </Link>
          </View>
        </PanGestureHandler>

        {/* Friends Modal */}
        <Modal
          visible={showFriendsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={closeFriendsModal}
        >
          <View style={styles.modalOverlay}>
            {/* Touchable overlay to close modal when tapping outside */}
            <TouchableOpacity
              style={styles.modalOverlayTouchable}
              activeOpacity={1}
              onPress={closeFriendsModal}
            />
            <Animated.View
              style={[styles.modalContainer, { height: modalHeight }]}
              {...panResponder.panHandlers}
            >
              {/* Handle */}
              <View style={styles.modalHandle} />

              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Bạn bè của bạn</Text>
                <Text style={styles.modalSubtitle}>{friendCount} / 20 người bạn đã được bổ sung</Text>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Thêm một người bạn mới"
                  placeholderTextColor="#666"
                  value={searchText}
                  onChangeText={setSearchText}
                  onSubmitEditing={handleSendFriendRequest}
                  returnKeyType="send"
                  editable={!isSendingRequest}
                />
                {searchText.trim().length > 0 && (
                  <TouchableOpacity
                    onPress={handleSendFriendRequest}
                    disabled={isSendingRequest}
                    style={styles.addButton}
                  >
                    {isSendingRequest ? (
                      <Text style={styles.addButtonText}>...</Text>
                    ) : (
                      <Ionicons name="add-circle" size={28} color="#FF8C00" />
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Success/Error Message */}
              {requestMessage && (
                <View style={[
                  styles.messageContainer,
                  requestMessage.type === 'success' ? styles.successMessage : styles.errorMessage
                ]}>
                  <Ionicons
                    name={requestMessage.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                    size={20}
                    color={requestMessage.type === 'success' ? '#4CAF50' : '#F44336'}
                  />
                  <Text style={styles.messageText}>{requestMessage.text}</Text>
                </View>
              )}

              {/* Scrollable Content */}
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {/* Pending Requests Section */}
                {(isLoadingRequests || pendingRequests.length > 0) && (
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>
                      Lời mời kết bạn {pendingRequests.length > 0 && `(${pendingRequests.length})`}
                    </Text>

                    {isLoadingRequests ? (
                      <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Đang tải...</Text>
                      </View>
                    ) : (
                      pendingRequests.map((request) => (
                        <View key={request._id} style={styles.pendingRequestItem}>
                          <View style={styles.requestUserInfo}>
                            {request.requestedBy.avatarUrl ? (
                              <Image
                                source={{ uri: request.requestedBy.avatarUrl }}
                                style={styles.requestAvatar}
                              />
                            ) : (
                              <View style={[styles.requestAvatar, styles.defaultAvatar]}>
                                <FontAwesome5 name="user" size={20} color="#666" />
                              </View>
                            )}
                            <View style={styles.requestUserText}>
                              <Text style={styles.requestUsername}>
                                {request.requestedBy.displayName || request.requestedBy.username}
                              </Text>
                              <Text style={styles.requestTime}>
                                {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.acceptButton,
                              acceptingRequestId === request._id && styles.acceptButtonDisabled
                            ]}
                            onPress={() => handleAcceptRequest(request._id)}
                            disabled={acceptingRequestId === request._id}
                          >
                            {acceptingRequestId === request._id ? (
                              <Text style={styles.acceptButtonText}>...</Text>
                            ) : (
                              <Text style={styles.acceptButtonText}>Chấp nhận</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                  </View>
                )}

                {/* Find Friends Section */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Tìm bạn bè từ các ứng dụng khác</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    <TouchableOpacity style={styles.appIcon}>
                      <View style={[styles.appIconCircle, { backgroundColor: '#0084FF' }]}>
                        <FontAwesome5 name="facebook-messenger" size={24} color="white" />
                      </View>
                      <Text style={styles.appName}>Messen...</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.appIcon}>
                      <View style={[styles.appIconCircle, { backgroundColor: '#0068FF' }]}>
                        <Text style={styles.zaloText}>Zalo</Text>
                      </View>
                      <Text style={styles.appName}>Zalo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.appIcon}>
                      <View style={[styles.appIconCircle, { backgroundColor: '#E4405F' }]}>
                        <FontAwesome5 name="instagram" size={24} color="white" />
                      </View>
                      <Text style={styles.appName}>Insta</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.appIcon}>
                      <View style={[styles.appIconCircle, { backgroundColor: '#666' }]}>
                        <Ionicons name="share" size={24} color="white" />
                      </View>
                      <Text style={styles.appName}>Khác</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>

                {/* Invite Friends Section */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Mời từ các ứng dụng khác</Text>

                  <TouchableOpacity style={styles.inviteItem}>
                    <View style={[styles.appIconCircle, { backgroundColor: '#0084FF' }]}>
                      <FontAwesome5 name="facebook-messenger" size={24} color="white" />
                    </View>
                    <Text style={styles.inviteText}>Messenger</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.inviteItem}>
                    <View style={[styles.appIconCircle, { backgroundColor: '#0068FF' }]}>
                      <Text style={styles.zaloText}>Zalo</Text>
                    </View>
                    <Text style={styles.inviteText}>Zalo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.inviteItem}>
                    <View style={[styles.appIconCircle, { backgroundColor: '#E4405F' }]}>
                      <FontAwesome5 name="instagram" size={24} color="white" />
                    </View>
                    <Text style={styles.inviteText}>Instagram Dms</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.inviteItem}>
                    <View style={[styles.appIconCircle, { backgroundColor: '#0084FF' }]}>
                      <Ionicons name="chatbubble" size={24} color="white" />
                    </View>
                    <Text style={styles.inviteText}>Messages</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.inviteItem}>
                    <View style={[styles.appIconCircle, { backgroundColor: '#0088CC' }]}>
                      <FontAwesome5 name="telegram-plane" size={24} color="white" />
                    </View>
                    <Text style={styles.inviteText}>Telegram</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.inviteItem}>
                    <View style={[styles.appIconCircle, { backgroundColor: '#666' }]}>
                      <Ionicons name="share" size={24} color="white" />
                    </View>
                    <Text style={styles.inviteText}>Các ứng dụng khác</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </View>
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
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#000000',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#333333',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileIconText: {
    fontSize: 20,
  },
  friendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  friendsIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  friendsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  friendCountBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#FF8C00',
  },
  friendCountText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  chatIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#333333',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatIconText: {
    fontSize: 20,
  },
  cameraContainer: {
    width: screenWidth - 20, // screenWidth minus horizontal margins
    height: screenWidth - 20, // same as width to make it square
    alignSelf: 'center',
    borderRadius: 70,
    overflow: 'hidden',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    backgroundColor: '#000000',
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  activeControl: {
    color: '#FF8C00',
  },
  shutterButton: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 50,
  },
  shutterButtonInner: {
    width: 100,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#FF8C00',
  },
  shutterButtonCore: {
    width: 30,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
  },
  historyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 39,
    backgroundColor: '#000000',
  },
  historyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalHandle: {
    width: 40,
    height: 6,
    backgroundColor: '#666',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  modalHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  appIcon: {
    alignItems: 'center',
    marginRight: 20,
    width: 60,
  },
  appIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  zaloText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  inviteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    marginBottom: 8,
  },
  inviteText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 16,
    fontWeight: '500',
  },
  addButton: {
    marginLeft: 8,
  },
  addButtonText: {
    color: '#FF8C00',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  successMessage: {
    backgroundColor: '#1B5E20',
  },
  errorMessage: {
    backgroundColor: '#B71C1C',
  },
  messageText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    fontSize: 14,
  },
  pendingRequestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    marginBottom: 8,
  },
  requestUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  defaultAvatar: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestUserText: {
    flex: 1,
  },
  requestUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  requestTime: {
    fontSize: 12,
    color: '#999',
  },
  acceptButton: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  acceptButtonDisabled: {
    opacity: 0.5,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
