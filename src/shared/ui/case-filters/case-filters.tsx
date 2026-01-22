'use client';

import React from 'react';
import { caseFilterOptions } from '@/shared/lib/case-utils';

interface CaseFiltersProps {
  category: string;
  status: string;
  sortBy: string;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  onSortChange: (sortBy: string) => void;
  totalCases: number;
  filteredCount: number;
}

export const CaseFilters: React.FC<CaseFiltersProps> = ({
  category,
  status,
  sortBy,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  totalCases,
  filteredCount,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-sub600">
            Category:
          </label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {caseFilterOptions.categories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-sub600">Status:</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {caseFilterOptions.statuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-sub600">
          Showing {filteredCount} of {totalCases} cases
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-sub600">Sort by:</label>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          {caseFilterOptions.sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};