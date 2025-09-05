import type { LoggerService, MetricsService } from "@neonpro/core-services";
import type { ABTestResult, DriftDetectionResult, ModelVersion } from "@neonpro/types";
import type { AIServiceConfig, CacheService } from "./enhanced-service-base";
import { EnhancedAIService } from "./enhanced-service-base";
export interface PatientProfile {
    patient_id: string;
    age: number;
    gender: "male" | "female" | "other";
    location_distance_km: number;
    insurance_type: "private" | "public" | "self_pay" | "mixed";
    employment_status: "employed" | "unemployed" | "retired" | "student" | "unknown";
    chronic_conditions: string[];
    medication_adherence_score: number;
    communication_preferences: ("email" | "sms" | "phone" | "app")[];
    language_preference: string;
}
export interface AppointmentContext {
    appointment_id: string;
    patient_id: string;
    doctor_id: string;
    clinic_id: string;
    appointment_type: "consultation" | "follow_up" | "exam" | "procedure" | "emergency";
    specialty: string;
    scheduled_datetime: string;
    duration_minutes: number;
    is_first_appointment: boolean;
    urgency_level: "low" | "medium" | "high" | "urgent";
    cost_estimate: number;
    requires_preparation: boolean;
    preparation_complexity: "none" | "simple" | "moderate" | "complex";
}
export interface HistoricalPatternData {
    patient_no_show_rate: number;
    clinic_no_show_rate: number;
    doctor_no_show_rate: number;
    specialty_no_show_rate: number;
    time_slot_no_show_rate: number;
    day_of_week_no_show_rate: number;
    season_no_show_rate: number;
    weather_impact_factor?: number;
}
export interface ExternalFactors {
    weather_conditions?: "sunny" | "rainy" | "snowy" | "stormy" | "cloudy";
    traffic_conditions?: "light" | "moderate" | "heavy" | "severe";
    public_transport_status?: "normal" | "delayed" | "disrupted" | "strike";
    local_events?: string[];
    holiday_proximity_days?: number;
    economic_indicators?: {
        local_unemployment_rate: number;
        healthcare_access_index: number;
    };
}
export interface InterventionAnalysis {
    scenario_name: string;
    predicted_no_show_reduction: number;
    cost_benefit_ratio: number;
    implementation_difficulty: "easy" | "moderate" | "hard" | "very_hard";
    expected_roi_percent: number;
    risk_factors: string[];
    success_prerequisites: string[];
}
export interface PredictionInput extends AIServiceInput {
    action: "predict" | "train_model" | "get_model_performance" | "bulk_predict" | "update_model" | "get_feature_importance" | "simulate_interventions" | "start_ab_test" | "stop_ab_test" | "get_ab_test_results" | "deploy_model" | "detect_drift" | "get_model_versions" | "rollback_model";
    patient_profile?: PatientProfile;
    appointment_context?: AppointmentContext;
    external_factors?: ExternalFactors;
    prediction_requests?: {
        patient_profile: PatientProfile;
        appointment_context: AppointmentContext;
        external_factors?: ExternalFactors;
    }[];
    training_data_window_days?: number;
    model_version?: string;
    feature_selection?: string[];
    ab_test_config?: {
        model_a_version: string;
        model_b_version: string;
        traffic_split: number;
        duration_days: number;
        success_metrics: string[];
    };
    ab_test_id?: string;
    deployment_config?: {
        environment: "staging" | "production";
        traffic_percentage: number;
        rollback_criteria?: {
            accuracy_threshold: number;
            error_rate_threshold: number;
        };
    };
    drift_detection_config?: {
        reference_period_days: number;
        comparison_period_days: number;
        sensitivity: "low" | "medium" | "high";
    };
    intervention_scenarios?: InterventionScenario[];
}
export interface PredictionOutput extends AIServiceOutput {
    no_show_probability?: number;
    risk_category?: "low" | "medium" | "high" | "very_high";
    confidence_score?: number;
    contributing_factors?: FactorContribution[];
    recommendations?: RecommendedAction[];
    bulk_predictions?: {
        appointment_id: string;
        no_show_probability: number;
        risk_category: string;
        confidence_score: number;
    }[];
    model_performance?: ModelPerformanceMetrics;
    feature_importance?: FeatureImportance[];
    ab_test_result?: ABTestResult;
    ab_test_id?: string;
    model_versions?: ModelVersion[];
    deployment_status?: string;
    drift_detection_result?: DriftDetectionResult;
    intervention_analysis?: InterventionAnalysis[];
}
export interface RecommendedAction {
    action_type: "reminder" | "scheduling" | "incentive" | "support" | "escalation";
    priority: "low" | "medium" | "high" | "urgent";
    description: string;
    estimated_impact: number;
    implementation_cost: "low" | "medium" | "high";
    timing_recommendation: string;
    success_probability: number;
}
export interface ModelPerformanceMetrics {
    model_version: string;
    training_data_points: number;
    validation_accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    auc_roc: number;
    confusion_matrix: {
        true_positives: number;
        true_negatives: number;
        false_positives: number;
        false_negatives: number;
    };
    calibration_score: number;
    last_trained: string;
    data_freshness_days: number;
}
export interface FeatureImportance {
    feature_name: string;
    importance_score: number;
    category: string;
    description: string;
    stability_score: number;
}
export interface InterventionScenario {
    name: string;
    description: string;
    changes: {
        reminder_strategy?: "none" | "email" | "sms" | "phone" | "multi_channel";
        reminder_timing_hours?: number[];
        incentives?: ("discount" | "priority_booking" | "gift_card" | "loyalty_points")[];
        scheduling_flexibility?: "strict" | "flexible" | "very_flexible";
        preparation_support?: "none" | "basic" | "comprehensive";
    };
    estimated_cost_per_appointment?: number;
}
export interface FactorContribution {
    factor_name: string;
    category: "patient" | "appointment" | "external" | "historical";
    importance_weight: number;
    impact_direction: "increases_risk" | "decreases_risk";
    description: string;
    confidence: number;
}
export declare class NoShowPredictionService extends EnhancedAIService<PredictionInput, PredictionOutput> {
    private modelVersion;
    private featureWeights;
    private readonly activeABTests;
    constructor(cache: CacheService, logger: LoggerService, metrics: MetricsService, config?: AIServiceConfig);
    private initializePredictionModel;
    protected executeCore(input: PredictionInput): Promise<PredictionOutput>;
    private bulkPredictNoShow;
    private extractFeatures;
    private runPredictionModel;
    private getHistoricalPatterns;
    private trainModel;
    private getModelPerformance;
    private updateModel;
    private getFeatureImportance;
    private simulateInterventions;
    private loadFeatureWeights;
    private loadHistoricalPatterns;
    private updateFeatureWeights;
    private simpleHash;
    private assessImplementationDifficulty;
    private identifyRiskFactors;
    private identifyPrerequisites;
    predictAppointmentNoShow(patientProfile: PatientProfile, appointmentContext: AppointmentContext, externalFactors?: ExternalFactors): Promise<{
        probability: number;
        riskLevel: string;
        recommendations: RecommendedAction[];
    }>;
    getModelStats(): Promise<ModelPerformanceMetrics>;
    /**
     * Create and deploy a new model version with specified configuration
     */
    createAndDeployModel(config: ModelConfiguration, environment?: "staging" | "production"): Promise<{
        success: boolean;
        model_version: string;
        deployment_status: string;
    }>;
    /**
     * Start A/B test between two model versions
     */
    startABTest(modelAVersion: string, modelBVersion: string, durationDays?: number): Promise<{
        success: boolean;
        test_id: string;
        ab_test_result: ABTestResult;
    }>;
    /**
     * Check model health and detect data drift
     */
    checkModelHealth(): Promise<{
        success: boolean;
        drift_detected: boolean;
        drift_result: DriftDetectionResult;
        requires_retraining: boolean;
    }>;
    /**
     * Get all available model versions
     */
    getModelVersions(): Promise<{
        success: boolean;
        versions: unknown[];
        current_production_version?: string;
    }>;
    /**
     * Rollback to a previous model version
     */
    rollbackModel(versionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get A/B test results for a specific test
     */
    getABTestResults(testId: string): Promise<{
        success: boolean;
        test_result: ABTestResult;
        recommendation: "continue" | "stop_use_a" | "stop_use_b" | "extend_test";
    }>;
    /**
     * Comprehensive model health check and maintenance
     */
    performModelMaintenance(): Promise<{
        success: boolean;
        maintenance_summary: {
            drift_check: DriftDetectionResult;
            performance_check: unknown;
            recommendation: string;
            actions_taken: string[];
        };
    }>;
}
export declare const noShowPredictionService: NoShowPredictionService;
//# sourceMappingURL=no-show-prediction-service.d.ts.map