// Healthcare-specific event types for clinical AI services
import { z } from 'zod';
import { AGUIEvent, AGUIEventType } from '../protocol/agui-events';

// Clinical event categories
export const ClinicalEventCategorySchema = z.enum([
  'patient_assessment',
  'diagnostic_support',
  'treatment_planning',
  'medication_management',
  'monitoring',
  'emergency_response',
  'telemedicine',
  'preventive_care',
  'chronic_disease',
  'mental_health'
]);

export type ClinicalEventCategory = z.infer<typeof ClinicalEventCategorySchema>;

// Clinical severity levels
export const ClinicalSeveritySchema = z.enum(['low', 'moderate', 'high', 'critical', 'life_threatening']);

export type ClinicalSeverity = z.infer<typeof ClinicalSeveritySchema>;

// Vital signs
export const VitalSignsSchema = z.object({
  temperature: z.object({
    value: z.number(),
    unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
    timestamp: z.date().default(() => new Date())
  }).optional(),
  bloodPressure: z.object({
    systolic: z.number(),
    diastolic: z.number(),
    unit: z.string().default('mmHg'),
    timestamp: z.date().default(() => new Date())
  }).optional(),
  heartRate: z.object({
    value: z.number(),
    unit: z.string().default('bpm'),
    timestamp: z.date().default(() => new Date())
  }).optional(),
  respiratoryRate: z.object({
    value: z.number(),
    unit: z.string().default('breaths/min'),
    timestamp: z.date().default(() => new Date())
  }).optional(),
  oxygenSaturation: z.object({
    value: z.number(),
    unit: z.string().default('%'),
    timestamp: z.date().default(() => new Date())
  }).optional(),
  bloodGlucose: z.object({
    value: z.number(),
    unit: z.enum(['mg/dL', 'mmol/L']).default('mg/dL'),
    timestamp: z.date().default(() => new Date())
  }).optional(),
  weight: z.object({
    value: z.number(),
    unit: z.enum(['kg', 'lb']).default('kg'),
    timestamp: z.date().default(() => new Date())
  }).optional(),
  height: z.object({
    value: z.number(),
    unit: z.enum(['cm', 'in']).default('cm'),
    timestamp: z.date().default(() => new Date())
  }).optional(),
  bmi: z.object({
    value: z.number(),
    category: z.enum(['underweight', 'normal', 'overweight', 'obese']),
    timestamp: z.date().default(() => new Date())
  }).optional()
});

export type VitalSigns = z.infer<typeof VitalSignsSchema>;

// Symptom assessment
export const SymptomSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  severity: ClinicalSeveritySchema.default('moderate'),
  duration: z.string(),
  onset: z.enum(['sudden', 'gradual', 'intermittent']),
  location: z.string().optional(),
  characteristics: z.array(z.string()).optional(),
  aggravatingFactors: z.array(z.string()).optional(),
  relievingFactors: z.array(z.string()).optional(),
  associatedSymptoms: z.array(z.string()).optional(),
  impactOnActivities: z.enum(['none', 'mild', 'moderate', 'severe']).default('none'),
  reportedAt: z.date().default(() => new Date())
});

export type Symptom = z.infer<typeof SymptomSchema>;

