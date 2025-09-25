import { analyticsLogger, logHealthcareError } from '@neonpro/shared'
import type {
  AIProvider,
  AIProviderInterface,
  GenerateAnswerInput,
  GenerateAnswerResult,
  StreamChunk,
} from '@neonpro/types'
import { OpenAIProvider } from './openai-provider.js'
import { AnthropicProvider } from './anthropic-provider.js'

export type AIProviderType = AIProvider | 'mock'

interface ProviderConfig {
  openai?: {
    apiKey: string
    model?: string
    baseUrl?: string
    timeout?: number
  }
  anthropic?: {
    apiKey: string
    model?: string
    baseUrl?: string
    timeout?: number
  }
  google?: {
    apiKey: string
    model?: string
  }
}

class MockProvider implements AIProviderInterface {
  async generateAnswer(
    input: GenerateAnswerInput,
  ): Promise<GenerateAnswerResult> {
    const content = input.prompt || 'Olá! Como posso ajudar?'
    return {
      content: `Mock response for: ${content.slice(0, 120)}`,
      tokensUsed: Math.floor(Math.random() * 100) + 50,
      model: 'mock-model',
      provider: 'mock',
      finishReason: 'stop',
    }
  }

  async *generateStream(
    input: GenerateAnswerInput,
  ): AsyncIterable<StreamChunk> {
    const content = input.prompt || 'Olá!'
    const words = `Mock streaming response for: ${content.slice(0, 120)}`.split(
      ' ',
    )

    for (let i = 0; i < words.length; i++) {
      const chunkContent = `${words[i]} `
      yield {
        content: chunkContent,
        delta: chunkContent,
        finished: i === words.length - 1,
        finishReason: i === words.length - 1 ? 'stop' : undefined,
        provider: 'mock',
      }
      await new Promise(resolve => setTimeout(resolve, 25))
    }
  }

  async healthCheck(): Promise<boolean> {
    return true // Mock provider is always healthy
  }

  getProviderInfo() {
    return {
      name: 'mock',
      model: 'mock-model',
      healthy: true,
    }
  }
}

export class AIProviderFactory {
  private static providers: Map<AIProviderType, AIProviderInterface> = new Map()
  private static providerHealth: Map<AIProviderType, boolean> = new Map()
  private static fallbackOrder: AIProviderType[] = [
    'openai',
    'anthropic',
    'google',
    'mock',
  ]
  private static config: ProviderConfig = {}

  static initialize(config: ProviderConfig): void {
    this.config = config
    this.providers.clear() // Clear existing providers
    this.providerHealth.clear() // Clear health status
  }

  static getProvider(providerName?: AIProviderType): AIProviderInterface {
    const selected = providerName || this.getPreferredProvider()
    return this.getCachedProvider(selected)
  }

  private static getPreferredProvider(): AIProviderType {
    // Return the first healthy provider from the fallback order
    for (const provider of this.fallbackOrder) {
      if (this.isProviderHealthy(provider)) {
        return provider
      }
    }
    return 'mock' // Fallback to mock if no healthy providers
  }

  private static isProviderHealthy(providerName: AIProviderType): boolean {
    const healthStatus = this.providerHealth.get(providerName)
    if (healthStatus !== undefined) {
      return healthStatus
    }

    // For mock provider, always return healthy
    if (providerName === 'mock') {
      this.providerHealth.set(providerName, true)
      return true
    }

    // For other providers, check if configuration exists
    if (providerName === 'openai' && !this.config.openai?.apiKey) {
      return false
    }
    if (providerName === 'anthropic' && !this.config.anthropic?.apiKey) {
      return false
    }
    if (providerName === 'google' && !this.config.google?.apiKey) {
      return false
    }

    return true // Assume healthy if config exists
  }

  private static getCachedProvider(
    providerName: AIProviderType,
  ): AIProviderInterface {
    if (!this.providers.has(providerName)) {
      this.providers.set(providerName, this.createProvider(providerName))
    }
    return this.providers.get(providerName)!
  }

