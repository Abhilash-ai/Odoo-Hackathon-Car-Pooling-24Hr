import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  quickDemoLogin: (role: 'admin' | 'driver' | 'passenger' | 'female-driver') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('odoo_commute_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('odoo_commute_user', JSON.stringify(res.data.user));
    } catch (err: any) {
      console.error('Auth verification error:', err);
      // Only logout if explicit 401 token invalidation
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Heartbeat interval (every 30 seconds) to maintain active online status
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      api.post('/auth/heartbeat').catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('odoo_commute_user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const quickDemoLogin = async (role: 'admin' | 'driver' | 'passenger' | 'female-driver') => {
    const res = await api.post('/auth/quick-demo', { role });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('odoo_commute_user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('odoo_commute_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, quickDemoLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
