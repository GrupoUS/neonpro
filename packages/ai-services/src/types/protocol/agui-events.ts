// AG-UI Protocol event types for healthcare AI services
import { z } from 'zod';

// AG-UI Event types enum
export const AGUIEventTypeSchema = z.enum([
  // Patient-related events
  'patient.inquiry',
  'patient.data.request',
  'patient.data.response',
  'patient.consent.validation',
  'patient.consent.granted',
  'patient.consent.revoked',
  'patient.profile.update',
  
  // Appointment events
  'appointment.scheduled',
  'appointment.modified',
  'appointment.cancelled',
  'appointment.confirmed',
  'appointment.reminder',
  'appointment.checkin',
  'appointment.checkout',
  
  // Clinical support events
  'clinical.decision.request',
  'clinical.decision.response',
  'treatment.recommendation',
  'diagnostic.support',
  'risk.assessment',
  'patient.assessment',
  'clinical.guidance',
  
  // Aesthetic events
  'aesthetic.consultation',
  'aesthetic.treatment.planning',
  'aesthetic.procedure.recommendation',
  'aesthetic.outcome.prediction',
  'aesthetic.aftercare',
  'aesthetic.suitability.assessment',
  
  // Communication events
  'message.sent',
  'message.received',
  'message.read',
  'message.delivered',
  'notification.pushed',
  'notification.read',
  
  // Compliance events
  'compliance.validation',
  'compliance.violation',
  'audit.trail.entry',
  'consent.update',
  'data.access.request',
  'data.access.granted',
  'data.access.denied',
  
  // System events
  'system.ready',
  'system.error',
  'system.maintenance',
  'user.connected',
  'user.disconnected',
  'session.started',
  'session.ended',
  'session.extended',
  
  // AI/ML events
  'ai.insight.generated',
  'ai.prediction.made',
  'ai.model.loaded',
  'ai.model.updated',
  'ai.training.started',
  'ai.training.completed',
  'ai.training.failed'
]);

export type AGUIEventType = z.infer<typeof AGUIEventTypeSchema>;

// Event priority levels
export const EventPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent', 'critical']);

export type EventPriority = z.infer<typeof EventPrioritySchema>;

// AG-UI Event base structure
export const AGUIEventSchema = z.object({
  id: z.string(),
  type: AGUIEventTypeSchema,
  timestamp: z.date(),
  source: z.string(),
  version: z.string().default('1.0'),
  
  // Core payload
  payload: z.record(z.unknown()).optional(),
  
  // Metadata
  metadata: z.object({
    sessionId: z.string(),
    userId: z.string(),
    patientId: z.string().optional(),
    requestId: z.string().optional(),
    correlationId: z.string().optional(),
    priority: EventPrioritySchema.default('medium'),
    retryCount: z.number().default(0),
    maxRetries: z.number().default(3),
    ttl: z.number().default(300000), // 5 minutes in milliseconds
    tags: z.array(z.string()).default([])
  }).default({}),
  
  // Compliance metadata
  compliance: z.object({
    lgpdValidated: z.boolean().default(false),
    anvisaCompliant: z.boolean().default(false),
    cfmCompliant: z.boolean().default(false),
    piiRedacted: z.boolean().default(false),
    consentVerified: z.boolean().default(false),
    auditRequired: z.boolean().default(true),
    dataRetentionRequired: z.boolean().default(true),
    encryptionRequired: z.boolean().default(true)
  }).default({}),
  
  // Routing information
  routing: z.object({
    to: z.string().optional(),
    from: z.string(),
    channel: z.string().default('default'),
    broadcast: z.boolean().default(false)
  }).default({}),
  
  // Performance tracking
  performance: z.object({
    startTime: z.date().optional(),
    endTime: z.date().optional(),
    processingTime: z.number().optional(),
    latency: z.number().optional()
  }).optional()
});

export type AGUIEvent<T = any> = z.infer<typeof AGUIEventSchema> & {
  payload?: T;
};

