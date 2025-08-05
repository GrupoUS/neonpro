/**
 * Session Management System - Main Entry Point
 *
 * Unified session management system for NeonPro with intelligent timeout,
 * security monitoring, device management, and LGPD compliance.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { EventEmitter } from "events";
import type { SessionManager } from "./session-manager";
import type { SecurityMonitor } from "./security-monitor";
import type { DeviceManager } from "./device-manager";
import type { AuditLogger } from "./audit-logger";
import type {
  UserSession,
  SessionConfig,
  SessionError,
  DeviceRegistration,
  SessionAuditLog,
  SessionSecurityEvent,
  SessionLocation,
  DeviceFingerprint,
} from "./types";

interface SessionSystemConfig extends SessionConfig {
  // Security settings
  securityMonitoring: {
    enabled: boolean;
    threatDetection: boolean;
    ipWhitelist?: string[];
    maxFailedAttempts: number;
    lockoutDuration: number;
  };

  // Device management
  deviceManagement: {
    enabled: boolean;
    requireTrustedDevices: boolean;
    maxDevicesPerUser: number;
    deviceTrustExpiry: number;
  };

  // Audit logging
  auditLogging: {
    enabled: boolean;
    bufferSize: number;
    flushInterval: number;
    retentionDays: number;
  };

  // LGPD compliance
  lgpdCompliance: {
    enabled: boolean;
    dataMinimization: boolean;
    consentTracking: boolean;
    automaticDeletion: boolean;
  };
}

interface SessionCreationParams {
  userId: string;
  clinicId: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: DeviceFingerprint;
  location?: SessionLocation;
  deviceName?: string;
  trustDevice?: boolean;
}

interface SessionValidationResult {
  isValid: boolean;
  session?: UserSession;
  device?: DeviceRegistration;
  securityEvents?: SessionSecurityEvent[];
  requiresAction?: {
    type: "device_trust" | "security_verification" | "consent_update";
    message: string;
    data?: any;
  };
}

interface SessionSystemStats {
  activeSessions: number;
  totalUsers: number;
  trustedDevices: number;
  securityEvents: number;
  auditEvents: number;
  systemHealth: {
    status: "healthy" | "warning" | "critical";
    uptime: number;
    performance: {
      avgResponseTime: number;
      errorRate: number;
      throughput: number;
    };
  };
}

export class SessionSystem extends EventEmitter {
  private supabase: SupabaseClient;
  private config: SessionSystemConfig;
  private sessionManager: SessionManager;
  private securityMonitor: SecurityMonitor;
  private deviceManager: DeviceManager;
  private auditLogger: AuditLogger;
  private isInitialized: boolean = false;
  private startTime: Date = new Date();
  private performanceMetrics = {
    requestCount: 0,
    errorCount: 0,
    totalResponseTime: 0,
  };

  constructor(supabase: SupabaseClient, config: SessionSystemConfig) {
    super();
    this.supabase = supabase;
    this.config = config;

    // Initialize components
    this.sessionManager = new SessionManager(supabase, config);
    this.securityMonitor = new SecurityMonitor(supabase, config.securityMonitoring);
    this.deviceManager = new DeviceManager(supabase);
    this.auditLogger = new AuditLogger(supabase, {
      bufferSize: config.auditLogging.bufferSize,
      flushInterval: config.auditLogging.flushInterval,
    });

    this.setupEventHandlers();
  }

  // ============================================================================
  // SYSTEM INITIALIZATION
  // ============================================================================

  /**
   * Initialize the session system
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        return;
      }

      // Validate configuration
      this.validateConfig();

      // Initialize database schema if needed
      await this.initializeDatabase();

      // Start background tasks
      this.startBackgroundTasks();

      this.isInitialized = true;

      await this.auditLogger.logSessionEvent({
        userId: "system",
        clinicId: "system",
        action: "system_initialized",
        severity: "medium",
        details: {
          config: this.sanitizeConfig(this.config),
          timestamp: new Date(),
        },
        ipAddress: "127.0.0.1",
        userAgent: "session_system",
      });

      this.emit("system_initialized", { config: this.config });
    } catch (error) {
      throw new SessionError("Failed to initialize session system", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Check if system is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Create a new session with full security validation
   */
  async createSession(params: SessionCreationParams): Promise<{
    session: UserSession;
    device: DeviceRegistration;
    requiresDeviceTrust?: boolean;
  }> {
    const startTime = Date.now();

    try {
      this.ensureInitialized();
      this.performanceMetrics.requestCount++;

      // 1. Security validation
      const securityValidation = await this.securityMonitor.validateSessionCreation({
        userId: params.userId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        location: params.location,
      });

      if (!securityValidation.isAllowed) {
        await this.auditLogger.logSecurityEvent({
          userId: params.userId,
          clinicId: params.clinicId,
          action: "session_creation_blocked",
          threatLevel: "high",
          details: {
            reason: securityValidation.reason,
            riskScore: securityValidation.riskScore,
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          location: params.location,
        });

        throw new SessionError(
          `Session creation blocked: ${securityValidation.reason}`,
          "SECURITY_VIOLATION",
          { riskScore: securityValidation.riskScore },
        );
      }

      // 2. Device registration/validation
      const device = await this.deviceManager.registerOrValidateDevice({
        userId: params.userId,
        clinicId: params.clinicId,
        fingerprint: params.deviceFingerprint,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        location: params.location,
        deviceName: params.deviceName,
      });

      // 3. Device validation
      const deviceValidation = await this.deviceManager.validateDevice(
        device.deviceFingerprint,
        params.userId,
      );

      if (!deviceValidation.isValid) {
        await this.auditLogger.logSecurityEvent({
          userId: params.userId,
          clinicId: params.clinicId,
          action: "device_validation_failed",
          threatLevel: "medium",
          details: {
            reasons: deviceValidation.reasons,
            riskScore: deviceValidation.riskScore,
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          deviceFingerprint: device.deviceFingerprint,
        });

        throw new SessionError("Device validation failed", "DEVICE_NOT_TRUSTED", {
          reasons: deviceValidation.reasons,
        });
      }

      // 4. Check device trust requirements
      const requiresDeviceTrust =
        this.config.deviceManagement.requireTrustedDevices && !deviceValidation.isTrusted;

      if (requiresDeviceTrust && !params.trustDevice) {
        return {
          session: null as any,
          device,
          requiresDeviceTrust: true,
        };
      }

      // 5. Create session
      const session = await this.sessionManager.createSession({
        userId: params.userId,
        clinicId: params.clinicId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        deviceFingerprint: device.deviceFingerprint,
        location: params.location,
      });

      // 6. Trust device if requested
      if (params.trustDevice && !deviceValidation.isTrusted) {
        await this.deviceManager.trustDevice({
          deviceId: device.id,
          userId: params.userId,
          verificationMethod: "admin", // Simplified for demo
        });
      }

      // 7. Log session creation
      await this.auditLogger.logSessionEvent({
        sessionId: session.id,
        userId: params.userId,
        clinicId: params.clinicId,
        action: "session_created",
        severity: "low",
        details: {
          deviceTrusted: deviceValidation.isTrusted,
          securityScore: securityValidation.riskScore,
          sessionDuration: session.expiresAt.getTime() - session.createdAt.getTime(),
        },
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        deviceFingerprint: device.deviceFingerprint,
        location: params.location,
      });

      this.emit("session_created", { session, device });

      return { session, device, requiresDeviceTrust: false };
    } catch (error) {
      this.performanceMetrics.errorCount++;

      if (error instanceof SessionError) {
        throw error;
      }

      throw new SessionError("Failed to create session", "SYSTEM_ERROR", { error });
    } finally {
      this.performanceMetrics.totalResponseTime += Date.now() - startTime;
    }
  }

  /**
   * Validate an existing session
   */
  async validateSession(
    sessionToken: string,
    params: {
      ipAddress: string;
      userAgent: string;
      deviceFingerprint?: string;
      location?: SessionLocation;
    },
  ): Promise<SessionValidationResult> {
    const startTime = Date.now();

    try {
      this.ensureInitialized();
      this.performanceMetrics.requestCount++;

      // 1. Validate session token
      const session = await this.sessionManager.validateSession(sessionToken);

      if (!session) {
        return { isValid: false };
      }

      // 2. Security validation
      const securityValidation = await this.securityMonitor.validateSessionActivity({
        sessionId: session.id,
        userId: session.userId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        location: params.location,
      });

      if (!securityValidation.isAllowed) {
        await this.auditLogger.logSecurityEvent({
          userId: session.userId,
          clinicId: session.clinicId,
          action: "suspicious_activity",
          threatLevel: securityValidation.threatLevel,
          details: {
            reason: securityValidation.reason,
            riskScore: securityValidation.riskScore,
            sessionId: session.id,
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          location: params.location,
        });

        // Terminate suspicious session
        await this.sessionManager.terminateSession(session.id, "security_violation");

        return {
          isValid: false,
          securityEvents: securityValidation.events,
          requiresAction: {
            type: "security_verification",
            message: "Suspicious activity detected. Please verify your identity.",
            data: { reason: securityValidation.reason },
          },
        };
      }

      // 3. Device validation if fingerprint provided
      let device: DeviceRegistration | undefined;
      if (params.deviceFingerprint) {
        const deviceValidation = await this.deviceManager.validateDevice(
          params.deviceFingerprint,
          session.userId,
        );

        if (!deviceValidation.isValid) {
          await this.auditLogger.logSecurityEvent({
            userId: session.userId,
            clinicId: session.clinicId,
            action: "device_fingerprint_changed",
            threatLevel: "medium",
            details: {
              sessionId: session.id,
              originalFingerprint: session.deviceFingerprint,
              newFingerprint: params.deviceFingerprint,
            },
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
          });

          return {
            isValid: false,
            requiresAction: {
              type: "device_trust",
              message: "Device fingerprint has changed. Please verify this device.",
              data: { deviceValidation },
            },
          };
        }

        device = deviceValidation.device;
      }

      // 4. Update session activity
      const updatedSession = await this.sessionManager.updateSessionActivity(session.id, {
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        location: params.location,
      });

      return {
        isValid: true,
        session: updatedSession,
        device,
        securityEvents: securityValidation.events,
      };
    } catch (error) {
      this.performanceMetrics.errorCount++;

      return {
        isValid: false,
        requiresAction: {
          type: "security_verification",
          message: "Session validation error. Please log in again.",
          data: { error: error instanceof Error ? error.message : "Unknown error" },
        },
      };
    } finally {
      this.performanceMetrics.totalResponseTime += Date.now() - startTime;
    }
  }

  /**
   * Terminate a session
   */
  async terminateSession(sessionToken: string, reason: string = "user_logout"): Promise<void> {
    try {
      this.ensureInitialized();

      const session = await this.sessionManager.getSessionByToken(sessionToken);

      if (session) {
        await this.sessionManager.terminateSession(session.id, reason);

        await this.auditLogger.logSessionEvent({
          sessionId: session.id,
          userId: session.userId,
          clinicId: session.clinicId,
          action: "session_terminated",
          severity: "low",
          details: {
            reason,
            sessionDuration: Date.now() - session.createdAt.getTime(),
          },
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          deviceFingerprint: session.deviceFingerprint,
        });

        this.emit("session_terminated", { session, reason });
      }
    } catch (error) {
      throw new SessionError("Failed to terminate session", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Terminate all sessions for a user
   */
  async terminateAllUserSessions(userId: string, reason: string = "admin_action"): Promise<number> {
    try {
      this.ensureInitialized();

      const terminatedCount = await this.sessionManager.terminateAllUserSessions(userId, reason);

      await this.auditLogger.logSessionEvent({
        userId,
        clinicId: "system",
        action: "session_terminated",
        severity: "medium",
        details: {
          reason,
          terminatedCount,
          bulkTermination: true,
        },
        ipAddress: "127.0.0.1",
        userAgent: "session_system",
      });

      this.emit("user_sessions_terminated", { userId, count: terminatedCount, reason });

      return terminatedCount;
    } catch (error) {
      throw new SessionError("Failed to terminate user sessions", "SYSTEM_ERROR", { error });
    }
  }

  // ============================================================================
  // DEVICE MANAGEMENT
  // ============================================================================

  /**
   * Get user devices
   */
  async getUserDevices(userId: string): Promise<DeviceRegistration[]> {
    try {
      this.ensureInitialized();
      return await this.deviceManager.getUserDevices(userId);
    } catch (error) {
      throw new SessionError("Failed to get user devices", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Trust a device
   */
  async trustDevice(params: {
    deviceId: string;
    userId: string;
    verificationMethod: "email" | "sms" | "admin" | "biometric";
    verificationCode?: string;
  }): Promise<DeviceRegistration> {
    try {
      this.ensureInitialized();

      const device = await this.deviceManager.trustDevice(params);

      await this.auditLogger.logSessionEvent({
        userId: params.userId,
        clinicId: device.clinicId,
        action: "device_trusted",
        severity: "medium",
        details: {
          deviceId: params.deviceId,
          verificationMethod: params.verificationMethod,
        },
        ipAddress: "127.0.0.1",
        userAgent: "session_system",
        deviceFingerprint: device.deviceFingerprint,
      });

      this.emit("device_trusted", { device, method: params.verificationMethod });

      return device;
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to trust device", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Block a device
   */
  async blockDevice(deviceId: string, userId: string, reason: string): Promise<void> {
    try {
      this.ensureInitialized();

      await this.deviceManager.blockDevice(deviceId, userId, reason);

      this.emit("device_blocked", { deviceId, userId, reason });
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to block device", "SYSTEM_ERROR", { error });
    }
  }

  // ============================================================================
  // SECURITY & MONITORING
  // ============================================================================

  /**
   * Get security events
   */
  async getSecurityEvents(options?: {
    userId?: string;
    severity?: "low" | "medium" | "high" | "critical";
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<SessionAuditLog[]> {
    try {
      this.ensureInitialized();
      return await this.auditLogger.getSecurityEvents(options);
    } catch (error) {
      throw new SessionError("Failed to get security events", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Block an IP address
   */
  async blockIP(ipAddress: string, reason: string, duration?: number): Promise<void> {
    try {
      this.ensureInitialized();

      await this.securityMonitor.blockIP(ipAddress, reason, duration);

      await this.auditLogger.logSecurityEvent({
        userId: "system",
        clinicId: "system",
        action: "ip_blocked",
        threatLevel: "high",
        details: {
          ipAddress,
          reason,
          duration,
        },
        ipAddress,
        userAgent: "session_system",
      });

      this.emit("ip_blocked", { ipAddress, reason, duration });
    } catch (error) {
      throw new SessionError("Failed to block IP", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Unblock an IP address
   */
  async unblockIP(ipAddress: string): Promise<void> {
    try {
      this.ensureInitialized();

      await this.securityMonitor.unblockIP(ipAddress);

      await this.auditLogger.logSecurityEvent({
        userId: "system",
        clinicId: "system",
        action: "ip_unblocked",
        threatLevel: "low",
        details: { ipAddress },
        ipAddress,
        userAgent: "session_system",
      });

      this.emit("ip_unblocked", { ipAddress });
    } catch (error) {
      throw new SessionError("Failed to unblock IP", "SYSTEM_ERROR", { error });
    }
  }

  // ============================================================================
  // AUDIT & COMPLIANCE
  // ============================================================================

  /**
   * Search audit logs
   */
  async searchAuditLogs(filters: {
    userId?: string;
    clinicId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<{
    logs: SessionAuditLog[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      this.ensureInitialized();
      return await this.auditLogger.searchAuditLogs(filters);
    } catch (error) {
      throw new SessionError("Failed to search audit logs", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Generate LGPD compliance report
   */
  async generateLGPDReport(options?: {
    userId?: string;
    clinicId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    try {
      this.ensureInitialized();
      return await this.auditLogger.generateLGPDReport(options);
    } catch (error) {
      throw new SessionError("Failed to generate LGPD report", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(
    filters: any,
    format: "json" | "csv" = "json",
  ): Promise<{
    data: string;
    filename: string;
    mimeType: string;
  }> {
    try {
      this.ensureInitialized();
      return await this.auditLogger.exportAuditLogs(filters, format);
    } catch (error) {
      throw new SessionError("Failed to export audit logs", "SYSTEM_ERROR", { error });
    }
  }

  // ============================================================================
  // SYSTEM MANAGEMENT
  // ============================================================================

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<SessionSystemStats> {
    try {
      this.ensureInitialized();

      const [sessionStats, deviceStats, auditStats] = await Promise.all([
        this.sessionManager.getSessionStatistics(),
        this.deviceManager.getDeviceStatistics(),
        this.auditLogger.generateAuditStatistics(),
      ]);

      const uptime = Date.now() - this.startTime.getTime();
      const avgResponseTime =
        this.performanceMetrics.requestCount > 0
          ? this.performanceMetrics.totalResponseTime / this.performanceMetrics.requestCount
          : 0;
      const errorRate =
        this.performanceMetrics.requestCount > 0
          ? (this.performanceMetrics.errorCount / this.performanceMetrics.requestCount) * 100
          : 0;

      return {
        activeSessions: sessionStats.activeSessions,
        totalUsers: sessionStats.totalUsers,
        trustedDevices: deviceStats.trustedDevices,
        securityEvents: auditStats.securityEvents,
        auditEvents: auditStats.totalEvents,
        systemHealth: {
          status: this.determineSystemHealth(errorRate, avgResponseTime),
          uptime,
          performance: {
            avgResponseTime,
            errorRate,
            throughput: this.performanceMetrics.requestCount / (uptime / 1000 / 60), // requests per minute
          },
        },
      };
    } catch (error) {
      throw new SessionError("Failed to get system stats", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Perform system maintenance
   */
  async performMaintenance(): Promise<{
    sessionsCleanedUp: number;
    devicesCleanedUp: number;
    logsArchived: number;
  }> {
    try {
      this.ensureInitialized();

      const [sessionsCleanedUp, devicesCleanedUp, logsResult] = await Promise.all([
        this.sessionManager.cleanupExpiredSessions(),
        this.deviceManager.cleanupOldDevices(this.config.auditLogging.retentionDays),
        this.auditLogger.archiveOldLogs(this.config.auditLogging.retentionDays),
      ]);

      await this.auditLogger.logSessionEvent({
        userId: "system",
        clinicId: "system",
        action: "maintenance_completed",
        severity: "low",
        details: {
          sessionsCleanedUp,
          devicesCleanedUp,
          logsArchived: logsResult.archivedCount,
        },
        ipAddress: "127.0.0.1",
        userAgent: "session_system",
      });

      this.emit("maintenance_completed", {
        sessionsCleanedUp,
        devicesCleanedUp,
        logsArchived: logsResult.archivedCount,
      });

      return {
        sessionsCleanedUp,
        devicesCleanedUp,
        logsArchived: logsResult.archivedCount,
      };
    } catch (error) {
      throw new SessionError("Failed to perform maintenance", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Update system configuration
   */
  async updateConfig(newConfig: Partial<SessionSystemConfig>): Promise<void> {
    try {
      this.ensureInitialized();

      const oldConfig = { ...this.config };
      this.config = { ...this.config, ...newConfig };

      // Validate new configuration
      this.validateConfig();

      await this.auditLogger.logSessionEvent({
        userId: "system",
        clinicId: "system",
        action: "configuration_changed",
        severity: "medium",
        details: {
          oldConfig: this.sanitizeConfig(oldConfig),
          newConfig: this.sanitizeConfig(this.config),
          changes: this.getConfigChanges(oldConfig, this.config),
        },
        ipAddress: "127.0.0.1",
        userAgent: "session_system",
      });

      this.emit("config_updated", { oldConfig, newConfig: this.config });
    } catch (error) {
      throw new SessionError("Failed to update configuration", "SYSTEM_ERROR", { error });
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private setupEventHandlers(): void {
    // Session Manager events
    this.sessionManager.on("session_expired", (data) => {
      this.emit("session_expired", data);
    });

    this.sessionManager.on("concurrent_session_detected", (data) => {
      this.emit("concurrent_session_detected", data);
    });

    // Security Monitor events
    this.securityMonitor.on("threat_detected", (data) => {
      this.emit("threat_detected", data);
    });

    this.securityMonitor.on("ip_blocked", (data) => {
      this.emit("security_ip_blocked", data);
    });

    // Device Manager events
    this.deviceManager.on("device_registered", (data) => {
      this.emit("device_registered", data);
    });

    this.deviceManager.on("device_blocked", (data) => {
      this.emit("device_blocked", data);
    });

    // Audit Logger events
    this.auditLogger.on("critical_event", (data) => {
      this.emit("critical_audit_event", data);
    });
  }

  private validateConfig(): void {
    if (!this.config.sessionTimeout || this.config.sessionTimeout < 300000) {
      throw new SessionError("Session timeout must be at least 5 minutes", "INVALID_CONFIG");
    }

    if (
      !this.config.renewalThreshold ||
      this.config.renewalThreshold < 0.1 ||
      this.config.renewalThreshold > 0.9
    ) {
      throw new SessionError("Renewal threshold must be between 0.1 and 0.9", "INVALID_CONFIG");
    }

    if (this.config.securityMonitoring.maxFailedAttempts < 1) {
      throw new SessionError("Max failed attempts must be at least 1", "INVALID_CONFIG");
    }
  }

  private async initializeDatabase(): Promise<void> {
    // Database initialization would be handled by migrations
    // This is a placeholder for any runtime database setup
  }

  private startBackgroundTasks(): void {
    // Start session cleanup task
    setInterval(
      async () => {
        try {
          await this.sessionManager.cleanupExpiredSessions();
        } catch (error) {
          console.error("Session cleanup failed:", error);
        }
      },
      5 * 60 * 1000,
    ); // Every 5 minutes

    // Start maintenance task
    setInterval(
      async () => {
        try {
          await this.performMaintenance();
        } catch (error) {
          console.error("Maintenance failed:", error);
        }
      },
      24 * 60 * 60 * 1000,
    ); // Daily
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new SessionError("Session system not initialized", "SYSTEM_ERROR");
    }
  }

  private sanitizeConfig(config: SessionSystemConfig): any {
    // Remove sensitive information from config for logging
    const sanitized = { ...config };
    // Remove any sensitive fields here
    return sanitized;
  }

  private getConfigChanges(
    oldConfig: SessionSystemConfig,
    newConfig: SessionSystemConfig,
  ): string[] {
    const changes: string[] = [];

    // Compare configurations and identify changes
    if (oldConfig.sessionTimeout !== newConfig.sessionTimeout) {
      changes.push("sessionTimeout");
    }
    if (oldConfig.renewalThreshold !== newConfig.renewalThreshold) {
      changes.push("renewalThreshold");
    }
    // Add more comparisons as needed

    return changes;
  }

  private determineSystemHealth(
    errorRate: number,
    avgResponseTime: number,
  ): "healthy" | "warning" | "critical" {
    if (errorRate > 10 || avgResponseTime > 5000) {
      return "critical";
    }
    if (errorRate > 5 || avgResponseTime > 2000) {
      return "warning";
    }
    return "healthy";
  }

  /**
   * Cleanup resources and shutdown system
   */
  async destroy(): Promise<void> {
    try {
      await this.auditLogger.logSessionEvent({
        userId: "system",
        clinicId: "system",
        action: "system_shutdown",
        severity: "medium",
        details: {
          uptime: Date.now() - this.startTime.getTime(),
          performanceMetrics: this.performanceMetrics,
        },
        ipAddress: "127.0.0.1",
        userAgent: "session_system",
      });

      await Promise.all([
        this.sessionManager.destroy(),
        this.securityMonitor.destroy(),
        this.deviceManager.destroy(),
        this.auditLogger.destroy(),
      ]);

      this.removeAllListeners();
      this.isInitialized = false;
    } catch (error) {
      console.error("Failed to cleanup session system:", error);
    }
  }
}

// Export types and classes
export {
  SessionSystemConfig,
  SessionCreationParams,
  SessionValidationResult,
  SessionSystemStats,
  UserSession,
  SessionConfig,
  SessionError,
  DeviceRegistration,
  SessionAuditLog,
  SessionSecurityEvent,
  SessionLocation,
  DeviceFingerprint,
};

// Export default configuration
export const defaultSessionConfig: SessionSystemConfig = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  renewalThreshold: 0.25, // Renew when 25% of time remaining
  maxConcurrentSessions: 3,
  enableLocationTracking: true,
  enableDeviceFingerprinting: true,
  securityMonitoring: {
    enabled: true,
    threatDetection: true,
    maxFailedAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },
  deviceManagement: {
    enabled: true,
    requireTrustedDevices: false,
    maxDevicesPerUser: 10,
    deviceTrustExpiry: 90 * 24 * 60 * 60 * 1000, // 90 days
  },
  auditLogging: {
    enabled: true,
    bufferSize: 100,
    flushInterval: 5000,
    retentionDays: 365,
  },
  lgpdCompliance: {
    enabled: true,
    dataMinimization: true,
    consentTracking: true,
    automaticDeletion: true,
  },
};
