"use client";
import { MainLayout } from "@/widgets/layout";
import { useEffect, useState } from "react";
import { useAuth } from "@/shared/lib/auth";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import FileIcon from "../../../../public/icons/file-text.svg";
import ArrowRight from "../../../../public/icons/arrow-right.svg";
import BrowseIcon from "../../../../public/icons/page-text-search.svg";
import SquareArrowIcon from "../../../../public/icons/square-arrow.svg";
import { DocumentManager } from "@/widgets/document-manager";
import { PendingRequestCard } from "@/features/case-request-access";
import { LoadingShimmers } from "@/shared/ui";

interface CaseAccessRequest {
  id: string;
  lawyer: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  status: string;
  requestedAt: string;
}

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

export function CaseDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  const [cases, setCases] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [pendingRequests, setPendingRequests] = useState<CaseAccessRequest[]>(
    [],
  );
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);

  // Callback functions for PendingRequestCard
  const handleApprovedSuccess = (requestId: string) => {
    // Remove from pending requests
    setPendingRequests((prev) =>
      prev.filter((req) => req.id !== requestId),
    );
    alert("Access approved successfully!");
  };

  const handleRejectedSuccess = (requestId: string) => {
    // Remove from pending requests  
    setPendingRequests((prev) =>
      prev.filter((req) => req.id !== requestId),
    );
    alert("Access request rejected successfully!");
  };

  const handleRequestError = (message: string) => {
    alert(`Error: ${message}`);
  };

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
          setCases(data.data);
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

  // Fetch pending access requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!cases || activeTab !== "engagement" || user?.role !== "CLIENT")
        return;

      try {
        setLoadingRequests(true);
        const response = await fetch(`/api/cases/${cases.id}/request-access`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          if (data.success) {
            setPendingRequests(data.data?.requests || []);
            console.log("Pending requests:", data.data?.requests || []);
          }
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchPendingRequests();
  }, [cases, activeTab, user]);

  const getCategoryLabel = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Open";
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

  const handleDocumentCountChange = (count: number) => {
    setDocumentCount(count);
  };

  if (!cases) {
    return (
      <MainLayout
        headerTitle={
          <div className="flex justify-between">
            <div className="flex items-center gap-2 text-sub600 text-sm font-medium">
              <Image
                src={BrowseIcon}
                width={20}
                height={20}
                alt="arrow right"
              />{" "}
              Browse Case{" "}
              <Image
                className="mx-2"
                src={ArrowRight}
                width={6}
                height={6}
                alt="arrow right"
              />{" "}
              -
            </div>
            <button className="ml-auto bg-brand text-white p-1.5 rounded-lg text-sm hover:bg-brand-orange-600 transition-colors">
              Send Loa
            </button>
          </div>
        }
        showSearchBar={false}
        showProfile={false}
        showFooter={false}
      >
        <div className="space-y-6 bg-white p-2">
          {loading ? (
            <div className="space-y-6 bg-white p-6">
              <LoadingShimmers.CaseHeader />
              <div className="space-y-4">
                <LoadingShimmers.Table rows={3} />
                <LoadingShimmers.Timeline events={2} />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-error mb-4">{error || "Case not found"}</p>
              <button
                onClick={() => router.push("/my-cases")}
                className="bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-orange-600 transition-colors"
              >
                Back to My Cases
              </button>
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      headerTitle={
        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-sub600 text-sm font-medium">
            <Image src={BrowseIcon} width={20} height={20} alt="arrow right" />{" "}
            Browse Case{" "}
            <Image
              className="mx-2"
              src={ArrowRight}
              width={6}
              height={6}
              alt="arrow right"
            />{" "}
            {cases.title}
          </div>
          <button className="ml-auto bg-brand text-white p-1.5 rounded-lg text-sm hover:bg-brand-orange-600 transition-colors">
            Send Loa
          </button>
        </div>
      }
      showSearchBar={false}
      showProfile={false}
      showFooter={false}
    >
      <div className="space-y-6 bg-white p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`${cases.status === 'open' ? 'text-success bg-weak60' : 'text-sub600 bg-lighter'} text-xs font-medium  px-2 py-1 flex items-center gap-1 rounded-md mr-4`}>
                <div className="w-2 h-2 rounded-full bg-current"></div>
                {getStatusLabel(cases.status)}
              </div>
            </div>

            <h1 className="text-2xl font-bold text-strong900 mb-2">
              {cases.title}
            </h1>

            <div className="flex items-center gap-2 text-sm text-sub600">
              <span className="text-xs font-medium bg-white px-2 py-1 flex items-center gap-1 rounded-full border-light border">
                {getCategoryLabel(cases.category)}
              </span>
              <span className="text-lg">•</span>
              <span className="text-xs">
                Created on {formatDate(cases.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-4">
            {[
              { key: "details", label: "Details" },
              { key: "engagement", label: "Engagement" },
              {
                key: "documents",
                label: `Documents${documentCount > 0 ? ` (${documentCount})` : ""}`,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? "border-brand text-strong900"
                    : "border-transparent text-sub600 hover:text-strong900 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="space-y-8">
            {/* Case Summary */}
            <div>
              <h2 className="text-md font-semibold text-strong900 mb-4">
                Case Summary
              </h2>
              <p className="text-sm text-sub600 leading-relaxed">
                {cases.description || "No description provided for this case."}
              </p>
            </div>

            {/* Parties Involved */}
            <div>
              <h2 className="text-md font-semibold text-strong900 mb-4">
                Parties Involved
              </h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-weak50">
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
                        <td className="px-4 py-3 text-sm text-strong900">
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
              <h2 className="text-md font-semibold text-strong900 mb-4">
                Key Events
              </h2>
              <ol className="">
                {mockKeyEvents.map((event, index) => (
                  <li
                    key={index}
                    className={`${index < mockKeyEvents.length - 1 ? "border-s border-light" : ""} pb-6`}
                  >
                    <div className="flex-start flex items-center">
                      <div className="-ms-3.5 me-3 h-7 w-7 rounded-full bg-biege flex items-center justify-center text-xs border-white border-4">
                        {index + 1}
                      </div>
                      <p className="text-sm text-strong900">{event.date}</p>
                    </div>
                    <div className="border-light border ml-5 p-2 rounded-md space-y-2 mt-2 ">
                      <p className="text-sub600">{event.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {event.documents?.map((doc, docIndex) => (
                          <div
                            key={docIndex}
                            className="border-light px-2 py-1.5 text-sub600 flex items-center gap-1 rounded-md border"
                          >
                            <Image
                              src={FileIcon}
                              alt="Attachment"
                              className="w-4 h-4"
                            />
                            <span className="pr-2 border-r border-light">
                              {doc.name}
                            </span>
                            <button
                              onClick={() => window.open("https://google.com")}
                              className="text-xs text-brand underline cursor-pointer"
                            >
                              <Image src={SquareArrowIcon} alt="Download" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {activeTab === "engagement" && (
          <div className="space-y-6">
            {loadingRequests && (
              <LoadingShimmers.PendingRequests />
            )}
            {!pendingRequests.length && !loadingRequests && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-strong900 mb-2">
                  No Pending Requests
                </h3>
                <p className="text-sub600">
                  There are currently no pending access requests for this case.
                </p>
              </div>
            )}
            {/* Pending Access Requests - Only for case owners */}
            {user?.role === "CLIENT" && pendingRequests.length > 0 && (
              <div>
                <span className="text-lg font-semibold text-sub600 mb-2">
                  Pending Access Requests
                </span>
                <p className="text-sm text-sub600 mb-4">
                  Review and approve access requests from lawyers.
                </p>

                <div className="space-y-3 mb-8">
                  {pendingRequests.map((request) => (
                    <PendingRequestCard
                      key={request.id}
                      request={request}
                      caseId={cases!.id}
                      onApproved={handleApprovedSuccess}
                      onRejected={handleRejectedSuccess}
                      onError={handleRequestError}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <DocumentManager
            caseId={caseId}
            onDocumentCountChange={handleDocumentCountChange}
            isReadOnly={cases?.status === 'CLOSED'}
            readOnlyReason={cases?.status === 'CLOSED' ? "This case is closed. Document uploads are not allowed, but you can still view and download existing documents." : undefined}
          />
        )}
      </div>
    </MainLayout>
  );
}
