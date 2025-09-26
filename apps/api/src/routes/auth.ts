/**
 * @file Better Auth API Routes
 * 
 * Integration of Better Auth with Hono API server
 * Provides authentication endpoints for the healthcare platform
 * 
 * @version 1.0.0
 * @author NeonPro Platform Team
 * Compliance: LGPD, ANVISA, CFM
 */

import { Hono } from 'hono'
import { auth } from '@/lib/auth/server'
import { logger } from '@/utils/healthcare-errors'

const authApp = new Hono()

// Mount Better Auth handler
authApp.all('/*', async (c) => {
  try {
    // Convert Hono request to Node.js-compatible request
    const url = new URL(c.req.url)
    const method = c.req.method
    const headers = Object.fromEntries(c.req.headers.entries())
    
    let body: any = undefined
    if (method !== 'GET' && method !== 'HEAD') {
      body = await c.req.text()
    }

    // Create a Request object for Better Auth
    const request = new Request(url.toString(), {
      method,
      headers,
      body
    })

    // Call Better Auth handler
    const response = await auth.handler(request)
    
    // Convert Response back to Hono response
    const responseHeaders = Object.fromEntries(response.headers.entries())
    const responseBody = await response.text()
    
    // Healthcare audit logging
    if (url.pathname.includes('/sign-in') || url.pathname.includes('/sign-up')) {
      logger.info('Authentication attempt', {
        path: url.pathname,
        method,
        userAgent: headers['user-agent'],
        ip: headers['x-forwarded-for'] || headers['x-real-ip']
      })
    }
    
    return c.text(responseBody, response.status, responseHeaders)
    
  } catch (error) {
    logger.error('Auth handler error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: c.req.path,
      method: c.req.method
    })
    
    return c.json({ error: 'Authentication service error' }, 500)
  }
})

export { authApp }