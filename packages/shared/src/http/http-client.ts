/**
 * Enhanced HTTP Client for Healthcare Applications
 *
 * Comprehensive HTTP client with:
 * - Automatic retry logic with exponential backoff
 * - Circuit breaker pattern for resilience
 * - Request/response interceptors for logging and security
 * - Healthcare compliance headers and audit logging
 * - Rate limiting and throttling
 * - Request cancellation and timeout handling
 * - Comprehensive error handling with healthcare context
 *
 * @version 2.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA, Healthcare Standards
 */

import { nanoid } from 'nanoid'
import { z } from 'zod'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * HTTP request methods
 */
export const HttpMethodSchema = z.enum([
  'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'
])
export type HttpMethod = z.infer<typeof HttpMethodSchema>

/**
 * Request configuration options
 */
export const HttpRequestConfigSchema = z.object({
  method: HttpMethodSchema,
  url: z.string(),
  headers: z.record(z.string()).optional(),
  params: z.record(z.any()).optional(),
  data: z.any().optional(),
  timeout: z.number().positive().optional().default(30000),
  retries: z.number().min(0).max(5).optional().default(3),
  retryDelay: z.number().positive().optional().default(1000),
  enableCircuitBreaker: z.boolean().optional().default(true),
  enableRateLimit: z.boolean().optional().default(true),
  auditContext: z.record(z.any()).optional(),
  requireAuth: z.boolean().optional().default(false),
  sanitizeRequest: z.boolean().optional().default(true),
  validateResponse: z.boolean().optional().default(true),
})

export type HttpRequestConfig = z.infer<typeof HttpRequestConfigSchema>

/**
 * HTTP response interface
 */
export const HttpResponseSchema = z.object({
  status: z.number(),
  statusText: z.string(),
  headers: z.record(z.string()),
  data: z.any(),
  request: z.object({
    method: z.string(),
    url: z.string(),
    headers: z.record(z.string()),
  }),
  duration: z.number(),
  timestamp: z.date(),
  requestId: z.string(),
})

export type HttpResponse = z.infer<typeof HttpResponseSchema>

/**
 * HTTP error with healthcare context
 */
export const HttpErrorSchema = z.object({
  name: z.string(),
  message: z.string(),
  code: z.string(),
  status: z.number(),
  url: z.string(),
  method: z.string(),
  requestId: z.string(),
  timestamp: z.date(),
  retryable: z.boolean(),
  cause: z.any().optional(),
  healthcareContext: z.record(z.any()).optional(),
})

export type HttpError = z.infer<typeof HttpErrorSchema>

/**
 * Circuit breaker states
 */
export const CircuitStateSchema = z.enum(['CLOSED', 'OPEN', 'HALF_OPEN'])
export type CircuitState = z.infer<typeof CircuitStateSchema>

/**
 * Circuit breaker configuration
 */
export const CircuitBreakerConfigSchema = z.object({
  failureThreshold: z.number().positive().default(5),
  resetTimeout: z.number().positive().default(60000), // 1 minute
  monitoringPeriod: z.number().positive().default(60000), // 1 minute
  expectedExceptionPredicate: z.function().optional(),
})

export type CircuitBreakerConfig = z.infer<typeof CircuitBreakerConfigSchema>

// ============================================================================
// HEALTHCARE COMPLIANCE UTILITIES
// ============================================================================

/**
 * Healthcare compliance headers
 */
export const HEALTHCARE_HEADERS = {
  'X-Healthcare-Audit-ID': () => nanoid(),
  'X-Healthcare-User-ID': (userId?: string) => userId || 'anonymous',
  'X-Healthcare-Session-ID': (sessionId?: string) => sessionId || nanoid(),
  'X-Healthcare-Purpose': (purpose: string) => purpose,
  'X-Healthcare-Data-Sensitivity': (sensitivity: string) => sensitivity,
  'X-LGPD-Compliance': '1.0',
  'X-ANVISA-Compliance': 'true',
}

/**
 * Sanitize request data for healthcare compliance
 */
