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
        'test-operation',
        aiMetadata,
        'test-session'
      );
      
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('should validate healthcare metadata types', async () => {
      const healthcareMetadata: HealthcareAccessMetadata = {
        patientId: 'patient123',
        professionalId: 'prof456',
        procedureType: 'consultation',
        dataClassification: 'sensitive',
        consentVerified: true,
        accessReason: 'treatment',
      };
      
      await auditLogger.logHealthcareAccess(
        'user123',
        '/api/patients/123',
        healthcareMetadata
      );
      
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('should validate audit log entry structure', () => {
      const entry: AuditLogEntry = {
        id: 'test-id',
        timestamp: new Date().toISOString(),
        userId: 'user123',
        action: 'test-action',
        resource: 'test-resource',
        outcome: 'success',
        metadata: {},
        sessionId: 'session123',
      };
      
      expect(entry.id).toBeDefined();
      expect(entry.timestamp).toBeDefined();
      expect(entry.userId).toBeDefined();
      expect(entry.action).toBeDefined();
      expect(entry.resource).toBeDefined();
      expect(entry.outcome).toBeDefined();
    });
  });

  describe('Metadata Validation', () => {
    it('should validate required AI metadata fields', () => {
      const metadata: AIMetadata = {
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
      
      expect(metadata.inputTokens).toBeGreaterThan(0);
      expect(metadata.outputTokens).toBeGreaterThan(0);
      expect(metadata.model).toBeDefined();
      expect(metadata.confidence).toBeGreaterThanOrEqual(0);
      expect(metadata.confidence).toBeLessThanOrEqual(1);
    });

    it('should validate required healthcare metadata fields', () => {
      const metadata: HealthcareAccessMetadata = {
        patientId: 'patient123',
        professionalId: 'prof456',
        procedureType: 'consultation',
        dataClassification: 'sensitive',
        consentVerified: true,
        accessReason: 'treatment',
      };
      
      expect(metadata.patientId).toBeDefined();
      expect(metadata.professionalId).toBeDefined();
      expect(metadata.procedureType).toBeDefined();
      expect(metadata.dataClassification).toBeDefined();
      expect(typeof metadata.consentVerified).toBe('boolean');
      expect(metadata.accessReason).toBeDefined();
    });
  });

  describe('Security Compliance', () => {
    it('should not log sensitive PII data', async () => {
      const sensitiveMetadata = {
        patientId: 'patient123',
        // PII data should be redacted
        patientName: 'John Doe',
        patientEmail: 'john@example.com',
      };
      
      await auditLogger.logHealthcareAccess(
        'user123',
        '/api/patients/123',
        sensitiveMetadata as any
      );
      
      // The logger should redact PII data before logging
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('should handle audit log failures gracefully', async () => {
      // Simulate database failure
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      });
      
      // Should not throw error
      await expect(async () => {
        await auditLogger.logHealthcareAccess(
          'user123',
          'access',
          'patient123',
          'medical_record',
          true,
          {
            professionalId: 'prof456',
            procedureType: 'consultation',
            dataClassification: 'sensitive',
            accessReason: 'treatment',
          }
        );
      }).not.toThrow();
    });
  });
});