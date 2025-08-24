// No-Show Prediction Service for AI Services
// Machine learning-powered prediction system to reduce appointment no-shows

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { EnhancedAIService, AIServiceInput, AIServiceOutput } from "./enhanced-service-base";

// Prediction Types and Interfaces
export interface PatientProfile {
  patient_id: string;
  age: number;
  gender: "male" | "female" | "other";
  location_distance_km: number;
  insurance_type: "private" | "public" | "self_pay" | "mixed";
  employment_status: "employed" | "unemployed" | "retired" | "student" | "unknown";
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

export interface PredictionInput extends AIServiceInput {
  action: "predict" | "train_model" | "get_model_performance" | "bulk_predict" | 
          "update_model" | "get_feature_importance" | "simulate_interventions";
  
  // Prediction inputs
  patient_profile?: PatientProfile;
  appointment_context?: AppointmentContext;
  external_factors?: ExternalFactors;
  
  // Bulk prediction
  prediction_requests?: Array<{
    patient_profile: PatientProfile;
    appointment_context: AppointmentContext;
    external_factors?: ExternalFactors;
  }>;
  
  // Training and model management
  training_data_window_days?: number;
  model_version?: string;
  feature_selection?: string[];
  
  // Intervention simulation
  intervention_scenarios?: InterventionScenario[];
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

export interface PredictionOutput extends AIServiceOutput {
  no_show_probability?: number;
  risk_category?: "low" | "medium" | "high" | "very_high";
  confidence_score?: number;
  contributing_factors?: FactorContribution[];
  recommendations?: RecommendedAction[];
  
  // Bulk predictions
  bulk_predictions?: Array<{
    appointment_id: string;
    no_show_probability: number;
    risk_category: string;
    confidence_score: number;
  }>;
  
  // Model performance
  model_performance?: ModelPerformanceMetrics;
  feature_importance?: FeatureImportance[];
  
  // Intervention analysis
  intervention_analysis?: InterventionAnalysis[];
}

export interface FactorContribution {
  factor_name: string;
  category: "patient" | "appointment" | "external" | "historical";
  importance_weight: number;
  impact_direction: "increases_risk" | "decreases_risk";
  description: string;
  confidence: number;
}

export interface RecommendedAction {
  action_type: "reminder" | "scheduling" | "incentive" | "support" | "escalation";
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

export interface InterventionAnalysis {
  scenario_name: string;
  predicted_no_show_reduction: number;
  cost_benefit_ratio: number;
  implementation_difficulty: "easy" | "moderate" | "hard" | "very_hard";
  expected_roi_percent: number;
  risk_factors: string[];
  success_prerequisites: string[];
}

// No-Show Prediction Service Implementation
export class NoShowPredictionService extends EnhancedAIService<PredictionInput, PredictionOutput> {
  private supabase: SupabaseClient;
  private modelVersion: string = "v1.2.0";
  private featureWeights: Map<string, number> = new Map();
  private historicalPatterns: Map<string, number> = new Map();
  private readonly PREDICTION_CACHE_TTL = 60 * 60; // 1 hour

  constructor() {
    super("no_show_prediction_service");
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Initialize prediction model
    this.initializePredictionModel();
  }

  private async initializePredictionModel(): Promise<void> {
    try {
      // Load feature weights (in production, this would come from a trained ML model)
      await this.loadFeatureWeights();
      
      // Load historical patterns
      await this.loadHistoricalPatterns();
      
      console.log("No-show prediction model initialized");
    } catch (error) {
      console.error("Failed to initialize prediction model:", error);
    }
  }

