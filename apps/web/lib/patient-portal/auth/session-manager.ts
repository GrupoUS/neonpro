import crypto from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AuditLogger } from '../../audit/audit-logger';
import type { LGPDManager } from '../../lgpd/lgpd-manager';
import type { EncryptionService } from '../../security/encryption-service';

// Session configuration interface
export type SessionConfig = {
  sessionTimeout: number; // in minutes
  maxConcurrentSessions: number;
  sessionCleanupInterval: number; // in minutes
  inactivityTimeout: number; // in minutes
  secureSessionCookies: boolean;
  sessionTokenLength: number;
  enableDeviceFingerprinting: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  enableTwoFactor: boolean;
};

// Session data interface
export type SessionData = {
  id: string;
  patientId: string;
  sessionToken: string;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  isActive: boolean;
  createdAt: Date;
};

// Session validation result
export type SessionValidationResult = {
  isValid: boolean;
  session?: SessionData;
  reason?: string;
  requiresRefresh?: boolean;
};

// Device fingerprint data
export type DeviceFingerprint = {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookiesEnabled: boolean;
  hash: string;
};

// Session activity data
export type SessionActivity = {
  sessionId: string;
  activityType: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
};

export class SessionManager {
  private readonly supabase: SupabaseClient;
  private readonly auditLogger: AuditLogger;
  private readonly encryption: EncryptionService;
  private readonly config: SessionConfig;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    auditLogger: AuditLogger,
    encryption: EncryptionService,
    lgpdManager: LGPDManager,
    config?: Partial<SessionConfig>,
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.auditLogger = auditLogger;
    this.encryption = encryption;
    this.lgpdManager = lgpdManager;

    // Default configuration
    this.config = {
      sessionTimeout: 120, // 2 hours
      maxConcurrentSessions: 3,
      sessionCleanupInterval: 15, // 15 minutes
      inactivityTimeout: 30, // 30 minutes
      secureSessionCookies: true,
      sessionTokenLength: 64,
      enableDeviceFingerprinting: true,
      maxLoginAttempts: 5,
      lockoutDuration: 15, // 15 minutes
      enableTwoFactor: false,
      ...config,
    };

