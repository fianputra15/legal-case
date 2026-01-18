import { UserRepository } from '../db/repositories/user.repository';
import { CreateUserDto, UpdateUserDto, UserEntity } from '../types/database';
import { AuthUtils } from '../auth/utils';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserDto): Promise<UserEntity> {
    // Hash password before storing
    const hashedPassword = await AuthUtils.hashPassword(data.password);
    const { password, ...userData } = data;
    
    return this.userRepository.create({
      ...userData,
      passwordHash: hashedPassword,
    } as any);
  }

  /**
   * Update user profile
   */
  async updateUser(id: string, data: UpdateUserDto): Promise<UserEntity | null> {
    // TODO: Implement business logic for user updates
    // Handle password changes, email verification, etc.
    if (data.password) {
      data.password = await AuthUtils.hashPassword(data.password);
    }
    return this.userRepository.update(id, data);
  }

  /**
   * Delete user account
   */
  async deleteUser(id: string): Promise<boolean> {
    // TODO: Implement soft delete and cleanup logic
    return this.userRepository.delete(id);
  }

  /**
   * Authenticate user credentials
   */
  async authenticateUser(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;

    const isValidPassword = await AuthUtils.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) return null;

    return user;
  }
}