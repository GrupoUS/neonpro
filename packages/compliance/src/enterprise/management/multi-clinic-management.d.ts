/**
 * Multi-Clinic Management Service
 * Constitutional healthcare multi-clinic and multi-tenant management with regulatory compliance
 * Compliance: LGPD + ANVISA + CFM + Constitutional Healthcare + ≥9.9/10 Standards
 */
import { z } from 'zod';
declare const ClinicSchema: z.ZodObject<{
    clinic_id: z.ZodString;
    clinic_name: z.ZodString;
    cnpj: z.ZodString;
    cnes_code: z.ZodString;
    primary_specialty: z.ZodString;
    secondary_specialties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    license_details: z.ZodObject<{
        anvisa_license: z.ZodString;
        cfm_registration: z.ZodString;
        municipal_license: z.ZodString;
        valid_until: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        valid_until: string;
        anvisa_license: string;
        cfm_registration: string;
        municipal_license: string;
    }, {
        valid_until: string;
        anvisa_license: string;
        cfm_registration: string;
        municipal_license: string;
    }>;
    contact_information: z.ZodObject<{
        address: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zip_code: z.ZodString;
        phone: z.ZodString;
        email: z.ZodString;
        website: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        address: string;
        city: string;
        state: string;
        zip_code: string;
        phone: string;
        website?: string | undefined;
    }, {
        email: string;
        address: string;
        city: string;
        state: string;
        zip_code: string;
        phone: string;
        website?: string | undefined;
    }>;
    operational_status: z.ZodEnum<["active", "inactive", "suspended", "pending_approval"]>;
    compliance_status: z.ZodObject<{
        lgpd_compliant: z.ZodBoolean;
        anvisa_compliant: z.ZodBoolean;
        cfm_compliant: z.ZodBoolean;
        constitutional_compliant: z.ZodBoolean;
        last_audit_date: z.ZodOptional<z.ZodString>;
        next_audit_due: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        lgpd_compliant: boolean;
        anvisa_compliant: boolean;
        cfm_compliant: boolean;
        constitutional_compliant: boolean;
        next_audit_due: string;
        last_audit_date?: string | undefined;
    }, {
        lgpd_compliant: boolean;
        anvisa_compliant: boolean;
        cfm_compliant: boolean;
        constitutional_compliant: boolean;
        next_audit_due: string;
        last_audit_date?: string | undefined;
    }>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    created_at: string;
    updated_at: string;
    clinic_name: string;
    cnpj: string;
    license_details: {
        valid_until: string;
        anvisa_license: string;
        cfm_registration: string;
        municipal_license: string;
    };
    clinic_id: string;
    cnes_code: string;
    primary_specialty: string;
    contact_information: {
        email: string;
        address: string;
        city: string;
        state: string;
        zip_code: string;
        phone: string;
        website?: string | undefined;
    };
    operational_status: "active" | "suspended" | "inactive" | "pending_approval";
    compliance_status: {
        lgpd_compliant: boolean;
        anvisa_compliant: boolean;
        cfm_compliant: boolean;
        constitutional_compliant: boolean;
        next_audit_due: string;
        last_audit_date?: string | undefined;
    };
    secondary_specialties?: string[] | undefined;
}, {
    created_at: string;
    updated_at: string;
    clinic_name: string;
    cnpj: string;
    license_details: {
        valid_until: string;
        anvisa_license: string;
        cfm_registration: string;
        municipal_license: string;
    };
    clinic_id: string;
    cnes_code: string;
    primary_specialty: string;
    contact_information: {
        email: string;
        address: string;
        city: string;
        state: string;
        zip_code: string;
        phone: string;
        website?: string | undefined;
    };
    operational_status: "active" | "suspended" | "inactive" | "pending_approval";
    compliance_status: {
        lgpd_compliant: boolean;
        anvisa_compliant: boolean;
        cfm_compliant: boolean;
        constitutional_compliant: boolean;
        next_audit_due: string;
        last_audit_date?: string | undefined;
    };
    secondary_specialties?: string[] | undefined;
}>;
declare const MultiClinicConfigSchema: z.ZodObject<{
    tenant_isolation_enabled: z.ZodDefault<z.ZodBoolean>;
    cross_clinic_data_sharing: z.ZodDefault<z.ZodBoolean>;
    centralized_compliance_monitoring: z.ZodDefault<z.ZodBoolean>;
    unified_reporting: z.ZodDefault<z.ZodBoolean>;
    resource_sharing_enabled: z.ZodDefault<z.ZodBoolean>;
    constitutional_validation: z.ZodDefault<z.ZodBoolean>;
    automatic_compliance_sync: z.ZodDefault<z.ZodBoolean>;
    audit_trail_enabled: z.ZodDefault<z.ZodBoolean>;
    privacy_by_design: z.ZodDefault<z.ZodBoolean>;
    max_clinics_per_tenant: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    constitutional_validation: boolean;
    audit_trail_enabled: boolean;
    tenant_isolation_enabled: boolean;
    cross_clinic_data_sharing: boolean;
    centralized_compliance_monitoring: boolean;
    unified_reporting: boolean;
    resource_sharing_enabled: boolean;
    automatic_compliance_sync: boolean;
    privacy_by_design: boolean;
    max_clinics_per_tenant: number;
}, {
    constitutional_validation?: boolean | undefined;
    audit_trail_enabled?: boolean | undefined;
    tenant_isolation_enabled?: boolean | undefined;
    cross_clinic_data_sharing?: boolean | undefined;
    centralized_compliance_monitoring?: boolean | undefined;
    unified_reporting?: boolean | undefined;
    resource_sharing_enabled?: boolean | undefined;
    automatic_compliance_sync?: boolean | undefined;
    privacy_by_design?: boolean | undefined;
    max_clinics_per_tenant?: number | undefined;
}>;
declare const ClinicOperationsSchema: z.ZodObject<{
    operation_id: z.ZodString;
    clinic_id: z.ZodString;
    operation_type: z.ZodEnum<["patient_management", "appointment_scheduling", "treatment_tracking", "compliance_monitoring", "resource_allocation", "staff_management", "inventory_management", "financial_management"]>;
    operation_parameters: z.ZodRecord<z.ZodString, z.ZodAny>;
    privacy_requirements: z.ZodObject<{
        patient_data_involved: z.ZodBoolean;
        anonymization_required: z.ZodBoolean;
        cross_clinic_sharing: z.ZodBoolean;
        lgpd_consent_required: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        anonymization_required: boolean;
        patient_data_involved: boolean;
        cross_clinic_sharing: boolean;
        lgpd_consent_required: boolean;
    }, {
        anonymization_required: boolean;
        patient_data_involved: boolean;
        cross_clinic_sharing: boolean;
        lgpd_consent_required: boolean;
    }>;
    compliance_validation: z.ZodObject<{
        anvisa_approval_required: z.ZodBoolean;
        cfm_validation_required: z.ZodBoolean;
        constitutional_review_needed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        anvisa_approval_required: boolean;
        cfm_validation_required: boolean;
        constitutional_review_needed: boolean;
    }, {
        anvisa_approval_required: boolean;
        cfm_validation_required: boolean;
        constitutional_review_needed: boolean;
    }>;
    execution_status: z.ZodEnum<["pending", "in_progress", "completed", "failed", "cancelled"]>;
    created_at: z.ZodString;
    completed_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    created_at: string;
    privacy_requirements: {
        anonymization_required: boolean;
        patient_data_involved: boolean;
        cross_clinic_sharing: boolean;
        lgpd_consent_required: boolean;
    };
    compliance_validation: {
        anvisa_approval_required: boolean;
        cfm_validation_required: boolean;
        constitutional_review_needed: boolean;
    };
    clinic_id: string;
    operation_id: string;
    operation_type: "patient_management" | "appointment_scheduling" | "treatment_tracking" | "compliance_monitoring" | "resource_allocation" | "staff_management" | "inventory_management" | "financial_management";
    operation_parameters: Record<string, any>;
    execution_status: "cancelled" | "pending" | "completed" | "in_progress" | "failed";
    completed_at?: string | undefined;
}, {
    created_at: string;
    privacy_requirements: {
        anonymization_required: boolean;
        patient_data_involved: boolean;
        cross_clinic_sharing: boolean;
        lgpd_consent_required: boolean;
    };
    compliance_validation: {
        anvisa_approval_required: boolean;
        cfm_validation_required: boolean;
        constitutional_review_needed: boolean;
    };
    clinic_id: string;
    operation_id: string;
    operation_type: "patient_management" | "appointment_scheduling" | "treatment_tracking" | "compliance_monitoring" | "resource_allocation" | "staff_management" | "inventory_management" | "financial_management";
    operation_parameters: Record<string, any>;
    execution_status: "cancelled" | "pending" | "completed" | "in_progress" | "failed";
    completed_at?: string | undefined;
}>;
declare const TenantManagementSchema: z.ZodObject<{
    tenant_id: z.ZodString;
    tenant_name: z.ZodString;
    tenant_type: z.ZodEnum<["healthcare_network", "clinic_chain", "individual_clinic", "medical_group"]>;
    subscription_plan: z.ZodEnum<["basic", "professional", "enterprise", "custom"]>;
    clinics: z.ZodArray<z.ZodObject<{
        clinic_id: z.ZodString;
        clinic_name: z.ZodString;
        cnpj: z.ZodString;
        cnes_code: z.ZodString;
        primary_specialty: z.ZodString;
        secondary_specialties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        license_details: z.ZodObject<{
            anvisa_license: z.ZodString;
            cfm_registration: z.ZodString;
            municipal_license: z.ZodString;
            valid_until: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            valid_until: string;
            anvisa_license: string;
            cfm_registration: string;
            municipal_license: string;
        }, {
            valid_until: string;
            anvisa_license: string;
            cfm_registration: string;
            municipal_license: string;
        }>;
        contact_information: z.ZodObject<{
            address: z.ZodString;
            city: z.ZodString;
            state: z.ZodString;
            zip_code: z.ZodString;
            phone: z.ZodString;
            email: z.ZodString;
            website: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            address: string;
            city: string;
            state: string;
            zip_code: string;
            phone: string;
            website?: string | undefined;
        }, {
            email: string;
            address: string;
            city: string;
            state: string;
            zip_code: string;
            phone: string;
            website?: string | undefined;
        }>;
        operational_status: z.ZodEnum<["active", "inactive", "suspended", "pending_approval"]>;
        compliance_status: z.ZodObject<{
            lgpd_compliant: z.ZodBoolean;
            anvisa_compliant: z.ZodBoolean;
            cfm_compliant: z.ZodBoolean;
            constitutional_compliant: z.ZodBoolean;
            last_audit_date: z.ZodOptional<z.ZodString>;
            next_audit_due: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            lgpd_compliant: boolean;
            anvisa_compliant: boolean;
            cfm_compliant: boolean;
            constitutional_compliant: boolean;
            next_audit_due: string;
            last_audit_date?: string | undefined;
        }, {
            lgpd_compliant: boolean;
            anvisa_compliant: boolean;
            cfm_compliant: boolean;
            constitutional_compliant: boolean;
            next_audit_due: string;
            last_audit_date?: string | undefined;
        }>;
        created_at: z.ZodString;
        updated_at: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        created_at: string;
        updated_at: string;
        clinic_name: string;
        cnpj: string;
        license_details: {
            valid_until: string;
            anvisa_license: string;
            cfm_registration: string;
            municipal_license: string;
        };
        clinic_id: string;
        cnes_code: string;
        primary_specialty: string;
        contact_information: {
            email: string;
            address: string;
            city: string;
            state: string;
            zip_code: string;
            phone: string;
            website?: string | undefined;
        };
        operational_status: "active" | "suspended" | "inactive" | "pending_approval";
        compliance_status: {
            lgpd_compliant: boolean;
            anvisa_compliant: boolean;
            cfm_compliant: boolean;
            constitutional_compliant: boolean;
            next_audit_due: string;
            last_audit_date?: string | undefined;
        };
        secondary_specialties?: string[] | undefined;
    }, {
        created_at: string;
        updated_at: string;
        clinic_name: string;
        cnpj: string;
        license_details: {
            valid_until: string;
            anvisa_license: string;
            cfm_registration: string;
            municipal_license: string;
        };
        clinic_id: string;
        cnes_code: string;
        primary_specialty: string;
        contact_information: {
            email: string;
            address: string;
            city: string;
            state: string;
            zip_code: string;
            phone: string;
            website?: string | undefined;
        };
        operational_status: "active" | "suspended" | "inactive" | "pending_approval";
        compliance_status: {
            lgpd_compliant: boolean;
            anvisa_compliant: boolean;
            cfm_compliant: boolean;
            constitutional_compliant: boolean;
            next_audit_due: string;
            last_audit_date?: string | undefined;
        };
        secondary_specialties?: string[] | undefined;
    }>, "many">;
    tenant_settings: z.ZodObject<{
        data_retention_days: z.ZodNumber;
        backup_frequency: z.ZodEnum<["daily", "weekly", "real_time"]>;
        compliance_level: z.ZodEnum<["standard", "enhanced", "maximum"]>;
        privacy_protection_level: z.ZodEnum<["basic", "advanced", "maximum"]>;
        audit_frequency: z.ZodEnum<["monthly", "quarterly", "semi_annual", "annual"]>;
    }, "strip", z.ZodTypeAny, {
        data_retention_days: number;
        backup_frequency: "daily" | "weekly" | "real_time";
        compliance_level: "maximum" | "standard" | "enhanced";
        privacy_protection_level: "maximum" | "basic" | "advanced";
        audit_frequency: "monthly" | "quarterly" | "annual" | "semi_annual";
    }, {
        data_retention_days: number;
        backup_frequency: "daily" | "weekly" | "real_time";
        compliance_level: "maximum" | "standard" | "enhanced";
        privacy_protection_level: "maximum" | "basic" | "advanced";
        audit_frequency: "monthly" | "quarterly" | "annual" | "semi_annual";
    }>;
    compliance_profile: z.ZodObject<{
        lgpd_data_controller: z.ZodString;
        lgpd_data_protection_officer: z.ZodString;
        anvisa_responsible_technical: z.ZodString;
        cfm_medical_director: z.ZodString;
        constitutional_compliance_officer: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        lgpd_data_controller: string;
        lgpd_data_protection_officer: string;
        anvisa_responsible_technical: string;
        cfm_medical_director: string;
        constitutional_compliance_officer: string;
    }, {
        lgpd_data_controller: string;
        lgpd_data_protection_officer: string;
        anvisa_responsible_technical: string;
        cfm_medical_director: string;
        constitutional_compliance_officer: string;
    }>;
    operational_metrics: z.ZodObject<{
        total_patients: z.ZodNumber;
        active_professionals: z.ZodNumber;
        monthly_appointments: z.ZodNumber;
        compliance_score: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        compliance_score: number;
        total_patients: number;
        active_professionals: number;
        monthly_appointments: number;
    }, {
        compliance_score: number;
        total_patients: number;
        active_professionals: number;
        monthly_appointments: number;
    }>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    created_at: string;
    updated_at: string;
    tenant_id: string;
    operational_metrics: {
        compliance_score: number;
        total_patients: number;
        active_professionals: number;
        monthly_appointments: number;
    };
    tenant_name: string;
    tenant_type: "healthcare_network" | "clinic_chain" | "individual_clinic" | "medical_group";
    subscription_plan: "custom" | "basic" | "professional" | "enterprise";
    clinics: {
        created_at: string;
        updated_at: string;
        clinic_name: string;
        cnpj: string;
        license_details: {
            valid_until: string;
            anvisa_license: string;
            cfm_registration: string;
            municipal_license: string;
        };
        clinic_id: string;
        cnes_code: string;
        primary_specialty: string;
        contact_information: {
            email: string;
            address: string;
            city: string;
            state: string;
            zip_code: string;
            phone: string;
            website?: string | undefined;
        };
        operational_status: "active" | "suspended" | "inactive" | "pending_approval";
        compliance_status: {
            lgpd_compliant: boolean;
            anvisa_compliant: boolean;
            cfm_compliant: boolean;
            constitutional_compliant: boolean;
            next_audit_due: string;
            last_audit_date?: string | undefined;
        };
        secondary_specialties?: string[] | undefined;
    }[];
    tenant_settings: {
        data_retention_days: number;
        backup_frequency: "daily" | "weekly" | "real_time";
        compliance_level: "maximum" | "standard" | "enhanced";
        privacy_protection_level: "maximum" | "basic" | "advanced";
        audit_frequency: "monthly" | "quarterly" | "annual" | "semi_annual";
    };
    compliance_profile: {
        lgpd_data_controller: string;
        lgpd_data_protection_officer: string;
        anvisa_responsible_technical: string;
        cfm_medical_director: string;
        constitutional_compliance_officer: string;
    };
}, {
    created_at: string;
    updated_at: string;
    tenant_id: string;
    operational_metrics: {
        compliance_score: number;
        total_patients: number;
        active_professionals: number;
        monthly_appointments: number;
    };
    tenant_name: string;
    tenant_type: "healthcare_network" | "clinic_chain" | "individual_clinic" | "medical_group";
    subscription_plan: "custom" | "basic" | "professional" | "enterprise";
    clinics: {
        created_at: string;
        updated_at: string;
        clinic_name: string;
        cnpj: string;
        license_details: {
            valid_until: string;
            anvisa_license: string;
            cfm_registration: string;
            municipal_license: string;
        };
        clinic_id: string;
        cnes_code: string;
        primary_specialty: string;
        contact_information: {
            email: string;
            address: string;
            city: string;
            state: string;
            zip_code: string;
            phone: string;
            website?: string | undefined;
        };
        operational_status: "active" | "suspended" | "inactive" | "pending_approval";
        compliance_status: {
            lgpd_compliant: boolean;
            anvisa_compliant: boolean;
            cfm_compliant: boolean;
            constitutional_compliant: boolean;
            next_audit_due: string;
            last_audit_date?: string | undefined;
        };
        secondary_specialties?: string[] | undefined;
    }[];
    tenant_settings: {
        data_retention_days: number;
        backup_frequency: "daily" | "weekly" | "real_time";
        compliance_level: "maximum" | "standard" | "enhanced";
        privacy_protection_level: "maximum" | "basic" | "advanced";
        audit_frequency: "monthly" | "quarterly" | "annual" | "semi_annual";
    };
    compliance_profile: {
        lgpd_data_controller: string;
        lgpd_data_protection_officer: string;
        anvisa_responsible_technical: string;
        cfm_medical_director: string;
        constitutional_compliance_officer: string;
    };
}>;
export type Clinic = z.infer<typeof ClinicSchema>;
export type MultiClinicConfig = z.infer<typeof MultiClinicConfigSchema>;
export type ClinicOperations = z.infer<typeof ClinicOperationsSchema>;
export type TenantManagement = z.infer<typeof TenantManagementSchema>;
export type MultiClinicManagementAudit = {
    audit_id: string;
    tenant_id: string;
    clinic_id?: string;
    management_action: string;
    action_parameters: Record<string, any>;
    compliance_validation_result: Record<string, any>;
    privacy_impact_assessment: Record<string, any>;
    constitutional_compliance_score: number;
    created_at: string;
    created_by: string;
    regulatory_approvals: {
        anvisa_approval: boolean;
        cfm_approval: boolean;
        lgpd_compliance: boolean;
    };
};
/**
 * Multi-Clinic Management Service
 * Constitutional healthcare multi-clinic and tenant management with regulatory compliance
 */
