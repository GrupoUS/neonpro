"use client";
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
exports.CacheManager =
  exports.staticCache =
  exports.userCache =
  exports.apiCache =
  exports.defaultCache =
    void 0;
var CacheManager = /** @class */ (() => {
  function CacheManager(options) {
    if (options === void 0) {
      options = {};
    }
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0 };
    this.cleanupInterval = null;
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 100,
      persistent: options.persistent || false,
      prefix: options.prefix || "neonpro_cache",
    };
    // Load persisted cache if enabled
    if (this.options.persistent && typeof window !== "undefined") {
      this.loadFromStorage();
    }
    // Start cleanup interval
    this.startCleanup();
  }
  // =====================================================================================
  // CORE CACHE OPERATIONS
  // =====================================================================================
  CacheManager.prototype.set = function (key, data, ttl) {
    var now = Date.now();
    var itemTtl = ttl || this.options.ttl;
    // Check if we need to evict items (LRU)
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }
    var item = {
      data: data,
      timestamp: now,
      ttl: itemTtl,
      accessCount: 0,
      lastAccessed: now,
    };
    this.cache.set(key, item);
    // Persist if enabled
    if (this.options.persistent) {
      this.persistItem(key, item);
    }
  };
  CacheManager.prototype.get = function (key) {
    var item = this.cache.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }
    var now = Date.now();
    // Check if item has expired
    if (now - item.timestamp > item.ttl) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }
    // Update access statistics
    item.accessCount++;
    item.lastAccessed = now;
    this.stats.hits++;
    return item.data;
  };
  CacheManager.prototype.has = function (key) {
    var item = this.cache.get(key);
    if (!item) return false;
    // Check if expired
    var now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.delete(key);
      return false;
    }
    return true;
  };
  CacheManager.prototype.delete = function (key) {
    var deleted = this.cache.delete(key);
    if (deleted && this.options.persistent) {
      this.removeFromStorage(key);
    }
    return deleted;
  };
  CacheManager.prototype.clear = function () {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
    if (this.options.persistent) {
      this.clearStorage();
    }
  };
  // =====================================================================================
  // ADVANCED OPERATIONS
  // =====================================================================================
  // Get or set pattern
  CacheManager.prototype.getOrSet = function (key, factory, ttl) {
    return __awaiter(this, void 0, void 0, function () {
      var cached, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            cached = this.get(key);
            if (cached !== null) {
              return [2 /*return*/, cached];
            }
            return [4 /*yield*/, factory()];
          case 1:
            data = _a.sent();
            this.set(key, data, ttl);
            return [2 /*return*/, data];
        }
      });
    });
  };
  // Batch operations
  CacheManager.prototype.setMany = function (items) {
    items.forEach((_a) => {
      var key = _a.key,
        data = _a.data,
        ttl = _a.ttl;
      this.set(key, data, ttl);
    });
  };
  CacheManager.prototype.getMany = function (keys) {
    return keys.map((key) => ({ key: key, data: this.get(key) }));
  };
  CacheManager.prototype.deleteMany = function (keys) {
    var deleted = 0;
    keys.forEach((key) => {
      if (this.delete(key)) deleted++;
    });
    return deleted;
  };
  // Pattern-based operations
  CacheManager.prototype.deleteByPattern = function (pattern) {
    var deleted = 0;
    for (var _i = 0, _a = this.cache.keys(); _i < _a.length; _i++) {
      var key = _a[_i];
      if (pattern.test(key)) {
        this.delete(key);
        deleted++;
      }
    }
    return deleted;
  };
  CacheManager.prototype.getByPattern = function (pattern) {
    var results = [];
    for (var _i = 0, _a = this.cache.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        item = _b[1];
      if (pattern.test(key)) {
        var data = this.get(key); // This will handle expiration
        if (data !== null) {
          results.push({ key: key, data: data });
        }
      }
    }
    return results;
  };
  // =====================================================================================
  // CACHE MANAGEMENT
  // =====================================================================================
  CacheManager.prototype.evictLRU = function () {
    var oldestKey = "";
    var oldestTime = Date.now();
    for (var _i = 0, _a = this.cache.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        item = _b[1];
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      this.delete(oldestKey);
    }
  };
  CacheManager.prototype.cleanup = function () {
    var now = Date.now();
    var expiredKeys = [];
    for (var _i = 0, _a = this.cache.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        item = _b[1];
      if (now - item.timestamp > item.ttl) {
        expiredKeys.push(key);
      }
    }
    expiredKeys.forEach((key) => this.delete(key));
  };
  CacheManager.prototype.startCleanup = function () {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  };
  // =====================================================================================
  // PERSISTENCE
  // =====================================================================================
  CacheManager.prototype.persistItem = function (key, item) {
    if (typeof window === "undefined") return;
    try {
      var storageKey = "".concat(this.options.prefix, "_").concat(key);
      localStorage.setItem(storageKey, JSON.stringify(item));
    } catch (error) {
      console.warn("Failed to persist cache item:", error);
    }
  };
  CacheManager.prototype.loadFromStorage = function () {
    if (typeof window === "undefined") return;
    try {
      var prefix = "".concat(this.options.prefix, "_");
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key === null || key === void 0 ? void 0 : key.startsWith(prefix)) {
          var cacheKey = key.substring(prefix.length);
          var itemJson = localStorage.getItem(key);
          if (itemJson) {
            var item = JSON.parse(itemJson);
            // Only load if not expired
            var now = Date.now();
            if (now - item.timestamp <= item.ttl) {
              this.cache.set(cacheKey, item);
            } else {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn("Failed to load cache from storage:", error);
    }
  };
  CacheManager.prototype.removeFromStorage = function (key) {
    if (typeof window === "undefined") return;
    try {
      var storageKey = "".concat(this.options.prefix, "_").concat(key);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("Failed to remove cache item from storage:", error);
    }
  };
  CacheManager.prototype.clearStorage = function () {
    if (typeof window === "undefined") return;
    try {
      var prefix = "".concat(this.options.prefix, "_");
      var keysToRemove = [];
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key === null || key === void 0 ? void 0 : key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn("Failed to clear cache storage:", error);
    }
  };
  // =====================================================================================
  // STATISTICS & MONITORING
  // =====================================================================================
  CacheManager.prototype.getStats = function () {
    var total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  };
  CacheManager.prototype.getKeys = function () {
    return Array.from(this.cache.keys());
  };
  CacheManager.prototype.getSize = function () {
    return this.cache.size;
  };
  // Destroy cache and cleanup
  CacheManager.prototype.destroy = function () {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  };
  return CacheManager;
})();
exports.CacheManager = CacheManager;
// =====================================================================================
// CACHE INSTANCES
// =====================================================================================
// Default cache instance
exports.defaultCache = new CacheManager({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  persistent: true,
  prefix: "neonpro_default",
});
// API response cache
exports.apiCache = new CacheManager({
  ttl: 2 * 60 * 1000, // 2 minutes
  maxSize: 50,
  persistent: false,
  prefix: "neonpro_api",
});
// User data cache
exports.userCache = new CacheManager({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 20,
  persistent: true,
  prefix: "neonpro_user",
});
// Static data cache (longer TTL)
exports.staticCache = new CacheManager({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 200,
  persistent: true,
  prefix: "neonpro_static",
});