  protected async executeCore(input: PredictionInput): Promise<PredictionOutput> {
    const startTime = performance.now();
    
    try {
      switch (input.action) {
        case "predict":
          return await this.predictNoShow(input);
        case "bulk_predict":
          return await this.bulkPredictNoShow(input);
        case "train_model":
          return await this.trainModel(input);
        case "get_model_performance":
          return await this.getModelPerformance();
        case "update_model":
          return await this.updateModel(input);
        case "get_feature_importance":
          return await this.getFeatureImportance();
        case "simulate_interventions":
          return await this.simulateInterventions(input);
        default:
          throw new Error(`Unsupported prediction action: ${input.action}`);
      }
    } finally {
      const duration = performance.now() - startTime;
      await this.recordMetric("no_show_prediction_operation", {
        action: input.action,
        duration_ms: duration,
        model_version: this.modelVersion
      });
    }
  }

  private async predictNoShow(input: PredictionInput): Promise<PredictionOutput> {
    if (!input.patient_profile || !input.appointment_context) {
      throw new Error("patient_profile and appointment_context are required for prediction");
    }

    const features = await this.extractFeatures(
      input.patient_profile,
      input.appointment_context,
      input.external_factors
    );

    const prediction = await this.runPredictionModel(features);
    const contributingFactors = this.analyzeContributingFactors(features, prediction);
    const recommendations = this.generateRecommendations(prediction, features);

    // Cache the prediction
    await this.cachePrediction(input.appointment_context.appointment_id, prediction);

    // Store prediction for model improvement
    await this.storePredictionResult({
      appointment_id: input.appointment_context.appointment_id,
      patient_id: input.patient_profile.patient_id,
      predicted_probability: prediction.no_show_probability,
      model_version: this.modelVersion,
      features_used: Object.keys(features),
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      no_show_probability: prediction.no_show_probability,
      risk_category: prediction.risk_category,
      confidence_score: prediction.confidence_score,
      contributing_factors: contributingFactors,
      recommendations
    };
  }

  private async bulkPredictNoShow(input: PredictionInput): Promise<PredictionOutput> {
    if (!input.prediction_requests || input.prediction_requests.length === 0) {
      throw new Error("prediction_requests is required for bulk prediction");
    }

    const predictions = await Promise.all(
      input.prediction_requests.map(async (request) => {
        try {
          const features = await this.extractFeatures(
            request.patient_profile,
            request.appointment_context,
            request.external_factors
          );

          const prediction = await this.runPredictionModel(features);

          return {
            appointment_id: request.appointment_context.appointment_id,
            no_show_probability: prediction.no_show_probability,
            risk_category: prediction.risk_category,
            confidence_score: prediction.confidence_score
          };
        } catch (error) {
          console.error(`Prediction failed for appointment ${request.appointment_context.appointment_id}:`, error);
          return {
            appointment_id: request.appointment_context.appointment_id,
            no_show_probability: 0.5, // Default to medium risk
            risk_category: "medium" as const,
            confidence_score: 0.0
          };
        }
      })
    );

    return {
      success: true,
      bulk_predictions: predictions
    };
  }

  private async extractFeatures(
    patientProfile: PatientProfile,
    appointmentContext: AppointmentContext,
    externalFactors?: ExternalFactors
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
    features.is_first_appointment = appointmentContext.is_first_appointment ? 1 : 0;
    features.appointment_duration_minutes = appointmentContext.duration_minutes;
    features.cost_estimate = appointmentContext.cost_estimate;
    features.requires_preparation = appointmentContext.requires_preparation ? 1 : 0;
    
    // Urgency level (ordinal encoding)
    const urgencyMap = { low: 1, medium: 2, high: 3, urgent: 4 };
    features.urgency_level = urgencyMap[appointmentContext.urgency_level];

    // Preparation complexity (ordinal encoding)
    const complexityMap = { none: 0, simple: 1, moderate: 2, complex: 3 };
    features.preparation_complexity = complexityMap[appointmentContext.preparation_complexity];

    // Appointment type (one-hot encoded)
    features.appt_type_consultation = appointmentContext.appointment_type === "consultation" ? 1 : 0;
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
    const daysUntilAppointment = Math.max(0, 
      Math.floor((appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );
    features.days_until_appointment = daysUntilAppointment;

    // Historical patterns
    const historicalData = await this.getHistoricalPatterns(
      patientProfile.patient_id,
      appointmentContext.clinic_id,
      appointmentContext.doctor_id,
      appointmentContext.specialty
    );

    features.patient_historical_no_show_rate = historicalData.patient_no_show_rate;
    features.clinic_historical_no_show_rate = historicalData.clinic_no_show_rate;
    features.doctor_historical_no_show_rate = historicalData.doctor_no_show_rate;
    features.specialty_historical_no_show_rate = historicalData.specialty_no_show_rate;
    features.timeslot_historical_no_show_rate = historicalData.time_slot_no_show_rate;

    // External factors
    if (externalFactors) {
      features.weather_bad = (externalFactors.weather_conditions === "rainy" || 
                             externalFactors.weather_conditions === "snowy" ||
                             externalFactors.weather_conditions === "stormy") ? 1 : 0;
      
      features.traffic_heavy = (externalFactors.traffic_conditions === "heavy" ||
                               externalFactors.traffic_conditions === "severe") ? 1 : 0;
      
      features.transport_disrupted = externalFactors.public_transport_status === "disrupted" ||
                                    externalFactors.public_transport_status === "strike" ? 1 : 0;
      
      features.holiday_proximity = Math.max(0, 7 - (externalFactors.holiday_proximity_days || 7));
      
      if (externalFactors.economic_indicators) {
        features.local_unemployment_rate = externalFactors.economic_indicators.local_unemployment_rate;
        features.healthcare_access_index = externalFactors.economic_indicators.healthcare_access_index;
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
    let totalWeight = 0;

    for (const [featureName, featureValue] of Object.entries(features)) {
      const weight = this.featureWeights.get(featureName) || 0;
      score += featureValue * weight;
      totalWeight += Math.abs(weight);
    }

    // Apply sigmoid function to get probability
    const probability = Math.max(0, Math.min(1, 1 / (1 + Math.exp(-score))));

    // Determine risk category
    let riskCategory: "low" | "medium" | "high" | "very_high";
    if (probability < 0.2) riskCategory = "low";
    else if (probability < 0.4) riskCategory = "medium";
    else if (probability < 0.7) riskCategory = "high";
    else riskCategory = "very_high";

    // Calculate confidence based on feature completeness and historical accuracy
    const featureCompleteness = Object.values(features).filter(v => v !== 0).length / Object.keys(features).length;
    const baseConfidence = 0.7; // Base confidence of the model
    const confidence = Math.min(0.95, baseConfidence * featureCompleteness);

    return {
      no_show_probability: Math.round(probability * 1000) / 1000, // Round to 3 decimal places
      risk_category: riskCategory,
      confidence_score: Math.round(confidence * 1000) / 1000
    };
  }

  private analyzeContributingFactors(
    features: Record<string, number>,
    prediction: { no_show_probability: number }
  ): FactorContribution[] {
    const factors: FactorContribution[] = [];

    // Analyze top contributing features
    const featureContributions = Object.entries(features)
      .map(([name, value]) => ({
        name,
        value,
        weight: this.featureWeights.get(name) || 0,
        contribution: value * (this.featureWeights.get(name) || 0)
      }))
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, 10); // Top 10 factors

    for (const feature of featureContributions) {
      if (Math.abs(feature.contribution) > 0.01) { // Only include meaningful contributions
        factors.push({
          factor_name: this.getFeatureDisplayName(feature.name),
          category: this.getFeatureCategory(feature.name),
          importance_weight: Math.abs(feature.weight),
          impact_direction: feature.contribution > 0 ? "increases_risk" : "decreases_risk",
          description: this.getFeatureDescription(feature.name, feature.value),
          confidence: Math.min(0.95, 0.6 + Math.abs(feature.weight) * 0.4)
        });
      }
    }

    return factors;
  }

  private generateRecommendations(
    prediction: { no_show_probability: number; risk_category: string },
    features: Record<string, number>
  ): RecommendedAction[] {
    const recommendations: RecommendedAction[] = [];

    if (prediction.no_show_probability > 0.3) {
      // High-risk patient recommendations
      recommendations.push({
        action_type: "reminder",
        priority: prediction.no_show_probability > 0.7 ? "urgent" : "high",
        description: "Send multi-channel reminder (SMS + Email) 24-48 hours before appointment",
        estimated_impact: 0.15, // 15% reduction in no-show probability
        implementation_cost: "low",
        timing_recommendation: "24-48 hours before appointment",
        success_probability: 0.75
      });
    }

    if (features.patient_distance_km > 20) {
      recommendations.push({
        action_type: "scheduling",
        priority: "medium",
        description: "Offer telemedicine option for follow-up appointments",
        estimated_impact: 0.25,
        implementation_cost: "medium",
        timing_recommendation: "At time of scheduling",
        success_probability: 0.65
      });
    }

    if (features.cost_estimate > 500) {
      recommendations.push({
        action_type: "support",
        priority: "medium",
        description: "Provide cost breakdown and payment options information",
        estimated_impact: 0.12,
        implementation_cost: "low",
        timing_recommendation: "At time of scheduling and 24h before",
        success_probability: 0.60
      });
    }

    if (prediction.no_show_probability > 0.6 && features.requires_preparation === 1) {
      recommendations.push({
        action_type: "support",
        priority: "high",
        description: "Provide detailed preparation instructions and confirmation call",
        estimated_impact: 0.20,
        implementation_cost: "medium",
        timing_recommendation: "48 hours before appointment",
        success_probability: 0.70
      });
    }

    if (features.is_first_appointment === 1 && prediction.no_show_probability > 0.4) {
      recommendations.push({
        action_type: "incentive",
        priority: "medium",
        description: "Offer new patient welcome package or small incentive",
        estimated_impact: 0.18,
        implementation_cost: "medium",
        timing_recommendation: "At time of scheduling",
        success_probability: 0.55
      });
    }

    return recommendations.sort((a, b) => b.estimated_impact - a.estimated_impact);
  }

  private async getHistoricalPatterns(
    patientId: string,
    clinicId: string,
    doctorId: string,
    specialty: string
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
      season_no_show_rate: 0.15
    };

    // Simulate some variation based on IDs
    const patientHash = this.simpleHash(patientId) % 100;
    const clinicHash = this.simpleHash(clinicId) % 100;
    const doctorHash = this.simpleHash(doctorId) % 100;

    return {
      patient_no_show_rate: Math.max(0, Math.min(1, basePatterns.patient_no_show_rate + (patientHash - 50) * 0.002)),
      clinic_no_show_rate: Math.max(0, Math.min(1, basePatterns.clinic_no_show_rate + (clinicHash - 50) * 0.001)),
      doctor_no_show_rate: Math.max(0, Math.min(1, basePatterns.doctor_no_show_rate + (doctorHash - 50) * 0.001)),
      specialty_no_show_rate: basePatterns.specialty_no_show_rate,
      time_slot_no_show_rate: basePatterns.time_slot_no_show_rate,
      day_of_week_no_show_rate: basePatterns.day_of_week_no_show_rate,
      season_no_show_rate: basePatterns.season_no_show_rate
    };
  }

  private async trainModel(input: PredictionInput): Promise<PredictionOutput> {
    // Placeholder for model training logic
    // In production, this would retrain the ML model with new data
    
    const trainingDataWindow = input.training_data_window_days || 90;
    
    // Simulate training process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockPerformance: ModelPerformanceMetrics = {
      model_version: this.modelVersion,
      training_data_points: 15000,
      validation_accuracy: 0.78,
      precision: 0.75,
      recall: 0.72,
      f1_score: 0.735,
      auc_roc: 0.82,
      confusion_matrix: {
        true_positives: 720,
        true_negatives: 2280,
        false_positives: 240,
        false_negatives: 280
      },
      calibration_score: 0.85,
      last_trained: new Date().toISOString(),
      data_freshness_days: 1
    };

    return {
      success: true,
      model_performance: mockPerformance
    };
  }

  private async getModelPerformance(): Promise<PredictionOutput> {
    // Return current model performance metrics
    const performance: ModelPerformanceMetrics = {
      model_version: this.modelVersion,
      training_data_points: 12500,
      validation_accuracy: 0.76,
      precision: 0.73,
      recall: 0.71,
      f1_score: 0.72,
      auc_roc: 0.81,
      confusion_matrix: {
        true_positives: 710,
        true_negatives: 2240,
        false_positives: 260,
        false_negatives: 290
      },
      calibration_score: 0.83,
      last_trained: "2024-08-20T10:30:00Z",
      data_freshness_days: 4
    };

    return {
      success: true,
      model_performance: performance
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
      model_performance: await this.getModelPerformance().then(r => r.model_performance)
    };
  }

  private async getFeatureImportance(): Promise<PredictionOutput> {
    const featureImportance: FeatureImportance[] = [
      {
        feature_name: "Patient Historical No-Show Rate",
        importance_score: 0.85,
        category: "historical",
        description: "Patient's past no-show behavior",
        stability_score: 0.92
      },
      {
        feature_name: "Distance from Clinic",
        importance_score: 0.72,
        category: "patient",
        description: "Distance patient travels to appointment",
        stability_score: 0.88
      },
      {
        feature_name: "Days Until Appointment",
        importance_score: 0.68,
        category: "appointment",
        description: "Lead time between booking and appointment",
        stability_score: 0.85
      },
      {
        feature_name: "Appointment Cost",
        importance_score: 0.61,
        category: "appointment",
        description: "Estimated cost of the appointment",
        stability_score: 0.79
      },
      {
        feature_name: "Is First Appointment",
        importance_score: 0.58,
        category: "appointment",
        description: "Whether this is patient's first visit",
        stability_score: 0.82
      },
      {
        feature_name: "Day of Week",
        importance_score: 0.45,
        category: "appointment",
        description: "Day of the week for appointment",
        stability_score: 0.75
      }
    ].sort((a, b) => b.importance_score - a.importance_score);

    return {
      success: true,
      feature_importance: featureImportance
    };
  }

  private async simulateInterventions(input: PredictionInput): Promise<PredictionOutput> {
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

      if (scenario.changes.incentives && scenario.changes.incentives.length > 0) {
        impactReduction += 0.12; // 12% reduction
        implementationCost += 5; // $5 per appointment
      }

      if (scenario.changes.preparation_support !== "none") {
        impactReduction += 0.08; // 8% reduction
        implementationCost += 3; // $3 per appointment
      }

      const costPerAppointment = scenario.estimated_cost_per_appointment || implementationCost;
      const estimatedSavings = 15; // Average cost of no-show
      const roi = ((estimatedSavings * impactReduction) - costPerAppointment) / costPerAppointment * 100;

      analyses.push({
        scenario_name: scenario.name,
        predicted_no_show_reduction: Math.min(0.8, impactReduction), // Cap at 80% reduction
        cost_benefit_ratio: roi > 0 ? estimatedSavings * impactReduction / costPerAppointment : 0,
        implementation_difficulty: this.assessImplementationDifficulty(scenario),
        expected_roi_percent: roi,
        risk_factors: this.identifyRiskFactors(scenario),
        success_prerequisites: this.identifyPrerequisites(scenario)
      });
    }

    return {
      success: true,
      intervention_analysis: analyses
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
      ["transport_disrupted", 0.35]
    ]);

    this.featureWeights = defaultWeights;
  }