  private static createProvider(
    providerName: AIProviderType,
  ): AIProviderInterface {
    try {
      switch (providerName) {
        case 'mock':
          return new MockProvider()
        case 'openai':
          if (!this.config.openai?.apiKey) {
            throw new Error('OpenAI API key not configured')
          }
          return new OpenAIProvider(this.config.openai)
        case 'anthropic':
          if (!this.config.anthropic?.apiKey) {
            throw new Error('Anthropic API key not configured')
          }
          return new AnthropicProvider(this.config.anthropic)
        case 'google':
          analyticsLogger.warn(
            'Google provider not implemented yet. Falling back to mock provider.',
            {
              providerName,
              severity: 'low',
              component: 'AIProviderFactory',
              action: 'provider_fallback',
            },
          )
          return new MockProvider()
        default:
          throw new Error(`Unknown provider: ${providerName}`)
      }
    } catch (error) {
      analyticsLogger.error(
        `Failed to create provider ${providerName}. Falling back to mock provider.`,
        {
          providerName,
          error: error instanceof Error ? error.message : 'Unknown error',
          severity: 'medium',
          component: 'AIProviderFactory',
          action: 'provider_creation_failed',
        },
      )
      return new MockProvider()
    }
  }

  static async generateWithFailover(
    input: GenerateAnswerInput,
    maxRetries = 3,
  ): Promise<GenerateAnswerResult> {
    let lastError: Error | null = null

    for (let i = 0; i < Math.min(maxRetries, this.fallbackOrder.length); i++) {
      const providerName = this.fallbackOrder[i]
      
      // Check if provider is healthy before attempting
      if (!this.isProviderHealthy(providerName)) {
        analyticsLogger.warn(
          `Provider ${providerName} is not healthy, skipping...`,
          {
            providerName,
            severity: 'low',
            component: 'AIProviderFactory',
            action: 'provider_skipped_unhealthy',
          },
        )
        continue
      }

      try {
        const provider = this.getProvider(providerName)
        const result = await this.executeWithRetry(
          () => provider.generateAnswer(input),
          providerName,
          'generateAnswer',
        )
        
        return {
          ...result,
          provider: result.provider ?? providerName,
        }
      } catch (error) {
        lastError = error as Error
        this.markProviderUnhealthy(providerName)
        
        logHealthcareError('analytics', error as Error, {
          method: 'generateWithFailover',
          component: 'AIProviderFactory',
          providerName,
          severity: 'medium',
          operation: 'provider_failover',
        })
      }
    }

    throw lastError ?? new Error('All AI providers failed')
  }

  static async *generateStreamWithFailover(
    input: GenerateAnswerInput,
    maxRetries = 3,
  ): AsyncIterable<StreamChunk> {
    let lastError: Error | null = null

    for (let i = 0; i < Math.min(maxRetries, this.fallbackOrder.length); i++) {
      const providerName = this.fallbackOrder[i]
      
      // Check if provider is healthy before attempting
      if (!this.isProviderHealthy(providerName)) {
        analyticsLogger.warn(
          `Provider ${providerName} is not healthy, skipping...`,
          {
            providerName,
            severity: 'low',
            component: 'AIProviderFactory',
            action: 'provider_skipped_unhealthy',
          },
        )
        continue
      }

      try {
        const provider = this.getProvider(providerName)
        if (!provider.generateStream) {
          throw new Error(
            `Provider ${providerName} does not support streaming`,
          )
        }

        // Execute streaming with retry logic
        const streamGenerator = this.executeStreamWithRetry(
          () => provider.generateStream!(input),
          providerName,
          'generateStream',
        )

        for await (const chunk of streamGenerator) {
          yield {
            ...chunk,
            provider: chunk.provider ?? providerName,
          }
        }
        return
      } catch (error) {
        lastError = error as Error
        this.markProviderUnhealthy(providerName)
        
        logHealthcareError('analytics', error as Error, {
          method: 'generateStreamWithFailover',
          component: 'AIProviderFactory',
          providerName,
          severity: 'medium',
          operation: 'streaming_provider_failover',
        })
      }
    }

    throw lastError ?? new Error('All streaming AI providers failed')
  }

