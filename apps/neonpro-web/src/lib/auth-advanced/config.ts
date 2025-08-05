// Session Management Configuration
// Story 1.4: Session Management & Security Implementation

import type { SessionConfig, SessionPolicy } from "./types";

// Default Session Configuration
export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  // Timeout Settings (in minutes)
  defaultSessionDuration: 480, // 8 hours
  maxSessionDuration: 720, // 12 hours
  idleTimeout: 30, // 30 minutes
  warningBeforeTimeout: 5, // 5 minutes warning

  // Concurrent Sessions
  maxConcurrentSessions: 3,
  allowMultipleDevices: true,

  // Security Settings
  enableDeviceFingerprinting: true,
  enableLocationTracking: true,
  enableSuspiciousActivityDetection: true,
  riskScoreThreshold: 70, // 0-100 scale

  // Cleanup Settings (in minutes/days)
  cleanupInterval: 60, // 1 hour
  retainAuditLogs: 90, // 90 days
  retainSecurityEvents: 365, // 1 year

  // Real-time Settings (in seconds)
  enableRealTimeMonitoring: true,
  websocketHeartbeat: 30, // 30 seconds
  activityUpdateInterval: 60, // 1 minute
};

// Role-based Session Policies
export const SESSION_POLICIES: Record<string, Partial<SessionPolicy>> = {
  owner: {
    name: "Owner Policy",
    description: "Maximum security policy for clinic owners",
    settings: {
      max_session_duration: 720, // 12 hours
      idle_timeout: 60, // 1 hour
      max_concurrent_sessions: 5,
      require_device_verification: true,
      require_location_verification: true,
      enable_suspicious_activity_detection: true,
      auto_logout_on_suspicious_activity: true,
      session_extension_allowed: true,
      max_session_extensions: 3,
      force_logout_on_policy_change: true,
    },
    security_rules: {
      min_security_level: "critical",
      require_mfa_for_sensitive_actions: true,
      block_concurrent_different_locations: true,
      max_failed_attempts: 3,
      lockout_duration: 30,
      risk_score_threshold: 50,
    },
  },

  manager: {
    name: "Manager Policy",
    description: "High security policy for clinic managers",
    settings: {
      max_session_duration: 600, // 10 hours
      idle_timeout: 45, // 45 minutes
      max_concurrent_sessions: 3,
      require_device_verification: true,
      require_location_verification: true,
      enable_suspicious_activity_detection: true,
      auto_logout_on_suspicious_activity: true,
      session_extension_allowed: true,
      max_session_extensions: 2,
      force_logout_on_policy_change: true,
    },
    security_rules: {
      min_security_level: "high",
      require_mfa_for_sensitive_actions: true,
      block_concurrent_different_locations: true,
      max_failed_attempts: 5,
      lockout_duration: 15,
      risk_score_threshold: 60,
    },
  },

  staff: {
    name: "Staff Policy",
    description: "Standard security policy for clinic staff",
    settings: {
      max_session_duration: 480, // 8 hours
      idle_timeout: 30, // 30 minutes
      max_concurrent_sessions: 2,
      require_device_verification: false,
      require_location_verification: false,
      enable_suspicious_activity_detection: true,
      auto_logout_on_suspicious_activity: false,
      session_extension_allowed: true,
      max_session_extensions: 1,
      force_logout_on_policy_change: false,
    },
    security_rules: {
      min_security_level: "medium",
      require_mfa_for_sensitive_actions: false,
      block_concurrent_different_locations: false,
      max_failed_attempts: 5,
      lockout_duration: 10,
      risk_score_threshold: 70,
    },
  },

  patient: {
    name: "Patient Policy",
    description: "Basic security policy for patient portal",
    settings: {
      max_session_duration: 240, // 4 hours
      idle_timeout: 15, // 15 minutes
      max_concurrent_sessions: 2,
      require_device_verification: false,
      require_location_verification: false,
      enable_suspicious_activity_detection: true,
      auto_logout_on_suspicious_activity: false,
      session_extension_allowed: false,
      max_session_extensions: 0,
      force_logout_on_policy_change: false,
    },
    security_rules: {
      min_security_level: "low",
      require_mfa_for_sensitive_actions: false,
      block_concurrent_different_locations: false,
      max_failed_attempts: 10,
      lockout_duration: 5,
      risk_score_threshold: 80,
    },
  },
};

// Security Event Risk Scores
export const SECURITY_EVENT_RISK_SCORES: Record<string, number> = {
  login_success: 0,
  login_failure: 10,
  logout: 0,
  session_timeout: 5,
  concurrent_session_limit: 20,
  suspicious_location: 40,
  suspicious_device: 50,
  unusual_activity: 30,
  privilege_escalation_attempt: 90,
  session_hijack_attempt: 95,
  brute_force_attempt: 80,
  account_lockout: 60,
  password_change: 10,
  mfa_enabled: -10, // Reduces risk
  mfa_disabled: 30,
  emergency_access: 70,
  session_terminated: 5,
};

