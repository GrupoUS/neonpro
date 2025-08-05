/**
 * =====================================================================================
 * PREDICTIVE CASH FLOW VALIDATION SCHEMAS
 * =====================================================================================
 * 
 * Zod validation schemas for predictive cash flow analysis system.
 * Provides comprehensive type-safe validation for AI-powered forecasting.
 * 
 * Epic: 5 - Advanced Financial Intelligence
 * Story: 5.2 - Predictive Cash Flow Analysis
 * Author: VoidBeast V4.0 BMad Method Integration
 * Created: 2025-01-27
 * 
 * Features:
 * - AI prediction model validation with accuracy constraints
 * - Multi-period forecasting validation
 * - Scenario planning validation with business rules
 * - Alert system validation with threshold management
 * - Comprehensive error handling and validation
 * =====================================================================================
 */

import { z } from 'zod';

// =====================================================================================
// CORE VALIDATION SCHEMAS
// =====================================================================================

const PredictionPeriodTypeSchema = z.enum([
  'daily',
  'weekly', 
  'monthly',
  'quarterly',
  'annual'
]);

const ModelTypeSchema = z.enum([
  'linear_regression',
  'arima',
  'lstm',
  'ensemble'
]);

const AlgorithmTypeSchema = z.enum([
  'statistical',
  'machine_learning',
  'deep_learning'
]);

export const ScenarioTypeSchema = z.enum([
  'optimistic',
  'realistic',
  'pessimistic',
  'custom'
]);

export const AlertTypeSchema = z.enum([
  'cash_shortfall',
  'negative_trend',
  'accuracy_drop',
  'threshold_breach'
]);

export const SeverityLevelSchema = z.enum([
  'low',
  'medium',
  'high',
  'critical'
]);

export const AlertStatusSchema = z.enum([
  'active',
  'acknowledged',
  'resolved',
  'dismissed'
]);

export const ErrorCategorySchema = z.enum([
  'under_prediction',
  'over_prediction',
  'seasonal_miss',
  'trend_miss'
]);

export const ErrorMagnitudeSchema = z.enum([
  'low',
  'medium',
  'high',
  'critical'
]);

// =====================================================================================
// COMMON VALIDATION PATTERNS
// =====================================================================================

const UUIDSchema = z.string().uuid('Invalid UUID format');

const PositiveNumberSchema = z.number().min(0, 'Must be non-negative');

const PercentageSchema = z.number()
  .min(0, 'Percentage must be at least 0')
  .max(100, 'Percentage cannot exceed 100');

const AccuracyPercentageSchema = z.number()
  .min(0, 'Accuracy must be at least 0%')
  .max(100, 'Accuracy cannot exceed 100%');

const ConfidenceScoreSchema = z.number()
  .min(0, 'Confidence score must be at least 0')
  .max(100, 'Confidence score cannot exceed 100');

const AmountInCentavosSchema = z.number()
  .int('Amount must be an integer (centavos)')
  .min(-999999999999, 'Amount too small')
  .max(999999999999, 'Amount too large');

const DateStringSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const TimestampSchema = z.string()
  .datetime('Invalid timestamp format');

const JSONObjectSchema = z.record(z.any()).default({});

// =====================================================================================
// PREDICTION MODEL VALIDATION SCHEMAS
// =====================================================================================

export const CreatePredictionModelSchema = z.object({
  model_name: z.string()
    .min(1, 'Model name is required')
    .max(100, 'Model name too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Model name can only contain letters, numbers, hyphens, and underscores'),
  
  model_type: ModelTypeSchema,
  
  algorithm_type: AlgorithmTypeSchema,
  
  accuracy_rate: AccuracyPercentageSchema.optional().default(0),
  
  confidence_score: ConfidenceScoreSchema.optional().default(0),
  
  model_parameters: JSONObjectSchema.optional().default({}),
  
  training_data_size: z.number()
    .int('Training data size must be an integer')
    .min(0, 'Training data size must be non-negative')
    .optional()
    .default(0),
  
  training_period_start: DateStringSchema.optional(),
  
  training_period_end: DateStringSchema.optional(),
}).refine(data => {
  if (data.training_period_start && data.training_period_end) {
    return new Date(data.training_period_start) <= new Date(data.training_period_end);
  }
  return true;
}, {
  message: 'Training period end must be after start date',
  path: ['training_period_end']
});

