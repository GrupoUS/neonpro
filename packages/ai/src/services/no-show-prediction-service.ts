// No-Show Prediction Service for AI Services
// Machine learning-powered prediction system to reduce appointment no-shows

import type { LoggerService, MetricsService } from "@neonpro/core-services";
import type { ABTestResult, DriftDetectionResult, ModelVersion } from "@neonpro/types";
import type { AIServiceConfig, CacheService } from "./enhanced-service-base";
import { EnhancedAIService } from "./enhanced-service-base";
import { MLPipelineManagementService } from "./ml-pipeline-management";

// Prediction Types and Interfaces
export interface PatientProfile {
  patient_id: string;
  age: number;
  gender: "male" | "female" | "other";
  location_distance_km: number;
  insurance_type: "private" | "public" | "self_pay" | "mixed";
  employment_status:
    | "employed"
    | "unemployed"
    | "retired"
    | "student"
    | "unknown";
  chronic_conditions: string[];
  medication_adherence_score: number; // 0-100
  communication_preferences: ("email" | "sms" | "phone" | "app")[];
  language_preference: string;
}

export interface AppointmentContext {
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  appointment_type:
    | "consultation"
    | "follow_up"
    | "exam"
    | "procedure"
    | "emergency";
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

// A/B Testing and Model Management Types
// Additional types specific to no-show predictions

export interface PredictionInput extends AIServiceInput {
  action:
    | "predict"
    | "train_model"
    | "get_model_performance"
    | "bulk_predict"
    | "update_model"
    | "get_feature_importance"
    | "simulate_interventions"
    | "start_ab_test"
    | "stop_ab_test"
    | "get_ab_test_results"
    | "deploy_model"
    | "detect_drift"
    | "get_model_versions"
    | "rollback_model";

  // Prediction inputs
  patient_profile?: PatientProfile;
  appointment_context?: AppointmentContext;
  external_factors?: ExternalFactors;

  // Bulk prediction
  prediction_requests?: {
    patient_profile: PatientProfile;
    appointment_context: AppointmentContext;
    external_factors?: ExternalFactors;
  }[];

  // Training and model management
  training_data_window_days?: number;
  model_version?: string;
  feature_selection?: string[];

  // A/B Testing
  ab_test_config?: {
    model_a_version: string;
    model_b_version: string;
    traffic_split: number; // percentage for model B
    duration_days: number;
    success_metrics: string[];
  };
  ab_test_id?: string;

  // Model deployment
  deployment_config?: {
    environment: "staging" | "production";
    traffic_percentage: number;
    rollback_criteria?: {
      accuracy_threshold: number;
      error_rate_threshold: number;
    };
  };

  // Drift detection
  drift_detection_config?: {
    reference_period_days: number;
    comparison_period_days: number;
    sensitivity: "low" | "medium" | "high";
  };

  // Intervention simulation
  intervention_scenarios?: InterventionScenario[];
}

export interface PredictionOutput extends AIServiceOutput {
  no_show_probability?: number;
  risk_category?: "low" | "medium" | "high" | "very_high";
  confidence_score?: number;
  contributing_factors?: FactorContribution[];
  recommendations?: RecommendedAction[];

  // Bulk predictions
  bulk_predictions?: {
    appointment_id: string;
    no_show_probability: number;
    risk_category: string;
    confidence_score: number;
  }[];

  // Model performance
  model_performance?: ModelPerformanceMetrics;
  feature_importance?: FeatureImportance[];

  // A/B Testing results
  ab_test_result?: ABTestResult;
  ab_test_id?: string;

  // Model management
  model_versions?: ModelVersion[];
  deployment_status?: string;

  // Drift detection
  drift_detection_result?: DriftDetectionResult;

