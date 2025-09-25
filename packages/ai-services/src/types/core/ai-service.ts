// Core AI Service interfaces for unified healthcare AI services
import { z } from 'zod';
import { IAIProvider, ClinicalRequest, ClinicalResponse, AestheticRequest, AestheticResponse } from './ai-provider';

// Base service configuration
export const AIServiceConfigSchema = z.object({
  providerId: z.string(),
  serviceType: z.enum(['clinical', 'aesthetic', 'predictive', 'compliance']),
  maxRetries: z.number().default(3),
  timeout: z.number().default(30000),
  enableCaching: z.boolean().default(true),
  cacheTTL: z.number().default(300000), // 5 minutes
  enableLogging: z.boolean().default(true),
  compliance: z.object({
    strictMode: z.boolean().default(true),
    autoRedactPII: z.boolean().default(true),
    requireConsent: z.boolean().default(true),
    auditAllOperations: z.boolean().default(true)
  }).default({})
});

export type AIServiceConfig = z.infer<typeof AIServiceConfigSchema>;

// Service health status
export const ServiceHealthSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy', 'initializing']),
  providerStatus: z.enum(['connected', 'disconnected', 'error']),
  uptime: z.number(),
  lastOperation: z.date(),
  errorCount: z.number(),
  responseTime: z.object({
    average: z.number(),
    p95: z.number(),
    p99: z.number()
  }),
  cacheStatus: z.object({
    enabled: z.boolean(),
    hitRate: z.number(),
    size: z.number()
  })
});

export type ServiceHealth = z.infer<typeof ServiceHealthSchema>;

// Base AI service interface
export interface IAIService {
  readonly id: string;
  readonly name: string;
  readonly config: AIServiceConfig;
  health: ServiceHealth;

  // Core operations
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  checkHealth(): Promise<ServiceHealth>;

  // Service-specific operations
  process(request: AIServiceRequest): Promise<AIServiceResponse>;
  validateRequest(request: AIServiceRequest): Promise<ValidationResult>;
}

// Generic AI service request
export const AIServiceRequestSchema = z.object({
  id: z.string(),
  type: z.string(),
  payload: z.record(z.unknown()),
  metadata: z.object({
    sessionId: z.string().optional(),
    userId: z.string(),
    patientId: z.string().optional(),
    timestamp: z.date().default(() => new Date()),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    context: z.record(z.unknown()).optional()
  }).optional(),
  compliance: z.object({
    consentVerified: z.boolean().default(false),
    piiRedacted: z.boolean().default(false),
    auditRequired: z.boolean().default(true)
  }).optional()
});

export type AIServiceRequest = z.infer<typeof AIServiceRequestSchema>;

// Generic AI service response
export const AIServiceResponseSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  metadata: z.object({
    processingTime: z.number(),
    timestamp: z.date().default(() => new Date()),
    provider: z.string(),
    model: z.string(),
    usage: z.object({
      promptTokens: z.number().optional(),
      completionTokens: z.number().optional(),
      totalTokens: z.number().optional()
    }).optional()
  }).optional(),
  compliance: z.object({
    validated: z.boolean(),
    piiRedacted: z.boolean(),
    auditLogId: z.string().optional()
  }).optional()
});

export type AIServiceResponse = z.infer<typeof AIServiceResponseSchema>;

// Validation result
export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  suggestions: z.array(z.string()),
  score: z.number().min(0).max(1)
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

// Clinical AI service interface
export interface IClinicalAIService extends IAIService {
  // Clinical operations
  assessPatient(request: PatientAssessmentRequest): Promise<PatientAssessmentResponse>;
  recommendTreatment(request: TreatmentRecommendationRequest): Promise<TreatmentRecommendationResponse>;
  generateClinicalInsight(request: ClinicalInsightRequest): Promise<ClinicalInsightResponse>;
  predictRisks(request: RiskPredictionRequest): Promise<RiskPredictionResponse>;
  
