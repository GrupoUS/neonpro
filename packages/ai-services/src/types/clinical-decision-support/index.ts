/**
 * Comprehensive Clinical Decision Support System Types
 * 
 * Unified type definitions for general medical AI, aesthetic medicine,
 * predictive analytics, and Brazilian healthcare compliance
 */

import { z } from 'zod';

// ============================================================================
// Core Clinical Decision Support Types
// ============================================================================

export const ClinicalContextSchema = z.object({
  patientId: z.string(),
  encounterId: z.string().optional(),
  encounterType: z.enum(['inpatient', 'outpatient', 'emergency', 'telemedicine', 'aesthetic_consultation']),
  providerId: z.string(),
  providerRole: z.string(),
  department: z.string(),
  careTeam: z.array(z.string()).optional(),
  timestamp: z.date(),
  locale: z.string().default('pt-BR'),
  timezone: z.string().default('America/Sao_Paulo')
});

export type ClinicalContext = z.infer<typeof ClinicalContextSchema>;

export const PatientProfileSchema = z.object({
  id: z.string(),
  demographics: z.object({
    age: z.number(),
    gender: z.enum(['male', 'female', 'other', 'unknown']),
    dateOfBirth: z.date(),
    contact: z.object({
      phone: z.string().optional(),
      email: z.string().email().optional(),
      emergencyContact: z.string().optional()
    }).optional()
  }),
  medicalHistory: z.object({
    conditions: z.array(z.object({
      condition: z.string(),
      diagnosisDate: z.date().optional(),
      status: z.enum(['active', 'resolved', 'chronic']),
      severity: z.enum(['mild', 'moderate', 'severe']).optional()
    })).optional(),
    medications: z.array(z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      startDate: z.date(),
      endDate: z.date().optional(),
      active: z.boolean().default(true)
    })).optional(),
    allergies: z.array(z.object({
      substance: z.string(),
      reaction: z.string(),
      severity: z.enum(['mild', 'moderate', 'severe'])
    })).optional(),
    surgicalHistory: z.array(z.object({
      procedure: z.string(),
      date: z.date(),
      complications: z.string().optional()
    })).optional(),
    familyHistory: z.record(z.string(), z.array(z.string())).optional()
  }),
  lifestyle: z.object({
    smoking: z.enum(['never', 'former', 'current']),
    alcohol: z.enum(['never', 'occasional', 'regular', 'frequent']),
    exercise: z.enum(['sedentary', 'light', 'moderate', 'vigorous']),
    diet: z.enum(['poor', 'fair', 'good', 'excellent'])
  }).optional(),
  geneticFactors: z.array(z.string()).optional()
});

export type PatientProfile = z.infer<typeof PatientProfileSchema>;

export const ClinicalAssessmentRequestSchema = z.object({
  context: ClinicalContextSchema,
  patientProfile: PatientProfileSchema,
  assessmentType: z.enum(['initial', 'followup', 'emergency', 'routine', 'preoperative', 'postoperative', 'aesthetic']),
  symptoms: z.array(z.object({
    symptom: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe']),
    duration: z.string(),
    onset: z.date().optional()
  })),
  vitalSigns: z.object({
    bloodPressure: z.string().optional(),
    heartRate: z.number().optional(),
    temperature: z.number().optional(),
    respiratoryRate: z.number().optional(),
    oxygenSaturation: z.number().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    bmi: z.number().optional()
  }).optional(),
  primaryComplaint: z.string(),
  assessmentFocus: z.array(z.string()).optional()
});

export type ClinicalAssessmentRequest = z.infer<typeof ClinicalAssessmentRequestSchema>;

export const ClinicalFindingSchema = z.object({
  id: z.string(),
  type: z.enum(['diagnosis', 'symptom', 'sign', 'lab_result', 'imaging_finding']),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  severity: z.enum(['mild', 'moderate', 'severe', 'critical']).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'immediate']).optional(),
  evidence: z.array(z.string()).optional(),
  differentialDiagnoses: z.array(z.object({
    condition: z.string(),
    probability: z.number().min(0).max(1),
    reasoning: z.string()
  })).optional()
});