export const UpdatePredictionModelSchema = z.object({
  model_name: z.string()
    .min(1, 'Model name is required')
    .max(100, 'Model name too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Model name can only contain letters, numbers, hyphens, and underscores')
    .optional(),
  
  accuracy_rate: AccuracyPercentageSchema.optional(),
  
  confidence_score: ConfidenceScoreSchema.optional(),
  
  mse_score: PositiveNumberSchema.optional(),
  
  mae_score: PositiveNumberSchema.optional(),
  
  r2_score: z.number()
    .min(-1, 'R² score cannot be less than -1')
    .max(1, 'R² score cannot exceed 1')
    .optional(),
  
  model_version: z.string()
    .regex(/^\d+\.\d+\.\d+$/, 'Model version must be in semantic version format (x.y.z)')
    .optional(),
  
  model_parameters: JSONObjectSchema.optional(),
  
  training_data_size: z.number()
    .int('Training data size must be an integer')
    .min(0, 'Training data size must be non-negative')
    .optional(),
  
  is_active: z.boolean().optional(),
  
  is_production_ready: z.boolean().optional(),
  
  next_training_due: TimestampSchema.optional(),
}).refine(data => {
  // Ensure production-ready models have minimum accuracy requirements
  if (data.is_production_ready && data.accuracy_rate !== undefined) {
    return data.accuracy_rate >= 75; // Minimum 75% accuracy for production
  }
  return true;
}, {
  message: 'Production-ready models must have at least 75% accuracy',
  path: ['accuracy_rate']
});

// =====================================================================================
// CASH FLOW PREDICTION VALIDATION SCHEMAS
// =====================================================================================

export const CreateCashFlowPredictionSchema = z.object({
  model_id: UUIDSchema,
  
  clinic_id: UUIDSchema,
  
  period_type: PredictionPeriodTypeSchema,
  
  start_date: DateStringSchema,
  
  end_date: DateStringSchema,
  
  predicted_inflow_amount: AmountInCentavosSchema,
  
  predicted_outflow_amount: AmountInCentavosSchema,
  
  predicted_net_amount: AmountInCentavosSchema,
  
  confidence_score: ConfidenceScoreSchema,
  
  confidence_interval_lower: AmountInCentavosSchema,
  
  confidence_interval_upper: AmountInCentavosSchema,
  
  prediction_variance: PositiveNumberSchema.optional(),
  
  seasonal_adjustment: z.number()
    .min(0.1, 'Seasonal adjustment must be at least 0.1')
    .max(10.0, 'Seasonal adjustment cannot exceed 10.0')
    .optional()
    .default(1.0),
  
  trend_adjustment: z.number()
    .min(0.1, 'Trend adjustment must be at least 0.1')
    .max(10.0, 'Trend adjustment cannot exceed 10.0')
    .optional()
    .default(1.0),
  
  input_features: JSONObjectSchema.optional().default({}),
  
  scenario_id: UUIDSchema.optional(),
}).refine(data => {
  return new Date(data.start_date) <= new Date(data.end_date);
}, {
  message: 'End date must be after start date',
  path: ['end_date']
}).refine(data => {
  return data.confidence_interval_lower <= data.confidence_interval_upper;
}, {
  message: 'Confidence interval upper bound must be greater than or equal to lower bound',
  path: ['confidence_interval_upper']
}).refine(data => {
  // Net amount should be inflow minus outflow (with some tolerance for rounding)
  const calculated_net = data.predicted_inflow_amount - data.predicted_outflow_amount;
  const tolerance = Math.abs(calculated_net * 0.01); // 1% tolerance
  return Math.abs(data.predicted_net_amount - calculated_net) <= tolerance;
}, {
  message: 'Predicted net amount must equal inflow minus outflow',
  path: ['predicted_net_amount']
}).refine(data => {
  // Confidence score should align with confidence interval width
  const interval_width = data.confidence_interval_upper - data.confidence_interval_lower;
  const predicted_amount = Math.abs(data.predicted_net_amount);
  
  if (predicted_amount > 0) {
    const relative_width = interval_width / predicted_amount;
    // High confidence should have narrow intervals, low confidence should have wide intervals
    if (data.confidence_score > 90 && relative_width > 0.2) return false;
    if (data.confidence_score < 50 && relative_width < 0.1) return false;
  }
  
  return true;
}, {
  message: 'Confidence score must align with confidence interval width',
  path: ['confidence_score']
});

