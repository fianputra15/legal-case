/**
 * Authorization Service
 * 
 * Implements server-side authorization with security-first design.
 * Never relies on client-side logic or exposes sensitive information.
 */

import { PrismaClient } from '../../../prisma/generated/client'; 
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { AuthUser } from '../auth/types';
import { Logger } from '../utils/logger';
import 'dotenv/config';

// Initialize Prisma client with PostgreSQL adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
}

export class AuthorizationService {
  
  /**
   * Check if user can access a specific case
   * 
   * Security Rules:
   * - CLIENT: Can only access cases they own (ownerId === user.id)  
   * - LAWYER: Can access cases explicitly granted via CaseAccess table
   * 
   * Security Note: Returns same result for non-existent cases and unauthorized access
   * to prevent resource enumeration attacks.
   * 
   * @param user - Authenticated user
   * @param caseId - Case ID to check access for
   * @returns Promise<boolean> - true if access is allowed
   */
  static async canAccessCase(user: AuthUser, caseId: string): Promise<boolean> {
    try {
      // Single database query with role-based conditions
      const caseRecord = await prisma.case.findFirst({
        where: {
          id: caseId,
          OR: [
            // Client can access their own cases
            ...(user.role === 'CLIENT' ? [{ ownerId: user.id }] : []),
            // Lawyer can access cases granted to them
            ...(user.role === 'LAWYER' ? [{
              lawyerAccess: {
                some: { lawyerId: user.id }
              }
            }] : [])
          ]
        },
        select: { id: true } // Minimal data selection
      });

      const hasAccess = !!caseRecord;
      
      // Security logging for access attempts
      if (!hasAccess) {
        Logger.warn(`Access denied: User ${user.email} (${user.role}) attempted to access case ${caseId}`);
      }

      return hasAccess;

    } catch (error) {
      Logger.error('Authorization check failed:', error);
      // Fail secure - deny access on any error
      return false;
    }
  }

  /**
   * Check if user owns a specific case
   * 
   * Security Rules:
   * - CLIENT: Must be the actual owner (ownerId === user.id)
   * - LAWYER: Cannot own cases (can only have access granted)
   * 
   * @param user - Authenticated user  
   * @param caseId - Case ID to check ownership for
   * @returns Promise<boolean> - true if user owns the case
   */
  static async isCaseOwner(user: AuthUser, caseId: string): Promise<boolean> {
    try {
    
      // Lawyers cannot own cases, only access them
      if (user.role === 'LAWYER') {
        return false;
      }

      // Client ownership check
      if (user.role === 'CLIENT') {
        const ownedCase = await prisma.case.findFirst({
          where: {
            id: caseId,
            ownerId: user.id
          },
          select: { id: true }
        });

        const isOwner = !!ownedCase;
        
        if (!isOwner) {
          Logger.warn(`Ownership denied: User ${user.email} attempted to claim ownership of case ${caseId}`);
        }

        return isOwner;
      }

      return false;

    } catch (error) {
      Logger.error('Ownership check failed:', error);
      // Fail secure
      return false;
    }
  }

  /**
   * Get all case IDs accessible by user (for listing operations)
   * 
   * @param user - Authenticated user
   * @returns Promise<string[]> - Array of accessible case IDs
   */
  static async getAccessibleCaseIds(user: AuthUser): Promise<string[]> {
    try {
      if (user.role === 'CLIENT') {
        const cases = await prisma.case.findMany({
          where: { ownerId: user.id },
          select: { id: true }
        });
        return cases.map(c => c.id);
      }

      if (user.role === 'LAWYER') {
        const caseAccess = await prisma.caseAccess.findMany({
          where: { lawyerId: user.id },
          select: { caseId: true }
        });
        return caseAccess.map(ca => ca.caseId);
      }

      return [];

    } catch (error) {
      Logger.error('Failed to get accessible cases:', error);
      return [];
    }
  }

  /**
   * Batch check multiple cases for access (performance optimization)
   * 
   * @param user - Authenticated user
   * @param caseIds - Array of case IDs to check
   * @returns Promise<string[]> - Array of accessible case IDs
   */
  static async filterAccessibleCases(user: AuthUser, caseIds: string[]): Promise<string[]> {
    if (caseIds.length === 0) return [];

    try {
      const accessibleCases = await prisma.case.findMany({
        where: {
          id: { in: caseIds },
          OR: [
            ...(user.role === 'CLIENT' ? [{ ownerId: user.id }] : []),
            ...(user.role === 'LAWYER' ? [{
              lawyerAccess: {
                some: { lawyerId: user.id }
              }
            }] : [])
          ]
        },
        select: { id: true }
      });

      return accessibleCases.map(c => c.id);

    } catch (error) {
      Logger.error('Batch access check failed:', error);
      return [];
    }
  }
}