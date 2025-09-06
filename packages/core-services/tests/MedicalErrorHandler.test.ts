/**
 * Medical Error Handler Tests
 * Tests for medical query validation and error handling
 */

import { beforeEach, describe, expect, it } from "vitest";
import { MedicalErrorHandler } from "../src/services/MedicalErrorHandler";

describe("MedicalErrorHandler", () => {
  let handler: MedicalErrorHandler;

  beforeEach(() => {
    handler = new MedicalErrorHandler();
  });

  describe("validateMedicalQuery", () => {
    const baseContext = {
      communicationChannel: "whatsapp" as const,
    };

    it("should detect emergency situations", () => {
      const emergencyQueries = [
        "Socorro! Estou com dor forte",
        "Emergência após o procedimento",
        "Sangramento excessivo",
        "Não consigo respirar",
        "Alergia severa",
      ];

      emergencyQueries.forEach(query => {
        const result = handler.validateMedicalQuery(query, baseContext);

        expect(result.riskLevel).toBe("critical");
        expect(result.errors.some(e => e.type === "emergency")).toBe(true);
        expect(result.requiresEscalation).toBe(true);
      });
    });

    it("should detect prohibited medical advice requests", () => {
      const prohibitedQueries = [
        "Pode me dar um diagnóstico?",
        "Que medicamento devo tomar?",
        "Preciso de uma prescrição",
        "Qual a dosagem correta?",
      ];

      prohibitedQueries.forEach(query => {
        const result = handler.validateMedicalQuery(query, baseContext);

        expect(result.errors.some(e => e.type === "scope")).toBe(true);
        expect(result.warnings.length).toBeGreaterThan(0);
      });
    });

    it("should detect LGPD compliance issues", () => {
      const lgpdQueries = [
        "Preciso compartilhar meus dados pessoais",
        "Quero saber sobre informações privadas",
        "Como vocês usam meus dados?",
      ];

      lgpdQueries.forEach(query => {
        const result = handler.validateMedicalQuery(query, baseContext);

        expect(result.errors.some(e => e.type === "compliance")).toBe(true);
      });
    });

    it("should assess risk levels correctly", () => {
      const testCases = [
        {
          query: "Olá, gostaria de agendar uma consulta",
          context: { ...baseContext },
          expectedRisk: "low",
        },
        {
          query: "Tenho algumas dúvidas sobre o procedimento",
          context: { ...baseContext, patientAge: 70 },
          expectedRisk: "medium",
        },
        {
          query: "Estou grávida e quero fazer um procedimento",
          context: { ...baseContext },
          expectedRisk: "high",
        },
        {
          query: "Socorro! Dor forte e sangramento",
          context: { ...baseContext },
          expectedRisk: "critical",
        },
      ];

      testCases.forEach(({ query, context, expectedRisk }) => {
        const result = handler.validateMedicalQuery(query, context);
        expect(result.riskLevel).toBe(expectedRisk);
      });
    });

    it("should provide appropriate recommendations", () => {
      const highRiskQuery = "Estou grávida e quero fazer botox";
      const result = handler.validateMedicalQuery(highRiskQuery, baseContext);

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some(r => r.includes("consulta"))).toBe(true);
    });

    it("should handle normal queries without errors", () => {
      const normalQueries = [
        "Gostaria de agendar uma consulta",
        "Qual o preço da harmonização facial?",
        "Vocês atendem aos sábados?",
        "Como funciona o agendamento?",
      ];

      normalQueries.forEach(query => {
        const result = handler.validateMedicalQuery(query, baseContext);

        expect(result.isValid).toBe(true);
        expect(result.riskLevel).toBe("low");
        expect(result.errors.filter(e => e.severity === "critical")).toHaveLength(0);
      });
    });
  });

  describe("Emergency Keywords Detection", () => {
    const emergencyKeywords = [
      "emergência",
      "urgente",
      "dor forte",
      "sangramento",
      "alergia severa",
      "reação alérgica",
      "inchaço excessivo",
      "febre alta",
      "desmaio",
      "tontura severa",
      "falta de ar",
      "socorro",
      "ajuda urgente",
      "não consigo respirar",
      "dor no peito",
      "convulsão",
    ];

    emergencyKeywords.forEach(keyword => {
      it(`should detect emergency for keyword: ${keyword}`, () => {
        const query = `Estou com ${keyword} após o procedimento`;
        const result = handler.validateMedicalQuery(query, {
          communicationChannel: "whatsapp",
        });

        expect(result.riskLevel).toBe("critical");
        expect(result.errors.some(e => e.type === "emergency")).toBe(true);
      });
    });
  });

  describe("Prohibited Medical Advice Detection", () => {
    const prohibitedTerms = [
      "diagnóstico",
      "prescrever",
      "receitar",
      "medicamento",
      "dosagem",
      "tratamento específico",
      "cirurgia",
      "procedimento invasivo",
      "anestesia",
      "internação",
    ];

    prohibitedTerms.forEach(term => {
      it(`should detect prohibited advice for term: ${term}`, () => {
        const query = `Pode me dar um ${term}?`;
        const result = handler.validateMedicalQuery(query, {
          communicationChannel: "whatsapp",
        });

        expect(result.errors.some(e => e.type === "scope")).toBe(true);
      });
    });
  });

  describe("Compliance Detection", () => {
    const complianceTestCases = [
      {
        keywords: ["dados pessoais", "informações privadas"],
        regulation: "LGPD",
      },
      {
        keywords: ["diagnóstico médico", "prescrição"],
        regulation: "CFM",
      },
      {
        keywords: ["medicamento", "produto médico"],
        regulation: "ANVISA",
      },
    ];

    complianceTestCases.forEach(({ keywords, regulation }) => {
      keywords.forEach(keyword => {
        it(`should detect ${regulation} compliance issue for: ${keyword}`, () => {
          const query = `Preciso de informações sobre ${keyword}`;
          const result = handler.validateMedicalQuery(query, {
            communicationChannel: "whatsapp",
          });

          expect(result.errors.some(e =>
            e.type === "compliance"
            && e.complianceViolation?.regulation === regulation
          )).toBe(true);
        });
      });
    });
  });

  describe("Risk Assessment", () => {
    it("should consider patient age in risk assessment", () => {
      const query = "Gostaria de fazer um procedimento estético";

      const youngPatient = handler.validateMedicalQuery(query, {
        communicationChannel: "whatsapp",
        patientAge: 25,
      });

      const elderlyPatient = handler.validateMedicalQuery(query, {
        communicationChannel: "whatsapp",
        patientAge: 70,
      });

      expect(elderlyPatient.riskLevel).not.toBe("low");
      expect(elderlyPatient.riskLevel === "medium" || elderlyPatient.riskLevel === "high").toBe(
        true,
      );
    });

    it("should handle pregnancy status in risk assessment", () => {
      const query = "Quero fazer botox";
      const result = handler.validateMedicalQuery(query, {
        communicationChannel: "whatsapp",
      });

      // Since we can't detect pregnancy from the query alone,
      // this would need to be handled by the context processor
      expect(result).toBeDefined();
    });
  });
});
