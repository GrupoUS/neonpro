/**
 * Enhanced Prisma RLS Middleware for Healthcare Platform
 *
 * Integrates Prisma client with Row Level Security (RLS) for multi-tenant
 * healthcare data isolation. Provides context injection, access control,
 * and audit trail integration.
 */

import { Context, Next } from 'hono';
import {
  createHealthcareContextFromRequest,
  createPrismaWithContext,
  HealthcareComplianceError,
  type HealthcareContext,
  type HealthcarePrismaClient,
  UnauthorizedHealthcareAccessError,
} from '../clients/prisma';
import { healthcareRLS } from '../clients/supabase.js';
import { logger } from '@/utils/secure-logger';

// Middleware configuration options
interface PrismaRLSOptions {
  requireAuth?: boolean;
  requireClinicAccess?: boolean;
  requiredRole?: HealthcareContext['role'];
  requiredPermissions?: string[];
  logAccess?: boolean;
  validateCFM?: boolean; // Brazilian healthcare professional validation
}

// Request context extensions
interface HealthcareRequestContext {
  prisma: HealthcarePrismaClient;
  healthcareContext: HealthcareContext;
  userId: string;
  clinicId: string;
  userRole: HealthcareContext['role'];
  permissions: string[];
  cfmValidated: boolean;
}

/**
 * Enhanced Prisma RLS middleware with healthcare-specific features
 */
export function prismaRLSMiddleware(options: PrismaRLSOptions = {}) {
  const {
    requireAuth = true,
    requireClinicAccess = true,
    requiredRole,
    requiredPermissions = [],
    logAccess = true,
    validateCFM = false,
  } = options;

  return async (c: Context, next: Next) => {
    try {
      // Extract authentication information
      const userId = c.get('userId') || c.req.header('x-user-id');
      const clinicId = c.get('clinicId') || c.req.header('x-clinic-id');
      const userRole = c.get('userRole')
        || (c.req.header('x-user-role') as HealthcareContext['role']);
      const permissions = c.get('permissions') || [];
      const cfmValidated = c.get('cfmValidated') || false;

      // Validate authentication requirements
      if (requireAuth && !userId) {
        return c.json(
          {
            error: 'Authentication required',
            code: 'AUTH_REQUIRED',
            message: 'User authentication is required to access this resource',
          },
          401,
        );
      }

      if (requireClinicAccess && !clinicId) {
        return c.json(
          {
            error: 'Clinic context required',
            code: 'CLINIC_CONTEXT_REQUIRED',
            message: 'Clinic context is required for this operation',
          },
          400,
        );
      }

      // Validate role requirements
      if (requiredRole && userRole !== requiredRole) {
        return c.json(
          {
            error: 'Insufficient role permissions',
            code: 'ROLE_PERMISSION_DENIED',
            message: `Role '${requiredRole}' required, but user has '${userRole}'`,
          },
          403,
        );
      }

      // Validate specific permissions
      if (requiredPermissions.length > 0) {
        const hasRequiredPermissions = requiredPermissions.every(permission =>
          permissions.includes(permission)
        );

        if (!hasRequiredPermissions) {
          return c.json(
            {
              error: 'Insufficient permissions',
              code: 'PERMISSION_DENIED',
              message: `Required permissions: ${requiredPermissions.join(', ')}`,
            },
            403,
          );
        }
      }

      // Validate CFM (Brazilian healthcare professional license) if required
      if (validateCFM && userRole === 'professional' && !cfmValidated) {
        return c.json(
          {
            error: 'CFM validation required',
            code: 'CFM_VALIDATION_REQUIRED',
            message: 'Brazilian healthcare professional license validation required',
          },
          403,
        );
      }

      // Validate clinic access using existing Supabase RLS
      if (requireClinicAccess && userId && clinicId) {
        const hasClinicAccess = await healthcareRLS.canAccessClinic(
          userId,
          clinicId,
        );

        if (!hasClinicAccess) {
          return c.json(
            {
              error: 'Clinic access denied',
              code: 'CLINIC_ACCESS_DENIED',
              message: 'User does not have access to the specified clinic',
            },
            403,
          );
        }
      }

      // Create healthcare context
      const healthcareContext = createHealthcareContextFromRequest(
        userId,
        clinicId,
        userRole,
        {
          permissions,
          cfmValidated,
        },
      );

      // Create Prisma client with healthcare context
      const prismaWithContext = createPrismaWithContext(healthcareContext);

      // Validate the context with the Prisma client
      const isContextValid = await prismaWithContext.validateContext();
      if (!isContextValid) {
        return c.json(
          {
            error: 'Healthcare context validation failed',
            code: 'CONTEXT_VALIDATION_FAILED',
            message: 'Unable to validate healthcare access context',
          },
          403,
        );
      }

      // Store healthcare context and Prisma client in Hono context
      c.set('prisma', prismaWithContext);
      c.set('healthcareContext', healthcareContext);
      c.set('userId', userId);
      c.set('clinicId', clinicId);
      c.set('userRole', userRole);
      c.set('permissions', permissions);
      c.set('cfmValidated', cfmValidated);

      // Log access for audit trail
      if (logAccess && userId) {
        try {
          await prismaWithContext.createAuditLog(
            'ACCESS',
            'API_ENDPOINT',
            `${c.req.method}:${c.req.path}`,
            {
              method: c.req.method,
              path: c.req.path,
              query: c.req.query(),
              ipAddress: c.req.header('x-forwarded-for')
                || c.req.header('x-real-ip')
                || 'unknown',
              userAgent: c.req.header('user-agent') || 'unknown',
              referer: c.req.header('referer'),
              clinicId,
              userRole,
              permissions,
              timestamp: new Date().toISOString(),
            },
          );
        } catch (auditError) {
          logger.error('Audit logging failed', auditError);
          // Don't fail the request if audit logging fails
        }
      }

      // Continue to next middleware/handler
      await next();
    } catch (error) {
      logger.error('Prisma RLS middleware error', error);

      // Handle specific healthcare compliance errors
      if (error instanceof HealthcareComplianceError) {
        return c.json(
          {
            error: 'Healthcare compliance violation',
            code: error.code,
            framework: error.complianceFramework,
            message: error.message,
          },
          403,
        );
      }

      if (error instanceof UnauthorizedHealthcareAccessError) {
        return c.json(
          {
            error: 'Unauthorized healthcare access',
            resourceType: error.resourceType,
            resourceId: error.resourceId,
            message: error.message,
          },
          403,
        );
      }

      // Generic error handling
      return c.json(
        {
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred during request processing',
        },
        500,
      );
    }
  };
}

