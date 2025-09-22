// T009: Unit tests for redaction regex corpus
// Purpose: Test comprehensive PII redaction patterns for LGPD compliance
// File: packages/utils/tests/redaction.spec.ts

import { describe, expect, it } from "vitest";
import { redactPII } from "../src/redaction/pii";

describe("T009: Redaction Regex Corpus", () => {
  describe("Brazilian Document Numbers", () => {
    it("should redact CPF numbers in various formats", () => {
      const testCases = [
        "Meu CPF é 123.456.789-00",
        "CPF: 12345678900",
        "Documento CPF 123 456 789 00",
        "CPF número 123.456.789/00",
      ];

      testCases.forEach((input) => {
        const result = redactPII(input);
        expect(result.text).not.toContain("123");
        expect(result.text).not.toContain("456");
        expect(result.text).not.toContain("789");
        expect(result.flags).toContain("lgpd");
      });
    });

    it("should redact CNPJ numbers in various formats", () => {
      const testCases = [
        "CNPJ da clínica: 12.345.678/0001-90",
        "CNPJ 12345678000190",
        "Empresa CNPJ 12 345 678 0001 90",
      ];

      testCases.forEach((input) => {
        const result = redactPII(input);
        expect(result.text).not.toContain("12345678");
        expect(result.flags).toContain("lgpd");
      });
    });

    it("should redact RG numbers", () => {
      const testCases = [
        "RG: 12.345.678-9",
        "RG 123456789",
        "Documento RG 12 345 678 9",
      ];

      testCases.forEach((input) => {
        const result = redactPII(input);
        expect(result.text).not.toContain("12345678");
        expect(result.flags).toContain("lgpd");
      });
    });

    it("should redact CNS (Cartão Nacional de Saúde)", () => {
      const testCases = [
        "CNS: 123 4567 8901 2345",
        "Cartão SUS 123456789012345",
        "CNS número 123.4567.8901.2345",
      ];

      testCases.forEach((input) => {
        const result = redactPII(input);
        expect(result.text).not.toContain("123456789");
        expect(result.flags).toContain("lgpd");
      });
    });
  });

  describe("Contact Information", () => {
    it("should redact email addresses", () => {
      const testCases = [
        "Email: paciente@clinica.com.br",
        "Contato: dr.silva@hospital.org",
        "Envie para usuario+tag@dominio.co.uk",
      ];

      testCases.forEach((input) => {
        const result = redactPII(input);
        expect(result.text).not.toContain("@");
        expect(result.flags).toContain("lgpd");
      });
    });

    it("should redact phone numbers", () => {
      const testCases = [
        "Telefone: (11) 99999-8888",
        "Celular 11999998888",
        "Fone: +55 11 9 9999-8888",
        "WhatsApp: 55 11 99999 8888",
      ];

      testCases.forEach((input) => {
        const result = redactPII(input);
        expect(result.text).not.toContain("99999");
        expect(result.text).not.toContain("8888");
        expect(result.flags).toContain("lgpd");
      });
    });
  });

  describe("Medical Information", () => {
    it("should redact CRM (medical license) numbers", () => {
      const testCases = [
        "Dr. João Silva - CRM/SP 123456",
        "CRM-RJ: 654321",
        "Médico CRM 789012/MG",
      ];

      testCases.forEach((input) => {
        const result = redactPII(input);
        expect(result.text).not.toContain("123456");
        expect(result.text).not.toContain("654321");
        expect(result.text).not.toContain("789012");
        expect(result.flags).toContain("lgpd");
      });
    });

    it("should redact prescription numbers", () => {
      const testCases = [
        "Receita nº 2023001234",
        "Prescrição REF-2023-5678",
        "Número da receita: RX123456789",
      ];

      testCases.forEach((input) => {
        const result = redactPII(input);
        expect(result.text).not.toContain("2023001234");
        expect(result.text).not.toContain("5678");
        expect(result.text).not.toContain("123456789");
        expect(result.flags).toContain("lgpd");
      });
    });
  });

  describe("Financial Information", () => {
    it("should redact credit card numbers", () => {
      const testCases = [
        "Cartão: 4532 1234 5678 9012",
        "CC 4532123456789012",
        "Número do cartão: 4532-1234-5678-9012",
      ];

      testCases.forEach((input) => {
        const result = redactPII(input);
        expect(result.text).not.toContain("4532");
        expect(result.text).not.toContain("1234");
        expect(result.text).not.toContain("5678");
        expect(result.text).not.toContain("9012");
        expect(result.flags).toContain("lgpd");
      });
    });

    it("should redact bank account numbers", () => {
      const testCases = [
        "Conta: 12345-6 Agência: 0001",
        "Banco 001 Ag 1234 Conta 567890-1",
        "PIX: 123.456.789-00",
      ];

      testCases.forEach((input) => {
        const result = redactPII(input);
        expect(result.text).not.toContain("12345");
        expect(result.text).not.toContain("567890");
        expect(result.flags).toContain("lgpd");
      });
    });
  });

  describe("Address Information", () => {
    it("should redact CEP (postal codes)", () => {
      const testCases = [
        "CEP: 01234-567",
        "Código postal 01234567",
        "CEP 01 234-567",
      ];

      testCases.forEach((input) => {
        const result = redactPII(input);
        expect(result.text).not.toContain("01234");
        expect(result.text).not.toContain("567");
        expect(result.flags).toContain("lgpd");
      });
    });

    it("should preserve non-sensitive address parts", () => {
      const input = "Rua das Flores, Bairro Centro";
      const result = redactPII(input);

      // Should preserve street names and neighborhoods (not PII)
      expect(result.text).toContain("Rua");
      expect(result.text).toContain("Bairro");
    });
  });

  describe("Edge Cases and Complex Patterns", () => {
    it("should handle mixed PII in single message", () => {
      const input =
        "Paciente João Silva, CPF 123.456.789-00, telefone (11) 99999-8888, email joao@clinica.com";
      const result = redactPII(input);

      expect(result.text).not.toContain("123.456.789-00");
      expect(result.text).not.toContain("99999-8888");
      expect(result.text).not.toContain("joao@clinica.com");
      expect(result.flags).toContain("lgpd");
    });

    it("should handle false positives carefully", () => {
      const input = "Data: 12/03/2023, valor R$ 123,45";
      const result = redactPII(input);

      // Should preserve dates and currency values
      expect(result.text).toContain("12/03/2023");
      expect(result.text).toContain("123,45");
    });

    it("should handle empty and null inputs", () => {
      expect(redactPII("").text).toBe("");
      expect(redactPII("").flags).toEqual([]);
    });

    it("should handle non-PII medical terms", () => {
      const input =
        "Paciente apresenta hipertensão arterial, glicemia 120mg/dl";
      const result = redactPII(input);

      // Should preserve medical terms and values
      expect(result.text).toContain("hipertensão");
      expect(result.text).toContain("120mg/dl");
    });
  });

  describe("Regex Pattern Validation", () => {
    it("should have consistent redaction markers", () => {
      const input = "CPF: 123.456.789-00";
      const result = redactPII(input);

      // Should contain redaction markers
      expect(result.text).toMatch(/\[REDACTED\]|\*+|XXX/);
    });

    it("should maintain message structure", () => {
      const input = "Paciente com CPF 123.456.789-00 tem consulta agendada";
      const result = redactPII(input);

      // Should maintain readable structure
      expect(result.text).toContain("Paciente");
      expect(result.text).toContain("consulta agendada");
      expect(result.text.split(" ").length).toBeGreaterThanOrEqual(4);
    });

    it("should handle Unicode and special characters", () => {
      const input =
        "Paciente José André, CPF 123.456.789-00, telefone (11) 99999-8888";
      const result = redactPII(input);

      expect(result.text).toContain("José André");
      expect(result.text).not.toContain("123.456.789-00");
      expect(result.flags).toContain("lgpd");
    });
  });

  describe("Performance and Security", () => {
    it("should process large texts efficiently", () => {
      const largeText = "Paciente com CPF 123.456.789-00. ".repeat(1000);
      const startTime = Date.now();

      const result = redactPII(largeText);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete in <1s
      expect(result.flags).toContain("lgpd");
    });

    it("should not expose original patterns in intermediate steps", () => {
      const input = "CPF: 123.456.789-00";
      const result = redactPII(input);

      // Result should not contain any part of original CPF
      expect(result.text).not.toContain("123");
      expect(result.text).not.toContain("456");
      expect(result.text).not.toContain("789");
      expect(result.text).not.toContain("00");
    });
  });
});
