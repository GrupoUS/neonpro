// Compliance Validators Tests (Phase 4)

import { describe, it, expect } from "vitest";
import {
  ComplianceValidator,
  LGPDValidator,
  ANVISAValidator,
  CFMValidator,
} from "../validators";
import type {
  GenericAuditEvent,
  ConsentReference,
  ComplianceFramework,
} from "../types";

describe(_"Compliance Validators",_() => {
  describe(_"LGPDValidator",_() => {
    describe(_"requiresConsent",_() => {
      it(_"should require consent for data operations",_() => {
        expect(LGPDValidator.requiresConsent("READ")).toBe(true);
        expect(LGPDValidator.requiresConsent("CREATE")).toBe(true);
        expect(LGPDValidator.requiresConsent("UPDATE")).toBe(true);
        expect(LGPDValidator.requiresConsent("DELETE")).toBe(true);
        expect(LGPDValidator.requiresConsent("ACCESS")).toBe(true);
        expect(LGPDValidator.requiresConsent("PRESCRIBE")).toBe(true);
        expect(LGPDValidator.requiresConsent("DIAGNOSE")).toBe(true);
      });

      it(_"should not require consent for non-data operations",_() => {
        expect(LGPDValidator.requiresConsent("LOGIN")).toBe(false);
        expect(LGPDValidator.requiresConsent("LOGOUT")).toBe(false);
        expect(LGPDValidator.requiresConsent("BACKUP")).toBe(false);
      });
    });

    describe(_"validateConsent",_() => {
      it(_"should return violation when no consent provided",_() => {
        const violations = LGPDValidator.validateConsent();
        expect(violations).toHaveLength(1);
        expect(violations[0].framework).toBe("LGPD");
        expect(violations[0].severity).toBe("HIGH");
        expect(violations[0].description).toContain(
          "No consent reference provided",
        );
      });

      it(_"should return violation for inactive consent",_() => {
        const consentRef: ConsentReference = {
          id: "consent-123",
          type: "data_processing",
          grantedAt: new Date().toISOString(),
          status: "REVOKED",
          framework: "LGPD",
        };

        const violations = LGPDValidator.validateConsent(consentRef);
        expect(violations).toHaveLength(1);
        expect(violations[0].severity).toBe("CRITICAL");
        expect(violations[0].description).toContain(
          "Consent status is REVOKED",
        );
      });

      it(_"should return violation for expired consent",_() => {
        const consentRef: ConsentReference = {
          id: "consent-123",
          type: "data_processing",
          grantedAt: new Date(Date.now() - 86400000).toISOString(),
          expiresAt: new Date(Date.now() - 3600000).toISOString(), // Expired 1 hour ago
          status: "ACTIVE",
          framework: "LGPD",
        };

        const violations = LGPDValidator.validateConsent(consentRef);
        expect(violations).toHaveLength(1);
        expect(violations[0].severity).toBe("HIGH");
        expect(violations[0].description).toContain("Consent has expired");
      });

      it(_"should return no violations for valid consent",_() => {
        const consentRef: ConsentReference = {
          id: "consent-123",
          type: "data_processing",
          grantedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(), // Expires tomorrow
          status: "ACTIVE",
          framework: "LGPD",
        };

        const violations = LGPDValidator.validateConsent(consentRef);
        expect(violations).toHaveLength(0);
      });
    });

    describe(_"assessRisk",_() => {
      it(_"should assess CRITICAL risk for DELETE actions",_() => {
        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "DELETE",
          actor: { id: "user-1", type: "PATIENT" },
          timestamp: new Date().toISOString(),
          resource: { type: "record", id: "rec-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["LGPD"],
        };

        expect(LGPDValidator.assessRisk(auditEvent)).toBe("CRITICAL");
      });

      it(_"should assess HIGH risk for medical actions",_() => {
        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "PRESCRIBE",
          actor: { id: "doctor-1", type: "DOCTOR" },
          timestamp: new Date().toISOString(),
          resource: { type: "prescription", id: "rx-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["LGPD"],
        };

        expect(LGPDValidator.assessRisk(auditEvent)).toBe("HIGH");
      });

      it(_"should assess HIGH risk for system actors",_() => {
        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "READ",
          actor: { id: "system-1", type: "SYSTEM" },
          timestamp: new Date().toISOString(),
          resource: { type: "record", id: "rec-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["LGPD"],
        };

        expect(LGPDValidator.assessRisk(auditEvent)).toBe("HIGH");
      });

      it(_"should assess MEDIUM risk for admin actors",_() => {
        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "READ",
          actor: { id: "admin-1", type: "ADMIN" },
          timestamp: new Date().toISOString(),
          resource: { type: "record", id: "rec-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["LGPD"],
        };

        expect(LGPDValidator.assessRisk(auditEvent)).toBe("MEDIUM");
      });

      it(_"should assess LOW risk for normal patient actions",_() => {
        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "READ",
          actor: { id: "patient-1", type: "PATIENT" },
          timestamp: new Date().toISOString(),
          resource: { type: "record", id: "rec-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["LGPD"],
        };

        expect(LGPDValidator.assessRisk(auditEvent)).toBe("LOW");
      });
    });
  });

  describe(_"ANVISAValidator",_() => {
    describe(_"requiresTracking",_() => {
      it(_"should require tracking for medical actions",_() => {
        expect(ANVISAValidator.requiresTracking("PRESCRIBE")).toBe(true);
        expect(ANVISAValidator.requiresTracking("DIAGNOSE")).toBe(true);
        expect(ANVISAValidator.requiresTracking("MODIFY")).toBe(true);
        expect(ANVISAValidator.requiresTracking("DELETE")).toBe(true);
      });

      it(_"should not require tracking for non-medical actions",_() => {
        expect(ANVISAValidator.requiresTracking("READ")).toBe(false);
        expect(ANVISAValidator.requiresTracking("LOGIN")).toBe(false);
      });
    });

    describe(_"validateMedicalAction",_() => {
      it(_"should return violation for unauthorized medical action",_() => {
        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "PRESCRIBE",
          actor: { id: "patient-1", type: "PATIENT" },
          timestamp: new Date().toISOString(),
          resource: { type: "prescription", id: "rx-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["ANVISA"],
        };

        const violations = ANVISAValidator.validateMedicalAction(auditEvent);
        expect(violations.length).toBeGreaterThanOrEqual(1);
        expect(violations[0].framework).toBe("ANVISA");
        expect(violations[0].severity).toBe("CRITICAL");
        expect(violations[0].description).toContain(
          "unauthorized actor PATIENT",
        );
      });

      it(_"should return violation for incomplete identification",_() => {
        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "PRESCRIBE",
          actor: { id: "doctor-1", type: "DOCTOR" }, // Missing name and email
          timestamp: new Date().toISOString(),
          resource: { type: "prescription", id: "rx-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["ANVISA"],
        };

        const violations = ANVISAValidator.validateMedicalAction(auditEvent);
        expect(violations).toHaveLength(1);
        expect(violations[0].severity).toBe("HIGH");
        expect(violations[0].description).toContain(
          "Incomplete medical professional identification",
        );
      });

      it(_"should return no violations for valid medical action",_() => {
        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "PRESCRIBE",
          actor: {
            id: "doctor-1",
            type: "DOCTOR",
            name: "Dr. Silva",
            email: "dr.silva@clinic.com",
          },
          timestamp: new Date().toISOString(),
          resource: { type: "prescription", id: "rx-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["ANVISA"],
        };

        const violations = ANVISAValidator.validateMedicalAction(auditEvent);
        expect(violations).toHaveLength(0);
      });
    });
  });

  describe(_"CFMValidator",_() => {
    describe(_"validateTelemedicine",_() => {
      it(_"should return violation for unauthorized telemedicine diagnosis",_() => {
        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "DIAGNOSE",
          actor: { id: "doctor-1", type: "DOCTOR" },
          timestamp: new Date().toISOString(),
          resource: { type: "diagnosis", id: "diag-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["CFM"],
          metadata: { telemedicineAuthorized: false },
        };

        const violations = CFMValidator.validateTelemedicine(auditEvent);
        expect(violations).toHaveLength(2); // Both authorization and consent violations
        expect(violations[0].framework).toBe("CFM");
        expect(violations[0].description).toContain(
          "without proper authorization",
        );
      });

      it(_"should return violation for telemedicine without consent",_() => {
        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "DIAGNOSE",
          actor: { id: "doctor-1", type: "DOCTOR" },
          timestamp: new Date().toISOString(),
          resource: { type: "diagnosis", id: "diag-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["CFM"],
          metadata: { telemedicineAuthorized: true },
          // No consentRef
        };

        const violations = CFMValidator.validateTelemedicine(auditEvent);
        expect(violations).toHaveLength(1);
        expect(violations[0].description).toContain(
          "without explicit patient consent",
        );
      });

      it(_"should return no violations for valid telemedicine",_() => {
        const consentRef: ConsentReference = {
          id: "consent-tele",
          type: "telemedicine",
          grantedAt: new Date().toISOString(),
          status: "ACTIVE",
          framework: "CFM",
        };

        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "DIAGNOSE",
          actor: { id: "doctor-1", type: "DOCTOR" },
          timestamp: new Date().toISOString(),
          resource: { type: "diagnosis", id: "diag-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["CFM"],
          consentRef,
          metadata: { telemedicineAuthorized: true },
        };

        const violations = CFMValidator.validateTelemedicine(auditEvent);
        expect(violations).toHaveLength(0);
      });
    });

    describe(_"validatePrescription",_() => {
      it(_"should return violation for prescription by non-doctor",_() => {
        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "PRESCRIBE",
          actor: { id: "nurse-1", type: "NURSE" },
          timestamp: new Date().toISOString(),
          resource: { type: "prescription", id: "rx-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["CFM"],
        };

        const violations = CFMValidator.validatePrescription(auditEvent);
        expect(violations.length).toBeGreaterThanOrEqual(1);
        expect(violations[0].severity).toBe("CRITICAL");
        expect(violations[0].description).toContain(
          "Prescription by non-doctor",
        );
      });

      it(_"should return violation for incomplete prescription documentation",_() => {
        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "PRESCRIBE",
          actor: { id: "doctor-1", type: "DOCTOR" },
          timestamp: new Date().toISOString(),
          resource: { type: "prescription", id: "rx-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["CFM"],
          metadata: {}, // Missing prescriptionId and patientId
        };

        const violations = CFMValidator.validatePrescription(auditEvent);
        expect(violations).toHaveLength(1);
        expect(violations[0].severity).toBe("HIGH");
        expect(violations[0].description).toContain(
          "Incomplete prescription documentation",
        );
      });

      it(_"should return no violations for valid prescription",_() => {
        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "PRESCRIBE",
          actor: { id: "doctor-1", type: "DOCTOR" },
          timestamp: new Date().toISOString(),
          resource: { type: "prescription", id: "rx-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["CFM"],
          metadata: {
            prescriptionId: "rx-123",
            patientId: "patient-456",
          },
        };

        const violations = CFMValidator.validatePrescription(auditEvent);
        expect(violations).toHaveLength(0);
      });
    });
  });

  describe(_"ComplianceValidator",_() => {
    describe(_"validateEvent",_() => {
      it(_"should validate event against LGPD framework",_() => {
        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "READ",
          actor: { id: "patient-1", type: "PATIENT" },
          timestamp: new Date().toISOString(),
          resource: { type: "record", id: "rec-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["LGPD"],
          // No consent provided
        };

        const result = ComplianceValidator.validateEvent(auditEvent);

        expect(result.complianceStatus).toBe("NON_COMPLIANT");
        expect(result.violations).toHaveLength(1);
        expect(result.violations[0].framework).toBe("LGPD");
        expect(result.riskLevel).toBeDefined();
      });

      it(_"should validate event against multiple frameworks",_() => {
        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "PRESCRIBE",
          actor: { id: "patient-1", type: "PATIENT" }, // Wrong actor type
          timestamp: new Date().toISOString(),
          resource: { type: "prescription", id: "rx-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["LGPD", "ANVISA", "CFM"],
        };

        const result = ComplianceValidator.validateEvent(auditEvent);

        expect(result.complianceStatus).toBe("NON_COMPLIANT");
        expect(result.violations.length).toBeGreaterThan(1);

        // Should have violations from multiple frameworks
        const frameworks = result.violations.map(_(v) => v.framework);
        expect(frameworks).toContain("LGPD");
        expect(frameworks).toContain("ANVISA");
        expect(frameworks).toContain("CFM");
      });

      it(_"should return compliant status for valid event",_() => {
        const consentRef: ConsentReference = {
          id: "consent-valid",
          type: "data_processing",
          grantedAt: new Date().toISOString(),
          status: "ACTIVE",
          framework: "LGPD",
        };

        const auditEvent: GenericAuditEvent = {
          id: "audit-1",
          action: "READ",
          actor: { id: "patient-1", type: "PATIENT" },
          timestamp: new Date().toISOString(),
          resource: { type: "record", id: "rec-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["LGPD"],
          consentRef,
        };

        const result = ComplianceValidator.validateEvent(auditEvent);

        expect(result.complianceStatus).toBe("COMPLIANT");
        expect(result.violations).toHaveLength(0);
      });

      it(_"should add audit event ID to violations",_() => {
        const auditEvent: GenericAuditEvent = {
          id: "audit-specific-id",
          action: "READ",
          actor: { id: "patient-1", type: "PATIENT" },
          timestamp: new Date().toISOString(),
          resource: { type: "record", id: "rec-1" },
          clinicId: "clinic-1",
          riskLevel: "LOW",
          complianceStatus: "UNKNOWN",
          frameworks: ["LGPD"],
        };

        const result = ComplianceValidator.validateEvent(auditEvent);

        expect(result.violations.length).toBeGreaterThan(0);
        result.violations.forEach(_(violation) => {
          expect(violation.auditEventId).toBe("audit-specific-id");
        });
      });
    });

    describe(_"requiresConsent",_() => {
      it(_"should require consent for LGPD framework",_() => {
        expect(ComplianceValidator.requiresConsent("READ", ["LGPD"])).toBe(
          true,
        );
        expect(ComplianceValidator.requiresConsent("CREATE", ["LGPD"])).toBe(
          true,
        );
      });

      it(_"should require consent for GDPR framework",_() => {
        expect(ComplianceValidator.requiresConsent("READ", ["GDPR"])).toBe(
          true,
        );
        expect(ComplianceValidator.requiresConsent("CREATE", ["GDPR"])).toBe(
          true,
        );
      });

      it(_"should not require consent for other frameworks",_() => {
        expect(ComplianceValidator.requiresConsent("READ", ["ANVISA"])).toBe(
          false,
        );
        expect(ComplianceValidator.requiresConsent("READ", ["CFM"])).toBe(
          false,
        );
      });

      it(_"should require consent if any framework requires it",_() => {
        expect(
          ComplianceValidator.requiresConsent("READ", ["LGPD", "ANVISA"]),
        ).toBe(true);
        expect(
          ComplianceValidator.requiresConsent("READ", ["ANVISA", "CFM"]),
        ).toBe(false);
      });
    });
  });
});
