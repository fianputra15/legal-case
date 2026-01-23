'use client';

import React from 'react';
import { CaseCard, CaseCardProps } from '../case-card';

interface CaseListProps {
  cases: CaseCardProps[];
  loading?: boolean;
  error?: string;
  emptyStateConfig?: {
    title: string;
    description: string;
    showCreateButton?: boolean;
    createButtonText?: string;
    createButtonHref?: string;
  };
  onRetry?: () => void;
  onRequestAccess?: (caseId: string) => void;
  onWithdrawRequest?: (caseId: string) => void;
  onEdit?: (caseId: string) => void;
}

export const CaseList: React.FC<CaseListProps> = ({
  cases,
  loading = false,
  error,
  emptyStateConfig,
  onRetry,
  onRequestAccess,
  onWithdrawRequest,
  onEdit,
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded mb-3"></div>
            <div className="h-16 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-error text-lg mb-2">⚠️</div>
        <p className="text-error mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-error text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // Empty state
  if (cases.length === 0 && emptyStateConfig) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-strong900 mb-1">
          {emptyStateConfig.title}
        </h3>
        <p className="text-base mb-4">
          {emptyStateConfig.description}
        </p>
        {emptyStateConfig.showCreateButton && emptyStateConfig.createButtonHref && (
          <a
            href={emptyStateConfig.createButtonHref}
            className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand-orange-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {emptyStateConfig.createButtonText || 'Create New Case'}
          </a>
        )}
      </div>
    );
  }

  // Cases grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cases.map((caseItem) => (
        <CaseCard 
          key={caseItem.id} 
          {...caseItem} 
          onRequestAccess={onRequestAccess}
          onWithdrawRequest={onWithdrawRequest}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};