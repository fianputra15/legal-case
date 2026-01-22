import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, getCasesQuerySchema } from '@/server/utils/validation';
import { CaseService } from '@/server/services/case.service';
import { CaseRepository } from '@/server/db/repositories/case.repository';
import { UserService } from '@/server/services';
import { UserRepository } from '@/server/db/repositories/user.repository';
import { AuthorizationService } from '@/server/auth/authorization';
import { Logger } from '@/server/utils/logger';
import { CaseFilters, PaginationOptions } from '@/server/types/database';

const caseService = new CaseService(new CaseRepository());
const userService = new UserService(new UserRepository());

/**
 * GET /api/my-cases - Get cases accessible to the current user
 * 
 * Authorization:
 * - CLIENT: Returns cases owned by the client
 * - LAWYER: Returns cases where the lawyer has been granted access through CaseAccess table
 * - ADMIN: Returns all cases
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
    // This will return cases based on user's role:
    // - CLIENT: owned cases
    // - LAWYER: cases with granted access
    // - ADMIN: all cases
    const accessibleCaseIds = await AuthorizationService.getAccessibleCaseIds(user);
    
    console.log("My Cases - User role:", user.role);
    console.log("My Cases - Accessible case IDs:", accessibleCaseIds);
    
    // Fetch filtered and paginated case data
    const result = await caseService.getCasesWithFilters(accessibleCaseIds, filters, pagination);

    // Handle edge cases
    if (result.pagination.total === 0) {
      Logger.info(`No accessible cases found for user ${user.email} (role: ${user.role})`);
      return ResponseHandler.success({
        cases: [],
        pagination: result.pagination,
        userRole: user.role,
        appliedFilters: filters,
        message: `No cases found. ${user.role === 'CLIENT' ? 'You haven\'t created any cases yet.' : user.role === 'LAWYER' ? 'No cases have been assigned to you yet.' : 'No cases available.'}`
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

    Logger.info(`Listed ${result.data.length} accessible cases (page ${pagination.page}/${result.pagination.totalPages}) for user ${user.email} (role: ${user.role})`);

    return ResponseHandler.success({
      cases: result.data,
      pagination: result.pagination,
      userRole: user.role,
      appliedFilters: filters,
    });

  } catch (error) {
    // Handle JWT verification errors
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    Logger.error('Get my cases error:', error);
    return ResponseHandler.internalError('Failed to retrieve your cases');
  }
}