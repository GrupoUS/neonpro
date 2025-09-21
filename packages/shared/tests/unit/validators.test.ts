import { describe, it, expect } from "vitest";
import {
  validateCPF,
  validateCNPJ,
  validatePhone,
  validateCEP,
  cleanDocument,
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP,
} from "../../src/validators/brazilian";

describe(_"Brazilian Validators - T078",_() => {
  describe(_"validateCPF",_() => {
    it(_"should validate correct CPF numbers",_() => {
      const validCPFs = [
        "123.456.789-09",
        "12345678909",
        "987.654.321-00",
        "98765432100",
      ];

      validCPFs.forEach(_(cpf) => {
        expect(validateCPF(cpf)).toBe(true);
      });
    });

    it(_"should reject invalid CPF formats",_() => {
      const invalidCPFs = [
        "123.456.789-00", // Wrong check digit
        "111.111.111-11", // All same digits
        "123.456.789", // Missing digits
        "123.456.789-000", // Too many digits
        "abc.def.ghi-jk", // Non-numeric
        "", // Empty
        null, // Null
        undefined, // Undefined
      ];

      invalidCPFs.forEach(_(cpf) => {
        expect(validateCPF(cpf)).toBe(false);
      });
    });
  });

  describe(_"validateCNPJ",_() => {
    it(_"should validate correct CNPJ numbers",_() => {
      const validCNPJs = [
        "12.345.678/0001-95",
        "12345678000195",
        "11.444.777/0001-61",
      ];

      validCNPJs.forEach(_(cnpj) => {
        expect(validateCNPJ(cnpj)).toBe(true);
      });
    });

    it(_"should reject invalid CNPJ formats",_() => {
      const invalidCNPJs = [
        "12.345.678/0001-00", // Wrong check digit
        "11.111.111/1111-11", // All same digits
        "12.345.678/0001", // Missing digits
        "12.345.678/0001-956", // Too many digits
        "abc.def.ghi/jk-lm", // Non-numeric
        "", // Empty
        null, // Null
        undefined, // Undefined
      ];

      invalidCNPJs.forEach(_(cnpj) => {
        expect(validateCNPJ(cnpj)).toBe(false);
      });
    });
  });

  describe(_"validatePhone",_() => {
    it(_"should validate correct Brazilian phone numbers",_() => {
      const validPhones = [
        "(11) 99999-8888",
        "11999998888",
        "(21) 2555-1234",
        "2125551234",
        "+55 11 99999-8888",
      ];

      validPhones.forEach(_(phone) => {
        expect(validatePhone(phone)).toBe(true);
      });
    });

    it(_"should reject invalid phone formats",_() => {
      const invalidPhones = [
        "(11) 9999-888", // Too short
        "(11) 999999-8888", // Too long
        "1234", // Too short
        "abc-def-ghij", // Non-numeric
        "", // Empty
        null, // Null
        undefined, // Undefined
      ];

      invalidPhones.forEach(_(phone) => {
        expect(validatePhone(phone)).toBe(false);
      });
    });
  });

  describe(_"validateCEP",_() => {
    it(_"should validate correct CEP numbers",_() => {
      const validCEPs = ["01310-100", "01310100", "20040-020", "20040020"];

      validCEPs.forEach(_(cep) => {
        expect(validateCEP(cep)).toBe(true);
      });
    });

    it(_"should reject invalid CEP formats",_() => {
      const invalidCEPs = [
        "0131-100", // Wrong format
        "01310-1000", // Too long
        "0131-0100", // Wrong format
        "abcde-fgh", // Non-numeric
        "", // Empty
        null, // Null
        undefined, // Undefined
      ];

      invalidCEPs.forEach(_(cep) => {
        expect(validateCEP(cep)).toBe(false);
      });
    });
  });

  describe(_"cleanDocument",_() => {
    it(_"should remove formatting from CPF",_() => {
      expect(cleanDocument("123.456.789-09")).toBe("12345678909");
    });

    it(_"should remove formatting from CNPJ",_() => {
      expect(cleanDocument("12.345.678/0001-95")).toBe("12345678000195");
    });

    it(_"should handle already clean documents",_() => {
      expect(cleanDocument("12345678909")).toBe("12345678909");
    });

    it(_"should handle empty/null inputs",_() => {
      expect(cleanDocument("")).toBe("");
      expect(cleanDocument(null)).toBe("");
    });
  });

  describe(_"formatCPF",_() => {
    it(_"should format CPF correctly",_() => {
      expect(formatCPF("12345678909")).toBe("123.456.789-09");
    });

    it(_"should handle already formatted CPF",_() => {
      expect(formatCPF("123.456.789-09")).toBe("123.456.789-09");
    });
  });

  describe(_"formatCNPJ",_() => {
    it(_"should format CNPJ correctly",_() => {
      expect(formatCNPJ("12345678000195")).toBe("12.345.678/0001-95");
    });

    it(_"should handle already formatted CNPJ",_() => {
      expect(formatCNPJ("12.345.678/0001-95")).toBe("12.345.678/0001-95");
    });
  });

  describe(_"formatPhone",_() => {
    it(_"should format mobile phone correctly",_() => {
      expect(formatPhone("11999998888")).toBe("(11) 99999-8888");
    });

    it(_"should format landline correctly",_() => {
      expect(formatPhone("2125551234")).toBe("(21) 2555-1234");
    });

    it(_"should handle already formatted phone",_() => {
      expect(formatPhone("(11) 99999-8888")).toBe("(11) 99999-8888");
    });
  });

  describe(_"formatCEP",_() => {
    it(_"should format CEP correctly",_() => {
      expect(formatCEP("01310100")).toBe("01310-100");
    });

    it(_"should handle already formatted CEP",_() => {
      expect(formatCEP("01310-100")).toBe("01310-100");
    });
  });

  describe(_"edge cases",_() => {
    it(_"should handle malformed input gracefully",_() => {
      expect(validateCPF("not-a-cpf")).toBe(false);
      expect(validateCNPJ("not-a-cnpj")).toBe(false);
      expect(validatePhone("not-a-phone")).toBe(false);
      expect(validateCEP("not-a-cep")).toBe(false);
    });

    it(_"should handle special characters",_() => {
      expect(validateCPF("123.456.789-09!")).toBe(false);
      expect(validatePhone("(11) 9999-8888 ext. 123")).toBe(false);
    });

    it(_"should handle whitespace",_() => {
      expect(validateCPF(" 123.456.789-09 ")).toBe(false);
      expect(validatePhone(" (11) 99999-8888 ")).toBe(true);
    });
  });
});
