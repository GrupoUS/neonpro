/**
 * CFM Telemedicine Compliance Service
 * Constitutional healthcare compliance for telemedicine practices
 *
 * @fileoverview CFM telemedicine compliance validation and monitoring
 * @version 1.0.0
 * @since 2025-01-17
 */
type Database = any;
import type { createClient } from '@supabase/supabase-js';
/**
 * CFM Telemedicine Consultation Interface
 * Constitutional validation for telemedicine practices
 */
export type TelemedicineConsultation = {
    /** Unique consultation identifier */
    consultation_id: string;
    /** Type of telemedicine consultation */
    consultation_type: 'teleconsultation' | 'telediagnosis' | 'telemonitoring' | 'tele_orientation' | 'second_opinion';
    /** CFM number of attending doctor */
    doctor_cfm_number: string;
    /** Patient identifier (LGPD compliant) */
    patient_id: string;
    /** Consultation date and time */
    consultation_datetime: Date;
    /** Consultation duration in minutes */
    duration_minutes: number;
    /** Platform used for consultation */
    platform_used: string;
    /** Constitutional compliance status */
    constitutional_compliance: boolean;
    /** CFM resolution compliance */
    cfm_resolution_compliance: {
        /** Resolution 2.314/2022 compliance */
        resolution_2314: boolean;
        /** Resolution 2.315/2022 compliance */
        resolution_2315: boolean;
        /** Resolution 2.316/2022 compliance */
        resolution_2316: boolean;
    };
    /** Informed consent status */
    informed_consent: {
        /** Consent obtained */
        consent_obtained: boolean;
        /** Consent timestamp */
        consent_timestamp: Date;
        /** Consent document ID */
        consent_document_id: string;
    };
    /** Technical requirements compliance */
    technical_compliance: {
        /** Video quality adequate */
        video_quality_adequate: boolean;
        /** Audio quality adequate */
        audio_quality_adequate: boolean;
        /** Platform security validated */
        platform_security_validated: boolean;
        /** Data encryption enabled */
        data_encryption_enabled: boolean;
    };
    /** Associated clinic/tenant */
    tenant_id: string;
    /** Creation metadata */
    created_at: Date;
    /** Constitutional audit trail */
    audit_trail: TelemedicineAudit[];
}; /**
 * Telemedicine Audit Trail
 * Constitutional audit requirements for telemedicine operations
 */
export type TelemedicineAudit = {
    /** Audit entry unique identifier */
    audit_id: string;
    /** Consultation ID being audited */
    consultation_id: string;
    /** Action performed on consultation */
    action: 'created' | 'started' | 'completed' | 'cancelled' | 'compliance_validated' | 'consent_updated';
    /** Previous consultation state */
    previous_state: Partial<TelemedicineConsultation>;
    /** New consultation state */
    new_state: Partial<TelemedicineConsultation>;
    /** User who performed the action */
    user_id: string;
    /** Constitutional timestamp */
    timestamp: Date;
    /** Reason for action (constitutional requirement) */
    reason: string;
    /** CFM compliance details */
    cfm_compliance_details?: string;
};
/**
 * Telemedicine Platform Requirements
 * Constitutional requirements for telemedicine platforms
 */
export type TelemedicinePlatformRequirements = {
    /** Platform name */
    platform_name: string;
    /** Security certification */
    security_certification: boolean;
    /** LGPD compliance */
    lgpd_compliance: boolean;
    /** End-to-end encryption */
    end_to_end_encryption: boolean;
    /** Video quality minimum */
    minimum_video_quality: 'HD' | 'Full_HD' | '4K';
    /** Audio quality minimum */
    minimum_audio_quality: 'Standard' | 'High' | 'Professional';
    /** Session recording capability */
    session_recording: boolean;
    /** CFM resolution compliance */
    cfm_resolution_compliance: boolean;
    /** Constitutional healthcare compliance */
    constitutional_compliance: boolean;
};
/**
 * Telemedicine Validation Parameters
 * Constitutional parameters for telemedicine consultation validation
 */
export type TelemedicineValidationParams = {
    /** Doctor CFM number */
    doctor_cfm_number: string;
    /** Patient identifier */
    patient_id: string;
    /** Consultation type */
    consultation_type: TelemedicineConsultation['consultation_type'];
    /** Platform to be used */
    platform_name: string;
    /** Consultation date/time */
    consultation_datetime: Date;
    /** Informed consent document */
    informed_consent_document: string;
    /** Constitutional validation requirements */
    constitutional_requirements: string[];
};
/**
 * CFM Telemedicine Compliance Response
 * Constitutional compliance validation results
 */
