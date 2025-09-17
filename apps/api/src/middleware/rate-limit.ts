// Rate limiting wrapper (Phase 3.4 T030)
// Adapts existing rate-limiting manager to provide simple presets for chat endpoints.
import type { Context, Next } from 'hono';
import { rateLimit as baseRateLimit } from './rate-limiting';

// Preset: 10 requests per 5 minutes and 30 per hour per key (user/ip)
// We approximate by first enforcing the tighter window (5m/10),
// then a second pass for hourly if needed using an internal manager.
// For now, reuse baseRateLimit with window override and rely on manager's advanced logic.

export function chatRateLimit() {
  // First layer: 10 per 5 minutes (600_000 ms)
  const limit5m = baseRateLimit({ windowMs: 5 * 60 * 1000, maxRequests: 10 });
  // Second layer (best-effort): 30 per hour
  const limit1h = baseRateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 30 });

  return async (c: Context, next: Next) => {
    const res5m = await limit5m(c, async () => {});
    if (res5m) return res5m; // base middleware returns a Response when blocked
    const res1h = await limit1h(c, async () => {});
    if (res1h) return res1h;
    return next();
  };
}
