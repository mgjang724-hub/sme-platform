import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  user_id: string;
  name: string;
  email: string;
  global_role: 'PLANNER' | 'PM' | 'SME' | 'ADMIN' | 'MANAGER';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => void;
  apiFetch: (path: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('sme_token');
    const savedUser = localStorage.getItem('sme_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || '로그인에 실패했습니다.');
    }

    const data = await res.json();
    localStorage.setItem('sme_token', data.access_token);
    localStorage.setItem('sme_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('sme_token');
    localStorage.removeItem('sme_user');
    setToken(null);
    setUser(null);
  };

  const apiFetch = async (path: string, options: RequestInit = {}): Promise<any> => {
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    } as any;

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path.startsWith('/') ? path : '/' + path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      logout();
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || '요청이 실패했습니다.');
    }

    if (res.status === 204) {
      return null;
    }

    return res.json();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, apiFetch }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
