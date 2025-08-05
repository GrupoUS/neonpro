"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionConfig = void 0;
/**
 * Session Management Configuration
 * Central configuration for all session-related settings
 */
var SessionConfig = /** @class */ (function () {
  function SessionConfig() {}
  /**
   * Get policy by user role
   */
  SessionConfig.getPolicyByRole = function (role) {
    switch (role.toLowerCase()) {
      case "admin":
      case "administrator":
        return this.DEFAULT_POLICIES.admin;
      case "premium":
      case "pro":
        return this.DEFAULT_POLICIES.premium;
      case "high_security":
      case "secure":
        return this.DEFAULT_POLICIES.high_security;
      default:
        return this.DEFAULT_POLICIES.standard;
    }
  };
  /**
   * Get environment-specific configuration
   */
  SessionConfig.getEnvironmentConfig = function () {
    var isDevelopment = process.env.NODE_ENV === "development";
    var isProduction = process.env.NODE_ENV === "production";
    return __assign(
      __assign(
        {},
        isDevelopment && {
          COOKIE_SECURE: false,
          LOG_LEVEL: "debug",
          ENABLE_DEBUG_ENDPOINTS: true,
          BYPASS_RATE_LIMITS: true,
        },
      ),
      isProduction && {
        COOKIE_SECURE: true,
        LOG_LEVEL: "warn",
        ENABLE_DEBUG_ENDPOINTS: false,
        BYPASS_RATE_LIMITS: false,
        ENABLE_SECURITY_HEADERS: true,
        ENABLE_CSRF_PROTECTION: true,
      },
    );
  };
  /**
   * Validate configuration
   */
  SessionConfig.validateConfig = function () {
    try {
      // Check required environment variables
      var requiredEnvVars = [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
      ];
      for (var _i = 0, requiredEnvVars_1 = requiredEnvVars; _i < requiredEnvVars_1.length; _i++) {
        var envVar = requiredEnvVars_1[_i];
        if (!process.env[envVar]) {
          console.error("Missing required environment variable: ".concat(envVar));
          return false;
        }
      }
      // Validate policy configurations
      for (var _a = 0, _b = Object.entries(this.DEFAULT_POLICIES); _a < _b.length; _a++) {
        var _c = _b[_a],
          name_1 = _c[0],
          policy = _c[1];
        if (!this.validatePolicy(policy)) {
          console.error("Invalid policy configuration: ".concat(name_1));
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Configuration validation failed:", error);
      return false;
    }
  };
  /**
   * Validate individual policy
   */
  SessionConfig.validatePolicy = function (policy) {
    return (
      policy.max_session_duration > 0 &&
      policy.idle_timeout > 0 &&
      policy.max_concurrent_sessions > 0 &&
      policy.session_refresh_threshold > 0 &&
      policy.security_check_interval > 0
    );
  };
  /**
   * Get configuration for specific environment
   */
  SessionConfig.getConfig = function (environment) {
    var env = environment || process.env.NODE_ENV || "development";
    return __assign(
      __assign(
        __assign(
          __assign(
            __assign(
              __assign(
                __assign(
                  __assign(
                    __assign(
                      __assign(
                        __assign(__assign({}, this.DEFAULT_POLICIES), this.SECURITY_THRESHOLDS),
                        this.CLEANUP_INTERVALS,
                      ),
                      this.COOKIE_CONFIG,
                    ),
                    this.RATE_LIMITS,
                  ),
                  this.ENCRYPTION,
                ),
                this.DATABASE,
              ),
              this.MONITORING,
            ),
            this.FEATURES,
          ),
          this.API_ENDPOINTS,
        ),
        this.getEnvironmentConfig(),
      ),
      { ENVIRONMENT: env },
    );
  };
  // Default session policies
  SessionConfig.DEFAULT_POLICIES = {
    // Standard user policy
    standard: {
      id: "standard",
      name: "Standard User Policy",
      max_session_duration: 8 * 60, // 8 hours in minutes
      idle_timeout: 30, // 30 minutes
      max_concurrent_sessions: 3,
      require_device_trust: false,
      allow_concurrent_ips: true,
      session_refresh_threshold: 60, // 1 hour
      security_check_interval: 15, // 15 minutes
      auto_logout_on_suspicious: false,
      require_2fa_for_sensitive: false,
      log_all_activities: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    // Premium user policy
    premium: {
      id: "premium",
      name: "Premium User Policy",
      max_session_duration: 12 * 60, // 12 hours
      idle_timeout: 60, // 1 hour
      max_concurrent_sessions: 5,
      require_device_trust: false,
      allow_concurrent_ips: true,
      session_refresh_threshold: 90, // 1.5 hours
      security_check_interval: 20, // 20 minutes
      auto_logout_on_suspicious: false,
      require_2fa_for_sensitive: true,
      log_all_activities: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    // Admin user policy
    admin: {
      id: "admin",
      name: "Administrator Policy",
      max_session_duration: 4 * 60, // 4 hours
      idle_timeout: 15, // 15 minutes
      max_concurrent_sessions: 2,
      require_device_trust: true,
      allow_concurrent_ips: false,
      session_refresh_threshold: 30, // 30 minutes
      security_check_interval: 5, // 5 minutes
      auto_logout_on_suspicious: true,
      require_2fa_for_sensitive: true,
      log_all_activities: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    // High security policy
    high_security: {
      id: "high_security",
      name: "High Security Policy",
      max_session_duration: 2 * 60, // 2 hours
      idle_timeout: 10, // 10 minutes
      max_concurrent_sessions: 1,
      require_device_trust: true,
      allow_concurrent_ips: false,
      session_refresh_threshold: 15, // 15 minutes
      security_check_interval: 2, // 2 minutes
      auto_logout_on_suspicious: true,
      require_2fa_for_sensitive: true,
      log_all_activities: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
  // Security thresholds
  SessionConfig.SECURITY_THRESHOLDS = {
    // Failed login attempts before account lock
    MAX_FAILED_ATTEMPTS: 5,
    // Time window for failed attempts (minutes)
    FAILED_ATTEMPTS_WINDOW: 15,
    // Account lock duration (minutes)
    ACCOUNT_LOCK_DURATION: 30,
    // Maximum requests per minute from single IP
    MAX_REQUESTS_PER_MINUTE: 100,
    // Suspicious activity score threshold
    SUSPICIOUS_ACTIVITY_THRESHOLD: 70,
    // Minimum security score for session continuation
    MIN_SECURITY_SCORE: 50,
    // Maximum session extensions per day
    MAX_SESSION_EXTENSIONS: 3,
    // Geographic location change threshold (km)
    GEO_CHANGE_THRESHOLD: 100,
  };
  // Session cleanup intervals
  SessionConfig.CLEANUP_INTERVALS = {
    // Clean expired sessions every X minutes
    EXPIRED_SESSIONS: 30,
    // Clean old security events every X hours
    OLD_SECURITY_EVENTS: 24,
    // Clean inactive devices every X days
    INACTIVE_DEVICES: 7,
    // Clean old audit logs every X days
    OLD_AUDIT_LOGS: 90,
  };
  // Cookie configuration
  SessionConfig.COOKIE_CONFIG = {
    SESSION_COOKIE_NAME: "neonpro-session",
    DEVICE_COOKIE_NAME: "neonpro-device",
    CSRF_COOKIE_NAME: "neonpro-csrf",
    // Cookie options
    HTTP_ONLY: true,
    SECURE: process.env.NODE_ENV === "production",
    SAME_SITE: "lax",
    // Cookie expiration (days)
    SESSION_EXPIRY: 7,
    DEVICE_EXPIRY: 30,
    CSRF_EXPIRY: 1,
  };
  // Rate limiting configuration
  SessionConfig.RATE_LIMITS = {
    // Login attempts
    LOGIN: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: "Too many login attempts, please try again later",
    },
    // Session validation
    SESSION_VALIDATION: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 60, // 60 validations per minute
      message: "Too many session validation requests",
    },
    // Password reset
    PASSWORD_RESET: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 attempts per hour
      message: "Too many password reset attempts",
    },
    // Device registration
    DEVICE_REGISTRATION: {
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 5, // 5 devices per 10 minutes
      message: "Too many device registration attempts",
    },
  };
  // Encryption configuration
  SessionConfig.ENCRYPTION = {
    // Algorithm for session tokens
    ALGORITHM: "AES-GCM",
    // Key length in bytes
    KEY_LENGTH: 32,
    // IV length in bytes
    IV_LENGTH: 12,
    // Token length in bytes
    TOKEN_LENGTH: 32,
  };
  // Database configuration
  SessionConfig.DATABASE = {
    // Connection pool settings
    POOL_MIN: 2,
    POOL_MAX: 10,
    // Query timeout (ms)
    QUERY_TIMEOUT: 30000,
    // Connection timeout (ms)
    CONNECTION_TIMEOUT: 10000,
    // Retry attempts
    RETRY_ATTEMPTS: 3,
  };
  // Monitoring and logging
  SessionConfig.MONITORING = {
    // Enable performance monitoring
    ENABLE_PERFORMANCE_MONITORING: true,
    // Enable security event logging
    ENABLE_SECURITY_LOGGING: true,
    // Enable audit trail
    ENABLE_AUDIT_TRAIL: true,
    // Log levels
    LOG_LEVEL: process.env.NODE_ENV === "production" ? "warn" : "debug",
    // Metrics collection interval (ms)
    METRICS_INTERVAL: 60000, // 1 minute
    // Health check interval (ms)
    HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  };
  // Feature flags
  SessionConfig.FEATURES = {
    // Enable device fingerprinting
    DEVICE_FINGERPRINTING: true,
    // Enable geographic tracking
    GEOGRAPHIC_TRACKING: false,
    // Enable behavioral analysis
    BEHAVIORAL_ANALYSIS: true,
    // Enable session analytics
    SESSION_ANALYTICS: true,
    // Enable real-time monitoring
    REAL_TIME_MONITORING: true,
    // Enable automatic threat response
    AUTO_THREAT_RESPONSE: false,
  };
  // API endpoints
  SessionConfig.API_ENDPOINTS = {
    SESSION_VALIDATE: "/api/auth/session/validate",
    SESSION_REFRESH: "/api/auth/session/refresh",
    SESSION_TERMINATE: "/api/auth/session/terminate",
    SESSION_EXTEND: "/api/auth/session/extend",
    DEVICE_REGISTER: "/api/auth/session/devices",
    SECURITY_EVENTS: "/api/auth/session/security",
    SESSION_ANALYTICS: "/api/auth/session/analytics",
  };
  return SessionConfig;
})();
exports.SessionConfig = SessionConfig;
// Export default configuration
exports.default = SessionConfig.getConfig();
