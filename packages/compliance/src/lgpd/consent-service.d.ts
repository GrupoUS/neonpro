/**
 * @fileoverview LGPD Consent Lifecycle Management Service
 * Constitutional Brazilian Healthcare Consent Management (LGPD Art. 8º, 9º, 11º)
 *
 * Constitutional Healthcare Principle: Patient Privacy First + Informed Consent
 * Quality Standard: ≥9.9/10
 */
import { z } from 'zod';
import type { Consent, ConstitutionalResponse } from '../types';
import { LGPDLegalBasis, PatientDataClassification } from '../types';
/**
 * Consent Request Schema with Constitutional Validation
 */
export declare const ConsentRequestSchema: z.ZodObject<{
    patientId: z.ZodString;
    tenantId: z.ZodString;
    consentType: z.ZodNativeEnum<typeof PatientDataClassification>;
    legalBasis: z.ZodNativeEnum<typeof LGPDLegalBasis>;
    purpose: z.ZodString;
    dataCategories: z.ZodArray<z.ZodString, "many">;
    processingActivities: z.ZodArray<z.ZodString, "many">;
    retentionPeriod: z.ZodNumber;
    thirdPartySharing: z.ZodDefault<z.ZodBoolean>;
    thirdParties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    automatedDecisionMaking: z.ZodDefault<z.ZodBoolean>;
    requestedBy: z.ZodString;
    locale: z.ZodDefault<z.ZodEnum<["pt-BR", "en-US"]>>;
    accessibilityRequirements: z.ZodOptional<z.ZodObject<{
        screenReader: z.ZodDefault<z.ZodBoolean>;
        largeText: z.ZodDefault<z.ZodBoolean>;
        highContrast: z.ZodDefault<z.ZodBoolean>;
        audioConsent: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        screenReader: boolean;
        largeText: boolean;
        highContrast: boolean;
        audioConsent: boolean;
    }, {
        screenReader?: boolean | undefined;
        largeText?: boolean | undefined;
        highContrast?: boolean | undefined;
        audioConsent?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    tenantId: string;
    consentType: PatientDataClassification;
    legalBasis: LGPDLegalBasis;
    purpose: string;
    dataCategories: string[];
    processingActivities: string[];
    retentionPeriod: number;
    thirdPartySharing: boolean;
    automatedDecisionMaking: boolean;
    requestedBy: string;
    locale: "pt-BR" | "en-US";
    thirdParties?: string[] | undefined;
    accessibilityRequirements?: {
        screenReader: boolean;
        largeText: boolean;
        highContrast: boolean;
        audioConsent: boolean;
    } | undefined;
}, {
    patientId: string;
    tenantId: string;
    consentType: PatientDataClassification;
    legalBasis: LGPDLegalBasis;
    purpose: string;
    dataCategories: string[];
    processingActivities: string[];
    retentionPeriod: number;
    requestedBy: string;
    thirdPartySharing?: boolean | undefined;
    thirdParties?: string[] | undefined;
    automatedDecisionMaking?: boolean | undefined;
    locale?: "pt-BR" | "en-US" | undefined;
    accessibilityRequirements?: {
        screenReader?: boolean | undefined;
        largeText?: boolean | undefined;
        highContrast?: boolean | undefined;
        audioConsent?: boolean | undefined;
    } | undefined;
}>;
export type ConsentRequest = z.infer<typeof ConsentRequestSchema>;
/**
 * Consent Withdrawal Schema
 */
export declare const ConsentWithdrawalSchema: z.ZodObject<{
    consentId: z.ZodString;
    patientId: z.ZodString;
    tenantId: z.ZodString;
    withdrawalReason: z.ZodEnum<["PATIENT_REQUEST", "DATA_BREACH", "PURPOSE_CHANGE", "RETENTION_EXPIRED", "LEGAL_REQUIREMENT", "CONSTITUTIONAL_VIOLATION"]>;
    withdrawalDetails: z.ZodOptional<z.ZodString>;
    withdrawnBy: z.ZodString;
    immediateEffect: z.ZodDefault<z.ZodBoolean>;
    dataErasureRequested: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    tenantId: string;
    consentId: string;
    withdrawalReason: "CONSTITUTIONAL_VIOLATION" | "PATIENT_REQUEST" | "DATA_BREACH" | "PURPOSE_CHANGE" | "RETENTION_EXPIRED" | "LEGAL_REQUIREMENT";
    withdrawnBy: string;
    immediateEffect: boolean;
    dataErasureRequested: boolean;
    withdrawalDetails?: string | undefined;
}, {
    patientId: string;
    tenantId: string;
    consentId: string;
    withdrawalReason: "CONSTITUTIONAL_VIOLATION" | "PATIENT_REQUEST" | "DATA_BREACH" | "PURPOSE_CHANGE" | "RETENTION_EXPIRED" | "LEGAL_REQUIREMENT";
    withdrawnBy: string;
    withdrawalDetails?: string | undefined;
    immediateEffect?: boolean | undefined;
    dataErasureRequested?: boolean | undefined;
}>;
export type ConsentWithdrawal = z.infer<typeof ConsentWithdrawalSchema>;
/**
 * Constitutional Consent Service for Healthcare LGPD Compliance
 */
export declare class ConsentService {
    private readonly consentExpiryMonths;
    /**
     * Request Constitutional Healthcare Consent
     * Implements LGPD Art. 8º and 9º with constitutional healthcare validation
     */
    requestConsent(request: ConsentRequest): Promise<ConstitutionalResponse<Consent>>;
    /**
     * Grant Consent (Patient Confirmation)
     * Constitutional healthcare consent confirmation with accessibility support
     */
    grantConsent(consentId: string, patientId: string, tenantId: string, confirmationMethod: 'WEB' | 'MOBILE' | 'PHONE' | 'IN_PERSON' | 'ACCESSIBLE_INTERFACE', biometricConfirmation?: string): Promise<ConstitutionalResponse<Consent>>; /**
     * Withdraw Consent (LGPD Art. 8º § 5º)
     * Constitutional right to withdraw consent with immediate effect
     */
    withdrawConsent(withdrawal: ConsentWithdrawal): Promise<ConstitutionalResponse<Consent>>;
    /**
     * Get Patient Consent Status
     * Constitutional transparency mandate - patients can access their consent status
     */
    getPatientConsentStatus(patientId: string, tenantId: string): Promise<ConstitutionalResponse<Consent[]>>;
    /**
     * Validate constitutional healthcare requirements for consent
     */
    private validateConstitutionalRequirements;
    /**
     * Generate accessibility-compliant consent terms
     */
    private generateConsentTerms;
    /**
     * Validate consent grant process
     */
    private validateConsentGrant;
    /**
     * Database and external service methods (stubs for now)
     */
    private storeConsentRequest;
    private getConsentRecord;
    private updateConsentRecord;
    private getPatientConsents;
    private ceaseDataProcessing;
    private triggerDataErasure;
    private sendConsentNotification;
    private sendConsentConfirmation;
    private sendWithdrawalConfirmation;
    private validateConsentWithdrawal;
    private createAuditEvent;
}
