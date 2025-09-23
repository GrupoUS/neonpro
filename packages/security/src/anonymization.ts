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
  
  if (cleaned.length !== 11) {
    return cpf; // Return original if invalid CPF
  }

  const { maskChar = '*', visibleStart = 0, visibleEnd = 0, preserveFormat = true } = options;

  if (preserveFormat) {
    // Preserve CPF format: XXX.XXX.XXX-XX
    const firstPart = cleaned.slice(0, 3).padStart(3, maskChar);
    const secondPart = cleaned.slice(3, 6).padStart(3, maskChar);
    const thirdPart = cleaned.slice(6, 9).padStart(3, maskChar);
    const fourthPart = cleaned.slice(9, 11).padStart(2, maskChar);
    
    return `${firstPart.slice(0, visibleStart)}${maskChar.repeat(3 - visibleStart)}.${secondPart.slice(0, visibleStart)}${maskChar.repeat(3 - visibleStart)}.${thirdPart.slice(0, visibleStart)}${maskChar.repeat(3 - visibleStart)}-${fourthPart.slice(0, visibleEnd)}${maskChar.repeat(2 - visibleEnd)}`;
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
 *
 * @param cnpj - CNPJ to mask
 * @param options - Masking options
 * @returns Masked CNPJ
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
    const firstPart = cleaned.slice(0, 2).padStart(2, maskChar);
    const secondPart = cleaned.slice(2, 5).padStart(3, maskChar);
    const thirdPart = cleaned.slice(5, 8).padStart(3, maskChar);
    const fourthPart = cleaned.slice(8, 12).padStart(4, maskChar);
    const fifthPart = cleaned.slice(12, 14).padStart(2, maskChar);
    
    return `${firstPart.slice(0, visibleStart)}${maskChar.repeat(2 - visibleStart)}.${secondPart.slice(0, visibleStart)}${maskChar.repeat(3 - visibleStart)}.${thirdPart.slice(0, visibleStart)}${maskChar.repeat(3 - visibleStart)}/${fourthPart.slice(0, visibleStart)}${maskChar.repeat(4 - visibleStart)}-${fifthPart.slice(0, visibleEnd)}${maskChar.repeat(2 - visibleEnd)}`;
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
 *
 * @param email - Email to mask
 * @param options - Masking options
 * @returns Masked email
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
  const maskedLocal = localPart.slice(0, visibleLocalChars) + 
                     maskChar.repeat(Math.max(0, localPart.length - visibleLocalChars - visibleEnd)) +
                     localPart.slice(-visibleEnd);

  // Mask domain name (keep TLD visible)
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  const maskedDomainParts = domainParts.slice(0, -1).map(part => 
    maskChar.repeat(Math.max(1, part.length - 1)) + part.slice(-1)
  );

  return `${maskedLocal}@${maskedDomainParts.join('.')}.${tld}`;
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
  const maskedNumber = number.slice(0, visibleStart) + 
                      maskChar.repeat(Math.max(0, number.length - visibleNumberChars)) +
                      number.slice(-visibleEnd);

  return `+${countryCode} (${areaCode}) ${maskedNumber}`;
}

/**
 * Mask patient data according to LGPD guidelines
 *
 * @param patient - Patient data to mask
 * @param options - Masking options
 * @returns Masked patient data
 */
export function maskPatientData(patient: PatientData, options: MaskingOptions = {}): PatientData {
  const masked: PatientData = { ...patient };

  if (masked.name) {
    const names = masked.name.split(' ');
    masked.name = names.map((name, index) => {
      if (index === 0 || index === names.length - 1) {
        return name.slice(0, 2) + '*'.repeat(Math.max(0, name.length - 2));
      }
      return '*'.repeat(name.length);
    }).join(' ');
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
      street: masked.address.street ? masked.address.street.replace(/./g, '*') : undefined,
      number: masked.address.number ? '***' : undefined,
      complement: masked.address.complement ? '***' : undefined,
      neighborhood: masked.address.neighborhood ? '***' : undefined,
    };
  }

  return masked;
}

/**
 * Complete anonymization of personal data
 *
 * @param data - Data to anonymize
 * @param complianceLevel - Level of anonymization to apply
 * @returns Anonymized data with metadata
 */
export function anonymizePersonalData(
  data: Record<string, unknown>,
  complianceLevel: LGPDComplianceLevel = 'basic'
): { anonymizedData: Record<string, unknown>; metadata: AnonymizationMetadata } {
  const anonymizedData: Record<string, unknown> = {};
  const fieldsAnonymized: string[] = [];

  const fieldsToAnonymize = {
    basic: ['name', 'cpf', 'cnpj', 'email', 'phone', 'birthDate'],
    enhanced: ['name', 'cpf', 'cnpj', 'email', 'phone', 'birthDate', 'address'],
    full_anonymization: ['name', 'cpf', 'cnpj', 'email', 'phone', 'birthDate', 'address', 'id']
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
          anonymizedData[key] = typeof value === 'string' ? value.replace(/./g, '*') : '***';
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
    version: '1.0.0'
  };

  return { anonymizedData, metadata };
}