import { CaseEntity, CreateCaseDto, UpdateCaseDto } from '../../types/database';
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
    // TODO: Implement database update
    return null;
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