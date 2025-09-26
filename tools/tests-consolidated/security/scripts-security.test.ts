#!/usr/bin/env node

/**
 * Scripts Directory Security and Compliance Test Suite
 * =================================================
 * 
 * RED PHASE: Failing tests for scripts directory security vulnerabilities
 * These tests define the expected secure behavior for shell scripts, configuration,
 * environment variables, and database connections.
 * 
 * SECURITY AREAS COVERED:
 * 1. Shell script permissions validation
 * 2. Environment variable validation and sanitization
 * 3. Database connection security
 * 4. Input validation and parameter sanitization
 * 5. Configuration externalization
 * 6. File permission security
 * 7. Secret management
 * 
 * COMPLIANCE STANDARDS:
 * - LGPD compliance for healthcare platform
 * - OWASP security best practices
 * - Secure shell scripting guidelines
 * - Healthcare data protection standards
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, statSync, chmodSync } from 'fs';
import { join } from 'path';
import { test, describe, expect, beforeAll, afterAll } from 'bun:test';

// Test configuration
const SCRIPTS_DIR = join(process.cwd(), 'scripts');
const CONFIG_FILE = join(SCRIPTS_DIR, 'config.sh');
const SECURITY_TEST_TIMEOUT = 30000;

// Security validation helpers
class SecurityValidator {
  static validateFilePermissions(filePath: string, expectedPerms: string): boolean {
    try {
      const stats = statSync(filePath);
      const actualPerms = (stats.mode & parseInt('777', 8)).toString(8);
      return actualPerms === expectedPerms;
    } catch {
      return false;
    }
  }

  static validateEnvironmentVariableSanitization(varName: string, value: string): boolean {
    // Check for common security issues in environment variables
    const dangerousPatterns = [
      /[`;$&|<>{}()\\]/, // Shell metacharacters
      /\s+/, // Whitespace that could cause parsing issues
      /^-/ // Leading dash that could be interpreted as option
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(value));
  }

  static validateDatabaseConnectionString(connectionString: string): boolean {
    // Basic validation for database connection strings
    try {
      const url = new URL(connectionString);
      
      // Check for secure protocols
      if (!['postgresql:', 'postgres:'].includes(url.protocol)) {
        return false;
      }
      
      // Check for credentials in query parameters (insecure)
      if (url.searchParams.has('password') || url.searchParams.has('user')) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  static validateInputSanitization(input: string): boolean {
    // Check for command injection patterns
    const injectionPatterns = [
      /[;&|`$(){}<>]/, // Command injection
      /\/\.\./, // Path traversal
      /\.\.\//, // Directory traversal
      /['"]/, // Quote injection
    ];
    
    return !injectionPatterns.some(pattern => pattern.test(input));
  }
}

describe('Scripts Directory Security Tests', () => {
  
  describe('1. Shell Script Permissions Security', () => {
    test('should enforce safe file permissions on shell scripts', () => {
      // This test expects scripts to have safe permissions (755)
      const scripts = [
        'setup-supabase-migrations.sh',
        'deploy-unified.sh',
        'emergency-rollback.sh',
        'deployment-health-check.sh',
        'audit-unified.sh',
        'guard-test-placement.sh',
        'performance-benchmark.sh',
        'build-analysis.sh',
        'dev-setup.sh',
        'deployment-validation.sh',
        'setup-package-scripts.sh'
      ];

      scripts.forEach(script => {
        const scriptPath = join(SCRIPTS_DIR, script);
        if (existsSync(scriptPath)) {
          // This should fail initially because scripts may have incorrect permissions
          const hasSafePerms = SecurityValidator.validateFilePermissions(scriptPath, '755');
          expect(hasSafePerms).toBe(true);
        }
      });
    });

    test('should enforce safe permissions on configuration files', () => {
      // Configuration files should have restricted permissions (644)
      const configFiles = ['config.sh'];
      
      configFiles.forEach(configFile => {
        const configPath = join(SCRIPTS_DIR, configFile);
        if (existsSync(configPath)) {
          // This should fail initially because config files may be too permissive
          const hasSafePerms = SecurityValidator.validateFilePermissions(configPath, '644');
          expect(hasSafePerms).toBe(true);
        }
      });
    });

    test('should prevent world-writable permissions on scripts', () => {
      // No script should be world-writable
      const scripts = [
        'setup-supabase-migrations.sh',
        'deploy-unified.sh',
        'config.sh'
      ];

      scripts.forEach(script => {
        const scriptPath = join(SCRIPTS_DIR, script);
        if (existsSync(scriptPath)) {
          try {
            const stats = statSync(scriptPath);
            const perms = stats.mode & parseInt('777', 8);
            
            // Check if world-writable bit is set
            const isWorldWritable = (perms & parseInt('002', 8)) !== 0;
            expect(isWorldWritable).toBe(false);
          } catch {
            // File access error is also a security failure
            expect(false).toBe(true);
          }
        }
      });
    });
  });

  describe('2. Environment Variable Validation Security', () => {
    test('should validate database timeout environment variable', () => {
      // Test that DB_TIMEOUT is properly validated as a positive integer
      const dbTimeout = process.env.DB_TIMEOUT || '30';
      
      // This should fail because current validation may not be strict enough
      const isValidTimeout = /^\d+$/.test(dbTimeout) && parseInt(dbTimeout) > 0;
      expect(isValidTimeout).toBe(true);
    });

    test('should validate port number environment variables', () => {
      // Test that port numbers are within valid range
      const ports = [
        process.env.LOCAL_DEVELOPMENT_PORT,
        process.env.VITE_DEV_PORT,
        process.env.API_PORT,
        process.env.SUPABASE_PORT
      ].filter(Boolean);

      ports.forEach(port => {
        // This should fail because port validation may not be strict enough
        const isValidPort = /^\d+$/.test(port) && 
                          parseInt(port) >= 1024 && 
                          parseInt(port) <= 65535;
        expect(isValidPort).toBe(true);
      });
    });

    test('should sanitize environment variables to prevent injection', () => {
      // Test that environment variables are sanitized
      const sensitiveVars = [
        'DATABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_KEY'
      ];

      sensitiveVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
          // This should fail because environment variables may contain dangerous characters
          const isSanitized = SecurityValidator.validateEnvironmentVariableSanitization(varName, value);
          expect(isSanitized).toBe(true);
        }
      });
    });

    test('should validate percentage-based environment variables', () => {
      // Test that percentage values are valid
      const percentages = [
        process.env.MIN_COMPLIANCE_PERCENTAGE,
        process.env.EXCELLENT_AUDIT_SCORE,
        process.env.GOOD_AUDIT_SCORE
      ].filter(Boolean);

      percentages.forEach(percentage => {
        // This should fail because percentage validation may not be strict enough
        const isValidPercentage = /^\d+$/.test(percentage) && 
                                parseInt(percentage) >= 0 && 
                                parseInt(percentage) <= 100;
        expect(isValidPercentage).toBe(true);
      });
    });
  });

  describe('3. Database Connection Security', () => {
    test('should validate database connection string format', () => {
      // Test database connection string validation
      const dbUrl = process.env.DATABASE_URL || 'postgresql://invalid';
      
      // This should fail because database URL validation may not be strict enough
      const isValidConnection = SecurityValidator.validateDatabaseConnectionString(dbUrl);
      expect(isValidConnection).toBe(true);
    });

    test('should prevent database credentials in query parameters', () => {
      // Test that database credentials are not exposed in query parameters
      const dbUrl = process.env.DATABASE_URL || '';
      
      if (dbUrl) {
        try {
          const url = new URL(dbUrl);
          
          // This should fail because credentials may be exposed in query parameters
          const hasCredentialsInQuery = url.searchParams.has('password') || 
                                        url.searchParams.has('user');
          expect(hasCredentialsInQuery).toBe(false);
        } catch {
          // Invalid URL format is also a security failure
          expect(false).toBe(true);
        }
      }
    });

    test('should enforce secure database connection timeouts', () => {
      // Test that database timeouts are reasonable and secure
      const timeout = parseInt(process.env.DB_TIMEOUT || '30');
      
      // This should fail because timeout validation may not be strict enough
      const isSecureTimeout = timeout >= 1 && timeout <= 120; // 1 second to 2 minutes
      expect(isSecureTimeout).toBe(true);
    });

    test('should validate database connection pool settings', () => {
      // Test that connection pool settings are secure
      const maxConnections = parseInt(process.env.DB_MAX_CONNECTIONS || '10');
      const poolTimeout = parseInt(process.env.DB_POOL_TIMEOUT || '15');
      
      // This should fail because pool settings validation may not be strict enough
      const isValidMaxConnections = maxConnections >= 1 && maxConnections <= 100;
      const isValidPoolTimeout = poolTimeout >= 1 && poolTimeout <= 300;
      
      expect(isValidMaxConnections).toBe(true);
      expect(isValidPoolTimeout).toBe(true);
    });
  });

  describe('4. Input Validation and Sanitization Security', () => {
    test('should validate script input parameters', () => {
      // Test that script inputs are properly sanitized
      const testInputs = [
        'test-param',
        'test;param', // Contains dangerous semicolon
        'test|param', // Contains pipe
        'test`param'  // Contains backtick
      ];

      testInputs.forEach(input => {
        // This should fail because input sanitization may not be implemented
        const isSanitized = SecurityValidator.validateInputSanitization(input);
        expect(isSanitized).toBe(true);
      });
    });

    test('should prevent path traversal in file paths', () => {
      // Test that file paths are validated against path traversal
      const dangerousPaths = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        'config/../../../etc/shadow'
      ];

      dangerousPaths.forEach(path => {
        // This should fail because path traversal validation may not be implemented
        const isSanitized = SecurityValidator.validateInputSanitization(path);
        expect(isSanitized).toBe(true);
      });
    });

    test('should validate URL parameters in configuration', () => {
      // Test that URLs in configuration are properly validated
      const urls = [
        process.env.LOCAL_DEVELOPMENT_HOST,
        process.env.PRODUCTION_URL
      ].filter(Boolean);

      urls.forEach(url => {
        if (url) {
          // This should fail because URL validation may not be strict enough
          const isValidUrl = url.startsWith('http://') || url.startsWith('https://');
          expect(isValidUrl).toBe(true);
        }
      });
    });
  });

  describe('5. Configuration Externalization Security', () => {
    test('should not contain hardcoded sensitive data in scripts', () => {
      // Test that scripts don't contain hardcoded sensitive data
      const scripts = [
        'config.sh',
        'deploy-unified.sh',
        'setup-supabase-migrations.sh'
      ];

      scripts.forEach(script => {
        const scriptPath = join(SCRIPTS_DIR, script);
        if (existsSync(scriptPath)) {
          const content = readFileSync(scriptPath, 'utf8');
          
          // This should fail because scripts may contain hardcoded sensitive data
          const hardcodedSecrets = [
            /password\s*=\s*["'].*["']/i,
            /secret\s*=\s*["'].*["']/i,
            /api_key\s*=\s*["'].*["']/i,
            /DATABASE_URL\s*=\s*["'][^"']+["']/i
          ];
          
          hardcodedSecrets.forEach(pattern => {
            const hasHardcodedSecret = pattern.test(content);
            expect(hasHardcodedSecret).toBe(false);
          });
        }
      });
    });

    test('should validate configuration file structure', () => {
      // Test that configuration file follows secure structure
      if (existsSync(CONFIG_FILE)) {
        const content = readFileSync(CONFIG_FILE, 'utf8');
        
        // This should fail because config structure may not be secure
        const hasSecureShellOptions = content.includes('set -euo pipefail') || 
                                      content.includes('set -e');
        expect(hasSecureShellOptions).toBe(true);
      }
    });

    test('should validate environment-specific configuration loading', () => {
      // Test that environment-specific configuration is properly isolated
      if (existsSync(CONFIG_FILE)) {
        const content = readFileSync(CONFIG_FILE, 'utf8');
        
        // This should fail because environment configuration may not be properly isolated
        const hasEnvironmentLoading = content.includes('load_environment_config') ||
                                      content.includes('NODE_ENV');
        expect(hasEnvironmentLoading).toBe(true);
      }
    });
  });

  describe('6. Secret Management Security', () => {
    test('should validate secret length requirements', () => {
      // Test that secrets meet minimum length requirements
      const secretLength = parseInt(process.env.MIN_SECRET_LENGTH || '32');
      
      // This should fail because secret length validation may not be strict enough
      const isValidLength = secretLength >= 32;
      expect(isValidLength).toBe(true);
    });

    test('should validate JWT expiry settings', () => {
      // Test that JWT expiry is reasonable and secure
      const jwtExpiry = parseInt(process.env.JWT_EXPIRY_SECONDS || '3600');
      
      // This should fail because JWT expiry validation may not be strict enough
      const isValidExpiry = jwtExpiry >= 300 && jwtExpiry <= 86400; // 5 minutes to 24 hours
      expect(isValidExpiry).toBe(true);
    });

    test('should validate session timeout settings', () => {
      // Test that session timeout is reasonable and secure
      const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT_HOURS || '1');
      
      // This should fail because session timeout validation may not be strict enough
      const isValidTimeout = sessionTimeout >= 1 && sessionTimeout <= 24;
      expect(isValidTimeout).toBe(true);
    });
  });

  describe('7. Healthcare Compliance Security', () => {
    test('should enforce healthcare compliance flags', () => {
      // Test that healthcare compliance flags are properly set
      const complianceFlags = [
        'HEALTHCARE_MODE',
        'LGPD_COMPLIANCE',
        'ANVISA_COMPLIANCE',
        'CFM_COMPLIANCE'
      ];

      complianceFlags.forEach(flag => {
        const value = process.env[flag];
        if (value !== undefined) {
          // This should fail because compliance flags may not be properly validated
          const isValidFlag = value === 'true' || value === 'false';
          expect(isValidFlag).toBe(true);
        }
      });
    });

    test('should validate healthcare-specific configuration', () => {
      // Test healthcare-specific settings are secure
      const bundleLimit = parseInt(process.env.HEALTHCARE_BUNDLE_SIZE_LIMIT_KB || '250');
      const responseLimit = parseInt(process.env.HEALTHCARE_RESPONSE_TIME_LIMIT_MS || '100');
      
      // This should fail because healthcare limits may not be validated
      const isValidBundleLimit = bundleLimit > 0 && bundleLimit <= 1000;
      const isValidResponseLimit = responseLimit > 0 && responseLimit <= 1000;
      
      expect(isValidBundleLimit).toBe(true);
      expect(isValidResponseLimit).toBe(true);
    });
  });
});

// Export for use in other test files
export { SecurityValidator };