// Medical history
export const MedicalHistorySchema = z.object({
  conditions: z.array(z.object({
    condition: z.string(),
    diagnosisDate: z.date(),
    status: z.enum(['active', 'resolved', 'chronic', 'remission']),
    severity: ClinicalSeveritySchema.default('moderate'),
    treatment: z.string().optional(),
    complications: z.array(z.string()).optional()
  })),
  surgeries: z.array(z.object({
    procedure: z.string(),
    date: z.date(),
    surgeon: z.string().optional(),
    hospital: z.string().optional(),
    complications: z.array(z.string()).optional()
  })),
  allergies: z.array(z.object({
    allergen: z.string(),
    reaction: z.string(),
    severity: ClinicalSeveritySchema.default('moderate'),
    diagnosed: z.boolean().default(true),
    notes: z.string().optional()
  })),
  familyHistory: z.array(z.object({
    condition: z.string(),
    relationship: z.string(),
    ageOfOnset: z.number().optional(),
    status: z.enum(['active', 'resolved'])
  })),
  socialHistory: z.object({
    smoking: z.object({
      status: z.enum(['never', 'former', 'current']),
      packYears: z.number().optional(),
      quitDate: z.date().optional()
    }),
    alcohol: z.object({
      status: z.enum(['never', 'former', 'current']),
      drinksPerWeek: z.number().optional(),
      type: z.string().optional()
    }),
    substanceUse: z.array(z.object({
      substance: z.string(),
      frequency: z.string(),
      duration: z.string()
    })).optional(),
    occupation: z.string().optional(),
    livingSituation: z.string().optional()
  }),
  immunizations: z.array(z.object({
    vaccine: z.string(),
    date: z.date(),
    dose: z.number().optional(),
    nextDue: z.date().optional(),
    administeredBy: z.string().optional()
  }))
});

export type MedicalHistory = z.infer<typeof MedicalHistorySchema>;

// Medication information
export const MedicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  route: z.enum(['oral', 'intravenous', 'intramuscular', 'subcutaneous', 'topical', 'inhalation', 'other']),
  indication: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  prescribedBy: z.string(),
  active: z.boolean().default(true),
  prn: z.boolean().default(false),
  instructions: z.string().optional(),
  sideEffects: z.array(z.string()).optional(),
  interactions: z.array(z.string()).optional(),
  adherence: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  lastRefill: z.date().optional(),
  nextRefill: z.date().optional()
});

export type Medication = z.infer<typeof MedicationSchema>;

// Lab result
export const LabResultSchema = z.object({
  id: z.string(),
  test: z.string(),
  value: z.union([z.string(), z.number()]),
  unit: z.string(),
  referenceRange: z.string(),
  interpretation: z.enum(['normal', 'low', 'high', 'critical', 'borderline']),
  collectionDate: z.date(),
  resultDate: z.date(),
  orderedBy: z.string(),
  labFacility: z.string(),
  abnormalFlag: z.boolean().default(false),
  comments: z.string().optional()
});

export type LabResult = z.infer<typeof LabResultSchema>;

// Imaging result
export const ImagingResultSchema = z.object({
  id: z.string(),
  type: z.enum(['xray', 'ct', 'mri', 'ultrasound', 'pet', 'mammogram', 'other']),
  bodyPart: z.string(),
  date: z.date(),
  findings: z.string(),
  impression: z.string(),
  comparison: z.string().optional(),
  technique: z.string().optional(),
  radiologist: z.string(),
  facility: z.string(),
  accessionNumber: z.string(),
  imagesAvailable: z.boolean().default(false),
  criticalFindings: z.array(z.string()).optional()
});

export type ImagingResult = z.infer<typeof ImagingResultSchema>;

// Clinical event base
export const ClinicalEventSchema = AGUIEventSchema.extend({
  metadata: z.object({
    sessionId: z.string(),
    userId: z.string(),
    patientId: z.string(),
    requestId: z.string().optional(),
    correlationId: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent', 'critical']).default('medium'),
    retryCount: z.number().default(0),
    maxRetries: z.number().default(3),
    ttl: z.number().default(300000),
    tags: z.array(z.string()).default([])
  }).default({}),
  compliance: z.object({
    lgpdValidated: z.boolean().default(false),
    anvisaCompliant: z.boolean().default(false),
    cfmCompliant: z.boolean().default(false),
    piiRedacted: z.boolean().default(false),
    consentVerified: z.boolean().default(false),
    auditRequired: z.boolean().default(true),
    dataRetentionRequired: z.boolean().default(true),
    encryptionRequired: z.boolean().default(true)
  }).default({})
});

