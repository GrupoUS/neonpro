/**
 * Enterprise Audit Trail Generator Service
 * Constitutional healthcare audit trail generation and management
 *
 * @fileoverview Comprehensive audit trail generation for constitutional compliance
 * @version 1.0.0
 * @since 2025-01-17
 */
import type { createClient } from '@supabase/supabase-js';
/**
 * Audit Trail Entry Interface
 * Constitutional audit trail entry for healthcare compliance
 */
export type AuditTrailEntry = {
    /** Unique audit entry identifier */
    audit_entry_id: string;
    /** Audit trail session identifier */
    audit_trail_id: string;
    /** Sequence number in trail */
    sequence_number: number;
    /** Timestamp of the audited event */
    event_timestamp: Date;
    /** Type of event being audited */
    event_type: 'data_access' | 'data_modification' | 'system_access' | 'compliance_action' | 'constitutional_event';
    /** Event category classification */
    event_category: 'authentication' | 'authorization' | 'data_processing' | 'compliance_validation' | 'patient_interaction' | 'administrative';
    /** User who performed the action */
    user_id: string;
    /** User role at time of action */
    user_role: string;
    /** Resource affected by the action */
    resource_affected: {
        /** Resource type (patient data, system config, etc.) */
        resource_type: string;
        /** Resource identifier */
        resource_id: string;
        /** Resource description */
        resource_description: string;
    };
    /** Action performed */
    action_performed: string;
    /** Previous state (for modifications) */
    previous_state?: Record<string, any>;
    /** New state (for modifications) */
    new_state?: Record<string, any>;
    /** IP address of the action origin */
    ip_address: string;
    /** User agent information */
    user_agent: string;
    /** Session identifier */
    session_id: string;
    /** Constitutional compliance context */
    constitutional_context: {
        /** LGPD compliance relevance */
        lgpd_relevant: boolean;
        /** Patient data involved */
        patient_data_involved: boolean;
        /** Constitutional requirement triggered */
        constitutional_requirement: string;
        /** Privacy impact assessment */
        privacy_impact: 'none' | 'low' | 'medium' | 'high';
    };
    /** Associated clinic/tenant */
    tenant_id: string;
    /** Audit entry integrity hash */
    integrity_hash: string;
};
/**
 * Audit Trail Configuration Interface
 * Constitutional configuration for audit trail generation
 */
export type AuditTrailConfiguration = {
    /** Configuration identifier */
    config_id: string;
    /** Associated tenant */
    tenant_id: string;
    /** Audit retention period (days) */
    retention_period_days: number;
    /** Events to audit */
    events_to_audit: {
        /** Data access events */
        data_access_events: boolean;
        /** System authentication events */
        authentication_events: boolean;
        /** Authorization changes */
        authorization_events: boolean;
        /** Compliance actions */
        compliance_events: boolean;
        /** Constitutional events */
        constitutional_events: boolean;
        /** Patient interactions */
        patient_interaction_events: boolean;
    };
    /** Audit detail level */
    audit_detail_level: 'minimal' | 'standard' | 'comprehensive' | 'constitutional_full';
    /** Real-time monitoring */
    real_time_monitoring: boolean;
    /** Automated alerts configuration */
    automated_alerts: {
        /** Enable suspicious activity alerts */
        suspicious_activity_alerts: boolean;
        /** Enable unauthorized access alerts */
        unauthorized_access_alerts: boolean;
        /** Enable constitutional violation alerts */
        constitutional_violation_alerts: boolean;
        /** Alert thresholds */
        alert_thresholds: Record<string, number>;
    };
    /** Data integrity settings */
    data_integrity: {
        /** Enable cryptographic hashing */
        cryptographic_hashing: boolean;
        /** Enable digital signatures */
        digital_signatures: boolean;
        /** Enable blockchain integration */
        blockchain_integration: boolean;
    };
    /** Constitutional compliance settings */
    constitutional_compliance: {
        /** Enable constitutional monitoring */
        constitutional_monitoring: boolean;
        /** Patient rights tracking */
        patient_rights_tracking: boolean;
        /** LGPD specific tracking */
        lgpd_specific_tracking: boolean;
        /** Medical ethics tracking */
        medical_ethics_tracking: boolean;
    };
}; /**
 * Audit Trail Generation Parameters
 * Constitutional parameters for audit trail generation
 */
export type AuditTrailGenerationParams = {
    /** Tenant ID for audit trail */
    tenant_id: string;
    /** Time range for audit trail generation */
    time_range: {
        /** Start timestamp */
        start_date: Date;
        /** End timestamp */
        end_date: Date;
    };
    /** Filters for audit trail entries */
    filters?: {
        /** User IDs to include */
        user_ids?: string[];
        /** Event types to include */
        event_types?: AuditTrailEntry['event_type'][];
        /** Event categories to include */
        event_categories?: AuditTrailEntry['event_category'][];
        /** Resource types to include */
        resource_types?: string[];
        /** Only constitutional events */
        constitutional_events_only?: boolean;
        /** Only patient data events */
        patient_data_events_only?: boolean;
    };
    /** Output format requirements */
    output_format: 'json' | 'csv' | 'pdf' | 'xml' | 'blockchain_proof';
    /** Constitutional compliance requirements */
    constitutional_requirements: string[];
    /** Include integrity verification */
    include_integrity_verification: boolean;
};
/**
 * Audit Trail Report Interface
 * Constitutional audit trail report structure
 */
