import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, createCaseSchema, getCasesQuerySchema } from '@/server/utils/validation';
import { CaseService } from '@/server/services/case.service';
import { CaseRepository } from '@/server/db/repositories/case.repository';
import { UserService } from '@/server/services';
import { UserRepository } from '@/server/db/repositories/user.repository';
import { AuthorizationService } from '@/server/auth/authorization';
import { Logger } from '@/server/utils/logger';
import { CaseFilters, PaginationOptions } from '@/server/types/database';
import { CaseAccessUtils } from '@/server/utils/case-access';

const caseService = new CaseService(new CaseRepository());
const userService = new UserService(new UserRepository());

/**
 * @swagger
 * /api/cases:
 *   get:
 *     tags:
 *       - Cases
 *     summary: Browse all cases with filters and pagination
 *     description: |
 *       Get list of cases based on user role and permissions.
 *       - LAWYER: Can see all cases for browsing and discovery
 *       - CLIENT: Can see only their own cases
 *       - ADMIN: Can see all cases
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search term for case title or description
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [OPEN, CLOSED]
 *         description: Filter by case status
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *           enum: [CRIMINAL_LAW, CIVIL_LAW, CORPORATE_LAW, FAMILY_LAW, IMMIGRATION_LAW, INTELLECTUAL_PROPERTY, LABOR_LAW, REAL_ESTATE, TAX_LAW, OTHER]
 *         description: Filter by case category
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: [newest, oldest, title]
 *           default: newest
 *         description: Sort order for results
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
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                     userRole:
 *                       type: string
 *                       enum: [CLIENT, LAWYER, ADMIN]
 *                     appliedFilters:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function GET(request: NextRequest) {
  try {
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
    let accessibleCaseIds: string[];
    
    if (user.role === 'LAWYER') {
      // LAWYERS can see all cases
      const allCases = await caseService.getAllCaseIds();
      accessibleCaseIds = allCases;
    } else {
      // For other roles, use existing authorization logic
      accessibleCaseIds = await AuthorizationService.getAccessibleCaseIds(user);
    }
    
    console.log("User role:", user.role);
    console.log("Accessible case IDs:", accessibleCaseIds);
    
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
          page: pagination.page, 
        },
        userRole: user.role,
        appliedFilters: filters,
        message: `Page ${pagination.page} is out of range. Total pages available: ${result.pagination.totalPages}`,
      });
    }

    Logger.info(`Listed ${result.data.length} cases (page ${pagination.page}/${result.pagination.totalPages}) for user ${user.email} (role: ${user.role})`);

    // Enhance cases with access information for lawyers
    const enhancedCases = await CaseAccessUtils.enhanceCasesWithAccessInfo(
      result.data,
      user.id
    );
    return ResponseHandler.success({
      cases: enhancedCases,
      pagination: result.pagination,
      userRole: user.role,
      appliedFilters: filters,
    });

  } catch (error) {
    // Handle JWT verification errors
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    Logger.error('Get cases error:', error);
    return ResponseHandler.internalError('Failed to retrieve cases');
  }
}

/**
 * @swagger
 * /api/cases:
 *   post:
 *     tags:
 *       - Cases
 *     summary: Create a new legal case
 *     description: Create a new case. Only clients can create cases.
 *     security:
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
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: "Contract Dispute - ABC Corp"
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *                 example: "Client needs assistance with contract dispute regarding service delivery terms."
 *               category:
 *                 type: string
 *                 enum: [CRIMINAL_LAW, CIVIL_LAW, CORPORATE_LAW, FAMILY_LAW, IMMIGRATION_LAW, INTELLECTUAL_PROPERTY, LABOR_LAW, REAL_ESTATE, TAX_LAW, OTHER]
 *                 example: "CORPORATE_LAW"
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 4
 *                 example: 3
 *                 description: "1=Low, 2=Medium, 3=High, 4=Urgent"
 *             required: [title, category, priority]
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
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function POST(request: NextRequest) {
  try {
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
    // Handle JWT verification errors
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    Logger.error('Create case error:', error);
    // Don't expose internal errors to client
    if (error instanceof Error && (error.message.includes('required') || error.message.includes('Invalid'))) {
      return ResponseHandler.badRequest(error.message);
    }
    return ResponseHandler.internalError('Failed to create case');
  }
}