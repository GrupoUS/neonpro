// Aesthetic medicine-specific event types for healthcare AI services
import { z } from 'zod';
import { AGUIEvent, AGUIEventType } from '../protocol/agui-events';
import { ClinicalSeverity } from './clinical-events';

// Aesthetic procedure categories
export const AestheticProcedureCategorySchema = z.enum([
  'facial_treatments',
  'body_contouring',
  'injectables',
  'laser_treatments',
  'skin_rejuvenation',
  'hair_restoration',
  'non_surgical_facial',
  'surgical_procedures',
  'wellness_treatments'
]);

export type AestheticProcedureCategory = z.infer<typeof AestheticProcedureCategorySchema>;

// Aesthetic consultation types
export const AestheticConsultationTypeSchema = z.enum([
  'initial_consultation',
  'followup_consultation',
  'preoperative_consultation',
  'postoperative_consultation',
  'treatment_planning',
  'outcome_assessment',
  'complication_management'
]);

export type AestheticConsultationType = z.infer<typeof AestheticConsultationTypeSchema>;

// Skin type classification (Fitzpatrick scale)
export const SkinTypeSchema = z.enum([
  'type_I',   // Very fair skin, always burns, never tans
  'type_II',  // Fair skin, burns easily, tans poorly
  'type_III', // Light skin, sometimes burns, tans gradually
  'type_IV',  // Olive skin, rarely burns, tans easily
  'type_V',   // Brown skin, very rarely burns, tans very easily
  'type_VI'   // Dark brown to black skin, never burns, deeply pigmented
]);

export type SkinType = z.infer<typeof SkinTypeSchema>;

// Skin conditions and concerns
export const SkinConditionSchema = z.enum([
  'acne',
  'rosacea',
  'hyperpigmentation',
  'melasma',
  'vitiligo',
  'eczema',
  'psoriasis',
  'scars',
  'wrinkles',
  'fine_lines',
  'loss_of_elasticity',
  'uneven_texture',
  'enlarged_pores',
  'dark_circles',
  'under_eye_bags',
  'sagging_skin',
  'excess_fat',
  'cellulite',
  'stretch_marks',
  'excess_hair',
  'hair_loss',
  'thinning_hair'
]);

export type SkinCondition = z.infer<typeof SkinConditionSchema>;

// Treatment areas
export const TreatmentAreaSchema = z.enum([
  'face',
  'forehead',
  'eyes',
  'cheeks',
  'nose',
  'mouth',
  'chin',
  'jawline',
  'neck',
  'décolletage',
  'hands',
  'arms',
  'abdomen',
  'flanks',
  'thighs',
  'buttocks',
  'legs',
  'scalp',
  'full_body'
]);

export type TreatmentArea = z.infer<typeof TreatmentAreaSchema>;

// Aesthetic procedure types
export const AestheticProcedureSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: AestheticProcedureCategorySchema,
  description: z.string(),
  treatmentAreas: z.array(TreatmentAreaSchema),
  duration: z.object({
    min: z.number(), // in minutes
    max: z.number(),
    average: z.number()
  }),
  recovery: z.object({
    downtime: z.string(), // e.g., "24-48 hours"
    socialDowntime: z.string(),
    fullRecovery: z.string(),
    restrictions: z.array(z.string())
  }),
  cost: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string().default('BRL'),
    sessionBased: z.boolean().default(false),
    sessionsRequired: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      typical: z.number().optional()
    }).optional()
  }),
  contraindications: z.array(z.string()),
  risks: z.array(z.object({
    risk: z.string(),
    frequency: z.enum(['rare', 'uncommon', 'common', 'very_common']),
    severity: ClinicalSeveritySchema,
    management: z.string()
  })),
  expectedResults: z.array(z.string()),
  longevity: z.string(), // e.g., "6-12 months"
  maintenance: z.string(),
  anvisaRequired: z.boolean().default(false),
  anvisaRegistration: z.string().optional(),
  providerQualifications: z.array(z.string()),
  technology: z.array(z.string()).optional(),
  alternatives: z.array(z.string()).optional()
});

