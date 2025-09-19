/**
 * Multi-Provider AI Routing Service
 * T038 - Create multi-provider AI routing service
 *
 * Intelligent AI provider routing with healthcare-specific logic, LGPD compliance,
 * cost optimization, and integration with semantic caching system.
 *
 * Features:
 * - Multi-provider support (OpenAI, Anthropic, Google, Azure, AWS Bedrock)
 * - Healthcare-specific routing logic with LGPD compliance
 * - Cost optimization and load balancing
 * - Integration with semantic caching and audit trail
 * - Fallback mechanisms and error handling
 * - PII protection and data sanitization
 */

import {
  AIModelCategory,
  AIModelConfig,
  AIPerformanceMetrics,
  AIProvider,
  HealthcareAIOptimizationUtils,
  HealthcareAIUseCase,
  HealthcareDataClassification,
  LGPDDataCategory,
} from '@neonpro/shared';
import { z } from 'zod';
import { AuditEventType, AuditTrailService } from './audit-trail';
import { SemanticCacheService } from './semantic-cache';

// ============================================================================
// Types and Interfaces
// ============================================================================

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
  provider: AIProvider;
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
  messages?: Array<{ role: string; content: string }>;

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
    preferred_providers?: AIProvider[];
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
  provider_used: AIProvider;
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
  provider: AIProvider;
  enabled: boolean;
  api_key: string;
  base_url?: string;
  models: AIModelConfig[];
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

// Circuit Breaker implementation
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private readonly failureThreshold = 5;
  private readonly timeoutMs = 60000; // 1 minute

  constructor(private provider: AIProvider) {}

  isOpen(): boolean {
    if (this.state === 'open') {
      // Check if timeout has elapsed
      if (Date.now() - this.lastFailureTime >= this.timeoutMs) {
        this.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === 'half-open') {
      this.state = 'open';
    } else if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }
}

// Validation schemas
export const RoutingRequestSchema = z.object({
  prompt: z.string().min(1).max(10000),
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).optional(),
  healthcare_context: z.object({
    use_case: z.nativeEnum(HealthcareAIUseCase),
    patient_id: z.string().optional(),
    healthcare_professional_id: z.string().optional(),
    is_emergency: z.boolean(),
    contains_pii: z.boolean(),
    data_classification: z.nativeEnum(HealthcareDataClassification),
    lgpd_categories: z.array(z.nativeEnum(LGPDDataCategory)),
    requires_audit: z.boolean(),
  }),
  ai_config: z.object({
    model_category: z.nativeEnum(AIModelCategory),
    max_tokens: z.number().min(1).max(32000).optional(),
    temperature: z.number().min(0).max(2).optional(),
    preferred_providers: z.array(z.nativeEnum(AIProvider)).optional(),
    fallback_enabled: z.boolean(),
    cache_enabled: z.boolean(),
  }),
  routing_config: z.object({
    strategy: z.nativeEnum(RoutingStrategy),
    max_cost_usd: z.number().min(0).optional(),
    max_latency_ms: z.number().min(100).optional(),
    min_quality_score: z.number().min(0).max(1).optional(),
    priority_level: z.enum(['low', 'normal', 'high', 'emergency']),
  }),
  request_metadata: z.object({
    request_id: z.string().uuid(),
    user_id: z.string(),
    session_id: z.string().optional(),
    correlation_id: z.string().optional(),
    created_at: z.date(),
  }),
});

// ============================================================================
// AI Provider Router Service
// ============================================================================

export class AIProviderRouterService {
  private providers: Map<AIProvider, ProviderConfig> = new Map();
  private provider_health: Map<AIProvider, ProviderHealthCheck> = new Map();
  private semantic_cache: SemanticCacheService;
  private audit_service: AuditTrailService;
  private health_check_interval?: NodeJS.Timeout;
  private request_queue: Map<string, Promise<RoutingResponse>> = new Map();
  private circuit_breakers: Map<AIProvider, CircuitBreaker> = new Map();
  private performance_metrics: Map<AIProvider, AIPerformanceMetrics> = new Map();

  constructor(
    semantic_cache: SemanticCacheService,
    audit_service: AuditTrailService,
    provider_configs: ProviderConfig[] = [],
  ) {
    this.semantic_cache = semantic_cache;
    this.audit_service = audit_service;

    // Initialize providers
    provider_configs.forEach(config => {
      this.providers.set(config.provider, config);
      this.circuit_breakers.set(config.provider, new CircuitBreaker(config.provider));
      this.initializeProviderMetrics(config.provider);
    });

    // Add default healthcare-compliant providers if none provided
    if (provider_configs.length === 0) {
      this.initializeDefaultProviders();
    }

    // Start health checking
    this.startHealthChecking();
  }

