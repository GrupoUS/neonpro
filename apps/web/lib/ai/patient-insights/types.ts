// AI-Powered Risk Assessment & Patient Insights Types
// Story 3.2: AI-powered Risk Assessment + Insights

export interface RiskFactor {
  id: string;
  name: string;
  category:
    | 'medical'
    | 'lifestyle'
    | 'genetic'
    | 'environmental'
    | 'behavioral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  weight: number; // 0.0 to 1.0
  confidence: number; // 0.0 to 1.0
  description: string;
  evidenceLevel: 'low' | 'moderate' | 'high' | 'strong';
}

export interface PatientRiskAssessment {
  patientId: string;
  assessmentDate: Date;
  overallRiskScore: number; // 0-100
  riskFactors: RiskFactor[];
  predictions: HealthPrediction[];
  recommendations: TreatmentRecommendation[];
  alerts: SafetyAlert[];
  confidenceScore: number;
  nextAssessmentDate: Date;
}

export interface HealthPrediction {
  type:
    | 'complication_risk'
    | 'treatment_success'
    | 'recovery_time'
    | 'satisfaction_score';
  prediction: number; // probability or score
  confidence: number;
  timeframe: string; // '1_week' | '1_month' | '3_months' | '6_months' | '1_year'
  factors: string[];
  evidenceBased: boolean;
}

export interface TreatmentRecommendation {
  treatmentId: string;
  treatmentName: string;
  category: 'primary' | 'alternative' | 'contraindicated';
  successProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  evidenceLevel: 'weak' | 'moderate' | 'strong' | 'very_strong';
  contraindications: string[];
  prerequisites: string[];
  expectedOutcome: string;
  estimatedDuration: string;
  estimatedCost: number;
  reasoning: string;
}

export interface SafetyAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  type:
    | 'contraindication'
    | 'drug_interaction'
    | 'allergy_risk'
    | 'medical_condition'
    | 'age_factor';
  message: string;
  affectedTreatments: string[];
  recommendedActions: string[];
  autoResolvable: boolean;
  requiresImmediate: boolean;
}

export interface PatientBehaviorPattern {
  patientId: string;
  patterns: {
    appointmentAdherence: number; // 0.0 to 1.0
    treatmentCompliance: number;
    communicationPreference:
      | 'phone'
      | 'email'
      | 'sms'
      | 'whatsapp'
      | 'in_person';
    paymentBehavior: 'prompt' | 'delayed' | 'irregular' | 'problematic';
    engagementLevel: 'low' | 'medium' | 'high' | 'very_high';
    responseTime: number; // average hours to respond
    preferredTimes: string[]; // preferred appointment times
    noShowRisk: number; // 0.0 to 1.0
  };
  lifestyle: {
    exerciseLevel:
      | 'sedentary'
      | 'light'
      | 'moderate'
      | 'active'
      | 'very_active';
    dietQuality: 'poor' | 'fair' | 'good' | 'excellent';
    sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
    stressLevel: 'low' | 'medium' | 'high' | 'very_high';
    smokingStatus: 'never' | 'former' | 'current_light' | 'current_heavy';
    alcoholConsumption: 'none' | 'light' | 'moderate' | 'heavy';
  };
  lastAnalyzed: Date;
  confidence: number;
}

export interface HealthTrend {
  patientId: string;
  metric: string;
  values: {
    date: Date;
    value: number;
    unit: string;
  }[];
  trend: 'improving' | 'stable' | 'declining' | 'concerning';
  slope: number; // rate of change
  significance: number; // statistical significance
  prediction: {
    nextValue: number;
    confidence: number;
    timeframe: string;
  };
  alerts: {
    type: 'threshold_exceeded' | 'rapid_change' | 'concerning_pattern';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    triggeredAt: Date;
  }[];
}

export interface AIModelPerformance {
  modelId: string;
  modelType:
    | 'risk_assessment'
    | 'treatment_recommendation'
    | 'outcome_prediction'
    | 'behavior_analysis';
  version: string;
  trainingDate: Date;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  validationDataSize: number;
  biasMetrics: {
    demographic: number;
    geographic: number;
    socioeconomic: number;
  };
  lastUpdated: Date;
  isActive: boolean;
}

export interface PatientOutcome {
  patientId: string;
  treatmentId: string;
  predictedOutcome: {
    successProbability: number;
    complications: string[];
    recoveryTime: number;
    satisfaction: number;
  };
  actualOutcome: {
    success: boolean;
    complications: string[];
    actualRecoveryTime: number;
    actualSatisfaction: number;
  };
  variance: {
    successAccuracy: number;
    complicationAccuracy: number;
    recoveryTimeAccuracy: number;
    satisfactionAccuracy: number;
  };
  feedbackDate: Date;
  notes: string;
}

export interface CarePathway {
  id: string;
  patientId: string;
  name: string;
  description: string;
  totalSteps: number;
  currentStep: number;
  estimatedCompletion: Date;
  steps: CarePathwayStep[];
  personalizationFactors: string[];
  successProbability: number;
  alternatives: AlternativePathway[];
}

export interface CarePathwayStep {
  stepNumber: number;
  name: string;
  description: string;
  type: 'consultation' | 'treatment' | 'follow_up' | 'test' | 'waiting_period';
  estimatedDuration: string;
  prerequisites: string[];
  expectedOutcome: string;
  completionCriteria: string[];
  isCompleted: boolean;
  completedDate?: Date;
  notes?: string;
}

export interface AlternativePathway {
  id: string;
  name: string;
  reason: string;
  successProbability: number;
  riskDifference: number;
  costDifference: number;
  timeDifference: string;
}

export interface AIInsightDashboard {
  patientId: string;
  lastUpdated: Date;
  riskAssessment: PatientRiskAssessment;
  behaviorAnalysis: PatientBehaviorPattern;
  healthTrends: HealthTrend[];
  carePathway?: CarePathway;
  upcomingAlerts: SafetyAlert[];
  recommendedActions: {
    priority: 'low' | 'medium' | 'high' | 'urgent';
    action: string;
    reasoning: string;
    dueDate: Date;
  }[];
  insights: {
    key: string;
    value: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
  }[];
}

// API Response Types
export interface RiskAssessmentResponse {
  success: boolean;
  data?: PatientRiskAssessment;
  error?: string;
  processingTime: number;
}

export interface TreatmentRecommendationResponse {
  success: boolean;
  data?: TreatmentRecommendation[];
  error?: string;
  processingTime: number;
}

export interface BehaviorAnalysisResponse {
  success: boolean;
  data?: PatientBehaviorPattern;
  error?: string;
  processingTime: number;
}

export interface HealthTrendResponse {
  success: boolean;
  data?: HealthTrend[];
  error?: string;
  processingTime: number;
}

// Configuration Types
export interface AIConfig {
  riskAssessment: {
    enabled: boolean;
    threshold: number;
    requiredConfidence: number;
    autoUpdate: boolean;
    updateInterval: number; // hours
  };
  treatmentRecommendations: {
    enabled: boolean;
    maxRecommendations: number;
    minConfidence: number;
    includeAlternatives: boolean;
  };
  behaviorAnalysis: {
    enabled: boolean;
    analyzeInterval: number; // days
    minDataPoints: number;
  };
  healthTrends: {
    enabled: boolean;
    alertThresholds: {
      concerning: number;
      critical: number;
    };
    trendPeriods: string[];
  };
  continuousLearning: {
    enabled: boolean;
    retrainInterval: number; // days
    minOutcomes: number;
    autoValidation: boolean;
  };
}
