/**
 * Sensitive Field Analyzer Test Suite
 * Tests for sensitive data exposure detection and analysis
 *
 * @version 1.0.0
 * @compliance LGPD, HIPAA
 * @healthcare-platform NeonPro
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  HealthcareSensitiveFieldAnalyzer,
  SensitiveFieldClassification,
} from "../../services/sensitive-field-analyzer";

describe("HealthcareSensitiveFieldAnalyzer", () => {
  let analyzer: HealthcareSensitiveFieldAnalyzer;

  beforeEach(() => {
    analyzer = new HealthcareSensitiveFieldAnalyzer();
  });

  describe("Sensitive Field Detection", () => {
    it("should detect CPF as critical sensitive field", () => {
      const testData = {
        patient: {
          name: "John Doe",
          cpf: "123.456.789-00",
          email: "john@example.com",
        },
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/patients",
        "GET",
        200,
      );

      const cpfField = analysis.sensitiveFields.find(
        (f) => f.fieldName === "cpf",
      );
      expect(cpfField).toBeDefined();
      expect(cpfField?.classification.category).toBe("IDENTIFICATION");
      expect(cpfField?.classification.sensitivity).toBe("CRITICAL");
      expect(cpfField?.isExposed).toBe(true);
      expect(cpfField?.complianceRisk).toBe("CRITICAL");
    });

    it("should detect medical diagnosis as critical sensitive field", () => {
      const testData = {
        medical_record: {
          diagnosis: "Type 2 Diabetes",
          treatment: "Metformin 500mg",
          blood_type: "O+",
        },
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/medical-records",
        "GET",
        200,
      );

      const diagnosisField = analysis.sensitiveFields.find(
        (f) => f.fieldName === "diagnosis",
      );
      expect(diagnosisField).toBeDefined();
      expect(diagnosisField?.classification.category).toBe("MEDICAL");
      expect(diagnosisField?.classification.sensitivity).toBe("CRITICAL");
      expect(diagnosisField?.isExposed).toBe(true);
      expect(diagnosisField?.complianceRisk).toBe("CRITICAL");
    });

    it("should detect email as medium sensitivity field", () => {
      const testData = {
        contact: {
          email: "patient@example.com",
          phone: "(11) 9999-8888",
        },
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/contacts",
        "GET",
        200,
      );

      const emailField = analysis.sensitiveFields.find(
        (f) => f.fieldName === "email",
      );
      expect(emailField).toBeDefined();
      expect(emailField?.classification.category).toBe("CONTACT");
      expect(emailField?.classification.sensitivity).toBe("MEDIUM");
      expect(emailField?.isExposed).toBe(true);
      expect(emailField?.complianceRisk).toBe("MEDIUM");
    });

    it("should detect nested sensitive fields", () => {
      const testData = {
        patient: {
          personal_info: {
            birth_date: "1990-01-01",
            address: {
              street: "Rua Example",
              city: "São Paulo",
            },
          },
          medical_info: {
            diagnosis: "Hypertension",
            medications: ["Losartan", "Hydrochlorothiazide"],
          },
        },
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/patients",
        "GET",
        200,
      );

      const birthDateField = analysis.sensitiveFields.find(
        (f) => f.fieldName === "birth_date",
      );
      const diagnosisField = analysis.sensitiveFields.find(
        (f) => f.fieldName === "diagnosis",
      );
      const medicationsField = analysis.sensitiveFields.find(
        (f) => f.fieldName === "medications",
      );

      expect(birthDateField).toBeDefined();
      expect(diagnosisField).toBeDefined();
      expect(medicationsField).toBeDefined();
    });

    it("should detect sensitive fields in arrays", () => {
      const testData = {
        patients: [
          {
            name: "John Doe",
            cpf: "123.456.789-00",
            diagnosis: "Diabetes",
          },
          {
            name: "Jane Smith",
            cpf: "987.654.321-00",
            diagnosis: "Hypertension",
          },
        ],
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/patients",
        "GET",
        200,
      );

      const cpfFields = analysis.sensitiveFields.filter(
        (f) => f.fieldName === "cpf",
      );
      const diagnosisFields = analysis.sensitiveFields.filter(
        (f) => f.fieldName === "diagnosis",
      );

      expect(cpfFields).toHaveLength(2);
      expect(diagnosisFields).toHaveLength(2);
    });
  });

  describe("Masking Detection", () => {
    it("should detect masked CPF values", () => {
      const testData = {
        patient: {
          cpf: "***.456.***-**",
          email: "john@example.com",
        },
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/patients",
        "GET",
        200,
      );

      const cpfField = analysis.sensitiveFields.find(
        (f) => f.fieldName === "cpf",
      );
      expect(cpfField?.maskingApplied).toBe(true);
      expect(cpfField?.exposureLevel).toBe("NONE");
      expect(cpfField?.complianceRisk).toBe("LOW");
    });

    it("should detect partially masked values", () => {
      const testData = {
        patient: {
          phone: "(11) 9****-8888",
          email: "john@example.com",
        },
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/patients",
        "GET",
        200,
      );

      const phoneField = analysis.sensitiveFields.find(
        (f) => f.fieldName === "phone",
      );
      expect(phoneField?.maskingApplied).toBe(true);
    });
  });

  describe("Risk Assessment", () => {
    it("should calculate HIGH risk for multiple exposed sensitive fields", () => {
      const testData = {
        patient: {
          cpf: "123.456.789-00",
          diagnosis: "Type 2 Diabetes",
          email: "patient@example.com",
          birth_date: "1990-01-01",
        },
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/patients",
        "GET",
        200,
      );

      expect(analysis.overallRiskLevel).toBe("HIGH");
      expect(analysis.violationCount).toBeGreaterThan(0);
    });

    it("should calculate CRITICAL risk for exposed critical fields", () => {
      const testData = {
        patient: {
          cpf: "123.456.789-00",
          genetic_data: { marker: "BRCA1" },
        },
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/patients",
        "GET",
        200,
      );

      expect(analysis.overallRiskLevel).toBe("CRITICAL");
      expect(analysis.violationCount).toBeGreaterThan(0);
    });

    it("should calculate LOW risk for properly masked data", () => {
      const testData = {
        patient: {
          cpf: "***.456.***-**",
          email: "patient@example.com",
        },
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/patients",
        "GET",
        200,
      );

      expect(analysis.overallRiskLevel).toBe("LOW");
    });
  });

  describe("Recommendations Generation", () => {
    it("should recommend masking for unmasked sensitive fields", () => {
      const testData = {
        patient: {
          cpf: "123.456.789-00",
          email: "patient@example.com",
        },
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/patients",
        "GET",
        200,
      );

      expect(analysis.recommendations).toContain("Apply field masking for cpf");
    });

    it("should recommend encryption for sensitive data", () => {
      const testData = {
        patient: {
          cpf: "123.456.789-00",
          diagnosis: "Diabetes",
        },
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/patients",
        "GET",
        200,
      );

      expect(analysis.recommendations).toContain("Enable encryption for cpf");
      expect(analysis.recommendations).toContain(
        "Enable encryption for diagnosis",
      );
    });

    it("should recommend strict access controls for critical data", () => {
      const testData = {
        patient: {
          cpf: "123.456.789-00",
          genetic_data: { marker: "BRCA1" },
        },
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/patients",
        "GET",
        200,
      );

      expect(analysis.recommendations).toContain(
        "Implement strict access controls for cpf",
      );
      expect(analysis.recommendations).toContain(
        "Implement strict access controls for genetic_data",
      );
    });
  });

  describe("Custom Field Classification", () => {
    it("should allow adding custom sensitive field classifications", () => {
      const customField: SensitiveFieldClassification = {
        name: "custom_id",
        category: "IDENTIFICATION",
        sensitivity: "HIGH",
        dataType: "string",
        maskingRequired: true,
        encryptionRequired: true,
      };

      analyzer.addSensitiveField(customField);

      const testData = {
        user: {
          custom_id: "CUSTOM-123",
          name: "John Doe",
        },
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/users",
        "GET",
        200,
      );

      const customFieldAnalysis = analysis.sensitiveFields.find(
        (f) => f.fieldName === "custom_id",
      );
      expect(customFieldAnalysis).toBeDefined();
      expect(customFieldAnalysis?.classification.sensitivity).toBe("HIGH");
    });

    it("should allow removing sensitive field classifications", () => {
      analyzer.removeSensitiveField("cpf");

      const testData = {
        patient: {
          cpf: "123.456.789-00",
          email: "patient@example.com",
        },
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/patients",
        "GET",
        200,
      );

      const cpfField = analysis.sensitiveFields.find(
        (f) => f.fieldName === "cpf",
      );
      expect(cpfField).toBeUndefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null and undefined values", () => {
      const testData = {
        patient: {
          name: "John Doe",
          cpf: null,
          email: undefined,
        },
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/patients",
        "GET",
        200,
      );

      expect(analysis.sensitiveFields).toHaveLength(0);
    });

    it("should handle empty objects and arrays", () => {
      const testData = {
        patient: {},
        records: [],
        metadata: null,
      };

      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/patients",
        "GET",
        200,
      );

      expect(analysis.sensitiveFields).toHaveLength(0);
    });

    it("should handle primitive values", () => {
      const testData = "simple string";
      const analysis = analyzer.analyzeAPIResponse(
        testData,
        "/api/test",
        "GET",
        200,
      );

      expect(analysis.sensitiveFields).toHaveLength(0);
    });
  });
});
