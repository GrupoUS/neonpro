/**
 * @fileoverview LGPD Breach Notification Service (Art. 48 LGPD)
 * Constitutional Brazilian Healthcare Breach Notification Implementation
 *
 * Constitutional Healthcare Principle: Patient Safety First + Immediate Transparency
 * Quality Standard: ≥9.9/10
 *
 * LGPD Article 48 - Security Incident Notification:
 * - Notification to ANPD within reasonable timeframe
 * - Notification may include risk assessment
 * - Notification to data subjects if high risk to rights and freedoms
 * - Constitutional requirement: 72 hours for healthcare data breaches
 */
import { z } from 'zod';
import type { ComplianceScore, ConstitutionalResponse } from '../types';
import { PatientDataClassification } from '../types';
/**
 * Breach Severity Classification
 */
export declare enum BreachSeverity {
    LOW = "LOW",// Minimal impact, unlikely to cause harm
    MEDIUM = "MEDIUM",// Some risk to patient rights
    HIGH = "HIGH",// Significant risk to patient rights and freedoms
    CRITICAL = "CRITICAL"
}
/**
 * Breach Category Classification
 */
export declare enum BreachCategory {
    UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",// Acesso não autorizado
    DATA_THEFT = "DATA_THEFT",// Roubo de dados
    SYSTEM_INTRUSION = "SYSTEM_INTRUSION",// Invasão de sistema
    ACCIDENTAL_DISCLOSURE = "ACCIDENTAL_DISCLOSURE",// Divulgação acidental
    DATA_CORRUPTION = "DATA_CORRUPTION",// Corrupção de dados
    RANSOMWARE_ATTACK = "RANSOMWARE_ATTACK",// Ataque de ransomware
    INSIDER_THREAT = "INSIDER_THREAT",// Ameaça interna
    VENDOR_BREACH = "VENDOR_BREACH",// Violação de fornecedor
    CONSTITUTIONAL_VIOLATION = "CONSTITUTIONAL_VIOLATION"
}
/**
 * Breach Detection Schema
 */
