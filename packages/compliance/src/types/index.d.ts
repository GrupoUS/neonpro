/**
 * @fileoverview Core Types for NeonPro Healthcare Compliance
 * Constitutional Brazilian Healthcare Compliance Types (LGPD + ANVISA + CFM)
 *
 * Quality Standard: ≥9.9/10
 */
import { z } from 'zod';
import type { AuditEvent } from '../audit/types';
/**
 * Constitutional Compliance Score
 * Represents compliance level with Brazilian healthcare regulations
 */
export declare const ComplianceScoreSchema: z.ZodEffects<z.ZodNumber, number, number>;
export type ComplianceScore = z.infer<typeof ComplianceScoreSchema>;
/**
 * Brazilian Healthcare Regulatory Framework
 */
export declare enum HealthcareRegulation {
    LGPD = "LGPD",// Lei Geral de Proteção de Dados
    ANVISA = "ANVISA",// Agência Nacional de Vigilância Sanitária
    CFM = "CFM",// Conselho Federal de Medicina
    CONSTITUTIONAL = "CONSTITUTIONAL"
}
/**
 * Compliance Status with Constitutional Validation
 */
export declare enum ComplianceStatus {
    COMPLIANT = "COMPLIANT",
    NON_COMPLIANT = "NON_COMPLIANT",
    UNDER_REVIEW = "UNDER_REVIEW",
    PENDING_VALIDATION = "PENDING_VALIDATION",
    CONSTITUTIONAL_VIOLATION = "CONSTITUTIONAL_VIOLATION"
}
/**
 * Patient Data Classification for LGPD Compliance
 */
export declare enum PatientDataClassification {
    PERSONAL = "PERSONAL",// Dados pessoais (Art. 5º, I LGPD)
    SENSITIVE = "SENSITIVE",// Dados pessoais sensíveis (Art. 5º, II LGPD)
    HEALTH = "HEALTH",// Dados de saúde (constitutional protection)
    GENETIC = "GENETIC",// Dados genéticos (extra protection)
    BIOMETRIC = "BIOMETRIC",// Dados biométricos (identification)
    CHILD = "CHILD"
}
/**
 * LGPD Legal Basis (Base Legal) - Art. 7º and 11º LGPD
 */
export declare enum LGPDLegalBasis {
    CONSENT = "CONSENT",// Consentimento (Art. 7º, I)
    LEGAL_OBLIGATION = "LEGAL_OBLIGATION",// Cumprimento de obrigação legal (Art. 7º, II)
    PUBLIC_ADMINISTRATION = "PUBLIC_ADMINISTRATION",// Execução de políticas públicas (Art. 7º, III)
    RESEARCH = "RESEARCH",// Realização de estudos (Art. 7º, IV)
    CONTRACT_EXECUTION = "CONTRACT_EXECUTION",// Execução de contrato (Art. 7º, V)
    JUDICIAL_PROCESS = "JUDICIAL_PROCESS",// Processo judicial (Art. 7º, VI)
    LEGITIMATE_INTEREST = "LEGITIMATE_INTEREST",// Interesse legítimo (Art. 7º, IX)
    VITAL_INTEREST = "VITAL_INTEREST",// Proteção da vida (Art. 7º, VII)
    HEALTH_PROTECTION = "HEALTH_PROTECTION",// Tutela da saúde (Art. 11º, II)
    HEALTH_PROCEDURES = "HEALTH_PROCEDURES"
}
/**
 * LGPD Consent Management Schema
 */
