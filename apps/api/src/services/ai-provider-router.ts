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
  AIProviderOpt,
  HealthcareAIOptimizationUtils,
  HealthcareAIUseCase,
  HealthcareDataClassification,
  LGPDDataCategory,
} from "@neonpro/shared";
import { AuditTrailService } from "./audit-trail";
import { SemanticCacheService } from "./semantic-cache";

// Import modular components
import { ProviderConfigManager } from "./ai-provider/config";
import { ProviderHealthMonitor } from "./ai-provider/health-check";
import { AISecurityManager } from "./ai-provider/security";
import {
  ProviderConfig,
  ProviderHealthCheck,
  ProviderStatus,
  RoutingRequest,
  RoutingResponse,
  RoutingStrategy,
} from "./ai-provider/types";

// ============================================================================
// AI Provider Router Service
// ============================================================================

export class AIProviderRouterService {
  private semantic_cache: SemanticCacheService;
  private audit_service: AuditTrailService;
  private health_check_interval?: NodeJS.Timeout;
  private request_queue: Map<string, Promise<RoutingResponse>> = new Map();
  private performance_metrics: Map<AIProvider, AIPerformanceMetrics> =
    new Map();

  // Modular components
  private config_manager: ProviderConfigManager;
  private health_monitor: ProviderHealthMonitor;
  private security_manager: AISecurityManager;

