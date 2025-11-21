import { createContext, useContext, useMemo, useState, type ReactNode, useCallback } from 'react';
import { registerApi } from '../api/services/auth.service';
import type { AuthResponse } from '../types/api.types';

interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface RegisterContextValue {
  data: RegisterFormData;
  loading: boolean;
  error: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  setUsername: (username: string) => void;
  submit: () => Promise<AuthResponse>;
  reset: () => void;
}

const INITIAL_DATA: RegisterFormData = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  username: '',
};

const RegisterContext = createContext<RegisterContextValue | undefined>(undefined);

export function RegisterProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RegisterFormData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = useCallback(<K extends keyof RegisterFormData>(key: K, value: RegisterFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submit = useCallback(async () => {
    if (!data.email || !data.password || !data.username) {
      throw new Error('Thiếu thông tin đăng ký bắt buộc');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await registerApi({
        username: data.username,
        password: data.password,
        email: data.email,
      });

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [data]);

  const reset = useCallback(() => {
    setData(INITIAL_DATA);
    setError(null);
  }, []);

  const value = useMemo<RegisterContextValue>(
    () => ({
      data,
      loading,
      error,
      setEmail: (email: string) => setField('email', email),
      setPassword: (password: string) => setField('password', password),
      setFirstName: (firstName: string) => setField('firstName', firstName),
      setLastName: (lastName: string) => setField('lastName', lastName),
      setUsername: (username: string) => setField('username', username),
      submit,
      reset,
    }),
    [data, loading, error, setField, submit, reset],
  );

  return <RegisterContext.Provider value={value}>{children}</RegisterContext.Provider>;
}

export function useRegisterForm() {
  const context = useContext(RegisterContext);

  if (!context) {
    throw new Error('useRegisterForm phải được sử dụng bên trong RegisterProvider');
  }

  return context;
}



