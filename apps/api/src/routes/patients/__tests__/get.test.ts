/**
 * Tests for GET /api/v2/patients/{id} endpoint (T045)
 * Following TDD methodology - MUST FAIL FIRST
 * Integration with PatientService, AuditService for LGPD compliance
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Backend Services
const mockPatientService = {
  getPatientById: vi.fn(),
  validateAccess: vi.fn(),
};

const mockAuditService = {
  logActivity: vi.fn(),
};

const mockLGPDService = {
  validateDataAccess: vi.fn(),
  maskSensitiveData: vi.fn(),
};

// Wire route service imports to our mocks
vi.mock('../../../services/patient-service', () => ({
  PatientService: vi.fn().mockImplementation(() => mockPatientService),
}));

vi.mock('../../../services/audit-service', () => ({
  ComprehensiveAuditService: vi.fn().mockImplementation(() => mockAuditService),
}));

vi.mock('../../../services/lgpd-service', () => ({
  LGPDService: vi.fn().mockImplementation(() => mockLGPDService),
}));

describe('GET /api/v2/patients/{id} endpoint (T045)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful service responses by default
    mockPatientService.getPatientById.mockResolvedValue({
      success: true,
      data: {
        id: 'patient-123',
        name: 'João Silva',
        cpf: '123.456.789-00',
        email: 'joao@example.com',
        phone: '(11) 99999-9999',
        birthDate: '1990-01-01T00:00:00Z',
        gender: 'male',
        address: {
          street: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
        },
        healthcareInfo: {
          allergies: ['Penicilina'],
          medications: ['Losartana 50mg'],
          medicalHistory: ['Hipertensão'],
        },
        lgpdConsent: {
          marketing: true,
          dataProcessing: true,
          consentDate: '2024-01-01T00:00:00Z',
          expiresAt: '2025-01-01T00:00:00Z',
        },
        auditTrail: {
          createdBy: 'user-456',
          createdAt: '2024-01-01T00:00:00Z',
          lastModifiedBy: 'user-123',
          lastModifiedAt: '2024-01-15T00:00:00Z',
          accessCount: 5,
          lastAccessedAt: '2024-01-15T10:30:00Z',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      },
    });

    mockAuditService.logActivity.mockResolvedValue({
      success: true,
      data: { auditId: 'audit-123' },
    });

    mockLGPDService.validateDataAccess.mockResolvedValue({
      success: true,
      data: { canAccess: true, accessLevel: 'full' },
    });

    mockLGPDService.maskSensitiveData.mockImplementation(data => data);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should export get patient route handler', async () => {
    expect(async () => {
      const module = await import('../get');
      expect(module.default).toBeDefined();
    }).not.toThrow();
  });

  describe('Successful Patient Retrieval', () => {
    it('should get patient by valid ID', async () => {
      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await getRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('patient-123');
      expect(data.data.name).toBe('João Silva');
      expect(data.data.cpf).toBe('123.456.789-00');
    });

    it('should include complete patient data model', async () => {
      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await getRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveProperty('healthcareInfo');
      expect(data.data).toHaveProperty('lgpdConsent');
      expect(data.data).toHaveProperty('auditTrail');
      expect(data.data.healthcareInfo.allergies).toContain('Penicilina');
      expect(data.data.lgpdConsent.marketing).toBe(true);
    });

    it('should include LGPD compliance headers', async () => {
      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await getRoute.request(mockRequest);

      expect(response.headers.get('X-Data-Classification')).toBe('sensitive');
      expect(response.headers.get('X-LGPD-Compliant')).toBe('true');
      expect(response.headers.get('X-Audit-Logged')).toBe('true');
      expect(response.headers.get('X-Access-Level')).toBe('full');
    });

    it('should include cache control headers', async () => {
      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await getRoute.request(mockRequest);

      expect(response.headers.get('Cache-Control')).toBe(
        'private, max-age=600',
      );
      expect(response.headers.get('ETag')).toBeDefined();
    });
  });

  describe('LGPD Compliance and Data Access', () => {
    it('should validate LGPD data access permissions', async () => {
      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      await getRoute.request(mockRequest);

      expect(mockLGPDService.validateDataAccess).toHaveBeenCalledWith({
        _userId: 'user-123',
        patientId: 'patient-123',
        dataType: 'patient_full',
        purpose: 'healthcare_management',
        legalBasis: 'legitimate_interest',
      });
    });

    it('should log data access for audit trail', async () => {
      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
          'X-Real-IP': '192.168.1.100',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        }),
      };

      await getRoute.request(mockRequest);

      expect(mockAuditService.logActivity).toHaveBeenCalledWith({
        _userId: 'user-123',
        action: 'patient_data_access',
        resourceType: 'patient',
        resourceId: 'patient-123',
        details: {
          accessType: 'full_record',
          dataCategories: ['personal_data', 'health_data', 'contact_data'],
          purpose: 'healthcare_management',
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        complianceContext: 'LGPD',
        sensitivityLevel: 'high',
      });
    });

    it('should handle LGPD access denial', async () => {
      mockLGPDService.validateDataAccess.mockResolvedValue({
        success: false,
        error: 'Acesso negado por política LGPD',
        code: 'LGPD_ACCESS_DENIED',
      });

      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await getRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('LGPD');
      expect(data.code).toBe('LGPD_ACCESS_DENIED');
    });

    it('should mask sensitive data based on access level', async () => {
      mockLGPDService.validateDataAccess.mockResolvedValue({
        success: true,
        data: { canAccess: true, accessLevel: 'limited' },
      });

      mockLGPDService.maskSensitiveData.mockReturnValue({
        id: 'patient-123',
        name: 'João Silva',
        cpf: '***.***.***-**', // Masked CPF
        email: 'j***@example.com', // Masked email
        phone: '(11) *****-9999', // Masked phone
        birthDate: '1990-01-01T00:00:00Z',
        gender: 'male',
        // Healthcare info removed for limited access
      });

      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer limited-token',
        }),
      };

      const response = await getRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.cpf).toBe('***.***.***-**');
      expect(data.data.email).toBe('j***@example.com');
      expect(data.data.healthcareInfo).toBeUndefined();
      expect(response.headers.get('X-Access-Level')).toBe('limited');
    });

    it('should validate consent expiration', async () => {
      mockPatientService.getPatientById.mockResolvedValue({
        success: true,
        data: {
          id: 'patient-123',
          name: 'João Silva',
          lgpdConsent: {
            marketing: true,
            dataProcessing: true,
            consentDate: '2023-01-01T00:00:00Z',
            expiresAt: '2023-12-31T23:59:59Z', // Expired consent
          },
        },
      });

      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await getRoute.request(mockRequest);

      expect(response.headers.get('X-Consent-Status')).toBe('expired');
      expect(response.headers.get('X-Consent-Renewal-Required')).toBe('true');
    });
  });

  describe('Error Handling', () => {
    it('should handle patient not found', async () => {
      mockPatientService.getPatientById.mockResolvedValue({
        success: false,
        error: 'Paciente não encontrado',
        code: 'PATIENT_NOT_FOUND',
      });

      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/nonexistent-id',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await getRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('não encontrado');
      expect(data.code).toBe('PATIENT_NOT_FOUND');
    });

    it('should handle authentication errors', async () => {
      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      const response = await getRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Não autorizado');
    });

    it('should handle invalid patient ID format', async () => {
      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/invalid-id-format',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await getRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toContainEqual(
        expect.objectContaining({
          field: 'id',
          message: 'ID do paciente deve ser um UUID válido',
        }),
      );
    });

    it('should handle service errors gracefully', async () => {
      mockPatientService.getPatientById.mockRejectedValue(
        new Error('Database connection failed'),
      );

      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await getRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Erro interno do servidor');
    });

    it('should handle audit logging failures gracefully', async () => {
      mockAuditService.logActivity.mockRejectedValue(
        new Error('Audit service unavailable'),
      );

      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await getRoute.request(mockRequest);
      const data = await response.json();

      // Should still return patient data even if audit logging fails
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(response.headers.get('X-Audit-Warning')).toBe('audit-failed');
    });
  });

  describe('Performance and Caching', () => {
    it('should support conditional requests with ETag', async () => {
      const { default: getRoute } = await import('../get');

      // First request to get ETag
      const firstRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const firstResponse = await getRoute.request(firstRequest);
      const etag = firstResponse.headers.get('ETag');

      // Second request with If-None-Match header
      const secondRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
          'If-None-Match': etag,
        }),
      };

      const secondResponse = await getRoute.request(secondRequest);

      expect(secondResponse.status).toBe(304); // Not Modified
    });

    it('should include performance headers', async () => {
      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await getRoute.request(mockRequest);

      expect(response.headers.get('X-Response-Time')).toBeDefined();
      expect(response.headers.get('X-Database-Queries')).toBeDefined();
    });
  });

  describe('Brazilian Healthcare Compliance', () => {
    it('should include CFM compliance headers', async () => {
      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await getRoute.request(mockRequest);

      expect(response.headers.get('X-CFM-Compliant')).toBe('true');
      expect(response.headers.get('X-Medical-Record-Access')).toBe('logged');
      expect(response.headers.get('X-Healthcare-Context')).toBe('patient_care');
    });

    it('should validate healthcare professional access', async () => {
      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
          'X-Healthcare-Professional': 'CRM-SP-123456',
          'X-Healthcare-Context': 'medical_consultation',
        }),
      };

      const response = await getRoute.request(mockRequest);

      expect(response.status).toBe(200);
      expect(mockPatientService.getPatientById).toHaveBeenCalledWith({
        patientId: 'patient-123',
        _userId: 'user-123',
        healthcareProfessional: 'CRM-SP-123456',
        healthcareContext: 'medical_consultation',
      });
    });

    it('should include data retention policy headers', async () => {
      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await getRoute.request(mockRequest);

      expect(response.headers.get('X-Retention-Policy')).toBe('7-years');
      expect(response.headers.get('X-Data-Category')).toBe('medical-records');
    });
  });

  describe('Access Control and Permissions', () => {
    it('should validate user access to specific patient', async () => {
      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      await getRoute.request(mockRequest);

      expect(mockPatientService.validateAccess).toHaveBeenCalledWith({
        _userId: 'user-123',
        patientId: 'patient-123',
        accessType: 'read',
      });
    });

    it('should handle insufficient permissions', async () => {
      mockPatientService.validateAccess.mockResolvedValue({
        success: false,
        error: 'Permissões insuficientes para acessar este paciente',
        code: 'INSUFFICIENT_PERMISSIONS',
      });

      const { default: getRoute } = await import('../get');

      const mockRequest = {
        method: 'GET',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await getRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Permissões insuficientes');
      expect(data.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });
});