  // Specialized clinical operations
  analyzeSymptoms(request: SymptomAnalysisRequest): Promise<SymptomAnalysisResponse>;
  generatePatientEducation(request: PatientEducationRequest): Promise<PatientEducationResponse>;
  supportClinicalDecision(request: ClinicalDecisionRequest): Promise<ClinicalDecisionResponse>;
}

// Patient assessment request
export const PatientAssessmentRequestSchema = z.object({
  patientId: z.string(),
  assessmentType: z.enum(['initial', 'followup', 'emergency', 'routine']),
  clinicalData: z.object({
    symptoms: z.array(z.string()),
    vitalSigns: z.record(z.number()),
    medicalHistory: z.array(z.string()),
    currentMedications: z.array(z.string()),
    allergies: z.array(z.string()),
    lifestyleFactors: z.object({
      smoking: z.boolean(),
      alcohol: z.boolean(),
      exercise: z.string(),
      diet: z.string()
    }).optional()
  }),
  assessmentFocus: z.array(z.string()).optional(),
  previousAssessments: z.array(z.string()).optional()
});

export type PatientAssessmentRequest = z.infer<typeof PatientAssessmentRequestSchema>;

// Patient assessment response
export const PatientAssessmentResponseSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  assessmentDate: z.date(),
  overallAssessment: z.string(),
  severity: z.enum(['mild', 'moderate', 'severe', 'critical']),
  keyFindings: z.array(z.object({
    finding: z.string(),
    significance: z.enum(['low', 'medium', 'high']),
    evidence: z.string()
  })),
  recommendations: z.array(z.object({
    action: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    timeframe: z.string()
  })),
  riskFactors: z.array(z.object({
    factor: z.string(),
    level: z.enum(['low', 'medium', 'high']),
    mitigation: z.string()
  })),
  followUpPlan: z.object({
    timeframe: z.string(),
    requiredTests: z.array(z.string()),
    specialistReferral: z.string().optional()
  }),
  confidence: z.number().min(0).max(1),
  sources: z.array(z.string()).optional()
});

export type PatientAssessmentResponse = z.infer<typeof PatientAssessmentResponseSchema>;

// Treatment recommendation request
export const TreatmentRecommendationRequestSchema = z.object({
  patientId: z.string(),
  diagnosis: z.string(),
  condition: z.string(),
  patientProfile: z.object({
    age: z.number(),
    gender: z.string(),
    weight: z.number().optional(),
    height: z.number().optional(),
    comorbidities: z.array(z.string()),
    contraindications: z.array(z.string()),
    preferences: z.array(z.string()),
    previousTreatments: z.array(z.string())
  }),
  treatmentGoals: z.array(z.string()),
  constraints: z.object({
    budget: z.number().optional(),
    timeFrame: z.string().optional(),
    location: z.string().optional(),
    insuranceCoverage: z.array(z.string()).optional()
  }).optional()
});

export type TreatmentRecommendationRequest = z.infer<typeof TreatmentRecommendationRequestSchema>;

// Treatment recommendation response
export const TreatmentRecommendationResponseSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  diagnosis: z.string(),
  recommendations: z.array(z.object({
    treatment: z.string(),
    description: z.string(),
    efficacy: z.number().min(0).max(1),
    safety: z.number().min(0).max(1),
    evidence: z.string(),
    dosage: z.string().optional(),
    duration: z.string(),
    sideEffects: z.array(z.string()),
    cost: z.object({
      estimated: z.number(),
      currency: z.string().default('BRL'),
      insuranceCoverage: z.boolean().optional()
    }).optional()
  })),
  primaryRecommendation: z.object({
    treatment: z.string(),
    rationale: z.string(),
    expectedOutcomes: z.array(z.string()),
    monitoring: z.array(z.string())
  }),
  alternatives: z.array(z.object({
    treatment: z.string(),
    rationale: z.string(),
    considerations: z.array(z.string())
  })),
  lifestyleRecommendations: z.array(z.object({
    recommendation: z.string(),
    importance: z.enum(['low', 'medium', 'high']),
    implementation: z.string()
  })),
  followUpPlan: z.object({
    schedule: z.array(z.string()),
    monitoring: z.array(z.string()),
    redFlags: z.array(z.string())
  }),
  confidence: z.number().min(0).max(1),
  references: z.array(z.string()).optional()
});

