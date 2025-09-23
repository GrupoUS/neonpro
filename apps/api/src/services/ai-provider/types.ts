/**
 * AI Provider Router Types
 * Extracted from ai-provider-router.ts for better modularity
 */

import {
  AIModelCategory,
  AIModelConfigOpt,

  AIProviderOpt,
  HealthcareAIUseCase,
  HealthcareDataClassification,
  LGPDDataCategory,
} from '@neonpro/shared';

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
  provider: AIProviderOpt;
  status: ProviderStatus;
  latency: number;
  success_rate: number;
  rate_limit_remaining: number;
  cost_efficiency: number;
  last_check: Date;
  error_message?: string;
}

export interface RoutingRequest {
  // Request content
  prompt: string;
  messages?: Array<{ _role: string; content: string }>;

  // Healthcare context
  healthcare_context: {
    use_case: HealthcareAIUseCase;
    patient_id?: string;
    healthcare_professional_id?: string;
    is_emergency: boolean;
    contains_pii: boolean;
    data_classification: HealthcareDataClassification;
    lgpd_categories: LGPDDataCategory[];
    requires_audit: boolean;
  };

  // AI configuration
  ai_config: {
    model_category: AIModelCategory;
    max_tokens?: number;
    temperature?: number;
    preferred_providers?: AIProviderOpt[];
    fallback_enabled: boolean;
    cache_enabled: boolean;
  };

  // Routing preferences
  routing_config: {
    strategy: RoutingStrategy;
    max_cost_usd?: number;
    max_latency_ms?: number;
    min_quality_score?: number;
    priority_level: 'low' | 'normal' | 'high' | 'emergency';
  };

  // Request metadata
  request_metadata: {
    request_id: string;
    user_id: string;
    session_id?: string;
    correlation_id?: string;
    created_at: Date;
  };
}

export interface RoutingResponse {
  // Response content
  content: string;

  // Provider used
  provider_used: AIProviderOpt;
  model_used: string;

  // Performance metrics
  metrics: {
    total_latency_ms: number;
    provider_latency_ms: number;
    cache_latency_ms?: number;
    total_cost_usd: number;
    tokens_used: {
      input: number;
      output: number;
      total: number;
    };
    cache_hit: boolean;
    fallback_used: boolean;
  };

  // Healthcare compliance
  compliance: {
    pii_redacted: boolean;
    lgpd_compliant: boolean;
    audit_logged: boolean;
    data_sanitized: boolean;
  };

  // Response metadata
  response_metadata: {
    response_id: string;
    request_id: string;
    timestamp: Date;
    processing_time_ms: number;
  };
}

export interface ProviderConfig {
  provider: AIProviderOpt;
  enabled: boolean;
  api_key: string;
  base_url?: string;
  models: AIModelConfigOpt[];
  health_check_interval_ms: number;
  max_concurrent_requests: number;
  rate_limit_rpm: number;
  cost_config: {
    monthly_budget_limit: number;
    current_spend: number;
    cost_alert_threshold: number;
  };
  healthcare_compliance: {
    lgpd_approved: boolean;
    anvisa_certified: boolean;
    cfm_approved: boolean;
    pii_handling_approved: boolean;
  };
}
