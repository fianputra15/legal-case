"use client";
import { MainLayout } from "@/widgets/layout";
import { useEffect, useState } from "react";
import { useAuth } from "@/shared/lib/auth";
import { CaseList, CaseFilters, CaseCardProps, SearchBar } from '@/shared/ui';
import { apiClient, ApiError } from '@/shared/api';
import Link from "next/link";



export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [cases, setCases] = useState<CaseCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [totalCases, setTotalCases] = useState(0);

  // Filter states
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");

  const handleRequestAccess = async (caseId: string) => {
    console.log(caseId, 'caseId di homepage');
    try {
      await apiClient.post(`/api/cases/${caseId}/request-access`);
      
      // Update the case in local state to show pending request
      setCases(prevCases => 
        prevCases.map(c => 
          c.id === caseId 
            ? { ...c, hasPendingRequest: true }
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
        if (searchTerm.trim()) params.append("search", searchTerm.trim());

        const response = await apiClient.get<any>(`/api/cases?${params.toString()}`);
        
        const casesData = (response.data?.cases || []).map((caseItem: any) => ({
          ...caseItem,
          userRole: user?.role as 'CLIENT' | 'LAWYER' | 'ADMIN',
          showOwner: user?.role === 'LAWYER',
          hasAccess: false, // This should be determined by checking CaseAccess table
          hasPendingRequest: false, // This should be determined by checking CaseAccessRequest table
          onRequestAccess: user?.role === 'LAWYER' ? () => handleRequestAccess(caseItem.id) : undefined,
        }));
        
        setCases(casesData);
        setTotalCases(response.data?.pagination?.total || casesData.length || 0);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`Failed to load cases: ${err.message}`);
        } else {
          setError('Failed to load cases');
        }
        console.error("Error fetching cases:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [category, status, searchTerm, user]);

  return (
    <MainLayout headerTitle="Browse Cases" showFooter={false}>
      <div className="space-y-6 bg-white p-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-strong900 mb-2">
                {user?.role === 'LAWYER' ? 'Browse Cases' : 'Your Cases'}
              </h1>
              <p className="text-sub600">
                {user?.role === 'LAWYER' 
                  ? "Discover and request access to available cases" 
                  : "Manage your legal cases"
                }
              </p>
            </div>
            
            <div className="flex gap-3">
              {isAuthenticated && user?.role === 'CLIENT' && (
                <>
                  <Link
                    href="/my-cases"
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    My Cases
                  </Link>
                  <Link
                    href="/create-case"
                    className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-orange-600 transition-colors"
                  >
                    + Create Case
                  </Link>
                </>
              )}
              
              {isAuthenticated && user?.role === 'LAWYER' && (
                <Link
                  href="/my-cases"
                  className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-orange-600 transition-colors"
                >
                  My Assigned Cases
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search cases by title or description..."
        />

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
              category !== "all" || status !== "all" || searchTerm.trim()
                ? "No cases match your current filters."
                : "No cases are available at the moment.",
            showCreateButton: user?.role === 'CLIENT',
            createButtonText: "Create Your First Case",
            createButtonHref: "/create-case",
          }}
        />
      </div>
    </MainLayout>
  );
}
