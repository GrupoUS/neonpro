/**
 * Package Manager Config Model
 *
 * This model defines the package manager configuration for the NeonPro platform,
 * specifically optimized for Bun package manager performance and healthcare compliance.
 *
 * Key features:
 * - Bun package manager optimization
 * - Build performance tracking
 * - Dependency management
 * - Cache optimization
 * - Security scanning
 */

import { z } from 'zod'

// Base package manager configuration schema
export const PackageManagerConfigSchema = z.object({
  // Basic configuration
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  version: z.string().min(1),
  environment: z.enum(['development', 'staging', 'production']),

  // Package manager settings
  package_manager: z.object({
    primary: z.enum(['bun', 'pnpm', 'npm', 'yarn']),
    fallback: z.enum(['bun', 'pnpm', 'npm', 'yarn']).optional(),
    version: z.string().min(1),
    lock_file: z.enum(['bun.lockb', 'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock']),
    registry: z.string().url(),
    scopes: z.array(z.string()).optional()
  }),

  // Build performance configuration
  build_performance: z.object({
    enabled: z.boolean(),
    parallel_jobs: z.number().min(1).max(32),
    cache_strategy: z.enum(['memory', 'disk', 'hybrid', 'disabled']),
    cache_location: z.string().optional(),
    cache_ttl: z.number().min(0), // seconds
    incremental_builds: z.boolean(),
    target_build_time: z.number().min(0), // seconds
    max_memory_usage: z.number().min(0), // MB
    optimization_level: z.enum(['basic', 'standard', 'aggressive'])
  }),

  // Dependency management
  dependencies: z.object({
    auto_update: z.boolean(),
    update_strategy: z.enum(['patch', 'minor', 'major', 'none']),
    vulnerability_scanning: z.boolean(),
    license_checking: z.boolean(),
    outdated_checking: z.boolean(),
    deduplication: z.boolean(),
    peer_dependency_resolution: z.enum(['strict', 'loose', 'auto'])
  }),

  // Security configuration
  security: z.object({
    scan_on_install: z.boolean(),
    audit_frequency: z.enum(['never', 'daily', 'weekly', 'monthly']),
    vulnerability_threshold: z.enum(['low', 'moderate', 'high', 'critical']),
    allowed_licenses: z.array(z.string()).optional(),
    blocked_licenses: z.array(z.string()).optional(),
    checksum_verification: z.boolean()
  }),

  // Cache configuration
  cache: z.object({
    enabled: z.boolean(),
    strategy: z.enum(['local', 'shared', 'distributed']),
    location: z.string(),
    max_size: z.number().min(0), // MB
    compression: z.boolean(),
    encryption: z.boolean(),
    backup: z.boolean(),
    sync_strategy: z.enum(['push', 'pull', 'bidirectional', 'none'])
  }),

  // Performance monitoring
  monitoring: z.object({
    enabled: z.boolean(),
    metrics: z.array(z.enum([
      'install_time',
      'build_time',
      'cache_hit_rate',
      'memory_usage',
      'network_usage',
      'disk_usage',
      'dependency_count',
      'vulnerability_count'
    ])),
    sampling_rate: z.number().min(0).max(1),
    alert_thresholds: z.object({
      install_time: z.number().optional(), // seconds
      build_time: z.number().optional(), // seconds
      memory_usage: z.number().optional(), // MB
      vulnerability_count: z.number().optional()
    })
  }),

  // Healthcare compliance
  healthcare: z.object({
    compliance: z.object({
      lgpd: z.object({
        enabled: z.boolean(),
        data_processing_basis: z.enum(['consent', 'legal_obligation', 'vital_interests']),
        audit_trail: z.boolean(),
        data_retention: z.number().min(0) // days
      }),
      anvisa: z.object({
        enabled: z.boolean(),
        medical_device_class: z.enum(['I', 'II', 'III', 'IV']),
        validation_required: z.boolean(),
        documentation_retention: z.number().min(0) // days
      }),
      cfm: z.object({
        enabled: z.boolean(),
        audit_required: z.boolean(),
        professional_standards: z.boolean(),
        patient_data_protection: z.boolean()
      })
    }),
    data_residency: z.object({
      country: z.string(),
      region: z.string(),
      datacenter: z.string(),
      provider: z.string(),
      cross_border_transfers: z.boolean()
    })
  }),

  // Metadata
  metadata: z.object({
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    created_by: z.string(),
    updated_by: z.string().optional(),
    tags: z.array(z.string()),
    notes: z.string().optional()
  })
})

