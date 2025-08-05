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
exports.DashboardService = void 0;
var server_1 = require("@/lib/supabase/server");
var DashboardService = /** @class */ (function () {
    function DashboardService() {
    }
    DashboardService.prototype.getSupabase = function () {
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
    // Add new methods for dashboard API
    DashboardService.prototype.getAllMetrics = function () {
        return __awaiter(this, arguments, void 0, function (period) {
            var supabase, periodDays, startDate, _a, performanceLogs, error;
            if (period === void 0) { period = '30d'; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        periodDays = this.parsePeriodToDays(period);
                        startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, supabase
                                .from('dashboard_performance_logs')
                                .select('*')
                                .gte('timestamp', startDate.toISOString())
                                .order('timestamp', { ascending: false })];
                    case 2:
                        _a = _b.sent(), performanceLogs = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, performanceLogs || []];
                }
            });
        });
    };
    DashboardService.prototype.getMetricData = function (metric_1) {
        return __awaiter(this, arguments, void 0, function (metric, period) {
            var supabase, periodDays, startDate, _a, logs, error;
            if (period === void 0) { period = '30d'; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        periodDays = this.parsePeriodToDays(period);
                        startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, supabase
                                .from('dashboard_performance_logs')
                                .select('*')
                                .eq('metric_type', metric)
                                .gte('timestamp', startDate.toISOString())
                                .order('timestamp', { ascending: false })];
                    case 2:
                        _a = _b.sent(), logs = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, logs || []];
                }
            });
        });
    };
    DashboardService.prototype.recordMetric = function (userId, metric, value, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('dashboard_performance_logs')
                                .insert([{
                                    metric_type: metric,
                                    value: value,
                                    metadata: metadata || {},
                                    timestamp: new Date().toISOString(),
                                    user_id: userId
                                }])
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DashboardService.prototype.parsePeriodToDays = function (period) {
        var periodMap = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '1y': 365
        };
        return periodMap[period] || 30;
    };
    DashboardService.prototype.createDashboardConfig = function (userId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, config, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('dashboard_configurations')
                                .insert(__assign(__assign({ user_id: userId }, data), { created_at: new Date().toISOString(), updated_at: new Date().toISOString() }))
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), config = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, config];
                }
            });
        });
    };
    DashboardService.prototype.getDashboardConfig = function (userId, configId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        query = supabase
                            .from('dashboard_configurations')
                            .select("\n        *,\n        dashboard_widgets (\n          *\n        )\n      ")
                            .eq('user_id', userId);
                        if (configId) {
                            query = query.eq('id', configId);
                        }
                        else {
                            query = query.eq('is_default', true);
                        }
                        return [4 /*yield*/, query.single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DashboardService.prototype.updateDashboardConfig = function (configId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, config, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('dashboard_configurations')
                                .update(__assign(__assign({}, data), { updated_at: new Date().toISOString() }))
                                .eq('id', configId)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), config = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, config];
                }
            });
        });
    };
    DashboardService.prototype.deleteDashboardConfig = function (configId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('dashboard_configurations')
                                .delete()
                                .eq('id', configId)];
                    case 2:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    };
    // Widget Management
    DashboardService.prototype.createWidget = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, widget, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('dashboard_widgets')
                                .insert(__assign(__assign({}, data), { created_at: new Date().toISOString(), updated_at: new Date().toISOString() }))
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), widget = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, widget];
                }
            });
        });
    };
    DashboardService.prototype.getWidgets = function (configId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('dashboard_widgets')
                                .select('*')
                                .eq('config_id', configId)
                                .order('position_y')
                                .order('position_x')];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DashboardService.prototype.updateWidget = function (widgetId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, widget, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('dashboard_widgets')
                                .update(__assign(__assign({}, data), { updated_at: new Date().toISOString() }))
                                .eq('id', widgetId)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), widget = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, widget];
                }
            });
        });
    };
    DashboardService.prototype.deleteWidget = function (widgetId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('dashboard_widgets')
                                .delete()
                                .eq('id', widgetId)];
                    case 2:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    };
    // KPI Metrics
    DashboardService.prototype.calculateKPIMetrics = function (clinicId_1) {
        return __awaiter(this, arguments, void 0, function (clinicId, period, date) {
            var supabase, calculationDate, startDate, endDate, revenueMetrics, patientMetrics, appointmentMetrics, efficiencyMetrics;
            if (period === void 0) { period = 'daily'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        calculationDate = date || new Date();
                        startDate = this.getDateRange(calculationDate, period).start;
                        endDate = this.getDateRange(calculationDate, period).end;
                        return [4 /*yield*/, this.calculateRevenueMetrics(clinicId, startDate, endDate)];
                    case 2:
                        revenueMetrics = _a.sent();
                        return [4 /*yield*/, this.calculatePatientMetrics(clinicId, startDate, endDate)];
                    case 3:
                        patientMetrics = _a.sent();
                        return [4 /*yield*/, this.calculateAppointmentMetrics(clinicId, startDate, endDate)];
                    case 4:
                        appointmentMetrics = _a.sent();
                        return [4 /*yield*/, this.calculateEfficiencyMetrics(clinicId, startDate, endDate)];
                    case 5:
                        efficiencyMetrics = _a.sent();
                        return [2 /*return*/, {
                                revenue: revenueMetrics,
                                patients: patientMetrics,
                                appointments: appointmentMetrics,
                                efficiency: efficiencyMetrics,
                                calculation_date: calculationDate.toISOString(),
                                period: period
                            }];
                }
            });
        });
    };
    DashboardService.prototype.calculateRevenueMetrics = function (clinicId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, appointments, error, totalRevenue, averageTransaction, serviceRevenue, revenueByService;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        query = supabase
                            .from('appointments')
                            .select("\n        total_amount,\n        paid_amount,\n        appointment_date,\n        status,\n        services (\n          name,\n          price\n        )\n      ")
                            .eq('status', 'completed');
                        if (clinicId)
                            query = query.eq('clinic_id', clinicId);
                        if (startDate)
                            query = query.gte('appointment_date', startDate.toISOString());
                        if (endDate)
                            query = query.lte('appointment_date', endDate.toISOString());
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _b.sent(), appointments = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        totalRevenue = (appointments === null || appointments === void 0 ? void 0 : appointments.reduce(function (sum, apt) { return sum + (apt.paid_amount || 0); }, 0)) || 0;
                        averageTransaction = (appointments === null || appointments === void 0 ? void 0 : appointments.length) ? totalRevenue / appointments.length : 0;
                        serviceRevenue = (appointments === null || appointments === void 0 ? void 0 : appointments.reduce(function (acc, apt) {
                            if (apt.services) {
                                var serviceName = apt.services.name;
                                if (!acc[serviceName]) {
                                    acc[serviceName] = { revenue: 0, count: 0 };
                                }
                                acc[serviceName].revenue += apt.paid_amount || 0;
                                acc[serviceName].count += 1;
                            }
                            return acc;
                        }, {})) || {};
                        revenueByService = Object.entries(serviceRevenue).map(function (_a) {
                            var service = _a[0], data = _a[1];
                            return ({
                                service_name: service,
                                revenue: data.revenue,
                                count: data.count,
                                percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
                            });
                        });
                        return [2 /*return*/, {
                                daily_revenue: totalRevenue,
                                weekly_revenue: totalRevenue,
                                monthly_revenue: totalRevenue,
                                revenue_growth: 0, // TODO: Calculate growth
                                average_transaction: averageTransaction,
                                revenue_by_service: revenueByService,
                                revenue_trend: [], // TODO: Implement trend calculation
                                revenue_forecast: [] // TODO: Implement forecast
                            }];
                }
            });
        });
    };
    DashboardService.prototype.calculatePatientMetrics = function (clinicId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, patients, error, totalPatients, newPatients;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        query = supabase
                            .from('profiles')
                            .select('*');
                        if (clinicId)
                            query = query.eq('clinic_id', clinicId);
                        if (startDate)
                            query = query.gte('created_at', startDate.toISOString());
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _b.sent(), patients = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        totalPatients = (patients === null || patients === void 0 ? void 0 : patients.length) || 0;
                        newPatients = (patients === null || patients === void 0 ? void 0 : patients.filter(function (p) {
                            return new Date(p.created_at) >= (startDate || new Date(0));
                        }).length) || 0;
                        return [2 /*return*/, {
                                new_patients: newPatients,
                                returning_patients: totalPatients - newPatients,
                                total_patients: totalPatients,
                                patient_growth: 0, // TODO: Calculate growth
                                retention_rate: 0, // TODO: Calculate retention
                                lifetime_value: 0, // TODO: Calculate LTV
                                patient_segmentation: [],
                                acquisition_sources: []
                            }];
                }
            });
        });
    };
    DashboardService.prototype.calculateAppointmentMetrics = function (clinicId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, appointments, error, totalAppointments, completedAppointments, cancelledAppointments, noShowAppointments, bookingRate, cancellationRate, noShowRate;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        query = supabase
                            .from('appointments')
                            .select('*');
                        if (clinicId)
                            query = query.eq('clinic_id', clinicId);
                        if (startDate)
                            query = query.gte('appointment_date', startDate.toISOString());
                        if (endDate)
                            query = query.lte('appointment_date', endDate.toISOString());
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _b.sent(), appointments = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        totalAppointments = (appointments === null || appointments === void 0 ? void 0 : appointments.length) || 0;
                        completedAppointments = (appointments === null || appointments === void 0 ? void 0 : appointments.filter(function (a) { return a.status === 'completed'; }).length) || 0;
                        cancelledAppointments = (appointments === null || appointments === void 0 ? void 0 : appointments.filter(function (a) { return a.status === 'cancelled'; }).length) || 0;
                        noShowAppointments = (appointments === null || appointments === void 0 ? void 0 : appointments.filter(function (a) { return a.status === 'no_show'; }).length) || 0;
                        bookingRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
                        cancellationRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;
                        noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0;
                        return [2 /*return*/, {
                                total_appointments: totalAppointments,
                                booking_rate: bookingRate,
                                cancellation_rate: cancellationRate,
                                no_show_rate: noShowRate,
                                utilization_rate: 0, // TODO: Calculate utilization
                                average_booking_lead_time: 0, // TODO: Calculate lead time
                                appointment_types: [],
                                time_slot_analysis: []
                            }];
                }
            });
        });
    };
    DashboardService.prototype.calculateEfficiencyMetrics = function (clinicId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        // TODO: Implement efficiency calculations based on appointments, resources, and staff
                        return [2 /*return*/, {
                                staff_productivity: 0,
                                resource_utilization: 0,
                                treatment_efficiency: 0,
                                wait_time_average: 0,
                                service_completion_rate: 0,
                                cost_per_patient: 0,
                                profit_margin: 0,
                                operational_efficiency: 0
                            }];
                }
            });
        });
    };
    // Alert Management
    DashboardService.prototype.createAlert = function (userId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, alert, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('dashboard_alerts')
                                .insert(__assign(__assign({ user_id: userId }, data), { is_active: true, trigger_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }))
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), alert = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, alert];
                }
            });
        });
    };
    DashboardService.prototype.getAlerts = function (userId, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        query = supabase
                            .from('dashboard_alerts')
                            .select('*')
                            .eq('user_id', userId);
                        if (clinicId)
                            query = query.eq('clinic_id', clinicId);
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DashboardService.prototype.updateAlert = function (alertId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, alert, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('dashboard_alerts')
                                .update(__assign(__assign({}, data), { updated_at: new Date().toISOString() }))
                                .eq('id', alertId)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), alert = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, alert];
                }
            });
        });
    };
    DashboardService.prototype.deleteAlert = function (alertId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('dashboard_alerts')
                                .delete()
                                .eq('id', alertId)];
                    case 2:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    };
    // Performance Logging
    DashboardService.prototype.logPerformance = function (userId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, log, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('dashboard_performance_logs')
                                .insert(__assign(__assign({ user_id: userId }, data), { timestamp: new Date().toISOString() }))
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), log = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, log];
                }
            });
        });
    };
    DashboardService.prototype.getPerformanceLogs = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, limit) {
            var supabase, _a, data, error;
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('dashboard_performance_logs')
                                .select('*')
                                .eq('user_id', userId)
                                .order('timestamp', { ascending: false })
                                .limit(limit)];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // Cache Management
    DashboardService.prototype.getCachedData = function (cacheKey, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        query = supabase
                            .from('dashboard_cache')
                            .select('*')
                            .eq('cache_key', cacheKey)
                            .gt('expires_at', new Date().toISOString());
                        if (clinicId)
                            query = query.eq('clinic_id', clinicId);
                        return [4 /*yield*/, query.single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            return [2 /*return*/, null];
                        return [2 /*return*/, data === null || data === void 0 ? void 0 : data.cache_data];
                }
            });
        });
    };
    DashboardService.prototype.setCachedData = function (cacheKey_1, data_1) {
        return __awaiter(this, arguments, void 0, function (cacheKey, data, expiresInMinutes, clinicId) {
            var supabase, expiresAt, error;
            if (expiresInMinutes === void 0) { expiresInMinutes = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        expiresAt = new Date();
                        expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
                        return [4 /*yield*/, supabase
                                .from('dashboard_cache')
                                .upsert({
                                cache_key: cacheKey,
                                cache_data: data,
                                expires_at: expiresAt.toISOString(),
                                clinic_id: clinicId,
                                created_at: new Date().toISOString()
                            })];
                    case 2:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    };
    // Utility Methods
    DashboardService.prototype.getDateRange = function (date, period) {
        var start = new Date(date);
        var end = new Date(date);
        switch (period) {
            case 'daily':
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case 'weekly':
                var day = start.getDay();
                start.setDate(start.getDate() - day);
                start.setHours(0, 0, 0, 0);
                end.setDate(start.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                break;
            case 'monthly':
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                end.setMonth(end.getMonth() + 1);
                end.setDate(0);
                end.setHours(23, 59, 59, 999);
                break;
            case 'yearly':
                start.setMonth(0, 1);
                start.setHours(0, 0, 0, 0);
                end.setMonth(11, 31);
                end.setHours(23, 59, 59, 999);
                break;
        }
        return { start: start, end: end };
    };
    // Dashboard Summary
    DashboardService.prototype.getDashboardSummary = function (userId, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, cacheKey, cached, metrics, alerts, summary;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        cacheKey = "dashboard_summary_".concat(userId, "_").concat(clinicId || 'all');
                        return [4 /*yield*/, this.getCachedData(cacheKey, clinicId)];
                    case 2:
                        cached = _a.sent();
                        if (cached) {
                            return [2 /*return*/, cached];
                        }
                        return [4 /*yield*/, this.calculateKPIMetrics(clinicId)];
                    case 3:
                        metrics = _a.sent();
                        return [4 /*yield*/, this.getAlerts(userId, clinicId)];
                    case 4:
                        alerts = _a.sent();
                        summary = {
                            total_revenue: metrics.revenue.daily_revenue,
                            total_patients: metrics.patients.total_patients,
                            total_appointments: metrics.appointments.total_appointments,
                            efficiency_score: metrics.efficiency.operational_efficiency,
                            growth_rate: metrics.revenue.revenue_growth,
                            alert_count: (alerts === null || alerts === void 0 ? void 0 : alerts.filter(function (a) { return a.is_active; }).length) || 0,
                            last_updated: new Date().toISOString(),
                            performance_score: 100 // TODO: Calculate performance score
                        };
                        // Cache for 5 minutes
                        return [4 /*yield*/, this.setCachedData(cacheKey, summary, 5, clinicId)];
                    case 5:
                        // Cache for 5 minutes
                        _a.sent();
                        return [2 /*return*/, summary];
                }
            });
        });
    };
    // Real-time data updates
    DashboardService.prototype.getWidgetData = function (widgetId, query) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, widget, error, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('dashboard_widgets')
                                .select('*')
                                .eq('id', widgetId)
                                .single()];
                    case 2:
                        _a = _b.sent(), widget = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [4 /*yield*/, this.generateWidgetData(widget, query)];
                    case 3:
                        data = _b.sent();
                        return [2 /*return*/, {
                                widget_id: widgetId,
                                data: data,
                                metadata: {
                                    last_updated: new Date().toISOString(),
                                    data_points: Array.isArray(data) ? data.length : 1,
                                    calculation_time: 0
                                }
                            }];
                }
            });
        });
    };
    DashboardService.prototype.generateWidgetData = function (widget, query) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, data_source, configuration, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        data_source = widget.data_source, configuration = widget.configuration;
                        _a = data_source;
                        switch (_a) {
                            case 'revenue': return [3 /*break*/, 2];
                            case 'patients': return [3 /*break*/, 4];
                            case 'appointments': return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 2: return [4 /*yield*/, this.getRevenueData(configuration, query)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4: return [4 /*yield*/, this.getPatientData(configuration, query)];
                    case 5: return [2 /*return*/, _b.sent()];
                    case 6: return [4 /*yield*/, this.getAppointmentData(configuration, query)];
                    case 7: return [2 /*return*/, _b.sent()];
                    case 8: return [2 /*return*/, []];
                }
            });
        });
    };
    DashboardService.prototype.getRevenueData = function (config, query) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        // TODO: Implement revenue data generation
                        return [2 /*return*/, {
                                total: 0,
                                trend: [],
                                breakdown: []
                            }];
                }
            });
        });
    };
    DashboardService.prototype.getPatientData = function (config, query) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        // TODO: Implement patient data generation
                        return [2 /*return*/, {
                                total: 0,
                                new: 0,
                                returning: 0,
                                segments: []
                            }];
                }
            });
        });
    };
    DashboardService.prototype.getAppointmentData = function (config, query) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        // TODO: Implement appointment data generation
                        return [2 /*return*/, {
                                total: 0,
                                completed: 0,
                                cancelled: 0,
                                upcoming: 0
                            }];
                }
            });
        });
    };
    return DashboardService;
}());
exports.DashboardService = DashboardService;
