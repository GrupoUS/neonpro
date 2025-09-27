import { Context, Next } from 'hono'

/**
 * Simple CORS middleware for Hono
 */
export function cors(options: {
  origin?: string | string[] | ((origin: string) => string | boolean | null)
  allowMethods?: string[]
  allowHeaders?: string[]
  exposeHeaders?: string[]
  maxAge?: number
  credentials?: boolean
} = {}) {
  const {
    origin = '*',
    allowMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders = [],
    maxAge = 86400,
    credentials = false,
  } = options

  return async (c: Context, next: Next) => {
    // Handle preflight requests
    if (c.req.method === 'OPTIONS') {
      const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': allowMethods.join(','),
        'Access-Control-Allow-Headers': allowHeaders.join(','),
        'Access-Control-Max-Age': maxAge.toString(),
      }

      // Set origin
      if (typeof origin === 'string') {
        headers['Access-Control-Allow-Origin'] = origin
      } else if (Array.isArray(origin)) {
        const requestOrigin = c.req.header('Origin') || '*'
        headers['Access-Control-Allow-Origin'] = origin.includes(requestOrigin) ? requestOrigin : origin[0]
      } else if (typeof origin === 'function') {
        const requestOrigin = c.req.header('Origin') || '*'
        headers['Access-Control-Allow-Origin'] = origin(requestOrigin) ? requestOrigin : 'false'
      }

      // Set credentials
      if (credentials) {
        headers['Access-Control-Allow-Credentials'] = 'true'
      }

      return new Response(null, { status: 204, headers })
    }

    // Handle actual requests
    await next()

    // Add CORS headers to response
    if (typeof origin === 'string') {
      c.header('Access-Control-Allow-Origin', origin)
    } else if (Array.isArray(origin)) {
      const requestOrigin = c.req.header('Origin') || '*'
      c.header('Access-Control-Allow-Origin', origin.includes(requestOrigin) ? requestOrigin : origin[0])
    } else if (typeof origin === 'function') {
      const requestOrigin = c.req.header('Origin') || '*'
      c.header('Access-Control-Allow-Origin', origin(requestOrigin) ? requestOrigin : 'false')
    }

    c.header('Access-Control-Allow-Methods', allowMethods.join(','))
    c.header('Access-Control-Allow-Headers', allowHeaders.join(','))
    
    if (exposeHeaders.length > 0) {
      c.header('Access-Control-Expose-Headers', exposeHeaders.join(','))
    }

    if (credentials) {
      c.header('Access-Control-Allow-Credentials', 'true')
    }
  }
}