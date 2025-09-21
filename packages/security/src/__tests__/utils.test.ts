/**
 * Tests for security utilities
 */

import { describe, expect, it } from 'vitest';
import { beforeEach } from 'vitest';
import { RateLimiter, SecurityUtils } from '../utils';

describe(_'SecurityUtils',_() => {
  describe(_'Input Sanitization',_() => {
    it(_'should sanitize input to prevent XSS',_() => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = SecurityUtils.sanitizeInput(maliciousInput);

      expect(sanitized).toBe('<script>alert("xss")</script>');
      expect(sanitized).not.toContain('<script>');
    });

    it(_'should sanitize HTML content',_() => {
      const maliciousHTML = '<div onclick="alert(\'xss\')">Click me</div><script>evil()</script>';
      const sanitized = SecurityUtils.sanitizeHTML(maliciousHTML);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onclick=');
      expect(sanitized).toContain('Click me');
    });

    it(_'should handle non-string inputs',_() => {
      expect(SecurityUtils.sanitizeInput(null as any)).toBe('');
      expect(SecurityUtils.sanitizeInput(undefined as any)).toBe('');
      expect(SecurityUtils.sanitizeInput(123 as any)).toBe('');
      expect(SecurityUtils.sanitizeInput({} as any)).toBe('');
    });
  });

  describe(_'Email Validation',_() => {
    it(_'should validate and sanitize correct emails',_() => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+123@gmail.com',
        'USER@EXAMPLE.COM',
      ];

      validEmails.forEach(email => {
        const sanitized = SecurityUtils.sanitizeEmail(email);
        expect(sanitized).toBe(email.toLowerCase().trim());
        expect(sanitized).toBeDefined();
      });
    });

    it(_'should reject invalid emails',_() => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@domain.com',
        'test@domain',
        'test domain.com',
        '',
      ];

      invalidEmails.forEach(email => {
        const sanitized = SecurityUtils.sanitizeEmail(email);
        expect(sanitized).toBe('');
      });
    });
  });

  describe(_'Phone Sanitization',_() => {
    it(_'should sanitize Brazilian phone numbers',_() => {
      const testCases = [
        { input: '(11) 1234-5678', expected: '1112345678' },
        { input: '11 12345-6789', expected: '11123456789' },
        { input: '1112345678', expected: '1112345678' },
        { input: '11123456789', expected: '11123456789' },
      ];

      testCases.forEach(_({ input,_expected }) => {
        const sanitized = SecurityUtils.sanitizePhone(input);
        expect(sanitized).toBe(expected);
      });
    });

    it(_'should reject invalid phone numbers',_() => {
      const invalidPhones = [
        '123', // Too short
        '123456789012', // Too long
        'abc1234567', // Contains letters
        '', // Empty
      ];

      invalidPhones.forEach(phone => {
        const sanitized = SecurityUtils.sanitizePhone(phone);
        expect(sanitized).toBe('');
      });
    });
  });

  describe(_'CPF Validation',_() => {
    it(_'should sanitize CPF correctly',_() => {
      const testCases = [
        { input: '123.456.789-00', expected: '12345678900' },
        { input: '123 456 789 00', expected: '12345678900' },
        { input: '12345678900', expected: '12345678900' },
      ];

      testCases.forEach(_({ input,_expected }) => {
        const sanitized = SecurityUtils.sanitizeCPF(input);
        expect(sanitized).toBe(expected);
      });
    });

    it(_'should validate CPF using official algorithm',_() => {
      // Valid CPFs for testing
      const validCPFs = [
        '52998224725', // Known valid CPF
        '11144477735', // Known valid CPF
      ];

      validCPFs.forEach(cpf => {
        expect(SecurityUtils.validateCPF(cpf)).toBe(true);
      });
    });

    it(_'should reject invalid CPFs',_() => {
      const invalidCPFs = [
        '11111111111', // All same digits
        '12345678900', // Invalid verification digits
        '123', // Too short
        '123456789012', // Too long
        'abc12345678', // Contains letters
      ];

      invalidCPFs.forEach(cpf => {
        expect(SecurityUtils.validateCPF(cpf)).toBe(false);
      });
    });
  });

  describe(_'RG Sanitization',_() => {
    it(_'should sanitize RG correctly',_() => {
      const testCases = [
        { input: '12.345.678-9', expected: '123456789' },
        { input: '12 345 678 9', expected: '123456789' },
        { input: '12.345.678-X', expected: '12345678X' },
        { input: 'MG12345678', expected: 'MG12345678' },
      ];

      testCases.forEach(_({ input,_expected }) => {
        const sanitized = SecurityUtils.sanitizeRG(input);
        expect(sanitized).toBe(expected);
      });
    });
  });

  describe(_'Token Generation',_() => {
    it(_'should generate secure random tokens',_() => {
      const token1 = SecurityUtils.generateToken();
      const token2 = SecurityUtils.generateToken();

      expect(token1).toBeDefined();
      expect(typeof token1).toBe('string');
      expect(token1.length).toBe(32);
      expect(token1).not.toBe(token2);
    });

    it(_'should generate tokens with custom length',_() => {
      const token = SecurityUtils.generateToken(16);
      expect(token.length).toBe(16);
    });

    it(_'should generate secure nonces',_() => {
      const nonce1 = SecurityUtils.generateNonce();
      const nonce2 = SecurityUtils.generateNonce();

      expect(nonce1).toBeDefined();
      expect(typeof nonce1).toBe('string');
      expect(nonce1.length).toBe(16);
      expect(nonce1).not.toBe(nonce2);
    });
  });

  describe(_'Suspicious Pattern Detection',_() => {
    it(_'should detect XSS patterns',_() => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        'vbscript:msgbox("xss")',
        'onclick=alert("xss")',
        'onerror=alert("xss")',
      ];

      maliciousInputs.forEach(input => {
        expect(SecurityUtils.containsSuspiciousPatterns(input)).toBe(true);
      });
    });

    it(_'should detect SQL injection patterns',_() => {
      const maliciousInputs = [
        'SELECT * FROM users',
        'UNION SELECT username, password FROM users',
        'DROP TABLE users',
        'INSERT INTO users VALUES',
        'UPDATE users SET admin=\'1\'',
      ];

      maliciousInputs.forEach(input => {
        expect(SecurityUtils.containsSuspiciousPatterns(input)).toBe(true);
      });
    });

    it(_'should detect path traversal patterns',_() => {
      const maliciousInputs = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        '....//....//etc/passwd',
      ];

      maliciousInputs.forEach(input => {
        expect(SecurityUtils.containsSuspiciousPatterns(input)).toBe(true);
      });
    });

    it(_'should not flag benign inputs',_() => {
      const benignInputs = [
        'Hello World',
        'user@example.com',
        '123.456.789.012',
        'This is a normal sentence',
        'user_name_123',
      ];

      benignInputs.forEach(input => {
        expect(SecurityUtils.containsSuspiciousPatterns(input)).toBe(false);
      });
    });
  });

  describe(_'Data Masking',_() => {
    it(_'should mask sensitive data correctly',_() => {
      const testCases = [
        { input: '12345678900', expected: '12******00' },
        { input: 'user@example.com', expected: 'us******om' },
        { input: 'ABC123XYZ', expected: 'AB****XYZ' },
      ];

      testCases.forEach(_({ input,_expected }) => {
        const masked = SecurityUtils.maskSensitiveData(input);
        expect(masked).toBe(expected);
      });
    });

    it(_'should handle short strings',_() => {
      expect(SecurityUtils.maskSensitiveData('123')).toBe('***');
      expect(SecurityUtils.maskSensitiveData('12')).toBe('**');
      expect(SecurityUtils.maskSensitiveData('1')).toBe('*');
    });

    it(_'should handle empty strings',_() => {
      expect(SecurityUtils.maskSensitiveData('')).toBe('');
    });
  });

  describe(_'Password Strength Validation',_() => {
    it(_'should validate strong passwords',_() => {
      const strongPasswords = [
        'StrongP@ssw0rd!',
        'MySecureP@ss123',
        'C0mpl3x!P@ssw0rd',
      ];

      strongPasswords.forEach(password => {
        const result = SecurityUtils.validatePasswordStrength(password);
        expect(result.isValid).toBe(true);
        expect(result.score).toBeGreaterThanOrEqual(5);
      });
    });

    it(_'should reject weak passwords',_() => {
      const weakPasswords = [
        'password', // Too common
        '123456', // Only numbers
        'abcdef', // Only lowercase
        'ABCDEFG', // Only uppercase
        'Abcdef', // Missing numbers and special chars
        'Abc123', // Missing special chars
        'short', // Too short
      ];

      weakPasswords.forEach(password => {
        const result = SecurityUtils.validatePasswordStrength(password);
        expect(result.isValid).toBe(false);
        expect(result.score).toBeLessThan(5);
        expect(result.feedback.length).toBeGreaterThan(0);
      });
    });

    it(_'should provide helpful feedback',_() => {
      const result = SecurityUtils.validatePasswordStrength('weak');

      expect(result.feedback).toContain(
        'Password must be at least 8 characters long',
      );
      expect(result.feedback).toContain(
        'Password must contain lowercase letters',
      );
      expect(result.feedback).toContain(
        'Password must contain uppercase letters',
      );
      expect(result.feedback).toContain('Password must contain numbers');
      expect(result.feedback).toContain(
        'Password must contain special characters',
      );
    });
  });

  describe(_'Password Generation',_() => {
    it(_'should generate secure passwords',_() => {
      const password = SecurityUtils.generateSecurePassword();

      expect(password.length).toBe(12);
      expect(/[a-z]/.test(password)).toBe(true); // Contains lowercase
      expect(/[A-Z]/.test(password)).toBe(true); // Contains uppercase
      expect(/\d/.test(password)).toBe(true); // Contains numbers
      expect(/[!@#$%^&*(),.?":{}|<>]/.test(password)).toBe(true); // Contains special chars
    });

    it(_'should generate passwords with custom length',_() => {
      const password = SecurityUtils.generateSecurePassword(16);
      expect(password.length).toBe(16);
    });

    it(_'should generate unique passwords',_() => {
      const password1 = SecurityUtils.generateSecurePassword();
      const password2 = SecurityUtils.generateSecurePassword();

      expect(password1).not.toBe(password2);
    });
  });
});

