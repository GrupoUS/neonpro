// Session Manager Service
// Story 1.4: Session Management & Security Implementation

import type { createClient } from "@supabase/supabase-js";
import type { v4 as uuidv4 } from "uuid";
import type {
  UserSession,
  SessionSecurityEvent,
  DeviceRegistration,
  SessionAuditLog,
  SessionManager,
  DeviceInfo,
  LocationInfo,
  SecurityEventType,
  SessionError,
  SessionErrorCode,
  SessionHooks,
} from "./types";
import type {
  getSessionConfig,
  getSessionPolicyForRole,
  getSecurityEventRiskScore,
  isHighRiskLocation,
  getLocationRiskScore,
  SUSPICIOUS_ACTIVITY_PATTERNS,
  DEVICE_TRUST_FACTORS,
} from "./config";
import type { SecurityMonitor } from "./security-monitor";
import type { DeviceFingerprint } from "./device-fingerprint";
import type { LocationService } from "./location-service";

export class SessionManagerService implements SessionManager {
  private supabase;
  private config;
  private securityMonitor: SecurityMonitor;
  private deviceFingerprint: DeviceFingerprint;
  private locationService: LocationService;
  private hooks: SessionHooks;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(hooks: SessionHooks = {}) {
    this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    this.config = getSessionConfig();
    this.securityMonitor = new SecurityMonitor();
    this.deviceFingerprint = new DeviceFingerprint();
    this.locationService = new LocationService();
    this.hooks = hooks;

    // Start cleanup interval
    this.startCleanupInterval();
  }

