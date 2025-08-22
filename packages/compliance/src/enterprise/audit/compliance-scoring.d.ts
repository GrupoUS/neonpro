/**
 * Enterprise Compliance Scoring Service
 * Constitutional healthcare compliance scoring with ≥9.9/10 standards
 *
 * @fileoverview Automated compliance scoring system for constitutional healthcare
 * @version 1.0.0
 * @since 2025-01-17
 */
import type { Database } from '@neonpro/types';
import type { createClient } from '@supabase/supabase-js';
/**
 * Compliance Score Assessment Interface
 * Constitutional scoring assessment for healthcare compliance
 */
export type ComplianceScoreAssessment = {
    /** Unique assessment identifier */
    assessment_id: string;
    /** Tenant being assessed */
    tenant_id: string;
    /** Assessment timestamp */
    assessment_date: Date;
    /** Overall constitutional score ≥9.9/10 */
    overall_constitutional_score: number;
    /** Detailed scores by compliance area */
    compliance_area_scores: {
        /** LGPD privacy protection score */
        lgpd_score: number;
        /** ANVISA regulatory compliance score */
        anvisa_score: number;
        /** CFM professional standards score */
        cfm_score: number;
        /** Constitutional healthcare principles score */
        constitutional_healthcare_score: number;
    };
    /** Quality indicators assessment */
    quality_indicators: {
        /** Data quality score */
        data_quality: number;
        /** Process compliance score */
        process_compliance: number;
        /** Documentation completeness */
        documentation_completeness: number;
        /** Audit trail integrity */
        audit_trail_integrity: number;
        /** Patient safety measures */
        patient_safety_measures: number;
    };
    /** Risk assessment scores */
    risk_assessment: {
        /** Overall risk level */
        overall_risk_level: 'low' | 'medium' | 'high' | 'critical';
        /** Risk score (0-100, lower is better) */
        risk_score: number;
        /** Identified risk factors */
        risk_factors: RiskFactor[];
        /** Mitigation recommendations */
        mitigation_recommendations: string[];
    };
    /** Scoring methodology used */
    scoring_methodology: {
        /** Methodology version */
        version: string;
        /** Constitutional standards applied */
        constitutional_standards: string[];
        /** Weighting factors used */
        weighting_factors: Record<string, number>;
    };
    /** Assessment performed by */
    assessed_by: string;
    /** Assessment type */
    assessment_type: 'automated' | 'manual' | 'hybrid' | 'constitutional_audit';
    /** Constitutional audit trail */
    audit_trail: ComplianceScoringAudit[];
};
/**
 * Risk Factor Interface
 * Constitutional risk assessment for healthcare compliance
 */
export type RiskFactor = {
    /** Risk factor identifier */
    risk_id: string;
    /** Risk category */
    category: 'privacy' | 'security' | 'regulatory' | 'operational' | 'constitutional';
    /** Risk description */
    description: string;
    /** Impact level */
    impact_level: 'low' | 'medium' | 'high' | 'critical';
    /** Probability of occurrence */
    probability: 'unlikely' | 'possible' | 'likely' | 'almost_certain';
    /** Risk score calculation */
    calculated_risk_score: number;
    /** Affected compliance areas */
    affected_areas: string[];
    /** Constitutional impact */
    constitutional_impact: boolean;
    /** Recommended actions */
    recommended_actions: string[];
}; /**
 * Compliance Scoring Audit Trail
 * Constitutional audit requirements for scoring operations
 */
export type ComplianceScoringAudit = {
    /** Audit entry unique identifier */
    audit_id: string;
    /** Assessment ID being audited */
    assessment_id: string;
    /** Action performed on assessment */
    action: 'created' | 'updated' | 'reviewed' | 'approved' | 'methodology_changed' | 'score_recalculated';
    /** Previous assessment state */
    previous_state: Partial<ComplianceScoreAssessment>;
    /** New assessment state */
    new_state: Partial<ComplianceScoreAssessment>;
    /** User who performed the action */
    user_id: string;
    /** Constitutional timestamp */
    timestamp: Date;
    /** Reason for action (constitutional requirement) */
    reason: string;
    /** Scoring details */
    scoring_details?: Record<string, any>;
};
/**
 * Scoring Parameters Interface
 * Constitutional parameters for compliance scoring
 */
export type ComplianceScoringParameters = {
    /** Tenant ID to score */
    tenant_id: string;
    /** Assessment type to perform */
    assessment_type: ComplianceScoreAssessment['assessment_type'];
    /** Compliance areas to include */
    compliance_areas: string[];
    /** Scoring methodology version */
    methodology_version: string;
    /** Custom weighting factors */
    custom_weights?: Record<string, number>;
    /** Constitutional requirements */
    constitutional_requirements: string[];
    /** Include risk assessment */
    include_risk_assessment: boolean;
};
/**
 * Compliance Scoring Response
 * Constitutional scoring results with recommendations
 */
