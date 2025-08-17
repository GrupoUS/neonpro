/**
 * @fileoverview Core Types for NeonPro Healthcare Compliance
 * Constitutional Brazilian Healthcare Compliance Types (LGPD + ANVISA + CFM)
 *
 * Quality Standard: ≥9.9/10
 */

import { z } from 'zod';

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
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED',
  SENSITIVE_PERSONAL = 'SENSITIVE_PERSONAL',
  HEALTH_DATA = 'HEALTH_DATA',
}

/**
 * Base Entity with Compliance Metadata
 */
export interface BaseComplianceEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  complianceScore: ComplianceScore;
  regulation: HealthcareRegulation;
  status: ComplianceStatus;
  auditTrail: AuditTrailEntry[];
}

/**
 * Audit Trail Entry
 */
export interface AuditTrailEntry {
  id: string;
  timestamp: Date;
  action: string;
  userId: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
  changes: Record<string, any>;
  complianceImpact: ComplianceScore;
}

/**
 * LGPD Data Subject Rights
 */
export enum LGPDDataSubjectRights {
  ACCESS = 'ACCESS', // Direito de acesso
  RECTIFICATION = 'RECTIFICATION', // Direito de retificação
  ERASURE = 'ERASURE', // Direito ao esquecimento
  PORTABILITY = 'PORTABILITY', // Direito à portabilidade
  OBJECTION = 'OBJECTION', // Direito de oposição
  RESTRICTION = 'RESTRICTION', // Direito à limitação
}

/**
 * ANVISA Compliance Categories
 */
export enum ANVISAComplianceCategory {
  MEDICAL_DEVICES = 'MEDICAL_DEVICES',
  PHARMACEUTICALS = 'PHARMACEUTICALS',
  COSMETICS = 'COSMETICS',
  HEALTH_SERVICES = 'HEALTH_SERVICES',
  ADVERSE_EVENTS = 'ADVERSE_EVENTS',
}

/**
 * CFM Professional Categories
 */
export enum CFMProfessionalCategory {
  PHYSICIAN = 'PHYSICIAN',
  SPECIALIST = 'SPECIALIST',
  RESIDENT = 'RESIDENT',
  MEDICAL_STUDENT = 'MEDICAL_STUDENT',
  FOREIGN_PHYSICIAN = 'FOREIGN_PHYSICIAN',
}

/**
 * Compliance Validation Result
 */
export interface ComplianceValidationResult {
  isCompliant: boolean;
  score: ComplianceScore;
  violations: ComplianceViolation[];
  recommendations: string[];
  validatedAt: Date;
  validatedBy: string;
}

/**
 * Compliance Violation
 */
export interface ComplianceViolation {
  id: string;
  regulation: HealthcareRegulation;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  article: string;
  remediation: string;
  deadline: Date;
}

/**
 * Healthcare Consent Types
 */
export enum HealthcareConsentType {
  TREATMENT = 'TREATMENT',
  DATA_PROCESSING = 'DATA_PROCESSING',
  MARKETING = 'MARKETING',
  RESEARCH = 'RESEARCH',
  TELEMEDICINE = 'TELEMEDICINE',
  IMAGE_USAGE = 'IMAGE_USAGE',
}

/**
 * Consent Record
 */
export interface ConsentRecord {
  id: string;
  patientId: string;
  consentType: HealthcareConsentType;
  granted: boolean;
  grantedAt: Date;
  revokedAt?: Date;
  purpose: string;
  legalBasis: string;
  expiresAt?: Date;
  digitalSignature: string;
  ipAddress: string;
  userAgent: string;
}

// Zod Schemas for Runtime Validation
export const AuditTrailEntrySchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date(),
  action: z.string().min(1),
  userId: z.string().uuid(),
  userRole: z.string().min(1),
  ipAddress: z.string().ip(),
  userAgent: z.string().min(1),
  changes: z.record(z.any()),
  complianceImpact: ComplianceScoreSchema,
});

export const ComplianceViolationSchema = z.object({
  id: z.string().uuid(),
  regulation: z.nativeEnum(HealthcareRegulation),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().min(1),
  article: z.string().min(1),
  remediation: z.string().min(1),
  deadline: z.date(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  consentType: z.nativeEnum(HealthcareConsentType),
  granted: z.boolean(),
  grantedAt: z.date(),
  revokedAt: z.date().optional(),
  purpose: z.string().min(1),
  legalBasis: z.string().min(1),
  expiresAt: z.date().optional(),
  digitalSignature: z.string().min(1),
  ipAddress: z.string().ip(),
  userAgent: z.string().min(1),
});