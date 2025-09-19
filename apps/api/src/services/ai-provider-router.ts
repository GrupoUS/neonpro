/**
 * Multi-Provider AI Routing Service
 * Healthcare platform AI provider management with cost optimization
 * LGPD/ANVISA/CFM compliance for healthcare AI operations
 */

import { 
  AIProvider, 
  AIModelConfig, 
  HealthcareAIUseCase, 
  CostOptimizationStrategy,
  AIPerformanceMetrics,
  AIOptimizationConfig
} from '@neonpro/shared';
import { AuditTrailService } from './audit-trail';
import { SemanticCacheService } from './semantic-cache';

// Provider response interface
interface AIProviderResponse {
  content: string;
  tokens_used: number;
  cost: number;
  latency_ms: number;
  provider: AIProvider;
  model: string;
  quality_score?: number;
  cached: boolean;
}

// Request interface
interface AIRoutingRequest {
  prompt: string;
  patient_id?: string;
  healthcare_context: HealthcareAIUseCase;
  max_cost?: number;
  max_latency_ms?: number;
  min_quality_score?: number;
  require_healthcare_compliant?: boolean;
  emergency?: boolean;
}

// Provider configuration
interface ProviderConfig {
  provider: AIProvider;
  api_key: string;
  base_url?: string;
  models: AIModelConfig[];
  enabled: boolean;
  healthcare_certified: boolean;
  lgpd_compliant: boolean;
  anvisa_approved: boolean;
  cfm_certified: boolean;
  cost_tier: 'budget' | 'standard' | 'premium';
  reliability_score: number; // 0-1
  average_latency_ms: number;
  rate_limit_rpm: number;
  current_load: number; // 0-1
}

// Routing decision criteria
interface RoutingCriteria {
  cost_weight: number; // 0-1
  latency_weight: number; // 0-1
  quality_weight: number; // 0-1
  healthcare_compliance_weight: number; // 0-1
  reliability_weight: number; // 0-1
}

// Provider health status
interface ProviderHealth {
  provider: AIProvider;
  healthy: boolean;
  last_success: Date;
  last_failure: Date;
  consecutive_failures: number;
  average_response_time: number;
  error_rate: number;
  uptime_percentage: number;
}

export class AIProviderRouter {
  private providers: Map<AIProvider, ProviderConfig> = new Map();
  private healthStatus: Map<AIProvider, ProviderHealth> = new Map();
  private routingCriteria: RoutingCriteria;
  private auditService: AuditTrailService;
  private cacheService: SemanticCacheService;
  private performanceMetrics: Map<AIProvider, AIPerformanceMetrics> = new Map();
  private circuitBreakers: Map<AIProvider, { open: boolean; openedAt?: Date }> = new Map();

  constructor(
    auditService: AuditTrailService,
    cacheService: SemanticCacheService,
    routingCriteria?: Partial<RoutingCriteria>
  ) {
    this.auditService = auditService;
    this.cacheService = cacheService;
    
    // Default routing criteria for healthcare
    this.routingCriteria = {
      cost_weight: 0.2,
      latency_weight: 0.3,
      quality_weight: 0.25,
      healthcare_compliance_weight: 0.15,
      reliability_weight: 0.1,
      ...routingCriteria
    };

    this.initializeProviders();
    this.startHealthMonitoring();
  }

