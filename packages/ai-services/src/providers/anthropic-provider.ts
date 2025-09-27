import Anthropic from '@anthropic-ai/sdk'
import type {
  AIProvider,
  GenerateAnswerInput,
  GenerateAnswerResult,
  StreamChunk,
} from './ai-provider.js'
import { 
  sanitizeForAI, 
  validatePromptSecurity, 
  validateAIOutputSafety,
  logAIInteraction,
  aiSecurityService 
} from '../../../apps/api/src/services/ai-security-service'

interface AnthropicConfig {
  apiKey: string
  model?: string
  baseUrl?: string
  timeout?: number
  maxRetries?: number
}

export class AnthropicProvider implements AIProvider {
  private readonly client: Anthropic
  private readonly config: Required<AnthropicConfig>

  constructor(config: AnthropicConfig) {
    if (!config.apiKey) {
      throw new Error('Anthropic API key is required')
    }

    this.config = {
      model: config.model || 'claude-3-sonnet-20240229',
      baseUrl: config.baseUrl,
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      apiKey: config.apiKey,
    }

    this.client = new Anthropic({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries,
    })
  }

  async generateAnswer(
    input: GenerateAnswerInput,
  ): Promise<GenerateAnswerResult> {
    try {
      // Validate and sanitize input for healthcare compliance
      if (!validatePromptSecurity(input.prompt)) {
        throw new Error('Prompt failed security validation')
      }

      const sanitizedPrompt = sanitizeForAI(input.prompt)

      const message = await this.client.messages.create({
        model: this.config.model,
        max_tokens: input.maxTokens || 1000,
        temperature: input.temperature || 0.7,
        messages: this.buildMessages(input, sanitizedPrompt),
        stream: false,
      })

      const content = this.extractContent(message)
      
      // Validate AI output for healthcare safety
      if (!validateAIOutputSafety(content)) {
        throw new Error('AI output failed safety validation')
      }

      const result: GenerateAnswerResult = {
        content,
        tokensUsed: message.usage?.input_tokens + message.usage?.output_tokens,
        model: message.model,
        finishReason: this.mapFinishReason(message.stop_reason),
      }

      // Log interaction for audit trail
      this.logInteraction(input, result, 'anthropic')

      return result
    } catch (error) {
      this.handleError(error, 'generateAnswer')
      throw error
    }
  }

  async *generateStream(
    input: GenerateAnswerInput,
  ): AsyncIterable<StreamChunk> {
    try {
      // Validate and sanitize input for healthcare compliance
      if (!validatePromptSecurity(input.prompt)) {
        throw new Error('Prompt failed security validation')
      }

      const sanitizedPrompt = sanitizeForAI(input.prompt)

      const stream = await this.client.messages.create({
        model: this.config.model,
        max_tokens: input.maxTokens || 1000,
        temperature: input.temperature || 0.7,
        messages: this.buildMessages(input, sanitizedPrompt),
        stream: true,
      })

      let accumulatedContent = ''

      for await (const messageStreamEvent of stream) {
        if (messageStreamEvent.type === 'content_block_delta') {
          const delta = messageStreamEvent.delta?.text || ''
          accumulatedContent += delta

          const streamChunk: StreamChunk = {
            content: accumulatedContent,
            delta,
            finished: false,
          }

          yield streamChunk
        } else if (messageStreamEvent.type === 'message_stop') {
          // Validate final AI output for healthcare safety
          if (!validateAIOutputSafety(accumulatedContent)) {
            throw new Error('AI output failed safety validation')
          }

          const finalChunk: StreamChunk = {
            content: accumulatedContent,
            delta: '',
            finished: true,
            finishReason: 'stop',
          }

          yield finalChunk

          // Log interaction for audit trail
          this.logInteraction({
            ...input,
            prompt: sanitizedPrompt,
          }, {
            content: accumulatedContent,
            provider: 'anthropic',
          }, 'anthropic')
        }
      }
    } catch (error) {
      this.handleError(error, 'generateStream')
      throw error
    }
  }

  private buildMessages(input: GenerateAnswerInput, sanitizedPrompt: string): any[] {
    const messages: any[] = []

    // Add user message
    messages.push({
      role: 'user',
      content: sanitizedPrompt,
    })

    return messages
  }

  private extractContent(message: any): string {
    if (message.content && Array.isArray(message.content)) {
      return message.content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('')
    }
    return ''
  }

  private mapFinishReason(stopReason?: string): 'stop' | 'length' | 'content_filter' | 'function_call' | undefined {
    switch (stopReason) {
      case 'end_turn':
        return 'stop'
      case 'max_tokens':
        return 'length'
      case 'stop_sequence':
        return 'stop'
      default:
        return undefined
    }
  }

  private logInteraction(
    input: GenerateAnswerInput, 
    result: GenerateAnswerResult | { content: string; provider: string }, 
    provider: string
  ): void {
    // In a real implementation, this would get user/patient context from the calling service
    logAIInteraction({
      userId: 'system', // Should be provided by caller
      clinicId: 'system', // Should be provided by caller
      provider,
      prompt: input.prompt,
      response: result.content,
      timestamp: Date.now(),
    })
  }

  private handleError(error: unknown, method: string): void {
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic ${method} API Error:`, {
        status: error.status,
        message: error.message,
        type: error.type,
        error: error.error,
      })
    } else {
      console.error(`Anthropic ${method} Error:`, error)
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: this.config.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      })
      return true
    } catch (error) {
      console.error('Anthropic health check failed:', error)
      return false
    }
  }

  // Get provider info
  getProviderInfo(): {
    name: string
    model: string
    healthy: boolean
  } {
    return {
      name: 'anthropic',
      model: this.config.model,
      healthy: true, // Will be updated by health check
    }
  }
}
