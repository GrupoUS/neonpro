/**
 * Healthcare Role-Based Access Control (RBAC) Service
 * Constitutional healthcare access control with patient privacy protection and regulatory compliance
 * Compliance: LGPD + CFM + ANVISA + Constitutional Healthcare + ≥9.9/10 Standards
 */
import { z } from 'zod';
declare const HealthcareRoleSchema: z.ZodObject<{
    role_id: z.ZodString;
    role_name: z.ZodString;
    role_type: z.ZodEnum<["patient", "healthcare_professional", "physician", "nurse", "receptionist", "admin", "clinic_manager", "data_protection_officer", "compliance_officer", "system_administrator", "auditor"]>;
    hierarchy_level: z.ZodNumber;
    cfm_professional_type: z.ZodOptional<z.ZodEnum<["medico", "enfermeiro", "fisioterapeuta", "psicologo", "nutricionista", "farmaceutico", "administrativo", "tecnico", "outros"]>>;
    permissions: z.ZodArray<z.ZodString, "many">;
    restrictions: z.ZodArray<z.ZodString, "many">;
    data_access_level: z.ZodEnum<["none", "basic", "standard", "enhanced", "full"]>;
    patient_data_access: z.ZodObject<{
        can_view_personal_data: z.ZodBoolean;
        can_view_medical_records: z.ZodBoolean;
        can_modify_medical_records: z.ZodBoolean;
        can_delete_medical_records: z.ZodBoolean;
        can_export_patient_data: z.ZodBoolean;
        anonymized_access_only: z.ZodBoolean;
        consent_required_for_access: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        can_view_personal_data: boolean;
        can_view_medical_records: boolean;
        can_modify_medical_records: boolean;
        can_delete_medical_records: boolean;
        can_export_patient_data: boolean;
        anonymized_access_only: boolean;
        consent_required_for_access: boolean;
    }, {
        can_view_personal_data: boolean;
        can_view_medical_records: boolean;
        can_modify_medical_records: boolean;
        can_delete_medical_records: boolean;
        can_export_patient_data: boolean;
        anonymized_access_only: boolean;
        consent_required_for_access: boolean;
    }>;
    constitutional_compliance: z.ZodObject<{
        patient_autonomy_respected: z.ZodBoolean;
        medical_secrecy_enforced: z.ZodBoolean;
        lgpd_compliance_validated: z.ZodBoolean;
        cfm_ethics_approved: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        patient_autonomy_respected: boolean;
        medical_secrecy_enforced: boolean;
        lgpd_compliance_validated: boolean;
        cfm_ethics_approved: boolean;
    }, {
        patient_autonomy_respected: boolean;
        medical_secrecy_enforced: boolean;
        lgpd_compliance_validated: boolean;
        cfm_ethics_approved: boolean;
    }>;
    active: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    active: boolean;
    created_at: string;
    updated_at: string;
    constitutional_compliance: {
        patient_autonomy_respected: boolean;
        medical_secrecy_enforced: boolean;
        lgpd_compliance_validated: boolean;
        cfm_ethics_approved: boolean;
    };
    role_id: string;
    role_name: string;
    role_type: "admin" | "patient" | "healthcare_professional" | "physician" | "nurse" | "receptionist" | "clinic_manager" | "data_protection_officer" | "compliance_officer" | "system_administrator" | "auditor";
    hierarchy_level: number;
    permissions: string[];
    restrictions: string[];
    data_access_level: "basic" | "full" | "standard" | "none" | "enhanced";
    patient_data_access: {
        can_view_personal_data: boolean;
        can_view_medical_records: boolean;
        can_modify_medical_records: boolean;
        can_delete_medical_records: boolean;
        can_export_patient_data: boolean;
        anonymized_access_only: boolean;
        consent_required_for_access: boolean;
    };
    cfm_professional_type?: "medico" | "enfermeiro" | "fisioterapeuta" | "psicologo" | "nutricionista" | "farmaceutico" | "administrativo" | "tecnico" | "outros" | undefined;
}, {
    created_at: string;
    updated_at: string;
    constitutional_compliance: {
        patient_autonomy_respected: boolean;
        medical_secrecy_enforced: boolean;
        lgpd_compliance_validated: boolean;
        cfm_ethics_approved: boolean;
    };
    role_id: string;
    role_name: string;
    role_type: "admin" | "patient" | "healthcare_professional" | "physician" | "nurse" | "receptionist" | "clinic_manager" | "data_protection_officer" | "compliance_officer" | "system_administrator" | "auditor";
    hierarchy_level: number;
    permissions: string[];
    restrictions: string[];
    data_access_level: "basic" | "full" | "standard" | "none" | "enhanced";
    patient_data_access: {
        can_view_personal_data: boolean;
        can_view_medical_records: boolean;
        can_modify_medical_records: boolean;
        can_delete_medical_records: boolean;
        can_export_patient_data: boolean;
        anonymized_access_only: boolean;
        consent_required_for_access: boolean;
    };
    active?: boolean | undefined;
    cfm_professional_type?: "medico" | "enfermeiro" | "fisioterapeuta" | "psicologo" | "nutricionista" | "farmaceutico" | "administrativo" | "tecnico" | "outros" | undefined;
}>;
declare const HealthcareUserSchema: z.ZodObject<{
    user_id: z.ZodString;
    username: z.ZodString;
    email: z.ZodString;
    full_name: z.ZodString;
    professional_credentials: z.ZodObject<{
        cfm_registration: z.ZodOptional<z.ZodString>;
        coren_registration: z.ZodOptional<z.ZodString>;
        crefito_registration: z.ZodOptional<z.ZodString>;
        crp_registration: z.ZodOptional<z.ZodString>;
        other_registrations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        license_expiry_date: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        cfm_registration?: string | undefined;
        coren_registration?: string | undefined;
        crefito_registration?: string | undefined;
        crp_registration?: string | undefined;
        other_registrations?: string[] | undefined;
        license_expiry_date?: string | undefined;
    }, {
        cfm_registration?: string | undefined;
        coren_registration?: string | undefined;
        crefito_registration?: string | undefined;
        crp_registration?: string | undefined;
        other_registrations?: string[] | undefined;
        license_expiry_date?: string | undefined;
    }>;
    assigned_roles: z.ZodArray<z.ZodString, "many">;
    clinic_assignments: z.ZodArray<z.ZodString, "many">;
    tenant_id: z.ZodString;
    access_level: z.ZodEnum<["restricted", "standard", "elevated", "administrative"]>;
    security_clearance: z.ZodObject<{
        background_check_completed: z.ZodBoolean;
        lgpd_training_completed: z.ZodBoolean;
        cfm_ethics_training_completed: z.ZodBoolean;
        security_awareness_training: z.ZodBoolean;
        last_security_review: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        background_check_completed: boolean;
        lgpd_training_completed: boolean;
        cfm_ethics_training_completed: boolean;
        security_awareness_training: boolean;
        last_security_review?: string | undefined;
    }, {
        background_check_completed: boolean;
        lgpd_training_completed: boolean;
        cfm_ethics_training_completed: boolean;
        security_awareness_training: boolean;
        last_security_review?: string | undefined;
    }>;
    session_management: z.ZodObject<{
        max_concurrent_sessions: z.ZodNumber;
        session_timeout_minutes: z.ZodNumber;
        require_mfa: z.ZodBoolean;
        allowed_ip_ranges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        max_concurrent_sessions: number;
        session_timeout_minutes: number;
        require_mfa: boolean;
        allowed_ip_ranges?: string[] | undefined;
    }, {
        max_concurrent_sessions: number;
        session_timeout_minutes: number;
        require_mfa: boolean;
        allowed_ip_ranges?: string[] | undefined;
    }>;
    active: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    last_login: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    active: boolean;
    created_at: string;
    updated_at: string;
    tenant_id: string;
    user_id: string;
    email: string;
    username: string;
    full_name: string;
    professional_credentials: {
        cfm_registration?: string | undefined;
        coren_registration?: string | undefined;
        crefito_registration?: string | undefined;
        crp_registration?: string | undefined;
        other_registrations?: string[] | undefined;
        license_expiry_date?: string | undefined;
    };
    assigned_roles: string[];
    clinic_assignments: string[];
    access_level: "standard" | "administrative" | "restricted" | "elevated";
    security_clearance: {
        background_check_completed: boolean;
        lgpd_training_completed: boolean;
        cfm_ethics_training_completed: boolean;
        security_awareness_training: boolean;
        last_security_review?: string | undefined;
    };
    session_management: {
        max_concurrent_sessions: number;
        session_timeout_minutes: number;
        require_mfa: boolean;
        allowed_ip_ranges?: string[] | undefined;
    };
    last_login?: string | undefined;
}, {
    created_at: string;
    updated_at: string;
    tenant_id: string;
    user_id: string;
    email: string;
    username: string;
    full_name: string;
    professional_credentials: {
        cfm_registration?: string | undefined;
        coren_registration?: string | undefined;
        crefito_registration?: string | undefined;
        crp_registration?: string | undefined;
        other_registrations?: string[] | undefined;
        license_expiry_date?: string | undefined;
    };
    assigned_roles: string[];
    clinic_assignments: string[];
    access_level: "standard" | "administrative" | "restricted" | "elevated";
    security_clearance: {
        background_check_completed: boolean;
        lgpd_training_completed: boolean;
        cfm_ethics_training_completed: boolean;
        security_awareness_training: boolean;
        last_security_review?: string | undefined;
    };
    session_management: {
        max_concurrent_sessions: number;
        session_timeout_minutes: number;
        require_mfa: boolean;
        allowed_ip_ranges?: string[] | undefined;
    };
    active?: boolean | undefined;
    last_login?: string | undefined;
}>;
declare const AccessRequestSchema: z.ZodObject<{
    request_id: z.ZodString;
    user_id: z.ZodString;
    resource_type: z.ZodEnum<["patient_record", "medical_data", "appointment_schedule", "financial_data", "system_configuration", "compliance_reports", "audit_logs", "user_management", "clinic_management"]>;
    resource_id: z.ZodOptional<z.ZodString>;
    action: z.ZodEnum<["read", "write", "delete", "export", "share", "configure"]>;
    justification: z.ZodString;
    urgency_level: z.ZodEnum<["low", "normal", "high", "emergency"]>;
    patient_consent_obtained: z.ZodOptional<z.ZodBoolean>;
    medical_necessity: z.ZodOptional<z.ZodBoolean>;
    constitutional_basis: z.ZodObject<{
        legal_basis: z.ZodString;
        patient_rights_considered: z.ZodBoolean;
        privacy_impact_assessed: z.ZodBoolean;
        cfm_ethics_reviewed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        legal_basis: string;
        patient_rights_considered: boolean;
        privacy_impact_assessed: boolean;
        cfm_ethics_reviewed: boolean;
    }, {
        legal_basis: string;
        patient_rights_considered: boolean;
        privacy_impact_assessed: boolean;
        cfm_ethics_reviewed: boolean;
    }>;
    approval_status: z.ZodEnum<["pending", "approved", "rejected", "expired"]>;
    approved_by: z.ZodOptional<z.ZodString>;
    approved_at: z.ZodOptional<z.ZodString>;
    expires_at: z.ZodOptional<z.ZodString>;
    created_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    action: "read" | "write" | "delete" | "export" | "share" | "configure";
    created_at: string;
    user_id: string;
    resource_type: "clinic_management" | "audit_logs" | "patient_record" | "medical_data" | "appointment_schedule" | "financial_data" | "system_configuration" | "compliance_reports" | "user_management";
    urgency_level: "low" | "high" | "emergency" | "normal";
    request_id: string;
    justification: string;
    constitutional_basis: {
        legal_basis: string;
        patient_rights_considered: boolean;
        privacy_impact_assessed: boolean;
        cfm_ethics_reviewed: boolean;
    };
    approval_status: "approved" | "pending" | "expired" | "rejected";
    expires_at?: string | undefined;
    resource_id?: string | undefined;
    patient_consent_obtained?: boolean | undefined;
    medical_necessity?: boolean | undefined;
    approved_by?: string | undefined;
    approved_at?: string | undefined;
}, {
    action: "read" | "write" | "delete" | "export" | "share" | "configure";
    created_at: string;
    user_id: string;
    resource_type: "clinic_management" | "audit_logs" | "patient_record" | "medical_data" | "appointment_schedule" | "financial_data" | "system_configuration" | "compliance_reports" | "user_management";
    urgency_level: "low" | "high" | "emergency" | "normal";
    request_id: string;
    justification: string;
    constitutional_basis: {
        legal_basis: string;
        patient_rights_considered: boolean;
        privacy_impact_assessed: boolean;
        cfm_ethics_reviewed: boolean;
    };
    approval_status: "approved" | "pending" | "expired" | "rejected";
    expires_at?: string | undefined;
    resource_id?: string | undefined;
    patient_consent_obtained?: boolean | undefined;
    medical_necessity?: boolean | undefined;
    approved_by?: string | undefined;
    approved_at?: string | undefined;
}>;
declare const RbacConfigSchema: z.ZodObject<{
    strict_mode_enabled: z.ZodDefault<z.ZodBoolean>;
    constitutional_validation: z.ZodDefault<z.ZodBoolean>;
    patient_consent_enforcement: z.ZodDefault<z.ZodBoolean>;
    cfm_ethics_validation: z.ZodDefault<z.ZodBoolean>;
    lgpd_compliance_mode: z.ZodDefault<z.ZodBoolean>;
    audit_all_access: z.ZodDefault<z.ZodBoolean>;
    role_hierarchy_enforcement: z.ZodDefault<z.ZodBoolean>;
    emergency_access_enabled: z.ZodDefault<z.ZodBoolean>;
    session_management_strict: z.ZodDefault<z.ZodBoolean>;
    multi_factor_required: z.ZodDefault<z.ZodBoolean>;
    ip_restriction_enabled: z.ZodDefault<z.ZodBoolean>;
    credential_verification_required: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    constitutional_validation: boolean;
    cfm_ethics_validation: boolean;
    lgpd_compliance_mode: boolean;
    strict_mode_enabled: boolean;
    patient_consent_enforcement: boolean;
    audit_all_access: boolean;
    role_hierarchy_enforcement: boolean;
    emergency_access_enabled: boolean;
    session_management_strict: boolean;
    multi_factor_required: boolean;
    ip_restriction_enabled: boolean;
    credential_verification_required: boolean;
}, {
    constitutional_validation?: boolean | undefined;
    cfm_ethics_validation?: boolean | undefined;
    lgpd_compliance_mode?: boolean | undefined;
    strict_mode_enabled?: boolean | undefined;
    patient_consent_enforcement?: boolean | undefined;
    audit_all_access?: boolean | undefined;
    role_hierarchy_enforcement?: boolean | undefined;
    emergency_access_enabled?: boolean | undefined;
    session_management_strict?: boolean | undefined;
    multi_factor_required?: boolean | undefined;
    ip_restriction_enabled?: boolean | undefined;
    credential_verification_required?: boolean | undefined;
}>;
export type HealthcareRole = z.infer<typeof HealthcareRoleSchema>;
export type HealthcareUser = z.infer<typeof HealthcareUserSchema>;
export type AccessRequest = z.infer<typeof AccessRequestSchema>;
export type RbacConfig = z.infer<typeof RbacConfigSchema>;
export type HealthcareRbacAudit = {
    audit_id: string;
    user_id: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    access_granted: boolean;
    constitutional_validation_result: Record<string, any>;
    patient_privacy_impact: Record<string, any>;
    cfm_ethics_compliance: boolean;
    lgpd_compliance_verified: boolean;
    session_details: Record<string, any>;
    created_at: string;
    ip_address?: string;
    user_agent?: string;
};
/**
 * Healthcare Role-Based Access Control Service
 * Constitutional healthcare access control with comprehensive compliance
 */
