import { Text, View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { isAxiosError } from "axios";
import { sendOtpApi, checkEmailApi } from "../../src/api/services/auth.service";

export default function ForgotPasswordEmailScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check email existence with debounce
  useEffect(() => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset states when email changes
    setError(null);
    setEmailExists(null);

    // Only check if email is valid format
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      return;
    }

    // Debounce: wait 500ms after user stops typing
    debounceTimerRef.current = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const response = await checkEmailApi(trimmedEmail);
        // available = false means email is already registered (exists)
        // available = true means email is not registered (doesn't exist)
        const exists = !response.data.available;
        setEmailExists(exists);
        
        if (!exists) {
          setError("Email này chưa được đăng ký. Vui lòng kiểm tra lại.");
        } else {
          setError(null);
        }
      } catch (error) {
        // Silently fail - don't show error if API fails
        console.error("Error checking email:", error);
        setEmailExists(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [email]);

  const handleSendOtp = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Vui lòng nhập email");
      return;
    }

    if (!isValidEmail(trimmed)) {
      setError("Email không hợp lệ");
      return;
    }

    // Check if email exists before sending OTP
    if (emailExists === false) {
      setError("Email này chưa được đăng ký. Vui lòng kiểm tra lại.");
      return;
    }

    // If still checking, wait a bit
    if (checkingEmail) {
      setError("Đang kiểm tra email...");
      return;
    }

    setLoading(true);
    setError(null);

    console.log("🔵 [FORGOT PASSWORD] Bắt đầu gửi OTP cho email:", trimmed);
    console.log("🔵 [FORGOT PASSWORD] Gọi API: POST /api/auth/send-otp");
    console.log("🔵 [FORGOT PASSWORD] Request body:", { identifier: trimmed });

    try {
      const response = await sendOtpApi({ identifier: trimmed });
      
      console.log("✅ [FORGOT PASSWORD] API gọi thành công!");
      console.log("✅ [FORGOT PASSWORD] Response:", JSON.stringify(response, null, 2));
      console.log("✅ [FORGOT PASSWORD] Chuyển sang màn hình nhập OTP");
      
      router.push({
        pathname: "/login/forgot-password-otp",
        params: { 
          email: trimmed,
          type: response.data.type,
        },
      } as any);
    } catch (err) {
      console.error("❌ [FORGOT PASSWORD] Lỗi khi gọi API:", err);
      let message = "Không thể gửi mã OTP. Vui lòng thử lại.";
      if (isAxiosError(err)) {
        const errorMessage = (err.response?.data as { message?: string })?.message;
        console.error("❌ [FORGOT PASSWORD] Error response:", err.response?.data);
        console.error("❌ [FORGOT PASSWORD] Error status:", err.response?.status);
        message = errorMessage ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    if (error) {
      setError(null);
    }
    setEmail(value);
  };

  const isFormValid = 
    email.trim().length > 0 && 
    isValidEmail(email.trim()) && 
    emailExists === true && 
    !checkingEmail && 
    !loading;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/login");
              }
            }}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Quên mật khẩu</Text>
          <Text style={styles.subtitle}>
            Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                error && emailExists === false && styles.inputError,
              ]}
              placeholder="Địa chỉ email"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              editable={!loading}
            />
            {checkingEmail && (
              <View style={styles.checkingIndicator}>
                <ActivityIndicator size="small" color="#FFD700" />
              </View>
            )}
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              isFormValid ? styles.sendButtonActive : styles.sendButtonInactive,
            ]}
            onPress={handleSendOtp}
            disabled={!isFormValid}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.sendButtonText}>Gửi mã OTP</Text>
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
    backgroundColor: "#000000",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#999999",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
    position: "relative",
  },
  input: {
    backgroundColor: "#1A1A1A",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingRight: 50,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#333333",
  },
  inputError: {
    borderColor: "#FF4D4F",
  },
  checkingIndicator: {
    position: "absolute",
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FF4D4F",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sendButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: "#FFD700",
  },
  sendButtonInactive: {
    backgroundColor: "#333333",
  },
  sendButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
});


