import { NextRequest, NextResponse } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, updateCaseSchema } from '@/server/utils/validation';
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
 * GET /api/cases/[id] - Get a specific case
 * 
 * Authorization: User must have access to the case via canAccessCase()
 * 
 * Security Design:
 * - Returns 404 for both non-existent cases AND unauthorized access
 * - This prevents resource enumeration attacks (cannot determine if case exists)
 * - Never returns 403 to avoid information leakage
 * 
 * Status Code Strategy:
 * - 401: Not authenticated (no valid token)
 * - 404: Case not found OR no access (security by design)
 * - 200: Success with case data
 * - 500: Internal server error
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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
      console.log(error)
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    // Query the database to find the user by ID
    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Check authorization using canAccessCase
    // This handles both case existence and access permissions in one secure check
    const hasAccess = await AuthorizationService.canAccessCase(user, caseId);
    
    if (!hasAccess) {
      // Security: Return 404 for both non-existent cases and unauthorized access
      // This prevents attackers from determining which cases exist in the system
      Logger.warn(`Access denied or case not found: User ${user.email} (${user.role}) attempted to access case ${caseId}`);
      return ResponseHandler.notFound('Case not found');
    }
    
    // User is authorized - fetch case data
    // Note: We still need to check if case exists in case of race conditions
    const caseData = await caseService.getCaseById(caseId);
    
    console.log(caseData);
    if (!caseData) {
      // This should rarely happen due to the authorization check above,
      // but handles race conditions (e.g., case deleted between checks)
      Logger.warn(`Case ${caseId} disappeared between authorization and fetch for user ${user.email}`);
      return ResponseHandler.notFound('Case not found');
    }

    Logger.info(`Case ${caseId} successfully accessed by user ${user.email} (${user.role})`);

    return ResponseHandler.success(caseData);

  } catch (error) {
    Logger.error('Get case error:', error);
    // Never expose internal error details that might leak information
    return ResponseHandler.internalError('Failed to retrieve case');
  }
}

/**
 * PUT /api/cases/[id] - Update a specific case
 * 
 * Authorization: User must own the case
 * - Only case owners can modify their cases
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const caseId = resolvedParams.id;
    
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
      console.log(error);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    // Query the database to find the user by ID
    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Check case ownership using AuthorizationService
    const isOwner = await AuthorizationService.isCaseOwner(user, caseId);
    if (!isOwner) {
      const hasAccess = await AuthorizationService.canAccessCase(user, caseId);
      if (!hasAccess) {
        Logger.warn(`User ${user.email} attempted to update non-existent or inaccessible case ${caseId}`);
        return ResponseHandler.notFound('Case not found');
      } else {
        Logger.warn(`User ${user.email} attempted to update case ${caseId} without ownership`);
        return ResponseHandler.forbidden('Only case owners can update cases');
      }
    }
    const body = await request.json();
    const updateData = validateRequest(updateCaseSchema, body);

    const updatedCase = await caseService.updateCase(caseId, updateData);

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
 * Authorization: User must own the case
 * - Only case owners can delete their cases
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const caseId = resolvedParams.id;
    
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
      console.log(error);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    // Query the database to find the user by ID
    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Check case ownership using AuthorizationService
    const isOwner = await AuthorizationService.isCaseOwner(user, caseId);
    if (!isOwner) {
      const hasAccess = await AuthorizationService.canAccessCase(user, caseId);
      if (!hasAccess) {
        Logger.warn(`User ${user.email} attempted to delete non-existent or inaccessible case ${caseId}`);
        return ResponseHandler.notFound('Case not found');
      } else {
        Logger.warn(`User ${user.email} attempted to delete case ${caseId} without ownership`);
        return ResponseHandler.forbidden('Only case owners can delete cases');
      }
    }
    const deleted = await caseService.deleteCase(caseId);

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

/**
 * PATCH /api/cases/[id] - Partially update a specific case
 * 
 * Authorization: User must own the case (CLIENT role only)
 * - Only case owners (clients) can modify their cases
 * - Lawyers are explicitly prevented from updating cases
 * 
 * Allowed Updates:
 * - title: Case title (string, 1-255 characters)
 * - category: Case category (enum)
 * - status: Case status (enum)
 * 
 * Status Code Strategy:
 * - 401: Not authenticated
 * - 403: Not case owner or not a client
 * - 404: Case not found
 * - 400: Invalid input data
 * - 200: Success
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
      console.log(error);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    // Query the database to find the user by ID
    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Only CLIENT role can update cases (prevent lawyers from updating)
    if (user.role !== 'CLIENT') {
      Logger.warn(`Non-client user ${user.email} (${user.role}) attempted to update case ${caseId}`);
      return ResponseHandler.forbidden('Only case owners can update cases');
    }
    
    // Check case ownership using AuthorizationService
    const isOwner = await AuthorizationService.isCaseOwner(user, caseId);
    
    if (!isOwner) {
      // For ownership checks, we can be more specific about the error
      // since we're checking ownership, not just access
      const hasAccess = await AuthorizationService.canAccessCase(user, caseId);
      if (!hasAccess) {
        // Case doesn't exist or no access at all
        Logger.warn(`User ${user.email} attempted to update non-existent or inaccessible case ${caseId}`);
        return ResponseHandler.notFound('Case not found');
      } else {
        // Case exists but user is not the owner
        Logger.warn(`User ${user.email} attempted to update case ${caseId} without ownership`);
        return ResponseHandler.forbidden('Only case owners can update cases');
      }
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      Logger.error('Invalid JSON in update case request:', error);
      return ResponseHandler.badRequest('Invalid JSON format');
    }

    // Validate update data against schema
    let updateData;
    try {
      updateData = validateRequest(updateCaseSchema, body);
    } catch (error) {
      Logger.error('Validation failed for update case:', error);
      return ResponseHandler.badRequest(error instanceof Error ? error.message : 'Validation failed');
    }

    // Perform the update
    const updatedCase = await caseService.updateCase(caseId, updateData);

    if (!updatedCase) {
      // This should rarely happen due to ownership check above,
      // but handles race conditions (e.g., case deleted between checks)
      Logger.warn(`Case ${caseId} disappeared during update by user ${user.email}`);
      return ResponseHandler.notFound('Case not found');
    }

    Logger.info(`Case ${caseId} successfully updated by owner ${user.email}`);

    return ResponseHandler.success(updatedCase, 'Case updated successfully');

  } catch (error) {
    Logger.error('Update case error:', error);
    // Handle specific business logic errors
    if (error instanceof Error && (error.message.includes('required') || error.message.includes('empty') || error.message.includes('provided'))) {
      return ResponseHandler.badRequest(error.message);
    }
    return ResponseHandler.internalError('Failed to update case');
  }
}