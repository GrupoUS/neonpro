/**
 * CFM Medical Records Service
 * Constitutional healthcare compliance for medical record validation
 *
 * @fileoverview CFM medical record constitutional validation and management
 * @version 1.0.0
 * @since 2025-01-17
 */
type Database = any;
import type { createClient } from '@supabase/supabase-js';
/**
 * CFM Medical Record Validation Interface
 * Constitutional validation for medical record standards
 */
export type MedicalRecordValidation = {
    /** Unique validation identifier */
    validation_id: string;
    /** Medical record identifier being validated */
    medical_record_id: string;
    /** CFM number of attending doctor */
    doctor_cfm_number: string;
    /** Patient identifier (LGPD compliant) */
    patient_id: string;
    /** Validation date */
    validation_date: Date;
    /** Record validation results */
    validation_results: {
        /** Overall validation status */
        valid: boolean;
        /** Constitutional compliance score ≥9.9/10 */
        compliance_score: number;
        /** CFM Resolution 2.227/2018 compliance */
        cfm_resolution_2227_compliant: boolean;
        /** Record completeness assessment */
        completeness_assessment: RecordCompletenessAssessment;
        /** Legal requirements compliance */
        legal_compliance: LegalComplianceAssessment;
        /** Constitutional healthcare compliance */
        constitutional_compliance: boolean;
    };
    /** Data integrity validation */
    data_integrity: {
        /** Record authenticity verified */
        authenticity_verified: boolean;
        /** Digital signature present */
        digital_signature_present: boolean;
        /** Audit trail complete */
        audit_trail_complete: boolean;
        /** LGPD compliance verified */
        lgpd_compliance_verified: boolean;
    };
    /** Quality indicators */
    quality_indicators: {
        /** Legibility score (1-10) */
        legibility_score: number;
        /** Completeness score (1-10) */
        completeness_score: number;
        /** Accuracy score (1-10) */
        accuracy_score: number;
        /** Timeliness score (1-10) */
        timeliness_score: number;
    };
    /** Associated clinic/tenant */
    tenant_id: string;
    /** Validation performed by */
    validated_by: string;
    /** Creation metadata */
    created_at: Date;
    /** Constitutional audit trail */
    audit_trail: MedicalRecordAudit[];
}; /**
 * Record Completeness Assessment Interface
 * Constitutional assessment of medical record completeness
 */
export type RecordCompletenessAssessment = {
    /** Patient identification complete */
    patient_identification_complete: boolean;
    /** Medical history documented */
    medical_history_documented: boolean;
    /** Physical examination recorded */
    physical_examination_recorded: boolean;
    /** Diagnosis documented */
    diagnosis_documented: boolean;
    /** Treatment plan recorded */
    treatment_plan_recorded: boolean;
    /** Prescribed medications listed */
    medications_documented: boolean;
    /** Follow-up instructions provided */
    followup_instructions_provided: boolean;
    /** Doctor identification and signature */
    doctor_identification_complete: boolean;
    /** Date and time stamps present */
    timestamps_complete: boolean;
    /** Informed consent documented */
    informed_consent_documented: boolean;
};
/**
 * Legal Compliance Assessment Interface
 * Constitutional legal requirements for medical records
 */
export type LegalComplianceAssessment = {
    /** CFM Resolution 2.227/2018 compliance */
    cfm_resolution_compliance: boolean;
    /** LGPD privacy requirements met */
    lgpd_requirements_met: boolean;
    /** Record retention period compliance */
    retention_period_compliant: boolean;
    /** Access control properly implemented */
    access_control_compliant: boolean;
    /** Patient consent for data processing */
    patient_consent_documented: boolean;
    /** Constitutional healthcare standards met */
    constitutional_standards_met: boolean;
};
/**
 * Medical Record Audit Trail
 * Constitutional audit requirements for medical record operations
 */
export type MedicalRecordAudit = {
    /** Audit entry unique identifier */
    audit_id: string;
    /** Validation ID being audited */
    validation_id: string;
    /** Action performed on validation */
    action: 'created' | 'updated' | 'reviewed' | 'approved' | 'corrective_action_implemented';
    /** Previous validation state */
    previous_state: Partial<MedicalRecordValidation>;
    /** New validation state */
    new_state: Partial<MedicalRecordValidation>;
    /** User who performed the action */
    user_id: string;
    /** Constitutional timestamp */
    timestamp: Date;
    /** Reason for action (constitutional requirement) */
    reason: string;
    /** Medical record quality notes */
    quality_notes?: string;
};
/**
 * Medical Record Validation Parameters
 * Constitutional parameters for medical record validation
 */
