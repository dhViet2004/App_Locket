import React, { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import type { AuthResponse, AuthUser } from '../types/api.types';
import { loginApi } from '../api/services/auth.service';
import { getUserProfileApi } from '../api/services/user.service';
import { isAxiosError } from 'axios';
import { apiClient } from '../api/client';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  clearError: () => void;
  setAuthState: (payload: AuthResponse) => void;
  updateUser: (user: AuthUser) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const DEFAULT_AVATAR_URL =
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref để tránh gọi refreshUser() đồng thời nhiều lần
  const refreshUserPromiseRef = React.useRef<Promise<void> | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setAuthState = useCallback((payload: AuthResponse) => {
    setUser(withDefaultAvatar(payload.user));
    setToken(payload.token);
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
      setAuthState(response.data);
      // Refresh user info để đảm bảo có đầy đủ thông tin (bao gồm avatarUrl)
      if (response.data.token) {
        // Set token trước để refreshUser có thể gọi API
        apiClient.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
        try {
          const userResponse = await getUserProfileApi();
          setUser(withDefaultAvatar(userResponse.data));
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

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((updatedUser: AuthUser) => {
    setUser(withDefaultAvatar(updatedUser));
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


