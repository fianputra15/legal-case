"use client";

import React, { useState, useRef } from "react";
import { useModal } from "@/shared/providers/modal-provider";
import {
  DocumentType,
  DOCUMENT_TYPE_LABELS,
  validateDocumentFile,
  formatFileSize as formatFileSizeUtil,
} from "@/entities/document";
import { DocumentApi } from "@/features/document-management/api/document";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../dialog";

interface DocumentUploadModalProps {
  caseId: string;
  onUploadSuccess: (document: {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    type: DocumentType;
    status: string;
    uploadedAt: string;
    originalName: string;
    documentType: DocumentType;
    createdAt: string;
    updatedAt: string;
    caseId: string;
    uploadedById: string;
  }) => void;
  onClose?: () => void;
  onOpen?: () => void;
  open: boolean;
}

const documentTypeOptions = Object.entries(DOCUMENT_TYPE_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  }),
);

export function DocumentUploadModal({
  caseId,
  onUploadSuccess,
  onClose,
  open,
}: DocumentUploadModalProps) {
  const { hideModal } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState(DocumentType.OTHER);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    const validation = validateDocumentFile(file);
    if (!validation.isValid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await DocumentApi.uploadDocument(
        caseId,
        selectedFile,
        documentType,
      );

      if (response.success) {
        onUploadSuccess(
          response.data as unknown as {
            id: string;
            filename: string;
            mimeType: string;
            size: number;
            type: DocumentType;
            status: string;
            uploadedAt: string;
            originalName: string;
            documentType: DocumentType;
            createdAt: string;
            updatedAt: string;
            caseId: string;
            uploadedById: string;
          },
        );
        if (onClose) {
          onClose();
        } else {
          hideModal();
        }
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to upload document. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose}>
      <DialogContent className="sm:max-w-106.25">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        {/* Content */}
        <div className="space-y-6">
          {/* File Drop Zone */}
          <div>
            <label className="block text-sm font-medium text-strong900 mb-2">
              Select Document
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-brand bg-orange-50"
                  : selectedFile
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {selectedFile ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-strong900">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-sub600">
                      {formatFileSizeUtil(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                    disabled={uploading}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-4xl text-gray-400">📎</div>
                  <div>
                    <p className="text-strong900 font-medium">
                      Drag and drop your file here, or{" "}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-brand hover:text-brand-orange-600 transition-colors"
                        disabled={uploading}
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-sm text-sub600 mt-1">
                      Support for PDF, DOCX, PNG, JPEG files up to 25MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.png,.jpeg,.jpg"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {/* Document Type */}
          <div>
            <label
              htmlFor="documentType"
              className="block text-sm font-medium text-strong900 mb-2"
            >
              Document Type
            </label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-colors"
              disabled={uploading}
            >
              {documentTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <div className="text-red-600 text-sm mr-2">⚠️</div>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-2 mt-4 border-gray-200">
          <button
            onClick={onClose || hideModal}
            className="px-4 py-2 text-sub600 hover:text-strong900 transition-colors"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Uploading...
              </div>
            ) : (
              "Upload Document"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
