/**
 * Security Configuration for NeonPro Session Management
 *
 * This file centralizes all security-related configurations for the session management system.
 * It provides type-safe configuration options with sensible defaults and validation.
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECURITY_CONFIG =
  exports.PRODUCTION_CONFIG_OVERRIDES =
  exports.DEVELOPMENT_CONFIG_OVERRIDES =
  exports.DEFAULT_SECURITY_CONFIG =
    void 0;
exports.getSecurityConfig = getSecurityConfig;
exports.validateSecurityConfig = validateSecurityConfig;
exports.getCSRFConfig = getCSRFConfig;
exports.getSessionHijackingConfig = getSessionHijackingConfig;
exports.getSessionTimeoutConfig = getSessionTimeoutConfig;
exports.getConcurrentSessionConfig = getConcurrentSessionConfig;
exports.getRateLimitConfig = getRateLimitConfig;
exports.getSecurityEventConfig = getSecurityEventConfig;
exports.getCleanupConfig = getCleanupConfig;
exports.getSecurityHeadersConfig = getSecurityHeadersConfig;
exports.isValidSecurityEventType = isValidSecurityEventType;
/**
 * Default security configuration
 * These values provide a good balance between security and usability
 */
exports.DEFAULT_SECURITY_CONFIG = {
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
    limitExceededStrategy: "terminate_oldest",
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
    windowType: "sliding",
    strictModeForSuspiciousIPs: true,
  },
  securityEvents: {
    loggedEvents: [
      "csrf_validation_failed",
      "session_hijacking_detected",
      "session_timeout_warning",
      "session_terminated",
      "concurrent_session_limit",
      "suspicious_activity",
      "rate_limit_exceeded",
    ],
    retentionDays: 90,
    realTimeNotifications: true,
    criticalEvents: ["session_hijacking_detected", "session_terminated", "suspicious_activity"],
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
    frameOptions: "DENY",
    contentTypeOptions: "nosniff",
    xssProtection: "1; mode=block",
    referrerPolicy: "strict-origin-when-cross-origin",
    permissionsPolicy: "camera=(), microphone=(), geolocation=()",
    strictTransportSecurity: "max-age=31536000; includeSubDomains",
  },
  global: {
    enabled: true,
    debugMode: false,
    environment: "production",
    strictMode: false,
  },
};
/**
 * Development-specific configuration overrides
 */
exports.DEVELOPMENT_CONFIG_OVERRIDES = {
  csrf: __assign(__assign({}, exports.DEFAULT_SECURITY_CONFIG.csrf), {
    validateIP: false,
    expirationHours: 1, // Shorter expiration for testing
  }),
  sessionHijacking: __assign(__assign({}, exports.DEFAULT_SECURITY_CONFIG.sessionHijacking), {
    riskThresholds: {
      allow: 5, // More lenient in development
      challenge: 7,
      block: 9,
      terminate: 10,
    },
  }),
  sessionTimeout: __assign(__assign({}, exports.DEFAULT_SECURITY_CONFIG.sessionTimeout), {
    defaultTimeoutMinutes: 60,
    warningMinutes: [10, 5, 2],
  }),
  rateLimiting: __assign(__assign({}, exports.DEFAULT_SECURITY_CONFIG.rateLimiting), {
    defaultLimits: {
      authenticatedPerMinute: 200, // Higher limits in development
      authenticatedPerHour: 5000,
      unauthenticatedPerMinute: 100,
      unauthenticatedPerHour: 1000,
    },
  }),
  global: __assign(__assign({}, exports.DEFAULT_SECURITY_CONFIG.global), {
    debugMode: true,
    environment: "development",
    strictMode: false,
  }),
};
/**
 * Production-specific configuration overrides
 */
exports.PRODUCTION_CONFIG_OVERRIDES = {
  sessionHijacking: __assign(__assign({}, exports.DEFAULT_SECURITY_CONFIG.sessionHijacking), {
    riskThresholds: {
      allow: 1, // Stricter in production
      challenge: 3,
      block: 5,
      terminate: 6,
    },
  }),
  rateLimiting: __assign(__assign({}, exports.DEFAULT_SECURITY_CONFIG.rateLimiting), {
    strictModeForSuspiciousIPs: true,
  }),
  global: __assign(__assign({}, exports.DEFAULT_SECURITY_CONFIG.global), {
    debugMode: false,
    environment: "production",
    strictMode: true,
  }),
};
/**
 * Get security configuration based on environment
 */
