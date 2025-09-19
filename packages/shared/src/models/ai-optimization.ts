/**
 * AI Optimization Data Models
 * Healthcare platform AI cost and latency optimization
 * LGPD/ANVISA/CFM compliance for AI operations with patient data
 */

/**
 * MIGRATION NOTICE (v2.0.0):
 * This file underwent a major refactor, reducing from 690 lines to 367 lines.
 * 
 * BREAKING CHANGES:
 * - Several types, enums, and schemas have been renamed, removed, or restructured.
 * - The structure of AI model configuration and performance metrics has changed.
 * - Some fields may have been renamed or moved to new schemas.
 * - Validation logic now uses updated Zod schemas.
 * 
 * MIGRATION GUIDE:
 * - Review all imports from this file and update type and schema names as needed.
 * - Update any code that constructs or validates AI model configs to match the new schema structure.
 * - Refer to the new enums and their values, as some may have changed.
 * - If you relied on removed types or fields, consult the new schemas for alternatives.
 * 
 * For detailed migration steps, see the repository CHANGELOG or MIGRATION.md (if available).
 */
import { z } from 'zod';
import { HealthcareDataClassification, LGPDDataCategory, DataRetentionClass } from './healthcare-base';

// AI Provider Types
export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  AZURE = 'azure',
  AWS_BEDROCK = 'aws_bedrock',
  LOCAL = 'local'
}

// AI Model Categories
export enum AIModelCategory {
  CHAT = 'chat',
  EMBEDDING = 'embedding',
  TRANSCRIPTION = 'transcription',
  TRANSLATION = 'translation',
  ANALYSIS = 'analysis',
  GENERATION = 'generation'
}

// Cost Optimization Strategies
export enum CostOptimizationStrategy {
  SEMANTIC_CACHING = 'semantic_caching',
  PROMPT_COMPRESSION = 'prompt_compression',
  MODEL_ROUTING = 'model_routing',
  BATCH_PROCESSING = 'batch_processing',
  TOKEN_LIMITING = 'token_limiting',
  RESPONSE_STREAMING = 'response_streaming'
}

// Healthcare AI Use Cases
export enum HealthcareAIUseCase {
  PATIENT_COMMUNICATION = 'patient_communication',
  APPOINTMENT_SCHEDULING = 'appointment_scheduling',
  SYMPTOMS_ANALYSIS = 'symptoms_analysis',
  TREATMENT_PLANNING = 'treatment_planning',
  DOCUMENTATION = 'documentation',
  COMPLIANCE_CHECK = 'compliance_check',
  MEDICAL_TRANSCRIPTION = 'medical_transcription',
  PATIENT_EDUCATION = 'patient_education'
}

// Performance Metrics Schema
export const AIPerformanceMetricsSchema = z.object({
  latency: z.object({
    p50: z.number().min(0).describe('50th percentile latency in ms'),
    p95: z.number().min(0).describe('95th percentile latency in ms'),
    p99: z.number().min(0).describe('99th percentile latency in ms'),
    average: z.number().min(0).describe('Average latency in ms'),
    timeout_rate: z.number().min(0).max(100).describe('Timeout rate percentage')
  }),
  
  cost: z.object({
    input_tokens: z.number().min(0).describe('Input tokens consumed'),
    output_tokens: z.number().min(0).describe('Output tokens generated'),
    total_cost_usd: z.number().min(0).describe('Total cost in USD'),
    cost_per_request: z.number().min(0).describe('Average cost per request'),
    monthly_budget_used: z.number().min(0).max(100).describe('Monthly budget usage percentage')
  }),
  
  quality: z.object({
    cache_hit_rate: z.number().min(0).max(100).describe('Semantic cache hit rate percentage'),
    success_rate: z.number().min(0).max(100).describe('Request success rate percentage'),
    error_rate: z.number().min(0).max(100).describe('Error rate percentage'),
    user_satisfaction: z.number().min(1).max(5).optional().describe('User satisfaction score 1-5')
  }),
  
  healthcare_compliance: z.object({
    pii_redaction_rate: z.number().min(0).max(100).describe('PII redaction success rate'),
    lgpd_compliance_score: z.number().min(0).max(100).describe('LGPD compliance score'),
    anvisa_security_score: z.number().min(0).max(100).describe('ANVISA security compliance'),
    cfm_professional_standards: z.boolean().describe('CFM professional standards compliance')
  })
});

