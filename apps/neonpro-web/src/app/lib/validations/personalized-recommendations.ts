// Story 9.2: Personalized Treatment Recommendations - Zod Validation Schemas
// Comprehensive validation schemas for AI-powered personalized treatment recommendations

import type { z } from "zod";

// Core validation schemas
export const recommendationProfileSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  profile_data: z.record(z.any()).default({}),
  preference_weights: z.record(z.number().min(0).max(1)).default({}),
  lifestyle_factors: z.record(z.any()).default({}),
  medical_preferences: z.record(z.any()).default({}),
  communication_preferences: z.record(z.any()).default({}),
  last_updated: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const treatmentOptionSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  type: z.enum([
    "aesthetic",
    "dermatological",
    "cosmetic",
    "therapeutic",
    "preventive",
    "maintenance",
  ]),
  description: z.string().min(10).max(1000),
  duration: z.string(),
  intensity: z.enum(["minimal", "mild", "moderate", "intensive", "aggressive"]),
  cost_estimate: z.number().min(0),
  success_probability: z.number().min(0).max(1),
  risk_level: z.enum(["very_low", "low", "moderate", "high", "very_high"]),
  contraindications: z.array(z.string()),
  requirements: z.array(z.string()),
  alternatives: z.array(z.string()),
});

export const riskAssessmentSchema = z.object({
  risk_level: z.enum(["very_low", "low", "moderate", "high", "very_high"]),
  risk_factors: z.array(
    z.object({
      id: z.string(),
      factor_name: z.string(),
      factor_type: z.enum([
        "genetic",
        "environmental",
        "behavioral",
        "medical",
        "social",
        "occupational",
      ]),
      risk_level: z.enum(["very_low", "low", "moderate", "high", "very_high"]),
      description: z.string(),
      mitigation_strategies: z.array(z.string()),
    }),
  ),
  mitigation_strategies: z.array(z.string()),
  monitoring_requirements: z.array(z.string()),
  safety_precautions: z.array(z.string()),
});

export const contraindicationSchema = z.object({
  id: z.string(),
  type: z.enum(["absolute", "relative", "temporary", "conditional"]),
  severity: z.enum(["mild", "moderate", "severe", "critical"]),
  description: z.string().min(5).max(500),
  reason: z.string().min(5).max(500),
  alternatives: z.array(z.string()),
});

export const treatmentAlternativeSchema = z.object({
  option: treatmentOptionSchema,
  ranking_score: z.number().min(0).max(1),
  comparison_rationale: z.string().min(10).max(1000),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  suitability_score: z.number().min(0).max(1),
});

export const treatmentRecommendationSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  recommendation_type: z.enum([
    "primary_treatment",
    "alternative_therapy",
    "combination_therapy",
    "preventive_care",
    "maintenance_therapy",
    "adjuvant_treatment",
  ]),
  treatment_options: z.array(treatmentOptionSchema),
  ranking_scores: z.record(z.number().min(0).max(1)),
  rationale: z.string().min(10).max(2000),
  success_probabilities: z.record(z.number().min(0).max(1)),
  risk_assessments: z.record(riskAssessmentSchema),
  contraindications: z.array(contraindicationSchema),
  alternatives: z.array(treatmentAlternativeSchema),
  status: z
    .enum(["pending", "approved", "rejected", "implemented", "completed", "expired"])
    .default("pending"),
  approved_by: z.string().uuid().optional(),
  approved_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const recommendationFeedbackSchema = z.object({
  id: z.string().uuid().optional(),
  recommendation_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  feedback_type: z.enum([
    "accuracy",
    "usefulness",
    "adoption",
    "quality",
    "improvement",
    "general",
  ]),
  adoption_status: z.enum(["adopted", "modified", "rejected", "pending", "partially_adopted"]),
  quality_rating: z.number().min(1).max(5),
  usefulness_rating: z.number().min(1).max(5),
  accuracy_rating: z.number().min(1).max(5),
  comments: z.string().max(2000).optional(),
  improvement_suggestions: z.string().max(2000).optional(),
  would_recommend: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
});