export type AestheticProcedure = z.infer<typeof AestheticProcedureSchema>;

// Patient aesthetic profile
export const PatientAestheticProfileSchema = z.object({
  patientId: z.string(),
  skinType: SkinTypeSchema,
  primaryConcerns: z.array(SkinConditionSchema),
  secondaryConcerns: z.array(SkinConditionSchema).optional(),
  treatmentHistory: z.array(z.object({
    procedure: z.string(),
    date: z.date(),
    provider: z.string(),
    satisfaction: z.enum(['very_dissatisfied', 'dissatisfied', 'neutral', 'satisfied', 'very_satisfied']),
    complications: z.array(z.string()).optional(),
    results: z.string().optional()
  })),
  lifestyleFactors: z.object({
    sunExposure: z.enum(['minimal', 'moderate', 'significant', 'extreme']),
    smoking: z.boolean(),
    skincareRoutine: z.array(z.string()),
    diet: z.string().optional(),
    exercise: z.string().optional(),
    stressLevel: z.enum(['low', 'moderate', 'high']),
    sleepQuality: z.enum(['poor', 'fair', 'good', 'excellent'])
  }),
  medicalConditions: z.array(z.string()),
  medications: z.array(z.string()),
  allergies: z.array(z.string()),
  aestheticGoals: z.array(z.string()),
  expectations: z.enum(['realistic', 'somewhat_realistic', 'unrealistic']),
  painTolerance: z.enum(['low', 'moderate', 'high']),
  budget: z.object({
    range: z.string(),
    flexibility: z.enum(['none', 'low', 'moderate', 'high']),
    financingConsidered: z.boolean()
  }),
  timeCommitment: z.enum(['minimal', 'moderate', 'significant']),
  riskTolerance: z.enum(['low', 'moderate', 'high'])
});

export type PatientAestheticProfile = z.infer<typeof PatientAestheticProfileSchema>;

// Aesthetic consultation event
export const AestheticConsultationEventSchema = AGUIEventSchema.extend({
  type: z.literal('aesthetic.consultation'),
  payload: z.object({
    consultationId: z.string(),
    consultationType: AestheticConsultationTypeSchema,
    patientId: z.string(),
    providerId: z.string(),
    patientProfile: PatientAestheticProfileSchema,
    primaryConcerns: z.array(z.string()),
    aestheticGoals: z.array(z.string()),
    specificQuestions: z.array(z.string()).optional(),
    previousTreatments: z.array(z.string()).optional(),
    budgetRange: z.object({
      min: z.number(),
      max: z.number(),
      currency: z.string().default('BRL')
    }).optional(),
    timeframe: z.string().optional(),
    urgency: z.enum(['routine', 'moderate', 'urgent']).default('routine'),
    preferredCommunication: z.enum(['in_person', 'virtual', 'both']),
    additionalNotes: z.string().optional(),
    attachments: z.array(z.object({
      filename: z.string(),
      type: z.string(),
      size: z.number(),
      uploadedAt: z.date()
    })).optional()
  })
});

export type AestheticConsultationEvent = z.infer<typeof AestheticConsultationEventSchema>;

