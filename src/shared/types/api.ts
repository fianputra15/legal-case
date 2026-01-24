// Types for API responses and data structures

// Base API Response Structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Pagination Structure
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Case Data Structure
export interface CaseData {
  id: string;
  title: string;
  description?: string;
  category: CaseCategory;
  status: CaseStatus;
  priority: number;
  ownerId: string;
  clientName?: string;
  client?: {
    firstName?: string;
    lastName?: string;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  // Enhanced fields for access management
  hasAccess?: boolean;
  hasPendingRequest?: boolean;
  requestedAt?: string | Date | null;
  grantedAt?: string | Date | null;
  documentCount?: number;
  userRole?: 'CLIENT' | 'LAWYER' | 'ADMIN';
  showOwner?: boolean;
  onRequestAccess?: (caseId: string) => void;
  onEdit?: (caseId: string) => void;
}

// Case Categories
export type CaseCategory = 
  | 'CRIMINAL_LAW'
  | 'CIVIL_LAW'
  | 'CORPORATE_LAW'
  | 'FAMILY_LAW'
  | 'IMMIGRATION_LAW'
  | 'INTELLECTUAL_PROPERTY'
  | 'LABOR_LAW'
  | 'REAL_ESTATE'
  | 'TAX_LAW'
  | 'OTHER';

// Case Status
export type CaseStatus = 'OPEN' | 'CLOSED';

// Cases List Response
export interface CasesListResponse {
  cases: CaseData[];
  pagination: PaginationInfo;
  userRole: 'CLIENT' | 'LAWYER'
  appliedFilters: {
    search?: string;
    status?: CaseStatus;
    category?: CaseCategory;
  };
  message?: string;
}

// Single Case Response
export interface CaseResponse {
  case: CaseData;
}

// Search Result for Header Search
export interface SearchResult {
  id: string;
  title: string;
  category: CaseCategory;
  status: CaseStatus;
  priority: number;
  clientName?: string;
}

// Document Types
export interface DocumentData {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  caseId: string;
}

export interface DocumentsListResponse {
  documents: DocumentData[];
  pagination?: PaginationInfo;
}

// User Types
export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'LAWYER'
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Access Request Types
export interface AccessRequestData {
  id: string;
  caseId: string;
  lawyerId: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AccessRequestResponse {
  success: boolean;
  message: string;
  requestSubmitted?: boolean;
  data?: AccessRequestData;
}

export interface WithdrawRequestResponse {
  success: boolean;
  message: string;
}

// Create Case Form Data
export interface CreateCaseFormData {
  title: string;
  description: string;
  category: CaseCategory | ""; // Allow empty string for initial form state
  priority: number;
}

// Edit Case Form Data
export interface EditCaseForm {
  title?: string;
  description?: string;
  category?: CaseCategory;
  status?: CaseStatus;
}

// Query Parameters for Cases API
export interface CasesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CaseStatus;
  category?: CaseCategory;
  sortBy?: 'newest' | 'oldest' | 'title';
}

// Common Error Response
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: unknown;
}