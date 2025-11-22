import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setAuthState = useCallback((payload: AuthResponse) => {
    setUser(payload.user);
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
          setUser(userResponse.data);
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
    setUser(updatedUser);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await getUserProfileApi();
      setUser(response.data);
    } catch (err) {
      console.error('Error refreshing user:', err);
      // Không throw error để không làm gián đoạn flow
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
      // Refresh user info sau khi set token
      refreshUser();
    } else {
      delete apiClient.defaults.headers.common.Authorization;
    }
  }, [token, refreshUser]);

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


