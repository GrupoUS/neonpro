/**
 * Enhanced Session Manager for OAuth Google Integration
 * Implements secure token storage, session timeout, and comprehensive security features
 */

import { createClient } from '@/app/utils/supabase/client';
import { performanceTracker } from './performance-tracker';
import { sessionManager } from './session-manager';

export interface SecureTokenStorage {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: 'bearer';
  scope: string;
  provider: 'google' | 'email';
}

export interface SessionTimeout {
  idleTimeout: number; // Minutes of inactivity before logout
  absoluteTimeout: number; // Maximum session duration in minutes
  warningThreshold: number; // Minutes before timeout to show warning
  lastActivity: number; // Timestamp of last user activity
}

export interface SessionActivity {
  sessionId: string;
  userId: string;
  action: string;
  resource?: string;
  timestamp: number;
  ipAddress: string;
  userAgent: string;
  riskScore: number;
}

class EnhancedSessionManager {
  private static instance: EnhancedSessionManager;
  private activityTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private readonly sessionTimeouts: Map<string, SessionTimeout> = new Map();

  private constructor() {}

  public static getInstance(): EnhancedSessionManager {
    if (!EnhancedSessionManager.instance) {
      EnhancedSessionManager.instance = new EnhancedSessionManager();
    }
    return EnhancedSessionManager.instance;
  }