export type TreatmentRecommendationResponse = z.infer<typeof TreatmentRecommendationResponseSchema>;

// Clinical insight request
export const ClinicalInsightRequestSchema = ClinicalRequestSchema.extend({
  insightType: z.enum([
    'diagnostic_support',
    'treatment_optimization',
    'risk_stratification',
    'outcome_prediction',
    'clinical_guidance'
  ]),
  context: z.object({
    patientData: z.record(z.unknown()).optional(),
    clinicalGuidelines: z.array(z.string()).optional(),
    bestPractices: z.array(z.string()).optional(),
    similarCases: z.array(z.string()).optional()
  }).optional()
});

export type ClinicalInsightRequest = z.infer<typeof ClinicalInsightRequestSchema>;

// Clinical insight response
export const ClinicalInsightResponseSchema = ClinicalResponseSchema.extend({
  insightType: z.enum([
    'diagnostic_support',
    'treatment_optimization',
    'risk_stratification',
    'outcome_prediction',
    'clinical_guidance'
  ]),
  evidenceLevel: z.enum(['low', 'moderate', 'high', 'very_high']),
  applicableGuidelines: z.array(z.object({
    guideline: z.string(),
    relevance: z.string(),
    recommendation: z.string()
  })),
  clinicalReasoning: z.string(),
  confidenceScore: z.number().min(0).max(1),
  limitations: z.array(z.string())
});

export type ClinicalInsightResponse = z.infer<typeof ClinicalInsightResponseSchema>;

// Aesthetic AI service interface
export interface IAestheticAIService extends IAIService {
  // Aesthetic operations
  consultAestheticProcedure(request: AestheticConsultationRequest): Promise<AestheticConsultationResponse>;
  planTreatment(request: AestheticTreatmentPlanRequest): Promise<AestheticTreatmentPlanResponse>;
  predictOutcomes(request: AestheticOutcomePredictionRequest): Promise<AestheticOutcomePredictionResponse>;
  recommendProcedure(request: AestheticProcedureRecommendationRequest): Promise<AestheticProcedureRecommendationResponse>;
  
  // Specialized aesthetic operations
  analyzeSkinCondition(request: SkinAnalysisRequest): Promise<SkinAnalysisResponse>;
  assessSuitability(request: SuitabilityAssessmentRequest): Promise<SuitabilityAssessmentResponse>;
  generateAftercare(request: AftercareGenerationRequest): Promise<AftercareGenerationResponse>;
}

// Aesthetic consultation request
export const AestheticConsultationRequestSchema = AestheticRequestSchema.extend({
  consultationType: z.enum(['initial', 'followup', 'preoperative', 'postoperative']),
  patientConcerns: z.array(z.string()),
  aestheticGoals: z.array(z.string()),
  patientHistory: z.object({
    previousTreatments: z.array(z.string()),
    skinConditions: z.array(z.string()),
    allergies: z.array(z.string()),
    medications: z.array(z.string()),
    lifestyle: z.object({
      smoking: z.boolean(),
      sunExposure: z.string(),
      skincare: z.array(z.string())
    }).optional()
  }),
  focusAreas: z.array(z.string()).optional(),
  budgetRange: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string().default('BRL')
  }).optional()
});

export type AestheticConsultationRequest = z.infer<typeof AestheticConsultationRequestSchema>;

