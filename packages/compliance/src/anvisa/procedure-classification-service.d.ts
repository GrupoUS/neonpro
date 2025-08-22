/**
 * @fileoverview ANVISA Procedure Classification Service
 * Constitutional Brazilian Healthcare Procedure Classification (RDC 67/2007)
 *
 * Constitutional Healthcare Principle: Medical Accuracy + Patient Safety
 * Quality Standard: ≥9.9/10
 *
 * ANVISA RDC 67/2007 - Aesthetic Procedures Classification:
 * - Low Risk: Minimally invasive procedures
 * - Medium Risk: Moderately invasive procedures
 * - High Risk: Highly invasive procedures requiring specialized oversight
 * - Constitutional requirement: All procedures must have proper classification
 */
import { z } from 'zod';
import type { ComplianceScore, ConstitutionalResponse } from '../types';
/**
 * Procedure Risk Classification
 */
export declare enum ProcedureRiskLevel {
    LOW = "LOW",// Baixo risco - minimamente invasivo
    MEDIUM = "MEDIUM",// Médio risco - moderadamente invasivo
    HIGH = "HIGH",// Alto risco - altamente invasivo
    CRITICAL = "CRITICAL"
}
/**
 * Procedure Classification Schema
 */
export declare const ProcedureClassificationSchema: z.ZodObject<{
    classificationId: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodString;
    procedureName: z.ZodString;
    procedureCode: z.ZodString;
    anvisaCategory: z.ZodString;
    riskLevel: z.ZodNativeEnum<typeof ProcedureRiskLevel>;
    invasivenessLevel: z.ZodEnum<["NON_INVASIVE", "MINIMALLY_INVASIVE", "MODERATELY_INVASIVE", "HIGHLY_INVASIVE"]>;
    anesthesiaRequired: z.ZodEnum<["NONE", "TOPICAL", "LOCAL", "REGIONAL", "GENERAL"]>;
    specialistRequired: z.ZodDefault<z.ZodBoolean>;
    requiredCertifications: z.ZodArray<z.ZodString, "many">;
    contraindications: z.ZodArray<z.ZodString, "many">;
    requirementsForExecution: z.ZodObject<{
        minimumProfessionalLevel: z.ZodEnum<["TECHNICIAN", "NURSE", "GENERAL_PHYSICIAN", "SPECIALIST", "SURGEON"]>;
        requiredTraining: z.ZodArray<z.ZodString, "many">;
        supervisionRequired: z.ZodDefault<z.ZodBoolean>;
        equipmentRequired: z.ZodArray<z.ZodString, "many">;
        facilityRequirements: z.ZodArray<z.ZodString, "many">;
        preOperativeAssessment: z.ZodDefault<z.ZodBoolean>;
        postOperativeMonitoring: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        minimumProfessionalLevel: "SPECIALIST" | "TECHNICIAN" | "NURSE" | "GENERAL_PHYSICIAN" | "SURGEON";
        requiredTraining: string[];
        supervisionRequired: boolean;
        equipmentRequired: string[];
        facilityRequirements: string[];
        preOperativeAssessment: boolean;
        postOperativeMonitoring: boolean;
    }, {
        minimumProfessionalLevel: "SPECIALIST" | "TECHNICIAN" | "NURSE" | "GENERAL_PHYSICIAN" | "SURGEON";
        requiredTraining: string[];
        equipmentRequired: string[];
        facilityRequirements: string[];
        supervisionRequired?: boolean | undefined;
        preOperativeAssessment?: boolean | undefined;
        postOperativeMonitoring?: boolean | undefined;
    }>;
    patientEligibility: z.ZodObject<{
        minimumAge: z.ZodNumber;
        maximumAge: z.ZodOptional<z.ZodNumber>;
        pregnancyContraindicated: z.ZodDefault<z.ZodBoolean>;
        specificConditionsRequired: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        specificConditionsProhibited: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        informedConsentRequired: z.ZodDefault<z.ZodBoolean>;
        parentalConsentAge: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        minimumAge: number;
        pregnancyContraindicated: boolean;
        informedConsentRequired: boolean;
        maximumAge?: number | undefined;
        specificConditionsRequired?: string[] | undefined;
        specificConditionsProhibited?: string[] | undefined;
        parentalConsentAge?: number | undefined;
    }, {
        minimumAge: number;
        maximumAge?: number | undefined;
        pregnancyContraindicated?: boolean | undefined;
        specificConditionsRequired?: string[] | undefined;
        specificConditionsProhibited?: string[] | undefined;
        informedConsentRequired?: boolean | undefined;
        parentalConsentAge?: number | undefined;
    }>;
    regulatoryCompliance: z.ZodObject<{
        anvisaApprovalRequired: z.ZodDefault<z.ZodBoolean>;
        cfmApprovalRequired: z.ZodDefault<z.ZodBoolean>;
        institutionalProtocolRequired: z.ZodDefault<z.ZodBoolean>;
        ethicsCommitteeApproval: z.ZodDefault<z.ZodBoolean>;
        adverseEventReportingMandatory: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        anvisaApprovalRequired: boolean;
        cfmApprovalRequired: boolean;
        institutionalProtocolRequired: boolean;
        ethicsCommitteeApproval: boolean;
        adverseEventReportingMandatory: boolean;
    }, {
        anvisaApprovalRequired?: boolean | undefined;
        cfmApprovalRequired?: boolean | undefined;
        institutionalProtocolRequired?: boolean | undefined;
        ethicsCommitteeApproval?: boolean | undefined;
        adverseEventReportingMandatory?: boolean | undefined;
    }>;
    constitutionalValidation: z.ZodObject<{
        patientSafetyValidated: z.ZodDefault<z.ZodBoolean>;
        medicalEthicsCompliant: z.ZodDefault<z.ZodBoolean>;
        qualityStandardsMet: z.ZodDefault<z.ZodBoolean>;
        regulatoryComplianceScore: z.ZodNumber;
        lastValidationDate: z.ZodDate;
        validatedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        validatedBy: string;
        patientSafetyValidated: boolean;
        regulatoryComplianceScore: number;
        lastValidationDate: Date;
        medicalEthicsCompliant: boolean;
        qualityStandardsMet: boolean;
    }, {
        validatedBy: string;
        regulatoryComplianceScore: number;
        lastValidationDate: Date;
        patientSafetyValidated?: boolean | undefined;
        medicalEthicsCompliant?: boolean | undefined;
        qualityStandardsMet?: boolean | undefined;
    }>;
    classifiedBy: z.ZodString;
    classificationDate: z.ZodDate;
    lastReviewDate: z.ZodOptional<z.ZodDate>;
    nextReviewDate: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    constitutionalValidation: {
        validatedBy: string;
        patientSafetyValidated: boolean;
        regulatoryComplianceScore: number;
        lastValidationDate: Date;
        medicalEthicsCompliant: boolean;
        qualityStandardsMet: boolean;
    };
    regulatoryCompliance: {
        anvisaApprovalRequired: boolean;
        cfmApprovalRequired: boolean;
        institutionalProtocolRequired: boolean;
        ethicsCommitteeApproval: boolean;
        adverseEventReportingMandatory: boolean;
    };
    riskLevel: ProcedureRiskLevel;
    procedureName: string;
    procedureCode: string;
    anvisaCategory: string;
    invasivenessLevel: "NON_INVASIVE" | "MINIMALLY_INVASIVE" | "MODERATELY_INVASIVE" | "HIGHLY_INVASIVE";
    anesthesiaRequired: "NONE" | "TOPICAL" | "LOCAL" | "REGIONAL" | "GENERAL";
    specialistRequired: boolean;
    requiredCertifications: string[];
    contraindications: string[];
    requirementsForExecution: {
        minimumProfessionalLevel: "SPECIALIST" | "TECHNICIAN" | "NURSE" | "GENERAL_PHYSICIAN" | "SURGEON";
        requiredTraining: string[];
        supervisionRequired: boolean;
        equipmentRequired: string[];
        facilityRequirements: string[];
        preOperativeAssessment: boolean;
        postOperativeMonitoring: boolean;
    };
    patientEligibility: {
        minimumAge: number;
        pregnancyContraindicated: boolean;
        informedConsentRequired: boolean;
        maximumAge?: number | undefined;
        specificConditionsRequired?: string[] | undefined;
        specificConditionsProhibited?: string[] | undefined;
        parentalConsentAge?: number | undefined;
    };
    classifiedBy: string;
    classificationDate: Date;
    nextReviewDate: Date;
    classificationId?: string | undefined;
    lastReviewDate?: Date | undefined;
}, {
    tenantId: string;
    constitutionalValidation: {
        validatedBy: string;
        regulatoryComplianceScore: number;
        lastValidationDate: Date;
        patientSafetyValidated?: boolean | undefined;
        medicalEthicsCompliant?: boolean | undefined;
        qualityStandardsMet?: boolean | undefined;
    };
    regulatoryCompliance: {
        anvisaApprovalRequired?: boolean | undefined;
        cfmApprovalRequired?: boolean | undefined;
        institutionalProtocolRequired?: boolean | undefined;
        ethicsCommitteeApproval?: boolean | undefined;
        adverseEventReportingMandatory?: boolean | undefined;
    };
    riskLevel: ProcedureRiskLevel;
    procedureName: string;
    procedureCode: string;
    anvisaCategory: string;
    invasivenessLevel: "NON_INVASIVE" | "MINIMALLY_INVASIVE" | "MODERATELY_INVASIVE" | "HIGHLY_INVASIVE";
    anesthesiaRequired: "NONE" | "TOPICAL" | "LOCAL" | "REGIONAL" | "GENERAL";
    requiredCertifications: string[];
    contraindications: string[];
    requirementsForExecution: {
        minimumProfessionalLevel: "SPECIALIST" | "TECHNICIAN" | "NURSE" | "GENERAL_PHYSICIAN" | "SURGEON";
        requiredTraining: string[];
        equipmentRequired: string[];
        facilityRequirements: string[];
        supervisionRequired?: boolean | undefined;
        preOperativeAssessment?: boolean | undefined;
        postOperativeMonitoring?: boolean | undefined;
    };
    patientEligibility: {
        minimumAge: number;
        maximumAge?: number | undefined;
        pregnancyContraindicated?: boolean | undefined;
        specificConditionsRequired?: string[] | undefined;
        specificConditionsProhibited?: string[] | undefined;
        informedConsentRequired?: boolean | undefined;
        parentalConsentAge?: number | undefined;
    };
    classifiedBy: string;
    classificationDate: Date;
    nextReviewDate: Date;
    classificationId?: string | undefined;
    specialistRequired?: boolean | undefined;
    lastReviewDate?: Date | undefined;
}>;
export type ProcedureClassification = z.infer<typeof ProcedureClassificationSchema>;
/**
 * Procedure Filters Type
 */
