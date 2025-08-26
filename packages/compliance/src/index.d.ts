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
export * from "./analytics";
export * from "./anvisa";
export * from "./audit";
export * from "./cfm";
export * from "./enterprise";
export * from "./lgpd";
export {
  BrazilianComplianceAutomationService,
  type ComplianceAutomationConfig,
  type ComplianceAutomationResponse,
  createBrazilianComplianceAutomationService,
  DEFAULT_COMPLIANCE_CONFIG,
} from "./services/compliance-automation-service";
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
} from "./types";
export * from "./utils/audit-utils";
export * from "./utils/compliance-helpers";
export * from "./utils/validation-helpers";
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
export declare const CONSTITUTIONAL_HEALTHCARE_CONFIG: {
  readonly QUALITY_STANDARD: 9.9;
  readonly PATIENT_PRIVACY_FIRST: true;
  readonly REGULATORY_COMPLIANCE: readonly ["LGPD", "ANVISA", "CFM"];
  readonly AI_ETHICS_REQUIRED: true;
  readonly TRANSPARENCY_MANDATE: true;
  readonly BREACH_NOTIFICATION_HOURS: 72;
  readonly AUDIT_RETENTION_YEARS: 7;
  readonly CONSENT_GRANULARITY: "field-level";
  readonly ENCRYPTION_STANDARD: "AES-256";
  readonly ACCESS_CONTROL: "RBAC-healthcare";
};
/**
 * Compliance Package Version and Metadata
 */
export declare const COMPLIANCE_PACKAGE_INFO: {
  readonly version: "0.1.0";
  readonly name: "@neonpro/compliance";
  readonly description: "Constitutional Brazilian Healthcare Compliance Utilities";
  readonly regulations: readonly ["LGPD", "ANVISA", "CFM"];
  readonly qualityStandard: "≥9.9/10";
  readonly lastUpdated: string;
  readonly maintainer: "NeonPro Healthcare Team";
};
