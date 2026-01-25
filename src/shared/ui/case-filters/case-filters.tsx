"use client";

import React from "react";
import { caseFilterOptions } from "@/shared/lib/case-utils";
import { useAuth } from "@/shared/lib";

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

// Posted options (mapping status to "posted" terminology)
const postedOptions = [
  { value: "all", label: "Any time" },
  { value: "OPEN", label: "Recently posted" },
  { value: "CLOSED", label: "Archived" },
];

export const CaseFilters: React.FC<CaseFiltersProps> = ({
  category,
  status,
  sortBy,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  filteredCount,
}) => {
  const { user } = useAuth();
  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      {/* Left side */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Jurisdiction - Static for now */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-sub600">
            Jurisdiction:
          </label>
          <span className="text-sm font-medium text-gray-900 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
            Singapore
          </span>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-sub600">Category:</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-32"
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

        {/* Posted */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-sub600">Posted:</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-32"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {postedOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Showing count */}
        <div className="text-sm text-sub600">Showing {filteredCount} cases</div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-sub600">Sort by:</label>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-32"
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
