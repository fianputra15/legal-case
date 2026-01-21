'use client';
import type { FC, ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { AuthContextValue } from './types';
import { apiClient } from '../api';
import { AuthResponse } from '../types';
import { useAsPath } from '../hooks/useAsPath';
import { AuthUser } from '@/server/auth/types';

const AuthContext = createContext<AuthContextValue & { logout: () => Promise<void> }>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  logout: async () => {},
});

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const asPath = useAsPath();

  const isAuthenticatedUser = (authUser: AuthUser | null) => {
    if (!authUser) {
      return false;
    }
    return true;
  };

  const logout = async () => {
    try {
      // Call logout API to clear server-side cookie
      await apiClient.post('/api/auth/logout');
      router.push("/login");
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      // Redirect to login
      router.push('/login');
    }
  };

  useEffect(() => {
    const handleAuth = async () => {
      setIsLoading(true);
      try {
        const authUser = await apiClient.get<AuthResponse>('/api/auth/me');
        setUser(authUser.data?.user || null);
        setIsAuthenticated(isAuthenticatedUser(authUser.data?.user || null));
      } catch (err) {
        console.log('Auth check failed:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally{
        setIsLoading(false);
      }
    };

    handleAuth();
    // add asPath for run handleAuth when user change page using useRouter().push
  }, [asPath]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };

