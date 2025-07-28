// =====================================================================================
// PATIENT SEGMENTATION & AI-DRIVEN INSIGHTS TYPES
// Epic 7 - Story 7.1: Comprehensive types for patient segmentation and AI analytics
// =====================================================================================

export type SegmentType = 
  | 'demographic'
  | 'behavioral' 
  | 'clinical'
  | 'engagement'
  | 'financial'
  | 'custom'
  | 'ai_generated';

export type UpdateFrequency = 
  | 'real_time'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly';

export type EngagementLevel = 
  | 'very_low'
  | 'low'
  | 'medium'
  | 'high'
  | 'very_high';

export type RevenueTrend = 
  | 'declining'
  | 'stable'
  | 'growing'
  | 'volatile';

export type RiskLevel = 
  | 'very_low'
  | 'low'
  | 'medium'
  | 'high'
  | 'very_high';

export type HealthTrend = 
  | 'declining'
  | 'stable'
  | 'improving'
  | 'fluctuating';

export type ModelType = 
  | 'classification'
  | 'clustering'
  | 'regression'
  | 'neural_network'
  | 'ensemble'
  | 'deep_learning';

export type ModelStatus = 
  | 'training'
  | 'validating'
  | 'testing'
  | 'ready'
  | 'deployed'
  | 'deprecated';

export type PeriodType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

// =====================================================================================
// CORE SEGMENTATION INTERFACES
// =====================================================================================

export interface PatientSegment {
  id: string;
  clinic_id: string;
  
  // Segment Definition
  name: string;
  description?: string;
  segment_type: SegmentType;
  ai_generated: boolean;
  
  // Segmentation Criteria
  criteria: SegmentCriteria;
  ai_criteria?: SegmentCriteria;
  
  // Performance Metrics
  accuracy_score?: number; // 0-1
  confidence_score?: number; // 0-1
  member_count: number;
  
  // Configuration
  is_active: boolean;
  auto_update: boolean;
  update_frequency: UpdateFrequency;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface SegmentCriteria {
  [key: string]: CriteriaRule;
}

export interface CriteriaRule {
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains' | 'between';
  value: any;
  field_type?: 'string' | 'number' | 'date' | 'boolean' | 'array';
}

export interface PatientSegmentMembership {
  id: string;
  segment_id: string;
  patient_id: string;
  
  // Membership Metadata
  membership_score?: number; // 0-1
  membership_reason?: MembershipReason;
  
  // AI Predictions
  predicted_lifetime_value?: number;
  predicted_engagement_score?: number; // 0-1
  predicted_retention_probability?: number; // 0-1
  treatment_propensity?: TreatmentPropensity;
  
  // Tracking
  assigned_at: string;
  last_validated: string;
  is_active: boolean;
  auto_assigned: boolean;
}

export interface MembershipReason {
  criteria_matched: string[];
  ai_explanation?: string;
  confidence_factors: {
    [factor: string]: number;
  };
}

export interface TreatmentPropensity {
  [treatment_type: string]: {
    probability: number; // 0-1
    confidence: number; // 0-1
    recommended_timing?: string;
    factors: string[];
  };
}

// =====================================================================================
// PATIENT ANALYTICS INTERFACES
// =====================================================================================

export interface PatientAnalytics {
  id: string;
  patient_id: string;
  clinic_id: string;
  
  // Behavioral Analytics
  visit_frequency_score?: number; // 0-1
  appointment_compliance_rate?: number; // 0-1
  treatment_adherence_score?: number; // 0-1
  engagement_level: EngagementLevel;
  
  // Financial Analytics
  total_lifetime_value: number;
  average_transaction_value?: number;
  payment_reliability_score?: number; // 0-1
  revenue_trend?: RevenueTrend;
  
  // Clinical Analytics
  condition_complexity_score?: number; // 0-1
  treatment_response_rate?: number; // 0-1
  risk_level: RiskLevel;
  health_improvement_trend?: HealthTrend;
  
