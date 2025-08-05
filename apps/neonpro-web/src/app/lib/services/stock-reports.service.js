"use strict";
/**
 * Story 11.4: Stock Reports Service
 * Servi�o para gerenciamento de relat�rios de estoque
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
exports.StockReportsService = void 0;
var server_1 = require("@/lib/supabase/server");
var StockReportsService = /** @class */ (function () {
    function StockReportsService() {
    }
    StockReportsService.prototype.getSupabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var supabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, (0, server_1.createClient)()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // ==========================================
    // CONFIGURA��ES DE RELAT�RIOS
    // ==========================================
    /**
     * Criar novo relat�rio personalizado
     */
    StockReportsService.prototype.createCustomReport = function (data, user_id) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, report, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, supabase
                                .from('stock_report_configs')
                                .insert(__assign(__assign({}, data), { user_id: user_id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }))
                                .select()
                                .single()];
                    case 3:
                        _a = _b.sent(), report = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, { success: true, data: report }];
                    case 4:
                        error_1 = _b.sent();
                        console.error('Error creating custom report:', error_1);
                        return [2 /*return*/, { success: false, error: String((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || error_1) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Listar relat�rios da cl�nica
     */
    StockReportsService.prototype.getClinicReports = function (clinic_id, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        query = supabase
                            .from('stock_report_configs')
                            .select('*')
                            .eq('clinic_id', clinic_id)
                            .order('created_at', { ascending: false });
                        if (filters === null || filters === void 0 ? void 0 : filters.type) {
                            query = query.eq('report_type', filters.type);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.user_id) {
                            query = query.eq('user_id', filters.user_id);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.active_only) {
                            query = query.eq('is_active', true);
                        }
                        return [4 /*yield*/, query];
                    case 3:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, { success: true, data: data }];
                    case 4:
                        error_2 = _b.sent();
                        console.error('Error fetching clinic reports:', error_2);
                        return [2 /*return*/, { success: false, error: String((error_2 === null || error_2 === void 0 ? void 0 : error_2.message) || error_2) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Atualizar configura��o de relat�rio
     */
    StockReportsService.prototype.updateReportConfig = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, supabase
                                .from('stock_report_configs')
                                .update(__assign(__assign({}, updates), { updated_at: new Date().toISOString() }))
                                .eq('id', id)
                                .select()
                                .single()];
                    case 3:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, { success: true, data: data }];
                    case 4:
                        error_3 = _b.sent();
                        console.error('Error updating report config:', error_3);
                        return [2 /*return*/, { success: false, error: String((error_3 === null || error_3 === void 0 ? void 0 : error_3.message) || error_3) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deletar configura��o de relat�rio
     */
    StockReportsService.prototype.deleteReportConfig = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, error, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, supabase
                                .from('stock_report_configs')
                                .delete()
                                .eq('id', id)];
                    case 3:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_4 = _a.sent();
                        console.error('Error deleting report config:', error_4);
                        return [2 /*return*/, { success: false, error: String((error_4 === null || error_4 === void 0 ? void 0 : error_4.message) || error_4) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // GERA��O DE RELAT�RIOS
    // ==========================================
    /**
     * Gerar relat�rio de consumo
     */
    StockReportsService.prototype.generateConsumptionReport = function (clinic_id, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, usageData, error, reportData, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        query = supabase
                            .from('material_usage')
                            .select("\n          *,\n          profiles:user_id (name, email),\n          appointments:appointment_id (\n            id,\n            appointment_date,\n            status\n          )\n        ")
                            .eq('clinic_id', clinic_id);
                        // Aplicar filtros de data
                        if (filters.dateRange) {
                            query = query
                                .gte('created_at', filters.dateRange.start.toISOString())
                                .lte('created_at', filters.dateRange.end.toISOString());
                        }
                        return [4 /*yield*/, query];
                    case 3:
                        _a = _b.sent(), usageData = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        reportData = {
                            title: 'Relat�rio de Consumo de Materiais',
                            generated_at: new Date().toISOString(),
                            period: filters.dateRange ? {
                                start: filters.dateRange.start.toISOString(),
                                end: filters.dateRange.end.toISOString()
                            } : null,
                            total_items: (usageData === null || usageData === void 0 ? void 0 : usageData.length) || 0,
                            total_cost: this.calculateTotalCost(usageData || []),
                            by_category: this.groupByCategory(usageData || []),
                            by_user: this.groupByUser(usageData || []),
                            by_date: this.groupByDate(usageData || []),
                            top_consumed: this.getTopConsumed(usageData || []),
                            data: usageData
                        };
                        return [2 /*return*/, { success: true, data: reportData }];
                    case 4:
                        error_5 = _b.sent();
                        console.error('Error generating consumption report:', error_5);
                        return [2 /*return*/, { success: false, error: String((error_5 === null || error_5 === void 0 ? void 0 : error_5.message) || error_5) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gerar relat�rio de valoriza��o
     */
    StockReportsService.prototype.generateValuationReport = function (clinic_id, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, reportData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        try {
                            reportData = {
                                title: 'Relat�rio de Valoriza��o de Estoque',
                                generated_at: new Date().toISOString(),
                                period: filters.dateRange ? {
                                    start: filters.dateRange.start.toISOString(),
                                    end: filters.dateRange.end.toISOString()
                                } : null,
                                total_value: 50000, // Simula��o
                                categories: [
                                    { name: 'Medicamentos', value: 25000, percentage: 50 },
                                    { name: 'Materiais', value: 15000, percentage: 30 },
                                    { name: 'Equipamentos', value: 10000, percentage: 20 }
                                ],
                                trend: {
                                    current_month: 50000,
                                    previous_month: 48000,
                                    variation: 4.17,
                                    trend: 'up'
                                }
                            };
                            return [2 /*return*/, { success: true, data: reportData }];
                        }
                        catch (error) {
                            console.error('Error generating valuation report:', error);
                            return [2 /*return*/, { success: false, error: String((error === null || error === void 0 ? void 0 : error.message) || error) }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gerar relat�rio de movimenta��o
     */
    StockReportsService.prototype.generateMovementReport = function (clinic_id, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, movements, error, reportData, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        query = supabase
                            .from('material_usage')
                            .select('*')
                            .eq('clinic_id', clinic_id);
                        if (filters.dateRange) {
                            query = query
                                .gte('created_at', filters.dateRange.start.toISOString())
                                .lte('created_at', filters.dateRange.end.toISOString());
                        }
                        return [4 /*yield*/, query];
                    case 3:
                        _a = _b.sent(), movements = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        reportData = {
                            title: 'Relat�rio de Movimenta��o de Estoque',
                            generated_at: new Date().toISOString(),
                            period: filters.dateRange ? {
                                start: filters.dateRange.start.toISOString(),
                                end: filters.dateRange.end.toISOString()
                            } : null,
                            total_movements: (movements === null || movements === void 0 ? void 0 : movements.length) || 0,
                            by_type: {
                                outbound: (movements === null || movements === void 0 ? void 0 : movements.length) || 0, // Todas s�o sa�das no material_usage
                                inbound: 0 // N�o temos entradas registradas ainda
                            },
                            by_category: this.groupByCategory(movements || []),
                            daily_movement: this.groupByDate(movements || []),
                            data: movements
                        };
                        return [2 /*return*/, { success: true, data: reportData }];
                    case 4:
                        error_6 = _b.sent();
                        console.error('Error generating movement report:', error_6);
                        return [2 /*return*/, { success: false, error: String((error_6 === null || error_6 === void 0 ? void 0 : error_6.message) || error_6) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gerar relat�rio de vencimentos
     */
    StockReportsService.prototype.generateExpirationReport = function (clinic_id, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, today, next30Days, next90Days, reportData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        try {
                            today = new Date();
                            next30Days = new Date();
                            next30Days.setDate(today.getDate() + 30);
                            next90Days = new Date();
                            next90Days.setDate(today.getDate() + 90);
                            reportData = {
                                title: 'Relat�rio de Produtos Pr�ximos ao Vencimento',
                                generated_at: new Date().toISOString(),
                                categories: {
                                    expired: {
                                        count: 2,
                                        total_value: 500,
                                        items: [
                                            { name: 'Medicamento A', expiry_date: '2024-12-01', quantity: 5, value: 250 },
                                            { name: 'Material B', expiry_date: '2024-11-15', quantity: 3, value: 250 }
                                        ]
                                    },
                                    expiring_30_days: {
                                        count: 5,
                                        total_value: 1500,
                                        items: [
                                            { name: 'Produto C', expiry_date: next30Days.toISOString().split('T')[0], quantity: 10, value: 500 },
                                            { name: 'Produto D', expiry_date: next30Days.toISOString().split('T')[0], quantity: 8, value: 400 },
                                            { name: 'Produto E', expiry_date: next30Days.toISOString().split('T')[0], quantity: 12, value: 600 }
                                        ]
                                    },
                                    expiring_90_days: {
                                        count: 8,
                                        total_value: 3200,
                                        items: []
                                    }
                                },
                                summary: {
                                    total_items_at_risk: 15,
                                    total_value_at_risk: 5200,
                                    recommendations: [
                                        'Revisar pol�tica de compras para produtos com alta rotatividade',
                                        'Implementar sistema FIFO (First In, First Out)',
                                        'Considerar promo��es para produtos pr�ximos ao vencimento'
                                    ]
                                }
                            };
                            return [2 /*return*/, { success: true, data: reportData }];
                        }
                        catch (error) {
                            console.error('Error generating expiration report:', error);
                            return [2 /*return*/, { success: false, error: String((error === null || error === void 0 ? void 0 : error.message) || error) }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // M�TRICAS DE PERFORMANCE
    // ==========================================
    /**
     * Calcular m�tricas de performance
     */
    StockReportsService.prototype.calculatePerformanceMetrics = function (clinic_id_1) {
        return __awaiter(this, arguments, void 0, function (clinic_id, date) {
            var startDate, supabase, _a, usageData, error, alertsData, totalValue, activeAlerts, criticalAlerts, metrics, _b, savedMetrics, saveError, error_7;
            if (date === void 0) { date = new Date(); }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        startDate = new Date(date);
                        startDate.setMonth(startDate.getMonth() - 1);
                        return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _c.sent();
                        return [4 /*yield*/, supabase
                                .from('material_usage')
                                .select('*')
                                .eq('clinic_id', clinic_id)
                                .gte('created_at', startDate.toISOString())
                                .lte('created_at', date.toISOString())];
                    case 2:
                        _a = _c.sent(), usageData = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [4 /*yield*/, supabase
                                .from('stock_alerts')
                                .select('alert_severity, status')
                                .eq('clinic_id', clinic_id)
                                .eq('status', 'active')];
                    case 3:
                        alertsData = (_c.sent()).data;
                        totalValue = this.calculateTotalCost(usageData || []);
                        activeAlerts = (alertsData === null || alertsData === void 0 ? void 0 : alertsData.length) || 0;
                        criticalAlerts = (alertsData === null || alertsData === void 0 ? void 0 : alertsData.filter(function (a) { return a.alert_severity === 'critical'; }).length) || 0;
                        metrics = {
                            clinicId: clinic_id,
                            metricDate: date,
                            totalValue: totalValue,
                            turnoverRate: this.calculateTurnoverRate(usageData || []),
                            daysCoverage: this.calculateDaysCoverage(usageData || []),
                            accuracyPercentage: 95, // Simula��o
                            wasteValue: totalValue * 0.02, // 2% de desperd�cio simulado
                            wastePercentage: 2,
                            activeAlertsCount: activeAlerts,
                            criticalAlertsCount: criticalAlerts,
                            productsCount: this.getUniqueProductsCount(usageData || []),
                            outOfStockCount: 0, // Simula��o
                            lowStockCount: activeAlerts
                        };
                        return [4 /*yield*/, supabase
                                .from('stock_metrics')
                                .insert(__assign(__assign({}, metrics), { created_at: new Date().toISOString() }))
                                .select()
                                .single()];
                    case 4:
                        _b = _c.sent(), savedMetrics = _b.data, saveError = _b.error;
                        if (saveError) {
                            console.warn('Could not save metrics to database:', saveError);
                        }
                        return [2 /*return*/, { success: true, data: metrics }];
                    case 5:
                        error_7 = _c.sent();
                        console.error('Error calculating performance metrics:', error_7);
                        return [2 /*return*/, { success: false, error: String((error_7 === null || error_7 === void 0 ? void 0 : error_7.message) || error_7) }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Obter hist�rico de m�tricas
     */
    StockReportsService.prototype.getMetricsHistory = function (clinic_id_1) {
        return __awaiter(this, arguments, void 0, function (clinic_id, days) {
            var supabase, since, _a, data, error, error_8;
            if (days === void 0) { days = 30; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        since = new Date();
                        since.setDate(since.getDate() - days);
                        return [4 /*yield*/, supabase
                                .from('stock_metrics')
                                .select('*')
                                .eq('clinic_id', clinic_id)
                                .gte('metric_date', since.toISOString())
                                .order('metric_date', { ascending: true })];
                    case 3:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, { success: true, data: data }];
                    case 4:
                        error_8 = _b.sent();
                        console.error('Error fetching metrics history:', error_8);
                        return [2 /*return*/, { success: false, error: String((error_8 === null || error_8 === void 0 ? void 0 : error_8.message) || error_8) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // UTILIT�RIOS PRIVADOS
    // ==========================================
    StockReportsService.prototype.calculateTotalCost = function (usageData) {
        return usageData.reduce(function (total, item) {
            return total + (item.cost_per_unit || 0) * (item.quantity_used || 0);
        }, 0);
    };
    StockReportsService.prototype.groupByCategory = function (usageData) {
        var grouped = usageData.reduce(function (acc, item) {
            var category = item.material_category || 'Outros';
            if (!acc[category]) {
                acc[category] = {
                    count: 0,
                    total_cost: 0,
                    items: []
                };
            }
            acc[category].count += 1;
            acc[category].total_cost += (item.cost_per_unit || 0) * (item.quantity_used || 0);
            acc[category].items.push(item);
            return acc;
        }, {});
        return grouped;
    };
    StockReportsService.prototype.groupByUser = function (usageData) {
        var grouped = usageData.reduce(function (acc, item) {
            var userId = item.user_id || 'Unknown';
            if (!acc[userId]) {
                acc[userId] = {
                    count: 0,
                    total_cost: 0,
                    items: []
                };
            }
            acc[userId].count += 1;
            acc[userId].total_cost += (item.cost_per_unit || 0) * (item.quantity_used || 0);
            acc[userId].items.push(item);
            return acc;
        }, {});
        return grouped;
    };
    StockReportsService.prototype.groupByDate = function (usageData) {
        var grouped = usageData.reduce(function (acc, item) {
            var _a;
            var date = ((_a = item.created_at) === null || _a === void 0 ? void 0 : _a.split('T')[0]) || 'Unknown';
            if (!acc[date]) {
                acc[date] = {
                    count: 0,
                    total_cost: 0,
                    items: []
                };
            }
            acc[date].count += 1;
            acc[date].total_cost += (item.cost_per_unit || 0) * (item.quantity_used || 0);
            acc[date].items.push(item);
            return acc;
        }, {});
        return grouped;
    };
    StockReportsService.prototype.getTopConsumed = function (usageData, limit) {
        if (limit === void 0) { limit = 10; }
        var grouped = usageData.reduce(function (acc, item) {
            var key = "".concat(item.material_name, "_").concat(item.material_type);
            if (!acc[key]) {
                acc[key] = {
                    material_name: item.material_name,
                    material_type: item.material_type,
                    total_quantity: 0,
                    total_cost: 0,
                    usage_count: 0
                };
            }
            acc[key].total_quantity += item.quantity_used || 0;
            acc[key].total_cost += (item.cost_per_unit || 0) * (item.quantity_used || 0);
            acc[key].usage_count += 1;
            return acc;
        }, {});
        return Object.values(grouped)
            .sort(function (a, b) { return b.total_quantity - a.total_quantity; })
            .slice(0, limit);
    };
    StockReportsService.prototype.calculateTurnoverRate = function (usageData) {
        // Simula��o de c�lculo de turnover rate
        // Em uma implementa��o real, seria: (Custo dos Produtos Vendidos / Estoque M�dio)
        var totalCost = this.calculateTotalCost(usageData);
        var estimatedStockValue = 50000; // Simula��o
        return totalCost / estimatedStockValue;
    };
    StockReportsService.prototype.calculateDaysCoverage = function (usageData) {
        // Simula��o de c�lculo de cobertura em dias
        // Em uma implementa��o real, seria baseado no estoque atual vs consumo m�dio di�rio
        var dailyAverage = usageData.length / 30; // Assumindo 30 dias
        var estimatedStockQuantity = 1000; // Simula��o
        return estimatedStockQuantity / (dailyAverage || 1);
    };
    StockReportsService.prototype.getUniqueProductsCount = function (usageData) {
        var uniqueProducts = new Set(usageData.map(function (item) { return "".concat(item.material_name, "_").concat(item.material_type); }));
        return uniqueProducts.size;
    };
    return StockReportsService;
}());
exports.StockReportsService = StockReportsService;
