/**
 * Auth Context Provider
 * 
 * Provides authentication state throughout the application
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from './auth';
import type { AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isAuthenticated: boolean;
  isClient: boolean;
  isLawyer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export the hook from auth-enhanced.tsx for direct usage
export { RequireAuth, withAuth, authUtils } from './auth';