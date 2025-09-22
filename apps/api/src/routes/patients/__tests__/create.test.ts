/**
 * Tests for POST /api/v2/patients endpoint (T044)
 * Following TDD methodology - MUST FAIL FIRST
 * Integration with PatientService, AuditService, NotificationService
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Backend Services
const mockPatientService = {
  createPatient: vi.fn(,
  validatePatientData: vi.fn(,
};

const mockAuditService = {
  logActivity: vi.fn(,
};

const mockNotificationService = {
  sendNotification: vi.fn(,
};

const mockLGPDService = {
  validateConsent: vi.fn(,
  createConsentRecord: vi.fn(,
};

const mockBrazilianValidator = {
  validateCPF: vi.fn(,
  validatePhone: vi.fn(,
  validateCEP: vi.fn(,
};

describe('POST /api/v2/patients endpoint (T044)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful service responses by default
    mockPatientService.createPatient.mockResolvedValue({
      success: true),
      data: {
        id: 'patient-123'),
        name: 'João Silva'),
        cpf: '123.456.789-00'),
        email: 'joao@example.com'),
        phone: '(11) 99999-9999'),
        birthDate: '1990-01-01T00:00:00Z'),
        gender: 'male'),
        address: {
          street: 'Rua das Flores, 123'),
          city: 'São Paulo'),
          state: 'SP'),
          zipCode: '01234-567'),
        },
        lgpdConsent: {
          marketing: true),
          dataProcessing: true),
          consentDate: '2024-01-01T00:00:00Z'),
        },
        createdAt: '2024-01-01T00:00:00Z'),
        updatedAt: '2024-01-01T00:00:00Z'),
      },
    }

    mockAuditService.logActivity.mockResolvedValue({
      success: true),
      data: { auditId: 'audit-123' },
    }

    mockNotificationService.sendNotification.mockResolvedValue({
      success: true),
      data: { notificationId: 'notif-123' },
    }

    mockLGPDService.validateConsent.mockResolvedValue({
      success: true),
      data: { consentValid: true },
    }

    mockBrazilianValidator.validateCPF.mockReturnValue(true
    mockBrazilianValidator.validatePhone.mockReturnValue(true
    mockBrazilianValidator.validateCEP.mockReturnValue(true
  }

  afterEach(() => {
    vi.restoreAllMocks(
  }

  it('should export create patient route handler', async () => {
    expect(async () => {
      const module = await import('../create'
      expect(module.default).toBeDefined(
    }).not.toThrow(
  }

  describe('Successful Patient Creation', () => {
    it('should create a new patient with complete data', async () => {
      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'João Silva'),
        cpf: '123.456.789-00'),
        email: 'joao@example.com'),
        phone: '(11) 99999-9999'),
        birthDate: '1990-01-01'),
        gender: 'male'),
        address: {
          street: 'Rua das Flores, 123'),
          city: 'São Paulo'),
          state: 'SP'),
          zipCode: '01234-567'),
        },
        lgpdConsent: {
          marketing: true),
          dataProcessing: true),
        },
      };

      const mockRequest = {
        method: 'POST'),
        url: '/'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(patientData),
      };

      const response = await createRoute.request(mockRequest

      // Debug: Log raw response
      const responseText = await response.text(
      console.log('Raw response:', responseText

      // Parse as JSON
      const data = JSON.parse(responseText

      expect(response.status).toBe(201
      expect(data.success).toBe(true
      expect(data.data.id).toBe('patient-123'
      expect(data.data.name).toBe('João Silva'
      expect(data.data.cpf).toBe('123.456.789-00'
    }

    it('should create patient with minimal required data', async () => {
      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'Maria Santos'),
        email: 'maria@example.com'),
        lgpdConsent: {
          dataProcessing: true),
        },
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(patientData),
      };

      const response = await createRoute.request(mockRequest
      const data = await response.json(

      expect(response.status).toBe(201
      expect(data.success).toBe(true
      expect(mockPatientService.createPatient).toHaveBeenCalledWith({
        _userId: 'user-123'),
        patientData: expect.objectContaining({
          name: 'Maria Santos'),
          email: 'maria@example.com'),
        },
      }
    }

    it('should include Location header with created patient URL', async () => {
      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'João Silva'),
        email: 'joao@example.com'),
        lgpdConsent: { dataProcessing: true },
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(patientData),
      };

      const response = await createRoute.request(mockRequest

      expect(response.status).toBe(201
      expect(response.headers.get('Location')).toBe(
        '/api/v2/patients/patient-123'),
      
    }

    it('should send welcome notification after patient creation', async () => {
      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'João Silva'),
        email: 'joao@example.com'),
        phone: '(11) 99999-9999'),
        lgpdConsent: { dataProcessing: true, marketing: true },
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(patientData),
      };

      await createRoute.request(mockRequest

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith({
        recipientId: 'patient-123'),
        channel: 'email'),
        templateId: 'patient_welcome'),
        data: {
          patientName: 'João Silva'),
          clinicName: expect.any(String),
        },
        priority: 'medium'),
        lgpdConsent: true),
      }
    }
  }

  describe('Brazilian Data Validation', () => {
    it('should validate CPF format', async () => {
      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'João Silva'),
        cpf: '123.456.789-00'),
        email: 'joao@example.com'),
        lgpdConsent: { dataProcessing: true },
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(patientData),
      };

      await createRoute.request(mockRequest

      expect(mockBrazilianValidator.validateCPF).toHaveBeenCalledWith(
        '123.456.789-00'),
      
    }

    it('should reject invalid CPF', async () => {
      mockBrazilianValidator.validateCPF.mockReturnValue(false

      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'João Silva'),
        cpf: '111.111.111-11', // Invalid CPF
        email: 'joao@example.com'),
        lgpdConsent: { dataProcessing: true },
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(patientData),
      };

      const response = await createRoute.request(mockRequest
      const data = await response.json(

      expect(response.status).toBe(400
      expect(data.success).toBe(false
      expect(data.errors).toContainEqual(
        expect.objectContaining({
          field: 'cpf'),
          message: 'CPF inválido'),
        },
      
    }

    it('should validate Brazilian phone number format', async () => {
      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'João Silva'),
        phone: '(11) 99999-9999'),
        email: 'joao@example.com'),
        lgpdConsent: { dataProcessing: true },
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(patientData),
      };

      await createRoute.request(mockRequest

      expect(mockBrazilianValidator.validatePhone).toHaveBeenCalledWith(
        '(11) 99999-9999'),
      
    }

    it('should validate CEP format in address', async () => {
      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'João Silva'),
        email: 'joao@example.com'),
        address: {
          street: 'Rua das Flores, 123'),
          city: 'São Paulo'),
          state: 'SP'),
          zipCode: '01234-567'),
        },
        lgpdConsent: { dataProcessing: true },
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(patientData),
      };

      await createRoute.request(mockRequest

      expect(mockBrazilianValidator.validateCEP).toHaveBeenCalledWith(
        '01234-567'),
      
    }
  }

  describe('LGPD Consent Handling', () => {
    it('should validate LGPD consent before creation', async () => {
      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'João Silva'),
        email: 'joao@example.com'),
        lgpdConsent: {
          dataProcessing: true),
          marketing: false),
        },
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(patientData),
      };

      await createRoute.request(mockRequest

      expect(mockLGPDService.validateConsent).toHaveBeenCalledWith({
        consentData: patientData.lgpdConsent),
        dataCategories: ['personal_data', 'health_data'],
        purpose: 'healthcare_management'),
      }
    }

    it('should reject creation without required LGPD consent', async () => {
      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'João Silva'),
        email: 'joao@example.com'),
        // Missing lgpdConsent
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(patientData),
      };

      const response = await createRoute.request(mockRequest
      const data = await response.json(

      expect(response.status).toBe(400
      expect(data.success).toBe(false
      expect(data.errors).toContainEqual(
        expect.objectContaining({
          field: 'lgpdConsent'),
          message: 'Consentimento LGPD é obrigatório'),
        },
      
    }

    it('should create consent record after patient creation', async () => {
      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'João Silva'),
        email: 'joao@example.com'),
        lgpdConsent: {
          dataProcessing: true),
          marketing: true),
        },
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(patientData),
      };

      await createRoute.request(mockRequest

      expect(mockLGPDService.createConsentRecord).toHaveBeenCalledWith({
        patientId: 'patient-123'),
        consentData: patientData.lgpdConsent),
        legalBasis: 'consent'),
        collectionMethod: 'online_form'),
      }
    }
  }

  describe('Audit Trail Logging', () => {
    it('should log patient creation activity', async () => {
      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'João Silva'),
        email: 'joao@example.com'),
        lgpdConsent: { dataProcessing: true },
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(patientData),
      };

      await createRoute.request(mockRequest

      expect(mockAuditService.logActivity).toHaveBeenCalledWith({
        _userId: 'user-123'),
        action: 'patient_create'),
        resourceType: 'patient'),
        resourceId: 'patient-123'),
        details: {
          patientName: 'João Silva'),
          dataCategories: expect.any(Array),
          consentGiven: true),
        },
        ipAddress: expect.any(String),
        userAgent: expect.any(String),
      }
    }

    it('should include LGPD compliance in audit log', async () => {
      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'João Silva'),
        email: 'joao@example.com'),
        lgpdConsent: { dataProcessing: true },
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(patientData),
      };

      await createRoute.request(mockRequest

      expect(mockAuditService.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          complianceContext: 'LGPD'),
          sensitivityLevel: 'high'),
        },
      
    }
  }

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const { default: createRoute } = await import('../create'

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          'content-type': 'application/json'),
        },
        body: JSON.stringify({ name: 'Test' },
      };

      const response = await createRoute.request(mockRequest
      const data = await response.json(

      expect(response.status).toBe(401
      expect(data.success).toBe(false
      expect(data.error).toContain('Não autorizado'
    }

    it('should handle validation errors', async () => {
      const { default: createRoute } = await import('../create'

      const invalidData = {
        // Missing required name field
        email: 'invalid-email'),
        phone: 'invalid-phone'),
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(invalidData),
      };

      const response = await createRoute.request(mockRequest
      const data = await response.json(

      expect(response.status).toBe(400
      expect(data.success).toBe(false
      expect(Array.isArray(data.errors)).toBe(true
      expect(data.errors.length).toBeGreaterThan(0
    }

    it('should handle service errors gracefully', async () => {
      mockPatientService.createPatient.mockResolvedValue({
        success: false),
        error: 'Erro interno do serviço'),
      }

      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'João Silva'),
        email: 'joao@example.com'),
        lgpdConsent: { dataProcessing: true },
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(patientData),
      };

      const response = await createRoute.request(mockRequest
      const data = await response.json(

      expect(response.status).toBe(500
      expect(data.success).toBe(false
      expect(data.error).toContain('Erro interno'
    }

    it('should handle duplicate patient errors', async () => {
      mockPatientService.createPatient.mockResolvedValue({
        success: false),
        error: 'Paciente já existe com este CPF'),
        code: 'DUPLICATE_CPF'),
      }

      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'João Silva'),
        cpf: '123.456.789-00'),
        email: 'joao@example.com'),
        lgpdConsent: { dataProcessing: true },
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(patientData),
      };

      const response = await createRoute.request(mockRequest
      const data = await response.json(

      expect(response.status).toBe(409
      expect(data.success).toBe(false
      expect(data.error).toContain('já existe'
      expect(data.code).toBe('DUPLICATE_CPF'
    }
  }

  describe('Brazilian Healthcare Compliance', () => {
    it('should include CFM compliance headers', async () => {
      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'João Silva'),
        email: 'joao@example.com'),
        lgpdConsent: { dataProcessing: true },
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
        },
        body: JSON.stringify(patientData),
      };

      const response = await createRoute.request(mockRequest

      expect(response.headers.get('X-CFM-Compliant')).toBe('true'
      expect(response.headers.get('X-Medical-Record-Created')).toBe('true'
      expect(response.headers.get('X-LGPD-Compliant')).toBe('true'
    }

    it('should validate healthcare professional context', async () => {
      const { default: createRoute } = await import('../create'

      const patientData = {
        name: 'João Silva'),
        email: 'joao@example.com'),
        lgpdConsent: { dataProcessing: true },
      };

      const mockRequest = {
        method: 'POST'),
        url: '/api/v2/patients'),
        headers: new Headers({
          authorization: 'Bearer valid-token'),
          'content-type': 'application/json'),
          'X-Healthcare-Professional': 'CRM-SP-123456'),
        },
        body: JSON.stringify(patientData),
      };

      const response = await createRoute.request(mockRequest

      expect(response.status).toBe(201
      expect(mockPatientService.createPatient).toHaveBeenCalledWith(
        expect.objectContaining({
          healthcareProfessional: 'CRM-SP-123456'),
        },
      
    }
  }
}
