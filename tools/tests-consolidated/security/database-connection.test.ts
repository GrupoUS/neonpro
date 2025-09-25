#!/usr/bin/env node

/**
 * Database Connection Security Tests
 * ==================================
 * 
 * RED PHASE: Failing tests for database connection security
 * These tests define the expected secure behavior for database connections,
 * connection string handling, and database operations in the scripts directory.
 * 
 * SECURITY AREAS COVERED:
 * 1. Database connection string validation
 * 2. Connection parameter security
 * 3. Credential protection and management
 * 4. Connection pool security
 * 5. Database operation security
 * 6. Error handling security
 * 7. Connection timeout and retry security
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { test, describe, expect } from 'bun:test';

// Test configuration
const SCRIPTS_DIR = join(process.cwd(), 'scripts');
const CONFIG_FILE = join(SCRIPTS_DIR, 'config.sh');

// Database security validation helpers
class DatabaseSecurityValidator {
  static validateConnectionString(connectionString: string): boolean {
    try {
      const url = new URL(connectionString);
      
      // Validate protocol
      if (!['postgresql:', 'postgres:'].includes(url.protocol)) {
        return false;
      }
      
      // Check for secure host
      if (!url.hostname || url.hostname === 'localhost' || url.hostname.startsWith('127.0.0.1')) {
        // Local development is acceptable
        return true;
      }
      
      // For remote connections, require SSL
      if (url.searchParams.get('sslmode') !== 'require' && 
          url.searchParams.get('ssl') !== 'true') {
        return false;
      }
      
      // Ensure credentials are not in query parameters
      if (url.searchParams.has('password') || url.searchParams.has('user')) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  static validateConnectionParams(params: Record<string, string>): boolean {
    const requiredParams = ['host', 'port', 'database', 'user'];
    const sensitiveParams = ['password', 'sslkey', 'sslcert', 'sslrootcert'];
    
    // Check required parameters exist
    for (const param of requiredParams) {
      if (!params[param] || params[param].trim() === '') {
        return false;
      }
    }
    
    // Validate port range
    if (params.port) {
      const port = parseInt(params.port);
      if (isNaN(port) || port < 1 || port > 65535) {
        return false;
      }
    }
    
    // Check that sensitive parameters are not logged or exposed
    for (const param of sensitiveParams) {
      if (params[param] && params[param].length < 8) {
        return false; // Password too short
      }
    }
    
    return true;
  }

  static validatePoolSettings(settings: Record<string, string>): boolean {
    const maxConnections = parseInt(settings.maxConnections || '10');
    const minConnections = parseInt(settings.minConnections || '2');
    const idleTimeout = parseInt(settings.idleTimeout || '30');
    const connectionTimeout = parseInt(settings.connectionTimeout || '30');
    
    // Validate connection limits
    if (maxConnections < 1 || maxConnections > 100) {
      return false;
    }
    
    if (minConnections < 0 || minConnections > maxConnections) {
      return false;
    }
    
    // Validate timeouts
    if (idleTimeout < 1 || idleTimeout > 3600) {
      return false;
    }
    
    if (connectionTimeout < 1 || connectionTimeout > 300) {
      return false;
    }
    
    return true;
  }

  static validateSecuritySettings(settings: Record<string, string>): boolean {
    // Validate SSL settings
    const sslMode = settings.sslMode || 'prefer';
    const validSslModes = ['disable', 'allow', 'prefer', 'require', 'verify-ca', 'verify-full'];
    
    if (!validSslModes.includes(sslMode)) {
      return false;
    }
    
    // For production, require stronger SSL
    if (process.env.NODE_ENV === 'production' && 
        !['require', 'verify-ca', 'verify-full'].includes(sslMode)) {
      return false;
    }
    
    // Validate connection encryption
    const sslEnabled = settings.sslEnabled === 'true';
    if (process.env.NODE_ENV === 'production' && !sslEnabled) {
      return false;
    }
    
    return true;
  }

  static validateQuerySecurity(query: string): boolean {
    // Check for SQL injection patterns
    const dangerousPatterns = [
      /;\s*drop\s+/i,
      /;\s*delete\s+/i,
      /;\s*update\s+/i,
      /;\s*insert\s+/i,
      /;\s*create\s+/i,
      /;\s*alter\s+/i,
      /;\s*truncate\s+/i,
      /union\s+select/i,
      /or\s+1\s*=\s*1/i,
      /or\s+true/i,
      /--/,
      /\/\*/,
      /\*\//
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(query));
  }

  static validateConnectionRetry(settings: Record<string, string>): boolean {
    const maxAttempts = parseInt(settings.maxAttempts || '3');
    const retryDelay = parseInt(settings.retryDelay || '5');
    const connectionTimeout = parseInt(settings.connectionTimeout || '30');
    
    // Validate retry settings
    if (maxAttempts < 1 || maxAttempts > 10) {
      return false;
    }
    
    if (retryDelay < 1 || retryDelay > 60) {
      return false;
    }
    
    if (connectionTimeout < 5 || connectionTimeout > 120) {
      return false;
    }
    
    return true;
  }

  static validateDatabasePrivileges(privileges: string[]): boolean {
    // Check for excessive privileges
    const dangerousPrivileges = [
      'SUPERUSER',
      'CREATEDB',
      'CREATEROLE',
      'REPLICATION',
      'BYPASSRLS'
    ];
    
    // For application users, these privileges should not be granted
    const hasDangerousPrivilege = privileges.some(priv => 
      dangerousPrivileges.includes(priv.toUpperCase())
    );
    
    return !hasDangerousPrivilege;
  }
}

