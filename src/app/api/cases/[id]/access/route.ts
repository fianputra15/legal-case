import { NextRequest, NextResponse } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, grantCaseAccessSchema, revokeCaseAccessSchema } from '@/server/utils/validation';
import { CaseService } from '@/server/services/case.service';
import { CaseRepository } from '@/server/db/repositories/case.repository';
import { AuthorizationService } from '@/server/auth/authorization';
import { Logger } from '@/server/utils/logger';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { UserService } from '@/server/services';
import { UserRepository } from '@/server/db/repositories/user.repository';

const caseService = new CaseService(new CaseRepository());
const userService = new UserService(new UserRepository());

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * @swagger
 * /api/cases/{id}/access:
 *   post:
 *     tags:
 *       - Cases
 *     summary: Grant lawyer access to a case
 *     description: |
 *       Grant access to a specific lawyer for a case. Only the case owner (CLIENT) can perform this action.
 *       Validates that the target user has LAWYER role and prevents duplicate access grants.
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
 *               - lawyerId
 *             properties:
 *               lawyerId:
 *                 type: string
 *                 description: ID of the lawyer to grant access to
 *                 example: "clx123abc456"
 *     responses:
 *       200:
 *         description: Access granted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     caseId:
 *                       type: string
 *                       example: "clx789def012"
 *                     lawyerId:
 *                       type: string
 *                       example: "clx123abc456"
 *                     grantedBy:
 *                       type: string
 *                       example: "clowner123"
 *                     grantedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00Z"
 *                 message:
 *                   type: string
 *                   example: "Access granted successfully"
 *       400:
 *         description: Bad request - validation error or business rule violation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_lawyer:
 *                 summary: Invalid lawyer ID
 *                 value:
 *                   success: false
 *                   error: "Lawyer not found or invalid role"
 *               duplicate_access:
 *                 summary: Duplicate access grant
 *                 value:
 *                   success: false
 *                   error: "Lawyer already has access to this case"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     tags:
 *       - Cases
 *     summary: Revoke lawyer access from a case
 *     description: |
 *       Revoke access from a specific lawyer for a case. Only the case owner (CLIENT) can perform this action.
 *       Prevents lawyers from revoking access from cases.
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
 *               - lawyerId
 *             properties:
 *               lawyerId:
 *                 type: string
 *                 description: ID of the lawyer to revoke access from
 *                 example: "clx123abc456"
 *     responses:
 *       200:
 *         description: Access revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     caseId:
 *                       type: string
 *                       example: "clx789def012"
 *                     lawyerId:
 *                       type: string
 *                       example: "clx123abc456"
 *                     revokedBy:
 *                       type: string
 *                       example: "clowner123"
 *                     revokedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00Z"
 *                 message:
 *                   type: string
 *                   example: "Access revoked successfully"
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
 * POST /api/cases/[id]/access - Grant lawyer access to a case
 * 
 * Authorization: User must own the case (CLIENT role only)
 * - Only case owners can grant access to lawyers
 * - Validates that the target user has LAWYER role
 * - Prevents duplicate access grants
 * 
 * Request Body:
 * - lawyerId: string (required) - ID of the lawyer to grant access
 * 
 * Status Codes:
 * - 401: Not authenticated
 * - 403: Not case owner or not a client
 * - 404: Case not found
 * - 400: Invalid input or business logic error (lawyer not found, wrong role, duplicate access)
 * - 200: Success
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const caseId = resolvedParams.id;
    
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

    // Check if user has CLIENT role (only clients can create cases)
    if (user.role !== 'CLIENT') {
      return NextResponse.json({ error: "Only clients can create cases" }, { status: 403 });
    }
    // Check case ownership using AuthorizationService
    const isOwner = await AuthorizationService.isCaseOwner(user, caseId);
    
    if (!isOwner) {
      // Check if case exists to provide appropriate error
      const hasAccess = await AuthorizationService.canAccessCase(user, caseId);
      if (!hasAccess) {
        // Case doesn't exist or no access at all
        Logger.warn(`User ${user.email} attempted to grant access to non-existent or inaccessible case ${caseId}`);
        return ResponseHandler.notFound('Case not found');
      } else {
        // Case exists but user is not the owner
        Logger.warn(`User ${user.email} attempted to grant access to case ${caseId} without ownership`);
        return ResponseHandler.forbidden('Only case owners can grant lawyer access');
      }
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      Logger.error('Invalid JSON in grant access request:', error);
      return ResponseHandler.badRequest('Invalid JSON format');
    }

    // Validate grant access data against schema
    let grantData;
    try {
      grantData = validateRequest(grantCaseAccessSchema, body);
    } catch (error) {
      Logger.error('Validation failed for grant access:', error);
      return ResponseHandler.badRequest(error instanceof Error ? error.message : 'Validation failed');
    }

    // Grant access using service layer (handles business logic validation)
    const result = await caseService.grantLawyerAccess(caseId, grantData.lawyerId, user.id);

    if (!result.success) {
      Logger.warn(`Failed to grant access to case ${caseId} for lawyer ${grantData.lawyerId}: ${result.message}`);
      return ResponseHandler.badRequest(result.message);
    }

    Logger.info(`Access granted to case ${caseId} for lawyer ${grantData.lawyerId} by owner ${user.email}`);

    return ResponseHandler.success(
      { 
        caseId, 
        lawyerId: grantData.lawyerId, 
        grantedBy: user.id,
        grantedAt: new Date().toISOString()
      }, 
      result.message
    );

  } catch (error) {
    Logger.error('Grant access error:', error);
    return ResponseHandler.internalError('Failed to grant access');
  }
}

