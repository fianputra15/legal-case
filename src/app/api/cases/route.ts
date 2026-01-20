import { NextRequest } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, createCaseSchema, getCasesQuerySchema } from '@/server/utils/validation';
import { CaseService } from '@/server/services/case.service';
import { CaseRepository } from '@/server/db/repositories/case.repository';
import { AuthMiddleware } from '@/server/auth/middleware';
import { AuthorizationService } from '@/server/auth/authorization';
import { Logger } from '@/server/utils/logger';
import { CaseFilters, PaginationOptions } from '@/server/types/database';

const caseService = new CaseService(new CaseRepository());

/**
 * @swagger
 * /api/cases:
 *   get:
 *     tags:
 *       - Cases
 *     summary: List accessible cases
 *     description: |
 *       Retrieve all cases accessible to the authenticated user based on their role:
 *       - **CLIENT**: Only their own cases
 *       - **LAWYER**: Cases explicitly granted to them
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Cases retrieved successfully
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
 *                     cases:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Case'
 *                     total:
 *                       type: integer
 *                       example: 5
 *                     userRole:
 *                       type: string
 *                       enum: ['CLIENT', 'LAWYER']
 *                       example: 'CLIENT'
 *             examples:
 *               client_cases:
 *                 summary: Client's own cases
 *                 value:
 *                   success: true
 *                   data:
 *                     cases:
 *                       - id: "clx789def012"
 *                         title: "Contract Dispute - ABC Corp"
 *                         category: "CORPORATE_LAW"
 *                         status: "OPEN"
 *                         priority: 3
 *                         ownerId: "clx123abc456"
 *                         createdAt: "2024-01-15T10:30:00Z"
 *                         updatedAt: "2024-01-15T10:30:00Z"
 *                     total: 1
 *                     userRole: "CLIENT"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   post:
 *     tags:
 *       - Cases
 *     summary: Create a new case
 *     description: Create a new legal case. The authenticated user becomes the case owner.
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Property Purchase Legal Review"
 *               description:
 *                 type: string
 *                 example: "Legal review required for residential property purchase"
 *               category:
 *                 type: string
 *                 enum: ['CRIMINAL_LAW', 'CIVIL_LAW', 'CORPORATE_LAW', 'FAMILY_LAW', 'IMMIGRATION_LAW', 'INTELLECTUAL_PROPERTY', 'LABOR_LAW', 'REAL_ESTATE', 'TAX_LAW', 'OTHER']
 *                 example: "REAL_ESTATE"
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 4
 *                 example: 2
 *             required: ['title', 'category']
 *     responses:
 *       201:
 *         description: Case created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Case'
 *                 message:
 *                   type: string
 *                   example: "Case created successfully"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Validation failed"
 *               message: "Title is required"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * GET /api/cases - List cases accessible to the authenticated user with filtering and pagination
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - search: Search by title (case-insensitive)
 * - status: Filter by case status
 * - category: Filter by case category
 * 
 * Authorization:
 * - Clients see only their own cases
 * - Lawyers see cases explicitly granted to them
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await AuthMiddleware.requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const { user } = authResult;

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    let validatedQuery;
    try {
      validatedQuery = validateRequest(getCasesQuerySchema, queryParams);
    } catch (error) {
      Logger.error('Invalid query parameters:', error);
      return ResponseHandler.badRequest(error instanceof Error ? error.message : 'Invalid query parameters');
    }

    // Extract pagination options
    const pagination: PaginationOptions = {
      page: validatedQuery.page,
      limit: validatedQuery.limit,
    };

    // Extract filters
    const filters: CaseFilters = {
      ...(validatedQuery.search && { search: validatedQuery.search }),
      ...(validatedQuery.status && { status: validatedQuery.status }),
      ...(validatedQuery.category && { category: validatedQuery.category }),
    };

    // Get cases accessible to this user based on role and permissions
    const accessibleCaseIds = await AuthorizationService.getAccessibleCaseIds(user);
    
    // Fetch filtered and paginated case data
    const result = await caseService.getCasesWithFilters(accessibleCaseIds, filters, pagination);

    // Handle edge cases
    if (result.pagination.total === 0) {
      Logger.info(`No cases found for user ${user.email} with current filters`);
      return ResponseHandler.success({
        cases: [],
        pagination: result.pagination,
        userRole: user.role,
        appliedFilters: filters,
      });
    }

    // Handle out-of-range pages
    if (pagination.page > result.pagination.totalPages) {
      Logger.info(`Page ${pagination.page} out of range for user ${user.email} (max: ${result.pagination.totalPages})`);
      return ResponseHandler.success({
        cases: [],
        pagination: {
          ...result.pagination,
          page: pagination.page, // Keep requested page in response
        },
        userRole: user.role,
        appliedFilters: filters,
        message: `Page ${pagination.page} is out of range. Total pages available: ${result.pagination.totalPages}`,
      });
    }

    Logger.info(`Listed ${result.data.length} cases (page ${pagination.page}/${result.pagination.totalPages}) for user ${user.email} (role: ${user.role})`);

    return ResponseHandler.success({
      cases: result.data,
      pagination: result.pagination,
      userRole: user.role,
      appliedFilters: filters,
    });

  } catch (error) {
    Logger.error('Get cases error:', error);
    return ResponseHandler.internalError('Failed to retrieve cases');
  }
}

/**
 * POST /api/cases - Create a new case
 * 
 * Authorization: Only CLIENT role users can create cases
 * - The authenticated user becomes the case owner
 * - Required fields: title, category
 * - Optional fields: status (defaults to OPEN)
 */
export async function POST(request: NextRequest) {
  try {
    // Require CLIENT role specifically
    const authResult = await AuthMiddleware.requireRole(request, ['CLIENT']);
    if (authResult instanceof Response) {
      return authResult;
    }

    const { user } = authResult;
    
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      Logger.error('Invalid JSON in create case request:', error);
      return ResponseHandler.badRequest('Invalid JSON format');
    }

    // Validate input against schema
    let caseData;
    try {
      caseData = validateRequest(createCaseSchema, body);
    } catch (error) {
      Logger.error('Validation failed for create case:', error);
      return ResponseHandler.badRequest(error instanceof Error ? error.message : 'Validation failed');
    }
    
    // Create case with authenticated client as owner
    const newCase = await caseService.createCase(caseData, user.id);

    Logger.info(`Case created: ${newCase.id} by client: ${user.email}`);

    return ResponseHandler.created(newCase, 'Case created successfully');

  } catch (error) {
    Logger.error('Create case error:', error);
    // Don't expose internal errors to client
    if (error instanceof Error && (error.message.includes('required') || error.message.includes('Invalid'))) {
      return ResponseHandler.badRequest(error.message);
    }
    return ResponseHandler.internalError('Failed to create case');
  }
}