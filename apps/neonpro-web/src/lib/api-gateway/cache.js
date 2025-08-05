"use strict";
/**
 * NeonPro - API Gateway Cache System
 * High-performance caching system for API responses and data
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheMiddleware = exports.ApiGatewayCacheFactory = exports.SupabaseApiGatewayCache = exports.RedisApiGatewayCache = exports.MemoryApiGatewayCache = void 0;
/**
 * Memory Cache Implementation
 * In-memory cache with LRU eviction policy
 */
var MemoryApiGatewayCache = /** @class */ (function () {
    function MemoryApiGatewayCache(maxSize, defaultTtl, // 5 minutes
    logger) {
        if (maxSize === void 0) { maxSize = 1000; }
        if (defaultTtl === void 0) { defaultTtl = 300000; }
        var _this = this;
        this.cache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0
        };
        this.maxSize = maxSize;
        this.defaultTtl = defaultTtl;
        this.logger = logger;
        // Cleanup expired entries every minute
        setInterval(function () { return _this.cleanup(); }, 60000);
    }
    /**
     * Get value from cache
     */
    MemoryApiGatewayCache.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                entry = this.cache.get(key);
                if (!entry) {
                    this.stats.misses++;
                    return [2 /*return*/, null];
                }
                // Check if expired
                if (Date.now() > entry.expiry) {
                    this.cache.delete(key);
                    this.stats.misses++;
                    return [2 /*return*/, null];
                }
                // Update access time for LRU
                entry.accessTime = Date.now();
                this.cache.set(key, entry);
                this.stats.hits++;
                return [2 /*return*/, entry.value];
            });
        });
    };
    /**
     * Set value in cache
     */
    MemoryApiGatewayCache.prototype.set = function (key, value, ttl) {
        return __awaiter(this, void 0, void 0, function () {
            var expiry, accessTime;
            var _a;
            return __generator(this, function (_b) {
                expiry = Date.now() + (ttl || this.defaultTtl);
                accessTime = Date.now();
                // Check if we need to evict entries
                if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
                    this.evictLRU();
                }
                this.cache.set(key, { value: value, expiry: expiry, accessTime: accessTime });
                this.stats.sets++;
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Cache set', { key: key, ttl: ttl || this.defaultTtl });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Delete value from cache
     */
    MemoryApiGatewayCache.prototype.delete = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var deleted;
            var _a;
            return __generator(this, function (_b) {
                deleted = this.cache.delete(key);
                if (deleted) {
                    this.stats.deletes++;
                    (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Cache delete', { key: key });
                }
                return [2 /*return*/, deleted];
            });
        });
    };
    /**
     * Clear all cache entries
     */
    MemoryApiGatewayCache.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            var size;
            var _a;
            return __generator(this, function (_b) {
                size = this.cache.size;
                this.cache.clear();
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info('Cache cleared', { entriesRemoved: size });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Check if key exists in cache
     */
    MemoryApiGatewayCache.prototype.has = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                entry = this.cache.get(key);
                if (!entry) {
                    return [2 /*return*/, false];
                }
                // Check if expired
                if (Date.now() > entry.expiry) {
                    this.cache.delete(key);
                    return [2 /*return*/, false];
                }
                return [2 /*return*/, true];
            });
        });
    };
    /**
     * Get cache statistics
     */
    MemoryApiGatewayCache.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var totalRequests, hitRate;
            return __generator(this, function (_a) {
                totalRequests = this.stats.hits + this.stats.misses;
                hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
                return [2 /*return*/, __assign(__assign({}, this.stats), { size: this.cache.size, hitRate: hitRate })];
            });
        });
    };
    /**
     * Evict least recently used entry
     */
    MemoryApiGatewayCache.prototype.evictLRU = function () {
        var _a;
        var oldestKey = null;
        var oldestTime = Date.now();
        for (var _i = 0, _b = this.cache.entries(); _i < _b.length; _i++) {
            var _c = _b[_i], key = _c[0], entry = _c[1];
            if (entry.accessTime < oldestTime) {
                oldestTime = entry.accessTime;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.stats.evictions++;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Cache LRU eviction', { key: oldestKey });
        }
    };
    /**
     * Cleanup expired entries
     */
    MemoryApiGatewayCache.prototype.cleanup = function () {
        var _a;
        var now = Date.now();
        var cleaned = 0;
        for (var _i = 0, _b = this.cache.entries(); _i < _b.length; _i++) {
            var _c = _b[_i], key = _c[0], entry = _c[1];
            if (now > entry.expiry) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Cache cleanup', { entriesRemoved: cleaned });
        }
    };
    return MemoryApiGatewayCache;
}());
exports.MemoryApiGatewayCache = MemoryApiGatewayCache;
/**
 * Redis Cache Implementation
 * Distributed cache using Redis
 */
