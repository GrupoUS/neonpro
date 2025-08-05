"use strict";
// app/lib/validations/automated-before-after-analysis.ts
// Validation schemas for Story 10.1: Automated Before/After Analysis
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchemas =
  exports.bulkDeleteSchema =
  exports.bulkUpdatePhotoPairSchema =
  exports.bulkUpdateAnalysisSessionSchema =
  exports.photoPairSortSchema =
  exports.analysisSessionSortSchema =
  exports.paginationSchema =
  exports.updateMLModelTrainingSchema =
  exports.updateTreatmentAreaSchema =
  exports.updateMeasurementMetricSchema =
  exports.updateAnalysisEngineConfigSchema =
  exports.updatePhotoPairSchema =
  exports.updateAnalysisSessionSchema =
  exports.reportFiltersSchema =
  exports.analysisResultFiltersSchema =
  exports.photoPairFiltersSchema =
  exports.analysisSessionFiltersSchema =
  exports.annotationCreateRequestSchema =
  exports.accuracyValidationRequestSchema =
  exports.modelTrainingRequestSchema =
  exports.batchAnalysisRequestSchema =
  exports.generateReportRequestSchema =
  exports.comparisonAnalysisRequestSchema =
  exports.startAnalysisRequestSchema =
  exports.createPhotoPairRequestSchema =
  exports.createAnalysisSessionRequestSchema =
  exports.mlModelTrainingSchema =
  exports.qualityValidationSchema =
  exports.analysisReportSchema =
  exports.visualAnnotationSchema =
  exports.treatmentAreaSchema =
  exports.measurementMetricSchema =
  exports.imageAnalysisResultSchema =
  exports.beforeAfterPhotoPairSchema =
  exports.photoAnalysisSessionSchema =
  exports.analysisEngineConfigSchema =
    void 0;
