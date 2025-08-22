/**
 * LGPD Audit Logger
 * Constitutional compliance audit logging with privacy protection
 * Compliance: LGPD + Constitutional Privacy + ≥9.9/10 Standards
 */
import type { Database } from '@neonpro/types';
import { z } from 'zod';
export declare const LGPDAuditLogEntrySchema: z.ZodObject<{
    log_id: z.ZodString;
    timestamp: z.ZodString;
    event_type: z.ZodEnum<["data_access", "data_modification", "data_deletion", "consent_given", "consent_withdrawn", "data_export", "data_transfer", "breach_detected", "privacy_violation", "constitutional_violation"]>;
    user_id: z.ZodOptional<z.ZodString>;
    data_subject_id: z.ZodOptional<z.ZodString>;
    legal_basis: z.ZodString;
    purpose: z.ZodString;
    data_categories: z.ZodArray<z.ZodString, "many">;
    processing_details: z.ZodObject<{
        operation: z.ZodString;
        data_volume: z.ZodOptional<z.ZodNumber>;
        retention_period: z.ZodOptional<z.ZodString>;
        automated_decision: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        operation: string;
        automated_decision: boolean;
        data_volume?: number | undefined;
        retention_period?: string | undefined;
    }, {
        operation: string;
        data_volume?: number | undefined;
        retention_period?: string | undefined;
        automated_decision?: boolean | undefined;
    }>;
    constitutional_impact: z.ZodObject<{
        privacy_rights_affected: z.ZodBoolean;
        fundamental_rights_impact: z.ZodOptional<z.ZodString>;
        constitutional_basis: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        privacy_rights_affected: boolean;
        fundamental_rights_impact?: string | undefined;
        constitutional_basis?: string | undefined;
    }, {
        privacy_rights_affected: boolean;
        fundamental_rights_impact?: string | undefined;
        constitutional_basis?: string | undefined;
    }>;
    compliance_validation: z.ZodObject<{
        lgpd_compliant: z.ZodBoolean;
        constitutional_compliant: z.ZodBoolean;
        validation_score: z.ZodNumber;
        violations_detected: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        lgpd_compliant: boolean;
        constitutional_compliant: boolean;
        validation_score: number;
        violations_detected: string[];
    }, {
        lgpd_compliant: boolean;
        constitutional_compliant: boolean;
        validation_score: number;
        violations_detected: string[];
    }>;
    audit_trail: z.ZodObject<{
        logged_by: z.ZodString;
        log_source: z.ZodString;
        integrity_hash: z.ZodString;
        quality_score: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        logged_by: string;
        log_source: string;
        integrity_hash: string;
        quality_score: number;
    }, {
        logged_by: string;
        log_source: string;
        integrity_hash: string;
        quality_score: number;
    }>;
}, "strip", z.ZodTypeAny, {
    audit_trail: {
        logged_by: string;
        log_source: string;
        integrity_hash: string;
        quality_score: number;
    };
    timestamp: string;
    log_id: string;
    event_type: "constitutional_violation" | "data_access" | "data_modification" | "data_deletion" | "consent_given" | "consent_withdrawn" | "data_export" | "data_transfer" | "breach_detected" | "privacy_violation";
    legal_basis: string;
    purpose: string;
    data_categories: string[];
    processing_details: {
        operation: string;
        automated_decision: boolean;
        data_volume?: number | undefined;
        retention_period?: string | undefined;
    };
    constitutional_impact: {
        privacy_rights_affected: boolean;
        fundamental_rights_impact?: string | undefined;
        constitutional_basis?: string | undefined;
    };
    compliance_validation: {
        lgpd_compliant: boolean;
        constitutional_compliant: boolean;
        validation_score: number;
        violations_detected: string[];
    };
    user_id?: string | undefined;
    data_subject_id?: string | undefined;
}, {
    audit_trail: {
        logged_by: string;
        log_source: string;
        integrity_hash: string;
        quality_score: number;
    };
    timestamp: string;
    log_id: string;
    event_type: "constitutional_violation" | "data_access" | "data_modification" | "data_deletion" | "consent_given" | "consent_withdrawn" | "data_export" | "data_transfer" | "breach_detected" | "privacy_violation";
    legal_basis: string;
    purpose: string;
    data_categories: string[];
    processing_details: {
        operation: string;
        data_volume?: number | undefined;
        retention_period?: string | undefined;
        automated_decision?: boolean | undefined;
    };
    constitutional_impact: {
        privacy_rights_affected: boolean;
        fundamental_rights_impact?: string | undefined;
        constitutional_basis?: string | undefined;
    };
    compliance_validation: {
        lgpd_compliant: boolean;
        constitutional_compliant: boolean;
        validation_score: number;
        violations_detected: string[];
    };
    user_id?: string | undefined;
    data_subject_id?: string | undefined;
}>;
export declare const LGPDAuditConfigSchema: z.ZodObject<{
    retention_period_days: z.ZodDefault<z.ZodNumber>;
    real_time_monitoring: z.ZodDefault<z.ZodBoolean>;
    constitutional_validation: z.ZodDefault<z.ZodBoolean>;
    privacy_preserving_logging: z.ZodDefault<z.ZodBoolean>;
    integrity_verification: z.ZodDefault<z.ZodBoolean>;
    automated_alerts: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    retention_period_days: number;
    real_time_monitoring: boolean;
    constitutional_validation: boolean;
    privacy_preserving_logging: boolean;
    integrity_verification: boolean;
    automated_alerts: boolean;
}, {
    retention_period_days?: number | undefined;
    real_time_monitoring?: boolean | undefined;
    constitutional_validation?: boolean | undefined;
    privacy_preserving_logging?: boolean | undefined;
    integrity_verification?: boolean | undefined;
    automated_alerts?: boolean | undefined;
}>;
export type LGPDAuditLogEntry = z.infer<typeof LGPDAuditLogEntrySchema>;
export type LGPDAuditConfig = z.infer<typeof LGPDAuditConfigSchema>;
/**
 * LGPD Audit Logger Service
 * Provides constitutional compliance audit logging
 */
