import OpenAI from 'openai';
import { 
  BaseAIProvider, 
  IUnifiedAIProvider, 
  ProviderConfig, 
  ProviderHealth, 
  ProviderStats, 
  ProviderCapabilities,
  CompletionResponse,
  CompletionChunk,
  CompletionOptions,
  ImageAnalysisResponse,
  ImageAnalysisOptions,
  TokenUsage,
  Tool,
  ToolCall,
  HealthcareComplianceConfig
} from './base-ai-provider.js';
import { healthcareLogger as logger } from '@neonpro/shared';

/**
 * OpenAI Provider Implementation
 * Healthcare-optimized with compliance features for Brazilian regulations
 */
export class OpenAIProvider extends BaseAIProvider implements IUnifiedAIProvider {
  readonly name = 'openai';
  readonly model: string;
  readonly capabilities: ProviderCapabilities;
  private readonly client: OpenAI;

  constructor(config: ProviderConfig) {
    super(config);
    this.model = config.model;
    this.capabilities = {
      streaming: true,
      vision: true,
      functionCalling: true,
      jsonMode: true,
      multimodal: true,
      contextWindow: 128000,
      maxOutputTokens: 4096,
      supportsHealthcare: true,
    };
    
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeout,
      maxRetries: config.retries,
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

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: options?.maxTokens || this.config.maxTokens,
        temperature: options?.temperature ?? this.config.temperature,
        top_p: options?.topP,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false,
        tools: options?.tools,
        tool_choice: options?.toolChoice,
        response_format: options?.jsonMode ? { type: 'json_object' } : undefined,
      });

      const choice = response.choices[0];
      if (!choice || !choice.message) {
        throw new Error('Invalid response from OpenAI API');
      }

      const content = choice.message.content || '';
      const usage = this.extractUsage(response.usage);
      const processingTimeMs = Date.now() - startTime;

      // Apply healthcare compliance
      const sanitizedContent = this.sanitizeContent(content, 'completion');

      const result: CompletionResponse = {
        id: response.id,
        text: sanitizedContent,
        usage,
        finishReason: this.mapFinishReason(choice.finish_reason),
        toolCalls: choice.message.tool_calls?.map(this.mapToolCall),
        metadata: {
          provider: this.name,
          model: this.model,
          compliance: this.compliance,
          processingTimeMs,
          sanitized: content !== sanitizedContent,
          auditId: this.compliance.auditLogging ? this.generateAuditId() : undefined,
          systemFingerprint: response.system_fingerprint,
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

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: options?.maxTokens || this.config.maxTokens,
        temperature: options?.temperature ?? this.config.temperature,
        top_p: options?.topP,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true,
        tools: options?.tools,
        tool_choice: options?.toolChoice,
        response_format: options?.jsonMode ? { type: 'json_object' } : undefined,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        const toolCallChunks = chunk.choices[0]?.delta?.tool_calls || [];

        if (delta || toolCallChunks.length > 0) {
          const sanitizedDelta = this.sanitizeContent(delta, 'stream');
          
          const streamChunk: CompletionChunk = {
            id: chunk.id,
            text: sanitizedDelta,
            delta: sanitizedDelta,
            isComplete: false,
            usage: chunk.usage ? this.extractUsage(chunk.usage) : undefined,
            toolCalls: toolCallChunks.map(this.mapToolCall),
            metadata: {
              provider: this.name,
              chunkType: 'content',
              index: chunk.choices[0]?.index,
            },
          };
          
          yield streamChunk;
        }

        if (chunk.choices[0]?.finish_reason) {
          const processingTimeMs = Date.now() - startTime;
          
          const finalChunk: CompletionChunk = {
            id: chunk.id,
            text: '',
            delta: '',
            isComplete: true,
            usage: chunk.usage ? this.extractUsage(chunk.usage) : undefined,
            metadata: {
              provider: this.name,
              chunkType: 'completion',
              processingTimeMs,
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

      const content = typeof imageUrl === 'string' 
        ? [{ type: 'text' as const, text: prompt }, { type: 'image_url' as const, image_url: { url: imageUrl } }]
        : [{ type: 'text' as const, text: prompt }, { type: 'image_url' as const, image_url: { url: `data:image/jpeg;base64,${imageUrl.toString('base64')}` } }];

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-vision-preview', // Use vision model
        messages: [{ role: 'user', content }],
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature ?? 0.7,
      });

      const choice = response.choices[0];
      if (!choice || !choice.message) {
        throw new Error('Invalid response from OpenAI Vision API');
      }

      const analysis = choice.message.content || '';
      const usage = this.extractUsage(response.usage);
      const processingTimeMs = Date.now() - startTime;

      // Apply healthcare compliance for medical image analysis
      const sanitizedAnalysis = this.sanitizeContent(analysis, 'image_analysis');

      const result: ImageAnalysisResponse = {
        id: response.id,
        analysis: sanitizedAnalysis,
        confidence: 0.85, // OpenAI doesn't provide confidence scores
        usage,
        metadata: {
          provider: this.name,
          model: 'gpt-4-vision-preview',
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
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'health check' }],
        max_tokens: 1,
        temperature: 0,
      });

      const responseTime = Date.now() - startTime;

      if (response.choices && response.choices.length > 0) {
        const stats = this.getStats();
        
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
   * Format messages for OpenAI API with healthcare context
   */
  private formatMessages(
    prompt: string,
    options?: CompletionOptions
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    // Add system message with healthcare compliance
    const systemPrompt = this.buildSystemPrompt(options?.systemPrompt);
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: this.formatUserMessage(prompt, options?.healthcare),
    });

    return messages;
  }

  /**
   * Build system prompt with healthcare compliance
   */
  private buildSystemPrompt(customSystemPrompt?: string): string {
    const basePrompt = this.compliance.brazilianContext 
      ? `You are assisting with a Brazilian aesthetic clinic management system.
Important guidelines:
- Follow LGPD (Lei Geral de Proteção de Dados) for patient data privacy
- Provide information relevant to aesthetic procedures (botox, fillers, facial treatments)
- Consider professional healthcare context (CFM, COREN, CFF, CNEP)
- Maintain professional and ethical standards
- Focus on evidence-based aesthetic medicine practices
- Use Portuguese (pt-BR) when appropriate for Brazilian context`
      : `You are a helpful AI assistant.`;

    return customSystemPrompt ? `${basePrompt}\n\n${customSystemPrompt}` : basePrompt;
  }

  /**
   * Format user message with healthcare context
   */
  private formatUserMessage(prompt: string, healthcare?: CompletionOptions['healthcare']): string {
    let formattedPrompt = prompt;

    if (healthcare?.language === 'pt-BR') {
      formattedPrompt = `[Portuguese/Brazilian Context] ${formattedPrompt}`;
    }

    if (healthcare?.context) {
      const contextMap = {
        clinical: '[Clinical Context]',
        administrative: '[Administrative Context]',
        research: '[Research Context]',
      };
      formattedPrompt = `${contextMap[healthcare.context]} ${formattedPrompt}`;
    }

    return formattedPrompt;
  }

  /**
   * Extract usage information from OpenAI response
   */
  private extractUsage(usage: any): TokenUsage {
    if (!usage) {
      return {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };
    }

    // Calculate cost (rough estimate)
    const inputCost = (usage.prompt_tokens || 0) * 0.00001; // $0.01 per 1K tokens
    const outputCost = (usage.completion_tokens || 0) * 0.00003; // $0.03 per 1K tokens
    const totalCost = inputCost + outputCost;

    return {
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      cost: totalCost,
      currency: 'USD',
    };
  }

  /**
   * Map OpenAI finish reason to standard format
   */
  private mapFinishReason(finishReason: string | null): 'stop' | 'length' | 'tool_calls' | 'content_filter' {
    switch (finishReason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'tool_calls':
        return 'tool_calls';
      case 'content_filter':
        return 'content_filter';
      default:
        return 'stop';
    }
  }

  /**
   * Map OpenAI tool call to standard format
   */
  private mapToolCall(toolCall: any): ToolCall {
    return {
      id: toolCall.id,
      type: 'function',
      function: {
        name: toolCall.function.name,
        arguments: toolCall.function.arguments,
      },
    };
  }

  /**
   * Sanitize prompt for audit logging
   */
  private sanitizePrompt(prompt: string): string {
    // Remove potential PII from prompts for logging
    return prompt.replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{1,2}\b/g, '[PHONE]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .substring(0, 200); // Truncate long prompts
  }

  /**
   * Generate audit ID for tracking
   */
  private generateAuditId(): string {
    return `openai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle OpenAI specific errors
   */
  private handleError(error: unknown): never {
    logger.error('OpenAI API Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('api_key')) {
        throw new Error('Invalid OpenAI API key');
      }
      if (error.message.includes('rate_limit') || error.message.includes('429')) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      }
      if (error.message.includes('quota') || error.message.includes('insufficient_quota')) {
        throw new Error('OpenAI quota exceeded. Please check your plan and billing details.');
      }
      if (error.message.includes('timeout') || error.message.includes('timeout')) {
        throw new Error('OpenAI request timeout. Please try again.');
      }
      if (error.message.includes('network') || error.message.includes('ECONN')) {
        throw new Error('Network error connecting to OpenAI. Please check your connection.');
      }
      if (error.message.includes('model_not_found')) {
        throw new Error(`Model ${this.model} not found. Please check the model name.`);
      }
      
      throw new Error(`OpenAI API error: ${error.message}`);
    }

    throw new Error('Unknown error occurred with OpenAI provider');
  }
}