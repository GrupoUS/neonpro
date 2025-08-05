// Session Management Types
// Comprehensive TypeScript definitions for the session management system

export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  isActive: boolean;
  expiresAt: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
  refreshToken?: string;
  sessionType: "web" | "mobile" | "api" | "admin";
  securityLevel: "standard" | "elevated" | "high_security";
}

export interface UserDevice {
  id: string;
  userId: string;
  fingerprint: string;
  deviceName: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  operatingSystem?: string;
  browser?: string;
  ipAddress: string;
  location?: string;
  isTrusted: boolean;
  isActive: boolean;
  lastUsed: string;
  createdAt: string;
  updatedAt: string;
  userAgent: string;
  metadata?: Record<string, any>;
  securityFlags?: string[];
}

export interface SecurityEvent {
  id: string;
  userId: string;
  sessionId?: string;
  deviceId?: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  description: string;
  ipAddress: string;
  userAgent?: string;
  location?: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  dismissed?: boolean;
}

export type SecurityEventType =
  | "login_success"
  | "login_failed"
  | "logout"
  | "session_created"
  | "session_extended"
  | "session_terminated"
  | "session_expired"
  | "device_registered"
  | "device_trusted"
  | "device_untrusted"
  | "device_removed"
  | "suspicious_login"
  | "unusual_location"
  | "multiple_devices"
  | "session_hijack_attempt"
  | "brute_force_attempt"
  | "account_locked"
  | "password_changed"
  | "security_settings_changed"
  | "data_export"
  | "admin_action"
  | "system_alert";

export type SecuritySeverity = "low" | "medium" | "high" | "critical";