// Aesthetic consultation response
export const AestheticConsultationResponseSchema = AestheticResponseSchema.extend({
  consultationType: z.enum(['initial', 'followup', 'preoperative', 'postoperative']),
  assessment: z.object({
    concernsAnalysis: z.array(z.object({
      concern: z.string(),
      severity: z.enum(['mild', 'moderate', 'severe']),
      treatability: z.number().min(0).max(1),
      recommendedApproach: z.string()
    })),
    suitabilityAssessment: z.object({
      overallSuitability: z.enum(['excellent', 'good', 'fair', 'poor']),
      considerations: z.array(z.string()),
      contraindications: z.array(z.string())
    }),
    treatmentAreas: z.array(z.object({
      area: z.string(),
      recommendedTreatments: z.array(z.string()),
      expectedImprovement: z.string()
    }))
  }),
  recommendations: z.array(z.object({
    procedure: z.string(),
    description: z.string(),
    priority: z.enum(['immediate', 'short_term', 'long_term']),
    estimatedCost: z.object({
      min: z.number(),
      max: z.number(),
      currency: z.string().default('BRL')
    }),
    timeline: z.string(),
    expectedResults: z.array(z.string())
  })),
  treatmentPlan: z.object({
    phases: z.array(z.object({
      phase: z.string(),
      procedures: z.array(z.string()),
      timeframe: z.string(),
      goals: z.array(z.string())
    })),
    totalDuration: z.string(),
    estimatedTotalCost: z.object({
      min: z.number(),
      max: z.number(),
      currency: z.string().default('BRL')
    })
  }),
  risksAndConsiderations: z.object({
    generalRisks: z.array(z.string()),
    specificRisks: z.array(z.string()),
    recoveryConsiderations: z.array(z.string()),
    alternativeOptions: z.array(z.string())
  }),
  nextSteps: z.array(z.object({
    step: z.string(),
    timeframe: z.string(),
    preparation: z.string()
  })),
  confidence: z.number().min(0).max(1)
});

export type AestheticConsultationResponse = z.infer<typeof AestheticConsultationResponseSchema>;

// Risk prediction request
export const RiskPredictionRequestSchema = z.object({
  patientId: z.string(),
  predictionType: z.enum(['treatment_risk', 'complication_risk', 'outcome_risk', 'readmission_risk']),
  context: z.object({
    procedure: z.string().optional(),
    condition: z.string().optional(),
    patientData: z.record(z.unknown()),
    riskFactors: z.array(z.string()).optional(),
    protectiveFactors: z.array(z.string()).optional()
  })
});

export type RiskPredictionRequest = z.infer<typeof RiskPredictionRequestSchema>;

// Risk prediction response
export const RiskPredictionResponseSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  predictionType: z.enum(['treatment_risk', 'complication_risk', 'outcome_risk', 'readmission_risk']),
  riskAssessment: z.object({
    overallRiskLevel: z.enum(['very_low', 'low', 'moderate', 'high', 'very_high']),
    riskScore: z.number().min(0).max(1),
    confidence: z.number().min(0).max(1),
    timeframe: z.string()
  }),
  riskFactors: z.array(z.object({
    factor: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
    likelihood: z.number().min(0).max(1),
    mitigation: z.string()
  })),
  predictedOutcomes: z.array(z.object({
    outcome: z.string(),
    probability: z.number().min(0).max(1),
    timeframe: z.string(),
    confidence: z.number().min(0).max(1)
  })),
  recommendations: z.array(z.object({
    action: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    rationale: z.string(),
    expectedImpact: z.string()
  })),
  monitoring: z.object({
    parameters: z.array(z.string()),
    frequency: z.string(),
    alertThresholds: z.array(z.object({
      parameter: z.string(),
      threshold: z.number(),
      action: z.string()
    }))
  }),
  references: z.array(z.string()).optional()
});

export type RiskPredictionResponse = z.infer<typeof RiskPredictionResponseSchema>;

