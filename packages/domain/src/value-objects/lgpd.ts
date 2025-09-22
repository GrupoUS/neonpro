import { LegalBasis } from './gender.js';
import type { Patient } from '../entities/patient.js';

/**
 * LGPD consent tracking
 */
export interface LGPDConsent {
  dataProcessing: boolean;
  marketing: boolean;
  analytics: boolean;
  consentDate: Date;
  withdrawalDate?: Date;
  ipAddress: string;
  userAgent: string;
  legalBasis: LegalBasis | string;
  consentVersion?: string;
  processingPurposes: string[];
}

/**
 * Audit log entry for LGPD compliance
 */
export interface AuditLogEntry {
  userId: string;
  action: "create" | "read" | "update" | "delete" | "export" | "anonymize";
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
}

/**
 * Audit trail for LGPD compliance
 */
export interface AuditTrail {
  createdBy: string;
  updatedBy: string;
  accessLog: AuditLogEntry[];
  dataRetentionDate?: Date;
  anonymizationDate?: Date;
}

/**
 * Data anonymization for LGPD compliance
 */
export function anonymizePatientData(
  patient: Partial<Patient>,
): Partial<Patient> {
  const anonymized = { ...patient };

  if (anonymized.name) {
    anonymized.name = `ANON_${Date.now()}`;
  }

  if (anonymized.cpf) {
    anonymized.cpf = "***.***.***-**";
  }

  if (anonymized.email) {
    anonymized.email = `anon_${Date.now()}@anonymized.com`;
  }

  if (anonymized.phonePrimary) {
    anonymized.phonePrimary = "(**) *****-****";
  }

  if (anonymized.addressLine1) {
    anonymized.addressLine1 = "ENDEREÇO ANONIMIZADO";
    anonymized.addressLine2 = undefined;
  }

  return anonymized;
}