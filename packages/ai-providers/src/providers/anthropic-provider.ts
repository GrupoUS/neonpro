import { Anthropic } from '@anthropic-ai/sdk'
import type {
  AIProviderInterface,
  GenerateAnswerInput,
  GenerateAnswerResult,
  StreamChunk,
} from '../types/index.js'

interface AnthropicConfig {
  model?: string
  maxTokens?: number
  temperature?: number
  topP?: number
  topK?: number
  stopSequences?: string[]
}

interface HealthcareComplianceConfig {
  enableHIPAA?: boolean
  enableLGPD?: boolean
  enableANVISA?: boolean
  auditLogging?: boolean
  dataRetentionDays?: number
}

export class AnthropicProvider implements AIProviderInterface {
  private readonly client: Anthropic
  private readonly model: string
  private readonly maxTokens: number
  private readonly temperature: number
  private readonly topP: number
  private readonly topK: number
  private readonly stopSequences: string[]
  private readonly healthcareConfig: HealthcareComplianceConfig

  constructor(
    apiKey: string,
    config: AnthropicConfig = {},
    healthcareConfig: HealthcareComplianceConfig = {},
  ) {
    if (!apiKey) {
      throw new Error('Anthropic API key is required')
    }

    this.client = new Anthropic({
      apiKey,
      baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
    })

    this.model = config.model || 'claude-3-5-sonnet-20241022'
    this.maxTokens = config.maxTokens || 4096
    this.temperature = config.temperature || 0.7
    this.topP = config.topP || 0.9
    this.topK = config.topK || 40
    this.stopSequences = config.stopSequences || []

    this.healthcareConfig = {
      enableHIPAA: true,
      enableLGPD: true,
      enableANVISA: true,
      auditLogging: true,
      dataRetentionDays: 365,
      ...healthcareConfig,
    }
  }

  async generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerResult> {
    try {
      const startTime = Date.now()

      if (this.healthcareConfig.auditLogging) {
        this.logHealthcareAudit('generateAnswer_start', { input })
      }

      const messages = this.formatMessages(input)

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        top_p: this.topP,
        top_k: this.topK,
        stop_sequences: this.stopSequences.length > 0 ? this.stopSequences : undefined,
        messages,
        stream: false,
      })

      const content = this.extractContent(response)
      const usage = this.extractUsage(response)
      const processingTimeMs = Date.now() - startTime

      const result: GenerateAnswerResult = {
        content,
        tokensUsed: usage.totalTokens,
        model: this.model,
        provider: 'anthropic',
        finishReason: 'stop',
        metadata: {
          provider: 'anthropic',
          id: response.id,
          type: response.type,
          role: response.role,
          stopReason: response.stop_reason,
          stopSequence: response.stop_sequence,
          processingTimeMs,
          usage,
        },
      }

      if (this.healthcareConfig.auditLogging) {
        this.logHealthcareAudit('generateAnswer_success', {
          input,
          result,
          processingTimeMs,
        })
      }

