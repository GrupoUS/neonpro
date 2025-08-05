"use strict";
/**
 * Sistema de Analytics para Notificações - NeonPro
 *
 * Componente responsável por coletar, processar e disponibilizar métricas
 * avançadas sobre o desempenho do sistema de notificações.
 *
 * Features:
 * - Métricas em tempo real
 * - Analytics preditivos
 * - Segmentação de usuários
 * - ROI de comunicação
 * - Relatórios executivos
 *
 * @author APEX Architecture Team
 * @version 1.0.0
 * @compliance LGPD, ANVISA, CFM
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
exports.NotificationAnalytics = void 0;
exports.createNotificationAnalytics = createNotificationAnalytics;
var zod_1 = require("zod");
var types_1 = require("../types");
// ================================================================================
// SCHEMAS & TYPES
// ================================================================================
var AnalyticsQuerySchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    channels: zod_1.z.array(zod_1.z.nativeEnum(types_1.NotificationChannel)).optional(),
    clinicId: zod_1.z.string().uuid().optional(),
    userId: zod_1.z.string().uuid().optional(),
    groupBy: zod_1.z.enum(['day', 'week', 'month', 'channel', 'type']).optional(),
});
var MetricsConfigSchema = zod_1.z.object({
    realTimeUpdates: zod_1.z.boolean().default(true),
    retentionDays: zod_1.z.number().min(1).max(365).default(90),
    aggregationLevel: zod_1.z.enum(['minute', 'hour', 'day']).default('hour'),
    enablePredictive: zod_1.z.boolean().default(true),
});
// ================================================================================
// NOTIFICATION ANALYTICS ENGINE
// ================================================================================
var NotificationAnalytics = /** @class */ (function () {
    function NotificationAnalytics(config) {
        if (config === void 0) { config = {}; }
        this.supabase = null;
        this.cache = new Map();
        this.config = __assign(__assign({}, MetricsConfigSchema.parse({})), config);
    }
    NotificationAnalytics.prototype.getSupabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var createClient, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.supabase) return [3 /*break*/, 3];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@/lib/supabase/server'); })];
                    case 1:
                        createClient = (_b.sent()).createClient;
                        _a = this;
                        return [4 /*yield*/, createClient()];
                    case 2:
                        _a.supabase = _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/, this.supabase];
                }
            });
        });
    };
    // ================================================================================
    // REAL-TIME METRICS
    // ================================================================================
    /**
     * Obtém métricas em tempo real do sistema de notificações
     */
    NotificationAnalytics.prototype.getRealTimeMetrics = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, now, last24h, _a, baseMetrics, error, metrics, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cacheKey = "realtime_metrics_".concat(clinicId);
                        cached = this.getFromCache(cacheKey);
                        if (cached)
                            return [2 /*return*/, cached];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        now = new Date();
                        last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, this.supabase
                                .from('notifications')
                                .select("\n          status,\n          channel,\n          type,\n          sent_at,\n          delivered_at,\n          opened_at,\n          clicked_at,\n          cost,\n          metadata\n        ")
                                .eq('clinic_id', clinicId)
                                .gte('sent_at', last24h.toISOString())];
                    case 2:
                        _a = _b.sent(), baseMetrics = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Erro ao buscar m\u00E9tricas: ".concat(error.message));
                        metrics = this.calculateMetrics(baseMetrics || []);
                        // Cache por 5 minutos
                        this.setCache(cacheKey, metrics, 5 * 60 * 1000);
                        return [2 /*return*/, metrics];
                    case 3:
                        error_1 = _b.sent();
                        console.error('Erro ao obter métricas em tempo real:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calcula métricas baseadas nos dados de notificação
     */
    NotificationAnalytics.prototype.calculateMetrics = function (data) {
        var totalSent = data.length;
        var delivered = data.filter(function (n) { return n.status === 'delivered'; }).length;
        var failed = data.filter(function (n) { return n.status === 'failed'; }).length;
        var pending = data.filter(function (n) { return n.status === 'pending'; }).length;
        var opened = data.filter(function (n) { return n.opened_at; }).length;
        var clicked = data.filter(function (n) { return n.clicked_at; }).length;
        var converted = data.filter(function (n) { var _a; return (_a = n.metadata) === null || _a === void 0 ? void 0 : _a.converted; }).length;
        var unsubscribed = data.filter(function (n) { var _a; return (_a = n.metadata) === null || _a === void 0 ? void 0 : _a.unsubscribed; }).length;
        var deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
        var openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
        var clickRate = opened > 0 ? (clicked / opened) * 100 : 0;
        var conversionRate = clicked > 0 ? (converted / clicked) * 100 : 0;
        var unsubscribeRate = delivered > 0 ? (unsubscribed / delivered) * 100 : 0;
        // Métricas de tempo
        var deliveredNotifications = data.filter(function (n) { return n.delivered_at && n.sent_at; });
        var avgDeliveryTime = deliveredNotifications.length > 0
            ? deliveredNotifications.reduce(function (acc, n) {
                var delivery = new Date(n.delivered_at).getTime();
                var sent = new Date(n.sent_at).getTime();
                return acc + (delivery - sent);
            }, 0) / deliveredNotifications.length / 1000
            : 0;
        var respondedNotifications = data.filter(function (n) { return n.opened_at && n.delivered_at; });
        var avgResponseTime = respondedNotifications.length > 0
            ? respondedNotifications.reduce(function (acc, n) {
                var opened = new Date(n.opened_at).getTime();
                var delivered = new Date(n.delivered_at).getTime();
                return acc + (opened - delivered);
            }, 0) / respondedNotifications.length / 1000
            : 0;
        // Breakdown por canal
        var channelBreakdown = this.calculateChannelBreakdown(data);
        // Métricas de custo
        var totalCost = data.reduce(function (acc, n) { return acc + (n.cost || 0); }, 0);
        var costPerDelivery = delivered > 0 ? totalCost / delivered : 0;
        var roi = this.calculateROI(data);
        return {
            totalSent: totalSent,
            delivered: delivered,
            failed: failed,
            pending: pending,
            opened: opened,
            clicked: clicked,
            converted: converted,
            unsubscribed: unsubscribed,
            deliveryRate: deliveryRate,
            openRate: openRate,
            clickRate: clickRate,
            conversionRate: conversionRate,
            unsubscribeRate: unsubscribeRate,
            avgDeliveryTime: avgDeliveryTime,
            avgResponseTime: avgResponseTime,
            channelBreakdown: channelBreakdown,
            totalCost: totalCost,
            costPerDelivery: costPerDelivery,
            roi: roi,
        };
    };
    /**
     * Calcula breakdown de métricas por canal
     */
    NotificationAnalytics.prototype.calculateChannelBreakdown = function (data) {
        var channels = Object.values(types_1.NotificationChannel);
        var breakdown = {};
        channels.forEach(function (channel) {
            var channelData = data.filter(function (n) { return n.channel === channel; });
            var sent = channelData.length;
            var delivered = channelData.filter(function (n) { return n.status === 'delivered'; }).length;
            var failed = channelData.filter(function (n) { return n.status === 'failed'; }).length;
            var engaged = channelData.filter(function (n) { return n.opened_at || n.clicked_at; }).length;
            var engagementRate = delivered > 0 ? (engaged / delivered) * 100 : 0;
            var reliability = sent > 0 ? (delivered / sent) * 100 : 0;
            var avgCost = channelData.reduce(function (acc, n) { return acc + (n.cost || 0); }, 0) / sent || 0;
            breakdown[channel] = {
                sent: sent,
                delivered: delivered,
                failed: failed,
                engagementRate: engagementRate,
                avgCost: avgCost,
                reliability: reliability,
            };
        });
        return breakdown;
    };
    // ================================================================================
    // ANALYTICS HISTÓRICOS
    // ================================================================================
    /**
     * Gera relatório analítico para período específico
     */
    NotificationAnalytics.prototype.generateReport = function (query, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var validatedQuery, _a, historicalData, error, summary, trends, insights, recommendations, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        validatedQuery = AnalyticsQuerySchema.parse(query);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.supabase
                                .from('notifications')
                                .select('*')
                                .eq('clinic_id', clinicId)
                                .gte('sent_at', validatedQuery.startDate)
                                .lte('sent_at', validatedQuery.endDate)
                                .order('sent_at', { ascending: true })];
                    case 2:
                        _a = _b.sent(), historicalData = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Erro ao buscar dados hist\u00F3ricos: ".concat(error.message));
                        summary = this.calculateMetrics(historicalData || []);
                        trends = this.generateTimeSeriesData(historicalData || [], validatedQuery.groupBy || 'day');
                        return [4 /*yield*/, this.generatePredictiveInsights(historicalData || [], clinicId)];
                    case 3:
                        insights = _b.sent();
                        recommendations = this.generateRecommendations(summary, trends);
                        return [2 /*return*/, {
                                summary: summary,
                                trends: trends,
                                insights: insights,
                                recommendations: recommendations,
                                generatedAt: new Date(),
                                period: {
                                    start: new Date(validatedQuery.startDate),
                                    end: new Date(validatedQuery.endDate),
                                },
                            }];
                    case 4:
                        error_2 = _b.sent();
                        console.error('Erro ao gerar relatório:', error_2);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gera dados de série temporal
     */
    NotificationAnalytics.prototype.generateTimeSeriesData = function (data, groupBy) {
        var _this = this;
        var grouped = new Map();
        data.forEach(function (notification) {
            var date = new Date(notification.sent_at);
            var key;
            switch (groupBy) {
                case 'day':
                    key = date.toISOString().split('T')[0];
                    break;
                case 'week':
                    var weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    key = weekStart.toISOString().split('T')[0];
                    break;
                case 'month':
                    key = "".concat(date.getFullYear(), "-").concat(String(date.getMonth() + 1).padStart(2, '0'));
                    break;
                case 'channel':
                    key = notification.channel;
                    break;
                case 'type':
                    key = notification.type;
                    break;
                default:
                    key = date.toISOString().split('T')[0];
            }
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key).push(notification);
        });
        var result = [];
        grouped.forEach(function (notifications, key) {
            var metrics = _this.calculateMetrics(notifications);
            result.push({
                timestamp: new Date(key),
                value: metrics.totalSent,
                metric: 'total_sent',
            }, {
                timestamp: new Date(key),
                value: metrics.deliveryRate,
                metric: 'delivery_rate',
            }, {
                timestamp: new Date(key),
                value: metrics.openRate,
                metric: 'open_rate',
            }, {
                timestamp: new Date(key),
                value: metrics.conversionRate,
                metric: 'conversion_rate',
            });
        });
        return result.sort(function (a, b) { return a.timestamp.getTime() - b.timestamp.getTime(); });
    };
    // ================================================================================
    // PREDICTIVE ANALYTICS
    // ================================================================================
    /**
     * Gera insights preditivos baseados em dados históricos
     */
    NotificationAnalytics.prototype.generatePredictiveInsights = function (data, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var bestSendTime, preferredChannel, engagementProbability, churnRisk, nextBestAction;
            return __generator(this, function (_a) {
                if (!this.config.enablePredictive || data.length < 100) {
                    return [2 /*return*/, {
                            bestSendTime: '10:00',
                            preferredChannel: types_1.NotificationChannel.EMAIL,
                            engagementProbability: 0.7,
                            churnRisk: 0.1,
                            nextBestAction: 'Coletar mais dados para análise preditiva',
                        }];
                }
                bestSendTime = this.calculateBestSendTime(data);
                preferredChannel = this.calculatePreferredChannel(data);
                engagementProbability = this.calculateEngagementProbability(data);
                churnRisk = this.calculateChurnRisk(data);
                nextBestAction = this.suggestNextBestAction(data);
                return [2 /*return*/, {
                        bestSendTime: bestSendTime,
                        preferredChannel: preferredChannel,
                        engagementProbability: engagementProbability,
                        churnRisk: churnRisk,
                        nextBestAction: nextBestAction,
                    }];
            });
        });
    };
    NotificationAnalytics.prototype.calculateBestSendTime = function (data) {
        var hourlyEngagement = new Map();
        data.forEach(function (notification) {
            if (notification.opened_at || notification.clicked_at) {
                var hour = new Date(notification.sent_at).getHours();
                var current = hourlyEngagement.get(hour) || { sent: 0, engaged: 0 };
                current.sent += 1;
                if (notification.opened_at || notification.clicked_at) {
                    current.engaged += 1;
                }
                hourlyEngagement.set(hour, current);
            }
        });
        var bestHour = 10;
        var bestRate = 0;
        hourlyEngagement.forEach(function (_a, hour) {
            var sent = _a.sent, engaged = _a.engaged;
            var rate = sent > 0 ? engaged / sent : 0;
            if (rate > bestRate) {
                bestRate = rate;
                bestHour = hour;
            }
        });
        return "".concat(String(bestHour).padStart(2, '0'), ":00");
    };
    NotificationAnalytics.prototype.calculatePreferredChannel = function (data) {
        var channelPerformance = new Map();
        Object.values(types_1.NotificationChannel).forEach(function (channel) {
            var channelData = data.filter(function (n) { return n.channel === channel; });
            var delivered = channelData.filter(function (n) { return n.status === 'delivered'; }).length;
            var engaged = channelData.filter(function (n) { return n.opened_at || n.clicked_at; }).length;
            var engagementRate = delivered > 0 ? engaged / delivered : 0;
            channelPerformance.set(channel, engagementRate);
        });
        var bestChannel = types_1.NotificationChannel.EMAIL;
        var bestRate = 0;
        channelPerformance.forEach(function (rate, channel) {
            if (rate > bestRate) {
                bestRate = rate;
                bestChannel = channel;
            }
        });
        return bestChannel;
    };
    NotificationAnalytics.prototype.calculateEngagementProbability = function (data) {
        var recentData = data.filter(function (n) {
            var sentDate = new Date(n.sent_at);
            var thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return sentDate >= thirtyDaysAgo;
        });
        if (recentData.length === 0)
            return 0.5;
        var delivered = recentData.filter(function (n) { return n.status === 'delivered'; }).length;
        var engaged = recentData.filter(function (n) { return n.opened_at || n.clicked_at; }).length;
        return delivered > 0 ? Math.min(engaged / delivered, 1) : 0.5;
    };
    NotificationAnalytics.prototype.calculateChurnRisk = function (data) {
        var last30Days = data.filter(function (n) {
            var sentDate = new Date(n.sent_at);
            var thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return sentDate >= thirtyDaysAgo;
        });
        var last60Days = data.filter(function (n) {
            var sentDate = new Date(n.sent_at);
            var sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
            var thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return sentDate >= sixtyDaysAgo && sentDate < thirtyDaysAgo;
        });
        var recent = last30Days.filter(function (n) { return n.opened_at || n.clicked_at; }).length;
        var previous = last60Days.filter(function (n) { return n.opened_at || n.clicked_at; }).length;
        if (previous === 0)
            return 0.5;
        var engagementChange = (recent - previous) / previous;
        return Math.max(0, Math.min(1, -engagementChange));
    };
    NotificationAnalytics.prototype.suggestNextBestAction = function (data) {
        var metrics = this.calculateMetrics(data);
        if (metrics.deliveryRate < 85) {
            return 'Otimizar configuração de canais - taxa de entrega baixa';
        }
        if (metrics.openRate < 15) {
            return 'Melhorar títulos e timing de envio - baixa taxa de abertura';
        }
        if (metrics.clickRate < 5) {
            return 'Otimizar conteúdo e call-to-actions - baixa taxa de clique';
        }
        if (metrics.unsubscribeRate > 2) {
            return 'Revisar frequência e relevância das mensagens';
        }
        return 'Performance boa - considerar segmentação avançada para otimização';
    };
    // ================================================================================
    // RECOMMENDATIONS ENGINE
    // ================================================================================
    /**
     * Gera recomendações baseadas nas métricas e tendências
     */
    NotificationAnalytics.prototype.generateRecommendations = function (metrics, trends) {
        var recommendations = [];
        // Análise de performance geral
        if (metrics.deliveryRate < 90) {
            recommendations.push("\uD83D\uDCC9 Taxa de entrega baixa (".concat(metrics.deliveryRate.toFixed(1), "%). Verifique configura\u00E7\u00F5es de DNS e reputa\u00E7\u00E3o do remetente."));
        }
        if (metrics.openRate < 20) {
            recommendations.push("\uD83D\uDCE7 Taxa de abertura baixa (".concat(metrics.openRate.toFixed(1), "%). Otimize assuntos e hor\u00E1rios de envio."));
        }
        if (metrics.clickRate < 5) {
            recommendations.push("\uD83C\uDFAF Taxa de clique baixa (".concat(metrics.clickRate.toFixed(1), "%). Melhore call-to-actions e relev\u00E2ncia do conte\u00FAdo."));
        }
        // Análise de canais
        Object.entries(metrics.channelBreakdown).forEach(function (_a) {
            var channel = _a[0], channelMetrics = _a[1];
            if (channelMetrics.reliability < 85) {
                recommendations.push("\uD83D\uDD27 Canal ".concat(channel, " com baixa confiabilidade (").concat(channelMetrics.reliability.toFixed(1), "%). Considere configura\u00E7\u00E3o ou provider alternativo."));
            }
        });
        // Análise de custos
        if (metrics.costPerDelivery > 0.50) {
            recommendations.push("\uD83D\uDCB0 Custo por entrega alto (R$ ".concat(metrics.costPerDelivery.toFixed(2), "). Avalie otimiza\u00E7\u00E3o de canais e providers."));
        }
        // Análise de ROI
        if (metrics.roi < 2) {
            recommendations.push("\uD83D\uDCCA ROI baixo (".concat(metrics.roi.toFixed(1), "x). Foque em segmenta\u00E7\u00E3o e personaliza\u00E7\u00E3o para melhorar convers\u00F5es."));
        }
        // Análise de tendências
        var recentTrends = trends.slice(-7); // Últimos 7 pontos
        var deliveryTrend = recentTrends.filter(function (t) { return t.metric === 'delivery_rate'; });
        if (deliveryTrend.length >= 2) {
            var isDecreasing = deliveryTrend[deliveryTrend.length - 1].value < deliveryTrend[0].value;
            if (isDecreasing) {
                recommendations.push('📉 Taxa de entrega em declínio. Monitore reputação do remetente e listas de bloqueio.');
            }
        }
        // Recomendações gerais se performance está boa
        if (recommendations.length === 0) {
            recommendations.push('✅ Performance geral boa! Considere testes A/B para otimização contínua.', '🎯 Explore segmentação avançada para personalização.', '📱 Teste novos canais ou formatos de conteúdo.');
        }
        return recommendations;
    };
    // ================================================================================
    // UTILITY METHODS
    // ================================================================================
    /**
     * Calcula ROI das notificações
     */
    NotificationAnalytics.prototype.calculateROI = function (data) {
        var totalCost = data.reduce(function (acc, n) { return acc + (n.cost || 0); }, 0);
        var totalRevenue = data.reduce(function (acc, n) {
            var _a;
            return acc + (((_a = n.metadata) === null || _a === void 0 ? void 0 : _a.revenue) || 0);
        }, 0);
        return totalCost > 0 ? totalRevenue / totalCost : 0;
    };
    /**
     * Sistema de cache simples
     */
    NotificationAnalytics.prototype.getFromCache = function (key) {
        var cached = this.cache.get(key);
        if (cached && cached.expiry > Date.now()) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    };
    NotificationAnalytics.prototype.setCache = function (key, data, ttl) {
        this.cache.set(key, {
            data: data,
            expiry: Date.now() + ttl,
        });
    };
    /**
     * Limpa cache expirado
     */
    NotificationAnalytics.prototype.clearExpiredCache = function () {
        var now = Date.now();
        for (var _i = 0, _a = this.cache.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (value.expiry <= now) {
                this.cache.delete(key);
            }
        }
    };
    return NotificationAnalytics;
}());
exports.NotificationAnalytics = NotificationAnalytics;
// ================================================================================
// EXPORT
// ================================================================================
// Export factory function instead of instance to avoid initialization during build
function createNotificationAnalytics(config) {
    return new NotificationAnalytics(config);
}
