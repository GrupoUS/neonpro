import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockANVISACompliance } from "../healthcare-setup";

describe("aNVISA Compliance Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("medical Product Validation", () => {
    it("should validate ANVISA registration for medical products", async () => {
      const productId = "botox-allergan-001";

      const validation = await mockANVISACompliance.validateProduct(productId);

      expect(validation).toHaveProperty("isValid", true);
      expect(validation).toHaveProperty("anvisaCode");
      expect(validation).toHaveProperty("productName");
      expect(validation).toHaveProperty("registrationStatus", "active");
      expect(validation).toHaveProperty("expirationDate");
      expect(validation).toHaveProperty("restrictions");
    });

    it("should reject products without valid ANVISA registration", async () => {
      const invalidProduct = "invalid-product-999";

      // Mock invalid product response
      mockANVISACompliance.validateProduct.mockResolvedValueOnce({
        isValid: false,
        reason: "Product not found in ANVISA registry",
        anvisaCode: undefined,
        registrationStatus: "not_found",
      });

      const validation =
        await mockANVISACompliance.validateProduct(invalidProduct);

      expect(validation.isValid).toBeFalsy();
      expect(validation.reason).toBe("Product not found in ANVISA registry");
    });

    it("should check product expiration dates", async () => {
      const expiredProduct = {
        id: "product-expired-001",
        anvisaCode: "ANVISA-EXP-001",
        expirationDate: "2023-01-01", // Expired
      };

      const isExpired = (expirationDate: string) => {
        return new Date(expirationDate) < new Date();
      };

      expect(isExpired(expiredProduct.expirationDate)).toBeTruthy();
    });

    it("should validate product batch information", async () => {
      const productBatch = {
        productId: "botox-001",
        batchNumber: "BATCH-2024-001",
        manufacturingDate: "2024-01-15",
        expirationDate: "2026-01-15",
        anvisaCode: "ANVISA-BOT-001",
      };

      // Validate batch information completeness
      expect(productBatch).toHaveProperty("productId");
      expect(productBatch).toHaveProperty("batchNumber");
      expect(productBatch).toHaveProperty("manufacturingDate");
      expect(productBatch).toHaveProperty("expirationDate");
      expect(productBatch).toHaveProperty("anvisaCode");

      // Validate batch is not expired
      const batchValid = new Date(productBatch.expirationDate) > new Date();
      expect(batchValid).toBeTruthy();
    });
  });

  describe("medical Procedure Validation", () => {
    it("should validate ANVISA authorization for aesthetic procedures", async () => {
      const procedureCode = "PROC-BOTOX-001";

      const validation =
        await mockANVISACompliance.validateProcedure(procedureCode);

      expect(validation).toHaveProperty("isAuthorized", true);
      expect(validation).toHaveProperty("procedureName");
      expect(validation).toHaveProperty("requiredLicense");
      expect(validation).toHaveProperty("safetyProtocols");
      expect(validation).toHaveProperty("contraindications");
    });

    it("should enforce required medical license for procedures", async () => {
      const procedure = {
        code: "PROC-ADVANCED-001",
        name: "Advanced Aesthetic Procedure",
        requiredLicense: "medical", // Only medical doctors
        performedBy: "nurse-001", // Nurse attempting to perform
      };

      const validateProfessionalLicense = (
        procedure: any,
        professional: any,
      ) => {
        const validLicenses = {
          medical: ["doctor", "dermatologist"],
          nursing: ["nurse"],
          aesthetics: ["aesthetician"],
        };

        const requiredLicenses =
          validLicenses[
            procedure.requiredLicense as keyof typeof validLicenses
          ];
        return requiredLicenses.includes(professional.type);
      };

      const professional = { id: "nurse-001", type: "nurse" };
      const isAuthorized = validateProfessionalLicense(procedure, professional);

      expect(isAuthorized).toBeFalsy();
    });

    it("should validate safety protocols compliance", async () => {
      const procedureProtocols = {
        procedureId: "PROC-001",
        requiredProtocols: [
          "patient-consent",
          "sterile-environment",
          "emergency-kit-available",
          "professional-supervision",
        ],
        implementedProtocols: [
          "patient-consent",
          "sterile-environment",
          "emergency-kit-available",
          "professional-supervision",
        ],
      };

      const validateProtocols = (required: string[], implemented: string[]) => {
        const missingProtocols = required.filter(
          (protocol) => !implemented.includes(protocol),
        );
        return {
          isCompliant: missingProtocols.length === 0,
          missingProtocols,
        };
      };

      const protocolValidation = validateProtocols(
        procedureProtocols.requiredProtocols,
        procedureProtocols.implementedProtocols,
      );

      expect(protocolValidation.isCompliant).toBeTruthy();
      expect(protocolValidation.missingProtocols).toHaveLength(0);
    });
  });

  describe("adverse Event Reporting", () => {
    it("should support adverse event reporting to ANVISA", async () => {
      const adverseEvent = {
        patientId: "patient-123",
        productId: "botox-001",
        procedureId: "proc-001",
        eventType: "allergic_reaction",
        severity: "moderate",
        description: "Patient experienced localized swelling and redness",
        occurredAt: new Date().toISOString(),
        reportedBy: "doctor-123",
      };

      const report =
        await mockANVISACompliance.reportAdverseEvent(adverseEvent);

      expect(report).toHaveProperty("reportId");
      expect(report).toHaveProperty("status", "submitted");
      expect(report).toHaveProperty("submissionDate");
      expect(report).toHaveProperty("followUpRequired");
    });

    it("should classify adverse events by severity", () => {
      const events = [
        { type: "mild_irritation", severity: "mild" },
        { type: "allergic_reaction", severity: "moderate" },
        { type: "anaphylaxis", severity: "severe" },
        { type: "temporary_numbness", severity: "mild" },
      ];

      const classifyBySeverity = (events: any[]) => {
        return events.reduce(
          (acc, event) => {
            acc[event.severity] = acc[event.severity] || [];
            acc[event.severity].push(event);
            return acc;
          },
          {} as Record<string, any[]>,
        );
      };

      const classified = classifyBySeverity(events);

      expect(classified.mild).toHaveLength(2);
      expect(classified.moderate).toHaveLength(1);
      expect(classified.severe).toHaveLength(1);
    });

    it("should require immediate reporting for severe adverse events", () => {
      const severeEvent = {
        severity: "severe",
        type: "anaphylaxis",
        requiresImmediateReporting: true,
      };

      const getReportingUrgency = (severity: string) => {
        const urgencyMap = {
          mild: "30_days",
          moderate: "15_days",
          severe: "immediate",
        };
        return urgencyMap[severity as keyof typeof urgencyMap];
      };

      expect(getReportingUrgency(severeEvent.severity)).toBe("immediate");
    });
  });

  describe("product Tracking and Traceability", () => {
    it("should maintain complete product traceability chain", async () => {
      const productTrace = {
        productId: "botox-001",
        anvisaCode: "ANVISA-BOT-001",
        manufacturer: "Allergan",
        distributor: "Medical Supplies Ltd",
        clinic: "NeonPro Estética",
        batchNumber: "BATCH-2024-001",
        serialNumber: "SN-001-2024",
        receivedDate: "2024-01-15",
        storageConditions: "refrigerated_2_8_celsius",
        usedDate: "2024-02-01",
        patientId: "patient-123",
        administeredBy: "doctor-123",
      };

      // Validate traceability completeness
      const requiredFields = [
        "productId",
        "anvisaCode",
        "manufacturer",
        "distributor",
        "batchNumber",
        "receivedDate",
        "usedDate",
        "patientId",
      ];

      const missingFields = requiredFields.filter(
        (field) => !productTrace[field as keyof typeof productTrace],
      );

      expect(missingFields).toHaveLength(0);
      expect(productTrace.storageConditions).toBe("refrigerated_2_8_celsius");
    });

    it("should validate storage condition compliance", () => {
      const storageRequirements = {
        botox: { temperature: "2-8°C", humidity: "<60%", light: "protected" },
        hyaluronic_acid: {
          temperature: "15-25°C",
          humidity: "<75%",
          light: "protected",
        },
        vitamins: {
          temperature: "15-25°C",
          humidity: "<60%",
          light: "protected",
        },
      };

      const actualConditions = {
        temperature: "4°C",
        humidity: "45%",
        light: "protected",
      };

      const validateStorage = (product: string, conditions: any) => {
        const requirements =
          storageRequirements[product as keyof typeof storageRequirements];
        if (!requirements) {
          return false;
        }

        // Parse temperature values
        const actualTemp = Number.parseInt(
          conditions.temperature.replace("°C", ""),
          10,
        );
        const [minTemp, maxTemp] = requirements.temperature
          .replace("°C", "")
          .split("-")
          .map(Number);

        const tempInRange = actualTemp >= minTemp && actualTemp <= maxTemp;
        // Parse humidity values - requirements use '<60%' format
        const actualHumidity = Number.parseInt(conditions.humidity, 10);
        const requiredHumidity = Number.parseInt(
          requirements.humidity.replace("<", ""),
          10,
        );
        const humidityOk = actualHumidity < requiredHumidity;
        const lightOk = conditions.light === requirements.light;

        return tempInRange && humidityOk && lightOk;
      };

      expect(validateStorage("botox", actualConditions)).toBeTruthy();
    });
  });

  describe("regulatory Documentation", () => {
    it("should maintain required ANVISA documentation", () => {
      const requiredDocuments = [
        "product_registration_certificate",
        "import_license",
        "quality_certificate",
        "batch_analysis_certificate",
        "storage_condition_records",
        "adverse_event_reports",
        "professional_training_certificates",
      ];

      const clinicDocuments = new Set([
        "product_registration_certificate",
        "import_license",
        "quality_certificate",
        "batch_analysis_certificate",
        "storage_condition_records",
        "professional_training_certificates",
      ]);

      const missingDocuments = requiredDocuments.filter(
        (doc) => !clinicDocuments.has(doc),
      );

      expect(missingDocuments).toContain("adverse_event_reports");
      expect(missingDocuments).toHaveLength(1);
    });

    it("should validate document expiration dates", () => {
      const documents = [
        { type: "import_license", expirationDate: "2025-12-31", isValid: true },
        {
          type: "quality_certificate",
          expirationDate: "2024-06-30",
          isValid: false,
        },
        {
          type: "training_certificate",
          expirationDate: "2025-03-15",
          isValid: true,
        },
      ];

      const validateDocuments = (docs: any[]) => {
        return docs.map((doc) => ({
          ...doc,
          isExpired: new Date(doc.expirationDate) < new Date(),
          needsRenewal:
            new Date(doc.expirationDate) <
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        }));
      };

      const validatedDocs = validateDocuments(documents);
      const expiredDocs = validatedDocs.filter((doc) => doc.isExpired);
      const renewalNeeded = validatedDocs.filter((doc) => doc.needsRenewal);

      expect(expiredDocs.length).toBeGreaterThan(0);
      expect(renewalNeeded.length).toBeGreaterThan(0);
    });
  });
});
