/**
 * tRPC Router Configuration
 * Enhanced with healthcare compliance middleware and audit logging
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';
import superjson from 'superjson';
import { AuditAction, ResourceType, AuditStatus, RiskLevel } from '@prisma/client';

/**
 * Initialize tRPC with superjson transformer for enhanced type support
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && error.cause.name === 'ZodError'
            ? error.cause.message
            : null,
      },
    };
  },
});

/**
 * LGPD Audit Middleware
 * Logs all patient data operations for compliance with Brazilian data protection laws
 */const auditMiddleware = t.middleware(async ({ ctx, next, path, type }) => {
  const start = Date.now();
  
  try {
    const result = await next();
    
    // Log successful operations
    if (ctx.userId && (path.includes('patients') || path.includes('appointments'))) {
      await ctx.prisma.auditTrail.create({
        data: {
          userId: ctx.userId,
          clinicId: ctx.clinicId,
          action: type === 'query' ? AuditAction.VIEW : AuditAction.CREATE,
          resource: path,
          resourceType: path.includes('patients') ? ResourceType.PATIENT_RECORD : ResourceType.SYSTEM_CONFIG,
          ipAddress: ctx.auditMeta.ipAddress,
          userAgent: ctx.auditMeta.userAgent,
          sessionId: ctx.auditMeta.sessionId,
          status: AuditStatus.SUCCESS,
          riskLevel: RiskLevel.LOW,
          additionalInfo: JSON.stringify({
            duration: Date.now() - start,
            path,
            type,
          }),
        },
      });
    }
    
    return result;
  } catch (error) {
    // Log failed operations
    if (ctx.userId) {
      await ctx.prisma.auditTrail.create({
        data: {
          userId: ctx.userId,
          clinicId: ctx.clinicId,
          action: type === 'query' ? AuditAction.VIEW : AuditAction.CREATE,
          resource: path,          resourceType: path.includes('patients') ? ResourceType.PATIENT_RECORD : ResourceType.SYSTEM_CONFIG,
          ipAddress: ctx.auditMeta.ipAddress,
          userAgent: ctx.auditMeta.userAgent,
          sessionId: ctx.auditMeta.sessionId,
          status: AuditStatus.FAILED,
          riskLevel: RiskLevel.MEDIUM,
          additionalInfo: JSON.stringify({
            duration: Date.now() - start,
            path,
            type,
            error: error instanceof Error ? error.message : 'Unknown error',
          }),
        },
      });
    }
    
    throw error;
  }
});

/**
 * Authentication middleware
 * Ensures user is authenticated for protected procedures
 */
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  
  return next();
});

/**
 * LGPD Consent middleware
 * Verifies patient consent before data operations
 */const consentMiddleware = t.middleware(async ({ ctx, next, input }) => {
  // For patient data operations, verify LGPD consent
  if (input && typeof input === 'object' && 'patientId' in input) {
    const patientId = input.patientId as string;
    
    const consent = await ctx.prisma.consentRecord.findFirst({
      where: {
        patientId,
        consentType: 'data_processing',
        status: 'active',
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    
    if (!consent) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Valid LGPD consent required for patient data operations',
      });
    }
  }
  
  return next();
});

// Export procedure types
export const router = t.router;
export const publicProcedure = t.procedure.use(auditMiddleware);
export const protectedProcedure = t.procedure.use(auditMiddleware).use(authMiddleware);
export const patientProcedure = t.procedure.use(auditMiddleware).use(authMiddleware).use(consentMiddleware);