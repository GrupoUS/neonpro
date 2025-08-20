/**
 * Global error handler for Hono.dev application
 * Provides consistent error responses and logging
 */

import type { ErrorHandler } from 'hono';
import type { AppEnv } from '@/types/env';

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  console.error('API Error:', {
    error: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
    timestamp: new Date().toISOString(),
    request_id: c.get('request_id'),
    user_id: c.get('user')?.id,
  });

  // Default error response
  let status = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
    code = 'UNAUTHORIZED';
  } else if (err.name === 'ForbiddenError') {
    status = 403;
    message = 'Forbidden';
    code = 'FORBIDDEN';
  } else if (err.name === 'NotFoundError') {
    status = 404;
    message = 'Not Found';
    code = 'NOT_FOUND';
  } else if (err.name === 'RateLimitError') {
    status = 429;
    message = 'Rate limit exceeded';
    code = 'RATE_LIMIT_EXCEEDED';
  }

  // Custom error response format
  const errorResponse = {
    error: {
      code,
      message,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    meta: {
      path: c.req.path,
      method: c.req.method,
      timestamp: new Date().toISOString(),
      request_id: c.get('request_id'),
    },
  };

  return c.json(errorResponse, status);
};
