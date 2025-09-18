import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditService } from '../services/audit-service';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
} as any;

describe('AuditService - Database Schema Compliance', () => {
  let auditService: AuditService;

  beforeEach(() => {
    vi.clearAllMocks();
    auditService = new AuditService(mockSupabase);
  });

  describe('createAuditLog', () => {
    it('should create audit log with correct database schema', async () => {
      // Arrange
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'test-audit-id' },
            error: null,
          }),
        }),
      });

      mockSupabase.from = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      const auditRequest = {
        sessionId: 'test-session-id',
        eventType: 'session-start' as const,
        userId: 'test-user-id',
        userRole: 'doctor' as const,
        dataClassification: 'internal' as const,
        description: 'Test audit log',
        clinicId: 'test-clinic-id',
        metadata: { test: 'data' },
      };

      // Act
      const result = await auditService.createAuditLog(auditRequest);

      // Assert
      expect(result).toBe('test-audit-id');
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
      expect(mockInsert).toHaveBeenCalledWith({
        action: 'session-start',
        user_id: 'test-user-id',
        resource: 'Test audit log',
        resource_type: 'session',
        clinic_id: 'test-clinic-id',
        old_values: null,
        new_values: null,
        lgpd_basis: null,
        ip_address: 'unknown',
        user_agent: 'unknown',
      });
    });

    it('should handle audit log creation errors', async () => {
      // Arrange
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      mockSupabase.from = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      const auditRequest = {
        sessionId: 'test-session-id',
        eventType: 'session-start' as const,
        userId: 'test-user-id',
        userRole: 'doctor' as const,
        dataClassification: 'internal' as const,
        description: 'Test audit log',
        clinicId: 'test-clinic-id',
      };

      // Act & Assert
      await expect(auditService.createAuditLog(auditRequest)).rejects.toThrow(
        'Failed to create audit log: Database error',
      );
    });
  });

  describe('getSessionAuditLogs', () => {
    it('should retrieve audit logs and map to RTCAuditLogEntry format', async () => {
      // Arrange
      const mockAuditLogs = [
        {
          id: 'audit-log-1',
          action: 'session-start',
          user_id: 'user-1',
          created_at: '2023-01-01T00:00:00Z',
          resource_type: 'session',
          resource_id: 'session-1', // This is the session ID
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          clinic_id: 'clinic-1',
          lgpd_basis: 'consent',
          old_values: null,
          new_values: null,
        },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockAuditLogs,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      // Act
      const result = await auditService.getSessionAuditLogs('session-1', 'clinic-1');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'audit-log-1',
        sessionId: 'session-1',
        eventType: 'session-start',
        timestamp: '2023-01-01T00:00:00Z',
        userId: 'user-1',
        userRole: 'patient',
        dataClassification: 'internal',
        description: 'session', // resource_type from database
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        clinicId: 'clinic-1',
        metadata: {
          lgpd_basis: 'consent',
          old_values: null,
          new_values: null,
        },
        complianceCheck: {
          isCompliant: true,
          violations: [],
          riskLevel: 'low',
        },
      });
    });

    it('should handle empty audit logs', async () => {
      // Arrange
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      // Act
      const result = await auditService.getSessionAuditLogs('session-1', 'clinic-1');

      // Assert
      expect(result).toHaveLength(0);
    });
  });
});