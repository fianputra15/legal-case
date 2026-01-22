'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { CaseCardProps } from '@/shared/ui';
import { formatDate, getCategoryLabel, getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel } from '@/shared/lib/case-utils';

interface UseCasesProps {
  apiEndpoint: '/api/cases' | '/api/my-cases';
  userRole?: 'CLIENT' | 'LAWYER' | 'ADMIN';
}

interface UseCasesReturn {
  cases: CaseCardProps[];
  loading: boolean;
  error: string;
  totalCases: number;
  loadCases: () => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  category: string;
  setCategory: (category: string) => void;
  status: string;
  setStatus: (status: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  filteredCases: CaseCardProps[];
}

export const useCases = ({ apiEndpoint, userRole }: UseCasesProps): UseCasesReturn => {
  const [cases, setCases] = useState<CaseCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [totalCases, setTotalCases] = useState(0);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const loadCases = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (category !== "all") params.append("category", category);
      if (status !== "all") params.append("status", status);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      // Dynamic import to avoid server-side issues
      const { apiClient, ApiError } = await import('@/shared/api');
      
      const response = await apiClient.get<any>(`${apiEndpoint}?${params.toString()}`);
      const casesData = (response.data?.cases || []).map((caseItem: any) => ({
        ...caseItem,
        userRole,
        showOwner: apiEndpoint === '/api/cases' && userRole === 'LAWYER',
      }));
      
      setCases(casesData);
      setTotalCases(response.data?.pagination?.total || casesData.length || 0);
    } catch (err) {
      const { ApiError } = await import('@/shared/api');
      if (err instanceof ApiError) {
        setError(`Failed to load cases: ${err.message}`);
      } else {
        setError('Failed to load cases');
      }
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, category, status, searchTerm, userRole]);

  // Client-side filtering and sorting for immediate response
  const filteredCases = useMemo(() => {
    let filtered = [...cases];

    // Apply search filter (client-side backup)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(caseItem => 
        caseItem.title.toLowerCase().includes(term) ||
        (caseItem.description?.toLowerCase().includes(term))
      );
    }

    // Sort cases
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'priority':
          return b.priority - a.priority;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [cases, searchTerm, sortBy]);

  return {
    cases,
    loading,
    error,
    totalCases,
    loadCases,
    searchTerm,
    setSearchTerm,
    category,
    setCategory,
    status,
    setStatus,
    sortBy,
    setSortBy,
    filteredCases,
  };
};