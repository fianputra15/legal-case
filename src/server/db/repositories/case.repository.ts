import { CaseEntity, CreateCaseDto, UpdateCaseDto, CaseFilters, PaginationOptions, PaginatedResult } from '../../types/database';
import { prisma } from '../client';
import { Case, CaseStatus, CaseCategory } from '@prisma/client';

export class CaseRepository {
  /**
   * Find case by ID
   */
  async findById(id: string): Promise<CaseEntity | null> {
    const case_ = await prisma.case.findUnique({
      where: { id },
    });
    return case_ ? this.mapToEntity(case_) : null;
  }

  /**
   * Find cases by user ID (owner)
   */
  async findByUserId(userId: string): Promise<CaseEntity[]> {
    const cases = await prisma.case.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
    return cases.map(this.mapToEntity);
  }

  /**
   * Find cases with filtering and pagination
   */
  async findWithFilters(
    accessibleCaseIds: string[],
    filters: CaseFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<CaseEntity>> {
    if (accessibleCaseIds.length === 0) {
      return {
        data: [],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Build where clause
    const whereClause: {
      id: { in: string[] };
      title?: { contains: string; mode: 'insensitive' };
      status?: CaseStatus;
      category?: CaseCategory;
    } = {
      id: { in: accessibleCaseIds },
    };

    if (filters.search) {
      whereClause.title = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    if (filters.status) {
      whereClause.status = filters.status as CaseStatus;
    }

    if (filters.category) {
      whereClause.category = filters.category as CaseCategory;
    }

    // Get total count for pagination
    const total = await prisma.case.count({ where: whereClause });

    // Calculate pagination
    const totalPages = Math.ceil(total / pagination.limit);
    const skip = (pagination.page - 1) * pagination.limit;

    // Get paginated results
    const cases = await prisma.case.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pagination.limit,
    });

    return {
      data: cases.map(this.mapToEntity),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Create new case
   */
  async create(data: CreateCaseDto & { ownerId: string }): Promise<CaseEntity> {
    const case_ = await prisma.case.create({
      data: {
        title: data.title,
        category: data.category as CaseCategory,
        status: (data.status as CaseStatus) || CaseStatus.OPEN,
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

  /**
   * Delete case
   */
  async delete(id: string): Promise<boolean> {
    // TODO: Implement database deletion
    return false;
  }

  /**
   * Find cases by status
   */
  async findByStatus(status: string): Promise<CaseEntity[]> {
    // TODO: Implement database query
    return [];
  }

  /**
   * Find cases assigned to lawyer
   */
  async findByLawyerId(lawyerId: string): Promise<CaseEntity[]> {
    // TODO: Implement database query
    return [];
  }

  /**
   * Count cases by user
   */
  async countByUserId(userId: string): Promise<number> {
    return prisma.case.count({
      where: { ownerId: userId },
    });
  }

  /**
   * Map Prisma Case model to CaseEntity
   */
  private mapToEntity(case_: Case): CaseEntity {
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