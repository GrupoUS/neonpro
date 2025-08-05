// Caching Utilities for Stock Alert System
// Story 11.4: Alertas e Relatórios de Estoque
// Caching layer for performance optimization
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
exports.CACHE_KEYS =
  exports.CACHE_TTL =
  exports.cacheMetrics =
  exports.stockAlertCache =
  exports.cacheManager =
  exports.CacheMetrics =
  exports.StockAlertCache =
  exports.CacheManager =
    void 0;
var redis_1 = require("@upstash/redis");
// =====================================================
// CONFIGURATION
// =====================================================
var CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  DASHBOARD: 300, // 5 minutes for dashboard data
  ALERTS: 60, // 1 minute for active alerts
  REPORTS: 1800, // 30 minutes for reports
  CONFIGS: 900, // 15 minutes for configurations
};
exports.CACHE_TTL = CACHE_TTL;
var CACHE_KEYS = {
  ALERT_CONFIGS: (clinicId) => "alerts:configs:".concat(clinicId),
  ACTIVE_ALERTS: (clinicId) => "alerts:active:".concat(clinicId),
  DASHBOARD_DATA: (clinicId, period) => "dashboard:".concat(clinicId, ":").concat(period),
  PRODUCT_STOCK: (productId) => "stock:product:".concat(productId),
  CLINIC_PRODUCTS: (clinicId) => "products:clinic:".concat(clinicId),
  REPORT_DATA: (reportId) => "report:".concat(reportId),
  USER_PERMISSIONS: (userId, clinicId) => "permissions:".concat(userId, ":").concat(clinicId),
  NOTIFICATION_QUEUE: (clinicId) => "notifications:queue:".concat(clinicId),
};
exports.CACHE_KEYS = CACHE_KEYS;
// =====================================================
// CACHE CLIENT SETUP
// =====================================================
var redisClient = null;
function getRedisClient() {
  if (process.env.NODE_ENV === "development" && !process.env.UPSTASH_REDIS_REST_URL) {
    // In development without Redis, use in-memory cache
    return null;
  }
  if (!redisClient && process.env.UPSTASH_REDIS_REST_URL) {
    redisClient = new redis_1.Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redisClient;
}
var InMemoryCache = /** @class */ (() => {
  function InMemoryCache() {
    this.cache = new Map();
    this.maxSize = 1000; // Prevent memory leaks
  }
  InMemoryCache.prototype.set = function (key, value, ttlSeconds) {
    // Clean up expired entries if cache is getting large
    if (this.cache.size > this.maxSize) {
      this.cleanup();
    }
    var expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data: value, expiry: expiry });
  };
  InMemoryCache.prototype.get = function (key) {
    var entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  };
  InMemoryCache.prototype.delete = function (key) {
    this.cache.delete(key);
  };
  InMemoryCache.prototype.clear = function () {
    this.cache.clear();
  };
  InMemoryCache.prototype.cleanup = function () {
    var now = Date.now();
    for (var _i = 0, _a = this.cache.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        entry = _b[1];
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  };
  return InMemoryCache;
})();
var inMemoryCache = new InMemoryCache();
// =====================================================
// CACHE INTERFACE
// =====================================================
var CacheManager = /** @class */ (() => {
  function CacheManager() {
    this.redis = getRedisClient();
  }
  /**
   * Set a value in cache with TTL
   */
  CacheManager.prototype.set = function (key_1, value_1) {
    return __awaiter(this, arguments, void 0, function (key, value, ttlSeconds) {
      var serializedValue, error_1;
      if (ttlSeconds === void 0) {
        ttlSeconds = CACHE_TTL.MEDIUM;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            serializedValue = JSON.stringify(value);
            if (!this.redis) return [3 /*break*/, 2];
            return [4 /*yield*/, this.redis.setex(key, ttlSeconds, serializedValue)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            // Fallback to in-memory cache
            inMemoryCache.set(key, value, ttlSeconds);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            console.error("Cache set error:", error_1);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get a value from cache
   */
  CacheManager.prototype.get = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var value, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            if (!this.redis) return [3 /*break*/, 2];
            return [4 /*yield*/, this.redis.get(key)];
          case 1:
            value = _a.sent();
            if (value) {
              return [2 /*return*/, JSON.parse(value)];
            }
            return [3 /*break*/, 3];
          case 2:
            // Fallback to in-memory cache
            return [2 /*return*/, inMemoryCache.get(key)];
          case 3:
            return [2 /*return*/, null];
          case 4:
            error_2 = _a.sent();
            console.error("Cache get error:", error_2);
            return [2 /*return*/, null];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Delete a value from cache
   */
  CacheManager.prototype.delete = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            if (!this.redis) return [3 /*break*/, 2];
            return [4 /*yield*/, this.redis.del(key)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            inMemoryCache.delete(key);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_3 = _a.sent();
            console.error("Cache delete error:", error_3);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Delete multiple keys matching a pattern
   */
  CacheManager.prototype.deletePattern = function (pattern) {
    return __awaiter(this, void 0, void 0, function () {
      var keys, error_4;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            if (!this.redis) return [3 /*break*/, 4];
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
            // For in-memory cache, we'd need to implement pattern matching
            console.warn("Pattern deletion not supported in in-memory cache");
            _b.label = 5;
          case 5:
            return [3 /*break*/, 7];
          case 6:
            error_4 = _b.sent();
            console.error("Cache delete pattern error:", error_4);
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get or set pattern - fetch from cache or execute function and cache result
   */
  CacheManager.prototype.getOrSet = function (key_1, fetchFunction_1) {
    return __awaiter(this, arguments, void 0, function (key, fetchFunction, ttlSeconds) {
      var cached, result, error_5;
      if (ttlSeconds === void 0) {
        ttlSeconds = CACHE_TTL.MEDIUM;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.get(key)];
          case 1:
            cached = _a.sent();
            if (cached !== null) {
              return [2 /*return*/, cached];
            }
            _a.label = 2;
          case 2:
            _a.trys.push([2, 5, , 6]);
            return [4 /*yield*/, fetchFunction()];
          case 3:
            result = _a.sent();
            return [4 /*yield*/, this.set(key, result, ttlSeconds)];
          case 4:
            _a.sent();
            return [2 /*return*/, result];
          case 5:
            error_5 = _a.sent();
            console.error("Cache getOrSet error:", error_5);
            throw error_5;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Increment a counter in cache
   */
  CacheManager.prototype.increment = function (key_1) {
    return __awaiter(this, arguments, void 0, function (key, amount) {
      var current, newValue, error_6;
      if (amount === void 0) {
        amount = 1;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            if (!this.redis) return [3 /*break*/, 2];
            return [4 /*yield*/, this.redis.incrby(key, amount)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            current = inMemoryCache.get(key) || 0;
            newValue = current + amount;
            inMemoryCache.set(key, newValue, CACHE_TTL.LONG);
            return [2 /*return*/, newValue];
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_6 = _a.sent();
            console.error("Cache increment error:", error_6);
            return [2 /*return*/, 0];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Add item to a list (queue)
   */
  CacheManager.prototype.listPush = function (key, value) {
    return __awaiter(this, void 0, void 0, function () {
      var list, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            if (!this.redis) return [3 /*break*/, 2];
            return [4 /*yield*/, this.redis.lpush(key, JSON.stringify(value))];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            list = inMemoryCache.get(key) || [];
            list.unshift(value);
            inMemoryCache.set(key, list, CACHE_TTL.MEDIUM);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_7 = _a.sent();
            console.error("Cache list push error:", error_7);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get items from a list
   */
  CacheManager.prototype.listGet = function (key_1) {
    return __awaiter(this, arguments, void 0, function (key, start, end) {
      var items, list, error_8;
      if (start === void 0) {
        start = 0;
      }
      if (end === void 0) {
        end = -1;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            if (!this.redis) return [3 /*break*/, 2];
            return [4 /*yield*/, this.redis.lrange(key, start, end)];
          case 1:
            items = _a.sent();
            return [2 /*return*/, items.map((item) => JSON.parse(item))];
          case 2:
            list = inMemoryCache.get(key) || [];
            return [2 /*return*/, list.slice(start, end === -1 ? undefined : end + 1)];
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_8 = _a.sent();
            console.error("Cache list get error:", error_8);
            return [2 /*return*/, []];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  return CacheManager;
})();
exports.CacheManager = CacheManager;
// =====================================================
// CACHE STRATEGIES
// =====================================================
var StockAlertCache = /** @class */ (() => {
  function StockAlertCache() {
    this.cache = new CacheManager();
  }
  // Alert Configurations
  StockAlertCache.prototype.getAlertConfigs = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.cache.get(CACHE_KEYS.ALERT_CONFIGS(clinicId))];
      });
    });
  };
  StockAlertCache.prototype.setAlertConfigs = function (clinicId, configs) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.cache.set(CACHE_KEYS.ALERT_CONFIGS(clinicId), configs, CACHE_TTL.CONFIGS),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  StockAlertCache.prototype.invalidateAlertConfigs = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.cache.delete(CACHE_KEYS.ALERT_CONFIGS(clinicId))];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  // Active Alerts
  StockAlertCache.prototype.getActiveAlerts = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.cache.get(CACHE_KEYS.ACTIVE_ALERTS(clinicId))];
      });
    });
  };
  StockAlertCache.prototype.setActiveAlerts = function (clinicId, alerts) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.cache.set(CACHE_KEYS.ACTIVE_ALERTS(clinicId), alerts, CACHE_TTL.ALERTS),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  StockAlertCache.prototype.invalidateActiveAlerts = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.cache.delete(CACHE_KEYS.ACTIVE_ALERTS(clinicId))];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  // Dashboard Data
  StockAlertCache.prototype.getDashboardData = function (clinicId, period) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.cache.get(CACHE_KEYS.DASHBOARD_DATA(clinicId, period))];
      });
    });
  };
  StockAlertCache.prototype.setDashboardData = function (clinicId, period, data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.cache.set(
                CACHE_KEYS.DASHBOARD_DATA(clinicId, period),
                data,
                CACHE_TTL.DASHBOARD,
              ),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  StockAlertCache.prototype.invalidateDashboardData = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.cache.deletePattern("dashboard:".concat(clinicId, ":*"))];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  // Product Stock
  StockAlertCache.prototype.getProductStock = function (productId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.cache.get(CACHE_KEYS.PRODUCT_STOCK(productId))];
      });
    });
  };
  StockAlertCache.prototype.setProductStock = function (productId, stock) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.cache.set(CACHE_KEYS.PRODUCT_STOCK(productId), stock, CACHE_TTL.SHORT),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  StockAlertCache.prototype.invalidateProductStock = function (productId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.cache.delete(CACHE_KEYS.PRODUCT_STOCK(productId))];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  // Clinic Products
  StockAlertCache.prototype.getClinicProducts = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.cache.get(CACHE_KEYS.CLINIC_PRODUCTS(clinicId))];
      });
    });
  };
  StockAlertCache.prototype.setClinicProducts = function (clinicId, products) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.cache.set(CACHE_KEYS.CLINIC_PRODUCTS(clinicId), products, CACHE_TTL.MEDIUM),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  StockAlertCache.prototype.invalidateClinicProducts = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.cache.delete(CACHE_KEYS.CLINIC_PRODUCTS(clinicId))];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  // Report Data
  StockAlertCache.prototype.getReportData = function (reportId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.cache.get(CACHE_KEYS.REPORT_DATA(reportId))];
      });
    });
  };
  StockAlertCache.prototype.setReportData = function (reportId, data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.cache.set(CACHE_KEYS.REPORT_DATA(reportId), data, CACHE_TTL.REPORTS),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  // Notification Queue
  StockAlertCache.prototype.addNotification = function (clinicId, notification) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.cache.listPush(CACHE_KEYS.NOTIFICATION_QUEUE(clinicId), notification),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  StockAlertCache.prototype.getNotifications = function (clinicId_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, limit) {
      if (limit === void 0) {
        limit = 10;
      }
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          this.cache.listGet(CACHE_KEYS.NOTIFICATION_QUEUE(clinicId), 0, limit - 1),
        ];
      });
    });
  };
  // Bulk invalidation for data changes
  StockAlertCache.prototype.invalidateClinicData = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              Promise.all([
                this.invalidateAlertConfigs(clinicId),
                this.invalidateActiveAlerts(clinicId),
                this.invalidateDashboardData(clinicId),
                this.invalidateClinicProducts(clinicId),
              ]),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  return StockAlertCache;
})();
exports.StockAlertCache = StockAlertCache;
// =====================================================
// PERFORMANCE MONITORING
// =====================================================
var CacheMetrics = /** @class */ (() => {
  function CacheMetrics() {
    this.cache = new CacheManager();
  }
  CacheMetrics.prototype.recordHit = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var hitKey;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            hitKey = "metrics:hits:".concat(key);
            return [4 /*yield*/, this.cache.increment(hitKey)];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  CacheMetrics.prototype.recordMiss = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var missKey;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            missKey = "metrics:misses:".concat(key);
            return [4 /*yield*/, this.cache.increment(missKey)];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  CacheMetrics.prototype.getHitRate = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var hits, misses, total;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.cache.get("metrics:hits:".concat(key))];
          case 1:
            hits = _a.sent() || 0;
            return [4 /*yield*/, this.cache.get("metrics:misses:".concat(key))];
          case 2:
            misses = _a.sent() || 0;
            total = hits + misses;
            return [2 /*return*/, total > 0 ? hits / total : 0];
        }
      });
    });
  };
  return CacheMetrics;
})();
exports.CacheMetrics = CacheMetrics;
// =====================================================
// EXPORTS
// =====================================================
exports.cacheManager = new CacheManager();
exports.stockAlertCache = new StockAlertCache();
exports.cacheMetrics = new CacheMetrics();