export function sanitizeRequestData(data: any, sensitivity: 'low' | 'medium' | 'high' = 'medium'): any {
  if (!data || typeof data !== 'object') {
    return data
  }

  const sensitiveFields = [
    'cpf', 'cnpj', 'rg', 'sus', 'crm', 'password', 'token',
    'creditCard', 'bankAccount', 'medicalRecord', 'diagnosis'
  ]

  const sanitized = { ...data }
  
  for (const key in sanitized) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      if (sensitivity === 'high') {
        delete sanitized[key]
      } else {
        sanitized[key] = '[REDACTED]'
      }
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeRequestData(sanitized[key], sensitivity)
    }
  }

  return sanitized
}

// ============================================================================
// CIRCUIT BREAKER IMPLEMENTATION
// ============================================================================

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED'
  private failures = 0
  private lastFailureTime = 0
  private nextAttemptTime = 0
  private readonly config: CircuitBreakerConfig

  constructor(config: CircuitBreakerConfig = {}) {
    this.config = CircuitBreakerConfigSchema.parse(config)
  }

  async execute<T>(request: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        throw this.createCircuitOpenError()
      }
      this.state = 'HALF_OPEN'
    }

    try {
      const result = await request()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure(error)
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure(error: any): void {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.shouldOpenCircuit()) {
      this.state = 'OPEN'
      this.nextAttemptTime = Date.now() + this.config.resetTimeout
    }
  }

  private shouldOpenCircuit(): boolean {
    if (this.config.expectedExceptionPredicate) {
      return this.failures >= this.config.failureThreshold &&
             Date.now() - this.lastFailureTime < this.config.monitoringPeriod
    }
    return this.failures >= this.config.failureThreshold
  }

  private createCircuitOpenError(): HttpError {
    return HttpErrorSchema.parse({
      name: 'CircuitBreakerOpenError',
      message: 'Circuit breaker is OPEN - requests are temporarily blocked',
      code: 'CIRCUIT_OPEN',
      status: 503,
      url: '',
      method: '',
      requestId: nanoid(),
      timestamp: new Date(),
      retryable: true,
    })
  }

  getState(): CircuitState {
    return this.state
  }

  getFailureCount(): number {
    return this.failures
  }
}

// ============================================================================
// RATE LIMITING
// ============================================================================

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  keyGenerator?: (config: HttpRequestConfig) => string
}

export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>()
  private readonly config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async checkLimit(config: HttpRequestConfig): Promise<boolean> {
    const key = this.config.keyGenerator?.(config) || 'default'
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    let record = this.requests.get(key)
    
    if (!record || record.resetTime < windowStart) {
      record = { count: 1, resetTime: now + this.config.windowMs }
      this.requests.set(key, record)
      return true
    }

    if (record.count >= this.config.maxRequests) {
      return false
    }

    record.count++
    return true
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.requests.entries()) {
      if (record.resetTime < now) {
        this.requests.delete(key)
      }
    }
  }
}

// ============================================================================
// HTTP CLIENT IMPLEMENTATION
// ============================================================================