export declare class MultiClinicManagementService {
    private readonly config;
    private readonly tenants;
    private readonly clinics;
    private readonly auditTrail;
    constructor(config: MultiClinicConfig);
    /**
     * Create new tenant with constitutional healthcare compliance
     */
    createTenant(tenantData: Omit<TenantManagement, 'created_at' | 'updated_at'>): Promise<{
        success: boolean;
        tenant_id: string;
        compliance_validation: Record<string, any>;
    }>;
    /**
     * Add clinic to existing tenant with regulatory validation
     */
    addClinicToTenant(tenantId: string, clinicData: Omit<Clinic, 'created_at' | 'updated_at'>): Promise<{
        success: boolean;
        clinic_id: string;
        regulatory_approvals: Record<string, boolean>;
    }>;
    /**
     * Execute cross-clinic operations with constitutional privacy protection
     */
    executeCrossClinicOperation(tenantId: string, operation: Omit<ClinicOperations, 'operation_id' | 'created_at' | 'completed_at' | 'execution_status'>): Promise<{
        success: boolean;
        operation_id: string;
        privacy_protection_applied: Record<string, any>;
    }>;
    /**
     * Generate unified compliance report across all clinics
     */
    generateUnifiedComplianceReport(tenantId: string): Promise<{
        tenant_summary: Record<string, any>;
        clinic_compliance_details: Record<string, any>[];
        overall_compliance_score: number;
        recommendations: string[];
        constitutional_certification: Record<string, any>;
    }>;
    /**
     * Manage resource sharing between clinics with privacy protection
     */
    manageResourceSharing(tenantId: string, sourceClinicId: string, targetClinicId: string, resourceType: string, resourceData: any): Promise<{
        success: boolean;
        sharing_id: string;
        privacy_protection_applied: Record<string, any>;
    }>;
    private validateTenantConstitutionalCompliance;
    private validateTenantLgpdCompliance;
    private initializeTenantWithPrivacyByDesign;
    private validateClinicRegulatoryCompliance;
    private validateAnvisaLicense;
    private validateCfmRegistration;
    private validateCnesRegistration;
    private validatePatientDataPrivacy;
    private validateOperationCompliance;
    private applyOperationPrivacyProtection;
    private executeOperationByType;
    private assessClinicCompliance;
    private calculateOverallComplianceScore;
    private generateComplianceRecommendations;
    private applyResourceSharingPrivacyProtection;
    private validateResourceSharingCompliance;
    /**
     * Get all tenants for administrative purposes
     */
    getAllTenants(): TenantManagement[];
    /**
     * Get specific tenant details
     */
    getTenant(tenantId: string): TenantManagement | null;
    /**
     * Get all clinics for a tenant
     */
    getTenantClinics(tenantId: string): Clinic[];
    /**
     * Get audit trail for compliance reporting
     */
    getAuditTrail(): MultiClinicManagementAudit[];
    /**
     * Validate constitutional compliance of multi-clinic management
     */
    validateConstitutionalCompliance(): Promise<{
        compliant: boolean;
        score: number;
        issues: string[];
    }>;
}
/**
 * Factory function to create multi-clinic management service
 */
export declare function createMultiClinicManagementService(config: MultiClinicConfig): MultiClinicManagementService;
/**
 * Constitutional validation for multi-clinic management operations
 */
export declare function validateMultiClinicManagement(config: MultiClinicConfig): Promise<{
    valid: boolean;
    violations: string[];
}>;
export {};