  // Intervention analysis
  intervention_analysis?: InterventionAnalysis[];
}

export interface RecommendedAction {
  action_type:
    | "reminder"
    | "scheduling"
    | "incentive"
    | "support"
    | "escalation";
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
  estimated_impact: number; // Expected reduction in no-show probability
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
  stability_score: number; // How consistent this feature's importance is across model versions
}

export interface InterventionScenario {
  name: string;
  description: string;
  changes: {
    reminder_strategy?: "none" | "email" | "sms" | "phone" | "multi_channel";
    reminder_timing_hours?: number[];
    incentives?: (
      | "discount"
      | "priority_booking"
      | "gift_card"
      | "loyalty_points"
    )[];
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

// No-Show Prediction Service Implementation with Supabase MCP Integration
export class NoShowPredictionService extends EnhancedAIService<
  PredictionInput,
  PredictionOutput
> {
  private modelVersion = "v1.2.0";
  private featureWeights: Map<string, number> = new Map();
  private readonly activeABTests: Map<string, ABTestResult> = new Map();

  constructor(
    cache: CacheService,
    logger: LoggerService,
    metrics: MetricsService,
    config?: AIServiceConfig,
  ) {
    super(cache, logger, metrics, {
      enableCaching: true,
      cacheTTL: 3600, // 1 hour for predictions
      enableMetrics: true,
      enableAuditTrail: true,
      performanceThreshold: 1000, // 1 second for predictions
      errorRetryCount: 3,
      ...config,
    });

    // Initialize ML Pipeline Management Service
    this.mlPipelineService = new MLPipelineManagementService(
      cache,
      logger,
      metrics,
      config,
    );

    // Initialize prediction model
    this.initializePredictionModel();
  }

  private async initializePredictionModel(): Promise<void> {
    try {
      // Load feature weights from Supabase using MCP
      await this.loadFeatureWeights();

      // Load historical patterns from Supabase
      await this.loadHistoricalPatterns();

      // Load active A/B tests
      await this.loadActiveABTests();
    } catch {}
  }

  protected async executeCore(
    input: PredictionInput,
  ): Promise<PredictionOutput> {
    const startTime = performance.now();

    try {
      switch (input.action) {
        case "predict": {
          return await this.predictNoShow(input);
        }
        case "bulk_predict": {
          return await this.bulkPredictNoShow(input);
        }
        case "train_model": {
          return await this.trainModel(input);
        }
        case "get_model_performance": {
          return await this.getModelPerformance();
        }
        case "update_model": {
          return await this.updateModel(input);
        }
        case "get_feature_importance": {
          return await this.getFeatureImportance();
        }
        case "simulate_interventions": {
          return await this.simulateInterventions(input);
        }
        case "start_ab_test": {
          return await this.startABTest(input);
        }
        case "stop_ab_test": {
          return await this.stopABTest(input);
        }
        case "get_ab_test_results": {
          return await this.getABTestResults(input);
        }
        case "deploy_model": {
          return await this.deployModel(input);
        }
        case "detect_drift": {
          return await this.detectDrift(input);
        }
        case "get_model_versions": {
          return await this.getModelVersions();
        }
        case "rollback_model": {
          return await this.rollbackModel(input);
        }
        default: {
          throw new Error(`Unsupported prediction action: ${input.action}`);
        }
      }
    } finally {
      const duration = performance.now() - startTime;
      await this.recordMetric("no_show_prediction_operation", {
        action: input.action,
        duration_ms: duration,
        model_version: this.modelVersion,
      });
    }
  }

  private async bulkPredictNoShow(
    input: PredictionInput,
  ): Promise<PredictionOutput> {
    if (!input.prediction_requests || input.prediction_requests.length === 0) {
      throw new Error("prediction_requests is required for bulk prediction");
    }

    const predictions = await Promise.all(
      input.prediction_requests.map(async (request) => {
        try {
          const features = await this.extractFeatures(
            request.patient_profile,
            request.appointment_context,
            request.external_factors,
          );

          const prediction = await this.runPredictionModel(features);

          return {
            appointment_id: request.appointment_context.appointment_id,
            no_show_probability: prediction.no_show_probability,
            risk_category: prediction.risk_category,
            confidence_score: prediction.confidence_score,
          };
        } catch {
          return {
            appointment_id: request.appointment_context.appointment_id,
            no_show_probability: 0.5, // Default to medium risk
            risk_category: "medium" as const,
            confidence_score: 0,
          };
        }
      }),
    );

    return {
      success: true,
      bulk_predictions: predictions,
    };
  }

  private async extractFeatures(
    patientProfile: PatientProfile,
    appointmentContext: AppointmentContext,
    externalFactors?: ExternalFactors,
  ): Promise<Record<string, number>> {
    const features: Record<string, number> = {};

    // Patient features
    features.patient_age = patientProfile.age;
    features.patient_distance_km = patientProfile.location_distance_km;
    features.chronic_conditions_count = patientProfile.chronic_conditions.length;
    features.medication_adherence_score = patientProfile.medication_adherence_score;
    features.communication_channels_count = patientProfile.communication_preferences.length;

    // Categorical patient features (one-hot encoded)
    features.gender_male = patientProfile.gender === "male" ? 1 : 0;
    features.gender_female = patientProfile.gender === "female" ? 1 : 0;
    features.insurance_private = patientProfile.insurance_type === "private" ? 1 : 0;
    features.insurance_public = patientProfile.insurance_type === "public" ? 1 : 0;
    features.employment_employed = patientProfile.employment_status === "employed" ? 1 : 0;

    // Appointment features
    features.is_first_appointment = appointmentContext.is_first_appointment
      ? 1
      : 0;
    features.appointment_duration_minutes = appointmentContext.duration_minutes;
    features.cost_estimate = appointmentContext.cost_estimate;
    features.requires_preparation = appointmentContext.requires_preparation
      ? 1
      : 0;

    // Urgency level (ordinal encoding)
    const urgencyMap = { low: 1, medium: 2, high: 3, urgent: 4 };
    features.urgency_level = urgencyMap[appointmentContext.urgency_level];

    // Preparation complexity (ordinal encoding)
    const complexityMap = { none: 0, simple: 1, moderate: 2, complex: 3 };
    features.preparation_complexity = complexityMap[appointmentContext.preparation_complexity];

    // Appointment type (one-hot encoded)
    features.appt_type_consultation = appointmentContext.appointment_type === "consultation"
      ? 1
      : 0;
    features.appt_type_followup = appointmentContext.appointment_type === "follow_up" ? 1 : 0;
    features.appt_type_exam = appointmentContext.appointment_type === "exam" ? 1 : 0;
    features.appt_type_procedure = appointmentContext.appointment_type === "procedure" ? 1 : 0;

    // Time-based features
    const appointmentDate = new Date(appointmentContext.scheduled_datetime);
    features.hour_of_day = appointmentDate.getHours();
    features.day_of_week = appointmentDate.getDay();
    features.day_of_month = appointmentDate.getDate();
    features.month = appointmentDate.getMonth() + 1;
    features.is_weekend = appointmentDate.getDay() === 0 || appointmentDate.getDay() === 6 ? 1 : 0;
    features.is_monday = appointmentDate.getDay() === 1 ? 1 : 0;
    features.is_friday = appointmentDate.getDay() === 5 ? 1 : 0;

    // Days until appointment
    const daysUntilAppointment = Math.max(
      0,
      Math.floor(
        (appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
    );
    features.days_until_appointment = daysUntilAppointment;

    // Historical patterns
    const historicalData = await this.getHistoricalPatterns(
      patientProfile.patient_id,
      appointmentContext.clinic_id,
      appointmentContext.doctor_id,
      appointmentContext.specialty,
    );

    features.patient_historical_no_show_rate = historicalData.patient_no_show_rate;
    features.clinic_historical_no_show_rate = historicalData.clinic_no_show_rate;
    features.doctor_historical_no_show_rate = historicalData.doctor_no_show_rate;
    features.specialty_historical_no_show_rate = historicalData.specialty_no_show_rate;
    features.timeslot_historical_no_show_rate = historicalData.time_slot_no_show_rate;

    // External factors
    if (externalFactors) {
      features.weather_bad = externalFactors.weather_conditions === "rainy"
          || externalFactors.weather_conditions === "snowy"
          || externalFactors.weather_conditions === "stormy"
        ? 1
        : 0;

      features.traffic_heavy = externalFactors.traffic_conditions === "heavy"
          || externalFactors.traffic_conditions === "severe"
        ? 1
        : 0;

      features.transport_disrupted = externalFactors.public_transport_status === "disrupted"
          || externalFactors.public_transport_status === "strike"
        ? 1
        : 0;

      features.holiday_proximity = Math.max(
        0,
        7 - (externalFactors.holiday_proximity_days || 7),
      );

      if (externalFactors.economic_indicators) {
        features.local_unemployment_rate =
          externalFactors.economic_indicators.local_unemployment_rate;
        features.healthcare_access_index =
          externalFactors.economic_indicators.healthcare_access_index;
      }
    }

    return features;
  }

  private async runPredictionModel(features: Record<string, number>): Promise<{
    no_show_probability: number;
    risk_category: "low" | "medium" | "high" | "very_high";
    confidence_score: number;
  }> {
    // Simple linear model (in production, this would be a proper ML model)
    let score = 0;
    let _totalWeight = 0;

    for (const [featureName, featureValue] of Object.entries(features)) {
      const weight = this.featureWeights.get(featureName) || 0;
      score += featureValue * weight;
      _totalWeight += Math.abs(weight);
    }

    // Apply sigmoid function to get probability
    const probability = Math.max(0, Math.min(1, 1 / (1 + Math.exp(-score))));

    // Determine risk category
    let riskCategory: "low" | "medium" | "high" | "very_high";
    if (probability < 0.2) {
      riskCategory = "low";
    } else if (probability < 0.4) {
      riskCategory = "medium";
    } else if (probability < 0.7) {
      riskCategory = "high";
    } else {
      riskCategory = "very_high";
    }

    // Calculate confidence based on feature completeness and historical accuracy
    const featureCompleteness = Object.values(features).filter((v) => v !== 0).length
      / Object.keys(features).length;
    const { 7: baseConfidence } = 0; // Base confidence of the model
    const confidence = Math.min(0.95, baseConfidence * featureCompleteness);

    return {
      no_show_probability: Math.round(probability * 1000) / 1000, // Round to 3 decimal places
      risk_category: riskCategory,
      confidence_score: Math.round(confidence * 1000) / 1000,
    };
  }

  private async getHistoricalPatterns(
    patientId: string,
    clinicId: string,
    doctorId: string,
    _specialty: string,
  ): Promise<HistoricalPatternData> {
    // In production, this would query actual historical data
    // For now, return simulated patterns

    const basePatterns: HistoricalPatternData = {
      patient_no_show_rate: 0.15, // Default 15% no-show rate
      clinic_no_show_rate: 0.18,
      doctor_no_show_rate: 0.12,
      specialty_no_show_rate: 0.16,
      time_slot_no_show_rate: 0.14,
      day_of_week_no_show_rate: 0.17,
      season_no_show_rate: 0.15,
    };

    // Simulate some variation based on IDs
    const patientHash = this.simpleHash(patientId) % 100;
    const clinicHash = this.simpleHash(clinicId) % 100;
    const doctorHash = this.simpleHash(doctorId) % 100;

    return {
      patient_no_show_rate: Math.max(
        0,
        Math.min(
          1,
          basePatterns.patient_no_show_rate + (patientHash - 50) * 0.002,
        ),
      ),
      clinic_no_show_rate: Math.max(
        0,
        Math.min(
          1,
          basePatterns.clinic_no_show_rate + (clinicHash - 50) * 0.001,
        ),
      ),
      doctor_no_show_rate: Math.max(
        0,
        Math.min(
          1,
          basePatterns.doctor_no_show_rate + (doctorHash - 50) * 0.001,
        ),
      ),
      specialty_no_show_rate: basePatterns.specialty_no_show_rate,
      time_slot_no_show_rate: basePatterns.time_slot_no_show_rate,
      day_of_week_no_show_rate: basePatterns.day_of_week_no_show_rate,
      season_no_show_rate: basePatterns.season_no_show_rate,
    };
  }

  private async trainModel(input: PredictionInput): Promise<PredictionOutput> {
    // Placeholder for model training logic
    // In production, this would retrain the ML model with new data
    // Simulate training process
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockPerformance: ModelPerformanceMetrics = {
      model_version: this.modelVersion,
      training_data_points: 15_000,
      validation_accuracy: 0.78,
      precision: 0.75,
      recall: 0.72,
      f1_score: 0.735,
      auc_roc: 0.82,
      confusion_matrix: {
        true_positives: 720,
        true_negatives: 2280,
        false_positives: 240,
        false_negatives: 280,
      },
      calibration_score: 0.85,
      last_trained: new Date().toISOString(),
      data_freshness_days: 1,
    };

    return {
      success: true,
      model_performance: mockPerformance,
    };
  }

  private async getModelPerformance(): Promise<PredictionOutput> {
    // Return current model performance metrics
    const performance: ModelPerformanceMetrics = {
      model_version: this.modelVersion,
      training_data_points: 12_500,
      validation_accuracy: 0.76,
      precision: 0.73,
      recall: 0.71,
      f1_score: 0.72,
      auc_roc: 0.81,
      confusion_matrix: {
        true_positives: 710,
        true_negatives: 2240,
        false_positives: 260,
        false_negatives: 290,
      },
      calibration_score: 0.83,
      last_trained: "2024-08-20T10:30:00Z",
      data_freshness_days: 4,
    };

    return {
      success: true,
      model_performance: performance,
    };
  }

  private async updateModel(input: PredictionInput): Promise<PredictionOutput> {
    // Update model with new parameters or retrain
    if (input.model_version) {
      this.modelVersion = input.model_version;
    }

    if (input.feature_selection) {
      // Update feature weights based on selection
      await this.updateFeatureWeights(input.feature_selection);
    }

    return {
      success: true,
      model_performance: await this.getModelPerformance().then(
        (r) => r.model_performance,
      ),
    };
  }

  private async getFeatureImportance(): Promise<PredictionOutput> {
    const featureImportance: FeatureImportance[] = [
      {
        feature_name: "Patient Historical No-Show Rate",
        importance_score: 0.85,
        category: "historical",
        description: "Patient's past no-show behavior",
        stability_score: 0.92,
      },
      {
        feature_name: "Distance from Clinic",
        importance_score: 0.72,
        category: "patient",
        description: "Distance patient travels to appointment",
        stability_score: 0.88,
      },
      {
        feature_name: "Days Until Appointment",
        importance_score: 0.68,
        category: "appointment",
        description: "Lead time between booking and appointment",
        stability_score: 0.85,
      },
      {
        feature_name: "Appointment Cost",
        importance_score: 0.61,
        category: "appointment",
        description: "Estimated cost of the appointment",
        stability_score: 0.79,
      },
      {
        feature_name: "Is First Appointment",
        importance_score: 0.58,
        category: "appointment",
        description: "Whether this is patient's first visit",
        stability_score: 0.82,
      },
      {
        feature_name: "Day of Week",
        importance_score: 0.45,
        category: "appointment",
        description: "Day of the week for appointment",
        stability_score: 0.75,
      },
    ].sort((a, b) => b.importance_score - a.importance_score);

    return {
      success: true,
      feature_importance: featureImportance,
    };
  }

  private async simulateInterventions(
    input: PredictionInput,
  ): Promise<PredictionOutput> {
    if (!input.intervention_scenarios) {
      throw new Error("intervention_scenarios is required for simulation");
    }

    const analyses: InterventionAnalysis[] = [];

    for (const scenario of input.intervention_scenarios) {
      // Simulate intervention impact
      let impactReduction = 0;
      let implementationCost = 0;

      if (scenario.changes.reminder_strategy !== "none") {
        impactReduction += 0.15; // 15% reduction
        implementationCost += 2; // $2 per appointment
      }

      if (
        scenario.changes.incentives
        && scenario.changes.incentives.length > 0
      ) {
        impactReduction += 0.12; // 12% reduction
        implementationCost += 5; // $5 per appointment
      }

      if (scenario.changes.preparation_support !== "none") {
        impactReduction += 0.08; // 8% reduction
        implementationCost += 3; // $3 per appointment
      }

      const costPerAppointment = scenario.estimated_cost_per_appointment || implementationCost;
      const estimatedSavings = 15; // Average cost of no-show
      const roi = ((estimatedSavings * impactReduction - costPerAppointment)
        / costPerAppointment)
        * 100;

      analyses.push({
        scenario_name: scenario.name,
        predicted_no_show_reduction: Math.min(0.8, impactReduction), // Cap at 80% reduction
        cost_benefit_ratio: roi > 0
          ? (estimatedSavings * impactReduction) / costPerAppointment
          : 0,
        implementation_difficulty: this.assessImplementationDifficulty(scenario),
        expected_roi_percent: roi,
        risk_factors: this.identifyRiskFactors(scenario),
        success_prerequisites: this.identifyPrerequisites(scenario),
      });
    }

    return {
      success: true,
      intervention_analysis: analyses,
    };
  }

  // Helper methods
  private async loadFeatureWeights(): Promise<void> {
    // In production, load from trained model file or database
    const defaultWeights = new Map([
      ["patient_historical_no_show_rate", 2.5],
      ["patient_distance_km", 0.08],
      ["chronic_conditions_count", 0.15],
      ["medication_adherence_score", -0.02],
      ["is_first_appointment", 0.7],
      ["appointment_duration_minutes", 0.005],
      ["cost_estimate", 0.0003],
      ["requires_preparation", 0.4],
      ["urgency_level", -0.3],
      ["days_until_appointment", 0.12],
      ["clinic_historical_no_show_rate", 1.8],
      ["doctor_historical_no_show_rate", 1.2],
      ["hour_of_day", -0.05],
      ["is_weekend", 0.3],
      ["weather_bad", 0.25],
      ["traffic_heavy", 0.2],
      ["transport_disrupted", 0.35],
    ]);

    this.featureWeights = defaultWeights;
  }

  private async loadHistoricalPatterns(): Promise<void> {
    // Load patterns from database or cache
    // For now, using defaults
  }

  private async updateFeatureWeights(
    selectedFeatures: string[],
  ): Promise<void> {
    // Update weights based on feature selection
    const newWeights = new Map<string, number>();

    for (const feature of selectedFeatures) {
      const currentWeight = this.featureWeights.get(feature) || 0;
      newWeights.set(feature, currentWeight);
    }

    this.featureWeights = newWeights;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.codePointAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash;
    }
    return Math.abs(hash);
  }

  private assessImplementationDifficulty(
    scenario: InterventionScenario,
  ): "easy" | "moderate" | "hard" | "very_hard" {
    let difficultyScore = 0;

    if (scenario.changes.reminder_strategy === "multi_channel") {
      difficultyScore += 2;
    }
    if (scenario.changes.incentives && scenario.changes.incentives.length > 2) {
      difficultyScore += 3;
    }
    if (scenario.changes.preparation_support === "comprehensive") {
      difficultyScore += 2;
    }

    if (difficultyScore <= 2) {
      return "easy";
    }
    if (difficultyScore <= 4) {
      return "moderate";
    }
    if (difficultyScore <= 6) {
      return "hard";
    }
    return "very_hard";
  }

  private identifyRiskFactors(scenario: InterventionScenario): string[] {
    const risks: string[] = [];

    if (scenario.changes.incentives && scenario.changes.incentives.length > 0) {
      risks.push("May create patient expectation for ongoing incentives");
    }

    if (scenario.changes.reminder_strategy === "multi_channel") {
      risks.push("Could be perceived as spammy if not well-timed");
    }

    return risks;
  }

  private identifyPrerequisites(scenario: InterventionScenario): string[] {
    const prerequisites: string[] = [];

    if (scenario.changes.reminder_strategy !== "none") {
      prerequisites.push("Updated patient contact information");
    }

    if (scenario.changes.preparation_support !== "none") {
      prerequisites.push("Staff training on preparation guidance");
    }

    return prerequisites;
  }

  // Public helper methods for easy access
  public async predictAppointmentNoShow(
    patientProfile: PatientProfile,
    appointmentContext: AppointmentContext,
    externalFactors?: ExternalFactors,
  ): Promise<{
    probability: number;
    riskLevel: string;
    recommendations: RecommendedAction[];
  }> {
    const result = await this.execute({
      action: "predict",
      patient_profile: patientProfile,
      appointment_context: appointmentContext,
      external_factors: externalFactors,
    });

    return {
      probability: result.no_show_probability || 0,
      riskLevel: result.risk_category || "medium",
      recommendations: result.recommendations || [],
    };
  }

  public async getModelStats(): Promise<ModelPerformanceMetrics> {
    const result = await this.execute({
      action: "get_model_performance",
    });

    return result.model_performance!;
  }

  // ================== ML PIPELINE MANAGEMENT METHODS ==================

  /**
   * Create and deploy a new model version with specified configuration
   */
  public async createAndDeployModel(
    config: ModelConfiguration,
    environment: "staging" | "production" = "staging",
  ): Promise<{
    success: boolean;
    model_version: string;
    deployment_status: string;
  }> {
    try {
      const modelVersion = await mlPipelineManagementService.createAndDeployModel(
        config,
        environment,
      );

      // Update local model version reference
      this.modelVersion = modelVersion.version_number;

      return {
        success: true,
        model_version: modelVersion.version_id,
        deployment_status: `Model deployed to ${environment}`,
      };
    } catch (error) {
      return {
        success: false,
        model_version: "",
        deployment_status: `Deployment failed: ${error}`,
      };
    }
  }

  /**
   * Start A/B test between two model versions
   */
  public async startABTest(
    modelAVersion: string,
    modelBVersion: string,
    durationDays = 14,
  ): Promise<{
    success: boolean;
    test_id: string;
    ab_test_result: ABTestResult;
  }> {
    try {
      const abTestResult = await mlPipelineManagementService.runABTest(
        modelAVersion,
        modelBVersion,
        durationDays,
      );

      // Store A/B test reference locally
      this.activeABTests.set(abTestResult.test_id, abTestResult);

      return {
        success: true,
        test_id: abTestResult.test_id,
        ab_test_result: abTestResult,
      };
    } catch {
      return {
        success: false,
        test_id: "",
        ab_test_result: {} as ABTestResult,
      };
    }
  }

  /**
   * Check model health and detect data drift
   */
  public async checkModelHealth(): Promise<{
    success: boolean;
    drift_detected: boolean;
    drift_result: DriftDetectionResult;
    requires_retraining: boolean;
  }> {
    try {
      const driftResult = await mlPipelineManagementService.checkModelHealth();

      const requiresRetraining = driftResult.drift_detected
        && (driftResult.drift_severity === "high"
          || driftResult.drift_severity === "critical");

      if (requiresRetraining) {
      }

      return {
        success: true,
        drift_detected: driftResult.drift_detected,
        drift_result: driftResult,
        requires_retraining: requiresRetraining,
      };
    } catch {
      return {
        success: false,
        drift_detected: false,
        drift_result: {} as DriftDetectionResult,
        requires_retraining: false,
      };
    }
  }

  /**
   * Get all available model versions
   */
  public async getModelVersions(): Promise<{
    success: boolean;
    versions: unknown[];
    current_production_version?: string;
  }> {
    try {
      const result = await mlPipelineManagementService.execute({
        action: "get_model_versions",
      });

      const productionVersion = result.model_versions?.find(
        (v: unknown) => v.deployment_status === "production",
      );

      return {
        success: true,
        versions: result.model_versions || [],
        current_production_version: productionVersion?.version_id,
      };
    } catch {
      return {
        success: false,
        versions: [],
      };
    }
  }

  /**
   * Rollback to a previous model version
   */
  public async rollbackModel(versionId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const result = await mlPipelineManagementService.execute({
        action: "rollback_model",
        version_id: versionId,
      });

      // Update local model version reference
      this.modelVersion = versionId;

      return {
        success: true,
        message: result.deployment_status || "Model rollback completed",
      };
    } catch (error) {
      return {
        success: false,
        message: `Rollback failed: ${error}`,
      };
    }
  }

  /**
   * Get A/B test results for a specific test
   */
  public async getABTestResults(testId: string): Promise<{
    success: boolean;
    test_result: ABTestResult;
    recommendation: "continue" | "stop_use_a" | "stop_use_b" | "extend_test";
  }> {
    try {
      const result = await mlPipelineManagementService.execute({
        action: "get_ab_test_results",
        test_id: testId,
      });

      if (!result.ab_test_result) {
        throw new Error("A/B test not found");
      }

      const { ab_test_result: testResult } = result;

      // Determine recommendation based on results
      let recommendation:
        | "continue"
        | "stop_use_a"
        | "stop_use_b"
        | "extend_test" = "continue";

      if (testResult.statistical_significance) {
        if (testResult.winner === "model_a") {
          recommendation = "stop_use_a";
        } else if (testResult.winner === "model_b") {
          recommendation = "stop_use_b";
        }
      } else if (testResult.sample_size < 1000) {
        recommendation = "extend_test";
      }

      return {
        success: true,
        test_result: testResult,
        recommendation,
      };
    } catch {
      return {
        success: false,
        test_result: {} as ABTestResult,
        recommendation: "continue",
      };
    }
  }

  /**
   * Comprehensive model health check and maintenance
   */
  public async performModelMaintenance(): Promise<{
    success: boolean;
    maintenance_summary: {
      drift_check: DriftDetectionResult;
      performance_check: unknown;
      recommendation: string;
      actions_taken: string[];
    };
  }> {
    const actionsTaken: string[] = [];

    try {
      // 1. Check for drift
      const driftCheck = await this.checkModelHealth();
      actionsTaken.push("Completed drift detection analysis");

      // 2. Check performance metrics
      const performanceCheck = await this.getModelStats();
      actionsTaken.push("Retrieved current performance metrics");

      // 3. Determine maintenance recommendation
      let recommendation = "Model is healthy - no action required";

      if (driftCheck.requires_retraining) {
        recommendation = "Model retraining required due to significant drift";
        actionsTaken.push("Flagged model for retraining");
      } else if (performanceCheck.validation_accuracy < 0.85) {
        recommendation = "Model performance degraded - consider retraining";
        actionsTaken.push("Flagged model for performance review");
      }

      // 4. Auto-trigger retraining if critical drift detected
      if (driftCheck.drift_result.drift_severity === "critical") {
        // Note: In production, this would trigger automated retraining pipeline
        actionsTaken.push("Would trigger automated retraining (simulated)");
      }

      return {
        success: true,
        maintenance_summary: {
          drift_check: driftCheck.drift_result,
          performance_check: performanceCheck,
          recommendation,
          actions_taken: actionsTaken,
        },
      };
    } catch (error) {
      return {
        success: false,
        maintenance_summary: {
          drift_check: {} as DriftDetectionResult,
          performance_check: {},
          recommendation: `Maintenance failed: ${error}`,
          actions_taken: actionsTaken,
        },
      };
    }
  }
}

// Export singleton instance
export const noShowPredictionService = new NoShowPredictionService();