// Export types
export type PackageManagerConfig = z.infer<typeof PackageManagerConfigSchema>

// Default configuration values
export const DEFAULT_PACKAGE_MANAGER_CONFIG: Partial<PackageManagerConfig> = {
  environment: 'development',
  package_manager: {
    primary: 'bun',
    fallback: 'pnpm',
    version: '>=1.1.0',
    lock_file: 'bun.lockb',
    registry: 'https://registry.npmjs.org/',
    scopes: ['@neonpro']
  },
  build_performance: {
    enabled: true,
    parallel_jobs: 4,
    cache_strategy: 'hybrid',
    cache_ttl: 3600, // 1 hour
    incremental_builds: true,
    target_build_time: 30, // 30 seconds
    max_memory_usage: 2048, // 2GB
    optimization_level: 'standard'
  },
  dependencies: {
    auto_update: false,
    update_strategy: 'patch',
    vulnerability_scanning: true,
    license_checking: true,
    outdated_checking: true,
    deduplication: true,
    peer_dependency_resolution: 'auto'
  },
  security: {
    scan_on_install: true,
    audit_frequency: 'weekly',
    vulnerability_threshold: 'moderate',
    checksum_verification: true
  },
  cache: {
    enabled: true,
    strategy: 'local',
    location: './node_modules/.cache',
    max_size: 1024, // 1GB
    compression: true,
    encryption: false,
    backup: false,
    sync_strategy: 'none'
  },
  monitoring: {
    enabled: true,
    metrics: [
      'install_time',
      'build_time',
      'cache_hit_rate',
      'memory_usage',
      'network_usage',
      'dependency_count',
      'vulnerability_count'
    ],
    sampling_rate: 0.1,
    alert_thresholds: {
      install_time: 60, // 1 minute
      build_time: 120, // 2 minutes
      memory_usage: 4096, // 4GB
      vulnerability_count: 5
    }
  },
  healthcare: {
    compliance: {
      lgpd: {
        enabled: true,
        data_processing_basis: 'consent',
        audit_trail: true,
        data_retention: 2555 // 7 years
      },
      anvisa: {
        enabled: true,
        medical_device_class: 'II',
        validation_required: true,
        documentation_retention: 2555 // 7 years
      },
      cfm: {
        enabled: true,
        audit_required: true,
        professional_standards: true,
        patient_data_protection: true
      }
    },
    data_residency: {
      country: 'Brazil',
      region: 'Southeast',
      datacenter: 'São Paulo',
      provider: 'AWS',
      cross_border_transfers: false
    }
  }
}

// Validation functions
export const validatePackageManagerConfig = (config: unknown): PackageManagerConfig => {
  return PackageManagerConfigSchema.parse(config)
}

export const isValidPackageManagerConfig = (config: unknown): boolean => {
  return PackageManagerConfigSchema.safeParse(config).success
}

// Utility functions
export const createPackageManagerConfig = (overrides: Partial<PackageManagerConfig> = {}): PackageManagerConfig => {
  const now = new Date().toISOString()

  return validatePackageManagerConfig({
    id: crypto.randomUUID(),
    name: 'NeonPro Package Manager',
    description: 'NeonPro platform package manager configuration optimized for Bun',
    version: '1.0.0',
    environment: 'development',
    ...DEFAULT_PACKAGE_MANAGER_CONFIG,
    ...overrides,
    metadata: {
      created_at: now,
      updated_at: now,
      created_by: 'system',
      tags: ['bun', 'package-manager', 'healthcare', 'lgpd', 'anvisa', 'cfm'],
      ...overrides.metadata
    }
  })
}

