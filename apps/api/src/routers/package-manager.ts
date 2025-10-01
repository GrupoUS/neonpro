/**
 * Package Manager Router
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc.js'
import {
  PackageManagerConfigSchema,
  type PackageManagerConfig,
  createPackageManagerConfig,
  getPackageManagerConfig,
  getPackageManagerConfigByPackageManager,
  updatePackageManagerConfig,
  deletePackageManagerConfig,
  validatePackageManagerConfig,
  validateBunPerformance,
  getBunOptimizations,
  isBunOptimized,
  getPerformanceMetrics as getPackageManagerPerformanceMetrics,
  getSecurityConfiguration,
} from '@neonpro/database'

// Create package manager router
export const packageManagerRouter = createTRPCRouter({
  // Get package manager configuration by ID
  getConfig: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      try {
        const config = await getPackageManagerConfig(input.id)
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

  // Get package manager configuration by package manager
  getConfigByPackageManager: publicProcedure
    .input(z.object({
      packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun']),
    }))
    .query(async ({ input }) => {
      try {
        const config = await getPackageManagerConfigByPackageManager(input.packageManager)
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

  // Create package manager configuration
  createConfig: protectedProcedure
    .input(PackageManagerConfigSchema.omit({ id: true, createdAt: true, updatedAt: true }))
    .mutation(async ({ input }) => {
      try {
        const config = await createPackageManagerConfig(input)
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

  // Update package manager configuration
  updateConfig: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      update: z.object({
        name: z.string().min(1, 'Name is required').optional(),
        packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun']).optional(),
        buildPerformance: z.object({
          buildTime: z.number().min(0, 'Build time must be non-negative').optional(),
          bundleSize: z.object({
            main: z.number().min(0, 'Main bundle size must be non-negative').optional(),
            vendor: z.number().min(0, 'Vendor bundle size must be non-negative').optional(),
            total: z.number().min(0, 'Total bundle size must be non-negative').optional(),
          }).optional(),
          timestamp: z.date().optional(),
        }).optional(),
        bundleSize: z.object({
          main: z.number().min(0, 'Main bundle size must be non-negative').optional(),
          vendor: z.number().min(0, 'Vendor bundle size must be non-negative').optional(),
          total: z.number().min(0, 'Total bundle size must be non-negative').optional(),
          timestamp: z.date().optional(),
        }).optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      try {
        const config = await updatePackageManagerConfig(input.id, input.update)
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

  // Delete package manager configuration
  deleteConfig: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      try {
        await deletePackageManagerConfig(input.id)
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

  // Validate package manager configuration
  validateConfig: publicProcedure
    .input(z.object({
      config: z.any(),
    }))
    .query(({ input }) => {
      try {
        const validation = validatePackageManagerConfig(input.config)
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

  // Validate Bun performance
  validateBunPerformance: publicProcedure
    .input(z.object({
      config: z.any(),
    }))
    .query(({ input }) => {
      try {
        const validation = validateBunPerformance(input.config)
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

  // Get Bun optimizations
  getBunOptimizations: publicProcedure
    .input(z.object({
      config: z.any(),
    }))
    .query(({ input }) => {
      try {
        const optimizations = getBunOptimizations(input.config)
        return {
          success: true,
          data: optimizations,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Check if configuration is Bun optimized
  isBunOptimized: publicProcedure
    .input(z.object({
      config: z.any(),
    }))
    .query(({ input }) => {
      try {
        const isOptimized = isBunOptimized(input.config)
        return {
          success: true,
          data: { isOptimized },
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Get performance metrics
  getPerformanceMetrics: publicProcedure
    .input(z.object({
      config: z.any(),
    }))
    .query(({ input }) => {
      try {
        const metrics = getPackageManagerPerformanceMetrics(input.config)
        return {
          success: true,
          data: metrics,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Get security configuration
  getSecurityConfiguration: publicProcedure
    .input(z.object({
      config: z.any(),
    }))
    .query(({ input }) => {
      try {
        const security = getSecurityConfiguration(input.config)
        return {
          success: true,
          data: security,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Get package manager summary
  getSummary: publicProcedure
    .input(z.object({
      packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun']),
    }))
    .query(async ({ input }) => {
      try {
        const config = await getPackageManagerConfigByPackageManager(input.packageManager)

        if (!config) {
          return {
            success: false,
            error: 'Package manager configuration not found',
          }
        }

        // Validate configuration
        const validation = validatePackageManagerConfig(config)

        // Validate Bun performance
        const bunPerformance = validateBunPerformance(config)

        // Get Bun optimizations
        const bunOptimizations = getBunOptimizations(config)

        // Get performance metrics
        const performanceMetrics = getPackageManagerPerformanceMetrics(config)

        // Get security configuration
        const securityConfiguration = getSecurityConfiguration(config)

        return {
          success: true,
          data: {
            packageManager: config.packageManager,
            name: config.name,
            validation,
            bunPerformance,
            bunOptimizations,
            performanceMetrics,
            securityConfiguration,
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
