/**
 * Tests for GET /api/v2/patients/{id}/history endpoint (T050)
 * Following TDD methodology - MUST FAIL FIRST
 * Integration with AuditService, LGPDService for patient history
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { Hono } from 'hono';

// Mock the Backend Services
const mockAuditService = {
  getPatientHistory: vi.fn(),
  logHistoryAccess: vi.fn(),
};

const mockLGPDService = {
  validateHistoryAccess: vi.fn(),
  maskHistoryData: vi.fn(),
};

const mockPatientService = {
  validatePatientExists: vi.fn(),
};

describe('GET /api/v2/patients/{id}/history endpoint (T050)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful service responses by default
    mockAuditService.getPatientHistory.mockResolvedValue({
      success: true,
      data: {
        patientId: 'patient-123',
        timeline: [
          {
            id: 'event-1',
            timestamp: '2024-01-15T10:30:00Z',
            eventType: 'patient_created',
            category: 'data_change',
            severity: 'info',
            actor: {
              userId: 'user-456',
              name: 'Dr. João Silva',
              role: 'healthcare_professional',
              crm: 'CRM-SP-123456',
            },
            details: {
              action: 'create',
              resourceType: 'patient',
              changes: {
                name: { new: 'Maria Santos' },
                email: { new: 'maria@example.com' },
                status: { new: 'active' },
              },
            },
            metadata: {
              ipAddress: '192.168.1.100',
              userAgent: 'Mozilla/5.0',
              sessionId: 'session-789',
            },
          },
          {
            id: 'event-2',
            timestamp: '2024-01-15T14:20:00Z',
            eventType: 'patient_updated',
            category: 'data_change',
            severity: 'info',
            actor: {
              userId: 'user-456',
              name: 'Dr. João Silva',
              role: 'healthcare_professional',
              crm: 'CRM-SP-123456',
            },
            details: {
              action: 'update',
              resourceType: 'patient',
              changes: {
                phone: {
                  old: '(11) 99999-9999',
                  new: '(11) 88888-8888',
                },
                address: {
                  old: 'Rua A, 123',
                  new: 'Rua B, 456',
                },
              },
            },
            metadata: {
              ipAddress: '192.168.1.100',
              userAgent: 'Mozilla/5.0',
              sessionId: 'session-789',
            },
          },
          {
            id: 'event-3',
            timestamp: '2024-01-16T09:15:00Z',
            eventType: 'lgpd_consent_updated',
            category: 'consent_change',
            severity: 'high',
            actor: {
              userId: 'patient-123',
              name: 'Maria Santos',
              role: 'data_subject',
            },
            details: {
              action: 'consent_update',
              resourceType: 'lgpd_consent',
              changes: {
                marketingConsent: {
                  old: true,
                  new: false,
                },
                consentDate: {
                  new: '2024-01-16T09:15:00Z',
                },
              },
            },
            complianceContext: 'LGPD',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          totalPages: 1,
        },
        summary: {
          totalEvents: 3,
          eventTypes: {
            patient_created: 1,
            patient_updated: 1,
            lgpd_consent_updated: 1,
          },
          dateRange: {
            earliest: '2024-01-15T10:30:00Z',
            latest: '2024-01-16T09:15:00Z',
          },
        },
      },
    });

    mockAuditService.logHistoryAccess.mockResolvedValue({
      success: true,
      data: { auditId: 'history-audit-123' },
    });

    mockLGPDService.validateHistoryAccess.mockResolvedValue({
      success: true,
      data: { canAccess: true, accessLevel: 'full' },
    });

    mockLGPDService.maskHistoryData.mockImplementation((data) => data);

    mockPatientService.validatePatientExists.mockResolvedValue({
      success: true,
      data: { exists: true, patientId: 'patient-123' },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should export patient history route handler', () => {
    expect(() => {
      const module = require('../history');
      expect(module.default).toBeDefined();
    }).not.toThrow();
  });

  describe('Successful Patient History Retrieval', () => {
    it('should retrieve patient history with default parameters', async () => {
      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.patientId).toBe('patient-123');
      expect(Array.isArray(data.data.timeline)).toBe(true);
      expect(data.data.timeline).toHaveLength(3);
      expect(data.data.pagination).toBeDefined();
      expect(data.data.summary).toBeDefined();
    });

    it('should retrieve patient history with pagination', async () => {
      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history?page=2&limit=10',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockAuditService.getPatientHistory).toHaveBeenCalledWith({
        patientId: 'patient-123',
        userId: 'user-123',
        pagination: { page: 2, limit: 10 },
        filters: {},
      });
    });

    it('should retrieve patient history with event type filters', async () => {
      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history?eventTypes=patient_updated,lgpd_consent_updated',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockAuditService.getPatientHistory).toHaveBeenCalledWith({
        patientId: 'patient-123',
        userId: 'user-123',
        pagination: { page: 1, limit: 20 },
        filters: {
          eventTypes: ['patient_updated', 'lgpd_consent_updated'],
        },
      });
    });

    it('should retrieve patient history with date range filters', async () => {
      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history?startDate=2024-01-15T00:00:00Z&endDate=2024-01-16T23:59:59Z',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockAuditService.getPatientHistory).toHaveBeenCalledWith({
        patientId: 'patient-123',
        userId: 'user-123',
        pagination: { page: 1, limit: 20 },
        filters: {
          startDate: '2024-01-15T00:00:00Z',
          endDate: '2024-01-16T23:59:59Z',
        },
      });
    });

    it('should retrieve patient history with severity filters', async () => {
      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history?severity=high,critical',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockAuditService.getPatientHistory).toHaveBeenCalledWith({
        patientId: 'patient-123',
        userId: 'user-123',
        pagination: { page: 1, limit: 20 },
        filters: {
          severity: ['high', 'critical'],
        },
      });
    });

    it('should include history metadata headers', async () => {
      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-Total-Events')).toBe('3');
      expect(response.headers.get('X-Date-Range-Start')).toBe('2024-01-15T10:30:00Z');
      expect(response.headers.get('X-Date-Range-End')).toBe('2024-01-16T09:15:00Z');
      expect(response.headers.get('X-History-Access-Logged')).toBe('true');
    });
  });

  describe('LGPD Compliance and History Access', () => {
    it('should validate LGPD history access permissions', async () => {
      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
        }),
      };

      await historyRoute.request(mockRequest);

      expect(mockLGPDService.validateHistoryAccess).toHaveBeenCalledWith({
        userId: 'user-123',
        patientId: 'patient-123',
        dataType: 'patient_history',
        purpose: 'healthcare_management',
        legalBasis: 'legitimate_interest',
      });
    });

    it('should log history access for audit trail', async () => {
      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history?eventTypes=patient_updated',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
          'X-Real-IP': '192.168.1.100',
          'User-Agent': 'Mozilla/5.0',
        }),
      };

      await historyRoute.request(mockRequest);

      expect(mockAuditService.logHistoryAccess).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'patient_history_access',
        resourceType: 'patient_history',
        resourceId: 'patient-123',
        details: {
          filters: {
            eventTypes: ['patient_updated'],
          },
          pagination: { page: 1, limit: 20 },
          eventsReturned: 3,
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        complianceContext: 'LGPD',
        sensitivityLevel: 'high',
      });
    });

    it('should handle LGPD history access denial', async () => {
      mockLGPDService.validateHistoryAccess.mockResolvedValue({
        success: false,
        error: 'Acesso ao histórico negado por política LGPD',
        code: 'LGPD_HISTORY_ACCESS_DENIED',
      });

      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('LGPD');
      expect(data.code).toBe('LGPD_HISTORY_ACCESS_DENIED');
    });

    it('should mask sensitive data in history based on access level', async () => {
      mockLGPDService.validateHistoryAccess.mockResolvedValue({
        success: true,
        data: { canAccess: true, accessLevel: 'limited' },
      });

      mockLGPDService.maskHistoryData.mockReturnValue([
        {
          id: 'event-1',
          timestamp: '2024-01-15T10:30:00Z',
          eventType: 'patient_updated',
          category: 'data_change',
          severity: 'info',
          actor: {
            userId: 'user-***',
            name: 'Dr. ***',
            role: 'healthcare_professional',
          },
          details: {
            action: 'update',
            resourceType: 'patient',
            changes: {
              phone: {
                old: '(11) *****-****',
                new: '(11) *****-****',
              },
            },
          },
        },
      ]);

      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history',
        headers: new Headers({
          'authorization': 'Bearer limited-token',
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.timeline[0].actor.name).toBe('Dr. ***');
      expect(data.data.timeline[0].details.changes.phone.old).toBe('(11) *****-****');
      expect(response.headers.get('X-Access-Level')).toBe('limited');
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history',
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Não autorizado');
    });

    it('should handle patient not found errors', async () => {
      mockPatientService.validatePatientExists.mockResolvedValue({
        success: false,
        error: 'Paciente não encontrado',
        code: 'PATIENT_NOT_FOUND',
      });

      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/nonexistent-patient/history',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Paciente não encontrado');
      expect(data.code).toBe('PATIENT_NOT_FOUND');
    });

    it('should handle validation errors for query parameters', async () => {
      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history?page=-1&limit=1000&startDate=invalid-date',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(Array.isArray(data.errors)).toBe(true);
      expect(data.errors.length).toBeGreaterThan(0);
    });

    it('should handle service errors gracefully', async () => {
      mockAuditService.getPatientHistory.mockResolvedValue({
        success: false,
        error: 'Erro interno do serviço de auditoria',
      });

      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Erro interno');
    });

    it('should handle history retrieval timeout', async () => {
      mockAuditService.getPatientHistory.mockRejectedValue(new Error('History retrieval timeout'));

      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Erro interno do servidor');
    });
  });

  describe('Brazilian Healthcare Compliance', () => {
    it('should include CFM compliance headers', async () => {
      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);

      expect(response.headers.get('X-CFM-Compliant')).toBe('true');
      expect(response.headers.get('X-Medical-Record-History')).toBe('accessed');
      expect(response.headers.get('X-LGPD-Compliant')).toBe('true');
      expect(response.headers.get('X-Audit-Trail-Complete')).toBe('true');
    });

    it('should validate healthcare professional context for medical history', async () => {
      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history?eventTypes=medical_consultation,treatment_update',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
          'X-Healthcare-Professional': 'CRM-SP-123456',
          'X-Healthcare-Context': 'medical_history_review',
        }),
      };

      const response = await historyRoute.request(mockRequest);

      expect(response.status).toBe(200);
      expect(mockAuditService.getPatientHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          healthcareProfessional: 'CRM-SP-123456',
          healthcareContext: 'medical_history_review',
        })
      );
    });

    it('should include data retention policy information', async () => {
      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-Data-Retention-Policy')).toBe('7-years-standard-20-years-medical');
      expect(response.headers.get('X-Legal-Basis')).toBe('legitimate_interest');
    });
  });

  describe('Performance and Caching', () => {
    it('should include performance headers', async () => {
      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-Response-Time')).toBeDefined();
      expect(response.headers.get('Cache-Control')).toBe('private, max-age=300');
      expect(response.headers.get('X-Database-Queries')).toBeDefined();
    });

    it('should handle large history sets with efficient pagination', async () => {
      const largeHistorySet = Array.from({ length: 100 }, (_, i) => ({
        id: `event-${i}`,
        timestamp: `2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
        eventType: 'patient_updated',
        category: 'data_change',
        severity: 'info',
        actor: { userId: `user-${i}`, name: `User ${i}` },
        details: { action: 'update', resourceType: 'patient' },
      }));

      mockAuditService.getPatientHistory.mockResolvedValue({
        success: true,
        data: {
          patientId: 'patient-123',
          timeline: largeHistorySet,
          pagination: {
            page: 1,
            limit: 100,
            total: 1000,
            totalPages: 10,
          },
          summary: {
            totalEvents: 1000,
            eventTypes: { patient_updated: 1000 },
            dateRange: {
              earliest: '2024-01-01T10:00:00Z',
              latest: '2024-01-31T10:00:00Z',
            },
          },
        },
      });

      const { default: historyRoute } = require('../history');
      
      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123/history?limit=100',
        headers: new Headers({
          'authorization': 'Bearer valid-token',
          'content-type': 'application/json',
        }),
      };

      const response = await historyRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.timeline).toHaveLength(100);
      expect(data.data.pagination.total).toBe(1000);
      expect(response.headers.get('X-Total-Events')).toBe('1000');
    });
  });
});
