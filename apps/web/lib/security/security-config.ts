/**
 * Security Configuration for NeonPro Session Management
 *
 * This file centralizes all security-related configurations for the session management system.
 * It provides type-safe configuration options with sensible defaults and validation.
 */

export interface CSRFConfig {
  /** Length of CSRF tokens in bytes (will be hex encoded, so actual length is double) */
  tokenLength: number;
  /** Token expiration time in hours */
  expirationHours: number;
  /** Whether to validate user agent when checking tokens */
  validateUserAgent: boolean;
  /** Whether to validate client IP when checking tokens */
  validateIP: boolean;
  /** Whether to allow token refresh before expiration */
  allowRefresh: boolean;
  /** Minimum time before token can be refreshed (in minutes) */
  refreshCooldownMinutes: number;
}

export interface SessionHijackingConfig {
  /** Risk score threshold for different actions (0-10 scale) */
  riskThresholds: {
    /** Allow access (0-2) */
    allow: number;
    /** Require additional challenge (3-5) */
    challenge: number;
    /** Block temporarily (6-7) */
    block: number;
    /** Terminate session (8+) */
    terminate: number;
  };
  /** Weight factors for risk calculation */
  riskWeights: {
    /** Weight for IP address changes */
    ipChange: number;
    /** Weight for user agent changes */
    userAgentChange: number;
    /** Weight for accept headers changes */
    acceptChange: number;
    /** Weight for timezone changes */
    timezoneChange: number;
  };
  /** How long to remember fingerprints (in hours) */
  fingerprintRetentionHours: number;
  /** Maximum number of fingerprints to keep per session */
  maxFingerprintsPerSession: number;
  /** Whether to automatically adapt thresholds based on user behavior */
  adaptiveThresholds: boolean;
}

export interface SessionTimeoutConfig {
  /** Default session timeout in minutes */
  defaultTimeoutMinutes: number;
  /** Warning intervals before timeout (in minutes) */
  warningMinutes: number[];
  /** Maximum number of session extensions allowed */
  maxExtensions: number;
  /** Whether to extend session automatically on user activity */
  extendOnActivity: boolean;
  /** Minimum activity interval to trigger extension (in minutes) */
  activityExtensionThresholdMinutes: number;
  /** How much time to add when extending session (in minutes) */
  extensionMinutes: number;
  /** Maximum total session duration (in hours) */
  maxSessionDurationHours: number;
}

export interface ConcurrentSessionConfig {
  /** Default maximum concurrent sessions per user */
  defaultMaxSessions: number;
  /** Strategy when limit is exceeded */
  limitExceededStrategy: 'terminate_oldest' | 'terminate_all' | 'block_new';
  /** Whether to notify user when sessions are terminated */
  notifyOnTermination: boolean;
  /** Grace period before terminating sessions (in minutes) */
  terminationGraceMinutes: number;
}

export interface RateLimitConfig {
  /** Default rate limit windows and limits */
  defaultLimits: {
    /** Requests per minute for authenticated users */
    authenticatedPerMinute: number;
    /** Requests per hour for authenticated users */
    authenticatedPerHour: number;
    /** Requests per minute for unauthenticated users */
    unauthenticatedPerMinute: number;
    /** Requests per hour for unauthenticated users */
    unauthenticatedPerHour: number;
  };
  /** Rate limit for security-sensitive operations */
  securityLimits: {
    /** Login attempts per hour */
    loginAttemptsPerHour: number;
    /** Password reset requests per hour */
    passwordResetPerHour: number;
    /** CSRF token generation per hour */
    csrfTokenGenerationPerHour: number;
  };
  /** Whether to use sliding window or fixed window */
  windowType: 'sliding' | 'fixed';
  /** Whether to apply stricter limits for suspicious IPs */
  strictModeForSuspiciousIPs: boolean;
}

export interface SecurityEventConfig {
  /** Types of events to log */
  loggedEvents: SecurityEventType[];
  /** How long to retain security events (in days) */
  retentionDays: number;
  /** Whether to send real-time notifications for critical events */
  realTimeNotifications: boolean;
  /** Events that trigger immediate notifications */
  criticalEvents: SecurityEventType[];
  /** Maximum events to store per user per day */
  maxEventsPerUserPerDay: number;
}