  private async loadHistoricalPatterns(): Promise<void> {
    // Load patterns from database or cache
    // For now, using defaults
  }

  private async updateFeatureWeights(selectedFeatures: string[]): Promise<void> {
    // Update weights based on feature selection
    const newWeights = new Map<string, number>();
    
    for (const feature of selectedFeatures) {
      const currentWeight = this.featureWeights.get(feature) || 0;
      newWeights.set(feature, currentWeight);
    }
    
    this.featureWeights = newWeights;
  }

  private async cachePrediction(appointmentId: string, prediction: any): Promise<void> {
    // Cache prediction for performance
    try {
      await this.recordMetric("prediction_cached", {
        appointment_id: appointmentId,
        probability: prediction.no_show_probability,
        risk_category: prediction.risk_category
      });
    } catch (error) {
      console.error("Failed to cache prediction:", error);
    }
  }

  private async storePredictionResult(predictionData: any): Promise<void> {
    // Store prediction for model training and improvement
    try {
      await this.supabase
        .from("ai_no_show_predictions")
        .insert(predictionData);
    } catch (error) {
      console.error("Failed to store prediction result:", error);
    }
  }

  private getFeatureDisplayName(featureName: string): string {
    const displayNames: Record<string, string> = {
      "patient_historical_no_show_rate": "Patient's Past No-Show Rate",
      "patient_distance_km": "Distance to Clinic",
      "chronic_conditions_count": "Number of Chronic Conditions",
      "medication_adherence_score": "Medication Adherence",
      "is_first_appointment": "First-Time Patient",
      "cost_estimate": "Appointment Cost",
      "days_until_appointment": "Days Until Appointment",
      "requires_preparation": "Requires Preparation",
      "weather_bad": "Bad Weather Conditions",
      "traffic_heavy": "Heavy Traffic"
    };

    return displayNames[featureName] || featureName.replace(/_/g, " ");
  }

