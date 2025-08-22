/**
 * @fileoverview ANVISA Adverse Event Auto-Reporting Service
 * Constitutional Brazilian Healthcare Adverse Event Management
 *
 * Constitutional Healthcare Principle: Patient Safety First + Immediate Response
 * Quality Standard: ≥9.9/10
 *
 * ANVISA Requirements:
 * - Immediate notification for death/life-threatening events (1-24 hours)
 * - Regular notification for serious events (15 days)
 * - Periodic reports for all events (quarterly)
 * - Constitutional healthcare: All events require immediate assessment
 */
import { z } from 'zod';
import { AdverseEventType, type ComplianceScore, type ConstitutionalResponse } from '../types';
/**
 * ANVISA Device Categories
 */
export declare enum ANVISADeviceCategory {
    CLASS_I = "CLASS_I",
    CLASS_II = "CLASS_II",
    CLASS_III = "CLASS_III",
    CLASS_IV = "CLASS_IV",
    IMPLANTABLE = "IMPLANTABLE",
    DIAGNOSTIC = "DIAGNOSTIC",
    THERAPEUTIC = "THERAPEUTIC",
    SURGICAL = "SURGICAL"
}
/**
 * Adverse Event Report Schema
 */
export declare const AdverseEventReportSchema: z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodString;
    patientId: z.ZodString;
    deviceId: z.ZodOptional<z.ZodString>;
    procedureId: z.ZodOptional<z.ZodString>;
    professionalId: z.ZodString;
    eventType: z.ZodNativeEnum<typeof AdverseEventType>;
    eventDate: z.ZodDate;
    reportDate: z.ZodDate;
    eventDescription: z.ZodString;
    clinicalContext: z.ZodObject<{
        patientAge: z.ZodNumber;
        patientGender: z.ZodEnum<["M", "F", "OTHER", "NOT_DISCLOSED"]>;
        medicalHistory: z.ZodOptional<z.ZodString>;
        medicationsInUse: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        allergies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        preExistingConditions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        patientAge: number;
        patientGender: "M" | "F" | "OTHER" | "NOT_DISCLOSED";
        medicalHistory?: string | undefined;
        medicationsInUse?: string[] | undefined;
        allergies?: string[] | undefined;
        preExistingConditions?: string[] | undefined;
    }, {
        patientAge: number;
        patientGender: "M" | "F" | "OTHER" | "NOT_DISCLOSED";
        medicalHistory?: string | undefined;
        medicationsInUse?: string[] | undefined;
        allergies?: string[] | undefined;
        preExistingConditions?: string[] | undefined;
    }>;
    deviceInformation: z.ZodOptional<z.ZodObject<{
        deviceName: z.ZodOptional<z.ZodString>;
        manufacturer: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
        serialNumber: z.ZodOptional<z.ZodString>;
        anvisaRegistrationNumber: z.ZodOptional<z.ZodString>;
        deviceCategory: z.ZodOptional<z.ZodNativeEnum<typeof ANVISADeviceCategory>>;
        lastMaintenanceDate: z.ZodOptional<z.ZodDate>;
        deviceAge: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        deviceCategory?: ANVISADeviceCategory | undefined;
        deviceName?: string | undefined;
        manufacturer?: string | undefined;
        model?: string | undefined;
        serialNumber?: string | undefined;
        anvisaRegistrationNumber?: string | undefined;
        lastMaintenanceDate?: Date | undefined;
        deviceAge?: number | undefined;
    }, {
        deviceCategory?: ANVISADeviceCategory | undefined;
        deviceName?: string | undefined;
        manufacturer?: string | undefined;
        model?: string | undefined;
        serialNumber?: string | undefined;
        anvisaRegistrationNumber?: string | undefined;
        lastMaintenanceDate?: Date | undefined;
        deviceAge?: number | undefined;
    }>>;
    procedureInformation: z.ZodOptional<z.ZodObject<{
        procedureName: z.ZodString;
        procedureType: z.ZodString;
        anesthesiaUsed: z.ZodDefault<z.ZodBoolean>;
        anesthesiaType: z.ZodOptional<z.ZodString>;
        procedureDuration: z.ZodOptional<z.ZodNumber>;
        complications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        procedureName: string;
        procedureType: string;
        anesthesiaUsed: boolean;
        anesthesiaType?: string | undefined;
        procedureDuration?: number | undefined;
        complications?: string[] | undefined;
    }, {
        procedureName: string;
        procedureType: string;
        anesthesiaUsed?: boolean | undefined;
        anesthesiaType?: string | undefined;
        procedureDuration?: number | undefined;
        complications?: string[] | undefined;
    }>>;
    eventSeverity: z.ZodEnum<["MILD", "MODERATE", "SEVERE", "LIFE_THREATENING", "DEATH"]>;
    immediateActions: z.ZodArray<z.ZodString, "many">;
    clinicalOutcome: z.ZodEnum<["RESOLVED", "IMPROVED", "UNCHANGED", "WORSENED", "DEATH", "UNKNOWN"]>;
    followUpRequired: z.ZodDefault<z.ZodBoolean>;
    followUpPlan: z.ZodOptional<z.ZodString>;
    reportingSource: z.ZodEnum<["HEALTHCARE_PROFESSIONAL", "PATIENT", "FAMILY", "INSTITUTION", "MANUFACTURER"]>;
    reporterInformation: z.ZodObject<{
        name: z.ZodString;
        professionalRegistration: z.ZodOptional<z.ZodString>;
        contact: z.ZodString;
        institution: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        contact: string;
        institution: string;
        professionalRegistration?: string | undefined;
    }, {
        name: string;
        contact: string;
        institution: string;
        professionalRegistration?: string | undefined;
    }>;
    constitutionalAssessment: z.ZodObject<{
        patientSafetyImpact: z.ZodEnum<["NONE", "MINIMAL", "MODERATE", "SIGNIFICANT", "CRITICAL"]>;
        constitutionalViolation: z.ZodDefault<z.ZodBoolean>;
        immediateResponseRequired: z.ZodDefault<z.ZodBoolean>;
        regulatoryNotificationRequired: z.ZodDefault<z.ZodBoolean>;
        publicHealthImpact: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        patientSafetyImpact: "CRITICAL" | "MODERATE" | "NONE" | "MINIMAL" | "SIGNIFICANT";
        constitutionalViolation: boolean;
        immediateResponseRequired: boolean;
        regulatoryNotificationRequired: boolean;
        publicHealthImpact: boolean;
    }, {
        patientSafetyImpact: "CRITICAL" | "MODERATE" | "NONE" | "MINIMAL" | "SIGNIFICANT";
        constitutionalViolation?: boolean | undefined;
        immediateResponseRequired?: boolean | undefined;
        regulatoryNotificationRequired?: boolean | undefined;
        publicHealthImpact?: boolean | undefined;
    }>;
    anvisaReporting: z.ZodObject<{
        reportingTimeline: z.ZodEnum<["IMMEDIATE", "URGENT_24H", "REGULAR_15D", "QUARTERLY"]>;
        anvisaNotified: z.ZodDefault<z.ZodBoolean>;
        anvisaProtocol: z.ZodOptional<z.ZodString>;
        anvisaResponse: z.ZodOptional<z.ZodString>;
        notificationDate: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        anvisaNotified: boolean;
        reportingTimeline: "IMMEDIATE" | "URGENT_24H" | "REGULAR_15D" | "QUARTERLY";
        anvisaProtocol?: string | undefined;
        anvisaResponse?: string | undefined;
        notificationDate?: Date | undefined;
    }, {
        reportingTimeline: "IMMEDIATE" | "URGENT_24H" | "REGULAR_15D" | "QUARTERLY";
        anvisaNotified?: boolean | undefined;
        anvisaProtocol?: string | undefined;
        anvisaResponse?: string | undefined;
        notificationDate?: Date | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventType: AdverseEventType;
    patientId: string;
    tenantId: string;
    followUpRequired: boolean;
    professionalId: string;
    eventDate: Date;
    reportDate: Date;
    eventDescription: string;
    clinicalContext: {
        patientAge: number;
        patientGender: "M" | "F" | "OTHER" | "NOT_DISCLOSED";
        medicalHistory?: string | undefined;
        medicationsInUse?: string[] | undefined;
        allergies?: string[] | undefined;
        preExistingConditions?: string[] | undefined;
    };
    eventSeverity: "MILD" | "MODERATE" | "SEVERE" | "LIFE_THREATENING" | "DEATH";
    immediateActions: string[];
    clinicalOutcome: "RESOLVED" | "DEATH" | "IMPROVED" | "UNCHANGED" | "WORSENED" | "UNKNOWN";
    reportingSource: "HEALTHCARE_PROFESSIONAL" | "PATIENT" | "FAMILY" | "INSTITUTION" | "MANUFACTURER";
    reporterInformation: {
        name: string;
        contact: string;
        institution: string;
        professionalRegistration?: string | undefined;
    };
    constitutionalAssessment: {
        patientSafetyImpact: "CRITICAL" | "MODERATE" | "NONE" | "MINIMAL" | "SIGNIFICANT";
        constitutionalViolation: boolean;
        immediateResponseRequired: boolean;
        regulatoryNotificationRequired: boolean;
        publicHealthImpact: boolean;
    };
    anvisaReporting: {
        anvisaNotified: boolean;
        reportingTimeline: "IMMEDIATE" | "URGENT_24H" | "REGULAR_15D" | "QUARTERLY";
        anvisaProtocol?: string | undefined;
        anvisaResponse?: string | undefined;
        notificationDate?: Date | undefined;
    };
    deviceId?: string | undefined;
    procedureId?: string | undefined;
    eventId?: string | undefined;
    deviceInformation?: {
        deviceCategory?: ANVISADeviceCategory | undefined;
        deviceName?: string | undefined;
        manufacturer?: string | undefined;
        model?: string | undefined;
        serialNumber?: string | undefined;
        anvisaRegistrationNumber?: string | undefined;
        lastMaintenanceDate?: Date | undefined;
        deviceAge?: number | undefined;
    } | undefined;
    procedureInformation?: {
        procedureName: string;
        procedureType: string;
        anesthesiaUsed: boolean;
        anesthesiaType?: string | undefined;
        procedureDuration?: number | undefined;
        complications?: string[] | undefined;
    } | undefined;
    followUpPlan?: string | undefined;
}, {
    eventType: AdverseEventType;
    patientId: string;
    tenantId: string;
    professionalId: string;
    eventDate: Date;
    reportDate: Date;
    eventDescription: string;
    clinicalContext: {
        patientAge: number;
        patientGender: "M" | "F" | "OTHER" | "NOT_DISCLOSED";
        medicalHistory?: string | undefined;
        medicationsInUse?: string[] | undefined;
        allergies?: string[] | undefined;
        preExistingConditions?: string[] | undefined;
    };
    eventSeverity: "MILD" | "MODERATE" | "SEVERE" | "LIFE_THREATENING" | "DEATH";
    immediateActions: string[];
    clinicalOutcome: "RESOLVED" | "DEATH" | "IMPROVED" | "UNCHANGED" | "WORSENED" | "UNKNOWN";
    reportingSource: "HEALTHCARE_PROFESSIONAL" | "PATIENT" | "FAMILY" | "INSTITUTION" | "MANUFACTURER";
    reporterInformation: {
        name: string;
        contact: string;
        institution: string;
        professionalRegistration?: string | undefined;
    };
    constitutionalAssessment: {
        patientSafetyImpact: "CRITICAL" | "MODERATE" | "NONE" | "MINIMAL" | "SIGNIFICANT";
        constitutionalViolation?: boolean | undefined;
        immediateResponseRequired?: boolean | undefined;
        regulatoryNotificationRequired?: boolean | undefined;
        publicHealthImpact?: boolean | undefined;
    };
    anvisaReporting: {
        reportingTimeline: "IMMEDIATE" | "URGENT_24H" | "REGULAR_15D" | "QUARTERLY";
        anvisaNotified?: boolean | undefined;
        anvisaProtocol?: string | undefined;
        anvisaResponse?: string | undefined;
        notificationDate?: Date | undefined;
    };
    deviceId?: string | undefined;
    procedureId?: string | undefined;
    followUpRequired?: boolean | undefined;
    eventId?: string | undefined;
    deviceInformation?: {
        deviceCategory?: ANVISADeviceCategory | undefined;
        deviceName?: string | undefined;
        manufacturer?: string | undefined;
        model?: string | undefined;
        serialNumber?: string | undefined;
        anvisaRegistrationNumber?: string | undefined;
        lastMaintenanceDate?: Date | undefined;
        deviceAge?: number | undefined;
    } | undefined;
    procedureInformation?: {
        procedureName: string;
        procedureType: string;
        anesthesiaUsed?: boolean | undefined;
        anesthesiaType?: string | undefined;
        procedureDuration?: number | undefined;
        complications?: string[] | undefined;
    } | undefined;
    followUpPlan?: string | undefined;
}>;
export type AdverseEventReport = z.infer<typeof AdverseEventReportSchema>;
/**
 * Adverse Event Severity Levels
 */
