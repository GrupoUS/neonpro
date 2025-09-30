/**
 * Architecture Config Model
 *
 * This model defines the architecture configuration for the NeonPro platform,
 * specifically optimized for Bun runtime compatibility and healthcare compliance.
 *
 * Key features:
 * - Bun runtime optimization
 * - Healthcare compliance (LGPD/ANVISA/CFM)
 * - Performance monitoring
 * - Security configuration
 * - Edge runtime support
 */

import { z } from 'zod'

// Base architecture configuration schema
export const ArchitectureConfigSchema = z.object({
  // Basic configuration
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  version: z.string().min(1),
  environment: z.enum(['development', 'staging', 'production']),

  // Runtime configuration
  runtime: z.object({
    primary: z.enum(['bun', 'node']),
    fallback: z.enum(['bun', 'node']).optional(),
    optimization: z.object({
      enabled: z.boolean(),
      level: z.enum(['basic', 'standard', 'aggressive']),
      features: z.array(z.enum([
        'native_bundling',
        'file_system_cache',
        'module_resolution',
        'typescript_transpilation',
        'minification',
        'tree_shaking'
      ]))
    }),
    compatibility: z.object({
      node_modules: z.boolean(),
      native_modules: z.boolean(),
      web_api: z.boolean(),
      esm: z.boolean()
    })
  }),

  // Performance configuration
  performance: z.object({
    targets: z.object({
      build_speed_improvement: z.number().min(1).max(10),
      memory_usage_reduction: z.number().min(0).max(1),
      bundle_size_reduction: z.number().min(0).max(1),
      startup_time_improvement: z.number().min(0).max(1)
    }),
    monitoring: z.object({
      enabled: z.boolean(),
      metrics: z.array(z.enum([
        'build_time',
        'memory_usage',
        'cpu_usage',
        'bundle_size',
        'startup_time',
        'response_time'
      ])),
      sampling_rate: z.number().min(0).max(1)
    }),
    caching: z.object({
      enabled: z.boolean(),
      strategy: z.enum(['memory', 'disk', 'hybrid']),
      ttl: z.number().min(0), // seconds
      max_size: z.number().min(0) // bytes
    })
  }),

  // Security configuration
  security: z.object({
    encryption: z.object({
      algorithm: z.string(),
      key_length: z.number().min(128),
      rotation_interval: z.number().min(0) // hours
    }),
    access_control: z.object({
      authentication: z.boolean(),
      authorization: z.boolean(),
      multi_factor: z.boolean(),
      session_timeout: z.number().min(0) // seconds
    }),
    audit: z.object({
      enabled: z.boolean(),
      retention_days: z.number().min(0),
      log_level: z.enum(['debug', 'info', 'warn', 'error']),
      events: z.array(z.enum([
        'authentication',
        'authorization',
        'data_access',
        'data_modification',
        'system_configuration'
      ]))
    })
  }),

  // Healthcare compliance
  healthcare: z.object({
    compliance: z.object({
      lgpd: z.object({
        enabled: z.boolean(),
        data_processing_basis: z.enum(['consent', 'legal_obligation', 'vital_interests']),
        data_subject_rights: z.array(z.enum([
          'access',
          'rectification',
          'erasure',
          'portability',
          'objection',
          'information'
        ])),
        retention_period: z.number().min(0) // days
      }),
      anvisa: z.object({
        enabled: z.boolean(),
        medical_device_class: z.enum(['I', 'II', 'III', 'IV']),
        quality_management: z.boolean(),
        risk_management: z.boolean(),
        traceability: z.boolean()
      }),
      cfm: z.object({
        enabled: z.boolean(),
        medical_records_confidentiality: z.boolean(),
        professional_conduct: z.boolean(),
        technical_standards: z.boolean(),
        patient_safety: z.boolean()
      })
    }),
    data_residency: z.object({
      country: z.string(),
      region: z.string(),
      datacenter: z.string(),
      provider: z.string(),
      cross_border_transfers: z.boolean()
    }),
    data_protection: z.object({
      encryption_at_rest: z.boolean(),
      encryption_in_transit: z.boolean(),
      backup_encryption: z.boolean(),
      disaster_recovery: z.boolean()
    })
  }),

  // Edge runtime configuration
  edge: z.object({
    enabled: z.boolean(),
    provider: z.enum(['vercel', 'cloudflare', 'aws', 'azure']),
    regions: z.array(z.string()),
    configuration: z.object({
      runtime: z.enum(['bun', 'node', 'deno']),
      memory_limit: z.number().min(0), // MB
      timeout: z.number().min(0), // seconds
      concurrency: z.number().min(1),
      cold_start_optimization: z.boolean()
    }),
    performance: z.object({
      ttfb_target: z.number().min(0), // milliseconds
      cold_start_target: z.number().min(0), // milliseconds
      warm_start_target: z.number().min(0), // milliseconds
      cache_ttl: z.number().min(0) // seconds
    })
  }),

  // Build configuration
  build: z.object({
    toolchain: z.object({
      bundler: z.enum(['bun', 'vite', 'webpack', 'rollup']),
      transpiler: z.enum(['bun', 'typescript', 'swc']),
      minifier: z.enum(['bun', 'terser', 'swc']),
      optimizer: z.enum(['bun', 'vite', 'custom'])
    }),
    optimization: z.object({
      code_splitting: z.boolean(),
      tree_shaking: z.boolean(),
      dead_code_elimination: z.boolean(),
      minification: z.boolean(),
      compression: z.boolean()
    }),
    targets: z.object({
      browsers: z.array(z.string()),
      node_version: z.string().optional(),
      bun_version: z.string().optional(),
      es_version: z.string()
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
export type ArchitectureConfig = z.infer<typeof ArchitectureConfigSchema>

// Default configuration values
export const DEFAULT_ARCHITECTURE_CONFIG: Partial<ArchitectureConfig> = {
  environment: 'development',
  runtime: {
    primary: 'bun',
    fallback: 'node',
    optimization: {
      enabled: true,
      level: 'standard',
      features: [
        'native_bundling',
        'file_system_cache',
        'module_resolution',
        'typescript_transpilation',
        'minification',
        'tree_shaking'
      ]
    },
    compatibility: {
      node_modules: true,
      native_modules: false,
      web_api: true,
      esm: true
    }
  },
  performance: {
    targets: {
      build_speed_improvement: 3.0,
      memory_usage_reduction: 0.2,
      bundle_size_reduction: 0.1,
      startup_time_improvement: 0.3
    },
    monitoring: {
      enabled: true,
      metrics: [
        'build_time',
        'memory_usage',
        'cpu_usage',
        'bundle_size',
        'startup_time',
        'response_time'
      ],
      sampling_rate: 0.1
    },
    caching: {
      enabled: true,
      strategy: 'hybrid',
      ttl: 3600,
      max_size: 1024 * 1024 * 100 // 100MB
    }
  },
  security: {
    encryption: {
      algorithm: 'AES-256-GCM',
      key_length: 256,
      rotation_interval: 8760 // 1 year
    },
    access_control: {
      authentication: true,
      authorization: true,
      multi_factor: true,
      session_timeout: 3600 // 1 hour
    },
    audit: {
      enabled: true,
      retention_days: 2555, // 7 years
      log_level: 'info',
      events: [
        'authentication',
        'authorization',
        'data_access',
        'data_modification',
        'system_configuration'
      ]
    }
  },
  healthcare: {
    compliance: {
      lgpd: {
        enabled: true,
        data_processing_basis: 'consent',
        data_subject_rights: [
          'access',
          'rectification',
          'erasure',
          'portability',
          'objection',
          'information'
        ],
        retention_period: 2555 // 7 years
      },
      anvisa: {
        enabled: true,
        medical_device_class: 'II',
        quality_management: true,
        risk_management: true,
        traceability: true
      },
      cfm: {
        enabled: true,
        medical_records_confidentiality: true,
        professional_conduct: true,
        technical_standards: true,
        patient_safety: true
      }
    },
    data_residency: {
      country: 'Brazil',
      region: 'Southeast',
      datacenter: 'São Paulo',
      provider: 'AWS',
      cross_border_transfers: false
    },
    data_protection: {
      encryption_at_rest: true,
      encryption_in_transit: true,
      backup_encryption: true,
      disaster_recovery: true
    }
  },
  edge: {
    enabled: true,
    provider: 'vercel',
    regions: ['gru1', 'gso1', 'cpt1'],
    configuration: {
      runtime: 'bun',
      memory_limit: 512, // 512MB
      timeout: 30, // 30 seconds
      concurrency: 10,
      cold_start_optimization: true
    },
    performance: {
      ttfb_target: 100, // 100ms
      cold_start_target: 500, // 500ms
      warm_start_target: 50, // 50ms
      cache_ttl: 300 // 5 minutes
    }
  },
  build: {
    toolchain: {
      bundler: 'bun',
      transpiler: 'bun',
      minifier: 'bun',
      optimizer: 'bun'
    },
    optimization: {
      code_splitting: true,
      tree_shaking: true,
      dead_code_elimination: true,
      minification: true,
      compression: true
    },
    targets: {
      browsers: ['>= 1%', 'last 2 versions', 'not dead'],
      bun_version: '>=1.1.0',
      es_version: 'ES2022'
    }
  }
}

// Validation functions
export const validateArchitectureConfig = (config: unknown): ArchitectureConfig => {
  return ArchitectureConfigSchema.parse(config)
}

export const isValidArchitectureConfig = (config: unknown): boolean => {
  return ArchitectureConfigSchema.safeParse(config).success
}

// Utility functions
export const createArchitectureConfig = (overrides: Partial<ArchitectureConfig> = {}): ArchitectureConfig => {
  const now = new Date().toISOString()

  return validateArchitectureConfig({
    id: crypto.randomUUID(),
    name: 'NeonPro Architecture',
    description: 'NeonPro platform architecture configuration optimized for Bun runtime',
    version: '1.0.0',
    environment: 'development',
    ...DEFAULT_ARCHITECTURE_CONFIG,
    ...overrides,
    metadata: {
      created_at: now,
      updated_at: now,
      created_by: 'system',
      tags: ['bun', 'healthcare', 'lgpd', 'anvisa', 'cfm'],
      ...overrides.metadata
    }
  })
}

export const updateArchitectureConfig = (
  config: ArchitectureConfig,
  updates: Partial<ArchitectureConfig>
): ArchitectureConfig => {
  // Ensure we get a fresh timestamp that's always different
  const now = new Date()
  // Add milliseconds to ensure uniqueness if timestamps are the same
  now.setMilliseconds(now.getMilliseconds() + 1)

  return validateArchitectureConfig({
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
export const validateHealthcareCompliance = (config: ArchitectureConfig): boolean => {
  const { healthcare } = config

  // Check LGPD compliance
  if (!healthcare.compliance.lgpd.enabled) return false
  if (!healthcare.data_residency.country.includes('Brazil')) return false
  if (healthcare.compliance.lgpd.retention_period < 2555) return false // 7 years minimum

  // Check ANVISA compliance
  if (!healthcare.compliance.anvisa.enabled) return false
  if (!healthcare.compliance.anvisa.quality_management) return false
  if (!healthcare.compliance.anvisa.traceability) return false

  // Check CFM compliance
  if (!healthcare.compliance.cfm.enabled) return false
  if (!healthcare.compliance.cfm.medical_records_confidentiality) return false
  if (!healthcare.compliance.cfm.patient_safety) return false

  // Check data protection
  if (!healthcare.data_protection.encryption_at_rest) return false
  if (!healthcare.data_protection.encryption_in_transit) return false
  if (!healthcare.data_protection.disaster_recovery) return false

  return true
}

// Performance validation
export const validatePerformanceTargets = (config: ArchitectureConfig): boolean => {
  const { performance } = config

  // Check if targets are reasonable
  if (performance.targets.build_speed_improvement < 1.0) return false
  if (performance.targets.build_speed_improvement > 10.0) return false

  if (performance.targets.memory_usage_reduction < 0) return false
  if (performance.targets.memory_usage_reduction > 1.0) return false

  if (performance.targets.bundle_size_reduction < 0) return false
  if (performance.targets.bundle_size_reduction > 1.0) return false

  return true
}

// Bun-specific optimizations
export const getBunOptimizations = (config: ArchitectureConfig): string[] => {
  const optimizations: string[] = []

  if (config.runtime.primary === 'bun') {
    optimizations.push('native_bundling')
    optimizations.push('file_system_cache')
    optimizations.push('module_resolution')

    if (config.runtime.optimization.enabled) {
      optimizations.push('typescript_transpilation')
      optimizations.push('minification')
      optimizations.push('tree_shaking')
    }
  }

  return optimizations
}

export const isBunOptimized = (config: ArchitectureConfig): boolean => {
  return config.runtime.primary === 'bun' &&
         config.runtime.optimization.enabled &&
         config.build.toolchain.bundler === 'bun'
}
