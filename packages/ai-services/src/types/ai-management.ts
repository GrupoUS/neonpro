/**
 * AI Management Types for NeonPro
 *
 * Core interfaces and types for AI service management and healthcare job processing
 * designed for healthcare applications with LGPD compliance
 */

export interface GenerateAnswerInput {
  prompt: string
  locale?: 'pt-BR' | 'en-US'
  system?: string
  stream?: boolean
  maxTokens?: number
  temperature?: number
}

export interface GenerateAnswerResult {
  content: string
  tokensUsed?: number
  model?: string
  finishReason?: 'stop' | 'length' | 'content_filter' | 'function_call'
  provider?: string
  metadata?: Record<string, unknown>
}

export interface StreamChunk {
  content: string
  delta?: string
  finished: boolean
  finishReason?: 'stop' | 'length' | 'content_filter' | 'function_call'
  provider?: string
  metadata?: Record<string, unknown>
}

export interface AIProviderInterface {
  generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerResult>
  generateStream?(input: GenerateAnswerInput): AsyncIterable<StreamChunk>
}

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'mock'

export type HealthcareJobType =
  | 'patient_data_sync'
  | 'emergency_notification'
  | 'compliance_audit'
  | 'data_retention_cleanup'
  | 'ai_processing'

export interface JobHandlerFunction {
  (payload: Record<string, any>): Promise<any>
}

export interface JobHandler {
  execute: JobHandlerFunction
  getSupportedTypes: () => HealthcareJobType[]
  validatePayload: (payload: Record<string, any>) => Promise<boolean>
  getEstimatedExecutionTime: (payload: Record<string, any>) => Promise<number>
}

export interface JobQueue {
  enqueue: (job: any) => Promise<void>
  dequeue: () => Promise<any>
  getNextJob: () => Promise<any>
}

export interface JobData {
  id: string
  type: HealthcareJobType
  payload: Record<string, any>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
  attemptCount: number
  maxRetries: number
  priority: number
}

export interface WorkerConfig {
  workerId: string
  maxConcurrentJobs: number
  heartbeatInterval: number
  healthCheckInterval: number
}

export interface HealthcareJobContext {
  patientId?: string
  professionalId?: string
  clinicId?: string
  appointmentId?: string
  operationType: string
  timestamp: Date
  environment: 'development' | 'staging' | 'production' | 'test'
  compliance: {
    lgpdBasis?: 'consent' | 'legitimate_interests' | 'legal_obligation' | 'vital_interests'
    consentStatus?: boolean
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted'
    retentionPeriod: number
  }
}

export interface HealthcareAuditEvent {
  type: string
  timestamp: Date
  provider: string
  action: string
  details: Record<string, unknown>
  severity: 'info' | 'warning' | 'error' | 'critical'
  userId?: string
  patientId?: string
}