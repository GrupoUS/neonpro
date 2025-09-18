import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuditService } from '../audit-service';
import type { MedicalDataClassification } from '@neonpro/types';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  rpc: vi.fn(),
};

const mockAuditLogData = {
  sessionId: 'session-123',
  eventType: 'video-call-start',
  userId: 'user-123',
  userRole: 'patient',
  dataClassification: 'general-medical' as MedicalDataClassification,
  description: 'Patient started video call',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  clinicId: 'clinic-456',
  metadata: { sessionDuration: 1800 }
};

const mockAuditLogResponse = {
  id: 'audit-123',
  session_id: 'session-123',
  event_type: 'video-call-start',
  timestamp: new Date().toISOString(),
  user_id: 'user-123',
  user_role: 'patient',
  data_classification: 'general-medical',
  description: 'Patient started video call',
  ip_address: '192.168.1.1',
  user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  clinic_id: 'clinic-456',
  metadata: { sessionDuration: 1800 },
  compliance_check: {
    isCompliant: true,
    violations: [],
    riskLevel: 'low'
  }
};

describe('AuditService', () => {
  let auditService: AuditService;
  let mockFrom: any;
  let mockSelect: any;
  let mockEq: any;
  let mockOrder: any;
  let mockGte: any;
  let mockLte: any;
  let mockIn: any;
  let mockLimit: any;

  beforeEach(() => {
    // Setup mock chain
    mockLimit = vi.fn().mockReturnThis();
    mockIn = vi.fn().mockReturnThis();
    mockLte = vi.fn().mockReturnThis();
    mockGte = vi.fn().mockReturnThis();
    mockOrder = vi.fn().mockReturnThis();
    mockEq = vi.fn().mockReturnThis();
    mockSelect = vi.fn().mockReturnThis();
    const mockInsert = vi.fn().mockReturnThis();
    
    mockFrom = vi.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      eq: mockEq,
      order: mockOrder,
      gte: mockGte,
      lte: mockLte,
      in: mockIn,
      limit: mockLimit
    });

    mockSupabaseClient.from = mockFrom;
    mockSupabaseClient.rpc = vi.fn();

    // Setup chaining
    mockSelect.eq = mockEq;
    mockInsert.select = mockSelect;
    mockInsert.single = vi.fn();
    mockEq.order = mockOrder;
    mockEq.gte = mockGte;
    mockEq.lte = mockLte;
    mockEq.in = mockIn;
    mockEq.eq = mockEq;
    mockOrder.eq = mockEq;
    mockOrder.gte = mockGte;
    mockOrder.lte = mockLte;
    mockOrder.in = mockIn;
    mockOrder.limit = mockLimit;
    mockGte.lte = mockLte;
    mockGte.eq = mockEq;
    mockGte.in = mockIn;
    mockGte.limit = mockLimit;
    mockLte.eq = mockEq;
    mockLte.in = mockIn;
    mockLte.limit = mockLimit;
    mockIn.eq = mockEq;
    mockIn.limit = mockLimit;

    auditService = new AuditService(mockSupabaseClient as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createAuditLog', () => {
    it('should successfully log an audit event', async () => {
      const mockSingle = vi.fn().mockResolvedValueOnce({
        data: { id: 'audit-123' },
        error: null
      });

      // Mock the insert chain
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: mockSingle
        })
      });

      mockFrom.mockReturnValueOnce({
        insert: mockInsert
      });

      const result = await auditService.createAuditLog(mockAuditLogData);

      expect(result).toBe('audit-123');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('audit_logs');
      expect(mockInsert).toHaveBeenCalledWith({
        action: 'video-call-start',
        user_id: 'user-123',
        resource: 'Patient started video call',
        resource_type: 'session',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        clinic_id: 'clinic-456',
        lgpd_basis: null,
        old_values: null,
        new_values: null
      });
    });

    it('should handle missing optional fields', async () => {
      const mockSingle = vi.fn().mockResolvedValueOnce({
        data: { id: 'audit-124' },
        error: null
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: mockSingle
        })
      });

      mockFrom.mockReturnValueOnce({
        insert: mockInsert
      });

      const minimalData = {
        sessionId: 'session-123',
        eventType: 'video-call-start',
        userId: 'user-123',
        userRole: 'patient' as const,
        dataClassification: 'general-medical' as MedicalDataClassification,
        description: 'Patient started video call'
      };

      const result = await auditService.createAuditLog(minimalData);

      expect(result).toBe('audit-124');
      expect(mockInsert).toHaveBeenCalledWith({
        action: 'video-call-start',
        user_id: 'user-123',
        resource: 'Patient started video call',
        resource_type: 'session',
        ip_address: 'unknown',
        user_agent: 'unknown',
        clinic_id: undefined,
        lgpd_basis: null,
        old_values: null,
        new_values: null
      });
    });

    it('should throw error when insert fails', async () => {
      const mockSingle = vi.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' }
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: mockSingle
        })
      });

      mockFrom.mockReturnValueOnce({
        insert: mockInsert
      });

      await expect(
        auditService.createAuditLog(mockAuditLogData)
      ).rejects.toThrow('Failed to create audit log: Database error');
    });

    it('should handle network errors', async () => {
      const mockInsert = vi.fn().mockImplementation(() => {
        throw new Error('Network connection failed');
      });

      mockFrom.mockReturnValueOnce({
        insert: mockInsert
      });

      await expect(
        auditService.createAuditLog(mockAuditLogData)
      ).rejects.toThrow('Network connection failed');
    });
  });

  describe('getSessionAuditLogs', () => {
    it('should retrieve audit logs for a session', async () => {
      mockOrder.mockResolvedValueOnce({
        data: [mockAuditLogResponse],
        error: null
      });

      const result = await auditService.getSessionAuditLogs('session-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'audit-123',
        sessionId: 'session-123',
        eventType: 'video-call-start',
        timestamp: expect.any(String),
        userId: 'user-123',
        userRole: 'patient',
        dataClassification: 'general-medical',
        description: 'Patient started video call'
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('webrtc_audit_logs');
      expect(mockEq).toHaveBeenCalledWith('session_id', 'session-123');
      expect(mockOrder).toHaveBeenCalledWith('timestamp', { ascending: false });
    });

    it('should return empty array when no logs found', async () => {
      mockOrder.mockResolvedValueOnce({
        data: [],
        error: null
      });

      const result = await auditService.getSessionAuditLogs('nonexistent-session');

      expect(result).toEqual([]);
    });

    it('should return empty array when query fails', async () => {
      mockOrder.mockResolvedValueOnce({
        data: null,
        error: { message: 'Query failed' }
      });

      const result = await auditService.getSessionAuditLogs('session-123');

      expect(result).toEqual([]);
    });
  });

  describe('getUserAuditLogs', () => {
    it('should retrieve audit logs for a user', async () => {
      mockOrder.mockResolvedValueOnce({
        data: [mockAuditLogResponse],
        error: null
      });

      const result = await auditService.getUserAuditLogs('user-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'audit-123',
        userId: 'user-123',
        userRole: 'patient'
      });

      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('should limit results when specified', async () => {
      mockLimit.mockResolvedValueOnce({
        data: [mockAuditLogResponse],
        error: null
      });

      await auditService.getUserAuditLogs('user-123', 50);

      expect(mockLimit).toHaveBeenCalledWith(50);
    });

    it('should return empty array when no logs found', async () => {
      mockOrder.mockResolvedValueOnce({
        data: [],
        error: null
      });

      const result = await auditService.getUserAuditLogs('nonexistent-user');

      expect(result).toEqual([]);
    });
  });

  describe('getAuditLogsByDateRange', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    it('should retrieve audit logs for date range', async () => {
      mockLte.mockResolvedValueOnce({
        data: [mockAuditLogResponse],
        error: null
      });

      const result = await auditService.getAuditLogsByDateRange(startDate, endDate);

      expect(result).toHaveLength(1);
      expect(mockGte).toHaveBeenCalledWith('timestamp', startDate.toISOString());
      expect(mockLte).toHaveBeenCalledWith('timestamp', endDate.toISOString());
    });

    it('should filter by clinic when specified', async () => {
      mockLte.mockResolvedValueOnce({
        data: [mockAuditLogResponse],
        error: null
      });

      await auditService.getAuditLogsByDateRange(startDate, endDate, 'clinic-456');

      expect(mockEq).toHaveBeenCalledWith('clinic_id', 'clinic-456');
    });

    it('should limit results when specified', async () => {
      mockLimit.mockResolvedValueOnce({
        data: [mockAuditLogResponse],
        error: null
      });

      await auditService.getAuditLogsByDateRange(startDate, endDate, undefined, 100);

      expect(mockLimit).toHaveBeenCalledWith(100);
    });

    it('should return empty array when query fails', async () => {
      mockLte.mockResolvedValueOnce({
        data: null,
        error: { message: 'Query failed' }
      });

      const result = await auditService.getAuditLogsByDateRange(startDate, endDate);

      expect(result).toEqual([]);
    });
  });

  describe('getComplianceReport', () => {
    const mockComplianceData = [
      { ...mockAuditLogResponse, compliance_check: { isCompliant: true, violations: [], riskLevel: 'low' } },
      { ...mockAuditLogResponse, id: 'audit-124', compliance_check: { isCompliant: false, violations: ['MISSING_CONSENT'], riskLevel: 'high' } }
    ];

    it('should generate compliance report for date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockLte.mockResolvedValueOnce({
        data: mockComplianceData,
        error: null
      });

      const result = await auditService.getComplianceReport(startDate, endDate);

      expect(result).toMatchObject({
        reportPeriod: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        summary: {
          totalEvents: 2,
          compliantEvents: 1,
          nonCompliantEvents: 1,
          complianceRate: 0.5
        },
        riskLevels: {
          low: 1,
          medium: 0,
          high: 1,
          critical: 0
        },
        violations: {
          MISSING_CONSENT: 1
        },
        recommendations: expect.any(Array)
      });
    });

    it('should filter by clinic when specified', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockLte.mockResolvedValueOnce({
        data: mockComplianceData,
        error: null
      });

      await auditService.getComplianceReport(startDate, endDate, 'clinic-456');

      expect(mockEq).toHaveBeenCalledWith('clinic_id', 'clinic-456');
    });

    it('should handle empty dataset', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockLte.mockResolvedValueOnce({
        data: [],
        error: null
      });

      const result = await auditService.getComplianceReport(startDate, endDate);

      expect(result.summary.totalEvents).toBe(0);
      expect(result.summary.complianceRate).toBe(1); // 100% compliant when no events
    });

    it('should throw error when query fails', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockLte.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });

      await expect(
        auditService.getComplianceReport(startDate, endDate)
      ).rejects.toThrow('Failed to generate compliance report: Database error');
    });
  });

  describe('searchAuditLogs', () => {
    const searchCriteria = {
      sessionIds: ['session-123', 'session-456'],
      userIds: ['user-123'],
      eventTypes: ['video-call-start', 'video-call-end'],
      dataClassifications: ['general-medical'] as MedicalDataClassification[],
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    };

    it('should search audit logs with all criteria', async () => {
      mockLimit.mockResolvedValueOnce({
        data: [mockAuditLogResponse],
        error: null
      });

      const result = await auditService.searchAuditLogs(searchCriteria);

      expect(result).toHaveLength(1);
      expect(mockIn).toHaveBeenCalledWith('session_id', ['session-123', 'session-456']);
      expect(mockIn).toHaveBeenCalledWith('user_id', ['user-123']);
      expect(mockIn).toHaveBeenCalledWith('event_type', ['video-call-start', 'video-call-end']);
      expect(mockIn).toHaveBeenCalledWith('data_classification', ['general-medical']);
      expect(mockGte).toHaveBeenCalledWith('timestamp', searchCriteria.startDate.toISOString());
      expect(mockLte).toHaveBeenCalledWith('timestamp', searchCriteria.endDate.toISOString());
    });

    it('should search with partial criteria', async () => {
      const partialCriteria = {
        userIds: ['user-123'],
        eventTypes: ['video-call-start']
      };

      mockLimit.mockResolvedValueOnce({
        data: [mockAuditLogResponse],
        error: null
      });

      const result = await auditService.searchAuditLogs(partialCriteria);

      expect(result).toHaveLength(1);
      expect(mockIn).toHaveBeenCalledWith('user_id', ['user-123']);
      expect(mockIn).toHaveBeenCalledWith('event_type', ['video-call-start']);
      expect(mockGte).not.toHaveBeenCalled(); // No date filtering
    });

    it('should limit results when specified', async () => {
      mockLimit.mockResolvedValueOnce({
        data: [mockAuditLogResponse],
        error: null
      });

      await auditService.searchAuditLogs(searchCriteria, 50);

      expect(mockLimit).toHaveBeenCalledWith(50);
    });

    it('should return empty array when no matches found', async () => {
      mockLimit.mockResolvedValueOnce({
        data: [],
        error: null
      });

      const result = await auditService.searchAuditLogs(searchCriteria);

      expect(result).toEqual([]);
    });

    it('should return empty array when query fails', async () => {
      mockLimit.mockResolvedValueOnce({
        data: null,
        error: { message: 'Search failed' }
      });

      const result = await auditService.searchAuditLogs(searchCriteria);

      expect(result).toEqual([]);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle malformed compliance check data', async () => {
      const malformedData = [{
        ...mockAuditLogResponse,
        compliance_check: null
      }];

      mockLte.mockResolvedValueOnce({
        data: malformedData,
        error: null
      });

      const result = await auditService.getComplianceReport(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      // Should handle null compliance_check gracefully
      expect(result.summary.totalEvents).toBe(1);
      expect(result.summary.nonCompliantEvents).toBe(1); // Treated as non-compliant
    });

    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...mockAuditLogResponse,
        id: `audit-${i}`,
        compliance_check: {
          isCompliant: i % 2 === 0,
          violations: i % 2 === 0 ? [] : ['VIOLATION'],
          riskLevel: 'low'
        }
      }));

      mockLte.mockResolvedValueOnce({
        data: largeDataset,
        error: null
      });

      const result = await auditService.getComplianceReport(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result.summary.totalEvents).toBe(1000);
      expect(result.summary.complianceRate).toBe(0.5);
    });

    it('should handle network timeouts gracefully', async () => {
      mockSupabaseClient.rpc.mockRejectedValueOnce(new Error('Request timeout'));

      await expect(
        auditService.logEvent(mockAuditLogData)
      ).rejects.toThrow('Request timeout');
    });
  });
});