function getSecurityConfig(environment) {
  var env = environment || process.env.NODE_ENV || "production";
  var config = __assign({}, exports.DEFAULT_SECURITY_CONFIG);
  if (env === "development") {
    config = mergeConfigs(config, exports.DEVELOPMENT_CONFIG_OVERRIDES);
  } else if (env === "production") {
    config = mergeConfigs(config, exports.PRODUCTION_CONFIG_OVERRIDES);
  }
  return config;
}
/**
 * Merge configuration objects deeply
 */
function mergeConfigs(base, override) {
  var result = __assign({}, base);
  for (var key in override) {
    if (override[key] !== undefined) {
      if (typeof override[key] === "object" && !Array.isArray(override[key])) {
        result[key] = __assign(__assign({}, result[key]), override[key]);
      } else {
        result[key] = override[key];
      }
    }
  }
  return result;
}
/**
 * Validate security configuration
 */
function validateSecurityConfig(config) {
  var errors = [];
  // Validate CSRF config
  if (config.csrf.tokenLength < 16) {
    errors.push("CSRF token length must be at least 16 bytes");
  }
  if (config.csrf.expirationHours < 1) {
    errors.push("CSRF token expiration must be at least 1 hour");
  }
  // Validate session hijacking config
  var thresholds = config.sessionHijacking.riskThresholds;
  if (thresholds.allow >= thresholds.challenge) {
    errors.push("Allow threshold must be less than challenge threshold");
  }
  if (thresholds.challenge >= thresholds.block) {
    errors.push("Challenge threshold must be less than block threshold");
  }
  if (thresholds.block >= thresholds.terminate) {
    errors.push("Block threshold must be less than terminate threshold");
  }
  // Validate session timeout config
  if (config.sessionTimeout.defaultTimeoutMinutes < 5) {
    errors.push("Session timeout must be at least 5 minutes");
  }
  if (config.sessionTimeout.maxExtensions < 0) {
    errors.push("Max extensions cannot be negative");
  }
  // Validate concurrent sessions config
  if (config.concurrentSessions.defaultMaxSessions < 1) {
    errors.push("Max concurrent sessions must be at least 1");
  }
  // Validate rate limiting config
  var limits = config.rateLimiting.defaultLimits;
  if (limits.authenticatedPerMinute < 1) {
    errors.push("Authenticated rate limit must be at least 1 per minute");
  }
  if (limits.unauthenticatedPerMinute < 1) {
    errors.push("Unauthenticated rate limit must be at least 1 per minute");
  }
  return errors;
}
/**
 * Get configuration for a specific component
 */
function getCSRFConfig(config) {
  return (config || getSecurityConfig()).csrf;
}
function getSessionHijackingConfig(config) {
  return (config || getSecurityConfig()).sessionHijacking;
}
function getSessionTimeoutConfig(config) {
  return (config || getSecurityConfig()).sessionTimeout;
}
function getConcurrentSessionConfig(config) {
  return (config || getSecurityConfig()).concurrentSessions;
}
function getRateLimitConfig(config) {
  return (config || getSecurityConfig()).rateLimiting;
}
function getSecurityEventConfig(config) {
  return (config || getSecurityConfig()).securityEvents;
}
function getCleanupConfig(config) {
  return (config || getSecurityConfig()).cleanup;
}
function getSecurityHeadersConfig(config) {
  return (config || getSecurityConfig()).securityHeaders;
}
/**
 * Export the current security configuration
 */
exports.SECURITY_CONFIG = getSecurityConfig();
/**
 * Type guard to check if an event type is valid
 */
function isValidSecurityEventType(eventType) {
  var validTypes = [
    "csrf_validation_failed",
    "session_hijacking_detected",
    "session_timeout_warning",
    "session_terminated",
    "concurrent_session_limit",
    "suspicious_activity",
    "rate_limit_exceeded",
    "invalid_fingerprint",
    "session_extended",
    "trusted_ip_added",
    "session_blacklisted",
  ];
  return validTypes.includes(eventType);
}
