/**
 * =====================================================================================
 * PREDICTIVE CASH FLOW TYPES
 * =====================================================================================
 * 
 * TypeScript type definitions for predictive cash flow analysis system.
 * Provides 85%+ accuracy AI-powered forecasting with comprehensive analytics.
 * 
 * Epic: 5 - Advanced Financial Intelligence
 * Story: 5.2 - Predictive Cash Flow Analysis  
 * Author: VoidBeast V4.0 BMad Method Integration
 * Created: 2025-01-27
 * 
 * Features:
 * - AI prediction models with accuracy tracking
 * - Multi-period forecasting (daily, weekly, monthly, quarterly, annual)
 * - Scenario planning and what-if analysis
 * - Cash flow alerts and early warning systems
 * - Confidence intervals and validation tracking
 * =====================================================================================
 */

// =====================================================================================
// CORE PREDICTION TYPES
// =====================================================================================

export type PredictionPeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';

export type ModelType = 'linear_regression' | 'arima' | 'lstm' | 'ensemble';

export type AlgorithmType = 'statistical' | 'machine_learning' | 'deep_learning';

export type ScenarioType = 'optimistic' | 'realistic' | 'pessimistic' | 'custom';

export type AlertType = 'cash_shortfall' | 'negative_trend' | 'accuracy_drop' | 'threshold_breach';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed';

export type ErrorCategory = 'under_prediction' | 'over_prediction' | 'seasonal_miss' | 'trend_miss';

export type ErrorMagnitude = 'low' | 'medium' | 'high' | 'critical';

// =====================================================================================
// PREDICTION MODEL INTERFACES
// =====================================================================================

export interface PredictionModel {
  id: string;
  model_name: string;
  model_type: ModelType;
  algorithm_type: AlgorithmType;
  
  // Performance Metrics
  accuracy_rate: number;
  confidence_score: number;
  mse_score?: number; // Mean Squared Error
  mae_score?: number; // Mean Absolute Error
  r2_score?: number; // R-squared score
  
  // Model Metadata
  model_version: string;
  model_parameters: Record<string, any>;
  training_data_size: number;
  training_period_start?: string;
  training_period_end?: string;
  
  // Status
  is_active: boolean;
  is_production_ready: boolean;
  last_trained: string;
  next_training_due?: string;
  
  // Audit
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreatePredictionModelInput {
  model_name: string;
  model_type: ModelType;
  algorithm_type: AlgorithmType;
  accuracy_rate?: number;
  confidence_score?: number;
  model_parameters?: Record<string, any>;
  training_data_size?: number;
  training_period_start?: string;
  training_period_end?: string;
}

export interface UpdatePredictionModelInput {
  model_name?: string;
  accuracy_rate?: number;
  confidence_score?: number;
  mse_score?: number;
  mae_score?: number;
  r2_score?: number;
  model_version?: string;
  model_parameters?: Record<string, any>;
  training_data_size?: number;
  is_active?: boolean;
  is_production_ready?: boolean;
  next_training_due?: string;
}

// =====================================================================================
// CASH FLOW PREDICTION INTERFACES
// =====================================================================================

export interface CashFlowPrediction {
  id: string;
  model_id: string;
  clinic_id: string;
  
  // Time Period
  period_type: PredictionPeriodType;
  start_date: string;
  end_date: string;
  
  // Prediction Values (in centavos)
  predicted_inflow_amount: number;
  predicted_outflow_amount: number;
  predicted_net_amount: number;
  
  // Confidence Intervals
  confidence_score: number;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
  
  // Variance Analysis
  prediction_variance?: number;
  seasonal_adjustment: number;
  trend_adjustment: number;
  
  // Metadata
  input_features: Record<string, any>;
  prediction_date: string;
  scenario_id?: string;
  
  // Status
  is_validated: boolean;
  validation_date?: string;
  
  // Audit
  created_at: string;
  updated_at: string;
  
  // Related Data
  model?: PredictionModel;
  scenario?: ForecastingScenario;
  accuracy?: PredictionAccuracy;
}

export interface CreateCashFlowPredictionInput {
  model_id: string;
  clinic_id: string;
  period_type: PredictionPeriodType;
  start_date: string;
  end_date: string;
  predicted_inflow_amount: number;
  predicted_outflow_amount: number;
  predicted_net_amount: number;
  confidence_score: number;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
  prediction_variance?: number;
  seasonal_adjustment?: number;
  trend_adjustment?: number;
  input_features?: Record<string, any>;
  scenario_id?: string;
}

export interface UpdateCashFlowPredictionInput {
  predicted_inflow_amount?: number;
  predicted_outflow_amount?: number;
  predicted_net_amount?: number;
  confidence_score?: number;
  confidence_interval_lower?: number;
  confidence_interval_upper?: number;
  prediction_variance?: number;
  is_validated?: boolean;
  validation_date?: string;
}

// =====================================================================================
// FORECASTING SCENARIO INTERFACES
// =====================================================================================

export interface ForecastingScenario {
  id: string;
  scenario_name: string;
  scenario_type: ScenarioType;
  description?: string;
  