export const personalizationFactorSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  factor_type: z.enum([
    "demographic",
    "medical_history",
    "lifestyle",
    "preference",
    "behavioral",
    "genetic",
    "environmental",
  ]),
  factor_category: z.enum([
    "age_related",
    "gender_specific",
    "medical_condition",
    "treatment_history",
    "lifestyle_choice",
    "patient_preference",
    "risk_factor",
    "compliance_indicator",
  ]),
  factor_value: z.record(z.any()),
  weight: z.number().min(0).max(1).default(1.0),
  source: z.enum([
    "medical_record",
    "patient_survey",
    "clinical_assessment",
    "lab_results",
    "imaging_study",
    "family_history",
    "lifestyle_assessment",
    "behavioral_analysis",
  ]),
  confidence_score: z.number().min(0).max(1).default(0.5),
  last_verified: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const allergySchema = z.object({
  id: z.string(),
  allergen: z.string().min(1).max(200),
  type: z.enum(["drug", "environmental", "food", "contact", "seasonal"]),
  severity: z.enum(["mild", "moderate", "severe", "critical"]),
  symptoms: z.array(z.string()),
  cross_reactions: z.array(z.string()),
  avoidance_instructions: z.array(z.string()),
});

export const drugInteractionSchema = z.object({
  id: z.string(),
  drug_a: z.string().min(1).max(200),
  drug_b: z.string().min(1).max(200),
  interaction_type: z.enum([
    "antagonistic",
    "synergistic",
    "additive",
    "competitive",
    "incompatible",
  ]),
  severity: z.enum(["mild", "moderate", "severe", "critical"]),
  description: z.string().min(10).max(1000),
  management: z.string().min(5).max(500),
});

export const medicalConditionSchema = z.object({
  id: z.string(),
  condition: z.string().min(1).max(200),
  icd_code: z.string().optional(),
  status: z.enum(["active", "inactive", "resolved", "chronic", "acute", "managed"]),
  severity: z.enum(["mild", "moderate", "severe", "critical"]),
  onset_date: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
  relevant_factors: z.array(z.string()),
});

export const safetyAlertSchema = z.object({
  id: z.string(),
  alert_type: z.enum([
    "contraindication",
    "allergy",
    "interaction",
    "safety",
    "monitoring",
    "dose_adjustment",
  ]),
  severity: z.enum(["mild", "moderate", "severe", "critical"]),
  message: z.string().min(5).max(500),
  recommendations: z.array(z.string()),
  expires_at: z.string().datetime().optional(),
});

export const safetyProfileSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  allergies: z.array(allergySchema).default([]),
  contraindications: z.array(contraindicationSchema).default([]),
  drug_interactions: z.array(drugInteractionSchema).default([]),
  medical_conditions: z.array(medicalConditionSchema).default([]),
  risk_factors: z
    .array(
      z.object({
        id: z.string(),
        factor_name: z.string(),
        factor_type: z.enum([
          "genetic",
          "environmental",
          "behavioral",
          "medical",
          "social",
          "occupational",
        ]),
        risk_level: z.enum(["very_low", "low", "moderate", "high", "very_high"]),
        description: z.string(),
        mitigation_strategies: z.array(z.string()),
      }),
    )
    .default([]),
  safety_alerts: z.array(safetyAlertSchema).default([]),
  last_reviewed: z.string().datetime().optional(),
  reviewed_by: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const protocolModificationSchema = z.object({
  modification_type: z.enum([
    "dose_adjustment",
    "frequency_change",
    "duration_modification",
    "technique_alteration",
    "timing_adjustment",
    "intensity_modification",
  ]),
  original_value: z.any(),
  modified_value: z.any(),
  rationale: z.string().min(10).max(1000),
  approval_required: z.boolean(),
});