// Request types for other specialized operations (abbreviated for brevity)
export type SymptomAnalysisRequest = z.infer<typeof SymptomAnalysisRequestSchema>;
export type SymptomAnalysisResponse = z.infer<typeof SymptomAnalysisResponseSchema>;
export type PatientEducationRequest = z.infer<typeof PatientEducationRequestSchema>;
export type PatientEducationResponse = z.infer<typeof PatientEducationResponseSchema>;
export type ClinicalDecisionRequest = z.infer<typeof ClinicalDecisionRequestSchema>;
export type ClinicalDecisionResponse = z.infer<typeof ClinicalDecisionResponseSchema>;
export type AestheticTreatmentPlanRequest = z.infer<typeof AestheticTreatmentPlanRequestSchema>;
export type AestheticTreatmentPlanResponse = z.infer<typeof AestheticTreatmentPlanResponseSchema>;
export type AestheticOutcomePredictionRequest = z.infer<typeof AestheticOutcomePredictionRequestSchema>;
export type AestheticOutcomePredictionResponse = z.infer<typeof AestheticOutcomePredictionResponseSchema>;
export type AestheticProcedureRecommendationRequest = z.infer<typeof AestheticProcedureRecommendationRequestSchema>;
export type AestheticProcedureRecommendationResponse = z.infer<typeof AestheticProcedureRecommendationResponseSchema>;
export type SkinAnalysisRequest = z.infer<typeof SkinAnalysisRequestSchema>;
export type SkinAnalysisResponse = z.infer<typeof SkinAnalysisResponseSchema>;
export type SuitabilityAssessmentRequest = z.infer<typeof SuitabilityAssessmentRequestSchema>;
export type SuitabilityAssessmentResponse = z.infer<typeof SuitabilityAssessmentResponseSchema>;
export type AftercareGenerationRequest = z.infer<typeof AftercareGenerationRequestSchema>;
export type AftercareGenerationResponse = z.infer<typeof AftercareGenerationResponseSchema>;

// Schema definitions for abbreviated types (full implementations would be in separate files)
const SymptomAnalysisRequestSchema = z.object({
  patientId: z.string(),
  symptoms: z.array(z.string()),
  duration: z.string(),
  severity: z.enum(['mild', 'moderate', 'severe']),
  additionalContext: z.record(z.unknown()).optional()
});

const SymptomAnalysisResponseSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  analysis: z.string(),
  possibleCauses: z.array(z.string()),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'emergency']),
  recommendations: z.array(z.string()),
  confidence: z.number().min(0).max(1)
});

const PatientEducationRequestSchema = z.object({
  patientId: z.string(),
  topic: z.string(),
  educationLevel: z.enum(['basic', 'intermediate', 'advanced']),
  format: z.enum(['text', 'simplified', 'visual']),
  language: z.string().default('pt-BR')
});

const PatientEducationResponseSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  content: z.string(),
  keyPoints: z.array(z.string()),
  actionItems: z.array(z.string()),
  followUpQuestions: z.array(z.string()),
  readability: z.string()
});

const ClinicalDecisionRequestSchema = z.object({
  patientId: z.string(),
  clinicalScenario: z.string(),
  availableOptions: z.array(z.string()),
  patientPreferences: z.array(z.string()),
  clinicalData: z.record(z.unknown()),
  decisionPoint: z.string()
});

const ClinicalDecisionResponseSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  recommendedOption: z.string(),
  rationale: z.string(),
  evidence: z.string(),
  confidence: z.number().min(0).max(1),
  alternatives: z.array(z.object({
    option: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string())
  })),
  considerations: z.array(z.string())
});

const AestheticTreatmentPlanRequestSchema = z.object({
  patientId: z.string(),
  procedures: z.array(z.string()),
  goals: z.array(z.string()),
  timeline: z.string(),
  budget: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string().default('BRL')
  }).optional()
});

const AestheticTreatmentPlanResponseSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  treatmentPlan: z.object({
    phases: z.array(z.object({
      phase: z.string(),
      procedures: z.array(z.string()),
      timeframe: z.string(),
      goals: z.array(z.string())
    })),
    totalDuration: z.string(),
    estimatedCost: z.object({
      min: z.number(),
      max: z.number(),
      currency: z.string().default('BRL')
    })
  }),
  scheduling: z.array(z.object({
    procedure: z.string(),
    recommendedDate: z.string(),
    duration: z.string(),
    preparation: z.array(z.string())
  })),
  expectedResults: z.array(z.string()),
  risks: z.array(z.string()),
  aftercare: z.array(z.string())
});

const AestheticOutcomePredictionRequestSchema = z.object({
  patientId: z.string(),
  procedure: z.string(),
  patientData: z.record(z.unknown()),
  timeframe: z.string()
});

const AestheticOutcomePredictionResponseSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  procedure: z.string(),
  timeframe: z.string(),
  predictedOutcomes: z.array(z.object({
    outcome: z.string(),
    probability: z.number().min(0).max(1),
    confidence: z.number().min(0).max(1)
  })),
  confidence: z.number().min(0).max(1),
  factorsConsidered: z.array(z.string())
});

const AestheticProcedureRecommendationRequestSchema = z.object({
  patientId: z.string(),
  concerns: z.array(z.string()),
  goals: z.array(z.string()),
  constraints: z.object({
    budget: z.object({
      min: z.number(),
      max: z.number()
    }).optional(),
    downtime: z.string().optional(),
    preferences: z.array(z.string())
  }).optional()
});

const AestheticProcedureRecommendationResponseSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  recommendations: z.array(z.object({
    procedure: z.string(),
    suitability: z.number().min(0).max(1),
    expectedResults: z.string(),
    recovery: z.string(),
    estimatedCost: z.object({
      min: z.number(),
      max: z.number(),
      currency: z.string().default('BRL')
    })
  })),
  topRecommendation: z.string(),
  rationale: z.string(),
  confidence: z.number().min(0).max(1),
});

const SkinAnalysisRequestSchema = z.object({
  patientId: z.string(),
  skinType: z.string(),
  concerns: z.array(z.string()),
  currentRoutine: z.array(z.string()).optional(),
  environmentalFactors: z.array(z.string()).optional()
});

const SkinAnalysisResponseSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  skinCondition: z.string(),
  concerns: z.array(z.object({
    concern: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe']),
    recommendations: z.array(z.string())
  })),
  recommendations: z.array(z.object({
    product: z.string(),
    usage: z.string(),
    benefits: z.string()
  })),
  routine: z.array(z.object({
    step: z.string(),
    frequency: z.string(),
    products: z.array(z.string())
  }))
});

const SuitabilityAssessmentRequestSchema = z.object({
  patientId: z.string(),
  procedure: z.string(),
  patientData: z.record(z.unknown()),
  concerns: z.array(z.string())
});

const SuitabilityAssessmentResponseSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  procedure: z.string(),
  suitability: z.object({
    overall: z.enum(['excellent', 'good', 'fair', 'poor']),
    score: z.number().min(0).max(1),
    factors: z.array(z.object({
      factor: z.string(),
      assessment: z.string(),
      impact: z.enum(['positive', 'neutral', 'negative'])
    }))
  }),
  recommendations: z.array(z.string()),
  contraindications: z.array(z.string()),
  considerations: z.array(z.string())
});

const AftercareGenerationRequestSchema = z.object({
  patientId: z.string(),
  procedure: z.string(),
  recoveryTimeline: z.string(),
  specificConcerns: z.array(z.string()).optional()
});

const AftercareGenerationResponseSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  procedure: z.string(),
  aftercarePlan: z.object({
    immediateCare: z.array(z.string()),
    firstWeek: z.array(z.string()),
    firstMonth: z.array(z.string()),
    longTerm: z.array(z.string())
  }),
  warningSigns: z.array(z.string()),
  followUpSchedule: z.array(z.object({
    timeframe: z.string(),
    focus: z.string()
  })),
  products: z.array(z.object({
    product: z.string(),
    usage: z.string(),
    duration: z.string()
  })),
  lifestyleAdjustments: z.array(z.string())
});