// Treatment planning event
export const AestheticTreatmentPlanningEventSchema = AGUIEventSchema.extend({
  type: z.literal('aesthetic.treatment.planning'),
  payload: z.object({
    planningId: z.string(),
    patientId: z.string(),
    providerId: z.string(),
    consultationId: z.string(),
    selectedProcedures: z.array(z.object({
      procedure: AestheticProcedureSchema,
      priority: z.enum(['essential', 'recommended', 'optional']),
      timing: z.string(),
      rationale: z.string()
    })),
    treatmentPhases: z.array(z.object({
      phase: z.string(),
      procedures: z.array(z.string()),
      timeframe: z.string(),
      goals: z.array(z.string()),
      estimatedCost: z.object({
        min: z.number(),
        max: z.number(),
        currency: z.string().default('BRL')
      })
    })),
    totalTreatmentPlan: z.object({
      duration: z.string(),
      totalEstimatedCost: z.object({
        min: z.number(),
        max: z.number(),
        currency: z.string().default('BRL')
      }),
      numberOfSessions: z.number(),
      expectedTimeline: z.string()
    }),
    customizations: z.array(z.object({
      procedure: z.string(),
      customization: z.string(),
      rationale: z.string()
    })).optional(),
    alternatives: z.array(z.object({
      procedure: z.string(),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
      costDifference: z.number().optional()
    })).optional(),
    riskAssessment: z.object({
      overallRisk: z.enum(['low', 'medium', 'high']),
      specificRisks: z.array(z.object({
        risk: z.string(),
        probability: z.enum(['low', 'medium', 'high']),
        severity: ClinicalSeveritySchema,
        mitigation: z.string()
      }))
    }),
    preTreatmentInstructions: z.array(z.string()),
    postTreatmentCare: z.array(z.string()),
    expectedResults: z.array(z.string()),
    realisticExpectations: z.string(),
    maintenancePlan: z.string(),
    followUpSchedule: z.array(z.object({
      timeframe: z.string(),
      purpose: z.string(),
      method: z.enum(['in_person', 'virtual'])
    }))
  })
});

export type AestheticTreatmentPlanningEvent = z.infer<typeof AestheticTreatmentPlanningEventSchema>;

// Procedure recommendation event
export const AestheticProcedureRecommendationEventSchema = AGUIEventSchema.extend({
  type: z.literal('aesthetic.procedure.recommendation'),
  payload: z.object({
    patientId: z.string(),
    providerId: z.string(),
    concerns: z.array(SkinConditionSchema),
    treatmentAreas: z.array(TreatmentAreaSchema),
    patientProfile: z.object({
      age: z.number(),
      skinType: SkinTypeSchema,
      budget: z.object({
        min: z.number(),
        max: z.number(),
        currency: z.string().default('BRL')
      }).optional(),
      downtime: z.enum(['none', 'minimal', 'moderate', 'significant']),
      riskTolerance: z.enum(['low', 'moderate', 'high']),
      previousTreatments: z.array(z.string()).optional()
    }),
    goals: z.array(z.string()),
    constraints: z.array(z.string()).optional(),
    availableProcedures: z.array(AestheticProcedureSchema),
    recommendations: z.array(z.object({
      procedure: AestheticProcedureSchema,
      suitability: z.number().min(0).max(1),
      expectedEfficacy: z.number().min(0).max(1),
      costBenefit: z.number().min(0).max(1),
      rationale: z.string(),
      confidence: z.number().min(0).max(1)
    })),
    topRecommendation: z.object({
      procedure: z.string(),
      reasoning: z.string(),
      expectedOutcome: z.string(),
      timeline: z.string(),
      estimatedCost: z.object({
        min: z.number(),
        max: z.number(),
        currency: z.string().default('BRL')
      }
    )
  }),
  alternatives: z.array(z.object({
    procedure: z.string(),
    whyConsider: z.string(),
    tradeoffs: z.string()
  })),
  contraindications: z.array(z.string()),
  lifestyleRecommendations: z.array(z.string()),
  nextSteps: z.array(z.string())
})
});

export type AestheticProcedureRecommendationEvent = z.infer<typeof AestheticProcedureRecommendationEventSchema>;

