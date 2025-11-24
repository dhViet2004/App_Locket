import { Text, View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { resetPasswordApi } from "../../src/api/services/auth.service";

export default function ForgotPasswordOTPScreen() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const { email, type } = useLocalSearchParams<{ email?: string; type?: string }>();

  useEffect(() => {
    console.log("🟢 [FORGOT PASSWORD OTP] Màn hình nhập OTP đã được mở");
    console.log("🟢 [FORGOT PASSWORD OTP] Email nhận OTP:", email);
    console.log("🟢 [FORGOT PASSWORD OTP] Loại OTP:", type || "email");
    console.log("🟢 [FORGOT PASSWORD OTP] API /api/auth/send-otp đã được gọi thành công trước đó");
  }, [email, type]);

  const handleVerifyOtp = async () => {
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

    // Kiểm tra OTP hợp lệ và hiển thị form nhập mật khẩu
    // Không cần verify OTP riêng, sẽ verify khi reset password
    setOtpVerified(true);
    setError(null);
  };

  const handleResetPassword = async () => {
    const trimmedOtp = otp.trim();
    const trimmedPassword = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setError("Mã OTP không hợp lệ");
      return;
    }

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

    if (!email) {
      setError("Thông tin không hợp lệ. Vui lòng thử lại.");
      return;
    }

    setLoading(true);
    setError(null);

    console.log("🔵 [FORGOT PASSWORD OTP] Bắt đầu đặt lại mật khẩu");
    console.log("🔵 [FORGOT PASSWORD OTP] Gọi API: POST /api/auth/reset-password");
    console.log("🔵 [FORGOT PASSWORD OTP] Request body:", { 
      identifier: email, 
      code: trimmedOtp,
      newPassword: "***" // Không log password thực tế
    });

    try {
      const response = await resetPasswordApi({
        identifier: email,
        code: trimmedOtp,
        newPassword: trimmedPassword,
      });
      
      console.log("✅ [FORGOT PASSWORD OTP] API gọi thành công!");
      console.log("✅ [FORGOT PASSWORD OTP] Response:", JSON.stringify(response, null, 2));
      
      // Hiển thị modal thành công với animation
      setShowSuccessModal(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (err) {
      console.error("❌ [FORGOT PASSWORD OTP] Lỗi khi gọi API:", err);
      let message = "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
      let isExpired = false;
      
      if (isAxiosError(err)) {
        const errorMessage = (err.response?.data as { message?: string })?.message;
        console.error("❌ [FORGOT PASSWORD OTP] Error response:", err.response?.data);
        console.error("❌ [FORGOT PASSWORD OTP] Error status:", err.response?.status);
        
        // Kiểm tra nếu OTP hết hạn
        if (errorMessage && (
          errorMessage.toLowerCase().includes("expired") ||
          errorMessage.toLowerCase().includes("invalid or expired")
        )) {
          isExpired = true;
          message = "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.";
          setIsOtpExpired(true);
        } else {
          message = errorMessage ?? message;
          setIsOtpExpired(false);
        }
        
        // Nếu OTP không hợp lệ hoặc hết hạn, reset lại trạng thái
        if (err.response?.status === 400) {
          setOtpVerified(false);
          setOtp(""); // Xóa OTP cũ
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      
      setError(message);
      
      // Hiển thị alert với thông báo rõ ràng hơn nếu OTP hết hạn
      if (isExpired) {
        Alert.alert(
          "Mã OTP đã hết hạn",
          "Mã OTP của bạn đã hết hạn. Vui lòng yêu cầu mã mới để tiếp tục.",
          [
            {
              text: "Yêu cầu mã mới",
              onPress: () => {
                if (email) {
                  router.push({
                    pathname: "/login/forgot-password",
                    params: { email },
                  } as any);
                }
              },
            },
            {
              text: "Đóng",
              style: "cancel",
            },
          ]
        );
      } else {
        Alert.alert("Lỗi", message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isOtpValid = otp.trim().length === 6;
  const isPasswordFormValid = 
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
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/login/forgot-password");
              }
            }}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>
            {otpVerified ? "Đặt lại mật khẩu" : "Nhập mã OTP"}
          </Text>
          <Text style={styles.subtitle}>
            {otpVerified
              ? "Vui lòng nhập mật khẩu mới của bạn"
              : email
              ? `Chúng tôi đã gửi mã OTP đến email ${email}. Vui lòng kiểm tra hộp thư của bạn.`
              : "Chúng tôi đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra hộp thư của bạn."}
          </Text>

          {error && (
            <View style={[
              styles.errorContainer,
              isOtpExpired && styles.errorContainerExpired
            ]}>
              <Text style={styles.errorText}>
                {isOtpExpired ? "⏰ " : ""}{error}
              </Text>
            </View>
          )}

          {!otpVerified ? (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="Mã OTP"
                  placeholderTextColor="#999999"
                  value={otp}
                  onChangeText={(value) => {
                    if (error) {
                      setError(null);
                      setIsOtpExpired(false);
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
                style={[
                  styles.resendButton,
                  isOtpExpired && styles.resendButtonExpired
                ]}
                onPress={() => {
                  if (email) {
                    setError(null);
                    setIsOtpExpired(false);
                    router.push({
                      pathname: "/login/forgot-password",
                      params: { email },
                    } as any);
                  }
                }}
                disabled={loading}
              >
                <Text style={[
                  styles.resendButtonText,
                  isOtpExpired && styles.resendButtonTextExpired
                ]}>
                  {isOtpExpired ? "🔄 " : ""}Gửi lại mã
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu mới"
                  placeholderTextColor="#999999"
                  value={newPassword}
                  onChangeText={(value) => {
                    if (error) {
                      setError(null);
                    }
                    setNewPassword(value);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
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
                  onChangeText={(value) => {
                    if (error) {
                      setError(null);
                    }
                    setConfirmPassword(value);
                  }}
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

              <TouchableOpacity 
                style={styles.backToOtpButton}
                onPress={() => {
                  setOtpVerified(false);
                  setNewPassword("");
                  setConfirmPassword("");
                  setError(null);
                }}
                disabled={loading}
              >
                <Text style={styles.backToOtpButtonText}>← Quay lại nhập OTP</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {!otpVerified ? (
            <TouchableOpacity
              style={[
                styles.verifyButton,
                isOtpValid ? styles.verifyButtonActive : styles.verifyButtonInactive,
              ]}
              onPress={handleVerifyOtp}
              disabled={!isOtpValid || loading}
            >
              <Text style={styles.verifyButtonText}>Tiếp tục</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.resetButton,
                isPasswordFormValid ? styles.resetButtonActive : styles.resetButtonInactive,
              ]}
              onPress={handleResetPassword}
              disabled={!isPasswordFormValid}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.resetButtonText}>Đặt lại mật khẩu</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => {}}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            // Không cho phép đóng modal bằng cách tap vào overlay
            // User phải nhấn nút "Đăng nhập"
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Thành công!</Text>
            <Text style={styles.successMessage}>
              Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                // Reset animation trước khi đóng modal
                fadeAnim.setValue(0);
                scaleAnim.setValue(0.8);
                setShowSuccessModal(false);
                router.replace("/login");
              }}
            >
              <Text style={styles.successButtonText}>Đăng nhập</Text>
            </TouchableOpacity>
          </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  otpInput: {
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
  resendButton: {
    alignSelf: "center",
    marginBottom: 20,
  },
  resendButtonText: {
    color: "#FFD700",
    fontSize: 14,
  },
  backToOtpButton: {
    alignSelf: "center",
    marginBottom: 20,
  },
  backToOtpButtonText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderColor: "#333333",
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#00C851",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 50,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "#999999",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  successButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  successButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainerExpired: {
    backgroundColor: "#2A1F1A",
    borderColor: "#FF8800",
  },
  resendButtonExpired: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#2A1F1A",
    borderWidth: 1,
    borderColor: "#FF8800",
  },
  resendButtonTextExpired: {
    color: "#FF8800",
    fontWeight: "600",
  },
});


