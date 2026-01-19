import { NextRequest } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, createUserSchema, updateUserSchema } from '@/server/utils/validation';
import { UserService } from '@/server/services/user.service';
import { UserRepository } from '@/server/db/repositories/user.repository';
import { AuthMiddleware } from '@/server/auth/middleware';
import { Logger } from '@/server/utils/logger';

const userService = new UserService(new UserRepository());

export async function GET(request: NextRequest) {
  try {
    const authResult = await AuthMiddleware.authenticate(request as unknown);
    if (authResult) return authResult;

    // TODO: Check if user has client or lawyer privileges

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // TODO: Implement pagination in service
    const users = [];
    const total = 0;

    return ResponseHandler.success(users, undefined, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });

  } catch (error) {
    Logger.error('Get users error:', error);
    return ResponseHandler.internalError('Failed to retrieve users');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await AuthMiddleware.authenticate(request as unknown);
    if (authResult) return authResult;

    const body = await request.json();
    const userData = validateRequest(createUserSchema, body);

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(userData.email);
    if (existingUser) {
      return ResponseHandler.conflict('User with this email already exists');
    }

    const newUser = await userService.createUser(userData);

    return ResponseHandler.created({
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
    }, 'User created successfully');

  } catch (error) {
    Logger.error('Create user error:', error);
    return ResponseHandler.internalError('Failed to create user');
  }
}