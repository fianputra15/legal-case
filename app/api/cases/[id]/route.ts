import { NextRequest, NextResponse } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, updateCaseSchema } from '@/server/utils/validation';
import { CaseService } from '@/server/services/case.service';
import { CaseRepository } from '@/server/db/repositories/case.repository';
import { AuthMiddleware } from '@/server/auth/middleware';
import { Logger } from '@/server/utils/logger';

const caseService = new CaseService(new CaseRepository());

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/cases/[id] - Get a specific case
 * 
 * Authorization: User must have access to the case
 * - Returns 404 if case doesn't exist or user has no access (prevents resource enumeration)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const caseId = params.id;
    
    // Require case access authorization
    const authResult = await AuthMiddleware.requireCaseAccess(request, caseId);
    if (authResult instanceof NextResponse) {
      return authResult; // Returns appropriate error (401, 403, or 404)
    }

    const { user } = authResult;
    
    // User is authorized - fetch case data
    const caseData = await caseService.getCaseById(caseId, user.id);

    if (!caseData) {
      return ResponseHandler.notFound('Case not found');
    }

    Logger.info(`Case ${caseId} accessed by user ${user.email}`);

    return ResponseHandler.success(caseData);

  } catch (error) {
    Logger.error('Get case error:', error);
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