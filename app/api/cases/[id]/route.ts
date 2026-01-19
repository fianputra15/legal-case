import { NextRequest, NextResponse } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, updateCaseSchema } from '@/server/utils/validation';
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
 * GET /api/cases/[id] - Get a specific case
 * 
 * Authorization: User must have access to the case via canAccessCase()
 * 
 * Security Design:
 * - Returns 404 for both non-existent cases AND unauthorized access
 * - This prevents resource enumeration attacks (cannot determine if case exists)
 * - Never returns 403 to avoid information leakage
 * 
 * Status Code Strategy:
 * - 401: Not authenticated (no valid token)
 * - 404: Case not found OR no access (security by design)
 * - 200: Success with case data
 * - 500: Internal server error
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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
    
    // Check authorization using canAccessCase
    // This handles both case existence and access permissions in one secure check
    const hasAccess = await AuthorizationService.canAccessCase(user, caseId);
    
    if (!hasAccess) {
      // Security: Return 404 for both non-existent cases and unauthorized access
      // This prevents attackers from determining which cases exist in the system
      Logger.warn(`Access denied or case not found: User ${user.email} (${user.role}) attempted to access case ${caseId}`);
      return ResponseHandler.notFound('Case not found');
    }
    
    // User is authorized - fetch case data
    // Note: We still need to check if case exists in case of race conditions
    const caseData = await caseService.getCaseById(caseId);

    if (!caseData) {
      // This should rarely happen due to the authorization check above,
      // but handles race conditions (e.g., case deleted between checks)
      Logger.warn(`Case ${caseId} disappeared between authorization and fetch for user ${user.email}`);
      return ResponseHandler.notFound('Case not found');
    }

    Logger.info(`Case ${caseId} successfully accessed by user ${user.email} (${user.role})`);

    return ResponseHandler.success(caseData);

  } catch (error) {
    Logger.error('Get case error:', error);
    // Never expose internal error details that might leak information
    return ResponseHandler.internalError('Failed to retrieve case');
  }
}

/**
 * PUT /api/cases/[id] - Update a specific case
 * 
 * Authorization: User must own the case (or be admin)
 * - Only case owners can modify their cases
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const caseId = params.id;
    
    // Require case ownership for modifications
    const authResult = await AuthMiddleware.requireCaseOwnership(request, caseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const updateData = validateRequest(updateCaseSchema, body);

    const updatedCase = await caseService.updateCase(caseId, updateData, user.id);

    if (!updatedCase) {
      return ResponseHandler.notFound('Case not found');
    }

    Logger.info(`Case updated: ${caseId} by owner ${user.email}`);

    return ResponseHandler.success(updatedCase, 'Case updated successfully');

  } catch (error) {
    Logger.error('Update case error:', error);
    return ResponseHandler.internalError('Failed to update case');
  }
}

/**
 * DELETE /api/cases/[id] - Delete a specific case
 * 
 * Authorization: User must own the case (or be admin)
 * - Only case owners can delete their cases
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const caseId = params.id;
    
    // Require case ownership for deletion
    const authResult = await AuthMiddleware.requireCaseOwnership(request, caseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const deleted = await caseService.deleteCase(caseId, user.id);

    if (!deleted) {
      return ResponseHandler.notFound('Case not found');
    }

    Logger.info(`Case deleted: ${caseId} by owner ${user.email}`);

    return ResponseHandler.success(null, 'Case deleted successfully');

  } catch (error) {
    Logger.error('Delete case error:', error);
    return ResponseHandler.internalError('Failed to delete case');
  }
}