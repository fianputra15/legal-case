"use client";
  import { MainLayout } from "@/widgets/layout";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/lib/auth";
import { CaseList, CaseFilters, CaseCardProps } from '@/shared/ui';
import { apiClient, ApiError } from '@/shared/api';
import { ApiResponse, CasesListResponse } from '@/shared/types';
import { useRouter } from "next/navigation";
import { useAccessRequest } from "@/features";


export default function HomePage() {
  const { user } = useAuth();
  const { handleRequestAccess } = useAccessRequest();
  const router = useRouter();
  const [cases, setCases] = useState<CaseCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [totalCases, setTotalCases] = useState(0);

  // Filter states
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10); // Fixed items per page


  const handleEdit = useCallback((caseId: string) => {
    router.push(`/edit-case/${caseId}`);
  }, [router]);

  const handleRequestSuccess = (caseId: string) => {
    // Update the case in local state to show pending request
    setCases(prevCases => 
      prevCases.map(c => 
        c.id === caseId 
          ? { ...c, hasPendingRequest: true, requestedAt: new Date().toISOString() }
          : c
      )
    );
    
    alert('Access request submitted successfully!');
  };

  const handleRequestError = (message: string) => {
    alert(`Failed to request access: ${message}`);
  };

  const handleWithdrawSuccess = (caseId: string) => {
    // Update the cases to remove pending request
    setCases(prevCases =>
      prevCases.map(caseItem =>
        caseItem.id === caseId
          ? { ...caseItem, hasPendingRequest: false, requestedAt: null }
          : caseItem
      )
    );
    
    alert('Access request withdrawn successfully!');
  };

  const handleWithdrawError = (message: string) => {
    alert(`Failed to withdraw request: ${message}`);
  };

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams();
        if (category !== "all") params.append("category", category);
        if (status !== "all") params.append("status", status);
        params.append("page", currentPage.toString());
        params.append("limit", itemsPerPage.toString());
        params.append("sortBy", sortBy);

        const response = await apiClient.get<ApiResponse<CasesListResponse>>(`/api/cases?${params.toString()}`);
        
        const casesData = (response.data?.cases || []).map((caseItem) => ({
          ...caseItem,
          createdAt: typeof caseItem.createdAt === 'string' ? caseItem.createdAt : caseItem.createdAt.toISOString(),
          updatedAt: typeof caseItem.updatedAt === 'string' ? caseItem.updatedAt : caseItem.updatedAt.toISOString(),
          userRole: user?.role as 'CLIENT' | 'LAWYER' | 'ADMIN',
          showOwner: user?.role === 'LAWYER', // Show owner for lawyers
          onRequestAccess: handleRequestAccess,
          onEdit: handleEdit,
        }));
        
        setCases(casesData);
        const total = response.data?.pagination?.total || response.data?.cases?.length || 0;
        setTotalCases(total);
        setTotalPages(Math.ceil(total / itemsPerPage));
      } catch (err) {
        console.error('Error fetching cases:', err);
        if (err instanceof ApiError) {
          setError(`Failed to load cases: ${err.message}`);
        } else {
          setError('Failed to load cases. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [category, status, sortBy, currentPage, user, handleEdit, itemsPerPage, handleRequestAccess]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, status, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout headerTitle="Browse Cases" showFooter={false}>
      <div className="space-y-6 bg-white p-6">
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
          onRequestSuccess={handleRequestSuccess}
          onRequestError={handleRequestError}
          onWithdrawSuccess={handleWithdrawSuccess}
          onWithdrawError={handleWithdrawError}
          onEdit={handleEdit}
          emptyStateConfig={{
            title: "No Cases Found",
            description: 
              category !== "all" || status !== "all"
                ? "No cases match your current filters."
                : "No cases are available at the moment.",
            showCreateButton: user?.role === 'CLIENT',
            createButtonText: "Create Your First Case",
            createButtonHref: "/create-case",
          }}
          pagination={{
            currentPage,
            totalPages,
            itemsPerPage,
            totalItems: totalCases,
            onPageChange: handlePageChange,
          }}
        />
      </div>
    </MainLayout>
  );
}
