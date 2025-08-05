"use strict";
/**
 * Cache Manager Tests
 * Comprehensive test suite for mobile cache functionality
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
var globals_1 = require("@jest/globals");
var cache_manager_1 = require("../cache-manager");
// Mock IndexedDB
var mockIndexedDB = {
  open: globals_1.jest.fn(),
  deleteDatabase: globals_1.jest.fn(),
};
Object.defineProperty(global, "indexedDB", {
  value: mockIndexedDB,
  writable: true,
});
// Mock localStorage
var mockLocalStorage = {
  getItem: globals_1.jest.fn(),
  setItem: globals_1.jest.fn(),
  removeItem: globals_1.jest.fn(),
  clear: globals_1.jest.fn(),
  length: 0,
  key: globals_1.jest.fn(),
};
Object.defineProperty(global, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});
(0, globals_1.describe)("CacheManager", function () {
  var cacheManager;
  var mockConfig;
  (0, globals_1.beforeEach)(function () {
    mockConfig = {
      enabled: true,
      strategy: "lru",
      maxSize: 10 * 1024 * 1024, // 10MB
      defaultTtl: 3600000, // 1 hour
      compression: {
        enabled: true,
        algorithm: "gzip",
        level: 6,
      },
      encryption: {
        enabled: true,
        algorithm: "AES-256-GCM",
        key: "test-encryption-key-32-characters",
      },
      storage: {
        persistent: true,
        indexedDB: true,
        localStorage: true,
      },
      cleanup: {
        interval: 300000, // 5 minutes
        maxAge: 86400000, // 24 hours
      },
    };
    cacheManager = new cache_manager_1.CacheManager(mockConfig);
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.afterEach)(function () {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, cacheManager.shutdown()];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  (0, globals_1.describe)("Initialization", function () {
    (0, globals_1.it)("should initialize successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, globals_1.expect)(cacheManager.initialize()).resolves.not.toThrow(),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle initialization with disabled cache", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var disabledConfig, disabledCacheManager;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              disabledConfig = __assign(__assign({}, mockConfig), { enabled: false });
              disabledCacheManager = new cache_manager_1.CacheManager(disabledConfig);
              return [
                4 /*yield*/,
                (0, globals_1.expect)(disabledCacheManager.initialize()).resolves.not.toThrow(),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should initialize storage layers", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.initialize()];
            case 1:
              _a.sent();
              // Verify IndexedDB initialization
              (0, globals_1.expect)(mockIndexedDB.open).toHaveBeenCalled();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Basic Cache Operations", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should set and get cache entries", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var key, value, ttl, retrieved;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              key = "test-key";
              value = { data: "test-value", timestamp: Date.now() };
              ttl = 60000;
              return [4 /*yield*/, cacheManager.set(key, value, ttl)];
            case 1:
              _a.sent();
              return [4 /*yield*/, cacheManager.get(key)];
            case 2:
              retrieved = _a.sent();
              (0, globals_1.expect)(retrieved).toEqual(value);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should return null for non-existent keys", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.get("non-existent-key")];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result).toBeNull();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should delete cache entries", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var key, value, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              key = "delete-test";
              value = { data: "to-be-deleted" };
              return [4 /*yield*/, cacheManager.set(key, value)];
            case 1:
              _a.sent();
              return [4 /*yield*/, cacheManager.delete(key)];
            case 2:
              _a.sent();
              return [4 /*yield*/, cacheManager.get(key)];
            case 3:
              result = _a.sent();
              (0, globals_1.expect)(result).toBeNull();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should check if key exists", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var key, value, _a, _b;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              key = "exists-test";
              value = { data: "exists" };
              _a = globals_1.expect;
              return [4 /*yield*/, cacheManager.has(key)];
            case 1:
              _a.apply(void 0, [_c.sent()]).toBe(false);
              return [4 /*yield*/, cacheManager.set(key, value)];
            case 2:
              _c.sent();
              _b = globals_1.expect;
              return [4 /*yield*/, cacheManager.has(key)];
            case 3:
              _b.apply(void 0, [_c.sent()]).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should clear all cache entries", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, cacheManager.set("key1", { data: "value1" })];
            case 1:
              _c.sent();
              return [4 /*yield*/, cacheManager.set("key2", { data: "value2" })];
            case 2:
              _c.sent();
              return [4 /*yield*/, cacheManager.clear()];
            case 3:
              _c.sent();
              _a = globals_1.expect;
              return [4 /*yield*/, cacheManager.get("key1")];
            case 4:
              _a.apply(void 0, [_c.sent()]).toBeNull();
              _b = globals_1.expect;
              return [4 /*yield*/, cacheManager.get("key2")];
            case 5:
              _b.apply(void 0, [_c.sent()]).toBeNull();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("TTL (Time To Live)", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should respect TTL and expire entries", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var key, value, shortTtl, _a, _b;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              key = "ttl-test";
              value = { data: "expires-soon" };
              shortTtl = 100;
              return [4 /*yield*/, cacheManager.set(key, value, shortTtl)];
            case 1:
              _c.sent();
              // Should exist immediately
              _a = globals_1.expect;
              return [4 /*yield*/, cacheManager.get(key)];
            case 2:
              // Should exist immediately
              _a.apply(void 0, [_c.sent()]).toEqual(value);
              // Wait for expiration
              return [
                4 /*yield*/,
                new Promise(function (resolve) {
                  return setTimeout(resolve, 150);
                }),
              ];
            case 3:
              // Wait for expiration
              _c.sent();
              // Should be expired
              _b = globals_1.expect;
              return [4 /*yield*/, cacheManager.get(key)];
            case 4:
              // Should be expired
              _b.apply(void 0, [_c.sent()]).toBeNull();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should use default TTL when not specified", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var key, value, stats;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              key = "default-ttl-test";
              value = { data: "default-ttl" };
              return [4 /*yield*/, cacheManager.set(key, value)];
            case 1:
              _a.sent();
              stats = cacheManager.getStats();
              (0, globals_1.expect)(stats.entries).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should update TTL for existing entries", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var key, value, _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              key = "update-ttl-test";
              value = { data: "update-ttl" };
              return [4 /*yield*/, cacheManager.set(key, value, 1000)];
            case 1:
              _b.sent();
              return [4 /*yield*/, cacheManager.updateTtl(key, 5000)];
            case 2:
              _b.sent();
              // Entry should still exist
              _a = globals_1.expect;
              return [4 /*yield*/, cacheManager.get(key)];
            case 3:
              // Entry should still exist
              _a.apply(void 0, [_b.sent()]).toEqual(value);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Cache Strategies", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should implement LRU eviction strategy", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var smallConfig, lruCache, largeValue, _a, _b, _c;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              smallConfig = __assign(__assign({}, mockConfig), {
                strategy: "lru",
                maxSize: 1024, // 1KB
              });
              lruCache = new cache_manager_1.CacheManager(smallConfig);
              return [4 /*yield*/, lruCache.initialize()];
            case 1:
              _d.sent();
              largeValue = { data: "x".repeat(500) };
              return [4 /*yield*/, lruCache.set("key1", largeValue)];
            case 2:
              _d.sent();
              return [4 /*yield*/, lruCache.set("key2", largeValue)];
            case 3:
              _d.sent();
              return [4 /*yield*/, lruCache.set("key3", largeValue)];
            case 4:
              _d.sent(); // Should evict key1
              _a = globals_1.expect;
              return [4 /*yield*/, lruCache.get("key1")];
            case 5:
              _a.apply(void 0, [_d.sent()]).toBeNull();
              _b = globals_1.expect;
              return [4 /*yield*/, lruCache.get("key2")];
            case 6:
              _b.apply(void 0, [_d.sent()]).toEqual(largeValue);
              _c = globals_1.expect;
              return [4 /*yield*/, lruCache.get("key3")];
            case 7:
              _c.apply(void 0, [_d.sent()]).toEqual(largeValue);
              return [4 /*yield*/, lruCache.shutdown()];
            case 8:
              _d.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should implement FIFO eviction strategy", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var fifoConfig, fifoCache, largeValue, _a, _b, _c;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              fifoConfig = __assign(__assign({}, mockConfig), { strategy: "fifo", maxSize: 1024 });
              fifoCache = new cache_manager_1.CacheManager(fifoConfig);
              return [4 /*yield*/, fifoCache.initialize()];
            case 1:
              _d.sent();
              largeValue = { data: "x".repeat(500) };
              return [4 /*yield*/, fifoCache.set("key1", largeValue)];
            case 2:
              _d.sent();
              return [4 /*yield*/, fifoCache.set("key2", largeValue)];
            case 3:
              _d.sent();
              return [4 /*yield*/, fifoCache.set("key3", largeValue)];
            case 4:
              _d.sent(); // Should evict key1
              _a = globals_1.expect;
              return [4 /*yield*/, fifoCache.get("key1")];
            case 5:
              _a.apply(void 0, [_d.sent()]).toBeNull();
              _b = globals_1.expect;
              return [4 /*yield*/, fifoCache.get("key2")];
            case 6:
              _b.apply(void 0, [_d.sent()]).toEqual(largeValue);
              _c = globals_1.expect;
              return [4 /*yield*/, fifoCache.get("key3")];
            case 7:
              _c.apply(void 0, [_d.sent()]).toEqual(largeValue);
              return [4 /*yield*/, fifoCache.shutdown()];
            case 8:
              _d.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should implement LFU eviction strategy", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var lfuConfig, lfuCache, largeValue, _a, _b, _c;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              lfuConfig = __assign(__assign({}, mockConfig), { strategy: "lfu", maxSize: 1024 });
              lfuCache = new cache_manager_1.CacheManager(lfuConfig);
              return [4 /*yield*/, lfuCache.initialize()];
            case 1:
              _d.sent();
              largeValue = { data: "x".repeat(500) };
              return [4 /*yield*/, lfuCache.set("key1", largeValue)];
            case 2:
              _d.sent();
              return [4 /*yield*/, lfuCache.set("key2", largeValue)];
            case 3:
              _d.sent();
              // Access key2 multiple times to increase frequency
              return [4 /*yield*/, lfuCache.get("key2")];
            case 4:
              // Access key2 multiple times to increase frequency
              _d.sent();
              return [4 /*yield*/, lfuCache.get("key2")];
            case 5:
              _d.sent();
              return [4 /*yield*/, lfuCache.set("key3", largeValue)];
            case 6:
              _d.sent(); // Should evict key1 (least frequent)
              _a = globals_1.expect;
              return [4 /*yield*/, lfuCache.get("key1")];
            case 7:
              _a.apply(void 0, [_d.sent()]).toBeNull();
              _b = globals_1.expect;
              return [4 /*yield*/, lfuCache.get("key2")];
            case 8:
              _b.apply(void 0, [_d.sent()]).toEqual(largeValue);
              _c = globals_1.expect;
              return [4 /*yield*/, lfuCache.get("key3")];
            case 9:
              _c.apply(void 0, [_d.sent()]).toEqual(largeValue);
              return [4 /*yield*/, lfuCache.shutdown()];
            case 10:
              _d.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Compression", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should compress large values when enabled", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var key, largeValue, retrieved, stats;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              key = "compression-test";
              largeValue = {
                data: "x".repeat(10000), // Large string
                metadata: { compressed: true },
              };
              return [4 /*yield*/, cacheManager.set(key, largeValue)];
            case 1:
              _a.sent();
              return [4 /*yield*/, cacheManager.get(key)];
            case 2:
              retrieved = _a.sent();
              (0, globals_1.expect)(retrieved).toEqual(largeValue);
              stats = cacheManager.getStats();
              (0, globals_1.expect)(stats.compressionRatio).toBeGreaterThan(1);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle different compression algorithms", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var brotliConfig, brotliCache, key, value, retrieved;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              brotliConfig = __assign(__assign({}, mockConfig), {
                compression: {
                  enabled: true,
                  algorithm: "brotli",
                  level: 6,
                },
              });
              brotliCache = new cache_manager_1.CacheManager(brotliConfig);
              return [4 /*yield*/, brotliCache.initialize()];
            case 1:
              _a.sent();
              key = "brotli-test";
              value = { data: "brotli-compressed-data".repeat(100) };
              return [4 /*yield*/, brotliCache.set(key, value)];
            case 2:
              _a.sent();
              return [4 /*yield*/, brotliCache.get(key)];
            case 3:
              retrieved = _a.sent();
              (0, globals_1.expect)(retrieved).toEqual(value);
              return [4 /*yield*/, brotliCache.shutdown()];
            case 4:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should skip compression for small values", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var key, smallValue, retrieved;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              key = "small-value-test";
              smallValue = { data: "small" };
              return [4 /*yield*/, cacheManager.set(key, smallValue)];
            case 1:
              _a.sent();
              return [4 /*yield*/, cacheManager.get(key)];
            case 2:
              retrieved = _a.sent();
              (0, globals_1.expect)(retrieved).toEqual(smallValue);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Encryption", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should encrypt sensitive data when enabled", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var key, sensitiveValue, retrieved;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              key = "encryption-test";
              sensitiveValue = {
                password: "secret123",
                token: "sensitive-token",
                data: "encrypted-data",
              };
              return [4 /*yield*/, cacheManager.set(key, sensitiveValue)];
            case 1:
              _a.sent();
              return [4 /*yield*/, cacheManager.get(key)];
            case 2:
              retrieved = _a.sent();
              (0, globals_1.expect)(retrieved).toEqual(sensitiveValue);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle encryption errors gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidConfig, invalidCache;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              invalidConfig = __assign(__assign({}, mockConfig), {
                encryption: {
                  enabled: true,
                  algorithm: "AES-256-GCM",
                  key: "invalid-key", // Too short
                },
              });
              invalidCache = new cache_manager_1.CacheManager(invalidConfig);
              return [
                4 /*yield*/,
                (0, globals_1.expect)(invalidCache.initialize()).rejects.toThrow(),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Pattern Operations", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should get keys matching pattern", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var userKeys;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.set("user:1:profile", { name: "User 1" })];
            case 1:
              _a.sent();
              return [4 /*yield*/, cacheManager.set("user:2:profile", { name: "User 2" })];
            case 2:
              _a.sent();
              return [4 /*yield*/, cacheManager.set("user:1:settings", { theme: "dark" })];
            case 3:
              _a.sent();
              return [4 /*yield*/, cacheManager.set("product:1", { name: "Product 1" })];
            case 4:
              _a.sent();
              return [4 /*yield*/, cacheManager.getKeys("user:*")];
            case 5:
              userKeys = _a.sent();
              (0, globals_1.expect)(userKeys).toHaveLength(3);
              (0, globals_1.expect)(userKeys).toContain("user:1:profile");
              (0, globals_1.expect)(userKeys).toContain("user:2:profile");
              (0, globals_1.expect)(userKeys).toContain("user:1:settings");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should invalidate keys matching pattern", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              return [4 /*yield*/, cacheManager.set("cache:api:users", { data: "users" })];
            case 1:
              _d.sent();
              return [4 /*yield*/, cacheManager.set("cache:api:products", { data: "products" })];
            case 2:
              _d.sent();
              return [4 /*yield*/, cacheManager.set("cache:static:images", { data: "images" })];
            case 3:
              _d.sent();
              return [4 /*yield*/, cacheManager.invalidatePattern("cache:api:*")];
            case 4:
              _d.sent();
              _a = globals_1.expect;
              return [4 /*yield*/, cacheManager.get("cache:api:users")];
            case 5:
              _a.apply(void 0, [_d.sent()]).toBeNull();
              _b = globals_1.expect;
              return [4 /*yield*/, cacheManager.get("cache:api:products")];
            case 6:
              _b.apply(void 0, [_d.sent()]).toBeNull();
              _c = globals_1.expect;
              return [4 /*yield*/, cacheManager.get("cache:static:images")];
            case 7:
              _c.apply(void 0, [_d.sent()]).not.toBeNull();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should get multiple values by pattern", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var sessions;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.set("session:user1", { id: 1, name: "User 1" })];
            case 1:
              _a.sent();
              return [4 /*yield*/, cacheManager.set("session:user2", { id: 2, name: "User 2" })];
            case 2:
              _a.sent();
              return [4 /*yield*/, cacheManager.set("config:app", { theme: "light" })];
            case 3:
              _a.sent();
              return [4 /*yield*/, cacheManager.getByPattern("session:*")];
            case 4:
              sessions = _a.sent();
              (0, globals_1.expect)(Object.keys(sessions)).toHaveLength(2);
              (0, globals_1.expect)(sessions["session:user1"]).toEqual({ id: 1, name: "User 1" });
              (0, globals_1.expect)(sessions["session:user2"]).toEqual({ id: 2, name: "User 2" });
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Batch Operations", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should set multiple values in batch", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var entries, _i, _a, _b, key, value, _c;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              entries = {
                "batch:1": { data: "value1" },
                "batch:2": { data: "value2" },
                "batch:3": { data: "value3" },
              };
              return [4 /*yield*/, cacheManager.setMultiple(entries, 60000)];
            case 1:
              _d.sent();
              (_i = 0), (_a = Object.entries(entries));
              _d.label = 2;
            case 2:
              if (!(_i < _a.length)) return [3 /*break*/, 5];
              (_b = _a[_i]), (key = _b[0]), (value = _b[1]);
              _c = globals_1.expect;
              return [4 /*yield*/, cacheManager.get(key)];
            case 3:
              _c.apply(void 0, [_d.sent()]).toEqual(value);
              _d.label = 4;
            case 4:
              _i++;
              return [3 /*break*/, 2];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should get multiple values in batch", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var keys, results;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.set("multi:1", { data: "value1" })];
            case 1:
              _a.sent();
              return [4 /*yield*/, cacheManager.set("multi:2", { data: "value2" })];
            case 2:
              _a.sent();
              return [4 /*yield*/, cacheManager.set("multi:3", { data: "value3" })];
            case 3:
              _a.sent();
              keys = ["multi:1", "multi:2", "multi:3", "multi:4"];
              return [4 /*yield*/, cacheManager.getMultiple(keys)];
            case 4:
              results = _a.sent();
              (0, globals_1.expect)(results["multi:1"]).toEqual({ data: "value1" });
              (0, globals_1.expect)(results["multi:2"]).toEqual({ data: "value2" });
              (0, globals_1.expect)(results["multi:3"]).toEqual({ data: "value3" });
              (0, globals_1.expect)(results["multi:4"]).toBeNull();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should delete multiple values in batch", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var keys, _a, _b, _c;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              return [4 /*yield*/, cacheManager.set("delete:1", { data: "value1" })];
            case 1:
              _d.sent();
              return [4 /*yield*/, cacheManager.set("delete:2", { data: "value2" })];
            case 2:
              _d.sent();
              return [4 /*yield*/, cacheManager.set("delete:3", { data: "value3" })];
            case 3:
              _d.sent();
              keys = ["delete:1", "delete:2"];
              return [4 /*yield*/, cacheManager.deleteMultiple(keys)];
            case 4:
              _d.sent();
              _a = globals_1.expect;
              return [4 /*yield*/, cacheManager.get("delete:1")];
            case 5:
              _a.apply(void 0, [_d.sent()]).toBeNull();
              _b = globals_1.expect;
              return [4 /*yield*/, cacheManager.get("delete:2")];
            case 6:
              _b.apply(void 0, [_d.sent()]).toBeNull();
              _c = globals_1.expect;
              return [4 /*yield*/, cacheManager.get("delete:3")];
            case 7:
              _c.apply(void 0, [_d.sent()]).not.toBeNull();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Storage Layers", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should use memory storage for fast access", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var key, value, retrieved;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              key = "memory-test";
              value = { data: "in-memory" };
              return [4 /*yield*/, cacheManager.set(key, value)];
            case 1:
              _a.sent();
              return [4 /*yield*/, cacheManager.get(key)];
            case 2:
              retrieved = _a.sent();
              (0, globals_1.expect)(retrieved).toEqual(value);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should persist to IndexedDB for durability", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var key, value, newCacheManager, retrieved;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              key = "persistent-test";
              value = { data: "persistent-data" };
              return [4 /*yield*/, cacheManager.set(key, value)];
            case 1:
              _a.sent();
              newCacheManager = new cache_manager_1.CacheManager(mockConfig);
              return [4 /*yield*/, newCacheManager.initialize()];
            case 2:
              _a.sent();
              return [4 /*yield*/, newCacheManager.get(key)];
            case 3:
              retrieved = _a.sent();
              (0, globals_1.expect)(retrieved).toEqual(value);
              return [4 /*yield*/, newCacheManager.shutdown()];
            case 4:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should fallback to localStorage when IndexedDB fails", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var fallbackCache, key, value, retrieved;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              // Mock IndexedDB failure
              mockIndexedDB.open.mockRejectedValueOnce(new Error("IndexedDB not available"));
              fallbackCache = new cache_manager_1.CacheManager(mockConfig);
              return [4 /*yield*/, fallbackCache.initialize()];
            case 1:
              _a.sent();
              key = "fallback-test";
              value = { data: "fallback-data" };
              return [4 /*yield*/, fallbackCache.set(key, value)];
            case 2:
              _a.sent();
              return [4 /*yield*/, fallbackCache.get(key)];
            case 3:
              retrieved = _a.sent();
              (0, globals_1.expect)(retrieved).toEqual(value);
              (0, globals_1.expect)(mockLocalStorage.setItem).toHaveBeenCalled();
              return [4 /*yield*/, fallbackCache.shutdown()];
            case 4:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Statistics and Monitoring", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should track cache statistics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var stats;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.set("stats:1", { data: "value1" })];
            case 1:
              _a.sent();
              return [4 /*yield*/, cacheManager.set("stats:2", { data: "value2" })];
            case 2:
              _a.sent();
              return [4 /*yield*/, cacheManager.get("stats:1")];
            case 3:
              _a.sent(); // Hit
              return [4 /*yield*/, cacheManager.get("stats:3")];
            case 4:
              _a.sent(); // Miss
              stats = cacheManager.getStats();
              (0, globals_1.expect)(stats.entries).toBe(2);
              (0, globals_1.expect)(stats.hits).toBe(1);
              (0, globals_1.expect)(stats.misses).toBe(1);
              (0, globals_1.expect)(stats.hitRate).toBe(0.5);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should track memory usage", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var largeValue, stats;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              largeValue = { data: "x".repeat(1000) };
              return [4 /*yield*/, cacheManager.set("memory:1", largeValue)];
            case 1:
              _a.sent();
              return [4 /*yield*/, cacheManager.set("memory:2", largeValue)];
            case 2:
              _a.sent();
              stats = cacheManager.getStats();
              (0, globals_1.expect)(stats.memoryUsage).toBeGreaterThan(0);
              (0, globals_1.expect)(stats.storageUsage).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should reset statistics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var stats;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.set("reset:1", { data: "value1" })];
            case 1:
              _a.sent();
              return [4 /*yield*/, cacheManager.get("reset:1")];
            case 2:
              _a.sent();
              cacheManager.resetStats();
              stats = cacheManager.getStats();
              (0, globals_1.expect)(stats.hits).toBe(0);
              (0, globals_1.expect)(stats.misses).toBe(0);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Health Check", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should return healthy status when functioning properly", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var health;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.healthCheck()];
            case 1:
              health = _a.sent();
              (0, globals_1.expect)(health.healthy).toBe(true);
              (0, globals_1.expect)(health.timestamp).toBeDefined();
              (0, globals_1.expect)(health.responseTime).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should detect storage issues", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var health;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              // Mock storage failure
              mockLocalStorage.setItem.mockImplementationOnce(function () {
                throw new Error("Storage quota exceeded");
              });
              return [4 /*yield*/, cacheManager.healthCheck()];
            case 1:
              health = _a.sent();
              (0, globals_1.expect)(health.healthy).toBe(false);
              (0, globals_1.expect)(health.error).toContain("Storage");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Cleanup and Maintenance", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should clean up expired entries", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var shortTtl, _a, _b;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              shortTtl = 100;
              return [4 /*yield*/, cacheManager.set("cleanup:1", { data: "expires" }, shortTtl)];
            case 1:
              _c.sent();
              return [4 /*yield*/, cacheManager.set("cleanup:2", { data: "persists" }, 60000)];
            case 2:
              _c.sent();
              // Wait for expiration
              return [
                4 /*yield*/,
                new Promise(function (resolve) {
                  return setTimeout(resolve, 150);
                }),
              ];
            case 3:
              // Wait for expiration
              _c.sent();
              return [4 /*yield*/, cacheManager.cleanup()];
            case 4:
              _c.sent();
              _a = globals_1.expect;
              return [4 /*yield*/, cacheManager.get("cleanup:1")];
            case 5:
              _a.apply(void 0, [_c.sent()]).toBeNull();
              _b = globals_1.expect;
              return [4 /*yield*/, cacheManager.get("cleanup:2")];
            case 6:
              _b.apply(void 0, [_c.sent()]).not.toBeNull();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should optimize storage periodically", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var i, statsBefore, statsAfter;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              i = 0;
              _a.label = 1;
            case 1:
              if (!(i < 100)) return [3 /*break*/, 4];
              return [
                4 /*yield*/,
                cacheManager.set("optimize:".concat(i), { data: "value".concat(i) }),
              ];
            case 2:
              _a.sent();
              _a.label = 3;
            case 3:
              i++;
              return [3 /*break*/, 1];
            case 4:
              statsBefore = cacheManager.getStats();
              return [4 /*yield*/, cacheManager.optimize()];
            case 5:
              _a.sent();
              statsAfter = cacheManager.getStats();
              // Optimization should maintain or improve efficiency
              (0, globals_1.expect)(statsAfter.entries).toBeLessThanOrEqual(statsBefore.entries);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Error Handling", function () {
    (0, globals_1.beforeEach)(function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cacheManager.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle storage quota exceeded", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var key, value;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              // Mock storage quota error
              mockLocalStorage.setItem.mockImplementationOnce(function () {
                throw new Error("QuotaExceededError");
              });
              key = "quota-test";
              value = { data: "large-value".repeat(1000) };
              // Should handle gracefully without throwing
              return [
                4 /*yield*/,
                (0, globals_1.expect)(cacheManager.set(key, value)).resolves.not.toThrow(),
              ];
            case 1:
              // Should handle gracefully without throwing
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle corrupted cache data", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              // Mock corrupted data
              mockLocalStorage.getItem.mockReturnValueOnce("invalid-json{");
              return [4 /*yield*/, cacheManager.get("corrupted-key")];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result).toBeNull();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle network errors during sync", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              // This would test sync functionality if implemented
              // For now, just ensure no errors are thrown
              return [
                4 /*yield*/,
                (0, globals_1.expect)(cacheManager.sync()).resolves.not.toThrow(),
              ];
            case 1:
              // This would test sync functionality if implemented
              // For now, just ensure no errors are thrown
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
