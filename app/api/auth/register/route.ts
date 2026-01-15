import { NextRequest } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, registerSchema } from '@/server/utils/validation';
import { UserService } from '@/server/services/user.service';
import { UserRepository } from '@/server/db/repositories/user.repository';
import { ConflictError } from '@/server/utils/errors';
import { Logger } from '@/server/utils/logger';

const userService = new UserService(new UserRepository());

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userData = validateRequest(registerSchema, body);

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(userData.email);
    if (existingUser) {
      return ResponseHandler.conflict('User with this email already exists');
    }

    // Create new user
    const user = await userService.createUser(userData);

    Logger.info(`User registered: ${userData.email}`);

    return ResponseHandler.created({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }, 'User registered successfully');

  } catch (error) {
    Logger.error('Registration error:', error);
    if (error instanceof ConflictError) {
      return ResponseHandler.conflict(error.message);
    }
    return ResponseHandler.internalError('Registration failed');
  }
}