  private static async executeWithRetry<T>(
    operation: () => Promise<T>,
    providerName: AIProviderType,
    operationName: string,
    maxRetries = 2,
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxRetries) {
          throw error
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        
        analyticsLogger.warn(
          `Retry attempt ${attempt} for ${providerName}.${operationName}`,
          {
            providerName,
            operationName,
            attempt,
            delay,
            error: error instanceof Error ? error.message : 'Unknown error',
            severity: 'low',
            component: 'AIProviderFactory',
            action: 'provider_retry',
          },
        )
      }
    }

    throw lastError ?? new Error('All retry attempts failed')
  }

  private static async *executeStreamWithRetry<T>(
    operation: () => AsyncIterable<T>,
    providerName: AIProviderType,
    operationName: string,
    maxRetries = 2,
  ): AsyncIterable<T> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const stream = operation()
        for await (const item of stream) {
          yield item
        }
        return
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxRetries) {
          throw error
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        
        analyticsLogger.warn(
          `Stream retry attempt ${attempt} for ${providerName}.${operationName}`,
          {
            providerName,
            operationName,
            attempt,
            delay,
            error: error instanceof Error ? error.message : 'Unknown error',
            severity: 'low',
            component: 'AIProviderFactory',
            action: 'provider_stream_retry',
          },
        )
      }
    }

    throw lastError ?? new Error('All stream retry attempts failed')
  }

  private static markProviderUnhealthy(providerName: AIProviderType): void {
    this.providerHealth.set(providerName, false)
    analyticsLogger.warn(
      `Marked provider ${providerName} as unhealthy due to errors`,
      {
        providerName,
        severity: 'medium',
        component: 'AIProviderFactory',
        action: 'provider_marked_unhealthy',
      },
    )
  }

  // Health check methods
  static async checkAllProvidersHealth(): Promise<Record<AIProviderType, boolean>> {
    const healthStatus: Record<AIProviderType, boolean> = {}
    
    for (const providerName of this.fallbackOrder) {
      try {
        const provider = this.getProvider(providerName)
        if (providerName === 'mock') {
          healthStatus[providerName] = true
        } else if ('healthCheck' in provider && typeof provider.healthCheck === 'function') {
          healthStatus[providerName] = await provider.healthCheck()
        } else {
          healthStatus[providerName] = true // Assume healthy if no health check method
        }
      } catch (error) {
        healthStatus[providerName] = false
        this.markProviderUnhealthy(providerName)
      }
    }
    
    return healthStatus
  }

  static async checkProviderHealth(providerName: AIProviderType): Promise<boolean> {
    try {
      const provider = this.getProvider(providerName)
      if (providerName === 'mock') {
        return true
      } else if ('healthCheck' in provider && typeof provider.healthCheck === 'function') {
        const isHealthy = await provider.healthCheck()
        this.providerHealth.set(providerName, isHealthy)
        return isHealthy
      }
      return true
    } catch (error) {
      this.markProviderUnhealthy(providerName)
      return false
    }
  }

  static getAvailableProviders(): AIProviderType[] {
    return this.fallbackOrder.filter(provider => this.isProviderHealthy(provider))
  }

  static getProviderInfo(): Array<{
    name: AIProviderType
    model: string
    healthy: boolean
  }> {
    return this.fallbackOrder.map(providerName => {
      try {
        const provider = this.getProvider(providerName)
        if ('getProviderInfo' in provider && typeof provider.getProviderInfo === 'function') {
          return provider.getProviderInfo()
        }
        return {
          name: providerName,
          model: 'unknown',
          healthy: this.isProviderHealthy(providerName),
        }
      } catch (error) {
        return {
          name: providerName,
          model: 'unknown',
          healthy: false,
        }
      }
    })
  }

  // Configuration management
  static updateConfig(newConfig: Partial<ProviderConfig>): void {
    this.config = { ...this.config, ...newConfig }
    // Clear provider cache to force recreation with new config
    this.providers.clear()
  }

  static getConfig(): ProviderConfig {
    return { ...this.config }
  }
}

export const aiProviderFactory = AIProviderFactory