export declare enum AdverseEventSeverity {
    MILD = "MILD",
    MODERATE = "MODERATE",
    SEVERE = "SEVERE",
    LIFE_THREATENING = "LIFE_THREATENING",
    DEATH = "DEATH"
}
/**
 * Adverse Event Base Type
 */
export type AdverseEvent = {
    id: string;
    tenantId: string;
    patientId: string;
    eventType: AdverseEventType;
    severity: AdverseEventSeverity;
    description: string;
    reportedAt: Date;
    reportedBy: string;
    anvisaNotified: boolean;
    status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
};
/**
 * Adverse Event Filters
 */
export type AdverseEventFilters = {
    tenantId?: string;
    severity?: AdverseEventSeverity;
    eventType?: AdverseEventType;
    dateFrom?: Date;
    dateTo?: Date;
    anvisaNotified?: boolean;
    status?: AdverseEvent['status'];
};
/**
 * Event Classification Result
 */
export type EventClassificationResult = {
    eventId: string;
    severity: AdverseEventType;
    urgency: 'IMMEDIATE' | 'URGENT' | 'STANDARD' | 'ROUTINE';
    notificationTimeline: {
        anvisaDeadline: Date;
        internalDeadline: Date;
        patientNotificationDeadline: Date;
        familyNotificationDeadline?: Date;
    };
    requiredActions: {
        immediateActions: string[];
        investigationRequired: boolean;
        deviceQuarantine: boolean;
        procedureSuspension: boolean;
        staffRetraining: boolean;
        anvisaNotification: boolean;
        patientFollowUp: boolean;
    };
    constitutionalCompliance: {
        patientRightsProtected: boolean;
        medicalEthicsCompliant: boolean;
        transparencyRequired: boolean;
        complianceScore: ComplianceScore;
    };
    reportingRequirements: {
        anvisaReport: boolean;
        internalReport: boolean;
        ethicsCommitteeReport: boolean;
        institutionalReport: boolean;
        manufacturerNotification: boolean;
    };
};
/**
 * Constitutional Adverse Event Service for ANVISA Compliance
 */
