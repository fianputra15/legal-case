'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, RequireAuth } from '@/shared/lib/auth';
import { apiClient, ApiError } from '@/shared/api';
import { AppHeader } from '@/shared/ui/app-header';

interface Case {
  id: string;
  title: string;
  description?: string;
  status: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

function MyCasesContent() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiClient.get<any>('/api/cases');
        setCases(response.data?.cases || []);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(`Failed to load cases: ${error.message}`);
        } else {
          setError('Failed to load cases');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCases = cases.filter(case_ => {
    if (filter === 'all') return true;
    return case_.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Cases</h1>
          <p className="text-gray-600 mt-2">Manage and track your legal cases</p>
        </div>

        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Filter by status:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="all">All Cases</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              
              {user?.role === 'CLIENT' && (
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Case
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-12">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No cases found</h3>
              <p className="mt-2 text-gray-500">
                {filter === 'all' ? 'You don\'t have any cases yet.' : `No ${filter.toLowerCase()} cases found.`}
              </p>
              {user?.role === 'CLIENT' && (
                <div className="mt-6">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Create your first case
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredCases.map((case_) => (
                <div key={case_.id} className="px-6 py-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {case_.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {case_.description || 'No description provided'}
                      </p>
                      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                        <span>{case_.category.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>Created {new Date(case_.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Updated {new Date(case_.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(case_.status)}`}>
                        {case_.status.replace('_', ' ')}
                      </span>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">View</button>
                        <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">Documents</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function MyCasesPage() {
  return (
    <RequireAuth 
      roles={['CLIENT']}
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      }
    >
      <MyCasesContent />
    </RequireAuth>
  );
}
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-legal-active">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-legal-text-primary">Status:</label>
              <select className="px-3 py-1 border border-legal-active rounded text-sm">
                <option>All Cases</option>
                <option>Active</option>
                <option>Pending Review</option>
                <option>Closed</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-legal-text-primary">Priority:</label>
              <select className="px-3 py-1 border border-legal-active rounded text-sm">
                <option>All Priorities</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-legal-text-primary">Client:</label>
              <input 
                type="text" 
                placeholder="Search clients..."
                className="px-3 py-1 border border-legal-active rounded text-sm w-48"
              />
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid gap-6">
          {[
            {
              id: 'CS-2026-001',
              title: 'Smith vs. Johnson Contract Dispute',
              client: 'John Smith',
              status: 'Active',
              priority: 'High',
              lastUpdate: '2 hours ago',
              description: 'Contract dispute regarding breach of service agreement terms and conditions.',
              attachments: 12,
              dueDate: 'Jan 25, 2026'
            },
            {
              id: 'CS-2026-002',
              title: 'Corporate Merger - ABC Corp',
              client: 'ABC Corporation',
              status: 'Pending Review',
              priority: 'Medium',
              lastUpdate: '1 day ago',
              description: 'Due diligence and documentation for corporate merger proceedings.',
              attachments: 8,
              dueDate: 'Feb 5, 2026'
            },
            {
              id: 'CS-2026-003',
              title: 'Personal Injury Claim',
              client: 'Jane Doe',
              status: 'Active',
              priority: 'High',
              lastUpdate: '3 days ago',
              description: 'Motor vehicle accident injury claim and insurance settlement.',
              attachments: 15,
              dueDate: 'Jan 30, 2026'
            },
            {
              id: 'CS-2026-004',
              title: 'Intellectual Property Dispute',
              client: 'Tech Innovations Inc.',
              status: 'Closed',
              priority: 'Low',
              lastUpdate: '1 week ago',
              description: 'Patent infringement case resolved through negotiated settlement.',
              attachments: 6,
              dueDate: 'Completed'
            },
            {
              id: 'CS-2026-005',
              title: 'Employment Discrimination Case',
              client: 'Sarah Johnson',
              status: 'Active',
              priority: 'Medium',
              lastUpdate: '5 days ago',
              description: 'Workplace discrimination and wrongful termination claim.',
              attachments: 9,
              dueDate: 'Feb 10, 2026'
            },
            {
              id: 'CS-2026-006',
              title: 'Real Estate Transaction',
              client: 'Property Holdings LLC',
              status: 'Pending Review',
              priority: 'Low',
              lastUpdate: '2 days ago',
              description: 'Commercial real estate purchase and title review.',
              attachments: 4,
              dueDate: 'Feb 15, 2026'
            },
          ].map((case_) => (
            <div key={case_.id} className="bg-white p-6 rounded-lg border border-legal-active hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-legal-text-sub">{case_.id}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      case_.status === 'Active' ? 'bg-legal-success text-green-700' :
                      case_.status === 'Pending Review' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {case_.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      case_.priority === 'High' ? 'bg-red-50 text-red-700' :
                      case_.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {case_.priority} Priority
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-legal-text-primary mb-2">{case_.title}</h3>
                  <p className="text-legal-text-sub text-sm mb-2">Client: {case_.client}</p>
                  <p className="text-legal-text-sub text-sm mb-4">{case_.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-legal-text-sub">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-9 9 9v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      <span>{case_.attachments} attachments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 0h12m-3 0v13a2 2 0 01-2 2H7a2 2 0 01-2-2V7h3z" />
                      </svg>
                      <span>Due: {case_.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Last updated: {case_.lastUpdate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm" className="border-legal-active text-legal-text-primary hover:bg-legal-active">
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="border-legal-active text-legal-text-primary hover:bg-legal-active">
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-legal-active">
          <p className="text-sm text-legal-text-sub">Showing 1 to 6 of 12 cases</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-legal-active text-legal-text-primary hover:bg-legal-active">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="border-legal-active text-legal-text-primary hover:bg-legal-active">
              Next
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}