  /**
   * Initialize healthcare-certified AI providers
   */
  private initializeProviders(): void {
    // OpenAI - Healthcare compliant configuration
    this.addProvider({
      provider: AIProvider.OPENAI,
      api_key: process.env.OPENAI_API_KEY || '',
      models: [
        {
          provider: AIProvider.OPENAI,
          model_name: 'gpt-4-turbo',
          category: 'chat' as any,
          cost_config: {
            input_cost_per_1k_tokens: 0.01,
            output_cost_per_1k_tokens: 0.03,
            max_tokens: 4096,
            max_monthly_budget: 1000
          },
          performance_config: {
            max_latency_ms: 5000,
            timeout_ms: 30000,
            retry_attempts: 3,
            rate_limit_rpm: 3500
          },
          healthcare_config: {
            pii_redaction_enabled: true,
            lgpd_compliant: true,
            anvisa_approved: true,
            cfm_professional_use: true,
            patient_data_processing: true,
            audit_logging_required: true
          }
        },
        {
          provider: AIProvider.OPENAI,
          model_name: 'gpt-3.5-turbo',
          category: 'chat' as any,
          cost_config: {
            input_cost_per_1k_tokens: 0.0015,
            output_cost_per_1k_tokens: 0.002,
            max_tokens: 4096,
            max_monthly_budget: 500
          },
          performance_config: {
            max_latency_ms: 3000,
            timeout_ms: 20000,
            retry_attempts: 3,
            rate_limit_rpm: 3500
          },
          healthcare_config: {
            pii_redaction_enabled: true,
            lgpd_compliant: true,
            anvisa_approved: true,
            cfm_professional_use: true,
            patient_data_processing: true,
            audit_logging_required: true
          }
        }
      ],
      enabled: true,
      healthcare_certified: true,
      lgpd_compliant: true,
      anvisa_approved: true,
      cfm_certified: true,
      cost_tier: 'standard',
      reliability_score: 0.95,
      average_latency_ms: 2500,
      rate_limit_rpm: 3500,
      current_load: 0.3
    });

    // Anthropic - Claude models
    this.addProvider({
      provider: AIProvider.ANTHROPIC,
      api_key: process.env.ANTHROPIC_API_KEY || '',
      models: [
        {
          provider: AIProvider.ANTHROPIC,
          model_name: 'claude-3-haiku',
          category: 'chat' as any,
          cost_config: {
            input_cost_per_1k_tokens: 0.00025,
            output_cost_per_1k_tokens: 0.00125,
            max_tokens: 4096,
            max_monthly_budget: 300
          },
          performance_config: {
            max_latency_ms: 2000,
            timeout_ms: 15000,
            retry_attempts: 3,
            rate_limit_rpm: 1000
          },
          healthcare_config: {
            pii_redaction_enabled: true,
            lgpd_compliant: true,
            anvisa_approved: true,
            cfm_professional_use: true,
            patient_data_processing: true,
            audit_logging_required: true
          }
        }
      ],
      enabled: true,
      healthcare_certified: true,
      lgpd_compliant: true,
      anvisa_approved: true,
      cfm_certified: true,
      cost_tier: 'budget',
      reliability_score: 0.92,
      average_latency_ms: 1800,
      rate_limit_rpm: 1000,
      current_load: 0.2
    });

    // Google AI
    this.addProvider({
      provider: AIProvider.GOOGLE,
      api_key: process.env.GOOGLE_AI_API_KEY || '',
      models: [
        {
          provider: AIProvider.GOOGLE,
          model_name: 'gemini-pro',
          category: 'chat' as any,
          cost_config: {
            input_cost_per_1k_tokens: 0.0005,
            output_cost_per_1k_tokens: 0.0015,
            max_tokens: 4096,
            max_monthly_budget: 400
          },
          performance_config: {
            max_latency_ms: 3500,
            timeout_ms: 25000,
            retry_attempts: 3,
            rate_limit_rpm: 60
          },
          healthcare_config: {
            pii_redaction_enabled: true,
            lgpd_compliant: true,
            anvisa_approved: false, // Pending certification
            cfm_professional_use: false,
            patient_data_processing: false,
            audit_logging_required: true
          }
        }
      ],
      enabled: true,
      healthcare_certified: false,
      lgpd_compliant: true,
      anvisa_approved: false,
      cfm_certified: false,
      cost_tier: 'budget',
      reliability_score: 0.88,
      average_latency_ms: 3200,
      rate_limit_rpm: 60,
      current_load: 0.1
    });
  }

  /**
   * Add or update provider configuration
   */
  addProvider(config: ProviderConfig): void {
    this.providers.set(config.provider, config);
    
    // Initialize health status
    this.healthStatus.set(config.provider, {
      provider: config.provider,
      healthy: true,
      last_success: new Date(),
      last_failure: new Date(0),
      consecutive_failures: 0,
      average_response_time: config.average_latency_ms,
      error_rate: 0,
      uptime_percentage: 100
    });

    // Initialize circuit breaker
    this.circuitBreakers.set(config.provider, { open: false });

    console.log(`Provider ${config.provider} added to routing pool`);
  }

