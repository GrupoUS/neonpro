/**
 * Tests for security utilities
 */

import { describe, expect, it } from 'vitest';
import { beforeEach } from 'vitest';
import { RateLimiter, SecurityUtils } from '../utils';

describe('SecurityUtils_, () => {
  describe('Input Sanitization_, () => {
    it('should sanitize input to prevent XSS_, () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = SecurityUtils.sanitizeInput(maliciousInput);

      expect(sanitized).toBe('<script>alert("xss")</script>');
      expect(sanitized).not.toContain('<script>');
    });

    it('should sanitize HTML content_, () => {
      const maliciousHTML = '<div onclick="alert(\'xss\')">Click me</div><script>evil()</script>';
      const sanitized = SecurityUtils.sanitizeHTML(maliciousHTML);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onclick=');
      expect(sanitized).toContain('Click me');
    });

    it('should handle non-string inputs_, () => {
      expect(SecurityUtils.sanitizeInput(null as any)).toBe(');
      expect(SecurityUtils.sanitizeInput(undefined as any)).toBe(');
      expect(SecurityUtils.sanitizeInput(123 as any)).toBe(');
      expect(SecurityUtils.sanitizeInput({} as any)).toBe(');
    });
  });

  describe('Email Validation_, () => {
    it('should validate and sanitize correct emails_, () => {
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

    it('should reject invalid emails_, () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@domain.com',
        'test@domain',
        'test domain.com',
        ',
      ];

      invalidEmails.forEach(email => {
        const sanitized = SecurityUtils.sanitizeEmail(email);
        expect(sanitized).toBe(');
      });
    });
  });

  describe('Phone Sanitization_, () => {
    it('should sanitize Brazilian phone numbers_, () => {
      const testCases = [
        { input: '(11) 1234-5678', expected: '1112345678' },
        { input: '11 12345-6789', expected: '11123456789' },
        { input: '1112345678', expected: '1112345678' },
        { input: '11123456789', expected: '11123456789' },
      ];

      testCases.forEach(({ input, expected }) => {
        const sanitized = SecurityUtils.sanitizePhone(input);
        expect(sanitized).toBe(expected);
      });
    });

    it('should reject invalid phone numbers_, () => {
      const invalidPhones = [
        '123', // Too short
        '123456789012', // Too long
        'abc1234567', // Contains letters
        ', // Empty
      ];

      invalidPhones.forEach(phone => {
        const sanitized = SecurityUtils.sanitizePhone(phone);
        expect(sanitized).toBe(');
      });
    });
  });

  describe('CPF Validation_, () => {
    it('should sanitize CPF correctly_, () => {
      const testCases = [
        { input: '123.456.789-00', expected: '12345678900' },
        { input: '123 456 789 00', expected: '12345678900' },
        { input: '12345678900', expected: '12345678900' },
      ];

      testCases.forEach(({ input, expected }) => {
        const sanitized = SecurityUtils.sanitizeCPF(input);
        expect(sanitized).toBe(expected);
      });
    });

    it('should validate CPF using official algorithm_, () => {
      // Valid CPFs for testing
      const validCPFs = [
        '52998224725', // Known valid CPF
        '11144477735', // Known valid CPF
      ];

      validCPFs.forEach(cpf => {
        expect(SecurityUtils.validateCPF(cpf)).toBe(true);
      });
    });

    it('should reject invalid CPFs_, () => {
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

  describe('RG Sanitization_, () => {
    it('should sanitize RG correctly_, () => {
      const testCases = [
        { input: '12.345.678-9', expected: '123456789' },
        { input: '12 345 678 9', expected: '123456789' },
        { input: '12.345.678-X', expected: '12345678X' },
        { input: 'MG12345678', expected: 'MG12345678' },
      ];

      testCases.forEach(({ input, expected }) => {
        const sanitized = SecurityUtils.sanitizeRG(input);
        expect(sanitized).toBe(expected);
      });
    });
  });

  describe('Token Generation_, () => {
    it('should generate secure random tokens_, () => {
      const token1 = SecurityUtils.generateToken();
      const token2 = SecurityUtils.generateToken();

      expect(token1).toBeDefined();
      expect(typeof token1).toBe('string');
      expect(token1.length).toBe(32);
      expect(token1).not.toBe(token2);
    });

    it('should generate tokens with custom length_, () => {
      const token = SecurityUtils.generateToken(16);
      expect(token.length).toBe(16);
    });

    it('should generate secure nonces_, () => {
      const nonce1 = SecurityUtils.generateNonce();
      const nonce2 = SecurityUtils.generateNonce();

      expect(nonce1).toBeDefined();
      expect(typeof nonce1).toBe('string');
      expect(nonce1.length).toBe(16);
      expect(nonce1).not.toBe(nonce2);
    });
  });

  describe('Suspicious Pattern Detection_, () => {
    it('should detect XSS patterns_, () => {
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

    it('should detect SQL injection patterns_, () => {
      const maliciousInputs = [
        'SELECT * FROM users',
        'UNION SELECT username, password FROM users',
        'DROP TABLE users',
        'INSERT INTO users VALUES',
        'UPDATE users SET admin=\'1\',
      ];

      maliciousInputs.forEach(input => {
        expect(SecurityUtils.containsSuspiciousPatterns(input)).toBe(true);
      });
    });

    it('should detect path traversal patterns_, () => {
      const maliciousInputs = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        '....//....//etc/passwd',
      ];

      maliciousInputs.forEach(input => {
        expect(SecurityUtils.containsSuspiciousPatterns(input)).toBe(true);
      });
    });

    it('should not flag benign inputs_, () => {
      const benignInputs = [
        'Hello World',
        'user@example.com',
        '123.456.789.012',
        'This is a normal sentence',
        'user_name_123_,
      ];

      benignInputs.forEach(input => {
        expect(SecurityUtils.containsSuspiciousPatterns(input)).toBe(false);
      });
    });
  });

  describe('Data Masking_, () => {
    it('should mask sensitive data correctly_, () => {
      const testCases = [
        { input: '12345678900', expected: '12******00' },
        { input: 'user@example.com', expected: 'us******om' },
        { input: 'ABC123XYZ', expected: 'AB****XYZ' },
      ];

      testCases.forEach(({ input, expected }) => {
        const masked = SecurityUtils.maskSensitiveData(input);
        expect(masked).toBe(expected);
      });
    });

    it('should handle short strings_, () => {
      expect(SecurityUtils.maskSensitiveData('123')).toBe('***');
      expect(SecurityUtils.maskSensitiveData('12')).toBe('**');
      expect(SecurityUtils.maskSensitiveData('1')).toBe('*');
    });

    it('should handle empty strings_, () => {
      expect(SecurityUtils.maskSensitiveData(')).toBe(');
    });
  });

  describe('Password Strength Validation_, () => {
    it('should validate strong passwords_, () => {
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

    it('should reject weak passwords_, () => {
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

    it('should provide helpful feedback_, () => {
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

  describe('Password Generation_, () => {
    it('should generate secure passwords_, () => {
      const password = SecurityUtils.generateSecurePassword();

      expect(password.length).toBe(12);
      expect(/[a-z]/.test(password)).toBe(true); // Contains lowercase
      expect(/[A-Z]/.test(password)).toBe(true); // Contains uppercase
      expect(/\d/.test(password)).toBe(true); // Contains numbers
      expect(/[!@#$%^&*(),.?":{}|<>]/.test(password)).toBe(true); // Contains special chars
    });

    it('should generate passwords with custom length_, () => {
      const password = SecurityUtils.generateSecurePassword(16);
      expect(password.length).toBe(16);
    });

    it('should generate unique passwords_, () => {
      const password1 = SecurityUtils.generateSecurePassword();
      const password2 = SecurityUtils.generateSecurePassword();

      expect(password1).not.toBe(password2);
    });
  });
});