export declare class LGPDAuditLogger {
    private readonly config;
    private readonly db;
    constructor(config: LGPDAuditConfig, db: Database);
    /**
     * Log data processing activity
     */
    logDataProcessing(activity: {
        event_type: LGPDAuditLogEntry['event_type'];
        user_id?: string;
        data_subject_id?: string;
        legal_basis: string;
        purpose: string;
        data_categories: string[];
        operation: string;
        data_volume?: number;
        retention_period?: string;
        automated_decision?: boolean;
    }): Promise<LGPDAuditLogEntry>;
    /**
     * Log consent activity
     */
    logConsentActivity(activity: {
        event_type: 'consent_given' | 'consent_withdrawn';
        data_subject_id: string;
        purpose: string;
        legal_basis: string;
        consent_details: {
            specific: boolean;
            informed: boolean;
            unambiguous: boolean;
            freely_given: boolean;
        };
    }): Promise<LGPDAuditLogEntry>;
    /**
     * Log data breach incident
     */
    logDataBreach(breach: {
        data_subject_id?: string;
        affected_data_categories: string[];
        breach_severity: 'low' | 'medium' | 'high' | 'critical';
        breach_description: string;
        containment_measures: string[];
        notification_required: boolean;
    }): Promise<LGPDAuditLogEntry>;
    /**
     * Assess constitutional impact
     */
    private assessConstitutionalImpact;
    /**
     * Validate compliance
     */
    private validateCompliance;
    /**
     * Generate integrity hash
     */
    private generateIntegrityHash;
    /**
     * Store audit log
     */
    private storeAuditLog;
    /**
     * Trigger compliance alert
     */
    private triggerComplianceAlert;
    /**
     * Query audit logs
     */
    queryAuditLogs(_filters: {
        start_date?: string;
        end_date?: string;
        event_type?: LGPDAuditLogEntry['event_type'];
        data_subject_id?: string;
        user_id?: string;
    }): Promise<LGPDAuditLogEntry[]>;
    /**
     * Generate audit report
     */
    generateAuditReport(period: {
        start_date: string;
        end_date: string;
    }): Promise<{
        report_id: string;
        period: typeof period;
        total_events: number;
        compliance_score: number;
        violations_summary: Record<string, number>;
        constitutional_impact_summary: {
            privacy_rights_affected_events: number;
            fundamental_rights_impact_events: number;
        };
    }>;
}
/**
 * Create LGPD Audit Logger service
 */
export declare function createLGPDAuditLogger(config: LGPDAuditConfig, db: Database): LGPDAuditLogger;
/**
 * Validate LGPD audit configuration
 */
export declare function validateLGPDAuditConfig(config: LGPDAuditConfig): Promise<{
    valid: boolean;
    violations: string[];
}>;
