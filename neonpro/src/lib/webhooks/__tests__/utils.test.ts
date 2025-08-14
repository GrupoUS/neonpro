/**
 * Webhook Utilities Tests
 * Story 7.3: Webhook & Event System Implementation
 * 
 * Comprehensive test suite for webhook utility functions:
 * - Event validation and transformation
 * - Webhook signature generation and validation
 * - Rate limiting utilities
 * - Retry logic helpers
 * - Payload formatting and sanitization
 * - Security and validation helpers
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  EventUtils,
  WebhookUtils,
  RateLimitUtils,
  RetryUtils,
  ValidationUtils,
  MonitoringUtils
} from '../utils'
import type {
  BaseEvent,
  WebhookEndpoint,
  EventType,
  EventPriority,
  RetryStrategy
} from '../types'

// Mock crypto for consistent results
vi.mock('crypto', () => ({
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => 'test-hash-123')
  })),
  createHmac: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => 'test-signature')
  })),
  timingSafeEqual: vi.fn(() => true)
}))

describe('EventUtils', () => {
  describe('validateEvent', () => {
    it('should validate a complete valid event', () => {
      const validEvent = {
        type: 'patient.created' as EventType,
        source: 'patient-service',
        data: { patientId: '123', name: 'John Doe' },
        metadata: { clinicId: 'clinic-123' },
        priority: 'normal' as EventPriority,
        version: '1.0.0'
      }

      const result = EventUtils.validateEvent(validEvent)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject event without required fields', () => {
      const invalidEvent = {
        type: undefined,
        source: '',
        data: null,
        metadata: {}
      }

      const result = EventUtils.validateEvent(invalidEvent)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Event type is required')
      expect(result.errors).toContain('Event source is required')
      expect(result.errors).toContain('Event data is required')
      expect(result.errors).toContain('Clinic ID is required in metadata')
    })

    it('should reject invalid event type', () => {
      const invalidEvent = {
        type: 'invalid.type' as EventType,
        source: 'test-service',
        data: { test: 'data' },
        metadata: { clinicId: 'clinic-123' }
      }

      const result = EventUtils.validateEvent(invalidEvent)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid event type: invalid.type')
    })

    it('should reject invalid priority', () => {
      const invalidEvent = {
        type: 'patient.created' as EventType,
        source: 'test-service',
        data: { test: 'data' },
        metadata: { clinicId: 'clinic-123' },
        priority: 'invalid' as EventPriority
      }

      const result = EventUtils.validateEvent(invalidEvent)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid event priority: invalid')
    })

    it('should reject invalid version format', () => {
      const invalidEvent = {
        type: 'patient.created' as EventType,
        source: 'test-service',
        data: { test: 'data' },
        metadata: { clinicId: 'clinic-123' },
        version: 'invalid-version'
      }

      const result = EventUtils.validateEvent(invalidEvent)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Event version must follow semantic versioning (e.g., 1.0.0)')
    })
  })

  describe('sanitizeEventForWebhook', () => {
    it('should sanitize event data for webhook delivery', () => {
      const event: BaseEvent = {
        id: 'event-123',
        type: 'patient.created',
        source: 'patient-service',
        data: {
          patientId: '123',
          name: 'John Doe',
          password: 'secret123',
          creditCard: '1234-5678-9012-3456'
        },
        metadata: {
          clinicId: 'clinic-123',
          internalId: 'internal-123',
          debugInfo: 'debug-data'
        },
        priority: 'normal',
        version: '1.0.0',
        timestamp: new Date('2024-01-01T00:00:00Z'),
        fingerprint: 'fp-123',
        context: { userId: 'user-123' }
      }

      const webhook: WebhookEndpoint = {
        id: 'webhook-123',
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        clinicId: 'clinic-123',
        eventTypes: ['patient.created'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const sanitized = EventUtils.sanitizeEventForWebhook(event, webhook)

      expect(sanitized.data.password).toBe('[REDACTED]')
      expect(sanitized.data.creditCard).toBe('[REDACTED]')
      expect(sanitized.data.name).toBe('John Doe')
      expect(sanitized.metadata.internalId).toBeUndefined()
      expect(sanitized.metadata.debugInfo).toBeUndefined()
      expect(sanitized.metadata.clinicId).toBe('clinic-123')
      expect(sanitized.timestamp).toBe('2024-01-01T00:00:00.000Z')
    })
  })

  describe('generateEventFingerprint', () => {
    it('should generate consistent fingerprints for same event data', () => {
      const eventData = {
        type: 'patient.created' as EventType,
        source: 'patient-service',
        data: { patientId: '123' },
        metadata: { clinicId: 'clinic-123' },
        priority: 'normal' as EventPriority,
        version: '1.0.0',
        context: {}
      }

      const fingerprint1 = EventUtils.generateEventFingerprint(eventData)
      const fingerprint2 = EventUtils.generateEventFingerprint(eventData)

      expect(fingerprint1).toBe(fingerprint2)
      expect(fingerprint1).toBe('test-hash-123')
    })

    it('should generate different fingerprints for different event data', () => {
      const eventData1 = {
        type: 'patient.created' as EventType,
        source: 'patient-service',
        data: { patientId: '123' },
        metadata: { clinicId: 'clinic-123' },
        priority: 'normal' as EventPriority,
        version: '1.0.0',
        context: {}
      }

      const eventData2 = {
        type: 'patient.created' as EventType,
        source: 'patient-service',
        data: { patientId: '456' },
        metadata: { clinicId: 'clinic-123' },
        priority: 'normal' as EventPriority,
        version: '1.0.0',
        context: {}
      }

      // Mock different hash for different data
      const mockCreateHash = vi.mocked(require('crypto').createHash)
      mockCreateHash.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn(() => 'hash-1')
      }).mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn(() => 'hash-2')
      })

      const fingerprint1 = EventUtils.generateEventFingerprint(eventData1)
      const fingerprint2 = EventUtils.generateEventFingerprint(eventData2)

      expect(fingerprint1).not.toBe(fingerprint2)
    })
  })
})

describe('WebhookUtils', () => {
  describe('generateSignature', () => {
    it('should generate webhook signature', () => {
      const payload = JSON.stringify({ test: 'data' })
      const secret = 'webhook-secret'

      const signature = WebhookUtils.generateSignature(payload, secret)

      expect(signature).toBe('test-signature')
    })

    it('should generate different signatures for different payloads', () => {
      const payload1 = JSON.stringify({ test: 'data1' })
      const payload2 = JSON.stringify({ test: 'data2' })
      const secret = 'webhook-secret'

      // Mock different signatures
      const mockCreateHmac = vi.mocked(require('crypto').createHmac)
      mockCreateHmac.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn(() => 'signature-1')
      }).mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn(() => 'signature-2')
      })

      const signature1 = WebhookUtils.generateSignature(payload1, secret)
      const signature2 = WebhookUtils.generateSignature(payload2, secret)

      expect(signature1).not.toBe(signature2)
    })
  })

  describe('verifySignature', () => {
    it('should verify valid signature', () => {
      const payload = JSON.stringify({ test: 'data' })
      const secret = 'webhook-secret'
      const signature = 'test-signature'

      const isValid = WebhookUtils.verifySignature(payload, signature, secret)

      expect(isValid).toBe(true)
    })

    it('should reject invalid signature', () => {
      const payload = JSON.stringify({ test: 'data' })
      const secret = 'webhook-secret'
      const signature = 'invalid-signature'

      // Mock timingSafeEqual to return false
      const mockTimingSafeEqual = vi.mocked(require('crypto').timingSafeEqual)
      mockTimingSafeEqual.mockReturnValueOnce(false)

      const isValid = WebhookUtils.verifySignature(payload, signature, secret)

      expect(isValid).toBe(false)
    })

    it('should handle signature verification errors', () => {
      const payload = JSON.stringify({ test: 'data' })
      const secret = 'webhook-secret'
      const signature = 'malformed-signature'

      // Mock error in verification
      const mockTimingSafeEqual = vi.mocked(require('crypto').timingSafeEqual)
      mockTimingSafeEqual.mockImplementationOnce(() => {
        throw new Error('Invalid signature format')
      })

      const isValid = WebhookUtils.verifySignature(payload, signature, secret)

      expect(isValid).toBe(false)
    })
  })

  describe('validateWebhookUrl', () => {
    it('should validate HTTPS URLs in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const result = WebhookUtils.validateWebhookUrl('https://api.example.com/webhook')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)

      process.env.NODE_ENV = originalEnv
    })

    it('should reject HTTP URLs in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const result = WebhookUtils.validateWebhookUrl('http://api.example.com/webhook')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Webhook URL must use HTTPS in production')

      process.env.NODE_ENV = originalEnv
    })

    it('should reject localhost URLs in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const result = WebhookUtils.validateWebhookUrl('https://localhost:3000/webhook')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Webhook URL cannot point to private/local addresses in production')

      process.env.NODE_ENV = originalEnv
    })

    it('should reject private IP addresses in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const privateIPs = [
        'https://192.168.1.1/webhook',
        'https://10.0.0.1/webhook',
        'https://172.16.0.1/webhook'
      ]

      privateIPs.forEach(url => {
        const result = WebhookUtils.validateWebhookUrl(url)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Webhook URL cannot point to private/local addresses in production')
      })

      process.env.NODE_ENV = originalEnv
    })

    it('should reject invalid URL format', () => {
      const result = WebhookUtils.validateWebhookUrl('not-a-valid-url')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid URL format')
    })

    it('should allow HTTP URLs in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const result = WebhookUtils.validateWebhookUrl('http://localhost:3000/webhook')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('generateWebhookHeaders', () => {
    it('should generate proper webhook headers', () => {
      const event: BaseEvent = {
        id: 'event-123',
        type: 'patient.created',
        source: 'patient-service',
        data: { patientId: '123' },
        metadata: { clinicId: 'clinic-123' },
        priority: 'normal',
        version: '1.0.0',
        timestamp: new Date('2024-01-01T00:00:00Z'),
        fingerprint: 'fp-123',
        context: {}
      }

      const webhook: WebhookEndpoint = {
        id: 'webhook-123',
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        clinicId: 'clinic-123',
        eventTypes: ['patient.created'],
        isActive: true,
        secret: 'webhook-secret',
        headers: { 'Custom-Header': 'custom-value' },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const payload = JSON.stringify({ test: 'data' })
      const headers = WebhookUtils.generateWebhookHeaders(event, webhook, payload)

      expect(headers).toMatchObject({
        'Content-Type': 'application/json',
        'User-Agent': 'NeonPro-Webhook/1.0',
        'X-Event-Type': 'patient.created',
        'X-Event-ID': 'event-123',
        'X-Event-Timestamp': '2024-01-01T00:00:00.000Z',
        'X-Webhook-ID': 'webhook-123',
        'X-Webhook-Name': 'Test Webhook',
        'X-Delivery-Attempt': '1',
        'Custom-Header': 'custom-value',
        'X-Webhook-Signature': 'sha256=test-signature'
      })
    })

    it('should not include signature when disabled', () => {
      const event: BaseEvent = {
        id: 'event-123',
        type: 'patient.created',
        source: 'patient-service',
        data: { patientId: '123' },
        metadata: { clinicId: 'clinic-123' },
        priority: 'normal',
        version: '1.0.0',
        timestamp: new Date(),
        fingerprint: 'fp-123',
        context: {}
      }

      const webhook: WebhookEndpoint = {
        id: 'webhook-123',
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        clinicId: 'clinic-123',
        eventTypes: ['patient.created'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const payload = JSON.stringify({ test: 'data' })
      const headers = WebhookUtils.generateWebhookHeaders(event, webhook, payload, false)

      expect(headers['X-Webhook-Signature']).toBeUndefined()
    })
  })

  describe('parseSignatureHeader', () => {
    it('should parse valid signature header', () => {
      const signatureHeader = 'sha256=abc123def456'
      const result = WebhookUtils.parseSignatureHeader(signatureHeader)

      expect(result).toEqual({
        algorithm: 'sha256',
        signature: 'abc123def456'
      })
    })

    it('should return null for invalid signature header', () => {
      const invalidHeaders = [
        'invalid-format',
        'sha256',
        'sha256=',
        '=signature-only'
      ]

      invalidHeaders.forEach(header => {
        const result = WebhookUtils.parseSignatureHeader(header)
        expect(result).toBeNull()
      })
    })
  })
})

describe('RateLimitUtils', () => {
  beforeEach(() => {
    // Clear rate limiters before each test
    RateLimitUtils.resetRateLimit('test-identifier')
  })

  describe('checkRateLimit', () => {
    it('should allow requests within rate limit', () => {
      const result = RateLimitUtils.checkRateLimit('test-id', 10, 60000) // 10 requests per minute

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9)
      expect(result.resetTime).toBeGreaterThan(Date.now())
    })

    it('should deny requests exceeding rate limit', () => {
      const identifier = 'test-id-2'
      const maxRequests = 2
      const windowMs = 60000

      // Make requests up to the limit
      for (let i = 0; i < maxRequests; i++) {
        const result = RateLimitUtils.checkRateLimit(identifier, maxRequests, windowMs)
        expect(result.allowed).toBe(true)
      }

      // Next request should be denied
      const result = RateLimitUtils.checkRateLimit(identifier, maxRequests, windowMs)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset rate limit after time window', () => {
      const identifier = 'test-id-3'
      const maxRequests = 1
      const windowMs = 100 // Short window for testing

      // Use up the rate limit
      const result1 = RateLimitUtils.checkRateLimit(identifier, maxRequests, windowMs)
      expect(result1.allowed).toBe(true)

      const result2 = RateLimitUtils.checkRateLimit(identifier, maxRequests, windowMs)
      expect(result2.allowed).toBe(false)

      // Wait for window to reset
      return new Promise(resolve => {
        setTimeout(() => {
          const result3 = RateLimitUtils.checkRateLimit(identifier, maxRequests, windowMs)
          expect(result3.allowed).toBe(true)
          resolve(undefined)
        }, windowMs + 10)
      })
    })

    it('should handle burst limits', () => {
      const identifier = 'test-id-4'
      const maxRequests = 10
      const windowMs = 60000
      const burstLimit = 5

      // Should allow up to burst limit initially
      for (let i = 0; i < burstLimit; i++) {
        const result = RateLimitUtils.checkRateLimit(identifier, maxRequests, windowMs, burstLimit)
        expect(result.allowed).toBe(true)
      }

      // Next request should be denied (burst limit exceeded)
      const result = RateLimitUtils.checkRateLimit(identifier, maxRequests, windowMs, burstLimit)
      expect(result.allowed).toBe(false)
    })
  })

  describe('getRateLimitStatus', () => {
    it('should return rate limit status for existing identifier', () => {
      const identifier = 'test-id-5'
      
      // Make a request to initialize rate limiter
      RateLimitUtils.checkRateLimit(identifier, 10, 60000)
      
      const status = RateLimitUtils.getRateLimitStatus(identifier)
      
      expect(status).toMatchObject({
        requests: 1,
        remaining: 9,
        resetTime: expect.any(Number)
      })
    })

    it('should return null for non-existent identifier', () => {
      const status = RateLimitUtils.getRateLimitStatus('non-existent')
      expect(status).toBeNull()
    })
  })
})

describe('RetryUtils', () => {
  describe('calculateRetryDelay', () => {
    it('should calculate exponential backoff delay', () => {
      const strategy: RetryStrategy = {
        strategy: 'exponential',
        maxAttempts: 3,
        delayMs: 1000
      }

      const delay1 = RetryUtils.calculateRetryDelay(1, strategy)
      const delay2 = RetryUtils.calculateRetryDelay(2, strategy)
      const delay3 = RetryUtils.calculateRetryDelay(3, strategy)

      expect(delay1).toBeGreaterThanOrEqual(1000) // Base delay + jitter
      expect(delay2).toBeGreaterThanOrEqual(2000) // 2x base delay + jitter
      expect(delay3).toBeGreaterThanOrEqual(4000) // 4x base delay + jitter
    })

    it('should calculate linear backoff delay', () => {
      const strategy: RetryStrategy = {
        strategy: 'linear',
        maxAttempts: 3,
        delayMs: 1000
      }

      const delay1 = RetryUtils.calculateRetryDelay(1, strategy)
      const delay2 = RetryUtils.calculateRetryDelay(2, strategy)
      const delay3 = RetryUtils.calculateRetryDelay(3, strategy)

      expect(delay1).toBeGreaterThanOrEqual(1000) // 1x base delay + jitter
      expect(delay2).toBeGreaterThanOrEqual(2000) // 2x base delay + jitter
      expect(delay3).toBeGreaterThanOrEqual(3000) // 3x base delay + jitter
    })

    it('should calculate fixed delay', () => {
      const strategy: RetryStrategy = {
        strategy: 'fixed',
        maxAttempts: 3,
        delayMs: 1000
      }

      const delay1 = RetryUtils.calculateRetryDelay(1, strategy)
      const delay2 = RetryUtils.calculateRetryDelay(2, strategy)
      const delay3 = RetryUtils.calculateRetryDelay(3, strategy)

      // All delays should be around the base delay (with jitter)
      expect(delay1).toBeGreaterThanOrEqual(1000)
      expect(delay1).toBeLessThan(1200) // Base + 10% jitter
      expect(delay2).toBeGreaterThanOrEqual(1000)
      expect(delay2).toBeLessThan(1200)
      expect(delay3).toBeGreaterThanOrEqual(1000)
      expect(delay3).toBeLessThan(1200)
    })

    it('should respect maximum delay limit', () => {
      const strategy: RetryStrategy = {
        strategy: 'exponential',
        maxAttempts: 10,
        delayMs: 60000 // 1 minute
      }

      const delay = RetryUtils.calculateRetryDelay(10, strategy)
      
      // Should not exceed 5 minutes (300000ms)
      expect(delay).toBeLessThanOrEqual(300000)
    })
  })

  describe('isRetryableError', () => {
    it('should identify retryable network errors', () => {
      const networkErrors = [
        { code: 'ECONNRESET' },
        { code: 'ENOTFOUND' },
        { code: 'ETIMEDOUT' }
      ]

      networkErrors.forEach(error => {
        expect(RetryUtils.isRetryableError(error)).toBe(true)
      })
    })

    it('should identify retryable HTTP status codes', () => {
      const retryableStatuses = [408, 429, 500, 502, 503, 504]

      retryableStatuses.forEach(status => {
        expect(RetryUtils.isRetryableError({}, status)).toBe(true)
      })
    })

    it('should identify non-retryable HTTP status codes', () => {
      const nonRetryableStatuses = [400, 401, 403, 404, 422]

      nonRetryableStatuses.forEach(status => {
        expect(RetryUtils.isRetryableError({}, status)).toBe(false)
      })
    })

    it('should identify timeout errors', () => {
      const timeoutErrors = [
        { name: 'AbortError' },
        { message: 'Request timeout occurred' },
        { message: 'Connection timeout' }
      ]

      timeoutErrors.forEach(error => {
        expect(RetryUtils.isRetryableError(error)).toBe(true)
      })
    })

    it('should not retry non-retryable errors', () => {
      const nonRetryableErrors = [
        { code: 'EACCES' },
        { name: 'ValidationError' },
        { message: 'Invalid input' }
      ]

      nonRetryableErrors.forEach(error => {
        expect(RetryUtils.isRetryableError(error)).toBe(false)
      })
    })
  })

  describe('executeWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const strategy: RetryStrategy = {
        strategy: 'fixed',
        maxAttempts: 3,
        delayMs: 100
      }

      const result = await RetryUtils.executeWithRetry(mockFn, 3, strategy)

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should retry on retryable errors', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockRejectedValueOnce(new Error('ETIMEDOUT'))
        .mockResolvedValueOnce('success')

      const strategy: RetryStrategy = {
        strategy: 'fixed',
        maxAttempts: 3,
        delayMs: 10 // Short delay for testing
      }

      const onRetry = vi.fn()
      const result = await RetryUtils.executeWithRetry(mockFn, 3, strategy, onRetry)

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(onRetry).toHaveBeenCalledTimes(2)
    })

    it('should fail after max attempts', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('ECONNRESET'))
      const strategy: RetryStrategy = {
        strategy: 'fixed',
        maxAttempts: 2,
        delayMs: 10
      }

      await expect(RetryUtils.executeWithRetry(mockFn, 2, strategy))
        .rejects.toThrow('ECONNRESET')

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should not retry non-retryable errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('ValidationError'))
      const strategy: RetryStrategy = {
        strategy: 'fixed',
        maxAttempts: 3,
        delayMs: 10
      }

      await expect(RetryUtils.executeWithRetry(mockFn, 3, strategy))
        .rejects.toThrow('ValidationError')

      expect(mockFn).toHaveBeenCalledTimes(1) // No retries
    })
  })
})

describe('ValidationUtils', () => {
  describe('validateJsonPayload', () => {
    it('should validate valid JSON', () => {
      const validJson = JSON.stringify({ test: 'data', number: 123 })
      const result = ValidationUtils.validateJsonPayload(validJson)

      expect(result.isValid).toBe(true)
      expect(result.data).toEqual({ test: 'data', number: 123 })
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid JSON', () => {
      const invalidJson = '{ invalid json }'
      const result = ValidationUtils.validateJsonPayload(invalidJson)

      expect(result.isValid).toBe(false)
      expect(result.data).toBeUndefined()
      expect(result.error).toContain('Invalid JSON')
    })
  })

  describe('validateWebhookConfig', () => {
    it('should validate complete webhook configuration', () => {
      const validConfig = {
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        clinicId: 'clinic-123',
        eventTypes: ['patient.created'],
        timeoutMs: 15000,
        retryStrategy: {
          strategy: 'exponential',
          maxAttempts: 3,
          delayMs: 1000
        },
        rateLimit: {
          requestsPerMinute: 60
        }
      }

      const result = ValidationUtils.validateWebhookConfig(validConfig)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject webhook with missing required fields', () => {
      const invalidConfig = {
        name: '',
        url: '',
        clinicId: '',
        eventTypes: []
      }

      const result = ValidationUtils.validateWebhookConfig(invalidConfig)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Webhook name is required')
      expect(result.errors).toContain('Webhook URL is required')
      expect(result.errors).toContain('Clinic ID is required')
      expect(result.errors).toContain('At least one event type must be specified')
    })

    it('should validate timeout constraints', () => {
      const configWithInvalidTimeout = {
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        clinicId: 'clinic-123',
        eventTypes: ['patient.created'],
        timeoutMs: 500 // Too low
      }

      const result = ValidationUtils.validateWebhookConfig(configWithInvalidTimeout)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Timeout must be between 1000ms and 30000ms')
    })

    it('should validate retry strategy constraints', () => {
      const configWithInvalidRetry = {
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        clinicId: 'clinic-123',
        eventTypes: ['patient.created'],
        retryStrategy: {
          strategy: 'exponential',
          maxAttempts: 15, // Too high
          delayMs: 500000 // Too high
        }
      }

      const result = ValidationUtils.validateWebhookConfig(configWithInvalidRetry)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Max retry attempts must be between 1 and 10')
      expect(result.errors).toContain('Retry delay must be between 1000ms and 300000ms')
    })

    it('should validate rate limit constraints', () => {
      const configWithInvalidRateLimit = {
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        clinicId: 'clinic-123',
        eventTypes: ['patient.created'],
        rateLimit: {
          requestsPerMinute: 2000 // Too high
        }
      }

      const result = ValidationUtils.validateWebhookConfig(configWithInvalidRateLimit)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Rate limit must be between 1 and 1000 requests per minute')
    })
  })

  describe('sanitizeWebhookName', () => {
    it('should sanitize webhook name', () => {
      const dirtyName = '  Test@Webhook#Name!  '
      const sanitized = ValidationUtils.sanitizeWebhookName(dirtyName)

      expect(sanitized).toBe('TestWebhookName')
    })

    it('should limit name length', () => {
      const longName = 'A'.repeat(150)
      const sanitized = ValidationUtils.sanitizeWebhookName(longName)

      expect(sanitized.length).toBeLessThanOrEqual(100)
    })

    it('should normalize whitespace', () => {
      const nameWithSpaces = 'Test   Webhook    Name'
      const sanitized = ValidationUtils.sanitizeWebhookName(nameWithSpaces)

      expect(sanitized).toBe('Test Webhook Name')
    })
  })
})

describe('MonitoringUtils', () => {
  describe('calculateSuccessRate', () => {
    it('should calculate success rate correctly', () => {
      expect(MonitoringUtils.calculateSuccessRate(80, 100)).toBe(80)
      expect(MonitoringUtils.calculateSuccessRate(0, 100)).toBe(0)
      expect(MonitoringUtils.calculateSuccessRate(100, 100)).toBe(100)
    })

    it('should handle zero total deliveries', () => {
      expect(MonitoringUtils.calculateSuccessRate(0, 0)).toBe(0)
    })

    it('should round to 2 decimal places', () => {
      expect(MonitoringUtils.calculateSuccessRate(33, 100)).toBe(33)
      expect(MonitoringUtils.calculateSuccessRate(1, 3)).toBe(33.33)
    })
  })

  describe('calculateAverageResponseTime', () => {
    it('should calculate average response time', () => {
      const responseTimes = [100, 200, 300, 400, 500]
      const average = MonitoringUtils.calculateAverageResponseTime(responseTimes)

      expect(average).toBe(300)
    })

    it('should handle empty array', () => {
      const average = MonitoringUtils.calculateAverageResponseTime([])
      expect(average).toBe(0)
    })

    it('should round to nearest integer', () => {
      const responseTimes = [100, 150, 200]
      const average = MonitoringUtils.calculateAverageResponseTime(responseTimes)

      expect(average).toBe(150)
    })
  })

  describe('calculatePercentileResponseTime', () => {
    it('should calculate 95th percentile', () => {
      const responseTimes = Array.from({ length: 100 }, (_, i) => i + 1) // 1-100
      const p95 = MonitoringUtils.calculatePercentileResponseTime(responseTimes, 95)

      expect(p95).toBe(95)
    })

    it('should calculate 99th percentile', () => {
      const responseTimes = Array.from({ length: 100 }, (_, i) => i + 1) // 1-100
      const p99 = MonitoringUtils.calculatePercentileResponseTime(responseTimes, 99)

      expect(p99).toBe(99)
    })

    it('should handle empty array', () => {
      const percentile = MonitoringUtils.calculatePercentileResponseTime([], 95)
      expect(percentile).toBe(0)
    })

    it('should handle single value', () => {
      const percentile = MonitoringUtils.calculatePercentileResponseTime([100], 95)
      expect(percentile).toBe(100)
    })
  })

  describe('generatePerformanceMetrics', () => {
    it('should generate comprehensive performance metrics', () => {
      const deliveries = [
        { status: 'delivered', responseTimeMs: 100, createdAt: new Date() },
        { status: 'delivered', responseTimeMs: 200, createdAt: new Date() },
        { status: 'delivered', responseTimeMs: 300, createdAt: new Date() },
        { status: 'failed', responseTimeMs: undefined, createdAt: new Date() },
        { status: 'delivered', responseTimeMs: 400, createdAt: new Date() }
      ]

      const metrics = MonitoringUtils.generatePerformanceMetrics(deliveries)

      expect(metrics).toEqual({
        totalDeliveries: 5,
        successfulDeliveries: 4,
        failedDeliveries: 1,
        successRate: 80,
        averageResponseTime: 250, // (100+200+300+400)/4
        p95ResponseTime: 400,
        p99ResponseTime: 400
      })
    })

    it('should handle empty deliveries array', () => {
      const metrics = MonitoringUtils.generatePerformanceMetrics([])

      expect(metrics).toEqual({
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        successRate: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0
      })
    })

    it('should handle deliveries without response times', () => {
      const deliveries = [
        { status: 'delivered', createdAt: new Date() },
        { status: 'failed', createdAt: new Date() }
      ]

      const metrics = MonitoringUtils.generatePerformanceMetrics(deliveries)

      expect(metrics.totalDeliveries).toBe(2)
      expect(metrics.successfulDeliveries).toBe(1)
      expect(metrics.failedDeliveries).toBe(1)
      expect(metrics.averageResponseTime).toBe(0)
    })
  })
})
