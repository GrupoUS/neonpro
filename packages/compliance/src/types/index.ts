/**
 * @fileoverview Core Types for NeonPro Healthcare Compliance
 * Constitutional Brazilian Healthcare Compliance Types (LGPD + ANVISA + CFM)
 *
 * Quality Standard: ≥9.9/10
 */

import { z } from 'zod';
import type { AuditEvent } from '../audit/types';

// =============================================================================
// CONSTITUTIONAL HEALTHCARE BASE TYPES
// =============================================================================

/**
 * Constitutional Compliance Score
 * Represents compliance level with Brazilian healthcare regulations
 */
export const ComplianceScoreSchema = z
  .number()
  .min(0)
  .max(10)
  .refine((score) => score >= 9.9, {
    message: 'Healthcare compliance must meet ≥9.9/10 constitutional standard',
  });

export type ComplianceScore = z.infer<typeof ComplianceScoreSchema>;

/**
 * Brazilian Healthcare Regulatory Framework
 */
export enum HealthcareRegulation {
  LGPD = 'LGPD', // Lei Geral de Proteção de Dados
  ANVISA = 'ANVISA', // Agência Nacional de Vigilância Sanitária
  CFM = 'CFM', // Conselho Federal de Medicina
  CONSTITUTIONAL = 'CONSTITUTIONAL', // Constitutional Healthcare Principles
}

/**
 * Compliance Status with Constitutional Validation
 */
export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  CONSTITUTIONAL_VIOLATION = 'CONSTITUTIONAL_VIOLATION',
}

/**
 * Patient Data Classification for LGPD Compliance
 */
export enum PatientDataClassification {
  PERSONAL = 'PERSONAL', // Dados pessoais (Art. 5º, I LGPD)
  SENSITIVE = 'SENSITIVE', // Dados pessoais sensíveis (Art. 5º, II LGPD)
  HEALTH = 'HEALTH', // Dados de saúde (constitutional protection)
  GENETIC = 'GENETIC', // Dados genéticos (extra protection)
  BIOMETRIC = 'BIOMETRIC', // Dados biométricos (identification)
  CHILD = 'CHILD', // Dados de criança/adolescente (Art. 14 LGPD)
}

// =============================================================================
// LGPD COMPLIANCE TYPES
// =============================================================================

/**
 * LGPD Legal Basis (Base Legal) - Art. 7º and 11º LGPD
 */
export enum LGPDLegalBasis {
  CONSENT = 'CONSENT', // Consentimento (Art. 7º, I)
  LEGAL_OBLIGATION = 'LEGAL_OBLIGATION', // Cumprimento de obrigação legal (Art. 7º, II)
  PUBLIC_ADMINISTRATION = 'PUBLIC_ADMINISTRATION', // Execução de políticas públicas (Art. 7º, III)
  RESEARCH = 'RESEARCH', // Realização de estudos (Art. 7º, IV)
  CONTRACT_EXECUTION = 'CONTRACT_EXECUTION', // Execução de contrato (Art. 7º, V)
  JUDICIAL_PROCESS = 'JUDICIAL_PROCESS', // Processo judicial (Art. 7º, VI)
  LEGITIMATE_INTEREST = 'LEGITIMATE_INTEREST', // Interesse legítimo (Art. 7º, IX)
  VITAL_INTEREST = 'VITAL_INTEREST', // Proteção da vida (Art. 7º, VII)
  HEALTH_PROTECTION = 'HEALTH_PROTECTION', // Tutela da saúde (Art. 11º, II)
  HEALTH_PROCEDURES = 'HEALTH_PROCEDURES', // Procedimentos de saúde (Art. 11º, I)
}

/**
 * LGPD Consent Management Schema
 */
