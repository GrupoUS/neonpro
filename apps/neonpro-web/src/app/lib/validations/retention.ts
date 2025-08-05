// Validation schemas for Patient Retention Analytics + Predictions
// Story 7.4: Advanced patient retention analytics with predictive modeling

import type { z } from "zod";

// Base validation schemas
const ChurnRiskLevelSchema = z.enum(["low", "medium", "high", "critical"]);
const ModelTypeSchema = z.enum(["churn_prediction", "ltv_prediction", "retention_scoring"]);
const InterventionChannelSchema = z.enum([
  "email",
  "sms",
  "whatsapp",
  "phone",
  "in_person",
  "push",
]);
const InterventionStatusSchema = z.enum([
  "planned",
  "scheduled",
  "sent",
  "delivered",
  "opened",
  "clicked",
  "responded",
  "failed",
]);
const ValidationStatusSchema = z.enum(["pending", "validated", "disputed"]);
const OutcomeSchema = z.enum(["retained", "churned", "unknown"]);
const DeploymentStatusSchema = z.enum(["development", "testing", "production", "deprecated"]);
const BenchmarkTypeSchema = z.enum([
  "retention_rate",
  "churn_rate",
  "ltv",
  "intervention_effectiveness",
]);
const ClinicSizeCategorySchema = z.enum(["small", "medium", "large", "enterprise"]);

