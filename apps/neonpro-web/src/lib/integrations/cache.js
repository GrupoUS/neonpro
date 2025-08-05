/**
 * NeonPro - Integration Cache System
 * High-performance caching system for third-party integrations
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
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
exports.CacheFactory =
  exports.SupabaseIntegrationCache =
  exports.RedisIntegrationCache =
  exports.MemoryIntegrationCache =
    void 0;
var crypto_1 = require("crypto");
var supabase_js_1 = require("@supabase/supabase-js");
/**
 * Memory Cache Implementation
 * Fast in-memory cache with LRU eviction
 */
var MemoryIntegrationCache = /** @class */ (() => {
  function MemoryIntegrationCache(config) {
    this.cache = new Map();
    this.accessOrder = [];
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: 0,
      hitRate: 0,
    };
    this.config = __assign({ maxSize: 1000, defaultTtl: 300000, cleanupInterval: 60000 }, config);
    // Start cleanup interval
    if (this.config.cleanupInterval > 0) {
      setInterval(() => this.cleanup(), this.config.cleanupInterval);
    }
  }
  /**
   * Get value from cache
   */
  MemoryIntegrationCache.prototype.get = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var keyStr, entry;
      return __generator(this, function (_a) {
        keyStr = this.serializeKey(key);
        entry = this.cache.get(keyStr);
        if (!entry) {
          this.stats.misses++;
          this.updateHitRate();
          return [2 /*return*/, null];
        }
        // Check if expired
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
          this.cache.delete(keyStr);
          this.removeFromAccessOrder(keyStr);
          this.stats.misses++;
          this.stats.evictions++;
          this.updateStats();
          return [2 /*return*/, null];
        }
        // Update access order for LRU
        this.updateAccessOrder(keyStr);
        this.stats.hits++;
        this.updateHitRate();
        return [2 /*return*/, entry.value];
      });
    });
  };
  /**
   * Set value in cache
   */
  MemoryIntegrationCache.prototype.set = function (key, value, ttl) {
    return __awaiter(this, void 0, void 0, function () {
      var keyStr, expiresAt, entry;
      return __generator(this, function (_a) {
        keyStr = this.serializeKey(key);
        expiresAt = ttl
          ? Date.now() + ttl
          : this.config.defaultTtl
            ? Date.now() + this.config.defaultTtl
            : null;
        entry = {
          key: keyStr,
          value: value,
          createdAt: Date.now(),
          expiresAt: expiresAt,
          accessCount: 1,
          lastAccessed: Date.now(),
        };
        // Check if we need to evict
        if (this.cache.size >= this.config.maxSize && !this.cache.has(keyStr)) {
          this.evictLRU();
        }
        this.cache.set(keyStr, entry);
        this.updateAccessOrder(keyStr);
        this.stats.sets++;
        this.updateStats();
        return [2 /*return*/];
      });
    });
  };
  /**
   * Delete value from cache
   */
  MemoryIntegrationCache.prototype.delete = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var keyStr, existed;
      return __generator(this, function (_a) {
        keyStr = this.serializeKey(key);
        existed = this.cache.delete(keyStr);
        if (existed) {
          this.removeFromAccessOrder(keyStr);
          this.stats.deletes++;
          this.updateStats();
        }
        return [2 /*return*/, existed];
      });
    });
  };
  /**
   * Check if key exists in cache
   */
  MemoryIntegrationCache.prototype.has = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var keyStr, entry;
      return __generator(this, function (_a) {
        keyStr = this.serializeKey(key);
        entry = this.cache.get(keyStr);
        if (!entry) {
          return [2 /*return*/, false];
        }
        // Check if expired
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
          this.cache.delete(keyStr);
          this.removeFromAccessOrder(keyStr);
          this.stats.evictions++;
          this.updateStats();
          return [2 /*return*/, false];
        }
        return [2 /*return*/, true];
      });
    });
  };
  /**
   * Clear all cache entries
   */
  MemoryIntegrationCache.prototype.clear = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        this.cache.clear();
        this.accessOrder = [];
        this.stats.size = 0;
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get cache statistics
   */
  MemoryIntegrationCache.prototype.getStats = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, __assign({}, this.stats)];
      });
    });
  };
  /**
   * Get cache size
   */
  MemoryIntegrationCache.prototype.size = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.cache.size];
      });
    });
  };
  /**
   * Get all keys matching pattern
   */
  MemoryIntegrationCache.prototype.keys = function (pattern) {
    return __awaiter(this, void 0, void 0, function () {
      var keys, regex;
      return __generator(this, function (_a) {
        keys = Array.from(this.cache.keys());
        if (!pattern) {
          return [2 /*return*/, keys];
        }
        regex = new RegExp(pattern.replace(/\*/g, ".*"));
        return [2 /*return*/, keys.filter((key) => regex.test(key))];
      });
    });
  };
  // Private helper methods
  /**
   * Serialize cache key to string
   */
  MemoryIntegrationCache.prototype.serializeKey = (key) => {
    if (typeof key === "string") {
      return key;
    }
    var parts = [
      key.integrationId,
      key.operation,
      key.resource || "",
      key.params ? JSON.stringify(key.params) : "",
    ];
    return parts.join(":");
  };
  /**
   * Update access order for LRU
   */
  MemoryIntegrationCache.prototype.updateAccessOrder = function (key) {
    // Remove from current position
    this.removeFromAccessOrder(key);
    // Add to end (most recently used)
    this.accessOrder.push(key);
  };
  /**
   * Remove key from access order
   */
  MemoryIntegrationCache.prototype.removeFromAccessOrder = function (key) {
    var index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  };
  /**
   * Evict least recently used entry
   */
  MemoryIntegrationCache.prototype.evictLRU = function () {
    if (this.accessOrder.length === 0) {
      return;
    }
    var lruKey = this.accessOrder[0];
    this.cache.delete(lruKey);
    this.accessOrder.shift();
    this.stats.evictions++;
  };
  /**
   * Cleanup expired entries
   */
  MemoryIntegrationCache.prototype.cleanup = function () {
    var now = Date.now();
    var expiredKeys = [];
    for (var _i = 0, _a = this.cache; _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        entry = _b[1];
      if (entry.expiresAt && entry.expiresAt < now) {
        expiredKeys.push(key);
      }
    }
    for (var _c = 0, expiredKeys_1 = expiredKeys; _c < expiredKeys_1.length; _c++) {
      var key = expiredKeys_1[_c];
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.stats.evictions++;
    }
    if (expiredKeys.length > 0) {
      this.updateStats();
    }
  };
  /**
   * Update cache statistics
   */
  MemoryIntegrationCache.prototype.updateStats = function () {
    this.stats.size = this.cache.size;
    this.updateHitRate();
  };
  /**
   * Update hit rate
   */
  MemoryIntegrationCache.prototype.updateHitRate = function () {
    var total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  };
  return MemoryIntegrationCache;
})();
exports.MemoryIntegrationCache = MemoryIntegrationCache;
/**
 * Redis Cache Implementation
 * Distributed cache using Redis for multi-instance deployments
 */