var RedisApiGatewayCache = /** @class */ (function () {
    function RedisApiGatewayCache(redisClient, defaultTtl, // 5 minutes in seconds
    keyPrefix, logger) {
        if (defaultTtl === void 0) { defaultTtl = 300; }
        if (keyPrefix === void 0) { keyPrefix = 'neonpro:api:'; }
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            errors: 0
        };
        this.redis = redisClient;
        this.defaultTtl = defaultTtl;
        this.keyPrefix = keyPrefix;
        this.logger = logger;
    }
    /**
     * Get value from Redis cache
     */
    RedisApiGatewayCache.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var fullKey, value, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        fullKey = this.keyPrefix + key;
                        return [4 /*yield*/, this.redis.get(fullKey)];
                    case 1:
                        value = _b.sent();
                        if (value === null) {
                            this.stats.misses++;
                            return [2 /*return*/, null];
                        }
                        this.stats.hits++;
                        return [2 /*return*/, JSON.parse(value)];
                    case 2:
                        error_1 = _b.sent();
                        this.stats.errors++;
                        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error('Redis cache get error', error_1, { key: key });
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Set value in Redis cache
     */
    RedisApiGatewayCache.prototype.set = function (key, value, ttl) {
        return __awaiter(this, void 0, void 0, function () {
            var fullKey, serialized, expiry, error_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        fullKey = this.keyPrefix + key;
                        serialized = JSON.stringify(value);
                        expiry = ttl || this.defaultTtl;
                        return [4 /*yield*/, this.redis.setex(fullKey, expiry, serialized)];
                    case 1:
                        _c.sent();
                        this.stats.sets++;
                        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Redis cache set', { key: key, ttl: expiry });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _c.sent();
                        this.stats.errors++;
                        (_b = this.logger) === null || _b === void 0 ? void 0 : _b.error('Redis cache set error', error_2, { key: key });
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete value from Redis cache
     */
    RedisApiGatewayCache.prototype.delete = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var fullKey, result, deleted, error_3;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        fullKey = this.keyPrefix + key;
                        return [4 /*yield*/, this.redis.del(fullKey)];
                    case 1:
                        result = _c.sent();
                        deleted = result > 0;
                        if (deleted) {
                            this.stats.deletes++;
                            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Redis cache delete', { key: key });
                        }
                        return [2 /*return*/, deleted];
                    case 2:
                        error_3 = _c.sent();
                        this.stats.errors++;
                        (_b = this.logger) === null || _b === void 0 ? void 0 : _b.error('Redis cache delete error', error_3, { key: key });
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear all cache entries with prefix
     */
    RedisApiGatewayCache.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            var keys, error_4;
            var _a;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.redis.keys(this.keyPrefix + '*')];
                    case 1:
                        keys = _d.sent();
                        if (!(keys.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, (_a = this.redis).del.apply(_a, keys)];
                    case 2:
                        _d.sent();
                        (_b = this.logger) === null || _b === void 0 ? void 0 : _b.info('Redis cache cleared', { entriesRemoved: keys.length });
                        _d.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_4 = _d.sent();
                        this.stats.errors++;
                        (_c = this.logger) === null || _c === void 0 ? void 0 : _c.error('Redis cache clear error', error_4);
                        throw error_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if key exists in Redis cache
     */
    RedisApiGatewayCache.prototype.has = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var fullKey, exists, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        fullKey = this.keyPrefix + key;
                        return [4 /*yield*/, this.redis.exists(fullKey)];
                    case 1:
                        exists = _b.sent();
                        return [2 /*return*/, exists === 1];
                    case 2:
                        error_5 = _b.sent();
                        this.stats.errors++;
                        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error('Redis cache exists error', error_5, { key: key });
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get cache statistics
     */
    RedisApiGatewayCache.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var totalRequests, hitRate, redisInfo, error_6;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        totalRequests = this.stats.hits + this.stats.misses;
                        hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.redis.info('memory')];
                    case 2:
                        redisInfo = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _b.sent();
                        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error('Redis info error', error_6);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, __assign(__assign({}, this.stats), { hitRate: hitRate, redisInfo: redisInfo })];
                }
            });
        });
    };
    return RedisApiGatewayCache;
}());
exports.RedisApiGatewayCache = RedisApiGatewayCache;
/**
 * Supabase Cache Implementation
 * Database-backed cache with memory layer
 */