// Patient assessment event
export const PatientAssessmentEventSchema = ClinicalEventSchema.extend({
  type: z.literal('clinical.patient.assessment'),
  payload: z.object({
    assessmentId: z.string(),
    assessmentType: z.enum(['initial', 'followup', 'emergency', 'routine', 'discharge']),
    patientId: z.string(),
    providerId: z.string(),
    encounterId: z.string().optional(),
    vitalSigns: VitalSignsSchema.optional(),
    symptoms: z.array(SymptomSchema),
    medicalHistory: MedicalHistorySchema.optional(),
    currentMedications: z.array(MedicationSchema).optional(),
    allergies: z.array(z.string()).optional(),
    assessmentFocus: z.array(z.string()).optional(),
    chiefComplaint: z.string(),
    historyOfPresentIllness: z.string().optional(),
    reviewOfSystems: z.record(z.array(z.string())).optional(),
    physicalExam: z.record(z.string()).optional(),
    assessmentDate: z.date(),
    severity: ClinicalSeveritySchema.default('moderate'),
    urgency: z.enum(['routine', 'urgent', 'emergency']).default('routine'),
    additionalNotes: z.string().optional(),
    attachments: z.array(z.object({
      filename: z.string(),
      type: z.string(),
      size: z.number(),
      uploadedAt: z.date()
    })).optional()
  })
});

export type PatientAssessmentEvent = z.infer<typeof PatientAssessmentEventSchema>;

// Clinical decision support event
export const ClinicalDecisionSupportEventSchema = ClinicalEventSchema.extend({
  type: z.literal('clinical.decision.support'),
  payload: z.object({
    requestType: z.enum(['diagnosis', 'treatment', 'medication', 'testing', 'referral']),
    patientId: z.string(),
    providerId: z.string(),
    clinicalScenario: z.string(),
    patientData: z.object({
      demographics: z.record(z.unknown()).optional(),
      vitalSigns: VitalSignsSchema.optional(),
      symptoms: z.array(SymptomSchema).optional(),
      medicalHistory: MedicalHistorySchema.optional(),
      currentMedications: z.array(MedicationSchema).optional(),
      labResults: z.array(LabResultSchema).optional(),
      imagingResults: z.array(ImagingResultSchema).optional()
    }),
    decisionPoint: z.string(),
    availableOptions: z.array(z.string()),
    patientPreferences: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
    context: z.object({
      setting: z.enum(['inpatient', 'outpatient', 'emergency', 'telemedicine']),
      timeSensitive: z.boolean().default(false),
      resourceConstraints: z.array(z.string()).optional()
    }).optional(),
    providerInput: z.string().optional(),
    specialty: z.string().optional()
  })
});

export type ClinicalDecisionSupportEvent = z.infer<typeof ClinicalDecisionSupportEventSchema>;

// Treatment planning event
export const TreatmentPlanningEventSchema = ClinicalEventSchema.extend({
  type: z.literal('clinical.treatment.planning'),
  payload: z.object({
    patientId: z.string(),
    providerId: z.string(),
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
      previousTreatments: z.array(z.string()),
      allergies: z.array(z.string())
    }),
    treatmentGoals: z.array(z.string()),
    constraints: z.object({
      budget: z.number().optional(),
      timeFrame: z.string().optional(),
      location: z.string().optional(),
      insuranceCoverage: z.array(z.string()).optional(),
      patientTolerance: z.array(z.string()).optional()
    }).optional(),
    availableTreatments: z.array(z.object({
      name: z.string(),
      description: z.string(),
      efficacy: z.number().min(0).max(1),
      safety: z.number().min(0).max(1),
      evidence: z.string(),
      contraindications: z.array(z.string()),
      cost: z.object({
        estimated: z.number(),
        currency: z.string().default('BRL'),
        insuranceCoverage: z.boolean().optional()
      }).optional()
    })),
    guidelines: z.array(z.string()).optional(),
    recommendations: z.array(z.string()).optional(),
    considerations: z.array(z.string()).optional()
  })
});

export type TreatmentPlanningEvent = z.infer<typeof TreatmentPlanningEventSchema>;

