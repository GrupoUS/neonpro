/**
 * Session Management & Security Types
 * 
 * Comprehensive TypeScript definitions for the NeonPro session management system.
 * Includes session tracking, security monitoring, device management, and audit trails.
 */

// ============================================================================
// CORE SESSION TYPES
// ============================================================================

export interface UserSession {
  id: string;
  userId: string;
  clinicId: string;
  deviceFingerprint: string;
  deviceName?: string;
  ipAddress: string;
  userAgent: string;
  location?: SessionLocation;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  securityScore: number;
  sessionData?: Record<string, any>;
  metadata?: SessionMetadata;
}

export interface SessionMetadata {
  loginMethod: 'password' | 'sso' | 'mfa' | 'biometric';
  mfaVerified: boolean;
  ssoProvider?: string;
  roleId: string;
  permissions: string[];
  preferences?: UserPreferences;
  flags?: SessionFlags;
}

export interface SessionFlags {
  isElevated: boolean;
  requiresReauth: boolean;
  isSuspicious: boolean;
  isEmergencyAccess: boolean;
  maintenanceMode: boolean;
}

export interface SessionLocation {
  country: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  isp?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

// ============================================================================
// DEVICE MANAGEMENT TYPES
// ============================================================================

export interface DeviceRegistration {
  id: string;
  userId: string;
  clinicId: string;
  deviceFingerprint: string;
  deviceName: string;
  deviceType: DeviceType;
  platform: string;
  browser: string;
  screenResolution: string;
  timezone: string;
  isTrusted: boolean;
  isBlocked: boolean;
  registeredAt: Date;
  lastUsed: Date;
  usageCount: number;
  securityEvents: number;
  metadata?: DeviceMetadata;
}

export type DeviceType = 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'unknown';

export interface DeviceMetadata {
  os: string;
  osVersion: string;
  browserVersion: string;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  colorDepth: number;
  pixelRatio: number;
}

export interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: boolean;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  pixelRatio: number;
  webglVendor?: string;
  webglRenderer?: string;
  audioFingerprint?: string;
  canvasFingerprint?: string;
}

// ============================================================================
// SECURITY & MONITORING TYPES
// ============================================================================

export interface SessionSecurityEvent {
  id: string;
  sessionId: string;
  userId: string;
  clinicId: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  description: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  location?: SessionLocation;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  actions: SecurityAction[];
}

export type SecurityEventType =
  | 'suspicious_login'
  | 'unusual_location'
  | 'rapid_requests'
  | 'session_hijack_attempt'
  | 'concurrent_limit_exceeded'
  | 'device_change'
  | 'ip_change'
  | 'privilege_escalation'
  | 'data_access_anomaly'
  | 'failed_authentication'
  | 'session_timeout'
  | 'forced_logout'
  | 'emergency_termination';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export type SecurityAction =
  | 'log_event'
  | 'send_alert'
  | 'require_mfa'
  | 'terminate_session'
  | 'block_device'
  | 'notify_admin'
  | 'escalate_incident'
  | 'lock_account';

export interface SuspiciousActivityDetection {
  ipAnomalyScore: number;
  locationAnomalyScore: number;
  timePatternScore: number;
  deviceChangeScore: number;
  behaviorScore: number;
  overallRiskScore: number;
  triggers: string[];
  recommendations: SecurityAction[];
}

export interface ThreatIntelligence {
  ipReputation: IPReputation;
  geoRisk: GeoRisk;
  deviceRisk: DeviceRisk;
  behaviorRisk: BehaviorRisk;
}

export interface IPReputation {
  isMalicious: boolean;
  isProxy: boolean;
  isVPN: boolean;
  isTor: boolean;
  riskScore: number;
  sources: string[];
}

export interface GeoRisk {
  isHighRisk: boolean;
  riskScore: number;
  reasons: string[];
}

export interface DeviceRisk {
  isCompromised: boolean;
  riskScore: number;
  indicators: string[];
}

export interface BehaviorRisk {
  isAnomalous: boolean;
  riskScore: number;
  patterns: string[];
}

// ============================================================================
// SESSION POLICY TYPES
// ============================================================================

