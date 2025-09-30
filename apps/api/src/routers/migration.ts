/**
 * Migration Management tRPC Router
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import {
  MigrationStateSchema,
  MigrationStateUpdateSchema,
  createMigrationState,
  getMigrationState,
  updateMigrationState,
  startMigration,
  completeMigration,
  failMigration,
  rollbackMigration,
  getMigrationProgress,
  getMigrationHealth,
  canRollback,
  getRollbackPlan,
  validateMigrationState,
  validateMigrationStateUpdate,
  type MigrationState,
  type MigrationStateUpdate,
} from '@neonpro/database'

// Input schemas
const GetMigrationStateInput = z.object({
  environment: z.enum(['development', 'staging', 'production']).optional(),
})

const CreateMigrationStateInput = MigrationStateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

const UpdateMigrationStateInput = z.object({
  id: z.string().uuid(),
  update: MigrationStateUpdateSchema,
})

const StartMigrationInput = z.object({
  id: z.string().uuid(),
  estimatedDuration: z.number().min(0, 'Estimated duration must be non-negative').optional(),
})

const CompleteMigrationInput = z.object({
  id: z.string().uuid(),
})

const FailMigrationInput = z.object({
  id: z.string().uuid(),
  error: z.string().min(1, 'Error message is required'),
})

const RollbackMigrationInput = z.object({
  id: z.string().uuid(),
})

// Output schemas
const MigrationStateOutput = MigrationStateSchema

const MigrationProgressOutput = z.object({
  currentStep: z.string(),
  totalSteps: z.number(),
  completedSteps: z.number(),
  percentage: z.number(),
  estimatedTimeRemaining: z.number().optional(),
  lastUpdated: z.date(),
})

const MigrationHealthOutput = z.object({
  status: z.enum(['healthy', 'warning', 'error']),
  message: z.string(),
  details: z.record(z.any()),
})

const RollbackPlanOutput = z.array(z.string())

// Router definition
export const migrationRouter = createTRPCRouter({
  // Get migration state
  getState: protectedProcedure
    .input(GetMigrationStateInput.optional())
    .output(MigrationStateOutput)
    .query(async ({ ctx, input }) => {
      try {
        const environment = input?.environment || ctx.environment

        // Get migration state from database
        let state = await getMigrationState(ctx.supabase, environment)

        // If no migration state exists, create a default one
        if (!state) {
          const defaultState = {
            name: `NeonPro ${environment} Migration`,
            version: '1.0.0',
            environment,
            migration: {
              phase: 'planning',
              status: 'pending',
              progress: {
                currentStep: 'Initializing',
                totalSteps: 10,
                completedSteps: 0,
                percentage: 0,
                lastUpdated: new Date(),
              },
              startedAt: new Date(),
              estimatedDuration: 3600, // 1 hour in seconds
            },
            description: 'Bun migration for hybrid architecture',
          }

          state = await createMigrationState(ctx.supabase, defaultState)
        }

        // Validate migration state
        validateMigrationState(state)

        // Log access for compliance
        await ctx.supabase.from('audit_logs').insert({
          clinic_id: ctx.clinicId,
          user_id: ctx.userId,
          action: 'VIEW',
          resource_type: 'MIGRATION_STATE',
          resource_id: state.id,
          details: {
            environment,
            operation: 'getState',
          },
          created_at: new Date(),
        })

        return state
      } catch (error) {
        console.error('Error getting migration state:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get migration state',
        })
      }
    }),

  // Create migration state
  createState: protectedProcedure
    .input(CreateMigrationStateInput)
    .output(MigrationStateOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate input
        const validatedInput = validateMigrationState(input)

        // Check if migration state already exists for this environment
        const existingState = await getMigrationState(ctx.supabase, validatedInput.environment)
        if (existingState) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Migration state for ${validatedInput.environment} already exists`,
          })
        }

        // Create migration state
        const state = await createMigrationState(ctx.supabase, validatedInput)

        // Log creation for compliance
        await ctx.supabase.from('audit_logs').insert({
          clinic_id: ctx.clinicId,
          user_id: ctx.userId,
          action: 'CREATE',
          resource_type: 'MIGRATION_STATE',
          resource_id: state.id,
          details: {
            environment: state.environment,
            operation: 'createState',
          },
          created_at: new Date(),
        })

        return state
      } catch (error) {
        console.error('Error creating migration state:', error)

        if (error instanceof TRPCError) {
          throw error
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create migration state',
        })
      }
    }),

  // Update migration state
  updateState: protectedProcedure
    .input(UpdateMigrationStateInput)
    .output(MigrationStateOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate input
        const validatedUpdate = validateMigrationStateUpdate(input.update)

        // Get current migration state
        const currentState = await getMigrationState(ctx.supabase, ctx.environment)
        if (!currentState || currentState.id !== input.id) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Migration state not found',
          })
        }

        // Update migration state
        const updatedState = await updateMigrationState(ctx.supabase, input.id, validatedUpdate)

        // Log update for compliance
        await ctx.supabase.from('audit_logs').insert({
          clinic_id: ctx.clinicId,
          user_id: ctx.userId,
          action: 'UPDATE',
          resource_type: 'MIGRATION_STATE',
          resource_id: updatedState.id,
          details: {
            environment: updatedState.environment,
            operation: 'updateState',
            changes: validatedUpdate,
          },
          created_at: new Date(),
        })

        return updatedState
      } catch (error) {
        console.error('Error updating migration state:', error)

        if (error instanceof TRPCError) {
          throw error
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update migration state',
        })
      }
    }),

  // Start migration
  startMigration: protectedProcedure
    .input(StartMigrationInput)
    .output(MigrationStateOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get current migration state
        const currentState = await getMigrationState(ctx.supabase, ctx.environment)
        if (!currentState || currentState.id !== input.id) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Migration state not found',
          })
        }

        // Check if migration can be started
        if (currentState.migration.status !== 'pending' && currentState.migration.status !== 'failed') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Migration cannot be started in its current state',
          })
        }

        // Start migration
        const updatedState = await startMigration(ctx.supabase, input.id, input.estimatedDuration)

        // Log start for compliance
        await ctx.supabase.from('audit_logs').insert({
          clinic_id: ctx.clinicId,
          user_id: ctx.userId,
          action: 'START',
          resource_type: 'MIGRATION_STATE',
          resource_id: updatedState.id,
          details: {
            environment: updatedState.environment,
            operation: 'startMigration',
            estimatedDuration: input.estimatedDuration,
          },
          created_at: new Date(),
        })

        return updatedState
      } catch (error) {
        console.error('Error starting migration:', error)

        if (error instanceof TRPCError) {
          throw error
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to start migration',
        })
      }
    }),

  // Complete migration
  completeMigration: protectedProcedure
    .input(CompleteMigrationInput)
    .output(MigrationStateOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get current migration state
        const currentState = await getMigrationState(ctx.supabase, ctx.environment)
        if (!currentState || currentState.id !== input.id) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Migration state not found',
          })
        }

        // Check if migration can be completed
        if (currentState.migration.status !== 'in_progress') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Migration cannot be completed in its current state',
          })
        }

        // Complete migration
        const updatedState = await completeMigration(ctx.supabase, input.id)

        // Log completion for compliance
        await ctx.supabase.from('audit_logs').insert({
          clinic_id: ctx.clinicId,
          user_id: ctx.userId,
          action: 'COMPLETE',
          resource_type: 'MIGRATION_STATE',
          resource_id: updatedState.id,
          details: {
            environment: updatedState.environment,
            operation: 'completeMigration',
            duration: updatedState.migration.actualDuration,
          },
          created_at: new Date(),
        })

        return updatedState
      } catch (error) {
        console.error('Error completing migration:', error)

        if (error instanceof TRPCError) {
          throw error
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to complete migration',
        })
      }
    }),

  // Fail migration
  failMigration: protectedProcedure
    .input(FailMigrationInput)
    .output(MigrationStateOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get current migration state
        const currentState = await getMigrationState(ctx.supabase, ctx.environment)
        if (!currentState || currentState.id !== input.id) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Migration state not found',
          })
        }

        // Check if migration can be failed
        if (currentState.migration.status !== 'in_progress') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Migration cannot be failed in its current state',
          })
        }

        // Fail migration
        const updatedState = await failMigration(ctx.supabase, input.id, input.error)

        // Log failure for compliance
        await ctx.supabase.from('audit_logs').insert({
          clinic_id: ctx.clinicId,
          user_id: ctx.userId,
          action: 'FAIL',
          resource_type: 'MIGRATION_STATE',
          resource_id: updatedState.id,
          details: {
            environment: updatedState.environment,
            operation: 'failMigration',
            error: input.error,
            duration: updatedState.migration.actualDuration,
          },
          created_at: new Date(),
        })

        return updatedState
      } catch (error) {
        console.error('Error failing migration:', error)

        if (error instanceof TRPCError) {
          throw error
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fail migration',
        })
      }
    }),

  // Rollback migration
  rollbackMigration: protectedProcedure
    .input(RollbackMigrationInput)
    .output(MigrationStateOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get current migration state
        const currentState = await getMigrationState(ctx.supabase, ctx.environment)
        if (!currentState || currentState.id !== input.id) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Migration state not found',
          })
        }

        // Check if migration can be rolled back
        if (!canRollback(currentState)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Migration cannot be rolled back in its current state',
          })
        }

        // Rollback migration
        const updatedState = await rollbackMigration(ctx.supabase, input.id)

        // Log rollback for compliance
        await ctx.supabase.from('audit_logs').insert({
          clinic_id: ctx.clinicId,
          user_id: ctx.userId,
          action: 'ROLLBACK',
          resource_type: 'MIGRATION_STATE',
          resource_id: updatedState.id,
          details: {
            environment: updatedState.environment,
            operation: 'rollbackMigration',
          },
          created_at: new Date(),
        })

        return updatedState
      } catch (error) {
        console.error('Error rolling back migration:', error)

        if (error instanceof TRPCError) {
          throw error
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to rollback migration',
        })
      }
    }),

  // Get migration progress
  getProgress: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .output(MigrationProgressOutput)
    .query(async ({ ctx, input }) => {
      try {
        // Get migration progress
        const progress = await getMigrationProgress(ctx.supabase, input.id)

        // Log access for compliance
        await ctx.supabase.from('audit_logs').insert({
          clinic_id: ctx.clinicId,
          user_id: ctx.userId,
          action: 'VIEW',
          resource_type: 'MIGRATION_PROGRESS',
          resource_id: input.id,
          details: {
            operation: 'getProgress',
          },
          created_at: new Date(),
        })

        return progress
      } catch (error) {
        console.error('Error getting migration progress:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get migration progress',
        })
      }
    }),

  // Get migration health
  getHealth: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .output(MigrationHealthOutput)
    .query(async ({ ctx, input }) => {
      try {
        // Get migration health
        const health = await getMigrationHealth(ctx.supabase, input.id)

        // Log access for compliance
        await ctx.supabase.from('audit_logs').insert({
          clinic_id: ctx.clinicId,
          user_id: ctx.userId,
          action: 'VIEW',
          resource_type: 'MIGRATION_HEALTH',
          resource_id: input.id,
          details: {
            operation: 'getHealth',
            status: health.status,
          },
          created_at: new Date(),
        })

        return health
      } catch (error) {
        console.error('Error getting migration health:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get migration health',
        })
      }
    }),

  // Get rollback plan
  getRollbackPlan: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .output(RollbackPlanOutput)
    .query(async ({ ctx, input }) => {
      try {
        // Get current migration state
        const currentState = await getMigrationState(ctx.supabase, ctx.environment)
        if (!currentState || currentState.id !== input.id) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Migration state not found',
          })
        }

        // Get rollback plan
        const rollbackPlan = getRollbackPlan(currentState)

        // Log access for compliance
        await ctx.supabase.from('audit_logs').insert({
          clinic_id: ctx.clinicId,
          user_id: ctx.userId,
          action: 'VIEW',
          resource_type: 'MIGRATION_ROLLBACK_PLAN',
          resource_id: input.id,
          details: {
            operation: 'getRollbackPlan',
            canRollback: canRollback(currentState),
          },
          created_at: new Date(),
        })

        return rollbackPlan
      } catch (error) {
        console.error('Error getting rollback plan:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get rollback plan',
        })
      }
    }),
})