export declare class HealthcareRbacService {
    private readonly config;
    private readonly roles;
    private readonly users;
    private readonly accessRequests;
    private readonly auditTrail;
    private readonly activeSessions;
    constructor(config: RbacConfig);
    /**
     * Create healthcare role with constitutional compliance validation
     */
    createHealthcareRole(roleData: Omit<HealthcareRole, 'role_id' | 'created_at' | 'updated_at'>): Promise<{
        success: boolean;
        role_id: string;
        constitutional_validation: Record<string, any>;
    }>;
    /**
     * Create healthcare user with comprehensive validation
     */
    createHealthcareUser(userData: Omit<HealthcareUser, 'user_id' | 'created_at' | 'updated_at'>): Promise<{
        success: boolean;
        user_id: string;
        security_clearance_status: Record<string, any>;
    }>;
    /**
     * Check access permission with constitutional validation
     */
    checkAccess(userId: string, resourceType: string, resourceId: string | undefined, action: string, context?: Record<string, any>): Promise<{
        access_granted: boolean;
        constitutional_basis: Record<string, any>;
        restrictions: string[];
        audit_trail_id: string;
    }>;
    /**
     * Request elevated access with justification
     */
    requestAccess(userId: string, accessRequest: Omit<AccessRequest, 'request_id' | 'approval_status' | 'created_at'>): Promise<{
        success: boolean;
        request_id: string;
        estimated_approval_time: string;
    }>;
    /**
     * Approve or reject access request
     */
    processAccessRequest(requestId: string, approverId: string, decision: 'approved' | 'rejected', justification: string): Promise<{
        success: boolean;
        decision: string;
        constitutional_validation: Record<string, any>;
    }>;
    /**
     * Initialize default healthcare roles
     */
    private initializeDefaultRoles;
    private validateRoleConstitutionalCompliance;
    private validateCfmProfessionalRole;
    private validateRoleLgpdCompliance;
    private validateProfessionalCredentials;
    private validateUserRoleAssignments;
    private validateSecurityClearance;
    private validateUserConstitutionalCompliance;
    private validateUserSession;
    private getUserRoles;
    private getUserPermissions;
    private checkBasicPermission;
    private isPatientDataResource;
    private validatePatientDataAccess;
    private validateEmergencyAccess;
    private grantAccess;
    private denyAccess;
    private generateAccessRestrictions;
    private validateAccessRequestConstitutional;
    private getRequestExpiryHours;
    private getEstimatedApprovalTime;
    private validateApproverAuthority;
    private hasProfessionalCredentials;
    private allTrainingCompleted;
    private isIpAllowed;
    /**
     * Get all roles for administrative purposes
     */
    getAllRoles(): HealthcareRole[];
    /**
     * Get all users for administrative purposes
     */
    getAllUsers(): HealthcareUser[];
    /**
     * Get audit trail for compliance reporting
     */
    getAuditTrail(): HealthcareRbacAudit[];
    /**
     * Get pending access requests
     */
    getPendingAccessRequests(): AccessRequest[];
    /**
     * Validate constitutional compliance of RBAC system
     */
    validateConstitutionalCompliance(): Promise<{
        compliant: boolean;
        score: number;
        issues: string[];
    }>;
}
/**
 * Factory function to create healthcare RBAC service
 */
export declare function createHealthcareRbacService(config: RbacConfig): HealthcareRbacService;
/**
 * Constitutional validation for healthcare RBAC configuration
 */
export declare function validateHealthcareRbac(config: RbacConfig): Promise<{
    valid: boolean;
    violations: string[];
}>;
export {};
