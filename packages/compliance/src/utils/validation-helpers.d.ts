/**
 * Validation Helpers for Healthcare Compliance
 * ANVISA, CFM, LGPD validation utilities
 */
import { z } from 'zod';
export declare function validateAnvisaRegistration(registration: string): boolean;
export declare function validateCFMLicense(license: string, state: string): boolean;
export declare function validateLGPDConsent(consent: {
    purpose: string;
    granted: boolean;
    granted_at: Date;
    data_types: string[];
    retention_period: number;
}): {
    valid: boolean;
    errors: string[];
};
export declare function validateHealthcareProfessionalAccess(user: any, requiredRole: string[]): {
    authorized: boolean;
    reason?: string;
};
export declare function validateCEP(cep: string): boolean;
export declare function validateBrazilianPhone(phone: string): boolean;
export declare function validateDataRetention(dataType: string, createdAt: Date, retentionPolicy: Record<string, number>): {
    expired: boolean;
    expiryDate: Date;
    daysRemaining: number;
};
export declare const MedicalProcedureSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    category: z.ZodEnum<["aesthetic", "clinical", "surgical", "diagnostic"]>;
    duration_minutes: z.ZodNumber;
    requires_anesthesia: z.ZodBoolean;
    anvisa_regulated: z.ZodBoolean;
    minimum_interval_days: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    code: string;
    category: "aesthetic" | "clinical" | "surgical" | "diagnostic";
    name: string;
    duration_minutes: number;
    requires_anesthesia: boolean;
    anvisa_regulated: boolean;
    minimum_interval_days: number;
}, {
    code: string;
    category: "aesthetic" | "clinical" | "surgical" | "diagnostic";
    name: string;
    duration_minutes: number;
    requires_anesthesia: boolean;
    anvisa_regulated: boolean;
    minimum_interval_days: number;
}>;
export declare const TreatmentPlanSchema: z.ZodObject<{
    patient_id: z.ZodString;
    professional_id: z.ZodString;
    procedures: z.ZodArray<z.ZodString, "many">;
    start_date: z.ZodDate;
    estimated_duration_weeks: z.ZodNumber;
    contraindications: z.ZodArray<z.ZodString, "many">;
    patient_consent: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
    professional_notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    contraindications: string[];
    patient_id: string;
    start_date: Date;
    professional_id: string;
    procedures: string[];
    estimated_duration_weeks: number;
    patient_consent: boolean;
    professional_notes?: string | undefined;
}, {
    contraindications: string[];
    patient_id: string;
    start_date: Date;
    professional_id: string;
    procedures: string[];
    estimated_duration_weeks: number;
    patient_consent: boolean;
    professional_notes?: string | undefined;
}>;
export declare const AppointmentSchema: z.ZodObject<{
    patient_id: z.ZodString;
    professional_id: z.ZodString;
    procedure_id: z.ZodString;
    scheduled_at: z.ZodEffects<z.ZodDate, Date, Date>;
    duration_minutes: z.ZodNumber;
    status: z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled"]>;
    clinic_room: z.ZodOptional<z.ZodString>;
    pre_appointment_notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "cancelled" | "scheduled" | "completed" | "confirmed" | "in_progress";
    patient_id: string;
    duration_minutes: number;
    professional_id: string;
    procedure_id: string;
    scheduled_at: Date;
    clinic_room?: string | undefined;
    pre_appointment_notes?: string | undefined;
}, {
    status: "cancelled" | "scheduled" | "completed" | "confirmed" | "in_progress";
    patient_id: string;
    duration_minutes: number;
    professional_id: string;
    procedure_id: string;
    scheduled_at: Date;
    clinic_room?: string | undefined;
    pre_appointment_notes?: string | undefined;
}>;
export declare const PatientConsentValidationSchema: z.ZodEffects<z.ZodObject<{
    patient_id: z.ZodString;
    procedure_id: z.ZodString;
    consent_type: z.ZodEnum<["treatment", "image_use", "data_processing", "research"]>;
    granted: z.ZodBoolean;
    granted_at: z.ZodDate;
    witness_required: z.ZodBoolean;
    witness_id: z.ZodOptional<z.ZodString>;
    digital_signature: z.ZodOptional<z.ZodString>;
    expiry_date: z.ZodOptional<z.ZodDate>;
    revocable: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    patient_id: string;
    consent_type: "data_processing" | "treatment" | "image_use" | "research";
    granted: boolean;
    granted_at: Date;
    procedure_id: string;
    witness_required: boolean;
    revocable: boolean;
    expiry_date?: Date | undefined;
    witness_id?: string | undefined;
    digital_signature?: string | undefined;
}, {
    patient_id: string;
    consent_type: "data_processing" | "treatment" | "image_use" | "research";
    granted: boolean;
    granted_at: Date;
    procedure_id: string;
    witness_required: boolean;
    expiry_date?: Date | undefined;
    witness_id?: string | undefined;
    digital_signature?: string | undefined;
    revocable?: boolean | undefined;
}>, {
    patient_id: string;
    consent_type: "data_processing" | "treatment" | "image_use" | "research";
    granted: boolean;
    granted_at: Date;
    procedure_id: string;
    witness_required: boolean;
    revocable: boolean;
    expiry_date?: Date | undefined;
    witness_id?: string | undefined;
    digital_signature?: string | undefined;
}, {
    patient_id: string;
    consent_type: "data_processing" | "treatment" | "image_use" | "research";
    granted: boolean;
    granted_at: Date;
    procedure_id: string;
    witness_required: boolean;
    expiry_date?: Date | undefined;
    witness_id?: string | undefined;
    digital_signature?: string | undefined;
    revocable?: boolean | undefined;
}>;
export declare function validateBatch<T>(items: unknown[], schema: z.ZodSchema<T>): {
    valid: T[];
    invalid: {
        item: unknown;
        errors: string[];
    }[];
};
export type ComplianceSummary = {
    lgpd_score: number;
    anvisa_score: number;
    cfm_score: number;
    overall_score: number;
    violations: string[];
    recommendations: string[];
};
export declare function generateComplianceSummary(validationResults: {
    lgpd_violations: string[];
    anvisa_violations: string[];
    cfm_violations: string[];
}): ComplianceSummary;
