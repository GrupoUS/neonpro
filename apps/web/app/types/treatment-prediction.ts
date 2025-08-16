// Treatment Success Prediction Types
// Comprehensive AI/ML-powered treatment success prediction system

export type PredictionModel = {
  id: string;
  name: string;
  version: string;
  algorithm_type:
    | 'ensemble'
    | 'neural_network'
    | 'random_forest'
    | 'gradient_boosting'
    | 'svm';
  accuracy: number; // 0-1, target ≥0.85
  confidence_threshold: number; // Default 0.85
  status: 'training' | 'active' | 'deprecated';
  training_data_size: number;
  feature_count: number;
  model_data?: Record<string, any>; // Serialized model parameters
  performance_metrics?: ModelPerformanceMetrics;
  created_at: string;
  updated_at: string;
  created_by?: string;
};

export type ModelPerformanceMetrics = {
  precision: number;
  recall: number;
  f1_score: number;
  auc_roc: number;
  training_accuracy: number;
  validation_accuracy: number;
  cross_validation_mean: number;
  cross_validation_std: number;
  feature_importance?: Record<string, number>;
};

export type TreatmentPrediction = {
  id: string;
  patient_id: string;
  treatment_type: string;
  prediction_score: number; // 0-1 probability of success
  confidence_interval: ConfidenceInterval;
  risk_assessment: 'low' | 'medium' | 'high';
  predicted_outcome: 'success' | 'partial_success' | 'failure';
  prediction_date: string;
  model_id: string;
  features_used: PredictionFeatures;
  explainability_data?: ExplainabilityData;
  actual_outcome?: 'success' | 'partial_success' | 'failure';
  outcome_date?: string;
  accuracy_validated: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;

  // Relationships
  model?: PredictionModel;
  patient?: any; // Patient interface from main types
  feedback?: PredictionFeedback[];
};

export type ConfidenceInterval = {
  lower: number; // Lower bound of confidence interval
  upper: number; // Upper bound of confidence interval
  confidence_level: number; // Confidence level (e.g., 0.95 for 95%)
};

export type PredictionFeatures = {
  // Patient demographics
  age: number;
  gender: string;
  bmi?: number;

  // Medical history factors
  previous_treatments: number;
  success_rate_history: number;
  medical_conditions: string[];
  medications: string[];
  allergies: string[];

  // Lifestyle factors
  smoking_status: 'never' | 'former' | 'current';
  alcohol_consumption: 'none' | 'light' | 'moderate' | 'heavy';
  exercise_frequency: 'none' | 'light' | 'moderate' | 'regular';

  // Treatment-specific factors
  treatment_complexity: number; // 1-5
  provider_experience: number;
  clinic_success_rate: number;

  // Skin-specific factors (for aesthetic treatments)
  skin_type?: string;
  skin_condition?: string;
  photosensitivity?: boolean;

  // Psychological factors
  treatment_expectations: 'realistic' | 'optimistic' | 'unrealistic';
  anxiety_level: number; // 1-5
  compliance_history: number; // 0-1

  // External factors
  seasonal_factors?: string;
  geographic_location?: string;
  support_system: 'strong' | 'moderate' | 'weak';
};

export type ExplainabilityData = {
  feature_importance: Record<string, number>; // SHAP values or similar
  top_positive_factors: string[]; // Factors increasing success probability
  top_negative_factors: string[]; // Factors decreasing success probability
  similar_cases: string[]; // IDs of similar historical cases
  confidence_reasoning: string; // Human-readable explanation
};

export type PatientFactors = {
  id: string;
  patient_id: string;
  age: number;
  gender: string;
  bmi?: number;
  medical_history?: MedicalHistory;
  lifestyle_factors?: LifestyleFactors;
  treatment_history?: TreatmentHistory;
  compliance_score?: number; // 0-1
  skin_type?: string;
  skin_condition?: string;
  treatment_expectations?: string;
  psychological_factors?: PsychologicalFactors;
  social_factors?: SocialFactors;
  geographic_factors?: GeographicFactors;
  updated_at: string;
  created_at: string;
};

export type MedicalHistory = {
  conditions: string[];
  medications: string[];
  allergies: string[];
  surgeries: string[];
  chronic_conditions: string[];
  family_history: string[];
};

export type LifestyleFactors = {
  smoking: 'never' | 'former' | 'current';
  alcohol: 'none' | 'light' | 'moderate' | 'heavy';
  exercise: 'none' | 'light' | 'moderate' | 'regular';
  diet: 'poor' | 'average' | 'good' | 'excellent';
  sleep_quality: number; // 1-5
  stress_level: number; // 1-5
};

export type TreatmentHistory = {
  previous_treatments: TreatmentHistoryItem[];
  total_treatments: number;
  success_rate: number; // 0-1
  last_treatment_date?: string;
  complications_history: string[];
};

export type TreatmentHistoryItem = {
  treatment_type: string;
  date: string;
  outcome: 'success' | 'partial_success' | 'failure';
  provider: string;
  notes?: string;
};

export type PsychologicalFactors = {
  anxiety_level: number; // 1-5
  motivation_level: number; // 1-5
  treatment_expectations: 'realistic' | 'optimistic' | 'unrealistic';
  body_image_satisfaction: number; // 1-5
  perfectionism_tendency: number; // 1-5
};

export type SocialFactors = {
  support_system: 'strong' | 'moderate' | 'weak';
  socioeconomic_status: 'low' | 'middle' | 'high';
  education_level: 'basic' | 'secondary' | 'higher';
  employment_status: 'employed' | 'unemployed' | 'retired' | 'student';
};