// Outcome prediction event
export const AestheticOutcomePredictionEventSchema = AGUIEventSchema.extend({
  type: z.literal('aesthetic.outcome.prediction'),
  payload: z.object({
    patientId: z.string(),
    procedureId: z.string(),
    procedure: AestheticProcedureSchema,
    patientFactors: z.object({
      age: z.number(),
      skinType: SkinTypeSchema,
      skinCondition: z.string(),
      lifestyle: z.object({
        sunExposure: z.string(),
        smoking: z.boolean(),
        skincare: z.string()
      }).optional(),
      medicalHistory: z.array(z.string()).optional(),
      genetics: z.string().optional()
    }),
    treatmentFactors: z.object({
      technique: z.string(),
      providerExperience: z.number(),
      technology: z.string().optional(),
      settings: z.record(z.unknown()).optional()
    }).optional(),
    predictionTimeframe: z.string(),
    predictedOutcomes: z.array(z.object({
      outcome: z.string(),
      probability: z.number().min(0).max(1),
      confidence: z.number().min(0).max(1),
      timeframe: z.string(),
      factors: z.array(z.string())
    })),
    riskAssessment: z.object({
      complications: z.array(z.object({
        complication: z.string(),
        probability: z.number().min(0).max(1),
        severity: ClinicalSeveritySchema,
        preventability: z.number().min(0).max(1)
      })),
      satisfactionRisk: z.number().min(0).max(1),
      needForRetreatment: z.object({
        probability: z.number().min(0).max(1),
        timeframe: z.string()
      })
    }),
    expectedResults: z.array(z.object({
      result: z.string(),
      likelihood: z.number().min(0).max(1),
      timeframe: z.string(),
      variability: z.string()
    })),
    patientSatisfaction: z.object({
      predictedScore: z.number().min(0).max(10),
      confidence: z.number().min(0).max(1)
    }),
    longevity: z.object({
      expectedDuration: z.string(),
      factorsAffectingLongevity: z.array(z.string()),
    maintenanceRecommendations: z.array(z.string())
  }),
  recommendations: z.array(z.string()),
  considerations: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
  requiresHumanReview: z.boolean()
})
});

export type AestheticOutcomePredictionEvent = z.infer<typeof AestheticOutcomePredictionEventSchema>;

// Suitability assessment event
export const AestheticSuitabilityAssessmentEventSchema = AGUIEventSchema.extend({
  type: z.literal('aesthetic.suitability.assessment'),
  payload: z.object({
    patientId: z.string(),
    procedureId: z.string(),
    procedure: AestheticProcedureSchema,
    assessmentDate: z.date(),
    patientProfile: PatientAestheticProfileSchema,
    medicalHistory: z.object({
      conditions: z.array(z.string()),
      medications: z.array(z.string()),
      allergies: z.array(z.string()),
    previousSurgeries: z.array(z.string()),
    bleedingDisorders: z.boolean(),
    immuneDisorders: z.boolean(),
    healingIssues: z.boolean()
  }),
  physicalAssessment: z.object({
    skinType: SkinTypeSchema,
    skinCondition: z.string(),
    elasticity: z.enum(['excellent', 'good', 'fair', 'poor']),
    thickness: z.enum(['thin', 'normal', 'thick']),
    scarring: z.enum(['minimal', 'moderate', 'significant']),
    laxity: z.enum(['minimal', 'moderate', 'significant'])
  }),
  psychologicalAssessment: z.object({
    expectations: z.enum(['realistic', 'somewhat_realistic', 'unrealistic']),
    motivation: z.enum(['high', 'moderate', 'low']),
    bodyImage: z.string(),
    mentalHealth: z.string().optional(),
    stability: z.enum(['stable', 'somewhat_stable', 'unstable'])
  }),
  suitabilityFactors: z.array(z.object({
    factor: z.string(),
    assessment: z.string(),
    impact: z.enum(['positive', 'neutral', 'negative']),
    weight: z.number().min(0).max(1)
  })),
  contraindications: z.array(z.object({
    condition: z.string(),
    severity: z.enum(['absolute', 'relative']),
    rationale: z.string()
  })),
  overallSuitability: z.enum(['excellent', 'good', 'fair', 'poor']),
  suitabilityScore: z.number().min(0).max(1),
  recommendations: z.array(z.object({
    recommendation: z.string(),
    priority: z.enum(['essential', 'recommended', 'consider']),
    rationale: z.string()
  })),
  alternativeProcedures: z.array(z.string()),
  preTreatmentRequirements: z.array(z.string()),
  riskFactors: z.array(z.object({
    factor: z.string(),
    level: z.enum(['low', 'medium', 'high']),
    mitigation: z.string()
  })),
  nextSteps: z.array(z.string()),
  requiresSpecialistClearance: z.boolean(),
  specialistRecommendations: z.array(z.string()).optional()
})
});

