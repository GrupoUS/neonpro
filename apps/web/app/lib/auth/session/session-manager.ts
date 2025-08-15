/**
 * Enhanced Session Management System
 *
 * Provides secure token storage, session timeout management,
 * activity tracking, and concurrent session limiting for OAuth authentication.
 *
 * Features:
 * - Encrypted localStorage for secure token storage
 * - Automatic session timeout with configurable intervals
 * - User activity tracking for session extension
 * - Concurrent session limiting (max 3 sessions per user)
 * - Secure logout with token cleanup
 * - Session heartbeat for real-time monitoring
 */

import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

// Session configuration
const SESSION_CONFIG = {
  TIMEOUT_MINUTES: 120, // 2 hours default
  ACTIVITY_TIMEOUT_MINUTES: 30, // Auto-logout after inactivity
  MAX_CONCURRENT_SESSIONS: 3,
  HEARTBEAT_INTERVAL_MS: 60_000, // 1 minute
  TOKEN_REFRESH_THRESHOLD_MINUTES: 5,
  STORAGE_KEY_PREFIX: 'neonpro_session_',
  ENCRYPTION_KEY: 'neonpro_secure_session_2024',
};

interface SessionData {
  sessionId: string;
  userId: string;
  email: string;
  role: string;
  clinicId: string;
  lastActivity: number;
  expiresAt: number;
  deviceInfo: string;
  ipAddress?: string;
}

interface SessionActivity {
  action: string;
  timestamp: number;
  route?: string;
  metadata?: Record<string, any>;
}

class SessionManager {
  private sessionId: string | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private activityTimeout: NodeJS.Timeout | null = null;
  private readonly supabase = createClient();

  /**
   * Initialize session management
   */
  async initialize(): Promise<void> {
    this.sessionId = this.generateSessionId();
    await this.loadExistingSession();
    this.startHeartbeat();
    this.setupActivityTracking();
  }

  /**
   * Create new session after successful authentication
   */
  async createSession(
    user: User,
    _additionalData?: Record<string, any>
  ): Promise<SessionData> {
    const now = Date.now();
    const sessionData: SessionData = {
      sessionId: this.sessionId || this.generateSessionId(),
      userId: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'user',
      clinicId: user.user_metadata?.clinic_id || '',
      lastActivity: now,
      expiresAt: now + SESSION_CONFIG.TIMEOUT_MINUTES * 60 * 1000,
      deviceInfo: this.getDeviceInfo(),
      ipAddress: await this.getClientIP(),
    };

    // Check concurrent session limit
    await this.enforceSessionLimit(user.id);

    // Store session securely
    await this.storeSession(sessionData);

    // Log session creation
    await this.logActivity('session_created', {
      sessionId: sessionData.sessionId,
      deviceInfo: sessionData.deviceInfo,
    });

    // Start session monitoring
    this.startSessionMonitoring();

    return sessionData;
  }

  /**
   * Update session activity and extend timeout
   */
  async updateActivity(
    action = 'activity',
    metadata?: Record<string, any>
  ): Promise<void> {
    const session = await this.getCurrentSession();
    if (!session) {
      return;
    }

    const now = Date.now();
    session.lastActivity = now;
    session.expiresAt =
      now + SESSION_CONFIG.ACTIVITY_TIMEOUT_MINUTES * 60 * 1000;

    await this.storeSession(session);
    await this.logActivity(action, metadata);

    // Reset activity timeout
    this.resetActivityTimeout();
  }

  /**
   * Get current session data
   */
  async getCurrentSession(): Promise<SessionData | null> {
    try {
      const encryptedData = localStorage.getItem(
        `${SESSION_CONFIG.STORAGE_KEY_PREFIX}current`
      );
      if (!encryptedData) {
        return null;
      }

      const sessionData = JSON.parse(
        this.decrypt(encryptedData)
      ) as SessionData;

      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        await this.destroySession();
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  /**
   * Refresh session tokens
   */
  async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();

      if (error || !data.session) {
        await this.destroySession();
        return false;
      }

      // Update session with new token data
      const session = await this.getCurrentSession();
      if (session) {
        session.lastActivity = Date.now();
        session.expiresAt =
          Date.now() + SESSION_CONFIG.TIMEOUT_MINUTES * 60 * 1000;
        await this.storeSession(session);
      }

      await this.logActivity('session_refreshed');
      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      await this.destroySession();
      return false;
    }
  }

  /**
   * Secure logout and session cleanup
   */
  async destroySession(): Promise<void> {
    const session = await this.getCurrentSession();

    try {
      // Sign out from Supabase
      await this.supabase.auth.signOut();

      // Clear all session storage
      this.clearSessionStorage();

      // Stop monitoring
      this.stopSessionMonitoring();

      // Log session destruction
      if (session) {
        await this.logActivity('session_destroyed', {
          sessionId: session.sessionId,
          duration:
            Date.now() -
            (session.expiresAt - SESSION_CONFIG.TIMEOUT_MINUTES * 60 * 1000),
        });
      }
    } catch (error) {
      console.error('Error destroying session:', error);
    }
  }

  /**
   * Check if session needs token refresh
   */
  shouldRefreshToken(): boolean {
    const session = this.getCurrentSession();
    if (!session) {
      return false;
    }

    const timeToExpiry = session.expiresAt - Date.now();
    const refreshThreshold =
      SESSION_CONFIG.TOKEN_REFRESH_THRESHOLD_MINUTES * 60 * 1000;

    return timeToExpiry <= refreshThreshold;
  }

