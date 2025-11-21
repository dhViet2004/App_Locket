import { Text, View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { verifyOtpApi } from "../../src/api/services/auth.service";

export default function ForgotPasswordOTPScreen() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { email, type } = useLocalSearchParams<{ email?: string; type?: string }>();

  useEffect(() => {
    console.log("🟢 [FORGOT PASSWORD OTP] Màn hình nhập OTP đã được mở");
    console.log("🟢 [FORGOT PASSWORD OTP] Email nhận OTP:", email);
    console.log("🟢 [FORGOT PASSWORD OTP] Loại OTP:", type || "email");
    console.log("🟢 [FORGOT PASSWORD OTP] API /api/auth/send-otp đã được gọi thành công trước đó");
  }, [email, type]);

  const handleVerify = async () => {
    const trimmedOtp = otp.trim();
    
    if (!trimmedOtp) {
      setError("Vui lòng nhập mã OTP");
      return;
    }

    if (trimmedOtp.length !== 6) {
      setError("Mã OTP phải có 6 chữ số");
      return;
    }

    if (!email) {
      setError("Thông tin không hợp lệ. Vui lòng thử lại.");
      return;
    }

    setLoading(true);
    setError(null);

    console.log("🔵 [FORGOT PASSWORD OTP] Bắt đầu xác thực OTP");
    console.log("🔵 [FORGOT PASSWORD OTP] Gọi API: POST /api/auth/verify-otp");
    console.log("🔵 [FORGOT PASSWORD OTP] Request body:", { identifier: email, code: trimmedOtp });

    try {
      const response = await verifyOtpApi({
        identifier: email,
        code: trimmedOtp,
      });
      
      console.log("✅ [FORGOT PASSWORD OTP] API gọi thành công!");
      console.log("✅ [FORGOT PASSWORD OTP] Response:", JSON.stringify(response, null, 2));
      console.log("✅ [FORGOT PASSWORD OTP] Chuyển sang màn hình đặt lại mật khẩu");
      
      router.push({
        pathname: "/login/reset-password",
        params: { 
          email: email,
          code: trimmedOtp,
        },
      } as any);
    } catch (err) {
      console.error("❌ [FORGOT PASSWORD OTP] Lỗi khi gọi API:", err);
      let message = "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.";
      if (isAxiosError(err)) {
        const errorMessage = (err.response?.data as { message?: string })?.message;
        console.error("❌ [FORGOT PASSWORD OTP] Error response:", err.response?.data);
        console.error("❌ [FORGOT PASSWORD OTP] Error status:", err.response?.status);
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
        <Text style={styles.title}>Nhập mã OTP</Text>
        <Text style={styles.subtitle}>
          {email
            ? `Chúng tôi đã gửi mã OTP đến email ${email}. Vui lòng kiểm tra hộp thư của bạn.`
            : "Chúng tôi đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra hộp thư của bạn."}
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mã OTP"
            placeholderTextColor="#999999"
            value={otp}
            onChangeText={(value) => {
              if (error) {
                setError(null);
              }
              setOtp(value);
            }}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            editable={!loading}
          />
        </View>

        <TouchableOpacity 
          style={styles.resendButton}
          onPress={() => {
            if (email) {
              router.push({
                pathname: "/login/forgot-password",
                params: { email },
              } as any);
            }
          }}
          disabled={loading}
        >
          <Text style={styles.resendButtonText}>Gửi lại mã</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.verifyButton,
            isFormValid ? styles.verifyButtonActive : styles.verifyButtonInactive,
          ]}
          onPress={handleVerify}
          disabled={!isFormValid || loading}
        >
          {loading ? (
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
    backgroundColor: "#000000",
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
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#999999",
    marginBottom: 40,
    textAlign: "center",
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: "#2A1A1A",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FF4444",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1A1A1A",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#333333",
    textAlign: "center",
    letterSpacing: 2,
  },
  resendButton: {
    alignSelf: "center",
    marginBottom: 20,
  },
  resendButtonText: {
    color: "#FFD700",
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
    alignItems: "center",
  },
  verifyButtonActive: {
    backgroundColor: "#FFD700",
  },
  verifyButtonInactive: {
    backgroundColor: "#333333",
  },
  verifyButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
});


