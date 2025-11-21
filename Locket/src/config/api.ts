import { Platform } from 'react-native';

const DEFAULT_IOS_URL = 'http://127.0.0.1:4000/api';
const DEFAULT_ANDROID_URL = 'http://10.0.2.2:4000/api';

const envUrl = Platform.select({
  android:
    process.env.EXPO_PUBLIC_ANDROID_API_URL ?? process.env.EXPO_PUBLIC_API_URL,
  ios: process.env.EXPO_PUBLIC_API_URL,
  web: process.env.EXPO_PUBLIC_API_URL,
  default: process.env.EXPO_PUBLIC_API_URL,
});

export const API_BASE_URL =
  envUrl ??
  (Platform.OS === 'android' ? DEFAULT_ANDROID_URL : DEFAULT_IOS_URL);


