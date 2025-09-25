// AG-UI Protocol response types for healthcare AI services
import { z } from 'zod';
import { AGUIEvent, AGUIEventType } from './agui-events';

// AG-UI Response types enum
export const AGUIResponseTypeSchema = z.enum([
  'success',
  'error',
  'validation_error',
  'compliance_error',
  'authorization_error',
  'rate_limit_error',
  'timeout_error',
  'partial_success',
  'processing',
  'queued',
  'cancelled'
]);

export type AGUIResponseType = z.infer<typeof AGUIResponseTypeSchema>;

// Response status codes
export const ResponseStatusCodeSchema = z.enum([
  // Success codes (2xx)
  '200', '201', '202', '204',
  // Client error codes (4xx)
  '400', '401', '403', '404', '422', '429',
  // Server error codes (5xx)
  '500', '502', '503', '504'
]);

export type ResponseStatusCode = z.infer<typeof ResponseStatusCodeSchema>;

// Error details
export const ErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
  value: z.unknown().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  help: z.string().optional(),
  suggestions: z.array(z.string()).default([])
});

export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;

// Performance metrics
export const PerformanceMetricsSchema = z.object({
  startTime: z.date(),
  endTime: z.date().optional(),
  processingTime: z.number().optional(),
  totalTime: z.number(),
  networkLatency: z.number().optional(),
  cpuTime: z.number().optional(),
  memoryUsage: z.object({
    used: z.number(),
    peak: z.number(),
    limit: z.number()
  }).optional(),
  databaseQueries: z.number().optional(),
  cacheHits: z.number().optional(),
  cacheMisses: z.number().optional()
});

export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;

// Compliance metadata for responses
export const ResponseComplianceMetadataSchema = z.object({
  lgpdValidated: z.boolean().default(false),
  anvisaCompliant: z.boolean().default(false),
  cfmCompliant: z.boolean().default(false),
  piiRedacted: z.boolean().default(false),
  consentVerified: z.boolean().default(false),
  auditRequired: z.boolean().default(true),
  dataRetentionRequired: z.boolean().default(true),
  encryptionRequired: z.boolean().default(true),
  validationTimestamp: z.date().optional(),
  validatorId: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('low')
});

export type ResponseComplianceMetadata = z.infer<typeof ResponseComplianceMetadataSchema>;

// Response metadata
export const ResponseMetadataSchema = z.object({
  requestId: z.string(),
  sessionId: z.string(),
  userId: z.string(),
  timestamp: z.date(),
  version: z.string().default('1.0'),
  processingTime: z.number(),
  priority: z.enum(['low', 'medium', 'high', 'urgent', 'critical']).default('medium'),
  tags: z.array(z.string()).default([]),
  routing: z.object({
    from: z.string(),
    to: z.string().optional(),
    channel: z.string().default('default')
  }).default({}),
  retryCount: z.number().default(0),
  cacheStatus: z.enum(['hit', 'miss', 'stale', 'none']).default('none'),
  compression: z.object({
    enabled: z.boolean().default(false),
    algorithm: z.string().optional(),
    ratio: z.number().optional()
  }).optional()
});

export type ResponseMetadata = z.infer<typeof ResponseMetadataSchema>;

// Base AG-UI Response structure
export const AGUIResponseSchema = z.object({
  id: z.string(),
  eventId: z.string().optional(),
  type: AGUIResponseTypeSchema,
  statusCode: ResponseStatusCodeSchema.default('200'),
  timestamp: z.date(),
  metadata: ResponseMetadataSchema,
  compliance: ResponseComplianceMetadataSchema.default({}),
  performance: PerformanceMetricsSchema.optional(),
  
  // Response payload
  payload: z.record(z.unknown()).optional(),
  
  // Error information
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(ErrorDetailSchema).default([]),
    stack: z.string().optional(),
    context: z.record(z.unknown()).optional()
  }).optional(),
  
  // Pagination information
  pagination: z.object({
    page: z.number().optional(),
    pageSize: z.number().optional(),
    total: z.number().optional(),
    hasNext: z.boolean().optional(),
    hasPrev: z.boolean().optional()
  }).optional(),
  
  // Links and references
  links: z.array(z.object({
    rel: z.string(),
    href: z.string(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
    title: z.string().optional()
  })).optional(),
  
  // Warnings and recommendations
  warnings: z.array(z.object({
    code: z.string(),
    message: z.string(),
    severity: z.enum(['low', 'medium', 'high']).default('low'),
    suggestions: z.array(z.string()).default([])
  })).optional()
});

