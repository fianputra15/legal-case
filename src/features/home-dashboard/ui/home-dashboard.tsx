'use client';

import { useAuth } from '@/shared/lib/auth';
import { useState, useEffect } from 'react';
import { getCasesStats } from '../api';
import type { CaseStats } from '../model';
import { StatsCard } from './stats-card';
import { RecentCases } from './recent-cases';

export function HomeDashboard() {
  const { isAuthenticated, user } = useAuth();
  const [caseStats, setCaseStats] = useState<CaseStats | null>(null);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesError, setCasesError] = useState<string | null>(null);

  // Fetch cases when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const fetchCases = async () => {
      setCasesLoading(true);
      setCasesError(null);
      
      try {
        const stats = await getCasesStats();
        setCaseStats(stats);
      } catch (error: unknown) {
        console.error('HomeDashboard: Error fetching cases:', error);
        setCasesError(error instanceof Error ? error.message : 'Failed to load cases');
      } finally {
        setCasesLoading(false);
      }
    };

    // Add delay to ensure authentication is fully processed
    const timer = setTimeout(fetchCases, 500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h2>
          <p className="mt-2 text-gray-600">
            Here's an overview of your cases as a {user.role.toLowerCase()}
          </p>
        </div>

        {casesLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : casesError ? (
          <div className="text-center">
            <div className="text-red-600 mb-4">Failed to load case data</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : caseStats ? (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatsCard title="Total Cases" value={caseStats.total} color="blue" />
              <StatsCard title="Open Cases" value={caseStats.open} color="green" />
              <StatsCard title="In Progress" value={caseStats.in_progress} color="yellow" />
              <StatsCard title="Closed Cases" value={caseStats.closed} color="gray" />
            </div>

            {/* Recent Cases */}
            <RecentCases cases={caseStats.recent} />
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <p>No cases found. Start by creating your first case.</p>
            <a href="/dashboard" className="mt-2 inline-block text-blue-600 hover:text-blue-800 font-medium">
              Go to Dashboard →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}