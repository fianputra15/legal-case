'use client'
import React, { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, ApiError } from '../api';
import type { User, AuthState, LoginCredentials, AuthResponse } from '../types';

// Auth storage utilities with enhanced error handling  
class AuthStorage {
  private static readonly USER_KEY = 'auth_user';
  private static readonly EXPIRY_KEY = 'auth_expiry';
  private static readonly SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  static saveUser(user: User): void {
    try {
      const expiry = Date.now() + this.SESSION_DURATION;
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      localStorage.setItem(this.EXPIRY_KEY, expiry.toString());
    } catch (error) {
      console.warn('Failed to save user to localStorage:', error);
    }
  }

  static getUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      const expiry = localStorage.getItem(this.EXPIRY_KEY);
      
      if (!userData || !expiry) {
        return null;
      }

      // Check if session has expired
      if (Date.now() > parseInt(expiry, 10)) {
        this.clearUser();
        return null;
      }

      return JSON.parse(userData);
    } catch (error) {
      console.warn('Failed to get user from localStorage:', error);
      this.clearUser();
      return null;
    }
  }

  static clearUser(): void {
    try {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.EXPIRY_KEY);
    } catch (error) {
      console.warn('Failed to clear user from localStorage:', error);
    }
  }

  static isSessionExpired(): boolean {
    try {
      const expiry = localStorage.getItem(this.EXPIRY_KEY);
      if (!expiry) return true;
      return Date.now() > parseInt(expiry, 10);
    } catch {
      return true;
    }
  }
}

class AuthApi {
  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<AuthResponse>('/api/auth/me');
      if (response.success && response.data?.user) {
        AuthStorage.saveUser(response.data.user);
        return response.data.user;
      }
      return null;
    } catch (error) {
      // Prevent UI crashes on 401/403 - handle gracefully
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        AuthStorage.clearUser();
        return null;
      }
      console.warn('getCurrentUser failed:', error);
      return null;
    }
  }

  static async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
      
      if (response.success && response.data?.user) {
        AuthStorage.saveUser(response.data.user);
        return response.data.user;
      }
      throw new Error(response.error || 'Login failed');
    } catch (error) {
      AuthStorage.clearUser();
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      AuthStorage.clearUser();
    }
  }
}

/**
 * REQUIRED: Standalone getCurrentUser function
 * Fetches current user from /api/auth/me endpoint
 * Returns null if not authenticated or on error (prevents crashes)
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    return await AuthApi.getCurrentUser();
  } catch (error) {
    console.warn('getCurrentUser failed:', error);
    return null;
  }
}

/**
 * REQUIRED: Client-side requireAuth guard
 * Redirects to login if not authenticated
 * Clears stale state and prevents UI crashes
 */
export async function requireAuth(redirectUrl: string = '/login'): Promise<User | never> {
  try {
    const user = await getCurrentUser();
    if (!user || AuthStorage.isSessionExpired()) {
      // Clear stale state
      AuthStorage.clearUser();
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
      throw new Error('Authentication required');
    }
    return user;
  } catch (error) {
    AuthStorage.clearUser();
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
    throw error;
  }
}

// Functional Error Boundary using error state management
interface AuthErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

function AuthErrorBoundary({ children, fallback }: AuthErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Global error handler for auth-related errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('auth') || 
          event.error?.message?.includes('401') || 
          event.error?.message?.includes('403')) {
        setHasError(true);
        setError(event.error);
        AuthStorage.clearUser();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof ApiError && 
          (event.reason.status === 401 || event.reason.status === 403)) {
        setHasError(true);
        setError(event.reason);
        AuthStorage.clearUser();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleRefresh = useCallback(() => {
    setHasError(false);
    setError(null);
    window.location.reload();
  }, []);

  const handleGoToLogin = useCallback(() => {
    setHasError(false);
    setError(null);
    window.location.href = '/login';
  }, []);

  if (hasError) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-600 mb-4">
            Something went wrong with authentication. Please refresh the page or log in again.
          </p>
          <div className="space-x-4">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
            <button
              onClick={handleGoToLogin}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Enhanced session expiration handler using functional patterns
function useSessionExpiration() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showExpiredWarning, setShowExpiredWarning] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    checkAuth();
  }, []);

  const handleSessionExpired = useCallback(() => {
    setShowExpiredWarning(true);
    // Auto clear state and redirect after showing warning
    setTimeout(() => {
      AuthStorage.clearUser();
      router.push('/login');
    }, 3000);
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const checkExpiration = () => {
      if (AuthStorage.isSessionExpired()) {
        handleSessionExpired();
      }
    };

    // Check immediately and then every 30 seconds
    checkExpiration();
    const interval = setInterval(checkExpiration, 30000);

    return () => clearInterval(interval);
  }, [user, handleSessionExpired]);

  return { showExpiredWarning };
}

function SessionExpirationModal({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
        <div className="text-yellow-500 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Expired</h3>
        <p className="text-gray-600 mb-4">
          Your session has expired. You will be redirected to login.
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      </div>
    </div>
  );
}

function SessionExpirationHandler() {
  const { showExpiredWarning } = useSessionExpiration();
  return <SessionExpirationModal show={showExpiredWarning} />;
}

