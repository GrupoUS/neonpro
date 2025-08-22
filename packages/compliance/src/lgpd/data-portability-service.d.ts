/**
 * @fileoverview LGPD Data Portability Service (Art. 18, V LGPD)
 * Constitutional Brazilian Healthcare Data Portability Implementation
 *
 * Constitutional Healthcare Principle: Patient Data Ownership + Transparency
 * Quality Standard: ≥9.9/10
 *
 * LGPD Article 18, V - Right to Data Portability:
 * - Right to receive personal data in structured, commonly used format
 * - Right to transmit data to another controller
 * - Right to direct transmission between controllers when technically feasible
 */
import { z } from 'zod';
import type { ComplianceScore, ConstitutionalResponse } from '../types';
import { PatientDataClassification } from '../types';
/**
 * Data Portability Request Schema
 */
export declare const DataPortabilityRequestSchema: z.ZodObject<{
    requestId: z.ZodOptional<z.ZodString>;
    patientId: z.ZodString;
    tenantId: z.ZodString;
    portabilityType: z.ZodEnum<["EXPORT_ONLY", "DIRECT_TRANSFER", "STRUCTURED_EXPORT", "HUMAN_READABLE_EXPORT", "FULL_MEDICAL_RECORDS"]>;
    dataCategories: z.ZodArray<z.ZodNativeEnum<typeof PatientDataClassification>, "many">;
    exportFormat: z.ZodEnum<["JSON", "XML", "PDF", "CSV", "FHIR", "DICOM"]>;
    destinationController: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        cnpj: z.ZodOptional<z.ZodString>;
        contact: z.ZodString;
        address: z.ZodString;
        privacyOfficer: z.ZodString;
        dataProtectionMeasures: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        contact: string;
        address: string;
        privacyOfficer: string;
        dataProtectionMeasures: string;
        cnpj?: string | undefined;
    }, {
        name: string;
        contact: string;
        address: string;
        privacyOfficer: string;
        dataProtectionMeasures: string;
        cnpj?: string | undefined;
    }>>;
    encryptionRequired: z.ZodDefault<z.ZodBoolean>;
    passwordProtection: z.ZodDefault<z.ZodBoolean>;
    accessibilityRequirements: z.ZodOptional<z.ZodObject<{
        screenReaderCompatible: z.ZodDefault<z.ZodBoolean>;
        largeText: z.ZodDefault<z.ZodBoolean>;
        audioDescription: z.ZodDefault<z.ZodBoolean>;
        brailleFormat: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        largeText: boolean;
        screenReaderCompatible: boolean;
        audioDescription: boolean;
        brailleFormat: boolean;
    }, {
        largeText?: boolean | undefined;
        screenReaderCompatible?: boolean | undefined;
        audioDescription?: boolean | undefined;
        brailleFormat?: boolean | undefined;
    }>>;
    urgency: z.ZodDefault<z.ZodEnum<["NORMAL", "HIGH", "URGENT"]>>;
    requestedBy: z.ZodString;
    requestedAt: z.ZodDate;
    patientConfirmation: z.ZodDefault<z.ZodBoolean>;
    guardianConsent: z.ZodDefault<z.ZodBoolean>;
    deliveryMethod: z.ZodDefault<z.ZodEnum<["SECURE_DOWNLOAD", "ENCRYPTED_EMAIL", "SECURE_PORTAL", "PHYSICAL_MEDIA", "DIRECT_API_TRANSFER"]>>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    tenantId: string;
    urgency: "HIGH" | "URGENT" | "NORMAL";
    dataCategories: PatientDataClassification[];
    requestedBy: string;
    requestedAt: Date;
    patientConfirmation: boolean;
    guardianConsent: boolean;
    portabilityType: "EXPORT_ONLY" | "DIRECT_TRANSFER" | "STRUCTURED_EXPORT" | "HUMAN_READABLE_EXPORT" | "FULL_MEDICAL_RECORDS";
    exportFormat: "JSON" | "XML" | "PDF" | "CSV" | "FHIR" | "DICOM";
    encryptionRequired: boolean;
    passwordProtection: boolean;
    deliveryMethod: "SECURE_DOWNLOAD" | "ENCRYPTED_EMAIL" | "SECURE_PORTAL" | "PHYSICAL_MEDIA" | "DIRECT_API_TRANSFER";
    accessibilityRequirements?: {
        largeText: boolean;
        screenReaderCompatible: boolean;
        audioDescription: boolean;
        brailleFormat: boolean;
    } | undefined;
    requestId?: string | undefined;
    destinationController?: {
        name: string;
        contact: string;
        address: string;
        privacyOfficer: string;
        dataProtectionMeasures: string;
        cnpj?: string | undefined;
    } | undefined;
}, {
    patientId: string;
    tenantId: string;
    dataCategories: PatientDataClassification[];
    requestedBy: string;
    requestedAt: Date;
    portabilityType: "EXPORT_ONLY" | "DIRECT_TRANSFER" | "STRUCTURED_EXPORT" | "HUMAN_READABLE_EXPORT" | "FULL_MEDICAL_RECORDS";
    exportFormat: "JSON" | "XML" | "PDF" | "CSV" | "FHIR" | "DICOM";
    urgency?: "HIGH" | "URGENT" | "NORMAL" | undefined;
    accessibilityRequirements?: {
        largeText?: boolean | undefined;
        screenReaderCompatible?: boolean | undefined;
        audioDescription?: boolean | undefined;
        brailleFormat?: boolean | undefined;
    } | undefined;
    requestId?: string | undefined;
    patientConfirmation?: boolean | undefined;
    guardianConsent?: boolean | undefined;
    destinationController?: {
        name: string;
        contact: string;
        address: string;
        privacyOfficer: string;
        dataProtectionMeasures: string;
        cnpj?: string | undefined;
    } | undefined;
    encryptionRequired?: boolean | undefined;
    passwordProtection?: boolean | undefined;
    deliveryMethod?: "SECURE_DOWNLOAD" | "ENCRYPTED_EMAIL" | "SECURE_PORTAL" | "PHYSICAL_MEDIA" | "DIRECT_API_TRANSFER" | undefined;
}>;
export type DataPortabilityRequest = z.infer<typeof DataPortabilityRequestSchema>;
/**
 * Portability Export Result
 */