var zod_1 = require("zod");
// Base validation schemas
exports.analysisEngineConfigSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  engine_name: zod_1.z.string().min(1).max(100),
  model_version: zod_1.z.string().min(1).max(50),
  accuracy_threshold: zod_1.z.number().min(0).max(100).default(95.0),
  processing_timeout_seconds: zod_1.z.number().int().min(1).max(300).default(30),
  feature_extraction_config: zod_1.z.record(zod_1.z.any()).optional(),
  measurement_metrics: zod_1.z.record(zod_1.z.any()).optional(),
  is_active: zod_1.z.boolean().default(true),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
});
exports.photoAnalysisSessionSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  patient_id: zod_1.z.string().uuid(),
  treatment_type: zod_1.z.string().max(100).optional(),
  session_name: zod_1.z.string().max(255).optional(),
  analysis_type: zod_1.z.enum(["before_after", "progress_tracking", "treatment_validation"]),
  status: zod_1.z
    .enum(["pending", "processing", "completed", "failed", "queued"])
    .default("pending"),
  started_at: zod_1.z.string().datetime().optional(),
  completed_at: zod_1.z.string().datetime().optional(),
  processing_time_seconds: zod_1.z.number().int().positive().optional(),
  total_photos: zod_1.z.number().int().min(0).default(0),
  processed_photos: zod_1.z.number().int().min(0).default(0),
  accuracy_score: zod_1.z.number().min(0).max(100).optional(),
  confidence_level: zod_1.z.number().min(0).max(100).optional(),
  created_by: zod_1.z.string().uuid().optional(),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
});
exports.beforeAfterPhotoPairSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  session_id: zod_1.z.string().uuid(),
  before_photo_id: zod_1.z.string().uuid().optional(),
  after_photo_id: zod_1.z.string().uuid().optional(),
  treatment_area: zod_1.z.string().max(100).optional(),
  pair_type: zod_1.z.enum(["frontal", "profile", "close_up", "full_body", "specific_area"]),
  time_between_days: zod_1.z.number().int().min(0).optional(),
  analysis_status: zod_1.z
    .enum(["pending", "analyzed", "failed", "manual_review"])
    .default("pending"),
  improvement_percentage: zod_1.z.number().min(0).max(100).optional(),
  comparison_score: zod_1.z.number().min(0).max(100).optional(),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
});
exports.imageAnalysisResultSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  photo_pair_id: zod_1.z.string().uuid(),
  analysis_engine: zod_1.z.string().min(1).max(100),
  analysis_timestamp: zod_1.z.string().datetime().optional(),
  processing_time_ms: zod_1.z.number().int().positive().optional(),
  feature_vectors: zod_1.z.record(zod_1.z.any()).optional(),
  measurement_data: zod_1.z.record(zod_1.z.any()).optional(),
  change_detection: zod_1.z.record(zod_1.z.any()).optional(),
  quality_metrics: zod_1.z.record(zod_1.z.any()).optional(),
  annotations: zod_1.z.record(zod_1.z.any()).optional(),
  confidence_scores: zod_1.z.record(zod_1.z.any()).optional(),
  raw_analysis_data: zod_1.z.record(zod_1.z.any()).optional(),
  created_at: zod_1.z.string().datetime().optional(),
});
exports.measurementMetricSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  metric_name: zod_1.z.string().min(1).max(100),
  metric_type: zod_1.z.enum([
    "distance",
    "area",
    "volume",
    "angle",
    "texture",
    "color",
    "symmetry",
  ]),
  measurement_unit: zod_1.z.string().max(20).optional(),
  calculation_method: zod_1.z.string().max(100).optional(),
  accuracy_weight: zod_1.z.number().min(0).max(10).default(1.0),
  is_active: zod_1.z.boolean().default(true),
  description: zod_1.z.string().optional(),
  validation_rules: zod_1.z.record(zod_1.z.any()).optional(),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
});
exports.treatmentAreaSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  area_name: zod_1.z.string().min(1).max(100),
  area_category: zod_1.z.enum(["facial", "body", "specific", "surgical", "cosmetic"]),
  anatomical_region: zod_1.z.string().max(100).optional(),
  measurement_points: zod_1.z.record(zod_1.z.any()).optional(),
  standard_views: zod_1.z.record(zod_1.z.any()).optional(),
  analysis_parameters: zod_1.z.record(zod_1.z.any()).optional(),
  is_active: zod_1.z.boolean().default(true),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
});
exports.visualAnnotationSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  analysis_result_id: zod_1.z.string().uuid(),
  annotation_type: zod_1.z.enum([
    "highlight",
    "measurement",
    "comparison",
    "change_area",
    "improvement_zone",
  ]),
  coordinates: zod_1.z.record(zod_1.z.any()),
  annotation_data: zod_1.z.record(zod_1.z.any()).optional(),
  style_properties: zod_1.z.record(zod_1.z.any()).optional(),
  description: zod_1.z.string().optional(),
  is_visible: zod_1.z.boolean().default(true),
  created_at: zod_1.z.string().datetime().optional(),
});
exports.analysisReportSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  session_id: zod_1.z.string().uuid(),
  report_type: zod_1.z.enum([
    "summary",
    "detailed",
    "patient_consultation",
    "clinical",
    "research",
  ]),
  report_title: zod_1.z.string().max(255).optional(),
  generated_at: zod_1.z.string().datetime().optional(),
  report_data: zod_1.z.record(zod_1.z.any()).optional(),
  export_formats: zod_1.z.record(zod_1.z.any()).optional(),
  template_used: zod_1.z.string().max(100).optional(),
  generated_by: zod_1.z.string().uuid().optional(),
  is_public: zod_1.z.boolean().default(false),
  created_at: zod_1.z.string().datetime().optional(),
});
exports.qualityValidationSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  analysis_result_id: zod_1.z.string().uuid(),
  validation_type: zod_1.z.enum(["automated", "manual", "peer_review", "expert_validation"]),
  validator_id: zod_1.z.string().uuid().optional(),
  validation_status: zod_1.z
    .enum(["pending", "approved", "rejected", "needs_review"])
    .default("pending"),
  accuracy_assessment: zod_1.z.number().min(0).max(100).optional(),
  quality_score: zod_1.z.number().min(0).max(100).optional(),
  validation_notes: zod_1.z.string().optional(),
  validation_data: zod_1.z.record(zod_1.z.any()).optional(),
  validated_at: zod_1.z.string().datetime().optional(),
  created_at: zod_1.z.string().datetime().optional(),
});
exports.mlModelTrainingSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  model_name: zod_1.z.string().min(1).max(100),
  model_version: zod_1.z.string().min(1).max(50),
  training_dataset_size: zod_1.z.number().int().positive().optional(),
  validation_dataset_size: zod_1.z.number().int().positive().optional(),
  training_start: zod_1.z.string().datetime().optional(),
  training_end: zod_1.z.string().datetime().optional(),
  accuracy_achieved: zod_1.z.number().min(0).max(100).optional(),
  precision_score: zod_1.z.number().min(0).max(100).optional(),
  recall_score: zod_1.z.number().min(0).max(100).optional(),
  f1_score: zod_1.z.number().min(0).max(100).optional(),
  training_parameters: zod_1.z.record(zod_1.z.any()).optional(),
  model_weights_path: zod_1.z.string().optional(),
  deployment_status: zod_1.z
    .enum(["training", "completed", "deployed", "archived"])
    .default("training"),
  performance_metrics: zod_1.z.record(zod_1.z.any()).optional(),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
});
// API Request validation schemas
exports.createAnalysisSessionRequestSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid(),
  treatment_type: zod_1.z.string().max(100).optional(),
  session_name: zod_1.z.string().max(255).optional(),
  analysis_type: zod_1.z.enum(["before_after", "progress_tracking", "treatment_validation"]),
});
exports.createPhotoPairRequestSchema = zod_1.z.object({
  session_id: zod_1.z.string().uuid(),
  before_photo_id: zod_1.z.string().uuid().optional(),
  after_photo_id: zod_1.z.string().uuid().optional(),
  treatment_area: zod_1.z.string().max(100).optional(),
  pair_type: zod_1.z.enum(["frontal", "profile", "close_up", "full_body", "specific_area"]),
  time_between_days: zod_1.z.number().int().min(0).optional(),
});
exports.startAnalysisRequestSchema = zod_1.z.object({
  session_id: zod_1.z.string().uuid(),
  engine_config_id: zod_1.z.string().uuid().optional(),
  analysis_parameters: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.comparisonAnalysisRequestSchema = zod_1.z.object({
  photo_pair_id: zod_1.z.string().uuid(),
  measurement_metrics: zod_1.z.array(zod_1.z.string()).optional(),
  treatment_areas: zod_1.z.array(zod_1.z.string()).optional(),
  quality_threshold: zod_1.z.number().min(0).max(100).optional(),
});
exports.generateReportRequestSchema = zod_1.z.object({
  session_id: zod_1.z.string().uuid(),
  report_type: zod_1.z.enum([
    "summary",
    "detailed",
    "patient_consultation",
    "clinical",
    "research",
  ]),
  template_options: zod_1.z.record(zod_1.z.any()).optional(),
  include_sections: zod_1.z.array(zod_1.z.string()).optional(),
  export_format: zod_1.z.enum(["pdf", "html", "json"]).default("html"),
});
exports.batchAnalysisRequestSchema = zod_1.z.object({
  session_ids: zod_1.z.array(zod_1.z.string().uuid()).min(1),
  analysis_parameters: zod_1.z.record(zod_1.z.any()).optional(),
  priority_level: zod_1.z.enum(["low", "normal", "high"]).default("normal"),
});
exports.modelTrainingRequestSchema = zod_1.z.object({
  model_name: zod_1.z.string().min(1).max(100),
  training_dataset_path: zod_1.z.string().min(1),
  validation_dataset_path: zod_1.z.string().min(1),
  training_parameters: zod_1.z.record(zod_1.z.any()),
  target_accuracy: zod_1.z.number().min(90).max(100),
});
exports.accuracyValidationRequestSchema = zod_1.z.object({
  analysis_result_id: zod_1.z.string().uuid(),
  ground_truth_data: zod_1.z.record(zod_1.z.any()).optional(),
  validation_type: zod_1.z.enum(["automated", "manual", "peer_review", "expert_validation"]),
  validator_notes: zod_1.z.string().optional(),
});
exports.annotationCreateRequestSchema = zod_1.z.object({
  analysis_result_id: zod_1.z.string().uuid(),
  annotation_type: zod_1.z.enum([
    "highlight",
    "measurement",
    "comparison",
    "change_area",
    "improvement_zone",
  ]),
  coordinates: zod_1.z.record(zod_1.z.any()),
  annotation_data: zod_1.z.record(zod_1.z.any()).optional(),
  style_properties: zod_1.z.record(zod_1.z.any()).optional(),
  description: zod_1.z.string().optional(),
});
// Filter validation schemas
exports.analysisSessionFiltersSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid().optional(),
  treatment_type: zod_1.z.string().max(100).optional(),
  analysis_type: zod_1.z
    .enum(["before_after", "progress_tracking", "treatment_validation"])
    .optional(),
  status: zod_1.z.enum(["pending", "processing", "completed", "failed", "queued"]).optional(),
  date_from: zod_1.z.string().date().optional(),
  date_to: zod_1.z.string().date().optional(),
  accuracy_min: zod_1.z.number().min(0).max(100).optional(),
  created_by: zod_1.z.string().uuid().optional(),
});
exports.photoPairFiltersSchema = zod_1.z.object({
  session_id: zod_1.z.string().uuid().optional(),
  treatment_area: zod_1.z.string().max(100).optional(),
  pair_type: zod_1.z
    .enum(["frontal", "profile", "close_up", "full_body", "specific_area"])
    .optional(),
  analysis_status: zod_1.z.enum(["pending", "analyzed", "failed", "manual_review"]).optional(),
  improvement_min: zod_1.z.number().min(0).max(100).optional(),
  time_between_min: zod_1.z.number().int().min(0).optional(),
  time_between_max: zod_1.z.number().int().positive().optional(),
});
exports.analysisResultFiltersSchema = zod_1.z.object({
  photo_pair_id: zod_1.z.string().uuid().optional(),
  analysis_engine: zod_1.z.string().max(100).optional(),
  processing_time_max: zod_1.z.number().int().positive().optional(),
  confidence_min: zod_1.z.number().min(0).max(100).optional(),
  date_from: zod_1.z.string().date().optional(),
  date_to: zod_1.z.string().date().optional(),
});
exports.reportFiltersSchema = zod_1.z.object({
  session_id: zod_1.z.string().uuid().optional(),
  report_type: zod_1.z
    .enum(["summary", "detailed", "patient_consultation", "clinical", "research"])
    .optional(),
  generated_by: zod_1.z.string().uuid().optional(),
  date_from: zod_1.z.string().date().optional(),
  date_to: zod_1.z.string().date().optional(),
  is_public: zod_1.z.boolean().optional(),
});
// Update validation schemas
exports.updateAnalysisSessionSchema = exports.photoAnalysisSessionSchema.partial().omit({
  id: true,
  created_at: true,
});
exports.updatePhotoPairSchema = exports.beforeAfterPhotoPairSchema.partial().omit({
  id: true,
  created_at: true,
});
exports.updateAnalysisEngineConfigSchema = exports.analysisEngineConfigSchema.partial().omit({
  id: true,
  created_at: true,
});
exports.updateMeasurementMetricSchema = exports.measurementMetricSchema.partial().omit({
  id: true,
  created_at: true,
});
exports.updateTreatmentAreaSchema = exports.treatmentAreaSchema.partial().omit({
  id: true,
  created_at: true,
});
exports.updateMLModelTrainingSchema = exports.mlModelTrainingSchema.partial().omit({
  id: true,
  created_at: true,
});
// Pagination and sorting schemas
exports.paginationSchema = zod_1.z.object({
  page: zod_1.z.number().int().min(1).default(1),
  limit: zod_1.z.number().int().min(1).max(100).default(20),
  sort_by: zod_1.z.string().optional(),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
exports.analysisSessionSortSchema = zod_1.z.object({
  sort_by: zod_1.z
    .enum([
      "created_at",
      "updated_at",
      "started_at",
      "completed_at",
      "accuracy_score",
      "processing_time_seconds",
      "session_name",
    ])
    .default("created_at"),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
exports.photoPairSortSchema = zod_1.z.object({
  sort_by: zod_1.z
    .enum([
      "created_at",
      "updated_at",
      "improvement_percentage",
      "comparison_score",
      "time_between_days",
      "analysis_status",
    ])
    .default("created_at"),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
// Bulk operation schemas
exports.bulkUpdateAnalysisSessionSchema = zod_1.z.object({
  session_ids: zod_1.z.array(zod_1.z.string().uuid()).min(1),
  updates: exports.updateAnalysisSessionSchema,
});
exports.bulkUpdatePhotoPairSchema = zod_1.z.object({
  pair_ids: zod_1.z.array(zod_1.z.string().uuid()).min(1),
  updates: exports.updatePhotoPairSchema,
});
exports.bulkDeleteSchema = zod_1.z.object({
  ids: zod_1.z.array(zod_1.z.string().uuid()).min(1),
  confirm: zod_1.z.boolean().refine(
    function (val) {
      return val === true;
    },
    {
      message: "Confirmation required for bulk delete operation",
    },
  ),
});
// Export validation schemas with proper error handling
exports.validationSchemas = {
  analysisEngineConfig: exports.analysisEngineConfigSchema,
  photoAnalysisSession: exports.photoAnalysisSessionSchema,
  beforeAfterPhotoPair: exports.beforeAfterPhotoPairSchema,
  imageAnalysisResult: exports.imageAnalysisResultSchema,
  measurementMetric: exports.measurementMetricSchema,
  treatmentArea: exports.treatmentAreaSchema,
  visualAnnotation: exports.visualAnnotationSchema,
  analysisReport: exports.analysisReportSchema,
  qualityValidation: exports.qualityValidationSchema,
  mlModelTraining: exports.mlModelTrainingSchema,
  // Request schemas
  createAnalysisSession: exports.createAnalysisSessionRequestSchema,
  createPhotoPair: exports.createPhotoPairRequestSchema,
  startAnalysis: exports.startAnalysisRequestSchema,
  comparisonAnalysis: exports.comparisonAnalysisRequestSchema,
  generateReport: exports.generateReportRequestSchema,
  batchAnalysis: exports.batchAnalysisRequestSchema,
  modelTraining: exports.modelTrainingRequestSchema,
  accuracyValidation: exports.accuracyValidationRequestSchema,
  annotationCreate: exports.annotationCreateRequestSchema,
  // Filter schemas
  analysisSessionFilters: exports.analysisSessionFiltersSchema,
  photoPairFilters: exports.photoPairFiltersSchema,
  analysisResultFilters: exports.analysisResultFiltersSchema,
  reportFilters: exports.reportFiltersSchema,
  // Update schemas
  updateAnalysisSession: exports.updateAnalysisSessionSchema,
  updatePhotoPair: exports.updatePhotoPairSchema,
  updateAnalysisEngineConfig: exports.updateAnalysisEngineConfigSchema,
  updateMeasurementMetric: exports.updateMeasurementMetricSchema,
  updateTreatmentArea: exports.updateTreatmentAreaSchema,
  updateMLModelTraining: exports.updateMLModelTrainingSchema,
  // Utility schemas
  pagination: exports.paginationSchema,
  analysisSessionSort: exports.analysisSessionSortSchema,
  photoPairSort: exports.photoPairSortSchema,
  bulkUpdateAnalysisSession: exports.bulkUpdateAnalysisSessionSchema,
  bulkUpdatePhotoPair: exports.bulkUpdatePhotoPairSchema,
  bulkDelete: exports.bulkDeleteSchema,
};
