/**
 * Unit Tests for Architecture Models
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { describe, it, expect, beforeEach } from 'bun:test'
import {
  ArchitectureConfig,
  ArchitectureConfigSchema,
  defaultArchitectureConfig,
  validateArchitectureConfig,
  validateHealthcareCompliance,
  validatePerformanceTargets,
  createArchitectureConfig,
  updateArchitectureConfig,
  getArchitectureConfig,
  deleteArchitectureConfig,
} from '@neonpro/database'

describe('ArchitectureConfig Model', () => {
  let validConfig: any

  beforeEach(() => {
    validConfig = {
      name: 'Test Architecture Configuration',
      environment: 'development',
      edgeEnabled: true,
      supabaseFunctionsEnabled: true,
      bunEnabled: true,
      performanceMetrics: {
        edgeTTFB: 100,
        realtimeUIPatch: 1500,
        copilotToolRoundtrip: 2000,
        buildTime: 30000,
        bundleSize: {
          main: 100000,
          vendor: 200000,
          total: 300000,
        },
        uptime: 99.9,
        timestamp: new Date(),
      },
      complianceStatus: {
        lgpd: {
          compliant: true,
          lastAudit: new Date(),
          nextAudit: new Date(),
          issues: [],
        },
        anvisa: {
          compliant: true,
          lastAudit: new Date(),
          nextAudit: new Date(),
          issues: [],
        },
        cfm: {
          compliant: true,
          lastAudit: new Date(),
          nextAudit: new Date(),
          issues: [],
        },
        wcag: {
          level: '2.1 AA+',
          compliant: true,
          lastAudit: new Date(),
          issues: [],
        },
        timestamp: new Date(),
      },
    }
  })

  describe('ArchitectureConfigSchema', () => {
    it('should validate a valid configuration', () => {
      const result = ArchitectureConfigSchema.safeParse(validConfig)
      expect(result.success).toBe(true)
    })

    it('should reject invalid environment', () => {
      const invalidConfig = {
        ...validConfig,
        environment: 'invalid',
      }
      const result = ArchitectureConfigSchema.safeParse(invalidConfig)
      expect(result.success).toBe(false)
    })

    it('should reject invalid WCAG level', () => {
      const invalidConfig = {
        ...validConfig,
        complianceStatus: {
          ...validConfig.complianceStatus,
          wcag: {
            level: 'invalid',
            compliant: true,
            lastAudit: new Date(),
            issues: [],
          },
        },
      }
      const result = ArchitectureConfigSchema.safeParse(invalidConfig)
      expect(result.success).toBe(false)
    })

    it('should reject missing required fields', () => {
      const invalidConfig = {
        name: 'Test Architecture Configuration',
        // Missing required fields
      }
      const result = ArchitectureConfigSchema.safeParse(invalidConfig)
      expect(result.success).toBe(false)
    })
  })

  describe('validateArchitectureConfig', () => {
    it('should validate a valid configuration', () => {
      const result = validateArchitectureConfig(validConfig)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid configuration', () => {
      const invalidConfig = {
        ...validConfig,
        environment: 'invalid',
      }
      const result = validateArchitectureConfig(invalidConfig)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('validateHealthcareCompliance', () => {
    it('should validate compliant healthcare configuration', () => {
      const result = validateHealthcareCompliance(validConfig)
      expect(result.isValid).toBe(true)
      expect(result.frameworks.lgpd.compliant).toBe(true)
      expect(result.frameworks.anvisa.compliant).toBe(true)
      expect(result.frameworks.cfm.compliant).toBe(true)
      expect(result.frameworks.wcag.compliant).toBe(true)
    })

    it('should reject non-compliant healthcare configuration', () => {
      const nonCompliantConfig = {
        ...validConfig,
        complianceStatus: {
          lgpd: {
            compliant: false,
            lastAudit: new Date(),
            nextAudit: new Date(),
            issues: ['Missing audit trail'],
          },
          anvisa: {
            compliant: false,
            lastAudit: new Date(),
            nextAudit: new Date(),
            issues: ['Missing documentation'],
          },
          cfm: {
            compliant: false,
            lastAudit: new Date(),
            nextAudit: new Date(),
            issues: ['Missing risk assessment'],
          },
          wcag: {
            level: '2.1 AA+',
            compliant: false,
            lastAudit: new Date(),
            issues: ['Missing accessibility features'],
          },
          timestamp: new Date(),
        },
      }
      const result = validateHealthcareCompliance(nonCompliantConfig)
      expect(result.isValid).toBe(false)
      expect(result.frameworks.lgpd.compliant).toBe(false)
      expect(result.frameworks.anvisa.compliant).toBe(false)
      expect(result.frameworks.cfm.compliant).toBe(false)
      expect(result.frameworks.wcag.compliant).toBe(false)
    })
  })

  describe('validatePerformanceTargets', () => {
    it('should validate configuration meeting performance targets', () => {
      const result = validatePerformanceTargets(validConfig)
      expect(result.isValid).toBe(true)
      expect(result.targets.edgeTTFB.isValid).toBe(true)
      expect(result.targets.realtimeUIPatch.isValid).toBe(true)
      expect(result.targets.copilotToolRoundtrip.isValid).toBe(true)
      expect(result.targets.buildTime.isValid).toBe(true)
      expect(result.targets.bundleSize.isValid).toBe(true)
      expect(result.targets.uptime.isValid).toBe(true)
    })

    it('should reject configuration not meeting performance targets', () => {
      const lowPerformanceConfig = {
        ...validConfig,
        performanceMetrics: {
          edgeTTFB: 200, // Above target of 150ms
          realtimeUIPatch: 2000, // Above target of 1500ms
          copilotToolRoundtrip: 3000, // Above target of 2000ms
          buildTime: 60000, // Above target of 30000ms
          bundleSize: {
            main: 200000, // Above target of 100000 bytes
            vendor: 400000, // Above target of 200000 bytes
            total: 600000, // Above target of 300000 bytes
          },
          uptime: 95, // Below target of 99.9%
          timestamp: new Date(),
        },
      }
      const result = validatePerformanceTargets(lowPerformanceConfig)
      expect(result.isValid).toBe(false)
      expect(result.targets.edgeTTFB.isValid).toBe(false)
      expect(result.targets.realtimeUIPatch.isValid).toBe(false)
      expect(result.targets.copilotToolRoundtrip.isValid).toBe(false)
      expect(result.targets.buildTime.isValid).toBe(false)
      expect(result.targets.bundleSize.isValid).toBe(false)
      expect(result.targets.uptime.isValid).toBe(false)
    })
  })

  describe('defaultArchitectureConfig', () => {
    it('should return a valid default configuration', () => {
      const result = defaultArchitectureConfig('development')
      expect(result.name).toBe('NeonPro Architecture Configuration')
      expect(result.environment).toBe('development')
      expect(result.edgeEnabled).toBe(true)
      expect(result.supabaseFunctionsEnabled).toBe(true)
      expect(result.bunEnabled).toBe(true)
      expect(result.performanceMetrics).toBeDefined()
      expect(result.complianceStatus).toBeDefined()
    })

    it('should return a valid configuration for staging environment', () => {
      const result = defaultArchitectureConfig('staging')
      expect(result.environment).toBe('staging')
    })

    it('should return a valid configuration for production environment', () => {
      const result = defaultArchitectureConfig('production')
      expect(result.environment).toBe('production')
    })
  })

  describe('createArchitectureConfig', () => {
    it('should create a new architecture configuration', async () => {
      const result = await createArchitectureConfig(validConfig)
      expect(result.id).toBeDefined()
      expect(result.name).toBe(validConfig.name)
      expect(result.environment).toBe(validConfig.environment)
      expect(result.edgeEnabled).toBe(validConfig.edgeEnabled)
      expect(result.supabaseFunctionsEnabled).toBe(validConfig.supabaseFunctionsEnabled)
      expect(result.bunEnabled).toBe(validConfig.bunEnabled)
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
    })

    it('should throw an error if configuration already exists for the environment', async () => {
      // First creation should succeed
      await createArchitectureConfig(validConfig)

      // Second creation should fail
      try {
        await createArchitectureConfig(validConfig)
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.code).toBe('CONFLICT')
        expect(error.message).toContain('already exists')
      }
    })
  })

  describe('getArchitectureConfig', () => {
    it('should get an architecture configuration by environment', async () => {
      // Create a configuration
      await createArchitectureConfig(validConfig)

      // Get the configuration
      const result = await getArchitectureConfig('development')
      expect(result).toBeDefined()
      expect(result.name).toBe(validConfig.name)
      expect(result.environment).toBe(validConfig.environment)
    })

    it('should return null if configuration does not exist', async () => {
      const result = await getArchitectureConfig('non-existent')
      expect(result).toBeNull()
    })
  })

  describe('updateArchitectureConfig', () => {
    it('should update an existing architecture configuration', async () => {
      // Create a configuration
      const createdConfig = await createArchitectureConfig(validConfig)

      // Update the configuration
      const update = {
        name: 'Updated Architecture Configuration',
        edgeEnabled: false,
        performanceMetrics: {
          edgeTTFB: 80,
          realtimeUIPatch: 1200,
          copilotToolRoundtrip: 1500,
          buildTime: 25000,
          bundleSize: {
            main: 90000,
            vendor: 180000,
            total: 270000,
          },
          uptime: 99.95,
          timestamp: new Date(),
        },
      }

      const result = await updateArchitectureConfig(createdConfig.id, update)
      expect(result.id).toBe(createdConfig.id)
      expect(result.name).toBe(update.name)
      expect(result.edgeEnabled).toBe(update.edgeEnabled)
      expect(result.performanceMetrics.edgeTTFB).toBe(update.performanceMetrics.edgeTTFB)
      expect(result.updatedAt).not.toBe(createdConfig.updatedAt)
    })

    it('should throw an error if configuration does not exist', async () => {
      const update = {
        name: 'Updated Architecture Configuration',
      }

      try {
        await updateArchitectureConfig('non-existent-id', update)
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND')
        expect(error.message).toContain('not found')
      }
    })
  })

  describe('deleteArchitectureConfig', () => {
    it('should delete an existing architecture configuration', async () => {
      // Create a configuration
      const createdConfig = await createArchitectureConfig(validConfig)

      // Delete the configuration
      const result = await deleteArchitectureConfig(createdConfig.id)
      expect(result).toBe(true)

      // Verify the configuration is deleted
      const deletedConfig = await getArchitectureConfig('development')
      expect(deletedConfig).toBeNull()
    })

    it('should return false if configuration does not exist', async () => {
      const result = await deleteArchitectureConfig('non-existent-id')
      expect(result).toBe(false)
    })
  })
})
