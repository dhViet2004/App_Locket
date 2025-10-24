import React, { useState } from 'react';
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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import * as MediaLibrary from 'expo-media-library';

const { width: screenWidth } = Dimensions.get('window');
export default function PhotoPreviewScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams();
  const [selectedRecipients, setSelectedRecipients] = useState(['all']);
  const [messageText, setMessageText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Function để mở cài đặt ứng dụng
  const openAppSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error('Không thể mở cài đặt:', error);
      Alert.alert('Lỗi', 'Không thể mở cài đặt ứng dụng. Vui lòng mở thủ công.');
    }
  };

  // Function để kiểm tra quyền truy cập
  const checkPermissions = async () => {
    try {
      const permission = await MediaLibrary.getPermissionsAsync();
      console.log('Permission details:', permission);
      return {
        status: permission.status,
        canAskAgain: permission.canAskAgain,
        granted: permission.granted,
        expires: permission.expires
      };
    } catch (error) {
      console.error('Lỗi khi kiểm tra quyền:', error);
      return { 
        status: 'denied', 
        canAskAgain: false,
        granted: false,
        expires: 'never'
      };
    }
  };

  // Function để yêu cầu quyền truy cập
  const requestPermissions = async () => {
    try {
      console.log('=== YÊU CẦU QUYỀN TRUY CẬP ===');
      console.log('Đang gọi MediaLibrary.requestPermissionsAsync()...');
      
      const result = await MediaLibrary.requestPermissionsAsync();
      
      console.log('Kết quả yêu cầu quyền:');
      console.log('- Status:', result.status);
      console.log('- Granted:', result.granted);
      console.log('- Can ask again:', result.canAskAgain);
      console.log('- Expires:', result.expires);
      console.log('=== END YÊU CẦU QUYỀN ===');
      
      return result;
    } catch (error) {
      console.error('=== LỖI KHI YÊU CẦU QUYỀN ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('=== END LỖI ===');
      throw error;
    }
  };

  // Function debug để kiểm tra quyền chi tiết
  const debugPermissions = async () => {
    try {
      console.log('=== DEBUG PERMISSIONS ===');
      const permission = await MediaLibrary.getPermissionsAsync();
      console.log('Permission object:', JSON.stringify(permission, null, 2));
      console.log('Status:', permission.status);
      console.log('Granted:', permission.granted);
      console.log('Can ask again:', permission.canAskAgain);
      console.log('Expires:', permission.expires);
      console.log('=== END DEBUG ===');
      return permission;
    } catch (error) {
      console.error('Debug permission error:', error);
      return null;
    }
  };

  // Function test quyền đơn giản
  const testPermissions = async () => {
    try {
      console.log('=== TEST PERMISSIONS ===');
      
      // Test 1: Kiểm tra quyền hiện tại
      const currentPermission = await MediaLibrary.getPermissionsAsync();
      console.log('Current permission:', currentPermission);
      
      // Test 2: Thử yêu cầu quyền nếu chưa có
      if (currentPermission.status !== 'granted') {
        console.log('Chưa có quyền, thử yêu cầu...');
        const requestResult = await MediaLibrary.requestPermissionsAsync();
        console.log('Request result:', requestResult);
      }
      
      // Test 3: Kiểm tra lại sau khi yêu cầu
      const finalPermission = await MediaLibrary.getPermissionsAsync();
      console.log('Final permission:', finalPermission);
      
      console.log('=== END TEST PERMISSIONS ===');
      return finalPermission;
    } catch (error) {
      console.error('Test permissions error:', error);
      return null;
    }
  };

  // Hide debug text in development
  if (__DEV__) {
    // Disable all debug output
    console.warn = () => {};
    // console.log = () => {};
    // console.error = () => {};
  }

  // Kiểm tra quyền truy cập khi component mount
  React.useEffect(() => {
    const checkInitialPermissions = async () => {
      try {
        console.log('=== KIỂM TRA QUYỀN BAN ĐẦU ===');
        
        // Test quyền đơn giản
        await testPermissions();
        
        // Debug chi tiết quyền truy cập
        await debugPermissions();
        
        const permissionInfo = await checkPermissions();
        console.log('Initial permission check:', permissionInfo);
        
        // Nếu chưa có quyền, thử yêu cầu quyền ngay
        if (permissionInfo.status !== 'granted') {
          console.log('Chưa có quyền, kiểm tra có thể yêu cầu không...');
          console.log('Can ask again:', permissionInfo.canAskAgain);
          
          if (permissionInfo.canAskAgain) {
            console.log('Có thể yêu cầu quyền, đang yêu cầu...');
            try {
              const requestResult = await requestPermissions();
              console.log('Kết quả yêu cầu quyền ban đầu:', requestResult);
            } catch (error) {
              console.error('Lỗi khi yêu cầu quyền ban đầu:', error);
            }
          } else {
            console.log('Không thể yêu cầu quyền (canAskAgain = false)');
          }
        } else {
          console.log('Đã có quyền truy cập');
        }
        
        console.log('=== END KIỂM TRA QUYỀN BAN ĐẦU ===');
      } catch (error) {
        console.error('Lỗi khi kiểm tra quyền ban đầu:', error);
      }
    };
    
    checkInitialPermissions();
  }, []);

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

  const handleSend = () => {
    // Logic gửi ảnh
    // console.log('Gửi ảnh với tin nhắn:', messageText);
    // console.log('Người nhận:', selectedRecipients);
  };

  const handleSave = async () => {
    if (!photoUri) {
      Alert.alert('Lỗi', 'Không có ảnh để lưu');
      return;
    }

    try {
      setIsSaving(true);
      
      // Kiểm tra quyền truy cập hiện tại
      const permissionInfo = await checkPermissions();
      console.log('Current permission info:', permissionInfo);
      
      // Nếu chưa có quyền, yêu cầu quyền
      if (permissionInfo.status !== 'granted') {
        console.log('=== XỬ LÝ QUYỀN TRUY CẬP ===');
        console.log('Chưa có quyền, kiểm tra có thể yêu cầu không...');
        console.log('Can ask again:', permissionInfo.canAskAgain);
        
        if (permissionInfo.canAskAgain) {
          console.log('Có thể yêu cầu quyền, đang yêu cầu...');
          try {
            const requestResult = await requestPermissions();
            console.log('Kết quả yêu cầu quyền:', requestResult);
            
            // Nếu vẫn chưa có quyền sau khi yêu cầu
            if (requestResult.status !== 'granted') {
              const message = requestResult.canAskAgain 
                ? 'Ứng dụng cần quyền truy cập thư viện ảnh để lưu ảnh. Vui lòng cấp quyền khi được hỏi.'
                : 'Quyền truy cập thư viện ảnh đã bị từ chối. Vui lòng vào Cài đặt > Ứng dụng > Locket để cấp quyền.';
              
              Alert.alert('Cần quyền truy cập', message, [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Cài đặt', onPress: openAppSettings }
              ]);
              return;
            }
          } catch (requestError) {
            console.error('=== LỖI KHI YÊU CẦU QUYỀN ===');
            console.error('Request error:', requestError);
            console.error('Error type:', typeof requestError);
            console.error('Error message:', requestError instanceof Error ? requestError.message : 'Unknown error');
            console.error('=== END LỖI ===');
            
            Alert.alert('Lỗi', 'Không thể yêu cầu quyền truy cập. Vui lòng thử lại.');
            return;
          }
        } else {
          console.log('Không thể yêu cầu quyền (canAskAgain = false)');
          Alert.alert(
            'Cần quyền truy cập', 
            'Quyền truy cập thư viện ảnh đã bị từ chối. Vui lòng vào Cài đặt > Ứng dụng > Locket để cấp quyền.',
            [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Cài đặt', onPress: openAppSettings }
            ]
          );
          return;
        }
        
        console.log('=== END XỬ LÝ QUYỀN TRUY CẬP ===');
      }

      console.log('Bắt đầu lưu ảnh:', photoUri);
      
      // Kiểm tra URI có hợp lệ không
      if (!photoUri || typeof photoUri !== 'string') {
        throw new Error('URI ảnh không hợp lệ');
      }
      
      // Lưu ảnh vào thư viện
      const asset = await MediaLibrary.createAssetAsync(photoUri);
      console.log('Đã tạo asset:', asset.id);
      
      // Tạo album "Locket" nếu chưa có
      let album = await MediaLibrary.getAlbumAsync('Locket');
      if (!album) {
        console.log('Tạo album mới: Locket');
        album = await MediaLibrary.createAlbumAsync('Locket', asset, false);
      } else {
        console.log('Thêm ảnh vào album hiện có');
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      console.log('Lưu ảnh thành công');
      Alert.alert('Thành công', 'Ảnh đã được lưu vào thư viện trong album "Locket"');
    } catch (error) {
      console.error('Lỗi chi tiết khi lưu ảnh:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      
      let errorMessage = 'Không thể lưu ảnh. Vui lòng thử lại.';
      let errorTitle = 'Lỗi';
      
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('permission') || message.includes('denied')) {
          errorTitle = 'Không có quyền truy cập';
          errorMessage = 'Ứng dụng cần quyền truy cập thư viện ảnh. Vui lòng vào Cài đặt > Ứng dụng > Locket để cấp quyền.';
        } else if (message.includes('file') || message.includes('uri') || message.includes('path')) {
          errorTitle = 'Lỗi file ảnh';
          errorMessage = 'Không thể đọc file ảnh. Vui lòng chụp lại ảnh.';
        } else if (message.includes('album') || message.includes('collection')) {
          errorTitle = 'Lỗi album';
          errorMessage = 'Không thể tạo album. Vui lòng thử lại.';
        } else if (message.includes('network') || message.includes('connection')) {
          errorTitle = 'Lỗi kết nối';
          errorMessage = 'Không có kết nối mạng. Vui lòng kiểm tra kết nối.';
        } else {
          errorMessage = `Lỗi: ${error.message}`;
        }
      }
      
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Logic hủy và quay lại
    // console.log('Hủy gửi ảnh');
    router.back();
  };

  const handleAddText = () => {
    // Logic thêm text
    // console.log('Thêm text');
  };

  const handleTestPermissions = async () => {
    console.log('=== TEST PERMISSIONS MANUAL ===');
    try {
      await testPermissions();
    } catch (error) {
      console.error('Manual test error:', error);
    }
    console.log('=== END TEST PERMISSIONS MANUAL ===');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gửi đến...</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.savingButton]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="download-outline" size={24} color="#fff" />
          )}
        </TouchableOpacity>
        
        {/* Test button - chỉ hiển thị trong development */}
        {__DEV__ && (
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={handleTestPermissions}
          >
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.mainContent}>
        {/* Photo Container - matching camera size from home */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: photoUri as string || 'https://via.placeholder.com/300x400/333/fff?text=Photo+Preview' }}
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

        {/* Control Buttons */}
        <View style={styles.controlButtons}>
          <TouchableOpacity style={styles.controlButton} onPress={handleCancel}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="paper-plane" size={28} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={handleAddText}>
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
    // Ensure no debug text is visible
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    // Ensure no debug text is visible
    backgroundColor: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    // Ensure no debug text is visible
    backgroundColor: 'transparent',
  },
  saveButton: {
    padding: 8,
  },
  savingButton: {
    opacity: 0.6,
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
    // Ensure no debug text is visible
    overflow: 'hidden',
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
  testButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 10,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
