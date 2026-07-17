'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './types';
import { fetchApi } from './api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in by hitting /api/auth/me
    const checkAuth = async () => {
      try {
        const userData = await fetchApi('/auth/me');
        setUser(userData);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (username: string) => {
    // In a real app we'd fetch the user data again, but here we can just do a soft reload or fetch me
    fetchApi('/auth/me').then(userData => {
      setUser(userData);
      router.push('/hosted-zones');
    }).catch(() => {
      // Handle error
    });
  };

  const logout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
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
