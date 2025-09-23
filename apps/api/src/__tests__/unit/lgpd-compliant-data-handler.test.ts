/**
 * LGPD Compliant Data Handler Service Tests
 *
 * Comprehensive test suite for LGPD compliance features including
 * PII detection, consent management, and data retention
 */

import { describe, it, expect, beforeEach, jest, afterEach } from "vitest";
import { LGPDCompliantDataHandler } from "../../services/lgpd-compliant-data-handler";
import { AguiMessageType } from "../../services/agui-protocol/types";

// Mock external dependencies
const mockDatabase = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  query: jest.fn(),
};

const mockAuditService = {
  logEvent: jest.fn(),
  getAuditLogs: jest.fn(),
};

const mockConfig = {
  dataRetentionPeriods: {
    patientData: 365 * 5, // 5 years
    financialData: 365 * 10, // 10 years
    auditLogs: 365 * 7, // 7 years
    analyticsData: 365 * 2, // 2 years
  },
  piiDetectionPatterns: {
    cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?\d{10,15}$/,
    rg: /^\d{1,2}\.\d{3}\.\d{3}$/,
  },
  consentTypes: {
    treatment: "TREATMENT",
    dataSharing: "DATA_SHARING",
    marketing: "MARKETING",
    emergencyContact: "EMERGENCY_CONTACT",
    research: "RESEARCH",
  },
};

