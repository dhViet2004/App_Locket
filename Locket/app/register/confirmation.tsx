import { Text, View, StyleSheet, TouchableOpacity, Share, Alert, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRegisterForm } from "../../src/context/RegisterContext";

export default function ConfirmationScreen() {
  // Get username from route params
  const params = useLocalSearchParams<{ username?: string }>();
  const { data, submit, loading, reset } = useRegisterForm();
  const username = params.username ?? data.username;
  
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Hãy thêm tôi trên Locket! Tên người dùng của tôi là: @${username}`,
        title: 'Thêm tôi trên Locket',
      });
      
      if (result.action === Share.sharedAction) {
        console.log('Chia sẻ thành công');
      } else if (result.action === Share.dismissedAction) {
        console.log('Hủy chia sẻ');
      }
    } catch (error) {
      console.error('Lỗi khi chia sẻ:', error);
      Alert.alert('Lỗi', 'Không thể chia sẻ. Vui lòng thử lại.');
    }
  };

  const handleContinue = async () => {
    try {
      await submit();
      reset();
      router.push("/register/widget");
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể đăng ký. Vui lòng thử lại.';
      Alert.alert('Đăng ký thất bại', message);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#000000" />
      
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
        {/* Profile Preview */}
        <View style={styles.profilePreview}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>VH</Text>
          </View>
          <Text style={styles.usernameText}>{username}</Text>
        </View>

        {/* Main Title */}
        <Text style={styles.mainTitle}>Tin chính thức!</Text>
        
        {/* Description */}
        <Text style={styles.description}>
          Bạn bè của bạn hiện đã có thể thêm bạn bằng cách tìm tên người dùng của bạn.
        </Text>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareIcon}>↗</Text>
          <Text style={styles.shareText}>Chia sẻ tên người dùng</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, loading && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.continueButtonText}>Tiếp tục</Text>
          )}
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  profilePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  usernameText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 40,
  },
  shareIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    marginRight: 8,
  },
  shareText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});
