import { logger } from '@/utils/healthcare-errors'
import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'

/**
 * Basic authentication middleware
 * This is a simple implementation - replace with your actual auth system
 */

/**
 * Mock user interface
 */
interface User {
  id: string
  email: string
  _role: string
  clinicId: string
  name: string
  permissions: string[]
}

/**
 * Extract token from authorization header
 */
import { JWTSecurityService } from '../services/jwt-security-service'

function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.replace('Bearer ', '')
}

/**
 * Mock token validation - replace with actual implementation
 */
/**
 * JWT token validation using JWTSecurityService
 * Validates JWT tokens with comprehensive security checks
 */
async function validateToken(token: string): Promise<User | null> {
  try {
    // Use the comprehensive JWT validation service
    const validationResult = await JWTSecurityService.validateToken(token)

    if (!validationResult.isValid || !validationResult.payload) {
      logger.warn('JWT validation failed', {
        error: validationResult.error,
        errorCode: validationResult.errorCode,
      })
      return null
    }

    const payload = validationResult.payload

    // Map JWT payload to User interface
    const user: User = {
      id: payload.sub || payload.userId || '',
      email: payload.email || `${payload.sub || 'user'}@neonpro.health`,
      _role: payload.role || payload.userRole || 'user',
      clinicId: payload.clinicId || payload.healthcareProvider || 'default-clinic',
      name: payload.name || `${payload.sub || 'User'} Name`,
      permissions: payload.permissions || [],
    }

    // Log successful authentication with security context
    logger.info('User authenticated successfully', {
      userId: user.id,
      userRole: user._role,
      clinicId: user.clinicId,
      permissions: user.permissions,
      tokenType: payload.type || 'access',
      warnings: validationResult.warnings,
    })

    return user
  } catch (error) {
    logger.error('Token validation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return null
  }
}

/**
 * Authentication middleware
 */
export function auth() {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header('authorization')
      const token = extractToken(authHeader)

      if (!token) {
        logger.warn('Missing authentication token', {
          path: c.req.path,
          method: c.req.method,
          ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        })

        throw new HTTPException(401, {
          message: 'Authentication required',
        })
      }

      const user = await validateToken(token)

      if (!user) {
        logger.warn('Invalid authentication token', {
          path: c.req.path,
          method: c.req.method,
          ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        })

        throw new HTTPException(401, {
          message: 'Invalid or expired token',
        })
      }

      // Set user context
      c.set('user', user)
      c.set('userId', user.id)
      c.set('clinicId', user.clinicId)

      logger.debug('User authenticated', {
        _userId: user.id,
        _role: user._role,
        path: c.req.path,
        method: c.req.method,
      })

      await next()
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err
      }

      logger.error('Authentication error', {
        error: err instanceof Error ? err.message : String(err),
        path: c.req.path,
        method: c.req.method,
      })

      throw new HTTPException(500, {
        message: 'Authentication failed',
      })
    }
  }
}

/**
 * Optional authentication middleware (doesn't fail if no auth)
 */
export function optionalAuth() {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header('authorization')
      const token = extractToken(authHeader)

      if (token) {
        const user = await validateToken(token)
        if (user) {
          c.set('user', user)
          c.set('userId', user.id)
          c.set('clinicId', user.clinicId)
        }
      }

      await next()
    } catch (err) {
      // Silent fail for optional auth
      logger.debug('Optional auth failed', {
        error: err instanceof Error ? err.message : String(err),
      })

      await next()
    }
  }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(allowedRoles: string | string[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  return async (c: Context, next: Next) => {
    const user = c.get('user')

    if (!user) {
      throw new HTTPException(401, {
        message: 'Authentication required',
      })
    }

    if (!roles.includes(user._role)) {
      logger.warn('Access denied - insufficient role', {
        _userId: user.id,
        userRole: user._role,
        requiredRoles: roles,
        path: c.req.path,
        method: c.req.method,
      })

      throw new HTTPException(403, {
        message: 'Insufficient permissions',
      })
    }

    await next()
  }
}

/**
 * Permission-based authorization middleware
 */
export function requirePermission(requiredPermissions: string | string[]) {
  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions]

  return async (c: Context, next: Next) => {
    const user = c.get('user')

    if (!user) {
      throw new HTTPException(401, {
        message: 'Authentication required',
      })
    }

    const hasPermission = permissions.some(permission => user.permissions.includes(permission))

    if (!hasPermission) {
      logger.warn('Access denied - insufficient permissions', {
        _userId: user.id,
        userPermissions: user.permissions,
        requiredPermissions: permissions,
        path: c.req.path,
        method: c.req.method,
      })

      throw new HTTPException(403, {
        message: 'Insufficient permissions',
      })
    }

    await next()
  }
}

/**
 * Clinic access middleware - ensures user can only access their clinic data
 */
export function requireClinicAccess() {
  return async (c: Context, next: Next) => {
    const user = c.get('user')
    const requestedClinicId = c.req.param('clinicId') || c.req.query('clinicId')

    if (!user) {
      throw new HTTPException(401, {
        message: 'Authentication required',
      })
    }

    if (requestedClinicId && requestedClinicId !== user.clinicId) {
      logger.warn('Access denied - clinic mismatch', {
        _userId: user.id,
        userClinicId: user.clinicId,
        requestedClinicId,
        path: c.req.path,
        method: c.req.method,
      })

      throw new HTTPException(403, {
        message: 'Access denied to clinic data',
      })
    }

    await next()
  }
}

/**
 * Combined auth + role middleware
 */
export function authWithRole(allowedRoles: string | string[]) {
  return async (c: Context, next: Next) => {
    await auth()(c, async () => {})
    await requireRole(allowedRoles)(c, next)
  }
}

/**
 * Combined auth + permission middleware
 */
export function authWithPermission(requiredPermissions: string | string[]) {
  return async (c: Context, next: Next) => {
    await auth()(c, async () => {})
    await requirePermission(requiredPermissions)(c, next)
  }
}

/**
 * Alias for auth middleware (for backward compatibility)
 */
export const requireAuth = auth

/**
 * AI-specific access control middleware
 */
export function requireAIAccess() {
  return authWithPermission(['ai_access', 'admin'])
}
