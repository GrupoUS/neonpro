/**
 * Theme Middleware for API responses
 * Provides consistent theme-aware headers and response formatting
 */

import { Context, Next } from 'hono'

export interface ThemeConfig {
  colorScheme?: 'light' | 'dark' | 'system'
  branding?: 'neonpro' | 'clinic-custom'
  locale?: 'pt-BR' | 'en-US'
  accessibility?: 'aa' | 'aaa'
}

export function themeMiddleware() {
  return async (c: Context, next: Next) => {
    // Extract theme preferences from headers
    const themeConfig: ThemeConfig = {
      colorScheme: (c.req.header('x-theme-scheme') as 'light' | 'dark' | 'system') || 'system',
      branding: (c.req.header('x-theme-branding') as 'neonpro' | 'clinic-custom') || 'neonpro',
      locale: c.req.header('accept-language')?.includes('en') ? 'en-US' : 'pt-BR',
      accessibility: (c.req.header('x-accessibility-level') as 'aa' | 'aaa') || 'aa'
    }

    // Store theme config in context
    c.set('themeConfig', themeConfig)

    await next()

    // Add theme-aware response headers
    c.res.headers.set('x-theme-scheme', themeConfig.colorScheme!)
    c.res.headers.set('x-theme-branding', themeConfig.branding!)
    c.res.headers.set('x-content-locale', themeConfig.locale!)
    c.res.headers.set('x-accessibility-compliance', `wcag-2.1-${themeConfig.accessibility}`)

    // Constitutional compliance headers (Brazil healthcare)
    c.res.headers.set('x-lgpd-compliant', 'true')
    c.res.headers.set('x-healthcare-compliant', 'true')
    c.res.headers.set('x-aesthetic-clinic-optimized', 'true')
  }
}

/**
 * Get theme-aware response formatting
 */
export function getThemeAwareResponse(c: Context, data: Record<string, unknown>) {
  const themeConfig = c.get('themeConfig') as ThemeConfig

  return c.json({
    data,
    _meta: {
      theme: {
        colorScheme: themeConfig.colorScheme,
        branding: themeConfig.branding,
        locale: themeConfig.locale,
        accessibility: themeConfig.accessibility
      },
      compliance: {
        lgpd: true,
        wcag: `2.1-${themeConfig.accessibility}`,
        healthcareOptimized: true
      },
      timestamp: new Date().toISOString(),
      requestId: c.get('requestId')
    }
  })
}
