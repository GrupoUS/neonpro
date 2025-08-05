"use strict";
// =====================================================================================
// PATIENT SEGMENTATION VALIDATION SCHEMAS
// Epic 7 - Story 7.1: Zod validation schemas for patient segmentation and AI insights
// =====================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentationSchemas = exports.SegmentValidationResultSchema = exports.PerformancePredictionSchema = exports.ValidationWarningSchema = exports.ValidationErrorSchema = exports.SegmentBuilderConfigSchema = exports.AISuggestionSchema = exports.OperatorDefinitionSchema = exports.FieldDefinitionSchema = exports.SegmentValidationRequestSchema = exports.BulkSegmentUpdateSchema = exports.SegmentMembersQuerySchema = exports.SegmentationQuerySchema = exports.CreateRuleSchema = exports.SegmentationRuleSchema = exports.AIModelSchema = exports.TrainingDataInfoSchema = exports.ModelParametersSchema = exports.SegmentPerformanceSchema = exports.PatientAnalyticsSchema = exports.PreferencePredictionsSchema = exports.PersonalityProfileSchema = exports.AIInsightsSchema = exports.NextBestActionSchema = exports.RecommendationSchema = exports.CommunicationPreferenceSchema = exports.PatientSegmentMembershipSchema = exports.MembershipReasonSchema = exports.TreatmentPropensitySchema = exports.UpdateSegmentSchema = exports.CreateSegmentSchema = exports.PatientSegmentSchema = exports.RuleLogicSchema = exports.RuleConditionSchema = exports.SegmentCriteriaSchema = exports.CriteriaRuleSchema = exports.PeriodTypeSchema = exports.ModelStatusSchema = exports.ModelTypeSchema = exports.HealthTrendSchema = exports.RiskLevelSchema = exports.RevenueTrendSchema = exports.EngagementLevelSchema = exports.UpdateFrequencySchema = exports.SegmentTypeSchema = void 0;
var zod_1 = require("zod");
// =====================================================================================
// ENUM SCHEMAS
// =====================================================================================
exports.SegmentTypeSchema = zod_1.z.enum([
    'demographic',
    'behavioral',
    'clinical',
    'engagement',
    'financial',
    'custom',
    'ai_generated'
]);
exports.UpdateFrequencySchema = zod_1.z.enum([
    'real_time',
    'hourly',
    'daily',
    'weekly',
    'monthly'
]);
exports.EngagementLevelSchema = zod_1.z.enum([
    'very_low',
    'low',
    'medium',
    'high',
    'very_high'
]);
exports.RevenueTrendSchema = zod_1.z.enum([
    'declining',
    'stable',
    'growing',
    'volatile'
]);
exports.RiskLevelSchema = zod_1.z.enum([
    'very_low',
    'low',
    'medium',
    'high',
    'very_high'
]);
exports.HealthTrendSchema = zod_1.z.enum([
    'declining',
    'stable',
    'improving',
    'fluctuating'
]);
exports.ModelTypeSchema = zod_1.z.enum([
    'classification',
    'clustering',
    'regression',
    'neural_network',
    'ensemble',
    'deep_learning'
]);
exports.ModelStatusSchema = zod_1.z.enum([
    'training',
    'validating',
    'testing',
    'ready',
    'deployed',
    'deprecated'
]);
exports.PeriodTypeSchema = zod_1.z.enum([
    'daily',
    'weekly',
    'monthly',
    'quarterly',
    'yearly'
]);
// =====================================================================================
// CRITERIA AND RULES SCHEMAS
// =====================================================================================
exports.CriteriaRuleSchema = zod_1.z.object({
    operator: zod_1.z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains', 'between']),
    value: zod_1.z.any(),
    field_type: zod_1.z.enum(['string', 'number', 'date', 'boolean', 'array']).optional()
});
exports.SegmentCriteriaSchema = zod_1.z.record(zod_1.z.string(), exports.CriteriaRuleSchema);
exports.RuleConditionSchema = zod_1.z.object({
    field: zod_1.z.string().min(1, 'Field is required'),
    operator: zod_1.z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains', 'between']),
    value: zod_1.z.any(),
    weight: zod_1.z.number().min(0).max(1).optional()
});
exports.RuleLogicSchema = zod_1.z.lazy(function () { return zod_1.z.object({
    conditions: zod_1.z.array(exports.RuleConditionSchema),
    operator: zod_1.z.enum(['AND', 'OR']),
    nested_rules: zod_1.z.array(exports.RuleLogicSchema).optional()
}); });
// =====================================================================================
// PATIENT SEGMENT SCHEMAS
// =====================================================================================
exports.PatientSegmentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    clinic_id: zod_1.z.string().uuid(),
    // Segment Definition
    name: zod_1.z.string().min(1, 'Segment name is required').max(255),
    description: zod_1.z.string().max(1000).optional(),
    segment_type: exports.SegmentTypeSchema,
    ai_generated: zod_1.z.boolean().default(false),
    // Segmentation Criteria
    criteria: exports.SegmentCriteriaSchema,
    ai_criteria: exports.SegmentCriteriaSchema.optional(),
    // Performance Metrics
    accuracy_score: zod_1.z.number().min(0).max(1).optional(),
    confidence_score: zod_1.z.number().min(0).max(1).optional(),
    member_count: zod_1.z.number().int().min(0).default(0),
    // Configuration
    is_active: zod_1.z.boolean().default(true),
    auto_update: zod_1.z.boolean().default(false),
    update_frequency: exports.UpdateFrequencySchema.default('weekly'),
    // Metadata
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
    created_by: zod_1.z.string().uuid().optional()
});
exports.CreateSegmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Segment name is required').max(255),
    description: zod_1.z.string().max(1000).optional(),
    segment_type: exports.SegmentTypeSchema,
    criteria: exports.SegmentCriteriaSchema,
    auto_update: zod_1.z.boolean().default(false),
    update_frequency: exports.UpdateFrequencySchema.default('weekly')
});
exports.UpdateSegmentSchema = exports.CreateSegmentSchema.partial().extend({
    is_active: zod_1.z.boolean().optional()
});
// =====================================================================================
// PATIENT SEGMENT MEMBERSHIP SCHEMAS
// =====================================================================================
exports.TreatmentPropensitySchema = zod_1.z.record(zod_1.z.string(), zod_1.z.object({
    probability: zod_1.z.number().min(0).max(1),
    confidence: zod_1.z.number().min(0).max(1),
    recommended_timing: zod_1.z.string().optional(),
    factors: zod_1.z.array(zod_1.z.string())
}));
exports.MembershipReasonSchema = zod_1.z.object({
    criteria_matched: zod_1.z.array(zod_1.z.string()),
    ai_explanation: zod_1.z.string().optional(),
    confidence_factors: zod_1.z.record(zod_1.z.string(), zod_1.z.number())
});
exports.PatientSegmentMembershipSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    segment_id: zod_1.z.string().uuid(),
    patient_id: zod_1.z.string().uuid(),
    // Membership Metadata
    membership_score: zod_1.z.number().min(0).max(1).optional(),
    membership_reason: exports.MembershipReasonSchema.optional(),
    // AI Predictions
    predicted_lifetime_value: zod_1.z.number().min(0).optional(),
    predicted_engagement_score: zod_1.z.number().min(0).max(1).optional(),
    predicted_retention_probability: zod_1.z.number().min(0).max(1).optional(),
    treatment_propensity: exports.TreatmentPropensitySchema.optional(),
    // Tracking
    assigned_at: zod_1.z.string().datetime(),
    last_validated: zod_1.z.string().datetime(),
    is_active: zod_1.z.boolean().default(true),
    auto_assigned: zod_1.z.boolean().default(false)
});
// =====================================================================================
// PATIENT ANALYTICS SCHEMAS
// =====================================================================================
exports.CommunicationPreferenceSchema = zod_1.z.object({
    preferred_time: zod_1.z.string().optional(),
    preferred_day: zod_1.z.string().optional(),
    frequency_preference: zod_1.z.enum(['high', 'medium', 'low']).optional(),
    channel_preference: zod_1.z.array(zod_1.z.string()).optional(),
    language: zod_1.z.string().optional()
});
exports.RecommendationSchema = zod_1.z.object({
    type: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    confidence: zod_1.z.number().min(0).max(1),
    priority: zod_1.z.enum(['high', 'medium', 'low']),
    estimated_impact: zod_1.z.string().optional(),
    timeline: zod_1.z.string().optional()
});
exports.NextBestActionSchema = zod_1.z.object({
    action_type: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    urgency: zod_1.z.enum(['high', 'medium', 'low']),
    expected_outcome: zod_1.z.string().min(1),
    confidence: zod_1.z.number().min(0).max(1)
});
exports.AIInsightsSchema = zod_1.z.object({
    key_insights: zod_1.z.array(zod_1.z.string()),
    recommendations: zod_1.z.array(exports.RecommendationSchema),
    risk_factors: zod_1.z.array(zod_1.z.string()),
    opportunities: zod_1.z.array(zod_1.z.string()),
    next_best_actions: zod_1.z.array(exports.NextBestActionSchema)
});
exports.PersonalityProfileSchema = zod_1.z.object({
    traits: zod_1.z.record(zod_1.z.string(), zod_1.z.number().min(0).max(1)),
    communication_style: zod_1.z.string(),
    decision_making_style: zod_1.z.string(),
    motivation_factors: zod_1.z.array(zod_1.z.string())
});
exports.PreferencePredictionsSchema = zod_1.z.object({
    appointment_preferences: zod_1.z.object({
        preferred_times: zod_1.z.array(zod_1.z.string()),
        preferred_days: zod_1.z.array(zod_1.z.string()),
        advance_booking_preference: zod_1.z.number().int().min(0)
    }),
    treatment_preferences: zod_1.z.record(zod_1.z.string(), zod_1.z.number().min(0).max(1)),
    communication_preferences: zod_1.z.record(zod_1.z.string(), zod_1.z.number().min(0).max(1))
});
exports.PatientAnalyticsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    patient_id: zod_1.z.string().uuid(),
    clinic_id: zod_1.z.string().uuid(),
    // Behavioral Analytics
    visit_frequency_score: zod_1.z.number().min(0).max(1).optional(),
    appointment_compliance_rate: zod_1.z.number().min(0).max(1).optional(),
    treatment_adherence_score: zod_1.z.number().min(0).max(1).optional(),
    engagement_level: exports.EngagementLevelSchema,
    // Financial Analytics
    total_lifetime_value: zod_1.z.number().min(0).default(0),
    average_transaction_value: zod_1.z.number().min(0).optional(),
    payment_reliability_score: zod_1.z.number().min(0).max(1).optional(),
    revenue_trend: exports.RevenueTrendSchema.optional(),
    // Clinical Analytics
    condition_complexity_score: zod_1.z.number().min(0).max(1).optional(),
    treatment_response_rate: zod_1.z.number().min(0).max(1).optional(),
    risk_level: exports.RiskLevelSchema,
    health_improvement_trend: exports.HealthTrendSchema.optional(),
    // Interaction Analytics
    communication_preference: exports.CommunicationPreferenceSchema.optional(),
    preferred_channels: zod_1.z.array(zod_1.z.string()).optional(),
    response_rate_email: zod_1.z.number().min(0).max(1).optional(),
    response_rate_sms: zod_1.z.number().min(0).max(1).optional(),
    response_rate_phone: zod_1.z.number().min(0).max(1).optional(),
    // AI Insights
    ai_insights: exports.AIInsightsSchema.optional(),
    personality_profile: exports.PersonalityProfileSchema.optional(),
    preference_predictions: exports.PreferencePredictionsSchema.optional(),
    // ML Features
    feature_vector: zod_1.z.array(zod_1.z.number()).length(100).optional(),
    // Tracking
    last_calculated: zod_1.z.string().datetime(),
    calculation_version: zod_1.z.number().int().min(1).default(1)
});
// =====================================================================================
// SEGMENT PERFORMANCE SCHEMAS
// =====================================================================================
exports.SegmentPerformanceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    segment_id: zod_1.z.string().uuid(),
    // Time Period
    period_start: zod_1.z.string().datetime(),
    period_end: zod_1.z.string().datetime(),
    period_type: exports.PeriodTypeSchema,
    // Performance Metrics
    member_count: zod_1.z.number().int().min(0).default(0),
    new_members: zod_1.z.number().int().min(0).default(0),
    departed_members: zod_1.z.number().int().min(0).default(0),
    member_retention_rate: zod_1.z.number().min(0).max(1).optional(),
    // Engagement Metrics
    average_engagement_score: zod_1.z.number().min(0).max(1).optional(),
    total_interactions: zod_1.z.number().int().min(0).default(0),
    response_rate: zod_1.z.number().min(0).max(1).optional(),
    conversion_rate: zod_1.z.number().min(0).max(1).optional(),
    // Financial Metrics
    total_revenue: zod_1.z.number().min(0).default(0),
    average_revenue_per_member: zod_1.z.number().min(0).optional(),
    roi: zod_1.z.number().optional(),
    // Campaign Performance
    campaigns_sent: zod_1.z.number().int().min(0).default(0),
    campaign_open_rate: zod_1.z.number().min(0).max(1).optional(),
    campaign_click_rate: zod_1.z.number().min(0).max(1).optional(),
    campaign_conversion_rate: zod_1.z.number().min(0).max(1).optional(),
    // Clinical Outcomes
    treatment_success_rate: zod_1.z.number().min(0).max(1).optional(),
    patient_satisfaction_score: zod_1.z.number().min(0).max(1).optional(),
    health_improvement_rate: zod_1.z.number().min(0).max(1).optional(),
    // Metadata
    calculated_at: zod_1.z.string().datetime()
}).refine(function (data) { return new Date(data.period_start) < new Date(data.period_end); }, {
    message: "Period start must be before period end",
    path: ["period_end"]
});
// =====================================================================================
// AI MODEL SCHEMAS
// =====================================================================================
exports.ModelParametersSchema = zod_1.z.record(zod_1.z.string(), zod_1.z.any());
exports.TrainingDataInfoSchema = zod_1.z.object({
    dataset_size: zod_1.z.number().int().min(1),
    training_period: zod_1.z.object({
        start: zod_1.z.string().datetime(),
        end: zod_1.z.string().datetime()
    }),
    data_quality_score: zod_1.z.number().min(0).max(1).optional(),
    feature_count: zod_1.z.number().int().min(1),
    class_distribution: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).optional()
});
exports.AIModelSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    clinic_id: zod_1.z.string().uuid(),
    // Model Information
    model_name: zod_1.z.string().min(1).max(255),
    model_type: exports.ModelTypeSchema,
    model_version: zod_1.z.string().min(1).max(50),
    // Configuration
    parameters: exports.ModelParametersSchema.optional(),
    training_data_info: exports.TrainingDataInfoSchema.optional(),
    features_used: zod_1.z.array(zod_1.z.string()).optional(),
    // Performance Metrics
    accuracy: zod_1.z.number().min(0).max(1).optional(),
    precision_score: zod_1.z.number().min(0).max(1).optional(),
    recall: zod_1.z.number().min(0).max(1).optional(),
    f1_score: zod_1.z.number().min(0).max(1).optional(),
    auc_score: zod_1.z.number().min(0).max(1).optional(),
    // Status
    status: exports.ModelStatusSchema,
    is_active: zod_1.z.boolean().default(false),
    deployment_date: zod_1.z.string().datetime().optional(),
    // Metadata
    created_at: zod_1.z.string().datetime(),
    trained_by: zod_1.z.string().uuid().optional()
});
// =====================================================================================
// SEGMENTATION RULES SCHEMAS
// =====================================================================================
exports.SegmentationRuleSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    segment_id: zod_1.z.string().uuid(),
    // Rule Definition
    rule_name: zod_1.z.string().min(1).max(255),
    rule_description: zod_1.z.string().max(1000).optional(),
    rule_logic: exports.RuleLogicSchema,
    // Configuration
    priority: zod_1.z.number().int().min(0).default(0),
    is_active: zod_1.z.boolean().default(true),
    requires_ai: zod_1.z.boolean().default(false),
    // Performance
    matches_count: zod_1.z.number().int().min(0).default(0),
    accuracy_rate: zod_1.z.number().min(0).max(1).optional(),
    last_evaluated: zod_1.z.string().datetime().optional(),
    // Metadata
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
    created_by: zod_1.z.string().uuid().optional()
});
exports.CreateRuleSchema = zod_1.z.object({
    rule_name: zod_1.z.string().min(1).max(255),
    rule_description: zod_1.z.string().max(1000).optional(),
    rule_logic: exports.RuleLogicSchema,
    priority: zod_1.z.number().int().min(0).default(0),
    requires_ai: zod_1.z.boolean().default(false)
});
// =====================================================================================
// API REQUEST/RESPONSE SCHEMAS
// =====================================================================================
exports.SegmentationQuerySchema = zod_1.z.object({
    clinic_id: zod_1.z.string().uuid(),
    segment_type: exports.SegmentTypeSchema.optional(),
    is_active: zod_1.z.boolean().optional(),
    ai_generated: zod_1.z.boolean().optional(),
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().optional()
});
exports.SegmentMembersQuerySchema = zod_1.z.object({
    segment_id: zod_1.z.string().uuid(),
    include_inactive: zod_1.z.boolean().default(false),
    min_score: zod_1.z.number().min(0).max(1).optional(),
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20)
});
exports.BulkSegmentUpdateSchema = zod_1.z.object({
    segment_id: zod_1.z.string().uuid(),
    patient_ids: zod_1.z.array(zod_1.z.string().uuid()).min(1).max(1000),
    action: zod_1.z.enum(['add', 'remove']),
    membership_reason: exports.MembershipReasonSchema.optional()
});
exports.SegmentValidationRequestSchema = zod_1.z.object({
    criteria: exports.SegmentCriteriaSchema,
    segment_type: exports.SegmentTypeSchema,
    clinic_id: zod_1.z.string().uuid()
});
// =====================================================================================
// DASHBOARD SCHEMAS
// =====================================================================================
exports.FieldDefinitionSchema = zod_1.z.object({
    field_name: zod_1.z.string().min(1),
    display_name: zod_1.z.string().min(1),
    field_type: zod_1.z.enum(['string', 'number', 'date', 'boolean', 'select']),
    options: zod_1.z.array(zod_1.z.string()).optional(),
    min: zod_1.z.number().optional(),
    max: zod_1.z.number().optional()
});
exports.OperatorDefinitionSchema = zod_1.z.object({
    operator: zod_1.z.string().min(1),
    display_name: zod_1.z.string().min(1),
    compatible_types: zod_1.z.array(zod_1.z.string())
});
exports.AISuggestionSchema = zod_1.z.object({
    suggested_criteria: exports.SegmentCriteriaSchema,
    confidence: zod_1.z.number().min(0).max(1),
    reasoning: zod_1.z.string().min(1),
    expected_members: zod_1.z.number().int().min(0)
});
exports.SegmentBuilderConfigSchema = zod_1.z.object({
    available_fields: zod_1.z.array(exports.FieldDefinitionSchema),
    operators: zod_1.z.array(exports.OperatorDefinitionSchema),
    ai_suggestions: zod_1.z.array(exports.AISuggestionSchema).optional()
});
// =====================================================================================
// VALIDATION RESULT SCHEMAS
// =====================================================================================
exports.ValidationErrorSchema = zod_1.z.object({
    field: zod_1.z.string(),
    message: zod_1.z.string(),
    code: zod_1.z.string()
});
exports.ValidationWarningSchema = zod_1.z.object({
    field: zod_1.z.string(),
    message: zod_1.z.string(),
    suggestion: zod_1.z.string().optional()
});
exports.PerformancePredictionSchema = zod_1.z.object({
    expected_engagement: zod_1.z.number().min(0).max(1),
    expected_retention: zod_1.z.number().min(0).max(1),
    expected_revenue_impact: zod_1.z.number(),
    confidence: zod_1.z.number().min(0).max(1)
});
exports.SegmentValidationResultSchema = zod_1.z.object({
    is_valid: zod_1.z.boolean(),
    errors: zod_1.z.array(exports.ValidationErrorSchema),
    warnings: zod_1.z.array(exports.ValidationWarningSchema),
    estimated_members: zod_1.z.number().int().min(0).optional(),
    performance_prediction: exports.PerformancePredictionSchema.optional()
});
// =====================================================================================
// EXPORT ALL SCHEMAS
// =====================================================================================
exports.SegmentationSchemas = {
    // Core Types
    SegmentType: exports.SegmentTypeSchema,
    UpdateFrequency: exports.UpdateFrequencySchema,
    EngagementLevel: exports.EngagementLevelSchema,
    RevenueTrend: exports.RevenueTrendSchema,
    RiskLevel: exports.RiskLevelSchema,
    HealthTrend: exports.HealthTrendSchema,
    ModelType: exports.ModelTypeSchema,
    ModelStatus: exports.ModelStatusSchema,
    PeriodType: exports.PeriodTypeSchema,
    // Main Entities
    PatientSegment: exports.PatientSegmentSchema,
    CreateSegment: exports.CreateSegmentSchema,
    UpdateSegment: exports.UpdateSegmentSchema,
    PatientSegmentMembership: exports.PatientSegmentMembershipSchema,
    PatientAnalytics: exports.PatientAnalyticsSchema,
    SegmentPerformance: exports.SegmentPerformanceSchema,
    AIModel: exports.AIModelSchema,
    SegmentationRule: exports.SegmentationRuleSchema,
    CreateRule: exports.CreateRuleSchema,
    // API Schemas
    SegmentationQuery: exports.SegmentationQuerySchema,
    SegmentMembersQuery: exports.SegmentMembersQuerySchema,
    BulkSegmentUpdate: exports.BulkSegmentUpdateSchema,
    SegmentValidationRequest: exports.SegmentValidationRequestSchema,
    SegmentValidationResult: exports.SegmentValidationResultSchema,
    // Dashboard Schemas
    FieldDefinition: exports.FieldDefinitionSchema,
    OperatorDefinition: exports.OperatorDefinitionSchema,
    AISuggestion: exports.AISuggestionSchema,
    SegmentBuilderConfig: exports.SegmentBuilderConfigSchema
};
