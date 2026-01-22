"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import UserIcon from "../../../../public/icons/people.svg";
import ClipIcon from "../../../../public/icons/clip.svg";
import Clock from "../../../../public/icons/clock.svg";
import Warning from "../../../../public/icons/warning.svg";
import { formatDate, getCategoryLabel } from "@/shared/lib/case-utils";
import { useModal } from "@/shared/providers/modal-provider";
import Typography from "../typography";


export interface CaseCardProps {
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
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  showOwner?: boolean;
  userRole?: "CLIENT" | "LAWYER";
  hasAccess?: boolean;
  hasPendingRequest?: boolean;
  requestedAt?: string | null;
  onRequestAccess?: (caseId: string) => void;
  onWithdrawRequest?: (caseId: string) => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({
  id,
  title,
  description,
  category,
  createdAt,
  attachments,
  owner,
  userRole,
  hasAccess = false,
  hasPendingRequest = false,
  requestedAt = null,
  onRequestAccess,
  onWithdrawRequest,
}) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { showModal } = useModal();
  const getAttachmentCount = (caseId: string) => {
    // Generate consistent attachment count based on case ID
    const hash = caseId.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    return hash % 6; // 0-5 attachments
  };

  const handleWithdrawRequest = () => {
    showModal({
      title: <div className="flex items-center gap-3 font-medium text-sm"><Image src={Warning} width={19} height={19} alt="warning" /> Withdraw Access Request</div>,
      description: `You’ll be removed from the client’s list of requesting lawyers. You can request access again later.`,
      confirmText: "Withdraw",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        if (onWithdrawRequest) {
          setIsWithdrawing(true);
          try {
            await onWithdrawRequest(id);
          } finally {
            setIsWithdrawing(false);
          }
        }
      },
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow">
      {/* Category and Status Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
          {getCategoryLabel(category)}
        </span>
        <span className="text-xs text-sub600">{formatDate(createdAt)}</span>
      </div>

      {/* Case Title */}
      <h3 className="text-md font-medium text-strong900 mb-2 leading-tight">
        {title}
      </h3>

      {/* Case Description */}
      <p className="text-sm text-sub600 mb-4 line-clamp-3">
        {description || "No description available for this case."}
      </p>

      {/* Case Info */}
      <div className="flex items-center justify-between pb-4 border-b-light border-b">
        <div className="flex items-center gap-4 text-sm text-sub600">
          <div className="flex items-center gap-1">
            <Image src={UserIcon} alt="Owner" className="w-4 h-4" />
            <span>
              {owner?.firstName} {owner?.lastName}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Image src={ClipIcon} alt="Attachments" className="w-4 h-4" />
            <span>{attachments || getAttachmentCount(id)} Attachments</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        {hasPendingRequest && (
          <>
            <div className="bg-weak60 px-2 py-1 flex items-center gap-1 rounded-md mr-4">
              <Image
                src={Clock}
                width={16}
                height={16}
                alt="pending-approval"
              />
              <Typography variant="xs" weight="medium" className="text-warning">
                Pending Approval
              </Typography>
            </div>
            <div>
              <Typography variant="xs" weight="normal" className="text-base">
                Requested on {formatDate(requestedAt ?? "")}
              </Typography>
            </div>
          </>
        )}

        <div className="flex gap-2 ml-auto">
          {/* For lawyers browsing cases without access */}
          {userRole === "LAWYER" &&
            !hasAccess &&
            !hasPendingRequest &&
            onRequestAccess && (
              <button
                onClick={() => onRequestAccess(id)}
                className="px-3 py-1.5 text-xs bg-brand text-white rounded hover:bg-brand-orange-600 transition-colors"
              >
                Request Access
              </button>
            )}

          {/* For lawyers with pending requests */}
          {userRole === "LAWYER" && !hasAccess && hasPendingRequest && (
            <button
              onClick={handleWithdrawRequest}
              disabled={isWithdrawing}
              className={`text-sm font-medium p-2 rounded transition-colors ${
                isWithdrawing
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              {isWithdrawing ? "Withdrawing..." : "Withdraw Request"}
            </button>
          )}

          {/* For cases with access or owned cases */}
          {(hasAccess ||
            userRole === "CLIENT" ||
            (userRole === "LAWYER" && hasAccess)) && (
            <>
              <button className="px-3 py-1.5 text-xs border border-gray-300 text-sub600 rounded hover:bg-gray-50 transition-colors">
                Documents
              </button>
              <Link
                href={`/case/${id}`}
                className="px-3 py-1.5 text-xs bg-brand text-white rounded hover:bg-brand-orange-600 transition-colors"
              >
                {userRole === "LAWYER" ? "Open Case" : "View Details"}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