// AI Model Configuration Schema
export const AIModelConfigSchema = z.object({
  provider: z.nativeEnum(AIProvider),
  model_name: z.string().min(1).describe('AI model identifier'),
  category: z.nativeEnum(AIModelCategory),
  
  cost_config: z.object({
    input_cost_per_1k_tokens: z.number().min(0).describe('Cost per 1K input tokens in USD'),
    output_cost_per_1k_tokens: z.number().min(0).describe('Cost per 1K output tokens in USD'),
    max_tokens: z.number().min(1).describe('Maximum tokens per request'),
    max_monthly_budget: z.number().min(0).describe('Maximum monthly budget in USD')
  }),
  
  performance_config: z.object({
    max_latency_ms: z.number().min(100).describe('Maximum acceptable latency'),
    timeout_ms: z.number().min(1000).describe('Request timeout'),
    retry_attempts: z.number().min(0).max(5).describe('Number of retry attempts'),
    rate_limit_rpm: z.number().min(1).describe('Rate limit requests per minute')
  }),
  
  healthcare_config: z.object({
    pii_redaction_enabled: z.boolean().describe('Enable PII redaction'),
    lgpd_compliant: z.boolean().describe('LGPD compliance enabled'),
    anvisa_approved: z.boolean().describe('ANVISA security approval'),
    cfm_professional_use: z.boolean().describe('CFM professional use approval'),
    patient_data_processing: z.boolean().describe('Approved for patient data'),
    audit_logging_required: z.boolean().describe('Audit logging requirement')
  })
});

// Semantic Cache Entry Schema
export const SemanticCacheEntrySchema = z.object({
  cache_key: z.string().min(1).describe('Unique cache key'),
  semantic_hash: z.string().min(1).describe('Semantic similarity hash'),
  embedding_vector: z.array(z.number()).optional().describe('Vector embedding for similarity'),
  
  request_data: z.object({
    prompt: z.string().describe('Original prompt (PII redacted)'),
    model_config: z.string().describe('Model configuration used'),
    healthcare_context: z.nativeEnum(HealthcareAIUseCase).optional(),
    patient_context_type: z.enum(['general', 'specific', 'emergency']).optional()
  }),
  
  response_data: z.object({
    content: z.string().describe('AI response content'),
    tokens_used: z.number().min(0).describe('Tokens consumed'),
    latency_ms: z.number().min(0).describe('Response latency'),
    quality_score: z.number().min(0).max(1).optional().describe('Response quality score')
  }),
  
  cache_metadata: z.object({
    created_at: z.string().datetime().describe('Cache entry creation time'),
    last_accessed: z.string().datetime().describe('Last access time'),
    access_count: z.number().min(0).describe('Number of cache hits'),
    ttl_hours: z.number().min(1).describe('Time to live in hours'),
    similarity_threshold: z.number().min(0).max(1).describe('Similarity matching threshold')
  }),
  
  healthcare_metadata: z.object({
    data_classification: z.nativeEnum(HealthcareDataClassification),
    lgpd_categories: z.array(z.nativeEnum(LGPDDataCategory)),
    retention_class: z.nativeEnum(DataRetentionClass),
    pii_redacted: z.boolean().describe('PII redaction applied'),
    patient_consent_verified: z.boolean().describe('Patient consent verified'),
    professional_context: z.boolean().describe('Healthcare professional context')
  })
});