export type ClinicalFinding = z.infer<typeof ClinicalFindingSchema>;

export const ClinicalAssessmentResultSchema = z.object({
  assessmentId: z.string(),
  requestId: z.string(),
  findings: z.array(ClinicalFindingSchema),
  primaryAssessment: z.string(),
  diagnosticImpressions: z.array(z.string()),
  recommendations: z.array(z.string()),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'immediate']),
  requiresImmediateAttention: z.boolean(),
  suggestedNextSteps: z.array(z.string()),
  patientEducationTopics: z.array(z.string()),
  followUpPlan: z.object({
    timing: z.string(),
    actions: z.array(z.string()),
    monitoringParameters: z.array(z.string())
  }).optional(),
  confidence: z.number().min(0).max(1),
  aiProvider: z.string(),
  modelVersion: z.string(),
  generatedAt: z.date(),
  processingTime: z.number()
});

export type ClinicalAssessmentResult = z.infer<typeof ClinicalAssessmentResultSchema>;

// ============================================================================
// Aesthetic Medicine Specialization Types
// ============================================================================

export const FitzpatrickScaleSchema = z.enum(['I', 'II', 'III', 'IV', 'V', 'VI']);

export type FitzpatrickScale = z.infer<typeof FitzpatrickScaleSchema>;

export const AestheticPatientProfileSchema = PatientProfileSchema.extend({
  aestheticProfile: z.object({
    skinType: FitzpatrickScaleSchema,
    skinConditions: z.array(z.string()),
    skinConcerns: z.array(z.enum([
      'acne', 'rosacea', 'hyperpigmentation', 'wrinkles', 'loss_of_volume',
      'sagging', 'uneven_texture', 'enlarged_pores', 'dark_circles', 'scars'
    ])),
    previousTreatments: z.array(z.object({
      procedure: z.string(),
      date: z.date(),
      provider: z.string(),
      satisfaction: z.number().min(1).max(5).optional(),
      complications: z.string().optional()
    })).optional(),
    aestheticGoals: z.array(z.string()),
    budgetRange: z.object({
      min: z.number(),
      max: z.number(),
      currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL')
    }).optional(),
    timeConstraints: z.object({
      preferredSchedule: z.string(),
      downtimeTolerance: z.enum(['none', 'minimal', 'moderate', 'significant']),
      treatmentFrequency: z.enum(['single', 'monthly', 'quarterly', 'annual'])
    }).optional(),
    painTolerance: z.enum(['low', 'medium', 'high']),
    lifestyleFactors: z.object({
      sunExposure: z.enum(['minimal', 'moderate', 'frequent']),
      smoking: z.boolean(),
      skincareRoutine: z.enum(['minimal', 'basic', 'comprehensive', 'professional']),
      stressLevel: z.enum(['low', 'medium', 'high'])
    }).optional()
  }).optional()
});

export type AestheticPatientProfile = z.infer<typeof AestheticPatientProfileSchema>;

export const AestheticProcedureSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum([
    'injectables', 'lasers', 'energy_devices', 'chemical_peels', 
    'surgical', 'skincare', 'body_contouring', 'hair_restoration'
  ]),
  description: z.string(),
  indications: z.array(z.string()),
  contraindications: z.object({
    absolute: z.array(z.string()),
    relative: z.array(z.string())
  }),
  protocol: z.object({
    sessions: z.number(),
    interval: z.string(),
    duration: z.number(),
    anesthesia: z.enum(['none', 'topical', 'local', 'sedation'])
  }),
  recovery: z.object({
    downtime: z.enum(['none', '1-2_days', '3-7_days', '1-2_weeks', '2-4_weeks']),
    activityRestrictions: z.array(z.string()),
    sideEffects: z.array(z.string())
  }),
  expectedResults: z.object({
    onset: z.string(),
    longevity: z.string(),
    satisfaction: z.number().min(0).max(1)
  }),
  cost: z.object({
    base: z.number(),
    currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
    additionalCosts: z.array(z.string()).optional()
  }),
  evidenceLevel: z.enum(['A', 'B', 'C', 'D']),
  safetyProfile: z.object({
    commonRisks: z.array(z.string()),
    rareRisks: z.array(z.string()),
    seriousRisks: z.array(z.string())
  })
});

