"use strict";
/**
 * Rate Limiting Module Export
 * Centralized exports for rate limiting functionality
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMIT_HEADERS = exports.RATE_LIMIT_MESSAGES = exports.RATE_LIMIT_WHITELIST = exports.USER_ROLE_LIMITS = exports.RATE_LIMIT_CONFIGS = exports.MemoryRateLimiter = exports.createRateLimitIdentifier = exports.rateLimiter = void 0;
__exportStar(require("./config"), exports);
__exportStar(require("./memory-limiter"), exports);
// Re-export commonly used items
var memory_limiter_1 = require("./memory-limiter");
Object.defineProperty(exports, "rateLimiter", { enumerable: true, get: function () { return memory_limiter_1.rateLimiter; } });
Object.defineProperty(exports, "createRateLimitIdentifier", { enumerable: true, get: function () { return memory_limiter_1.createRateLimitIdentifier; } });
Object.defineProperty(exports, "MemoryRateLimiter", { enumerable: true, get: function () { return memory_limiter_1.MemoryRateLimiter; } });
var config_1 = require("./config");
Object.defineProperty(exports, "RATE_LIMIT_CONFIGS", { enumerable: true, get: function () { return config_1.RATE_LIMIT_CONFIGS; } });
Object.defineProperty(exports, "USER_ROLE_LIMITS", { enumerable: true, get: function () { return config_1.USER_ROLE_LIMITS; } });
Object.defineProperty(exports, "RATE_LIMIT_WHITELIST", { enumerable: true, get: function () { return config_1.RATE_LIMIT_WHITELIST; } });
Object.defineProperty(exports, "RATE_LIMIT_MESSAGES", { enumerable: true, get: function () { return config_1.RATE_LIMIT_MESSAGES; } });
Object.defineProperty(exports, "RATE_LIMIT_HEADERS", { enumerable: true, get: function () { return config_1.RATE_LIMIT_HEADERS; } });
