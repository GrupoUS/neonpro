/**
 * Enterprise Analytics Module
 * Constitutional healthcare analytics with privacy protection and AI ethics
 * Compliance: LGPD + Constitutional Privacy + AI Ethics + ≥9.9/10 Standards
 */
import { type ComplianceDashboardConfig } from './compliance-dashboard';
import { type HealthcareIntelligenceConfig, type HealthcareIntelligenceQuery } from './healthcare-intelligence';
import { type PrivacyPreservingAnalyticsConfig, type PrivacyPreservingQuery } from './privacy-preserving-analytics';
export { type ComplianceAlert, type ComplianceDashboardAudit, type ComplianceDashboardConfig, type ComplianceDashboardMetrics, type ComplianceDashboardReport, ComplianceDashboardService, createComplianceDashboardService, validateComplianceDashboard, } from './compliance-dashboard';
export { createHealthcareIntelligenceService, type HealthcareIntelligenceAudit, type HealthcareIntelligenceConfig, type HealthcareIntelligenceQuery, type HealthcareIntelligenceResults, HealthcareIntelligenceService, validateHealthcareIntelligence, } from './healthcare-intelligence';
export { createPrivacyPreservingAnalyticsService, type PrivacyPreservingAnalyticsAudit, type PrivacyPreservingAnalyticsConfig, type PrivacyPreservingAnalyticsResults, PrivacyPreservingAnalyticsService, type PrivacyPreservingQuery, validatePrivacyPreservingAnalytics, } from './privacy-preserving-analytics';
/**
 * Enterprise Analytics Service Factory
 * Creates comprehensive analytics services with constitutional compliance
 */
export declare function createEnterpriseAnalyticsServices(config: {
    privacyAnalytics: PrivacyPreservingAnalyticsConfig;
    complianceDashboard: ComplianceDashboardConfig;
    healthcareIntelligence: HealthcareIntelligenceConfig;
}): {
    privacyAnalytics: import("./privacy-preserving-analytics").PrivacyPreservingAnalyticsService;
    complianceDashboard: import("./compliance-dashboard").ComplianceDashboardService;
    healthcareIntelligence: import("./healthcare-intelligence").HealthcareIntelligenceService;
};
/**
 * Validate all enterprise analytics services for constitutional compliance
 */
export declare function validateEnterpriseAnalyticsCompliance(privacyQuery: PrivacyPreservingQuery, privacyConfig: PrivacyPreservingAnalyticsConfig, dashboardConfig: ComplianceDashboardConfig, intelligenceQuery: HealthcareIntelligenceQuery, intelligenceConfig: HealthcareIntelligenceConfig): Promise<{
    valid: boolean;
    violations: string[];
    compliance_score: number;
}>;
/**
 * Enterprise Analytics Configuration Templates
 * Pre-configured settings for constitutional healthcare compliance
 */
export declare const ENTERPRISE_ANALYTICS_CONFIGS: {
    /**
     * High privacy configuration for sensitive patient data analytics
     */
    HIGH_PRIVACY: {
        privacyAnalytics: PrivacyPreservingAnalyticsConfig;
        complianceDashboard: ComplianceDashboardConfig;
        healthcareIntelligence: HealthcareIntelligenceConfig;
    };
    /**
     * Standard configuration for general healthcare analytics
     */
    STANDARD: {
        privacyAnalytics: PrivacyPreservingAnalyticsConfig;
        complianceDashboard: ComplianceDashboardConfig;
        healthcareIntelligence: HealthcareIntelligenceConfig;
    };
};
/**
 * Enterprise Analytics Module Summary
 * Constitutional healthcare analytics with comprehensive privacy protection
 */
export declare const ENTERPRISE_ANALYTICS_MODULE: {
    readonly name: "Enterprise Analytics";
    readonly version: "1.0.0";
    readonly compliance_standards: readonly ["LGPD", "Constitutional Privacy", "AI Ethics", "CFM Medical Ethics"];
    readonly quality_score: 9.9;
    readonly services: readonly [{
        readonly name: "Privacy-Preserving Analytics";
        readonly description: "Patient privacy-preserving analytics with constitutional compliance";
        readonly compliance_features: readonly ["Differential Privacy", "K-Anonymity", "L-Diversity", "LGPD Compliance"];
    }, {
        readonly name: "Compliance Dashboard";
        readonly description: "Real-time compliance monitoring dashboard for regulatory oversight";
        readonly compliance_features: readonly ["Real-time Monitoring", "Alert Management", "Regulatory Reporting", "Executive Dashboards"];
    }, {
        readonly name: "Healthcare Intelligence";
        readonly description: "AI-driven healthcare insights with constitutional medical ethics";
        readonly compliance_features: readonly ["Explainable AI", "Bias Detection", "Human Oversight", "CFM Ethics Validation"];
    }];
    readonly constitutional_guarantees: readonly ["Patient privacy protection through advanced anonymization", "AI ethics compliance with human oversight validation", "Comprehensive audit trails for regulatory compliance", "Real-time compliance monitoring with constitutional standards", "Explainable AI with clinical decision transparency"];
};
