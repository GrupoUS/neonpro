/**
 * Authentication Middleware
 * JWT token validation and user context setup
 */

import { createClient } from '@supabase/supabase-js';
import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '@/types/env';

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const authMiddleware = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      await next();
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify JWT token with Supabase
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        await next();
        return;
      }

      // Set user context
      c.set('user', {
        id: user.id,
        email: user.email!,
        role: user.app_metadata?.role || 'user',
        clinic_id: user.app_metadata?.clinic_id,
      });

      await next();
    } catch (_error) {
      await next();
    }
  };
};

/**
 * Require authentication middleware
 * Returns 401 if user is not authenticated
 */
export const requireAuth = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const user = c.get('user');

    if (!user) {
      return c.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          meta: {
            timestamp: new Date().toISOString(),
            path: c.req.path,
            method: c.req.method,
          },
        },
        401
      );
    }

    await next();
  };
};

/**
 * Require specific role middleware
 */
export const requireRole = (role: string): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const user = c.get('user');

    if (!user) {
      return c.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        401
      );
    }

    if (user.role !== role && user.role !== 'admin') {
      return c.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: `Role '${role}' required`,
          },
        },
        403
      );
    }

    await next();
  };
};

/**
 * Require clinic access middleware
 * Ensures user has access to the requested clinic
 */
export const requireClinicAccess = (
  clinicIdParam = 'clinic_id'
): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const user = c.get('user');
    const clinicId = c.req.param(clinicIdParam);

    if (!user) {
      return c.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        401
      );
    }

    // Admin users have access to all clinics
    if (user.role === 'admin') {
      await next();
      return;
    }

    // Check if user has access to the requested clinic
    if (user.clinic_id !== clinicId) {
      return c.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Access to this clinic is not allowed',
          },
        },
        403
      );
    }

    await next();
  };
};
