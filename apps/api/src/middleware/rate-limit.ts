// Rate limiting wrapper (Phase 3.4 T030)
// Adapts existing rate-limiting manager to provide simple presets for chat endpoints.
import type { Context, Next } from 'hono';
import { rateLimitMiddleware as baseRateLimit } from './rate-limiting';

// Preset: 10 requests per 5 minutes and 30 per hour per key (user/ip)
// We approximate by first enforcing the tighter window (5m/10),
// then a second pass for hourly if needed using an internal manager.
// For now, reuse baseRateLimit with window override and rely on manager's advanced logic.

export function chatRateLimit() {
  // Create configurations for 5-minute and 1-hour windows
  const config5m = {
    default: { maxRequests: 10, windowMs: 5 * 60 * 1000 },
    endpoints: {},
  };
  
  const config1h = {
    default: { maxRequests: 30, windowMs: 60 * 60 * 1000 },
    endpoints: {},
  };

  const limit5m = baseRateLimit(config5m);
  const limit1h = baseRateLimit(config1h);

  return async (c: Context, next: Next) => {
    try {
      await limit5m(c, async () => {});
    } catch (error) {
      // Rate limit exceeded for 5-minute window
      if (error instanceof Error && error.message.includes('RATE_LIMIT_EXCEEDED')) {
        throw error;
      }
    }
    
    try {
      await limit1h(c, async () => {});
    } catch (error) {
      // Rate limit exceeded for 1-hour window
      if (error instanceof Error && error.message.includes('RATE_LIMIT_EXCEEDED')) {
        throw error;
      }
    }
    
    return next();
  };
}
