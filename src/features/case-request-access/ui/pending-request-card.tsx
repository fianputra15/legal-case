"use client";
import { useAccessRequest } from "../model";

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

interface PendingRequestCardProps {
  request: CaseAccessRequest;
  caseId: string;
  onApproved?: (requestId: string) => void;
  onRejected?: (requestId: string) => void;
  onError?: (message: string) => void;
}

export function PendingRequestCard({ 
  request, 
  caseId, 
  onApproved, 
  onRejected, 
  onError 
}: PendingRequestCardProps) {
  const { isProcessing, handleApproveAccess, handleRejectRequest } = useAccessRequest();

  const handleApprove = () => {
    handleApproveAccess(
      caseId, 
      request.lawyer.id, 
      () => onApproved?.(request.id),
      onError
    );
  };

  const handleReject = () => {
    handleRejectRequest(
      caseId,
      request.lawyer.id,
      request.id,
      () => onRejected?.(request.id),
      onError
    );
  };

  return (
    <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
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
              {request.lawyer.firstName} {request.lawyer.lastName}
            </h3>
            <p className="text-sm text-sub600">
              {request.lawyer.specialization}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="px-3 py-1.5 bg-transparent text-error rounded text-sm hover:font-semibold cursor-pointer transition-colors font-medium disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Reject"}
          </button>
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="px-3 py-1.5 bg-brand text-white rounded text-sm hover:bg-brand-orange-600 transition-colors disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}