export interface SessionPolicy {
  id: string;
  name: string;
  description: string;
  userRole: UserRole;
  maxSessionDuration: number; // minutes
  maxConcurrentSessions: number;
  maxDevicesPerUser: number;
  requireDeviceTrust: boolean;
  allowMultipleLocations: boolean;
  sessionTimeoutWarning: number; // minutes before expiry
  forceLogoutOnSuspicious: boolean;
  requireReauthentication: boolean;
  reauthenticationInterval: number; // minutes
  allowedIpRanges?: string[];
  blockedIpRanges?: string[];
  allowedCountries?: string[];
  blockedCountries?: string[];
  securityLevel: "standard" | "elevated" | "high_security";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "patient" | "doctor" | "nurse" | "admin" | "super_admin" | "guest";

export interface SuspiciousActivity {
  id: string;
  userId: string;
  sessionId?: string;
  deviceId?: string;
  activityType: SuspiciousActivityType;
  description: string;
  riskScore: number; // 0-100
  ipAddress: string;
  location?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  autoResolved?: boolean;
}

export type SuspiciousActivityType =
  | "unusual_login_time"
  | "unusual_location"
  | "rapid_location_change"
  | "multiple_failed_attempts"
  | "new_device_login"
  | "concurrent_sessions"
  | "unusual_user_agent"
  | "suspicious_ip"
  | "bot_detection"
  | "session_anomaly"
  | "data_access_pattern"
  | "privilege_escalation_attempt";

export interface SessionSync {
  id: string;
  userId: string;
  sessionId: string;
  syncType: "create" | "update" | "delete" | "extend" | "terminate";
  syncData: Record<string, any>;
  syncStatus: "pending" | "completed" | "failed";
  retryCount: number;
  lastRetry?: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface SessionAnalytics {
  userId: string;
  timeframe: string;
  totalSessions: number;
  activeSessions: number;
  averageDuration: number; // minutes
  totalDuration: number; // minutes
  uniqueDevices: number;
  uniqueLocations: number;
  securityEventsCount: number;
  suspiciousActivitiesCount: number;
  healthScore: number; // 0-100
  deviceBreakdown: DeviceSessionBreakdown[];
  locationBreakdown: LocationSessionBreakdown[];
  securityEvents: SecurityEventSummary[];
  trends: SessionTrend[];
  generatedAt: string;
}

export interface DeviceSessionBreakdown {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  sessionCount: number;
  totalDuration: number;
  averageDuration: number;
  lastUsed: string;
  isTrusted: boolean;
  securityEvents: number;
}

export interface LocationSessionBreakdown {
  location: string;
  country?: string;
  city?: string;
  sessionCount: number;
  totalDuration: number;
  uniqueDevices: number;
  firstSeen: string;
  lastSeen: string;
  isSuspicious: boolean;
}

export interface SecurityEventSummary {
  eventType: SecurityEventType;
  count: number;
  severity: SecuritySeverity;
  lastOccurrence: string;
  trend: "increasing" | "decreasing" | "stable";
}

export interface SessionTrend {
  date: string;
  sessions: number;
  duration: number;
  devices: number;
  locations: number;
  securityEvents: number;
  healthScore: number;
}

// Request/Response Types
export interface CreateSessionRequest {
  deviceInfo?: Partial<UserDevice>;
  location?: string;
  sessionType?: "web" | "mobile" | "api" | "admin";
  rememberDevice?: boolean;
}

export interface CreateSessionResponse {
  session: UserSession;
  device: UserDevice;
  expiresIn: number;
  refreshToken?: string;
}

export interface RefreshSessionRequest {
  refreshToken?: string;
}

export interface RefreshSessionResponse {
  session: UserSession;
  expiresIn: number;
  newRefreshToken?: string;
}

export interface ExtendSessionRequest {
  extendMinutes: number;
  reason?: string;
}

export interface ExtendSessionResponse {
  session: UserSession;
  extendedBy: number;
  newExpiresAt: string;
}

export interface TerminateSessionRequest {
  sessionId?: string;
  reason?: string;
  terminateAll?: boolean;
}

export interface TerminateSessionResponse {
  terminatedSessions: string[];
  success: boolean;
}

export interface ValidateSessionRequest {
  sessionToken?: string;
  checkSecurity?: boolean;
}

export interface ValidateSessionResponse {
  valid: boolean;
  session?: UserSession;
  securityWarnings?: string[];
  requiresReauth?: boolean;
}

export interface RegisterDeviceRequest {
  deviceName?: string;
  trustDevice?: boolean;
  location?: string;
}

export interface RegisterDeviceResponse {
  device: UserDevice;
  requiresVerification?: boolean;
}

export interface UpdateDeviceRequest {
  deviceId: string;
  deviceName?: string;
  isTrusted?: boolean;
  isActive?: boolean;
}

export interface UpdateDeviceResponse {
  device: UserDevice;
  securityEvent?: SecurityEvent;
}

export interface RemoveDeviceRequest {
  deviceId: string;
  reason?: string;
}

export interface RemoveDeviceResponse {
  success: boolean;
  terminatedSessions?: string[];
}

export interface SecurityEventRequest {
  eventType?: SecurityEventType;
  severity?: SecuritySeverity;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  includeResolved?: boolean;
}

export interface SecurityEventResponse {
  events: SecurityEvent[];
  total: number;
  suspiciousActivities?: SuspiciousActivity[];
}

export interface CreateSecurityEventRequest {
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  description: string;
  metadata?: Record<string, any>;
  sessionId?: string;
  deviceId?: string;
}

export interface CreateSecurityEventResponse {
  event: SecurityEvent;
  triggeredActions?: string[];
}

export interface AnalyticsRequest {
  timeframe?: string;
  includeDevices?: boolean;
  includeSecurity?: boolean;
  includeLocations?: boolean;
}

export interface AnalyticsResponse {
  analytics: SessionAnalytics;
}

export interface SessionStatusRequest {
  userId: string;
}

export interface SessionStatusResponse {
  status: {
    activeSessions: UserSession[];
    recentSecurityEvents: SecurityEvent[];
    suspiciousActivities: SuspiciousActivity[];
    healthScore: number;
    recommendations: string[];
    lastActivity: string;
  };
}

// Configuration Types
export interface SessionConfiguration {
  policies: {
    [role in UserRole]: SessionPolicy;
  };
  security: {
    maxFailedAttempts: number;
    lockoutDuration: number;
    sessionValidationInterval: number;
    monitoringInterval: number;
    suspiciousActivityThreshold: number;
    autoResolveThreshold: number;
    maxDevicesPerUser: number;
    requireDeviceVerification: boolean;
    allowConcurrentSessions: boolean;
    forceLogoutOnSuspicious: boolean;
  };
  cleanup: {
    expiredSessionsInterval: number;
    oldSecurityEventsInterval: number;
    retentionPeriod: number;
    maxSecurityEvents: number;
  };
  cookies: {
    sessionCookieName: string;
    refreshCookieName: string;
    deviceCookieName: string;
    secure: boolean;
    httpOnly: boolean;
    sameSite: "strict" | "lax" | "none";
    domain?: string;
    path: string;
  };
  rateLimit: {
    loginAttempts: { max: number; windowMs: number };
    sessionCreation: { max: number; windowMs: number };
    deviceRegistration: { max: number; windowMs: number };
    securityEvents: { max: number; windowMs: number };
  };
  encryption: {
    algorithm: string;
    keyLength: number;
    ivLength: number;
    saltLength: number;
    iterations: number;
  };
  database: {
    connectionString: string;
    maxConnections: number;
    queryTimeout: number;
    enableRLS: boolean;
  };
  monitoring: {
    enableMetrics: boolean;
    metricsInterval: number;
    enableAlerts: boolean;
    alertThresholds: {
      failedLogins: number;
      suspiciousActivities: number;
      concurrentSessions: number;
      healthScore: number;
    };
  };
  features: {
    enableDeviceManagement: boolean;
    enableLocationTracking: boolean;
    enableSecurityMonitoring: boolean;
    enableAnalytics: boolean;
    enableSessionSync: boolean;
    enableAutoCleanup: boolean;
  };
  endpoints: {
    session: string;
    refresh: string;
    extend: string;
    terminate: string;
    validate: string;
    devices: string;
    security: string;
    analytics: string;
  };
}

// Utility Types
export type SessionEventHandler = (event: SecurityEvent) => void;
export type SuspiciousActivityHandler = (activity: SuspiciousActivity) => void;
export type SessionStateChangeHandler = (session: UserSession | null) => void;

export interface SessionHookOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onSessionChange?: SessionStateChangeHandler;
  onSecurityEvent?: SessionEventHandler;
  onSuspiciousActivity?: SuspiciousActivityHandler;
}

// Error Types
export class SessionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public metadata?: Record<string, any>,
  ) {
    super(message);
    this.name = "SessionError";
  }
}

