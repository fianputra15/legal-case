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
 * @swagger
 * /api/cases/{id}/access-requests:
 *   put:
 *     tags:
 *       - Cases
 *     summary: Handle case access request (approve/reject)
 *     description: |
 *       Approve or reject a pending access request from a lawyer for a specific case.
 *       Only the case owner (CLIENT) can perform this action.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *         example: "clx789def012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - lawyerId
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: Action to perform on the request
 *                 example: "approve"
 *               lawyerId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the lawyer making the request
 *                 example: "clx123abc456"
 *     responses:
 *       200:
 *         description: Access request handled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Access request approved successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * PUT /api/cases/[id]/access-requests - Handle access request (approve/reject)
 * 
 * Authorization: Only case owner or admin
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params since it's now async in Next.js
    const resolvedParams = await params;
    
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

    const caseId = resolvedParams.id;

    // Get case to check ownership
    const caseEntity = await caseService.getCaseById(caseId);
    if (!caseEntity) {
      return ResponseHandler.notFound('Case not found');
    }

    // Parse request body
    const body = await request.json();
    
    let validatedData;
    try {
      validatedData = handleRequestSchema.parse(body);
    } catch (error) {
      console.log('Validation error:', error);
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