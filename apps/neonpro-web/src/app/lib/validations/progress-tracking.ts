// Story 10.2: Progress Tracking through Computer Vision Validation Schemas
// Zod validation schemas for progress tracking system

import { z } from 'zod';

// Base validation schemas
export const progressTrackingSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  session_id: z.string().uuid().optional().nullable(),
  tracking_type: z.enum(['healing', 'aesthetic', 'treatment_response', 'maintenance']),
  progress_score: z.number().min(0).max(100),
  measurement_data: z.record(z.any()).default({}),
  comparison_baseline: z.string().uuid().optional().nullable(),
  tracking_date: z.string().datetime().optional(),
  treatment_area: z.string().min(1).max(100),
  treatment_type: z.string().min(1).max(100),
  visual_annotations: z.record(z.any()).optional().default({}),
  confidence_score: z.number().min(0).max(100).default(0),
  validated_by: z.string().uuid().optional().nullable(),
  validation_status: z.enum(['pending', 'validated', 'rejected', 'manual_review']).default('pending'),
  validation_notes: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid()
});

export const progressMilestoneSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  tracking_id: z.string().uuid().optional().nullable(),
  milestone_type: z.enum(['significant_improvement', 'target_achieved', 'concern_detected', 'treatment_complete']),
  milestone_name: z.string().min(1).max(200),
  achievement_date: z.string().datetime().optional(),
  progress_data: z.record(z.any()).default({}),
  threshold_criteria: z.record(z.any()).default({}),
  achievement_score: z.number().min(0).max(100),
  validation_status: z.enum(['detected', 'confirmed', 'false_positive', 'manually_added']).default('detected'),
  validated_by: z.string().uuid().optional().nullable(),
  validation_notes: z.string().optional(),
  alert_sent: z.boolean().default(false),
  alert_sent_at: z.string().datetime().optional().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid()
});

export const progressPredictionSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  tracking_id: z.string().uuid().optional().nullable(),
  prediction_type: z.enum(['outcome_forecast', 'timeline_prediction', 'risk_assessment']),
  predicted_outcome: z.record(z.any()).default({}),
  confidence_level: z.number().min(0).max(100),
  prediction_date: z.string().datetime().optional(),
  target_date: z.string().datetime().optional().nullable(),
  model_version: z.string().default('v1.0'),
  input_features: z.record(z.any()).default({}),
  actual_outcome: z.record(z.any()).optional().default({}),
  accuracy_score: z.number().min(0).max(100).optional(),
  verified_at: z.string().datetime().optional().nullable(),
  verified_by: z.string().uuid().optional().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid()
});

export const trackingMetricSchema = z.object({
  id: z.string().uuid().optional(),
  treatment_type: z.string().min(1).max(100),
  metric_name: z.string().min(1).max(100),
  metric_category: z.enum(['measurement', 'scoring', 'threshold', 'visualization']),
  measurement_method: z.enum(['cv_analysis', 'manual_measurement', 'hybrid']),
  normal_ranges: z.record(z.any()).default({}),
  improvement_thresholds: z.record(z.any()).default({}),
  calculation_formula: z.string().optional(),
  unit_of_measurement: z.string().max(50).optional(),
  is_active: z.boolean().default(true),
  display_order: z.number().default(0),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid()
});

export const multiSessionAnalysisSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  analysis_name: z.string().min(1).max(200),
  session_ids: z.array(z.string().uuid()).min(2),
  tracking_ids: z.array(z.string().uuid()).min(2),
  comparison_type: z.enum(['timeline_progression', 'treatment_effectiveness', 'side_by_side']),
  analysis_period: z.string(), // PostgreSQL interval
  progression_score: z.number().min(0).max(100),
  trend_direction: z.enum(['improving', 'stable', 'declining', 'mixed']),
  statistical_significance: z.number().min(0).max(100).optional(),
  analysis_data: z.record(z.any()).default({}),
  visualization_config: z.record(z.any()).optional().default({}),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid()
});

export const progressAlertSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  tracking_id: z.string().uuid().optional().nullable(),
  milestone_id: z.string().uuid().optional().nullable(),
  alert_type: z.enum(['milestone_achieved', 'concern_detected', 'threshold_exceeded', 'prediction_update']),
  alert_priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  alert_title: z.string().min(1).max(200),
  alert_message: z.string().min(1),
  alert_data: z.record(z.any()).optional().default({}),
  recipient_type: z.enum(['patient', 'provider', 'both']),
  is_read: z.boolean().default(false),
  read_at: z.string().datetime().optional().nullable(),
  read_by: z.string().uuid().optional().nullable(),
  action_required: z.boolean().default(false),
  action_taken: z.boolean().default(false),
  action_notes: z.string().optional(),
  expires_at: z.string().datetime().optional().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid()
});

