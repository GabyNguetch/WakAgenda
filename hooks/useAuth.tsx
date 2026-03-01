'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import type { UserResponse } from '@/types';

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: UserResponse | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const u = await userService.getMe();
      setUser(u);
    } catch {
      authService.removeToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const logout = useCallback(() => {
    authService.removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, setUser, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}