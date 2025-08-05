/**
 * Memory-based Rate Limiter Implementation
 * Simple in-memory rate limiting for development and small-scale production
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = exports.MemoryRateLimiter = void 0;
exports.createRateLimitIdentifier = createRateLimitIdentifier;
var config_1 = require("./config");
/**
 * In-memory rate limit store
 * Note: This will reset on server restart. Use Redis for production.
 */
var rateLimitStore = {};
/**
 * Memory-based rate limiter class
 */
var MemoryRateLimiter = /** @class */ (() => {
  function MemoryRateLimiter() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000,
    );
  }
  /**
   * Check if request should be rate limited
   */
  MemoryRateLimiter.prototype.checkRateLimit = function (identifier, config) {
    return __awaiter(this, void 0, void 0, function () {
      var now, key, entry;
      return __generator(this, (_a) => {
        now = Date.now();
        key = "rate_limit:".concat(identifier);
        entry = rateLimitStore[key];
        if (!entry || now >= entry.resetTime) {
          // Create new window
          entry = {
            count: 0,
            resetTime: now + config.windowMs,
          };
          rateLimitStore[key] = entry;
        }
        // Check if currently blocked
        if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
          return [
            2 /*return*/,
            {
              allowed: false,
              limit: config.maxRequests,
              remaining: 0,
              resetTime: entry.resetTime,
              retryAfter: Math.ceil((entry.blockUntil - now) / 1000),
            },
          ];
        }
        // Remove block if expired
        if (entry.blocked && entry.blockUntil && now >= entry.blockUntil) {
          entry.blocked = false;
          entry.blockUntil = undefined;
        }
        // Check rate limit
        if (entry.count >= config.maxRequests) {
          // Block for additional time if repeatedly hitting limit
          entry.blocked = true;
          entry.blockUntil = now + config.windowMs * 2; // Block for 2x window
          return [
            2 /*return*/,
            {
              allowed: false,
              limit: config.maxRequests,
              remaining: 0,
              resetTime: entry.resetTime,
              retryAfter: Math.ceil(config.windowMs / 1000),
            },
          ];
        }
        // Allow request and increment counter
        entry.count++;
        rateLimitStore[key] = entry;
        return [
          2 /*return*/,
          {
            allowed: true,
            limit: config.maxRequests,
            remaining: Math.max(0, config.maxRequests - entry.count),
            resetTime: entry.resetTime,
          },
        ];
      });
    });
  };
  /**
   * Get rate limit configuration for endpoint and user
   */
  MemoryRateLimiter.prototype.getRateLimitConfig = (endpoint, userRole) => {
    // Get base config
    var baseConfig = config_1.RATE_LIMIT_CONFIGS[endpoint] || config_1.RATE_LIMIT_CONFIGS.default;
    // Apply role-based multiplier
    if (userRole && config_1.USER_ROLE_LIMITS[userRole]) {
      var roleConfig = config_1.USER_ROLE_LIMITS[userRole];
      return __assign(__assign({}, baseConfig), {
        maxRequests: Math.floor(baseConfig.maxRequests * roleConfig.multiplier),
      });
    }
    return baseConfig;
  };
  /**
   * Check if IP is whitelisted
   */
  MemoryRateLimiter.prototype.isWhitelisted = (ip) => config_1.RATE_LIMIT_WHITELIST.includes(ip);
  /**
   * Clean up expired entries
   */
  MemoryRateLimiter.prototype.cleanup = () => {
    var now = Date.now();
    for (var key in rateLimitStore) {
      var entry = rateLimitStore[key];
      // Remove expired entries
      if (now >= entry.resetTime && (!entry.blockUntil || now >= entry.blockUntil)) {
        delete rateLimitStore[key];
      }
    }
  };
  /**
   * Manually reset rate limit for identifier
   */
  MemoryRateLimiter.prototype.resetRateLimit = function (identifier) {
    return __awaiter(this, void 0, void 0, function () {
      var key;
      return __generator(this, (_a) => {
        key = "rate_limit:".concat(identifier);
        delete rateLimitStore[key];
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get current rate limit status
   */
  MemoryRateLimiter.prototype.getRateLimitStatus = function (identifier, config) {
    return __awaiter(this, void 0, void 0, function () {
      var now, key, entry;
      return __generator(this, (_a) => {
        now = Date.now();
        key = "rate_limit:".concat(identifier);
        entry = rateLimitStore[key];
        if (!entry || now >= entry.resetTime) {
          return [
            2 /*return*/,
            {
              limit: config.maxRequests,
              remaining: config.maxRequests,
              resetTime: now + config.windowMs,
              blocked: false,
            },
          ];
        }
        return [
          2 /*return*/,
          {
            limit: config.maxRequests,
            remaining: Math.max(0, config.maxRequests - entry.count),
            resetTime: entry.resetTime,
            blocked: entry.blocked || false,
          },
        ];
      });
    });
  };
  /**
   * Cleanup on shutdown
   */
  MemoryRateLimiter.prototype.destroy = function () {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  };
  return MemoryRateLimiter;
})();
exports.MemoryRateLimiter = MemoryRateLimiter;
// Global rate limiter instance
exports.rateLimiter = new MemoryRateLimiter();
/**
 * Helper function to create rate limit identifier
 */
function createRateLimitIdentifier(ip, userId, endpoint) {
  var parts = [ip];
  if (userId) {
    parts.push("user:".concat(userId));
  }
  if (endpoint) {
    parts.push("endpoint:".concat(endpoint));
  }
  return parts.join(":");
}
