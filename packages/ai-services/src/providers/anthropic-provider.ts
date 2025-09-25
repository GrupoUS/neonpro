import { Anthropic } from '@anthropic-ai/sdk';
import {
  BaseAIProvider,
  IUnifiedAIProvider,
  ProviderConfig,
  ProviderHealth,
  ProviderCapabilities,
  CompletionResponse,
  CompletionChunk,
  CompletionOptions,
  ImageAnalysisResponse,
  ImageAnalysisOptions,
  TokenUsage
} from './base-ai-provider.js';
import { healthcareLogger as logger } from '@neonpro/shared';

/**
 * Anthropic Provider Implementation
 * Healthcare-optimized with comprehensive compliance features
 * Optimized for Brazilian healthcare regulations (LGPD, ANVISA, CFM)
 */
export class AnthropicProvider extends BaseAIProvider implements IUnifiedAIProvider {
  readonly name = 'anthropic';
  readonly model: string;
  readonly capabilities: ProviderCapabilities;
  private readonly client: Anthropic;

  constructor(config: ProviderConfig) {
    super(config);
    this.model = config.model;
    this.capabilities = {
      streaming: true,
      vision: true,
      functionCalling: true,
      jsonMode: true,
      multimodal: true,
      contextWindow: 200000,
      maxOutputTokens: 8192,
      supportsHealthcare: true,
    };
    
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  async generateCompletion(
    prompt: string,
    options?: CompletionOptions
  ): Promise<CompletionResponse> {
    return this.withRetry(async () => {
      const startTime = Date.now();
      
      if (this.compliance.auditLogging) {
        this.logHealthcareAudit('generateCompletion_start', { 
          prompt: this.sanitizePrompt(prompt), 
          options 
        });
      }

      const messages = this.formatMessages(prompt, options);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.maxTokens || this.config.maxTokens,
        temperature: options?.temperature ?? this.config.temperature,
        top_p: options?.topP,
        top_k: options?.topK,
        stop_sequences: options?.stopSequences,
        messages,
        stream: false,
      });

      const content = this.extractContent(response);
      const usage = this.extractUsage(response);
      const processingTimeMs = Date.now() - startTime;

      // Apply healthcare compliance
      const sanitizedContent = this.sanitizeContent(content, 'completion');

      const result: CompletionResponse = {
        id: response.id,
        text: sanitizedContent,
        usage,
        finishReason: this.mapFinishReason(response.stop_reason),
        metadata: {
          provider: this.name,
          model: this.model,
          compliance: this.compliance,
          processingTimeMs,
          sanitized: content !== sanitizedContent,
          auditId: this.compliance.auditLogging ? this.generateAuditId() : undefined,
        },
      };

      this.updateStats(true, processingTimeMs, usage.totalTokens);

      if (this.compliance.auditLogging) {
        this.logHealthcareAudit('generateCompletion_success', {
          prompt: this.sanitizePrompt(prompt),
          result: { ...result, text: '[SANITIZED]' },
          processingTimeMs,
        });
      }

      return result;
    }, 'generateCompletion');
  }

  async *generateCompletionStream(
    prompt: string,
    options?: CompletionOptions
  ): AsyncIterable<CompletionChunk> {
    try {
      const startTime = Date.now();
      
      if (this.compliance.auditLogging) {
        this.logHealthcareAudit('generateCompletionStream_start', { 
          prompt: this.sanitizePrompt(prompt), 
          options 
        });
      }

      const messages = this.formatMessages(prompt, options);

      const stream = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.maxTokens || this.config.maxTokens,
        temperature: options?.temperature ?? this.config.temperature,
        top_p: options?.topP,
        top_k: options?.topK,
        stop_sequences: options?.stopSequences,
        messages,
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          const delta = (chunk.delta as any).text || '';
          const sanitizedDelta = this.sanitizeContent(delta, 'stream');
          
          const streamChunk: CompletionChunk = {
            id: 'anthropic-stream',
            text: sanitizedDelta,
            delta: sanitizedDelta,
            isComplete: false,
            metadata: {
              provider: this.name,
              chunkType: chunk.type,
              index: chunk.index,
            },
          };
          
          yield streamChunk;
        }

        if (chunk.type === 'message_stop') {
          const processingTimeMs = Date.now() - startTime;
          
          const finalChunk: CompletionChunk = {
            id: 'anthropic-complete',
            text: '',
            delta: '',
            isComplete: true,
            metadata: {
              provider: this.name,
              chunkType: 'completion',
            },
          };
          
          yield finalChunk;

          if (this.compliance.auditLogging) {
            this.logHealthcareAudit('generateCompletionStream_complete', {
              prompt: this.sanitizePrompt(prompt),
              processingTimeMs,
            });
          }
        }
      }
    } catch (error) {
      const processingTimeMs = Date.now() - (this.stats.lastUsed?.getTime() || Date.now());
      
      if (this.compliance.auditLogging) {
        this.logHealthcareAudit('generateCompletionStream_error', {
          prompt: this.sanitizePrompt(prompt),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      this.updateStats(false, processingTimeMs, 0);

      throw this.handleError(error);
    }
  }

  async analyzeImage(
    imageUrl: string | Buffer,
    prompt: string,
    options?: ImageAnalysisOptions
  ): Promise<ImageAnalysisResponse> {
    if (!this.capabilities.vision) {
      throw new Error('Image analysis not supported by this provider');
    }

    return this.withRetry(async () => {
      const startTime = Date.now();
      
      if (this.compliance.auditLogging) {
        this.logHealthcareAudit('analyzeImage_start', { 
          prompt: this.sanitizePrompt(prompt), 
          options,
          imageType: typeof imageUrl === 'string' ? 'url' : 'buffer'
        });
      }

      // Format image content for Anthropic
      const imageContent = typeof imageUrl === 'string'
        ? { type: 'image' as const, source: { type: 'url' as const, url: imageUrl } }
        : { type: 'image' as const, source: { type: 'base64' as const, media_type: 'image/jpeg' as const, data: imageUrl.toString('base64') } };

      const message = {
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: this.buildHealthcarePrompt(prompt, this.convertImageHealthcareOptions(options?.healthcare)) },
          imageContent,
        ],
      };

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature ?? 0.7,
        messages: [message],
      });

      const analysis = this.extractContent(response);
      const usage = this.extractUsage(response);
      const processingTimeMs = Date.now() - startTime;

      // Apply healthcare compliance for medical image analysis
      const sanitizedAnalysis = this.sanitizeContent(analysis, 'image_analysis');

      const result: ImageAnalysisResponse = {
        id: response.id,
        analysis: sanitizedAnalysis,
        confidence: this.calculateConfidence(response),
        usage,
        metadata: {
          provider: this.name,
          model: this.model,
          imageType: typeof imageUrl === 'string' ? 'url' : 'buffer',
          processingTimeMs,
        },
      };

      this.updateStats(true, processingTimeMs, usage.totalTokens);

      if (this.compliance.auditLogging) {
        this.logHealthcareAudit('analyzeImage_success', {
          prompt: this.sanitizePrompt(prompt),
          analysis: '[SANITIZED]',
          processingTimeMs,
        });
      }

      return result;
    }, 'analyzeImage');
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        temperature: 0,
        messages: [{ role: 'user', content: 'health check' }],
      });

      const responseTime = Date.now() - startTime;
      const stats = this.getStats();

      return {
        isHealthy: true,
        responseTime,
        latency: responseTime,
        lastCheck: new Date(),
        uptime: stats.errorRate < 0.05 ? 100 : Math.max(0, 100 - (stats.errorRate * 100)),
        errorRate: stats.errorRate,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        isHealthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date(),
      };
    }
  }

  /**
   * Format messages for Anthropic API with healthcare compliance
   */
  private formatMessages(
    prompt: string,
    options?: CompletionOptions
  ): Array<any> {
    const messages: Array<any> = [];

    // Add system message with healthcare compliance
    const systemPrompt = this.buildSystemPrompt(options?.systemPrompt);
    if (systemPrompt) {
      messages.push({
        role: 'user',
        content: `System instructions: ${systemPrompt}`,
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: this.buildHealthcarePrompt(prompt, options?.healthcare),
    });

    return messages;
  }

  /**
   * Build system prompt with healthcare compliance
   */
  private buildSystemPrompt(customSystemPrompt?: string): string {
    const basePrompt = this.compliance.brazilianContext
      ? `You are Claude, an AI assistant helping with a Brazilian aesthetic clinic management system.

Healthcare Compliance Guidelines:
- LGPD (Lei Geral de Proteção de Dados): Strict patient data privacy protection
- ANVISA Compliance: Follow Brazilian health surveillance regulations
- CFM (Conselho Federal de Medicina): Adhere to medical ethics standards
- Aesthetic Medicine Context: Focus on evidence-based cosmetic procedures

Key Areas:
- Botox and dermal fillers
- Facial treatments and skincare
- Patient consultation and management
- Clinical documentation and procedures
- Professional healthcare communication

Communication Style:
- Professional and ethical
- Evidence-based information
- Clear and accurate explanations
- Cultural awareness for Brazilian context
- Portuguese (pt-BR) when appropriate`
      : `You are Claude, an AI assistant created by Anthropic.`;

    return customSystemPrompt ? `${basePrompt}\n\n${customSystemPrompt}` : basePrompt;
  }

  /**
   * Build healthcare prompt with context
   */
  private buildHealthcarePrompt(prompt: string, healthcare?: CompletionOptions['healthcare']): string {
    let formattedPrompt = prompt;

    if (healthcare?.language === 'pt-BR') {
      formattedPrompt = `[Contexto Brasileiro/Português] ${formattedPrompt}`;
    }

    if (healthcare?.context) {
      const contextMap = {
        clinical: '[Contexto Clínico]',
        administrative: '[Contexto Administrativo]',
        research: '[Contexto de Pesquisa]',
      };
      formattedPrompt = `${contextMap[healthcare.context]} ${formattedPrompt}`;
    }

    if (this.compliance.enableANVISA) {
      formattedPrompt = `${formattedPrompt}\n\n[Nota: Seguir diretrizes da ANVISA para informações de saúde.]`;
    }

    return formattedPrompt;
  }

  /**
   * Extract content from Anthropic response
   */
  private extractContent(response: any): string {
    if (!response.content || response.content.length === 0) {
      return '';
    }

    const textContent = response.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('');

    return textContent;
  }

  /**
   * Extract usage information from Anthropic response
   */
  private extractUsage(response: any): TokenUsage {
    const usage = response.usage || {};
    
    // Calculate cost (rough estimate for Claude)
    const inputCost = (usage.input_tokens || 0) * 0.000015; // $0.015 per 1K tokens
    const outputCost = (usage.output_tokens || 0) * 0.000075; // $0.075 per 1K tokens
    const totalCost = inputCost + outputCost;

    return {
      promptTokens: usage.input_tokens || 0,
      completionTokens: usage.output_tokens || 0,
      totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
      cost: totalCost,
      currency: 'USD',
    };
  }

  /**
   * Map Anthropic finish reason to standard format
   */
  private mapFinishReason(stopReason: string | null): 'stop' | 'length' | 'tool_calls' | 'content_filter' {
    switch (stopReason) {
      case 'end_turn':
      case 'stop_sequence':
        return 'stop';
      case 'max_tokens':
        return 'length';
      case 'tool_use':
        return 'tool_calls';
      default:
        return 'stop';
    }
  }

  /**
   * Calculate confidence score for analysis
   */
  private calculateConfidence(response: any): number {
    // Anthropic doesn't provide confidence scores, so we estimate based on content
    if (!response.content || response.content.length === 0) {
      return 0;
    }

    const contentLength = response.content
      .filter((block: any) => block.type === 'text')
      .reduce((sum: number, block: any) => sum + (block.text?.length || 0), 0);

    // Simple heuristic: longer, more detailed responses get higher confidence
    return Math.min(0.95, Math.max(0.5, contentLength / 1000));
  }

  /**
   * Enhanced PII removal for healthcare context
   */
  protected sanitizeContent(content: string, context?: string): string {
    let sanitizedContent = super.sanitizeContent(content, context);

    // Additional healthcare-specific PII patterns
    if (this.compliance.piiRedaction) {
      // Medical record numbers
      sanitizedContent = sanitizedContent.replace(/\b(?:MRN|Medical Record|Prontuário)\s*[:\-]?\s*\d+/gi, '[MEDICAL_RECORD]');
      
      // Healthcare professional licenses (CRM, COREN, etc.)
      sanitizedContent = sanitizedContent.replace(/\b(?:CRM|COREN|CFF|CREFITO)\s*[:\-]?\s*[A-Z]{0,2}\/\d+/gi, '[LICENSE]');
      
      // Brazilian healthcare identifiers
      sanitizedContent = sanitizedContent.replace(/\b(?:CNS|Cartão SUS)\s*[:\-]?\s*\d{15}\b/g, '[HEALTH_ID]');
      
      // Procedure codes
      sanitizedContent = sanitizedContent.replace(/\b(?:CID-10|CBHPM|TUSS)\s*[:\-]?\s*[A-Z]\d{2}(?:\.\d+)?/gi, '[PROCEDURE_CODE]');
      
      // Medical device identifiers
      sanitizedContent = sanitizedContent.replace(/\b(?:Registro ANVISA)\s*[:\-]?\s*\d+/gi, '[DEVICE_ID]');
    }

    // Enhanced ANVISA compliance
    if (this.compliance.enableANVISA) {
      const prohibitedHealthTerms = [
        'diagnóstico definitivo',
        'tratamento garantido',
        'cura garantida',
        'procedimento seguro',
        'sem riscos',
        'resultado certo',
        '100% eficaz',
      ];

      for (const term of prohibitedHealthTerms) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        sanitizedContent = sanitizedContent.replace(regex, '[REDACTED: ANVISA]');
      }
    }

    return sanitizedContent.trim();
  }

  /**
   * Sanitize prompt for audit logging
   */
  private sanitizePrompt(prompt: string): string {
    return prompt
      .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{1,2}\b/g, '[PHONE]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{1}\b/g, '[CPF]')
      .substring(0, 300);
  }

  /**
   * Generate audit ID for tracking
   */
  private generateAuditId(): string {
    return `anthropic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert ImageAnalysisOptions healthcare to CompletionOptions healthcare format
   */
  private convertImageHealthcareOptions(healthcare?: ImageAnalysisOptions['healthcare']): CompletionOptions['healthcare'] | undefined {
    if (!healthcare) return undefined;

    return {
      enablePIIRedaction: healthcare.enableRedaction,
      enableAuditLogging: false, // Not available in ImageAnalysisOptions
      context: healthcare.analysisType === 'medical' ? 'clinical' : 'administrative',
      language: 'pt-BR' // Default for healthcare context
    };
  }

  /**
   * Handle Anthropic specific errors
   */
  private handleError(error: unknown): never {
    logger.error('Anthropic API Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('api_key') || error.message.includes('401')) {
        throw new Error('Invalid Anthropic API key');
      }
      if (error.message.includes('rate_limit') || error.message.includes('429')) {
        throw new Error('Anthropic rate limit exceeded. Please try again later.');
      }
      if (error.message.includes('quota') || error.message.includes('overloaded')) {
        throw new Error('Anthropic service overloaded. Please try again later.');
      }
      if (error.message.includes('timeout')) {
        throw new Error('Anthropic request timeout. Please try again.');
      }
      if (error.message.includes('network') || error.message.includes('ECONN')) {
        throw new Error('Network error connecting to Anthropic. Please check your connection.');
      }
      if (error.message.includes('model_not_found') || error.message.includes('404')) {
        throw new Error(`Model ${this.model} not found. Please check the model name.`);
      }
      
      throw new Error(`Anthropic API error: ${error.message}`);
    }

    throw new Error('Unknown error occurred with Anthropic provider');
  }
}