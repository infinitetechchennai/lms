'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile } from '../types';
import { apiRequest } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUserPreferences: (data: Partial<StudentProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('smartway_token');
    const savedUser = localStorage.getItem('smartway_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Silently verify with /auth/me
        apiRequest<User>('/auth/me')
          .then((res) => {
            if (res.data) {
              setUser(res.data);
              localStorage.setItem('smartway_user', JSON.stringify(res.data));
            }
          })
          .catch(() => {
            // Token expired or invalid
            logout();
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (e) {
        logout();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('smartway_token', newToken);
    localStorage.setItem('smartway_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smartway_token');
    localStorage.removeItem('smartway_user');
  };

  const updateUserPreferences = async (data: Partial<StudentProfile>) => {
    const res = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (res.success && user && user.profile) {
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          ...res.data,
        },
      };
      setUser(updatedUser);
      localStorage.setItem('smartway_user', JSON.stringify(updatedUser));
    }
  };

  const refreshUser = async () => {
    try {
      const res = await apiRequest<User>('/auth/me');
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('smartway_user', JSON.stringify(res.data));
      }
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        updateUserPreferences,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

