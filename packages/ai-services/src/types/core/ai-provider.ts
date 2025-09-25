// Core AI Provider interfaces for unified AI services
import { z } from 'zod';

// Base provider configuration
export const ProviderConfigSchema = z.object({
  type: z.enum(['openai', 'anthropic', 'google', 'local']),
  model: z.string(),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  maxTokens: z.number().default(4000),
  temperature: z.number().min(0).max(2).default(0.1),
  timeout: z.number().default(30000),
  retryAttempts: z.number().default(3),
  healthCheckInterval: z.number().default(30000),
  capabilities: z.object({
    clinical: z.boolean().default(false),
    aesthetic: z.boolean().default(false),
    multilingual: z.array(z.string()).default([]),
    streaming: z.boolean().default(true),
    jsonMode: z.boolean().default(true)
  }).default({})
});

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

// Provider capabilities
export const ProviderCapabilitiesSchema = z.object({
  clinical: z.boolean(),
  aesthetic: z.boolean(),
  multilingual: z.array(z.string()),
  streaming: z.boolean(),
  jsonMode: z.boolean(),
  maxInputTokens: z.number(),
  maxOutputTokens: z.number(),
  supportedFormats: z.array(z.enum(['text', 'json', 'markdown'])),
  specializations: z.array(z.enum([
    'general_medicine',
    'aesthetic_medicine',
    'dermatology',
    'plastic_surgery',
    'mental_health',
    'nutrition',
    'fitness'
  ]))
});

export type ProviderCapabilities = z.infer<typeof ProviderCapabilitiesSchema>;

// Provider health status
export const ProviderHealthSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy', 'unknown']),
  responseTime: z.number(),
  errorRate: z.number(),
  lastCheck: z.date(),
  consecutiveFailures: z.number(),
  uptime: z.number(),
  metadata: z.record(z.unknown()).optional()
});

export type ProviderHealth = z.infer<typeof ProviderHealthSchema>;

// Completion request
export const CompletionRequestSchema = z.object({
  prompt: z.string(),
  systemPrompt: z.string().optional(),
  maxTokens: z.number().optional(),
  temperature: z.number().optional(),
  stopSequences: z.array(z.string()).optional(),
  context: z.record(z.unknown()).optional()
});

export type CompletionRequest = z.infer<typeof CompletionRequestSchema>;

// Completion response
export const CompletionResponseSchema = z.object({
  id: z.string(),
  text: z.string(),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number()
  }),
  model: z.string(),
  provider: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.unknown()).optional()
});

export type CompletionResponse = z.infer<typeof CompletionResponseSchema>;

// Chat message
export const ChatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool']),
  content: z.string(),
  timestamp: z.date().optional(),
  metadata: z.record(z.unknown()).optional()
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Chat request
export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  maxTokens: z.number().optional(),
  temperature: z.number().optional(),
  stream: z.boolean().default(false),
  tools: z.array(z.unknown()).optional(),
  toolChoice: z.unknown().optional()
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// Chat response
export const ChatResponseSchema = z.object({
  id: z.string(),
  message: ChatMessageSchema,
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number()
  }),
  model: z.string(),
  provider: z.string(),
  timestamp: z.date(),
  finishReason: z.enum(['stop', 'length', 'tool_calls', 'content_filter']),
  toolCalls: z.array(z.unknown()).optional()
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;

// Completion chunk for streaming
export const CompletionChunkSchema = z.object({
  id: z.string(),
  text: z.string(),
  isFinal: z.boolean().default(false),
  timestamp: z.date(),
  metadata: z.record(z.unknown()).optional()
});

export type CompletionChunk = z.infer<typeof CompletionChunkSchema>;

// Provider interface
export interface IAIProvider {
  readonly id: string;
  readonly name: string;
  readonly capabilities: ProviderCapabilities;
  health: ProviderHealth;

  // Core operations
  generateCompletion(request: CompletionRequest): Promise<CompletionResponse>;
  generateChat(request: ChatRequest): Promise<ChatResponse>;
  streamCompletion(request: CompletionRequest): Promise<AsyncIterable<CompletionChunk>>;

  // Healthcare-specific operations
  generateClinicalInsight(request: ClinicalRequest): Promise<ClinicalResponse>;
  generateAestheticRecommendation(request: AestheticRequest): Promise<AestheticResponse>;
  validateCompliance(request: ComplianceRequest): Promise<ComplianceResponse>;

  // Health monitoring
  checkHealth(): Promise<ProviderHealth>;
  updateHealth(health: ProviderHealth): void;

