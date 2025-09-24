/**
 * AI Service Management
 *
 * Service health monitoring, model availability checking, and usage statistics
 * for AI services in the healthcare platform.
 */

import { AIProvider } from '../providers/ai-provider'

// Simple error class for AI service management
class AIServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public category: string = 'system' as string,
    public severity: string = 'medium' as string,
  ) {
    super(message)
    this.name = 'AIServiceError'
  }
}

export interface AIServiceHealth {
  status: 'healthy' | 'degraded' | 'unavailable'
  provider: string
  model: string
  responseTime: number
  lastCheck: Date
  errorRate: number
  uptime: number
  message?: string
}

export interface ModelAvailability {
  provider: string
  model: string
  available: boolean
  status: 'available' | 'limited' | 'unavailable'
  maxTokens: number
  costPerToken: number
  region: string
  lastUpdated: Date
  limitations?: string[]
}

export interface AIUsageStats {
  provider: string
  model: string
  period: {
    start: Date
    end: Date
  }
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  totalTokensUsed: number
  averageResponseTime: number
  totalCost: number
  errorRate: number
  dailyBreakdown: Array<{
    date: string
    requests: number
    tokens: number
    cost: number
  }>
}

export class AIServiceManagement {
  private providers: Map<string, AIProvider> = new Map()
  private healthCache: Map<string, AIServiceHealth> = new Map()
  private availabilityCache: Map<string, ModelAvailability> = new Map()
  private usageCache: Map<string, AIUsageStats> = new Map()

  constructor() {
    // Initialize with default providers
    this.initializeProviders()
  }

  /**
   * Check overall AI service health
   */
  async checkAIServiceHealth(): Promise<AIServiceHealth[]> {
    const healthChecks: Promise<AIServiceHealth>[] = []

    for (const [providerName, provider] of this.providers) {
      healthChecks.push(this.checkProviderHealth(providerName, provider))
    }

    try {
      const results = await Promise.allSettled(healthChecks)
      const healthStatuses: AIServiceHealth[] = []

      results.forEach((result, _index) => {
        if (result.status === 'fulfilled') {
          healthStatuses.push(result.value)
        } else {
          // Create a failed health status for providers that couldn't be checked
          const providerName = Array.from(this.providers.keys())[_index]
          healthStatuses.push({
            status: 'unavailable',
            provider: providerName || 'unknown',
            model: 'unknown',
            responseTime: 0,
            lastCheck: new Date(),
            errorRate: 100,
            uptime: 0,
            message: `Health check failed: ${
              result.reason instanceof Error ? result.reason.message : String(result.reason)
            }`,
          })
        }
      })

      // Update cache
      healthStatuses.forEach((health) => {
        this.healthCache.set(health.provider, health)
      })

      return healthStatuses
    } catch (error) {
      throw new AIServiceError(
        'AI_HEALTH_CHECK_ERROR',
        `Failed to check AI service health: ${
          error instanceof Error ? error.message : String(error)
        }`,
        'system',
        'high',
      )
    }
  }

  /**
   * Check availability of specific AI models
   */
  async checkModelAvailability(
    provider?: string,
    model?: string,
  ): Promise<ModelAvailability[]> {
    const checks: Promise<ModelAvailability>[] = []

    const modelsToCheck = this.getModelsToCheck(provider, model)

    for (const { provider: p, model: m } of modelsToCheck) {
      checks.push(this.checkSingleModelAvailability(p, m))
    }

    try {
      const results = await Promise.allSettled(checks)
      const availabilities: ModelAvailability[] = []

      results.forEach((result, _index) => {
        if (result.status === 'fulfilled') {
          availabilities.push(result.value)
        } else {
          // Create unavailable status for models that couldn't be checked
          const modelInfo = modelsToCheck[_index]
          const p = modelInfo?.provider || 'unknown'
          const m = modelInfo?.model || 'unknown'
          availabilities.push({
            provider: p,
            model: m,
            available: false,
            status: 'unavailable',
            maxTokens: 0,
            costPerToken: 0,
            region: 'unknown',
            lastUpdated: new Date(),
            limitations: [
              `Availability check failed: ${
                result.reason instanceof Error ? result.reason.message : String(result.reason)
              }`,
            ],
          })
        }
      })

      // Update cache
      availabilities.forEach((availability) => {
        const key = `${availability.provider}:${availability.model}`
        this.availabilityCache.set(key, availability)
      })

      return availabilities
    } catch (error) {
      throw new AIServiceError(
        'MODEL_AVAILABILITY_CHECK_ERROR',
        `Failed to check model availability: ${
          error instanceof Error ? error.message : String(error)
        }`,
        'system',
        'medium',
      )
    }
  }

