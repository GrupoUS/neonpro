/**
 * @fileoverview LGPD Anonymization and Data Masking Utilities
 *
 * This module provides utilities for anonymizing and masking personal data
 * in compliance with LGPD (Lei Geral de Proteção de Dados) requirements.
 *
 * @example
 * ```typescript
 * import { maskPatientData, anonymizePersonalData } from '@neonpro/security/anonymization';
 *
 * const patient = {
 *   name: 'João Silva',
 *   cpf: '12345678901',
 *   email: 'joao@email.com',
 *   phone: '11987654321',
 *   birthDate: '1990-01-01'
 * };
 *
 * const masked = maskPatientData(patient);
 * // Result: { name: 'J*** S****', cpf: '***.***.***-**', ... }
 * ```
 */

// ============================================================================
// Types and Interfaces
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
// Core Masking Functions
// ============================================================================

/**
 * Mask a CPF according to LGPD guidelines
 *
 * @param cpf - CPF to mask
 * @param options - Masking options
 * @returns Masked CPF
 */
export function maskCPF(cpf: string, options: MaskingOptions = {}): string {
  if (!cpf) return '';

  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf; // Return original if invalid format

  const { preserveFormat = true, maskChar = '*' } = options;

  if (preserveFormat) {
    // Format: ***.***.***-**
    return `${maskChar.repeat(3)}.${maskChar.repeat(3)}.${maskChar.repeat(3)}-${
      maskChar.repeat(
        2,
      )
    }`;
  } else {
    // Format: ***********
    return maskChar.repeat(11);
  }
}

/**
 * Mask a CNPJ according to LGPD guidelines
 *
 * @param cnpj - CNPJ to mask
 * @param options - Masking options
 * @returns Masked CNPJ
 */
export function maskCNPJ(cnpj: string, options: MaskingOptions = {}): string {
  if (!cnpj) return '';

  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj; // Return original if invalid format

  const { preserveFormat = true, maskChar = '*' } = options;

  if (preserveFormat) {
    // Format: **.***.***/****-**
    return `${maskChar.repeat(2)}.${maskChar.repeat(3)}.${maskChar.repeat(3)}/${
      maskChar.repeat(
        4,
      )
    }-${maskChar.repeat(2)}`;
  } else {
    // Format: **************
    return maskChar.repeat(14);
  }
}

/**
 * Mask an email address
 *
 * @param email - Email to mask
 * @param options - Masking options
 * @returns Masked email
 */
export function maskEmail(email: string, options: MaskingOptions = {}): string {
  if (!email || !email.includes('@')) return email;

  const { visibleStart = 1, maskChar = '*' } = options;
  const [localPart, domain] = email.split('@');

  if (localPart.length <= visibleStart) {
    return `${maskChar.repeat(3)}@${domain}`;
  }

  const maskedLocal = localPart.substring(0, visibleStart)
    + maskChar.repeat(Math.max(3, localPart.length - visibleStart));

  return `${maskedLocal}@${domain}`;
}

/**
 * Mask a phone number
 *
 * @param phone - Phone number to mask
 * @param options - Masking options
 * @returns Masked phone number
 */
export function maskPhone(phone: string, options: MaskingOptions = {}): string {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');
  const { preserveFormat = true, maskChar = '*' } = options;

  if (cleaned.length === 11) {
    // Mobile: (11) 9****-****
    return preserveFormat
      ? `(${cleaned.substring(0, 2)}) ${cleaned.charAt(2)}${maskChar.repeat(4)}-${
        maskChar.repeat(
          4,
        )
      }`
      : `${cleaned.substring(0, 3)}${maskChar.repeat(8)}`;
  } else if (cleaned.length === 10) {
    // Landline: (11) ****-****
    return preserveFormat
      ? `(${cleaned.substring(0, 2)}) ${maskChar.repeat(4)}-${maskChar.repeat(4)}`
      : `${cleaned.substring(0, 2)}${maskChar.repeat(8)}`;
  }

  return phone;
}

/**
 * Mask a person's name
 *
 * @param name - Name to mask
 * @param options - Masking options
 * @returns Masked name
 */
export function maskName(name: string, options: MaskingOptions = {}): string {
  if (!name) return '';

  const { visibleStart = 1, maskChar = '*' } = options;
  const parts = name.trim().split(/\s+/);

  return parts
    .map(part => {
      if (part.length <= visibleStart) {
        return maskChar.repeat(Math.max(1, part.length));
      }
      return (
        part.substring(0, visibleStart)
        + maskChar.repeat(Math.max(3, part.length - visibleStart))
      );
    })
    .join(' ');
}

