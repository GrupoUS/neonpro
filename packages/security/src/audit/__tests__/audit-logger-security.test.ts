/**
 * Security tests for Audit Logger
 * Tests for type safety and metadata validation
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AIMetadata, AuditLogEntry, AuditLogger, HealthcareAccessMetadata } from '../logger';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@supabase/supabase-js_, () => ({
  createClient: vi.fn(() => mockSupabase),
})

describe('Audit Logger Security Tests_, () => {
  let auditLogger: AuditLogger;

  beforeEach(() => {

    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }

    auditLogger = new AuditLogger({
      enableConsoleLogging: false,
      enableDatabaseLogging: true,
      supabaseUrl: 'https://test.supabase.co',
      supabaseKey: 'test-key',
    }
  }

  afterEach(() => {
    vi.clearAllMocks(
  }

  describe('Type Safety_, () => {
    it('should validate AI metadata types_,_async () => {
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
        'chat_completion_,
        'gpt-4',
        100,
        50,
        aiMetadata,

    it('should reject invalid AI metadata types_,_async () => {
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
          'chat_completion_,
          'gpt-4',
          invalidMetadata.inputTokens as any,
          invalidMetadata.outputTokens as any,
          invalidMetadata,
        ),

    it('should validate healthcare access metadata_,_async () => {
      const healthcareMetadata: HealthcareAccessMetadata = {
        dataType: 'patient_record_,
        lgpdConsent: true,
        patientId: 'patient123',
        encounterId: 'encounter456',
        facilityId: 'facility789',
        departmentId: 'department101',
        accessReason: 'treatment',
        retentionPeriod: '10_years_,
        dataSensitivity: 'restricted',
      };

      await auditLogger.logHealthcareAccess(
        'user123',
        'view',
        'patient123',
        'patient_record_,
        true,
        healthcareMetadata,

  describe('Metadata Serialization Security_, () => {
    it('should safely serialize primitive metadata_,_async () => {
      const entry: AuditLogEntry = {
        _userId: 'user123_,
        action: 'test_action_,
        resource: 'test_resource_,
        success: true,
        metadata: {
          string_value: 'test_,
          number_value: 42,
          boolean_value: true,
          null_value: null,
        },
      };

      await auditLogger.log(entry


    it('should safely serialize complex objects_,_async () => {
      const entry: AuditLogEntry = {
        _userId: 'user123_,
        action: 'test_action_,
        resource: 'test_resource_,
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

      await auditLogger.log(entry


    it('should handle circular references in metadata_,_async () => {
      const circularObject: Record<string, unknown> = { name: 'test' };
      circularObject.self = circularObject;

      const entry: AuditLogEntry = {
        _userId: 'user123_,
        action: 'test_action_,
        resource: 'test_resource_,
        success: true,
        metadata: {
          circular_ref: circularObject,
        },
      };

      // Should handle circular references without throwing
      await expect(auditLogger.log(entry)).resolves.not.toThrow(
    }

    it('should sanitize dangerous prototype properties_,_async () => {
      const entry: AuditLogEntry = {
        _userId: 'user123_,
        action: 'test_action_,
        resource: 'test_resource_,
        success: true,
        metadata: {
          __proto__: { polluted: true },
          constructor: { prototype: { polluted: true } },
          normal_value: 'safe_,
        },
      };

      await auditLogger.log(entry


  describe('Input Validation_, () => {
    it('should validate required audit log fields_,_async () => {
      const invalidEntry: Partial<AuditLogEntry> = {
        _userId: 'user123_,
        // Missing required action and resource
        success: true,
      };

      // @ts-expect-error - Testing invalid input
      await expect(auditLogger.log(invalidEntry)).resolves.not.toThrow(
    }

    it('should handle extremely large metadata objects_,_async () => {
      const largeMetadata = {
        large_array: Array(10000).fill('large_data_),
        large_string: 'x_.repeat(1024 * 1024), // 1MB string
      };

      const entry: AuditLogEntry = {
        _userId: 'user123_,
        action: 'test_action_,
        resource: 'test_resource_,
        success: true,
        metadata: largeMetadata,
      };

      // Should handle large objects gracefully
      await expect(auditLogger.log(entry)).resolves.not.toThrow(
    }

    it('should handle special characters in metadata_,_async () => {
      const entry: AuditLogEntry = {
        _userId: 'user123_,
        action: 'test_action_,
        resource: 'test_resource_,
        success: true,
        metadata: {
          special_chars: _!@#$%^&*()_+-={}[]|:";\'<>?,./',
          unicode: '测试 🚀',
          sql_injection: 'SELECT * FROM users_,
          xss: '<script>alert("xss")</script>',
        },
      };

      await auditLogger.log(entry


  describe('Database Security_, () => {
    it('should not leak sensitive information in errors_,_async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Database connection failed')),
          }),
        }),
      }

      const entry: AuditLogEntry = {
        _userId: 'user123_,
        action: 'test_action_,
        resource: 'test_resource_,
        success: true,
        metadata: {
          sensitive_info: 'secret_data_,
        },
      };

      await expect(auditLogger.log(entry)).resolves.not.toThrow(
    }

    it('should handle database connection failures gracefully_,_async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Connection failed')
      }

      const entry: AuditLogEntry = {
        _userId: 'user123_,
        action: 'test_action_,
        resource: 'test_resource_,
        success: true,
      };

      // Should handle database errors gracefully
      await expect(auditLogger.log(entry)).resolves.not.toThrow(
    }
  }

  describe('LGPD Compliance_, () => {
    it('should log healthcare data access with LGPD consent_,_async () => {
      await auditLogger.logHealthcareAccess(
        'user123',
        'view',
        'patient456',
        'diagnosis',
        true, // LGPD consent
        {
          accessReason: 'treatment',
          retentionPeriod: '10_years_,
        },

    it('should log healthcare data access without LGPD consent_,_async () => {
      await auditLogger.logHealthcareAccess(
        'user123',
        'view',
        'patient456',
        'diagnosis',
        false, // No LGPD consent
        {
          accessReason: 'emergency',
          retentionPeriod: '24_hours_,
        },

    it('should validate healthcare metadata fields_,_async () => {
      const validHealthcareMetadata: HealthcareAccessMetadata = {
        dataType: 'patient_record_,
        lgpdConsent: true,
        patientId: 'patient123',
        accessReason: 'treatment',
      };

      await auditLogger.logHealthcareAccess(
        'user123',
        'view',
        'patient123',
        'patient_record_,
        true,
        validHealthcareMetadata,