// Core entity schemas
const PatientRetentionAnalyticsSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  retention_score: z.number().min(0).max(1),
  churn_risk_level: ChurnRiskLevelSchema,
  churn_probability: z.number().min(0).max(1),
  lifetime_value: z.number().min(0),
  predicted_ltv: z.number().min(0),
  retention_segment: z.string().min(1).max(100),
  last_visit_date: z.string().datetime().optional(),
  visit_frequency_score: z.number().min(0).max(1).default(0),
  engagement_score: z.number().min(0).max(1).default(0),
  satisfaction_score: z.number().min(0).max(1).default(0),
  financial_score: z.number().min(0).max(1).default(0),
  risk_factors: z.array(z.string()).default([]),
  retention_interventions: z
    .array(
      z.object({
        intervention_id: z.string().uuid(),
        intervention_type: z.string().min(1),
        executed_date: z.string().datetime(),
        effectiveness_score: z.number().min(0).max(1).optional(),
        roi: z.number().optional(),
        outcome: z.enum(["positive", "neutral", "negative", "unknown"]),
      }),
    )
    .default([]),
  calculation_date: z.string().datetime(),
  model_version: z.string().min(1).default("v1.0"),
  confidence_level: z.number().min(0).max(1).default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const RetentionMetricsSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  period_start: z.string().date(),
  period_end: z.string().date(),
  cohort_month: z.string().date(),
  total_patients: z.number().int().min(0).default(0),
  retained_patients: z.number().int().min(0).default(0),
  churned_patients: z.number().int().min(0).default(0),
  new_patients: z.number().int().min(0).default(0),
  retention_rate: z.number().min(0).max(1).default(0),
  churn_rate: z.number().min(0).max(1).default(0),
  net_retention_rate: z.number().min(0).default(0),
  revenue_retention_rate: z.number().min(0).max(1).default(0),
  patient_ltv_avg: z.number().min(0).default(0),
  acquisition_cost_avg: z.number().min(0).default(0),
  roi_score: z.number().default(0),
  benchmark_score: z.number().min(0).max(1).default(0),
  improvement_percentage: z.number().default(0),
  target_retention_rate: z.number().min(0).max(1).default(0.8),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const PatientChurnPredictionSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  prediction_date: z.string().datetime(),
  churn_probability: z.number().min(0).max(1),
  risk_score: z.number().min(0).max(1).default(0),
  risk_level: ChurnRiskLevelSchema,
  predicted_churn_date: z.string().date().optional(),
  contributing_factors: z
    .array(
      z.object({
        factor_name: z.string().min(1),
        factor_value: z.number(),
        weight: z.number().min(0).max(1),
        category: z.enum(["behavioral", "financial", "clinical", "satisfaction", "demographic"]),
        description: z.string().min(1),
      }),
    )
    .default([]),
  intervention_recommendations: z
    .array(
      z.object({
        intervention_type: z.string().min(1),
        priority: z.enum(["low", "medium", "high", "urgent"]),
        expected_effectiveness: z.number().min(0).max(1),
        estimated_cost: z.number().min(0),
        channel_preference: z.array(z.string()),
        personalization_suggestions: z.record(z.any()),
        timing_recommendation: z.string().min(1),
        success_metrics: z.array(z.string()),
      }),
    )
    .default([]),
  model_features: z.record(z.number()).default({}),
  model_version: z.string().min(1).default("v1.0"),
  confidence_score: z.number().min(0).max(1).default(0),
  is_active: z.boolean().default(true),
  validation_status: ValidationStatusSchema.default("pending"),
  actual_outcome: OutcomeSchema.optional(),
  outcome_date: z.string().date().optional(),
  prediction_accuracy: z.number().min(0).max(1).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const RetentionInterventionSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  prediction_id: z.string().uuid().optional(),
  intervention_type: z.string().min(1).max(100),
  intervention_description: z.string().min(1).max(1000),
  channel: InterventionChannelSchema,
  personalization_data: z.record(z.any()).default({}),
  trigger_conditions: z.record(z.any()).default({}),
  scheduled_date: z.string().datetime().optional(),
  executed_date: z.string().datetime().optional(),
  status: InterventionStatusSchema.default("planned"),
  response_data: z.record(z.any()).default({}),
  effectiveness_score: z.number().min(0).max(1).optional(),
  cost: z.number().min(0).default(0),
  roi: z.number().optional(),
  campaign_id: z.string().uuid().optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const RetentionCampaignAnalyticsSchema = z.object({
  id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  campaign_name: z.string().min(1).max(200),
  campaign_type: z.string().min(1).max(100),
  target_segment: z.string().min(1).max(100),
  total_recipients: z.number().int().min(0).default(0),
  delivered_count: z.number().int().min(0).default(0),
  opened_count: z.number().int().min(0).default(0),
  clicked_count: z.number().int().min(0).default(0),
  responded_count: z.number().int().min(0).default(0),
  converted_count: z.number().int().min(0).default(0),
  delivery_rate: z.number().min(0).max(1).default(0),
  open_rate: z.number().min(0).max(1).default(0),
  click_rate: z.number().min(0).max(1).default(0),
  response_rate: z.number().min(0).max(1).default(0),
  conversion_rate: z.number().min(0).max(1).default(0),
  retention_improvement: z.number().min(0).max(1).default(0),
  cost_per_retention: z.number().min(0).default(0),
  roi: z.number().default(0),
  campaign_start_date: z.string().datetime().optional(),
  campaign_end_date: z.string().datetime().optional(),
  benchmark_comparison: z.record(z.any()).default({}),
  performance_metrics: z.record(z.any()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Request validation schemas
const RetentionAnalyticsRequestSchema = z.object({
  patient_id: z.string().uuid().optional(),
  date_range: z
    .object({
      start_date: z.string().date(),
      end_date: z.string().date(),
    })
    .optional(),
  risk_levels: z.array(ChurnRiskLevelSchema).optional(),
  segments: z.array(z.string()).optional(),
  include_predictions: z.boolean().default(false),
  include_interventions: z.boolean().default(false),
});

const ChurnPredictionRequestSchema = z.object({
  patient_ids: z.array(z.string().uuid()).optional(),
  force_recalculation: z.boolean().default(false),
  model_version: z.string().optional(),
  include_recommendations: z.boolean().default(true),
});

const RetentionInterventionRequestSchema = z.object({
  patient_id: z.string().uuid(),
  intervention_type: z.string().min(1).max(100),
  channel: InterventionChannelSchema,
  personalization_data: z.record(z.any()).optional(),
  scheduled_date: z.string().datetime().optional(),
  campaign_id: z.string().uuid().optional(),
});

const RetentionMetricsRequestSchema = z.object({
  clinic_id: z.string().uuid().optional(),
  period_type: z.enum(["monthly", "quarterly", "yearly"]),
  start_date: z.string().date(),
  end_date: z.string().date(),
  include_benchmarks: z.boolean().default(false),
  segment_by: z.array(z.string()).optional(),
});

// Form validation schemas
const RetentionInterventionFormSchema = z.object({
  patient_id: z.string().uuid(),
  intervention_type: z.string().min(1).max(100),
  channel: InterventionChannelSchema,
  personalization_data: z.record(z.any()).default({}),
  scheduled_date: z.string().datetime().optional(),
});

// Create schemas (for POST operations)
// Create schemas with required fields
const CreatePatientRetentionAnalyticsSchema = z.object({
  patient_id: z.string().uuid(),
  retention_score: z.number().min(0).max(1),
  churn_risk_level: ChurnRiskLevelSchema,
  churn_probability: z.number().min(0).max(1),
  lifetime_value: z.number().min(0),
  predicted_ltv: z.number().min(0),
  retention_segment: z.string().min(1).max(100),
  last_visit_date: z.string().datetime().optional(),
  visit_frequency_score: z.number().min(0).max(1).default(0),
  engagement_score: z.number().min(0).max(1).default(0),
  satisfaction_score: z.number().min(0).max(1).default(0),
  financial_score: z.number().min(0).max(1).default(0),
  risk_factors: z.array(z.string()).default([]),
  retention_interventions: z
    .array(
      z.object({
        intervention_id: z.string().uuid(),
        intervention_type: z.string().min(1),
        executed_date: z.string().datetime(),
        effectiveness_score: z.number().min(0).max(1).optional(),
        roi: z.number().optional(),
        outcome: z.enum(["positive", "neutral", "negative", "unknown"]),
      }),
    )
    .default([]),
  calculation_date: z.string().datetime(),
  model_version: z.string().min(1).default("v1.0"),
  confidence_level: z.number().min(0).max(1).default(0),
});

const CreatePatientChurnPredictionSchema = z.object({
  patient_id: z.string().uuid(),
  prediction_date: z.string().datetime(),
  churn_probability: z.number().min(0).max(1),
  risk_score: z.number().min(0).max(1).default(0),
  risk_level: ChurnRiskLevelSchema,
  predicted_churn_date: z.string().date().optional(),
  contributing_factors: z
    .array(
      z.object({
        factor_name: z.string().min(1),
        factor_value: z.number(),
        weight: z.number().min(0).max(1),
        category: z.enum(["behavioral", "financial", "clinical", "satisfaction", "demographic"]),
        description: z.string().min(1),
      }),
    )
    .default([]),
  intervention_recommendations: z
    .array(
      z.object({
        intervention_type: z.string().min(1),
        priority: z.enum(["low", "medium", "high", "urgent"]),
        expected_effectiveness: z.number().min(0).max(1),
        estimated_cost: z.number().min(0),
        channel_preference: z.array(z.string()),
        personalization_suggestions: z.record(z.any()),
        timing_recommendation: z.string().min(1),
        success_metrics: z.array(z.string()),
      }),
    )
    .default([]),
  model_features: z.record(z.number()).default({}),
  model_version: z.string().min(1).default("v1.0"),
  confidence_score: z.number().min(0).max(1).default(0),
  is_active: z.boolean().default(true),
  validation_status: ValidationStatusSchema.default("pending"),
  actual_outcome: OutcomeSchema.optional(),
  outcome_date: z.string().date().optional(),
  prediction_accuracy: z.number().min(0).max(1).optional(),
});

const CreateRetentionInterventionSchema = z.object({
  patient_id: z.string().uuid(),
  prediction_id: z.string().uuid().optional(),
  intervention_type: z.string().min(1).max(100),
  intervention_description: z.string().min(1).max(1000),
  channel: InterventionChannelSchema,
  personalization_data: z.record(z.any()).default({}),
  trigger_conditions: z.record(z.any()).default({}),
  scheduled_date: z.string().datetime().optional(),
  executed_date: z.string().datetime().optional(),
  status: InterventionStatusSchema.default("planned"),
  response_data: z.record(z.any()).default({}),
  effectiveness_score: z.number().min(0).max(1).optional(),
  cost: z.number().min(0).default(0),
  roi: z.number().optional(),
  campaign_id: z.string().uuid().optional(),
  created_by: z.string().uuid().optional(),
});
const CreateRetentionMetricsSchema = RetentionMetricsSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

const CreateRetentionCampaignAnalyticsSchema = RetentionCampaignAnalyticsSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Update schemas (for PATCH operations)
const UpdatePatientRetentionAnalyticsSchema = PatientRetentionAnalyticsSchema.partial().omit({
  id: true,
  created_at: true,
});
const UpdateRetentionMetricsSchema = RetentionMetricsSchema.partial().omit({
  id: true,
  created_at: true,
});
const UpdatePatientChurnPredictionSchema = PatientChurnPredictionSchema.partial().omit({
  id: true,
  created_at: true,
});
const UpdateRetentionInterventionSchema = RetentionInterventionSchema.partial().omit({
  id: true,
  created_at: true,
});
const UpdateRetentionCampaignAnalyticsSchema = RetentionCampaignAnalyticsSchema.partial().omit({
  id: true,
  created_at: true,
});

// Query parameter schemas
const RetentionAnalyticsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort_by: z
    .enum(["retention_score", "churn_probability", "lifetime_value", "created_at"])
    .default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
  risk_level: ChurnRiskLevelSchema.optional(),
  segment: z.string().optional(),
  search: z.string().optional(),
});

const ChurnPredictionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort_by: z
    .enum(["churn_probability", "risk_score", "prediction_date", "created_at"])
    .default("churn_probability"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
  risk_level: ChurnRiskLevelSchema.optional(),
  is_active: z.coerce.boolean().optional(),
  model_version: z.string().optional(),
});

const InterventionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort_by: z
    .enum(["scheduled_date", "executed_date", "effectiveness_score", "created_at"])
    .default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
  status: InterventionStatusSchema.optional(),
  channel: InterventionChannelSchema.optional(),
  intervention_type: z.string().optional(),
});

// Export all schemas
export {
  BenchmarkTypeSchema,
  ChurnPredictionQuerySchema,
  ChurnPredictionRequestSchema,
  ChurnRiskLevelSchema,
  ClinicSizeCategorySchema,
  CreatePatientChurnPredictionSchema,
  CreatePatientRetentionAnalyticsSchema,
  CreateRetentionCampaignAnalyticsSchema,
  CreateRetentionInterventionSchema,
  CreateRetentionMetricsSchema,
  DeploymentStatusSchema,
  InterventionChannelSchema,
  InterventionQuerySchema,
  InterventionStatusSchema,
  ModelTypeSchema,
  OutcomeSchema,
  PatientChurnPredictionSchema,
  PatientRetentionAnalyticsSchema,
  RetentionAnalyticsQuerySchema,
  RetentionAnalyticsRequestSchema,
  RetentionCampaignAnalyticsSchema,
  RetentionInterventionFormSchema,
  RetentionInterventionRequestSchema,
  RetentionInterventionSchema,
  RetentionMetricsRequestSchema,
  RetentionMetricsSchema,
  UpdatePatientChurnPredictionSchema,
  UpdatePatientRetentionAnalyticsSchema,
  UpdateRetentionCampaignAnalyticsSchema,
  UpdateRetentionInterventionSchema,
  UpdateRetentionMetricsSchema,
  ValidationStatusSchema,
};
