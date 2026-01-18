import { UserEntity, CreateUserDto, UpdateUserDto } from '../../types/database';
import { prisma } from '../client';
import { User, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserEntity | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user ? this.mapToEntity(user) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user ? this.mapToEntity(user) : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Create new user
   */
  async create(data: CreateUserDto & { password: string }): Promise<UserEntity> {
    try {
      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(data.password, saltRounds);

      // Validate role if provided
      const userRole = data.role ? this.validateUserRole(data.role) : UserRole.CLIENT;

      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          role: userRole,
        },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return this.mapToEntity(user);
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new Error('Email already exists');
      }
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserDto): Promise<UserEntity | null> {
    try {
      const updateData: any = {};

      if (data.email) {
        updateData.email = data.email.toLowerCase();
      }
      if (data.firstName) {
        updateData.firstName = data.firstName.trim();
      }
      if (data.lastName) {
        updateData.lastName = data.lastName.trim();
      }
      if (data.password) {
        const saltRounds = 12;
        updateData.passwordHash = await bcrypt.hash(data.password, saltRounds);
      }
      if (typeof data.isActive !== 'undefined') {
        updateData.isActive = data.isActive;
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          passwordHash: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return this.mapToEntity(user);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return null; // User not found
      }
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new Error('Email already exists');
      }
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete user (soft delete by setting isActive to false)
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false; // User not found
      }
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Hard delete user (permanently remove from database)
   */
  async hardDelete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false; // User not found
      }
      console.error('Error hard deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Find all users with pagination and filtering
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    filters: {
      role?: string;
      isActive?: boolean;
      search?: string;
    } = {}
  ): Promise<UserEntity[]> {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      // Apply filters
      if (filters.role) {
        where.role = this.validateUserRole(filters.role);
      }
      
      if (typeof filters.isActive !== 'undefined') {
        where.isActive = filters.isActive;
      }

      // Search in firstName, lastName, or email
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        where.OR = [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      const users = await prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { createdAt: 'desc' },
          { lastName: 'asc' },
          { firstName: 'asc' },
        ],
        select: {
          id: true,
          email: true,
          passwordHash: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return users.map(user => this.mapToEntity(user));
    } catch (error) {
      console.error('Error finding users:', error);
      throw new Error('Failed to find users');
    }
  }

  /**
   * Count total users with optional filters
   */
  async count(filters: {
    role?: string;
    isActive?: boolean;
    search?: string;
  } = {}): Promise<number> {
    try {
      const where: any = {};

      // Apply filters
      if (filters.role) {
        where.role = this.validateUserRole(filters.role);
      }
      
      if (typeof filters.isActive !== 'undefined') {
        where.isActive = filters.isActive;
      }

      // Search in firstName, lastName, or email
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        where.OR = [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      return await prisma.user.count({ where });
    } catch (error) {
      console.error('Error counting users:', error);
      throw new Error('Failed to count users');
    }
  }

  /**
   * Find users by role
   */
  async findByRole(role: string, limit: number = 50): Promise<UserEntity[]> {
    try {
      const userRole = this.validateUserRole(role);
      
      const users = await prisma.user.findMany({
        where: {
          role: userRole,
          isActive: true,
        },
        take: limit,
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' },
        ],
        select: {
          id: true,
          email: true,
          passwordHash: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return users.map(user => this.mapToEntity(user));
    } catch (error) {
      console.error('Error finding users by role:', error);
      throw new Error('Failed to find users by role');
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const where: any = { email: email.toLowerCase() };
      
      if (excludeUserId) {
        where.id = { not: excludeUserId };
      }

      const user = await prisma.user.findFirst({ where });
      return !!user;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('Failed to check email');
    }
  }

  /**
   * Verify user password
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      });

      if (!user) {
        return false;
      }

      return await bcrypt.compare(password, user.passwordHash);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Update user last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { updatedAt: new Date() },
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error for non-critical operation
    }
  }

  /**
   * Map Prisma User to UserEntity
   */
  private mapToEntity(user: any): UserEntity {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Validate and convert string role to UserRole enum
   */
  private validateUserRole(role: string): UserRole {
    const upperRole = role.toUpperCase();
    if (!Object.values(UserRole).includes(upperRole as UserRole)) {
      throw new Error(`Invalid user role: ${role}`);
    }
    return upperRole as UserRole;
  }
}