/**
 * @fileoverview LGPD-compliant data anonymization utilities for healthcare
 * @version 1.0.0
 * @author NeonPro Platform Team
 * @compliance LGPD, ANVISA
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Configuration options for data masking
 */
export interface MaskingOptions {
  /** Masking character to use */
  maskChar?: string;
  /** Number of visible characters at the start */
  visibleStart?: number;
  /** Number of visible characters at the end */
  visibleEnd?: number;
  /** Whether to preserve formatting (e.g., CPF/CNPJ masks) */
  preserveFormat?: boolean;
  /** Custom masking pattern for specific field types */
  customPattern?: string;
}

/**
 * LGPD compliance levels for anonymization
 */
export type LGPDComplianceLevel = 'basic' | 'enhanced' | 'full_anonymization';

/**
 * Patient data structure for healthcare anonymization
 */
export interface PatientData {
  id?: string;
  name?: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  medicalData?: {
    diagnosis?: string[];
    allergies?: string[];
    medications?: string[];
    vitals?: Record<string, unknown>;
  };
  [key: string]: unknown;
}

/**
 * Anonymization metadata for audit trails
 */
export interface AnonymizationMetadata {
  /** Timestamp of anonymization */
  anonymizedAt: string;
  /** Method used for anonymization */
  method: string;
  /** Compliance level applied */
  complianceLevel: LGPDComplianceLevel;
  /** Fields that were anonymized */
  fieldsAnonymized: string[];
  /** Version of anonymization rules */
  version: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Version of the anonymization module
 */
export const ANONYMIZATION_VERSION = '1.0.0';

/**
 * Default masking options for standard LGPD compliance
 */
export const DEFAULT_MASKING_OPTIONS: MaskingOptions = {
  maskChar: '*',
  visibleStart: 2,
  visibleEnd: 2,
  preserveFormat: true,
};

// ============================================================================
// CORE MASKING FUNCTIONS
// ============================================================================

/**
 * Mask a CPF according to LGPD guidelines
 */
export function maskCPF(cpf: string, options: MaskingOptions = {}): string {
  if (!cpf) return '';

  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) {
    return cpf; // Return original if invalid CPF
  }

  const { maskChar = '*', visibleStart = 0, visibleEnd = 0, preserveFormat = true } = options;

  if (preserveFormat) {
    // Preserve CPF format: XXX.XXX.XXX-XX
    const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    const visibleChars = visibleStart + visibleEnd;
    const totalChars = formatted.length;

    if (visibleChars >= totalChars) return formatted;

    const start = formatted.slice(0, visibleStart);
    const end = formatted.slice(-visibleEnd);
    const middle = maskChar.repeat(totalChars - visibleChars);

    return start + middle + end;
  }

  // Simple masking without format
  const visibleChars = visibleStart + visibleEnd;
  const maskedChars = maskChar.repeat(Math.max(0, cleaned.length - visibleChars));
  const startPart = cleaned.slice(0, visibleStart);
  const endPart = cleaned.slice(-visibleEnd);

  return startPart + maskedChars + endPart;
}

/**
 * Mask a CNPJ according to LGPD guidelines
 */
export function maskCNPJ(cnpj: string, options: MaskingOptions = {}): string {
  if (!cnpj) return '';

  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) {
    return cnpj; // Return original if invalid CNPJ
  }

  const { maskChar = '*', visibleStart = 0, visibleEnd = 0, preserveFormat = true } = options;

  if (preserveFormat) {
    // Preserve CNPJ format: XX.XXX.XXX/XXXX-XX
    const formatted = cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    const visibleChars = visibleStart + visibleEnd;
    const totalChars = formatted.length;

    if (visibleChars >= totalChars) return formatted;

    const start = formatted.slice(0, visibleStart);
    const end = formatted.slice(-visibleEnd);
    const middle = maskChar.repeat(totalChars - visibleChars);

    return start + middle + end;
  }

  // Simple masking without format
  const visibleChars = visibleStart + visibleEnd;
  const maskedChars = maskChar.repeat(Math.max(0, cleaned.length - visibleChars));
  const startPart = cleaned.slice(0, visibleStart);
  const endPart = cleaned.slice(-visibleEnd);

  return startPart + maskedChars + endPart;
}

/**
 * Mask an email address
 */
export function maskEmail(email: string, options: MaskingOptions = {}): string {
  if (!email) return '';

  const { maskChar = '*', visibleStart = 2, visibleEnd = 1 } = options;
  const [localPart, domain] = email.split('@');

  if (!localPart || !domain) {
    return email;
  }

  // Mask local part
  const visibleLocalChars = Math.min(visibleStart, localPart.length - 1);
  const maskedLocal = localPart.slice(0, visibleLocalChars)
    + maskChar.repeat(Math.max(0, localPart.length - visibleLocalChars - visibleEnd))
    + localPart.slice(-visibleEnd);

  // Mask domain name (keep TLD visible)
  const domainParts = domain.split('.');
  const tld = domainParts.pop() || '';
  const maskedDomainParts = domainParts.map(part =>
    part.slice(0, 1) + maskChar.repeat(Math.max(0, part.length - 1))
  );

  return `${maskedLocal}@${maskedDomainParts.join('.')}.${tld}`;
}

/**
 * Mask a phone number
 */
