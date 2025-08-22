/**
 * Enterprise Audit Module
 * Constitutional healthcare audit services with privacy protection
 * Compliance: LGPD + Constitutional Privacy + AI Ethics + ≥9.9/10 Standards
 */
import type { createClient } from '@supabase/supabase-js';
import type { AuditTrailConfiguration } from './audit-trail-generator';
import { AuditTrailGeneratorService } from './audit-trail-generator';
import type { ScoringMethodologyConfig } from './compliance-scoring';
import { ComplianceScoringService } from './compliance-scoring';
import type { MonitoringConfiguration } from './real-time-monitor';
import { RealTimeComplianceMonitor } from './real-time-monitor';
export { type AuditEventContext, type AuditTrailConfiguration, type AuditTrailEntry, type AuditTrailGenerationParams, AuditTrailGeneratorService, type AuditTrailReport, } from './audit-trail-generator';
export { type ComplianceScoreAssessment, type ComplianceScoringAudit, type ComplianceScoringParameters, type ComplianceScoringResponse, ComplianceScoringService, type RiskFactor, type ScoringMethodologyConfig, } from './compliance-scoring';
export { type ComplianceAlert, type ComplianceMonitor, type ComplianceMonitoringResponse, type MonitorAudit, type MonitoringConfiguration, type MonitoringParams, RealTimeComplianceMonitor, } from './real-time-monitor';
/**
 * Service Factory Functions
 * Creates audit services with constitutional compliance
 */
export declare function createAuditTrailGeneratorService(supabaseClient: ReturnType<typeof createClient>): AuditTrailGeneratorService;
export declare function createRealTimeComplianceMonitorService(supabaseClient: ReturnType<typeof createClient>): RealTimeComplianceMonitor;
export declare function createComplianceScoringService(supabaseClient: ReturnType<typeof createClient>): ComplianceScoringService;
/**
 * Enterprise Audit Services Factory
 * Creates comprehensive audit services with constitutional compliance
 */
export declare function createEnterpriseAuditServices(supabaseClient: ReturnType<typeof createClient>): {
    auditTrail: AuditTrailGeneratorService;
    realTimeMonitor: RealTimeComplianceMonitor;
    complianceScoring: ComplianceScoringService;
};
/**
 * Validation Functions
 */
export declare function validateEnterpriseAuditCompliance(supabaseClient: ReturnType<typeof createClient>): boolean;
export declare function validateAuditTrailGenerator(config: AuditTrailConfiguration): boolean;
export declare function validateRealTimeComplianceMonitor(config: MonitoringConfiguration): boolean;
export declare function validateComplianceScoring(config: ScoringMethodologyConfig): boolean;
/**
 * Enterprise Audit Configuration Templates
 */
export declare const ENTERPRISE_AUDIT_CONFIGS: {
    readonly auditTrail: AuditTrailConfiguration;
    readonly realTimeMonitor: MonitoringConfiguration;
    readonly complianceScoring: ScoringMethodologyConfig;
};
/**
 * Enterprise Audit Module Summary
 */
export declare const ENTERPRISE_AUDIT_MODULE: {
    readonly name: "Enterprise Audit";
    readonly version: "1.0.0";
    readonly compliance_standards: readonly ["LGPD (Lei Geral de Proteção de Dados)", "ANVISA (Agência Nacional de Vigilância Sanitária)", "CFM (Conselho Federal de Medicina)", "Constitutional Healthcare Rights"];
    readonly quality_score: 9.9;
    readonly services: {
        readonly auditTrail: {
            readonly name: "Audit Trail Generator";
            readonly description: "Comprehensive audit trail generation with cryptographic integrity";
            readonly constitutional_features: readonly ["Immutable audit logs with cryptographic signatures", "Constitutional compliance tracking", "Long-term retention with LGPD compliance"];
        };
        readonly realTimeMonitor: {
            readonly name: "Real-Time Compliance Monitor";
            readonly description: "Continuous compliance monitoring with real-time alerts";
            readonly constitutional_features: readonly ["Real-time constitutional compliance monitoring", "Automated alert system for compliance violations", "Healthcare-specific monitoring protocols"];
        };
        readonly complianceScoring: {
            readonly name: "Compliance Scoring Service";
            readonly description: "Automated compliance scoring with ≥9.9/10 standards";
            readonly constitutional_features: readonly ["Multi-dimensional compliance scoring", "Constitutional healthcare standards validation", "Continuous improvement recommendations"];
        };
    };
    readonly total_services: 3;
    readonly constitutional_guarantees: readonly ["Immutable audit trails for transparency and accountability", "Real-time compliance monitoring with ≥9.9/10 standards", "Constitutional healthcare compliance validation", "Automated scoring with continuous improvement"];
};
