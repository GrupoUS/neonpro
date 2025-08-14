// lib/security/rate-limiting.ts
export function rateLimiter() {
  return {
    remaining: 100,
    reset: Date.now() + 3600000,
    limit: 100
  };
}

export function checkRateLimit(key: string) {
  return { success: true, limit: 100, remaining: 99, reset: Date.now() + 3600000 };
}