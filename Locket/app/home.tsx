import { Text, View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, CameraType, FlashMode } from "expo-camera";
import { useState, useRef } from "react";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleTakePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        console.log('Photo taken:', photo.uri);
        // TODO: Handle photo processing and sending
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
          <TouchableOpacity style={styles.friendsButton}>
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
    width: screenWidth - 40, // screenWidth minus horizontal margins
    height: screenWidth - 40, // same as width to make it square
    alignSelf: 'center',
    borderRadius: 20,
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
});
