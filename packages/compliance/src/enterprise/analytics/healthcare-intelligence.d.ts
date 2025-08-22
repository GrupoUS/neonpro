/**
 * Healthcare Intelligence Service
 * AI-driven healthcare insights with constitutional medical ethics and patient privacy
 * Compliance: LGPD + CFM Medical Ethics + Constitutional AI + ≥9.9/10 Standards
 */
import { z } from 'zod';
declare const HealthcareIntelligenceConfigSchema: z.ZodObject<{
    ai_ethics_enabled: z.ZodDefault<z.ZodBoolean>;
    explainable_ai_required: z.ZodDefault<z.ZodBoolean>;
    medical_accuracy_threshold: z.ZodNumber;
    constitutional_ai_compliance: z.ZodDefault<z.ZodBoolean>;
    bias_detection_enabled: z.ZodDefault<z.ZodBoolean>;
    human_oversight_required: z.ZodDefault<z.ZodBoolean>;
    cfm_ethics_validation: z.ZodDefault<z.ZodBoolean>;
    patient_privacy_protection: z.ZodDefault<z.ZodBoolean>;
    anonymization_required: z.ZodDefault<z.ZodBoolean>;
    differential_privacy_epsilon: z.ZodNumber;
    max_prediction_confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    ai_ethics_enabled: boolean;
    explainable_ai_required: boolean;
    medical_accuracy_threshold: number;
    constitutional_ai_compliance: boolean;
    bias_detection_enabled: boolean;
    human_oversight_required: boolean;
    cfm_ethics_validation: boolean;
    patient_privacy_protection: boolean;
    anonymization_required: boolean;
    differential_privacy_epsilon: number;
    max_prediction_confidence: number;
}, {
    medical_accuracy_threshold: number;
    differential_privacy_epsilon: number;
    max_prediction_confidence: number;
    ai_ethics_enabled?: boolean | undefined;
    explainable_ai_required?: boolean | undefined;
    constitutional_ai_compliance?: boolean | undefined;
    bias_detection_enabled?: boolean | undefined;
    human_oversight_required?: boolean | undefined;
    cfm_ethics_validation?: boolean | undefined;
    patient_privacy_protection?: boolean | undefined;
    anonymization_required?: boolean | undefined;
}>;
declare const HealthcareIntelligenceQuerySchema: z.ZodObject<{
    query_id: z.ZodString;
    query_type: z.ZodEnum<["treatment_prediction", "outcome_analysis", "resource_optimization", "risk_assessment", "wellness_insights", "population_health", "clinical_decision_support"]>;
    patient_cohort: z.ZodObject<{
        cohort_id: z.ZodOptional<z.ZodString>;
        inclusion_criteria: z.ZodRecord<z.ZodString, z.ZodAny>;
        exclusion_criteria: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        minimum_sample_size: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        inclusion_criteria: Record<string, any>;
        minimum_sample_size: number;
        cohort_id?: string | undefined;
        exclusion_criteria?: Record<string, any> | undefined;
    }, {
        inclusion_criteria: Record<string, any>;
        minimum_sample_size: number;
        cohort_id?: string | undefined;
        exclusion_criteria?: Record<string, any> | undefined;
    }>;
    analysis_parameters: z.ZodObject<{
        time_horizon: z.ZodString;
        confidence_level: z.ZodNumber;
        include_demographics: z.ZodDefault<z.ZodBoolean>;
        include_comorbidities: z.ZodDefault<z.ZodBoolean>;
        include_treatment_history: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        time_horizon: string;
        confidence_level: number;
        include_demographics: boolean;
        include_comorbidities: boolean;
        include_treatment_history: boolean;
    }, {
        time_horizon: string;
        confidence_level: number;
        include_demographics?: boolean | undefined;
        include_comorbidities?: boolean | undefined;
        include_treatment_history?: boolean | undefined;
    }>;
    ethical_considerations: z.ZodObject<{
        cfm_ethics_approval: z.ZodDefault<z.ZodBoolean>;
        patient_autonomy_respected: z.ZodDefault<z.ZodBoolean>;
        beneficence_principle: z.ZodDefault<z.ZodBoolean>;
        non_maleficence_principle: z.ZodDefault<z.ZodBoolean>;
        justice_principle: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        cfm_ethics_approval: boolean;
        patient_autonomy_respected: boolean;
        beneficence_principle: boolean;
        non_maleficence_principle: boolean;
        justice_principle: boolean;
    }, {
        cfm_ethics_approval?: boolean | undefined;
        patient_autonomy_respected?: boolean | undefined;
        beneficence_principle?: boolean | undefined;
        non_maleficence_principle?: boolean | undefined;
        justice_principle?: boolean | undefined;
    }>;
    privacy_requirements: z.ZodObject<{
        anonymization_level: z.ZodEnum<["basic", "advanced", "full"]>;
        consent_validation: z.ZodDefault<z.ZodBoolean>;
        lgpd_compliance: z.ZodDefault<z.ZodBoolean>;
        data_minimization: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        anonymization_level: "basic" | "advanced" | "full";
        consent_validation: boolean;
        lgpd_compliance: boolean;
        data_minimization: boolean;
    }, {
        anonymization_level: "basic" | "advanced" | "full";
        consent_validation?: boolean | undefined;
        lgpd_compliance?: boolean | undefined;
        data_minimization?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query_id: string;
    query_type: "treatment_prediction" | "outcome_analysis" | "resource_optimization" | "risk_assessment" | "wellness_insights" | "population_health" | "clinical_decision_support";
    patient_cohort: {
        inclusion_criteria: Record<string, any>;
        minimum_sample_size: number;
        cohort_id?: string | undefined;
        exclusion_criteria?: Record<string, any> | undefined;
    };
    analysis_parameters: {
        time_horizon: string;
        confidence_level: number;
        include_demographics: boolean;
        include_comorbidities: boolean;
        include_treatment_history: boolean;
    };
    ethical_considerations: {
        cfm_ethics_approval: boolean;
        patient_autonomy_respected: boolean;
        beneficence_principle: boolean;
        non_maleficence_principle: boolean;
        justice_principle: boolean;
    };
    privacy_requirements: {
        anonymization_level: "basic" | "advanced" | "full";
        consent_validation: boolean;
        lgpd_compliance: boolean;
        data_minimization: boolean;
    };
}, {
    query_id: string;
    query_type: "treatment_prediction" | "outcome_analysis" | "resource_optimization" | "risk_assessment" | "wellness_insights" | "population_health" | "clinical_decision_support";
    patient_cohort: {
        inclusion_criteria: Record<string, any>;
        minimum_sample_size: number;
        cohort_id?: string | undefined;
        exclusion_criteria?: Record<string, any> | undefined;
    };
    analysis_parameters: {
        time_horizon: string;
        confidence_level: number;
        include_demographics?: boolean | undefined;
        include_comorbidities?: boolean | undefined;
        include_treatment_history?: boolean | undefined;
    };
    ethical_considerations: {
        cfm_ethics_approval?: boolean | undefined;
        patient_autonomy_respected?: boolean | undefined;
        beneficence_principle?: boolean | undefined;
        non_maleficence_principle?: boolean | undefined;
        justice_principle?: boolean | undefined;
    };
    privacy_requirements: {
        anonymization_level: "basic" | "advanced" | "full";
        consent_validation?: boolean | undefined;
        lgpd_compliance?: boolean | undefined;
        data_minimization?: boolean | undefined;
    };
}>;
declare const HealthcareIntelligenceResultsSchema: z.ZodObject<{
    query_id: z.ZodString;
    analysis_type: z.ZodString;
    insights: z.ZodObject<{
        primary_findings: z.ZodArray<z.ZodObject<{
            insight_id: z.ZodString;
            title: z.ZodString;
            description: z.ZodString;
            confidence_score: z.ZodNumber;
            clinical_significance: z.ZodEnum<["low", "moderate", "high", "critical"]>;
            evidence_strength: z.ZodEnum<["weak", "moderate", "strong", "very_strong"]>;
            recommendation: z.ZodString;
            contraindications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            title: string;
            insight_id: string;
            confidence_score: number;
            clinical_significance: "critical" | "moderate" | "low" | "high";
            evidence_strength: "moderate" | "weak" | "strong" | "very_strong";
            recommendation: string;
            contraindications?: string[] | undefined;
        }, {
            description: string;
            title: string;
            insight_id: string;
            confidence_score: number;
            clinical_significance: "critical" | "moderate" | "low" | "high";
            evidence_strength: "moderate" | "weak" | "strong" | "very_strong";
            recommendation: string;
            contraindications?: string[] | undefined;
        }>, "many">;
        secondary_findings: z.ZodArray<z.ZodObject<{
            finding_id: z.ZodString;
            description: z.ZodString;
            statistical_significance: z.ZodNumber;
            clinical_relevance: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description: string;
            finding_id: string;
            statistical_significance: number;
            clinical_relevance: string;
        }, {
            description: string;
            finding_id: string;
            statistical_significance: number;
            clinical_relevance: string;
        }>, "many">;
        risk_factors: z.ZodArray<z.ZodObject<{
            factor_name: z.ZodString;
            risk_level: z.ZodEnum<["low", "moderate", "high", "very_high"]>;
            odds_ratio: z.ZodOptional<z.ZodNumber>;
            confidence_interval: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            factor_name: string;
            risk_level: "moderate" | "low" | "high" | "very_high";
            odds_ratio?: number | undefined;
            confidence_interval?: string | undefined;
        }, {
            factor_name: string;
            risk_level: "moderate" | "low" | "high" | "very_high";
            odds_ratio?: number | undefined;
            confidence_interval?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        primary_findings: {
            description: string;
            title: string;
            insight_id: string;
            confidence_score: number;
            clinical_significance: "critical" | "moderate" | "low" | "high";
            evidence_strength: "moderate" | "weak" | "strong" | "very_strong";
            recommendation: string;
            contraindications?: string[] | undefined;
        }[];
        secondary_findings: {
            description: string;
            finding_id: string;
            statistical_significance: number;
            clinical_relevance: string;
        }[];
        risk_factors: {
            factor_name: string;
            risk_level: "moderate" | "low" | "high" | "very_high";
            odds_ratio?: number | undefined;
            confidence_interval?: string | undefined;
        }[];
    }, {
        primary_findings: {
            description: string;
            title: string;
            insight_id: string;
            confidence_score: number;
            clinical_significance: "critical" | "moderate" | "low" | "high";
            evidence_strength: "moderate" | "weak" | "strong" | "very_strong";
            recommendation: string;
            contraindications?: string[] | undefined;
        }[];
        secondary_findings: {
            description: string;
            finding_id: string;
            statistical_significance: number;
            clinical_relevance: string;
        }[];
        risk_factors: {
            factor_name: string;
            risk_level: "moderate" | "low" | "high" | "very_high";
            odds_ratio?: number | undefined;
            confidence_interval?: string | undefined;
        }[];
    }>;
    explainability: z.ZodObject<{
        model_explanation: z.ZodString;
        feature_importance: z.ZodArray<z.ZodObject<{
            feature_name: z.ZodString;
            importance_score: z.ZodNumber;
            clinical_interpretation: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            feature_name: string;
            importance_score: number;
            clinical_interpretation: string;
        }, {
            feature_name: string;
            importance_score: number;
            clinical_interpretation: string;
        }>, "many">;
        decision_pathway: z.ZodArray<z.ZodString, "many">;
        uncertainty_analysis: z.ZodObject<{
            confidence_intervals: z.ZodRecord<z.ZodString, z.ZodString>;
            sensitivity_analysis: z.ZodString;
            limitation_disclosure: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            confidence_intervals: Record<string, string>;
            sensitivity_analysis: string;
            limitation_disclosure: string[];
        }, {
            confidence_intervals: Record<string, string>;
            sensitivity_analysis: string;
            limitation_disclosure: string[];
        }>;
    }, "strip", z.ZodTypeAny, {
        model_explanation: string;
        feature_importance: {
            feature_name: string;
            importance_score: number;
            clinical_interpretation: string;
        }[];
        decision_pathway: string[];
        uncertainty_analysis: {
            confidence_intervals: Record<string, string>;
            sensitivity_analysis: string;
            limitation_disclosure: string[];
        };
    }, {
        model_explanation: string;
        feature_importance: {
            feature_name: string;
            importance_score: number;
            clinical_interpretation: string;
        }[];
        decision_pathway: string[];
        uncertainty_analysis: {
            confidence_intervals: Record<string, string>;
            sensitivity_analysis: string;
            limitation_disclosure: string[];
        };
    }>;
    ethical_validation: z.ZodObject<{
        cfm_ethics_score: z.ZodNumber;
        bias_assessment: z.ZodObject<{
            demographic_bias_score: z.ZodNumber;
            treatment_bias_score: z.ZodNumber;
            outcome_bias_score: z.ZodNumber;
            bias_mitigation_applied: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            demographic_bias_score: number;
            treatment_bias_score: number;
            outcome_bias_score: number;
            bias_mitigation_applied: string[];
        }, {
            demographic_bias_score: number;
            treatment_bias_score: number;
            outcome_bias_score: number;
            bias_mitigation_applied: string[];
        }>;
        human_oversight_validation: z.ZodBoolean;
        patient_autonomy_preserved: z.ZodBoolean;
        constitutional_ai_compliance: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        constitutional_ai_compliance: boolean;
        cfm_ethics_score: number;
        bias_assessment: {
            demographic_bias_score: number;
            treatment_bias_score: number;
            outcome_bias_score: number;
            bias_mitigation_applied: string[];
        };
        human_oversight_validation: boolean;
        patient_autonomy_preserved: boolean;
    }, {
        constitutional_ai_compliance: boolean;
        cfm_ethics_score: number;
        bias_assessment: {
            demographic_bias_score: number;
            treatment_bias_score: number;
            outcome_bias_score: number;
            bias_mitigation_applied: string[];
        };
        human_oversight_validation: boolean;
        patient_autonomy_preserved: boolean;
    }>;
    privacy_certification: z.ZodObject<{
        anonymization_verified: z.ZodBoolean;
        lgpd_compliance_score: z.ZodNumber;
        consent_validation_complete: z.ZodBoolean;
        data_minimization_applied: z.ZodBoolean;
        privacy_budget_consumed: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lgpd_compliance_score: number;
        anonymization_verified: boolean;
        consent_validation_complete: boolean;
        data_minimization_applied: boolean;
        privacy_budget_consumed: number;
    }, {
        lgpd_compliance_score: number;
        anonymization_verified: boolean;
        consent_validation_complete: boolean;
        data_minimization_applied: boolean;
        privacy_budget_consumed: number;
    }>;
    generated_at: z.ZodString;
    valid_until: z.ZodString;
}, "strip", z.ZodTypeAny, {
    generated_at: string;
    query_id: string;
    analysis_type: string;
    insights: {
        primary_findings: {
            description: string;
            title: string;
            insight_id: string;
            confidence_score: number;
            clinical_significance: "critical" | "moderate" | "low" | "high";
            evidence_strength: "moderate" | "weak" | "strong" | "very_strong";
            recommendation: string;
            contraindications?: string[] | undefined;
        }[];
        secondary_findings: {
            description: string;
            finding_id: string;
            statistical_significance: number;
            clinical_relevance: string;
        }[];
        risk_factors: {
            factor_name: string;
            risk_level: "moderate" | "low" | "high" | "very_high";
            odds_ratio?: number | undefined;
            confidence_interval?: string | undefined;
        }[];
    };
    explainability: {
        model_explanation: string;
        feature_importance: {
            feature_name: string;
            importance_score: number;
            clinical_interpretation: string;
        }[];
        decision_pathway: string[];
        uncertainty_analysis: {
            confidence_intervals: Record<string, string>;
            sensitivity_analysis: string;
            limitation_disclosure: string[];
        };
    };
    ethical_validation: {
        constitutional_ai_compliance: boolean;
        cfm_ethics_score: number;
        bias_assessment: {
            demographic_bias_score: number;
            treatment_bias_score: number;
            outcome_bias_score: number;
            bias_mitigation_applied: string[];
        };
        human_oversight_validation: boolean;
        patient_autonomy_preserved: boolean;
    };
    privacy_certification: {
        lgpd_compliance_score: number;
        anonymization_verified: boolean;
        consent_validation_complete: boolean;
        data_minimization_applied: boolean;
        privacy_budget_consumed: number;
    };
    valid_until: string;
}, {
    generated_at: string;
    query_id: string;
    analysis_type: string;
    insights: {
        primary_findings: {
            description: string;
            title: string;
            insight_id: string;
            confidence_score: number;
            clinical_significance: "critical" | "moderate" | "low" | "high";
            evidence_strength: "moderate" | "weak" | "strong" | "very_strong";
            recommendation: string;
            contraindications?: string[] | undefined;
        }[];
        secondary_findings: {
            description: string;
            finding_id: string;
            statistical_significance: number;
            clinical_relevance: string;
        }[];
        risk_factors: {
            factor_name: string;
            risk_level: "moderate" | "low" | "high" | "very_high";
            odds_ratio?: number | undefined;
            confidence_interval?: string | undefined;
        }[];
    };
    explainability: {
        model_explanation: string;
        feature_importance: {
            feature_name: string;
            importance_score: number;
            clinical_interpretation: string;
        }[];
        decision_pathway: string[];
        uncertainty_analysis: {
            confidence_intervals: Record<string, string>;
            sensitivity_analysis: string;
            limitation_disclosure: string[];
        };
    };
    ethical_validation: {
        constitutional_ai_compliance: boolean;
        cfm_ethics_score: number;
        bias_assessment: {
            demographic_bias_score: number;
            treatment_bias_score: number;
            outcome_bias_score: number;
            bias_mitigation_applied: string[];
        };
        human_oversight_validation: boolean;
        patient_autonomy_preserved: boolean;
    };
    privacy_certification: {
        lgpd_compliance_score: number;
        anonymization_verified: boolean;
        consent_validation_complete: boolean;
        data_minimization_applied: boolean;
        privacy_budget_consumed: number;
    };
    valid_until: string;
}>;
export type HealthcareIntelligenceConfig = z.infer<typeof HealthcareIntelligenceConfigSchema>;
export type HealthcareIntelligenceQuery = z.infer<typeof HealthcareIntelligenceQuerySchema>;
export type HealthcareIntelligenceResults = z.infer<typeof HealthcareIntelligenceResultsSchema>;
export type HealthcareIntelligenceAudit = {
    audit_id: string;
    query_id: string;
    analysis_type: string;
    ai_model_used: string;
    ethical_review_result: Record<string, any>;
    privacy_impact_assessment: Record<string, any>;
    medical_accuracy_validation: Record<string, any>;
    constitutional_compliance_score: number;
    created_at: string;
    created_by: string;
    reviewed_by_physician: boolean;
    cfm_ethics_approval: boolean;
};
/**
 * Healthcare Intelligence Service
 * Constitutional AI-driven healthcare insights with medical ethics compliance
 */
export declare class HealthcareIntelligenceService {
    private readonly config;
    private readonly auditTrail;
    private privacyBudgetUsed;
    constructor(config: HealthcareIntelligenceConfig);
    /**
     * Generate healthcare intelligence insights with constitutional AI compliance
     */
    generateHealthcareInsights(patientData: any[], query: HealthcareIntelligenceQuery): Promise<HealthcareIntelligenceResults>;
    /**
     * Validate constitutional AI compliance
     */
    private validateConstitutionalAiCompliance;
    /**
     * Perform ethical validation based on CFM medical ethics principles
     */
    private performEthicalValidation;
    /**
     * Apply privacy protection and anonymization
     */
    private applyPrivacyProtection;
    /**
     * Detect and mitigate bias in AI analysis
     */
    private detectAndMitigateBias;
    /**
     * Generate AI-driven insights with constitutional compliance
     */
    private generateAiInsights;
    /**
     * Generate treatment predictions with medical accuracy validation
     */
    private generateTreatmentPredictions;
    /**
     * Generate outcome analysis with statistical validation
     */
    private generateOutcomeAnalysis;
    /**
     * Generate resource optimization insights
     */
    private generateResourceOptimization;
    /**
     * Generate risk assessment with constitutional compliance
     */
    private generateRiskAssessment;
    /**
     * Generate wellness insights
     */
    private generateWellnessInsights;
    /**
     * Generate population health insights
     */
    private generatePopulationHealthInsights;
    /**
     * Generate clinical decision support
     */
    private generateClinicalDecisionSupport;
    /**
     * Validate medical accuracy of AI insights
     */
    private validateMedicalAccuracy;
    /**
     * Perform human oversight review
     */
    private performHumanOversightReview;
    /**
     * Generate explainability report
     */
    private generateExplainabilityReport;
    /**
     * Validate results ethics
     */
    private validateResultsEthics;
    /**
     * Generate privacy certification
     */
    private generatePrivacyCertification;
    private applyFullAnonymization;
    private applyAdvancedAnonymization;
    private applyBasicAnonymization;
    private applyDifferentialPrivacy;
    private applyDataMinimization;
    private generateLaplaceNoise;
    private detectDemographicBias;
    private detectTreatmentBias;
    private applyBiasMitigation;
    private getAiModelName;
    private calculateValidityPeriod;
    /**
     * Get audit trail for compliance reporting
     */
    getAuditTrail(): HealthcareIntelligenceAudit[];
    /**
     * Get privacy budget usage
     */
    getPrivacyBudgetUsage(): {
        used: number;
        remaining: number;
    };
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
 * Factory function to create healthcare intelligence service
 */
export declare function createHealthcareIntelligenceService(config: HealthcareIntelligenceConfig): HealthcareIntelligenceService;
/**
 * Constitutional validation for healthcare AI operations
 */
export declare function validateHealthcareIntelligence(query: HealthcareIntelligenceQuery, config: HealthcareIntelligenceConfig): Promise<{
    valid: boolean;
    violations: string[];
}>;
export {};