  /**
   * Route AI request to optimal provider
   */
  async routeRequest(request: AIRoutingRequest): Promise<AIProviderResponse> {
    const startTime = Date.now();

    try {
      // Audit request
      await this.auditService.logAIRoutingRequest({
        patient_id: request.patient_id,
        healthcare_context: request.healthcare_context,
        emergency: request.emergency || false,
        timestamp: new Date()
      });

      // Check semantic cache first
      if (request.patient_id) {
        const cachedResponse = await this.cacheService.findSimilarEntry(
          request.prompt,
          {
            patientId: request.patient_id,
            isEmergency: request.emergency || false,
            containsUrgentSymptoms: request.emergency || false,
            requiredCompliance: []
          } as any
        );

        if (cachedResponse) {
          return {
            content: cachedResponse.response,
            tokens_used: 0,
            cost: 0,
            latency_ms: Date.now() - startTime,
            provider: AIProvider.LOCAL,
            model: 'semantic-cache',
            cached: true
          };
        }
      }

      // Select optimal provider
      const selectedProvider = await this.selectOptimalProvider(request);
      if (!selectedProvider) {
        throw new Error('No suitable AI provider available');
      }

      // Make request to selected provider
      const response = await this.makeProviderRequest(selectedProvider, request);

      // Cache response if applicable
      if (request.patient_id && !request.emergency) {
        await this.cacheService.addEntry(
          request.prompt,
          response.content,
          {
            patientId: request.patient_id,
            cost: response.cost,
            provider: response.provider,
            model: response.model,
            healthcare_context: request.healthcare_context,
            ttlMs: this.getCacheTTL(request.healthcare_context)
          } as any
        );
      }

      // Update provider metrics
      await this.updateProviderMetrics(selectedProvider.provider, response, true);

      // Audit successful response
      await this.auditService.logAIProviderResponse({
        patient_id: request.patient_id,
        provider: response.provider,
        model: response.model,
        cost: response.cost,
        tokens_used: response.tokens_used,
        latency_ms: response.latency_ms,
        cached: response.cached,
        success: true,
        timestamp: new Date()
      });

      return response;

    } catch (error) {
      const latency = Date.now() - startTime;
      
      // Audit failed request
      await this.auditService.logAIProviderError({
        patient_id: request.patient_id,
        error_message: (error as Error).message,
        latency_ms: latency,
        timestamp: new Date()
      });

      console.error('AI routing failed:', error);
      throw error;
    }
  }

  /**
   * Select optimal provider based on criteria
   */
  private async selectOptimalProvider(request: AIRoutingRequest): Promise<ProviderConfig | null> {
    const availableProviders = this.getAvailableProviders(request);
    
    if (availableProviders.length === 0) {
      return null;
    }

    // Emergency requests always use fastest, most reliable provider
    if (request.emergency) {
      return availableProviders
        .filter(p => p.healthcare_certified)
        .sort((a, b) => a.average_latency_ms - b.average_latency_ms)[0] || null;
    }

    // Calculate scores for each provider
    const scores = availableProviders.map(provider => ({
      provider,
      score: this.calculateProviderScore(provider, request)
    }));

    // Sort by score (highest first)
    scores.sort((a, b) => b.score - a.score);

    return scores[0]?.provider || null;
  }

