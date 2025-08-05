// Predictive Analytics for Demand Forecasting - TypeScript Types
// ≥85% accuracy requirement for all forecasting models

export interface ForecastingModel {
  id: string;
  model_type: "appointment_demand" | "treatment_demand" | "seasonal" | "resource_utilization";
  model_name: string;
  model_config: Record<string, any>;
  accuracy_score?: number; // 0.0000 to 1.0000 (≥0.8500 required)
  training_data_start_date?: string;
  training_data_end_date?: string;
  last_trained: string;
  last_prediction?: string;
  model_version: string;
  status: "active" | "training" | "deprecated" | "failed";
  metadata: Record<string, any>;
  clinic_id: string;
  created_at: string;
  updated_at: string;
}

export interface DemandPrediction {
  id: string;
  model_id: string;
  prediction_date: string; // Date being predicted for
  forecast_period: "daily" | "weekly" | "monthly" | "quarterly";
  category: "appointments" | "specific_treatment" | "staff_hours" | "equipment_usage";
  subcategory?: string; // Treatment type, equipment type, etc.
  forecast_value: number;
  confidence_interval_lower?: number;
  confidence_interval_upper?: number;
  confidence_score?: number; // 0.0000 to 1.0000
  external_factors: Record<string, any>; // Weather, holidays, marketing campaigns
  prediction_metadata: Record<string, any>;
  clinic_id: string;
  created_at: string;
  updated_at: string;
  // Relations
  model?: ForecastingModel;
}

export interface ForecastAccuracy {
  id: string;
  prediction_id: string;
  model_id: string;
  actual_value: number;
  accuracy_score: number; // 0.0000 to 1.0000
  absolute_error?: number;
  percentage_error?: number;
  evaluation_date: string;
  evaluation_notes?: string;
  clinic_id: string;
  created_at: string;
  // Relations
  prediction?: DemandPrediction;
  model?: ForecastingModel;
}

export interface DemandAlert {
  id: string;
  alert_type: "demand_spike" | "capacity_constraint" | "anomaly_detected" | "low_accuracy";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  prediction_data: Record<string, any>;
  threshold_exceeded?: Record<string, any>;
  recommended_actions: string[];
  alert_date: string;
  notification_sent: boolean;
  notification_sent_at?: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolution_status: "open" | "in_progress" | "resolved" | "dismissed";
  resolution_notes?: string;
  resolved_at?: string;
  clinic_id: string;
  created_at: string;
  updated_at: string;
}

