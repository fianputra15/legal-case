import { CaseAccessRequest } from 'prisma/generated/client';
import { CaseRepository } from '../db/repositories/case.repository';
import { UserRepository } from '../db/repositories/user.repository';
import { CreateCaseDto, UpdateCaseDto, CaseEntity, CaseFilters, PaginationOptions, PaginatedResult } from '../types/database';

export class CaseService {
  private userRepository: UserRepository;
  
  constructor(private caseRepository: CaseRepository) {
    this.userRepository = new UserRepository();
  }

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

    // Get current case to check business rules
    const currentCase = await this.caseRepository.findById(id);
    if (!currentCase) {
      throw new Error('Case not found');
    }

    // Business Rule: If case is CLOSED, only allow status changes
    if (currentCase.status === 'CLOSED' && data.status !== 'OPEN') {
      const nonStatusUpdates = Object.entries(data)
        .filter(([key, value]) => key !== 'status' && value !== undefined)
        .length;
      
      if (nonStatusUpdates > 0) {
        throw new Error('Closed cases can only have their status changed to reopen them. No other fields can be modified.');
      }
    }

    return this.caseRepository.update(id, data);
  }

  // /**
  //  * Delete a case
  //  */
  // async deleteCase(id: string): Promise<boolean> {
  //   // TODO: Add authorization check
  //   // TODO: Implement soft delete or cascade rules
  //   return this.caseRepository.delete(id);
  // }

  /**
   * Get all case IDs (for admin/lawyer access)
   */
  async getAllCaseIds(): Promise<string[]> {
    return this.caseRepository.findAllIds();
  }
  /**
   * Request lawyer access to a case
   */
  async requestLawyerAccess(caseId: string, lawyerId: string): Promise<{ success: boolean; message: string }> {
    // Validate lawyer exists and has LAWYER role
    const lawyer = await this.userRepository.findById(lawyerId);
    if (!lawyer) {
      return { success: false, message: 'Lawyer not found' };
    }

    if (lawyer.role !== 'LAWYER') {
      return { success: false, message: 'User must have LAWYER role to request case access' };
    }

    if (!lawyer.isActive) {
      return { success: false, message: 'Lawyer account is not active' };
    }

    // Check if lawyer already has access
    const hasAccess = await this.caseRepository.hasAccess(caseId, lawyerId);
    if (hasAccess) {
      return { success: false, message: 'Lawyer already has access to this case' };
    }

    // Check if request already exists
    const existingRequest = await this.caseRepository.hasAccessRequest(caseId, lawyerId);
    if (existingRequest) {
      return { success: false, message: 'Access request already exists for this case' };
    }

    // Validate case exists
    const caseExists = await this.caseRepository.findById(caseId);
    if (!caseExists) {
      return { success: false, message: 'Case not found' };
    }

    // Create access request
    const requested = await this.caseRepository.createAccessRequest(caseId, lawyerId);
    if (!requested) {
      return { success: false, message: 'Failed to create access request' };
    }

    return { success: true, message: 'Access request submitted successfully' };
  }

  /**
   * Withdraw lawyer access request for a case
   */
  async withdrawLawyerAccess(caseId: string, lawyerId: string): Promise<{ success: boolean; message: string }> {
    // Validate lawyer exists and has LAWYER role
    const lawyer = await this.userRepository.findById(lawyerId);
    if (!lawyer) {
      return { success: false, message: 'Lawyer not found' };
    }

    if (lawyer.role !== 'LAWYER') {
      return { success: false, message: 'User must have LAWYER role to withdraw case access request' };
    }

    // Validate case exists
    const caseExists = await this.caseRepository.findById(caseId);
    if (!caseExists) {
      return { success: false, message: 'Case not found' };
    }

    // Check if request exists
    const existingRequest = await this.caseRepository.hasAccessRequest(caseId, lawyerId);
    if (!existingRequest) {
      return { success: false, message: 'No pending access request found for this case' };
    }

    // Remove access request
    const withdrawn = await this.caseRepository.removeAccessRequestByLawyer(caseId, lawyerId);
    if (!withdrawn) {
      return { success: false, message: 'Failed to withdraw access request' };
    }

    return { success: true, message: 'Access request withdrawn successfully' };
  }

  /**
   * Get pending access requests for a case (for case owner/admin)
   */
  async getCaseAccessRequests(caseId: string): Promise<CaseAccessRequest[]> {
    return this.caseRepository.getAccessRequests(caseId);
  }

  /**
   * Approve or reject lawyer access request
   */
  async handleAccessRequest(
    caseId: string, 
    lawyerId: string, 
    action: 'approve' | 'reject',
    reviewerId: string
  ): Promise<{ success: boolean; message: string }> {
    // Validate request exists
    const requestExists = await this.caseRepository.hasAccessRequest(caseId, lawyerId);
    if (!requestExists) {
      return { success: false, message: 'Access request not found' };
    }

    if (action === 'approve') {
      // Grant access
      const granted = await this.caseRepository.grantAccess(caseId, lawyerId);
      if (!granted) {
        return { success: false, message: 'Failed to grant access' };
      }
    }

    // Remove the request (whether approved or rejected)
    const requestRemoved = await this.caseRepository.removeAccessRequest(caseId, lawyerId, action, reviewerId);
    if (!requestRemoved) {
      return { success: false, message: 'Failed to process access request' };
    }

    return { 
      success: true, 
      message: action === 'approve' 
        ? 'Access request approved and access granted' 
        : 'Access request rejected'
    };
  }

  /**
   * Get lawyer's pending access requests
   */
  async getLawyerAccessRequests(lawyerId: string): Promise<CaseAccessRequest[]> {
    return this.caseRepository.getLawyerAccessRequests(lawyerId);
  }

  /**
   * Grant lawyer access to a case
   */
