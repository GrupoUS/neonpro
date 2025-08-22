import { z } from 'zod';
/**
 * LGPD (Lei Geral de Proteção de Dados) Compliance Service
 * Implements automated compliance workflows for Brazilian data protection law
 *
 * Features:
 * - Consent management with granular tracking
 * - Data subject rights automation (access, rectification, erasure, portability)
 * - Privacy impact assessments
 * - Breach notification automation
 * - Data retention policy enforcement
 */
/**
 * LGPD lawful basis for data processing
 */
export declare enum LgpdLawfulBasis {
    CONSENT = "consent",
    CONTRACT = "contract",
    LEGAL_OBLIGATION = "legal_obligation",
    VITAL_INTERESTS = "vital_interests",
    PUBLIC_TASK = "public_task",
    LEGITIMATE_INTERESTS = "legitimate_interests"
}
/**
 * Data processing purposes
 */
export declare enum DataProcessingPurpose {
    MEDICAL_TREATMENT = "medical_treatment",
    APPOINTMENT_SCHEDULING = "appointment_scheduling",
    BILLING = "billing",
    MARKETING = "marketing",
    RESEARCH = "research",
    LEGAL_COMPLIANCE = "legal_compliance",
    SECURITY = "security"
}
/**
 * Data categories for processing
 */
export declare enum DataCategory {
    PERSONAL = "personal",// Name, email, phone
    HEALTH = "health",// Medical records, health data
    FINANCIAL = "financial",// Payment info, billing
    BEHAVIORAL = "behavioral",// Usage patterns, preferences
    SENSITIVE = "sensitive",// Special categories (health, ethnicity, etc.)
    BIOMETRIC = "biometric"
}
/**
 * Data subject rights under LGPD
 */
export declare enum DataSubjectRight {
    ACCESS = "access",// Art. 18, I - Access to personal data
    RECTIFICATION = "rectification",// Art. 18, III - Rectification of data
    ERASURE = "erasure",// Art. 18, II - Deletion of data
    PORTABILITY = "portability",// Art. 18, V - Data portability
    OBJECTION = "objection",// Art. 18, § 2º - Object to processing
    RESTRICTION = "restriction",// Art. 18, IV - Restrict processing
    INFORMATION = "information"
}
/**
 * Consent record schema
 */
export declare const consentSchema: z.ZodObject<{
    userId: z.ZodString;
    purpose: z.ZodNativeEnum<typeof DataProcessingPurpose>;
    lawfulBasis: z.ZodNativeEnum<typeof LgpdLawfulBasis>;
    dataCategories: z.ZodArray<z.ZodNativeEnum<typeof DataCategory>, "many">;
    consentText: z.ZodString;
    version: z.ZodDefault<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
    retentionPeriod: z.ZodNumber;
    canWithdraw: z.ZodDefault<z.ZodBoolean>;
    granularConsent: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
    thirdPartySharing: z.ZodDefault<z.ZodBoolean>;
    internationalTransfer: z.ZodDefault<z.ZodBoolean>;
    automatedDecisionMaking: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    version: string;
    purpose: DataProcessingPurpose;
    userId: string;
    lawfulBasis: LgpdLawfulBasis;
    dataCategories: DataCategory[];
    consentText: string;
    language: string;
    retentionPeriod: number;
    canWithdraw: boolean;
    thirdPartySharing: boolean;
    internationalTransfer: boolean;
    automatedDecisionMaking: boolean;
    granularConsent?: Record<string, boolean> | undefined;
}, {
    purpose: DataProcessingPurpose;
    userId: string;
    lawfulBasis: LgpdLawfulBasis;
    dataCategories: DataCategory[];
    consentText: string;
    retentionPeriod: number;
    version?: string | undefined;
    language?: string | undefined;
    canWithdraw?: boolean | undefined;
    granularConsent?: Record<string, boolean> | undefined;
    thirdPartySharing?: boolean | undefined;
    internationalTransfer?: boolean | undefined;
    automatedDecisionMaking?: boolean | undefined;
}>;
/**
 * Data subject request schema
 */
