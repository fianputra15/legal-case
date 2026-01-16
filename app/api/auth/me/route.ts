import { NextRequest } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { AuthMiddleware } from '@/server/auth/middleware';
import { AuthUser } from '@/server/auth/types';
import { Logger } from '@/server/utils/logger';

/**
 * GET /api/auth/me
 * Get current authenticated user information
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await AuthMiddleware.requireAuth(request);
    
    // If authResult is a NextResponse, authentication failed
    if (authResult instanceof Response) {
      return authResult;
    }

    const { user } = authResult;

    return ResponseHandler.success({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

  } catch (error) {
    Logger.error('Get current user error:', error);
    // Never leak internal errors to client
    return ResponseHandler.internalError('Unable to fetch user information');
  }
}