  /**
   * Initialize default healthcare-certified AI providers
   */
  private initializeDefaultProviders(): void {
    // OpenAI - Healthcare compliant configuration
    this.addProviderConfig({
      provider: AIProvider.OPENAI,
      enabled: true,
      api_key: process.env.OPENAI_API_KEY || '',
      models: [
        {
          provider: AIProvider.OPENAI,
          model_name: 'gpt-4-turbo',
          category: AIModelCategory.CHAT,
          cost_config: {
            input_cost_per_1k_tokens: 0.01,
            output_cost_per_1k_tokens: 0.03,
            max_tokens: 4096,
            max_monthly_budget: 1000,
          },
          performance_config: {
            max_latency_ms: 5000,
            timeout_ms: 30000,
            retry_attempts: 3,
            rate_limit_rpm: 3500,
          },
          healthcare_config: {
            pii_redaction_enabled: true,
            lgpd_compliant: true,
            anvisa_approved: true,
            cfm_professional_use: true,
            patient_data_processing: true,
            audit_logging_required: true,
          },
        },
      ],
      health_check_interval_ms: 30000,
      max_concurrent_requests: 100,
      rate_limit_rpm: 3500,
      cost_config: {
        monthly_budget_limit: 1000,
        current_spend: 0,
        cost_alert_threshold: 80,
      },
      healthcare_compliance: {
        lgpd_approved: true,
        anvisa_certified: true,
        cfm_approved: true,
        pii_handling_approved: true,
      },
    });

    // Anthropic - Claude models
    this.addProviderConfig({
      provider: AIProvider.ANTHROPIC,
      enabled: true,
      api_key: process.env.ANTHROPIC_API_KEY || '',
      models: [
        {
          provider: AIProvider.ANTHROPIC,
          model_name: 'claude-3-haiku',
          category: AIModelCategory.CHAT,
          cost_config: {
            input_cost_per_1k_tokens: 0.00025,
            output_cost_per_1k_tokens: 0.00125,
            max_tokens: 4096,
            max_monthly_budget: 300,
          },
          performance_config: {
            max_latency_ms: 2000,
            timeout_ms: 15000,
            retry_attempts: 3,
            rate_limit_rpm: 1000,
          },
          healthcare_config: {
            pii_redaction_enabled: true,
            lgpd_compliant: true,
            anvisa_approved: true,
            cfm_professional_use: true,
            patient_data_processing: true,
            audit_logging_required: true,
          },
        },
      ],
      health_check_interval_ms: 30000,
      max_concurrent_requests: 50,
      rate_limit_rpm: 1000,
      cost_config: {
        monthly_budget_limit: 300,
        current_spend: 0,
        cost_alert_threshold: 75,
      },
      healthcare_compliance: {
        lgpd_approved: true,
        anvisa_certified: true,
        cfm_approved: true,
        pii_handling_approved: true,
      },
    });

    // Azure OpenAI - Enterprise healthcare compliance
    this.addProviderConfig({
      provider: AIProvider.AZURE,
      enabled: true,
      api_key: process.env.AZURE_OPENAI_API_KEY || '',
      base_url: process.env.AZURE_OPENAI_ENDPOINT,
      models: [
        {
          provider: AIProvider.AZURE,
          model_name: 'gpt-4-turbo-azure',
          category: AIModelCategory.CHAT,
          cost_config: {
            input_cost_per_1k_tokens: 0.01,
            output_cost_per_1k_tokens: 0.03,
            max_tokens: 4096,
            max_monthly_budget: 2000,
          },
          performance_config: {
            max_latency_ms: 4000,
            timeout_ms: 30000,
            retry_attempts: 3,
            rate_limit_rpm: 2000,
          },
          healthcare_config: {
            pii_redaction_enabled: true,
            lgpd_compliant: true,
            anvisa_approved: true,
            cfm_professional_use: true,
            patient_data_processing: true,
            audit_logging_required: true,
          },
        },
      ],
      health_check_interval_ms: 30000,
      max_concurrent_requests: 50,
      rate_limit_rpm: 2000,
      cost_config: {
        monthly_budget_limit: 2000,
        current_spend: 0,
        cost_alert_threshold: 85,
      },
      healthcare_compliance: {
        lgpd_approved: true,
        anvisa_certified: true,
        cfm_approved: true,
        pii_handling_approved: true,
      },
    });

    // AWS Bedrock - Healthcare certified models
    this.addProviderConfig({
      provider: AIProvider.AWS_BEDROCK,
      enabled: true,
      api_key: process.env.AWS_ACCESS_KEY_ID || '',
      base_url: process.env.AWS_BEDROCK_ENDPOINT,
      models: [
        {
          provider: AIProvider.AWS_BEDROCK,
          model_name: 'anthropic.claude-3-haiku-20240307-v1:0',
          category: AIModelCategory.CHAT,
          cost_config: {
            input_cost_per_1k_tokens: 0.00025,
            output_cost_per_1k_tokens: 0.00125,
            max_tokens: 4096,
            max_monthly_budget: 800,
          },
          performance_config: {
            max_latency_ms: 3000,
            timeout_ms: 25000,
            retry_attempts: 3,
            rate_limit_rpm: 1000,
          },
          healthcare_config: {
            pii_redaction_enabled: true,
            lgpd_compliant: true,
            anvisa_approved: true,
            cfm_professional_use: true,
            patient_data_processing: true,
            audit_logging_required: true,
          },
        },
      ],
      health_check_interval_ms: 30000,
      max_concurrent_requests: 30,
      rate_limit_rpm: 1000,
      cost_config: {
        monthly_budget_limit: 800,
        current_spend: 0,
        cost_alert_threshold: 80,
      },
      healthcare_compliance: {
        lgpd_approved: true,
        anvisa_certified: true,
        cfm_approved: true,
        pii_handling_approved: true,
      },
    });
  }

  /**
   * Add or update provider configuration
   */
  addProviderConfig(config: ProviderConfig): void {
    this.providers.set(config.provider, config);

    // Initialize health status
    this.provider_health.set(config.provider, {
      provider: config.provider,
      status: ProviderStatus.AVAILABLE,
      latency: 2000,
      success_rate: 100,
      rate_limit_remaining: config.rate_limit_rpm,
      cost_efficiency: 0.8,
      last_check: new Date(),
    });

    // Initialize circuit breaker
    this.circuit_breakers.set(config.provider, new CircuitBreaker(config.provider));

    // Initialize performance metrics
    this.initializeProviderMetrics(config.provider);

    console.log(`Provider ${config.provider} added to routing pool`);
  }

  /**
   * Initialize performance metrics for provider
   */
  private initializeProviderMetrics(provider: AIProvider): void {
    this.performance_metrics.set(provider, {
      latency: {
        p50: 1000,
        p95: 3000,
        p99: 5000,
        average: 1500,
        timeout_rate: 0,
      },
      cost: {
        input_tokens: 0,
        output_tokens: 0,
        total_cost_usd: 0,
        cost_per_request: 0,
        monthly_budget_used: 0,
      },
      quality: {
        cache_hit_rate: 0,
        success_rate: 100,
        error_rate: 0,
        user_satisfaction: 4.5,
      },
      healthcare_compliance: {
        pii_redaction_rate: 100,
        lgpd_compliance_score: 100,
        anvisa_security_score: 95,
        cfm_professional_standards: true,
      },
    });
  }

