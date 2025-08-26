/**
 * @fileoverview NeonPro Healthcare Compliance Package
 * Constitutional Brazilian Healthcare Compliance (LGPD + ANVISA + CFM)
 *
 * This package provides comprehensive compliance utilities for Brazilian healthcare systems
 * with constitutional healthcare validation and ≥9.9/10 quality standards.
 *
 * @version 0.1.0
 * @author NeonPro Healthcare Team
 * @license Proprietary - NeonPro Healthcare System
 */

// Privacy-Preserving Healthcare Analytics
export * from './analytics';

// ANVISA (Agência Nacional de Vigilância Sanitária) - Brazilian Health Regulatory Agency
export * from './anvisa';
// Advanced Audit System for Constitutional Healthcare Compliance
export * from './audit';
// CFM (Conselho Federal de Medicina) - Brazilian Federal Council of Medicine
export * from './cfm';
// Enterprise Healthcare Integration Features
export * from './enterprise';
// LGPD (Lei Geral de Proteção de Dados) - Brazilian Data Protection Law
export * from './lgpd';

// Brazilian Compliance Automation Service
export {
  BrazilianComplianceAutomationService,
  type ComplianceAutomationConfig,
  type ComplianceAutomationResponse,
  createBrazilianComplianceAutomationService,
  DEFAULT_COMPLIANCE_CONFIG,
} from './services/compliance-automation-service';

// Core Types and Interfaces (excluding audit types to avoid conflicts)
export {
  AdverseEventType,
  ANVISADeviceCategory,
  CFMLicenseStatus,
  CFMProfessionalCategory,
  type ComplianceScore,
  ComplianceScoreSchema,
  ComplianceStatus,
  type Consent,
  ConsentSchema,
  type ConstitutionalResponse,
  type DPIAAssessment,
  DPIAAssessmentSchema,
  type HealthcareAnalytics,
  HealthcareAnalyticsMetric,
  HealthcareAnalyticsSchema,
  HealthcareRegulation,
  LGPDLegalBasis,
  PatientDataClassification,
  type ProfessionalValidation,
  ProfessionalValidationSchema,
  type RegulatoryEvent,
  RegulatoryEventSchema,
} from './types';
export * from './utils/audit-utils';
// Utilities and Helpers
export * from './utils/compliance-helpers';
export * from './utils/validation-helpers';

/**
 * Constitutional Healthcare Compliance Configuration
 *
 * Core principles that guide all compliance implementations:
 * - Patient Privacy First: All operations prioritize patient data protection
 * - Medical Accuracy: ≥9.9/10 quality standard for medical-related features
 * - Regulatory Compliance: Constitutional adherence to Brazilian healthcare regulations
 * - AI Ethics: Explainable AI recommendations with medical ethics validation
 * - Transparency Mandate: Clear, accessible information to reduce patient anxiety
 */
export const CONSTITUTIONAL_HEALTHCARE_CONFIG = {
  QUALITY_STANDARD: 9.9,
  PATIENT_PRIVACY_FIRST: true,
  REGULATORY_COMPLIANCE: ['LGPD', 'ANVISA', 'CFM'],
  AI_ETHICS_REQUIRED: true,
  TRANSPARENCY_MANDATE: true,
  BREACH_NOTIFICATION_HOURS: 72,
  AUDIT_RETENTION_YEARS: 7,
  CONSENT_GRANULARITY: 'field-level',
  ENCRYPTION_STANDARD: 'AES-256',
  ACCESS_CONTROL: 'RBAC-healthcare',
} as const;

/**
 * Compliance Package Version and Metadata
 */
export const COMPLIANCE_PACKAGE_INFO = {
  version: '0.1.0',
  name: '@neonpro/compliance',
  description: 'Constitutional Brazilian Healthcare Compliance Utilities',
  regulations: ['LGPD', 'ANVISA', 'CFM'],
  qualityStandard: '≥9.9/10',
  lastUpdated: new Date().toISOString(),
  maintainer: 'NeonPro Healthcare Team',
} as const;
