/**
 * Error types and error handling for unified AI provider system
 */

import { z } from 'zod';

/**
 * Base error class for AI provider system
 */
export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider?: string,
    public readonly severity: ErrorSeverity = 'error',
    public readonly retryable: boolean = false,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

/**
 * Error severity levels
 */
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Error categories
 */
export type ErrorCategory = 
  | 'authentication'
  | 'authorization'
  | 'rate_limit'
  | 'quota'
  | 'network'
  | 'timeout'
  | 'validation'
  | 'parsing'
  | 'compliance'
  | 'configuration'
  | 'internal';

/**
 * Error codes
 */
export const ErrorCodes = {
  // Authentication and Authorization
  INVALID_API_KEY: 'INVALID_API_KEY',
  EXPIRED_API_KEY: 'EXPIRED_API_KEY',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Rate Limiting and Quota
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  DAILY_LIMIT_REACHED: 'DAILY_LIMIT_REACHED',

  // Network and Timeout
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',
  DNS_RESOLUTION_FAILED: 'DNS_RESOLUTION_FAILED',

  // Request and Response
  INVALID_REQUEST: 'INVALID_REQUEST',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  PARSING_ERROR: 'PARSING_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Provider Specific
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
  PROVIDER_TIMEOUT: 'PROVIDER_TIMEOUT',
  PROVIDER_ERROR: 'PROVIDER_ERROR',

  // Compliance
  COMPLIANCE_VIOLATION: 'COMPLIANCE_VIOLATION',
  PII_DETECTED: 'PII_DETECTED',
  CONTENT_FILTERED: 'CONTENT_FILTERED',

  // Configuration
  INVALID_CONFIG: 'INVALID_CONFIG',
  MISSING_CONFIG: 'MISSING_CONFIG',
  MODEL_NOT_SUPPORTED: 'MODEL_NOT_SUPPORTED',

  // Internal
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Error context information
 */
export interface ErrorContext {
  provider?: string;
  model?: string;
  endpoint?: string;
  requestId?: string;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
  additional?: Record<string, any>;
}

/**
 * Error details for logging and debugging
 */
export interface ErrorDetails {
  stack?: string;
  cause?: Error;
  statusCode?: number;
  headers?: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  retryAttempts?: number;
  duration?: number;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  remainingRequests: number;
  resetTime?: Date;
  retryAfter?: number;
}

/**
 * Quota information
 */
export interface QuotaInfo {
  monthlyLimit: number;
  monthlyUsage: number;
  dailyLimit: number;
  dailyUsage: number;
  resetDate?: Date;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

/**
 * Error handler function type
 */
export type ErrorHandler = (error: AIProviderError, context?: ErrorContext) => void;

/**
 * Error reporter interface
 */
export interface ErrorReporter {
  report(error: AIProviderError, context?: ErrorContext): Promise<void>;
  getErrors(filters?: ErrorFilters): Promise<AIProviderError[]>;
  clearErrors(olderThan?: Date): Promise<number>;
}

/**
 * Error filtering options
 */
export interface ErrorFilters {
  severity?: ErrorSeverity[];
  category?: ErrorCategory[];
  provider?: string[];
  code?: string[];
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}

/**
 * Error statistics
 */
export interface ErrorStats {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsByProvider: Record<string, number>;
  errorsByCode: Record<string, number>;
  retryableErrors: number;
  nonRetryableErrors: number;
  averageResolutionTime?: number;
}

/**
 * Zod schemas for validation
 */
export const ErrorContextSchema = z.object({
  provider: z.string().optional(),
  model: z.string().optional(),
  endpoint: z.string().optional(),
  requestId: z.string().optional(),
  timestamp: z.date().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  additional: z.record(z.any()).optional(),
});

export const ErrorDetailsSchema = z.object({
  stack: z.string().optional(),
  cause: z.instanceof(Error).optional(),
  statusCode: z.number().int().optional(),
  headers: z.record(z.string()).optional(),
  requestBody: z.any().optional(),
  responseBody: z.any().optional(),
  retryAttempts: z.number().int().optional(),
  duration: z.number().optional(),
});

export const RateLimitInfoSchema = z.object({
  requestsPerMinute: z.number().int().min(0),
  requestsPerHour: z.number().int().min(0),
  requestsPerDay: z.number().int().min(0),
  remainingRequests: z.number().int().min(0),
  resetTime: z.date().optional(),
  retryAfter: z.number().optional(),
});

export const QuotaInfoSchema = z.object({
  monthlyLimit: z.number().int().min(0),
  monthlyUsage: z.number().int().min(0),
  dailyLimit: z.number().int().min(0),
  dailyUsage: z.number().int().min(0),
  resetDate: z.date().optional(),
});

export const RetryConfigSchema = z.object({
  maxAttempts: z.number().int().min(1).max(10).default(3),
  baseDelayMs: z.number().int().min(100).max(10000).default(1000),
  maxDelayMs: z.number().int().min(1000).max(60000).default(30000),
  backoffMultiplier: z.number().min(1).max(5).default(2),
  retryableErrors: z.array(z.string()).default([
    'RATE_LIMIT_EXCEEDED',
    'QUOTA_EXCEEDED',
    'NETWORK_ERROR',
    'TIMEOUT',
    'PROVIDER_UNAVAILABLE',
    'PROVIDER_TIMEOUT',
  ]),
});

export const ErrorFiltersSchema = z.object({
  severity: z.array(z.enum(['info', 'warning', 'error', 'critical'])).optional(),
  category: z.array(z.enum([
    'authentication', 'authorization', 'rate_limit', 'quota', 'network',
    'timeout', 'validation', 'parsing', 'compliance', 'configuration', 'internal'
  ])).optional(),
  provider: z.array(z.string()).optional(),
  code: z.array(z.string()).optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
  limit: z.number().int().min(1).max(1000).optional(),
});

export type ErrorContextType = z.infer<typeof ErrorContextSchema>;
export type ErrorDetailsType = z.infer<typeof ErrorDetailsSchema>;
export type RateLimitInfoType = z.infer<typeof RateLimitInfoSchema>;
export type QuotaInfoType = z.infer<typeof QuotaInfoSchema>;
export type RetryConfigType = z.infer<typeof RetryConfigSchema>;
export type ErrorFiltersType = z.infer<typeof ErrorFiltersSchema>;

// Helper functions
export function isRetryableError(error: AIProviderError): boolean {
  return error.retryable;
}

export function getErrorCategory(code: string): ErrorCategory {
  const categoryMap: Record<string, ErrorCategory> = {
    'INVALID_API_KEY': 'authentication',
    'EXPIRED_API_KEY': 'authentication',
    'UNAUTHORIZED': 'authorization',
    'FORBIDDEN': 'authorization',
    'RATE_LIMIT_EXCEEDED': 'rate_limit',
    'QUOTA_EXCEEDED': 'quota',
    'DAILY_LIMIT_REACHED': 'quota',
    'NETWORK_ERROR': 'network',
    'TIMEOUT': 'timeout',
    'CONNECTION_REFUSED': 'network',
    'DNS_RESOLUTION_FAILED': 'network',
    'INVALID_REQUEST': 'validation',
    'INVALID_RESPONSE': 'parsing',
    'PARSING_ERROR': 'parsing',
    'VALIDATION_ERROR': 'validation',
    'PROVIDER_UNAVAILABLE': 'network',
    'PROVIDER_TIMEOUT': 'timeout',
    'PROVIDER_ERROR': 'internal',
    'COMPLIANCE_VIOLATION': 'compliance',
    'PII_DETECTED': 'compliance',
    'CONTENT_FILTERED': 'compliance',
    'INVALID_CONFIG': 'configuration',
    'MISSING_CONFIG': 'configuration',
    'MODEL_NOT_SUPPORTED': 'configuration',
    'INTERNAL_ERROR': 'internal',
    'UNKNOWN_ERROR': 'internal',
  };

  return categoryMap[code] || 'internal';
}