export const UpdateCashFlowPredictionSchema = z.object({
  predicted_inflow_amount: AmountInCentavosSchema.optional(),
  
  predicted_outflow_amount: AmountInCentavosSchema.optional(),
  
  predicted_net_amount: AmountInCentavosSchema.optional(),
  
  confidence_score: ConfidenceScoreSchema.optional(),
  
  confidence_interval_lower: AmountInCentavosSchema.optional(),
  
  confidence_interval_upper: AmountInCentavosSchema.optional(),
  
  prediction_variance: PositiveNumberSchema.optional(),
  
  is_validated: z.boolean().optional(),
  
  validation_date: TimestampSchema.optional(),
}).refine(data => {
  if (data.confidence_interval_lower !== undefined && data.confidence_interval_upper !== undefined) {
    return data.confidence_interval_lower <= data.confidence_interval_upper;
  }
  return true;
}, {
  message: 'Confidence interval upper bound must be greater than or equal to lower bound',
  path: ['confidence_interval_upper']
});

// =====================================================================================
// FORECASTING SCENARIO VALIDATION SCHEMAS
// =====================================================================================

export const CreateForecastingScenarioSchema = z.object({
  scenario_name: z.string()
    .min(1, 'Scenario name is required')
    .max(100, 'Scenario name too long'),
  
  scenario_type: ScenarioTypeSchema,
  
  description: z.string().max(500, 'Description too long').optional(),
  
  parameters: JSONObjectSchema,
  
  market_conditions: JSONObjectSchema.optional().default({}),
  
  business_assumptions: JSONObjectSchema.optional().default({}),
  
  forecast_start_date: DateStringSchema,
  
  forecast_end_date: DateStringSchema,
  
  clinic_id: UUIDSchema,
  
  is_baseline: z.boolean().optional().default(false),
}).refine(data => {
  return new Date(data.forecast_start_date) <= new Date(data.forecast_end_date);
}, {
  message: 'Forecast end date must be after start date',
  path: ['forecast_end_date']
}).refine(data => {
  // Forecast period should be reasonable (not more than 5 years)
  const start = new Date(data.forecast_start_date);
  const end = new Date(data.forecast_end_date);
  const diffYears = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  return diffYears <= 5;
}, {
  message: 'Forecast period cannot exceed 5 years',
  path: ['forecast_end_date']
});

export const UpdateForecastingScenarioSchema = z.object({
  scenario_name: z.string()
    .min(1, 'Scenario name is required')
    .max(100, 'Scenario name too long')
    .optional(),
  
  scenario_type: ScenarioTypeSchema.optional(),
  
  description: z.string().max(500, 'Description too long').optional(),
  
  parameters: JSONObjectSchema.optional(),
  
  market_conditions: JSONObjectSchema.optional(),
  
  business_assumptions: JSONObjectSchema.optional(),
  
  forecast_start_date: DateStringSchema.optional(),
  
  forecast_end_date: DateStringSchema.optional(),
  
  total_predicted_revenue: AmountInCentavosSchema.optional(),
  
  total_predicted_expenses: AmountInCentavosSchema.optional(),
  
  total_predicted_profit: AmountInCentavosSchema.optional(),
  
  cash_flow_variance: PositiveNumberSchema.optional(),
  
  is_active: z.boolean().optional(),
  
  is_baseline: z.boolean().optional(),
}).refine(data => {
  if (data.forecast_start_date && data.forecast_end_date) {
    return new Date(data.forecast_start_date) <= new Date(data.forecast_end_date);
  }
  return true;
}, {
  message: 'Forecast end date must be after start date',
  path: ['forecast_end_date']
}).refine(data => {
  if (data.total_predicted_revenue !== undefined && data.total_predicted_expenses !== undefined && data.total_predicted_profit !== undefined) {
    const calculated_profit = data.total_predicted_revenue - data.total_predicted_expenses;
    const tolerance = Math.abs(calculated_profit * 0.01); // 1% tolerance
    return Math.abs(data.total_predicted_profit - calculated_profit) <= tolerance;
  }
  return true;
}, {
  message: 'Total predicted profit must equal revenue minus expenses',
  path: ['total_predicted_profit']
});

