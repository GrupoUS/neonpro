/**
 * Test Setup for Healthcare Compliance Logging Tests
 * Extends test setup with compliance-specific logging configurations
 */

import { vi } from "vitest";

// Mock console methods globally for all compliance tests
const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
const mockConsoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});

// Store original console methods for restoration
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
};

// Test environment setup
export const setupComplianceLoggingTests = () => {
  // Clear all mock calls before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Restore original console methods after all tests
  afterEach(() => {
    vi.restoreAllMocks();
  });

  return {
    mockConsoleLog,
    mockConsoleError,
    mockConsoleWarn,
    mockConsoleInfo,
    originalConsole,
  };
};

// LGPD-specific test utilities
export const lgpdTestUtils = {
  // Check for LGPD personal identifiers
  hasLgpdPersonalData: (output: string[][]) => {
    const lgpdPatterns = [
      // Names
      "[A-Z][a-z]+ [A-Z][a-z]+",
      // CPF
      "\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}",
      // RG
      "\\d{2}\\.\\d{3}\\.\\d{3}-\\d{1}",
      // Phone numbers
      "\\+55 \\d{2} \\d{4,5}-\\d{4}",
      "\\(\\d{2}\\) \\d{4,5}-\\d{4}",
      // Email
      "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
      // Address components
      "Rua|Av|Rua|Travessa|Alameda",
      "São Paulo|Rio de Janeiro|Belo Horizonte",
      // Birth date
      "\\d{4}-\\d{2}-\\d{2}",
      // Mother's name
      "mãe|mother",
    ];

    return output.some((log) => {
      const logStr = JSON.stringify(log);
      return lgpdPatterns.some((pattern) => {
        const regex = new RegExp(pattern, "i");
        return regex.test(logStr);
      });
    });
  },

  // Check for LGPD sensitive personal data
  hasLgpdSensitiveData: (output: string[][]) => {
    const sensitivePatterns = [
      // Health data
      "diabetes|hipertensão|câncer|doença",
      // Genetic data
      "dna|genético|genoma|mutação",
      // Biometric data
      "digital|facial|íris|voz|biometria",
      // Religious/philosophical beliefs
      "religião|crença|filosófico",
      // Sexual orientation
      "orientação sexual|preferência",
      // Union/membership data
      "sindicato|associação|filiação",
      // Racial/ethnic data
      "raça|etnia|cor",
    ];

    return output.some((log) => {
      const logStr = JSON.stringify(log).toLowerCase();
      return sensitivePatterns.some((pattern) => {
        const regex = new RegExp(pattern);
        return regex.test(logStr);
      });
    });
  },
};

// CFM-specific test utilities
export const cfmTestUtils = {
  // Check for medical professional data
  hasCfmProfessionalData: (output: string[][]) => {
    const cfmPatterns = [
      // CRM numbers
      "\\d{5,6}-[A-Z]{2}",
      "CRM\\s*\\d{5,6}",
      // Medical specialties
      "cardiologia|ortopedia|pediatria|ginecologia|neurologia",
      // Prescription data
      "mg|ml|comprimido|cápsula|gotas",
      "via oral|intramuscular|subcutânea",
      // Medical procedures
      "cirurgia|consulta|exame|procedimento",
      // Medical certificates
      "atestado|licença|afastamento",
      // Medical terminology
      "diagnóstico|hipótese|conduta|tratamento",
    ];

    return output.some((log) => {
      const logStr = JSON.stringify(log).toLowerCase();
      return cfmPatterns.some((pattern) => {
        const regex = new RegExp(pattern);
        return regex.test(logStr);
      });
    });
  },

  // Check for patient-practitioner communication
  hasConfidentialCommunication: (output: string[][]) => {
    const communicationPatterns = [
      // Medical consultation content
      "paciente refere|queixa principal|história atual",
      "exame físico|sinais vitais|diagnóstico",
      "prescrição médica|recomendações",
      // Telemedicine data
      "telemedicina|sessão|gravação|transcrição",
      "video conferência|chamada",
    ];

    return output.some((log) => {
      const logStr = JSON.stringify(log).toLowerCase();
      return communicationPatterns.some((pattern) => {
        const regex = new RegExp(pattern);
        return regex.test(logStr);
      });
    });
  },
};

