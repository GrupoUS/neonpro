"use strict";
/**
 * Optimized Scheduling API Layer - PERF-02 Implementation
 * Healthcare-compliant conflict resolution with ≥50% API call reduction
 * LGPD/ANVISA/CFM compliant with intelligent caching and batching
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
exports.useConflictStream = exports.useOptimizedConflicts = exports.optimizedSchedulingAPI = exports.OptimizedSchedulingAPI = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
// Optimized Cache Manager with TTL and invalidation
var OptimizedCacheManager = /** @class */ (function () {
    function OptimizedCacheManager() {
        this.cache = new Map();
        this.maxSize = 1000; // Maximum cache entries
        this.defaultTTL = 300000; // 5 minutes
    }
    OptimizedCacheManager.prototype.set = function (key, data, ttl) {
        if (ttl === void 0) { ttl = this.defaultTTL; }
        // Implement LRU eviction if cache is full
        if (this.cache.size >= this.maxSize) {
            var oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        this.cache.set(key, {
            data: data,
            timestamp: Date.now(),
            ttl: ttl,
            key: key
        });
    };
    OptimizedCacheManager.prototype.get = function (key) {
        var entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        // Check if entry has expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    };
    OptimizedCacheManager.prototype.invalidate = function (pattern) {
        for (var _i = 0, _a = this.cache.keys(); _i < _a.length; _i++) {
            var key = _a[_i];
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    };
    OptimizedCacheManager.prototype.invalidateAll = function () {
        this.cache.clear();
    };
    OptimizedCacheManager.prototype.getStats = function () {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            entries: Array.from(this.cache.keys())
        };
    };
    return OptimizedCacheManager;
}());
// Request Batch Manager
var BatchRequestManager = /** @class */ (function () {
    function BatchRequestManager() {
        this.batchQueue = [];
        this.batchTimer = null;
        this.batchSize = 10;
        this.batchDelay = 100; // 100ms batch window
    }
    BatchRequestManager.prototype.addToBatch = function (request) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.batchQueue.push(__assign(__assign({}, request), { resolve: resolve, reject: reject }));
            if (_this.batchTimer) {
                clearTimeout(_this.batchTimer);
            }
            _this.batchTimer = setTimeout(function () {
                _this.processBatch();
            }, _this.batchDelay);
        });
    };
    BatchRequestManager.prototype.processBatch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var batch, batchResults_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.batchQueue.length === 0)
                            return [2 /*return*/];
                        batch = this.batchQueue.splice(0, this.batchSize);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.executeBatchRequest(batch)];
                    case 2:
                        batchResults_1 = _a.sent();
                        batch.forEach(function (request, index) {
                            if (batchResults_1[index]) {
                                request.resolve(batchResults_1[index]);
                            }
                            else {
                                request.reject(new Error('Batch request failed'));
                            }
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        batch.forEach(function (request) {
                            request.reject(error_1);
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BatchRequestManager.prototype.executeBatchRequest = function (batch) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, groupedRequests, results, _i, _a, _b, type, requests, _c, conflictResults, validationResults;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                        groupedRequests = batch.reduce(function (acc, req) {
                            if (!acc[req.type])
                                acc[req.type] = [];
                            acc[req.type].push(req);
                            return acc;
                        }, {});
                        results = [];
                        _i = 0, _a = Object.entries(groupedRequests);
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        _b = _a[_i], type = _b[0], requests = _b[1];
                        _c = type;
                        switch (_c) {
                            case 'conflict-check': return [3 /*break*/, 2];
                            case 'resolution-validation': return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 6];
                    case 2: return [4 /*yield*/, this.batchConflictCheck(supabase, requests)];
                    case 3:
                        conflictResults = _d.sent();
                        results.push.apply(results, conflictResults);
                        return [3 /*break*/, 7];
                    case 4: return [4 /*yield*/, this.batchResolutionValidation(supabase, requests)];
                    case 5:
                        validationResults = _d.sent();
                        results.push.apply(results, validationResults);
                        return [3 /*break*/, 7];
                    case 6:
                        results.push.apply(results, requests.map(function () { return null; }));
                        _d.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/, results];
                }
            });
        });
    };
    BatchRequestManager.prototype.batchConflictCheck = function (supabase, requests) {
        return __awaiter(this, void 0, void 0, function () {
            var appointmentIds, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        appointmentIds = requests.map(function (req) { return req.params.appointmentId; });
                        return [4 /*yield*/, supabase
                                .from('schedule_conflicts')
                                .select("\n        *,\n        appointments!inner(*),\n        professionals!inner(*),\n        patients!inner(*)\n      ")
                                .in('appointment_id', appointmentIds)
                                .eq('status', 'active')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, requests.map(function (req) {
                                return data.find(function (conflict) {
                                    return conflict.appointment_id === req.params.appointmentId;
                                }) || null;
                            })];
                }
            });
        });
    };
    BatchRequestManager.prototype.batchResolutionValidation = function (supabase, requests) {
        return __awaiter(this, void 0, void 0, function () {
            var conflictIds, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        conflictIds = requests.map(function (req) { return req.params.conflictId; });
                        return [4 /*yield*/, supabase
                                .from('conflict_resolutions')
                                .select('*')
                                .in('conflict_id', conflictIds)
                                .eq('status', 'pending')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, requests.map(function (req) {
                                return data.find(function (resolution) {
                                    return resolution.conflict_id === req.params.conflictId;
                                }) || null;
                            })];
                }
            });
        });
    };
    return BatchRequestManager;
}());
// Request Deduplication Manager
var RequestDeduplicationManager = /** @class */ (function () {
    function RequestDeduplicationManager() {
        this.activeRequests = new Map();
    }
    RequestDeduplicationManager.prototype.deduplicate = function (key, requestFn) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.activeRequests.has(key)) {
                    return [2 /*return*/, this.activeRequests.get(key)];
                }
                promise = requestFn().finally(function () {
                    _this.activeRequests.delete(key);
                });
                this.activeRequests.set(key, promise);
                return [2 /*return*/, promise];
            });
        });
    };
    RequestDeduplicationManager.prototype.getActiveRequestsCount = function () {
        return this.activeRequests.size;
    };
    return RequestDeduplicationManager;
}()); // Main Optimized Scheduling API Class
var OptimizedSchedulingAPI = /** @class */ (function () {
    function OptimizedSchedulingAPI() {
        this.cache = new OptimizedCacheManager();
        this.batchManager = new BatchRequestManager();
        this.deduplicationManager = new RequestDeduplicationManager();
        this.performanceMetrics = {
            totalRequests: 0,
            cachedResponses: 0,
            batchedRequests: 0,
            apiCallsReduced: 0
        };
        this.supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    // Optimized conflict fetching with caching and deduplication
    OptimizedSchedulingAPI.prototype.getConflicts = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            var startTime, cacheKey, cachedData, requestKey, data, ttl;
            var _this = this;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        this.performanceMetrics.totalRequests++;
                        cacheKey = "conflicts-".concat(JSON.stringify(filters));
                        cachedData = this.cache.get(cacheKey);
                        if (cachedData) {
                            this.performanceMetrics.cachedResponses++;
                            this.performanceMetrics.apiCallsReduced++;
                            return [2 /*return*/, {
                                    success: true,
                                    data: cachedData,
                                    timestamp: new Date().toISOString(),
                                    cached: true,
                                    performance: {
                                        queryTime: Date.now() - startTime,
                                        cacheHit: true,
                                        apiCallsReduced: this.performanceMetrics.apiCallsReduced
                                    }
                                }];
                        }
                        requestKey = "get-conflicts-".concat(cacheKey);
                        return [4 /*yield*/, this.deduplicationManager.deduplicate(requestKey, function () { return __awaiter(_this, void 0, void 0, function () {
                                var query, now, startDate, _a, data, error, transformedData;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            query = this.supabase
                                                .from('schedule_conflicts')
                                                .select("\n          *,\n          appointments!inner(\n            id, start_time, end_time, status,\n            patients!inner(id, name, email),\n            professionals!inner(id, name, specialty)\n          ),\n          conflict_resolutions(*)\n        ")
                                                .eq('status', 'active')
                                                .order('created_at', { ascending: false });
                                            // Apply filters efficiently
                                            if (filters.severity && filters.severity !== 'all') {
                                                query = query.eq('severity', filters.severity);
                                            }
                                            if (filters.type && filters.type !== 'all') {
                                                query = query.eq('type', filters.type);
                                            }
                                            if (filters.search) {
                                                query = query.or("\n          description.ilike.%".concat(filters.search, "%,\n          appointments.patients.name.ilike.%").concat(filters.search, "%,\n          appointments.professionals.name.ilike.%").concat(filters.search, "%\n        "));
                                            }
                                            // Date range filtering
                                            if (filters.dateRange && filters.dateRange !== 'all') {
                                                now = new Date();
                                                startDate = void 0;
                                                switch (filters.dateRange) {
                                                    case 'today':
                                                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                                        break;
                                                    case 'week':
                                                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                                        break;
                                                    case 'month':
                                                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                                                        break;
                                                    default:
                                                        startDate = new Date(0);
                                                }
                                                query = query.gte('created_at', startDate.toISOString());
                                            }
                                            return [4 /*yield*/, query];
                                        case 1:
                                            _a = _b.sent(), data = _a.data, error = _a.error;
                                            if (error) {
                                                throw new Error("Database error: ".concat(error.message));
                                            }
                                            transformedData = data.map(function (conflict) { return ({
                                                id: conflict.id,
                                                type: conflict.type,
                                                severity: conflict.severity,
                                                appointmentId: conflict.appointment_id,
                                                patientId: conflict.appointments.patients.id,
                                                professionalId: conflict.appointments.professionals.id,
                                                conflictTime: conflict.conflict_time,
                                                description: conflict.description,
                                                suggestedResolutions: conflict.conflict_resolutions.map(function (res) { return ({
                                                    id: res.id,
                                                    type: res.resolution_type,
                                                    description: res.description,
                                                    impact: res.impact_description,
                                                    estimatedTime: res.estimated_time_minutes,
                                                    complianceImpact: res.compliance_impact
                                                }); }),
                                                metadata: {
                                                    lgpdConsent: conflict.lgpd_consent || false,
                                                    clinicalPriority: conflict.clinical_priority || 0,
                                                    emergencyFlag: conflict.emergency_flag || false
                                                }
                                            }); });
                                            return [2 /*return*/, transformedData];
                                    }
                                });
                            }); })];
                    case 1:
                        data = _a.sent();
                        ttl = filters.search ? 60000 : 300000;
                        this.cache.set(cacheKey, data, ttl);
                        return [2 /*return*/, {
                                success: true,
                                data: data,
                                timestamp: new Date().toISOString(),
                                cached: false,
                                performance: {
                                    queryTime: Date.now() - startTime,
                                    cacheHit: false,
                                    apiCallsReduced: this.performanceMetrics.apiCallsReduced
                                }
                            }];
                }
            });
        });
    };
    // Batched conflict resolution with healthcare compliance
    OptimizedSchedulingAPI.prototype.resolveConflictsBatch = function (conflictIds, resolutionType, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        this.performanceMetrics.totalRequests++;
                        this.performanceMetrics.batchedRequests++;
                        // Validate LGPD compliance for batch operations
                        if (!metadata.lgpdCompliant) {
                            throw new Error('LGPD compliance required for batch operations');
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.supabase.rpc('resolve_conflicts_batch', {
                                p_conflict_ids: conflictIds,
                                p_resolution_type: resolutionType,
                                p_metadata: metadata,
                                p_batch_timestamp: new Date().toISOString()
                            })];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Batch resolution failed: ".concat(error.message));
                        }
                        // Invalidate relevant caches
                        this.cache.invalidate('conflicts');
                        this.cache.invalidate('appointments');
                        // Track API call reduction
                        this.performanceMetrics.apiCallsReduced += Math.max(0, conflictIds.length - 1);
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    resolvedCount: data.resolved_count,
                                    rescheduled: data.rescheduled_count,
                                    cancelled: data.cancelled_count,
                                    errors: data.errors || []
                                },
                                timestamp: new Date().toISOString(),
                                performance: {
                                    queryTime: Date.now() - startTime,
                                    cacheHit: false,
                                    apiCallsReduced: this.performanceMetrics.apiCallsReduced
                                }
                            }];
                    case 3:
                        error_2 = _b.sent();
                        throw new Error("Batch resolution error: ".concat(error_2));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Optimized individual conflict check with batching
    OptimizedSchedulingAPI.prototype.checkConflict = function (appointmentId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, cacheKey, cachedResult, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        this.performanceMetrics.totalRequests++;
                        cacheKey = "conflict-check-".concat(appointmentId);
                        cachedResult = this.cache.get(cacheKey);
                        if (cachedResult !== null) {
                            this.performanceMetrics.cachedResponses++;
                            this.performanceMetrics.apiCallsReduced++;
                            return [2 /*return*/, {
                                    success: true,
                                    data: cachedResult,
                                    timestamp: new Date().toISOString(),
                                    cached: true,
                                    performance: {
                                        queryTime: Date.now() - startTime,
                                        cacheHit: true,
                                        apiCallsReduced: this.performanceMetrics.apiCallsReduced
                                    }
                                }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.batchManager.addToBatch({
                                id: appointmentId,
                                type: 'conflict-check',
                                params: { appointmentId: appointmentId },
                                timestamp: Date.now()
                            })];
                    case 2:
                        result = _a.sent();
                        this.performanceMetrics.batchedRequests++;
                        // Cache the result
                        this.cache.set(cacheKey, result, 120000); // 2 minutes cache
                        return [2 /*return*/, {
                                success: true,
                                data: result,
                                timestamp: new Date().toISOString(),
                                cached: false,
                                performance: {
                                    queryTime: Date.now() - startTime,
                                    cacheHit: false,
                                    apiCallsReduced: this.performanceMetrics.apiCallsReduced
                                }
                            }];
                    case 3:
                        error_3 = _a.sent();
                        throw new Error("Conflict check failed: ".concat(error_3));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Real-time conflict monitoring with optimized updates
    OptimizedSchedulingAPI.prototype.createConflictStream = function (filters, onConflict, onError) {
        var _this = this;
        if (filters === void 0) { filters = {}; }
        var channel = this.supabase
            .channel('schedule_conflicts')
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'schedule_conflicts',
            filter: 'status=eq.active'
        }, function (payload) {
            // Transform and emit new conflicts
            var conflict = {
                id: payload.new.id,
                type: payload.new.type,
                severity: payload.new.severity,
                appointmentId: payload.new.appointment_id,
                patientId: payload.new.patient_id,
                professionalId: payload.new.professional_id,
                conflictTime: payload.new.conflict_time,
                description: payload.new.description,
                suggestedResolutions: [],
                metadata: {
                    lgpdConsent: payload.new.lgpd_consent || false,
                    clinicalPriority: payload.new.clinical_priority || 0,
                    emergencyFlag: payload.new.emergency_flag || false
                }
            };
            // Invalidate relevant caches
            _this.cache.invalidate("conflicts");
            _this.cache.invalidate("conflict-check-".concat(conflict.appointmentId));
            onConflict(conflict);
        })
            .subscribe(function (status) {
            if (status === 'SUBSCRIBED') {
                console.log('Conflict stream connected');
            }
            else if (status === 'CHANNEL_ERROR') {
                onError(new Error('Real-time connection failed'));
            }
        });
        // Return cleanup function
        return function () {
            _this.supabase.removeChannel(channel);
        };
    };
    // Performance metrics and cache statistics
    OptimizedSchedulingAPI.prototype.getPerformanceMetrics = function () {
        return __assign(__assign({}, this.performanceMetrics), { cacheStats: this.cache.getStats(), activeRequests: this.deduplicationManager.getActiveRequestsCount(), cacheHitRate: this.performanceMetrics.totalRequests > 0
                ? (this.performanceMetrics.cachedResponses / this.performanceMetrics.totalRequests * 100).toFixed(2) + '%'
                : '0%', apiCallReduction: this.performanceMetrics.totalRequests > 0
                ? (this.performanceMetrics.apiCallsReduced / this.performanceMetrics.totalRequests * 100).toFixed(2) + '%'
                : '0%' });
    };
    // Cache management utilities
    OptimizedSchedulingAPI.prototype.clearCache = function (pattern) {
        if (pattern) {
            this.cache.invalidate(pattern);
        }
        else {
            this.cache.invalidateAll();
        }
    };
    // Health check for API optimization
    OptimizedSchedulingAPI.prototype.healthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, cacheHitRate, apiReductionRate, status, recommendations;
            return __generator(this, function (_a) {
                metrics = this.getPerformanceMetrics();
                cacheHitRate = parseFloat(metrics.cacheHitRate.replace('%', ''));
                apiReductionRate = parseFloat(metrics.apiCallReduction.replace('%', ''));
                status = 'healthy';
                recommendations = [];
                if (cacheHitRate < 30) {
                    status = 'degraded';
                    recommendations.push('Cache hit rate is low. Consider adjusting TTL values.');
                }
                if (apiReductionRate < 50) {
                    status = 'degraded';
                    recommendations.push('API call reduction target not met. Review batching strategy.');
                }
                if (metrics.cacheStats.size > 800) {
                    recommendations.push('Cache size is high. Consider implementing more aggressive eviction.');
                }
                if (metrics.activeRequests > 50) {
                    status = 'unhealthy';
                    recommendations.push('High number of active requests. Check for request loops.');
                }
                return [2 /*return*/, {
                        status: status,
                        metrics: metrics,
                        recommendations: recommendations
                    }];
            });
        });
    };
    return OptimizedSchedulingAPI;
}());
exports.OptimizedSchedulingAPI = OptimizedSchedulingAPI;
// Singleton instance for global use
exports.optimizedSchedulingAPI = new OptimizedSchedulingAPI();
// Utility functions for React hooks
var useOptimizedConflicts = function (filters) {
    if (filters === void 0) { filters = {}; }
    return exports.optimizedSchedulingAPI.getConflicts(filters);
};
exports.useOptimizedConflicts = useOptimizedConflicts;
var useConflictStream = function (filters, onConflict, onError) {
    if (filters === void 0) { filters = {}; }
    if (onError === void 0) { onError = console.error; }
    return exports.optimizedSchedulingAPI.createConflictStream(filters, onConflict, onError);
};
exports.useConflictStream = useConflictStream;
