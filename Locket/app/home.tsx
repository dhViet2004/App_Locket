import { Text, View, StyleSheet, TouchableOpacity, Dimensions, ScrollView, TextInput, Modal, PanResponder, Animated } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, CameraType, FlashMode } from "expo-camera";
import { useState, useRef } from "react";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const cameraRef = useRef<CameraView>(null);
  
  // Hide debug text in development
  if (__DEV__) {
    console.warn = () => {};
    console.log = () => {};
  }
  
  // Modal drag animation
  const modalHeight = useRef(new Animated.Value(screenHeight * 0.6)).current;

  const handleTakePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        console.log('Photo taken:', photo.uri);
        
        // Navigate to photo preview screen with photo URI
        router.push({
          pathname: '/photo-preview',
          params: { photoUri: photo.uri }
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

  const openFriendsModal = () => {
    setShowFriendsModal(true);
  };

  const closeFriendsModal = () => {
    setShowFriendsModal(false);
    modalHeight.setValue(screenHeight * 0.6);
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
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {/* Profile Icon */}
          <TouchableOpacity style={styles.headerButton}>
            <View style={styles.profileIcon}>
              <FontAwesome5 name="user-circle" size={24} color="white" />
            </View>
          </TouchableOpacity>

          {/* Friends Button */}
          <TouchableOpacity style={styles.friendsButton} onPress={openFriendsModal}>
            <FontAwesome5 name="user-friends" size={14} color="white" />
            <Text style={styles.friendsText}> Bạn bè</Text>
          </TouchableOpacity>

          {/* Chat Icon */}
          <TouchableOpacity style={styles.headerButton}>
            <View style={styles.chatIcon}>
              <Ionicons name="chatbubble-outline" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {/* Camera Viewfinder */}
          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={cameraType}
              flash={flashMode}
              onCameraReady={() => setIsCameraReady(true)}
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
          <View style={styles.historyContainer}>
            <Text style={styles.historyText}>Lịch sử</Text>
            <MaterialIcons name="keyboard-arrow-down" size={34} color="white" />
          </View>
        </View>

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
                <Text style={styles.modalSubtitle}>0 / 20 người bạn đã được bổ sung</Text>
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
                />
              </View>

              {/* Scrollable Content */}
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    marginBottom:39,
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
});