export declare const dataSubjectRequestSchema: z.ZodObject<{
    userId: z.ZodString;
    requestType: z.ZodNativeEnum<typeof DataSubjectRight>;
    description: z.ZodString;
    preferredFormat: z.ZodDefault<z.ZodEnum<["json", "pdf", "csv"]>>;
    deliveryMethod: z.ZodDefault<z.ZodEnum<["email", "download", "postal"]>>;
    specificData: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    verificationMethod: z.ZodDefault<z.ZodEnum<["email", "sms", "in_person"]>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    userId: string;
    requestType: DataSubjectRight;
    preferredFormat: "json" | "pdf" | "csv";
    deliveryMethod: "email" | "download" | "postal";
    verificationMethod: "email" | "sms" | "in_person";
    specificData?: string[] | undefined;
}, {
    description: string;
    userId: string;
    requestType: DataSubjectRight;
    preferredFormat?: "json" | "pdf" | "csv" | undefined;
    deliveryMethod?: "email" | "download" | "postal" | undefined;
    specificData?: string[] | undefined;
    verificationMethod?: "email" | "sms" | "in_person" | undefined;
}>;
/**
 * Consent record interface
 */
export interface ConsentRecord extends z.infer<typeof consentSchema> {
    id: string;
    timestamp: Date;
    ipAddress: string;
    userAgent?: string;
    isActive: boolean;
    withdrawnAt?: Date;
    withdrawalReason?: string;
    auditTrail: ConsentAuditEntry[];
}
/**
 * Consent audit trail entry
 */
export type ConsentAuditEntry = {
    id: string;
    timestamp: Date;
    action: 'given' | 'withdrawn' | 'modified' | 'expired';
    userId: string;
    ipAddress: string;
    details?: Record<string, any>;
};
/**
 * Data subject request interface
 */
export interface DataSubjectRequest extends z.infer<typeof dataSubjectRequestSchema> {
    id: string;
    status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'partially_completed';
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    verificationStatus: 'pending' | 'verified' | 'failed';
    response?: DataSubjectResponse;
    processingNotes?: string[];
}
/**
 * Data subject request response
 */
export type DataSubjectResponse = {
    requestId: string;
    data?: any;
    format: 'json' | 'pdf' | 'csv';
    fileUrl?: string;
    deliveredAt?: Date;
    expiresAt?: Date;
    downloadCount: number;
    maxDownloads: number;
};
/**
 * LGPD Service Implementation
 */
export declare class LgpdService {
    /**
     * Record user consent for data processing
     */
    static recordConsent(consentData: z.infer<typeof consentSchema>, ipAddress: string, userAgent?: string): Promise<ConsentRecord>;
    /**
     * Withdraw user consent and trigger data processing stops
     */
    static withdrawConsent(consentId: string, userId: string, reason: string, ipAddress: string): Promise<{
        success: boolean;
        message: string;
        dataRetention?: string;
    }>;
    /**
     * Process data subject rights request
     */
    static processDataSubjectRequest(requestData: z.infer<typeof dataSubjectRequestSchema>, _ipAddress: string): Promise<DataSubjectRequest>;
    /**
     * Process data access request (LGPD Art. 18, I)
     */
    static processAccessRequest(requestId: string): Promise<DataSubjectResponse>;
    /**
     * Process data deletion request (LGPD Art. 18, II)
     */
    static processErasureRequest(requestId: string): Promise<{
        deleted: string[];
        retained: string[];
        reasons: Record<string, string>;
    }>;
    /**
     * Generate privacy impact assessment
     */
    static generatePrivacyImpactAssessment(processingActivity: {
        name: string;
        purpose: DataProcessingPurpose;
        dataCategories: DataCategory[];
        recipients: string[];
        retentionPeriod: number;
        automatedDecisionMaking: boolean;
        internationalTransfer: boolean;
    }): Promise<{
        riskLevel: 'low' | 'medium' | 'high' | 'very_high';
        riskFactors: string[];
        mitigationMeasures: string[];
        recommendation: string;
    }>;
    /**
     * Automated breach notification system
     */
    static handleDataBreach(incident: {
        description: string;
        affectedUsers: string[];
        dataCategories: DataCategory[];
        severity: 'low' | 'medium' | 'high' | 'critical';
        discoveredAt: Date;
        containedAt?: Date;
        cause: string;
    }): Promise<{
        anpdNotificationRequired: boolean;
        userNotificationRequired: boolean;
        notificationDeadline?: Date;
        riskAssessment: string;
    }>;
    private static storeConsent;
    private static getConsentById;
    private static updateConsent;
    private static storeDataSubjectRequest;
    private static getDataSubjectRequest;
    private static stopDataProcessing;
    private static getDataRetentionInfo;
    private static initiateVerification;
    private static scheduleRequestProcessing;
    private static gatherUserData;
    private static formatUserData;
    private static updateRequestStatus;
    private static getUserConsents;
    private static getLegalRetentionRequirements;
    private static evaluateErasureEligibility;
    private static deleteUserDataByCategory;
    private static assessBreachRisk;
    private static generateBreachRiskAssessment;
    private static scheduleAnpdNotification;
    private static scheduleUserNotifications;
}