describe("LGPDCompliantDataHandler", () => {
  let lgpdService: LGPDCompliantDataHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    lgpdService = new LGPDCompliantDataHandler(
      mockDatabase as any,
      mockAuditService as any,
      mockConfig,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("PII Detection and Redaction", () => {
    describe("detectAndRedactPII", () => {
      it("should detect and redact CPF correctly", () => {
        const testData = {
          name: "João Silva",
          cpf: "123.456.789-00",
          email: "joao.silva@email.com",
          address: "Rua Teste, 123",
        };

        const result = lgpdService.detectAndRedactPII(testData);

        expect(result.processedData.cpf).toBe("[REDACTED_CPF]");
        expect(result.detectedPII).toContain("cpf");
        expect(result.redactionCount).toBe(1);
        expect(result.processedData.name).toBe("João Silva"); // Should not be redacted
      });

      it("should detect and redact email addresses", () => {
        const testData = {
          name: "Maria Santos",
          email: "maria.santos@email.com",
          secondaryEmail: "maria.santos2@email.com",
          phone: "+5511999999999",
        };

        const result = lgpdService.detectAndRedactPII(testData);

        expect(result.processedData.email).toBe("[REDACTED_EMAIL]");
        expect(result.processedData.secondaryEmail).toBe("[REDACTED_EMAIL]");
        expect(result.detectedPII).toContain("email");
        expect(result.redactionCount).toBe(2);
      });

      it("should detect and redact phone numbers", () => {
        const testData = {
          name: "José Oliveira",
          phone: "+5511988888888",
          emergencyPhone: "11977777777",
        };

        const result = lgpdService.detectAndRedactPII(testData);

        expect(result.processedData.phone).toBe("[REDACTED_PHONE]");
        expect(result.processedData.emergencyPhone).toBe("[REDACTED_PHONE]");
        expect(result.detectedPII).toContain("phone");
        expect(result.redactionCount).toBe(2);
      });

      it("should handle nested objects", () => {
        const testData = {
          patient: {
            name: "Ana Costa",
            cpf: "987.654.321-00",
            contact: {
              email: "ana.costa@email.com",
              phone: "+5511966666666",
            },
          },
          appointment: {
            date: "2024-01-01",
            type: "Consulta",
          },
        };

        const result = lgpdService.detectAndRedactPII(testData);

        expect(result.processedData.patient.cpf).toBe("[REDACTED_CPF]");
        expect(result.processedData.patient.contact.email).toBe(
          "[REDACTED_EMAIL]",
        );
        expect(result.processedData.patient.contact.phone).toBe(
          "[REDACTED_PHONE]",
        );
        expect(result.detectedPII).toEqual(["cpf", "email", "phone"]);
        expect(result.redactionCount).toBe(3);
      });

      it("should handle arrays of objects", () => {
        const testData = {
          patients: [
            { name: "Patient 1", email: "patient1@email.com" },
            { name: "Patient 2", cpf: "111.222.333-44" },
            { name: "Patient 3", phone: "+5511955555555" },
          ],
        };

        const result = lgpdService.detectAndRedactPII(testData);

        expect(result.processedData.patients[0].email).toBe("[REDACTED_EMAIL]");
        expect(result.processedData.patients[1].cpf).toBe("[REDACTED_CPF]");
        expect(result.processedData.patients[2].phone).toBe("[REDACTED_PHONE]");
        expect(result.redactionCount).toBe(3);
      });

      it("should handle null and undefined values safely", () => {
        const testData = {
          name: "Test User",
          email: null,
          phone: undefined,
          address: null,
        };

        const result = lgpdService.detectAndRedactPII(testData);

        expect(result.processedData.email).toBeNull();
        expect(result.processedData.phone).toBeUndefined();
        expect(result.redactionCount).toBe(0);
      });

      it("should create audit log for PII detection", () => {
        const testData = {
          name: "Test User",
          email: "test@email.com",
        };

        lgpdService.detectAndRedactPII(
          testData,
          "user-123",
          "client_registration",
        );

        expect(mockAuditService.logEvent).toHaveBeenCalledWith({
          userId: "user-123",
          action: "PII_DETECTED",
          resourceType: "client_registration",
          details: {
            detectedFields: ["email"],
            redactionCount: 1,
            processingContext: "client_registration",
          },
        });
      });
    });

    describe("isPIIField", () => {
      it("should identify PII fields correctly", () => {
        expect(lgpdService.isPIIField("cpf")).toBe(true);
        expect(lgpdService.isPIIField("email")).toBe(true);
        expect(lgpdService.isPIIField("phone")).toBe(true);
        expect(lgpdService.isPIIField("rg")).toBe(true);
        expect(lgpdService.isPIIField("name")).toBe(false); // Name not considered PII in this context
        expect(lgpdService.isPIIField("age")).toBe(false);
        expect(lgpdService.isPIIField("address")).toBe(false);
      });
    });

    describe("redactPIIValue", () => {
      it("should redact CPF values correctly", () => {
        const result = lgpdService.redactPIIValue("123.456.789-00", "cpf");
        expect(result).toBe("[REDACTED_CPF]");
      });

      it("should redact email values correctly", () => {
        const result = lgpdService.redactPIIValue("test@email.com", "email");
        expect(result).toBe("[REDACTED_EMAIL]");
      });

      it("should redact phone values correctly", () => {
        const result = lgpdService.redactPIIValue("+5511999999999", "phone");
        expect(result).toBe("[REDACTED_PHONE]");
      });

      it("should return original value for non-PII fields", () => {
        const result = lgpdService.redactPIIValue("João Silva", "name");
        expect(result).toBe("João Silva");
      });
    });
  });

  describe("Consent Management", () => {
    describe("validateConsentForProcessing", () => {
      it("should validate successful consent processing", async () => {
        const mockConsentRecords = [
          {
            id: "consent-123",
            consentType: "TREATMENT",
            status: "ACTIVE",
            expiresAt: "2025-12-31T23:59:59Z",
          },
          {
            id: "consent-124",
            consentType: "EMERGENCY_CONTACT",
            status: "ACTIVE",
            expiresAt: "2025-12-31T23:59:59Z",
          },
        ];

        mockDatabase.query.mockResolvedValue(mockConsentRecords);

        const result = await lgpdService.validateConsentForProcessing(
          "patient-123",
          ["treatment", "emergency_contact"],
          { medicalData: "test data" },
        );

        expect(result).toEqual({
          isValid: true,
          consentRecords: ["consent-123", "consent-124"],
          validatedAt: expect.any(String),
        });

        expect(mockDatabase.query).toHaveBeenCalledWith(
          expect.stringContaining("SELECT"),
          [
            "patient-123",
            expect.arrayContaining(["TREATMENT", "EMERGENCY_CONTACT"]),
          ],
        );
      });

      it("should identify missing required consents", async () => {
        const mockConsentRecords = [
          {
            id: "consent-123",
            consentType: "TREATMENT",
            status: "ACTIVE",
            expiresAt: "2025-12-31T23:59:59Z",
          },
        ];

        mockDatabase.query.mockResolvedValue(mockConsentRecords);

        const result = await lgpdService.validateConsentForProcessing(
          "patient-123",
          ["treatment", "data_sharing"],
          { medicalData: "test data" },
        );

        expect(result).toEqual({
          isValid: false,
          missingConsents: ["DATA_SHARING"],
          existingConsents: ["consent-123"],
          validatedAt: expect.any(String),
        });
      });

      it("should handle expired consents", async () => {
        const mockConsentRecords = [
          {
            id: "consent-123",
            consentType: "TREATMENT",
            status: "EXPIRED",
            expiresAt: "2023-12-31T23:59:59Z",
          },
        ];

        mockDatabase.query.mockResolvedValue(mockConsentRecords);

        const result = await lgpdService.validateConsentForProcessing(
          "patient-123",
          ["treatment"],
          { medicalData: "test data" },
        );

        expect(result).toEqual({
          isValid: false,
          missingConsents: ["TREATMENT"],
          expiredConsents: ["consent-123"],
          validatedAt: expect.any(String),
        });
      });

      it("should handle database errors gracefully", async () => {
        mockDatabase.query.mockRejectedValue(
          new Error("Database connection failed"),
        );

        const result = await lgpdService.validateConsentForProcessing(
          "patient-123",
          ["treatment"],
          { medicalData: "test data" },
        );

        expect(result).toEqual({
          isValid: false,
          error: "Database connection failed",
          validatedAt: expect.any(String),
        });

        expect(mockAuditService.logEvent).toHaveBeenCalledWith({
          userId: undefined,
          action: "CONSENT_VALIDATION_ERROR",
          resourceType: "patient_data",
          details: {
            error: "Database connection failed",
            requestedConsents: ["treatment"],
          },
        });
      });
    });

    describe("createConsentRecord", () => {
      it("should create consent record successfully", async () => {
        const consentData = {
          patientId: "patient-123",
          consentType: "TREATMENT",
          purpose: "Medical treatment processing",
          dataRecipients: ["clinic-staff"],
          retentionPeriod: "5 years",
          givenBy: "user-123",
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0...",
        };

        const mockConsentId = "consent-new-123";
        mockDatabase.insert.mockResolvedValue({ id: mockConsentId });

        const result = await lgpdService.createConsentRecord(consentData);

        expect(result).toEqual({
          success: true,
          consentId: mockConsentId,
          createdAt: expect.any(String),
        });

        expect(mockDatabase.insert).toHaveBeenCalledWith(
          "lgpd_consents",
          expect.objectContaining({
            patient_id: "patient-123",
            consent_type: "TREATMENT",
            status: "ACTIVE",
            purpose: "Medical treatment processing",
          }),
        );

        expect(mockAuditService.logEvent).toHaveBeenCalledWith({
          userId: "user-123",
          action: "CONSENT_CREATED",
          resourceType: "lgpd_consent",
          resourceId: mockConsentId,
          details: {
            consentType: "TREATMENT",
            patientId: "patient-123",
          },
        });
      });

      it("should handle consent creation errors", async () => {
        const consentData = {
          patientId: "patient-123",
          consentType: "TREATMENT",
          purpose: "Medical treatment",
        };

        mockDatabase.insert.mockRejectedValue(new Error("Insert failed"));

        const result = await lgpdService.createConsentRecord(consentData);

        expect(result).toEqual({
          success: false,
          error: "Insert failed",
        });
      });
    });

    describe("revokeConsent", () => {
      it("should revoke consent successfully", async () => {
        const consentId = "consent-123";
        const reason = "Patient requested withdrawal";

        mockDatabase.update.mockResolvedValue({
          id: consentId,
          status: "REVOKED",
        });

        const result = await lgpdService.revokeConsent(
          consentId,
          reason,
          "user-456",
        );

        expect(result).toEqual({
          success: true,
          consentId,
          revokedAt: expect.any(String),
        });

        expect(mockDatabase.update).toHaveBeenCalledWith(
          "lgpd_consents",
          { id: consentId },
          expect.objectContaining({
            status: "REVOKED",
          }),
        );
      });
    });
  });

  describe("Data Retention Management", () => {
    describe("processDataRetention", () => {
      it("should identify expired data for deletion", async () => {
        const mockExpiredData = [
          {
            id: "patient-123",
            fullName: "Test Patient",
            dataRetentionUntil: "2023-12-31T23:59:59Z",
          },
          {
            id: "patient-456",
            fullName: "Another Patient",
            dataRetentionUntil: "2024-01-15T23:59:59Z",
          },
        ];

        mockDatabase.query.mockResolvedValue(mockExpiredData);

        const result = await lgpdService.processDataRetention();

        expect(result).toEqual({
          processed: true,
          expiredRecords: mockExpiredData.length,
          deletedRecords: 0,
          processingTime: expect.any(Number),
          warnings: [],
        });

        expect(mockDatabase.query).toHaveBeenCalledWith(
          expect.stringContaining("SELECT"),
          [expect.any(String)],
        );
      });

      it("should delete expired data", async () => {
        const mockExpiredData = [
          {
            id: "patient-123",
            fullName: "Test Patient",
            dataRetentionUntil: "2023-12-31T23:59:59Z",
          },
        ];

        mockDatabase.query.mockResolvedValue(mockExpiredData);
        mockDatabase.delete.mockResolvedValue({ deletedCount: 1 });

        const result = await lgpdService.processDataRetention(true);

        expect(result).toEqual({
          processed: true,
          expiredRecords: 1,
          deletedRecords: 1,
          processingTime: expect.any(Number),
          warnings: [],
        });

        expect(mockDatabase.delete).toHaveBeenCalledWith("patients", {
          id: "patient-123",
        });
      });

      it("should handle dry run mode", async () => {
        const mockExpiredData = [
          {
            id: "patient-123",
            fullName: "Test Patient",
            dataRetentionUntil: "2023-12-31T23:59:59Z",
          },
        ];

        mockDatabase.query.mockResolvedValue(mockExpiredData);

        const result = await lgpdService.processDataRetention(false); // dry run

        expect(result).toEqual({
          processed: true,
          expiredRecords: 1,
          deletedRecords: 0,
          processingTime: expect.any(Number),
          warnings: ["Dry run mode - no data was actually deleted"],
        });

        expect(mockDatabase.delete).not.toHaveBeenCalled();
      });
    });

    describe("calculateRetentionDate", () => {
      it("should calculate patient data retention date", () => {
        const retentionDate = lgpdService.calculateRetentionDate("patientData");
        const expectedDate = new Date();
        expectedDate.setFullYear(expectedDate.getFullYear() + 5);

        expect(retentionDate).toBeInstanceOf(Date);
        expect(retentionDate.getFullYear()).toBe(expectedDate.getFullYear());
      });

      it("should calculate financial data retention date", () => {
        const retentionDate =
          lgpdService.calculateRetentionDate("financialData");
        const expectedDate = new Date();
        expectedDate.setFullYear(expectedDate.getFullYear() + 10);

        expect(retentionDate.getFullYear()).toBe(expectedDate.getFullYear());
      });

      it("should handle invalid data types", () => {
        expect(() => {
          lgpdService.calculateRetentionDate("invalidType" as any);
        }).toThrow("Invalid data type: invalidType");
      });
    });

    describe("extendRetentionPeriod", () => {
      it("should extend retention period successfully", async () => {
        const patientId = "patient-123";
        const extensionReason = "Legal hold requirement";
        const additionalDays = 365;

        mockDatabase.update.mockResolvedValue({
          id: patientId,
          dataRetentionUntil: expect.any(String),
        });

        const result = await lgpdService.extendRetentionPeriod(
          patientId,
          additionalDays,
          extensionReason,
          "admin-user",
        );

        expect(result).toEqual({
          success: true,
          patientId,
          extendedUntil: expect.any(String),
          extensionReason,
        });

        expect(mockDatabase.update).toHaveBeenCalledWith(
          "patients",
          { id: patientId },
          expect.objectContaining({
            data_retention_until: expect.any(String),
          }),
        );
      });
    });
  });

  describe("Audit Logging", () => {
    describe("createAuditLog", () => {
      it("should create audit log successfully", async () => {
        const auditData = {
          action: "VIEW" as const,
          resourceType: "PATIENT_RECORD" as const,
          resourceId: "patient-123",
          userId: "user-456",
          details: { accessReason: "Treatment consultation" },
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0...",
        };

        mockAuditService.logEvent.mockResolvedValue({
          id: "audit-123",
          ...auditData,
          timestamp: new Date().toISOString(),
        });

        const result = await lgpdService.createAuditLog(auditData);

        expect(result).toEqual({
          success: true,
          auditId: "audit-123",
          timestamp: expect.any(String),
        });

        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: "VIEW",
            resourceType: "PATIENT_RECORD",
            resourceId: "patient-123",
            userId: "user-456",
          }),
        );
      });
    });

    describe("getAccessLogs", () => {
      it("should retrieve access logs for a patient", async () => {
        const patientId = "patient-123";
        const mockLogs = [
          {
            id: "audit-123",
            action: "VIEW",
            resourceType: "PATIENT_RECORD",
            userId: "user-456",
            timestamp: "2024-01-01T10:00:00Z",
          },
        ];

        mockAuditService.getAuditLogs.mockResolvedValue(mockLogs);

        const result = await lgpdService.getAccessLogs(patientId);

        expect(result).toEqual({
          success: true,
          logs: mockLogs,
          total: 1,
        });

        expect(mockAuditService.getAuditLogs).toHaveBeenCalledWith({
          resourceId: patientId,
          resourceType: "PATIENT_RECORD",
          limit: 100,
          offset: 0,
        });
      });

      it("should handle date range filtering", async () => {
        const patientId = "patient-123";
        const startDate = "2024-01-01T00:00:00Z";
        const endDate = "2024-12-31T23:59:59Z";

        await lgpdService.getAccessLogs(patientId, startDate, endDate);

        expect(mockAuditService.getAuditLogs).toHaveBeenCalledWith(
          expect.objectContaining({
            resourceId: patientId,
            startDate,
            endDate,
          }),
        );
      });
    });
  });

  describe("Data Subject Rights", () => {
    describe("exportUserData", () => {
      it("should export user data in compliant format", async () => {
        const userId = "user-123";
        const mockUserData = {
          profile: {
            id: userId,
            fullName: "João Silva",
            email: "joao.silva@email.com",
            createdAt: "2024-01-01T00:00:00Z",
          },
          consents: [
            {
              id: "consent-123",
              consentType: "TREATMENT",
              status: "ACTIVE",
              createdAt: "2024-01-01T00:00:00Z",
            },
          ],
          auditLogs: [
            {
              id: "audit-123",
              action: "VIEW",
              timestamp: "2024-01-01T10:00:00Z",
            },
          ],
        };

        // Mock database queries
        mockDatabase.query.mockImplementation((query: string) => {
          if (query.includes("profile")) {
            return Promise.resolve([mockUserData.profile]);
          } else if (query.includes("consents")) {
            return Promise.resolve(mockUserData.consents);
          } else if (query.includes("audit")) {
            return Promise.resolve(mockUserData.auditLogs);
          }
          return Promise.resolve([]);
        });

        const result = await lgpdService.exportUserData(userId);

        expect(result).toEqual({
          success: true,
          data: mockUserData,
          exportedAt: expect.any(String),
          format: "json",
          complianceInfo: {
            lgpdCompliant: true,
            allDataIncluded: true,
            redactionApplied: true,
          },
        });

        expect(mockAuditService.logEvent).toHaveBeenCalledWith({
          userId,
          action: "DATA_EXPORT",
          resourceType: "USER_ACCOUNT",
          details: {
            exportFormat: "json",
            dataCategories: ["profile", "consents", "auditLogs"],
          },
        });
      });
    });

    describe("deleteUserData", () => {
      it("should handle user data deletion request", async () => {
        const userId = "user-123";
        const reason = "Right to be forgotten request";
        const requestReference = "GDPR-DELETE-123";

        mockDatabase.delete.mockResolvedValue({ deletedCount: 5 });

        const result = await lgpdService.deleteUserData(
          userId,
          reason,
          requestReference,
        );

        expect(result).toEqual({
          success: true,
          userId,
          deletedRecords: 5,
          deletionReference: requestReference,
          completedAt: expect.any(String),
        });

        expect(mockAuditService.logEvent).toHaveBeenCalledWith({
          userId,
          action: "DATA_DELETION",
          resourceType: "USER_ACCOUNT",
          details: {
            reason,
            requestReference,
            deletedRecords: 5,
          },
        });
      });

      it("should handle deletion with legal holds", async () => {
        const userId = "user-123";
        const mockLegalHolds = [
          {
            id: "hold-123",
            reason: "Legal investigation",
            expiresAt: "2025-12-31T23:59:59Z",
          },
        ];

        mockDatabase.query.mockResolvedValue(mockLegalHolds);

        const result = await lgpdService.deleteUserData(userId);

        expect(result).toEqual({
          success: false,
          error: "Cannot delete data - legal holds exist",
          legalHolds: mockLegalHolds,
        });

        expect(mockDatabase.delete).not.toHaveBeenCalled();
      });
    });
  });

  describe("Configuration Management", () => {
    describe("updatePIIPatterns", () => {
      it("should update PII detection patterns", () => {
        const newPatterns = {
          customId: /^[A-Z]{2}\d{6}$/,
          passport: /^[A-Z0-9]{9}$/,
        };

        lgpdService.updatePIIPatterns(newPatterns);

        expect(lgpdService["config"].piiDetectionPatterns).toEqual(
          expect.objectContaining(newPatterns),
        );
      });
    });

    describe("updateRetentionPeriods", () => {
      it("should update data retention periods", () => {
        const newPeriods = {
          patientData: 365 * 7, // 7 years
          auditLogs: 365 * 10, // 10 years
        };

        lgpdService.updateRetentionPeriods(newPeriods);

        expect(lgpdService["config"].dataRetentionPeriods).toEqual(
          expect.objectContaining(newPeriods),
        );
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle database connection errors gracefully", async () => {
      mockDatabase.query.mockRejectedValue(new Error("Connection timeout"));

      const result = await lgpdService.getAccessLogs("patient-123");

      expect(result).toEqual({
        success: false,
        error: "Connection timeout",
      });
    });

    it("should handle validation errors", () => {
      expect(() => {
        lgpdService.calculateRetentionDate("invalid" as any);
      }).toThrow("Invalid data type");
    });

    it("should handle malformed data in PII detection", () => {
      const malformedData = null;

      const result = lgpdService.detectAndRedactPII(malformedData as any);

      expect(result).toEqual({
        processedData: null,
        detectedPII: [],
        redactionCount: 0,
      });
    });
  });

  describe("Performance and Metrics", () => {
    it("should track processing metrics", async () => {
      const startTime = Date.now();
      const testData = { email: "test@email.com" };

      lgpdService.detectAndRedactPII(testData);
      const endTime = Date.now();

      const metrics = lgpdService.getMetrics();

      expect(metrics.piiDetection.totalCalls).toBeGreaterThan(0);
      expect(metrics.piiDetection.averageProcessingTime).toBeGreaterThan(0);
      expect(metrics.piiDetection.totalRedactions).toBeGreaterThan(0);
    });

    it("should track consent validation metrics", async () => {
      mockDatabase.query.mockResolvedValue([]);

      await lgpdService.validateConsentForProcessing(
        "patient-123",
        ["treatment"],
        {},
      );

      const metrics = lgpdService.getMetrics();

      expect(metrics.consentValidation.totalCalls).toBeGreaterThan(0);
      expect(metrics.consentValidation.averageResponseTime).toBeGreaterThan(0);
    });
  });
});
