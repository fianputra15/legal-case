/**
 * Database Entity Types and DTOs
 */

// User entity and DTOs
export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  isActive?: boolean;
}

// Case entity and DTOs
export interface CaseEntity {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: string;
  priority: number;
  ownerId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface EnhancedCaseEntity extends CaseEntity {
  hasAccess?: boolean;
  hasPendingRequest?: boolean;
  requestedAt?: Date | string | null;
}

export interface CreateCaseDto {
  title: string;
  category: string;
  status?: string;
  description?: string;
}

export interface UpdateCaseDto {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedLawyerId?: string;
}

// Message entity and DTOs
export interface MessageEntity {
  id: string;
  content: string;
  senderId: string;
  caseId: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageDto {
  content: string;
  caseId: string;
}

export interface UpdateMessageDto {
  content: string;
}

// Enums
export enum UserRole {
  LAWYER = 'lawyer',
  CLIENT = 'client',
}

export enum CaseStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}
export enum CasePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Query and pagination interfaces
export interface CaseFilters {
  search?: string;
  status?: string;
  category?: string;
  ownerId?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Case access DTOs
export interface GrantCaseAccessDto {
  lawyerId: string;
}

export interface RevokeCaseAccessDto {
  lawyerId: string;
}