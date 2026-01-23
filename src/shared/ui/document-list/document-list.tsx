"use client";

import React from "react";
import {
  DocumentEntity,
  formatFileSize,
  getDocumentTypeLabel,
} from "@/entities/document";
import { useDocumentActions } from "@/features/document-management/model/useDocumentActions";

interface DocumentListProps {
  caseId: string;
  onDocumentsChange?: (documents: DocumentEntity[]) => void;
  documents: DocumentEntity[];
  loading: boolean;
  error: string | null;
}

export function DocumentList({
  onDocumentsChange,
  documents,
  loading,
  error,
}: DocumentListProps) {
  const { downloadDocument, isDownloading } =
    useDocumentActions();

  React.useEffect(() => {
    onDocumentsChange?.(documents);
  }, [documents, onDocumentsChange]);

  const handleDownload = async (documentId: string, filename: string) => {
    try {
      await downloadDocument(documentId, filename);
    } catch (err) {
      console.error("Download error:", err);
      alert(
        err instanceof Error
          ? `Failed to download: ${err.message}`
          : "Failed to download document",
      );
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600 text-lg mr-2">⚠️</div>
          <div>
            <p className="text-red-700 font-medium">Failed to load documents</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
        <div className="text-4xl text-gray-400 mb-4">📂</div>
        <h3 className="text-lg font-medium text-strong900 mb-2">
          No Documents Yet
        </h3>
        <p className="text-sub600 mb-4">
          No documents have been uploaded to this case yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            {/* Document Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <h3
                  className="font-medium text-strong900 truncate"
                  title={doc.originalName}
                >
                  {doc.originalName}
                </h3>
                <div className="flex items-center gap-4 text-sm text-sub600 mt-1">
                  <span>{formatFileSize(doc.size)}</span>
                  <span>•</span>
                  <span>{getDocumentTypeLabel(doc.documentType)}</span>
                  <span>•</span>
                  <span>
                    Uploaded by {doc.uploadedBy?.firstName}{" "}
                    {doc.uploadedBy?.lastName}
                  </span>
                  <span>•</span>
                  <span>{formatDate(doc.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              {/* Download Button */}
              <button
                onClick={() => handleDownload(doc.id, doc.originalName)}
                disabled={isDownloading(doc.id)}
                className="px-3 py-1.5 text-sm  text-brand rounded font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title="Download file"
              >
                {isDownloading(doc.id) ? (
                  <div className="flex items-center">
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                    ...
                  </div>
                ) : (
                  "Download"
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
