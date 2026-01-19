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
  createdAt: Date;
  updatedAt: Date;
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
  ADMIN = 'admin',
  LAWYER = 'lawyer',
  CLIENT = 'client',
}

export enum CaseStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

export enum CasePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}