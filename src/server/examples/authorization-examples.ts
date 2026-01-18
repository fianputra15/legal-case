/**
 * Example Route Handlers demonstrating Authorization Best Practices
 * 
 * These examples show secure server-side authorization with proper error handling
 * and prevention of information leakage attacks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { AuthMiddleware } from '@/server/auth/middleware';
import { AuthorizationService } from '@/server/auth/authorization';
import { Logger } from '@/server/utils/logger';

/**
 * GET /api/cases/[id] - Retrieve a specific case
 * 
 * Security Implementation:
 * - Returns 401 if not authenticated
 * - Returns 404 if case doesn't exist OR user lacks access (prevents enumeration)
 * - Logs all access attempts for security monitoring
 */
export async function GET_Case(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = params.id;

    // Step 1: Require authentication (401 if not authenticated)
    const authResult = await AuthMiddleware.requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Step 2: Check case access (404 to prevent resource enumeration)
    const canAccess = await AuthorizationService.canAccessCase(user, caseId);
    if (!canAccess) {
      // Security: Return 404 instead of 403 to hide resource existence
      Logger.warn(`Unauthorized access attempt: ${user.email} -> case ${caseId}`);
      return ResponseHandler.notFound('Case not found');
    }

    // Step 3: User is authorized - fetch and return case data
    // Note: In real implementation, use your case service here
    const caseData = {
      id: caseId,
      title: 'Contract Review',
      status: 'IN_PROGRESS',
      // ... other case fields
    };

    Logger.info(`Case accessed: ${caseId} by ${user.email} (${user.role})`);
    
    return ResponseHandler.success(caseData);

  } catch (error) {
    Logger.error('Get case error:', error);
    // Never leak internal error details to client
    return ResponseHandler.internalError('Unable to retrieve case');
  }
}

/**
 * PUT /api/cases/[id] - Update a specific case
 * 
 * Security Implementation:
 * - Requires case ownership (only owner can modify)
 * - Returns 404 for non-existent or inaccessible cases
 * - Returns 403 for insufficient privileges (can access but can't modify)
 */
export async function PUT_Case(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = params.id;

    // Step 1: Require authentication
    const authResult = await AuthMiddleware.requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Step 2: Check if user can even access the case
    const canAccess = await AuthorizationService.canAccessCase(user, caseId);
    if (!canAccess) {
      return ResponseHandler.notFound('Case not found');
    }

    // Step 3: Check ownership for modification rights
    const isOwner = await AuthorizationService.isCaseOwner(user, caseId);
    if (!isOwner) {
      // User can see case but can't modify it (403 is appropriate here)
      Logger.warn(`Modification denied: ${user.email} attempted to modify case ${caseId}`);
      return ResponseHandler.forbidden('Only case owners can modify cases');
    }

    // Step 4: User is authorized - process update
    const updateData = await request.json();
    
    // Validate and sanitize updateData here...
    
    Logger.info(`Case updated: ${caseId} by owner ${user.email}`);
    
    return ResponseHandler.success({
      id: caseId,
      message: 'Case updated successfully'
    });

  } catch (error) {
    Logger.error('Update case error:', error);
    return ResponseHandler.internalError('Unable to update case');
  }
}

/**
 * DELETE /api/cases/[id] - Delete a specific case
 * 
 * Security Implementation:
 * - Strictest authorization - only owners can delete
 * - Comprehensive audit logging
 * - Secure error responses
 */
export async function DELETE_Case(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = params.id;

    const authResult = await AuthMiddleware.requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Combined check: access and ownership in one step for efficiency
    const [canAccess, isOwner] = await Promise.all([
      AuthorizationService.canAccessCase(user, caseId),
      AuthorizationService.isCaseOwner(user, caseId)
    ]);

    if (!canAccess) {
      return ResponseHandler.notFound('Case not found');
    }

    if (!isOwner) {
      Logger.warn(`Deletion denied: ${user.email} attempted to delete case ${caseId}`);
      return ResponseHandler.forbidden('Only case owners can delete cases');
    }

    // Critical action - enhanced logging
    Logger.warn(`CASE DELETION: ${caseId} by ${user.email} at ${new Date().toISOString()}`);
    
    // Perform deletion here...
    
    return ResponseHandler.success({ message: 'Case deleted successfully' });

  } catch (error) {
    Logger.error('Delete case error:', error);
    return ResponseHandler.internalError('Unable to delete case');
  }
}

/**
 * GET /api/cases - List accessible cases
 * 
 * Security Implementation:
 * - Pre-filters results based on user role
 * - No unauthorized data leakage
 * - Efficient database queries
 */
export async function GET_Cases(request: NextRequest) {
  try {
    const authResult = await AuthMiddleware.requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Get only cases this user can access
    const accessibleCaseIds = await AuthorizationService.getAccessibleCaseIds(user);
    
    // Fetch case details for accessible cases only
    // In real implementation, use your case service with proper filtering
    const cases = accessibleCaseIds.map(id => ({
      id,
      title: `Case ${id}`,
      status: 'ACTIVE'
    }));

    Logger.info(`Listed ${cases.length} cases for ${user.email} (${user.role})`);

    return ResponseHandler.success({
      cases,
      total: cases.length,
      userRole: user.role // Helps frontend understand user's perspective
    });

  } catch (error) {
    Logger.error('List cases error:', error);
    return ResponseHandler.internalError('Unable to retrieve cases');
  }
}

/**
 * POST /api/cases/[id]/grant-access - Grant lawyer access to case
 * 
 * Security Implementation:
 * - Only case owners can grant access
 * - Validates target user is actually a lawyer
 * - Prevents privilege escalation
 */
export async function POST_GrantAccess(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = params.id;

    const authResult = await AuthMiddleware.requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Only case owners can grant access
    const isOwner = await AuthorizationService.isCaseOwner(user, caseId);
    if (!isOwner) {
      // Don't reveal if case exists if user isn't owner
      return ResponseHandler.notFound('Case not found');
    }

    const { lawyerId } = await request.json();
    if (!lawyerId) {
      return ResponseHandler.badRequest('Lawyer ID is required');
    }

    // Security: Verify target user exists and is actually a lawyer
    // This prevents granting access to invalid users or non-lawyers
    // Implementation would include actual user validation...
    
    Logger.info(`Access granted: Case ${caseId} -> Lawyer ${lawyerId} by ${user.email}`);
    
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

/**
 * Middleware-style authorization helper
 * Demonstrates reusable authorization logic
 */
export async function withCaseAccess<T>(
  request: NextRequest,
  caseId: string,
  handler: (user: any) => Promise<T>
): Promise<T | NextResponse> {
  try {
    // Authentication check
    const authResult = await AuthMiddleware.requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Authorization check
    const canAccess = await AuthorizationService.canAccessCase(user, caseId);
    if (!canAccess) {
      return ResponseHandler.notFound('Resource not found');
    }

    // Execute handler with authorized user
    return await handler(user);

  } catch (error) {
    Logger.error('Authorization middleware error:', error);
    return ResponseHandler.internalError('Authorization failed');
  }
}

// Usage example of the middleware helper:
export async function GET_CaseWithMiddleware(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withCaseAccess(request, params.id, async (user) => {
    // This handler only runs if user is authorized
    Logger.info(`Authorized access to case ${params.id} by ${user.email}`);
    
    return ResponseHandler.success({
      id: params.id,
      accessedBy: user.email,
      timestamp: new Date().toISOString()
    });
  });
}