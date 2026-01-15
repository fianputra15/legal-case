import { NextRequest } from 'next/server';
import { ResponseHandler } from '@/server/utils/response';
import { validateRequest, createCaseSchema } from '@/server/utils/validation';
import { CaseService } from '@/server/services/case.service';
import { CaseRepository } from '@/server/db/repositories/case.repository';
import { AuthMiddleware } from '@/server/auth/middleware';
import { Logger } from '@/server/utils/logger';

const caseService = new CaseService(new CaseRepository());

export async function GET(request: NextRequest) {
  try {
    // TODO: Apply authentication middleware
    const authResult = await AuthMiddleware.authenticate(request as unknown);
    if (authResult) return authResult;

    // Extract user ID from authenticated request
    const userId = 'user_id_placeholder'; // TODO: Get from auth middleware

    const cases = await caseService.getCasesByUser(userId);

    return ResponseHandler.success(cases);

  } catch (error) {
    Logger.error('Get cases error:', error);
    return ResponseHandler.internalError('Failed to retrieve cases');
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Apply authentication middleware
    const authResult = await AuthMiddleware.authenticate(request as unknown);
    if (authResult) return authResult;

    const body = await request.json();
    const caseData = validateRequest(createCaseSchema, body);
    
    // Extract user ID from authenticated request
    const userId = 'user_id_placeholder'; // TODO: Get from auth middleware

    const newCase = await caseService.createCase(caseData, userId);

    Logger.info(`Case created: ${newCase.id}`);

    return ResponseHandler.created(newCase, 'Case created successfully');

  } catch (error) {
    Logger.error('Create case error:', error);
    return ResponseHandler.internalError('Failed to create case');
  }
}