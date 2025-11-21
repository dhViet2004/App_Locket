import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RegisterProvider } from "../src/context/RegisterContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RegisterProvider>
          <Stack
            screenOptions={{
              navigationBarColor: '#000000',
              statusBarStyle: 'light',
              statusBarBackgroundColor: '#000000',
            }}
          >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          navigationBarColor: '#000000',
          statusBarStyle: 'light',
          statusBarBackgroundColor: '#000000'
        }} 
      />
      <Stack.Screen 
        name="register/email" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="register/password" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="register/name" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="register/username" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="login/password" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="login/phone" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="login/otp" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="login/forgot-password" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="login/forgot-password-otp" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="photo-preview" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="home" 
        options={{ 
          headerShown: false,
          navigationBarColor: '#000000',
          statusBarStyle: 'light',
          statusBarBackgroundColor: '#000000'
        }} 
      />
      <Stack.Screen 
        name="messages" 
        options={{ 
          headerShown: false,
          navigationBarColor: '#000000',
          statusBarStyle: 'light',
          statusBarBackgroundColor: '#000000'
        }} 
      />
      </Stack>
        </RegisterProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
