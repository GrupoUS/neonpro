/**
 * CFM Professional Licensing Service
 * Constitutional healthcare compliance for medical professional licensing
 *
 * @fileoverview CFM professional licensing verification and management automation
 * @version 1.0.0
 * @since 2025-01-17
 */
type Database = any;
import type { createClient } from '@supabase/supabase-js';
/**
 * CFM Professional License Interface
 * Constitutional validation for medical professional licensing
 */
export type ProfessionalLicense = {
    /** Unique license identifier */
    license_id: string;
    /** CFM registration number (constitutional requirement) */
    cfm_number: string;
    /** Doctor's full name */
    doctor_name: string;
    /** CPF for constitutional identification */
    doctor_cpf: string;
    /** Current license status */
    license_status: 'active' | 'suspended' | 'cancelled' | 'inactive' | 'under_review';
    /** Medical specializations */
    specializations: string[];
    /** License issue date */
    license_issue_date: Date;
    /** License expiry date (constitutional monitoring) */
    license_expiry: Date;
    /** State/UF where license is valid */
    license_state: string;
    /** Medical school information */
    medical_school: string;
    /** Graduation year */
    graduation_year: number;
    /** Constitutional compliance status */
    constitutional_compliance: boolean;
    /** Associated clinic/tenant */
    tenant_id: string;
    /** Creation metadata */
    created_at: Date;
    /** Last update timestamp */
    updated_at: Date;
    /** Constitutional audit trail */
    audit_trail: LicenseAudit[];
}; /**
 * License Audit Trail
 * Constitutional audit requirements for license operations
 */
export type LicenseAudit = {
    /** Audit entry unique identifier */
    audit_id: string;
    /** License ID being audited */
    license_id: string;
    /** Action performed on license */
    action: 'created' | 'updated' | 'verified' | 'suspended' | 'reactivated' | 'renewed';
    /** Previous license state */
    previous_state: Partial<ProfessionalLicense>;
    /** New license state */
    new_state: Partial<ProfessionalLicense>;
    /** User who performed the action */
    user_id: string;
    /** Constitutional timestamp */
    timestamp: Date;
    /** Reason for action (constitutional requirement) */
    reason: string;
    /** CFM verification details */
    cfm_verification_details?: string;
};
/**
 * License Verification Parameters
 * Constitutional parameters for CFM license verification
 */
export type LicenseVerificationParams = {
    /** CFM number to verify */
    cfm_number: string;
    /** Doctor's full name for cross-validation */
    doctor_name?: string;
    /** CPF for constitutional identification */
    doctor_cpf?: string;
    /** State/UF for regional validation */
    license_state?: string;
    /** Verification depth level */
    verification_level: 'basic' | 'comprehensive' | 'constitutional_full';
};
/**
 * CFM License Verification Response
 * Constitutional verification results with professional standards
 */
export type LicenseVerificationResponse = {
    /** Verification success status */
    verified: boolean;
    /** License details if found */
    license_details?: {
        /** CFM number confirmed */
        cfm_number: string;
        /** Doctor name confirmed */
        doctor_name: string;
        /** License status */
        status: ProfessionalLicense['license_status'];
        /** Valid specializations */
        specializations: string[];
        /** License expiry date */
        expiry_date: Date;
        /** Constitutional compliance */
        constitutional_compliance: boolean;
    };
    /** Verification warnings */
    warnings: string[];
    /** Error details if verification failed */
    error_details?: string;
    /** CFM database timestamp */
    verification_timestamp: Date;
}; /**
 * CFM Professional Licensing Service Implementation
 * Constitutional healthcare compliance with CFM professional standards ≥9.9/10
 */
export declare class ProfessionalLicensingService {
    private readonly supabase;
    constructor(supabaseClient: ReturnType<typeof createClient<Database>>);
    /**
     * Verify CFM professional license with constitutional validation
     * Automated CFM database integration with professional standards
     */
    verifyProfessionalLicense(params: LicenseVerificationParams): Promise<{
        success: boolean;
        data?: LicenseVerificationResponse;
        error?: string;
    }>; /**
     * Register new professional license with constitutional validation
     * CFM compliance with automated license management
     */
    registerProfessionalLicense(licenseData: Omit<ProfessionalLicense, 'license_id' | 'created_at' | 'updated_at' | 'audit_trail'>, userId: string): Promise<{
        success: boolean;
        data?: ProfessionalLicense;
        error?: string;
    }>;
    /**
     * Get professional licenses with constitutional filtering
     * LGPD compliant with tenant isolation
     */
    getProfessionalLicenses(tenantId: string, filters?: {
        license_status?: ProfessionalLicense['license_status'];
        specialization?: string;
        expiring_within_days?: number;
        license_state?: string;
    }): Promise<{
        success: boolean;
        data?: ProfessionalLicense[];
        error?: string;
    }>; /**
     * Constitutional validation of CFM number format
     * CFM compliance with Brazilian medical registration standards
     */
    private validateCfmNumberFormat;
    /**
     * Get local license record
     * Constitutional database lookup with privacy protection
     */
    private getLocalLicense;
    /**
     * Verify with CFM database (integrated implementation)
     * Constitutional CFM integration with real validation
     */
    private verifyCfmDatabase;
    /**
     * Update local license record with CFM verification data
     * Constitutional update with audit trail
     */
    private updateLocalLicense;
    /**
     * Create local license record from CFM verification
     * Constitutional license creation with validation
     */
    private createLocalLicense; /**
     * Constitutional validation of license data
     * CFM compliance with professional standards validation
     */
    private validateLicenseData;
    /**
     * Schedule constitutional expiry monitoring for professional license
     * CFM compliance monitoring with proactive notifications
     */
    private scheduleExpiryMonitoring;
    /**
     * Get licenses expiring soon for constitutional monitoring
     * CFM compliance dashboard integration
     */
    getExpiringLicenses(tenantId: string, daysThreshold?: number): Promise<{
        success: boolean;
        data?: ProfessionalLicense[];
        error?: string;
    }>;
    /**
     * Generate constitutional compliance report for CFM licenses
     * Healthcare audit requirements ≥9.9/10
     */
    generateComplianceReport(tenantId: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
}
export default ProfessionalLicensingService;
