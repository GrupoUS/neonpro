/**
 * @fileoverview LGPD Data Erasure Service (Right to Erasure - Art. 18 LGPD)
 * Constitutional Brazilian Healthcare Data Erasure Implementation
 *
 * Constitutional Healthcare Principle: Patient Privacy First + Right to be Forgotten
 * Quality Standard: ≥9.9/10
 *
 * LGPD Article 18 - Data Subject Rights:
 * - Right to confirmation of processing
 * - Right to access data
 * - Right to rectification
 * - Right to anonymization, blocking or erasure
 * - Right to data portability
 * - Right to information about sharing
 * - Right to information about consent refusal consequences
 * - Right to revoke consent
 */
import { z } from 'zod';
import type { ComplianceScore, ConstitutionalResponse } from '../types';
import { PatientDataClassification } from '../types';
/**
 * Data Erasure Request Schema
 */
export declare const DataErasureRequestSchema: z.ZodObject<{
    requestId: z.ZodOptional<z.ZodString>;
    patientId: z.ZodString;
    tenantId: z.ZodString;
    requestType: z.ZodEnum<["FULL_ERASURE", "PARTIAL_ERASURE", "ANONYMIZATION", "PSEUDONYMIZATION", "BLOCKING"]>;
    dataCategories: z.ZodArray<z.ZodNativeEnum<typeof PatientDataClassification>, "many">;
    erasureReason: z.ZodEnum<["CONSENT_WITHDRAWN", "PURPOSE_FULFILLED", "UNLAWFUL_PROCESSING", "DATA_INACCURACY", "PATIENT_REQUEST", "LEGAL_OBLIGATION", "CONSTITUTIONAL_VIOLATION"]>;
    urgency: z.ZodEnum<["NORMAL", "HIGH", "CRITICAL"]>;
    retainForLegal: z.ZodDefault<z.ZodBoolean>;
    legalRetentionReason: z.ZodOptional<z.ZodString>;
    requestedBy: z.ZodString;
    requestedAt: z.ZodDate;
    patientConfirmation: z.ZodDefault<z.ZodBoolean>;
    guardianConsent: z.ZodDefault<z.ZodBoolean>;
    accessibilityRequirements: z.ZodOptional<z.ZodObject<{
        confirmationMethod: z.ZodEnum<["EMAIL", "SMS", "MAIL", "IN_PERSON", "ACCESSIBLE_INTERFACE"]>;
        languagePreference: z.ZodDefault<z.ZodEnum<["pt-BR", "en-US"]>>;
        specialNeeds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        confirmationMethod: "EMAIL" | "IN_PERSON" | "ACCESSIBLE_INTERFACE" | "SMS" | "MAIL";
        languagePreference: "pt-BR" | "en-US";
        specialNeeds?: string[] | undefined;
    }, {
        confirmationMethod: "EMAIL" | "IN_PERSON" | "ACCESSIBLE_INTERFACE" | "SMS" | "MAIL";
        languagePreference?: "pt-BR" | "en-US" | undefined;
        specialNeeds?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    tenantId: string;
    urgency: "HIGH" | "CRITICAL" | "NORMAL";
    dataCategories: PatientDataClassification[];
    requestedBy: string;
    requestType: "FULL_ERASURE" | "PARTIAL_ERASURE" | "ANONYMIZATION" | "PSEUDONYMIZATION" | "BLOCKING";
    erasureReason: "CONSTITUTIONAL_VIOLATION" | "LEGAL_OBLIGATION" | "PATIENT_REQUEST" | "CONSENT_WITHDRAWN" | "PURPOSE_FULFILLED" | "UNLAWFUL_PROCESSING" | "DATA_INACCURACY";
    retainForLegal: boolean;
    requestedAt: Date;
    patientConfirmation: boolean;
    guardianConsent: boolean;
    accessibilityRequirements?: {
        confirmationMethod: "EMAIL" | "IN_PERSON" | "ACCESSIBLE_INTERFACE" | "SMS" | "MAIL";
        languagePreference: "pt-BR" | "en-US";
        specialNeeds?: string[] | undefined;
    } | undefined;
    requestId?: string | undefined;
    legalRetentionReason?: string | undefined;
}, {
    patientId: string;
    tenantId: string;
    urgency: "HIGH" | "CRITICAL" | "NORMAL";
    dataCategories: PatientDataClassification[];
    requestedBy: string;
    requestType: "FULL_ERASURE" | "PARTIAL_ERASURE" | "ANONYMIZATION" | "PSEUDONYMIZATION" | "BLOCKING";
    erasureReason: "CONSTITUTIONAL_VIOLATION" | "LEGAL_OBLIGATION" | "PATIENT_REQUEST" | "CONSENT_WITHDRAWN" | "PURPOSE_FULFILLED" | "UNLAWFUL_PROCESSING" | "DATA_INACCURACY";
    requestedAt: Date;
    accessibilityRequirements?: {
        confirmationMethod: "EMAIL" | "IN_PERSON" | "ACCESSIBLE_INTERFACE" | "SMS" | "MAIL";
        languagePreference?: "pt-BR" | "en-US" | undefined;
        specialNeeds?: string[] | undefined;
    } | undefined;
    requestId?: string | undefined;
    retainForLegal?: boolean | undefined;
    legalRetentionReason?: string | undefined;
    patientConfirmation?: boolean | undefined;
    guardianConsent?: boolean | undefined;
}>;
export type DataErasureRequest = z.infer<typeof DataErasureRequestSchema>;
/**
 * Erasure Execution Result
 */
export type ErasureResult = {
    requestId: string;
    status: 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'BLOCKED';
    dataErased: {
        tables: string[];
        records: number;
        dataTypes: PatientDataClassification[];
    };
    dataRetained: {
        reason: string;
        tables: string[];
        records: number;
        legalBasis: string[];
    };
    anonymizationApplied: boolean;
    pseudonymizationApplied: boolean;
    constitutionalCompliance: {
        patientRightsHonored: boolean;
        medicalRecordsHandling: 'ERASED' | 'ANONYMIZED' | 'RETAINED';
        legalRetentionJustified: boolean;
        complianceScore: ComplianceScore;
    };
    executionTime: {
        startedAt: Date;
        completedAt: Date;
        durationMs: number;
    };
    auditTrail: Array<{
        action: string;
        timestamp: Date;
        details: string;
        affectedRecords: number;
    }>;
};
/**
 * Constitutional Data Erasure Service for Healthcare LGPD Compliance
 */
export declare class DataErasureService {
    /**
     * Process Data Erasure Request
     * Implements LGPD Art. 18 with constitutional healthcare validation
     */
    processErasureRequest(request: DataErasureRequest): Promise<ConstitutionalResponse<ErasureResult>>;
    /**
     * Validate Constitutional Healthcare Erasure Requirements
     */
    private validateConstitutionalErasure; /**
     * Analyze Data Dependencies and Legal Retention Requirements
     */
    private analyzeDataDependencies;
    /**
     * Execute Constitutional Erasure with Healthcare Compliance
     */
    private executeConstitutionalErasure;
    /**
     * Calculate Constitutional Compliance Score for Erasure
     */
    private calculateErasureComplianceScore;
    private deletePatientData;
    private anonymizePatientData;
    private pseudonymizePatientData;
    private blockPatientData;
    private partialDeletePatientData;
    private countPatientDataRecords;
    private handleMedicalRecordsErasure;
    private requestPatientConfirmation;
    private checkMedicalRetentionRequirements;
    private validateErasureCompletion;
    private sendErasureCompletionNotification;
    private createAuditEvent;
    /**
     * Get Erasure Request Status
     */
    getErasureStatus(requestId: string, _tenantId: string): Promise<ConstitutionalResponse<ErasureResult | null>>;
}