export type AestheticSuitabilityAssessmentEvent = z.infer<typeof AestheticSuitabilityAssessmentEventSchema>;

// Treatment session event
export const AestheticTreatmentSessionEventSchema = AGUIEventSchema.extend({
  type: z.literal('aesthetic.treatment.session'),
  payload: z.object({
    sessionId: z.string(),
    patientId: z.string(),
    providerId: z.string(),
    procedureId: z.string(),
    procedure: AestheticProcedureSchema,
    treatmentPlanId: z.string(),
    sessionNumber: z.number(),
    totalSessions: z.number(),
    sessionDate: z.date(),
    startTime: z.date(),
    endTime: z.date(),
    actualDuration: z.number(),
    treatmentAreas: z.array(TreatmentAreaSchema),
    productsUsed: z.array(z.object({
      product: z.string(),
      brand: z.string(),
      lotNumber: z.string(),
      quantity: z.string(),
      expiration: z.date()
    })),
    parameters: z.record(z.unknown()).optional(),
    techniquesUsed: z.array(z.string()),
    settings: z.record(z.unknown()).optional(),
    anesthesia: z.object({
      type: z.enum(['none', 'topical', 'local', 'regional']),
      agent: z.string().optional(),
      dosage: z.string().optional()
    }).optional(),
    immediateResults: z.object({
      observations: z.array(z.string()),
      measurements: z.record(z.number()).optional(),
      patientFeedback: z.string(),
      satisfaction: z.enum(['very_dissatisfied', 'dissatisfied', 'neutral', 'satisfied', 'very_satisfied'])
    }),
    complications: z.array(z.object({
      complication: z.string(),
      severity: ClinicalSeveritySchema,
    immediate: z.boolean(),
    treatment: z.string(),
    resolution: z.string().optional()
    })).optional(),
    aftercareInstructions: z.array(z.string()),
    medicationsPrescribed: z.array(z.object({
      medication: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      duration: z.string()
    })),
    followUpScheduled: z.date().optional(),
    notes: z.string(),
    photosTaken: z.boolean(),
    photoReferences: z.array(z.string()).optional(),
    anvisaCompliance: z.object({
      deviceRegistration: z.string(),
    operatorCertified: z.boolean(),
    protocolFollowed: z.boolean()
  })
})
});

export type AestheticTreatmentSessionEvent = z.infer<typeof AestheticTreatmentSessionEventSchema>;

