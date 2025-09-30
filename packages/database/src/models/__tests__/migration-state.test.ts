/**
 * Migration State Model Tests
 *
 * This test suite validates the MigrationState model functionality
 * for the NeonPro platform, specifically testing phase tracking
 * and healthcare compliance features.
 */

import { describe, it, expect, beforeEach } from 'bun:test'
import {
  MigrationStateSchema,
  createMigrationState,
  updateMigrationState,
  advancePhase,
  addError,
  resolveError,
  validateHealthcareCompliance,
  validatePerformanceTargets,
  isMigrationComplete,
  shouldRollback,
  calculateProgress,
  validateMigrationState,
  isValidMigrationState,
  MigrationPhase,
  MigrationStatus,
  DEFAULT_MIGRATION_STATE
} from '../migration-state'

describe('MigrationState Model', () => {
  let validState: any

  beforeEach(() => {
    validState = createMigrationState()
  })

  describe('Schema Validation', () => {
    it('should validate a correct configuration', () => {
      expect(() => MigrationStateSchema.parse(validState)).not.toThrow()
    })

    it('should reject invalid configuration', () => {
      const invalidState = {
        ...validState,
        migration: {
          phase: 'invalid',
          status: 'pending',
          progress: 0,
          started_at: new Date().toISOString()
        }
      }

      expect(() => MigrationStateSchema.parse(invalidState)).toThrow()
    })

    it('should require required fields', () => {
      const incompleteState = {
        name: 'Test Migration',
        version: '1.0.0'
      }

      expect(() => MigrationStateSchema.parse(incompleteState)).toThrow()
    })
  })

  describe('State Creation', () => {
    it('should create a valid default state', () => {
      const state = createMigrationState()

      expect(state.id).toBeDefined()
      expect(state.name).toBe('NeonPro Bun Migration')
      expect(state.version).toBe('1.0.0')
      expect(state.migration.phase).toBe('planning')
      expect(state.migration.status).toBe('pending')
    })

    it('should accept configuration overrides', () => {
      const overrides = {
        name: 'Custom Migration',
        version: '2.0.0',
        migration: {
          phase: 'setup' as const,
          status: 'in_progress' as const,
          progress: 25,
          started_at: new Date().toISOString(),
          estimated_duration: 120,
          retry_count: 0,
          max_retries: 3
        }
      }

      const state = createMigrationState(overrides)

      expect(state.name).toBe('Custom Migration')
      expect(state.version).toBe('2.0.0')
      expect(state.migration.phase).toBe('setup')
      expect(state.migration.status).toBe('in_progress')
    })

    it('should generate unique IDs', () => {
      const state1 = createMigrationState()
      const state2 = createMigrationState()

      expect(state1.id).not.toBe(state2.id)
    })
  })

  describe('State Updates', () => {
    it('should update state correctly', () => {
      const updates = {
        name: 'Updated Migration',
        version: '2.0.0'
      }

      // Add a small delay to ensure different timestamps
      setTimeout(() => {}, 1)

      const updatedState = updateMigrationState(validState, updates)

      expect(updatedState.name).toBe('Updated Migration')
      expect(updatedState.version).toBe('2.0.0')
      expect(updatedState.id).toBe(validState.id) // Should remain unchanged
      expect(updatedState.metadata.updated_at).not.toBe(validState.metadata.updated_at)
    })

    it('should validate updates', () => {
      const invalidUpdates = {
        migration: {
          phase: 'invalid' as any
        }
      }

      expect(() => updateMigrationState(validState, invalidUpdates)).toThrow()
    })
  })

  describe('Phase Management', () => {
    it('should advance phase correctly', () => {
      const updatedState = advancePhase(validState, 'setup', {
        status: 'in_progress',
        progress: 10
      })

      expect(updatedState.migration.phase).toBe('setup')
      expect(updatedState.migration.status).toBe('in_progress')
      expect(updatedState.migration.progress).toBe(10)
    })

    it('should mark phase as completed', () => {
      const updatedState = advancePhase(validState, 'planning', {
        status: 'completed',
        progress: 100
      })

      const planningPhase = updatedState.phases.find(p => p.phase === 'planning')
      expect(planningPhase?.status).toBe('completed')
      expect(planningPhase?.completed_at).toBeDefined()
    })

    it('should handle phase errors', () => {
      const updatedState = advancePhase(validState, 'setup', {
        status: 'failed',
        errors: ['Setup failed due to configuration issue']
      })

      const setupPhase = updatedState.phases.find(p => p.phase === 'setup')
      expect(setupPhase?.status).toBe('failed')
      expect(setupPhase?.errors).toContain('Setup failed due to configuration issue')
    })
  })

  describe('Error Management', () => {
    it('should add errors correctly', () => {
      const error = {
        phase: 'setup' as const,
        error_type: 'ConfigurationError',
        message: 'Invalid configuration detected'
      }

      const updatedState = addError(validState, error)

      expect(updatedState.errors).toHaveLength(1)
      expect(updatedState.errors[0].phase).toBe('setup')
      expect(updatedState.errors[0].error_type).toBe('ConfigurationError')
      expect(updatedState.errors[0].message).toBe('Invalid configuration detected')
      expect(updatedState.errors[0].resolved).toBe(false)
    })

    it('should resolve errors correctly', () => {
      const error = {
        phase: 'setup' as const,
        error_type: 'ConfigurationError',
        message: 'Invalid configuration detected'
      }

      const stateWithError = addError(validState, error)
      const errorId = stateWithError.errors[0].id

      const resolvedState = resolveError(stateWithError, errorId, 'Configuration fixed')

      expect(resolvedState.errors[0].resolved).toBe(true)
      expect(resolvedState.errors[0].resolution).toBe('Configuration fixed')
    })
  })

  describe('Healthcare Compliance Validation', () => {
    it('should validate compliant configuration', () => {
      expect(validateHealthcareCompliance(validState)).toBe(true)
    })

    it('should reject non-LGPD compliant configuration', () => {
      const nonCompliantState = {
        ...validState,
        healthcare: {
          ...validState.healthcare,
          compliance: {
            ...validState.healthcare.compliance,
            lgpd: {
              ...validState.healthcare.compliance.lgpd,
              enabled: false
            }
          }
        }
      }

      expect(validateHealthcareCompliance(nonCompliantState)).toBe(false)
    })

    it('should reject non-ANVISA compliant configuration', () => {
      const nonCompliantState = {
        ...validState,
        healthcare: {
          ...validState.healthcare,
          compliance: {
            ...validState.healthcare.compliance,
            anvisa: {
              ...validState.healthcare.compliance.anvisa,
              validation_required: false
            }
          }
        }
      }

      expect(validateHealthcareCompliance(nonCompliantState)).toBe(false)
    })

    it('should reject insufficient data protection', () => {
      const nonCompliantState = {
        ...validState,
        healthcare: {
          ...validState.healthcare,
          data_protection: {
            ...validState.healthcare.data_protection,
            encryption_enabled: false
          }
        }
      }

      expect(validateHealthcareCompliance(nonCompliantState)).toBe(false)
    })
  })

  describe('Performance Validation', () => {
    it('should validate performance targets when met', () => {
      const stateWithGoodPerformance = {
        ...validState,
        performance: {
          ...validState.performance,
          current_metrics: {
            build_time: 30, // 75% improvement from 120s baseline
            install_time: 90,
            test_time: 150,
            memory_usage: 800, // 20% reduction from 1024MB baseline
            cpu_usage: 40,
            disk_usage: 400
          }
        }
      }

      expect(validatePerformanceTargets(stateWithGoodPerformance)).toBe(true)
    })

    it('should reject insufficient performance improvement', () => {
      const stateWithPoorPerformance = {
        ...validState,
        performance: {
          ...validState.performance,
          current_metrics: {
            build_time: 100, // Only 16.7% improvement
            install_time: 180,
            test_time: 300,
            memory_usage: 1024, // No reduction
            cpu_usage: 50,
            disk_usage: 500
          }
        }
      }

      expect(validatePerformanceTargets(stateWithPoorPerformance)).toBe(false)
    })
  })

  describe('Migration Completion', () => {
    it('should identify completed migration', () => {
      const completedState = {
        ...validState,
        migration: {
          ...validState.migration,
          phase: 'completed' as const,
          status: 'completed' as const,
          progress: 100
        }
      }

      expect(isMigrationComplete(completedState)).toBe(true)
    })

    it('should reject incomplete migration', () => {
      expect(isMigrationComplete(validState)).toBe(false)
    })
  })

  describe('Rollback Logic', () => {
    it('should trigger rollback on high error rate', () => {
      const stateWithManyErrors = {
        ...validState,
        rollback: {
          ...validState.rollback,
          enabled: true,
          trigger_conditions: ['error_rate']
        },
        errors: [
          { id: '1', phase: 'setup' as const, timestamp: new Date().toISOString(), error_type: 'Error', message: 'Error 1', resolved: false },
          { id: '2', phase: 'setup' as const, timestamp: new Date().toISOString(), error_type: 'Error', message: 'Error 2', resolved: false },
          { id: '3', phase: 'setup' as const, timestamp: new Date().toISOString(), error_type: 'Error', message: 'Error 3', resolved: false },
          { id: '4', phase: 'setup' as const, timestamp: new Date().toISOString(), error_type: 'Error', message: 'Error 4', resolved: false },
          { id: '5', phase: 'setup' as const, timestamp: new Date().toISOString(), error_type: 'Error', message: 'Error 5', resolved: true }
        ]
      }

      expect(shouldRollback(stateWithManyErrors)).toBe(true)
    })

    it('should trigger rollback on compliance failure', () => {
      const nonCompliantState = {
        ...validState,
        healthcare: {
          ...validState.healthcare,
          compliance: {
            ...validState.healthcare.compliance,
            lgpd: {
              ...validState.healthcare.compliance.lgpd,
              enabled: false
            }
          }
        },
        rollback: {
          ...validState.rollback,
          enabled: true,
          trigger_conditions: ['compliance_failure']
        }
      }

      expect(shouldRollback(nonCompliantState)).toBe(true)
    })

    it('should not trigger rollback when disabled', () => {
      const stateWithErrors = {
        ...validState,
        rollback: {
          ...validState.rollback,
          enabled: false
        },
        errors: [
          { id: '1', phase: 'setup' as const, timestamp: new Date().toISOString(), error_type: 'Error', message: 'Error 1', resolved: false }
        ]
      }

      expect(shouldRollback(stateWithErrors)).toBe(false)
    })
  })

  describe('Progress Calculation', () => {
    it('should calculate correct progress', () => {
      const stateWithProgress = {
        ...validState,
        phases: [
          {
            name: 'Planning Phase',
            phase: 'planning' as const,
            status: 'completed' as const,
            progress: 100,
            tasks_completed: 5,
            total_tasks: 5,
            errors: [],
            warnings: []
          },
          {
            name: 'Setup Phase',
            phase: 'setup' as const,
            status: 'in_progress' as const,
            progress: 50,
            tasks_completed: 5,
            total_tasks: 10,
            errors: [],
            warnings: []
          }
        ]
      }

      expect(calculateProgress(stateWithProgress)).toBe(67) // Math.round((5 + 5) / (5 + 10) * 100)
    })

    it('should handle zero tasks', () => {
      const stateWithNoTasks = {
        ...validState,
        phases: []
      }

      expect(calculateProgress(stateWithNoTasks)).toBe(0)
    })
  })

  describe('Phases Configuration', () => {
    it('should have all required phases', () => {
      const state = createMigrationState()
      const phaseNames = state.phases.map(p => p.phase)

      expect(phaseNames).toContain('planning')
      expect(phaseNames).toContain('setup')
      expect(phaseNames).toContain('configuration')
      expect(phaseNames).toContain('migration')
      expect(phaseNames).toContain('validation')
    })

    it('should initialize phases with correct default values', () => {
      const state = createMigrationState()

      state.phases.forEach(phase => {
        expect(phase.status).toBe('pending')
        expect(phase.progress).toBe(0)
        expect(phase.tasks_completed).toBe(0)
        expect(phase.errors).toHaveLength(0)
        expect(phase.warnings).toHaveLength(0)
      })
    })
  })

  describe('Rollback Configuration', () => {
    it('should have valid rollback configuration', () => {
      expect(validState.rollback.enabled).toBe(true)
      expect(validState.rollback.automatic).toBe(false)
      expect(validState.rollback.trigger_conditions).toContain('error_rate')
      expect(validState.rollback.trigger_conditions).toContain('compliance_failure')
      expect(validState.rollback.trigger_conditions).toContain('timeout')
    })
  })

  describe('Healthcare Configuration', () => {
    it('should have comprehensive healthcare compliance', () => {
      expect(validState.healthcare.compliance.lgpd.enabled).toBe(true)
      expect(validState.healthcare.compliance.lgpd.data_backup).toBe(true)
      expect(validState.healthcare.compliance.lgpd.audit_trail).toBe(true)

      expect(validState.healthcare.compliance.anvisa.enabled).toBe(true)
      expect(validState.healthcare.compliance.anvisa.validation_required).toBe(true)

      expect(validState.healthcare.compliance.cfm.enabled).toBe(true)
      expect(validState.healthcare.compliance.cfm.medical_records_protection).toBe(true)

      expect(validState.healthcare.data_protection.encryption_enabled).toBe(true)
      expect(validState.healthcare.data_protection.access_controls).toBe(true)
    })
  })

  describe('Performance Metrics', () => {
    it('should have valid baseline metrics', () => {
      expect(validState.performance.baseline_metrics.build_time).toBeGreaterThan(0)
      expect(validState.performance.baseline_metrics.memory_usage).toBeGreaterThan(0)
      expect(validState.performance.baseline_metrics.cpu_usage).toBeGreaterThan(0)
    })

    it('should have reasonable targets', () => {
      expect(validState.performance.targets.build_time_improvement).toBeGreaterThan(0)
      expect(validState.performance.targets.memory_usage_reduction).toBeGreaterThanOrEqual(0)
      expect(validState.performance.targets.performance_improvement).toBeGreaterThan(0)
    })
  })

  describe('Metadata', () => {
    it('should have proper timestamps', () => {
      expect(validState.metadata.created_at).toBeDefined()
      expect(validState.metadata.updated_at).toBeDefined()
      expect(validState.metadata.created_by).toBe('system')
      expect(validState.metadata.tags).toContain('bun')
    })

    it('should update timestamps on modification', () => {
      // Add a small delay to ensure different timestamps
      setTimeout(() => {}, 1)

      const updatedState = updateMigrationState(validState, {
        name: 'Updated'
      })

      expect(updatedState.metadata.updated_at).not.toBe(validState.metadata.updated_at)
      expect(updatedState.metadata.created_at).toBe(validState.metadata.created_at)
    })
  })

  describe('Default Configuration', () => {
    it('should have valid default values', () => {
      expect(DEFAULT_MIGRATION_STATE.migration?.phase).toBe('planning')
      expect(DEFAULT_MIGRATION_STATE.migration?.status).toBe('pending')
      expect(DEFAULT_MIGRATION_STATE.healthcare?.compliance?.lgpd?.enabled).toBe(true)
      expect(DEFAULT_MIGRATION_STATE.rollback?.enabled).toBe(true)
      expect(DEFAULT_MIGRATION_STATE.phases?.length).toBeGreaterThan(0)
    })
  })

  describe('Utility Functions', () => {
    it('should validate state correctly', () => {
      expect(() => validateMigrationState(validState)).not.toThrow()
    })

    it('should check state validity', () => {
      expect(isValidMigrationState(validState)).toBe(true)
      expect(isValidMigrationState({ invalid: 'state' })).toBe(false)
    })
  })
})