  /**
   * Get available providers for request
   */
  private getAvailableProviders(request: AIRoutingRequest): ProviderConfig[] {
    return Array.from(this.providers.values()).filter(provider => {
      // Must be enabled
      if (!provider.enabled) return false;

      // Circuit breaker check
      const circuitBreaker = this.circuitBreakers.get(provider.provider);
      if (circuitBreaker?.open) {
        // Check if we should try to close the circuit breaker
        if (circuitBreaker.openedAt && 
            Date.now() - circuitBreaker.openedAt.getTime() > 60000) { // 1 minute
          circuitBreaker.open = false;
          delete circuitBreaker.openedAt;
        } else {
          return false;
        }
      }

      // Health check
      const health = this.healthStatus.get(provider.provider);
      if (!health?.healthy) return false;

      // Healthcare compliance requirements
      if (request.require_healthcare_compliant && !provider.healthcare_certified) {
        return false;
      }

      // Patient data processing requirements
      if (request.patient_id) {
        const hasPatientCapableModel = provider.models.some(
          model => model.healthcare_config.patient_data_processing
        );
        if (!hasPatientCapableModel) return false;
      }

      // LGPD compliance is mandatory for Brazilian healthcare
      if (!provider.lgpd_compliant) return false;

      return true;
    });
  }

  /**
   * Calculate provider score based on routing criteria
   */
  private calculateProviderScore(provider: ProviderConfig, request: AIRoutingRequest): number {
    const criteria = this.routingCriteria;
    let score = 0;

    // Cost score (lower cost = higher score)
    const avgCost = this.getAverageModelCost(provider);
    const costScore = Math.max(0, 1 - (avgCost / 0.05)); // Normalize to 0.05 as max
    score += costScore * criteria.cost_weight;

    // Latency score (lower latency = higher score)
    const latencyScore = Math.max(0, 1 - (provider.average_latency_ms / 10000)); // Normalize to 10s
    score += latencyScore * criteria.latency_weight;

    // Quality score (reliability as proxy)
    score += provider.reliability_score * criteria.quality_weight;

    // Healthcare compliance score
    let complianceScore = 0;
    if (provider.healthcare_certified) complianceScore += 0.3;
    if (provider.lgpd_compliant) complianceScore += 0.3;
    if (provider.anvisa_approved) complianceScore += 0.2;
    if (provider.cfm_certified) complianceScore += 0.2;
    score += complianceScore * criteria.healthcare_compliance_weight;

    // Reliability score
    const health = this.healthStatus.get(provider.provider);
    const reliabilityScore = health ? (health.uptime_percentage / 100) : 0.5;
    score += reliabilityScore * criteria.reliability_weight;

    // Load balancing penalty
    score *= (1 - provider.current_load * 0.5);

    return score;
  }

  /**
   * Get average cost for provider models
   */
  private getAverageModelCost(provider: ProviderConfig): number {
    if (provider.models.length === 0) return 0;
    
    const totalCost = provider.models.reduce((sum, model) => {
      return sum + model.cost_config.input_cost_per_1k_tokens + model.cost_config.output_cost_per_1k_tokens;
    }, 0);
    
    return totalCost / provider.models.length;
  }

  /**
   * Make request to selected provider
   */
  private async makeProviderRequest(
    provider: ProviderConfig, 
    request: AIRoutingRequest
  ): Promise<AIProviderResponse> {
    const startTime = Date.now();

    try {
      // Select best model for this provider
      const model = this.selectModelForRequest(provider, request);
      if (!model) {
        throw new Error(`No suitable model found for provider ${provider.provider}`);
      }

      // Mock AI request - in production, implement actual provider APIs
      const response = await this.mockProviderRequest(provider, model, request);

      const latency = Date.now() - startTime;

      // Update provider health
      await this.updateProviderHealth(provider.provider, true, latency);

      return {
        ...response,
        latency_ms: latency,
        cached: false
      };

    } catch (error) {
      const latency = Date.now() - startTime;
      
      // Update provider health
      await this.updateProviderHealth(provider.provider, false, latency);
      
      throw error;
    }
  }

