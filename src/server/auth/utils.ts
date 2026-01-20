/**
 * Authentication and authorization utilities
 * Using session-based authentication with httpOnly cookies
 */
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const BCRYPT_ROUNDS = 12;
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-session-secret';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Log SESSION_SECRET status at startup
console.log('AuthUtils: SESSION_SECRET loaded:', !!SESSION_SECRET);
if (!SESSION_SECRET || SESSION_SECRET === 'fallback-session-secret') {
  console.error('AuthUtils: WARNING - SESSION_SECRET is not set in environment variables!');
}

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: number;
  expiresAt: number;
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
   * Generate session ID with secure random bytes
   */
  static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create session data with expiration
   */
  static createSession(payload: Omit<SessionData, 'createdAt' | 'expiresAt'>): SessionData {
    const now = Date.now();
    return {
      ...payload,
      createdAt: now,
      expiresAt: now + SESSION_MAX_AGE,
    };
  }

  /**
   * Verify session data is valid and not expired
   */
  static isSessionValid(session: SessionData | null): boolean {
    if (!session) {
      console.log('isSessionValid: No session data');
      return false;
    }
    
    const now = Date.now();
    const isExpired = now > session.expiresAt;
    
    console.log('isSessionValid: Session check:', {
      userId: session.userId,
      email: session.email,
      role: session.role,
      expired: isExpired,
      expiresAt: new Date(session.expiresAt).toISOString()
    });
    
    return !isExpired;
  }

  /**
   * Generate cryptographically secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Extract session ID from cookies
   */
  static extractSessionIdFromRequest(request: Request): string | null {
    console.log('extractSessionIdFromRequest: Starting session extraction');
    console.log('extractSessionIdFromRequest: Request URL:', request.url);
    
    // Try httpOnly cookie
    const cookies = request.headers.get('cookie');
    console.log('extractSessionIdFromRequest: Raw cookie header:', cookies);
    
    if (cookies) {
      // Parse all cookies for debugging
      const cookieEntries = cookies.split(';').map(c => c.trim());
      console.log('extractSessionIdFromRequest: All cookies:', cookieEntries);
      
      // Look for our session cookie
      const sessionCookie = cookieEntries.find(cookie => cookie.startsWith('session-id='));
      console.log('extractSessionIdFromRequest: Session cookie:', sessionCookie);
      
      if (sessionCookie) {
        const sessionId = sessionCookie.split('=')[1];
        console.log('extractSessionIdFromRequest: Extracted session ID:', sessionId ? 'present' : 'missing');
        console.log('extractSessionIdFromRequest: Session ID length:', sessionId ? sessionId.length : 0);
        return sessionId;
      }
      
      // Also try the regex method as fallback
      const sessionMatch = cookies.match(/session-id=([^;]+)/);
      console.log('extractSessionIdFromRequest: Regex match result:', sessionMatch);
      if (sessionMatch) {
        console.log('extractSessionIdFromRequest: Found session ID via regex:', sessionMatch[1] ? 'present' : 'missing');
        return sessionMatch[1];
      }
    }
    
    console.log('extractSessionIdFromRequest: No session ID found');
    return null;
  }
}