/**
 * Session Management Service
 * Story 1.4: Session Management & Security
 * 
 * Comprehensive session management with security monitoring,
 * device tracking, and LGPD compliance.
 */

import { createClient } from '@/lib/supabase/client';
import { 
  UserSession, 
  SessionSecurityEvent, 
  DeviceRegistration,
  SessionAuditLog,
  SessionPolicy,
  SecurityEventType,
  SecuritySeverity,
} from '@/types/session';

// Re-export types that are needed elsewhere
export {
  SessionAction,
  DeviceType,
  SecurityLevel
} from '@/types/session';

import {
  CreateSessionRequest,
  UpdateSessionRequest,
  SessionFilter,
  SessionSort,
  SessionAnalytics,
  SessionConfig,
  SecurityThresholds
} from '@/types/session';
import { logger } from '@/lib/logger';

// ============================================================================
// SESSION MANAGEMENT CLASS
// ============================================================================

export class SessionManager {
  private supabase = createClient();
  private config: SessionConfig;
  private securityThresholds: SecurityThresholds;

  constructor() {
    this.config = {
      default_timeout_minutes: 30,
      max_concurrent_sessions: 5,
      security_monitoring_enabled: true,
      device_fingerprinting_enabled: true,
      geo_location_tracking: true,
      audit_logging_enabled: true,
      cleanup_interval_hours: 24,
      threat_intelligence_enabled: true
    };

    this.securityThresholds = {
      suspicious_login_attempts: 5,
      rapid_request_limit: 100,
      unusual_location_score: 70,
      device_change_score: 60,
      concurrent_session_penalty: 20,
      ip_change_score: 50
    };
  }

  // ============================================================================
  // CORE SESSION OPERATIONS
  // ============================================================================

