/**
 * Rate Limit Service
 * Provides rate limiting functionality for API endpoints with healthcare compliance
 */

import { z } from 'zod';

/**
 * Rate limit rule schema for validation
 */
export const RateLimitRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  endpoint: z.string().regex(/^\/.*$/), // Must start with /
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']),
  windowMs: z.number().int().min(1000).max(3600000), // 1 second to 1 hour
  maxRequests: z.number().int().min(1).max(10000),
  skipSuccessfulRequests: z.boolean().default(false),
  skipFailedRequests: z.boolean().default(false),
  enabled: z.boolean().default(true),
  skipIps: z.array(z.string().ip()).default([]),
  message: z.string().optional(),
  headers: z.boolean().default(true),
  draft: z.boolean().default(false),
  standardHeaders: z.boolean().default(true),
  legacyHeaders: z.boolean().default(false),
  store: z.string().default('memory'),
  keyGenerator: z.string().optional(),
  handler: z.string().optional(),
  onLimitReached: z.string().optional(),
  requestPropertyName: z.string().default('rateLimit'),
  passOnStoreError: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type RateLimitRule = z.infer<typeof RateLimitRuleSchema>;

/**
 * Rate limit evaluation result
 */
export interface RateLimitEvaluation {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
  totalHits: number;
}

/**
 * Create a new rate limit rule
 */
export function createRateLimitRule(data: Partial<RateLimitRule>): RateLimitRule {
  const now = new Date().toISOString();

  const ruleData = {
    id: crypto.randomUUID(),
    name: data.name || 'Default Rule',
    endpoint: data.endpoint || '/api/*',
    method: data.method || 'GET',
    windowMs: data.windowMs || 60000, // 1 minute
    maxRequests: data.maxRequests || 100,
    skipSuccessfulRequests: data.skipSuccessfulRequests || false,
    skipFailedRequests: data.skipFailedRequests || false,
    enabled: data.enabled ?? true,
    skipIps: data.skipIps || [],
    message: data.message || 'Too many requests',
    headers: data.headers ?? true,
    draft: data.draft || false,
    standardHeaders: data.standardHeaders ?? true,
    legacyHeaders: data.legacyHeaders || false,
    store: data.store || 'memory',
    keyGenerator: data.keyGenerator,
    handler: data.handler,
    onLimitReached: data.onLimitReached,
    requestPropertyName: data.requestPropertyName || 'rateLimit',
    passOnStoreError: data.passOnStoreError ?? true,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    ...data,
  };

  return RateLimitRuleSchema.parse(ruleData);
}

/**
 * Evaluate rate limit for a request
 */
export function evaluateRateLimit(
  clientId: string,
  rule: RateLimitRule,
  currentTime: Date = new Date(),
): RateLimitEvaluation {
  // In a real implementation, this would check against a store (Redis, memory, etc.)
  // For now, we'll simulate rate limiting logic

  const windowStart = new Date(currentTime.getTime() - rule.windowMs);

  // Simulate current usage (in real implementation, this would come from store)
  const currentUsage = Math.floor(Math.random() * rule.maxRequests);

  const remaining = Math.max(0, rule.maxRequests - currentUsage - 1);
  const allowed = currentUsage < rule.maxRequests;

  const resetTime = new Date(
    Math.ceil(currentTime.getTime() / rule.windowMs) * rule.windowMs,
  );

  const result: RateLimitEvaluation = {
    allowed,
    limit: rule.maxRequests,
    remaining,
    reset: resetTime,
    totalHits: currentUsage + 1,
  };

  if (!allowed) {
    result.retryAfter = Math.ceil((resetTime.getTime() - currentTime.getTime()) / 1000);
  }

  return result;
}

/**
 * Get rate limit status for a client
 */
export function getRateLimitStatus(
  clientId: string,
  rule: RateLimitRule,
): RateLimitEvaluation {
  return evaluateRateLimit(clientId, rule);
}

/**
 * Reset rate limit for a client
 */
export function resetRateLimit(clientId: string, ruleId: string): boolean {
  // In real implementation, this would clear the store for the client/rule combination
  return true;
}

/**
 * Healthcare-specific rate limiting presets
 */
export const HealthcareRateLimitPresets = {
  patientData: {
    windowMs: 60000, // 1 minute
    maxRequests: 30, // Conservative for patient data access
    message: 'Too many patient data requests. Please wait before trying again.',
  },
  aiAnalysis: {
    windowMs: 60000, // 1 minute
    maxRequests: 10, // AI analysis is resource intensive
    message: 'Too many AI analysis requests. Please wait before submitting another analysis.',
  },
  publicAPI: {
    windowMs: 60000, // 1 minute
    maxRequests: 100, // Standard public API rate
    message: 'Rate limit exceeded. Please try again later.',
  },
  sensitiveOperations: {
    windowMs: 300000, // 5 minutes
    maxRequests: 5, // Very conservative for sensitive operations
    message: 'Rate limit for sensitive operations exceeded. Please wait before trying again.',
  },
} as const;

/**
 * Default rate limit rules for healthcare API
 */
export const defaultHealthcareRules = [
  createRateLimitRule({
    name: 'Patient Data Access',
    endpoint: '/api/v2/patients/*',
    method: 'GET',
    ...HealthcareRateLimitPresets.patientData,
  }),
  createRateLimitRule({
    name: 'AI Analysis',
    endpoint: '/api/v*/ai/*',
    method: 'POST',
    ...HealthcareRateLimitPresets.aiAnalysis,
  }),
  createRateLimitRule({
    name: 'Public API',
    endpoint: '/api/*',
    method: 'GET',
    ...HealthcareRateLimitPresets.publicAPI,
  }),
];
