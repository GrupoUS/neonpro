// Session types for authentication and security
export enum SessionAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REFRESH = 'refresh',
  EXTEND = 'extend',
  VALIDATE = 'validate',
  TERMINATE = 'terminate'
}

export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  UNKNOWN = 'unknown'
}

export enum SecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum SecurityEventType {
  SUCCESSFUL_LOGIN = 'successful_login',
  FAILED_LOGIN = 'failed_login',
  PASSWORD_CHANGE = 'password_change',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DEVICE_REGISTERED = 'device_registered',
  DEVICE_REMOVED = 'device_removed',
  SESSION_CREATED = 'session_created',
  SESSION_EXTENDED = 'session_extended',
  SESSION_TERMINATED = 'session_terminated',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_ACCESS = 'data_access',
  ADMIN_ACTION = 'admin_action'
}

export enum SecuritySeverity {
  INFO = 'info',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  INVALID = 'invalid'
}

export interface SessionInfo {
  id: string;
  userId: string;
  deviceId: string;
  deviceType: DeviceType;
  userAgent: string;
  ipAddress: string;
  location?: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  status: SessionStatus;
  securityLevel: SecurityLevel;
}

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  sessionId?: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface DeviceInfo {
  id: string;
  userId: string;
  name: string;
  type: DeviceType;
  userAgent: string;
  fingerprint: string;
  ipAddress: string;
  location?: string;
  trusted: boolean;
  lastUsed: Date;
  createdAt: Date;
}

export interface SessionValidationResult {
  valid: boolean;
  session?: SessionInfo;
  reason?: string;
  requiresRefresh?: boolean;
}

export interface SessionExtensionOptions {
  extendBy?: number; // milliseconds
  maxExtension?: number; // maximum total session time
  requiresReauth?: boolean;
}

export interface SessionCreationOptions {
  deviceInfo: Partial<DeviceInfo>;
  rememberDevice?: boolean;
  securityLevel?: SecurityLevel;
  expirationTime?: number; // milliseconds
}

export interface SecurityAuditLog {
  id: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  sessionId?: string;
  deviceId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  timestamp: Date;
}

export interface SessionMetrics {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  terminatedSessions: number;
  averageSessionDuration: number;
  topDeviceTypes: Array<{ type: DeviceType; count: number }>;
  topLocations: Array<{ location: string; count: number }>;
  securityEvents: Array<{ type: SecurityEventType; count: number }>;
}

export interface SessionConfiguration {
  defaultExpirationTime: number; // milliseconds
  maxSessionDuration: number; // milliseconds
  inactivityTimeout: number; // milliseconds
  maxConcurrentSessions: number;
  requireDeviceVerification: boolean;
  allowSessionExtension: boolean;
  enforceSecurityLevel: boolean;
  auditAllEvents: boolean;
}

// Type guards
export function isValidSessionStatus(status: string): status is SessionStatus {
  return Object.values(SessionStatus).includes(status as SessionStatus);
}

export function isValidSecurityEventType(type: string): type is SecurityEventType {
  return Object.values(SecurityEventType).includes(type as SecurityEventType);
}

export function isValidSecuritySeverity(severity: string): severity is SecuritySeverity {
  return Object.values(SecuritySeverity).includes(severity as SecuritySeverity);
}

// Utility functions
export function getSecurityLevelFromScore(score: number): SecurityLevel {
  if (score >= 90) return SecurityLevel.CRITICAL;
  if (score >= 70) return SecurityLevel.HIGH;
  if (score >= 50) return SecurityLevel.MEDIUM;
  return SecurityLevel.LOW;
}

export function isHighRiskEvent(eventType: SecurityEventType): boolean {
  const highRiskEvents = [
    SecurityEventType.FAILED_LOGIN,
    SecurityEventType.SUSPICIOUS_ACTIVITY,
    SecurityEventType.PRIVILEGE_ESCALATION,
    SecurityEventType.UNAUTHORIZED_ACCESS,
  ];
  return highRiskEvents.includes(eventType);
}

export function shouldAuditEvent(eventType: SecurityEventType, severity: SecuritySeverity): boolean {
  // Always audit high and critical severity events
  if (severity === SecuritySeverity.HIGH || severity === SecuritySeverity.CRITICAL) {
    return true;
  }
  
  // Audit specific event types regardless of severity
  const alwaysAuditEvents = [
    SecurityEventType.PASSWORD_CHANGE,
    SecurityEventType.MFA_ENABLED,
    SecurityEventType.MFA_DISABLED,
    SecurityEventType.ADMIN_ACTION,
  ];
  
  return alwaysAuditEvents.includes(eventType);
}