export type PortabilityResult = {
    requestId: string;
    status: 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'PROCESSING';
    tenantId?: string;
    patientId?: string;
    data?: any;
    metadata?: Record<string, any>;
    exportedData: {
        categories: PatientDataClassification[];
        records: number;
        tables: string[];
        fileSizeBytes: number;
        format: string;
    };
    excludedData: {
        reason: string;
        categories: PatientDataClassification[];
        records: number;
        legalBasis: string[];
    };
    securityMeasures: {
        encrypted: boolean;
        passwordProtected: boolean;
        accessControlApplied: boolean;
        auditTrailIncluded: boolean;
    };
    constitutionalCompliance: {
        patientRightsHonored: boolean;
        medicalAccuracyValidated: boolean;
        privacyPreserved: boolean;
        transparencyProvided: boolean;
        complianceScore: ComplianceScore;
    };
    deliveryInfo: {
        method: string;
        deliveredAt?: Date;
        expiresAt: Date;
        accessInstructions: string;
        downloadUrl?: string;
        securityKey?: string;
    };
    executionTime: {
        startedAt: Date;
        completedAt?: Date;
        durationMs?: number;
    };
    auditTrail: Array<{
        action: string;
        timestamp: Date;
        details: string;
        dataCategories: string[];
    }>;
};
/**
 * Constitutional Data Portability Service for Healthcare LGPD Compliance
 */
export declare class DataPortabilityService {
    private readonly exportExpiryDays;
    /**
     * Process Data Portability Request
     * Implements LGPD Art. 18, V with constitutional healthcare validation
     */
    processPortabilityRequest(request: DataPortabilityRequest): Promise<ConstitutionalResponse<PortabilityResult>>;
    /**
     * Validate Constitutional Healthcare Portability Requirements
     */
    private validateConstitutionalPortability; /**
     * Analyze Exportable Data and Legal Restrictions
     */
    private analyzeExportableData;
    /**
     * Execute Constitutional Data Export
     */
    private executeConstitutionalExport;
    /**
     * Apply Security Measures to Export
     */
    private applySecurityMeasures;
    /**
     * Deliver Exported Data According to Specified Method
     */
    private deliverExportedData;
    /**
     * Calculate Constitutional Compliance Score for Portability
     */
    private calculatePortabilityComplianceScore;
    private exportTableData;
    private convertToFHIRFormat;
    private generateHumanReadablePDF;
    private generateExportFile;
    private encryptExportData;
    private generateSecurePassword;
    private applyPasswordProtection;
    private generateDigitalSignature;
    private createSecureDownloadLink;
    private sendEncryptedEmail;
    private createPortalAccess;
    private executeDirectTransfer;
    private schedulePhysicalDelivery;
    private requestPatientConfirmation;
    private sendPortabilityCompletionNotification;
    private createAuditEvent;
    /**
     * Get Portability Request Status
     */
    getPortabilityStatus(requestId: string, _tenantId: string): Promise<ConstitutionalResponse<PortabilityResult | null>>;
}