// AI Optimization Configuration Schema
export const AIOptimizationConfigSchema = z.object({
  strategies: z.array(z.nativeEnum(CostOptimizationStrategy)).describe('Active optimization strategies'),
  
  semantic_caching: z.object({
    enabled: z.boolean(),
    similarity_threshold: z.number().min(0).max(1).default(0.85),
    max_cache_size_mb: z.number().min(10).default(1000),
    ttl_hours: z.number().min(1).default(24),
    embedding_model: z.string().default('text-embedding-ada-002'),
    vector_dimensions: z.number().min(100).default(1536)
  }),
  
  model_routing: z.object({
    enabled: z.boolean(),
    primary_model: AIModelConfigSchema,
    fallback_models: z.array(AIModelConfigSchema),
    routing_criteria: z.object({
      cost_priority: z.number().min(0).max(1).default(0.3),
      latency_priority: z.number().min(0).max(1).default(0.4),
      quality_priority: z.number().min(0).max(1).default(0.3)
    }),
    auto_failover: z.boolean().default(true)
  }),
  
  prompt_optimization: z.object({
    compression_enabled: z.boolean().default(true),
    max_input_length: z.number().min(100).default(4000),
    template_caching: z.boolean().default(true),
    context_pruning: z.boolean().default(true)
  }),
  
  healthcare_safeguards: z.object({
    mandatory_pii_redaction: z.boolean().default(true),
    patient_consent_validation: z.boolean().default(true),
    professional_verification: z.boolean().default(true),
    audit_all_requests: z.boolean().default(true),
    emergency_bypass_enabled: z.boolean().default(true),
    max_patient_data_retention_days: z.number().min(1).default(30)
  })
});

// Main AI Optimization Schema
export const AIOptimizationSchema = z.object({
  id: z.string().uuid().describe('Unique optimization configuration ID'),
  name: z.string().min(1).describe('Configuration name'),
  description: z.string().optional().describe('Configuration description'),
  
  // Configuration
  config: AIOptimizationConfigSchema,
  
  // Performance tracking
  metrics: AIPerformanceMetricsSchema.optional(),
  
  // Healthcare compliance
  healthcare_metadata: z.object({
    data_classification: z.nativeEnum(HealthcareDataClassification).default(HealthcareDataClassification.PATIENT_SENSITIVE),
    lgpd_categories: z.array(z.nativeEnum(LGPDDataCategory)).default([LGPDDataCategory.HEALTH_DATA]),
    retention_class: z.nativeEnum(DataRetentionClass).default(DataRetentionClass.SHORT_TERM),
    compliance_validated: z.boolean().default(false),
    last_compliance_check: z.string().datetime().optional(),
    anvisa_approval_required: z.boolean().default(true),
    cfm_professional_oversight: z.boolean().default(true)
  }),
  
  // Audit trail
  audit_trail: z.object({
    created_by: z.string().describe('User who created the configuration'),
    created_at: z.string().datetime().describe('Creation timestamp'),
    last_modified_by: z.string().describe('User who last modified'),
    last_modified_at: z.string().datetime().describe('Last modification timestamp'),
    version: z.number().min(1).describe('Configuration version'),
    change_log: z.array(z.object({
      timestamp: z.string().datetime(),
      user: z.string(),
      action: z.enum(['created', 'updated', 'activated', 'deactivated']),
      changes: z.record(z.unknown()).optional(),
      reason: z.string().optional()
    })).default([])
  }),
  
  // Status
  status: z.enum(['draft', 'active', 'inactive', 'deprecated']).default('draft'),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  
  // Cost tracking
  cost_tracking: z.object({
    current_month_spend: z.number().min(0).default(0),
    budget_limit: z.number().min(0).describe('Monthly budget limit'),
    cost_alerts: z.array(z.object({
      threshold_percentage: z.number().min(0).max(100),
      recipients: z.array(z.string().email()),
      enabled: z.boolean().default(true)
    })).default([]),
    optimization_savings: z.number().min(0).default(0).describe('Monthly savings from optimization')
  })
});

// Type exports
export type AIOptimization = z.infer<typeof AIOptimizationSchema>;
export type AIModelConfig = z.infer<typeof AIModelConfigSchema>;
export type AIPerformanceMetrics = z.infer<typeof AIPerformanceMetricsSchema>;
export type SemanticCacheEntry = z.infer<typeof SemanticCacheEntrySchema>;
export type AIOptimizationConfig = z.infer<typeof AIOptimizationConfigSchema>;

