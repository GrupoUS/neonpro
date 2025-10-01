/**
 * Performance Metrics Router
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc.js'
import {
  EdgePerformanceSchema,
  RealtimePerformanceSchema,
  AIPerformanceSchema,
  BuildPerformanceSchema,
  SystemPerformanceSchema,
  PerformanceMetricsSchema,
  createPerformanceMetrics,
  getPerformanceMetrics,
  updatePerformanceMetrics,
  deletePerformanceMetrics,
  validatePerformanceMetrics,
  validateTTFBTarget,
  validateColdStartTarget,
  validateRealtimePerformance,
  recordMetric,
  getMetricsHistory,
} from '@neonpro/database'

// Create performance metrics router
export const performanceMetricsRouter = createTRPCRouter({
  // Get performance metrics by environment
  getMetrics: publicProcedure
    .input(z.object({
      environment: z.enum(['development', 'staging', 'production']),
    }))
    .query(async ({ input }) => {
      try {
        const metrics = await getPerformanceMetrics(input.environment)
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

  // Create performance metrics
  createMetrics: protectedProcedure
    .input(PerformanceMetricsSchema.omit({ id: true, createdAt: true, updatedAt: true }))
    .mutation(async ({ input }) => {
      try {
        const metrics = await createPerformanceMetrics(input)
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

  // Update performance metrics
  updateMetrics: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      update: z.object({
        name: z.string().min(1, 'Name is required').optional(),
        edgePerformance: EdgePerformanceSchema.partial().optional(),
        realtimePerformance: RealtimePerformanceSchema.partial().optional(),
        aiPerformance: AIPerformanceSchema.partial().optional(),
        buildPerformance: BuildPerformanceSchema.partial().optional(),
        systemPerformance: SystemPerformanceSchema.partial().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      try {
        const metrics = await updatePerformanceMetrics(input.id, input.update)
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

  // Delete performance metrics
  deleteMetrics: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      try {
        await deletePerformanceMetrics(input.id)
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

  // Validate performance metrics
  validateMetrics: publicProcedure
    .input(z.object({
      metrics: z.any(),
    }))
    .query(({ input }) => {
      try {
        const validation = validatePerformanceMetrics(input.metrics)
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

  // Validate TTFB target
  validateTTFBTarget: publicProcedure
    .input(z.object({
      metrics: z.any(),
      target: z.number().min(0, 'Target must be non-negative'),
    }))
    .query(({ input }) => {
      try {
        const validation = validateTTFBTarget(input.metrics, input.target)
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

  // Validate cold start target
  validateColdStartTarget: publicProcedure
    .input(z.object({
      metrics: z.any(),
      target: z.number().min(0).max(100, 'Target must be between 0 and 100'),
    }))
    .query(({ input }) => {
      try {
        const validation = validateColdStartTarget(input.metrics, input.target)
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

  // Validate real-time performance
  validateRealtimePerformance: publicProcedure
    .input(z.object({
      metrics: z.any(),
      targets: z.object({
        uiPatchTime: z.number().min(0, 'UI patch time must be non-negative'),
        connectionLatency: z.number().min(0, 'Connection latency must be non-negative'),
        messageDeliveryTime: z.number().min(0, 'Message delivery time must be non-negative'),
      }),
    }))
    .query(({ input }) => {
      try {
        const validation = validateRealtimePerformance(input.metrics, input.targets)
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

  // Record metric
  recordMetric: protectedProcedure
    .input(z.object({
      metricsId: z.string().uuid(),
      metricType: z.enum(['edgePerformance', 'realtimePerformance', 'aiPerformance', 'buildPerformance', 'systemPerformance']),
      metric: z.any(),
    }))
    .mutation(async ({ input }) => {
      try {
        await recordMetric(input.metricsId, input.metricType, input.metric)
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

  // Get metrics history
  getMetricsHistory: publicProcedure
    .input(z.object({
      metricsId: z.string().uuid(),
      metricType: z.enum(['edgePerformance', 'realtimePerformance', 'aiPerformance', 'buildPerformance', 'systemPerformance']),
      limit: z.number().min(1).max(1000).default(100),
    }))
    .query(async ({ input }) => {
      try {
        const history = await getMetricsHistory(input.metricsId, input.metricType, input.limit)
        return {
          success: true,
          data: history,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Get performance summary
  getSummary: publicProcedure
    .input(z.object({
      environment: z.enum(['development', 'staging', 'production']),
    }))
    .query(async ({ input }) => {
      try {
        const metrics = await getPerformanceMetrics(input.environment)

        if (!metrics) {
          return {
            success: false,
            error: 'Performance metrics not found',
          }
        }

        // Validate TTFB target
        const ttfbValidation = validateTTFBTarget(metrics, 100)

        // Validate cold start target
        const coldStartValidation = validateColdStartTarget(metrics, 5)

        // Validate real-time performance
        const realtimeValidation = validateRealtimePerformance(metrics, {
          uiPatchTime: 1500,
          connectionLatency: 200,
          messageDeliveryTime: 100,
        })

        // Calculate overall score
        const ttfbScore = ttfbValidation.isValid ? 100 : Math.max(0, 100 - (100 - ttfbValidation.actualTTFB))
        const coldStartScore = coldStartValidation.isValid ? 100 : Math.max(0, 100 - (coldStartValidation.actualColdStartFrequency - coldStartValidation.targetColdStartFrequency))
        const realtimeScore = realtimeValidation.isValid ? 100 : Math.max(0, 100 - (realtimeValidation.uiPatchTime.actual - realtimeValidation.uiPatchTime.target))
        const overallScore = Math.round((ttfbScore + coldStartScore + realtimeScore) / 3)

        return {
          success: true,
          data: {
            environment: metrics.environment,
            ttfbValidation,
            coldStartValidation,
            realtimeValidation,
            overallScore,
            lastUpdated: metrics.updatedAt,
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
