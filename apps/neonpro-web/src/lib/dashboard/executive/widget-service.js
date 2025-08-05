"use strict";
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
exports.createwidgetService = exports.WidgetService = exports.WidgetDataSchema = exports.WidgetConfigurationSchema = exports.WidgetDataSourceSchema = exports.WidgetTypeSchema = void 0;
var zod_1 = require("zod");
var client_1 = require("@/lib/supabase/client");
var logger_1 = require("@/lib/logger");
var kpi_calculation_service_1 = require("./kpi-calculation-service");
// Widget Types and Schemas
exports.WidgetTypeSchema = zod_1.z.enum([
    'kpi_card',
    'line_chart',
    'bar_chart',
    'pie_chart',
    'area_chart',
    'gauge_chart',
    'table',
    'metric_comparison',
    'trend_indicator',
    'alert_list'
]);
exports.WidgetDataSourceSchema = zod_1.z.object({
    type: zod_1.z.enum(['kpi', 'query', 'api', 'static']),
    source: zod_1.z.string(),
    parameters: zod_1.z.record(zod_1.z.any()).optional(),
    refreshInterval: zod_1.z.number().min(30).default(300), // seconds
    cacheEnabled: zod_1.z.boolean().default(true)
});
exports.WidgetConfigurationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    dashboardId: zod_1.z.string().uuid(),
    clinicId: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1).max(255),
    type: exports.WidgetTypeSchema,
    dataSource: exports.WidgetDataSourceSchema,
    position: zod_1.z.object({
        x: zod_1.z.number().min(0),
        y: zod_1.z.number().min(0),
        width: zod_1.z.number().min(1).max(12),
        height: zod_1.z.number().min(1).max(12)
    }),
    styling: zod_1.z.object({
        backgroundColor: zod_1.z.string().optional(),
        textColor: zod_1.z.string().optional(),
        borderColor: zod_1.z.string().optional(),
        borderRadius: zod_1.z.number().optional(),
        padding: zod_1.z.number().optional(),
        fontSize: zod_1.z.number().optional()
    }).optional(),
    chartOptions: zod_1.z.object({
        showLegend: zod_1.z.boolean().default(true),
        showGrid: zod_1.z.boolean().default(true),
        showTooltip: zod_1.z.boolean().default(true),
        colors: zod_1.z.array(zod_1.z.string()).optional(),
        animation: zod_1.z.boolean().default(true),
        responsive: zod_1.z.boolean().default(true)
    }).optional(),
    isVisible: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