export const ConsentSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  tenantId: z.string().uuid(),
  consentType: z.nativeEnum(PatientDataClassification),
  legalBasis: z.nativeEnum(LGPDLegalBasis),
  purpose: z.string().min(10).max(500),
  granular: z.boolean().default(true),
  explicit: z.boolean().default(true),
  informed: z.boolean().default(true),
  freely_given: z.boolean().default(true),
  withdrawable: z.boolean().default(true),
  grantedAt: z.date(),
  withdrawnAt: z.date().nullable().default(null),
  expiresAt: z.date().nullable().default(null),
  isActive: z.boolean().default(true),
  auditTrail: z.array(
    z.object({
      action: z.string(),
      timestamp: z.date(),
      userId: z.string().uuid(),
      ipAddress: z.string().ip().optional(),
      userAgent: z.string().optional(),
    })
  ),
  constitutionalValidation: z.object({
    validated: z.boolean(),
    validatedAt: z.date(),
    validatedBy: z.string().uuid(),
    complianceScore: ComplianceScoreSchema,
  }),
});

export type Consent = z.infer<typeof ConsentSchema>; // =============================================================================
// ANVISA COMPLIANCE TYPES
// =============================================================================

/**
 * ANVISA Medical Device Categories
 */
export enum ANVISADeviceCategory {
  CLASS_I = 'CLASS_I', // Classe I - Baixo risco
  CLASS_II = 'CLASS_II', // Classe II - Médio risco
  CLASS_III = 'CLASS_III', // Classe III - Alto risco
  CLASS_IV = 'CLASS_IV', // Classe IV - Máximo risco
}

/**
 * ANVISA Adverse Event Types
 */
export enum AdverseEventType {
  MILD = 'MILD', // Evento adverso leve
  MODERATE = 'MODERATE', // Evento adverso moderado
  SEVERE = 'SEVERE', // Evento adverso grave
  LIFE_THREATENING = 'LIFE_THREATENING', // Ameaça à vida
  DEATH = 'DEATH', // Óbito
  HOSPITALIZATION = 'HOSPITALIZATION', // Hospitalização
}

/**
 * ANVISA Regulatory Event Schema
 */
export const RegulatoryEventSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  deviceId: z.string().uuid().optional(),
  procedureId: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  eventType: z.nativeEnum(AdverseEventType),
  deviceCategory: z.nativeEnum(ANVISADeviceCategory).optional(),
  description: z.string().min(50).max(2000),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  reportedAt: z.date(),
  reportedBy: z.string().uuid(),
  anvisaNotified: z.boolean().default(false),
  anvisaNotificationDate: z.date().nullable().default(null),
  anvisaProtocol: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  constitutionalValidation: z.object({
    medicalAccuracy: ComplianceScoreSchema,
    regulatoryCompliance: ComplianceScoreSchema,
    patientSafety: ComplianceScoreSchema,
  }),
});

export type RegulatoryEvent = z.infer<typeof RegulatoryEventSchema>;

// =============================================================================
// CFM COMPLIANCE TYPES
// =============================================================================

/**
 * CFM Professional Categories
 */
export enum CFMProfessionalCategory {
  PHYSICIAN = 'PHYSICIAN', // Médico
  SPECIALIST = 'SPECIALIST', // Especialista
  RESIDENT = 'RESIDENT', // Residente
  MEDICAL_STUDENT = 'MEDICAL_STUDENT', // Estudante de medicina
  FOREIGN_PHYSICIAN = 'FOREIGN_PHYSICIAN', // Médico estrangeiro
}

/**
 * CFM License Status
 */
export enum CFMLicenseStatus {
  ACTIVE = 'ACTIVE', // Ativo
  SUSPENDED = 'SUSPENDED', // Suspenso
  REVOKED = 'REVOKED', // Cassado
  EXPIRED = 'EXPIRED', // Expirado
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION', // Em investigação
}

/**
 * CFM Professional Validation Schema
 */
