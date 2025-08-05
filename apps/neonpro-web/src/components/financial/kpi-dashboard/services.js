"use strict";
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
exports.PerformanceService = exports.SupabaseKPIService = exports.FinancialKPIService = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var config_1 = require("./config");
// Supabase client
var supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
// Cache implementation
var CacheManager = /** @class */ (function () {
    function CacheManager() {
        this.cache = new Map();
    }
    CacheManager.prototype.set = function (key, data, ttl) {
        if (ttl === void 0) { ttl = config_1.API_CONFIG.cacheTimeout; }
        this.cache.set(key, {
            data: data,
            timestamp: Date.now(),
            ttl: ttl
        });
    };
    CacheManager.prototype.get = function (key) {
        var item = this.cache.get(key);
        if (!item)
            return null;
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    };
    CacheManager.prototype.clear = function () {
        this.cache.clear();
    };
    CacheManager.prototype.delete = function (key) {
        this.cache.delete(key);
    };
    return CacheManager;
}());
var cache = new CacheManager();
// API Client with retry logic
var APIClient = /** @class */ (function () {
    function APIClient() {
    }
    APIClient.prototype.request = function (endpoint_1) {
        return __awaiter(this, arguments, void 0, function (endpoint, options, retries) {
            var url, controller, timeoutId, response, data, error_1;
            if (options === void 0) { options = {}; }
            if (retries === void 0) { retries = config_1.API_CONFIG.retryAttempts; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(config_1.API_CONFIG.baseUrl).concat(endpoint);
                        controller = new AbortController();
                        timeoutId = setTimeout(function () { return controller.abort(); }, config_1.API_CONFIG.timeout);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 7]);
                        return [4 /*yield*/, fetch(url, __assign(__assign({}, options), { signal: controller.signal, headers: __assign({ 'Content-Type': 'application/json' }, options.headers) }))];
                    case 2:
                        response = _a.sent();
                        clearTimeout(timeoutId);
                        if (!response.ok) {
                            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        return [2 /*return*/, {
                                data: data,
                                success: true,
                                error: null,
                                timestamp: new Date().toISOString()
                            }];
                    case 4:
                        error_1 = _a.sent();
                        clearTimeout(timeoutId);
                        if (!(retries > 0 && error_1 instanceof Error && error_1.name !== 'AbortError')) return [3 /*break*/, 6];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, this.request(endpoint, options, retries - 1)];
                    case 6: return [2 /*return*/, {
                            data: null,
                            success: false,
                            error: error_1 instanceof Error ? error_1.message : 'Unknown error',
                            timestamp: new Date().toISOString()
                        }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    APIClient.prototype.get = function (endpoint, params) {
        return __awaiter(this, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                url = new URL("".concat(config_1.API_CONFIG.baseUrl).concat(endpoint));
                if (params) {
                    Object.entries(params).forEach(function (_a) {
                        var key = _a[0], value = _a[1];
                        if (value !== undefined && value !== null) {
                            url.searchParams.append(key, String(value));
                        }
                    });
                }
                return [2 /*return*/, this.request(url.pathname + url.search)];
            });
        });
    };
    APIClient.prototype.post = function (endpoint, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(endpoint, {
                        method: 'POST',
                        body: data ? JSON.stringify(data) : undefined
                    })];
            });
        });
    };
    APIClient.prototype.put = function (endpoint, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(endpoint, {
                        method: 'PUT',
                        body: data ? JSON.stringify(data) : undefined
                    })];
            });
        });
    };
    APIClient.prototype.delete = function (endpoint) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(endpoint, {
                        method: 'DELETE'
                    })];
            });
        });
    };
    return APIClient;
}());
var apiClient = new APIClient();
// Financial KPI Service
var FinancialKPIService = /** @class */ (function () {
    function FinancialKPIService() {
    }
    // Fetch KPI data with caching
    FinancialKPIService.getKPIData = function (filters_1) {
        return __awaiter(this, arguments, void 0, function (filters, useCache) {
            var cacheKey, cached, response;
            if (useCache === void 0) { useCache = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "".concat(config_1.CACHE_KEYS.KPI_DATA, "_").concat(JSON.stringify(filters));
                        if (useCache) {
                            cached = cache.get(cacheKey);
                            if (cached) {
                                return [2 /*return*/, {
                                        data: cached,
                                        success: true,
                                        error: null,
                                        timestamp: new Date().toISOString()
                                    }];
                            }
                        }
                        if (config_1.API_CONFIG.enableMocking) {
                            return [2 /*return*/, this.getMockKPIData(filters)];
                        }
                        return [4 /*yield*/, apiClient.get(config_1.API_ENDPOINTS.KPI_DATA, filters)];
                    case 1:
                        response = _a.sent();
                        if (response.success && response.data) {
                            cache.set(cacheKey, response.data);
                        }
                        return [2 /*return*/, response];
                }
            });
        });
    };
    // Fetch alerts
    FinancialKPIService.getAlerts = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (config_1.API_CONFIG.enableMocking) {
                    return [2 /*return*/, this.getMockAlerts()];
                }
                return [2 /*return*/, apiClient.get(config_1.API_ENDPOINTS.ALERTS, filters)];
            });
        });
    };
    // Fetch benchmarks
    FinancialKPIService.getBenchmarks = function (kpiIds) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (config_1.API_CONFIG.enableMocking) {
                    return [2 /*return*/, this.getMockBenchmarks(kpiIds)];
                }
                return [2 /*return*/, apiClient.get(config_1.API_ENDPOINTS.BENCHMARKS, { kpiIds: kpiIds })];
            });
        });
    };
    // Fetch forecasts
    FinancialKPIService.getForecasts = function (kpiIds_1) {
        return __awaiter(this, arguments, void 0, function (kpiIds, horizon) {
            if (horizon === void 0) { horizon = 30; }
            return __generator(this, function (_a) {
                if (config_1.API_CONFIG.enableMocking) {
                    return [2 /*return*/, this.getMockForecasts(kpiIds, horizon)];
                }
                return [2 /*return*/, apiClient.get(config_1.API_ENDPOINTS.FORECASTS, { kpiIds: kpiIds, horizon: horizon })];
            });
        });
    };
    // Export data
    FinancialKPIService.exportData = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, apiClient.post(config_1.API_ENDPOINTS.EXPORT, options)];
            });
        });
    };
    // Share report
    FinancialKPIService.shareReport = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, apiClient.post(config_1.API_ENDPOINTS.SHARE, options)];
            });
        });
    };
    // Mock data generators
    FinancialKPIService.getMockKPIData = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var mockData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                    case 1:
                        _a.sent(); // Simulate API delay
                        mockData = [
                            {
                                id: 'total-revenue',
                                name: 'Receita Total',
                                value: 125000,
                                previousValue: 118000,
                                target: 130000,
                                unit: 'currency',
                                trend: 'up',
                                changePercent: 5.93,
                                status: 'good',
                                lastUpdated: new Date(),
                                category: 'revenue',
                                description: 'Receita total do período selecionado'
                            },
                            {
                                id: 'gross-margin',
                                name: 'Margem Bruta',
                                value: 38.5,
                                previousValue: 36.2,
                                target: 40,
                                unit: 'percentage',
                                trend: 'up',
                                changePercent: 6.35,
                                status: 'good',
                                lastUpdated: new Date(),
                                category: 'profitability',
                                description: 'Margem bruta de lucro'
                            },
                            {
                                id: 'cash-flow',
                                name: 'Fluxo de Caixa',
                                value: 45000,
                                previousValue: 42000,
                                target: 50000,
                                unit: 'currency',
                                trend: 'up',
                                changePercent: 7.14,
                                status: 'warning',
                                lastUpdated: new Date(),
                                category: 'cash-flow',
                                description: 'Fluxo de caixa líquido'
                            },
                            {
                                id: 'utilization-rate',
                                name: 'Taxa de Utilização',
                                value: 82.3,
                                previousValue: 79.1,
                                target: 85,
                                unit: 'percentage',
                                trend: 'up',
                                changePercent: 4.04,
                                status: 'good',
                                lastUpdated: new Date(),
                                category: 'efficiency',
                                description: 'Taxa de utilização dos recursos'
                            }
                        ];
                        return [2 /*return*/, {
                                data: mockData,
                                success: true,
                                error: null,
                                timestamp: new Date().toISOString()
                            }];
                }
            });
        });
    };
    FinancialKPIService.getMockAlerts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var mockAlerts;
            return __generator(this, function (_a) {
                mockAlerts = [
                    {
                        id: 'alert-1',
                        kpiId: 'cash-flow',
                        title: 'Fluxo de Caixa Abaixo da Meta',
                        message: 'O fluxo de caixa está 10% abaixo da meta mensal',
                        severity: 'warning',
                        isRead: false,
                        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                        threshold: 50000,
                        currentValue: 45000
                    },
                    {
                        id: 'alert-2',
                        kpiId: 'utilization-rate',
                        title: 'Excelente Taxa de Utilização',
                        message: 'Taxa de utilização superou a meta em 3%',
                        severity: 'info',
                        isRead: true,
                        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                        threshold: 80,
                        currentValue: 82.3
                    }
                ];
                return [2 /*return*/, {
                        data: mockAlerts,
                        success: true,
                        error: null,
                        timestamp: new Date().toISOString()
                    }];
            });
        });
    };
    FinancialKPIService.getMockBenchmarks = function (kpiIds) {
        return __awaiter(this, void 0, void 0, function () {
            var mockBenchmarks;
            return __generator(this, function (_a) {
                mockBenchmarks = [
                    {
                        id: 'benchmark-1',
                        kpiId: 'total-revenue',
                        industry: 'healthcare',
                        segment: 'dental-clinic',
                        percentile25: 80000,
                        percentile50: 120000,
                        percentile75: 180000,
                        percentile90: 250000,
                        source: 'Industry Report 2024',
                        lastUpdated: new Date()
                    },
                    {
                        id: 'benchmark-2',
                        kpiId: 'gross-margin',
                        industry: 'healthcare',
                        segment: 'dental-clinic',
                        percentile25: 30,
                        percentile50: 38,
                        percentile75: 45,
                        percentile90: 55,
                        source: 'Industry Report 2024',
                        lastUpdated: new Date()
                    }
                ];
                return [2 /*return*/, {
                        data: mockBenchmarks.filter(function (b) { return kpiIds.includes(b.kpiId); }),
                        success: true,
                        error: null,
                        timestamp: new Date().toISOString()
                    }];
            });
        });
    };
    FinancialKPIService.getMockForecasts = function (kpiIds, horizon) {
        return __awaiter(this, void 0, void 0, function () {
            var mockForecasts;
            return __generator(this, function (_a) {
                mockForecasts = [
                    {
                        id: 'forecast-1',
                        kpiId: 'total-revenue',
                        predictions: Array.from({ length: horizon }, function (_, i) { return ({
                            date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
                            value: 125000 + Math.random() * 20000 - 10000,
                            confidence: 0.85 - (i * 0.01)
                        }); }),
                        model: 'ARIMA',
                        accuracy: 0.92,
                        lastTrained: new Date(),
                        createdAt: new Date()
                    }
                ];
                return [2 /*return*/, {
                        data: mockForecasts.filter(function (f) { return kpiIds.includes(f.kpiId); }),
                        success: true,
                        error: null,
                        timestamp: new Date().toISOString()
                    }];
            });
        });
    };
    return FinancialKPIService;
}());
exports.FinancialKPIService = FinancialKPIService;
// Supabase Service for real-time data
var SupabaseKPIService = /** @class */ (function () {
    function SupabaseKPIService() {
    }
    // Real-time KPI subscription
    SupabaseKPIService.subscribeToKPIUpdates = function (callback, filters) {
        var _this = this;
        return supabase
            .channel('kpi-updates')
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'financial_kpis'
        }, function (payload) {
            // Process real-time updates
            _this.processKPIUpdate(payload, callback, filters);
        })
            .subscribe();
    };
    // Process real-time updates
    SupabaseKPIService.processKPIUpdate = function (payload, callback, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, FinancialKPIService.getKPIData(filters || {}, false)];
                    case 1:
                        response = _a.sent();
                        if (response.success && response.data) {
                            callback(response.data);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error processing KPI update:', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Fetch financial data from Supabase
    SupabaseKPIService.getFinancialData = function (dateRange, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('appointments')
                                .select("\n          id,\n          total_amount,\n          status,\n          created_at,\n          service:services(name, category),\n          provider:providers(name),\n          patient:patients(name)\n        ")
                                .gte('created_at', dateRange.startDate.toISOString())
                                .lte('created_at', dateRange.endDate.toISOString())];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Process and aggregate data
                        return [2 /*return*/, this.processFinancialData(data || [])];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Error fetching financial data:', error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Process raw financial data
    SupabaseKPIService.processFinancialData = function (rawData) {
        var totalRevenue = rawData
            .filter(function (item) { return item.status === 'completed'; })
            .reduce(function (sum, item) { return sum + (item.total_amount || 0); }, 0);
        var totalAppointments = rawData.length;
        var completedAppointments = rawData.filter(function (item) { return item.status === 'completed'; }).length;
        var averageTicket = completedAppointments > 0 ? totalRevenue / completedAppointments : 0;
        return {
            totalRevenue: totalRevenue,
            totalAppointments: totalAppointments,
            completedAppointments: completedAppointments,
            averageTicket: averageTicket,
            conversionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
            period: {
                startDate: new Date(),
                endDate: new Date()
            }
        };
    };
    // Get service metrics
    SupabaseKPIService.getServiceMetrics = function (dateRange) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, serviceGroups, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('appointments')
                                .select("\n          service:services(id, name, category, price),\n          total_amount,\n          status\n        ")
                                .gte('created_at', dateRange.startDate.toISOString())
                                .lte('created_at', dateRange.endDate.toISOString())
                                .eq('status', 'completed')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        serviceGroups = (data === null || data === void 0 ? void 0 : data.reduce(function (acc, item) {
                            var _a;
                            var serviceId = (_a = item.service) === null || _a === void 0 ? void 0 : _a.id;
                            if (!serviceId)
                                return acc;
                            if (!acc[serviceId]) {
                                acc[serviceId] = {
                                    id: serviceId,
                                    name: item.service.name,
                                    category: item.service.category,
                                    revenue: 0,
                                    appointments: 0,
                                    averagePrice: item.service.price || 0
                                };
                            }
                            acc[serviceId].revenue += item.total_amount || 0;
                            acc[serviceId].appointments += 1;
                            return acc;
                        }, {})) || {};
                        return [2 /*return*/, Object.values(serviceGroups)];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Error fetching service metrics:', error_4);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Get provider metrics
    SupabaseKPIService.getProviderMetrics = function (dateRange) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, providerGroups, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('appointments')
                                .select("\n          provider:providers(id, name),\n          total_amount,\n          status,\n          duration\n        ")
                                .gte('created_at', dateRange.startDate.toISOString())
                                .lte('created_at', dateRange.endDate.toISOString())
                                .eq('status', 'completed')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        providerGroups = (data === null || data === void 0 ? void 0 : data.reduce(function (acc, item) {
                            var _a;
                            var providerId = (_a = item.provider) === null || _a === void 0 ? void 0 : _a.id;
                            if (!providerId)
                                return acc;
                            if (!acc[providerId]) {
                                acc[providerId] = {
                                    id: providerId,
                                    name: item.provider.name,
                                    revenue: 0,
                                    appointments: 0,
                                    averageTicket: 0,
                                    utilizationRate: 0
                                };
                            }
                            acc[providerId].revenue += item.total_amount || 0;
                            acc[providerId].appointments += 1;
                            return acc;
                        }, {})) || {};
                        // Calculate averages
                        Object.values(providerGroups).forEach(function (provider) {
                            provider.averageTicket = provider.appointments > 0
                                ? provider.revenue / provider.appointments
                                : 0;
                            // Note: utilizationRate would need additional schedule data
                            provider.utilizationRate = 75 + Math.random() * 20; // Mock for now
                        });
                        return [2 /*return*/, Object.values(providerGroups)];
                    case 2:
                        error_5 = _b.sent();
                        console.error('Error fetching provider metrics:', error_5);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return SupabaseKPIService;
}());
exports.SupabaseKPIService = SupabaseKPIService;
// Performance monitoring
var PerformanceService = /** @class */ (function () {
    function PerformanceService() {
    }
    PerformanceService.startTimer = function (operation) {
        var _this = this;
        var startTime = performance.now();
        return function () {
            var duration = performance.now() - startTime;
            _this.recordMetric(operation, duration);
            return duration;
        };
    };
    PerformanceService.recordMetric = function (operation, value) {
        switch (operation) {
            case 'load':
                this.metrics.loadTime = value;
                break;
            case 'render':
                this.metrics.renderTime = value;
                break;
            case 'data-freshness':
                this.metrics.dataFreshness = value;
                break;
        }
    };
    PerformanceService.getMetrics = function () {
        return __assign({}, this.metrics);
    };
    PerformanceService.clearMetrics = function () {
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            dataFreshness: 0,
            errorRate: 0,
            cacheHitRate: 0
        };
    };
    PerformanceService.metrics = {
        loadTime: 0,
        renderTime: 0,
        dataFreshness: 0,
        errorRate: 0,
        cacheHitRate: 0
    };
    return PerformanceService;
}());
exports.PerformanceService = PerformanceService;
// Export all services
exports.default = {
    FinancialKPIService: FinancialKPIService,
    SupabaseKPIService: SupabaseKPIService,
    PerformanceService: PerformanceService,
    cache: cache
};
