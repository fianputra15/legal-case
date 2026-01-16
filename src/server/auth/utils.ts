/**
 * Authentication and authorization utilities
 * Using JWT with httpOnly cookies for security
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';
const JWT_EXPIRES_IN = '7d';
const BCRYPT_ROUNDS = 12;

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export class AuthUtils {
  /**
   * Hash password using bcrypt with secure salt rounds
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, BCRYPT_ROUNDS);
    } catch (error) {
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify password against hash using constant-time comparison
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      // Always return false on error to prevent timing attacks
      return false;
    }
  }

  /**
   * Generate JWT token with expiration and secure payload
   */
  static async generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'legal-case-system',
        audience: 'legal-case-users',
      });
    } catch (error) {
      throw new Error('Token generation failed');
    }
  }

  /**
   * Verify JWT token and return payload if valid
   */
  static async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'legal-case-system',
        audience: 'legal-case-users',
      }) as TokenPayload;
      
      return decoded;
    } catch (error) {
      // Token is invalid, expired, or malformed
      return null;
    }
  }

  /**
   * Generate cryptographically secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Extract token from Authorization header or cookies
   */
  static extractTokenFromRequest(request: Request): string | null {
    // Try Authorization header first
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Try httpOnly cookie as fallback
    const cookies = request.headers.get('cookie');
    if (cookies) {
      const tokenMatch = cookies.match(/auth-token=([^;]+)/);
      if (tokenMatch) {
        return tokenMatch[1];
      }
    }
    
    return null;
  }
}