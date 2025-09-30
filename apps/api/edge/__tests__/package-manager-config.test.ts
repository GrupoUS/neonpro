/**
 * Edge Package Manager Config Route Tests
 *
 * TDD approach: Write failing tests first, then implement the functionality.
 * Tests for GET /package-manager/config Edge route that queries package_manager_configs table.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock environment variables first, before importing the app
const originalEnv = process.env

// Mock Supabase client
const mockCreateClient = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient
}))

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

describe('Edge API - GET /package-manager/config', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Authentication', () => {
    it('should return 401 when no authorization header is provided', async () => {
      const response = await app.request('/package-manager/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toEqual({
        error: 'Missing or invalid authorization header'
      })
    })

    it('should return 401 when authorization header is malformed', async () => {
      const response = await app.request('/package-manager/config', {
        method: 'GET',
        headers: {
          'Authorization': 'InvalidToken',
          'Content-Type': 'application/json'
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

      const response = await app.request('/package-manager/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
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

      const response = await app.request('/package-manager/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
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

    it('should return 404 when package manager config is not found', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
              })
            })
          })
        })
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      const response = await app.request('/package-manager/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body).toEqual({
        error: 'Package manager configuration not found',
        responseTime: expect.any(Number)
      })
    })

    it('should return 500 when database query fails', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database connection failed' }
              })
            })
          })
        })
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      const response = await app.request('/package-manager/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(500)
      const body = await response.json()
      expect(body).toEqual({
        error: 'Failed to fetch package manager configuration',
        responseTime: expect.any(Number)
      })
    })

    it('should return package manager config data when found', async () => {
      const mockConfigData = {
        id: 'test-config-id',
        clinic_id: 'test-clinic-id',
        package_manager: 'bun',
        version: '1.0.0',
        config: {
          registry: 'https://registry.npmjs.org',
          cache_enabled: true,
          cache_duration: 3600
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockConfigData,
                error: null
              })
            })
          })
        })
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      const response = await app.request('/package-manager/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toEqual({
        success: true,
        data: mockConfigData,
        responseTime: expect.any(Number),
        cached: false
      })
    })
  })

  describe('Security', () => {
    it('should filter by clinic_id for RLS compliance', async () => {
      const mockUser = {
        id: 'test-user-id',
        user_metadata: {
          clinic_id: 'test-clinic-id'
        }
      }

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'config-id' },
              error: null
            })
          })
        })
      })

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        },
        from: mockFrom
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      await app.request('/package-manager/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        }
      })

      // Verify RLS filtering by clinic_id
      expect(mockFrom).toHaveBeenCalledWith('package_manager_configs')
      expect(mockFrom().select).toHaveBeenCalledWith('*')
      expect(mockFrom().select().eq).toHaveBeenCalledWith('clinic_id', 'test-clinic-id')
    })

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
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'config-id' },
                error: null
              })
            })
          })
        })
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      await app.request('/package-manager/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
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
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'config-id' },
                error: null
              })
            })
          })
        })
      }
      mockCreateClient.mockReturnValue(mockSupabase)
    })

    it('should include response time in response', async () => {
      const response = await app.request('/package-manager/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        }
      })

      const body = await response.json()
      expect(body.responseTime).toBeTypeOf('number')
      expect(body.responseTime).toBeGreaterThanOrEqual(0)
    })

    it('should target TTFB <150ms for config retrieval (performance test)', async () => {
      const startTime = Date.now()
      const response = await app.request('/package-manager/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        }
      })
      const endTime = Date.now()

      expect(response.status).toBe(200)

      // This test will initially fail, then pass after optimization
      const actualTTFB = endTime - startTime
      expect(actualTTFB).toBeLessThan(150) // Target: <150ms
    })
  })
})
