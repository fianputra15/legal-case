/**
 * Advanced Auth Patterns Examples
 * 
 * This file demonstrates various auth patterns and edge cases
 * for the legal case management system.
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAuth, withAuth } from '@/shared/lib';
import { apiClient, ApiError } from '@/shared/api';

// 1. Pattern: Conditional rendering based on auth state
function ConditionalAuthContent() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p>Please log in to access this content.</p>
        <a href="/login" className="text-blue-600 hover:text-blue-800">
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div>
      <h2>Welcome back, {user?.firstName}!</h2>
      <p>Role: {user?.role}</p>
    </div>
  );
}

// 2. Pattern: Role-specific component rendering
function RoleBasedContent() {
  const { user } = useAuth();

  const isClient = user?.role === 'CLIENT';
  const isLawyer = user?.role === 'LAWYER';

  return (
    <div className="space-y-4">
      {/* Content for all authenticated users */}
      <section>
        <h3>General Information</h3>
        <p>This content is visible to all authenticated users.</p>
      </section>

      {/* Client-only content */}
      {isClient && (
        <section>
          <h3>Client Dashboard</h3>
          <p>Create new cases, view your cases, and communicate with lawyers.</p>
        </section>
      )}

      {/* Lawyer-only content */}
      {isLawyer && (
        <section>
          <h3>Lawyer Dashboard</h3>
          <p>View assigned cases, manage case access, and communicate with clients.</p>
        </section>
      )}
    </div>
  );
}

// 3. Pattern: Protected API operations with error handling
function ProtectedOperations() {
  const { user, refreshAuth } = useAuth();
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Example: Create a new case (CLIENT only)
  const createCase = useCallback(async () => {
    if (user?.role !== 'CLIENT') {
      setStatus('Error: Only clients can create cases');
      return;
    }

    try {
      setLoading(true);
      setStatus('Creating case...');

      const response = await apiClient.post('/api/cases', {
        title: 'Sample Case',
        description: 'This is a sample case created from the frontend.',
        category: 'PERSONAL_INJURY'
      });

      setStatus(`Success: Case created with ID ${response.data.case.id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setStatus('Session expired. Please refresh your session.');
          // Auth utilities will handle the redirect
        } else if (error.status === 403) {
          setStatus('Access denied. You may not have permission for this action.');
        } else {
          setStatus(`Error: ${error.message}`);\n        }
      } else {
        setStatus('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  // Example: Refresh authentication
  const handleRefreshAuth = useCallback(async () => {
    try {
      setLoading(true);
      setStatus('Refreshing authentication...');
      
      await refreshAuth();
      setStatus('Authentication refreshed successfully');
    } catch (error) {
      setStatus('Failed to refresh authentication');
    } finally {
      setLoading(false);
    }
  }, [refreshAuth]);

  return (
    <div className="space-y-4">
      <h3>Protected Operations</h3>
      
      <div className="flex space-x-4">
        <button
          onClick={createCase}
          disabled={loading || user?.role !== 'CLIENT'}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          Create Sample Case
        </button>
        
        <button
          onClick={handleRefreshAuth}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
        >
          Refresh Auth
        </button>
      </div>

      {status && (
        <div className={`p-3 rounded ${
          status.startsWith('Error') 
            ? 'bg-red-100 text-red-700 border border-red-300'
            : status.startsWith('Success') 
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-blue-100 text-blue-700 border border-blue-300'
        }`}>
          {status}
        </div>
      )}
    </div>
  );
}

// 4. Pattern: Session expiration handling
function SessionExpirationHandler() {
  const { sessionExpiry, isSessionExpiring, refreshAuth } = useAuth();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkExpiration = () => {
      if (isSessionExpiring() && !showWarning) {
        setShowWarning(true);
      }
    };

    // Check every minute
    const interval = setInterval(checkExpiration, 60000);
    return () => clearInterval(interval);
  }, [isSessionExpiring, showWarning]);

  const handleExtendSession = useCallback(async () => {
    try {
      await refreshAuth();
      setShowWarning(false);
    } catch (error) {
      // Auth utilities will handle redirect on failure
    }
  }, [refreshAuth]);

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 right-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Session Expiring Soon
          </h3>
          <p className="text-sm text-yellow-700">
            Your session expires at {new Date(sessionExpiry!).toLocaleTimeString()}.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExtendSession}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
          >
            Extend
          </button>
          <button
            onClick={() => setShowWarning(false)}
            className="text-yellow-700 hover:text-yellow-800 text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// Main component showcasing all patterns
export default function AuthPatternsExample() {
  const [activeTab, setActiveTab] = useState<string>('conditional');

  const tabs = [
    { id: 'conditional', label: 'Conditional Auth', component: ConditionalAuthContent },
    { id: 'role-based', label: 'Role Based', component: RoleBasedContent },
    { id: 'operations', label: 'Protected Ops', component: ProtectedOperations },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ConditionalAuthContent;

  return (
    <div className="min-h-screen bg-gray-50">
      <SessionExpirationHandler />
      
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Auth Patterns Examples
        </h1>
        
        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Active component */}
        <div className="bg-white rounded-lg shadow p-6">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}