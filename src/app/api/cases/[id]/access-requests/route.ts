import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { ResponseHandler } from '@/server/utils/response';
import { CaseService } from '@/server/services/case.service';
import { CaseRepository } from '@/server/db/repositories/case.repository';
import { UserService } from '@/server/services';
import { UserRepository } from '@/server/db/repositories/user.repository';
import { Logger } from '@/server/utils/logger';
import { z } from 'zod';

const caseService = new CaseService(new CaseRepository());
const userService = new UserService(new UserRepository());

const handleRequestSchema = z.object({
  action: z.enum(['approve', 'reject']),
  lawyerId: z.string().uuid(),
});

/**
 * PUT /api/cases/[id]/access-requests - Handle access request (approve/reject)
 * 
 * Authorization: Only case owne
 */
export async function PUT(
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
      return ResponseHandler.forbidden('Only case owner or admin can handle access requests');
    }

    // Parse request body
    const body = await request.json();
    
    let validatedData;
    try {
      validatedData = handleRequestSchema.parse(body);
    } catch (error) {
      return ResponseHandler.badRequest('Invalid request data');
    }

    // Handle the access request
    const result = await caseService.handleAccessRequest(
      caseId, 
      validatedData.lawyerId, 
      validatedData.action,
      user.id
    );

    if (!result.success) {
      return ResponseHandler.badRequest(result.message);
    }

    Logger.info(`User ${user.email} ${validatedData.action}ed access request from lawyer ${validatedData.lawyerId} for case ${caseId}`);

    return ResponseHandler.success({
      message: result.message,
      action: validatedData.action,
      caseId,
      lawyerId: validatedData.lawyerId,
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    Logger.error('Handle access request error:', error);
    return ResponseHandler.internalError('Failed to handle access request');
  }
}