// ANVISA-specific test utilities
export const anvisaTestUtils = {
  // Check for medical device data
  hasAnvisaDeviceData: (output: string[][]) => {
    const devicePatterns = [
      // Device identification
      "equipamento|device|aparelho",
      "modelo|fabricante|número série",
      "ANVISA\\s*\\d{11}", // ANVISA registration
      // Calibration data
      "calibração|validação|certificação",
      "parâmetro|especificação|tolerância",
      // Device types
      "ressonância|tomografia|ultrassom",
      "raio-x|eletrocardiógrafo|ventilador",
    ];

    return output.some((log) => {
      const logStr = JSON.stringify(log).toLowerCase();
      return devicePatterns.some((pattern) => {
        const regex = new RegExp(pattern);
        return regex.test(logStr);
      });
    });
  },

  // Check for clinical trial data
  hasClinicalTrialData: (output: string[][]) => {
    const trialPatterns = [
      // Trial identification
      "protocolo|estudo|pesquisa clínica",
      "fase I|fase II|fase III|fase IV",
      // Participant data
      "participante|voluntário|sujeito",
      "grupo controle|grupo intervenção",
      // Trial procedures
      "randomizado|duplo-cego|placebo",
      "eventos adversos|reações adversas",
      "monitoramento|segurança|eficácia",
    ];

    return output.some((log) => {
      const logStr = JSON.stringify(log).toLowerCase();
      return trialPatterns.some((pattern) => {
        const regex = new RegExp(pattern);
        return regex.test(logStr);
      });
    });
  },

  // Check for vaccine/pharmacovigilance data
  hasPharmacovigilanceData: (output: string[][]) => {
    const pharmaPatterns = [
      // Vaccine data
      "vacina|imunização|lote|validade",
      "fabricante|laboratório",
      // Adverse reactions
      "reação adversa|evento adverso",
      "notificação|farmacovigilância",
      "sangramento|cefaleia|febre",
      // Blood bank data
      "banco de sangue|doação|transfusão",
      "tipo sanguíneo|fator RH|hemoderivados",
    ];

    return output.some((log) => {
      const logStr = JSON.stringify(log).toLowerCase();
      return pharmaPatterns.some((pattern) => {
        const regex = new RegExp(pattern);
        return regex.test(logStr);
      });
    });
  },
};

// General compliance test utilities
export const complianceTestUtils = {
  // Check for data retention violations
  hasRetentionViolations: (output: string[][]) => {
    const retentionPatterns = [
      "retenção excessiva|retenção prolongada",
      "período de retenção|política de retenção",
      "expirou|vencido|fora do prazo",
      "backup|armazenamento|arquivo",
    ];

    return output.some((log) => {
      const logStr = JSON.stringify(log).toLowerCase();
      return retentionPatterns.some((pattern) => {
        const regex = new RegExp(pattern);
        return regex.test(logStr);
      });
    });
  },

  // Check for data breach notifications
  hasBreachNotificationData: (output: string[][]) => {
    const breachPatterns = [
      "incidente de segurança|violação de dados",
      "notificação obrigatória|comunicação",
      "autoridade controladora|ANPD|ANVISA",
      "pacientes afetados|registros comprometidos",
      "ação corretiva|medida mitigação",
    ];

    return output.some((log) => {
      const logStr = JSON.stringify(log).toLowerCase();
      return breachPatterns.some((pattern) => {
        const regex = new RegExp(pattern);
        return regex.test(logStr);
      });
    });
  },

  // Check for consent-related data
  hasConsentData: (output: string[][]) => {
    const consentPatterns = [
      "consentimento|autorização|termo",
      "LGPD|artigo 7|artigo 8",
      "tratamento de dados|finalidade",
      "direito do titular|revogação",
    ];

    return output.some((log) => {
      const logStr = JSON.stringify(log).toLowerCase();
      return consentPatterns.some((pattern) => {
        const regex = new RegExp(pattern);
        return regex.test(logStr);
      });
    });
  },

  // Check for structured compliance logging
  hasStructuredComplianceLogging: (output: string[][]) => {
    const requiredFields = [
      "complianceFramework",
      "regulation",
      "article",
      "dataType",
      "consentStatus",
      "retentionPeriod",
      "dataCategory",
      "timestamp",
      "eventType",
    ];

    return output.some((call) => {
      const logStr = JSON.stringify(call);
      return requiredFields.some((field) => logStr.includes(field));
    });
  },

  getConsoleOutput: () => ({
    logs: mockConsoleLog.mock.calls,
    errors: mockConsoleError.mock.calls,
    warnings: mockConsoleWarn.mock.calls,
    info: mockConsoleInfo.mock.calls,
  }),

  resetConsoleMocks: () => {
    mockConsoleLog.mockReset();
    mockConsoleError.mockReset();
    mockConsoleWarn.mockReset();
    mockConsoleInfo.mockReset();
  },
};
