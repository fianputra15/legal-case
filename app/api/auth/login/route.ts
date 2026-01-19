import { NextRequest } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, loginSchema } from '@/server/utils/validation';
import { UserService } from '@/server/services/user.service';
import { UserRepository } from '@/server/db/repositories/user.repository';
import { AuthUtils } from '@/server/auth/utils';
import { AuthMiddleware } from '@/server/auth/middleware';
import { Logger } from '@/server/utils/logger';

const userService = new UserService(new UserRepository());

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: Authenticate user credentials and set secure httpOnly cookie with JWT token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             client:
 *               summary: Client login
 *               value:
 *                 email: "client@example.com"
 *                 password: "client123"
 *             lawyer:
 *               summary: Lawyer login
 *               value:
 *                 email: "lawyer@legal.com"
 *                 password: "lawyer123"
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: HttpOnly authentication cookie
 *             schema:
 *               type: string
 *               example: "auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: "clx123abc456"
 *                   email: "client@example.com"
 *                   firstName: "Jane"
 *                   lastName: "Doe"
 *                   role: "CLIENT"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid credentials"
 *               message: "Please check your email and password"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Validation failed"
 *               message: "Email is required"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = validateRequest(loginSchema, body);

    // Authenticate user with constant-time password verification
    const user = await userService.authenticateUser(email, password);
    if (!user) {
      return ResponseHandler.unauthorized('Invalid credentials');
    }

    // Generate secure JWT token
    const accessToken = await AuthUtils.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    console.log('Login: Generated token for user:', user.email);
    console.log('Login: Token length:', accessToken.length);

    Logger.info(`User logged in: ${email}`);

    // Create response with secure httpOnly cookie
    const response = ResponseHandler.success({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

    // Set secure httpOnly cookie
    const cookieHeader = AuthMiddleware.createAuthCookie(accessToken);
    console.log('Login: Setting cookie header:', cookieHeader);
    response.headers.set('Set-Cookie', cookieHeader);
    
    console.log('Login: Response headers:', Object.fromEntries(response.headers.entries()));
    
    return response;

  } catch (error) {
    Logger.error('Login error:', error);
    // Never leak internal errors to client
    return ResponseHandler.internalError('Authentication failed');
  }
}