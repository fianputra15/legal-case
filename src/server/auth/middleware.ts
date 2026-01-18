import { NextRequest, NextResponse } from 'next/server';
import { AuthUser } from './types';
import { AuthUtils, TokenPayload } from './utils';
import { UserRepository } from '../db/repositories/user.repository';
import { ResponseHandler } from '../utils/response';

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthUser;
}

const userRepository = new UserRepository();

export class AuthMiddleware {
  /**
   * Get current user from request token (no authentication required)
   * Returns null if token is invalid or missing
   */
  static async getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
    try {
      const token = AuthUtils.extractTokenFromRequest(request);
      if (!token) {
        return null;
      }

      const payload = await AuthUtils.verifyToken(token);
      if (!payload) {
        return null;
      }

      // Fetch current user data to ensure it's still valid
      const user = await userRepository.findById(payload.userId);
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };
    } catch (error) {
      // Always return null on error - no authentication required
      return null;
    }
  }

  /**
   * Require authentication - returns error response if not authenticated
   */
  static async requireAuth(request: NextRequest): Promise<{ user: AuthUser } | NextResponse> {
    try {
      const user = await this.getCurrentUser(request);
      if (!user) {
        return ResponseHandler.unauthorized('Authentication required');
      }

      return { user };
    } catch (error) {
      return ResponseHandler.unauthorized('Authentication failed');
    }
  }

  /**
   * Require specific role - returns error response if not authorized
   */
  static async requireRole(request: NextRequest, allowedRoles: string[]): Promise<{ user: AuthUser } | NextResponse> {
    const authResult = await this.requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }

    const { user } = authResult;
    if (!allowedRoles.includes(user.role)) {
      return ResponseHandler.forbidden('Insufficient permissions');
    }

    return { user };
  }

  /**
   * Create secure httpOnly cookie for JWT token
   */
  static createAuthCookie(token: string): string {
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    
    return `auth-token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}; Path=/`;
  }

  /**
   * Create cookie to clear authentication
   */
  static createLogoutCookie(): string {
    return 'auth-token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/';
  }

  /**
   * Require case access authorization
   * Returns error response if user cannot access the case
   * 
   * @param request - Next.js request object
   * @param caseId - Case ID to check access for
   * @returns User object if authorized, or error response
   */
  static async requireCaseAccess(request: NextRequest, caseId: string): Promise<{ user: AuthUser } | NextResponse> {
    const authResult = await this.requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }

    const { user } = authResult;
    
    // Import here to avoid circular dependencies
    const { AuthorizationService } = await import('./authorization');
    const accessCheck = await AuthorizationService.canAccessCase(user, caseId);
    
    if (!accessCheck) {
      return ResponseHandler.forbidden('Access denied');
    }

    return { user };
  }

  /**
   * Require case ownership authorization
   * Returns error response if user is not the case owner
   * 
   * @param request - Next.js request object  
   * @param caseId - Case ID to check ownership for
   * @returns User object if owner, or error response
   */
  static async requireCaseOwnership(request: NextRequest, caseId: string): Promise<{ user: AuthUser } | NextResponse> {
    const authResult = await this.requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }

    const { user } = authResult;
    
    // Admin always has ownership-level access
    if (user.role === 'ADMIN') {
      return { user };
    }

    const { AuthorizationService } = await import('./authorization');
    const ownershipCheck = await AuthorizationService.isCaseOwner(user, caseId);
    
    if (!ownershipCheck) {
      return ResponseHandler.forbidden('Only case owners can perform this action');
    }

    return { user };
  }

  /**
   * Middleware to check user permissions
   */
  static authorize(permissions: string[]) {
    return async (request: AuthenticatedRequest): Promise<NextResponse | null> => {
      // TODO: Implement authorization middleware
      return null;
    };
  }
}