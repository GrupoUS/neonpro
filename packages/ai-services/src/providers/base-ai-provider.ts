import { z } from 'zod';
import { healthcareLogger as logger } from '@neonpro/shared';

/**
 * Healthcare compliance configuration for Brazilian regulations
 */
export interface HealthcareComplianceConfig {
  enableHIPAA?: boolean;
  enableLGPD?: boolean;
  enableANVISA?: boolean;
  enableCFM?: boolean;
  auditLogging?: boolean;
  dataRetentionDays?: number;
  piiRedaction?: boolean;
  brazilianContext?: boolean;
}

/**
 * Provider capabilities interface
 */
export interface ProviderCapabilities {
  streaming: boolean;
  vision: boolean;
  functionCalling: boolean;
  jsonMode: boolean;
  multimodal: boolean;
  contextWindow: number;
  maxOutputTokens: number;
  supportsHealthcare?: boolean;
}

/**
 * Token usage and cost tracking
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number; // in USD
  currency?: string;
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
 * Provider health status with detailed metrics
 */
export interface ProviderHealth {
  isHealthy: boolean;
  responseTime: number;
  latency?: number;
  rateLimits?: {
    requestsPerMinute: number;
    requestsPerHour: number;
    remainingRequests: number;
    resetTime?: Date;
  };
  error?: string;
  lastCheck?: Date;
  uptime?: number;
  errorRate?: number;
}

/**
 * Provider usage statistics
 */
export interface ProviderStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  lastUsed?: Date;
  errorRate: number;
}

/**
 * Completion options with healthcare-specific settings
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
  jsonMode?: boolean;
  healthcare?: {
    enablePIIRedaction?: boolean;
    enableAuditLogging?: boolean;
    context?: 'clinical' | 'administrative' | 'research';
    language?: 'pt-BR' | 'en-US';
  };
}

/**
 * Completion response with healthcare metadata
 */
export interface CompletionResponse {
  id: string;
  text: string;
  usage: TokenUsage;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  toolCalls?: ToolCall[];
  metadata?: {
    provider: string;
    model: string;
    compliance?: HealthcareComplianceConfig;
    processingTimeMs?: number;
    sanitized?: boolean;
    auditId?: string;
  };
}

/**
 * Streaming completion chunk
 */
export interface CompletionChunk {
  id: string;
  text: string;
  delta?: string;
  isComplete: boolean;
  usage?: TokenUsage;
  toolCalls?: ToolCall[];
  metadata?: {
    provider: string;
    chunkType?: string;
    index?: number;
  };
}

/**
 * Image analysis options with healthcare considerations
 */
export interface ImageAnalysisOptions {
  detail?: 'low' | 'high' | 'auto';
  maxTokens?: number;
  temperature?: number;
  healthcare?: {
    enableDiagnosis?: boolean;
    enableRedaction?: boolean;
    analysisType?: 'general' | 'medical' | 'dermatological' | 'radiological';
  };
}

/**
 * Image analysis response
 */
export interface ImageAnalysisResponse {
  id: string;
  analysis: string;
  confidence?: number;
  usage: TokenUsage;
  metadata?: {
    provider: string;
    model: string;
    imageType?: string;
    dimensions?: { width: number; height: number };
    processingTimeMs?: number;
  };
}

/**
 * Provider configuration schema with validation
 */
export const ProviderConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  baseUrl: z.string().url().optional(),
  model: z.string().min(1, 'Model is required'),
  maxTokens: z.number().int().min(1).max(128000).default(4000),
  temperature: z.number().min(0).max(2).default(0.7),
  timeout: z.number().int().min(1000).max(60000).default(30000),
  retries: z.number().int().min(0).max(5).default(3),
  retryDelay: z.number().int().min(100).max(5000).default(1000),
  healthcare: z.object({
    enableHIPAA: z.boolean().default(false),
    enableLGPD: z.boolean().default(true),
    enableANVISA: z.boolean().default(true),
    enableCFM: z.boolean().default(true),
    auditLogging: z.boolean().default(true),
    dataRetentionDays: z.number().int().min(1).max(3650).default(365),
    piiRedaction: z.boolean().default(true),
    brazilianContext: z.boolean().default(true),
  }).default({
    enableHIPAA: false,
    enableLGPD: true,
    enableANVISA: true,
    enableCFM: true,
    auditLogging: true,
    dataRetentionDays: 365,
    piiRedaction: true,
    brazilianContext: true,
  }),
});

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

/**
 * Unified AI Provider interface for all implementations
 */
export interface IUnifiedAIProvider {
  readonly name: string;
  readonly model: string;
  readonly capabilities: ProviderCapabilities;
  readonly config: ProviderConfig;
  
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
   * Analyze image content (if supported)
   */
  analyzeImage?(
    imageUrl: string | Buffer,
    prompt: string,
    options?: ImageAnalysisOptions
  ): Promise<ImageAnalysisResponse>;
  
  /**
   * Check if provider is available and healthy
   */
  healthCheck(): Promise<ProviderHealth>;
  
  /**
   * Get provider usage statistics
   */
  getStats(): ProviderStats;
  
  /**
   * Get healthcare compliance configuration
   */
  getHealthcareConfig(): HealthcareComplianceConfig;
  
  /**
   * Update healthcare compliance configuration
   */
  updateHealthcareConfig(config: Partial<HealthcareComplianceConfig>): void;
  
