import { NextRequest, NextResponse } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, grantCaseAccessSchema, revokeCaseAccessSchema } from '@/server/utils/validation';
import { CaseService } from '@/server/services/case.service';
import { CaseRepository } from '@/server/db/repositories/case.repository';
import { AuthMiddleware } from '@/server/auth/middleware';
import { AuthorizationService } from '@/server/auth/authorization';
import { Logger } from '@/server/utils/logger';

const caseService = new CaseService(new CaseRepository());

interface RouteParams {
  params: { id: string };
}

/**
 * POST /api/cases/[id]/access - Grant lawyer access to a case
 * 
 * Authorization: User must own the case (CLIENT role only)
 * - Only case owners can grant access to lawyers
 * - Validates that the target user has LAWYER role
 * - Prevents duplicate access grants
 * 
 * Request Body:
 * - lawyerId: string (required) - ID of the lawyer to grant access
 * 
 * Status Codes:
 * - 401: Not authenticated
 * - 403: Not case owner or not a client
 * - 404: Case not found
 * - 400: Invalid input or business logic error (lawyer not found, wrong role, duplicate access)
 * - 200: Success
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const caseId = params.id;
    
    // Validate case ID format
    if (!caseId || typeof caseId !== 'string' || caseId.trim().length === 0) {
      return ResponseHandler.notFound('Case not found');
    }

    // Require authentication first
    const authResult = await AuthMiddleware.requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Returns 401 if not authenticated
    }

    const { user } = authResult;
    
    // Only CLIENT role can grant access (prevent lawyers from granting access)
    if (user.role !== 'CLIENT') {
      Logger.warn(`Non-client user ${user.email} (${user.role}) attempted to grant access to case ${caseId}`);
      return ResponseHandler.forbidden('Only case owners can grant lawyer access');
    }
    
    // Check case ownership using AuthorizationService
    const isOwner = await AuthorizationService.isCaseOwner(user, caseId);
    
    if (!isOwner) {
      // Check if case exists to provide appropriate error
      const hasAccess = await AuthorizationService.canAccessCase(user, caseId);
      if (!hasAccess) {
        // Case doesn't exist or no access at all
        Logger.warn(`User ${user.email} attempted to grant access to non-existent or inaccessible case ${caseId}`);
        return ResponseHandler.notFound('Case not found');
      } else {
        // Case exists but user is not the owner
        Logger.warn(`User ${user.email} attempted to grant access to case ${caseId} without ownership`);
        return ResponseHandler.forbidden('Only case owners can grant lawyer access');
      }
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      Logger.error('Invalid JSON in grant access request:', error);
      return ResponseHandler.badRequest('Invalid JSON format');
    }

    // Validate grant access data against schema
    let grantData;
    try {
      grantData = validateRequest(grantCaseAccessSchema, body);
    } catch (error) {
      Logger.error('Validation failed for grant access:', error);
      return ResponseHandler.badRequest(error instanceof Error ? error.message : 'Validation failed');
    }

    // Grant access using service layer (handles business logic validation)
    const result = await caseService.grantLawyerAccess(caseId, grantData.lawyerId);

    if (!result.success) {
      Logger.warn(`Failed to grant access to case ${caseId} for lawyer ${grantData.lawyerId}: ${result.message}`);
      return ResponseHandler.badRequest(result.message);
    }

    Logger.info(`Access granted to case ${caseId} for lawyer ${grantData.lawyerId} by owner ${user.email}`);

    return ResponseHandler.success(
      { 
        caseId, 
        lawyerId: grantData.lawyerId, 
        grantedBy: user.id,
        grantedAt: new Date().toISOString()
      }, 
      result.message
    );

  } catch (error) {
    Logger.error('Grant access error:', error);
    return ResponseHandler.internalError('Failed to grant access');
  }
}

/**
 * DELETE /api/cases/[id]/access - Revoke lawyer access from a case
 * 
 * Authorization: User must own the case (CLIENT role only)
 * - Only case owners can revoke access from lawyers
 * - Validates that the lawyer currently has access
 * 
 * Request Body:
 * - lawyerId: string (required) - ID of the lawyer to revoke access from
 * 
 * Status Codes:
 * - 401: Not authenticated
 * - 403: Not case owner or not a client
 * - 404: Case not found
 * - 400: Invalid input or business logic error (lawyer not found, no existing access)
 * - 200: Success
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const caseId = params.id;
    
    // Validate case ID format
    if (!caseId || typeof caseId !== 'string' || caseId.trim().length === 0) {
      return ResponseHandler.notFound('Case not found');
    }

    // Require authentication first
    const authResult = await AuthMiddleware.requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Returns 401 if not authenticated
    }

    const { user } = authResult;
    
    // Only CLIENT role can revoke access (prevent lawyers from revoking access)
    if (user.role !== 'CLIENT') {
      Logger.warn(`Non-client user ${user.email} (${user.role}) attempted to revoke access from case ${caseId}`);
      return ResponseHandler.forbidden('Only case owners can revoke lawyer access');
    }
    
    // Check case ownership using AuthorizationService
    const isOwner = await AuthorizationService.isCaseOwner(user, caseId);
    
    if (!isOwner) {
      // Check if case exists to provide appropriate error
      const hasAccess = await AuthorizationService.canAccessCase(user, caseId);
      if (!hasAccess) {
        // Case doesn't exist or no access at all
        Logger.warn(`User ${user.email} attempted to revoke access from non-existent or inaccessible case ${caseId}`);
        return ResponseHandler.notFound('Case not found');
      } else {
        // Case exists but user is not the owner
        Logger.warn(`User ${user.email} attempted to revoke access from case ${caseId} without ownership`);
        return ResponseHandler.forbidden('Only case owners can revoke lawyer access');
      }
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      Logger.error('Invalid JSON in revoke access request:', error);
      return ResponseHandler.badRequest('Invalid JSON format');
    }

    // Validate revoke access data against schema
    let revokeData;
    try {
      revokeData = validateRequest(revokeCaseAccessSchema, body);
    } catch (error) {
      Logger.error('Validation failed for revoke access:', error);
      return ResponseHandler.badRequest(error instanceof Error ? error.message : 'Validation failed');
    }

    // Revoke access using service layer (handles business logic validation)
    const result = await caseService.revokeLawyerAccess(caseId, revokeData.lawyerId);

    if (!result.success) {
      Logger.warn(`Failed to revoke access from case ${caseId} for lawyer ${revokeData.lawyerId}: ${result.message}`);
      return ResponseHandler.badRequest(result.message);
    }

    Logger.info(`Access revoked from case ${caseId} for lawyer ${revokeData.lawyerId} by owner ${user.email}`);

    return ResponseHandler.success(
      { 
        caseId, 
        lawyerId: revokeData.lawyerId, 
        revokedBy: user.id,
        revokedAt: new Date().toISOString()
      }, 
      result.message
    );

  } catch (error) {
    Logger.error('Revoke access error:', error);
    return ResponseHandler.internalError('Failed to revoke access');
  }
}