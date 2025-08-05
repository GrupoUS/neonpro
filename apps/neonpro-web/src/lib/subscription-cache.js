"use strict";
/**
 * Subscription Caching Strategies
 *
 * Advanced caching system for subscription data with intelligent cache management,
 * automatic invalidation, and performance optimization.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheManager = exports.globalSubscriptionCache = exports.SubscriptionCache = void 0;
/**
 * Intelligent subscription cache with LRU eviction and automatic cleanup
 */
var SubscriptionCache = /** @class */ (function () {
  function SubscriptionCache(config) {
    this.cache = new Map();
    this.hitCount = 0;
    this.missCount = 0;
    this.operations = [];
    this.cleanupTimer = null;
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      gracePeriodTTL: 30 * 1000, // 30 seconds
      errorTTL: 30 * 1000, // 30 seconds
      maxSize: 10000, // 10k entries
      cleanupInterval: 60 * 1000, // 1 minute
    };
    if (config) {
      this.config = __assign(__assign({}, this.config), config);
    }
    this.startCleanupTimer();
  }
  /**
   * Get cached subscription validation result
   */
  SubscriptionCache.prototype.get = function (key) {
    var startTime = Date.now();
    var entry = this.cache.get(key);
    if (!entry) {
      this.missCount++;
      this.recordOperation({
        type: "get",
        key: key,
        hit: false,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      });
      return null;
    }
    // Check expiration
    if (entry.expires <= Date.now()) {
      this.cache.delete(key);
      this.missCount++;
      this.recordOperation({
        type: "get",
        key: key,
        hit: false,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      });
      return null;
    }
    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    entry.priority = this.calculatePriority(entry);
    this.hitCount++;
    this.recordOperation({
      type: "get",
      key: key,
      hit: true,
      duration: Date.now() - startTime,
      timestamp: Date.now(),
    });
    return entry.data;
  };
  /**
   * Set cached subscription validation result with intelligent TTL
   */
  SubscriptionCache.prototype.set = function (key, data, customTTL) {
    var _a;
    var startTime = Date.now();
    // Determine TTL based on data characteristics
    var ttl = customTTL || this.config.defaultTTL;
    if (data.gracePeriod) {
      ttl = this.config.gracePeriodTTL;
    } else if (!data.hasAccess && data.status === null) {
      ttl = this.config.errorTTL;
    } else if (data.status === "trialing" && data.expiresAt) {
      // For trials, cache until expiry or max TTL, whichever is shorter
      var timeUntilExpiry = data.expiresAt.getTime() - Date.now();
      ttl = Math.min(timeUntilExpiry, this.config.defaultTTL);
    } else if (
      data.status === "active" &&
      ((_a = data.subscription) === null || _a === void 0 ? void 0 : _a.cancel_at_period_end)
    ) {
      // Shorter TTL for cancelling subscriptions
      ttl = Math.min(ttl, 2 * 60 * 1000); // 2 minutes
    }
    // Ensure we don't exceed max size
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUseful();
    }
    var now = Date.now();
    var entry = {
      data: data,
      expires: now + ttl,
      created: now,
      accessCount: 1,
      lastAccessed: now,
      priority: this.calculatePriority({
        data: data,
        expires: now + ttl,
        created: now,
        accessCount: 1,
        lastAccessed: now,
        priority: 0,
      }),
    };
    this.cache.set(key, entry);
    this.recordOperation({
      type: "set",
      key: key,
      duration: Date.now() - startTime,
      timestamp: Date.now(),
    });
  };
  /**
   * Delete specific cache entry or entries matching pattern
   */
  SubscriptionCache.prototype.delete = function (pattern) {
    var _this = this;
    var startTime = Date.now();
    var deletedCount = 0;
    if (this.cache.has(pattern)) {
      // Exact match
      this.cache.delete(pattern);
      deletedCount = 1;
    } else if (pattern.includes("*")) {
      // Pattern matching
      var regex_1 = new RegExp(pattern.replace(/\*/g, ".*"));
      var keysToDelete_1 = [];
      this.cache.forEach(function (_, key) {
        if (regex_1.test(key)) {
          keysToDelete_1.push(key);
        }
      });
      keysToDelete_1.forEach(function (key) {
        _this.cache.delete(key);
        deletedCount++;
      });
    } else {
      // Prefix matching
      var keysToDelete_2 = [];
      this.cache.forEach(function (_, key) {
        if (key.startsWith(pattern)) {
          keysToDelete_2.push(key);
        }
      });
      keysToDelete_2.forEach(function (key) {
        _this.cache.delete(key);
        deletedCount++;
      });
    }
    this.recordOperation({
      type: "delete",
      key: pattern,
      duration: Date.now() - startTime,
      timestamp: Date.now(),
    });
    return deletedCount;
  };
  /**
   * Clear entire cache
   */
  SubscriptionCache.prototype.clear = function () {
    var startTime = Date.now();
    var entriesCleared = this.cache.size;
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    this.operations = [];
    this.recordOperation({
      type: "cleanup",
      duration: Date.now() - startTime,
      timestamp: Date.now(),
    });
    console.log("Subscription cache cleared: ".concat(entriesCleared, " entries removed"));
  };
  /**
   * Get comprehensive cache statistics
   */
  SubscriptionCache.prototype.getStats = function () {
    var now = Date.now();
    var entries = [];
    this.cache.forEach(function (entry) {
      return entries.push(entry);
    });
    var validEntries = entries.filter(function (entry) {
      return entry.expires > now;
    });
    var totalHits = this.hitCount + this.missCount;
    var hitRate = totalHits > 0 ? (this.hitCount / totalHits) * 100 : 0;
    var accessCounts = validEntries.map(function (entry) {
      return entry.accessCount;
    });
    var averageAccessCount =
      accessCounts.length > 0
        ? accessCounts.reduce(function (sum, count) {
            return sum + count;
          }, 0) / accessCounts.length
        : 0;
    // Estimate memory usage (rough calculation)
    var memoryUsage = this.cache.size * 2000; // Rough estimate: 2KB per entry
    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: this.cache.size - validEntries.length,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: Math.round(hitRate * 100) / 100,
      oldestEntry:
        entries.length > 0
          ? Math.min.apply(
              Math,
              entries.map(function (e) {
                return e.created;
              }),
            )
          : null,
      newestEntry:
        entries.length > 0
          ? Math.max.apply(
              Math,
              entries.map(function (e) {
                return e.created;
              }),
            )
          : null,
      averageAccessCount: Math.round(averageAccessCount * 100) / 100,
      memoryUsage: memoryUsage,
    };
  };
  /**
   * Get cache operations for debugging
   */
  SubscriptionCache.prototype.getOperations = function (limit) {
    if (limit === void 0) {
      limit = 100;
    }
    return this.operations.slice(-limit);
  };
  /**
   * Optimize cache by removing expired and least useful entries
   */
  SubscriptionCache.prototype.optimize = function () {
    var _this = this;
    var startTime = Date.now();
    var initialSize = this.cache.size;
    var now = Date.now();
    // Remove expired entries
    var expiredRemoved = 0;
    var entriesToDelete = [];
    this.cache.forEach(function (entry, key) {
      if (entry.expires <= now) {
        entriesToDelete.push(key);
      }
    });
    entriesToDelete.forEach(function (key) {
      _this.cache.delete(key);
      expiredRemoved++;
    });
    // If still over max size, remove least useful entries
    var lruRemoved = 0;
    while (this.cache.size > this.config.maxSize * 0.8) {
      // Keep at 80% of max
      this.evictLeastUseful();
      lruRemoved++;
    }
    var finalSize = this.cache.size;
    var totalRemoved = initialSize - finalSize;
    var memoryFreed = totalRemoved * 2000; // Rough estimate
    this.recordOperation({
      type: "cleanup",
      duration: Date.now() - startTime,
      timestamp: Date.now(),
    });
    return {
      removed: totalRemoved,
      kept: finalSize,
      memoryFreed: memoryFreed,
    };
  };
  /**
   * Calculate priority for cache entry (higher = more important to keep)
   */
  SubscriptionCache.prototype.calculatePriority = function (entry) {
    var now = Date.now();
    var age = now - entry.created;
    var timeSinceAccess = now - entry.lastAccessed;
    var remainingTTL = entry.expires - now;
    // Factors that increase priority:
    // - Higher access count
    // - More recent access
    // - Active/valid subscription status
    // - Longer remaining TTL
    var priority = entry.accessCount * 10;
    // Bonus for recent access
    if (timeSinceAccess < 60000) {
      // Less than 1 minute
      priority += 50;
    } else if (timeSinceAccess < 300000) {
      // Less than 5 minutes
      priority += 20;
    }
    // Bonus for active subscriptions
    if (entry.data.hasAccess && entry.data.status === "active") {
      priority += 100;
    } else if (entry.data.hasAccess) {
      priority += 50;
    }
    // Bonus for longer remaining TTL
    if (remainingTTL > 180000) {
      // More than 3 minutes
      priority += 30;
    } else if (remainingTTL > 60000) {
      // More than 1 minute
      priority += 10;
    }
    return priority;
  };
  /**
   * Remove least useful cache entry
   */
  SubscriptionCache.prototype.evictLeastUseful = function () {
    if (this.cache.size === 0) return false;
    var leastUsefulKey = null;
    var lowestPriority = Infinity;
    this.cache.forEach(function (entry, key) {
      if (entry.priority < lowestPriority) {
        lowestPriority = entry.priority;
        leastUsefulKey = key;
      }
    });
    if (leastUsefulKey) {
      this.cache.delete(leastUsefulKey);
      return true;
    }
    return false;
  };
  /**
   * Record cache operation for monitoring
   */
  SubscriptionCache.prototype.recordOperation = function (operation) {
    this.operations.push(operation);
    // Keep only last 1000 operations
    if (this.operations.length > 1000) {
      this.operations.splice(0, this.operations.length - 1000);
    }
  };
  /**
   * Start automatic cleanup timer
   */
  SubscriptionCache.prototype.startCleanupTimer = function () {
    var _this = this;
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cleanupTimer = setInterval(function () {
      _this.optimize();
    }, this.config.cleanupInterval);
  };
  /**
   * Stop automatic cleanup timer
   */
  SubscriptionCache.prototype.stopCleanup = function () {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  };
  /**
   * Destroy cache and cleanup resources
   */
  SubscriptionCache.prototype.destroy = function () {
    this.stopCleanup();
    this.clear();
  };
  return SubscriptionCache;
})();
exports.SubscriptionCache = SubscriptionCache;
// Global cache instance with default configuration
exports.globalSubscriptionCache = new SubscriptionCache();
// Cache management utilities
exports.cacheManager = {
  /**
   * Warm up cache for specific user
   */
  warmUp: function (userId, validationResult) {
    return __awaiter(this, void 0, void 0, function () {
      var key;
      return __generator(this, function (_a) {
        key = "subscription:".concat(userId);
        exports.globalSubscriptionCache.set(key, validationResult);
        return [2 /*return*/];
      });
    });
  },
  /**
   * Invalidate cache for user when subscription changes
   */
  invalidateUser: function (userId) {
    return exports.globalSubscriptionCache.delete("subscription:".concat(userId));
  },
  /**
   * Invalidate cache for multiple users
   */
  invalidateUsers: function (userIds) {
    var totalDeleted = 0;
    for (var _i = 0, userIds_1 = userIds; _i < userIds_1.length; _i++) {
      var userId = userIds_1[_i];
      totalDeleted += this.invalidateUser(userId);
    }
    return totalDeleted;
  },
  /**
   * Invalidate all trial subscriptions (useful when trial policies change)
   */
  invalidateTrials: function () {
    return exports.globalSubscriptionCache.delete("subscription:*trial*");
  },
  /**
   * Get cache health status
   */
  getHealth: function () {
    var stats = exports.globalSubscriptionCache.getStats();
    var recommendations = [];
    var healthy = true;
    // Check hit rate
    if (stats.hitRate < 70) {
      healthy = false;
      recommendations.push(
        "Low cache hit rate - consider increasing TTL or optimizing invalidation strategy",
      );
    }
    // Check memory usage
    if (stats.memoryUsage > 50 * 1024 * 1024) {
      // 50MB
      recommendations.push("High memory usage - consider reducing cache size or TTL");
    }
    // Check expired entries
    var expiredPercentage = (stats.expiredEntries / stats.totalEntries) * 100;
    if (expiredPercentage > 30) {
      recommendations.push("High percentage of expired entries - consider running manual cleanup");
    }
    return {
      healthy: healthy,
      stats: stats,
      recommendations: recommendations,
    };
  },
};