  /**
   * Route AI request through optimal provider with healthcare compliance
   */
  async routeRequest(request: RoutingRequest): Promise<RoutingResponse> {
    const start_time = Date.now();

    try {
      // 🚨 SECURITY: Validate and sanitize request
      const validated_request = await this.validateAndSanitizeRequest(request);

      // 🚨 HEALTHCARE: Check emergency bypass conditions
      if (validated_request.healthcare_context.is_emergency) {
        return await this.handleEmergencyRequest(validated_request, start_time);
      }

      // 🚨 LGPD: Audit request initiation
      await this.auditRequestStart(validated_request);

      // Check semantic cache first (if enabled)
      if (validated_request.ai_config.cache_enabled) {
        const cache_result = await this.checkSemanticCache(validated_request);
        if (cache_result) {
          await this.auditCacheHit(validated_request, cache_result);
          return cache_result;
        }
      }

      // Select optimal provider
      const selected_provider = await this.selectProvider(validated_request);

      // Route to provider with fallback
      const response = await this.executeProviderRequest(
        validated_request,
        selected_provider,
        start_time,
      );

      // Cache successful response (if enabled and appropriate)
      if (
        validated_request.ai_config.cache_enabled
        && this.shouldCacheResponse(validated_request, response)
      ) {
        await this.cacheResponse(validated_request, response);
      }

      // 🚨 LGPD: Audit successful completion
      await this.auditRequestComplete(validated_request, response);

      return response;
    } catch (error) {
      await this.auditRequestError(request, error as Error, start_time);
      throw error;
    }
  }

  /**
   * 🚨 SECURITY: Validate and sanitize incoming request
   */
  private async validateAndSanitizeRequest(request: RoutingRequest): Promise<RoutingRequest> {
    // Validate request structure
    const validation = RoutingRequestSchema.safeParse(request);
    if (!validation.success) {
      throw new Error(`Invalid request: ${validation.error.message}`);
    }

    // 🚨 HEALTHCARE: Validate healthcare context
    if (request.healthcare_context.contains_pii && !request.healthcare_context.patient_id) {
      throw new Error('LGPD Violation: Patient ID required when PII is present');
    }

    // 🚨 SECURITY: Sanitize prompt content
    const sanitized_prompt = this.sanitizePrompt(request.prompt);
    if (!sanitized_prompt) {
      throw new Error('Prompt sanitization failed - potential injection detected');
    }

    // 🚨 HEALTHCARE: Apply PII redaction if required
    const redacted_prompt = request.healthcare_context.contains_pii
      ? await this.redactPII(sanitized_prompt, request.healthcare_context)
      : sanitized_prompt;

    return {
      ...request,
      prompt: redacted_prompt,
    };
  }

  /**
   * 🚨 SECURITY: Sanitize prompt to prevent injection attacks
   */
  private sanitizePrompt(prompt: string): string | null {
    if (!prompt || typeof prompt !== 'string') {
      return null;
    }

    // Remove dangerous patterns
    const sanitized = prompt
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/javascript:/gi, '') // Remove javascript: links
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/[<>"']/g, '') // Remove HTML/SQL injection chars
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b/gi, '') // Remove SQL keywords
      .trim();

    // Check if sanitization removed everything
    if (sanitized.length === 0) {
      return null;
    }

