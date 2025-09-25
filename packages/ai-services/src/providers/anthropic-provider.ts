import Anthropic from '@anthropic-ai/sdk';
import { 
  BaseProvider, 
  ProviderConfig, 
  CompletionOptions, 
  CompletionResponse, 
  CompletionChunk,
  ImageAnalysisOptions,
  ImageAnalysisResponse,
  ProviderHealth,
  TokenUsage,
  Tool,
  ToolCall
} from './base-provider';
import { logger } from '@neonpro/shared';

export class AnthropicProvider extends BaseProvider {
  readonly name = 'anthropic';
  readonly model: string;
  readonly maxTokens = 200000;
  readonly supportsStreaming = true;
  readonly supportsVision = true;
  
  private client: Anthropic;

  constructor(config: ProviderConfig) {
    super(config);
    this.model = config.model || 'claude-3-sonnet-20240229';
    this.validateConfig();
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  async generateCompletion(
    prompt: string,
    options: CompletionOptions = {}
  ): Promise<CompletionResponse> {
    return this.withRetry(async () => {
      const systemPrompt = options.systemPrompt || this.getDefaultSystemPrompt();
      
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: options.maxTokens || this.config.maxTokens,
        temperature: options.temperature ?? this.config.temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stop_sequences: options.stopSequences,
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected content type from Anthropic');
      }

      return {
        id: message.id,
        text: content.text,
        usage: this.mapUsage(message.usage),
        finishReason: message.stop_reason === 'end_turn' ? 'stop' : 'length',
        metadata: {
          model: message.model,
          stopReason: message.stop_reason,
        }
      };
    }, 'generateCompletion');
  }

  async* generateCompletionStream(
    prompt: string,
    options: CompletionOptions = {}
  ): AsyncIterable<CompletionChunk> {
    const systemPrompt = options.systemPrompt || this.getDefaultSystemPrompt();
    
    const stream = await this.withRetry(async () => {
      return this.client.messages.create({
        model: this.model,
        max_tokens: options.maxTokens || this.config.maxTokens,
        temperature: options.temperature ?? this.config.temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stop_sequences: options.stopSequences,
        stream: true,
      });
    }, 'generateCompletionStream');

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        yield {
          id: chunk.message.id,
          text: chunk.delta.text || '',
          isComplete: false,
        };
      } else if (chunk.type === 'message_stop') {
        yield {
          id: chunk.message.id,
          text: '',
          isComplete: true,
        };
      }
    }
  }

  async analyzeImage(
    imageUrl: string | Buffer,
    prompt: string,
    options: ImageAnalysisOptions = {}
  ): Promise<ImageAnalysisResponse> {
    return this.withRetry(async () => {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: options.maxTokens || this.config.maxTokens,
        temperature: options.temperature ?? this.config.temperature,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image',
                source: {
                  type: imageUrl instanceof Buffer ? 'base64' : 'url',
                  media_type: 'image/jpeg',
                  data: imageUrl instanceof Buffer 
                    ? imageUrl.toString('base64')
                    : imageUrl
                }
              }
            ]
          }
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected content type from Anthropic image analysis');
      }

      return {
        id: message.id,
        analysis: content.text,
        usage: this.mapUsage(message.usage),
        metadata: {
          model: message.model,
        }
      };
    }, 'analyzeImage');
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    
    try {
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });

      const responseTime = Date.now() - startTime;
      
      return {
        isHealthy: true,
        responseTime,
        rateLimits: {
          requestsPerMinute: 1000,
          requestsPerHour: 50000,
          remainingRequests: 48000,
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logger.error('Anthropic health check failed', { error });
      
      return {
        isHealthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private getDefaultSystemPrompt(): string {
    return `You are a helpful AI assistant for the NeonPro healthcare platform. 
    Provide accurate, helpful information while maintaining patient privacy and 
    following healthcare best practices. Always clarify that you are not a medical 
    professional and that users should consult with qualified healthcare providers.`;
  }

  private mapUsage(usage: any): TokenUsage {
    return {
      promptTokens: usage.input_tokens,
      completionTokens: usage.output_tokens,
      totalTokens: usage.input_tokens + usage.output_tokens,
    };
  }
}