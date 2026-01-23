export interface DocumentEntity {
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
  documentType: DocumentType;
  status: DocumentStatus;
  caseId: string;
  uploadedById: string;
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export enum DocumentType {
  CONTRACT = 'CONTRACT',
  EVIDENCE = 'EVIDENCE',
  CORRESPONDENCE = 'CORRESPONDENCE',
  LEGAL_BRIEF = 'LEGAL_BRIEF',
  COURT_FILING = 'COURT_FILING',
  IDENTIFICATION = 'IDENTIFICATION',
  FINANCIAL_RECORD = 'FINANCIAL_RECORD',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export interface DocumentUploadData {
  originalName: string;
  buffer: Buffer;
  mimeType: string;
  size: number;
  caseId: string;
  uploadedById: string;
  documentType: DocumentType;
}