  /**
   * Reset usage statistics
   */
  resetStats(): void;
}

/**
 * Abstract base provider with common functionality
 */
export abstract class BaseAIProvider implements IUnifiedAIProvider {
  abstract readonly name: string;
  abstract readonly model: string;
  abstract readonly capabilities: ProviderCapabilities;
  
  public readonly config: ProviderConfig;
  protected stats: ProviderStats;
  protected compliance: HealthcareComplianceConfig;
  
  protected constructor(config: ProviderConfig) {
    this.config = ProviderConfigSchema.parse(config);
    this.compliance = this.config.healthcare;
    this.stats = this.initializeStats();
  }
  
  protected initializeStats(): ProviderStats {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageResponseTime: 0,
      errorRate: 0,
    };
  }
  
  abstract generateCompletion(
    prompt: string,
    options?: CompletionOptions
  ): Promise<CompletionResponse>;
  
  abstract generateCompletionStream(
    prompt: string,
    options?: CompletionOptions
  ): AsyncIterable<CompletionChunk>;
  
  abstract analyzeImage?(
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
        const startTime = Date.now();
        const result = await operation();
        const responseTime = Date.now() - startTime;
        
        // Update stats
        this.updateStats(true, responseTime, 0);
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const responseTime = Date.now() - (this.stats.lastUsed?.getTime() || Date.now());
        
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
        
        // Update error stats
        this.updateStats(false, responseTime, 0);
        
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
   * Update provider statistics
   */
  protected updateStats(success: boolean, responseTime: number, tokens: number): void {
    this.stats.totalRequests++;
    this.stats.lastUsed = new Date();
    
    if (success) {
      this.stats.successfulRequests++;
      this.stats.totalTokens += tokens;
      
      // Update average response time
      if (this.stats.averageResponseTime === 0) {
        this.stats.averageResponseTime = responseTime;
      } else {
        this.stats.averageResponseTime = 
          (this.stats.averageResponseTime * (this.stats.successfulRequests - 1) + responseTime) / 
          this.stats.successfulRequests;
      }
    } else {
      this.stats.failedRequests++;
    }
    
    // Update error rate
    this.stats.errorRate = this.stats.failedRequests / this.stats.totalRequests;
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
  
  /**
   * Log healthcare audit event
   */
  protected logHealthcareAudit(event: string, data: any): void {
    if (!this.compliance.auditLogging) return;
    
    const auditLog = {
      timestamp: new Date().toISOString(),
      provider: this.name,
      event,
      data: this.sanitizeAuditData(data),
      compliance: {
        HIPAA: this.compliance.enableHIPAA,
        LGPD: this.compliance.enableLGPD,
        ANVISA: this.compliance.enableANVISA,
        CFM: this.compliance.enableCFM,
      },
    };
    
    logger.info('[Healthcare Audit]', auditLog);
  }
  
  /**
   * Sanitize audit data for logging
   */
  private sanitizeAuditData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && key.toLowerCase().includes('key')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  /**
   * Sanitize content for healthcare compliance
   */
  protected sanitizeContent(content: string, context?: string): string {
    let sanitizedContent = content;
    
    if (this.compliance.piiRedaction) {
      sanitizedContent = this.removePHI(sanitizedContent);
    }
    
    if (this.compliance.enableANVISA) {
      sanitizedContent = this.ensureANVISACompliance(sanitizedContent);
    }
    
    return sanitizedContent.trim();
  }
  
  /**
   * Remove Protected Health Information (PHI)
   */
  private removePHI(content: string): string {
    const phiPatterns = [
      // SSN (US)
      /\b\d{3}-\d{2}-\d{4}\b/g,
      // CPF (Brazil)
      /\b\d{3}\.\d{3}\.\d{3}-\d{1}\b/g,
      // Phone numbers
      /\b\+?1?\d{10,11}\b/g,
      // Email addresses
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      // Medical record numbers
      /\bMRN\s*\d{6,10}\b/gi,
      // Dates (various formats)
      /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
    ];
    
    let sanitizedContent = content;
    for (const pattern of phiPatterns) {
      sanitizedContent = sanitizedContent.replace(pattern, '[REDACTED]');
    }
    
    return sanitizedContent;
  }
  
  /**
   * Ensure ANVISA compliance for Brazilian healthcare
   */
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
      'cirurgia',
      'cirurgião',
    ];
    
    let compliantContent = content;
    for (const term of prohibitedTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      compliantContent = compliantContent.replace(regex, `[REDACTED: ${term.toUpperCase()}]`);
    }
    
    return compliantContent;
  }
  
  /**
   * Get provider statistics
   */
  getStats(): ProviderStats {
    return { ...this.stats };
  }
  
  /**
   * Get healthcare compliance configuration
   */
  getHealthcareConfig(): HealthcareComplianceConfig {
    return { ...this.compliance };
  }
  
  /**
   * Update healthcare compliance configuration
   */
  updateHealthcareConfig(config: Partial<HealthcareComplianceConfig>): void {
    this.compliance = { ...this.compliance, ...config };
    logger.info('Healthcare compliance config updated', {
      provider: this.name,
      config: this.compliance,
    });
  }
  
  /**
   * Reset usage statistics
   */
  resetStats(): void {
    this.stats = this.initializeStats();
    logger.info('Provider statistics reset', { provider: this.name });
  }
}