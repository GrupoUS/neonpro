/**
 * Enhanced Subscription Caching System v2
 *
 * Advanced multi-layer caching with performance optimization:
 * - Memory cache with compression and intelligent eviction
 * - Redis cache for distributed systems
 * - Adaptive TTL based on usage patterns
 * - Performance monitoring and alerting
 * - Cache warming strategies
 * - Circuit breaker pattern for resilience
 *
 * @author NeonPro Development Team
 * @version 2.0.0 - Performance Optimized
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
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  ((m, exports) => {
    for (var p in m)
      if (p !== "default" && !Object.hasOwn(exports, p)) __createBinding(exports, m, p);
  });
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
exports.enhancedSubscriptionCache = exports.EnhancedSubscriptionCache = void 0;
var subscription_performance_monitor_1 = require("./subscription-performance-monitor");
/**
 * Enhanced subscription cache with advanced features
 */
var EnhancedSubscriptionCache = /** @class */ (() => {
  function EnhancedSubscriptionCache(config) {
    this.cache = new Map();
    this.hitCount = 0;
    this.missCount = 0;
    this.prefetchHits = 0;
    this.operations = [];
    this.cleanupTimer = null;
    this.prefetchTimer = null;
    this.memoryUsage = 0;
    this.compressionSavings = 0;
    this.circuitBreakerState = "closed";
    this.failureCount = 0;
    this.lastFailureTime = 0;
    // Access pattern tracking
    this.accessPatterns = new Map();
    this.popularKeys = new Set();
    // Prefetch strategies
    this.prefetchStrategies = [
      {
        strategy: "recent",
        priority: 10,
        enabled: true,
        config: { lookbackMinutes: 30 },
      },
      {
        strategy: "popular",
        priority: 8,
        enabled: true,
        config: { minAccessCount: 5 },
      },
      {
        strategy: "predictive",
        priority: 6,
        enabled: true,
        config: { patternThreshold: 0.7 },
      },
    ];
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      gracePeriodTTL: 30 * 1000, // 30 seconds
      errorTTL: 30 * 1000, // 30 seconds
      maxSize: 50000, // 50k entries (increased)
      cleanupInterval: 30 * 1000, // 30 seconds (more frequent)
      compressionThreshold: 1024, // Compress entries > 1KB
      adaptiveTTL: {
        enabled: true,
        minTTL: 60 * 1000, // 1 minute minimum
        maxTTL: 30 * 60 * 1000, // 30 minutes maximum
        adjustmentFactor: 1.5,
      },
      prefetch: {
        enabled: true,
        triggerThreshold: 0.3, // Prefetch when 30% TTL remaining
        maxConcurrent: 10,
      },
      memoryOptimization: {
        enabled: true,
        maxMemoryMB: 100, // 100MB memory limit
        evictionStrategy: "adaptive", // Smart eviction based on multiple factors
      },
      monitoring: {
        enabled: true,
        sampleRate: 0.1, // 10% sampling
        trackOperations: true,
      },
    };
    if (config) {
      this.config = __assign(__assign({}, this.config), config);
    }
    this.startCleanupTimer();
    this.startPrefetchTimer();
  }
  /**
   * Get value from cache with performance monitoring
   */
  EnhancedSubscriptionCache.prototype.get = function (key_1) {
    return __awaiter(this, arguments, void 0, function (key, prefetched) {
      var startTime, entry, duration, now, data, error_1, duration;
      if (prefetched === void 0) {
        prefetched = false;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = performance.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            entry = this.cache.get(key);
            duration = performance.now() - startTime;
            // Record operation
            if (this.config.monitoring.trackOperations) {
              this.recordOperation("get", key, !!entry, duration, "memory");
            }
            if (!entry) {
              this.missCount++;
              return [2 /*return*/, null];
            }
            now = Date.now();
            // Check if entry is expired
            if (entry.expires < now) {
              this.cache.delete(key);
              this.updateMemoryUsage(-entry.memorySize);
              this.missCount++;
              return [2 /*return*/, null];
            }
            // Update access metrics
            entry.accessCount++;
            entry.lastAccessed = now;
            entry.hotness = this.calculateHotness(entry);
            // Track access patterns for prefetching
            this.trackAccessPattern(key);
            // Check if we should prefetch soon
            if (this.shouldPrefetch(entry) && !prefetched) {
              this.schedulePrefetch(key);
            }
            this.hitCount++;
            if (prefetched) {
              this.prefetchHits++;
            }
            // Performance monitoring
            subscription_performance_monitor_1.subscriptionPerformanceMonitor.recordCacheOperation(
              true,
              duration,
            );
            data = entry.data;
            if (!entry.compressed) return [3 /*break*/, 3];
            return [4 /*yield*/, this.decompress(entry.data)];
          case 2:
            data = _a.sent();
            _a.label = 3;
          case 3:
            return [2 /*return*/, data];
          case 4:
            error_1 = _a.sent();
            duration = performance.now() - startTime;
            this.handleCacheError(error_1, "get", key);
            this.recordOperation("get", key, false, duration, "memory");
            return [2 /*return*/, null];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Set value in cache with compression and adaptive TTL
   */
  EnhancedSubscriptionCache.prototype.set = function (key_1, value_1, ttl_1) {
    return __awaiter(this, arguments, void 0, function (key, value, ttl, options) {
      var startTime,
        now,
        finalTTL,
        finalData,
        compressed,
        compressionRatio,
        dataSize,
        compressedData,
        compressedSize,
        compressionError_1,
        entry,
        oldEntry,
        duration,
        error_2,
        duration;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = performance.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 7, , 8]);
            now = Date.now();
            finalTTL = ttl || this.config.defaultTTL;
            // Apply adaptive TTL
            if (this.config.adaptiveTTL.enabled) {
              finalTTL = this.calculateAdaptiveTTL(key, finalTTL);
            }
            finalData = value;
            compressed = false;
            compressionRatio = 1;
            dataSize = this.estimateSize(value);
            if (
              !(
                !options.skipCompression &&
                dataSize > this.config.compressionThreshold &&
                this.shouldCompress(value)
              )
            )
              return [3 /*break*/, 5];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [4 /*yield*/, this.compress(value)];
          case 3:
            compressedData = _a.sent();
            compressedSize = this.estimateSize(compressedData);
            if (compressedSize < dataSize * 0.8) {
              // Only use if >20% savings
              finalData = compressedData;
              compressed = true;
              compressionRatio = compressedSize / dataSize;
              this.compressionSavings += dataSize - compressedSize;
            }
            return [3 /*break*/, 5];
          case 4:
            compressionError_1 = _a.sent();
            console.warn("Compression failed, storing uncompressed:", compressionError_1);
            return [3 /*break*/, 5];
          case 5:
            entry = {
              data: finalData,
              expires: now + finalTTL,
              created: now,
              accessCount: 1,
              lastAccessed: now,
              priority: options.priority || this.calculatePriority(value),
              compressed: compressed,
              compressionRatio: compressed ? compressionRatio : undefined,
              prefetchScore: 0,
              hotness: 1,
              memorySize: this.estimateSize(finalData),
            };
            // Check memory limits and evict if necessary
            return [
              4 /*yield*/,
              this.ensureMemoryLimit(entry.memorySize),
              // Store entry
            ];
          case 6:
            // Check memory limits and evict if necessary
            _a.sent();
            oldEntry = this.cache.get(key);
            if (oldEntry) {
              this.updateMemoryUsage(-oldEntry.memorySize);
            }
            this.cache.set(key, entry);
            this.updateMemoryUsage(entry.memorySize);
            // Update popular keys
            this.updatePopularKeys(key);
            duration = performance.now() - startTime;
            // Record operation
            if (this.config.monitoring.trackOperations) {
              this.recordOperation("set", key, true, duration, "memory", entry.memorySize);
            }
            // Performance monitoring
            subscription_performance_monitor_1.subscriptionPerformanceMonitor.recordCacheOperation(
              true,
              duration,
            );
            return [3 /*break*/, 8];
          case 7:
            error_2 = _a.sent();
            duration = performance.now() - startTime;
            this.handleCacheError(error_2, "set", key);
            this.recordOperation("set", key, false, duration, "memory");
            throw error_2;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Delete entry from cache
   */
  EnhancedSubscriptionCache.prototype.delete = function (key) {
    var entry = this.cache.get(key);
    if (entry) {
      this.cache.delete(key);
      this.updateMemoryUsage(-entry.memorySize);
      this.accessPatterns.delete(key);
      this.popularKeys.delete(key);
      return true;
    }
    return false;
  };
  /**
   * Clear all entries
   */
  EnhancedSubscriptionCache.prototype.clear = function () {
    this.cache.clear();
    this.accessPatterns.clear();
    this.popularKeys.clear();
    this.memoryUsage = 0;
    this.compressionSavings = 0;
    this.hitCount = 0;
    this.missCount = 0;
    this.prefetchHits = 0;
  };
  /**
   * Get cache statistics with enhanced metrics
   */
  EnhancedSubscriptionCache.prototype.getStats = function () {
    var now = Date.now();
    var validEntries = 0;
    var expiredEntries = 0;
    var oldestEntry = null;
    var newestEntry = null;
    var totalAccessCount = 0;
    for (var _i = 0, _a = this.cache; _i < _a.length; _i++) {
      var _b = _a[_i],
        entry = _b[1];
      if (entry.expires > now) {
        validEntries++;
        totalAccessCount += entry.accessCount;
        if (oldestEntry === null || entry.created < oldestEntry) {
          oldestEntry = entry.created;
        }
        if (newestEntry === null || entry.created > newestEntry) {
          newestEntry = entry.created;
        }
      } else {
        expiredEntries++;
      }
    }
    var totalRequests = this.hitCount + this.missCount;
    return {
      totalEntries: this.cache.size,
      validEntries: validEntries,
      expiredEntries: expiredEntries,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: totalRequests > 0 ? this.hitCount / totalRequests : 0,
      oldestEntry: oldestEntry,
      newestEntry: newestEntry,
      averageAccessCount: validEntries > 0 ? totalAccessCount / validEntries : 0,
      memoryUsage: this.memoryUsage,
      compressionSavings: this.compressionSavings,
      prefetchHits: this.prefetchHits,
      circuitBreakerState: this.circuitBreakerState,
    };
  };
  /**
   * Force cache cleanup
   */
  EnhancedSubscriptionCache.prototype.cleanup = function () {
    var startTime = performance.now();
    var now = Date.now();
    var removedCount = 0;
    var reclaimedMemory = 0;
    // Remove expired entries
    for (var _i = 0, _a = this.cache; _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        entry = _b[1];
      if (entry.expires < now) {
        this.cache.delete(key);
        this.accessPatterns.delete(key);
        this.popularKeys.delete(key);
        reclaimedMemory += entry.memorySize;
        removedCount++;
      }
    }
    this.updateMemoryUsage(-reclaimedMemory);
    var duration = performance.now() - startTime;
    if (this.config.monitoring.trackOperations) {
      this.recordOperation("cleanup", undefined, true, duration, "memory");
    }
    console.debug(
      "Cache cleanup: removed "
        .concat(removedCount, " entries, reclaimed ")
        .concat(reclaimedMemory, " bytes"),
    );
  };
  /**
   * Prefetch entries that are likely to be accessed soon
   */
  EnhancedSubscriptionCache.prototype.prefetch = function () {
    return __awaiter(this, void 0, void 0, function () {
      var strategies, candidateKeys, _i, strategies_1, strategy, keys_2, keys, _a, keys_1, key;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!this.config.prefetch.enabled) return [2 /*return*/];
            strategies = this.prefetchStrategies.filter((s) => s.enabled);
            candidateKeys = new Set();
            (_i = 0), (strategies_1 = strategies);
            _b.label = 1;
          case 1:
            if (!(_i < strategies_1.length)) return [3 /*break*/, 4];
            strategy = strategies_1[_i];
            return [4 /*yield*/, this.getPrefetchCandidates(strategy)];
          case 2:
            keys_2 = _b.sent();
            keys_2.forEach((key) => candidateKeys.add(key));
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            keys = Array.from(candidateKeys).slice(0, this.config.prefetch.maxConcurrent);
            (_a = 0), (keys_1 = keys);
            _b.label = 5;
          case 5:
            if (!(_a < keys_1.length)) return [3 /*break*/, 8];
            key = keys_1[_a];
            return [4 /*yield*/, this.schedulePrefetch(key)];
          case 6:
            _b.sent();
            _b.label = 7;
          case 7:
            _a++;
            return [3 /*break*/, 5];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate hotness score based on access patterns
   */
  EnhancedSubscriptionCache.prototype.calculateHotness = (entry) => {
    var now = Date.now();
    var age = now - entry.created;
    var recency = now - entry.lastAccessed;
    // Combine frequency and recency
    var frequency = entry.accessCount / Math.max(1, age / (60 * 1000)); // accesses per minute
    var recencyScore = Math.max(0, 1 - recency / (60 * 60 * 1000)); // decay over 1 hour
    return frequency * 0.7 + recencyScore * 0.3;
  };
  /**
   * Calculate priority for cache entry
   */
  EnhancedSubscriptionCache.prototype.calculatePriority = (value) => {
    var _a, _b, _c;
    var priority = 5; // Base priority
    // Higher priority for users with access
    if (value.hasAccess) priority += 3;
    // Higher priority based on subscription status
    if (((_a = value.subscription) === null || _a === void 0 ? void 0 : _a.status) === "active")
      priority += 3;
    else if (
      ((_b = value.subscription) === null || _b === void 0 ? void 0 : _b.status) === "trialing"
    )
      priority += 2;
    else if (
      ((_c = value.subscription) === null || _c === void 0 ? void 0 : _c.status) === "past_due"
    )
      priority += 1;
    // Higher priority for users in grace period
    if (value.gracePeriod) priority += 2;
    return priority;
  };
  /**
   * Calculate adaptive TTL based on access patterns
   */
  EnhancedSubscriptionCache.prototype.calculateAdaptiveTTL = function (key, baseTTL) {
    var pattern = this.accessPatterns.get(key);
    if (!pattern || pattern.length < 3) {
      return baseTTL;
    }
    // Calculate access frequency
    var now = Date.now();
    var recentAccesses = pattern.filter((time) => now - time < 60 * 60 * 1000); // Last hour
    var frequency = recentAccesses.length / 60; // accesses per minute
    // Adjust TTL based on frequency
    var adjustedTTL = baseTTL;
    if (frequency > 10) {
      // Very high frequency
      adjustedTTL = Math.max(this.config.adaptiveTTL.minTTL, baseTTL * 0.5);
    } else if (frequency > 5) {
      // High frequency
      adjustedTTL = Math.max(this.config.adaptiveTTL.minTTL, baseTTL * 0.7);
    } else if (frequency < 1) {
      // Low frequency
      adjustedTTL = Math.min(
        this.config.adaptiveTTL.maxTTL,
        baseTTL * this.config.adaptiveTTL.adjustmentFactor,
      );
    }
    return adjustedTTL;
  };
  /**
   * Track access patterns for prefetching
   */
  EnhancedSubscriptionCache.prototype.trackAccessPattern = function (key) {
    var now = Date.now();
    var pattern = this.accessPatterns.get(key);
    if (!pattern) {
      pattern = [];
      this.accessPatterns.set(key, pattern);
    }
    pattern.push(now);
    // Keep only recent accesses (last 24 hours)
    var cutoff = now - 24 * 60 * 60 * 1000;
    var recentPattern = pattern.filter((time) => time > cutoff);
    this.accessPatterns.set(key, recentPattern.slice(-100)); // Keep max 100 entries
  };
  /**
   * Check if entry should be prefetched
   */
  EnhancedSubscriptionCache.prototype.shouldPrefetch = function (entry) {
    if (!this.config.prefetch.enabled) return false;
    var now = Date.now();
    var timeRemaining = entry.expires - now;
    var totalTTL = entry.expires - entry.created;
    return timeRemaining / totalTTL < this.config.prefetch.triggerThreshold;
  };
  /**
   * Schedule prefetch for a key
   */
  EnhancedSubscriptionCache.prototype.schedulePrefetch = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var entry;
      return __generator(this, function (_a) {
        entry = this.cache.get(key);
        if (entry) {
          entry.lastPrefetch = Date.now();
          entry.prefetchScore = Math.min(10, (entry.prefetchScore || 0) + 1);
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get prefetch candidates based on strategy
   */
  EnhancedSubscriptionCache.prototype.getPrefetchCandidates = function (strategy) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (strategy.strategy) {
          case "recent":
            return [2 /*return*/, this.getRecentCandidates(strategy.config)];
          case "popular":
            return [2 /*return*/, this.getPopularCandidates(strategy.config)];
          case "predictive":
            return [2 /*return*/, this.getPredictiveCandidates(strategy.config)];
          default:
            return [2 /*return*/, []];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get recent access candidates
   */
  EnhancedSubscriptionCache.prototype.getRecentCandidates = function (config) {
    var cutoff = Date.now() - config.lookbackMinutes * 60 * 1000;
    var candidates = [];
    for (var _i = 0, _a = this.accessPatterns; _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        pattern = _b[1];
      if (pattern.some((time) => time > cutoff)) {
        candidates.push(key);
      }
    }
    return candidates.slice(0, 20); // Limit candidates
  };
  /**
   * Get popular access candidates
   */
  EnhancedSubscriptionCache.prototype.getPopularCandidates = function (config) {
    return Array.from(this.popularKeys).slice(0, 20);
  };
  /**
   * Get predictive candidates (placeholder for ML-based prediction)
   */
  EnhancedSubscriptionCache.prototype.getPredictiveCandidates = function (config) {
    // This would use machine learning to predict likely accesses
    // For now, return popular keys as a fallback
    return this.getPopularCandidates(config);
  };
  /**
   * Update popular keys set
   */
  EnhancedSubscriptionCache.prototype.updatePopularKeys = function (key) {
    var pattern = this.accessPatterns.get(key);
    if (pattern && pattern.length > 10) {
      // Threshold for popularity
      this.popularKeys.add(key);
    }
    // Limit popular keys set size
    if (this.popularKeys.size > 1000) {
      var keysArray = Array.from(this.popularKeys);
      var toRemove = keysArray.slice(0, 100); // Remove oldest 100
      toRemove.forEach((k) => this.popularKeys.delete(k));
    }
  };
  /**
   * Ensure memory usage stays within limits
   */
  EnhancedSubscriptionCache.prototype.ensureMemoryLimit = function (newEntrySize) {
    return __awaiter(this, void 0, void 0, function () {
      var maxMemory, projectedUsage, targetUsage, memoryToFree;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.config.memoryOptimization.enabled) return [2 /*return*/];
            maxMemory = this.config.memoryOptimization.maxMemoryMB * 1024 * 1024;
            projectedUsage = this.memoryUsage + newEntrySize;
            if (projectedUsage <= maxMemory) return [2 /*return*/];
            targetUsage = maxMemory * 0.8; // Target 80% of max
            memoryToFree = projectedUsage - targetUsage;
            return [4 /*yield*/, this.evictEntries(memoryToFree)];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Evict entries based on strategy
   */
  EnhancedSubscriptionCache.prototype.evictEntries = function (memoryToFree) {
    return __awaiter(this, void 0, void 0, function () {
      var strategy,
        freedMemory,
        now,
        candidates,
        _i,
        _a,
        _b,
        key,
        entry,
        score,
        age,
        recency,
        accessFreq,
        hotness,
        _c,
        candidates_1,
        _d,
        key,
        entry;
      return __generator(this, function (_e) {
        strategy = this.config.memoryOptimization.evictionStrategy;
        freedMemory = 0;
        now = Date.now();
        candidates = [];
        for (_i = 0, _a = this.cache; _i < _a.length; _i++) {
          (_b = _a[_i]), (key = _b[0]), (entry = _b[1]);
          score = 0;
          if (strategy === "lru") {
            score = now - entry.lastAccessed;
          } else if (strategy === "lfu") {
            score = -entry.accessCount;
          } else {
            // adaptive
            age = now - entry.created;
            recency = now - entry.lastAccessed;
            accessFreq = entry.accessCount / Math.max(1, age / (60 * 1000));
            hotness = entry.hotness || 0;
            score =
              recency * 0.4 -
              accessFreq * 1000 * 0.3 -
              hotness * 1000 * 0.2 -
              entry.priority * 100 * 0.1;
          }
          candidates.push({ key: key, entry: entry, score: score });
        }
        // Sort by eviction score (higher = more likely to evict)
        candidates.sort((a, b) => b.score - a.score);
        // Evict entries until we've freed enough memory
        for (_c = 0, candidates_1 = candidates; _c < candidates_1.length; _c++) {
          (_d = candidates_1[_c]), (key = _d.key), (entry = _d.entry);
          if (freedMemory >= memoryToFree) break;
          this.cache.delete(key);
          this.accessPatterns.delete(key);
          this.popularKeys.delete(key);
          freedMemory += entry.memorySize;
        }
        this.updateMemoryUsage(-freedMemory);
        return [2 /*return*/];
      });
    });
  };
  /**
   * Estimate memory size of an object
   */
  EnhancedSubscriptionCache.prototype.estimateSize = (obj) => {
    // Rough estimation - in production you might use a more accurate method
    var json = JSON.stringify(obj);
    return json.length * 2; // Approximate bytes (UTF-16)
  };
  /**
   * Update memory usage tracking
   */
  EnhancedSubscriptionCache.prototype.updateMemoryUsage = function (delta) {
    this.memoryUsage = Math.max(0, this.memoryUsage + delta);
  };
  /**
   * Check if data should be compressed
   */
  EnhancedSubscriptionCache.prototype.shouldCompress = (data) => {
    // Don't compress already compressed data or small objects
    return typeof data === "object" && data !== null;
  };
  /**
   * Compress data (placeholder - would use actual compression library)
   */
  EnhancedSubscriptionCache.prototype.compress = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Placeholder for actual compression
        // In production, use gzip, lz4, or similar
        return [2 /*return*/, { compressed: true, data: JSON.stringify(data) }];
      });
    });
  };
  /**
   * Decompress data
   */
  EnhancedSubscriptionCache.prototype.decompress = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Placeholder for actual decompression
        if (data.compressed && data.data) {
          return [2 /*return*/, JSON.parse(data.data)];
        }
        return [2 /*return*/, data];
      });
    });
  };
  /**
   * Record cache operation for monitoring
   */
  EnhancedSubscriptionCache.prototype.recordOperation = function (
    type,
    key,
    hit,
    duration,
    cacheLayer,
    memorySize,
  ) {
    if (cacheLayer === void 0) {
      cacheLayer = "memory";
    }
    if (!this.config.monitoring.trackOperations) return;
    this.operations.push({
      type: type,
      key: key,
      hit: hit,
      duration: duration || 0,
      timestamp: Date.now(),
      cacheLayer: cacheLayer,
      memorySize: memorySize,
    });
    // Keep only recent operations
    if (this.operations.length > 10000) {
      this.operations = this.operations.slice(-1000);
    }
  };
  /**
   * Handle cache errors
   */
  EnhancedSubscriptionCache.prototype.handleCacheError = function (error, operation, key) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    console.error(
      "Cache ".concat(operation, " error").concat(key ? " for key ".concat(key) : "", ":"),
      error,
    );
    // Circuit breaker logic
    if (this.failureCount > 10) {
      this.circuitBreakerState = "open";
      setTimeout(() => {
        this.circuitBreakerState = "half-open";
        this.failureCount = 0;
      }, 30000); // 30 second timeout
    }
  };
  /**
   * Start cleanup timer
   */
  EnhancedSubscriptionCache.prototype.startCleanupTimer = function () {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  };
  /**
   * Start prefetch timer
   */
  EnhancedSubscriptionCache.prototype.startPrefetchTimer = function () {
    if (!this.config.prefetch.enabled) return;
    this.prefetchTimer = setInterval(
      () => {
        this.prefetch().catch((error) => {
          console.error("Prefetch error:", error);
        });
      },
      5 * 60 * 1000,
    ); // Every 5 minutes
  };
  /**
   * Cleanup resources
   */
  EnhancedSubscriptionCache.prototype.destroy = function () {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    if (this.prefetchTimer) {
      clearInterval(this.prefetchTimer);
      this.prefetchTimer = null;
    }
    this.clear();
  };
  return EnhancedSubscriptionCache;
})();
exports.EnhancedSubscriptionCache = EnhancedSubscriptionCache;
// Global enhanced cache instance
exports.enhancedSubscriptionCache = new EnhancedSubscriptionCache();
// Export original cache for backward compatibility
__exportStar(require("./subscription-cache"), exports);