export const protocolCustomizationSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  protocol_id: z.string().min(1).max(100),
  customizations: z.record(z.any()).default({}),
  personalization_rules: z.record(z.any()).default({}),
  modifications: z.array(protocolModificationSchema).default([]),
  approval_status: z
    .enum(["pending", "approved", "rejected", "requires_review", "expired"])
    .default("pending"),
  customized_by: z.string().uuid(),
  approved_by: z.string().uuid().optional(),
  effective_date: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const recommendationPerformanceSchema = z.object({
  id: z.string().uuid().optional(),
  recommendation_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  adoption_rate: z.number().min(0).max(100),
  effectiveness_score: z.number().min(0).max(1),
  patient_satisfaction: z.number().min(1).max(5),
  provider_satisfaction: z.number().min(1).max(5),
  outcome_quality: z.number().min(1).max(5),
  time_to_adoption: z.string().optional(),
  success_indicators: z.record(z.any()).default({}),
  measured_at: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
});

// Request validation schemas
export const createRecommendationProfileRequestSchema = z.object({
  patient_id: z.string().uuid(),
  profile_data: z.record(z.any()).default({}),
  preference_weights: z.record(z.number().min(0).max(1)).optional(),
  lifestyle_factors: z.record(z.any()).optional(),
  medical_preferences: z.record(z.any()).optional(),
  communication_preferences: z.record(z.any()).optional(),
});

export const updateRecommendationProfileRequestSchema = z.object({
  profile_data: z.record(z.any()).optional(),
  preference_weights: z.record(z.number().min(0).max(1)).optional(),
  lifestyle_factors: z.record(z.any()).optional(),
  medical_preferences: z.record(z.any()).optional(),
  communication_preferences: z.record(z.any()).optional(),
});

export const createTreatmentRecommendationRequestSchema = z.object({
  patient_id: z.string().uuid(),
  recommendation_type: z.enum([
    "primary_treatment",
    "alternative_therapy",
    "combination_therapy",
    "preventive_care",
    "maintenance_therapy",
    "adjuvant_treatment",
  ]),
  treatment_options: z.array(treatmentOptionSchema),
  rationale: z.string().min(10).max(2000).optional(),
});

export const approveRecommendationRequestSchema = z.object({
  approved_by: z.string().uuid(),
  approval_notes: z.string().max(1000).optional(),
  modifications: z.record(z.any()).optional(),
});

export const createRecommendationFeedbackRequestSchema = z.object({
  recommendation_id: z.string().uuid(),
  feedback_type: z.enum([
    "accuracy",
    "usefulness",
    "adoption",
    "quality",
    "improvement",
    "general",
  ]),
  adoption_status: z.enum(["adopted", "modified", "rejected", "pending", "partially_adopted"]),
  quality_rating: z.number().min(1).max(5),
  usefulness_rating: z.number().min(1).max(5),
  accuracy_rating: z.number().min(1).max(5),
  comments: z.string().max(2000).optional(),
  improvement_suggestions: z.string().max(2000).optional(),
  would_recommend: z.boolean(),
});

export const createPersonalizationFactorRequestSchema = z.object({
  patient_id: z.string().uuid(),
  factor_type: z.enum([
    "demographic",
    "medical_history",
    "lifestyle",
    "preference",
    "behavioral",
    "genetic",
    "environmental",
  ]),
  factor_category: z.enum([
    "age_related",
    "gender_specific",
    "medical_condition",
    "treatment_history",
    "lifestyle_choice",
    "patient_preference",
    "risk_factor",
    "compliance_indicator",
  ]),
  factor_value: z.record(z.any()),
  weight: z.number().min(0).max(1).optional(),
  source: z.enum([
    "medical_record",
    "patient_survey",
    "clinical_assessment",
    "lab_results",
    "imaging_study",
    "family_history",
    "lifestyle_assessment",
    "behavioral_analysis",
  ]),
  confidence_score: z.number().min(0).max(1).optional(),
});

export const updateSafetyProfileRequestSchema = z.object({
  allergies: z.array(allergySchema).optional(),
  contraindications: z.array(contraindicationSchema).optional(),
  drug_interactions: z.array(drugInteractionSchema).optional(),
  medical_conditions: z.array(medicalConditionSchema).optional(),
  risk_factors: z
    .array(
      z.object({
        id: z.string(),
        factor_name: z.string(),
        factor_type: z.enum([
          "genetic",
          "environmental",
          "behavioral",
          "medical",
          "social",
          "occupational",
        ]),
        risk_level: z.enum(["very_low", "low", "moderate", "high", "very_high"]),
        description: z.string(),
        mitigation_strategies: z.array(z.string()),
      }),
    )
    .optional(),
  safety_alerts: z.array(safetyAlertSchema).optional(),
});

