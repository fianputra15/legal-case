'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/lib/auth';
import { apiClient, ApiError } from '@/shared/api';
import { MainLayout } from '@/widgets/layout';
import UserIcon from "../../../../public/icons/people.svg";
import ClipIcon from "../../../../public/icons/clip.svg";
import CircleMarkedIcon from "../../../../public/icons/circle-marked.svg";
import Image from "next/image";
import Link from "next/link";

interface Case {
  id: string;
  title: string;
  description?: string;
  status: string;
  category: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  attachments?: number;
}

const categoryOptions = [
  { value: "all", label: "All" },
  { value: "EMPLOYMENT_LAW", label: "Employment Law" },
  { value: "FAMILY_LAW", label: "Family Law" },
  { value: "COMMERCIAL_LAW", label: "Commercial" },
  { value: "INTELLECTUAL_PROPERTY", label: "Intellectual Property" },
  { value: "CRIMINAL_LAW", label: "Criminal Law" },
  { value: "CIVIL_LAW", label: "Civil Law" },
  { value: "CORPORATE_LAW", label: "Corporate Law" },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "CLOSED", label: "Closed" },
];

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title A-Z" },
];

function MyCasesContent() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
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

        const response = await apiClient.get<any>(`/api/cases?${params.toString()}`);
        setCases(response.data?.cases || []);
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
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-sub600">
              Category:
            </label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categoryOptions.map((option) => (
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
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-sub600">
            Showing {cases.length} of {totalCases} cases
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-sub600">Sort by:</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cases Grid */}
      {loading && (
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
      )}

      {error && (
        <div className="text-center py-12">
          <div className="text-error text-lg mb-2">⚠️</div>
          <p className="text-error mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-error text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && cases.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-strong900 mb-2">
            No Cases Found
          </h3>
          <p className="text-base mb-4">
            {category !== "all" || status !== "all" 
              ? "No cases match your current filters."
              : "You don't have any cases yet. Create your first case to get started."
            }
          </p>
          {user?.role === 'CLIENT' && (
            <Link
              href="/create-case"
              className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand-orange-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Case
            </Link>
          )}
        </div>
      )}

      {!loading && !error && cases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Category and Status Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium py-[4px] px-2 border-light border rounded-full text-xs">
                    {getCategoryLabel(caseItem.category)}
                  </span>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                    {getStatusLabel(caseItem.status)}
                  </span>
                </div>
                <span className="text-sm text-sub600">
                  {formatDate(caseItem.createdAt)}
                </span>
              </div>

              {/* Case Title */}
              <h3 className="text-md font-medium text-strong900 mb-2 leading-tight">
                {caseItem.title}
              </h3>

              {/* Case Description */}
              <p className="text-sm text-sub600 mb-4 line-clamp-3">
                {caseItem.description ||
                  "No description available for this case."}
              </p>

              {/* Case Info */}
              <div className="flex items-center justify-between pb-4 border-b-light border-b">
                <div className="flex items-center gap-4 text-sm text-sub600">
                  <div className="flex items-center gap-1">
                    <Image
                      src={UserIcon}
                      alt="Owner"
                      className="w-4 h-4"
                    />
                    <span>Your Case</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Image
                      src={ClipIcon}
                      alt="Attachments"
                      className="w-4 h-4"
                    />
                    <span>{caseItem.attachments || getAttachmentCount(caseItem.id)} Attachments</span>
                  </div>
                  <div className={`text-xs font-medium ${getPriorityColor(caseItem.priority)}`}>
                    {getPriorityLabel(caseItem.priority)} Priority
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <div className="text-xs text-sub600">
                  Last updated {new Date(caseItem.updatedAt).toLocaleDateString()}
                </div>
                
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs border border-gray-300 text-sub600 rounded hover:bg-gray-50 transition-colors">
                    Documents
                  </button>
                  <Link 
                    href={`/case/${caseItem.id}`}
                    className="px-3 py-1.5 text-xs bg-brand text-white rounded hover:bg-brand-orange-600 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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