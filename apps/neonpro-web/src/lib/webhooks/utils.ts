/**
 * Webhook & Event System Utilities
 * Story 7.3: Webhook & Event System Implementation
 *
 * This module provides utility functions for the webhook and event system:
 * - Event validation and transformation
 * - Webhook signature generation and validation
 * - Rate limiting utilities
 * - Retry logic helpers
 * - Payload formatting and sanitization
 * - Security and validation helpers
 */

import crypto from "node:crypto";
import type { BaseEvent, EventPriority, EventType, RetryStrategy, WebhookEndpoint } from "./types";

/**
 * Event Utilities
 */
export class EventUtils {
  /**
   * Validate event data structure
   */
  static validateEvent(event: Partial<BaseEvent>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!event.type) {
      errors.push("Event type is required");
    }

    if (!event.source) {
      errors.push("Event source is required");
    }

    if (!event.data) {
      errors.push("Event data is required");
    }

    if (!event.metadata?.clinicId) {
      errors.push("Clinic ID is required in metadata");
    }

    // Validate event type
    const validEventTypes: EventType[] = [
      "patient.created",
      "patient.updated",
      "patient.deleted",
      "appointment.created",
      "appointment.updated",
      "appointment.cancelled",
      "appointment.completed",
      "payment.created",
      "payment.updated",
      "payment.completed",
      "payment.failed",
      "invoice.created",
      "invoice.updated",
      "invoice.sent",
      "invoice.paid",
      "invoice.overdue",
      "notification.sent",
      "notification.failed",
      "system.error",
      "system.maintenance",
    ];

    if (event.type && !validEventTypes.includes(event.type as EventType)) {
      errors.push(`Invalid event type: ${event.type}`);
    }

    // Validate priority
    const validPriorities: EventPriority[] = ["low", "normal", "high", "critical"];
    if (event.priority && !validPriorities.includes(event.priority)) {
      errors.push(`Invalid event priority: ${event.priority}`);
    }

    // Validate version format
    if (event.version && !/^\d+\.\d+\.\d+$/.test(event.version)) {
      errors.push("Event version must follow semantic versioning (e.g., 1.0.0)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize event data for webhook delivery
   */
  static sanitizeEventForWebhook(event: BaseEvent, _webhook: WebhookEndpoint): any {
    const sanitized = {
      id: event.id,
      type: event.type,
      version: event.version,
      timestamp: event.timestamp.toISOString(),
      source: event.source,
      priority: event.priority,
      data: EventUtils.sanitizeEventData(event.data),
      metadata: {
        ...event.metadata,
        // Remove sensitive metadata if needed
        internalId: undefined,
        debugInfo: undefined,
      },
      context: event.context,
    };

    // Remove undefined values
    return JSON.parse(JSON.stringify(sanitized));
  }

  /**
   * Sanitize sensitive data from event payload
   */
  private static sanitizeEventData(data: any): any {
    if (!data || typeof data !== "object") {
      return data;
    }

    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "key",
      "apiKey",
      "creditCard",
      "ssn",
      "cpf",
      "bankAccount",
    ];

    const sanitized = { ...data };

    // Remove or mask sensitive fields
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    }

    // Recursively sanitize nested objects
    for (const [key, value] of Object.entries(sanitized)) {
      if (value && typeof value === "object") {
        sanitized[key] = EventUtils.sanitizeEventData(value);
      }
    }

    return sanitized;
  }

  /**
   * Transform event for specific webhook requirements
   */
  static transformEventForWebhook(event: BaseEvent, webhook: WebhookEndpoint): any {
    const basePayload = EventUtils.sanitizeEventForWebhook(event, webhook);

    // Add webhook-specific metadata
    return {
      ...basePayload,
      webhook: {
        id: webhook.id,
        name: webhook.name,
        deliveredAt: new Date().toISOString(),
      },
      // Add clinic context if needed
      clinic: {
        id: event.metadata?.clinicId,
      },
    };
  }

