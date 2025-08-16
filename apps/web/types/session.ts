/**
 * Session and Device Management Types
 * Types for authentication, session management, and device tracking
 */

// Device Types
export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  WEB = 'web',
  API = 'api',
  UNKNOWN = 'unknown',
}

// Security Event Types
export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  SESSION_CREATED = 'session_created',
  SESSION_EXPIRED = 'session_expired',
  SESSION_TERMINATED = 'session_terminated',
  DEVICE_REGISTERED = 'device_registered',
  DEVICE_UPDATED = 'device_updated',
  DEVICE_REMOVED = 'device_removed',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  PASSWORD_CHANGED = 'password_changed',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  PERMISSION_DENIED = 'permission_denied',
  DATA_ACCESS = 'data_access',
  ADMIN_ACTION = 'admin_action',
}

// Security Severity Levels
export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Session Status
export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended',
}

// Base Device Interface
export interface Device {
  id: string;
  user_id: string;
  device_name: string;
  device_type: DeviceType;
  ip_address: string;
  user_agent: string;
  trusted: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
  fingerprint?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
}

// Device Registration Data
export interface DeviceRegistrationData {
  user_id: string;
  device_name: string;
  device_type: DeviceType;
  ip_address: string;
  user_agent: string;
  trusted: boolean;
  last_seen: string;
  fingerprint?: string;
}

// Device Update Data
export interface DeviceUpdateData {
  device_name?: string;
  trusted?: boolean;
  last_seen?: string;
  ip_address?: string;
  user_agent?: string;
}

// Session Interface
export interface Session {
  id: string;
  user_id: string;
  device_id?: string;
  status: SessionStatus;
  ip_address: string;
  user_agent: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  last_activity: string;
  metadata?: Record<string, any>;
}

// Security Event Interface
export interface SecurityEvent {
  id: string;
  session_id: string;
  user_id?: string;
  event_type: SecurityEventType;
  severity: SecuritySeverity;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  metadata?: Record<string, any>;
}

// Session Manager Configuration
export interface SessionManagerConfig {
  defaultTimeout: number; // in minutes
  maxConcurrentSessions: number;
  enableDeviceTracking: boolean;
  enableSecurityMonitoring: boolean;
  enableSuspiciousActivityDetection: boolean;
  sessionCleanupInterval: number; // in milliseconds
  securityEventRetention: number; // in milliseconds
  encryptionKey: string;
}

// Session Creation Data
export interface SessionCreationData {
  user_id: string;
  device_id?: string;
  ip_address: string;
  user_agent: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

// Session Update Data
export interface SessionUpdateData {
  status?: SessionStatus;
  last_activity?: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

// Security Event Creation Data
export interface SecurityEventCreationData {
  session_id: string;
  user_id?: string;
  event_type: SecurityEventType;
  severity: SecuritySeverity;
  description: string;
  ip_address: string;
  user_agent: string;
  metadata?: Record<string, any>;
}

// Authentication Context
export interface AuthContext {
  user: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  } | null;
  session: Session | null;
  device: Device | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Login Response
export interface LoginResponse {
  success: boolean;
  session?: Session;
  device?: Device;
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
  error?: string;
  requiresMFA?: boolean;
  mfaToken?: string;
}

// Logout Response
export interface LogoutResponse {
  success: boolean;
  error?: string;
}

// Device List Response
export interface DeviceListResponse {
  devices: Device[];
  total: number;
}

// Session List Response
export interface SessionListResponse {
  sessions: Session[];
  total: number;
}

// Security Events Response
export interface SecurityEventsResponse {
  events: SecurityEvent[];
  total: number;
  hasMore: boolean;
}

// Suspicious Activity Detection
export interface SuspiciousActivityRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: SecuritySeverity;
  conditions: Record<string, any>;
  actions: string[];
}

// Activity Pattern
export interface ActivityPattern {
  user_id: string;
  pattern_type: string;
  frequency: number;
  last_occurrence: string;
  risk_score: number;
  metadata: Record<string, any>;
}

// Rate Limiting
export interface RateLimitRule {
  endpoint: string;
  method: string;
  limit: number;
  window: number; // in seconds
  enabled: boolean;
}

// Session Analytics
export interface SessionAnalytics {
  total_sessions: number;
  active_sessions: number;
  unique_users: number;
  unique_devices: number;
  security_events: number;
  suspicious_activities: number;
  period: {
    start: string;
    end: string;
  };
}

// Export all types for convenience
export type {
  Device,
  DeviceRegistrationData,
  DeviceUpdateData,
  Session,
  SecurityEvent,
  SessionManagerConfig,
  SessionCreationData,
  SessionUpdateData,
  SecurityEventCreationData,
  AuthContext,
  LoginResponse,
  LogoutResponse,
  DeviceListResponse,
  SessionListResponse,
  SecurityEventsResponse,
  SuspiciousActivityRule,
  ActivityPattern,
  RateLimitRule,
  SessionAnalytics,
};