export interface ForecastingSettings {
  id: string;
  clinic_id: string;
  accuracy_threshold: number; // Minimum acceptable accuracy (default: 0.8500)
  retraining_frequency_days: number; // How often to retrain models
  prediction_horizon_days: number; // How far ahead to predict
  alert_thresholds: Record<string, any>; // Thresholds for different alert types
  model_preferences: Record<string, any>; // Preferred models and configurations
  external_data_sources: Record<string, any>; // Weather APIs, holiday calendars
  auto_retrain_enabled: boolean;
  auto_alerts_enabled: boolean;
  settings_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ModelTrainingHistory {
  id: string;
  model_id: string;
  training_start: string;
  training_end?: string;
  training_status: "in_progress" | "completed" | "failed";
  training_accuracy?: number; // Accuracy achieved during training
  validation_accuracy?: number; // Accuracy on validation set
  training_data_size?: number; // Number of data points used
  training_parameters: Record<string, any>; // Hyperparameters used
  training_metrics: Record<string, any>; // Detailed training metrics
  error_message?: string;
  model_artifacts: Record<string, any>; // Links to saved model files
  clinic_id: string;
  created_at: string;
  // Relations
  model?: ForecastingModel;
}

export interface ResourceOptimizationRecommendation {
  id: string;
  recommendation_type: "staff_scheduling" | "equipment_allocation" | "capacity_planning";
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  description: string;
  prediction_basis: Record<string, any>; // Which predictions this is based on
  recommended_changes: Record<string, any>; // Specific recommendations
  estimated_impact: Record<string, any>; // Cost savings, efficiency gains
  implementation_timeline?: string;
  implementation_status: "pending" | "approved" | "implemented" | "rejected";
  cost_benefit_analysis: Record<string, any>;
  implementation_notes?: string;
  created_by?: string;
  approved_by?: string;
  implemented_by?: string;
  clinic_id: string;
  created_at: string;
  updated_at: string;
}

// API Request/Response Types

export interface CreateForecastingModelRequest {
  model_type: ForecastingModel["model_type"];
  model_name: string;
  model_config: Record<string, any>;
  training_data_start_date?: string;
  training_data_end_date?: string;
  model_version?: string;
  metadata?: Record<string, any>;
}

export interface UpdateForecastingModelRequest {
  model_name?: string;
  model_config?: Record<string, any>;
  accuracy_score?: number;
  last_trained?: string;
  last_prediction?: string;
  model_version?: string;
  status?: ForecastingModel["status"];
  metadata?: Record<string, any>;
}

export interface CreateDemandPredictionRequest {
  model_id: string;
  prediction_date: string;
  forecast_period: DemandPrediction["forecast_period"];
  category: DemandPrediction["category"];
  subcategory?: string;
  forecast_value: number;
  confidence_interval_lower?: number;
  confidence_interval_upper?: number;
  confidence_score?: number;
  external_factors?: Record<string, any>;
  prediction_metadata?: Record<string, any>;
}

export interface UpdateDemandPredictionRequest {
  forecast_value?: number;
  confidence_interval_lower?: number;
  confidence_interval_upper?: number;
  confidence_score?: number;
  external_factors?: Record<string, any>;
  prediction_metadata?: Record<string, any>;
}

export interface CreateForecastAccuracyRequest {
  prediction_id: string;
  model_id: string;
  actual_value: number;
  evaluation_date: string;
  evaluation_notes?: string;
}

export interface CreateDemandAlertRequest {
  alert_type: DemandAlert["alert_type"];
  severity: DemandAlert["severity"];
  title: string;
  description: string;
  prediction_data: Record<string, any>;
  threshold_exceeded?: Record<string, any>;
  recommended_actions?: string[];
}

export interface UpdateDemandAlertRequest {
  acknowledged?: boolean;
  acknowledged_by?: string;
  resolution_status?: DemandAlert["resolution_status"];
  resolution_notes?: string;
}

export interface UpdateForecastingSettingsRequest {
  accuracy_threshold?: number;
  retraining_frequency_days?: number;
  prediction_horizon_days?: number;
  alert_thresholds?: Record<string, any>;
  model_preferences?: Record<string, any>;
  external_data_sources?: Record<string, any>;
  auto_retrain_enabled?: boolean;
  auto_alerts_enabled?: boolean;
  settings_metadata?: Record<string, any>;
}

export interface CreateModelTrainingRequest {
  model_id: string;
  training_start: string;
  training_parameters?: Record<string, any>;
}

export interface UpdateModelTrainingRequest {
  training_end?: string;
  training_status?: ModelTrainingHistory["training_status"];
  training_accuracy?: number;
  validation_accuracy?: number;
  training_data_size?: number;
  training_metrics?: Record<string, any>;
  error_message?: string;
  model_artifacts?: Record<string, any>;
}

export interface CreateResourceOptimizationRequest {
  recommendation_type: ResourceOptimizationRecommendation["recommendation_type"];
  priority: ResourceOptimizationRecommendation["priority"];
  title: string;
  description: string;
  prediction_basis: Record<string, any>;
  recommended_changes: Record<string, any>;
  estimated_impact?: Record<string, any>;
  implementation_timeline?: string;
  cost_benefit_analysis?: Record<string, any>;
}

export interface UpdateResourceOptimizationRequest {
  priority?: ResourceOptimizationRecommendation["priority"];
  title?: string;
  description?: string;
  recommended_changes?: Record<string, any>;
  estimated_impact?: Record<string, any>;
  implementation_timeline?: string;
  implementation_status?: ResourceOptimizationRecommendation["implementation_status"];
  cost_benefit_analysis?: Record<string, any>;
  implementation_notes?: string;
  approved_by?: string;
  implemented_by?: string;
}

// Analytics and Dashboard Types

export interface ForecastingDashboardData {
  models: ForecastingModel[];
  recent_predictions: DemandPrediction[];
  accuracy_metrics: ForecastAccuracy[];
  active_alerts: DemandAlert[];
  performance_summary: {
    total_models: number;
    average_accuracy: number;
    predictions_generated: number;
    active_alerts_count: number;
    models_above_threshold: number;
    last_training_date: string;
  };
  recommendations: ResourceOptimizationRecommendation[];
}

export interface ForecastingPerformanceMetrics {
  model_id: string;
  model_name: string;
  model_type: string;
  current_accuracy: number;
  accuracy_trend: number[]; // Last 30 days
  prediction_count: number;
  last_training: string;
  status: string;
  recommendations_generated: number;
}

export interface DemandForecastChart {
  date: string;
  predicted_value: number;
  actual_value?: number;
  confidence_lower?: number;
  confidence_upper?: number;
  category: string;
  subcategory?: string;
}

export interface AccuracyTrendData {
  date: string;
  accuracy: number;
  model_name: string;
  model_type: string;
  prediction_count: number;
}

export interface AlertsAnalytics {
  total_alerts: number;
  alerts_by_type: Record<string, number>;
  alerts_by_severity: Record<string, number>;
  resolution_rate: number;
  average_resolution_time: number;
  recent_alerts: DemandAlert[];
}

export interface ResourceOptimizationAnalytics {
  total_recommendations: number;
  implementation_rate: number;
  estimated_savings: number;
  recommendations_by_type: Record<string, number>;
  impact_analysis: Record<string, any>;
  recent_implementations: ResourceOptimizationRecommendation[];
}

// Filter and Search Types

export interface ForecastingFilters {
  model_type?: ForecastingModel["model_type"];
  status?: ForecastingModel["status"];
  accuracy_min?: number;
  accuracy_max?: number;
  date_from?: string;
  date_to?: string;
  category?: DemandPrediction["category"];
  forecast_period?: DemandPrediction["forecast_period"];
  alert_type?: DemandAlert["alert_type"];
  severity?: DemandAlert["severity"];
  resolution_status?: DemandAlert["resolution_status"];
}

export interface PredictionFilters {
  model_id?: string;
  category?: DemandPrediction["category"];
  forecast_period?: DemandPrediction["forecast_period"];
  date_from?: string;
  date_to?: string;
  confidence_min?: number;
}

export interface AccuracyFilters {
  model_id?: string;
  accuracy_min?: number;
  accuracy_max?: number;
  date_from?: string;
  date_to?: string;
}

// Response Types

export interface ForecastingApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    total_count?: number;
    page?: number;
    per_page?: number;
    accuracy_summary?: {
      average_accuracy: number;
      models_above_threshold: number;
      total_models: number;
    };
  };
}

export type ForecastingModelsResponse = ForecastingApiResponse<ForecastingModel[]>;
export type ForecastingModelResponse = ForecastingApiResponse<ForecastingModel>;
export type DemandPredictionsResponse = ForecastingApiResponse<DemandPrediction[]>;
export type DemandPredictionResponse = ForecastingApiResponse<DemandPrediction>;
export type ForecastAccuracyResponse = ForecastingApiResponse<ForecastAccuracy[]>;
export type DemandAlertsResponse = ForecastingApiResponse<DemandAlert[]>;
export type DemandAlertResponse = ForecastingApiResponse<DemandAlert>;
export type ForecastingSettingsResponse = ForecastingApiResponse<ForecastingSettings>;
export type ModelTrainingHistoryResponse = ForecastingApiResponse<ModelTrainingHistory[]>;
export type ResourceOptimizationResponse = ForecastingApiResponse<
  ResourceOptimizationRecommendation[]
>;
export type ForecastingDashboardResponse = ForecastingApiResponse<ForecastingDashboardData>;
