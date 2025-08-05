"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = void 0;
exports.rateLimiter = rateLimiter;
exports.checkRateLimit = checkRateLimit;
// lib/security/rate-limiting.ts
function rateLimiter() {
  return {
    remaining: 100,
    reset: Date.now() + 3600000,
    limit: 100,
  };
}
function checkRateLimit(key) {
  return { success: true, limit: 100, remaining: 99, reset: Date.now() + 3600000 };
}
// Export with expected name
exports.rateLimit = rateLimiter;