export const createProtocolCustomizationRequestSchema = z.object({
  patient_id: z.string().uuid(),
  protocol_id: z.string().min(1).max(100),
  customizations: z.record(z.any()),
  personalization_rules: z.record(z.any()),
  modifications: z.array(protocolModificationSchema),
});

export const recordPerformanceRequestSchema = z.object({
  recommendation_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  adoption_rate: z.number().min(0).max(100),
  effectiveness_score: z.number().min(0).max(1),
  patient_satisfaction: z.number().min(1).max(5),
  provider_satisfaction: z.number().min(1).max(5),
  outcome_quality: z.number().min(1).max(5),
  time_to_adoption: z.string().optional(),
  success_indicators: z.record(z.any()),
});

// Query parameter schemas
export const recommendationQuerySchema = z.object({
  patient_id: z.string().uuid().optional(),
  provider_id: z.string().uuid().optional(),
  status: z
    .enum(["pending", "approved", "rejected", "implemented", "completed", "expired"])
    .optional(),
  recommendation_type: z
    .enum([
      "primary_treatment",
      "alternative_therapy",
      "combination_therapy",
      "preventive_care",
      "maintenance_therapy",
      "adjuvant_treatment",
    ])
    .optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sort_by: z.enum(["created_at", "updated_at", "ranking_score"]).default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

export const feedbackQuerySchema = z.object({
  recommendation_id: z.string().uuid().optional(),
  provider_id: z.string().uuid().optional(),
  feedback_type: z
    .enum(["accuracy", "usefulness", "adoption", "quality", "improvement", "general"])
    .optional(),
  adoption_status: z
    .enum(["adopted", "modified", "rejected", "pending", "partially_adopted"])
    .optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sort_by: z.enum(["created_at", "quality_rating", "usefulness_rating"]).default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

export const performanceQuerySchema = z.object({
  recommendation_id: z.string().uuid().optional(),
  patient_id: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  min_adoption_rate: z.coerce.number().min(0).max(100).optional(),
  min_effectiveness: z.coerce.number().min(0).max(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// Type exports for use in other files
export type RecommendationProfile = z.infer<typeof recommendationProfileSchema>;
export type TreatmentRecommendation = z.infer<typeof treatmentRecommendationSchema>;
export type RecommendationFeedback = z.infer<typeof recommendationFeedbackSchema>;
export type PersonalizationFactor = z.infer<typeof personalizationFactorSchema>;
export type SafetyProfile = z.infer<typeof safetyProfileSchema>;
export type ProtocolCustomization = z.infer<typeof protocolCustomizationSchema>;
export type RecommendationPerformance = z.infer<typeof recommendationPerformanceSchema>;

export type CreateRecommendationProfileRequest = z.infer<
  typeof createRecommendationProfileRequestSchema
>;
export type UpdateRecommendationProfileRequest = z.infer<
  typeof updateRecommendationProfileRequestSchema
>;
export type CreateTreatmentRecommendationRequest = z.infer<
  typeof createTreatmentRecommendationRequestSchema
>;
export type ApproveRecommendationRequest = z.infer<typeof approveRecommendationRequestSchema>;
export type CreateRecommendationFeedbackRequest = z.infer<
  typeof createRecommendationFeedbackRequestSchema
>;
export type CreatePersonalizationFactorRequest = z.infer<
  typeof createPersonalizationFactorRequestSchema
>;
export type UpdateSafetyProfileRequest = z.infer<typeof updateSafetyProfileRequestSchema>;
export type CreateProtocolCustomizationRequest = z.infer<
  typeof createProtocolCustomizationRequestSchema
>;
export type RecordPerformanceRequest = z.infer<typeof recordPerformanceRequestSchema>;

export type RecommendationQuery = z.infer<typeof recommendationQuerySchema>;
export type FeedbackQuery = z.infer<typeof feedbackQuerySchema>;
export type PerformanceQuery = z.infer<typeof performanceQuerySchema>;
