import { z } from 'zod';
import { logger } from '@neonpro/shared';

/**
 * AI provider interface
 */
export interface IAIProvider {
  readonly name: string;
  readonly model: string;
  readonly maxTokens: number;
  readonly supportsStreaming: boolean;
  readonly supportsVision: boolean;
  
  /**
   * Generate text completion
   */
  generateCompletion(
    prompt: string,
    options?: CompletionOptions
  ): Promise<CompletionResponse>;
  
  /**
   * Generate text completion with streaming
   */
  generateCompletionStream(
    prompt: string,
    options?: CompletionOptions
  ): AsyncIterable<CompletionChunk>;
  
  /**
   * Analyze image content
   */
  analyzeImage(
    imageUrl: string | Buffer,
    prompt: string,
    options?: ImageAnalysisOptions
  ): Promise<ImageAnalysisResponse>;
  
  /**
   * Check if provider is available and healthy
   */
  healthCheck(): Promise<ProviderHealth>;
}

/**
 * Completion options
 */
export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  systemPrompt?: string;
  tools?: Tool[];
  toolChoice?: 'auto' | 'required' | 'none';
}

/**
 * Completion response
 */
export interface CompletionResponse {
  id: string;
  text: string;
  usage: TokenUsage;
  finishReason: 'stop' | 'length' | 'tool_calls';
  toolCalls?: ToolCall[];
  metadata?: Record<string, any>;
}

/**
 * Streaming completion chunk
 */
export interface CompletionChunk {
  id: string;
  text: string;
  isComplete: boolean;
  usage?: TokenUsage;
  toolCalls?: ToolCall[];
}

/**
 * Token usage information
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Image analysis options
 */
export interface ImageAnalysisOptions {
  detail?: 'low' | 'high' | 'auto';
  maxTokens?: number;
  temperature?: number;
}

/**
 * Image analysis response
 */
export interface ImageAnalysisResponse {
  id: string;
  analysis: string;
  confidence?: number;
  usage: TokenUsage;
  metadata?: Record<string, any>;
}

/**
 * Tool definition for function calling
 */
export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

/**
 * Tool call result
 */
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * Provider health status
 */
export interface ProviderHealth {
  isHealthy: boolean;
  responseTime: number;
  rateLimits?: {
    requestsPerMinute: number;
    requestsPerHour: number;
    remainingRequests: number;
    resetTime?: Date;
  };
  error?: string;
}

/**
 * Provider configuration schema
 */
export const ProviderConfigSchema = z.object({
  apiKey: z.string().min(1),
  baseUrl: z.string().url().optional(),
  model: z.string().min(1),
  maxTokens: z.number().int().min(1).max(128000).default(4000),
  temperature: z.number().min(0).max(2).default(0.7),
  timeout: z.number().int().min(1000).max(60000).default(30000),
  retries: z.number().int().min(0).max(5).default(3),
  retryDelay: z.number().int().min(100).max(5000).default(1000),
});

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

/**
 * Abstract base provider implementation
 */
export abstract class BaseProvider implements IAIProvider {
  abstract readonly name: string;
  abstract readonly model: string;
  abstract readonly maxTokens: number;
  abstract readonly supportsStreaming: boolean;
  abstract readonly supportsVision: boolean;
  
  protected constructor(protected readonly config: ProviderConfig) {}
  
  abstract generateCompletion(
    prompt: string,
    options?: CompletionOptions
  ): Promise<CompletionResponse>;
  
  abstract generateCompletionStream(
    prompt: string,
    options?: CompletionOptions
  ): AsyncIterable<CompletionChunk>;
  
  abstract analyzeImage(
    imageUrl: string | Buffer,
    prompt: string,
    options?: ImageAnalysisOptions
  ): Promise<ImageAnalysisResponse>;
  
  abstract healthCheck(): Promise<ProviderHealth>;
  
  /**
   * Validate configuration
   */
  protected validateConfig(): void {
    try {
      ProviderConfigSchema.parse(this.config);
    } catch (error) {
      logger.error('Invalid provider configuration', { 
        provider: this.name, 
        error 
      });
      throw new Error(`Invalid configuration for ${this.name}: ${error}`);
    }
  }
  
  /**
   * Handle API errors with retry logic
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    const { retries, retryDelay } = this.config;
    let lastError: Error;
    
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt <= retries && this.isRetryableError(lastError)) {
          logger.warn(`Retrying ${context}`, {
            provider: this.name,
            attempt,
            maxAttempts: retries + 1,
            error: lastError.message,
          });
          
          await new Promise(resolve => 
            setTimeout(resolve, retryDelay * attempt)
          );
          continue;
        }
        
        logger.error(`${context} failed after ${attempt} attempts`, {
          provider: this.name,
          error: lastError.message,
        });
        
        throw lastError;
      }
    }
    
    throw lastError!;
  }
  
  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const retryableCodes = [
      429, // Too Many Requests
      500, // Internal Server Error
      502, // Bad Gateway
      503, // Service Unavailable
      504, // Gateway Timeout
    ];
    
    // Check for network errors
    if (error.message.includes('ECONNREFUSED') || 
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ENOTFOUND')) {
      return true;
    }
    
    // Check for specific rate limit messages
    if (error.message.includes('rate limit') || 
        error.message.includes('quota exceeded')) {
      return true;
    }
    
    // Check HTTP status codes
    const statusCodeMatch = error.message.match(/status (\d{3})/);
    if (statusCodeMatch) {
      const statusCode = parseInt(statusCodeMatch[1]);
      return retryableCodes.includes(statusCode);
    }
    
    return false;
  }
}