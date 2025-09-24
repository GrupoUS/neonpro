import { GoogleGenerativeAI } from '@google/generative-ai'
import type {
  AIProviderInterface,
  GenerateAnswerInput,
  GenerateAnswerResult,
  StreamChunk,
} from '@neonpro/types'

interface GoogleConfig {
  model?: string
  maxOutputTokens?: number
  temperature?: number
  topK?: number
  topP?: number
  candidateCount?: number
  stopSequences?: string[]
}

interface HealthcareComplianceConfig {
  enableHIPAA?: boolean
  enableLGPD?: boolean
  enableANVISA?: boolean
  auditLogging?: boolean
  dataRetentionDays?: number
}

export class GoogleAIProvider implements AIProviderInterface {
  private readonly client: GoogleGenerativeAI
  private readonly model: string
  private readonly healthcareConfig: HealthcareComplianceConfig

  constructor(
    apiKey: string,
    config: GoogleConfig = {},
    healthcareConfig: HealthcareComplianceConfig = {}
  ) {
    if (!apiKey) {
      throw new Error('Google AI API key is required')
    }

    this.client = new GoogleGenerativeAI(apiKey)

    this.model = config.model || 'gemini-1.5-pro-latest'

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

      const model = this.client.getGenerativeModel({ model: this.model })
      const prompt = this.formatPrompt(input)

      const response = await model.generateContent(prompt)
      const result = response.response
      const content = this.extractContent(result)
      const usage = this.extractUsage(result)
      const processingTimeMs = Date.now() - startTime

      const responseResult: GenerateAnswerResult = {
        content: this.sanitizeContent(content),
        tokensUsed: usage.totalTokens,
        model: this.model,
        provider: 'google',
        finishReason: 'stop',
        metadata: {
          provider: 'google',
          id: result.text || '',
          type: 'text',
          candidateCount: result.candidates?.length || 1,
          promptFeedback: result.promptFeedback,
          processingTimeMs,
          usage,
        },
      }

      if (this.healthcareConfig.auditLogging) {
        this.logHealthcareAudit('generateAnswer_success', {
          input,
          result: responseResult,
          processingTimeMs
        })
      }

      return responseResult
    } catch (error) {
      if (this.healthcareConfig.auditLogging) {
        this.logHealthcareAudit('generateAnswer_error', {
          input,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
          throw new Error('Invalid Google AI API key')
        }
        if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('Rate limit exceeded. Please try again later.')
        }
        if (error.message.includes('INTERNAL')) {
          throw new Error('Google AI service temporarily unavailable')
        }
        throw new Error(`Google AI API error: ${error.message}`)
      }
      throw new Error('Unknown error occurred with Google AI provider')
    }
  }

  async *generateStream(input: GenerateAnswerInput): AsyncIterable<StreamChunk> {
    try {
      const startTime = Date.now()

      if (this.healthcareConfig.auditLogging) {
        this.logHealthcareAudit('generateStream_start', { input })
      }

      const model = this.client.getGenerativeModel({ model: this.model })
      const prompt = this.formatPrompt(input)

      const result = await model.generateContentStream(prompt)

      for await (const chunk of result.stream) {
        const chunkText = chunk.text()

        if (chunkText) {
          const streamChunk: StreamChunk = {
            content: chunkText,
            delta: chunkText,
            finished: false,
            provider: 'google',
            finishReason: undefined,
            metadata: {
              provider: 'google',
              type: 'streaming_chunk',
              chunkIndex: 0,
            },
          }
          yield streamChunk
        }
      }

      const processingTimeMs = Date.now() - startTime

      if (this.healthcareConfig.auditLogging) {
        this.logHealthcareAudit('generateStream_complete', {
          input,
          processingTimeMs
        })
      }

      yield {
        content: '',
        delta: '',
        finished: true,
        provider: 'google',
        finishReason: 'stop',
        metadata: {
          provider: 'google',
          type: 'stream_complete',
          processingTimeMs,
        },
      }
    } catch (error) {
      if (this.healthcareConfig.auditLogging) {
        this.logHealthcareAudit('generateStream_error', {
          input,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
          throw new Error('Invalid Google AI API key')
        }
        if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('Rate limit exceeded. Please try again later.')
        }
        if (error.message.includes('INTERNAL')) {
          throw new Error('Google AI service temporarily unavailable')
        }
        throw new Error(`Google AI streaming error: ${error.message}`)
      }
      throw new Error('Unknown error occurred with Google AI streaming')
    }
  }

  private formatPrompt(input: GenerateAnswerInput): string {
    let prompt = ''

    if (input.system) {
      prompt += `System instructions: ${input.system}\n\n`
    }

    prompt += input.prompt

    return prompt
  }

  private extractContent(result: any): string {
    if (!result.candidates || result.candidates.length === 0) {
      return ''
    }

    const content = result.candidates[0].content
    if (!content.parts || content.parts.length === 0) {
      return ''
    }

    return content.parts
      .filter((part: any) => part.text)
      .map((part: any) => part.text)
      .join('')
  }

  private extractUsage(result: any) {
    return {
      promptTokens: result.usageMetadata?.promptTokenCount || 0,
      completionTokens: result.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: result.usageMetadata?.totalTokenCount || 0,
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
    if (!this.healthcareConfig.auditLogging) {return}

    const auditLog = {
      timestamp: new Date().toISOString(),
      provider: 'google',
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
