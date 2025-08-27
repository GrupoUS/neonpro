/**
 * 📧 Validation Utils Tests - NeonPro Healthcare
 * =============================================
 *
 * Comprehensive unit tests for validation utilities used across
 * the NeonPro healthcare platform. Covers Brazilian healthcare
 * standards and international formats.
 */

import { describe, expect, it } from "vitest";
import { emailSchema, phoneSchema, validateEmail, validatePhone, z } from "../src/validation";

describe("validation Utils - Email", () => {
  describe("emailSchema", () => {
    it("should validate correct email formats", () => {
      const validEmails = [
        "user@example.com",
        "doctor@hospital.com.br",
        "patient.name@clinic.org",
        "test+label@domain.co.uk",
        "admin@neonpro.healthcare",
        "contato@clinica-exemplo.com.br",
      ];

      validEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBeTruthy();
      });
    });

    it("should reject invalid email formats", () => {
      const invalidEmails = [
        "invalid.email",
        "@domain.com",
        "user@",
        "user@@domain.com",
        "user@domain",
        "",
        "   ",
        "user name@domain.com", // espaços não são permitidos
        "user@domain..com", // duplo ponto
        "user@.domain.com", // começa com ponto
      ];

      invalidEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBeFalsy();
      });
    });
  });

  describe("validateEmail function", () => {
    it("should return true for valid emails", () => {
      expect(validateEmail("medico@hospital.com.br")).toBeTruthy();
      expect(validateEmail("paciente@gmail.com")).toBeTruthy();
      expect(validateEmail("admin@neonpro.healthcare")).toBeTruthy();
    });

    it("should return false for invalid emails", () => {
      expect(validateEmail("invalid")).toBeFalsy();
      expect(validateEmail("@domain.com")).toBeFalsy();
      expect(validateEmail("")).toBeFalsy();
    });

    it("should handle edge cases", () => {
      expect(validateEmail("a@b.co")).toBeTruthy(); // Mínimo válido
      expect(
        validateEmail(
          "very.long.email.address.that.should.still.work@very.long.domain.name.example.com",
        ),
      ).toBeTruthy();
    });
  });
});

describe("validation Utils - Phone", () => {
  describe("phoneSchema", () => {
    it("should validate correct phone formats", () => {
      const validPhones = [
        "+5511999887766", // Brasil com código país
        "11999887766", // Brasil sem código país
        "1199988776", // Brasil formato antigo
        "+1234567890", // Internacional
        "(11)99988-7766", // Com formatação
        "11 9 9988-7766", // Com espaços
      ];

      validPhones.forEach((phone) => {
        const result = phoneSchema.safeParse(phone);
        expect(result.success).toBeTruthy();
      });
    });

    it("should reject invalid phone formats", () => {
      const invalidPhones = [
        "123", // Muito curto (menos de 10 chars)
        "", // Vazio
        "   ", // Apenas espaços (menos de 10 chars)
        "1234567890123456", // Muito longo (mais de 15 chars)
        "12345678901234567890", // Muito longo
      ];

      invalidPhones.forEach((phone) => {
        const result = phoneSchema.safeParse(phone);
        expect(result.success).toBeFalsy();
      });
    });
  });

  describe("validatePhone function", () => {
    it("should return true for valid Brazilian phone numbers", () => {
      expect(validatePhone("+5511999887766")).toBeTruthy();
      expect(validatePhone("11999887766")).toBeTruthy();
      expect(validatePhone("1199988776")).toBeTruthy();
    });

    it("should return true for international phone numbers", () => {
      expect(validatePhone("+1234567890")).toBeTruthy();
      expect(validatePhone("1234567890")).toBeTruthy();
    });

    it("should return false for invalid phone numbers", () => {
      expect(validatePhone("123")).toBeFalsy(); // Muito curto
      expect(validatePhone("1234567890123456")).toBeFalsy(); // Muito longo
      expect(validatePhone("")).toBeFalsy(); // Vazio
    });

    it("should handle edge cases", () => {
      expect(validatePhone("1234567890")).toBeTruthy(); // Exatos 10 dígitos
      expect(validatePhone("123456789012345")).toBeTruthy(); // Exatos 15 dígitos
      expect(validatePhone("123456789")).toBeFalsy(); // 9 dígitos (muito curto)
      expect(validatePhone("1234567890123456")).toBeFalsy(); // 16 dígitos (muito longo)
    });
  });
});

describe("validation Utils - Zod Re-export", () => {
  it("should re-export zod library", () => {
    expect(z).toBeDefined();
    expect(typeof z.string).toBe("function");
    expect(typeof z.number).toBe("function");
    expect(typeof z.object).toBe("function");
  });

  it("should allow creating custom schemas with re-exported zod", () => {
    const customSchema = z.object({
      name: z.string(),
      age: z.number().min(0).max(120),
    });

    const validData = { name: "João Silva", age: 45 };
    const invalidData = { name: "", age: -5 };

    expect(customSchema.safeParse(validData).success).toBeTruthy();
    expect(customSchema.safeParse(invalidData).success).toBeFalsy();
  });
});

describe("validation Utils - Healthcare Context", () => {
  it("should validate healthcare professional emails", () => {
    const healthcareProfessionalEmails = [
      "dr.silva@hospital.com.br",
      "enfermeira.maria@clinica.org",
      "fisioterapeuta@reabilitacao.med.br",
      "psicologo.joao@consultorio.psi.br",
    ];

    healthcareProfessionalEmails.forEach((email) => {
      expect(validateEmail(email)).toBeTruthy();
    });
  });

  it("should validate Brazilian healthcare phone numbers", () => {
    const healthcarePhones = [
      "11999887766", // São Paulo
      "21987654321", // Rio de Janeiro
      "31888999777", // Minas Gerais
      "85999887766", // Ceará
      "47999123456", // Santa Catarina
    ];

    healthcarePhones.forEach((phone) => {
      expect(validatePhone(phone)).toBeTruthy();
    });
  });

  it("should handle emergency contact validation", () => {
    // Números de emergência devem ser válidos mas podem ter formato especial
    const emergencyContacts = [
      "11999887766", // Contato de emergência padrão
      "+5511999887766", // Com código do país
      "1199988776", // Formato mais antigo ainda válido
    ];

    emergencyContacts.forEach((phone) => {
      expect(validatePhone(phone)).toBeTruthy();
    });
  });
});

describe("validation Utils - Performance", () => {
  it("should validate emails efficiently", () => {
    const start = performance.now();

    for (let i = 0; i < 1000; i++) {
      validateEmail(`user${i}@domain.com`);
    }

    const end = performance.now();
    const duration = end - start;

    // Should validate 1000 emails in less than 100ms
    expect(duration).toBeLessThan(100);
  });

  it("should validate phones efficiently", () => {
    const start = performance.now();

    for (let i = 0; i < 1000; i++) {
      validatePhone(`1199988${String(i).padStart(4, "0")}`);
    }

    const end = performance.now();
    const duration = end - start;

    // Should validate 1000 phone numbers in less than 100ms
    expect(duration).toBeLessThan(100);
  });
});
