// Core provider types
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

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
  currency?: string;
}