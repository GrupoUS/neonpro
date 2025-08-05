// ============================================================================
// Session Management System - Configuration
// NeonPro - Session Management & Security
// ============================================================================
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
exports.CLINIC_PRESETS =
  exports.GUEST_SESSION_POLICY =
  exports.ADMIN_SESSION_POLICY =
  exports.STANDARD_SESSION_POLICY =
  exports.HIGH_SECURITY_CONFIG =
  exports.PRODUCTION_CONFIG =
  exports.DEVELOPMENT_CONFIG =
  exports.DEFAULT_AUDIT_CONFIG =
  exports.DEFAULT_DEVICE_CONFIG =
  exports.DEFAULT_SECURITY_CONFIG =
  exports.DEFAULT_SESSION_CONFIG =
    void 0;
exports.mergeConfigs = mergeConfigs;
exports.getEnvironmentConfig = getEnvironmentConfig;
exports.validateConfig = validateConfig;
exports.getPolicyByRole = getPolicyByRole;
exports.createCustomPolicy = createCustomPolicy;
exports.getClinicPreset = getClinicPreset;
// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================
/**
 * Default session configuration
 */
exports.DEFAULT_SESSION_CONFIG = {
  // Session timing
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  renewalThreshold: 0.25, // Renew when 25% of time remaining
  maxSessionDuration: 8 * 60 * 60 * 1000, // 8 hours max
  // Concurrent sessions
  maxConcurrentSessions: 3,
  allowMultipleDevices: true,
  // Security settings
  requireDeviceVerification: false,
  enableLocationTracking: true,
  enableDeviceFingerprinting: true,
  // Token settings
  tokenRotationInterval: 15 * 60 * 1000, // 15 minutes
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  // Cleanup settings
  cleanupInterval: 60 * 60 * 1000, // 1 hour
  retainExpiredSessions: 24 * 60 * 60 * 1000, // 24 hours
  // Redis settings
  redis: {
    enabled: true,
    keyPrefix: "neonpro:session:",
    ttl: 30 * 60, // 30 minutes in seconds
  },
  // LGPD compliance
  lgpd: {
    enabled: true,
    consentRequired: true,
    dataRetentionDays: 365,
    anonymizeAfterDays: 1095, // 3 years
  },
};
/**
 * Default security configuration
 */
exports.DEFAULT_SECURITY_CONFIG = {
  // Threat detection
  enableThreatDetection: true,
  suspiciousActivityThreshold: 5,
  maxFailedAttempts: 3,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  // IP monitoring
  enableIpBlacklist: true,
  autoBlockSuspiciousIps: true,
  ipReputationCheck: true,
  // Geographic restrictions
  enableGeoBlocking: false,
  allowedCountries: [],
  blockedCountries: [],
  // Device security
  requireTrustedDevice: false,
  deviceTrustThreshold: 70,
  autoTrustAfterDays: 30,
  // Session security
  enableSessionHijackingDetection: true,
  enablePrivilegeEscalationDetection: true,
  securityScoreThreshold: 50,
  // Monitoring
  realTimeMonitoring: true,
  alertThresholds: {
    low: 10,
    medium: 25,
    high: 50,
    critical: 100,
  },
};
/**
 * Default device configuration
 */
exports.DEFAULT_DEVICE_CONFIG = {
  // Registration
  autoRegisterDevices: true,
  requireDeviceVerification: false,
  deviceVerificationMethods: ["email", "sms"],
  // Trust management
  initialTrustLevel: 50,
  maxTrustLevel: 100,
  trustDecayRate: 0.1, // Per day
  // Fingerprinting
  enableFingerprinting: true,
  fingerprintComponents: [
    "userAgent",
    "screen",
    "timezone",
    "language",
    "platform",
    "plugins",
    "canvas",
  ],
  // Cleanup
  cleanupInactiveAfterDays: 90,
  removeUntrustedAfterDays: 30,
  // Security
  blockSuspiciousDevices: true,
  maxDevicesPerUser: 10,
};
/**
 * Default audit configuration
 */
exports.DEFAULT_AUDIT_CONFIG = {
  // Logging levels
  enableSessionLogs: true,
  enableSecurityLogs: true,
  enableDeviceLogs: true,
  enableLgpdLogs: true,
  // Log retention
  logRetentionDays: 365,
  archiveAfterDays: 90,
  // Performance
  bufferSize: 100,
  flushInterval: 5000, // 5 seconds
  // Privacy
  anonymizePersonalData: true,
  excludeSensitiveFields: ["password", "token", "secret", "key"],
  // Search
  enableFullTextSearch: true,
  searchLanguage: "portuguese",
};
// ============================================================================
// ENVIRONMENT-SPECIFIC CONFIGURATIONS
// ============================================================================
/**
 * Development environment configuration
 */