// Enhanced useAuth hook with crash prevention
export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  
  const initializingRef = useRef(false);

  // Initialize auth state with enhanced error handling
  const initializeAuth = useCallback(async (skipServerCheck = false) => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Try to get user from localStorage first (instant UX)
      const cachedUser = AuthStorage.getUser();
      if (cachedUser && !AuthStorage.isSessionExpired()) {
        setAuthState({
          user: cachedUser,
          loading: skipServerCheck ? false : true, // Don't show loading if skipping server check
          error: null,
        });
        
        // If we're skipping server check (just after login), we're done
        if (skipServerCheck) {
          initializingRef.current = false;
          return;
        }
      }

      // Verify with server (authoritative) - with crash prevention
      if (!skipServerCheck) {
        const serverUser = await getCurrentUser();
        
        setAuthState({
          user: serverUser,
          loading: false,
          error: null,
        });
      }

    } catch (error) {
      // Prevent crashes - handle gracefully
      console.error('Auth initialization error:', error);
      setAuthState({
        user: null,
        loading: false,
        error: null, // Don't expose error to prevent UI issues
      });
      AuthStorage.clearUser();
    } finally {
      initializingRef.current = false;
    }
  }, []);

  // Enhanced login with crash prevention
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const user = await AuthApi.login(credentials);
      setAuthState({
        user,
        loading: false,
        error: null,
      });
      
      console.log('Auth: Login successful, user set in state');
      // Skip server verification immediately after login to avoid race condition
      // The cookie needs time to be processed by the browser
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Enhanced logout with crash prevention
  const logout = useCallback(async (): Promise<void> => {
    try {
      await AuthApi.logout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
      router.push('/login');
    }
  }, [router]);

  // Handle auth failures from API client with crash prevention
  const handleAuthFailure = useCallback(() => {
    try {
      setAuthState({
        user: null,
        loading: false,
        error: null, // Don't expose error
      });
      AuthStorage.clearUser();
      router.push('/login');
    } catch (error) {
      console.error('Failed to handle auth failure:', error);
      // Force page reload if navigation fails
      window.location.href = '/login';
    }
  }, [router]);

  // Setup API client auth failure handler
  useEffect(() => {
    try {
      const cleanup = apiClient.onAuthFailure(handleAuthFailure);
      return () => {
        if (cleanup && typeof cleanup === 'function') {
          cleanup();
        }
      };
    } catch (error) {
      console.error('Failed to setup auth failure handler:', error);
      return undefined;
    }
  }, [handleAuthFailure]);

  // Initialize auth on mount
  useEffect(() => {
    // Add a small delay on initial auth check to avoid race conditions
    const timer = setTimeout(() => {
      initializeAuth(false).catch((error) => {
        console.error('Failed to initialize auth:', error);
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [initializeAuth]);

  return {
    ...authState,
    login,
    logout,
    refresh: () => initializeAuth(false), // Always verify with server on manual refresh
    isAuthenticated: !!authState.user && !AuthStorage.isSessionExpired(),
    isClient: authState.user?.role === 'CLIENT',
    isLawyer: authState.user?.role === 'LAWYER'
  };
}

// Enhanced RequireAuth component with functional patterns
interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  roles?: Array<'CLIENT' | 'LAWYER'>;
}

export function RequireAuth({ children, fallback, roles }: RequireAuthProps) {
  const { user, loading, error } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRedirect = useCallback((path: string) => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    
    try {
      router.push(path);
    } catch (error) {
      console.error('RequireAuth navigation error:', error);
      // Fallback to direct navigation
      window.location.href = path;
    }
  }, [router, isRedirecting]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      handleRedirect('/login');
      return;
    }

    if (roles && !roles.includes(user.role)) {
      handleRedirect('/unauthorized');
      return;
    }
  }, [user, loading, roles, handleRedirect]);

  // Handle errors gracefully
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Authentication error occurred</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || (roles && !roles.includes(user.role)) || isRedirecting) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Enhanced HOC using functional patterns
interface WithAuthOptions {
  roles?: Array<'CLIENT' | 'LAWYER'>;
  redirectTo?: string;
  fallback?: ReactNode;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const AuthenticatedComponent = React.memo((props: P) => {
    return (
      <RequireAuth 
        roles={options.roles} 
        fallback={options.fallback}
      >
        <Component {...props} />
      </RequireAuth>
    );
  });

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return AuthenticatedComponent;
}

// Enhanced auth provider with error boundary and session handling
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthErrorBoundary>
      <SessionExpirationHandler />
      {children}
    </AuthErrorBoundary>
  );
}

// Utility functions for direct usage without hooks
export const authUtils = {
  /**
   * Get current user from server (bypasses cache)
   * Returns null if not authenticated
   */
  getCurrentUser: getCurrentUser,

  /**
   * Client-side auth guard
   */
  requireAuth: requireAuth,

  /**
   * Get cached user (instant, but may be stale)
   */
  getCachedUser: (): User | null => {
    return AuthStorage.getUser();
  },

  /**
   * Check if user is authenticated (cached check)
   */
  isAuthenticated: (): boolean => {
    return !!AuthStorage.getUser() && !AuthStorage.isSessionExpired();
  },

  /**
   * Clear authentication state
   */
  clearAuth: (): void => {
    AuthStorage.clearUser();
  },

  /**
   * Check if session is expired
   */
  isSessionExpired: (): boolean => {
    return AuthStorage.isSessionExpired();
  },
};