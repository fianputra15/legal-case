import { NextRequest, NextResponse } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { AuthorizationService } from '@/server/auth/authorization';
import { Logger } from '@/server/utils/logger';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { UserService } from '@/server/services';
import { UserRepository } from '@/server/db/repositories/user.repository';

const userService = new UserService(new UserRepository());

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/cases/[id]/requests - Get pending access requests for a case
 * 
 * Authorization: User must own the case (CLIENT role only)
 * Returns list of pending access requests from lawyers
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const caseId = params.id;
    
    // Validate case ID format
    if (!caseId || typeof caseId !== 'string' || caseId.trim().length === 0) {
      return ResponseHandler.notFound('Case not found');
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
    
    // Only CLIENT role can view access requests (case owners)
    if (user.role !== 'CLIENT') {
      Logger.warn(`Non-client user ${user.email} (${user.role}) attempted to view requests for case ${caseId}`);
      return ResponseHandler.forbidden('Only case owners can view access requests');
    }
    
    // Check case ownership using AuthorizationService
    const isOwner = await AuthorizationService.isCaseOwner(user, caseId);
    
    if (!isOwner) {
      const hasAccess = await AuthorizationService.canAccessCase(user, caseId);
      if (!hasAccess) {
        Logger.warn(`User ${user.email} attempted to view requests for non-existent or inaccessible case ${caseId}`);
        return ResponseHandler.notFound('Case not found');
      } else {
        Logger.warn(`User ${user.email} attempted to view requests for case ${caseId} without ownership`);
        return ResponseHandler.forbidden('Only case owners can view access requests');
      }
    }

    // Mock pending requests data - in real app this would come from database
    const mockRequests = [
      {
        id: "req1",
        caseId: caseId,
        requestedAt: new Date().toISOString(),
        status: "pending",
        lawyer: {
          id: "lawyer2",
          firstName: "Michael",
          lastName: "Wong",
          email: "michael@legalpartners.com",
          specialization: "Employment & Labor Law",
          experience: 12,
          rating: 4.9,
          hourlyRate: 450
        }
      }
    ];

    Logger.info(`Pending requests for case ${caseId} fetched by owner ${user.email}`);

    return ResponseHandler.success(mockRequests, 'Pending requests retrieved successfully');

  } catch (error) {
    Logger.error('Get pending requests error:', error);
    return ResponseHandler.internalError('Failed to retrieve pending requests');
  }
}

/**
 * DELETE /api/cases/[id]/requests/[requestId] - Reject a specific access request
 * 
 * Authorization: User must own the case (CLIENT role only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const caseId = params.id;
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    
    if (!requestId) {
      return ResponseHandler.badRequest('Request ID is required');
    }

    // Validate case ID format
    if (!caseId || typeof caseId !== 'string' || caseId.trim().length === 0) {
      return ResponseHandler.notFound('Case not found');
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
      return ResponseHandler.forbidden('Only case owners can reject access requests');
    }
    
    // Check case ownership
    const isOwner = await AuthorizationService.isCaseOwner(user, caseId);
    
    if (!isOwner) {
      return ResponseHandler.forbidden('Only case owners can reject access requests');
    }

    // Mock rejection - in real app this would update database
    Logger.info(`Access request ${requestId} rejected for case ${caseId} by owner ${user.email}`);

    return ResponseHandler.success(null, 'Access request rejected successfully');

  } catch (error) {
    Logger.error('Reject access request error:', error);
    return ResponseHandler.internalError('Failed to reject access request');
  }
}