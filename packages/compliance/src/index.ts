/**
 * @fileoverview NeonPro Aesthetic Clinic Compliance Package
 * LGPD Data Protection Compliance for Aesthetic Clinic SaaS
 *
 * This package provides essential compliance utilities for aesthetic clinic operations
 * with focus on data protection and business validation.
 *
 * @version 0.1.0
 * @author NeonPro Development Team
 * @license Proprietary - NeonPro Aesthetic Clinic Platform
 */

// Privacy-Preserving Analytics for Aesthetic Clinics
export * from "./analytics";

// Enterprise Features for Multi-Clinic Operations
export * from "./enterprise";
// LGPD (Lei Geral de Proteção de Dados) - Brazilian Data Protection Law
export * from "./lgpd";

// Brazilian Compliance Automation Service
export {
  BrazilianComplianceAutomationService,
  type ComplianceAutomationConfig,
  type ComplianceAutomationResponse,
  createBrazilianComplianceAutomationService,
  DEFAULT_COMPLIANCE_CONFIG,
} from "./services/compliance-automation-service";

// Core Types and Interfaces for Aesthetic Clinic Compliance
export {
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
  LGPDLegalBasis,
  PatientDataClassification,
  type ProfessionalValidation,
  ProfessionalValidationSchema,
  type RegulatoryEvent,
  RegulatoryEventSchema,
} from "./types";
export * from "./utils/audit-utils";
// Utilities and Helpers
export * from "./utils/compliance-helpers";
export * from "./utils/validation-helpers";

/**
 * Aesthetic Clinic Compliance Configuration
 *
 * Core principles that guide all compliance implementations:
 * - Patient Privacy First: All operations prioritize patient data protection
 * - Business Quality: High quality standard for aesthetic clinic operations
 * - LGPD Compliance: Adherence to Brazilian data protection regulations
 * - Transparency: Clear, accessible information for aesthetic clinic patients
 * - Professional Standards: Appropriate validation for aesthetic professionals
 */
export const AESTHETIC_CLINIC_COMPLIANCE_CONFIG = {
  QUALITY_STANDARD: 9.5,
  PATIENT_PRIVACY_FIRST: true,
  REGULATORY_COMPLIANCE: ["LGPD"],
  TRANSPARENCY_MANDATE: true,
  BREACH_NOTIFICATION_HOURS: 72,
  AUDIT_RETENTION_YEARS: 7,
  CONSENT_GRANULARITY: "field-level",
  ENCRYPTION_STANDARD: "AES-256",
  ACCESS_CONTROL: "RBAC-aesthetic-clinic",
} as const;

/**
 * Compliance Package Version and Metadata
 */
export const COMPLIANCE_PACKAGE_INFO = {
  version: "0.1.0",
  name: "@neonpro/compliance",
  description: "LGPD Data Protection Compliance for Aesthetic Clinic SaaS",
  regulations: ["LGPD"],
  qualityStandard: "≥9.5/10",
  lastUpdated: new Date().toISOString(),
  maintainer: "NeonPro Development Team",
} as const;