  /**
   * Generate event fingerprint for deduplication
   */
  static generateEventFingerprint(event: Omit<BaseEvent, "id" | "timestamp">): string {
    const fingerprintData = {
      type: event.type,
      source: event.source,
      data: event.data,
      clinicId: event.metadata?.clinicId,
    };

    return crypto.createHash("sha256").update(JSON.stringify(fingerprintData)).digest("hex");
  }
}

/**
 * Webhook Utilities
 */
export class WebhookUtils {
  /**
   * Generate webhook signature for payload verification
   */
  static generateSignature(payload: string, secret: string, algorithm: string = "sha256"): string {
    return crypto.createHmac(algorithm, secret).update(payload).digest("hex");
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(
    payload: string,
    signature: string,
    secret: string,
    algorithm: string = "sha256",
  ): boolean {
    try {
      const expectedSignature = WebhookUtils.generateSignature(payload, secret, algorithm);

      // Use timing-safe comparison to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expectedSignature, "hex"),
      );
    } catch (_error) {
      return false;
    }
  }

  /**
   * Validate webhook URL
   */
  static validateWebhookUrl(url: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const parsedUrl = new URL(url);

      // Must be HTTPS in production
      if (process.env.NODE_ENV === "production" && parsedUrl.protocol !== "https:") {
        errors.push("Webhook URL must use HTTPS in production");
      }

      // Check for localhost/private IPs in production
      if (process.env.NODE_ENV === "production") {
        const hostname = parsedUrl.hostname;
        if (
          hostname === "localhost" ||
          hostname === "127.0.0.1" ||
          hostname.startsWith("192.168.") ||
          hostname.startsWith("10.") ||
          hostname.startsWith("172.")
        ) {
          errors.push("Webhook URL cannot point to private/local addresses in production");
        }
      }

      // Check for valid port
      if (parsedUrl.port && (parseInt(parsedUrl.port) < 1 || parseInt(parsedUrl.port) > 65535)) {
        errors.push("Invalid port number");
      }
    } catch (_error) {
      errors.push("Invalid URL format");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate webhook headers
   */
  static generateWebhookHeaders(
    event: BaseEvent,
    webhook: WebhookEndpoint,
    payload: string,
    enableSignature: boolean = true,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "NeonPro-Webhook/1.0",
      "X-Event-Type": event.type,
      "X-Event-ID": event.id,
      "X-Event-Timestamp": event.timestamp.toISOString(),
      "X-Webhook-ID": webhook.id,
      "X-Webhook-Name": webhook.name,
      "X-Delivery-Attempt": "1", // This would be updated for retries
      ...webhook.headers,
    };

    // Add signature if enabled
    if (enableSignature && webhook.secret) {
      headers["X-Webhook-Signature"] =
        `sha256=${WebhookUtils.generateSignature(payload, webhook.secret)}`;
    }

    return headers;
  }

  /**
   * Parse webhook signature header
   */
  static parseSignatureHeader(
    signatureHeader: string,
  ): { algorithm: string; signature: string } | null {
    try {
      const parts = signatureHeader.split("=");
      if (parts.length !== 2) {
        return null;
      }

      return {
        algorithm: parts[0],
        signature: parts[1],
      };
    } catch (_error) {
      return null;
    }
  }
}

/**
 * Rate Limiting Utilities
 */
export class RateLimitUtils {
  private static rateLimiters: Map<
    string,
    {
      requests: number;
      resetTime: number;
      tokens: number;
      lastRefill: number;
    }
  > = new Map();

  /**
   * Check if request is within rate limit (Token Bucket algorithm)
   */
  static checkRateLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number,
    burstLimit?: number,
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const limiter = RateLimitUtils.rateLimiters.get(identifier);