  constructor(
    semantic_cache: SemanticCacheService,
    audit_service: AuditTrailService,
    provider_configs: ProviderConfig[] = [],
  ) {
    this.semantic_cache = semantic_cache;
    this.audit_service = audit_service;

    // Initialize modular components
    this.config_manager = new ProviderConfigManager();
    this.health_monitor = new ProviderHealthMonitor();
    this.security_manager = new AISecurityManager(audit_service);

    // Initialize providers
    this.config_manager.initializeProviders(provider_configs);

    // Initialize health monitoring for each provider
    provider_configs.forEach((config) => {
      this.health_monitor.initializeProviderHealth(config.provider, config);
      this.initializeProviderMetrics(config.provider);
    });

    // Add default healthcare-compliant providers if none provided
    if (provider_configs.length === 0) {
      this.config_manager.initializeDefaultProviders();
      // Initialize health for default providers
      const default_configs = this.config_manager.getAllProviderConfigs();
      default_configs.forEach((config) => {
        this.health_monitor.initializeProviderHealth(config.provider, config);
        this.initializeProviderMetrics(config.provider);
      });
    }

    // Start health checking
    this.startHealthChecking();
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
  async routeRequest(_request: RoutingRequest): Promise<RoutingResponse> {
    const start_time = Date.now();

    try {
      // 🔒 SECURITY: Validate and sanitize request
      const validated_request =
        this.security_manager.validateAndSanitizeRequest(request);

      // 🚨 HEALTHCARE: Check emergency bypass conditions
      if (validated_request.healthcare_context.is_emergency) {
        return await this.handleEmergencyRequest(validated_request, start_time);
      }

      // 🔒 LGPD: Audit request initiation
      await this.security_manager.auditRequestStart(validated_request);

      // Check semantic cache first (if enabled)
      if (validated_request.ai_config.cache_enabled) {
        const cache_result = await this.checkSemanticCache(validated_request);
        if (cache_result) {
          await this.security_manager.auditCacheHit(
            validated_request,
            cache_result.metrics.cache_latency_ms || 0,
          );
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
        validated_request.ai_config.cache_enabled &&
        this.shouldCacheResponse(validated_request, response)
      ) {
        await this.cacheResponse(validated_request, response);
      }

      // 🔒 LGPD: Audit successful completion
      await this.security_manager.auditRequestComplete(
        validated_request,
        response.provider_used,
        response.model_used,
        response.metrics,
        response.compliance,
      );

      return response;
    } catch (error) {
      await this.security_manager.auditRequestError(
        request,
        error as Error,
        Date.now() - start_time,
      );
      throw error;
    }
  }

  /**
   * 🚨 EMERGENCY: Handle emergency requests with special routing
   */
  private async handleEmergencyRequest(
    _request: RoutingRequest,
    start_time: number,
  ): Promise<RoutingResponse> {
    const all_configs = this.config_manager.getAllProviderConfigs();
    const emergency_providers =
      this.health_monitor.getEmergencyCapableProviders(all_configs);

    if (emergency_providers.length === 0) {
      throw new Error("No emergency-capable providers available");
    }

    // Sort by latency for fastest response
    emergency_providers.sort((a, _b) => {
      const health_a = this.health_monitor.getProviderHealth(
        a.provider,
      ) as ProviderHealthCheck;
      const health_b = this.health_monitor.getProviderHealth(
        b.provider,
      ) as ProviderHealthCheck;
      return (health_a?.latency || Infinity) - (health_b?.latency || Infinity);
    });

    const selected_provider = emergency_providers[0];

    // Audit emergency access
    await this.security_manager.auditEmergencyAccess(
      request.request_metadata.user_id,
      request.request_metadata.request_id,
      selected_provider.provider,
      request.healthcare_context,
    );

    return await this.executeProviderRequest(
      request,
      selected_provider,
      start_time,
    );
  }

  /**
   * Select optimal provider based on routing strategy and constraints
   */
  private async selectProvider(
    _request: RoutingRequest,
  ): Promise<ProviderConfig> {
    const available_providers = this.getAvailableProviders(request);

    if (available_providers.length === 0) {
      throw new Error("No available providers for this request");
    }

    switch (request.routing_config.strategy) {
      case RoutingStrategy.COST_OPTIMIZED:
        return this.selectCostOptimizedProvider(available_providers, _request);

      case RoutingStrategy.LATENCY_OPTIMIZED:
        return this.selectLatencyOptimizedProvider(
          available_providers,
          request,
        );

      case RoutingStrategy.QUALITY_OPTIMIZED:
        return this.selectQualityOptimizedProvider(
          available_providers,
          request,
        );

      case RoutingStrategy.HEALTHCARE_SPECIFIC:
        return this.selectHealthcareSpecificProvider(
          available_providers,
          request,
        );

      case RoutingStrategy.EMERGENCY_PRIORITY:
        return this.selectEmergencyProvider(available_providers, _request);

      case RoutingStrategy.LOAD_BALANCED:
        return this.selectLoadBalancedProvider(available_providers, _request);

      default:
        return available_providers[0]; // Default to first available
    }
  }

  /**
   * Get providers available for healthcare context
   */
  private getAvailableProviders(_request: RoutingRequest): ProviderConfig[] {
    const all_configs = this.config_manager.getAllProviderConfigs();
    const providers: ProviderConfig[] = [];

    for (const config of all_configs) {
      // Check if provider is enabled
      if (!config.enabled) continue;

      // Check healthcare compliance requirements
      if (
        !this.security_manager.isHealthcareCompliant(
          config,
          request.healthcare_context,
        )
      ) {
        continue;
      }

      // Check provider health via health monitor
      if (!this.health_monitor.isProviderAvailable(config.provider)) {
        continue;
      }

      // Check cost constraints
      if (request.routing_config.max_cost_usd) {
        const estimated_cost = this.estimateProviderCost(config, _request);
        if (estimated_cost > request.routing_config.max_cost_usd) {
          continue;
        }
      }

      // Check preferred providers
      if (
        request.ai_config.preferred_providers &&
        request.ai_config.preferred_providers.length > 0
      ) {
        if (!request.ai_config.preferred_providers.includes(config.provider)) {
          continue;
        }
      }

      providers.push(config);
    }

    return providers;
  }

  /**
   * Estimate cost for provider request
   */
  private estimateProviderCost(
    provider: ProviderConfig,
    _request: RoutingRequest,
  ): number {
    // Get the best model for this request
    const model = this.selectBestModelForProvider(provider, _request);
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
    _request: RoutingRequest,
  ): ProviderConfig {
    let best_provider = providers[0];
    let lowest_cost = this.estimateProviderCost(best_provider, _request);

    for (const provider of providers.slice(1)) {
      const cost = this.estimateProviderCost(provider, _request);
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
    _request: RoutingRequest,
  ): ProviderConfig {
    let best_provider = providers[0];
    let lowest_latency =
      (
        this.health_monitor.getProviderHealth(
          best_provider.provider,
        ) as ProviderHealthCheck
      )?.latency || Infinity;

    for (const provider of providers.slice(1)) {
      const latency =
        (
          this.health_monitor.getProviderHealth(
            provider.provider,
          ) as ProviderHealthCheck
        )?.latency || Infinity;
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
    _request: RoutingRequest,
  ): ProviderConfig {
    let best_provider = providers[0];
    let best_quality =
      (
        this.health_monitor.getProviderHealth(
          best_provider.provider,
        ) as ProviderHealthCheck
      )?.success_rate || 0;

    for (const provider of providers.slice(1)) {
      const quality =
        (
          this.health_monitor.getProviderHealth(
            provider.provider,
          ) as ProviderHealthCheck
        )?.success_rate || 0;
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
    _request: RoutingRequest,
  ): ProviderConfig {
    // Healthcare-specific scoring based on use case and compliance
    let best_provider = providers[0];
    let best_score = this.calculateHealthcareScore(best_provider, _request);

    for (const provider of providers.slice(1)) {
      const score = this.calculateHealthcareScore(provider, _request);
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
  private selectBestProvider(
    providers: ProviderConfig[],
    _request: RoutingRequest,
  ): ProviderConfig {
    // For emergency, prioritize fastest response with highest compliance
    return this.selectLatencyOptimizedProvider(
      providers.filter(
        (p) =>
          p.healthcare_compliance.lgpd_approved &&
          p.healthcare_compliance.anvisa_certified,
      ),
      request,
    );
  }

  /**
   * Select load-balanced provider
   */
  private selectLoadBalancedProvider(
    providers: ProviderConfig[],
    _request: RoutingRequest,
  ): ProviderConfig {
    // Simple round-robin based on current health metrics
    const sorted_providers = providers.sort((a, _b) => {
      const health_a = this.health_monitor.getProviderHealth(
        a.provider,
      ) as ProviderHealthCheck;
      const health_b = this.health_monitor.getProviderHealth(
        b.provider,
      ) as ProviderHealthCheck;

      // Sort by success rate and inverse latency
      const score_a =
        (health_a?.success_rate || 0) - (health_a?.latency || 1000) / 1000;
      const score_b =
        (health_b?.success_rate || 0) - (health_b?.latency || 1000) / 1000;

      return score_b - score_a;
    });

    return sorted_providers[0];
  }

  /**
   * Calculate healthcare-specific provider score
   */
  private calculateHealthcareScore(
    provider: ProviderConfig,
    _request: RoutingRequest,
  ): number {
    let score = 0;

    // Compliance score (40% weight)
    if (provider.healthcare_compliance.lgpd_approved) score += 20;
    if (provider.healthcare_compliance.anvisa_certified) score += 10;
    if (provider.healthcare_compliance.cfm_approved) score += 10;

    // Performance score (30% weight)
    const health = this.health_monitor.getProviderHealth(
      provider.provider,
    ) as ProviderHealthCheck;
    if (health) {
      score += (health.success_rate / 100) * 15;
      score += Math.max(0, (1000 - health.latency) / 1000) * 15;
    }

    // Cost efficiency score (20% weight)
    const cost = this.estimateProviderCost(provider, _request);
    score += Math.max(0, (0.1 - cost) / 0.1) * 20;

    // Use case specific bonus (10% weight)
    score += this.getUseCaseBonus(
      provider,
      request.healthcare_context.use_case,
    );

    return score;
  }

  /**
   * Get use case specific bonus points
   */
  private getUseCaseBonus(
    provider: ProviderConfig,
    use_case: HealthcareAIUseCase,
  ): number {
    // Provider-specific bonuses for different use cases
    const bonuses: Record<
      AIProvider,
      Partial<Record<HealthcareAIUseCase, number>>
    > = {
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
    _request: RoutingRequest,
    provider: ProviderConfig,
    start_time: number,
  ): Promise<RoutingResponse> {
    const providers_to_try = [provider];

    // Add fallback providers if enabled
    if (request.ai_config.fallback_enabled) {
      const fallback_providers = this.getAvailableProviders(request)
        .filter((p) => p.provider !== provider.provider)
        .slice(0, 2); // Maximum 2 fallback providers

      providers_to_try.push(...fallback_providers);
    }

    let last_error: Error | null = null;
    let fallback_used = false;

    for (let i = 0; i < providers_to_try.length; i++) {
      const current_provider = providers_to_try[i];

      if (i > 0) {
        fallback_used = true;
        await this.security_manager.auditProviderFallback(
          request.request_metadata.user_id,
          request.request_metadata.request_id,
          provider.provider,
          current_provider.provider,
          i + 1,
        );
      }

      try {
        const model = this.selectBestModelForProvider(
          current_provider,
          request,
        );
        if (!model) {
          throw new Error(
            `No suitable model for provider ${current_provider.provider}`,
          );
        }

        const response = await this.callProviderAPI(
          current_provider,
          model,
          request,
        );

        // Update circuit breaker on success
        this.health_monitor.recordSuccess(current_provider.provider);

        // Update provider health
        await this.health_monitor.updateProviderHealth(
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
        this.health_monitor.recordFailure(current_provider.provider);

        // Update provider health
        await this.health_monitor.updateProviderHealth(
          current_provider.provider,
          false,
          Date.now() - start_time,
        );

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
    _request: RoutingRequest,
  ): AIModelConfig | null {
    const eligible_models = provider.models.filter((model) => {
      // Check model category
      if (model.category !== request.ai_config.model_category) {
        return false;
      }

      // Check healthcare compliance
      if (
        request.healthcare_context.contains_pii &&
        !model.healthcare_config.patient_data_processing
      ) {
        return false;
      }

      // Check cost constraints
      if (request.routing_config.max_cost_usd) {
        const estimated_cost = this.estimateModelCost(model, _request);
        if (estimated_cost > request.routing_config.max_cost_usd) {
          return false;
        }
      }

      // Check latency constraints
      if (
        request.routing_config.max_latency_ms &&
        model.performance_config.max_latency_ms >
          request.routing_config.max_latency_ms
      ) {
        return false;
      }

      return true;
    });

    if (eligible_models.length === 0) return null;

    // Select best model based on cost-performance ratio
    return eligible_models.sort((a, _b) => {
      const cost_a = this.estimateModelCost(a, _request);
      const cost_b = this.estimateModelCost(b, _request);
      const latency_a = a.performance_config.max_latency_ms;
      const latency_b = b.performance_config.max_latency_ms;

      // Score: lower cost and latency is better
      const score_a = cost_a + latency_a / 1000;
      const score_b = cost_b + latency_b / 1000;

      return score_a - score_b;
    })[0];
  }

  /**
   * Estimate cost for specific model
   */
  private estimateModelCost(
    model: AIModelConfig,
    _request: RoutingRequest,
  ): number {
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
    _request: RoutingRequest,
  ): Promise<RoutingResponse> {
    const api_start = Date.now();

    // Simulate API call latency
    const latency_simulation = Math.random() * 1000 + 500;
    await new Promise((resolve) => setTimeout(resolve, latency_simulation));

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
  private generateMockResponse(
    use_case: HealthcareAIUseCase,
    _prompt: string,
  ): string {
    const responses: Record<HealthcareAIUseCase, string> = {
      [HealthcareAIUseCase.PATIENT_COMMUNICATION]:
        "Olá! Entendo sua preocupação. Com base nas informações fornecidas, recomendo que você consulte um profissional de saúde para uma avaliação adequada. Este sistema segue todas as diretrizes LGPD e CFM.",
      [HealthcareAIUseCase.APPOINTMENT_SCHEDULING]:
        "Verificando disponibilidade de horários... Encontrei os seguintes horários disponíveis para consulta: Segunda-feira às 14h, Terça-feira às 10h, ou Quinta-feira às 16h. Qual prefere?",
      [HealthcareAIUseCase.SYMPTOMS_ANALYSIS]:
        "Com base nos sintomas relatados, é importante procurar avaliação médica presencial. Não posso fornecer diagnósticos, mas posso ajudar a organizar as informações para sua consulta.",
      [HealthcareAIUseCase.TREATMENT_PLANNING]:
        "Para um plano de tratamento adequado, é necessária avaliação médica presencial. Posso ajudar a compilar informações relevantes para discussão com seu médico.",
      [HealthcareAIUseCase.DOCUMENTATION]:
        "Documento gerado conforme padrões CFM e LGPD. Todas as informações foram processadas de forma segura e em conformidade com as regulamentações brasileiras de saúde.",
      [HealthcareAIUseCase.COMPLIANCE_CHECK]:
        "Verificação de conformidade realizada. Processo em compliance com LGPD, ANVISA e diretrizes CFM. Todas as medidas de proteção de dados foram aplicadas.",
      [HealthcareAIUseCase.MEDICAL_TRANSCRIPTION]:
        "Transcrição médica realizada seguindo padrões de confidencialidade e proteção de dados. Informações sensíveis foram adequadamente protegidas.",
      [HealthcareAIUseCase.PATIENT_EDUCATION]:
        "Material educativo gerado com base em evidências científicas e diretrizes médicas brasileiras. Recomendo sempre consultar profissionais de saúde para orientações específicas.",
    };

    return (
      responses[use_case] ||
      "Resposta gerada pelo sistema de IA para contexto de saúde, em conformidade com LGPD e regulamentações brasileiras."
    );
  }

  /**
   * Check semantic cache for similar requests
   */
  private async checkSemanticCache(
    _request: RoutingRequest,
  ): Promise<RoutingResponse | null> {
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
          model_used: "semantic-cache",
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
      console.warn("Cache lookup failed:", error);
    }

    return null;
  }

  /**
   * Cache successful response
   */
  private async cacheResponse(
    _request: RoutingRequest,
    response: RoutingResponse,
  ): Promise<void> {
    if (
      !request.healthcare_context.patient_id ||
      request.healthcare_context.is_emergency
    ) {
      return; // Don't cache emergency data
    }

    try {
      await this.semantic_cache.addEntry(request.prompt, response.content, {
        patientId: request.healthcare_context.patient_id,
        cost: response.metrics.total_cost_usd,
        provider: response.provider_used,
        model: response.model_used,
        healthcare_context: request.healthcare_context.use_case,
        ttlMs: this.getCacheTTLForUseCase(request.healthcare_context.use_case),
        compliance: [],
      } as any);
    } catch (error) {
      console.warn("Failed to cache response:", error);
    }
  }

  /**
   * Determine if response should be cached
   */
  private shouldCacheResponse(
    _request: RoutingRequest,
    response: RoutingResponse,
  ): boolean {
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
    if (response.metrics.total_cost_usd > 0.1) {
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
    const all_configs = this.config_manager.getAllProviderConfigs();
    const health_promises = all_configs.map(async (config) => {
      await this.health_monitor.performProviderHealthCheck(
        config.provider,
        config,
      );
    });

    await Promise.all(health_promises);
  }

  /**
   * Get provider health status
   */
  getProviderHealth(
    provider?: AIProvider,
  ): ProviderHealthCheck | ProviderHealthCheck[] {
    return this.health_monitor.getProviderHealth(provider);
  }

  /**
   * Get performance metrics for provider
   */
  getProviderMetrics(
    provider?: AIProvider,
  ): AIPerformanceMetrics | AIPerformanceMetrics[] {
    if (provider) {
      return (
        this.performance_metrics.get(provider) || this.createDefaultMetrics()
      );
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
        user_satisfaction: 4.5,
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
    return this.config_manager.setProviderEnabled(provider, enabled);
  }

  /**
   * Get available providers list
   */
  getAvailableProvidersList(): AIProvider[] {
    const enabled_configs = this.config_manager.getEnabledProviders();
    return enabled_configs
      .map((config) => config.provider)
      .filter((provider) => {
        return this.health_monitor.isProviderAvailable(provider);
      });
  }

  /**
   * Add or update provider configuration
   */
  addProviderConfig(config: ProviderConfig): void {
    this.config_manager.addProviderConfig(config);
    this.health_monitor.initializeProviderHealth(config.provider, config);
    this.initializeProviderMetrics(config.provider);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.health_check_interval) {
      clearInterval(this.health_check_interval);
    }

    this.health_monitor.destroy();
    this.performance_metrics.clear();
    this.request_queue.clear();
  }
}

// Export the service and types for external use
export default AIProviderRouterService;
export type {
  ProviderConfig,
  ProviderHealthCheck,
  RoutingRequest,
  RoutingResponse,
};
