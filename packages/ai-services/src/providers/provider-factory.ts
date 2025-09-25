import { z } from 'zod';
import { healthcareLogger as logger } from '@neonpro/shared';
import { 
  IUnifiedAIProvider, 
  ProviderConfig, 
  ProviderHealth, 
  ProviderCapabilities 
} from './base-ai-provider.js';

// Import provider implementations
import { OpenAIProvider } from './openai-provider.js';
import { AnthropicProvider } from './anthropic-provider.js';
import { GoogleAIProvider } from './google-ai-provider.js';

/**
 * Provider registry information
 */
export interface ProviderRegistry {
  name: string;
  displayName: string;
  description: string;
  capabilities: ProviderCapabilities;
  defaultModel: string;
  availableModels: string[];
  category: 'text' | 'multimodal' | 'reasoning' | 'healthcare';
  priority: number; // Higher number = higher priority
}

/**
 * Fallback configuration
 */
export interface FallbackConfig {
  enabled: boolean;
  providers: string[]; // List of provider names to try in order
  retryOnSameProvider?: boolean;
  maxRetries: number;
  retryDelay: number;
}

/**
 * Provider factory configuration
 */
export const ProviderFactoryConfigSchema = z.object({
  defaultProvider: z.string().default('anthropic'),
  fallback: z.object({
    enabled: z.boolean().default(true),
    providers: z.array(z.string()).default(['anthropic', 'openai', 'google']),
    retryOnSameProvider: z.boolean().default(false),
    maxRetries: z.number().int().min(0).max(5).default(2),
    retryDelay: z.number().int().min(100).max(5000).default(1000),
  }).default({
    enabled: true,
    providers: ['anthropic', 'openai', 'google'],
    retryOnSameProvider: false,
    maxRetries: 2,
    retryDelay: 1000,
  }),
  healthCheck: z.object({
    enabled: z.boolean().default(true),
    interval: z.number().int().min(5000).max(300000).default(30000), // 30 seconds
    timeout: z.number().int().min(1000).max(30000).default(5000),
  }).default({
    enabled: true,
    interval: 30000,
    timeout: 5000,
  }),
  loadBalancing: z.object({
    enabled: z.boolean().default(true),
    strategy: z.enum(['round-robin', 'weighted', 'least-used', 'fastest']).default('weighted'),
    weights: z.record(z.number()).optional(),
  }).default({
    enabled: true,
    strategy: 'weighted',
  }),
});

export type ProviderFactoryConfig = z.infer<typeof ProviderFactoryConfigSchema>;

/**
 * Provider selection criteria
 */
export interface ProviderSelectionCriteria {
  requiredCapabilities?: (keyof ProviderCapabilities)[];
  preferredProvider?: string;
  maxCost?: number;
  maxLatency?: number;
  minReliability?: number;
  healthcareCompliance?: boolean;
  languageSupport?: string[];
}

/**
 * Unified AI Provider Factory
 */
export class AIProviderFactory {
  private static instance: AIProviderFactory;
  private providers: Map<string, IUnifiedAIProvider> = new Map();
  private configs: Map<string, ProviderConfig> = new Map();
  private registry: Map<string, ProviderRegistry> = new Map();
  private config: ProviderFactoryConfig;
  private healthStatus: Map<string, ProviderHealth> = new Map();
  private healthCheckInterval?: NodeJS.Timeout;
  private currentLoadBalancerIndex = 0;

  private constructor(config: ProviderFactoryConfig = {}) {
    this.config = ProviderFactoryConfigSchema.parse(config);
    this.initializeRegistry();
    this.startHealthChecks();
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: ProviderFactoryConfig): AIProviderFactory {
    if (!AIProviderFactory.instance) {
      AIProviderFactory.instance = new AIProviderFactory(config);
    }
    return AIProviderFactory.instance;
  }

  /**
   * Initialize provider registry
   */
  private initializeRegistry(): void {
    // Anthropic registry entry
    this.registry.set('anthropic', {
      name: 'anthropic',
      displayName: 'Anthropic Claude',
      description: 'Advanced AI assistant with strong reasoning capabilities',
      capabilities: {
        streaming: true,
        vision: true,
        functionCalling: true,
        jsonMode: true,
        multimodal: true,
        contextWindow: 200000,
        maxOutputTokens: 8192,
        supportsHealthcare: true,
      },
      defaultModel: 'claude-3-5-sonnet-20241022',
      availableModels: [
        'claude-3-5-sonnet-20241022',
        'claude-3-haiku-20240307',
        'claude-3-opus-20240229',
      ],
      category: 'reasoning',
      priority: 10, // Highest priority for healthcare
    });

    // OpenAI registry entry
    this.registry.set('openai', {
      name: 'openai',
      displayName: 'OpenAI GPT',
      description: 'Versatile AI model with broad capabilities',
      capabilities: {
        streaming: true,
        vision: true,
        functionCalling: true,
        jsonMode: true,
        multimodal: true,
        contextWindow: 128000,
        maxOutputTokens: 4096,
        supportsHealthcare: true,
      },
      defaultModel: 'gpt-4-turbo-preview',
      availableModels: [
        'gpt-4-turbo-preview',
        'gpt-4',
        'gpt-3.5-turbo',
      ],
      category: 'text',
      priority: 8,
    });

    // Google AI registry entry
    this.registry.set('google', {
      name: 'google',
      displayName: 'Google Gemini',
      description: 'Google\'s multimodal AI model',
      capabilities: {
        streaming: true,
        vision: true,
        functionCalling: true,
        jsonMode: true,
        multimodal: true,
        contextWindow: 32000,
        maxOutputTokens: 2048,
        supportsHealthcare: true,
      },
      defaultModel: 'gemini-pro',
      availableModels: [
        'gemini-pro',
        'gemini-pro-vision',
      ],
      category: 'multimodal',
      priority: 6,
    });
  }