export const ProfessionalValidationSchema = z.object({
  id: z.string().uuid(),
  professionalId: z.string().uuid(),
  tenantId: z.string().uuid(),
  crmNumber: z.string().regex(/^\d{4,6}$/, 'CRM must be 4-6 digits'),
  crmState: z.string().length(2, 'State code must be 2 characters'),
  category: z.nativeEnum(CFMProfessionalCategory),
  licenseStatus: z.nativeEnum(CFMLicenseStatus),
  validatedAt: z.date(),
  expiresAt: z.date(),
  digitalSignatureValid: z.boolean(),
  telemedicineAuthorized: z.boolean(),
  ethicsCompliant: z.boolean(),
  constitutionalValidation: z.object({
    professionalEthics: ComplianceScoreSchema,
    medicalCompetence: ComplianceScoreSchema,
    regulatoryCompliance: ComplianceScoreSchema,
  }),
});

export type ProfessionalValidation = z.infer<
  typeof ProfessionalValidationSchema
>; // =============================================================================
// AUDIT SYSTEM TYPES (Re-exported from ./audit)
// =============================================================================

// Note: AuditEventType, AuditEventSchema, and AuditEvent are exported from ./audit module

// =============================================================================
// ANALYTICS TYPES (PRIVACY-PRESERVING)
// =============================================================================

/**
 * Healthcare Analytics Metric Types
 */
export enum HealthcareAnalyticsMetric {
  COMPLIANCE_SCORE = 'COMPLIANCE_SCORE',
  PATIENT_SATISFACTION = 'PATIENT_SATISFACTION',
  TREATMENT_EFFICACY = 'TREATMENT_EFFICACY',
  REGULATORY_ADHERENCE = 'REGULATORY_ADHERENCE',
  PROFESSIONAL_PERFORMANCE = 'PROFESSIONAL_PERFORMANCE',
  SYSTEM_USAGE = 'SYSTEM_USAGE',
  SECURITY_INCIDENTS = 'SECURITY_INCIDENTS',
  CONSENT_MANAGEMENT = 'CONSENT_MANAGEMENT',
}

/**
 * Privacy-Preserving Analytics Schema
 */
export const HealthcareAnalyticsSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  metricType: z.nativeEnum(HealthcareAnalyticsMetric),
  value: z.number(),
  unit: z.string(),
  period: z.object({
    start: z.date(),
    end: z.date(),
  }),
  anonymized: z.boolean().default(true),
  aggregationLevel: z.enum(['INDIVIDUAL', 'GROUP', 'CLINIC', 'TENANT']),
  privacyScore: ComplianceScoreSchema,
  constitutionalCompliance: z.object({
    dataMinimization: z.boolean(),
    purposeLimitation: z.boolean(),
    consentBased: z.boolean(),
    transparencyProvided: z.boolean(),
  }),
  createdAt: z.date(),
  validUntil: z.date(),
});

export type HealthcareAnalytics = z.infer<typeof HealthcareAnalyticsSchema>;

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Constitutional Healthcare Response
 */
export type ConstitutionalResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  complianceScore: ComplianceScore;
  regulatoryValidation: {
    lgpd: boolean;
    anvisa: boolean;
    cfm: boolean;
  };
  auditTrail: AuditEvent;
  timestamp: Date;
};

/**
 * DPIA (Data Protection Impact Assessment) Types
 */
export const DPIAAssessmentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  processName: z.string().min(5).max(100),
  description: z.string().min(50).max(2000),
  dataTypes: z.array(z.nativeEnum(PatientDataClassification)),
  legalBasis: z.array(z.nativeEnum(LGPDLegalBasis)),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  mitigationMeasures: z.array(z.string()),
  assessedBy: z.string().uuid(),
  assessedAt: z.date(),
  reviewDate: z.date(),
  approved: z.boolean(),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.date().optional(),
  constitutionalScore: ComplianceScoreSchema,
});

export type DPIAAssessment = z.infer<typeof DPIAAssessmentSchema>;