// =====================================================================================
// PREDICTION ACCURACY VALIDATION SCHEMAS
// =====================================================================================

export const CreatePredictionAccuracySchema = z.object({
  prediction_id: UUIDSchema,
  
  model_id: UUIDSchema,
  
  actual_inflow_amount: AmountInCentavosSchema,
  
  actual_outflow_amount: AmountInCentavosSchema,
  
  actual_net_amount: AmountInCentavosSchema,
  
  accuracy_percentage: AccuracyPercentageSchema,
  
  absolute_error: PositiveNumberSchema,
  
  relative_error: z.number(),
  
  squared_error: PositiveNumberSchema,
  
  error_category: ErrorCategorySchema.optional(),
  
  error_magnitude: ErrorMagnitudeSchema.optional(),
  
  contributing_factors: JSONObjectSchema.optional().default({}),
  
  validation_period_type: PredictionPeriodTypeSchema,
  
  validation_date: DateStringSchema,
  
  is_outlier: z.boolean().optional().default(false),
}).refine(data => {
  // Net amount should be inflow minus outflow
  const calculated_net = data.actual_inflow_amount - data.actual_outflow_amount;
  const tolerance = Math.abs(calculated_net * 0.01); // 1% tolerance
  return Math.abs(data.actual_net_amount - calculated_net) <= tolerance;
}, {
  message: 'Actual net amount must equal inflow minus outflow',
  path: ['actual_net_amount']
}).refine(data => {
  // Validate error magnitude matches accuracy percentage
  if (data.error_magnitude) {
    const accuracy = data.accuracy_percentage;
    switch (data.error_magnitude) {
      case 'low': return accuracy >= 90;
      case 'medium': return accuracy >= 70 && accuracy < 90;
      case 'high': return accuracy >= 50 && accuracy < 70;
      case 'critical': return accuracy < 50;
      default: return true;
    }
  }
  return true;
}, {
  message: 'Error magnitude must align with accuracy percentage',
  path: ['error_magnitude']
});

// =====================================================================================
// PREDICTION ALERT VALIDATION SCHEMAS
// =====================================================================================

export const CreatePredictionAlertSchema = z.object({
  prediction_id: UUIDSchema.optional(),
  
  clinic_id: UUIDSchema,
  
  alert_type: AlertTypeSchema,
  
  severity_level: SeverityLevelSchema,
  
  threshold_amount: AmountInCentavosSchema.optional(),
  
  threshold_percentage: PercentageSchema.optional(),
  
  threshold_period: z.string().max(50, 'Threshold period too long').optional(),
  
  alert_message: z.string()
    .min(1, 'Alert message is required')
    .max(500, 'Alert message too long'),
  
  alert_description: z.string().max(1000, 'Alert description too long').optional(),
  
  recommended_actions: z.array(z.string().max(200, 'Recommended action too long'))
    .max(10, 'Too many recommended actions')
    .optional()
    .default([]),
  
  assigned_to: UUIDSchema.optional(),
  
  notification_channels: z.array(z.enum(['email', 'sms', 'push', 'dashboard']))
    .max(4, 'Too many notification channels')
    .optional()
    .default([]),
}).refine(data => {
  // Ensure at least one threshold is provided for threshold-based alerts
  if (data.alert_type === 'threshold_breach') {
    return data.threshold_amount !== undefined || data.threshold_percentage !== undefined;
  }
  return true;
}, {
  message: 'Threshold-based alerts must have either amount or percentage threshold',
  path: ['threshold_amount']
});

