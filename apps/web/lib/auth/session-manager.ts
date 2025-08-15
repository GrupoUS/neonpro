/**
 * Session Manager - Core Session Management System
 * Handles intelligent session timeout, concurrent sessions, device tracking, and security monitoring
 */

import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { EventEmitter } from 'events';
import {
  UserSession,
  SessionSecurityEvent,
  DeviceRegistration,
  SessionAuditLog,
  SessionPolicy,
  SessionConfiguration,
  SuspiciousActivity,
  CrossDeviceSync,
  SecurityEventType,
  SecuritySeverity,
  SessionAction,
  SecurityLevel,
  SuspiciousActivityType,
  SessionValidationResult,
  SessionManagerConfig,
  EmergencySessionControls,
  SessionEventHandlers,
  DeviceType
} from '@/types/session';
import { Database } from '@/types/supabase';
import { createHash, randomBytes, createHmac } from 'crypto';
import { UAParser } from 'ua-parser-js';

export class SessionManager extends EventEmitter {
  private supabase: ReturnType<typeof createClient<Database>>;
  private redis: Redis;
  private config: SessionManagerConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private securityMonitor: SecurityMonitor;
  private deviceTracker: DeviceTracker;
  private suspiciousActivityDetector: SuspiciousActivityDetector;
  private emergencyControls: EmergencySessionControls | null = null;

  constructor(config: SessionManagerConfig) {
    super();
    this.config = config;
    this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    this.redis = new Redis(config.redis.url);
    this.securityMonitor = new SecurityMonitor(this.supabase, this.redis);
    this.deviceTracker = new DeviceTracker(this.supabase, this.redis);
    this.suspiciousActivityDetector = new SuspiciousActivityDetector(this.supabase, this.redis);
    
    this.initializeCleanupInterval();
    this.setupEventHandlers();
  }