export function maskPhone(phone: string, options: MaskingOptions = {}): string {
  if (!phone) return '';

  const { maskChar = '*', visibleStart = 2, visibleEnd = 2 } = options;
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length < 10) {
    return phone;
  }

  // Keep country code and area code partially visible
  const countryCode = cleaned.slice(0, 2);
  const areaCode = cleaned.slice(2, 4);
  const number = cleaned.slice(4);

  const visibleNumberChars = Math.min(visibleStart + visibleEnd, number.length);
  const maskedNumber = number.slice(0, visibleStart)
    + maskChar.repeat(Math.max(0, number.length - visibleNumberChars))
    + number.slice(-visibleEnd);

  return `+${countryCode} (${areaCode}) ${maskedNumber}`;
}

/**
 * Mask a name (first and last name visible, middle names masked)
 */
export function maskName(name: string, options: MaskingOptions = {}): string {
  if (!name) return '';

  const { maskChar = '*' } = options;
  const names = name.split(' ');

  return names.map((namepart, index) => {
    if (index === 0 || index === names.length - 1) {
      return namepart.slice(0, 2) + maskChar.repeat(Math.max(0, namepart.length - 2));
    }
    return maskChar.repeat(namepart.length);
  }).join(' ');
}

/**
 * Mask an address
 */
export function maskAddress(address: string, options: MaskingOptions = {}): string {
  if (!address) return '';

  const { maskChar = '*' } = options;
  return address.replace(/./g, maskChar);
}

// ============================================================================
// PATIENT DATA MASKING
// ============================================================================

/**
 * Mask patient data according to LGPD guidelines
 */
export function maskPatientData(patient: PatientData, options: MaskingOptions = {}): PatientData {
  const masked: PatientData = { ...patient };

  if (masked.name) {
    masked.name = maskName(masked.name, options);
  }

  if (masked.cpf) {
    masked.cpf = maskCPF(masked.cpf, options);
  }

  if (masked.cnpj) {
    masked.cnpj = maskCNPJ(masked.cnpj, options);
  }

  if (masked.email) {
    masked.email = maskEmail(masked.email, options);
  }

  if (masked.phone) {
    masked.phone = maskPhone(masked.phone, options);
  }

  if (masked.birthDate) {
    const date = new Date(masked.birthDate);
    masked.birthDate = `**/**/${date.getFullYear()}`;
  }

  if (masked.address) {
    masked.address = {
      ...masked.address,
      street: masked.address.street ? maskAddress(masked.address.street, options) : undefined,
      number: masked.address.number ? '***' : undefined,
      complement: masked.address.complement ? '***' : undefined,
      neighborhood: masked.address.neighborhood ? '***' : undefined,
    };
  }

  return masked;
}

// ============================================================================
// ANONYMIZATION FUNCTIONS
// ============================================================================

/**
 * Complete anonymization of personal data
 */
export function anonymizePersonalData(
  data: Record<string, unknown>,
  complianceLevel: LGPDComplianceLevel = 'basic',
): { anonymizedData: Record<string, unknown>; metadata: AnonymizationMetadata } {
  const anonymizedData: Record<string, unknown> = {};
  const fieldsAnonymized: string[] = [];

  const fieldsToAnonymize = {
    basic: ['name', 'cpf', 'cnpj', 'email', 'phone', 'birthDate'],
    enhanced: ['name', 'cpf', 'cnpj', 'email', 'phone', 'birthDate', 'address'],
    full_anonymization: ['name', 'cpf', 'cnpj', 'email', 'phone', 'birthDate', 'address', 'id'],
  };

  const targetFields = fieldsToAnonymize[complianceLevel];

  Object.entries(data).forEach(([key, value]) => {
    if (targetFields.includes(key)) {
      switch (key) {
        case 'cpf':
          anonymizedData[key] = maskCPF(value as string);
          break;
        case 'cnpj':
          anonymizedData[key] = maskCNPJ(value as string);
          break;
        case 'email':
          anonymizedData[key] = maskEmail(value as string);
          break;
        case 'phone':
          anonymizedData[key] = maskPhone(value as string);
          break;
        case 'birthDate':
          const date = new Date(value as string);
          anonymizedData[key] = `**/**/${date.getFullYear()}`;
          break;
        default:
          anonymizedData[key] = '***ANONYMIZED***';
      }
      fieldsAnonymized.push(key);
    } else {
      anonymizedData[key] = value;
    }
  });

  const metadata: AnonymizationMetadata = {
    anonymizedAt: new Date().toISOString(),
    method: 'lgpd_compliant_masking',
    complianceLevel,
    fieldsAnonymized,
    version: ANONYMIZATION_VERSION,
  };

  return { anonymizedData, metadata };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if data has been anonymized
 */
export function isDataAnonymized(data: Record<string, unknown>): boolean {
  const commonAnonymizedPatterns = ['***', '***ANONYMIZED***', '**/**'];

  return Object.values(data).some(value =>
    typeof value === 'string'
    && commonAnonymizedPatterns.some(pattern => value.includes(pattern))
  );
}

/**
 * Generate privacy report for anonymized data
 */
export function generatePrivacyReport(metadata: AnonymizationMetadata): string {
  return `
Privacy Anonymization Report
============================
Anonymized At: ${metadata.anonymizedAt}
Method: ${metadata.method}
Compliance Level: ${metadata.complianceLevel}
Fields Anonymized: ${metadata.fieldsAnonymized.join(', ')}
Version: ${metadata.version}
============================
This data has been processed according to LGPD requirements.
  `.trim();
}
