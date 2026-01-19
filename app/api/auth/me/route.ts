import { NextRequest } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { AuthMiddleware } from '@/server/auth/middleware';
import { Logger } from '@/server/utils/logger';

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user
 *     description: Retrieve information about the currently authenticated user
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Current user information retrieved successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *             examples:
 *               client:
 *                 summary: Client user
 *                 value:
 *                   success: true
 *                   data:
 *                     user:
 *                       id: "clx123abc456"
 *                       email: "client@example.com"
 *                       firstName: "Jane"
 *                       lastName: "Doe"
 *                       role: "CLIENT"
 *               lawyer:
 *                 summary: Lawyer user
 *                 value:
 *                   success: true
 *                   data:
 *                     user:
 *                       id: "clx789def012"
 *                       email: "lawyer@legal.com"
 *                       firstName: "John"
 *                       lastName: "Smith"
 *                       role: "LAWYER"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *         content:
 *           application/json:
 *             examples:
 *               missing_token:
 *                 summary: Missing authentication token
 *                 value:
 *                   success: false
 *                   error: "Authentication required"
 *                   message: "Please login to access this resource"
 *               invalid_token:
 *                 summary: Invalid or expired token
 *                 value:
 *                   success: false
 *                   error: "Authentication failed"
 *                   message: "Your session has expired, please login again"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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