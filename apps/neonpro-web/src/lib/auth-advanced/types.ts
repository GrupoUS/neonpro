// Session Management & Security Types
// Story 1.4: Session Management & Security Implementation

export interface UserSession {
  id: string;
  user_id: string;
  device_id: string;
  device_fingerprint: string;
  device_name: string;
  device_type: "desktop" | "mobile" | "tablet";
  browser_name: string;
  browser_version: string;
  os_name: string;
  os_version: string;
  ip_address: string;
  location?: {
    country: string;
    region: string;
    city: string;
    timezone: string;
  };
  session_token: string;
  refresh_token: string;
  access_token: string;
  expires_at: Date;
  last_activity: Date;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  is_trusted: boolean;
  login_method: "password" | "sso" | "mfa" | "biometric";
  security_level: "low" | "medium" | "high" | "critical";
  session_data?: Record<string, any>;
}

export interface SessionSecurityEvent {
  id: string;
  session_id: string;
  user_id: string;
  event_type: SecurityEventType;
  event_category: "authentication" | "authorization" | "session" | "security";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  metadata: Record<string, any>;
  ip_address: string;
  user_agent: string;
  device_fingerprint: string;
  location?: {
    country: string;
    region: string;
    city: string;
  };
  risk_score: number; // 0-100
  is_blocked: boolean;
  resolution_status: "pending" | "resolved" | "false_positive" | "escalated";
  created_at: Date;
  resolved_at?: Date;
}

export type SecurityEventType =
  | "login_success"
  | "login_failure"
  | "logout"
  | "session_timeout"
  | "concurrent_session_limit"
  | "suspicious_location"
  | "suspicious_device"
  | "unusual_activity"
  | "privilege_escalation_attempt"
  | "session_hijack_attempt"
  | "brute_force_attempt"
  | "account_lockout"
  | "password_change"
  | "mfa_enabled"
  | "mfa_disabled"
  | "emergency_access"
  | "session_terminated";

export interface DeviceRegistration {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_name: string;
  device_type: "desktop" | "mobile" | "tablet";
  browser_info: {
    name: string;
    version: string;
    engine: string;
  };
  os_info: {
    name: string;
    version: string;
    platform: string;
  };
  screen_info: {
    width: number;
    height: number;
    color_depth: number;
  };
  timezone: string;
  language: string;
  is_trusted: boolean;
  trust_score: number; // 0-100
  first_seen: Date;
  last_seen: Date;
  total_sessions: number;
  risk_indicators: string[];
  created_at: Date;
  updated_at: Date;
}

export interface SessionAuditLog {
  id: string;
  session_id: string;
  user_id: string;
  action: SessionAction;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
  duration?: number; // in milliseconds
  success: boolean;
  error_message?: string;
}

export type SessionAction =
  | "session_created"
  | "session_refreshed"
  | "session_extended"
  | "session_terminated"
  | "session_expired"
  | "activity_detected"
  | "security_check"
  | "device_verified"
  | "location_verified"
  | "permission_checked"
  | "data_accessed"
  | "settings_changed";

export interface SessionPolicy {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  applies_to_roles: string[];
  settings: {
    max_session_duration: number; // minutes
    idle_timeout: number; // minutes
    max_concurrent_sessions: number;
    require_device_verification: boolean;
    require_location_verification: boolean;
    enable_suspicious_activity_detection: boolean;
    auto_logout_on_suspicious_activity: boolean;
    session_extension_allowed: boolean;
    max_session_extensions: number;
    force_logout_on_policy_change: boolean;
  };
  security_rules: {
    min_security_level: "low" | "medium" | "high" | "critical";
    require_mfa_for_sensitive_actions: boolean;
    block_concurrent_different_locations: boolean;
    max_failed_attempts: number;
    lockout_duration: number; // minutes
    risk_score_threshold: number; // 0-100
  };
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface SessionConfig {
  // Timeout Settings
  defaultSessionDuration: number; // minutes
  maxSessionDuration: number; // minutes
  idleTimeout: number; // minutes
  warningBeforeTimeout: number; // minutes

  // Concurrent Sessions
  maxConcurrentSessions: number;
  allowMultipleDevices: boolean;

  // Security Settings
  enableDeviceFingerprinting: boolean;
  enableLocationTracking: boolean;
  enableSuspiciousActivityDetection: boolean;
  riskScoreThreshold: number;

  // Cleanup Settings
  cleanupInterval: number; // minutes
  retainAuditLogs: number; // days
  retainSecurityEvents: number; // days

  // Real-time Settings
  enableRealTimeMonitoring: boolean;
  websocketHeartbeat: number; // seconds
  activityUpdateInterval: number; // seconds
}

export interface SessionState {
  isAuthenticated: boolean;
  user: any;
  session: UserSession | null;
  permissions: string[];
  securityLevel: "low" | "medium" | "high" | "critical";
  lastActivity: Date;
  timeUntilExpiry: number; // seconds
  warningShown: boolean;
  isExtending: boolean;
  deviceTrusted: boolean;
  locationVerified: boolean;
}

export interface SessionManager {
  // Core Session Management
  createSession(userId: string, deviceInfo: DeviceInfo, loginMethod: string): Promise<UserSession>;
  refreshSession(sessionToken: string): Promise<UserSession>;
  extendSession(sessionId: string, duration?: number): Promise<UserSession>;
  terminateSession(sessionId: string, reason?: string): Promise<void>;
  terminateAllSessions(userId: string, exceptSessionId?: string): Promise<void>;

