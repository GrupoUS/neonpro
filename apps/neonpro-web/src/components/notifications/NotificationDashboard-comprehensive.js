/**
 * NeonPro Notification Management Dashboard
 *
 * Dashboard completo de configuração e monitoramento de notificações
 * para clínicas estéticas com analytics em tempo real e gestão de templates.
 *
 * Features:
 * - Dashboard de configuração de notificações
 * - Visualização de performance em tempo real
 * - Gestão de templates e personalizações
 * - Configuração de escalação e workflows
 * - Análise de efetividade por canal
 * - Real-time metrics e KPIs
 *
 * @author BMad Method - NeonPro Development Team
 * @version 1.0.0
 * @since 2025-01-30
 */
'use client';
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
exports.default = NotificationDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var switch_1 = require("@/components/ui/switch");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var dialog_1 = require("@/components/ui/dialog");
var sonner_1 = require("sonner");
var client_1 = require("@/app/utils/supabase/client");
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
/**
 * Dashboard principal de notificações
 */
function NotificationDashboard() {
    var _this = this;
    var _a = (0, react_1.useState)(true), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)([]), templates = _b[0], setTemplates = _b[1];
    var _c = (0, react_1.useState)([]), rules = _c[0], setRules = _c[1];
    var _d = (0, react_1.useState)(null), stats = _d[0], setStats = _d[1];
    var _e = (0, react_1.useState)([]), metrics = _e[0], setMetrics = _e[1];
    var _f = (0, react_1.useState)([]), channelPerformance = _f[0], setChannelPerformance = _f[1];
    var _g = (0, react_1.useState)([]), patientEngagement = _g[0], setPatientEngagement = _g[1];
    var _h = (0, react_1.useState)([]), escalationRules = _h[0], setEscalationRules = _h[1];
    var _j = (0, react_1.useState)('week'), selectedPeriod = _j[0], setSelectedPeriod = _j[1];
    var _k = (0, react_1.useState)(null), selectedTemplate = _k[0], setSelectedTemplate = _k[1];
    var _l = (0, react_1.useState)(false), isTemplateDialogOpen = _l[0], setIsTemplateDialogOpen = _l[1];
    var _m = (0, react_1.useState)(false), isRuleDialogOpen = _m[0], setIsRuleDialogOpen = _m[1];
    var _o = (0, react_1.useState)(''), searchQuery = _o[0], setSearchQuery = _o[1];
    var _p = (0, react_1.useState)('all'), filterChannel = _p[0], setFilterChannel = _p[1];
    var _q = (0, react_1.useState)(false), refreshing = _q[0], setRefreshing = _q[1];
    var supabase = (0, client_1.createClient)();
    // Carregamento inicial dos dados
    (0, react_1.useEffect)(function () {
        loadDashboardData();
    }, [selectedPeriod]);
    /**
     * Carrega todos os dados do dashboard
     */
    var loadDashboardData = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, Promise.all([
                            loadTemplates(),
                            loadRules(),
                            loadStats(),
                            loadPerformanceMetrics(),
                            loadChannelPerformance(),
                            loadPatientEngagement(),
                            loadEscalationRules()
                        ])];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Erro ao carregar dados do dashboard:', error_1);
                    sonner_1.toast.error('Erro ao carregar dados do dashboard');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Carrega templates de notificação
     */
    var loadTemplates = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, templatesWithStats;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('notification_templates')
                        .select('*')
                        .order('created_at', { ascending: false })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Erro ao carregar templates:', error);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, Promise.all(data.map(function (template) { return __awaiter(_this, void 0, void 0, function () {
                            var usageCount, successCount;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, supabase
                                            .from('notification_queue')
                                            .select('*', { count: 'exact', head: true })
                                            .eq('template_id', template.id)];
                                    case 1:
                                        usageCount = (_a.sent()).count;
                                        return [4 /*yield*/, supabase
                                                .from('notification_queue')
                                                .select('*', { count: 'exact', head: true })
                                                .eq('template_id', template.id)
                                                .eq('status', 'delivered')];
                                    case 2:
                                        successCount = (_a.sent()).count;
                                        return [2 /*return*/, __assign(__assign({}, template), { usageCount: usageCount || 0, successRate: usageCount ? ((successCount || 0) / usageCount) * 100 : 0 })];
                                }
                            });
                        }); }))];
                case 2:
                    templatesWithStats = _b.sent();
                    setTemplates(templatesWithStats);
                    return [2 /*return*/];
            }
        });
    }); };
    /**
     * Carrega regras de notificação
     */
    var loadRules = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('notification_rules')
                        .select("\n        *,\n        template:notification_templates(*)\n      ")
                        .order('created_at', { ascending: false })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Erro ao carregar regras:', error);
                        return [2 /*return*/];
                    }
                    setRules(data);
                    return [2 /*return*/];
            }
        });
    }); };
    /**
     * Carrega estatísticas gerais
     */
    var loadStats = function () { return __awaiter(_this, void 0, void 0, function () {
        var now, startDate, _a, data, error, aggregated;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    now = new Date();
                    switch (selectedPeriod) {
                        case 'today':
                            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                            break;
                        case 'week':
                            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            break;
                        case 'month':
                            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                            break;
                    }
                    return [4 /*yield*/, supabase
                            .from('notification_analytics')
                            .select('*')
                            .gte('date', startDate.toISOString().split('T')[0])];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Erro ao carregar estatísticas:', error);
                        return [2 /*return*/];
                    }
                    aggregated = data.reduce(function (acc, record) {
                        acc.totalSent += record.total_sent;
                        acc.totalDelivered += record.total_delivered;
                        acc.totalRead += record.total_read;
                        acc.totalClicked += record.total_clicked;
                        acc.totalReplied += record.total_replied;
                        acc.totalFailed += record.total_failed;
                        // Agrega por canal
                        if (!acc.channels[record.channel]) {
                            acc.channels[record.channel] = {
                                sent: 0,
                                delivered: 0,
                                failed: 0,
                                rate: 0
                            };
                        }
                        acc.channels[record.channel].sent += record.total_sent;
                        acc.channels[record.channel].delivered += record.total_delivered;
                        acc.channels[record.channel].failed += record.total_failed;
                        return acc;
                    }, {
                        period: selectedPeriod,
                        totalSent: 0,
                        totalDelivered: 0,
                        totalRead: 0,
                        totalClicked: 0,
                        totalReplied: 0,
                        totalFailed: 0,
                        deliveryRate: 0,
                        readRate: 0,
                        responseRate: 0,
                        channels: {}
                    });
                    // Calcula taxas
                    aggregated.deliveryRate = aggregated.totalSent > 0
                        ? (aggregated.totalDelivered / aggregated.totalSent) * 100
                        : 0;
                    aggregated.readRate = aggregated.totalDelivered > 0
                        ? (aggregated.totalRead / aggregated.totalDelivered) * 100
                        : 0;
                    aggregated.responseRate = aggregated.totalSent > 0
                        ? (aggregated.totalReplied / aggregated.totalSent) * 100
                        : 0;
                    // Calcula taxas por canal
                    Object.keys(aggregated.channels).forEach(function (channel) {
                        var channelData = aggregated.channels[channel];
                        channelData.rate = channelData.sent > 0
                            ? (channelData.delivered / channelData.sent) * 100
                            : 0;
                    });
                    setStats(aggregated);
                    return [2 /*return*/];
            }
        });
    }); };
    /**
     * Carrega métricas de performance temporal
     */
    var loadPerformanceMetrics = function () { return __awaiter(_this, void 0, void 0, function () {
        var endDate, startDate, _a, data, error, metricsMap, metricsArray;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    endDate = new Date();
                    startDate = new Date();
                    startDate.setDate(endDate.getDate() - 30); // Últimos 30 dias
                    return [4 /*yield*/, supabase
                            .from('notification_analytics')
                            .select('*')
                            .gte('date', startDate.toISOString().split('T')[0])
                            .lte('date', endDate.toISOString().split('T')[0])
                            .order('date', { ascending: true })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Erro ao carregar métricas de performance:', error);
                        return [2 /*return*/];
                    }
                    metricsMap = data.reduce(function (acc, record) {
                        var date = record.date;
                        if (!acc[date]) {
                            acc[date] = {
                                date: date,
                                sent: 0,
                                delivered: 0,
                                read: 0,
                                failed: 0,
                                responseTime: 0,
                                count: 0
                            };
                        }
                        acc[date].sent += record.total_sent;
                        acc[date].delivered += record.total_delivered;
                        acc[date].read += record.total_read;
                        acc[date].failed += record.total_failed;
                        if (record.avg_delivery_time_seconds) {
                            acc[date].responseTime += record.avg_delivery_time_seconds;
                            acc[date].count++;
                        }
                        return acc;
                    }, {});
                    metricsArray = Object.values(metricsMap).map(function (metric) { return (__assign(__assign({}, metric), { responseTime: metric.count > 0 ? metric.responseTime / metric.count : 0 })); });
                    setMetrics(metricsArray);
                    return [2 /*return*/];
            }
        });
    }); };
    /**
     * Carrega performance por canal
     */
    var loadChannelPerformance = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, channelMap, channelArray;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('notification_analytics')
                        .select('*')
                        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Erro ao carregar performance por canal:', error);
                        return [2 /*return*/];
                    }
                    channelMap = data.reduce(function (acc, record) {
                        var channel = record.channel;
                        if (!acc[channel]) {
                            acc[channel] = {
                                channel: channel,
                                sent: 0,
                                delivered: 0,
                                failed: 0,
                                rate: 0,
                                avgDeliveryTime: 0,
                                cost: 0,
                                count: 0
                            };
                        }
                        acc[channel].sent += record.total_sent;
                        acc[channel].delivered += record.total_delivered;
                        acc[channel].failed += record.total_failed;
                        if (record.avg_delivery_time_seconds) {
                            acc[channel].avgDeliveryTime += record.avg_delivery_time_seconds;
                            acc[channel].count++;
                        }
                        return acc;
                    }, {});
                    channelArray = Object.values(channelMap).map(function (channel) { return (__assign(__assign({}, channel), { rate: channel.sent > 0 ? (channel.delivered / channel.sent) * 100 : 0, avgDeliveryTime: channel.count > 0 ? channel.avgDeliveryTime / channel.count : 0, cost: calculateChannelCost(channel.channel, channel.sent) })); });
                    setChannelPerformance(channelArray);
                    return [2 /*return*/];
            }
        });
    }); };
    /**
     * Carrega engajamento de pacientes
     */
    var loadPatientEngagement = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, engagement;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('patient_notification_preferences')
                        .select("\n        *,\n        patient:patients(*)\n      ")
                        .order('response_score', { ascending: false })
                        .limit(20)];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Erro ao carregar engajamento de pacientes:', error);
                        return [2 /*return*/];
                    }
                    engagement = data.map(function (record) {
                        var _a;
                        return ({
                            patientId: record.patient_id,
                            patientName: ((_a = record.patient) === null || _a === void 0 ? void 0 : _a.name) || 'N/A',
                            preferredChannel: record.preferred_channels[0] || 'whatsapp',
                            responseScore: record.response_score || 0,
                            totalNotifications: 0, // Será calculado
                            totalResponses: 0, // Será calculado
                            lastResponse: record.last_response_at || 'Nunca',
                            averageResponseTime: 0 // Será calculado
                        });
                    });
                    setPatientEngagement(engagement);
                    return [2 /*return*/];
            }
        });
    }); };
    /**
     * Carrega regras de escalação
     */
    var loadEscalationRules = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, rules;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('escalation_rules')
                        .select("\n        *,\n        target_user:auth.users(*)\n      ")
                        .order('created_at', { ascending: false })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Erro ao carregar regras de escalação:', error);
                        return [2 /*return*/];
                    }
                    rules = data.map(function (rule) {
                        var _a;
                        return (__assign(__assign({}, rule), { targetUserName: ((_a = rule.target_user) === null || _a === void 0 ? void 0 : _a.email) || 'N/A' }));
                    });
                    setEscalationRules(rules);
                    return [2 /*return*/];
            }
        });
    }); };
    /**
     * Calcula custo estimado por canal
     */
    var calculateChannelCost = function (channel, sent) {
        var costs = {
            sms: 0.05, // R$ 0,05 por SMS
            whatsapp: 0.02, // R$ 0,02 por mensagem
            email: 0.001, // R$ 0,001 por email
            push: 0 // Gratuito
        };
        return (costs[channel] || 0) * sent;
    };
    /**
     * Atualiza dados em tempo real
     */
    var refreshData = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setRefreshing(true);
                    return [4 /*yield*/, loadDashboardData()];
                case 1:
                    _a.sent();
                    setRefreshing(false);
                    sonner_1.toast.success('Dados atualizados');
                    return [2 /*return*/];
            }
        });
    }); };
    /**
     * Filtra templates baseado na busca e filtros
     */
    var filteredTemplates = (0, react_1.useMemo)(function () {
        return templates.filter(function (template) {
            var matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.type.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesChannel = filterChannel === 'all' || template.channel === filterChannel;
            return matchesSearch && matchesChannel;
        });
    }, [templates, searchQuery, filterChannel]);
    /**
     * Cores para gráficos
     */
    var chartColors = {
        primary: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#6366f1',
        secondary: '#8b5cf6'
    };
    /**
     * Ícones por canal
     */
    var getChannelIcon = function (channel) {
        switch (channel) {
            case 'sms': return <lucide_react_1.Smartphone className="h-4 w-4"/>;
            case 'email': return <lucide_react_1.Mail className="h-4 w-4"/>;
            case 'whatsapp': return <lucide_react_1.MessageSquare className="h-4 w-4"/>;
            case 'push': return <lucide_react_1.Bell className="h-4 w-4"/>;
            default: return <lucide_react_1.Send className="h-4 w-4"/>;
        }
    };
    /**
     * Badge de status para templates
     */
    var getStatusBadge = function (active) {
        return (<badge_1.Badge variant={active ? 'default' : 'secondary'}>
        {active ? 'Ativo' : 'Inativo'}
      </badge_1.Badge>);
    };
    /**
     * Badge de performance
     */
    var getPerformanceBadge = function (rate) {
        if (rate >= 90)
            return <badge_1.Badge variant="default" className="bg-green-500">Excelente</badge_1.Badge>;
        if (rate >= 75)
            return <badge_1.Badge variant="default" className="bg-blue-500">Bom</badge_1.Badge>;
        if (rate >= 50)
            return <badge_1.Badge variant="default" className="bg-yellow-500">Regular</badge_1.Badge>;
        return <badge_1.Badge variant="destructive">Baixo</badge_1.Badge>;
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie templates, regras e monitore performance
          </p>
        </div>
        <div className="flex gap-2">
          <button_1.Button variant="outline" onClick={refreshData} disabled={refreshing} className="flex items-center gap-2">
            <lucide_react_1.RefreshCw className={"h-4 w-4 ".concat(refreshing ? 'animate-spin' : '')}/>
            Atualizar
          </button_1.Button>
          <select_1.Select value={selectedPeriod} onValueChange={function (value) { return setSelectedPeriod(value); }}>
            <select_1.SelectTrigger className="w-40">
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="today">Hoje</select_1.SelectItem>
              <select_1.SelectItem value="week">7 dias</select_1.SelectItem>
              <select_1.SelectItem value="month">30 dias</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>
      </div>

      {/* KPIs */}
      {stats && (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Enviadas</card_1.CardTitle>
              <lucide_react_1.Send className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total de notificações enviadas
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Taxa de Entrega</card_1.CardTitle>
              <lucide_react_1.CheckCircle className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{stats.deliveryRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalDelivered.toLocaleString()} entregues
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Taxa de Leitura</card_1.CardTitle>
              <lucide_react_1.Eye className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{stats.readRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalRead.toLocaleString()} lidas
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Taxa de Resposta</card_1.CardTitle>
              <lucide_react_1.MessageCircle className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{stats.responseRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalReplied.toLocaleString()} respostas
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </div>)}

      {/* Tabs principais */}
      <tabs_1.Tabs defaultValue="overview" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="templates">Templates</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="rules">Regras</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Analytics</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="patients">Pacientes</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="settings">Configurações</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Visão Geral */}
        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance por Canal */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Performance por Canal</card_1.CardTitle>
                <card_1.CardDescription>
                  Taxa de entrega dos últimos 7 dias
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={200}>
                  <recharts_1.BarChart data={channelPerformance}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                    <recharts_1.XAxis dataKey="channel"/>
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip />
                    <recharts_1.Bar dataKey="rate" fill={chartColors.primary}/>
                  </recharts_1.BarChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>

            {/* Tendência Temporal */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Tendência de Envios</card_1.CardTitle>
                <card_1.CardDescription>
                  Últimos 30 dias
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={200}>
                  <recharts_1.LineChart data={metrics}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                    <recharts_1.XAxis dataKey="date"/>
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip />
                    <recharts_1.Line type="monotone" dataKey="sent" stroke={chartColors.primary} strokeWidth={2}/>
                    <recharts_1.Line type="monotone" dataKey="delivered" stroke={chartColors.success} strokeWidth={2}/>
                  </recharts_1.LineChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Resumo por Canal */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Resumo por Canal</card_1.CardTitle>
              <card_1.CardDescription>
                Performance detalhada de cada canal
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {channelPerformance.map(function (channel) { return (<div key={channel.channel} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getChannelIcon(channel.channel)}
                      <div>
                        <p className="font-medium capitalize">{channel.channel}</p>
                        <p className="text-sm text-muted-foreground">
                          {channel.sent.toLocaleString()} enviadas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{channel.rate.toFixed(1)}% entrega</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {channel.cost.toFixed(2)} custo
                      </p>
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Templates */}
        <tabs_1.TabsContent value="templates" className="space-y-4">
          {/* Filtros e Ações */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                <input_1.Input placeholder="Buscar templates..." value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} className="pl-8 w-64"/>
              </div>
              <select_1.Select value={filterChannel} onValueChange={setFilterChannel}>
                <select_1.SelectTrigger className="w-40">
                  <select_1.SelectValue placeholder="Canal"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="sms">SMS</select_1.SelectItem>
                  <select_1.SelectItem value="email">Email</select_1.SelectItem>
                  <select_1.SelectItem value="whatsapp">WhatsApp</select_1.SelectItem>
                  <select_1.SelectItem value="push">Push</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <button_1.Button onClick={function () { return setIsTemplateDialogOpen(true); }}>
              <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
              Novo Template
            </button_1.Button>
          </div>

          {/* Lista de Templates */}
          <div className="grid gap-4">
            {filteredTemplates.map(function (template) {
            var _a;
            return (<card_1.Card key={template.id}>
                <card_1.CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <card_1.CardTitle className="flex items-center gap-2">
                        {getChannelIcon(template.channel)}
                        {template.name}
                      </card_1.CardTitle>
                      <card_1.CardDescription>
                        {template.type} • {template.usageCount} usos • {(_a = template.successRate) === null || _a === void 0 ? void 0 : _a.toFixed(1)}% sucesso
                      </card_1.CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(template.active)}
                      {getPerformanceBadge(template.successRate || 0)}
                    </div>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-2">
                    {template.subject && (<p className="text-sm"><strong>Assunto:</strong> {template.subject}</p>)}
                    <p className="text-sm text-muted-foreground">
                      {template.content.substring(0, 150)}...
                    </p>
                    <div className="flex gap-2">
                      {template.variables.map(function (variable) { return (<badge_1.Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </badge_1.Badge>); })}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button_1.Button variant="outline" size="sm">
                      <lucide_react_1.Eye className="h-4 w-4 mr-1"/>
                      Visualizar
                    </button_1.Button>
                    <button_1.Button variant="outline" size="sm">
                      <lucide_react_1.Edit className="h-4 w-4 mr-1"/>
                      Editar
                    </button_1.Button>
                    <button_1.Button variant="outline" size="sm">
                      <lucide_react_1.Trash2 className="h-4 w-4 mr-1"/>
                      Excluir
                    </button_1.Button>
                  </div>
                </card_1.CardContent>
              </card_1.Card>);
        })}
          </div>
        </tabs_1.TabsContent>

        {/* Regras */}
        <tabs_1.TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Regras de Notificação</h3>
            <button_1.Button onClick={function () { return setIsRuleDialogOpen(true); }}>
              <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
              Nova Regra
            </button_1.Button>
          </div>

          <div className="grid gap-4">
            {rules.map(function (rule) {
            var _a;
            return (<card_1.Card key={rule.id}>
                <card_1.CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <card_1.CardTitle>{rule.name}</card_1.CardTitle>
                      <card_1.CardDescription>
                        Trigger: {rule.triggerType} • {rule.maxAttempts} tentativas
                      </card_1.CardDescription>
                    </div>
                    {getStatusBadge(rule.active)}
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Template:</strong> {((_a = rule.template) === null || _a === void 0 ? void 0 : _a.name) || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <strong>Canais:</strong> {rule.channelPriority.join(', ')}
                    </p>
                    <p className="text-sm">
                      <strong>Intervalo de retry:</strong> {rule.retryInterval} minutos
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button_1.Button variant="outline" size="sm">
                      <lucide_react_1.Edit className="h-4 w-4 mr-1"/>
                      Editar
                    </button_1.Button>
                    <button_1.Button variant="outline" size="sm">
                      <lucide_react_1.Trash2 className="h-4 w-4 mr-1"/>
                      Excluir
                    </button_1.Button>
                  </div>
                </card_1.CardContent>
              </card_1.Card>);
        })}
          </div>
        </tabs_1.TabsContent>

        {/* Analytics */}
        <tabs_1.TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Taxa de Entrega ao Longo do Tempo */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Taxa de Entrega</card_1.CardTitle>
                <card_1.CardDescription>Últimos 30 dias</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.AreaChart data={metrics}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                    <recharts_1.XAxis dataKey="date"/>
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip />
                    <recharts_1.Area type="monotone" dataKey="delivered" stackId="1" stroke={chartColors.success} fill={chartColors.success} fillOpacity={0.6}/>
                    <recharts_1.Area type="monotone" dataKey="failed" stackId="1" stroke={chartColors.danger} fill={chartColors.danger} fillOpacity={0.6}/>
                  </recharts_1.AreaChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>

            {/* Distribuição por Canal */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Distribuição por Canal</card_1.CardTitle>
                <card_1.CardDescription>Últimos 7 dias</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.PieChart>
                    <recharts_1.Pie data={channelPerformance} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="sent" label={function (_a) {
        var channel = _a.channel, sent = _a.sent;
        return "".concat(channel, ": ").concat(sent);
    }}>
                      {channelPerformance.map(function (entry, index) { return (<recharts_1.Cell key={"cell-".concat(index)} fill={Object.values(chartColors)[index % Object.values(chartColors).length]}/>); })}
                    </recharts_1.Pie>
                    <recharts_1.Tooltip />
                  </recharts_1.PieChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Tabela Detalhada */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Métricas Detalhadas</card_1.CardTitle>
              <card_1.CardDescription>
                Performance detalhada por canal e período
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Canal</th>
                      <th className="text-right p-2">Enviadas</th>
                      <th className="text-right p-2">Entregues</th>
                      <th className="text-right p-2">Falharam</th>
                      <th className="text-right p-2">Taxa</th>
                      <th className="text-right p-2">Tempo Médio</th>
                      <th className="text-right p-2">Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channelPerformance.map(function (channel) { return (<tr key={channel.channel} className="border-b">
                        <td className="p-2 flex items-center gap-2">
                          {getChannelIcon(channel.channel)}
                          <span className="capitalize">{channel.channel}</span>
                        </td>
                        <td className="text-right p-2">{channel.sent.toLocaleString()}</td>
                        <td className="text-right p-2">{channel.delivered.toLocaleString()}</td>
                        <td className="text-right p-2">{channel.failed.toLocaleString()}</td>
                        <td className="text-right p-2">{channel.rate.toFixed(1)}%</td>
                        <td className="text-right p-2">{channel.avgDeliveryTime.toFixed(1)}s</td>
                        <td className="text-right p-2">R$ {channel.cost.toFixed(2)}</td>
                      </tr>); })}
                  </tbody>
                </table>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Pacientes */}
        <tabs_1.TabsContent value="patients" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Engajamento de Pacientes</card_1.CardTitle>
              <card_1.CardDescription>
                Top 20 pacientes por score de resposta
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {patientEngagement.map(function (patient) { return (<div key={patient.patientId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{patient.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        Prefere: {patient.preferredChannel} • 
                        Última resposta: {patient.lastResponse}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-blue-500 rounded-full" style={{ width: "".concat(patient.responseScore, "%") }}/>
                        </div>
                        <span className="text-sm font-medium">{patient.responseScore}%</span>
                      </div>
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Configurações */}
        <tabs_1.TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Regras de Escalação */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Regras de Escalação</card_1.CardTitle>
                <card_1.CardDescription>
                  Configure escalação automática para não-resposta
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {escalationRules.map(function (rule) { return (<div key={rule.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {rule.triggerCondition} → {rule.targetUserName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(rule.active)}
                        <button_1.Button variant="outline" size="sm">
                          <lucide_react_1.Edit className="h-4 w-4"/>
                        </button_1.Button>
                      </div>
                    </div>); })}
                  <button_1.Button variant="outline" className="w-full">
                    <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
                    Nova Regra de Escalação
                  </button_1.Button>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Configurações Gerais */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Configurações Gerais</card_1.CardTitle>
                <card_1.CardDescription>
                  Configurações globais do sistema
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-envio de lembretes</p>
                      <p className="text-sm text-muted-foreground">
                        Enviar lembretes automáticos
                      </p>
                    </div>
                    <switch_1.Switch defaultChecked/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Escalação automática</p>
                      <p className="text-sm text-muted-foreground">
                        Escalar para gestores automaticamente
                      </p>
                    </div>
                    <switch_1.Switch defaultChecked/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Analytics avançado</p>
                      <p className="text-sm text-muted-foreground">
                        Coletar métricas detalhadas
                      </p>
                    </div>
                    <switch_1.Switch defaultChecked/>
                  </div>
                  <button_1.Button className="w-full">
                    <lucide_react_1.Settings className="h-4 w-4 mr-2"/>
                    Configurações Avançadas
                  </button_1.Button>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Dialog para novo template */}
      <dialog_1.Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <dialog_1.DialogContent className="max-w-2xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Novo Template de Notificação</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Crie um novo template para notificações automáticas
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          {/* Formulário de template seria implementado aqui */}
          <div className="space-y-4">
            <div>
              <label_1.Label htmlFor="template-name">Nome do Template</label_1.Label>
              <input_1.Input id="template-name" placeholder="Ex: Lembrete de Consulta"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label_1.Label htmlFor="template-type">Tipo</label_1.Label>
                <select_1.Select>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecione o tipo"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="reminder">Lembrete</select_1.SelectItem>
                    <select_1.SelectItem value="confirmation">Confirmação</select_1.SelectItem>
                    <select_1.SelectItem value="escalation">Escalação</select_1.SelectItem>
                    <select_1.SelectItem value="marketing">Marketing</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div>
                <label_1.Label htmlFor="template-channel">Canal</label_1.Label>
                <select_1.Select>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecione o canal"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="sms">SMS</select_1.SelectItem>
                    <select_1.SelectItem value="email">Email</select_1.SelectItem>
                    <select_1.SelectItem value="whatsapp">WhatsApp</select_1.SelectItem>
                    <select_1.SelectItem value="push">Push</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>
            <div>
              <label_1.Label htmlFor="template-subject">Assunto (opcional)</label_1.Label>
              <input_1.Input id="template-subject" placeholder="Assunto da mensagem"/>
            </div>
            <div>
              <label_1.Label htmlFor="template-content">Conteúdo</label_1.Label>
              <textarea_1.Textarea id="template-content" placeholder="Olá {patient_name}, sua consulta está agendada para {appointment_date}..." rows={4}/>
            </div>
            <div className="flex justify-end gap-2">
              <button_1.Button variant="outline" onClick={function () { return setIsTemplateDialogOpen(false); }}>
                Cancelar
              </button_1.Button>
              <button_1.Button onClick={function () { return setIsTemplateDialogOpen(false); }}>
                Criar Template
              </button_1.Button>
            </div>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
