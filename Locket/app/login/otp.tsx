import { Text, View, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useState } from "react";

export default function LoginOTPScreen() {
  const [otp, setOtp] = useState("");

  const handleVerify = () => {
    if (otp.trim()) {
      // Navigate to main app
      router.replace("/home");
    }
  };

  const isFormValid = otp.trim();

  return (
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
        <Text style={styles.title}>Nhập mã xác thực</Text>
        <Text style={styles.subtitle}>Chúng tôi đã gửi mã xác thực đến số điện thoại của bạn</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mã xác thực"
            placeholderTextColor="#999999"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
        </View>

        <TouchableOpacity style={styles.resendButton}>
          <Text style={styles.resendButtonText}>Gửi lại mã</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.verifyButton, isFormValid ? styles.verifyButtonActive : styles.verifyButtonInactive]}
          onPress={handleVerify}
          disabled={!isFormValid}
        >
          <Text style={styles.verifyButtonText}>Xác thực</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
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
    textAlign: 'center',
    letterSpacing: 2,
  },
  resendButton: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  resendButtonText: {
    color: '#FFD700',
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  verifyButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  verifyButtonActive: {
    backgroundColor: '#FFD700',
  },
  verifyButtonInactive: {
    backgroundColor: '#333333',
  },
  verifyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});