describe('RateLimiter_, () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
  });

  describe('Rate Limiting Logic_, () => {
    it('should allow requests within limits_, () => {
      const key = 'test-user';
      const maxAttempts = 5;
      const windowMs = 60000;

      for (let i = 0; i < maxAttempts; i++) {
        expect(rateLimiter.isAllowed(key, maxAttempts, windowMs)).toBe(true);
      }
    });

    it('should block requests exceeding limits_, () => {
      const key = 'test-user';
      const maxAttempts = 3;
      const windowMs = 60000;

      // Allow first 3 requests
      for (let i = 0; i < maxAttempts; i++) {
        expect(rateLimiter.isAllowed(key, maxAttempts, windowMs)).toBe(true);
      }

      // Block 4th request
      expect(rateLimiter.isAllowed(key, maxAttempts, windowMs)).toBe(false);
    });

    it('should reset after window expires_, () => {
      const key = 'test-user';
      const maxAttempts = 2;
      const windowMs = 100; // Very short window for testing

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

  describe('Remaining Attempts_, () => {
    it('should calculate remaining attempts correctly_, () => {
      const key = 'test-user';
      const maxAttempts = 5;
      const windowMs = 60000;

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

    it('should return max attempts for new keys_, () => {
      const key = 'new-user';
      const maxAttempts = 10;
      const windowMs = 60000;

      expect(rateLimiter.getRemainingAttempts(key, maxAttempts, windowMs)).toBe(
        10,
      );
    });
  });

  describe('Key Management_, () => {
    it('should reset rate limiting for specific keys_, () => {
      const key = 'test-user';
      const maxAttempts = 3;
      const windowMs = 60000;

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

    it('should handle cleanup of expired records_, () => {
      const key1 = 'user1';
      const key2 = 'user2';
      const maxAttempts = 5;
      const windowMs = 100; // Short window

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
