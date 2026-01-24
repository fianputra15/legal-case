'use client';

import React from 'react';
import { CaseCard, CaseCardProps } from '../case-card';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

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
  onRequestSuccess?: (caseId: string) => void;
  onRequestError?: (message: string) => void;
  onWithdrawSuccess?: (caseId: string) => void;
  onWithdrawError?: (message: string) => void;
  onEdit?: (caseId: string) => void;
  pagination?: PaginationProps;
}

export const CaseList: React.FC<CaseListProps> = ({
  cases,
  loading = false,
  error,
  emptyStateConfig,
  onRetry,
  onRequestAccess,
  onWithdrawRequest,
  onRequestSuccess,
  onRequestError,
  onWithdrawSuccess,
  onWithdrawError,
  onEdit,
  pagination,
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

  // Helper function to generate page numbers
  const getPageNumbers = () => {
    if (!pagination) return [];
    
    const { currentPage, totalPages } = pagination;
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Cases grid with pagination
  return (
    <div className="space-y-6">
      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cases.map((caseItem) => (
          <CaseCard 
            key={caseItem.id} 
            {...caseItem} 
            onRequestAccess={onRequestAccess}
            onWithdrawRequest={onWithdrawRequest}
            onRequestSuccess={onRequestSuccess}
            onRequestError={onRequestError}
            onWithdrawSuccess={onWithdrawSuccess}
            onWithdrawError={onWithdrawError}
            onEdit={onEdit}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          {/* Mobile pagination */}
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>

          {/* Desktop pagination */}
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {Math.min((pagination.currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                {/* Previous button */}
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((page, index) => (
                  page === 'ellipsis' ? (
                    <span key={index} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                      ...
                    </span>
                  ) : (
                    <button
                      key={index}
                      onClick={() => pagination.onPageChange(page as number)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        pagination.currentPage === page
                          ? 'z-10 bg-brand text-white ring-brand'
                          : 'text-gray-900'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}

                {/* Next button */}
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};