// Device Trust Factors
export const DEVICE_TRUST_FACTORS = {
  // Positive factors (increase trust)
  KNOWN_DEVICE: 20,
  FREQUENT_USE: 15,
  CONSISTENT_LOCATION: 10,
  LONG_HISTORY: 25,
  NO_SECURITY_EVENTS: 10,
  MFA_ENABLED: 15,

  // Negative factors (decrease trust)
  NEW_DEVICE: -30,
  RARE_USE: -10,
  LOCATION_CHANGE: -20,
  SECURITY_EVENTS: -40,
  SUSPICIOUS_PATTERNS: -50,
  VPN_PROXY_USE: -15,
};

// Location Risk Factors
export const LOCATION_RISK_FACTORS = {
  // High-risk countries/regions
  HIGH_RISK_COUNTRIES: ["CN", "RU", "KP", "IR", "SY", "AF", "IQ", "LY", "SO", "YE"],

  // VPN/Proxy indicators
  VPN_PROVIDERS: ["NordVPN", "ExpressVPN", "Surfshark", "CyberGhost", "ProtonVPN"],

  // Risk scores by location type
  LOCATION_SCORES: {
    home_country: 0,
    neighboring_country: 10,
    known_travel_destination: 15,
    high_risk_country: 60,
    vpn_proxy: 40,
    tor_network: 80,
    unknown_location: 30,
  },
};

// Activity Patterns for Suspicious Detection
export const SUSPICIOUS_ACTIVITY_PATTERNS = {
  // Time-based patterns
  UNUSUAL_HOURS: {
    enabled: true,
    business_hours: { start: 6, end: 22 }, // 6 AM to 10 PM
    risk_multiplier: 1.5,
  },

  // Frequency patterns
  RAPID_REQUESTS: {
    enabled: true,
    max_requests_per_minute: 60,
    risk_score: 30,
  },

  // Geographic patterns
  IMPOSSIBLE_TRAVEL: {
    enabled: true,
    max_speed_kmh: 1000, // Commercial flight speed
    risk_score: 70,
  },

  // Behavioral patterns
  UNUSUAL_USER_AGENT: {
    enabled: true,
    risk_score: 20,
  },

  MULTIPLE_FAILED_LOGINS: {
    enabled: true,
    threshold: 5,
    time_window_minutes: 15,
    risk_score: 50,
  },
};

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  // Connection settings
  reconnectAttempts: 5,
  reconnectDelay: 1000, // 1 second
  maxReconnectDelay: 30000, // 30 seconds

  // Heartbeat settings
  heartbeatInterval: 30000, // 30 seconds
  heartbeatTimeout: 10000, // 10 seconds

  // Message settings
  maxMessageSize: 1024 * 1024, // 1MB
  messageQueueSize: 100,

  // Security settings
  enableCompression: true,
  enableEncryption: true,
  validateOrigin: true,
};

// Redis Configuration for Session Storage
export const REDIS_CONFIG = {
  // Connection settings
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || "0"),

  // Session storage settings
  keyPrefix: "session:",
  ttl: 86400, // 24 hours in seconds

  // Performance settings
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false,

  // Security settings
  enableTLS: process.env.NODE_ENV === "production",
  family: 4, // IPv4
};

// Environment-specific configurations
export const ENV_CONFIGS = {
  development: {
    ...DEFAULT_SESSION_CONFIG,
    enableDeviceFingerprinting: false,
    enableLocationTracking: false,
    riskScoreThreshold: 90,
    cleanupInterval: 5, // 5 minutes for testing
  },

  staging: {
    ...DEFAULT_SESSION_CONFIG,
    riskScoreThreshold: 80,
    cleanupInterval: 30, // 30 minutes
  },

  production: {
    ...DEFAULT_SESSION_CONFIG,
    // Production uses default config
  },
};

// Get configuration based on environment
export function getSessionConfig(): SessionConfig {
  const env = process.env.NODE_ENV || "development";
  return ENV_CONFIGS[env as keyof typeof ENV_CONFIGS] || DEFAULT_SESSION_CONFIG;
}

// Get session policy for role
export function getSessionPolicyForRole(role: string): Partial<SessionPolicy> {
  return SESSION_POLICIES[role.toLowerCase()] || SESSION_POLICIES.staff;
}

// Calculate risk score for security event
export function getSecurityEventRiskScore(eventType: string): number {
  return SECURITY_EVENT_RISK_SCORES[eventType] || 0;
}

// Check if location is high risk
export function isHighRiskLocation(countryCode: string): boolean {
  return LOCATION_RISK_FACTORS.HIGH_RISK_COUNTRIES.includes(countryCode.toUpperCase());
}

// Get location risk score
export function getLocationRiskScore(locationType: string): number {
  return (
    LOCATION_RISK_FACTORS.LOCATION_SCORES[
      locationType as keyof typeof LOCATION_RISK_FACTORS.LOCATION_SCORES
    ] || 30
  );
}
