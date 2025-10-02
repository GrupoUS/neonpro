/**
 * Architecture Config Model Tests
 *
 * Tests for the ArchitectureConfig model to ensure:
 * - Proper validation
 * - Bun compatibility
 * - Healthcare compliance
 * - Performance targets
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  ArchitectureConfigSchema,
  createArchitectureConfig,
  updateArchitectureConfig,
  validateArchitectureConfig,
  isValidArchitectureConfig,
  validateHealthcareCompliance,
  validatePerformanceTargets,
  getBunOptimizations,
  isBunOptimized,
  DEFAULT_ARCHITECTURE_CONFIG,
  type ArchitectureConfig
} from '../architecture-config'

describe('ArchitectureConfig Model', () => {
  let validConfig: ArchitectureConfig

  beforeEach(() => {
    validConfig = createArchitectureConfig()
  })

  describe('Schema Validation', () => {
    it('should validate a correct configuration', () => {
      expect(() => validateArchitectureConfig(validConfig)).not.toThrow()
      expect(isValidArchitectureConfig(validConfig)).toBe(true)
    })

    it('should reject invalid configuration', () => {
      const invalidConfig = {
        ...validConfig,
        runtime: {
          ...validConfig.runtime,
          primary: 'invalid' as any
        }
      }

      expect(() => validateArchitectureConfig(invalidConfig)).toThrow()
      expect(isValidArchitectureConfig(invalidConfig)).toBe(false)
    })

    it('should require required fields', () => {
      const incompleteConfig = {
        name: 'Test Config'
        // Missing required fields
      }

      expect(() => validateArchitectureConfig(incompleteConfig)).toThrow()
    })
  })

  describe('Configuration Creation', () => {
    it('should create a valid default configuration', () => {
      const config = createArchitectureConfig()

      expect(config.id).toBeDefined()
      expect(config.name).toBe('NeonPro Architecture')
      expect(config.runtime.primary).toBe('bun')
      expect(config.environment).toBe('development')
      expect(config.healthcare.compliance.lgpd.enabled).toBe(true)
      expect(config.healthcare.compliance.anvisa.enabled).toBe(true)
      expect(config.healthcare.compliance.cfm.enabled).toBe(true)
    })

    it('should accept configuration overrides', () => {
      const overrides = {
        name: 'Custom Config',
        environment: 'production' as const,
        runtime: {
          primary: 'node' as const,
          optimization: {
            enabled: false,
            level: 'basic' as const,
            features: []
          },
          compatibility: {
            node_modules: true,
            native_modules: false,
            web_api: true,
            esm: true
          }
        }
      }

      const config = createArchitectureConfig(overrides)

      expect(config.name).toBe('Custom Config')
      expect(config.environment).toBe('production')
      expect(config.runtime.primary).toBe('node')
      expect(config.runtime.optimization.enabled).toBe(false)
    })

    it('should generate unique IDs', () => {
      const config1 = createArchitectureConfig()
      const config2 = createArchitectureConfig()

      expect(config1.id).not.toBe(config2.id)
    })
  })

  describe('Configuration Updates', () => {
    it('should update configuration correctly', () => {
      const updates = {
        name: 'Updated Config',
        version: '2.0.0'
      }

      // Add a small delay to ensure different timestamps
      setTimeout(() => {}, 1)

      const updatedConfig = updateArchitectureConfig(validConfig, updates)

      expect(updatedConfig.name).toBe('Updated Config')
      expect(updatedConfig.version).toBe('2.0.0')
      expect(updatedConfig.id).toBe(validConfig.id) // Should remain unchanged
      expect(updatedConfig.metadata.updated_at).not.toBe(validConfig.metadata.updated_at)
    })

    it('should validate updates', () => {
      const invalidUpdates = {
        runtime: {
          primary: 'invalid' as any
        }
      }

      expect(() => updateArchitectureConfig(validConfig, invalidUpdates)).toThrow()
    })
  })

  describe('Healthcare Compliance Validation', () => {
    it('should validate compliant configuration', () => {
      expect(validateHealthcareCompliance(validConfig)).toBe(true)
    })

    it('should reject non-LGPD compliant configuration', () => {
      const nonCompliantConfig = {
        ...validConfig,
        healthcare: {
          ...validConfig.healthcare,
          compliance: {
            ...validConfig.healthcare.compliance,
            lgpd: {
              ...validConfig.healthcare.compliance.lgpd,
              enabled: false
            }
          }
        }
      }

      expect(validateHealthcareCompliance(nonCompliantConfig)).toBe(false)
    })

    it('should reject non-Brazil data residency', () => {
      const nonCompliantConfig = {
        ...validConfig,
        healthcare: {
          ...validConfig.healthcare,
          data_residency: {
            ...validConfig.healthcare.data_residency,
            country: 'United States'
          }
        }
      }

      expect(validateHealthcareCompliance(nonCompliantConfig)).toBe(false)
    })

    it('should reject insufficient retention period', () => {
      const nonCompliantConfig = {
        ...validConfig,
        healthcare: {
          ...validConfig.healthcare,
          compliance: {
            ...validConfig.healthcare.compliance,
            lgpd: {
              ...validConfig.healthcare.compliance.lgpd,
              retention_period: 1000 // Less than 7 years
            }
          }
        }
      }

      expect(validateHealthcareCompliance(nonCompliantConfig)).toBe(false)
    })
  })

  describe('Performance Validation', () => {
    it('should validate reasonable performance targets', () => {
      expect(validatePerformanceTargets(validConfig)).toBe(true)
    })

    it('should reject excessive build speed improvement', () => {
      const invalidConfig = {
        ...validConfig,
        performance: {
          ...validConfig.performance,
          targets: {
            ...validConfig.performance.targets,
            build_speed_improvement: 15.0 // Too high
          }
        }
      }

      expect(validatePerformanceTargets(invalidConfig)).toBe(false)
    })

    it('should reject negative memory reduction', () => {
      const invalidConfig = {
        ...validConfig,
        performance: {
          ...validConfig.performance,
          targets: {
            ...validConfig.performance.targets,
            memory_usage_reduction: -0.1 // Negative
          }
        }
      }

      expect(validatePerformanceTargets(invalidConfig)).toBe(false)
    })
  })

  describe('Bun Optimization', () => {
    it('should identify Bun-optimized configuration', () => {
      expect(isBunOptimized(validConfig)).toBe(true)
    })

    it('should identify non-Bun configuration', () => {
      const nodeConfig = createArchitectureConfig({
        runtime: {
          primary: 'node',
          optimization: {
            enabled: true,
            level: 'standard',
            features: []
          },
          compatibility: {
            node_modules: true,
            native_modules: false,
            web_api: true,
            esm: true
          }
        }
      })

      expect(isBunOptimized(nodeConfig)).toBe(false)
    })

    it('should return correct Bun optimizations', () => {
      const optimizations = getBunOptimizations(validConfig)

      expect(optimizations).toContain('native_bundling')
      expect(optimizations).toContain('file_system_cache')
      expect(optimizations).toContain('module_resolution')
      expect(optimizations).toContain('typescript_transpilation')
      expect(optimizations).toContain('minification')
      expect(optimizations).toContain('tree_shaking')
    })

    it('should return limited optimizations for disabled optimization', () => {
      const configNoOptimization = createArchitectureConfig({
        runtime: {
          primary: 'bun',
          optimization: {
            enabled: false,
            level: 'basic',
            features: []
          },
          compatibility: {
            node_modules: true,
            native_modules: false,
            web_api: true,
            esm: true
          }
        }
      })

      const optimizations = getBunOptimizations(configNoOptimization)

      expect(optimizations).toContain('native_bundling')
      expect(optimizations).toContain('file_system_cache')
      expect(optimizations).toContain('module_resolution')
      expect(optimizations).not.toContain('typescript_transpilation')
      expect(optimizations).not.toContain('minification')
      expect(optimizations).not.toContain('tree_shaking')
    })
  })

  describe('Edge Configuration', () => {
    it('should have valid edge configuration', () => {
      expect(validConfig.edge.enabled).toBe(true)
      expect(validConfig.edge.provider).toBeDefined()
      expect(validConfig.edge.regions).toHaveLength(3)
      expect(validConfig.edge.configuration.runtime).toBe('bun')
      expect(validConfig.edge.performance.ttfb_target).toBe(100)
    })

    it('should validate edge performance targets', () => {
      expect(validConfig.edge.performance.ttfb_target).toBeLessThan(200)
      expect(validConfig.edge.performance.cold_start_target).toBeLessThan(1000)
      expect(validConfig.edge.performance.warm_start_target).toBeLessThan(100)
    })
  })

  describe('Security Configuration', () => {
    it('should have strong encryption settings', () => {
      expect(validConfig.security.encryption.algorithm).toBe('AES-256-GCM')
      expect(validConfig.security.encryption.key_length).toBeGreaterThanOrEqual(256)
      expect(validConfig.security.encryption.rotation_interval).toBeGreaterThan(0)
    })

    it('should have proper access control', () => {
      expect(validConfig.security.access_control.authentication).toBe(true)
      expect(validConfig.security.access_control.authorization).toBe(true)
      expect(validConfig.security.access_control.multi_factor).toBe(true)
      expect(validConfig.security.access_control.session_timeout).toBeGreaterThan(0)
    })

    it('should have comprehensive audit logging', () => {
      expect(validConfig.security.audit.enabled).toBe(true)
      expect(validConfig.security.audit.retention_days).toBeGreaterThanOrEqual(2555) // 7 years minimum
      expect(validConfig.security.audit.events).toContain('authentication')
      expect(validConfig.security.audit.events).toContain('data_access')
      expect(validConfig.security.audit.events).toContain('data_modification')
    })
  })

  describe('Build Configuration', () => {
    it('should use Bun toolchain by default', () => {
      expect(validConfig.build.toolchain.bundler).toBe('bun')
      expect(validConfig.build.toolchain.transpiler).toBe('bun')
      expect(validConfig.build.toolchain.minifier).toBe('bun')
      expect(validConfig.build.toolchain.optimizer).toBe('bun')
    })

    it('should have all optimizations enabled', () => {
      expect(validConfig.build.optimization.code_splitting).toBe(true)
      expect(validConfig.build.optimization.tree_shaking).toBe(true)
      expect(validConfig.build.optimization.dead_code_elimination).toBe(true)
      expect(validConfig.build.optimization.minification).toBe(true)
      expect(validConfig.build.optimization.compression).toBe(true)
    })

    it('should target modern browsers and Bun', () => {
      expect(validConfig.build.targets.browsers).toBeDefined()
      expect(validConfig.build.targets.bun_version).toBe('>=1.1.0')
      expect(validConfig.build.targets.es_version).toBe('ES2022')
    })
  })

  describe('Metadata', () => {
    it('should have proper timestamps', () => {
      expect(validConfig.metadata.created_at).toBeDefined()
      expect(validConfig.metadata.updated_at).toBeDefined()
      expect(validConfig.metadata.created_by).toBe('system')
    })

    it('should update timestamps on modification', () => {
      // Add a small delay to ensure different timestamps
      setTimeout(() => {}, 1)

      const updatedConfig = updateArchitectureConfig(validConfig, {
        name: 'Updated'
      })

      expect(updatedConfig.metadata.updated_at).not.toBe(validConfig.metadata.updated_at)
      expect(updatedConfig.metadata.created_at).toBe(validConfig.metadata.created_at)
    })
  })
})
