/**
 * RLS Guard Middleware Tests
 *
 * TDD approach: Write failing tests first, then implement the functionality.
 * Tests for RLS (Row Level Security) guard middleware that verifies JWT clinic_id.
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

describe('Edge API - RLS Guard Middleware', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Authentication Validation', () => {
    it('should reject requests without authorization header', async () => {
      const response = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Missing or invalid authorization header')
    })

    it('should reject requests with invalid authorization header format', async () => {
      const response = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'InvalidFormat token',
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Missing or invalid authorization header')
    })

    it('should reject requests with invalid JWT token', async () => {
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
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Invalid authentication token')
    })

    it('should reject requests without clinic_id in user metadata', async () => {
      const mockUser = {
        id: 'test-user-id',
        user_metadata: {} // No clinic_id
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

      const response = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Missing clinic_id in user metadata')
    })
  })

  describe('RLS Enforcement', () => {
    const mockUser = {
      id: 'test-user-id',
      user_metadata: {
        clinic_id: 'test-clinic-id'
      }
    }

    it('should include clinic_id in database queries', async () => {
      const mockConfigData = {
        id: 'test-config-id',
        clinic_id: 'test-clinic-id',
        config: { test: 'value' }
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

      const response = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)

      // Verify that the query was filtered by clinic_id
      expect(mockSupabase.from).toHaveBeenCalledWith('architecture_configs')
      expect(mockSupabase.from().select).toHaveBeenCalledWith('*')
      expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('clinic_id', 'test-clinic-id')
    })

    it('should prevent cross-clinic data access', async () => {
      const mockUser = {
        id: 'test-user-id',
        user_metadata: {
          clinic_id: 'clinic-a'
        }
      }

      // Mock data for different clinic
      const mockConfigData = {
        id: 'test-config-id',
        clinic_id: 'clinic-b', // Different clinic
        config: { test: 'value' }
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
                data: null,
                error: { code: 'PGRST116' } // Not found
              })
            })
          })
        })
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      const response = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(404)

      // Verify that the query was filtered by user's clinic_id
      expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('clinic_id', 'clinic-a')
    })

    it('should handle authentication errors gracefully', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockRejectedValue(new Error('Network error'))
        }
      }
      mockCreateClient.mockReturnValue(mockSupabase)

      const response = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Authentication failed')
    })
  })

  describe('Security Headers', () => {
    const mockUser = {
      id: 'test-user-id',
      user_metadata: {
        clinic_id: 'test-clinic-id'
      }
    }

    it('should maintain security headers in responses', async () => {
      const mockConfigData = {
        id: 'test-config-id',
        clinic_id: 'test-clinic-id',
        config: { test: 'value' }
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

      const response = await app.request('/architecture/config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)

      // Check for security headers
      expect(response.headers.get('content-type')).toBe('application/json')
    })
  })
})