export type TelemedicineComplianceResponse = {
    /** Compliance status */
    compliant: boolean;
    /** CFM resolution validations */
    cfm_resolutions: {
        /** Resolution 2.314/2022 status */
        resolution_2314_compliant: boolean;
        /** Resolution 2.315/2022 status */
        resolution_2315_compliant: boolean;
        /** Resolution 2.316/2022 status */
        resolution_2316_compliant: boolean;
    };
    /** Technical compliance status */
    technical_compliance: {
        /** Platform approved */
        platform_approved: boolean;
        /** Security requirements met */
        security_requirements_met: boolean;
        /** Quality standards met */
        quality_standards_met: boolean;
    };
    /** Compliance issues found */
    compliance_issues: string[];
    /** Recommendations for compliance */
    recommendations: string[];
    /** Constitutional compliance score */
    constitutional_score: number;
    /** Validation timestamp */
    validation_timestamp: Date;
}; /**
 * CFM Telemedicine Compliance Service Implementation
 * Constitutional healthcare compliance with CFM telemedicine standards ≥9.9/10
 */
export declare class TelemedicineComplianceService {
    private readonly supabase;
    constructor(supabaseClient: ReturnType<typeof createClient<Database>>);
    /**
     * Validate telemedicine consultation compliance
     * Constitutional CFM compliance with Resolution 2.314/2022, 2.315/2022, 2.316/2022
     */
    validateTelemedicineCompliance(params: TelemedicineValidationParams): Promise<{
        success: boolean;
        data?: TelemedicineComplianceResponse;
        error?: string;
    }>; /**
     * Register telemedicine consultation with constitutional compliance
     * CFM compliance with comprehensive validation and audit trail
     */
    registerTelemedicineConsultation(consultationData: Omit<TelemedicineConsultation, 'consultation_id' | 'created_at' | 'audit_trail'>, userId: string): Promise<{
        success: boolean;
        data?: TelemedicineConsultation;
        error?: string;
    }>;
    /**
     * Validate doctor's telemedicine eligibility
     * Constitutional CFM professional validation for telemedicine practice
     */
    private validateDoctorTelemedicineEligibility; /**
     * Validate telemedicine platform compliance
     * Constitutional platform validation with CFM requirements
     */
    private validateTelemedicinePlatform;
    /**
     * Validate consultation parameters
     * Constitutional validation of consultation setup
     */
    private validateConsultationParameters; /**
     * Check CFM resolutions compliance
     * Constitutional validation against CFM Resolution 2.314/2022, 2.315/2022, 2.316/2022
     */
    private checkCfmResolutionsCompliance;
    /**
     * Calculate telemedicine compliance score
     * Constitutional scoring with CFM standards ≥9.9/10
     */
    private calculateTelemedicineComplianceScore;
    /**
     * Validate CFM Resolution 2.314/2022 compliance
     * Telemedicine practice regulation validation
     */
    private validateResolution2314;
    /**
     * Validate CFM Resolution 2.315/2022 compliance
     * Technical requirements validation
     */
    private validateResolution2315;
    /**
     * Validate CFM Resolution 2.316/2022 compliance
     * Patient privacy and data protection validation
     */
    private validateResolution2316; /**
     * Get telemedicine consultations with constitutional filtering
     * LGPD compliant with tenant isolation and CFM compliance tracking
     */
    getTelemedicineConsultations(tenantId: string, filters?: {
        consultation_type?: TelemedicineConsultation['consultation_type'];
        doctor_cfm_number?: string;
        patient_id?: string;
        date_range?: {
            start: Date;
            end: Date;
        };
        constitutional_compliance?: boolean;
        platform_used?: string;
    }): Promise<{
        success: boolean;
        data?: TelemedicineConsultation[];
        error?: string;
    }>;
    /**
     * Generate constitutional compliance report for telemedicine
     * CFM audit requirements ≥9.9/10
     */
    generateTelemedicineComplianceReport(tenantId: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    /**
     * Update consultation compliance status
     * Constitutional audit trail for compliance updates
     */
    updateConsultationCompliance(consultationId: string, complianceStatus: boolean, userId: string, reason: string): Promise<{
        success: boolean;
        error?: string;
    }>;
}
export default TelemedicineComplianceService;
