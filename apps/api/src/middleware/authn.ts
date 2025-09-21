import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { logger } from '../lib/logger';

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
      
      // TODO: Implement actual token validation
      // For now, we'll just check if it's not empty
      // In a real implementation, you would:
      // 1. Validate JWT token
      // 2. Check token expiration
      // 3. Verify token signature
      // 4. Extract user information
      // 5. Check user permissions
      
      // Mock user validation - replace with actual implementation
      const user = await validateToken(token);
      
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
 * Mock token validation function
 * Replace with actual implementation using your authentication provider
 */
async function validateToken(token: string): Promise<ValidatedUser | null> {
  try {
    // TODO: Replace with actual token validation
    // This could be:
    // - JWT verification with your secret key
    // - Supabase Auth validation
    // - Call to external authentication service
    // - Database lookup for session tokens
    
    // For development/testing purposes only
    if (token === 'test-token') {
      return {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'admin',
        clinicId: 'test-clinic-id',
        name: 'Test User',
      };
    }
    
    // In a real implementation, you might do something like:
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const user = await getUserFromDatabase(decoded.sub);
    // return user;
    
    return null;
  } catch (error) {
    logger.error('Token validation failed', {
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
        const user = await validateToken(token);
        
        if (user) {
          c.set('user', user);
          c.set('userId', user.id);
          c.set('clinicId', user.clinicId);
        }
      }
    } catch (error) {
      // Silently fail for optional auth
      logger.debug('Optional authentication failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    
    await next();
  };
}