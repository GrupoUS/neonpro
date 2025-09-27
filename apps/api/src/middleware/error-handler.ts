import { logger } from '@/utils/secure-logger'
import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'

/**
 * Global error handler middleware for the API
 */
export async function errorHandler(c: Context, next: Next): Promise<void> {
  try {
    await next()
  } catch (error) {
    // Log the error
    logger.error('Unhandled error in API', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      path: c.req.path,
      method: c.req.method,
    })

    // Handle HTTPException from Hono
    if (error instanceof HTTPException) {
      return c.json(
        {
          error: {
            message: error.message,
            status: error.status,
          },
        },
        error.status,
      )
    }

    // Handle other errors
    const message = error instanceof Error ? error.message : 'Internal Server Error'

    return c.json(
      {
        error: {
          message,
          status: 500,
        },
      },
      500,
    )
  }
}

export { errorHandler as GlobalErrorHandler }