export type ProcedureFilters = {
    tenantId?: string;
    procedureName?: string;
    procedureCode?: string;
    anvisaCategory?: string;
    riskLevel?: ProcedureRiskLevel;
    invasivenessLevel?: 'NON_INVASIVE' | 'MINIMALLY_INVASIVE' | 'MODERATELY_INVASIVE' | 'HIGHLY_INVASIVE';
    anesthesiaRequired?: 'NONE' | 'TOPICAL' | 'LOCAL' | 'REGIONAL' | 'GENERAL';
    specialistRequired?: boolean;
    classificationDateFrom?: Date;
    classificationDateTo?: Date;
    lastReviewDateFrom?: Date;
    lastReviewDateTo?: Date;
    nextReviewDateFrom?: Date;
    nextReviewDateTo?: Date;
};
/**
 * Classification Validation Result
 */
export type ClassificationValidationResult = {
    classificationId: string;
    isValid: boolean;
    constitutionalCompliance: {
        patientSafetyScore: ComplianceScore;
        medicalEthicsScore: ComplianceScore;
        regulatoryComplianceScore: ComplianceScore;
        overallScore: ComplianceScore;
    };
    validationChecks: {
        riskLevelAppropriate: boolean;
        professionalRequirementsMet: boolean;
        equipmentRequirementsMet: boolean;
        patientEligibilityClear: boolean;
        regulatoryComplianceMet: boolean;
        ethicalStandardsMet: boolean;
    };
    recommendations: Array<{
        category: 'SAFETY' | 'ETHICS' | 'REGULATORY' | 'QUALITY';
        priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        description: string;
        actionRequired: string;
    }>;
    requiredUpdates: string[];
    nextReviewDate: Date;
};
/**
 * Constitutional Procedure Classification Service for ANVISA Compliance
 */
export declare class ProcedureClassificationService {
    private readonly constitutionalQualityStandard;
    private readonly classificationReviewMonths;
    /**
     * Classify Procedure with Constitutional ANVISA Compliance
     * Implements ANVISA RDC 67/2007 with constitutional healthcare validation
     */
    classifyProcedure(classification: ProcedureClassification): Promise<ConstitutionalResponse<ProcedureClassification>>;
    /**
     * Validate Classification with Constitutional Standards
     */
    validateClassification(classificationId: string, tenantId: string): Promise<ConstitutionalResponse<ClassificationValidationResult>>;
    /**
     * Validate Constitutional Healthcare Requirements
     */
    private validateConstitutionalRequirements;
    /**
     * Validate ANVISA RDC 67/2007 Compliance
     */
    private validateANVISACompliance;
    private validateProfessionalRequirements;
    private assessPatientSafety;
    private calculateComplianceScore;
    private storeProcedureClassification;
    private getProcedureClassification;
    private performClassificationValidation;
    private generateComplianceDocumentation;
    private sendClassificationNotification;
    private createAuditEvent;
}
