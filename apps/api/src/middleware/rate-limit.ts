// Rate limiting wrapper (Phase 3.4 T030)
// Adapts existing rate-limiting manager to provide simple presets for chat endpoints.
import type { Context, Next } from 'hono';
import { healthcareRateLimit as baseRateLimit } from './rate-limiting';

// Preset: 10 requests per 5 minutes and 30 per hour per key (user/ip)
// Properly chains two rate limiting middlewares: 5-minute window first, then 1-hour window

export function chatRateLimit() {
  // Create configurations for 5-minute and 1-hour windows
  const config5m = {
    maxRequests: 10,
    windowMs: 5 * 60 * 1000,
  };

  const config1h = {
    maxRequests: 30,
    windowMs: 60 * 60 * 1000,
  };

  const limit5m = baseRateLimit(config5m);
  const limit1h = baseRateLimit(config1h);

  return async (c: Context, next: Next) => {
    // Chain the middlewares properly: 5-minute limit -> 1-hour limit -> next
    await limit5m(c, async () => {
      await limit1h(c, next);
    });
  };
}