  /**
   * Get AI usage statistics
   */
  async getAIUsageStats(
    provider?: string,
    period: { start: Date; end: Date } = this.getDefaultPeriod(),
  ): Promise<AIUsageStats[]> {
    try {
      // In a real implementation, this would query a database table that tracks AI usage
      // For now, we'll return mock data based on what would be stored

      const stats: AIUsageStats[] = []

      // Get usage for each provider
      for (const providerName of this.providers.keys()) {
        if (provider && providerName !== provider) {continue}

        const usage = await this.getProviderUsageStats(providerName, period)
        stats.push(usage)
      }

      // Update cache
      stats.forEach((stat) => {
        const key = `${stat.provider}:${stat.period.start.toISOString()}`
        this.usageCache.set(key, stat)
      })

      return stats
    } catch (error) {
      throw new AIServiceError(
        'USAGE_STATS_ERROR',
        `Failed to get AI usage statistics: ${
          error instanceof Error ? error.message : String(error)
        }`,
        'system',
        'medium',
      )
    }
  }

  /**
   * Get cached health status
   */
  getCachedHealth(providerName: string): AIServiceHealth | null {
    const health = this.healthCache.get(providerName)
    if (!health) {return null}

    // Check if cache is still valid (5 minutes)
    const cacheAge = Date.now() - health.lastCheck.getTime()
    if (cacheAge > 5 * 60 * 1000) {
      return null
    }

    return health
  }

  /**
   * Get cached model availability
   */
  getCachedModelAvailability(
    provider: string,
    model: string,
  ): ModelAvailability | null {
    const key = `${provider}:${model}`
    const availability = this.availabilityCache.get(key)
    if (!availability) {return null}

    // Check if cache is still valid (1 hour)
    const cacheAge = Date.now() - availability.lastUpdated.getTime()
    if (cacheAge > 60 * 60 * 1000) {
      return null
    }

    return availability
  }

  /**
   * Get cached usage statistics
   */
  getCachedUsageStats(
    provider: string,
    period: { start: Date; end: Date },
  ): AIUsageStats | null {
    const key = `${provider}:${period.start.toISOString()}`
    const stats = this.usageCache.get(key)
    if (!stats) {return null}

    // Check if cache is still valid (1 hour for current period, longer for historical)
    const cacheAge = Date.now() - stats.period.end.getTime()
    const isCurrentPeriod = period.end > new Date(Date.now() - 24 * 60 * 60 * 1000)
    const maxCacheAge = isCurrentPeriod ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000

    if (cacheAge > maxCacheAge) {
      return null
    }

    return stats
  }

  // Private helper methods
  private initializeProviders(): void {
    // In a real implementation, this would initialize actual AI providers
    // For now, we'll create placeholder entries
    this.providers.set('openai', {
      generateAnswer: async () => {
        throw new Error('OpenAI provider not implemented')
      },
    })

    this.providers.set('anthropic', {
      generateAnswer: async () => {
        throw new Error('Anthropic provider not implemented')
      },
    })
  }

