"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheHeaders = exports.performanceCache = exports.cacheConfig = void 0;
// Temporary caching module for build compatibility
exports.cacheConfig = {
    defaultTTL: 300,
    maxSize: 1000
};
exports.performanceCache = {
    get: function (key) { return null; },
    set: function (key, value) { return true; },
    clear: function () { return true; }
};
// Additional exports to fix build errors
exports.CacheHeaders = {
    NO_CACHE: 'no-cache',
    NO_STORE: 'no-store',
    MAX_AGE: 'max-age',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};
