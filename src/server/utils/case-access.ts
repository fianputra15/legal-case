/**
 * Utility functions for case access management
 */

import { CaseEntity } from '../types/database';
import { CaseRepository } from '../db/repositories/case.repository';

export class CaseAccessUtils {
  private static caseRepository = new CaseRepository();

  /**
   * Enhance cases with access information (hasAccess, hasPendingRequest, requestedAt)
   */
  static async enhanceCasesWithAccessInfo(
    cases: CaseEntity[],
    userId: string,
  ): Promise<any[]> {
    // For lawyers, check access and pending requests for each case
    const enhancedCases = await Promise.all(
      cases.map(async (caseItem) => {
        try {
          // Check if lawyer has access
          const hasAccess = await this.caseRepository.hasAccess(caseItem.id, userId);
          console.log(`   Case ${caseItem.title} (${caseItem.id}) - hasAccess: ${hasAccess}`);
 
          // Check if there's a pending request and get the request date
          const pendingRequestInfo = await this.caseRepository.getAccessRequestInfo(caseItem.id, userId);
          console.log(`   Case ${caseItem.title} (${caseItem.id}) - pendingRequestInfo:`, pendingRequestInfo);

          // Check if there's granted info
          const grantedInfo = await this.caseRepository.grantedInfo(caseItem.id, userId);
          console.log(`   Case ${caseItem.title} (${caseItem.id}) - grantedInfo:`, grantedInfo);

          // Count case documents
          const documentCount = await this.caseRepository.getDocumentCount(caseItem.id);
          console.log(`   Case ${caseItem.title} (${caseItem.id}) - documentInfo:`, documentCount);

          const result = {
            ...caseItem,
            hasAccess,
            hasPendingRequest: !!pendingRequestInfo,
            requestedAt: pendingRequestInfo?.requestedAt || null,
            grantedAt: grantedInfo?.grantedAt || null,
            documentCount: documentCount || 0
          };
          
          console.log(`   Case ${caseItem.title} enhanced result:`, {
            hasAccess: result.hasAccess,
            hasPendingRequest: result.hasPendingRequest,
            requestedAt: result.requestedAt,
            grantedAt: result.grantedAt,
            documentCount: result.documentCount
          });
          
          return result;
        } catch (error) {
          console.error(`Error enhancing case ${caseItem.id}:`, error);
          return {
            ...caseItem,
            hasAccess: false,
            hasPendingRequest: false,
            requestedAt: null,
          };
        }
      })
    );

    console.log('🔍 CaseAccessUtils enhanced cases result:', enhancedCases.map(c => ({
      id: c.id,
      title: c.title,
      hasAccess: c.hasAccess,
      hasPendingRequest: c.hasPendingRequest
    })));

    return enhancedCases;
  }

  /**
   * Check if user can access a case
   */
  static async canAccessCase(
    caseId: string,
    userId: string,
    userRole: string,
    caseOwnerId?: string
  ): Promise<boolean> {
    if (userRole === 'ADMIN') return true;
    if (userRole === 'CLIENT' && caseOwnerId === userId) return true;
    if (userRole === 'LAWYER') {
      return this.caseRepository.hasAccess(caseId, userId);
    }
    return false;
  }
}