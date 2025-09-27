/**
 * TDD Tests for Compression Middleware
 * Testing Express-to-Hono migration fixes
 */

import { Context } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CompressionMiddleware } from '../../middleware/compression-middleware'

// Mock Hono Context
function createMockContext(overrides = {}) {
  const req = {
    url: 'https://example.com/api/test',
    method: 'GET',
    header: vi.fn(),
  }

  const res = {
    headers: new Map(),
    status: vi.fn(),
    body: null,
  }

  const c = {
    req,
    res,
    set: vi.fn(),
    get: vi.fn(),
    header: vi.fn(),
  } as any

  return { ...c, ...overrides }
}

describe('CompressionMiddleware - Express-to-Hono Migration', () => {
  let middleware: CompressionMiddleware
  let mockContext: any

  beforeEach(() => {
    middleware = new CompressionMiddleware()
    mockContext = createMockContext()
  })

  describe('RED: Failing tests for undefined variables', () => {
    it('should now work with Hono context after fixes', async () => {
      // This test now passes after fixing undefined req/res variables
      expect(() => {
        // @ts-ignore - intentionally accessing private method for testing
        middleware['setupResponseOptimizationHeaders'](mockContext, 'gzip')
      }).not.toThrow()
    })

    it('should fail when setupETag method signature is incorrect', () => {
      // Test setupETag method signature - should accept Context, not undefined res
      expect(() => {
        // @ts-ignore - intentionally accessing private method for testing
        middleware['setupETag']()
      }).toThrow()
    })

    it('should fail when setupCacheControl method signature is incorrect', () => {
      // Test setupCacheControl method signature - should accept Context, not undefined req/res
      expect(() => {
        // @ts-ignore - intentionally accessing private method for testing
        middleware['setupCacheControl']()
      }).toThrow()
    })

    it('should fail when setupPreconditionChecks method signature is incorrect', () => {
      // Test setupPreconditionChecks method signature - should accept Context, not undefined req/res
      expect(() => {
        // @ts-ignore - intentionally accessing private method for testing
        middleware['setupPreconditionChecks']()
      }).toThrow()
    })

    it('should properly handle Hono context in middleware execution', async () => {
      const next = vi.fn()

      // This should work after fixing the migration
      await expect(middleware.middleware(mockContext, next)).resolves.not.toThrow()
    })
  })

  describe('GREEN: Tests for fixed implementation', () => {
    it('should properly set headers using Hono context', async () => {
      // This test will pass after fixing the migration
      const next = vi.fn()

      await middleware.middleware(mockContext, next)

      // Verify that context methods were called correctly
      expect(mockContext.set).toHaveBeenCalled()
      expect(mockContext.header).toHaveBeenCalled()
    })

    it('should generate ETag using Hono context', () => {
      // This test will pass after fixing setupETag method
      expect(() => {
        // @ts-ignore - intentionally accessing private method for testing
        middleware['setupETag'](mockContext)
      }).not.toThrow()
    })

    it('should setup cache control using Hono context', () => {
      // This test will pass after fixing setupCacheControl method
      expect(() => {
        // @ts-ignore - intentionally accessing private method for testing
        middleware['setupCacheControl'](mockContext)
      }).not.toThrow()
    })

    it('should setup precondition checks using Hono context', () => {
      // This test will pass after fixing setupPreconditionChecks method
      expect(() => {
        // @ts-ignore - intentionally accessing private method for testing
        middleware['setupPreconditionChecks'](mockContext)
      }).not.toThrow()
    })
  })

  describe('REFACTOR: Tests for optimized implementation', () => {
    it('should handle compression method selection correctly', () => {
      const acceptEncoding = 'gzip, deflate, br'
      const method = middleware['selectCompressionMethod'](acceptEncoding)
      expect(method).toBe('br') // Brotli has highest priority
    })

    it('should handle missing accept-encoding header', () => {
      const method = middleware['selectCompressionMethod']('')
      expect(method).toBe('none')
    })

    it('should generate valid request IDs', () => {
      const requestId = middleware['generateRequestId']()
      expect(requestId).toMatch(/^req_\d+_[a-f0-9]{8}$/)
    })

    it('should provide compression statistics', () => {
      const stats = middleware.getCompressionStats()
      expect(stats).toHaveProperty('totalRequests', 0)
      expect(stats).toHaveProperty('compressedResponses', 0)
      expect(stats).toHaveProperty('compressionRate', 0)
    })
  })
})