// Patient inquiry event
export const PatientInquiryEventSchema = AGUIEventSchema.extend({
  type: z.literal('patient.inquiry'),
  payload: z.object({
    inquiryType: z.enum(['general', 'medical', 'administrative', 'billing']),
    subject: z.string(),
    message: z.string(),
    urgency: z.enum(['low', 'medium', 'high', 'emergency']),
    category: z.enum(['symptoms', 'appointment', 'medication', 'billing', 'records', 'other']),
    patientContext: z.object({
      age: z.number().optional(),
      gender: z.string().optional(),
      hasActiveTreatment: z.boolean().default(false),
      lastVisit: z.date().optional(),
      preferredLanguage: z.string().default('pt-BR')
    }).optional(),
    attachments: z.array(z.object({
      filename: z.string(),
      type: z.string(),
      size: z.number(),
      uploadedAt: z.date()
    })).optional()
  })
});

export type PatientInquiryEvent = z.infer<typeof PatientInquiryEventSchema>;

// Patient data request event
export const PatientDataRequestEventSchema = AGUIEventSchema.extend({
  type: z.literal('patient.data.request'),
  payload: z.object({
    patientId: z.string(),
    dataType: z.enum(['demographics', 'medical_history', 'medications', 'allergies', 'lab_results', 'imaging', 'procedures']),
    dateRange: z.object({
      start: z.date().optional(),
      end: z.date().optional()
    }).optional(),
    purpose: z.string(),
    legalBasis: z.enum(['consent', 'treatment', 'public_health', 'vital_interest', 'legal_obligation']),
    requester: z.object({
      userId: z.string(),
      role: z.string(),
      department: z.string(),
      reason: z.string()
    }),
    redactionLevel: z.enum(['none', 'basic', 'strict', 'hipaa']).default('strict')
  })
});

export type PatientDataRequestEvent = z.infer<typeof PatientDataRequestEventSchema>;

// Patient data response event
export const PatientDataResponseEventSchema = AGUIEventSchema.extend({
  type: z.literal('patient.data.response'),
  payload: z.object({
    patientId: z.string(),
    dataType: z.enum(['demographics', 'medical_history', 'medications', 'allergies', 'lab_results', 'imaging', 'procedures']),
    data: z.record(z.unknown()),
    redactionSummary: z.object({
      fieldsRedacted: z.array(z.string()),
      piiTypesDetected: z.array(z.string()),
      redactionLevel: z.string()
    }),
    accessGranted: z.boolean(),
    consentVerified: z.boolean(),
    retrievalTime: z.number(),
    dataSize: z.number()
  })
});

export type PatientDataResponseEvent = z.infer<typeof PatientDataResponseEventSchema>;

// Appointment scheduled event
export const AppointmentScheduledEventSchema = AGUIEventSchema.extend({
  type: z.literal('appointment.scheduled'),
  payload: z.object({
    appointmentId: z.string(),
    patientId: z.string(),
    providerId: z.string(),
    serviceType: z.enum(['consultation', 'procedure', 'followup', 'emergency', 'telemedicine']),
    startTime: z.date(),
    endTime: z.date(),
    location: z.object({
      type: z.enum(['in_person', 'telemedicine']),
      address: z.string().optional(),
      room: z.string().optional(),
      virtualRoom: z.string().optional()
    }),
    status: z.enum(['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show']),
    reason: z.string(),
    notes: z.string().optional(),
    reminders: z.array(z.object({
      type: z.enum(['email', 'sms', 'push']),
      time: z.date(),
      sent: z.boolean()
    })),
    cost: z.object({
      estimated: z.number(),
      currency: z.string().default('BRL'),
      insuranceCoverage: z.boolean().optional(),
      patientResponsibility: z.number().optional()
    }).optional()
  })
});

export type AppointmentScheduledEvent = z.infer<typeof AppointmentScheduledEventSchema>;

// Clinical decision request event
export const ClinicalDecisionRequestEventSchema = AGUIEventSchema.extend({
  type: z.literal('clinical.decision.request'),
  payload: z.object({
    patientId: z.string(),
    decisionType: z.enum(['diagnosis', 'treatment', 'medication', 'referral', 'testing']),
    clinicalContext: z.object({
      symptoms: z.array(z.string()),
      vitalSigns: z.record(z.number()),
      medicalHistory: z.array(z.string()),
      currentMedications: z.array(z.string()),
      allergies: z.array(z.string()),
      recentTests: z.array(z.string())
    }),
    decisionPoint: z.string(),
    availableOptions: z.array(z.string()),
    patientPreferences: z.array(z.string()),
    constraints: z.array(z.string()),
    urgency: z.enum(['routine', 'urgent', 'emergency']),
    providerInput: z.string().optional()
  })
});

