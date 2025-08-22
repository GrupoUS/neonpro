/**
 * Privacy-Preserving Analytics Service
 * Implements constitutional patient privacy protection for healthcare analytics
 * Compliance: LGPD + Constitutional Privacy + ≥9.9/10 Standards
 */
import { z } from 'zod';
declare const PrivacyPreservingAnalyticsConfigSchema: z.ZodObject<{
    differential_privacy_epsilon: z.ZodNumber;
    k_anonymity_k: z.ZodNumber;
    l_diversity_l: z.ZodNumber;
    max_privacy_budget: z.ZodNumber;
    noise_multiplier: z.ZodNumber;
    constitutional_validation: z.ZodDefault<z.ZodBoolean>;
    audit_trail_enabled: z.ZodDefault<z.ZodBoolean>;
    lgpd_compliance_mode: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    constitutional_validation: boolean;
    differential_privacy_epsilon: number;
    k_anonymity_k: number;
    l_diversity_l: number;
    max_privacy_budget: number;
    noise_multiplier: number;
    audit_trail_enabled: boolean;
    lgpd_compliance_mode: boolean;
}, {
    differential_privacy_epsilon: number;
    k_anonymity_k: number;
    l_diversity_l: number;
    max_privacy_budget: number;
    noise_multiplier: number;
    constitutional_validation?: boolean | undefined;
    audit_trail_enabled?: boolean | undefined;
    lgpd_compliance_mode?: boolean | undefined;
}>;
declare const PrivacyPreservingQuerySchema: z.ZodObject<{
    query_id: z.ZodString;
    query_type: z.ZodEnum<["aggregation", "correlation", "distribution", "trend_analysis"]>;
    target_columns: z.ZodArray<z.ZodString, "many">;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    time_range: z.ZodOptional<z.ZodObject<{
        start_date: z.ZodString;
        end_date: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start_date: string;
        end_date: string;
    }, {
        start_date: string;
        end_date: string;
    }>>;
    privacy_level: z.ZodEnum<["high", "medium", "standard"]>;
    constitutional_approval: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    query_id: string;
    query_type: "aggregation" | "correlation" | "distribution" | "trend_analysis";
    target_columns: string[];
    privacy_level: "high" | "medium" | "standard";
    constitutional_approval: boolean;
    filters?: Record<string, any> | undefined;
    time_range?: {
        start_date: string;
        end_date: string;
    } | undefined;
}, {
    query_id: string;
    query_type: "aggregation" | "correlation" | "distribution" | "trend_analysis";
    target_columns: string[];
    privacy_level: "high" | "medium" | "standard";
    filters?: Record<string, any> | undefined;
    time_range?: {
        start_date: string;
        end_date: string;
    } | undefined;
    constitutional_approval?: boolean | undefined;
}>;
declare const PrivacyPreservingAnalyticsResultsSchema: z.ZodObject<{
    query_id: z.ZodString;
    results: z.ZodRecord<z.ZodString, z.ZodAny>;
    privacy_metrics: z.ZodObject<{
        epsilon_used: z.ZodNumber;
        k_anonymity_achieved: z.ZodNumber;
        data_utility_score: z.ZodNumber;
        constitutional_compliance_score: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        constitutional_compliance_score: number;
        epsilon_used: number;
        k_anonymity_achieved: number;
        data_utility_score: number;
    }, {
        constitutional_compliance_score: number;
        epsilon_used: number;
        k_anonymity_achieved: number;
        data_utility_score: number;
    }>;
    audit_trail: z.ZodObject<{
        query_executed_at: z.ZodString;
        privacy_techniques_applied: z.ZodArray<z.ZodString, "many">;
        data_subjects_count: z.ZodNumber;
        constitutional_validation_result: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        query_executed_at: string;
        privacy_techniques_applied: string[];
        data_subjects_count: number;
        constitutional_validation_result: boolean;
    }, {
        query_executed_at: string;
        privacy_techniques_applied: string[];
        data_subjects_count: number;
        constitutional_validation_result: boolean;
    }>;
    constitutional_certification: z.ZodObject<{
        privacy_officer_approval: z.ZodBoolean;
        lgpd_compliance_verified: z.ZodBoolean;
        patient_consent_validated: z.ZodBoolean;
        audit_trail_complete: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        audit_trail_complete: boolean;
        privacy_officer_approval: boolean;
        lgpd_compliance_verified: boolean;
        patient_consent_validated: boolean;
    }, {
        audit_trail_complete: boolean;
        privacy_officer_approval: boolean;
        lgpd_compliance_verified: boolean;
        patient_consent_validated: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    audit_trail: {
        query_executed_at: string;
        privacy_techniques_applied: string[];
        data_subjects_count: number;
        constitutional_validation_result: boolean;
    };
    privacy_metrics: {
        constitutional_compliance_score: number;
        epsilon_used: number;
        k_anonymity_achieved: number;
        data_utility_score: number;
    };
    constitutional_certification: {
        audit_trail_complete: boolean;
        privacy_officer_approval: boolean;
        lgpd_compliance_verified: boolean;
        patient_consent_validated: boolean;
    };
    query_id: string;
    results: Record<string, any>;
}, {
    audit_trail: {
        query_executed_at: string;
        privacy_techniques_applied: string[];
        data_subjects_count: number;
        constitutional_validation_result: boolean;
    };
    privacy_metrics: {
        constitutional_compliance_score: number;
        epsilon_used: number;
        k_anonymity_achieved: number;
        data_utility_score: number;
    };
    constitutional_certification: {
        audit_trail_complete: boolean;
        privacy_officer_approval: boolean;
        lgpd_compliance_verified: boolean;
        patient_consent_validated: boolean;
    };
    query_id: string;
    results: Record<string, any>;
}>;
export type PrivacyPreservingAnalyticsConfig = z.infer<typeof PrivacyPreservingAnalyticsConfigSchema>;
export type PrivacyPreservingQuery = z.infer<typeof PrivacyPreservingQuerySchema>;
export type PrivacyPreservingAnalyticsResults = z.infer<typeof PrivacyPreservingAnalyticsResultsSchema>;
export type PrivacyPreservingAnalyticsAudit = {
    audit_id: string;
    query_id: string;
    privacy_technique: string;
    parameters_used: Record<string, any>;
    privacy_budget_consumed: number;
    constitutional_validation: boolean;
    lgpd_compliance_score: number;
    created_at: string;
    created_by: string;
};
/**
 * Privacy-Preserving Analytics Service
 * Constitutional healthcare analytics with patient privacy protection
 */
export declare class PrivacyPreservingAnalyticsService {
    private readonly config;
    private privacyBudgetUsed;
    private auditTrail;
    constructor(config: PrivacyPreservingAnalyticsConfig);
    /**
     * Execute privacy-preserving analytics query with constitutional validation
     */
    executePrivacyPreservingQuery(rawData: any[], query: PrivacyPreservingQuery): Promise<PrivacyPreservingAnalyticsResults>;
    /**
     * Apply high privacy protection (differential privacy + k-anonymity + l-diversity)
     */
    private applyHighPrivacyProtection;
    /**
     * Apply medium privacy protection (k-anonymity + differential privacy)
     */
    private applyMediumPrivacyProtection;
    /**
     * Apply standard privacy protection (k-anonymity only)
     */
    private applyStandardPrivacyProtection;
    /**
     * Apply k-anonymity to protect individual privacy
     */
    private applyKAnonymity;
    /**
     * Apply l-diversity for additional privacy protection
     */
    private applyLDiversity;
    /**
     * Apply differential privacy with Laplace noise
     */
    private applyDifferentialPrivacy;
    /**
     * Generate Laplace noise for differential privacy
     */
    private generateLaplaceNoise;
    /**
     * Generalize values for k-anonymity
     */
    private generalize;
    /**
     * Calculate privacy metrics for high privacy level
     */
    private calculateHighPrivacyMetrics;
    /**
     * Calculate privacy metrics for medium privacy level
     */
    private calculateMediumPrivacyMetrics;
    /**
     * Calculate privacy metrics for standard privacy level
     */
    private calculateStandardPrivacyMetrics;
    /**
     * Generate analytics results based on query type
     */
    private generateAnalyticsResults;
    /**
     * Calculate aggregations with privacy protection
     */
    private calculateAggregations;
    /**
     * Calculate correlations with privacy protection
     */
    private calculateCorrelations;
    /**
     * Calculate Pearson correlation coefficient
     */
    private calculatePearsonCorrelation;
    /**
     * Calculate distributions with privacy protection
     */
    private calculateDistributions;
    /**
     * Calculate trends with privacy protection
     */
    private calculateTrends;
    /**
     * Get privacy technique name
     */
    private getPrivacyTechnique;
    /**
     * Get current privacy budget usage
     */
    getPrivacyBudgetUsage(): {
        used: number;
        total: number;
        remaining: number;
    };
    /**
     * Reset privacy budget (should be done periodically)
     */
    resetPrivacyBudget(): void;
    /**
     * Get audit trail for compliance reporting
     */
    getAuditTrail(): PrivacyPreservingAnalyticsAudit[];
    /**
     * Validate constitutional compliance
     */
    validateConstitutionalCompliance(): Promise<{
        compliant: boolean;
        score: number;
        issues: string[];
    }>;
}
/**
 * Factory function to create privacy-preserving analytics service
 */
export declare function createPrivacyPreservingAnalyticsService(config: PrivacyPreservingAnalyticsConfig): PrivacyPreservingAnalyticsService;
/**
 * Constitutional privacy validation for analytics operations
 */
export declare function validatePrivacyPreservingAnalytics(query: PrivacyPreservingQuery, config: PrivacyPreservingAnalyticsConfig): Promise<{
    valid: boolean;
    violations: string[];
}>;
export {};
