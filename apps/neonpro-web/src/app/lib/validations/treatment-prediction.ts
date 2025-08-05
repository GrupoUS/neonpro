// Treatment Success Prediction Validation Schemas
// Comprehensive validation for AI/ML-powered treatment prediction system

import type { z } from "zod";

// Basic validation schemas
export const ConfidenceIntervalSchema = z
  .object({
    lower: z.number().min(0).max(1).describe("Lower bound of confidence interval"),
    upper: z.number().min(0).max(1).describe("Upper bound of confidence interval"),
    confidence_level: z
      .number()
      .min(0)
      .max(1)
      .default(0.95)
      .describe("Confidence level (e.g., 0.95 for 95%)"),
  })
  .refine((data) => data.lower <= data.upper, {
    message: "Lower bound must be less than or equal to upper bound",
  });

export const ModelPerformanceMetricsSchema = z.object({
  precision: z.number().min(0).max(1),
  recall: z.number().min(0).max(1),
  f1_score: z.number().min(0).max(1),
  auc_roc: z.number().min(0).max(1),
  training_accuracy: z.number().min(0).max(1),
  validation_accuracy: z.number().min(0).max(1),
  cross_validation_mean: z.number().min(0).max(1),
  cross_validation_std: z.number().min(0),
  feature_importance: z.record(z.number()).optional(),
});

export const CostRangeSchema = z
  .object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().min(1),
    average: z.number().min(0).optional(),
  })
  .refine((data) => data.min <= data.max, {
    message: "Minimum cost must be less than or equal to maximum cost",
  });

export const SideEffectsSchema = z.object({
  common: z.array(z.string()).optional(),
  uncommon: z.array(z.string()).optional(),
  rare: z.array(z.string()).optional(),
  severe: z.array(z.string()).optional(),
  expected: z.array(z.string()).optional(),
});

// Patient Factors Validation
export const MedicalHistorySchema = z.object({
  conditions: z.array(z.string()),
  medications: z.array(z.string()),
  allergies: z.array(z.string()),
  surgeries: z.array(z.string()),
  chronic_conditions: z.array(z.string()),
  family_history: z.array(z.string()),
});

export const LifestyleFactorsSchema = z.object({
  smoking: z.enum(["never", "former", "current"]),
  alcohol: z.enum(["none", "light", "moderate", "heavy"]),
  exercise: z.enum(["none", "light", "moderate", "regular"]),
  diet: z.enum(["poor", "average", "good", "excellent"]),
  sleep_quality: z.number().int().min(1).max(5),
  stress_level: z.number().int().min(1).max(5),
});

export const TreatmentHistoryItemSchema = z.object({
  treatment_type: z.string().min(1),
  date: z.string().datetime(),
  outcome: z.enum(["success", "partial_success", "failure"]),
  provider: z.string().min(1),
  notes: z.string().optional(),
});

export const TreatmentHistorySchema = z.object({
  previous_treatments: z.array(TreatmentHistoryItemSchema),
  total_treatments: z.number().int().min(0),
  success_rate: z.number().min(0).max(1),
  last_treatment_date: z.string().datetime().optional(),
  complications_history: z.array(z.string()),
});

export const PsychologicalFactorsSchema = z.object({
  anxiety_level: z.number().int().min(1).max(5),
  motivation_level: z.number().int().min(1).max(5),
  treatment_expectations: z.enum(["realistic", "optimistic", "unrealistic"]),
  body_image_satisfaction: z.number().int().min(1).max(5),
  perfectionism_tendency: z.number().int().min(1).max(5),
});

export const SocialFactorsSchema = z.object({
  support_system: z.enum(["strong", "moderate", "weak"]),
  socioeconomic_status: z.enum(["low", "middle", "high"]),
  education_level: z.enum(["basic", "secondary", "higher"]),
  employment_status: z.enum(["employed", "unemployed", "retired", "student"]),
});

export const GeographicFactorsSchema = z.object({
  location: z.string().min(1),
  climate: z.enum(["tropical", "temperate", "arid", "cold"]),
  accessibility_score: z.number().int().min(1).max(5),
  travel_distance_km: z.number().min(0),
});

export const PatientFactorsSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  age: z.number().int().min(0).max(150),
  gender: z.string().min(1),
  bmi: z.number().min(10).max(100).optional(),
  medical_history: MedicalHistorySchema.optional(),
  lifestyle_factors: LifestyleFactorsSchema.optional(),
  treatment_history: TreatmentHistorySchema.optional(),
  compliance_score: z.number().min(0).max(1).optional(),
  skin_type: z.string().optional(),
  skin_condition: z.string().optional(),
  treatment_expectations: z.string().optional(),
  psychological_factors: PsychologicalFactorsSchema.optional(),
  social_factors: SocialFactorsSchema.optional(),
  geographic_factors: GeographicFactorsSchema.optional(),
  updated_at: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
});

