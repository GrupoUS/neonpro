// Standardized API response and error helpers
import type { Context } from 'hono';

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function ok<T>(c: Context, data: T, meta?: Record<string, unknown>) {
  return c.json<ApiSuccess<T>>({ success: true, data, meta });
}

export function created<T>(c: Context, data: T, location?: string) {
  if (location) c.header('Location', location);
  return c.json<ApiSuccess<T>>({ success: true, data }, 201);
}

export function badRequest(c: Context, code: string, message: string, details?: unknown) {
  return c.json<ApiError>({ success: false, error: { code, message, details } }, 400);
}

export function unauthorized(c: Context, message = 'Unauthorized', details?: unknown) {
  return c.json<ApiError>({
    success: false,
    error: { code: 'AUTHENTICATION_REQUIRED', message, details },
  }, 401);
}

export function forbidden(c: Context, message = 'Forbidden', details?: unknown) {
  return c.json<ApiError>({ success: false, error: { code: 'FORBIDDEN', message, details } }, 403);
}

export function notFound(c: Context, message = 'Not Found', details?: unknown) {
  return c.json<ApiError>({ success: false, error: { code: 'NOT_FOUND', message, details } }, 404);
}

export function serverError(c: Context, message = 'Internal Server Error', details?: unknown) {
  return c.json<ApiError>(
    { success: false, error: { code: 'INTERNAL_ERROR', message, details } },
    500,
  );
}
