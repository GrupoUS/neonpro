/**
 * Session Management Types
 * Comprehensive TypeScript interfaces for session management and security
 */

export interface UserSession {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_name?: string;
  ip_address: string;
  user_agent: string;
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  created_at: Date;
  last_activity: Date;
  expires_at: Date;
  is_active: boolean;
  security_score: number;
  session_data?: Record<string, any>;
}

export interface SessionSecurityEvent {
  id: string;
  session_id: string;
  user_id: string;
  event_type: SecurityEventType;
  severity: SecuritySeverity;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
  resolved: boolean;
  resolution_notes?: string;
}

export interface DeviceRegistration {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_name: string;
  device_type: DeviceType;
  browser_info: {
    name: string;
    version: string;
    platform: string;
  };
  trusted: boolean;
  registered_at: Date;
  last_used: Date;
  is_active: boolean;
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
  success: boolean;
  error_message?: string;
}

export interface SessionPolicy {
  id: string;
  role_id: string;
  role_name: string;
  max_concurrent_sessions: number;
  session_timeout_minutes: number;
  idle_timeout_minutes: number;
  require_device_registration: boolean;
  allow_concurrent_devices: boolean;
  security_level: SecurityLevel;
  ip_restriction_enabled: boolean;
  allowed_ip_ranges?: string[];
  geo_restriction_enabled: boolean;
  allowed_countries?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface SessionConfiguration {
  default_timeout_minutes: number;
  warning_before_expiry_minutes: number[];
  max_idle_minutes: number;
  cleanup_interval_minutes: number;
  security_monitoring_enabled: boolean;
  device_fingerprinting_enabled: boolean;
  geo_tracking_enabled: boolean;
  threat_detection_enabled: boolean;
  audit_retention_days: number;
}

export interface SessionMetrics {
  total_active_sessions: number;
  sessions_by_role: Record<string, number>;
  sessions_by_device_type: Record<DeviceType, number>;
  average_session_duration: number;
  security_events_count: number;
  suspicious_activities_count: number;
  concurrent_sessions_peak: number;
  geographic_distribution: Record<string, number>;
}

export interface SuspiciousActivity {
  id: string;
  user_id: string;
  session_id?: string;
  activity_type: SuspiciousActivityType;
  risk_score: number;
  details: {
    ip_address: string;
    location?: {
      country: string;
      city: string;
    };
    device_fingerprint?: string;
    user_agent?: string;
    additional_data?: Record<string, any>;
  };
  detected_at: Date;
  auto_resolved: boolean;
  manual_review_required: boolean;
  status: "pending" | "investigating" | "resolved" | "false_positive";
  resolution_notes?: string;
}

export interface CrossDeviceSync {
  user_id: string;
  sync_data: {
    preferences: Record<string, any>;
    ui_state: Record<string, any>;
    notifications: any[];
    last_sync: Date;
  };
  devices: {
    device_fingerprint: string;
    last_sync: Date;
    sync_status: "synced" | "pending" | "failed";
  }[];
}

// Enums
export enum SecurityEventType {
  LOGIN_SUCCESS = "login_success",
  LOGIN_FAILED = "login_failed",
  SESSION_CREATED = "session_created",
  SESSION_EXPIRED = "session_expired",
  SESSION_TERMINATED = "session_terminated",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  DEVICE_REGISTERED = "device_registered",
  DEVICE_BLOCKED = "device_blocked",
  IP_BLOCKED = "ip_blocked",
  CONCURRENT_LIMIT_EXCEEDED = "concurrent_limit_exceeded",
  GEOGRAPHIC_ANOMALY = "geographic_anomaly",
  TIME_ANOMALY = "time_anomaly",
  RAPID_LOGIN_ATTEMPTS = "rapid_login_attempts",
  SESSION_HIJACK_ATTEMPT = "session_hijack_attempt",
}

export enum SecuritySeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum DeviceType {
  DESKTOP = "desktop",
  MOBILE = "mobile",
  TABLET = "tablet",
  UNKNOWN = "unknown",
}

export enum SessionAction {
  CREATE = "create",
  REFRESH = "refresh",
  EXTEND = "extend",
  TERMINATE = "terminate",
  EXPIRE = "expire",
  VALIDATE = "validate",
  UPDATE_ACTIVITY = "update_activity",
  SECURITY_CHECK = "security_check",
  DEVICE_REGISTER = "device_register",
  DEVICE_TRUST = "device_trust",
  POLICY_VIOLATION = "policy_violation",
}

export enum SecurityLevel {
  BASIC = "basic",
  STANDARD = "standard",
  HIGH = "high",
  MAXIMUM = "maximum",
}

export enum SuspiciousActivityType {
  UNUSUAL_LOGIN_TIME = "unusual_login_time",
  GEOGRAPHIC_ANOMALY = "geographic_anomaly",
  NEW_DEVICE_LOGIN = "new_device_login",
  RAPID_LOGIN_ATTEMPTS = "rapid_login_attempts",
  CONCURRENT_SESSIONS_EXCEEDED = "concurrent_sessions_exceeded",
  IP_REPUTATION_RISK = "ip_reputation_risk",
  BEHAVIORAL_ANOMALY = "behavioral_anomaly",
  SESSION_PATTERN_ANOMALY = "session_pattern_anomaly",
}

// API Response Types
export interface SessionResponse {
  session: UserSession;
  warnings?: string[];
  security_alerts?: SecurityAlert[];
}

export interface SessionListResponse {
  sessions: UserSession[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface SecurityAlert {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  message: string;
  timestamp: Date;
  requires_action: boolean;
  action_url?: string;
}

export interface SessionValidationResult {
  valid: boolean;
  session?: UserSession;
  errors?: string[];
  warnings?: string[];
  security_score: number;
  requires_mfa?: boolean;
  requires_device_verification?: boolean;
}

// Hook Types
export interface UseSessionOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onExpiry?: () => void;
  onSecurityAlert?: (alert: SecurityAlert) => void;
  onDeviceChange?: (device: DeviceRegistration) => void;
}

export interface UseSessionReturn {
  session: UserSession | null;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  terminate: () => Promise<void>;
  extend: (minutes?: number) => Promise<void>;
  validateSecurity: () => Promise<SessionValidationResult>;
  registerDevice: (deviceName: string) => Promise<DeviceRegistration>;
  getActiveSessions: () => Promise<UserSession[]>;
  terminateSession: (sessionId: string) => Promise<void>;
  getSecurityEvents: () => Promise<SessionSecurityEvent[]>;
}

// Configuration Types
export interface SessionManagerConfig {
  redis: {
    url: string;
    prefix: string;
    ttl: number;
  };
  security: {
    secret: string;
    algorithm: string;
    issuer: string;
    audience: string;
  };
  monitoring: {
    enabled: boolean;
    threat_intelligence_api?: string;
    geolocation_api?: string;
    device_fingerprinting: boolean;
  };
  policies: {
    default_timeout_minutes: number;
    max_concurrent_sessions: number;
    cleanup_interval_minutes: number;
    audit_retention_days: number;
  };
}

export interface EmergencySessionControls {
  global_kill_switch: boolean;
  lockdown_mode: boolean;
  emergency_access_enabled: boolean;
  incident_response_active: boolean;
  affected_users?: string[];
  reason?: string;
  initiated_by: string;
  initiated_at: Date;
}

// Utility Types
export type SessionEventHandler = (event: SessionSecurityEvent) => void;
export type SuspiciousActivityHandler = (activity: SuspiciousActivity) => void;
export type SessionCleanupHandler = (expiredSessions: UserSession[]) => void;

export interface SessionEventHandlers {
  onSessionCreated?: SessionEventHandler;
  onSessionExpired?: SessionEventHandler;
  onSessionTerminated?: SessionEventHandler;
  onSuspiciousActivity?: SuspiciousActivityHandler;
  onSecurityViolation?: SessionEventHandler;
  onDeviceRegistered?: (device: DeviceRegistration) => void;
  onConcurrentLimitExceeded?: SessionEventHandler;
  onSessionCleanup?: SessionCleanupHandler;
}

// Database Schema Types
export interface SessionTableRow {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_name: string | null;
  ip_address: string;
  user_agent: string;
  location_data: any | null;
  created_at: string;
  last_activity: string;
  expires_at: string;
  is_active: boolean;
  security_score: number;
  session_data: any | null;
  tenant_id: string;
}

export interface SessionSecurityEventTableRow {
  id: string;
  session_id: string;
  user_id: string;
  event_type: string;
  severity: string;
  details: any;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  resolved: boolean;
  resolution_notes: string | null;
  tenant_id: string;
}

export interface DeviceRegistrationTableRow {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_name: string;
  device_type: string;
  browser_info: any;
  trusted: boolean;
  registered_at: string;
  last_used: string;
  is_active: boolean;
  tenant_id: string;
}

export interface SessionAuditLogTableRow {
  id: string;
  session_id: string;
  user_id: string;
  action: string;
  details: any;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  success: boolean;
  error_message: string | null;
  tenant_id: string;
}

export interface SessionPolicyTableRow {
  id: string;
  role_id: string;
  role_name: string;
  max_concurrent_sessions: number;
  session_timeout_minutes: number;
  idle_timeout_minutes: number;
  require_device_registration: boolean;
  allow_concurrent_devices: boolean;
  security_level: string;
  ip_restriction_enabled: boolean;
  allowed_ip_ranges: string[] | null;
  geo_restriction_enabled: boolean;
  allowed_countries: string[] | null;
  created_at: string;
  updated_at: string;
  tenant_id: string;
}
