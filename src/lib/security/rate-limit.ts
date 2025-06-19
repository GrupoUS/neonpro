import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create different rate limiters for different endpoints
export const rateLimiters = {
  // Login: 5 attempts per minute
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: '@neonpro/login',
  }),

  // Sign up: 3 attempts per minute
  signup: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'),
    analytics: true,
    prefix: '@neonpro/signup',
  }),

  // Password reset: 3 attempts per 15 minutes
  passwordReset: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '15 m'),
    analytics: true,
    prefix: '@neonpro/password-reset',
  }),

  // API calls: 10 requests per minute
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: '@neonpro/api',
  }),

  // General rate limiter: 30 requests per minute
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: '@neonpro/general',
  }),
}

export async function checkRateLimit(
  identifier: string,
  limiterType: keyof typeof rateLimiters = 'general'
) {
  const limiter = rateLimiters[limiterType]
  const { success, limit, reset, remaining } = await limiter.limit(identifier)

  return {
    success,
    limit,
    reset,
    remaining,
    retryAfter: success ? null : Math.floor((reset - Date.now()) / 1000),
  }
}
