import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUi } from './UiContext';
import { clearAllDrafts } from '../hooks/useDraft';

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
  unreadNotiCount: number;
  setUnreadNotiCount: (count: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useUi();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotiCount, setUnreadNotiCount] = useState<number>(0);

  const fetchUnreadCount = async (currentToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const items = await res.json();
        const unread = items.filter((i: any) => i.unread).length;
        setUnreadNotiCount(unread);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('sme_token');
    const savedUser = localStorage.getItem('sme_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      fetchUnreadCount(savedToken);
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
    fetchUnreadCount(data.access_token);
    return data.user;
  };

  /** 토큰만 비운다. 작성 중이던 초안은 그대로 남긴다. */
  const clearSession = () => {
    localStorage.removeItem('sme_token');
    localStorage.removeItem('sme_user');
    setToken(null);
    setUser(null);
  };

  /** 사용자가 직접 로그아웃한 경우. 남아 있는 초안까지 정리한다. */
  const logout = () => {
    clearSession();
    clearAllDrafts();
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
      // 세션이 끊겨도 작성 중이던 글은 지우지 않는다. 다시 로그인하면 복원된다.
      clearSession();
      toast.error(
        '로그인 세션이 만료되었습니다',
        '작성 중이던 내용은 임시저장해 두었습니다. 다시 로그인하면 이어서 쓸 수 있습니다.',
      );
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
    <AuthContext.Provider value={{ user, token, loading, login, logout, apiFetch, unreadNotiCount, setUnreadNotiCount }}>
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
