// Advanced Authentication System - Main Export
// Unified export for all authentication components
// Complete session management with security, monitoring, and compliance

// Re-export common types from session types
export type {
  SessionConfig as SessionConfigType,
  SessionMetrics,
  SessionPermission,
  SessionRole,
  SessionStatus,
  UserSession,
} from '@/types/session';
export type {
  AdvancedAuthConfig,
  AuthSystemEvent,
  AuthSystemStatus,
  ComponentStatus,
  HealthIssue,
  HealthStatus,
  PerformanceMetrics,
  SystemAlert,
  SystemMetrics,
} from './advanced-auth-system';
// Core system
export {
  AdvancedAuthSystem,
  getAdvancedAuthSystem,
  resetAdvancedAuthSystem,
} from './advanced-auth-system';
export type {
  AuditEvent,
  AuditMetrics,
  AuditQuery,
  AuditReport,
  ComplianceReport,
} from './audit/audit-trail';
// Audit trail
export { AuditTrailManager } from './audit/audit-trail';
export type {
  CleanupMetrics,
  CleanupSchedule,
  CleanupTarget,
  CleanupTask,
  RetentionPolicy,
} from './cleanup/data-cleanup';
// Data cleanup
export { DataCleanupManager } from './cleanup/data-cleanup';
export type {
  ConcurrentSessionConfig,
  ConcurrentSessionMetrics,
  ConflictResolution,
  SessionCreationCheck,
  SessionTransfer,
} from './concurrent/concurrent-session-manager';

// Concurrent session management
export { ConcurrentSessionManager } from './concurrent/concurrent-session-manager';
export type {
  ComplianceSettings,
  IntegrationSettings,
  PerformanceSettings,
  SecuritySettings,
  SessionConfigOptions,
} from './config/session-config';
// Configuration
export { SessionConfig } from './config/session-config';
export type {
  EmergencyAction,
  EmergencyEvent,
  EmergencyResponse,
  EmergencyStatus,
  ShutdownScope,
} from './emergency/emergency-shutdown';
// Emergency shutdown
export { EmergencyShutdownManager } from './emergency/emergency-shutdown';
export type {
  MitigationAction,
  MonitoringRule,
  SecurityIndicator,
  SecurityMetrics,
  SecurityThreat,
  ThreatSeverity,
  ThreatSource,
  ThreatTarget,
} from './monitoring/security-monitor';
// Security monitoring
export { SecurityMonitor } from './monitoring/security-monitor';
export type {
  PreservationConfig,
  RestorationResult,
  SessionSnapshot,
  SnapshotMetadata,
  StorageBackend,
} from './preservation/session-preservation';

// Session preservation
export { SessionPreservationManager } from './preservation/session-preservation';
export type {
  ActivityEvent,
  AnomalyDetection,
  BehaviorPattern,
  RiskProfile,
  SecurityAction,
  SuspiciousActivityConfig,
} from './suspicious/suspicious-activity-detector';
// Suspicious activity detection
export { SuspiciousActivityDetector } from './suspicious/suspicious-activity-detector';
export type {
  ConflictResolutionStrategy,
  DeviceSync,
  SyncConflict,
  SyncEvent,
  SyncStatus,
} from './sync/session-sync';
// Session synchronization
export { SessionSyncManager } from './sync/session-sync';
export type {
  ActivityPattern,
  AdaptiveSettings,
  SessionTimeoutInfo,
  TimeoutConfig,
  TimeoutEvent,
  TimeoutStrategy,
} from './timeout/intelligent-timeout';
// Intelligent timeout management
export { IntelligentTimeoutManager } from './timeout/intelligent-timeout';
export type {
  DeviceFingerprint,
  LocationInfo,
  SecurityContext,
  SessionMetadata,
  SessionValidationResult,
} from './utils/session-utils';
// Utilities
export { SessionUtils } from './utils/session-utils';

// Utility functions for quick setup
export const createAdvancedAuthSystem = (
  config?: Partial<AdvancedAuthConfig>,
) => {
  return getAdvancedAuthSystem(config);
};

export const initializeAuthSystem = async (
  config?: Partial<AdvancedAuthConfig>,
) => {
  const authSystem = getAdvancedAuthSystem(config);
  await authSystem.initialize();
  return authSystem;
};

// Default configurations
export const DEFAULT_AUTH_CONFIG: AdvancedAuthConfig = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxConcurrentSessions: 5,
  enableSuspiciousDetection: true,
  enableSecurityMonitoring: true,
  enableSessionSync: true,
  enableSessionPreservation: true,
  enableEmergencyShutdown: true,
  enableAuditTrail: true,
  enableDataCleanup: true,
  securityLevel: 'high',
  anomalyThreshold: 0.7,
  threatResponseLevel: 'active',
  complianceFrameworks: ['LGPD', 'GDPR'],
  dataRetentionPeriod: 365 * 24 * 60 * 60 * 1000, // 1 year
  auditLevel: 'detailed',
  batchSize: 100,
  cleanupInterval: 60 * 60 * 1000, // 1 hour
  monitoringInterval: 5 * 60 * 1000, // 5 minutes
};

