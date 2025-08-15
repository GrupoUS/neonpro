// Story 9.2: Personalized Treatment Recommendations - TypeScript Types
// Comprehensive type definitions for AI-powered personalized treatment recommendations

export interface RecommendationProfile {
  id: string;
  patient_id: string;
  profile_data: Record<string, any>;
  preference_weights: Record<string, number>;
  lifestyle_factors: Record<string, any>;
  medical_preferences: Record<string, any>;
  communication_preferences: Record<string, any>;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface TreatmentRecommendation {
  id: string;
  patient_id: string;
  provider_id: string;
  recommendation_type: RecommendationType;
  treatment_options: TreatmentOption[];
  ranking_scores: Record<string, number>;
  rationale: string;
  success_probabilities: Record<string, number>;
  risk_assessments: Record<string, RiskAssessment>;
  contraindications: Contraindication[];
  alternatives: TreatmentAlternative[];
  status: RecommendationStatus;
  approved_by?: string;
  approved_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RecommendationFeedback {
  id: string;
  recommendation_id: string;
  provider_id: string;
  feedback_type: FeedbackType;
  adoption_status: AdoptionStatus;
  quality_rating: number;
  usefulness_rating: number;
  accuracy_rating: number;
  comments?: string;
  improvement_suggestions?: string;
  would_recommend: boolean;
  created_at: string;
}

export interface PersonalizationFactor {
  id: string;
  patient_id: string;
  factor_type: FactorType;
  factor_category: FactorCategory;
  factor_value: Record<string, any>;
  weight: number;
  source: DataSource;
  confidence_score: number;
  last_verified: string;
  created_at: string;
  updated_at: string;
}

export interface SafetyProfile {
  id: string;
  patient_id: string;
  allergies: Allergy[];
  contraindications: Contraindication[];
  drug_interactions: DrugInteraction[];
  medical_conditions: MedicalCondition[];
  risk_factors: RiskFactor[];
  safety_alerts: SafetyAlert[];
  last_reviewed: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProtocolCustomization {
  id: string;
  patient_id: string;
  protocol_id: string;
  customizations: Record<string, any>;
  personalization_rules: Record<string, any>;
  modifications: ProtocolModification[];
  approval_status: ApprovalStatus;
  customized_by: string;
  approved_by?: string;
  effective_date: string;
  created_at: string;
  updated_at: string;
}

export interface RecommendationPerformance {
  id: string;
  recommendation_id: string;
  patient_id: string;
  adoption_rate: number;
  effectiveness_score: number;
  patient_satisfaction: number;
  provider_satisfaction: number;
  outcome_quality: number;
  time_to_adoption?: string;
  success_indicators: Record<string, any>;
  measured_at: string;
  created_at: string;
}

// Supporting Types
export interface TreatmentOption {
  id: string;
  name: string;
  type: TreatmentType;
  description: string;
  duration: string;
  intensity: TreatmentIntensity;
  cost_estimate: number;
  success_probability: number;
  risk_level: RiskLevel;
  contraindications: string[];
  requirements: string[];
  alternatives: string[];
}

export interface TreatmentAlternative {
  option: TreatmentOption;
  ranking_score: number;
  comparison_rationale: string;
  pros: string[];
  cons: string[];
  suitability_score: number;
}

export interface RiskAssessment {
  risk_level: RiskLevel;
  risk_factors: RiskFactor[];
  mitigation_strategies: string[];
  monitoring_requirements: string[];
  safety_precautions: string[];
}

export interface Contraindication {
  id: string;
  type: ContraindicationType;
  severity: SeverityLevel;
  description: string;
  reason: string;
  alternatives: string[];
}

export interface Allergy {
  id: string;
  allergen: string;
  type: AllergyType;
  severity: SeverityLevel;
  symptoms: string[];
  cross_reactions: string[];
  avoidance_instructions: string[];
}

export interface DrugInteraction {
  id: string;
  drug_a: string;
  drug_b: string;
  interaction_type: InteractionType;
  severity: SeverityLevel;
  description: string;
  management: string;
}

export interface MedicalCondition {
  id: string;
  condition: string;
  icd_code?: string;
  status: ConditionStatus;
  severity: SeverityLevel;
  onset_date?: string;
  notes?: string;
  relevant_factors: string[];
}

export interface RiskFactor {
  id: string;
  factor_name: string;
  factor_type: RiskFactorType;
  risk_level: RiskLevel;
  description: string;
  mitigation_strategies: string[];
}

export interface SafetyAlert {
  id: string;
  alert_type: AlertType;
  severity: SeverityLevel;
  message: string;
  recommendations: string[];
  expires_at?: string;
}

export interface ProtocolModification {
  modification_type: ModificationType;
  original_value: any;
  modified_value: any;
  rationale: string;
  approval_required: boolean;
}

// Enums and Unions
export type RecommendationType =
  | 'primary_treatment'
  | 'alternative_therapy'
  | 'combination_therapy'
  | 'preventive_care'
  | 'maintenance_therapy'
  | 'adjuvant_treatment';

export type RecommendationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'implemented'
  | 'completed'
  | 'expired';

export type TreatmentType =
  | 'aesthetic'
  | 'dermatological'
  | 'cosmetic'
  | 'therapeutic'
  | 'preventive'
  | 'maintenance';

export type TreatmentIntensity =
  | 'minimal'
  | 'mild'
  | 'moderate'
  | 'intensive'
  | 'aggressive';

export type RiskLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';

export type FeedbackType =
  | 'accuracy'
  | 'usefulness'
  | 'adoption'
  | 'quality'
  | 'improvement'
  | 'general';

export type AdoptionStatus =
  | 'adopted'
  | 'modified'
  | 'rejected'
  | 'pending'
  | 'partially_adopted';

export type FactorType =
  | 'demographic'
  | 'medical_history'
  | 'lifestyle'
  | 'preference'
  | 'behavioral'
  | 'genetic'
  | 'environmental';

export type FactorCategory =
  | 'age_related'
  | 'gender_specific'
  | 'medical_condition'
  | 'treatment_history'
  | 'lifestyle_choice'
  | 'patient_preference'
  | 'risk_factor'
  | 'compliance_indicator';

export type DataSource =
  | 'medical_record'
  | 'patient_survey'
  | 'clinical_assessment'
  | 'lab_results'
  | 'imaging_study'
  | 'family_history'
  | 'lifestyle_assessment'
  | 'behavioral_analysis';

export type ContraindicationType =
  | 'absolute'
  | 'relative'
  | 'temporary'
  | 'conditional';

export type SeverityLevel = 'mild' | 'moderate' | 'severe' | 'critical';

export type AllergyType =
  | 'drug'
  | 'environmental'
  | 'food'
  | 'contact'
  | 'seasonal';

export type InteractionType =
  | 'antagonistic'
  | 'synergistic'
  | 'additive'
  | 'competitive'
  | 'incompatible';

export type ConditionStatus =
  | 'active'
  | 'inactive'
  | 'resolved'
  | 'chronic'
  | 'acute'
  | 'managed';

export type RiskFactorType =
  | 'genetic'
  | 'environmental'
  | 'behavioral'
  | 'medical'
  | 'social'
  | 'occupational';

export type AlertType =
  | 'contraindication'
  | 'allergy'
  | 'interaction'
  | 'safety'
  | 'monitoring'
  | 'dose_adjustment';

export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'requires_review'
  | 'expired';

export type ModificationType =
  | 'dose_adjustment'
  | 'frequency_change'
  | 'duration_modification'
  | 'technique_alteration'
  | 'timing_adjustment'
  | 'intensity_modification';

// Request/Response Types
export interface CreateRecommendationProfileRequest {
  patient_id: string;
  profile_data: Record<string, any>;
  preference_weights?: Record<string, number>;
  lifestyle_factors?: Record<string, any>;
  medical_preferences?: Record<string, any>;
  communication_preferences?: Record<string, any>;
}

export interface UpdateRecommendationProfileRequest {
  profile_data?: Record<string, any>;
  preference_weights?: Record<string, number>;
  lifestyle_factors?: Record<string, any>;
  medical_preferences?: Record<string, any>;
  communication_preferences?: Record<string, any>;
}

export interface CreateTreatmentRecommendationRequest {
  patient_id: string;
  recommendation_type: RecommendationType;
  treatment_options: TreatmentOption[];
  rationale?: string;
}

export interface ApproveRecommendationRequest {
  approved_by: string;
  approval_notes?: string;
  modifications?: Record<string, any>;
}

export interface CreateRecommendationFeedbackRequest {
  recommendation_id: string;
  feedback_type: FeedbackType;
  adoption_status: AdoptionStatus;
  quality_rating: number;
  usefulness_rating: number;
  accuracy_rating: number;
  comments?: string;
  improvement_suggestions?: string;
  would_recommend: boolean;
}

export interface CreatePersonalizationFactorRequest {
  patient_id: string;
  factor_type: FactorType;
  factor_category: FactorCategory;
  factor_value: Record<string, any>;
  weight?: number;
  source: DataSource;
  confidence_score?: number;
}

export interface UpdateSafetyProfileRequest {
  allergies?: Allergy[];
  contraindications?: Contraindication[];
  drug_interactions?: DrugInteraction[];
  medical_conditions?: MedicalCondition[];
  risk_factors?: RiskFactor[];
  safety_alerts?: SafetyAlert[];
}

export interface CreateProtocolCustomizationRequest {
  patient_id: string;
  protocol_id: string;
  customizations: Record<string, any>;
  personalization_rules: Record<string, any>;
  modifications: ProtocolModification[];
}

export interface RecordPerformanceRequest {
  recommendation_id: string;
  patient_id: string;
  adoption_rate: number;
  effectiveness_score: number;
  patient_satisfaction: number;
  provider_satisfaction: number;
  outcome_quality: number;
  time_to_adoption?: string;
  success_indicators: Record<string, any>;
}

// Analytics and Reporting Types
export interface RecommendationAnalytics {
  total_recommendations: number;
  adoption_rate: number;
  average_quality_rating: number;
  average_usefulness_rating: number;
  average_accuracy_rating: number;
  most_recommended_treatments: string[];
  highest_success_rates: TreatmentOption[];
  user_acceptance_rate: number;
  performance_trends: PerformanceTrend[];
}

export interface PerformanceTrend {
  period: string;
  metric: string;
  value: number;
  change_percentage: number;
}

export interface PersonalizationInsights {
  most_influential_factors: PersonalizationFactor[];
  patient_preferences_distribution: Record<string, number>;
  safety_profile_statistics: Record<string, number>;
  customization_patterns: Record<string, number>;
}

// Utility Types
export type RecommendationWithDetails = TreatmentRecommendation & {
  patient?: {
    id: string;
    name: string;
    email: string;
  };
  provider?: {
    id: string;
    name: string;
    role: string;
  };
  feedback?: RecommendationFeedback[];
  performance?: RecommendationPerformance;
};

export type SafetyProfileWithAlerts = SafetyProfile & {
  active_alerts: SafetyAlert[];
  critical_contraindications: Contraindication[];
  high_risk_interactions: DrugInteraction[];
};

export type PersonalizedRecommendationResult = {
  recommendations: TreatmentRecommendation[];
  personalization_score: number;
  safety_assessment: SafetyProfile;
  confidence_level: number;
  explanation: string;
  alternative_options: TreatmentAlternative[];
};
