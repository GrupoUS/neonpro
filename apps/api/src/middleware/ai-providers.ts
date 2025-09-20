/**
 * AI Provider Integrations Middleware (T072)
 * Multi-model AI provider management with load balancing and failover
 *
 * Features:
 * - Multi-model AI provider management (OpenAI, Anthropic, Google, local models)
 * - Load balancing and failover between AI providers
 * - Rate limiting and cost optimization
 * - Brazilian healthcare context injection for all AI requests
 * - Integration with completed AI chat endpoint (T051)
 */

import { Context, Next } from 'hono';
import { z } from 'zod';

// AI Provider types
export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  LOCAL = 'local',
}

// AI Model configuration
const aiModelSchema = z.object({
  id: z.string(),
  provider: z.nativeEnum(AIProvider),
  name: z.string(),
  description: z.string(),
  maxTokens: z.number().positive(),
  costPerToken: z.number().min(0),
  healthcareOptimized: z.boolean().default(false),
  supportsBrazilianPortuguese: z.boolean().default(false),
  supportsStreaming: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  priority: z.number().min(1).max(10).default(5),
});

export type AIModel = z.infer<typeof aiModelSchema>;

// Provider health status
interface ProviderHealth {
  provider: AIProvider;
  isHealthy: boolean;
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  requestCount: number;
  successCount: number;
  failureCount: number;
}

// Request metrics
interface RequestMetrics {
  provider: AIProvider;
  model: string;
  requestId: string;
  startTime: Date;
  endTime?: Date;
  responseTime?: number;
  tokenCount?: number;
  cost?: number;
  success: boolean;
  error?: string;
}

// Brazilian healthcare context
const healthcareContextSchema = z.object({
  isHealthcareProfessional: z.boolean().default(false),
  crmNumber: z.string().optional(),
  specialty: z.string().optional(),
  patientContext: z
    .object({
      patientId: z.string().optional(),
      hasConsent: z.boolean().default(false),
      dataCategories: z.array(z.string()).default([]),
    })
    .optional(),
  complianceRequirements: z
    .object({
      lgpd: z.boolean().default(true),
      anvisa: z.boolean().default(false),
      cfm: z.boolean().default(false),
    })
    .default({}),
});

export type HealthcareContext = z.infer<typeof healthcareContextSchema>;

// AI Provider Manager
class AIProviderManager {
  private models: Map<string, AIModel> = new Map();
  private providerHealth: Map<AIProvider, ProviderHealth> = new Map();
  private requestMetrics: RequestMetrics[] = [];
  private rateLimits: Map<AIProvider, { requests: number; resetTime: Date }> = new Map();

  constructor() {
    this.initializeModels();
    this.initializeProviderHealth();
  }

  // Initialize available AI models
  private initializeModels() {
    const models: AIModel[] = [
      // OpenAI Models
      {
        id: 'gpt-4',
        provider: AIProvider.OPENAI,
        name: 'GPT-4',
        description: 'Modelo avançado da OpenAI para análise médica',
        maxTokens: 8192,
        costPerToken: 0.00003,
        healthcareOptimized: true,
        supportsBrazilianPortuguese: true,
        supportsStreaming: true,
        isAvailable: true,
        priority: 9,
      },
      {
        id: 'gpt-3.5-turbo',
        provider: AIProvider.OPENAI,
        name: 'GPT-3.5 Turbo',
        description: 'Modelo rápido e eficiente da OpenAI',
        maxTokens: 4096,
        costPerToken: 0.000002,
        healthcareOptimized: false,
        supportsBrazilianPortuguese: true,
        supportsStreaming: true,
        isAvailable: true,
        priority: 7,
      },
      // Anthropic Models
      {
        id: 'claude-3-opus',
        provider: AIProvider.ANTHROPIC,
        name: 'Claude 3 Opus',
        description: 'Modelo mais avançado da Anthropic para análise complexa',
        maxTokens: 200000,
        costPerToken: 0.000015,
        healthcareOptimized: true,
        supportsBrazilianPortuguese: true,
        supportsStreaming: true,
        isAvailable: true,
        priority: 10,
      },
      {
        id: 'claude-3-sonnet',
        provider: AIProvider.ANTHROPIC,
        name: 'Claude 3 Sonnet',
        description: 'Modelo balanceado da Anthropic',
        maxTokens: 200000,
        costPerToken: 0.000003,
        healthcareOptimized: true,
        supportsBrazilianPortuguese: true,
        supportsStreaming: true,
        isAvailable: true,
        priority: 8,
      },
      // Google Models
      {
        id: 'gemini-pro',
        provider: AIProvider.GOOGLE,
        name: 'Gemini Pro',
        description: 'Modelo avançado do Google para análise multimodal',
        maxTokens: 32768,
        costPerToken: 0.0000005,
        healthcareOptimized: false,
        supportsBrazilianPortuguese: true,
        supportsStreaming: false,
        isAvailable: true,
        priority: 6,
      },
      // Local Models
      {
        id: 'local-llama',
        provider: AIProvider.LOCAL,
        name: 'Llama Local',
        description: 'Modelo local para máxima privacidade',
        maxTokens: 4096,
        costPerToken: 0,
        healthcareOptimized: false,
        supportsBrazilianPortuguese: false,
        supportsStreaming: false,
        isAvailable: false, // Depends on local setup
        priority: 3,
      },
    ];

    models.forEach(model => {
      this.models.set(model.id, model);
    });
  }