  // Scenario Parameters
  parameters: Record<string, any>;
  market_conditions: Record<string, any>;
  business_assumptions: Record<string, any>;
  
  // Time Range
  forecast_start_date: string;
  forecast_end_date: string;
  
  // Results Summary (in centavos)
  total_predicted_revenue: number;
  total_predicted_expenses: number;
  total_predicted_profit: number;
  cash_flow_variance?: number;
  
  // Status
  is_active: boolean;
  is_baseline: boolean;
  
  // Ownership
  created_by: string;
  clinic_id: string;
  
  // Audit
  created_at: string;
  updated_at: string;
  
  // Related Data
  predictions?: CashFlowPrediction[];
}

export interface CreateForecastingScenarioInput {
  scenario_name: string;
  scenario_type: ScenarioType;
  description?: string;
  parameters: Record<string, any>;
  market_conditions?: Record<string, any>;
  business_assumptions?: Record<string, any>;
  forecast_start_date: string;
  forecast_end_date: string;
  clinic_id: string;
  is_baseline?: boolean;
}

export interface UpdateForecastingScenarioInput {
  scenario_name?: string;
  scenario_type?: ScenarioType;
  description?: string;
  parameters?: Record<string, any>;
  market_conditions?: Record<string, any>;
  business_assumptions?: Record<string, any>;
  forecast_start_date?: string;
  forecast_end_date?: string;
  total_predicted_revenue?: number;
  total_predicted_expenses?: number;
  total_predicted_profit?: number;
  cash_flow_variance?: number;
  is_active?: boolean;
  is_baseline?: boolean;
}

// =====================================================================================
// PREDICTION ACCURACY INTERFACES
// =====================================================================================

export interface PredictionAccuracy {
  id: string;
  prediction_id: string;
  model_id: string;
  
  // Actual vs Predicted (in centavos)
  actual_inflow_amount: number;
  actual_outflow_amount: number;
  actual_net_amount: number;
  
  // Accuracy Metrics
  accuracy_percentage: number;
  absolute_error: number;
  relative_error: number;
  squared_error: number;
  
  // Error Analysis
  error_category?: ErrorCategory;
  error_magnitude?: ErrorMagnitude;
  contributing_factors: Record<string, any>;
  
  // Validation Context
  validation_period_type: PredictionPeriodType;
  validation_date: string;
  is_outlier: boolean;
  
  // Audit
  created_at: string;
  created_by?: string;
  
  // Related Data
  prediction?: CashFlowPrediction;
  model?: PredictionModel;
}

export interface CreatePredictionAccuracyInput {
  prediction_id: string;
  model_id: string;
  actual_inflow_amount: number;
  actual_outflow_amount: number;
  actual_net_amount: number;
  accuracy_percentage: number;
  absolute_error: number;
  relative_error: number;
  squared_error: number;
  error_category?: ErrorCategory;
  error_magnitude?: ErrorMagnitude;
  contributing_factors?: Record<string, any>;
  validation_period_type: PredictionPeriodType;
  validation_date: string;
  is_outlier?: boolean;
}

// =====================================================================================
// PREDICTION ALERT INTERFACES
// =====================================================================================

export interface PredictionAlert {
  id: string;
  prediction_id?: string;
  clinic_id: string;
  
  // Alert Configuration
  alert_type: AlertType;
  severity_level: SeverityLevel;
  
  // Thresholds
  threshold_amount?: number;
  threshold_percentage?: number;
  threshold_period?: string;
  
  // Alert Details
  alert_message: string;
  alert_description?: string;
  recommended_actions: string[];
  
  // Status
  status: AlertStatus;
  triggered_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  
  // Assignment
  assigned_to?: string;
  notification_sent: boolean;
  notification_channels: string[];
  
  // Audit
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Related Data
  prediction?: CashFlowPrediction;
}

export interface CreatePredictionAlertInput {
  prediction_id?: string;
  clinic_id: string;
  alert_type: AlertType;
  severity_level: SeverityLevel;
  threshold_amount?: number;
  threshold_percentage?: number;
  threshold_period?: string;
  alert_message: string;
  alert_description?: string;
  recommended_actions?: string[];
  assigned_to?: string;
  notification_channels?: string[];
}

export interface UpdatePredictionAlertInput {
  status?: AlertStatus;
  acknowledged_at?: string;
  resolved_at?: string;
  assigned_to?: string;
  notification_sent?: boolean;
  recommended_actions?: string[];
}

// =====================================================================================
// ANALYSIS AND REPORTING INTERFACES
// =====================================================================================

export interface ModelAccuracySummary {
  accuracy_avg: number;
  accuracy_min: number;
  accuracy_max: number;
  total_predictions: number;
  validated_predictions: number;
}

export interface PredictionAnalytics {
  model_performance: {
    overall_accuracy: number;
    accuracy_trend: Array<{ date: string; accuracy: number }>;
    error_distribution: Record<ErrorCategory, number>;
    confidence_levels: Array<{ range: string; count: number }>;
  };
  
