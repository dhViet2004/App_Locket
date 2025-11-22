import { Text, View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useState } from "react";
import axios from "axios";
import { sendOtpApi } from "../../src/api/services/auth.service";

export default function LoginPhoneScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizePhoneNumber = (value: string) => {
    const digitsOnly = value.replace(/[^\d+]/g, "");
    if (!digitsOnly) return "";
    if (digitsOnly.startsWith("+")) {
      return digitsOnly;
    }
    const withoutLeadingZero = digitsOnly.replace(/^0+/, "");
    return `+84${withoutLeadingZero}`;
  };

  const handleContinue = async () => {
    const trimmed = phoneNumber.trim();
    if (!trimmed) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }

    const identifier = normalizePhoneNumber(trimmed);
    if (!identifier) {
      setError("Số điện thoại không hợp lệ");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await sendOtpApi({ identifier });
      router.push({
        pathname: "/login/otp",
        params: {
          identifier,
          type: response.data.type,
          displayIdentifier: trimmed,
        },
      });
    } catch (err) {
      let message = "Không thể gửi mã OTP. Vui lòng thử lại.";
      if (axios.isAxiosError(err)) {
        message = (err.response?.data as { message?: string })?.message ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    if (error) {
      setError(null);
    }
    setPhoneNumber(value);
  };

  const isFormValid = phoneNumber.trim().length > 0 && !loading;

  return (
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
          <Text style={styles.title}>Số điện thoại của bạn là gì?</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.countryCodeContainer}>
              <Text style={styles.countryFlag}>🇻🇳</Text>
              <Text style={styles.countryCode}>+84</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              placeholderTextColor="#999999"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              autoFocus
            />
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity 
            style={styles.emailButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.emailButtonText}>Sử dụng email thay cho cách này</Text>
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
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.continueButtonText}>Tiếp tục →</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    padding: 0,
  },
  errorText: {
    color: '#FF4D4F',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  emailButton: {
    alignSelf: 'center',
    marginTop: 20,
  },
  emailButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginBottom: 20,
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
});
