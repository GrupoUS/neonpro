/**
 * Unit tests for CFMValidationService and cfmUtils
 * Testing library/framework: Vitest (describe/it/expect/vi). These tests also avoid runner-specific globals where possible.
 *
 * Focus: Validate public interfaces touched in the recent changes:
 *  - CFMValidationService: validateLicense, validateMultipleLicenses, getValidationStats, clearCache, getCacheSize,
 *    checkExpirationWarnings, getAuditTrail, generateValidationReport
 *  - cfmUtils: formatCRMNumber, isValidCRMFormat, getStateCouncilURL, isLicenseExpiringSoon, getStatusColor, getSpecialtyDisplayName
 *
 * Notes:
 *  - We mock the private callCFMAPI method to avoid real delays and external calls.
 *  - We reset cache and audit trail between tests to avoid state bleed.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Import the implementation (the implementation file currently has a .test.ts suffix)
import CFMValidationService, {
  cfmUtils,
  cfmValidationService,
} from "../cfm-professional-validation.test";

// Helpers
type AnyObj = Record<string, any>;

function makeProfessional(partial: Partial<AnyObj> = {}): AnyObj {
  const base = {
    id: "cfm-SP-123456",
    state: "SP",
    crmNumber: "CRM-SP 123456",
    fullName: "Dr. Teste",
    cpf: "000.000.000-00",
    specialties: ["dermatologia"],
    status: "active",
    registrationDate: new Date("2020-01-01T00:00:00.000Z"),
    validUntil: new Date("2026-12-31T00:00:00.000Z"),
    restrictions: [] as string[],
  };
  return { ...base, ...partial };
}

const svc = cfmValidationService;

function resetAuditTrail() {
  // Private field, safe to reset in tests
  (svc as AnyObj).auditTrail = [];
}

beforeEach(() => {
  svc.clearCache();
  resetAuditTrail();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("cfmUtils", () => {
  describe("formatCRMNumber", () => {
    it("normalizes common variants to CRM-XX NNNNNN", () => {
      expect(cfmUtils.formatCRMNumber(" crm sp 123456 ")).toBe("CRM-SP 123456");
      expect(cfmUtils.formatCRMNumber("crm-sp123456")).toBe("CRM-SP 123456");
      expect(cfmUtils.formatCRMNumber("CrM sP 001234")).toBe("CRM-SP 001234");
    });

    it("returns original input if it does not match expected pattern", () => {
      const original = "SP 123456";
      expect(cfmUtils.formatCRMNumber(original)).toBe(original);
    });
  });

  describe("isValidCRMFormat", () => {
    it("accepts valid formats", () => {
      expect(cfmUtils.isValidCRMFormat("CRM-SP 1234")).toBe(true);
      expect(cfmUtils.isValidCRMFormat("CRM-SP 123456")).toBe(true);
      expect(cfmUtils.isValidCRMFormat("crm sp 12345")).toBe(true);
      expect(cfmUtils.isValidCRMFormat("CRM-SP123456")).toBe(true);
    });

    it("rejects invalid formats", () => {
      expect(cfmUtils.isValidCRMFormat("SP 12345")).toBe(false);
      expect(cfmUtils.isValidCRMFormat("CRM 12345")).toBe(false);
      expect(cfmUtils.isValidCRMFormat("CRM-XX 123")).toBe(false);
      expect(cfmUtils.isValidCRMFormat("")).toBe(false);
    });
  });

  describe("getStateCouncilURL", () => {
    it("returns correct URL for a known state", () => {
      expect(cfmUtils.getStateCouncilURL("SP" as any)).toBe("https://cremesp.org.br");
    });
  });

  describe("isLicenseExpiringSoon", () => {
    it("returns true when validUntil is within the next N days (inclusive)", () => {
      const base = new Date("2025-01-01T00:00:00.000Z").getTime();
      const nowSpy = vi.spyOn(Date, "now").mockImplementation(() => base);

      // within 30 days -> true
      const within = new Date(base + 29 * 24 * 60 * 60 * 1000);
      expect(cfmUtils.isLicenseExpiringSoon(within)).toBe(true);

      // exactly at 30 days -> true (inclusive)
      const exact = new Date(base + 30 * 24 * 60 * 60 * 1000);
      expect(cfmUtils.isLicenseExpiringSoon(exact)).toBe(true);

      // beyond 30 days -> false
      const beyond = new Date(base + 31 * 24 * 60 * 60 * 1000);
      expect(cfmUtils.isLicenseExpiringSoon(beyond)).toBe(false);

      nowSpy.mockRestore();
    });
  });

  describe("getStatusColor", () => {
    it("maps statuses to the correct color and falls back to gray", () => {
      expect(cfmUtils.getStatusColor("active" as any)).toBe("#059669");
      expect(cfmUtils.getStatusColor("pending" as any)).toBe("#d97706");
      expect(cfmUtils.getStatusColor("expired" as any)).toBe("#dc2626");
      expect(cfmUtils.getStatusColor("suspended" as any)).toBe("#6b7280");
      expect(cfmUtils.getStatusColor("cancelled" as any)).toBe("#ef4444");
      // unknown -> fallback to suspended gray
      expect(cfmUtils.getStatusColor("unknown" as any)).toBe("#6b7280");
    });
  });

  describe("getSpecialtyDisplayName", () => {
    it("returns localized Portuguese names", () => {
      expect(cfmUtils.getSpecialtyDisplayName("dermatologia" as any)).toBe("Dermatologia");
      expect(cfmUtils.getSpecialtyDisplayName("medicina-estetica" as any)).toBe(
        "Medicina Estética",
      );
      expect(cfmUtils.getSpecialtyDisplayName("cirurgia-plastica" as any)).toBe(
        "Cirurgia Plástica",
      );
      // unknown -> echoes input
      expect(cfmUtils.getSpecialtyDisplayName("foo" as any)).toBe("foo");
    });
  });
});

describe("CFMValidationService", () => {
  describe("validateLicense - happy paths", () => {
    it("returns active result with no warnings when professional has no restrictions", async () => {
      const spy = vi
        .spyOn(svc as AnyObj, "callCFMAPI")
        .mockResolvedValue(
          makeProfessional({
            state: "SP",
            crmNumber: "CRM-SP 123456",
            restrictions: [],
            status: "active",
          }),
        );

      const res = await svc.validateLicense("CRM-SP 123456");
      expect(res.isValid).toBe(true);
      expect(res.source).toBe("cfm-api");
      expect(res.errors).toEqual([]);
      expect(res.warnings).toEqual([]);
      expect(res.data?.license).toBe("CRM-SP 123456");
      expect(res.data?.state).toBe("SP");
      expect(res.data?.verificationSource).toBe("cfm-api");
      expect(svc.getCacheSize()).toBe(1);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("includes warnings when the professional has restrictions", async () => {
      const spy = vi
        .spyOn(svc as AnyObj, "callCFMAPI")
        .mockResolvedValue(
          makeProfessional({
            restrictions: ["Proibido prescrever substâncias controladas classe A"],
          }),
        );

      const res = await svc.validateLicense("CRM-SP 999999");
      expect(res.isValid).toBe(true);
      expect(res.warnings).toContain("Profissional possui restrições");
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("validateLicense - error and edge cases", () => {
    it("returns error when professional is not found in CFM", async () => {
      const spy = vi.spyOn(svc as AnyObj, "callCFMAPI").mockResolvedValue(null);

      const res = await svc.validateLicense("CRM-SP 000000");
      expect(res.isValid).toBe(false);
      expect(res.source).toBe("cfm-api");
      expect(res.data?.status).toBe("suspended"); // as per implementation for not found
      expect(res.errors).toContain("CRM não encontrado na base de dados");
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("handles invalid CRM format with a friendly error", async () => {
      const res = await svc.validateLicense("INVALID-FORMAT");
      expect(res.isValid).toBe(false);
      expect(res.source).toBe("cfm-validation-error");
      expect(res.errors.join(" ")).toContain("Formato de CRM inválido");
    });

    it("handles invalid state codes", async () => {
      const res = await svc.validateLicense("CRM-XX 123456");
      expect(res.isValid).toBe(false);
      expect(res.errors.join(" ")).toContain("Estado XX não é válido para CRM");
    });
  });

  describe("caching behavior", () => {
    it("returns cached result on subsequent validations and marks source as cfm-cache", async () => {
      const apiSpy = vi
        .spyOn(svc as AnyObj, "callCFMAPI")
        .mockResolvedValue(makeProfessional({ crmNumber: "CRM-SP 123456" }));

      // First call - populates cache
      let res = await svc.validateLicense("CRM-SP 123456");
      expect(res.source).toBe("cfm-api");
      expect(apiSpy).toHaveBeenCalledTimes(1);
      expect(svc.getCacheSize()).toBe(1);

      // Second call - should come from cache (no extra API hit)
      res = await svc.validateLicense("CRM-SP 123456");
      expect(res.source).toBe("cfm-cache");
      expect(res.warnings).toContain("Dados obtidos do cache local");
      expect(apiSpy).toHaveBeenCalledTimes(1);
    });

    it("expires cache after TTL (~24h) and hits API again", async () => {
      const apiSpy = vi
        .spyOn(svc as AnyObj, "callCFMAPI")
        .mockResolvedValue(makeProfessional({ crmNumber: "CRM-SP 123456" }));

      // Control time via Date.now mocking
      let now = new Date("2025-01-01T00:00:00.000Z").getTime();
      const nowSpy = vi.spyOn(Date, "now").mockImplementation(() => now);
      const DAY = 24 * 60 * 60 * 1000;

      // First call - cache at base time
      let res = await svc.validateLicense("CRM-SP 123456");
      expect(res.source).toBe("cfm-api");
      expect(apiSpy).toHaveBeenCalledTimes(1);
      expect(svc.getCacheSize()).toBe(1);

      // Within TTL - still cached
      now = now + (DAY - 1);
      res = await svc.validateLicense("CRM-SP 123456");
      expect(res.source).toBe("cfm-cache");
      expect(apiSpy).toHaveBeenCalledTimes(1);

      // Beyond TTL - cache should be considered expired and removed; API called again
      now = now + 2; // cross TTL boundary
      res = await svc.validateLicense("CRM-SP 123456");
      expect(res.source).toBe("cfm-api");
      expect(apiSpy).toHaveBeenCalledTimes(2);
      expect(svc.getCacheSize()).toBe(1); // refreshed entry replaces the old

      nowSpy.mockRestore();
    });
  });

  describe("validateMultipleLicenses", () => {
    it("aggregates results and errors from multiple validations", async () => {
      vi.spyOn(svc as AnyObj, "callCFMAPI").mockImplementation(
        async (_state: any, number: string) => {
          if (number === "000000") return null;
          return makeProfessional({ crmNumber: `CRM-SP ${number}` });
        },
      );

      const res = await svc.validateMultipleLicenses([
        "CRM-SP 111111", // valid
        "CRM-SP 000000", // not found
        "CRM-SP 222222", // valid
      ]);

      expect(res.data?.length).toBe(2);
      expect(res.errors.some((e) => e.includes("CRM não encontrado"))).toBe(true);
      expect(res.isValid).toBe(false); // not all valid
    });
  });

  describe("audit trail and stats", () => {
    it("records audit entries for API validations and reports stats", async () => {
      const apiSpy = vi
        .spyOn(svc as AnyObj, "callCFMAPI")
        .mockResolvedValue(makeProfessional({ crmNumber: "CRM-SP 123456" }));

      // One API-backed validation -> one audit entry
      await svc.validateLicense("CRM-SP 123456");
      // Cached call shouldn't add an audit entry
      await svc.validateLicense("CRM-SP 123456");

      const trail = svc.getAuditTrail(10);
      expect(trail.length).toBe(1);
      expect(trail[0].action).toBe("license-validated");
      expect(trail[0].complianceType).toBe("cfm");
      expect(trail[0].description).toContain("VALID");

      const stats = svc.getValidationStats();
      expect(stats.totalValidations).toBe(1);
      expect(stats.validLicenses).toBe(1);
      expect(stats.invalidLicenses).toBe(0);
      expect(typeof stats.cacheHitRate).toBe("number");
      expect(stats.cacheHitRate).toBeCloseTo(svc.getCacheSize() / stats.totalValidations);

      expect(apiSpy).toHaveBeenCalledTimes(1);
    });

    it("generateValidationReport returns recent validations (max 50) and includes stats", async () => {
      const apiSpy = vi.spyOn(svc as AnyObj, "callCFMAPI");

      // Create >50 cached validations
      for (let i = 0; i < 55; i++) {
        apiSpy.mockResolvedValueOnce(
          makeProfessional({
            crmNumber: `CRM-SP ${String(100000 + i)}`,
            id: `cfm-SP-${String(100000 + i)}`,
          }),
        );
        // Use unique numbers to populate cache
        const resp = await svc.validateLicense(`CRM-SP ${String(100000 + i)}`);
        expect(resp.isValid).toBe(true);
      }

      const report = svc.generateValidationReport();
      expect(report.success).toBe(true);
      expect(report.data.reportId).toMatch(/^cfm-report-\d+/);
      expect(report.data.stats.totalValidations).toBe(55); // API-backed validations
      expect(report.data.recentValidations.length).toBeLessThanOrEqual(50);
      expect(Array.isArray(report.data.expiringLicenses)).toBe(true);
      expect(report.metadata?.version).toBe("1.0.0");
    });
  });

  describe("checkExpirationWarnings", () => {
    it("returns cached licenses expiring within the given window", async () => {
      let now = new Date("2025-06-01T00:00:00.000Z").getTime();
      const nowSpy = vi.spyOn(Date, "now").mockImplementation(() => now);

      const apiSpy = vi.spyOn(svc as AnyObj, "callCFMAPI");

      // License 1: expires in 10 days -> should be flagged for default 30 days
      apiSpy.mockResolvedValueOnce(
        makeProfessional({
          crmNumber: "CRM-SP 111111",
          validUntil: new Date(now + 10 * 24 * 60 * 60 * 1000),
        }),
      );
      await svc.validateLicense("CRM-SP 111111");

      // License 2: expires in 31 days -> not flagged for 30-day window
      apiSpy.mockResolvedValueOnce(
        makeProfessional({
          crmNumber: "CRM-SP 222222",
          validUntil: new Date(now + 31 * 24 * 60 * 60 * 1000),
        }),
      );
      await svc.validateLicense("CRM-SP 222222");

      // License 3: already expired but marked invalid should not be included (isValid false)
      apiSpy.mockResolvedValueOnce(
        makeProfessional({
          crmNumber: "CRM-SP 333333",
          validUntil: new Date(now - 24 * 60 * 60 * 1000),
          status: "expired",
        }),
      );
      // validate -> isValid becomes false because status !== 'active' (as per code)
      const res3 = await svc.validateLicense("CRM-SP 333333");
      expect(res3.isValid).toBe(false);

      const expiring = await svc.checkExpirationWarnings(30);
      const licenses = expiring.map((e) => e.license);
      expect(licenses).toContain("CRM-SP 111111");
      expect(licenses).not.toContain("CRM-SP 222222");
      expect(licenses).not.toContain("CRM-SP 333333");

      nowSpy.mockRestore();
    });
  });
});