var RedisIntegrationCache = /** @class */ (() => {
  function RedisIntegrationCache(redisClient, config) {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: 0,
      hitRate: 0,
    };
    this.redis = redisClient;
    this.config = __assign(
      { maxSize: 10000, defaultTtl: 300000, keyPrefix: "neonpro:integration:" },
      config,
    );
  }
  /**
   * Get value from Redis cache
   */
  RedisIntegrationCache.prototype.get = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var keyStr, value, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            keyStr = this.getRedisKey(key);
            return [4 /*yield*/, this.redis.get(keyStr)];
          case 1:
            value = _a.sent();
            if (value === null) {
              this.stats.misses++;
              this.updateHitRate();
              return [2 /*return*/, null];
            }
            this.stats.hits++;
            this.updateHitRate();
            return [2 /*return*/, JSON.parse(value)];
          case 2:
            error_1 = _a.sent();
            console.error("Redis cache get error:", error_1);
            this.stats.misses++;
            this.updateHitRate();
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Set value in Redis cache
   */
  RedisIntegrationCache.prototype.set = function (key, value, ttl) {
    return __awaiter(this, void 0, void 0, function () {
      var keyStr, serialized, expiry, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            keyStr = this.getRedisKey(key);
            serialized = JSON.stringify(value);
            expiry = ttl || this.config.defaultTtl;
            if (!expiry) return [3 /*break*/, 2];
            return [4 /*yield*/, this.redis.setex(keyStr, Math.floor(expiry / 1000), serialized)];
          case 1:
            _a.sent();
            return [3 /*break*/, 4];
          case 2:
            return [4 /*yield*/, this.redis.set(keyStr, serialized)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            this.stats.sets++;
            return [3 /*break*/, 6];
          case 5:
            error_2 = _a.sent();
            console.error("Redis cache set error:", error_2);
            throw error_2;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Delete value from Redis cache
   */
  RedisIntegrationCache.prototype.delete = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var keyStr, result, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            keyStr = this.getRedisKey(key);
            return [4 /*yield*/, this.redis.del(keyStr)];
          case 1:
            result = _a.sent();
            if (result > 0) {
              this.stats.deletes++;
              return [2 /*return*/, true];
            }
            return [2 /*return*/, false];
          case 2:
            error_3 = _a.sent();
            console.error("Redis cache delete error:", error_3);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check if key exists in Redis cache
   */
  RedisIntegrationCache.prototype.has = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var keyStr, result, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            keyStr = this.getRedisKey(key);
            return [4 /*yield*/, this.redis.exists(keyStr)];
          case 1:
            result = _a.sent();
            return [2 /*return*/, result === 1];
          case 2:
            error_4 = _a.sent();
            console.error("Redis cache has error:", error_4);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Clear all cache entries
   */
  RedisIntegrationCache.prototype.clear = function () {
    return __awaiter(this, void 0, void 0, function () {
      var pattern, keys, error_5;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            pattern = "".concat(this.config.keyPrefix, "*");
            return [4 /*yield*/, this.redis.keys(pattern)];
          case 1:
            keys = _b.sent();
            if (!(keys.length > 0)) return [3 /*break*/, 3];
            return [4 /*yield*/, (_a = this.redis).del.apply(_a, keys)];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_5 = _b.sent();
            console.error("Redis cache clear error:", error_5);
            throw error_5;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get cache statistics
   */
  RedisIntegrationCache.prototype.getStats = function () {
    return __awaiter(this, void 0, void 0, function () {
      var pattern, keys, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            pattern = "".concat(this.config.keyPrefix, "*");
            return [4 /*yield*/, this.redis.keys(pattern)];
          case 1:
            keys = _a.sent();
            this.stats.size = keys.length;
            return [2 /*return*/, __assign({}, this.stats)];
          case 2:
            error_6 = _a.sent();
            console.error("Redis cache stats error:", error_6);
            return [2 /*return*/, __assign({}, this.stats)];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get cache size
   */
  RedisIntegrationCache.prototype.size = function () {
    return __awaiter(this, void 0, void 0, function () {
      var pattern, keys, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            pattern = "".concat(this.config.keyPrefix, "*");
            return [4 /*yield*/, this.redis.keys(pattern)];
          case 1:
            keys = _a.sent();
            return [2 /*return*/, keys.length];
          case 2:
            error_7 = _a.sent();
            console.error("Redis cache size error:", error_7);
            return [2 /*return*/, 0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get all keys matching pattern
   */
  RedisIntegrationCache.prototype.keys = function (pattern) {
    return __awaiter(this, void 0, void 0, function () {
      var searchPattern, keys, error_8;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            searchPattern = pattern
              ? "".concat(this.config.keyPrefix).concat(pattern)
              : "".concat(this.config.keyPrefix, "*");
            return [4 /*yield*/, this.redis.keys(searchPattern)];
          case 1:
            keys = _a.sent();
            // Remove prefix from keys
            return [2 /*return*/, keys.map((key) => key.replace(_this.config.keyPrefix, ""))];
          case 2:
            error_8 = _a.sent();
            console.error("Redis cache keys error:", error_8);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Private helper methods
  /**
   * Get Redis key with prefix
   */
  RedisIntegrationCache.prototype.getRedisKey = function (key) {
    var serializedKey = typeof key === "string" ? key : this.serializeKey(key);
    return "".concat(this.config.keyPrefix).concat(serializedKey);
  };
  /**
   * Serialize cache key to string
   */
  RedisIntegrationCache.prototype.serializeKey = (key) => {
    if (typeof key === "string") {
      return key;
    }
    var parts = [
      key.integrationId,
      key.operation,
      key.resource || "",
      key.params
        ? crypto_1.default.createHash("md5").update(JSON.stringify(key.params)).digest("hex")
        : "",
    ];
    return parts.join(":");
  };
  /**
   * Update hit rate
   */
  RedisIntegrationCache.prototype.updateHitRate = function () {
    var total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  };
  return RedisIntegrationCache;
})();
exports.RedisIntegrationCache = RedisIntegrationCache;
/**
 * Supabase Cache Implementation
 * Database-backed cache using Supabase for persistence
 */
var SupabaseIntegrationCache = /** @class */ (() => {
  function SupabaseIntegrationCache(supabaseUrl, supabaseKey, config) {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: 0,
      hitRate: 0,
    };
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    this.config = __assign({ maxSize: 5000, defaultTtl: 300000, useMemoryCache: true }, config);
    // Initialize memory cache for L1 caching
    if (this.config.useMemoryCache) {
      this.memoryCache = new MemoryIntegrationCache({
        maxSize: Math.min(this.config.maxSize / 10, 500),
        defaultTtl: Math.min(this.config.defaultTtl, 60000), // 1 minute max for L1
        cleanupInterval: 30000,
      });
    }
    // Start cleanup interval
    setInterval(() => this.cleanup(), 300000); // 5 minutes
  }
  /**
   * Get value from cache (L1 memory + L2 database)
   */
  SupabaseIntegrationCache.prototype.get = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var keyStr, memoryValue, _a, data, error, value, error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            keyStr = this.serializeKey(key);
            if (!this.memoryCache) return [3 /*break*/, 2];
            return [4 /*yield*/, this.memoryCache.get(key)];
          case 1:
            memoryValue = _b.sent();
            if (memoryValue !== null) {
              this.stats.hits++;
              this.updateHitRate();
              return [2 /*return*/, memoryValue];
            }
            _b.label = 2;
          case 2:
            _b.trys.push([2, 8, , 9]);
            return [
              4 /*yield*/,
              this.supabase
                .from("integration_cache")
                .select("value, expires_at")
                .eq("key", keyStr)
                .single(),
            ];
          case 3:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              this.stats.misses++;
              this.updateHitRate();
              return [2 /*return*/, null];
            }
            if (!(data.expires_at && new Date(data.expires_at) < new Date()))
              return [3 /*break*/, 5];
            return [4 /*yield*/, this.delete(key)];
          case 4:
            _b.sent();
            this.stats.misses++;
            this.stats.evictions++;
            this.updateHitRate();
            return [2 /*return*/, null];
          case 5:
            value = JSON.parse(data.value);
            if (!this.memoryCache) return [3 /*break*/, 7];
            return [4 /*yield*/, this.memoryCache.set(key, value, 60000)];
          case 6:
            _b.sent(); // 1 minute in L1
            _b.label = 7;
          case 7:
            this.stats.hits++;
            this.updateHitRate();
            return [2 /*return*/, value];
          case 8:
            error_9 = _b.sent();
            console.error("Supabase cache get error:", error_9);
            this.stats.misses++;
            this.updateHitRate();
            return [2 /*return*/, null];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Set value in cache (L1 memory + L2 database)
   */
  SupabaseIntegrationCache.prototype.set = function (key, value, ttl) {
    return __awaiter(this, void 0, void 0, function () {
      var keyStr, expiry, expiresAt, error, error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            keyStr = this.serializeKey(key);
            expiry = ttl || this.config.defaultTtl;
            expiresAt = expiry ? new Date(Date.now() + expiry) : null;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, , 6]);
            return [
              4 /*yield*/,
              this.supabase.from("integration_cache").upsert({
                key: keyStr,
                value: JSON.stringify(value),
                expires_at: expiresAt,
                created_at: new Date(),
                updated_at: new Date(),
              }),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to set cache: ".concat(error.message));
            }
            if (!this.memoryCache) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.memoryCache.set(key, value, Math.min(expiry || 60000, 60000)),
            ];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            this.stats.sets++;
            return [3 /*break*/, 6];
          case 5:
            error_10 = _a.sent();
            console.error("Supabase cache set error:", error_10);
            throw error_10;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Delete value from cache
   */
  SupabaseIntegrationCache.prototype.delete = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var keyStr, error, error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            keyStr = this.serializeKey(key);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, , 6]);
            if (!this.memoryCache) return [3 /*break*/, 3];
            return [4 /*yield*/, this.memoryCache.delete(key)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [
              4 /*yield*/,
              this.supabase.from("integration_cache").delete().eq("key", keyStr),
            ];
          case 4:
            error = _a.sent().error;
            if (error) {
              console.error("Supabase cache delete error:", error);
              return [2 /*return*/, false];
            }
            this.stats.deletes++;
            return [2 /*return*/, true];
          case 5:
            error_11 = _a.sent();
            console.error("Supabase cache delete error:", error_11);
            return [2 /*return*/, false];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check if key exists in cache
   */
  SupabaseIntegrationCache.prototype.has = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, keyStr, _b, data, error, error_12;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _a = this.memoryCache;
            if (!_a) return [3 /*break*/, 2];
            return [4 /*yield*/, this.memoryCache.has(key)];
          case 1:
            _a = _c.sent();
            _c.label = 2;
          case 2:
            // Check L1 cache first
            if (_a) {
              return [2 /*return*/, true];
            }
            keyStr = this.serializeKey(key);
            _c.label = 3;
          case 3:
            _c.trys.push([3, 7, , 8]);
            return [
              4 /*yield*/,
              this.supabase
                .from("integration_cache")
                .select("expires_at")
                .eq("key", keyStr)
                .single(),
            ];
          case 4:
            (_b = _c.sent()), (data = _b.data), (error = _b.error);
            if (error || !data) {
              return [2 /*return*/, false];
            }
            if (!(data.expires_at && new Date(data.expires_at) < new Date()))
              return [3 /*break*/, 6];
            return [4 /*yield*/, this.delete(key)];
          case 5:
            _c.sent();
            return [2 /*return*/, false];
          case 6:
            return [2 /*return*/, true];
          case 7:
            error_12 = _c.sent();
            console.error("Supabase cache has error:", error_12);
            return [2 /*return*/, false];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Clear all cache entries
   */
  SupabaseIntegrationCache.prototype.clear = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_13;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            if (!this.memoryCache) return [3 /*break*/, 2];
            return [4 /*yield*/, this.memoryCache.clear()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [4 /*yield*/, this.supabase.from("integration_cache").delete().neq("key", "")];
          case 3:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to clear cache: ".concat(error.message));
            }
            return [3 /*break*/, 5];
          case 4:
            error_13 = _a.sent();
            console.error("Supabase cache clear error:", error_13);
            throw error_13;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get cache statistics
   */
  SupabaseIntegrationCache.prototype.getStats = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, count, error, memoryStats, error_14;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase.from("integration_cache").select("*", { count: "exact", head: true }),
            ];
          case 1:
            (_a = _b.sent()), (count = _a.count), (error = _a.error);
            if (!error) {
              this.stats.size = count || 0;
            }
            if (!this.memoryCache) return [3 /*break*/, 3];
            return [4 /*yield*/, this.memoryCache.getStats()];
          case 2:
            memoryStats = _b.sent();
            return [
              2 /*return*/,
              {
                hits: this.stats.hits + memoryStats.hits,
                misses: this.stats.misses + memoryStats.misses,
                sets: this.stats.sets + memoryStats.sets,
                deletes: this.stats.deletes + memoryStats.deletes,
                evictions: this.stats.evictions + memoryStats.evictions,
                size: this.stats.size,
                hitRate: this.stats.hitRate,
              },
            ];
          case 3:
            return [2 /*return*/, __assign({}, this.stats)];
          case 4:
            error_14 = _b.sent();
            console.error("Supabase cache stats error:", error_14);
            return [2 /*return*/, __assign({}, this.stats)];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get cache size
   */
  SupabaseIntegrationCache.prototype.size = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, count, error, error_15;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("integration_cache").select("*", { count: "exact", head: true }),
            ];
          case 1:
            (_a = _b.sent()), (count = _a.count), (error = _a.error);
            return [2 /*return*/, count || 0];
          case 2:
            error_15 = _b.sent();
            console.error("Supabase cache size error:", error_15);
            return [2 /*return*/, 0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get all keys matching pattern
   */
  SupabaseIntegrationCache.prototype.keys = function (pattern) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error, error_16;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase.from("integration_cache").select("key");
            if (pattern) {
              query = query.like("key", pattern.replace(/\*/g, "%"));
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get keys: ".concat(error.message));
            }
            return [2 /*return*/, (data || []).map((item) => item.key)];
          case 2:
            error_16 = _b.sent();
            console.error("Supabase cache keys error:", error_16);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Private helper methods
  /**
   * Serialize cache key to string
   */
  SupabaseIntegrationCache.prototype.serializeKey = (key) => {
    if (typeof key === "string") {
      return key;
    }
    var parts = [
      key.integrationId,
      key.operation,
      key.resource || "",
      key.params
        ? crypto_1.default.createHash("md5").update(JSON.stringify(key.params)).digest("hex")
        : "",
    ];
    return parts.join(":");
  };
  /**
   * Cleanup expired entries
   */
  SupabaseIntegrationCache.prototype.cleanup = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_17;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("integration_cache")
                .delete()
                .lt("expires_at", new Date().toISOString()),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Cache cleanup error:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_17 = _a.sent();
            console.error("Cache cleanup error:", error_17);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update hit rate
   */
  SupabaseIntegrationCache.prototype.updateHitRate = function () {
    var total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  };
  return SupabaseIntegrationCache;
})();
exports.SupabaseIntegrationCache = SupabaseIntegrationCache;
/**
 * Cache Factory
 * Creates appropriate cache implementation based on configuration
 */
var CacheFactory = /** @class */ (() => {
  function CacheFactory() {}
  /**
   * Create cache instance based on type
   */
  CacheFactory.createCache = (type, config, options) => {
    switch (type) {
      case "memory":
        return new MemoryIntegrationCache(config);
      case "redis":
        if (!(options === null || options === void 0 ? void 0 : options.redisClient)) {
          throw new Error("Redis client is required for Redis cache");
        }
        return new RedisIntegrationCache(options.redisClient, config);
      case "supabase":
        if (
          !(options === null || options === void 0 ? void 0 : options.supabaseUrl) ||
          !(options === null || options === void 0 ? void 0 : options.supabaseKey)
        ) {
          throw new Error("Supabase URL and key are required for Supabase cache");
        }
        return new SupabaseIntegrationCache(options.supabaseUrl, options.supabaseKey, config);
      default:
        throw new Error("Unsupported cache type: ".concat(type));
    }
  };
  return CacheFactory;
})();
exports.CacheFactory = CacheFactory;
