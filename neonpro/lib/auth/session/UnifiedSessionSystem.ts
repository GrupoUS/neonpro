/**
 * Unified Session Management System - Core Implementation
 * 
 * This is the main orchestrator for the complete session management system,
 * coordinating all session-related operations including timeout management,
 * device tracking, security monitoring, and LGPD compliance.
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SessionManager } from './SessionManager';
import { DeviceManager } from './DeviceManager';
import { SecurityEventLogger } from './SecurityEventLogger';
import { NotificationService } from './NotificationService';
import { DataCleanupService } from './DataCleanupService';
import { sessionConfig } from './config';
import {
  generateSessionToken,
  generateDeviceFingerprint,
  validateUUID,
  calculateRiskScore,
  formatDuration,
  removeUndefined,
  debounce
} from './utils';
import type {
  SessionConfig,
  DeviceConfig,
  SecurityConfig,
  SessionData,
  DeviceData,
  SecurityEvent,
  AuthenticationRequest,
  AuthenticationResponse,
  SessionValidationResult,
  SessionActivityUpdate,
  CleanupConfig,
  CleanupResult,
  SecurityThreatData,
  SecurityReport,
  SessionMetrics,
  DeviceStats,
  NotificationData
} from './types';

/**
 * Unified Session Management System
 * 
 * Central orchestrator for all session management operations including:
 * - Intelligent session timeout with role-based configuration
 * - Device-based session tracking and trust management
 * - Real-time security monitoring and threat detection
 * - Cross-device session synchronization
 * - LGPD-compliant audit logging
 * - Automatic cleanup and data management
 */
export class UnifiedSessionSystem {
  private supabase: SupabaseClient;
  private sessionManager: SessionManager;
  private deviceManager: DeviceManager;
  private securityLogger: SecurityEventLogger;
  private notificationService: NotificationService;
  private cleanupService: DataCleanupService;
  private config: {
    session: SessionConfig;
    device: DeviceConfig;
    security: SecurityConfig;
  };
  
  // Activity tracking for intelligent timeout
  private activityTrackers = new Map<string, NodeJS.Timeout>();
  private sessionWarnings = new Map<string, NodeJS.Timeout>();
  
  // Real-time monitoring
  private securityMonitor: NodeJS.Timeout | null = null;
  private cleanupScheduler: NodeJS.Timeout | null = null;

  constructor(config?: Partial<typeof sessionConfig>) {
    this.config = {
      session: { ...sessionConfig.session, ...config?.session },
      device: { ...sessionConfig.device, ...config?.device },
      security: { ...sessionConfig.security, ...config?.security }
    };

    // Initialize Supabase client
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Initialize core components
    this.sessionManager = new SessionManager(this.config.session);
    this.deviceManager = new DeviceManager(this.config.device);
    this.securityLogger = new SecurityEventLogger(this.config.security);
    this.notificationService = new NotificationService(this.config.security.notifications);
    this.cleanupService = new DataCleanupService(this.config.security.retentionDays);

    // Start background services
    this.startSecurityMonitoring();
    this.startCleanupScheduler();
  }

