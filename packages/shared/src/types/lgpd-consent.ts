/**
 * LGPD Consent Model (T034)
 * Comprehensive LGPD compliance management for Brazilian healthcare
 *
 * Features:
 * - LGPD consent tracking and management
 * - Legal basis documentation
 * - Data retention and deletion policies
 * - Consent history and audit trail
 * - Data subject rights management
 * - Compliance validation and scoring
 */

// Legal basis enum according to LGPD
export enum LegalBasis {
  CONSENT = "consent",
  CONTRACT = "contract",
  LEGAL_OBLIGATION = "legal_obligation",
  VITAL_INTERESTS = "vital_interests",
  PUBLIC_TASK = "public_task",
  LEGITIMATE_INTERESTS = "legitimate_interests",
}

// Data categories according to LGPD
export enum DataCategory {
  PERSONAL_DATA = "personal_data",
  SENSITIVE_DATA = "sensitive_data",
  HEALTH_DATA = "health_data",
  BIOMETRIC_DATA = "biometric_data",
  GENETIC_DATA = "genetic_data",
  LOCATION_DATA = "location_data",
  FINANCIAL_DATA = "financial_data",
  BEHAVIORAL_DATA = "behavioral_data",
}

// Processing purposes
export enum ProcessingPurpose {
  HEALTHCARE_TREATMENT = "healthcare_treatment",
  APPOINTMENT_MANAGEMENT = "appointment_management",
  BILLING = "billing",
  INSURANCE = "insurance",
  MARKETING = "marketing",
  ANALYTICS = "analytics",
  RESEARCH = "research",
  LEGAL_COMPLIANCE = "legal_compliance",
  SECURITY = "security",
}

// Data subject rights according to LGPD
export enum DataSubjectRight {
  ACCESS = "access",
  RECTIFICATION = "rectification",
  ERASURE = "erasure",
  PORTABILITY = "portability",
  OBJECTION = "objection",
  RESTRICTION = "restriction",
  INFORMATION = "information",
}

// Data retention settings
export interface DataRetentionSettings {
  enabled: boolean;
  retentionPeriod: number;
  retentionUnit: "days" | "months" | "years";
  automaticDeletion: boolean;
  deletionDate?: Date;
  archivalRequired?: boolean;
  archivalPeriod?: number;
  archivalLocation?: string;
}

// Consent history entry
export interface ConsentHistory {
  id: string;
  consentId: string;
  action: "granted" | "withdrawn" | "modified" | "renewed" | "expired";
  timestamp: Date;
  version: string;
  changes?: string[];
  ipAddress?: string;
  userAgent?: string;
  _userId?: string;
}

// Data subject request
export interface DataSubjectRequest {
  id: string;
  patientId: string;
  requestType: DataSubjectRight | string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "rejected";
  requestDate: Date;
  responseDate?: Date;
  responseData?: any;
  rejectionReason?: string;
  createdBy?: string;
  processedBy?: string;
}

// Main LGPD consent interface
export interface LGPDConsent {
  id: string;
  patientId: string;

  // Consent metadata
  consentVersion: string;
  consentDate: Date;
  withdrawalDate?: Date;
  withdrawalReason?: string;

  // Technical metadata
  ipAddress: string;
  userAgent: string;
  sessionId?: string;

  // Legal basis and purposes
  legalBasis: LegalBasis | string;
  processingPurposes: (ProcessingPurpose | string)[];
  dataCategories: (DataCategory | string)[];

  // Consent granularity
  dataProcessing: boolean;
  marketing: boolean;
  analytics: boolean;
  thirdPartySharing: boolean;
  profiling?: boolean;
  automatedDecisionMaking?: boolean;

  // Data retention
  dataRetention?: DataRetentionSettings;

  // Consent chain (for renewals)
  previousConsentId?: string;
  nextConsentId?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;

  // History and audit
  history?: ConsentHistory[];
  accessLog?: Array<{
    _userId: string;
    action: string;
    timestamp: Date;
    ipAddress?: string;
  }>;
}

// Withdraw consent
export function withdrawConsent(
  consent: Partial<LGPDConsent>,
  reason: string,
): Partial<LGPDConsent> {
  return {
    ...consent,
    dataProcessing: false,
    marketing: false,
    analytics: false,
    thirdPartySharing: false,
    profiling: false,
    automatedDecisionMaking: false,
    withdrawalDate: new Date(),
    withdrawalReason: reason,
    updatedAt: new Date(),
  };
}

// Validate consent completeness
export function validateConsentCompleteness(
  consent: Partial<LGPDConsent>,
): boolean {
  if (!consent.patientId) return false;
  if (!consent.consentVersion) return false;
  if (!consent.consentDate) return false;
  if (!consent.ipAddress) return false;
  if (!consent.userAgent) return false;
  if (!consent.legalBasis) return false;
  if (!consent.processingPurposes || consent.processingPurposes.length === 0)
    return false;
  if (!consent.dataCategories || consent.dataCategories.length === 0)
    return false;

  return true;
}

// Generate consent summary in Portuguese
export function generateConsentSummary(consent: Partial<LGPDConsent>): string {
  const parts: string[] = [];

  parts.push(`Tratamento médico: ${consent.dataProcessing ? "Sim" : "Não"}`);
  parts.push(`Marketing: ${consent.marketing ? "Sim" : "Não"}`);
  parts.push(`Análises: ${consent.analytics ? "Sim" : "Não"}`);
  parts.push(`Compartilhamento: ${consent.thirdPartySharing ? "Sim" : "Não"}`);

  if (consent.processingPurposes && consent.processingPurposes.length > 0) {
    parts.push(`Finalidades: ${consent.processingPurposes.join(", ")}`);
  }

  if (consent.dataCategories && consent.dataCategories.length > 0) {
    parts.push(`Categorias de dados: ${consent.dataCategories.join(", ")}`);
  }

  return parts.join(" | ");
}

