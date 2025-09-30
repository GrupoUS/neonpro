/**
 * Health Endpoints Integration Tests
 * 
 * Comprehensive tests for Edge and Node runtime health check endpoints
 * Following TDD methodology and NeonPro quality standards
 */

import { describe, it, expect, beforeEach } from 'vitest'
import edgeHealth from '../edge/health'
import nodeHealth from '../node/health'

describe('Health Endpoints Integration', () => {
  describe('Edge Runtime Health Check', () => {
    it('should return 200 status code', async () => {
      const req = new Request('http://localhost/api/health')
      const res = await edgeHealth.fetch(req)
      
      expect(res.status).toBe(200)
    })

    it('should return correct JSON structure', async () => {
      const req = new Request('http://localhost/api/health')
      const res = await edgeHealth.fetch(req)
      const data = await res.json()
      
      expect(data).toHaveProperty('status')
      expect(data).toHaveProperty('runtime')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('version')
      expect(data).toHaveProperty('region')
      expect(data).toHaveProperty('responseTime')
    })

    it('should return runtime as "edge"', async () => {
      const req = new Request('http://localhost/api/health')
      const res = await edgeHealth.fetch(req)
      const data = await res.json()
      
      expect(data.runtime).toBe('edge')
      expect(data.status).toBe('healthy')
      expect(data.version).toBe('1.0.0')
    })

    it('should not expose sensitive data', async () => {
      const req = new Request('http://localhost/api/health')
      const res = await edgeHealth.fetch(req)
      const data = await res.json()
      
      expect(data).not.toHaveProperty('apiKey')
      expect(data).not.toHaveProperty('secret')
      expect(data).not.toHaveProperty('password')
    })

    it('should respond quickly (performance check)', async () => {
      const startTime = Date.now()
      const req = new Request('http://localhost/api/health')
      const res = await edgeHealth.fetch(req)
      await res.json()
      const endTime = Date.now()
      
      const responseTime = endTime - startTime
      // Allow 200ms for test environment overhead
      expect(responseTime).toBeLessThan(200)
    })
  })

  describe('Node Runtime Health Check', () => {
    it('should return 200 status code', async () => {
      const req = new Request('http://localhost/api/health/node')
      const res = await nodeHealth.fetch(req)
      
      expect(res.status).toBe(200)
    })

    it('should return correct JSON structure', async () => {
      const req = new Request('http://localhost/api/health/node')
      const res = await nodeHealth.fetch(req)
      const data = await res.json()
      
      expect(data).toHaveProperty('status')
      expect(data).toHaveProperty('runtime')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('version')
      expect(data).toHaveProperty('region')
      expect(data).toHaveProperty('uptime')
      expect(data).toHaveProperty('serviceRoleConfigured')
      expect(data).toHaveProperty('responseTime')
    })

    it('should return runtime as "node"', async () => {
      const req = new Request('http://localhost/api/health/node')
      const res = await nodeHealth.fetch(req)
      const data = await res.json()
      
      expect(data.runtime).toBe('node')
      expect(data.status).toBe('healthy')
      expect(data.version).toBe('1.0.0')
    })

    it('should verify service role without exposing key', async () => {
      const req = new Request('http://localhost/api/health/node')
      const res = await nodeHealth.fetch(req)
      const data = await res.json()
      const responseText = JSON.stringify(data)
      
      expect(data).toHaveProperty('serviceRoleConfigured')
      expect(typeof data.serviceRoleConfigured).toBe('boolean')
      expect(data).not.toHaveProperty('serviceRoleKey')
      expect(data).not.toHaveProperty('SUPABASE_SERVICE_ROLE_KEY')
    })

    it('should not expose sensitive data', async () => {
      const req = new Request('http://localhost/api/health/node')
      const res = await nodeHealth.fetch(req)
      const data = await res.json()
      
      expect(data).not.toHaveProperty('apiKey')
      expect(data).not.toHaveProperty('secret')
      expect(data).not.toHaveProperty('password')
      expect(data).not.toHaveProperty('databaseUrl')
    })
  })
})
