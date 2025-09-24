import OpenAI from 'openai'
import type {
  AIProviderInterface,
  GenerateAnswerInput,
  GenerateAnswerResult,
  StreamChunk,
} from '@neonpro/types'

/**
 * OpenAI Provider Implementation
 * Supports both GPT-3.5 and GPT-4 models with streaming capabilities
 * Healthcare-optimized with compliance features
 */
export class OpenAIProvider implements AIProviderInterface {
  private readonly client: OpenAI
  private readonly model: string
  private readonly maxTokens: number
  private readonly temperature: number

  constructor(
    apiKey: string,
    options: {
      model?: string
      maxTokens?: number
      temperature?: number
      baseURL?: string
      timeout?: number
    } = {}
  ) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required')
    }

    this.model = options.model || 'gpt-4'
    this.maxTokens = options.maxTokens || 2000
    this.temperature = options.temperature || 0.1

    this.client = new OpenAI({
      apiKey,
      baseURL: options.baseURL,
      timeout: options.timeout || 30000,
      maxRetries: 3,
    })
  }

  async generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerResult> {
    try {
      const messages = this.formatMessages(input)
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: input.maxTokens || this.maxTokens,
        temperature: input.temperature || this.temperature,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false,
      })

      const choice = response.choices[0]
      if (!choice || !choice.message) {
        throw new Error('Invalid response from OpenAI API')
      }

      const content = choice.message.content || ''
      const usage = response.usage

      return {
        content,
        tokensUsed: usage?.total_tokens,
        model: this.model,
        provider: 'openai',
        finishReason: (choice.finish_reason === 'tool_calls' ? 'function_call' : choice.finish_reason) || 'stop',
        metadata: {
          finishReason: choice.finish_reason,
          systemFingerprint: response.system_fingerprint,
          usage: usage ? {
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens,
          } : undefined,
        },
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async *generateStream(input: GenerateAnswerInput): AsyncIterable<StreamChunk> {
    try {
      const messages = this.formatMessages(input)

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: input.maxTokens || this.maxTokens,
        temperature: input.temperature || this.temperature,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true,
      })

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || ''
        
        if (delta) {
          yield {
            content: delta,
            delta,
            finished: false,
            provider: 'openai',
            finishReason: (chunk.choices[0]?.finish_reason === 'tool_calls' ? 'function_call' : chunk.choices[0]?.finish_reason) || undefined,
            metadata: {
              model: this.model,
            },
          }
        }
      }
    } catch (error) {
      const errorResult = this.handleError(error)
      yield {
        content: `Error: ${errorResult.content}`,
        delta: `Error: ${errorResult.content}`,
        finished: true,
        provider: 'openai',
        finishReason: 'content_filter',
        metadata: {
          error: true,
          model: this.model,
        },
      }
    }
  }

  /**
   * Format messages for OpenAI API
   */
  private formatMessages(input: GenerateAnswerInput): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []

    // Add system message if provided
    if (input.system) {
      messages.push({
        role: 'system',
        content: this.formatSystemMessage(input.system),
      })
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: this.formatUserMessage(input.prompt),
    })

    return messages
  }

  /**
   * Format system message with healthcare compliance
   */
  private formatSystemMessage(systemMessage: string): string {
    const healthcareContext = `You are assisting with a Brazilian aesthetic clinic management system. 
    Important guidelines:
    - Follow LGPD (Brazilian GDPR) for patient data privacy
    - Provide information relevant to aesthetic procedures (botox, fillers, facial treatments)
    - Consider professional healthcare context (CFM, COREN, CFF, CNEP)
    - Maintain professional and ethical standards
    - Focus on evidence-based aesthetic medicine practices
    
    ${systemMessage}`

    return healthcareContext
  }

  /**
   * Format user message with context
   */
  private formatUserMessage(prompt: string): string {
    return prompt
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: unknown): GenerateAnswerResult {
    console.error('OpenAI API Error:', error)

    let errorMessage = 'Unknown error occurred'
    let errorCode = 'UNKNOWN_ERROR'

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Invalid API key'
        errorCode = 'INVALID_API_KEY'
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded'
        errorCode = 'RATE_LIMIT_EXCEEDED'
      } else if (error.message.includes('quota')) {
        errorMessage = 'Quota exceeded'
        errorCode = 'QUOTA_EXCEEDED'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout'
        errorCode = 'TIMEOUT'
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error'
        errorCode = 'NETWORK_ERROR'
      } else {
        errorMessage = error.message
        errorCode = 'API_ERROR'
      }
    }

    return {
      content: `Error: ${errorMessage}`,
      model: this.model,
      provider: 'openai',
      finishReason: 'content_filter',
      metadata: {
        error: true,
        errorCode,
        errorMessage,
      },
    }
  }

  /**
   * Get provider info
   */
  getProviderInfo(): {
    name: string
    model: string
    capabilities: string[]
    maxTokens: number
    supportsStreaming: boolean
  } {
    return {
      name: 'OpenAI',
      model: this.model,
      capabilities: ['text-generation', 'streaming', 'function-calling'],
      maxTokens: this.maxTokens,
      supportsStreaming: true,
    }
  }

  /**
   * Check if service is available
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    latency: number
    error?: string
  }> {
    const startTime = Date.now()

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
        temperature: 0,
      })

      const latency = Date.now() - startTime

      if (response.choices && response.choices.length > 0) {
        return { status: 'healthy', latency }
      } else {
        return {
          status: 'unhealthy',
          latency,
          error: 'Invalid response format',
        }
      }
    } catch (error) {
      const latency = Date.now() - startTime
      return {
        status: 'unhealthy',
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

// Factory function
export function createOpenAIProvider(apiKey: string, options?: ConstructorParameters<typeof OpenAIProvider>[1]): OpenAIProvider {
  return new OpenAIProvider(apiKey, options)
}