/**
 * Edge Migration Start Route Tests
 *
 * TDD approach: Write failing tests first, then implement the functionality.
 * Tests for POST /migration/start Edge route that forwards to Node tRPC.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock environment variables first, before importing the app
const originalEnv = process.env

// Mock Supabase client
const mockCreateClient = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient
}))

// Mock fetch for Node tRPC forwarding
const mockFetch = vi.fn()
global.fetch = mockFetch

// Import app after setting up mocks
let app: any
beforeEach(async () => {
  // Set environment variables before importing the app
  process.env = {
    ...originalEnv,
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    NODE_TRPC_URL: 'http://localhost:3001/trpc'
  }

  // Dynamic import to ensure env vars are set
  const appModule = await import('../index')
  app = appModule.default
})

describe('Edge API - POST /migration/start', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Authentication', () => {
    it('should return 401 when no authorization header is provided', async () => {
      const response = await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationId: '123e4567-e89b-12d3-a456-426614174000',
          options: {
            dry_run: false,
            force: false,
            skip_validation: false
          }
        })
      })

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toEqual({
        error: 'Missing or invalid authorization header'
      })
    })

    it('should return 401 when authorization header is malformed', async () => {
      const response = await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Authorization': 'InvalidToken',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationId: '123e4567-e89b-12d3-a456-426614174000',
          options: {
            dry_run: false,
            force: false,
            skip_validation: false
          }
        })
      })

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toEqual({
        error: 'Missing or invalid authorization header'
      })
    })

    it('should return 401 when user authentication fails', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid token' }
          })
        }
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      const response = await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationId: '123e4567-e89b-12d3-a456-426614174000',
          options: {
            dry_run: false,
            force: false,
            skip_validation: false
          }
        })
      })

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toEqual({
        error: 'Invalid authentication token'
      })
    })

    it('should return 401 when clinic_id is missing from user metadata', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: 'test-user-id',
                user_metadata: {} // No clinic_id
              }
            },
            error: null
          })
        }
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      const response = await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationId: '123e4567-e89b-12d3-a456-426614174000',
          options: {
            dry_run: false,
            force: false,
            skip_validation: false
          }
        })
      })

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toEqual({
        error: 'Missing clinic_id in user metadata'
      })
    })
  })

  describe('Request Validation', () => {
    const mockUser = {
      id: 'test-user-id',
      user_metadata: {
        clinic_id: 'test-clinic-id'
      }
    }

    beforeEach(() => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        }
      }
      mockCreateClient.mockReturnValue(mockSupabase)
    })

    it('should return 400 when migrationId is missing', async () => {
      const response = await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          options: {
            dry_run: false,
            force: false,
            skip_validation: false
          }
        })
      })

      expect(response.status).toBe(400)
      const body = await response.json()
      // The error is a ZodError object, so we need to check if it's an object
      expect(body.error).toBeDefined()
      // Check if it contains validation-related information
      if (typeof body.error === 'object') {
        expect(body.error.name).toBe('ZodError')
      } else {
        expect(body.error).toContain('validation')
      }
    })

    it('should return 400 when migrationId is not a valid UUID', async () => {
      const response = await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationId: 'invalid-uuid',
          options: {
            dry_run: false,
            force: false,
            skip_validation: false
          }
        })
      })

      expect(response.status).toBe(400)
      const body = await response.json()
      // The error is a ZodError object, so we need to check if it's an object
      expect(body.error).toBeDefined()
      // Check if it contains validation-related information
      if (typeof body.error === 'object') {
        expect(body.error.name).toBe('ZodError')
      } else {
        expect(body.error).toContain('validation')
      }
    })

    it('should accept valid request with all fields', async () => {
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            status: 'started',
            started_at: '2024-01-01T00:00:00Z'
          }
        })
      }

      mockFetch.mockResolvedValue(mockFetchResponse as any)

      const response = await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationId: '123e4567-e89b-12d3-a456-426614174000',
          options: {
            dry_run: false,
            force: false,
            skip_validation: false
          }
        })
      })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.forwarded).toBe(true)
      expect(body.responseTime).toBeTypeOf('number')
    })

    it('should accept valid request with minimal fields', async () => {
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            status: 'started'
          }
        })
      }

      mockFetch.mockResolvedValue(mockFetchResponse as any)

      const response = await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationId: '123e4567-e89b-12d3-a456-426614174000'
        })
      })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.forwarded).toBe(true)
    })
  })

  describe('Node tRPC Forwarding', () => {
    const mockUser = {
      id: 'test-user-id',
      user_metadata: {
        clinic_id: 'test-clinic-id'
      }
    }

    beforeEach(() => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        }
      }
      mockCreateClient.mockReturnValue(mockSupabase)
    })

    it('should forward request to Node tRPC endpoint', async () => {
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            status: 'started'
          }
        })
      }

      mockFetch.mockResolvedValue(mockFetchResponse as any)

      await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationId: '123e4567-e89b-12d3-a456-426614174000',
          options: {
            dry_run: true,
            force: false,
            skip_validation: false
          }
        })
      })

      // Verify fetch was called with correct parameters
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/trpc/migration.startMigration',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify({
            id: '123e4567-e89b-12d3-a456-426614174000',
            options: {
              dry_run: true,
              force: false,
              skip_validation: false
            }
          })
        }
      )
    })

    it('should handle Node tRPC success response', async () => {
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            status: 'started',
            started_at: '2024-01-01T00:00:00Z',
            estimated_completion: '2024-01-15T00:00:00Z'
          }
        })
      }

      mockFetch.mockResolvedValue(mockFetchResponse as any)

      const response = await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationId: '123e4567-e89b-12d3-a456-426614174000'
        })
      })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.data).toEqual({
        success: true,
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          status: 'started',
          started_at: '2024-01-01T00:00:00Z',
          estimated_completion: '2024-01-15T00:00:00Z'
        }
      })
      expect(body.forwarded).toBe(true)
      expect(body.responseTime).toBeTypeOf('number')
    })

    it('should handle Node tRPC error response', async () => {
      const mockFetchResponse = {
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          error: 'Migration already in progress',
          code: 'MIGRATION_IN_PROGRESS'
        })
      }

      mockFetch.mockResolvedValue(mockFetchResponse as any)

      const response = await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationId: '123e4567-e89b-12d3-a456-426614174000'
        })
      })

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Failed to start migration')
      expect(body.details).toEqual({
        error: 'Migration already in progress',
        code: 'MIGRATION_IN_PROGRESS'
      })
      expect(body.responseTime).toBeTypeOf('number')
    })

    it('should handle Node tRPC network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const response = await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationId: '123e4567-e89b-12d3-a456-426614174000'
        })
      })

      expect(response.status).toBe(500)
      const body = await response.json()
      expect(body.error).toBe('Failed to start migration')
      expect(body.responseTime).toBeTypeOf('number')
    })
  })

  describe('LGPD Compliance Logging', () => {
    const mockUser = {
      id: 'test-user-id',
      user_metadata: {
        clinic_id: 'test-clinic-id'
      }
    }

    beforeEach(() => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        }
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      // Mock console.error for audit logging
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should log audit trail for successful migration start', async () => {
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            status: 'started'
          }
        })
      }

      mockFetch.mockResolvedValue(mockFetchResponse as any)

      await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationId: '123e4567-e89b-12d3-a456-426614174000',
          options: {
            dry_run: false,
            force: true,
            skip_validation: false
          }
        })
      })

      // Verify audit log was created
      expect(console.error).toHaveBeenCalledWith(
        'LGPD Audit: Migration start request',
        expect.objectContaining({
          userId: 'test-user-id',
          clinicId: 'test-clinic-id',
          migrationId: '123e4567-e89b-12d3-a456-426614174000',
          options: {
            dry_run: false,
            force: true,
            skip_validation: false
          },
          timestamp: expect.any(String),
          result: 'success'
        })
      )
    })

    it('should log audit trail for failed migration start', async () => {
      const mockFetchResponse = {
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          error: 'Migration already in progress'
        })
      }

      mockFetch.mockResolvedValue(mockFetchResponse as any)

      await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationId: '123e4567-e89b-12d3-a456-426614174000'
        })
      })

      // Verify audit log was created with failed result
      expect(console.error).toHaveBeenCalledWith(
        'LGPD Audit: Migration start request',
        expect.objectContaining({
          userId: 'test-user-id',
          clinicId: 'test-clinic-id',
          migrationId: '123e4567-e89b-12d3-a456-426614174000',
          options: undefined,
          timestamp: expect.any(String),
          result: 'failed'
        })
      )
    })
  })

  describe('Performance', () => {
    const mockUser = {
      id: 'test-user-id',
      user_metadata: {
        clinic_id: 'test-clinic-id'
      }
    }

    beforeEach(() => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        }
      }
      mockCreateClient.mockReturnValue(mockSupabase)
    })

    it('should include response time in response', async () => {
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            status: 'started'
          }
        })
      }

      mockFetch.mockResolvedValue(mockFetchResponse as any)

      const response = await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationId: '123e4567-e89b-12d3-a456-426614174000'
        })
      })

      const body = await response.json()
      expect(body.responseTime).toBeTypeOf('number')
      expect(body.responseTime).toBeGreaterThanOrEqual(0)
    })

    it('should target TTFB <150ms for forwarding (performance test)', async () => {
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            status: 'started'
          }
        })
      }

      mockFetch.mockResolvedValue(mockFetchResponse as any)

      const startTime = Date.now()
      const response = await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationId: '123e4567-e89b-12d3-a456-426614174000'
        })
      })
      const endTime = Date.now()

      expect(response.status).toBe(200)

      // This test will initially fail, then pass after optimization
      const actualTTFB = endTime - startTime
      expect(actualTTFB).toBeLessThan(150) // Target: <150ms
    })
  })

  describe('Security', () => {
    it('should use anon client only (no service role key)', async () => {
      // This test verifies that the Edge runtime doesn't have access to service role keys
      // Note: In test environment, service role key might be available, but Edge runtime should use anon key only
      // The actual implementation should use anon client regardless of environment

      const mockUser = {
        id: 'test-user-id',
        user_metadata: {
          clinic_id: 'test-clinic-id'
        }
      }

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        }
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            status: 'started'
          }
        })
      }

      mockFetch.mockResolvedValue(mockFetchResponse as any)

      await app.request('/migration/start', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationId: '123e4567-e89b-12d3-a456-426614174000'
        })
      })

      // Verify createClient was called with anon key only
      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.any(Object)
      )
    })
  })
})
