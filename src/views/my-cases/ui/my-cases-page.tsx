"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/shared/lib/auth";
import { apiClient, ApiError } from "@/shared/api";
import { ApiResponse, CasesListResponse } from "@/shared/types";
import { MainLayout } from "@/widgets/layout";
import { CaseList, CaseFilters, CaseCardProps, Button } from "@/shared/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";

function MyCasesContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [cases, setCases] = useState<CaseCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [totalCases, setTotalCases] = useState(0);

  // Filter states
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const handleEdit = useCallback(
    (caseId: string) => {
      router.push(`/edit-case/${caseId}`);
    },
    [router],
  );

  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        if (category !== "all") params.append("category", category);
        if (status !== "all") params.append("status", status);

        const response = await apiClient.get<ApiResponse<CasesListResponse>>(
          `/api/my-cases?${params.toString()}`,
        );
        const casesData = (response.data?.cases || []).map((caseItem) => ({
          ...caseItem,
          createdAt:
            typeof caseItem.createdAt === "string"
              ? caseItem.createdAt
              : caseItem.createdAt.toISOString(),
          updatedAt:
            typeof caseItem.updatedAt === "string"
              ? caseItem.updatedAt
              : caseItem.updatedAt.toISOString(),
          userRole: user?.role as "CLIENT" | "LAWYER" | "ADMIN",
          showOwner: user?.role === "LAWYER", // Show owner for lawyers in My Cases too
          onEdit: handleEdit,
        }));
        setCases(casesData);
        setTotalCases(
          response.data?.pagination?.total || response.data?.cases?.length || 0,
        );
      } catch (error) {
        if (error instanceof ApiError) {
          setError(`Failed to load cases: ${error.message}`);
        } else {
          setError("Failed to load cases");
        }
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, [category, status, user, router, sortBy, handleEdit]);

  return (
    <div className="space-y-6 bg-white p-6">
      {/* Header Section */}
      <div className="mb-6">
        {user?.role === "CLIENT" && (
          <div className="flex">
            <Button
              onClick={() => router.push("/create-case")}
              className="ml-auto"
              variant="default"
            >
              Add Case
            </Button>
          </div>
        )}
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
        onEdit={handleEdit}
        emptyStateConfig={{
          title: "No Cases Found",
          description:
            category !== "all" || status !== "all"
              ? "No cases match your current filters."
              : user?.role === "CLIENT"
                ? "You don't have any cases yet. Create your first case to get started."
                : "No cases have been assigned to you yet.",
          showCreateButton: user?.role === "CLIENT",
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
