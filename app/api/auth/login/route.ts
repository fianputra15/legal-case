import { NextRequest, NextResponse } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, loginSchema } from '@/server/utils/validation';
import { UserService } from '@/server/services/user.service';
import { UserRepository } from '@/server/db/repositories/user.repository';
import { AuthUtils } from '@/server/auth/utils';
import { AuthMiddleware } from '@/server/auth/middleware';
import { Logger } from '@/server/utils/logger';

const userService = new UserService(new UserRepository());

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token in httpOnly cookie
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
    response.headers.set('Set-Cookie', AuthMiddleware.createAuthCookie(accessToken));
    
    return response;

  } catch (error) {
    Logger.error('Login error:', error);
    // Never leak internal errors to client
    return ResponseHandler.internalError('Authentication failed');
  }
}