export const updatePackageManagerConfig = (
  config: PackageManagerConfig,
  updates: Partial<PackageManagerConfig>
): PackageManagerConfig => {
  // Ensure we get a fresh timestamp that's always different
  const now = new Date()
  // Add milliseconds to ensure uniqueness if timestamps are the same
  now.setMilliseconds(now.getMilliseconds() + 1)

  return validatePackageManagerConfig({
    ...config,
    ...updates,
    metadata: {
      ...config.metadata,
      updated_at: now.toISOString(),
      updated_by: updates.metadata?.updated_by || config.metadata.updated_by,
      ...updates.metadata
    }
  })
}

// Healthcare-specific utilities
export const validateHealthcareCompliance = (config: PackageManagerConfig): boolean => {
  const { healthcare } = config

  // Check LGPD compliance
  if (!healthcare.compliance.lgpd.enabled) return false
  if (!healthcare.data_residency.country.includes('Brazil')) return false
  if (healthcare.compliance.lgpd.data_retention < 2555) return false // 7 years minimum

  // Check ANVISA compliance
  if (!healthcare.compliance.anvisa.enabled) return false
  if (!healthcare.compliance.anvisa.validation_required) return false

  // Check CFM compliance
  if (!healthcare.compliance.cfm.enabled) return false
  if (!healthcare.compliance.cfm.audit_required) return false
  if (!healthcare.compliance.cfm.patient_data_protection) return false

  return true
}

// Performance validation
export const validatePerformanceTargets = (config: PackageManagerConfig): boolean => {
  const { build_performance } = config

  // Check if targets are reasonable
  if (build_performance.target_build_time < 0) return false
  if (build_performance.target_build_time > 600) return false // 10 minutes max

  if (build_performance.parallel_jobs < 1) return false
  if (build_performance.parallel_jobs > 32) return false

  if (build_performance.max_memory_usage < 128) return false // 128MB minimum
  if (build_performance.max_memory_usage > 16384) return false // 16GB maximum

  return true
}

// Bun-specific optimizations
export const getBunOptimizations = (config: PackageManagerConfig): string[] => {
  const optimizations: string[] = []

  if (config.package_manager.primary === 'bun') {
    optimizations.push('native_installer')
    optimizations.push('fast_module_resolution')
    optimizations.push('efficient_lockfile')

    if (config.build_performance.enabled) {
      optimizations.push('parallel_downloads')
      optimizations.push('smart_caching')
      optimizations.push('incremental_installs')
    }
  }

  return optimizations
}

export const isBunOptimized = (config: PackageManagerConfig): boolean => {
  return config.package_manager.primary === 'bun' &&
         config.build_performance.enabled &&
         config.cache.strategy !== 'disabled'
}

// Performance metrics
export const getPerformanceMetrics = (config: PackageManagerConfig) => {
  return {
    expected_install_time: config.build_performance.target_build_time,
    max_memory_usage: config.build_performance.max_memory_usage,
    parallel_jobs: config.build_performance.parallel_jobs,
    cache_hit_rate_target: 0.9, // 90% target
    optimization_enabled: config.build_performance.enabled
  }
}

// Security utilities
export const getSecurityConfiguration = (config: PackageManagerConfig) => {
  return {
    scan_on_install: config.security.scan_on_install,
    audit_frequency: config.security.audit_frequency,
    vulnerability_threshold: config.security.vulnerability_threshold,
    checksum_verification: config.security.checksum_verification,
    enabled_features: [
      ...(config.dependencies.vulnerability_scanning ? ['vulnerability_scanning'] : []),
      ...(config.dependencies.license_checking ? ['license_checking'] : []),
      ...(config.dependencies.outdated_checking ? ['outdated_checking'] : [])
    ]
  }
}
