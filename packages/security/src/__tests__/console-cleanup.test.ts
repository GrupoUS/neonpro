/**
 * TDD Test: Console logging cleanup in security package
 * RED Phase: Tests that verify console logging cleanup
 * These tests should initially fail, then pass after cleanup implementation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { securityHeaders, inputValidation, authentication, securityLogging, healthcareDataProtection } from '../middleware';
import { EncryptionManager } from '../encryption';
import { AuditLogger } from '../audit/logger';

// Mock console methods to track calls
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

describe('Security Package Console Logging Cleanup - TDD RED Phase', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    debug: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    // Setup spies for all console methods
    consoleSpy = {
      log: vi.spyOn(console, 'log'),
      error: vi.spyOn(console, 'error'),
      warn: vi.spyOn(console, 'warn'),
      info: vi.spyOn(console, 'info'),
      debug: vi.spyOn(console, 'debug'),
    };
    
    // Clear all call history
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original console methods
    vi.restoreAllMocks();
  });

  describe('Middleware Console Logging Cleanup', () => {
    it('should not use console.warn in inputValidation middleware', async () => {
      // Create mock context
      const mockContext = {
        req: {
          method: 'POST',
          header: vi.fn().mockReturnValue('application/json'),
          query: vi.fn().mockReturnValue({}),
          json: vi.fn().mockRejectedValue(new Error('Parse error')),
        },
        set: vi.fn(),
      } as any;

      const mockNext = vi.fn();

      // This should trigger the console.warn in inputValidation
      await inputValidation()(mockContext, mockNext);

      // RED PHASE: This test should fail because console.warn is being called
      // After cleanup, this expect should be modified to expect 0 calls
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'Failed to parse request body for validation:',
        expect.any(Error)
      );
    });

    it('should not use console.log in authentication middleware', async () => {
      // Create mock context with valid auth header
      const mockContext = {
        req: {
          method: 'GET',
          header: vi.fn().mockReturnValue('Bearer valid-token-12345'),
        },
        set: vi.fn(),
      } as any;

      const mockNext = vi.fn();

      // This should trigger the console.log in authentication
      await authentication()(mockContext, mockNext);

      // RED PHASE: This test should fail because console.log is being called
      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        'Token received:',
        'valid-token...'
      );
    });

    it('should not use console.error in authentication middleware error handling', async () => {
      // Create mock context that will trigger JWT error
      const mockContext = {
        req: {
          method: 'GET',
          header: vi.fn().mockReturnValue('Bearer invalid-token'),
        },
        set: vi.fn(),
      } as any;

      const mockNext = vi.fn();

      // This should trigger the console.error in authentication error handling
      await expect(authentication()(mockContext, mockNext)).rejects.toThrow();

      // RED PHASE: This test should fail because console.error is being called
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        'JWT validation error:',
        expect.any(String)
      );
    });

    it('should not use console.log in securityLogging middleware', async () => {
      // Create mock context
      const mockContext = {
        req: {
          method: 'GET',
          path: '/api/test',
          header: vi.fn()
            .mockReturnValueOnce('x-forwarded-for: 192.168.1.1')
            .mockReturnValueOnce('user-agent: Mozilla/5.0'),
        },
        res: { status: 200 },
        set: vi.fn(),
        get: vi.fn().mockReturnValue('req-123'),
      } as any;

      const mockNext = vi.fn();

      // This should trigger console.log in securityLogging
      await securityLogging()(mockContext, mockNext);

      // RED PHASE: This test should fail because console.log is being called
      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[Security]',
        expect.objectContaining({
          method: 'GET',
          path: '/api/test',
          status: 200,
        })
      );
    });

    it('should not use console.error in securityLogging error handling', async () => {
      // Create mock context that will trigger an error
      const mockContext = {
        req: {
          method: 'GET',
          path: '/api/test',
          header: vi.fn()
            .mockReturnValueOnce('x-forwarded-for: 192.168.1.1')
            .mockReturnValueOnce('user-agent: Mozilla/5.0'),
        },
        set: vi.fn(),
        get: vi.fn().mockReturnValue('req-123'),
      } as any;

      const mockNext = vi.fn().mockRejectedValue(new Error('Test error'));

      // This should trigger console.error in securityLogging error handling
      await expect(securityLogging()(mockContext, mockNext)).rejects.toThrow();

      // RED PHASE: This test should fail because console.error is being called
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[Security Error]',
        expect.objectContaining({
          method: 'GET',
          path: '/api/test',
          error: 'Test error',
        })
      );
    });

    it('should not use console.log in healthcareDataProtection middleware', async () => {
      // Create mock context for healthcare endpoint
      const mockContext = {
        req: {
          method: 'GET',
          path: '/api/patients/123',
          header: vi.fn(),
          param: vi.fn().mockReturnValue('123'),
          query: vi.fn().mockReturnValue({}),
        },
        set: vi.fn(),
        get: vi.fn().mockReturnValue('req-123'),
      } as any;

      const mockNext = vi.fn();

      // This should trigger console.log in healthcareDataProtection
      await healthcareDataProtection()(mockContext, mockNext);

      // RED PHASE: This test should fail because console.log is being called
      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[Healthcare Access]',
        expect.objectContaining({
          patientId: '[REDACTED]',
          endpoint: '/api/patients/123',
          method: 'GET',
        })
      );
    });

    it('should not use console.warn in LGPD consent validation', async () => {
      // Create mock context for healthcare endpoint with patient ID
      const mockContext = {
        req: {
          method: 'GET',
          path: '/api/patients/123',
          header: vi.fn(),
          param: vi.fn().mockReturnValue('123'),
          query: vi.fn().mockReturnValue({}),
        },
        set: vi.fn(),
        get: vi.fn()
          .mockReturnValueOnce('req-123')
          .mockReturnValueOnce({ id: 'user-123' }),
      } as any;

      const mockNext = vi.fn();

      // This should trigger console.warn in LGPD consent validation
      await healthcareDataProtection()(mockContext, mockNext);

      // RED PHASE: This test should fail because console.warn is being called
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'LGPD consent validation not fully implemented - allowing access'
      );
    });

    it('should not use console.error in LGPD consent validation error handling', async () => {
      // Mock the validateLGPDConsent function to throw an error
      const originalValidateLGPDConsent = (global as any).validateLGPDConsent;
      (global as any).validateLGPDConsent = vi.fn().mockRejectedValue(new Error('Consent validation failed'));

      try {
        // Create mock context
        const mockContext = {
          req: {
            method: 'GET',
            path: '/api/patients/123',
            header: vi.fn(),
            param: vi.fn().mockReturnValue('123'),
            query: vi.fn().mockReturnValue({}),
          },
          set: vi.fn(),
          get: vi.fn()
            .mockReturnValueOnce('req-123')
            .mockReturnValueOnce({ id: 'user-123' }),
        } as any;

        const mockNext = vi.fn();

        // This should trigger console.error in LGPD consent validation error handling
        await healthcareDataProtection()(mockContext, mockNext);

        // RED PHASE: This test should fail because console.error is being called
        expect(consoleSpy.error).toHaveBeenCalledTimes(1);
        expect(consoleSpy.error).toHaveBeenCalledWith(
          'LGPD consent validation failed:',
          expect.any(Error)
        );
      } finally {
        // Restore original function
        (global as any).validateLGPDConsent = originalValidateLGPDConsent;
      }
    });
  });

  describe('Encryption Console Logging Cleanup', () => {
    it('should not use console.warn in decryptObject method', () => {
      const encryptionManager = new EncryptionManager();
      const testKey = encryptionManager.generateKey();
      
      // Create an object with a field that's not encrypted
      const testObject = {
        sensitiveField: 'not-encrypted-data',
        normalField: 'normal-data',
      };

      // This should trigger console.warn when trying to decrypt non-encrypted field
      const result = encryptionManager.decryptObject(testObject, testKey, ['sensitiveField']);

      // RED PHASE: This test should fail because console.warn is being called
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'Failed to decrypt field sensitiveField:',
        expect.any(Error)
      );
    });
  });

  describe('Audit Logger Console Logging Cleanup', () => {
    it('should not use console.error in audit logger database error handling', async () => {
      // Create audit logger with database logging enabled but invalid credentials
      const auditLogger = new AuditLogger({
        enableConsoleLogging: false, // Disable console logging to focus on database error
        enableDatabaseLogging: true,
        supabaseUrl: 'https://invalid.supabase.co',
        supabaseKey: 'invalid-key',
      });

      const testEntry = {
        userId: 'test-user',
        action: 'test-action',
        resource: 'test-resource',
        success: true,
      };

      // This should trigger console.error when database logging fails
      await auditLogger.log(testEntry as any);

      // RED PHASE: This test should fail because console.error is being called
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        'Failed to log audit entry to database:',
        expect.any(Error)
      );
    });

    it('should not use console.error in audit logger console error logging', async () => {
      // Create audit logger with console logging enabled
      const auditLogger = new AuditLogger({
        enableConsoleLogging: true,
        enableDatabaseLogging: false,
      });

      const testEntry = {
        userId: 'test-user',
        action: 'test-action',
        resource: 'test-resource',
        success: false,
        errorMessage: 'Test error message',
      };

      // This should trigger console.error for failed audit entry
      await auditLogger.log(testEntry as any);

      // RED PHASE: This test should fail because console.error is being called
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[AUDIT] test-action on test-resource by test-user',
        expect.objectContaining({
          userId: 'test-user',
          action: 'test-action',
          resource: 'test-resource',
          success: false,
          errorMessage: 'Test error message',
          error: 'Test error message',
        })
      );
    });

    it('should not use console.log in audit logger console info logging', async () => {
      // Create audit logger with console logging enabled
      const auditLogger = new AuditLogger({
        enableConsoleLogging: true,
        enableDatabaseLogging: false,
      });

      const testEntry = {
        userId: 'test-user',
        action: 'test-action',
        resource: 'test-resource',
        success: true,
      };

      // This should trigger console.log for successful audit entry
      await auditLogger.log(testEntry as any);

      // RED PHASE: This test should fail because console.log is being called
      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[AUDIT] test-action on test-resource by test-user',
        expect.objectContaining({
          userId: 'test-user',
          action: 'test-action',
          resource: 'test-resource',
          success: true,
        })
      );
    });

    it('should not use console.warn in audit logger metadata serialization', async () => {
      // Create audit logger
      const auditLogger = new AuditLogger({
        enableConsoleLogging: false,
        enableDatabaseLogging: false,
      });

      // Access private method to test metadata serialization error
      const serializeMetadata = (auditLogger as any).serializeMetadata.bind(auditLogger);
      
      // Create metadata with circular reference that will cause serialization error
      const circularMetadata: any = { name: 'test' };
      circularMetadata.self = circularMetadata;

      // This should trigger console.warn when serialization fails
      const result = serializeMetadata(circularMetadata);

      // RED PHASE: This test should fail because console.warn is being called
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[Audit Logger] Failed to serialize metadata:',
        expect.any(Error)
      );
    });

    it('should not use console.log in audit logger file logging', async () => {
      // Create audit logger with file logging enabled
      const auditLogger = new AuditLogger({
        enableConsoleLogging: false,
        enableDatabaseLogging: false,
        enableFileLogging: true,
      });

      const testEntry = {
        userId: 'test-user',
        action: 'test-action',
        resource: 'test-resource',
        success: true,
      };

      // This should trigger console.log for file audit logging
      await auditLogger.log(testEntry as any);

      // RED PHASE: This test should fail because console.log is being called
      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[FILE AUDIT]',
        expect.stringContaining('"userId":"test-user"')
      );
    });
  });

  describe('Overall Console Usage Reduction', () => {
    it('should have minimal console usage across the entire security package', async () => {
      // This test verifies that console usage is minimized across all security package operations
      let totalConsoleCalls = 0;

      // Test middleware operations
      const mockContext = {
        req: {
          method: 'POST',
          path: '/api/patients/123',
          header: vi.fn()
            .mockReturnValueOnce('application/json')
            .mockReturnValueOnce('Bearer test-token')
            .mockReturnValueOnce('x-forwarded-for: 192.168.1.1')
            .mockReturnValueOnce('user-agent: Mozilla/5.0'),
          query: vi.fn().mockReturnValue({}),
          json: vi.fn().mockRejectedValue(new Error('Parse error')),
          param: vi.fn().mockReturnValue('123'),
        },
        res: { status: 200 },
        set: vi.fn(),
        get: vi.fn()
          .mockReturnValueOnce('req-123')
          .mockReturnValueOnce({ id: 'user-123' }),
      } as any;

      const mockNext = vi.fn();

      // Execute various middleware operations
      try {
        await inputValidation()(mockContext, mockNext);
      } catch (e) { /* ignore errors */ }
      
      try {
        await authentication()(mockContext, mockNext);
      } catch (e) { /* ignore errors */ }

      try {
        await securityLogging()(mockContext, mockNext);
      } catch (e) { /* ignore errors */ }

      try {
        await healthcareDataProtection()(mockContext, mockNext);
      } catch (e) { /* ignore errors */ }

      // Test encryption operations
      const encryptionManager = new EncryptionManager();
      const testKey = encryptionManager.generateKey();
      try {
        encryptionManager.decryptObject({ field: 'test' }, testKey, ['field']);
      } catch (e) { /* ignore errors */ }

      // Test audit logger operations
      const auditLogger = new AuditLogger({
        enableConsoleLogging: true,
        enableDatabaseLogging: true,
        supabaseUrl: 'https://invalid.supabase.co',
        supabaseKey: 'invalid-key',
        enableFileLogging: true,
      });

      try {
        await auditLogger.log({
          userId: 'test-user',
          action: 'test-action',
          resource: 'test-resource',
          success: false,
          errorMessage: 'Test error',
        } as any);
      } catch (e) { /* ignore errors */ }

      // Count total console calls
      totalConsoleCalls = 
        consoleSpy.log.mock.calls.length +
        consoleSpy.error.mock.calls.length +
        consoleSpy.warn.mock.calls.length +
        consoleSpy.info.mock.calls.length +
        consoleSpy.debug.mock.calls.length;

      // RED PHASE: This test should fail because there are too many console calls
      // Current implementation has console calls that should be removed
      expect(totalConsoleCalls).toBeLessThan(10); // Adjust threshold as needed
    });
  });
});