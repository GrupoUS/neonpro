/**
 * Session Manager for Healthcare AI Agent
 * Handles session lifecycle, expiration, and cleanup
 * T058: Configure session management with expiration handling
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { HealthcareLogger } from "../logging/healthcare-logger";

interface SessionData {
  sessionId: string;
  _userId: string;
  clinicId: string;
  userRole: "doctor" | "nurse" | "admin" | "receptionist" | "agent";
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    clientVersion?: string;
    features?: string[];
  };
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
}

interface SessionConfig {
  defaultExpirationMinutes: number;
  maxExpirationMinutes: number;
  inactivityTimeoutMinutes: number;
  maxSessionsPerUser: number;
  cleanupIntervalMinutes: number;
}

export class SessionManager {
  private supabase: SupabaseClient | null = null;
  private logger: HealthcareLogger;
  private sessions = new Map<string, SessionData>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private activityTimeouts = new Map<string, NodeJS.Timeout>();

  private config: SessionConfig = {
    defaultExpirationMinutes: 480, // 8 hours
    maxExpirationMinutes: 1440, // 24 hours
    inactivityTimeoutMinutes: 60, // 1 hour
    maxSessionsPerUser: 5,
    cleanupIntervalMinutes: 15, // Cleanup every 15 minutes
  };

  constructor(logger?: HealthcareLogger) {
    this.logger = logger || new HealthcareLogger();
    this.initializeSupabase();
    this.startCleanupInterval();
  }

  /**
   * Initialize Supabase connection
   */
  private async initializeSupabase(): Promise<void> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn("Supabase configuration missing for session manager");
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          "X-Healthcare-App": "NeonPro-SessionManager",
          "X-LGPD-Compliance": "true",
        },
      },
    });

    // Load active sessions from database
    await this.loadActiveSessions();

    this.logger.info("Session manager initialized", {
      component: "session-manager",
      active_sessions: this.sessions.size,
    });
  }

  /**
   * Load active sessions from database
   */
  private async loadActiveSessions(): Promise<void> {
    if (!this.supabase) return;

    try {
      const { data: activeSessions, error } = await this.supabase
        .from("ai_sessions")
        .select("*")
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString());

      if (error) {
        this.logger.error("Failed to load active sessions", error);
        return;
      }

      if (activeSessions) {
        for (const session of activeSessions) {
          this.sessions.set(session.session_id, {
            sessionId: session.session_id,
            _userId: session.user_id,
            clinicId: session.clinic_id,
            userRole: session.user_role,
            metadata: session.session_data || {},
            isActive: session.is_active,
            createdAt: new Date(session.created_at),
            expiresAt: new Date(session.expires_at),
            lastActivityAt: new Date(session.last_activity_at),
          });

          // Set up activity timeout
          this.setupActivityTimeout(session.session_id);
        }

        this.logger.info("Active sessions loaded", {
          count: activeSessions.length,
        });
      }
    } catch (error) {
      this.logger.error("Error loading active sessions", error as Error);
    }
  }

  /**
   * Create a new session
   */
  public async createSession(params: {
    _userId: string;
    clinicId: string;
    userRole: string;
    metadata?: any;
    expirationMinutes?: number;
  }): Promise<string> {
    const sessionId = this.generateSessionId();
    const _now = new Date();
    const expirationMinutes = Math.min(
      params.expirationMinutes || this.config.defaultExpirationMinutes,
      this.config.maxExpirationMinutes,
    );
    const expiresAt = new Date(now.getTime() + expirationMinutes * 60 * 1000);

    // Check session limits per user
    await this.enforceSessionLimits(params._userId);

    const sessionData: SessionData = {
      sessionId,
      _userId: params.userId,
      clinicId: params.clinicId,
      userRole: params.userRole as any,
      metadata: params.metadata || {},
      isActive: true,
      createdAt: now,
      expiresAt,
      lastActivityAt: now,
    };

    // Store in memory
    this.sessions.set(sessionId, sessionData);

    // Store in database
    if (this.supabase) {
      try {
        const { error } = await this.supabase.from("ai_sessions").insert({
          session_id: sessionId,
          clinic_id: params.clinicId,
          user_id: params.userId,
          user_role: params.userRole,
          session_data: params.metadata || {},
          is_active: true,
          expires_at: expiresAt.toISOString(),
          last_activity_at: now.toISOString(),
        });

        if (error) {
          this.logger.error("Failed to store session in database", error);
        }
      } catch (error) {
        this.logger.error("Error storing session", error as Error);
      }
    }

    // Setup activity timeout
    this.setupActivityTimeout(sessionId);

    // Log session creation
    this.logger.logSessionEvent(
      sessionId,
      params.userId,
      params.clinicId,
      "start",
      {
        user_role: params.userRole,
        expiration_minutes: expirationMinutes,
        metadata: params.metadata,
      },
    );

    this.logger.info("Session created", {
      sessionId,
      _userId: params.userId,
      clinicId: params.clinicId,
      expiresAt: expiresAt.toISOString(),
    });

    return sessionId;
  }

  /**
   * Get session data
   */
  public getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (!session.isActive || session.expiresAt < new Date()) {
      this.expireSession(sessionId, "expired");
      return null;
    }

    return session;
  }

  /**
   * Update session activity
   */
  public async updateActivity(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);

    if (!session || !session.isActive) {
      return false;
    }

    const _now = new Date();
    session.lastActivityAt = now;

    // Update in database
    if (this.supabase) {
      try {
        const { error } = await this.supabase
          .from("ai_sessions")
          .update({ last_activity_at: now.toISOString() })
          .eq("session_id", sessionId);

        if (error) {
          this.logger.error("Failed to update session activity", error);
        }
      } catch (error) {
        this.logger.error("Error updating session activity", error as Error);
      }
    }

    // Reset activity timeout
    this.setupActivityTimeout(sessionId);

    return true;
  }

  /**
   * Extend session expiration
   */
  public async extendSession(
    sessionId: string,
    additionalMinutes: number,
  ): Promise<boolean> {
    const session = this.sessions.get(sessionId);

    if (!session || !session.isActive) {
      return false;
    }

    const newExpiresAt = new Date(
      session.expiresAt.getTime() + additionalMinutes * 60 * 1000,
    );
    const maxExpiration = new Date(
      session.createdAt.getTime() +
        this.config.maxExpirationMinutes * 60 * 1000,
    );

    // Don't exceed maximum expiration time
    if (newExpiresAt > maxExpiration) {
      this.logger.warn(
        "Session extension denied - would exceed maximum expiration",
        {
          sessionId,
          requested: newExpiresAt.toISOString(),
          maximum: maxExpiration.toISOString(),
        },
      );
      return false;
    }

    session.expiresAt = newExpiresAt;

    // Update in database
    if (this.supabase) {
      try {
        const { error } = await this.supabase
          .from("ai_sessions")
          .update({ expires_at: newExpiresAt.toISOString() })
          .eq("session_id", sessionId);

        if (error) {
          this.logger.error("Failed to extend session", error);
          return false;
        }
      } catch (error) {
        this.logger.error("Error extending session", error as Error);
        return false;
      }
    }

    this.logger.info("Session extended", {
      sessionId,
      additionalMinutes,
      newExpiresAt: newExpiresAt.toISOString(),
    });

    return true;
  }

  /**
   * Expire session
   */
  public async expireSession(
    sessionId: string,
    reason: "expired" | "timeout" | "manual" | "error",
  ): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return;
    }

    // Mark as inactive
    session.isActive = false;

    // Update in database
    if (this.supabase) {
      try {
        const { error } = await this.supabase
          .from("ai_sessions")
          .update({ is_active: false })
          .eq("session_id", sessionId);

        if (error) {
          this.logger.error("Failed to expire session in database", error);
        }
      } catch (error) {
        this.logger.error("Error expiring session", error as Error);
      }
    }

    // Clear activity timeout
    const timeout = this.activityTimeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.activityTimeouts.delete(sessionId);
    }

    // Log session end
    this.logger.logSessionEvent(
      sessionId,
      session.userId,
      session.clinicId,
      reason === "timeout" ? "timeout" : "end",
      { reason },
    );

    this.logger.info("Session expired", {
      sessionId,
      reason,
      duration: Date.now() - session.createdAt.getTime(),
    });

    // Remove from memory after delay to allow cleanup
    setTimeout(() => {
      this.sessions.delete(sessionId);
    }, 30000); // 30 seconds
  }

  /**
   * Get all active sessions for a user
   */
  public getUserSessions(_userId: string): SessionData[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.userId === userId && session.isActive,
    );
  }

  /**
   * Get session count for a clinic
   */
  public getClinicSessionCount(clinicId: string): number {
    return Array.from(this.sessions.values()).filter(
      (session) => session.clinicId === clinicId && session.isActive,
    ).length;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Enforce session limits per user
   */
  private async enforceSessionLimits(_userId: string): Promise<void> {
    const userSessions = this.getUserSessions(userId);

    if (userSessions.length >= this.config.maxSessionsPerUser) {
      // Expire the oldest session
      const oldestSession = userSessions.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      )[0];

      if (oldestSession) {
        this.logger.info("Expiring oldest session due to limit", {
          userId,
          sessionId: oldestSession.sessionId,
          limit: this.config.maxSessionsPerUser,
        });

        await this.expireSession(oldestSession.sessionId, "manual");
      }
    }
  }

  /**
   * Setup activity timeout for session
   */
  private setupActivityTimeout(sessionId: string): void {
    // Clear existing timeout
    const existingTimeout = this.activityTimeouts.get(sessionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(
      () => {
        this.expireSession(sessionId, "timeout");
      },
      this.config.inactivityTimeoutMinutes * 60 * 1000,
    );

    this.activityTimeouts.set(sessionId, timeout);
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredSessions();
      },
      this.config.cleanupIntervalMinutes * 60 * 1000,
    );
  }

  /**
   * Cleanup expired sessions
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const _now = new Date();
    const expiredSessions: string[] = [];

    // Find expired sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      if (!session.isActive || session.expiresAt < now) {
        expiredSessions.push(sessionId);
      }
    }

    // Expire them
    for (const sessionId of expiredSessions) {
      await this.expireSession(sessionId, "expired");
    }

    // Cleanup database if Supabase is available
    if (this.supabase && expiredSessions.length > 0) {
      try {
        // Call cleanup function
        const { error } = await this.supabase.rpc("cleanup_expired_ai_data");

        if (error) {
          this.logger.error("Failed to cleanup expired data", error);
        } else {
          this.logger.info("Expired sessions cleaned up", {
            count: expiredSessions.length,
          });
        }
      } catch (error) {
        this.logger.error("Error during cleanup", error as Error);
      }
    }
  }

  /**
   * Get session statistics
   */
  public getStats(): any {
    const sessions = Array.from(this.sessions.values());
    const activeSessions = sessions.filter((s) => s.isActive);

    return {
      total_sessions: sessions.length,
      active_sessions: activeSessions.length,
      expired_sessions: sessions.length - activeSessions.length,
      sessions_by_role: activeSessions.reduce(
        (acc, session) => {
          acc[session.userRole] = (acc[session.userRole] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      average_session_duration: this.calculateAverageSessionDuration(sessions),
      config: this.config,
      memory_usage: {
        sessions_map_size: this.sessions.size,
        activity_timeouts: this.activityTimeouts.size,
      },
    };
  }

  /**
   * Calculate average session duration
   */
  private calculateAverageSessionDuration(sessions: SessionData[]): number {
    if (sessions.length === 0) return 0;

    const totalDuration = sessions.reduce((sum, session) => {
      const duration = session.isActive
        ? Date.now() - session.createdAt.getTime()
        : session.lastActivityAt.getTime() - session.createdAt.getTime();
      return sum + duration;
    }, 0);

    return Math.round(totalDuration / sessions.length / 1000 / 60); // minutes
  }

  /**
   * Shutdown session manager
   */
  public async shutdown(): Promise<void> {
    this.logger.info("Shutting down session manager", {
      active_sessions: this.sessions.size,
    });

    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Clear all activity timeouts
    for (const timeout of this.activityTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.activityTimeouts.clear();

    // Expire all active sessions
    const activeSessions = Array.from(this.sessions.keys());
    for (const sessionId of activeSessions) {
      await this.expireSession(sessionId, "manual");
    }

    // Final cleanup
    await this.cleanupExpiredSessions();

    this.logger.info("Session manager shutdown completed");
  }
}
