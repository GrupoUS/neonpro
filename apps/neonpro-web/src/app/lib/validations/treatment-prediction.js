// Treatment Success Prediction Validation Schemas
// Comprehensive validation for AI/ML-powered treatment prediction system
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTreatmentPredictionSchema =
  exports.UpdateTreatmentCharacteristicsSchema =
  exports.UpdatePredictionModelSchema =
  exports.UpdatePatientFactorsSchema =
  exports.PerformanceFiltersSchema =
  exports.ModelFiltersSchema =
  exports.PredictionFiltersSchema =
  exports.TrainingResponseSchema =
  exports.TrainingRequestSchema =
  exports.BatchPredictionResponseSchema =
  exports.PredictionSummarySchema =
  exports.BatchPredictionRequestSchema =
  exports.PredictionRequestSchema =
  exports.PredictionResponseSchema =
  exports.RiskFactorSchema =
  exports.AlternativeTreatmentSchema =
  exports.TreatmentRecommendationSchema =
  exports.PredictionFeedbackSchema =
  exports.ModelPerformanceSchema =
  exports.TreatmentCharacteristicsSchema =
  exports.TreatmentPredictionSchema =
  exports.PredictionModelSchema =
  exports.ExplainabilityDataSchema =
  exports.PredictionFeaturesSchema =
  exports.PatientFactorsSchema =
  exports.GeographicFactorsSchema =
  exports.SocialFactorsSchema =
  exports.PsychologicalFactorsSchema =
  exports.TreatmentHistorySchema =
  exports.TreatmentHistoryItemSchema =
  exports.LifestyleFactorsSchema =
  exports.MedicalHistorySchema =
  exports.SideEffectsSchema =
  exports.CostRangeSchema =
  exports.ModelPerformanceMetricsSchema =
  exports.ConfidenceIntervalSchema =
    void 0;
var zod_1 = require("zod");
// Basic validation schemas
exports.ConfidenceIntervalSchema = zod_1.z
  .object({
    lower: zod_1.z.number().min(0).max(1).describe("Lower bound of confidence interval"),
    upper: zod_1.z.number().min(0).max(1).describe("Upper bound of confidence interval"),
    confidence_level: zod_1.z
      .number()
      .min(0)
      .max(1)
      .default(0.95)
      .describe("Confidence level (e.g., 0.95 for 95%)"),
  })
  .refine((data) => data.lower <= data.upper, {
    message: "Lower bound must be less than or equal to upper bound",
  });
exports.ModelPerformanceMetricsSchema = zod_1.z.object({
  precision: zod_1.z.number().min(0).max(1),
  recall: zod_1.z.number().min(0).max(1),
  f1_score: zod_1.z.number().min(0).max(1),
  auc_roc: zod_1.z.number().min(0).max(1),
  training_accuracy: zod_1.z.number().min(0).max(1),
  validation_accuracy: zod_1.z.number().min(0).max(1),
  cross_validation_mean: zod_1.z.number().min(0).max(1),
  cross_validation_std: zod_1.z.number().min(0),
  feature_importance: zod_1.z.record(zod_1.z.number()).optional(),
});
exports.CostRangeSchema = zod_1.z
  .object({
    min: zod_1.z.number().min(0),
    max: zod_1.z.number().min(0),
    currency: zod_1.z.string().min(1),
    average: zod_1.z.number().min(0).optional(),
  })
  .refine((data) => data.min <= data.max, {
    message: "Minimum cost must be less than or equal to maximum cost",
  });
