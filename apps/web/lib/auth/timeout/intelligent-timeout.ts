// Intelligent Session Timeout System
// Implements activity-based session management with role-specific timeouts

import { SessionConfig } from '@/lib/auth/config/session-config';
import { SessionUtils } from '@/lib/auth/utils/session-utils';
import type { UserRole, UserSession } from '@/types/session';

export interface ActivityEvent {
  type: ActivityType;
  timestamp: number;
  sessionId: string;
  userId: string;
  metadata?: Record<string, any>;
}

export type ActivityType =
  | 'mouse_move'
  | 'keyboard_input'
  | 'click'
  | 'scroll'
  | 'page_navigation'
  | 'api_call'
  | 'form_interaction'
  | 'file_upload'
  | 'data_entry'
  | 'system_interaction';

export interface TimeoutWarning {
  id: string;
  sessionId: string;
  warningType: 'initial' | 'final';
  timeRemaining: number; // seconds
  scheduledAt: number;
  dismissed: boolean;
  callback?: () => void;
}

export interface SessionTimeoutConfig {
  role: UserRole;
  baseTimeout: number; // minutes
  warningIntervals: number[]; // minutes before expiry
  extensionGracePeriod: number; // minutes
  maxExtensions: number;
  activityThreshold: number; // minimum activity events per minute
  inactivityGracePeriod: number; // minutes of grace after inactivity
}

export class IntelligentTimeoutManager {
  private readonly activityBuffer: Map<string, ActivityEvent[]> = new Map();
  private readonly timeoutTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly warningTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly activeWarnings: Map<string, TimeoutWarning[]> = new Map();
  private readonly sessionExtensions: Map<string, number> = new Map();
  private readonly config: SessionConfig;
  private readonly utils: SessionUtils;

  constructor() {
    this.config = SessionConfig.getInstance();
    this.utils = new SessionUtils();
    this.initializeActivityTracking();
  }

