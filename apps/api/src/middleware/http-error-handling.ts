import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { logger } from '../lib/logger';

/**
 * HTTP error handling middleware with enhanced error processing
 */
export function httpErrorHandlingMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (_error) {
      // Log the error with context
      const errorContext = {
        path: c.req.path,
        method: c.req.method,
        userAgent: c.req.header('user-agent'),
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        requestId: c.get('requestId'),
      };

      // Handle different error types
      if (error instanceof HTTPException) {
        // Hono HTTP exceptions
        logger.warn('HTTP Exception', {
          ...errorContext,
          status: error.status,
          message: error.message,
        });

        return c.json(
          {
            error: {
              message: error.message,
              status: error.status,
              code: getErrorCode(error.status),
            },
            requestId: errorContext.requestId,
            timestamp: new Date().toISOString(),
          },
          error.status,
        );
      }

      // Validation errors
      if (isValidationError(error)) {
        logger.warn('Validation Error', {
          ...errorContext,
          validationErrors: error.errors || error.message,
        });

        return c.json(
          {
            error: {
              message: 'Validation failed',
              status: 400,
              code: 'VALIDATION_ERROR',
              details: error.errors || error.message,
            },
            requestId: errorContext.requestId,
            timestamp: new Date().toISOString(),
          },
          400,
        );
      }

      // Database errors
      if (isDatabaseError(error)) {
        logger.error('Database Error', {
          ...errorContext,
          error: error.message,
          stack: error.stack,
        });

        return c.json(
          {
            error: {
              message: 'Database operation failed',
              status: 500,
              code: 'DATABASE_ERROR',
            },
            requestId: errorContext.requestId,
            timestamp: new Date().toISOString(),
          },
          500,
        );
      }

      // Authentication/Authorization errors
      if (isAuthError(error)) {
        logger.warn('Authentication/Authorization Error', {
          ...errorContext,
          error: error.message,
        });

        const status = error.message.toLowerCase().includes('unauthorized') ? 401 : 403;

        return c.json(
          {
            error: {
              message: status === 401 ? 'Authentication required' : 'Access forbidden',
              status,
              code: status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
            },
            requestId: errorContext.requestId,
            timestamp: new Date().toISOString(),
          },
          status,
        );
      }

      // Network/timeout errors
      if (isNetworkError(error)) {
        logger.error('Network Error', {
          ...errorContext,
          error: error.message,
        });

        return c.json(
          {
            error: {
              message: 'Service temporarily unavailable',
              status: 503,
              code: 'SERVICE_UNAVAILABLE',
            },
            requestId: errorContext.requestId,
            timestamp: new Date().toISOString(),
          },
          503,
        );
      }

      // Generic errors
      logger.error('Unhandled Error', {
        ...errorContext,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      return c.json(
        {
          error: {
            message: 'Internal server error',
            status: 500,
            code: 'INTERNAL_ERROR',
          },
          requestId: errorContext.requestId,
          timestamp: new Date().toISOString(),
        },
        500,
      );
    }
  };
}

/**
 * Get error code based on HTTP status
 */
function getErrorCode(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 405:
      return 'METHOD_NOT_ALLOWED';
    case 409:
      return 'CONFLICT';
    case 410:
      return 'GONE';
    case 422:
      return 'UNPROCESSABLE_ENTITY';
    case 429:
      return 'TOO_MANY_REQUESTS';
    case 500:
      return 'INTERNAL_ERROR';
    case 502:
      return 'BAD_GATEWAY';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    case 504:
      return 'GATEWAY_TIMEOUT';
    default:
      return 'UNKNOWN_ERROR';
  }
}

/**
 * Check if error is a validation error
 */
function isValidationError(error: any): boolean {
  return (
    error.name === 'ValidationError'
    || error.name === 'ZodError'
    || error.name === 'ValibotError'
    || (error.message && error.message.includes('validation'))
    || Array.isArray(error.errors)
  );
}

/**
 * Check if error is a database error
 */
function isDatabaseError(error: any): boolean {
  return (
    error.name === 'PrismaClientKnownRequestError'
    || error.name === 'PrismaClientUnknownRequestError'
    || error.name === 'PrismaClientValidationError'
    || error.name === 'DatabaseError'
    || error.name === 'SequelizeError'
    || (error.code && typeof error.code === 'string' && error.code.startsWith('P')) // Prisma error codes
  );
}

/**
 * Check if error is an authentication/authorization error
 */
function isAuthError(error: any): boolean {
  return (
    error.name === 'AuthenticationError'
    || error.name === 'AuthorizationError'
    || error.name === 'UnauthorizedError'
    || error.name === 'ForbiddenError'
    || (error.message && (
      error.message.toLowerCase().includes('unauthorized')
      || error.message.toLowerCase().includes('forbidden')
      || error.message.toLowerCase().includes('access denied')
      || error.message.toLowerCase().includes('not authorized')
    ))
  );
}

/**
 * Check if error is a network/timeout error
 */
function isNetworkError(error: any): boolean {
  return (
    error.name === 'TimeoutError'
    || error.name === 'NetworkError'
    || error.name === 'FetchError'
    || error.code === 'ECONNREFUSED'
    || error.code === 'ENOTFOUND'
    || error.code === 'ETIMEDOUT'
    || (error.message && (
      error.message.includes('timeout')
      || error.message.includes('network')
      || error.message.includes('connection')
    ))
  );
}
