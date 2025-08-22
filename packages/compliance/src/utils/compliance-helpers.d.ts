/**
 * Compliance Helper Utilities
 * Common utilities for healthcare compliance validation
 */
import { z } from 'zod';
export declare function validateCPF(cpf: string): boolean;
export declare function validateCNPJ(cnpj: string): boolean;
export declare function validateProfessionalRegistration(registration: string, type: 'CRM' | 'COREN' | 'CRO' | 'CRF'): boolean;
export declare function classifyDataSensitivity(fieldName: string): 'public' | 'internal' | 'confidential' | 'restricted';
export declare const HealthcareProfessionalSchema: z.ZodObject<{
    name: z.ZodString;
    cpf: z.ZodEffects<z.ZodString, string, string>;
    registration_number: z.ZodString;
    registration_type: z.ZodEnum<["CRM", "COREN", "CRO", "CRF"]>;
    registration_state: z.ZodString;
    specialty: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    cpf: string;
    registration_number: string;
    registration_type: "CRM" | "COREN" | "CRO" | "CRF";
    registration_state: string;
    specialty?: string | undefined;
}, {
    name: string;
    cpf: string;
    registration_number: string;
    registration_type: "CRM" | "COREN" | "CRO" | "CRF";
    registration_state: string;
    specialty?: string | undefined;
}>;
export declare const ClinicSchema: z.ZodObject<{
    name: z.ZodString;
    cnpj: z.ZodEffects<z.ZodString, string, string>;
    anvisa_license: z.ZodOptional<z.ZodString>;
    operating_license: z.ZodString;
    address: z.ZodObject<{
        street: z.ZodString;
        number: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        postal_code: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        number: string;
        city: string;
        state: string;
        street: string;
        postal_code: string;
    }, {
        number: string;
        city: string;
        state: string;
        street: string;
        postal_code: string;
    }>;
}, "strip", z.ZodTypeAny, {
    name: string;
    cnpj: string;
    address: {
        number: string;
        city: string;
        state: string;
        street: string;
        postal_code: string;
    };
    operating_license: string;
    anvisa_license?: string | undefined;
}, {
    name: string;
    cnpj: string;
    address: {
        number: string;
        city: string;
        state: string;
        street: string;
        postal_code: string;
    };
    operating_license: string;
    anvisa_license?: string | undefined;
}>;
export declare const PatientConsentSchema: z.ZodObject<{
    patient_id: z.ZodString;
    consent_type: z.ZodEnum<["data_processing", "image_use", "treatment", "research"]>;
    granted: z.ZodBoolean;
    granted_at: z.ZodDate;
    expires_at: z.ZodOptional<z.ZodDate>;
    witness_id: z.ZodOptional<z.ZodString>;
    digital_signature: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patient_id: string;
    consent_type: "data_processing" | "treatment" | "image_use" | "research";
    granted: boolean;
    granted_at: Date;
    expires_at?: Date | undefined;
    witness_id?: string | undefined;
    digital_signature?: string | undefined;
}, {
    patient_id: string;
    consent_type: "data_processing" | "treatment" | "image_use" | "research";
    granted: boolean;
    granted_at: Date;
    expires_at?: Date | undefined;
    witness_id?: string | undefined;
    digital_signature?: string | undefined;
}>;
