import type {
  AIProvider,
  AIProviderInterface,
  GenerateAnswerInput,
  GenerateAnswerResult,
  StreamChunk,
} from '../types'
import { OpenAIProvider } from './openai-provider'
import { AnthropicProvider } from './anthropic-provider'
import { GoogleAIProvider } from './google-provider'

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
        provider: 'mock' as AIProvider,
      }
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
  }
}

export class AIProviderFactory {
  private static providers: Map<AIProvider, AIProviderInterface> = new Map()
  private static fallbackOrder: AIProvider[] = [
    'openai',
    'anthropic',
    'google',
    'mock',
  ]

  static getProvider(providerName?: AIProvider): AIProviderInterface {
    const selected = providerName || 'mock'
    return this.getCachedProvider(selected)
  }

  private static getCachedProvider(
    providerName: AIProvider,
  ): AIProviderInterface {
    if (!this.providers.has(providerName)) {
      this.providers.set(providerName, this.createProvider(providerName))
    }
    return this.providers.get(providerName)!
  }

  private static createProvider(
    providerName: AIProvider,
  ): AIProviderInterface {
    switch (providerName) {
      case 'mock':
        return new MockProvider()
      case 'openai':
        const openAIKey = process.env.OPENAI_API_KEY
        if (!openAIKey || openAIKey === 'invalid') {
          console.warn('OPENAI_API_KEY not found or invalid. Falling back to mock provider.')
          return new MockProvider()
        }
        try {
          return new OpenAIProvider(openAIKey)
        } catch (error) {
          console.warn('Failed to create OpenAI provider. Falling back to mock provider.', error)
          return new MockProvider()
        }
      case 'anthropic':
        const anthropicKey = process.env.ANTHROPIC_API_KEY
        if (!anthropicKey || anthropicKey === 'invalid') {
          console.warn('ANTHROPIC_API_KEY not found or invalid. Falling back to mock provider.')
          return new MockProvider()
        }
        try {
          return new AnthropicProvider(anthropicKey)
        } catch (error) {
          console.warn('Failed to create Anthropic provider. Falling back to mock provider.', error)
          return new MockProvider()
        }
      case 'google':
        const googleKey = process.env.GOOGLE_AI_API_KEY
        if (!googleKey || googleKey === 'invalid') {
          console.warn('GOOGLE_AI_API_KEY not found or invalid. Falling back to mock provider.')
          return new MockProvider()
        }
        try {
          return new GoogleAIProvider(googleKey)
        } catch (error) {
          console.warn('Failed to create Google AI provider. Falling back to mock provider.', error)
          return new MockProvider()
        }
      default:
        console.warn(
          `Provider ${providerName} not implemented. Falling back to mock provider.`,
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
      try {
        const provider = this.getProvider(providerName)
        const result = await provider.generateAnswer(input)
        return {
          ...result,
          provider: result.provider ?? providerName,
        }
      } catch (error) {
        lastError = error as Error
        console.warn(`Provider ${providerName} failed:`, error)
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
      try {
        const provider = this.getProvider(providerName)
        if (!provider.generateStream) {
          throw new Error(
            `Provider ${providerName} does not support streaming`,
          )
        }

        for await (const chunk of provider.generateStream(input)) {
          yield {
            ...chunk,
            provider: chunk.provider ?? providerName,
          }
        }
        return
      } catch (error) {
        lastError = error as Error
        console.warn(`Streaming provider ${providerName} failed:`, error)
      }
    }

    throw lastError ?? new Error('All streaming AI providers failed')
  }

  static getAvailableProviders(): AIProvider[] {
    return [...this.fallbackOrder]
  }

  static clearCache(): void {
    this.providers.clear()
  }

  static preloadProviders(): void {
    // Preload all providers to ensure they're ready when needed
    for (const providerName of this.fallbackOrder) {
      try {
        this.getProvider(providerName)
      } catch (error) {
        console.warn(`Failed to preload provider ${providerName}:`, error)
      }
    }
  }

  static isProviderAvailable(providerName: AIProvider): boolean {
    try {
      const provider = this.getProvider(providerName)
      return provider !== null
    } catch {
      return false
    }
  }

  static getProviderInfo(providerName: AIProvider): {
    name: string
    available: boolean
    capabilities: string[]
    maxTokens?: number
    supportsStreaming: boolean
  } {
    try {
      const provider = this.getProvider(providerName)
      const info = {
        name: providerName,
        available: true,
        capabilities: ['text-generation'] as string[],
        supportsStreaming: false,
      }

      // Check if provider supports streaming
      if (provider.generateStream) {
        info.supportsStreaming = true
        info.capabilities.push('streaming')
      }

      // Add provider-specific capabilities
      if (providerName === 'openai') {
        info.capabilities.push('function-calling')
      }

      return info
    } catch {
      return {
        name: providerName,
        available: false,
        capabilities: [],
        supportsStreaming: false,
      }
    }
  }
}

export { MockProvider }

export const aiProviderFactory = AIProviderFactory