  forecast_accuracy: {
    by_period: Record<PredictionPeriodType, number>;
    by_timeframe: Array<{ period: string; accuracy: number }>;
    seasonal_performance: Array<{ month: number; accuracy: number }>;
  };
  
  alert_analytics: {
    total_alerts: number;
    active_alerts: number;
    alerts_by_type: Record<AlertType, number>;
    alerts_by_severity: Record<SeverityLevel, number>;
    resolution_time_avg: number;
  };
  
  scenario_insights: {
    scenario_count: number;
    accuracy_comparison: Array<{
      scenario_type: ScenarioType;
      avg_accuracy: number;
      prediction_count: number;
    }>;
  };
}

export interface CashFlowForecast {
  periods: Array<{
    period: string;
    period_type: PredictionPeriodType;
    predicted_inflow: number;
    predicted_outflow: number;
    predicted_net: number;
    confidence_score: number;
    confidence_lower: number;
    confidence_upper: number;
  }>;
  
  summary: {
    total_predicted_inflow: number;
    total_predicted_outflow: number;
    total_predicted_net: number;
    average_confidence: number;
    forecast_accuracy: number;
    trend_direction: 'up' | 'down' | 'stable';
  };
  
  insights: {
    peak_cash_period: string;
    lowest_cash_period: string;
    potential_shortfalls: string[];
    recommended_actions: string[];
  };
}

export interface ScenarioComparison {
  scenarios: Array<{
    id: string;
    name: string;
    type: ScenarioType;
    predicted_profit: number;
    cash_flow_variance: number;
    confidence_score: number;
  }>;
  
  comparison_metrics: {
    best_case: {
      scenario_id: string;
      predicted_profit: number;
    };
    worst_case: {
      scenario_id: string;
      predicted_profit: number;
    };
    most_likely: {
      scenario_id: string;
      predicted_profit: number;
    };
  };
  
  risk_analysis: {
    profit_range: { min: number; max: number };
    variance_range: { min: number; max: number };
    downside_risk: number;
    upside_potential: number;
  };
}

// =====================================================================================
// FILTERING AND QUERY INTERFACES
// =====================================================================================

export interface PredictionFilters {
  clinic_id?: string;
  model_id?: string;
  period_type?: PredictionPeriodType;
  start_date?: string;
  end_date?: string;
  min_confidence?: number;
  is_validated?: boolean;
  scenario_id?: string;
}

export interface ModelFilters {
  model_type?: ModelType;
  algorithm_type?: AlgorithmType;
  min_accuracy?: number;
  is_active?: boolean;
  is_production_ready?: boolean;
}

export interface ScenarioFilters {
  clinic_id?: string;
  scenario_type?: ScenarioType;
  is_active?: boolean;
  is_baseline?: boolean;
  created_by?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface AlertFilters {
  clinic_id?: string;
  alert_type?: AlertType;
  severity_level?: SeverityLevel;
  status?: AlertStatus;
  assigned_to?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

// =====================================================================================
// API RESPONSE INTERFACES
// =====================================================================================

export interface PredictionsResponse {
  predictions: CashFlowPrediction[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface ModelsResponse {
  models: PredictionModel[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface ScenariosResponse {
  scenarios: ForecastingScenario[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface AlertsResponse {
  alerts: PredictionAlert[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// =====================================================================================
// ERROR HANDLING INTERFACES
// =====================================================================================

export interface PredictionError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ValidationError extends PredictionError {
  field: string;
  value: any;
  constraint: string;
}

export interface ModelTrainingError extends PredictionError {
  model_id: string;
  training_step: string;
  data_quality_issues?: string[];
}

export interface ForecastingError extends PredictionError {
  scenario_id?: string;
  prediction_period: string;
  insufficient_data?: boolean;
}

// =====================================================================================
// UTILITY AND HELPER TYPES
// =====================================================================================

export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface DateRange {
  start_date: string;
  end_date: string;
}

export interface AmountRange {
  min_amount: number;
  max_amount: number;
}

export interface ConfidenceRange {
  min_confidence: number;
  max_confidence: number;
}

// Export all types for external use
export type {
  PredictionPeriodType,
  ModelType,
  AlgorithmType,
  ScenarioType,
  AlertType,
  SeverityLevel,
  AlertStatus,
  ErrorCategory,
  ErrorMagnitude,
};