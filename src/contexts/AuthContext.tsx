import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getToken, setToken, clearToken } from '../utils/api';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem('admin_username');
  });
  const isLoggedIn = !!getToken();

  useEffect(() => {
    setUsername(isLoggedIn ? localStorage.getItem('admin_username') : null);
  }, [isLoggedIn]);

  const login = useCallback(async (user: string, password: string) => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error?.message || '登录失败');
    }

    const data = await res.json();
    setToken(data.token);
    localStorage.setItem('admin_username', data.username);
    setUsername(data.username);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem('admin_username');
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}