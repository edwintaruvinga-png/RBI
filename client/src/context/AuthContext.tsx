import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, clearToken, getToken, setToken } from '../api/client';
import type { User } from '../types';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(() => getToken());

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => (await api.get<{ user: User }>('/auth/me')).data.user,
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const login = (newToken: string) => {
    setToken(newToken);
    setTokenState(newToken);
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user: user ?? null,
        isAuthenticated: Boolean(token),
        isLoading: Boolean(token) && isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