var SupabaseApiGatewayCache = /** @class */ (function () {
    function SupabaseApiGatewayCache(supabaseClient, tableName, memoryMaxSize, logger) {
        if (tableName === void 0) { tableName = 'api_cache'; }
        if (memoryMaxSize === void 0) { memoryMaxSize = 500; }
        var _this = this;
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            errors: 0,
            memoryHits: 0,
            dbHits: 0
        };
        this.supabase = supabaseClient;
        this.tableName = tableName;
        this.memoryCache = new MemoryApiGatewayCache(memoryMaxSize, 300000, logger);
        this.logger = logger;
        // Cleanup expired entries every 5 minutes
        setInterval(function () { return _this.cleanupExpired(); }, 300000);
    }
    /**
     * Get value from cache (memory first, then database)
     */
    SupabaseApiGatewayCache.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var memoryValue, _a, data, error, value, ttl, error_7;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.memoryCache.get(key)];
                    case 1:
                        memoryValue = _c.sent();
                        if (memoryValue !== null) {
                            this.stats.hits++;
                            this.stats.memoryHits++;
                            return [2 /*return*/, memoryValue];
                        }
                        return [4 /*yield*/, this.supabase
                                .from(this.tableName)
                                .select('value, expires_at')
                                .eq('key', key)
                                .single()];
                    case 2:
                        _a = _c.sent(), data = _a.data, error = _a.error;
                        if (error || !data) {
                            this.stats.misses++;
                            return [2 /*return*/, null];
                        }
                        if (!(new Date(data.expires_at) < new Date())) return [3 /*break*/, 4];
                        // Delete expired entry
                        return [4 /*yield*/, this.delete(key)];
                    case 3:
                        // Delete expired entry
                        _c.sent();
                        this.stats.misses++;
                        return [2 /*return*/, null];
                    case 4:
                        value = JSON.parse(data.value);
                        ttl = new Date(data.expires_at).getTime() - Date.now();
                        if (!(ttl > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.memoryCache.set(key, value, ttl)];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        this.stats.hits++;
                        this.stats.dbHits++;
                        return [2 /*return*/, value];
                    case 7:
                        error_7 = _c.sent();
                        this.stats.errors++;
                        (_b = this.logger) === null || _b === void 0 ? void 0 : _b.error('Supabase cache get error', error_7, { key: key });
                        return [2 /*return*/, null];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Set value in cache (both memory and database)
     */
    SupabaseApiGatewayCache.prototype.set = function (key_1, value_1) {
        return __awaiter(this, arguments, void 0, function (key, value, ttl) {
            var expiresAt, serializedValue, error, error_8;
            var _a, _b;
            if (ttl === void 0) { ttl = 300000; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        expiresAt = new Date(Date.now() + ttl);
                        serializedValue = JSON.stringify(value);
                        // Store in memory cache
                        return [4 /*yield*/, this.memoryCache.set(key, value, ttl)];
                    case 1:
                        // Store in memory cache
                        _c.sent();
                        return [4 /*yield*/, this.supabase
                                .from(this.tableName)
                                .upsert({
                                key: key,
                                value: serializedValue,
                                expires_at: expiresAt.toISOString(),
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            })];
                    case 2:
                        error = (_c.sent()).error;
                        if (error) {
                            throw error;
                        }
                        this.stats.sets++;
                        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Supabase cache set', { key: key, ttl: ttl });
                        return [3 /*break*/, 4];
                    case 3:
                        error_8 = _c.sent();
                        this.stats.errors++;
                        (_b = this.logger) === null || _b === void 0 ? void 0 : _b.error('Supabase cache set error', error_8, { key: key });
                        throw error_8;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete value from cache (both memory and database)
     */
    SupabaseApiGatewayCache.prototype.delete = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_9;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        // Delete from memory cache
                        return [4 /*yield*/, this.memoryCache.delete(key)];
                    case 1:
                        // Delete from memory cache
                        _c.sent();
                        return [4 /*yield*/, this.supabase
                                .from(this.tableName)
                                .delete()
                                .eq('key', key)];
                    case 2:
                        error = (_c.sent()).error;
                        if (error) {
                            throw error;
                        }
                        this.stats.deletes++;
                        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Supabase cache delete', { key: key });
                        return [2 /*return*/, true];
                    case 3:
                        error_9 = _c.sent();
                        this.stats.errors++;
                        (_b = this.logger) === null || _b === void 0 ? void 0 : _b.error('Supabase cache delete error', error_9, { key: key });
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear all cache entries
     */
    SupabaseApiGatewayCache.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_10;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        // Clear memory cache
                        return [4 /*yield*/, this.memoryCache.clear()];
                    case 1:
                        // Clear memory cache
                        _c.sent();
                        return [4 /*yield*/, this.supabase
                                .from(this.tableName)
                                .delete()
                                .neq('key', '')];
                    case 2:
                        error = (_c.sent()).error;
                        if (error) {
                            throw error;
                        }
                        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info('Supabase cache cleared');
                        return [3 /*break*/, 4];
                    case 3:
                        error_10 = _c.sent();
                        this.stats.errors++;
                        (_b = this.logger) === null || _b === void 0 ? void 0 : _b.error('Supabase cache clear error', error_10);
                        throw error_10;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if key exists in cache
     */
    SupabaseApiGatewayCache.prototype.has = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var memoryHas, _a, data, error, error_11;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.memoryCache.has(key)];
                    case 1:
                        memoryHas = _c.sent();
                        if (memoryHas) {
                            return [2 /*return*/, true];
                        }
                        return [4 /*yield*/, this.supabase
                                .from(this.tableName)
                                .select('expires_at')
                                .eq('key', key)
                                .single()];
                    case 2:
                        _a = _c.sent(), data = _a.data, error = _a.error;
                        if (error || !data) {
                            return [2 /*return*/, false];
                        }
                        // Check if expired
                        return [2 /*return*/, new Date(data.expires_at) >= new Date()];
                    case 3:
                        error_11 = _c.sent();
                        this.stats.errors++;
                        (_b = this.logger) === null || _b === void 0 ? void 0 : _b.error('Supabase cache exists error', error_11, { key: key });
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get cache statistics
     */
    SupabaseApiGatewayCache.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var totalRequests, hitRate, memoryStats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        totalRequests = this.stats.hits + this.stats.misses;
                        hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
                        return [4 /*yield*/, this.memoryCache.getStats()];
                    case 1:
                        memoryStats = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, this.stats), { hitRate: hitRate, memoryStats: memoryStats })];
                }
            });
        });
    };
    /**
     * Cleanup expired entries from database
     */
    SupabaseApiGatewayCache.prototype.cleanupExpired = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_12;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from(this.tableName)
                                .delete()
                                .lt('expires_at', new Date().toISOString())];
                    case 1:
                        error = (_c.sent()).error;
                        if (error) {
                            throw error;
                        }
                        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Supabase cache cleanup completed');
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _c.sent();
                        (_b = this.logger) === null || _b === void 0 ? void 0 : _b.error('Supabase cache cleanup error', error_12);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return SupabaseApiGatewayCache;
}());
exports.SupabaseApiGatewayCache = SupabaseApiGatewayCache;
/**
 * Cache Factory
 * Factory for creating cache instances
 */
