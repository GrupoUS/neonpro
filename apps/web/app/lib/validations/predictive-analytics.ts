// Predictive Analytics for Demand Forecasting - Zod Validation Schemas
// ≥85% accuracy requirement validation included

import { z } from 'zod';

// Core validation schemas

export const forecastingModelSchema = z.object({
  id: z.string().uuid(),
  model_type: z.enum([
    'appointment_demand',
    'treatment_demand',
    'seasonal',
    'resource_utilization',
  ]),
  model_name: z.string().min(1, 'Model name is required').max(200),
  model_config: z.record(z.any()).default({}),
  accuracy_score: z.number().min(0).max(1).optional(), // 0.0000 to 1.0000 (≥0.8500 required)
  training_data_start_date: z.string().optional(),
  training_data_end_date: z.string().optional(),
  last_trained: z.string(),
  last_prediction: z.string().optional(),
  model_version: z.string().default('1.0'),
  status: z
    .enum(['active', 'training', 'deprecated', 'failed'])
    .default('active'),
  metadata: z.record(z.any()).default({}),
  clinic_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const demandPredictionSchema = z.object({
  id: z.string().uuid(),
  model_id: z.string().uuid(),
  prediction_date: z.string(),
  forecast_period: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
  category: z.enum([
    'appointments',
    'specific_treatment',
    'staff_hours',
    'equipment_usage',
  ]),
  subcategory: z.string().optional(),
  forecast_value: z.number().min(0, 'Forecast value must be non-negative'),
  confidence_interval_lower: z.number().optional(),
  confidence_interval_upper: z.number().optional(),
  confidence_score: z.number().min(0).max(1).optional(),
  external_factors: z.record(z.any()).default({}),
  prediction_metadata: z.record(z.any()).default({}),
  clinic_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const forecastAccuracySchema = z.object({
  id: z.string().uuid(),
  prediction_id: z.string().uuid(),
  model_id: z.string().uuid(),
  actual_value: z.number().min(0, 'Actual value must be non-negative'),
  accuracy_score: z.number().min(0).max(1), // 0.0000 to 1.0000
  absolute_error: z.number().min(0).optional(),
  percentage_error: z.number().optional(),
  evaluation_date: z.string(),
  evaluation_notes: z.string().optional(),
  clinic_id: z.string().uuid(),
  created_at: z.string(),
});

export const demandAlertSchema = z.object({
  id: z.string().uuid(),
  alert_type: z.enum([
    'demand_spike',
    'capacity_constraint',
    'anomaly_detected',
    'low_accuracy',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  title: z.string().min(1, 'Alert title is required').max(200),
  description: z.string().min(1, 'Alert description is required'),
  prediction_data: z.record(z.any()).default({}),
  threshold_exceeded: z.record(z.any()).optional(),
  recommended_actions: z.array(z.string()).default([]),
  alert_date: z.string(),
  notification_sent: z.boolean().default(false),
  notification_sent_at: z.string().optional(),
  acknowledged: z.boolean().default(false),
  acknowledged_by: z.string().uuid().optional(),
  acknowledged_at: z.string().optional(),
  resolution_status: z
    .enum(['open', 'in_progress', 'resolved', 'dismissed'])
    .default('open'),
  resolution_notes: z.string().optional(),
  resolved_at: z.string().optional(),
  clinic_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const forecastingSettingsSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  accuracy_threshold: z.number().min(0).max(1).default(0.85), // Minimum 85% accuracy
  retraining_frequency_days: z.number().min(1).max(365).default(30),
  prediction_horizon_days: z.number().min(1).max(365).default(90),
  alert_thresholds: z.record(z.any()).default({}),
  model_preferences: z.record(z.any()).default({}),
  external_data_sources: z.record(z.any()).default({}),
  auto_retrain_enabled: z.boolean().default(true),
  auto_alerts_enabled: z.boolean().default(true),
  settings_metadata: z.record(z.any()).default({}),
  created_at: z.string(),
  updated_at: z.string(),
});

export const modelTrainingHistorySchema = z.object({
  id: z.string().uuid(),
  model_id: z.string().uuid(),
  training_start: z.string(),
  training_end: z.string().optional(),
  training_status: z
    .enum(['in_progress', 'completed', 'failed'])
    .default('in_progress'),
  training_accuracy: z.number().min(0).max(1).optional(),
  validation_accuracy: z.number().min(0).max(1).optional(),
  training_data_size: z.number().min(0).optional(),
  training_parameters: z.record(z.any()).default({}),
  training_metrics: z.record(z.any()).default({}),
  error_message: z.string().optional(),
  model_artifacts: z.record(z.any()).default({}),
  clinic_id: z.string().uuid(),
  created_at: z.string(),
});

export const resourceOptimizationRecommendationSchema = z.object({
  id: z.string().uuid(),
  recommendation_type: z.enum([
    'staff_scheduling',
    'equipment_allocation',
    'capacity_planning',
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  prediction_basis: z.record(z.any()),
  recommended_changes: z.record(z.any()),
  estimated_impact: z.record(z.any()).default({}),
  implementation_timeline: z.string().optional(),
  implementation_status: z
    .enum(['pending', 'approved', 'implemented', 'rejected'])
    .default('pending'),
  cost_benefit_analysis: z.record(z.any()).default({}),
  implementation_notes: z.string().optional(),
  created_by: z.string().uuid().optional(),
  approved_by: z.string().uuid().optional(),
  implemented_by: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Request validation schemas

export const createForecastingModelRequestSchema = z.object({
  model_type: z.enum([
    'appointment_demand',
    'treatment_demand',
    'seasonal',
    'resource_utilization',
  ]),
  model_name: z.string().min(1, 'Model name is required').max(200),
  model_config: z.record(z.any()).default({}),
  training_data_start_date: z.string().optional(),
  training_data_end_date: z.string().optional(),
  model_version: z.string().default('1.0'),
  metadata: z.record(z.any()).default({}),
});

export const updateForecastingModelRequestSchema = z.object({
  model_name: z.string().min(1).max(200).optional(),
  model_config: z.record(z.any()).optional(),
  accuracy_score: z.number().min(0).max(1).optional(),
  last_trained: z.string().optional(),
  last_prediction: z.string().optional(),
  model_version: z.string().optional(),
  status: z.enum(['active', 'training', 'deprecated', 'failed']).optional(),
  metadata: z.record(z.any()).optional(),
});

export const createDemandPredictionRequestSchema = z.object({
  model_id: z.string().uuid(),
  prediction_date: z.string(),
  forecast_period: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
  category: z.enum([
    'appointments',
    'specific_treatment',
    'staff_hours',
    'equipment_usage',
  ]),
  subcategory: z.string().optional(),
  forecast_value: z.number().min(0, 'Forecast value must be non-negative'),
  confidence_interval_lower: z.number().optional(),
  confidence_interval_upper: z.number().optional(),
  confidence_score: z.number().min(0).max(1).optional(),
  external_factors: z.record(z.any()).default({}),
  prediction_metadata: z.record(z.any()).default({}),
});

export const updateDemandPredictionRequestSchema = z.object({
  forecast_value: z.number().min(0).optional(),
  confidence_interval_lower: z.number().optional(),
  confidence_interval_upper: z.number().optional(),
  confidence_score: z.number().min(0).max(1).optional(),
  external_factors: z.record(z.any()).optional(),
  prediction_metadata: z.record(z.any()).optional(),
});

export const createForecastAccuracyRequestSchema = z.object({
  prediction_id: z.string().uuid(),
  model_id: z.string().uuid(),
  actual_value: z.number().min(0, 'Actual value must be non-negative'),
  evaluation_date: z.string(),
  evaluation_notes: z.string().optional(),
});

export const createDemandAlertRequestSchema = z.object({
  alert_type: z.enum([
    'demand_spike',
    'capacity_constraint',
    'anomaly_detected',
    'low_accuracy',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  title: z.string().min(1, 'Alert title is required').max(200),
  description: z.string().min(1, 'Alert description is required'),
  prediction_data: z.record(z.any()).default({}),
  threshold_exceeded: z.record(z.any()).optional(),
  recommended_actions: z.array(z.string()).default([]),
});

export const updateDemandAlertRequestSchema = z.object({
  acknowledged: z.boolean().optional(),
  acknowledged_by: z.string().uuid().optional(),
  resolution_status: z
    .enum(['open', 'in_progress', 'resolved', 'dismissed'])
    .optional(),
  resolution_notes: z.string().optional(),
});

export const updateForecastingSettingsRequestSchema = z.object({
  accuracy_threshold: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .refine((val) => {
      if (val !== undefined && val < 0.85) {
        throw new Error('Accuracy threshold must be at least 85% (0.8500)');
      }
      return true;
    }, 'Accuracy threshold must be at least 85%'),
  retraining_frequency_days: z.number().min(1).max(365).optional(),
  prediction_horizon_days: z.number().min(1).max(365).optional(),
  alert_thresholds: z.record(z.any()).optional(),
  model_preferences: z.record(z.any()).optional(),
  external_data_sources: z.record(z.any()).optional(),
  auto_retrain_enabled: z.boolean().optional(),
  auto_alerts_enabled: z.boolean().optional(),
  settings_metadata: z.record(z.any()).optional(),
});

export const createModelTrainingRequestSchema = z.object({
  model_id: z.string().uuid(),
  training_start: z.string(),
  training_parameters: z.record(z.any()).default({}),
});

export const updateModelTrainingRequestSchema = z.object({
  training_end: z.string().optional(),
  training_status: z.enum(['in_progress', 'completed', 'failed']).optional(),
  training_accuracy: z.number().min(0).max(1).optional(),
  validation_accuracy: z.number().min(0).max(1).optional(),
  training_data_size: z.number().min(0).optional(),
  training_metrics: z.record(z.any()).optional(),
  error_message: z.string().optional(),
  model_artifacts: z.record(z.any()).optional(),
});

export const createResourceOptimizationRequestSchema = z.object({
  recommendation_type: z.enum([
    'staff_scheduling',
    'equipment_allocation',
    'capacity_planning',
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  prediction_basis: z.record(z.any()),
  recommended_changes: z.record(z.any()),
  estimated_impact: z.record(z.any()).default({}),
  implementation_timeline: z.string().optional(),
  cost_benefit_analysis: z.record(z.any()).default({}),
});

export const updateResourceOptimizationRequestSchema = z.object({
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  recommended_changes: z.record(z.any()).optional(),
  estimated_impact: z.record(z.any()).optional(),
  implementation_timeline: z.string().optional(),
  implementation_status: z
    .enum(['pending', 'approved', 'implemented', 'rejected'])
    .optional(),
  cost_benefit_analysis: z.record(z.any()).optional(),
  implementation_notes: z.string().optional(),
  approved_by: z.string().uuid().optional(),
  implemented_by: z.string().uuid().optional(),
});

// Query parameter validation schemas

export const forecastingFiltersSchema = z.object({
  model_type: z
    .enum([
      'appointment_demand',
      'treatment_demand',
      'seasonal',
      'resource_utilization',
    ])
    .optional(),
  status: z.enum(['active', 'training', 'deprecated', 'failed']).optional(),
  accuracy_min: z.number().min(0).max(1).optional(),
  accuracy_max: z.number().min(0).max(1).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  category: z
    .enum([
      'appointments',
      'specific_treatment',
      'staff_hours',
      'equipment_usage',
    ])
    .optional(),
  forecast_period: z
    .enum(['daily', 'weekly', 'monthly', 'quarterly'])
    .optional(),
  alert_type: z
    .enum([
      'demand_spike',
      'capacity_constraint',
      'anomaly_detected',
      'low_accuracy',
    ])
    .optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  resolution_status: z
    .enum(['open', 'in_progress', 'resolved', 'dismissed'])
    .optional(),
});

export const predictionFiltersSchema = z.object({
  model_id: z.string().uuid().optional(),
  category: z
    .enum([
      'appointments',
      'specific_treatment',
      'staff_hours',
      'equipment_usage',
    ])
    .optional(),
  forecast_period: z
    .enum(['daily', 'weekly', 'monthly', 'quarterly'])
    .optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  confidence_min: z.number().min(0).max(1).optional(),
});

export const accuracyFiltersSchema = z.object({
  model_id: z.string().uuid().optional(),
  accuracy_min: z.number().min(0).max(1).optional(),
  accuracy_max: z.number().min(0).max(1).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

// Response validation schemas

export const forecastingApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  metadata: z
    .object({
      total_count: z.number().optional(),
      page: z.number().optional(),
      per_page: z.number().optional(),
      accuracy_summary: z
        .object({
          average_accuracy: z.number(),
          models_above_threshold: z.number(),
          total_models: z.number(),
        })
        .optional(),
    })
    .optional(),
});

// Specialized validation for accuracy requirements
export const accuracyRequirementSchema = z.object({
  accuracy_score: z
    .number()
    .min(0.85, 'Model accuracy must be at least 85% (0.8500)')
    .max(1),
});

// Model performance validation
export const modelPerformanceSchema = z.object({
  model_id: z.string().uuid(),
  current_accuracy: z.number().min(0).max(1),
  meets_threshold: z.boolean(),
  requires_retraining: z.boolean(),
  last_evaluation: z.string(),
  recommendation: z.string(),
});

// Training validation with accuracy requirements
export const trainingValidationSchema = z.object({
  training_accuracy: z
    .number()
    .min(0.85, 'Training accuracy must be at least 85%')
    .max(1),
  validation_accuracy: z
    .number()
    .min(0.85, 'Validation accuracy must be at least 85%')
    .max(1),
  accuracy_improvement: z.number(),
  meets_requirements: z.boolean(),
});

// Export type inference
export type ForecastingModel = z.infer<typeof forecastingModelSchema>;
export type DemandPrediction = z.infer<typeof demandPredictionSchema>;
export type ForecastAccuracy = z.infer<typeof forecastAccuracySchema>;
export type DemandAlert = z.infer<typeof demandAlertSchema>;
export type ForecastingSettings = z.infer<typeof forecastingSettingsSchema>;
export type ModelTrainingHistory = z.infer<typeof modelTrainingHistorySchema>;
export type ResourceOptimizationRecommendation = z.infer<
  typeof resourceOptimizationRecommendationSchema
>;

export type CreateForecastingModelRequest = z.infer<
  typeof createForecastingModelRequestSchema
>;
export type UpdateForecastingModelRequest = z.infer<
  typeof updateForecastingModelRequestSchema
>;
export type CreateDemandPredictionRequest = z.infer<
  typeof createDemandPredictionRequestSchema
>;
export type UpdateDemandPredictionRequest = z.infer<
  typeof updateDemandPredictionRequestSchema
>;
export type CreateForecastAccuracyRequest = z.infer<
  typeof createForecastAccuracyRequestSchema
>;
export type CreateDemandAlertRequest = z.infer<
  typeof createDemandAlertRequestSchema
>;
export type UpdateDemandAlertRequest = z.infer<
  typeof updateDemandAlertRequestSchema
>;
export type UpdateForecastingSettingsRequest = z.infer<
  typeof updateForecastingSettingsRequestSchema
>;
export type CreateModelTrainingRequest = z.infer<
  typeof createModelTrainingRequestSchema
>;
export type UpdateModelTrainingRequest = z.infer<
  typeof updateModelTrainingRequestSchema
>;
export type CreateResourceOptimizationRequest = z.infer<
  typeof createResourceOptimizationRequestSchema
>;
export type UpdateResourceOptimizationRequest = z.infer<
  typeof updateResourceOptimizationRequestSchema
>;

export type ForecastingFilters = z.infer<typeof forecastingFiltersSchema>;
export type PredictionFilters = z.infer<typeof predictionFiltersSchema>;
export type AccuracyFilters = z.infer<typeof accuracyFiltersSchema>;
