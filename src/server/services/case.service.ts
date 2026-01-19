import { CaseRepository } from '../db/repositories/case.repository';
import { CreateCaseDto, UpdateCaseDto, CaseEntity, CaseFilters, PaginationOptions, PaginatedResult } from '../types/database';

export class CaseService {
  constructor(private caseRepository: CaseRepository) {}

  /**
   * Get all cases for a user
   */
  async getCasesByUser(userId: string): Promise<CaseEntity[]> {
    return this.caseRepository.findByUserId(userId);
  }

  /**
   * Get cases with filtering and pagination
   */
  async getCasesWithFilters(
    accessibleCaseIds: string[],
    filters: CaseFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<CaseEntity>> {
    return this.caseRepository.findWithFilters(accessibleCaseIds, filters, pagination);
  }

  /**
   * Get a specific case by ID
   * Note: Authorization must be checked at the route level before calling this method
   */
  async getCaseById(id: string): Promise<CaseEntity | null> {
    return this.caseRepository.findById(id);
  }

  /**
   * Create a new case
   */
  async createCase(data: CreateCaseDto, ownerId: string): Promise<CaseEntity> {
    // Validate input data structure
    if (!data.title?.trim()) {
      throw new Error('Case title is required');
    }
    if (!data.category) {
      throw new Error('Case category is required');
    }

    // Set default status if not provided
    const caseData = {
      ...data,
      status: data.status || 'OPEN',
      ownerId,
    };

    return this.caseRepository.create(caseData);
  }

  /**
   * Update an existing case
   * Note: Authorization must be checked at the route level before calling this method
   */
  async updateCase(id: string, data: UpdateCaseDto): Promise<CaseEntity | null> {
    // Validate at least one field is being updated
    const hasUpdates = Object.values(data).some(value => value !== undefined);
    if (!hasUpdates) {
      throw new Error('At least one field must be provided for update');
    }

    // Validate title if provided
    if (data.title !== undefined && (!data.title || data.title.trim().length === 0)) {
      throw new Error('Title cannot be empty');
    }

    return this.caseRepository.update(id, data);
  }

  /**
   * Delete a case
   */
  async deleteCase(id: string, userId: string): Promise<boolean> {
    // TODO: Add authorization check
    // TODO: Implement soft delete or cascade rules
    return this.caseRepository.delete(id);
  }

  /**
   * Get case statistics
   */
  async getCaseStats(userId: string): Promise<any> {
    // TODO: Implement case statistics
    return {};
  }
}