/**
 * Mask an address
 *
 * @param address - Address object to mask
 * @param options - Masking options
 * @returns Masked address
 */
export function maskAddress(
  address: PatientData['address'],
  options: MaskingOptions = {},
): PatientData['address'] {
  if (!address) return address;

  const { maskChar = '*' } = options;

  return {
    ...address,
    street: address.street ? `${maskChar.repeat(10)}` : address.street,
    number: address.number
      ? maskChar.repeat(Math.max(2, address.number.length))
      : address.number,
    complement: address.complement
      ? maskChar.repeat(Math.max(5, address.complement.length))
      : address.complement,
    neighborhood: address.neighborhood
      ? `${maskChar.repeat(8)}`
      : address.neighborhood,
    // Keep city and state for statistical purposes (allowed by LGPD)
    zipCode: address.zipCode
      ? `${address.zipCode.substring(0, 2)}${maskChar.repeat(6)}`
      : address.zipCode,
  };
}

// ============================================================================
// High-Level Anonymization Functions
// ============================================================================

/**
 * Mask patient data according to LGPD requirements
 *
 * @param patientData - Patient data to mask
 * @param complianceLevel - Level of anonymization to apply
 * @param options - Masking options
 * @returns Masked patient data with metadata
 */
export function maskPatientData(
  patientData: PatientData,
  complianceLevel: LGPDComplianceLevel = 'basic',
  options: MaskingOptions = {},
): { data: PatientData; metadata: AnonymizationMetadata } {
  const fieldsAnonymized: string[] = [];
  const result: PatientData = { ...patientData };

  // Always mask direct identifiers
  if (result.cpf) {
    result.cpf = maskCPF(result.cpf, options);
    fieldsAnonymized.push('cpf');
  }

  if (result.cnpj) {
    result.cnpj = maskCNPJ(result.cnpj, options);
    fieldsAnonymized.push('cnpj');
  }

  if (result.email) {
    result.email = maskEmail(result.email, options);
    fieldsAnonymized.push('email');
  }

  if (result.phone) {
    result.phone = maskPhone(result.phone, options);
    fieldsAnonymized.push('phone');
  }

  // Apply level-specific masking
  switch (complianceLevel) {
    case 'basic':
      // Keep name partially visible
      if (result.name) {
        result.name = maskName(result.name, { ...options, visibleStart: 1 });
        fieldsAnonymized.push('name');
      }
      break;

    case 'enhanced':
      // Mask name more aggressively
      if (result.name) {
        result.name = maskName(result.name, { ...options, visibleStart: 0 });
        fieldsAnonymized.push('name');
      }

      // Mask address
      if (result.address) {
        result.address = maskAddress(result.address, options);
        fieldsAnonymized.push('address');
      }

      // Mask birth date (keep year for statistical purposes)
      if (result.birthDate) {
        const date = new Date(result.birthDate);
        result.birthDate = `${date.getFullYear()}-**-**`;
        fieldsAnonymized.push('birthDate');
      }
      break;

    case 'full_anonymization_:
      // Remove all identifiable information
      if (result.name) {
        result.name = 'ANONIMIZADO';
        fieldsAnonymized.push('name');
      }

      if (result.address) {
        result.address = {
          city: result.address.city, // Keep for statistical purposes
          state: result.address.state, // Keep for statistical purposes
          street: 'ANONIMIZADO',
          number: '***',
          complement: 'ANONIMIZADO',
          neighborhood: 'ANONIMIZADO',
          zipCode: '***',
        };
        fieldsAnonymized.push('address');
      }

      if (result.birthDate) {
        const date = new Date(result.birthDate);
        const year = date.getFullYear();
        const ageGroup = year < 1970
          ? '1950-1970'
          : year < 1990
          ? '1970-1990'
          : year < 2010
          ? '1990-2010'
          : '2010+';
        result.birthDate = ageGroup;
        fieldsAnonymized.push('birthDate');
      }

      // Remove ID if present
      if (result.id) {
        delete result.id;
        fieldsAnonymized.push('id');
      }
      break;
  }

  const metadata: AnonymizationMetadata = {
    anonymizedAt: new Date().toISOString(),
    method: 'maskPatientData',
    complianceLevel,
    fieldsAnonymized,
    version: '1.0.0',
  };

  return { data: result, metadata };
}

/**
 * Anonymize personal data for analytics purposes
 *
 * @param data - Data to anonymize
 * @param fieldsToAnonymize - Specific fields to anonymize
 * @param options - Anonymization options
 * @returns Anonymized data
 */