  private async checkProviderHealth(
    providerName: string,
    aiProvider: AIProvider,
  ): Promise<AIServiceHealth> {
    const startTime = Date.now()

    try {
      // Simple health check - try to generate a minimal response
      await aiProvider.generateAnswer({
        prompt: 'Hello',
        maxTokens: 1,
      })

      const responseTime = Date.now() - startTime

      return {
        status: 'healthy',
        provider: providerName,
        model: 'unknown',
        responseTime,
        lastCheck: new Date(),
        errorRate: 0,
        uptime: 100,
        message: 'Service is responding normally',
      }
    } catch (error) {
      const responseTime = Date.now() - startTime

      return {
        status: 'unavailable',
        provider: providerName,
        model: 'unknown',
        responseTime,
        lastCheck: new Date(),
        errorRate: 100,
        uptime: 0,
        message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  private getModelsToCheck(
    provider?: string,
    model?: string,
  ): Array<{ provider: string; model: string }> {
    const availableModels = [
      { provider: 'openai', model: 'gpt-4' },
      { provider: 'openai', model: 'gpt-3.5-turbo' },
      { provider: 'anthropic', model: 'claude-3' },
      { provider: 'anthropic', model: 'claude-2' },
    ]

    if (provider || model) {
      return availableModels.filter(
        (m) =>
          (!provider || m.provider === provider)
          && (!model || m.model === model),
      )
    }

    return availableModels
  }

  private async checkSingleModelAvailability(
    providerName: string,
    modelName: string,
  ): Promise<ModelAvailability> {
    try {
      const aiProvider = this.providers.get(providerName)
      if (!aiProvider) {
        throw new Error(`Provider ${providerName} not found`)
      }

      // Try to use the model
      await aiProvider.generateAnswer({
        prompt: 'Test',
        maxTokens: 1,
      })

      return {
        provider: providerName,
        model: modelName,
        available: true,
        status: 'available',
        maxTokens: this.getMaxTokensForModel(providerName, modelName),
        costPerToken: this.getCostPerToken(providerName, modelName),
        region: 'us-east-1',
        lastUpdated: new Date(),
      }
    } catch (error) {
      return {
        provider: providerName,
        model: modelName,
        available: false,
        status: 'unavailable',
        maxTokens: 0,
        costPerToken: 0,
        region: 'unknown',
        lastUpdated: new Date(),
        limitations: [error instanceof Error ? error.message : String(error)],
      }
    }
  }

  private async getProviderUsageStats(
    providerName: string,
    period: { start: Date; end: Date },
  ): Promise<AIUsageStats> {
    // In a real implementation, this would query a database
    // For now, return mock data

    const daysDiff = Math.ceil(
      (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24),
    )
    const dailyBreakdown = []

    for (let i = 0; i < Math.min(daysDiff, 30); i++) {
      const date = new Date(period.start.getTime() + i * 24 * 60 * 60 * 1000)
      dailyBreakdown.push({
        date: date.toISOString().split('T')[0] as string,
        requests: Math.floor(Math.random() * 100) + 10,
        tokens: Math.floor(Math.random() * 50000) + 5000,
        cost: Math.random() * 2 + 0.1,
      })
    }

    const totalRequests = dailyBreakdown.reduce(
      (sum, _day) => sum + _day.requests,
      0,
    )
    const successfulRequests = Math.floor(totalRequests * 0.95)
    const failedRequests = totalRequests - successfulRequests
    const totalTokensUsed = dailyBreakdown.reduce(
      (sum, _day) => sum + _day.tokens,
      0,
    )
    const totalCost = dailyBreakdown.reduce((sum, _day) => sum + _day.cost, 0)

    return {
      provider: providerName,
      model: 'various',
      period,
      totalRequests,
      successfulRequests,
      failedRequests,
      totalTokensUsed,
      averageResponseTime: Math.random() * 2 + 0.5, // 0.5-2.5 seconds
      totalCost,
      errorRate: failedRequests / totalRequests,
      dailyBreakdown,
    }
  }

  private getDefaultPeriod(): { start: Date; end: Date } {
    const end = new Date()
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    return { start, end }
  }

  private getMaxTokensForModel(_provider: string, model: string): number {
    const tokenLimits: Record<string, number> = {
      'gpt-4': 8192,
      'gpt-3.5-turbo': 4096,
      'claude-3': 100000,
      'claude-2': 100000,
    }

    return tokenLimits[model] || 4096
  }

  private getCostPerToken(_provider: string, model: string): number {
    const costs: Record<string, number> = {
      'gpt-4': 0.00003,
      'gpt-3.5-turbo': 0.0000015,
      'claude-3': 0.000015,
      'claude-2': 0.00001,
    }

    return costs[model] || 0.00001
  }
}

// Export singleton instance and individual functions
export const aiServiceManagement = new AIServiceManagement()

export async function checkAIServiceHealth(): Promise<AIServiceHealth[]> {
  return aiServiceManagement.checkAIServiceHealth()
}

export async function checkModelAvailability(
  provider?: string,
  model?: string,
): Promise<ModelAvailability[]> {
  return aiServiceManagement.checkModelAvailability(provider, model)
}

export async function getAIUsageStats(
  provider?: string,
  period?: { start: Date; end: Date },
): Promise<AIUsageStats[]> {
  return aiServiceManagement.getAIUsageStats(provider, period)
}
