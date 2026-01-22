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
          userRole: user?.role,
          showOwner: false,
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Created today";
    if (diffDays === 1) return "Created 1 day ago";
    if (diffDays < 7) return `Created ${diffDays} days ago`;
    if (diffDays < 14) return "Created 1 week ago";
    if (diffDays < 30) return `Created ${Math.floor(diffDays / 7)} weeks ago`;
    return `Created ${Math.floor(diffDays / 30)} months ago`;
  };

  const getCategoryLabel = (category: string) => {
    const option = categoryOptions.find((opt) => opt.value === category);
    return (
      option?.label ||
      category
        .split("_")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ")
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Open';
      case 'IN_PROGRESS': return 'In Progress';
      case 'CLOSED': return 'Closed';
      default: return status;
    }
  };

  const getAttachmentCount = (caseId: string) => {
    // Generate consistent attachment count based on case ID
    const hash = caseId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return hash % 6; // 0-5 attachments
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Urgent';
      default: return 'Medium';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-gray-600';
      case 2: return 'text-blue-600';
      case 3: return 'text-orange-600';
      case 4: return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

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
              : "You don't have any cases yet. Create your first case to get started.",
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