exports.WidgetDataSchema = zod_1.z.object({
    widgetId: zod_1.z.string().uuid(),
    data: zod_1.z.any(),
    metadata: zod_1.z.object({
        lastUpdated: zod_1.z.string().datetime(),
        dataPoints: zod_1.z.number(),
        status: zod_1.z.enum(['success', 'error', 'loading']),
        errorMessage: zod_1.z.string().optional()
    }),
    cacheExpiry: zod_1.z.string().datetime().optional()
});
// Widget Service
var WidgetService = /** @class */ (function () {
    function WidgetService() {
        this.supabase = (0, client_1.createClient)();
        this.dataCache = new Map();
        this.refreshTimers = new Map();
    }
    /**
     * Get all widgets for a dashboard
     */
    WidgetService.prototype.getDashboardWidgets = function (dashboardId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('dashboard_widgets')
                                .select('*')
                                .eq('dashboard_id', dashboardId)
                                .eq('is_visible', true)
                                .order('position->y', { ascending: true })
                                .order('position->x', { ascending: true })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            logger_1.logger.error('Error fetching dashboard widgets:', error);
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, data.map(function (widget) { return ({
                                id: widget.id,
                                dashboardId: widget.dashboard_id,
                                clinicId: widget.clinic_id,
                                title: widget.title,
                                type: widget.type,
                                dataSource: widget.data_source,
                                position: widget.position,
                                styling: widget.styling,
                                chartOptions: widget.chart_options,
                                isVisible: widget.is_visible,
                                createdAt: widget.created_at,
                                updatedAt: widget.updated_at
                            }); })];
                    case 2:
                        error_1 = _b.sent();
                        logger_1.logger.error('Error getting dashboard widgets:', error_1);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new widget
     */
    WidgetService.prototype.createWidget = function (widget) {
        return __awaiter(this, void 0, void 0, function () {
            var widgetId, now, _a, data, error, newWidget, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        widgetId = crypto.randomUUID();
                        now = new Date().toISOString();
                        return [4 /*yield*/, this.supabase
                                .from('dashboard_widgets')
                                .insert({
                                id: widgetId,
                                dashboard_id: widget.dashboardId,
                                clinic_id: widget.clinicId,
                                title: widget.title,
                                type: widget.type,
                                data_source: widget.dataSource,
                                position: widget.position,
                                styling: widget.styling,
                                chart_options: widget.chartOptions,
                                is_visible: widget.isVisible,
                                created_at: now,
                                updated_at: now
                            })
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            logger_1.logger.error('Error creating widget:', error);
                            return [2 /*return*/, null];
                        }
                        newWidget = {
                            id: data.id,
                            dashboardId: data.dashboard_id,
                            clinicId: data.clinic_id,
                            title: data.title,
                            type: data.type,
                            dataSource: data.data_source,
                            position: data.position,
                            styling: data.styling,
                            chartOptions: data.chart_options,
                            isVisible: data.is_visible,
                            createdAt: data.created_at,
                            updatedAt: data.updated_at
                        };
                        // Start data refresh for the new widget
                        this.startWidgetDataRefresh(newWidget);
                        return [2 /*return*/, newWidget];
                    case 2:
                        error_2 = _b.sent();
                        logger_1.logger.error('Error creating widget:', error_2);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update widget configuration
     */
    WidgetService.prototype.updateWidget = function (widgetId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, updatedWidget, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('dashboard_widgets')
                                .update({
                                title: updates.title,
                                type: updates.type,
                                data_source: updates.dataSource,
                                position: updates.position,
                                styling: updates.styling,
                                chart_options: updates.chartOptions,
                                is_visible: updates.isVisible,
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', widgetId)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            logger_1.logger.error('Error updating widget:', error);
                            return [2 /*return*/, null];
                        }
                        updatedWidget = {
                            id: data.id,
                            dashboardId: data.dashboard_id,
                            clinicId: data.clinic_id,
                            title: data.title,
                            type: data.type,
                            dataSource: data.data_source,
                            position: data.position,
                            styling: data.styling,
                            chartOptions: data.chart_options,
                            isVisible: data.is_visible,
                            createdAt: data.created_at,
                            updatedAt: data.updated_at
                        };
                        // Restart data refresh with new configuration
                        this.stopWidgetDataRefresh(widgetId);
                        this.startWidgetDataRefresh(updatedWidget);
                        return [2 /*return*/, updatedWidget];
                    case 2:
                        error_3 = _b.sent();
                        logger_1.logger.error('Error updating widget:', error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a widget
     */
    WidgetService.prototype.deleteWidget = function (widgetId) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('dashboard_widgets')
                                .delete()
                                .eq('id', widgetId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            logger_1.logger.error('Error deleting widget:', error);
                            return [2 /*return*/, false];
                        }
                        // Stop data refresh and clear cache
                        this.stopWidgetDataRefresh(widgetId);
                        this.dataCache.delete(widgetId);
                        return [2 /*return*/, true];
                    case 2:
                        error_4 = _a.sent();
                        logger_1.logger.error('Error deleting widget:', error_4);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get widget data
     */
    WidgetService.prototype.getWidgetData = function (widgetId_1) {
        return __awaiter(this, arguments, void 0, function (widgetId, forceRefresh) {
            var cached, _a, widgetConfig, error, data, widgetData, error_5;
            if (forceRefresh === void 0) { forceRefresh = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        // Check cache first
                        if (!forceRefresh) {
                            cached = this.dataCache.get(widgetId);
                            if (cached && cached.cacheExpiry && new Date(cached.cacheExpiry) > new Date()) {
                                return [2 /*return*/, cached];
                            }
                        }
                        return [4 /*yield*/, this.supabase
                                .from('dashboard_widgets')
                                .select('*')
                                .eq('id', widgetId)
                                .single()];
                    case 1:
                        _a = _b.sent(), widgetConfig = _a.data, error = _a.error;
                        if (error) {
                            logger_1.logger.error('Error fetching widget configuration:', error);
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.fetchWidgetData(widgetConfig)];
                    case 2:
                        data = _b.sent();
                        widgetData = {
                            widgetId: widgetId,
                            data: data,
                            metadata: {
                                lastUpdated: new Date().toISOString(),
                                dataPoints: Array.isArray(data) ? data.length : 1,
                                status: 'success'
                            },
                            cacheExpiry: widgetConfig.data_source.cacheEnabled
                                ? new Date(Date.now() + (widgetConfig.data_source.refreshInterval * 1000)).toISOString()
                                : undefined
                        };
                        // Cache the data
                        if (widgetConfig.data_source.cacheEnabled) {
                            this.dataCache.set(widgetId, widgetData);
                        }
                        return [2 /*return*/, widgetData];
                    case 3:
                        error_5 = _b.sent();
                        logger_1.logger.error('Error getting widget data:', error_5);
                        return [2 /*return*/, {
                                widgetId: widgetId,
                                data: null,
                                metadata: {
                                    lastUpdated: new Date().toISOString(),
                                    dataPoints: 0,
                                    status: 'error',
                                    errorMessage: error_5 instanceof Error ? error_5.message : 'Unknown error'
                                }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch data based on widget data source
     */
    WidgetService.prototype.fetchWidgetData = function (widgetConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var dataSource, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        dataSource = widgetConfig.data_source;
                        _a = dataSource.type;
                        switch (_a) {
                            case 'kpi': return [3 /*break*/, 1];
                            case 'query': return [3 /*break*/, 3];
                            case 'api': return [3 /*break*/, 5];
                            case 'static': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 8];
                    case 1: return [4 /*yield*/, this.fetchKPIData(widgetConfig.clinic_id, dataSource.source, dataSource.parameters)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.fetchQueryData(dataSource.source, dataSource.parameters)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.fetchAPIData(dataSource.source, dataSource.parameters)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [2 /*return*/, this.fetchStaticData(dataSource.source)];
                    case 8: throw new Error("Unknown data source type: ".concat(dataSource.type));
                }
            });
        });
    };
    /**
     * Fetch KPI data
     */
    WidgetService.prototype.fetchKPIData = function (clinicId, kpiSource, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, allKPIs, operationalKPIs, patientKPIs, staffKPIs, specificKPIs;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = kpiSource;
                        switch (_a) {
                            case 'all_kpis': return [3 /*break*/, 1];
                            case 'financial_summary': return [3 /*break*/, 3];
                            case 'operational_summary': return [3 /*break*/, 5];
                            case 'patient_summary': return [3 /*break*/, 7];
                            case 'staff_summary': return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 1: return [4 /*yield*/, (0, kpi_calculation_service_1.createkpiCalculationService)().calculateClinicKPIs(clinicId, (parameters === null || parameters === void 0 ? void 0 : parameters.periodStart) ? new Date(parameters.periodStart) : undefined, (parameters === null || parameters === void 0 ? void 0 : parameters.periodEnd) ? new Date(parameters.periodEnd) : undefined)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, (0, kpi_calculation_service_1.createkpiCalculationService)().calculateClinicKPIs(clinicId)];
                    case 4:
                        allKPIs = _b.sent();
                        return [2 /*return*/, allKPIs.filter(function (kpi) { return kpi.kpi.category === 'financial'; })];
                    case 5: return [4 /*yield*/, (0, kpi_calculation_service_1.createkpiCalculationService)().calculateClinicKPIs(clinicId)];
                    case 6:
                        operationalKPIs = _b.sent();
                        return [2 /*return*/, operationalKPIs.filter(function (kpi) { return kpi.kpi.category === 'operational'; })];
                    case 7: return [4 /*yield*/, (0, kpi_calculation_service_1.createkpiCalculationService)().calculateClinicKPIs(clinicId)];
                    case 8:
                        patientKPIs = _b.sent();
                        return [2 /*return*/, patientKPIs.filter(function (kpi) { return kpi.kpi.category === 'patient'; })];
                    case 9: return [4 /*yield*/, (0, kpi_calculation_service_1.createkpiCalculationService)().calculateClinicKPIs(clinicId)];
                    case 10:
                        staffKPIs = _b.sent();
                        return [2 /*return*/, staffKPIs.filter(function (kpi) { return kpi.kpi.category === 'staff'; })];
                    case 11: return [4 /*yield*/, (0, kpi_calculation_service_1.createkpiCalculationService)().calculateClinicKPIs(clinicId)];
                    case 12:
                        specificKPIs = _b.sent();
                        return [2 /*return*/, specificKPIs.find(function (kpi) { return kpi.kpi.name === kpiSource; }) || null];
                }
            });
        });
    };
    /**
     * Fetch data using custom query
     */
    WidgetService.prototype.fetchQueryData = function (query, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var predefinedQueries, _a, data, error, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        predefinedQueries = {
                            'monthly_revenue_trend': "\n          SELECT \n            DATE_TRUNC('month', created_at) as month,\n            SUM(amount) as revenue\n          FROM payments \n          WHERE clinic_id = $1 AND status = 'completed'\n            AND created_at >= $2 AND created_at <= $3\n          GROUP BY month\n          ORDER BY month\n        ",
                            'appointment_status_distribution': "\n          SELECT \n            status,\n            COUNT(*) as count\n          FROM appointments \n          WHERE clinic_id = $1\n            AND scheduled_at >= $2 AND scheduled_at <= $3\n          GROUP BY status\n        ",
                            'top_services': "\n          SELECT \n            s.name,\n            COUNT(a.id) as appointment_count,\n            SUM(p.amount) as revenue\n          FROM appointments a\n          JOIN services s ON a.service_id = s.id\n          LEFT JOIN payments p ON a.id = p.appointment_id\n          WHERE a.clinic_id = $1\n            AND a.scheduled_at >= $2 AND a.scheduled_at <= $3\n          GROUP BY s.id, s.name\n          ORDER BY appointment_count DESC\n          LIMIT 10\n        "
                        };
                        if (!predefinedQueries[query]) {
                            throw new Error("Query '".concat(query, "' not found"));
                        }
                        return [4 /*yield*/, this.supabase
                                .rpc('execute_dashboard_query', {
                                query_name: query,
                                query_params: parameters || {}
                            })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_6 = _b.sent();
                        logger_1.logger.error('Error executing query:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch data from external API
     */
    WidgetService.prototype.fetchAPIData = function (apiEndpoint, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch(apiEndpoint, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(parameters || {})
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("API request failed: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_7 = _a.sent();
                        logger_1.logger.error('Error fetching API data:', error_7);
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch static data
     */
    WidgetService.prototype.fetchStaticData = function (dataSource) {
        var staticData = {
            'sample_chart_data': [
                { name: 'Jan', value: 400 },
                { name: 'Feb', value: 300 },
                { name: 'Mar', value: 600 },
                { name: 'Apr', value: 800 },
                { name: 'May', value: 500 }
            ],
            'sample_kpi_data': {
                revenue: 15000,
                patients: 120,
                appointments: 450,
                satisfaction: 4.8
            }
        };
        return staticData[dataSource] || null;
    };
    /**
     * Start automatic data refresh for a widget
     */
    WidgetService.prototype.startWidgetDataRefresh = function (widget) {
        var _this = this;
        if (!widget.dataSource.refreshInterval || widget.dataSource.refreshInterval <= 0) {
            return;
        }
        var timer = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getWidgetData(widget.id, true)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        logger_1.logger.error("Error refreshing widget ".concat(widget.id, ":"), error_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, widget.dataSource.refreshInterval * 1000);
        this.refreshTimers.set(widget.id, timer);
    };
    /**
     * Stop automatic data refresh for a widget
     */
    WidgetService.prototype.stopWidgetDataRefresh = function (widgetId) {
        var timer = this.refreshTimers.get(widgetId);
        if (timer) {
            clearInterval(timer);
            this.refreshTimers.delete(widgetId);
        }
    };
    /**
     * Initialize widgets for a dashboard (start data refresh)
     */
    WidgetService.prototype.initializeDashboardWidgets = function (dashboardId) {
        return __awaiter(this, void 0, void 0, function () {
            var widgets, _i, widgets_1, widget;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDashboardWidgets(dashboardId)];
                    case 1:
                        widgets = _a.sent();
                        _i = 0, widgets_1 = widgets;
                        _a.label = 2;
                    case 2:
                        if (!(_i < widgets_1.length)) return [3 /*break*/, 5];
                        widget = widgets_1[_i];
                        this.startWidgetDataRefresh(widget);
                        // Pre-load data
                        return [4 /*yield*/, this.getWidgetData(widget.id)];
                    case 3:
                        // Pre-load data
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cleanup widgets (stop all timers)
     */
    WidgetService.prototype.cleanup = function () {
        for (var _i = 0, _a = this.refreshTimers.values(); _i < _a.length; _i++) {
            var timer = _a[_i];
            clearInterval(timer);
        }
        this.refreshTimers.clear();
        this.dataCache.clear();
    };
    /**
     * Get widget templates for quick setup
     */
    WidgetService.prototype.getWidgetTemplates = function () {
        return [
            {
                title: 'Receita Mensal',
                type: 'kpi_card',
                dataSource: {
                    type: 'kpi',
                    source: 'financial.monthly_revenue',
                    refreshInterval: 300,
                    cacheEnabled: true
                },
                position: { x: 0, y: 0, width: 3, height: 2 },
                styling: {
                    backgroundColor: '#10b981',
                    textColor: '#ffffff'
                },
                isVisible: true
            },
            {
                title: 'Novos Pacientes',
                type: 'kpi_card',
                dataSource: {
                    type: 'kpi',
                    source: 'patients.new_patients',
                    refreshInterval: 300,
                    cacheEnabled: true
                },
                position: { x: 3, y: 0, width: 3, height: 2 },
                styling: {
                    backgroundColor: '#3b82f6',
                    textColor: '#ffffff'
                },
                isVisible: true
            },
            {
                title: 'Taxa de Ocupação',
                type: 'gauge_chart',
                dataSource: {
                    type: 'kpi',
                    source: 'operations.occupancy_rate',
                    refreshInterval: 300,
                    cacheEnabled: true
                },
                position: { x: 6, y: 0, width: 3, height: 4 },
                chartOptions: {
                    showLegend: false,
                    showGrid: false,
                    colors: ['#10b981', '#f59e0b', '#ef4444']
                },
                isVisible: true
            },
            {
                title: 'Tendência de Receita',
                type: 'line_chart',
                dataSource: {
                    type: 'query',
                    source: 'monthly_revenue_trend',
                    refreshInterval: 600,
                    cacheEnabled: true
                },
                position: { x: 0, y: 2, width: 6, height: 4 },
                chartOptions: {
                    showLegend: true,
                    showGrid: true,
                    colors: ['#10b981'],
                    animation: true
                },
                isVisible: true
            },
            {
                title: 'Status dos Agendamentos',
                type: 'pie_chart',
                dataSource: {
                    type: 'query',
                    source: 'appointment_status_distribution',
                    refreshInterval: 300,
                    cacheEnabled: true
                },
                position: { x: 9, y: 0, width: 3, height: 4 },
                chartOptions: {
                    showLegend: true,
                    colors: ['#10b981', '#f59e0b', '#ef4444', '#6b7280']
                },
                isVisible: true
            }
        ];
    };
    return WidgetService;
}());
exports.WidgetService = WidgetService;
// Export singleton instance
var createwidgetService = function () { return new WidgetService(); };
exports.createwidgetService = createwidgetService;
