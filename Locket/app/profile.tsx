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
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const [widgetChainEnabled, setWidgetChainEnabled] = useState(true);
  const [showAccount, setShowAccount] = useState(true);

  const handleEditProfile = () => {
    // Logic chỉnh sửa profile
    console.log('Edit profile');
  };

  const handleUpgrade = () => {
    // Logic nâng cấp Locket Gold
    console.log('Upgrade to Locket Gold');
  };

  const handleInviteFriends = () => {
    // Logic mời bạn bè
    console.log('Invite friends');
  };

  const handleEditName = () => {
    // Logic sửa tên
    console.log('Edit name');
  };

  const handleChangeEmail = () => {
    // Logic thay đổi email
    console.log('Change email');
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
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', onPress: () => console.log('Logout') }
      ]
    );
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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ & Cài đặt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://res.cloudinary.com/dh1o42tjk/image/upload/v1761231281/taskmanagement/avatars/a0hsc7oncibdgnvhbgbp.jpg' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>Hoang Viet</Text>
          <TouchableOpacity onPress={handleEditProfile}>
            <Text style={styles.editProfileText}>Chỉnh ảnh</Text>
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
              <Text style={styles.inviteLink}>locket.com/vietxyz</Text>
            </View>
            <Ionicons name="share-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Widget Settings */}
        {renderSection('Thiết lập Tiện ích', (
          <View style={styles.settingsList}>
            {renderSettingItem('add-outline', 'Thêm Tiện ích', undefined, handleEditProfile)}
            {renderSettingItem('help-circle-outline', 'Cách thêm tiện ích', undefined, handleEditProfile)}
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
            {renderSettingItem('person-outline', 'Sửa tên', 'Hoang Viet', handleEditName)}
            {renderSettingItem('mail-outline', 'Thay đổi địa chỉ email', 'dviet037@gmail.com', handleChangeEmail)}
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
});
