import { logger } from '@/utils/healthcare-errors'
import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'

/**
 * Simple in-memory rate limiting for chat endpoints
 */
class ChatRateLimiter {
  private limits = new Map<
    string,
    {
      requests: number[]
      windowStart: number
      windowMs: number
      maxRequests: number
    }
  >()

  isLimited(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const existing = this.limits.get(key)

    if (!existing) {
      this.limits.set(key, {
        requests: [now],
        windowStart: now,
        windowMs,
        maxRequests,
      })
      return false
    }

    // Clean up old requests outside the window
    const cutoff = now - windowMs
    existing.requests = existing.requests.filter(time => time > cutoff)

    // Check if limit exceeded
    if (existing.requests.length >= maxRequests) {
      return true
    }

    // Add current request
    existing.requests.push(now)
    return false
  }

  getRemainingRequests(
    key: string,
    maxRequests: number,
    windowMs: number,
  ): number {
    const now = Date.now()
    const existing = this.limits.get(key)

    if (!existing) {
      return maxRequests - 1 // One request will be made
    }

    // Clean up old requests
    const cutoff = now - windowMs
    existing.requests = existing.requests.filter(time => time > cutoff)

    return Math.max(0, maxRequests - existing.requests.length)
  }

  getResetTime(key: string, windowMs: number): number {
    const existing = this.limits.get(key)
    if (!existing || existing.requests.length === 0) {
      return Date.now() + windowMs
    }

    // Reset time is when the oldest request expires
    return existing.requests[0] + windowMs
  }
}

const chatLimiter = new ChatRateLimiter()

/**
 * Chat-specific rate limiting middleware
 * Implements stricter limits for AI chat endpoints
 */
export function chatRateLimit() {
  return async (c: Context, next: Next) => {
    try {
      // Get user identifier
      const user = c.get('user')
      const userId = user?.id || c.get('userId') || 'anonymous'
      const ip = c.req.header('x-forwarded-for') ||
        c.req.header('x-real-ip') ||
        'unknown'

      // Use userId if available, otherwise fall back to IP
      const rateLimitKey = userId !== 'anonymous' ? `user:${userId}` : `ip:${ip}`

      // Chat-specific limits: 20 requests per 5 minutes, 100 per hour
      const shortWindowMs = 5 * 60 * 1000 // 5 minutes
      const longWindowMs = 60 * 60 * 1000 // 1 hour
      const shortWindowLimit = 20
      const longWindowLimit = 100

      // Check both short and long window limits
      const shortWindowLimited = chatLimiter.isLimited(
        `${rateLimitKey}:5m`,
        shortWindowLimit,
        shortWindowMs,
      )

      const longWindowLimited = chatLimiter.isLimited(
        `${rateLimitKey}:1h`,
        longWindowLimit,
        longWindowMs,
      )

      if (shortWindowLimited || longWindowLimited) {
        const remainingShort = chatLimiter.getRemainingRequests(
          `${rateLimitKey}:5m`,
          shortWindowLimit,
          shortWindowMs,
        )

        const remainingLong = chatLimiter.getRemainingRequests(
          `${rateLimitKey}:1h`,
          longWindowLimit,
          longWindowMs,
        )

        const resetTimeShort = chatLimiter.getResetTime(
          `${rateLimitKey}:5m`,
          shortWindowMs,
        )
        const resetTimeLong = chatLimiter.getResetTime(
          `${rateLimitKey}:1h`,
          longWindowMs,
        )

        // Use the more restrictive limit
        const resetTime = shortWindowLimited ? resetTimeShort : resetTimeLong
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)

        logger.warn('Chat rate limit exceeded', {
          userId,
          ip,
          rateLimitKey,
          shortWindowLimited,
          longWindowLimited,
          remainingShort,
          remainingLong,
          retryAfter,
          path: c.req.path,
        })

        // Set rate limit headers
        c.header('X-RateLimit-Limit-Short', shortWindowLimit.toString())
        c.header('X-RateLimit-Remaining-Short', remainingShort.toString())
        c.header(
          'X-RateLimit-Reset-Short',
          Math.ceil(resetTimeShort / 1000).toString(),
        )

        c.header('X-RateLimit-Limit-Long', longWindowLimit.toString())
        c.header('X-RateLimit-Remaining-Long', remainingLong.toString())
        c.header(
          'X-RateLimit-Reset-Long',
          Math.ceil(resetTimeLong / 1000).toString(),
        )

        c.header('Retry-After', retryAfter.toString())

        throw new HTTPException(429, {
          message: 'Chat rate limit exceeded. Please try again later.',
          cause: {
            code: 'CHAT_RATE_LIMIT_EXCEEDED',
            retryAfter,
            limits: {
              short: `${shortWindowLimit} requests per 5 minutes`,
              long: `${longWindowLimit} requests per hour`,
            },
          },
        })
      }

      // Set current rate limit status in headers
      const remainingShort = chatLimiter.getRemainingRequests(
        `${rateLimitKey}:5m`,
        shortWindowLimit,
        shortWindowMs,
      )

      const remainingLong = chatLimiter.getRemainingRequests(
        `${rateLimitKey}:1h`,
        longWindowLimit,
        longWindowMs,
      )

      c.header('X-RateLimit-Limit-Short', shortWindowLimit.toString())
      c.header('X-RateLimit-Remaining-Short', remainingShort.toString())
      c.header('X-RateLimit-Limit-Long', longWindowLimit.toString())
      c.header('X-RateLimit-Remaining-Long', remainingLong.toString())

      await next()
    } catch {
      if (error instanceof HTTPException) {
        throw error
      }

      logger.error('Chat rate limit middleware error', {
        error: error instanceof Error ? error.message : String(error),
        path: c.req.path,
      })

      // Don't block requests on rate limiter errors
      await next()
    }
  }
}

/**
 * General rate limiting middleware (re-export from rate-limiting.ts)
 */
export { rateLimitMiddleware as rateLimit } from './rate-limiting'
