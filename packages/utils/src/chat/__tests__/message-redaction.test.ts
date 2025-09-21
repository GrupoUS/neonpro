// T009: Message Redaction Tests for AI Chat
// Purpose: Test PII detection and redaction in chat messages for LGPD compliance
// File: packages/utils/src/chat/__tests__/message-redaction.test.ts

import { describe, expect, it, beforeEach, vi } from "vitest";
import type { ChatMessage, RedactionResult } from "@neonpro/types/ai-chat";

// Import the functions we'll be testing
import {
  detectPII,
  redactMessage,
  sanitizeForStorage,
  validateMessageSafety,
  redactBrazilianData,
} from "../message-redaction";

describe("T009: Message Redaction for AI Chat",_() => {
  describe(_"PII Detection",_() => {
    it(_"should detect Brazilian CPF numbers",_() => {
      const message = "Meu CPF é 123.456.789-00 para consulta";
      const result = detectPII(message);

      expect(result.hasPII).toBe(true);
      expect(result.patterns).toContain("cpf");
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0]).toMatchObject({
        type: "cpf",
        value: "123.456.789-00",
        start: expect.any(Number),
        end: expect.any(Number),
      });
    });

    it(_"should detect Brazilian CNPJ numbers",_() => {
      const message = "A clínica tem CNPJ 12.345.678/0001-90";
      const result = detectPII(message);

      expect(result.hasPII).toBe(true);
      expect(result.patterns).toContain("cnpj");
    });

    it(_"should detect email addresses",_() => {
      const message = "Entre em contato: paciente@clinica.com.br";
      const result = detectPII(message);

      expect(result.hasPII).toBe(true);
      expect(result.patterns).toContain("email");
    });

    it(_"should detect phone numbers",_() => {
      const cases = [
        "Telefone: (11) 99999-8888",
        "Cel: 11 9 9999-8888",
        "WhatsApp: +55 11 99999-8888",
        "Fone: 11-99999-8888",
      ];

      cases.forEach(_(message) => {
        const result = detectPII(message);
        expect(result.hasPII).toBe(true);
        expect(result.patterns).toContain("phone");
      });
    });

    it(_"should detect RG numbers",_() => {
      const message = "RG: 12.345.678-9 SSP/SP";
      const result = detectPII(message);

      expect(result.hasPII).toBe(true);
      expect(result.patterns).toContain("rg");
    });

    it(_"should detect credit card numbers",_() => {
      const message = "Cartão: 1234 5678 9012 3456";
      const result = detectPII(message);

      expect(result.hasPII).toBe(true);
      expect(result.patterns).toContain("credit_card");
    });

    it(_"should detect addresses",_() => {
      const message =
        "Moro na Rua das Flores, 123, apto 45, São Paulo-SP, CEP 01234-567";
      const result = detectPII(message);

      expect(result.hasPII).toBe(true);
      expect(result.patterns).toContain("address");
    });

    it(_"should handle multiple PII types in single message",_() => {
      const message =
        "João Silva, CPF 123.456.789-00, telefone (11) 99999-8888, email joao@email.com";
      const result = detectPII(message);

      expect(result.hasPII).toBe(true);
      expect(result.patterns).toEqual(
        expect.arrayContaining(["cpf", "phone", "email"]),
      );
      expect(result.matches.length).toBeGreaterThan(2);
    });

    it(_"should not flag common medical terms as PII",_() => {
      const message =
        "Paciente com diabetes tipo 2, pressão 120/80, temperatura 36.5°C";
      const result = detectPII(message);

      expect(result.hasPII).toBe(false);
      expect(result.patterns).toHaveLength(0);
    });

    it(_"should not flag partial numbers as PII",_() => {
      const message = "Consulta marcada para as 14:30, sala 123";
      const result = detectPII(message);

      expect(result.hasPII).toBe(false);
    });
  });

  describe(_"Message Redaction",_() => {
    it(_"should redact CPF with appropriate mask",_() => {
      const message = "Paciente João, CPF 123.456.789-00, necessita consulta";
      const result = redactMessage(message);

      expect(result.redactedContent).toContain("[CPF_REDACTED]");
      expect(result.redactedContent).not.toContain("123.456.789-00");
      expect(result.hasPII).toBe(true);
      expect(result.redactionCount).toBe(1);
    });

    it(_"should redact email addresses",_() => {
      const message = "Contato do paciente: joao.silva@email.com.br";
      const result = redactMessage(message);

      expect(result.redactedContent).toContain("[EMAIL_REDACTED]");
      expect(result.redactedContent).not.toContain("joao.silva@email.com.br");
    });

    it(_"should redact phone numbers with context preservation",_() => {
      const message = "Emergência: (11) 99999-8888 ou (11) 3333-4444";
      const result = redactMessage(message);

      expect(result.redactedContent).toContain("[PHONE_REDACTED]");
      expect(result.redactedContent).toContain("Emergência:");
      expect(result.redactionCount).toBe(2);
    });

    it(_"should preserve medical context while redacting PII",_() => {
      const message =
        "Paciente João Silva (CPF 123.456.789-00) apresenta hipertensão, contato: (11) 99999-8888";
      const result = redactMessage(message);

      expect(result.redactedContent).toContain("hipertensão");
      expect(result.redactedContent).toContain("[CPF_REDACTED]");
      expect(result.redactedContent).toContain("[PHONE_REDACTED]");
      expect(result.redactedContent).not.toContain("João Silva");
    });

    it(_"should handle edge cases gracefully",_() => {
      const cases = [
        "",
        "   ",
        "Apenas texto normal sem PII",
        "Números não-PII: 123, 456, 789",
      ];

      cases.forEach(_(message) => {
        const result = redactMessage(message);
        expect(result.redactedContent).toBe(message);
        expect(result.hasPII).toBe(false);
        expect(result.redactionCount).toBe(0);
      });
    });

    it(_"should maintain message readability after redaction",_() => {
      const message =
        "Dr. Silva atendeu paciente João (CPF 123.456.789-00) com sintomas de gripe";
      const result = redactMessage(message);

      expect(result.redactedContent).toMatch(
        /Dr\. Silva atendeu paciente \[NAME_REDACTED\] \([CPF_REDACTED]\) com sintomas de gripe/,
      );
    });
  });

  describe(_"Storage Sanitization",_() => {
    it(_"should create safe version for storage",_() => {
      const message: ChatMessage = {
        id: "msg-1",
        sessionId: "session-1",
        _role: "user",
        content:
          "Meu nome é João Silva, CPF 123.456.789-00, telefone (11) 99999-8888",
        createdAt: new Date(),
        sequenceNumber: 1,
        hasPII: false, // Will be set by function
      };

      const result = sanitizeForStorage(message);

      expect(result.hasPII).toBe(true);
      expect(result.redactedContent).toBeDefined();
      expect(result.redactedContent).not.toContain("João Silva");
      expect(result.redactedContent).not.toContain("123.456.789-00");
      expect(result.content).toBe(message.content); // Original preserved
    });

    it(_"should handle messages without PII",_() => {
      const message: ChatMessage = {
        id: "msg-2",
        sessionId: "session-1",
        _role: "assistant",
        content: "Olá! Como posso ajudá-lo hoje com suas dúvidas sobre saúde?",
        createdAt: new Date(),
        sequenceNumber: 2,
        hasPII: false,
      };

      const result = sanitizeForStorage(message);

      expect(result.hasPII).toBe(false);
      expect(result.redactedContent).toBeUndefined();
    });

    it(_"should generate appropriate metadata",_() => {
      const message: ChatMessage = {
        id: "msg-3",
        sessionId: "session-1",
        _role: "user",
        content: "Email: test@example.com, CPF: 123.456.789-00",
        createdAt: new Date(),
        sequenceNumber: 3,
        hasPII: false,
      };

      const result = sanitizeForStorage(message);

      expect(result.redactionMetadata).toBeDefined();
      expect(result.redactionMetadata).toMatchObject({
        patterns: expect.arrayContaining(["email", "cpf"]),
        redactionCount: 2,
        processedAt: expect.any(Date),
      });
    });
  });

  describe(_"Message Safety Validation",_() => {
    it(_"should validate safe messages",_() => {
      const message =
        "Como está se sentindo hoje? Pode me contar sobre seus sintomas?";
      const result = validateMessageSafety(message);

      expect(result.isSafe).toBe(true);
      expect(result.risks).toHaveLength(0);
      expect(result.recommendations).toHaveLength(0);
    });

    it(_"should flag messages with PII as unsafe",_() => {
      const message = "Meu CPF é 123.456.789-00 e moro na Rua A, 123";
      const result = validateMessageSafety(message);

      expect(result.isSafe).toBe(false);
      expect(result.risks).toContain("contains_pii");
      expect(result.recommendations).toContain("redact_before_storage");
    });

    it(_"should provide specific recommendations",_() => {
      const message =
        "João Silva, email: joao@test.com, telefone: (11) 99999-8888";
      const result = validateMessageSafety(message);

      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          "redact_before_storage",
          "review_for_medical_context",
        ]),
      );
    });
  });

  describe(_"Brazilian Data Redaction",_() => {
    it(_"should redact SUS numbers",_() => {
      const message = "Número do SUS: 123 4567 8901 2345";
      const result = redactBrazilianData(message);

      expect(result).toContain("[SUS_REDACTED]");
      expect(result).not.toContain("123 4567 8901 2345");
    });

    it("should redact Brazilian postal codes (CEP)", () => {
      const message = "CEP: 01234-567 ou CEP 12345-678";
      const result = redactBrazilianData(message);

      expect(result).toContain("[CEP_REDACTED]");
      expect(result).not.toMatch(/\d{5}-\d{3}/);
    });

    it(_"should handle state abbreviations carefully",_() => {
      const message = "Paciente de SP com sintomas";
      const result = redactBrazilianData(message);

      // State abbreviations alone should not be redacted
      expect(result).toContain("SP");
    });

    it(_"should redact full addresses",_() => {
      const message =
        "Endereço: Av. Paulista, 1000, Bela Vista, São Paulo-SP, CEP 01310-100";
      const result = redactBrazilianData(message);

      expect(result).toContain("[ADDRESS_REDACTED]");
      expect(result).not.toContain("Av. Paulista");
    });
  });

  describe(_"Performance and Edge Cases",_() => {
    it(_"should handle large messages efficiently",_() => {
      const largeMessage =
        "Texto normal ".repeat(1000) + " CPF: 123.456.789-00";
      const startTime = performance.now();

      const result = redactMessage(largeMessage);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should process in under 100ms
      expect(result.hasPII).toBe(true);
    });

    it(_"should handle unicode and special characters",_() => {
      const message =
        "Paciente João César (CPF: 123.456.789-00) tem consulta às 14h30";
      const result = redactMessage(message);

      expect(result.redactedContent).toContain("às 14h30");
      expect(result.redactedContent).toContain("[CPF_REDACTED]");
    });

    it(_"should preserve line breaks and formatting",_() => {
      const message = `Paciente: João Silva
CPF: 123.456.789-00
Telefone: (11) 99999-8888

Sintomas:
- Febre
- Dor de cabeça`;

      const result = redactMessage(message);

      expect(result.redactedContent).toMatch(/Sintomas:\s*-\s*Febre/);
      expect(result.redactedContent).toContain("\n");
    });
  });

  describe(_"Audit and Compliance",_() => {
    it(_"should log redaction events for audit",_() => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(_() => {});

      const message = "CPF: 123.456.789-00";
      redactMessage(message, { auditLog: true });

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "pii_redaction",
          patterns: ["cpf"],
          timestamp: expect.any(String),
        }),
      );

      logSpy.mockRestore();
    });

    it(_"should provide LGPD compliance report",_() => {
      const message = "João (CPF: 123.456.789-00) email: joao@test.com";
      const result = redactMessage(message, { generateReport: true });

      expect(result.complianceReport).toBeDefined();
      expect(result.complianceReport).toMatchObject({
        lgpdCompliant: true,
        dataTypes: expect.arrayContaining(["cpf", "email", "name"]),
        legalBasis: "data_minimization",
        retentionPolicy: "healthcare_standard",
      });
    });
  });
});
