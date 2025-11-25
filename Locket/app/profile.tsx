import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack, useFocusEffect, usePathname, useSegments } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, DEFAULT_AVATAR_URL } from "../src/context/AuthContext";
import * as ImagePicker from 'expo-image-picker';
import { changeEmailApi, changePasswordApi, updateAvatarApi } from "../src/api/services/user.service";
import { isAxiosError } from 'axios';
import { AddWidgetPromptModal } from '../src/components/AddWidgetPromptModal';
import { useAddWidgetPrompt } from '../src/hooks/useAddWidgetPrompt';

export default function ProfileScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const { logout, user, updateUser, refreshUser, token } = useAuth();
  const [widgetChainEnabled, setWidgetChainEnabled] = useState(true);
  const [showAccount, setShowAccount] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changeEmailModalVisible, setChangeEmailModalVisible] = useState(false);
  const [changeEmailPassword, setChangeEmailPassword] = useState('');
  const [changeEmailValue, setChangeEmailValue] = useState('');
  const [changeEmailError, setChangeEmailError] = useState<string | null>(null);
  const [changingEmail, setChangingEmail] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [currentPasswordValue, setCurrentPasswordValue] = useState('');
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showChangeEmailPassword, setShowChangeEmailPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    openAddWidgetPrompt,
    isPromptVisible: isAddWidgetPromptVisible,
    closePrompt: closeAddWidgetPrompt,
    confirmAddWidget,
    isProcessing: isLaunchingWidgetPrompt,
  } = useAddWidgetPrompt();
  const SHOULD_REFRESH_USER = false; // Temporary flag to stop calling refreshUser API

  // Refs để tránh gọi refreshUser() quá nhiều lần
  const isRefreshingRef = React.useRef(false);
  const lastRefreshTimeRef = React.useRef<number>(0);
  const focusEffectMountedRef = React.useRef(false);
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const REFRESH_THROTTLE_MS = 5000; // Chỉ refresh tối đa 1 lần mỗi 5 giây
  const FOCUS_DEBOUNCE_MS = 300; // Đợi 300ms sau khi focus để đảm bảo màn hình đã focus hoàn toàn

  // Debug: Log khi component mount/unmount
  React.useEffect(() => {
    console.log('[Profile] Component mounted');
    console.log('[Profile] Initial state:', {
      hasUser: !!user,
      hasToken: !!token,
      userId: user?.id,
      username: user?.username,
      pathname,
      segments: segments.join('/'),
    });

    return () => {
      console.log('[Profile] Component unmounted');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debug: Log khi pathname hoặc segments thay đổi (navigation events)
  React.useEffect(() => {
    console.log('[Profile] Navigation state changed:', {
      pathname,
      segments: segments.join('/'),
      hasUser: !!user,
      hasToken: !!token,
    });
  }, [pathname, segments, user, token]);

  // Debug: Log khi user hoặc token thay đổi
  React.useEffect(() => {
    console.log('[Profile] User/Token state changed:', {
      hasUser: !!user,
      hasToken: !!token,
      userId: user?.id,
      username: user?.username,
      pathname,
      segments: segments.join('/'),
    });

    if (!user && token) {
      console.warn('[Profile] ⚠️ User is null but token exists - possible auth issue');
      console.warn('[Profile] ⚠️ This should not cause redirect - staying on profile screen');
    }
    if (!token) {
      console.warn('[Profile] ⚠️ No token available');
      console.warn('[Profile] ⚠️ This should not cause redirect - staying on profile screen');
    }

    // QUAN TRỌNG: Không tự động redirect khi user hoặc token thay đổi
    // Chỉ redirect khi user thực sự logout (cả user và token đều null)
    // và chỉ khi đang ở profile screen
    if (!user && !token && pathname === '/profile') {
      console.warn('[Profile] ⚠️ User and token both null - user logged out');
      console.warn('[Profile] ⚠️ Will redirect to home/index');
      // Có thể redirect về home hoặc index nếu cần
      // Nhưng tạm thời không redirect để tránh conflict
    }
  }, [user, token, pathname, segments]);

  // Refresh user info khi vào màn hình profile
  // Chỉ refresh nếu có token và chưa refresh gần đây
  // QUAN TRỌNG: Đảm bảo profile screen được focus và không bị redirect
  useFocusEffect(
    React.useCallback(() => {
      if (!SHOULD_REFRESH_USER) {
        console.log('[Profile] refreshUser() temporarily disabled');
        return;
      }

      // Đánh dấu là đã mount
      focusEffectMountedRef.current = true;

      // Clear debounce timer nếu có
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      console.log('[Profile] useFocusEffect triggered - Screen focused:', {
        pathname,
        segments: segments.join('/'),
        hasUser: !!user,
        hasToken: !!token,
      });

      // Đảm bảo chúng ta vẫn ở profile screen
      // Nếu không, có thể có vấn đề với navigation
      if (pathname !== '/profile') {
        console.warn('[Profile] ⚠️ Not on profile route when focused:', pathname);
        return;
      }

      // Sử dụng debounce để đợi màn hình focus hoàn toàn trước khi gọi API
      debounceTimerRef.current = setTimeout(() => {
        // Kiểm tra lại xem component vẫn còn mounted không
        if (!focusEffectMountedRef.current) {
          console.log('[Profile] ⏸️ Skipping refreshUser() - component unmounted during debounce');
          return;
        }

        const now = Date.now();
        const timeSinceLastRefresh = now - lastRefreshTimeRef.current;

        console.log('[Profile] Debounced focus check', {
          hasToken: !!token,
          hasUser: !!user,
          isRefreshing: isRefreshingRef.current,
          timeSinceLastRefresh,
          shouldRefresh: timeSinceLastRefresh > REFRESH_THROTTLE_MS,
        });

        // Chỉ refresh nếu:
        // 1. Có token
        // 2. Không đang refresh
        // 3. Đã qua thời gian throttle
        // 4. Component vẫn còn mounted
        if (token && !isRefreshingRef.current && timeSinceLastRefresh > REFRESH_THROTTLE_MS && focusEffectMountedRef.current) {
          isRefreshingRef.current = true;
          lastRefreshTimeRef.current = now;

          console.log('[Profile] Calling refreshUser()...');
          refreshUser()
            .then(() => {
              // Chỉ log nếu component vẫn còn mounted
              if (focusEffectMountedRef.current) {
                console.log('[Profile] ✅ refreshUser() completed successfully');
              }
            })
            .catch((error) => {
              // Chỉ log nếu component vẫn còn mounted
              if (focusEffectMountedRef.current) {
                console.error('[Profile] ❌ refreshUser() failed:', error);
                console.error('[Profile] Error details:', {
                  message: error?.message,
                  response: error?.response?.data,
                  status: error?.response?.status,
                });
              }
            })
            .finally(() => {
              // Chỉ reset nếu component vẫn còn mounted
              if (focusEffectMountedRef.current) {
                isRefreshingRef.current = false;
              }
            });
        } else {
          if (!token) {
            console.warn('[Profile] ⚠️ Skipping refreshUser() - no token available');
          } else if (isRefreshingRef.current) {
            console.log('[Profile] ⏸️ Skipping refreshUser() - already refreshing');
          } else if (timeSinceLastRefresh <= REFRESH_THROTTLE_MS) {
            console.log('[Profile] ⏸️ Skipping refreshUser() - throttled (last refresh was', timeSinceLastRefresh, 'ms ago)');
          } else if (!focusEffectMountedRef.current) {
            console.log('[Profile] ⏸️ Skipping refreshUser() - component unmounted');
          }
        }
      }, FOCUS_DEBOUNCE_MS);

      // Cleanup function: đánh dấu là đã unmount và clear timer
      return () => {
        console.log('[Profile] useFocusEffect cleanup - screen unfocused');
        focusEffectMountedRef.current = false;
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshUser, token]) // Removed 'user' from dependencies to prevent loop
  );

  const userDisplayName = user?.displayName || user?.username || 'Người dùng';
  const userEmail = user?.email || 'Chưa cập nhật';
  const inviteLink = user?.username ? `locket.com/${user.username}` : 'locket.com';

  const handleEditProfile = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Cần quyền truy cập',
          'Vui lòng cấp quyền truy cập thư viện ảnh để chọn avatar.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadAvatar(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    try {
      setUploadingAvatar(true);

      // Create FormData
      const formData = new FormData();

      // Get file name and type from URI
      const filename = imageUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Append file to FormData
      formData.append('avatar', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        name: filename,
        type: type,
      } as any);

      // Upload avatar
      const response = await updateAvatarApi(formData);

      // Update user in context
      if (response.data) {
        updateUser(response.data);
        Alert.alert('Thành công', 'Đã cập nhật avatar thành công!');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      let message = 'Không thể cập nhật avatar. Vui lòng thử lại.';

      if (isAxiosError(error)) {
        message = (error.response?.data as { message?: string })?.message || message;
      }

      Alert.alert('Lỗi', message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpgrade = () => {
    // Navigate to Locket Gold screen
    router.push('/locket-gold');
  };

  const handleInviteFriends = () => {
    // Logic mời bạn bè
    console.log('Invite friends');
  };

  const handleAddWidget = () => {
    openAddWidgetPrompt();
  };

  const handleHowToAddWidget = () => {
    router.push('/register/tutorial?source=profile');
  };

  const handleEditName = () => {
    // Logic sửa tên
    console.log('Edit name');
  };

  const handleChangeEmail = () => {
    setChangeEmailPassword('');
    setChangeEmailValue(user?.email ?? '');
    setChangeEmailError(null);
    setShowChangeEmailPassword(false);
    setChangeEmailModalVisible(true);
  };

  const handleChangePassword = () => {
    setCurrentPasswordValue('');
    setNewPasswordValue('');
    setConfirmPasswordValue('');
    setChangePasswordError(null);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setChangePasswordModalVisible(true);
  };

  const closeChangePasswordModal = () => {
    setChangePasswordModalVisible(false);
    setCurrentPasswordValue('');
    setNewPasswordValue('');
    setConfirmPasswordValue('');
    setChangePasswordError(null);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmitChangePassword = async () => {
    const trimmedCurrent = currentPasswordValue.trim();
    const trimmedNew = newPasswordValue.trim();
    const trimmedConfirm = confirmPasswordValue.trim();

    if (!trimmedCurrent || !trimmedNew || !trimmedConfirm) {
      setChangePasswordError('Vui lòng nhập đủ tất cả các trường.');
      return;
    }

    if (trimmedNew.length < 8) {
      setChangePasswordError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setChangePasswordError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (trimmedNew === trimmedCurrent) {
      setChangePasswordError('Mật khẩu mới phải khác mật khẩu hiện tại.');
      return;
    }

    setChangingPassword(true);
    setChangePasswordError(null);

    try {
      await changePasswordApi({
        currentPassword: trimmedCurrent,
        newPassword: trimmedNew,
      });
      Alert.alert('Thành công', 'Đã cập nhật mật khẩu.');
      closeChangePasswordModal();
    } catch (error) {
      let message = 'Không thể đổi mật khẩu. Vui lòng thử lại.';
      if (isAxiosError(error)) {
        message = (error.response?.data as { message?: string })?.message || message;
      }
      setChangePasswordError(message);
    } finally {
      setChangingPassword(false);
    }
  };

  const closeChangeEmailModal = () => {
    setChangeEmailModalVisible(false);
    setChangeEmailPassword('');
    setChangeEmailValue('');
    setChangeEmailError(null);
    setShowChangeEmailPassword(false);
  };

  const handleSubmitChangeEmail = async () => {
    const trimmedPassword = changeEmailPassword.trim();
    const trimmedEmail = changeEmailValue.trim();

    if (!trimmedPassword || !trimmedEmail) {
      setChangeEmailError('Vui lòng nhập đầy đủ mật khẩu và email mới.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setChangeEmailError('Email không hợp lệ.');
      return;
    }

    setChangingEmail(true);
    setChangeEmailError(null);

    try {
      const response = await changeEmailApi({
        password: trimmedPassword,
        newEmail: trimmedEmail,
      });
      if (response.data) {
        updateUser(response.data);
      }
      Alert.alert('Thành công', 'Đã cập nhật email.');
      closeChangeEmailModal();
    } catch (error) {
      let message = 'Không thể đổi email. Vui lòng thử lại.';
      if (isAxiosError(error)) {
        message = (error.response?.data as { message?: string })?.message || message;
      }
      setChangeEmailError(message);
    } finally {
      setChangingEmail(false);
    }
  };

  const handleBlockedAccounts = () => {
    // Logic tài khoản bị chặn
    console.log('Blocked accounts');
  };

  const handleShowAccount = () => {
    setShowAccount(!showAccount);
  };

  const handleSocialLink = (platform: string) => {
    console.log(`Open ${platform}`);
  };

  const handleShareLocket = () => {
    console.log('Share Locket');
  };

  const handleRateLocket = () => {
    console.log('Rate Locket');
  };

  const handleTermsOfService = () => {
    console.log('Terms of Service');
  };

  const handlePrivacyPolicy = () => {
    console.log('Privacy Policy');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Xóa tài khoản',
      'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => console.log('Delete account') }
      ]
    );
  };

  const handleLogout = () => {
    // Trên web, Alert có thể không hoạt động tốt, dùng confirm thay thế
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
      if (!confirmed) return;

      // Thực hiện logout ngay lập tức trên web
      (async () => {
        try {
          console.log('[Profile] Starting logout process (web)...');
          await logout();
          console.log('[Profile] Logout completed, navigating to index...');

          // Navigate về màn hình login
          router.replace('/');

          // Force reload page trên web để đảm bảo state được reset hoàn toàn
          setTimeout(() => {
            window.location.href = '/';
          }, 300);
        } catch (error) {
          console.error('[Profile] Error during logout:', error);
          router.replace('/');
          setTimeout(() => {
            window.location.href = '/';
          }, 300);
        }
      })();
    } else {
      // Trên mobile, dùng Alert như bình thường
      Alert.alert(
        'Đăng xuất',
        'Bạn có chắc chắn muốn đăng xuất?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đăng xuất',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('[Profile] Starting logout process...');
                await logout();
                console.log('[Profile] Logout completed, navigating to index...');
                router.replace('/');
              } catch (error) {
                console.error('[Profile] Error during logout:', error);
                router.replace('/');
              }
            }
          }
        ]
      );
    }
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    isDanger?: boolean
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons
          name={icon as any}
          size={20}
          color={isDanger ? '#ff4444' : '#fff'}
        />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, isDanger && styles.dangerText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={16} color="#666" />
      )}
    </TouchableOpacity>
  );

  // Debug: Log trước khi render
  console.log('[Profile] Rendering profile screen:', {
    hasUser: !!user,
    hasToken: !!token,
    pathname,
    segments: segments.join('/'),
  });

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
      <SafeAreaView
        style={styles.container}
        accessibilityLabel="Profile screen"
        importantForAccessibility="yes"
      >
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            console.log('[Profile] Back button pressed');
            console.log('[Profile] Current state before back:', {
              hasUser: !!user,
              hasToken: !!token,
              userId: user?.id,
            });
            router.back();
          }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ & Cài đặt</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          accessibilityRole="scrollbar"
          accessibilityLabel="Profile content"
          importantForAccessibility="yes"
        >
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleEditProfile}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator size="large" color="#ffd700" />
                </View>
              ) : (
                <Image
                  source={{
                    uri: user?.avatarUrl || DEFAULT_AVATAR_URL
                  }}
                  style={styles.avatar}
                />
              )}
            </TouchableOpacity>
            <Text style={styles.userName}>{userDisplayName}</Text>
            <TouchableOpacity onPress={handleEditProfile} disabled={uploadingAvatar}>
              <Text style={[styles.editProfileText, uploadingAvatar && styles.editProfileTextDisabled]}>
                {uploadingAvatar ? 'Đang tải lên...' : 'Chỉnh ảnh'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Upgrade Section */}
          <View style={styles.upgradeSection}>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Text style={styles.upgradeEmoji}>💛</Text>
              <View style={styles.upgradeText}>
                <Text style={styles.upgradeTitle}>Get Locket Gold</Text>
                <Text style={styles.upgradeSubtitle}>Unlock the best of Locket</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Invite Friends */}
          <View style={styles.inviteSection}>
            <TouchableOpacity style={styles.inviteButton} onPress={handleInviteFriends}>
              <View style={styles.inviteContent}>
                <Text style={styles.inviteTitle}>Mời bạn bè tham gia Locket!</Text>
                <Text style={styles.inviteLink}>{inviteLink}</Text>
              </View>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Widget Settings */}
          {renderSection('Thiết lập Tiện ích', (
            <View style={styles.settingsList}>
              {renderSettingItem('add-outline', 'Thêm Tiện ích', undefined, handleAddWidget)}
              {renderSettingItem('help-circle-outline', 'Cách thêm tiện ích', undefined, handleHowToAddWidget)}
              {renderSettingItem(
                'link-outline',
                'Chuỗi trên tiện ích',
                undefined,
                undefined,
                <Switch
                  value={widgetChainEnabled}
                  onValueChange={setWidgetChainEnabled}
                  trackColor={{ false: '#333', true: '#ffd700' }}
                  thumbColor={widgetChainEnabled ? '#fff' : '#666'}
                />
              )}
            </View>
          ))}

          {/* General Settings */}
          {renderSection('Tổng quát', (
            <View style={styles.settingsList}>
              {renderSettingItem('person-outline', 'Sửa tên', userDisplayName, handleEditName)}
              {renderSettingItem('mail-outline', 'Thay đổi địa chỉ email', userEmail, handleChangeEmail)}
              {renderSettingItem('lock-closed-outline', 'Thay đổi mật khẩu', undefined, handleChangePassword)}
            </View>
          ))}

          {/* Support */}
          {renderSection('Hỗ trợ', (
            <View style={styles.settingsList}>
              {renderSettingItem('help-circle-outline', 'Trung tâm trợ giúp', undefined, handleEditProfile)}
              {renderSettingItem('chatbubble-outline', 'Liên hệ hỗ trợ', undefined, handleEditProfile)}
              {renderSettingItem('information-circle-outline', 'Thông tin ứng dụng', 'v1.0.0', handleEditProfile)}
            </View>
          ))}

          {/* Privacy & Security */}
          {renderSection('Riêng tư & bảo mật', (
            <View style={styles.settingsList}>
              {renderSettingItem('ban-outline', 'Tài khoản bị chặn', undefined, handleBlockedAccounts)}
              {renderSettingItem(
                'eye-outline',
                'Hiển thị tài khoản',
                undefined,
                undefined,
                <Switch
                  value={showAccount}
                  onValueChange={handleShowAccount}
                  trackColor={{ false: '#333', true: '#ffd700' }}
                  thumbColor={showAccount ? '#fff' : '#666'}
                />
              )}
            </View>
          ))}

          {/* About */}
          {renderSection('Giới thiệu', (
            <View style={styles.settingsList}>
              <View style={styles.socialLinks}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLink('TikTok')}
                >
                  <Ionicons name="logo-tiktok" size={20} color="#fff" />
                  <Text style={styles.socialText}>TikTok</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLink('Instagram')}
                >
                  <Ionicons name="logo-instagram" size={20} color="#fff" />
                  <Text style={styles.socialText}>Instagram</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLink('Twitter')}
                >
                  <Ionicons name="logo-twitter" size={20} color="#fff" />
                  <Text style={styles.socialText}>X (Twitter)</Text>
                </TouchableOpacity>
              </View>
              {renderSettingItem('share-outline', 'Chia sẻ Locket', undefined, handleShareLocket)}
              {renderSettingItem('star-outline', 'Đánh giá Locket', undefined, handleRateLocket)}
              {renderSettingItem('document-text-outline', 'Điều khoản dịch vụ', undefined, handleTermsOfService)}
              {renderSettingItem('shield-outline', 'Chính sách quyền riêng tư', undefined, handlePrivacyPolicy)}
            </View>
          ))}

          {/* Danger Zone */}
          {renderSection('Vùng nguy hiểm', (
            <View style={styles.settingsList}>
              {renderSettingItem('trash-outline', 'Xóa tài khoản', undefined, handleDeleteAccount, undefined, true)}
              {renderSettingItem('log-out-outline', 'Đăng xuất', undefined, handleLogout, undefined, true)}
            </View>
          ))}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
        <AddWidgetPromptModal
          visible={isAddWidgetPromptVisible}
          onClose={closeAddWidgetPrompt}
          onConfirm={confirmAddWidget}
          loading={isLaunchingWidgetPrompt}
        />
        <Modal
          visible={changeEmailModalVisible}
          animationType="slide"
          transparent
          onRequestClose={closeChangeEmailModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Thay đổi email</Text>
              <Text style={styles.inputLabel}>Email mới</Text>
              <TextInput
                value={changeEmailValue}
                onChangeText={setChangeEmailValue}
                placeholder="nhap.email@moi.com"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.modalInput}
                placeholderTextColor="#666"
                editable={!changingEmail}
              />
              <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
              <View style={styles.modalInputWrapper}>
                <TextInput
                  value={changeEmailPassword}
                  onChangeText={setChangeEmailPassword}
                  placeholder="Nhập mật khẩu"
                  secureTextEntry={!showChangeEmailPassword}
                  style={styles.modalInput}
                  placeholderTextColor="#666"
                  editable={!changingEmail}
                />
                <TouchableOpacity
                  style={styles.modalEyeButton}
                  onPress={() => setShowChangeEmailPassword((prev) => !prev)}
                  disabled={changingEmail}
                >
                  <Ionicons
                    name={showChangeEmailPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={changingEmail ? '#555' : '#999'}
                  />
                </TouchableOpacity>
              </View>
              {changeEmailError ? (
                <Text style={styles.modalErrorText}>{changeEmailError}</Text>
              ) : null}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={closeChangeEmailModal}
                  disabled={changingEmail}
                >
                  <Text style={styles.modalButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalPrimaryButton, changingEmail && styles.modalButtonDisabled]}
                  onPress={handleSubmitChangeEmail}
                  disabled={changingEmail}
                >
                  {changingEmail ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={[styles.modalButtonText, styles.modalPrimaryButtonText]}>Lưu</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          visible={changePasswordModalVisible}
          animationType="slide"
          transparent
          onRequestClose={closeChangePasswordModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Thay đổi mật khẩu</Text>
              <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
              <View style={styles.modalInputWrapper}>
                <TextInput
                  value={currentPasswordValue}
                  onChangeText={setCurrentPasswordValue}
                  placeholder="Nhập mật khẩu hiện tại"
                  secureTextEntry={!showCurrentPassword}
                  style={styles.modalInput}
                  placeholderTextColor="#666"
                  editable={!changingPassword}
                />
                <TouchableOpacity
                  style={styles.modalEyeButton}
                  onPress={() => setShowCurrentPassword((prev) => !prev)}
                  disabled={changingPassword}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={changingPassword ? '#555' : '#999'}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.inputLabel}>Mật khẩu mới</Text>
              <View style={styles.modalInputWrapper}>
                <TextInput
                  value={newPasswordValue}
                  onChangeText={setNewPasswordValue}
                  placeholder="Nhập mật khẩu mới"
                  secureTextEntry={!showNewPassword}
                  style={styles.modalInput}
                  placeholderTextColor="#666"
                  editable={!changingPassword}
                />
                <TouchableOpacity
                  style={styles.modalEyeButton}
                  onPress={() => setShowNewPassword((prev) => !prev)}
                  disabled={changingPassword}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={changingPassword ? '#555' : '#999'}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
              <View style={styles.modalInputWrapper}>
                <TextInput
                  value={confirmPasswordValue}
                  onChangeText={setConfirmPasswordValue}
                  placeholder="Nhập lại mật khẩu mới"
                  secureTextEntry={!showConfirmPassword}
                  style={styles.modalInput}
                  placeholderTextColor="#666"
                  editable={!changingPassword}
                />
                <TouchableOpacity
                  style={styles.modalEyeButton}
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  disabled={changingPassword}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={changingPassword ? '#555' : '#999'}
                  />
                </TouchableOpacity>
              </View>
              {changePasswordError ? (
                <Text style={styles.modalErrorText}>{changePasswordError}</Text>
              ) : null}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={closeChangePasswordModal}
                  disabled={changingPassword}
                >
                  <Text style={styles.modalButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalPrimaryButton, changingPassword && styles.modalButtonDisabled]}
                  onPress={handleSubmitChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={[styles.modalButtonText, styles.modalPrimaryButtonText]}>Lưu</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#ffd700',
    borderRadius: 55,
    padding: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
  },
  avatarLoading: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editProfileTextDisabled: {
    opacity: 0.5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  editProfileText: {
    fontSize: 14,
    color: '#ffd700',
    textDecorationLine: 'underline',
  },
  upgradeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  upgradeEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  upgradeSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  inviteSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 20,
  },
  inviteContent: {
    flex: 1,
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  inviteLink: {
    fontSize: 14,
    color: '#ffd700',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  settingsList: {
    backgroundColor: '#111',
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  dangerText: {
    color: '#ff4444',
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  socialButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  socialText: {
    fontSize: 12,
    color: '#fff',
    marginTop: 5,
  },
  bottomSpacing: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingRight: 44,
    color: '#fff',
  },
  modalInputWrapper: {
    position: 'relative',
  },
  modalEyeButton: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  modalErrorText: {
    color: '#ff6b6b',
    marginTop: 10,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginHorizontal: 4,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalPrimaryButton: {
    backgroundColor: '#ffd700',
    borderColor: '#ffd700',
  },
  modalPrimaryButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
});