  /**
   * Create a new session with comprehensive security checks
   */
  async createSession(
    userId: string,
    deviceFingerprint: string,
    ipAddress: string,
    userAgent: string,
    additionalData?: Record<string, any>
  ): Promise<UserSession> {
    try {
      // Check emergency controls
      if (this.emergencyControls?.global_kill_switch) {
        throw new Error('System is in emergency lockdown mode');
      }

      // Get user role and session policy
      const userRole = await this.getUserRole(userId);
      const policy = await this.getSessionPolicy(userRole.id);
      
      // Check concurrent session limits
      await this.enforceConcurrentSessionLimits(userId, policy);
      
      // Validate device and detect suspicious activity
      const deviceInfo = await this.deviceTracker.validateDevice(userId, deviceFingerprint, userAgent);
      const suspiciousActivity = await this.suspiciousActivityDetector.analyzeLoginAttempt(
        userId, ipAddress, deviceFingerprint, userAgent
      );
      
      if (suspiciousActivity.risk_score > 80) {
        await this.logSecurityEvent({
          session_id: '',
          user_id: userId,
          event_type: SecurityEventType.SUSPICIOUS_ACTIVITY,
          severity: SecuritySeverity.HIGH,
          details: suspiciousActivity,
          ip_address: ipAddress,
          user_agent: userAgent
        });
        throw new Error('Login blocked due to suspicious activity');
      }
      
      // Create session
      const sessionId = this.generateSessionId();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (policy.session_timeout_minutes * 60 * 1000));
      
      const session: UserSession = {
        id: sessionId,
        user_id: userId,
        device_fingerprint: deviceFingerprint,
        device_name: deviceInfo.device_name,
        ip_address: ipAddress,
        user_agent: userAgent,
        location: await this.getLocationFromIP(ipAddress),
        created_at: now,
        last_activity: now,
        expires_at: expiresAt,
        is_active: true,
        security_score: Math.max(0, 100 - suspiciousActivity.risk_score),
        session_data: additionalData || {}
      };
      
      // Store in database and Redis
      await this.storeSession(session);
      await this.cacheSession(session);
      
      // Log session creation
      await this.logAuditEvent({
        session_id: sessionId,
        user_id: userId,
        action: SessionAction.CREATE,
        details: { device_fingerprint: deviceFingerprint, security_score: session.security_score },
        ip_address: ipAddress,
        user_agent: userAgent,
        success: true
      });
      
      // Emit session created event
      this.emit('sessionCreated', session);
      
      return session;
    } catch (error) {
      await this.logAuditEvent({
        session_id: '',
        user_id: userId,
        action: SessionAction.CREATE,
        details: { error: error.message },
        ip_address: ipAddress,
        user_agent: userAgent,
        success: false,
        error_message: error.message
      });
      throw error;
    }
  }

  /**
   * Validate session with security checks
   */
  async validateSession(sessionId: string, ipAddress?: string, userAgent?: string): Promise<SessionValidationResult> {
    try {
      // Check emergency controls
      if (this.emergencyControls?.global_kill_switch) {
        return {
          valid: false,
          errors: ['System is in emergency lockdown mode'],
          security_score: 0
        };
      }

      // Get session from cache first, then database
      let session = await this.getCachedSession(sessionId);
      if (!session) {
        session = await this.getSessionFromDatabase(sessionId);
        if (session) {
          await this.cacheSession(session);
        }
      }
      
      if (!session || !session.is_active) {
        return {
          valid: false,
          errors: ['Session not found or inactive'],
          security_score: 0
        };
      }
      
      // Check expiration
      if (new Date() > session.expires_at) {
        await this.expireSession(sessionId);
        return {
          valid: false,
          errors: ['Session expired'],
          security_score: 0
        };
      }
      
      // Security validation
      const securityChecks = await this.performSecurityChecks(session, ipAddress, userAgent);
      
      if (!securityChecks.passed) {
        await this.logSecurityEvent({
          session_id: sessionId,
          user_id: session.user_id,
          event_type: SecurityEventType.SESSION_HIJACK_ATTEMPT,
          severity: SecuritySeverity.HIGH,
          details: securityChecks.violations,
          ip_address: ipAddress || '',
          user_agent: userAgent || ''
        });
        
        return {
          valid: false,
          errors: securityChecks.violations,
          security_score: securityChecks.security_score,
          warnings: ['Security violations detected']
        };
      }
      
      // Update last activity
      await this.updateSessionActivity(sessionId);
      
      return {
        valid: true,
        session,
        security_score: securityChecks.security_score
      };
    } catch (error) {
      return {
        valid: false,
        errors: [error.message],
        security_score: 0
      };
    }
  }

  /**
   * Extend session with activity-based logic
   */
  async extendSession(sessionId: string, additionalMinutes?: number): Promise<UserSession> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    const userRole = await this.getUserRole(session.user_id);
    const policy = await this.getSessionPolicy(userRole.id);
    
    const extensionMinutes = additionalMinutes || policy.session_timeout_minutes;
    const newExpiresAt = new Date(Date.now() + (extensionMinutes * 60 * 1000));
    
    const updatedSession = {
      ...session,
      expires_at: newExpiresAt,
      last_activity: new Date()
    };
    
    await this.updateSession(updatedSession);
    await this.cacheSession(updatedSession);
    
    await this.logAuditEvent({
      session_id: sessionId,
      user_id: session.user_id,
      action: SessionAction.EXTEND,
      details: { extension_minutes: extensionMinutes },
      ip_address: session.ip_address,
      user_agent: session.user_agent,
      success: true
    });
    
    return updatedSession;
  }

  /**
   * Terminate session
   */
  async terminateSession(sessionId: string, reason?: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return;
    }
    
    // Mark as inactive
    await this.updateSession({ ...session, is_active: false });
    await this.removeCachedSession(sessionId);
    
    await this.logAuditEvent({
      session_id: sessionId,
      user_id: session.user_id,
      action: SessionAction.TERMINATE,
      details: { reason: reason || 'Manual termination' },
      ip_address: session.ip_address,
      user_agent: session.user_agent,
      success: true
    });
    
    await this.logSecurityEvent({
      session_id: sessionId,
      user_id: session.user_id,
      event_type: SecurityEventType.SESSION_TERMINATED,
      severity: SecuritySeverity.LOW,
      details: { reason },
      ip_address: session.ip_address,
      user_agent: session.user_agent
    });
    
    this.emit('sessionTerminated', session);
  }

  /**
   * Get active sessions for user
   */
  async getUserActiveSessions(userId: string): Promise<UserSession[]> {
    const { data, error } = await this.supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_activity', { ascending: false });
    
    if (error) throw error;
    
    return data.map(this.mapDatabaseRowToSession);
  }

  /**
   * Emergency session controls
   */
  async activateEmergencyControls(controls: Partial<EmergencySessionControls>, initiatedBy: string): Promise<void> {
    this.emergencyControls = {
      global_kill_switch: false,
      lockdown_mode: false,
      emergency_access_enabled: false,
      incident_response_active: false,
      ...controls,
      initiated_by: initiatedBy,
      initiated_at: new Date()
    };
    
    if (controls.global_kill_switch) {
      await this.terminateAllSessions('Emergency kill switch activated');
    }
    
    // Store emergency controls in Redis
    await this.redis.set(
      `${this.config.redis.prefix}emergency_controls`,
      JSON.stringify(this.emergencyControls),
      'EX',
      3600 // 1 hour expiry
    );
    
    this.emit('emergencyControlsActivated', this.emergencyControls);
  }

  /**
   * Cross-device session synchronization
   */
  async syncCrossDeviceSessions(userId: string): Promise<CrossDeviceSync> {
    const activeSessions = await this.getUserActiveSessions(userId);
    const devices = await this.deviceTracker.getUserDevices(userId);
    
    // Get user preferences and UI state
    const { data: userPrefs } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    const syncData: CrossDeviceSync = {
      user_id: userId,
      sync_data: {
        preferences: userPrefs?.preferences || {},
        ui_state: userPrefs?.ui_state || {},
        notifications: [], // TODO: Implement notifications
        last_sync: new Date()
      },
      devices: devices.map(device => ({
        device_fingerprint: device.device_fingerprint,
        last_sync: device.last_used,
        sync_status: 'synced'
      }))
    };
    
    // Cache sync data
    await this.redis.set(
      `${this.config.redis.prefix}sync:${userId}`,
      JSON.stringify(syncData),
      'EX',
      300 // 5 minutes
    );
    
    return syncData;
  }

  // Private helper methods
  private generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  private async getUserRole(userId: string) {
    const { data, error } = await this.supabase
      .from('user_roles')
      .select('role_id, roles(id, name)')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data.roles;
  }

  private async getSessionPolicy(roleId: string): Promise<SessionPolicy> {
    const { data, error } = await this.supabase
      .from('session_policies')
      .select('*')
      .eq('role_id', roleId)
      .single();
    
    if (error) {
      // Return default policy
      return {
        id: 'default',
        role_id: roleId,
        role_name: 'default',
        max_concurrent_sessions: 3,
        session_timeout_minutes: 30,
        idle_timeout_minutes: 15,
        require_device_registration: false,
        allow_concurrent_devices: true,
        security_level: SecurityLevel.STANDARD,
        ip_restriction_enabled: false,
        geo_restriction_enabled: false,
        created_at: new Date(),
        updated_at: new Date()
      };
    }
    
    return this.mapDatabaseRowToSessionPolicy(data);
  }

  private async enforceConcurrentSessionLimits(userId: string, policy: SessionPolicy): Promise<void> {
    const activeSessions = await this.getUserActiveSessions(userId);
    
    if (activeSessions.length >= policy.max_concurrent_sessions) {
      // Terminate oldest session
      const oldestSession = activeSessions[activeSessions.length - 1];
      await this.terminateSession(oldestSession.id, 'Concurrent session limit exceeded');
      
      await this.logSecurityEvent({
        session_id: oldestSession.id,
        user_id: userId,
        event_type: SecurityEventType.CONCURRENT_LIMIT_EXCEEDED,
        severity: SecuritySeverity.MEDIUM,
        details: { limit: policy.max_concurrent_sessions, terminated_session: oldestSession.id },
        ip_address: oldestSession.ip_address,
        user_agent: oldestSession.user_agent
      });
    }
  }

  private async getLocationFromIP(ipAddress: string): Promise<any> {
    // TODO: Implement IP geolocation
    return null;
  }

  private async storeSession(session: UserSession): Promise<void> {
    const { error } = await this.supabase
      .from('user_sessions')
      .insert(this.mapSessionToDatabaseRow(session));
    
    if (error) throw error;
  }

  private async cacheSession(session: UserSession): Promise<void> {
    await this.redis.set(
      `${this.config.redis.prefix}session:${session.id}`,
      JSON.stringify(session),
      'EX',
      Math.floor((session.expires_at.getTime() - Date.now()) / 1000)
    );
  }

  private async getCachedSession(sessionId: string): Promise<UserSession | null> {
    const cached = await this.redis.get(`${this.config.redis.prefix}session:${sessionId}`);
    return cached ? JSON.parse(cached) : null;
  }

  private async getSessionFromDatabase(sessionId: string): Promise<UserSession | null> {
    const { data, error } = await this.supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('is_active', true)
      .single();
    
    if (error) return null;
    return this.mapDatabaseRowToSession(data);
  }

  private async getSession(sessionId: string): Promise<UserSession | null> {
    let session = await this.getCachedSession(sessionId);
    if (!session) {
      session = await this.getSessionFromDatabase(sessionId);
      if (session) {
        await this.cacheSession(session);
      }
    }
    return session;
  }

  private async updateSession(session: UserSession): Promise<void> {
    const { error } = await this.supabase
      .from('user_sessions')
      .update(this.mapSessionToDatabaseRow(session))
      .eq('id', session.id);
    
    if (error) throw error;
  }

  private async updateSessionActivity(sessionId: string): Promise<void> {
    const now = new Date();
    
    // Update in database
    await this.supabase
      .from('user_sessions')
      .update({ last_activity: now.toISOString() })
      .eq('id', sessionId);
    
    // Update in cache
    const cached = await this.getCachedSession(sessionId);
    if (cached) {
      cached.last_activity = now;
      await this.cacheSession(cached);
    }
  }

  private async removeCachedSession(sessionId: string): Promise<void> {
    await this.redis.del(`${this.config.redis.prefix}session:${sessionId}`);
  }

  private async expireSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      await this.updateSession({ ...session, is_active: false });
      await this.removeCachedSession(sessionId);
      
      await this.logAuditEvent({
        session_id: sessionId,
        user_id: session.user_id,
        action: SessionAction.EXPIRE,
        details: { expired_at: new Date() },
        ip_address: session.ip_address,
        user_agent: session.user_agent,
        success: true
      });
      
      this.emit('sessionExpired', session);
    }
  }

  private async performSecurityChecks(session: UserSession, ipAddress?: string, userAgent?: string) {
    const violations: string[] = [];
    let securityScore = session.security_score;
    
    // IP address validation
    if (ipAddress && ipAddress !== session.ip_address) {
      violations.push('IP address mismatch');
      securityScore -= 20;
    }
    
    // User agent validation
    if (userAgent && userAgent !== session.user_agent) {
      violations.push('User agent mismatch');
      securityScore -= 15;
    }
    
    // Check for suspicious activity
    if (ipAddress) {
      const suspiciousActivity = await this.suspiciousActivityDetector.analyzeSessionActivity(
        session.user_id, session.id, ipAddress, userAgent || ''
      );
      
      if (suspiciousActivity.risk_score > 50) {
        violations.push('Suspicious activity detected');
        securityScore -= suspiciousActivity.risk_score;
      }
    }
    
    return {
      passed: violations.length === 0 && securityScore > 30,
      violations,
      security_score: Math.max(0, securityScore)
    };
  }

  private async logSecurityEvent(event: Omit<SessionSecurityEvent, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    const securityEvent: SessionSecurityEvent = {
      id: randomBytes(16).toString('hex'),
      timestamp: new Date(),
      resolved: false,
      ...event
    };
    
    await this.supabase
      .from('session_security_events')
      .insert(this.mapSecurityEventToDatabaseRow(securityEvent));
    
    this.emit('securityEvent', securityEvent);
  }

  private async logAuditEvent(event: Omit<SessionAuditLog, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: SessionAuditLog = {
      id: randomBytes(16).toString('hex'),
      timestamp: new Date(),
      ...event
    };
    
    await this.supabase
      .from('session_audit_logs')
      .insert(this.mapAuditEventToDatabaseRow(auditEvent));
  }

  private async terminateAllSessions(reason: string): Promise<void> {
    const { data: sessions } = await this.supabase
      .from('user_sessions')
      .select('*')
      .eq('is_active', true);
    
    if (sessions) {
      for (const session of sessions) {
        await this.terminateSession(session.id, reason);
      }
    }
  }

  private initializeCleanupInterval(): void {
    this.cleanupInterval = setInterval(async () => {
      await this.cleanupExpiredSessions();
    }, this.config.policies.cleanup_interval_minutes * 60 * 1000);
  }

  private async cleanupExpiredSessions(): Promise<void> {
    const { data: expiredSessions } = await this.supabase
      .from('user_sessions')
      .select('*')
      .eq('is_active', true)
      .lt('expires_at', new Date().toISOString());
    
    if (expiredSessions) {
      for (const session of expiredSessions) {
        await this.expireSession(session.id);
      }
      
      this.emit('sessionCleanup', expiredSessions.map(this.mapDatabaseRowToSession));
    }
  }

  private setupEventHandlers(): void {
    this.on('sessionCreated', (session: UserSession) => {
      console.log(`Session created for user ${session.user_id}: ${session.id}`);
    });
    
    this.on('sessionExpired', (session: UserSession) => {
      console.log(`Session expired for user ${session.user_id}: ${session.id}`);
    });
    
    this.on('securityEvent', (event: SessionSecurityEvent) => {
      console.log(`Security event: ${event.event_type} - ${event.severity}`);
    });
  }

  // Mapping functions
  private mapSessionToDatabaseRow(session: UserSession): any {
    return {
      id: session.id,
      user_id: session.user_id,
      device_fingerprint: session.device_fingerprint,
      device_name: session.device_name,
      ip_address: session.ip_address,
      user_agent: session.user_agent,
      location_data: session.location,
      created_at: session.created_at.toISOString(),
      last_activity: session.last_activity.toISOString(),
      expires_at: session.expires_at.toISOString(),
      is_active: session.is_active,
      security_score: session.security_score,
      session_data: session.session_data
    };
  }

  private mapDatabaseRowToSession(row: any): UserSession {
    return {
      id: row.id,
      user_id: row.user_id,
      device_fingerprint: row.device_fingerprint,
      device_name: row.device_name,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      location: row.location_data,
      created_at: new Date(row.created_at),
      last_activity: new Date(row.last_activity),
      expires_at: new Date(row.expires_at),
      is_active: row.is_active,
      security_score: row.security_score,
      session_data: row.session_data
    };
  }

  private mapDatabaseRowToSessionPolicy(row: any): SessionPolicy {
    return {
      id: row.id,
      role_id: row.role_id,
      role_name: row.role_name,
      max_concurrent_sessions: row.max_concurrent_sessions,
      session_timeout_minutes: row.session_timeout_minutes,
      idle_timeout_minutes: row.idle_timeout_minutes,
      require_device_registration: row.require_device_registration,
      allow_concurrent_devices: row.allow_concurrent_devices,
      security_level: row.security_level,
      ip_restriction_enabled: row.ip_restriction_enabled,
      allowed_ip_ranges: row.allowed_ip_ranges,
      geo_restriction_enabled: row.geo_restriction_enabled,
      allowed_countries: row.allowed_countries,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  private mapSecurityEventToDatabaseRow(event: SessionSecurityEvent): any {
    return {
      id: event.id,
      session_id: event.session_id,
      user_id: event.user_id,
      event_type: event.event_type,
      severity: event.severity,
      details: event.details,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      timestamp: event.timestamp.toISOString(),
      resolved: event.resolved,
      resolution_notes: event.resolution_notes
    };
  }

  private mapAuditEventToDatabaseRow(event: SessionAuditLog): any {
    return {
      id: event.id,
      session_id: event.session_id,
      user_id: event.user_id,
      action: event.action,
      details: event.details,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      timestamp: event.timestamp.toISOString(),
      success: event.success,
      error_message: event.error_message
    };
  }

  // Cleanup
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.redis.disconnect();
    this.removeAllListeners();
  }
}

