/**
 * Tests for DELETE /api/v2/patients/{id} endpoint (T047)
 * Following TDD methodology - MUST FAIL FIRST
 * Integration with PatientService, LGPDService, AuditService, NotificationService
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Backend Services
const mockPatientService = {
  deletePatient: vi.fn(),
  getPatientById: vi.fn(),
  validateAccess: vi.fn(),
};

const mockLGPDService = {
  processDataDeletion: vi.fn(),
  validateDeletionRequest: vi.fn(),
  anonymizePatientData: vi.fn(),
};

const mockAuditService = {
  logActivity: vi.fn(),
};

const mockNotificationService = {
  sendNotification: vi.fn(),
};

describe('DELETE /api/v2/patients/{id} endpoint (T047)', () => {
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
        lgpdConsent: {
          marketing: true,
          dataProcessing: true,
          consentDate: '2024-01-01T00:00:00Z',
        },
      },
    });

    mockPatientService.deletePatient.mockResolvedValue({
      success: true,
      data: {
        id: 'patient-123',
        deletionType: 'soft_delete',
        deletedAt: '2024-01-15T10:30:00Z',
        retentionPeriod: '7 years',
        anonymizationScheduled: false,
      },
    });

    mockLGPDService.validateDeletionRequest.mockResolvedValue({
      success: true,
      data: {
        deletionAllowed: true,
        deletionType: 'soft_delete',
        retentionRequired: true,
        retentionPeriod: '7 years',
      },
    });

    mockLGPDService.processDataDeletion.mockResolvedValue({
      success: true,
      data: {
        deletionId: 'deletion-123',
        status: 'completed',
      },
    });

    mockAuditService.logActivity.mockResolvedValue({
      success: true,
      data: { auditId: 'audit-123' },
    });

    mockNotificationService.sendNotification.mockResolvedValue({
      success: true,
      data: { notificationId: 'notif-123' },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should export delete patient route handler', async () => {
    expect(async () => {
      const module = await import('../delete');
      expect(module.default).toBeDefined();
    }).not.toThrow();
  });

  describe('Successful Patient Deletion', () => {
    it('should perform soft delete by default (LGPD compliance)', async () => {
      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await deleteRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.deletionType).toBe('soft_delete');
      expect(data.data.retentionPeriod).toBe('7 years');
      expect(data.message).toContain('Paciente removido com sucesso');
    });

    it('should handle LGPD data subject deletion request', async () => {
      mockLGPDService.validateDeletionRequest.mockResolvedValue({
        success: true,
        data: {
          deletionAllowed: true,
          deletionType: 'anonymization',
          retentionRequired: false,
        },
      });

      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123?deletion_type=data_subject_request',
        headers: new Headers({
          authorization: 'Bearer valid-token',
          'X-LGPD-Request': 'data_subject_deletion',
        }),
      };

      const response = await deleteRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.deletionType).toBe('anonymization');
      expect(mockLGPDService.processDataDeletion).toHaveBeenCalledWith({
        patientId: 'patient-123',
        deletionType: 'data_subject_request',
        requestedBy: 'user-123',
        reason: 'LGPD data subject right',
      });
    });

    it('should send deletion confirmation notification', async () => {
      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      await deleteRoute.request(mockRequest);

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith({
        recipientId: 'patient-123',
        channel: 'email',
        templateId: 'patient_data_deletion',
        data: {
          patientName: 'João Silva',
          deletionType: 'soft_delete',
          retentionPeriod: '7 years',
          deletionDate: expect.any(String),
        },
        priority: 'high',
        lgpdConsent: true,
      });
    });

    it('should include deletion confirmation headers', async () => {
      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await deleteRoute.request(mockRequest);

      expect(response.headers.get('X-Deletion-Type')).toBe('soft_delete');
      expect(response.headers.get('X-Retention-Period')).toBe('7 years');
      expect(response.headers.get('X-LGPD-Compliant')).toBe('true');
      expect(response.headers.get('X-Deletion-Confirmed')).toBe('true');
    });
  });

  describe('LGPD Compliance and Data Deletion', () => {
    it('should validate LGPD deletion request', async () => {
      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      await deleteRoute.request(mockRequest);

      expect(mockLGPDService.validateDeletionRequest).toHaveBeenCalledWith({
        patientId: 'patient-123',
        requestedBy: 'user-123',
        deletionReason: 'administrative_deletion',
        dataCategories: ['personal_data', 'health_data', 'contact_data'],
      });
    });

    it('should handle anonymization for expired consent', async () => {
      mockLGPDService.validateDeletionRequest.mockResolvedValue({
        success: true,
        data: {
          deletionAllowed: true,
          deletionType: 'anonymization',
          retentionRequired: false,
          reason: 'consent_expired',
        },
      });

      mockLGPDService.anonymizePatientData.mockResolvedValue({
        success: true,
        data: {
          anonymizationId: 'anon-123',
          anonymizedFields: ['name', 'cpf', 'email', 'phone'],
          completedAt: '2024-01-15T10:30:00Z',
        },
      });

      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123?reason=consent_expired',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await deleteRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.deletionType).toBe('anonymization');
      expect(mockLGPDService.anonymizePatientData).toHaveBeenCalledWith({
        patientId: 'patient-123',
        anonymizationLevel: 'full',
        preserveStatistics: true,
      });
    });

    it('should handle medical record retention requirements', async () => {
      mockLGPDService.validateDeletionRequest.mockResolvedValue({
        success: true,
        data: {
          deletionAllowed: true,
          deletionType: 'soft_delete',
          retentionRequired: true,
          retentionPeriod: '20 years', // CFM requirement for medical records
          retentionReason: 'medical_record_retention',
        },
      });

      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
          'X-Healthcare-Context': 'medical_records',
        }),
      };

      const response = await deleteRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.retentionPeriod).toBe('20 years');
      expect(response.headers.get('X-CFM-Retention')).toBe('required');
    });

    it('should handle LGPD deletion denial', async () => {
      mockLGPDService.validateDeletionRequest.mockResolvedValue({
        success: false,
        error: 'Exclusão não permitida - dados necessários para cumprimento legal',
        code: 'LGPD_DELETION_DENIED',
        data: {
          deletionAllowed: false,
          reason: 'legal_obligation',
          retentionRequired: true,
        },
      });

      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await deleteRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('não permitida');
      expect(data.code).toBe('LGPD_DELETION_DENIED');
    });
  });

  describe('Audit Trail and Compliance Logging', () => {
    it('should log patient deletion activity', async () => {
      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
          'X-Real-IP': '192.168.1.100',
          'User-Agent': 'Mozilla/5.0',
        }),
      };

      await deleteRoute.request(mockRequest);

      expect(mockAuditService.logActivity).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'patient_deletion',
        resourceType: 'patient',
        resourceId: 'patient-123',
        details: {
          deletionType: 'soft_delete',
          patientName: 'João Silva',
          retentionPeriod: '7 years',
          deletionReason: 'administrative_deletion',
          lgpdCompliant: true,
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        complianceContext: 'LGPD',
        sensitivityLevel: 'critical',
      });
    });

    it('should log anonymization activity separately', async () => {
      mockLGPDService.validateDeletionRequest.mockResolvedValue({
        success: true,
        data: {
          deletionAllowed: true,
          deletionType: 'anonymization',
        },
      });

      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123?deletion_type=anonymization',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      await deleteRoute.request(mockRequest);

      expect(mockAuditService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'patient_anonymization',
          details: expect.objectContaining({
            deletionType: 'anonymization',
            anonymizationLevel: 'full',
          }),
          sensitivityLevel: 'critical',
        }),
      );
    });

    it('should create deletion audit trail', async () => {
      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      await deleteRoute.request(mockRequest);

      expect(mockAuditService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          complianceContext: 'LGPD',
          details: expect.objectContaining({
            auditTrailPreserved: true,
            deletionCompliant: true,
          }),
        }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle patient not found', async () => {
      mockPatientService.getPatientById.mockResolvedValue({
        success: false,
        error: 'Paciente não encontrado',
        code: 'PATIENT_NOT_FOUND',
      });

      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/nonexistent-id',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await deleteRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('não encontrado');
      expect(data.code).toBe('PATIENT_NOT_FOUND');
    });

    it('should handle authentication errors', async () => {
      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      const response = await deleteRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Não autorizado');
    });

    it('should handle insufficient permissions', async () => {
      mockPatientService.validateAccess.mockResolvedValue({
        success: false,
        error: 'Permissões insuficientes para excluir este paciente',
        code: 'INSUFFICIENT_PERMISSIONS',
      });

      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await deleteRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Permissões insuficientes');
      expect(data.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should handle invalid patient ID format', async () => {
      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/invalid-id-format',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await deleteRoute.request(mockRequest);
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
      mockPatientService.deletePatient.mockRejectedValue(new Error('Database connection failed'));

      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await deleteRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Erro interno do servidor');
    });
  });

  describe('Brazilian Healthcare Compliance', () => {
    it('should include CFM compliance headers', async () => {
      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await deleteRoute.request(mockRequest);

      expect(response.headers.get('X-CFM-Compliant')).toBe('true');
      expect(response.headers.get('X-Medical-Record-Retention')).toBe('required');
      expect(response.headers.get('X-LGPD-Compliant')).toBe('true');
    });

    it('should validate healthcare professional context for deletion', async () => {
      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
          'X-Healthcare-Professional': 'CRM-SP-123456',
          'X-Deletion-Reason': 'medical_record_cleanup',
        }),
      };

      const response = await deleteRoute.request(mockRequest);

      expect(response.status).toBe(200);
      expect(mockPatientService.deletePatient).toHaveBeenCalledWith(
        expect.objectContaining({
          healthcareProfessional: 'CRM-SP-123456',
          deletionReason: 'medical_record_cleanup',
        }),
      );
    });

    it('should handle ANVISA compliance for medical device data', async () => {
      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123',
        headers: new Headers({
          authorization: 'Bearer valid-token',
          'X-Medical-Device-Data': 'true',
        }),
      };

      const response = await deleteRoute.request(mockRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-ANVISA-Retention')).toBe('required');
      expect(response.headers.get('X-Device-Data-Preserved')).toBe('true');
    });
  });

  describe('Deletion Types and Scenarios', () => {
    it('should handle hard delete for test data', async () => {
      mockLGPDService.validateDeletionRequest.mockResolvedValue({
        success: true,
        data: {
          deletionAllowed: true,
          deletionType: 'hard_delete',
          retentionRequired: false,
          reason: 'test_data',
        },
      });

      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123?deletion_type=hard_delete&reason=test_data',
        headers: new Headers({
          authorization: 'Bearer admin-token',
          'X-Admin-Override': 'true',
        }),
      };

      const response = await deleteRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.deletionType).toBe('hard_delete');
      expect(response.headers.get('X-Hard-Delete')).toBe('confirmed');
    });

    it('should schedule future anonymization', async () => {
      mockLGPDService.validateDeletionRequest.mockResolvedValue({
        success: true,
        data: {
          deletionAllowed: true,
          deletionType: 'scheduled_anonymization',
          retentionRequired: true,
          retentionPeriod: '5 years',
          anonymizationDate: '2029-01-15T00:00:00Z',
        },
      });

      const { default: deleteRoute } = await import('../delete');

      const mockRequest = {
        method: 'DELETE',
        url: '/api/v2/patients/patient-123?schedule_anonymization=true',
        headers: new Headers({
          authorization: 'Bearer valid-token',
        }),
      };

      const response = await deleteRoute.request(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.deletionType).toBe('scheduled_anonymization');
      expect(response.headers.get('X-Anonymization-Scheduled')).toBe('2029-01-15T00:00:00Z');
    });
  });
});