    return sanitized;
  }

  /**
   * 🚨 HEALTHCARE: Redact PII from prompt
   */
  private async redactPII(
    prompt: string,
    healthcare_context: RoutingRequest['healthcare_context'],
  ): Promise<string> {
    let redacted = prompt;

    // Common PII patterns for Brazilian healthcare
    const pii_patterns = [
      // CPF: XXX.XXX.XXX-XX
      { pattern: /\d{3}\.\d{3}\.\d{3}-\d{2}/g, replacement: '[CPF_REDACTED]' },
      // RG: XX.XXX.XXX-X
      { pattern: /\d{2}\.\d{3}\.\d{3}-\d{1}/g, replacement: '[RG_REDACTED]' },
      // Phone numbers
      { pattern: /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g, replacement: '[PHONE_REDACTED]' },
      // Email addresses
      {
        pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        replacement: '[EMAIL_REDACTED]',
      },
      // Names (basic pattern - in production use more sophisticated NER)
      {
        pattern: /\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g,
        replacement: '[NAME_REDACTED]',
      },
    ];

    // Apply redaction patterns
    for (const { pattern, replacement } of pii_patterns) {
      redacted = redacted.replace(pattern, replacement);
    }

    // Log PII redaction for audit
    if (redacted !== prompt) {
      await this.audit_service.logEvent({
        type: AuditEventType.DATA_SUBJECT_REQUEST,
        user_id: healthcare_context.healthcare_professional_id || 'system',
        resource_type: 'ai_prompt',
        resource_id: 'pii_redaction',
        metadata: {
          patient_id: healthcare_context.patient_id,
          use_case: healthcare_context.use_case,
          redaction_applied: true,
          original_length: prompt.length,
          redacted_length: redacted.length,
        },
      });
    }

    return redacted;
  }

  /**
   * 🚨 EMERGENCY: Handle emergency requests with special routing
   */
  private async handleEmergencyRequest(
    request: RoutingRequest,
    start_time: number,
  ): Promise<RoutingResponse> {
    // Emergency requests bypass normal routing and go to fastest available provider
    const emergency_providers = this.getEmergencyCapableProviders();

    if (emergency_providers.length === 0) {
      throw new Error('No emergency-capable providers available');
    }

    // Sort by latency for fastest response
    emergency_providers.sort((a, b) => {
      const health_a = this.provider_health.get(a.provider);
      const health_b = this.provider_health.get(b.provider);
      return (health_a?.latency || Infinity) - (health_b?.latency || Infinity);
    });

    const selected_provider = emergency_providers[0];

    // Audit emergency access
    await this.audit_service.logEvent({
      type: AuditEventType.EMERGENCY_ACCESS,
      user_id: request.request_metadata.user_id,
      resource_type: 'ai_provider',
      resource_id: selected_provider.provider,
      metadata: {
        request_id: request.request_metadata.request_id,
        use_case: request.healthcare_context.use_case,
        patient_id: request.healthcare_context.patient_id,
        emergency_justification: 'Emergency AI request routing',
      },
    });

    return await this.executeProviderRequest(request, selected_provider, start_time);
  }

  /**
   * Get providers capable of handling emergency requests
   */
  private getEmergencyCapableProviders(): ProviderConfig[] {
    return Array.from(this.providers.values()).filter(provider => {
      // Must be enabled and have healthcare compliance
      if (!provider.enabled || !provider.healthcare_compliance.lgpd_approved) {
        return false;
      }

      // Must have emergency-capable models
      const has_emergency_model = provider.models.some(
        model =>
          model.healthcare_config.patient_data_processing
          && model.performance_config.max_latency_ms <= 5000,
      );

      if (!has_emergency_model) return false;

      // Check provider health
      const health = this.provider_health.get(provider.provider);
      if (!health || health.status !== ProviderStatus.AVAILABLE) {
        return false;
      }

      // Check circuit breaker
      const circuit_breaker = this.circuit_breakers.get(provider.provider);
      if (circuit_breaker && circuit_breaker.isOpen()) {
        return false;
      }

      return true;
    });
  }

  /**
   * Select optimal provider based on routing strategy and constraints
   */
  private async selectProvider(request: RoutingRequest): Promise<ProviderConfig> {
    const available_providers = this.getAvailableProviders(request);

    if (available_providers.length === 0) {
      throw new Error('No available providers for this request');
    }

    switch (request.routing_config.strategy) {
      case RoutingStrategy.COST_OPTIMIZED:
        return this.selectCostOptimizedProvider(available_providers, request);

      case RoutingStrategy.LATENCY_OPTIMIZED:
        return this.selectLatencyOptimizedProvider(available_providers, request);

      case RoutingStrategy.QUALITY_OPTIMIZED:
        return this.selectQualityOptimizedProvider(available_providers, request);

      case RoutingStrategy.HEALTHCARE_SPECIFIC:
        return this.selectHealthcareSpecificProvider(available_providers, request);

      case RoutingStrategy.EMERGENCY_PRIORITY:
        return this.selectEmergencyProvider(available_providers, request);

      case RoutingStrategy.LOAD_BALANCED:
        return this.selectLoadBalancedProvider(available_providers, request);

      default:
        return available_providers[0]; // Default to first available
    }
  }

  /**
   * Get providers available for healthcare context
   */
  private getAvailableProviders(request: RoutingRequest): ProviderConfig[] {
    const providers: ProviderConfig[] = [];

    for (const [provider_type, config] of this.providers.entries()) {
      // Check if provider is enabled
      if (!config.enabled) continue;

      // Check healthcare compliance requirements
      if (!this.isHealthcareCompliant(config, request.healthcare_context)) {
        continue;
      }

      // Check provider health
      const health = this.provider_health.get(provider_type);
      if (!health || health.status === ProviderStatus.UNAVAILABLE) {
        continue;
      }

      // Check circuit breaker
      const circuit_breaker = this.circuit_breakers.get(provider_type);
      if (circuit_breaker && circuit_breaker.isOpen()) {
        continue;
      }

      // Check cost constraints
      if (request.routing_config.max_cost_usd) {
        const estimated_cost = this.estimateProviderCost(config, request);
        if (estimated_cost > request.routing_config.max_cost_usd) {
          continue;
        }
      }

      // Check preferred providers
      if (
        request.ai_config.preferred_providers
        && request.ai_config.preferred_providers.length > 0
      ) {
        if (!request.ai_config.preferred_providers.includes(provider_type)) {
          continue;
        }
      }

      providers.push(config);
    }

    return providers;
  }

  /**
   * Check if provider meets healthcare compliance requirements
   */
  private isHealthcareCompliant(
    provider: ProviderConfig,
    healthcare_context: RoutingRequest['healthcare_context'],
  ): boolean {
    const compliance = provider.healthcare_compliance;

    // LGPD compliance is mandatory for all healthcare data
    if (!compliance.lgpd_approved) {
      return false;
    }

    // PII handling approval required when PII is present
    if (healthcare_context.contains_pii && !compliance.pii_handling_approved) {
      return false;
    }

    // ANVISA certification required for certain use cases
    const anvisa_required_use_cases = [
      HealthcareAIUseCase.SYMPTOMS_ANALYSIS,
      HealthcareAIUseCase.TREATMENT_PLANNING,
      HealthcareAIUseCase.MEDICAL_TRANSCRIPTION,
    ];

    if (
      anvisa_required_use_cases.includes(healthcare_context.use_case)
      && !compliance.anvisa_certified
    ) {
      return false;
    }

    // CFM approval required for professional medical use
    const cfm_required_use_cases = [
      HealthcareAIUseCase.TREATMENT_PLANNING,
      HealthcareAIUseCase.SYMPTOMS_ANALYSIS,
      HealthcareAIUseCase.MEDICAL_TRANSCRIPTION,
    ];

    if (
      cfm_required_use_cases.includes(healthcare_context.use_case)
      && !compliance.cfm_approved
    ) {
      return false;
    }

    return true;
  }

  /**
   * Estimate cost for provider request
   */
  private estimateProviderCost(provider: ProviderConfig, request: RoutingRequest): number {
    // Get the best model for this request
    const model = this.selectBestModelForProvider(provider, request);
    if (!model) return Infinity;

    // Estimate tokens
    const input_tokens = Math.ceil(request.prompt.length / 4);
    const estimated_output_tokens = Math.min(
      request.ai_config.max_tokens || 1000,
      model.cost_config.max_tokens,
    );

    return HealthcareAIOptimizationUtils.estimateRequestCost(
      input_tokens,
      estimated_output_tokens,
      model,
    ).estimated_cost;
  }

  /**
   * Select cost-optimized provider
   */
  private selectCostOptimizedProvider(
    providers: ProviderConfig[],
    request: RoutingRequest,
  ): ProviderConfig {
    let best_provider = providers[0];
    let lowest_cost = this.estimateProviderCost(best_provider, request);

    for (const provider of providers.slice(1)) {
      const cost = this.estimateProviderCost(provider, request);
      if (cost < lowest_cost) {
        lowest_cost = cost;
        best_provider = provider;
      }
    }

    return best_provider;
  }

  /**
   * Select latency-optimized provider
   */
  private selectLatencyOptimizedProvider(
    providers: ProviderConfig[],
    request: RoutingRequest,
  ): ProviderConfig {
    let best_provider = providers[0];
    let lowest_latency = this.provider_health.get(best_provider.provider)?.latency || Infinity;

    for (const provider of providers.slice(1)) {
      const latency = this.provider_health.get(provider.provider)?.latency || Infinity;
      if (latency < lowest_latency) {
        lowest_latency = latency;
        best_provider = provider;
      }
    }

    return best_provider;
  }

  /**
   * Select quality-optimized provider
   */
  private selectQualityOptimizedProvider(
    providers: ProviderConfig[],
    request: RoutingRequest,
  ): ProviderConfig {
    let best_provider = providers[0];
    let best_quality = this.provider_health.get(best_provider.provider)?.success_rate || 0;

    for (const provider of providers.slice(1)) {
      const quality = this.provider_health.get(provider.provider)?.success_rate || 0;
      if (quality > best_quality) {
        best_quality = quality;
        best_provider = provider;
      }
    }

    return best_provider;
  }

  /**
   * Select healthcare-specific optimized provider
   */
  private selectHealthcareSpecificProvider(
    providers: ProviderConfig[],
    request: RoutingRequest,
  ): ProviderConfig {
    // Healthcare-specific scoring based on use case and compliance
    let best_provider = providers[0];
    let best_score = this.calculateHealthcareScore(best_provider, request);

    for (const provider of providers.slice(1)) {
      const score = this.calculateHealthcareScore(provider, request);
      if (score > best_score) {
        best_score = score;
        best_provider = provider;
      }
    }

    return best_provider;
  }

  /**
   * Select emergency-priority provider
   */
  private selectEmergencyProvider(
    providers: ProviderConfig[],
    request: RoutingRequest,
  ): ProviderConfig {
    // For emergency, prioritize fastest response with highest compliance
    return this.selectLatencyOptimizedProvider(
      providers.filter(p =>
        p.healthcare_compliance.lgpd_approved
        && p.healthcare_compliance.anvisa_certified
      ),
      request,
    );
  }

  /**
   * Select load-balanced provider
   */
  private selectLoadBalancedProvider(
    providers: ProviderConfig[],
    request: RoutingRequest,
  ): ProviderConfig {
    // Simple round-robin based on current health metrics
    const sorted_providers = providers.sort((a, b) => {
      const health_a = this.provider_health.get(a.provider);
      const health_b = this.provider_health.get(b.provider);

      // Sort by success rate and inverse latency
      const score_a = (health_a?.success_rate || 0) - (health_a?.latency || 1000) / 1000;
      const score_b = (health_b?.success_rate || 0) - (health_b?.latency || 1000) / 1000;

      return score_b - score_a;
    });

    return sorted_providers[0];
  }

  /**
   * Calculate healthcare-specific provider score
   */
  private calculateHealthcareScore(
    provider: ProviderConfig,
    request: RoutingRequest,
  ): number {
    let score = 0;

    // Compliance score (40% weight)
    if (provider.healthcare_compliance.lgpd_approved) score += 20;
    if (provider.healthcare_compliance.anvisa_certified) score += 10;
    if (provider.healthcare_compliance.cfm_approved) score += 10;

    // Performance score (30% weight)
    const health = this.provider_health.get(provider.provider);
    if (health) {
      score += (health.success_rate / 100) * 15;
      score += Math.max(0, (1000 - health.latency) / 1000) * 15;
    }

    // Cost efficiency score (20% weight)
    const cost = this.estimateProviderCost(provider, request);
    score += Math.max(0, (0.1 - cost) / 0.1) * 20;

    // Use case specific bonus (10% weight)
    score += this.getUseCaseBonus(provider, request.healthcare_context.use_case);

    return score;
  }

  /**
   * Get use case specific bonus points
   */
  private getUseCaseBonus(provider: ProviderConfig, use_case: HealthcareAIUseCase): number {
    // Provider-specific bonuses for different use cases
    const bonuses: Record<AIProvider, Partial<Record<HealthcareAIUseCase, number>>> = {
      [AIProvider.OPENAI]: {
        [HealthcareAIUseCase.PATIENT_COMMUNICATION]: 5,
        [HealthcareAIUseCase.DOCUMENTATION]: 3,
      },
      [AIProvider.ANTHROPIC]: {
        [HealthcareAIUseCase.SYMPTOMS_ANALYSIS]: 5,
        [HealthcareAIUseCase.TREATMENT_PLANNING]: 4,
      },
      [AIProvider.GOOGLE]: {
        [HealthcareAIUseCase.MEDICAL_TRANSCRIPTION]: 5,
        [HealthcareAIUseCase.PATIENT_EDUCATION]: 3,
      },
      [AIProvider.AZURE]: {
        [HealthcareAIUseCase.COMPLIANCE_CHECK]: 5,
        [HealthcareAIUseCase.DOCUMENTATION]: 4,
      },
      [AIProvider.AWS_BEDROCK]: {
        [HealthcareAIUseCase.SYMPTOMS_ANALYSIS]: 4,
        [HealthcareAIUseCase.APPOINTMENT_SCHEDULING]: 3,
      },
      [AIProvider.LOCAL]: {
        [HealthcareAIUseCase.PATIENT_COMMUNICATION]: 2,
      },
    };

    return bonuses[provider.provider]?.[use_case] || 0;
  }

  /**
   * Execute provider request with fallback handling
   */
  private async executeProviderRequest(
    request: RoutingRequest,
    provider: ProviderConfig,
    start_time: number,
  ): Promise<RoutingResponse> {
    const providers_to_try = [provider];

    // Add fallback providers if enabled
    if (request.ai_config.fallback_enabled) {
      const fallback_providers = this.getAvailableProviders(request)
        .filter(p => p.provider !== provider.provider)
        .slice(0, 2); // Maximum 2 fallback providers

      providers_to_try.push(...fallback_providers);
    }

    let last_error: Error | null = null;
    let fallback_used = false;

    for (let i = 0; i < providers_to_try.length; i++) {
      const current_provider = providers_to_try[i];

      if (i > 0) {
        fallback_used = true;
        await this.audit_service.logEvent({
          type: AuditEventType.AI_MODEL_PREDICTION,
          user_id: request.request_metadata.user_id,
          resource_type: 'ai_provider_fallback',
          resource_id: current_provider.provider,
          metadata: {
            request_id: request.request_metadata.request_id,
            original_provider: provider.provider,
            fallback_provider: current_provider.provider,
            attempt: i + 1,
          },
        });
      }

      try {
        const model = this.selectBestModelForProvider(current_provider, request);
        if (!model) {
          throw new Error(`No suitable model for provider ${current_provider.provider}`);
        }

        const response = await this.callProviderAPI(current_provider, model, request);

        // Update circuit breaker on success
        const circuit_breaker = this.circuit_breakers.get(current_provider.provider);
        circuit_breaker?.recordSuccess();

        // Update provider health
        await this.updateProviderHealth(
          current_provider.provider,
          true,
          response.metrics.provider_latency_ms,
        );

        return {
          ...response,
          metrics: {
            ...response.metrics,
            total_latency_ms: Date.now() - start_time,
            fallback_used,
          },
        };
      } catch (error) {
        last_error = error as Error;

        // Update circuit breaker on failure
        const circuit_breaker = this.circuit_breakers.get(current_provider.provider);
        circuit_breaker?.recordFailure();

        // Update provider health
        await this.updateProviderHealth(current_provider.provider, false, Date.now() - start_time);

        console.warn(`Provider ${current_provider.provider} failed:`, error);

        // Continue to next provider if available
        if (i < providers_to_try.length - 1) {
          continue;
        }
      }
    }

    // All providers failed
    throw new Error(`All providers failed. Last error: ${last_error?.message}`);
  }

  /**
   * Select best model for provider based on request requirements
   */
  private selectBestModelForProvider(
    provider: ProviderConfig,
    request: RoutingRequest,
  ): AIModelConfig | null {
    const eligible_models = provider.models.filter(model => {
      // Check model category
      if (model.category !== request.ai_config.model_category) {
        return false;
      }

      // Check healthcare compliance
      if (
        request.healthcare_context.contains_pii
        && !model.healthcare_config.patient_data_processing
      ) {
        return false;
      }

      // Check cost constraints
      if (request.routing_config.max_cost_usd) {
        const estimated_cost = this.estimateModelCost(model, request);
        if (estimated_cost > request.routing_config.max_cost_usd) {
          return false;
        }
      }

      // Check latency constraints
      if (
        request.routing_config.max_latency_ms
        && model.performance_config.max_latency_ms > request.routing_config.max_latency_ms
      ) {
        return false;
      }

      return true;
    });

    if (eligible_models.length === 0) return null;

    // Select best model based on cost-performance ratio
    return eligible_models.sort((a, b) => {
      const cost_a = this.estimateModelCost(a, request);
      const cost_b = this.estimateModelCost(b, request);
      const latency_a = a.performance_config.max_latency_ms;
      const latency_b = b.performance_config.max_latency_ms;

      // Score: lower cost and latency is better
      const score_a = cost_a + (latency_a / 1000);
      const score_b = cost_b + (latency_b / 1000);

      return score_a - score_b;
    })[0];
  }

  /**
   * Estimate cost for specific model
   */
  private estimateModelCost(model: AIModelConfig, request: RoutingRequest): number {
    const input_tokens = Math.ceil(request.prompt.length / 4);
    const estimated_output_tokens = Math.min(
      request.ai_config.max_tokens || 1000,
      model.cost_config.max_tokens,
    );

    return HealthcareAIOptimizationUtils.estimateRequestCost(
      input_tokens,
      estimated_output_tokens,
      model,
    ).estimated_cost;
  }

  /**
   * Call provider API (mock implementation)
   */
  private async callProviderAPI(
    provider: ProviderConfig,
    model: AIModelConfig,
    request: RoutingRequest,
  ): Promise<RoutingResponse> {
    const api_start = Date.now();

    // Simulate API call latency
    const latency_simulation = Math.random() * 1000 + 500;
    await new Promise(resolve => setTimeout(resolve, latency_simulation));

    // Generate mock response based on healthcare context
    const response_content = this.generateMockResponse(
      request.healthcare_context.use_case,
      request.prompt,
    );

    // Calculate tokens and cost
    const input_tokens = Math.ceil(request.prompt.length / 4);
    const output_tokens = Math.ceil(response_content.length / 4);
    const total_cost = HealthcareAIOptimizationUtils.estimateRequestCost(
      input_tokens,
      output_tokens,
      model,
    ).estimated_cost;

    return {
      content: response_content,
      provider_used: provider.provider,
      model_used: model.model_name,
      metrics: {
        total_latency_ms: 0, // Will be set by caller
        provider_latency_ms: Date.now() - api_start,
        total_cost_usd: total_cost,
        tokens_used: {
          input: input_tokens,
          output: output_tokens,
          total: input_tokens + output_tokens,
        },
        cache_hit: false,
        fallback_used: false,
      },
      compliance: {
        pii_redacted: request.healthcare_context.contains_pii,
        lgpd_compliant: true,
        audit_logged: true,
        data_sanitized: true,
      },
      response_metadata: {
        response_id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        request_id: request.request_metadata.request_id,
        timestamp: new Date(),
        processing_time_ms: Date.now() - api_start,
      },
    };
  }

  /**
   * Generate mock response for healthcare use cases
   */
  private generateMockResponse(use_case: HealthcareAIUseCase, prompt: string): string {
    const responses: Record<HealthcareAIUseCase, string> = {
      [HealthcareAIUseCase.PATIENT_COMMUNICATION]:
        'Olá! Entendo sua preocupação. Com base nas informações fornecidas, recomendo que você consulte um profissional de saúde para uma avaliação adequada. Este sistema segue todas as diretrizes LGPD e CFM.',
      [HealthcareAIUseCase.APPOINTMENT_SCHEDULING]:
        'Verificando disponibilidade de horários... Encontrei os seguintes horários disponíveis para consulta: Segunda-feira às 14h, Terça-feira às 10h, ou Quinta-feira às 16h. Qual prefere?',
      [HealthcareAIUseCase.SYMPTOMS_ANALYSIS]:
        'Com base nos sintomas relatados, é importante procurar avaliação médica presencial. Não posso fornecer diagnósticos, mas posso ajudar a organizar as informações para sua consulta.',
      [HealthcareAIUseCase.TREATMENT_PLANNING]:
        'Para um plano de tratamento adequado, é necessária avaliação médica presencial. Posso ajudar a compilar informações relevantes para discussão com seu médico.',
      [HealthcareAIUseCase.DOCUMENTATION]:
        'Documento gerado conforme padrões CFM e LGPD. Todas as informações foram processadas de forma segura e em conformidade com as regulamentações brasileiras de saúde.',
      [HealthcareAIUseCase.COMPLIANCE_CHECK]:
        'Verificação de conformidade realizada. Processo em compliance com LGPD, ANVISA e diretrizes CFM. Todas as medidas de proteção de dados foram aplicadas.',
      [HealthcareAIUseCase.MEDICAL_TRANSCRIPTION]:
        'Transcrição médica realizada seguindo padrões de confidencialidade e proteção de dados. Informações sensíveis foram adequadamente protegidas.',
      [HealthcareAIUseCase.PATIENT_EDUCATION]:
        'Material educativo gerado com base em evidências científicas e diretrizes médicas brasileiras. Recomendo sempre consultar profissionais de saúde para orientações específicas.',
    };

    return responses[use_case]
      || 'Resposta gerada pelo sistema de IA para contexto de saúde, em conformidade com LGPD e regulamentações brasileiras.';
  }

  /**
   * Check semantic cache for similar requests
   */
  private async checkSemanticCache(request: RoutingRequest): Promise<RoutingResponse | null> {
    if (!request.healthcare_context.patient_id) {
      return null; // Cannot cache without patient context
    }

    try {
      const cache_entry = await this.semantic_cache.findSimilarEntry(
        request.prompt,
        {
          patientId: request.healthcare_context.patient_id,
          isEmergency: request.healthcare_context.is_emergency,
          containsUrgentSymptoms: request.healthcare_context.is_emergency,
          requiredCompliance: [],
          category: request.healthcare_context.use_case,
        } as any,
      );

      if (cache_entry) {
        return {
          content: cache_entry.response,
          provider_used: AIProvider.LOCAL,
          model_used: 'semantic-cache',
          metrics: {
            total_latency_ms: 50, // Cache lookup time
            provider_latency_ms: 0,
            cache_latency_ms: 50,
            total_cost_usd: 0,
            tokens_used: {
              input: 0,
              output: 0,
              total: 0,
            },
            cache_hit: true,
            fallback_used: false,
          },
          compliance: {
            pii_redacted: true,
            lgpd_compliant: true,
            audit_logged: true,
            data_sanitized: true,
          },
          response_metadata: {
            response_id: `cache_${Date.now()}`,
            request_id: request.request_metadata.request_id,
            timestamp: new Date(),
            processing_time_ms: 50,
          },
        };
      }
    } catch (error) {
      console.warn('Cache lookup failed:', error);
    }

    return null;
  }

  /**
   * Cache successful response
   */
  private async cacheResponse(request: RoutingRequest, response: RoutingResponse): Promise<void> {
    if (!request.healthcare_context.patient_id || request.healthcare_context.is_emergency) {
      return; // Don't cache emergency data
    }

    try {
      await this.semantic_cache.addEntry(
        request.prompt,
        response.content,
        {
          patientId: request.healthcare_context.patient_id,
          cost: response.metrics.total_cost_usd,
          provider: response.provider_used,
          model: response.model_used,
          healthcare_context: request.healthcare_context.use_case,
          ttlMs: this.getCacheTTLForUseCase(request.healthcare_context.use_case),
          compliance: [],
        } as any,
      );
    } catch (error) {
      console.warn('Failed to cache response:', error);
    }
  }

  /**
   * Determine if response should be cached
   */
  private shouldCacheResponse(request: RoutingRequest, response: RoutingResponse): boolean {
    // Don't cache emergency requests
    if (request.healthcare_context.is_emergency) {
      return false;
    }

    // Don't cache if no patient ID
    if (!request.healthcare_context.patient_id) {
      return false;
    }

    // Don't cache error responses
    if (response.metrics.fallback_used) {
      return false;
    }

    // Don't cache expensive responses (they might be unique)
    if (response.metrics.total_cost_usd > 0.10) {
      return false;
    }

    return true;
  }

  /**
   * Get cache TTL based on healthcare use case
   */
  private getCacheTTLForUseCase(use_case: HealthcareAIUseCase): number {
    const ttl_map: Record<HealthcareAIUseCase, number> = {
      [HealthcareAIUseCase.PATIENT_COMMUNICATION]: 4 * 60 * 60 * 1000, // 4 hours
      [HealthcareAIUseCase.APPOINTMENT_SCHEDULING]: 1 * 60 * 60 * 1000, // 1 hour
      [HealthcareAIUseCase.SYMPTOMS_ANALYSIS]: 2 * 60 * 60 * 1000, // 2 hours
      [HealthcareAIUseCase.TREATMENT_PLANNING]: 24 * 60 * 60 * 1000, // 24 hours
      [HealthcareAIUseCase.DOCUMENTATION]: 24 * 60 * 60 * 1000, // 24 hours
      [HealthcareAIUseCase.COMPLIANCE_CHECK]: 12 * 60 * 60 * 1000, // 12 hours
      [HealthcareAIUseCase.MEDICAL_TRANSCRIPTION]: 7 * 24 * 60 * 60 * 1000, // 7 days
      [HealthcareAIUseCase.PATIENT_EDUCATION]: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return ttl_map[use_case] || 4 * 60 * 60 * 1000; // Default 4 hours
  }

  /**
   * Start health checking for all providers
   */
  private startHealthChecking(): void {
    // Initial health check
    this.performHealthCheck();

    // Schedule periodic health checks
    this.health_check_interval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Perform health check on all providers
   */
  private async performHealthCheck(): Promise<void> {
    const health_promises = Array.from(this.providers.values()).map(async provider => {
      try {
        const start_time = Date.now();

        // Mock health check - in production, call actual health endpoints
        await this.mockHealthCheck(provider);

        const latency = Date.now() - start_time;

        // Update health status
        const current_health = this.provider_health.get(provider.provider);
        if (current_health) {
          current_health.status = ProviderStatus.AVAILABLE;
          current_health.latency = latency;
          current_health.success_rate = Math.min(100, current_health.success_rate + 1);
          current_health.last_check = new Date();
        }
      } catch (error) {
        // Update health status on failure
        const current_health = this.provider_health.get(provider.provider);
        if (current_health) {
          current_health.status = ProviderStatus.DEGRADED;
          current_health.success_rate = Math.max(0, current_health.success_rate - 5);
          current_health.last_check = new Date();
          current_health.error_message = (error as Error).message;

          if (current_health.success_rate < 50) {
            current_health.status = ProviderStatus.UNAVAILABLE;
          }
        }
      }
    });

    await Promise.all(health_promises);
  }

  /**
   * Mock health check for provider
   */
  private async mockHealthCheck(provider: ProviderConfig): Promise<void> {
    // Simulate health check call
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

    // Randomly fail some checks for testing
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Health check failed');
    }
  }

  /**
   * Update provider health metrics
   */
  private async updateProviderHealth(
    provider: AIProvider,
    success: boolean,
    latency: number,
  ): Promise<void> {
    const health = this.provider_health.get(provider);
    if (!health) return;

    // Update latency (moving average)
    health.latency = (health.latency * 0.8) + (latency * 0.2);

    // Update success rate
    if (success) {
      health.success_rate = Math.min(100, health.success_rate + 0.5);
      health.status = ProviderStatus.AVAILABLE;
    } else {
      health.success_rate = Math.max(0, health.success_rate - 2);

      if (health.success_rate < 70) {
        health.status = ProviderStatus.DEGRADED;
      }
      if (health.success_rate < 50) {
        health.status = ProviderStatus.UNAVAILABLE;
      }
    }

    health.last_check = new Date();
  }

  /**
   * Audit request initiation
   */
  private async auditRequestStart(request: RoutingRequest): Promise<void> {
    await this.audit_service.logEvent({
      type: AuditEventType.AI_MODEL_PREDICTION,
      user_id: request.request_metadata.user_id,
      resource_type: 'ai_routing_request',
      resource_id: request.request_metadata.request_id,
      metadata: {
        use_case: request.healthcare_context.use_case,
        patient_id: request.healthcare_context.patient_id,
        contains_pii: request.healthcare_context.contains_pii,
        is_emergency: request.healthcare_context.is_emergency,
        routing_strategy: request.routing_config.strategy,
        model_category: request.ai_config.model_category,
      },
    });
  }

  /**
   * Audit cache hit
   */
  private async auditCacheHit(request: RoutingRequest, response: RoutingResponse): Promise<void> {
    await this.audit_service.logEvent({
      type: AuditEventType.AI_MODEL_PREDICTION,
      user_id: request.request_metadata.user_id,
      resource_type: 'ai_cache_hit',
      resource_id: request.request_metadata.request_id,
      metadata: {
        use_case: request.healthcare_context.use_case,
        patient_id: request.healthcare_context.patient_id,
        cache_latency_ms: response.metrics.cache_latency_ms,
        cost_saved: 'cache_hit',
      },
    });
  }

  /**
   * Audit successful request completion
   */
  private async auditRequestComplete(
    request: RoutingRequest,
    response: RoutingResponse,
  ): Promise<void> {
    await this.audit_service.logEvent({
      type: AuditEventType.AI_MODEL_PREDICTION,
      user_id: request.request_metadata.user_id,
      resource_type: 'ai_routing_success',
      resource_id: request.request_metadata.request_id,
      metadata: {
        provider_used: response.provider_used,
        model_used: response.model_used,
        total_cost_usd: response.metrics.total_cost_usd,
        total_latency_ms: response.metrics.total_latency_ms,
        tokens_used: response.metrics.tokens_used.total,
        fallback_used: response.metrics.fallback_used,
        pii_redacted: response.compliance.pii_redacted,
        lgpd_compliant: response.compliance.lgpd_compliant,
      },
    });
  }

  /**
   * Audit request error
   */
  private async auditRequestError(
    request: RoutingRequest,
    error: Error,
    start_time: number,
  ): Promise<void> {
    await this.audit_service.logEvent({
      type: AuditEventType.SECURITY_VIOLATION,
      user_id: request.request_metadata.user_id,
      resource_type: 'ai_routing_error',
      resource_id: request.request_metadata.request_id,
      metadata: {
        error_message: error.message,
        error_type: error.constructor.name,
        total_latency_ms: Date.now() - start_time,
        use_case: request.healthcare_context.use_case,
        patient_id: request.healthcare_context.patient_id,
      },
    });
  }

  /**
   * Get provider health status
   */
  getProviderHealth(provider?: AIProvider): ProviderHealthCheck | ProviderHealthCheck[] {
    if (provider) {
      return this.provider_health.get(provider) || {
        provider,
        status: ProviderStatus.UNAVAILABLE,
        latency: Infinity,
        success_rate: 0,
        rate_limit_remaining: 0,
        cost_efficiency: 0,
        last_check: new Date(),
        error_message: 'Provider not found',
      };
    }

    return Array.from(this.provider_health.values());
  }

  /**
   * Get performance metrics for provider
   */
  getProviderMetrics(provider?: AIProvider): AIPerformanceMetrics | AIPerformanceMetrics[] {
    if (provider) {
      return this.performance_metrics.get(provider) || this.createDefaultMetrics();
    }

    return Array.from(this.performance_metrics.values());
  }

  /**
   * Create default performance metrics
   */
  private createDefaultMetrics(): AIPerformanceMetrics {
    return {
      latency: {
        p50: 0,
        p95: 0,
        p99: 0,
        average: 0,
        timeout_rate: 0,
      },
      cost: {
        input_tokens: 0,
        output_tokens: 0,
        total_cost_usd: 0,
        cost_per_request: 0,
        monthly_budget_used: 0,
      },
      quality: {
        cache_hit_rate: 0,
        success_rate: 0,
        error_rate: 0,
      },
      healthcare_compliance: {
        pii_redaction_rate: 0,
        lgpd_compliance_score: 0,
        anvisa_security_score: 0,
        cfm_professional_standards: false,
      },
    };
  }

  /**
   * Enable/disable provider
   */
  setProviderEnabled(provider: AIProvider, enabled: boolean): boolean {
    const config = this.providers.get(provider);
    if (!config) return false;

    config.enabled = enabled;
    console.log(`Provider ${provider} ${enabled ? 'enabled' : 'disabled'}`);
    return true;
  }

  /**
   * Get available providers list
   */
  getAvailableProvidersList(): AIProvider[] {
    return Array.from(this.providers.keys()).filter(provider => {
      const config = this.providers.get(provider);
      const health = this.provider_health.get(provider);
      return config?.enabled && health?.status === ProviderStatus.AVAILABLE;
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.health_check_interval) {
      clearInterval(this.health_check_interval);
    }

    this.providers.clear();
    this.provider_health.clear();
    this.circuit_breakers.clear();
    this.performance_metrics.clear();
    this.request_queue.clear();

    console.log('AI Provider Router Service destroyed');
  }
}

// Export the service and types for external use
export default AIProviderRouterService;
export type { ProviderConfig, ProviderHealthCheck, RoutingRequest, RoutingResponse };
