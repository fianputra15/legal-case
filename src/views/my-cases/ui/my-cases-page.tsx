'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/lib/auth';
import { apiClient, ApiError } from '@/shared/api';
import { MainLayout } from '@/widgets/layout';
import { CaseList, CaseFilters, CaseCardProps } from '@/shared/ui';
import Link from 'next/link';

function MyCasesContent() {
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

        const response = await apiClient.get<any>(`/api/my-cases?${params.toString()}`);
        const casesData = (response.data?.cases || []).map((caseItem: any) => ({
          ...caseItem,
          userRole: user?.role as 'CLIENT' | 'LAWYER' | 'ADMIN',
          showOwner: user?.role === 'LAWYER', // Show owner for lawyers in My Cases too
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

  return (
    <div className="space-y-6 bg-white p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {user?.role === 'CLIENT' && (
            <Link
              href="/create-case"
              className="bg-brand text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-brand-orange-600 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Case
            </Link>
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
        emptyStateConfig={{
          title: "No Cases Found",
          description: 
            category !== "all" || status !== "all" 
              ? "No cases match your current filters."
              : user?.role === 'CLIENT' 
                ? "You don't have any cases yet. Create your first case to get started."
                : "No cases have been assigned to you yet.",
          showCreateButton: user?.role === 'CLIENT',
          createButtonText: "Create Your First Case",
          createButtonHref: "/create-case",
        }}
      />
    </div>
  );
}

export default function MyCasesPage() {
  return (
    <MainLayout headerTitle="My Cases" showFooter={false}>
      <MyCasesContent />
    </MainLayout>
  );
}