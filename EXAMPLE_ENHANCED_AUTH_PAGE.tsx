'use client';

/**
 * Example Usage: Protected Page with Enhanced Auth
 * 
 * Demonstrates:
 * - getCurrentUser() function usage
 * - requireAuth() client-side guard
 * - Session handling flow
 * - Crash prevention on 401/403 responses
 */

import React, { useEffect, useState } from 'react';
import { useAuth, RequireAuth, getCurrentUser, requireAuth, authUtils } from '@/shared/lib/auth';
import { apiClient, ApiError } from '@/shared/api';
import type { User } from '@/shared/types';

// Example 1: Using getCurrentUser() function directly
function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // REQUIRED: Using getCurrentUser() function
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
        } else {
          // User not authenticated - handle gracefully (no UI crash)
          setError('Please log in to view your profile');
        }
      } catch (err) {
        // Catches network errors, but getCurrentUser prevents auth crashes
        setError('Failed to load profile');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">No user information available</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">User Profile</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="text-gray-900">{user.firstName} {user.lastName}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="text-gray-900">{user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            user.role === 'LAWYER' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {user.role}
          </span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Example 2: Using requireAuth() client-side guard
function ProtectedOperation() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const performProtectedAction = async () => {
    try {
      setLoading(true);
      setResult('');

      // REQUIRED: Using requireAuth() client-side guard
      // This will redirect to login if not authenticated
      // and clear stale state automatically
      const user = await requireAuth();
      
      // If we get here, user is authenticated
      const response = await apiClient.get('/api/cases');
      setResult(`Success! Found ${response.data?.cases?.length || 0} cases for ${user.firstName}`);
      
    } catch (error) {
      // requireAuth handles auth failures by redirecting
      // Other errors are caught here
      if (error instanceof ApiError) {
        setResult(`API Error: ${error.message}`);
      } else {
        setResult('Operation failed');
      }
      console.error('Protected operation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Protected Operation</h2>
      <p className="text-gray-600 mb-4">
        This demonstrates requireAuth() function - it will redirect to login if not authenticated.
      </p>
      
      <button
        onClick={performProtectedAction}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Perform Protected Action'}
      </button>
      
      {result && (
        <div className={`mt-4 p-3 rounded ${
          result.startsWith('Success') 
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {result}
        </div>
      )}
    </div>
  );
}

// Example 3: Session handling and auth utilities
function SessionInfo() {
  const { user, loading, isAuthenticated } = useAuth();
  const [sessionStatus, setSessionStatus] = useState('');

  const checkSession = async () => {
    // Using auth utilities
    const cached = authUtils.getCachedUser();
    const isAuth = authUtils.isAuthenticated();
    const isExpired = authUtils.isSessionExpired();

    setSessionStatus(`
      Cached User: ${cached ? `${cached.firstName} ${cached.lastName}` : 'None'}
      Is Authenticated: ${isAuth ? 'Yes' : 'No'}
      Session Expired: ${isExpired ? 'Yes' : 'No'}
      Hook State: ${isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
    `);
  };

  const clearAuth = () => {
    authUtils.clearAuth();
    setSessionStatus('Authentication cleared');
    window.location.reload();
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-200 rounded"></div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Session Information</h2>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={checkSession}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Check Session Status
          </button>
          <button
            onClick={clearAuth}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Auth
          </button>
        </div>
        
        {sessionStatus && (
          <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
            {sessionStatus}
          </pre>
        )}
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Current State:</h3>
          <div className="text-sm text-gray-600">
            <p>User: {user ? `${user.firstName} ${user.lastName} (${user.role})` : 'Not authenticated'}</p>
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Example 4: API calls with crash prevention
function ApiTestSection() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const testApiCall = async (endpoint: string, description: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get(endpoint);
      setResults(prev => [...prev, `✅ ${description}: Success`]);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setResults(prev => [...prev, `🔐 ${description}: 401 - Redirected to login (no crash)`]);
        } else if (error.status === 403) {
          setResults(prev => [...prev, `🚫 ${description}: 403 - Access denied (no crash)`]);
        } else {
          setResults(prev => [...prev, `❌ ${description}: ${error.status} - ${error.message}`]);
        }
      } else {
        setResults(prev => [...prev, `⚠️ ${description}: Network error (no crash)`]);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => setResults([]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">API Crash Prevention Tests</h2>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={() => testApiCall('/api/auth/me', 'Get Current User')}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Test /api/auth/me
        </button>
        <button
          onClick={() => testApiCall('/api/cases', 'Get Cases')}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          Test /api/cases
        </button>
        <button
          onClick={clearResults}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      {results.length > 0 && (
        <div className="bg-gray-50 rounded p-4">
          <h3 className="font-medium mb-2">Test Results:</h3>
          <div className="space-y-1 text-sm">
            {results.map((result, index) => (
              <div key={index} className="font-mono">{result}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main component using RequireAuth
function DashboardContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Auth Utilities Demo</h1>
          <p className="text-gray-600 mt-2">
            Demonstrates getCurrentUser(), requireAuth(), session handling, and crash prevention.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserProfile />
          <ProtectedOperation />
          <SessionInfo />
          <ApiTestSection />
        </div>
      </div>
    </div>
  );
}

// Protected page with role-based access
export default function EnhancedAuthExamplePage() {
  return (
    <RequireAuth 
      roles={['CLIENT', 'LAWYER']}
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading authentication...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </RequireAuth>
  );
}