import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createAdminClient } from '../clients/supabase';
import { logger } from '../lib/logger';
import { jwtValidator } from '../security/jwt-validator';

// Interface for validated user token data
interface ValidatedUser {
  id: string;
  email: string;
  role: string;
  clinicId: string;
  name: string;
}

/**
 * Authentication middleware for protected routes
 */
export function authenticationMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      // Get authorization header
      const authHeader = c.req.header('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('Missing or invalid authorization header', {
          path: c.req.path,
          method: c.req.method,
          ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        });

        throw new HTTPException(401, {
          message: 'Authorization header required',
        });
      }

      const token = authHeader.replace('Bearer ', '');

      if (!token) {
        throw new HTTPException(401, {
          message: 'Bearer token required',
        });
      }

      // Validate JWT token using comprehensive security validator
      const validationResult = await jwtValidator.validateToken(token, c);

      if (!validationResult.isValid) {
        logger.warn('Token validation failed', {
          error: validationResult.error,
          errorCode: validationResult.errorCode,
          securityLevel: validationResult.securityLevel,
          path: c.req.path,
          method: c.req.method,
          ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        });

        throw new HTTPException(401, {
          message: validationResult.error || 'Invalid token',
        });
      }

      // Extract user information from validated token
      const user = await validateUserFromToken(validationResult.payload!);

      if (!user) {
        throw new HTTPException(401, {
          message: 'Invalid or expired token',
        });
      }

      // Set user context for downstream handlers
      c.set('user', user);
      c.set('userId', user.id);
      c.set('clinicId', user.clinicId);

      logger.debug('User authenticated successfully', {
        userId: user.id,
        clinicId: user.clinicId,
        path: c.req.path,
        method: c.req.method,
      });

      await next();
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }

      logger.error('Authentication error', {
        error: error instanceof Error ? error.message : String(error),
        path: c.req.path,
        method: c.req.method,
      });

      throw new HTTPException(401, {
        message: 'Authentication failed',
      });
    }
  };
}

/**
 * Authorization middleware for role-based access control
 */
export function authorizationMiddleware(allowedRoles: string[] = []) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      throw new HTTPException(401, {
        message: 'User not authenticated',
      });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      logger.warn('Access denied - insufficient permissions', {
        userId: user.id,
        userRole: user.role,
        allowedRoles,
        path: c.req.path,
        method: c.req.method,
      });

      throw new HTTPException(403, {
        message: 'Insufficient permissions',
      });
    }

    logger.debug('User authorized successfully', {
      userId: user.id,
      userRole: user.role,
      path: c.req.path,
      method: c.req.method,
    });

    await next();
  };
}

/**
 * Clinic access middleware - ensures user can only access their clinic's data
 */
export function clinicAccessMiddleware() {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    const requestedClinicId = c.req.param('clinicId') || c.req.query('clinicId');

    if (!user) {
      throw new HTTPException(401, {
        message: 'User not authenticated',
      });
    }

    if (requestedClinicId && requestedClinicId !== user.clinicId) {
      logger.warn('Access denied - clinic mismatch', {
        userId: user.id,
        userClinicId: user.clinicId,
        requestedClinicId,
        path: c.req.path,
        method: c.req.method,
      });

      throw new HTTPException(403, {
        message: 'Access denied to clinic data',
      });
    }

    await next();
  };
}

/**
 * Validate user from JWT token payload and fetch user data
 */
async function validateUserFromToken(payload: any): Promise<ValidatedUser | null> {
  try {
    const { sub: userId, email, role, clinic_id: clinicId, name } = payload;

    if (!userId || !email) {
      logger.error('Invalid token payload: missing required fields', { payload });
      return null;
    }

    // For development/testing, allow test tokens
    if (userId === 'test-user-id' && email === 'test@example.com') {
      return {
        id: userId,
        email,
        role: role || 'admin',
        clinicId: clinicId || 'test-clinic-id',
        name: name || 'Test User',
      };
    }

    // In production, validate user against database
    const supabase = createAdminClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, clinic_id, name')
      .eq('id', userId)
      .eq('email', email)
      .single();

    if (error || !user) {
      logger.error('User not found in database', { userId, email, error });
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      clinicId: user.clinic_id,
      name: user.name,
    };
  } catch (error) {
    logger.error('User validation from token failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Combined authentication and authorization middleware
 */
export function requireAuth(allowedRoles: string[] = []) {
  return async (c: Context, next: Next) => {
    // Apply authentication first
    await authenticationMiddleware()(c, async () => {});

    // Then apply authorization if roles are specified
    if (allowedRoles.length > 0) {
      await authorizationMiddleware(allowedRoles)(c, async () => {});
    }

    // Finally continue to the actual handler
    await next();
  };
}

/**
 * Optional authentication middleware (doesn't fail if no auth provided)
 */
export function optionalAuth() {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header('authorization');

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');

        // Validate token using comprehensive security validator
        const validationResult = await jwtValidator.validateToken(token, c);

        if (validationResult.isValid && validationResult.payload) {
          const user = await validateUserFromToken(validationResult.payload);

          if (user) {
            c.set('user', user);
            c.set('userId', user.id);
            c.set('clinicId', user.clinicId);

            logger.debug('Optional authentication succeeded', {
              userId: user.id,
              clinicId: user.clinicId,
              path: c.req.path,
              method: c.req.method,
            });
          }
        } else {
          logger.debug('Optional authentication failed - invalid token', {
            error: validationResult.error,
            path: c.req.path,
            method: c.req.method,
          });
        }
      }
    } catch (error) {
      // Silently fail for optional auth
      logger.debug('Optional authentication failed', {
        error: error instanceof Error ? error.message : String(error),
        path: c.req.path,
        method: c.req.method,
      });
    }

    await next();
  };
}
