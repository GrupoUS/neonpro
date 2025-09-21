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
  legalBasis: import('./gender.js').LegalBasis | string;
  consentVersion?: string;
  processingPurposes: string[];
}

/**
 * Audit log entry for LGPD compliance
 */
export interface AuditLogEntry {
  _userId: string;
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
  patient: Partial<import('../entities/patient.js').Patient>,
): Partial<import('../entities/patient.js').Patient> {
  const anonymized = { ...patient };

  if (anonymized.fullName) {
    anonymized.fullName = `ANON_${Date.now()}`;
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
    anonymized.addressLine2 = undefined as unknown as string;
  }

  return anonymized;
}