// Prediction Features Validation
export const PredictionFeaturesSchema = z.object({
  // Patient demographics
  age: z.number().int().min(0).max(150),
  gender: z.string().min(1),
  bmi: z.number().min(10).max(100).optional(),

  // Medical history factors
  previous_treatments: z.number().int().min(0),
  success_rate_history: z.number().min(0).max(1),
  medical_conditions: z.array(z.string()),
  medications: z.array(z.string()),
  allergies: z.array(z.string()),

  // Lifestyle factors
  smoking_status: z.enum(["never", "former", "current"]),
  alcohol_consumption: z.enum(["none", "light", "moderate", "heavy"]),
  exercise_frequency: z.enum(["none", "light", "moderate", "regular"]),

  // Treatment-specific factors
  treatment_complexity: z.number().int().min(1).max(5),
  provider_experience: z.number().min(0),
  clinic_success_rate: z.number().min(0).max(1),

  // Skin-specific factors
  skin_type: z.string().optional(),
  skin_condition: z.string().optional(),
  photosensitivity: z.boolean().optional(),

  // Psychological factors
  treatment_expectations: z.enum(["realistic", "optimistic", "unrealistic"]),
  anxiety_level: z.number().int().min(1).max(5),
  compliance_history: z.number().min(0).max(1),

  // External factors
  seasonal_factors: z.string().optional(),
  geographic_location: z.string().optional(),
  support_system: z.enum(["strong", "moderate", "weak"]),
});

export const ExplainabilityDataSchema = z.object({
  feature_importance: z.record(z.number()),
  top_positive_factors: z.array(z.string()),
  top_negative_factors: z.array(z.string()),
  similar_cases: z.array(z.string()),
  confidence_reasoning: z.string().min(1),
});

// Main Entity Schemas
export const PredictionModelSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  version: z.string().min(1).max(50),
  algorithm_type: z.enum([
    "ensemble",
    "neural_network",
    "random_forest",
    "gradient_boosting",
    "svm",
  ]),
  accuracy: z
    .number()
    .min(0)
    .max(1)
    .refine((val) => val >= 0.85, {
      message: "Model accuracy must be ≥85% (0.85)",
    }),
  confidence_threshold: z.number().min(0).max(1).default(0.85),
  status: z.enum(["training", "active", "deprecated"]).default("training"),
  training_data_size: z.number().int().min(0).default(0),
  feature_count: z.number().int().min(0).default(0),
  model_data: z.record(z.any()).optional(),
  performance_metrics: ModelPerformanceMetricsSchema.optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  created_by: z.string().uuid().optional(),
});

export const TreatmentPredictionSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  treatment_type: z.string().min(1).max(255),
  prediction_score: z.number().min(0).max(1),
  confidence_interval: ConfidenceIntervalSchema,
  risk_assessment: z.enum(["low", "medium", "high"]),
  predicted_outcome: z.enum(["success", "partial_success", "failure"]),
  prediction_date: z.string().datetime().optional(),
  model_id: z.string().uuid(),
  features_used: PredictionFeaturesSchema,
  explainability_data: ExplainabilityDataSchema.optional(),
  actual_outcome: z.enum(["success", "partial_success", "failure"]).optional(),
  outcome_date: z.string().datetime().optional(),
  accuracy_validated: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  created_by: z.string().uuid().optional(),
});

