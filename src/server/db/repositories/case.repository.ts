import { CaseCategory, CaseStatus } from 'prisma/generated/client';
import { CaseEntity, CreateCaseDto, UpdateCaseDto, CaseFilters, PaginationOptions, PaginatedResult } from '../../types/database';
import { prisma } from '../client';

export class CaseRepository {
  /**
   * Find case by ID
   */
  async findById(id: string): Promise<CaseEntity | null> {
    try {
      const caseEntity = await prisma.case.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
      });
      
      return caseEntity as CaseEntity;
    } catch (error) {
      console.error('Error finding case by ID:', error);
      return null;
    }
  }

    /**
   * Find all case IDs
   */
 async findAllIds(): Promise<string[]> {
  try {
    const cases = await prisma.case.findMany({
      select: { id: true }
    });
    return cases.map(c => c.id);
  } catch (error) {
    console.error('Error getting all case IDs:', error);
    return [];
  }
}

  /**
   * Find cases by user ID (owner)
   */
  async findByUserId(userId: string): Promise<CaseEntity[]> {
    try {
      const cases = await prisma.case.findMany({
        where: { ownerId: userId },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
      
      return cases as CaseEntity[];
    } catch (error) {
      console.error('Error finding cases by user ID:', error);
      return [];
    }
  }

  /**
   * Find cases with filtering and pagination
   */
  async findWithFilters(
    accessibleCaseIds: string[],
    filters: CaseFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<CaseEntity>> {
    try {
      const whereClause: any = {};

      // Apply case ID restriction
      if (accessibleCaseIds.length > 0) {
        whereClause.id = { in: accessibleCaseIds };
      } else {
        // No accessible cases, return empty result
        return {
          data: [],
          pagination: {
            total: 0,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: 0,
          },
        };
      }

      // Apply search filter
      if (filters.search) {
        whereClause.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Apply status filter
      if (filters.status) {
        whereClause.status = filters.status;
      }

      // Apply category filter
      if (filters.category) {
        whereClause.category = filters.category;
      }

      // Get total count
      const total = await prisma.case.count({ where: whereClause });

      // Calculate pagination
      const totalPages = Math.ceil(total / pagination.limit);
      const skip = (pagination.page - 1) * pagination.limit;

      // Fetch cases with owner information
      const cases = await prisma.case.findMany({
        where: whereClause,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
      });

      return {
        data: cases as CaseEntity[],
        pagination: {
          total,
          page: pagination.page,
          limit: pagination.limit,
          totalPages,
        },
      };
    } catch (error) {
      console.error('Error in findWithFilters:', error);
      throw error;
    }
  }

  /**
   * Create new case
   */
  async create(data: CreateCaseDto & { ownerId: string }): Promise<CaseEntity> {
    const case_ = await prisma.case.create({
      data: {
        title: data.title,
        category: data.category as CaseCategory,
        status: data.status as CaseStatus,
        description: data.description,
        ownerId: data.ownerId,
      },
    });
    return this.mapToEntity(case_);
  }

  /**
   * Update case
   */
  async update(id: string, data: UpdateCaseDto): Promise<CaseEntity | null> {
    try {
      const updateData: {
        title?: string;
        status?: CaseStatus;
        description?: string;
      } = {};
      
      if (data.title !== undefined) updateData.title = data.title;
      if (data.status !== undefined) updateData.status = data.status as CaseStatus;
      if (data.description !== undefined) updateData.description = data.description;
      
      // Only proceed if there are fields to update
      if (Object.keys(updateData).length === 0) {
        // Return current case if no updates provided
        return this.findById(id);
      }

      const case_ = await prisma.case.update({
        where: { id },
        data: updateData,
      });

      return this.mapToEntity(case_);
    } catch (error) {
      // Handle case not found or other errors
      console.log(error);
      return null;
    }
  }

  // /**
  //  * Delete case
  //  */
  async delete(id: string): Promise<boolean> {
    // TODO: Implement database deletion
    return false;
  }

  // /**
  //  * Find cases by status
  //  */
  // async findByStatus(status: string): Promise<CaseEntity[]> {
  //   // TODO: Implement database query
  //   return [];
  // }

  // /**
  //  * Find cases assigned to lawyer
  //  */
  // async findByLawyerId(lawyerId: string): Promise<CaseEntity[]> {
  //   // TODO: Implement database query
  //   return [];
  // }

  /**
   * Count cases by user
   */
  async countByUserId(userId: string): Promise<number> {
    return prisma.case.count({
      where: { ownerId: userId },
    });
  }

  /**
   * Grant lawyer access to a case
   */
  async grantAccess(caseId: string, lawyerId: string): Promise<boolean> {
    try {
      await prisma.caseAccess.create({
        data: {
          caseId,
          lawyerId,
        },
      });
      return true;
    } catch (error) {
      // Handle unique constraint violation (duplicate access)
      if ((error as any)?.code === 'P2002') {
        return false; // Access already exists
      }
      throw error;
    }
  }

  /**
   * Revoke lawyer access from a case
   */
  async revokeAccess(caseId: string, lawyerId: string): Promise<boolean> {
    try {
      const result = await prisma.caseAccess.deleteMany({
        where: {
          caseId,
          lawyerId,
        },
      });
      return result.count > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if lawyer has access to a case
   */
  async hasAccess(caseId: string, lawyerId: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking hasAccess for caseId: ${caseId}, lawyerId: ${lawyerId}`);
      const access = await prisma.caseAccess.findFirst({
        where: {
          caseId,
          lawyerId,
        }
      });
      console.log(`🔍 hasAccess result:`, access);
      const result = !!access;
      console.log(`🔍 hasAccess returning: ${result}`);
      return result;
    } catch (error) {
      console.error('Error checking case access:', error);
      return false;
    }
  }

  /**
   * Check if there's a pending access request
   */
  async hasAccessRequest(caseId: string, lawyerId: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking hasAccessRequest for caseId: ${caseId}, lawyerId: ${lawyerId}`);
      const request = await prisma.caseAccessRequest.findFirst({
        where: {
          caseId,
          lawyerId,
          status: 'PENDING',
        }
      });
      console.log(`🔍 hasAccessRequest result:`, request);
      const result = !!request;
      console.log(`🔍 hasAccessRequest returning: ${result}`);
      return result;
    } catch (error) {
      console.error('Error checking access request:', error);
      return false;
    }
  }

  /**
   * Get access request information (including request date)
   */
  async getAccessRequestInfo(caseId: string, lawyerId: string): Promise<{ requestedAt: Date } | null> {
    try {
      console.log(`🔍 Getting access request info for caseId: ${caseId}, lawyerId: ${lawyerId}`);
      const request = await prisma.caseAccessRequest.findFirst({
        where: {
          caseId,
          lawyerId,
          status: 'PENDING',
        },
        select: {
          requestedAt: true,
        }
      });
      console.log(`🔍 getAccessRequestInfo result:`, request);
      return request;
    } catch (error) {
      console.error('Error getting access request info:', error);
      return null;
    }
  }

  /**
   * Create access request
   */
  async createAccessRequest(caseId: string, lawyerId: string): Promise<boolean> {
    try {
      await prisma.caseAccessRequest.create({
        data: {
          caseId,
          lawyerId,
          status: 'PENDING',
        }
      });
      return true;
    } catch (error) {
      console.error('Error creating access request:', error);
      return false;
    }
  }

  /**
   * Get access requests for a case
   */
  async getAccessRequests(caseId: string): Promise<any[]> {
    try {
      const requests = await prisma.caseAccessRequest.findMany({
        where: {
          caseId,
          status: 'PENDING',
        },
        include: {
          lawyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        orderBy: {
          requestedAt: 'desc',
        }
      });
      return requests;
    } catch (error) {
      console.error('Error getting access requests:', error);
      return [];
    }
  }

  /**
   * Get lawyer's access requests
   */
  async getLawyerAccessRequests(lawyerId: string): Promise<any[]> {
    try {
      const requests = await prisma.caseAccessRequest.findMany({
        where: {
          lawyerId,
          status: 'PENDING',
        },
        include: {
          case: {
            select: {
              id: true,
              title: true,
              category: true,
              status: true,
              owner: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            }
          }
        },
        orderBy: {
          requestedAt: 'desc',
        }
      });
      return requests;
    } catch (error) {
      console.error('Error getting lawyer access requests:', error);
      return [];
    }
  }

  /**
   * Remove access request (after approval/rejection)
   */
  async removeAccessRequest(
    caseId: string, 
    lawyerId: string, 
    action: 'approve' | 'reject',
    reviewerId: string
  ): Promise<boolean> {
    try {
      await prisma.caseAccessRequest.updateMany({
        where: {
          caseId,
          lawyerId,
          status: 'PENDING',
        },
        data: {
          status: action === 'approve' ? 'APPROVED' : 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: reviewerId,
        }
      });

      // Optionally, delete the record completely after a delay
      // Or keep it for audit purposes (recommended)
      
      return true;
    } catch (error) {
      console.error('Error removing access request:', error);
      return false;
    }
  }

  /**
   * Remove access request by lawyer (withdraw request)
   */
  async removeAccessRequestByLawyer(caseId: string, lawyerId: string): Promise<boolean> {
    try {
      const result = await prisma.caseAccessRequest.deleteMany({
        where: {
          caseId,
          lawyerId,
          status: 'PENDING',
        }
      });

      return result.count > 0;
    } catch (error) {
      console.error('Error removing access request by lawyer:', error);
      return false;
    }
  }

  /**
   * Map Prisma Case model to CaseEntity
   */
  private mapToEntity(case_: any): CaseEntity {
    return {
      id: case_.id,
      title: case_.title,
      description: case_.description || undefined,
      category: case_.category,
      status: case_.status,
      priority: case_.priority,
      ownerId: case_.ownerId,
      createdAt: case_.createdAt,
      updatedAt: case_.updatedAt,
    };
  }
}