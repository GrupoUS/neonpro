/**
 * Brazilian PII/PHI Redaction Service
 *
 * Comprehensive redaction of Brazilian identifiers and healthcare data
 *
 * @version 2.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA, Brazilian Healthcare Standards
 */

import { BrazilianIdentifier, BrazilianIdentifierSchema } from "./types";

// Brazilian identifier patterns
const BRAZILIAN_PATTERNS = {
  // CPF: 11 digits with optional formatting
  cpf: {
    pattern: /\b(\d{3})[.-]?(\d{3})[.-]?(\d{3})[.-]?(\d{2})\b/g,
    mask: "***.***.***-**",
    validate: (value: string): boolean => {
      const digits = value.replace(/\D/g, "");
      if (digits.length !== 11) return false;
      if (/^(\d)\1{10}$/.test(digits)) return false;

      // CPF validation algorithm
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(digits[i]) * (10 - i);
      }
      let remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(digits[9])) return false;

      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(digits[i]) * (11 - i);
      }
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;

      return remainder === parseInt(digits[10]);
    },
  },

  // CNPJ: 14 digits with optional formatting
  cnpj: {
    pattern: /\b(\d{2})[.-]?(\d{3})[.-]?(\d{3})[/]?(\d{4})[.-]?(\d{2})\b/g,
    mask: "**.***.***/****-**",
    validate: (value: string): boolean => {
      const digits = value.replace(/\D/g, "");
      if (digits.length !== 14) return false;
      if (/^(\d)\1{13}$/.test(digits)) return false;

      // CNPJ validation algorithm
      const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(digits[i]) * weights1[i];
      }
      let remainder = sum % 11;
      const digit1 = remainder < 2 ? 0 : 11 - remainder;

      sum = 0;
      for (let i = 0; i < 13; i++) {
        sum += parseInt(digits[i]) * weights2[i];
      }
      remainder = sum % 11;
      const digit2 = remainder < 2 ? 0 : 11 - remainder;

      return digit1 === parseInt(digits[12]) && digit2 === parseInt(digits[13]);
    },
  },

  // RG: Various formats by state
  rg: {
    pattern: /\b(\d{2})[.-]?(\d{3})[.-]?(\d{3})[.-]?(\d{1}|X|x)\b/g,
    mask: "**.***.***-*",
    validate: (value: string): boolean => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 9;
    },
  },

  // SUS card: 15 digits
  sus: {
    pattern: /\b(\d{3})[.-]?(\d{4})[.-]?(\d{4})[.-]?(\d{4})\b/g,
    mask: "***.****.****.****",
    validate: (value: string): boolean => {
      const digits = value.replace(/\D/g, "");
      if (digits.length !== 15) return false;

      // SUS validation algorithm
      const sum = digits.split("").reduce((acc, digit, _index) => {
        return acc + parseInt(digit) * (15 - index);
      }, 0);

      return sum % 11 === 0;
    },
  },

  // Medical council numbers
  crm: {
    pattern: /\b(CRM|crm)[-\s]?(\d{2})[.-]?(\d{3,6})[/-]?([A-Z]{2})?\b/g,
    mask: "CRM/**/*.**",
    validate: (value: string): boolean => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 5 && digits.length <= 8;
    },
  },

  coren: {
    pattern: /\b(COREN|coren)[-\s]?(\d{2})[.-]?(\d{3,6})[/-]?([A-Z]{2})?\b/g,
    mask: "COREN/**/*.**",
    validate: (value: string): boolean => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 5 && digits.length <= 8;
    },
  },

  cro: {
    pattern: /\b(CRO|cro)[-\s]?(\d{2})[.-]?(\d{3,6})[/-]?([A-Z]{2})?\b/g,
    mask: "CRO/**/*.**",
    validate: (value: string): boolean => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 5 && digits.length <= 8;
    },
  },

  cfo: {
    pattern: /\b(CFO|cfo)[-\s]?(\d{2})[.-]?(\d{3,6})[/-]?([A-Z]{2})?\b/g,
    mask: "CFO/**/*.**",
    validate: (value: string): boolean => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 5 && digits.length <= 8;
    },
  },
};

