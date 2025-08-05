// Validation schemas for Patient Retention Analytics + Predictions
// Story 7.4: Advanced patient retention analytics with predictive modeling
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationStatusSchema =
  exports.UpdateRetentionMetricsSchema =
  exports.UpdateRetentionInterventionSchema =
  exports.UpdateRetentionCampaignAnalyticsSchema =
  exports.UpdatePatientRetentionAnalyticsSchema =
  exports.UpdatePatientChurnPredictionSchema =
  exports.RetentionMetricsSchema =
  exports.RetentionMetricsRequestSchema =
  exports.RetentionInterventionSchema =
  exports.RetentionInterventionRequestSchema =
  exports.RetentionInterventionFormSchema =
  exports.RetentionCampaignAnalyticsSchema =
  exports.RetentionAnalyticsRequestSchema =
  exports.RetentionAnalyticsQuerySchema =
  exports.PatientRetentionAnalyticsSchema =
  exports.PatientChurnPredictionSchema =
  exports.OutcomeSchema =
  exports.ModelTypeSchema =
  exports.InterventionStatusSchema =
  exports.InterventionQuerySchema =
  exports.InterventionChannelSchema =
  exports.DeploymentStatusSchema =
  exports.CreateRetentionMetricsSchema =
  exports.CreateRetentionInterventionSchema =
  exports.CreateRetentionCampaignAnalyticsSchema =
  exports.CreatePatientRetentionAnalyticsSchema =
  exports.CreatePatientChurnPredictionSchema =
  exports.ClinicSizeCategorySchema =
  exports.ChurnRiskLevelSchema =
  exports.ChurnPredictionRequestSchema =
  exports.ChurnPredictionQuerySchema =
  exports.BenchmarkTypeSchema =
    void 0;
