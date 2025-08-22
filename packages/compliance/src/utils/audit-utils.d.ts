/**
 * Audit Trail Utilities for Healthcare Compliance
 * LGPD and healthcare regulation compliance audit logging
 */
import { z } from 'zod';
export type AuditLogEntry = {
    id: string;
    timestamp: Date;
    user_id: string;
    action: string;
    resource_type: string;
    resource_id: string;
    clinic_id: string;
    ip_address?: string;
    user_agent?: string;
    before_state?: Record<string, any>;
    after_state?: Record<string, any>;
    compliance_context: {
        lgpd_basis: string;
        data_category: 'personal' | 'sensitive' | 'health' | 'administrative';
        retention_period: number;
        access_level: 'read' | 'write' | 'delete' | 'export';
    };
};
export declare const HEALTHCARE_ACTIONS: {
    readonly PATIENT_VIEW: "patient:view";
    readonly PATIENT_CREATE: "patient:create";
    readonly PATIENT_UPDATE: "patient:update";
    readonly PATIENT_DELETE: "patient:delete";
    readonly PATIENT_EXPORT: "patient:export";
    readonly RECORD_VIEW: "medical_record:view";
    readonly RECORD_CREATE: "medical_record:create";
    readonly RECORD_UPDATE: "medical_record:update";
    readonly RECORD_DELETE: "medical_record:delete";
    readonly APPOINTMENT_VIEW: "appointment:view";
    readonly APPOINTMENT_CREATE: "appointment:create";
    readonly APPOINTMENT_UPDATE: "appointment:update";
    readonly APPOINTMENT_CANCEL: "appointment:cancel";
    readonly LOGIN_SUCCESS: "auth:login_success";
    readonly LOGIN_FAILURE: "auth:login_failure";
    readonly LOGOUT: "auth:logout";
    readonly DATA_EXPORT: "data:export";
    readonly DATA_IMPORT: "data:import";
    readonly REPORT_GENERATE: "report:generate";
};
export declare const LGPD_BASIS: {
    readonly CONSENT: "consent";
    readonly CONTRACT: "contract";
    readonly LEGAL_OBLIGATION: "legal_obligation";
    readonly VITAL_INTERESTS: "vital_interests";
    readonly PUBLIC_TASK: "public_task";
    readonly LEGITIMATE_INTERESTS: "legitimate_interests";
    readonly HEALTHCARE_PROCEDURE: "healthcare_procedure";
};
export declare function createAuditLog(params: {
    user_id: string;
    action: string;
    resource_type: string;
    resource_id: string;
    clinic_id: string;
    ip_address?: string;
    user_agent?: string;
    before_state?: Record<string, any>;
    after_state?: Record<string, any>;
    lgpd_basis?: string;
    data_category?: 'personal' | 'sensitive' | 'health' | 'administrative';
}): AuditLogEntry;
export declare const AuditLogSchema: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodDate;
    user_id: z.ZodString;
    action: z.ZodString;
    resource_type: z.ZodString;
    resource_id: z.ZodString;
    clinic_id: z.ZodString;
    ip_address: z.ZodOptional<z.ZodString>;
    user_agent: z.ZodOptional<z.ZodString>;
    before_state: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    after_state: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    compliance_context: z.ZodObject<{
        lgpd_basis: z.ZodString;
        data_category: z.ZodEnum<["personal", "sensitive", "health", "administrative"]>;
        retention_period: z.ZodNumber;
        access_level: z.ZodEnum<["read", "write", "delete", "export"]>;
    }, "strip", z.ZodTypeAny, {
        access_level: "read" | "write" | "delete" | "export";
        retention_period: number;
        lgpd_basis: string;
        data_category: "administrative" | "sensitive" | "personal" | "health";
    }, {
        access_level: "read" | "write" | "delete" | "export";
        retention_period: number;
        lgpd_basis: string;
        data_category: "administrative" | "sensitive" | "personal" | "health";
    }>;
}, "strip", z.ZodTypeAny, {
    action: string;
    id: string;
    timestamp: Date;
    user_id: string;
    resource_type: string;
    clinic_id: string;
    resource_id: string;
    compliance_context: {
        access_level: "read" | "write" | "delete" | "export";
        retention_period: number;
        lgpd_basis: string;
        data_category: "administrative" | "sensitive" | "personal" | "health";
    };
    ip_address?: string | undefined;
    user_agent?: string | undefined;
    before_state?: Record<string, any> | undefined;
    after_state?: Record<string, any> | undefined;
}, {
    action: string;
    id: string;
    timestamp: Date;
    user_id: string;
    resource_type: string;
    clinic_id: string;
    resource_id: string;
    compliance_context: {
        access_level: "read" | "write" | "delete" | "export";
        retention_period: number;
        lgpd_basis: string;
        data_category: "administrative" | "sensitive" | "personal" | "health";
    };
    ip_address?: string | undefined;
    user_agent?: string | undefined;
    before_state?: Record<string, any> | undefined;
    after_state?: Record<string, any> | undefined;
}>;
export declare function anonymizeAuditData(data: Record<string, any>): Record<string, any>;
export type AuditReport = {
    period: {
        start: Date;
        end: Date;
    };
    total_entries: number;
    by_action: Record<string, number>;
    by_user: Record<string, number>;
    by_data_category: Record<string, number>;
    compliance_score: number;
    violations: string[];
};
export declare function generateAuditReport(logs: AuditLogEntry[], startDate: Date, endDate: Date): AuditReport;