    if (!limiter || now > limiter.resetTime) {
      // Initialize or reset rate limiter
      const newLimiter = {
        requests: 1,
        resetTime: now + windowMs,
        tokens: (burstLimit || maxRequests) - 1,
        lastRefill: now,
      };

      RateLimitUtils.rateLimiters.set(identifier, newLimiter);

      return {
        allowed: true,
        remaining: newLimiter.tokens,
        resetTime: newLimiter.resetTime,
      };
    }

    // Refill tokens based on time passed
    const timePassed = now - limiter.lastRefill;
    const tokensToAdd = Math.floor((timePassed / windowMs) * maxRequests);

    if (tokensToAdd > 0) {
      limiter.tokens = Math.min(burstLimit || maxRequests, limiter.tokens + tokensToAdd);
      limiter.lastRefill = now;
    }

    // Check if request is allowed
    if (limiter.tokens > 0) {
      limiter.tokens--;
      limiter.requests++;

      return {
        allowed: true,
        remaining: limiter.tokens,
        resetTime: limiter.resetTime,
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetTime: limiter.resetTime,
    };
  }

  /**
   * Reset rate limiter for identifier
   */
  static resetRateLimit(identifier: string): void {
    RateLimitUtils.rateLimiters.delete(identifier);
  }

  /**
   * Get current rate limit status
   */
  static getRateLimitStatus(identifier: string): {
    requests: number;
    remaining: number;
    resetTime: number;
  } | null {
    const limiter = RateLimitUtils.rateLimiters.get(identifier);
    if (!limiter) {
      return null;
    }

    return {
      requests: limiter.requests,
      remaining: limiter.tokens,
      resetTime: limiter.resetTime,
    };
  }
}

/**
 * Retry Utilities
 */
export class RetryUtils {
  /**
   * Calculate next retry delay based on strategy
   */
  static calculateRetryDelay(
    attempt: number,
    strategy: RetryStrategy,
    _baseDelayMs: number = 1000,
  ): number {
    const maxDelay = 300000; // 5 minutes max
    let delay: number;

    switch (strategy.strategy) {
      case "exponential":
        delay = Math.min(strategy.delayMs * 2 ** (attempt - 1), maxDelay);
        break;

      case "linear":
        delay = Math.min(strategy.delayMs * attempt, maxDelay);
        break;
      default:
        delay = strategy.delayMs;
        break;
    }

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    return Math.floor(delay + jitter);
  }

  /**
   * Determine if error is retryable
   */
  static isRetryableError(error: any, httpStatus?: number): boolean {
    // Network errors are retryable
    if (error.code === "ECONNRESET" || error.code === "ENOTFOUND" || error.code === "ETIMEDOUT") {
      return true;
    }

    // HTTP status codes that are retryable
    if (httpStatus) {
      const retryableStatuses = [408, 429, 500, 502, 503, 504];
      return retryableStatuses.includes(httpStatus);
    }

    // Timeout errors are retryable
    if (error.name === "AbortError" || error.message?.includes("timeout")) {
      return true;
    }

    return false;
  }

  /**
   * Execute function with retry logic
   */
  static async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxAttempts: number,
    strategy: RetryStrategy,
    onRetry?: (attempt: number, error: any) => void,
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry on last attempt
        if (attempt === maxAttempts) {
          break;
        }

        // Check if error is retryable
        if (!RetryUtils.isRetryableError(error)) {
          break;
        }

        // Calculate delay and wait
        const delay = RetryUtils.calculateRetryDelay(attempt, strategy);

