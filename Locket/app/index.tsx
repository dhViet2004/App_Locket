import { Text, View, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router, usePathname, useSegments, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef } from "react";
import * as React from "react";
import { useAuth } from "../src/context/AuthContext";

const { width } = Dimensions.get('window');

export default function Index() {
  const { user } = useAuth();
  const pathname = usePathname();
  const segments = useSegments();
  const hasRedirected = useRef(false);
  const isMountedRef = useRef(false);
  // Refs để lưu giá trị pathname và segments mới nhất
  const pathnameRef = useRef(pathname);
  const segmentsRef = useRef(segments);

  // Đánh dấu component đã mount và update refs khi pathname/segments thay đổi
  useEffect(() => {
    isMountedRef.current = true;
    pathnameRef.current = pathname;
    segmentsRef.current = segments;
    return () => {
      isMountedRef.current = false;
    };
  }, [pathname, segments]);

  // QUAN TRỌNG: Sử dụng useFocusEffect thay vì useEffect để chỉ chạy khi screen được focus
  // Điều này đảm bảo redirect chỉ xảy ra khi thực sự ở index screen, không phải khi component mount ở background
  useFocusEffect(
    React.useCallback(() => {
      // Lấy giá trị pathname và segments mới nhất từ refs (luôn được update bởi useEffect)
      const currentPathname = pathnameRef.current;
      const currentSegments = segmentsRef.current;
      const isOnIndexRoute = currentPathname === '/' && currentSegments.length === 0;
      
      // QUAN TRỌNG: Chỉ xử lý redirect khi screen được focus VÀ đang ở index route
      // Nếu không ở index route, không làm gì cả (không log, không redirect)
      if (!isOnIndexRoute) {
        // Reset hasRedirected khi không ở index route
        hasRedirected.current = false;
        return;
      }
      
      // Chỉ log và xử lý khi thực sự ở index route và screen được focus
      console.log('[Index] useFocusEffect triggered on index route:', {
        hasUser: !!user,
        pathname: currentPathname,
        segments: currentSegments.join('/'),
        hasRedirected: hasRedirected.current,
      });
      
      if (user && !hasRedirected.current) {
        console.log('[Index] 🔄 Redirecting to /home');
        hasRedirected.current = true;
        // Sử dụng setTimeout để đảm bảo navigation không bị conflict
        // Tăng delay để đảm bảo navigation state đã ổn định hoàn toàn
        const redirectTimeout = setTimeout(() => {
          // Triple-check: lấy pathname và segments mới nhất từ refs trước khi redirect
          // Check lại một lần nữa để đảm bảo vẫn ở index route
          const finalPathname = pathnameRef.current;
          const finalSegments = segmentsRef.current;
          const stillOnIndexRoute = finalPathname === '/' && finalSegments.length === 0;
          
          if (stillOnIndexRoute) {
            console.log('[Index] ✅ Confirmed still on index route, redirecting to /home');
            router.replace("/home");
          } else {
            console.log('[Index] ⏸️ Navigation state changed during redirect, cancelling:', {
              pathname: finalPathname,
              segments: finalSegments.join('/'),
            });
            hasRedirected.current = false;
          }
        }, 100); // Tăng delay để đảm bảo navigation state đã ổn định
        
        // Cleanup timeout nếu component unmount hoặc navigation state thay đổi
        return () => {
          clearTimeout(redirectTimeout);
        };
      } else if (!user) {
        console.log('[Index] ⏸️ No user, staying on index');
        hasRedirected.current = false;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]) // Chỉ phụ thuộc vào user, không phụ thuộc vào pathname/segments để tránh chạy lại khi navigate
  );

  // QUAN TRỌNG: Chỉ render UI khi thực sự ở index route
  // Điều này giúp tránh render không cần thiết khi component vẫn mount ở background
  const isOnIndexRoute = pathname === '/' && segments.length === 0;
  
  // Nếu không ở index route, return null để không render UI
  if (!isOnIndexRoute) {
    return null;
  }

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
