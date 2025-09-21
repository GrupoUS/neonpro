import { describe, it, expect, beforeEach } from "vitest";
import { RepositoryContainer } from "../../containers/repository-container.js";
import { ConsentDomainService } from "@neonpro/domain";
import { ConsentRequest, ConsentType, ConsentStatus } from "@neonpro/domain";

// Mock Supabase client for testing
const createMockSupabaseClient = () => {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => Promise.resolve({ data: [], error: null })
        }),
        gte: () => ({
          lte: () => ({
            order: () => Promise.resolve({ data: [], error: null, count: 0 })
          })
        }),
        or: () => ({
          order: () => Promise.resolve({ data: [], error: null })
        }),
        in: () => ({
          order: () => Promise.resolve({ data: [], error: null })
        })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ 
            data: { 
              id: "test-consent-id",
              patient_id: "test-patient-id",
              consent_type: ConsentType.DATA_PROCESSING,
              status: ConsentStatus.ACTIVE,
              granted_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, 
            error: null 
          })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ 
              data: { 
                id: "test-consent-id",
                status: ConsentStatus.REVOKED,
                revoked_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, 
              error: null 
            })
          })
        })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null })
      })
    })
  } as any;
};

describe(_"Domain Services Integration Tests",_() => {
  let container: RepositoryContainer;
  let consentService: ConsentDomainService;

  beforeEach(_() => {
    const mockSupabase = createMockSupabaseClient();
    container = RepositoryContainer.initialize(mockSupabase);
    consentService = container.getConsentService();
  });

  describe(_"ConsentDomainService",_() => {
    it(_"should create consent with proper validation",_async () => {
      const _request: ConsentRequest = {
        patientId: "test-patient-id",
        consentType: ConsentType.DATA_PROCESSING,
        purpose: "Healthcare treatment",
        dataTypes: ["medical_records", "personal_data"],
        expiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      const consent = await consentService.createConsent(request, "test-user");
      expect(consent).toBeDefined();
      expect(consent.id).toBe("test-consent-id");
      expect(consent.patientId).toBe("test-patient-id");
      expect(consent.consentType).toBe(ConsentType.DATA_PROCESSING);
      expect(consent.status).toBe(ConsentStatus.ACTIVE);
    });

    it(_"should validate consent data types",_async () => {
      const _request: ConsentRequest = {
        patientId: "test-patient-id",
        consentType: ConsentType.DATA_PROCESSING,
        purpose: "Healthcare treatment",
        dataTypes: [] // Empty data types should be invalid
      };

      // This should fail validation in the domain service
      await expect(consentService.createConsent(request, "test-user"))
        .rejects.toThrow();
    });

    it(_"should check compliance for patient",_async () => {
      const complianceCheck = await consentService.checkCompliance("test-patient-id");
      expect(complianceCheck).toBeDefined();
      expect(complianceCheck).toHaveProperty("isCompliant");
      expect(complianceCheck).toHaveProperty("riskLevel");
      expect(complianceCheck).toHaveProperty("violations");
      expect(Array.isArray(complianceCheck.violations)).toBe(true);
    });

    it(_"should revoke consent properly",_async () => {
      const revokedConsent = await consentService.revokeConsent("test-consent-id");
      expect(revokedConsent).toBeDefined();
      expect(revokedConsent.status).toBe(ConsentStatus.REVOKED);
      expect(revokedConsent.revokedAt).toBeDefined();
    });

    it(_"should find consents by patient",_async () => {
      const consents = await consentService.findConsentsByPatient("test-patient-id");
      expect(Array.isArray(consents)).toBe(true);
    });

    it(_"should get active consents for patient",_async () => {
      const activeConsents = await consentService.getActiveConsents("test-patient-id");
      expect(Array.isArray(activeConsents)).toBe(true);
    });

    it(_"should check for specific consent type",_async () => {
      const hasConsent = await consentService.hasActiveConsent("test-patient-id", ConsentType.DATA_PROCESSING);
      expect(typeof hasConsent).toBe("boolean");
    });
  });

  describe(_"Domain Service Benefits",_() => {
    it(_"should encapsulate business logic",_() => {
      expect(consentService).toBeDefined();
      expect(typeof consentService.createConsent).toBe("function");
      expect(typeof consentService.checkCompliance).toBe("function");
      expect(typeof consentService.revokeConsent).toBe("function");
    });

    it(_"should provide domain-driven operations",_() => {
      // Domain services should operate on domain concepts
      expect(consentService.createConsent).toBeDefined();
      expect(consentService.checkCompliance).toBeDefined();
    });

    it(_"should be testable with dependency injection",_() => {
      // The fact that we can inject a mock repository
      // demonstrates the benefit of the architecture
      expect(consentService).toBeDefined();
    });
  });

  describe(_"Cross-Service Integration",_() => {
    it(_"should work with audit service integration",_async () => {
      const auditService = container.getAuditService();
      expect(auditService).toBeDefined();
      expect(typeof auditService.createAuditLog).toBe("function");
    });

    it(_"should provide consistent service interfaces",_() => {
      const services = container.getServices();
      expect(services).toHaveProperty("audit");
      expect(services).toHaveProperty("consent");
      
      // All services should have consistent method signatures
      expect(typeof services.audit.createAuditLog).toBe("function");
      expect(typeof services.consent.createConsent).toBe("function");
    });
  });
});