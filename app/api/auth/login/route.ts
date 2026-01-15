import { NextRequest } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, loginSchema } from '@/server/utils/validation';
import { UserService } from '@/server/services/user.service';
import { UserRepository } from '@/server/db/repositories/user.repository';
import { AuthUtils } from '@/server/auth/utils';
import { Logger } from '@/server/utils/logger';

const userService = new UserService(new UserRepository());

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = validateRequest(loginSchema, body);

    // Authenticate user
    const user = await userService.authenticateUser(email, password);
    if (!user) {
      return ResponseHandler.unauthorized('Invalid credentials');
    }

    // Generate tokens
    const accessToken = await AuthUtils.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // TODO: Generate refresh token
    const refreshToken = 'refresh_token_placeholder';

    Logger.info(`User logged in: ${email}`);

    return ResponseHandler.success({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });

  } catch (error) {
    Logger.error('Login error:', error);
    return ResponseHandler.internalError('Login failed');
  }
}