export type AestheticProcedure = z.infer<typeof AestheticProcedureSchema>;

export const TreatmentRecommendationSchema = z.object({
  id: z.string(),
  procedureId: z.string(),
  procedureName: z.string(),
  confidence: z.number().min(0).max(1),
  efficacy: z.number().min(0).max(1),
  safety: z.number().min(0).max(1),
  suitability: z.number().min(0).max(1),
  expectedResults: z.object({
    timeline: z.string(),
    improvement: z.string(),
    longevity: z.string(),
    satisfaction: z.number().min(0).max(1)
  }),
  risks: z.array(z.object({
    type: z.enum(['common', 'rare', 'serious']),
    description: z.string(),
    probability: z.number().min(0).max(1),
    mitigation: z.string()
  })),
  contraindications: z.array(z.string()),
  alternatives: z.array(z.string()),
  cost: z.object({
    estimate: z.number(),
    currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
    sessions: z.number(),
    total: z.number()
  }),
  recovery: z.object({
    downtime: z.string(),
    restrictions: z.array(z.string()),
    aftercare: z.array(z.string())
  }),
  evidenceLevel: z.enum(['A', 'B', 'C', 'D']),
  personalizedNotes: z.string().optional(),
  patientEducation: z.array(z.string())
});

export type TreatmentRecommendation = z.infer<typeof TreatmentRecommendationSchema>;

export const AestheticConsultationRequestSchema = z.object({
  context: ClinicalContextSchema.extend({
    consultationType: z.enum(['initial', 'followup', 'preoperative', 'postoperative', 'treatment_planning'])
  }),
  patientProfile: AestheticPatientProfileSchema,
  consultationFocus: z.array(z.string()),
  specificConcerns: z.array(z.string()),
  aestheticGoals: z.array(z.string()),
  budgetConsiderations: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
    financing: z.boolean().default(false)
  }).optional(),
  timeframe: z.string().optional(),
  previousTreatments: z.array(z.string()).optional(),
  availableProcedures: z.array(z.string()).optional()
});

export type AestheticConsultationRequest = z.infer<typeof AestheticConsultationRequestSchema>;

export const AestheticConsultationResultSchema = z.object({
  consultationId: z.string(),
  requestId: z.string(),
  patientAssessment: z.object({
    skinAnalysis: z.object({
      type: FitzpatrickScaleSchema,
      conditions: z.array(z.string()),
      concerns: z.array(z.string()),
    }),
    facialAnalysis: z.object({
      symmetry: z.number().min(0).max(1),
      volumeLoss: z.array(z.string()),
    }).optional(),
    overallAssessment: z.string()
  }),
  recommendations: z.array(TreatmentRecommendationSchema),
  prioritizedPlan: z.array(z.object({
    phase: z.number(),
    procedures: z.array(z.string()),
    timeline: z.string(),
    objectives: z.array(z.string()),
    estimatedCost: z.number()
  })),
  riskAssessment: z.object({
    overall: z.enum(['low', 'medium', 'high']),
    factors: z.array(z.string()),
    mitigations: z.array(z.string())
  }),
  contraindications: z.array(z.string()),
  alternatives: z.array(z.string()),
  patientEducation: z.array(z.string()),
  followUpPlan: z.object({
    immediate: z.array(z.string()),
    shortTerm: z.array(z.string()),
    longTerm: z.array(z.string())
  }),
  nextSteps: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  aiProvider: z.string(),
  generatedAt: z.date()
});

export type AestheticConsultationResult = z.infer<typeof AestheticConsultationResultSchema>;

// ============================================================================
// Predictive Analytics Types
// ============================================================================

export const PredictionRequestSchema = z.object({
  patientId: z.string(),
  predictionType: z.enum([
    'treatment_outcome', 'risk_assessment', 'no_show_risk', 'retention_prediction',
    'revenue_forecast', 'complication_risk', 'patient_satisfaction', 'recovery_time'
  ]),
  timeframe: z.enum(['week', 'month', 'quarter', 'year']),
  context: z.record(z.string(), z.unknown()).optional(),
  factors: z.record(z.string(), z.unknown()).optional(),
  includeConfidence: z.boolean().default(true),
  includeRecommendations: z.boolean().default(true)
});

