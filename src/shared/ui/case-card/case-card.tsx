"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import UserIcon from "../../../../public/icons/people.svg";
import ClipIcon from "../../../../public/icons/clip.svg";
import Clock from "../../../../public/icons/clock.svg";
import ApprovedIcon from "../../../../public/icons/circle-marked.svg";
import { formatDate, getCategoryLabel } from "@/shared/lib/case-utils";
import { RequestAccessButton, WithdrawRequestButton } from "@/features/case-request-access";
import Typography from "../typography";
import { CaseCardProps } from "./types";


export const CaseCard: React.FC<CaseCardProps> = ({
  id,
  title,
  description,
  category,
  createdAt,
  documentCount,
  userRole,
  hasAccess = false,
  grantedAt = null,
  hasPendingRequest = false,
  requestedAt = null,
  onRequestSuccess,
  onRequestError,
  onWithdrawSuccess,
  onWithdrawError,
  onEdit,
}) => {


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
            {/* This is still hardcoded */}
            <span>
              Client: M, 40 
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Image src={ClipIcon} alt="Attachments" className="w-4 h-4" />
            <span>{documentCount ?? 0} Attachments</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
         {hasAccess && (
          <>
            <div className="bg-lighter px-2 py-1 flex items-center gap-1 rounded-md mr-4">
              <Image
                src={ApprovedIcon}
                width={16}
                height={16}
                alt="pending-approval"
              />
              <Typography variant="xs" weight="medium" className="text-success">
                Approved
              </Typography>
            </div>
            <div>
              <Typography variant="xs" weight="normal" className="text-base">
                Access Granted on {formatDate(grantedAt?.toString() ?? "")}
              </Typography>
            </div>
          </>
        )}
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
                Requested on {formatDate(requestedAt?.toString() ?? "")}
              </Typography>
            </div>
          </>
        )}

        <div className="flex gap-2 ml-auto">
          {/* For lawyers browsing cases without access */}
          {userRole === "LAWYER" &&
            !hasAccess &&
            !hasPendingRequest && (
              <RequestAccessButton 
                caseId={id}
                onSuccess={onRequestSuccess}
                onError={onRequestError}
              />
            )}

          {/* For lawyers with pending requests */}
          {userRole === "LAWYER" && !hasAccess && hasPendingRequest && (
            <WithdrawRequestButton
              caseId={id}
              onSuccess={onWithdrawSuccess}
              onError={onWithdrawError}
              className="text-xs font-medium p-2 rounded transition-colors cursor-pointer bg-red-100 text-red-700 hover:bg-red-200"
            >
              Withdraw Request
            </WithdrawRequestButton>
          )}

          {/* For cases with access or owned cases */}
          {(hasAccess ||
            userRole === "CLIENT" ||
            (userRole === "LAWYER" && hasAccess)) && (
            <>
              {/* Edit button only for CLIENT role */}
              {userRole === "CLIENT" && onEdit && (
                <button 
                  onClick={() => onEdit(id)}
                  className="px-3 py-1.5 text-xs border border-gray-300 text-sub600 rounded hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
              )}
              <Link
                href={`/case/${id}`}
                className="px-3 py-1.5 text-xs bg-white text-sub-600 white rounded hover:bg-light border-light border"
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