export interface CleanupConfig {
  /** How often to run cleanup tasks (in hours) */
  cleanupIntervalHours: number;
  /** Retention periods for different data types */
  retentionPeriods: {
    /** Expired CSRF tokens (in hours) */
    expiredCSRFTokensHours: number;
    /** Old session activities (in days) */
    sessionActivitiesDays: number;
    /** Security events (in days) */
    securityEventsDays: number;
    /** Expired rate limit entries (in hours) */
    rateLimitEntriesHours: number;
    /** Old fingerprints (in days) */
    fingerprintsDays: number;
  };
  /** Whether to run cleanup automatically */
  autoCleanup: boolean;
  /** Maximum records to delete in a single cleanup operation */
  maxDeleteBatchSize: number;
}

export interface SecurityHeadersConfig {
  /** Content Security Policy */
  contentSecurityPolicy: string;
  /** X-Frame-Options */
  frameOptions: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
  /** X-Content-Type-Options */
  contentTypeOptions: 'nosniff';
  /** X-XSS-Protection */
  xssProtection: '1; mode=block' | '0';
  /** Referrer-Policy */
  referrerPolicy: string;
  /** Permissions-Policy */
  permissionsPolicy: string;
  /** Strict-Transport-Security */
  strictTransportSecurity: string;
}

export type SecurityEventType =
  | 'csrf_validation_failed'
  | 'session_hijacking_detected'
  | 'session_timeout_warning'
  | 'session_terminated'
  | 'concurrent_session_limit'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'invalid_fingerprint'
  | 'session_extended'
  | 'trusted_ip_added'
  | 'session_blacklisted';

export interface IntegratedSecurityConfig {
  csrf: CSRFConfig;
  sessionHijacking: SessionHijackingConfig;
  sessionTimeout: SessionTimeoutConfig;
  concurrentSessions: ConcurrentSessionConfig;
  rateLimiting: RateLimitConfig;
  securityEvents: SecurityEventConfig;
  cleanup: CleanupConfig;
  securityHeaders: SecurityHeadersConfig;
  /** Global security settings */
  global: {
    /** Whether security is enabled globally */
    enabled: boolean;
    /** Debug mode for detailed logging */
    debugMode: boolean;
    /** Environment (affects some security settings) */
    environment: 'development' | 'staging' | 'production';
    /** Whether to use strict mode (more aggressive security) */
    strictMode: boolean;
  };
}

/**
 * Default security configuration
 * These values provide a good balance between security and usability
 */
export const DEFAULT_SECURITY_CONFIG: IntegratedSecurityConfig = {
  csrf: {
    tokenLength: 32,
    expirationHours: 24,
    validateUserAgent: true,
    validateIP: true,
    allowRefresh: true,
    refreshCooldownMinutes: 5,
  },

  sessionHijacking: {
    riskThresholds: {
      allow: 2,
      challenge: 5,
      block: 7,
      terminate: 8,
    },
    riskWeights: {
      ipChange: 4,
      userAgentChange: 3,
      acceptChange: 1,
      timezoneChange: 2,
    },
    fingerprintRetentionHours: 168, // 7 days
    maxFingerprintsPerSession: 10,
    adaptiveThresholds: true,
  },

  sessionTimeout: {
    defaultTimeoutMinutes: 30,
    warningMinutes: [5, 2, 1],
    maxExtensions: 3,
    extendOnActivity: true,
    activityExtensionThresholdMinutes: 5,
    extensionMinutes: 15,
    maxSessionDurationHours: 8,
  },

  concurrentSessions: {
    defaultMaxSessions: 3,
    limitExceededStrategy: 'terminate_oldest',
    notifyOnTermination: true,
    terminationGraceMinutes: 2,
  },

  rateLimiting: {
    defaultLimits: {
      authenticatedPerMinute: 60,
      authenticatedPerHour: 1000,
      unauthenticatedPerMinute: 20,
      unauthenticatedPerHour: 200,
    },
    securityLimits: {
      loginAttemptsPerHour: 10,
      passwordResetPerHour: 3,
      csrfTokenGenerationPerHour: 100,
    },
    windowType: 'sliding',
    strictModeForSuspiciousIPs: true,
  },

  securityEvents: {
    loggedEvents: [
      'csrf_validation_failed',
      'session_hijacking_detected',
      'session_timeout_warning',
      'session_terminated',
      'concurrent_session_limit',
      'suspicious_activity',
      'rate_limit_exceeded',
    ],
    retentionDays: 90,
    realTimeNotifications: true,
    criticalEvents: [
      'session_hijacking_detected',
      'session_terminated',
      'suspicious_activity',
    ],
    maxEventsPerUserPerDay: 1000,
  },

  cleanup: {
    cleanupIntervalHours: 6,
    retentionPeriods: {
      expiredCSRFTokensHours: 1,
      sessionActivitiesDays: 30,
      securityEventsDays: 90,
      rateLimitEntriesHours: 2,
      fingerprintsDays: 7,
    },
    autoCleanup: true,
    maxDeleteBatchSize: 1000,
  },

  securityHeaders: {
    contentSecurityPolicy:
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
    frameOptions: 'DENY',
    contentTypeOptions: 'nosniff',
    xssProtection: '1; mode=block',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
    strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  },

  global: {
    enabled: true,
    debugMode: false,
    environment: 'production',
    strictMode: false,
  },
};

