/**
 * Authentication and authorization utilities
 */
import bcrypt from 'bcryptjs';

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}

export class AuthUtils {
   /**
   * Verify password against hash using constant-time comparison
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      // Always return false on error to prevent timing attacks
      return false;
    }
  }
}