export type MedicalRecordValidationParams = {
    /** Medical record ID to validate */
    medical_record_id: string;
    /** Doctor CFM number */
    doctor_cfm_number: string;
    /** Patient identifier */
    patient_id: string;
    /** Validation scope */
    validation_scope: 'basic' | 'comprehensive' | 'constitutional_audit';
    /** Specific quality indicators to assess */
    quality_indicators_to_assess?: string[];
    /** Legal compliance areas to validate */
    legal_compliance_areas?: string[];
    /** Constitutional validation requirements */
    constitutional_requirements: string[];
};
/**
 * CFM Medical Record Compliance Response
 * Constitutional compliance validation results
 */
export type MedicalRecordComplianceResponse = {
    /** Overall compliance status */
    compliant: boolean;
    /** Detailed compliance assessment */
    compliance_details: {
        /** Record completeness validation */
        completeness: {
            compliant: boolean;
            score: number;
            missing_elements: string[];
            recommendations: string[];
        };
        /** Legal compliance validation */
        legal_compliance: {
            compliant: boolean;
            score: number;
            non_compliant_areas: string[];
            corrective_actions: string[];
        };
        /** Data quality validation */
        data_quality: {
            compliant: boolean;
            overall_quality_score: number;
            quality_issues: string[];
            improvement_recommendations: string[];
        };
        /** Security and privacy validation */
        security_privacy: {
            compliant: boolean;
            score: number;
            security_issues: string[];
            privacy_improvements: string[];
        };
    };
    /** Constitutional compliance score ≥9.9/10 */
    constitutional_score: number;
    /** Identified compliance issues */
    compliance_issues: string[];
    /** Recommended corrective actions */
    corrective_actions: string[];
    /** Validation timestamp */
    validation_timestamp: Date;
}; /**
 * CFM Medical Records Service Implementation
 * Constitutional healthcare compliance with CFM medical record standards ≥9.9/10
 */
export declare class MedicalRecordsService {
    private readonly supabase;
    constructor(supabaseClient: ReturnType<typeof createClient<Database>>);
    /**
     * Validate medical record compliance with CFM standards
     * Constitutional CFM compliance with Resolution 2.227/2018 validation
     */
    validateMedicalRecord(params: MedicalRecordValidationParams, tenantId: string, validatorId: string): Promise<{
        success: boolean;
        data?: MedicalRecordComplianceResponse;
        error?: string;
    }>; /**
     * Validate record access permissions
     * Constitutional access control validation
     */
    private validateRecordAccess;
    /**
     * Assess medical record completeness
     * Constitutional completeness validation per CFM Resolution 2.227/2018
     */
    private assessRecordCompleteness; /**
     * Assess legal compliance requirements
     * Constitutional legal validation per CFM Resolution 2.227/2018 and LGPD
     */
    private assessLegalCompliance;
    /**
     * Assess data quality indicators
     * Constitutional data quality validation for medical records
     */
    private assessDataQuality; /**
     * Assess security and privacy compliance
     * Constitutional security and privacy validation for medical records
     */
    private assessSecurityPrivacy;
    /**
     * Calculate constitutional medical record compliance score
     * Constitutional scoring with CFM medical record standards ≥9.9/10
     */
    private calculateRecordComplianceScore;
    /**
     * Store medical record validation in database
     * Constitutional storage with comprehensive audit trail
     */
    private storeMedicalRecordValidation; /**
     * Get medical record validations with constitutional filtering
     * LGPD compliant with tenant isolation and CFM compliance tracking
     */
    getMedicalRecordValidations(tenantId: string, filters?: {
        doctor_cfm_number?: string;
        patient_id?: string;
        validation_scope?: MedicalRecordValidationParams['validation_scope'];
        compliant_only?: boolean;
        validation_date_range?: {
            start: Date;
            end: Date;
        };
        constitutional_compliance?: boolean;
        minimum_score?: number;
    }): Promise<{
        success: boolean;
        data?: MedicalRecordValidation[];
        error?: string;
    }>;
    /**
     * Generate constitutional compliance report for medical records
     * CFM audit requirements ≥9.9/10
     */
    generateMedicalRecordComplianceReport(tenantId: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
}
export default MedicalRecordsService;
