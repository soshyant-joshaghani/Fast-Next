'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchCurrentUser } from '@/lib/modules/base/utils/auth-api';

export type AuthUser = {
  id?: string;
  email: string;
  full_name?: string | null;
  is_active?: boolean;
  is_superuser?: boolean;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  getToken: () => string | null;
};

const STORAGE_TOKEN = 'authToken';
const STORAGE_USER = 'currentUser';

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

function clearStoredAuth() {
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_USER);
}

function readStoredCredentials(): { token: string; user: AuthUser } | null {
  const token = localStorage.getItem(STORAGE_TOKEN);
  const raw = localStorage.getItem(STORAGE_USER);

  if (!token || !raw) return null;

  try {
    return { token, user: JSON.parse(raw) as AuthUser };
  } catch {
    clearStoredAuth();
    return null;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialAuthState);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const stored = readStoredCredentials();
      if (!stored) {
        if (!cancelled) {
          setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
        return;
      }

      try {
        const user = await fetchCurrentUser(stored.token);
        if (cancelled) return;
        localStorage.setItem(STORAGE_USER, JSON.stringify(user));
        setState({ user, token: stored.token, isAuthenticated: true, isLoading: false });
      } catch {
        if (cancelled) return;
        clearStoredAuth();
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((token: string, user: AuthUser) => {
    localStorage.setItem(STORAGE_TOKEN, token);
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    setState({ user, token, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  const getToken = useCallback(() => state.token, [state.token]);

  const value = useMemo(
    () => ({ ...state, login, logout, getToken }),
    [state, login, logout, getToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
