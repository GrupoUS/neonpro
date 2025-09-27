/**
 * TDD Tests for Security Headers Middleware
 * Testing undefined response object issue
 */

import { Context } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SecurityHeadersMiddleware } from '../../middleware/security-headers'

// Mock Logger
const mockLogger = {
  logSystemEvent: vi.fn(),
  logError: vi.fn(),
}

// Mock Hono Context
function createMockContext(overrides = {}) {
  const req = {
    url: 'https://example.com/api/test',
    method: 'GET',
    header: vi.fn(),
  }

  const res = {
    headers: new Map(),
    status: 200,
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

describe('SecurityHeadersMiddleware - Undefined Response Object', () => {
  let middleware: SecurityHeadersMiddleware
  let mockContext: any

  beforeEach(() => {
    middleware = new SecurityHeadersMiddleware({
      enableHSTS: true,
      hstsMaxAge: 31536000,
      hstsIncludeSubDomains: true,
      hstsPreload: true,
      enableCSP: true,
      enableFrameGuard: true,
      enableXSSProtection: true,
      enableContentTypeSniffingProtection: true,
      referrerPolicy: 'strict-origin-when-cross-origin',
    }, mockLogger)

    mockContext = createMockContext()
  })

  describe('RED: Tests that previously failed for undefined response object', () => {
    it('should now work after fixing undefined res variable', async () => {
      // This test now passes after fixing the undefined res variable issue
      const next = vi.fn()

      await expect(middleware.middleware()(mockContext, next)).resolves.not.toThrow()
    })

    it('should now handle res.removeHeader removal correctly', async () => {
      // This test now passes after removing the problematic res.removeHeader call
      const next = vi.fn()

      await expect(middleware.middleware()(mockContext, next)).resolves.not.toThrow()

      // Verify the middleware executed without errors
      expect(next).toHaveBeenCalled()
    })
  })

  describe('GREEN: Tests for fixed implementation', () => {
    it('should properly set security headers using Hono context', async () => {
      // This test will pass after fixing the undefined res issue
      const next = vi.fn()

      await expect(middleware.middleware()(mockContext, next)).resolves.not.toThrow()

      // Verify security headers were set
      expect(mockContext.header).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        expect.any(String),
      )
      expect(mockContext.header).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
      expect(mockContext.header).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
      expect(mockContext.header).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block')
      expect(mockContext.header).toHaveBeenCalledWith(
        'Referrer-Policy',
        'strict-origin-when-cross-origin',
      )
    })

    it('should handle HSTS header correctly for HTTPS', async () => {
      const next = vi.fn()
      mockContext.req.url = 'https://example.com/api/test'

      await middleware.middleware()(mockContext, next)

      expect(mockContext.header).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload',
      )
    })

    it('should not set HSTS header for HTTP', async () => {
      const next = vi.fn()
      mockContext.req.url = 'http://example.com/api/test'

      await middleware.middleware()(mockContext, next)

      // HSTS header should not be called for HTTP
      const hstsCalls = mockContext.header.mock.calls.filter(call =>
        call[0] === 'Strict-Transport-Security'
      )
      expect(hstsCalls).toHaveLength(0)
    })
  })

  describe('REFACTOR: Tests for optimized implementation', () => {
    it('should handle CSP header when enabled', async () => {
      const next = vi.fn()

      const middlewareWithCSP = new SecurityHeadersMiddleware({
        enableHSTS: true,
        hstsMaxAge: 31536000,
        hstsIncludeSubDomains: true,
        hstsPreload: true,
        enableCSP: true,
        contentSecurityPolicy: "default-src 'self'",
        enableFrameGuard: true,
        enableXSSProtection: true,
        enableContentTypeSniffingProtection: true,
        referrerPolicy: 'strict-origin-when-cross-origin',
      }, mockLogger)

      await middlewareWithCSP.middleware()(mockContext, next)

      expect(mockContext.header).toHaveBeenCalledWith(
        'Content-Security-Policy',
        "default-src 'self'",
      )
    })

    it('should validate HSTS configuration', () => {
      const validation = middleware.validateHSTSConfig()

      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should generate security report', () => {
      const report = middleware.getSecurityReport()

      expect(report).toHaveProperty('enabledFeatures')
      expect(report).toHaveProperty('hstsConfig')
      expect(report).toHaveProperty('cspEnabled', true) // Enabled in test config
      expect(report).toHaveProperty('headersCount')
      expect(report).toHaveProperty('validation')
    })
  })
})