export type AGUIResponse<T = any> = z.infer<typeof AGUIResponseSchema> & {
  payload?: T;
};

// Success response
export const SuccessResponseSchema = AGUIResponseSchema.extend({
  type: z.literal('success'),
  statusCode: z.enum(['200', '201', '204']),
  payload: z.record(z.unknown()),
  error: z.undefined().optional()
});

export type SuccessResponse<T = any> = z.infer<typeof SuccessResponseSchema> & {
  payload?: T;
};

// Error response
export const ErrorResponseSchema = AGUIResponseSchema.extend({
  type: z.enum(['error', 'validation_error', 'compliance_error', 'authorization_error', 'rate_limit_error', 'timeout_error']),
  statusCode: z.enum(['400', '401', '403', '404', '422', '429', '500', '502', '503', '504']),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(ErrorDetailSchema).default([]),
    stack: z.string().optional(),
    context: z.record(z.unknown()).optional()
  })
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Patient inquiry response
export const PatientInquiryResponseSchema = SuccessResponseSchema.extend({
  eventId: z.string(),
  payload: z.object({
    inquiryId: z.string(),
    status: z.enum(['received', 'processing', 'responded', 'escalated', 'closed']),
    response: z.string(),
    responseType: z.enum(['automated', 'manual', 'ai_assisted']),
    urgency: z.enum(['low', 'medium', 'high', 'emergency']),
    category: z.enum(['symptoms', 'appointment', 'medication', 'billing', 'records', 'other']),
    assignedTo: z.string().optional(),
    estimatedResponseTime: z.string().optional(),
    followUpRequired: z.boolean(),
    followUpActions: z.array(z.string()),
    aiConfidence: z.number().min(0).max(1).optional(),
    relatedResources: z.array(z.object({
      type: z.string(),
      id: z.string(),
      title: z.string(),
      url: z.string().optional()
    })).optional()
  })
});

export type PatientInquiryResponse = z.infer<typeof PatientInquiryResponseSchema>;

// Patient data response
export const PatientDataResponseSchema = SuccessResponseSchema.extend({
  eventId: z.string(),
  payload: z.object({
    patientId: z.string(),
    dataType: z.enum(['demographics', 'medical_history', 'medications', 'allergies', 'lab_results', 'imaging', 'procedures']),
    data: z.record(z.unknown()),
    redactionSummary: z.object({
      fieldsRedacted: z.array(z.string()),
      piiTypesDetected: z.array(z.string()),
      redactionLevel: z.string(),
      originalSize: z.number(),
      redactedSize: z.number()
    }),
    accessGranted: z.boolean(),
    consentVerified: z.boolean(),
    retrievalTime: z.number(),
    dataSource: z.string(),
    lastUpdated: z.date(),
    dataQuality: z.object({
      completeness: z.number().min(0).max(1),
      accuracy: z.number().min(0).max(1),
      timeliness: z.number().min(0).max(1)
    })
  })
});

export type PatientDataResponse = z.infer<typeof PatientDataResponseSchema>;

// Appointment response
export const AppointmentResponseSchema = SuccessResponseSchema.extend({
  eventId: z.string(),
  payload: z.object({
    appointmentId: z.string(),
    status: z.enum(['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show']),
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
    confirmationStatus: z.enum(['pending', 'confirmed', 'cancelled']),
    reminders: z.array(z.object({
      type: z.enum(['email', 'sms', 'push']),
      time: z.date(),
      sent: z.boolean(),
      status: z.enum(['scheduled', 'sent', 'delivered', 'read'])
    })),
    preparationRequired: z.array(z.string()),
    documents: z.array(z.object({
      type: z.string(),
      name: z.string(),
      url: z.string(),
      required: z.boolean()
    })),
    cost: z.object({
      estimated: z.number(),
      currency: z.string().default('BRL'),
      insuranceCoverage: z.boolean(),
      patientResponsibility: z.number(),
      paymentRequired: z.boolean(),
      paymentMethods: z.array(z.string())
    }).optional()
  })
});

export type AppointmentResponse = z.infer<typeof AppointmentResponseSchema>;