      return result
    } catch (error) {
      if (this.healthcareConfig.auditLogging) {
        this.logHealthcareAudit('generateAnswer_error', {
          input,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }

      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('Invalid Anthropic API key')
        }
        if (error.message.includes('429')) {
          throw new Error('Rate limit exceeded. Please try again later.')
        }
        if (error.message.includes('500')) {
          throw new Error('Anthropic service temporarily unavailable')
        }
        throw new Error(`Anthropic API error: ${error.message}`)
      }
      throw new Error('Unknown error occurred with Anthropic provider')
    }
  }

  async *generateStream(input: GenerateAnswerInput): AsyncIterable<StreamChunk> {
    try {
      const startTime = Date.now()

      if (this.healthcareConfig.auditLogging) {
        this.logHealthcareAudit('generateStream_start', { input })
      }

      const messages = this.formatMessages(input)

      const stream = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        top_p: this.topP,
        top_k: this.topK,
        stop_sequences: this.stopSequences.length > 0 ? this.stopSequences : undefined,
        messages,
        stream: true,
      })

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          const text = (chunk.delta as any).text || ''
          const streamChunk: StreamChunk = {
            content: text,
            delta: text,
            finished: false,
            provider: 'anthropic',
            finishReason: undefined,
            metadata: {
              provider: 'anthropic',
              type: chunk.type,
              index: chunk.index,
            },
          }
          yield streamChunk
        }

        if (chunk.type === 'message_stop') {
          const processingTimeMs = Date.now() - startTime

          if (this.healthcareConfig.auditLogging) {
            this.logHealthcareAudit('generateStream_complete', {
              input,
              processingTimeMs,
            })
          }

          yield {
            content: '',
            delta: '',
            finished: true,
            provider: 'anthropic',
            finishReason: 'stop',
            metadata: {
              provider: 'anthropic',
              type: 'stream_complete',
              processingTimeMs,
            },
          }
        }
      }
    } catch (error) {
      if (this.healthcareConfig.auditLogging) {
        this.logHealthcareAudit('generateStream_error', {
          input,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }

      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('Invalid Anthropic API key')
        }
        if (error.message.includes('429')) {
          throw new Error('Rate limit exceeded. Please try again later.')
        }
        if (error.message.includes('500')) {
          throw new Error('Anthropic service temporarily unavailable')
        }
        throw new Error(`Anthropic streaming error: ${error.message}`)
      }
      throw new Error('Unknown error occurred with Anthropic streaming')
    }
  }

  private formatMessages(input: GenerateAnswerInput): Array<any> {
    const messages: Array<any> = []

    if (input.system) {
      messages.push({
        role: 'user',
        content: `System instructions: ${input.system}`,
      })
    }

    messages.push({
      role: 'user',
      content: input.prompt,
    })

    return messages
  }

  private extractContent(response: any): string {
    if (!response.content || response.content.length === 0) {
      return ''
    }

    const textContent = response.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('')

    return this.sanitizeContent(textContent)
  }

  private extractUsage(response: any) {
    return {
      promptTokens: response.usage?.input_tokens || 0,
      completionTokens: response.usage?.output_tokens || 0,
      totalTokens: response.usage?.input_tokens + response.usage?.output_tokens || 0,
    }
  }

  private sanitizeContent(content: string): string {
    if (this.healthcareConfig.enableHIPAA || this.healthcareConfig.enableLGPD) {
      content = this.removePHI(content)
    }

    if (this.healthcareConfig.enableANVISA) {
      content = this.ensureANVISACompliance(content)
    }

    return content.trim()
  }

  private removePHI(content: string): string {
    const phiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/g,
      /\b\d{2}\.\d{3}\.\d{3}-\d{1}\b/g,
      /\b\d{11}\b/g,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    ]

    let sanitizedContent = content
    for (const pattern of phiPatterns) {
      sanitizedContent = sanitizedContent.replace(pattern, '[REDACTED]')
    }

    return sanitizedContent
  }

  private ensureANVISACompliance(content: string): string {
    const prohibitedTerms = [
      'cura',
      'tratamento',
      'diagnóstico',
      'prevenção',
      'terapia',
      'medicamento',
      'remédio',
      'fármaco',
    ]

    let compliantContent = content
    for (const term of prohibitedTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi')
      compliantContent = compliantContent.replace(regex, `[REDACTED: ${term.toUpperCase()}]`)
    }

    return compliantContent
  }

  private logHealthcareAudit(event: string, data: any): void {
    if (!this.healthcareConfig.auditLogging) return

    const auditLog = {
      timestamp: new Date().toISOString(),
      provider: 'anthropic',
      event,
      data: this.sanitizeAuditData(data),
      compliance: {
        HIPAA: this.healthcareConfig.enableHIPAA,
        LGPD: this.healthcareConfig.enableLGPD,
        ANVISA: this.healthcareConfig.enableANVISA,
      },
    }

    console.log('[Healthcare Audit]', JSON.stringify(auditLog, null, 2))
  }

  private sanitizeAuditData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data
    }

    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && key.toLowerCase().includes('key')) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  getHealthcareConfig(): HealthcareComplianceConfig {
    return { ...this.healthcareConfig }
  }

  updateHealthcareConfig(config: Partial<HealthcareComplianceConfig>): void {
    const newConfig = { ...this.healthcareConfig, ...config }
    Object.assign(this, { healthcareConfig: newConfig })
  }
}
