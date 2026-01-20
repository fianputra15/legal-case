/**
 * Session storage implementation
 * Using in-memory store for demo - can be replaced with Redis/Database for production
 */

import { SessionData } from './types';

class SessionStore {
  private sessions = new Map<string, SessionData>();

  /**
   * Store session data
   */
  set(sessionId: string, sessionData: SessionData): void {
    console.log('SessionStore.set: Storing session', { sessionId, userId: sessionData.userId });
    this.sessions.set(sessionId, sessionData);
    
    // Auto-cleanup expired sessions
    this.cleanupExpiredSessions();
  }

  /**
   * Retrieve session data
   */
  get(sessionId: string): SessionData | null {
    console.log('SessionStore.get: Retrieving session', { sessionId });
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      console.log('SessionStore.get: Session not found');
      return null;
    }
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      console.log('SessionStore.get: Session expired, removing');
      this.sessions.delete(sessionId);
      return null;
    }
    
    console.log('SessionStore.get: Session found', { userId: session.userId, email: session.email });
    return session;
  }

  /**
   * Remove session
   */
  delete(sessionId: string): boolean {
    console.log('SessionStore.delete: Removing session', { sessionId });
    return this.sessions.delete(sessionId);
  }

  /**
   * Remove all sessions for a user
   */
  deleteUserSessions(userId: string): void {
    console.log('SessionStore.deleteUserSessions: Removing all sessions for user', { userId });
    
    for (const [sessionId, session] of this.sessions) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [sessionId, session] of this.sessions) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log('SessionStore.cleanup: Cleaned up expired sessions', { count: cleanedCount });
    }
  }

  /**
   * Get active session count
   */
  getActiveSessionCount(): number {
    this.cleanupExpiredSessions();
    return this.sessions.size;
  }
}

// Singleton instance
export const sessionStore = new SessionStore();