export const TreatmentCharacteristicsSchema = z.object({
  id: z.string().uuid().optional(),
  treatment_type: z.string().min(1).max(255),
  complexity_level: z.number().int().min(1).max(5),
  duration_weeks: z.number().int().min(0).optional(),
  session_count: z.number().int().min(0).optional(),
  invasiveness_level: z.number().int().min(1).max(5),
  recovery_time_days: z.number().int().min(0).optional(),
  equipment_required: z.record(z.any()).optional(),
  provider_skill_required: z.number().int().min(1).max(5),
  success_rate_baseline: z.number().min(0).max(1).optional(),
  contraindications: z.array(z.string()).optional(),
  side_effects: SideEffectsSchema.optional(),
  cost_range: CostRangeSchema.optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const ModelPerformanceSchema = z.object({
  id: z.string().uuid().optional(),
  model_id: z.string().uuid(),
  evaluation_date: z.string().datetime().optional(),
  accuracy: z.number().min(0).max(1),
  precision_score: z.number().min(0).max(1).optional(),
  recall_score: z.number().min(0).max(1).optional(),
  f1_score: z.number().min(0).max(1).optional(),
  auc_roc: z.number().min(0).max(1).optional(),
  predictions_count: z.number().int().min(0).default(0),
  correct_predictions: z.number().int().min(0).default(0),
  improvement_percentage: z.number().optional(),
  validation_metrics: z.record(z.any()).optional(),
  feature_importance: z.record(z.number()).optional(),
  created_at: z.string().datetime().optional(),
});

export const PredictionFeedbackSchema = z.object({
  id: z.string().uuid().optional(),
  prediction_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  feedback_type: z.enum(["validation", "correction", "enhancement"]),
  original_prediction: z.number().min(0).max(1),
  adjusted_prediction: z.number().min(0).max(1).optional(),
  reasoning: z.string().min(1),
  confidence_level: z.number().int().min(1).max(5),
  medical_factors: z.record(z.any()).optional(),
  created_at: z.string().datetime().optional(),
});

// API Request/Response Schemas
export const TreatmentRecommendationSchema = z.object({
  type: z.enum(["preparation", "modification", "monitoring", "post_care"]),
  description: z.string().min(1),
  importance: z.enum(["low", "medium", "high", "critical"]),
  evidence_level: z.enum(["expert_opinion", "case_studies", "clinical_trials"]),
});

export const AlternativeTreatmentSchema = z.object({
  treatment_type: z.string().min(1),
  prediction_score: z.number().min(0).max(1),
  advantages: z.array(z.string()),
  disadvantages: z.array(z.string()),
  suitability_score: z.number().min(0).max(1),
});

export const RiskFactorSchema = z.object({
  factor: z.string().min(1),
  impact: z.number().min(-1).max(1),
  modifiable: z.boolean(),
  recommendation: z.string().optional(),
});

export const PredictionResponseSchema = z.object({
  prediction: TreatmentPredictionSchema,
  recommendations: z.array(TreatmentRecommendationSchema),
  alternative_treatments: z.array(AlternativeTreatmentSchema),
  risk_factors: z.array(RiskFactorSchema),
});

export const PredictionRequestSchema = z.object({
  patient_id: z.string().uuid(),
  treatment_type: z.string().min(1),
  model_version: z.string().optional(),
  include_alternatives: z.boolean().default(false),
  confidence_threshold: z.number().min(0).max(1).optional(),
});

export const BatchPredictionRequestSchema = z.object({
  predictions: z.array(PredictionRequestSchema),
  model_version: z.string().optional(),
  include_summary: z.boolean().default(true),
});

export const PredictionSummarySchema = z.object({
  total_predictions: z.number().int().min(0),
  high_success_probability: z.number().int().min(0),
  medium_success_probability: z.number().int().min(0),
  low_success_probability: z.number().int().min(0),
  average_confidence: z.number().min(0).max(1),
  recommendations_generated: z.number().int().min(0),
});

export const BatchPredictionResponseSchema = z.object({
  predictions: z.array(PredictionResponseSchema),
  summary: PredictionSummarySchema,
  processing_time: z.number().min(0),
});

// Model Training Schemas
export const TrainingRequestSchema = z.object({
  model_name: z.string().min(1),
  algorithm_type: z.enum([
    "ensemble",
    "neural_network",
    "random_forest",
    "gradient_boosting",
    "svm",
  ]),
  training_parameters: z.record(z.any()),
  validation_split: z.number().min(0).max(1).default(0.2),
  feature_selection: z.array(z.string()).optional(),
});

export const TrainingResponseSchema = z.object({
  model_id: z.string().uuid(),
  training_status: z.enum(["started", "in_progress", "completed", "failed"]),
  estimated_completion: z.string().datetime().optional(),
  progress_percentage: z.number().min(0).max(100).optional(),
  performance_preview: ModelPerformanceMetricsSchema.optional(),
});

// Filter Schemas
export const PredictionFiltersSchema = z
  .object({
    patient_id: z.string().uuid().optional(),
    treatment_type: z.string().optional(),
    prediction_score_min: z.number().min(0).max(1).optional(),
    prediction_score_max: z.number().min(0).max(1).optional(),
    risk_assessment: z.enum(["low", "medium", "high"]).optional(),
    date_from: z.string().datetime().optional(),
    date_to: z.string().datetime().optional(),
    model_id: z.string().uuid().optional(),
    outcome: z.enum(["success", "partial_success", "failure"]).optional(),
    accuracy_validated: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.prediction_score_min && data.prediction_score_max) {
        return data.prediction_score_min <= data.prediction_score_max;
      }
      return true;
    },
    {
      message: "Minimum prediction score must be less than or equal to maximum",
    },
  );

export const ModelFiltersSchema = z.object({
  status: z.enum(["training", "active", "deprecated"]).optional(),
  algorithm_type: z
    .enum(["ensemble", "neural_network", "random_forest", "gradient_boosting", "svm"])
    .optional(),
  accuracy_min: z.number().min(0).max(1).optional(),
  version: z.string().optional(),
  created_from: z.string().datetime().optional(),
  created_to: z.string().datetime().optional(),
});

export const PerformanceFiltersSchema = z.object({
  model_id: z.string().uuid().optional(),
  accuracy_min: z.number().min(0).max(1).optional(),
  evaluation_date_from: z.string().datetime().optional(),
  evaluation_date_to: z.string().datetime().optional(),
  improvement_percentage_min: z.number().optional(),
});

// Update Schemas
const UpdateTreatmentPredictionSchema = TreatmentPredictionSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

const UpdatePredictionModelSchema = PredictionModelSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

const UpdatePatientFactorsSchema = PatientFactorsSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

const UpdateTreatmentCharacteristicsSchema = TreatmentCharacteristicsSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Export update schemas
export {
  UpdatePatientFactorsSchema,
  UpdatePredictionModelSchema,
  UpdateTreatmentCharacteristicsSchema,
  UpdateTreatmentPredictionSchema,
};
