import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { ResponseHandler } from '@/server/utils/response';
import { CaseService } from '@/server/services/case.service';
import { CaseRepository } from '@/server/db/repositories/case.repository';
import { UserService } from '@/server/services';
import { UserRepository } from '@/server/db/repositories/user.repository';
import { Logger } from '@/server/utils/logger';

const caseService = new CaseService(new CaseRepository());
const userService = new UserService(new UserRepository());


interface RouteParams {
  params: Promise<{ id: string }>;
}
/**
 * POST /api/cases/[id]/request-access - Request access to a case (for lawyers)
 * 
 * Authorization: Only LAWYER role users can request access
 * 
 * @param params - Contains the case ID
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const caseId = resolvedParams?.id;;

    
    // Retrieve the "token" cookie from the request
    const token = (await cookies()).get("token")?.value;

    // If there is no token, return 401 Unauthorized
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify and decode the JWT using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Query the database to find the user by ID
    const user = await userService.getUserById(decoded.userId);

    // If no user is found, return 404 Not Found
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is a lawyer
    if (user.role !== 'LAWYER') {
      return ResponseHandler.forbidden('Only lawyers can request case access');
    }

    // Validate case ID
    if (!caseId) {
      return ResponseHandler.badRequest('Case ID is required');
    }

    // Request access to the case
    const result = await caseService.requestLawyerAccess(caseId, user.id);

    if (!result.success) {
      return ResponseHandler.badRequest(result.message);
    }

    Logger.info(`Lawyer ${user.email} requested access to case ${caseId}`);

    return ResponseHandler.success({
      message: result.message,
      requestSubmitted: true,
    });

  } catch (error) {
    // Handle JWT verification errors
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    Logger.error('Request case access error:', error);
    return ResponseHandler.internalError('Failed to request case access');
  }
}

/**
 * GET /api/cases/[id]/request-access - Get access requests for a case (for case owners)
 * 
 * Authorization: Only case owner or ADMIN can view access requests
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Retrieve the "token" cookie from the request
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await userService.getUserById(decoded.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const caseId = params.id;

    // Get case to check ownership
    const caseEntity = await caseService.getCaseById(caseId);
    if (!caseEntity) {
      return ResponseHandler.notFound('Case not found');
    }

    // Check if user is case owner or admin
    if (caseEntity.ownerId !== user.id && user.role !== 'ADMIN') {
      return ResponseHandler.forbidden('Only case owner or admin can view access requests');
    }

    // Get access requests for this case
    const accessRequests = await caseService.getCaseAccessRequests(caseId);

    return ResponseHandler.success({
      caseId,
      requests: accessRequests,
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    Logger.error('Get case access requests error:', error);
    return ResponseHandler.internalError('Failed to get access requests');
  }
}