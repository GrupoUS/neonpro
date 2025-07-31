/**
 * Session Management Types
 * Story 1.4: Session Management & Security
 * 
 * Comprehensive TypeScript interfaces for session management,
 * security monitoring, and LGPD compliance.
 */

import { z } from 'zod';

// ============================================================================
// CORE SESSION TYPES
// ============================================================================

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
  created_at: string;
  last_activity: string;
  expires_at: string;
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
  timestamp: string;
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
  registered_at: string;
  last_seen: string;
  blocked: boolean;
  block_reason?: string;
}

export interface SessionAuditLog {
  id: string;
  session_id: string;
  user_id: string;
  action: SessionAction;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  success: boolean;
  error_message?: string;
}

export interface SessionPolicy {
  id: string;
  role_id: string;
  role_name: string;
  max_concurrent_sessions: number;
  timeout_minutes: number;
  security_level: SecurityLevel;
  require_mfa: boolean;
  allow_concurrent_devices: boolean;
  suspicious_activity_threshold: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

export enum SecurityEventType {
  SUSPICIOUS_LOGIN = 'suspicious_login',
  UNUSUAL_LOCATION = 'unusual_location',
  RAPID_REQUESTS = 'rapid_requests',
  CONCURRENT_LIMIT_EXCEEDED = 'concurrent_limit_exceeded',
  DEVICE_CHANGE = 'device_change',
  IP_CHANGE = 'ip_change',
  SESSION_HIJACK_ATTEMPT = 'session_hijack_attempt',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  DATA_EXFILTRATION = 'data_exfiltration'
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  UNKNOWN = 'unknown'
}

export enum SessionAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  TIMEOUT = 'timeout',
  FORCE_LOGOUT = 'force_logout',
  SESSION_REFRESH = 'session_refresh',
  DEVICE_REGISTER = 'device_register',
  DEVICE_TRUST = 'device_trust',
  DEVICE_BLOCK = 'device_block',
  SECURITY_EVENT = 'security_event',
  POLICY_VIOLATION = 'policy_violation'
}

export enum SecurityLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  HIGH = 'high',
  MAXIMUM = 'maximum'
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const UserSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  device_fingerprint: z.string().min(1),
  device_name: z.string().optional(),
  ip_address: z.string().ip(),
  user_agent: z.string().min(1),
  location: z.object({
    country: z.string().optional(),
    city: z.string().optional(),
    timezone: z.string().optional()
  }).optional(),
  created_at: z.string().datetime(),
  last_activity: z.string().datetime(),
  expires_at: z.string().datetime(),
  is_active: z.boolean(),
  security_score: z.number().min(0).max(100),
  session_data: z.record(z.any()).optional()
});

export const SessionSecurityEventSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  user_id: z.string().uuid(),
  event_type: z.nativeEnum(SecurityEventType),
  severity: z.nativeEnum(SecuritySeverity),
  details: z.record(z.any()),
  ip_address: z.string().ip(),
  user_agent: z.string().min(1),
  timestamp: z.string().datetime(),
  resolved: z.boolean(),
  resolution_notes: z.string().optional()
});

export const DeviceRegistrationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  device_fingerprint: z.string().min(1),
  device_name: z.string().min(1),
  device_type: z.nativeEnum(DeviceType),
  browser_info: z.object({
    name: z.string(),
    version: z.string(),
    platform: z.string()
  }),
  trusted: z.boolean(),
  registered_at: z.string().datetime(),
  last_seen: z.string().datetime(),
  blocked: z.boolean(),
  block_reason: z.string().optional()
});

export const SessionAuditLogSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  user_id: z.string().uuid(),
  action: z.nativeEnum(SessionAction),
  details: z.record(z.any()),
  ip_address: z.string().ip(),
  user_agent: z.string().min(1),
  timestamp: z.string().datetime(),
  success: z.boolean(),
  error_message: z.string().optional()
});

export const SessionPolicySchema = z.object({
  id: z.string().uuid(),
  role_id: z.string().uuid(),
  role_name: z.string().min(1),
  max_concurrent_sessions: z.number().min(1).max(10),
  timeout_minutes: z.number().min(5).max(1440),
  security_level: z.nativeEnum(SecurityLevel),
  require_mfa: z.boolean(),
  allow_concurrent_devices: z.boolean(),
  suspicious_activity_threshold: z.number().min(1).max(100),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateSessionRequest {
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
}

export interface UpdateSessionRequest {
  last_activity?: string;
  session_data?: Record<string, any>;
  security_score?: number;
}

export interface SessionListResponse {
  sessions: UserSession[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface SessionSecurityReport {
  session_id: string;
  user_id: string;
  security_score: number;
  risk_factors: string[];
  recommendations: string[];
  events: SessionSecurityEvent[];
  generated_at: string;
}

export interface SessionAnalytics {
  total_sessions: number;
  active_sessions: number;
  security_events: number;
  average_session_duration: number;
  top_devices: Array<{
    device_type: DeviceType;
    count: number;
  }>;
  security_trends: Array<{
    date: string;
    events: number;
    severity_breakdown: Record<SecuritySeverity, number>;
  }>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SessionStatus = 'active' | 'expired' | 'terminated' | 'suspended';

export type SessionFilter = {
  user_id?: string;
  status?: SessionStatus;
  device_type?: DeviceType;
  security_level?: SecurityLevel;
  date_from?: string;
  date_to?: string;
  ip_address?: string;
};

export type SessionSort = {
  field: 'created_at' | 'last_activity' | 'security_score' | 'expires_at';
  direction: 'asc' | 'desc';
};

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface SessionConfig {
  default_timeout_minutes: number;
  max_concurrent_sessions: number;
  security_monitoring_enabled: boolean;
  device_fingerprinting_enabled: boolean;
  geo_location_tracking: boolean;
  audit_logging_enabled: boolean;
  cleanup_interval_hours: number;
  threat_intelligence_enabled: boolean;
}

export interface SecurityThresholds {
  suspicious_login_attempts: number;
  rapid_request_limit: number;
  unusual_location_score: number;
  device_change_score: number;
  concurrent_session_penalty: number;
  ip_change_score: number;
}

// ============================================================================
// EXPORT TYPES FOR VALIDATION
// ============================================================================

export type CreateSessionData = z.infer<typeof UserSessionSchema>;
export type SecurityEventData = z.infer<typeof SessionSecurityEventSchema>;
export type DeviceRegistrationData = z.infer<typeof DeviceRegistrationSchema>;
export type SessionAuditData = z.infer<typeof SessionAuditLogSchema>;
export type SessionPolicyData = z.infer<typeof SessionPolicySchema>;