    this.startCleanupInterval();
  }

  /**
   * Create a new session for a patient
   */
  async createSession(
    patientId: string,
    ipAddress: string,
    userAgent: string,
    deviceFingerprint?: DeviceFingerprint,
  ): Promise<SessionData> {
    try {
      // Check for existing sessions and enforce limits
      await this.enforceSessionLimits(patientId);

      // Generate secure session token
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(
        Date.now() + this.config.sessionTimeout * 60 * 1000,
      );

      // Create session record
      const sessionData: Omit<SessionData, 'id'> = {
        patientId,
        sessionToken: await this.encryption.encrypt(sessionToken),
        expiresAt,
        lastActivity: new Date(),
        ipAddress,
        userAgent,
        deviceFingerprint: deviceFingerprint
          ? deviceFingerprint.hash
          : undefined,
        isActive: true,
        createdAt: new Date(),
      };

      const { data, error } = await this.supabase
        .from('patient_portal_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create session: ${error.message}`);
      }

      const session: SessionData = {
        ...data,
        sessionToken, // Return unencrypted token for client use
      };

      // Log session creation
      await this.auditLogger.log({
        action: 'session_created',
        userId: patientId,
        userType: 'patient',
        resource: 'patient_portal_session',
        resourceId: session.id,
        details: {
          ipAddress,
          userAgent: userAgent.substring(0, 100),
          expiresAt: expiresAt.toISOString(),
        },
        ipAddress,
        userAgent,
      });

      // Log security event
      await this.logSecurityEvent({
        eventType: 'login',
        patientId,
        sessionId: session.id,
        ipAddress,
        userAgent,
        details: {
          deviceFingerprint: deviceFingerprint?.hash,
          sessionDuration: this.config.sessionTimeout,
        },
        severity: 'low',
      });

      return session;
    } catch (error) {
      await this.auditLogger.log({
        action: 'session_creation_failed',
        userId: patientId,
        userType: 'patient',
        resource: 'patient_portal_session',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          ipAddress,
          userAgent: userAgent.substring(0, 100),
        },
        ipAddress,
        userAgent,
      });
      throw error;
    }
  }

  /**
   * Validate a session token
   */
  async validateSession(
    sessionToken: string,
  ): Promise<SessionValidationResult> {
    try {
      // Get all active sessions and check each one
      const { data: sessions, error } = await this.supabase
        .from('patient_portal_sessions')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());

      if (error) {
        return { isValid: false, reason: 'Database error' };
      }

      // Find matching session by decrypting tokens
      for (const sessionRecord of sessions || []) {
        try {
          const decryptedToken = await this.encryption.decrypt(
            sessionRecord.session_token,
          );
          if (decryptedToken === sessionToken) {
            const session: SessionData = {
              id: sessionRecord.id,
              patientId: sessionRecord.patient_id,
              sessionToken,
              expiresAt: new Date(sessionRecord.expires_at),
              lastActivity: new Date(sessionRecord.last_activity),
              ipAddress: sessionRecord.ip_address,
              userAgent: sessionRecord.user_agent,
              deviceFingerprint: sessionRecord.device_fingerprint,
              isActive: sessionRecord.is_active,
              createdAt: new Date(sessionRecord.created_at),
            };

            // Check if session needs refresh due to inactivity
            const inactivityLimit = new Date(
              Date.now() - this.config.inactivityTimeout * 60 * 1000,
            );
            const requiresRefresh = session.lastActivity < inactivityLimit;

            if (requiresRefresh) {
              return {
                isValid: false,
                reason: 'Session expired due to inactivity',
                requiresRefresh: true,
              };
            }

            // Update last activity
            await this.updateSessionActivity(session.id);

            return { isValid: true, session };
          }
        } catch (_decryptError) {}
      }

      return { isValid: false, reason: 'Invalid session token' };
    } catch (error) {
      return {
        isValid: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Refresh a session (extend expiration and update activity)
   */
  async refreshSession(sessionId: string): Promise<SessionData | null> {
    try {
      const newExpiresAt = new Date(
        Date.now() + this.config.sessionTimeout * 60 * 1000,
      );

      const { data, error } = await this.supabase
        .from('patient_portal_sessions')
        .update({
          expires_at: newExpiresAt.toISOString(),
          last_activity: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error || !data) {
        return null;
      }

      // Decrypt session token for return
      const decryptedToken = await this.encryption.decrypt(data.session_token);

      return {
        id: data.id,
        patientId: data.patient_id,
        sessionToken: decryptedToken,
        expiresAt: new Date(data.expires_at),
        lastActivity: new Date(data.last_activity),
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        deviceFingerprint: data.device_fingerprint,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
      };
    } catch (_error) {
      return null;
    }
  }

  /**
   * Terminate a specific session
   */
  async terminateSession(sessionId: string, reason?: string): Promise<boolean> {
    try {
      // Get session details before termination
      const { data: sessionData } = await this.supabase
        .from('patient_portal_sessions')
        .select('patient_id, ip_address, user_agent')
        .eq('id', sessionId)
        .single();

      const { error } = await this.supabase
        .from('patient_portal_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) {
        return false;
      }

      // Log session termination
      if (sessionData) {
        await this.auditLogger.log({
          action: 'session_terminated',
          userId: sessionData.patient_id,
          userType: 'patient',
          resource: 'patient_portal_session',
          resourceId: sessionId,
          details: {
            reason: reason || 'Manual termination',
            ipAddress: sessionData.ip_address,
          },
          ipAddress: sessionData.ip_address,
          userAgent: sessionData.user_agent,
        });

        // Log security event
        await this.logSecurityEvent({
          eventType: 'logout',
          patientId: sessionData.patient_id,
          sessionId,
          ipAddress: sessionData.ip_address,
          userAgent: sessionData.user_agent,
          details: { reason: reason || 'Manual termination' },
          severity: 'low',
        });
      }

      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Terminate all sessions for a patient
   */
  async terminateAllSessions(
    patientId: string,
    excludeSessionId?: string,
  ): Promise<number> {
    try {
      let query = this.supabase
        .from('patient_portal_sessions')
        .update({ is_active: false })
        .eq('patient_id', patientId)
        .eq('is_active', true);

      if (excludeSessionId) {
        query = query.neq('id', excludeSessionId);
      }

      const { error, count } = await query;

      if (error) {
        throw new Error(`Failed to terminate sessions: ${error.message}`);
      }

      // Log bulk session termination
      await this.auditLogger.log({
        action: 'bulk_session_termination',
        userId: patientId,
        userType: 'patient',
        resource: 'patient_portal_session',
        details: {
          terminatedCount: count || 0,
          excludedSession: excludeSessionId,
        },
      });

      return count || 0;
    } catch (_error) {
      return 0;
    }
  }

  /**
   * Get active sessions for a patient
   */
  async getActiveSessions(patientId: string): Promise<SessionData[]> {
    try {
      const { data, error } = await this.supabase
        .from('patient_portal_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('last_activity', { ascending: false });

      if (error) {
        throw new Error(`Failed to get active sessions: ${error.message}`);
      }

      const sessions: SessionData[] = [];
      for (const sessionRecord of data || []) {
        try {
          const decryptedToken = await this.encryption.decrypt(
            sessionRecord.session_token,
          );
          sessions.push({
            id: sessionRecord.id,
            patientId: sessionRecord.patient_id,
            sessionToken: decryptedToken,
            expiresAt: new Date(sessionRecord.expires_at),
            lastActivity: new Date(sessionRecord.last_activity),
            ipAddress: sessionRecord.ip_address,
            userAgent: sessionRecord.user_agent,
            deviceFingerprint: sessionRecord.device_fingerprint,
            isActive: sessionRecord.is_active,
            createdAt: new Date(sessionRecord.created_at),
          });
        } catch (_decryptError) {}
      }

      return sessions;
    } catch (_error) {
      return [];
    }
  }

  /**
   * Generate device fingerprint hash
   */
  generateDeviceFingerprint(
    fingerprintData: Omit<DeviceFingerprint, 'hash'>,
  ): DeviceFingerprint {
    const dataString = JSON.stringify(fingerprintData);
    const hash = crypto.createHash('sha256').update(dataString).digest('hex');

    return {
      ...fingerprintData,
      hash,
    };
  }

  /**
   * Log session activity
   */
  async logActivity(activity: SessionActivity): Promise<void> {
    try {
      await this.supabase.from('patient_portal_activity').insert({
        patient_id: activity.sessionId, // This should be mapped to patient_id
        session_id: activity.sessionId,
        activity_type: activity.activityType,
        description: `Session activity: ${activity.activityType}`,
        metadata: activity.details || {},
        ip_address: activity.ipAddress,
        user_agent: activity.userAgent,
        timestamp: activity.timestamp.toISOString(),
      });
    } catch (_error) {}
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const { error, count } = await this.supabase
        .from('patient_portal_sessions')
        .delete()
        .or(
          `expires_at.lt.${new Date().toISOString()},last_activity.lt.${new Date(Date.now() - this.config.inactivityTimeout * 60 * 1000).toISOString()}`,
        );

      if (error) {
        return 0;
      }

      if (count && count > 0) {
        await this.auditLogger.log({
          action: 'session_cleanup',
          userId: 'system',
          userType: 'system',
          resource: 'patient_portal_session',
          details: {
            cleanedUpCount: count,
            cleanupReason: 'Expired or inactive sessions',
          },
        });
      }

      return count || 0;
    } catch (_error) {
      return 0;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStatistics(): Promise<{
    totalActiveSessions: number;
    sessionsByPatient: Record<string, number>;
    averageSessionDuration: number;
    recentLogins: number;
  }> {
    try {
      const { data: activeSessions } = await this.supabase
        .from('patient_portal_sessions')
        .select('patient_id, created_at, last_activity')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());

      const sessionsByPatient: Record<string, number> = {};
      let totalDuration = 0;
      let recentLogins = 0;
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      for (const session of activeSessions || []) {
        // Count sessions by patient
        sessionsByPatient[session.patient_id] =
          (sessionsByPatient[session.patient_id] || 0) + 1;

        // Calculate session duration
        const duration =
          new Date(session.last_activity).getTime() -
          new Date(session.created_at).getTime();
        totalDuration += duration;

        // Count recent logins
        if (new Date(session.created_at) > oneHourAgo) {
          recentLogins++;
        }
      }

      const averageSessionDuration = activeSessions?.length
        ? totalDuration / activeSessions.length / (1000 * 60)
        : 0; // in minutes

      return {
        totalActiveSessions: activeSessions?.length || 0,
        sessionsByPatient,
        averageSessionDuration: Math.round(averageSessionDuration),
        recentLogins,
      };
    } catch (_error) {
      return {
        totalActiveSessions: 0,
        sessionsByPatient: {},
        averageSessionDuration: 0,
        recentLogins: 0,
      };
    }
  }

  /**
   * Destroy the session manager and cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  // Private helper methods

  private generateSessionToken(): string {
    return crypto.randomBytes(this.config.sessionTokenLength).toString('hex');
  }

  private async enforceSessionLimits(patientId: string): Promise<void> {
    const activeSessions = await this.getActiveSessions(patientId);

    if (activeSessions.length >= this.config.maxConcurrentSessions) {
      // Terminate oldest sessions
      const sessionsToTerminate = activeSessions
        .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())
        .slice(
          0,
          activeSessions.length - this.config.maxConcurrentSessions + 1,
        );

      for (const session of sessionsToTerminate) {
        await this.terminateSession(session.id, 'Session limit exceeded');
      }
    }
  }

  private async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      await this.supabase
        .from('patient_portal_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (_error) {}
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(
      async () => {
        await this.cleanupExpiredSessions();
      },
      this.config.sessionCleanupInterval * 60 * 1000,
    );
  }

  private async logSecurityEvent(event: {
    eventType: string;
    patientId: string;
    sessionId?: string;
    ipAddress: string;
    userAgent: string;
    details?: Record<string, any>;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    try {
      await this.supabase.from('patient_security_events').insert({
        event_type: event.eventType,
        patient_id: event.patientId,
        session_id: event.sessionId,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        details: event.details || {},
        severity: event.severity,
        timestamp: new Date().toISOString(),
      });
    } catch (_error) {}
  }
}
