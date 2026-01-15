import { BaseEntity } from '@/shared/types';

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  LAWYER = 'lawyer',
  CLIENT = 'client',
  PARALEGAL = 'paralegal',
}

export interface UserProfile {
  id: string;
  userId: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar?: string;
}