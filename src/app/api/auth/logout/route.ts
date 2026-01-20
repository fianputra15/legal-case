import { NextRequest, NextResponse } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { AuthMiddleware } from '@/server/auth/middleware';
import { sessionStore } from '@/server/auth/session-store';
import { AuthUtils } from '@/server/auth/utils';
import { Logger } from '@/server/utils/logger';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User logout
 *     description: Clear session cookie and invalidate user session
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         headers:
 *           Set-Cookie:
 *             description: Clears the session cookie
 *             schema:
 *               type: string
 *               example: "session-id=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function POST(request: NextRequest) {
  try {
    // Get current session ID
    const sessionId = AuthUtils.extractSessionIdFromRequest(request);
    
    // Get current user for logging (optional)
    const currentUser = await AuthMiddleware.getCurrentUser(request);
    
    // Remove session from store if it exists
    if (sessionId) {
      sessionStore.delete(sessionId);
      Logger.info('Session removed from store:', { sessionId });
    }
    
    if (currentUser) {
      Logger.info(`User logged out: ${currentUser.email}`);
    }

    // Create response and clear session cookie
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