  /**
   * Select best model for request
   */
  private selectModelForRequest(provider: ProviderConfig, request: AIRoutingRequest): AIModelConfig | null {
    const eligibleModels = provider.models.filter(model => {
      // Patient data processing check
      if (request.patient_id && !model.healthcare_config.patient_data_processing) {
        return false;
      }

      // Cost constraint
      if (request.max_cost) {
        const estimatedCost = (model.cost_config.input_cost_per_1k_tokens + 
                             model.cost_config.output_cost_per_1k_tokens) * 2; // Rough estimate
        if (estimatedCost > request.max_cost) return false;
      }

      // Latency constraint
      if (request.max_latency_ms && model.performance_config.max_latency_ms > request.max_latency_ms) {
        return false;
      }

      return true;
    });

    if (eligibleModels.length === 0) return null;

    // Select model with best cost/performance ratio
    return eligibleModels.sort((a, b) => {
      const aCost = a.cost_config.input_cost_per_1k_tokens + a.cost_config.output_cost_per_1k_tokens;
      const bCost = b.cost_config.input_cost_per_1k_tokens + b.cost_config.output_cost_per_1k_tokens;
      const aLatency = a.performance_config.max_latency_ms;
      const bLatency = b.performance_config.max_latency_ms;
      
      // Prioritize lower cost and latency
      const aScore = aCost + (aLatency / 1000);
      const bScore = bCost + (bLatency / 1000);
      
      return aScore - bScore;
    })[0];
  }

  /**
   * Mock provider request (replace with actual implementations)
   */
  private async mockProviderRequest(
    provider: ProviderConfig,
    model: AIModelConfig,
    request: AIRoutingRequest
  ): Promise<Omit<AIProviderResponse, 'latency_ms' | 'cached'>> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // Mock response based on healthcare context
    let response = '';
    switch (request.healthcare_context) {
      case HealthcareAIUseCase.PATIENT_COMMUNICATION:
        response = 'Olá! Como posso ajudá-lo hoje? Estou aqui para esclarecer suas dúvidas sobre saúde.';
        break;
      case HealthcareAIUseCase.APPOINTMENT_SCHEDULING:
        response = 'Vou verificar os horários disponíveis para sua consulta. Qual especialidade você precisa?';
        break;
      case HealthcareAIUseCase.SYMPTOMS_ANALYSIS:
        response = 'Com base nos sintomas descritos, recomendo agendar uma consulta médica para avaliação adequada.';
        break;
      default:
        response = 'Resposta gerada pelo sistema de IA para contexto de saúde.';
    }

    // Calculate costs
    const inputTokens = Math.ceil(request.prompt.length / 4); // Rough token estimate
    const outputTokens = Math.ceil(response.length / 4);
    const cost = (inputTokens / 1000) * model.cost_config.input_cost_per_1k_tokens +
                 (outputTokens / 1000) * model.cost_config.output_cost_per_1k_tokens;

