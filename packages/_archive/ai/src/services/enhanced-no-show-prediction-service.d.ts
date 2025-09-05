import type { LoggerService, MetricsService } from "@neonpro/core-services";
import type { AIServiceConfig, CacheService } from "./enhanced-service-base";
import type { AppointmentContext, ExternalFactors, FeatureImportance, PatientProfile, PredictionInput, PredictionOutput } from "./no-show-prediction-service";
import { NoShowPredictionService } from "./no-show-prediction-service";
export interface EnsembleModelConfig {
    models: {
        randomForest: {
            enabled: boolean;
            weight: number;
            nEstimators: number;
            maxDepth: number;
            minSamplesLeaf: number;
        };
        xgboost: {
            enabled: boolean;
            weight: number;
            learningRate: number;
            maxDepth: number;
            nEstimators: number;
            subsample: number;
        };
        neuralNetwork: {
            enabled: boolean;
            weight: number;
            layers: number[];
            activation: "relu" | "tanh" | "sigmoid";
            dropout: number;
            learningRate: number;
        };
        logisticRegression: {
            enabled: boolean;
            weight: number;
            regularization: "l1" | "l2" | "elasticnet";
            alpha: number;
        };
    };
    ensembleMethod: "weighted_average" | "stacking" | "voting";
    calibration: {
        enabled: boolean;
        method: "platt" | "isotonic";
    };
    crossValidation: {
        folds: number;
        stratified: boolean;
        shuffle: boolean;
    };
}
export interface AdvancedFeatures extends Record<string, number> {
    appointment_time_sin: number;
    appointment_time_cos: number;
    day_of_year_sin: number;
    day_of_year_cos: number;
    days_until_weekend: number;
    is_holiday_week: number;
    season_summer: number;
    season_winter: number;
    avg_no_show_rate_3months: number;
    avg_no_show_rate_12months: number;
    no_show_streak: number;
    successful_appointment_streak: number;
    late_cancellation_rate: number;
    reschedule_frequency: number;
    appointment_urgency_score: number;
    treatment_complexity_score: number;
    patient_loyalty_score: number;
    communication_responsiveness: number;
    insurance_coverage_score: number;
    clinic_capacity_utilization: number;
    doctor_popularity_score: number;
    appointment_booking_lead_time: number;
    patient_travel_time: number;
    parking_availability: number;
    local_economic_index: number;
    patient_socioeconomic_score: number;
    education_level_encoded: number;
    employment_stability_score: number;
    patient_age_x_distance: number;
    cost_x_urgency: number;
    preparation_x_complexity: number;
    weather_x_distance: number;
    public_transport_reliability: number;
    traffic_congestion_index: number;
    weather_severity_score: number;
    local_events_impact: number;
}
export interface ModelPrediction {
    modelName: string;
    prediction: number;
    confidence: number;
    weight: number;
    features_used: number;
    processing_time_ms: number;
}
export interface EnsemblePredictionResult {
    final_prediction: number;
    confidence_score: number;
    model_predictions: ModelPrediction[];
    ensemble_method: string;
    feature_importance_aggregated: FeatureImportance[];
    prediction_explanation: string;
    calibrated_probability: number;
    prediction_intervals: {
        lower_bound: number;
        upper_bound: number;
        confidence_level: number;
    };
}
export interface ROIMetrics {
    period_start: string;
    period_end: string;
    total_appointments: number;
    predicted_no_shows: number;
    actual_no_shows: number;
    prevented_no_shows: number;
    cost_per_no_show: number;
    intervention_costs: number;
    gross_savings: number;
    net_savings: number;
    roi_percentage: number;
    accuracy_percentage: number;
    precision: number;
    recall: number;
    f1_score: number;
}
export interface InterventionStrategy {
    strategy_id: string;
    name: string;
    description: string;
    trigger_threshold: number;
    channels: string[];
    timing_hours_before: number[];
    personalization_level: "basic" | "moderate" | "advanced";
    estimated_effectiveness: number;
    cost_per_intervention: number;
    target_patient_segments: string[];
    success_metrics: {
        response_rate: number;
        conversion_rate: number;
        cost_effectiveness: number;
    };
}
export declare class EnhancedNoShowPredictionService extends NoShowPredictionService {
    private readonly ensembleConfig;
    constructor(cache: CacheService, logger: LoggerService, metrics: MetricsService, config?: AIServiceConfig & {
        ensembleConfig?: EnsembleModelConfig;
    });
    private getDefaultEnsembleConfig;
    private initializeEnhancedModels;
    protected executeCore(input: PredictionInput): Promise<PredictionOutput>;
    private enhancedPredictNoShow;
    private extractAdvancedFeatures;
    private runEnsemblePrediction;
    private runRandomForestModel;
    private runXGBoostModel;
    private runNeuralNetworkModel;
    private runLogisticRegressionModel;
    private combineModelPredictions;
    private weightedAveragePrediction;
    private getAdvancedPatientHistory;
    private calculateUrgencyScore;
    private calculateComplexityScore;
    private calculateInsuranceScore;
    private getDayOfYear;
    private simpleHash;
    private loadEnsembleModels;
    private initializeFeaturePipelines;
    private loadROIMetrics;
    getEnhancedPredictionWithROI(patientProfile: PatientProfile, appointmentContext: AppointmentContext, externalFactors?: ExternalFactors): Promise<{
        prediction: EnsemblePredictionResult;
        roi_impact: ROIMetrics;
        recommended_interventions: InterventionStrategy[];
    }>;
    private getRandomForestWeights;
    private getXGBoostWeights;
    private getLogisticRegressionWeights;
    private getSimulatedWeight;
    private applyActivation;
    private applyRandomForestTransform;
    private calculateModelConfidence;
    private calculateNeuralNetworkConfidence;
    private calculateEnsembleConfidence;
    private calibratePrediction;
    private calculatePredictionIntervals;
    private generatePredictionExplanation;
    private calculateModelAgreement;
    private getTopRiskFactors;
    private calculateRiskCategory;
    private convertFeatureImportanceToFactors;
    private generateAdvancedRecommendations;
    private getOptimalReminderChannels;
    private getOptimalReminderTiming;
    private calculateInterventionImpact;
    private recordPredictionForROI;
    private calculatePredictionROIImpact;
    private selectOptimalInterventions;
    getAdvancedPredictionMetrics(): Promise<{
        model_performance: {
            ensemble_accuracy: number;
            individual_model_performance: Record<string, number>;
            feature_importance_stability: number;
            calibration_quality: number;
        };
        roi_summary: {
            current_month_savings: number;
            yearly_projection: number;
            intervention_effectiveness: number;
            cost_per_prevented_no_show: number;
        };
        system_performance: {
            avg_prediction_time_ms: number;
            daily_predictions: number;
            cache_hit_rate: number;
            error_rate: number;
        };
    }>;
    private stackingPrediction;
    private votingPrediction;
    private aggregateFeatureImportance;
    private trainEnsembleModels;
    private getROIMetrics;
    private optimizeInterventionStrategies;
    private calibrateEnsembleModels;
    private enhancedBulkPredictNoShow;
    private estimateTravelTime;
    private isHolidayWeek;
    private getClinicMetrics;
    private getDoctorMetrics;
    private getSocioeconomicData;
    private calculateWeatherSeverity;
    private calculateTrafficIndex;
    private calculateTransportReliability;
    private calculateEventsImpact;
}
export declare const enhancedNoShowPredictionService: EnhancedNoShowPredictionService;
//# sourceMappingURL=enhanced-no-show-prediction-service.d.ts.map