// API request validation schemas
export const createProgressTrackingRequestSchema = z.object({
  patient_id: z.string().uuid(),
  session_id: z.string().uuid().optional(),
  tracking_type: z.enum(['healing', 'aesthetic', 'treatment_response', 'maintenance']),
  progress_score: z.number().min(0).max(100),
  measurement_data: z.record(z.any()).default({}),
  comparison_baseline: z.string().uuid().optional(),
  treatment_area: z.string().min(1).max(100),
  treatment_type: z.string().min(1).max(100),
  visual_annotations: z.record(z.any()).optional().default({}),
  confidence_score: z.number().min(0).max(100).default(0)
});

export const updateProgressTrackingRequestSchema = z.object({
  progress_score: z.number().min(0).max(100).optional(),
  measurement_data: z.record(z.any()).optional(),
  visual_annotations: z.record(z.any()).optional(),
  confidence_score: z.number().min(0).max(100).optional(),
  validation_status: z.enum(['pending', 'validated', 'rejected', 'manual_review']).optional(),
  validation_notes: z.string().optional()
});

export const createProgressMilestoneRequestSchema = z.object({
  patient_id: z.string().uuid(),
  tracking_id: z.string().uuid().optional(),
  milestone_type: z.enum(['significant_improvement', 'target_achieved', 'concern_detected', 'treatment_complete']),
  milestone_name: z.string().min(1).max(200),
  progress_data: z.record(z.any()).default({}),
  threshold_criteria: z.record(z.any()).default({}),
  achievement_score: z.number().min(0).max(100)
});

export const createProgressPredictionRequestSchema = z.object({
  patient_id: z.string().uuid(),
  tracking_id: z.string().uuid().optional(),
  prediction_type: z.enum(['outcome_forecast', 'timeline_prediction', 'risk_assessment']),
  predicted_outcome: z.record(z.any()).default({}),
  confidence_level: z.number().min(0).max(100),
  target_date: z.string().datetime().optional(),
  model_version: z.string().default('v1.0'),
  input_features: z.record(z.any()).default({})
});

export const createMultiSessionAnalysisRequestSchema = z.object({
  patient_id: z.string().uuid(),
  analysis_name: z.string().min(1).max(200),
  session_ids: z.array(z.string().uuid()).min(2),
  tracking_ids: z.array(z.string().uuid()).min(2),
  comparison_type: z.enum(['timeline_progression', 'treatment_effectiveness', 'side_by_side']),
  analysis_period: z.string() // PostgreSQL interval format
});

export const createProgressAlertRequestSchema = z.object({
  patient_id: z.string().uuid(),
  tracking_id: z.string().uuid().optional(),
  milestone_id: z.string().uuid().optional(),
  alert_type: z.enum(['milestone_achieved', 'concern_detected', 'threshold_exceeded', 'prediction_update']),
  alert_priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  alert_title: z.string().min(1).max(200),
  alert_message: z.string().min(1),
  alert_data: z.record(z.any()).optional().default({}),
  recipient_type: z.enum(['patient', 'provider', 'both']),
  action_required: z.boolean().default(false),
  expires_at: z.string().datetime().optional()
});

export const trackingMetricRequestSchema = z.object({
  treatment_type: z.string().min(1).max(100),
  metric_name: z.string().min(1).max(100),
  metric_category: z.enum(['measurement', 'scoring', 'threshold', 'visualization']),
  measurement_method: z.enum(['cv_analysis', 'manual_measurement', 'hybrid']),
  normal_ranges: z.record(z.any()).default({}),
  improvement_thresholds: z.record(z.any()).default({}),
  calculation_formula: z.string().optional(),
  unit_of_measurement: z.string().max(50).optional(),
  display_order: z.number().default(0)
});