exports.SideEffectsSchema = zod_1.z.object({
  common: zod_1.z.array(zod_1.z.string()).optional(),
  uncommon: zod_1.z.array(zod_1.z.string()).optional(),
  rare: zod_1.z.array(zod_1.z.string()).optional(),
  severe: zod_1.z.array(zod_1.z.string()).optional(),
  expected: zod_1.z.array(zod_1.z.string()).optional(),
});
// Patient Factors Validation
exports.MedicalHistorySchema = zod_1.z.object({
  conditions: zod_1.z.array(zod_1.z.string()),
  medications: zod_1.z.array(zod_1.z.string()),
  allergies: zod_1.z.array(zod_1.z.string()),
  surgeries: zod_1.z.array(zod_1.z.string()),
  chronic_conditions: zod_1.z.array(zod_1.z.string()),
  family_history: zod_1.z.array(zod_1.z.string()),
});
exports.LifestyleFactorsSchema = zod_1.z.object({
  smoking: zod_1.z.enum(["never", "former", "current"]),
  alcohol: zod_1.z.enum(["none", "light", "moderate", "heavy"]),
  exercise: zod_1.z.enum(["none", "light", "moderate", "regular"]),
  diet: zod_1.z.enum(["poor", "average", "good", "excellent"]),
  sleep_quality: zod_1.z.number().int().min(1).max(5),
  stress_level: zod_1.z.number().int().min(1).max(5),
});
exports.TreatmentHistoryItemSchema = zod_1.z.object({
  treatment_type: zod_1.z.string().min(1),
  date: zod_1.z.string().datetime(),
  outcome: zod_1.z.enum(["success", "partial_success", "failure"]),
  provider: zod_1.z.string().min(1),
  notes: zod_1.z.string().optional(),
});
exports.TreatmentHistorySchema = zod_1.z.object({
  previous_treatments: zod_1.z.array(exports.TreatmentHistoryItemSchema),
  total_treatments: zod_1.z.number().int().min(0),
  success_rate: zod_1.z.number().min(0).max(1),
  last_treatment_date: zod_1.z.string().datetime().optional(),
  complications_history: zod_1.z.array(zod_1.z.string()),
});
exports.PsychologicalFactorsSchema = zod_1.z.object({
  anxiety_level: zod_1.z.number().int().min(1).max(5),
  motivation_level: zod_1.z.number().int().min(1).max(5),
  treatment_expectations: zod_1.z.enum(["realistic", "optimistic", "unrealistic"]),
  body_image_satisfaction: zod_1.z.number().int().min(1).max(5),
  perfectionism_tendency: zod_1.z.number().int().min(1).max(5),
});
exports.SocialFactorsSchema = zod_1.z.object({
  support_system: zod_1.z.enum(["strong", "moderate", "weak"]),
  socioeconomic_status: zod_1.z.enum(["low", "middle", "high"]),
  education_level: zod_1.z.enum(["basic", "secondary", "higher"]),
  employment_status: zod_1.z.enum(["employed", "unemployed", "retired", "student"]),
});
exports.GeographicFactorsSchema = zod_1.z.object({
  location: zod_1.z.string().min(1),
  climate: zod_1.z.enum(["tropical", "temperate", "arid", "cold"]),
  accessibility_score: zod_1.z.number().int().min(1).max(5),
  travel_distance_km: zod_1.z.number().min(0),
});
exports.PatientFactorsSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  patient_id: zod_1.z.string().uuid(),
  age: zod_1.z.number().int().min(0).max(150),
  gender: zod_1.z.string().min(1),
  bmi: zod_1.z.number().min(10).max(100).optional(),
  medical_history: exports.MedicalHistorySchema.optional(),
  lifestyle_factors: exports.LifestyleFactorsSchema.optional(),
  treatment_history: exports.TreatmentHistorySchema.optional(),
  compliance_score: zod_1.z.number().min(0).max(1).optional(),
  skin_type: zod_1.z.string().optional(),
  skin_condition: zod_1.z.string().optional(),
  treatment_expectations: zod_1.z.string().optional(),
  psychological_factors: exports.PsychologicalFactorsSchema.optional(),
  social_factors: exports.SocialFactorsSchema.optional(),
  geographic_factors: exports.GeographicFactorsSchema.optional(),
  updated_at: zod_1.z.string().datetime().optional(),
  created_at: zod_1.z.string().datetime().optional(),
});
// Prediction Features Validation
exports.PredictionFeaturesSchema = zod_1.z.object({
  // Patient demographics
  age: zod_1.z.number().int().min(0).max(150),
  gender: zod_1.z.string().min(1),
  bmi: zod_1.z.number().min(10).max(100).optional(),
  // Medical history factors
  previous_treatments: zod_1.z.number().int().min(0),
  success_rate_history: zod_1.z.number().min(0).max(1),
  medical_conditions: zod_1.z.array(zod_1.z.string()),
  medications: zod_1.z.array(zod_1.z.string()),
  allergies: zod_1.z.array(zod_1.z.string()),
  // Lifestyle factors
  smoking_status: zod_1.z.enum(["never", "former", "current"]),
  alcohol_consumption: zod_1.z.enum(["none", "light", "moderate", "heavy"]),
  exercise_frequency: zod_1.z.enum(["none", "light", "moderate", "regular"]),
  // Treatment-specific factors
  treatment_complexity: zod_1.z.number().int().min(1).max(5),
  provider_experience: zod_1.z.number().min(0),
  clinic_success_rate: zod_1.z.number().min(0).max(1),
  // Skin-specific factors
  skin_type: zod_1.z.string().optional(),
  skin_condition: zod_1.z.string().optional(),
  photosensitivity: zod_1.z.boolean().optional(),
  // Psychological factors
  treatment_expectations: zod_1.z.enum(["realistic", "optimistic", "unrealistic"]),
  anxiety_level: zod_1.z.number().int().min(1).max(5),
  compliance_history: zod_1.z.number().min(0).max(1),
  // External factors
  seasonal_factors: zod_1.z.string().optional(),
  geographic_location: zod_1.z.string().optional(),
  support_system: zod_1.z.enum(["strong", "moderate", "weak"]),
});
exports.ExplainabilityDataSchema = zod_1.z.object({
  feature_importance: zod_1.z.record(zod_1.z.number()),
  top_positive_factors: zod_1.z.array(zod_1.z.string()),
  top_negative_factors: zod_1.z.array(zod_1.z.string()),
  similar_cases: zod_1.z.array(zod_1.z.string()),
  confidence_reasoning: zod_1.z.string().min(1),
});
// Main Entity Schemas
exports.PredictionModelSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  name: zod_1.z.string().min(1).max(255),
  version: zod_1.z.string().min(1).max(50),
  algorithm_type: zod_1.z.enum([
    "ensemble",
    "neural_network",
    "random_forest",
    "gradient_boosting",
    "svm",
  ]),
  accuracy: zod_1.z
    .number()
    .min(0)
    .max(1)
    .refine((val) => val >= 0.85, {
      message: "Model accuracy must be ≥85% (0.85)",
    }),
  confidence_threshold: zod_1.z.number().min(0).max(1).default(0.85),
  status: zod_1.z.enum(["training", "active", "deprecated"]).default("training"),
  training_data_size: zod_1.z.number().int().min(0).default(0),
  feature_count: zod_1.z.number().int().min(0).default(0),
  model_data: zod_1.z.record(zod_1.z.any()).optional(),
  performance_metrics: exports.ModelPerformanceMetricsSchema.optional(),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
  created_by: zod_1.z.string().uuid().optional(),
});
exports.TreatmentPredictionSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  patient_id: zod_1.z.string().uuid(),
  treatment_type: zod_1.z.string().min(1).max(255),
  prediction_score: zod_1.z.number().min(0).max(1),
  confidence_interval: exports.ConfidenceIntervalSchema,
  risk_assessment: zod_1.z.enum(["low", "medium", "high"]),
  predicted_outcome: zod_1.z.enum(["success", "partial_success", "failure"]),
  prediction_date: zod_1.z.string().datetime().optional(),
  model_id: zod_1.z.string().uuid(),
  features_used: exports.PredictionFeaturesSchema,
  explainability_data: exports.ExplainabilityDataSchema.optional(),
  actual_outcome: zod_1.z.enum(["success", "partial_success", "failure"]).optional(),
  outcome_date: zod_1.z.string().datetime().optional(),
  accuracy_validated: zod_1.z.boolean().default(false),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
  created_by: zod_1.z.string().uuid().optional(),
});
exports.TreatmentCharacteristicsSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  treatment_type: zod_1.z.string().min(1).max(255),
  complexity_level: zod_1.z.number().int().min(1).max(5),
  duration_weeks: zod_1.z.number().int().min(0).optional(),
  session_count: zod_1.z.number().int().min(0).optional(),
  invasiveness_level: zod_1.z.number().int().min(1).max(5),
  recovery_time_days: zod_1.z.number().int().min(0).optional(),
  equipment_required: zod_1.z.record(zod_1.z.any()).optional(),
  provider_skill_required: zod_1.z.number().int().min(1).max(5),
  success_rate_baseline: zod_1.z.number().min(0).max(1).optional(),
  contraindications: zod_1.z.array(zod_1.z.string()).optional(),
  side_effects: exports.SideEffectsSchema.optional(),
  cost_range: exports.CostRangeSchema.optional(),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
});
exports.ModelPerformanceSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  model_id: zod_1.z.string().uuid(),
  evaluation_date: zod_1.z.string().datetime().optional(),
  accuracy: zod_1.z.number().min(0).max(1),
  precision_score: zod_1.z.number().min(0).max(1).optional(),
  recall_score: zod_1.z.number().min(0).max(1).optional(),
  f1_score: zod_1.z.number().min(0).max(1).optional(),
  auc_roc: zod_1.z.number().min(0).max(1).optional(),
  predictions_count: zod_1.z.number().int().min(0).default(0),
  correct_predictions: zod_1.z.number().int().min(0).default(0),
  improvement_percentage: zod_1.z.number().optional(),
  validation_metrics: zod_1.z.record(zod_1.z.any()).optional(),
  feature_importance: zod_1.z.record(zod_1.z.number()).optional(),
  created_at: zod_1.z.string().datetime().optional(),
});
exports.PredictionFeedbackSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  prediction_id: zod_1.z.string().uuid(),
  provider_id: zod_1.z.string().uuid(),
  feedback_type: zod_1.z.enum(["validation", "correction", "enhancement"]),
  original_prediction: zod_1.z.number().min(0).max(1),
  adjusted_prediction: zod_1.z.number().min(0).max(1).optional(),
  reasoning: zod_1.z.string().min(1),
  confidence_level: zod_1.z.number().int().min(1).max(5),
  medical_factors: zod_1.z.record(zod_1.z.any()).optional(),
  created_at: zod_1.z.string().datetime().optional(),
});
// API Request/Response Schemas
exports.TreatmentRecommendationSchema = zod_1.z.object({
  type: zod_1.z.enum(["preparation", "modification", "monitoring", "post_care"]),
  description: zod_1.z.string().min(1),
  importance: zod_1.z.enum(["low", "medium", "high", "critical"]),
  evidence_level: zod_1.z.enum(["expert_opinion", "case_studies", "clinical_trials"]),
});
exports.AlternativeTreatmentSchema = zod_1.z.object({
  treatment_type: zod_1.z.string().min(1),
  prediction_score: zod_1.z.number().min(0).max(1),
  advantages: zod_1.z.array(zod_1.z.string()),
  disadvantages: zod_1.z.array(zod_1.z.string()),
  suitability_score: zod_1.z.number().min(0).max(1),
});
exports.RiskFactorSchema = zod_1.z.object({
  factor: zod_1.z.string().min(1),
  impact: zod_1.z.number().min(-1).max(1),
  modifiable: zod_1.z.boolean(),
  recommendation: zod_1.z.string().optional(),
});
exports.PredictionResponseSchema = zod_1.z.object({
  prediction: exports.TreatmentPredictionSchema,
  recommendations: zod_1.z.array(exports.TreatmentRecommendationSchema),
  alternative_treatments: zod_1.z.array(exports.AlternativeTreatmentSchema),
  risk_factors: zod_1.z.array(exports.RiskFactorSchema),
});
exports.PredictionRequestSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid(),
  treatment_type: zod_1.z.string().min(1),
  model_version: zod_1.z.string().optional(),
  include_alternatives: zod_1.z.boolean().default(false),
  confidence_threshold: zod_1.z.number().min(0).max(1).optional(),
});
exports.BatchPredictionRequestSchema = zod_1.z.object({
  predictions: zod_1.z.array(exports.PredictionRequestSchema),
  model_version: zod_1.z.string().optional(),
  include_summary: zod_1.z.boolean().default(true),
});
exports.PredictionSummarySchema = zod_1.z.object({
  total_predictions: zod_1.z.number().int().min(0),
  high_success_probability: zod_1.z.number().int().min(0),
  medium_success_probability: zod_1.z.number().int().min(0),
  low_success_probability: zod_1.z.number().int().min(0),
  average_confidence: zod_1.z.number().min(0).max(1),
  recommendations_generated: zod_1.z.number().int().min(0),
});
exports.BatchPredictionResponseSchema = zod_1.z.object({
  predictions: zod_1.z.array(exports.PredictionResponseSchema),
  summary: exports.PredictionSummarySchema,
  processing_time: zod_1.z.number().min(0),
});
// Model Training Schemas
exports.TrainingRequestSchema = zod_1.z.object({
  model_name: zod_1.z.string().min(1),
  algorithm_type: zod_1.z.enum([
    "ensemble",
    "neural_network",
    "random_forest",
    "gradient_boosting",
    "svm",
  ]),
  training_parameters: zod_1.z.record(zod_1.z.any()),
  validation_split: zod_1.z.number().min(0).max(1).default(0.2),
  feature_selection: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.TrainingResponseSchema = zod_1.z.object({
  model_id: zod_1.z.string().uuid(),
  training_status: zod_1.z.enum(["started", "in_progress", "completed", "failed"]),
  estimated_completion: zod_1.z.string().datetime().optional(),
  progress_percentage: zod_1.z.number().min(0).max(100).optional(),
  performance_preview: exports.ModelPerformanceMetricsSchema.optional(),
});
// Filter Schemas
exports.PredictionFiltersSchema = zod_1.z
  .object({
    patient_id: zod_1.z.string().uuid().optional(),
    treatment_type: zod_1.z.string().optional(),
    prediction_score_min: zod_1.z.number().min(0).max(1).optional(),
    prediction_score_max: zod_1.z.number().min(0).max(1).optional(),
    risk_assessment: zod_1.z.enum(["low", "medium", "high"]).optional(),
    date_from: zod_1.z.string().datetime().optional(),
    date_to: zod_1.z.string().datetime().optional(),
    model_id: zod_1.z.string().uuid().optional(),
    outcome: zod_1.z.enum(["success", "partial_success", "failure"]).optional(),
    accuracy_validated: zod_1.z.boolean().optional(),
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
exports.ModelFiltersSchema = zod_1.z.object({
  status: zod_1.z.enum(["training", "active", "deprecated"]).optional(),
  algorithm_type: zod_1.z
    .enum(["ensemble", "neural_network", "random_forest", "gradient_boosting", "svm"])
    .optional(),
  accuracy_min: zod_1.z.number().min(0).max(1).optional(),
  version: zod_1.z.string().optional(),
  created_from: zod_1.z.string().datetime().optional(),
  created_to: zod_1.z.string().datetime().optional(),
});
exports.PerformanceFiltersSchema = zod_1.z.object({
  model_id: zod_1.z.string().uuid().optional(),
  accuracy_min: zod_1.z.number().min(0).max(1).optional(),
  evaluation_date_from: zod_1.z.string().datetime().optional(),
  evaluation_date_to: zod_1.z.string().datetime().optional(),
  improvement_percentage_min: zod_1.z.number().optional(),
});
// Update Schemas
var UpdateTreatmentPredictionSchema = exports.TreatmentPredictionSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});
exports.UpdateTreatmentPredictionSchema = UpdateTreatmentPredictionSchema;
var UpdatePredictionModelSchema = exports.PredictionModelSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});
exports.UpdatePredictionModelSchema = UpdatePredictionModelSchema;
var UpdatePatientFactorsSchema = exports.PatientFactorsSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});
exports.UpdatePatientFactorsSchema = UpdatePatientFactorsSchema;
var UpdateTreatmentCharacteristicsSchema = exports.TreatmentCharacteristicsSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});
exports.UpdateTreatmentCharacteristicsSchema = UpdateTreatmentCharacteristicsSchema;