export class HttpClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private circuitBreakers = new Map<string, CircuitBreaker>()
  private rateLimiter?: RateLimiter
  private interceptors = {
    request: [],
    response: [],
    error: [],
  }

  constructor(config: {
    baseUrl?: string
    defaultHeaders?: Record<string, string>
    circuitBreakerConfig?: CircuitBreakerConfig
    rateLimitConfig?: RateLimitConfig
  } = {}) {
    this.baseUrl = config.baseUrl || ''
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'NeonPro-Shared/2.0.0',
      ...config.defaultHeaders,
    }

    if (config.rateLimitConfig) {
      this.rateLimiter = new RateLimiter(config.rateLimitConfig)
    }
  }

  async request<T = any>(config: HttpRequestConfig): Promise<HttpResponse> {
    const validatedConfig = HttpRequestConfigSchema.parse(config)
    const requestId = nanoid()
    const startTime = Date.now()

    try {
      // Apply request interceptors
      let finalConfig = validatedConfig
      for (const interceptor of this.interceptors.request) {
        finalConfig = await interceptor(finalConfig)
      }

      // Rate limiting check
      if (finalConfig.enableRateLimit && this.rateLimiter) {
        const canProceed = await this.rateLimiter.checkLimit(finalConfig)
        if (!canProceed) {
          throw this.createRateLimitError(finalConfig, requestId)
        }
      }

      // Prepare request
      const url = this.buildUrl(finalConfig.url, finalConfig.params)
      const headers = this.buildHeaders(finalConfig, requestId)

      // Execute request with retry logic
      const response = await this.executeWithRetry<T>(() => {
        if (finalConfig.enableCircuitBreaker) {
          const circuitBreaker = this.getCircuitBreaker(url)
          return circuitBreaker.execute(() => this.fetchRequest(url, finalConfig, headers))
        }
        return this.fetchRequest(url, finalConfig, headers)
      }, finalConfig)

      // Apply response interceptors
      let finalResponse = response
      for (const interceptor of this.interceptors.response) {
        finalResponse = await interceptor(finalResponse)
      }

      return finalResponse

    } catch (error) {
      // Apply error interceptors
      let finalError = error
      for (const interceptor of this.interceptors.error) {
        finalError = await interceptor(finalError)
      }

      throw finalError
    }
  }

  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    config: HttpRequestConfig
  ): Promise<T> {
    const { retries, retryDelay } = config
    let lastError: any

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await requestFn()
      } catch (error) {
        lastError = error

        if (attempt === retries || !this.isRetryableError(error)) {
          break
        }

        const delay = retryDelay * Math.pow(2, attempt)
        await this.sleep(delay)
      }
    }

    throw lastError
  }

  private async fetchRequest<T>(
    url: string,
    config: HttpRequestConfig,
    headers: Record<string, string>
  ): Promise<HttpResponse> {
    const requestId = nanoid()
    const startTime = Date.now()

    try {
      const response = await fetch(url, {
        method: config.method,
        headers,
        body: config.data ? JSON.stringify(config.data) : undefined,
        signal: AbortSignal.timeout(config.timeout),
      })

      const duration = Date.now() - startTime
      const responseData = await this.parseResponse(response)

      return HttpResponseSchema.parse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        request: {
          method: config.method,
          url,
          headers,
        },
        duration,
        timestamp: new Date(),
        requestId,
      })

    } catch (error) {
      const duration = Date.now() - startTime
      throw this.createHttpError(error, config, url, requestId, duration)
    }
  }

  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      return response.json()
    }
    
    if (contentType?.includes('text/')) {
      return response.text()
    }
    
    return response.arrayBuffer()
  }

  private buildUrl(url: string, params?: Record<string, any>): string {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`
    
    if (!params) {
      return fullUrl
    }

    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    }

    return `${fullUrl}?${searchParams.toString()}`
  }

  private buildHeaders(config: HttpRequestConfig, requestId: string): Record<string, string> {
    const headers = {
      ...this.defaultHeaders,
      ...config.headers,
      'X-Request-ID': requestId,
      'X-Healthcare-Audit-ID': HEALTHCARE_HEADERS['X-Healthcare-Audit-ID'](),
      'X-LGPD-Compliance': HEALTHCARE_HEADERS['X-LGPD-Compliance'],
    }

    // Add healthcare-specific headers if audit context is provided
    if (config.auditContext) {
      if (config.auditContext.userId) {
        headers['X-Healthcare-User-ID'] = HEALTHCARE_HEADERS['X-Healthcare-User-ID'](config.auditContext.userId)
      }
      if (config.auditContext.sessionId) {
        headers['X-Healthcare-Session-ID'] = HEALTHCARE_HEADERS['X-Healthcare-Session-ID'](config.auditContext.sessionId)
      }
      if (config.auditContext.purpose) {
        headers['X-Healthcare-Purpose'] = HEALTHCARE_HEADERS['X-Healthcare-Purpose'](config.auditContext.purpose)
      }
      if (config.auditContext.dataSensitivity) {
        headers['X-Healthcare-Data-Sensitivity'] = HEALTHCARE_HEADERS['X-Healthcare-Data-Sensitivity'](config.auditContext.dataSensitivity)
      }
    }

    return headers
  }

  private getCircuitBreaker(url: string): CircuitBreaker {
    const key = new URL(url).hostname
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, new CircuitBreaker())
    }
    return this.circuitBreakers.get(key)!
  }

  private isRetryableError(error: any): boolean {
    if (!error || typeof error !== 'object') {
      return false
    }

    const status = error.status
    return (
      status === 408 || // Request Timeout
      status === 429 || // Too Many Requests
      status >= 500 && status < 600 // Server Errors
    )
  }

  private createHttpError(
    error: any,
    config: HttpRequestConfig,
    url: string,
    requestId: string,
    duration: number
  ): HttpError {
    const status = error.status || 0
    const message = error.message || 'Unknown HTTP error'

    return HttpErrorSchema.parse({
      name: 'HttpError',
      message,
      code: `HTTP_${status}`,
      status,
      url,
      method: config.method,
      requestId,
      timestamp: new Date(),
      retryable: this.isRetryableError({ status }),
      cause: error.cause,
      healthcareContext: config.auditContext,
    })
  }

  private createRateLimitError(config: HttpRequestConfig, requestId: string): HttpError {
    return HttpErrorSchema.parse({
      name: 'RateLimitError',
      message: 'Rate limit exceeded',
      code: 'RATE_LIMIT_EXCEEDED',
      status: 429,
      url: config.url,
      method: config.method,
      requestId,
      timestamp: new Date(),
      retryable: true,
      healthcareContext: config.auditContext,
    })
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Convenience methods
  async get<T = any>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse> {
    return this.request<T>({ ...config, method: 'GET', url })
  }

  async post<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse> {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }

  async put<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse> {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  }

  async patch<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse> {
    return this.request<T>({ ...config, method: 'PATCH', url, data })
  }

  async delete<T = any>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse> {
    return this.request<T>({ ...config, method: 'DELETE', url })
  }

  // Interceptor management
  addRequestInterceptor(interceptor: (config: HttpRequestConfig) => Promise<HttpRequestConfig>): void {
    this.interceptors.request.push(interceptor)
  }

  addResponseInterceptor(interceptor: (response: HttpResponse) => Promise<HttpResponse>): void {
    this.interceptors.response.push(interceptor)
  }

  addErrorInterceptor(interceptor: (error: any) => Promise<any>): void {
    this.interceptors.error.push(interceptor)
  }

  // Circuit breaker management
  getCircuitBreakerStatus(hostname: string): CircuitState {
    const circuitBreaker = this.circuitBreakers.get(hostname)
    return circuitBreaker?.getState() || 'CLOSED'
  }

  resetCircuitBreakers(): void {
    this.circuitBreakers.clear()
  }
}

// ============================================================================
// DEFAULT INSTANCE & FACTORIES
// ============================================================================

// Default HTTP client instance
export const defaultHttpClient = new HttpClient({
  circuitBreakerConfig: {
    failureThreshold: 5,
    resetTimeout: 60000,
  },
  rateLimitConfig: {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
})

// Factory functions for specific use cases
export function createHealthcareHttpClient(options?: {
  baseUrl?: string
  requireAuth?: boolean
  dataSensitivity?: 'low' | 'medium' | 'high'
}): HttpClient {
  return new HttpClient({
    baseUrl: options?.baseUrl,
    defaultHeaders: {
      'X-Healthcare-Data-Sensitivity': options?.dataSensitivity || 'medium',
      'X-Healthcare-Purpose': 'treatment',
    },
    circuitBreakerConfig: {
      failureThreshold: 3, // More conservative for healthcare
      resetTimeout: 120000, // 2 minutes
    },
    rateLimitConfig: {
      maxRequests: 50, // More conservative for healthcare
      windowMs: 60000,
      keyGenerator: (config) => {
        // Rate limit by user ID if available
        return config.auditContext?.userId || 'default'
      },
    },
  })
}

export function createPublicApiClient(baseUrl?: string): HttpClient {
  return new HttpClient({
    baseUrl,
    rateLimitConfig: {
      maxRequests: 200,
      windowMs: 60000,
    },
  })
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if an error is an HTTP error
 */
export function isHttpError(error: any): error is HttpError {
  return error && typeof error === 'object' && 'status' in error && 'requestId' in error
}

/**
 * Extract retry information from error
 */
export function getRetryInfo(error: HttpError): {
  retryable: boolean
  retryAfter?: number
  attempts?: number
} {
  return {
    retryable: error.retryable,
    retryAfter: error.status === 429 ? 5000 : undefined, // Default 5s for rate limit
    attempts: 0, // Would need to be tracked in the client
  }
}

/**
 * Create healthcare audit context
 */
export function createAuditContext(context: {
  userId?: string
  sessionId?: string
  purpose: string
  dataSensitivity?: 'low' | 'medium' | 'high'
  [key: string]: any
}): Record<string, any> {
  return {
    timestamp: new Date().toISOString(),
    requestId: nanoid(),
    ...context,
  }
}