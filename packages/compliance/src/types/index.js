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
/**
 * Brazilian Healthcare Regulatory Framework
 */
export var HealthcareRegulation;
(function (HealthcareRegulation) {
    HealthcareRegulation["LGPD"] = "LGPD";
    HealthcareRegulation["ANVISA"] = "ANVISA";
    HealthcareRegulation["CFM"] = "CFM";
    HealthcareRegulation["CONSTITUTIONAL"] = "CONSTITUTIONAL";
})(HealthcareRegulation || (HealthcareRegulation = {}));
/**
 * Compliance Status with Constitutional Validation
 */
export var ComplianceStatus;
(function (ComplianceStatus) {
    ComplianceStatus["COMPLIANT"] = "COMPLIANT";
    ComplianceStatus["NON_COMPLIANT"] = "NON_COMPLIANT";
    ComplianceStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ComplianceStatus["PENDING_VALIDATION"] = "PENDING_VALIDATION";
    ComplianceStatus["CONSTITUTIONAL_VIOLATION"] = "CONSTITUTIONAL_VIOLATION";
})(ComplianceStatus || (ComplianceStatus = {}));
/**
 * Patient Data Classification for LGPD Compliance
 */
export var PatientDataClassification;
(function (PatientDataClassification) {
    PatientDataClassification["PERSONAL"] = "PERSONAL";
    PatientDataClassification["SENSITIVE"] = "SENSITIVE";
    PatientDataClassification["HEALTH"] = "HEALTH";
    PatientDataClassification["GENETIC"] = "GENETIC";
    PatientDataClassification["BIOMETRIC"] = "BIOMETRIC";
    PatientDataClassification["CHILD"] = "CHILD";
})(PatientDataClassification || (PatientDataClassification = {}));
// =============================================================================
// LGPD COMPLIANCE TYPES
// =============================================================================
/**
 * LGPD Legal Basis (Base Legal) - Art. 7º and 11º LGPD
 */
export var LGPDLegalBasis;
(function (LGPDLegalBasis) {
    LGPDLegalBasis["CONSENT"] = "CONSENT";
    LGPDLegalBasis["LEGAL_OBLIGATION"] = "LEGAL_OBLIGATION";
    LGPDLegalBasis["PUBLIC_ADMINISTRATION"] = "PUBLIC_ADMINISTRATION";
    LGPDLegalBasis["RESEARCH"] = "RESEARCH";
    LGPDLegalBasis["CONTRACT_EXECUTION"] = "CONTRACT_EXECUTION";
    LGPDLegalBasis["JUDICIAL_PROCESS"] = "JUDICIAL_PROCESS";
    LGPDLegalBasis["LEGITIMATE_INTEREST"] = "LEGITIMATE_INTEREST";
    LGPDLegalBasis["VITAL_INTEREST"] = "VITAL_INTEREST";
    LGPDLegalBasis["HEALTH_PROTECTION"] = "HEALTH_PROTECTION";
    LGPDLegalBasis["HEALTH_PROCEDURES"] = "HEALTH_PROCEDURES";
})(LGPDLegalBasis || (LGPDLegalBasis = {}));
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
    auditTrail: z.array(z.object({
        action: z.string(),
        timestamp: z.date(),
        userId: z.string().uuid(),
        ipAddress: z.string().ip().optional(),
        userAgent: z.string().optional(),
    })),
    constitutionalValidation: z.object({
        validated: z.boolean(),
        validatedAt: z.date(),
        validatedBy: z.string().uuid(),
        complianceScore: ComplianceScoreSchema,
    }),
});
// ANVISA COMPLIANCE TYPES
// =============================================================================
/**
 * ANVISA Medical Device Categories
 */
export var ANVISADeviceCategory;
(function (ANVISADeviceCategory) {
    ANVISADeviceCategory["CLASS_I"] = "CLASS_I";
    ANVISADeviceCategory["CLASS_II"] = "CLASS_II";
    ANVISADeviceCategory["CLASS_III"] = "CLASS_III";
    ANVISADeviceCategory["CLASS_IV"] = "CLASS_IV";
})(ANVISADeviceCategory || (ANVISADeviceCategory = {}));
/**
 * ANVISA Adverse Event Types
 */
export var AdverseEventType;
(function (AdverseEventType) {
    AdverseEventType["MILD"] = "MILD";
    AdverseEventType["MODERATE"] = "MODERATE";
    AdverseEventType["SEVERE"] = "SEVERE";
    AdverseEventType["LIFE_THREATENING"] = "LIFE_THREATENING";
    AdverseEventType["DEATH"] = "DEATH";
    AdverseEventType["HOSPITALIZATION"] = "HOSPITALIZATION";
})(AdverseEventType || (AdverseEventType = {}));
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
// =============================================================================
// CFM COMPLIANCE TYPES
// =============================================================================
/**
 * CFM Professional Categories
 */
export var CFMProfessionalCategory;
(function (CFMProfessionalCategory) {
    CFMProfessionalCategory["PHYSICIAN"] = "PHYSICIAN";
    CFMProfessionalCategory["SPECIALIST"] = "SPECIALIST";
    CFMProfessionalCategory["RESIDENT"] = "RESIDENT";
    CFMProfessionalCategory["MEDICAL_STUDENT"] = "MEDICAL_STUDENT";
    CFMProfessionalCategory["FOREIGN_PHYSICIAN"] = "FOREIGN_PHYSICIAN";
})(CFMProfessionalCategory || (CFMProfessionalCategory = {}));
/**
 * CFM License Status
 */
export var CFMLicenseStatus;
(function (CFMLicenseStatus) {
    CFMLicenseStatus["ACTIVE"] = "ACTIVE";
    CFMLicenseStatus["SUSPENDED"] = "SUSPENDED";
    CFMLicenseStatus["REVOKED"] = "REVOKED";
    CFMLicenseStatus["EXPIRED"] = "EXPIRED";
    CFMLicenseStatus["UNDER_INVESTIGATION"] = "UNDER_INVESTIGATION";
})(CFMLicenseStatus || (CFMLicenseStatus = {}));
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
// AUDIT SYSTEM TYPES (Re-exported from ./audit)
// =============================================================================
// Note: AuditEventType, AuditEventSchema, and AuditEvent are exported from ./audit module
// =============================================================================
// ANALYTICS TYPES (PRIVACY-PRESERVING)
// =============================================================================
/**
 * Healthcare Analytics Metric Types
 */
export var HealthcareAnalyticsMetric;
(function (HealthcareAnalyticsMetric) {
    HealthcareAnalyticsMetric["COMPLIANCE_SCORE"] = "COMPLIANCE_SCORE";
    HealthcareAnalyticsMetric["PATIENT_SATISFACTION"] = "PATIENT_SATISFACTION";
    HealthcareAnalyticsMetric["TREATMENT_EFFICACY"] = "TREATMENT_EFFICACY";
    HealthcareAnalyticsMetric["REGULATORY_ADHERENCE"] = "REGULATORY_ADHERENCE";
    HealthcareAnalyticsMetric["PROFESSIONAL_PERFORMANCE"] = "PROFESSIONAL_PERFORMANCE";
    HealthcareAnalyticsMetric["SYSTEM_USAGE"] = "SYSTEM_USAGE";
    HealthcareAnalyticsMetric["SECURITY_INCIDENTS"] = "SECURITY_INCIDENTS";
    HealthcareAnalyticsMetric["CONSENT_MANAGEMENT"] = "CONSENT_MANAGEMENT";
})(HealthcareAnalyticsMetric || (HealthcareAnalyticsMetric = {}));
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