export type ComplianceScoringResponse = {
    /** Scoring successful */
    successful: boolean;
    /** Assessment results */
    assessment_results: ComplianceScoreAssessment;
    /** Performance against benchmarks */
    benchmark_comparison: {
        /** Industry average score */
        industry_average: number;
        /** Constitutional minimum requirement */
        constitutional_minimum: number;
        /** Best practice score */
        best_practice_score: number;
        /** Performance percentile */
        performance_percentile: number;
    };
    /** Improvement recommendations */
    improvement_recommendations: {
        /** Priority level */
        priority: 'low' | 'medium' | 'high' | 'critical';
        /** Recommendation description */
        description: string;
        /** Expected score improvement */
        expected_improvement: number;
        /** Implementation timeframe */
        implementation_timeframe: string;
        /** Constitutional impact */
        constitutional_impact: boolean;
    }[];
    /** Next assessment recommendation */
    next_assessment: {
        /** Recommended timeframe */
        recommended_timeframe: string;
        /** Focus areas for next assessment */
        focus_areas: string[];
        /** Constitutional monitoring requirements */
        constitutional_monitoring: string[];
    };
    /** Scoring timestamp */
    scoring_timestamp: Date;
};
/**
 * Scoring Methodology Configuration
 * Constitutional methodology for healthcare compliance scoring
 */
export type ScoringMethodologyConfig = {
    /** Methodology identifier */
    methodology_id: string;
    /** Methodology version */
    version: string;
    /** Constitutional standards basis */
    constitutional_standards_basis: string[];
    /** Area weighting factors */
    area_weights: {
        lgpd: number;
        anvisa: number;
        cfm: number;
        constitutional_healthcare: number;
    };
    /** Quality indicator weights */
    quality_weights: {
        data_quality: number;
        process_compliance: number;
        documentation_completeness: number;
        audit_trail_integrity: number;
        patient_safety_measures: number;
    };
    /** Risk assessment configuration */
    risk_assessment_config: {
        /** Risk factors to evaluate */
        risk_factors_to_evaluate: string[];
        /** Risk scoring matrix */
        risk_scoring_matrix: Record<string, Record<string, number>>;
        /** Constitutional risk thresholds */
        constitutional_risk_thresholds: Record<string, number>;
    };
    /** Constitutional compliance thresholds */
    constitutional_thresholds: {
        /** Minimum acceptable score */
        minimum_score: number;
        /** Target score for excellence */
        target_score: number;
        /** Critical violation threshold */
        critical_threshold: number;
    };
}; /**
 * Enterprise Compliance Scoring Service Implementation
 * Constitutional healthcare compliance scoring with ≥9.9/10 standards
 */
export declare class ComplianceScoringService {
    private readonly supabase;
    private readonly defaultMethodology;
    constructor(supabaseClient: ReturnType<typeof createClient<Database>>);
    /**
     * Perform comprehensive compliance scoring assessment
     * Constitutional scoring with automated methodology ≥9.9/10 standards
     */
    performComplianceScoring(params: ComplianceScoringParameters, assessorId: string): Promise<{
        success: boolean;
        data?: ComplianceScoringResponse;
        error?: string;
    }>; /**
     * Assess compliance areas with constitutional validation
     * Area-specific scoring with healthcare standards
     */
    private assessComplianceAreas;
    /**
     * Assess quality indicators for compliance scoring
     * Constitutional quality assessment with healthcare standards
     */
    private assessQualityIndicators;
    /**
     * Perform comprehensive risk assessment
     * Constitutional risk evaluation with healthcare focus
     */
    private performRiskAssessment; /**
     * Calculate overall constitutional compliance score
     * Constitutional scoring algorithm with weighted healthcare standards
     */
    private calculateOverallConstitutionalScore;
    private assessLgpdCompliance;
    private assessAnvisaCompliance;
    private assessCfmCompliance;
    private assessConstitutionalHealthcareCompliance;
    private assessDataQuality;
    private assessProcessCompliance;
    private assessDocumentationCompleteness;
    private assessAuditTrailIntegrity;
    private assessPatientSafetyMeasures;
    private assessPrivacyRisks;
    private assessSecurityRisks;
    private assessRegulatoryRisks;
    private assessOperationalRisks;
    private assessConstitutionalRisks;
    private generateRiskMitigationRecommendations;
    private getDefaultRiskAssessment;
    private getDefaultScoringMethodology;
    private getScoringMethodology;
    private validateScoringParameters;
    private storeAssessment;
    private generateBenchmarkComparison;
    private generateImprovementRecommendations;
    private generateNextAssessmentRecommendations;
}
export default ComplianceScoringService;