export declare const ConsentSchema: z.ZodObject<{
    id: z.ZodString;
    patientId: z.ZodString;
    tenantId: z.ZodString;
    consentType: z.ZodNativeEnum<typeof PatientDataClassification>;
    legalBasis: z.ZodNativeEnum<typeof LGPDLegalBasis>;
    purpose: z.ZodString;
    granular: z.ZodDefault<z.ZodBoolean>;
    explicit: z.ZodDefault<z.ZodBoolean>;
    informed: z.ZodDefault<z.ZodBoolean>;
    freely_given: z.ZodDefault<z.ZodBoolean>;
    withdrawable: z.ZodDefault<z.ZodBoolean>;
    grantedAt: z.ZodDate;
    withdrawnAt: z.ZodDefault<z.ZodNullable<z.ZodDate>>;
    expiresAt: z.ZodDefault<z.ZodNullable<z.ZodDate>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    auditTrail: z.ZodArray<z.ZodObject<{
        action: z.ZodString;
        timestamp: z.ZodDate;
        userId: z.ZodString;
        ipAddress: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        action: string;
        timestamp: Date;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
    }, {
        userId: string;
        action: string;
        timestamp: Date;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
    }>, "many">;
    constitutionalValidation: z.ZodObject<{
        validated: z.ZodBoolean;
        validatedAt: z.ZodDate;
        validatedBy: z.ZodString;
        complianceScore: z.ZodEffects<z.ZodNumber, number, number>;
    }, "strip", z.ZodTypeAny, {
        validated: boolean;
        validatedAt: Date;
        validatedBy: string;
        complianceScore: number;
    }, {
        validated: boolean;
        validatedAt: Date;
        validatedBy: string;
        complianceScore: number;
    }>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    tenantId: string;
    id: string;
    consentType: PatientDataClassification;
    legalBasis: LGPDLegalBasis;
    purpose: string;
    granular: boolean;
    explicit: boolean;
    informed: boolean;
    freely_given: boolean;
    withdrawable: boolean;
    grantedAt: Date;
    withdrawnAt: Date | null;
    expiresAt: Date | null;
    isActive: boolean;
    auditTrail: {
        userId: string;
        action: string;
        timestamp: Date;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
    }[];
    constitutionalValidation: {
        validated: boolean;
        validatedAt: Date;
        validatedBy: string;
        complianceScore: number;
    };
}, {
    patientId: string;
    tenantId: string;
    id: string;
    consentType: PatientDataClassification;
    legalBasis: LGPDLegalBasis;
    purpose: string;
    grantedAt: Date;
    auditTrail: {
        userId: string;
        action: string;
        timestamp: Date;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
    }[];
    constitutionalValidation: {
        validated: boolean;
        validatedAt: Date;
        validatedBy: string;
        complianceScore: number;
    };
    granular?: boolean | undefined;
    explicit?: boolean | undefined;
    informed?: boolean | undefined;
    freely_given?: boolean | undefined;
    withdrawable?: boolean | undefined;
    withdrawnAt?: Date | null | undefined;
    expiresAt?: Date | null | undefined;
    isActive?: boolean | undefined;
}>;
export type Consent = z.infer<typeof ConsentSchema>;
/**
 * ANVISA Medical Device Categories
 */
export declare enum ANVISADeviceCategory {
    CLASS_I = "CLASS_I",// Classe I - Baixo risco
    CLASS_II = "CLASS_II",// Classe II - Médio risco
    CLASS_III = "CLASS_III",// Classe III - Alto risco
    CLASS_IV = "CLASS_IV"
}
/**
 * ANVISA Adverse Event Types
 */
export declare enum AdverseEventType {
    MILD = "MILD",// Evento adverso leve
    MODERATE = "MODERATE",// Evento adverso moderado
    SEVERE = "SEVERE",// Evento adverso grave
    LIFE_THREATENING = "LIFE_THREATENING",// Ameaça à vida
    DEATH = "DEATH",// Óbito
    HOSPITALIZATION = "HOSPITALIZATION"
}
/**
 * ANVISA Regulatory Event Schema
 */
export declare const RegulatoryEventSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    deviceId: z.ZodOptional<z.ZodString>;
    procedureId: z.ZodOptional<z.ZodString>;
    patientId: z.ZodString;
    eventType: z.ZodNativeEnum<typeof AdverseEventType>;
    deviceCategory: z.ZodOptional<z.ZodNativeEnum<typeof ANVISADeviceCategory>>;
    description: z.ZodString;
    severity: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>;
    reportedAt: z.ZodDate;
    reportedBy: z.ZodString;
    anvisaNotified: z.ZodDefault<z.ZodBoolean>;
    anvisaNotificationDate: z.ZodDefault<z.ZodNullable<z.ZodDate>>;
    anvisaProtocol: z.ZodOptional<z.ZodString>;
    followUpRequired: z.ZodDefault<z.ZodBoolean>;
    constitutionalValidation: z.ZodObject<{
        medicalAccuracy: z.ZodEffects<z.ZodNumber, number, number>;
        regulatoryCompliance: z.ZodEffects<z.ZodNumber, number, number>;
        patientSafety: z.ZodEffects<z.ZodNumber, number, number>;
    }, "strip", z.ZodTypeAny, {
        medicalAccuracy: number;
        regulatoryCompliance: number;
        patientSafety: number;
    }, {
        medicalAccuracy: number;
        regulatoryCompliance: number;
        patientSafety: number;
    }>;
}, "strip", z.ZodTypeAny, {
    eventType: AdverseEventType;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    patientId: string;
    description: string;
    tenantId: string;
    id: string;
    constitutionalValidation: {
        medicalAccuracy: number;
        regulatoryCompliance: number;
        patientSafety: number;
    };
    reportedAt: Date;
    reportedBy: string;
    anvisaNotified: boolean;
    anvisaNotificationDate: Date | null;
    followUpRequired: boolean;
    deviceId?: string | undefined;
    procedureId?: string | undefined;
    deviceCategory?: ANVISADeviceCategory | undefined;
    anvisaProtocol?: string | undefined;
}, {
    eventType: AdverseEventType;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    patientId: string;
    description: string;
    tenantId: string;
    id: string;
    constitutionalValidation: {
        medicalAccuracy: number;
        regulatoryCompliance: number;
        patientSafety: number;
    };
    reportedAt: Date;
    reportedBy: string;
    deviceId?: string | undefined;
    procedureId?: string | undefined;
    deviceCategory?: ANVISADeviceCategory | undefined;
    anvisaNotified?: boolean | undefined;
    anvisaNotificationDate?: Date | null | undefined;
    anvisaProtocol?: string | undefined;
    followUpRequired?: boolean | undefined;
}>;
export type RegulatoryEvent = z.infer<typeof RegulatoryEventSchema>;
/**
 * CFM Professional Categories
 */