var ApiGatewayCacheFactory = /** @class */ (function () {
    function ApiGatewayCacheFactory() {
    }
    /**
     * Create memory cache
     */
    ApiGatewayCacheFactory.createMemoryCache = function (maxSize, defaultTtl, logger) {
        if (maxSize === void 0) { maxSize = 1000; }
        if (defaultTtl === void 0) { defaultTtl = 300000; }
        return new MemoryApiGatewayCache(maxSize, defaultTtl, logger);
    };
    /**
     * Create Redis cache
     */
    ApiGatewayCacheFactory.createRedisCache = function (redisClient, defaultTtl, keyPrefix, logger) {
        if (defaultTtl === void 0) { defaultTtl = 300; }
        if (keyPrefix === void 0) { keyPrefix = 'neonpro:api:'; }
        return new RedisApiGatewayCache(redisClient, defaultTtl, keyPrefix, logger);
    };
    /**
     * Create Supabase cache
     */
    ApiGatewayCacheFactory.createSupabaseCache = function (supabaseClient, tableName, memoryMaxSize, logger) {
        if (tableName === void 0) { tableName = 'api_cache'; }
        if (memoryMaxSize === void 0) { memoryMaxSize = 500; }
        return new SupabaseApiGatewayCache(supabaseClient, tableName, memoryMaxSize, logger);
    };
    /**
     * Create cache based on configuration
     */
    ApiGatewayCacheFactory.createCache = function (type, config, logger) {
        switch (type) {
            case 'memory':
                return ApiGatewayCacheFactory.createMemoryCache(config.maxSize, config.defaultTtl, logger);
            case 'redis':
                return ApiGatewayCacheFactory.createRedisCache(config.client, config.defaultTtl, config.keyPrefix, logger);
            case 'supabase':
                return ApiGatewayCacheFactory.createSupabaseCache(config.client, config.tableName, config.memoryMaxSize, logger);
            default:
                throw new Error("Unsupported cache type: ".concat(type));
        }
    };
    return ApiGatewayCacheFactory;
}());
exports.ApiGatewayCacheFactory = ApiGatewayCacheFactory;
/**
 * Cache Middleware
 * Middleware for caching API responses
 */