  /**
   * Initialize activity tracking for the current session
   */
  private initializeActivityTracking(): void {
    if (typeof window !== 'undefined') {
      // Mouse movement tracking
      document.addEventListener(
        'mousemove',
        this.throttle(() => {
          this.recordActivity('mouse_move');
        }, 1000)
      );

      // Keyboard input tracking
      document.addEventListener('keydown', () => {
        this.recordActivity('keyboard_input');
      });

      // Click tracking
      document.addEventListener('click', () => {
        this.recordActivity('click');
      });

      // Scroll tracking
      document.addEventListener(
        'scroll',
        this.throttle(() => {
          this.recordActivity('scroll');
        }, 2000)
      );

      // Page visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.recordActivity('page_navigation');
        }
      });

      // Form interaction tracking
      document.addEventListener('input', () => {
        this.recordActivity('form_interaction');
      });

      // Focus tracking
      window.addEventListener('focus', () => {
        this.recordActivity('system_interaction');
      });
    }
  }

  /**
   * Start timeout management for a session
   */
  public startTimeoutManagement(session: UserSession): void {
    const timeoutConfig = this.getTimeoutConfig(session.userId);
    const timeoutDuration = timeoutConfig.baseTimeout * 60 * 1000; // Convert to milliseconds

    // Clear any existing timers
    this.clearSessionTimers(session.id);

    // Initialize activity buffer
    this.activityBuffer.set(session.id, []);
    this.sessionExtensions.set(session.id, 0);

    // Schedule warning timers
    this.scheduleWarnings(session, timeoutConfig);

    // Schedule main timeout
    const timeoutTimer = setTimeout(() => {
      this.handleSessionTimeout(session);
    }, timeoutDuration);

    this.timeoutTimers.set(session.id, timeoutTimer);

    console.log(
      `Timeout management started for session ${session.id} with ${timeoutConfig.baseTimeout} minute timeout`
    );
  }

  /**
   * Record user activity
   */
  public recordActivity(
    type: ActivityType,
    metadata?: Record<string, any>
  ): void {
    const sessionId = this.getCurrentSessionId();
    if (!sessionId) {
      return;
    }

    const activity: ActivityEvent = {
      type,
      timestamp: Date.now(),
      sessionId,
      userId: this.getCurrentUserId() || '',
      metadata,
    };

    // Add to buffer
    const buffer = this.activityBuffer.get(sessionId) || [];
    buffer.push(activity);

    // Keep only last 100 activities
    if (buffer.length > 100) {
      buffer.shift();
    }

    this.activityBuffer.set(sessionId, buffer);

    // Check if session should be extended based on activity
    this.evaluateSessionExtension(sessionId);
  }

  /**
   * Record API call activity
   */
  public recordApiActivity(endpoint: string, method: string): void {
    this.recordActivity('api_call', {
      endpoint,
      method,
      timestamp: Date.now(),
    });
  }

  /**
   * Record data entry activity
   */
  public recordDataEntry(formId: string, fieldCount: number): void {
    this.recordActivity('data_entry', {
      formId,
      fieldCount,
      timestamp: Date.now(),
    });
  }

  /**
   * Get timeout configuration for user role
   */
  private getTimeoutConfig(userId: string): SessionTimeoutConfig {
    const userRole = this.getUserRole(userId);
    const policy = this.config.getSessionPolicy(userRole);

    return {
      role: userRole,
      baseTimeout: policy.maxSessionDuration,
      warningIntervals: [5, 1], // 5 minutes and 1 minute warnings
      extensionGracePeriod: 15,
      maxExtensions: 3,
      activityThreshold: 2, // 2 activities per minute
      inactivityGracePeriod: 5,
    };
  }

  /**
   * Schedule timeout warnings
   */
  private scheduleWarnings(
    session: UserSession,
    config: SessionTimeoutConfig
  ): void {
    const warnings: TimeoutWarning[] = [];

    config.warningIntervals.forEach((minutesBefore, index) => {
      const warningTime = (config.baseTimeout - minutesBefore) * 60 * 1000;
      const warningType =
        index === config.warningIntervals.length - 1 ? 'final' : 'initial';

      const timer = setTimeout(() => {
        this.showTimeoutWarning(session, minutesBefore * 60, warningType);
      }, warningTime);

      const warning: TimeoutWarning = {
        id: this.utils.generateSessionToken(),
        sessionId: session.id,
        warningType,
        timeRemaining: minutesBefore * 60,
        scheduledAt: Date.now() + warningTime,
        dismissed: false,
      };

      warnings.push(warning);
      this.warningTimers.set(`${session.id}_${warning.id}`, timer);
    });

    this.activeWarnings.set(session.id, warnings);
  }

  /**
   * Show timeout warning to user
   */
  private showTimeoutWarning(
    session: UserSession,
    timeRemaining: number,
    type: 'initial' | 'final'
  ): void {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    const message =
      type === 'final'
        ? `Sua sessão expirará em ${minutes}:${seconds.toString().padStart(2, '0')}. Clique em "Continuar" para estender.`
        : `Sua sessão expirará em ${minutes} minutos devido à inatividade.`;

    // Dispatch custom event for UI to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sessionTimeoutWarning', {
          detail: {
            sessionId: session.id,
            message,
            timeRemaining,
            type,
            canExtend: this.canExtendSession(session.id),
          },
        })
      );
    }

    console.warn(`Session timeout warning: ${message}`);
  }

  /**
   * Extend session timeout
   */
  public async extendSession(
    sessionId: string,
    reason?: string
  ): Promise<boolean> {
    if (!this.canExtendSession(sessionId)) {
      return false;
    }

    try {
      // Call session extension API
      const response = await fetch('/api/session/extend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extendMinutes: this.getTimeoutConfig('').extensionGracePeriod,
          reason: reason || 'User activity detected',
        }),
      });

      if (response.ok) {
        const extensions = this.sessionExtensions.get(sessionId) || 0;
        this.sessionExtensions.set(sessionId, extensions + 1);

        // Restart timeout management with new expiry
        const session = await this.getSessionById(sessionId);
        if (session) {
          this.startTimeoutManagement(session);
        }

        // Dismiss active warnings
        this.dismissWarnings(sessionId);

        console.log(`Session ${sessionId} extended successfully`);
        return true;
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
    }

    return false;
  }

  /**
   * Check if session can be extended
   */
  private canExtendSession(sessionId: string): boolean {
    const extensions = this.sessionExtensions.get(sessionId) || 0;
    const config = this.getTimeoutConfig('');
    return extensions < config.maxExtensions;
  }

  /**
   * Evaluate if session should be automatically extended based on activity
   */
  private evaluateSessionExtension(sessionId: string): void {
    const activities = this.activityBuffer.get(sessionId) || [];
    const now = Date.now();
    const recentActivities = activities.filter(
      (a) => now - a.timestamp < 60_000
    ); // Last minute

    const config = this.getTimeoutConfig('');
    if (recentActivities.length >= config.activityThreshold) {
      // High activity detected, consider auto-extension
      const warnings = this.activeWarnings.get(sessionId) || [];
      const hasActiveWarnings = warnings.some((w) => !w.dismissed);

      if (hasActiveWarnings && this.canExtendSession(sessionId)) {
        this.extendSession(sessionId, 'High user activity detected');
      }
    }
  }

  /**
   * Handle session timeout
   */
  private async handleSessionTimeout(session: UserSession): Promise<void> {
    try {
      // Check for recent activity before timing out
      const activities = this.activityBuffer.get(session.id) || [];
      const now = Date.now();
      const recentActivity = activities.find((a) => now - a.timestamp < 30_000); // Last 30 seconds

      if (recentActivity && this.canExtendSession(session.id)) {
        // Grace period extension for recent activity
        await this.extendSession(
          session.id,
          'Grace period for recent activity'
        );
        return;
      }

      // Terminate session
      await fetch('/api/session/terminate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Session timeout due to inactivity',
        }),
      });

      // Clean up
      this.clearSessionTimers(session.id);
      this.activityBuffer.delete(session.id);
      this.sessionExtensions.delete(session.id);
      this.activeWarnings.delete(session.id);

      // Notify user
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('sessionExpired', {
            detail: {
              sessionId: session.id,
              reason: 'Session expired due to inactivity',
            },
          })
        );
      }

      console.log(`Session ${session.id} timed out and terminated`);
    } catch (error) {
      console.error('Error handling session timeout:', error);
    }
  }

  /**
   * Dismiss timeout warnings
   */
  public dismissWarnings(sessionId: string): void {
    const warnings = this.activeWarnings.get(sessionId) || [];
    warnings.forEach((warning) => {
      warning.dismissed = true;
      const timerId = `${sessionId}_${warning.id}`;
      const timer = this.warningTimers.get(timerId);
      if (timer) {
        clearTimeout(timer);
        this.warningTimers.delete(timerId);
      }
    });
  }

  /**
   * Clear all timers for a session
   */
  private clearSessionTimers(sessionId: string): void {
    // Clear main timeout timer
    const timeoutTimer = this.timeoutTimers.get(sessionId);
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
      this.timeoutTimers.delete(sessionId);
    }

    // Clear warning timers
    const warnings = this.activeWarnings.get(sessionId) || [];
    warnings.forEach((warning) => {
      const timerId = `${sessionId}_${warning.id}`;
      const timer = this.warningTimers.get(timerId);
      if (timer) {
        clearTimeout(timer);
        this.warningTimers.delete(timerId);
      }
    });
  }

  /**
   * Get session activity analytics
   */
  public getSessionActivity(sessionId: string): {
    totalActivities: number;
    recentActivities: number;
    activityTypes: Record<ActivityType, number>;
    lastActivity: number;
    activityScore: number;
  } {
    const activities = this.activityBuffer.get(sessionId) || [];
    const now = Date.now();
    const recentActivities = activities.filter(
      (a) => now - a.timestamp < 300_000
    ); // Last 5 minutes

    const activityTypes: Record<ActivityType, number> = {
      mouse_move: 0,
      keyboard_input: 0,
      click: 0,
      scroll: 0,
      page_navigation: 0,
      api_call: 0,
      form_interaction: 0,
      file_upload: 0,
      data_entry: 0,
      system_interaction: 0,
    };

    activities.forEach((activity) => {
      activityTypes[activity.type]++;
    });

    const lastActivity =
      activities.length > 0 ? activities.at(-1).timestamp : 0;
    const activityScore = Math.min(100, (recentActivities.length / 10) * 100); // Score out of 100

    return {
      totalActivities: activities.length,
      recentActivities: recentActivities.length,
      activityTypes,
      lastActivity,
      activityScore,
    };
  }

  /**
   * Stop timeout management for a session
   */
  public stopTimeoutManagement(sessionId: string): void {
    this.clearSessionTimers(sessionId);
    this.activityBuffer.delete(sessionId);
    this.sessionExtensions.delete(sessionId);
    this.activeWarnings.delete(sessionId);
  }

  /**
   * Utility functions
   */
  private throttle(func: Function, limit: number): Function {
    let inThrottle: boolean;
    return function (this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  private getCurrentSessionId(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sessionId');
    }
    return null;
  }

  private getCurrentUserId(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId');
    }
    return null;
  }

  private getUserRole(_userId: string): UserRole {
    // This would typically come from user context or API
    // For now, return a default role
    return 'patient';
  }

  private async getSessionById(sessionId: string): Promise<UserSession | null> {
    try {
      const response = await fetch(
        `/api/session/validate?sessionId=${sessionId}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.session;
      }
    } catch (error) {
      console.error('Failed to get session:', error);
    }
    return null;
  }
}

// Singleton instance
let timeoutManager: IntelligentTimeoutManager | null = null;

export function getTimeoutManager(): IntelligentTimeoutManager {
  if (!timeoutManager) {
    timeoutManager = new IntelligentTimeoutManager();
  }
  return timeoutManager;
}

// Export for use in React components
export default IntelligentTimeoutManager;
