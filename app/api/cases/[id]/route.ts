import { NextRequest } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, updateCaseSchema } from '@/server/utils/validation';
import { CaseService } from '@/server/services/case.service';
import { CaseRepository } from '@/server/db/repositories/case.repository';
import { AuthMiddleware } from '@/server/auth/middleware';
import { Logger } from '@/server/utils/logger';

const caseService = new CaseService(new CaseRepository());

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Apply authentication middleware
    const authResult = await AuthMiddleware.authenticate(request as unknown);
    if (authResult) return authResult;

    const userId = 'user_id_placeholder'; // TODO: Get from auth middleware
    const caseData = await caseService.getCaseById(params.id, userId);

    if (!caseData) {
      return ResponseHandler.notFound('Case not found');
    }

    return ResponseHandler.success(caseData);

  } catch (error) {
    Logger.error('Get case error:', error);
    return ResponseHandler.internalError('Failed to retrieve case');
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Apply authentication middleware
    const authResult = await AuthMiddleware.authenticate(request as unknown);
    if (authResult) return authResult;

    const body = await request.json();
    const updateData = validateRequest(updateCaseSchema, body);
    const userId = 'user_id_placeholder'; // TODO: Get from auth middleware

    const updatedCase = await caseService.updateCase(params.id, updateData, userId);

    if (!updatedCase) {
      return ResponseHandler.notFound('Case not found');
    }

    Logger.info(`Case updated: ${params.id}`);

    return ResponseHandler.success(updatedCase, 'Case updated successfully');

  } catch (error) {
    Logger.error('Update case error:', error);
    return ResponseHandler.internalError('Failed to update case');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Apply authentication middleware
    const authResult = await AuthMiddleware.authenticate(request as unknown);
    if (authResult) return authResult;

    const userId = 'user_id_placeholder'; // TODO: Get from auth middleware
    const deleted = await caseService.deleteCase(params.id, userId);

    if (!deleted) {
      return ResponseHandler.notFound('Case not found');
    }

    Logger.info(`Case deleted: ${params.id}`);

    return ResponseHandler.success(null, 'Case deleted successfully');

  } catch (error) {
    Logger.error('Delete case error:', error);
    return ResponseHandler.internalError('Failed to delete case');
  }
}