    return {
      content: response,
      tokens_used: inputTokens + outputTokens,
      cost: cost,
      provider: provider.provider,
      model: model.model_name,
      quality_score: 0.85 + Math.random() * 0.15 // Mock quality score
    };
  }

  /**
   * Update provider health status
   */
  private async updateProviderHealth(provider: AIProvider, success: boolean, latency: number): Promise<void> {
    const health = this.healthStatus.get(provider);
    if (!health) return;

    const now = new Date();

    if (success) {
      health.last_success = now;
      health.consecutive_failures = 0;
      health.healthy = true;
      
      // Update average response time (exponential moving average)
      health.average_response_time = health.average_response_time * 0.9 + latency * 0.1;
      
      // Close circuit breaker if it was open
      const circuitBreaker = this.circuitBreakers.get(provider);
      if (circuitBreaker?.open) {
        circuitBreaker.open = false;
        delete circuitBreaker.openedAt;
        console.log(`Circuit breaker closed for provider ${provider}`);
      }
    } else {
      health.last_failure = now;
      health.consecutive_failures++;
      
      // Mark unhealthy after 3 consecutive failures
      if (health.consecutive_failures >= 3) {
        health.healthy = false;
        
        // Open circuit breaker after 5 consecutive failures
        if (health.consecutive_failures >= 5) {
          const circuitBreaker = this.circuitBreakers.get(provider);
          if (circuitBreaker && !circuitBreaker.open) {
            circuitBreaker.open = true;
            circuitBreaker.openedAt = now;
            console.log(`Circuit breaker opened for provider ${provider}`);
          }
        }
      }
    }

    // Update error rate
    const totalRequests = health.consecutive_failures + 1;
    health.error_rate = health.consecutive_failures / totalRequests;
    
    // Update uptime percentage (simplified calculation)
    const hoursSinceLastFailure = (now.getTime() - health.last_failure.getTime()) / (1000 * 60 * 60);
    health.uptime_percentage = Math.min(100, 95 + hoursSinceLastFailure);

    this.healthStatus.set(provider, health);
  }

  /**
   * Update provider performance metrics
   */
  private async updateProviderMetrics(
    provider: AIProvider, 
    response: AIProviderResponse, 
    success: boolean
  ): Promise<void> {
    // Implementation would update detailed metrics
    console.log(`Metrics updated for ${provider}: ${success ? 'success' : 'failure'}`);
  }

  /**
   * Get cache TTL based on healthcare context
   */
  private getCacheTTL(context: HealthcareAIUseCase): number {
    switch (context) {
      case HealthcareAIUseCase.PATIENT_COMMUNICATION:
        return 4 * 60 * 60 * 1000; // 4 hours
      case HealthcareAIUseCase.APPOINTMENT_SCHEDULING:
        return 1 * 60 * 60 * 1000; // 1 hour
      case HealthcareAIUseCase.SYMPTOMS_ANALYSIS:
        return 30 * 60 * 1000; // 30 minutes
      case HealthcareAIUseCase.TREATMENT_PLANNING:
        return 24 * 60 * 60 * 1000; // 24 hours
      default:
        return 2 * 60 * 60 * 1000; // 2 hours
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthChecks();
    }, 60000); // Every minute
  }

  /**
   * Perform health checks on all providers
   */
  private async performHealthChecks(): Promise<void> {
    for (const [provider, config] of this.providers.entries()) {
      if (!config.enabled) continue;

      try {
        // Mock health check - in production, make actual health check requests
        const healthy = Math.random() > 0.05; // 95% uptime simulation
        
        if (!healthy) {
          await this.updateProviderHealth(provider, false, 0);
        }
      } catch (error) {
        await this.updateProviderHealth(provider, false, 0);
      }
    }
  }

  /**
   * Get provider statistics
   */
  getProviderStats(): {
    providers: Array<{
      provider: AIProvider;
      enabled: boolean;
      healthy: boolean;
      healthcare_certified: boolean;
      current_load: number;
      average_latency_ms: number;
      error_rate: number;
      uptime_percentage: number;
    }>;
    total_requests: number;
    total_cost: number;
    average_latency: number;
  } {
    const providers = Array.from(this.providers.entries()).map(([provider, config]) => {
      const health = this.healthStatus.get(provider);
      return {
        provider,
        enabled: config.enabled,
        healthy: health?.healthy || false,
        healthcare_certified: config.healthcare_certified,
        current_load: config.current_load,
        average_latency_ms: config.average_latency_ms,
        error_rate: health?.error_rate || 0,
        uptime_percentage: health?.uptime_percentage || 0
      };
    });

    return {
      providers,
      total_requests: 0, // Would be tracked in production
      total_cost: 0, // Would be tracked in production
      average_latency: 0 // Would be calculated in production
    };
  }

  /**
   * Update routing criteria
   */
  updateRoutingCriteria(criteria: Partial<RoutingCriteria>): void {
    this.routingCriteria = { ...this.routingCriteria, ...criteria };
    console.log('Routing criteria updated:', this.routingCriteria);
  }

  /**
   * Enable/disable provider
   */
  setProviderEnabled(provider: AIProvider, enabled: boolean): void {
    const config = this.providers.get(provider);
    if (config) {
      config.enabled = enabled;
      this.providers.set(provider, config);
      console.log(`Provider ${provider} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Get detailed health status
   */
  getHealthStatus(): Map<AIProvider, ProviderHealth> {
    return new Map(this.healthStatus);
  }

  /**
   * Force circuit breaker reset
   */
  resetCircuitBreaker(provider: AIProvider): void {
    const circuitBreaker = this.circuitBreakers.get(provider);
    if (circuitBreaker) {
      circuitBreaker.open = false;
      delete circuitBreaker.openedAt;
      console.log(`Circuit breaker manually reset for provider ${provider}`);
    }
  }
}