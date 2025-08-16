/**
 * Session Timeout Manager for NeonPro
 * Handles automatic session timeouts with progressive warnings
 */

import { createClient } from '@/app/utils/supabase/client';

export type SessionTimeoutConfig = {
  maxInactivityMinutes: number;
  warningIntervals: number[]; // Minutes before timeout to show warnings
  extendOnActivity: boolean;
  requireReauthForSensitive: boolean;
  gracePeriodMinutes: number;
};

export type SessionActivity = {
  sessionId: string;
  userId: string;
  lastActivity: number;
  activityType:
    | 'page_view'
    | 'api_call'
    | 'form_interaction'
    | 'mouse_move'
    | 'keyboard';
  path?: string;
  sensitive?: boolean;
};

export type TimeoutWarning = {
  level: 'info' | 'warning' | 'critical';
  minutesRemaining: number;
  message: string;
  actions: ('extend' | 'logout' | 'continue')[];
};

/**
 * Session Timeout Manager
 */
export class SessionTimeoutManager {
  private static readonly DEFAULT_CONFIG: SessionTimeoutConfig = {
    maxInactivityMinutes: 30,
    warningIntervals: [10, 5, 2, 1], // Show warnings at these minutes before timeout
    extendOnActivity: true,
    requireReauthForSensitive: true,
    gracePeriodMinutes: 2,
  };

  private static activityListeners: Map<string, NodeJS.Timeout> = new Map();
  private static warningTimers: Map<string, NodeJS.Timeout[]> = new Map();

  /**
   * Initialize session timeout for a user
   */
  static async initializeSessionTimeout(
    sessionId: string,
    userId: string,
    config: Partial<SessionTimeoutConfig> = {}
  ): Promise<void> {
    const fullConfig = { ...SessionTimeoutManager.DEFAULT_CONFIG, ...config };

    try {
      const supabase = createClient();

      // Store session timeout configuration
      await supabase.from('session_timeouts').upsert({
        session_id: sessionId,
        user_id: userId,
        config: fullConfig,
        last_activity: new Date().toISOString(),
        timeout_at: new Date(
          Date.now() + fullConfig.maxInactivityMinutes * 60 * 1000
        ).toISOString(),
        warnings_sent: [],
        is_active: true,
      });

      // Set up warning timers
      SessionTimeoutManager.setupWarningTimers(sessionId, fullConfig);

      // Set up activity monitoring
      SessionTimeoutManager.setupActivityMonitoring(
        sessionId,
        userId,
        fullConfig
      );
    } catch (_error) {}
  }

  /**
   * Update session activity
   */
  static async updateActivity(
    sessionId: string,
    activity: Omit<SessionActivity, 'sessionId'>
  ): Promise<void> {
    try {
      const supabase = createClient();
      const now = new Date();

      // Get current session timeout config
      const { data: sessionTimeout } = await supabase
        .from('session_timeouts')
        .select('config, warnings_sent')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .single();

      if (!sessionTimeout) {
        return;
      }

      const config = sessionTimeout.config as SessionTimeoutConfig;

      // Update last activity and reset timeout
      const newTimeoutAt = new Date(
        Date.now() + config.maxInactivityMinutes * 60 * 1000
      );

      await supabase
        .from('session_timeouts')
        .update({
          last_activity: now.toISOString(),
          timeout_at: newTimeoutAt.toISOString(),
          warnings_sent: [], // Reset warnings
        })
        .eq('session_id', sessionId);

      // Log activity
      await supabase.from('session_activities').insert({
        session_id: sessionId,
        user_id: activity.userId,
        activity_type: activity.activityType,
        path: activity.path,
        is_sensitive: activity.sensitive,
        timestamp: now.toISOString(),
      });

      // Reset warning timers if activity extends session
      if (config.extendOnActivity) {
        SessionTimeoutManager.clearWarningTimers(sessionId);
        SessionTimeoutManager.setupWarningTimers(sessionId, config);
      }
    } catch (_error) {}
  }

  /**
   * Check if session should timeout
   */
  static async checkSessionTimeout(sessionId: string): Promise<{
    shouldTimeout: boolean;
    timeRemaining: number;
    requiresReauth: boolean;
  }> {
    try {
      const supabase = createClient();

      const { data: sessionTimeout } = await supabase
        .from('session_timeouts')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .single();

      if (!sessionTimeout) {
        return { shouldTimeout: true, timeRemaining: 0, requiresReauth: true };
      }

      const timeoutAt = new Date(sessionTimeout.timeout_at).getTime();
      const now = Date.now();
      const timeRemaining = Math.max(0, timeoutAt - now);

      const config = sessionTimeout.config as SessionTimeoutConfig;
      const gracePeriod = config.gracePeriodMinutes * 60 * 1000;

      // Check if session has timed out
      const shouldTimeout = timeRemaining <= 0;

      // Check if requires reauth (within grace period or for sensitive operations)
      const requiresReauth =
        shouldTimeout ||
        (timeRemaining <= gracePeriod && config.requireReauthForSensitive);

      return {
        shouldTimeout,
        timeRemaining,
        requiresReauth,
      };
    } catch (_error) {
      return { shouldTimeout: true, timeRemaining: 0, requiresReauth: true };
    }
  }

