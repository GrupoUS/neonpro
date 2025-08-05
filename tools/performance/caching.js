"use strict";
/**
 * Advanced Caching Strategies for Next.js 15
 *
 * Comprehensive caching implementation following 2025 best practices
 * Includes multi-level caching, CDN optimization, and cache invalidation
 */
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachePerformanceMonitor =
  exports.CDNOptimization =
  exports.CacheInvalidation =
  exports.CacheHeaders =
  exports.cacheManager =
  exports.CacheManager =
  exports.CacheKeyGenerator =
  exports.CACHE_CONFIG =
    void 0;
exports.withCache = withCache;
var server_1 = require("next/server");
// Cache configuration constants
exports.CACHE_CONFIG = {
  // Static assets - long-term caching
  STATIC_ASSETS: {
    maxAge: 31536000, // 1 year
    swr: 31536000, // 1 year stale-while-revalidate
    immutable: true,
  },
  // API responses - medium-term with revalidation
  API_RESPONSES: {
    maxAge: 300, // 5 minutes
    swr: 3600, // 1 hour stale-while-revalidate
    immutable: false,
  },
  // Dynamic content - short-term with frequent updates
  DYNAMIC_CONTENT: {
    maxAge: 60, // 1 minute
    swr: 300, // 5 minutes stale-while-revalidate
    immutable: false,
  },
  // User-specific data - no caching
  USER_SPECIFIC: {
    maxAge: 0,
    swr: 0,
    immutable: false,
  },
};
// Cache key generators
var CacheKeyGenerator = /** @class */ (function () {
  function CacheKeyGenerator() {}
  CacheKeyGenerator.analytics = function (userId, dateRange, filters) {
    var filterHash = filters ? this.hashObject(filters) : "no-filters";
    return "analytics:".concat(userId, ":").concat(dateRange, ":").concat(filterHash);
  };
  CacheKeyGenerator.subscription = function (userId) {
    return "subscription:".concat(userId);
  };
  CacheKeyGenerator.dashboard = function (userId, page) {
    return "dashboard:".concat(userId, ":").concat(page);
  };
  CacheKeyGenerator.apiResponse = function (endpoint, params) {
    var paramHash = params ? this.hashObject(params) : "no-params";
    return "api:".concat(endpoint, ":").concat(paramHash);
  };
  CacheKeyGenerator.hashObject = function (obj) {
    var str = JSON.stringify(obj, Object.keys(obj).sort());
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  };
  return CacheKeyGenerator;
})();
exports.CacheKeyGenerator = CacheKeyGenerator;
// Multi-level cache manager
var CacheManager = /** @class */ (function () {
  function CacheManager() {
    this.memoryCache = new Map();
    this.DEFAULT_TTL = 300000; // 5 minutes
  }
  // Set cache with TTL and tags
  CacheManager.prototype.set = function (key, data, ttl, tags) {
    var expires = Date.now() + (ttl || this.DEFAULT_TTL);
    this.memoryCache.set(key, { data: data, expires: expires, tags: tags || [] });
  };
  // Get from cache
  CacheManager.prototype.get = function (key) {
    var cached = this.memoryCache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expires) {
      this.memoryCache.delete(key);
      return null;
    }
    return cached.data;
  };
  // Delete specific key
  CacheManager.prototype.delete = function (key) {
    return this.memoryCache.delete(key);
  };
  // Invalidate by tags
  CacheManager.prototype.invalidateByTags = function (tags) {
    var invalidated = 0;
    for (var _i = 0, _a = this.memoryCache.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        cached = _b[1];
      if (
        cached.tags.some(function (tag) {
          return tags.includes(tag);
        })
      ) {
        this.memoryCache.delete(key);
        invalidated++;
      }
    }
    return invalidated;
  };
  // Clear expired entries
  CacheManager.prototype.cleanup = function () {
    var now = Date.now();
    var cleaned = 0;
    for (var _i = 0, _a = this.memoryCache.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        cached = _b[1];
      if (now > cached.expires) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }
    return cleaned;
  };
  // Get cache statistics
  CacheManager.prototype.getStats = function () {
    return {
      size: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys()),
      memoryUsage: JSON.stringify(__spreadArray([], this.memoryCache.entries(), true)).length,
    };
  };
  return CacheManager;
})();
exports.CacheManager = CacheManager;
// Global cache instance
exports.cacheManager = new CacheManager();
// Setup automatic cleanup every 5 minutes
if (typeof window === "undefined") {
  setInterval(function () {
    var cleaned = exports.cacheManager.cleanup();
    if (cleaned > 0) {
      console.log("\uD83E\uDDF9 Cleaned ".concat(cleaned, " expired cache entries"));
    }
  }, 300000); // 5 minutes
}
// HTTP Cache Headers Helper
var CacheHeaders = /** @class */ (function () {
  function CacheHeaders() {}
  CacheHeaders.staticAsset = function () {
    var headers = new Headers();
    headers.set(
      "Cache-Control",
      "public, max-age=".concat(exports.CACHE_CONFIG.STATIC_ASSETS.maxAge, ", immutable"),
    );
    headers.set("ETag", '"'.concat(Date.now(), '"'));
    return headers;
  };
  CacheHeaders.apiResponse = function (config) {
    if (config === void 0) {
      config = exports.CACHE_CONFIG.API_RESPONSES;
    }
    var headers = new Headers();
    headers.set(
      "Cache-Control",
      "public, max-age=".concat(config.maxAge, ", stale-while-revalidate=").concat(config.swr),
    );
    headers.set("ETag", '"'.concat(Date.now(), '"'));
    headers.set("Vary", "Accept, Authorization");
    return headers;
  };
  CacheHeaders.dynamicContent = function () {
    var headers = new Headers();
    headers.set(
      "Cache-Control",
      "public, max-age="
        .concat(exports.CACHE_CONFIG.DYNAMIC_CONTENT.maxAge, ", stale-while-revalidate=")
        .concat(exports.CACHE_CONFIG.DYNAMIC_CONTENT.swr),
    );
    headers.set("ETag", '"'.concat(Date.now(), '"'));
    return headers;
  };
  CacheHeaders.noCache = function () {
    var headers = new Headers();
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");
    return headers;
  };
  CacheHeaders.conditionalCache = function (request) {
    var headers = new Headers();
    // Check if user is authenticated
    var isAuthenticated = request.headers.get("authorization") || request.cookies.get("session");
    if (isAuthenticated) {
      // Private cache for authenticated users
      headers.set("Cache-Control", "private, max-age=300");
    } else {
      // Public cache for anonymous users
      headers.set("Cache-Control", "public, max-age=3600");
    }
    return headers;
  };
  return CacheHeaders;
})();
exports.CacheHeaders = CacheHeaders;
// Cache invalidation strategies
var CacheInvalidation = /** @class */ (function () {
  function CacheInvalidation() {}
  // Invalidate user-specific caches
  CacheInvalidation.invalidateUser = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var tags, invalidated;
      return __generator(this, function (_a) {
        tags = [
          "user:".concat(userId),
          "analytics:".concat(userId),
          "subscription:".concat(userId),
        ];
        invalidated = exports.cacheManager.invalidateByTags(tags);
        console.log(
          "\uD83D\uDDD1\uFE0F Invalidated "
            .concat(invalidated, " cache entries for user ")
            .concat(userId),
        );
        return [2 /*return*/];
      });
    });
  };
  // Invalidate analytics caches
  CacheInvalidation.invalidateAnalytics = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var tags, invalidated;
      return __generator(this, function (_a) {
        tags = userId ? ["analytics:".concat(userId)] : ["analytics"];
        invalidated = exports.cacheManager.invalidateByTags(tags);
        console.log("\uD83D\uDCCA Invalidated ".concat(invalidated, " analytics cache entries"));
        return [2 /*return*/];
      });
    });
  };
  // Invalidate subscription caches
  CacheInvalidation.invalidateSubscriptions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var invalidated;
      return __generator(this, function (_a) {
        invalidated = exports.cacheManager.invalidateByTags(["subscription"]);
        console.log("\uD83D\uDCB3 Invalidated ".concat(invalidated, " subscription cache entries"));
        return [2 /*return*/];
      });
    });
  };
  // Time-based invalidation
  CacheInvalidation.scheduleInvalidation = function (key, delay) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        setTimeout(function () {
          exports.cacheManager.delete(key);
          console.log("\u23F0 Scheduled invalidation executed for key: ".concat(key));
        }, delay);
        return [2 /*return*/];
      });
    });
  };
  return CacheInvalidation;
})();
exports.CacheInvalidation = CacheInvalidation;
// CDN optimization utilities
var CDNOptimization = /** @class */ (function () {
  function CDNOptimization() {}
  // Generate CDN-optimized URLs
  CDNOptimization.imageUrl = function (src, options) {
    if (options === void 0) {
      options = {};
    }
    var width = options.width,
      height = options.height,
      _a = options.quality,
      quality = _a === void 0 ? 75 : _a,
      _b = options.format,
      format = _b === void 0 ? "auto" : _b;
    // Use Next.js Image Optimization API
    var params = new URLSearchParams();
    if (width) params.set("w", width.toString());
    if (height) params.set("h", height.toString());
    params.set("q", quality.toString());
    if (format !== "auto") params.set("f", format);
    return "/_next/image?url=".concat(encodeURIComponent(src), "&").concat(params.toString());
  };
  // Preload critical resources
  CDNOptimization.generatePreloadLinks = function (resources) {
    return resources
      .map(function (resource) {
        var link = '<link rel="preload" href="'
          .concat(resource.href, '" as="')
          .concat(resource.as, '"');
        if (resource.type) link += ' type="'.concat(resource.type, '"');
        if (resource.crossorigin) link += " crossorigin";
        return link + ">";
      })
      .join("\n");
  };
  // Generate resource hints
  CDNOptimization.generateResourceHints = function (domains) {
    return domains
      .map(function (domain) {
        return '<link rel="dns-prefetch" href="//'.concat(domain, '">');
      })
      .join("\n");
  };
  return CDNOptimization;
})();
exports.CDNOptimization = CDNOptimization;
// Cache middleware for API routes
function withCache(handler, config) {
  var _this = this;
  if (config === void 0) {
    config = {};
  }
  return function (req) {
    return __awaiter(_this, void 0, void 0, function () {
      var _a, ttl, _b, tags, keyGenerator, skipCache, cacheKey, cached, response, data;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            (_a = config.ttl),
              (ttl = _a === void 0 ? 300000 : _a),
              (_b = config.tags),
              (tags = _b === void 0 ? [] : _b),
              (keyGenerator = config.keyGenerator),
              (skipCache = config.skipCache);
            // Skip caching if specified
            if (skipCache && skipCache(req)) {
              return [2 /*return*/, handler(req)];
            }
            cacheKey = keyGenerator
              ? keyGenerator(req)
              : CacheKeyGenerator.apiResponse(
                  req.url,
                  Object.fromEntries(req.nextUrl.searchParams),
                );
            cached = exports.cacheManager.get(cacheKey);
            if (cached) {
              console.log("\uD83D\uDCA8 Cache hit for key: ".concat(cacheKey));
              return [
                2 /*return*/,
                new server_1.NextResponse(JSON.stringify(cached), {
                  status: 200,
                  headers: CacheHeaders.apiResponse().set("X-Cache", "HIT"),
                }),
              ];
            }
            return [
              4 /*yield*/,
              handler(req),
              // Cache successful responses
            ];
          case 1:
            response = _c.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _c.sent();
            exports.cacheManager.set(cacheKey, data, ttl, tags);
            console.log("\uD83D\uDCBE Cached response for key: ".concat(cacheKey));
            _c.label = 3;
          case 3:
            return [2 /*return*/, response];
        }
      });
    });
  };
}
// Performance monitoring for cache efficiency
var CachePerformanceMonitor = /** @class */ (function () {
  function CachePerformanceMonitor() {}
  CachePerformanceMonitor.recordHit = function () {
    this.hits++;
  };
  CachePerformanceMonitor.recordMiss = function () {
    this.misses++;
  };
  CachePerformanceMonitor.getStats = function () {
    var total = this.hits + this.misses;
    var hitRate = total > 0 ? (this.hits / total) * 100 : 0;
    var uptime = Date.now() - this.startTime;
    return {
      hits: this.hits,
      misses: this.misses,
      total: total,
      hitRate: parseFloat(hitRate.toFixed(2)),
      uptime: uptime,
      cacheStats: exports.cacheManager.getStats(),
    };
  };
  CachePerformanceMonitor.reset = function () {
    this.hits = 0;
    this.misses = 0;
    this.startTime = Date.now();
  };
  CachePerformanceMonitor.hits = 0;
  CachePerformanceMonitor.misses = 0;
  CachePerformanceMonitor.startTime = Date.now();
  return CachePerformanceMonitor;
})();
exports.CachePerformanceMonitor = CachePerformanceMonitor;
