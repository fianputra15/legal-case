/**
 * Authentication and authorization utilities
 * Using JWT with httpOnly cookies for security
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
const BCRYPT_ROUNDS = 12;

// Log JWT_SECRET status at startup
console.log('AuthUtils: JWT_SECRET loaded:', !!JWT_SECRET);
if (!JWT_SECRET) {
  console.error('AuthUtils: WARNING - JWT_SECRET is not set in environment variables!');
}

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
    } catch {
      throw new Error('Password hashing failed');
    }
  }

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
    } catch {
      throw new Error('Token generation failed');
    }
  }

  /**
   * Verify JWT token and return payload if valid
   */
  static async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      console.log('verifyToken: Starting token verification');
      console.log('verifyToken: Token length:', token.length);
      console.log('verifyToken: JWT_SECRET available:', !!JWT_SECRET);
      
      if (!JWT_SECRET) {
        console.error('verifyToken: JWT_SECRET is not set!');
        return null;
      }
      
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'legal-case-system',
        audience: 'legal-case-users',
      }) as TokenPayload;
      
      console.log('verifyToken: Token verified successfully');
      console.log('verifyToken: Decoded payload:', { 
        userId: decoded.userId, 
        email: decoded.email, 
        role: decoded.role,
        exp: decoded.exp 
      });
      
      return decoded;
    } catch (error) {
      console.error('verifyToken: Token verification failed:', error);
      console.error('verifyToken: Error name:', error.name);
      console.error('verifyToken: Error message:', error.message);
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
    console.log('extractTokenFromRequest: Starting token extraction');
    console.log('extractTokenFromRequest: Request URL:', request.url);
    
    // Try Authorization header first
    const authHeader = request.headers.get('authorization');
    console.log('extractTokenFromRequest: Authorization header:', authHeader);
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('extractTokenFromRequest: Found Bearer token:', token ? 'present' : 'missing');
      return token;
    }
    
    // Try httpOnly cookie as fallback
    const cookies = request.headers.get('cookie');
    console.log('extractTokenFromRequest: Raw cookie header:', cookies);
    
    if (cookies) {
      // Parse all cookies for debugging
      const cookieEntries = cookies.split(';').map(c => c.trim());
      console.log('extractTokenFromRequest: All cookies:', cookieEntries);
      
      // Look for our auth token specifically
      const authTokenCookie = cookieEntries.find(cookie => cookie.startsWith('auth-token='));
      console.log('extractTokenFromRequest: Auth token cookie:', authTokenCookie);
      
      if (authTokenCookie) {
        const token = authTokenCookie.split('=')[1];
        console.log('extractTokenFromRequest: Extracted token from cookie:', token ? 'present' : 'missing');
        console.log('extractTokenFromRequest: Token length:', token ? token.length : 0);
        return token;
      }
      
      // Also try the regex method as fallback
      const tokenMatch = cookies.match(/auth-token=([^;]+)/);
      console.log('extractTokenFromRequest: Regex match result:', tokenMatch);
      if (tokenMatch) {
        console.log('extractTokenFromRequest: Found token via regex:', tokenMatch[1] ? 'present' : 'missing');
        return tokenMatch[1];
      }
    }
    
    console.log('extractTokenFromRequest: No token found');
    return null;
  }
}