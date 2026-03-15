import * as React from 'react';
import type { AuthUser } from '../types/auth';

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, tenantId: string) => Promise<void>;
  logout: () => void;
}

const defaultState: AuthState = {
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
};

const AuthContext = React.createContext<AuthState>(defaultState);

const MOCK_LOGIN_DELAY_MS = 600;

function createMockUser(email: string): AuthUser {
  return {
    userId: 'mock-user-1',
    email,
    merchantId: 'mock-merchant-1',
    merchantName: 'Merchant Demo',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);

  const login = React.useCallback(async (email: string, _password: string, _tenantId: string) => {
    await new Promise((r) => setTimeout(r, MOCK_LOGIN_DELAY_MS));
    setUser(createMockUser(email));
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
  }, []);

  const value: AuthState = React.useMemo(
    () => ({ user, isAuthenticated: !!user, login, logout }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
