import { Context, Next } from 'hono'

interface Logger {
  logSystemEvent(event: string, data: any): void
  logError(event: string, data: any): void
}

export interface SecurityHeadersConfig {
  enableHSTS: boolean
  hstsMaxAge: number
  hstsIncludeSubDomains: boolean
  hstsPreload: boolean
  enableCSP: boolean
  contentSecurityPolicy?: string
  enableFrameGuard: boolean
  enableXSSProtection: boolean
  enableContentTypeSniffingProtection: boolean
  referrerPolicy: string
  permissionsPolicy?: string
  customHeaders?: Record<string, string>
}

export class SecurityHeadersMiddleware {
  private config: SecurityHeadersConfig
  private logger: Logger

  constructor(config: SecurityHeadersConfig, logger: Logger) {
    this.config = config
    this.logger = logger
  }

  public middleware(): (c: Context, next: Next) => Promise<void> {
    return async (c: Context, next: Next) => {
      try {
        // HSTS (HTTP Strict Transport Security)
        if (this.config.enableHSTS && c.req.url.startsWith('https://')) {
          const hstsValue = [
            `max-age=${this.config.hstsMaxAge}`,
            this.config.hstsIncludeSubDomains ? 'includeSubDomains' : '',
            this.config.hstsPreload ? 'preload' : '',
          ]
            .filter(Boolean)
            .join('; ')

          c.header('Strict-Transport-Security', hstsValue)

          this.logger.logSystemEvent('hsts_header_applied', {
            maxAge: this.config.hstsMaxAge,
            includeSubDomains: this.config.hstsIncludeSubDomains,
            preload: this.config.hstsPreload,
            url: c.req.url,
            timestamp: new Date().toISOString(),
          })
        }

        // Content Security Policy
        if (this.config.enableCSP && this.config.contentSecurityPolicy) {
          c.header(
            'Content-Security-Policy',
            this.config.contentSecurityPolicy,
          )
        }

        // X-Frame-Options (Clickjacking protection)
        if (this.config.enableFrameGuard) {
          c.header('X-Frame-Options', 'DENY')
        }

        // X-Content-Type-Options (MIME sniffing protection)
        if (this.config.enableContentTypeSniffingProtection) {
          c.header('X-Content-Type-Options', 'nosniff')
        }

        // X-XSS-Protection
        if (this.config.enableXSSProtection) {
          c.header('X-XSS-Protection', '1; mode=block')
        }

        // Referrer Policy
        c.header('Referrer-Policy', this.config.referrerPolicy)

        // Permissions Policy
        if (this.config.permissionsPolicy) {
          c.header('Permissions-Policy', this.config.permissionsPolicy)
        }

        // Remove server information
        res.removeHeader('X-Powered-By')

        // Add security-related custom headers
        if (this.config.customHeaders) {
          Object.entries(this.config.customHeaders).forEach(([key, value]) => {
            c.header(key, value)
          })
        }

        // Add additional security headers
        this.addAdditionalSecurityHeaders(c)

        this.logger.logSystemEvent('security_headers_applied', {
          url: c.req.url,
          method: c.req.method,
          isSecure: c.req.url.startsWith('https://'),
          headersApplied: [
            'Strict-Transport-Security',
            'Content-Security-Policy',
            'X-Frame-Options',
            'X-Content-Type-Options',
            'X-XSS-Protection',
            'Referrer-Policy',
            'Permissions-Policy',
          ].filter(header => c.res.headers.get(header)),
          timestamp: new Date().toISOString(),
        })

        next()
      } catch (error) {
        this.logger.logError('security_headers_middleware_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          url: c.req.url,
          timestamp: new Date().toISOString(),
        })
        throw error
      }
    }
  }

  private addAdditionalSecurityHeaders(c: Context): void {
    const url = new URL(c.req.url)
    // Prevent caching of sensitive information
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
      c.header(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate',
      )
      c.header('Pragma', 'no-cache')
      c.header('Expires', '0')
    }

    // Cross-origin resource sharing for API endpoints
    if (url.pathname.startsWith('/api/')) {
      c.header(
        'Access-Control-Allow-Origin',
        process.env.ALLOWED_ORIGINS || '*',
      )
      c.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS',
      )
      c.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With',
      )
      c.header('Access-Control-Max-Age', '86400') // 24 hours

      // Handle preflight requests
      if (c.req.method === 'OPTIONS') {
        c.header('Access-Control-Allow-Credentials', 'true')
      }
    }

    // Anti-clickjacking for specific routes
    if (url.pathname.startsWith('/admin/') || url.pathname.includes('/settings')) {
      c.header('X-Frame-Options', 'SAMEORIGIN')
    }

    // Add timing headers for monitoring
    c.header('X-Response-Time', Date.now().toString())
  }

  public generateCSPForChatInterface(): string {
    // Content Security Policy specifically for AI chat interface
    const defaultSrc = ["'self'"]
    const scriptSrc = ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
    const styleSrc = ["'self'", "'unsafe-inline'"]
    const imgSrc = ["'self'", 'data:', 'https:']
    const fontSrc = ["'self'", 'data:', 'https:']
    const connectSrc = ["'self'", 'wss:', 'https:']
    const frameSrc = ["'none'"]
    const objectSrc = ["'none'"]
    const baseUri = ["'self'"]
    const formAction = ["'self'"]
    const frameAncestors = ["'none'"]

    // Add CopilotKit specific CSP directives
    scriptSrc.push('https://cdn.jsdelivr.net')
    connectSrc.push('https://api.openai.com')
    connectSrc.push('wss://*.supabase.co')

    const cspDirectives = {
      'default-src': defaultSrc.join(' '),
      'script-src': scriptSrc.join(' '),
      'style-src': styleSrc.join(' '),
      'img-src': imgSrc.join(' '),
      'font-src': fontSrc.join(' '),
      'connect-src': connectSrc.join(' '),
      'frame-src': frameSrc.join(' '),
      'object-src': objectSrc.join(' '),
      'base-uri': baseUri.join(' '),
      'form-action': formAction.join(' '),
      'frame-ancestors': frameAncestors.join(' '),
      'upgrade-insecure-requests': '',
      'block-all-mixed-content': '',
    }

    return Object.entries(cspDirectives)
      .map(([directive, _value]) => value ? `${directive} ${value}` : directive)
      .join('; ')
  }

  public generatePermissionsPolicy(): string {
    // Permissions Policy for enhanced security
    const policies = [
      'accelerometer=()',
      'ambient-light-sensor=()',
      'battery=()',
      'bluetooth=()',
      'camera=()',
      'cross-origin-isolated=()',
      'display-capture=()',
      'document-domain=()',
      'encrypted-media=()',
      'execution-while-not-rendered=()',
      'execution-while-out-of-viewport=()',
      'fullscreen=()',
      'geolocation=()',
      'gyroscope=()',
      'hid=()',
      'identity-credentials-get=()',
      'idle-detection=()',
      'local-fonts=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'otp-credentials=()',
      'payment=()',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'serial=()',
      'storage-access=()',
      'usb=()',
      'web-share=()',
      'window-management=()',
      'xr-spatial-tracking=()',
    ]

    return policies.join(', ')
  }

  public validateHSTSConfig(): {
    valid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    if (this.config.hstsMaxAge < 31536000) {
      // 1 year in seconds
      errors.push(
        'HSTS max-age must be at least 31536000 (1 year) for production',
      )
    }

    if (this.config.hstsMaxAge > 63072000) {
      // 2 years in seconds
      warnings.push(
        'Consider using max-age of 31536000 (1 year) for better compatibility',
      )
    }

    if (!this.config.enableHSTS) {
      warnings.push(
        'HSTS is disabled. Consider enabling it for production security.',
      )
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  public getSecurityReport(): {
    enabledFeatures: string[]
    hstsConfig: {
      enabled: boolean
      maxAge: number
      includeSubDomains: boolean
      preload: boolean
    }
    cspEnabled: boolean
    headersCount: number
    validation: {
      valid: boolean
      errors: string[]
      warnings: string[]
    }
  } {
    const validation = this.validateHSTSConfig()

    return {
      enabledFeatures: [
        ...(this.config.enableHSTS ? ['HSTS'] : []),
        ...(this.config.enableCSP ? ['CSP'] : []),
        ...(this.config.enableFrameGuard ? ['Frame Guard'] : []),
        ...(this.config.enableXSSProtection ? ['XSS Protection'] : []),
        ...(this.config.enableContentTypeSniffingProtection
          ? ['Content Type Protection']
          : []),
      ],
      hstsConfig: {
        enabled: this.config.enableHSTS,
        maxAge: this.config.hstsMaxAge,
        includeSubDomains: this.config.hstsIncludeSubDomains,
        preload: this.config.hstsPreload,
      },
      cspEnabled: this.config.enableCSP,
      headersCount: 10, // Approximate count of security headers
      validation,
    }
  }
}

// HTTPS Redirect Middleware
export async function httpsRedirectMiddleware(c: Context, next: Next): Promise<void> {
  const url = new URL(c.req.url)
  const isHttps = url.protocol === 'https:'
  const forwardedProto = c.req.header('x-forwarded-proto')

  if (
    process.env.NODE_ENV === 'production' &&
    !isHttps &&
    forwardedProto !== 'https'
  ) {
    const httpsUrl = `https://${url.host}${url.pathname}${url.search}`
    return c.redirect(httpsUrl, 301)
  }
  await next()
}

// Healthcare Security Headers Middleware
export async function healthcareSecurityHeadersMiddleware(c: Context, next: Next): Promise<void> {
  const logger: Logger = {
    logSystemEvent: (event: string, data: any) => console.warn(`[${event}]`, data),
    logError: (event: string, data: any) => console.error(`[${event}]`, data),
  }

  const config: SecurityHeadersConfig = {
    enableHSTS: true,
    hstsMaxAge: 31536000, // 1 year
    hstsIncludeSubDomains: true,
    hstsPreload: true,
    enableCSP: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' wss: https: https://api.openai.com wss://*.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests; block-all-mixed-content",
    enableFrameGuard: true,
    enableXSSProtection: true,
    enableContentTypeSniffingProtection: true,
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy:
      'accelerometer=(), ambient-light-sensor=(), battery=(), bluetooth=(), camera=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(), geolocation=(), gyroscope=(), hid=(), identity-credentials-get=(), idle-detection=(), local-fonts=(), magnetometer=(), microphone=(), midi=(), otp-credentials=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), storage-access=(), usb=(), web-share=(), window-management=(), xr-spatial-tracking=()',
    customHeaders: {
      'X-Healthcare-API': 'NeonPro-v1.0',
      'X-LGPD-Compliant': 'true',
    },
  }

  const middleware = new SecurityHeadersMiddleware(config, logger)
  await middleware.middleware()(c, next)
}
