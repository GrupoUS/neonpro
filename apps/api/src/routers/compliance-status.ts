/**
 * Compliance Status Router
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc.js'
import {
  ComplianceFrameworkSchema,
  WCAGComplianceSchema,
  ComplianceStatusSchema,
  createComplianceStatus,
  getComplianceStatus,
  updateComplianceStatus,
  deleteComplianceStatus,
  validateComplianceStatus,
  validateHealthcareCompliance as validateComplianceHealthcareCompliance,
  runComplianceCheck,
  getComplianceChecks,
  getComplianceIssues,
  getComplianceScore,
  isComplianceReviewNeeded,
} from '@neonpro/database'

// Create compliance status router
export const complianceStatusRouter = createTRPCRouter({
  // Get compliance status by environment
  getStatus: publicProcedure
    .input(z.object({
      environment: z.enum(['development', 'staging', 'production']),
    }))
    .query(async ({ input }) => {
      try {
        const status = await getComplianceStatus(input.environment)
        return {
          success: true,
          data: status,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Create compliance status
  createStatus: protectedProcedure
    .input(ComplianceStatusSchema.omit({ id: true, createdAt: true, updatedAt: true }))
    .mutation(async ({ input }) => {
      try {
        const status = await createComplianceStatus(input)
        return {
          success: true,
          data: status,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Update compliance status
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      update: z.object({
        name: z.string().min(1, 'Name is required').optional(),
        lgpd: ComplianceFrameworkSchema.partial().optional(),
        anvisa: ComplianceFrameworkSchema.partial().optional(),
        cfm: ComplianceFrameworkSchema.partial().optional(),
        wcag: WCAGComplianceSchema.partial().optional(),
        overallScore: z.number().min(0).max(100, 'Overall score must be between 0 and 100').optional(),
        lastUpdated: z.date().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      try {
        const status = await updateComplianceStatus(input.id, input.update)
        return {
          success: true,
          data: status,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Delete compliance status
  deleteStatus: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      try {
        await deleteComplianceStatus(input.id)
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

  // Validate compliance status
  validateStatus: publicProcedure
    .input(z.object({
      status: z.any(),
    }))
    .query(({ input }) => {
      try {
        const validation = validateComplianceStatus(input.status)
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
      status: z.any(),
    }))
    .query(({ input }) => {
      try {
        const validation = validateComplianceHealthcareCompliance(input.status)
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

  // Run compliance check
  runCheck: protectedProcedure
    .input(z.object({
      statusId: z.string().uuid(),
      framework: z.enum(['LGPD', 'ANVISA', 'CFM', 'WCAG']),
      checkType: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await runComplianceCheck(input.statusId, input.framework, input.checkType)
        return {
          success: true,
          data: result,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Get compliance checks
  getChecks: publicProcedure
    .input(z.object({
      statusId: z.string().uuid(),
      framework: z.enum(['LGPD', 'ANVISA', 'CFM', 'WCAG']).optional(),
      limit: z.number().min(1).max(1000).default(100),
    }))
    .query(async ({ input }) => {
      try {
        const checks = await getComplianceChecks(input.statusId, input.framework, input.limit)
        return {
          success: true,
          data: checks,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Get compliance issues
  getIssues: publicProcedure
    .input(z.object({
      statusId: z.string().uuid(),
      framework: z.enum(['LGPD', 'ANVISA', 'CFM', 'WCAG']).optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      limit: z.number().min(1).max(1000).default(100),
    }))
    .query(async ({ input }) => {
      try {
        const issues = await getComplianceIssues(input.statusId, input.framework, input.severity, input.limit)
        return {
          success: true,
          data: issues,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Get compliance score
  getScore: publicProcedure
    .input(z.object({
      statusId: z.string().uuid(),
      framework: z.enum(['LGPD', 'ANVISA', 'CFM', 'WCAG']),
    }))
    .query(async ({ input }) => {
      try {
        const score = await getComplianceScore(input.statusId, input.framework)
        return {
          success: true,
          data: score,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Check if compliance review is needed
  isReviewNeeded: publicProcedure
    .input(z.object({
      statusId: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      try {
        const review = await isComplianceReviewNeeded(input.statusId)
        return {
          success: true,
          data: review,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  // Get compliance summary
  getSummary: publicProcedure
    .input(z.object({
      environment: z.enum(['development', 'staging', 'production']),
    }))
    .query(async ({ input }) => {
      try {
        const status = await getComplianceStatus(input.environment)

        if (!status) {
          return {
            success: false,
            error: 'Compliance status not found',
          }
        }

        // Validate healthcare compliance
        const healthcareCompliance = validateComplianceHealthcareCompliance(status)

        // Get compliance scores
        const lgpdScore = await getComplianceScore(status.id, 'LGPD')
        const anvisaScore = await getComplianceScore(status.id, 'ANVISA')
        const cfmScore = await getComplianceScore(status.id, 'CFM')
        const wcagScore = await getComplianceScore(status.id, 'WCAG')

        // Check if review is needed
        const reviewNeeded = await isComplianceReviewNeeded(status.id)

        // Get recent checks
        const recentChecks = await getComplianceChecks(status.id, undefined, 5)

        // Get open issues
        const openIssues = await getComplianceIssues(status.id, undefined, undefined, 10)

        return {
          success: true,
          data: {
            environment: status.environment,
            healthcareCompliance,
            scores: {
              lgpd: lgpdScore,
              anvisa: anvisaScore,
              cfm: cfmScore,
              wcag: wcagScore,
            },
            overallScore: status.overallScore,
            reviewNeeded,
            recentChecks,
            openIssues,
            lastUpdated: status.updatedAt,
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
