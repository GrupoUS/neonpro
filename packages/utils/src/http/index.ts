/**
 * HTTP Client Package Exports
 *
 * Comprehensive HTTP client with healthcare compliance features:
 * - Circuit breaker pattern
 * - Rate limiting
 * - Retry logic
 * - Healthcare audit headers
 * - Request/response interceptors
 *
 * @version 2.0.0
 * @author NeonPro Development Team
 * Compliance: LGPD, ANVISA, Healthcare Standards
 */

// Core HTTP client and utilities
export {
  HttpClient,
  CircuitBreaker,
  RateLimiter,
  HEALTHCARE_HEADERS,
  defaultHttpClient,
  createHealthcareHttpClient,
  createPublicApiClient,
  isHttpError,
  getRetryInfo,
  createAuditContext,
  sanitizeRequestData,
} from './http-client'

// Type exports
export type {
  HttpRequestConfig,
  HttpResponse,
  HttpError,
  CircuitState,
  CircuitBreakerConfig,
  RateLimitConfig,
  HttpMethod,
} from './http-client'