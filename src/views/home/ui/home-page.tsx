"use client";
import { MainLayout } from "@/widgets/layout";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/lib/auth";
import { CaseList, CaseFilters, CaseCardProps } from '@/shared/ui';
import { apiClient, ApiError } from '@/shared/api';
import { useRouter } from "next/navigation";



export default function HomePage() {
  const { user } = useAuth();
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

  const handleRequestAccess = async (caseId: string) => {
    try {
      await apiClient.post(`/api/cases/${caseId}/request-access`);
      
      // Update the case in local state to show pending request
      setCases(prevCases => 
        prevCases.map(c => 
          c.id === caseId 
            ? { ...c, hasPendingRequest: true, requestedAt: new Date().toISOString() }
            : c
        )
      );
      
      alert('Access request submitted successfully!');
    } catch (error) {
      if (error instanceof ApiError) {
        alert(`Failed to request access: ${error.message}`);
      } else {
        alert('Failed to request access');
      }
    }
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

        const response = await apiClient.get<any>(`/api/cases?${params.toString()}`);
        
        const casesData = (response.data?.cases || []).map((caseItem: any) => ({
          ...caseItem,
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
  }, [category, status, sortBy, currentPage, user, handleEdit, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [category, status, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          onRequestAccess={handleRequestAccess}
          onWithdrawRequest={handleWithdrawRequest}
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
