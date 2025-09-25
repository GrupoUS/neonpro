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
 * @compliance LGPD, ANVISA, Healthcare Standards
 */

// Core HTTP client and types
export {
  HttpClient,
  HttpRequestConfig,
  HttpRequestConfigSchema,
  HttpResponse,
  HttpResponseSchema,
  HttpError,
  HttpErrorSchema,
  HttpMethod,
  HttpMethodSchema,
} from './http-client'

// Circuit breaker
export {
  CircuitBreaker,
  CircuitState,
  CircuitStateSchema,
  CircuitBreakerConfig,
  CircuitBreakerConfigSchema,
} from './http-client'

// Rate limiting
export {
  RateLimiter,
  type RateLimitConfig,
} from './http-client'

// Healthcare compliance utilities
export {
  HEALTHCARE_HEADERS,
  sanitizeRequestData,
} from './http-client'

// Default instances and factories
export {
  defaultHttpClient,
  createHealthcareHttpClient,
  createPublicApiClient,
} from './http-client'

// Utility functions
export {
  isHttpError,
  getRetryInfo,
  createAuditContext,
} from './http-client'

// Re-export for convenience
export type {
  HttpRequestConfig as HTTPRequestConfig,
  HttpResponse as HTTPResponse,
  HttpError as HTTPError,
  CircuitState as CircuitBreakerState,
}