import {  DocumentType } from './types';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.CONTRACT]: 'Contract',
  [DocumentType.EVIDENCE]: 'Evidence',
  [DocumentType.CORRESPONDENCE]: 'Correspondence',
  [DocumentType.LEGAL_BRIEF]: 'Legal Brief',
  [DocumentType.COURT_FILING]: 'Court Filing',
  [DocumentType.IDENTIFICATION]: 'Identification',
  [DocumentType.FINANCIAL_RECORD]: 'Financial Record',
  [DocumentType.OTHER]: 'Other',
};

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
] as const;

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export const validateDocumentFile = (file: File): { isValid: boolean; error?: string } => {
  if (!file || !file.name) {
    return { isValid: false, error: 'No file selected' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds 25MB limit. Please choose a smaller file.`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: 'File type not supported. Please upload PDF, DOCX, PNG, or JPEG files.',
    };
  }

  if (file.size === 0) {
    return { isValid: false, error: 'File appears to be empty. Please select a valid file.' };
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getDocumentTypeLabel = (type: DocumentType): string => {
  return DOCUMENT_TYPE_LABELS[type] || 'Unknown';
};