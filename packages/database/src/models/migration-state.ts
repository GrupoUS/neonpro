/**
 * Migration State Model
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { z } from 'zod'

// Migration Phase Schema
export const MigrationPhaseSchema = z.enum([
  'planning',
  'setup',
  'configuration',
  'migration',
  'validation',
  'completed',
  'failed',
  'rollback',
])

// Migration Status Schema
export const MigrationStatusSchema = z.enum([
  'pending',
  'in_progress',
  'paused',
  'failed',
  'completed',
  'rolled_back',
])

// Migration Progress Schema
export const MigrationProgressSchema = z.object({
  currentStep: z.string(),
  totalSteps: z.number().min(1, 'Total steps must be at least 1'),
  completedSteps: z.number().min(0, 'Completed steps must be non-negative'),
  percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
  estimatedTimeRemaining: z.number().min(0, 'Estimated time remaining must be non-negative').optional(),
  lastUpdated: z.date(),
})

// Migration Details Schema
export const MigrationDetailsSchema = z.object({
  phase: MigrationPhaseSchema,
  status: MigrationStatusSchema,
  progress: MigrationProgressSchema,
  startedAt: z.date(),
  estimatedDuration: z.number().min(0, 'Estimated duration must be non-negative').optional(),
  actualDuration: z.number().min(0, 'Actual duration must be non-negative').optional(),
  completedAt: z.date().optional(),
  error: z.string().optional(),
  rollbackData: z.record(z.string(), z.unknown()).optional(),
})

// Migration State Schema
export const MigrationStateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  version: z.string().min(1, 'Version is required'),
  environment: z.enum(['development', 'staging', 'production']),
  migration: MigrationDetailsSchema,
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Migration State Update Schema
export const MigrationStateUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  version: z.string().min(1, 'Version is required').optional(),
  migration: MigrationDetailsSchema.optional(),
  description: z.string().optional(),
})

// Types
export type MigrationPhase = z.infer<typeof MigrationPhaseSchema>
export type MigrationStatus = z.infer<typeof MigrationStatusSchema>
export type MigrationProgress = z.infer<typeof MigrationProgressSchema>
export type MigrationDetails = z.infer<typeof MigrationDetailsSchema>
export type MigrationState = z.infer<typeof MigrationStateSchema>
export type MigrationStateUpdate = z.infer<typeof MigrationStateUpdateSchema>

// Default values
export const defaultMigrationProgress: MigrationProgress = {
  currentStep: 'Initializing',
  totalSteps: 1,
  completedSteps: 0,
  percentage: 0,
  lastUpdated: new Date(),
}

export const defaultMigrationDetails: MigrationDetails = {
  phase: 'planning',
  status: 'pending',
  progress: defaultMigrationProgress,
  startedAt: new Date(),
  estimatedDuration: 0,
}

export const defaultMigrationState: Omit<MigrationState, 'id' | 'name' | 'version' | 'environment' | 'createdAt' | 'updatedAt'> = {
  migration: defaultMigrationDetails,
  description: 'No description provided',
}

// Validation functions
export const validateMigrationState = (state: unknown): MigrationState => {
  return MigrationStateSchema.parse(state)
}

export const validateMigrationStateUpdate = (update: unknown): MigrationStateUpdate => {
  return MigrationStateUpdateSchema.parse(update)
}

export const validateMigrationDetails = (details: unknown): MigrationDetails => {
  return MigrationDetailsSchema.parse(details)
}

export const validateMigrationProgress = (progress: unknown): MigrationProgress => {
  return MigrationProgressSchema.parse(progress)
}

// Migration state validation
export const isValidMigrationState = (state: MigrationState): boolean => {
  // Check if the migration state is valid
  return (
    state.migration.phase !== 'failed' ||
    state.migration.error !== undefined
  )
}

// Migration progress calculation
export const calculateMigrationProgress = (progress: MigrationProgress): number => {
  return Math.round((progress.completedSteps / progress.totalSteps) * 100)
}

// Update migration progress
export const updateMigrationProgress = (
  progress: MigrationProgress,
  completedSteps: number,
  currentStep?: string,
  estimatedTimeRemaining?: number
): MigrationProgress => {
  const percentage = calculateMigrationProgress({
    ...progress,
    completedSteps,
  })

  return {
    ...progress,
    completedSteps,
    percentage,
    currentStep: currentStep || progress.currentStep,
    estimatedTimeRemaining,
    lastUpdated: new Date(),
  }
}

// Check if migration can be rolled back
export const canRollback = (state: MigrationState): boolean => {
  return (
    state.migration.phase === 'completed' ||
    state.migration.phase === 'failed' ||
    state.migration.phase === 'validation'
  ) && state.migration.rollbackData !== undefined
}

// Get rollback plan
export const getRollbackPlan = (state: MigrationState): string[] => {
  if (!canRollback(state)) {
    return []
  }

  const rollbackSteps: string[] = []

  // Add rollback steps based on migration phase
  switch (state.migration.phase) {
    case 'completed':
    case 'validation':
      rollbackSteps.push('Restore previous package manager configuration')
      rollbackSteps.push('Restore previous build configuration')
      rollbackSteps.push('Restore previous runtime configuration')
      break
    case 'failed':
      rollbackSteps.push('Clean up partial migration')
      rollbackSteps.push('Restore previous configuration')
      break
  }

  return rollbackSteps
}

// Database operations
export const createMigrationState = async (
  supabase: any,
  state: Omit<MigrationState, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MigrationState> => {
  const now = new Date()
  const newState = {
    ...state,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }

  const { data, error } = await supabase
    .from('migration_states')
    .insert(newState)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create migration state: ${error.message}`)
  }

  return validateMigrationState(data)
}

export const getMigrationState = async (
  supabase: any,
  environment: string
): Promise<MigrationState | null> => {
  const { data, error } = await supabase
    .from('migration_states')
    .select('*')
    .eq('environment', environment)
    .order('createdAt', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to get migration state: ${error.message}`)
  }

  return validateMigrationState(data)
}

export const updateMigrationState = async (
  supabase: any,
  id: string,
  update: MigrationStateUpdate
): Promise<MigrationState> => {
  const now = new Date()
  const updatedState = {
    ...update,
    updatedAt: now,
  }

  const { data, error } = await supabase
    .from('migration_states')
    .update(updatedState)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update migration state: ${error.message}`)
  }

  return validateMigrationState(data)
}

export const deleteMigrationState = async (
  supabase: any,
  id: string
): Promise<void> => {
  const { error } = await supabase
    .from('migration_states')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete migration state: ${error.message}`)
  }
}

// Migration operations
export const startMigration = async (
  supabase: any,
  id: string,
  estimatedDuration?: number
): Promise<MigrationState> => {
  const now = new Date()

  const updatedMigration: MigrationDetails = {
    phase: 'migration',
    status: 'in_progress',
    progress: {
      currentStep: 'Starting migration',
      totalSteps: 10, // Default number of steps
      completedSteps: 0,
      percentage: 0,
      lastUpdated: now,
    },
    startedAt: now,
    estimatedDuration,
  }

  return updateMigrationState(supabase, id, {
    migration: updatedMigration,
  })
}

export const completeMigration = async (
  supabase: any,
  id: string
): Promise<MigrationState> => {
  const now = new Date()

  // Get current migration state
  const currentState = await getMigrationState(supabase, 'development') // Simplified for now
  if (!currentState || currentState.id !== id) {
    throw new Error('Migration state not found')
  }

  const actualDuration = now.getTime() - currentState.migration.startedAt.getTime()

  const updatedMigration: MigrationDetails = {
    ...currentState.migration,
    phase: 'completed',
    status: 'completed',
    progress: {
      ...currentState.migration.progress,
      completedSteps: currentState.migration.progress.totalSteps,
      percentage: 100,
      currentStep: 'Migration completed',
      lastUpdated: now,
    },
    completedAt: now,
    actualDuration,
  }

  return updateMigrationState(supabase, id, {
    migration: updatedMigration,
  })
}

export const failMigration = async (
  supabase: any,
  id: string,
  error: string
): Promise<MigrationState> => {
  const now = new Date()

  // Get current migration state
  const currentState = await getMigrationState(supabase, 'development') // Simplified for now
  if (!currentState || currentState.id !== id) {
    throw new Error('Migration state not found')
  }

  const actualDuration = now.getTime() - currentState.migration.startedAt.getTime()

  const updatedMigration: MigrationDetails = {
    ...currentState.migration,
    phase: 'failed',
    status: 'failed',
    progress: {
      ...currentState.migration.progress,
      lastUpdated: now,
    },
    completedAt: now,
    actualDuration,
    error,
  }

  return updateMigrationState(supabase, id, {
    migration: updatedMigration,
  })
}

export const rollbackMigration = async (
  supabase: any,
  id: string
): Promise<MigrationState> => {
  const now = new Date()

  // Get current migration state
  const currentState = await getMigrationState(supabase, 'development') // Simplified for now
  if (!currentState || currentState.id !== id) {
    throw new Error('Migration state not found')
  }

  if (!canRollback(currentState)) {
    throw new Error('Migration cannot be rolled back')
  }

  const updatedMigration: MigrationDetails = {
    ...currentState.migration,
    phase: 'rollback',
    status: 'in_progress',
    progress: {
      currentStep: 'Starting rollback',
      totalSteps: 5, // Default number of rollback steps
      completedSteps: 0,
      percentage: 0,
      lastUpdated: now,
    },
  }

  return updateMigrationState(supabase, id, {
    migration: updatedMigration,
  })
}

// Get migration progress
export const getMigrationProgress = async (
  supabase: any,
  id: string
): Promise<MigrationProgress> => {
  const state = await getMigrationState(supabase, 'development') // Simplified for now

  if (!state || state.id !== id) {
    throw new Error('Migration state not found')
  }

  return state.migration.progress
}

// Get migration health
export const getMigrationHealth = async (
  supabase: any,
  id: string
): Promise<{
  status: 'healthy' | 'warning' | 'error'
  message: string
  details: Record<string, any>
}> => {
  const state = await getMigrationState(supabase, 'development') // Simplified for now

  if (!state || state.id !== id) {
    return {
      status: 'error',
      message: 'Migration state not found',
      details: {},
    }
  }

  const { migration } = state

  // Check migration health
  if (migration.phase === 'failed') {
    return {
      status: 'error',
      message: `Migration failed: ${migration.error || 'Unknown error'}`,
      details: {
        phase: migration.phase,
        status: migration.status,
        error: migration.error,
      },
    }
  }

  if (migration.phase === 'rollback') {
    return {
      status: 'warning',
      message: 'Migration is being rolled back',
      details: {
        phase: migration.phase,
        status: migration.status,
        progress: migration.progress.percentage,
      },
    }
  }

  if (migration.status === 'paused') {
    return {
      status: 'warning',
      message: 'Migration is paused',
      details: {
        phase: migration.phase,
        status: migration.status,
        progress: migration.progress.percentage,
      },
    }
  }

  if (migration.phase === 'completed') {
    return {
      status: 'healthy',
      message: 'Migration completed successfully',
      details: {
        phase: migration.phase,
        status: migration.status,
        duration: migration.actualDuration,
      },
    }
  }

  // Migration is in progress
  const now = new Date()
  const elapsed = now.getTime() - migration.startedAt.getTime()

  if (migration.estimatedDuration && elapsed > migration.estimatedDuration * 1.5) {
    return {
      status: 'warning',
      message: 'Migration is taking longer than expected',
      details: {
        phase: migration.phase,
        status: migration.status,
        progress: migration.progress.percentage,
        elapsed,
        estimatedDuration: migration.estimatedDuration,
      },
    }
  }

  return {
    status: 'healthy',
    message: `Migration is in progress (${migration.progress.percentage}%)`,
    details: {
      phase: migration.phase,
      status: migration.status,
      progress: migration.progress.percentage,
      elapsed,
      estimatedDuration: migration.estimatedDuration,
    },
  }
}