exports.DEVELOPMENT_CONFIG = {
  sessionTimeout: 60 * 60 * 1000, // 1 hour for development
  maxConcurrentSessions: 10,
  requireDeviceVerification: false,
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
  lgpd: {
    enabled: true,
    consentRequired: false, // Relaxed for development
    dataRetentionDays: 30,
    anonymizeAfterDays: 90,
  },
};
/**
 * Production environment configuration
 */
exports.PRODUCTION_CONFIG = {
  sessionTimeout: 15 * 60 * 1000, // 15 minutes for production
  maxConcurrentSessions: 2,
  requireDeviceVerification: true,
  enableLocationTracking: true,
  tokenRotationInterval: 10 * 60 * 1000, // 10 minutes
  lgpd: {
    enabled: true,
    consentRequired: true,
    dataRetentionDays: 365,
    anonymizeAfterDays: 1095,
  },
};
/**
 * High security environment configuration
 */
exports.HIGH_SECURITY_CONFIG = {
  sessionTimeout: 10 * 60 * 1000, // 10 minutes
  maxConcurrentSessions: 1,
  requireDeviceVerification: true,
  enableLocationTracking: true,
  tokenRotationInterval: 5 * 60 * 1000, // 5 minutes
  maxSessionDuration: 2 * 60 * 60 * 1000, // 2 hours max
};
// ============================================================================
// PREDEFINED SESSION POLICIES
// ============================================================================
/**
 * Standard session policy for regular users
 */
exports.STANDARD_SESSION_POLICY = {
  id: "standard",
  name: "Standard Session Policy",
  description: "Default policy for regular users",
  config: {
    sessionTimeout: 30 * 60 * 1000,
    renewalThreshold: 0.25,
    maxConcurrentSessions: 3,
    requireDeviceVerification: false,
    enableLocationTracking: true,
  },
  isActive: true,
  priority: 0,
  effectiveFrom: new Date(),
  createdBy: "system",
  createdAt: new Date(),
  updatedAt: new Date(),
};
/**
 * Admin session policy for administrative users
 */
exports.ADMIN_SESSION_POLICY = {
  id: "admin",
  name: "Admin Session Policy",
  description: "Enhanced security policy for administrators",
  config: {
    sessionTimeout: 15 * 60 * 1000,
    renewalThreshold: 0.5,
    maxConcurrentSessions: 2,
    requireDeviceVerification: true,
    enableLocationTracking: true,
    requireTrustedDevice: true,
  },
  isActive: true,
  priority: 10,
  effectiveFrom: new Date(),
  createdBy: "system",
  createdAt: new Date(),
  updatedAt: new Date(),
};
/**
 * Guest session policy for temporary access
 */
exports.GUEST_SESSION_POLICY = {
  id: "guest",
  name: "Guest Session Policy",
  description: "Limited policy for guest users",
  config: {
    sessionTimeout: 10 * 60 * 1000,
    renewalThreshold: 0.1,
    maxConcurrentSessions: 1,
    requireDeviceVerification: false,
    enableLocationTracking: false,
  },
  isActive: true,
  priority: -10,
  effectiveFrom: new Date(),
  createdBy: "system",
  createdAt: new Date(),
  updatedAt: new Date(),
};
// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================
/**
 * Merge configurations with precedence
 */
function mergeConfigs(base, override) {
  return __assign(__assign(__assign({}, base), override), {
    redis: __assign(__assign({}, base.redis), override.redis),
    lgpd: __assign(__assign({}, base.lgpd), override.lgpd),
  });
}
/**
 * Get configuration for environment
 */
function getEnvironmentConfig(env) {
  var baseConfig = exports.DEFAULT_SESSION_CONFIG;
  switch (env.toLowerCase()) {
    case "development":
    case "dev":
      return mergeConfigs(baseConfig, exports.DEVELOPMENT_CONFIG);
    case "production":
    case "prod":
      return mergeConfigs(baseConfig, exports.PRODUCTION_CONFIG);
    case "staging":
    case "test":
      return mergeConfigs(baseConfig, {
        sessionTimeout: 20 * 60 * 1000,
        maxConcurrentSessions: 5,
        cleanupInterval: 10 * 60 * 1000,
      });
    default:
      return baseConfig;
  }
}
/**
 * Validate configuration
 */