/**
 * Development-specific configuration overrides
 */
export const DEVELOPMENT_CONFIG_OVERRIDES: Partial<IntegratedSecurityConfig> = {
  csrf: {
    ...DEFAULT_SECURITY_CONFIG.csrf,
    validateIP: false, // Allow IP changes in development
    expirationHours: 1, // Shorter expiration for testing
  },

  sessionHijacking: {
    ...DEFAULT_SECURITY_CONFIG.sessionHijacking,
    riskThresholds: {
      allow: 5, // More lenient in development
      challenge: 7,
      block: 9,
      terminate: 10,
    },
  },

  sessionTimeout: {
    ...DEFAULT_SECURITY_CONFIG.sessionTimeout,
    defaultTimeoutMinutes: 60, // Longer timeout in development
    warningMinutes: [10, 5, 2],
  },

  rateLimiting: {
    ...DEFAULT_SECURITY_CONFIG.rateLimiting,
    defaultLimits: {
      authenticatedPerMinute: 200, // Higher limits in development
      authenticatedPerHour: 5000,
      unauthenticatedPerMinute: 100,
      unauthenticatedPerHour: 1000,
    },
  },

  global: {
    ...DEFAULT_SECURITY_CONFIG.global,
    debugMode: true,
    environment: 'development',
    strictMode: false,
  },
};

/**
 * Production-specific configuration overrides
 */
export const PRODUCTION_CONFIG_OVERRIDES: Partial<IntegratedSecurityConfig> = {
  sessionHijacking: {
    ...DEFAULT_SECURITY_CONFIG.sessionHijacking,
    riskThresholds: {
      allow: 1, // Stricter in production
      challenge: 3,
      block: 5,
      terminate: 6,
    },
  },

  rateLimiting: {
    ...DEFAULT_SECURITY_CONFIG.rateLimiting,
    strictModeForSuspiciousIPs: true,
  },

  global: {
    ...DEFAULT_SECURITY_CONFIG.global,
    debugMode: false,
    environment: 'production',
    strictMode: true,
  },
};

/**
 * Get security configuration based on environment
 */
export function getSecurityConfig(
  environment?: string
): IntegratedSecurityConfig {
  const env = environment || process.env.NODE_ENV || 'production';

  let config = { ...DEFAULT_SECURITY_CONFIG };

  if (env === 'development') {
    config = mergeConfigs(config, DEVELOPMENT_CONFIG_OVERRIDES);
  } else if (env === 'production') {
    config = mergeConfigs(config, PRODUCTION_CONFIG_OVERRIDES);
  }

  return config;
}

/**
 * Merge configuration objects deeply
 */
function mergeConfigs(
  base: IntegratedSecurityConfig,
  override: Partial<IntegratedSecurityConfig>
): IntegratedSecurityConfig {
  const result = { ...base };

  for (const key in override) {
    if (override[key as keyof IntegratedSecurityConfig] !== undefined) {
      if (
        typeof override[key as keyof IntegratedSecurityConfig] === 'object' &&
        !Array.isArray(override[key as keyof IntegratedSecurityConfig])
      ) {
        result[key as keyof IntegratedSecurityConfig] = {
          ...result[key as keyof IntegratedSecurityConfig],
          ...override[key as keyof IntegratedSecurityConfig],
        } as any;
      } else {
        result[key as keyof IntegratedSecurityConfig] = override[
          key as keyof IntegratedSecurityConfig
        ] as any;
      }
    }
  }

  return result;
}