  /**
   * Create a new user session with security validation
   */
  async createSession(request: CreateSessionRequest): Promise<UserSession> {
    try {
      // Validate device and security
      const deviceInfo = await this.validateDevice(request.user_id, request.device_fingerprint);
      const securityScore = await this.calculateSecurityScore(request);
      
      // Check concurrent session limits
      await this.enforceConcurrentSessionLimits(request.user_id);
      
      // Create session record
      const sessionData: Partial<UserSession> = {
        user_id: request.user_id,
        device_fingerprint: request.device_fingerprint,
        device_name: request.device_name,
        ip_address: request.ip_address,
        user_agent: request.user_agent,
        location: request.location,
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        expires_at: this.calculateExpiryTime(request.user_id),
        is_active: true,
        security_score: securityScore
      };

      const { data: session, error } = await this.supabase
        .from('user_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      // Log session creation
      await this.logSessionAction(session.id, request.user_id, SessionAction.LOGIN, {
        device_fingerprint: request.device_fingerprint,
        ip_address: request.ip_address,
        security_score: securityScore
      });

      // Monitor for suspicious activity
      if (this.config.security_monitoring_enabled) {
        await this.monitorSessionSecurity(session);
      }

      logger.info('Session created successfully', { 
        session_id: session.id, 
        user_id: request.user_id,
        security_score: securityScore
      });

      return session;
    } catch (error) {
      logger.error('Failed to create session', { error, request });
      throw error;
    }
  }

  /**
   * Update session activity and security score
   */
  async updateSession(sessionId: string, updates: UpdateSessionRequest): Promise<UserSession> {
    try {
      const updateData = {
        ...updates,
        last_activity: new Date().toISOString()
      };

      const { data: session, error } = await this.supabase
        .from('user_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .eq('is_active', true)
        .select()
        .single();

      if (error) throw error;

      // Extend session if activity detected
      if (updates.last_activity) {
        await this.extendSessionIfNeeded(sessionId);
      }

      return session;
    } catch (error) {
      logger.error('Failed to update session', { error, sessionId, updates });
      throw error;
    }
  }

  /**
   * Terminate a session
   */
  async terminateSession(sessionId: string, reason: string = 'user_logout'): Promise<void> {
    try {
      const { data: session } = await this.supabase
        .from('user_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single();

      if (!session) throw new Error('Session not found');

      // Mark session as inactive
      const { error } = await this.supabase
        .from('user_sessions')
        .update({ 
          is_active: false,
          expires_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Log session termination
      await this.logSessionAction(sessionId, session.user_id, SessionAction.LOGOUT, {
        reason,
        terminated_at: new Date().toISOString()
      });

      logger.info('Session terminated', { session_id: sessionId, reason });
    } catch (error) {
      logger.error('Failed to terminate session', { error, sessionId, reason });
      throw error;
    }
  }

  // ============================================================================
  // SECURITY MONITORING
  // ============================================================================

  /**
   * Monitor session for suspicious activity
   */
  private async monitorSessionSecurity(session: UserSession): Promise<void> {
    try {
      const suspiciousEvents: SecurityEventType[] = [];
      
      // Check for unusual location
      if (await this.isUnusualLocation(session.user_id, session.ip_address)) {
        suspiciousEvents.push(SecurityEventType.UNUSUAL_LOCATION);
      }
      
      // Check for device changes
      if (await this.isNewDevice(session.user_id, session.device_fingerprint)) {
        suspiciousEvents.push(SecurityEventType.DEVICE_CHANGE);
      }
      
      // Check for rapid login attempts
      if (await this.hasRapidLoginAttempts(session.user_id)) {
        suspiciousEvents.push(SecurityEventType.RAPID_REQUESTS);
      }
      
      // Create security events for suspicious activity
      for (const eventType of suspiciousEvents) {
        await this.createSecurityEvent(session, eventType);
      }
      
      // Auto-terminate if critical security score
      if (session.security_score < 30) {
        await this.terminateSession(session.id, 'security_risk');
        await this.createSecurityEvent(session, SecurityEventType.SESSION_HIJACK_ATTEMPT, SecuritySeverity.CRITICAL);
      }
    } catch (error) {
      logger.error('Security monitoring failed', { error, session_id: session.id });
    }
  }

  /**
   * Calculate security score for session
   */
  private async calculateSecurityScore(request: CreateSessionRequest): Promise<number> {
    let score = 100; // Start with perfect score
    
    try {
      // Check device trust level
      const device = await this.getDeviceRegistration(request.user_id, request.device_fingerprint);
      if (!device?.trusted) score -= 20;
      
      // Check location consistency
      if (await this.isUnusualLocation(request.user_id, request.ip_address)) {
        score -= this.securityThresholds.unusual_location_score;
      }
      
      // Check for concurrent sessions
      const activeSessions = await this.getActiveSessionCount(request.user_id);
      if (activeSessions > 2) {
        score -= (activeSessions * this.securityThresholds.concurrent_session_penalty);
      }
      
      // Ensure score is within bounds
      return Math.max(0, Math.min(100, score));
    } catch (error) {
      logger.error('Security score calculation failed', { error, request });
      return 50; // Default moderate security score
    }
  }

  /**
   * Create security event record
   */
  private async createSecurityEvent(
    session: UserSession, 
    eventType: SecurityEventType, 
    severity: SecuritySeverity = SecuritySeverity.MEDIUM
  ): Promise<void> {
    try {
      const eventData: Partial<SessionSecurityEvent> = {
        session_id: session.id,
        user_id: session.user_id,
        event_type: eventType,
        severity,
        details: {
          ip_address: session.ip_address,
          device_fingerprint: session.device_fingerprint,
          security_score: session.security_score,
          timestamp: new Date().toISOString()
        },
        ip_address: session.ip_address,
        user_agent: session.user_agent,
        timestamp: new Date().toISOString(),
        resolved: false
      };

      const { error } = await this.supabase
        .from('session_security_events')
        .insert(eventData);

      if (error) throw error;

      logger.warn('Security event created', { 
        event_type: eventType, 
        severity, 
        session_id: session.id 
      });
    } catch (error) {
      logger.error('Failed to create security event', { error, eventType, session });
    }
  }

  // ============================================================================
  // DEVICE MANAGEMENT
  // ============================================================================

  /**
   * Validate and register device
   */
  private async validateDevice(userId: string, deviceFingerprint: string): Promise<DeviceRegistration | null> {
    try {
      let device = await this.getDeviceRegistration(userId, deviceFingerprint);
      
      if (!device) {
        // Register new device
        device = await this.registerDevice(userId, deviceFingerprint);
      } else {
        // Update last seen
        await this.updateDeviceLastSeen(device.id);
      }
      
      return device;
    } catch (error) {
      logger.error('Device validation failed', { error, userId, deviceFingerprint });
      return null;
    }
  }

  /**
   * Register a new device
   */
  private async registerDevice(userId: string, deviceFingerprint: string): Promise<DeviceRegistration> {
    try {
      const deviceData: Partial<DeviceRegistration> = {
        user_id: userId,
        device_fingerprint: deviceFingerprint,
        device_name: 'Unknown Device',
        device_type: DeviceType.UNKNOWN,
        browser_info: {
          name: 'Unknown',
          version: 'Unknown',
          platform: 'Unknown'
        },
        trusted: false,
        registered_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        blocked: false
      };

      const { data: device, error } = await this.supabase
        .from('device_registrations')
        .insert(deviceData)
        .select()
        .single();

      if (error) throw error;

      logger.info('New device registered', { device_id: device.id, user_id: userId });
      return device;
    } catch (error) {
      logger.error('Device registration failed', { error, userId, deviceFingerprint });
      throw error;
    }
  }

  /**
   * Get device registration
   */
  private async getDeviceRegistration(userId: string, deviceFingerprint: string): Promise<DeviceRegistration | null> {
    try {
      const { data: device } = await this.supabase
        .from('device_registrations')
        .select('*')
        .eq('user_id', userId)
        .eq('device_fingerprint', deviceFingerprint)
        .eq('blocked', false)
        .single();

      return device;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update device last seen timestamp
   */
  private async updateDeviceLastSeen(deviceId: string): Promise<void> {
    try {
      await this.supabase
        .from('device_registrations')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', deviceId);
    } catch (error) {
      logger.error('Failed to update device last seen', { error, deviceId });
    }
  }

  // ============================================================================
  // SESSION POLICY ENFORCEMENT
  // ============================================================================

  /**
   * Enforce concurrent session limits
   */
  private async enforceConcurrentSessionLimits(userId: string): Promise<void> {
    try {
      const policy = await this.getSessionPolicy(userId);
      const activeSessions = await this.getActiveSessions(userId);
      
      if (activeSessions.length >= policy.max_concurrent_sessions) {
        // Terminate oldest session
        const oldestSession = activeSessions.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )[0];
        
        await this.terminateSession(oldestSession.id, 'concurrent_limit_exceeded');
        
        logger.info('Terminated oldest session due to concurrent limit', {
          user_id: userId,
          terminated_session: oldestSession.id,
          limit: policy.max_concurrent_sessions
        });
      }
    } catch (error) {
      logger.error('Failed to enforce concurrent session limits', { error, userId });
    }
  }

  /**
   * Get session policy for user
   */
  private async getSessionPolicy(userId: string): Promise<SessionPolicy> {
    try {
      // Get user role
      const { data: user } = await this.supabase
        .from('users')
        .select('role_id')
        .eq('id', userId)
        .single();

      if (!user?.role_id) {
        throw new Error('User role not found');
      }

      // Get policy for role
      const { data: policy } = await this.supabase
        .from('session_policies')
        .select('*')
        .eq('role_id', user.role_id)
        .single();

      if (!policy) {
        // Return default policy
        return {
          id: 'default',
          role_id: user.role_id,
          role_name: 'default',
          max_concurrent_sessions: this.config.max_concurrent_sessions,
          timeout_minutes: this.config.default_timeout_minutes,
          security_level: SecurityLevel.STANDARD,
          require_mfa: false,
          allow_concurrent_devices: true,
          suspicious_activity_threshold: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      return policy;
    } catch (error) {
      logger.error('Failed to get session policy', { error, userId });
      throw error;
    }
  }

  /**
   * Calculate session expiry time based on user policy
   */
  private async calculateExpiryTime(userId: string): Promise<string> {
    try {
      const policy = await this.getSessionPolicy(userId);
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + policy.timeout_minutes);
      return expiryTime.toISOString();
    } catch (error) {
      logger.error('Failed to calculate expiry time', { error, userId });
      // Default to 30 minutes
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 30);
      return expiryTime.toISOString();
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get active sessions for user
   */
  private async getActiveSessions(userId: string): Promise<UserSession[]> {
    try {
      const { data: sessions, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;
      return sessions || [];
    } catch (error) {
      logger.error('Failed to get active sessions', { error, userId });
      return [];
    }
  }

  /**
   * Get active session count
   */
  private async getActiveSessionCount(userId: string): Promise<number> {
    const sessions = await this.getActiveSessions(userId);
    return sessions.length;
  }

  /**
   * Check if location is unusual for user
   */
  private async isUnusualLocation(userId: string, ipAddress: string): Promise<boolean> {
    try {
      // Get user's recent locations
      const { data: recentSessions } = await this.supabase
        .from('user_sessions')
        .select('ip_address, location')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .limit(10);

      if (!recentSessions || recentSessions.length === 0) {
        return false; // No history to compare
      }

      // Simple check: if IP is completely different from recent ones
      const recentIPs = recentSessions.map(s => s.ip_address);
      return !recentIPs.includes(ipAddress);
    } catch (error) {
      logger.error('Failed to check unusual location', { error, userId, ipAddress });
      return false;
    }
  }

  /**
   * Check if device is new for user
   */
  private async isNewDevice(userId: string, deviceFingerprint: string): Promise<boolean> {
    try {
      const device = await this.getDeviceRegistration(userId, deviceFingerprint);
      return !device;
    } catch (error) {
      logger.error('Failed to check new device', { error, userId, deviceFingerprint });
      return false;
    }
  }

  /**
   * Check for rapid login attempts
   */
  private async hasRapidLoginAttempts(userId: string): Promise<boolean> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: recentLogins, error } = await this.supabase
        .from('session_audit_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('action', SessionAction.LOGIN)
        .gte('timestamp', fiveMinutesAgo);

      if (error) throw error;
      
      return (recentLogins?.length || 0) > this.securityThresholds.suspicious_login_attempts;
    } catch (error) {
      logger.error('Failed to check rapid login attempts', { error, userId });
      return false;
    }
  }

  /**
   * Extend session if needed
   */
  private async extendSessionIfNeeded(sessionId: string): Promise<void> {
    try {
      const { data: session } = await this.supabase
        .from('user_sessions')
        .select('user_id, expires_at')
        .eq('id', sessionId)
        .single();

      if (!session) return;

      const now = new Date();
      const expiresAt = new Date(session.expires_at);
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      const fiveMinutes = 5 * 60 * 1000;

      // Extend if less than 5 minutes remaining
      if (timeUntilExpiry < fiveMinutes) {
        const newExpiryTime = await this.calculateExpiryTime(session.user_id);
        
        await this.supabase
          .from('user_sessions')
          .update({ expires_at: newExpiryTime })
          .eq('id', sessionId);

        logger.info('Session extended', { session_id: sessionId, new_expiry: newExpiryTime });
      }
    } catch (error) {
      logger.error('Failed to extend session', { error, sessionId });
    }
  }

  /**
   * Log session action for audit trail
   */
  private async logSessionAction(
    sessionId: string, 
    userId: string, 
    action: SessionAction, 
    details: Record<string, any>
  ): Promise<void> {
    try {
      const auditData: Partial<SessionAuditLog> = {
        session_id: sessionId,
        user_id: userId,
        action,
        details,
        ip_address: details.ip_address || 'unknown',
        user_agent: details.user_agent || 'unknown',
        timestamp: new Date().toISOString(),
        success: true
      };

      await this.supabase
        .from('session_audit_logs')
        .insert(auditData);
    } catch (error) {
      logger.error('Failed to log session action', { error, sessionId, action });
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const sessionManager = new SessionManager();

// ============================================================================
// UNIFIED SESSION SYSTEM (LEGACY COMPATIBILITY)
// ============================================================================

export class UnifiedSessionSystem {
  private sessionManager: SessionManager;

  constructor() {
    this.sessionManager = sessionManager;
  }

  async createSession(userId: string, deviceInfo?: Partial<DeviceRegistration>) {
    return this.sessionManager.createSession(userId, deviceInfo);
  }

  async validateSession(sessionToken: string) {
    return this.sessionManager.validateSession(sessionToken);
  }

  async terminateSession(sessionId: string) {
    return this.sessionManager.terminateSession(sessionId);
  }
}