export declare const BreachDetectionSchema: z.ZodObject<{
    incidentId: z.ZodOptional<z.ZodString>;
    detectedAt: z.ZodDate;
    detectedBy: z.ZodString;
    detectionMethod: z.ZodEnum<["AUTOMATED_MONITORING", "MANUAL_DISCOVERY", "THIRD_PARTY_REPORT", "PATIENT_COMPLAINT", "AUDIT_FINDING", "PENETRATION_TEST"]>;
    tenantId: z.ZodString;
    affectedSystems: z.ZodArray<z.ZodString, "many">;
    breachCategory: z.ZodNativeEnum<typeof BreachCategory>;
    initialSeverity: z.ZodNativeEnum<typeof BreachSeverity>;
    dataTypesAffected: z.ZodArray<z.ZodNativeEnum<typeof PatientDataClassification>, "many">;
    estimatedAffectedRecords: z.ZodNumber;
    estimatedAffectedPatients: z.ZodNumber;
    breachDescription: z.ZodString;
    immediateActions: z.ZodArray<z.ZodString, "many">;
    containmentMeasures: z.ZodArray<z.ZodString, "many">;
    potentialImpact: z.ZodString;
    rootCause: z.ZodOptional<z.ZodString>;
    vulnerabilityExploited: z.ZodOptional<z.ZodString>;
    attackVector: z.ZodOptional<z.ZodString>;
    constitutionalViolation: z.ZodDefault<z.ZodBoolean>;
    patientSafetyRisk: z.ZodDefault<z.ZodBoolean>;
    reportingMetadata: z.ZodObject<{
        internalTeamNotified: z.ZodDefault<z.ZodBoolean>;
        dpoNotified: z.ZodDefault<z.ZodBoolean>;
        executiveTeamNotified: z.ZodDefault<z.ZodBoolean>;
        legalTeamNotified: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        internalTeamNotified: boolean;
        dpoNotified: boolean;
        executiveTeamNotified: boolean;
        legalTeamNotified: boolean;
    }, {
        internalTeamNotified?: boolean | undefined;
        dpoNotified?: boolean | undefined;
        executiveTeamNotified?: boolean | undefined;
        legalTeamNotified?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    immediateActions: string[];
    constitutionalViolation: boolean;
    detectedAt: Date;
    detectedBy: string;
    detectionMethod: "AUTOMATED_MONITORING" | "MANUAL_DISCOVERY" | "THIRD_PARTY_REPORT" | "PATIENT_COMPLAINT" | "AUDIT_FINDING" | "PENETRATION_TEST";
    affectedSystems: string[];
    breachCategory: BreachCategory;
    initialSeverity: BreachSeverity;
    dataTypesAffected: PatientDataClassification[];
    estimatedAffectedRecords: number;
    estimatedAffectedPatients: number;
    breachDescription: string;
    containmentMeasures: string[];
    potentialImpact: string;
    patientSafetyRisk: boolean;
    reportingMetadata: {
        internalTeamNotified: boolean;
        dpoNotified: boolean;
        executiveTeamNotified: boolean;
        legalTeamNotified: boolean;
    };
    incidentId?: string | undefined;
    rootCause?: string | undefined;
    vulnerabilityExploited?: string | undefined;
    attackVector?: string | undefined;
}, {
    tenantId: string;
    immediateActions: string[];
    detectedAt: Date;
    detectedBy: string;
    detectionMethod: "AUTOMATED_MONITORING" | "MANUAL_DISCOVERY" | "THIRD_PARTY_REPORT" | "PATIENT_COMPLAINT" | "AUDIT_FINDING" | "PENETRATION_TEST";
    affectedSystems: string[];
    breachCategory: BreachCategory;
    initialSeverity: BreachSeverity;
    dataTypesAffected: PatientDataClassification[];
    estimatedAffectedRecords: number;
    estimatedAffectedPatients: number;
    breachDescription: string;
    containmentMeasures: string[];
    potentialImpact: string;
    reportingMetadata: {
        internalTeamNotified?: boolean | undefined;
        dpoNotified?: boolean | undefined;
        executiveTeamNotified?: boolean | undefined;
        legalTeamNotified?: boolean | undefined;
    };
    constitutionalViolation?: boolean | undefined;
    incidentId?: string | undefined;
    rootCause?: string | undefined;
    vulnerabilityExploited?: string | undefined;
    attackVector?: string | undefined;
    patientSafetyRisk?: boolean | undefined;
}>;
export type BreachDetection = z.infer<typeof BreachDetectionSchema>;
/**
 * Breach Notification Result
 */
export type BreachNotificationResult = {
    incidentId: string;
    notificationStatus: 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'IN_PROGRESS';
    breachSeverity: BreachSeverity;
    constitutionalCompliance: {
        timelineMet: boolean;
        notificationQuality: ComplianceScore;
        patientRightsHonored: boolean;
        transparencyProvided: boolean;
        complianceScore: ComplianceScore;
    };
    anpdNotification: {
        required: boolean;
        sent: boolean;
        sentAt?: Date;
        protocolNumber?: string;
        response?: string;
    };
    patientNotifications: {
        required: boolean;
        totalPatients: number;
        notified: number;
        notificationMethods: string[];
        completedAt?: Date;
    };
    internalNotifications: {
        dpo: {
            notified: boolean;
            notifiedAt?: Date;
        };
        executive: {
            notified: boolean;
            notifiedAt?: Date;
        };
        legal: {
            notified: boolean;
            notifiedAt?: Date;
        };
        it: {
            notified: boolean;
            notifiedAt?: Date;
        };
    };
    remediation: {
        immediateActions: string[];
        longTermActions: string[];
        preventiveMeasures: string[];
        completionEstimate: Date;
    };
    timeline: {
        detectedAt: Date;
        containedAt?: Date;
        assessedAt?: Date;
        notificationsStartedAt?: Date;
        notificationsCompletedAt?: Date;
        totalHours: number;
    };
    auditTrail: Array<{
        action: string;
        timestamp: Date;
        performedBy: string;
        details: string;
        complianceImpact: string[];
    }>;
};
/**
 * Constitutional Breach Notification Service for Healthcare LGPD Compliance
 */
export declare class BreachNotificationService {
    private readonly constitutionalQualityStandard;
    private readonly constitutionalTimelineHours;
    /**
     * Process Breach Detection and Initiate Constitutional Notification
     * Implements LGPD Art. 48 with constitutional healthcare validation
     */
    processBreachDetection(detection: BreachDetection): Promise<ConstitutionalResponse<BreachNotificationResult>>;
    /**
     * Assess Constitutional Severity with Healthcare Context
     */
    private assessConstitutionalSeverity; /**
     * Execute Constitutional Notification Workflow
     */
    private executeConstitutionalNotification;
    /**
     * Execute Internal Notifications (Immediate Constitutional Requirement)
     */
    private executeInternalNotifications;
    /**
     * Notify ANPD (Brazilian Data Protection Authority)
     */
    private notifyANPD;
    /**
     * Notify Affected Patients (Constitutional Transparency Mandate)
     */
    private notifyAffectedPatients;
    /**
     * Assess Constitutional Compliance
     */
    private assessConstitutionalCompliance;
    private validateImmediateContainment;
    private monitorConstitutionalTimeline;
    private initiateRemediationMeasures;
    private escalateToEmergencyResponse;
    private notifyDPO;
    private notifyExecutiveTeam;
    private notifyLegalTeam;
    private notifyITTeam;
    private submitToANPD;
    private getAffectedPatients;
    private createPatientNotification;
    private sendPatientNotification;
    private notifyHealthcareAuthorities;
    private createAuditEvent;
    /**
     * Get Breach Notification Status
     */
    getBreachNotificationStatus(incidentId: string, _tenantId: string): Promise<ConstitutionalResponse<BreachNotificationResult | null>>;
}
