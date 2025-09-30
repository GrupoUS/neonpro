/**
 * Package Manager Config Model Tests
 *
 * This test suite validates the PackageManagerConfig model functionality
 * for the NeonPro platform, specifically testing Bun optimization
 * and healthcare compliance features.
 */

import { describe, it, expect, beforeEach } from 'bun:test'
import {
  PackageManagerConfigSchema,
  createPackageManagerConfig,
  updatePackageManagerConfig,
  validatePackageManagerConfig,
  isValidPackageManagerConfig,
  validateHealthcareCompliance,
  validatePerformanceTargets,
  getBunOptimizations,
  isBunOptimized,
  getPerformanceMetrics,
  getSecurityConfiguration,
  DEFAULT_PACKAGE_MANAGER_CONFIG
} from '../package-manager-config'

describe('PackageManagerConfig Model', () => {
  let validConfig: any

  beforeEach(() => {
    validConfig = createPackageManagerConfig()
  })

  describe('Schema Validation', () => {
    it('should validate a correct configuration', () => {
      expect(() => PackageManagerConfigSchema.parse(validConfig)).not.toThrow()
    })

    it('should reject invalid configuration', () => {
      const invalidConfig = {
        ...validConfig,
        package_manager: {
          primary: 'invalid',
          version: '1.0.0'
        }
      }

      expect(() => PackageManagerConfigSchema.parse(invalidConfig)).toThrow()
    })

    it('should require required fields', () => {
      const incompleteConfig = {
        name: 'Test Config',
        version: '1.0.0'
      }

      expect(() => PackageManagerConfigSchema.parse(incompleteConfig)).toThrow()
    })
  })

  describe('Configuration Creation', () => {
    it('should create a valid default configuration', () => {
      const config = createPackageManagerConfig()

      expect(config.id).toBeDefined()
      expect(config.name).toBe('NeonPro Package Manager')
      expect(config.version).toBe('1.0.0')
      expect(config.package_manager.primary).toBe('bun')
      expect(config.build_performance.enabled).toBe(true)
    })

    it('should accept configuration overrides', () => {
      const overrides = {
        name: 'Custom Config',
        version: '2.0.0',
        package_manager: {
          primary: 'pnpm' as const,
          version: '8.0.0',
          lock_file: 'pnpm-lock.yaml' as const,
          registry: 'https://registry.npmjs.org/'
        }
      }

      const config = createPackageManagerConfig(overrides)

      expect(config.name).toBe('Custom Config')
      expect(config.version).toBe('2.0.0')
      expect(config.package_manager.primary).toBe('pnpm')
      expect(config.package_manager.version).toBe('8.0.0')
    })

    it('should generate unique IDs', () => {
      const config1 = createPackageManagerConfig()
      const config2 = createPackageManagerConfig()

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

      const updatedConfig = updatePackageManagerConfig(validConfig, updates)

      expect(updatedConfig.name).toBe('Updated Config')
      expect(updatedConfig.version).toBe('2.0.0')
      expect(updatedConfig.id).toBe(validConfig.id) // Should remain unchanged
      expect(updatedConfig.metadata.updated_at).not.toBe(validConfig.metadata.updated_at)
    })

    it('should validate updates', () => {
      const invalidUpdates = {
        package_manager: {
          primary: 'invalid' as any
        }
      }

      expect(() => updatePackageManagerConfig(validConfig, invalidUpdates)).toThrow()
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
              data_retention: 1000 // Less than 7 years
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

    it('should reject excessive build time target', () => {
      const invalidConfig = {
        ...validConfig,
        build_performance: {
          ...validConfig.build_performance,
          target_build_time: 700 // More than 10 minutes
        }
      }

      expect(validatePerformanceTargets(invalidConfig)).toBe(false)
    })

    it('should reject invalid parallel jobs', () => {
      const invalidConfig = {
        ...validConfig,
        build_performance: {
          ...validConfig.build_performance,
          parallel_jobs: 0
        }
      }

      expect(validatePerformanceTargets(invalidConfig)).toBe(false)
    })

    it('should reject insufficient memory', () => {
      const invalidConfig = {
        ...validConfig,
        build_performance: {
          ...validConfig.build_performance,
          max_memory_usage: 64 // Less than 128MB
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
      const nonBunConfig = createPackageManagerConfig({
        package_manager: {
          primary: 'pnpm' as const,
          version: '8.0.0',
          lock_file: 'pnpm-lock.yaml' as const,
          registry: 'https://registry.npmjs.org/'
        }
      })

      expect(isBunOptimized(nonBunConfig)).toBe(false)
    })

    it('should return correct Bun optimizations', () => {
      const optimizations = getBunOptimizations(validConfig)

      expect(optimizations).toContain('native_installer')
      expect(optimizations).toContain('fast_module_resolution')
      expect(optimizations).toContain('efficient_lockfile')
      expect(optimizations).toContain('parallel_downloads')
      expect(optimizations).toContain('smart_caching')
      expect(optimizations).toContain('incremental_installs')
    })

    it('should return limited optimizations for disabled performance', () => {
      const disabledConfig = createPackageManagerConfig({
        build_performance: {
          enabled: false,
          parallel_jobs: 4,
          cache_strategy: 'hybrid' as const,
          cache_ttl: 3600,
          incremental_builds: true,
          target_build_time: 30,
          max_memory_usage: 2048,
          optimization_level: 'standard' as const
        }
      })

      const optimizations = getBunOptimizations(disabledConfig)

      expect(optimizations).toContain('native_installer')
      expect(optimizations).toContain('fast_module_resolution')
      expect(optimizations).toContain('efficient_lockfile')
      expect(optimizations).not.toContain('parallel_downloads')
      expect(optimizations).not.toContain('smart_caching')
      expect(optimizations).not.toContain('incremental_installs')
    })
  })

  describe('Performance Metrics', () => {
    it('should return correct performance metrics', () => {
      const metrics = getPerformanceMetrics(validConfig)

      expect(metrics.expected_install_time).toBe(30)
      expect(metrics.max_memory_usage).toBe(2048)
      expect(metrics.parallel_jobs).toBe(4)
      expect(metrics.cache_hit_rate_target).toBe(0.9)
      expect(metrics.optimization_enabled).toBe(true)
    })
  })

  describe('Security Configuration', () => {
    it('should return correct security configuration', () => {
      const security = getSecurityConfiguration(validConfig)

      expect(security.scan_on_install).toBe(true)
      expect(security.audit_frequency).toBe('weekly')
      expect(security.vulnerability_threshold).toBe('moderate')
      expect(security.checksum_verification).toBe(true)
      expect(security.enabled_features).toContain('vulnerability_scanning')
      expect(security.enabled_features).toContain('license_checking')
      expect(security.enabled_features).toContain('outdated_checking')
    })
  })

  describe('Cache Configuration', () => {
    it('should have valid cache configuration', () => {
      expect(validConfig.cache.enabled).toBe(true)
      expect(validConfig.cache.strategy).toBe('local')
      expect(validConfig.cache.compression).toBe(true)
      expect(validConfig.cache.max_size).toBeGreaterThan(0)
    })

    it('should validate cache size limits', () => {
      const invalidConfig = {
        ...validConfig,
        cache: {
          ...validConfig.cache,
          max_size: -1
        }
      }

      expect(() => PackageManagerConfigSchema.parse(invalidConfig)).toThrow()
    })
  })

  describe('Monitoring Configuration', () => {
    it('should have comprehensive monitoring', () => {
      expect(validConfig.monitoring.enabled).toBe(true)
      expect(validConfig.monitoring.metrics).toContain('install_time')
      expect(validConfig.monitoring.metrics).toContain('build_time')
      expect(validConfig.monitoring.metrics).toContain('cache_hit_rate')
      expect(validConfig.monitoring.sampling_rate).toBeGreaterThan(0)
      expect(validConfig.monitoring.sampling_rate).toBeLessThanOrEqual(1)
    })

    it('should have alert thresholds configured', () => {
      expect(validConfig.monitoring.alert_thresholds.install_time).toBe(60)
      expect(validConfig.monitoring.alert_thresholds.build_time).toBe(120)
      expect(validConfig.monitoring.alert_thresholds.memory_usage).toBe(4096)
      expect(validConfig.monitoring.alert_thresholds.vulnerability_count).toBe(5)
    })
  })

  describe('Dependency Management', () => {
    it('should have proper dependency configuration', () => {
      expect(validConfig.dependencies.vulnerability_scanning).toBe(true)
      expect(validConfig.dependencies.license_checking).toBe(true)
      expect(validConfig.dependencies.deduplication).toBe(true)
      expect(validConfig.dependencies.peer_dependency_resolution).toBe('auto')
    })
  })

  describe('Metadata', () => {
    it('should have proper timestamps', () => {
      expect(validConfig.metadata.created_at).toBeDefined()
      expect(validConfig.metadata.updated_at).toBeDefined()
      expect(validConfig.metadata.created_by).toBe('system')
      expect(validConfig.metadata.tags).toContain('bun')
    })

    it('should update timestamps on modification', () => {
      // Add a small delay to ensure different timestamps
      setTimeout(() => {}, 1)

      const updatedConfig = updatePackageManagerConfig(validConfig, {
        name: 'Updated'
      })

      expect(updatedConfig.metadata.updated_at).not.toBe(validConfig.metadata.updated_at)
      expect(updatedConfig.metadata.created_at).toBe(validConfig.metadata.created_at)
    })
  })

  describe('Default Configuration', () => {
    it('should have valid default values', () => {
      expect(DEFAULT_PACKAGE_MANAGER_CONFIG.package_manager?.primary).toBe('bun')
      expect(DEFAULT_PACKAGE_MANAGER_CONFIG.build_performance?.enabled).toBe(true)
      expect(DEFAULT_PACKAGE_MANAGER_CONFIG.healthcare?.compliance?.lgpd?.enabled).toBe(true)
      expect(DEFAULT_PACKAGE_MANAGER_CONFIG.security?.scan_on_install).toBe(true)
      expect(DEFAULT_PACKAGE_MANAGER_CONFIG.cache?.enabled).toBe(true)
      expect(DEFAULT_PACKAGE_MANAGER_CONFIG.monitoring?.enabled).toBe(true)
    })
  })

  describe('Utility Functions', () => {
    it('should validate configuration correctly', () => {
      expect(() => validatePackageManagerConfig(validConfig)).not.toThrow()
    })

    it('should check configuration validity', () => {
      expect(isValidPackageManagerConfig(validConfig)).toBe(true)
      expect(isValidPackageManagerConfig({ invalid: 'config' })).toBe(false)
    })
  })
})
