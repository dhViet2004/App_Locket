import { Text, View, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router, usePathname } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useAuth } from "../src/context/AuthContext";

const { width } = Dimensions.get('window');

export default function Index() {
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    // Chỉ redirect nếu đang ở index và user đã đăng nhập
    if (user && pathname === '/') {
      router.replace("/home");
    }
  }, [user, pathname]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />
      
      {/* Phone Illustration */}
      <View style={styles.phoneContainer}>
        <Image 
          source={require('../assets/images/dienthoai.png')}
          style={styles.phoneImage}
          resizeMode="contain"
        />
      </View>

      {/* App Branding */}
      <View style={styles.brandingContainer}>
        {/* Logo and App Name */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.heartIcon}>💛</Text>
          </View>
          <Text style={styles.appName}>Locket</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Ảnh trực tiếp từ bạn bè, ngay trên màn hình chính</Text>

        {/* Primary Button */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/register/email')}
        >
          <Text style={styles.primaryButtonText}>Tạo một tài khoản</Text>
        </TouchableOpacity>

        {/* Secondary Link */}
        <TouchableOpacity 
          style={styles.secondaryLink}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.secondaryLinkText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  phoneContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  phoneImage: {
    width: width * 0.6,
    height: width * 0.8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  brandingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heartIcon: {
    fontSize: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 16,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryLink: {
    paddingVertical: 8,
  },
  secondaryLinkText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});