// Medication management event
export const MedicationManagementEventSchema = ClinicalEventSchema.extend({
  type: z.literal('clinical.medication.management'),
  payload: z.object({
    patientId: z.string(),
    providerId: z.string(),
    action: z.enum(['prescribe', 'modify', 'discontinue', 'refill', 'reconcile']),
    medication: z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      route: z.enum(['oral', 'intravenous', 'intramuscular', 'subcutaneous', 'topical', 'inhalation', 'other']),
      indication: z.string(),
      duration: z.string().optional(),
      quantity: z.string().optional(),
      refills: z.number().optional(),
      prn: z.boolean().default(false),
      instructions: z.string().optional()
    }),
    indication: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
    reason: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    currentMedications: z.array(MedicationSchema).optional(),
    interactions: z.array(z.object({
      medication: z.string(),
      severity: z.enum(['minor', 'moderate', 'major', 'contraindicated']),
      description: z.string()
    })).optional(),
    contraindications: z.array(z.string()).optional(),
    monitoringRequired: z.array(z.string()).optional(),
    followUp: z.string().optional()
  })
});

export type MedicationManagementEvent = z.infer<typeof MedicationManagementEventSchema>;

// Patient monitoring event
export const PatientMonitoringEventSchema = ClinicalEventSchema.extend({
  type: z.literal('clinical.patient.monitoring'),
  payload: z.object({
    patientId: z.string(),
    monitoringType: z.enum(['vital_signs', 'symptoms', 'medication_adherence', 'disease_progression', 'recovery']),
    vitals: VitalSignsSchema.optional(),
    symptoms: z.array(SymptomSchema).optional(),
    medications: z.array(MedicationSchema).optional(),
    labResults: z.array(LabResultSchema).optional(),
    readings: z.array(z.object({
      parameter: z.string(),
      value: z.union([z.string(), z.number()]),
      unit: z.string(),
      timestamp: z.date(),
      normalRange: z.string().optional(),
      interpretation: z.enum(['normal', 'abnormal', 'critical']).optional()
    })),
    trends: z.array(z.object({
      parameter: z.string(),
      direction: z.enum(['improving', 'stable', 'worsening']),
      change: z.string(),
      significance: z.enum(['minimal', 'moderate', 'significant']),
      timeframe: z.string()
    })),
    alerts: z.array(z.object({
      type: z.enum(['warning', 'critical']),
      parameter: z.string(),
      value: z.union([z.string(), z.number()]),
      threshold: z.union([z.string(), z.number()]),
      message: z.string(),
      actionRequired: z.boolean().default(true),
      urgency: ClinicalSeveritySchema.default('moderate')
    })),
    assessment: z.string().optional(),
    recommendations: z.array(z.string()).optional(),
    monitoringPeriod: z.object({
      start: z.date(),
      end: z.date()
    })
  })
});

export type PatientMonitoringEvent = z.infer<typeof PatientMonitoringEventSchema>;

// Clinical documentation event
export const ClinicalDocumentationEventSchema = ClinicalEventSchema.extend({
  type: z.literal('clinical.documentation'),
  payload: z.object({
    patientId: z.string(),
    providerId: z.string(),
    documentType: z.enum(['progress_note', 'discharge_summary', 'consultation_note', 'procedure_note', 'history_and_physical']),
    encounterId: z.string().optional(),
    title: z.string(),
    content: z.string(),
    documentDate: z.date(),
    relatedTo: z.array(z.object({
      type: z.enum(['diagnosis', 'medication', 'procedure', 'test']),
      id: z.string(),
      description: z.string()
    })).optional(),
    attachments: z.array(z.object({
      filename: z.string(),
      type: z.string(),
      size: z.number(),
      uploadedAt: z.date()
    })).optional(),
    tags: z.array(z.string()).optional(),
    confidentiality: z.enum(['normal', 'restricted', 'high']).default('normal'),
    requiresReview: z.boolean().default(false),
    reviewedBy: z.string().optional(),
    reviewDate: z.date().optional()
  })
});

export type ClinicalDocumentationEvent = z.infer<typeof ClinicalDocumentationEventSchema>;

