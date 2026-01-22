import { NextRequest, NextResponse } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';s
import { AuthorizationService } from '@/server/auth/authorization';
import { Logger } from '@/server/utils/logger';

interface RouteParams {
  params: { 
    id: string;
    requestId: string;
  };
}

/**
 * DELETE /api/cases/[id]/requests/[requestId] - Reject a specific access request
 * 
 * Authorization: User must own the case (CLIENT role only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: caseId, requestId } = params;
    
    // Validate case ID format
    if (!caseId || typeof caseId !== 'string' || caseId.trim().length === 0) {
      return ResponseHandler.notFound('Case not found');
    }

    if (!requestId || typeof requestId !== 'string' || requestId.trim().length === 0) {
      return ResponseHandler.badRequest('Request ID is required');
    }

    // Require authentication first - using same pattern as /me route
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify and decode the JWT using the secret
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch (error) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    // Query the database to find the user by ID
    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Only CLIENT role can reject access requests
    if (user.role !== 'CLIENT') {
      Logger.warn(`Non-client user ${user.email} (${user.role}) attempted to reject request ${requestId} for case ${caseId}`);
      return ResponseHandler.forbidden('Only case owners can reject access requests');
    }
    
    // Check case ownership
    const isOwner = await AuthorizationService.isCaseOwner(user, caseId);
    
    if (!isOwner) {
      const hasAccess = await AuthorizationService.canAccessCase(user, caseId);
      if (!hasAccess) {
        Logger.warn(`User ${user.email} attempted to reject request for non-existent or inaccessible case ${caseId}`);
        return ResponseHandler.notFound('Case not found');
      } else {
        Logger.warn(`User ${user.email} attempted to reject request for case ${caseId} without ownership`);
        return ResponseHandler.forbidden('Only case owners can reject access requests');
      }
    }

    // Mock rejection - in real app this would update database
    Logger.info(`Access request ${requestId} rejected for case ${caseId} by owner ${user.email}`);

    return ResponseHandler.success(
      { 
        caseId,
        requestId,
        rejectedBy: user.id,
        rejectedAt: new Date().toISOString()
      }, 
      'Access request rejected successfully'
    );

  } catch (error) {
    Logger.error('Reject access request error:', error);
    return ResponseHandler.internalError('Failed to reject access request');
  }
}