  // Interaction Analytics
  communication_preference?: CommunicationPreference;
  preferred_channels?: string[];
  response_rate_email?: number; // 0-1
  response_rate_sms?: number; // 0-1
  response_rate_phone?: number; // 0-1
  
  // AI Insights
  ai_insights?: AIInsights;
  personality_profile?: PersonalityProfile;
  preference_predictions?: PreferencePredictions;
  
  // ML Features
  feature_vector?: number[]; // 100-dimensional array
  
  // Tracking
  last_calculated: string;
  calculation_version: number;
}

export interface CommunicationPreference {
  preferred_time?: string;
  preferred_day?: string;
  frequency_preference?: 'high' | 'medium' | 'low';
  channel_preference?: string[];
  language?: string;
}

export interface AIInsights {
  key_insights: string[];
  recommendations: Recommendation[];
  risk_factors: string[];
  opportunities: string[];
  next_best_actions: NextBestAction[];
}

export interface Recommendation {
  type: string;
  description: string;
  confidence: number; // 0-1
  priority: 'high' | 'medium' | 'low';
  estimated_impact?: string;
  timeline?: string;
}

export interface NextBestAction {
  action_type: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  expected_outcome: string;
  confidence: number; // 0-1
}

export interface PersonalityProfile {
  traits: {
    [trait: string]: number; // 0-1 scale
  };
  communication_style: string;
  decision_making_style: string;
  motivation_factors: string[];
}

export interface PreferencePredictions {
  appointment_preferences: {
    preferred_times: string[];
    preferred_days: string[];
    advance_booking_preference: number; // days
  };
  treatment_preferences: {
    [treatment_type: string]: number; // preference score 0-1
  };
  communication_preferences: {
    [channel: string]: number; // preference score 0-1
  };
}

// =====================================================================================
// SEGMENT PERFORMANCE TRACKING
// =====================================================================================

export interface SegmentPerformance {
  id: string;
  segment_id: string;
  
  // Time Period
  period_start: string;
  period_end: string;
  period_type: PeriodType;
  
  // Performance Metrics
  member_count: number;
  new_members: number;
  departed_members: number;
  member_retention_rate?: number; // 0-1
  
  // Engagement Metrics
  average_engagement_score?: number; // 0-1
  total_interactions: number;
  response_rate?: number; // 0-1
  conversion_rate?: number; // 0-1
  
  // Financial Metrics
  total_revenue: number;
  average_revenue_per_member?: number;
  roi?: number; // Return on investment
  
  // Campaign Performance
  campaigns_sent: number;
  campaign_open_rate?: number; // 0-1
  campaign_click_rate?: number; // 0-1
  campaign_conversion_rate?: number; // 0-1
  
  // Clinical Outcomes
  treatment_success_rate?: number; // 0-1
  patient_satisfaction_score?: number; // 0-1
  health_improvement_rate?: number; // 0-1
  
  // Metadata
  calculated_at: string;
}

// =====================================================================================
// AI MODEL INTERFACES
// =====================================================================================

export interface AIModel {
  id: string;
  clinic_id: string;
  
  // Model Information
  model_name: string;
  model_type: ModelType;
  model_version: string;
  
  // Configuration
  parameters?: ModelParameters;
  training_data_info?: TrainingDataInfo;
  features_used?: string[];
  
  // Performance Metrics
  accuracy?: number; // 0-1
  precision_score?: number; // 0-1
  recall?: number; // 0-1
  f1_score?: number; // 0-1
  auc_score?: number; // 0-1
  
  // Status
  status: ModelStatus;
  is_active: boolean;
  deployment_date?: string;
  
  // Metadata
  created_at: string;
  trained_by?: string;
}

export interface ModelParameters {
  [parameter: string]: any;
}

export interface TrainingDataInfo {
  dataset_size: number;
  training_period: {
    start: string;
    end: string;
  };
  data_quality_score?: number; // 0-1
  feature_count: number;
  class_distribution?: Record<string, number>;
}

// =====================================================================================
// SEGMENTATION RULES
// =====================================================================================

export interface SegmentationRule {
  id: string;
  segment_id: string;
  