function validateConfig(config) {
  var errors = [];
  // Validate timeouts
  if (config.sessionTimeout <= 0) {
    errors.push("Session timeout must be positive");
  }
  if (config.renewalThreshold <= 0 || config.renewalThreshold >= 1) {
    errors.push("Renewal threshold must be between 0 and 1");
  }
  if (config.maxConcurrentSessions <= 0) {
    errors.push("Max concurrent sessions must be positive");
  }
  if (config.tokenRotationInterval <= 0) {
    errors.push("Token rotation interval must be positive");
  }
  if (config.refreshTokenExpiry <= config.sessionTimeout) {
    errors.push("Refresh token expiry must be greater than session timeout");
  }
  // Validate Redis config
  if (config.redis.enabled && !config.redis.keyPrefix) {
    errors.push("Redis key prefix is required when Redis is enabled");
  }
  // Validate LGPD config
  if (config.lgpd.enabled) {
    if (config.lgpd.dataRetentionDays <= 0) {
      errors.push("LGPD data retention days must be positive");
    }
    if (config.lgpd.anonymizeAfterDays <= config.lgpd.dataRetentionDays) {
      errors.push("LGPD anonymize after days must be greater than retention days");
    }
  }
  return errors;
}
/**
 * Get policy by role
 */
function getPolicyByRole(role) {
  switch (role.toLowerCase()) {
    case "admin":
    case "administrator":
    case "owner":
      return exports.ADMIN_SESSION_POLICY;
    case "guest":
    case "visitor":
    case "temporary":
      return exports.GUEST_SESSION_POLICY;
    default:
      return exports.STANDARD_SESSION_POLICY;
  }
}
/**
 * Create custom policy
 */
function createCustomPolicy(name, description, config, options) {
  var _a, _b;
  if (options === void 0) {
    options = {};
  }
  return {
    id: "custom_".concat(Date.now()),
    name: name,
    description: description,
    config: config,
    clinicId: options.clinicId,
    userRole: options.userRole,
    isActive: true,
    priority: (_a = options.priority) !== null && _a !== void 0 ? _a : 0,
    effectiveFrom: (_b = options.effectiveFrom) !== null && _b !== void 0 ? _b : new Date(),
    effectiveUntil: options.effectiveUntil,
    createdBy: "system",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
// ============================================================================
// CONFIGURATION PRESETS
// ============================================================================
/**
 * Configuration presets for different clinic types
 */
exports.CLINIC_PRESETS = {
  /**
   * Small clinic configuration (1-5 users)
   */
  small: mergeConfigs(exports.DEFAULT_SESSION_CONFIG, {
    maxConcurrentSessions: 2,
    sessionTimeout: 45 * 60 * 1000, // 45 minutes
    requireDeviceVerification: false,
    cleanupInterval: 30 * 60 * 1000, // 30 minutes
  }),
  /**
   * Medium clinic configuration (6-20 users)
   */
  medium: mergeConfigs(exports.DEFAULT_SESSION_CONFIG, {
    maxConcurrentSessions: 3,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    requireDeviceVerification: true,
    cleanupInterval: 15 * 60 * 1000, // 15 minutes
  }),
  /**
   * Large clinic configuration (21+ users)
   */
  large: mergeConfigs(exports.DEFAULT_SESSION_CONFIG, {
    maxConcurrentSessions: 5,
    sessionTimeout: 20 * 60 * 1000, // 20 minutes
    requireDeviceVerification: true,
    tokenRotationInterval: 10 * 60 * 1000, // 10 minutes
    cleanupInterval: 10 * 60 * 1000, // 10 minutes
  }),
  /**
   * Enterprise configuration (50+ users)
   */
  enterprise: mergeConfigs(exports.DEFAULT_SESSION_CONFIG, {
    maxConcurrentSessions: 3,
    sessionTimeout: 15 * 60 * 1000, // 15 minutes
    requireDeviceVerification: true,
    enableLocationTracking: true,
    tokenRotationInterval: 5 * 60 * 1000, // 5 minutes
    cleanupInterval: 5 * 60 * 1000, // 5 minutes
    redis: {
      enabled: true,
      keyPrefix: "neonpro:enterprise:session:",
      ttl: 15 * 60, // 15 minutes
    },
  }),
};
/**
 * Get preset configuration by clinic size
 */
function getClinicPreset(size) {
  return exports.CLINIC_PRESETS[size] || exports.DEFAULT_SESSION_CONFIG;
}
