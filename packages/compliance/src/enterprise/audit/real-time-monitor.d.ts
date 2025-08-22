/**
 * Enterprise Real-Time Compliance Monitor
 * Constitutional healthcare compliance monitoring system
 *
 * @fileoverview Real-time constitutional compliance monitoring with ≥9.9/10 standards
 * @version 1.0.0
 * @since 2025-01-17
 */
import type { Database } from '@neonpro/types';
import type { createClient } from '@supabase/supabase-js';
/**
 * Real-Time Compliance Monitor Interface
 * Constitutional monitoring for healthcare compliance
 */
export type ComplianceMonitor = {
    /** Unique monitor identifier */
    monitor_id: string;
    /** Monitor name and description */
    monitor_name: string;
    /** Compliance areas being monitored */
    compliance_areas: ('lgpd' | 'anvisa' | 'cfm' | 'constitutional_healthcare')[];
    /** Real-time compliance score ≥9.9/10 */
    real_time_score: number;
    /** Active monitoring alerts */
    alerts: ComplianceAlert[];
    /** Constitutional compliance status */
    constitutional_status: 'compliant' | 'warning' | 'violation' | 'critical';
    /** Monitoring configuration */
    monitoring_config: MonitoringConfiguration;
    /** Associated clinic/tenant */
    tenant_id: string;
    /** Monitor status */
    status: 'active' | 'paused' | 'disabled' | 'maintenance';
    /** Creation metadata */
    created_at: Date;
    /** Last update timestamp */
    updated_at: Date;
    /** Constitutional audit trail */
    audit_trail: MonitorAudit[];
};
/**
 * Compliance Alert Interface
 * Constitutional alert system for compliance violations
 */
export type ComplianceAlert = {
    /** Unique alert identifier */
    alert_id: string;
    /** Alert type classification */
    alert_type: 'compliance_drop' | 'violation_detected' | 'threshold_breach' | 'constitutional_issue' | 'regulatory_update';
    /** Alert severity level */
    severity: 'info' | 'warning' | 'error' | 'critical' | 'constitutional_violation';
    /** Alert title */
    title: string;
    /** Detailed alert message */
    message: string;
    /** Affected compliance area */
    affected_area: string;
    /** Current compliance score */
    current_score: number;
    /** Threshold or expected score */
    threshold_score: number;
    /** Recommended actions */
    recommended_actions: string[];
    /** Alert timestamp */
    triggered_at: Date;
    /** Alert acknowledgment status */
    acknowledged: boolean;
    /** User who acknowledged alert */
    acknowledged_by?: string;
    /** Acknowledgment timestamp */
    acknowledged_at?: Date;
    /** Constitutional compliance impact */
    constitutional_impact: boolean;
}; /**
 * Monitoring Configuration Interface
 * Constitutional monitoring settings and thresholds
 */
export type MonitoringConfiguration = {
    /** Monitoring interval in minutes */
    monitoring_interval_minutes: number;
    /** Compliance score thresholds */
    score_thresholds: {
        /** Critical threshold (triggers immediate action) */
        critical: number;
        /** Warning threshold (triggers alert) */
        warning: number;
        /** Target threshold (constitutional minimum) */
        target: number;
    };
    /** Automated actions configuration */
    automated_actions: {
        /** Enable automatic notifications */
        notifications_enabled: boolean;
        /** Enable automatic reports */
        reports_enabled: boolean;
        /** Enable automatic escalation */
        escalation_enabled: boolean;
        /** Enable constitutional violation response */
        constitutional_response_enabled: boolean;
    };
    /** Alert recipients */
    alert_recipients: {
        /** Email addresses for alerts */
        email_addresses: string[];
        /** SMS numbers for critical alerts */
        sms_numbers: string[];
        /** Webhook URLs for system integration */
        webhook_urls: string[];
    };
    /** Constitutional healthcare settings */
    constitutional_settings: {
        /** Enable constitutional monitoring */
        constitutional_monitoring_enabled: boolean;
        /** Constitutional compliance minimum score */
        constitutional_minimum_score: number;
        /** Patient safety monitoring */
        patient_safety_monitoring: boolean;
        /** Regulatory update monitoring */
        regulatory_update_monitoring: boolean;
    };
};
/**
 * Monitor Audit Trail
 * Constitutional audit requirements for monitoring operations
 */