  /**
   * Task 1: Intelligent Session Timeout System
   * Authenticate user with intelligent timeout and activity tracking
   */
  async authenticateUser(request: AuthenticationRequest): Promise<AuthenticationResponse> {
    try {
      const startTime = Date.now();
      
      // Step 1: Register or validate device
      const deviceResult = await this.deviceManager.registerDevice({
        userId: request.userId,
        fingerprint: request.deviceFingerprint || generateDeviceFingerprint(request.deviceInfo),
        name: request.deviceInfo?.name || 'Unknown Device',
        type: request.deviceInfo?.type || 'unknown',
        userAgent: request.userAgent,
        ipAddress: request.ipAddress,
        location: request.location,
        screen: request.deviceInfo?.screen,
        timezone: request.deviceInfo?.timezone,
        language: request.deviceInfo?.language
      });

      if (!deviceResult.success) {
        await this.securityLogger.logEvent({
          userId: request.userId,
          type: 'device_registration_failed',
          severity: 'high',
          ipAddress: request.ipAddress,
          userAgent: request.userAgent,
          details: { error: deviceResult.error }
        });
        
        return {
          success: false,
          error: deviceResult.error,
          timestamp: new Date().toISOString()
        };
      }

      const device = deviceResult.data!;

      // Step 2: Check for suspicious activity
      const riskScore = await this.calculateAuthenticationRisk(request, device);
      
      if (riskScore > 0.8) {
        await this.securityLogger.logEvent({
          userId: request.userId,
          deviceId: device.id,
          type: 'high_risk_authentication',
          severity: 'critical',
          ipAddress: request.ipAddress,
          userAgent: request.userAgent,
          details: { riskScore, factors: await this.getRiskFactors(request, device) }
        });

        return {
          success: false,
          error: {
            code: 'HIGH_RISK_AUTHENTICATION',
            message: 'Authentication blocked due to high risk score',
            details: { riskScore }
          },
          timestamp: new Date().toISOString()
        };
      }

      // Step 3: Create session with intelligent timeout
      const sessionTimeout = await this.calculateSessionTimeout(request.userId);
      
      const sessionResult = await this.sessionManager.createSession({
        userId: request.userId,
        deviceId: device.id,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        location: request.location,
        expiresAt: new Date(Date.now() + sessionTimeout).toISOString(),
        metadata: {
          riskScore,
          authenticationTime: Date.now() - startTime,
          deviceTrusted: device.trusted,
          ...request.metadata
        }
      });

      if (!sessionResult.success) {
        await this.securityLogger.logEvent({
          userId: request.userId,
          deviceId: device.id,
          type: 'session_creation_failed',
          severity: 'high',
          ipAddress: request.ipAddress,
          userAgent: request.userAgent,
          details: { error: sessionResult.error }
        });
        
        return {
          success: false,
          error: sessionResult.error,
          timestamp: new Date().toISOString()
        };
      }

      const session = sessionResult.data!;

      // Step 4: Setup intelligent timeout tracking
      await this.setupSessionTimeoutTracking(session);

      // Step 5: Log successful authentication
      await this.securityLogger.logEvent({
        userId: request.userId,
        sessionId: session.id,
        deviceId: device.id,
        type: 'authentication_success',
        severity: 'low',
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        details: {
          sessionTimeout: formatDuration(sessionTimeout),
          riskScore,
          deviceTrusted: device.trusted
        }
      });

      // Step 6: Send notifications if needed
      if (!device.trusted || riskScore > 0.5) {
        await this.notificationService.sendNotification({
          userId: request.userId,
          type: 'new_device_login',
          severity: device.trusted ? 'low' : 'medium',
          title: 'New Device Login',
          message: `Login from ${device.name} (${request.ipAddress})`,
          data: {
            sessionId: session.id,
            deviceId: device.id,
            location: request.location,
            riskScore
          }
        });
      }

      return {
        success: true,
        data: {
          session,
          device,
          token: session.token,
          expiresAt: session.expiresAt,
          requiresVerification: !device.trusted && riskScore > 0.3
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      await this.securityLogger.logEvent({
        userId: request.userId,
        type: 'authentication_error',
        severity: 'critical',
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });

      return {
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Internal authentication error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Validate session with activity tracking
   */
  async validateSession(token: string): Promise<SessionValidationResult> {
    try {
      const sessionResult = await this.sessionManager.validateSession(token);
      
      if (!sessionResult.success) {
        return sessionResult;
      }

      const session = sessionResult.data!;

      // Check if session is close to expiry and extend if active
      const timeToExpiry = new Date(session.expiresAt).getTime() - Date.now();
      const extendThreshold = this.config.session.inactivityTimeout / 2; // Extend when 50% of inactivity timeout remains

      if (timeToExpiry < extendThreshold && this.config.session.extendOnActivity) {
        await this.extendSessionTimeout(session.id);
      }

      // Update activity tracking
      await this.updateActivityTracking(session.id);

      return sessionResult;

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SESSION_VALIDATION_ERROR',
          message: 'Error validating session',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update session activity with intelligent timeout extension
   */
  async updateSessionActivity(sessionId: string, activity?: SessionActivityUpdate): Promise<AuthenticationResponse> {
    try {
      // Update session activity
      const updateResult = await this.sessionManager.updateActivity(sessionId, activity);
      
      if (!updateResult.success) {
        return {
          success: false,
          error: updateResult.error,
          timestamp: new Date().toISOString()
        };
      }

      const session = updateResult.data!;

      // Update activity tracking
      await this.updateActivityTracking(sessionId);

      // Log activity if significant
      if (activity?.significantActivity) {
        await this.securityLogger.logEvent({
          userId: session.userId,
          sessionId: session.id,
          type: 'session_activity',
          severity: 'low',
          details: {
            activityType: activity.activityType,
            location: activity.location,
            timestamp: activity.timestamp
          }
        });
      }

      return {
        success: true,
        data: {
          session,
          securityEvent: activity?.significantActivity ? await this.securityLogger.getLatestEvent(session.userId) : undefined
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ACTIVITY_UPDATE_ERROR',
          message: 'Error updating session activity',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Terminate session with cleanup
   */
  async terminateSession(sessionId: string, reason: string = 'user_logout'): Promise<AuthenticationResponse> {
    try {
      // Clear activity tracking
      this.clearActivityTracking(sessionId);

      // Terminate session
      const terminateResult = await this.sessionManager.terminateSession(sessionId, reason);
      
      if (!terminateResult.success) {
        return {
          success: false,
          error: terminateResult.error,
          timestamp: new Date().toISOString()
        };
      }

      const session = terminateResult.data!;

      // Log termination
      await this.securityLogger.logEvent({
        userId: session.userId,
        sessionId: session.id,
        type: reason === 'user_logout' ? 'logout' : 'session_terminated',
        severity: 'low',
        details: { reason, terminatedAt: session.terminatedAt }
      });

      return {
        success: true,
        data: {
          session,
          securityEvent: await this.securityLogger.getLatestEvent(session.userId)
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SESSION_TERMINATION_ERROR',
          message: 'Error terminating session',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get user sessions with activity status
   */
  async getUserSessions(userId: string): Promise<AuthenticationResponse> {
    try {
      const sessionsResult = await this.sessionManager.getUserSessions(userId);
      
      if (!sessionsResult.success) {
        return {
          success: false,
          error: sessionsResult.error,
          timestamp: new Date().toISOString()
        };
      }

      const sessions = sessionsResult.data!;

      // Enrich sessions with device and activity information
      const enrichedSessions = await Promise.all(
        sessions.map(async (session) => {
          const deviceResult = await this.deviceManager.getDevice(session.deviceId);
          const device = deviceResult.success ? deviceResult.data : null;
          
          return {
            ...session,
            device,
            isActive: this.activityTrackers.has(session.id),
            timeToExpiry: new Date(session.expiresAt).getTime() - Date.now()
          };
        })
      );

      return {
        success: true,
        data: { sessions: enrichedSessions },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_SESSIONS_ERROR',
          message: 'Error retrieving user sessions',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Private Methods - Session Timeout Management
   */
  private async calculateSessionTimeout(userId: string): Promise<number> {
    try {
      // Get user role to determine timeout
      const { data: user } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      const role = user?.role || 'patient';
      
      // Role-based timeout configuration
      const timeouts = {
        owner: 8 * 60 * 60 * 1000,    // 8 hours
        manager: 4 * 60 * 60 * 1000,  // 4 hours
        staff: 2 * 60 * 60 * 1000,    // 2 hours
        patient: 30 * 60 * 1000       // 30 minutes
      };

      return timeouts[role as keyof typeof timeouts] || this.config.session.sessionTimeout;

    } catch (error) {
      // Fallback to default timeout
      return this.config.session.sessionTimeout;
    }
  }

  private async setupSessionTimeoutTracking(session: SessionData): Promise<void> {
    const timeToExpiry = new Date(session.expiresAt).getTime() - Date.now();
    const warningTime = timeToExpiry - (5 * 60 * 1000); // 5 minutes before expiry
    const finalWarningTime = timeToExpiry - (1 * 60 * 1000); // 1 minute before expiry

    // Setup warning timers
    if (warningTime > 0) {
      const warningTimer = setTimeout(async () => {
        await this.sendSessionWarning(session.id, '5 minutes');
      }, warningTime);
      
      this.sessionWarnings.set(`${session.id}-5min`, warningTimer);
    }

    if (finalWarningTime > 0) {
      const finalWarningTimer = setTimeout(async () => {
        await this.sendSessionWarning(session.id, '1 minute');
      }, finalWarningTime);
      
      this.sessionWarnings.set(`${session.id}-1min`, finalWarningTimer);
    }

    // Setup expiry timer
    const expiryTimer = setTimeout(async () => {
      await this.handleSessionExpiry(session.id);
    }, timeToExpiry);
    
    this.activityTrackers.set(session.id, expiryTimer);
  }

  private async sendSessionWarning(sessionId: string, timeRemaining: string): Promise<void> {
    try {
      const sessionResult = await this.sessionManager.getSession(sessionId);
      
      if (sessionResult.success && sessionResult.data) {
        const session = sessionResult.data;
        
        await this.notificationService.sendNotification({
          userId: session.userId,
          type: 'session_warning',
          severity: 'medium',
          title: 'Session Expiring Soon',
          message: `Your session will expire in ${timeRemaining}. Please save your work.`,
          data: {
            sessionId,
            timeRemaining,
            expiresAt: session.expiresAt
          }
        });
      }
    } catch (error) {
      console.error('Error sending session warning:', error);
    }
  }

  private async handleSessionExpiry(sessionId: string): Promise<void> {
    try {
      await this.terminateSession(sessionId, 'timeout');
    } catch (error) {
      console.error('Error handling session expiry:', error);
    }
  }

  private async extendSessionTimeout(sessionId: string): Promise<void> {
    try {
      const newExpiryTime = Date.now() + this.config.session.sessionTimeout;
      
      await this.sessionManager.extendSession(sessionId, new Date(newExpiryTime).toISOString());
      
      // Clear old timers and setup new ones
      this.clearActivityTracking(sessionId);
      
      const sessionResult = await this.sessionManager.getSession(sessionId);
      if (sessionResult.success && sessionResult.data) {
        await this.setupSessionTimeoutTracking(sessionResult.data);
      }
    } catch (error) {
      console.error('Error extending session timeout:', error);
    }
  }

  private updateActivityTracking = debounce(async (sessionId: string) => {
    // Reset inactivity timer
    const existingTimer = this.activityTrackers.get(sessionId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Setup new inactivity timer
    const inactivityTimer = setTimeout(async () => {
      await this.handleSessionInactivity(sessionId);
    }, this.config.session.inactivityTimeout);
    
    this.activityTrackers.set(sessionId, inactivityTimer);
  }, 1000); // Debounce activity updates

  private async handleSessionInactivity(sessionId: string): Promise<void> {
    try {
      await this.terminateSession(sessionId, 'inactivity');
    } catch (error) {
      console.error('Error handling session inactivity:', error);
    }
  }

  private clearActivityTracking(sessionId: string): void {
    // Clear activity timer
    const activityTimer = this.activityTrackers.get(sessionId);
    if (activityTimer) {
      clearTimeout(activityTimer);
      this.activityTrackers.delete(sessionId);
    }

    // Clear warning timers
    const warning5min = this.sessionWarnings.get(`${sessionId}-5min`);
    if (warning5min) {
      clearTimeout(warning5min);
      this.sessionWarnings.delete(`${sessionId}-5min`);
    }

    const warning1min = this.sessionWarnings.get(`${sessionId}-1min`);
    if (warning1min) {
      clearTimeout(warning1min);
      this.sessionWarnings.delete(`${sessionId}-1min`);
    }
  }

  /**
   * Risk Assessment Methods
   */
  private async calculateAuthenticationRisk(request: AuthenticationRequest, device: DeviceData): Promise<number> {
    let riskScore = 0;

    // Device trust factor
    if (!device.trusted) {
      riskScore += 0.3;
    }

    // IP address change
    if (device.lastIpAddress && device.lastIpAddress !== request.ipAddress) {
      riskScore += 0.2;
    }

    // Geographic location change (if available)
    if (request.location && device.lastLocation) {
      const distance = this.calculateDistance(request.location, device.lastLocation);
      if (distance > 1000) { // More than 1000km
        riskScore += 0.3;
      }
    }

    // Time-based factors
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) { // Outside normal hours
      riskScore += 0.1;
    }

    // Recent failed attempts
    const recentFailures = await this.securityLogger.getRecentFailedAttempts(request.userId, 60 * 60 * 1000); // Last hour
    if (recentFailures > 3) {
      riskScore += 0.4;
    }

    return Math.min(riskScore, 1.0); // Cap at 1.0
  }

  private async getRiskFactors(request: AuthenticationRequest, device: DeviceData): Promise<string[]> {
    const factors: string[] = [];

    if (!device.trusted) factors.push('untrusted_device');
    if (device.lastIpAddress && device.lastIpAddress !== request.ipAddress) factors.push('ip_change');
    
    if (request.location && device.lastLocation) {
      const distance = this.calculateDistance(request.location, device.lastLocation);
      if (distance > 1000) factors.push('location_change');
    }

    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) factors.push('unusual_time');

    const recentFailures = await this.securityLogger.getRecentFailedAttempts(request.userId, 60 * 60 * 1000);
    if (recentFailures > 3) factors.push('recent_failures');

    return factors;
  }

  private calculateDistance(loc1: { latitude: number; longitude: number }, loc2: { latitude: number; longitude: number }): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Background Services
   */
  private startSecurityMonitoring(): void {
    // Monitor security events every 30 seconds
    this.securityMonitor = setInterval(async () => {
      try {
        await this.performSecurityCheck();
      } catch (error) {
        console.error('Security monitoring error:', error);
      }
    }, 30 * 1000);
  }

  private startCleanupScheduler(): void {
    // Run cleanup every hour
    this.cleanupScheduler = setInterval(async () => {
      try {
        await this.performScheduledCleanup();
      } catch (error) {
        console.error('Cleanup scheduler error:', error);
      }
    }, 60 * 60 * 1000);
  }

  private async performSecurityCheck(): Promise<void> {
    // Check for suspicious patterns
    const suspiciousEvents = await this.securityLogger.detectSuspiciousPatterns();
    
    for (const event of suspiciousEvents) {
      if (event.severity === 'critical') {
        // Auto-block user if critical threat detected
        await this.handleSecurityThreat({
          userId: event.userId,
          threatType: event.type,
          severity: event.severity,
          details: event.details
        });
      }
    }
  }

  private async performScheduledCleanup(): Promise<void> {
    await this.cleanupService.performCleanup({
      expiredSessions: true,
      inactiveDevices: true,
      oldSecurityEvents: true,
      retentionDays: this.config.security.retentionDays
    });
  }

  /**
   * Public API Methods for Advanced Features
   */
  
  async authenticateWithTrustedDevice(request: Omit<AuthenticationRequest, 'deviceInfo'> & { deviceFingerprint: string }): Promise<AuthenticationResponse> {
    // Implementation for trusted device authentication
    const deviceResult = await this.deviceManager.getDeviceByFingerprint(request.deviceFingerprint);
    
    if (!deviceResult.success || !deviceResult.data?.trusted) {
      return {
        success: false,
        error: {
          code: 'DEVICE_NOT_TRUSTED',
          message: 'Device is not trusted for quick authentication'
        },
        timestamp: new Date().toISOString()
      };
    }

    return this.authenticateUser({
      ...request,
      deviceInfo: {
        name: deviceResult.data.name,
        type: deviceResult.data.type
      }
    });
  }

  async initiateDeviceTrust(deviceId: string, verificationMethod: 'email' | 'sms'): Promise<AuthenticationResponse> {
    return this.deviceManager.initiateDeviceTrust(deviceId, verificationMethod);
  }

  async verifyDeviceTrust(deviceId: string, verificationCode: string): Promise<AuthenticationResponse> {
    return this.deviceManager.verifyDeviceTrust(deviceId, verificationCode);
  }

  async revokeExpiredTrust(): Promise<AuthenticationResponse> {
    return this.deviceManager.revokeExpiredTrust();
  }

  async handleSecurityThreat(threatData: SecurityThreatData): Promise<AuthenticationResponse> {
    // Implementation for security threat handling
    try {
      // Log the threat
      await this.securityLogger.logEvent({
        userId: threatData.userId,
        type: 'security_threat_detected',
        severity: 'critical',
        details: threatData
      });

      // Terminate all user sessions if critical
      if (threatData.severity === 'critical') {
        const sessionsResult = await this.getUserSessions(threatData.userId);
        if (sessionsResult.success && sessionsResult.data?.sessions) {
          await Promise.all(
            sessionsResult.data.sessions.map(session => 
              this.terminateSession(session.id, 'security_threat')
            )
          );
        }
      }

      return {
        success: true,
        data: {
          action: 'user_blocked',
          severity: threatData.severity,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'THREAT_HANDLING_ERROR',
          message: 'Error handling security threat',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async generateSecurityReport(period: { startDate: Date; endDate: Date }): Promise<AuthenticationResponse> {
    // Implementation for security report generation
    try {
      const events = await this.securityLogger.getEventsByDateRange(
        period.startDate.toISOString(),
        period.endDate.toISOString()
      );

      const statistics = await this.securityLogger.getSecurityStatistics(period);

      const report: SecurityReport = {
        period,
        summary: {
          totalEvents: events.length,
          criticalEvents: events.filter(e => e.severity === 'critical').length,
          highEvents: events.filter(e => e.severity === 'high').length,
          mediumEvents: events.filter(e => e.severity === 'medium').length,
          lowEvents: events.filter(e => e.severity === 'low').length
        },
        events: events.slice(0, 100), // Limit to 100 most recent
        statistics,
        generatedAt: new Date().toISOString()
      };

      return {
        success: true,
        data: report,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPORT_GENERATION_ERROR',
          message: 'Error generating security report',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async performCleanup(config: CleanupConfig): Promise<AuthenticationResponse> {
    try {
      const result = await this.cleanupService.performCleanup(config);
      
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CLEANUP_ERROR',
          message: 'Error performing cleanup',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async getSessionMetrics(userId?: string): Promise<AuthenticationResponse> {
    try {
      const metrics = await this.sessionManager.getSessionMetrics(userId);
      
      return {
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'METRICS_ERROR',
          message: 'Error retrieving session metrics',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async getDeviceStats(userId: string): Promise<AuthenticationResponse> {
    try {
      const stats = await this.deviceManager.getDeviceStats(userId);
      
      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DEVICE_STATS_ERROR',
          message: 'Error retrieving device statistics',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async getSecurityEvents(userId: string, limit: number = 50): Promise<AuthenticationResponse> {
    try {
      const events = await this.securityLogger.getUserEvents(userId, limit);
      
      return {
        success: true,
        data: { events },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SECURITY_EVENTS_ERROR',
          message: 'Error retrieving security events',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    // Clear all timers
    this.activityTrackers.forEach(timer => clearTimeout(timer));
    this.sessionWarnings.forEach(timer => clearTimeout(timer));
    
    if (this.securityMonitor) {
      clearInterval(this.securityMonitor);
    }
    
    if (this.cleanupScheduler) {
      clearInterval(this.cleanupScheduler);
    }

    // Clear maps
    this.activityTrackers.clear();
    this.sessionWarnings.clear();
  }
}

// Export singleton instance
export const unifiedSessionSystem = new UnifiedSessionSystem();

// Export factory function for custom configurations
export function createUnifiedSessionSystem(config?: Partial<typeof sessionConfig>): UnifiedSessionSystem {
  return new UnifiedSessionSystem(config);
}