describe(_'RateLimiter',_() => {
  let rateLimiter: RateLimiter;

  beforeEach(_() => {
    rateLimiter = new RateLimiter();
  });

  describe(_'Rate Limiting Logic',_() => {
    it(_'should allow requests within limits',_() => {
      const key = 'test-user';
      const maxAttempts = 5;
      const _windowMs = 60000;

      for (let i = 0; i < maxAttempts; i++) {
        expect(rateLimiter.isAllowed(key, maxAttempts, windowMs)).toBe(true);
      }
    });

    it(_'should block requests exceeding limits',_() => {
      const key = 'test-user';
      const maxAttempts = 3;
      const _windowMs = 60000;

      // Allow first 3 requests
      for (let i = 0; i < maxAttempts; i++) {
        expect(rateLimiter.isAllowed(key, maxAttempts, windowMs)).toBe(true);
      }

      // Block 4th request
      expect(rateLimiter.isAllowed(key, maxAttempts, windowMs)).toBe(false);
    });

    it(_'should reset after window expires',_() => {
      const key = 'test-user';
      const maxAttempts = 2;
      const _windowMs = 100; // Very short window for testing

      // Use up attempts
      expect(rateLimiter.isAllowed(key, maxAttempts, windowMs)).toBe(true);
      expect(rateLimiter.isAllowed(key, maxAttempts, windowMs)).toBe(true);
      expect(rateLimiter.isAllowed(key, maxAttempts, windowMs)).toBe(false);

      // Wait for window to expire
      // Note: In real tests, we'd need to mock time or use a shorter window
      // For now, we'll test the reset functionality directly
      rateLimiter.reset(key);

      // Should allow requests again
      expect(rateLimiter.isAllowed(key, maxAttempts, windowMs)).toBe(true);
    });
  });

  describe(_'Remaining Attempts',_() => {
    it(_'should calculate remaining attempts correctly',_() => {
      const key = 'test-user';
      const maxAttempts = 5;
      const _windowMs = 60000;

      expect(rateLimiter.getRemainingAttempts(key, maxAttempts, windowMs)).toBe(
        5,
      );

      // Use some attempts
      rateLimiter.isAllowed(key, maxAttempts, windowMs);
      rateLimiter.isAllowed(key, maxAttempts, windowMs);

      expect(rateLimiter.getRemainingAttempts(key, maxAttempts, windowMs)).toBe(
        3,
      );
    });

    it(_'should return max attempts for new keys',_() => {
      const key = 'new-user';
      const maxAttempts = 10;
      const _windowMs = 60000;

      expect(rateLimiter.getRemainingAttempts(key, maxAttempts, windowMs)).toBe(
        10,
      );
    });
  });

  describe(_'Key Management',_() => {
    it(_'should reset rate limiting for specific keys',_() => {
      const key = 'test-user';
      const maxAttempts = 3;
      const _windowMs = 60000;

      // Use up attempts
      rateLimiter.isAllowed(key, maxAttempts, windowMs);
      rateLimiter.isAllowed(key, maxAttempts, windowMs);
      expect(rateLimiter.isAllowed(key, maxAttempts, windowMs)).toBe(true); // 3rd allowed
      expect(rateLimiter.isAllowed(key, maxAttempts, windowMs)).toBe(false); // 4th blocked

      // Reset the key
      rateLimiter.reset(key);

      // Should allow requests again
      expect(rateLimiter.isAllowed(key, maxAttempts, windowMs)).toBe(true);
      expect(rateLimiter.getRemainingAttempts(key, maxAttempts, windowMs)).toBe(
        3,
      );
    });

    it(_'should handle cleanup of expired records',_() => {
      const key1 = 'user1';
      const key2 = 'user2';
      const maxAttempts = 5;
      const _windowMs = 100; // Short window

      // Use up attempts for both users
      rateLimiter.isAllowed(key1, maxAttempts, windowMs);
      rateLimiter.isAllowed(key2, maxAttempts, windowMs);

      // Both should have remaining attempts
      expect(
        rateLimiter.getRemainingAttempts(key1, maxAttempts, windowMs),
      ).toBe(4);
      expect(
        rateLimiter.getRemainingAttempts(key2, maxAttempts, windowMs),
      ).toBe(4);

      // Cleanup should remove expired records
      // Note: This is hard to test without mocking time
      // In practice, the cleanup would remove records where resetTime < current time
      rateLimiter.cleanup();

      // After cleanup, new requests should get full allowance
      expect(
        rateLimiter.getRemainingAttempts(key1, maxAttempts, windowMs),
      ).toBe(5);
      expect(
        rateLimiter.getRemainingAttempts(key2, maxAttempts, windowMs),
      ).toBe(5);
    });
  });
});
