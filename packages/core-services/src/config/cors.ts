// T043: CORS and security headers configuration
import type { MiddlewareHandler } from 'hono'

export interface CORSConfig {
  origin: string | string[] | ((origin: string) => boolean)
  methods: string[]
  headers: string[]
  credentials: boolean
  maxAge: number
  exposeHeaders: string[]
  optionsSuccessStatus: number
}

export interface SecurityHeadersConfig {
  contentSecurityPolicy: {
    enabled: boolean
    directives: Record<string, string | string[]>
  }
  hsts: {
    enabled: boolean
    maxAge: number
    includeSubDomains: boolean
    preload: boolean
  }
  frameOptions: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM'
  contentTypeOptions: boolean
  xssProtection: boolean
  referrerPolicy: string
  permissionsPolicy: Record<string, string[]>
}

export function createCORSConfig(): CORSConfig {
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  return {
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    headers: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
      'X-Session-ID',
      'X-Request-ID',
    ],
    credentials: process.env.CORS_CREDENTIALS === 'true',
    maxAge: parseInt(process.env.CORS_MAX_AGE || '86400'), // 24 hours
    exposeHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
    optionsSuccessStatus: 204,
  }
}

export function createSecurityHeadersConfig(): SecurityHeadersConfig {
  return {
    contentSecurityPolicy: {
      enabled: process.env.CSP_ENABLED !== 'false',
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'https:'],
        'connect-src': ["'self'", 'https:', 'wss:'],
        'frame-ancestors': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
      },
    },
    hsts: {
      enabled: process.env.HSTS_ENABLED !== 'false',
      maxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000'), // 1 year
      includeSubDomains: process.env.HSTS_INCLUDE_SUBDOMAINS !== 'false',
      preload: process.env.HSTS_PRELOAD === 'true',
    },
    frameOptions: 'DENY',
    contentTypeOptions: true,
    xssProtection: true,
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: [],
      usb: [],
      bluetooth: [],
    },
  }
}

export function corsMiddleware(config?: CORSConfig): MiddlewareHandler {
  const corsConfig = config || createCORSConfig()

  return async (c, next) => {
    const origin = c.req.header('Origin')

    // Handle preflight requests
    if (c.req.method === 'OPTIONS') {
      let allowOrigin = false
      if (typeof corsConfig.origin === 'string') {
        allowOrigin = corsConfig.origin === '*' || corsConfig.origin === origin
      } else if (Array.isArray(corsConfig.origin)) {
        allowOrigin = origin ? corsConfig.origin.includes(origin) : false
      } else if (typeof corsConfig.origin === 'function') {
        allowOrigin = corsConfig.origin(origin || '')
      }

      if (allowOrigin) {
        c.header('Access-Control-Allow-Origin', origin || '*')
        c.header('Access-Control-Allow-Methods', corsConfig.methods.join(', '))
        c.header('Access-Control-Allow-Headers', corsConfig.headers.join(', '))
        c.header('Access-Control-Max-Age', corsConfig.maxAge.toString())

        if (corsConfig.credentials) {
          c.header('Access-Control-Allow-Credentials', 'true')
        }
      }

      return c.newResponse(null, {
        status: corsConfig.optionsSuccessStatus as any,
      })
    }

    if (origin) {
      let allowOrigin = false
      if (typeof corsConfig.origin === 'string') {
        allowOrigin = corsConfig.origin === '*' || corsConfig.origin === origin
      } else if (Array.isArray(corsConfig.origin)) {
        allowOrigin = corsConfig.origin.includes(origin)
      } else if (typeof corsConfig.origin === 'function') {
        allowOrigin = corsConfig.origin(origin)
      }

      if (allowOrigin) {
        c.header('Access-Control-Allow-Origin', origin)
        if (corsConfig.credentials) {
          c.header('Access-Control-Allow-Credentials', 'true')
        }
        if (corsConfig.exposeHeaders.length > 0) {
          c.header(
            'Access-Control-Expose-Headers',
            corsConfig.exposeHeaders.join(', '),
          )
        }
      }
    }

    return await next()
  }
}

export function securityHeadersMiddleware(
  config?: SecurityHeadersConfig,
): MiddlewareHandler {
  const securityConfig = config || createSecurityHeadersConfig()

  return async (c, next) => {
    if (securityConfig.contentSecurityPolicy.enabled) {
      const cspDirectives = Object.entries(
        securityConfig.contentSecurityPolicy.directives,
      )
        .map(([directive, values]) => {
          const valueString = Array.isArray(values) ? values.join(' ') : values
          return `${directive} ${valueString}`
        })
        .join('; ')
      c.header('Content-Security-Policy', cspDirectives)
    }

    if (securityConfig.hsts.enabled) {
      let hstsValue = `max-age=${securityConfig.hsts.maxAge}`
      if (securityConfig.hsts.includeSubDomains) {
        hstsValue += '; includeSubDomains'
      }
      if (securityConfig.hsts.preload) {
        hstsValue += '; preload'
      }
      c.header('Strict-Transport-Security', hstsValue)
    }

    c.header('X-Frame-Options', securityConfig.frameOptions)

    if (securityConfig.contentTypeOptions) {
      c.header('X-Content-Type-Options', 'nosniff')
    }

    if (securityConfig.xssProtection) {
      c.header('X-XSS-Protection', '1; mode=block')
    }

    c.header('Referrer-Policy', securityConfig.referrerPolicy)

    const permissionsPolicyDirectives = Object.entries(
      securityConfig.permissionsPolicy,
    )
      .map(([directive, allowlist]) => {
        if (allowlist.length === 0) {
          return `${directive}=()`
        }
        return `${directive}=(${allowlist.join(' ')})`
      })
      .join(', ')
    if (permissionsPolicyDirectives) {
      c.header('Permissions-Policy', permissionsPolicyDirectives)
    }

    c.header('X-DNS-Prefetch-Control', 'off')
    c.header('X-Download-Options', 'noopen')
    c.header('X-Permitted-Cross-Domain-Policies', 'none')

    await next()
  }
}

