/**
 * Security Headers Middleware for NeonPro API
 * Implements comprehensive security headers for healthcare compliance
 */

import type { Context, Next } from 'hono'
import { getSecurityHeaders } from '../config/https-config'

/**
 * Security headers middleware for HTTPS responses
 * Adds all required security headers for healthcare compliance
 */
export const securityHeadersMiddleware = async (c: Context, next: Next) => {
  // Execute the next middleware/handler first
  await next()

  // Add security headers to response
  const headers = getSecurityHeaders()
  
  Object.entries(headers).forEach(([key, value]) => {
    c.header(key, value)
  })

  // Add additional response headers for API
  c.header('X-Powered-By', 'NeonPro Healthcare Platform')
  c.header('X-API-Version', '1.0.0')
  
  // Cache control for sensitive healthcare data
  if (c.req.path.includes('/api/')) {
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    c.header('Pragma', 'no-cache')
    c.header('Expires', '0')
  }
}

/**
 * CORS middleware with HTTPS enforcement
 */
export const corsMiddleware = async (c: Context, next: Next) => {
  const origin = c.req.header('origin')
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || [
    'https://localhost:3000',
    'https://neonpro.com',
    'https://api.neonpro.com'
  ]

  // Only allow HTTPS origins in production
  if (process.env.NODE_ENV === 'production' && origin) {
    if (!origin.startsWith('https://')) {
      return c.json({ error: 'HTTPS required' }, 403)
    }
  }

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin)
  }

  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  c.header('Access-Control-Allow-Credentials', 'true')
  c.header('Access-Control-Max-Age', '86400') // 24 hours

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204)
  }

  await next()
}

/**
 * HTTPS redirect middleware
 * Redirects HTTP requests to HTTPS in production
 */
export const httpsRedirectMiddleware = async (c: Context, next: Next) => {
  // Skip in development
  if (process.env.NODE_ENV !== 'production') {
    await next()
    return
  }

  const protocol = c.req.header('x-forwarded-proto') || 'http'
  const host = c.req.header('host')

  if (protocol !== 'https') {
    const httpsUrl = `https://${host}${c.req.path}`
    return c.redirect(httpsUrl, 301)
  }

  await next()
}

/**
 * Rate limiting middleware for security
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export const rateLimitMiddleware = async (c: Context, next: Next) => {
  const clientIp = c.req.header('x-forwarded-for') || 
                   c.req.header('x-real-ip') || 
                   'unknown'
  
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 100 // per window

  const clientData = requestCounts.get(clientIp)

  if (!clientData || now > clientData.resetTime) {
    // Reset or initialize counter
    requestCounts.set(clientIp, {
      count: 1,
      resetTime: now + windowMs
    })
  } else {
    // Increment counter
    clientData.count++
    
    if (clientData.count > maxRequests) {
      c.header('Retry-After', Math.ceil((clientData.resetTime - now) / 1000).toString())
      return c.json({ 
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      }, 429)
    }
  }

  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance
    const cutoff = now - windowMs
    for (const [ip, data] of requestCounts.entries()) {
      if (data.resetTime < cutoff) {
        requestCounts.delete(ip)
      }
    }
  }

  await next()
}