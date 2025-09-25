import OpenAI from 'openai'
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
} from '../../../apps/api/src/services/ai-security-service.js'

interface OpenAIConfig {
  apiKey: string
  model?: string
  baseUrl?: string
  timeout?: number
  maxRetries?: number
}

export class OpenAIProvider implements AIProvider {
  private readonly client: OpenAI
  private readonly config: Required<OpenAIConfig>

  constructor(config: OpenAIConfig) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required')
    }

    this.config = {
      model: config.model || 'gpt-4',
      baseUrl: config.baseUrl,
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      apiKey: config.apiKey,
    }

    this.client = new OpenAI({
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

      const messages = this.buildMessages(input, sanitizedPrompt)

      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages,
        max_tokens: input.maxTokens || 1000,
        temperature: input.temperature || 0.7,
        stream: false,
      })

      const content = completion.choices[0]?.message?.content || ''
      
      // Validate AI output for healthcare safety
      if (!validateAIOutputSafety(content)) {
        throw new Error('AI output failed safety validation')
      }

      const result: GenerateAnswerResult = {
        content,
        tokensUsed: completion.usage?.total_tokens,
        model: completion.model,
        finishReason: this.mapFinishReason(completion.choices[0]?.finish_reason),
      }

      // Log interaction for audit trail
      this.logInteraction(input, result, 'openai')

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
      const messages = this.buildMessages(input, sanitizedPrompt)

      const stream = await this.client.chat.completions.create({
        model: this.config.model,
        messages,
        max_tokens: input.maxTokens || 1000,
        temperature: input.temperature || 0.7,
        stream: true,
      })

      let accumulatedContent = ''

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || ''
        accumulatedContent += delta

        const streamChunk: StreamChunk = {
          content: accumulatedContent,
          delta,
          finished: chunk.choices[0]?.finish_reason !== null,
          finishReason: this.mapFinishReason(chunk.choices[0]?.finish_reason),
        }

        yield streamChunk
      }

      // Validate final AI output for healthcare safety
      if (!validateAIOutputSafety(accumulatedContent)) {
        throw new Error('AI output failed safety validation')
      }

      // Log interaction for audit trail
      this.logInteraction({
        ...input,
        prompt: sanitizedPrompt,
      }, {
        content: accumulatedContent,
        provider: 'openai',
      }, 'openai')

    } catch (error) {
      this.handleError(error, 'generateStream')
      throw error
    }
  }

  private buildMessages(input: GenerateAnswerInput, sanitizedPrompt: string): any[] {
    const messages: any[] = []

    // Add system message if provided
    if (input.system) {
      messages.push({
        role: 'system',
        content: input.system,
      })
    }

    // Add user message
    messages.push({
      role: 'user',
      content: sanitizedPrompt,
    })

    return messages
  }

  private mapFinishReason(finishReason?: string): 'stop' | 'length' | 'content_filter' | 'function_call' | undefined {
    switch (finishReason) {
      case 'stop':
        return 'stop'
      case 'length':
        return 'length'
      case 'content_filter':
        return 'content_filter'
      case 'function_call':
        return 'function_call'
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
    if (error instanceof OpenAI.APIError) {
      console.error(`OpenAI ${method} API Error:`, {
        status: error.status,
        message: error.message,
        type: error.type,
        code: error.code,
        requestId: error.requestId,
      })
    } else {
      console.error(`OpenAI ${method} Error:`, error)
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list()
      return true
    } catch (error) {
      console.error('OpenAI health check failed:', error)
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
      name: 'openai',
      model: this.config.model,
      healthy: true, // Will be updated by health check
    }
  }
}
