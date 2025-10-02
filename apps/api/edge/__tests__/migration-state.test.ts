/**
 * Edge Migration State Route Tests
 *
 * TDD approach: Write failing tests first, then implement the functionality.
 * Tests for GET /migration/state Edge route with Supabase anon client and RLS.
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
    SUPABASE_ANON_KEY: 'test-anon-key'
  }

  // Dynamic import to ensure env vars are set
  const appModule = await import('../index')
  app = appModule.default
})

describe('Edge API - GET /migration/state', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Authentication', () => {
    it('should return 401 when no authorization header is provided', async () => {
      const response = await app.request('/migration/state')

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toEqual({
        error: 'Missing or invalid authorization header'
      })
    })

    it('should return 401 when authorization header is malformed', async () => {
      const response = await app.request('/migration/state', {
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

      const response = await app.request('/migration/state', {
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

      const response = await app.request('/migration/state', {
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

    it('should return migration state when found', async () => {
      const mockMigrationState = {
        id: 'migration-1',
        clinic_id: 'test-clinic-id',
        migration_name: 'phase-2-edge-expansion',
        status: 'in_progress',
        progress: 65,
        started_at: '2024-01-01T00:00:00Z',
        estimated_completion: '2024-01-15T00:00:00Z',
        current_step: 'Implement caching middleware',
        total_steps: 10,
        completed_steps: 6,
        error_message: null,
        metadata: {
          phase: 'edge-expansion',
          target_ttfb: 150,
          cache_strategy: 'in-memory'
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-10T00:00:00Z'
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockMigrationState,
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

      const response = await app.request('/migration/state', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.data).toEqual(mockMigrationState)
      expect(body.responseTime).toBeTypeOf('number')
      expect(body.cached).toBe(false)
    })

    it('should return 404 when migration state not found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' } // Postgrest error for no rows returned
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

      const response = await app.request('/migration/state', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body.error).toBe('Migration state not found')
      expect(body.responseTime).toBeTypeOf('number')
    })

    it('should return 500 when database query fails', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
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

      const response = await app.request('/migration/state', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.status).toBe(500)
      const body = await response.json()
      expect(body.error).toBe('Failed to fetch migration state')
      expect(body.responseTime).toBeTypeOf('number')
    })

    it('should filter by clinic_id from user metadata', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'migration-1' },
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

      await app.request('/migration/state', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      // Verify that the query was filtered by clinic_id
      expect(mockQuery.eq).toHaveBeenCalledWith('clinic_id', 'test-clinic-id')
    })

    it('should order by created_at descending', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'migration-1' },
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

      await app.request('/migration/state', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      // Verify that migration states are ordered by created_at descending
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should limit results to 1 record (most recent)', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'migration-1' },
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

      await app.request('/migration/state', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      // Verify that results are limited to 1 record
      expect(mockQuery.limit).toHaveBeenCalledWith(1)
    })
  })

  describe('Migration State Fields', () => {
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

    it('should include migration progress fields', async () => {
      const mockMigrationState = {
        id: 'migration-1',
        clinic_id: 'test-clinic-id',
        migration_name: 'phase-2-edge-expansion',
        status: 'in_progress',
        progress: 65,
        current_step: 'Implement caching middleware',
        total_steps: 10,
        completed_steps: 6,
        error_message: null
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockMigrationState,
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

      const response = await app.request('/migration/state', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.data.progress).toBe(65)
      expect(body.data.current_step).toBe('Implement caching middleware')
      expect(body.data.total_steps).toBe(10)
      expect(body.data.completed_steps).toBe(6)
      expect(body.data.error_message).toBeNull()
    })

    it('should include timing fields', async () => {
      const mockMigrationState = {
        id: 'migration-1',
        clinic_id: 'test-clinic-id',
        migration_name: 'phase-2-edge-expansion',
        status: 'in_progress',
        started_at: '2024-01-01T00:00:00Z',
        estimated_completion: '2024-01-15T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-10T00:00:00Z'
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockMigrationState,
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

      const response = await app.request('/migration/state', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.data.started_at).toBe('2024-01-01T00:00:00Z')
      expect(body.data.estimated_completion).toBe('2024-01-15T00:00:00Z')
      expect(body.data.created_at).toBe('2024-01-01T00:00:00Z')
      expect(body.data.updated_at).toBe('2024-01-10T00:00:00Z')
    })

    it('should include metadata field for additional information', async () => {
      const mockMigrationState = {
        id: 'migration-1',
        clinic_id: 'test-clinic-id',
        migration_name: 'phase-2-edge-expansion',
        status: 'in_progress',
        metadata: {
          phase: 'edge-expansion',
          target_ttfb: 150,
          cache_strategy: 'in-memory',
          routes_completed: 5,
          total_routes: 8
        }
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockMigrationState,
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

      const response = await app.request('/migration/state', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.data.metadata).toEqual({
        phase: 'edge-expansion',
        target_ttfb: 150,
        cache_strategy: 'in-memory',
        routes_completed: 5,
        total_routes: 8
      })
    })
  })

  describe('Performance', () => {
    it('should include response time in response', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'migration-1' },
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

      const response = await app.request('/migration/state', {
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
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'migration-1' },
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
      const response = await app.request('/migration/state', {
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
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'migration-1' },
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

      await app.request('/migration/state', {
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
