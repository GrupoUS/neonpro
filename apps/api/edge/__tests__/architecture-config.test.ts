/**
 * Edge Architecture Config Route Tests
 *
 * TDD approach: Write failing tests first, then implement the functionality.
 * Tests for GET /architecture/config Edge route with Supabase anon client and RLS.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import app from '../index'

// Mock Supabase client
const mockCreateClient = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient
}))

// Mock environment variables
const originalEnv = process.env

describe('Edge API - GET /architecture/config', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env = {
      ...originalEnv,
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_ANON_KEY: 'test-anon-key'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Authentication', () => {
    it('should return 401 when no authorization header is provided', async () => {
      const response = await app.request('/architecture/config')

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toEqual({
        error: 'Missing or invalid authorization header'
      })
    })

    it('should return 401 when authorization header is malformed', async () => {
      const response = await app.request('/architecture/config', {
        headers: {
          'Authorization': 'InvalidToken'
        }
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

      const response = await app.request('/architecture/config', {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
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

      const response = await app.request('/architecture/config', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toEqual({
        error: 'Missing clinic_id in user metadata'
      })
    })
  })

  describe('Data Fetching', () => {
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

    it('should return 404 when architecture config is not found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      }

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        },
        from: vi.fn().mockReturnValue(mockQuery)
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      const response = await app.request('/architecture/config', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body).toEqual({
        error: 'Architecture configuration not found'
      })
    })

    it('should return 500 when database query fails', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' }
        })
      }

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        },
        from: vi.fn().mockReturnValue(mockQuery)
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      const response = await app.request('/architecture/config', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.status).toBe(500)
      const body = await response.json()
      expect(body.error).toBe('Failed to fetch architecture configuration')
      expect(body.responseTime).toBeTypeOf('number')
    })

    it('should return architecture config when found', async () => {
      const mockConfig = {
        id: 'test-config-id',
        name: 'Test Architecture Config',
        clinic_id: 'test-clinic-id',
        created_at: '2024-01-01T00:00:00Z'
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockConfig,
          error: null
        })
      }

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        },
        from: vi.fn().mockReturnValue(mockQuery)
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      const response = await app.request('/architecture/config', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.data).toEqual(mockConfig)
      expect(body.responseTime).toBeTypeOf('number')
      expect(body.cached).toBe(false)
    })

    it('should filter by clinic_id from user metadata', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'test-config' },
          error: null
        })
      }

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        },
        from: vi.fn().mockReturnValue(mockQuery)
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      await app.request('/architecture/config', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      // Verify that the query was filtered by clinic_id
      expect(mockQuery.eq).toHaveBeenCalledWith('clinic_id', 'test-clinic-id')
    })
  })

  describe('Performance', () => {
    it('should include response time in response', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'test-config' },
          error: null
        })
      }

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: 'test-user-id',
                user_metadata: {
                  clinic_id: 'test-clinic-id'
                }
              }
            },
            error: null
          })
        },
        from: vi.fn().mockReturnValue(mockQuery)
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      const response = await app.request('/architecture/config', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const body = await response.json()
      expect(body.responseTime).toBeTypeOf('number')
      expect(body.responseTime).toBeGreaterThanOrEqual(0)
    })

    it('should target TTFB <150ms (performance test)', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'test-config' },
          error: null
        })
      }

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: 'test-user-id',
                user_metadata: {
                  clinic_id: 'test-clinic-id'
                }
              }
            },
            error: null
          })
        },
        from: vi.fn().mockReturnValue(mockQuery)
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      const startTime = Date.now()
      const response = await app.request('/architecture/config', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
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
      expect(process.env['SUPABASE_SERVICE_ROLE_KEY']).toBeUndefined()

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'test-config' },
          error: null
        })
      }

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: 'test-user-id',
                user_metadata: {
                  clinic_id: 'test-clinic-id'
                }
              }
            },
            error: null
          })
        },
        from: vi.fn().mockReturnValue(mockQuery)
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      await app.request('/architecture/config', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
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
