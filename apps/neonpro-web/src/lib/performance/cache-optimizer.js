"use strict";
/**
 * Cache Optimizer - VIBECODE V1.0 Caching Strategy
 * Advanced caching optimization for subscription data
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheOptimizer = void 0;
var CacheOptimizer = /** @class */ (function () {
    function CacheOptimizer(strategy) {
        this.cache = new Map();
        this.accessTimes = new Map();
        this.accessCounts = new Map();
        this.metrics = {
            hits: 0,
            misses: 0,
            evictions: 0,
            memoryUsage: 0,
            averageAccessTime: 0
        };
        this.strategy = strategy;
    } /**
     * Get value from cache
     */
    CacheOptimizer.prototype.get = function (key) {
        var startTime = performance.now();
        if (this.cache.has(key)) {
            this.metrics.hits++;
            this.updateAccessMetrics(key, startTime);
            return this.cache.get(key);
        }
        this.metrics.misses++;
        return null;
    };
    /**
     * Set value in cache
     */
    CacheOptimizer.prototype.set = function (key, value, ttl) {
        var _this = this;
        // Check if cache is full
        if (this.cache.size >= this.strategy.maxSize && !this.cache.has(key)) {
            this.evictEntry();
        }
        // Compress value if enabled
        var finalValue = this.strategy.compressionEnabled
            ? this.compress(value)
            : value;
        this.cache.set(key, finalValue);
        this.accessTimes.set(key, Date.now());
        this.accessCounts.set(key, 1);
        // Set TTL if specified
        if (ttl || this.strategy.ttl) {
            setTimeout(function () {
                _this.delete(key);
            }, ttl || this.strategy.ttl);
        }
        this.updateMemoryUsage();
    }; /**
     * Delete entry from cache
     */
    CacheOptimizer.prototype.delete = function (key) {
        var deleted = this.cache.delete(key);
        if (deleted) {
            this.accessTimes.delete(key);
            this.accessCounts.delete(key);
            this.updateMemoryUsage();
        }
        return deleted;
    };
    /**
     * Evict entry based on strategy
     */
    CacheOptimizer.prototype.evictEntry = function () {
        var keyToEvict = null;
        switch (this.strategy.type) {
            case 'lru':
                keyToEvict = this.findLRUKey();
                break;
            case 'lfu':
                keyToEvict = this.findLFUKey();
                break;
            case 'adaptive':
                keyToEvict = this.findAdaptiveKey();
                break;
            default:
                keyToEvict = this.cache.keys().next().value;
        }
        if (keyToEvict) {
            this.delete(keyToEvict);
            this.metrics.evictions++;
        }
    };
    /**
     * Find Least Recently Used key
     */
    CacheOptimizer.prototype.findLRUKey = function () {
        var oldestKey = null;
        var oldestTime = Date.now();
        for (var _i = 0, _a = this.accessTimes; _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], time = _b[1];
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        }
        return oldestKey;
    };
    /**
     * Find Least Frequently Used key
     */
    CacheOptimizer.prototype.findLFUKey = function () {
        var leastUsedKey = null;
        var leastCount = Infinity;
        for (var _i = 0, _a = this.accessCounts; _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], count = _b[1];
            if (count < leastCount) {
                leastCount = count;
                leastUsedKey = key;
            }
        }
        return leastUsedKey;
    };
    /**
     * Find key using adaptive strategy
     */
    CacheOptimizer.prototype.findAdaptiveKey = function () {
        // Combine LRU and LFU strategies
        var lruKey = this.findLRUKey();
        var lfuKey = this.findLFUKey();
        // Prefer LFU for frequently accessed items
        return lfuKey || lruKey;
    };
    /**
     * Update access metrics
     */
    CacheOptimizer.prototype.updateAccessMetrics = function (key, startTime) {
        var accessTime = performance.now() - startTime;
        this.metrics.averageAccessTime =
            (this.metrics.averageAccessTime + accessTime) / 2;
        this.accessTimes.set(key, Date.now());
        var currentCount = this.accessCounts.get(key) || 0;
        this.accessCounts.set(key, currentCount + 1);
    };
    /**
     * Update memory usage metrics
     */
    CacheOptimizer.prototype.updateMemoryUsage = function () {
        this.metrics.memoryUsage = this.cache.size;
    };
    /**
     * Compress value (placeholder implementation)
     */
    CacheOptimizer.prototype.compress = function (value) {
        // Simple JSON compression - in production, use proper compression
        return JSON.stringify(value);
    };
    /**
     * Get cache metrics
     */
    CacheOptimizer.prototype.getMetrics = function () {
        return __assign({}, this.metrics);
    };
    /**
     * Generate performance report
     */
    CacheOptimizer.prototype.generateReport = function () {
        var totalRequests = this.metrics.hits + this.metrics.misses;
        var hitRate = totalRequests > 0 ? this.metrics.hits / totalRequests : 0;
        var missRate = totalRequests > 0 ? this.metrics.misses / totalRequests : 0;
        var evictionRate = this.cache.size > 0 ? this.metrics.evictions / this.cache.size : 0;
        return {
            hitRate: hitRate,
            missRate: missRate,
            evictionRate: evictionRate,
            memoryEfficiency: this.cache.size / this.strategy.maxSize,
            responseTimeImprovement: Math.max(0, 100 - this.metrics.averageAccessTime),
            recommendations: this.generateRecommendations(hitRate, evictionRate)
        };
    };
    /**
     * Generate optimization recommendations
     */
    CacheOptimizer.prototype.generateRecommendations = function (hitRate, evictionRate) {
        var recommendations = [];
        if (hitRate < 0.8) {
            recommendations.push('Consider increasing cache size or adjusting TTL');
        }
        if (evictionRate > 0.3) {
            recommendations.push('High eviction rate detected - consider optimizing cache strategy');
        }
        if (this.metrics.averageAccessTime > 10) {
            recommendations.push('Enable compression to improve access times');
        }
        return recommendations;
    };
    return CacheOptimizer;
}());
exports.CacheOptimizer = CacheOptimizer;
