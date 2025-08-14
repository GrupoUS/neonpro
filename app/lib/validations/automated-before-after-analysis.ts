// app/lib/validations/automated-before-after-analysis.ts
// Validation schemas for Story 10.1: Automated Before/After Analysis

import { z } from "zod";

// Base validation schemas
export const analysisEngineConfigSchema = z.object({
  id: z.string().uuid().optional(),
  engine_name: z.string().min(1).max(100),
  model_version: z.string().min(1).max(50),
  accuracy_threshold: z.number().min(0).max(100).default(95.0),
  processing_timeout_seconds: z.number().int().min(1).max(300).default(30),
  feature_extraction_config: z.record(z.any()).optional(),
  measurement_metrics: z.record(z.any()).optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const photoAnalysisSessionSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  treatment_type: z.string().max(100).optional(),
  session_name: z.string().max(255).optional(),
  analysis_type: z.enum(['before_after', 'progress_tracking', 'treatment_validation']),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'queued']).default('pending'),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
  processing_time_seconds: z.number().int().positive().optional(),
  total_photos: z.number().int().min(0).default(0),
  processed_photos: z.number().int().min(0).default(0),
  accuracy_score: z.number().min(0).max(100).optional(),
  confidence_level: z.number().min(0).max(100).optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const beforeAfterPhotoPairSchema = z.object({
  id: z.string().uuid().optional(),
  session_id: z.string().uuid(),
  before_photo_id: z.string().uuid().optional(),
  after_photo_id: z.string().uuid().optional(),
  treatment_area: z.string().max(100).optional(),
  pair_type: z.enum(['frontal', 'profile', 'close_up', 'full_body', 'specific_area']),
  time_between_days: z.number().int().min(0).optional(),
  analysis_status: z.enum(['pending', 'analyzed', 'failed', 'manual_review']).default('pending'),
  improvement_percentage: z.number().min(0).max(100).optional(),
  comparison_score: z.number().min(0).max(100).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const imageAnalysisResultSchema = z.object({
  id: z.string().uuid().optional(),
  photo_pair_id: z.string().uuid(),
  analysis_engine: z.string().min(1).max(100),
  analysis_timestamp: z.string().datetime().optional(),
  processing_time_ms: z.number().int().positive().optional(),
  feature_vectors: z.record(z.any()).optional(),
  measurement_data: z.record(z.any()).optional(),
  change_detection: z.record(z.any()).optional(),
  quality_metrics: z.record(z.any()).optional(),
  annotations: z.record(z.any()).optional(),
  confidence_scores: z.record(z.any()).optional(),
  raw_analysis_data: z.record(z.any()).optional(),
  created_at: z.string().datetime().optional(),
});

export const measurementMetricSchema = z.object({
  id: z.string().uuid().optional(),
  metric_name: z.string().min(1).max(100),
  metric_type: z.enum(['distance', 'area', 'volume', 'angle', 'texture', 'color', 'symmetry']),
  measurement_unit: z.string().max(20).optional(),
  calculation_method: z.string().max(100).optional(),
  accuracy_weight: z.number().min(0).max(10).default(1.0),
  is_active: z.boolean().default(true),
  description: z.string().optional(),
  validation_rules: z.record(z.any()).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const treatmentAreaSchema = z.object({
  id: z.string().uuid().optional(),
  area_name: z.string().min(1).max(100),
  area_category: z.enum(['facial', 'body', 'specific', 'surgical', 'cosmetic']),
  anatomical_region: z.string().max(100).optional(),
  measurement_points: z.record(z.any()).optional(),
  standard_views: z.record(z.any()).optional(),
  analysis_parameters: z.record(z.any()).optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const visualAnnotationSchema = z.object({
  id: z.string().uuid().optional(),
  analysis_result_id: z.string().uuid(),
  annotation_type: z.enum(['highlight', 'measurement', 'comparison', 'change_area', 'improvement_zone']),
  coordinates: z.record(z.any()),
  annotation_data: z.record(z.any()).optional(),
  style_properties: z.record(z.any()).optional(),
  description: z.string().optional(),
  is_visible: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
});

export const analysisReportSchema = z.object({
  id: z.string().uuid().optional(),
  session_id: z.string().uuid(),
  report_type: z.enum(['summary', 'detailed', 'patient_consultation', 'clinical', 'research']),
  report_title: z.string().max(255).optional(),
  generated_at: z.string().datetime().optional(),
  report_data: z.record(z.any()).optional(),
  export_formats: z.record(z.any()).optional(),
  template_used: z.string().max(100).optional(),
  generated_by: z.string().uuid().optional(),
  is_public: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
});

export const qualityValidationSchema = z.object({
  id: z.string().uuid().optional(),
  analysis_result_id: z.string().uuid(),
  validation_type: z.enum(['automated', 'manual', 'peer_review', 'expert_validation']),
  validator_id: z.string().uuid().optional(),
  validation_status: z.enum(['pending', 'approved', 'rejected', 'needs_review']).default('pending'),
  accuracy_assessment: z.number().min(0).max(100).optional(),
  quality_score: z.number().min(0).max(100).optional(),
  validation_notes: z.string().optional(),
  validation_data: z.record(z.any()).optional(),
  validated_at: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
});

export const mlModelTrainingSchema = z.object({
  id: z.string().uuid().optional(),
  model_name: z.string().min(1).max(100),
  model_version: z.string().min(1).max(50),
  training_dataset_size: z.number().int().positive().optional(),
  validation_dataset_size: z.number().int().positive().optional(),
  training_start: z.string().datetime().optional(),
  training_end: z.string().datetime().optional(),
  accuracy_achieved: z.number().min(0).max(100).optional(),
  precision_score: z.number().min(0).max(100).optional(),
  recall_score: z.number().min(0).max(100).optional(),
  f1_score: z.number().min(0).max(100).optional(),
  training_parameters: z.record(z.any()).optional(),
  model_weights_path: z.string().optional(),
  deployment_status: z.enum(['training', 'completed', 'deployed', 'archived']).default('training'),
  performance_metrics: z.record(z.any()).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// API Request validation schemas
export const createAnalysisSessionRequestSchema = z.object({
  patient_id: z.string().uuid(),
  treatment_type: z.string().max(100).optional(),
  session_name: z.string().max(255).optional(),
  analysis_type: z.enum(['before_after', 'progress_tracking', 'treatment_validation']),
});

export const createPhotoPairRequestSchema = z.object({
  session_id: z.string().uuid(),
  before_photo_id: z.string().uuid().optional(),
  after_photo_id: z.string().uuid().optional(),
  treatment_area: z.string().max(100).optional(),
  pair_type: z.enum(['frontal', 'profile', 'close_up', 'full_body', 'specific_area']),
  time_between_days: z.number().int().min(0).optional(),
});

export const startAnalysisRequestSchema = z.object({
  session_id: z.string().uuid(),
  engine_config_id: z.string().uuid().optional(),
  analysis_parameters: z.record(z.any()).optional(),
});

export const comparisonAnalysisRequestSchema = z.object({
  photo_pair_id: z.string().uuid(),
  measurement_metrics: z.array(z.string()).optional(),
  treatment_areas: z.array(z.string()).optional(),
  quality_threshold: z.number().min(0).max(100).optional(),
});

export const generateReportRequestSchema = z.object({
  session_id: z.string().uuid(),
  report_type: z.enum(['summary', 'detailed', 'patient_consultation', 'clinical', 'research']),
  template_options: z.record(z.any()).optional(),
  include_sections: z.array(z.string()).optional(),
  export_format: z.enum(['pdf', 'html', 'json']).default('html'),
});

export const batchAnalysisRequestSchema = z.object({
  session_ids: z.array(z.string().uuid()).min(1),
  analysis_parameters: z.record(z.any()).optional(),
  priority_level: z.enum(['low', 'normal', 'high']).default('normal'),
});

export const modelTrainingRequestSchema = z.object({
  model_name: z.string().min(1).max(100),
  training_dataset_path: z.string().min(1),
  validation_dataset_path: z.string().min(1),
  training_parameters: z.record(z.any()),
  target_accuracy: z.number().min(90).max(100),
});

export const accuracyValidationRequestSchema = z.object({
  analysis_result_id: z.string().uuid(),
  ground_truth_data: z.record(z.any()).optional(),
  validation_type: z.enum(['automated', 'manual', 'peer_review', 'expert_validation']),
  validator_notes: z.string().optional(),
});

export const annotationCreateRequestSchema = z.object({
  analysis_result_id: z.string().uuid(),
  annotation_type: z.enum(['highlight', 'measurement', 'comparison', 'change_area', 'improvement_zone']),
  coordinates: z.record(z.any()),
  annotation_data: z.record(z.any()).optional(),
  style_properties: z.record(z.any()).optional(),
  description: z.string().optional(),
});

// Filter validation schemas
export const analysisSessionFiltersSchema = z.object({
  patient_id: z.string().uuid().optional(),
  treatment_type: z.string().max(100).optional(),
  analysis_type: z.enum(['before_after', 'progress_tracking', 'treatment_validation']).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'queued']).optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  accuracy_min: z.number().min(0).max(100).optional(),
  created_by: z.string().uuid().optional(),
});

export const photoPairFiltersSchema = z.object({
  session_id: z.string().uuid().optional(),
  treatment_area: z.string().max(100).optional(),
  pair_type: z.enum(['frontal', 'profile', 'close_up', 'full_body', 'specific_area']).optional(),
  analysis_status: z.enum(['pending', 'analyzed', 'failed', 'manual_review']).optional(),
  improvement_min: z.number().min(0).max(100).optional(),
  time_between_min: z.number().int().min(0).optional(),
  time_between_max: z.number().int().positive().optional(),
});

export const analysisResultFiltersSchema = z.object({
  photo_pair_id: z.string().uuid().optional(),
  analysis_engine: z.string().max(100).optional(),
  processing_time_max: z.number().int().positive().optional(),
  confidence_min: z.number().min(0).max(100).optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
});

export const reportFiltersSchema = z.object({
  session_id: z.string().uuid().optional(),
  report_type: z.enum(['summary', 'detailed', 'patient_consultation', 'clinical', 'research']).optional(),
  generated_by: z.string().uuid().optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  is_public: z.boolean().optional(),
});

// Update validation schemas
export const updateAnalysisSessionSchema = photoAnalysisSessionSchema.partial().omit({ 
  id: true, 
  created_at: true 
});

export const updatePhotoPairSchema = beforeAfterPhotoPairSchema.partial().omit({ 
  id: true, 
  created_at: true 
});

export const updateAnalysisEngineConfigSchema = analysisEngineConfigSchema.partial().omit({ 
  id: true, 
  created_at: true 
});

export const updateMeasurementMetricSchema = measurementMetricSchema.partial().omit({ 
  id: true, 
  created_at: true 
});

export const updateTreatmentAreaSchema = treatmentAreaSchema.partial().omit({ 
  id: true, 
  created_at: true 
});

export const updateMLModelTrainingSchema = mlModelTrainingSchema.partial().omit({ 
  id: true, 
  created_at: true 
});

// Pagination and sorting schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export const analysisSessionSortSchema = z.object({
  sort_by: z.enum([
    'created_at', 
    'updated_at', 
    'started_at', 
    'completed_at',
    'accuracy_score',
    'processing_time_seconds',
    'session_name'
  ]).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export const photoPairSortSchema = z.object({
  sort_by: z.enum([
    'created_at', 
    'updated_at', 
    'improvement_percentage',
    'comparison_score',
    'time_between_days',
    'analysis_status'
  ]).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Bulk operation schemas
export const bulkUpdateAnalysisSessionSchema = z.object({
  session_ids: z.array(z.string().uuid()).min(1),
  updates: updateAnalysisSessionSchema,
});

export const bulkUpdatePhotoPairSchema = z.object({
  pair_ids: z.array(z.string().uuid()).min(1),
  updates: updatePhotoPairSchema,
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  confirm: z.boolean().refine(val => val === true, {
    message: "Confirmation required for bulk delete operation"
  }),
});

// Export validation schemas with proper error handling
export const validationSchemas = {
  analysisEngineConfig: analysisEngineConfigSchema,
  photoAnalysisSession: photoAnalysisSessionSchema,
  beforeAfterPhotoPair: beforeAfterPhotoPairSchema,
  imageAnalysisResult: imageAnalysisResultSchema,
  measurementMetric: measurementMetricSchema,
  treatmentArea: treatmentAreaSchema,
  visualAnnotation: visualAnnotationSchema,
  analysisReport: analysisReportSchema,
  qualityValidation: qualityValidationSchema,
  mlModelTraining: mlModelTrainingSchema,
  
  // Request schemas
  createAnalysisSession: createAnalysisSessionRequestSchema,
  createPhotoPair: createPhotoPairRequestSchema,
  startAnalysis: startAnalysisRequestSchema,
  comparisonAnalysis: comparisonAnalysisRequestSchema,
  generateReport: generateReportRequestSchema,
  batchAnalysis: batchAnalysisRequestSchema,
  modelTraining: modelTrainingRequestSchema,
  accuracyValidation: accuracyValidationRequestSchema,
  annotationCreate: annotationCreateRequestSchema,
  
  // Filter schemas
  analysisSessionFilters: analysisSessionFiltersSchema,
  photoPairFilters: photoPairFiltersSchema,
  analysisResultFilters: analysisResultFiltersSchema,
  reportFilters: reportFiltersSchema,
  
  // Update schemas
  updateAnalysisSession: updateAnalysisSessionSchema,
  updatePhotoPair: updatePhotoPairSchema,
  updateAnalysisEngineConfig: updateAnalysisEngineConfigSchema,
  updateMeasurementMetric: updateMeasurementMetricSchema,
  updateTreatmentArea: updateTreatmentAreaSchema,
  updateMLModelTraining: updateMLModelTrainingSchema,
  
  // Utility schemas
  pagination: paginationSchema,
  analysisSessionSort: analysisSessionSortSchema,
  photoPairSort: photoPairSortSchema,
  bulkUpdateAnalysisSession: bulkUpdateAnalysisSessionSchema,
  bulkUpdatePhotoPair: bulkUpdatePhotoPairSchema,
  bulkDelete: bulkDeleteSchema,
} as const;
