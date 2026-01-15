import { NextRequest } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, updateUserSchema } from '@/server/utils/validation';
import { UserService } from '@/server/services/user.service';
import { UserRepository } from '@/server/db/repositories/user.repository';
import { AuthMiddleware } from '@/server/auth/middleware';
import { Logger } from '@/server/utils/logger';

const userService = new UserService(new UserRepository());

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Apply authentication middleware
    const authResult = await AuthMiddleware.authenticate(request as unknown);
    if (authResult) return authResult;

    // TODO: Check authorization (user can only view their own profile or admin can view all)
    const user = await userService.getUserById(params.id);

    if (!user) {
      return ResponseHandler.notFound('User not found');
    }

    // Remove password from response
    const { password, ...userResponse } = user;

    return ResponseHandler.success(userResponse);

  } catch (error) {
    Logger.error('Get user error:', error);
    return ResponseHandler.internalError('Failed to retrieve user');
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Apply authentication middleware
    const authResult = await AuthMiddleware.authenticate(request as unknown);
    if (authResult) return authResult;

    // TODO: Check authorization (user can only update their own profile or admin can update all)

    const body = await request.json();
    const updateData = validateRequest(updateUserSchema, body);

    const updatedUser = await userService.updateUser(params.id, updateData);

    if (!updatedUser) {
      return ResponseHandler.notFound('User not found');
    }

    // Remove password from response
    const { password, ...userResponse } = updatedUser;

    Logger.info(`User updated: ${params.id}`);

    return ResponseHandler.success(userResponse, 'User updated successfully');

  } catch (error) {
    Logger.error('Update user error:', error);
    return ResponseHandler.internalError('Failed to update user');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Apply authentication middleware with admin check
    const authResult = await AuthMiddleware.authenticate(request as unknown);
    if (authResult) return authResult;

    const deleted = await userService.deleteUser(params.id);

    if (!deleted) {
      return ResponseHandler.notFound('User not found');
    }

    Logger.info(`User deleted: ${params.id}`);

    return ResponseHandler.success(null, 'User deleted successfully');

  } catch (error) {
    Logger.error('Delete user error:', error);
    return ResponseHandler.internalError('Failed to delete user');
  }
}