export const UpdatePredictionAlertSchema = z.object({
  status: AlertStatusSchema.optional(),
  
  acknowledged_at: TimestampSchema.optional(),
  
  resolved_at: TimestampSchema.optional(),
  
  assigned_to: UUIDSchema.optional(),
  
  notification_sent: z.boolean().optional(),
  
  recommended_actions: z.array(z.string().max(200, 'Recommended action too long'))
    .max(10, 'Too many recommended actions')
    .optional(),
}).refine(data => {
  // If status is acknowledged, acknowledged_at should be provided
  if (data.status === 'acknowledged' && !data.acknowledged_at) {
    return false;
  }
  // If status is resolved, resolved_at should be provided
  if (data.status === 'resolved' && !data.resolved_at) {
    return false;
  }
  return true;
}, {
  message: 'Status change requires corresponding timestamp',
  path: ['status']
});

// =====================================================================================
// FILTER VALIDATION SCHEMAS
// =====================================================================================

export const PredictionFiltersSchema = z.object({
  clinic_id: UUIDSchema.optional(),
  model_id: UUIDSchema.optional(),
  period_type: PredictionPeriodTypeSchema.optional(),
  start_date: DateStringSchema.optional(),
  end_date: DateStringSchema.optional(),
  min_confidence: ConfidenceScoreSchema.optional(),
  is_validated: z.boolean().optional(),
  scenario_id: UUIDSchema.optional(),
}).refine(data => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['end_date']
});

export const ModelFiltersSchema = z.object({
  model_type: ModelTypeSchema.optional(),
  algorithm_type: AlgorithmTypeSchema.optional(),
  min_accuracy: AccuracyPercentageSchema.optional(),
  is_active: z.boolean().optional(),
  is_production_ready: z.boolean().optional(),
});

export const ScenarioFiltersSchema = z.object({
  clinic_id: UUIDSchema.optional(),
  scenario_type: ScenarioTypeSchema.optional(),
  is_active: z.boolean().optional(),
  is_baseline: z.boolean().optional(),
  created_by: UUIDSchema.optional(),
  date_range: z.object({
    start: DateStringSchema,
    end: DateStringSchema,
  }).refine(data => {
    return new Date(data.start) <= new Date(data.end);
  }, {
    message: 'End date must be after start date',
    path: ['end']
  }).optional(),
});

export const AlertFiltersSchema = z.object({
  clinic_id: UUIDSchema.optional(),
  alert_type: AlertTypeSchema.optional(),
  severity_level: SeverityLevelSchema.optional(),
  status: AlertStatusSchema.optional(),
  assigned_to: UUIDSchema.optional(),
  date_range: z.object({
    start: DateStringSchema,
    end: DateStringSchema,
  }).refine(data => {
    return new Date(data.start) <= new Date(data.end);
  }, {
    message: 'End date must be after start date',
    path: ['end']
  }).optional(),
});

// =====================================================================================
// PAGINATION AND UTILITY SCHEMAS
// =====================================================================================

export const PaginationParamsSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').optional().default(1),
  per_page: z.number().int().min(1, 'Per page must be at least 1').max(100, 'Per page cannot exceed 100').optional().default(20),
  sort_by: z.string().max(50, 'Sort field too long').optional(),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const DateRangeSchema = z.object({
  start_date: DateStringSchema,
  end_date: DateStringSchema,
}).refine(data => {
  return new Date(data.start_date) <= new Date(data.end_date);
}, {
  message: 'End date must be after start date',
  path: ['end_date']
});

export const AmountRangeSchema = z.object({
  min_amount: AmountInCentavosSchema,
  max_amount: AmountInCentavosSchema,
}).refine(data => {
  return data.min_amount <= data.max_amount;
}, {
  message: 'Maximum amount must be greater than or equal to minimum amount',
  path: ['max_amount']
});

export const ConfidenceRangeSchema = z.object({
  min_confidence: ConfidenceScoreSchema,
  max_confidence: ConfidenceScoreSchema,
}).refine(data => {
  return data.min_confidence <= data.max_confidence;
}, {
  message: 'Maximum confidence must be greater than or equal to minimum confidence',
  path: ['max_confidence']
});
// =====================================================================================
// EXPORTS WITH CORRECT SCHEMA REFERENCES
// =====================================================================================

// Export the actual schemas for use in API routes
export const predictionPeriodTypeSchema = PredictionPeriodTypeSchema;
export const createCashFlowPredictionSchema = CreateCashFlowPredictionSchema;
export const createForecastingScenarioSchema = CreateForecastingScenarioSchema;