async grantLawyerAccess(caseId: string, lawyerId: string, reviewerId: string): Promise<{ success: boolean; message: string }> {
    // Validate lawyer exists and has LAWYER role
    const lawyer = await this.userRepository.findById(lawyerId);
    if (!lawyer) {
      return { success: false, message: 'Lawyer not found' };
    }

    if (lawyer.role !== 'LAWYER') {
      return { success: false, message: 'User must have LAWYER role to be granted case access' };
    }

    if (!lawyer.isActive) {
      return { success: false, message: 'Lawyer account is not active' };
    }

    // Check if access already exists
    const hasAccess = await this.caseRepository.hasAccess(caseId, lawyerId);
    if (hasAccess) {
      return { success: false, message: 'Lawyer already has access to this case' };
    }

    const approved = await this.caseRepository.approveAccessRequest(caseId, lawyerId, 'approve', reviewerId);
    if (!approved) {
      return { success: false, message: 'Failed to approve access request' };
    }

    // Grant access
    const granted = await this.caseRepository.grantAccess(caseId, lawyerId);
    if (!granted) {
      return { success: false, message: 'Failed to grant access' };
    }

    return { success: true, message: 'Access granted successfully' };
  }

  /**
   * Revoke lawyer access from a case
   */
  async revokeLawyerAccess(caseId: string, lawyerId: string): Promise<{ success: boolean; message: string }> {
    // Validate lawyer exists
    const lawyer = await this.userRepository.findById(lawyerId);
    if (!lawyer) {
      return { success: false, message: 'Lawyer not found' };
    }

    // Check if access exists
    const hasAccess = await this.caseRepository.hasAccess(caseId, lawyerId);
    if (!hasAccess) {
      return { success: false, message: 'Lawyer does not have access to this case' };
    }

    // Revoke access
    const revoked = await this.caseRepository.revokeAccess(caseId, lawyerId);
    if (!revoked) {
      return { success: false, message: 'Failed to revoke access' };
    }

    return { success: true, message: 'Access revoked successfully' };
  }}