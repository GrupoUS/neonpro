/**
 * AI Provider Router Types
 * Extracted from ai-provider-router.ts for better modularity
 */

// Local healthcare AI types and enums
export enum AIProviderOpt {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  AZURE = 'azure',
  AWS_BEDROCK = 'aws_bedrock',
}

export enum AIModelCategory {
  CHAT = 'chat',
  COMPLETION = 'completion',
  EMBEDDING = 'embedding',
  MODERATION = 'moderation',
  TRANSCRIPTION = 'transcription',
}

export enum HealthcareAIUseCase {
  PATIENT_COMMUNICATION = 'patient_communication',
  DOCUMENTATION = 'documentation',
  SYMPTOMS_ANALYSIS = 'symptoms_analysis',
  TREATMENT_PLANNING = 'treatment_planning',
  MEDICAL_TRANSCRIPTION = 'medical_transcription',
  PATIENT_EDUCATION = 'patient_education',
  COMPLIANCE_CHECK = 'compliance_check',
  APPOINTMENT_SCHEDULING = 'appointment_scheduling',
}

export enum HealthcareDataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  SENSITIVE = 'sensitive',
}

export enum LGPDDataCategory {
  PERSONAL_IDENTIFICATION = 'personal_identification',
  HEALTH_DATA = 'health_data',
  GENETIC_DATA = 'genetic_data',
  BIOMETRIC_DATA = 'biometric_data',
  PAYMENT_DATA = 'payment_data',
}

export interface AIModelConfigOpt {
  provider: AIProviderOpt
  model_name: string
  category: AIModelCategory
  cost_config: {
    input_cost_per_1k_tokens: number
    output_cost_per_1k_tokens: number
    max_tokens: number
    max_monthly_budget: number
  }
  performance_config: {
    max_latency_ms: number
    timeout_ms: number
    retry_attempts: number
    rate_limit_rpm: number
  }
  healthcare_config: {
    pii_redaction_enabled: boolean
    lgpd_compliant: boolean
    anvisa_approved: boolean
    cfm_professional_use: boolean
    patient_data_processing: boolean
    audit_logging_required: boolean
  }
}

export enum RoutingStrategy {
  COST_OPTIMIZED = 'cost_optimized',
  LATENCY_OPTIMIZED = 'latency_optimized',
  QUALITY_OPTIMIZED = 'quality_optimized',
  HEALTHCARE_SPECIFIC = 'healthcare_specific',
  EMERGENCY_PRIORITY = 'emergency_priority',
  LOAD_BALANCED = 'load_balanced',
}

export enum ProviderStatus {
  AVAILABLE = 'available',
  DEGRADED = 'degraded',
  UNAVAILABLE = 'unavailable',
  RATE_LIMITED = 'rate_limited',
  MAINTENANCE = 'maintenance',
}

export interface ProviderHealthCheck {
  provider: AIProviderOpt
  status: ProviderStatus
  latency: number
  success_rate: number
  rate_limit_remaining: number
  cost_efficiency: number
  last_check: Date
  error_message?: string
}

export interface RoutingRequest {
  // Request content
  prompt: string
  messages?: Array<{ _role: string; content: string }>

  // Healthcare context
  healthcare_context: {
    use_case: HealthcareAIUseCase
    patient_id?: string
    healthcare_professional_id?: string
    is_emergency: boolean
    contains_pii: boolean
    data_classification: HealthcareDataClassification
    lgpd_categories: LGPDDataCategory[]
    requires_audit: boolean
  }

  // AI configuration
  ai_config: {
    model_category: AIModelCategory
    max_tokens?: number
    temperature?: number
    preferred_providers?: AIProviderOpt[]
    fallback_enabled: boolean
    cache_enabled: boolean
  }

  // Routing preferences
  routing_config: {
    strategy: RoutingStrategy
    max_cost_usd?: number
    max_latency_ms?: number
    min_quality_score?: number
    priority_level: 'low' | 'normal' | 'high' | 'emergency'
  }

  // Request metadata
  request_metadata: {
    request_id: string
    user_id: string
    session_id?: string
    correlation_id?: string
    created_at: Date
  }
}

export interface RoutingResponse {
  // Response content
  content: string

  // Provider used
  provider_used: AIProviderOpt
  model_used: string

  // Performance metrics
  metrics: {
    total_latency_ms: number
    provider_latency_ms: number
    cache_latency_ms?: number
    total_cost_usd: number
    tokens_used: {
      input: number
      output: number
      total: number
    }
    cache_hit: boolean
    fallback_used: boolean
  }

  // Healthcare compliance
  compliance: {
    pii_redacted: boolean
    lgpd_compliant: boolean
    audit_logged: boolean
    data_sanitized: boolean
  }

  // Response metadata
  response_metadata: {
    response_id: string
    request_id: string
    timestamp: Date
    processing_time_ms: number
  }
}

export interface ProviderConfig {
  provider: AIProviderOpt
  enabled: boolean
  api_key: string
  base_url?: string
  models: AIModelConfigOpt[]
  health_check_interval_ms: number
  max_concurrent_requests: number
  rate_limit_rpm: number
  cost_config: {
    monthly_budget_limit: number
    current_spend: number
    cost_alert_threshold: number
  }
  healthcare_compliance: {
    lgpd_approved: boolean
    anvisa_certified: boolean
    cfm_approved: boolean
    pii_handling_approved: boolean
  }
}
