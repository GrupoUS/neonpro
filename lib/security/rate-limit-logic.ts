    // Increment count
    entry.count++;
    rateLimitCache.set(key, entry);

    // Check if limit exceeded
    if (entry.count > limits.requests) {
      entry.blocked = true;
      entry.blockUntil = now + (limits.blockDurationMs || limits.windowMs);
      rateLimitCache.set(key, entry);

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockUntil,
        reason: "Rate limit exceeded",
      };
    }

    return {
      allowed: true,
      remaining: limits.requests - entry.count,
      resetTime: entry.firstRequest + limits.windowMs,
    };
  }

  /**
   * 🤖 Adaptive limits based on route sensitivity
   */
  static getAdaptiveLimits(route: string, method: string): {
    requests: number;
    windowMs: number;
    blockDurationMs: number;
  } {
    // High sensitivity routes (auth, payments)
    if (route.includes('/auth') || route.includes('/payment')) {
      return {
        requests: method === 'POST' ? 5 : 15, // Very restrictive
        windowMs: 60 * 1000, // 1 minute
        blockDurationMs: 5 * 60 * 1000, // 5 minutes block
      };
    }

    // API routes (moderate sensitivity)
    if (route.startsWith('/api/')) {
      return {
        requests: method === 'POST' ? 30 : 100,
        windowMs: 60 * 1000, // 1 minute
        blockDurationMs: 2 * 60 * 1000, // 2 minutes block
      };
    }

    // Static/public routes (low sensitivity)
    return {
      requests: 200,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 30 * 1000, // 30 seconds block
    };
  }
}