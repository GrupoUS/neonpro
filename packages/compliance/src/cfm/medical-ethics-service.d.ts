/**
 * CFM Medical Ethics Service
 * Constitutional healthcare compliance for medical ethics standards
 *
 * @fileoverview CFM medical ethics compliance checking and monitoring
 * @version 1.0.0
 * @since 2025-01-17
 */
type Database = any;
import type { createClient } from '@supabase/supabase-js';
/**
 * CFM Medical Ethics Assessment Interface
 * Constitutional validation for medical ethics compliance
 */
export type MedicalEthicsAssessment = {
    /** Unique assessment identifier */
    assessment_id: string;
    /** CFM number of doctor being assessed */
    doctor_cfm_number: string;
    /** Type of ethics assessment */
    assessment_type: 'routine_compliance' | 'complaint_investigation' | 'advertising_review' | 'conflict_of_interest' | 'informed_consent_audit';
    /** Ethics assessment date */
    assessment_date: Date;
    /** Code of Medical Ethics articles evaluated */
    code_articles_evaluated: string[];
    /** Assessment results */
    assessment_results: {
        /** Overall compliance status */
        compliant: boolean;
        /** Compliance score (constitutional ≥9.9/10) */
        compliance_score: number;
        /** Articles with violations */
        violations: EthicsViolation[];
        /** Recommendations for improvement */
        recommendations: string[];
        /** Constitutional compliance status */
        constitutional_compliance: boolean;
    };
    /** Patient autonomy compliance */
    patient_autonomy_compliance: {
        /** Informed consent procedures */
        informed_consent_adequate: boolean;
        /** Patient decision respect */
        patient_decision_respect: boolean;
        /** Shared decision making */
        shared_decision_making: boolean;
    };
    /** Professional conduct assessment */
    professional_conduct: {
        /** Medical advertising compliance */
        advertising_compliant: boolean;
        /** Conflict of interest declared */
        conflict_of_interest_declared: boolean;
        /** Professional boundaries maintained */
        professional_boundaries: boolean;
        /** Continuing education current */
        continuing_education_current: boolean;
    };
    /** Associated clinic/tenant */
    tenant_id: string;
    /** Assessment performed by */
    assessed_by: string;
    /** Creation metadata */
    created_at: Date;
    /** Constitutional audit trail */
    audit_trail: EthicsAudit[];
}; /**
 * Medical Ethics Violation Interface
 * Constitutional documentation of ethics violations
 */
export type EthicsViolation = {
    /** Violation identifier */
    violation_id: string;
    /** Code of Medical Ethics article violated */
    code_article: string;
    /** Violation description */
    violation_description: string;
    /** Severity level */
    severity: 'minor' | 'moderate' | 'major' | 'critical';
    /** Evidence of violation */
    evidence: string[];
    /** Corrective actions required */
    corrective_actions: string[];
    /** Constitutional compliance impact */
    constitutional_impact: boolean;
};
/**
 * Ethics Audit Trail
 * Constitutional audit requirements for ethics assessments
 */
export type EthicsAudit = {
    /** Audit entry unique identifier */
    audit_id: string;
    /** Assessment ID being audited */
    assessment_id: string;
    /** Action performed on assessment */
    action: 'created' | 'updated' | 'reviewed' | 'approved' | 'corrective_action_implemented';
    /** Previous assessment state */
    previous_state: Partial<MedicalEthicsAssessment>;
    /** New assessment state */
    new_state: Partial<MedicalEthicsAssessment>;
    /** User who performed the action */
    user_id: string;
    /** Constitutional timestamp */
    timestamp: Date;
    /** Reason for action (constitutional requirement) */
    reason: string;
    /** Ethics board review comments */
    ethics_board_comments?: string;
};
/**
 * Medical Ethics Validation Parameters
 * Constitutional parameters for ethics compliance validation
 */
export type MedicalEthicsValidationParams = {
    /** Doctor CFM number */
    doctor_cfm_number: string;
    /** Assessment type to perform */
    assessment_type: MedicalEthicsAssessment['assessment_type'];
    /** Specific code articles to evaluate */
    code_articles_to_evaluate?: string[];
    /** Patient cases to review (for informed consent audit) */
    patient_cases?: string[];
    /** Advertising materials to review */
    advertising_materials?: string[];
    /** Conflict of interest declarations */
    conflict_declarations?: string[];
    /** Constitutional validation requirements */
    constitutional_requirements: string[];
};
/**
 * Code of Medical Ethics Compliance Response
 * Constitutional compliance validation results
 */
