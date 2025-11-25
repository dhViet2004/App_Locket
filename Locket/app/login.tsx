import { useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLoginForm } from "../src/context/LoginContext";
import { useAuth } from "../src/context/AuthContext";

export default function LoginScreen() {
  const { identifier, setIdentifier } = useLoginForm();
  const { user, isAccountLocked, logout } = useAuth();
  const [showLockedModal, setShowLockedModal] = useState(false);

  useEffect(() => {
    if (user && !isAccountLocked) {
      router.replace("/home");
    }
  }, [user, isAccountLocked]);

  useEffect(() => {
    if (isAccountLocked) {
      setShowLockedModal(true);
    }
  }, [isAccountLocked]);

  const handleContactSupport = () => {
    // TODO: Navigate to support page or open email
    setShowLockedModal(false);
    logout();
    router.replace("/login");
  };

  const handleLogout = async () => {
    await logout();
    setShowLockedModal(false);
    router.replace("/login");
  };

  const handleContinue = () => {
    const value = identifier.trim();
    if (!value) return;
    setIdentifier(value);
    router.push("/login/password");
  };

  const handleUsePhone = () => {
    // Navigate to phone login
    router.push("/login/phone");
  };

  const isFormValid = identifier.trim().length > 0;

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
        <StatusBar style="light" backgroundColor="#000000" />

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
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
            <Text style={styles.title}>Email của bạn là gì?</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Địa chỉ email"
                placeholderTextColor="#999999"
                value={identifier}
                onChangeText={setIdentifier}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={styles.phoneButton}
              onPress={handleUsePhone}
            >
              <Text style={styles.phoneButtonText}>Sử dụng số điện thoại</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.legalText}>
              Bằng cách nhấn vào nút Tiếp tục, bạn đồng ý với chúng tôi{" "}
              <Text style={styles.legalLink}>Điều khoản dịch vụ</Text> và{" "}
              <Text style={styles.legalLink}>Chính sách quyền riêng tư</Text>
            </Text>

            <TouchableOpacity
              style={[styles.continueButton, isFormValid ? styles.continueButtonActive : styles.continueButtonInactive]}
              onPress={handleContinue}
              disabled={!isFormValid}
            >
              <Text style={styles.continueButtonText}>Tiếp tục →</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Account Locked Modal */}
        <Modal
          visible={showLockedModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => { }}
        >
          <View style={styles.lockedModalOverlay}>
            <View style={styles.lockedModalContent}>
              <View style={styles.lockedIconContainer}>
                <Text style={styles.lockedIcon}>🔒</Text>
              </View>

              <Text style={styles.lockedTitle}>Tài khoản đã bị khóa</Text>
              <Text style={styles.lockedMessage}>
                Tài khoản của bạn đã bị khóa do vi phạm điều khoản sử dụng.
                Vui lòng liên hệ bộ phận hỗ trợ để biết thêm chi tiết.
              </Text>

              <TouchableOpacity
                style={styles.lockedButton}
                onPress={handleContactSupport}
              >
                <Text style={styles.lockedButtonText}>Liên hệ hỗ trợ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.lockedSecondaryButton}
                onPress={handleLogout}
              >
                <Text style={styles.lockedSecondaryButtonText}>Đóng</Text>
              </TouchableOpacity>
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
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  phoneButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  phoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    minHeight: 120,
  },
  legalText: {
    color: '#999999',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  legalLink: {
    color: '#FFD700',
    textDecorationLine: 'underline',
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  continueButtonActive: {
    backgroundColor: '#FFD700',
  },
  continueButtonInactive: {
    backgroundColor: '#333333',
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  // Locked Account Modal Styles
  lockedModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lockedModalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  lockedIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  lockedIcon: {
    fontSize: 40,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  lockedMessage: {
    fontSize: 15,
    color: '#999999',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  lockedButton: {
    backgroundColor: '#FFD700',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    marginBottom: 12,
  },
  lockedButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  lockedSecondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: '100%',
  },
  lockedSecondaryButtonText: {
    color: '#999999',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
