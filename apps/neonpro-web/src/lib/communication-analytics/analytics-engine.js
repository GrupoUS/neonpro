"use strict";
/**
 * Communication Analytics Engine
 *
 * Sistema avançado de análise de comunicação para NeonPro Healthcare System
 * Fornece métricas detalhadas, ROI tracking, e insights de performance para
 * todas as comunicações com pacientes (SMS, Email, WhatsApp, Push).
 *
 * Features:
 * - Multi-channel analytics com métricas unificadas
 * - ROI calculation com attribution modeling
 * - Performance benchmarking contra padrões da indústria
 * - Análise de tendências temporais e sazonais
 * - Real-time metrics com alertas automáticos
 * - LGPD compliance para analytics de comunicação
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 * @since 2025-01-30
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
var _r, _s, _t;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createcommunicationAnalytics = exports.CommunicationAnalyticsEngine = void 0;
var server_1 = require("@/lib/supabase/server");
var CommunicationAnalyticsEngine = /** @class */ (function () {
    function CommunicationAnalyticsEngine() {
        this.supabase = (0, server_1.createClient)();
    }
    /**
     * Coleta e processa eventos de comunicação para análise
     */
    CommunicationAnalyticsEngine.prototype.collectCommunicationEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var eventData, error_1;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 4, , 5]);
                        eventData = {
                            event_id: event.id,
                            channel_type: event.channel,
                            message_type: event.messageType,
                            patient_id: event.patientId,
                            clinic_id: event.clinicId,
                            sent_at: event.sentAt.toISOString(),
                            delivered_at: (_a = event.deliveredAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                            opened_at: (_b = event.openedAt) === null || _b === void 0 ? void 0 : _b.toISOString(),
                            clicked_at: (_c = event.clickedAt) === null || _c === void 0 ? void 0 : _c.toISOString(),
                            responded_at: (_d = event.respondedAt) === null || _d === void 0 ? void 0 : _d.toISOString(),
                            cost: event.cost,
                            revenue_attributed: event.revenueAttributed,
                            metadata: event.metadata,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        };
                        return [4 /*yield*/, this.supabase
                                .from('communication_events')
                                .insert(eventData)];
                    case 1:
                        _e.sent();
                        // Atualizar métricas em tempo real
                        return [4 /*yield*/, this.updateRealTimeMetrics(event)];
                    case 2:
                        // Atualizar métricas em tempo real
                        _e.sent();
                        // Verificar alertas
                        return [4 /*yield*/, this.checkAlerts(event)];
                    case 3:
                        // Verificar alertas
                        _e.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _e.sent();
                        console.error('Error collecting communication event:', error_1);
                        throw new Error("Failed to collect communication event: ".concat(error_1.message));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calcula métricas agregadas de comunicação
     */
    CommunicationAnalyticsEngine.prototype.calculateAnalyticsMetrics = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, channelPerformance, engagement, roi, trends, benchmarks, totalMessages, totalCost, totalRevenue, error_2;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, Promise.all([
                                this.getChannelPerformance(filter),
                                this.getEngagementMetrics(filter),
                                this.getROIMetrics(filter),
                                this.getTrendAnalysis(filter),
                                this.getBenchmarkData(filter),
                                this.getTotalMessages(filter),
                                this.getTotalCost(filter),
                                this.getTotalRevenue(filter)
                            ])];
                    case 1:
                        _a = _d.sent(), channelPerformance = _a[0], engagement = _a[1], roi = _a[2], trends = _a[3], benchmarks = _a[4], totalMessages = _a[5], totalCost = _a[6], totalRevenue = _a[7];
                        _b = {
                            id: "analytics_".concat(Date.now()),
                            clinicId: filter.clinicId,
                            dateRange: filter.dateRange,
                            channelPerformance: channelPerformance,
                            engagement: engagement,
                            roi: roi,
                            trends: trends,
                            benchmarks: benchmarks,
                            totalMessages: totalMessages,
                            totalCost: totalCost,
                            totalRevenue: totalRevenue,
                            lastUpdated: new Date()
                        };
                        _c = {
                            analysisVersion: '1.0'
                        };
                        return [4 /*yield*/, this.assessDataQuality(filter)];
                    case 2:
                        _c.dataQuality = _d.sent();
                        return [4 /*yield*/, this.calculateConfidence(filter)];
                    case 3: return [2 /*return*/, (_b.metadata = (_c.confidence = _d.sent(),
                            _c),
                            _b)];
                    case 4:
                        error_2 = _d.sent();
                        console.error('Error calculating analytics metrics:', error_2);
                        throw new Error("Failed to calculate analytics metrics: ".concat(error_2.message));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Análise de performance por canal
     */
    CommunicationAnalyticsEngine.prototype.getChannelPerformance = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error, results, error_3;
            var _this = this;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        query = this.supabase
                            .from('communication_events')
                            .select("\n          channel_type,\n          COUNT(*) as total_sent,\n          COUNT(delivered_at) as delivered,\n          COUNT(opened_at) as opened,\n          COUNT(clicked_at) as clicked,\n          COUNT(responded_at) as responded,\n          SUM(cost) as total_cost,\n          SUM(revenue_attributed) as total_revenue\n        ")
                            .gte('sent_at', filter.dateRange.start.toISOString())
                            .lte('sent_at', filter.dateRange.end.toISOString())
                            .eq('clinic_id', filter.clinicId)
                            .not('channel_type', 'is', null);
                        // Aplicar filtros opcionais
                        if ((_b = filter.channels) === null || _b === void 0 ? void 0 : _b.length) {
                            query.in('channel_type', filter.channels);
                        }
                        if ((_c = filter.messageTypes) === null || _c === void 0 ? void 0 : _c.length) {
                            query.in('message_type', filter.messageTypes);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _d.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [4 /*yield*/, Promise.all((data || []).map(function (channel) { return __awaiter(_this, void 0, void 0, function () {
                                var totalSent, delivered, opened, clicked, responded, totalCost, totalRevenue, timingData;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            totalSent = parseInt(channel.total_sent) || 0;
                                            delivered = parseInt(channel.delivered) || 0;
                                            opened = parseInt(channel.opened) || 0;
                                            clicked = parseInt(channel.clicked) || 0;
                                            responded = parseInt(channel.responded) || 0;
                                            totalCost = parseFloat(channel.total_cost) || 0;
                                            totalRevenue = parseFloat(channel.total_revenue) || 0;
                                            return [4 /*yield*/, this.getChannelTimingData(channel.channel_type, filter)];
                                        case 1:
                                            timingData = _b.sent();
                                            _a = {
                                                channel: channel.channel_type,
                                                totalSent: totalSent,
                                                delivered: delivered,
                                                opened: opened,
                                                clicked: clicked,
                                                responded: responded,
                                                deliveryRate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
                                                openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
                                                clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
                                                responseRate: totalSent > 0 ? (responded / totalSent) * 100 : 0
                                            };
                                            return [4 /*yield*/, this.calculateConversionRate(channel.channel_type, filter)];
                                        case 2: return [2 /*return*/, (_a.conversionRate = _b.sent(),
                                                _a.totalCost = totalCost,
                                                _a.totalRevenue = totalRevenue,
                                                _a.roi = this.calculateROI(totalRevenue, totalCost),
                                                _a.avgDeliveryTime = timingData.avgDeliveryTime,
                                                _a.avgOpenTime = timingData.avgOpenTime,
                                                _a.avgClickTime = timingData.avgClickTime,
                                                _a.costPerMessage = totalSent > 0 ? totalCost / totalSent : 0,
                                                _a.revenuePerMessage = totalSent > 0 ? totalRevenue / totalSent : 0,
                                                _a)];
                                    }
                                });
                            }); }))];
                    case 2:
                        results = _d.sent();
                        return [2 /*return*/, results];
                    case 3:
                        error_3 = _d.sent();
                        console.error('Error getting channel performance:', error_3);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Dados de timing por canal
     */
    CommunicationAnalyticsEngine.prototype.getChannelTimingData = function (channel, filter) {
        return __awaiter(this, void 0, void 0, function () {
            var data, totalDeliveryTime, totalOpenTime, totalClickTime, deliveryCount, openCount, clickCount, _i, data_1, event_1, deliveryTime, openTime, clickTime, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('communication_events')
                                .select("\n          sent_at,\n          delivered_at,\n          opened_at,\n          clicked_at\n        ")
                                .eq('channel_type', channel)
                                .gte('sent_at', filter.dateRange.start.toISOString())
                                .lte('sent_at', filter.dateRange.end.toISOString())
                                .eq('clinic_id', filter.clinicId)
                                .not('delivered_at', 'is', null)];
                    case 1:
                        data = (_a.sent()).data;
                        if (!(data === null || data === void 0 ? void 0 : data.length)) {
                            return [2 /*return*/, { avgDeliveryTime: 0, avgOpenTime: 0, avgClickTime: 0 }];
                        }
                        totalDeliveryTime = 0;
                        totalOpenTime = 0;
                        totalClickTime = 0;
                        deliveryCount = 0;
                        openCount = 0;
                        clickCount = 0;
                        for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
                            event_1 = data_1[_i];
                            if (event_1.delivered_at && event_1.sent_at) {
                                deliveryTime = new Date(event_1.delivered_at).getTime() - new Date(event_1.sent_at).getTime();
                                totalDeliveryTime += deliveryTime / 1000; // segundos
                                deliveryCount++;
                            }
                            if (event_1.opened_at && event_1.delivered_at) {
                                openTime = new Date(event_1.opened_at).getTime() - new Date(event_1.delivered_at).getTime();
                                totalOpenTime += openTime / 1000;
                                openCount++;
                            }
                            if (event_1.clicked_at && event_1.opened_at) {
                                clickTime = new Date(event_1.clicked_at).getTime() - new Date(event_1.opened_at).getTime();
                                totalClickTime += clickTime / 1000;
                                clickCount++;
                            }
                        }
                        return [2 /*return*/, {
                                avgDeliveryTime: deliveryCount > 0 ? totalDeliveryTime / deliveryCount : 0,
                                avgOpenTime: openCount > 0 ? totalOpenTime / openCount : 0,
                                avgClickTime: clickCount > 0 ? totalClickTime / clickCount : 0
                            }];
                    case 2:
                        error_4 = _a.sent();
                        return [2 /*return*/, { avgDeliveryTime: 0, avgOpenTime: 0, avgClickTime: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Métricas de engajamento consolidadas
     */
    CommunicationAnalyticsEngine.prototype.getEngagementMetrics = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, totalMessages, delivered, opened, clicked, responded, _b, engagementScore, avgResponseTime, reachRate, frequencyRate, retentionRate, satisfactionScore, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('communication_events')
                                .select("\n          COUNT(*) as total_messages,\n          COUNT(DISTINCT patient_id) as unique_patients,\n          COUNT(delivered_at) as delivered,\n          COUNT(opened_at) as opened,\n          COUNT(clicked_at) as clicked,\n          COUNT(responded_at) as responded\n        ")
                                .gte('sent_at', filter.dateRange.start.toISOString())
                                .lte('sent_at', filter.dateRange.end.toISOString())
                                .eq('clinic_id', filter.clinicId)
                                .single()];
                    case 1:
                        _a = _c.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        totalMessages = parseInt(data.total_messages) || 0;
                        delivered = parseInt(data.delivered) || 0;
                        opened = parseInt(data.opened) || 0;
                        clicked = parseInt(data.clicked) || 0;
                        responded = parseInt(data.responded) || 0;
                        return [4 /*yield*/, Promise.all([
                                this.calculateEngagementScore(filter),
                                this.calculateAvgResponseTime(filter),
                                this.calculateReachRate(filter),
                                this.calculateFrequencyRate(filter),
                                this.calculateRetentionRate(filter),
                                this.calculateSatisfactionScore(filter)
                            ])];
                    case 2:
                        _b = _c.sent(), engagementScore = _b[0], avgResponseTime = _b[1], reachRate = _b[2], frequencyRate = _b[3], retentionRate = _b[4], satisfactionScore = _b[5];
                        return [2 /*return*/, {
                                totalMessages: totalMessages,
                                uniquePatients: parseInt(data.unique_patients) || 0,
                                deliveryRate: totalMessages > 0 ? (delivered / totalMessages) * 100 : 0,
                                openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
                                clickThroughRate: opened > 0 ? (clicked / opened) * 100 : 0,
                                responseRate: totalMessages > 0 ? (responded / totalMessages) * 100 : 0,
                                engagementScore: engagementScore,
                                avgResponseTime: avgResponseTime,
                                reachRate: reachRate,
                                frequencyRate: frequencyRate,
                                retentionRate: retentionRate,
                                satisfactionScore: satisfactionScore
                            }];
                    case 3:
                        error_5 = _c.sent();
                        console.error('Error getting engagement metrics:', error_5);
                        return [2 /*return*/, {
                                totalMessages: 0,
                                uniquePatients: 0,
                                deliveryRate: 0,
                                openRate: 0,
                                clickThroughRate: 0,
                                responseRate: 0,
                                engagementScore: 0,
                                avgResponseTime: 0,
                                reachRate: 0,
                                frequencyRate: 0,
                                retentionRate: 0,
                                satisfactionScore: 0
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Tempo médio de resposta
     */
    CommunicationAnalyticsEngine.prototype.calculateAvgResponseTime = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var data, totalResponseTime, count, _i, data_2, event_2, responseTime, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('communication_events')
                                .select('sent_at, responded_at')
                                .gte('sent_at', filter.dateRange.start.toISOString())
                                .lte('sent_at', filter.dateRange.end.toISOString())
                                .eq('clinic_id', filter.clinicId)
                                .not('responded_at', 'is', null)];
                    case 1:
                        data = (_a.sent()).data;
                        if (!(data === null || data === void 0 ? void 0 : data.length))
                            return [2 /*return*/, 0];
                        totalResponseTime = 0;
                        count = 0;
                        for (_i = 0, data_2 = data; _i < data_2.length; _i++) {
                            event_2 = data_2[_i];
                            if (event_2.responded_at && event_2.sent_at) {
                                responseTime = new Date(event_2.responded_at).getTime() - new Date(event_2.sent_at).getTime();
                                totalResponseTime += responseTime / 1000; // segundos
                                count++;
                            }
                        }
                        return [2 /*return*/, count > 0 ? totalResponseTime / count : 0];
                    case 2:
                        error_6 = _a.sent();
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cálculo detalhado de ROI
     */
    CommunicationAnalyticsEngine.prototype.getROIMetrics = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, totalCost, totalRevenue, totalMessages, uniquePatients, _b, breakEvenPoint, paybackPeriod, attribution, conversionValue, lifetimeValue, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('communication_events')
                                .select("\n          SUM(cost) as total_cost,\n          SUM(revenue_attributed) as total_revenue,\n          COUNT(*) as total_messages,\n          COUNT(DISTINCT patient_id) as unique_patients\n        ")
                                .gte('sent_at', filter.dateRange.start.toISOString())
                                .lte('sent_at', filter.dateRange.end.toISOString())
                                .eq('clinic_id', filter.clinicId)
                                .single()];
                    case 1:
                        _a = _c.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        totalCost = parseFloat(data.total_cost) || 0;
                        totalRevenue = parseFloat(data.total_revenue) || 0;
                        totalMessages = parseInt(data.total_messages) || 0;
                        uniquePatients = parseInt(data.unique_patients) || 0;
                        return [4 /*yield*/, Promise.all([
                                this.calculateBreakEvenPoint(filter),
                                this.calculatePaybackPeriod(filter),
                                this.getAttributionModel(filter),
                                this.calculateConversionValue(filter),
                                this.calculateLifetimeValue(filter)
                            ])];
                    case 2:
                        _b = _c.sent(), breakEvenPoint = _b[0], paybackPeriod = _b[1], attribution = _b[2], conversionValue = _b[3], lifetimeValue = _b[4];
                        return [2 /*return*/, {
                                totalInvestment: totalCost,
                                totalRevenue: totalRevenue,
                                grossProfit: totalRevenue - totalCost,
                                roi: this.calculateROI(totalRevenue, totalCost),
                                costPerMessage: totalMessages > 0 ? totalCost / totalMessages : 0,
                                revenuePerMessage: totalMessages > 0 ? totalRevenue / totalMessages : 0,
                                costPerPatient: uniquePatients > 0 ? totalCost / uniquePatients : 0,
                                revenuePerPatient: uniquePatients > 0 ? totalRevenue / uniquePatients : 0,
                                breakEvenPoint: breakEvenPoint,
                                paybackPeriod: paybackPeriod,
                                attribution: attribution,
                                profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
                                conversionValue: conversionValue,
                                lifetimeValue: lifetimeValue
                            }];
                    case 3:
                        error_7 = _c.sent();
                        console.error('Error calculating ROI metrics:', error_7);
                        return [2 /*return*/, {
                                totalInvestment: 0,
                                totalRevenue: 0,
                                grossProfit: 0,
                                roi: 0,
                                costPerMessage: 0,
                                revenuePerMessage: 0,
                                costPerPatient: 0,
                                revenuePerPatient: 0,
                                breakEvenPoint: 0,
                                paybackPeriod: 0,
                                attribution: { firstTouch: 0, lastTouch: 0, linear: 0, timeDecay: 0 },
                                profitMargin: 0,
                                conversionValue: 0,
                                lifetimeValue: 0
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Análise de tendências temporais
     */
    CommunicationAnalyticsEngine.prototype.getTrendAnalysis = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var daysDiff, previousStart, previousEnd, previousFilter, _a, historicalMetrics, currentMetrics, timeSeriesData, seasonalAnalysis, forecasting, error_8;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 9, , 10]);
                        daysDiff = Math.ceil((filter.dateRange.end.getTime() - filter.dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
                        previousStart = new Date(filter.dateRange.start.getTime() - (daysDiff * 24 * 60 * 60 * 1000));
                        previousEnd = new Date(filter.dateRange.start.getTime() - 1);
                        previousFilter = __assign(__assign({}, filter), { dateRange: { start: previousStart, end: previousEnd } });
                        return [4 /*yield*/, Promise.all([
                                this.getCurrentPeriodMetrics(previousFilter),
                                this.getCurrentPeriodMetrics(filter)
                            ])];
                    case 1:
                        _a = _d.sent(), historicalMetrics = _a[0], currentMetrics = _a[1];
                        return [4 /*yield*/, this.getTimeSeriesData(filter)];
                    case 2:
                        timeSeriesData = _d.sent();
                        return [4 /*yield*/, this.getSeasonalAnalysis(filter)];
                    case 3:
                        seasonalAnalysis = _d.sent();
                        return [4 /*yield*/, this.getForecastingData(filter, timeSeriesData)];
                    case 4:
                        forecasting = _d.sent();
                        _b = {
                            historical: historicalMetrics,
                            current: currentMetrics,
                            timeSeries: timeSeriesData,
                            seasonal: seasonalAnalysis,
                            forecasting: forecasting,
                            growth: {
                                messagesGrowth: this.calculateGrowthRate(historicalMetrics.totalMessages, currentMetrics.totalMessages),
                                revenueGrowth: this.calculateGrowthRate(historicalMetrics.totalRevenue, currentMetrics.totalRevenue),
                                engagementGrowth: this.calculateGrowthRate(historicalMetrics.engagementScore, currentMetrics.engagementScore),
                                roiGrowth: this.calculateGrowthRate(historicalMetrics.roi, currentMetrics.roi)
                            }
                        };
                        _c = {};
                        return [4 /*yield*/, this.detectTrend(timeSeriesData.map(function (d) { return d.totalMessages; }))];
                    case 5:
                        _c.messageVolume = _d.sent();
                        return [4 /*yield*/, this.detectTrend(timeSeriesData.map(function (d) { return d.engagementScore; }))];
                    case 6:
                        _c.engagement = _d.sent();
                        return [4 /*yield*/, this.detectTrend(timeSeriesData.map(function (d) { return d.revenue; }))];
                    case 7:
                        _c.revenue = _d.sent();
                        return [4 /*yield*/, this.detectTrend(timeSeriesData.map(function (d) { return d.cost; }))];
                    case 8: return [2 /*return*/, (_b.trends = (_c.cost = _d.sent(),
                            _c),
                            _b)];
                    case 9:
                        error_8 = _d.sent();
                        console.error('Error getting trend analysis:', error_8);
                        return [2 /*return*/, {
                                historical: { totalMessages: 0, totalRevenue: 0, engagementScore: 0, roi: 0 },
                                current: { totalMessages: 0, totalRevenue: 0, engagementScore: 0, roi: 0 },
                                timeSeries: [],
                                seasonal: { monthlyPatterns: [], weeklyPatterns: [], hourlyPatterns: [] },
                                forecasting: { nextMonth: [], nextQuarter: [], nextYear: [] },
                                growth: { messagesGrowth: 0, revenueGrowth: 0, engagementGrowth: 0, roiGrowth: 0 },
                                trends: { messageVolume: 'stable', engagement: 'stable', revenue: 'stable', cost: 'stable' }
                            }];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Dados de benchmark da indústria
     */
    CommunicationAnalyticsEngine.prototype.getBenchmarkData = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var industryBenchmarks_1, clinicMetrics, comparisons, overallScore, recommendations, ranking, error_9;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        industryBenchmarks_1 = {
                            sms: { deliveryRate: 98, openRate: 90, responseRate: 45 },
                            email: { deliveryRate: 95, openRate: 25, responseRate: 3 },
                            whatsapp: { deliveryRate: 99, openRate: 95, responseRate: 60 },
                            push: { deliveryRate: 95, openRate: 15, responseRate: 2 }
                        };
                        return [4 /*yield*/, this.getChannelPerformance(filter)];
                    case 1:
                        clinicMetrics = _a.sent();
                        comparisons = clinicMetrics.map(function (metric) {
                            var benchmark = industryBenchmarks_1[metric.channel];
                            if (!benchmark) {
                                return {
                                    channel: metric.channel,
                                    deliveryRateDiff: 0,
                                    openRateDiff: 0,
                                    responseRateDiff: 0,
                                    performanceScore: 0
                                };
                            }
                            return {
                                channel: metric.channel,
                                deliveryRateDiff: metric.deliveryRate - benchmark.deliveryRate,
                                openRateDiff: metric.openRate - benchmark.openRate,
                                responseRateDiff: metric.responseRate - benchmark.responseRate,
                                performanceScore: _this.calculatePerformanceScore(metric, benchmark)
                            };
                        });
                        overallScore = this.calculateOverallBenchmarkScore(comparisons);
                        return [4 /*yield*/, this.generateBenchmarkRecommendations(comparisons)];
                    case 2:
                        recommendations = _a.sent();
                        return [4 /*yield*/, this.calculateIndustryRanking(overallScore)];
                    case 3:
                        ranking = _a.sent();
                        return [2 /*return*/, {
                                industry: industryBenchmarks_1,
                                clinic: clinicMetrics.reduce(function (acc, metric) {
                                    acc[metric.channel] = {
                                        deliveryRate: metric.deliveryRate,
                                        openRate: metric.openRate,
                                        responseRate: metric.responseRate
                                    };
                                    return acc;
                                }, {}),
                                comparisons: comparisons,
                                overallScore: overallScore,
                                recommendations: recommendations,
                                ranking: ranking
                            }];
                    case 4:
                        error_9 = _a.sent();
                        console.error('Error getting benchmark data:', error_9);
                        return [2 /*return*/, {
                                industry: {},
                                clinic: {},
                                comparisons: [],
                                overallScore: 0,
                                recommendations: [],
                                ranking: 'unknown'
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Métodos auxiliares para cálculos específicos
     */
    CommunicationAnalyticsEngine.prototype.calculateROI = function (revenue, cost) {
        if (cost === 0)
            return revenue > 0 ? 100 : 0;
        return ((revenue - cost) / cost) * 100;
    };
    CommunicationAnalyticsEngine.prototype.calculateGrowthRate = function (previous, current) {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };
    CommunicationAnalyticsEngine.prototype.calculateConversionRate = function (channel, filter) {
        return __awaiter(this, void 0, void 0, function () {
            var data, total, conversions, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('communication_events')
                                .select('*')
                                .eq('channel_type', channel)
                                .gte('sent_at', filter.dateRange.start.toISOString())
                                .lte('sent_at', filter.dateRange.end.toISOString())
                                .eq('clinic_id', filter.clinicId)];
                    case 1:
                        data = (_a.sent()).data;
                        if (!(data === null || data === void 0 ? void 0 : data.length))
                            return [2 /*return*/, 0];
                        total = data.length;
                        conversions = data.filter(function (event) { return event.revenue_attributed && event.revenue_attributed > 0; }).length;
                        return [2 /*return*/, total > 0 ? (conversions / total) * 100 : 0];
                    case 2:
                        error_10 = _a.sent();
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CommunicationAnalyticsEngine.prototype.calculateEngagementScore = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var channelPerformance, weights, totalScore, totalWeight, _i, channelPerformance_1, channel, channelScore, channelWeight, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getChannelPerformance(filter)];
                    case 1:
                        channelPerformance = _a.sent();
                        if (!channelPerformance.length)
                            return [2 /*return*/, 0];
                        weights = {
                            deliveryRate: 0.2,
                            openRate: 0.3,
                            clickRate: 0.25,
                            responseRate: 0.25
                        };
                        totalScore = 0;
                        totalWeight = 0;
                        for (_i = 0, channelPerformance_1 = channelPerformance; _i < channelPerformance_1.length; _i++) {
                            channel = channelPerformance_1[_i];
                            channelScore = (channel.deliveryRate * weights.deliveryRate +
                                channel.openRate * weights.openRate +
                                channel.clickRate * weights.clickRate +
                                channel.responseRate * weights.responseRate);
                            channelWeight = channel.totalSent;
                            totalScore += channelScore * channelWeight;
                            totalWeight += channelWeight;
                        }
                        return [2 /*return*/, totalWeight > 0 ? totalScore / totalWeight : 0];
                    case 2:
                        error_11 = _a.sent();
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Continuar na próxima parte devido ao limite de tamanho...  /**
    CommunicationAnalyticsEngine.prototype.Métodos = function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); };
    CommunicationAnalyticsEngine.prototype. = function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); };
    return CommunicationAnalyticsEngine;
}());
exports.CommunicationAnalyticsEngine = CommunicationAnalyticsEngine;
/;
async;
getTotalMessages(filter, analytics_1.AnalyticsFilter);
Promise < number > {
    try: {
        const: (_a = await this.supabase
            .from('communication_events')
            .select('COUNT(*)', { count: 'exact' })
            .gte('sent_at', filter.dateRange.start.toISOString())
            .lte('sent_at', filter.dateRange.end.toISOString())
            .eq('clinic_id', filter.clinicId), data = _a.data, _a),
        return: ((_r = data === null || data === void 0 ? void 0 : data[0]) === null || _r === void 0 ? void 0 : _r.count) || 0
    },
    catch: function (error) {
        return 0;
    }
};
async;
getTotalCost(filter, analytics_1.AnalyticsFilter);
Promise < number > {
    try: {
        const: (_b = await this.supabase
            .from('communication_events')
            .select('SUM(cost)')
            .gte('sent_at', filter.dateRange.start.toISOString())
            .lte('sent_at', filter.dateRange.end.toISOString())
            .eq('clinic_id', filter.clinicId)
            .single(), data = _b.data, _b),
        return: parseFloat(data === null || data === void 0 ? void 0 : data.sum) || 0
    },
    catch: function (error) {
        return 0;
    }
};
async;
getTotalRevenue(filter, analytics_1.AnalyticsFilter);
Promise < number > {
    try: {
        const: (_c = await this.supabase
            .from('communication_events')
            .select('SUM(revenue_attributed)')
            .gte('sent_at', filter.dateRange.start.toISOString())
            .lte('sent_at', filter.dateRange.end.toISOString())
            .eq('clinic_id', filter.clinicId)
            .single(), data = _c.data, _c),
        return: parseFloat(data === null || data === void 0 ? void 0 : data.sum) || 0
    },
    catch: function (error) {
        return 0;
    }
};
async;
assessDataQuality(filter, analytics_1.AnalyticsFilter);
Promise < number > {
    try: {
        const: (_d = await this.supabase
            .from('communication_events')
            .select("\n          COUNT(*) as total,\n          COUNT(delivered_at) as with_delivery,\n          COUNT(patient_id) as with_patient,\n          COUNT(cost) as with_cost\n        ")
            .gte('sent_at', filter.dateRange.start.toISOString())
            .lte('sent_at', filter.dateRange.end.toISOString())
            .eq('clinic_id', filter.clinicId)
            .single(), data = _d.data, _d),
        const: total = parseInt(data === null || data === void 0 ? void 0 : data.total) || 0,
        if: function (total) { }
    } === 0, return: 100,
    const: withDelivery = parseInt(data === null || data === void 0 ? void 0 : data.with_delivery) || 0,
    const: withPatient = parseInt(data === null || data === void 0 ? void 0 : data.with_patient) || 0,
    const: withCost = parseInt(data === null || data === void 0 ? void 0 : data.with_cost) || 0,
    // Score baseado na completude dos dados
    const: deliveryScore = (withDelivery / total) * 100,
    const: patientScore = (withPatient / total) * 100,
    const: costScore = (withCost / total) * 100,
    return: function (deliveryScore) { }
} + patientScore + costScore;
/ 3;
try { }
catch (error) {
    return 95; // Default score
}
async;
calculateConfidence(filter, analytics_1.AnalyticsFilter);
Promise < number > {
    try: {
        const: totalMessages = await this.getTotalMessages(filter),
        const: daysDiff = Math.ceil((filter.dateRange.end.getTime() - filter.dateRange.start.getTime()) / (1000 * 60 * 60 * 24)),
        // Confidence baseado no volume de dados e período de análise
        let: let,
        confidence: confidence, // Base confidence
        // Mais mensagens = maior confiança
        if: function (totalMessages) { }
    } > 1000,
    confidence: confidence,
    30: ,
    else: ,
    if: function (totalMessages) { }
} > 100;
confidence += 20;
if (totalMessages > 10)
    confidence += 10;
// Período maior = maior confiança
if (daysDiff >= 30)
    confidence += 20;
else if (daysDiff >= 7)
    confidence += 10;
return Math.min(confidence, 98); // Cap at 98%
try { }
catch (error) {
    return 85; // Default confidence
}
async;
getCurrentPeriodMetrics(filter, analytics_1.AnalyticsFilter);
{
    try {
        var _u = await Promise.all([
            this.getTotalMessages(filter),
            this.getTotalRevenue(filter),
            this.calculateEngagementScore(filter)
        ]), totalMessages = _u[0], totalRevenue = _u[1], engagementScore = _u[2];
        var totalCost = await this.getTotalCost(filter);
        var roi = this.calculateROI(totalRevenue, totalCost);
        return {
            totalMessages: totalMessages,
            totalRevenue: totalRevenue,
            engagementScore: engagementScore,
            roi: roi
        };
    }
    catch (error) {
        return { totalMessages: 0, totalRevenue: 0, engagementScore: 0, roi: 0 };
    }
}
async;
getTimeSeriesData(filter, analytics_1.AnalyticsFilter);
Promise < analytics_1.TimeSeriesData[] > {
    try: (_e = {
            const: daysDiff = Math.ceil((filter.dateRange.end.getTime() - filter.dateRange.start.getTime()) / (1000 * 60 * 60 * 24)),
            const: timeSeriesData,
            TimeSeriesData: analytics_1.TimeSeriesData
        },
        _e[] =  = [],
        _e.for = function (let, i, i, , daysDiff, i) {
            if (i === void 0) { i = 0; }
        },
        _e)++
};
{
    var currentDate = new Date(filter.dateRange.start.getTime() + (i * 24 * 60 * 60 * 1000));
    var nextDate = new Date(currentDate.getTime() + (24 * 60 * 60 * 1000));
    var dayFilter = __assign(__assign({}, filter), { dateRange: { start: currentDate, end: nextDate } });
    var _v = await Promise.all([
        this.getTotalMessages(dayFilter),
        this.getTotalRevenue(dayFilter),
        this.getTotalCost(dayFilter),
        this.calculateEngagementScore(dayFilter)
    ]), totalMessages = _v[0], revenue = _v[1], cost = _v[2], engagementScore = _v[3];
    var conversions = await this.getConversionsCount(dayFilter);
    var roi = this.calculateROI(revenue, cost);
    timeSeriesData.push({
        date: currentDate,
        totalMessages: totalMessages,
        engagementScore: engagementScore,
        revenue: revenue,
        cost: cost,
        roi: roi,
        conversions: conversions
    });
}
return timeSeriesData;
try { }
catch (error) {
    return [];
}
async;
getConversionsCount(filter, analytics_1.AnalyticsFilter);
Promise < number > {
    try: {
        const: (_f = await this.supabase
            .from('communication_events')
            .select('COUNT(*)', { count: 'exact' })
            .gte('sent_at', filter.dateRange.start.toISOString())
            .lte('sent_at', filter.dateRange.end.toISOString())
            .eq('clinic_id', filter.clinicId)
            .gt('revenue_attributed', 0), data = _f.data, _f),
        return: ((_s = data === null || data === void 0 ? void 0 : data[0]) === null || _s === void 0 ? void 0 : _s.count) || 0
    },
    catch: function (error) {
        return 0;
    }
};
async;
getSeasonalAnalysis(filter, analytics_1.AnalyticsFilter);
{
    try {
        // Análise mensal (últimos 12 meses se disponível)
        var monthlyPatterns = await this.getMonthlyPatterns(filter);
        // Análise semanal (por dia da semana)
        var weeklyPatterns = await this.getWeeklyPatterns(filter);
        // Análise por hora do dia
        var hourlyPatterns = await this.getHourlyPatterns(filter);
        return {
            monthlyPatterns: monthlyPatterns,
            weeklyPatterns: weeklyPatterns,
            hourlyPatterns: hourlyPatterns
        };
    }
    catch (error) {
        return { monthlyPatterns: [], weeklyPatterns: [], hourlyPatterns: [] };
    }
}
async;
getMonthlyPatterns(filter, analytics_1.AnalyticsFilter);
{
    try {
        var data = (await this.supabase
            .from('communication_events')
            .select("\n          EXTRACT(MONTH FROM sent_at) as month,\n          COUNT(*) as total_messages,\n          AVG(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) * 100 as avg_engagement,\n          SUM(revenue_attributed) as avg_revenue\n        ")
            .gte('sent_at', filter.dateRange.start.toISOString())
            .lte('sent_at', filter.dateRange.end.toISOString())
            .eq('clinic_id', filter.clinicId)).data;
        return (data || []).map(function (row) { return ({
            month: parseInt(row.month),
            avgEngagement: parseFloat(row.avg_engagement) || 0,
            avgRevenue: parseFloat(row.avg_revenue) || 0
        }); });
    }
    catch (error) {
        return [];
    }
}
async;
getWeeklyPatterns(filter, analytics_1.AnalyticsFilter);
{
    try {
        var data = (await this.supabase
            .from('communication_events')
            .select("\n          EXTRACT(DOW FROM sent_at) as day_of_week,\n          COUNT(*) as total_messages,\n          AVG(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) * 100 as avg_engagement,\n          SUM(revenue_attributed) as avg_revenue\n        ")
            .gte('sent_at', filter.dateRange.start.toISOString())
            .lte('sent_at', filter.dateRange.end.toISOString())
            .eq('clinic_id', filter.clinicId)).data;
        return (data || []).map(function (row) { return ({
            dayOfWeek: parseInt(row.day_of_week),
            avgEngagement: parseFloat(row.avg_engagement) || 0,
            avgRevenue: parseFloat(row.avg_revenue) || 0
        }); });
    }
    catch (error) {
        return [];
    }
}
async;
getHourlyPatterns(filter, analytics_1.AnalyticsFilter);
{
    try {
        var data = (await this.supabase
            .from('communication_events')
            .select("\n          EXTRACT(HOUR FROM sent_at) as hour,\n          COUNT(*) as total_messages,\n          AVG(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) * 100 as avg_engagement,\n          SUM(revenue_attributed) as avg_revenue\n        ")
            .gte('sent_at', filter.dateRange.start.toISOString())
            .lte('sent_at', filter.dateRange.end.toISOString())
            .eq('clinic_id', filter.clinicId)).data;
        return (data || []).map(function (row) { return ({
            hour: parseInt(row.hour),
            avgEngagement: parseFloat(row.avg_engagement) || 0,
            avgRevenue: parseFloat(row.avg_revenue) || 0
        }); });
    }
    catch (error) {
        return [];
    }
}
async;
getForecastingData(filter, analytics_1.AnalyticsFilter, timeSeriesData, analytics_1.TimeSeriesData[]);
{
    try {
        if (timeSeriesData.length < 7) {
            return { nextMonth: [], nextQuarter: [], nextYear: [] };
        }
        // Previsão simples baseada em média móvel e tendência linear
        var recentData = timeSeriesData.slice(-7); // Últimos 7 dias
        var avgMessages_1 = recentData.reduce(function (sum, d) { return sum + d.totalMessages; }, 0) / recentData.length;
        var avgRevenue_1 = recentData.reduce(function (sum, d) { return sum + d.revenue; }, 0) / recentData.length;
        // Tendência (slope)
        var messagesTrend_1 = this.calculateLinearTrend(recentData.map(function (d) { return d.totalMessages; }));
        var revenueTrend_1 = this.calculateLinearTrend(recentData.map(function (d) { return d.revenue; }));
        // Próximo mês (30 dias)
        var nextMonth = [];
        for (var i = 1; i <= 30; i++) {
            var predictedMessages = Math.max(0, avgMessages_1 + (messagesTrend_1 * i));
            var predictedRevenue = Math.max(0, avgRevenue_1 + (revenueTrend_1 * i));
            nextMonth.push({
                date: new Date(filter.dateRange.end.getTime() + (i * 24 * 60 * 60 * 1000)),
                predictedMessages: Math.round(predictedMessages),
                predictedRevenue: Math.round(predictedRevenue * 100) / 100
            });
        }
        // Próximo trimestre (agregado por mês)
        var nextQuarter = [1, 2, 3].map(function (month) { return ({
            month: month,
            predictedMessages: Math.round((avgMessages_1 + (messagesTrend_1 * month * 30)) * 30),
            predictedRevenue: Math.round((avgRevenue_1 + (revenueTrend_1 * month * 30)) * 30 * 100) / 100
        }); });
        // Próximo ano (agregado por trimestre)
        var nextYear = [1, 2, 3, 4].map(function (quarter) { return ({
            quarter: quarter,
            predictedMessages: Math.round((avgMessages_1 + (messagesTrend_1 * quarter * 90)) * 90),
            predictedRevenue: Math.round((avgRevenue_1 + (revenueTrend_1 * quarter * 90)) * 90 * 100) / 100
        }); });
        return { nextMonth: nextMonth, nextQuarter: nextQuarter, nextYear: nextYear };
    }
    catch (error) {
        return { nextMonth: [], nextQuarter: [], nextYear: [] };
    }
}
calculateLinearTrend(data, number[]);
number;
{
    if (data.length < 2)
        return 0;
    var n = data.length;
    var sumX = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
    var sumY = data.reduce(function (sum, val) { return sum + val; }, 0);
    var sumXY = data.reduce(function (sum, val, index) { return sum + (val * index); }, 0);
    var sumX2 = data.reduce(function (sum, _, index) { return sum + (index * index); }, 0);
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}
async;
detectTrend(data, number[]);
Promise < 'increasing' | 'decreasing' | 'stable' > {
    if: function (data) { },
    : .length < 3, return: 'stable',
    const: trend = this.calculateLinearTrend(data),
    const: threshold = Math.abs(data.reduce(function (sum, val) { return sum + val; }, 0) / data.length) * 0.05, // 5% threshold
    if: function (trend) { }
} > threshold;
return 'increasing';
if (trend < -threshold)
    return 'decreasing';
return 'stable';
calculatePerformanceScore(metric, analytics_1.ChannelPerformance, benchmark, any);
number;
{
    if (!benchmark)
        return 0;
    var deliveryScore = Math.min((metric.deliveryRate / benchmark.deliveryRate) * 100, 150);
    var openScore = Math.min((metric.openRate / benchmark.openRate) * 100, 150);
    var responseScore = Math.min((metric.responseRate / benchmark.responseRate) * 100, 150);
    return (deliveryScore + openScore + responseScore) / 3;
}
calculateOverallBenchmarkScore(comparisons, any[]);
number;
{
    if (!comparisons.length)
        return 0;
    var totalScore = comparisons.reduce(function (sum, comp) { return sum + comp.performanceScore; }, 0);
    return totalScore / comparisons.length;
}
async;
generateBenchmarkRecommendations(comparisons, any[]);
Promise < string[] > (_g = {
        const: recommendations,
        string: string
    },
    _g[] =  = [],
    _g.for = function (, comp, of, comparisons) {
        if (comp.deliveryRateDiff < -5) {
            recommendations.push("Melhorar taxa de entrega do canal ".concat(comp.channel, " - considere validar listas e hor\u00E1rios"));
        }
        if (comp.openRateDiff < -10) {
            recommendations.push("Otimizar taxa de abertura do canal ".concat(comp.channel, " - revisar t\u00EDtulos e timing"));
        }
        if (comp.responseRateDiff < -15) {
            recommendations.push("Aumentar engajamento do canal ".concat(comp.channel, " - melhorar call-to-actions e personaliza\u00E7\u00E3o"));
        }
    },
    _g.if = function (, recommendations) { },
    _g. = .length,
    _g);
{
    recommendations.push('Performance geral acima dos benchmarks da indústria - continue mantendo as boas práticas');
}
return recommendations;
async;
calculateIndustryRanking(overallScore, number);
Promise < string > {
    if: function (overallScore) { }
} >= 120;
return 'excellent';
if (overallScore >= 110)
    return 'good';
if (overallScore >= 90)
    return 'average';
if (overallScore >= 70)
    return 'below_average';
if (overallScore > 0)
    return 'poor';
return 'unknown';
async;
updateRealTimeMetrics(event, analytics_1.CommunicationEvent);
Promise < void  > {
    try: {
        const: today = new Date().toISOString().split('T')[0],
        // Upsert daily metrics
        await: await,
        this: .supabase
            .from('communication_metrics_daily')
            .upsert({
            clinic_id: event.clinicId,
            date: today,
            channel_type: event.channel,
            total_sent: 1,
            delivered: event.deliveredAt ? 1 : 0,
            opened: event.openedAt ? 1 : 0,
            clicked: event.clickedAt ? 1 : 0,
            responded: event.respondedAt ? 1 : 0,
            total_cost: event.cost,
            total_revenue: event.revenueAttributed || 0,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'clinic_id,date,channel_type',
            ignoreDuplicates: false
        })
    },
    catch: function (error) {
        console.error('Error updating real-time metrics:', error);
    }
};
async;
checkAlerts(event, analytics_1.CommunicationEvent);
Promise < void  > {
    try: {
        const: (_h = await this.supabase
            .from('communication_alerts')
            .select('*')
            .eq('clinic_id', event.clinicId)
            .eq('is_active', true), alerts = _h.data, _h),
        for: function (, alert, of, alerts) { }
    } || []
};
{
    var shouldTrigger = await this.evaluateAlertCondition(alert, event);
    if (shouldTrigger) {
        await this.triggerAlert(alert, event);
    }
}
try { }
catch (error) {
    console.error('Error checking alerts:', error);
}
async;
evaluateAlertCondition(alert, any, event, analytics_1.CommunicationEvent);
Promise < boolean > {
    try: {
        // Implementar lógica de avaliação de condições
        // Exemplo: verificar se taxa de entrega caiu abaixo do threshold
        for: function (, condition, of, alert) { },
        : .conditions
    }
};
{
    var currentValue = await this.getMetricValue(condition.metric, event.clinicId);
    switch (condition.operator) {
        case 'gt': return currentValue > condition.threshold;
        case 'lt': return currentValue < condition.threshold;
        case 'eq': return currentValue === condition.threshold;
        case 'gte': return currentValue >= condition.threshold;
        case 'lte': return currentValue <= condition.threshold;
        default: return false;
    }
}
return false;
try { }
catch (error) {
    return false;
}
async;
getMetricValue(metric, string, clinicId, string);
Promise < number > {
    try: {
        // Implementar busca de métricas baseado no tipo
        const: today = new Date(),
        const: yesterday = new Date(today.getTime() - (24 * 60 * 60 * 1000)),
        const: filter,
        AnalyticsFilter: analytics_1.AnalyticsFilter,
        switch: function (metric) {
        },
        case: 'delivery_rate',
        const: engagement = await this.getEngagementMetrics(filter),
        return: engagement.deliveryRate,
        case: 'open_rate',
        const: openMetrics = await this.getEngagementMetrics(filter),
        return: openMetrics.openRate,
        case: 'response_rate',
        const: responseMetrics = await this.getEngagementMetrics(filter),
        return: responseMetrics.responseRate,
        default: ,
        return: 0
    }
};
try { }
catch (error) {
    return 0;
}
async;
triggerAlert(alert, any, event, analytics_1.CommunicationEvent);
Promise < void  > {
    try: {
        for: function (, action, of, alert) { },
        : .actions
    }
};
{
    switch (action.type) {
        case 'email':
            // Implementar envio de email
            console.log("Email alert triggered: ".concat(alert.name));
            break;
        case 'webhook':
            // Implementar webhook
            console.log("Webhook alert triggered: ".concat(alert.name));
            break;
        case 'dashboard':
            // Implementar notificação no dashboard
            console.log("Dashboard alert triggered: ".concat(alert.name));
            break;
    }
}
try { }
catch (error) {
    console.error('Error triggering alert:', error);
}
async;
calculateReachRate(filter, analytics_1.AnalyticsFilter);
Promise < number > {
    try: {
        const: (_j = await this.supabase
            .from('communication_events')
            .select("\n          COUNT(DISTINCT patient_id) as reached_patients\n        ")
            .gte('sent_at', filter.dateRange.start.toISOString())
            .lte('sent_at', filter.dateRange.end.toISOString())
            .eq('clinic_id', filter.clinicId)
            .not('delivered_at', 'is', null)
            .single(), data = _j.data, _j),
        // Calcular contra total de pacientes ativos
        const: (_k = await this.supabase
            .from('patients')
            .select('COUNT(*)', { count: 'exact' })
            .eq('clinic_id', filter.clinicId)
            .eq('status', 'active'), totalPatients = _k.data, _k),
        const: reachedPatients = parseInt(data === null || data === void 0 ? void 0 : data.reached_patients) || 0,
        const: total = ((_t = totalPatients === null || totalPatients === void 0 ? void 0 : totalPatients[0]) === null || _t === void 0 ? void 0 : _t.count) || 0,
        return: total > 0 ? (reachedPatients / total) * 100 : 0
    },
    catch: function (error) {
        return 0;
    }
};
async;
calculateFrequencyRate(filter, analytics_1.AnalyticsFilter);
Promise < number > {
    try: {
        const: (_l = await this.supabase
            .from('communication_events')
            .select("\n          patient_id,\n          COUNT(*) as message_count\n        ")
            .gte('sent_at', filter.dateRange.start.toISOString())
            .lte('sent_at', filter.dateRange.end.toISOString())
            .eq('clinic_id', filter.clinicId), data = _l.data, _l),
        if: function (, data, length) { },
        return: 0,
        const: totalMessages = data.reduce(function (sum, patient) { return sum + parseInt(patient.message_count); }, 0),
        const: uniquePatients = data.length,
        return: uniquePatients > 0 ? totalMessages / uniquePatients : 0
    },
    catch: function (error) {
        return 0;
    }
};
async;
calculateRetentionRate(filter, analytics_1.AnalyticsFilter);
Promise < number > {
    try: {
        // Calcular pacientes que receberam mensagens no período atual
        const: (_m = await this.supabase
            .from('communication_events')
            .select('DISTINCT patient_id')
            .gte('sent_at', filter.dateRange.start.toISOString())
            .lte('sent_at', filter.dateRange.end.toISOString())
            .eq('clinic_id', filter.clinicId), currentPeriod = _m.data, _m),
        // Calcular pacientes que também receberam no período anterior
        const: daysDiff = Math.ceil((filter.dateRange.end.getTime() - filter.dateRange.start.getTime()) / (1000 * 60 * 60 * 24)),
        const: previousStart = new Date(filter.dateRange.start.getTime() - (daysDiff * 24 * 60 * 60 * 1000)),
        const: (_o = await this.supabase
            .from('communication_events')
            .select('DISTINCT patient_id')
            .gte('sent_at', previousStart.toISOString())
            .lt('sent_at', filter.dateRange.start.toISOString())
            .eq('clinic_id', filter.clinicId), previousPeriod = _o.data, _o),
        const: currentPatients = new Set((currentPeriod || []).map(function (p) { return p.patient_id; })),
        const: previousPatients = new Set((previousPeriod || []).map(function (p) { return p.patient_id; })),
        const: retainedPatients = __spreadArray([], currentPatients, true).filter(function (id) { return previousPatients.has(id); }).length,
        return: previousPatients.size > 0 ? (retainedPatients / previousPatients.size) * 100 : 0
    },
    catch: function (error) {
        return 0;
    }
};
async;
calculateSatisfactionScore(filter, analytics_1.AnalyticsFilter);
Promise < number > {
    try: {
        // Satisfaction baseado em feedback responses (se disponível)
        // Por enquanto, usar proxy metrics
        const: engagement = await this.getEngagementMetrics(filter),
        // Score composto baseado em engagement metrics
        const: satisfactionProxy = (engagement.responseRate * 0.4 +
            engagement.openRate * 0.3 +
            engagement.deliveryRate * 0.2 +
            Math.min(engagement.clickThroughRate * 2, 100) * 0.1),
        return: Math.min(satisfactionProxy, 100)
    },
    catch: function (error) {
        return 0;
    }
};
async;
calculateBreakEvenPoint(filter, analytics_1.AnalyticsFilter);
Promise < number > {
    try: {
        const: totalCost = await this.getTotalCost(filter),
        const: totalRevenue = await this.getTotalRevenue(filter),
        const: totalMessages = await this.getTotalMessages(filter),
        if: function (totalMessages) { }
    } === 0 || totalRevenue <= totalCost, return: 0,
    const: revenuePerMessage = totalRevenue / totalMessages,
    const: costPerMessage = totalCost / totalMessages,
    if: function (revenuePerMessage) { }
} <= costPerMessage;
return 0;
// Mensagens necessárias para cobrir custos fixos
return Math.ceil(totalCost / (revenuePerMessage - costPerMessage));
try { }
catch (error) {
    return 0;
}
async;
calculatePaybackPeriod(filter, analytics_1.AnalyticsFilter);
Promise < number > {
    try: {
        const: totalCost = await this.getTotalCost(filter),
        const: totalRevenue = await this.getTotalRevenue(filter),
        const: daysDiff = Math.ceil((filter.dateRange.end.getTime() - filter.dateRange.start.getTime()) / (1000 * 60 * 60 * 24)),
        if: function (totalRevenue) { }
    } <= totalCost || daysDiff === 0, return: 0,
    const: dailyProfit = (totalRevenue - totalCost) / daysDiff,
    return: dailyProfit > 0 ? Math.ceil(totalCost / dailyProfit) : 0
};
try { }
catch (error) {
    return 0;
}
async;
getAttributionModel(filter, analytics_1.AnalyticsFilter);
Promise < analytics_1.AttributionModel > {
    try: {
        // Implementar modelos de atribuição simples
        const: (_p = await this.supabase
            .from('communication_events')
            .select('patient_id, sent_at, revenue_attributed, channel_type')
            .gte('sent_at', filter.dateRange.start.toISOString())
            .lte('sent_at', filter.dateRange.end.toISOString())
            .eq('clinic_id', filter.clinicId)
            .gt('revenue_attributed', 0)
            .order('sent_at'), data = _p.data, _p),
        if: function (, data, length) {
            return { firstTouch: 0, lastTouch: 0, linear: 0, timeDecay: 0 };
        }
        // Agrupar por paciente
        ,
        // Agrupar por paciente
        const: patientJourneys = data.reduce(function (acc, event) {
            if (!acc[event.patient_id])
                acc[event.patient_id] = [];
            acc[event.patient_id].push(event);
            return acc;
        }, {}),
        let: let,
        firstTouch: firstTouch,
        let: let,
        lastTouch: lastTouch,
        let: let,
        linear: linear,
        let: let,
        timeDecay: timeDecay,
        for: function (, journey, of, Object) { },
        : .values(patientJourneys)
    }
};
{
    var totalRevenue = journey.reduce(function (sum, event) { return sum + event.revenue_attributed; }, 0);
    // First touch
    firstTouch += totalRevenue;
    // Last touch
    lastTouch += totalRevenue;
    // Linear
    linear += totalRevenue / journey.length;
    // Time decay (mais recente tem mais peso)
    var totalWeight_1 = journey.reduce(function (sum, _, index) { return sum + (index + 1); }, 0);
    timeDecay += journey.reduce(function (sum, event, index) {
        return sum + (event.revenue_attributed * (index + 1) / totalWeight_1);
    }, 0);
}
return { firstTouch: firstTouch, lastTouch: lastTouch, linear: linear, timeDecay: timeDecay };
try { }
catch (error) {
    return { firstTouch: 0, lastTouch: 0, linear: 0, timeDecay: 0 };
}
async;
calculateConversionValue(filter, analytics_1.AnalyticsFilter);
Promise < number > {
    try: {
        const: conversions = await this.getConversionsCount(filter),
        const: totalRevenue = await this.getTotalRevenue(filter),
        return: conversions > 0 ? totalRevenue / conversions : 0
    },
    catch: function (error) {
        return 0;
    }
};
async;
calculateLifetimeValue(filter, analytics_1.AnalyticsFilter);
Promise < number > {
    try: {
        // CLV simplificado baseado em histórico de receita por paciente
        const: (_q = await this.supabase
            .from('communication_events')
            .select("\n          patient_id,\n          SUM(revenue_attributed) as total_revenue\n        ")
            .gte('sent_at', filter.dateRange.start.toISOString())
            .lte('sent_at', filter.dateRange.end.toISOString())
            .eq('clinic_id', filter.clinicId)
            .gt('revenue_attributed', 0), data = _q.data, _q),
        if: function (, data, length) { },
        return: 0,
        const: totalRevenue = data.reduce(function (sum, patient) { return sum + parseFloat(patient.total_revenue); }, 0),
        const: uniquePatients = data.length,
        return: uniquePatients > 0 ? totalRevenue / uniquePatients : 0
    },
    catch: function (error) {
        return 0;
    }
};
// Export singleton instance
var createcommunicationAnalytics = function () { return new CommunicationAnalyticsEngine(); };
exports.createcommunicationAnalytics = createcommunicationAnalytics;
