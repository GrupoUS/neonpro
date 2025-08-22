/**
 * @fileoverview ANVISA Medical Device Compliance Service
 * Constitutional Brazilian Medical Device Regulatory Compliance (RDC 185/2001)
 *
 * Constitutional Healthcare Principle: Patient Safety First + Medical Device Oversight
 * Quality Standard: ≥9.9/10
 *
 * ANVISA RDC 185/2001 - Medical Device Classification and Registration:
 * - Class I: Low risk devices (Classe I - Baixo risco)
 * - Class II: Medium risk devices (Classe II - Médio risco)
 * - Class III: High risk devices (Classe III - Alto risco)
 * - Class IV: Maximum risk devices (Classe IV - Máximo risco)
 */
import { z } from 'zod';
import type { ComplianceScore, ConstitutionalResponse } from '../types';
import { ANVISADeviceCategory } from '../types';
/**
 * Medical Device Registration Schema
 */
export declare const MedicalDeviceRegistrationSchema: z.ZodObject<{
    deviceId: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodString;
    deviceName: z.ZodString;
    manufacturer: z.ZodString;
    model: z.ZodString;
    serialNumber: z.ZodString;
    anvisaRegistrationNumber: z.ZodString;
    deviceCategory: z.ZodNativeEnum<typeof ANVISADeviceCategory>;
    intendedUse: z.ZodString;
    technicalSpecifications: z.ZodString;
    riskClassification: z.ZodEnum<["BAIXO", "MEDIO", "ALTO", "MAXIMO"]>;
    registrationDate: z.ZodDate;
    expirationDate: z.ZodDate;
    lastInspectionDate: z.ZodOptional<z.ZodDate>;
    nextInspectionDate: z.ZodDate;
    complianceStatus: z.ZodEnum<["COMPLIANT", "NON_COMPLIANT", "PENDING_REVIEW", "SUSPENDED"]>;
    qualityAssurance: z.ZodObject<{
        iso13485Certified: z.ZodDefault<z.ZodBoolean>;
        goodManufacturingPractices: z.ZodDefault<z.ZodBoolean>;
        qualityManagementSystem: z.ZodDefault<z.ZodBoolean>;
        riskManagementPlan: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        iso13485Certified: boolean;
        goodManufacturingPractices: boolean;
        qualityManagementSystem: boolean;
        riskManagementPlan: boolean;
    }, {
        iso13485Certified?: boolean | undefined;
        goodManufacturingPractices?: boolean | undefined;
        qualityManagementSystem?: boolean | undefined;
        riskManagementPlan?: boolean | undefined;
    }>;
    clinicalUsage: z.ZodObject<{
        clinicId: z.ZodString;
        responsibleProfessional: z.ZodString;
        usageFrequency: z.ZodEnum<["DAILY", "WEEKLY", "MONTHLY", "OCCASIONAL"]>;
        patientExposureLevel: z.ZodEnum<["DIRECT", "INDIRECT", "MINIMAL", "NONE"]>;
        procedureTypes: z.ZodArray<z.ZodString, "many">;
        safetyCertifications: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        clinicId: string;
        responsibleProfessional: string;
        usageFrequency: "DAILY" | "WEEKLY" | "MONTHLY" | "OCCASIONAL";
        patientExposureLevel: "NONE" | "MINIMAL" | "DIRECT" | "INDIRECT";
        procedureTypes: string[];
        safetyCertifications: string[];
    }, {
        clinicId: string;
        responsibleProfessional: string;
        usageFrequency: "DAILY" | "WEEKLY" | "MONTHLY" | "OCCASIONAL";
        patientExposureLevel: "NONE" | "MINIMAL" | "DIRECT" | "INDIRECT";
        procedureTypes: string[];
        safetyCertifications: string[];
    }>;
    maintenanceSchedule: z.ZodObject<{
        preventiveMaintenance: z.ZodDefault<z.ZodBoolean>;
        calibrationRequired: z.ZodDefault<z.ZodBoolean>;
        calibrationFrequency: z.ZodOptional<z.ZodEnum<["MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ANNUAL"]>>;
        lastCalibrationDate: z.ZodOptional<z.ZodDate>;
        nextCalibrationDate: z.ZodOptional<z.ZodDate>;
        maintenanceRecords: z.ZodArray<z.ZodObject<{
            date: z.ZodDate;
            type: z.ZodString;
            performedBy: z.ZodString;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            date: Date;
            performedBy: string;
            notes?: string | undefined;
        }, {
            type: string;
            date: Date;
            performedBy: string;
            notes?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        preventiveMaintenance: boolean;
        calibrationRequired: boolean;
        maintenanceRecords: {
            type: string;
            date: Date;
            performedBy: string;
            notes?: string | undefined;
        }[];
        calibrationFrequency?: "QUARTERLY" | "MONTHLY" | "SEMI_ANNUAL" | "ANNUAL" | undefined;
        lastCalibrationDate?: Date | undefined;
        nextCalibrationDate?: Date | undefined;
    }, {
        maintenanceRecords: {
            type: string;
            date: Date;
            performedBy: string;
            notes?: string | undefined;
        }[];
        preventiveMaintenance?: boolean | undefined;
        calibrationRequired?: boolean | undefined;
        calibrationFrequency?: "QUARTERLY" | "MONTHLY" | "SEMI_ANNUAL" | "ANNUAL" | undefined;
        lastCalibrationDate?: Date | undefined;
        nextCalibrationDate?: Date | undefined;
    }>;
    constitutionalValidation: z.ZodObject<{
        patientSafetyValidated: z.ZodDefault<z.ZodBoolean>;
        medicalAccuracyConfirmed: z.ZodDefault<z.ZodBoolean>;
        regulatoryComplianceScore: z.ZodNumber;
        lastValidationDate: z.ZodDate;
        validatedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        validatedBy: string;
        patientSafetyValidated: boolean;
        medicalAccuracyConfirmed: boolean;
        regulatoryComplianceScore: number;
        lastValidationDate: Date;
    }, {
        validatedBy: string;
        regulatoryComplianceScore: number;
        lastValidationDate: Date;
        patientSafetyValidated?: boolean | undefined;
        medicalAccuracyConfirmed?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    constitutionalValidation: {
        validatedBy: string;
        patientSafetyValidated: boolean;
        medicalAccuracyConfirmed: boolean;
        regulatoryComplianceScore: number;
        lastValidationDate: Date;
    };
    deviceCategory: ANVISADeviceCategory;
    deviceName: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    anvisaRegistrationNumber: string;
    intendedUse: string;
    technicalSpecifications: string;
    riskClassification: "BAIXO" | "MEDIO" | "ALTO" | "MAXIMO";
    registrationDate: Date;
    expirationDate: Date;
    nextInspectionDate: Date;
    complianceStatus: "COMPLIANT" | "NON_COMPLIANT" | "SUSPENDED" | "PENDING_REVIEW";
    qualityAssurance: {
        iso13485Certified: boolean;
        goodManufacturingPractices: boolean;
        qualityManagementSystem: boolean;
        riskManagementPlan: boolean;
    };
    clinicalUsage: {
        clinicId: string;
        responsibleProfessional: string;
        usageFrequency: "DAILY" | "WEEKLY" | "MONTHLY" | "OCCASIONAL";
        patientExposureLevel: "NONE" | "MINIMAL" | "DIRECT" | "INDIRECT";
        procedureTypes: string[];
        safetyCertifications: string[];
    };
    maintenanceSchedule: {
        preventiveMaintenance: boolean;
        calibrationRequired: boolean;
        maintenanceRecords: {
            type: string;
            date: Date;
            performedBy: string;
            notes?: string | undefined;
        }[];
        calibrationFrequency?: "QUARTERLY" | "MONTHLY" | "SEMI_ANNUAL" | "ANNUAL" | undefined;
        lastCalibrationDate?: Date | undefined;
        nextCalibrationDate?: Date | undefined;
    };
    deviceId?: string | undefined;
    lastInspectionDate?: Date | undefined;
}, {
    tenantId: string;
    constitutionalValidation: {
        validatedBy: string;
        regulatoryComplianceScore: number;
        lastValidationDate: Date;
        patientSafetyValidated?: boolean | undefined;
        medicalAccuracyConfirmed?: boolean | undefined;
    };
    deviceCategory: ANVISADeviceCategory;
    deviceName: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    anvisaRegistrationNumber: string;
    intendedUse: string;
    technicalSpecifications: string;
    riskClassification: "BAIXO" | "MEDIO" | "ALTO" | "MAXIMO";
    registrationDate: Date;
    expirationDate: Date;
    nextInspectionDate: Date;
    complianceStatus: "COMPLIANT" | "NON_COMPLIANT" | "SUSPENDED" | "PENDING_REVIEW";
    qualityAssurance: {
        iso13485Certified?: boolean | undefined;
        goodManufacturingPractices?: boolean | undefined;
        qualityManagementSystem?: boolean | undefined;
        riskManagementPlan?: boolean | undefined;
    };
    clinicalUsage: {
        clinicId: string;
        responsibleProfessional: string;
        usageFrequency: "DAILY" | "WEEKLY" | "MONTHLY" | "OCCASIONAL";
        patientExposureLevel: "NONE" | "MINIMAL" | "DIRECT" | "INDIRECT";
        procedureTypes: string[];
        safetyCertifications: string[];
    };
    maintenanceSchedule: {
        maintenanceRecords: {
            type: string;
            date: Date;
            performedBy: string;
            notes?: string | undefined;
        }[];
        preventiveMaintenance?: boolean | undefined;
        calibrationRequired?: boolean | undefined;
        calibrationFrequency?: "QUARTERLY" | "MONTHLY" | "SEMI_ANNUAL" | "ANNUAL" | undefined;
        lastCalibrationDate?: Date | undefined;
        nextCalibrationDate?: Date | undefined;
    };
    deviceId?: string | undefined;
    lastInspectionDate?: Date | undefined;
}>;
export type MedicalDeviceRegistration = z.infer<typeof MedicalDeviceRegistrationSchema>;
/**
 * Device Classification Types
 */
export type DeviceClassification = {
    classificationId: string;
    riskLevel: 'BAIXO' | 'MEDIO' | 'ALTO' | 'MAXIMO';
    category: ANVISADeviceCategory;
    regulatoryRequirements: string[];
    inspectionFrequency: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
};
/**
 * Medical Device Type
 */
export type MedicalDevice = {
    deviceId: string;
    tenantId: string;
    deviceName: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    anvisaRegistrationNumber: string;
    deviceCategory: ANVISADeviceCategory;
    riskClassification: 'BAIXO' | 'MEDIO' | 'ALTO' | 'MAXIMO';
    complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW' | 'SUSPENDED';
    registrationDate: Date;
    expirationDate: Date;
};
/**
 * Medical Device Filters
 */
export type MedicalDeviceFilters = {
    tenantId?: string;
    deviceCategory?: ANVISADeviceCategory;
    riskClassification?: 'BAIXO' | 'MEDIO' | 'ALTO' | 'MAXIMO';
    complianceStatus?: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW' | 'SUSPENDED';
    manufacturer?: string;
    registrationDateFrom?: Date;
    registrationDateTo?: Date;
    expirationDateFrom?: Date;
    expirationDateTo?: Date;
};
/**
 * Classification Level Type
 */
export type ClassificationLevel = {
    level: number;
    description: string;
    riskCategory: 'BAIXO' | 'MEDIO' | 'ALTO' | 'MAXIMO';
    regulatoryRequirements: string[];
    validationCriteria: string[];
};
/**
 * Device Compliance Monitoring Result
 */
export type DeviceComplianceResult = {
    deviceId: string;
    complianceStatus: 'FULLY_COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' | 'CRITICAL_VIOLATION';
    constitutionalCompliance: {
        patientSafetyScore: ComplianceScore;
        regulatoryComplianceScore: ComplianceScore;
        qualityAssuranceScore: ComplianceScore;
        overallScore: ComplianceScore;
    };
    complianceChecks: {
        anvisaRegistrationValid: boolean;
        qualityAssuranceCurrent: boolean;
        maintenanceUpToDate: boolean;
        calibrationCurrent: boolean;
        professionalQualificationValid: boolean;
        usageWithinSpecifications: boolean;
    };
    violations: Array<{
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        category: string;
        description: string;
        regulatoryReference: string;
        remedialAction: string;
        deadline: Date;
    }>;
    recommendations: Array<{
        priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
        category: string;
        description: string;
        implementationSuggestion: string;
        benefitDescription: string;
    }>;
    nextActions: {
        immediateActions: string[];
        shortTermActions: string[];
        longTermActions: string[];
        complianceDeadlines: Array<{
            action: string;
            deadline: Date;
        }>;
    };
    auditTrail: Array<{
        checkType: string;
        timestamp: Date;
        result: string;
        performedBy: string;
        evidence: string[];
    }>;
};
/**
 * Constitutional Medical Device Service for ANVISA Compliance
 */
export declare class MedicalDeviceService {
    /**
     * Register Medical Device with Constitutional ANVISA Compliance
     * Implements ANVISA RDC 185/2001 with constitutional healthcare validation
     */
    registerMedicalDevice(registration: MedicalDeviceRegistration): Promise<ConstitutionalResponse<MedicalDeviceRegistration>>;
    /**
     * Monitor Device Compliance with Constitutional Standards
     */
    monitorDeviceCompliance(deviceId: string, tenantId: string): Promise<ConstitutionalResponse<DeviceComplianceResult>>;
    /**
     * Validate Constitutional Healthcare Compliance for Medical Device
     */
    private validateConstitutionalCompliance;
    /**
     * Verify ANVISA Registration Status
     */
    private verifyANVISARegistration;
    /**
     * Validate Quality Assurance Requirements
     */
    private validateQualityAssurance;
    /**
     * Validate Professional Qualifications
     */
    private validateProfessionalQualifications;
    /**
     * Calculate Overall Device Compliance Score
     */
    private calculateDeviceComplianceScore;
    /**
     * Perform Comprehensive Compliance Checks
     */
    private performComplianceChecks;
    /**
     * Assess Constitutional Compliance
     */
    private assessConstitutionalCompliance;
    private storeDeviceRegistration;
    private getDeviceRegistration;
    private validateManufacturerWithANVISA;
    private checkProfessionalQualifications;
    private checkMaintenanceStatus;
    private checkCalibrationStatus;
    private checkUsageCompliance;
    private scheduleComplianceMonitoring;
    private updateDeviceComplianceStatus;
    private sendComplianceNotification;
    private sendComplianceAlert;
    private determineComplianceStatus;
    private identifyViolations;
    private generateRecommendations;
    private generateNextActions;
    private createAuditEvent;
    /**
     * Get Device Compliance Status
     */
    getDeviceComplianceStatus(deviceId: string, _tenantId: string): Promise<ConstitutionalResponse<DeviceComplianceResult | null>>;
}