var zod_1 = require("zod");
// Base validation schemas
var ChurnRiskLevelSchema = zod_1.z.enum(["low", "medium", "high", "critical"]);
exports.ChurnRiskLevelSchema = ChurnRiskLevelSchema;
var ModelTypeSchema = zod_1.z.enum(["churn_prediction", "ltv_prediction", "retention_scoring"]);
exports.ModelTypeSchema = ModelTypeSchema;
var InterventionChannelSchema = zod_1.z.enum([
  "email",
  "sms",
  "whatsapp",
  "phone",
  "in_person",
  "push",
]);
exports.InterventionChannelSchema = InterventionChannelSchema;
var InterventionStatusSchema = zod_1.z.enum([
  "planned",
  "scheduled",
  "sent",
  "delivered",
  "opened",
  "clicked",
  "responded",
  "failed",
]);
exports.InterventionStatusSchema = InterventionStatusSchema;
var ValidationStatusSchema = zod_1.z.enum(["pending", "validated", "disputed"]);
exports.ValidationStatusSchema = ValidationStatusSchema;
var OutcomeSchema = zod_1.z.enum(["retained", "churned", "unknown"]);
exports.OutcomeSchema = OutcomeSchema;
var DeploymentStatusSchema = zod_1.z.enum(["development", "testing", "production", "deprecated"]);
exports.DeploymentStatusSchema = DeploymentStatusSchema;
var BenchmarkTypeSchema = zod_1.z.enum([
  "retention_rate",
  "churn_rate",
  "ltv",
  "intervention_effectiveness",
]);
exports.BenchmarkTypeSchema = BenchmarkTypeSchema;
var ClinicSizeCategorySchema = zod_1.z.enum(["small", "medium", "large", "enterprise"]);
exports.ClinicSizeCategorySchema = ClinicSizeCategorySchema;
// Core entity schemas
var PatientRetentionAnalyticsSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  patient_id: zod_1.z.string().uuid(),
  retention_score: zod_1.z.number().min(0).max(1),
  churn_risk_level: ChurnRiskLevelSchema,
  churn_probability: zod_1.z.number().min(0).max(1),
  lifetime_value: zod_1.z.number().min(0),
  predicted_ltv: zod_1.z.number().min(0),
  retention_segment: zod_1.z.string().min(1).max(100),
  last_visit_date: zod_1.z.string().datetime().optional(),
  visit_frequency_score: zod_1.z.number().min(0).max(1).default(0),
  engagement_score: zod_1.z.number().min(0).max(1).default(0),
  satisfaction_score: zod_1.z.number().min(0).max(1).default(0),
  financial_score: zod_1.z.number().min(0).max(1).default(0),
  risk_factors: zod_1.z.array(zod_1.z.string()).default([]),
  retention_interventions: zod_1.z
    .array(
      zod_1.z.object({
        intervention_id: zod_1.z.string().uuid(),
        intervention_type: zod_1.z.string().min(1),
        executed_date: zod_1.z.string().datetime(),
        effectiveness_score: zod_1.z.number().min(0).max(1).optional(),
        roi: zod_1.z.number().optional(),
        outcome: zod_1.z.enum(["positive", "neutral", "negative", "unknown"]),
      }),
    )
    .default([]),
  calculation_date: zod_1.z.string().datetime(),
  model_version: zod_1.z.string().min(1).default("v1.0"),
  confidence_level: zod_1.z.number().min(0).max(1).default(0),
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
});
exports.PatientRetentionAnalyticsSchema = PatientRetentionAnalyticsSchema;
var RetentionMetricsSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  clinic_id: zod_1.z.string().uuid(),
  period_start: zod_1.z.string().date(),
  period_end: zod_1.z.string().date(),
  cohort_month: zod_1.z.string().date(),
  total_patients: zod_1.z.number().int().min(0).default(0),
  retained_patients: zod_1.z.number().int().min(0).default(0),
  churned_patients: zod_1.z.number().int().min(0).default(0),
  new_patients: zod_1.z.number().int().min(0).default(0),
  retention_rate: zod_1.z.number().min(0).max(1).default(0),
  churn_rate: zod_1.z.number().min(0).max(1).default(0),
  net_retention_rate: zod_1.z.number().min(0).default(0),
  revenue_retention_rate: zod_1.z.number().min(0).max(1).default(0),
  patient_ltv_avg: zod_1.z.number().min(0).default(0),
  acquisition_cost_avg: zod_1.z.number().min(0).default(0),
  roi_score: zod_1.z.number().default(0),
  benchmark_score: zod_1.z.number().min(0).max(1).default(0),
  improvement_percentage: zod_1.z.number().default(0),
  target_retention_rate: zod_1.z.number().min(0).max(1).default(0.8),
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
});
exports.RetentionMetricsSchema = RetentionMetricsSchema;
var PatientChurnPredictionSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  patient_id: zod_1.z.string().uuid(),
  prediction_date: zod_1.z.string().datetime(),
  churn_probability: zod_1.z.number().min(0).max(1),
  risk_score: zod_1.z.number().min(0).max(1).default(0),
  risk_level: ChurnRiskLevelSchema,
  predicted_churn_date: zod_1.z.string().date().optional(),
  contributing_factors: zod_1.z
    .array(
      zod_1.z.object({
        factor_name: zod_1.z.string().min(1),
        factor_value: zod_1.z.number(),
        weight: zod_1.z.number().min(0).max(1),
        category: zod_1.z.enum([
          "behavioral",
          "financial",
          "clinical",
          "satisfaction",
          "demographic",
        ]),
        description: zod_1.z.string().min(1),
      }),
    )
    .default([]),
  intervention_recommendations: zod_1.z
    .array(
      zod_1.z.object({
        intervention_type: zod_1.z.string().min(1),
        priority: zod_1.z.enum(["low", "medium", "high", "urgent"]),
        expected_effectiveness: zod_1.z.number().min(0).max(1),
        estimated_cost: zod_1.z.number().min(0),
        channel_preference: zod_1.z.array(zod_1.z.string()),
        personalization_suggestions: zod_1.z.record(zod_1.z.any()),
        timing_recommendation: zod_1.z.string().min(1),
        success_metrics: zod_1.z.array(zod_1.z.string()),
      }),
    )
    .default([]),
  model_features: zod_1.z.record(zod_1.z.number()).default({}),
  model_version: zod_1.z.string().min(1).default("v1.0"),
  confidence_score: zod_1.z.number().min(0).max(1).default(0),
  is_active: zod_1.z.boolean().default(true),
  validation_status: ValidationStatusSchema.default("pending"),
  actual_outcome: OutcomeSchema.optional(),
  outcome_date: zod_1.z.string().date().optional(),
  prediction_accuracy: zod_1.z.number().min(0).max(1).optional(),
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
});
exports.PatientChurnPredictionSchema = PatientChurnPredictionSchema;
var RetentionInterventionSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  patient_id: zod_1.z.string().uuid(),
  prediction_id: zod_1.z.string().uuid().optional(),
  intervention_type: zod_1.z.string().min(1).max(100),
  intervention_description: zod_1.z.string().min(1).max(1000),
  channel: InterventionChannelSchema,
  personalization_data: zod_1.z.record(zod_1.z.any()).default({}),
  trigger_conditions: zod_1.z.record(zod_1.z.any()).default({}),
  scheduled_date: zod_1.z.string().datetime().optional(),
  executed_date: zod_1.z.string().datetime().optional(),
  status: InterventionStatusSchema.default("planned"),
  response_data: zod_1.z.record(zod_1.z.any()).default({}),
  effectiveness_score: zod_1.z.number().min(0).max(1).optional(),
  cost: zod_1.z.number().min(0).default(0),
  roi: zod_1.z.number().optional(),
  campaign_id: zod_1.z.string().uuid().optional(),
  created_by: zod_1.z.string().uuid().optional(),
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
});
exports.RetentionInterventionSchema = RetentionInterventionSchema;
var RetentionCampaignAnalyticsSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  campaign_id: zod_1.z.string().uuid(),
  campaign_name: zod_1.z.string().min(1).max(200),
  campaign_type: zod_1.z.string().min(1).max(100),
  target_segment: zod_1.z.string().min(1).max(100),
  total_recipients: zod_1.z.number().int().min(0).default(0),
  delivered_count: zod_1.z.number().int().min(0).default(0),
  opened_count: zod_1.z.number().int().min(0).default(0),
  clicked_count: zod_1.z.number().int().min(0).default(0),
  responded_count: zod_1.z.number().int().min(0).default(0),
  converted_count: zod_1.z.number().int().min(0).default(0),
  delivery_rate: zod_1.z.number().min(0).max(1).default(0),
  open_rate: zod_1.z.number().min(0).max(1).default(0),
  click_rate: zod_1.z.number().min(0).max(1).default(0),
  response_rate: zod_1.z.number().min(0).max(1).default(0),
  conversion_rate: zod_1.z.number().min(0).max(1).default(0),
  retention_improvement: zod_1.z.number().min(0).max(1).default(0),
  cost_per_retention: zod_1.z.number().min(0).default(0),
  roi: zod_1.z.number().default(0),
  campaign_start_date: zod_1.z.string().datetime().optional(),
  campaign_end_date: zod_1.z.string().datetime().optional(),
  benchmark_comparison: zod_1.z.record(zod_1.z.any()).default({}),
  performance_metrics: zod_1.z.record(zod_1.z.any()).default({}),
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
});
exports.RetentionCampaignAnalyticsSchema = RetentionCampaignAnalyticsSchema;
// Request validation schemas
var RetentionAnalyticsRequestSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid().optional(),
  date_range: zod_1.z
    .object({
      start_date: zod_1.z.string().date(),
      end_date: zod_1.z.string().date(),
    })
    .optional(),
  risk_levels: zod_1.z.array(ChurnRiskLevelSchema).optional(),
  segments: zod_1.z.array(zod_1.z.string()).optional(),
  include_predictions: zod_1.z.boolean().default(false),
  include_interventions: zod_1.z.boolean().default(false),
});
exports.RetentionAnalyticsRequestSchema = RetentionAnalyticsRequestSchema;
var ChurnPredictionRequestSchema = zod_1.z.object({
  patient_ids: zod_1.z.array(zod_1.z.string().uuid()).optional(),
  force_recalculation: zod_1.z.boolean().default(false),
  model_version: zod_1.z.string().optional(),
  include_recommendations: zod_1.z.boolean().default(true),
});
exports.ChurnPredictionRequestSchema = ChurnPredictionRequestSchema;
var RetentionInterventionRequestSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid(),
  intervention_type: zod_1.z.string().min(1).max(100),
  channel: InterventionChannelSchema,
  personalization_data: zod_1.z.record(zod_1.z.any()).optional(),
  scheduled_date: zod_1.z.string().datetime().optional(),
  campaign_id: zod_1.z.string().uuid().optional(),
});
exports.RetentionInterventionRequestSchema = RetentionInterventionRequestSchema;
var RetentionMetricsRequestSchema = zod_1.z.object({
  clinic_id: zod_1.z.string().uuid().optional(),
  period_type: zod_1.z.enum(["monthly", "quarterly", "yearly"]),
  start_date: zod_1.z.string().date(),
  end_date: zod_1.z.string().date(),
  include_benchmarks: zod_1.z.boolean().default(false),
  segment_by: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.RetentionMetricsRequestSchema = RetentionMetricsRequestSchema;
// Form validation schemas
var RetentionInterventionFormSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid(),
  intervention_type: zod_1.z.string().min(1).max(100),
  channel: InterventionChannelSchema,
  personalization_data: zod_1.z.record(zod_1.z.any()).default({}),
  scheduled_date: zod_1.z.string().datetime().optional(),
});
exports.RetentionInterventionFormSchema = RetentionInterventionFormSchema;
// Create schemas (for POST operations)
// Create schemas with required fields
var CreatePatientRetentionAnalyticsSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid(),
  retention_score: zod_1.z.number().min(0).max(1),
  churn_risk_level: ChurnRiskLevelSchema,
  churn_probability: zod_1.z.number().min(0).max(1),
  lifetime_value: zod_1.z.number().min(0),
  predicted_ltv: zod_1.z.number().min(0),
  retention_segment: zod_1.z.string().min(1).max(100),
  last_visit_date: zod_1.z.string().datetime().optional(),
  visit_frequency_score: zod_1.z.number().min(0).max(1).default(0),
  engagement_score: zod_1.z.number().min(0).max(1).default(0),
  satisfaction_score: zod_1.z.number().min(0).max(1).default(0),
  financial_score: zod_1.z.number().min(0).max(1).default(0),
  risk_factors: zod_1.z.array(zod_1.z.string()).default([]),
  retention_interventions: zod_1.z
    .array(
      zod_1.z.object({
        intervention_id: zod_1.z.string().uuid(),
        intervention_type: zod_1.z.string().min(1),
        executed_date: zod_1.z.string().datetime(),
        effectiveness_score: zod_1.z.number().min(0).max(1).optional(),
        roi: zod_1.z.number().optional(),
        outcome: zod_1.z.enum(["positive", "neutral", "negative", "unknown"]),
      }),
    )
    .default([]),
  calculation_date: zod_1.z.string().datetime(),
  model_version: zod_1.z.string().min(1).default("v1.0"),
  confidence_level: zod_1.z.number().min(0).max(1).default(0),
});
exports.CreatePatientRetentionAnalyticsSchema = CreatePatientRetentionAnalyticsSchema;
var CreatePatientChurnPredictionSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid(),
  prediction_date: zod_1.z.string().datetime(),
  churn_probability: zod_1.z.number().min(0).max(1),
  risk_score: zod_1.z.number().min(0).max(1).default(0),
  risk_level: ChurnRiskLevelSchema,
  predicted_churn_date: zod_1.z.string().date().optional(),
  contributing_factors: zod_1.z
    .array(
      zod_1.z.object({
        factor_name: zod_1.z.string().min(1),
        factor_value: zod_1.z.number(),
        weight: zod_1.z.number().min(0).max(1),
        category: zod_1.z.enum([
          "behavioral",
          "financial",
          "clinical",
          "satisfaction",
          "demographic",
        ]),
        description: zod_1.z.string().min(1),
      }),
    )
    .default([]),
  intervention_recommendations: zod_1.z
    .array(
      zod_1.z.object({
        intervention_type: zod_1.z.string().min(1),
        priority: zod_1.z.enum(["low", "medium", "high", "urgent"]),
        expected_effectiveness: zod_1.z.number().min(0).max(1),
        estimated_cost: zod_1.z.number().min(0),
        channel_preference: zod_1.z.array(zod_1.z.string()),
        personalization_suggestions: zod_1.z.record(zod_1.z.any()),
        timing_recommendation: zod_1.z.string().min(1),
        success_metrics: zod_1.z.array(zod_1.z.string()),
      }),
    )
    .default([]),
  model_features: zod_1.z.record(zod_1.z.number()).default({}),
  model_version: zod_1.z.string().min(1).default("v1.0"),
  confidence_score: zod_1.z.number().min(0).max(1).default(0),
  is_active: zod_1.z.boolean().default(true),
  validation_status: ValidationStatusSchema.default("pending"),
  actual_outcome: OutcomeSchema.optional(),
  outcome_date: zod_1.z.string().date().optional(),
  prediction_accuracy: zod_1.z.number().min(0).max(1).optional(),
});
exports.CreatePatientChurnPredictionSchema = CreatePatientChurnPredictionSchema;
var CreateRetentionInterventionSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid(),
  prediction_id: zod_1.z.string().uuid().optional(),
  intervention_type: zod_1.z.string().min(1).max(100),
  intervention_description: zod_1.z.string().min(1).max(1000),
  channel: InterventionChannelSchema,
  personalization_data: zod_1.z.record(zod_1.z.any()).default({}),
  trigger_conditions: zod_1.z.record(zod_1.z.any()).default({}),
  scheduled_date: zod_1.z.string().datetime().optional(),
  executed_date: zod_1.z.string().datetime().optional(),
  status: InterventionStatusSchema.default("planned"),
  response_data: zod_1.z.record(zod_1.z.any()).default({}),
  effectiveness_score: zod_1.z.number().min(0).max(1).optional(),
  cost: zod_1.z.number().min(0).default(0),
  roi: zod_1.z.number().optional(),
  campaign_id: zod_1.z.string().uuid().optional(),
  created_by: zod_1.z.string().uuid().optional(),
});
exports.CreateRetentionInterventionSchema = CreateRetentionInterventionSchema;
var CreateRetentionMetricsSchema = RetentionMetricsSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
exports.CreateRetentionMetricsSchema = CreateRetentionMetricsSchema;
var CreateRetentionCampaignAnalyticsSchema = RetentionCampaignAnalyticsSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
exports.CreateRetentionCampaignAnalyticsSchema = CreateRetentionCampaignAnalyticsSchema;
// Update schemas (for PATCH operations)
var UpdatePatientRetentionAnalyticsSchema = PatientRetentionAnalyticsSchema.partial().omit({
  id: true,
  created_at: true,
});
exports.UpdatePatientRetentionAnalyticsSchema = UpdatePatientRetentionAnalyticsSchema;
var UpdateRetentionMetricsSchema = RetentionMetricsSchema.partial().omit({
  id: true,
  created_at: true,
});
exports.UpdateRetentionMetricsSchema = UpdateRetentionMetricsSchema;
var UpdatePatientChurnPredictionSchema = PatientChurnPredictionSchema.partial().omit({
  id: true,
  created_at: true,
});
exports.UpdatePatientChurnPredictionSchema = UpdatePatientChurnPredictionSchema;
var UpdateRetentionInterventionSchema = RetentionInterventionSchema.partial().omit({
  id: true,
  created_at: true,
});
exports.UpdateRetentionInterventionSchema = UpdateRetentionInterventionSchema;
var UpdateRetentionCampaignAnalyticsSchema = RetentionCampaignAnalyticsSchema.partial().omit({
  id: true,
  created_at: true,
});
exports.UpdateRetentionCampaignAnalyticsSchema = UpdateRetentionCampaignAnalyticsSchema;
// Query parameter schemas
var RetentionAnalyticsQuerySchema = zod_1.z.object({
  page: zod_1.z.coerce.number().int().min(1).default(1),
  limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
  sort_by: zod_1.z
    .enum(["retention_score", "churn_probability", "lifetime_value", "created_at"])
    .default("created_at"),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("desc"),
  risk_level: ChurnRiskLevelSchema.optional(),
  segment: zod_1.z.string().optional(),
  search: zod_1.z.string().optional(),
});
exports.RetentionAnalyticsQuerySchema = RetentionAnalyticsQuerySchema;
var ChurnPredictionQuerySchema = zod_1.z.object({
  page: zod_1.z.coerce.number().int().min(1).default(1),
  limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
  sort_by: zod_1.z
    .enum(["churn_probability", "risk_score", "prediction_date", "created_at"])
    .default("churn_probability"),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("desc"),
  risk_level: ChurnRiskLevelSchema.optional(),
  is_active: zod_1.z.coerce.boolean().optional(),
  model_version: zod_1.z.string().optional(),
});
exports.ChurnPredictionQuerySchema = ChurnPredictionQuerySchema;
var InterventionQuerySchema = zod_1.z.object({
  page: zod_1.z.coerce.number().int().min(1).default(1),
  limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
  sort_by: zod_1.z
    .enum(["scheduled_date", "executed_date", "effectiveness_score", "created_at"])
    .default("created_at"),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("desc"),
  status: InterventionStatusSchema.optional(),
  channel: InterventionChannelSchema.optional(),
  intervention_type: zod_1.z.string().optional(),
});
exports.InterventionQuerySchema = InterventionQuerySchema;
