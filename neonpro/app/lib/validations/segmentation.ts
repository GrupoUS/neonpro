// =====================================================================================
// PATIENT SEGMENTATION VALIDATION SCHEMAS
// Epic 7 - Story 7.1: Zod validation schemas for patient segmentation and AI insights
// =====================================================================================

import { z } from 'zod';

// =====================================================================================
// ENUM SCHEMAS
// =====================================================================================

export const SegmentTypeSchema = z.enum([
  'demographic',
  'behavioral',
  'clinical',
  'engagement',
  'financial',
  'custom',
  'ai_generated'
]);

export const UpdateFrequencySchema = z.enum([
  'real_time',
  'hourly',
  'daily',
  'weekly',
  'monthly'
]);

export const EngagementLevelSchema = z.enum([
  'very_low',
  'low',
  'medium',
  'high',
  'very_high'
]);

export const RevenueTrendSchema = z.enum([
  'declining',
  'stable',
  'growing',
  'volatile'
]);

export const RiskLevelSchema = z.enum([
  'very_low',
  'low',
  'medium',
  'high',
  'very_high'
]);

export const HealthTrendSchema = z.enum([
  'declining',
  'stable',
  'improving',
  'fluctuating'
]);

export const ModelTypeSchema = z.enum([
  'classification',
  'clustering',
  'regression',
  'neural_network',
  'ensemble',
  'deep_learning'
]);

export const ModelStatusSchema = z.enum([
  'training',
  'validating',
  'testing',
  'ready',
  'deployed',
  'deprecated'
]);

export const PeriodTypeSchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly'
]);

// =====================================================================================
// CRITERIA AND RULES SCHEMAS
// =====================================================================================

export const CriteriaRuleSchema = z.object({
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains', 'between']),
  value: z.any(),
  field_type: z.enum(['string', 'number', 'date', 'boolean', 'array']).optional()
});

export const SegmentCriteriaSchema = z.record(z.string(), CriteriaRuleSchema);

export const RuleConditionSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains', 'between']),
  value: z.any(),
  weight: z.number().min(0).max(1).optional()
});

export const RuleLogicSchema: z.ZodType<any> = z.lazy(() => z.object({
  conditions: z.array(RuleConditionSchema),
  operator: z.enum(['AND', 'OR']),
  nested_rules: z.array(RuleLogicSchema).optional()
}));

// =====================================================================================
// PATIENT SEGMENT SCHEMAS
// =====================================================================================

export const PatientSegmentSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  
  // Segment Definition
  name: z.string().min(1, 'Segment name is required').max(255),
  description: z.string().max(1000).optional(),
  segment_type: SegmentTypeSchema,
  ai_generated: z.boolean().default(false),
  
  // Segmentation Criteria
  criteria: SegmentCriteriaSchema,
  ai_criteria: SegmentCriteriaSchema.optional(),
  
  // Performance Metrics
  accuracy_score: z.number().min(0).max(1).optional(),
  confidence_score: z.number().min(0).max(1).optional(),
  member_count: z.number().int().min(0).default(0),
  
  // Configuration
  is_active: z.boolean().default(true),
  auto_update: z.boolean().default(false),
  update_frequency: UpdateFrequencySchema.default('weekly'),
  
  // Metadata
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().uuid().optional()
});

export const CreateSegmentSchema = z.object({
  name: z.string().min(1, 'Segment name is required').max(255),
  description: z.string().max(1000).optional(),
  segment_type: SegmentTypeSchema,
  criteria: SegmentCriteriaSchema,
  auto_update: z.boolean().default(false),
  update_frequency: UpdateFrequencySchema.default('weekly')
});

export const UpdateSegmentSchema = CreateSegmentSchema.partial().extend({
  is_active: z.boolean().optional()
});

// =====================================================================================
// PATIENT SEGMENT MEMBERSHIP SCHEMAS
// =====================================================================================

export const TreatmentPropensitySchema = z.record(
  z.string(),
  z.object({
    probability: z.number().min(0).max(1),
    confidence: z.number().min(0).max(1),
    recommended_timing: z.string().optional(),
    factors: z.array(z.string())
  })
);

export const MembershipReasonSchema = z.object({
  criteria_matched: z.array(z.string()),
  ai_explanation: z.string().optional(),
  confidence_factors: z.record(z.string(), z.number())
});