var CacheMiddleware = /** @class */ (function () {
    function CacheMiddleware() {
    }
    CacheMiddleware.create = function (config) {
        var _this = this;
        return {
            name: 'cache',
            order: 10,
            enabled: true,
            config: config,
            handler: function (context, next) { return __awaiter(_this, void 0, void 0, function () {
                var method, cacheKey, cachedResponse;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            method = context.method.toUpperCase();
                            if (!!config.cacheableMethods.includes(method)) return [3 /*break*/, 2];
                            return [4 /*yield*/, next()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                        case 2:
                            cacheKey = config.keyGenerator
                                ? config.keyGenerator(context)
                                : CacheMiddleware.generateDefaultKey(context);
                            return [4 /*yield*/, config.cache.get(cacheKey)];
                        case 3:
                            cachedResponse = _a.sent();
                            if (cachedResponse) {
                                context.response = cachedResponse;
                                context.headers['X-Cache'] = 'HIT';
                                return [2 /*return*/];
                            }
                            // Execute request
                            return [4 /*yield*/, next()];
                        case 4:
                            // Execute request
                            _a.sent();
                            if (!CacheMiddleware.shouldCacheResponse(context, config)) return [3 /*break*/, 6];
                            return [4 /*yield*/, config.cache.set(cacheKey, context.response, config.defaultTtl)];
                        case 5:
                            _a.sent();
                            context.headers['X-Cache'] = 'MISS';
                            return [3 /*break*/, 7];
                        case 6:
                            context.headers['X-Cache'] = 'SKIP';
                            _a.label = 7;
                        case 7: return [2 /*return*/];
                    }
                });
            }); }
        };
    };
    /**
     * Generate default cache key
     */
    CacheMiddleware.generateDefaultKey = function (context) {
        var parts = [
            context.method,
            context.path,
            context.clientId || 'anonymous'
        ];
        // Include query parameters in key
        if (context.query && Object.keys(context.query).length > 0) {
            var sortedQuery = Object.keys(context.query)
                .sort()
                .map(function (key) { return "".concat(key, "=").concat(context.query[key]); })
                .join('&');
            parts.push(sortedQuery);
        }
        return parts.join(':');
    };
    /**
     * Check if response should be cached
     */
    CacheMiddleware.shouldCacheResponse = function (context, config) {
        // Custom cache condition
        if (config.shouldCache && !config.shouldCache(context)) {
            return false;
        }
        // Check status code
        var statusCode = context.headers['status-code'] || 200;
        if (!config.cacheableStatusCodes.includes(statusCode)) {
            return false;
        }
        // Don't cache if response has cache-control: no-cache
        var cacheControl = context.headers['cache-control'];
        if (cacheControl && cacheControl.includes('no-cache')) {
            return false;
        }
        return true;
    };
    return CacheMiddleware;
}());
exports.CacheMiddleware = CacheMiddleware;