export declare enum CFMProfessionalCategory {
    PHYSICIAN = "PHYSICIAN",// Médico
    SPECIALIST = "SPECIALIST",// Especialista
    RESIDENT = "RESIDENT",// Residente
    MEDICAL_STUDENT = "MEDICAL_STUDENT",// Estudante de medicina
    FOREIGN_PHYSICIAN = "FOREIGN_PHYSICIAN"
}
/**
 * CFM License Status
 */
export declare enum CFMLicenseStatus {
    ACTIVE = "ACTIVE",// Ativo
    SUSPENDED = "SUSPENDED",// Suspenso
    REVOKED = "REVOKED",// Cassado
    EXPIRED = "EXPIRED",// Expirado
    UNDER_INVESTIGATION = "UNDER_INVESTIGATION"
}
/**
 * CFM Professional Validation Schema
 */
export declare const ProfessionalValidationSchema: z.ZodObject<{
    id: z.ZodString;
    professionalId: z.ZodString;
    tenantId: z.ZodString;
    crmNumber: z.ZodString;
    crmState: z.ZodString;
    category: z.ZodNativeEnum<typeof CFMProfessionalCategory>;
    licenseStatus: z.ZodNativeEnum<typeof CFMLicenseStatus>;
    validatedAt: z.ZodDate;
    expiresAt: z.ZodDate;
    digitalSignatureValid: z.ZodBoolean;
    telemedicineAuthorized: z.ZodBoolean;
    ethicsCompliant: z.ZodBoolean;
    constitutionalValidation: z.ZodObject<{
        professionalEthics: z.ZodEffects<z.ZodNumber, number, number>;
        medicalCompetence: z.ZodEffects<z.ZodNumber, number, number>;
        regulatoryCompliance: z.ZodEffects<z.ZodNumber, number, number>;
    }, "strip", z.ZodTypeAny, {
        regulatoryCompliance: number;
        professionalEthics: number;
        medicalCompetence: number;
    }, {
        regulatoryCompliance: number;
        professionalEthics: number;
        medicalCompetence: number;
    }>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    id: string;
    expiresAt: Date;
    constitutionalValidation: {
        regulatoryCompliance: number;
        professionalEthics: number;
        medicalCompetence: number;
    };
    validatedAt: Date;
    professionalId: string;
    crmNumber: string;
    crmState: string;
    category: CFMProfessionalCategory;
    licenseStatus: CFMLicenseStatus;
    digitalSignatureValid: boolean;
    telemedicineAuthorized: boolean;
    ethicsCompliant: boolean;
}, {
    tenantId: string;
    id: string;
    expiresAt: Date;
    constitutionalValidation: {
        regulatoryCompliance: number;
        professionalEthics: number;
        medicalCompetence: number;
    };
    validatedAt: Date;
    professionalId: string;
    crmNumber: string;
    crmState: string;
    category: CFMProfessionalCategory;
    licenseStatus: CFMLicenseStatus;
    digitalSignatureValid: boolean;
    telemedicineAuthorized: boolean;
    ethicsCompliant: boolean;
}>;
export type ProfessionalValidation = z.infer<typeof ProfessionalValidationSchema>;
/**
 * Healthcare Analytics Metric Types
 */