  // Rule Definition
  rule_name: string;
  rule_description?: string;
  rule_logic: RuleLogic;
  
  // Configuration
  priority: number;
  is_active: boolean;
  requires_ai: boolean;
  
  // Performance
  matches_count: number;
  accuracy_rate?: number; // 0-1
  last_evaluated?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface RuleLogic {
  conditions: RuleCondition[];
  operator: 'AND' | 'OR';
  nested_rules?: RuleLogic[];
}

export interface RuleCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains' | 'between';
  value: any;
  weight?: number; // For weighted conditions
}

// =====================================================================================
// API RESPONSE INTERFACES
// =====================================================================================

export interface SegmentationResponse {
  segments: PatientSegment[];
  total: number;
  page: number;
  limit: number;
}

export interface SegmentMembersResponse {
  members: PatientSegmentMembership[];
  total: number;
  segment: PatientSegment;
  analytics: SegmentAnalytics;
}

export interface SegmentAnalytics {
  total_members: number;
  active_members: number;
  average_membership_score: number;
  top_characteristics: string[];
  performance_summary: SegmentPerformanceSummary;
}

export interface SegmentPerformanceSummary {
  retention_rate: number;
  engagement_score: number;
  revenue_per_member: number;
  conversion_rate: number;
  growth_rate: number;
}

export interface PatientInsightsResponse {
  patient_id: string;
  analytics: PatientAnalytics;
  segments: PatientSegmentMembership[];
  recommendations: Recommendation[];
  predicted_behaviors: PredictedBehavior[];
}

export interface PredictedBehavior {
  behavior_type: string;
  probability: number; // 0-1
  confidence: number; // 0-1
  factors: string[];
  timeline?: string;
}

// =====================================================================================
// FORM INTERFACES FOR CREATING/EDITING
// =====================================================================================

export interface CreateSegmentData {
  name: string;
  description?: string;
  segment_type: SegmentType;
  criteria: SegmentCriteria;
  auto_update: boolean;
  update_frequency: UpdateFrequency;
}

export interface UpdateSegmentData extends Partial<CreateSegmentData> {
  is_active?: boolean;
}

export interface CreateRuleData {
  rule_name: string;
  rule_description?: string;
  rule_logic: RuleLogic;
  priority: number;
  requires_ai: boolean;
}

export interface BulkSegmentUpdate {
  segment_id: string;
  patient_ids: string[];
  action: 'add' | 'remove';
  membership_reason?: MembershipReason;
}

// =====================================================================================
// DASHBOARD INTERFACES
// =====================================================================================

export interface SegmentationDashboardData {
  total_segments: number;
  active_segments: number;
  total_patients_segmented: number;
  ai_accuracy_average: number;
  top_performing_segments: SegmentPerformance[];
  recent_insights: AIInsights[];
  model_performance: AIModel[];
}

export interface SegmentBuilderConfig {
  available_fields: FieldDefinition[];
  operators: OperatorDefinition[];
  ai_suggestions?: AISuggestion[];
}

export interface FieldDefinition {
  field_name: string;
  display_name: string;
  field_type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  options?: string[]; // For select fields
  min?: number; // For number fields
  max?: number; // For number fields
}

export interface OperatorDefinition {
  operator: string;
  display_name: string;
  compatible_types: string[];
}

export interface AISuggestion {
  suggested_criteria: SegmentCriteria;
  confidence: number;
  reasoning: string;
  expected_members: number;
}

// =====================================================================================
// VALIDATION SCHEMAS TYPES
// =====================================================================================

export interface SegmentValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  estimated_members?: number;
  performance_prediction?: PerformancePrediction;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface PerformancePrediction {
  expected_engagement: number;
  expected_retention: number;
  expected_revenue_impact: number;
  confidence: number;
}
