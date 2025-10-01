/**
 * Architecture Router
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc.js'
import {
  ArchitectureConfigSchema,
  type ArchitectureConfig,
  createArchitectureConfig,
  getArchitectureConfig,
  updateArchitectureConfig,
  deleteArchitectureConfig,
  validateArchitectureConfig,
  validateHealthcareCompliance,
  validatePerformanceTargets,
} from '@neonpro/database'

// Create architecture router
export const architectureRouter = createTRPCRouter({
  // Get architecture configuration by environment
  getConfig: publicProcedure
    .input(z.object({
      environment: z.enum(['development', 'staging', 'production']),
    }))
    .query(async ({ input }) => {
      try {
        const config = await getArchitectureConfig(input.environment, 'development')
        return {
          success: true,
          data: config,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Create architecture configuration
  createConfig: protectedProcedure
    .input(ArchitectureConfigSchema.omit({ id: true, createdAt: true, updatedAt: true }))
    .mutation(async ({ input, ctx }: any) => {
      try {
        const config = await createArchitectureConfig(ctx.supabase, input)
        return {
          success: true,
          data: config,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Update architecture configuration
  updateConfig: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      update: z.object({
        name: z.string().min(1, 'Name is required').optional(),
        edgeEnabled: z.boolean().optional(),
        supabaseFunctionsEnabled: z.boolean().optional(),
        bunEnabled: z.boolean().optional(),
        performanceMetrics: z.object({
          edgeTTFB: z.number().min(0, 'Edge TTFB must be non-negative').optional(),
          realtimeUIPatch: z.number().min(0, 'Real-time UI patch must be non-negative').optional(),
          copilotToolRoundtrip: z.number().min(0, 'Copilot tool roundtrip must be non-negative').optional(),
          buildTime: z.number().min(0, 'Build time must be non-negative').optional(),
          bundleSize: z.object({
            main: z.number().min(0, 'Main bundle size must be non-negative').optional(),
            vendor: z.number().min(0, 'Vendor bundle size must be non-negative').optional(),
            total: z.number().min(0, 'Total bundle size must be non-negative').optional(),
          }).optional(),
          uptime: z.number().min(0).max(100, 'Uptime must be between 0 and 100').optional(),
          timestamp: z.date().optional(),
        }).optional(),
        complianceStatus: z.object({
          lgpd: z.object({
            compliant: z.boolean().optional(),
            lastAudit: z.date().optional(),
            nextAudit: z.date().optional(),
            issues: z.array(z.string()).optional(),
          }).optional(),
          anvisa: z.object({
            compliant: z.boolean().optional(),
            lastAudit: z.date().optional(),
            nextAudit: z.date().optional(),
            issues: z.array(z.string()).optional(),
          }).optional(),
          cfm: z.object({
            compliant: z.boolean().optional(),
            lastAudit: z.date().optional(),
            nextAudit: z.date().optional(),
            issues: z.array(z.string()).optional(),
          }).optional(),
          wcag: z.object({
            level: z.string().default('2.1 AA+').optional(),
            compliant: z.boolean().optional(),
            lastAudit: z.date().optional(),
            issues: z.array(z.string()).optional(),
          }).optional(),
          timestamp: z.date().optional(),
        }).optional(),
      }),
    }))
    .mutation(async ({ input, ctx }: any) => {
      try {
        const config = await updateArchitectureConfig(ctx.supabase, input.id, input.update)
        return {
          success: true,
          data: config,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Delete architecture configuration
  deleteConfig: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }: any) => {
      try {
        await deleteArchitectureConfig(ctx.supabase, input.id)
        return {
          success: true,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Validate architecture configuration
  validateConfig: publicProcedure
    .input(z.object({
      config: z.any(),
    }))
    .query(({ input }) => {
      try {
        const validation = validateArchitectureConfig(input.config)
        return {
          success: true,
          data: validation,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Validate healthcare compliance
  validateHealthcareCompliance: publicProcedure
    .input(z.object({
      config: z.any(),
    }))
    .query(({ input }) => {
      try {
        const validation = validateHealthcareCompliance(input.config)
        return {
          success: true,
          data: validation,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Validate performance targets
  validatePerformanceTargets: publicProcedure
    .input(z.object({
      performanceMetrics: z.any(),
    }))
    .query(({ input }) => {
      try {
        const validation = validatePerformanceTargets(input.performanceMetrics)
        return {
          success: true,
          data: validation,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Get architecture summary
  getSummary: publicProcedure
    .input(z.object({
      environment: z.enum(['development', 'staging', 'production']),
    }))
    .query(async ({ input }) => {
      try {
        const config = await getArchitectureConfig(input.environment, 'development')

        if (!config) {
          return {
            success: false,
            error: 'Architecture configuration not found',
          }
        }

        // Validate healthcare compliance
        const healthcareCompliance = validateHealthcareCompliance(config)

        // Validate performance targets
        const performanceTargets = validatePerformanceTargets(config.performanceMetrics)

        // Calculate overall score
        const healthcareScore = healthcareCompliance ? 100 : 0
        const performanceScore = performanceTargets ? 100 : 0
        const overallScore = Math.round((healthcareScore + performanceScore) / 2)

        return {
          success: true,
          data: {
            environment: config.environment,
            edgeEnabled: config.edgeEnabled,
            supabaseFunctionsEnabled: config.supabaseFunctionsEnabled,
            bunEnabled: config.bunEnabled,
            healthcareCompliance,
            performanceTargets,
            overallScore,
            lastUpdated: config.updatedAt,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),
})