export type ClinicalDecisionRequestEvent = z.infer<typeof ClinicalDecisionRequestEventSchema>;

// Clinical decision response event
export const ClinicalDecisionResponseEventSchema = AGUIEventSchema.extend({
  type: z.literal('clinical.decision.response'),
  payload: z.object({
    patientId: z.string(),
    decisionType: z.enum(['diagnosis', 'treatment', 'medication', 'referral', 'testing']),
    recommendation: z.string(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    evidence: z.array(z.string()),
    alternatives: z.array(z.object({
      option: z.string(),
      rationale: z.string(),
      pros: z.array(z.string()),
      cons: z.array(z.string())
    })),
    riskAssessment: z.object({
      overallRisk: z.enum(['low', 'medium', 'high']),
      specificRisks: z.array(z.string()),
      mitigations: z.array(z.string())
    }),
    nextSteps: z.array(z.object({
      step: z.string(),
      timeframe: z.string(),
      responsible: z.string()
    })),
    references: z.array(z.string()),
    modelUsed: z.string(),
    processingTime: z.number()
  })
});

export type ClinicalDecisionResponseEvent = z.infer<typeof ClinicalDecisionResponseEventSchema>;

// Aesthetic consultation event
export const AestheticConsultationEventSchema = AGUIEventSchema.extend({
  type: z.literal('aesthetic.consultation'),
  payload: z.object({
    consultationId: z.string(),
    patientId: z.string(),
    providerId: z.string(),
    consultationType: z.enum(['initial', 'followup', 'preoperative', 'postoperative']),
    concerns: z.array(z.string()),
    aestheticGoals: z.array(z.string()),
    patientHistory: z.object({
      previousTreatments: z.array(z.string()),
      skinConditions: z.array(z.string()),
      medications: z.array(z.string()),
      allergies: z.array(z.string()),
      lifestyle: z.object({
        smoking: z.boolean(),
        sunExposure: z.string(),
        skincare: z.array(z.string())
      })
    }),
    focusAreas: z.array(z.string()),
    budgetRange: z.object({
      min: z.number(),
      max: z.number(),
      currency: z.string().default('BRL')
    }).optional(),
    timeframe: z.string().optional(),
    additionalNotes: z.string().optional()
  })
});

export type AestheticConsultationEvent = z.infer<typeof AestheticConsultationEventSchema>;

// Treatment recommendation event
export const TreatmentRecommendationEventSchema = AGUIEventSchema.extend({
  type: z.literal('treatment.recommendation'),
  payload: z.object({
    patientId: z.string(),
    condition: z.string(),
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
    confidence: z.number().min(0).max(1),
    references: z.array(z.string())
  })
});

export type TreatmentRecommendationEvent = z.infer<typeof TreatmentRecommendationEventSchema>;

// Compliance validation event
export const ComplianceValidationEventSchema = AGUIEventSchema.extend({
  type: z.literal('compliance.validation'),
  payload: z.object({
    validationId: z.string(),
    dataType: z.enum(['patient_data', 'clinical_data', 'aesthetic_data', 'administrative_data']),
    dataContent: z.string(),
    framework: z.enum(['lgpd', 'anvisa', 'cfm', 'general']),
    validationLevel: z.enum(['basic', 'strict', 'comprehensive']),
    result: z.object({
      valid: z.boolean(),
      score: z.number().min(0).max(1),
      violations: z.array(z.object({
        rule: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        description: z.string(),
        remediation: z.string()
      })),
      recommendations: z.array(z.string())
    }),
    piiDetected: z.array(z.object({
      type: z.string(),
      value: z.string(),
      sensitivity: z.enum(['low', 'medium', 'high', 'critical']),
      redacted: z.boolean()
    })),
    redactedContent: z.string(),
    processingTime: z.number()
  })
});

export type ComplianceValidationEvent = z.infer<typeof ComplianceValidationEventSchema>;

// Audit trail entry event
export const AuditTrailEntryEventSchema = AGUIEventSchema.extend({
  type: z.literal('audit.trail.entry'),
  payload: z.object({
    auditId: z.string(),
    userId: z.string(),
    action: z.string(),
    resource: z.string(),
    resourceType: z.string(),
    patientId: z.string().optional(),
    details: z.record(z.unknown()).optional(),
    complianceFramework: z.enum(['lgpd', 'anvisa', 'cfm', 'general']),
    result: z.enum(['success', 'failure', 'error', 'blocked']),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
    automated: z.boolean()
  })
});

export type AuditTrailEntryEvent = z.infer<typeof AuditTrailEntryEventSchema>;

// System ready event
export const SystemReadyEventSchema = AGUIEventSchema.extend({
  type: z.literal('system.ready'),
  payload: z.object({
    services: z.array(z.object({
      name: z.string(),
      status: z.enum(['ready', 'degraded', 'error']),
      version: z.string(),
      startupTime: z.number()
    })),
    configuration: z.object({
      environment: z.string(),
      features: z.array(z.string()),
      limits: z.record(z.number())
    }),
    uptime: z.number(),
    readyAt: z.date()
  })
});

export type SystemReadyEvent = z.infer<typeof SystemReadyEventSchema>;

// Event handler interface
export interface AGUIEventHandler {
  canHandle(eventType: AGUIEventType): boolean;
  handle(event: AGUIEvent): Promise<AGUIEvent | void>;
  priority?: number;
}

// Event subscription
export const EventSubscriptionSchema = z.object({
  id: z.string(),
  eventType: AGUIEventTypeSchema,
  handler: z.custom<AGUIEventHandler>(),
  filter: z.record(z.unknown()).optional(),
  once: z.boolean().default(false),
  active: z.boolean().default(true),
  createdAt: z.date(),
  lastTriggered: z.date().optional()
});

export type EventSubscription = z.infer<typeof EventSubscriptionSchema>;

// Event bus configuration
export const EventBusConfigSchema = z.object({
  maxSubscribers: z.number().default(1000),
  maxEventSize: z.number().default(1024 * 1024), // 1MB
  maxRetries: z.number().default(3),
  retryDelay: z.number().default(1000),
  enablePersistence: z.boolean().default(true),
  persistenceInterval: z.number().default(5000),
  enableMetrics: z.boolean().default(true),
  errorHandler: z.function().optional()
});

export type EventBusConfig = z.infer<typeof EventBusConfigSchema>;

// Event processing metrics
export const EventMetricsSchema = z.object({
  totalEvents: z.number(),
  successfulEvents: z.number(),
  failedEvents: z.number(),
  averageProcessingTime: z.number(),
  eventsByType: z.record(z.number()),
  retryCount: z.number(),
  subscriptionCount: z.number(),
  errorRate: z.number(),
  lastReset: z.date()
});

export type EventMetrics = z.infer<typeof EventMetricsSchema>;

// Event validation result
export const EventValidationResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  score: z.number().min(0).max(1)
});

export type EventValidationResult = z.infer<typeof EventValidationResultSchema>;

// Event filtering criteria
export const EventFilterCriteriaSchema = z.object({
  eventType: AGUIEventTypeSchema.optional(),
  source: z.string().optional(),
  userId: z.string().optional(),
  patientId: z.string().optional(),
  sessionId: z.string().optional(),
  priority: EventPrioritySchema.optional(),
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }).optional(),
  tags: z.array(z.string()).optional(),
  compliance: z.object({
    lgpdValidated: z.boolean().optional(),
    anvisaCompliant: z.boolean().optional(),
    cfmCompliant: z.boolean().optional()
  }).optional()
});

export type EventFilterCriteria = z.infer<typeof EventFilterCriteriaSchema>;

// Event batch processing
export const EventBatchSchema = z.object({
  id: z.string(),
  events: z.array(AGUIEventSchema),
  processed: z.array(z.string()).default([]),
  failed: z.array(z.object({
    eventId: z.string(),
    error: z.string(),
    timestamp: z.date()
  })).default([]),
  createdAt: z.date(),
  processedAt: z.date().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed'])
});

export type EventBatch = z.infer<typeof EventBatchSchema>;