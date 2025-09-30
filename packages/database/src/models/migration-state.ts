/**
 * Migration State Model
 *
 * This model defines the migration state for the NeonPro platform,
 * specifically tracking Bun migration phases with healthcare compliance.
 *
 * Key features:
 * - Phase tracking for migration
 * - Healthcare compliance validation
 * - Rollback capabilities
 * - Progress monitoring
 * - Audit trail
 */

import { z } from 'zod'

// Migration phase enumeration
export const MigrationPhase = z.enum([
  'planning',
  'setup',
  'configuration',
  'migration',
  'validation',
  'rollback',
  'completed',
  'failed'
])

export type MigrationPhaseType = z.infer<typeof MigrationPhase>

// Migration status enumeration
export const MigrationStatus = z.enum([
  'pending',
  'in_progress',
  'completed',
  'failed',
  'rolled_back',
  'paused'
])

export type MigrationStatusType = z.infer<typeof MigrationStatus>

// Base migration state schema
export const MigrationStateSchema = z.object({
  // Basic configuration
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  version: z.string().min(1),
  environment: z.enum(['development', 'staging', 'production']),

  // Migration tracking
  migration: z.object({
    phase: MigrationPhase,
    status: MigrationStatus,
    progress: z.number().min(0).max(100), // percentage
    started_at: z.string().datetime(),
    completed_at: z.string().datetime().optional(),
    estimated_duration: z.number().min(0), // minutes
    actual_duration: z.number().min(0).optional(), // minutes
    retry_count: z.number().min(0).default(0),
    max_retries: z.number().min(0).default(3)
  }),

  // Phase details
  phases: z.array(z.object({
    name: z.string(),
    phase: MigrationPhase,
    status: MigrationStatus,
    started_at: z.string().datetime().optional(),
    completed_at: z.string().datetime().optional(),
    duration: z.number().min(0).optional(), // minutes
    progress: z.number().min(0).max(100),
    tasks_completed: z.number().min(0),
    total_tasks: z.number().min(0),
    errors: z.array(z.string()).default([]),
    warnings: z.array(z.string()).default([])
  })),

  // Rollback configuration
  rollback: z.object({
    enabled: z.boolean(),
    automatic: z.boolean(),
    trigger_conditions: z.array(z.enum([
      'error_rate',
      'performance_degradation',
      'compliance_failure',
      'timeout',
      'manual'
    ])),
    rollback_point: z.string().optional(),
    rollback_data: z.record(z.unknown()).optional(),
    rollback_reason: z.string().optional()
  }),

  // Healthcare compliance
  healthcare: z.object({
    compliance: z.object({
      lgpd: z.object({
        enabled: z.boolean(),
        data_backup: z.boolean(),
        audit_trail: z.boolean(),
        data_integrity: z.boolean(),
        consent_required: z.boolean(),
        data_subject_notification: z.boolean()
      }),
      anvisa: z.object({
        enabled: z.boolean(),
        validation_required: z.boolean(),
        documentation: z.boolean(),
        quality_assurance: z.boolean(),
        risk_assessment: z.boolean()
      }),
      cfm: z.object({
        enabled: z.boolean(),
        medical_records_protection: z.boolean(),
        patient_safety: z.boolean(),
        professional_standards: z.boolean(),
        ethical_compliance: z.boolean()
      })
    }),
    data_protection: z.object({
      encryption_enabled: z.boolean(),
      backup_verified: z.boolean(),
      access_controls: z.boolean(),
      audit_logging: z.boolean(),
      data_classification: z.boolean()
    })
  }),

  // Performance metrics
  performance: z.object({
    baseline_metrics: z.object({
      build_time: z.number().min(0), // seconds
      install_time: z.number().min(0), // seconds
      test_time: z.number().min(0), // seconds
      memory_usage: z.number().min(0), // MB
      cpu_usage: z.number().min(0).max(100), // percentage
      disk_usage: z.number().min(0) // MB
    }),
    current_metrics: z.object({
      build_time: z.number().min(0), // seconds
      install_time: z.number().min(0), // seconds
      test_time: z.number().min(0), // seconds
      memory_usage: z.number().min(0), // MB
      cpu_usage: z.number().min(0).max(100), // percentage
      disk_usage: z.number().min(0) // MB
    }),
    targets: z.object({
      build_time_improvement: z.number().min(0), // percentage
      memory_usage_reduction: z.number().min(0), // percentage
      performance_improvement: z.number().min(0) // percentage
    })
  }),

  // Validation results
  validation: z.object({
    pre_migration: z.object({
      passed: z.boolean(),
      checks: z.array(z.string()),
      failures: z.array(z.string()),
      warnings: z.array(z.string())
    }),
    post_migration: z.object({
      passed: z.boolean().optional(),
      checks: z.array(z.string()).default([]),
      failures: z.array(z.string()).default([]),
      warnings: z.array(z.string()).default([])
    }),
    compliance: z.object({
      passed: z.boolean().optional(),
      lgpd_compliant: z.boolean().optional(),
      anvisa_compliant: z.boolean().optional(),
      cfm_compliant: z.boolean().optional(),
      issues: z.array(z.string()).default([])
    })
  }),

  // Error handling
  errors: z.array(z.object({
    id: z.string(),
    phase: MigrationPhase,
    timestamp: z.string().datetime(),
    error_type: z.string(),
    message: z.string(),
    stack_trace: z.string().optional(),
    context: z.record(z.unknown()).optional(),
    resolved: z.boolean().default(false),
    resolution: z.string().optional()
  })),

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
export type MigrationState = z.infer<typeof MigrationStateSchema>

// Default configuration values
export const DEFAULT_MIGRATION_STATE: Partial<MigrationState> = {
  environment: 'development',
  migration: {
    phase: 'planning',
    status: 'pending',
    progress: 0,
    started_at: new Date().toISOString(),
    estimated_duration: 120, // 2 hours
    retry_count: 0,
    max_retries: 3
  },
  phases: [
    {
      name: 'Planning Phase',
      phase: 'planning',
      status: 'pending',
      progress: 0,
      tasks_completed: 0,
      total_tasks: 5,
      errors: [],
      warnings: []
    },
    {
      name: 'Setup Phase',
      phase: 'setup',
      status: 'pending',
      progress: 0,
      tasks_completed: 0,
      total_tasks: 10,
      errors: [],
      warnings: []
    },
    {
      name: 'Configuration Phase',
      phase: 'configuration',
      status: 'pending',
      progress: 0,
      tasks_completed: 0,
      total_tasks: 15,
      errors: [],
      warnings: []
    },
    {
      name: 'Migration Phase',
      phase: 'migration',
      status: 'pending',
      progress: 0,
      tasks_completed: 0,
      total_tasks: 20,
      errors: [],
      warnings: []
    },
    {
      name: 'Validation Phase',
      phase: 'validation',
      status: 'pending',
      progress: 0,
      tasks_completed: 0,
      total_tasks: 10,
      errors: [],
      warnings: []
    }
  ],
  rollback: {
    enabled: true,
    automatic: false,
    trigger_conditions: ['error_rate', 'compliance_failure', 'timeout']
  },
  healthcare: {
    compliance: {
      lgpd: {
        enabled: true,
        data_backup: true,
        audit_trail: true,
        data_integrity: true,
        consent_required: true,
        data_subject_notification: true
      },
      anvisa: {
        enabled: true,
        validation_required: true,
        documentation: true,
        quality_assurance: true,
        risk_assessment: true
      },
      cfm: {
        enabled: true,
        medical_records_protection: true,
        patient_safety: true,
        professional_standards: true,
        ethical_compliance: true
      }
    },
    data_protection: {
      encryption_enabled: true,
      backup_verified: true,
      access_controls: true,
      audit_logging: true,
      data_classification: true
    }
  },
  performance: {
    baseline_metrics: {
      build_time: 120, // 2 minutes
      install_time: 180, // 3 minutes
      test_time: 300, // 5 minutes
      memory_usage: 1024, // 1GB
      cpu_usage: 50, // 50%
      disk_usage: 500 // 500MB
    },
    current_metrics: {
      build_time: 0,
      install_time: 0,
      test_time: 0,
      memory_usage: 0,
      cpu_usage: 0,
      disk_usage: 0
    },
    targets: {
      build_time_improvement: 66.7, // 3-5x improvement target
      memory_usage_reduction: 20,
      performance_improvement: 300
    }
  },
  validation: {
    pre_migration: {
      passed: false,
      checks: [],
      failures: [],
      warnings: []
    },
    post_migration: {
      checks: [],
      failures: [],
      warnings: []
    },
    compliance: {
      issues: []
    }
  },
  errors: []
}

// Validation functions
export const validateMigrationState = (state: unknown): MigrationState => {
  return MigrationStateSchema.parse(state)
}

export const isValidMigrationState = (state: unknown): boolean => {
  return MigrationStateSchema.safeParse(state).success
}

// Utility functions
export const createMigrationState = (overrides: Partial<MigrationState> = {}): MigrationState => {
  const now = new Date().toISOString()

  return validateMigrationState({
    id: crypto.randomUUID(),
    name: 'NeonPro Bun Migration',
    description: 'NeonPro platform migration from Node/PNPM to Bun runtime',
    version: '1.0.0',
    environment: 'development',
    ...DEFAULT_MIGRATION_STATE,
    ...overrides,
    metadata: {
      created_at: now,
      updated_at: now,
      created_by: 'system',
      tags: ['bun', 'migration', 'healthcare', 'lgpd', 'anvisa', 'cfm'],
      ...overrides.metadata
    }
  })
}

export const updateMigrationState = (
  state: MigrationState,
  updates: Partial<MigrationState>
): MigrationState => {
  // Ensure we get a fresh timestamp that's always different
  const now = new Date()
  // Add milliseconds to ensure uniqueness if timestamps are the same
  now.setMilliseconds(now.getMilliseconds() + 1)

  return validateMigrationState({
    ...state,
    ...updates,
    metadata: {
      ...state.metadata,
      updated_at: now.toISOString(),
      updated_by: updates.metadata?.updated_by || state.metadata.updated_by,
      ...updates.metadata
    }
  })
}

// Phase management
export const advancePhase = (
  state: MigrationState,
  newPhase: MigrationPhaseType,
  options: {
    status?: MigrationStatusType
    progress?: number
    errors?: string[]
    warnings?: string[]
  } = {}
): MigrationState => {
  const now = new Date().toISOString()

  // Update current phase
  const updatedPhases = state.phases.map(phase => {
    if (phase.phase === newPhase) {
      return {
        ...phase,
        status: options.status || 'in_progress',
        started_at: phase.started_at || now,
        completed_at: options.status === 'completed' ? now : phase.completed_at,
        progress: options.progress || phase.progress,
        errors: options.errors || phase.errors,
        warnings: options.warnings || phase.warnings
      }
    }
    return phase
  })

  return updateMigrationState(state, {
    migration: {
      ...state.migration,
      phase: newPhase,
      status: options.status || 'in_progress',
      progress: options.progress || state.migration.progress
    },
    phases: updatedPhases
  })
}

// Error management
export const addError = (
  state: MigrationState,
  error: {
    phase: MigrationPhaseType
    error_type: string
    message: string
    stack_trace?: string
    context?: Record<string, unknown>
  }
): MigrationState => {
  const errorEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    resolved: false,
    ...error
  }

  return updateMigrationState(state, {
    errors: [...state.errors, errorEntry]
  })
}

export const resolveError = (
  state: MigrationState,
  errorId: string,
  resolution: string
): MigrationState => {
  const updatedErrors = state.errors.map(error => {
    if (error.id === errorId) {
      return {
        ...error,
        resolved: true,
        resolution
      }
    }
    return error
  })

  return updateMigrationState(state, {
    errors: updatedErrors
  })
}

// Healthcare compliance validation
export const validateHealthcareCompliance = (state: MigrationState): boolean => {
  const { healthcare } = state

  // Check LGPD compliance
  if (!healthcare.compliance.lgpd.enabled) return false
  if (!healthcare.compliance.lgpd.data_backup) return false
  if (!healthcare.compliance.lgpd.audit_trail) return false
  if (!healthcare.compliance.lgpd.data_integrity) return false

  // Check ANVISA compliance
  if (!healthcare.compliance.anvisa.enabled) return false
  if (!healthcare.compliance.anvisa.validation_required) return false
  if (!healthcare.compliance.anvisa.documentation) return false

  // Check CFM compliance
  if (!healthcare.compliance.cfm.enabled) return false
  if (!healthcare.compliance.cfm.medical_records_protection) return false
  if (!healthcare.compliance.cfm.patient_safety) return false

  // Check data protection
  if (!healthcare.data_protection.encryption_enabled) return false
  if (!healthcare.data_protection.backup_verified) return false
  if (!healthcare.data_protection.access_controls) return false

  return true
}

// Performance validation
export const validatePerformanceTargets = (state: MigrationState): boolean => {
  const { performance } = state

  // Check if targets are met
  const buildTimeImprovement = ((performance.baseline_metrics.build_time - performance.current_metrics.build_time) / performance.baseline_metrics.build_time) * 100
  if (buildTimeImprovement < performance.targets.build_time_improvement) return false

  const memoryUsageReduction = ((performance.baseline_metrics.memory_usage - performance.current_metrics.memory_usage) / performance.baseline_metrics.memory_usage) * 100
  if (memoryUsageReduction < performance.targets.memory_usage_reduction) return false

  return true
}

// Migration completion check
export const isMigrationComplete = (state: MigrationState): boolean => {
  return state.migration.phase === 'completed' &&
         state.migration.status === 'completed' &&
         state.migration.progress === 100
}

// Rollback check
export const shouldRollback = (state: MigrationState): boolean => {
  if (!state.rollback.enabled) return false

  // Check error rate
  const errorRate = state.errors.filter(e => !e.resolved).length / state.errors.length
  if (errorRate > 0.1 && state.rollback.trigger_conditions.includes('error_rate')) return true

  // Check compliance failures
  if (!validateHealthcareCompliance(state) && state.rollback.trigger_conditions.includes('compliance_failure')) return true

  return false
}

// Progress calculation
export const calculateProgress = (state: MigrationState): number => {
  const totalTasks = state.phases.reduce((sum, phase) => sum + phase.total_tasks, 0)
  const completedTasks = state.phases.reduce((sum, phase) => sum + phase.tasks_completed, 0)

  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
}
