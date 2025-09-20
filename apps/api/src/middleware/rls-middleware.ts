import { Context, Next } from 'hono';
import { healthcareRLS, RLSQueryBuilder } from '../lib/supabase-client';

export interface RLSMiddlewareOptions {
  requireRLS?: boolean; // Force RLS usage
  allowBypass?: boolean; // Allow RLS bypass for admin operations
  logAccess?: boolean; // Log data access for audit
}

/**
 * RLS (Row Level Security) Middleware
 * Provides RLS-aware database access and user context management
 */
export function rlsMiddleware(options: RLSMiddlewareOptions = {}) {
  return async (c: Context, next: Next) => {
    try {
      // Extract user information from request context
      // This would typically come from your authentication middleware
      const userId = c.get('userId') || c.req.header('x-user-id');
      const userRole = c.get('userRole') || c.req.header('x-user-role');
      const clinicId = c.get('clinicId') || c.req.header('x-clinic-id');

      if (!userId && options.requireRLS) {
        return c.json(
          {
            error: 'User authentication required for RLS-protected resources',
            code: 'RLS_AUTH_REQUIRED',
          },
          401,
        );
      }

      // Create RLS-aware query builder
      const rlsQuery = new RLSQueryBuilder(userId, userRole);

      // Store RLS utilities in context for route handlers
      c.set('rlsQuery', rlsQuery);
      c.set('healthcareRLS', healthcareRLS);
      c.set('userId', userId);
      c.set('userRole', userRole);
      c.set('clinicId', clinicId);

      // Log access if required
      if (options.logAccess && userId) {
        const accessLog = {
          timestamp: new Date().toISOString(),
          userId,
          userRole,
          clinicId,
          method: c.req.method,
          path: c.req.path,
          ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
          userAgent: c.req.header('user-agent'),
        };

        console.log('RLS Access Log:', JSON.stringify(accessLog));
      }

      return next();
    } catch (error) {
      console.error('RLS middleware error:', error);
      return c.json(
        {
          error: 'RLS middleware error',
          code: 'RLS_MIDDLEWARE_ERROR',
        },
        500,
      );
    }
  };
}

/**
 * Healthcare-specific RLS middleware configurations
 */
export const rlsHealthcareMiddleware = {
  /**
   * For patient data access - requires RLS
   */
  patientAccess: rlsMiddleware({
    requireRLS: true,
    logAccess: true,
  }),

  /**
   * For appointment management - requires RLS
   */
  appointmentAccess: rlsMiddleware({
    requireRLS: true,
    logAccess: true,
  }),

  /**
   * For administrative operations - allows RLS bypass
   */
  adminAccess: rlsMiddleware({
    requireRLS: false,
    allowBypass: true,
    logAccess: true,
  }),

  /**
   * For public/anonymous access - no RLS requirement
   */
  publicAccess: rlsMiddleware({
    requireRLS: false,
    logAccess: false,
  }),
};

/**
 * Clinic access validation middleware
 * Ensures user has access to the specified clinic
 */
export function clinicAccessMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      const userId = c.get('userId');
      const clinicId = c.req.param('clinicId') || c.req.query('clinicId');
      const healthcareRLS = c.get('healthcareRLS');

      if (!userId) {
        return c.json(
          {
            error: 'User authentication required',
            code: 'AUTH_REQUIRED',
          },
          401,
        );
      }

      if (!clinicId) {
        return c.json(
          {
            error: 'Clinic ID is required',
            code: 'CLINIC_ID_REQUIRED',
          },
          400,
        );
      }

      // Check if user has access to this clinic
      const hasAccess = await healthcareRLS.canAccessClinic(userId, clinicId);

      if (!hasAccess) {
        return c.json(
          {
            error: 'Access denied to clinic',
            code: 'CLINIC_ACCESS_DENIED',
            clinicId,
          },
          403,
        );
      }

      // Store clinic ID in context
      c.set('clinicId', clinicId);

      return next();
    } catch (error) {
      console.error('Clinic access middleware error:', error);
      return c.json(
        {
          error: 'Clinic access validation error',
          code: 'CLINIC_ACCESS_ERROR',
        },
        500,
      );
    }
  };
}

/**
 * Patient access validation middleware
 * Ensures user has access to the specified patient
 */
export function patientAccessMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      const userId = c.get('userId');
      const patientId = c.req.param('patientId') || c.req.query('patientId');
      const healthcareRLS = c.get('healthcareRLS');

      if (!userId) {
        return c.json(
          {
            error: 'User authentication required',
            code: 'AUTH_REQUIRED',
          },
          401,
        );
      }

      if (!patientId) {
        return c.json(
          {
            error: 'Patient ID is required',
            code: 'PATIENT_ID_REQUIRED',
          },
          400,
        );
      }

      // Check if user has access to this patient
      const hasAccess = await healthcareRLS.canAccessPatient(userId, patientId);

      if (!hasAccess) {
        return c.json(
          {
            error: 'Access denied to patient data',
            code: 'PATIENT_ACCESS_DENIED',
            patientId,
          },
          403,
        );
      }

      // Store patient ID in context
      c.set('patientId', patientId);

      return next();
    } catch (error) {
      console.error('Patient access middleware error:', error);
      return c.json(
        {
          error: 'Patient access validation error',
          code: 'PATIENT_ACCESS_ERROR',
        },
        500,
      );
    }
  };
}

/**
 * Professional access validation middleware
 * Ensures user is an active healthcare professional
 */
export function professionalAccessMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      const userId = c.get('userId');
      const userRole = c.get('userRole');
      const rlsQuery = c.get('rlsQuery');

      if (!userId) {
        return c.json(
          {
            error: 'User authentication required',
            code: 'AUTH_REQUIRED',
          },
          401,
        );
      }

      // Check if user is a healthcare professional
      const professionalRoles = ['doctor', 'nurse', 'admin', 'receptionist'];
      if (!userRole || !professionalRoles.includes(userRole.toLowerCase())) {
        return c.json(
          {
            error: 'Healthcare professional access required',
            code: 'PROFESSIONAL_ACCESS_REQUIRED',
            userRole,
          },
          403,
        );
      }

      // Verify professional is active in the system
      const { data: professional, error } = await rlsQuery.client
        .from('professionals')
        .select('id, is_active, clinic_id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error || !professional) {
        return c.json(
          {
            error: 'Active professional record not found',
            code: 'PROFESSIONAL_NOT_FOUND',
          },
          403,
        );
      }

      // Store professional info in context
      c.set('professionalId', professional.id);
      c.set('professionalClinicId', professional.clinic_id);

      return next();
    } catch (error) {
      console.error('Professional access middleware error:', error);
      return c.json(
        {
          error: 'Professional access validation error',
          code: 'PROFESSIONAL_ACCESS_ERROR',
        },
        500,
      );
    }
  };
}
