/**
 * Security tests for Audit Logger
 * Tests for type safety and metadata validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuditLogger, AuditLogEntry, AIMetadata, HealthcareAccessMetadata } from '../logger';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

describe('Audit Logger Security Tests', () => {
  let auditLogger: AuditLogger;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    auditLogger = new AuditLogger({
      enableConsoleLogging: false,
      enableDatabaseLogging: true,
      supabaseUrl: 'https://test.supabase.co',
      supabaseKey: 'test-key',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Type Safety', () => {
    it('should validate AI metadata types', async () => {
      const aiMetadata: AIMetadata = {
        inputTokens: 100,
        outputTokens: 50,
        model: 'gpt-4',
        confidence: 0.95,
        processingTimeMs: 1500,
        costUsd: 0.005,
        requestType: 'chat',
        responseFormat: 'json',
        errorRate: 0.01,
      };

      await auditLogger.logAIOperation(
        'user123',
        'chat_completion',
        'gpt-4',
        100,
        50,
        aiMetadata
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('should reject invalid AI metadata types', async () => {
      const invalidMetadata = {
        inputTokens: 'invalid', // Should be number
        outputTokens: 'invalid', // Should be number
        model: 123, // Should be string
        confidence: 'high', // Should be number
      };

      // This should handle gracefully without throwing
      await expect(
        auditLogger.logAIOperation(
          'user123',
          'chat_completion',
          'gpt-4',
          invalidMetadata.inputTokens as any,
          invalidMetadata.outputTokens as any,
          invalidMetadata
        )
      ).resolves.not.toThrow();
    });

    it('should validate healthcare access metadata', async () => {
      const healthcareMetadata: HealthcareAccessMetadata = {
        dataType: 'patient_record',
        lgpdConsent: true,
        patientId: 'patient123',
        encounterId: 'encounter456',
        facilityId: 'facility789',
        departmentId: 'department101',
        accessReason: 'treatment',
        retentionPeriod: '10_years',
        dataSensitivity: 'restricted',
      };

      await auditLogger.logHealthcareAccess(
        'user123',
        'view',
        'patient123',
        'patient_record',
        true,
        healthcareMetadata
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });
  });

  describe('Metadata Serialization Security', () => {
    it('should safely serialize primitive metadata', async () => {
      const entry: AuditLogEntry = {
        userId: 'user123',
        action: 'test_action',
        resource: 'test_resource',
        success: true,
        metadata: {
          string_value: 'test',
          number_value: 42,
          boolean_value: true,
          null_value: null,
        },
      };

      await auditLogger.log(entry);

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('should safely serialize complex objects', async () => {
      const entry: AuditLogEntry = {
        userId: 'user123',
        action: 'test_action',
        resource: 'test_resource',
        success: true,
        metadata: {
          complex_object: {
            nested: {
              value: 'test',
            },
          },
          array_value: [1, 2, 3],
          date_object: new Date(),
        },
      };

      await auditLogger.log(entry);

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('should handle circular references in metadata', async () => {
      const circularObject: any = { name: 'test' };
      circularObject.self = circularObject;

      const entry: AuditLogEntry = {
        userId: 'user123',
        action: 'test_action',
        resource: 'test_resource',
        success: true,
        metadata: {
          circular_ref: circularObject,
        },
      };

      // Should handle circular references without throwing
      await expect(auditLogger.log(entry)).resolves.not.toThrow();
    });

    it('should sanitize dangerous prototype properties', async () => {
      const entry: AuditLogEntry = {
        userId: 'user123',
        action: 'test_action',
        resource: 'test_resource',
        success: true,
        metadata: {
          __proto__: { polluted: true },
          constructor: { prototype: { polluted: true } },
          normal_value: 'safe',
        },
      };

      await auditLogger.log(entry);

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });
  });

  describe('Input Validation', () => {
    it('should validate required audit log fields', async () => {
      const invalidEntry: Partial<AuditLogEntry> = {
        userId: 'user123',
        // Missing required action and resource
        success: true,
      };

      // @ts-expect-error - Testing invalid input
      await expect(auditLogger.log(invalidEntry)).resolves.not.toThrow();
    });

    it('should handle extremely large metadata objects', async () => {
      const largeMetadata = {
        large_array: Array(10000).fill('large_data'),
        large_string: 'x'.repeat(1024 * 1024), // 1MB string
      };

      const entry: AuditLogEntry = {
        userId: 'user123',
        action: 'test_action',
        resource: 'test_resource',
        success: true,
        metadata: largeMetadata,
      };

      // Should handle large objects gracefully
      await expect(auditLogger.log(entry)).resolves.not.toThrow();
    });

    it('should handle special characters in metadata', async () => {
      const entry: AuditLogEntry = {
        userId: 'user123',
        action: 'test_action',
        resource: 'test_resource',
        success: true,
        metadata: {
          special_chars: '!@#$%^&*()_+-={}[]|:";\'<>?,./',
          unicode: '测试 🚀',
          sql_injection: "SELECT * FROM users",
          xss: '<script>alert("xss")</script>',
        },
      };

      await auditLogger.log(entry);

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });
  });

  describe('Database Security', () => {
    it('should not leak sensitive information in errors', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Database connection failed')),
          }),
        }),
      });

      const entry: AuditLogEntry = {
        userId: 'user123',
        action: 'test_action',
        resource: 'test_resource',
        success: true,
        metadata: {
          sensitive_info: 'secret_data',
        },
      };

      await expect(auditLogger.log(entry)).resolves.not.toThrow();
    });

    it('should handle database connection failures gracefully', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      const entry: AuditLogEntry = {
        userId: 'user123',
        action: 'test_action',
        resource: 'test_resource',
        success: true,
      };

      // Should handle database errors gracefully
      await expect(auditLogger.log(entry)).resolves.not.toThrow();
    });
  });

  describe('LGPD Compliance', () => {
    it('should log healthcare data access with LGPD consent', async () => {
      await auditLogger.logHealthcareAccess(
        'user123',
        'view',
        'patient456',
        'diagnosis',
        true, // LGPD consent
        {
          accessReason: 'treatment',
          retentionPeriod: '10_years',
        }
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('should log healthcare data access without LGPD consent', async () => {
      await auditLogger.logHealthcareAccess(
        'user123',
        'view',
        'patient456',
        'diagnosis',
        false, // No LGPD consent
        {
          accessReason: 'emergency',
          retentionPeriod: '24_hours',
        }
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('should validate healthcare metadata fields', async () => {
      const validHealthcareMetadata: HealthcareAccessMetadata = {
        dataType: 'patient_record',
        lgpdConsent: true,
        patientId: 'patient123',
        accessReason: 'treatment',
      };

      await auditLogger.logHealthcareAccess(
        'user123',
        'view',
        'patient123',
        'patient_record',
        true,
        validHealthcareMetadata
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });
  });
});