// Healthcare sensitive data patterns
const HEALTHCARE_PATTERNS = {
  // Medical record numbers
  medicalRecord: {
    pattern: /\b(prontuário|record|mr)[\s\-:]*(\d{4,10})\b/gi,
    mask: "PRONTUÁRIO-****",
  },

  // Patient IDs
  patientId: {
    pattern: /\b(patient|paciente)[\s\-_:]*(id|ID)?[\s\-:]*(\d{4,10})\b/gi,
    mask: "PATIENT-****",
  },

  // Phone numbers (Brazilian format)
  phone: {
    pattern: /\b(\+55\s?)?(\(?\d{2}\)?\s?)?(\d{4,5}[-.\s]?\d{4})\b/g,
    mask: "+55 (**) *****-****",
  },

  // Email addresses
  email: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    mask: "***@***.***",
  },

  // Birth dates
  birthDate: {
    pattern: /\b(\d{2}[/-]\d{2}[/-]\d{4})\b/g,
    mask: "**/**/****",
  },

  // Addresses
  address: {
    pattern:
      /\b(rua|av|avenida|travessa|alameda|estrada|rodovia)[\s.]+[A-Za-z\s]+,\s*\d+[\s\-A-Za-z]*/gi,
    mask: "ENDEREÇO CONFIDENCIAL",
  },

  // CEP (Brazilian postal code)
  cep: {
    pattern: /\b(\d{5})[.-]?(\d{3})\b/g,
    mask: "*****-***",
  },

  // Passwords and tokens
  credentials: {
    pattern: /\b(password|senha|token|api_key|secret)[\s=:]*[^\s]+/gi,
    mask: "***CREDENTIAL***",
  },

  // Database connection strings
  database: {
    pattern: /\b(postgres|mysql|mongodb|redis):\/\/[^\s]+\b/gi,
    mask: "DATABASE-CONNECTION-REDACTED",
  },

  // Medical terms that could be sensitive
  diagnosis: {
    pattern:
      /\b(câncer|cancer|aids|hiv|sifilis|gonorreia|herpes|hepatite|diabetes|hipertensão|depressão|ansiedade|esquizofrenia)\b/gi,
    mask: "DIAGNÓSTICO CONFIDENCIAL",
  },

  // Medication names (basic pattern)
  medication: {
    pattern:
      /\b(viagra|cialis|prozac|zoloft|lexapro|wellbutrin|adderall|ritalin|xanax|valium)\b/gi,
    mask: "MEDICAMENTO CONFIDENCIAL",
  },
};

/**
 * Brazilian PII Redaction Service
 */
export class BrazilianPIIRedactionService {
  private enableValidation: boolean;
  private customPatterns: Map<string, RegExp> = new Map();

  constructor(config: { enableValidation?: boolean } = {}) {
    this.enableValidation = config.enableValidation ?? true;
  }

  /**
   * Redact PII from text
   */
  redactText(text: string): string {
    if (!text || typeof text !== "string") return text;

    let redactedText = text;

    // Apply Brazilian identifier patterns
    Object.entries(BRAZILIAN_PATTERNS).forEach(([type, _config]) => {
      redactedText = redactedText.replace(_config.pattern, (match, ...args) => {
        const fullMatch = args[args.length - 2]; // Full match is the second to last argument

        // Validate if validation is enabled
        const isValid = this.enableValidation
          ? config.validate(fullMatch)
          : true;

        if (isValid) {
          return config.mask;
        }

        return match; // Return original if invalid
      });
    });

    // Apply healthcare patterns
    Object.entries(HEALTHCARE_PATTERNS).forEach(([type, _config]) => {
      redactedText = redactedText.replace(config.pattern, config.mask);
    });

    // Apply custom patterns
    this.customPatterns.forEach((pattern, _type) => {
      redactedText = redactedText.replace(pattern, `[CUSTOM-REDACTED:${type}]`);
    });

    return redactedText;
  }