export type PredictionRequest = z.infer<typeof PredictionRequestSchema>;

export const PredictionResultSchema = z.object({
  predictionId: z.string(),
  requestId: z.string(),
  predictionType: z.string(),
  result: z.record(z.string(), z.unknown()),
  confidence: z.number().min(0).max(1),
  factors: z.array(z.object({
    factor: z.string(),
    impact: z.number().min(-1).max(1),
    importance: z.number().min(0).max(1)
  })),
  recommendations: z.array(z.string()),
  uncertainty: z.number().min(0).max(1).optional(),
  confidenceInterval: z.object({
    lower: z.number(),
    upper: z.number()
  }).optional(),
  modelVersion: z.string(),
  generatedAt: z.date()
});

export type PredictionResult = z.infer<typeof PredictionResultSchema>;

export const PatientOutcomePredictionSchema = z.object({
  treatmentSuccess: z.number().min(0).max(1),
  satisfaction: z.number().min(0).max(1),
  complicationRisk: z.number().min(0).max(1),
  recoveryTime: z.object({
    expected: z.number(),
    range: z.tuple([z.number(), z.number()])
  }),
  adherence: z.number().min(0).max(1),
  followUpCompliance: z.number().min(0).max(1),
  qualityOfLifeImpact: z.number().min(-1).max(1)
});

export type PatientOutcomePrediction = z.infer<typeof PatientOutcomePredictionSchema>;

// ============================================================================
// Brazilian Healthcare Compliance Types
// ============================================================================

export const ComplianceFrameworkSchema = z.enum(['LGPD', 'ANVISA', 'CFM', 'ISO_27001', 'HIPAA']);

export type ComplianceFramework = z.infer<typeof ComplianceFrameworkSchema>;

export const ComplianceValidationRequestSchema = z.object({
  data: z.record(z.string(), z.unknown()),
  dataType: z.enum(['patient_data', 'clinical_data', 'aesthetic_data', 'financial_data']),
  frameworks: z.array(ComplianceFrameworkSchema),
  context: z.record(z.string(), z.unknown()).optional(),
  validationLevel: z.enum(['basic', 'strict', 'comprehensive']).default('strict')
});

export type ComplianceValidationRequest = z.infer<typeof ComplianceValidationRequestSchema>;

export const ComplianceValidationResultSchema = z.object({
  validationId: z.string(),
  overallCompliance: z.boolean(),
  frameworkResults: z.record(z.string(), z.object({
    compliant: z.boolean(),
    violations: z.array(z.object({
      rule: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      description: z.string(),
      recommendation: z.string()
    })),
    score: z.number().min(0).max(1)
  })),
  anonymizationApplied: z.boolean(),
  dataFieldsProcessed: z.array(z.string()),
  recommendations: z.array(z.string()),
  auditLog: z.array(z.object({
    timestamp: z.date(),
    action: z.string(),
    details: z.string()
  })),
  generatedAt: z.date()
});

export type ComplianceValidationResult = z.infer<typeof ComplianceValidationResultSchema>;

export const CFMComplianceSchema = z.object({
  professionalLicense: z.string().optional(),
  scopeOfPractice: z.string().optional(),
  telemedicineGuidelines: z.boolean().default(true),
  patientConsent: z.boolean().default(true),
  documentationStandards: z.boolean().default(true),
  ethicalGuidelines: z.boolean().default(true),
  continuingEducation: z.boolean().default(true)
});

export type CFMCompliance = z.infer<typeof CFMComplianceSchema>;

export const ANVISAComplianceSchema = z.object({
  medicalDeviceRegistration: z.string().optional(),
  goodPractices: z.boolean().default(true),
  qualityControl: z.boolean().default(true),
  adverseEventReporting: z.boolean().default(true),
  clinicalTrialCompliance: z.boolean().default(true),
  pharmacovigilance: z.boolean().default(true)
});

export type ANVISACompliance = z.infer<typeof ANVISAComplianceSchema>;

