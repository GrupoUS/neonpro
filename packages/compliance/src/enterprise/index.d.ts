/**
 * Enterprise Healthcare Compliance Module
 * Constitutional healthcare enterprise features with comprehensive regulatory compliance
 * Compliance: LGPD + ANVISA + CFM + Constitutional Healthcare + ≥9.9/10 Standards
 */
export { type ComplianceAlert as DashboardComplianceAlert, type ComplianceDashboardAudit, type ComplianceDashboardConfig, type ComplianceDashboardMetrics, type ComplianceDashboardReport, ComplianceDashboardService, createComplianceDashboardService, createEnterpriseAnalyticsServices, createHealthcareIntelligenceService, createPrivacyPreservingAnalyticsService, ENTERPRISE_ANALYTICS_CONFIGS, ENTERPRISE_ANALYTICS_MODULE, type HealthcareIntelligenceAudit, type HealthcareIntelligenceConfig, type HealthcareIntelligenceQuery, type HealthcareIntelligenceResults, HealthcareIntelligenceService, type PrivacyPreservingAnalyticsAudit, type PrivacyPreservingAnalyticsConfig, type PrivacyPreservingAnalyticsResults, PrivacyPreservingAnalyticsService, type PrivacyPreservingQuery, validateComplianceDashboard, validateEnterpriseAnalyticsCompliance, validateHealthcareIntelligence, validatePrivacyPreservingAnalytics, } from './analytics';
export { type AuditTrailConfiguration, type AuditTrailEntry, AuditTrailGeneratorService, type AuditTrailReport, type ComplianceAlert, type ComplianceMonitor, type ComplianceScoreAssessment, type ComplianceScoringAudit, ComplianceScoringService, createAuditTrailGeneratorService, createComplianceScoringService, createEnterpriseAuditServices, createRealTimeComplianceMonitorService, ENTERPRISE_AUDIT_CONFIGS, ENTERPRISE_AUDIT_MODULE, type MonitoringConfiguration, RealTimeComplianceMonitor, type RiskFactor, type ScoringMethodologyConfig, validateAuditTrailGenerator, validateComplianceScoring, validateEnterpriseAuditCompliance, validateRealTimeComplianceMonitor, } from './audit';
export { type Clinic, type ClinicOperations, createMultiClinicManagementService, type MultiClinicConfig, type MultiClinicManagementAudit, MultiClinicManagementService, type TenantManagement, validateMultiClinicManagement, } from './management/multi-clinic-management';
import type { createClient } from '@supabase/supabase-js';
import { type createComplianceDashboardService, type createHealthcareIntelligenceService, type createPrivacyPreservingAnalyticsService, validateEnterpriseAnalyticsCompliance } from './analytics';
import { createMultiClinicManagementService, validateMultiClinicManagement } from './management/multi-clinic-management';
import { type createApiRateLimitingService, type createHealthcareRbacService, validateEnterpriseSecurityCompliance } from './security';
export { type AccessRequest, type ApiRateLimitingAudit, ApiRateLimitingService, type ClientRateLimit, createApiRateLimitingService, createEnterpriseSecurityServices, createHealthcareRbacService, ENTERPRISE_SECURITY_CONFIGS, ENTERPRISE_SECURITY_MODULE, type EndpointRateLimit, type HealthcareRbacAudit, HealthcareRbacService, type HealthcareRole, type HealthcareUser, type RateLimitConfig, type RateLimitViolation, type RbacConfig, validateApiRateLimiting, validateEnterpriseSecurityCompliance, validateHealthcareRbac, } from './security';
/**
 * Complete Enterprise Healthcare Services Factory
 * Creates all enterprise services with constitutional compliance
 */
export declare function createEnterpriseHealthcareServices(config: {
    supabaseClient: ReturnType<typeof createClient>;
    analytics: {
        privacyAnalytics: Parameters<typeof createPrivacyPreservingAnalyticsService>[0];
        complianceDashboard: Parameters<typeof createComplianceDashboardService>[0];
        healthcareIntelligence: Parameters<typeof createHealthcareIntelligenceService>[0];
    };
    management: {
        multiClinic: Parameters<typeof createMultiClinicManagementService>[0];
    };
    security: {
        rbac: Parameters<typeof createHealthcareRbacService>[0];
        rateLimiting: Parameters<typeof createApiRateLimitingService>[0];
    };
}): {
    audit: {
        auditTrail: import("./audit").AuditTrailGeneratorService;
        realTimeMonitor: import("./audit").RealTimeComplianceMonitor;
        complianceScoring: import("./audit").ComplianceScoringService;
    };
    analytics: {
        privacyAnalytics: import("./analytics").PrivacyPreservingAnalyticsService;
        complianceDashboard: import("./analytics").ComplianceDashboardService;
        healthcareIntelligence: import("./analytics").HealthcareIntelligenceService;
    };
    management: {
        multiClinic: import(".").MultiClinicManagementService;
    };
    security: {
        rbac: import("./security").HealthcareRbacService;
        rateLimiting: import("./security").ApiRateLimitingService;
    };
};
/**
 * Comprehensive Enterprise Healthcare Compliance Validation
 * Validates all enterprise services for constitutional healthcare compliance
 */