export class SecurityError extends SessionError {
  constructor(
    message: string,
    public securityCode: string,
    public severity: SecuritySeverity = "medium",
    metadata?: Record<string, any>,
  ) {
    super(message, `SECURITY_${securityCode}`, 403, metadata);
    this.name = "SecurityError";
  }
}

export class ValidationError extends SessionError {
  constructor(
    message: string,
    public field: string,
    metadata?: Record<string, any>,
  ) {
    super(message, "VALIDATION_ERROR", 400, metadata);
    this.name = "ValidationError";
  }
}

// Constants
export const SESSION_EVENTS = {
  CREATED: "session_created",
  REFRESHED: "session_refreshed",
  EXTENDED: "session_extended",
  TERMINATED: "session_terminated",
  EXPIRED: "session_expired",
  VALIDATED: "session_validated",
} as const;

export const DEVICE_EVENTS = {
  REGISTERED: "device_registered",
  TRUSTED: "device_trusted",
  UNTRUSTED: "device_untrusted",
  REMOVED: "device_removed",
  UPDATED: "device_updated",
} as const;

export const SECURITY_LEVELS = {
  STANDARD: "standard",
  ELEVATED: "elevated",
  HIGH_SECURITY: "high_security",
} as const;

export const USER_ROLES = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  NURSE: "nurse",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  GUEST: "guest",
} as const;

export const DEVICE_TYPES = {
  DESKTOP: "desktop",
  MOBILE: "mobile",
  TABLET: "tablet",
  UNKNOWN: "unknown",
} as const;

export const SESSION_TYPES = {
  WEB: "web",
  MOBILE: "mobile",
  API: "api",
  ADMIN: "admin",
} as const;
