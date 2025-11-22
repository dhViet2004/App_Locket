import { Text, View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, ScrollView, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRegisterForm } from "../../src/context/RegisterContext";
import { checkEmailApi } from "../../src/api/services/auth.service";

export default function EmailScreen() {
  const { data, setEmail } = useRegisterForm();
  const [email, setEmailInput] = useState(data.email);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check email availability with debounce
  useEffect(() => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset error when email changes
    setEmailError(null);

    // Only check if email is valid format
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      return;
    }

    // Debounce: wait 500ms after user stops typing
    debounceTimerRef.current = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const response = await checkEmailApi(trimmedEmail);
        if (!response.data.available) {
          setEmailError("Email này đã được sử dụng. Vui lòng chọn email khác.");
        } else {
          setEmailError(null);
        }
      } catch (error) {
        // Silently fail - don't show error if API fails
        console.error("Error checking email:", error);
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

  const handleContinue = () => {
    const sanitizedEmail = email.trim().toLowerCase();
    if (isValidEmail(sanitizedEmail) && !emailError) {
      setEmail(sanitizedEmail);
      router.push("/register/password");
    }
  };

  const isEmailValid = isValidEmail(email.trim()) && !emailError && !checkingEmail;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="Địa chỉ email"
                placeholderTextColor="#666666"
                value={email}
                onChangeText={(value) => {
                  setEmailInput(value);
                  setEmailError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
              {checkingEmail && (
                <View style={styles.loadingIndicator}>
                  <ActivityIndicator size="small" color="#FFD700" />
                </View>
              )}
            </View>
            {emailError && (
              <Text style={styles.errorText}>{emailError}</Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.legalText}>
            Bằng cách nhấn vào nút Tiếp tục, bạn đồng ý với chúng tôi{" "}
            <Text style={styles.linkText}>Điều khoản dịch vụ</Text> và{" "}
            <Text style={styles.linkText}>Chính sách quyền riêng tư</Text>
          </Text>
          
          <TouchableOpacity 
            style={[styles.continueButton, isEmailValid ? styles.continueButtonActive : styles.continueButtonInactive]}
            onPress={handleContinue}
            disabled={!isEmailValid}
          >
            <Text style={styles.continueButtonText}>Tiếp tục</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
    lineHeight: 34,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 50,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  loadingIndicator: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  legalText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 24,
  },
  linkText: {
    color: '#FFD700',
    textDecorationLine: 'underline',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
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
    marginRight: 8,
  },
  arrowIcon: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