export type AuditTrailReport = {
    /** Report identifier */
    report_id: string;
    /** Report generation timestamp */
    generated_at: Date;
    /** Report time range */
    time_range: {
        start_date: Date;
        end_date: Date;
    };
    /** Associated tenant */
    tenant_id: string;
    /** Audit trail entries */
    audit_entries: AuditTrailEntry[];
    /** Report metadata */
    metadata: {
        /** Total entries count */
        total_entries: number;
        /** Entries by event type */
        entries_by_type: Record<string, number>;
        /** Entries by user */
        entries_by_user: Record<string, number>;
        /** Constitutional events count */
        constitutional_events_count: number;
        /** Patient data events count */
        patient_data_events_count: number;
    };
    /** Integrity verification results */
    integrity_verification: {
        /** All entries verified */
        all_entries_verified: boolean;
        /** Failed verification count */
        failed_verification_count: number;
        /** Failed entry IDs */
        failed_entry_ids: string[];
        /** Verification timestamp */
        verification_timestamp: Date;
    };
    /** Constitutional compliance assessment */
    constitutional_assessment: {
        /** Audit trail complete */
        audit_trail_complete: boolean;
        /** Constitutional requirements met */
        constitutional_requirements_met: boolean;
        /** LGPD compliance verified */
        lgpd_compliance_verified: boolean;
        /** Identified issues */
        identified_issues: string[];
        /** Recommendations */
        recommendations: string[];
    };
    /** Report format */
    report_format: string;
    /** Generated by */
    generated_by: string;
};
/**
 * Audit Event Context Interface
 * Constitutional context for audit events
 */
export type AuditEventContext = {
    /** Request context */
    request_context: {
        /** HTTP method */
        http_method?: string;
        /** Request URL */
        request_url?: string;
        /** Request headers */
        request_headers?: Record<string, string>;
        /** Request body (sanitized) */
        request_body_sanitized?: Record<string, any>;
    };
    /** Business context */
    business_context: {
        /** Business process involved */
        business_process: string;
        /** Patient consent status */
        patient_consent_status?: boolean;
        /** Medical procedure context */
        medical_procedure_context?: string;
        /** Clinic workflow stage */
        clinic_workflow_stage?: string;
    };
    /** Compliance context */
    compliance_context: {
        /** LGPD data processing basis */
        lgpd_processing_basis?: string;
        /** CFM professional requirement */
        cfm_professional_requirement?: string;
        /** ANVISA regulatory context */
        anvisa_regulatory_context?: string;
        /** Constitutional healthcare principle */
        constitutional_principle?: string;
    };
    /** Technical context */
    technical_context: {
        /** Application version */
        application_version: string;
        /** Database transaction ID */
        transaction_id?: string;
        /** Cache involvement */
        cache_involved?: boolean;
        /** External service calls */
        external_service_calls?: string[];
    };
}; /**
 * Enterprise Audit Trail Generator Service Implementation
 * Constitutional healthcare audit trail generation with ≥9.9/10 compliance standards
 */
export declare class AuditTrailGeneratorService {
    private readonly supabase;
    constructor(supabaseClient: ReturnType<typeof createClient>);
    /**
     * Generate comprehensive audit trail
     * Constitutional audit trail generation with integrity verification
     */
    generateAuditTrail(params: AuditTrailGenerationParams, generatorUserId: string): Promise<{
        success: boolean;
        data?: AuditTrailReport;
        error?: string;
    }>;
    /**
     * Generate audit entry for system events
     * Constitutional audit entry creation with integrity protection
     */
    generateAuditEntry(eventData: {
        event_type: AuditTrailEntry['event_type'];
        event_category: AuditTrailEntry['event_category'];
        action_performed: string;
        user_id: string;
        resource_affected: AuditTrailEntry['resource_affected'];
        constitutional_context: AuditTrailEntry['constitutional_context'];
        tenant_id: string;
        previous_state?: Record<string, any>;
        new_state?: Record<string, any>;
        event_context?: AuditEventContext;
    }): Promise<{
        success: boolean;
        data?: AuditTrailEntry;
        error?: string;
    }>; /**
     * Configure audit trail settings for tenant
     * Constitutional audit trail configuration with compliance requirements
     */
    configureAuditTrail(tenantId: string, configuration: Omit<AuditTrailConfiguration, 'config_id' | 'tenant_id'>, userId: string): Promise<{
        success: boolean;
        data?: AuditTrailConfiguration;
        error?: string;
    }>;
    private applyFilters;
    private processAuditEntries;
    private verifyEntriesIntegrity;
    private generateReportMetadata;
    private assessConstitutionalCompliance;
    private calculateIntegrityHash;
    private getNextSequenceNumber;
    private getUserRole;
    private getClientIpAddress;
    private getClientUserAgent;
    private getSessionId;
    private checkForAutomatedAlerts;
    private triggerAlert;
    private checkUnauthorizedAccessPattern;
    private validateGenerationParams;
    private validateAuditConfiguration;
    private storeAuditTrailReport;
}
export default AuditTrailGeneratorService;