  // Initialize provider health tracking
  private initializeProviderHealth() {
    Object.values(AIProvider).forEach(provider => {
      this.providerHealth.set(provider, {
        provider,
        isHealthy: true,
        lastCheck: new Date(),
        responseTime: 0,
        errorRate: 0,
        requestCount: 0,
        successCount: 0,
        failureCount: 0,
      });
    });
  }

  // Get available models with optional filtering
  getAvailableModels(filters?: {
    provider?: AIProvider;
    healthcareOptimized?: boolean;
    supportsBrazilianPortuguese?: boolean;
    supportsStreaming?: boolean;
  }): AIModel[] {
    let models = Array.from(this.models.values()).filter(
      model => model.isAvailable,
    );

    if (filters) {
      if (filters.provider) {
        models = models.filter(model => model.provider === filters.provider);
      }
      if (filters.healthcareOptimized !== undefined) {
        models = models.filter(
          model => model.healthcareOptimized === filters.healthcareOptimized,
        );
      }
      if (filters.supportsBrazilianPortuguese !== undefined) {
        models = models.filter(
          model =>
            model.supportsBrazilianPortuguese
              === filters.supportsBrazilianPortuguese,
        );
      }
      if (filters.supportsStreaming !== undefined) {
        models = models.filter(
          model => model.supportsStreaming === filters.supportsStreaming,
        );
      }
    }

    // Sort by priority (higher priority first)
    return models.sort((a, b) => b.priority - a.priority);
  }

  // Select best model based on requirements and health
  selectBestModel(requirements: {
    healthcareContext?: boolean;
    streaming?: boolean;
    maxTokens?: number;
    costOptimized?: boolean;
  }): AIModel | null {
    const filters: any = {
      supportsBrazilianPortuguese: true, // Always require Portuguese support
    };

    if (requirements.healthcareContext) {
      filters.healthcareOptimized = true;
    }

    if (requirements.streaming) {
      filters.supportsStreaming = true;
    }

    let availableModels = this.getAvailableModels(filters);

    // Filter by token requirements
    if (requirements.maxTokens) {
      availableModels = availableModels.filter(
        model => model.maxTokens >= requirements.maxTokens,
      );
    }

    // Filter by provider health
    availableModels = availableModels.filter(model => {
      const health = this.providerHealth.get(model.provider);
      return health?.isHealthy && health.errorRate < 0.1; // Less than 10% error rate
    });

    if (availableModels.length === 0) {
      return null;
    }

    // Sort by cost if cost optimization is requested
    if (requirements.costOptimized) {
      availableModels.sort((a, b) => a.costPerToken - b.costPerToken);
    }

    return availableModels[0];
  }

  // Check rate limits for provider
  checkRateLimit(provider: AIProvider): boolean {
    const limit = this.rateLimits.get(provider);
    if (!limit) {
      return true; // No limit set
    }

    const now = new Date();
    if (now > limit.resetTime) {
      // Reset the limit
      this.rateLimits.set(provider, {
        requests: 0,
        resetTime: new Date(now.getTime() + 60000),
      }); // 1 minute window
      return true;
    }

    // Check if under limit (example: 100 requests per minute)
    return limit.requests < 100;
  }

  // Record request metrics
  recordRequest(metrics: RequestMetrics) {
    this.requestMetrics.push(metrics);

    // Update provider health
    const health = this.providerHealth.get(metrics.provider);
    if (health) {
      health.requestCount++;
      health.lastCheck = new Date();

      if (metrics.success) {
        health.successCount++;
        if (metrics.responseTime) {
          health.responseTime = (health.responseTime + metrics.responseTime) / 2; // Moving average
        }
      } else {
        health.failureCount++;
      }

      health.errorRate = health.failureCount / health.requestCount;
      health.isHealthy = health.errorRate < 0.1 && health.responseTime < 10000; // Less than 10s response time
    }

    // Update rate limits
    const provider = metrics.provider;
    const limit = this.rateLimits.get(provider) || {
      requests: 0,
      resetTime: new Date(Date.now() + 60000),
    };
    limit.requests++;
    this.rateLimits.set(provider, limit);

    // Keep only last 1000 metrics
    if (this.requestMetrics.length > 1000) {
      this.requestMetrics = this.requestMetrics.slice(-1000);
    }
  }

