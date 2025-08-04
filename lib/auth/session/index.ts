/**
 * Session Management System - Main Export Index
 * 
 * This file serves as the main entry point for the NeonPro session management system,
 * providing a unified interface for all session-related functionality including
 * authentication, device management, security monitoring, and data cleanup.
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
 */

// Core Session Management
export { UnifiedSessionSystem } from './UnifiedSessionSystem';
export { SessionManager } from './SessionManager';
export { DeviceManager } from './DeviceManager';
export { SecurityEventLogger } from './SecurityEventLogger';
export { NotificationService } from './NotificationService';
export { DataCleanupService } from './DataCleanupService';

// Configuration and Types
export * from './config';
export * from './types';
export * from './utils';

// React Hooks
export { useSession } from './hooks/useSession';
export { useDeviceManagement } from './hooks/useDeviceManagement';
export { useSecurityMonitoring } from './hooks/useSecurityMonitoring';
export { useNotifications } from './hooks/useNotifications';
export { useDataCleanup } from './hooks/useDataCleanup';

// React Components
export { SessionStatus } from '../../../components/auth/session/SessionStatus';
export { SessionWarning } from '../../../components/auth/session/SessionWarning';
export { DeviceManagement } from '../../../components/auth/session/DeviceManagement';
export { SecurityDashboard } from '../../../components/auth/session/SecurityDashboard';

// Component Collections
export {
  SessionComponents,
  StatusComponents,
  ManagementComponents,
  defaultSessionConfig
} from '../../../components/auth/session';

// API Utilities
export const API_ENDPOINTS = {
  session: '/api/auth/session',
  devices: '/api/auth/devices',
  security: '/api/auth/security',
  notifications: '/api/auth/notifications',
  cleanup: '/api/auth/cleanup'
} as const;

// Session Management Factory
export class SessionManagementFactory {
  private static instance: UnifiedSessionSystem | null = null;

  /**
   * Get or create the singleton instance of UnifiedSessionSystem
   */
  static getInstance(): UnifiedSessionSystem {
    if (!this.instance) {
      this.instance = new UnifiedSessionSystem();
    }
    return this.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Create a new instance with custom configuration
   */
  static createInstance(config?: Partial<SessionConfig>): UnifiedSessionSystem {
    return new UnifiedSessionSystem(config);
  }
}

// Convenience exports for common operations
export const sessionManager = SessionManagementFactory.getInstance();

// Type guards and validators
export const SessionValidators = {
  isValidSession: (session: any): session is SessionData => {
    return session && 
           typeof session.id === 'string' &&
           typeof session.userId === 'string' &&
           typeof session.status === 'string' &&
           ['active', 'expired', 'terminated'].includes(session.status);
  },

  isValidDevice: (device: any): device is DeviceInfo => {
    return device &&
           typeof device.id === 'string' &&
           typeof device.fingerprint === 'string' &&
           typeof device.trusted === 'boolean';
  },

  isValidSecurityEvent: (event: any): event is SecurityEvent => {
    return event &&
           typeof event.id === 'string' &&
           typeof event.type === 'string' &&
           typeof event.severity === 'string' &&
           ['low', 'medium', 'high', 'critical'].includes(event.severity);
  }
};

// Error classes
export class SessionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'SessionError';
  }
}

export class DeviceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'DeviceError';
  }
}

export class SecurityError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 403
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

// Constants
export const SESSION_CONSTANTS = {
  DEFAULT_SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  MAX_CONCURRENT_SESSIONS: 5,
  DEVICE_TRUST_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
  SECURITY_EVENT_RETENTION: 90 * 24 * 60 * 60 * 1000, // 90 days
  NOTIFICATION_RETENTION: 30 * 24 * 60 * 60 * 1000, // 30 days
  CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 8,
  SESSION_REFRESH_THRESHOLD: 60 * 60 * 1000, // 1 hour
  DEVICE_FINGERPRINT_ALGORITHM: 'sha256'
} as const;

// Version information
export const SESSION_SYSTEM_VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  build: Date.now(),
  toString: () => `${SESSION_SYSTEM_VERSION.major}.${SESSION_SYSTEM_VERSION.minor}.${SESSION_SYSTEM_VERSION.patch}`
} as const;

// Development utilities
export const DevUtils = {
  /**
   * Enable debug mode for session management
   */
  enableDebugMode: () => {
    if (typeof window !== 'undefined') {
      (window as any).__NEONPRO_SESSION_DEBUG__ = true;
    }
  },

  /**
   * Disable debug mode
   */
  disableDebugMode: () => {
    if (typeof window !== 'undefined') {
      delete (window as any).__NEONPRO_SESSION_DEBUG__;
    }
  },

  /**
   * Get current session state for debugging
   */
  getDebugState: async () => {
    const session = SessionManagementFactory.getInstance();
    return {
      version: SESSION_SYSTEM_VERSION.toString(),
      currentSession: await session.getCurrentSession(),
      deviceCount: (await session.getDevices()).length,
      recentEvents: await session.getSecurityEvents({ limit: 5 })
    };
  }
};

// Export default instance for convenience
export default sessionManager;

/**
 * Re-export commonly used types for convenience
 */
export type {
  SessionData,
  DeviceInfo,
  SecurityEvent,
  NotificationData,
  SessionConfig,
  DeviceConfig,
  SecurityConfig,
  NotificationConfig,
  CleanupConfig,
  SessionActivity,
  AuditLog,
  SessionMetrics,
  DeviceMetrics,
  SecurityMetrics,
  NotificationMetrics,
  CleanupMetrics,
  SessionContextType,
  DeviceContextType,
  SecurityContextType,
  NotificationContextType,
  CleanupContextType
} from './types';
