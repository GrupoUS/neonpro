/**
 * Edge TTFB Logging Middleware Tests
 *
 * TDD approach: Write failing tests first, then implement the functionality.
 * Tests for TTFB logging middleware that measures and logs Time to First Byte
 * for all Edge routes to the performance_metrics table.
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
let mockSupabaseClient: any
let mockInsert: any

beforeEach(async () => {
  // Set environment variables before importing the app
  process.env = {
    ...originalEnv,
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key'
  }

  // Mock insert function
  mockInsert = vi.fn().mockResolvedValue({
    data: { id: 'test-metric-id' },
    error: null
  })

  // Mock Supabase client with insert
  mockSupabaseClient = {
    from: vi.fn().mockReturnValue({
      insert: mockInsert
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      })
    }
  }

  // Mock createClient for both authentication and TTFB logging
  mockCreateClient.mockImplementation((url: string, key: string, options: any) => {
    // Always return the mock client with insert capability
    // This ensures that even new instances created within setTimeout get the mock
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'test-config', clinic_id: 'test-clinic-id' },
        error: null
      }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [{ id: 'test-metric' }],
        error: null
      }),
      insert: mockInsert
    }

    return {
      from: vi.fn().mockReturnValue(mockQuery),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Invalid token' }
        })
      },
      realtime: {
        setAuth: vi.fn().mockResolvedValue(undefined)
      },
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockResolvedValue(undefined),
        unsubscribe: vi.fn().mockResolvedValue(undefined)
      })
    }
  })

  // Dynamic import to ensure env vars are set
  const appModule = await import('../index')
  app = appModule.default
})

describe('Edge API - TTFB Logging Middleware', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('TTFB Measurement', () => {
    it('should measure TTFB from startTime to response completion', async () => {
      const mockUser = {
        id: 'test-user-id',
        user_metadata: {
          clinic_id: 'test-clinic-id'
        }
      }

      // Mock authentication
      mockCreateClient.mockImplementation((url: string, key: string, options: any) => {
        const mockQuery = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'test-config', clinic_id: 'test-clinic-id' },
            error: null
          }),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [{ id: 'test-metric' }],
            error: null
          }),
          insert: mockInsert
        }

        if (options?.global?.headers?.Authorization) {
          return {
            auth: {
              getUser: vi.fn().mockResolvedValue({
                data: { user: mockUser },
                error: null
              })
            },
            from: vi.fn().mockReturnValue(mockQuery),
            realtime: {
              setAuth: vi.fn().mockResolvedValue(undefined)
            },
            channel: vi.fn().mockReturnValue({
              on: vi.fn().mockReturnThis(),
              subscribe: vi.fn().mockResolvedValue(undefined),
              unsubscribe: vi.fn().mockResolvedValue(undefined)
            })
          }
        }
        return {
          from: vi.fn().mockReturnValue(mockQuery),
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: { message: 'Invalid token' }
            })
          },
          realtime: {
            setAuth: vi.fn().mockResolvedValue(undefined)
          },
          channel: vi.fn().mockReturnValue({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockResolvedValue(undefined),
            unsubscribe: vi.fn().mockResolvedValue(undefined)
          })
        }
      })

      // Mock database query for architecture config
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'test-config', clinic_id: 'test-clinic-id' },
          error: null
        })
      }

      mockSupabaseClient.from = vi.fn().mockReturnValue(mockQuery)

      const startTime = Date.now()
      const response = await app.request('/architecture/config', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.status).toBe(200)

      // Wait a bit for async logging
      await new Promise(resolve => setTimeout(resolve, 50))

      // Verify that insert was called with TTFB measurement
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          metric_name: 'ttfb_edge',
          metric_value: expect.any(Number),
          clinic_id: 'test-clinic-id'
        })
      )

      // Verify TTFB is reasonable (should be positive and measured in ms)
      const insertCall = mockInsert.mock.calls[0][0]
      expect(insertCall.metric_value).toBeGreaterThan(0)
      expect(insertCall.metric_value).toBeLessThan(10000) // Should be under 10 seconds
    })

    it('should include correct metric metadata', async () => {
      const mockUser = {
        id: 'test-user-id',
        user_metadata: {
          clinic_id: 'test-clinic-id'
        }
      }

      // Mock authentication
      mockCreateClient.mockImplementation((url: string, key: string, options: any) => {
        const mockQuery = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'test-config', clinic_id: 'test-clinic-id' },
            error: null
          }),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [{ id: 'test-metric' }],
            error: null
          }),
          insert: mockInsert
        }

        if (options?.global?.headers?.Authorization) {
          return {
            auth: {
              getUser: vi.fn().mockResolvedValue({
                data: { user: mockUser },
                error: null
              })
            },
            from: vi.fn().mockReturnValue(mockQuery),
            realtime: {
              setAuth: vi.fn().mockResolvedValue(undefined)
            },
            channel: vi.fn().mockReturnValue({
              on: vi.fn().mockReturnThis(),
              subscribe: vi.fn().mockResolvedValue(undefined),
              unsubscribe: vi.fn().mockResolvedValue(undefined)
            })
          }
        }
        return {
          from: vi.fn().mockReturnValue(mockQuery),
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: { message: 'Invalid token' }
            })
          },
          realtime: {
            setAuth: vi.fn().mockResolvedValue(undefined)
          },
          channel: vi.fn().mockReturnValue({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockResolvedValue(undefined),
            unsubscribe: vi.fn().mockResolvedValue(undefined)
          })
        }
      })

      // Request health with proper authentication to get 200 response
      const mockUser2 = {
        id: 'test-user-id',
        user_metadata: {
          clinic_id: 'test-clinic-id'
        }
      }

      // Mock authentication
      mockCreateClient.mockImplementation((url: string, key: string, options: any) => {
        const mockQuery = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'test-config', clinic_id: 'test-clinic-id' },
            error: null
          }),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [{ id: 'test-metric' }],
            error: null
          }),
          insert: mockInsert
        }

        if (options?.global?.headers?.Authorization) {
          return {
            auth: {
              getUser: vi.fn().mockResolvedValue({
                data: { user: mockUser2 },
                error: null
              })
            },
            from: vi.fn().mockReturnValue(mockQuery),
            realtime: {
              setAuth: vi.fn().mockResolvedValue(undefined)
            },
            channel: vi.fn().mockReturnValue({
              on: vi.fn().mockReturnThis(),
              subscribe: vi.fn().mockResolvedValue(undefined),
              unsubscribe: vi.fn().mockResolvedValue(undefined)
            })
          }
        }
        return {
          from: vi.fn().mockReturnValue(mockQuery),
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: { message: 'Invalid token' }
            })
          },
          realtime: {
            setAuth: vi.fn().mockResolvedValue(undefined)
          },
          channel: vi.fn().mockReturnValue({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockResolvedValue(undefined),
            unsubscribe: vi.fn().mockResolvedValue(undefined)
          })
        }
      })

      await app.request('/health', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      // Wait a bit for async logging
      await new Promise(resolve => setTimeout(resolve, 50))

      // Verify that insert was called with correct structure
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          metric_name: 'ttfb_edge',
          clinic_id: 'test-clinic-id',
          created_at: expect.any(String)
        })
      )
    })

    it('should calculate TTFB correctly for different routes', async () => {
      const mockUser = {
        id: 'test-user-id',
        user_metadata: {
          clinic_id: 'test-clinic-id'
        }
      }

      // Mock authentication
      mockCreateClient.mockImplementation((url: string, key: string, options: any) => {
        const mockQuery = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'test-config', clinic_id: 'test-clinic-id' },
            error: null
          }),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [{ id: 'test-metric' }],
            error: null
          }),
          insert: mockInsert
        }

        if (options?.global?.headers?.Authorization) {
          return {
            auth: {
              getUser: vi.fn().mockResolvedValue({
                data: { user: mockUser },
                error: null
              })
            },
            from: vi.fn().mockReturnValue(mockQuery),
            realtime: {
              setAuth: vi.fn().mockResolvedValue(undefined)
            },
            channel: vi.fn().mockReturnValue({
              on: vi.fn().mockReturnThis(),
              subscribe: vi.fn().mockResolvedValue(undefined),
              unsubscribe: vi.fn().mockResolvedValue(undefined)
            })
          }
        }
        return {
          from: vi.fn().mockReturnValue(mockQuery),
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: { message: 'Invalid token' }
            })
          },
          realtime: {
            setAuth: vi.fn().mockResolvedValue(undefined)
          },
          channel: vi.fn().mockReturnValue({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockResolvedValue(undefined),
            unsubscribe: vi.fn().mockResolvedValue(undefined)
          })
        }
      })

      // Mock database queries
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'test-data', clinic_id: 'test-clinic-id' },
          error: null
        }),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [{ id: 'test-metric' }],
          error: null
        })
      }

      mockSupabaseClient.from = vi.fn().mockReturnValue(mockQuery)

      // Test multiple routes
      const routes = ['/health', '/architecture/config', '/performance/metrics']

      for (const route of routes) {
        await app.request(route, {
          headers: {
            'Authorization': 'Bearer valid-token'
          }
        })
      }

      // Wait a bit for async logging
      await new Promise(resolve => setTimeout(resolve, 50))

      // Should have logged TTFB for each route
      expect(mockInsert).toHaveBeenCalledTimes(routes.length)

      // All calls should have correct metric name
      mockInsert.mock.calls.forEach((call: any) => {
        expect(call[0].metric_name).toBe('ttfb_edge')
        expect(call[0].clinic_id).toBe('test-clinic-id')
      })
    })
  })

  describe('Error Handling', () => {
    it('should not block response when Supabase insert fails', async () => {
      const mockUser = {
        id: 'test-user-id',
        user_metadata: {
          clinic_id: 'test-clinic-id'
        }
      }

      // Mock authentication
      mockCreateClient.mockImplementation((url: string, key: string, options: any) => {
        const mockQuery = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'test-config', clinic_id: 'test-clinic-id' },
            error: null
          }),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [{ id: 'test-metric' }],
            error: null
          }),
          insert: mockInsert
        }

        if (options?.global?.headers?.Authorization) {
          return {
            auth: {
              getUser: vi.fn().mockResolvedValue({
                data: { user: mockUser },
                error: null
              })
            },
            from: vi.fn().mockReturnValue(mockQuery),
            realtime: {
              setAuth: vi.fn().mockResolvedValue(undefined)
            },
            channel: vi.fn().mockReturnValue({
              on: vi.fn().mockReturnThis(),
              subscribe: vi.fn().mockResolvedValue(undefined),
              unsubscribe: vi.fn().mockResolvedValue(undefined)
            })
          }
        }
        return {
          from: vi.fn().mockReturnValue(mockQuery),
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: { message: 'Invalid token' }
            })
          },
          realtime: {
            setAuth: vi.fn().mockResolvedValue(undefined)
          },
          channel: vi.fn().mockReturnValue({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockResolvedValue(undefined),
            unsubscribe: vi.fn().mockResolvedValue(undefined)
          })
        }
      })

      // Mock insert failure
      mockInsert.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      })

      // Mock console.error to capture error logging
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const response = await app.request('/health', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      // Wait a bit for async logging
      await new Promise(resolve => setTimeout(resolve, 50))

      // Response should still succeed
      expect(response.status).toBe(200)

      // Error should be logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to log TTFB metric:',
        expect.any(Object)
      )

      consoleErrorSpy.mockRestore()
    })

    it('should handle missing clinic_id gracefully', async () => {
      // This test verifies the middleware handles edge cases
      // where clinic_id might not be available

      // Mock authentication without clinic_id
      mockCreateClient.mockImplementation((url: string, key: string, options: any) => {
        const mockQuery = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'test-config', clinic_id: 'test-clinic-id' },
            error: null
          }),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [{ id: 'test-metric' }],
            error: null
          }),
          insert: mockInsert
        }

        if (options?.global?.headers?.Authorization) {
          return {
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
            },
            from: vi.fn().mockReturnValue(mockQuery),
            realtime: {
              setAuth: vi.fn().mockResolvedValue(undefined)
            },
            channel: vi.fn().mockReturnValue({
              on: vi.fn().mockReturnThis(),
              subscribe: vi.fn().mockResolvedValue(undefined),
              unsubscribe: vi.fn().mockResolvedValue(undefined)
            })
          }
        }
        return {
          from: vi.fn().mockReturnValue(mockQuery),
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: { message: 'Invalid token' }
            })
          },
          realtime: {
            setAuth: vi.fn().mockResolvedValue(undefined)
          },
          channel: vi.fn().mockReturnValue({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockResolvedValue(undefined),
            unsubscribe: vi.fn().mockResolvedValue(undefined)
          })
        }
      })

      const response = await app.request('/health', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      // Should return 401 due to missing clinic_id (handled by auth middleware)
      expect(response.status).toBe(401)

      // TTFB logging should not be called since auth failed
      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  describe('Performance Impact', () => {
    it('should not significantly impact response time', async () => {
      const mockUser = {
        id: 'test-user-id',
        user_metadata: {
          clinic_id: 'test-clinic-id'
        }
      }

      // Mock authentication
      mockCreateClient.mockImplementation((url: string, key: string, options: any) => {
        const mockQuery = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'test-config', clinic_id: 'test-clinic-id' },
            error: null
          }),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [{ id: 'test-metric' }],
            error: null
          }),
          insert: mockInsert
        }

        if (options?.global?.headers?.Authorization) {
          return {
            auth: {
              getUser: vi.fn().mockResolvedValue({
                data: { user: mockUser },
                error: null
              })
            },
            from: vi.fn().mockReturnValue(mockQuery),
            realtime: {
              setAuth: vi.fn().mockResolvedValue(undefined)
            },
            channel: vi.fn().mockReturnValue({
              on: vi.fn().mockReturnThis(),
              subscribe: vi.fn().mockResolvedValue(undefined),
              unsubscribe: vi.fn().mockResolvedValue(undefined)
            })
          }
        }
        return {
          from: vi.fn().mockReturnValue(mockQuery),
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: { message: 'Invalid token' }
            })
          },
          realtime: {
            setAuth: vi.fn().mockResolvedValue(undefined)
          },
          channel: vi.fn().mockReturnValue({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockResolvedValue(undefined),
            unsubscribe: vi.fn().mockResolvedValue(undefined)
          })
        }
      })

      // Measure response time with TTFB logging
      const startTime = Date.now()
      const response = await app.request('/health', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })
      const endTime = Date.now()

      expect(response.status).toBe(200)

      // Response should still be fast (adding minimal overhead)
      const responseTime = endTime - startTime
      expect(responseTime).toBeLessThan(100) // Should be under 100ms
    })
  })
})