  // Core Session Management
  async createSession(
    userId: string,
    deviceInfo: DeviceInfo,
    loginMethod: string,
  ): Promise<UserSession> {
    try {
      // Check concurrent session limits
      await this.enforceSessionLimits(userId);

      // Register or update device
      const device = await this.registerDevice(userId, deviceInfo);

      // Get location info
      const location = await this.locationService.getLocationInfo(deviceInfo.userAgent);

      // Calculate security level
      const securityLevel = await this.calculateSecurityLevel(userId, device, location);

      // Generate tokens
      const sessionToken = this.generateSecureToken();
      const refreshToken = this.generateSecureToken();
      const accessToken = this.generateSecureToken();

      // Create session record
      const session: Partial<UserSession> = {
        id: uuidv4(),
        user_id: userId,
        device_id: device.id,
        device_fingerprint: deviceInfo.fingerprint,
        device_name: deviceInfo.name,
        device_type: deviceInfo.type,
        browser_name: deviceInfo.browser.name,
        browser_version: deviceInfo.browser.version,
        os_name: deviceInfo.os.name,
        os_version: deviceInfo.os.version,
        ip_address: location.ip,
        location: {
          country: location.country,
          region: location.region,
          city: location.city,
          timezone: location.timezone,
        },
        session_token: sessionToken,
        refresh_token: refreshToken,
        access_token: accessToken,
        expires_at: new Date(Date.now() + this.config.defaultSessionDuration * 60 * 1000),
        last_activity: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true,
        is_trusted: device.is_trusted,
        login_method,
        security_level: securityLevel,
        session_data: {},
      };

      // Insert session into database
      const { data: sessionData, error } = await this.supabase
        .from("user_sessions")
        .insert(session)
        .select()
        .single();

      if (error) {
        throw new SessionError("Failed to create session", "SYSTEM_ERROR", session.id, userId);
      }

      const createdSession = sessionData as UserSession;

      // Log session creation
      await this.logSessionActivity(createdSession.id, userId, "session_created", {
        device_info: deviceInfo,
        location_info: location,
        security_level: securityLevel,
      });

      // Log security event
      await this.handleSecurityEvent({
        session_id: createdSession.id,
        user_id: userId,
        event_type: "login_success",
        event_category: "authentication",
        severity: "low",
        description: `Successful login from ${deviceInfo.name}`,
        metadata: { device_info: deviceInfo, location_info: location },
        ip_address: location.ip,
        user_agent: deviceInfo.userAgent,
        device_fingerprint: deviceInfo.fingerprint,
        location: {
          country: location.country,
          region: location.region,
          city: location.city,
        },
        risk_score: 0,
        is_blocked: false,
        resolution_status: "resolved",
      });

      // Call hook
      this.hooks.onSessionCreated?.(createdSession);

      return createdSession;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  async refreshSession(sessionToken: string): Promise<UserSession> {
    try {
      // Validate current session
      const session = await this.validateSession(sessionToken);
      if (!session) {
        throw new SessionError("Session not found", "SESSION_NOT_FOUND");
      }

      // Check if session is expired
      if (new Date() > session.expires_at) {
        await this.terminateSession(session.id, "expired");
        throw new SessionError("Session expired", "SESSION_EXPIRED", session.id, session.user_id);
      }

      // Generate new tokens
      const newAccessToken = this.generateSecureToken();
      const newRefreshToken = this.generateSecureToken();

      // Update session
      const { data: updatedSession, error } = await this.supabase
        .from("user_sessions")
        .update({
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          last_activity: new Date(),
          updated_at: new Date(),
        })
        .eq("id", session.id)
        .select()
        .single();

      if (error) {
        throw new SessionError(
          "Failed to refresh session",
          "SYSTEM_ERROR",
          session.id,
          session.user_id,
        );
      }

      const refreshedSession = updatedSession as UserSession;

      // Log activity
      await this.logSessionActivity(session.id, session.user_id, "session_refreshed", {
        new_access_token: newAccessToken.substring(0, 10) + "...",
      });

      // Call hook
      this.hooks.onSessionRefreshed?.(refreshedSession);

      return refreshedSession;
    } catch (error) {
      console.error("Error refreshing session:", error);
      throw error;
    }
  }

  async extendSession(sessionId: string, duration?: number): Promise<UserSession> {
    try {
      const session = await this.getSessionById(sessionId);
      if (!session) {
        throw new SessionError("Session not found", "SESSION_NOT_FOUND", sessionId);
      }

      // Get user's session policy
      const userRole = await this.getUserRole(session.user_id);
      const policy = getSessionPolicyForRole(userRole);

      // Check if extension is allowed
      if (!policy.settings?.session_extension_allowed) {
        throw new SessionError(
          "Session extension not allowed",
          "INSUFFICIENT_PERMISSIONS",
          sessionId,
          session.user_id,
        );
      }

      // Calculate new expiry time
      const extensionDuration = duration || this.config.defaultSessionDuration;
      const maxDuration = policy.settings?.max_session_duration || this.config.maxSessionDuration;
      const newExpiryTime = new Date(
        Date.now() + Math.min(extensionDuration, maxDuration) * 60 * 1000,
      );

      // Update session
      const { data: extendedSession, error } = await this.supabase
        .from("user_sessions")
        .update({
          expires_at: newExpiryTime,
          updated_at: new Date(),
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) {
        throw new SessionError(
          "Failed to extend session",
          "SYSTEM_ERROR",
          sessionId,
          session.user_id,
        );
      }

      // Log activity
      await this.logSessionActivity(sessionId, session.user_id, "session_extended", {
        extension_duration: extensionDuration,
        new_expiry: newExpiryTime,
      });

      return extendedSession as UserSession;
    } catch (error) {
      console.error("Error extending session:", error);
      throw error;
    }
  }

  async terminateSession(sessionId: string, reason?: string): Promise<void> {
    try {
      const session = await this.getSessionById(sessionId);
      if (!session) {
        return; // Session already terminated or doesn't exist
      }

      // Update session as inactive
      const { error } = await this.supabase
        .from("user_sessions")
        .update({
          is_active: false,
          updated_at: new Date(),
        })
        .eq("id", sessionId);

      if (error) {
        throw new SessionError(
          "Failed to terminate session",
          "SYSTEM_ERROR",
          sessionId,
          session.user_id,
        );
      }

      // Log activity
      await this.logSessionActivity(sessionId, session.user_id, "session_terminated", {
        reason: reason || "manual",
        terminated_at: new Date(),
      });

      // Log security event
      await this.handleSecurityEvent({
        session_id: sessionId,
        user_id: session.user_id,
        event_type: "session_terminated",
        event_category: "session",
        severity: "low",
        description: `Session terminated: ${reason || "manual"}`,
        metadata: { reason, terminated_at: new Date() },
        ip_address: session.ip_address,
        user_agent: `${session.browser_name} ${session.browser_version}`,
        device_fingerprint: session.device_fingerprint,
        risk_score: 0,
        is_blocked: false,
        resolution_status: "resolved",
      });

      // Call hook
      this.hooks.onSessionTerminated?.(session, reason);
    } catch (error) {
      console.error("Error terminating session:", error);
      throw error;
    }
  }

  async terminateAllSessions(userId: string, exceptSessionId?: string): Promise<void> {
    try {
      let query = this.supabase
        .from("user_sessions")
        .update({ is_active: false, updated_at: new Date() })
        .eq("user_id", userId)
        .eq("is_active", true);

      if (exceptSessionId) {
        query = query.neq("id", exceptSessionId);
      }

      const { error } = await query;

      if (error) {
        throw new SessionError("Failed to terminate sessions", "SYSTEM_ERROR", undefined, userId);
      }

      // Log activity
      await this.logSessionActivity("bulk", userId, "session_terminated", {
        reason: "terminate_all",
        except_session: exceptSessionId,
        terminated_at: new Date(),
      });
    } catch (error) {
      console.error("Error terminating all sessions:", error);
      throw error;
    }
  }

  // Session Validation
  async validateSession(sessionToken: string): Promise<UserSession | null> {
    try {
      const { data: session, error } = await this.supabase
        .from("user_sessions")
        .select("*")
        .eq("session_token", sessionToken)
        .eq("is_active", true)
        .single();

      if (error || !session) {
        return null;
      }

      // Check if session is expired
      if (new Date() > new Date(session.expires_at)) {
        await this.terminateSession(session.id, "expired");
        return null;
      }

      return session as UserSession;
    } catch (error) {
      console.error("Error validating session:", error);
      return null;
    }
  }

  async checkSessionActivity(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSessionById(sessionId);
      if (!session || !session.is_active) {
        return false;
      }

      // Check if session has been idle too long
      const idleTime = Date.now() - new Date(session.last_activity).getTime();
      const idleTimeoutMs = this.config.idleTimeout * 60 * 1000;

      if (idleTime > idleTimeoutMs) {
        await this.terminateSession(sessionId, "idle_timeout");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking session activity:", error);
      return false;
    }
  }

  async updateLastActivity(sessionId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("user_sessions")
        .update({
          last_activity: new Date(),
          updated_at: new Date(),
        })
        .eq("id", sessionId);

      if (error) {
        console.error("Error updating last activity:", error);
      }
    } catch (error) {
      console.error("Error updating last activity:", error);
    }
  }

  // Helper methods
  private async getSessionById(sessionId: string): Promise<UserSession | null> {
    const { data: session } = await this.supabase
      .from("user_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    return session as UserSession | null;
  }

  private async getUserRole(userId: string): Promise<string> {
    // This would typically fetch from user_roles table
    // For now, return default role
    return "staff";
  }

  private generateSecureToken(): string {
    return uuidv4() + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2);
  }

  private async enforceSessionLimits(userId: string): Promise<void> {
    const { data: activeSessions } = await this.supabase
      .from("user_sessions")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (activeSessions && activeSessions.length >= this.config.maxConcurrentSessions) {
      // Terminate oldest session
      const { data: oldestSession } = await this.supabase
        .from("user_sessions")
        .select("id")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (oldestSession) {
        await this.terminateSession(oldestSession.id, "concurrent_limit_exceeded");
      }
    }
  }

  private async calculateSecurityLevel(
    userId: string,
    device: DeviceRegistration,
    location: LocationInfo,
  ): Promise<"low" | "medium" | "high" | "critical"> {
    let riskScore = 0;

    // Device trust factor
    if (!device.is_trusted) riskScore += 30;
    if (device.risk_indicators.length > 0) riskScore += 20;

    // Location risk factor
    if (isHighRiskLocation(location.country)) riskScore += 40;
    if (location.isVPN || location.isProxy) riskScore += 20;

    // Determine security level based on risk score
    if (riskScore >= 70) return "critical";
    if (riskScore >= 50) return "high";
    if (riskScore >= 30) return "medium";
    return "low";
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(
      async () => {
        try {
          await this.cleanupExpiredSessions();
          await this.cleanupOldAuditLogs();
        } catch (error) {
          console.error("Error in cleanup interval:", error);
        }
      },
      this.config.cleanupInterval * 60 * 1000,
    );
  }

  // Cleanup methods will be implemented in the next chunk
  async cleanupExpiredSessions(): Promise<number> {
    // Implementation will be added
    return 0;
  }

  async cleanupOldAuditLogs(): Promise<number> {
    // Implementation will be added
    return 0;
  }

  // Security methods will be implemented in the next chunk
  async detectSuspiciousActivity(
    session: UserSession,
    activity: any,
  ): Promise<SecurityEventType[]> {
    // Implementation will be added
    return [];
  }

  async calculateRiskScore(session: UserSession, activity: any): Promise<number> {
    // Implementation will be added
    return 0;
  }

  async handleSecurityEvent(event: Partial<SessionSecurityEvent>): Promise<void> {
    // Implementation will be added
  }

  async registerDevice(userId: string, deviceInfo: DeviceInfo): Promise<DeviceRegistration> {
    // Implementation will be added
    return {} as DeviceRegistration;
  }

  async verifyDevice(deviceFingerprint: string, userId: string): Promise<boolean> {
    // Implementation will be added
    return true;
  }

  async trustDevice(deviceId: string, userId: string): Promise<void> {
    // Implementation will be added
  }

  private async logSessionActivity(
    sessionId: string,
    userId: string,
    action: string,
    details: any,
  ): Promise<void> {
    // Implementation will be added
  }
}

// Custom error class
class SessionError extends Error implements SessionError {
  constructor(
    message: string,
    public code: SessionErrorCode,
    public sessionId?: string,
    public userId?: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = "SessionError";
  }
}