// Helper classes (to be implemented in separate files)
class SecurityMonitor {
  constructor(private supabase: any, private redis: Redis) {}
  
  async monitorSession(sessionId: string): Promise<void> {
    // TODO: Implement real-time security monitoring
  }
}

class DeviceTracker {
  constructor(private supabase: any, private redis: Redis) {}
  
  async validateDevice(userId: string, deviceFingerprint: string, userAgent: string): Promise<any> {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    return {
      device_name: `${result.browser.name} on ${result.os.name}`,
      device_type: this.getDeviceType(result),
      trusted: false // TODO: Implement device trust logic
    };
  }
  
  async getUserDevices(userId: string): Promise<DeviceRegistration[]> {
    const { data } = await this.supabase
      .from('device_registrations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    return data || [];
  }
  
  private getDeviceType(result: any): DeviceType {
    if (result.device.type === 'mobile') return DeviceType.MOBILE;
    if (result.device.type === 'tablet') return DeviceType.TABLET;
    return DeviceType.DESKTOP;
  }
}

class SuspiciousActivityDetector {
  constructor(private supabase: any, private redis: Redis) {}
  
  async analyzeLoginAttempt(userId: string, ipAddress: string, deviceFingerprint: string, userAgent: string): Promise<SuspiciousActivity> {
    // TODO: Implement sophisticated suspicious activity detection
    return {
      id: randomBytes(16).toString('hex'),
      user_id: userId,
      activity_type: SuspiciousActivityType.NEW_DEVICE_LOGIN,
      risk_score: 25, // Low risk by default
      details: {
        ip_address: ipAddress,
        device_fingerprint: deviceFingerprint,
        user_agent: userAgent
      },
      detected_at: new Date(),
      auto_resolved: false,
      manual_review_required: false,
      status: 'pending'
    };
  }
  
  async analyzeSessionActivity(userId: string, sessionId: string, ipAddress: string, userAgent: string): Promise<SuspiciousActivity> {
    // TODO: Implement session activity analysis
    return {
      id: randomBytes(16).toString('hex'),
      user_id: userId,
      session_id: sessionId,
      activity_type: SuspiciousActivityType.BEHAVIORAL_ANOMALY,
      risk_score: 10, // Very low risk by default
      details: {
        ip_address: ipAddress,
        user_agent: userAgent
      },
      detected_at: new Date(),
      auto_resolved: true,
      manual_review_required: false,
      status: 'resolved'
    };
  }
}

export { SecurityMonitor, DeviceTracker, SuspiciousActivityDetector };