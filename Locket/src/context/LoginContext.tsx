import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from 'react';

interface LoginContextValue {
  identifier: string;
  setIdentifier: (value: string) => void;
  reset: () => void;
}

const LoginContext = createContext<LoginContextValue | undefined>(undefined);

export function LoginProvider({ children }: { children: ReactNode }) {
  const [identifier, setIdentifierState] = useState('');

  const setIdentifier = useCallback((value: string) => {
    setIdentifierState(value);
  }, []);

  const reset = useCallback(() => {
    setIdentifierState('');
  }, []);

  const value = useMemo(
    () => ({
      identifier,
      setIdentifier,
      reset,
    }),
    [identifier, setIdentifier, reset],
  );

  return <LoginContext.Provider value={value}>{children}</LoginContext.Provider>;
}

export function useLoginForm() {
  const context = useContext(LoginContext);

  if (!context) {
    throw new Error('useLoginForm phải được sử dụng bên trong LoginProvider');
  }

  return context;
}