// Check if consent is expired
export function isConsentExpired(consent: Partial<LGPDConsent>): boolean {
  if (consent.expiresAt && consent.expiresAt < new Date()) {
    return true;
  }

  if (consent.withdrawalDate) {
    return true;
  }

  if (consent.dataRetention && consent.consentDate) {
    const retentionMs = getRetentionPeriodMs(
      consent.dataRetention.retentionPeriod,
      consent.dataRetention.retentionUnit || "years",
    );

    const expirationDate = new Date(
      consent.consentDate.getTime() + retentionMs,
    );
    return expirationDate < new Date();
  }

  return false;
}

// Helper function to convert retention period to milliseconds
function getRetentionPeriodMs(period: number, unit: string): number {
  const msPerUnit = {
    days: 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000,
    years: 365 * 24 * 60 * 60 * 1000,
  };

  return (
    period * (msPerUnit[unit as keyof typeof msPerUnit] || msPerUnit.years)
  );
}

// Renew consent
export function renewConsent(
  oldConsent: Partial<LGPDConsent>,
  newVersion: string,
): Partial<LGPDConsent> {
  const now = new Date();

  return {
    ...oldConsent,
    id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    consentVersion: newVersion,
    consentDate: now,
    withdrawalDate: undefined,
    withdrawalReason: undefined,
    previousConsentId: oldConsent.id,
    createdAt: now,
    updatedAt: now,
  };
}

// Create data subject request
export function createDataSubjectRequest(
  data: Omit<DataSubjectRequest, "id" | "status" | "requestDate">,
): DataSubjectRequest {
  const now = new Date();

  return {
    ...data,
    id: `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: "pending",
    requestDate: now,
  };
}

// Audit LGPD compliance
export function auditLGPDCompliance(consent: Partial<LGPDConsent>): {
  compliant: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;

  // Check required fields
  if (validateConsentCompleteness(consent)) {
    score += 30;
  } else {
    issues.push("Consentimento incompleto - campos obrigatórios ausentes");
  }

  // Check legal basis
  if (
    consent.legalBasis &&
    Object.values(LegalBasis).includes(consent.legalBasis as LegalBasis)
  ) {
    score += 20;
  } else {
    issues.push("Base legal inválida ou ausente");
  }

  // Check data retention
  if (consent.dataRetention?.enabled) {
    score += 20;
  } else {
    recommendations.push("Configurar política de retenção de dados");
  }

  // Check consent expiration
  if (!isConsentExpired(consent)) {
    score += 15;
  } else {
    issues.push("Consentimento expirado");
  }

  // Check granular consent
  if (
    typeof consent.dataProcessing === "boolean" &&
    typeof consent.marketing === "boolean" &&
    typeof consent.analytics === "boolean"
  ) {
    score += 15;
  } else {
    recommendations.push("Implementar consentimento granular");
  }

  return {
    compliant: issues.length === 0 && score >= 80,
    score,
    issues,
    recommendations,
  };
}

// Create LGPD consent with defaults
export function createLGPDConsent(
  data: Omit<LGPDConsent, "id" | "createdAt" | "updatedAt">,
): LGPDConsent {
  const now = new Date();

  return {
    ...data,
    id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
}

// Get consent by patient ID
export function getConsentByPatientId(
  consents: LGPDConsent[],
  patientId: string,
): LGPDConsent | undefined {
  return consents
    .filter(
      (consent) => consent.patientId === patientId && !consent.withdrawalDate,
    )
    .sort((a, b) => b.consentDate.getTime() - a.consentDate.getTime())[0];
}

// Get expired consents
export function getExpiredConsents(consents: LGPDConsent[]): LGPDConsent[] {
  return consents.filter((consent) => isConsentExpired(consent));
}

// Get consents requiring renewal
export function getConsentsRequiringRenewal(
  consents: LGPDConsent[],
  daysBeforeExpiration: number = 30,
): LGPDConsent[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysBeforeExpiration);

  return consents.filter((consent) => {
    if (consent.expiresAt && consent.expiresAt <= cutoffDate) {
      return true;
    }

    if (consent.dataRetention && consent.consentDate) {
      const retentionMs = getRetentionPeriodMs(
        consent.dataRetention.retentionPeriod,
        consent.dataRetention.retentionUnit || "years",
      );

      const expirationDate = new Date(
        consent.consentDate.getTime() + retentionMs,
      );
      return expirationDate <= cutoffDate;
    }

    return false;
  });
}

// Generate LGPD compliance report
export function generateComplianceReport(consents: LGPDConsent[]): {
  totalConsents: number;
  activeConsents: number;
  expiredConsents: number;
  withdrawnConsents: number;
  complianceScore: number;
  issues: string[];
} {
  const total = consents.length;
  const expired = getExpiredConsents(consents).length;
  const withdrawn = consents.filter((c) => c.withdrawalDate).length;
  const active = total - expired - withdrawn;

  let totalScore = 0;
  const allIssues: string[] = [];

  consents.forEach((consent) => {
    const audit = auditLGPDCompliance(consent);
    totalScore += audit.score;
    allIssues.push(...audit.issues);
  });

  const averageScore = total > 0 ? totalScore / total : 0;

  return {
    totalConsents: total,
    activeConsents: active,
    expiredConsents: expired,
    withdrawnConsents: withdrawn,
    complianceScore: averageScore,
    issues: [...new Set(allIssues)], // Remove duplicates
  };
}
