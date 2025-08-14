// ============================================================================
// Session Management System - Configuration
// NeonPro - Session Management & Security
// ============================================================================

import { SessionConfig, SessionPolicy, SecurityConfig, DeviceConfig, AuditConfig } from './types';

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default session configuration
 */
export const DEFAULT_SESSION_CONFIG: SessionConfig = {
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
    keyPrefix: 'neonpro:session:',
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
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
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
export const DEFAULT_DEVICE_CONFIG: DeviceConfig = {
  // Registration
  autoRegisterDevices: true,
  requireDeviceVerification: false,
  deviceVerificationMethods: ['email', 'sms'],
  
  // Trust management
  initialTrustLevel: 50,
  maxTrustLevel: 100,
  trustDecayRate: 0.1, // Per day
  
  // Fingerprinting
  enableFingerprinting: true,
  fingerprintComponents: [
    'userAgent',
    'screen',
    'timezone',
    'language',
    'platform',
    'plugins',
    'canvas',
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
export const DEFAULT_AUDIT_CONFIG: AuditConfig = {
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
  excludeSensitiveFields: [
    'password',
    'token',
    'secret',
    'key',
  ],
  
  // Search
  enableFullTextSearch: true,
  searchLanguage: 'portuguese',
};

// ============================================================================
// ENVIRONMENT-SPECIFIC CONFIGURATIONS
// ============================================================================

/**
 * Development environment configuration
 */
export const DEVELOPMENT_CONFIG: Partial<SessionConfig> = {
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
export const PRODUCTION_CONFIG: Partial<SessionConfig> = {
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
export const HIGH_SECURITY_CONFIG: Partial<SessionConfig> = {
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
export const STANDARD_SESSION_POLICY: SessionPolicy = {
  id: 'standard',
  name: 'Standard Session Policy',
  description: 'Default policy for regular users',
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
  createdBy: 'system',
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Admin session policy for administrative users
 */
export const ADMIN_SESSION_POLICY: SessionPolicy = {
  id: 'admin',
  name: 'Admin Session Policy',
  description: 'Enhanced security policy for administrators',
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
  createdBy: 'system',
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Guest session policy for temporary access
 */
export const GUEST_SESSION_POLICY: SessionPolicy = {
  id: 'guest',
  name: 'Guest Session Policy',
  description: 'Limited policy for guest users',
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
  createdBy: 'system',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

/**
 * Merge configurations with precedence
 */
export function mergeConfigs(
  base: SessionConfig,
  override: Partial<SessionConfig>
): SessionConfig {
  return {
    ...base,
    ...override,
    redis: {
      ...base.redis,
      ...override.redis,
    },
    lgpd: {
      ...base.lgpd,
      ...override.lgpd,
    },
  };
}

/**
 * Get configuration for environment
 */
export function getEnvironmentConfig(env: string): SessionConfig {
  const baseConfig = DEFAULT_SESSION_CONFIG;
  
  switch (env.toLowerCase()) {
    case 'development':
    case 'dev':
      return mergeConfigs(baseConfig, DEVELOPMENT_CONFIG);
    
    case 'production':
    case 'prod':
      return mergeConfigs(baseConfig, PRODUCTION_CONFIG);
    
    case 'staging':
    case 'test':
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
export function validateConfig(config: SessionConfig): string[] {
  const errors: string[] = [];
  
  // Validate timeouts
  if (config.sessionTimeout <= 0) {
    errors.push('Session timeout must be positive');
  }
  
  if (config.renewalThreshold <= 0 || config.renewalThreshold >= 1) {
    errors.push('Renewal threshold must be between 0 and 1');
  }
  
  if (config.maxConcurrentSessions <= 0) {
    errors.push('Max concurrent sessions must be positive');
  }
  
  if (config.tokenRotationInterval <= 0) {
    errors.push('Token rotation interval must be positive');
  }
  
  if (config.refreshTokenExpiry <= config.sessionTimeout) {
    errors.push('Refresh token expiry must be greater than session timeout');
  }
  
  // Validate Redis config
  if (config.redis.enabled && !config.redis.keyPrefix) {
    errors.push('Redis key prefix is required when Redis is enabled');
  }
  
  // Validate LGPD config
  if (config.lgpd.enabled) {
    if (config.lgpd.dataRetentionDays <= 0) {
      errors.push('LGPD data retention days must be positive');
    }
    
    if (config.lgpd.anonymizeAfterDays <= config.lgpd.dataRetentionDays) {
      errors.push('LGPD anonymize after days must be greater than retention days');
    }
  }
  
  return errors;
}

/**
 * Get policy by role
 */
export function getPolicyByRole(role: string): SessionPolicy {
  switch (role.toLowerCase()) {
    case 'admin':
    case 'administrator':
    case 'owner':
      return ADMIN_SESSION_POLICY;
    
    case 'guest':
    case 'visitor':
    case 'temporary':
      return GUEST_SESSION_POLICY;
    
    default:
      return STANDARD_SESSION_POLICY;
  }
}

/**
 * Create custom policy
 */
export function createCustomPolicy(
  name: string,
  description: string,
  config: Partial<SessionConfig>,
  options: {
    priority?: number;
    clinicId?: string;
    userRole?: string;
    effectiveFrom?: Date;
    effectiveUntil?: Date;
  } = {}
): SessionPolicy {
  return {
    id: `custom_${Date.now()}`,
    name,
    description,
    config,
    clinicId: options.clinicId,
    userRole: options.userRole,
    isActive: true,
    priority: options.priority ?? 0,
    effectiveFrom: options.effectiveFrom ?? new Date(),
    effectiveUntil: options.effectiveUntil,
    createdBy: 'system',
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
export const CLINIC_PRESETS = {
  /**
   * Small clinic configuration (1-5 users)
   */
  small: mergeConfigs(DEFAULT_SESSION_CONFIG, {
    maxConcurrentSessions: 2,
    sessionTimeout: 45 * 60 * 1000, // 45 minutes
    requireDeviceVerification: false,
    cleanupInterval: 30 * 60 * 1000, // 30 minutes
  }),
  
  /**
   * Medium clinic configuration (6-20 users)
   */
  medium: mergeConfigs(DEFAULT_SESSION_CONFIG, {
    maxConcurrentSessions: 3,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    requireDeviceVerification: true,
    cleanupInterval: 15 * 60 * 1000, // 15 minutes
  }),
  
  /**
   * Large clinic configuration (21+ users)
   */
  large: mergeConfigs(DEFAULT_SESSION_CONFIG, {
    maxConcurrentSessions: 5,
    sessionTimeout: 20 * 60 * 1000, // 20 minutes
    requireDeviceVerification: true,
    tokenRotationInterval: 10 * 60 * 1000, // 10 minutes
    cleanupInterval: 10 * 60 * 1000, // 10 minutes
  }),
  
  /**
   * Enterprise configuration (50+ users)
   */
  enterprise: mergeConfigs(DEFAULT_SESSION_CONFIG, {
    maxConcurrentSessions: 3,
    sessionTimeout: 15 * 60 * 1000, // 15 minutes
    requireDeviceVerification: true,
    enableLocationTracking: true,
    tokenRotationInterval: 5 * 60 * 1000, // 5 minutes
    cleanupInterval: 5 * 60 * 1000, // 5 minutes
    redis: {
      enabled: true,
      keyPrefix: 'neonpro:enterprise:session:',
      ttl: 15 * 60, // 15 minutes
    },
  }),
};

/**
 * Get preset configuration by clinic size
 */
export function getClinicPreset(size: keyof typeof CLINIC_PRESETS): SessionConfig {
  return CLINIC_PRESETS[size] || DEFAULT_SESSION_CONFIG;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  DEFAULT_SESSION_CONFIG,
  DEFAULT_SECURITY_CONFIG,
  DEFAULT_DEVICE_CONFIG,
  DEFAULT_AUDIT_CONFIG,
  DEVELOPMENT_CONFIG,
  PRODUCTION_CONFIG,
  HIGH_SECURITY_CONFIG,
  STANDARD_SESSION_POLICY,
  ADMIN_SESSION_POLICY,
  GUEST_SESSION_POLICY,
};

export type {
  SessionConfig,
  SessionPolicy,
  SecurityConfig,
  DeviceConfig,
  AuditConfig,
};
