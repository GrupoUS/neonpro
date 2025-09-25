/**
 * AI Provider Factory Tests
 * Tests the factory pattern, provider management, and failover mechanisms
 */

import { AIProviderFactory } from '../services/ai-provider-factory.js'
import { CircuitBreakerRegistry } from '../services/circuit-breaker/circuit-breaker-service.js'

// Mock the AI security service
jest.mock('../../../apps/api/src/services/ai-security-service.js', () => ({
  sanitizeForAI: (data: any) => JSON.stringify(data),
  validatePromptSecurity: (prompt: string) => true,
  validateAIOutputSafety: (response: string) => true,
  logAIInteraction: jest.fn(),
  aiSecurityService: {
    canMakeRequest: () => true,
    validateApiKeyRotation: () => true,
    shouldRetainAIData: () => true,
  },
}))

describe('AIProviderFactory', () => {
  beforeEach(() => {
    // Reset factory state
    AIProviderFactory.initialize({
      openai: {
        apiKey: 'test-openai-key',
        model: 'gpt-4',
      },
      anthropic: {
        apiKey: 'test-anthropic-key',
        model: 'claude-3-sonnet',
      },
    })

    // Reset circuit breakers
    CircuitBreakerRegistry.resetAll()

    // Clear all mocks
    jest.clearAllMocks()
  })

  describe('Factory Initialization', () => {
    test('should initialize with configuration', () => {
      const config = AIProviderFactory.getConfig()
      
      expect(config.openai?.apiKey).toBe('test-openai-key')
      expect(config.anthropic?.apiKey).toBe('test-anthropic-key')
      expect(config.openai?.model).toBe('gpt-4')
      expect(config.anthropic?.model).toBe('claude-3-sonnet')
    })

    test('should update configuration dynamically', () => {
      AIProviderFactory.updateConfig({
        openai: {
          apiKey: 'new-openai-key',
          model: 'gpt-3.5-turbo',
        },
      })

      const config = AIProviderFactory.getConfig()
      expect(config.openai?.apiKey).toBe('new-openai-key')
      expect(config.openai?.model).toBe('gpt-3.5-turbo')
    })
  })

  describe('Provider Creation', () => {
    test('should create OpenAI provider when configured', () => {
      const provider = AIProviderFactory.getProvider('openai')
      
      expect(provider).toBeDefined()
      expect(provider.getProviderInfo?.().name).toBe('openai')
    })

    test('should create Anthropic provider when configured', () => {
      const provider = AIProviderFactory.getProvider('anthropic')
      
      expect(provider).toBeDefined()
      expect(provider.getProviderInfo?.().name).toBe('anthropic')
    })

    test('should create Mock provider for unconfigured providers', () => {
      // Remove API keys to force mock
      AIProviderFactory.updateConfig({
        openai: { apiKey: '' },
        anthropic: { apiKey: '' },
      })

      const provider = AIProviderFactory.getProvider('openai')
      
      expect(provider).toBeDefined()
      expect(provider.getProviderInfo?.().name).toBe('mock')
    })

    test('should return preferred provider when no specific provider requested', () => {
      const provider = AIProviderFactory.getProvider()
      
      expect(provider).toBeDefined()
      // Should return the first healthy provider (openai in this case)
      expect(['openai', 'anthropic', 'mock']).toContain(provider.getProviderInfo?.().name)
    })
  })

  describe('Provider Health Management', () => {
    test('should track provider health status', async () => {
      const healthStatus = await AIProviderFactory.checkAllProvidersHealth()
      
      expect(healthStatus).toHaveProperty('openai')
      expect(healthStatus).toHaveProperty('anthropic')
      expect(healthStatus).toHaveProperty('mock')
    })

    test('should return available providers based on health', () => {
      const availableProviders = AIProviderFactory.getAvailableProviders()
      
      expect(Array.isArray(availableProviders)).toBe(true)
      expect(availableProviders.length).toBeGreaterThan(0)
    })

    test('should get provider info for all providers', () => {
      const providerInfo = AIProviderFactory.getProviderInfo()
      
      expect(Array.isArray(providerInfo)).toBe(true)
      expect(providerInfo.length).toBeGreaterThan(0)
      
      providerInfo.forEach(info => {
        expect(info).toHaveProperty('name')
        expect(info).toHaveProperty('model')
        expect(info).toHaveProperty('healthy')
        expect(typeof info.healthy).toBe('boolean')
      })
    })
  })

  describe('Failover Mechanism', () => {
    test('should fallback to next provider on failure', async () => {
      // Mock a failing provider
      const mockProvider = {
        generateAnswer: jest.fn().mockRejectedValue(new Error('Provider failed')),
        generateStream: jest.fn().mockRejectedValue(new Error('Provider failed')),
      }

      // Replace provider creation to return mock
      jest.spyOn(AIProviderFactory as any, 'createProvider').mockReturnValue(mockProvider)

      const input = {
        prompt: 'test prompt',
        locale: 'pt-BR' as const,
      }

      // Should still succeed with fallback to mock
      const result = await AIProviderFactory.generateWithFailover(input)
      
      expect(result).toBeDefined()
      expect(result.content).toContain('Mock response')
    })

    test('should handle streaming failover', async () => {
      const input = {
        prompt: 'test streaming prompt',
        locale: 'pt-BR' as const,
      }

      const streamGenerator = AIProviderFactory.generateStreamWithFailover(input)
      const chunks = []

      for await (const chunk of streamGenerator) {
        chunks.push(chunk)
      }

      expect(chunks.length).toBeGreaterThan(0)
      expect(chunks[chunks.length - 1].finished).toBe(true)
    })
  })

  describe('Retry Logic', () => {
    test('should retry failed requests with exponential backoff', async () => {
      let attemptCount = 0
      const mockProvider = {
        generateAnswer: jest.fn().mockImplementation(() => {
          attemptCount++
          if (attemptCount < 3) {
            throw new Error('Temporary failure')
          }
          return Promise.resolve({
            content: 'Success after retries',
            tokensUsed: 10,
            model: 'test-model',
            finishReason: 'stop' as const,
          })
        }),
      }

      jest.spyOn(AIProviderFactory as any, 'createProvider').mockReturnValue(mockProvider)

      const input = { prompt: 'test retry' }
      const result = await AIProviderFactory.generateWithFailover(input, 5)

      expect(result.content).toBe('Success after retries')
      expect(attemptCount).toBe(3)
    })
  })

  describe('Circuit Breaker Integration', () => {
    test('should integrate with circuit breakers', () => {
      const circuitBreaker = CircuitBreakerRegistry.getCircuitBreaker('openai')
      
      expect(circuitBreaker).toBeDefined()
      expect(circuitBreaker.getState().state).toBe('CLOSED')
    })

    test('should handle circuit breaker open state', async () => {
      const circuitBreaker = CircuitBreakerRegistry.getCircuitBreaker('openai')
      circuitBreaker.forceOpen()

      const input = { prompt: 'test circuit breaker' }
      
      await expect(AIProviderFactory.generateWithFailover(input)).rejects.toThrow(
        'Circuit breaker is OPEN'
      )
    })
  })

  describe('Error Handling', () => {
    test('should handle provider creation errors gracefully', () => {
      // Remove configuration to force error
      AIProviderFactory.updateConfig({})

      const provider = AIProviderFactory.getProvider('openai')
      
      expect(provider).toBeDefined()
      expect(provider.getProviderInfo?.().name).toBe('mock')
    })

    test('should log errors appropriately', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const mockProvider = {
        generateAnswer: jest.fn().mockRejectedValue(new Error('Test error')),
      }

      jest.spyOn(AIProviderFactory as any, 'createProvider').mockReturnValue(mockProvider)

      const input = { prompt: 'test error logging' }
      
      try {
        await AIProviderFactory.generateWithFailover(input)
      } catch (error) {
        // Expected to fail
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('OpenAI generateAnswer API Error'),
        expect.any(Object)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Provider Caching', () => {
    test('should cache providers to avoid recreation', () => {
      const provider1 = AIProviderFactory.getProvider('openai')
      const provider2 = AIProviderFactory.getProvider('openai')
      
      expect(provider1).toBe(provider2) // Same instance
    })

    test('should clear cache on config update', () => {
      const provider1 = AIProviderFactory.getProvider('openai')
      
      AIProviderFactory.updateConfig({
        openai: { apiKey: 'new-key' },
      })
      
      const provider2 = AIProviderFactory.getProvider('openai')
      
      expect(provider1).not.toBe(provider2) // Different instance after config update
    })
  })
})