export const PatientSegmentMembershipSchema = z.object({
  id: z.string().uuid(),
  segment_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  
  // Membership Metadata
  membership_score: z.number().min(0).max(1).optional(),
  membership_reason: MembershipReasonSchema.optional(),
  
  // AI Predictions
  predicted_lifetime_value: z.number().min(0).optional(),
  predicted_engagement_score: z.number().min(0).max(1).optional(),
  predicted_retention_probability: z.number().min(0).max(1).optional(),
  treatment_propensity: TreatmentPropensitySchema.optional(),
  
  // Tracking
  assigned_at: z.string().datetime(),
  last_validated: z.string().datetime(),
  is_active: z.boolean().default(true),
  auto_assigned: z.boolean().default(false)
});

// =====================================================================================
// PATIENT ANALYTICS SCHEMAS
// =====================================================================================

export const CommunicationPreferenceSchema = z.object({
  preferred_time: z.string().optional(),
  preferred_day: z.string().optional(),
  frequency_preference: z.enum(['high', 'medium', 'low']).optional(),
  channel_preference: z.array(z.string()).optional(),
  language: z.string().optional()
});

export const RecommendationSchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  confidence: z.number().min(0).max(1),
  priority: z.enum(['high', 'medium', 'low']),
  estimated_impact: z.string().optional(),
  timeline: z.string().optional()
});

export const NextBestActionSchema = z.object({
  action_type: z.string().min(1),
  description: z.string().min(1),
  urgency: z.enum(['high', 'medium', 'low']),
  expected_outcome: z.string().min(1),
  confidence: z.number().min(0).max(1)
});

export const AIInsightsSchema = z.object({
  key_insights: z.array(z.string()),
  recommendations: z.array(RecommendationSchema),
  risk_factors: z.array(z.string()),
  opportunities: z.array(z.string()),
  next_best_actions: z.array(NextBestActionSchema)
});

export const PersonalityProfileSchema = z.object({
  traits: z.record(z.string(), z.number().min(0).max(1)),
  communication_style: z.string(),
  decision_making_style: z.string(),
  motivation_factors: z.array(z.string())
});

export const PreferencePredictionsSchema = z.object({
  appointment_preferences: z.object({
    preferred_times: z.array(z.string()),
    preferred_days: z.array(z.string()),
    advance_booking_preference: z.number().int().min(0)
  }),
  treatment_preferences: z.record(z.string(), z.number().min(0).max(1)),
  communication_preferences: z.record(z.string(), z.number().min(0).max(1))
});

export const PatientAnalyticsSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  
  // Behavioral Analytics
  visit_frequency_score: z.number().min(0).max(1).optional(),
  appointment_compliance_rate: z.number().min(0).max(1).optional(),
  treatment_adherence_score: z.number().min(0).max(1).optional(),
  engagement_level: EngagementLevelSchema,
  
  // Financial Analytics
  total_lifetime_value: z.number().min(0).default(0),
  average_transaction_value: z.number().min(0).optional(),
  payment_reliability_score: z.number().min(0).max(1).optional(),
  revenue_trend: RevenueTrendSchema.optional(),
  
  // Clinical Analytics
  condition_complexity_score: z.number().min(0).max(1).optional(),
  treatment_response_rate: z.number().min(0).max(1).optional(),
  risk_level: RiskLevelSchema,
  health_improvement_trend: HealthTrendSchema.optional(),
  
  // Interaction Analytics
  communication_preference: CommunicationPreferenceSchema.optional(),
  preferred_channels: z.array(z.string()).optional(),
  response_rate_email: z.number().min(0).max(1).optional(),
  response_rate_sms: z.number().min(0).max(1).optional(),
  response_rate_phone: z.number().min(0).max(1).optional(),
  
  // AI Insights
  ai_insights: AIInsightsSchema.optional(),
  personality_profile: PersonalityProfileSchema.optional(),
  preference_predictions: PreferencePredictionsSchema.optional(),
  
  // ML Features
  feature_vector: z.array(z.number()).length(100).optional(),
  
  // Tracking
  last_calculated: z.string().datetime(),
  calculation_version: z.number().int().min(1).default(1)
});