export type GeographicFactors = {
  location: string;
  climate: 'tropical' | 'temperate' | 'arid' | 'cold';
  accessibility_score: number; // 1-5
  travel_distance_km: number;
};

export type TreatmentCharacteristics = {
  id: string;
  treatment_type: string;
  complexity_level: number; // 1-5
  duration_weeks?: number;
  session_count?: number;
  invasiveness_level: number; // 1-5
  recovery_time_days?: number;
  equipment_required?: Record<string, any>;
  provider_skill_required: number; // 1-5
  success_rate_baseline?: number; // 0-1
  contraindications?: string[];
  side_effects?: SideEffects;
  cost_range?: CostRange;
  created_at: string;
  updated_at: string;
};

export type SideEffects = {
  common?: string[];
  uncommon?: string[];
  rare?: string[];
  severe?: string[];
  expected?: string[]; // Expected side effects (like peeling after chemical peel)
};

export type CostRange = {
  min: number;
  max: number;
  currency: string;
  average?: number;
};

export type ModelPerformance = {
  id: string;
  model_id: string;
  evaluation_date: string;
  accuracy: number; // 0-1
  precision_score?: number;
  recall_score?: number;
  f1_score?: number;
  auc_roc?: number;
  predictions_count: number;
  correct_predictions: number;
  improvement_percentage?: number; // Success rate improvement
  validation_metrics?: ValidationMetrics;
  feature_importance?: Record<string, number>;
  created_at: string;

  // Relationships
  model?: PredictionModel;
};

export type ValidationMetrics = {
  cross_validation_scores: number[];
  validation_accuracy: number;
  test_accuracy: number;
  confusion_matrix: number[][];
  roc_curve_data?: ROCCurveData;
};

export type ROCCurveData = {
  fpr: number[]; // False positive rates
  tpr: number[]; // True positive rates
  thresholds: number[];
  auc: number;
};

export type PredictionFeedback = {
  id: string;
  prediction_id: string;
  provider_id: string;
  feedback_type: 'validation' | 'correction' | 'enhancement';
  original_prediction: number;
  adjusted_prediction?: number;
  reasoning: string;
  confidence_level: number; // 1-5
  medical_factors?: Record<string, any>;
  created_at: string;

  // Relationships
  prediction?: TreatmentPrediction;
  provider?: any; // User interface from main types
};

// API Response Types
export type PredictionResponse = {
  prediction: TreatmentPrediction;
  recommendations: TreatmentRecommendation[];
  alternative_treatments: AlternativeTreatment[];
  risk_factors: RiskFactor[];
};

export type TreatmentRecommendation = {
  type: 'preparation' | 'modification' | 'monitoring' | 'post_care';
  description: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  evidence_level: 'expert_opinion' | 'case_studies' | 'clinical_trials';
};

export type AlternativeTreatment = {
  treatment_type: string;
  prediction_score: number;
  advantages: string[];
  disadvantages: string[];
  suitability_score: number; // 0-1
};

export type RiskFactor = {
  factor: string;
  impact: number; // -1 to 1 (negative impact to positive impact)
  modifiable: boolean;
  recommendation?: string;
};

// Prediction Request Types
export type PredictionRequest = {
  patient_id: string;
  treatment_type: string;
  model_version?: string;
  include_alternatives?: boolean;
  confidence_threshold?: number;
};

export type BatchPredictionRequest = {
  predictions: PredictionRequest[];
  model_version?: string;
  include_summary?: boolean;
};

export type BatchPredictionResponse = {
  predictions: PredictionResponse[];
  summary: PredictionSummary;
  processing_time: number;
};

export type PredictionSummary = {
  total_predictions: number;
  high_success_probability: number;
  medium_success_probability: number;
  low_success_probability: number;
  average_confidence: number;
  recommendations_generated: number;
};

// Model Training Types
export type TrainingRequest = {
  model_name: string;
  algorithm_type: string;
  training_parameters: Record<string, any>;
  validation_split: number; // 0-1
  feature_selection?: string[];
};

export type TrainingResponse = {
  model_id: string;
  training_status: 'started' | 'in_progress' | 'completed' | 'failed';
  estimated_completion?: string;
  progress_percentage?: number;
  performance_preview?: ModelPerformanceMetrics;
};

// Utility Types
export type PredictionConfidence =
  | 'very_low'
  | 'low'
  | 'medium'
  | 'high'
  | 'very_high';
export type TreatmentOutcome = 'success' | 'partial_success' | 'failure';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ModelStatus = 'training' | 'active' | 'deprecated';
export type FeedbackType = 'validation' | 'correction' | 'enhancement';

// Filter and Search Types
export type PredictionFilters = {
  patient_id?: string;
  treatment_type?: string;
  prediction_score_min?: number;
  prediction_score_max?: number;
  risk_assessment?: RiskLevel;
  date_from?: string;
  date_to?: string;
  model_id?: string;
  outcome?: TreatmentOutcome;
  accuracy_validated?: boolean;
};

export type ModelFilters = {
  status?: ModelStatus;
  algorithm_type?: string;
  accuracy_min?: number;
  version?: string;
  created_from?: string;
  created_to?: string;
};

export type PerformanceFilters = {
  model_id?: string;
  accuracy_min?: number;
  evaluation_date_from?: string;
  evaluation_date_to?: string;
  improvement_percentage_min?: number;
};
