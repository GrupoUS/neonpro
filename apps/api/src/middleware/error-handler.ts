import type { Context, Next } from 'hono'
import { serverError, badRequest, unauthorized, forbidden, notFound } from '../utils/responses'

export async function errorHandler(c: Context, next: Next) {
  try {
    await next()

    // If downstream didn't set a response for 404
    if (c.res.status === 404 && !c.res.body) {
      return notFound(c, 'Route not found')
    }
  } catch (err: any) {
    const message = err?.message || 'Unhandled error'
    const code = err?.code || 'INTERNAL_ERROR'

    // Map common error types
    if (code === 'VALIDATION_ERROR') {
      return badRequest(c, code, message, err?.details)
    }
    if (code === 'AUTHENTICATION_REQUIRED') {
      return unauthorized(c, message)
    }
    if (code === 'FORBIDDEN') {
      return forbidden(c, message)
    }
    if (code === 'NOT_FOUND') {
      return notFound(c, message)
    }

    // Default
    return serverError(c, message, process.env.NODE_ENV === 'production' ? undefined : err)
  }
  return
}
