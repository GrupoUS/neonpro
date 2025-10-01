/**
 * Contract Test for Package Manager API
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { createTestClient } from './helpers/test-client'

describe('Package Manager API', () => {
  let client: any

  beforeEach(async () => {
    client = await createTestClient()
  })

  afterEach(async () => {
    if (client) {
      await client.cleanup()
    }
  })

  describe('GET /api/trpc/packageManager.getState', () => {
    it('should return package manager configuration', async () => {
      const response = await client.packageManager.getState()

      expect(response).toBeDefined()
      expect(response.name).toBe('NeonPro Package Manager Configuration')
      expect(response.environment).toBe('development')
      expect(response.packageManager).toBeDefined()
      expect(response.packageManager.primary).toBe('bun')
      expect(response.packageManager.version).toBeDefined()
      expect(response.packageManager.lockFile).toBe('bun.lockb')
      expect(response.buildPerformance).toBeDefined()
      expect(response.buildPerformance.buildTime).toBeGreaterThanOrEqual(0)
      expect(response.buildPerformance.installTime).toBeGreaterThanOrEqual(0)
      expect(response.buildPerformance.bundleSize).toBeDefined()
      expect(response.buildPerformance.bundleSize.main).toBeGreaterThanOrEqual(0)
      expect(response.buildPerformance.bundleSize.vendor).toBeGreaterThanOrEqual(0)
      expect(response.buildPerformance.bundleSize.total).toBeGreaterThanOrEqual(0)
      expect(response.buildPerformance.cacheHitRate).toBeGreaterThanOrEqual(0)
      expect(response.buildPerformance.timestamp).toBeDefined()
    })

    it('should return package manager configuration for staging environment', async () => {
      const response = await client.packageManager.getState({ environment: 'staging' })

      expect(response).toBeDefined()
      expect(response.name).toBe('NeonPro Package Manager Configuration')
      expect(response.environment).toBe('staging')
      expect(response.packageManager).toBeDefined()
      expect(response.packageManager.primary).toBe('bun')
      expect(response.buildPerformance).toBeDefined()
    })

    it('should return package manager configuration for production environment', async () => {
      const response = await client.packageManager.getState({ environment: 'production' })

      expect(response).toBeDefined()
      expect(response.name).toBe('NeonPro Package Manager Configuration')
      expect(response.environment).toBe('production')
      expect(response.packageManager).toBeDefined()
      expect(response.packageManager.primary).toBe('bun')
      expect(response.buildPerformance).toBeDefined()
    })
  })

  describe('POST /api/trpc/packageManager.createState', () => {
    it('should create a new package manager configuration', async () => {
      const config = {
        name: 'Test Package Manager Configuration',
        environment: 'development',
        packageManager: {
          primary: 'bun' as const,
          version: '1.0.0',
          lockFile: 'bun.lockb' as const,
          registry: 'https://registry.npmjs.org',
          fallback: 'npm' as const,
          scopes: ['@neonpro'],
        },
        buildPerformance: {
          buildTime: 1000,
          installTime: 500,
          bundleSize: {
            main: 100000,
            vendor: 200000,
            total: 300000,
          },
          cacheHitRate: 80,
          timestamp: new Date(),
        },
      }

      const response = await client.packageManager.createState(config)

      expect(response).toBeDefined()
      expect(response.id).toBeDefined()
      expect(response.name).toBe(config.name)
      expect(response.environment).toBe(config.environment)
      expect(response.packageManager.primary).toBe(config.packageManager.primary)
      expect(response.packageManager.version).toBe(config.packageManager.version)
      expect(response.packageManager.lockFile).toBe(config.packageManager.lockFile)
      expect(response.packageManager.registry).toBe(config.packageManager.registry)
      expect(response.packageManager.fallback).toBe(config.packageManager.fallback)
      expect(response.packageManager.scopes).toEqual(config.packageManager.scopes)
      expect(response.buildPerformance.buildTime).toBe(config.buildPerformance.buildTime)
      expect(response.buildPerformance.installTime).toBe(config.buildPerformance.installTime)
      expect(response.buildPerformance.bundleSize.main).toBe(config.buildPerformance.bundleSize.main)
      expect(response.buildPerformance.bundleSize.vendor).toBe(config.buildPerformance.bundleSize.vendor)
      expect(response.buildPerformance.bundleSize.total).toBe(config.buildPerformance.bundleSize.total)
      expect(response.buildPerformance.cacheHitRate).toBe(config.buildPerformance.cacheHitRate)
      expect(response.createdAt).toBeDefined()
      expect(response.updatedAt).toBeDefined()
    })

    it('should throw an error if configuration already exists for the environment', async () => {
      const config = {
        name: 'Test Package Manager Configuration',
        environment: 'development',
        packageManager: {
          primary: 'bun' as const,
          version: '1.0.0',
          lockFile: 'bun.lockb' as const,
          registry: 'https://registry.npmjs.org',
        },
        buildPerformance: {
          buildTime: 1000,
          installTime: 500,
          bundleSize: {
            main: 100000,
            vendor: 200000,
            total: 300000,
          },
          cacheHitRate: 80,
          timestamp: new Date(),
        },
      }

      // First creation should succeed
      await client.packageManager.createState(config)

      // Second creation should fail
      try {
        await client.packageManager.createState(config)
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.code).toBe('CONFLICT')
        expect(error.message).toContain('already exists')
      }
    })
  })

  describe('POST /api/trpc/packageManager.updateState', () => {
    it('should update an existing package manager configuration', async () => {
      // Get the current configuration
      const currentState = await client.packageManager.getState()

      // Update the configuration
      const update = {
        name: 'Updated Package Manager Configuration',
        packageManager: {
          primary: 'pnpm' as const,
          version: '2.0.0',
          lockFile: 'pnpm-lock.yaml' as const,
          registry: 'https://registry.npmjs.org',
        },
        buildPerformance: {
          buildTime: 800,
          installTime: 400,
          bundleSize: {
            main: 90000,
            vendor: 180000,
            total: 270000,
          },
          cacheHitRate: 85,
          timestamp: new Date(),
        },
      }

      const response = await client.packageManager.updateState({
        id: currentState.id,
        update,
      })

      expect(response).toBeDefined()
      expect(response.id).toBe(currentState.id)
      expect(response.name).toBe(update.name)
      expect(response.packageManager.primary).toBe(update.packageManager.primary)
      expect(response.packageManager.version).toBe(update.packageManager.version)
      expect(response.packageManager.lockFile).toBe(update.packageManager.lockFile)
      expect(response.buildPerformance.buildTime).toBe(update.buildPerformance.buildTime)
      expect(response.buildPerformance.installTime).toBe(update.buildPerformance.installTime)
      expect(response.buildPerformance.bundleSize.main).toBe(update.buildPerformance.bundleSize.main)
      expect(response.buildPerformance.bundleSize.vendor).toBe(update.buildPerformance.bundleSize.vendor)
      expect(response.buildPerformance.bundleSize.total).toBe(update.buildPerformance.bundleSize.total)
      expect(response.buildPerformance.cacheHitRate).toBe(update.buildPerformance.cacheHitRate)
      expect(response.updatedAt).not.toBe(currentState.updatedAt)
    })

    it('should throw an error if configuration does not exist', async () => {
      const update = {
        name: 'Updated Package Manager Configuration',
        packageManager: {
          primary: 'pnpm' as const,
          version: '2.0.0',
          lockFile: 'pnpm-lock.yaml' as const,
          registry: 'https://registry.npmjs.org',
        },
      }

      try {
        await client.packageManager.updateState({
          id: 'non-existent-id',
          update,
        })
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND')
        expect(error.message).toContain('not found')
      }
    })
  })

  describe('POST /api/trpc/packageManager.trackBuildPerformance', () => {
    it('should track build performance metrics', async () => {
      // Get the current configuration
      const currentState = await client.packageManager.getState()

      // Track build performance
      const performance = {
        buildTime: 900,
        installTime: 450,
        bundleSize: {
          main: 95000,
          vendor: 190000,
          total: 285000,
        },
        cacheHitRate: 82,
        timestamp: new Date(),
      }

      const response = await client.packageManager.trackBuildPerformance({
        metricsId: currentState.id,
        performance,
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })
  })

  describe('GET /api/trpc/packageManager.getPerformanceHistory', () => {
    it('should return performance history', async () => {
      // Get the current configuration
      const currentState = await client.packageManager.getState()

      // Get performance history
      const response = await client.packageManager.getPerformanceHistory({
        metricsId: currentState.id,
        limit: 5,
      })

      expect(response).toBeDefined()
      expect(Array.isArray(response)).toBe(true)
      expect(response.length).toBeLessThanOrEqual(5)

      if (response.length > 0) {
        expect(response[0].buildTime).toBeGreaterThanOrEqual(0)
        expect(response[0].installTime).toBeGreaterThanOrEqual(0)
        expect(response[0].bundleSize).toBeDefined()
        expect(response[0].bundleSize.main).toBeGreaterThanOrEqual(0)
        expect(response[0].bundleSize.vendor).toBeGreaterThanOrEqual(0)
        expect(response[0].bundleSize.total).toBeGreaterThanOrEqual(0)
        expect(response[0].cacheHitRate).toBeGreaterThanOrEqual(0)
        expect(response[0].timestamp).toBeDefined()
      }
    })
  })

  describe('GET /api/trpc/packageManager.comparePerformanceWithBaseline', () => {
    it('should compare performance with baseline', async () => {
      // Get the current configuration
      const currentState = await client.packageManager.getState()

      // Compare performance with baseline
      const response = await client.packageManager.comparePerformanceWithBaseline({
        metricsId: currentState.id,
        currentMetrics: currentState.buildPerformance,
      })

      expect(response).toBeDefined()
      expect(response.buildTimeImprovement).toBeGreaterThanOrEqual(0)
      expect(response.installTimeImprovement).toBeGreaterThanOrEqual(0)
      expect(response.bundleSizeImprovement).toBeGreaterThanOrEqual(0)
      expect(response.cacheHitRateImprovement).toBeGreaterThanOrEqual(0)
    })
  })

  describe('POST /api/trpc/packageManager.validateBunPerformance', () => {
    it('should validate Bun performance', async () => {
      // Get the current configuration
      const currentState = await client.packageManager.getState()

      // Validate Bun performance
      const response = await client.packageManager.validateBunPerformance({
        metricsId: currentState.id,
      })

      expect(response).toBeDefined()
      expect(response.isValid).toBe(true)
      expect(response.buildTimeImprovement).toBeGreaterThanOrEqual(0)
      expect(response.installTimeImprovement).toBeGreaterThanOrEqual(0)
      expect(response.bundleSizeReduction).toBeGreaterThanOrEqual(0)
      expect(response.cacheHitRateImprovement).toBeGreaterThanOrEqual(0)
    })
  })
})