  /**
   * Register a provider instance
   */
  registerProvider(name: string, provider: IUnifiedAIProvider, config: ProviderConfig): void {
    this.providers.set(name, provider);
    this.configs.set(name, config);
    logger.info('Provider registered', { provider: name, model: config.model });
  }

  /**
   * Create and register a provider
   */
  createProvider(name: string, config: ProviderConfig): IUnifiedAIProvider {
    const registry = this.registry.get(name);
    if (!registry) {
      throw new Error(`Unknown provider: ${name}`);
    }

    let provider: IUnifiedAIProvider;

    switch (name) {
      case 'openai':
        provider = new OpenAIProvider(config);
        break;
      case 'anthropic':
        provider = new AnthropicProvider(config);
        break;
      case 'google':
        provider = new GoogleAIProvider(config);
        break;
      default:
        throw new Error(`Unsupported provider: ${name}`);
    }

    this.registerProvider(name, provider, config);
    return provider;
  }

  /**
   * Get a provider by name
   */
  getProvider(name: string): IUnifiedAIProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get the best provider based on criteria
   */
  async getBestProvider(criteria?: ProviderSelectionCriteria): Promise<IUnifiedAIProvider> {
    const availableProviders = await this.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      throw new Error('No available providers');
    }

    // Filter by criteria
    let candidates = availableProviders;

    if (criteria?.requiredCapabilities) {
      candidates = candidates.filter(provider => {
        const registry = this.registry.get(provider.name);
        return registry && criteria.requiredCapabilities!.every(cap => 
          registry.capabilities[cap] === true
        );
      });
    }

    if (criteria?.healthcareCompliance) {
      candidates = candidates.filter(provider => {
        const registry = this.registry.get(provider.name);
        return registry?.capabilities.supportsHealthcare === true;
      });
    }

    if (candidates.length === 0) {
      throw new Error('No providers meet the specified criteria');
    }

    // Sort by priority and health
    candidates.sort((a, b) => {
      const registryA = this.registry.get(a.name)!;
      const registryB = this.registry.get(b.name)!;
      
      // Primary sort: priority
      if (registryA.priority !== registryB.priority) {
        return registryB.priority - registryA.priority;
      }
      
      // Secondary sort: health status
      const healthA = this.healthStatus.get(a.name);
      const healthB = this.healthStatus.get(b.name);
      
      if (healthA && healthB) {
        if (healthA.isHealthy !== healthB.isHealthy) {
          return healthA.isHealthy ? -1 : 1;
        }
        if (healthA.responseTime !== healthB.responseTime) {
          return healthA.responseTime - healthB.responseTime;
        }
      }
      
      return 0;
    });

    // Use preferred provider if specified and available
    if (criteria?.preferredProvider) {
      const preferred = candidates.find(p => p.name === criteria.preferredProvider);
      if (preferred) {
        return preferred;
      }
    }