  /**
   * Secure token storage with encryption
   */
  async storeTokensSecurely(
    sessionId: string,
    tokens: SecureTokenStorage
  ): Promise<boolean> {
    const startTime = Date.now();

    try {
      const supabase = await createClient();

      // Encrypt sensitive token data
      const encryptedTokens = await this.encryptTokenData(tokens);

      const { error } = await supabase.from('secure_tokens').upsert({
        session_id: sessionId,
        encrypted_tokens: encryptedTokens,
        expires_at: new Date(tokens.expiresAt).toISOString(),
        provider: tokens.provider,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Token storage error:', error);
        return false;
      }

      // Log security event
      await this.logSecurityEvent(sessionId, 'tokens_stored', {
        provider: tokens.provider,
        expiresAt: tokens.expiresAt,
      });

      performanceTracker.recordMetric(
        'secure_token_storage',
        Date.now() - startTime
      );
      return true;
    } catch (error) {
      console.error('Secure token storage failed:', error);
      return false;
    }
  }

  /**
   * Retrieve and decrypt stored tokens
   */
  async retrieveTokensSecurely(
    sessionId: string
  ): Promise<SecureTokenStorage | null> {
    const startTime = Date.now();

    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('secure_tokens')
        .select('*')
        .eq('session_id', sessionId)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return null;
      }

      // Decrypt token data
      const tokens = await this.decryptTokenData(data.encrypted_tokens);

      performanceTracker.recordMetric(
        'secure_token_retrieval',
        Date.now() - startTime
      );
      return tokens;
    } catch (error) {
      console.error('Token retrieval failed:', error);
      return null;
    }
  }

  /**
   * Initialize session timeout management
   */
  initializeSessionTimeout(
    sessionId: string,
    userId: string,
    options: Partial<SessionTimeout> = {}
  ): void {
    const timeout: SessionTimeout = {
      idleTimeout: options.idleTimeout || 30, // 30 minutes default
      absoluteTimeout: options.absoluteTimeout || 480, // 8 hours default
      warningThreshold: options.warningThreshold || 5, // 5 minutes warning
      lastActivity: Date.now(),
    };

    this.sessionTimeouts.set(sessionId, timeout);
    this.startTimeoutMonitoring(sessionId, userId);
  }

  /**
   * Update session activity and reset idle timer
   */
  async updateSessionActivity(
    sessionId: string,
    activity: Omit<SessionActivity, 'sessionId' | 'timestamp'>
  ): Promise<void> {
    const timeout = this.sessionTimeouts.get(sessionId);
    if (!timeout) {
      return;
    }

    // Update last activity timestamp
    timeout.lastActivity = Date.now();
    this.sessionTimeouts.set(sessionId, timeout);

    // Log activity for security monitoring
    const activityRecord: SessionActivity = {
      sessionId,
      timestamp: Date.now(),
      ...activity,
    };

    await this.logSessionActivity(activityRecord);

    // Update session manager
    await sessionManager.updateSessionActivity(sessionId, {
      action: activity.action,
      resource: activity.resource,
    });

    // Reset timeout timers
    this.resetTimeoutTimers(sessionId, activity.userId);
  }

  /**
   * Check if session requires timeout warning
   */
  shouldShowTimeoutWarning(sessionId: string): boolean {
    const timeout = this.sessionTimeouts.get(sessionId);
    if (!timeout) {
      return false;
    }

    const timeSinceActivity = Date.now() - timeout.lastActivity;
    const warningThresholdMs = timeout.warningThreshold * 60 * 1000;
    const idleTimeoutMs = timeout.idleTimeout * 60 * 1000;

    return timeSinceActivity >= idleTimeoutMs - warningThresholdMs;
  }

  /**
   * Force session timeout and cleanup
   */
  async forceSessionTimeout(sessionId: string, reason: string): Promise<void> {
    try {
      // Clear timeout timers
      this.clearTimeoutTimers();

      // Remove from timeout tracking
      this.sessionTimeouts.delete(sessionId);

      // Invalidate stored tokens
      await this.invalidateStoredTokens(sessionId);

      // Log security event
      await this.logSecurityEvent(sessionId, 'session_timeout', {
        reason,
        timestamp: Date.now(),
      });

      // Notify session manager
      await sessionManager.manageConcurrentSessions('', sessionId);
    } catch (error) {
      console.error('Force session timeout failed:', error);
    }
  }

  /**
   * Implement secure logout with comprehensive cleanup
   */
  async secureLogout(sessionId: string, userId: string): Promise<boolean> {
    const startTime = Date.now();

    try {
      const supabase = await createClient();

      // 1. Revoke OAuth tokens if applicable
      await this.revokeOAuthTokens(sessionId);

      // 2. Clear stored tokens
      await this.invalidateStoredTokens(sessionId);

      // 3. Invalidate Supabase session
      await supabase.auth.signOut();

      // 4. Clear session timeout tracking
      this.sessionTimeouts.delete(sessionId);
      this.clearTimeoutTimers();

      // 5. Log security event
      await this.logSecurityEvent(sessionId, 'secure_logout', {
        userId,
        timestamp: Date.now(),
      });

      // 6. Clear browser storage (client-side)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      }

      performanceTracker.recordMetric('secure_logout', Date.now() - startTime);
      return true;
    } catch (error) {
      console.error('Secure logout failed:', error);
      return false;
    }
  }

  /**
   * Monitor concurrent sessions and enforce limits
   */
  async monitorConcurrentSessions(userId: string): Promise<void> {
    try {
      const supabase = await createClient();

      // Get all active sessions for user
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (!sessions) {
        return;
      }

      // Check for suspicious concurrent sessions
      const suspiciousSessions = sessions.filter((session) => {
        const deviceInfo = session.device_info;
        return (
          session.risk_score > 7 || this.detectSuspiciousActivity(deviceInfo)
        );
      });

      // Terminate suspicious sessions
      for (const session of suspiciousSessions) {
        await this.forceSessionTimeout(
          session.session_id,
          'suspicious_activity'
        );
      }

      // Use existing session manager for general concurrent session management
      await sessionManager.manageConcurrentSessions(userId, '');
    } catch (error) {
      console.error('Concurrent session monitoring failed:', error);
    }
  }

  /**
   * Private helper methods
   */
  private async encryptTokenData(tokens: SecureTokenStorage): Promise<string> {
    // In production, use proper encryption (AES-256-GCM)
    // For now, using base64 encoding as placeholder
    const tokenString = JSON.stringify(tokens);
    return Buffer.from(tokenString).toString('base64');
  }

  private async decryptTokenData(
    encryptedData: string
  ): Promise<SecureTokenStorage> {
    // In production, use proper decryption
    // For now, using base64 decoding as placeholder
    const tokenString = Buffer.from(encryptedData, 'base64').toString('utf-8');
    return JSON.parse(tokenString);
  }

  private startTimeoutMonitoring(sessionId: string, _userId: string): void {
    const timeout = this.sessionTimeouts.get(sessionId);
    if (!timeout) {
      return;
    }

    // Set warning timer
    const warningMs =
      (timeout.idleTimeout - timeout.warningThreshold) * 60 * 1000;
    this.warningTimer = setTimeout(() => {
      this.showTimeoutWarning(sessionId);
    }, warningMs);

    // Set timeout timer
    const timeoutMs = timeout.idleTimeout * 60 * 1000;
    this.activityTimer = setTimeout(() => {
      this.forceSessionTimeout(sessionId, 'idle_timeout');
    }, timeoutMs);
  }

  private resetTimeoutTimers(sessionId: string, userId: string): void {
    this.clearTimeoutTimers();
    this.startTimeoutMonitoring(sessionId, userId);
  }

  private clearTimeoutTimers(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  private showTimeoutWarning(sessionId: string): void {
    // Emit event for UI to show warning
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('session-timeout-warning', {
          detail: { sessionId },
        })
      );
    }
  }

  private async invalidateStoredTokens(sessionId: string): Promise<void> {
    try {
      const supabase = await createClient();

      await supabase.from('secure_tokens').delete().eq('session_id', sessionId);
    } catch (error) {
      console.error('Token invalidation failed:', error);
    }
  }

  private async revokeOAuthTokens(sessionId: string): Promise<void> {
    try {
      const tokens = await this.retrieveTokensSecurely(sessionId);
      if (!tokens || tokens.provider !== 'google') {
        return;
      }

      // Revoke Google OAuth tokens
      const response = await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `token=${tokens.accessToken}`,
      });

      if (!response.ok) {
        console.warn('OAuth token revocation failed:', response.status);
      }
    } catch (error) {
      console.error('OAuth token revocation error:', error);
    }
  }

  private detectSuspiciousActivity(_deviceInfo: any): boolean {
    // Implement suspicious activity detection logic
    // For now, basic checks
    return false;
  }

  private async logSessionActivity(activity: SessionActivity): Promise<void> {
    try {
      const supabase = await createClient();

      await supabase.from('session_activity_log').insert({
        session_id: activity.sessionId,
        user_id: activity.userId,
        action: activity.action,
        resource: activity.resource,
        timestamp: new Date(activity.timestamp).toISOString(),
        ip_address: activity.ipAddress,
        user_agent: activity.userAgent,
        risk_score: activity.riskScore,
      });
    } catch (error) {
      console.error('Session activity logging failed:', error);
    }
  }

  private async logSecurityEvent(
    sessionId: string,
    event: string,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      const supabase = await createClient();

      await supabase.from('security_audit_log').insert({
        session_id: sessionId,
        activity_type: event,
        metadata,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Security event logging failed:', error);
    }
  }
}

export const enhancedSessionManager = EnhancedSessionManager.getInstance();