export function rateLimitHeadersMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    await next()

    const rateLimit = c.get('rateLimit')
    if (rateLimit) {
      c.header('X-Rate-Limit-Limit', rateLimit.limit.toString())
      c.header('X-Rate-Limit-Remaining', rateLimit.remaining.toString())
      c.header('X-Rate-Limit-Reset', rateLimit.reset.toString())
    }
  }
}

export function requestIdMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const requestId = c.req.header('X-Request-ID') || generateRequestId()
    c.set('requestId', requestId)
    c.header('X-Request-ID', requestId)
    await next()
  }
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function securityMiddleware(options?: {
  cors?: CORSConfig
  security?: SecurityHeadersConfig
  enableRateLimit?: boolean
  enableRequestId?: boolean
}): MiddlewareHandler {
  return async (c, next) => {
    // Apply request ID middleware
    if (options?.enableRequestId !== false) {
      const requestId = c.req.header('X-Request-ID') || generateRequestId()
      c.set('requestId', requestId)
      c.header('X-Request-ID', requestId)
    }

    // Apply CORS logic inline
    const corsConfig = options?.cors || createCORSConfig()
    const origin = c.req.header('Origin')

    // Handle preflight requests
    if (c.req.method === 'OPTIONS') {
      let allowOrigin = false
      if (typeof corsConfig.origin === 'string') {
        allowOrigin = corsConfig.origin === '*' || corsConfig.origin === origin
      } else if (Array.isArray(corsConfig.origin)) {
        allowOrigin = origin ? corsConfig.origin.includes(origin) : false
      } else if (typeof corsConfig.origin === 'function') {
        allowOrigin = corsConfig.origin(origin || '')
      }

      if (allowOrigin) {
        c.header('Access-Control-Allow-Origin', origin || '*')
        c.header('Access-Control-Allow-Methods', corsConfig.methods.join(', '))
        c.header('Access-Control-Allow-Headers', corsConfig.headers.join(', '))
        c.header('Access-Control-Max-Age', corsConfig.maxAge.toString())

        if (corsConfig.credentials) {
          c.header('Access-Control-Allow-Credentials', 'true')
        }
      }

      return c.newResponse(null, {
        status: corsConfig.optionsSuccessStatus as any,
      })
    }

    if (origin) {
      let allowOrigin = false
      if (typeof corsConfig.origin === 'string') {
        allowOrigin = corsConfig.origin === '*' || corsConfig.origin === origin
      } else if (Array.isArray(corsConfig.origin)) {
        allowOrigin = corsConfig.origin.includes(origin)
      } else if (typeof corsConfig.origin === 'function') {
        allowOrigin = corsConfig.origin(origin)
      }

      if (allowOrigin) {
        c.header('Access-Control-Allow-Origin', origin)
        if (corsConfig.credentials) {
          c.header('Access-Control-Allow-Credentials', 'true')
        }
        if (corsConfig.exposeHeaders.length > 0) {
          c.header(
            'Access-Control-Expose-Headers',
            corsConfig.exposeHeaders.join(', '),
          )
        }
      }
    }

    // Apply security headers inline
    const securityConfig = options?.security || createSecurityHeadersConfig()

    if (securityConfig.contentSecurityPolicy.enabled) {
      const cspDirectives = Object.entries(
        securityConfig.contentSecurityPolicy.directives,
      )
        .map(([directive, values]) => {
          const valueString = Array.isArray(values) ? values.join(' ') : values
          return `${directive} ${valueString}`
        })
        .join('; ')
      c.header('Content-Security-Policy', cspDirectives)
    }

    if (securityConfig.hsts.enabled) {
      let hstsValue = `max-age=${securityConfig.hsts.maxAge}`
      if (securityConfig.hsts.includeSubDomains) {
        hstsValue += '; includeSubDomains'
      }
      if (securityConfig.hsts.preload) {
        hstsValue += '; preload'
      }
      c.header('Strict-Transport-Security', hstsValue)
    }

    c.header('X-Frame-Options', securityConfig.frameOptions)

    if (securityConfig.contentTypeOptions) {
      c.header('X-Content-Type-Options', 'nosniff')
    }

    if (securityConfig.xssProtection) {
      c.header('X-XSS-Protection', '1; mode=block')
    }

    c.header('Referrer-Policy', securityConfig.referrerPolicy)

    const permissionsPolicyDirectives = Object.entries(
      securityConfig.permissionsPolicy,
    )
      .map(([directive, allowlist]) => {
        if (allowlist.length === 0) {
          return `${directive}=()`
        }
        return `${directive}=(${allowlist.join(' ')})`
      })
      .join(', ')
    if (permissionsPolicyDirectives) {
      c.header('Permissions-Policy', permissionsPolicyDirectives)
    }

    c.header('X-DNS-Prefetch-Control', 'off')
    c.header('X-Download-Options', 'noopen')
    c.header('X-Permitted-Cross-Domain-Policies', 'none')

    // Apply rate limit headers
    if (options?.enableRateLimit !== false) {
      const rateLimit = c.get('rateLimit')
      if (rateLimit) {
        c.header('X-Rate-Limit-Limit', rateLimit.limit.toString())
        c.header('X-Rate-Limit-Remaining', rateLimit.remaining.toString())
        c.header('X-Rate-Limit-Reset', rateLimit.reset.toString())
      }
    }

    return await next()
  }
}