describe('Database Connection Security Tests', () => {
  
  describe('1. Database Connection String Security', () => {
    test('should validate secure database connection string format', () => {
      const dbUrl = process.env.DATABASE_URL || 'postgresql://invalid';
      
      // This should fail because database URL validation may not be strict enough
      const isValidConnection = DatabaseSecurityValidator.validateConnectionString(dbUrl);
      expect(isValidConnection).toBe(true);
    });

    test('should prevent credentials in connection string query parameters', () => {
      const dbUrl = process.env.DATABASE_URL || '';
      
      if (dbUrl) {
        try {
          const url = new URL(dbUrl);
          
          // This should fail because credentials may be exposed in query parameters
          const hasCredentialsInQuery = url.searchParams.has('password') || 
                                        url.searchParams.has('user') ||
                                        url.searchParams.has('sslkey') ||
                                        url.searchParams.has('sslcert');
          expect(hasCredentialsInQuery).toBe(false);
        } catch {
          // Invalid URL format is a security failure
          expect(false).toBe(true);
        }
      }
    });

    test('should enforce SSL for production database connections', () => {
      // Mock production environment for testing
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const dbUrl = process.env.DATABASE_URL || '';
      
      if (dbUrl) {
        try {
          const url = new URL(dbUrl);
          
          // This should fail because production connections may not require SSL
          const hasSslMode = url.searchParams.get('sslmode') === 'require' ||
                           url.searchParams.get('ssl') === 'true';
          expect(hasSslMode).toBe(true);
        } catch {
          expect(false).toBe(true);
        }
      }
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    test('should validate database connection parameters', () => {
      // Test connection parameters extracted from environment
      const dbParams = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5432',
        database: process.env.DB_NAME || 'neonpro',
        user: process.env.DB_USER || 'postgres'
      };
      
      // This should fail because connection parameter validation may not be strict enough
      const isValidParams = DatabaseSecurityValidator.validateConnectionParams(dbParams);
      expect(isValidParams).toBe(true);
    });
  });

  describe('2. Connection Pool Security', () => {
    test('should validate connection pool settings', () => {
      const poolSettings = {
        maxConnections: process.env.DB_MAX_CONNECTIONS || '10',
        minConnections: process.env.DB_MIN_CONNECTIONS || '2',
        idleTimeout: process.env.DB_IDLE_TIMEOUT || '30',
        connectionTimeout: process.env.DB_CONNECTION_TIMEOUT || '30'
      };
      
      // This should fail because pool settings validation may not be strict enough
      const isValidPoolSettings = DatabaseSecurityValidator.validatePoolSettings(poolSettings);
      expect(isValidPoolSettings).toBe(true);
    });

    test('should prevent excessive connection pool size', () => {
      const maxConnections = parseInt(process.env.DB_MAX_CONNECTIONS || '10');
      
      // This should fail because connection pool size may be too large
      const isValidMaxConnections = maxConnections >= 1 && maxConnections <= 50;
      expect(isValidMaxConnections).toBe(true);
    });

    test('should validate connection timeout settings', () => {
      const connectionTimeout = parseInt(process.env.DB_CONNECTION_TIMEOUT || '30');
      const poolTimeout = parseInt(process.env.DB_POOL_TIMEOUT || '15');
      
      // This should fail because timeout validation may not be strict enough
      const isValidConnectionTimeout = connectionTimeout >= 5 && connectionTimeout <= 120;
      const isValidPoolTimeout = poolTimeout >= 5 && poolTimeout <= 300;
      
      expect(isValidConnectionTimeout).toBe(true);
      expect(isValidPoolTimeout).toBe(true);
    });
  });

  describe('3. Database Security Settings', () => {
    test('should validate SSL configuration', () => {
      const securitySettings = {
        sslMode: process.env.DB_SSL_MODE || 'prefer',
        sslEnabled: process.env.DB_SSL_ENABLED || 'false'
      };
      
      // This should fail because SSL configuration may not be secure enough
      const isValidSecuritySettings = DatabaseSecurityValidator.validateSecuritySettings(securitySettings);
      expect(isValidSecuritySettings).toBe(true);
    });

    test('should enforce SSL in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const sslEnabled = process.env.DB_SSL_ENABLED || 'false';
      
      // This should fail because SSL may not be enabled in production
      const isSslEnabledInProduction = sslEnabled === 'true';
      expect(isSslEnabledInProduction).toBe(true);
      
      process.env.NODE_ENV = originalEnv;
    });

    test('should validate database encryption settings', () => {
      const encryptionEnabled = process.env.DB_ENCRYPTION_ENABLED || 'false';
      const encryptionKey = process.env.DB_ENCRYPTION_KEY || '';
      
      // This should fail because encryption settings may not be properly configured
      const isValidEncryption = encryptionEnabled === 'true' && encryptionKey.length >= 32;
      expect(isValidEncryption).toBe(true);
    });
  });

  describe('4. Database Operation Security', () => {
    test('should validate query security', () => {
      const testQueries = [
        'SELECT * FROM users WHERE id = $1',
        'SELECT * FROM users WHERE name = $1 AND email = $2',
        'INSERT INTO users (name, email) VALUES ($1, $2)',
        'UPDATE users SET name = $1 WHERE id = $2'
      ];
      
      testQueries.forEach(query => {
        // This should fail because query validation may not be strict enough
        const isValidQuery = DatabaseSecurityValidator.validateQuerySecurity(query);
        expect(isValidQuery).toBe(true);
      });
    });

    test('should prevent SQL injection patterns', () => {
      const maliciousQueries = [
        'SELECT * FROM users WHERE id = 1; DROP TABLE users;',
        'SELECT * FROM users WHERE name = \'admin\' OR 1=1;',
        'SELECT * FROM users WHERE name = \'admin\'; --',
        'SELECT * FROM users UNION SELECT * FROM passwords;'
      ];
      
      maliciousQueries.forEach(query => {
        // This should fail because SQL injection may not be prevented
        const isValidQuery = DatabaseSecurityValidator.validateQuerySecurity(query);
        expect(isValidQuery).toBe(false);
      });
    });

    test('should validate parameterized query usage', () => {
      // Check if scripts use parameterized queries
      const scripts = [
        'setup-supabase-migrations.sh',
        'deploy-unified.sh',
        'config.sh'
      ];
      
      scripts.forEach(script => {
        const scriptPath = join(SCRIPTS_DIR, script);
        if (existsSync(scriptPath)) {
          const content = readFileSync(scriptPath, 'utf8');
          
          // This should fail because scripts may not use parameterized queries
          const usesParameterizedQueries = content.includes('$1') || 
                                          content.includes('$2') ||
                                          content.includes('prepared') ||
                                          content.includes('parameterized');
          expect(usesParameterizedQueries).toBe(true);
        }
      });
    });
  });

  describe('5. Connection Retry Security', () => {
    test('should validate connection retry settings', () => {
      const retrySettings = {
        maxAttempts: process.env.DB_CONNECTION_ATTEMPTS || '3',
        retryDelay: process.env.DB_RETRY_DELAY || '5',
        connectionTimeout: process.env.DB_CONNECTION_TIMEOUT || '30'
      };
      
      // This should fail because retry settings validation may not be strict enough
      const isValidRetrySettings = DatabaseSecurityValidator.validateConnectionRetry(retrySettings);
      expect(isValidRetrySettings).toBe(true);
    });

    test('should prevent excessive retry attempts', () => {
      const maxAttempts = parseInt(process.env.DB_CONNECTION_ATTEMPTS || '3');
      
      // This should fail because retry attempts may be too high
      const isValidMaxAttempts = maxAttempts >= 1 && maxAttempts <= 5;
      expect(isValidMaxAttempts).toBe(true);
    });

    test('should validate retry delay settings', () => {
      const retryDelay = parseInt(process.env.DB_RETRY_DELAY || '5');
      
      // This should fail because retry delay may be too short
      const isValidRetryDelay = retryDelay >= 2 && retryDelay <= 30;
      expect(isValidRetryDelay).toBe(true);
    });
  });

  describe('6. Database Privilege Security', () => {
    test('should validate database user privileges', () => {
      // Test common application privileges
      const appPrivileges = [
        'CONNECT',
        'SELECT',
        'INSERT',
        'UPDATE',
        'DELETE',
        'USAGE'
      ];
      
      // This should fail because privilege validation may not be strict enough
      const isValidPrivileges = DatabaseSecurityValidator.validateDatabasePrivileges(appPrivileges);
      expect(isValidPrivileges).toBe(true);
    });

    test('should prevent excessive database privileges', () => {
      const dangerousPrivileges = [
        'SUPERUSER',
        'CREATEDB',
        'CREATEROLE',
        'REPLICATION'
      ];
      
      // This should fail because dangerous privileges may be granted
      const hasDangerousPrivileges = DatabaseSecurityValidator.validateDatabasePrivileges(dangerousPrivileges);
      expect(hasDangerousPrivileges).toBe(false);
    });
  });

  describe('7. Database Configuration Security', () => {
    test('should validate database configuration in scripts', () => {
      if (existsSync(CONFIG_FILE)) {
        const content = readFileSync(CONFIG_FILE, 'utf8');
        
        // This should fail because configuration may contain hardcoded credentials
        const hasHardcodedCredentials = /password\s*=\s*["'][^"']+["']/.test(content);
        expect(hasHardcodedCredentials).toBe(false);
        
        // This should fail because configuration may expose sensitive data
        const hasExposedCredentials = /DATABASE_URL\s*=\s*["'][^"']+["']/.test(content);
        expect(hasExposedCredentials).toBe(false);
      }
    });

    test('should validate environment-specific database configuration', () => {
      if (existsSync(CONFIG_FILE)) {
        const content = readFileSync(CONFIG_FILE, 'utf8');
        
        // This should fail because environment-specific configuration may not be isolated
        const hasEnvironmentConfig = content.includes('NODE_ENV') ||
                                     content.includes('environment') ||
                                     content.includes('production');
        expect(hasEnvironmentConfig).toBe(true);
      }
    });

    test('should validate database connection timeout settings', () => {
      const dbTimeout = parseInt(process.env.DB_TIMEOUT || '30');
      const queryTimeout = parseInt(process.env.DB_QUERY_TIMEOUT || '10');
      
      // This should fail because timeout settings may not be secure
      const isValidDbTimeout = dbTimeout >= 5 && dbTimeout <= 120;
      const isValidQueryTimeout = queryTimeout >= 1 && queryTimeout <= 60;
      
      expect(isValidDbTimeout).toBe(true);
      expect(isValidQueryTimeout).toBe(true);
    });
  });

  describe('8. Database Error Handling Security', () => {
    test('should validate secure error handling in scripts', () => {
      const scripts = [
        'setup-supabase-migrations.sh',
        'deploy-unified.sh',
        'emergency-rollback.sh'
      ];
      
      scripts.forEach(script => {
        const scriptPath = join(SCRIPTS_DIR, script);
        if (existsSync(scriptPath)) {
          const content = readFileSync(scriptPath, 'utf8');
          
          // This should fail because error handling may expose sensitive information
          const hasSecureErrorHandling = content.includes('set -e') ||
                                         content.includes('trap') ||
                                         content.includes('error') ||
                                         content.includes('log_error');
          expect(hasSecureErrorHandling).toBe(true);
        }
      });
    });

    test('should prevent sensitive information in error messages', () => {
      const scripts = [
        'setup-supabase-migrations.sh',
        'deploy-unified.sh'
      ];
      
      scripts.forEach(script => {
        const scriptPath = join(SCRIPTS_DIR, script);
        if (existsSync(scriptPath)) {
          const content = readFileSync(scriptPath, 'utf8');
          
          // This should fail because error messages may expose sensitive information
          const hasSensitiveInfo = /echo.*password/i.test(content) ||
                                 /echo.*secret/i.test(content) ||
                                 /echo.*token/i.test(content);
          expect(hasSensitiveInfo).toBe(false);
        }
      });
    });
  });

  describe('9. Database Backup Security', () => {
    test('should validate backup configuration security', () => {
      const backupEnabled = process.env.DB_BACKUP_ENABLED || 'true';
      const backupEncryption = process.env.DB_BACKUP_ENCRYPTION || 'true';
      const backupRetention = parseInt(process.env.DAILY_BACKUP_RETENTION || '30');
      
      // This should fail because backup configuration may not be secure
      const isValidBackupEnabled = backupEnabled === 'true';
      const isValidBackupEncryption = backupEncryption === 'true';
      const isValidBackupRetention = backupRetention >= 1 && backupRetention <= 365;
      
      expect(isValidBackupEnabled).toBe(true);
      expect(isValidBackupEncryption).toBe(true);
      expect(isValidBackupRetention).toBe(true);
    });

    test('should validate backup file permissions', () => {
      const backupFilePerms = process.env.BACKUP_FILE_PERMISSIONS || '600';
      
      // This should fail because backup file permissions may be too permissive
      const isValidBackupPerms = backupFilePerms === '600' || backupFilePerms === '640';
      expect(isValidBackupPerms).toBe(true);
    });
  });

  describe('10. Database Monitoring Security', () => {
    test('should validate database monitoring configuration', () => {
      const monitoringEnabled = process.env.DB_MONITORING_ENABLED || 'true';
      const monitoringInterval = parseInt(process.env.DB_MONITORING_INTERVAL || '60');
      
      // This should fail because monitoring configuration may not be secure
      const isValidMonitoringEnabled = monitoringEnabled === 'true';
      const isValidMonitoringInterval = monitoringInterval >= 10 && monitoringInterval <= 3600;
      
      expect(isValidMonitoringEnabled).toBe(true);
      expect(isValidMonitoringInterval).toBe(true);
    });

    test('should validate database log security', () => {
      const logLevel = process.env.DB_LOG_LEVEL || 'info';
      const logSensitiveData = process.env.DB_LOG_SENSITIVE_DATA || 'false';
      
      // This should fail because logging may expose sensitive data
      const isValidLogLevel = ['error', 'warn', 'info'].includes(logLevel);
      const isValidLogSensitiveData = logSensitiveData === 'false';
      
      expect(isValidLogLevel).toBe(true);
      expect(isValidLogSensitiveData).toBe(true);
    });
  });
});

// Export for use in other test files
export { DatabaseSecurityValidator };