import { Text, View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, ScrollView, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRegisterForm } from "../../src/context/RegisterContext";
import { checkUsernameApi } from "../../src/api/services/auth.service";

export default function UsernameScreen() {
  const { data, setUsername: persistUsername } = useRegisterForm();
  const [username, setUsername] = useState(data.username);
  const [isValidating, setIsValidating] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check username availability with debounce
  useEffect(() => {
    const trimmedUsername = username.trim().toLowerCase();
    
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset states when username changes
    setIsAvailable(false);
    setUsernameError(null);

    // Only check if username is valid length
    if (!trimmedUsername || trimmedUsername.length < 3) {
      setIsValidating(false);
      return;
    }

    // Debounce: wait 500ms after user stops typing
    setIsValidating(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await checkUsernameApi(trimmedUsername);
        if (response.data.available) {
          setIsAvailable(true);
          setUsernameError(null);
        } else {
          setIsAvailable(false);
          setUsernameError("Tên người dùng này đã được sử dụng. Vui lòng chọn tên khác.");
        }
      } catch (error: any) {
        // Handle API errors
        setIsAvailable(false);
        const errorMessage = error?.response?.data?.message || "Không thể kiểm tra tên người dùng. Vui lòng thử lại.";
        setUsernameError(errorMessage);
        console.error("Error checking username:", error);
      } finally {
        setIsValidating(false);
      }
    }, 500);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [username]);

  const handleUsernameChange = (text: string) => {
    setUsername(text);
  };

  const handleContinue = () => {
    if (isAvailable && username.trim()) {
      const trimmed = username.trim();
      persistUsername(trimmed);
      router.push({
        pathname: "/register/confirmation",
        params: { username: trimmed }
      });
    }
  };

  const isFormValid = isAvailable && username.trim() && !usernameError && !isValidating;

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
          <Text style={styles.title}>Thêm một tên người dùng</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  isAvailable && styles.inputValid,
                  usernameError && styles.inputError
                ]}
                placeholder="Tên người dùng"
                placeholderTextColor="#666666"
                value={username}
                onChangeText={handleUsernameChange}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
              {isValidating && (
                <View style={styles.loadingIndicator}>
                  <ActivityIndicator size="small" color="#FFD700" />
                </View>
              )}
            </View>

            {/* Status Feedback */}
            {isValidating && (
              <View style={styles.statusContainer}>
                <Text style={styles.validatingText}>Đang kiểm tra...</Text>
              </View>
            )}
            
            {isAvailable && !isValidating && (
              <View style={styles.statusContainer}>
                <Text style={styles.heartIcon}>💛</Text>
                <Text style={styles.availableText}>Có sẵn!</Text>
              </View>
            )}

            {username.length > 0 && username.length < 3 && (
              <Text style={styles.errorText}>Tên người dùng phải có ít nhất 3 ký tự</Text>
            )}

            {usernameError && (
              <Text style={styles.errorText}>{usernameError}</Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.continueButton, isFormValid ? styles.continueButtonActive : styles.continueButtonInactive]}
            onPress={handleContinue}
            disabled={!isFormValid}
          >
            <Text style={[styles.continueButtonText, isFormValid ? styles.continueButtonTextActive : styles.continueButtonTextInactive]}>
              Tiếp tục
            </Text>
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
    textAlign: 'center',
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
  inputValid: {
    borderColor: '#FFD700',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  loadingIndicator: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heartIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  availableText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  validatingText: {
    color: '#999999',
    fontSize: 16,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: -10,
    marginBottom: 10,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonActive: {
    backgroundColor: '#FFD700',
  },
  continueButtonInactive: {
    backgroundColor: '#333333',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextActive: {
    color: '#000000',
  },
  continueButtonTextInactive: {
    color: '#666666',
  },
});
