"use strict";
/**
 * Mobile API System - Main Integration
 * Unified mobile API system with offline sync, push notifications, caching, and optimization
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
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
exports.defaultMobileApiConfig = exports.UnifiedMobileApiManager = void 0;
exports.createMobileApiManager = createMobileApiManager;
var mobile_api_system_1 = require("./mobile-api-system");
var cache_manager_1 = require("./cache-manager");
var offline_sync_1 = require("./offline-sync");
var push_notifications_1 = require("./push-notifications");
var utils_1 = require("./utils");
/**
 * Unified Mobile API Manager
 * Orchestrates all mobile API functionality including caching, sync, notifications, and optimization
 */
var UnifiedMobileApiManager = /** @class */ (function () {
    function UnifiedMobileApiManager(config) {
        this.isInitialized = false;
        this.config = config;
        // Initialize subsystems
        this.apiSystem = new mobile_api_system_1.MobileApiSystem(config.api);
        this.cacheManager = new cache_manager_1.CacheManager(config.cache);
        this.syncManager = new offline_sync_1.OfflineSyncManager(config.offlineSync);
        this.notificationsManager = new push_notifications_1.PushNotificationsManager(config.pushNotifications);
        // Initialize health status
        this.healthStatus = {
            overall: 'healthy',
            api: 'healthy',
            cache: 'healthy',
            sync: 'healthy',
            notifications: 'healthy',
            lastCheck: new Date(),
            uptime: 0,
            errors: []
        };
        // Initialize performance metrics
        this.performanceMetrics = {
            operationId: 'system',
            startTime: Date.now(),
            endTime: 0,
            duration: 0,
            memoryUsage: 0,
            networkLatency: 0,
            cacheHitRate: 0,
            errorRate: 0,
            throughput: 0
        };
        // Initialize stats
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            syncOperations: 0,
            notificationsSent: 0,
            averageResponseTime: 0,
            dataTransferred: 0,
            offlineOperations: 0
        };
    }
    /**
     * Initialize the unified mobile API system
     */
    UnifiedMobileApiManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        console.log('Initializing Unified Mobile API System...');
                        // Initialize subsystems in order
                        return [4 /*yield*/, this.cacheManager.initialize()];
                    case 1:
                        // Initialize subsystems in order
                        _a.sent();
                        return [4 /*yield*/, this.apiSystem.initialize()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.syncManager.initialize()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.notificationsManager.initialize()];
                    case 4:
                        _a.sent();
                        // Setup cross-system integrations
                        this.setupIntegrations();
                        // Start monitoring and health checks
                        this.startHealthMonitoring();
                        this.startPerformanceMonitoring();
                        this.isInitialized = true;
                        console.log('Unified Mobile API System initialized successfully');
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error('Failed to initialize Unified Mobile API System:', error_1);
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Make an optimized API request
     */
    UnifiedMobileApiManager.prototype.request = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, networkCondition, optimizedRequest, cachedResponse, response, error_2, offlineResponse;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.isInitialized) {
                            throw new Error('Mobile API system not initialized');
                        }
                        startTime = Date.now();
                        this.stats.totalRequests++;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 9, , 12]);
                        networkCondition = utils_1.MobileApiUtils.NetworkUtils.detectNetworkCondition();
                        optimizedRequest = utils_1.MobileApiUtils.NetworkUtils.optimizeRequest(request, networkCondition);
                        if (!((_a = optimizedRequest.cache) === null || _a === void 0 ? void 0 : _a.enabled)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.cacheManager.get(this.generateCacheKey(optimizedRequest))];
                    case 2:
                        cachedResponse = _c.sent();
                        if (cachedResponse) {
                            this.stats.cacheHits++;
                            return [2 /*return*/, cachedResponse];
                        }
                        this.stats.cacheMisses++;
                        _c.label = 3;
                    case 3: return [4 /*yield*/, this.apiSystem.request(optimizedRequest)];
                    case 4:
                        response = _c.sent();
                        if (!(response.success && ((_b = optimizedRequest.cache) === null || _b === void 0 ? void 0 : _b.enabled))) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.cacheManager.set(this.generateCacheKey(optimizedRequest), response, optimizedRequest.cache.ttl)];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        if (!this.shouldQueueForSync(optimizedRequest, response)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.syncManager.queueOperation({
                                id: "req_".concat(Date.now()),
                                type: 'api_request',
                                data: optimizedRequest,
                                timestamp: new Date(),
                                priority: 'medium',
                                retryCount: 0,
                                maxRetries: 3
                            })];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8:
                        // Update stats
                        this.stats.successfulRequests++;
                        this.stats.averageResponseTime = this.calculateAverageResponseTime(Date.now() - startTime);
                        this.stats.dataTransferred += this.calculateDataSize(response);
                        return [2 /*return*/, response];
                    case 9:
                        error_2 = _c.sent();
                        this.stats.failedRequests++;
                        if (!this.config.offlineSync.enabled) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.syncManager.getOfflineData(request.endpoint)];
                    case 10:
                        offlineResponse = _c.sent();
                        if (offlineResponse) {
                            this.stats.offlineOperations++;
                            return [2 /*return*/, {
                                    success: true,
                                    data: offlineResponse,
                                    status: 200,
                                    headers: {},
                                    responseTime: Date.now() - startTime,
                                    fromCache: false,
                                    fromOffline: true
                                }];
                        }
                        _c.label = 11;
                    case 11: throw error_2;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send push notification
     */
    UnifiedMobileApiManager.prototype.sendNotification = function (deviceId, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.notificationsManager.sendNotification(deviceId, payload)];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            this.stats.notificationsSent++;
                        }
                        return [2 /*return*/, result.success];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Failed to send notification:', error_3);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Register device for push notifications
     */
    UnifiedMobileApiManager.prototype.registerDevice = function (registration) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.notificationsManager.registerDevice(registration)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Failed to register device:', error_4);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Force sync with server
     */
    UnifiedMobileApiManager.prototype.forceSync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var status_1, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.syncManager.forceSync()];
                    case 1:
                        status_1 = _a.sent();
                        this.stats.syncOperations++;
                        return [2 /*return*/, status_1];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Force sync failed:', error_5);
                        return [2 /*return*/, {
                                status: 'error',
                                lastSync: new Date(),
                                pendingOperations: 0,
                                conflictsResolved: 0,
                                errors: [error_5.message]
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get sync status
     */
    UnifiedMobileApiManager.prototype.getSyncStatus = function () {
        return this.syncManager.getStatus();
    };
    /**
     * Get cache statistics
     */
    UnifiedMobileApiManager.prototype.getCacheStats = function () {
        return this.cacheManager.getStats();
    };
    /**
     * Get notification analytics
     */
    UnifiedMobileApiManager.prototype.getNotificationAnalytics = function () {
        return this.notificationsManager.getAnalytics();
    };
    /**
     * Get system health status
     */
    UnifiedMobileApiManager.prototype.getHealthStatus = function () {
        return __assign({}, this.healthStatus);
    };
    /**
     * Get performance metrics
     */
    UnifiedMobileApiManager.prototype.getPerformanceMetrics = function () {
        return __assign({}, this.performanceMetrics);
    };
    /**
     * Get system statistics
     */
    UnifiedMobileApiManager.prototype.getStats = function () {
        return __assign({}, this.stats);
    };
    /**
     * Clear all caches
     */
    UnifiedMobileApiManager.prototype.clearCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cacheManager.clear()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reset sync queue
     */
    UnifiedMobileApiManager.prototype.resetSyncQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.syncManager.clearQueue()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Shutdown the system gracefully
     */
    UnifiedMobileApiManager.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log('Shutting down Unified Mobile API System...');
                        // Stop monitoring
                        this.stopHealthMonitoring();
                        this.stopPerformanceMonitoring();
                        // Shutdown subsystems
                        return [4 /*yield*/, this.syncManager.shutdown()];
                    case 1:
                        // Shutdown subsystems
                        _a.sent();
                        return [4 /*yield*/, this.cacheManager.shutdown()];
                    case 2:
                        _a.sent();
                        this.isInitialized = false;
                        console.log('Unified Mobile API System shutdown complete');
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        console.error('Error during shutdown:', error_6);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Setup cross-system integrations
     */
    UnifiedMobileApiManager.prototype.setupIntegrations = function () {
        var _this = this;
        // Cache invalidation on sync
        this.syncManager.on('dataUpdated', function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cacheManager.invalidatePattern(data.pattern)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Notification on sync completion
        this.syncManager.on('syncCompleted', function (status) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.config.pushNotifications.syncNotifications) {
                    // Send sync completion notification
                }
                return [2 /*return*/];
            });
        }); });
        // Performance monitoring integration
        this.apiSystem.on('requestCompleted', function (metrics) {
            _this.updatePerformanceMetrics(metrics);
        });
    };
    /**
     * Generate cache key for request
     */
    UnifiedMobileApiManager.prototype.generateCacheKey = function (request) {
        var keyData = {
            endpoint: request.endpoint,
            method: request.method,
            params: request.params,
            body: request.body
        };
        return utils_1.MobileApiUtils.SecurityUtils.generateHash(JSON.stringify(keyData));
    };
    /**
     * Check if request should be queued for sync
     */
    UnifiedMobileApiManager.prototype.shouldQueueForSync = function (request, response) {
        // Queue write operations for sync
        var writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        return writeMethods.includes(request.method) && response.success;
    };
    /**
     * Calculate average response time
     */
    UnifiedMobileApiManager.prototype.calculateAverageResponseTime = function (currentTime) {
        var totalRequests = this.stats.totalRequests;
        var currentAverage = this.stats.averageResponseTime;
        return ((currentAverage * (totalRequests - 1)) + currentTime) / totalRequests;
    };
    /**
     * Calculate data size
     */
    UnifiedMobileApiManager.prototype.calculateDataSize = function (response) {
        return JSON.stringify(response.data || {}).length;
    };
    /**
     * Start health monitoring
     */
    UnifiedMobileApiManager.prototype.startHealthMonitoring = function () {
        var _this = this;
        setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkSystemHealth()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, this.config.healthCheckInterval || 30000);
    };
    /**
     * Stop health monitoring
     */
    UnifiedMobileApiManager.prototype.stopHealthMonitoring = function () {
        // Implementation would clear the interval
    };
    /**
     * Start performance monitoring
     */
    UnifiedMobileApiManager.prototype.startPerformanceMonitoring = function () {
        var _this = this;
        setInterval(function () {
            _this.collectPerformanceMetrics();
        }, this.config.metricsInterval || 60000);
    };
    /**
     * Stop performance monitoring
     */
    UnifiedMobileApiManager.prototype.stopPerformanceMonitoring = function () {
        // Implementation would clear the interval
    };
    /**
     * Check system health
     */
    UnifiedMobileApiManager.prototype.checkSystemHealth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var errors, apiHealth, cacheHealth, syncHealth, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        errors = [];
                        return [4 /*yield*/, this.apiSystem.healthCheck()];
                    case 1:
                        apiHealth = _a.sent();
                        if (!apiHealth.healthy) {
                            errors.push('API system unhealthy');
                            this.healthStatus.api = 'unhealthy';
                        }
                        else {
                            this.healthStatus.api = 'healthy';
                        }
                        return [4 /*yield*/, this.cacheManager.healthCheck()];
                    case 2:
                        cacheHealth = _a.sent();
                        if (!cacheHealth.healthy) {
                            errors.push('Cache system unhealthy');
                            this.healthStatus.cache = 'unhealthy';
                        }
                        else {
                            this.healthStatus.cache = 'healthy';
                        }
                        return [4 /*yield*/, this.syncManager.healthCheck()];
                    case 3:
                        syncHealth = _a.sent();
                        if (!syncHealth.healthy) {
                            errors.push('Sync system unhealthy');
                            this.healthStatus.sync = 'unhealthy';
                        }
                        else {
                            this.healthStatus.sync = 'healthy';
                        }
                        // Update overall health
                        this.healthStatus.overall = errors.length === 0 ? 'healthy' : 'unhealthy';
                        this.healthStatus.errors = errors;
                        this.healthStatus.lastCheck = new Date();
                        this.healthStatus.uptime = Date.now() - this.performanceMetrics.startTime;
                        return [3 /*break*/, 5];
                    case 4:
                        error_7 = _a.sent();
                        console.error('Health check failed:', error_7);
                        this.healthStatus.overall = 'unhealthy';
                        this.healthStatus.errors = ['Health check failed'];
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Collect performance metrics
     */
    UnifiedMobileApiManager.prototype.collectPerformanceMetrics = function () {
        try {
            // Update memory usage
            this.performanceMetrics.memoryUsage = utils_1.MobileApiUtils.PerformanceUtils.getMemoryUsage();
            // Calculate cache hit rate
            var totalCacheRequests = this.stats.cacheHits + this.stats.cacheMisses;
            this.performanceMetrics.cacheHitRate = utils_1.MobileApiUtils.PerformanceUtils.calculateCacheHitRate(this.stats.cacheHits, totalCacheRequests);
            // Calculate error rate
            this.performanceMetrics.errorRate = this.stats.totalRequests > 0
                ? (this.stats.failedRequests / this.stats.totalRequests) * 100
                : 0;
            // Calculate throughput
            var duration = Date.now() - this.performanceMetrics.startTime;
            this.performanceMetrics.throughput = utils_1.MobileApiUtils.PerformanceUtils.calculateThroughput(this.stats.totalRequests, duration);
        }
        catch (error) {
            console.error('Performance metrics collection failed:', error);
        }
    };
    /**
     * Update performance metrics from subsystems
     */
    UnifiedMobileApiManager.prototype.updatePerformanceMetrics = function (metrics) {
        if (metrics.networkLatency) {
            this.performanceMetrics.networkLatency = metrics.networkLatency;
        }
    };
    return UnifiedMobileApiManager;
}());
exports.UnifiedMobileApiManager = UnifiedMobileApiManager;
/**
 * Create unified mobile API manager
 */
