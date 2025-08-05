"use strict";
// Story 9.2: Personalized Treatment Recommendations - Zod Validation Schemas
// Comprehensive validation schemas for AI-powered personalized treatment recommendations
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceQuerySchema =
  exports.feedbackQuerySchema =
  exports.recommendationQuerySchema =
  exports.recordPerformanceRequestSchema =
  exports.createProtocolCustomizationRequestSchema =
  exports.updateSafetyProfileRequestSchema =
  exports.createPersonalizationFactorRequestSchema =
  exports.createRecommendationFeedbackRequestSchema =
  exports.approveRecommendationRequestSchema =
  exports.createTreatmentRecommendationRequestSchema =
  exports.updateRecommendationProfileRequestSchema =
  exports.createRecommendationProfileRequestSchema =
  exports.recommendationPerformanceSchema =
  exports.protocolCustomizationSchema =
  exports.protocolModificationSchema =
  exports.safetyProfileSchema =
  exports.safetyAlertSchema =
  exports.medicalConditionSchema =
  exports.drugInteractionSchema =
  exports.allergySchema =
  exports.personalizationFactorSchema =
  exports.recommendationFeedbackSchema =
  exports.treatmentRecommendationSchema =
  exports.treatmentAlternativeSchema =
  exports.contraindicationSchema =
  exports.riskAssessmentSchema =
  exports.treatmentOptionSchema =
  exports.recommendationProfileSchema =
    void 0;
