/**
 * Architecture Management tRPC Router
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import {
  ArchitectureConfigSchema,
  ArchitectureConfigUpdateSchema,
  createArchitectureConfig,
  getArchitectureConfig,
  updateArchitectureConfig,
  validateArchitectureConfig,
  validateArchitectureConfigUpdate,
  validateHealthcareCompliance,
  validatePerformanceTargets,
  validateBunCompatibility,
  type ArchitectureConfig,
  type ArchitectureConfigUpdate,
} from '@neonpro/database'

// Input schemas
const GetArchitectureConfigInput = z.object({
  environment: z.enum(['development', 'staging', 'production']).optional(),
})

const CreateArchitectureConfigInput = ArchitectureConfigSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

const UpdateArchitectureConfigInput = ArchitectureConfigUpdateSchema

// Output schemas
const ArchitectureConfigOutput = ArchitectureConfigSchema

// Router definition
export const architectureRouter = createTRPCRouter({
  // Get architecture configuration
  getConfig: protectedProcedure
    .input(GetArchitectureConfigInput.optional())
    .output(ArchitectureConfigOutput)
    .query(async ({ ctx, input }) => {
      try {
        const environment = input?.environment || ctx.environment

        // Get configuration from database
        let config = await getArchitectureConfig(ctx.supabase, environment)

        // If no configuration exists, create a default one
        if (!config) {
          const defaultConfig = {
            name: `NeonPro ${environment} Architecture`,
            environment,
            edgeEnabled: true,
            supabaseFunctionsEnabled: true,
            bunEnabled: true,
            performanceMetrics: {
              edgeTTFB: 150,
              realtimeUIPatch: 1.5,
              copilotToolRoundtrip: 2,
              buildTime: 0,
              bundleSize: {
                main: 0,
                vendor: 0,
                total: 0,
              },
              uptime: 99.9,
              timestamp: new Date(),
            },
            complianceStatus: {
              lgpd: {
                compliant: true,
                lastAudit: new Date(),
                nextAudit: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                issues: [],
              },
              anvisa: {
                compliant: true,
                lastAudit: new Date(),
                nextAudit: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                issues: [],
              },
              cfm: {
                compliant: true,
                lastAudit: new Date(),
                nextAudit: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
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

          config = await createArchitectureConfig(ctx.supabase, defaultConfig)
        }

        // Validate configuration
        validateArchitectureConfig(config)

        // Log access for compliance
        await ctx.supabase.from('audit_logs').insert({
          clinic_id: ctx.clinicId,
          user_id: ctx.userId,
          action: 'VIEW',
          resource_type: 'ARCHITECTURE_CONFIG',
          resource_id: config.id,
          details: {
            environment,
            operation: 'getConfig',
          },
          created_at: new Date(),
        })

        return config
      } catch (error) {
        console.error('Error getting architecture config:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get architecture configuration',
        })
      }
    }),

  // Create architecture configuration
  createConfig: protectedProcedure
    .input(CreateArchitectureConfigInput)
    .output(ArchitectureConfigOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate input
        const validatedInput = validateArchitectureConfig(input)

        // Check if configuration already exists for this environment
        const existingConfig = await getArchitectureConfig(ctx.supabase, validatedInput.environment)
        if (existingConfig) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Architecture configuration for ${validatedInput.environment} already exists`,
          })
        }

        // Validate healthcare compliance
        if (!validateHealthcareCompliance(validatedInput)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Configuration does not meet healthcare compliance requirements',
          })
        }

        // Validate performance targets
        if (!validatePerformanceTargets(validatedInput.performanceMetrics)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Configuration does not meet performance targets',
          })
        }

        // Validate Bun compatibility
        if (!validateBunCompatibility(validatedInput)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Configuration is not compatible with Bun runtime',
          })
        }

        // Create configuration
        const config = await createArchitectureConfig(ctx.supabase, validatedInput)

        // Log creation for compliance
        await ctx.supabase.from('audit_logs').insert({
          clinic_id: ctx.clinicId,
          user_id: ctx.userId,
          action: 'CREATE',
          resource_type: 'ARCHITECTURE_CONFIG',
          resource_id: config.id,
          details: {
            environment: config.environment,
            operation: 'createConfig',
          },
          created_at: new Date(),
        })

        return config
      } catch (error) {
        console.error('Error creating architecture config:', error)

        if (error instanceof TRPCError) {
          throw error
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create architecture configuration',
        })
      }
    }),

  // Update architecture configuration
  updateConfig: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      update: UpdateArchitectureConfigInput,
    }))
    .output(ArchitectureConfigOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate input
        const validatedUpdate = validateArchitectureConfigUpdate(input.update)

        // Get current configuration
        const currentConfig = await getArchitectureConfig(ctx.supabase, ctx.environment)
        if (!currentConfig || currentConfig.id !== input.id) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Architecture configuration not found',
          })
        }

        // Create updated configuration
        const updatedConfigData = {
          ...currentConfig,
          ...validatedUpdate,
        }

        // Validate updated configuration
        const validatedConfig = validateArchitectureConfig(updatedConfigData)

        // Validate healthcare compliance
        if (!validateHealthcareCompliance(validatedConfig)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Updated configuration does not meet healthcare compliance requirements',
          })
        }

        // Validate performance targets
        if (!validatePerformanceTargets(validatedConfig.performanceMetrics)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Updated configuration does not meet performance targets',
          })
        }

        // Validate Bun compatibility
        if (!validateBunCompatibility(validatedConfig)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Updated configuration is not compatible with Bun runtime',
          })
        }

        // Update configuration
        const updatedConfig = await updateArchitectureConfig(ctx.supabase, input.id, validatedUpdate)

        // Log update for compliance
        await ctx.supabase.from('audit_logs').insert({
          clinic_id: ctx.clinicId,
          user_id: ctx.userId,
          action: 'UPDATE',
          resource_type: 'ARCHITECTURE_CONFIG',
          resource_id: updatedConfig.id,
          details: {
            environment: updatedConfig.environment,
            operation: 'updateConfig',
            changes: validatedUpdate,
          },
          created_at: new Date(),
        })

        return updatedConfig
      } catch (error) {
        console.error('Error updating architecture config:', error)

        if (error instanceof TRPCError) {
          throw error
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update architecture configuration',
        })
      }
    }),

  // Validate architecture configuration
  validateConfig: protectedProcedure
    .input(z.object({
      config: ArchitectureConfigSchema,
    }))
    .output(z.object({
      valid: z.boolean(),
      healthcareCompliance: z.boolean(),
      performanceTargets: z.boolean(),
      bunCompatibility: z.boolean(),
      errors: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const errors: string[] = []

        // Validate configuration schema
        try {
          validateArchitectureConfig(input.config)
        } catch (error) {
          errors.push(`Schema validation: ${error.message}`)
        }

        // Validate healthcare compliance
        const healthcareCompliance = validateHealthcareCompliance(input.config)
        if (!healthcareCompliance) {
          errors.push('Healthcare compliance: Configuration does not meet LGPD, ANVISA, or CFM requirements')
        }

        // Validate performance targets
        const performanceTargets = validatePerformanceTargets(input.config.performanceMetrics)
        if (!performanceTargets) {
          errors.push('Performance targets: Configuration does not meet performance requirements')
        }

        // Validate Bun compatibility
        const bunCompatibility = validateBunCompatibility(input.config)
        if (!bunCompatibility) {
          errors.push('Bun compatibility: Configuration is not compatible with Bun runtime')
        }

        const valid = errors.length === 0

        // Log validation for compliance
        await ctx.supabase.from('audit_logs').insert({
          clinic_id: ctx.clinicId,
          user_id: ctx.userId,
          action: 'VALIDATE',
          resource_type: 'ARCHITECTURE_CONFIG',
          resource_id: input.config.id,
          details: {
            environment: input.config.environment,
            operation: 'validateConfig',
            valid,
            errors,
          },
          created_at: new Date(),
        })

        return {
          valid,
          healthcareCompliance,
          performanceTargets,
          bunCompatibility,
          errors,
        }
      } catch (error) {
        console.error('Error validating architecture config:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to validate architecture configuration',
        })
      }
    }),

  // Get architecture configuration history
  getConfigHistory: protectedProcedure
    .input(z.object({
      environment: z.enum(['development', 'staging', 'production']).optional(),
    }))
    .output(z.array(ArchitectureConfigOutput))
    .query(async ({ ctx, input }) => {
      try {
        const environment = input?.environment || ctx.environment

        // Get audit logs for this environment
        const { data: auditLogs, error } = await ctx.supabase
          .from('audit_logs')
          .select('*')
          .eq('clinic_id', ctx.clinicId)
          .eq('resource_type', 'ARCHITECTURE_CONFIG')
          .order('created_at', { ascending: false })

        if (error) {
          throw new Error(`Failed to get audit logs: ${error.message}`)
        }

        // Get current configuration
        const currentConfig = await getArchitectureConfig(ctx.supabase, environment)

        // Return history (simplified for now)
        return currentConfig ? [currentConfig] : []
      } catch (error) {
        console.error('Error getting architecture config history:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get architecture configuration history',
        })
      }
    }),
})