export interface SessionPolicy {
  id: string;
  roleId: string;
  roleName: string;
  maxConcurrentSessions: number;
  timeoutMinutes: number;
  extendOnActivity: boolean;
  requireMFA: boolean;
  allowedDeviceTypes: DeviceType[];
  securityLevel: SecurityLevel;
  restrictions: SessionRestrictions;
  monitoring: MonitoringSettings;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export type SecurityLevel = 'basic' | 'standard' | 'high' | 'maximum';

export interface SessionRestrictions {
  ipWhitelist?: string[];
  geoRestrictions?: string[];
  timeRestrictions?: TimeRestriction[];
  deviceRestrictions?: DeviceRestriction[];
}

export interface TimeRestriction {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
}

export interface DeviceRestriction {
  allowedDeviceTypes: DeviceType[];
  requireTrustedDevice: boolean;
  maxDevicesPerUser: number;
}

export interface MonitoringSettings {
  trackLocation: boolean;
  trackDeviceChanges: boolean;
  trackIPChanges: boolean;
  alertOnSuspiciousActivity: boolean;
  logAllActivity: boolean;
  retentionDays: number;
}

// ============================================================================
// AUDIT & COMPLIANCE TYPES
// ============================================================================

export interface SessionAuditLog {
  id: string;
  sessionId: string;
  userId: string;
  clinicId: string;
  action: SessionAction;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  location?: SessionLocation;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
  metadata?: AuditMetadata;
}

export type SessionAction =
  | 'session_created'
  | 'session_renewed'
  | 'session_expired'
  | 'session_terminated'
  | 'session_extended'
  | 'device_registered'
  | 'device_trusted'
  | 'device_blocked'
  | 'security_event'
  | 'policy_violation'
  | 'emergency_access'
  | 'admin_override';

export interface AuditMetadata {
  requestId: string;
  correlationId: string;
  source: string;
  version: string;
  environment: string;
}

export interface LGPDSessionData {
  dataSubjectId: string;
  processingPurpose: string;
  legalBasis: string;
  dataCategories: string[];
  retentionPeriod: number;
  consentId?: string;
  anonymized: boolean;
  encrypted: boolean;
}

// ============================================================================
// SESSION MANAGEMENT TYPES
// ============================================================================

export interface SessionManager {
  createSession(params: CreateSessionParams): Promise<UserSession>;
  validateSession(sessionId: string): Promise<SessionValidationResult>;
  renewSession(sessionId: string): Promise<UserSession>;
  terminateSession(sessionId: string, reason?: string): Promise<void>;
  terminateAllSessions(userId: string, reason?: string): Promise<void>;
  getUserSessions(userId: string): Promise<UserSession[]>;
  getActiveSessions(clinicId: string): Promise<UserSession[]>;
  cleanupExpiredSessions(): Promise<number>;
}

export interface CreateSessionParams {
  userId: string;
  clinicId: string;
  deviceFingerprint: DeviceFingerprint;
  ipAddress: string;
  userAgent: string;
  location?: SessionLocation;
  metadata: SessionMetadata;
  timeoutMinutes?: number;
}

export interface SessionValidationResult {
  isValid: boolean;
  session?: UserSession;
  reason?: string;
  requiresAction?: SecurityAction[];
  securityEvents?: SessionSecurityEvent[];
}

export interface SessionActivity {
  sessionId: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  duration?: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// REAL-TIME MONITORING TYPES
// ============================================================================

export interface SessionMonitor {
  startMonitoring(sessionId: string): void;
  stopMonitoring(sessionId: string): void;
  getSessionMetrics(sessionId: string): Promise<SessionMetrics>;
  getSystemMetrics(): Promise<SystemMetrics>;
  subscribeToEvents(callback: (event: SessionEvent) => void): () => void;
}

export interface SessionMetrics {
  sessionId: string;
  userId: string;
  duration: number;
  activityCount: number;
  lastActivity: Date;
  securityScore: number;
  riskFactors: string[];
  performance: PerformanceMetrics;
}

export interface PerformanceMetrics {
  responseTime: number;
  requestCount: number;
  errorRate: number;
  throughput: number;
}

export interface SystemMetrics {
  totalActiveSessions: number;
  totalUsers: number;
  averageSessionDuration: number;
  securityEvents: number;
  systemLoad: number;
  errorRate: number;
}

export interface SessionEvent {
  type: SessionEventType;
  sessionId: string;
  userId: string;
  timestamp: Date;
  data: Record<string, any>;
}

export type SessionEventType =
  | 'session_created'
  | 'session_activity'
  | 'session_warning'
  | 'session_expired'
  | 'session_terminated'
  | 'security_alert'
  | 'device_change'
  | 'location_change';

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface SessionConfig {
  redis: RedisConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
  cleanup: CleanupConfig;
  notifications: NotificationConfig;
}

export interface RedisConfig {
  url: string;
  prefix: string;
  ttl: number;
  maxRetries: number;
  retryDelay: number;
}

export interface SecurityConfig {
  sessionSecret: string;
  tokenExpiry: number;
  maxConcurrentSessions: number;
  suspiciousActivityThreshold: number;
  enableThreatIntelligence: boolean;
  enableDeviceFingerprinting: boolean;
  enableLocationTracking: boolean;
}

export interface MonitoringConfig {
  enableRealTimeMonitoring: boolean;
  metricsInterval: number;
  alertThresholds: AlertThresholds;
  retentionDays: number;
}

export interface AlertThresholds {
  securityScore: number;
  concurrentSessions: number;
  failedLogins: number;
  suspiciousActivity: number;
}

export interface CleanupConfig {
  interval: number;
  batchSize: number;
  retentionDays: number;
  enableAutoCleanup: boolean;
}

export interface NotificationConfig {
  enableEmailAlerts: boolean;
  enableSlackAlerts: boolean;
  enableWebhooks: boolean;
  alertRecipients: string[];
  webhookUrl?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface SessionResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}

export interface SessionListResponse extends SessionResponse {
  data: {
    sessions: UserSession[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface SessionMetricsResponse extends SessionResponse {
  data: {
    metrics: SessionMetrics;
    trends: MetricTrend[];
  };
}

export interface MetricTrend {
  timestamp: Date;
  value: number;
  metric: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class SessionError extends Error {
  constructor(
    message: string,
    public code: SessionErrorCode,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'SessionError';
  }
}

export type SessionErrorCode =
  | 'SESSION_NOT_FOUND'
  | 'SESSION_EXPIRED'
  | 'SESSION_INVALID'
  | 'SESSION_LIMIT_EXCEEDED'
  | 'DEVICE_NOT_TRUSTED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'SECURITY_VIOLATION'
  | 'POLICY_VIOLATION'
  | 'AUTHENTICATION_REQUIRED'
  | 'AUTHORIZATION_FAILED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SYSTEM_ERROR';

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SessionStatus = 'active' | 'expired' | 'terminated' | 'suspended';

export type SessionSource = 'web' | 'mobile' | 'api' | 'admin' | 'system';

export interface SessionFilter {
  userId?: string;
  clinicId?: string;
  status?: SessionStatus;
  deviceType?: DeviceType;
  ipAddress?: string;
  location?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  lastActivityAfter?: Date;
  lastActivityBefore?: Date;
}

export interface SessionSort {
  field: keyof UserSession;
  direction: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: SessionSort;
  filter?: SessionFilter;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export * from './types';
