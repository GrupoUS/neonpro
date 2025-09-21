/**
 * Tests for Brazilian Validation Schemas (T037)
 * Following TDD methodology - MUST FAIL FIRST
 */

import { describe, expect, it } from "vitest";

describe("Brazilian Validation Schemas (T037)", () => {
  it(_"should export validation functions",_() => {
    expect(_() => {
      const module = require("../brazilian");
      expect(module.validateCPF).toBeDefined();
      expect(module.validateCNPJ).toBeDefined();
      expect(module.validateCEP).toBeDefined();
    }).not.toThrow();
  });

  describe(_"CPF Validation",_() => {
    it(_"should validate correct CPF formats",_() => {
      const { validateCPF } = require("../brazilian");
      expect(validateCPF("111.444.777-35")).toBe(true);
      expect(validateCPF("11144477735")).toBe(true);
      expect(validateCPF("123.456.789-09")).toBe(true);
    });

    it(_"should reject invalid CPF formats",_() => {
      const { validateCPF } = require("../brazilian");
      expect(validateCPF("000.000.000-00")).toBe(false);
      expect(validateCPF("111.111.111-11")).toBe(false);
      expect(validateCPF("123.456.789-00")).toBe(false);
      expect(validateCPF("invalid")).toBe(false);
      expect(validateCPF("")).toBe(false);
    });

    it(_"should format CPF correctly",_() => {
      const { formatCPF } = require("../brazilian");
      expect(formatCPF("11144477735")).toBe("111.444.777-35");
      expect(formatCPF("111.444.777-35")).toBe("111.444.777-35");
    });
  });

  describe(_"CNPJ Validation",_() => {
    it(_"should validate correct CNPJ formats",_() => {
      const { validateCNPJ } = require("../brazilian");
      expect(validateCNPJ("11.222.333/0001-81")).toBe(true);
      expect(validateCNPJ("11222333000181")).toBe(true);
    });

    it(_"should reject invalid CNPJ formats",_() => {
      const { validateCNPJ } = require("../brazilian");
      expect(validateCNPJ("00.000.000/0000-00")).toBe(false);
      expect(validateCNPJ("11.111.111/1111-11")).toBe(false);
      expect(validateCNPJ("invalid")).toBe(false);
      expect(validateCNPJ("")).toBe(false);
    });

    it(_"should format CNPJ correctly",_() => {
      const { formatCNPJ } = require("../brazilian");
      expect(formatCNPJ("11222333000181")).toBe("11.222.333/0001-81");
      expect(formatCNPJ("11.222.333/0001-81")).toBe("11.222.333/0001-81");
    });
  });

  describe(_"Phone Validation",_() => {
    it(_"should validate Brazilian phone numbers",_() => {
      const { validateBrazilianPhone } = require("../brazilian");
      expect(validateBrazilianPhone("(11) 99999-9999")).toBe(true);
      expect(validateBrazilianPhone("11999999999")).toBe(true);
      expect(validateBrazilianPhone("(11) 3333-4444")).toBe(true);
      expect(validateBrazilianPhone("1133334444")).toBe(true);
    });

    it(_"should reject invalid phone numbers",_() => {
      const { validateBrazilianPhone } = require("../brazilian");
      expect(validateBrazilianPhone("(00) 99999-9999")).toBe(false);
      expect(validateBrazilianPhone("123456")).toBe(false);
      expect(validateBrazilianPhone("invalid")).toBe(false);
      expect(validateBrazilianPhone("")).toBe(false);
    });

    it(_"should format phone numbers correctly",_() => {
      const { formatBrazilianPhone } = require("../brazilian");
      expect(formatBrazilianPhone("11999999999")).toBe("(11) 99999-9999");
      expect(formatBrazilianPhone("1133334444")).toBe("(11) 3333-4444");
    });
  });

  describe(_"CEP Validation",_() => {
    it(_"should validate Brazilian CEP formats",_() => {
      const { validateCEP } = require("../brazilian");
      expect(validateCEP("01234-567")).toBe(true);
      expect(validateCEP("01234567")).toBe(true);
      expect(validateCEP("12345-678")).toBe(true);
    });

    it(_"should reject invalid CEP formats",_() => {
      const { validateCEP } = require("../brazilian");
      expect(validateCEP("00000-000")).toBe(false);
      expect(validateCEP("invalid")).toBe(false);
      expect(validateCEP("123")).toBe(false);
      expect(validateCEP("")).toBe(false);
    });

    it(_"should format CEP correctly",_() => {
      const { formatCEP } = require("../brazilian");
      expect(formatCEP("01234567")).toBe("01234-567");
      expect(formatCEP("01234-567")).toBe("01234-567");
    });
  });

  describe(_"Healthcare Validations",_() => {
    it(_"should validate CRM numbers",_() => {
      const { validateCRM } = require("../brazilian");
      expect(validateCRM("123456", "SP")).toBe(true);
      expect(validateCRM("CRM/SP 123456")).toBe(true);
      expect(validateCRM("invalid")).toBe(false);
      expect(validateCRM("")).toBe(false);
    });

    it(_"should validate ANVISA codes",_() => {
      const { validateANVISACode } = require("../brazilian");
      expect(validateANVISACode("1.0123.4567.890-1")).toBe(true);
      expect(validateANVISACode("10123456789012")).toBe(true);
      expect(validateANVISACode("invalid")).toBe(false);
      expect(validateANVISACode("")).toBe(false);
    });

    it(_"should validate SUS card numbers",_() => {
      const { validateSUSCard } = require("../brazilian");
      expect(validateSUSCard("123 4567 8901 2345")).toBe(true);
      expect(validateSUSCard("12345678901234567890")).toBe(false); // Invalid length
      expect(validateSUSCard("invalid")).toBe(false);
      expect(validateSUSCard("")).toBe(false);
    });
  });

  describe(_"Validation Messages",_() => {
    it(_"should provide Portuguese error messages",_() => {
      const { getValidationMessage } = require("../brazilian");
      expect(getValidationMessage("cpf", "invalid")).toContain("CPF inválido");
      expect(getValidationMessage("cnpj", "invalid")).toContain(
        "CNPJ inválido",
      );
      expect(getValidationMessage("phone", "invalid")).toContain(
        "telefone inválido",
      );
      expect(getValidationMessage("cep", "invalid")).toContain("CEP inválido");
    });

    it(_"should provide field-specific messages",_() => {
      const { getValidationMessage } = require("../brazilian");
      expect(getValidationMessage("cpf", "required")).toContain(
        "CPF é obrigatório",
      );
      expect(getValidationMessage("phone", "format")).toContain(
        "formato do telefone",
      );
      expect(getValidationMessage("cep", "not_found")).toContain(
        "CEP não encontrado",
      );
    });
  });

  describe(_"Comprehensive Validation",_() => {
    it(_"should validate patient data",_() => {
      const { validatePatientData } = require("../brazilian");

      const validPatient = {
        name: "João Silva",
        cpf: "111.444.777-35",
        phone: "(11) 99999-9999",
        email: "joao@example.com",
        cep: "01234-567",
      };

      const result = validatePatientData(validPatient);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it(_"should return validation errors for invalid data",_() => {
      const { validatePatientData } = require("../brazilian");

      const invalidPatient = {
        name: "",
        cpf: "000.000.000-00",
        phone: "invalid",
        email: "invalid-email",
        cep: "00000-000",
      };

      const result = validatePatientData(invalidPatient);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(_result.errors.some((e) => e.field === "cpf")).toBe(true);
      expect(_result.errors.some((e) => e.field === "phone")).toBe(true);
    });
  });

  describe(_"Address Validation",_() => {
    it(_"should validate Brazilian addresses",_() => {
      const { validateBrazilianAddress } = require("../brazilian");

      const validAddress = {
        street: "Rua das Flores, 123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        cep: "01234-567",
        country: "Brasil",
      };

      const result = validateBrazilianAddress(validAddress);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it(_"should validate Brazilian states",_() => {
      const { validateBrazilianState } = require("../brazilian");
      expect(validateBrazilianState("SP")).toBe(true);
      expect(validateBrazilianState("RJ")).toBe(true);
      expect(validateBrazilianState("XX")).toBe(false);
      expect(validateBrazilianState("")).toBe(false);
    });
  });

  describe(_"Utility Functions",_() => {
    it(_"should clean document numbers",_() => {
      const { cleanDocument } = require("../brazilian");
      expect(cleanDocument("111.444.777-35")).toBe("11144477735");
      expect(cleanDocument("11.222.333/0001-81")).toBe("11222333000181");
      expect(cleanDocument("(11) 99999-9999")).toBe("11999999999");
    });

    it(_"should generate validation schemas",_() => {
      const { createValidationSchema } = require("../brazilian");
      const schema = createValidationSchema({
        cpf: { required: true },
        phone: { required: true },
        email: { required: false },
      });

      expect(schema).toBeDefined();
      expect(typeof schema.validate).toBe("function");
    });

    it(_"should provide Brazilian healthcare constants",_() => {
      const {
        BRAZILIAN_STATES,
        HEALTHCARE_SPECIALTIES,
      } = require("../brazilian");
      expect(BRAZILIAN_STATES).toContain("SP");
      expect(BRAZILIAN_STATES).toContain("RJ");
      expect(HEALTHCARE_SPECIALTIES).toContain("Clínica Médica");
      expect(HEALTHCARE_SPECIALTIES).toContain("Cardiologia");
    });
  });
});
