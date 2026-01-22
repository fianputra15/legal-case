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
 * GET /api/cases - Browse all cases (for discovery/browsing)
 * 
 * Authorization:
 * - LAWYER: Can see all cases for browsing and discovery
 * - CLIENT: Can see only their own cases
 * - ADMIN: Can see all cases
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
      const allCases = await caseService.getAllCaseIds(); // You'll need to add this method
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
          page: pagination.page, // Keep requested page in response
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
      user.id,
      user.role
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
 * POST /api/cases - Create a new case
 * 
 * Authorization: Only CLIENT role users can create cases
 * - The authenticated user becomes the case owner
 * - Required fields: title, category
 * - Optional fields: status (defaults to OPEN)
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