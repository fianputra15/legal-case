"use client";

import React from "react";
import { Button, DocumentList } from "@/shared/ui";
import { DocumentUploadModal } from "@/shared/ui/document-upload";
import { useDocuments } from "@/features/document-management";
import { DocumentEntity } from "@/entities/document";

interface DocumentManagerProps {
  caseId: string;
  onDocumentCountChange?: (count: number) => void;
  isReadOnly?: boolean;
  readOnlyReason?: string;
}

export function DocumentManager({
  caseId,
  onDocumentCountChange,
  isReadOnly = false,
  readOnlyReason,
}: DocumentManagerProps) {
  const { refreshDocuments, addDocument, documentCount, documents, loading, error } =
    useDocuments(caseId);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    onDocumentCountChange?.(documentCount);
  }, [documentCount, onDocumentCountChange]);

  const handleUploadDocument = () => {
    if (!caseId) return;
    setIsModalOpen(true);
  };

  const handleUploadSuccess = (document: any) => {
    addDocument(document as unknown as DocumentEntity);
    setIsModalOpen(false);
    refreshDocuments();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {isReadOnly && readOnlyReason && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-amber-600 text-lg mr-2">🔒</div>
            <p className="text-amber-700 text-sm">{readOnlyReason}</p>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-strong900 mb-1">
            Case Documents
          </h2>
          <p className="text-sm text-sub600 mb-6">
            {documentCount > 0
              ? `${documentCount} document${documentCount === 1 ? "" : "s"} uploaded to this case.`
              : isReadOnly 
                ? "Documents are read-only for this case."
                : "Upload and manage documents related to this case."}
          </p>
        </div>
        {!isReadOnly && (
          <div>
            <Button onClick={handleUploadDocument}>Add Document</Button>
          </div>
        )}
      </div>

      {/* Document List */}
      <DocumentList
        documents={documents}
        loading={loading}
        error={error}
        caseId={caseId}
        onDocumentsChange={() => {}} // Already handled by useDocuments hook
      />

      {/* Upload Modal */}
      {!isReadOnly && (
        <DocumentUploadModal
          caseId={caseId}
          onUploadSuccess={handleUploadSuccess}
          onClose={handleCloseModal}
          open={isModalOpen}
        />
      )}
    </div>
  );
}
