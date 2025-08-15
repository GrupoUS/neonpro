import type { User } from '@supabase/supabase-js';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

// Session Configuration Schema
export const SessionConfigSchema = z.object({
  role: z.enum(['owner', 'manager', 'staff', 'patient']),
  timeoutMinutes: z.number().min(5).max(480), // 5 minutes to 8 hours
  maxConcurrentSessions: z.number().min(1).max(10),
  securityLevel: z.enum(['low', 'medium', 'high', 'critical']),
  requireMFA: z.boolean(),
  allowCrossDevice: z.boolean(),
  warningMinutes: z.array(z.number()).default([5, 1]), // Warning times before expiry
});

// Session Data Schema
export const SessionDataSchema = z.object({
  id: z.string(),
  userId: z.string(),
  deviceFingerprint: z.string(),
  ipAddress: z.string(),
  userAgent: z.string(),
  location: z
    .object({
      country: z.string().optional(),
      city: z.string().optional(),
      timezone: z.string().optional(),
    })
    .optional(),
  createdAt: z.date(),
  lastActivity: z.date(),
  expiresAt: z.date(),
  isActive: z.boolean(),
  securityScore: z.number().min(0).max(100),
  metadata: z.record(z.any()).optional(),
});

// Session Activity Schema
export const SessionActivitySchema = z.object({
  sessionId: z.string(),
  activityType: z.enum([
    'page_view',
    'api_call',
    'user_action',
    'idle',
    'warning_shown',
  ]),
  timestamp: z.date(),
  details: z.record(z.any()).optional(),
});