// Aftercare event
export const AestheticAftercareEventSchema = AGUIEventSchema.extend({
  type: z.literal('aesthetic.aftercare'),
  payload: z.object({
    patientId: z.string(),
    sessionId: z.string(),
    procedureId: z.string(),
    aftercareStartDate: z.date(),
    aftercareType: z.enum(['immediate', 'short_term', 'long_term']),
    instructions: z.array(z.object({
      timeframe: z.string(),
      category: z.enum(['cleaning', 'medication', 'activity', 'monitoring', 'followup']),
      instruction: z.string(),
      importance: z.enum(['critical', 'important', 'recommended']),
      rationale: z.string()
    })),
    medications: z.array(z.object({
      name: z.string(),
      purpose: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      duration: z.string(),
      specialInstructions: z.string()
    })),
    activityRestrictions: z.array(z.object({
      activity: z.string(),
      restriction: z.string(),
      duration: z.string(),
      rationale: z.string()
    })),
    warningSigns: z.array(z.object({
      sign: z.string(),
    severity: ClinicalSeveritySchema,
    action: z.enum(['monitor', 'contact_provider', 'seek_immediate_care']),
    timeframe: z.string()
  })),
    followUpAppointments: z.array(z.object({
      date: z.date(),
      purpose: z.string(),
      method: z.enum(['in_person', 'virtual', 'phone']),
      preparation: z.array(z.string())
    })),
    skincareRegimen: z.array(z.object({
      product: z.string(),
      frequency: z.string(),
      duration: z.string(),
      purpose: z.string(),
    application: z.string()
    })),
    recoveryTimeline: z.array(z.object({
      day: z.number(),
    expectedState: z.string(),
    normalSymptoms: z.array(z.string()),
    concernSymptoms: z.array(z.string())
    })),
    contactInformation: z.object({
      emergencyContact: z.string(),
      officeHours: z.string(),
    afterHoursContact: z.string()
    }),
    patientCompliance: z.object({
    instructionsUnderstood: z.boolean(),
    concerns: z.array(z.string()),
    questions: z.array(z.string())
  }).optional()
})
});

export type AestheticAftercareEvent = z.infer<typeof AestheticAftercareEventSchema>;

// Aesthetic event response types
export const AestheticConsultationResponseSchema = z.object({
  consultationId: z.string(),
  patientId: z.string(),
  assessment: z.object({
    concernsAnalysis: z.array(z.object({
      concern: z.string(),
      severity: z.enum(['mild', 'moderate', 'severe']),
      treatability: z.number().min(0).max(1),
      recommendedApproach: z.string()
    })),
    suitabilityAssessment: z.object({
      overallSuitability: z.enum(['excellent', 'good', 'fair', 'poor']),
      score: z.number().min(0).max(1),
      factors: z.array(z.object({
        factor: z.string(),
        assessment: z.string(),
        impact: z.enum(['positive', 'neutral', 'negative'])
      }))
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
    specificRisks: z.array(z.object({
      risk: z.string(),
      probability: z.enum(['low', 'medium', 'high']),
      severity: ClinicalSeveritySchema,
      mitigation: z.string()
    })),
    recoveryConsiderations: z.array(z.string()),
    alternativeOptions: z.array(z.string())
  }),
  nextSteps: z.array(z.object({
    step: z.string(),
    timeframe: z.string(),
    preparation: z.string()
  })),
  confidence: z.number().min(0).max(1),
  requiresFollowUp: z.boolean(),
  followUpTimeline: z.string().optional()
});

export type AestheticConsultationResponse = z.infer<typeof AestheticConsultationResponseSchema>;

// Aesthetic event interface
export interface IAestheticEventHandler {
  canHandle(eventType: AGUIEventType): boolean;
  handle(event: AGUIEvent): Promise<AGUIEvent | void>;
  validate(event: AGUIEvent): Promise<boolean>;
  getEventSchema(eventType: AGUIEventType): z.ZodSchema<any>;
}

// Aesthetic event validator interface
export interface IAestheticEventValidator {
  validate(event: AGUIEvent): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    score: number;
  }>;
  checkANVISACompliance(event: AGUIEvent): Promise<{
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  }>;
}

// Aesthetic event processor interface
export interface IAestheticEventProcessor {
  process(event: AGUIEvent): Promise<AGUIEvent>;
  enrich(event: AGUIEvent): Promise<AGUIEvent>;
  route(event: AGUIEvent): Promise<string[]>;
}

// All aesthetic event types union
export type AnyAestheticEvent = 
  | AestheticConsultationEvent
  | AestheticTreatmentPlanningEvent
  | AestheticProcedureRecommendationEvent
  | AestheticOutcomePredictionEvent
  | AestheticSuitabilityAssessmentEvent
  | AestheticTreatmentSessionEvent
  | AestheticAftercareEvent;