  // Session Validation
  validateSession(sessionToken: string): Promise<UserSession | null>;
  checkSessionActivity(sessionId: string): Promise<boolean>;
  updateLastActivity(sessionId: string): Promise<void>;

  // Security Monitoring
  detectSuspiciousActivity(session: UserSession, activity: any): Promise<SecurityEventType[]>;
  calculateRiskScore(session: UserSession, activity: any): Promise<number>;
  handleSecurityEvent(event: Partial<SessionSecurityEvent>): Promise<void>;

  // Device Management
  registerDevice(userId: string, deviceInfo: DeviceInfo): Promise<DeviceRegistration>;
  verifyDevice(deviceFingerprint: string, userId: string): Promise<boolean>;
  trustDevice(deviceId: string, userId: string): Promise<void>;

  // Cleanup
  cleanupExpiredSessions(): Promise<number>;
  cleanupOldAuditLogs(): Promise<number>;
}

export interface DeviceInfo {
  fingerprint: string;
  name: string;
  type: "desktop" | "mobile" | "tablet";
  browser: {
    name: string;
    version: string;
    engine: string;
  };
  os: {
    name: string;
    version: string;
    platform: string;
  };
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  timezone: string;
  language: string;
  userAgent: string;
}

export interface LocationInfo {
  ip: string;
  country: string;
  region: string;
  city: string;
  timezone: string;
  isp?: string;
  isVPN?: boolean;
  isProxy?: boolean;
}

export interface SessionMetrics {
  totalActiveSessions: number;
  totalUsers: number;
  averageSessionDuration: number;
  securityEventsToday: number;
  suspiciousActivities: number;
  blockedAttempts: number;
  deviceBreakdown: Record<string, number>;
  locationBreakdown: Record<string, number>;
  riskScoreDistribution: Record<string, number>;
}

export interface SessionHooks {
  onSessionCreated?: (session: UserSession) => void;
  onSessionRefreshed?: (session: UserSession) => void;
  onSessionExpired?: (session: UserSession) => void;
  onSessionTerminated?: (session: UserSession, reason?: string) => void;
  onSuspiciousActivity?: (event: SessionSecurityEvent) => void;
  onSecurityThreat?: (event: SessionSecurityEvent) => void;
  onDeviceRegistered?: (device: DeviceRegistration) => void;
}

export interface SessionError extends Error {
  code: SessionErrorCode;
  sessionId?: string;
  userId?: string;
  details?: Record<string, any>;
}

export type SessionErrorCode =
  | "SESSION_NOT_FOUND"
  | "SESSION_EXPIRED"
  | "SESSION_INVALID"
  | "SESSION_TERMINATED"
  | "CONCURRENT_LIMIT_EXCEEDED"
  | "DEVICE_NOT_TRUSTED"
  | "LOCATION_SUSPICIOUS"
  | "SECURITY_VIOLATION"
  | "INSUFFICIENT_PERMISSIONS"
  | "RATE_LIMIT_EXCEEDED"
  | "SYSTEM_ERROR";

// WebSocket Events for Real-time Session Management
export interface SessionWebSocketEvent {
  type: SessionWebSocketEventType;
  sessionId: string;
  userId: string;
  data: any;
  timestamp: Date;
}

export type SessionWebSocketEventType =
  | "session_warning"
  | "session_expired"
  | "session_terminated"
  | "security_alert"
  | "device_verification_required"
  | "location_verification_required"
  | "concurrent_session_detected"
  | "suspicious_activity_detected"
  | "emergency_logout";

// React Hook Types
export interface UseSessionReturn {
  session: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  timeUntilExpiry: number;
  securityLevel: string;
  extendSession: () => Promise<void>;
  terminateSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export interface UseSessionSecurityReturn {
  securityEvents: SessionSecurityEvent[];
  riskScore: number;
  isMonitoring: boolean;
  deviceTrusted: boolean;
  locationVerified: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  trustDevice: () => Promise<void>;
  reportSuspiciousActivity: (details: any) => Promise<void>;
}

export interface UseSessionMetricsReturn {
  metrics: SessionMetrics | null;
  isLoading: boolean;
  error: string | null;
  refreshMetrics: () => Promise<void>;
}
