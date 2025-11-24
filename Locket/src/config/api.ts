import { NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';

const DEFAULT_PORT = process.env.EXPO_PUBLIC_API_PORT ?? '4000';
const DEFAULT_PATH = process.env.EXPO_PUBLIC_API_PATH ?? '/api';
const DEFAULT_IOS_URL = `http://127.0.0.1:${DEFAULT_PORT}${DEFAULT_PATH}`;
const DEFAULT_ANDROID_URL = `http://10.0.2.2:${DEFAULT_PORT}${DEFAULT_PATH}`;

const envUrl = Platform.select({
  android: process.env.EXPO_PUBLIC_ANDROID_API_URL ?? process.env.EXPO_PUBLIC_API_URL,
  ios: process.env.EXPO_PUBLIC_IOS_API_URL ?? process.env.EXPO_PUBLIC_API_URL,
  web: process.env.EXPO_PUBLIC_WEB_API_URL ?? process.env.EXPO_PUBLIC_API_URL,
  default: process.env.EXPO_PUBLIC_API_URL,
});

const isLoopbackHost = (host: string | undefined | null) =>
  !host || host === 'localhost' || host === '127.0.0.1';

const normalizePath = (path: string) => (path.startsWith('/') ? path : `/${path}`);

const buildUrl = (host: string) =>
  host.startsWith('http')
    ? `${host}${normalizePath(DEFAULT_PATH)}`
    : `http://${host}:${DEFAULT_PORT}${normalizePath(DEFAULT_PATH)}`;

const sanitizeHost = (candidate?: string | null) => {
  if (!candidate) return null;
  const withoutProtocol = candidate.replace(/^[a-zA-Z]+:\/\//, '');
  const withoutPath = withoutProtocol.split(/[/?]/)[0];
  const host = withoutPath?.split(':')[0];
  return host && !isLoopbackHost(host) ? host : null;
};

const getHostFromConstants = () => {
  const expoConfig = Constants.expoConfig as
    | (typeof Constants.expoConfig & { debuggerHost?: string })
    | undefined;

  const candidates = [
    sanitizeHost(expoConfig?.hostUri),
    sanitizeHost(expoConfig?.debuggerHost),
    sanitizeHost((Constants as any).manifest?.debuggerHost),
    sanitizeHost((Constants as any).manifest2?.extra?.expoGo?.developer?.host),
  ];

  return candidates.find(Boolean) ?? null;
};

const getHostFromSourceCode = () => {
  const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
  if (!scriptURL) return null;
  return sanitizeHost(scriptURL.replace(/^https?:\/\//, ''));
};

const rewriteLoopbackForAndroid = (url: string | null | undefined) => {
  if (!url || Platform.OS !== 'android') return url ?? null;

  try {
    const parsed = new URL(url);
    if (!isLoopbackHost(parsed.hostname)) {
      return url;
    }

    const port = parsed.port || DEFAULT_PORT;
    const pathname = normalizePath(parsed.pathname === '/' ? DEFAULT_PATH : parsed.pathname);
    const search = parsed.search ?? '';

    return `http://10.0.2.2:${port}${pathname}${search}`;
  } catch {
    return url;
  }
};

const getDevServerUrl = () => {
  if (!__DEV__) return null;
  const host = getHostFromConstants() ?? getHostFromSourceCode();
  return host ? buildUrl(host) : null;
};

export const API_BASE_URL =
  rewriteLoopbackForAndroid(envUrl) ??
  rewriteLoopbackForAndroid(getDevServerUrl()) ??
  (Platform.OS === 'android' ? DEFAULT_ANDROID_URL : DEFAULT_IOS_URL);

