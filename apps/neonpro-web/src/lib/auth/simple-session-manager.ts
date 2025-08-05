/**
 * Simplified and Production-Ready Session Manager
 * Optimized for Clerk integration and healthcare compliance
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { clerkConfig } from './clerk-config';

export interface SessionMetadata {
  userId: string;
  sessionId: string;
  lastActivity: number;
  deviceInfo?: {
    userAgent: string;
    ip: string;
    location?: string;
  };
  roles?: string[];
  permissions?: string[];
}

export interface SessionOptions {
  maxInactiveTime?: number;
  trackDevices?: boolean;
  enforceConcurrentLimits?: boolean;
}

export class ClerkSessionManager {
  private static instance: ClerkSessionManager;
  private options: Required<SessionOptions>;
  private sessionStore = new Map<string, SessionMetadata>();

  private constructor(options: SessionOptions = {}) {
    this.options = {
      maxInactiveTime: options.maxInactiveTime || clerkConfig.sessionTimeout,
      trackDevices: options.trackDevices ?? true,
      enforceConcurrentLimits: options.enforceConcurrentLimits ?? true
    };
  }

  static getInstance(options?: SessionOptions): ClerkSessionManager {
    if (!ClerkSessionManager.instance) {
      ClerkSessionManager.instance = new ClerkSessionManager(options);
    }
    return ClerkSessionManager.instance;
  }

  /**
   * Get current session information
   */
  async getCurrentSession(): Promise<SessionMetadata | null> {
    try {
      const { userId, sessionId } = auth();
      
      if (!userId || !sessionId) {
        return null;
      }

      const user = await currentUser();
      
      const sessionData: SessionMetadata = {
        userId,
        sessionId,
        lastActivity: Date.now(),
        roles: user?.publicMetadata?.roles as string[] || [],
        permissions: user?.publicMetadata?.permissions as string[] || []
      };

      this.sessionStore.set(sessionId, sessionData);
      return sessionData;
    } catch (error) {
      console.error('Failed to get current session:', error);
      return null;
    }
  }

  /**
   * Update session activity timestamp
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      const session = this.sessionStore.get(sessionId);
      if (session) {
        session.lastActivity = Date.now();
        this.sessionStore.set(sessionId, session);
      }
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }

  /**
   * Check if session is valid and active
   */
  isSessionValid(sessionId: string): boolean {
    const session = this.sessionStore.get(sessionId);
    if (!session) return false;

    const now = Date.now();
    const timeSinceActivity = now - session.lastActivity;
    
    return timeSinceActivity < this.options.maxInactiveTime;
  }

  /**
   * Get active sessions for a user
   */
  getUserActiveSessions(userId: string): SessionMetadata[] {
    return Array.from(this.sessionStore.values())
      .filter(session => 
        session.userId === userId && 
        this.isSessionValid(session.sessionId)
      );
  }

  /**
   * Enforce concurrent session limits
   */
  async enforceConcurrentSessionLimits(userId: string): Promise<boolean> {
    if (!this.options.enforceConcurrentLimits) return true;

    const activeSessions = this.getUserActiveSessions(userId);
    
    if (activeSessions.length > clerkConfig.maxConcurrentSessions) {
      // Remove oldest sessions
      const sortedSessions = activeSessions
        .sort((a, b) => a.lastActivity - b.lastActivity);
      
      const sessionsToRemove = sortedSessions
        .slice(0, activeSessions.length - clerkConfig.maxConcurrentSessions);
      
      for (const session of sessionsToRemove) {
        this.sessionStore.delete(session.sessionId);
      }
      
      return false; // Indicates sessions were terminated
    }
    
    return true;
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): number {
    let removedCount = 0;
    const now = Date.now();
    
    for (const [sessionId, session] of this.sessionStore.entries()) {
      const timeSinceActivity = now - session.lastActivity;
      
      if (timeSinceActivity > this.options.maxInactiveTime) {
        this.sessionStore.delete(sessionId);
        removedCount++;
      }
    }
    
    return removedCount;
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    const now = Date.now();
    const activeSessions = Array.from(this.sessionStore.values())
      .filter(session => this.isSessionValid(session.sessionId));
    
    return {
      totalSessions: this.sessionStore.size,
      activeSessions: activeSessions.length,
      expiredSessions: this.sessionStore.size - activeSessions.length,
      uniqueUsers: new Set(activeSessions.map(s => s.userId)).size,
      lastCleanup: now
    };
  }

  /**
   * Check user permissions
   */
  hasPermission(sessionId: string, permission: string): boolean {
    const session = this.sessionStore.get(sessionId);
    if (!session || !this.isSessionValid(sessionId)) return false;
    
    return session.permissions?.includes(permission) || false;
  }

  /**
   * Check user roles
   */
  hasRole(sessionId: string, role: string): boolean {
    const session = this.sessionStore.get(sessionId);
    if (!session || !this.isSessionValid(sessionId)) return false;
    
    return session.roles?.includes(role) || false;
  }
}

// Export singleton instance
export const sessionManager = ClerkSessionManager.getInstance();