export declare class AdverseEventService {
    /**
     * Report Adverse Event with Constitutional Healthcare Validation
     * Implements ANVISA requirements with constitutional patient safety protocols
     */
    reportAdverseEvent(report: AdverseEventReport): Promise<ConstitutionalResponse<EventClassificationResult>>;
    /**
     * Validate Constitutional Healthcare Requirements for Adverse Events
     */
    private validateConstitutionalRequirements;
    /**
     * Classify Adverse Event with Constitutional Healthcare Context
     */
    private classifyAdverseEvent; /**
     * Calculate Constitutional Compliance Score for Adverse Event
     */
    private calculateConstitutionalComplianceScore;
    /**
     * Execute Immediate Response for Critical Events
     */
    private executeImmediateResponse;
    /**
     * Execute Constitutional Notification Workflow
     */
    private executeConstitutionalNotification;
    /**
     * Submit to ANVISA
     */
    private submitToANVISA;
    private getANVISADeadlineHours;
    private getInternalDeadlineMinutes;
    private getPatientNotificationHours;
    private storeAdverseEventReport;
    private alertMedicalDirector;
    private quarantineDevice;
    private suspendProcedure;
    private escalatePatientCare;
    private notifyInternalTeams;
    private notifyPatientAndFamily;
    private notifyResponsibleProfessional;
    private notifyEthicsCommittee;
    private submitToANVISAPortal;
    private updateReportWithANVISAProtocol;
    private scheduleFollowUpActions;
    private sendReportingCompletionNotification;
    private createAuditEvent;
    /**
     * Get Adverse Event Status
     */
    getAdverseEventStatus(eventId: string, _tenantId: string): Promise<ConstitutionalResponse<EventClassificationResult | null>>;
}