/**
 * DELETE /api/cases/[id]/access - Revoke lawyer access from a case
 * 
 * Authorization: User must own the case (CLIENT role only)
 * - Only case owners can revoke access from lawyers
 * - Validates that the lawyer currently has access
 * 
 * Request Body:
 * - lawyerId: string (required) - ID of the lawyer to revoke access from
 * 
 * Status Codes:
 * - 401: Not authenticated
 * - 403: Not case owner or not a client
 * - 404: Case not found
 * - 400: Invalid input or business logic error (lawyer not found, no existing access)
 * - 200: Success
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const caseId = resolvedParams.id;
    
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
    
    // Only CLIENT role can revoke access (prevent lawyers from revoking access)
    if (user.role !== 'CLIENT') {
      Logger.warn(`Non-client user ${user.email} (${user.role}) attempted to revoke access from case ${caseId}`);
      return ResponseHandler.forbidden('Only case owners can revoke lawyer access');
    }
    
    // Check case ownership using AuthorizationService
    const isOwner = await AuthorizationService.isCaseOwner(user, caseId);
    
    if (!isOwner) {
      // Check if case exists to provide appropriate error
      const hasAccess = await AuthorizationService.canAccessCase(user, caseId);
      if (!hasAccess) {
        // Case doesn't exist or no access at all
        Logger.warn(`User ${user.email} attempted to revoke access from non-existent or inaccessible case ${caseId}`);
        return ResponseHandler.notFound('Case not found');
      } else {
        // Case exists but user is not the owner
        Logger.warn(`User ${user.email} attempted to revoke access from case ${caseId} without ownership`);
        return ResponseHandler.forbidden('Only case owners can revoke lawyer access');
      }
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      Logger.error('Invalid JSON in revoke access request:', error);
      return ResponseHandler.badRequest('Invalid JSON format');
    }

    // Validate revoke access data against schema
    let revokeData;
    try {
      revokeData = validateRequest(revokeCaseAccessSchema, body);
    } catch (error) {
      Logger.error('Validation failed for revoke access:', error);
      return ResponseHandler.badRequest(error instanceof Error ? error.message : 'Validation failed');
    }

    // Revoke access using service layer (handles business logic validation)
    const result = await caseService.revokeLawyerAccess(caseId, revokeData.lawyerId);

    if (!result.success) {
      Logger.warn(`Failed to revoke access from case ${caseId} for lawyer ${revokeData.lawyerId}: ${result.message}`);
      return ResponseHandler.badRequest(result.message);
    }

    Logger.info(`Access revoked from case ${caseId} for lawyer ${revokeData.lawyerId} by owner ${user.email}`);

    return ResponseHandler.success(
      { 
        caseId, 
        lawyerId: revokeData.lawyerId, 
        revokedBy: user.id,
        revokedAt: new Date().toISOString()
      }, 
      result.message
    );

  } catch (error) {
    Logger.error('Revoke access error:', error);
    return ResponseHandler.internalError('Failed to revoke access');
  }
}