// Clinical decision response
export const ClinicalDecisionResponseSchema = SuccessResponseSchema.extend({
  eventId: z.string(),
  payload: z.object({
    patientId: z.string(),
    decisionType: z.enum(['diagnosis', 'treatment', 'medication', 'referral', 'testing']),
    recommendation: z.string(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    evidence: z.array(z.object({
      type: z.string(),
      title: z.string(),
      url: z.string().optional(),
      relevance: z.enum(['high', 'medium', 'low'])
    })),
    alternatives: z.array(z.object({
      option: z.string(),
      rationale: z.string(),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
      confidence: z.number().min(0).max(1)
    })),
    riskAssessment: z.object({
      overallRisk: z.enum(['low', 'medium', 'high']),
      specificRisks: z.array(z.object({
        risk: z.string(),
        probability: z.enum(['low', 'medium', 'high']),
        impact: z.enum(['low', 'medium', 'high']),
        mitigation: z.string()
      })),
      confidence: z.number().min(0).max(1)
    }),
    nextSteps: z.array(z.object({
      step: z.string(),
      timeframe: z.string(),
      responsible: z.string(),
      priority: z.enum(['low', 'medium', 'high']),
      dependencies: z.array(z.string()).optional()
    })),
    monitoring: z.object({
      parameters: z.array(z.string()),
      frequency: z.string(),
      duration: z.string(),
      alertThresholds: z.array(z.object({
        parameter: z.string(),
        threshold: z.number(),
        action: z.string()
      }))
    }).optional(),
    contraindications: z.array(z.string()),
    drugInteractions: z.array(z.object({
      drug1: z.string(),
      drug2: z.string(),
      severity: z.enum(['minor', 'moderate', 'major', 'contraindicated']),
      mechanism: z.string(),
      management: z.string()
    })).optional(),
    references: z.array(z.string()),
    modelUsed: z.string(),
    processingTime: z.number(),
    requiresHumanReview: z.boolean(),
    reviewNotes: z.string().optional()
  })
});

export type ClinicalDecisionResponse = z.infer<typeof ClinicalDecisionResponseSchema>;

// Aesthetic consultation response
export const AestheticConsultationResponseSchema = SuccessResponseSchema.extend({
  eventId: z.string(),
  payload: z.object({
    consultationId: z.string(),
    patientId: z.string(),
    consultationType: z.enum(['initial', 'followup', 'preoperative', 'postoperative']),
    assessment: z.object({
      concernsAnalysis: z.array(z.object({
        concern: z.string(),
        severity: z.enum(['mild', 'moderate', 'severe']),
        treatability: z.number().min(0).max(1),
        recommendedApproach: z.string(),
        timeframe: z.string(),
        confidence: z.number().min(0).max(1)
      })),
      suitabilityAssessment: z.object({
        overallSuitability: z.enum(['excellent', 'good', 'fair', 'poor']),
        score: z.number().min(0).max(1),
        factors: z.array(z.object({
          factor: z.string(),
          assessment: z.string(),
          impact: z.enum(['positive', 'neutral', 'negative']),
          weight: z.number().min(0).max(1)
        }))
      }),
      treatmentAreas: z.array(z.object({
        area: z.string(),
        recommendedTreatments: z.array(z.string()),
        expectedImprovement: z.string(),
        priority: z.enum(['low', 'medium', 'high']),
        confidence: z.number().min(0).max(1)
      }))
    }),
    recommendations: z.array(z.object({
      procedure: z.string(),
      description: z.string(),
      priority: z.enum(['immediate', 'short_term', 'long_term']),
      estimatedCost: z.object({
        min: z.number(),
        max: z.number(),
        currency: z.string().default('BRL'),
        paymentOptions: z.array(z.string())
      }),
      timeline: z.string(),
      expectedResults: z.array(z.string()),
      confidence: z.number().min(0).max(1),
      providerQualifications: z.array(z.string()).optional()
    })),
    treatmentPlan: z.object({
      phases: z.array(z.object({
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
      totalDuration: z.string(),
      estimatedTotalCost: z.object({
        min: z.number(),
        max: z.number(),
        currency: z.string().default('BRL')
      }),
      coordinationRequired: z.boolean()
    }),
    risksAndConsiderations: z.object({
      generalRisks: z.array(z.string()),
      specificRisks: z.array(z.object({
        risk: z.string(),
        probability: z.enum(['low', 'medium', 'high']),
        severity: z.enum(['mild', 'moderate', 'severe']),
        mitigation: z.string()
      })),
      recoveryConsiderations: z.array(z.string()),
      alternativeOptions: z.array(z.string())
    }),
    nextSteps: z.array(z.object({
      step: z.string(),
      timeframe: z.string(),
      preparation: z.string(),
      responsible: z.string()
    })),
    confidence: z.number().min(0).max(1),
    requiresFollowUp: z.boolean(),
    followUpTimeline: z.string().optional()
  })
});

export type AestheticConsultationResponse = z.infer<typeof AestheticConsultationResponseSchema>;

// Compliance validation response
export const ComplianceValidationResponseSchema = SuccessResponseSchema.extend({
  eventId: z.string(),
  payload: z.object({
    validationId: z.string(),
    dataType: z.enum(['patient_data', 'clinical_data', 'aesthetic_data', 'administrative_data']),
    framework: z.enum(['lgpd', 'anvisa', 'cfm', 'general']),
    overallValid: z.boolean(),
    overallScore: z.number().min(0).max(1),
    frameworkResults: z.array(z.object({
      framework: z.enum(['lgpd', 'anvisa', 'cfm', 'general']),
      compliant: z.boolean(),
      score: z.number().min(0).max(1),
      violations: z.array(z.object({
        rule: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        description: z.string(),
        remediation: z.string(),
        priority: z.enum(['low', 'medium', 'high', 'urgent'])
      })),
      recommendations: z.array(z.string())
    })),
    piiAnalysis: z.object({
      detectedPII: z.array(z.object({
        type: z.string(),
        count: z.number(),
        sensitivity: z.enum(['low', 'medium', 'high', 'critical']),
        redacted: z.boolean()
      })),
      redactionMethod: z.string(),
      redactionEffectiveness: z.number().min(0).max(1)
    }),
    consentAnalysis: z.object({
      verified: z.boolean(),
      consentType: z.string(),
      consentId: z.string().optional(),
      validUntil: z.date().optional(),
      scope: z.string()
    }),
    riskAssessment: z.object({
      overallRisk: z.enum(['low', 'medium', 'high', 'critical']),
      riskFactors: z.array(z.object({
        factor: z.string(),
        level: z.enum(['low', 'medium', 'high', 'critical']),
        mitigation: z.string()
      }))
    }),
    processingTime: z.number(),
    validatorInfo: z.object({
      version: z.string(),
      lastUpdated: z.date(),
      configuration: z.record(z.unknown())
    })
  })
});

export type ComplianceValidationResponse = z.infer<typeof ComplianceValidationResponseSchema>;

// Batch processing response
export const BatchResponseSchema = AGUIResponseSchema.extend({
  type: z.enum(['success', 'partial_success', 'error']),
  payload: z.object({
    batchId: z.string(),
    totalItems: z.number(),
    processedItems: z.number(),
    successfulItems: z.number(),
    failedItems: z.number(),
    results: z.array(z.object({
      itemId: z.string(),
      success: z.boolean(),
      response: AGUIResponseSchema.optional(),
      error: z.string().optional()
    })),
    summary: z.object({
      processingTime: z.number(),
      averageItemTime: z.number(),
      successRate: z.number(),
      errorRate: z.number()
    })
  })
});

export type BatchResponse = z.infer<typeof BatchResponseSchema>;

// Streaming response
export const StreamingResponseSchema = AGUIResponseSchema.extend({
  type: z.enum(['processing', 'success', 'error']),
  payload: z.object({
    streamId: z.string(),
    chunkId: z.string(),
    isFinal: z.boolean().default(false),
    progress: z.number().min(0).max(1),
    data: z.unknown(),
    estimatedRemainingTime: z.number().optional(),
    status: z.enum(['in_progress', 'completed', 'failed', 'cancelled'])
  })
});

export type StreamingResponse = z.infer<typeof StreamingResponseSchema>;

// System status response
export const SystemStatusResponseSchema = SuccessResponseSchema.extend({
  payload: z.object({
    status: z.enum(['healthy', 'degraded', 'unhealthy']),
    services: z.array(z.object({
      name: z.string(),
      status: z.enum(['healthy', 'degraded', 'unhealthy', 'unknown']),
      version: z.string(),
      uptime: z.number(),
      lastHealthCheck: z.date(),
      metrics: z.record(z.number()).optional()
    })),
    systemMetrics: z.object({
      uptime: z.number(),
      memory: z.object({
        used: z.number(),
        total: z.number(),
        percentage: z.number()
      }),
      cpu: z.object({
        usage: z.number(),
        cores: z.number()
      }),
      storage: z.object({
        used: z.number(),
        total: z.number(),
        percentage: z.number()
      }),
      network: z.object({
        latency: z.number(),
        bandwidth: z.number()
      })
    }),
    activeConnections: z.number(),
    requestRate: z.number(),
    errorRate: z.number(),
    lastUpdated: z.date()
  })
});

export type SystemStatusResponse = z.infer<typeof SystemStatusResponseSchema>;

// Response builder interface
export interface IAGUIResponseBuilder {
  createSuccessResponse<T>(eventId: string, payload: T, metadata?: Partial<ResponseMetadata>): SuccessResponse<T>;
  createErrorResponse(eventId: string, error: { code: string; message: string; details?: ErrorDetail[] }, statusCode?: ResponseStatusCode): ErrorResponse;
  createComplianceErrorResponse(eventId: string, violations: string[], metadata?: Partial<ResponseMetadata>): ErrorResponse;
  createValidationErrorResponse(eventId: string, validationErrors: ErrorDetail[], metadata?: Partial<ResponseMetadata>): ErrorResponse;
  createPatientInquiryResponse(eventId: string, inquiry: any): PatientInquiryResponse;
  createPatientDataResponse(eventId: string, data: any): PatientDataResponse;
  createAppointmentResponse(eventId: string, appointment: any): AppointmentResponse;
  createClinicalDecisionResponse(eventId: string, decision: any): ClinicalDecisionResponse;
  createAestheticConsultationResponse(eventId: string, consultation: any): AestheticConsultationResponse;
  createComplianceValidationResponse(eventId: string, validation: any): ComplianceValidationResponse;
  addComplianceMetadata(response: AGUIResponse, compliance: Partial<ResponseComplianceMetadata>): AGUIResponse;
  addPerformanceMetrics(response: AGUIResponse, metrics: PerformanceMetrics): AGUIResponse;
  addPagination(response: AGUIResponse, pagination: { page?: number; pageSize?: number; total?: number; hasNext?: boolean; hasPrev?: boolean }): AGUIResponse;
  addWarnings(response: AGUIResponse, warnings: Array<{ code: string; message: string; severity?: 'low' | 'medium' | 'high' }>): AGUIResponse;
}

// Response validator interface
export interface IAGUIResponseValidator {
  validate(response: AGUIResponse): ValidationResult;
  validateCompliance(response: AGUIResponse): ValidationResult;
  validateStructure(response: AGUIResponse): ValidationResult;
  validatePayload(response: AGUIResponse, schema: z.ZodSchema<any>): ValidationResult;
}

// ValidationResult for response validation
export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  score: z.number().min(0).max(1),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical'])
  })),
  warnings: z.array(z.object({
    field: z.string(),
    message: z.string(),
    severity: z.enum(['low', 'medium', 'high'])
  })),
  suggestions: z.array(z.string())
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

// Response metrics
export const ResponseMetricsSchema = z.object({
  totalResponses: z.number(),
  successResponses: z.number(),
  errorResponses: z.number(),
  averageResponseTime: z.number(),
  responseSizeDistribution: z.object({
    small: z.number(),    // < 1KB
    medium: z.number(),  // 1KB - 100KB
    large: z.number(),   // 100KB - 1MB
    extraLarge: z.number() // > 1MB
  }),
  responseTypeDistribution: z.record(z.number()),
  complianceRate: z.number(),
  cacheHitRate: z.number(),
  errorRate: z.number(),
  lastUpdated: z.date()
});

export type ResponseMetrics = z.infer<typeof ResponseMetricsSchema>;

// Response compression options
export const CompressionOptionsSchema = z.object({
  enabled: z.boolean().default(true),
  algorithm: z.enum(['gzip', 'deflate', 'brotli']).default('gzip'),
  threshold: z.number().default(1024), // Compress responses larger than 1KB
  level: z.number().min(1).max(9).default(6)
});

export type CompressionOptions = z.infer<typeof CompressionOptionsSchema>;

// Response caching options
export const CacheOptionsSchema = z.object({
  enabled: z.boolean().default(true),
  ttl: z.number().default(300000), // 5 minutes
  maxSize: z.number().default(1000), // Maximum number of cached responses
  strategy: z.enum(['lru', 'fifo', 'lfu']).default('lru'),
  varyBy: z.array(z.string()).default(['userId', 'patientId'])
});

export type CacheOptions = z.infer<typeof CacheOptionsSchema>;

// Response interceptor interface
export interface IAGUIResponseInterceptor {
  intercept(response: AGUIResponse): Promise<AGUIResponse>;
  priority: number;
}

// Response transformer interface
export interface IAGUIResponseTransformer {
  transform(response: AGUIResponse): Promise<AGUIResponse>;
  supports(responseType: AGUIResponseType): boolean;
}