  /**
   * Extend session timeout
   */
  static async extendSession(
    sessionId: string,
    additionalMinutes?: number
  ): Promise<boolean> {
    try {
      const supabase = createClient();

      const { data: sessionTimeout } = await supabase
        .from('session_timeouts')
        .select('config')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .single();

      if (!sessionTimeout) {
        return false;
      }

      const config = sessionTimeout.config as SessionTimeoutConfig;
      const extensionMinutes = additionalMinutes || config.maxInactivityMinutes;
      const newTimeoutAt = new Date(Date.now() + extensionMinutes * 60 * 1000);

      const { error } = await supabase
        .from('session_timeouts')
        .update({
          timeout_at: newTimeoutAt.toISOString(),
          warnings_sent: [], // Reset warnings
          last_activity: new Date().toISOString(),
        })
        .eq('session_id', sessionId);

      if (!error) {
        // Reset warning timers
        SessionTimeoutManager.clearWarningTimers(sessionId);
        SessionTimeoutManager.setupWarningTimers(sessionId, config);
      }

      return !error;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Force session timeout
   */
  static async forceTimeout(sessionId: string): Promise<boolean> {
    try {
      const supabase = createClient();

      // Mark session as inactive
      const { error } = await supabase
        .from('session_timeouts')
        .update({
          is_active: false,
          timeout_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);

      // Clear timers
      SessionTimeoutManager.clearWarningTimers(sessionId);
      SessionTimeoutManager.clearActivityListener(sessionId);

      return !error;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get timeout warning for display
   */
  static getTimeoutWarning(minutesRemaining: number): TimeoutWarning {
    if (minutesRemaining <= 1) {
      return {
        level: 'critical',
        minutesRemaining,
        message: `Your session will expire in ${minutesRemaining} minute(s). Please save your work.`,
        actions: ['extend', 'logout'],
      };
    }
    if (minutesRemaining <= 5) {
      return {
        level: 'warning',
        minutesRemaining,
        message: `Your session will expire in ${minutesRemaining} minutes due to inactivity.`,
        actions: ['extend', 'continue'],
      };
    }
    return {
      level: 'info',
      minutesRemaining,
      message: `Your session will expire in ${minutesRemaining} minutes. Click to extend.`,
      actions: ['extend'],
    };
  }

  /**
   * Setup warning timers
   */
  private static setupWarningTimers(
    sessionId: string,
    config: SessionTimeoutConfig
  ): void {
    const timers: NodeJS.Timeout[] = [];

    config.warningIntervals.forEach((warningMinutes) => {
      const warningTime =
        (config.maxInactivityMinutes - warningMinutes) * 60 * 1000;

      if (warningTime > 0) {
        const timer = setTimeout(() => {
          SessionTimeoutManager.sendTimeoutWarning(sessionId, warningMinutes);
        }, warningTime);

        timers.push(timer);
      }
    });

    // Set final timeout
    const timeoutTimer = setTimeout(
      () => {
        SessionTimeoutManager.forceTimeout(sessionId);
      },
      config.maxInactivityMinutes * 60 * 1000
    );

    timers.push(timeoutTimer);
    SessionTimeoutManager.warningTimers.set(sessionId, timers);
  }

  /**
   * Clear warning timers
   */
  private static clearWarningTimers(sessionId: string): void {
    const timers = SessionTimeoutManager.warningTimers.get(sessionId);
    if (timers) {
      timers.forEach((timer) => clearTimeout(timer));
      SessionTimeoutManager.warningTimers.delete(sessionId);
    }
  }

  /**
   * Setup activity monitoring
   */
  private static setupActivityMonitoring(
    _sessionId: string,
    _userId: string,
    _config: SessionTimeoutConfig
  ): void {
    // This would typically be handled client-side
    // Server-side we just track API calls and page views
  }

  /**
   * Clear activity listener
   */
  private static clearActivityListener(sessionId: string): void {
    const listener = SessionTimeoutManager.activityListeners.get(sessionId);
    if (listener) {
      clearTimeout(listener);
      SessionTimeoutManager.activityListeners.delete(sessionId);
    }
  }

  /**
   * Send timeout warning
   */
  private static async sendTimeoutWarning(
    sessionId: string,
    minutesRemaining: number
  ): Promise<void> {
    try {
      const supabase = createClient();

      // Update warnings sent
      const { data: sessionTimeout } = await supabase
        .from('session_timeouts')
        .select('warnings_sent')
        .eq('session_id', sessionId)
        .single();

      if (sessionTimeout) {
        const warningsSent = sessionTimeout.warnings_sent || [];
        warningsSent.push(minutesRemaining);

        await supabase
          .from('session_timeouts')
          .update({ warnings_sent: warningsSent })
          .eq('session_id', sessionId);
      }
    } catch (_error) {}
  }

  /**
   * Cleanup expired sessions
   */
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      const supabase = createClient();
      const now = new Date().toISOString();

      // Mark expired sessions as inactive
      await supabase
        .from('session_timeouts')
        .update({ is_active: false })
        .lt('timeout_at', now)
        .eq('is_active', true);

      // Clean up old session data (older than 30 days)
      const thirtyDaysAgo = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString();

      await supabase
        .from('session_activities')
        .delete()
        .lt('timestamp', thirtyDaysAgo);
    } catch (_error) {}
  }
}

export default SessionTimeoutManager;