  // Get provider health status
  getProviderHealth(provider?: AIProvider): ProviderHealth[] {
    if (provider) {
      const health = this.providerHealth.get(provider);
      return health ? [health] : [];
    }
    return Array.from(this.providerHealth.values());
  }

  // Get request metrics
  getRequestMetrics(
    provider?: AIProvider,
    limit: number = 100,
  ): RequestMetrics[] {
    let metrics = this.requestMetrics;

    if (provider) {
      metrics = metrics.filter(m => m.provider === provider);
    }

    return metrics.slice(-limit);
  }

  // Force provider health check
  async checkProviderHealth(provider: AIProvider): Promise<boolean> {
    const startTime = Date.now();

    try {
      // TODO: Implement actual health check for each provider
      // For now, simulate health check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

      const responseTime = Date.now() - startTime;
      const health = this.providerHealth.get(provider);

      if (health) {
        health.isHealthy = true;
        health.lastCheck = new Date();
        health.responseTime = responseTime;
      }

      return true;
    } catch {
      const health = this.providerHealth.get(provider);
      if (health) {
        health.isHealthy = false;
        health.lastCheck = new Date();
      }
      return false;
    }
  }
}

// Global AI provider manager
export const aiProviderManager = new AIProviderManager();

// AI provider selection middleware
export function aiProviderSelection() {
  return async (c: Context, next: Next) => {
    // Extract requirements from request
    const healthcareContext = c.get('isHealthcareProfessional') || false;
    const streaming = c.req.query('streaming') === 'true';
    const maxTokens = parseInt(c.req.query('maxTokens') || '0') || undefined;
    const costOptimized = c.req.query('costOptimized') === 'true';

    // Select best model
    const selectedModel = aiProviderManager.selectBestModel({
      healthcareContext,
      streaming,
      maxTokens,
      costOptimized,
    });

    if (!selectedModel) {
      return c.json(
        {
          success: false,
          error: 'Nenhum modelo de IA disponível para os requisitos especificados',
          code: 'NO_AVAILABLE_MODEL',
        },
        503,
      );
    }

    // Check rate limits
    if (!aiProviderManager.checkRateLimit(selectedModel.provider)) {
      return c.json(
        {
          success: false,
          error: 'Limite de taxa excedido para o provedor de IA',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        429,
      );
    }

    // Add selected model to context
    c.set('selectedAIModel', selectedModel);
    c.set('aiProviderManager', aiProviderManager);

    return next();
  };
}

// Brazilian healthcare context injection middleware
export function healthcareContextInjection() {
  return async (c: Context, next: Next) => {
    const healthcareProfessional = c.get('healthcareProfessional');
    const lgpdConsent = c.get('lgpdConsent');
    const patientId = c.req.param('patientId') || c.req.query('patientId');

    // Build healthcare context
    const healthcareContext: HealthcareContext = {
      isHealthcareProfessional: !!healthcareProfessional,
      crmNumber: healthcareProfessional?.crmNumber,
      specialty: healthcareProfessional?.specialty,
      patientContext: patientId
        ? {
          patientId,
          hasConsent: !!lgpdConsent,
          dataCategories: lgpdConsent?.dataCategories || [],
        }
        : undefined,
      complianceRequirements: {
        lgpd: true,
        anvisa: !!healthcareProfessional,
        cfm: !!healthcareProfessional,
      },
    };

    // Validate healthcare context
    const validatedContext = healthcareContextSchema.parse(healthcareContext);

    // Add to context
    c.set('healthcareContext', validatedContext);

    return next();
  };
}

// Request metrics tracking middleware
export function aiRequestMetrics() {
  return async (c: Context, next: Next) => {
    const selectedModel = c.get('selectedAIModel') as AIModel;
    if (!selectedModel) {
      return next();
    }

    const requestId = crypto.randomUUID();
    const startTime = new Date();

    // Add request tracking to context
    c.set('aiRequestId', requestId);
    c.set('aiRequestStartTime', startTime);

    try {
      await next();

      // Record successful request
      const endTime = new Date();
      const responseTime = endTime.getTime() - startTime.getTime();

      aiProviderManager.recordRequest({
        provider: selectedModel.provider,
        model: selectedModel.id,
        requestId,
        startTime,
        endTime,
        responseTime,
        success: true,
      });
    } catch (error) {
      // Record failed request
      const endTime = new Date();
      const responseTime = endTime.getTime() - startTime.getTime();

      aiProviderManager.recordRequest({
        provider: selectedModel.provider,
        model: selectedModel.id,
        requestId,
        startTime,
        endTime,
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error; // Re-throw the error
    }
  };
}

// Export types and utilities
export type { AIModel, HealthcareContext, ProviderHealth, RequestMetrics };