// Filter validation schemas
export const progressTrackingFiltersSchema = z.object({
  patient_id: z.string().uuid().optional(),
  tracking_type: z.enum(['healing', 'aesthetic', 'treatment_response', 'maintenance']).optional(),
  treatment_type: z.string().optional(),
  treatment_area: z.string().optional(),
  validation_status: z.enum(['pending', 'validated', 'rejected', 'manual_review']).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  min_progress_score: z.number().min(0).max(100).optional(),
  max_progress_score: z.number().min(0).max(100).optional(),
  min_confidence: z.number().min(0).max(100).optional(),
  has_milestones: z.boolean().optional(),
  has_predictions: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

export const progressMilestoneFiltersSchema = z.object({
  patient_id: z.string().uuid().optional(),
  milestone_type: z.enum(['significant_improvement', 'target_achieved', 'concern_detected', 'treatment_complete']).optional(),
  validation_status: z.enum(['detected', 'confirmed', 'false_positive', 'manually_added']).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  alert_sent: z.boolean().optional(),
  min_achievement_score: z.number().min(0).max(100).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

export const progressAlertFiltersSchema = z.object({
  patient_id: z.string().uuid().optional(),
  alert_type: z.enum(['milestone_achieved', 'concern_detected', 'threshold_exceeded', 'prediction_update']).optional(),
  alert_priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  recipient_type: z.enum(['patient', 'provider', 'both']).optional(),
  is_read: z.boolean().optional(),
  action_required: z.boolean().optional(),
  action_taken: z.boolean().optional(),
  expires_before: z.string().datetime().optional(),
  expires_after: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

// Computer vision analysis validation schemas
export const cvProgressAnalysisSchema = z.object({
  measurement_id: z.string().uuid(),
  analysis_type: z.enum(['healing', 'aesthetic', 'treatment_response', 'maintenance']),
  regions_of_interest: z.array(z.object({
    id: z.string(),
    coordinates: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number()
    }),
    confidence: z.number().min(0).max(100),
    measurements: z.record(z.number())
  })),
  overall_score: z.number().min(0).max(100),
  confidence_score: z.number().min(0).max(100),
  comparison_data: z.object({
    baseline_id: z.string().uuid(),
    improvement_percentage: z.number(),
    change_areas: z.array(z.string())
  }).optional(),
  quality_indicators: z.object({
    image_quality: z.number().min(0).max(100),
    lighting_conditions: z.number().min(0).max(100),
    angle_consistency: z.number().min(0).max(100),
    focus_score: z.number().min(0).max(100)
  }),
  annotations: z.array(z.object({
    type: z.enum(['measurement', 'highlight', 'annotation']),
    coordinates: z.object({
      x: z.number(),
      y: z.number()
    }),
    data: z.record(z.any())
  }))
});

export const progressVisualizationConfigSchema = z.object({
  chart_type: z.enum(['line', 'bar', 'area', 'scatter', 'heatmap']),
  time_range: z.enum(['week', 'month', 'quarter', 'year', 'all']),
  metrics: z.array(z.string()),
  show_predictions: z.boolean().default(false),
  show_milestones: z.boolean().default(true),
  show_confidence_intervals: z.boolean().default(false),
  group_by: z.enum(['treatment_type', 'treatment_area', 'tracking_type']).optional(),
  colors: z.record(z.string()).optional()
});

// Batch operation validation schemas
export const batchProgressTrackingSchema = z.object({
  trackings: z.array(createProgressTrackingRequestSchema).min(1).max(50)
});

export const batchMilestoneValidationSchema = z.object({
  milestone_ids: z.array(z.string().uuid()).min(1).max(20),
  validation_status: z.enum(['confirmed', 'false_positive']),
  validation_notes: z.string().optional()
});

export const batchAlertActionSchema = z.object({
  alert_ids: z.array(z.string().uuid()).min(1).max(50),
  action: z.enum(['mark_read', 'mark_unread', 'mark_action_taken', 'delete']),
  action_notes: z.string().optional()
});

// Dashboard and analytics validation schemas
export const progressDashboardRequestSchema = z.object({
  patient_id: z.string().uuid().optional(),
  treatment_type: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  include_predictions: z.boolean().default(true),
  include_alerts: z.boolean().default(true)
});

export const trendAnalysisRequestSchema = z.object({
  patient_id: z.string().uuid(),
  treatment_type: z.string().optional(),
  treatment_area: z.string().optional(),
  tracking_type: z.enum(['healing', 'aesthetic', 'treatment_response', 'maintenance']).optional(),
  time_range: z.enum(['week', 'month', 'quarter', 'year', 'all']).default('month'),
  include_predictions: z.boolean().default(true)
});

// Export grouped validation schemas for easy import
export const validationSchemas = {
  // Core schemas
  progressTracking: progressTrackingSchema,
  progressMilestone: progressMilestoneSchema,
  progressPrediction: progressPredictionSchema,
  trackingMetric: trackingMetricSchema,
  multiSessionAnalysis: multiSessionAnalysisSchema,
  progressAlert: progressAlertSchema,

  // Request schemas
  createProgressTracking: createProgressTrackingRequestSchema,
  updateProgressTracking: updateProgressTrackingRequestSchema,
  createProgressMilestone: createProgressMilestoneRequestSchema,
  createProgressPrediction: createProgressPredictionRequestSchema,
  createMultiSessionAnalysis: createMultiSessionAnalysisRequestSchema,
  createProgressAlert: createProgressAlertRequestSchema,
  trackingMetricRequest: trackingMetricRequestSchema,

  // Filter schemas
  progressTrackingFilters: progressTrackingFiltersSchema,
  progressMilestoneFilters: progressMilestoneFiltersSchema,
  progressAlertFilters: progressAlertFiltersSchema,

  // CV analysis schemas
  cvProgressAnalysis: cvProgressAnalysisSchema,
  progressVisualizationConfig: progressVisualizationConfigSchema,

  // Batch operation schemas
  batchProgressTracking: batchProgressTrackingSchema,
  batchMilestoneValidation: batchMilestoneValidationSchema,
  batchAlertAction: batchAlertActionSchema,

  // Dashboard schemas
  progressDashboardRequest: progressDashboardRequestSchema,
  trendAnalysisRequest: trendAnalysisRequestSchema
};

export default validationSchemas;