export const LGPDComplianceSchema = z.object({
  dataProcessingBasis: z.enum(['consent', 'legitimate_interest', 'legal_obligation', 'vital_interest']),
  purposeLimitation: z.boolean().default(true),
  dataMinimization: z.boolean().default(true),
  retentionPeriod: z.string().optional(),
  anonymizationPseudonymization: z.boolean().default(true),
  securityMeasures: z.boolean().default(true),
  dataSubjectRights: z.boolean().default(true),
  internationalTransfers: z.boolean().default(false),
  dataProtectionOfficer: z.string().optional()
});

export type LGPDCompliance = z.infer<typeof LGPDComplianceSchema>;

// ============================================================================
// AG-UI Protocol Clinical Event Types
// ============================================================================

export const ClinicalEventSchema = z.object({
  eventId: z.string(),
  eventType: z.enum([
    'clinical_assessment', 'treatment_recommendation', 'aesthetic_consultation',
    'risk_assessment', 'compliance_validation', 'patient_education',
    'follow_up_recommendation', 'medication_review', 'diagnostic_support'
  ]),
  patientId: z.string(),
  providerId: z.string(),
  timestamp: z.date(),
  data: z.record(z.string(), z.unknown()),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  requiresResponse: z.boolean().default(false),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export type ClinicalEvent = z.infer<typeof ClinicalEventSchema>;

export const ClinicalEventResponseSchema = z.object({
  eventId: z.string(),
  responseType: z.enum(['acknowledgment', 'result', 'error', 'follow_up']),
  timestamp: z.date(),
  data: z.record(z.string(), z.unknown()).optional(),
  error: z.string().optional(),
  processingTime: z.number()
});

export type ClinicalEventResponse = z.infer<typeof ClinicalEventResponseSchema>;

// ============================================================================
// Unified Clinical Decision Support Request Types
// ============================================================================

export const ClinicalDecisionRequestSchema = z.discriminatedUnion('requestType', [
  z.object({
    requestType: z.literal('clinical_assessment'),
    data: ClinicalAssessmentRequestSchema
  }),
  z.object({
    requestType: z.literal('aesthetic_consultation'),
    data: AestheticConsultationRequestSchema
  }),
  z.object({
    requestType: z.literal('treatment_planning'),
    data: z.object({
      context: ClinicalContextSchema,
      patientProfile: PatientProfileSchema,
      diagnosis: z.string(),
      treatmentGoals: z.array(z.string()),
      constraints: z.record(z.string(), z.unknown()).optional()
    })
  }),
  z.object({
    requestType: z.literal('risk_assessment'),
    data: z.object({
      context: ClinicalContextSchema,
      patientProfile: PatientProfileSchema,
      procedure: z.string(),
      riskFactors: z.array(z.string())
    })
  }),
  z.object({
    requestType: z.literal('compliance_validation'),
    data: ComplianceValidationRequestSchema
  }),
  z.object({
    requestType: z.literal('prediction'),
    data: PredictionRequestSchema
  }),
  z.object({
    requestType: z.literal('patient_education'),
    data: z.object({
      patientId: z.string(),
      topic: z.string(),
      educationLevel: z.enum(['basic', 'intermediate', 'advanced']),
      language: z.string().default('pt-BR'),
      format: z.enum(['text', 'simplified', 'visual', 'interactive']).default('text')
    })
  })
]);

export type ClinicalDecisionRequest = z.infer<typeof ClinicalDecisionRequestSchema>;

export const ClinicalDecisionResponseSchema = z.object({
  requestId: z.string(),
  requestType: z.string(),
  success: z.boolean(),
  result: z.record(z.string(), z.unknown()).optional(),
  error: z.string().optional(),
  metadata: z.object({
    processingTime: z.number(),
    aiProvider: z.string(),
    modelVersion: z.string(),
    tokensUsed: z.number().optional(),
    cost: z.number().optional(),
    confidence: z.number().min(0).max(1).optional()
  }),
  compliance: ComplianceValidationResultSchema.optional(),
  recommendations: z.array(z.string()).optional(),
  requiresHumanReview: z.boolean().default(false),
  generatedAt: z.date()
});

export type ClinicalDecisionResponse = z.infer<typeof ClinicalDecisionResponseSchema>;

// ============================================================================
// Configuration and Settings Types
// ============================================================================

export const ClinicalDecisionSupportConfigSchema = z.object({
  aiProviders: z.array(z.object({
    name: z.string(),
    enabled: z.boolean(),
    models: z.array(z.object({
      name: z.string(),
      capabilities: z.array(z.string()),
      maxTokens: z.number(),
      costPerToken: z.number()
    }))
  })),
  compliance: z.object({
    enabledFrameworks: z.array(ComplianceFrameworkSchema),
    validationLevel: z.enum(['basic', 'strict', 'comprehensive']),
    auditLogging: z.boolean().default(true),
    anonymization: z.boolean().default(true),
    lgpdSettings: LGPDComplianceSchema.partial(),
    anvisaSettings: ANVISAComplianceSchema.partial(),
    cfmSettings: CFMComplianceSchema.partial()
  }),
  features: z.object({
    clinicalAssessment: z.boolean().default(true),
    aestheticMedicine: z.boolean().default(true),
    predictiveAnalytics: z.boolean().default(true),
    realtimeCommunication: z.boolean().default(true),
    copilotIntegration: z.boolean().default(true),
    patientEducation: z.boolean().default(true),
    complianceValidation: z.boolean().default(true)
  }),
  realtime: z.object({
    enabled: z.boolean().default(true),
    aguiProtocol: z.object({
      endpoint: z.string(),
      timeout: z.number().default(30000),
      retries: z.number().default(3)
    }).optional(),
    websockets: z.object({
      enabled: z.boolean().default(true),
      endpoint: z.string()
    }).optional()
  }),
  copilotKit: z.object({
    enabled: z.boolean().default(true),
    actions: z.array(z.string()),
    uiIntegration: z.boolean().default(true),
    customActions: z.boolean().default(true)
  }).optional(),
  performance: z.object({
    cacheEnabled: z.boolean().default(true),
    cacheTTL: z.number().default(300000),
    maxConcurrentRequests: z.number().default(10),
    timeout: z.number().default(30000),
    retryAttempts: z.number().default(3)
  })
});

export type ClinicalDecisionSupportConfig = z.infer<typeof ClinicalDecisionSupportConfigSchema>;

// ============================================================================
// Export All Types
// ============================================================================

// Re-export commonly used types
export type {
  ClinicalContext,
  PatientProfile,
  ClinicalAssessmentRequest,
  ClinicalAssessmentResult,
  ClinicalFinding,
  AestheticPatientProfile,
  AestheticProcedure,
  TreatmentRecommendation,
  AestheticConsultationRequest,
  AestheticConsultationResult,
  PredictionRequest,
  PredictionResult,
  PatientOutcomePrediction,
  ComplianceValidationRequest,
  ComplianceValidationResult,
  CFMCompliance,
  ANVISACompliance,
  LGPDCompliance,
  ClinicalEvent,
  ClinicalEventResponse,
  ClinicalDecisionRequest,
  ClinicalDecisionResponse,
  ClinicalDecisionSupportConfig
};

export {
  ClinicalContextSchema,
  PatientProfileSchema,
  ClinicalAssessmentRequestSchema,
  ClinicalAssessmentResultSchema,
  ClinicalFindingSchema,
  FitzpatrickScaleSchema,
  AestheticPatientProfileSchema,
  AestheticProcedureSchema,
  TreatmentRecommendationSchema,
  AestheticConsultationRequestSchema,
  AestheticConsultationResultSchema,
  PredictionRequestSchema,
  PredictionResultSchema,
  PatientOutcomePredictionSchema,
  ComplianceValidationRequestSchema,
  ComplianceValidationResultSchema,
  CFMComplianceSchema,
  ANVISAComplianceSchema,
  LGPDComplianceSchema,
  ClinicalEventSchema,
  ClinicalEventResponseSchema,
  ClinicalDecisionRequestSchema,
  ClinicalDecisionResponseSchema,
  ClinicalDecisionSupportConfigSchema
};