export function anonymizePersonalData(
  data: Record<string, unknown>,
  fieldsToAnonymize: string[] = [],
  options: MaskingOptions = {},
): Record<string, unknown> {
  const result = { ...data };
  const { maskChar = '*' } = options;

  const defaultFieldsToAnonymize = [
    'name',
    'cpf',
    'cnpj',
    'email',
    'phone',
    'address',
    'birthDate',
  ];

  const fields = fieldsToAnonymize.length > 0 ? fieldsToAnonymize : defaultFieldsToAnonymize;

  for (const field of fields) {
    if (result[field] !== undefined) {
      if (typeof result[field] === 'string') {
        const value = result[field] as string;

        // Apply specific masking based on field type
        switch (field) {
          case 'cpf':
            result[field] = maskCPF(value, options);
            break;
          case 'cnpj':
            result[field] = maskCNPJ(value, options);
            break;
          case 'email':
            result[field] = maskEmail(value, options);
            break;
          case 'phone':
            result[field] = maskPhone(value, options);
            break;
          case 'name':
            result[field] = maskName(value, options);
            break;
          default:
            // Generic string masking
            result[field] = value.length > 3
              ? value.substring(0, 1)
                + maskChar.repeat(Math.max(3, value.length - 1))
              : maskChar.repeat(value.length);
        }
      } else if (typeof result[field] === 'object' && field === 'address') {
        result[field] = maskAddress(
          result[field] as PatientData['address'],
          options,
        );
      } else {
        // For other types, replace with placeholder
        result[field] = 'ANONIMIZADO';
      }
    }
  }

  return result;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if data is considered anonymized according to LGPD
 *
 * @param data - Data to check
 * @returns True if data appears to be anonymized
 */
export function isDataAnonymized(data: Record<string, unknown>): boolean {
  const identifiableFields = ['cpf', 'cnpj', 'email', 'name'];

  for (const field of identifiableFields) {
    const value = data[field];
    if (value && typeof value === 'string') {
      // Check if field contains masked characters or anonymization markers
      if (
        !value.includes('*')
        && !value.includes('ANONIMIZADO')
        && value.length > 3
      ) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Generate a privacy compliance report for anonymized data
 *
 * @param originalData - Original data before anonymization
 * @param anonymizedResult - Result from anonymization function
 * @returns Privacy compliance report
 */
export function generatePrivacyReport(
  originalData: Record<string, unknown>,
  anonymizedResult: {
    data: Record<string, unknown>;
    metadata: AnonymizationMetadata;
  },
): {
  complianceScore: number;
  risks: string[];
  recommendations: string[];
  lgpdCompliant: boolean;
} {
  const risks: string[] = [];
  const recommendations: string[] = [];
  let complianceScore = 100;

  // Check for potential data leaks
  const sensitiveFields = ['cpf', 'cnpj', 'email', 'phone', 'name'];

  for (const field of sensitiveFields) {
    const original = originalData[field];
    const anonymized = anonymizedResult.data[field];

    if (
      original
      && anonymized
      && typeof original === 'string'
      && typeof anonymized === 'string'
    ) {
      // Check if too much information is still visible
      if (
        anonymized.length > 10
        && !anonymized.includes('*')
        && !anonymized.includes('ANONIMIZADO')
      ) {
        risks.push(`Campo ${field} pode conter informações identificáveis`);
        complianceScore -= 15;
      }

      // Check for partial masking quality
      if (
        anonymized.includes('*')
        && anonymized.replace(/\*/g, '').length > 3
      ) {
        recommendations.push(
          `Considere aumentar o nível de mascaramento para o campo ${field}`,
        );
        complianceScore -= 5;
      }
    }
  }

  // Check anonymization level
  if (
    anonymizedResult.metadata.complianceLevel === 'basic'
    && risks.length > 0
  ) {
    recommendations.push(
      'Considere usar nível de conformidade "enhanced" ou "full_anonymization",
    );
  }

  const lgpdCompliant = complianceScore >= 85 && risks.length === 0;

  return {
    complianceScore: Math.max(0, complianceScore),
    risks,
    recommendations,
    lgpdCompliant,
  };
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default masking options for different compliance levels
 */
export const DEFAULT_MASKING_OPTIONS: Record<
  LGPDComplianceLevel,
  MaskingOptions
> = {
  basic: {
    maskChar: '*',
    visibleStart: 1,
    visibleEnd: 0,
    preserveFormat: true,
  },
  enhanced: {
    maskChar: '*',
    visibleStart: 0,
    visibleEnd: 0,
    preserveFormat: true,
  },
  full_anonymization: {
    maskChar: '*',
    visibleStart: 0,
    visibleEnd: 0,
    preserveFormat: false,
  },
};

/**
 * Version of the anonymization utilities
 */
