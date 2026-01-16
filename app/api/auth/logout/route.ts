import { NextRequest, NextResponse } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { AuthMiddleware } from '@/server/auth/middleware';
import { Logger } from '@/server/utils/logger';

/**
 * POST /api/auth/logout
 * Clear authentication cookie and invalidate session
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user for logging (optional)
    const currentUser = await AuthMiddleware.getCurrentUser(request);
    
    if (currentUser) {
      Logger.info(`User logged out: ${currentUser.email}`);
    }

    // Create response and clear auth cookie
    const response = ResponseHandler.success(null, 'Logged out successfully');
    response.headers.set('Set-Cookie', AuthMiddleware.createLogoutCookie());
    
    return response;

  } catch (error) {
    Logger.error('Logout error:', error);
    // Still clear the cookie even if there's an error
    const response = ResponseHandler.success(null, 'Logged out');
    response.headers.set('Set-Cookie', AuthMiddleware.createLogoutCookie());
    return response;
  }
}