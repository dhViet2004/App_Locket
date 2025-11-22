import { Text, View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { sendOtpApi, verifyOtpApi } from "../../src/api/services/auth.service";
import { useAuth } from "../../src/context/AuthContext";

export default function LoginOTPScreen() {
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const params = useLocalSearchParams<{ identifier?: string; type?: string; displayIdentifier?: string }>();
  const { setAuthState } = useAuth();

  const identifier = useMemo(() => (typeof params.identifier === "string" ? params.identifier : ""), [params.identifier]);
  const displayIdentifier = useMemo(
    () => (typeof params.displayIdentifier === "string" ? params.displayIdentifier : identifier),
    [params.displayIdentifier, identifier]
  );
  const otpType = typeof params.type === "string" ? params.type : undefined;

  useEffect(() => {
    if (!identifier) {
      router.replace("/login/phone");
    }
  }, [identifier]);

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleVerify = async () => {
    const code = otp.trim();

    if (!identifier) {
      setError("Không tìm thấy số điện thoại. Vui lòng thử lại.");
      router.replace("/login/phone");
      return;
    }

    if (code.length !== 6) {
      setError("Mã OTP phải gồm 6 chữ số");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const response = await verifyOtpApi({ identifier, code });
      setAuthState(response.data);
      router.replace("/home");
    } catch (err) {
      let message = "Xác thực thất bại. Vui lòng thử lại.";
      if (axios.isAxiosError(err)) {
        message = (err.response?.data as { message?: string })?.message ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      Alert.alert("Lỗi", message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!identifier || resendCountdown > 0) return;
    setResendLoading(true);
    setError(null);
    try {
      await sendOtpApi({ identifier });
      setResendCountdown(60);
    } catch (err) {
      let message = "Không thể gửi lại mã. Vui lòng thử lại.";
      if (axios.isAxiosError(err)) {
        message = (err.response?.data as { message?: string })?.message ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      Alert.alert("Lỗi", message);
    } finally {
      setResendLoading(false);
    }
  };

  const isFormValid = otp.trim().length === 6 && !verifying;
  const resendDisabled = resendCountdown > 0 || resendLoading;

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
        <Text style={styles.subtitle}>
          Chúng tôi đã gửi mã xác thực đến{" "}
          <Text style={styles.highlightText}>
            {otpType === "email" ? "email" : "số điện thoại"} {displayIdentifier || ""}
          </Text>
        </Text>
        
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

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.resendButton} onPress={handleResend} disabled={resendDisabled}>
          <Text style={[styles.resendButtonText, resendDisabled && styles.resendButtonDisabledText]}>
            {resendLoading
              ? "Đang gửi lại..."
              : resendCountdown > 0
              ? `Gửi lại mã sau ${resendCountdown}s`
              : "Gửi lại mã"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.verifyButton,
            isFormValid ? styles.verifyButtonActive : styles.verifyButtonInactive,
            verifying && styles.verifyButtonDisabled,
          ]}
          onPress={handleVerify}
          disabled={!isFormValid}
        >
          {verifying ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.verifyButtonText}>Xác thực</Text>
          )}
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
  resendButtonDisabledText: {
    color: '#777777',
  },
  errorText: {
    color: '#FF4D4F',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
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
  verifyButtonDisabled: {
    opacity: 0.8,
  },
  verifyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  highlightText: {
    color: '#FFD700',
    fontWeight: '600',
  },
});
