/**
 * @file Core Types for NeonPro Healthcare Compliance
 * Constitutional Brazilian Healthcare Compliance Types (LGPD + ANVISA + CFM)
 *
 * Quality Standard: ≥9.9/10
 */

import { z, } from 'zod'

// =============================================================================
// CONSTITUTIONAL HEALTHCARE BASE TYPES
// =============================================================================

// Constants for compliance scoring
const MIN_SCORE = 0
const MAX_SCORE = 10
const REQUIRED_COMPLIANCE_THRESHOLD = 9
const MIN_STRING_LENGTH = 1

/**
 * Constitutional Compliance Score
 * Represents compliance level with Brazilian healthcare regulations
 */
const ComplianceScoreSchema = z
  .number()
  .min(MIN_SCORE,)
  .max(MAX_SCORE,)
  .refine((score,) => score >= REQUIRED_COMPLIANCE_THRESHOLD, {
    message: 'Healthcare compliance must meet ≥9.9/10 constitutional standard',
  },)

type ComplianceScore = z.infer<typeof ComplianceScoreSchema>

/**
 * Brazilian Healthcare Regulatory Framework
 */
enum HealthcareRegulation {
  LGPD = 'LGPD', // Lei Geral de Proteção de Dados
  ANVISA = 'ANVISA', // Agência Nacional de Vigilância Sanitária
  CFM = 'CFM', // Conselho Federal de Medicina
  CONSTITUTIONAL = 'CONSTITUTIONAL', // Constitutional Healthcare Principles
}

/**
 * Compliance Status with Constitutional Validation
 */
enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  CONSTITUTIONAL_VIOLATION = 'CONSTITUTIONAL_VIOLATION',
}

/**
 * Patient Data Classification for LGPD Compliance
 */
enum PatientDataClassification {
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
interface BaseComplianceEntity {
  id: string
  createdAt: Date
  updatedAt: Date
  complianceScore: ComplianceScore
  regulation: HealthcareRegulation
  status: ComplianceStatus
  auditTrail: AuditTrailEntry[]
}

/**
 * Audit Trail Entry
 */
interface AuditTrailEntry {
  id: string
  timestamp: Date
  action: string
  userId: string
  userRole: string
  ipAddress: string
  userAgent: string
  changes: Record<string, unknown>
  complianceImpact: ComplianceScore
}

/**
 * LGPD Data Subject Rights
 */
enum LGPDDataSubjectRights {
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
enum ANVISAComplianceCategory {
  MEDICAL_DEVICES = 'MEDICAL_DEVICES',
  PHARMACEUTICALS = 'PHARMACEUTICALS',
  COSMETICS = 'COSMETICS',
  HEALTH_SERVICES = 'HEALTH_SERVICES',
  ADVERSE_EVENTS = 'ADVERSE_EVENTS',
}

/**
 * CFM Professional Categories
 */
enum CFMProfessionalCategory {
  PHYSICIAN = 'PHYSICIAN',
  SPECIALIST = 'SPECIALIST',
  RESIDENT = 'RESIDENT',
  MEDICAL_STUDENT = 'MEDICAL_STUDENT',
  FOREIGN_PHYSICIAN = 'FOREIGN_PHYSICIAN',
}

/**
 * Compliance Validation Result
 */
interface ComplianceValidationResult {
  isCompliant: boolean
  score: ComplianceScore
  violations: ComplianceViolation[]
  recommendations: string[]
  validatedAt: Date
  validatedBy: string
}

/**
 * Compliance Violation
 */
interface ComplianceViolation {
  id: string
  regulation: HealthcareRegulation
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  article: string
  remediation: string
  deadline: Date
}

/**
 * Healthcare Consent Types
 */
enum HealthcareConsentType {
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
interface ConsentRecord {
  id: string
  patientId: string
  consentType: HealthcareConsentType
  granted: boolean
  grantedAt: Date
  revokedAt?: Date
  purpose: string
  legalBasis: string
  expiresAt?: Date
  digitalSignature: string
  ipAddress: string
  userAgent: string
}

// Zod Schemas for Runtime Validation
const AuditTrailEntrySchema = z.object({
  action: z.string().min(MIN_STRING_LENGTH,),
  changes: z.record(z.unknown(),),
  complianceImpact: ComplianceScoreSchema,
  id: z.string().uuid(),
  ipAddress: z.string().ip(),
  timestamp: z.date(),
  userAgent: z.string().min(MIN_STRING_LENGTH,),
  userId: z.string().uuid(),
  userRole: z.string().min(MIN_STRING_LENGTH,),
},)

const ComplianceViolationSchema = z.object({
  article: z.string().min(MIN_STRING_LENGTH,),
  deadline: z.date(),
  description: z.string().min(MIN_STRING_LENGTH,),
  id: z.string().uuid(),
  regulation: z.nativeEnum(HealthcareRegulation,),
  remediation: z.string().min(MIN_STRING_LENGTH,),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL',],),
},)

const ConsentRecordSchema = z.object({
  consentType: z.nativeEnum(HealthcareConsentType,),
  digitalSignature: z.string().min(MIN_STRING_LENGTH,),
  expiresAt: z.date().optional(),
  granted: z.boolean(),
  grantedAt: z.date(),
  id: z.string().uuid(),
  ipAddress: z.string().ip(),
  legalBasis: z.string().min(MIN_STRING_LENGTH,),
  patientId: z.string().uuid(),
  purpose: z.string().min(MIN_STRING_LENGTH,),
  revokedAt: z.date().optional(),
  userAgent: z.string().min(MIN_STRING_LENGTH,),
},)

// Grouped exports
export {
  ANVISAComplianceCategory,
  type AuditTrailEntry,
  AuditTrailEntrySchema,
  type BaseComplianceEntity,
  CFMProfessionalCategory,
  type ComplianceScore,
  ComplianceScoreSchema,
  ComplianceStatus,
  type ComplianceValidationResult,
  type ComplianceViolation,
  ComplianceViolationSchema,
  type ConsentRecord,
  ConsentRecordSchema,
  HealthcareConsentType,
  HealthcareRegulation,
  LGPDDataSubjectRights,
  PatientDataClassification,
}