// Utility functions for healthcare AI optimization
export class HealthcareAIOptimizationUtils {
  /**
   * Calculate cost savings from optimization strategies
   */
  static calculateCostSavings(
    baseline_cost: number,
    optimized_cost: number
  ): { savings_amount: number; savings_percentage: number } {
    const savings_amount = Math.max(0, baseline_cost - optimized_cost);
    const savings_percentage = baseline_cost > 0 ? (savings_amount / baseline_cost) * 100 : 0;
    
    return { savings_amount, savings_percentage };
  }
  
  /**
   * Validate healthcare compliance for AI configuration
   */
  static validateHealthcareCompliance(config: AIOptimizationConfig): {
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const recommendations: string[] = [];
    
    // Check mandatory PII redaction
    if (!config.healthcare_safeguards.mandatory_pii_redaction) {
      violations.push('Mandatory PII redaction is disabled');
    }
    
    // Check patient consent validation
    if (!config.healthcare_safeguards.patient_consent_validation) {
      violations.push('Patient consent validation is disabled');
    }
    
    // Check audit logging
    if (!config.healthcare_safeguards.audit_all_requests) {
      violations.push('Audit logging is disabled');
    }
    
    // Check data retention limits
    if (config.healthcare_safeguards.max_patient_data_retention_days > 90) {
      recommendations.push('Consider reducing patient data retention to ≤30 days for LGPD compliance');
    }
    
    // Check semantic caching for sensitive data
    if (config.semantic_caching.enabled && config.semantic_caching.ttl_hours > 24) {
      recommendations.push('Limit cache TTL to ≤24 hours for patient data');
    }
    
    return {
      compliant: violations.length === 0,
      violations,
      recommendations
    };
  }
  
  /**
   * Generate semantic similarity hash for caching
   */
  static generateSemanticHash(prompt: string, context: HealthcareAIUseCase): string {
    // Simple hash implementation - in production, use proper semantic hashing
    const combined = `${prompt}:${context}`;
    return Buffer.from(combined).toString('base64url').substring(0, 32);
  }
  
  /**
   * Estimate AI request cost
   */
  static estimateRequestCost(
    input_tokens: number,
    estimated_output_tokens: number,
    model_config: AIModelConfig
  ): { estimated_cost: number; breakdown: Record<string, number> } {
    const input_cost = (input_tokens / 1000) * model_config.cost_config.input_cost_per_1k_tokens;
    const output_cost = (estimated_output_tokens / 1000) * model_config.cost_config.output_cost_per_1k_tokens;
    const total_cost = input_cost + output_cost;
    
    return {
      estimated_cost: total_cost,
      breakdown: {
        input_cost,
        output_cost,
        total_cost
      }
    };
  }
}

// Default configurations for common healthcare use cases
export const DEFAULT_HEALTHCARE_AI_CONFIGS = {
  PATIENT_COMMUNICATION: {
    strategies: [CostOptimizationStrategy.SEMANTIC_CACHING, CostOptimizationStrategy.PROMPT_COMPRESSION],
    semantic_caching: { enabled: true, similarity_threshold: 0.9, ttl_hours: 4 },
    healthcare_safeguards: { mandatory_pii_redaction: true, max_patient_data_retention_days: 7 }
  },
  
  MEDICAL_DOCUMENTATION: {
    strategies: [CostOptimizationStrategy.SEMANTIC_CACHING, CostOptimizationStrategy.MODEL_ROUTING],
    semantic_caching: { enabled: true, similarity_threshold: 0.85, ttl_hours: 24 },
    healthcare_safeguards: { mandatory_pii_redaction: true, max_patient_data_retention_days: 30 }
  },
  
  EMERGENCY_CONSULTATION: {
    strategies: [CostOptimizationStrategy.RESPONSE_STREAMING],
    semantic_caching: { enabled: false }, // Disable caching for emergency scenarios
    healthcare_safeguards: { emergency_bypass_enabled: true, max_patient_data_retention_days: 1 }
  }
} as const;