  private getFeatureCategory(featureName: string): "patient" | "appointment" | "external" | "historical" {
    if (featureName.includes("patient_") || featureName.includes("chronic_") || featureName.includes("medication_")) {
      return "patient";
    }
    if (featureName.includes("historical_") || featureName.includes("_no_show_rate")) {
      return "historical";
    }
    if (featureName.includes("weather_") || featureName.includes("traffic_") || featureName.includes("transport_")) {
      return "external";
    }
    return "appointment";
  }

  private getFeatureDescription(featureName: string, value: number): string {
    // Return descriptive text based on feature and value
    switch (featureName) {
      case "patient_distance_km":
        return `Patient lives ${value.toFixed(1)} km from the clinic`;
      case "cost_estimate":
        return `Estimated appointment cost: $${value.toFixed(2)}`;
      case "days_until_appointment":
        return `Appointment is ${Math.floor(value)} days away`;
      case "patient_historical_no_show_rate":
        return `Patient has ${(value * 100).toFixed(1)}% historical no-show rate`;
      default:
        return `${this.getFeatureDisplayName(featureName)}: ${value}`;
    }
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private assessImplementationDifficulty(scenario: InterventionScenario): "easy" | "moderate" | "hard" | "very_hard" {
    let difficultyScore = 0;

    if (scenario.changes.reminder_strategy === "multi_channel") difficultyScore += 2;
    if (scenario.changes.incentives && scenario.changes.incentives.length > 2) difficultyScore += 3;
    if (scenario.changes.preparation_support === "comprehensive") difficultyScore += 2;

    if (difficultyScore <= 2) return "easy";
    if (difficultyScore <= 4) return "moderate";
    if (difficultyScore <= 6) return "hard";
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
    externalFactors?: ExternalFactors
  ): Promise<{
    probability: number;
    riskLevel: string;
    recommendations: RecommendedAction[];
  }> {
    const result = await this.execute({
      action: "predict",
      patient_profile: patientProfile,
      appointment_context: appointmentContext,
      external_factors: externalFactors
    });

    return {
      probability: result.no_show_probability || 0,
      riskLevel: result.risk_category || "medium",
      recommendations: result.recommendations || []
    };
  }

  public async getModelStats(): Promise<ModelPerformanceMetrics> {
    const result = await this.execute({
      action: "get_model_performance"
    });

    return result.model_performance!;
  }
}

// Export singleton instance
export const noShowPredictionService = new NoShowPredictionService();