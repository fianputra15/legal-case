'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/lib/auth';
import { apiClient, ApiError } from '@/shared/api';
import { MainLayout } from '@/widgets/layout';
import { CaseList, CaseFilters, CaseCardProps } from '@/shared/ui';
import Link from 'next/link';

function BrowseCasesContent() {
  const { user } = useAuth();
  const [cases, setCases] = useState<CaseCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [totalCases, setTotalCases] = useState(0);

  // Filter states
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams();
        if (category !== "all") params.append("category", category);
        if (status !== "all") params.append("status", status);

        // Use /api/cases for browsing all cases
        const response = await apiClient.get<any>(`/api/cases?${params.toString()}`);
        const casesData = (response.data?.cases || []).map((caseItem: any) => ({
          ...caseItem,
          userRole: user?.role as 'CLIENT' | 'LAWYER' | 'ADMIN',
          showOwner: user?.role === 'LAWYER', // Lawyers see case owners when browsing
        }));
        setCases(casesData);
        setTotalCases(response.data?.pagination?.total || response.data?.cases?.length || 0);
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
  }, [category, status]);

  const handleRequestAccess = async (caseId: string) => {
    try {
      await apiClient.post(`/api/cases/${caseId}/request-access`);
      
      // Refresh the cases to update the UI
      setCases(prevCases =>
        prevCases.map(caseItem =>
          caseItem.id === caseId
            ? { ...caseItem, hasPendingRequest: true }
            : caseItem
        )
      );
      
      // Optionally, show a success message
      alert('Access request submitted successfully!');
    } catch (error) {
      if (error instanceof ApiError) {
        alert(`Failed to request access: ${error.message}`);
      } else {
        alert('Failed to request access');
      }
    }
  };

  const handleWithdrawRequest = async (caseId: string) => {
    try {
      await apiClient.delete(`/api/cases/${caseId}/request-access`);
      
      // Refresh the cases to update the UI
      setCases(prevCases =>
        prevCases.map(caseItem =>
          caseItem.id === caseId
            ? { ...caseItem, hasPendingRequest: false, requestedAt: null }
            : caseItem
        )
      );
      
      // Optionally, show a success message
      alert('Access request withdrawn successfully!');
    } catch (error) {
      if (error instanceof ApiError) {
        alert(`Failed to withdraw request: ${error.message}`);
      } else {
        alert('Failed to withdraw request');
      }
    }
  };

  const getPageTitle = () => {
    switch (user?.role) {
      case 'LAWYER': return 'Browse Cases';
      case 'CLIENT': return 'Your Cases';
      default: return 'All Cases';
    }
  };

  const getEmptyStateMessage = () => {
    if (category !== "all" || status !== "all") {
      return "No cases match your current filters.";
    }
    
    switch (user?.role) {
      case 'CLIENT': return "You don't have any cases yet. Create your first case to get started.";
      case 'LAWYER': return "No cases are available for browsing at the moment.";
      default: return "No cases available.";
    }
  };

  return (
    <div className="space-y-6 bg-white p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-strong900 mb-2">
              {getPageTitle()}
            </h1>
            <p className="text-sub600">
              {user?.role === 'LAWYER' 
                ? "Discover and explore available cases" 
                : user?.role === 'CLIENT'
                ? "Manage your legal cases"
                : "View all cases in the system"
              }
            </p>
          </div>
          
          {user?.role === 'CLIENT' && (
            <div className="flex gap-3">
              <Link
                href="/my-cases"
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                My Cases
              </Link>
              <Link
                href="/create-case"
                className="bg-brand text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-brand-orange-600 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Case
              </Link>
            </div>
          )}

          {user?.role === 'LAWYER' && (
            <div className="flex gap-3">
              <Link
                href="/my-cases"
                className="bg-brand text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-brand-orange-600 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                My Assigned Cases
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <CaseFilters
        category={category}
        status={status}
        sortBy={sortBy}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
        onSortChange={setSortBy}
        totalCases={totalCases}
        filteredCount={cases.length}
      />

      {/* Cases List */}
      <CaseList
        cases={cases}
        loading={loading}
        error={error}
        onRetry={() => window.location.reload()}
        onRequestAccess={handleRequestAccess}
        onWithdrawRequest={handleWithdrawRequest}
        emptyStateConfig={{
          title: "No Cases Found",
          description: getEmptyStateMessage(),
          showCreateButton: user?.role === 'CLIENT' && category === "all" && status === "all",
          createButtonText: "Create Your First Case",
          createButtonHref: "/create-case",
        }}
      />
    </div>
  );
}

export default function BrowseCasesPage() {
  return (
    <MainLayout headerTitle="Browse Cases" showFooter={false}>
      <BrowseCasesContent />
    </MainLayout>
  );
}