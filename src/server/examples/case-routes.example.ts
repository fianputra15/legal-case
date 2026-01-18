/**
 * Example API Route Handlers demonstrating Authorization Usage
 * 
 * These examples show how to properly use the authorization helpers
 * in real API routes with proper error handling and security practices.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { AuthMiddleware } from '@/server/auth/middleware';
import { AuthorizationService } from '@/server/auth/authorization';
import { Logger } from '@/server/utils/logger';

/**
 * GET /api/cases/[id] - Get a specific case
 * 
 * Authorization: User must have access to the case
 * - Clients can only see their own cases
 * - Lawyers can see cases granted to them
 * - Admins can see all cases
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = params.id;
    
    // Require case access authorization
    const authResult = await AuthMiddleware.requireCaseAccess(request, caseId);
    if (authResult instanceof NextResponse) {
      return authResult; // Returns 401, 403, or 404 as appropriate
    }

    const { user } = authResult;
    
    // User is authorized - fetch case data
    // (This would be implemented with actual Prisma queries)
    const caseData = {
      id: caseId,
      title: 'Sample Case',
      status: 'OPEN',
      // ... other case fields
    };

    Logger.info(`Case ${caseId} accessed by user ${user.email}`);

    return ResponseHandler.success(caseData);

  } catch (error) {
    Logger.error('Get case error:', error);
    return ResponseHandler.internalError('Unable to retrieve case');
  }
}

/**
 * PUT /api/cases/[id] - Update a case
 * 
 * Authorization: User must own the case (or be admin)
 * Only case owners can modify their cases
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = params.id;
    
    // Require case ownership for modifications
    const authResult = await AuthMiddleware.requireCaseOwnership(request, caseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const updateData = await request.json();
    
    // User is authorized to modify - perform update
    // (Implementation would use actual case service)
    
    Logger.info(`Case ${caseId} updated by owner ${user.email}`);

    return ResponseHandler.success({ 
      message: 'Case updated successfully',
      caseId: caseId 
    });

  } catch (error) {
    Logger.error('Update case error:', error);
    return ResponseHandler.internalError('Unable to update case');
  }
}

/**
 * DELETE /api/cases/[id] - Delete a case
 * 
 * Authorization: User must own the case (or be admin)
 * Only case owners can delete their cases
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = params.id;
    
    // Require case ownership for deletion
    const authResult = await AuthMiddleware.requireCaseOwnership(request, caseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    
    // Additional check for delete permission (could be extended for more complex rules)
    const permissionCheck = await AuthorizationService.hasPermission(user, caseId, 'delete');
    if (!permissionCheck.allowed) {
      return ResponseHandler.forbidden('Insufficient permissions to delete case');
    }
    
    // User is authorized to delete - perform deletion
    // (Implementation would use actual case service)
    
    Logger.info(`Case ${caseId} deleted by owner ${user.email}`);

    return ResponseHandler.success({ 
      message: 'Case deleted successfully' 
    });

  } catch (error) {
    Logger.error('Delete case error:', error);
    return ResponseHandler.internalError('Unable to delete case');
  }
}

/**
 * GET /api/cases - List cases accessible to user
 * 
 * Authorization: Returns only cases the user can access
 * - Clients see only their own cases
 * - Lawyers see cases granted to them
 * - Admins see all cases
 */
export async function GET_LIST(request: NextRequest) {
  try {
    // Require authentication but no specific resource access
    const authResult = await AuthMiddleware.requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    
    // Get cases accessible to this user
    const accessibleCaseIds = await AuthorizationService.getAccessibleCaseIds(user);
    
    // Fetch case data for accessible cases only
    // (Implementation would use actual case service with proper filtering)
    const cases = []; // Would be populated from database
    
    Logger.info(`Listed ${accessibleCaseIds.length} cases for user ${user.email}`);

    return ResponseHandler.success({
      cases,
      total: accessibleCaseIds.length
    });

  } catch (error) {
    Logger.error('List cases error:', error);
    return ResponseHandler.internalError('Unable to retrieve cases');
  }
}

/**
 * POST /api/cases/[id]/grant-access - Grant lawyer access to a case
 * 
 * Authorization: User must own the case (or be admin)
 * Only case owners can grant access to lawyers
 */
export async function POST_GRANT_ACCESS(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = params.id;
    
    // Require case ownership to grant access
    const authResult = await AuthMiddleware.requireCaseOwnership(request, caseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { lawyerId } = await request.json();

    if (!lawyerId) {
      return ResponseHandler.badRequest('Lawyer ID is required');
    }
    
    // Additional validation: ensure target user is actually a lawyer
    // (Implementation would validate lawyer exists and has LAWYER role)
    
    // Grant access (would use actual case service)
    // await caseService.grantAccess(caseId, lawyerId);
    
    Logger.info(`Case ${caseId} access granted to lawyer ${lawyerId} by owner ${user.email}`);

    return ResponseHandler.success({ 
      message: 'Access granted successfully',
      caseId,
      lawyerId
    });

  } catch (error) {
    Logger.error('Grant access error:', error);
    return ResponseHandler.internalError('Unable to grant access');
  }
}

// Export helper functions for reuse
export { AuthorizationService };