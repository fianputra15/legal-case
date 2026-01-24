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

/**
 * @swagger
 * /api/my-access-requests:
 *   get:
 *     tags:
 *       - Cases
 *     summary: Get lawyer's pending access requests
 *     description: |
 *       Retrieve all pending access requests submitted by the authenticated lawyer.
 *       Only accessible by users with LAWYER role.
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Access requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CaseAccessRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Only lawyers can access this endpoint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * GET /api/my-access-requests - Get lawyer's pending access requests
 * 
 * Authorization: Only LAWYER role users can access this endpoint
 */
export async function GET(request: NextRequest) {
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

    // Check if user is a lawyer
    if (user.role !== 'LAWYER') {
      return ResponseHandler.forbidden('Only lawyers can view access requests');
    }

    // Get lawyer's pending access requests
    const accessRequests = await caseService.getLawyerAccessRequests(user.id);

    return ResponseHandler.success({
      requests: accessRequests,
      total: accessRequests.length,
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    Logger.error('Get lawyer access requests error:', error);
    return ResponseHandler.internalError('Failed to get access requests');
  }
}