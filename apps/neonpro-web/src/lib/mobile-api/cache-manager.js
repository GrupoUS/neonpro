/**
 * Mobile Cache Manager
 * Story 7.4: Mobile App API Support - Cache Management
 *
 * Intelligent caching system for mobile APIs:
 * - Multi-level caching (memory + disk)
 * - Cache strategies (cache-first, network-first, etc.)
 * - Automatic cache invalidation
 * - Compression and encryption
 * - Performance optimization
 * - Storage management
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
exports.MobileCache = void 0;
var compression_utils_1 = require("./compression-utils");
var security_utils_1 = require("./security-utils");
var MobileCache = /** @class */ (() => {
  function MobileCache(config) {
    this.memoryCache = new Map();
    this.diskCache = new Map();
    this.isInitialized = false;
    this.eventHandlers = {};
    this.config = __assign(
      {
        strategy: "cache-first",
        ttl: 300,
        maxSize: 50 * 1024 * 1024,
        maxEntries: 10000,
        compression: true,
        encryption: false,
        persistToDisk: true,
        syncOnReconnect: true,
      },
      config,
    );
    this.compressionUtils = new compression_utils_1.CompressionUtils({
      level: "medium",
      algorithm: "gzip",
      threshold: 1024,
      mimeTypes: ["application/json"],
      excludePatterns: [],
    });
    this.securityUtils = new security_utils_1.SecurityUtils({
      encryption: this.config.encryption,
      tokenRefreshThreshold: 300,
      biometricTimeout: 300,
      maxFailedAttempts: 5,
      lockoutDuration: 900,
      certificatePinning: false,
      allowInsecureConnections: false,
    });
    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      evictionCount: 0,
      averageSize: 0,
      compressionRatio: 0,
    };
  }
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  MobileCache.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            // Initialize compression and security utils
            return [
              4 /*yield*/,
              Promise.all([this.compressionUtils.initialize(), this.securityUtils.initialize()]),
              // Load disk cache if persistence is enabled
            ];
          case 1:
            // Initialize compression and security utils
            _a.sent();
            if (!this.config.persistToDisk) return [3 /*break*/, 3];
            return [4 /*yield*/, this.loadDiskCache()];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            // Start cleanup interval
            this.startCleanupInterval();
            this.isInitialized = true;
            console.log("Mobile Cache Manager initialized successfully");
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            console.error("Failed to initialize Mobile Cache Manager:", error_1);
            throw error_1;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // CACHE OPERATIONS
  // ============================================================================
  MobileCache.prototype.get = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var entry, _a, decompressed, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 7, , 8]);
            if (!this.isInitialized) {
              throw new Error("Cache not initialized");
            }
            entry = this.memoryCache.get(key);
            if (!entry && this.config.persistToDisk) {
              // Check disk cache
              entry = this.diskCache.get(key);
              if (entry) {
                // Move to memory cache for faster access
                this.memoryCache.set(key, entry);
              }
            }
            if (!entry) {
              this.updateStats("miss");
              return [2 /*return*/, null];
            }
            if (!this.isExpired(entry)) return [3 /*break*/, 2];
            return [4 /*yield*/, this.delete(key)];
          case 1:
            _b.sent();
            this.updateStats("miss");
            return [2 /*return*/, null];
          case 2:
            // Update access time
            entry.accessedAt = Date.now();
            if (!(entry.encrypted && this.config.encryption)) return [3 /*break*/, 4];
            _a = entry;
            return [4 /*yield*/, this.securityUtils.decrypt(entry.data)];
          case 3:
            _a.data = _b.sent();
            _b.label = 4;
          case 4:
            if (!(entry.compressed && this.config.compression)) return [3 /*break*/, 6];
            return [4 /*yield*/, this.compressionUtils.decompress(entry.data, "gzip")];
          case 5:
            decompressed = _b.sent();
            if (decompressed.success) {
              entry.data = JSON.parse(decompressed.data);
            }
            _b.label = 6;
          case 6:
            this.updateStats("hit");
            this.emitEvent("cacheUpdate", key, entry);
            return [2 /*return*/, entry];
          case 7:
            error_2 = _b.sent();
            console.error("Cache get error:", error_2);
            this.updateStats("miss");
            return [2 /*return*/, null];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  MobileCache.prototype.set = function (key, entry) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheEntry, compressed, _a, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 8, , 9]);
            if (!this.isInitialized) {
              throw new Error("Cache not initialized");
            }
            cacheEntry = __assign({ key: key }, entry);
            if (!(this.config.compression && cacheEntry.size >= 1024)) return [3 /*break*/, 2];
            return [4 /*yield*/, this.compressionUtils.compress(JSON.stringify(cacheEntry.data))];
          case 1:
            compressed = _b.sent();
            if (compressed.success) {
              cacheEntry.data = compressed.data;
              cacheEntry.compressed = true;
              cacheEntry.size = compressed.compressedSize;
            }
            _b.label = 2;
          case 2:
            if (!this.config.encryption) return [3 /*break*/, 4];
            _a = cacheEntry;
            return [4 /*yield*/, this.securityUtils.encrypt(cacheEntry.data)];
          case 3:
            _a.data = _b.sent();
            cacheEntry.encrypted = true;
            _b.label = 4;
          case 4:
            // Check if we need to evict entries
            return [
              4 /*yield*/,
              this.ensureCapacity(cacheEntry.size),
              // Store in memory cache
            ];
          case 5:
            // Check if we need to evict entries
            _b.sent();
            // Store in memory cache
            this.memoryCache.set(key, cacheEntry);
            if (!this.config.persistToDisk) return [3 /*break*/, 7];
            this.diskCache.set(key, cacheEntry);
            return [4 /*yield*/, this.saveDiskCache()];
          case 6:
            _b.sent();
            _b.label = 7;
          case 7:
            this.updateStatsForSet(cacheEntry);
            this.emitEvent("cacheUpdate", key, cacheEntry);
            return [3 /*break*/, 9];
          case 8:
            error_3 = _b.sent();
            console.error("Cache set error:", error_3);
            throw error_3;
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  MobileCache.prototype.delete = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var memoryDeleted, diskDeleted, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            if (!this.isInitialized) {
              return [2 /*return*/, false];
            }
            memoryDeleted = this.memoryCache.delete(key);
            diskDeleted = this.diskCache.delete(key);
            if (!(diskDeleted && this.config.persistToDisk)) return [3 /*break*/, 2];
            return [4 /*yield*/, this.saveDiskCache()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            if (memoryDeleted || diskDeleted) {
              this.updateStatsForDelete();
              return [2 /*return*/, true];
            }
            return [2 /*return*/, false];
          case 3:
            error_4 = _a.sent();
            console.error("Cache delete error:", error_4);
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  MobileCache.prototype.clear = function (pattern) {
    return __awaiter(this, void 0, void 0, function () {
      var regex, keysToDelete, _i, _a, key, _b, keysToDelete_1, key, error_5;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 9, , 10]);
            if (!this.isInitialized) {
              return [2 /*return*/];
            }
            if (!pattern) return [3 /*break*/, 5];
            regex = new RegExp(pattern);
            keysToDelete = [];
            for (_i = 0, _a = this.memoryCache.keys(); _i < _a.length; _i++) {
              key = _a[_i];
              if (regex.test(key)) {
                keysToDelete.push(key);
              }
            }
            (_b = 0), (keysToDelete_1 = keysToDelete);
            _c.label = 1;
          case 1:
            if (!(_b < keysToDelete_1.length)) return [3 /*break*/, 4];
            key = keysToDelete_1[_b];
            return [4 /*yield*/, this.delete(key)];
          case 2:
            _c.sent();
            _c.label = 3;
          case 3:
            _b++;
            return [3 /*break*/, 1];
          case 4:
            return [3 /*break*/, 8];
          case 5:
            // Clear all entries
            this.memoryCache.clear();
            this.diskCache.clear();
            if (!this.config.persistToDisk) return [3 /*break*/, 7];
            return [4 /*yield*/, this.saveDiskCache()];
          case 6:
            _c.sent();
            _c.label = 7;
          case 7:
            this.resetStats();
            _c.label = 8;
          case 8:
            return [3 /*break*/, 10];
          case 9:
            error_5 = _c.sent();
            console.error("Cache clear error:", error_5);
            throw error_5;
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // CACHE STRATEGIES
  // ============================================================================
  MobileCache.prototype.getWithStrategy = function (key, strategy, networkFetcher) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (strategy) {
          case "cache-first":
            return [2 /*return*/, this.cacheFirstStrategy(key, networkFetcher)];
          case "network-first":
            return [2 /*return*/, this.networkFirstStrategy(key, networkFetcher)];
          case "cache-only":
            return [2 /*return*/, this.cacheOnlyStrategy(key)];
          case "network-only":
            return [2 /*return*/, this.networkOnlyStrategy(networkFetcher)];
          default:
            return [2 /*return*/, this.cacheFirstStrategy(key, networkFetcher)];
        }
        return [2 /*return*/];
      });
    });
  };
  MobileCache.prototype.cacheFirstStrategy = function (key, networkFetcher) {
    return __awaiter(this, void 0, void 0, function () {
      var cached, networkData;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.get(key)];
          case 1:
            cached = _a.sent();
            if (cached) {
              return [2 /*return*/, { data: cached.data, source: "cache" }];
            }
            return [
              4 /*yield*/,
              networkFetcher(),
              // Cache the result
            ];
          case 2:
            networkData = _a.sent();
            // Cache the result
            return [
              4 /*yield*/,
              this.set(key, {
                data: networkData,
                metadata: {
                  version: "1.0",
                  source: "network",
                  priority: "normal",
                  tags: [],
                },
                createdAt: Date.now(),
                updatedAt: Date.now(),
                accessedAt: Date.now(),
                expiresAt: Date.now() + this.config.ttl * 1000,
                size: JSON.stringify(networkData).length,
                compressed: false,
                encrypted: false,
              }),
            ];
          case 3:
            // Cache the result
            _a.sent();
            return [2 /*return*/, { data: networkData, source: "network" }];
        }
      });
    });
  };
  MobileCache.prototype.networkFirstStrategy = function (key, networkFetcher) {
    return __awaiter(this, void 0, void 0, function () {
      var networkData, error_6, cached;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 5]);
            return [
              4 /*yield*/,
              networkFetcher(),
              // Cache the result
            ];
          case 1:
            networkData = _a.sent();
            // Cache the result
            return [
              4 /*yield*/,
              this.set(key, {
                data: networkData,
                metadata: {
                  version: "1.0",
                  source: "network",
                  priority: "normal",
                  tags: [],
                },
                createdAt: Date.now(),
                updatedAt: Date.now(),
                accessedAt: Date.now(),
                expiresAt: Date.now() + this.config.ttl * 1000,
                size: JSON.stringify(networkData).length,
                compressed: false,
                encrypted: false,
              }),
            ];
          case 2:
            // Cache the result
            _a.sent();
            return [2 /*return*/, { data: networkData, source: "network" }];
          case 3:
            error_6 = _a.sent();
            return [4 /*yield*/, this.get(key)];
          case 4:
            cached = _a.sent();
            if (cached) {
              return [2 /*return*/, { data: cached.data, source: "cache" }];
            }
            throw error_6;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  MobileCache.prototype.cacheOnlyStrategy = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var cached;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.get(key)];
          case 1:
            cached = _a.sent();
            if (!cached) {
              throw new Error("No cached data available");
            }
            return [2 /*return*/, { data: cached.data, source: "cache" }];
        }
      });
    });
  };
  MobileCache.prototype.networkOnlyStrategy = function (networkFetcher) {
    return __awaiter(this, void 0, void 0, function () {
      var networkData;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, networkFetcher()];
          case 1:
            networkData = _a.sent();
            return [2 /*return*/, { data: networkData, source: "network" }];
        }
      });
    });
  };
  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================
  MobileCache.prototype.cleanup = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now, expiredKeys, _i, _a, _b, key, entry, _c, expiredKeys_1, key, error_7;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 6, , 7]);
            if (!this.isInitialized) {
              return [2 /*return*/];
            }
            now = Date.now();
            expiredKeys = [];
            // Find expired entries
            for (_i = 0, _a = this.memoryCache.entries(); _i < _a.length; _i++) {
              (_b = _a[_i]), (key = _b[0]), (entry = _b[1]);
              if (this.isExpired(entry)) {
                expiredKeys.push(key);
              }
            }
            (_c = 0), (expiredKeys_1 = expiredKeys);
            _d.label = 1;
          case 1:
            if (!(_c < expiredKeys_1.length)) return [3 /*break*/, 4];
            key = expiredKeys_1[_c];
            return [4 /*yield*/, this.delete(key)];
          case 2:
            _d.sent();
            _d.label = 3;
          case 3:
            _c++;
            return [3 /*break*/, 1];
          case 4:
            // Check if we need to evict more entries due to size limits
            return [4 /*yield*/, this.enforceCapacityLimits()];
          case 5:
            // Check if we need to evict more entries due to size limits
            _d.sent();
            console.log(
              "Cache cleanup completed. Removed ".concat(expiredKeys.length, " expired entries."),
            );
            return [3 /*break*/, 7];
          case 6:
            error_7 = _d.sent();
            console.error("Cache cleanup error:", error_7);
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  MobileCache.prototype.ensureCapacity = function (newEntrySize) {
    return __awaiter(this, void 0, void 0, function () {
      var currentSize, currentEntries;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            currentSize = this.getCurrentSize();
            currentEntries = this.memoryCache.size;
            if (!(currentSize + newEntrySize > this.config.maxSize)) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.evictBySize(currentSize + newEntrySize - this.config.maxSize),
            ];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            if (!(currentEntries >= this.config.maxEntries)) return [3 /*break*/, 4];
            return [4 /*yield*/, this.evictByCount(currentEntries - this.config.maxEntries + 1)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  MobileCache.prototype.enforceCapacityLimits = function () {
    return __awaiter(this, void 0, void 0, function () {
      var currentSize, currentEntries;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            currentSize = this.getCurrentSize();
            currentEntries = this.memoryCache.size;
            if (!(currentSize > this.config.maxSize)) return [3 /*break*/, 2];
            return [4 /*yield*/, this.evictBySize(currentSize - this.config.maxSize)];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            if (!(currentEntries > this.config.maxEntries)) return [3 /*break*/, 4];
            return [4 /*yield*/, this.evictByCount(currentEntries - this.config.maxEntries)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  MobileCache.prototype.evictBySize = function (bytesToEvict) {
    return __awaiter(this, void 0, void 0, function () {
      var entries, evictedBytes, keysToEvict, _i, entries_1, _a, key, entry, _b, keysToEvict_1, key;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            entries = Array.from(this.memoryCache.entries());
            // Sort by access time (LRU)
            entries.sort((_a, _b) => {
              var a = _a[1];
              var b = _b[1];
              return a.accessedAt - b.accessedAt;
            });
            evictedBytes = 0;
            keysToEvict = [];
            for (_i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
              (_a = entries_1[_i]), (key = _a[0]), (entry = _a[1]);
              keysToEvict.push(key);
              evictedBytes += entry.size;
              if (evictedBytes >= bytesToEvict) {
                break;
              }
            }
            (_b = 0), (keysToEvict_1 = keysToEvict);
            _c.label = 1;
          case 1:
            if (!(_b < keysToEvict_1.length)) return [3 /*break*/, 4];
            key = keysToEvict_1[_b];
            return [4 /*yield*/, this.delete(key)];
          case 2:
            _c.sent();
            this.stats.evictionCount++;
            _c.label = 3;
          case 3:
            _b++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  MobileCache.prototype.evictByCount = function (entriesToEvict) {
    return __awaiter(this, void 0, void 0, function () {
      var entries, keysToEvict, _i, keysToEvict_2, key;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            entries = Array.from(this.memoryCache.entries());
            // Sort by access time (LRU)
            entries.sort((_a, _b) => {
              var a = _a[1];
              var b = _b[1];
              return a.accessedAt - b.accessedAt;
            });
            keysToEvict = entries.slice(0, entriesToEvict).map((_a) => {
              var key = _a[0];
              return key;
            });
            (_i = 0), (keysToEvict_2 = keysToEvict);
            _a.label = 1;
          case 1:
            if (!(_i < keysToEvict_2.length)) return [3 /*break*/, 4];
            key = keysToEvict_2[_i];
            return [4 /*yield*/, this.delete(key)];
          case 2:
            _a.sent();
            this.stats.evictionCount++;
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // PERSISTENCE
  // ============================================================================
  MobileCache.prototype.loadDiskCache = function () {
    return __awaiter(this, void 0, void 0, function () {
      var cacheData, parsed, _i, _a, _b, key, entry;
      return __generator(this, function (_c) {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            cacheData = localStorage.getItem("mobile-api-cache");
            if (cacheData) {
              parsed = JSON.parse(cacheData);
              this.diskCache = new Map(parsed.entries || []);
              // Load valid entries into memory cache
              for (_i = 0, _a = this.diskCache.entries(); _i < _a.length; _i++) {
                (_b = _a[_i]), (key = _b[0]), (entry = _b[1]);
                if (!this.isExpired(entry)) {
                  this.memoryCache.set(key, entry);
                }
              }
            }
          }
        } catch (error) {
          console.error("Failed to load disk cache:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  MobileCache.prototype.saveDiskCache = function () {
    return __awaiter(this, void 0, void 0, function () {
      var cacheData;
      return __generator(this, function (_a) {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            cacheData = {
              entries: Array.from(this.diskCache.entries()),
              timestamp: Date.now(),
            };
            localStorage.setItem("mobile-api-cache", JSON.stringify(cacheData));
          }
        } catch (error) {
          console.error("Failed to save disk cache:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  // ============================================================================
  // STATISTICS
  // ============================================================================
  MobileCache.prototype.getStats = function () {
    return __awaiter(this, void 0, void 0, function () {
      var currentSize, totalEntries;
      return __generator(this, function (_a) {
        currentSize = this.getCurrentSize();
        totalEntries = this.memoryCache.size;
        return [
          2 /*return*/,
          __assign(__assign({}, this.stats), {
            totalEntries: totalEntries,
            totalSize: currentSize,
            averageSize: totalEntries > 0 ? currentSize / totalEntries : 0,
            oldestEntry: this.getOldestEntry(),
            newestEntry: this.getNewestEntry(),
          }),
        ];
      });
    });
  };
  MobileCache.prototype.updateStats = function (type) {
    var totalRequests = this.stats.hitRate + this.stats.missRate + 1;
    if (type === "hit") {
      this.stats.hitRate = (this.stats.hitRate * (totalRequests - 1) + 1) / totalRequests;
      this.stats.missRate = 1 - this.stats.hitRate;
    } else {
      this.stats.missRate = (this.stats.missRate * (totalRequests - 1) + 1) / totalRequests;
      this.stats.hitRate = 1 - this.stats.missRate;
    }
  };
  MobileCache.prototype.updateStatsForSet = function (entry) {
    this.stats.totalEntries = this.memoryCache.size;
    this.stats.totalSize = this.getCurrentSize();
    this.stats.averageSize =
      this.stats.totalEntries > 0 ? this.stats.totalSize / this.stats.totalEntries : 0;
    if (entry.compressed) {
      // Update compression ratio
      var originalSize = JSON.stringify(entry.data).length;
      var compressionRatio = entry.size / originalSize;
      this.stats.compressionRatio = (this.stats.compressionRatio + compressionRatio) / 2;
    }
  };
  MobileCache.prototype.updateStatsForDelete = function () {
    this.stats.totalEntries = this.memoryCache.size;
    this.stats.totalSize = this.getCurrentSize();
    this.stats.averageSize =
      this.stats.totalEntries > 0 ? this.stats.totalSize / this.stats.totalEntries : 0;
  };
  MobileCache.prototype.resetStats = function () {
    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      evictionCount: 0,
      averageSize: 0,
      compressionRatio: 0,
    };
  };
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  MobileCache.prototype.isExpired = (entry) => Date.now() > entry.expiresAt;
  MobileCache.prototype.getCurrentSize = function () {
    var totalSize = 0;
    for (var _i = 0, _a = this.memoryCache.values(); _i < _a.length; _i++) {
      var entry = _a[_i];
      totalSize += entry.size;
    }
    return totalSize;
  };
  MobileCache.prototype.getOldestEntry = function () {
    var oldest;
    for (var _i = 0, _a = this.memoryCache.values(); _i < _a.length; _i++) {
      var entry = _a[_i];
      var entryDate = new Date(entry.createdAt);
      if (!oldest || entryDate < oldest) {
        oldest = entryDate;
      }
    }
    return oldest;
  };
  MobileCache.prototype.getNewestEntry = function () {
    var newest;
    for (var _i = 0, _a = this.memoryCache.values(); _i < _a.length; _i++) {
      var entry = _a[_i];
      var entryDate = new Date(entry.createdAt);
      if (!newest || entryDate > newest) {
        newest = entryDate;
      }
    }
    return newest;
  };
  MobileCache.prototype.startCleanupInterval = function () {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup().catch(console.error);
      },
      5 * 60 * 1000,
    );
  };
  MobileCache.prototype.stopCleanupInterval = function () {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  };
  // ============================================================================
  // EVENT MANAGEMENT
  // ============================================================================
  MobileCache.prototype.on = function (event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  };
  MobileCache.prototype.off = function (event, handler) {
    if (!this.eventHandlers[event]) {
      return;
    }
    if (handler) {
      var index = this.eventHandlers[event].indexOf(handler);
      if (index > -1) {
        this.eventHandlers[event].splice(index, 1);
      }
    } else {
      this.eventHandlers[event] = [];
    }
  };
  MobileCache.prototype.emitEvent = function (event) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      args[_i - 1] = arguments[_i];
    }
    var handlers = this.eventHandlers[event];
    if (handlers) {
      for (var _a = 0, handlers_1 = handlers; _a < handlers_1.length; _a++) {
        var handler = handlers_1[_a];
        try {
          handler.apply(void 0, args);
        } catch (error) {
          console.error("Error in cache event handler ".concat(event, ":"), error);
        }
      }
    }
  };
  // ============================================================================
  // CLEANUP
  // ============================================================================
  MobileCache.prototype.destroy = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            this.stopCleanupInterval();
            if (!this.config.persistToDisk) return [3 /*break*/, 2];
            return [4 /*yield*/, this.saveDiskCache()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            // Clear all caches
            this.memoryCache.clear();
            this.diskCache.clear();
            // Clear event handlers
            this.eventHandlers = {};
            // Cleanup subsystems
            return [
              4 /*yield*/,
              Promise.all([this.compressionUtils.destroy(), this.securityUtils.destroy()]),
            ];
          case 3:
            // Cleanup subsystems
            _a.sent();
            this.isInitialized = false;
            console.log("Mobile Cache Manager destroyed successfully");
            return [3 /*break*/, 5];
          case 4:
            error_8 = _a.sent();
            console.error("Error destroying Mobile Cache Manager:", error_8);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  Object.defineProperty(MobileCache.prototype, "size", {
    // ============================================================================
    // PUBLIC GETTERS
    // ============================================================================
    get: function () {
      return this.memoryCache.size;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(MobileCache.prototype, "totalSize", {
    get: function () {
      return this.getCurrentSize();
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(MobileCache.prototype, "isReady", {
    get: function () {
      return this.isInitialized;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(MobileCache.prototype, "configuration", {
    get: function () {
      return __assign({}, this.config);
    },
    enumerable: false,
    configurable: true,
  });
  return MobileCache;
})();
exports.MobileCache = MobileCache;
