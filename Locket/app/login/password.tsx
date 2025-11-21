import { Text, View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useLoginForm } from "../../src/context/LoginContext";
import { useAuth } from "../../src/context/AuthContext";

export default function LoginPasswordScreen() {
  const { identifier, reset: resetLoginForm } = useLoginForm();
  const { user, login, loading, clearError, error } = useAuth();
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!identifier.trim()) {
      router.replace("/login");
    }
  }, [identifier]);

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  useEffect(() => {
    if (user) {
      router.replace("/home");
    }
  }, [user]);

  const handleLogin = () => {
    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();

    if (!trimmedIdentifier) {
      setFormError("Vui lòng nhập email hoặc tên đăng nhập");
      router.replace("/login");
      return;
    }

    if (!trimmedPassword) {
      setFormError("Vui lòng nhập mật khẩu");
      return;
    }

    login(trimmedIdentifier, trimmedPassword)
      .then(() => {
        resetLoginForm();
        setPassword("");
        setFormError(null);
        router.replace("/home");
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Đăng nhập thất bại. Vui lòng thử lại.";
        setFormError(message);
        Alert.alert("Đăng nhập thất bại", message);
      });
  };

  const handlePasswordChange = (value: string) => {
    if (formError) {
      setFormError(null);
    }
    if (error) {
      clearError();
    }

    setPassword(value);
  };

  const isFormValid = password.trim().length > 0;

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
        <Text style={styles.title}>Nhập mật khẩu</Text>
        {identifier ? (
          <Text style={styles.subtitle}>Tài khoản: {identifier}</Text>
        ) : null}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#999999"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
        </View>

        {!!formError && <Text style={styles.errorText}>{formError}</Text>}

        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => router.push("/login/forgot-password")}
        >
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.loginButton,
            isFormValid ? styles.loginButtonActive : styles.loginButtonInactive,
            loading && styles.loginButtonDisabled,
          ]}
          onPress={handleLogin}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
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
    marginBottom: 40,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#FFD700',
    fontSize: 14,
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
  loginButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  loginButtonActive: {
    backgroundColor: '#FFD700',
  },
  loginButtonInactive: {
    backgroundColor: '#333333',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});
