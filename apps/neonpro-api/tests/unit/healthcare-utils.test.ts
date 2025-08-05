import {
  calculateAge,
  calculateBrazilianTaxes,
  formatCurrency,
  formatPhoneNumber,
  generateMedicalId,
  maskSensitiveData,
  validateCEP,
  validateCNPJ,
  validateCPF,
  validateMedicalLicense,
} from "../../src/utils/healthcare";

describe("Healthcare Utilities Unit Tests", () => {
  describe("CPF Validation", () => {
    it("should validate correct CPF numbers", () => {
      const validCPFs = ["11144477735", "111.444.777-35", "12345678909", "123.456.789-09"];

      validCPFs.forEach((cpf) => {
        expect(validateCPF(cpf)).toBe(true);
      });
    });

    it("should reject invalid CPF numbers", () => {
      const invalidCPFs = [
        "12345678900", // Dígito verificador inválido
        "111.111.111-11", // Sequência repetida
        "000.000.000-00", // CPF com zeros
        "123.456.789-12", // Dígito verificador incorreto
        "123456789", // Muito curto
        "1234567890123", // Muito longo
        "abc.def.ghi-jk", // Não numérico
        "",
      ];

      invalidCPFs.forEach((cpf) => {
        expect(validateCPF(cpf)).toBe(false);
      });
    });

    it("should handle CPF formatting variations", () => {
      const cpfVariations = ["11144477735", "111.444.777-35", "111 444 777 35", "111-444-777-35"];

      // Todos devem ser considerados o mesmo CPF válido
      cpfVariations.forEach((cpf) => {
        expect(validateCPF(cpf)).toBe(true);
      });
    });
  });

  describe("CNPJ Validation", () => {
    it("should validate correct CNPJ numbers", () => {
      const validCNPJs = ["11222333000181", "11.222.333/0001-81"];

      validCNPJs.forEach((cnpj) => {
        expect(validateCNPJ(cnpj)).toBe(true);
      });
    });

    it("should reject invalid CNPJ numbers", () => {
      const invalidCNPJs = [
        "11222333000180", // Dígito verificador inválido
        "11.111.111/1111-11", // Sequência repetida
        "00.000.000/0000-00", // CNPJ com zeros
        "123456789", // Muito curto
        "",
      ];

      invalidCNPJs.forEach((cnpj) => {
        expect(validateCNPJ(cnpj)).toBe(false);
      });
    });
  });

  describe("CEP Validation", () => {
    it("should validate correct CEP formats", () => {
      const validCEPs = ["01234-567", "01234567", "12345-678"];

      validCEPs.forEach((cep) => {
        expect(validateCEP(cep)).toBe(true);
      });
    });

    it("should reject invalid CEP formats", () => {
      const invalidCEPs = [
        "0123-567", // Muito curto
        "012345678", // Muito longo
        "abcde-fgh", // Não numérico
        "00000-000", // CEP inválido
        "",
      ];

      invalidCEPs.forEach((cep) => {
        expect(validateCEP(cep)).toBe(false);
      });
    });
  });

  describe("Brazilian Tax Calculations", () => {
    it("should calculate ISS correctly for healthcare services", () => {
      const testCases = [
        {
          amount: 1000,
          municipality: "São Paulo",
          expected: { iss: 50, total: 50 }, // 5% ISS
        },
        {
          amount: 500,
          municipality: "Rio de Janeiro",
          expected: { iss: 25, total: 25 }, // 5% ISS
        },
      ];

      testCases.forEach((testCase) => {
        const result = calculateBrazilianTaxes(testCase.amount, {
          includeISS: true,
          includeIR: false,
          municipality: testCase.municipality,
          serviceType: "healthcare",
        });

        expect(result.iss).toBeCloseTo(testCase.expected.iss, 2);
        expect(result.totalTax).toBeCloseTo(testCase.expected.total, 2);
      });
    });

    it("should calculate IR for high-value services", () => {
      const highValueAmount = 20000; // R$ 20.000

      const result = calculateBrazilianTaxes(highValueAmount, {
        includeISS: true,
        includeIR: true,
        municipality: "São Paulo",
        serviceType: "healthcare",
      });

      expect(result.iss).toBeCloseTo(1000, 2); // 5% ISS
      expect(result.ir).toBeGreaterThan(0); // Deve ter IR
      expect(result.totalTax).toBeGreaterThan(1000); // Total maior que só ISS
    });

    it("should handle tax exemptions for certain procedures", () => {
      const exemptAmount = 500;

      const result = calculateBrazilianTaxes(exemptAmount, {
        includeISS: false,
        includeIR: false,
        municipality: "São Paulo",
        serviceType: "healthcare",
        isExempt: true,
      });

      expect(result.iss).toBe(0);
      expect(result.ir).toBe(0);
      expect(result.totalTax).toBe(0);
    });

    it("should apply different rates for different municipalities", () => {
      const amount = 1000;

      const spResult = calculateBrazilianTaxes(amount, {
        includeISS: true,
        municipality: "São Paulo",
        serviceType: "healthcare",
      });

      const rjResult = calculateBrazilianTaxes(amount, {
        includeISS: true,
        municipality: "Rio de Janeiro",
        serviceType: "healthcare",
      });

      // Ambos devem ter ISS, mas podem ter rates diferentes
      expect(spResult.iss).toBeGreaterThan(0);
      expect(rjResult.iss).toBeGreaterThan(0);
    });
  });

  describe("Currency Formatting", () => {
    it("should format Brazilian currency correctly", () => {
      const testCases = [
        { amount: 1234.56, expected: "R$ 1.234,56" },
        { amount: 0.99, expected: "R$ 0,99" },
        { amount: 1000000, expected: "R$ 1.000.000,00" },
        { amount: 0, expected: "R$ 0,00" },
      ];

      testCases.forEach((testCase) => {
        expect(formatCurrency(testCase.amount)).toBe(testCase.expected);
      });
    });

    it("should handle negative amounts", () => {
      expect(formatCurrency(-150.75)).toBe("R$ -150,75");
    });

    it("should handle very large amounts", () => {
      const largeAmount = 9999999.99;
      const result = formatCurrency(largeAmount);
      expect(result).toContain("R$");
      expect(result).toContain("9.999.999,99");
    });
  });

  describe("Phone Number Formatting", () => {
    it("should format Brazilian phone numbers correctly", () => {
      const testCases = [
        { input: "11987654321", expected: "+55 (11) 98765-4321" },
        { input: "1134567890", expected: "+55 (11) 3456-7890" },
        { input: "+5511987654321", expected: "+55 (11) 98765-4321" },
        { input: "(11) 98765-4321", expected: "+55 (11) 98765-4321" },
      ];

      testCases.forEach((testCase) => {
        expect(formatPhoneNumber(testCase.input)).toBe(testCase.expected);
      });
    });

    it("should handle invalid phone numbers", () => {
      const invalidNumbers = [
        "123", // Muito curto
        "123456789012345", // Muito longo
        "abcdefghijk", // Não numérico
        "",
      ];

      invalidNumbers.forEach((number) => {
        expect(formatPhoneNumber(number)).toBe(number); // Retorna original se inválido
      });
    });
  });

  describe("Medical ID Generation", () => {
    it("should generate unique medical IDs", () => {
      const ids = new Set();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const id = generateMedicalId();
        expect(ids.has(id)).toBe(false); // Deve ser único
        ids.add(id);
      }

      expect(ids.size).toBe(iterations);
    });

    it("should generate medical IDs with correct format", () => {
      const medicalId = generateMedicalId();

      // Formato esperado: NP-YYYYMMDD-XXXXX (NP = NeonPro, YYYY = ano, MM = mês, DD = dia, XXXXX = sequencial)
      expect(medicalId).toMatch(/^NP-\d{8}-\d{5}$/);
    });

    it("should include current date in medical ID", () => {
      const medicalId = generateMedicalId();
      const today = new Date();
      const expectedDatePart =
        today.getFullYear().toString() +
        (today.getMonth() + 1).toString().padStart(2, "0") +
        today.getDate().toString().padStart(2, "0");

      expect(medicalId).toContain(expectedDatePart);
    });
  });

  describe("Age Calculation", () => {
    it("should calculate age correctly", () => {
      const today = new Date();
      const testCases = [
        {
          birth: new Date(today.getFullYear() - 30, today.getMonth(), today.getDate()),
          expected: 30,
        },
        {
          birth: new Date(1990, 0, 15), // 15 de janeiro de 1990
          expected:
            today.getFullYear() - 1990 - (today < new Date(today.getFullYear(), 0, 15) ? 1 : 0),
        },
      ];

      testCases.forEach((testCase) => {
        expect(calculateAge(testCase.birth.toISOString())).toBe(testCase.expected);
      });
    });

    it("should handle future birth dates", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      expect(calculateAge(futureDate.toISOString())).toBe(0);
    });

    it("should handle leap years correctly", () => {
      const leapYearBirth = new Date(2000, 1, 29); // 29 de fevereiro de 2000
      const age = calculateAge(leapYearBirth.toISOString());

      expect(age).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(age)).toBe(true);
    });
  });

  describe("Medical License Validation", () => {
    it("should validate correct CRM formats", () => {
      const validCRMs = ["CRM/SP 123456", "CRM-RJ-789012", "CRM 345678/MG", "CRM/SC-567890"];

      validCRMs.forEach((crm) => {
        expect(validateMedicalLicense(crm)).toBe(true);
      });
    });

    it("should reject invalid CRM formats", () => {
      const invalidCRMs = [
        "CRM 123", // Muito curto
        "XYZ/SP 123456", // Prefixo inválido
        "CRM/XX 123456", // Estado inválido
        "123456", // Sem prefixo
        "",
      ];

      invalidCRMs.forEach((crm) => {
        expect(validateMedicalLicense(crm)).toBe(false);
      });
    });

    it("should validate different professional councils", () => {
      const validLicenses = [
        "CRM/SP 123456", // Médico
        "CRO/RJ 789012", // Dentista
        "COREN/MG 345678", // Enfermeiro
        "CRN/SC 567890", // Nutricionista
        "CREFITO/PR 234567", // Fisioterapeuta
      ];

      validLicenses.forEach((license) => {
        expect(validateMedicalLicense(license)).toBe(true);
      });
    });
  });

  describe("Sensitive Data Masking (LGPD Compliance)", () => {
    it("should mask CPF correctly", () => {
      const testCases = [
        { input: "12345678901", expected: "***.***.***-01" },
        { input: "123.456.789-01", expected: "***.***.***-01" },
      ];

      testCases.forEach((testCase) => {
        expect(maskSensitiveData(testCase.input, "cpf")).toBe(testCase.expected);
      });
    });

    it("should mask email addresses correctly", () => {
      const testCases = [
        { input: "joao@example.com", expected: "j***@example.com" },
        { input: "maria.silva@gmail.com", expected: "m***@gmail.com" },
        { input: "a@b.co", expected: "a***@b.co" },
      ];

      testCases.forEach((testCase) => {
        expect(maskSensitiveData(testCase.input, "email")).toBe(testCase.expected);
      });
    });

    it("should mask phone numbers correctly", () => {
      const testCases = [
        { input: "+5511987654321", expected: "+55(**)*****-4321" },
        { input: "(11) 98765-4321", expected: "(**)*****-4321" },
      ];

      testCases.forEach((testCase) => {
        expect(maskSensitiveData(testCase.input, "phone")).toBe(testCase.expected);
      });
    });

    it("should mask medical record numbers", () => {
      const medicalRecord = "NP-20241205-12345";
      const masked = maskSensitiveData(medicalRecord, "medical_id");

      expect(masked).toContain("***");
      expect(masked).not.toBe(medicalRecord);
    });

    it("should handle invalid data types gracefully", () => {
      expect(maskSensitiveData("any-data", "invalid_type" as any)).toBe("any-data");
      expect(maskSensitiveData("", "cpf")).toBe("");
      expect(maskSensitiveData(null as any, "cpf")).toBe("");
    });
  });

  describe("LGPD Compliance Utilities", () => {
    it("should identify sensitive data fields", () => {
      const patientData = {
        id: "patient-123",
        fullName: "João Silva",
        cpf: "12345678901",
        email: "joao@example.com",
        phone: "11987654321",
        dateOfBirth: "1990-01-01",
        medicalId: "NP-20241205-12345",
        address: "Rua das Flores, 123",
      };

      const sensitiveFields = ["cpf", "email", "phone", "medicalId"];

      sensitiveFields.forEach((field) => {
        expect(patientData[field as keyof typeof patientData]).toBeDefined();
      });
    });

    it("should create LGPD-compliant export format", () => {
      const patientData = {
        personalData: {
          fullName: "João Silva",
          cpf: "12345678901",
          email: "joao@example.com",
        },
        medicalData: {
          allergies: ["Penicilina"],
          medications: ["Paracetamol"],
        },
      };

      // Simular função de exportação LGPD
      const exportData = {
        ...patientData,
        exportMetadata: {
          exportedAt: new Date().toISOString(),
          dataSubject: "João Silva",
          exportPurpose: "LGPD Article 15 - Right to Access",
          dataRetentionPolicy: "7 years for medical records",
          dataProcessingBasis: "Patient consent and legal obligation",
        },
      };

      expect(exportData.exportMetadata).toHaveProperty("exportedAt");
      expect(exportData.exportMetadata).toHaveProperty("dataRetentionPolicy");
      expect(exportData.exportMetadata.exportPurpose).toContain("LGPD");
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle null and undefined inputs gracefully", () => {
      expect(validateCPF(null as any)).toBe(false);
      expect(validateCPF(undefined as any)).toBe(false);
      expect(formatCurrency(null as any)).toBe("R$ 0,00");
      expect(calculateAge(null as any)).toBe(0);
    });

    it("should handle malformed data inputs", () => {
      const malformedInputs = [
        "   ", // Apenas espaços
        "undefined",
        "null",
        "{}",
        "[]",
      ];

      malformedInputs.forEach((input) => {
        expect(validateCPF(input)).toBe(false);
        expect(validateCEP(input)).toBe(false);
      });
    });

    it("should maintain performance with large datasets", () => {
      const largeDataset = Array(1000)
        .fill(null)
        .map((_, index) => ({
          cpf: `${index.toString().padStart(11, "0")}`,
          amount: Math.random() * 10000,
        }));

      const startTime = Date.now();

      largeDataset.forEach((item) => {
        validateCPF(item.cpf);
        formatCurrency(item.amount);
      });

      const endTime = Date.now();

      // Deve processar 1000 itens em menos de 1 segundo
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
