'use client';

import { useAuth } from '@/shared/lib/auth';
import { AppHeader } from '@/shared/ui/app-header';
import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/api';

interface Case {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface CaseStats {
  total: number;
  open: number;
  in_progress: number;
  closed: number;
  recent: Case[];
}

export default function HomePage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
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
        console.log('HomePage: Fetching cases for authenticated user');
        
        // Fetch recent cases (limit to 5 for homepage)
        const response = await apiClient.get('/api/cases?limit=5&page=1') as any;
        
        if (response.success && response.data) {
          setCases(response.data.cases || []);
          
          // Calculate stats from the cases
          const allCases = response.data.cases || [];
          const stats: CaseStats = {
            total: response.data.pagination?.total || allCases.length,
            open: allCases.filter((c: Case) => c.status === 'OPEN').length,
            in_progress: allCases.filter((c: Case) => c.status === 'IN_PROGRESS').length,
            closed: allCases.filter((c: Case) => c.status === 'CLOSED').length,
            recent: allCases.slice(0, 3) // Show 3 most recent
          };
          
          setCaseStats(stats);
        }
      } catch (error: any) {
        console.error('HomePage: Error fetching cases:', error);
        setCasesError(error?.message || 'Failed to load cases');
      } finally {
        setCasesLoading(false);
      }
    };

    // Add delay to ensure authentication is fully processed
    const timer = setTimeout(fetchCases, 500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CORPORATE_LAW': return 'bg-blue-100 text-blue-800';
      case 'CRIMINAL_LAW': return 'bg-red-100 text-red-800';
      case 'FAMILY_LAW': return 'bg-purple-100 text-purple-800';
      case 'REAL_ESTATE': return 'bg-green-100 text-green-800';
      case 'INTELLECTUAL_PROPERTY': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main>
        {/* Hero Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                Legal Case Management
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Secure, efficient, and comprehensive case management for legal professionals and their clients.
              </p>
              
              {authLoading ? (
                <div className="mt-5 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : !isAuthenticated ? (
                <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                  <div className="rounded-md shadow">
                    <a
                      href="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                    >
                      Sign In
                    </a>
                  </div>
                  <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                    <a
                      href="#features"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                  <div className="rounded-md shadow">
                    <a
                      href="/dashboard"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                    >
                      Go to Dashboard
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Case Statistics Section - Only for authenticated users */}
        {isAuthenticated && user && (
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
                    <div className="bg-blue-50 p-6 rounded-lg text-center">
                      <div className="text-3xl font-bold text-blue-600">{caseStats.total}</div>
                      <div className="text-blue-800 font-medium">Total Cases</div>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg text-center">
                      <div className="text-3xl font-bold text-green-600">{caseStats.open}</div>
                      <div className="text-green-800 font-medium">Open Cases</div>
                    </div>
                    <div className="bg-yellow-50 p-6 rounded-lg text-center">
                      <div className="text-3xl font-bold text-yellow-600">{caseStats.in_progress}</div>
                      <div className="text-yellow-800 font-medium">In Progress</div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <div className="text-3xl font-bold text-gray-600">{caseStats.closed}</div>
                      <div className="text-gray-800 font-medium">Closed Cases</div>
                    </div>
                  </div>

                  {/* Recent Cases */}
                  {caseStats.recent.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Cases</h3>
                        <a href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
                          View All →
                        </a>
                      </div>
                      
                      <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="divide-y divide-gray-200">
                          {caseStats.recent.map((caseItem) => (
                            <div key={caseItem.id} className="p-6 hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    {caseItem.title}
                                  </h4>
                                  <div className="flex items-center space-x-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(caseItem.category)}`}>
                                      {caseItem.category.replace('_', ' ')}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
                                      {caseItem.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      Created {formatDate(caseItem.createdAt)}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-gray-900">
                                    Priority: {caseItem.priority}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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
        )}

        {/* Features Section */}
        <div id="features" className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to manage legal cases
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Built for security, designed for efficiency, and optimized for collaboration between lawyers and clients.
              </p>
            </div>

            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Secure Authentication</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Role-based access control ensures that clients & lawyers  only see what they're authorized to access.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Case Management</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Create, update, and track legal cases with comprehensive documentation and status management.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Secure Messaging</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Encrypted communication between lawyers and clients with full audit trails and compliance features.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Analytics & Reporting</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Comprehensive reporting and analytics to track case progress, time management, and business metrics.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}