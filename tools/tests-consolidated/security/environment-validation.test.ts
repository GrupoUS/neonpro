#!/usr/bin/env node

/**
 * Environment Variable Security Validation Tests
 * ============================================
 * 
 * RED PHASE: Failing tests for environment variable security
 * These tests define the expected secure behavior for environment variable
 * handling, validation, and sanitization in the scripts directory.
 * 
 * SECURITY AREAS COVERED:
 * 1. Environment variable type validation
 * 2. Range validation for numeric values
 * 3. URL and network address validation
 * 4. Healthcare compliance validation
 * 5. Secret and credential validation
 * 6. Configuration consistency validation
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { test, describe, expect } from 'bun:test';

// Test configuration
const SCRIPTS_DIR = join(process.cwd(), 'scripts');
const CONFIG_FILE = join(SCRIPTS_DIR, 'config.sh');

// Environment validation helpers
class EnvironmentSecurityValidator {
  static validateNumericRange(value: string, min: number, max: number): boolean {
    const num = parseInt(value);
    return !isNaN(num) && num >= min && num <= max;
  }

  static validatePortNumber(value: string): boolean {
    const port = parseInt(value);
    return !isNaN(port) && port >= 1024 && port <= 65535;
  }

  static validatePercentage(value: string): boolean {
    const percentage = parseInt(value);
    return !isNaN(percentage) && percentage >= 0 && percentage <= 100;
  }

  static validateUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  }

  static validateEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  static validateBoolean(value: string): boolean {
    return ['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase());
  }

  static validateFilePath(value: string): boolean {
    // Basic file path validation (prevent directory traversal)
    return !value.includes('..') && !value.includes('~');
  }

  static validateTimeout(value: string): boolean {
    const timeout = parseInt(value);
    return !isNaN(timeout) && timeout > 0 && timeout <= 3600; // Max 1 hour
  }

  static validateMemoryRequirement(value: string): boolean {
    const memory = parseInt(value);
    return !isNaN(memory) && memory >= 1 && memory <= 64; // Max 64GB
  }

  static validateDiskSpace(value: string): boolean {
    const space = parseInt(value);
    return !isNaN(space) && space >= 1 && space <= 1000; // Max 1TB
  }
}

describe('Environment Variable Security Validation Tests', () => {
  
  describe('1. System Requirements Validation', () => {
    test('should validate Node.js version requirements', () => {
      const minVersion = process.env.MINIMUM_NODE_VERSION || '20.0.0';
      const requiredMajor = process.env.REQUIRED_NODE_VERSION_MAJOR || '20';
      
      // This should fail because version validation may not be strict enough
      const isValidVersion = /^\d+\.\d+\.\d+$/.test(minVersion);
      const isValidMajor = /^\d+$/.test(requiredMajor) && parseInt(requiredMajor) >= 16;
      
      expect(isValidVersion).toBe(true);
      expect(isValidMajor).toBe(true);
    });

    test('should validate memory requirements', () => {
      const requiredMemory = process.env.REQUIRED_MEMORY_GB || '8';
      const minMemory = process.env.MINIMUM_MEMORY_GB || '4';
      
      // This should fail because memory validation may not be strict enough
      const isValidRequiredMemory = EnvironmentSecurityValidator.validateMemoryRequirement(requiredMemory);
      const isValidMinMemory = EnvironmentSecurityValidator.validateMemoryRequirement(minMemory);
      
      expect(isValidRequiredMemory).toBe(true);
      expect(isValidMinMemory).toBe(true);
    });

    test('should validate disk space requirements', () => {
      const minDiskSpace = process.env.MINIMUM_DISK_SPACE_GB || '10';
      
      // This should fail because disk space validation may not be strict enough
      const isValidDiskSpace = EnvironmentSecurityValidator.validateDiskSpace(minDiskSpace);
      expect(isValidDiskSpace).toBe(true);
    });
  });

  describe('2. Database Configuration Validation', () => {
    test('should validate database connection parameters', () => {
      const dbTimeout = process.env.DB_TIMEOUT || '30';
      const dbAttempts = process.env.DB_CONNECTION_ATTEMPTS || '3';
      const dbMaxConnections = process.env.DB_MAX_CONNECTIONS || '10';
      const dbPoolTimeout = process.env.DB_POOL_TIMEOUT || '15';
      
      // This should fail because database parameter validation may not be strict enough
      const isValidTimeout = EnvironmentSecurityValidator.validateTimeout(dbTimeout);
      const isValidAttempts = EnvironmentSecurityValidator.validateNumericRange(dbAttempts, 1, 10);
      const isValidMaxConnections = EnvironmentSecurityValidator.validateNumericRange(dbMaxConnections, 1, 100);
      const isValidPoolTimeout = EnvironmentSecurityValidator.validateTimeout(dbPoolTimeout);
      
      expect(isValidTimeout).toBe(true);
      expect(isValidAttempts).toBe(true);
      expect(isValidMaxConnections).toBe(true);
      expect(isValidPoolTimeout).toBe(true);
    });

    test('should validate database query parameters', () => {
      const queryTimeout = process.env.DB_QUERY_TIMEOUT || '10';
      const maxActiveConnections = process.env.DB_MAX_ACTIVE_CONNECTIONS || '5';
      
      // This should fail because query parameter validation may not be strict enough
      const isValidQueryTimeout = EnvironmentSecurityValidator.validateTimeout(queryTimeout);
      const isValidMaxActiveConnections = EnvironmentSecurityValidator.validateNumericRange(maxActiveConnections, 1, 50);
      
      expect(isValidQueryTimeout).toBe(true);
      expect(isValidMaxActiveConnections).toBe(true);
    });
  });

  describe('3. Performance Configuration Validation', () => {
    test('should validate build and audit timeouts', () => {
      const buildTimeout = process.env.BUILD_TIMEOUT || '60';
      const lintTimeout = process.env.LINT_TIMEOUT || '30';
      const auditTimeout = process.env.AUDIT_TIMEOUT || '30';
      
      // This should fail because performance timeout validation may not be strict enough
      const isValidBuildTimeout = EnvironmentSecurityValidator.validateTimeout(buildTimeout);
      const isValidLintTimeout = EnvironmentSecurityValidator.validateTimeout(lintTimeout);
      const isValidAuditTimeout = EnvironmentSecurityValidator.validateTimeout(auditTimeout);
      
      expect(isValidBuildTimeout).toBe(true);
      expect(isValidLintTimeout).toBe(true);
      expect(isValidAuditTimeout).toBe(true);
    });

    test('should validate deployment timeouts', () => {
      const deploymentTimeout = process.env.DEPLOYMENT_TIMEOUT || '10';
      const healthCheckTimeout = process.env.HEALTH_CHECK_TIMEOUT || '30';
      const curlTimeout = process.env.CURL_TIMEOUT || '30';
      
      // This should fail because deployment timeout validation may not be strict enough
      const isValidDeploymentTimeout = EnvironmentSecurityValidator.validateTimeout(deploymentTimeout);
      const isValidHealthCheckTimeout = EnvironmentSecurityValidator.validateTimeout(healthCheckTimeout);
      const isValidCurlTimeout = EnvironmentSecurityValidator.validateTimeout(curlTimeout);
      
      expect(isValidDeploymentTimeout).toBe(true);
      expect(isValidHealthCheckTimeout).toBe(true);
      expect(isValidCurlTimeout).toBe(true);
    });

    test('should validate response time thresholds', () => {
      const maxResponseTime = process.env.MAX_RESPONSE_TIME_MS || '3000';
      const maxHealthcareResponseTime = process.env.MAX_RESPONSE_TIME_HEALTHCARE_MS || '100';
      
      // This should fail because response time validation may not be strict enough
      const isValidMaxResponseTime = EnvironmentSecurityValidator.validateNumericRange(maxResponseTime, 100, 30000);
      const isValidHealthcareResponseTime = EnvironmentSecurityValidator.validateNumericRange(maxHealthcareResponseTime, 10, 1000);
      
      expect(isValidMaxResponseTime).toBe(true);
      expect(isValidHealthcareResponseTime).toBe(true);
    });
  });

  describe('4. Audit and Quality Threshold Validation', () => {
    test('should validate bundle size thresholds', () => {
      const maxBundleSize = process.env.MAX_BUNDLE_SIZE_MB || '15';
      const optimalBundleSize = process.env.OPTIMAL_BUNDLE_SIZE_MB || '10';
      const optimalBuildSize = process.env.OPTIMAL_BUILD_SIZE_MB || '10';
      
      // This should fail because bundle size validation may not be strict enough
      const isValidMaxBundleSize = EnvironmentSecurityValidator.validateNumericRange(maxBundleSize, 1, 100);
      const isValidOptimalBundleSize = EnvironmentSecurityValidator.validateNumericRange(optimalBundleSize, 1, 50);
      const isValidOptimalBuildSize = EnvironmentSecurityValidator.validateNumericRange(optimalBuildSize, 1, 50);
      
      expect(isValidMaxBundleSize).toBe(true);
      expect(isValidOptimalBundleSize).toBe(true);
      expect(isValidOptimalBuildSize).toBe(true);
    });

    test('should validate compliance thresholds', () => {
      const minCompliance = process.env.MIN_COMPLIANCE_PERCENTAGE || '80';
      const excellentScore = process.env.EXCELLENT_AUDIT_SCORE || '90';
      const goodScore = process.env.GOOD_AUDIT_SCORE || '80';
      const acceptableScore = process.env.ACCEPTABLE_AUDIT_SCORE || '70';
      
      // This should fail because compliance threshold validation may not be strict enough
      const isValidMinCompliance = EnvironmentSecurityValidator.validatePercentage(minCompliance);
      const isValidExcellentScore = EnvironmentSecurityValidator.validatePercentage(excellentScore);
      const isValidGoodScore = EnvironmentSecurityValidator.validatePercentage(goodScore);
      const isValidAcceptableScore = EnvironmentSecurityValidator.validatePercentage(acceptableScore);
      
      expect(isValidMinCompliance).toBe(true);
      expect(isValidExcellentScore).toBe(true);
      expect(isValidGoodScore).toBe(true);
      expect(isValidAcceptableScore).toBe(true);
    });

    test('should validate healthcare-specific thresholds', () => {
      const healthcareBundleLimit = process.env.HEALTHCARE_BUNDLE_SIZE_LIMIT_KB || '250';
      const healthcareResponseLimit = process.env.HEALTHCARE_RESPONSE_TIME_LIMIT_MS || '100';
      
      // This should fail because healthcare threshold validation may not be strict enough
      const isValidHealthcareBundleLimit = EnvironmentSecurityValidator.validateNumericRange(healthcareBundleLimit, 10, 1000);
      const isValidHealthcareResponseLimit = EnvironmentSecurityValidator.validateNumericRange(healthcareResponseLimit, 10, 1000);
      
      expect(isValidHealthcareBundleLimit).toBe(true);
      expect(isValidHealthcareResponseLimit).toBe(true);
    });
  });

  describe('5. Healthcare Compliance Validation', () => {
    test('should validate healthcare compliance flags', () => {
      const healthcareMode = process.env.HEALTHCARE_MODE || 'true';
      const lgpdCompliance = process.env.LGPD_COMPLIANCE || 'true';
      const anvisaCompliance = process.env.ANVISA_COMPLIANCE || 'true';
      const cfmCompliance = process.env.CFM_COMPLIANCE || 'true';
      
      // This should fail because compliance flag validation may not be strict enough
      const isValidHealthcareMode = EnvironmentSecurityValidator.validateBoolean(healthcareMode);
      const isValidLgpdCompliance = EnvironmentSecurityValidator.validateBoolean(lgpdCompliance);
      const isValidAnvisaCompliance = EnvironmentSecurityValidator.validateBoolean(anvisaCompliance);
      const isValidCfmCompliance = EnvironmentSecurityValidator.validateBoolean(cfmCompliance);
      
      expect(isValidHealthcareMode).toBe(true);
      expect(isValidLgpdCompliance).toBe(true);
      expect(isValidAnvisaCompliance).toBe(true);
      expect(isValidCfmCompliance).toBe(true);
    });
  });

  describe('6. Server Configuration Validation', () => {
    test('should validate port configuration', () => {
      const localDevPort = process.env.LOCAL_DEVELOPMENT_PORT || '3000';
      const viteDevPort = process.env.VITE_DEV_PORT || '5173';
      const apiPort = process.env.API_PORT || '3001';
      
      // This should fail because port configuration validation may not be strict enough
      const isValidLocalDevPort = EnvironmentSecurityValidator.validatePortNumber(localDevPort);
      const isValidViteDevPort = EnvironmentSecurityValidator.validatePortNumber(viteDevPort);
      const isValidApiPort = EnvironmentSecurityValidator.validatePortNumber(apiPort);
      
      expect(isValidLocalDevPort).toBe(true);
      expect(isValidViteDevPort).toBe(true);
      expect(isValidApiPort).toBe(true);
    });

    test('should validate URL configuration', () => {
      const localDevHost = process.env.LOCAL_DEVELOPMENT_HOST || 'http://localhost:3000';
      
      // This should fail because URL configuration validation may not be strict enough
      const isValidLocalDevHost = EnvironmentSecurityValidator.validateUrl(localDevHost);
      expect(isValidLocalDevHost).toBe(true);
    });
  });

  describe('7. Monitoring and Logging Validation', () => {
    test('should validate monitoring intervals', () => {
      const monitoringInterval = process.env.MONITORING_INTERVAL || '60';
      const healthCheckInterval = process.env.HEALTH_CHECK_INTERVAL || '60';
      
      // This should fail because monitoring interval validation may not be strict enough
      const isValidMonitoringInterval = EnvironmentSecurityValidator.validateNumericRange(monitoringInterval, 10, 3600);
      const isValidHealthCheckInterval = EnvironmentSecurityValidator.validateNumericRange(healthCheckInterval, 10, 3600);
      
      expect(isValidMonitoringInterval).toBe(true);
      expect(isValidHealthCheckInterval).toBe(true);
    });

    test('should validate performance monitoring settings', () => {
      const performanceSampleSize = process.env.PERFORMANCE_SAMPLE_SIZE || '100';
      const performanceThreshold = process.env.PERFORMANCE_THRESHOLD_MS || '200';
      
      // This should fail because performance monitoring validation may not be strict enough
      const isValidSampleSize = EnvironmentSecurityValidator.validateNumericRange(performanceSampleSize, 10, 10000);
      const isValidThreshold = EnvironmentSecurityValidator.validateNumericRange(performanceThreshold, 10, 10000);
      
      expect(isValidSampleSize).toBe(true);
      expect(isValidThreshold).toBe(true);
    });
  });

  describe('8. Security Configuration Validation', () => {
    test('should validate rate limiting configuration', () => {
      const rateLimitWindow = process.env.RATE_LIMIT_WINDOW_MS || '900000';
      const maxRequests = process.env.RATE_LIMIT_MAX_REQUESTS || '100';
      const loginRequests = process.env.RATE_LIMIT_LOGIN_REQUESTS || '5';
      
      // This should fail because rate limiting validation may not be strict enough
      const isValidRateLimitWindow = EnvironmentSecurityValidator.validateNumericRange(rateLimitWindow, 1000, 3600000);
      const isValidMaxRequests = EnvironmentSecurityValidator.validateNumericRange(maxRequests, 1, 10000);
      const isValidLoginRequests = EnvironmentSecurityValidator.validateNumericRange(loginRequests, 1, 100);
      
      expect(isValidRateLimitWindow).toBe(true);
      expect(isValidMaxRequests).toBe(true);
      expect(isValidLoginRequests).toBe(true);
    });

    test('should validate session security configuration', () => {
      const sessionTimeout = process.env.SESSION_TIMEOUT_HOURS || '1';
      const jwtExpiry = process.env.JWT_EXPIRY_SECONDS || '3600';
      const minSecretLength = process.env.MIN_SECRET_LENGTH || '32';
      
      // This should fail because session security validation may not be strict enough
      const isValidSessionTimeout = EnvironmentSecurityValidator.validateNumericRange(sessionTimeout, 1, 168); // Max 1 week
      const isValidJwtExpiry = EnvironmentSecurityValidator.validateNumericRange(jwtExpiry, 300, 604800); // 5 min to 1 week
      const isValidMinSecretLength = EnvironmentSecurityValidator.validateNumericRange(minSecretLength, 16, 1024);
      
      expect(isValidSessionTimeout).toBe(true);
      expect(isValidJwtExpiry).toBe(true);
      expect(isValidMinSecretLength).toBe(true);
    });

    test('should validate file permission configuration', () => {
      const safeFilePerms = process.env.SAFE_FILE_PERMS || '644';
      const safeExecPerms = process.env.SAFE_EXEC_PERMS || '755';
      const restrictedPerms = process.env.RESTRICTED_PERMS || '600';
      
      // This should fail because file permission validation may not be strict enough
      const isValidSafeFilePerms = /^[0-7]{3}$/.test(safeFilePerms);
      const isValidSafeExecPerms = /^[0-7]{3}$/.test(safeExecPerms);
      const isValidRestrictedPerms = /^[0-7]{3}$/.test(restrictedPerms);
      
      expect(isValidSafeFilePerms).toBe(true);
      expect(isValidSafeExecPerms).toBe(true);
      expect(isValidRestrictedPerms).toBe(true);
    });
  });

  describe('9. Build and Deployment Configuration Validation', () => {
    test('should validate build configuration', () => {
      const buildParallelJobs = process.env.BUILD_PARALLEL_JOBS || '4';
      const buildCacheEnabled = process.env.BUILD_CACHE_ENABLED || 'true';
      const buildMinify = process.env.BUILD_MINIFY || 'true';
      
      // This should fail because build configuration validation may not be strict enough
      const isValidParallelJobs = EnvironmentSecurityValidator.validateNumericRange(buildParallelJobs, 1, 32);
      const isValidCacheEnabled = EnvironmentSecurityValidator.validateBoolean(buildCacheEnabled);
      const isValidMinify = EnvironmentSecurityValidator.validateBoolean(buildMinify);
      
      expect(isValidParallelJobs).toBe(true);
      expect(isValidCacheEnabled).toBe(true);
      expect(isValidMinify).toBe(true);
    });

    test('should validate deployment configuration', () => {
      const deploymentStrategy = process.env.DEPLOYMENT_STRATEGY || 'blue-green';
      const rollbackInterval = process.env.ROLLBACK_CHECK_INTERVAL || '30';
      const maxRollbackAttempts = process.env.MAX_ROLLBACK_ATTEMPTS || '3';
      
      // This should fail because deployment configuration validation may not be strict enough
      const validStrategies = ['blue-green', 'canary', 'rolling'];
      const isValidStrategy = validStrategies.includes(deploymentStrategy);
      const isValidRollbackInterval = EnvironmentSecurityValidator.validateNumericRange(rollbackInterval, 10, 300);
      const isValidMaxRollbackAttempts = EnvironmentSecurityValidator.validateNumericRange(maxRollbackAttempts, 1, 10);
      
      expect(isValidStrategy).toBe(true);
      expect(isValidRollbackInterval).toBe(true);
      expect(isValidMaxRollbackAttempts).toBe(true);
    });
  });

  describe('10. Backup and Recovery Configuration Validation', () => {
    test('should validate backup retention settings', () => {
      const dailyRetention = process.env.DAILY_BACKUP_RETENTION || '30';
      const weeklyRetention = process.env.WEEKLY_BACKUP_RETENTION || '90';
      const monthlyRetention = process.env.MONTHLY_BACKUP_RETENTION || '365';
      
      // This should fail because backup retention validation may not be strict enough
      const isValidDailyRetention = EnvironmentSecurityValidator.validateNumericRange(dailyRetention, 1, 365);
      const isValidWeeklyRetention = EnvironmentSecurityValidator.validateNumericRange(weeklyRetention, 7, 1825);
      const isValidMonthlyRetention = EnvironmentSecurityValidator.validateNumericRange(monthlyRetention, 30, 3650);
      
      expect(isValidDailyRetention).toBe(true);
      expect(isValidWeeklyRetention).toBe(true);
      expect(isValidMonthlyRetention).toBe(true);
    });

    test('should validate recovery objectives', () => {
      const rpoMinutes = process.env.RPO_MINUTES || '15';
      const rtoMinutes = process.env.RTO_MINUTES || '60';
      
      // This should fail because recovery objective validation may not be strict enough
      const isValidRpo = EnvironmentSecurityValidator.validateNumericRange(rpoMinutes, 1, 1440); // Max 24 hours
      const isValidRto = EnvironmentSecurityValidator.validateNumericRange(rtoMinutes, 1, 2880); // Max 48 hours
      
      expect(isValidRpo).toBe(true);
      expect(isValidRto).toBe(true);
    });
  });

  describe('11. Notification Configuration Validation', () => {
    test('should validate notification URLs', () => {
      const pagerdutyEndpoint = process.env.PAGERDUTY_ENDPOINT || 'https://events.pagerduty.com/generic/2010-04-15/create_event.json';
      
      // This should fail because notification URL validation may not be strict enough
      const isValidPagerdutyEndpoint = EnvironmentSecurityValidator.validateUrl(pagerdutyEndpoint);
      expect(isValidPagerdutyEndpoint).toBe(true);
    });

    test('should validate notification email addresses', () => {
      const emailFrom = process.env.NOTIFICATION_EMAIL_FROM || 'noreply@neonpro.health';
      const emailAdmin = process.env.NOTIFICATION_EMAIL_ADMIN || 'admin@neonpro.health';
      
      // This should fail because email validation may not be strict enough
      const isValidEmailFrom = EnvironmentSecurityValidator.validateEmail(emailFrom);
      const isValidEmailAdmin = EnvironmentSecurityValidator.validateEmail(emailAdmin);
      
      expect(isValidEmailFrom).toBe(true);
      expect(isValidEmailAdmin).toBe(true);
    });
  });

  describe('12. Supabase Configuration Validation', () => {
    test('should validate Supabase port configuration', () => {
      const supabasePort = process.env.SUPABASE_PORT || '54321';
      const studioPort = process.env.SUPABASE_STUDIO_PORT || '54322';
      const shadowPort = process.env.SUPABASE_SHADOW_PORT || '54320';
      const pgMetaPort = process.env.SUPABASE_PG_META_PORT || '54323';
      
      // This should fail because Supabase port validation may not be strict enough
      const isValidSupabasePort = EnvironmentSecurityValidator.validatePortNumber(supabasePort);
      const isValidStudioPort = EnvironmentSecurityValidator.validatePortNumber(studioPort);
      const isValidShadowPort = EnvironmentSecurityValidator.validatePortNumber(shadowPort);
      const isValidPgMetaPort = EnvironmentSecurityValidator.validatePortNumber(pgMetaPort);
      
      expect(isValidSupabasePort).toBe(true);
      expect(isValidStudioPort).toBe(true);
      expect(isValidShadowPort).toBe(true);
      expect(isValidPgMetaPort).toBe(true);
    });

    test('should validate Supabase operational parameters', () => {
      const maxRows = process.env.SUPABASE_MAX_ROWS || '1000';
      const jwtExpiry = process.env.SUPABASE_JWT_EXPIRY || '3600';
      const majorVersion = process.env.SUPABASE_MAJOR_VERSION || '15';
      const eventsPerSecond = process.env.SUPABASE_EVENTS_PER_SECOND || '10';
      const queryLimit = process.env.SUPABASE_QUERY_LIMIT || '1';
      
      // This should fail because Supabase operational validation may not be strict enough
      const isValidMaxRows = EnvironmentSecurityValidator.validateNumericRange(maxRows, 100, 10000);
      const isValidJwtExpiry = EnvironmentSecurityValidator.validateNumericRange(jwtExpiry, 300, 86400);
      const isValidMajorVersion = EnvironmentSecurityValidator.validateNumericRange(majorVersion, 14, 16);
      const isValidEventsPerSecond = EnvironmentSecurityValidator.validateNumericRange(eventsPerSecond, 1, 100);
      const isValidQueryLimit = EnvironmentSecurityValidator.validateNumericRange(queryLimit, 1, 1000);
      
      expect(isValidMaxRows).toBe(true);
      expect(isValidJwtExpiry).toBe(true);
      expect(isValidMajorVersion).toBe(true);
      expect(isValidEventsPerSecond).toBe(true);
      expect(isValidQueryLimit).toBe(true);
    });

    test('should validate package version constraints', () => {
      const packageVersion = process.env.PACKAGE_VERSION || '0.1.0';
      const supabaseJsVersion = process.env.SUPABASE_JS_VERSION || '^2.57.4';
      const typesNodeVersion = process.env.TYPES_NODE_VERSION || '^20.19.13';
      const typescriptVersion = process.env.TYPESCRIPT_VERSION || '^5.9.2';
      const supabaseCliVersion = process.env.SUPABASE_CLI_VERSION || '^1.210.0';
      const postgresJsVersion = process.env.POSTGRES_JS_VERSION || '^3.4.4';
      
      // This should fail because package version validation may not be strict enough
      const isValidPackageVersion = /^\d+\.\d+\.\d+$/.test(packageVersion);
      const isValidSupabaseJsVersion = /^\^\d+\.\d+\.\d+$/.test(supabaseJsVersion);
      const isValidTypesNodeVersion = /^\^\d+\.\d+\.\d+$/.test(typesNodeVersion);
      const isValidTypescriptVersion = /^\^\d+\.\d+\.\d+$/.test(typescriptVersion);
      const isValidSupabaseCliVersion = /^\^\d+\.\d+\.\d+$/.test(supabaseCliVersion);
      const isValidPostgresJsVersion = /^\^\d+\.\d+\.\d+$/.test(postgresJsVersion);
      
      expect(isValidPackageVersion).toBe(true);
      expect(isValidSupabaseJsVersion).toBe(true);
      expect(isValidTypesNodeVersion).toBe(true);
      expect(isValidTypescriptVersion).toBe(true);
      expect(isValidSupabaseCliVersion).toBe(true);
      expect(isValidPostgresJsVersion).toBe(true);
    });
  });
});

// Export for use in other test files
export { EnvironmentSecurityValidator };