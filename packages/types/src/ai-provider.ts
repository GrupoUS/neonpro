// AI Provider Types - Shared across packages

export type AIProvider = "openai" | "anthropic" | "google" | "mock";

export interface AIProviderRateLimits {
  requestsPerMinute?: number;
  tokensPerMinute?: number;
  concurrentRequests?: number;
}

export interface AIProviderConfig {
  enabled: boolean;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  baseUrl?: string;
  models?: {
    default?: string;
    streaming?: string;
    fast?: string;
    [key: string]: string | undefined;
  };
  rateLimits?: AIProviderRateLimits;
}

export interface GenerateAnswerInput {
  prompt: string;
  locale?: "pt-BR" | "en-US";
  system?: string;
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateAnswerResult {
  content: string;
  tokensUsed?: number;
  model?: string;
  provider?: AIProvider;
  finishReason?: "stop" | "length" | "content_filter" | "function_call";
  metadata?: Record<string, unknown>;
}

export interface StreamChunk {
  content: string;
  delta?: string;
  finished: boolean;
  provider?: AIProvider;
  finishReason?: "stop" | "length" | "content_filter" | "function_call";
  metadata?: Record<string, unknown>;
}

export interface AIProviderInterface {
  generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerResult>;
  generateStream?(input: GenerateAnswerInput): AsyncIterable<StreamChunk>;
}

// Message types for AI interactions
export interface AIMessage {
  _role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
}

// Chat-related types
export interface ChatResponse {
  id: string;
  content: string;
  _role: "assistant";
  model?: string;
  provider: AIProvider;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
  usage?: {
    input: number;
    output: number;
    total: number;
  };
  metadata?: {
    finishReason?: "stop" | "length" | "content_filter" | "function_call";
    processingTime?: number;
    [key: string]: unknown;
  };
  timestamp: Date;
}

export interface StreamingChatResponse {
  id: string;
  stream:
    | ReadableStream<any>
    | AsyncIterable<{
        content: string;
        delta?: string;
        finished: boolean;
        tokens?: {
          input: number;
          output: number;
          total: number;
        };
        metadata?: {
          finishReason?: "stop" | "length" | "content_filter" | "function_call";
          processingTime?: number;
          [key: string]: unknown;
        };
      }>;
  provider: AIProvider;
  model?: string;
  timestamp?: Date;
  metadata?: {
    [key: string]: unknown;
  };
}
