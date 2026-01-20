"use client";
import { MainLayout } from "@/widgets/layout";
import { useEffect, useState } from "react";
import UserIcon from "../../../../public/icons/people.svg";
import ClipIcon from "../../../../public/icons/clip.svg";
import CircleMarkedIcon from "../../../../public/icons/circle-marked.svg";
import Image from "next/image";

interface Case {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
  description?: string;
  ownerId: string;
  attachments?: number;
}

interface CasesResponse {
  success: boolean;
  data: {
    cases: Case[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    userRole: string;
  };
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

const timeOptions = [
  { value: "any", label: "Any time" },
  { value: "1d", label: "Last 24 hours" },
  { value: "3d", label: "Last 3 days" },
  { value: "1w", label: "Last week" },
  { value: "1m", label: "Last month" },
];

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title A-Z" },
];

export default function HomePage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCases, setTotalCases] = useState(0);

  // Filter states
  const [jurisdiction, setJurisdiction] = useState("singapore");
  const [category, setCategory] = useState("all");
  const [posted, setPosted] = useState("any");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (category !== "all") params.append("category", category);

        const response = await fetch(`/api/cases?${params.toString()}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CasesResponse = await response.json();

        if (data.success) {
          setCases(data.data.cases);
          setTotalCases(data.data.pagination.total);
        } else {
          throw new Error("Failed to fetch cases");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch cases");
        console.error("Error fetching cases:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [category]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Posted today";
    if (diffDays === 1) return "Posted 1 day ago";
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    if (diffDays < 14) return "Posted 1 week ago";
    if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
    return `Posted ${Math.floor(diffDays / 30)} months ago`;
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

  const getClientId = (ownerId: string) => {
    // Generate a consistent client ID from owner ID
    const letters = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
    ];
    const numbers =
      Math.abs(ownerId.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) %
      100;
    const letter = letters[Math.abs(ownerId.length) % letters.length];
    return `${letter}, ${numbers}`;
  };

  const hasAccess = (caseItem: Case) => {
    // Generate consistent access based on case ID to avoid random changes
    const hash = caseItem.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return hash % 3 !== 0; // About 67% will have access
  };

  const getAttachmentCount = (caseId: string) => {
    // Generate consistent attachment count based on case ID
    const hash = caseId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return hash % 6; // 0-5 attachments
  };

  return (
    <MainLayout headerTitle="Browse Cases" showFooter={false}>
      <div className="space-y-6 bg-white p-6">
        {/* Filters Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-sub600">
                Jurisdiction:
              </label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
              >
                <option value="singapore">Singapore</option>
                <option value="malaysia">Malaysia</option>
                <option value="thailand">Thailand</option>
              </select>
            </div>

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
              <label className="text-sm font-medium text-sub600">Posted:</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                value={posted}
                onChange={(e) => setPosted(e.target.value)}
              >
                {timeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-sub600">
              Showing {cases.length} cases
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
            <p className="text-base">No cases match your current filters.</p>
          </div>
        )}

        {!loading && !error && cases.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cases.map((caseItem) => {
              const caseHasAccess = hasAccess(caseItem);
              return (
                <div
                  key={caseItem.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Category and Location Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-sm text-sub600">
                      <span className="font-medium py-[4px] px-2 border-light border rounded-full text-xs">
                        {getCategoryLabel(caseItem.category)}
                      </span>
                      <span>•</span>
                      <span>Singapore</span>
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

                  {/* Client Info and Attachments */}
                  <div className="flex items-center justify-between pb-4 border-b-light border-b">
                    <div className="flex items-center gap-4 text-sm text-sub600">
                      <div className="flex items-center gap-1">
                        <Image
                          src={UserIcon}
                          alt="Client"
                          className="w-4 h-4"
                        />
                        <span>Client: {getClientId(caseItem.ownerId)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Image
                          src={ClipIcon}
                          alt="Attachments"
                          className="w-4 h-4"
                        />
                        <span>{caseItem.attachments || getAttachmentCount(caseItem.id)} Attachments</span>
                      </div>
                    </div>
                  </div>

                  {/* Access Status */}
                  <div className="flex items-center justify-between pt-4">
                    {caseHasAccess ? (
                      <div className="flex gap-2">
                        <div className="flex items-center gap-2 bg-lighter text-success p-1">
                          <Image
                            src={CircleMarkedIcon}
                            alt="Approved"
                            className="w-4 h-4"
                          />
                          <span className="text-xs text-success font-medium">
                            Approved
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-sub600">
                            Access granted on 15 Oct 2025
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div></div>
                    )}

                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        caseHasAccess
                          ? "bg-gray-100 text-sub600 hover:bg-gray-200"
                          : "bg-brand text-white hover:bg-brand-orange-600"
                      }`}
                    >
                      {caseHasAccess ? "Open Case" : "Request Access"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