var zod_1 = require("zod");
// Core validation schemas
exports.recommendationProfileSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  patient_id: zod_1.z.string().uuid(),
  profile_data: zod_1.z.record(zod_1.z.any()).default({}),
  preference_weights: zod_1.z.record(zod_1.z.number().min(0).max(1)).default({}),
  lifestyle_factors: zod_1.z.record(zod_1.z.any()).default({}),
  medical_preferences: zod_1.z.record(zod_1.z.any()).default({}),
  communication_preferences: zod_1.z.record(zod_1.z.any()).default({}),
  last_updated: zod_1.z.string().datetime().optional(),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
});
exports.treatmentOptionSchema = zod_1.z.object({
  id: zod_1.z.string(),
  name: zod_1.z.string().min(1).max(200),
  type: zod_1.z.enum([
    "aesthetic",
    "dermatological",
    "cosmetic",
    "therapeutic",
    "preventive",
    "maintenance",
  ]),
  description: zod_1.z.string().min(10).max(1000),
  duration: zod_1.z.string(),
  intensity: zod_1.z.enum(["minimal", "mild", "moderate", "intensive", "aggressive"]),
  cost_estimate: zod_1.z.number().min(0),
  success_probability: zod_1.z.number().min(0).max(1),
  risk_level: zod_1.z.enum(["very_low", "low", "moderate", "high", "very_high"]),
  contraindications: zod_1.z.array(zod_1.z.string()),
  requirements: zod_1.z.array(zod_1.z.string()),
  alternatives: zod_1.z.array(zod_1.z.string()),
});
exports.riskAssessmentSchema = zod_1.z.object({
  risk_level: zod_1.z.enum(["very_low", "low", "moderate", "high", "very_high"]),
  risk_factors: zod_1.z.array(
    zod_1.z.object({
      id: zod_1.z.string(),
      factor_name: zod_1.z.string(),
      factor_type: zod_1.z.enum([
        "genetic",
        "environmental",
        "behavioral",
        "medical",
        "social",
        "occupational",
      ]),
      risk_level: zod_1.z.enum(["very_low", "low", "moderate", "high", "very_high"]),
      description: zod_1.z.string(),
      mitigation_strategies: zod_1.z.array(zod_1.z.string()),
    }),
  ),
  mitigation_strategies: zod_1.z.array(zod_1.z.string()),
  monitoring_requirements: zod_1.z.array(zod_1.z.string()),
  safety_precautions: zod_1.z.array(zod_1.z.string()),
});
exports.contraindicationSchema = zod_1.z.object({
  id: zod_1.z.string(),
  type: zod_1.z.enum(["absolute", "relative", "temporary", "conditional"]),
  severity: zod_1.z.enum(["mild", "moderate", "severe", "critical"]),
  description: zod_1.z.string().min(5).max(500),
  reason: zod_1.z.string().min(5).max(500),
  alternatives: zod_1.z.array(zod_1.z.string()),
});
exports.treatmentAlternativeSchema = zod_1.z.object({
  option: exports.treatmentOptionSchema,
  ranking_score: zod_1.z.number().min(0).max(1),
  comparison_rationale: zod_1.z.string().min(10).max(1000),
  pros: zod_1.z.array(zod_1.z.string()),
  cons: zod_1.z.array(zod_1.z.string()),
  suitability_score: zod_1.z.number().min(0).max(1),
});
exports.treatmentRecommendationSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  patient_id: zod_1.z.string().uuid(),
  provider_id: zod_1.z.string().uuid(),
  recommendation_type: zod_1.z.enum([
    "primary_treatment",
    "alternative_therapy",
    "combination_therapy",
    "preventive_care",
    "maintenance_therapy",
    "adjuvant_treatment",
  ]),
  treatment_options: zod_1.z.array(exports.treatmentOptionSchema),
  ranking_scores: zod_1.z.record(zod_1.z.number().min(0).max(1)),
  rationale: zod_1.z.string().min(10).max(2000),
  success_probabilities: zod_1.z.record(zod_1.z.number().min(0).max(1)),
  risk_assessments: zod_1.z.record(exports.riskAssessmentSchema),
  contraindications: zod_1.z.array(exports.contraindicationSchema),
  alternatives: zod_1.z.array(exports.treatmentAlternativeSchema),
  status: zod_1.z
    .enum(["pending", "approved", "rejected", "implemented", "completed", "expired"])
    .default("pending"),
  approved_by: zod_1.z.string().uuid().optional(),
  approved_at: zod_1.z.string().datetime().optional(),
  expires_at: zod_1.z.string().datetime().optional(),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
});
exports.recommendationFeedbackSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  recommendation_id: zod_1.z.string().uuid(),
  provider_id: zod_1.z.string().uuid(),
  feedback_type: zod_1.z.enum([
    "accuracy",
    "usefulness",
    "adoption",
    "quality",
    "improvement",
    "general",
  ]),
  adoption_status: zod_1.z.enum([
    "adopted",
    "modified",
    "rejected",
    "pending",
    "partially_adopted",
  ]),
  quality_rating: zod_1.z.number().min(1).max(5),
  usefulness_rating: zod_1.z.number().min(1).max(5),
  accuracy_rating: zod_1.z.number().min(1).max(5),
  comments: zod_1.z.string().max(2000).optional(),
  improvement_suggestions: zod_1.z.string().max(2000).optional(),
  would_recommend: zod_1.z.boolean().default(false),
  created_at: zod_1.z.string().datetime().optional(),
});
exports.personalizationFactorSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  patient_id: zod_1.z.string().uuid(),
  factor_type: zod_1.z.enum([
    "demographic",
    "medical_history",
    "lifestyle",
    "preference",
    "behavioral",
    "genetic",
    "environmental",
  ]),
  factor_category: zod_1.z.enum([
    "age_related",
    "gender_specific",
    "medical_condition",
    "treatment_history",
    "lifestyle_choice",
    "patient_preference",
    "risk_factor",
    "compliance_indicator",
  ]),
  factor_value: zod_1.z.record(zod_1.z.any()),
  weight: zod_1.z.number().min(0).max(1).default(1.0),
  source: zod_1.z.enum([
    "medical_record",
    "patient_survey",
    "clinical_assessment",
    "lab_results",
    "imaging_study",
    "family_history",
    "lifestyle_assessment",
    "behavioral_analysis",
  ]),
  confidence_score: zod_1.z.number().min(0).max(1).default(0.5),
  last_verified: zod_1.z.string().datetime().optional(),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
});
exports.allergySchema = zod_1.z.object({
  id: zod_1.z.string(),
  allergen: zod_1.z.string().min(1).max(200),
  type: zod_1.z.enum(["drug", "environmental", "food", "contact", "seasonal"]),
  severity: zod_1.z.enum(["mild", "moderate", "severe", "critical"]),
  symptoms: zod_1.z.array(zod_1.z.string()),
  cross_reactions: zod_1.z.array(zod_1.z.string()),
  avoidance_instructions: zod_1.z.array(zod_1.z.string()),
});
exports.drugInteractionSchema = zod_1.z.object({
  id: zod_1.z.string(),
  drug_a: zod_1.z.string().min(1).max(200),
  drug_b: zod_1.z.string().min(1).max(200),
  interaction_type: zod_1.z.enum([
    "antagonistic",
    "synergistic",
    "additive",
    "competitive",
    "incompatible",
  ]),
  severity: zod_1.z.enum(["mild", "moderate", "severe", "critical"]),
  description: zod_1.z.string().min(10).max(1000),
  management: zod_1.z.string().min(5).max(500),
});
exports.medicalConditionSchema = zod_1.z.object({
  id: zod_1.z.string(),
  condition: zod_1.z.string().min(1).max(200),
  icd_code: zod_1.z.string().optional(),
  status: zod_1.z.enum(["active", "inactive", "resolved", "chronic", "acute", "managed"]),
  severity: zod_1.z.enum(["mild", "moderate", "severe", "critical"]),
  onset_date: zod_1.z.string().datetime().optional(),
  notes: zod_1.z.string().max(1000).optional(),
  relevant_factors: zod_1.z.array(zod_1.z.string()),
});
exports.safetyAlertSchema = zod_1.z.object({
  id: zod_1.z.string(),
  alert_type: zod_1.z.enum([
    "contraindication",
    "allergy",
    "interaction",
    "safety",
    "monitoring",
    "dose_adjustment",
  ]),
  severity: zod_1.z.enum(["mild", "moderate", "severe", "critical"]),
  message: zod_1.z.string().min(5).max(500),
  recommendations: zod_1.z.array(zod_1.z.string()),
  expires_at: zod_1.z.string().datetime().optional(),
});
exports.safetyProfileSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  patient_id: zod_1.z.string().uuid(),
  allergies: zod_1.z.array(exports.allergySchema).default([]),
  contraindications: zod_1.z.array(exports.contraindicationSchema).default([]),
  drug_interactions: zod_1.z.array(exports.drugInteractionSchema).default([]),
  medical_conditions: zod_1.z.array(exports.medicalConditionSchema).default([]),
  risk_factors: zod_1.z
    .array(
      zod_1.z.object({
        id: zod_1.z.string(),
        factor_name: zod_1.z.string(),
        factor_type: zod_1.z.enum([
          "genetic",
          "environmental",
          "behavioral",
          "medical",
          "social",
          "occupational",
        ]),
        risk_level: zod_1.z.enum(["very_low", "low", "moderate", "high", "very_high"]),
        description: zod_1.z.string(),
        mitigation_strategies: zod_1.z.array(zod_1.z.string()),
      }),
    )
    .default([]),
  safety_alerts: zod_1.z.array(exports.safetyAlertSchema).default([]),
  last_reviewed: zod_1.z.string().datetime().optional(),
  reviewed_by: zod_1.z.string().uuid().optional(),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
});
exports.protocolModificationSchema = zod_1.z.object({
  modification_type: zod_1.z.enum([
    "dose_adjustment",
    "frequency_change",
    "duration_modification",
    "technique_alteration",
    "timing_adjustment",
    "intensity_modification",
  ]),
  original_value: zod_1.z.any(),
  modified_value: zod_1.z.any(),
  rationale: zod_1.z.string().min(10).max(1000),
  approval_required: zod_1.z.boolean(),
});
exports.protocolCustomizationSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  patient_id: zod_1.z.string().uuid(),
  protocol_id: zod_1.z.string().min(1).max(100),
  customizations: zod_1.z.record(zod_1.z.any()).default({}),
  personalization_rules: zod_1.z.record(zod_1.z.any()).default({}),
  modifications: zod_1.z.array(exports.protocolModificationSchema).default([]),
  approval_status: zod_1.z
    .enum(["pending", "approved", "rejected", "requires_review", "expired"])
    .default("pending"),
  customized_by: zod_1.z.string().uuid(),
  approved_by: zod_1.z.string().uuid().optional(),
  effective_date: zod_1.z.string().datetime().optional(),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
});
exports.recommendationPerformanceSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  recommendation_id: zod_1.z.string().uuid(),
  patient_id: zod_1.z.string().uuid(),
  adoption_rate: zod_1.z.number().min(0).max(100),
  effectiveness_score: zod_1.z.number().min(0).max(1),
  patient_satisfaction: zod_1.z.number().min(1).max(5),
  provider_satisfaction: zod_1.z.number().min(1).max(5),
  outcome_quality: zod_1.z.number().min(1).max(5),
  time_to_adoption: zod_1.z.string().optional(),
  success_indicators: zod_1.z.record(zod_1.z.any()).default({}),
  measured_at: zod_1.z.string().datetime().optional(),
  created_at: zod_1.z.string().datetime().optional(),
});
// Request validation schemas
exports.createRecommendationProfileRequestSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid(),
  profile_data: zod_1.z.record(zod_1.z.any()).default({}),
  preference_weights: zod_1.z.record(zod_1.z.number().min(0).max(1)).optional(),
  lifestyle_factors: zod_1.z.record(zod_1.z.any()).optional(),
  medical_preferences: zod_1.z.record(zod_1.z.any()).optional(),
  communication_preferences: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.updateRecommendationProfileRequestSchema = zod_1.z.object({
  profile_data: zod_1.z.record(zod_1.z.any()).optional(),
  preference_weights: zod_1.z.record(zod_1.z.number().min(0).max(1)).optional(),
  lifestyle_factors: zod_1.z.record(zod_1.z.any()).optional(),
  medical_preferences: zod_1.z.record(zod_1.z.any()).optional(),
  communication_preferences: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.createTreatmentRecommendationRequestSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid(),
  recommendation_type: zod_1.z.enum([
    "primary_treatment",
    "alternative_therapy",
    "combination_therapy",
    "preventive_care",
    "maintenance_therapy",
    "adjuvant_treatment",
  ]),
  treatment_options: zod_1.z.array(exports.treatmentOptionSchema),
  rationale: zod_1.z.string().min(10).max(2000).optional(),
});
exports.approveRecommendationRequestSchema = zod_1.z.object({
  approved_by: zod_1.z.string().uuid(),
  approval_notes: zod_1.z.string().max(1000).optional(),
  modifications: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.createRecommendationFeedbackRequestSchema = zod_1.z.object({
  recommendation_id: zod_1.z.string().uuid(),
  feedback_type: zod_1.z.enum([
    "accuracy",
    "usefulness",
    "adoption",
    "quality",
    "improvement",
    "general",
  ]),
  adoption_status: zod_1.z.enum([
    "adopted",
    "modified",
    "rejected",
    "pending",
    "partially_adopted",
  ]),
  quality_rating: zod_1.z.number().min(1).max(5),
  usefulness_rating: zod_1.z.number().min(1).max(5),
  accuracy_rating: zod_1.z.number().min(1).max(5),
  comments: zod_1.z.string().max(2000).optional(),
  improvement_suggestions: zod_1.z.string().max(2000).optional(),
  would_recommend: zod_1.z.boolean(),
});
exports.createPersonalizationFactorRequestSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid(),
  factor_type: zod_1.z.enum([
    "demographic",
    "medical_history",
    "lifestyle",
    "preference",
    "behavioral",
    "genetic",
    "environmental",
  ]),
  factor_category: zod_1.z.enum([
    "age_related",
    "gender_specific",
    "medical_condition",
    "treatment_history",
    "lifestyle_choice",
    "patient_preference",
    "risk_factor",
    "compliance_indicator",
  ]),
  factor_value: zod_1.z.record(zod_1.z.any()),
  weight: zod_1.z.number().min(0).max(1).optional(),
  source: zod_1.z.enum([
    "medical_record",
    "patient_survey",
    "clinical_assessment",
    "lab_results",
    "imaging_study",
    "family_history",
    "lifestyle_assessment",
    "behavioral_analysis",
  ]),
  confidence_score: zod_1.z.number().min(0).max(1).optional(),
});
exports.updateSafetyProfileRequestSchema = zod_1.z.object({
  allergies: zod_1.z.array(exports.allergySchema).optional(),
  contraindications: zod_1.z.array(exports.contraindicationSchema).optional(),
  drug_interactions: zod_1.z.array(exports.drugInteractionSchema).optional(),
  medical_conditions: zod_1.z.array(exports.medicalConditionSchema).optional(),
  risk_factors: zod_1.z
    .array(
      zod_1.z.object({
        id: zod_1.z.string(),
        factor_name: zod_1.z.string(),
        factor_type: zod_1.z.enum([
          "genetic",
          "environmental",
          "behavioral",
          "medical",
          "social",
          "occupational",
        ]),
        risk_level: zod_1.z.enum(["very_low", "low", "moderate", "high", "very_high"]),
        description: zod_1.z.string(),
        mitigation_strategies: zod_1.z.array(zod_1.z.string()),
      }),
    )
    .optional(),
  safety_alerts: zod_1.z.array(exports.safetyAlertSchema).optional(),
});
exports.createProtocolCustomizationRequestSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid(),
  protocol_id: zod_1.z.string().min(1).max(100),
  customizations: zod_1.z.record(zod_1.z.any()),
  personalization_rules: zod_1.z.record(zod_1.z.any()),
  modifications: zod_1.z.array(exports.protocolModificationSchema),
});
exports.recordPerformanceRequestSchema = zod_1.z.object({
  recommendation_id: zod_1.z.string().uuid(),
  patient_id: zod_1.z.string().uuid(),
  adoption_rate: zod_1.z.number().min(0).max(100),
  effectiveness_score: zod_1.z.number().min(0).max(1),
  patient_satisfaction: zod_1.z.number().min(1).max(5),
  provider_satisfaction: zod_1.z.number().min(1).max(5),
  outcome_quality: zod_1.z.number().min(1).max(5),
  time_to_adoption: zod_1.z.string().optional(),
  success_indicators: zod_1.z.record(zod_1.z.any()),
});
// Query parameter schemas
exports.recommendationQuerySchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid().optional(),
  provider_id: zod_1.z.string().uuid().optional(),
  status: zod_1.z
    .enum(["pending", "approved", "rejected", "implemented", "completed", "expired"])
    .optional(),
  recommendation_type: zod_1.z
    .enum([
      "primary_treatment",
      "alternative_therapy",
      "combination_therapy",
      "preventive_care",
      "maintenance_therapy",
      "adjuvant_treatment",
    ])
    .optional(),
  limit: zod_1.z.coerce.number().min(1).max(100).default(20),
  offset: zod_1.z.coerce.number().min(0).default(0),
  sort_by: zod_1.z.enum(["created_at", "updated_at", "ranking_score"]).default("created_at"),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
