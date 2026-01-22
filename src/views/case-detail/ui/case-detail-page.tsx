"use client";
import { MainLayout } from "@/widgets/layout";
import { useEffect, useState } from "react";
import { useAuth } from "@/shared/lib/auth";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
// import UserIcon from "../../../../public/icons/people.svg";
import ClipIcon from "../../../../public/icons/clip.svg";

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

interface Party {
  name: string;
  role: string;
  email?: string;
}

interface KeyEvent {
  id: string;
  date: string;
  description: string;
  documents?: {
    name: string;
    url: string;
    type: string;
  }[];
}

interface Lawyer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
  experience: number;
  rating: number;
  hourlyRate: number;
  profileImage?: string;
  hasRequestedAccess: boolean;
}

export function CaseDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  const [case_, setCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loadingLawyers, setLoadingLawyers] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Mock data for demonstration - in real app this would come from API
  const mockParties: Party[] = [
    { name: "LionTech Pte Ltd", role: "Employer", email: "hr@liontech.com" },
    { name: "Alex Chen", role: "Employee", email: "alex.chen@email.com" },
  ];

  const mockKeyEvents: KeyEvent[] = [
    {
      id: "1",
      date: "8 Jul 2025",
      description:
        "LionTech's HR department informed me of immediate termination due to 'company restructuring' without prior consultation.",
      documents: [
        { name: "TerminationLetter_LionTech.pdf", url: "#", type: "pdf" },
        { name: "photo.jpg", url: "#", type: "image" },
      ],
    },
    {
      id: "2",
      date: "12 Jul 2025",
      description:
        "I sent a formal email to HR and my line manager requesting clarification on the termination clause, but received no response.",
      documents: [{ name: "EmailThread_July15", url: "#", type: "email" }],
    },
  ];

  const mockLawyers: Lawyer[] = [
    {
      id: "1",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@lawfirm.com",
      specialization: "Employment Law",
      experience: 8,
      rating: 4.8,
      hourlyRate: 350,
      hasRequestedAccess: false,
    },
    {
      id: "2",
      firstName: "Michael",
      lastName: "Wong",
      email: "michael@legalpartners.com",
      specialization: "Employment & Labor Law",
      experience: 12,
      rating: 4.9,
      hourlyRate: 450,
      hasRequestedAccess: true,
    },
    {
      id: "3",
      firstName: "Linda",
      lastName: "Tan",
      email: "linda@advocategroup.com",
      specialization: "Contract & Employment Law",
      experience: 6,
      rating: 4.7,
      hourlyRate: 300,
      hasRequestedAccess: false,
    },
  ];

  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cases/${caseId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Case not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setCase(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch case");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch case");
        console.error("Error fetching case:", err);
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  useEffect(() => {
    // Load available lawyers when case is loaded
    const fetchLawyers = async () => {
      if (!case_ || activeTab !== "engagement") return;

      try {
        setLoadingLawyers(true);
        const response = await fetch("/api/lawyers/available", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setLawyers(data.data);
          } else {
            console.error("Failed to fetch lawyers:", data.message);
            // Fallback to mock data
            setLawyers(mockLawyers);
          }
        } else {
          console.error("Failed to fetch lawyers");
          // Fallback to mock data
          setLawyers(mockLawyers);
        }
      } catch (error) {
        console.error("Error fetching lawyers:", error);
        // Fallback to mock data
        setLawyers(mockLawyers);
      } finally {
        setLoadingLawyers(false);
      }
    };

    fetchLawyers();
  }, [case_, activeTab]);

  // Fetch pending access requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!case_ || activeTab !== "engagement" || user?.role !== "CLIENT")
        return;

      try {
        setLoadingRequests(true);
        const response = await fetch(`/api/cases/${case_.id}/requests`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setPendingRequests(data.data || []);
          }
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchPendingRequests();
  }, [case_, activeTab, user]);

  const getCategoryLabel = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "text-success";
      case "IN_PROGRESS":
        return "text-blue-600";
      case "CLOSED":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Open";
      case "IN_PROGRESS":
        return "In Progress";
      case "CLOSED":
        return "Closed";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleRequestAccess = async (lawyerId: string) => {
    if (!case_) return;

    try {
      const response = await fetch(`/api/cases/${case_.id}/access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ lawyerId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update the lawyer's hasRequestedAccess status
        setLawyers((prev) =>
          prev.map((lawyer) =>
            lawyer.id === lawyerId
              ? { ...lawyer, hasRequestedAccess: true }
              : lawyer,
          ),
        );

        alert("Access requested successfully!");
      } else {
        alert(data.message || "Failed to request access");
      }
    } catch (error) {
      console.error("Error requesting access:", error);
      alert("Failed to request access");
    }
  };

  const handleApproveRequest = async (requestId: string, lawyerId: string) => {
    if (!case_) return;

    try {
      const response = await fetch(`/api/cases/${case_.id}/access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ lawyerId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Remove from pending requests
        setPendingRequests((prev) =>
          prev.filter((req) => req.id !== requestId),
        );
        alert("Access approved successfully!");
      } else {
        alert(data.message || "Failed to approve access");
      }
    } catch (error) {
      console.error("Error approving access:", error);
      alert("Failed to approve access");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!case_) return;

    try {
      const response = await fetch(
        `/api/cases/${case_.id}/requests/${requestId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Remove from pending requests
        setPendingRequests((prev) =>
          prev.filter((req) => req.id !== requestId),
        );
        alert("Access request rejected");
      } else {
        alert(data.message || "Failed to reject access");
      }
    } catch (error) {
      console.error("Error rejecting access:", error);
      alert("Failed to reject access");
    }
  };

  if (loading) {
    return (
      <MainLayout headerTitle="Case Details" showFooter={false}>
        <div className="space-y-6 bg-white p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded mb-3 w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !case_) {
    return (
      <MainLayout headerTitle="Case Details" showFooter={false}>
        <div className="space-y-6 bg-white p-6">
          <div className="text-center py-12">
            <div className="text-error text-lg mb-2">⚠️</div>
            <p className="text-error mb-4">{error || "Case not found"}</p>
            <button
              onClick={() => router.push("/my-cases")}
              className="bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-orange-600 transition-colors"
            >
              Back to My Cases
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout headerTitle="Case Details" showFooter={false}>
      <div className="space-y-6 bg-white p-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-1 text-sm text-sub600 mb-4">
          <Link href="/my-cases" className="hover:text-brand">
            My Cases
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-strong900 truncate max-w-xs">
            {case_.title}
          </span>
        </nav>

        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1 text-sm font-medium ${getStatusColor(case_.status)}`}
              >
                <div className="w-2 h-2 rounded-full bg-current"></div>
                {getStatusLabel(case_.status)}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-strong900 mb-2">
              {case_.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-sub600">
              <span>{getCategoryLabel(case_.category)}</span>
              <span>•</span>
              <span>Created on {formatDate(case_.createdAt)}</span>
            </div>
          </div>

          <button className="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-orange-600 transition-colors">
            Send LOI
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {["details", "engagement", "documents"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? "border-brand text-brand"
                    : "border-transparent text-sub600 hover:text-strong900 hover:border-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="space-y-8">
            {/* Case Summary */}
            <div>
              <h2 className="text-lg font-semibold text-strong900 mb-4">
                Case Summary
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-sub600 leading-relaxed">
                  {case_.description ||
                    "No description provided for this case."}
                </p>
              </div>
            </div>

            {/* Parties Involved */}
            <div>
              <h2 className="text-lg font-semibold text-strong900 mb-4">
                Parties Involved
              </h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-sub600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-sub600 uppercase tracking-wider">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockParties.map((party, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-strong900">
                          {party.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-sub600">
                          {party.role}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Events */}
            <div>
              <h2 className="text-lg font-semibold text-strong900 mb-4">
                Key Events
              </h2>
              <div className="space-y-4">
                {mockKeyEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0">
                        <div className="w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-strong900 mb-1">
                          {event.date}
                        </div>
                        <p className="text-sm text-sub600 mb-3">
                          {event.description}
                        </p>

                        {event.documents && event.documents.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {event.documents.map((doc, docIndex) => (
                              <a
                                key={docIndex}
                                href={doc.url}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-sub600 text-xs rounded-full hover:bg-gray-200 transition-colors"
                              >
                                <Image
                                  src={ClipIcon}
                                  alt="Attachment"
                                  className="w-3 h-3"
                                />
                                {doc.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "engagement" && (
          <div className="space-y-6">
            {/* Pending Access Requests - Only for case owners */}
            {user?.role === "CLIENT" && pendingRequests.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-strong900 mb-2">
                  Pending Access Requests
                </h2>
                <p className="text-sm text-sub600 mb-4">
                  Review and approve access requests from lawyers.
                </p>
                <div className="space-y-3 mb-8">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border border-orange-200 bg-orange-50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {request.lawyer.firstName[0]}
                              {request.lawyer.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-strong900">
                              {request.lawyer.firstName}{" "}
                              {request.lawyer.lastName}
                            </h3>
                            <p className="text-sm text-sub600">
                              {request.lawyer.specialization}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleApproveRequest(
                                request.id,
                                request.lawyer.id,
                              )
                            }
                            className="px-3 py-1.5 bg-success text-white rounded text-sm hover:bg-green-600 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="px-3 py-1.5 bg-error text-white rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-strong900 mb-2">
                Available Lawyers
              </h2>
              <p className="text-sm text-sub600 mb-6">
                Review and request access from qualified lawyers who can assist
                with your case.
              </p>
            </div>

            {loadingLawyers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-6 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3 w-2/3"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lawyers.map((lawyer) => (
                  <div
                    key={lawyer.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {lawyer.firstName[0]}
                            {lawyer.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-strong900">
                            {lawyer.firstName} {lawyer.lastName}
                          </h3>
                          <p className="text-sm text-sub600">
                            {lawyer.specialization}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm font-medium">
                            {lawyer.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-sub600">Experience:</span>
                        <span className="text-strong900">
                          {lawyer.experience} years
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-sub600">Hourly Rate:</span>
                        <span className="text-strong900">
                          ${lawyer.hourlyRate}/hr
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {lawyer.hasRequestedAccess ? (
                        <button
                          disabled
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
                        >
                          Access Requested
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRequestAccess(lawyer.id)}
                          className="flex-1 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-orange-600 transition-colors"
                        >
                          Request Access
                        </button>
                      )}
                      <button className="px-4 py-2 border border-gray-300 text-sub600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-strong900 mb-2">
                Case Documents
              </h2>
              <p className="text-sm text-sub600 mb-6">
                All documents related to this case are listed below.
              </p>
            </div>

            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-strong900 mb-2">
                Documents Coming Soon
              </h3>
              <p className="text-sub600">
                Document management functionality will be available soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