    return candidates[0];
  }

  /**
   * Get all available providers
   */
  async getAvailableProviders(): Promise<IUnifiedAIProvider[]> {
    const available: IUnifiedAIProvider[] = [];
    
    for (const [name, provider] of this.providers) {
      try {
        const health = await provider.healthCheck();
        this.healthStatus.set(name, health);
        
        if (health.isHealthy) {
          available.push(provider);
        }
      } catch (error) {
        logger.warn('Health check failed for provider', { provider: name, error });
      }
    }
    
    return available;
  }

  /**
   * Execute with fallback mechanism
   */
  async executeWithFallback<T>(
    operation: (provider: IUnifiedAIProvider) => Promise<T>,
    criteria?: ProviderSelectionCriteria
  ): Promise<{ result: T; provider: string }> {
    if (!this.config.fallback.enabled) {
      const provider = await this.getBestProvider(criteria);
      const result = await operation(provider);
      return { result, provider: provider.name };
    }

    const providers = this.config.fallback.providers;
    let lastError: Error;

    for (let attempt = 0; attempt < this.config.fallback.maxRetries + 1; attempt++) {
      for (const providerName of providers) {
        const provider = this.providers.get(providerName);
        if (!provider) continue;

        try {
          const health = this.healthStatus.get(providerName);
          if (!health?.isHealthy) continue;

          const result = await operation(provider);
          return { result, provider: providerName };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          logger.warn('Provider operation failed, trying fallback', {
            provider: providerName,
            attempt,
            error: lastError.message,
          });
        }
      }

      if (attempt < this.config.fallback.maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, this.config.fallback.retryDelay * (attempt + 1))
        );
      }
    }

    throw lastError || new Error('All providers failed');
  }

  /**
   * Load balancing provider selection
   */
  async getLoadBalancedProvider(): Promise<IUnifiedAIProvider> {
    if (!this.config.loadBalancing.enabled) {
      return this.getBestProvider();
    }

    const availableProviders = await this.getAvailableProviders();
    if (availableProviders.length === 0) {
      throw new Error('No available providers for load balancing');
    }

    switch (this.config.loadBalancing.strategy) {
      case 'round-robin':
        return this.roundRobinSelection(availableProviders);
      
      case 'weighted':
        return this.weightedSelection(availableProviders);
      
      case 'least-used':
        return this.leastUsedSelection(availableProviders);
      
      case 'fastest':
        return this.fastestSelection(availableProviders);
      
      default:
        return availableProviders[0];
    }
  }

  private roundRobinSelection(providers: IUnifiedAIProvider[]): IUnifiedAIProvider {
    const provider = providers[this.currentLoadBalancerIndex % providers.length];
    this.currentLoadBalancerIndex++;
    return provider;
  }

  private weightedSelection(providers: IUnifiedAIProvider[]): IUnifiedAIProvider {
    const weights = this.config.loadBalancing.weights;
    if (!weights || Object.keys(weights).length === 0) {
      // Use registry priorities as weights
      const totalWeight = providers.reduce((sum, p) => {
        const registry = this.registry.get(p.name);
        return sum + (registry?.priority || 1);
      }, 0);
      
      let random = Math.random() * totalWeight;
      
      for (const provider of providers) {
        const registry = this.registry.get(provider.name);
        const weight = registry?.priority || 1;
        random -= weight;
        if (random <= 0) {
          return provider;
        }
      }
    }
    
    return providers[0];
  }

  private leastUsedSelection(providers: IUnifiedAIProvider[]): IUnifiedAIProvider {
    return providers.reduce((least, current) => {
      const leastStats = least.getStats();
      const currentStats = current.getStats();
      
      return currentStats.totalRequests < leastStats.totalRequests ? current : least;
    });
  }

  private fastestSelection(providers: IUnifiedAIProvider[]): IUnifiedAIProvider {
    return providers.reduce((fastest, current) => {
      const fastestHealth = this.healthStatus.get(fastest.name);
      const currentHealth = this.healthStatus.get(current.name);
      
      if (!fastestHealth || !currentHealth) return current;
      
      return currentHealth.responseTime < fastestHealth.responseTime ? current : fastest;
    });
  }

  /**
   * Start health check monitoring
   */
  private startHealthChecks(): void {
    if (!this.config.healthCheck.enabled) return;

    const checkHealth = async () => {
      for (const [name, provider] of this.providers) {
        try {
          const health = await provider.healthCheck();
          this.healthStatus.set(name, health);
          
          if (!health.isHealthy) {
            logger.warn('Provider health check failed', { 
              provider: name, 
              error: health.error 
            });
          }
        } catch (error) {
          logger.error('Provider health check error', { 
            provider: name, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
          
          this.healthStatus.set(name, {
            isHealthy: false,
            responseTime: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
            lastCheck: new Date(),
          });
        }
      }
    };

    // Initial check
    checkHealth();

    // Set up periodic checks
    this.healthCheckInterval = setInterval(
      checkHealth,
      this.config.healthCheck.interval
    );
  }

  /**
   * Get provider registry information
   */
  getRegistry(): ProviderRegistry[] {
    return Array.from(this.registry.values());
  }

  /**
   * Get health status for all providers
   */
  getHealthStatus(): Map<string, ProviderHealth> {
    return new Map(this.healthStatus);
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(name: string): ProviderConfig | undefined {
    return this.configs.get(name);
  }

  /**
   * Update factory configuration
   */
  updateConfig(config: Partial<ProviderFactoryConfig>): void {
    this.config = ProviderFactoryConfigSchema.parse({ ...this.config, ...config });
    
    // Restart health checks if needed
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.startHealthChecks();
    
    logger.info('Provider factory configuration updated', { config: this.config });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.providers.clear();
    this.configs.clear();
    this.healthStatus.clear();
    AIProviderFactory.instance = null as any;
  }
}