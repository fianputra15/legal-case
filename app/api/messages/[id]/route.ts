import { NextRequest } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, updateMessageSchema } from '@/server/utils/validation';
import { MessageService } from '@/server/services/message.service';
import { MessageRepository } from '@/server/db/repositories/message.repository';
import { AuthMiddleware } from '@/server/auth/middleware';
import { Logger } from '@/server/utils/logger';

const messageService = new MessageService(new MessageRepository());

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Apply authentication middleware
    const authResult = await AuthMiddleware.authenticate(request as unknown);
    if (authResult) return authResult;

    const message = await messageService.getMessageById(params.id);

    if (!message) {
      return ResponseHandler.notFound('Message not found');
    }

    return ResponseHandler.success(message);

  } catch (error) {
    Logger.error('Get message error:', error);
    return ResponseHandler.internalError('Failed to retrieve message');
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Apply authentication middleware
    const authResult = await AuthMiddleware.authenticate(request as unknown);
    if (authResult) return authResult;

    const body = await request.json();
    const updateData = validateRequest(updateMessageSchema, body);
    const userId = 'user_id_placeholder'; // TODO: Get from auth middleware

    const updatedMessage = await messageService.updateMessage(params.id, updateData, userId);

    if (!updatedMessage) {
      return ResponseHandler.notFound('Message not found');
    }

    Logger.info(`Message updated: ${params.id}`);

    return ResponseHandler.success(updatedMessage, 'Message updated successfully');

  } catch (error) {
    Logger.error('Update message error:', error);
    return ResponseHandler.internalError('Failed to update message');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Apply authentication middleware
    const authResult = await AuthMiddleware.authenticate(request as unknown);
    if (authResult) return authResult;

    const userId = 'user_id_placeholder'; // TODO: Get from auth middleware
    const deleted = await messageService.deleteMessage(params.id, userId);

    if (!deleted) {
      return ResponseHandler.notFound('Message not found');
    }

    Logger.info(`Message deleted: ${params.id}`);

    return ResponseHandler.success(null, 'Message deleted successfully');

  } catch (error) {
    Logger.error('Delete message error:', error);
    return ResponseHandler.internalError('Failed to delete message');
  }
}