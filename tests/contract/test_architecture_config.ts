/**
 * Contract Test for Architecture Configuration API
 * Testing the hybrid architecture (Bun + Edge + Supabase Functions)
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { createTestClient } from './helpers/test-client'

describe('Architecture Configuration API', () => {
  let client: ReturnType<typeof createTestClient>

  beforeEach(async () => {
    client = createTestClient()
    await client.setup()
  })

  afterEach(async () => {
    await client.cleanup()
  })

  describe('GET /api/v1/architecture/config', () => {
    it('should return current architecture configuration', async () => {
      const response = await client.get('/architecture/config')

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('id')
      expect(response.data).toHaveProperty('name')
      expect(response.data).toHaveProperty('environment')
      expect(response.data).toHaveProperty('edgeEnabled')
      expect(response.data).toHaveProperty('supabaseFunctionsEnabled')
      expect(response.data).toHaveProperty('bunEnabled')
      expect(response.data).toHaveProperty('performanceMetrics')
      expect(response.data).toHaveProperty('complianceStatus')
      expect(response.data).toHaveProperty('createdAt')
      expect(response.data).toHaveProperty('updatedAt')

      // Validate hybrid architecture settings
      expect(response.data.edgeEnabled).toBe(true)
      expect(response.data.supabaseFunctionsEnabled).toBe(true)
      expect(response.data.bunEnabled).toBe(true)

      // Validate performance metrics
      expect(response.data.performanceMetrics).toHaveProperty('edgeTTFB')
      expect(response.data.performanceMetrics).toHaveProperty('realtimeUIPatch')
      expect(response.data.performanceMetrics).toHaveProperty('copilotToolRoundtrip')
      expect(response.data.performanceMetrics).toHaveProperty('buildTime')
      expect(response.data.performanceMetrics).toHaveProperty('bundleSize')
      expect(response.data.performanceMetrics).toHaveProperty('uptime')

      // Validate compliance status
      expect(response.data.complianceStatus).toHaveProperty('lgpd')
      expect(response.data.complianceStatus).toHaveProperty('anvisa')
      expect(response.data.complianceStatus).toHaveProperty('cfm')
      expect(response.data.complianceStatus).toHaveProperty('wcag')

      // Validate healthcare compliance
      expect(response.data.complianceStatus.lgpd.compliant).toBe(true)
      expect(response.data.complianceStatus.anvisa.compliant).toBe(true)
      expect(response.data.complianceStatus.cfm.compliant).toBe(true)
      expect(response.data.complianceStatus.wcag.compliant).toBe(true)
    })

    it('should return 401 for unauthenticated requests', async () => {
      const response = await client.get('/architecture/config', { authenticated: false })

      expect(response.status).toBe(401)
      expect(response.data).toHaveProperty('error')
      expect(response.data).toHaveProperty('message')
    })

    it('should return 500 for server errors', async () => {
      // Mock server error
      await client.mockServerError('/architecture/config', 'GET')

      const response = await client.get('/architecture/config')

      expect(response.status).toBe(500)
      expect(response.data).toHaveProperty('error')
      expect(response.data).toHaveProperty('message')
    })
  })

  describe('PUT /api/v1/architecture/config', () => {
    it('should update architecture configuration', async () => {
      const updateData = {
        edgeEnabled: true,
        supabaseFunctionsEnabled: true,
        bunEnabled: true,
      }

      const response = await client.put('/architecture/config', updateData)

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('id')
      expect(response.data).toHaveProperty('name')
      expect(response.data).toHaveProperty('environment')
      expect(response.data).toHaveProperty('edgeEnabled')
      expect(response.data).toHaveProperty('supabaseFunctionsEnabled')
      expect(response.data).toHaveProperty('bunEnabled')
      expect(response.data).toHaveProperty('performanceMetrics')
      expect(response.data).toHaveProperty('complianceStatus')
      expect(response.data).toHaveProperty('createdAt')
      expect(response.data).toHaveProperty('updatedAt')

      // Validate updated values
      expect(response.data.edgeEnabled).toBe(updateData.edgeEnabled)
      expect(response.data.supabaseFunctionsEnabled).toBe(updateData.supabaseFunctionsEnabled)
      expect(response.data.bunEnabled).toBe(updateData.bunEnabled)

      // Validate compliance maintained after update
      expect(response.data.complianceStatus.lgpd.compliant).toBe(true)
      expect(response.data.complianceStatus.anvisa.compliant).toBe(true)
      expect(response.data.complianceStatus.cfm.compliant).toBe(true)
      expect(response.data.complianceStatus.wcag.compliant).toBe(true)
    })

    it('should return 400 for invalid update data', async () => {
      const invalidData = {
        edgeEnabled: 'invalid',
        supabaseFunctionsEnabled: 'invalid',
        bunEnabled: 'invalid',
      }

      const response = await client.put('/architecture/config', invalidData)

      expect(response.status).toBe(400)
      expect(response.data).toHaveProperty('error')
      expect(response.data).toHaveProperty('message')
    })

    it('should return 401 for unauthenticated requests', async () => {
      const updateData = {
        edgeEnabled: true,
        supabaseFunctionsEnabled: true,
        bunEnabled: true,
      }

      const response = await client.put('/architecture/config', updateData, { authenticated: false })

      expect(response.status).toBe(401)
      expect(response.data).toHaveProperty('error')
      expect(response.data).toHaveProperty('message')
    })

    it('should return 500 for server errors', async () => {
      // Mock server error
      await client.mockServerError('/architecture/config', 'PUT')

      const updateData = {
        edgeEnabled: true,
        supabaseFunctionsEnabled: true,
        bunEnabled: true,
      }

      const response = await client.put('/architecture/config', updateData)

      expect(response.status).toBe(500)
      expect(response.data).toHaveProperty('error')
      expect(response.data).toHaveProperty('message')
    })
  })

  describe('Healthcare Compliance', () => {
    it('should maintain LGPD compliance for all operations', async () => {
      // Test GET request
      const getResponse = await client.get('/architecture/config')
      expect(getResponse.status).toBe(200)
      expect(getResponse.data.complianceStatus.lgpd.compliant).toBe(true)

      // Test PUT request
      const updateData = {
        edgeEnabled: true,
        supabaseFunctionsEnabled: true,
        bunEnabled: true,
      }

      const putResponse = await client.put('/architecture/config', updateData)
      expect(putResponse.status).toBe(200)
      expect(putResponse.data.complianceStatus.lgpd.compliant).toBe(true)
    })

    it('should maintain ANVISA compliance for all operations', async () => {
      // Test GET request
      const getResponse = await client.get('/architecture/config')
      expect(getResponse.status).toBe(200)
      expect(getResponse.data.complianceStatus.anvisa.compliant).toBe(true)

      // Test PUT request
      const updateData = {
        edgeEnabled: true,
        supabaseFunctionsEnabled: true,
        bunEnabled: true,
      }

      const putResponse = await client.put('/architecture/config', updateData)
      expect(putResponse.status).toBe(200)
      expect(putResponse.data.complianceStatus.anvisa.compliant).toBe(true)
    })

    it('should maintain CFM compliance for all operations', async () => {
      // Test GET request
      const getResponse = await client.get('/architecture/config')
      expect(getResponse.status).toBe(200)
      expect(getResponse.data.complianceStatus.cfm.compliant).toBe(true)

      // Test PUT request
      const updateData = {
        edgeEnabled: true,
        supabaseFunctionsEnabled: true,
        bunEnabled: true,
      }

      const putResponse = await client.put('/architecture/config', updateData)
      expect(putResponse.status).toBe(200)
      expect(putResponse.data.complianceStatus.cfm.compliant).toBe(true)
    })

    it('should maintain WCAG compliance for all operations', async () => {
      // Test GET request
      const getResponse = await client.get('/architecture/config')
      expect(getResponse.status).toBe(200)
      expect(getResponse.data.complianceStatus.wcag.compliant).toBe(true)

      // Test PUT request
      const updateData = {
        edgeEnabled: true,
        supabaseFunctionsEnabled: true,
        bunEnabled: true,
      }

      const putResponse = await client.put('/architecture/config', updateData)
      expect(putResponse.status).toBe(200)
      expect(putResponse.data.complianceStatus.wcag.compliant).toBe(true)
    })
  })

  describe('Performance Metrics', () => {
    it('should return valid performance metrics', async () => {
      const response = await client.get('/architecture/config')

      expect(response.status).toBe(200)
      expect(response.data.performanceMetrics.edgeTTFB).toBeLessThanOrEqual(150)
      expect(response.data.performanceMetrics.realtimeUIPatch).toBeLessThanOrEqual(1.5)
      expect(response.data.performanceMetrics.copilotToolRoundtrip).toBeLessThanOrEqual(2)
      expect(response.data.performanceMetrics.uptime).toBeGreaterThan(99.9)
    })

    it('should track build performance improvements with Bun', async () => {
      const response = await client.get('/architecture/config')

      expect(response.status).toBe(200)
      expect(response.data.performanceMetrics.buildTime).toBeGreaterThan(0)
      expect(response.data.performanceMetrics.bundleSize).toHaveProperty('main')
      expect(response.data.performanceMetrics.bundleSize).toHaveProperty('vendor')
      expect(response.data.performanceMetrics.bundleSize).toHaveProperty('total')
    })
  })
})
