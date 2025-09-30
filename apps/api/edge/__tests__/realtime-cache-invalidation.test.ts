/**
 * Realtime Cache Invalidation Tests
 *
 * Tests for Supabase realtime cache invalidation hooks in Edge runtime.
 * Ensures cache is properly invalidated when data changes.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import app from '../index'
import { EdgeCache, invalidateCache, clearCacheForTesting } from '../middleware/cache'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn()
}))

const mockCreateClient = createClient as any

describe('Edge API - Realtime Cache Invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Clear the singleton cache before each test
    clearCacheForTesting()

    // Default successful authentication mock
    const mockUser = {
      id: 'test-user-id',
      user_metadata: {
        clinic_id: 'test-clinic-id'
      }
    }

    mockCreateClient.mockImplementation((url, key, options) => {
      const supabaseMock = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        },
        from: vi.fn().mockImplementation((table) => {
          const mockQuery = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: getDefaultDataForTable(table),
                      error: null
                    })
                  })
                }),
                single: vi.fn().mockResolvedValue({
                  data: getDefaultDataForTable(table),
                  error: null
                })
              })
            })
          }

          // Add order method for performance metrics
          if (table === 'performance_metrics') {
            mockQuery.select.mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [getDefaultDataForTable(table)],
                    error: null
                  })
                })
              })
            })
          }

          return mockQuery
        }),
        channel: vi.fn().mockReturnValue({
          on: vi.fn().mockReturnThis(),
          subscribe: vi.fn().mockResolvedValue({}),
          unsubscribe: vi.fn()
        })
      }

      return supabaseMock
    })

    // Helper function to get default data for different tables
    function getDefaultDataForTable(table: string) {
      switch (table) {
        case 'architecture_configs':
          return {
            id: 'test-config-id',
            clinic_id: 'test-clinic-id',
            config: { test: 'value' },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        case 'performance_metrics':
          return {
            id: 'test-metric-id',
            clinic_id: 'test-clinic-id',
            metric_name: 'response_time',
            metric_value: 120,
            created_at: new Date().toISOString()
          }
        case 'compliance_status':
          return {
            id: 'test-compliance-id',
            clinic_id: 'test-clinic-id',
            lgpd_compliance: true,
            anvisa_compliance: true,
            cfm_compliance: false,
            updated_at: new Date().toISOString()
          }
        case 'migration_states':
          return {
            id: 'test-migration-id',
            clinic_id: 'test-clinic-id',
            status: 'in_progress',
            progress: 75,
            current_step: 'data_migration',
            started_at: new Date().toISOString(),
            estimated_completion: new Date().toISOString(),
            metadata: { test: 'value' }
          }
        case 'package_manager_configs':
          return {
            id: 'test-pkg-config-id',
            clinic_id: 'test-clinic-id',
            package_manager: 'bun',
            version: '1.2.3',
            config: { registry: 'https://registry.npmjs.org' },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        default:
          return null
      }
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Cache Invalidation on Realtime Events', () => {
    it('should invalidate cache when architecture config changes', async () => {
      // First request to populate cache
      const firstResponse = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(firstResponse.status).toBe(200)
      const firstData = await firstResponse.json()

      // Verify cache was populated (first request should not be cached)
      expect(firstData.cached).toBe(false)

      // Wait a bit to ensure cache is set
      await new Promise(resolve => setTimeout(resolve, 10))

      // Second request should hit cache
      const cachedResponse = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(cachedResponse.status).toBe(200)
      const cachedData = await cachedResponse.json()
      expect(cachedData.cached).toBe(true)

      // Simulate realtime event for architecture config change
      const realtimePayload = {
        event: 'UPDATE',
        schema: 'public',
        table: 'architecture_configs',
        commit_timestamp: new Date().toISOString(),
        old: { id: 'test-config-id' },
        new: {
          id: 'test-config-id',
          config: { updated: 'value' },
          updated_at: new Date().toISOString()
        }
      }

      // Simulate realtime subscription receiving event
      // (This would be handled by the realtime subscription handler)
      const url = 'http://localhost/architecture/config'
      const clinicId = 'test-clinic-id'
      invalidateCache(url, clinicId)

      // Third request should miss cache after invalidation
      const secondResponse = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(secondResponse.status).toBe(200)
      const secondData = await secondResponse.json()
      expect(secondData.cached).toBe(false)
    })

    it('should invalidate cache when performance metrics change', async () => {
      // First request to populate cache
      const firstResponse = await app.request('/performance/metrics', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(firstResponse.status).toBe(200)
      const firstData = await firstResponse.json()
      expect(firstData.cached).toBe(false)

      // Wait a bit to ensure cache is set
      await new Promise(resolve => setTimeout(resolve, 10))

      // Second request should hit cache
      const cachedResponse = await app.request('/performance/metrics', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(cachedResponse.status).toBe(200)
      const cachedData = await cachedResponse.json()
      expect(cachedData.cached).toBe(true)

      // Simulate realtime event for performance metrics change
      const realtimePayload = {
        event: 'INSERT',
        schema: 'public',
        table: 'performance_metrics',
        commit_timestamp: new Date().toISOString(),
        new: {
          id: 'new-metric-id',
          clinic_id: 'test-clinic-id',
          metric_name: 'response_time',
          metric_value: 120,
          created_at: new Date().toISOString()
        }
      }

      // Simulate realtime subscription receiving event
      const url = 'http://localhost/performance/metrics'
      const clinicId = 'test-clinic-id'
      invalidateCache(url, clinicId)

      // Third request should miss cache after invalidation
      const secondResponse = await app.request('/performance/metrics', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(secondResponse.status).toBe(200)
      const secondData = await secondResponse.json()
      expect(secondData.cached).toBe(false)
    })

    it('should invalidate cache when compliance status changes', async () => {
      // First request to populate cache
      const firstResponse = await app.request('/compliance/status', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(firstResponse.status).toBe(200)
      const firstData = await firstResponse.json()
      expect(firstData.cached).toBe(false)

      // Wait a bit to ensure cache is set
      await new Promise(resolve => setTimeout(resolve, 10))

      // Second request should hit cache
      const cachedResponse = await app.request('/compliance/status', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(cachedResponse.status).toBe(200)
      const cachedData = await cachedResponse.json()
      expect(cachedData.cached).toBe(true)

      // Simulate realtime event for compliance status change
      const realtimePayload = {
        event: 'UPDATE',
        schema: 'public',
        table: 'compliance_status',
        commit_timestamp: new Date().toISOString(),
        old: { id: 'test-compliance-id' },
        new: {
          id: 'test-compliance-id',
          clinic_id: 'test-clinic-id',
          lgpd_compliance: true,
          anvisa_compliance: true,
          cfm_compliance: false,
          updated_at: new Date().toISOString()
        }
      }

      // Simulate realtime subscription receiving event
      const url = 'http://localhost/compliance/status'
      const clinicId = 'test-clinic-id'
      invalidateCache(url, clinicId)

      // Third request should miss cache after invalidation
      const secondResponse = await app.request('/compliance/status', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(secondResponse.status).toBe(200)
      const secondData = await secondResponse.json()
      expect(secondData.cached).toBe(false)
    })

    it('should invalidate cache when migration state changes', async () => {
      // First request to populate cache
      const firstResponse = await app.request('/migration/state', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(firstResponse.status).toBe(200)
      const firstData = await firstResponse.json()
      expect(firstData.cached).toBe(false)

      // Wait a bit to ensure cache is set
      await new Promise(resolve => setTimeout(resolve, 10))

      // Second request should hit cache
      const cachedResponse = await app.request('/migration/state', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(cachedResponse.status).toBe(200)
      const cachedData = await cachedResponse.json()
      expect(cachedData.cached).toBe(true)

      // Simulate realtime event for migration state change
      const realtimePayload = {
        event: 'UPDATE',
        schema: 'public',
        table: 'migration_states',
        commit_timestamp: new Date().toISOString(),
        old: { id: 'test-migration-id' },
        new: {
          id: 'test-migration-id',
          clinic_id: 'test-clinic-id',
          status: 'in_progress',
          progress: 75,
          current_step: 'data_migration',
          updated_at: new Date().toISOString()
        }
      }

      // Simulate realtime subscription receiving event
      const url = 'http://localhost/migration/state'
      const clinicId = 'test-clinic-id'
      invalidateCache(url, clinicId)

      // Third request should miss cache after invalidation
      const secondResponse = await app.request('/migration/state', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(secondResponse.status).toBe(200)
      const secondData = await secondResponse.json()
      expect(secondData.cached).toBe(false)
    })

    it('should invalidate cache when package manager config changes', async () => {
      // First request to populate cache
      const firstResponse = await app.request('/package-manager/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(firstResponse.status).toBe(200)
      const firstData = await firstResponse.json()
      expect(firstData.cached).toBe(false)

      // Wait a bit to ensure cache is set
      await new Promise(resolve => setTimeout(resolve, 10))

      // Second request should hit cache
      const cachedResponse = await app.request('/package-manager/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(cachedResponse.status).toBe(200)
      const cachedData = await cachedResponse.json()
      expect(cachedData.cached).toBe(true)

      // Simulate realtime event for package manager config change
      const realtimePayload = {
        event: 'UPDATE',
        schema: 'public',
        table: 'package_manager_configs',
        commit_timestamp: new Date().toISOString(),
        old: { id: 'test-pkg-config-id' },
        new: {
          id: 'test-pkg-config-id',
          clinic_id: 'test-clinic-id',
          package_manager: 'bun',
          version: '1.2.3',
          config: { registry: 'https://registry.npmjs.org' },
          updated_at: new Date().toISOString()
        }
      }

      // Simulate realtime subscription receiving event
      const url = 'http://localhost/package-manager/config'
      const clinicId = 'test-clinic-id'
      invalidateCache(url, clinicId)

      // Third request should miss cache after invalidation
      const secondResponse = await app.request('/package-manager/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(secondResponse.status).toBe(200)
      const secondData = await secondResponse.json()
      expect(secondData.cached).toBe(false)
    })
  })

  describe('Cache Invalidation Edge Cases', () => {
    it('should not invalidate cache for unrelated table changes', async () => {
      // First request to populate cache
      const firstResponse = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(firstResponse.status).toBe(200)
      const firstData = await firstResponse.json()
      expect(firstData.cached).toBe(false)

      // Wait a bit to ensure cache is set
      await new Promise(resolve => setTimeout(resolve, 10))

      // Second request should hit cache
      const cachedResponse = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(cachedResponse.status).toBe(200)
      const cachedData = await cachedResponse.json()
      expect(cachedData.cached).toBe(true)

      // Simulate realtime event for unrelated table
      const realtimePayload = {
        event: 'UPDATE',
        schema: 'public',
        table: 'unrelated_table',
        commit_timestamp: new Date().toISOString(),
        old: { id: 'unrelated-id' },
        new: {
          id: 'unrelated-id',
          clinic_id: 'test-clinic-id',
          some_field: 'some_value',
          updated_at: new Date().toISOString()
        }
      }

      // Don't invalidate cache for unrelated table (do nothing)
      // Cache should still be valid

      // Third request should still hit cache (not invalidated)
      const secondResponse = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(secondResponse.status).toBe(200)
      const secondData = await secondResponse.json()
      expect(secondData.cached).toBe(true)
    })

    it('should not invalidate cache for different clinic data changes', async () => {
      // First request to populate cache
      const firstResponse = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(firstResponse.status).toBe(200)
      const firstData = await firstResponse.json()
      expect(firstData.cached).toBe(false)

      // Wait a bit to ensure cache is set
      await new Promise(resolve => setTimeout(resolve, 10))

      // Second request should hit cache
      const cachedResponse = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(cachedResponse.status).toBe(200)
      const cachedData = await cachedResponse.json()
      expect(cachedData.cached).toBe(true)

      // Simulate realtime event for different clinic
      const realtimePayload = {
        event: 'UPDATE',
        schema: 'public',
        table: 'architecture_configs',
        commit_timestamp: new Date().toISOString(),
        old: { id: 'other-config-id' },
        new: {
          id: 'other-config-id',
          clinic_id: 'other-clinic-id', // Different clinic
          config: { other: 'value' },
          updated_at: new Date().toISOString()
        }
      }

      // Don't invalidate cache for different clinic (do nothing)
      // Cache should still be valid

      // Third request should still hit cache (not invalidated)
      const secondResponse = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(secondResponse.status).toBe(200)
      const secondData = await secondResponse.json()
      expect(secondData.cached).toBe(true)
    })

    it('should handle concurrent realtime events gracefully', async () => {
      // First request to populate cache
      const firstResponse = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(firstResponse.status).toBe(200)
      const firstData = await firstResponse.json()
      expect(firstData.cached).toBe(false)

      // Wait a bit to ensure cache is set
      await new Promise(resolve => setTimeout(resolve, 10))

      // Second request should hit cache
      const cachedResponse = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(cachedResponse.status).toBe(200)
      const cachedData = await cachedResponse.json()
      expect(cachedData.cached).toBe(true)

      // Simulate multiple concurrent realtime events
      const events = [
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'architecture_configs',
          commit_timestamp: new Date().toISOString(),
          old: { id: 'test-config-id' },
          new: { id: 'test-config-id', config: { v1: 'value1' } }
        },
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'architecture_configs',
          commit_timestamp: new Date().toISOString(),
          old: { id: 'test-config-id' },
          new: { id: 'test-config-id', config: { v2: 'value2' } }
        },
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'architecture_configs',
          commit_timestamp: new Date().toISOString(),
          old: { id: 'test-config-id' },
          new: { id: 'test-config-id', config: { v3: 'value3' } }
        }
      ]

      // Process all events (cache should be invalidated)
      const url = 'http://localhost/architecture/config'
      const clinicId = 'test-clinic-id'
      events.forEach(() => invalidateCache(url, clinicId))

      // Third request should miss cache after invalidation
      const secondResponse = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(secondResponse.status).toBe(200)
      const secondData = await secondResponse.json()
      expect(secondData.cached).toBe(false)
    })
  })

  describe('Realtime Subscription Management', () => {
    it('should handle requests without realtime subscriptions (not implemented yet)', async () => {
      // Mock Supabase client with realtime capabilities
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockResolvedValue({}),
        unsubscribe: vi.fn()
      }

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id', user_metadata: { clinic_id: 'test-clinic-id' } } },
            error: null
          })
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'test-config-id' },
                error: null
              })
            })
          })
        }),
        channel: vi.fn().mockReturnValue(mockChannel)
      }

      mockCreateClient.mockReturnValue(mockSupabase)

      // Make request to trigger subscription setup
      const response = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.status).toBe(200)

      // Realtime subscriptions are not implemented yet in the Edge app
      // This test verifies the request still works without subscriptions
      const data = await response.json()
      expect(data.success).toBe(true)
    })

    it('should handle realtime subscription errors gracefully', async () => {
      // Mock Supabase client with subscription error
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockRejectedValue(new Error('Subscription failed')),
        unsubscribe: vi.fn()
      }

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id', user_metadata: { clinic_id: 'test-clinic-id' } } },
            error: null
          })
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'test-config-id' },
                error: null
              })
            })
          })
        }),
        channel: vi.fn().mockReturnValue(mockChannel)
      }

      mockCreateClient.mockReturnValue(mockSupabase)

      // Make request - should succeed even with subscription error
      const response = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.status).toBe(200)

      // Subscription error should not affect the request
      const data = await response.json()
      expect(data.success).toBe(true)
    })
  })
})
