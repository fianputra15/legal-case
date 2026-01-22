import { AuthUtils } from './../auth/utils';
import { UserRepository } from '../db/repositories/user.repository';
import {  UserEntity } from '../types/database';
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