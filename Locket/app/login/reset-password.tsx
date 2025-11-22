import { Text, View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { resetPasswordApi } from "../../src/api/services/auth.service";

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { email, code } = useLocalSearchParams<{ email?: string; code?: string }>();

  useEffect(() => {
    console.log("🟢 [RESET PASSWORD] Màn hình đặt lại mật khẩu đã được mở");
    console.log("🟢 [RESET PASSWORD] Email:", email);
    console.log("🟢 [RESET PASSWORD] OTP Code:", code);
  }, [email, code]);

  const handleResetPassword = async () => {
    const trimmedPassword = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedPassword) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (trimmedPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!trimmedConfirm) {
      setError("Vui lòng xác nhận mật khẩu");
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (!email || !code) {
      setError("Thông tin không hợp lệ. Vui lòng thử lại.");
      return;
    }

    setLoading(true);
    setError(null);

    console.log("🔵 [RESET PASSWORD] Bắt đầu đặt lại mật khẩu");
    console.log("🔵 [RESET PASSWORD] Gọi API: POST /api/auth/reset-password");
    console.log("🔵 [RESET PASSWORD] Request body:", { 
      identifier: email, 
      code: code,
      newPassword: "***" // Không log password thực tế
    });

    try {
      const response = await resetPasswordApi({
        identifier: email,
        code: code,
        newPassword: trimmedPassword,
      });
      
      console.log("✅ [RESET PASSWORD] API gọi thành công!");
      console.log("✅ [RESET PASSWORD] Response:", JSON.stringify(response, null, 2));
      console.log("✅ [RESET PASSWORD] Chuyển sang màn hình đăng nhập");
      
      Alert.alert(
        "Thành công",
        "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.",
        [
          {
            text: "Đăng nhập",
            onPress: () => {
              router.replace("/login");
            },
          },
        ]
      );
    } catch (err) {
      console.error("❌ [RESET PASSWORD] Lỗi khi gọi API:", err);
      let message = "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
      if (isAxiosError(err)) {
        const errorMessage = (err.response?.data as { message?: string })?.message;
        console.error("❌ [RESET PASSWORD] Error response:", err.response?.data);
        console.error("❌ [RESET PASSWORD] Error status:", err.response?.status);
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

  const handlePasswordChange = (value: string) => {
    if (error) {
      setError(null);
    }
    setNewPassword(value);
  };

  const handleConfirmPasswordChange = (value: string) => {
    if (error) {
      setError(null);
    }
    setConfirmPassword(value);
  };

  const isFormValid = 
    newPassword.trim().length >= 6 && 
    confirmPassword.trim().length >= 6 && 
    newPassword.trim() === confirmPassword.trim() && 
    !loading;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
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
          <Text style={styles.title}>Đặt lại mật khẩu</Text>
          <Text style={styles.subtitle}>
            Vui lòng nhập mật khẩu mới của bạn
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu mới"
              placeholderTextColor="#999999"
              value={newPassword}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor="#999999"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.eyeIcon}>{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.resetButton,
              isFormValid ? styles.resetButtonActive : styles.resetButtonInactive,
            ]}
            onPress={handleResetPassword}
            disabled={!isFormValid}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.resetButtonText}>Đặt lại mật khẩu</Text>
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
  keyboardView: {
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
  eyeButton: {
    position: "absolute",
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
  },
  eyeIcon: {
    fontSize: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  resetButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: "center",
  },
  resetButtonActive: {
    backgroundColor: "#FFD700",
  },
  resetButtonInactive: {
    backgroundColor: "#333333",
  },
  resetButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
});