exports.feedbackQuerySchema = zod_1.z.object({
  recommendation_id: zod_1.z.string().uuid().optional(),
  provider_id: zod_1.z.string().uuid().optional(),
  feedback_type: zod_1.z
    .enum(["accuracy", "usefulness", "adoption", "quality", "improvement", "general"])
    .optional(),
  adoption_status: zod_1.z
    .enum(["adopted", "modified", "rejected", "pending", "partially_adopted"])
    .optional(),
  limit: zod_1.z.coerce.number().min(1).max(100).default(20),
  offset: zod_1.z.coerce.number().min(0).default(0),
  sort_by: zod_1.z
    .enum(["created_at", "quality_rating", "usefulness_rating"])
    .default("created_at"),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
exports.performanceQuerySchema = zod_1.z.object({
  recommendation_id: zod_1.z.string().uuid().optional(),
  patient_id: zod_1.z.string().uuid().optional(),
  date_from: zod_1.z.string().datetime().optional(),
  date_to: zod_1.z.string().datetime().optional(),
  min_adoption_rate: zod_1.z.coerce.number().min(0).max(100).optional(),
  min_effectiveness: zod_1.z.coerce.number().min(0).max(1).optional(),
  limit: zod_1.z.coerce.number().min(1).max(100).default(20),
  offset: zod_1.z.coerce.number().min(0).default(0),
});