/**
 * Specialized middleware for patient data access
 */
export function patientAccessMiddleware(
  options: Omit<PrismaRLSOptions, 'requireClinicAccess'> = {},
) {
  return prismaRLSMiddleware({
    ...options,
    requireClinicAccess: true,
    requiredPermissions: [
      'patient_read',
      ...(options.requiredPermissions || []),
    ],
  });
}

/**
 * Specialized middleware for professional operations
 */
export function professionalAccessMiddleware(
  options: Omit<PrismaRLSOptions, 'validateCFM'> = {},
) {
  return prismaRLSMiddleware({
    ...options,
    requiredRole: 'professional',
    validateCFM: true,
    requiredPermissions: [
      'professional_operations',
      ...(options.requiredPermissions || []),
    ],
  });
}

/**
 * Specialized middleware for clinic administration
 */
export function clinicAdminMiddleware(options: PrismaRLSOptions = {}) {
  return prismaRLSMiddleware({
    ...options,
    requiredRole: 'admin',
    requiredPermissions: [
      'clinic_admin',
      ...(options.requiredPermissions || []),
    ],
  });
}

/**
 * LGPD data operations middleware (requires special permissions)
 */
export function lgpdOperationsMiddleware(options: PrismaRLSOptions = {}) {
  return prismaRLSMiddleware({
    ...options,
    requiredPermissions: [
      'lgpd_operations',
      'data_export',
      ...(options.requiredPermissions || []),
    ],
    logAccess: true, // Always log LGPD operations
  });
}

/**
 * Helper function to extract healthcare context from Hono context
 */
export function getHealthcareContext(c: Context): HealthcareRequestContext {
  const prisma = c.get('prisma') as HealthcarePrismaClient;
  const healthcareContext = c.get('healthcareContext') as HealthcareContext;
  const userId = c.get('userId') as string;
  const clinicId = c.get('clinicId') as string;
  const userRole = c.get('userRole') as HealthcareContext['role'];
  const permissions = c.get('permissions') as string[];
  const cfmValidated = c.get('cfmValidated') as boolean;

  return {
    prisma,
    healthcareContext,
    userId,
    clinicId,
    userRole,
    permissions,
    cfmValidated,
  };
}

// Export types for use in other modules
export type { HealthcareRequestContext, PrismaRLSOptions };
