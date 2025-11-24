import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddWidgetPromptModal } from "../../src/components/AddWidgetPromptModal";
import { useAddWidgetPrompt } from "../../src/hooks/useAddWidgetPrompt";

export default function WidgetScreen() {
  const {
    openAddWidgetPrompt,
    isPromptVisible,
    closePrompt,
    confirmAddWidget,
    isProcessing,
  } = useAddWidgetPrompt();

  const handleAddWidget = () => {
    openAddWidgetPrompt();
  };

  const handleShowGuide = () => {
    router.push("/register/tutorial");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#000000" />
      
        {/* Main Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>
            Cuối cùng, hãy thêm tiện ích vào màn hình chính của bạn
          </Text>
          <Text style={styles.subtitle}>
            Widget của Locket sẽ tự động hiển thị post mới nhất từ bạn bè ngay khi họ đăng, kể cả khi bạn không mở app.
          </Text>

          {/* Phone Illustration */}
          <View style={styles.phoneContainer}>
            <Image 
              source={require('../../assets/images/tienich1.png')}
              style={styles.phoneImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Primary Button */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleAddWidget}>
            <Text style={styles.primaryButtonText}>Thêm Tiện ích →</Text>
          </TouchableOpacity>

          {/* Secondary Link */}
          <TouchableOpacity style={styles.secondaryLink} onPress={handleShowGuide}>
            <Text style={styles.secondaryLinkText}>Hiển thị hướng dẫn</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <AddWidgetPromptModal
        visible={isPromptVisible}
        onClose={closePrompt}
        onConfirm={confirmAddWidget}
        loading={isProcessing}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 44,
    paddingHorizontal: 16,
  },
  phoneContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  phoneImage: {
    width: 250,
    height: 500,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryLink: {
    paddingVertical: 8,
  },
  secondaryLinkText: {
    color: '#FFFFFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
