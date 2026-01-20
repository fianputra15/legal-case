import { NextRequest } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, createMessageSchema } from '@/server/utils/validation';
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

    const messages = await messageService.getMessagesByCaseId(params.id);

    return ResponseHandler.success(messages);

  } catch (error) {
    Logger.error('Get case messages error:', error);
    return ResponseHandler.internalError('Failed to retrieve messages');
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Apply authentication middleware
    const authResult = await AuthMiddleware.authenticate(request as unknown);
    if (authResult) return authResult;

    const body = await request.json();
    const messageData = validateRequest(createMessageSchema, {
      ...body,
      caseId: params.id,
    });
    
    const userId = 'user_id_placeholder'; // TODO: Get from auth middleware

    const newMessage = await messageService.createMessage(messageData, userId);

    Logger.info(`Message created for case: ${params.id}`);

    return ResponseHandler.created(newMessage, 'Message sent successfully');

  } catch (error) {
    Logger.error('Create message error:', error);
    return ResponseHandler.internalError('Failed to send message');
  }
}