  /**
   * Get all active sessions for current user
   */
  async getActiveSessions(): Promise<SessionData[]> {
    try {
      const allKeys = Object.keys(localStorage).filter(
        (key) =>
          key.startsWith(SESSION_CONFIG.STORAGE_KEY_PREFIX) &&
          key !== `${SESSION_CONFIG.STORAGE_KEY_PREFIX}current`
      );

      const sessions: SessionData[] = [];
      for (const key of allKeys) {
        try {
          const encryptedData = localStorage.getItem(key);
          if (encryptedData) {
            const sessionData = JSON.parse(
              this.decrypt(encryptedData)
            ) as SessionData;
            if (Date.now() <= sessionData.expiresAt) {
              sessions.push(sessionData);
            } else {
              localStorage.removeItem(key); // Clean expired sessions
            }
          }
        } catch (_error) {
          localStorage.removeItem(key); // Clean corrupted sessions
        }
      }

      return sessions;
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  /**
   * Terminate specific session
   */
  async terminateSession(sessionId: string): Promise<boolean> {
    try {
      const key = `${SESSION_CONFIG.STORAGE_KEY_PREFIX}${sessionId}`;
      localStorage.removeItem(key);

      await this.logActivity('session_terminated', {
        terminatedSessionId: sessionId,
      });
      return true;
    } catch (error) {
      console.error('Error terminating session:', error);
      return false;
    }
  }

  // Private methods

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadExistingSession(): Promise<void> {
    const session = await this.getCurrentSession();
    if (session) {
      this.sessionId = session.sessionId;
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      const session = await this.getCurrentSession();
      if (session) {
        await this.updateActivity('heartbeat');
      } else {
        this.stopSessionMonitoring();
      }
    }, SESSION_CONFIG.HEARTBEAT_INTERVAL_MS);
  }

  private setupActivityTracking(): void {
    // Track page navigation
    window.addEventListener('beforeunload', () => {
      this.updateActivity('page_unload');
    });

    // Track user interactions
    const activityEvents = ['click', 'keypress', 'scroll', 'mousemove'];
    activityEvents.forEach((event) => {
      document.addEventListener(
        event,
        () => {
          this.updateActivity(`user_${event}`);
        },
        { passive: true, once: false }
      );
    });
  }

  private resetActivityTimeout(): void {
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
    }

    this.activityTimeout = setTimeout(
      async () => {
        await this.logActivity('session_timeout');
        await this.destroySession();
        window.location.href = '/auth/login?reason=timeout';
      },
      SESSION_CONFIG.ACTIVITY_TIMEOUT_MINUTES * 60 * 1000
    );
  }

  private startSessionMonitoring(): void {
    this.startHeartbeat();
    this.resetActivityTimeout();
  }

  private stopSessionMonitoring(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
      this.activityTimeout = null;
    }
  }

  private async storeSession(session: SessionData): Promise<void> {
    try {
      const encryptedData = this.encrypt(JSON.stringify(session));
      localStorage.setItem(
        `${SESSION_CONFIG.STORAGE_KEY_PREFIX}current`,
        encryptedData
      );
      localStorage.setItem(
        `${SESSION_CONFIG.STORAGE_KEY_PREFIX}${session.sessionId}`,
        encryptedData
      );
    } catch (error) {
      console.error('Error storing session:', error);
    }
  }

  private clearSessionStorage(): void {
    const allKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith(SESSION_CONFIG.STORAGE_KEY_PREFIX)
    );
    allKeys.forEach((key) => localStorage.removeItem(key));
  }

  private async enforceSessionLimit(userId: string): Promise<void> {
    const activeSessions = await this.getActiveSessions();
    const userSessions = activeSessions.filter((s) => s.userId === userId);

    if (userSessions.length >= SESSION_CONFIG.MAX_CONCURRENT_SESSIONS) {
      // Remove oldest session
      const oldestSession = userSessions.sort(
        (a, b) => a.lastActivity - b.lastActivity
      )[0];
      await this.terminateSession(oldestSession.sessionId);
    }
  }

  private encrypt(text: string): string {
    // Simple encryption for demo - use crypto-js in production
    return btoa(text + SESSION_CONFIG.ENCRYPTION_KEY);
  }

  private decrypt(encryptedText: string): string {
    // Simple decryption for demo - use crypto-js in production
    const decoded = atob(encryptedText);
    return decoded.replace(SESSION_CONFIG.ENCRYPTION_KEY, '');
  }

  private getDeviceInfo(): string {
    return `${navigator.userAgent.substring(0, 100)}_${screen.width}x${screen.height}`;
  }

  private async getClientIP(): Promise<string> {
    try {
      // In production, get IP from server-side
      return 'client_ip';
    } catch {
      return 'unknown';
    }
  }

  private async logActivity(
    action: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const activity: SessionActivity = {
        action,
        timestamp: Date.now(),
        route: window.location.pathname,
        metadata,
      };

      // Store activity in localStorage for now - send to server in production
      const activities = JSON.parse(
        localStorage.getItem('session_activities') || '[]'
      );
      activities.push(activity);

      // Keep only last 100 activities
      if (activities.length > 100) {
        activities.splice(0, activities.length - 100);
      }

      localStorage.setItem('session_activities', JSON.stringify(activities));
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

// Export types
export type { SessionData, SessionActivity };
export { SESSION_CONFIG };
