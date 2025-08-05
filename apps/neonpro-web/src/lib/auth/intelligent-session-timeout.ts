/**
 * Intelligent Session Timeout System
 * Story 1.4 - Task 1: Implements configurable session timeout per user role
 * with activity-based session extension logic and graceful session expiry
 */

import type { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import type { UserRole } from "@/types/auth";

export interface SessionTimeoutConfig {
  role: UserRole;
  defaultTimeoutMinutes: number;
  maxTimeoutMinutes: number;
  warningThresholds: number[]; // Minutes before expiry to show warnings
  activityExtensionMinutes: number;
  gracePeriodMinutes: number;
}

export interface SessionActivity {
  sessionId: string;
  userId: string;
  lastActivity: Date;
  activityType: "mouse" | "keyboard" | "api_call" | "page_navigation" | "form_interaction";
  metadata?: Record<string, any>;
}

export interface SessionTimeoutWarning {
  sessionId: string;
  warningType: "5min" | "1min" | "final";
  expiresAt: Date;
  canExtend: boolean;
  extensionMinutes?: number;
}

export interface SessionPreservationData {
  formData: Record<string, any>;
  currentPage: string;
  scrollPosition: number;
  unsavedChanges: boolean;
  temporaryData: Record<string, any>;
}

// Default timeout configurations per role
const DEFAULT_TIMEOUT_CONFIGS: Record<UserRole, SessionTimeoutConfig> = {
  owner: {
    role: "owner",
    defaultTimeoutMinutes: 60, // 1 hour
    maxTimeoutMinutes: 480, // 8 hours
    warningThresholds: [15, 5, 1], // 15min, 5min, 1min warnings
    activityExtensionMinutes: 30,
    gracePeriodMinutes: 5,
  },
  manager: {
    role: "manager",
    defaultTimeoutMinutes: 45, // 45 minutes
    maxTimeoutMinutes: 240, // 4 hours
    warningThresholds: [10, 5, 1],
    activityExtensionMinutes: 20,
    gracePeriodMinutes: 3,
  },
  staff: {
    role: "staff",
    defaultTimeoutMinutes: 30, // 30 minutes
    maxTimeoutMinutes: 120, // 2 hours
    warningThresholds: [10, 5, 1],
    activityExtensionMinutes: 15,
    gracePeriodMinutes: 2,
  },
  patient: {
    role: "patient",
    defaultTimeoutMinutes: 20, // 20 minutes
    maxTimeoutMinutes: 60, // 1 hour
    warningThresholds: [5, 2, 1],
    activityExtensionMinutes: 10,
    gracePeriodMinutes: 1,
  },
};

class IntelligentSessionTimeout {
  private static instance: IntelligentSessionTimeout;
  private supabase = createClient();
  private timeoutConfigs: Map<UserRole, SessionTimeoutConfig> = new Map();
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();
  private warningTimers: Map<string, NodeJS.Timeout[]> = new Map();
  private activityListeners: Map<string, () => void> = new Map();
  private preservationData: Map<string, SessionPreservationData> = new Map();

  private constructor() {
    this.initializeDefaultConfigs();
    this.setupGlobalActivityListeners();
  }

  public static getInstance(): IntelligentSessionTimeout {
    if (!IntelligentSessionTimeout.instance) {
      IntelligentSessionTimeout.instance = new IntelligentSessionTimeout();
    }
    return IntelligentSessionTimeout.instance;
  }

  /**
   * Initialize session timeout for a user
   */
  public async initializeSessionTimeout(
    sessionId: string,
    userId: string,
    userRole: UserRole,
    customConfig?: Partial<SessionTimeoutConfig>,
  ): Promise<void> {
    try {
      const config = this.getTimeoutConfig(userRole, customConfig);

      // Store session timeout configuration
      await this.storeSessionConfig(sessionId, userId, config);

      // Start timeout timer
      this.startTimeoutTimer(sessionId, config.defaultTimeoutMinutes);

      // Setup warning timers
      this.setupWarningTimers(sessionId, config);

      // Setup activity tracking
      this.setupActivityTracking(sessionId, userId);

      // Log session timeout initialization
      await this.logSessionEvent(sessionId, "timeout_initialized", {
        config,
        expiresAt: new Date(Date.now() + config.defaultTimeoutMinutes * 60 * 1000),
      });
    } catch (error) {
      console.error("Failed to initialize session timeout:", error);
      throw new Error("Session timeout initialization failed");
    }
  }

  /**
   * Record user activity and extend session if needed
   */
  public async recordActivity(
    sessionId: string,
    activityType: SessionActivity["activityType"],
    metadata?: Record<string, any>,
  ): Promise<boolean> {
    try {
      const session = await this.getSessionData(sessionId);
      if (!session) {
        return false;
      }

      const now = new Date();
      const config = this.timeoutConfigs.get(session.user_role as UserRole);

      if (!config) {
        return false;
      }

      // Record activity
      await this.storeActivity(sessionId, session.user_id, activityType, metadata);

      // Check if session should be extended
      const shouldExtend = this.shouldExtendSession(session, now, config);

      if (shouldExtend) {
        await this.extendSession(sessionId, config.activityExtensionMinutes);
        return true;
      }

      // Update last activity timestamp
      await this.updateLastActivity(sessionId, now);

      return false;
    } catch (error) {
      console.error("Failed to record activity:", error);
      return false;
    }
  }

  /**
   * Manually extend session (user-initiated)
   */
  public async extendSession(sessionId: string, extensionMinutes: number): Promise<boolean> {
    try {
      const session = await this.getSessionData(sessionId);
      if (!session) {
        return false;
      }

      const config = this.timeoutConfigs.get(session.user_role as UserRole);
      if (!config) {
        return false;
      }

      // Check if extension is within limits
      const currentDuration = Date.now() - new Date(session.created_at).getTime();
      const newDuration = currentDuration + extensionMinutes * 60 * 1000;
      const maxDuration = config.maxTimeoutMinutes * 60 * 1000;

      if (newDuration > maxDuration) {
        const remainingMinutes = Math.max(0, (maxDuration - currentDuration) / (60 * 1000));
        extensionMinutes = Math.floor(remainingMinutes);
      }

      if (extensionMinutes <= 0) {
        return false;
      }

      // Clear existing timers
      this.clearSessionTimers(sessionId);

      // Update session expiry
      const newExpiresAt = new Date(Date.now() + extensionMinutes * 60 * 1000);
      await this.updateSessionExpiry(sessionId, newExpiresAt);

      // Restart timers
      this.startTimeoutTimer(sessionId, extensionMinutes);
      this.setupWarningTimers(sessionId, config, extensionMinutes);

      // Log extension
      await this.logSessionEvent(sessionId, "session_extended", {
        extensionMinutes,
        newExpiresAt,
        remainingMaxTime: (maxDuration - newDuration) / (60 * 1000),
      });

      return true;
    } catch (error) {
      console.error("Failed to extend session:", error);
      return false;
    }
  }

  /**
   * Show timeout warning to user
   */
  public async showTimeoutWarning(
    sessionId: string,
    warningType: SessionTimeoutWarning["warningType"],
  ): Promise<void> {
    try {
      const session = await this.getSessionData(sessionId);
      if (!session) {
        return;
      }

      const config = this.timeoutConfigs.get(session.user_role as UserRole);
      if (!config) {
        return;
      }

      const warning: SessionTimeoutWarning = {
        sessionId,
        warningType,
        expiresAt: new Date(session.expires_at),
        canExtend: this.canExtendSession(session, config),
        extensionMinutes: config.activityExtensionMinutes,
      };

      // Emit warning event (to be caught by UI components)
      this.emitWarningEvent(warning);

      // Log warning
      await this.logSessionEvent(sessionId, "timeout_warning", {
        warningType,
        expiresAt: warning.expiresAt,
        canExtend: warning.canExtend,
      });
    } catch (error) {
      console.error("Failed to show timeout warning:", error);
    }
  }

  /**
   * Gracefully expire session with data preservation
   */
  public async expireSession(sessionId: string, preserveData: boolean = true): Promise<void> {
    try {
      const session = await this.getSessionData(sessionId);
      if (!session) {
        return;
      }

      // Preserve user data if requested
      if (preserveData) {
        await this.preserveSessionData(sessionId);
      }

      // Clear all timers
      this.clearSessionTimers(sessionId);

      // Remove activity listeners
      this.removeActivityListeners(sessionId);

      // Mark session as expired
      await this.markSessionExpired(sessionId);

      // Log session expiry
      await this.logSessionEvent(sessionId, "session_expired", {
        preservedData: preserveData,
        gracefulExpiry: true,
      });

      // Emit session expired event
      this.emitSessionExpiredEvent(sessionId, preserveData);
    } catch (error) {
      console.error("Failed to expire session gracefully:", error);
    }
  }

  /**
   * Get session analytics and activity data
   */
  public async getSessionAnalytics(sessionId: string): Promise<{
    totalDuration: number;
    activityCount: number;
    extensionCount: number;
    warningCount: number;
    lastActivity: Date;
    activityPattern: Record<string, number>;
  } | null> {
    try {
      const { data: activities } = await this.supabase
        .from("session_activities")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      const { data: events } = await this.supabase
        .from("session_events")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (!activities || !events) {
        return null;
      }

      const session = await this.getSessionData(sessionId);
      if (!session) {
        return null;
      }

      const totalDuration = Date.now() - new Date(session.created_at).getTime();
      const extensionCount = events.filter((e) => e.event_type === "session_extended").length;
      const warningCount = events.filter((e) => e.event_type === "timeout_warning").length;

      const activityPattern = activities.reduce(
        (acc, activity) => {
          acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const lastActivity =
        activities.length > 0
          ? new Date(activities[activities.length - 1].created_at)
          : new Date(session.created_at);

      return {
        totalDuration,
        activityCount: activities.length,
        extensionCount,
        warningCount,
        lastActivity,
        activityPattern,
      };
    } catch (error) {
      console.error("Failed to get session analytics:", error);
      return null;
    }
  }

  // Private helper methods

  private initializeDefaultConfigs(): void {
    Object.entries(DEFAULT_TIMEOUT_CONFIGS).forEach(([role, config]) => {
      this.timeoutConfigs.set(role as UserRole, config);
    });
  }

  private getTimeoutConfig(
    userRole: UserRole,
    customConfig?: Partial<SessionTimeoutConfig>,
  ): SessionTimeoutConfig {
    const defaultConfig = this.timeoutConfigs.get(userRole) || DEFAULT_TIMEOUT_CONFIGS.staff;
    return { ...defaultConfig, ...customConfig };
  }

  private startTimeoutTimer(sessionId: string, timeoutMinutes: number): void {
    const timer = setTimeout(
      () => {
        this.expireSession(sessionId, true);
      },
      timeoutMinutes * 60 * 1000,
    );

    this.activeTimers.set(sessionId, timer);
  }

  private setupWarningTimers(
    sessionId: string,
    config: SessionTimeoutConfig,
    customTimeoutMinutes?: number,
  ): void {
    const timeoutMinutes = customTimeoutMinutes || config.defaultTimeoutMinutes;
    const timers: NodeJS.Timeout[] = [];

    config.warningThresholds.forEach((warningMinutes) => {
      if (warningMinutes < timeoutMinutes) {
        const delay = (timeoutMinutes - warningMinutes) * 60 * 1000;
        const timer = setTimeout(() => {
          const warningType =
            warningMinutes === 1 ? "final" : warningMinutes <= 5 ? "1min" : "5min";
          this.showTimeoutWarning(sessionId, warningType);
        }, delay);

        timers.push(timer);
      }
    });

    this.warningTimers.set(sessionId, timers);
  }

  private setupActivityTracking(sessionId: string, userId: string): void {
    const activityHandler = () => {
      this.recordActivity(sessionId, "mouse");
    };

    // Store reference for cleanup
    this.activityListeners.set(sessionId, activityHandler);

    // Add event listeners (if in browser environment)
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", activityHandler);
      window.addEventListener("keypress", activityHandler);
      window.addEventListener("scroll", activityHandler);
      window.addEventListener("click", activityHandler);
    }
  }

  private setupGlobalActivityListeners(): void {
    // Global activity tracking setup
    if (typeof window !== "undefined") {
      // Page visibility change
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
          // User returned to page - record activity for all active sessions
          this.recordGlobalActivity("page_focus");
        }
      });

      // Before unload - preserve data
      window.addEventListener("beforeunload", () => {
        this.preserveAllSessionData();
      });
    }
  }

  private clearSessionTimers(sessionId: string): void {
    // Clear main timeout timer
    const mainTimer = this.activeTimers.get(sessionId);
    if (mainTimer) {
      clearTimeout(mainTimer);
      this.activeTimers.delete(sessionId);
    }

    // Clear warning timers
    const warningTimers = this.warningTimers.get(sessionId);
    if (warningTimers) {
      warningTimers.forEach((timer) => clearTimeout(timer));
      this.warningTimers.delete(sessionId);
    }
  }

  private removeActivityListeners(sessionId: string): void {
    const handler = this.activityListeners.get(sessionId);
    if (handler && typeof window !== "undefined") {
      window.removeEventListener("mousemove", handler);
      window.removeEventListener("keypress", handler);
      window.removeEventListener("scroll", handler);
      window.removeEventListener("click", handler);
      this.activityListeners.delete(sessionId);
    }
  }

  private shouldExtendSession(session: any, now: Date, config: SessionTimeoutConfig): boolean {
    const lastActivity = new Date(session.last_activity);
    const timeSinceActivity = now.getTime() - lastActivity.getTime();
    const activityThreshold = 5 * 60 * 1000; // 5 minutes

    return timeSinceActivity > activityThreshold;
  }

  private canExtendSession(session: any, config: SessionTimeoutConfig): boolean {
    const sessionDuration = Date.now() - new Date(session.created_at).getTime();
    const maxDuration = config.maxTimeoutMinutes * 60 * 1000;

    return sessionDuration < maxDuration;
  }

  private async preserveSessionData(sessionId: string): Promise<void> {
    const preservationData = this.preservationData.get(sessionId);
    if (preservationData) {
      await this.supabase.from("session_preservation").upsert({
        session_id: sessionId,
        preservation_data: preservationData,
        created_at: new Date().toISOString(),
      });
    }
  }

  private async preserveAllSessionData(): Promise<void> {
    const promises = Array.from(this.preservationData.keys()).map((sessionId) =>
      this.preserveSessionData(sessionId),
    );
    await Promise.all(promises);
  }

  private async recordGlobalActivity(activityType: string): Promise<void> {
    // Record activity for all active sessions
    const activeSessions = Array.from(this.activeTimers.keys());
    const promises = activeSessions.map((sessionId) =>
      this.recordActivity(sessionId, "page_navigation", { global: true, type: activityType }),
    );
    await Promise.all(promises);
  }

  // Database operations

  private async storeSessionConfig(
    sessionId: string,
    userId: string,
    config: SessionTimeoutConfig,
  ): Promise<void> {
    await this.supabase.from("session_timeout_configs").upsert({
      session_id: sessionId,
      user_id: userId,
      config: config,
      created_at: new Date().toISOString(),
    });
  }

  private async storeActivity(
    sessionId: string,
    userId: string,
    activityType: SessionActivity["activityType"],
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.supabase.from("session_activities").insert({
      session_id: sessionId,
      user_id: userId,
      activity_type: activityType,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    });
  }

  private async updateLastActivity(sessionId: string, timestamp: Date): Promise<void> {
    await this.supabase
      .from("user_sessions")
      .update({ last_activity: timestamp.toISOString() })
      .eq("id", sessionId);
  }

  private async updateSessionExpiry(sessionId: string, expiresAt: Date): Promise<void> {
    await this.supabase
      .from("user_sessions")
      .update({ expires_at: expiresAt.toISOString() })
      .eq("id", sessionId);
  }

  private async markSessionExpired(sessionId: string): Promise<void> {
    await this.supabase
      .from("user_sessions")
      .update({
        status: "expired",
        expired_at: new Date().toISOString(),
      })
      .eq("id", sessionId);
  }

  private async getSessionData(sessionId: string): Promise<any> {
    const { data } = await this.supabase
      .from("user_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    return data;
  }

  private async logSessionEvent(
    sessionId: string,
    eventType: string,
    metadata: Record<string, any>,
  ): Promise<void> {
    await this.supabase.from("session_events").insert({
      session_id: sessionId,
      event_type: eventType,
      metadata,
      created_at: new Date().toISOString(),
    });
  }

  // Event emission methods (for UI integration)

  private emitWarningEvent(warning: SessionTimeoutWarning): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("session-timeout-warning", {
          detail: warning,
        }),
      );
    }
  }

  private emitSessionExpiredEvent(sessionId: string, dataPreserved: boolean): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("session-expired", {
          detail: { sessionId, dataPreserved },
        }),
      );
    }
  }

  /**
   * Update timeout configuration for a specific role
   */
  public updateTimeoutConfig(role: UserRole, config: Partial<SessionTimeoutConfig>): void {
    const currentConfig = this.timeoutConfigs.get(role) || DEFAULT_TIMEOUT_CONFIGS[role];
    this.timeoutConfigs.set(role, { ...currentConfig, ...config });
  }

  /**
   * Get current timeout configuration for a role
   */
  public getTimeoutConfigForRole(role: UserRole): SessionTimeoutConfig {
    return this.timeoutConfigs.get(role) || DEFAULT_TIMEOUT_CONFIGS[role];
  }

  /**
   * Cleanup all session data and timers
   */
  public cleanup(): void {
    // Clear all timers
    this.activeTimers.forEach((timer) => clearTimeout(timer));
    this.warningTimers.forEach((timers) => timers.forEach((timer) => clearTimeout(timer)));

    // Remove all activity listeners
    this.activityListeners.forEach((handler, sessionId) => {
      this.removeActivityListeners(sessionId);
    });

    // Clear maps
    this.activeTimers.clear();
    this.warningTimers.clear();
    this.activityListeners.clear();
    this.preservationData.clear();
  }
}

export const intelligentSessionTimeout = IntelligentSessionTimeout.getInstance();
export default IntelligentSessionTimeout;