function createMobileApiManager(config) {
    return new UnifiedMobileApiManager(config);
}
/**
 * Default mobile API configuration
 */
exports.defaultMobileApiConfig = {
    healthCheckInterval: 30000,
    metricsInterval: 60000,
    api: {
        baseUrl: '',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        compression: {
            enabled: true,
            algorithm: 'gzip',
            level: 6
        },
        security: {
            encryptionKey: '',
            signatureValidation: true,
            rateLimiting: {
                enabled: true,
                maxRequests: 100,
                windowMs: 60000
            }
        }
    },
    cache: {
        enabled: true,
        strategy: 'lru',
        maxSize: 100 * 1024 * 1024, // 100MB
        defaultTtl: 3600000, // 1 hour
        compression: {
            enabled: true,
            algorithm: 'gzip',
            level: 6
        }
    },
    offlineSync: {
        enabled: true,
        syncInterval: 300000, // 5 minutes
        maxRetries: 3,
        conflictResolution: 'server-wins',
        batchSize: 50
    },
    pushNotifications: {
        supabaseUrl: '',
        supabaseKey: '',
        fcmServerKey: '',
        apnsConfig: {},
        batchSize: 100,
        rateLimitDelay: 100,
        processingInterval: 5000,
        analyticsInterval: 60000,
        syncNotifications: true
    }
};
// Export all types and utilities
__exportStar(require("./types"), exports);
__exportStar(require("./mobile-api-system"), exports);
__exportStar(require("./cache-manager"), exports);
__exportStar(require("./offline-sync"), exports);
__exportStar(require("./push-notifications"), exports);
__exportStar(require("./utils"), exports);
exports.default = UnifiedMobileApiManager;
