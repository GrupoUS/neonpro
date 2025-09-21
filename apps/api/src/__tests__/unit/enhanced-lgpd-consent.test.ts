import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type HealthcarePrismaClient } from '../../clients/prisma';
import { createHealthcareError } from '../../services/createHealthcareError';
import {
  ConsentChannel,
  ConsentPurpose,
  ConsentStatus,
  LGPDConsentService,
} from '../../services/lgpd-consent-service';
import { type LGPDOperationResult } from '../../types/lgpd';

// Mock the prisma client
const mockPrisma = {
  patient: {
    findUnique: vi.fn(),
  },
  auditTrail: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
};

// Mock the getHealthcarePrismaClient function
vi.mock(_'../../clients/prisma',_() => ({
  getHealthcarePrismaClient: () => mockPrisma,
}));

describe(_'LGPDConsentService',_() => {
  let consentService: LGPDConsentService;

  beforeEach(_() => {
    vi.clearAllMocks();
    consentService = new LGPDConsentService(
      mockPrisma as unknown as HealthcarePrismaClient,
    );
  });

  describe(_'recordConsent',_() => {
    const validConsentRequest = {
      patientId: 'patient-123',
      purpose: ConsentPurpose.enum.TREATMENT,
      channel: ConsentChannel.enum.WEB_PORTAL,
      language: 'pt-BR',
      consentText: 'Test consent text',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    };

    it(_'should successfully record consent when patient exists',_async () => {
      // Arrange
      mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-123' });
      mockPrisma.auditTrail.findFirst.mockResolvedValue(null); // No existing consent
      mockPrisma.auditTrail.create
        .mockResolvedValueOnce({ id: 'consent-123' })
        .mockResolvedValueOnce({ id: 'audit-123' });

      // Act
      const result = await consentService.recordConsent(validConsentRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBe(1);
      expect(result.consentId).toBe('consent-123');
      expect(mockPrisma.patient.findUnique).toHaveBeenCalledWith({
        where: { id: 'patient-123' },
      });
      expect(mockPrisma.auditTrail.create).toHaveBeenCalledTimes(2);
    });

    it(_'should return error when patient does not exist',_async () => {
      // Arrange
      mockPrisma.patient.findUnique.mockResolvedValue(null);

      // Act
      const result = await consentService.recordConsent(validConsentRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.recordsProcessed).toBe(0);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('PATIENT_NOT_FOUND');
    });

    it(_'should revoke existing consent before creating new one',_async () => {
      // Arrange
      mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-123' });
      mockPrisma.auditTrail.findFirst.mockResolvedValue({
        id: 'existing-consent-123',
        metadata: { purpose: ConsentPurpose.enum.TREATMENT },
      });
      mockPrisma.auditTrail.update.mockResolvedValue({
        id: 'existing-consent-123',
      });
      mockPrisma.auditTrail.create
        .mockResolvedValueOnce({ id: 'new-consent-123' })
        .mockResolvedValueOnce({ id: 'audit-123' });

      // Act
      const result = await consentService.recordConsent(validConsentRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(mockPrisma.auditTrail.update).toHaveBeenCalledWith({
        where: { id: 'existing-consent-123' },
        data: {
          metadata: {
            path: ['status'],
            equals: 'REVOKED',
          },
        },
      });
    });

    it(_'should handle errors gracefully',_async () => {
      // Arrange
      mockPrisma.patient.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      // Act
      const result = await consentService.recordConsent(validConsentRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.recordsProcessed).toBe(0);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toBe('Database error');
    });
  });

  describe(_'withdrawConsent',_() => {
    const validWithdrawalRequest = {
      patientId: 'patient-123',
      consentId: 'consent-123',
      reason: 'Patient requested withdrawal',
      channel: ConsentChannel.enum.WEB_PORTAL,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    };

    it(_'should successfully withdraw consent',_async () => {
      // Arrange
      const existingConsent = {
        id: 'consent-123',
        _userId: 'patient-123',
        metadata: {
          purpose: ConsentPurpose.enum.TREATMENT,
          status: 'ACTIVE',
        },
      };

      mockPrisma.auditTrail.findFirst.mockResolvedValue(existingConsent);
      mockPrisma.auditTrail.update.mockResolvedValue({ id: 'consent-123' });
      mockPrisma.auditTrail.create.mockResolvedValue({ id: 'audit-123' });

      // Act
      const result = await consentService.withdrawConsent(
        validWithdrawalRequest,
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBe(1);
      expect(mockPrisma.auditTrail.update).toHaveBeenCalledWith({
        where: { id: 'consent-123' },
        data: {
          metadata: {
            ...existingConsent.metadata,
            status: 'WITHDRAWN',
            withdrawalReason: 'Patient requested withdrawal',
            withdrawalDate: expect.any(String),
            withdrawalChannel: ConsentChannel.enum.WEB_PORTAL,
            withdrawalIpAddress: '192.168.1.1',
            withdrawalUserAgent: 'Mozilla/5.0',
          },
        },
      });
    });

    it(_'should return error when consent does not exist',_async () => {
      // Arrange
      mockPrisma.auditTrail.findFirst.mockResolvedValue(null);

      // Act
      const result = await consentService.withdrawConsent(
        validWithdrawalRequest,
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('CONSENT_NOT_FOUND');
    });
  });

  describe(_'getPatientConsents',_() => {
    it(_'should return patient consents',_async () => {
      // Arrange
      const mockConsents = [
        {
          id: 'consent-123',
          _userId: 'patient-123',
          action: 'CONSENT_GRANTED',
          metadata: {
            purpose: ConsentPurpose.enum.TREATMENT,
            status: 'ACTIVE',
            channel: ConsentChannel.enum.WEB_PORTAL,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.auditTrail.findMany.mockResolvedValue(mockConsents);

      // Act
      const result = await consentService.getPatientConsents('patient-123');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'consent-123',
        patientId: 'patient-123',
        purpose: ConsentPurpose.enum.TREATMENT,
        status: 'ACTIVE',
        channel: ConsentChannel.enum.WEB_PORTAL,
        consentText: undefined,
        version: undefined,
        validFrom: expect.any(Date),
        validUntil: undefined,
        ipAddress: undefined,
        userAgent: undefined,
        deviceId: undefined,
        location: undefined,
        language: undefined,
        withdrawalReason: undefined,
        withdrawalDate: undefined,
        metadata: expect.any(Object),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe(_'hasActiveConsent',_() => {
    it(_'should return true when active consent exists',_async () => {
      // Arrange
      mockPrisma.auditTrail.findFirst.mockResolvedValue({
        id: 'consent-123',
        _userId: 'patient-123',
        metadata: { purpose: ConsentPurpose.enum.TREATMENT },
      });

      // Act
      const result = await consentService.hasActiveConsent(
        'patient-123',
        ConsentPurpose.enum.TREATMENT,
      );

      // Assert
      expect(result).toBe(true);
    });

    it(_'should return false when no active consent exists',_async () => {
      // Arrange
      mockPrisma.auditTrail.findFirst.mockResolvedValue(null);

      // Act
      const result = await consentService.hasActiveConsent(
        'patient-123',
        ConsentPurpose.enum.TREATMENT,
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe(_'validateConsent',_() => {
    it(_'should pass validation when active consent exists',_async () => {
      // Arrange
      mockPrisma.auditTrail.findFirst.mockResolvedValue({
        id: 'consent-123',
        _userId: 'patient-123',
        metadata: {
          purpose: ConsentPurpose.enum.TREATMENT,
          status: 'ACTIVE',
        },
      });

      // Act & Assert
      let error = null;
      try {
        await consentService.validateConsent(
          'patient-123',
          ConsentPurpose.enum.TREATMENT,
          'test-operation',
        );
      } catch (_err) {
        error = err;
      }
      expect(error).toBeNull();
    });

    it(_'should throw error when no active consent exists',_async () => {
      // Arrange
      mockPrisma.auditTrail.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        consentService.validateConsent(
          'patient-123',
          ConsentPurpose.enum.TREATMENT,
          'test-operation',
        ),
      ).rejects.toThrow('CONSENT_REQUIRED');
    });
  });

  describe(_'generateConsentReport',_() => {
    it(_'should generate consent report successfully',_async () => {
      // Arrange
      const mockConsents = [
        {
          id: 'consent-123',
          _userId: 'patient-123',
          action: 'CONSENT_GRANTED',
          metadata: {
            purpose: ConsentPurpose.enum.TREATMENT,
            status: 'ACTIVE',
            channel: ConsentChannel.enum.WEB_PORTAL,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockAuditEntries = [
        {
          id: 'audit-123',
          _userId: 'patient-123',
          action: 'CONSENT_GRANTED',
          metadata: { purpose: ConsentPurpose.enum.TREATMENT },
          createdAt: new Date(),
        },
      ];

      mockPrisma.auditTrail.findMany
        .mockResolvedValueOnce(mockConsents)
        .mockResolvedValueOnce(mockAuditEntries);

      // Act
      const result = await consentService.generateConsentReport('patient-123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();
      expect(result.report?.patientId).toBe('patient-123');
      expect(result.report?.activeConsents).toHaveLength(1);
      expect(result.report?.consentHistory).toHaveLength(1);
      expect(result.report?.summary.totalConsents).toBe(1);
    });
  });

  describe(_'Consent Templates',_() => {
    it(_'should return correct template for TREATMENT purpose',_async () => {
      // Arrange
      mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-123' });
      mockPrisma.auditTrail.findFirst.mockResolvedValue(null);
      mockPrisma.auditTrail.create.mockResolvedValue({ id: 'consent-123' });

      // Act
      await consentService.recordConsent({
        patientId: 'patient-123',
        purpose: ConsentPurpose.enum.TREATMENT,
        channel: ConsentChannel.enum.WEB_PORTAL,
        language: 'pt-BR',
      });

      // Assert
      const createCall = mockPrisma.auditTrail.create.mock.calls[0];
      const consentText = createCall[0].data.metadata.consentText;
      expect(consentText).toContain('tratamento médico');
    });

    it(_'should return correct template for RESEARCH purpose',_async () => {
      // Arrange
      mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-123' });
      mockPrisma.auditTrail.findFirst.mockResolvedValue(null);
      mockPrisma.auditTrail.create.mockResolvedValue({ id: 'consent-123' });

      // Act
      await consentService.recordConsent({
        patientId: 'patient-123',
        purpose: ConsentPurpose.enum.RESEARCH,
        channel: ConsentChannel.enum.WEB_PORTAL,
        language: 'pt-BR',
      });

      // Assert
      const createCall = mockPrisma.auditTrail.create.mock.calls[0];
      const consentText = createCall[0].data.metadata.consentText;
      expect(consentText).toContain('pesquisa médica');
    });

    it(_'should return default template for unknown purpose',_async () => {
      // Arrange
      mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-123' });
      mockPrisma.auditTrail.findFirst.mockResolvedValue(null);
      mockPrisma.auditTrail.create.mockResolvedValue({ id: 'consent-123' });

      // Act
      await consentService.recordConsent({
        patientId: 'patient-123',
        purpose: ConsentPurpose.enum.MARKETING,
        channel: ConsentChannel.enum.WEB_PORTAL,
        language: 'pt-BR',
      });

      // Assert
      const createCall = mockPrisma.auditTrail.create.mock.calls[0];
      const consentText = createCall[0].data.metadata.consentText;
      expect(consentText).toContain('MARKETING');
    });
  });

  describe(_'Error Handling',_() => {
    it(_'should handle database connection errors',_async () => {
      // Arrange
      mockPrisma.patient.findUnique.mockRejectedValue(
        new Error('Connection failed'),
      );

      // Act
      const result = await consentService.recordConsent({
        patientId: 'patient-123',
        purpose: ConsentPurpose.enum.TREATMENT,
        channel: ConsentChannel.enum.WEB_PORTAL,
        language: 'pt-BR',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toBe('Connection failed');
    });

    it(_'should handle invalid consent data',_async () => {
      // Arrange
      mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-123' });
      mockPrisma.auditTrail.create.mockRejectedValue(
        new Error('Invalid data format'),
      );

      // Act
      const result = await consentService.recordConsent({
        patientId: 'patient-123',
        purpose: ConsentPurpose.enum.TREATMENT,
        channel: ConsentChannel.enum.WEB_PORTAL,
        language: 'pt-BR',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toBe('Invalid data format');
    });
  });

  describe(_'LGPD Compliance',_() => {
    it(_'should create audit trail for all consent operations',_async () => {
      // Arrange
      mockPrisma.patient.findUnique.mockResolvedValue({ id: 'patient-123' });
      mockPrisma.auditTrail.findFirst.mockResolvedValue(null);
      mockPrisma.auditTrail.create.mockResolvedValue({ id: 'consent-123' });

      // Act
      await consentService.recordConsent({
        patientId: 'patient-123',
        purpose: ConsentPurpose.enum.TREATMENT,
        channel: ConsentChannel.enum.WEB_PORTAL,
        language: 'pt-BR',
      });

      // Assert
      expect(mockPrisma.auditTrail.create).toHaveBeenCalledTimes(2);

      // First call should create consent record
      const firstCall = mockPrisma.auditTrail.create.mock.calls[0];
      expect(firstCall[0].data.action).toBe('CONSENT_GRANTED');
      expect(firstCall[0].data.entityType).toBe('LGPD_CONSENT');

      // Second call should create audit trail
      const secondCall = mockPrisma.auditTrail.create.mock.calls[1];
      expect(secondCall[0].data.action).toBe('LGPD_CONSENT_RECORD');
      expect(secondCall[0].data.entityType).toBe('CONSENT_MANAGEMENT');
    });

    it(_'should track consent withdrawal with detailed audit',_async () => {
      // Arrange
      const existingConsent = {
        id: 'consent-123',
        _userId: 'patient-123',
        metadata: {
          purpose: ConsentPurpose.enum.TREATMENT,
          status: 'ACTIVE',
        },
      };

      mockPrisma.auditTrail.findFirst.mockResolvedValue(existingConsent);
      mockPrisma.auditTrail.update.mockResolvedValue({ id: 'consent-123' });
      mockPrisma.auditTrail.create.mockResolvedValue({ id: 'audit-123' });

      // Act
      await consentService.withdrawConsent({
        patientId: 'patient-123',
        consentId: 'consent-123',
        reason: 'Patient requested withdrawal',
        channel: ConsentChannel.enum.WEB_PORTAL,
      });

      // Assert
      expect(mockPrisma.auditTrail.create).toHaveBeenCalledWith({
        data: {
          _userId: 'patient-123',
          action: 'CONSENT_WITHDRAWN',
          entityType: 'CONSENT_MANAGEMENT',
          entityId: 'consent-123',
          metadata: {
            originalPurpose: ConsentPurpose.enum.TREATMENT,
            reason: 'Patient requested withdrawal',
            channel: ConsentChannel.enum.WEB_PORTAL,
            timestamp: expect.any(String),
          },
        },
      });
    });

    it(_'should handle consent withdrawal data processing',_async () => {
      // Arrange
      const existingConsent = {
        id: 'consent-123',
        _userId: 'patient-123',
        metadata: {
          purpose: ConsentPurpose.enum.TREATMENT,
          status: 'ACTIVE',
        },
      };

      mockPrisma.auditTrail.findFirst.mockResolvedValue(existingConsent);
      mockPrisma.auditTrail.update.mockResolvedValue({ id: 'consent-123' });
      mockPrisma.auditTrail.create.mockResolvedValue({ id: 'audit-123' });

      // Spy on the private method
      const spy = vi.spyOn(consentService as any, 'handleConsentWithdrawal');

      // Act
      await consentService.withdrawConsent({
        patientId: 'patient-123',
        consentId: 'consent-123',
        reason: 'Patient requested withdrawal',
        channel: ConsentChannel.enum.WEB_PORTAL,
      });

      // Assert
      expect(spy).toHaveBeenCalledWith(
        'patient-123',
        ConsentPurpose.enum.TREATMENT,
      );
    });
  });
});