export declare enum HealthcareAnalyticsMetric {
    COMPLIANCE_SCORE = "COMPLIANCE_SCORE",
    PATIENT_SATISFACTION = "PATIENT_SATISFACTION",
    TREATMENT_EFFICACY = "TREATMENT_EFFICACY",
    REGULATORY_ADHERENCE = "REGULATORY_ADHERENCE",
    PROFESSIONAL_PERFORMANCE = "PROFESSIONAL_PERFORMANCE",
    SYSTEM_USAGE = "SYSTEM_USAGE",
    SECURITY_INCIDENTS = "SECURITY_INCIDENTS",
    CONSENT_MANAGEMENT = "CONSENT_MANAGEMENT"
}
/**
 * Privacy-Preserving Analytics Schema
 */
export declare const HealthcareAnalyticsSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    metricType: z.ZodNativeEnum<typeof HealthcareAnalyticsMetric>;
    value: z.ZodNumber;
    unit: z.ZodString;
    period: z.ZodObject<{
        start: z.ZodDate;
        end: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        start: Date;
        end: Date;
    }, {
        start: Date;
        end: Date;
    }>;
    anonymized: z.ZodDefault<z.ZodBoolean>;
    aggregationLevel: z.ZodEnum<["INDIVIDUAL", "GROUP", "CLINIC", "TENANT"]>;
    privacyScore: z.ZodEffects<z.ZodNumber, number, number>;
    constitutionalCompliance: z.ZodObject<{
        dataMinimization: z.ZodBoolean;
        purposeLimitation: z.ZodBoolean;
        consentBased: z.ZodBoolean;
        transparencyProvided: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        dataMinimization: boolean;
        purposeLimitation: boolean;
        consentBased: boolean;
        transparencyProvided: boolean;
    }, {
        dataMinimization: boolean;
        purposeLimitation: boolean;
        consentBased: boolean;
        transparencyProvided: boolean;
    }>;
    createdAt: z.ZodDate;
    validUntil: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    value: number;
    tenantId: string;
    id: string;
    metricType: HealthcareAnalyticsMetric;
    unit: string;
    period: {
        start: Date;
        end: Date;
    };
    anonymized: boolean;
    aggregationLevel: "INDIVIDUAL" | "GROUP" | "CLINIC" | "TENANT";
    privacyScore: number;
    constitutionalCompliance: {
        dataMinimization: boolean;
        purposeLimitation: boolean;
        consentBased: boolean;
        transparencyProvided: boolean;
    };
    createdAt: Date;
    validUntil: Date;
}, {
    value: number;
    tenantId: string;
    id: string;
    metricType: HealthcareAnalyticsMetric;
    unit: string;
    period: {
        start: Date;
        end: Date;
    };
    aggregationLevel: "INDIVIDUAL" | "GROUP" | "CLINIC" | "TENANT";
    privacyScore: number;
    constitutionalCompliance: {
        dataMinimization: boolean;
        purposeLimitation: boolean;
        consentBased: boolean;
        transparencyProvided: boolean;
    };
    createdAt: Date;
    validUntil: Date;
    anonymized?: boolean | undefined;
}>;
export type HealthcareAnalytics = z.infer<typeof HealthcareAnalyticsSchema>;
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
export declare const DPIAAssessmentSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    processName: z.ZodString;
    description: z.ZodString;
    dataTypes: z.ZodArray<z.ZodNativeEnum<typeof PatientDataClassification>, "many">;
    legalBasis: z.ZodArray<z.ZodNativeEnum<typeof LGPDLegalBasis>, "many">;
    riskLevel: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>;
    mitigationMeasures: z.ZodArray<z.ZodString, "many">;
    assessedBy: z.ZodString;
    assessedAt: z.ZodDate;
    reviewDate: z.ZodDate;
    approved: z.ZodBoolean;
    approvedBy: z.ZodOptional<z.ZodString>;
    approvedAt: z.ZodOptional<z.ZodDate>;
    constitutionalScore: z.ZodEffects<z.ZodNumber, number, number>;
}, "strip", z.ZodTypeAny, {
    description: string;
    tenantId: string;
    id: string;
    legalBasis: LGPDLegalBasis[];
    processName: string;
    dataTypes: PatientDataClassification[];
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    mitigationMeasures: string[];
    assessedBy: string;
    assessedAt: Date;
    reviewDate: Date;
    approved: boolean;
    constitutionalScore: number;
    approvedBy?: string | undefined;
    approvedAt?: Date | undefined;
}, {
    description: string;
    tenantId: string;
    id: string;
    legalBasis: LGPDLegalBasis[];
    processName: string;
    dataTypes: PatientDataClassification[];
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    mitigationMeasures: string[];
    assessedBy: string;
    assessedAt: Date;
    reviewDate: Date;
    approved: boolean;
    constitutionalScore: number;
    approvedBy?: string | undefined;
    approvedAt?: Date | undefined;
}>;
export type DPIAAssessment = z.infer<typeof DPIAAssessmentSchema>;