export type MedicalEthicsComplianceResponse = {
    /** Overall compliance status */
    compliant: boolean;
    /** Detailed compliance by ethics category */
    compliance_details: {
        /** Patient autonomy and informed consent */
        patient_autonomy: {
            compliant: boolean;
            score: number;
            issues: string[];
        };
        /** Professional conduct and boundaries */
        professional_conduct: {
            compliant: boolean;
            score: number;
            issues: string[];
        };
        /** Medical advertising and marketing */
        medical_advertising: {
            compliant: boolean;
            score: number;
            issues: string[];
        };
        /** Conflict of interest management */
        conflict_of_interest: {
            compliant: boolean;
            score: number;
            issues: string[];
        };
        /** Continuing education and competence */
        continuing_education: {
            compliant: boolean;
            score: number;
            issues: string[];
        };
    };
    /** Constitutional compliance score ≥9.9/10 */
    constitutional_score: number;
    /** Violations found */
    violations: EthicsViolation[];
    /** Recommended corrective actions */
    corrective_actions: string[];
    /** Ethics assessment timestamp */
    assessment_timestamp: Date;
}; /**
 * CFM Medical Ethics Service Implementation
 * Constitutional healthcare compliance with CFM medical ethics standards ≥9.9/10
 */
export declare class MedicalEthicsService {
    private readonly supabase;
    constructor(supabaseClient: ReturnType<typeof createClient<Database>>);
    /**
     * Conduct medical ethics compliance assessment
     * Constitutional CFM compliance with Code of Medical Ethics validation
     */
    conductEthicsAssessment(params: MedicalEthicsValidationParams, tenantId: string, assessorId: string): Promise<{
        success: boolean;
        data?: MedicalEthicsComplianceResponse;
        error?: string;
    }>; /**
     * Validate doctor eligibility for ethics assessment
     * Constitutional CFM professional validation
     */
    private validateDoctorForEthicsAssessment;
    /**
     * Assess patient autonomy and informed consent compliance
     * Constitutional validation of patient rights and autonomy
     */
    private assessPatientAutonomy; /**
     * Assess professional conduct and boundaries compliance
     * Constitutional validation of professional behavior standards
     */
    private assessProfessionalConduct; /**
     * Assess medical advertising and marketing compliance
     * Constitutional validation of advertising ethics per CFM standards
     */
    private assessMedicalAdvertising; /**
     * Assess conflict of interest management compliance
     * Constitutional validation of conflict disclosure and management
     */
    private assessConflictOfInterest; /**
     * Assess continuing education and competence compliance
     * Constitutional validation of ongoing professional development
     */
    private assessContinuingEducation; /**
     * Calculate constitutional ethics compliance score
     * Constitutional scoring with CFM medical ethics standards ≥9.9/10
     */
    private calculateEthicsComplianceScore;
    /**
     * Store ethics assessment in database
     * Constitutional storage with comprehensive audit trail
     */
    private storeEthicsAssessment; /**
     * Get medical ethics assessments with constitutional filtering
     * LGPD compliant with tenant isolation and CFM compliance tracking
     */
    getEthicsAssessments(tenantId: string, filters?: {
        doctor_cfm_number?: string;
        assessment_type?: MedicalEthicsAssessment['assessment_type'];
        compliant_only?: boolean;
        assessment_date_range?: {
            start: Date;
            end: Date;
        };
        constitutional_compliance?: boolean;
        minimum_score?: number;
    }): Promise<{
        success: boolean;
        data?: MedicalEthicsAssessment[];
        error?: string;
    }>;
    /**
     * Generate constitutional compliance report for medical ethics
     * CFM audit requirements ≥9.9/10
     */
    generateEthicsComplianceReport(tenantId: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    /**
     * Helper method to identify most common violations
     * Constitutional violation pattern analysis
     */
    private getMostCommonViolations;
}
export default MedicalEthicsService;
