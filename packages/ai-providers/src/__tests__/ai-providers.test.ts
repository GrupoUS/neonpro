/**
 * AI Providers Package Tests
 * 
 * Comprehensive tests for AI provider functionality
 * including provider factory, types, and healthcare compliance
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AIProviderFactory } from '../providers/ai-provider-factory'
import { OpenAIProvider } from '../providers/openai-provider'
import { AnthropicProvider } from '../providers/anthropic-provider'
import { GoogleAIProvider } from '../providers/google-provider'
import { MockProvider } from '../providers/ai-provider-factory'
import { AIService } from '../services/AIService'
import { PIIRedactionService } from '../services/pii-redaction'
import type {
  AIProvider,
  GenerateAnswerInput,
  GenerateAnswerResult,
  StreamChunk,
} from '../types'

describe('AI Providers Package', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear provider cache before each test
    AIProviderFactory.clearCache()
  })

  describe('Provider Factory', () => {
    it('should return mock provider when no API keys are available', () => {
      // Mock environment variables to be undefined
      process.env.OPENAI_API_KEY = undefined
      process.env.ANTHROPIC_API_KEY = undefined
      process.env.GOOGLE_AI_API_KEY = undefined

      const provider = AIProviderFactory.getProvider('openai')
      expect(provider).toBeInstanceOf(MockProvider)
    })

    it('should return correct provider type for mock', () => {
      const provider = AIProviderFactory.getProvider('mock')
      expect(provider).toBeInstanceOf(MockProvider)
    })

    it('should return cached provider instance', () => {
      const provider1 = AIProviderFactory.getProvider('mock')
      const provider2 = AIProviderFactory.getProvider('mock')
      expect(provider1).toBe(provider2)
    })

    it('should clear cache properly', () => {
      const provider1 = AIProviderFactory.getProvider('mock')
      AIProviderFactory.clearCache()
      const provider2 = AIProviderFactory.getProvider('mock')
      expect(provider1).not.toBe(provider2)
    })

    it('should list available providers', () => {
      const providers = AIProviderFactory.getAvailableProviders()
      expect(providers).toEqual(['openai', 'anthropic', 'google', 'mock'])
    })

    it('should check provider availability', () => {
      expect(AIProviderFactory.isProviderAvailable('mock')).toBe(true)
      expect(AIProviderFactory.isProviderAvailable('openai')).toBe(true) // Falls back to mock
    })

    it('should get provider info', () => {
      const mockInfo = AIProviderFactory.getProviderInfo('mock')
      expect(mockInfo.name).toBe('mock')
      expect(mockInfo.available).toBe(true)
      expect(mockInfo.capabilities).toContain('text-generation')
      expect(mockInfo.supportsStreaming).toBe(true)
    })

    it('should generate answer with failover', async () => {
      const input: GenerateAnswerInput = {
        prompt: 'Hello, world!',
        locale: 'pt-BR',
      }

      const result = await AIProviderFactory.generateWithFailover(input)
      
      expect(result).toBeDefined()
      expect(result.content).toContain('Mock response for: Hello, world!')
      expect(result.provider).toBe('mock')
      expect(result.finishReason).toBe('stop')
    })

    it('should generate stream with failover', async () => {
      const input: GenerateAnswerInput = {
        prompt: 'Hello, world!',
        stream: true,
      }

      const chunks: StreamChunk[] = []
      for await (const chunk of AIProviderFactory.generateStreamWithFailover(input)) {
        chunks.push(chunk)
      }

      expect(chunks.length).toBeGreaterThan(0)
      expect(chunks[chunks.length - 1].finished).toBe(true)
    })
  })

  describe('Mock Provider', () => {
    it('should generate answer successfully', async () => {
      const provider = new MockProvider()
      const input: GenerateAnswerInput = {
        prompt: 'Test prompt',
        maxTokens: 100,
      }

      const result = await provider.generateAnswer(input)
      
      expect(result.content).toContain('Mock response for: Test prompt')
      expect(result.tokensUsed).toBeGreaterThan(0)
      expect(result.model).toBe('mock-model')
      expect(result.provider).toBe('mock')
      expect(result.finishReason).toBe('stop')
    })

    it('should generate stream successfully', async () => {
      const provider = new MockProvider()
      const input: GenerateAnswerInput = {
        prompt: 'Test streaming',
        stream: true,
      }

      const chunks: StreamChunk[] = []
      for await (const chunk of provider.generateStream(input)) {
        chunks.push(chunk)
      }

      expect(chunks.length).toBeGreaterThan(0)
      expect(chunks[chunks.length - 1].finished).toBe(true)
      expect(chunks[0].content).toContain('Mock streaming response for: Test streaming')
    })
  })

  describe('AIService', () => {
    let aiService: AIService

    beforeEach(() => {
      aiService = new AIService()
    })

    it('should make basic prediction', async () => {
      const request = {
        type: 'appointment_noshow' as const,
        data: {
          patientAge: 35,
          daysSinceScheduled: 5,
          previousNoShows: 0,
        },
      }

      const response = await aiService.makePrediction(request)
      
      expect(response.type).toBe('appointment_noshow')
      expect(response.confidence).toBeGreaterThan(0)
      expect(response.confidence).toBeLessThanOrEqual(1)
    })

    it('should make enhanced prediction with low days since scheduled and previous no-shows', async () => {
      const request = {
        type: 'appointment_noshow' as const,
        data: {
          patientAge: 35,
          daysSinceScheduled: 2,
          previousNoShows: 1,
        },
        enhanced: true,
      }

      const response = await aiService.makePrediction(request)
      
      expect(response.type).toBe('appointment_noshow')
      expect(response.enhanced).toBe(true)
      expect(response.anonymizedFeatures).toBeDefined()
      expect(response.confidence).toBeGreaterThan(0.75) // Enhanced predictions have higher confidence
    })

    it('should infer enhanced prediction when conditions are met', async () => {
      const request = {
        type: 'appointment_noshow' as const,
        data: {
          patientAge: 35,
          daysSinceScheduled: 1,
          previousNoShows: 2,
        },
        // enhanced not explicitly set
      }

      const response = await aiService.makePrediction(request)
      
      expect(response.type).toBe('appointment_noshow')
      expect(response.enhanced).toBe(true) // Should be inferred
      expect(response.anonymizedFeatures).toBeDefined()
    })

    it('should not infer enhanced prediction when conditions are not met', async () => {
      const request = {
        type: 'appointment_noshow' as const,
        data: {
          patientAge: 35,
          daysSinceScheduled: 10,
          previousNoShows: 0,
        },
        // enhanced not explicitly set
      }

      const response = await aiService.makePrediction(request)
      
      expect(response.type).toBe('appointment_noshow')
      expect(response.enhanced).toBeUndefined() // Should not be inferred
      expect(response.anonymizedFeatures).toBeUndefined()
    })

    it('should handle different appointment types in enhanced predictions', async () => {
      const request = {
        type: 'appointment_noshow' as const,
        data: {
          patientAge: 35,
          daysSinceScheduled: 2,
          previousNoShows: 1,
          appointmentType: 'consultation',
        },
        enhanced: true,
      }

      const response = await aiService.makePrediction(request)
      
      expect(response.type).toBe('appointment_noshow')
      expect(response.enhanced).toBe(true)
      expect(response.confidence).toBeGreaterThan(0.8) // Consultation type adds confidence
    })
  })

  describe('PII Redaction Service', () => {
    it('should be instantiable', () => {
      const piiService = new PIIRedactionService()
      expect(piiService).toBeInstanceOf(PIIRedactionService)
    })

    it('should have redact method', () => {
      const piiService = new PIIRedactionService()
      expect(typeof piiService.redact).toBe('function')
    })

    it('should redact input text', () => {
      const piiService = new PIIRedactionService()
      const input = 'Patient name: João Silva, CPF: 123.456.789-01'
      const result = piiService.redact(input)
      
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })
  })

  describe('Type Safety', () => {
    it('should enforce AIProvider type constraints', () => {
      const validProviders: AIProvider[] = ['openai', 'anthropic', 'google', 'mock']
      expect(validProviders).toHaveLength(4)
    })

    it('should enforce GenerateAnswerInput structure', () => {
      const validInput: GenerateAnswerInput = {
        prompt: 'Test prompt',
        locale: 'pt-BR',
        system: 'You are a helpful assistant',
        maxTokens: 100,
        temperature: 0.7,
      }

      expect(validInput.prompt).toBe('Test prompt')
      expect(validInput.locale).toBe('pt-BR')
      expect(validInput.system).toBeDefined()
      expect(validInput.maxTokens).toBe(100)
      expect(validInput.temperature).toBe(0.7)
    })
  })
})