// =====================================================================================
// SEGMENT PERFORMANCE SCHEMAS
// =====================================================================================

export const SegmentPerformanceSchema = z.object({
  id: z.string().uuid(),
  segment_id: z.string().uuid(),
  
  // Time Period
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
  period_type: PeriodTypeSchema,
  
  // Performance Metrics
  member_count: z.number().int().min(0).default(0),
  new_members: z.number().int().min(0).default(0),
  departed_members: z.number().int().min(0).default(0),
  member_retention_rate: z.number().min(0).max(1).optional(),
  
  // Engagement Metrics
  average_engagement_score: z.number().min(0).max(1).optional(),
  total_interactions: z.number().int().min(0).default(0),
  response_rate: z.number().min(0).max(1).optional(),
  conversion_rate: z.number().min(0).max(1).optional(),
  
  // Financial Metrics
  total_revenue: z.number().min(0).default(0),
  average_revenue_per_member: z.number().min(0).optional(),
  roi: z.number().optional(),
  
  // Campaign Performance
  campaigns_sent: z.number().int().min(0).default(0),
  campaign_open_rate: z.number().min(0).max(1).optional(),
  campaign_click_rate: z.number().min(0).max(1).optional(),
  campaign_conversion_rate: z.number().min(0).max(1).optional(),
  
  // Clinical Outcomes
  treatment_success_rate: z.number().min(0).max(1).optional(),
  patient_satisfaction_score: z.number().min(0).max(1).optional(),
  health_improvement_rate: z.number().min(0).max(1).optional(),
  
  // Metadata
  calculated_at: z.string().datetime()
}).refine(
  (data) => new Date(data.period_start) < new Date(data.period_end),
  {
    message: "Period start must be before period end",
    path: ["period_end"]
  }
);

// =====================================================================================
// AI MODEL SCHEMAS
// =====================================================================================

export const ModelParametersSchema = z.record(z.string(), z.any());

export const TrainingDataInfoSchema = z.object({
  dataset_size: z.number().int().min(1),
  training_period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  data_quality_score: z.number().min(0).max(1).optional(),
  feature_count: z.number().int().min(1),
  class_distribution: z.record(z.string(), z.number()).optional()
});

export const AIModelSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  
  // Model Information
  model_name: z.string().min(1).max(255),
  model_type: ModelTypeSchema,
  model_version: z.string().min(1).max(50),
  
  // Configuration
  parameters: ModelParametersSchema.optional(),
  training_data_info: TrainingDataInfoSchema.optional(),
  features_used: z.array(z.string()).optional(),
  
  // Performance Metrics
  accuracy: z.number().min(0).max(1).optional(),
  precision_score: z.number().min(0).max(1).optional(),
  recall: z.number().min(0).max(1).optional(),
  f1_score: z.number().min(0).max(1).optional(),
  auc_score: z.number().min(0).max(1).optional(),
  
  // Status
  status: ModelStatusSchema,
  is_active: z.boolean().default(false),
  deployment_date: z.string().datetime().optional(),
  
  // Metadata
  created_at: z.string().datetime(),
  trained_by: z.string().uuid().optional()
});

// =====================================================================================
// SEGMENTATION RULES SCHEMAS
// =====================================================================================

export const SegmentationRuleSchema = z.object({
  id: z.string().uuid(),
  segment_id: z.string().uuid(),
  
  // Rule Definition
  rule_name: z.string().min(1).max(255),
  rule_description: z.string().max(1000).optional(),
  rule_logic: RuleLogicSchema,
  
  // Configuration
  priority: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  requires_ai: z.boolean().default(false),
  
  // Performance
  matches_count: z.number().int().min(0).default(0),
  accuracy_rate: z.number().min(0).max(1).optional(),
  last_evaluated: z.string().datetime().optional(),
  
  // Metadata
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().uuid().optional()
});

export const CreateRuleSchema = z.object({
  rule_name: z.string().min(1).max(255),
  rule_description: z.string().max(1000).optional(),
  rule_logic: RuleLogicSchema,
  priority: z.number().int().min(0).default(0),
  requires_ai: z.boolean().default(false)
});

// =====================================================================================
// API REQUEST/RESPONSE SCHEMAS
// =====================================================================================

