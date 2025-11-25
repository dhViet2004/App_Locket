import React, { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { AuthResponse, AuthUser } from '../types/api.types';
import { loginApi } from '../api/services/auth.service';
import { getUserProfileApi } from '../api/services/user.service';
import { isAxiosError } from 'axios';
import { apiClient } from '../api/client';
import socketService from '../services/socket';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

// Storage helper với fallback cho web
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`[Storage] Error getting ${key}:`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`[Storage] Error setting ${key}:`, error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`[Storage] Error removing ${key}:`, error);
    }
  },
};

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  clearError: () => void;
  setAuthState: (payload: AuthResponse) => void;
  updateUser: (user: AuthUser) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export const DEFAULT_AVATAR_URL =
  'https://res.cloudinary.com/dh1o42tjk/image/upload/v1763984160/user_htt7q6.jpg';

function withDefaultAvatar(user: AuthUser | null): AuthUser | null {
  if (!user) {
    return null;
  }

  if (user.avatarUrl) {
    return user;
  }

  return {
    ...user,
    avatarUrl: DEFAULT_AVATAR_URL,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Bắt đầu với loading = true để restore từ storage
  const [error, setError] = useState<string | null>(null);
  
  // Ref để tránh gọi refreshUser() đồng thời nhiều lần
  const refreshUserPromiseRef = React.useRef<Promise<void> | null>(null);
  
  // Ref để đánh dấu đang trong quá trình logout (tránh restore lại sau logout)
  const isLoggingOutRef = React.useRef(false);
  
  // Restore auth state từ storage khi app khởi động
  useEffect(() => {
    const restoreAuth = async () => {
      // Nếu đang trong quá trình logout, không restore
      if (isLoggingOutRef.current) {
        console.log('[AuthContext] ⏸️ Skipping restore - logout in progress');
        setLoading(false);
        return;
      }
      
      try {
        console.log('[AuthContext] 🔄 Restoring auth from storage...');
        const [storedToken, storedUserJson] = await Promise.all([
          storage.getItem(AUTH_TOKEN_KEY),
          storage.getItem(AUTH_USER_KEY),
        ]);

        if (storedToken) {
          console.log('[AuthContext] ✅ Token found in storage');
          setToken(storedToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${storedToken}`;

          // Nếu có user trong storage, restore ngay
          if (storedUserJson) {
            try {
              const storedUser = JSON.parse(storedUserJson) as AuthUser;
              console.log('[AuthContext] ✅ User found in storage:', storedUser.id);
              setUser(withDefaultAvatar(storedUser));
            } catch (e) {
              console.warn('[AuthContext] ⚠️ Failed to parse stored user:', e);
            }
          }

          // Refresh user từ API để đảm bảo data mới nhất
          try {
            const userResponse = await getUserProfileApi();
            if (userResponse.data) {
              console.log('[AuthContext] ✅ User refreshed from API:', userResponse.data.id);
              setUser(withDefaultAvatar(userResponse.data));
              // Lưu lại user mới vào storage
              await storage.setItem(AUTH_USER_KEY, JSON.stringify(userResponse.data));
            }
          } catch (refreshErr) {
            console.warn('[AuthContext] ⚠️ Failed to refresh user, using stored user:', refreshErr);
            // Nếu refresh fail, vẫn dùng stored user nếu có
            if (storedUserJson) {
              try {
                const storedUser = JSON.parse(storedUserJson) as AuthUser;
                setUser(withDefaultAvatar(storedUser));
              } catch (e) {
                // Nếu cả stored user cũng không parse được, clear auth
                console.error('[AuthContext] ❌ Invalid stored user, clearing auth');
                await storage.removeItem(AUTH_TOKEN_KEY);
                await storage.removeItem(AUTH_USER_KEY);
                setToken(null);
                setUser(null);
              }
            }
          }
        } else {
          console.log('[AuthContext] ℹ️ No token in storage');
        }
      } catch (error) {
        console.error('[AuthContext] ❌ Error restoring auth:', error);
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setAuthState = useCallback(async (payload: AuthResponse) => {
    const userWithAvatar = withDefaultAvatar(payload.user);
    setUser(userWithAvatar);
    setToken(payload.token);
    
    // Lưu vào storage
    try {
      await storage.setItem(AUTH_TOKEN_KEY, payload.token);
      await storage.setItem(AUTH_USER_KEY, JSON.stringify(userWithAvatar));
      console.log('[AuthContext] ✅ Auth state saved to storage');
    } catch (error) {
      console.error('[AuthContext] ❌ Failed to save auth to storage:', error);
    }
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const normalizedIdentifier = identifier.trim();
    const normalizedPassword = password.trim();

    if (!normalizedIdentifier || !normalizedPassword) {
      const message = 'Vui lòng nhập đầy đủ thông tin đăng nhập';
      setError(message);
      throw new Error(message);
    }

    setLoading(true);
    setError(null);

    try {
      const response = await loginApi({ identifier: normalizedIdentifier, password: normalizedPassword });
      await setAuthState(response.data);
      // Refresh user info để đảm bảo có đầy đủ thông tin (bao gồm avatarUrl)
      if (response.data.token) {
        // Set token trước để refreshUser có thể gọi API
        apiClient.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
        try {
          const userResponse = await getUserProfileApi();
          const refreshedUser = withDefaultAvatar(userResponse.data);
          setUser(refreshedUser);
          // Cập nhật user mới vào storage
          await storage.setItem(AUTH_USER_KEY, JSON.stringify(refreshedUser));
        } catch (refreshErr) {
          console.error('Error refreshing user after login:', refreshErr);
          // Nếu refresh fail, vẫn dùng data từ login response
        }
      }
      return response.data;
    } catch (err) {
      let message = 'Đăng nhập thất bại. Vui lòng thử lại.';

      if (isAxiosError(err)) {
        message = (err.response?.data as { message?: string })?.message ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [setAuthState]);

  const logout = useCallback(async () => {
    console.log('[AuthContext] 🔄 Logging out...');
    
    // Đánh dấu đang logout để tránh restore lại
    isLoggingOutRef.current = true;
    
    // Disconnect socket trước
    try {
      socketService.disconnect();
      console.log('[AuthContext] ✅ Socket disconnected');
    } catch (error) {
      console.error('[AuthContext] ❌ Failed to disconnect socket:', error);
    }
    
    // Xóa Authorization header
    delete apiClient.defaults.headers.common.Authorization;
    
    // Clear state TRƯỚC khi xóa storage
    setUser(null);
    setToken(null);
    
    // Xóa khỏi storage
    try {
      await storage.removeItem(AUTH_TOKEN_KEY);
      await storage.removeItem(AUTH_USER_KEY);
      console.log('[AuthContext] ✅ Auth state cleared from storage');
    } catch (error) {
      console.error('[AuthContext] ❌ Failed to clear auth from storage:', error);
    }
    
    // Đợi một chút để đảm bảo state đã được clear
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Reset flag sau khi logout hoàn thành
    isLoggingOutRef.current = false;
    
    console.log('[AuthContext] ✅ Logout completed');
  }, []);

  const updateUser = useCallback(async (updatedUser: AuthUser) => {
    const userWithAvatar = withDefaultAvatar(updatedUser);
    setUser(userWithAvatar);
    
    // Cập nhật vào storage
    try {
      await storage.setItem(AUTH_USER_KEY, JSON.stringify(userWithAvatar));
      console.log('[AuthContext] ✅ User updated in storage');
    } catch (error) {
      console.error('[AuthContext] ❌ Failed to update user in storage:', error);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    console.log('[AuthContext] refreshUser() called');
    console.log('[AuthContext] Token state:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
    });
    
    if (!token) {
      console.warn('[AuthContext] ⚠️ refreshUser() skipped - no token');
      return;
    }

    // Nếu đang có một request đang chạy, trả về promise đó thay vì tạo request mới
    if (refreshUserPromiseRef.current) {
      console.log('[AuthContext] ⏸️ refreshUser() already in progress, reusing existing promise');
      return refreshUserPromiseRef.current;
    }

    // Tạo promise mới và lưu vào ref
    const refreshPromise = (async () => {
      try {
        console.log('[AuthContext] Calling getUserProfileApi()...');
        const response = await getUserProfileApi();
        console.log('[AuthContext] ✅ getUserProfileApi() success:', {
          userId: response.data?.id,
          username: response.data?.username,
          email: response.data?.email,
        });
        setUser(withDefaultAvatar(response.data));
        console.log('[AuthContext] User state updated');
      } catch (err) {
        console.error('[AuthContext] ❌ Error refreshing user:', err);
        console.error('[AuthContext] Error details:', {
          isAxiosError: isAxiosError(err),
          status: isAxiosError(err) ? err.response?.status : 'N/A',
          message: err instanceof Error ? err.message : String(err),
          responseData: isAxiosError(err) ? err.response?.data : 'N/A',
        });
        
        // Nếu lỗi 401 (Unauthorized), token có thể đã hết hạn
        if (isAxiosError(err) && err.response?.status === 401) {
          console.warn('[AuthContext] ⚠️ 401 Unauthorized - token may be expired or invalid');
          console.warn('[AuthContext] ⚠️ User may be logged out or redirected');
        }
        
        // Không throw error để không làm gián đoạn flow
      } finally {
        // Clear promise ref khi hoàn thành (thành công hoặc lỗi)
        refreshUserPromiseRef.current = null;
      }
    })();

    refreshUserPromiseRef.current = refreshPromise;
    return refreshPromise;
  }, [token]);

  // Chỉ set Authorization header khi token thay đổi
  // Không tự động gọi refreshUser để tránh vòng lặp
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common.Authorization;
    }
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      error,
      login,
      logout,
      clearError,
      setAuthState,
      updateUser,
      refreshUser,
    }),
    [user, token, loading, error, login, logout, clearError, setAuthState, updateUser, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }

  return context;
}