        if (onRetry) {
          onRetry(attempt, error);
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

/**
 * Validation Utilities
 */
export class ValidationUtils {
  /**
   * Validate JSON payload
   */
  static validateJsonPayload(payload: string): { isValid: boolean; error?: string; data?: any } {
    try {
      const data = JSON.parse(payload);
      return { isValid: true, data };
    } catch (error) {
      return {
        isValid: false,
        error: `Invalid JSON: ${error.message}`,
      };
    }
  }

  /**
   * Validate webhook configuration
   */
  static validateWebhookConfig(config: Partial<WebhookEndpoint>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate required fields
    if (!config.name?.trim()) {
      errors.push("Webhook name is required");
    }

    if (!config.url?.trim()) {
      errors.push("Webhook URL is required");
    } else {
      const urlValidation = WebhookUtils.validateWebhookUrl(config.url);
      if (!urlValidation.isValid) {
        errors.push(...urlValidation.errors);
      }
    }

    if (!config.clinicId?.trim()) {
      errors.push("Clinic ID is required");
    }

    if (!config.eventTypes || config.eventTypes.length === 0) {
      errors.push("At least one event type must be specified");
    }

    // Validate timeout
    if (config.timeoutMs !== undefined) {
      if (config.timeoutMs < 1000 || config.timeoutMs > 30000) {
        errors.push("Timeout must be between 1000ms and 30000ms");
      }
    }

    // Validate retry strategy
    if (config.retryStrategy) {
      if (config.retryStrategy.maxAttempts < 1 || config.retryStrategy.maxAttempts > 10) {
        errors.push("Max retry attempts must be between 1 and 10");
      }

      if (config.retryStrategy.delayMs < 1000 || config.retryStrategy.delayMs > 300000) {
        errors.push("Retry delay must be between 1000ms and 300000ms");
      }
    }

    // Validate rate limit
    if (config.rateLimit) {
      if (config.rateLimit.requestsPerMinute < 1 || config.rateLimit.requestsPerMinute > 1000) {
        errors.push("Rate limit must be between 1 and 1000 requests per minute");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize webhook name
   */
  static sanitizeWebhookName(name: string): string {
    return name
      .trim()
      .replace(/[^a-zA-Z0-9\s\-_]/g, "") // Remove special characters
      .replace(/\s+/g, " ") // Normalize whitespace
      .substring(0, 100); // Limit length
  }
}

/**
 * Monitoring Utilities
 */
export class MonitoringUtils {
  /**
   * Calculate delivery success rate
   */
  static calculateSuccessRate(successful: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((successful / total) * 100 * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate average response time
   */
  static calculateAverageResponseTime(responseTimes: number[]): number {
    if (responseTimes.length === 0) return 0;
    const sum = responseTimes.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / responseTimes.length);
  }

  /**
   * Calculate percentile response time
   */
  static calculatePercentileResponseTime(responseTimes: number[], percentile: number): number {
    if (responseTimes.length === 0) return 0;

    const sorted = [...responseTimes].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Generate performance metrics
   */
  static generatePerformanceMetrics(
    deliveries: Array<{
      status: string;
      responseTimeMs?: number;
      createdAt: Date;
    }>,
  ): {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    successRate: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  } {
    const total = deliveries.length;
    const successful = deliveries.filter((d) => d.status === "delivered").length;
    const failed = deliveries.filter((d) => d.status === "failed").length;

    const responseTimes = deliveries
      .filter((d) => d.responseTimeMs !== undefined)
      .map((d) => d.responseTimeMs!);

    return {
      totalDeliveries: total,
      successfulDeliveries: successful,
      failedDeliveries: failed,
      successRate: MonitoringUtils.calculateSuccessRate(successful, total),
      averageResponseTime: MonitoringUtils.calculateAverageResponseTime(responseTimes),
      p95ResponseTime: MonitoringUtils.calculatePercentileResponseTime(responseTimes, 95),
      p99ResponseTime: MonitoringUtils.calculatePercentileResponseTime(responseTimes, 99),
    };
  }
}

// Export all utilities
export { EventUtils, WebhookUtils, RateLimitUtils, RetryUtils, ValidationUtils, MonitoringUtils };

// Default export with all utilities
export default {
  EventUtils,
  WebhookUtils,
  RateLimitUtils,
  RetryUtils,
  ValidationUtils,
  MonitoringUtils,
};