export const SECURITY_LEVELS = {
  LOW: {
    sessionTimeout: 60 * 60 * 1000, // 1 hour
    maxConcurrentSessions: 10,
    anomalyThreshold: 0.9,
    threatResponseLevel: 'passive' as const,
    enableSuspiciousDetection: false,
    enableSecurityMonitoring: true,
    auditLevel: 'basic' as const,
  },
  MEDIUM: {
    sessionTimeout: 45 * 60 * 1000, // 45 minutes
    maxConcurrentSessions: 7,
    anomalyThreshold: 0.8,
    threatResponseLevel: 'active' as const,
    enableSuspiciousDetection: true,
    enableSecurityMonitoring: true,
    auditLevel: 'detailed' as const,
  },
  HIGH: {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxConcurrentSessions: 5,
    anomalyThreshold: 0.7,
    threatResponseLevel: 'active' as const,
    enableSuspiciousDetection: true,
    enableSecurityMonitoring: true,
    auditLevel: 'detailed' as const,
  },
  MAXIMUM: {
    sessionTimeout: 15 * 60 * 1000, // 15 minutes
    maxConcurrentSessions: 3,
    anomalyThreshold: 0.5,
    threatResponseLevel: 'aggressive' as const,
    enableSuspiciousDetection: true,
    enableSecurityMonitoring: true,
    auditLevel: 'comprehensive' as const,
  },
} as const;

// Helper function to create config based on security level
export const createSecurityConfig = (
  level: keyof typeof SECURITY_LEVELS,
  overrides?: Partial<AdvancedAuthConfig>,
): AdvancedAuthConfig => {
  const baseConfig = SECURITY_LEVELS[level];
  return {
    ...DEFAULT_AUTH_CONFIG,
    ...baseConfig,
    securityLevel: level.toLowerCase() as any,
    ...overrides,
  };
};

// Quick setup functions for common scenarios
export const setupBasicAuth = async () => {
  const config = createSecurityConfig('LOW');
  return await initializeAuthSystem(config);
};

export const setupStandardAuth = async () => {
  const config = createSecurityConfig('MEDIUM');
  return await initializeAuthSystem(config);
};

export const setupSecureAuth = async () => {
  const config = createSecurityConfig('HIGH');
  return await initializeAuthSystem(config);
};

export const setupMaximumSecurityAuth = async () => {
  const config = createSecurityConfig('MAXIMUM');
  return await initializeAuthSystem(config);
};

// Enterprise setup with custom compliance
export const setupEnterpriseAuth = async (
  complianceFrameworks: string[] = ['LGPD', 'GDPR', 'SOX'],
) => {
  const config = createSecurityConfig('HIGH', {
    complianceFrameworks,
    auditLevel: 'comprehensive',
    dataRetentionPeriod: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
    enableAuditTrail: true,
    enableDataCleanup: true,
  });
  return await initializeAuthSystem(config);
};

// Development setup with relaxed security
export const setupDevelopmentAuth = async () => {
  const config = createSecurityConfig('LOW', {
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
    maxConcurrentSessions: 20,
    enableSuspiciousDetection: false,
    enableSecurityMonitoring: false,
    enableEmergencyShutdown: false,
    auditLevel: 'basic',
    threatResponseLevel: 'passive',
  });
  return await initializeAuthSystem(config);
};

// Export version info
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

// Export feature flags
export const FEATURES = {
  INTELLIGENT_TIMEOUT: true,
  CONCURRENT_SESSIONS: true,
  SUSPICIOUS_DETECTION: true,
  SECURITY_MONITORING: true,
  SESSION_SYNC: true,
  SESSION_PRESERVATION: true,
  EMERGENCY_SHUTDOWN: true,
  AUDIT_TRAIL: true,
  DATA_CLEANUP: true,
  REAL_TIME_MONITORING: true,
  BEHAVIORAL_ANALYSIS: true,
  THREAT_DETECTION: true,
  COMPLIANCE_REPORTING: true,
  AUTOMATED_RESPONSE: true,
} as const;

// Export component status
export const getComponentStatus = () => {
  const authSystem = getAdvancedAuthSystem();
  return authSystem.getSystemStatus();
};

// Export health check
export const performHealthCheck = async () => {
  const authSystem = getAdvancedAuthSystem();
  const status = authSystem.getSystemStatus();
  return {
    healthy: status.health.overall === 'healthy',
    score: status.health.score,
    issues: status.health.issues,
    recommendations: status.health.recommendations,
    timestamp: Date.now(),
  };
};

// Export metrics collection
export const collectMetrics = () => {
  const authSystem = getAdvancedAuthSystem();
  return authSystem.getMetrics();
};

// Export system information
export const getSystemInfo = () => {
  return {
    version: VERSION,
    buildDate: BUILD_DATE,
    features: FEATURES,
    defaultConfig: DEFAULT_AUTH_CONFIG,
    securityLevels: Object.keys(SECURITY_LEVELS),
  };
};

// Main export - the complete advanced authentication system
export default AdvancedAuthSystem;
