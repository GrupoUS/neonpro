import { GoogleGenerativeAI } from '@google/generative-ai';
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
 * Google AI Provider Implementation
 * Healthcare-optimized with compliance features for Brazilian regulations
 * Supports Gemini models with multimodal capabilities
 */
export class GoogleAIProvider extends BaseAIProvider implements IUnifiedAIProvider {
  readonly name = 'google';
  readonly model: string;
  readonly capabilities: ProviderCapabilities;
  private readonly client: GoogleGenerativeAI;

  constructor(config: ProviderConfig) {
    super(config);
    this.model = config.model;
    this.capabilities = {
      streaming: true,
      vision: true,
      functionCalling: false, // Limited support in Gemini
      jsonMode: true,
      multimodal: true,
      contextWindow: 32000,
      maxOutputTokens: 2048,
      supportsHealthcare: true,
    };
    
    this.client = new GoogleGenerativeAI(config.apiKey);
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

      const model = this.client.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          maxOutputTokens: options?.maxTokens || this.config.maxTokens,
          temperature: options?.temperature ?? this.config.temperature,
          topP: options?.topP,
          topK: options?.topK,
          stopSequences: options?.stopSequences,
          responseMimeType: options?.jsonMode ? 'application/json' : undefined,
        },
      });

      const formattedPrompt = this.formatPrompt(prompt, options);
      const response = await model.generateContent(formattedPrompt);
      const result = response.response;
      
      const content = this.extractContent(result);
      const usage = this.extractUsage(result);
      const processingTimeMs = Date.now() - startTime;

      // Apply healthcare compliance
      const sanitizedContent = this.sanitizeContent(content, 'completion');

      const completionResponse: CompletionResponse = {
        id: this.generateResponseId(),
        text: sanitizedContent,
        usage,
        finishReason: this.mapFinishReason(result),
        metadata: {
          provider: this.name,
          model: this.model,
          compliance: this.compliance,
          processingTimeMs,
          sanitized: content !== sanitizedContent,
          auditId: this.compliance.auditLogging ? this.generateAuditId() : undefined,
          candidateCount: result.candidates?.length || 1,
          promptFeedback: result.promptFeedback,
        },
      };

      this.updateStats(true, processingTimeMs, usage.totalTokens);

      if (this.compliance.auditLogging) {
        this.logHealthcareAudit('generateCompletion_success', {
          prompt: this.sanitizePrompt(prompt),
          result: { ...completionResponse, text: '[SANITIZED]' },
          processingTimeMs,
        });
      }

      return completionResponse;
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

      const model = this.client.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          maxOutputTokens: options?.maxTokens || this.config.maxTokens,
          temperature: options?.temperature ?? this.config.temperature,
          topP: options?.topP,
          topK: options?.topK,
          stopSequences: options?.stopSequences,
        },
      });

      const formattedPrompt = this.formatPrompt(prompt, options);
      const result = await model.generateContentStream(formattedPrompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();

        if (chunkText) {
          const sanitizedDelta = this.sanitizeContent(chunkText, 'stream');
          
          const streamChunk: CompletionChunk = {
            id: this.generateResponseId(),
            text: sanitizedDelta,
            delta: sanitizedDelta,
            isComplete: false,
            metadata: {
              provider: this.name,
              chunkType: 'streaming_chunk',
              index: 0,
            },
          };
          
          yield streamChunk;
        }
      }

      const processingTimeMs = Date.now() - startTime;

      yield {
        id: this.generateResponseId(),
        text: '',
        delta: '',
        isComplete: true,
        metadata: {
          provider: this.name,
          chunkType: 'stream_complete',
          processingTimeMs,
        },
      };

      if (this.compliance.auditLogging) {
        this.logHealthcareAudit('generateCompletionStream_complete', {
          prompt: this.sanitizePrompt(prompt),
          processingTimeMs,
        });
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

      const model = this.client.getGenerativeModel({ 
        model: 'gemini-pro-vision',
        generationConfig: {
          maxOutputTokens: options?.maxTokens || 1000,
          temperature: options?.temperature ?? 0.7,
        },
      });

      // Prepare image content
      let imageContent;
      if (typeof imageUrl === 'string') {
        // For URLs, we'll need to fetch and convert to base64 or use a different approach
        // For now, we'll use the URL directly if supported
        imageContent = {
          inlineData: {
            data: imageUrl,
            mimeType: 'image/jpeg',
          },
        };
      } else {
        imageContent = {
          inlineData: {
            data: imageUrl.toString('base64'),
            mimeType: 'image/jpeg',
          },
        };
      }

      const formattedPrompt = this.buildHealthcarePrompt(prompt, options?.healthcare);
      
      const response = await model.generateContent([formattedPrompt, imageContent]);
      const result = response.response;
      
      const analysis = this.extractContent(result);
      const usage = this.extractUsage(result);
      const processingTimeMs = Date.now() - startTime;

      // Apply healthcare compliance for medical image analysis
      const sanitizedAnalysis = this.sanitizeContent(analysis, 'image_analysis');

      const analysisResponse: ImageAnalysisResponse = {
        id: this.generateResponseId(),
        analysis: sanitizedAnalysis,
        confidence: this.calculateConfidence(result),
        usage,
        metadata: {
          provider: this.name,
          model: 'gemini-pro-vision',
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

      return analysisResponse;
    }, 'analyzeImage');
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const response = await model.generateContent('health check');
      const result = response.response;

      const responseTime = Date.now() - startTime;
      const stats = this.getStats();

      if (result.candidates && result.candidates.length > 0) {
        return {
          isHealthy: true,
          responseTime,
          latency: responseTime,
          lastCheck: new Date(),
          uptime: stats.errorRate < 0.05 ? 100 : Math.max(0, 100 - (stats.errorRate * 100)),
          errorRate: stats.errorRate,
        };
      } else {
        return {
          isHealthy: false,
          responseTime,
          error: 'Invalid response format',
          lastCheck: new Date(),
        };
      }
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
   * Format prompt for Google AI with healthcare compliance
   */
  private formatPrompt(prompt: string, options?: CompletionOptions): string {
    let formattedPrompt = '';

    // Add system instructions with healthcare compliance
    const systemPrompt = this.buildSystemPrompt(options?.systemPrompt);
    if (systemPrompt) {
      formattedPrompt += `System instructions: ${systemPrompt}\n\n`;
    }

    // Add user prompt with healthcare context
    formattedPrompt += this.buildHealthcarePrompt(prompt, options?.healthcare);

    return formattedPrompt;
  }

  /**
   * Build system prompt with healthcare compliance
   */
  private buildSystemPrompt(customSystemPrompt?: string): string {
    const basePrompt = this.compliance.brazilianContext
      ? `You are a Google AI assistant helping with a Brazilian aesthetic clinic management system.

Healthcare Compliance Requirements:
- LGPD (Lei Geral de Proteção de Dados): Protect all patient personal information
- ANVISA Regulations: Follow Brazilian health surveillance guidelines
- Healthcare Ethics: Maintain professional standards for medical advice
- Aesthetic Medicine Context: Focus on cosmetic procedures and treatments

Key Areas of Support:
- Botox and dermal filler procedures
- Facial treatments and skincare
- Patient consultation guidance
- Clinical documentation assistance
- Professional healthcare communication

Important:
- Provide general information, not specific medical advice
- Always recommend consultation with qualified healthcare professionals
- Consider Brazilian cultural and regulatory context
- Use Portuguese (pt-BR) when appropriate`
      : `You are a helpful AI assistant.`;

    return customSystemPrompt ? `${basePrompt}\n\n${customSystemPrompt}` : basePrompt;
  }

  /**
   * Build healthcare prompt with context
   */
  private buildHealthcarePrompt(prompt: string, healthcare?: CompletionOptions['healthcare']): string {
    let formattedPrompt = prompt;

    if (healthcare?.language === 'pt-BR') {
      formattedPrompt = `[Português/Contexto Brasileiro] ${formattedPrompt}`;
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
      formattedPrompt = `${formattedPrompt}\n\n[Diretriz ANVISA: Fornecer informações gerais, sempre recomendar consulta profissional.]`;
    }

    return formattedPrompt;
  }

  /**
   * Extract content from Google AI response
   */
  private extractContent(result: any): string {
    if (!result.candidates || result.candidates.length === 0) {
      return '';
    }

    const content = result.candidates[0].content;
    if (!content.parts || content.parts.length === 0) {
      return '';
    }

    return content.parts
      .filter((part: any) => part.text)
      .map((part: any) => part.text)
      .join('');
  }

  /**
   * Extract usage information from Google AI response
   */
  private extractUsage(result: any): TokenUsage {
    const usageMetadata = result.usageMetadata || {};
    
    // Calculate cost (rough estimate for Gemini)
    const inputCost = (usageMetadata.promptTokenCount || 0) * 0.000001; // $0.001 per 1K tokens
    const outputCost = (usageMetadata.candidatesTokenCount || 0) * 0.000002; // $0.002 per 1K tokens
    const totalCost = inputCost + outputCost;

    return {
      promptTokens: usageMetadata.promptTokenCount || 0,
      completionTokens: usageMetadata.candidatesTokenCount || 0,
      totalTokens: usageMetadata.totalTokenCount || 0,
      cost: totalCost,
      currency: 'USD',
    };
  }

  /**
   * Map Google AI finish reason to standard format
   */
  private mapFinishReason(result: any): 'stop' | 'length' | 'tool_calls' | 'content_filter' {
    const finishReason = result.candidates?.[0]?.finishReason;
    
    switch (finishReason) {
      case 'STOP':
        return 'stop';
      case 'MAX_TOKENS':
        return 'length';
      case 'SAFETY':
        return 'content_filter';
      case 'RECITATION':
        return 'content_filter';
      default:
        return 'stop';
    }
  }

  /**
   * Calculate confidence score for analysis
   */
  private calculateConfidence(result: any): number {
    // Google AI doesn't provide explicit confidence scores
    // Use candidate count and content length as heuristics
    if (!result.candidates || result.candidates.length === 0) {
      return 0;
    }

    const candidate = result.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      return 0;
    }

    const contentLength = candidate.content.parts
      .filter((part: any) => part.text)
      .reduce((sum: number, part: any) => sum + (part.text?.length || 0), 0);

    // Consider safety ratings
    const safetyRatings = candidate.safetyRatings || [];
    const hasSafetyIssues = safetyRatings.some((rating: any) => 
      rating.probability === 'HIGH' || rating.probability === 'MEDIUM'
    );

    if (hasSafetyIssues) {
      return Math.max(0.3, Math.min(0.7, contentLength / 1000));
    }

    return Math.min(0.9, Math.max(0.5, contentLength / 1000));
  }

  /**
   * Enhanced PII removal for Brazilian healthcare context
   */
  protected sanitizeContent(content: string, context?: string): string {
    let sanitizedContent = super.sanitizeContent(content, context);

    // Additional Brazilian-specific PII patterns
    if (this.compliance.piiRedaction) {
      // Brazilian health insurance numbers
      sanitizedContent = sanitizedContent.replace(/\b(?:Plano de Saúde|Operadora)\s*[:-]?\s*\d+/gi, '[HEALTH_INSURANCE]');
      
      // Brazilian medical procedure codes (TUSS/CBHPM)
      sanitizedContent = sanitizedContent.replace(/\b(?:TUSS|CBHPM)\s*[:-]?\s*\d{6,8}\b/g, '[PROCEDURE_CODE]');
      
      // Brazilian healthcare facility codes (CNES)
      sanitizedContent = sanitizedContent.replace(/\bCNES\s*[:-]?\s*\d{7}\b/g, '[FACILITY_CODE]');
      
      // Brazilian vaccination records
      sanitizedContent = sanitizedContent.replace(/\b(?:Cartão de Vacinação|Registro Vacinal)\s*[:-]?\s*\d+/gi, '[VACCINATION_RECORD]');
    }

    // Enhanced ANVISA compliance
    if (this.compliance.enableANVISA) {
      const prohibitedBrazilianTerms = [
        'tratamento estético garantido',
        'resultado imediato garantido',
        'procedimento indolor',
        'sem efeitos colaterais',
        'recuperação rápida garantida',
        '100% seguro',
        'aprovado pela ANVISA', // Only ANVISA can claim this
      ];

      for (const term of prohibitedBrazilianTerms) {
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
      .replace(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, '[CNPJ]')
      .substring(0, 300);
  }

  /**
   * Generate response ID
   */
  private generateResponseId(): string {
    return `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate audit ID for tracking
   */
  private generateAuditId(): string {
    return `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle Google AI specific errors
   */
  private handleError(error: unknown): never {
    logger.error('Google AI API Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('401')) {
        throw new Error('Invalid Google AI API key');
      }
      if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('429')) {
        throw new Error('Google AI quota exceeded. Please check your usage limits.');
      }
      if (error.message.includes('INTERNAL') || error.message.includes('500')) {
        throw new Error('Google AI service temporarily unavailable. Please try again later.');
      }
      if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        throw new Error('Google AI request timeout. Please try again.');
      }
      if (error.message.includes('network') || error.message.includes('ECONN')) {
        throw new Error('Network error connecting to Google AI. Please check your connection.');
      }
      if (error.message.includes('model_not_found') || error.message.includes('404')) {
        throw new Error(`Model ${this.model} not found. Please check the model name.`);
      }
      if (error.message.includes('SAFETY')) {
        throw new Error('Content blocked by Google AI safety filters. Please modify your request.');
      }
      
      throw new Error(`Google AI API error: ${error.message}`);
    }

    throw new Error('Unknown error occurred with Google AI provider');
  }
}