/**
 * Session Manager - Core Session Management
 *
 * Handles session lifecycle, validation, and security for the NeonPro platform.
 * Provides intelligent session management with security monitoring and LGPD compliance.
 */

import type { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { EventEmitter } from "events";
import Redis from "ioredis";
import type { AuditLogger } from "./audit-logger";
import type { DeviceManager } from "./device-manager";
import type { SecurityMonitor } from "./security-monitor";
import type {
  CreateSessionParams,
  DeviceFingerprint,
  LGPDSessionData,
  PaginationParams,
  SecurityEventType,
  SecuritySeverity,
  SessionAction,
  SessionActivity,
  SessionAuditLog,
  SessionConfig,
  SessionError,
  SessionErrorCode,
  SessionFilter,
  SessionMetadata,
  SessionPolicy,
  SessionSecurityEvent,
  SessionValidationResult,
  UserSession,
} from "./types";

export class SessionManager extends EventEmitter {
  private supabase: SupabaseClient;
  private redis: Redis;
  private securityMonitor: SecurityMonitor;
  private deviceManager: DeviceManager;
  private auditLogger: AuditLogger;
  private config: SessionConfig;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: SessionConfig) {
    super();
    this.config = config;
    this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    this.redis = new Redis(config.redis.url, {
      keyPrefix: config.redis.prefix,
      maxRetriesPerRequest: config.redis.maxRetries,
      retryDelayOnFailover: config.redis.retryDelay,
    });

    this.securityMonitor = new SecurityMonitor(config.security, this.supabase);
    this.deviceManager = new DeviceManager(this.supabase);
    this.auditLogger = new AuditLogger(this.supabase);

    this.setupEventHandlers();
    this.startCleanupProcess();
  }

  // ============================================================================
  // SESSION LIFECYCLE MANAGEMENT
  // ============================================================================

  /**
   * Create a new user session with security validation
   */
  async createSession(params: CreateSessionParams): Promise<UserSession> {
    try {
      // Validate user and clinic
      await this.validateUserAccess(params.userId, params.clinicId);

      // Check concurrent session limits
      await this.enforceSessionLimits(params.userId, params.clinicId);

      // Security validation
      const securityValidation = await this.securityMonitor.validateSessionCreation({
        userId: params.userId,
        ipAddress: params.ipAddress,
        deviceFingerprint: params.deviceFingerprint,
        location: params.location,
      });

      if (!securityValidation.allowed) {
        throw new SessionError(
          "Session creation blocked by security policy",
          "SECURITY_VIOLATION",
          { reasons: securityValidation.reasons },
        );
      }

      // Register or validate device
      const device = await this.deviceManager.registerOrValidateDevice({
        userId: params.userId,
        clinicId: params.clinicId,
        fingerprint: params.deviceFingerprint,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      // Create session
      const sessionId = this.generateSessionId();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (params.timeoutMinutes || 480) * 60 * 1000);

      const session: UserSession = {
        id: sessionId,
        userId: params.userId,
        clinicId: params.clinicId,
        deviceFingerprint: device.deviceFingerprint,
        deviceName: device.deviceName,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        location: params.location,
        createdAt: now,
        lastActivity: now,
        expiresAt,
        isActive: true,
        securityScore: securityValidation.securityScore,
        sessionData: {},
        metadata: params.metadata,
      };

      // Store in database
      const { error: dbError } = await this.supabase.from("user_sessions").insert({
        id: session.id,
        user_id: session.userId,
        clinic_id: session.clinicId,
        device_fingerprint: session.deviceFingerprint,
        device_name: session.deviceName,
        ip_address: session.ipAddress,
        user_agent: session.userAgent,
        location: session.location,
        created_at: session.createdAt.toISOString(),
        last_activity: session.lastActivity.toISOString(),
        expires_at: session.expiresAt.toISOString(),
        is_active: session.isActive,
        security_score: session.securityScore,
        session_data: session.sessionData,
        metadata: session.metadata,
      });

      if (dbError) {
        throw new SessionError("Failed to create session in database", "SYSTEM_ERROR", {
          error: dbError,
        });
      }

      // Store in Redis for fast access
      await this.redis.setex(
        `session:${sessionId}`,
        Math.floor((expiresAt.getTime() - now.getTime()) / 1000),
        JSON.stringify(session),
      );

      // Log audit event
      await this.auditLogger.logSessionEvent({
        sessionId,
        userId: params.userId,
        clinicId: params.clinicId,
        action: "session_created",
        details: {
          deviceFingerprint: device.deviceFingerprint,
          securityScore: securityValidation.securityScore,
        },
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        location: params.location,
      });

      // Emit event
      this.emit("session_created", { session, device });

      return session;
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to create session", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Validate an existing session
   */
  async validateSession(sessionId: string): Promise<SessionValidationResult> {
    try {
      // Try Redis first for performance
      let session = await this.getSessionFromCache(sessionId);

      if (!session) {
        // Fallback to database
        session = await this.getSessionFromDatabase(sessionId);
        if (session) {
          // Restore to cache
          await this.cacheSession(session);
        }
      }

      if (!session) {
        return {
          isValid: false,
          reason: "Session not found",
        };
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        await this.terminateSession(sessionId, "expired");
        return {
          isValid: false,
          reason: "Session expired",
        };
      }

      // Check if session is active
      if (!session.isActive) {
        return {
          isValid: false,
          reason: "Session is inactive",
        };
      }

      // Security validation
      const securityValidation = await this.securityMonitor.validateSessionActivity(session);

      if (!securityValidation.allowed) {
        // Log security event
        await this.logSecurityEvent({
          sessionId,
          userId: session.userId,
          clinicId: session.clinicId,
          eventType: "session_hijack_attempt",
          severity: "high",
          description: "Session validation failed security checks",
          details: securityValidation.reasons,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          location: session.location,
        });

        return {
          isValid: false,
          reason: "Security validation failed",
          requiresAction: ["terminate_session", "require_mfa"],
        };
      }

      // Update last activity
      await this.updateLastActivity(sessionId);

      return {
        isValid: true,
        session,
        securityEvents: securityValidation.events,
      };
    } catch (error) {
      return {
        isValid: false,
        reason: "Validation error",
        requiresAction: ["log_event"],
      };
    }
  }

  /**
   * Renew an existing session
   */
  async renewSession(sessionId: string): Promise<UserSession> {
    try {
      const validation = await this.validateSession(sessionId);

      if (!validation.isValid || !validation.session) {
        throw new SessionError("Cannot renew invalid session", "SESSION_INVALID");
      }

      const session = validation.session;
      const now = new Date();
      const newExpiresAt = new Date(now.getTime() + this.config.security.tokenExpiry * 60 * 1000);

      // Update session
      const updatedSession: UserSession = {
        ...session,
        lastActivity: now,
        expiresAt: newExpiresAt,
      };

      // Update in database
      const { error: dbError } = await this.supabase
        .from("user_sessions")
        .update({
          last_activity: now.toISOString(),
          expires_at: newExpiresAt.toISOString(),
        })
        .eq("id", sessionId);

      if (dbError) {
        throw new SessionError("Failed to renew session in database", "SYSTEM_ERROR", {
          error: dbError,
        });
      }

      // Update cache
      await this.cacheSession(updatedSession);

      // Log audit event
      await this.auditLogger.logSessionEvent({
        sessionId,
        userId: session.userId,
        clinicId: session.clinicId,
        action: "session_renewed",
        details: { newExpiresAt },
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        location: session.location,
      });

      // Emit event
      this.emit("session_renewed", { session: updatedSession });

      return updatedSession;
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to renew session", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Terminate a session
   */
  async terminateSession(sessionId: string, reason?: string): Promise<void> {
    try {
      const session =
        (await this.getSessionFromCache(sessionId)) ||
        (await this.getSessionFromDatabase(sessionId));

      if (!session) {
        return; // Session doesn't exist, nothing to terminate
      }

      // Update database
      const { error: dbError } = await this.supabase
        .from("user_sessions")
        .update({
          is_active: false,
          terminated_at: new Date().toISOString(),
          termination_reason: reason || "manual",
        })
        .eq("id", sessionId);

      if (dbError) {
        throw new SessionError("Failed to terminate session in database", "SYSTEM_ERROR", {
          error: dbError,
        });
      }

      // Remove from cache
      await this.redis.del(`session:${sessionId}`);

      // Log audit event
      await this.auditLogger.logSessionEvent({
        sessionId,
        userId: session.userId,
        clinicId: session.clinicId,
        action: "session_terminated",
        details: { reason: reason || "manual" },
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        location: session.location,
      });

      // Emit event
      this.emit("session_terminated", { sessionId, userId: session.userId, reason });
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to terminate session", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Terminate all sessions for a user
   */
  async terminateAllSessions(userId: string, reason?: string): Promise<void> {
    try {
      const sessions = await this.getUserSessions(userId);

      await Promise.all(sessions.map((session) => this.terminateSession(session.id, reason)));

      // Emit event
      this.emit("all_sessions_terminated", { userId, reason, count: sessions.length });
    } catch (error) {
      throw new SessionError("Failed to terminate all sessions", "SYSTEM_ERROR", { error });
    }
  }

  // ============================================================================
  // SESSION QUERIES
  // ============================================================================

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<UserSession[]> {
    try {
      const { data, error } = await this.supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("last_activity", { ascending: false });

      if (error) {
        throw new SessionError("Failed to fetch user sessions", "SYSTEM_ERROR", { error });
      }

      return data.map(this.mapDatabaseToSession);
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to get user sessions", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Get all active sessions for a clinic
   */
  async getActiveSessions(clinicId: string): Promise<UserSession[]> {
    try {
      const { data, error } = await this.supabase
        .from("user_sessions")
        .select("*")
        .eq("clinic_id", clinicId)
        .eq("is_active", true)
        .gte("expires_at", new Date().toISOString())
        .order("last_activity", { ascending: false });

      if (error) {
        throw new SessionError("Failed to fetch active sessions", "SYSTEM_ERROR", { error });
      }

      return data.map(this.mapDatabaseToSession);
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to get active sessions", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Search sessions with filters and pagination
   */
  async searchSessions(params: PaginationParams): Promise<{
    sessions: UserSession[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      let query = this.supabase.from("user_sessions").select("*", { count: "exact" });

      // Apply filters
      if (params.filter) {
        const filter = params.filter;

        if (filter.userId) {
          query = query.eq("user_id", filter.userId);
        }
        if (filter.clinicId) {
          query = query.eq("clinic_id", filter.clinicId);
        }
        if (filter.status === "active") {
          query = query.eq("is_active", true).gte("expires_at", new Date().toISOString());
        } else if (filter.status === "expired") {
          query = query.lt("expires_at", new Date().toISOString());
        } else if (filter.status === "terminated") {
          query = query.eq("is_active", false);
        }
        if (filter.ipAddress) {
          query = query.eq("ip_address", filter.ipAddress);
        }
        if (filter.createdAfter) {
          query = query.gte("created_at", filter.createdAfter.toISOString());
        }
        if (filter.createdBefore) {
          query = query.lte("created_at", filter.createdBefore.toISOString());
        }
      }

      // Apply sorting
      if (params.sort) {
        const sortField = this.mapSortField(params.sort.field);
        query = query.order(sortField, { ascending: params.sort.direction === "asc" });
      } else {
        query = query.order("last_activity", { ascending: false });
      }

      // Apply pagination
      const offset = (params.page - 1) * params.limit;
      query = query.range(offset, offset + params.limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new SessionError("Failed to search sessions", "SYSTEM_ERROR", { error });
      }

      return {
        sessions: data.map(this.mapDatabaseToSession),
        total: count || 0,
        page: params.page,
        limit: params.limit,
      };
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to search sessions", "SYSTEM_ERROR", { error });
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const now = new Date();

      // Get expired sessions
      const { data: expiredSessions, error: fetchError } = await this.supabase
        .from("user_sessions")
        .select("id, user_id")
        .lt("expires_at", now.toISOString())
        .eq("is_active", true)
        .limit(this.config.cleanup.batchSize);

      if (fetchError) {
        throw new SessionError("Failed to fetch expired sessions", "SYSTEM_ERROR", {
          error: fetchError,
        });
      }

      if (!expiredSessions || expiredSessions.length === 0) {
        return 0;
      }

      // Update sessions as inactive
      const { error: updateError } = await this.supabase
        .from("user_sessions")
        .update({
          is_active: false,
          terminated_at: now.toISOString(),
          termination_reason: "expired",
        })
        .in(
          "id",
          expiredSessions.map((s) => s.id),
        );

      if (updateError) {
        throw new SessionError("Failed to update expired sessions", "SYSTEM_ERROR", {
          error: updateError,
        });
      }

      // Remove from cache
      const pipeline = this.redis.pipeline();
      expiredSessions.forEach((session) => {
        pipeline.del(`session:${session.id}`);
      });
      await pipeline.exec();

      // Log cleanup event
      await this.auditLogger.logSystemEvent({
        action: "sessions_cleanup",
        details: {
          expiredCount: expiredSessions.length,
          cleanupTime: now,
        },
      });

      return expiredSessions.length;
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError("Failed to cleanup expired sessions", "SYSTEM_ERROR", { error });
    }
  }

  /**
   * Record session activity
   */
  async recordActivity(
    sessionId: string,
    activity: Omit<SessionActivity, "sessionId" | "timestamp">,
  ): Promise<void> {
    try {
      const session = await this.getSessionFromCache(sessionId);
      if (!session) {
        return; // Session doesn't exist
      }

      const activityRecord: SessionActivity = {
        ...activity,
        sessionId,
        timestamp: new Date(),
      };

      // Store activity
      const { error } = await this.supabase.from("session_activities").insert({
        session_id: activityRecord.sessionId,
        user_id: activityRecord.userId,
        action: activityRecord.action,
        resource: activityRecord.resource,
        timestamp: activityRecord.timestamp.toISOString(),
        ip_address: activityRecord.ipAddress,
        user_agent: activityRecord.userAgent,
        success: activityRecord.success,
        duration: activityRecord.duration,
        metadata: activityRecord.metadata,
      });

      if (error) {
        console.error("Failed to record session activity:", error);
      }

      // Update last activity
      await this.updateLastActivity(sessionId);

      // Emit event
      this.emit("session_activity", activityRecord);
    } catch (error) {
      console.error("Failed to record session activity:", error);
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getSessionFromCache(sessionId: string): Promise<UserSession | null> {
    try {
      const cached = await this.redis.get(`session:${sessionId}`);
      if (!cached) return null;

      const session = JSON.parse(cached);
      return {
        ...session,
        createdAt: new Date(session.createdAt),
        lastActivity: new Date(session.lastActivity),
        expiresAt: new Date(session.expiresAt),
      };
    } catch (error) {
      return null;
    }
  }

  private async getSessionFromDatabase(sessionId: string): Promise<UserSession | null> {
    try {
      const { data, error } = await this.supabase
        .from("user_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error || !data) return null;

      return this.mapDatabaseToSession(data);
    } catch (error) {
      return null;
    }
  }

  private async cacheSession(session: UserSession): Promise<void> {
    try {
      const ttl = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000);
      if (ttl > 0) {
        await this.redis.setex(`session:${session.id}`, ttl, JSON.stringify(session));
      }
    } catch (error) {
      console.error("Failed to cache session:", error);
    }
  }

  private mapDatabaseToSession(data: any): UserSession {
    return {
      id: data.id,
      userId: data.user_id,
      clinicId: data.clinic_id,
      deviceFingerprint: data.device_fingerprint,
      deviceName: data.device_name,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      location: data.location,
      createdAt: new Date(data.created_at),
      lastActivity: new Date(data.last_activity),
      expiresAt: new Date(data.expires_at),
      isActive: data.is_active,
      securityScore: data.security_score,
      sessionData: data.session_data || {},
      metadata: data.metadata,
    };
  }

  private mapSortField(field: keyof UserSession): string {
    const fieldMap: Record<string, string> = {
      createdAt: "created_at",
      lastActivity: "last_activity",
      expiresAt: "expires_at",
      userId: "user_id",
      clinicId: "clinic_id",
      ipAddress: "ip_address",
      securityScore: "security_score",
    };

    return fieldMap[field] || field;
  }

  private async validateUserAccess(userId: string, clinicId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("users")
      .select("id, clinic_id, is_active")
      .eq("id", userId)
      .eq("clinic_id", clinicId)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      throw new SessionError("User access validation failed", "AUTHORIZATION_FAILED");
    }
  }

  private async enforceSessionLimits(userId: string, clinicId: string): Promise<void> {
    const activeSessions = await this.getUserSessions(userId);

    if (activeSessions.length >= this.config.security.maxConcurrentSessions) {
      // Terminate oldest session
      const oldestSession = activeSessions[activeSessions.length - 1];
      await this.terminateSession(oldestSession.id, "session_limit_exceeded");
    }
  }

  private async updateLastActivity(sessionId: string): Promise<void> {
    const now = new Date();

    // Update database
    await this.supabase
      .from("user_sessions")
      .update({ last_activity: now.toISOString() })
      .eq("id", sessionId);

    // Update cache
    const session = await this.getSessionFromCache(sessionId);
    if (session) {
      session.lastActivity = now;
      await this.cacheSession(session);
    }
  }

  private async logSecurityEvent(
    event: Omit<
      SessionSecurityEvent,
      "id" | "timestamp" | "resolved" | "resolvedAt" | "resolvedBy" | "actions"
    >,
  ): Promise<void> {
    const securityEvent: SessionSecurityEvent = {
      ...event,
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      actions: ["log_event"],
    };

    await this.supabase.from("session_security_events").insert({
      id: securityEvent.id,
      session_id: securityEvent.sessionId,
      user_id: securityEvent.userId,
      clinic_id: securityEvent.clinicId,
      event_type: securityEvent.eventType,
      severity: securityEvent.severity,
      description: securityEvent.description,
      details: securityEvent.details,
      ip_address: securityEvent.ipAddress,
      user_agent: securityEvent.userAgent,
      location: securityEvent.location,
      timestamp: securityEvent.timestamp.toISOString(),
      resolved: securityEvent.resolved,
      actions: securityEvent.actions,
    });

    this.emit("security_event", securityEvent);
  }

  private setupEventHandlers(): void {
    this.on("session_created", (data) => {
      console.log(`Session created for user ${data.session.userId}`);
    });

    this.on("session_terminated", (data) => {
      console.log(`Session ${data.sessionId} terminated: ${data.reason}`);
    });

    this.on("security_event", (event) => {
      console.warn(`Security event: ${event.eventType} - ${event.description}`);
    });
  }

  private startCleanupProcess(): void {
    if (this.config.cleanup.enableAutoCleanup) {
      this.cleanupInterval = setInterval(async () => {
        try {
          const cleaned = await this.cleanupExpiredSessions();
          if (cleaned > 0) {
            console.log(`Cleaned up ${cleaned} expired sessions`);
          }
        } catch (error) {
          console.error("Session cleanup failed:", error);
        }
      }, this.config.cleanup.interval);
    }
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    await this.redis.quit();
    this.removeAllListeners();
  }
}