export const SegmentationQuerySchema = z.object({
  clinic_id: z.string().uuid(),
  segment_type: SegmentTypeSchema.optional(),
  is_active: z.boolean().optional(),
  ai_generated: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional()
});

export const SegmentMembersQuerySchema = z.object({
  segment_id: z.string().uuid(),
  include_inactive: z.boolean().default(false),
  min_score: z.number().min(0).max(1).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

export const BulkSegmentUpdateSchema = z.object({
  segment_id: z.string().uuid(),
  patient_ids: z.array(z.string().uuid()).min(1).max(1000),
  action: z.enum(['add', 'remove']),
  membership_reason: MembershipReasonSchema.optional()
});

export const SegmentValidationRequestSchema = z.object({
  criteria: SegmentCriteriaSchema,
  segment_type: SegmentTypeSchema,
  clinic_id: z.string().uuid()
});

// =====================================================================================
// DASHBOARD SCHEMAS
// =====================================================================================

export const FieldDefinitionSchema = z.object({
  field_name: z.string().min(1),
  display_name: z.string().min(1),
  field_type: z.enum(['string', 'number', 'date', 'boolean', 'select']),
  options: z.array(z.string()).optional(),
  min: z.number().optional(),
  max: z.number().optional()
});

export const OperatorDefinitionSchema = z.object({
  operator: z.string().min(1),
  display_name: z.string().min(1),
  compatible_types: z.array(z.string())
});

export const AISuggestionSchema = z.object({
  suggested_criteria: SegmentCriteriaSchema,
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(1),
  expected_members: z.number().int().min(0)
});

export const SegmentBuilderConfigSchema = z.object({
  available_fields: z.array(FieldDefinitionSchema),
  operators: z.array(OperatorDefinitionSchema),
  ai_suggestions: z.array(AISuggestionSchema).optional()
});

// =====================================================================================
// VALIDATION RESULT SCHEMAS
// =====================================================================================

export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string()
});

export const ValidationWarningSchema = z.object({
  field: z.string(),
  message: z.string(),
  suggestion: z.string().optional()
});

export const PerformancePredictionSchema = z.object({
  expected_engagement: z.number().min(0).max(1),
  expected_retention: z.number().min(0).max(1),
  expected_revenue_impact: z.number(),
  confidence: z.number().min(0).max(1)
});

export const SegmentValidationResultSchema = z.object({
  is_valid: z.boolean(),
  errors: z.array(ValidationErrorSchema),
  warnings: z.array(ValidationWarningSchema),
  estimated_members: z.number().int().min(0).optional(),
  performance_prediction: PerformancePredictionSchema.optional()
});

// =====================================================================================
// EXPORT ALL SCHEMAS
// =====================================================================================

export const SegmentationSchemas = {
  // Core Types
  SegmentType: SegmentTypeSchema,
  UpdateFrequency: UpdateFrequencySchema,
  EngagementLevel: EngagementLevelSchema,
  RevenueTrend: RevenueTrendSchema,
  RiskLevel: RiskLevelSchema,
  HealthTrend: HealthTrendSchema,
  ModelType: ModelTypeSchema,
  ModelStatus: ModelStatusSchema,
  PeriodType: PeriodTypeSchema,
  
  // Main Entities
  PatientSegment: PatientSegmentSchema,
  CreateSegment: CreateSegmentSchema,
  UpdateSegment: UpdateSegmentSchema,
  PatientSegmentMembership: PatientSegmentMembershipSchema,
  PatientAnalytics: PatientAnalyticsSchema,
  SegmentPerformance: SegmentPerformanceSchema,
  AIModel: AIModelSchema,
  SegmentationRule: SegmentationRuleSchema,
  CreateRule: CreateRuleSchema,
  
  // API Schemas
  SegmentationQuery: SegmentationQuerySchema,
  SegmentMembersQuery: SegmentMembersQuerySchema,
  BulkSegmentUpdate: BulkSegmentUpdateSchema,
  SegmentValidationRequest: SegmentValidationRequestSchema,
  SegmentValidationResult: SegmentValidationResultSchema,
  
  // Dashboard Schemas
  FieldDefinition: FieldDefinitionSchema,
  OperatorDefinition: OperatorDefinitionSchema,
  AISuggestion: AISuggestionSchema,
  SegmentBuilderConfig: SegmentBuilderConfigSchema
};