// Session Security Event Schema
export const SessionSecurityEventSchema = z.object({
  sessionId: z.string(),
  eventType: z.enum([
    'suspicious_login',
    'unusual_location',
    'rapid_requests',
    'session_hijack_attempt',
    'concurrent_limit_exceeded',
    'security_violation',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  details: z.record(z.any()),
  timestamp: z.date(),
  resolved: z.boolean().default(false),
});

export type SessionConfig = z.infer<typeof SessionConfigSchema>;
export type SessionData = z.infer<typeof SessionDataSchema>;
export type SessionActivity = z.infer<typeof SessionActivitySchema>;
export type SessionSecurityEvent = z.infer<typeof SessionSecurityEventSchema>;

// Default session configurations by role
export const DEFAULT_SESSION_CONFIGS: Record<string, SessionConfig> = {
  owner: {
    role: 'owner',
    timeoutMinutes: 60,
    maxConcurrentSessions: 5,
    securityLevel: 'high',
    requireMFA: true,
    allowCrossDevice: true,
    warningMinutes: [10, 5, 1],
  },
  manager: {
    role: 'manager',
    timeoutMinutes: 45,
    maxConcurrentSessions: 3,
    securityLevel: 'high',
    requireMFA: true,
    allowCrossDevice: true,
    warningMinutes: [5, 1],
  },
  staff: {
    role: 'staff',
    timeoutMinutes: 30,
    maxConcurrentSessions: 2,
    securityLevel: 'medium',
    requireMFA: false,
    allowCrossDevice: false,
    warningMinutes: [5, 1],
  },
  patient: {
    role: 'patient',
    timeoutMinutes: 20,
    maxConcurrentSessions: 1,
    securityLevel: 'medium',
    requireMFA: false,
    allowCrossDevice: false,
    warningMinutes: [5, 1],
  },
};

/**
 * Intelligent Session Manager
 * Handles session timeout, activity tracking, and security monitoring
 */
export class SessionManager {
  private supabase = createClient();
  private activityTimers = new Map<string, NodeJS.Timeout>();
  private warningTimers = new Map<string, NodeJS.Timeout[]>();
  private sessionConfigs = new Map<string, SessionConfig>();

  constructor() {
    this.loadSessionConfigs();
    this.startSessionCleanup();
  }

  /**
   * Create a new session with intelligent timeout configuration
   */
  async createSession(
    user: User,
    deviceFingerprint: string,
    ipAddress: string,
    userAgent: string,
    location?: { country?: string; city?: string; timezone?: string }
  ): Promise<SessionData> {
    try {
      // Get user role and session config
      const userRole = await this.getUserRole(user.id);
      const config = this.getSessionConfig(userRole);

      // Check concurrent session limits
      await this.enforceConcurrentSessionLimits(user.id, config);

      // Calculate session expiry
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + config.timeoutMinutes * 60 * 1000
      );

      // Create session record
      const sessionData: Omit<SessionData, 'id'> = {
        userId: user.id,
        deviceFingerprint,
        ipAddress,
        userAgent,
        location,
        createdAt: now,
        lastActivity: now,
        expiresAt,
        isActive: true,
        securityScore: await this.calculateSecurityScore({
          userId: user.id,
          deviceFingerprint,
          ipAddress,
          location,
        }),
        metadata: {
          role: userRole,
          config,
        },
      };

      const { data: session, error } = await this.supabase
        .from('user_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      const fullSession = { ...sessionData, id: session.id };

      // Setup activity tracking and timeout warnings
      this.setupSessionTimers(fullSession);

      // Log session creation
      await this.logSessionActivity(session.id, 'page_view', {
        action: 'session_created',
        userAgent,
        ipAddress,
      });

      return fullSession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Update session activity and extend timeout if needed
   */
  async updateSessionActivity(
    sessionId: string,
    activityType: SessionActivity['activityType'],
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const now = new Date();

      // Get current session
      const { data: session, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('is_active', true)
        .single();

      if (error || !session) {
        throw new Error('Session not found or inactive');
      }

      // Check if session should be extended
      const shouldExtend = this.shouldExtendSession(session, activityType);
      const newExpiresAt = shouldExtend
        ? new Date(now.getTime() + this.getSessionTimeoutMs(session.user_id))
        : new Date(session.expires_at);

      // Update session
      await this.supabase
        .from('user_sessions')
        .update({
          last_activity: now.toISOString(),
          expires_at: newExpiresAt.toISOString(),
        })
        .eq('id', sessionId);

      // Log activity
      await this.logSessionActivity(sessionId, activityType, details);

      // Reset timers if session was extended
      if (shouldExtend) {
        this.resetSessionTimers(sessionId, {
          ...session,
          lastActivity: now,
          expiresAt: newExpiresAt,
        });
      }
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  /**
   * Check if session should be extended based on activity type
   */
  private shouldExtendSession(
    session: any,
    activityType: SessionActivity['activityType']
  ): boolean {
    const significantActivities = ['page_view', 'api_call', 'user_action'];
    const timeSinceLastActivity =
      Date.now() - new Date(session.last_activity).getTime();
    const fiveMinutes = 5 * 60 * 1000;

    return (
      significantActivities.includes(activityType) &&
      timeSinceLastActivity > fiveMinutes
    );
  }

  /**
   * Setup session timers for warnings and expiry
   */
  private setupSessionTimers(session: SessionData): void {
    const config = this.getSessionConfig(session.metadata?.role || 'patient');
    const timeUntilExpiry = session.expiresAt.getTime() - Date.now();

    // Clear existing timers
    this.clearSessionTimers(session.id);

    // Setup warning timers
    const warningTimers: NodeJS.Timeout[] = [];

    config.warningMinutes.forEach((minutes) => {
      const warningTime = timeUntilExpiry - minutes * 60 * 1000;

      if (warningTime > 0) {
        const timer = setTimeout(() => {
          this.showSessionWarning(session.id, minutes);
        }, warningTime);

        warningTimers.push(timer);
      }
    });

    // Setup expiry timer
    const expiryTimer = setTimeout(() => {
      this.expireSession(session.id);
    }, timeUntilExpiry);

    this.activityTimers.set(session.id, expiryTimer);
    this.warningTimers.set(session.id, warningTimers);
  }

  /**
   * Reset session timers when session is extended
   */
  private resetSessionTimers(sessionId: string, session: SessionData): void {
    this.clearSessionTimers(sessionId);
    this.setupSessionTimers(session);
  }

  /**
   * Clear all timers for a session
   */
  private clearSessionTimers(sessionId: string): void {
    // Clear expiry timer
    const expiryTimer = this.activityTimers.get(sessionId);
    if (expiryTimer) {
      clearTimeout(expiryTimer);
      this.activityTimers.delete(sessionId);
    }

    // Clear warning timers
    const warningTimers = this.warningTimers.get(sessionId);
    if (warningTimers) {
      warningTimers.forEach((timer) => clearTimeout(timer));
      this.warningTimers.delete(sessionId);
    }
  }

  /**
   * Show session timeout warning
   */
  private async showSessionWarning(
    sessionId: string,
    minutesRemaining: number
  ): Promise<void> {
    try {
      // Log warning event
      await this.logSessionActivity(sessionId, 'warning_shown', {
        minutesRemaining,
        warningType: 'session_timeout',
      });

      // Emit warning event (for real-time notifications)
      this.emitSessionEvent(sessionId, 'session_warning', {
        minutesRemaining,
        message: `Your session will expire in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}. Please save your work.`,
      });
    } catch (error) {
      console.error('Error showing session warning:', error);
    }
  }

  /**
   * Expire a session
   */
  private async expireSession(sessionId: string): Promise<void> {
    try {
      // Mark session as inactive
      await this.supabase
        .from('user_sessions')
        .update({
          is_active: false,
          expired_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      // Log expiry
      await this.logSessionActivity(sessionId, 'idle', {
        action: 'session_expired',
        reason: 'timeout',
      });

      // Clear timers
      this.clearSessionTimers(sessionId);

      // Emit expiry event
      this.emitSessionEvent(sessionId, 'session_expired', {
        reason: 'timeout',
        message:
          'Your session has expired due to inactivity. Please log in again.',
      });
    } catch (error) {
      console.error('Error expiring session:', error);
    }
  }

  /**
   * Get session configuration for a role
   */
  private getSessionConfig(role: string): SessionConfig {
    return this.sessionConfigs.get(role) || DEFAULT_SESSION_CONFIGS.patient;
  }

  /**
   * Get session timeout in milliseconds
   */
  private async getSessionTimeoutMs(userId: string): Promise<number> {
    const role = await this.getUserRole(userId);
    const config = this.getSessionConfig(role);
    return config.timeoutMinutes * 60 * 1000;
  }

  /**
   * Get user role from database
   */
  private async getUserRole(userId: string): Promise<string> {
    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return profile?.role || 'patient';
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'patient';
    }
  }

  /**
   * Enforce concurrent session limits
   */
  private async enforceConcurrentSessionLimits(
    userId: string,
    config: SessionConfig
  ): Promise<void> {
    try {
      // Get active sessions for user
      const { data: activeSessions, error } = await this.supabase
        .from('user_sessions')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // If at limit, terminate oldest sessions
      if (activeSessions.length >= config.maxConcurrentSessions) {
        const sessionsToTerminate = activeSessions.slice(
          0,
          activeSessions.length - config.maxConcurrentSessions + 1
        );

        for (const session of sessionsToTerminate) {
          await this.terminateSession(session.id, 'concurrent_limit_exceeded');
        }
      }
    } catch (error) {
      console.error('Error enforcing concurrent session limits:', error);
    }
  }

  /**
   * Terminate a session
   */
  async terminateSession(sessionId: string, reason: string): Promise<void> {
    try {
      // Mark session as inactive
      await this.supabase
        .from('user_sessions')
        .update({
          is_active: false,
          terminated_at: new Date().toISOString(),
          termination_reason: reason,
        })
        .eq('id', sessionId);

      // Clear timers
      this.clearSessionTimers(sessionId);

      // Log termination
      await this.logSessionActivity(sessionId, 'idle', {
        action: 'session_terminated',
        reason,
      });

      // Emit termination event
      this.emitSessionEvent(sessionId, 'session_terminated', {
        reason,
        message: `Your session has been terminated: ${reason}`,
      });
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  }

  /**
   * Calculate security score for session
   */
  private async calculateSecurityScore(params: {
    userId: string;
    deviceFingerprint: string;
    ipAddress: string;
    location?: { country?: string; city?: string; timezone?: string };
  }): Promise<number> {
    let score = 100;

    try {
      // Check for known device
      const { data: knownDevice } = await this.supabase
        .from('device_registrations')
        .select('trusted')
        .eq('user_id', params.userId)
        .eq('device_fingerprint', params.deviceFingerprint)
        .single();

      if (!knownDevice) {
        score -= 20; // New device
      } else if (!knownDevice.trusted) {
        score -= 10; // Known but untrusted device
      }

      // Check for unusual location
      const { data: recentSessions } = await this.supabase
        .from('user_sessions')
        .select('ip_address, location')
        .eq('user_id', params.userId)
        .gte(
          'created_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        )
        .limit(10);

      if (recentSessions && params.location) {
        const hasRecentLocationMatch = recentSessions.some(
          (session) => session.location?.country === params.location?.country
        );

        if (!hasRecentLocationMatch) {
          score -= 15; // Unusual location
        }
      }

      // Additional security checks can be added here
    } catch (error) {
      console.error('Error calculating security score:', error);
      score = 50; // Default to medium security score on error
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Log session activity
   */
  private async logSessionActivity(
    sessionId: string,
    activityType: SessionActivity['activityType'],
    details?: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase.from('session_activities').insert({
        session_id: sessionId,
        activity_type: activityType,
        timestamp: new Date().toISOString(),
        details,
      });
    } catch (error) {
      console.error('Error logging session activity:', error);
    }
  }

  /**
   * Emit session event for real-time notifications
   */
  private emitSessionEvent(
    sessionId: string,
    eventType: string,
    data: Record<string, any>
  ): void {
    // This would integrate with WebSocket or Server-Sent Events
    // For now, we'll use a simple event system
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('session-event', {
          detail: {
            sessionId,
            eventType,
            data,
            timestamp: new Date().toISOString(),
          },
        })
      );
    }
  }

  /**
   * Load session configurations from database
   */
  private async loadSessionConfigs(): Promise<void> {
    try {
      const { data: configs, error } = await this.supabase
        .from('session_policies')
        .select('*');

      if (error) throw error;

      // Load default configs
      Object.entries(DEFAULT_SESSION_CONFIGS).forEach(([role, config]) => {
        this.sessionConfigs.set(role, config);
      });

      // Override with database configs if available
      configs?.forEach((config) => {
        this.sessionConfigs.set(config.role, {
          role: config.role,
          timeoutMinutes: config.timeout_minutes,
          maxConcurrentSessions: config.max_sessions,
          securityLevel: config.security_level,
          requireMFA: config.require_mfa,
          allowCrossDevice: config.allow_cross_device,
          warningMinutes: config.warning_minutes || [5, 1],
        });
      });
    } catch (error) {
      console.error('Error loading session configs:', error);
      // Use default configs on error
    }
  }

  /**
   * Start periodic session cleanup
   */
  private startSessionCleanup(): void {
    // Run cleanup every 5 minutes
    setInterval(
      async () => {
        try {
          const now = new Date();

          // Mark expired sessions as inactive
          await this.supabase
            .from('user_sessions')
            .update({
              is_active: false,
              expired_at: now.toISOString(),
            })
            .eq('is_active', true)
            .lt('expires_at', now.toISOString());

          // Clean up old session data (older than 30 days)
          const thirtyDaysAgo = new Date(
            now.getTime() - 30 * 24 * 60 * 60 * 1000
          );

          await this.supabase
            .from('user_sessions')
            .delete()
            .eq('is_active', false)
            .lt('created_at', thirtyDaysAgo.toISOString());
        } catch (error) {
          console.error('Error during session cleanup:', error);
        }
      },
      5 * 60 * 1000
    ); // 5 minutes
  }

  /**
   * Get active sessions for a user
   */
  async getActiveSessions(userId: string): Promise<SessionData[]> {
    try {
      const { data: sessions, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) throw error;

      return sessions.map((session) => ({
        id: session.id,
        userId: session.user_id,
        deviceFingerprint: session.device_fingerprint,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        location: session.location,
        createdAt: new Date(session.created_at),
        lastActivity: new Date(session.last_activity),
        expiresAt: new Date(session.expires_at),
        isActive: session.is_active,
        securityScore: session.security_score,
        metadata: session.metadata,
      }));
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  /**
   * Validate session and return session data
   */
  async validateSession(sessionId: string): Promise<SessionData | null> {
    try {
      const { data: session, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !session) {
        return null;
      }

      return {
        id: session.id,
        userId: session.user_id,
        deviceFingerprint: session.device_fingerprint,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        location: session.location,
        createdAt: new Date(session.created_at),
        lastActivity: new Date(session.last_activity),
        expiresAt: new Date(session.expires_at),
        isActive: session.is_active,
        securityScore: session.security_score,
        metadata: session.metadata,
      };
    } catch (error) {
      console.error('Error validating session:', error);
      return null;
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
