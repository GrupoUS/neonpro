/**
 * Architecture Configuration API Integration Tests
 *
 * These tests validate the end-to-end functionality of the architecture configuration API
 * including database integration and healthcare compliance validation.
 *
 * T024: Create integration tests for API endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'bun:test'

describe('Architecture Configuration API Integration Tests', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'
  
  beforeAll(async () => {
    console.log('🧪 Setting up architecture configuration integration tests...')
  })
  
  afterAll(async () => {
    console.log('🧹 Cleaning up architecture configuration integration tests...')
  })

  describe('GET /api/architecture/config', () => {
    it('should return complete architecture configuration with database integration', async () => {
      const response = await fetch(`${API_BASE_URL}/api/architecture/config`)
      
      expect(response.status).toBe(200)
      
      const config = await response.json()
      
      // Verify basic structure
      expect(config).toHaveProperty('id')
      expect(config).toHaveProperty('name', 'NeonPro Architecture Configuration')
      expect(config).toHaveProperty('version', '1.0.0')
      expect(config).toHaveProperty('environment')
      
      // Verify Bun runtime configuration
      expect(config).toHaveProperty('bunRuntime')
      expect(config.bunRuntime).toHaveProperty('version', '>=1.1.0')
      expect(config.bunRuntime).toHaveProperty('optimizationLevel', 'standard')
      expect(config.bunRuntime).toHaveProperty('target', 'node')
      expect(config.bunRuntime).toHaveProperty('features')
      expect(Array.isArray(config.bunRuntime.features))
      
      // Verify healthcare compliance
      expect(config).toHaveProperty('healthcareCompliance')
      expect(config.healthcareCompliance).toHaveProperty('lgpdEnabled', true)
      expect(config.healthcareCompliance).toHaveProperty('anvisaEnabled', true)
      expect(config.healthcareCompliance).toHaveProperty('cfmEnabled', true)
      expect(config.healthcareCompliance).toHaveProperty('auditLogging', true)
      expect(config.healthcareCompliance).toHaveProperty('dataEncryption', true)
      expect(config.healthcareCompliance).toHaveProperty('accessControl', true)
      
      // Verify performance optimization
      expect(config).toHaveProperty('performanceOptimization')
      expect(config.performanceOptimization).toHaveProperty('edgeTTFBTarget', 100)
      expect(config.performanceOptimization).toHaveProperty('buildSpeedImprovement', 4.0)
      expect(config.performanceOptimization).toHaveProperty('memoryUsageReduction', 0.22)
      expect(config.performanceOptimization).toHaveProperty('cacheHitRateTarget', 0.9)
      
      // Verify edge runtime configuration
      expect(config).toHaveProperty('edgeRuntime')
      expect(config.edgeRuntime).toHaveProperty('enabled', true)
      expect(config.edgeRuntime).toHaveProperty('provider', 'vercel')
      expect(config.edgeRuntime).toHaveProperty('regions')
      expect(Array.isArray(config.edgeRuntime.regions))
      expect(config.edgeRuntime.configuration).toHaveProperty('runtime', 'bun')
      expect(config.edgeRuntime.configuration).toHaveProperty('memoryLimit', 512)
      expect(config.edgeRuntime.configuration).toHaveProperty('timeout', 30)
      
      // Verify build system configuration
      expect(config).toHaveProperty('buildSystem')
      expect(config.buildSystem).toHaveProperty('bundler', 'bun')
      expect(config.buildSystem).toHaveProperty('transpiler', 'bun')
      expect(config.buildSystem).toHaveProperty('minifier', 'bun')
      expect(config.buildSystem).toHaveProperty('optimizationLevel', 'standard')
      expect(config.buildSystem).toHaveProperty('codeSplitting', true)
      expect(config.buildSystem).toHaveProperty('treeShaking', true)
    })

    it('should validate configuration updates with database persistence', async () => {
      const updateData = {
        name: 'Updated Architecture Config',
        bunRuntime: {
          version: '>=1.2.0',
          optimizationLevel: 'aggressive'
        },
        healthcareCompliance: {
          lgpdEnabled: true,
          anvisaEnabled: true,
          cfmEnabled: true,
          auditLogging: true
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/api/architecture/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      expect(response.status).toBe(200)
      
      const result = await response.json()
      
      expect(result).toHaveProperty('success', true)
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('configuration')
      expect(result.configuration).toHaveProperty('updatedAt')
      expect(result.configuration).toHaveProperty('updatedBy', 'test-user')
      expect(result).toHaveProperty('validation')
      expect(result.validation).toHaveProperty('valid', true)
      expect(result.validation).toHaveProperty('healthcareCompliance')
      expect(result.validation.healthcareCompliance).toHaveProperty('lgpd', true)
      expect(result.validation.healthcareCompliance).toHaveProperty('anvisa', true)
      expect(result.validation.healthcareCompliance).toHaveProperty('cfm', true)
    })
  })

  describe('GET /api/architecture/config/bun', () => {
    it('should return Bun-specific configuration details', async () => {
      const response = await fetch(`${API_BASE_URL}/api/architecture/config/bun`)
      
      expect(response.status).toBe(200)
      
      const bunConfig = await response.json()
      
      // Verify Bun runtime details
      expect(bunConfig).toHaveProperty('bunRuntime')
      expect(bunConfig.bunRuntime).toHaveProperty('version', '>=1.1.0')
      expect(bunConfig.bunRuntime).toHaveProperty('optimizationLevel', 'standard')
      expect(bunConfig.bunRuntime).toHaveProperty('target', 'node')
      expect(bunConfig.bunRuntime).toHaveProperty('features')
      expect(Array.isArray(bunConfig.bunRuntime.features))
      expect(bunConfig.bunRuntime).toHaveProperty('enabled', true)
      
      // Verify performance metrics
      expect(bunConfig).toHaveProperty('performance')
      expect(bunConfig.performance).toHaveProperty('buildTime', 30)
      expect(bunConfig.performance).toHaveProperty('installTime', 45)
      expect(bunConfig.performance).toHaveProperty('memoryUsage', 800)
      expect(bunConfig.performance).toHaveProperty('optimization')
      expect(bunConfig.performance.optimization).toHaveProperty('enabled', true)
      expect(bunConfig.performance.optimization).toHaveProperty('level', 'standard')
      expect(bunConfig.performance.optimization).toHaveProperty('features')
      expect(Array.isArray(bunConfig.performance.optimization.features))
      
      // Verify compatibility
      expect(bunConfig).toHaveProperty('compatibility')
      expect(bunConfig.compatibility).toHaveProperty('nodeModules', true)
      expect(bunConfig.compatibility).toHaveProperty('nativeModules', false)
      expect(bunConfig.compatibility).toHaveProperty('webApi', true)
      expect(bunConfig.compatibility).toHaveProperty('esm', true)
      
      // Verify configuration
      expect(bunConfig.bunRuntime).toHaveProperty('configuration')
      expect(bunConfig.bunRuntime.configuration).toHaveProperty('minify', true)
      expect(bunConfig.bunRuntime.configuration).toHaveProperty('sourcemap', true)
      expect(bunConfig.bunRuntime.configuration).toHaveProperty('splitting', true)
      expect(bunConfig.bunRuntime.configuration).toHaveProperty('target', 'node')
    })
  })

  describe('GET /api/architecture/config/performance', () => {
    it('should return performance configuration with monitoring', async () => {
      const response = await fetch(`${API_BASE_URL}/api/architecture/config/performance`)
      
      expect(response.status).toBe(200)
      
      const perfConfig = await response.json()
      
      // Verify performance structure
      expect(perfConfig).toHaveProperty('performance')
      expect(perfConfig.performance).toHaveProperty('edge')
      expect(perfConfig.performance).toHaveProperty('build')
      expect(perfConfig.performance).toHaveProperty('monitoring')
      
      // Verify edge performance metrics
      expect(perfConfig.performance).toHaveProperty('ttfb')
      expect(perfConfig.performance.ttfb).toHaveProperty('current', 85)
      expect(perfConfig.performance.ttfb).toHaveProperty('target', 100)
      expect(perfConfig.performance.ttfb).toHaveProperty('percentile_50', 75)
      expect(perfConfig.performance.ttfb).toHaveProperty('percentile_95', 120)
      expect(perfConfig.performance.ttfb).toHaveProperty('percentile_99', 180)
      
      expect(perfConfig.performance.edge).toHaveProperty('cacheHitRate')
      expect(perfConfig.performance.edge.cacheHitRate).toHaveProperty('current', 0.85)
      expect(perfConfig.performance.edge.cacheHitRate).toHaveProperty('target', 0.9)
      expect(perfConfig.performance.edge).toHaveProperty('coldStart')
      expect(perfConfig.performance.coldStart).toHaveProperty('current', 450)
      expect(perfConfig.performance.coldStart).toHaveProperty('target', 500)
      
      // Verify build performance
      expect(perfConfig.performance).toHaveProperty('time', 30)
      expect(perfConfig.performance.build).toHaveProperty('memory', 800)
      expect(perfConfig.performance.build).toHaveProperty('optimization')
      expect(perfConfig.performance.build.optimization).toHaveProperty('enabled', true)
      expect(perfConfig.performance.build.optimization).toHaveProperty('level', 'standard')
      
      // Verify monitoring configuration
      expect(perfConfig.performance.monitoring).toHaveProperty('enabled', true)
      expect(perfConfig.performance.monitoring).toHaveProperty('interval', 60)
      expect(perfConfig.performance.monitoring).toHaveProperty('alertThresholds')
      expect(perfConfig.performance.monitoring.alertThresholds).toHaveProperty('ttfb', 200)
      expect(perfConfig.performance.monitoring.alertThresholds).toHaveProperty('memoryUsage', 1024)
      expect(perfConfig.performance.monitoring.alertThresholds).toHaveProperty('cpuUsage', 80)
      expect(perfConfig.performance.monitoring.alertThresholds).toHaveProperty('errorRate', 0.05)
    })
  })

  describe('Healthcare Compliance Validation', () => {
    it('should validate LGPD compliance in configuration', async () => {
      const response = await fetch(`${API_BASE_URL}/api/architecture/config`)
      
      expect(response.status).toBe(200)
      
      const config = await response.json()
      
      // Verify LGPD compliance
      expect(config.healthcareCompliance.lgpdEnabled).toBe(true)
      expect(config.healthcareCompliance.dataResidency).toHaveProperty('country', 'Brazil')
      expect(config.healthcareCompliance.dataResidency).toHaveProperty('region', 'Southeast')
      expect(config.healthcareCompliance.auditLogging).toBe(true)
      expect(config.healthcareCompliance.dataEncryption).toBe(true)
      expect(config.healthcareCompliance.consentManagement).toBe(true)
    })

    it('should validate ANVISA compliance in configuration', async () => {
      const response = await fetch(`${API_BASE_URL}/api/architecture/config`)
      
      expect(response.status).toBe(200)
      
      const config = await response.json()
      
      // Verify ANVISA compliance
      expect(config.healthcareCompliance.anvisaEnabled).toBe(true)
      expect(config.healthcareCompliance.medicalDeviceClass).toBe('II')
      expect(config.healthcareCompliance.validationRequired).toBe(true)
      expect(config.healthcareCompliance.documentation).toBe(true)
      expect(config.healthcareCompliance.traceability).toBe(true)
      expect(config.healthcareCompliance.qualityManagement).toBe(true)
    })

    it('should validate CFM compliance in configuration', async () => {
      const response = await fetch(`${API_BASE_URL}/api/architecture/config`)
      
      expect(response.status).toBe(200)
      
      const config = await response.json()
      
      // Verify CFM compliance
      expect(config.healthcareCompliance.cfmEnabled).toBe(true)
      expect(config.healthcareCompliance.auditRequired).toBe(true)
      expect(config.healthcareCompliance.patientSafety).toBe(true)
      expect(config.healthcareCompliance.professionalStandards).toBe(true)
      expect(config.healthcareCompliance.ethicalCompliance).toBe(true)
    })
  })
})