  /**
   * Redact PII from object recursively
   */
  redactObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === "string") {
      return this.redactText(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.redactObject(item));
    }

    if (typeof obj === "object") {
      const redactedObj: any = {};

      for (const [key, value] of Object.entries(obj)) {
        // Skip redacting certain technical fields
        if (this.shouldSkipField(key)) {
          redactedObj[key] = value;
          continue;
        }

        redactedObj[key] = this.redactObject(value);
      }

      return redactedObj;
    }

    return obj;
  }

  /**
   * Extract Brazilian identifiers from text
   */
  extractBrazilianIdentifiers(text: string): BrazilianIdentifier[] {
    const identifiers: BrazilianIdentifier[] = [];

    Object.entries(BRAZILIAN_PATTERNS).forEach(([type, _config]) => {
      const matches = text.match(config.pattern);

      if (matches) {
        matches.forEach((match) => {
          const isValid = this.enableValidation ? config.validate(match) : true;

          identifiers.push(
            BrazilianIdentifierSchema.parse({
              type: type as any,
              value: match,
              masked: config.mask,
              isValid,
            }),
          );
        });
      }
    });

    return identifiers;
  }

  /**
   * Check if text contains PII
   */
  containsPII(text: string): boolean {
    // Check Brazilian patterns
    for (const config of Object.values(BRAZILIAN_PATTERNS)) {
      if (config.pattern.test(text)) {
        return true;
      }
    }

    // Check healthcare patterns
    for (const config of Object.values(HEALTHCARE_PATTERNS)) {
      if (config.pattern.test(text)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determine if field should be skipped from redaction
   */
  private shouldSkipField(fieldName: string): boolean {
    const skipFields = [
      // Technical fields
      "timestamp",
      "level",
      "service",
      "environment",
      "requestId",
      "correlationId",
      "sessionId",
      "traceId",
      "spanId",
      "duration",
      "memoryUsage",
      "cpuUsage",
      "deviceType",
      "source",
      "tags",

      // Configuration fields
      "enabled",
      "maxSize",
      "maxFiles",
      "timeout",
      "interval",
      "retentionPeriod",
      "batchSize",
      "flushInterval",

      // Status fields
      "status",
      "state",
      "code",
      "version",
      "type",
      "format",
    ];

    return skipFields.some((field) =>
      fieldName.toLowerCase().includes(field.toLowerCase()),
    );
  }

  /**
   * Add custom redaction pattern
   */
  addCustomPattern(type: string, pattern: RegExp): void {
    this.customPatterns.set(type, pattern);
  }

  /**
   * Remove custom redaction pattern
   */
  removeCustomPattern(type: string): void {
    this.customPatterns.delete(type);
  }

  /**
   * Get all detected PII types in text
   */
  getDetectedPIITypes(text: string): string[] {
    const types: string[] = [];

    Object.entries(BRAZILIAN_PATTERNS).forEach(([type, _config]) => {
      if (config.pattern.test(text)) {
        types.push(type);
      }
    });

    Object.entries(HEALTHCARE_PATTERNS).forEach(([type, _config]) => {
      if (config.pattern.test(text)) {
        types.push(type);
      }
    });

    return [...new Set(types)]; // Remove duplicates
  }

  /**
   * Validate Brazilian identifier
   */
  validateBrazilianIdentifier(type: string, value: string): boolean {
    const config = BRAZILIAN_PATTERNS[type as keyof typeof BRAZILIAN_PATTERNS];
    if (!config) return false;

    return config.validate(value);
  }

  /**
   * Generate masked version of Brazilian identifier
   */
  maskBrazilianIdentifier(type: string, value: string): string {
    const config = BRAZILIAN_PATTERNS[type as keyof typeof BRAZILIAN_PATTERNS];
    if (!config) return value;

    return config.mask;
  }

  /**
   * Get redaction statistics
   */
  getStatistics(text: string): {
    totalIdentifiers: number;
    identifiersByType: Record<string, number>;
    redactionCoverage: number;
  } {
    const identifiers = this.extractBrazilianIdentifiers(text);
    const totalIdentifiers = identifiers.length;

    const identifiersByType = identifiers.reduce(
      (acc, _id) => {
        acc[id.type] = (acc[id.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate redaction coverage (rough estimate)
    const textLength = text.length;
    const redactedLength = this.redactText(text).length;
    const redactionCoverage = Math.round(
      ((textLength - redactedLength) / textLength) * 100,
    );

    return {
      totalIdentifiers,
      identifiersByType,
      redactionCoverage,
    };
  }
}

// Export singleton instance
export const brazilianPIIRedactionService = new BrazilianPIIRedactionService();