// Clinical alert event
export const ClinicalAlertEventSchema = ClinicalEventSchema.extend({
  type: z.literal('clinical.alert'),
  payload: z.object({
    alertId: z.string(),
    patientId: z.string(),
    alertType: z.enum(['critical_value', 'medication_error', 'allergy_alert', 'adverse_event', 'care_gap', 'preventive_care']),
    severity: ClinicalSeveritySchema,
    title: z.string(),
    message: z.string(),
    details: z.string().optional(),
    triggerData: z.record(z.unknown()).optional(),
    recommendedActions: z.array(z.string()),
    urgency: z.enum(['routine', 'urgent', 'emergency']).default('routine'),
    acknowledged: z.boolean().default(false),
    acknowledgedBy: z.string().optional(),
    acknowledgedAt: z.date().optional(),
    resolved: z.boolean().default(false),
    resolvedBy: z.string().optional(),
    resolvedAt: z.date().optional(),
    escalationLevel: z.number().default(0),
    maxEscalationLevel: z.number().default(3),
    notificationSent: z.array(z.object({
      method: z.enum(['email', 'sms', 'push', 'in_app']),
      recipient: z.string(),
      sentAt: z.date(),
      status: z.enum(['sent', 'delivered', 'read', 'failed'])
    })).optional()
  })
});

export type ClinicalAlertEvent = z.infer<typeof ClinicalAlertEventSchema>;

// Clinical event response types
export const ClinicalAssessmentResponseSchema = z.object({
  assessmentId: z.string(),
  patientId: z.string(),
  overallAssessment: z.string(),
  severity: ClinicalSeveritySchema,
  keyFindings: z.array(z.object({
    finding: z.string(),
    significance: z.enum(['low', 'medium', 'high']),
    evidence: z.string(),
    confidence: z.number().min(0).max(1)
  })),
  diagnoses: z.array(z.object({
    condition: z.string(),
    confidence: z.number().min(0).max(1),
    differential: z.boolean().default(false)
  })),
  recommendations: z.array(z.object({
    action: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    timeframe: z.string(),
    rationale: z.string()
  })),
  riskFactors: z.array(z.object({
    factor: z.string(),
    level: z.enum(['low', 'medium', 'high']),
    mitigation: z.string()
  })),
  followUpPlan: z.object({
    timeframe: z.string(),
    requiredTests: z.array(z.string()),
    specialistReferral: z.string().optional(),
    monitoring: z.array(z.string())
  }),
  confidence: z.number().min(0).max(1),
  requiresHumanReview: z.boolean(),
  reviewNotes: z.string().optional()
});

export type ClinicalAssessmentResponse = z.infer<typeof ClinicalAssessmentResponseSchema>;

// Clinical event interface
export interface IClinicalEventHandler {
  canHandle(eventType: AGUIEventType): boolean;
  handle(event: ClinicalEvent): Promise<ClinicalEvent | void>;
  validate(event: ClinicalEvent): Promise<boolean>;
  getEventSchema(eventType: AGUIEventType): z.ZodSchema<any>;
}

// Clinical event validator interface
export interface IClinicalEventValidator {
  validate(event: ClinicalEvent): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    score: number;
  }>;
  checkCompliance(event: ClinicalEvent): Promise<{
    lgpdCompliant: boolean;
    anvisaCompliant: boolean;
    cfmCompliant: boolean;
    issues: string[];
  }>;
}

// Clinical event processor interface
export interface IClinicalEventProcessor {
  process(event: ClinicalEvent): Promise<ClinicalEvent>;
  enrich(event: ClinicalEvent): Promise<ClinicalEvent>;
  route(event: ClinicalEvent): Promise<string[]>;
}

// All clinical event types union
export type AnyClinicalEvent = 
  | PatientAssessmentEvent
  | ClinicalDecisionSupportEvent
  | TreatmentPlanningEvent
  | MedicationManagementEvent
  | PatientMonitoringEvent
  | ClinicalDocumentationEvent
  | ClinicalAlertEvent;