/**
 * Validate security configuration
 */
export function validateSecurityConfig(
  config: IntegratedSecurityConfig
): string[] {
  const errors: string[] = [];

  // Validate CSRF config
  if (config.csrf.tokenLength < 16) {
    errors.push('CSRF token length must be at least 16 bytes');
  }
  if (config.csrf.expirationHours < 1) {
    errors.push('CSRF token expiration must be at least 1 hour');
  }

  // Validate session hijacking config
  const thresholds = config.sessionHijacking.riskThresholds;
  if (thresholds.allow >= thresholds.challenge) {
    errors.push('Allow threshold must be less than challenge threshold');
  }
  if (thresholds.challenge >= thresholds.block) {
    errors.push('Challenge threshold must be less than block threshold');
  }
  if (thresholds.block >= thresholds.terminate) {
    errors.push('Block threshold must be less than terminate threshold');
  }

  // Validate session timeout config
  if (config.sessionTimeout.defaultTimeoutMinutes < 5) {
    errors.push('Session timeout must be at least 5 minutes');
  }
  if (config.sessionTimeout.maxExtensions < 0) {
    errors.push('Max extensions cannot be negative');
  }

  // Validate concurrent sessions config
  if (config.concurrentSessions.defaultMaxSessions < 1) {
    errors.push('Max concurrent sessions must be at least 1');
  }

  // Validate rate limiting config
  const limits = config.rateLimiting.defaultLimits;
  if (limits.authenticatedPerMinute < 1) {
    errors.push('Authenticated rate limit must be at least 1 per minute');
  }
  if (limits.unauthenticatedPerMinute < 1) {
    errors.push('Unauthenticated rate limit must be at least 1 per minute');
  }

  return errors;
}

/**
 * Get configuration for a specific component
 */
export function getCSRFConfig(config?: IntegratedSecurityConfig): CSRFConfig {
  return (config || getSecurityConfig()).csrf;
}

export function getSessionHijackingConfig(
  config?: IntegratedSecurityConfig
): SessionHijackingConfig {
  return (config || getSecurityConfig()).sessionHijacking;
}

export function getSessionTimeoutConfig(
  config?: IntegratedSecurityConfig
): SessionTimeoutConfig {
  return (config || getSecurityConfig()).sessionTimeout;
}

export function getConcurrentSessionConfig(
  config?: IntegratedSecurityConfig
): ConcurrentSessionConfig {
  return (config || getSecurityConfig()).concurrentSessions;
}

export function getRateLimitConfig(
  config?: IntegratedSecurityConfig
): RateLimitConfig {
  return (config || getSecurityConfig()).rateLimiting;
}

export function getSecurityEventConfig(
  config?: IntegratedSecurityConfig
): SecurityEventConfig {
  return (config || getSecurityConfig()).securityEvents;
}

export function getCleanupConfig(
  config?: IntegratedSecurityConfig
): CleanupConfig {
  return (config || getSecurityConfig()).cleanup;
}

export function getSecurityHeadersConfig(
  config?: IntegratedSecurityConfig
): SecurityHeadersConfig {
  return (config || getSecurityConfig()).securityHeaders;
}

/**
 * Export the current security configuration
 */
export const SECURITY_CONFIG = getSecurityConfig();

/**
 * Type guard to check if an event type is valid
 */
export function isValidSecurityEventType(
  eventType: string
): eventType is SecurityEventType {
  const validTypes: SecurityEventType[] = [
    'csrf_validation_failed',
    'session_hijacking_detected',
    'session_timeout_warning',
    'session_terminated',
    'concurrent_session_limit',
    'suspicious_activity',
    'rate_limit_exceeded',
    'invalid_fingerprint',
    'session_extended',
    'trusted_ip_added',
    'session_blacklisted',
  ];

  return validTypes.includes(eventType as SecurityEventType);
}
