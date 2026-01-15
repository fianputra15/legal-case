export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export enum UserRole {
  ADMIN = 'admin',
  LAWYER = 'lawyer',
  CLIENT = 'client',
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}