export declare function validateEnterpriseHealthcareCompliance(supabaseClient: ReturnType<typeof createClient>, analyticsConfig: {
    privacyQuery: Parameters<typeof validateEnterpriseAnalyticsCompliance>[0];
    privacyConfig: Parameters<typeof validateEnterpriseAnalyticsCompliance>[1];
    dashboardConfig: Parameters<typeof validateEnterpriseAnalyticsCompliance>[2];
    intelligenceQuery: Parameters<typeof validateEnterpriseAnalyticsCompliance>[3];
    intelligenceConfig: Parameters<typeof validateEnterpriseAnalyticsCompliance>[4];
}, managementConfig: Parameters<typeof validateMultiClinicManagement>[0], securityConfig: {
    rbac: Parameters<typeof validateEnterpriseSecurityCompliance>[0];
    rateLimiting: Parameters<typeof validateEnterpriseSecurityCompliance>[1];
}): Promise<{
    valid: boolean;
    violations: string[];
    compliance_score: number;
    module_scores: {
        audit: number;
        analytics: number;
        management: number;
        security: number;
    };
}>;
/**
 * Enterprise Healthcare Module Summary
 * Complete enterprise features for constitutional healthcare compliance
 */
export declare const ENTERPRISE_HEALTHCARE_MODULE: {
    readonly name: "Enterprise Healthcare";
    readonly version: "1.0.0";
    readonly compliance_standards: readonly ["LGPD (Lei Geral de Proteção de Dados)", "ANVISA (Agência Nacional de Vigilância Sanitária)", "CFM (Conselho Federal de Medicina)", "Constitutional Healthcare Rights", "Medical Ethics and Professional Standards"];
    readonly quality_score: 9.9;
    readonly modules: {
        readonly audit: {
            readonly name: "Enterprise Audit";
            readonly services: 3;
            readonly description: "Real-time compliance monitoring, scoring, and audit trail generation";
            readonly constitutional_features: readonly ["Real-time constitutional compliance monitoring", "Automated compliance scoring with ≥9.9/10 standards", "Comprehensive audit trail generation with cryptographic integrity"];
        };
        readonly analytics: {
            readonly name: "Enterprise Analytics";
            readonly services: 3;
            readonly description: "Privacy-preserving analytics, compliance dashboard, and healthcare intelligence";
            readonly constitutional_features: readonly ["Privacy-preserving patient analytics with differential privacy", "Real-time compliance monitoring dashboard", "AI-driven healthcare insights with constitutional medical ethics"];
        };
        readonly management: {
            readonly name: "Enterprise Management";
            readonly services: 1;
            readonly description: "Multi-clinic and multi-tenant management with regulatory compliance";
            readonly constitutional_features: readonly ["Constitutional healthcare multi-clinic management", "Tenant isolation with LGPD compliance", "Cross-clinic operations with privacy protection"];
        };
        readonly security: {
            readonly name: "Enterprise Security";
            readonly services: 2;
            readonly description: "Healthcare RBAC and API rate limiting with constitutional protection";
            readonly constitutional_features: readonly ["Constitutional healthcare access control with CFM validation", "API protection with healthcare priority routing", "Emergency access protocols for critical healthcare situations"];
        };
    };
    readonly total_services: 9;
    readonly constitutional_guarantees: readonly ["Patient privacy protection through advanced anonymization and differential privacy", "Medical professional standards validation with CFM compliance", "Real-time compliance monitoring with ≥9.9/10 constitutional standards", "Comprehensive audit trails for regulatory compliance and transparency", "Emergency access protocols for critical healthcare situations", "Multi-clinic management with tenant isolation and privacy protection", "AI ethics compliance with explainable healthcare intelligence", "Constitutional healthcare access control with patient consent management"];
};
