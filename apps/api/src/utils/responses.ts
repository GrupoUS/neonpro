/**
 * Standard HTTP response helpers for NeonPro API
 */
import type { Context } from 'hono'

export function badRequest(
  c: Context,
  code: string,
  message: string,
  details?: any,
): Response {
  return c.json({ error: { code, message, details } }, 400)
}

export function unauthorized(c: Context, message: string): Response {
  return c.json({ error: { code: 'UNAUTHORIZED', message } }, 401)
}

export function forbidden(c: Context, message: string): Response {
  return c.json({ error: { code: 'FORBIDDEN', message } }, 403)
}

export function notFound(c: Context, message: string): Response {
  return c.json({ error: { code: 'NOT_FOUND', message } }, 404)
}

export function serverError(
  c: Context,
  message: string,
  details?: any,
): Response {
  return c.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message,
        ...(details && { details }),
      },
    },
    500,
  )
}

export function success(c: Context, data: any, status: number = 200): Response {
  return c.json({ data }, status)
}

export function ok(c: Context, data: any): Response {
  return c.json({ data }, 200)
}

export function created(c: Context, data: any): Response {
  return c.json({ data }, 201)
}