export type MonitorAudit = {
    /** Audit entry unique identifier */
    audit_id: string;
    /** Monitor ID being audited */
    monitor_id: string;
    /** Action performed on monitor */
    action: 'created' | 'updated' | 'paused' | 'resumed' | 'alert_triggered' | 'configuration_changed';
    /** Previous monitor state */
    previous_state: Partial<ComplianceMonitor>;
    /** New monitor state */
    new_state: Partial<ComplianceMonitor>;
    /** User who performed the action */
    user_id: string;
    /** Constitutional timestamp */
    timestamp: Date;
    /** Reason for action (constitutional requirement) */
    reason: string;
    /** Monitoring metrics at time of action */
    monitoring_metrics?: Record<string, number>;
};
/**
 * Real-Time Monitoring Parameters
 * Constitutional parameters for monitoring operations
 */
export type MonitoringParams = {
    /** Tenant ID to monitor */
    tenant_id: string;
    /** Compliance areas to monitor */
    compliance_areas: ComplianceMonitor['compliance_areas'];
    /** Monitoring configuration */
    config: MonitoringConfiguration;
    /** Constitutional requirements */
    constitutional_requirements: string[];
};
/**
 * Compliance Monitoring Response
 * Constitutional monitoring results and recommendations
 */
export type ComplianceMonitoringResponse = {
    /** Overall monitoring status */
    status: 'healthy' | 'warning' | 'critical' | 'constitutional_violation';
    /** Current compliance scores by area */
    compliance_scores: Record<string, number>;
    /** Overall constitutional score */
    overall_constitutional_score: number;
    /** Active alerts */
    active_alerts: ComplianceAlert[];
    /** Trends and analytics */
    trends: {
        /** Score trend over time */
        score_trend: 'improving' | 'stable' | 'declining';
        /** Trend percentage change */
        trend_percentage: number;
        /** Prediction for next period */
        next_period_prediction: number;
    };
    /** Recommendations for improvement */
    recommendations: string[];
    /** Constitutional compliance assessment */
    constitutional_assessment: {
        /** Constitutional compliance status */
        constitutional_compliant: boolean;
        /** Constitutional issues identified */
        constitutional_issues: string[];
        /** Constitutional recommendations */
        constitutional_recommendations: string[];
    };
    /** Monitoring timestamp */
    monitoring_timestamp: Date;
}; /**
 * Real-Time Compliance Monitor Service Implementation
 * Constitutional healthcare compliance monitoring with ≥9.9/10 standards
 */
export declare class RealTimeComplianceMonitor {
    private readonly supabase;
    private readonly monitoringIntervals;
    constructor(supabaseClient: ReturnType<typeof createClient<Database>>);
    /**
     * Start real-time compliance monitoring
     * Constitutional monitoring with comprehensive compliance tracking
     */
    startMonitoring(params: MonitoringParams, userId: string): Promise<{
        success: boolean;
        data?: ComplianceMonitor;
        error?: string;
    }>;
    /**
     * Perform comprehensive compliance assessment
     * Constitutional assessment across all compliance areas
     */
    performComplianceAssessment(monitorId: string): Promise<{
        success: boolean;
        data?: ComplianceMonitoringResponse;
        error?: string;
    }>; /**
     * Assess compliance for specific area
     * Constitutional assessment with area-specific validation
     */
    private assessComplianceArea;
    /**
     * Calculate overall compliance score
     * Constitutional scoring algorithm with weighted areas
     */
    private calculateOverallComplianceScore;
    /**
     * Generate compliance alert
     * Constitutional alert generation with severity assessment
     */
    private generateComplianceAlert;
    /**
     * Setup monitoring interval for real-time assessment
     * Constitutional real-time monitoring with automated intervals
     */
    private setupMonitoringInterval; /**
     * Get current monitoring status
     * Constitutional monitoring status retrieval with real-time data
     */
    getMonitoringStatus(monitorId: string): Promise<{
        success: boolean;
        data?: ComplianceMonitoringResponse;
        error?: string;
    }>;
    /**
     * Stop real-time monitoring
     * Constitutional monitoring termination with audit trail
     */
    stopMonitoring(monitorId: string, userId: string, reason: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    private validateMonitoringParams;
    private assessLgpdCompliance;
    private assessAnvisaCompliance;
    private assessCfmCompliance;
    private assessConstitutionalCompliance;
    private generateRecommendedActions;
    private determineComplianceStatus;
    private analyzeComplianceTrends;
    private updateMonitorAssessment;
    private processAlerts;
    private sendAlertNotifications;
}
export default RealTimeComplianceMonitor;