  // Lifecycle management
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

// Clinical request
export const ClinicalRequestSchema = CompletionRequestSchema.extend({
  patientId: z.string().optional(),
  clinicalContext: z.object({
    symptoms: z.array(z.string()).optional(),
    vitalSigns: z.record(z.number()).optional(),
    medicalHistory: z.array(z.string()).optional(),
    currentMedications: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional()
  }).optional(),
  requestType: z.enum([
    'diagnosis_assistance',
    'treatment_recommendation',
    'risk_assessment',
    'patient_education'
  ])
});

export type ClinicalRequest = z.infer<typeof ClinicalRequestSchema>;

// Clinical response
export const ClinicalResponseSchema = z.object({
  id: z.string(),
  insight: z.string(),
  confidence: z.number().min(0).max(1),
  recommendations: z.array(z.string()),
  riskFactors: z.array(z.string()).optional(),
  followUpActions: z.array(z.string()).optional(),
  references: z.array(z.string()).optional(),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number()
  }),
  model: z.string(),
  provider: z.string(),
  timestamp: z.date(),
  compliance: z.object({
    lgpdValidated: z.boolean(),
    piiRedacted: z.boolean(),
    auditRequired: z.boolean()
  })
});

export type ClinicalResponse = z.infer<typeof ClinicalResponseSchema>;

// Aesthetic request
export const AestheticRequestSchema = ClinicalRequestSchema.extend({
  aestheticContext: z.object({
    procedureType: z.string(),
    treatmentArea: z.string(),
    patientPreferences: z.array(z.string()).optional(),
    previousTreatments: z.array(z.string()).optional(),
    skinType: z.string().optional(),
    contraindications: z.array(z.string()).optional()
  }).optional(),
  requestType: z.enum([
    'treatment_planning',
    'procedure_recommendation',
    'outcome_prediction',
    'risk_assessment',
    'patient_consultation'
  ])
});

export type AestheticRequest = z.infer<typeof AestheticRequestSchema>;

// Aesthetic response
export const AestheticResponseSchema = z.object({
  id: z.string(),
  recommendation: z.string(),
  procedureDetails: z.object({
    name: z.string(),
    description: z.string(),
    duration: z.string(),
    recovery: z.string(),
    expectedResults: z.array(z.string())
  }),
  alternatives: z.array(z.object({
    name: z.string(),
    benefits: z.array(z.string()),
    risks: z.array(z.string())
  })),
  riskAssessment: z.object({
    overallRisk: z.enum(['low', 'medium', 'high']),
    specificRisks: z.array(z.string()),
    mitigations: z.array(z.string())
  }),
  expectedOutcomes: z.array(z.string()),
  aftercareInstructions: z.array(z.string()),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number()
  }),
  model: z.string(),
  provider: z.string(),
  timestamp: z.date(),
  compliance: z.object({
    lgpdValidated: z.boolean(),
    anvisaCompliant: z.boolean(),
    cfmCompliant: z.boolean(),
    deviceValidation: z.array(z.string())
  })
});

export type AestheticResponse = z.infer<typeof AestheticResponseSchema>;

// Compliance request
export const ComplianceRequestSchema = z.object({
  dataType: z.enum(['patient_data', 'clinical_data', 'aesthetic_data']),
  dataContent: z.string(),
  context: z.object({
    patientId: z.string().optional(),
    procedureType: z.string().optional(),
    consentVerified: z.boolean().default(false),
    dataRetentionRequired: z.boolean().default(true)
  }),
  validationType: z.enum(['lgpd', 'anvisa', 'cfm', 'general_compliance'])
});

export type ComplianceRequest = z.infer<typeof ComplianceRequestSchema>;

// Compliance response
export const ComplianceResponseSchema = z.object({
  id: z.string(),
  valid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  recommendations: z.array(z.string()),
  piiRedacted: z.boolean(),
  consentValidated: z.boolean(),
  regulatoryChecks: z.array(z.object({
    framework: z.string(),
    compliant: z.boolean(),
    details: z.string()
  })),
  timestamp: z.date(),
  auditLogId: z.string().optional()
});

export type ComplianceResponse = z.infer<typeof ComplianceResponseSchema>;

// Provider factory interface
export interface IAIProviderFactory {
  createProvider(config: ProviderConfig): Promise<IAIProvider>;
  getProvider(providerId: string): IAIProvider | undefined;
  getOptimalProvider(capabilities: Partial<ProviderCapabilities>): Promise<IAIProvider>;
  registerProvider(provider: IAIProvider): void;
  unregisterProvider(providerId: string): void;
  getAllProviders(): IAIProvider[];
}

// Event types for provider management
export type ProviderEvent = 
  | { type: 'provider.created'; provider: IAIProvider }
  | { type: 'provider.health_changed'; providerId: string; health: ProviderHealth }
  | { type: 'provider.error'; providerId: string; error: Error }
  | { type: 'provider.removed'; providerId: string };

// Provider event handler
export type ProviderEventHandler = (event: ProviderEvent) => void;