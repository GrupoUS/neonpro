// Revenue Analytics Dashboard
// Epic 5, Story 5.1, Task 4: Revenue & Profitability Analysis UI
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================
'use client';
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
exports.default = RevenueAnalyticsDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var revenue_analytics_engine_1 = require("@/lib/financial/revenue-analytics-engine");
function RevenueAnalyticsDashboard() {
    var _this = this;
    var _a, _b;
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)('current_month'), dateRange = _d[0], setDateRange = _d[1];
    var _e = (0, react_1.useState)([]), serviceData = _e[0], setServiceData = _e[1];
    var _f = (0, react_1.useState)([]), providerData = _f[0], setProviderData = _f[1];
    var _g = (0, react_1.useState)([]), patientLTVData = _g[0], setPatientLTVData = _g[1];
    var _h = (0, react_1.useState)([]), timeSeriesData = _h[0], setTimeSeriesData = _h[1];
    var _j = (0, react_1.useState)([]), forecastData = _j[0], setForecastData = _j[1];
    var _k = (0, react_1.useState)({}), summaryMetrics = _k[0], setSummaryMetrics = _k[1];
    var revenueEngine = new revenue_analytics_engine_1.RevenueAnalyticsEngine();
    (0, react_1.useEffect)(function () {
        loadRevenueAnalytics();
    }, [dateRange]);
    var loadRevenueAnalytics = function () { return __awaiter(_this, void 0, void 0, function () {
        var clinicId, dateRanges, _a, serviceRevenue, providerPerformance, timeSeries, patientLTV, forecast, dashboardData, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    clinicId = 'clinic-1';
                    dateRanges = parseDateRange(dateRange);
                    return [4 /*yield*/, Promise.all([
                            revenueEngine.analyzeRevenueByService({
                                clinicId: clinicId,
                                dateRange: dateRanges
                            }),
                            revenueEngine.analyzeProviderPerformance({
                                clinicId: clinicId,
                                dateRange: dateRanges
                            }),
                            revenueEngine.generateTimePeriodAnalysis(clinicId, dateRanges, 'previous_period'),
                            revenueEngine.calculatePatientLifetimeValue(clinicId),
                            revenueEngine.generateRevenueForecast(clinicId, 6),
                            revenueEngine.getRevenueAnalyticsDashboard(clinicId, dateRanges)
                        ])];
                case 2:
                    _a = _b.sent(), serviceRevenue = _a[0], providerPerformance = _a[1], timeSeries = _a[2], patientLTV = _a[3], forecast = _a[4], dashboardData = _a[5];
                    setServiceData(serviceRevenue);
                    setProviderData(providerPerformance);
                    setTimeSeriesData(timeSeries);
                    setPatientLTVData(patientLTV);
                    setForecastData(forecast);
                    setSummaryMetrics(dashboardData.summary);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('Failed to load revenue analytics:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var parseDateRange = function (range) {
        var now = new Date();
        switch (range) {
            case 'current_month':
                return {
                    start: new Date(now.getFullYear(), now.getMonth(), 1),
                    end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
                };
            case 'last_quarter':
                var quarterStart = Math.floor(now.getMonth() / 3) * 3 - 3;
                return {
                    start: new Date(now.getFullYear(), quarterStart, 1),
                    end: new Date(now.getFullYear(), quarterStart + 3, 0)
                };
            case 'current_year':
                return {
                    start: new Date(now.getFullYear(), 0, 1),
                    end: new Date(now.getFullYear(), 11, 31)
                };
            default:
                return {
                    start: new Date(now.getFullYear(), now.getMonth(), 1),
                    end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
                };
        }
    };
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    };
    var formatPercent = function (percent) {
        return "".concat(percent.toFixed(1), "%");
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-96">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin"/>
        <span className="ml-2">Carregando analytics de receita...</span>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Revenue Analytics</h2>
          <p className="text-muted-foreground">
            Análise detalhada de receita e rentabilidade por serviço, provedor e paciente
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select_1.Select value={dateRange} onValueChange={setDateRange}>
            <select_1.SelectTrigger className="w-48">
              <select_1.SelectValue placeholder="Selecionar período"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="current_month">Mês Atual</select_1.SelectItem>
              <select_1.SelectItem value="last_quarter">Último Trimestre</select_1.SelectItem>
              <select_1.SelectItem value="current_year">Ano Atual</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          <button_1.Button onClick={loadRevenueAnalytics} variant="outline">
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2"/>
            Atualizar
          </button_1.Button>
          <button_1.Button variant="outline">
            <lucide_react_1.Download className="h-4 w-4 mr-2"/>
            Exportar
          </button_1.Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Receita Total</card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={summaryMetrics.growthRate > 0 ? 'text-green-600' : 'text-red-600'}>
                {summaryMetrics.growthRate > 0 ? '+' : ''}{formatPercent(summaryMetrics.growthRate || 0)}
              </span>
              {' '}vs período anterior
            </p>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Margem de Lucro Média</card_1.CardTitle>
            <lucide_react_1.Target className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{formatPercent(summaryMetrics.averageProfitMargin || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Meta: 35%
            </p>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Serviço Top</card_1.CardTitle>
            <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.topServiceRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {((_a = serviceData[0]) === null || _a === void 0 ? void 0 : _a.serviceName) || 'N/A'}
            </p>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Provedor Top</card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.topProviderRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {((_b = providerData[0]) === null || _b === void 0 ? void 0 : _b.providerName) || 'N/A'}
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Analytics Tabs */}
      <tabs_1.Tabs defaultValue="services" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="services">Análise por Serviço</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="providers">Performance de Provedores</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="patients">Lifetime Value</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="forecast">Previsão de Receita</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="services" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Receita por Serviço</card_1.CardTitle>
              <card_1.CardDescription>Análise de rentabilidade e performance por tipo de serviço</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {serviceData.map(function (service) { return (<div key={service.serviceId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{service.serviceName}</h4>
                        <badge_1.Badge variant={service.profitMargin > 30 ? 'default' : service.profitMargin > 15 ? 'secondary' : 'destructive'}>
                          {formatPercent(service.profitMargin)} margem
                        </badge_1.Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Receita Total</p>
                          <p className="font-medium">{formatCurrency(service.totalRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Transações</p>
                          <p className="font-medium">{service.transactionCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Valor Médio</p>
                          <p className="font-medium">{formatCurrency(service.averageValue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Crescimento</p>
                          <p className={"font-medium ".concat(service.growthRate > 0 ? 'text-green-600' : 'text-red-600')}>
                            {service.growthRate > 0 ? '+' : ''}{formatPercent(service.growthRate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="providers" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Performance de Provedores</card_1.CardTitle>
              <card_1.CardDescription>Análise de receita e eficiência por profissional</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {providerData.map(function (provider) { return (<div key={provider.providerId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{provider.providerName}</h4>
                        <badge_1.Badge variant="outline">{provider.specialization}</badge_1.Badge>
                      </div>
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Receita Total</p>
                          <p className="font-medium">{formatCurrency(provider.totalRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pacientes</p>
                          <p className="font-medium">{provider.patientCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Receita/Paciente</p>
                          <p className="font-medium">{formatCurrency(provider.averageRevenuePerPatient)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Utilização</p>
                          <div className="flex items-center space-x-2">
                            <progress_1.Progress value={provider.utilizationRate} className="flex-1"/>
                            <span className="text-xs">{formatPercent(provider.utilizationRate)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversão</p>
                          <p className="font-medium">{formatPercent(provider.conversionRate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="patients" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Lifetime Value dos Pacientes</card_1.CardTitle>
              <card_1.CardDescription>Análise de valor e comportamento dos pacientes</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {patientLTVData.slice(0, 10).map(function (patient) { return (<div key={patient.patientId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Paciente {patient.patientId.slice(-8)}</h4>
                        <div className="flex items-center space-x-2">
                          {patient.churnRisk > 0.7 && (<badge_1.Badge variant="destructive">
                              <lucide_react_1.AlertTriangle className="h-3 w-3 mr-1"/>
                              Alto Risco
                            </badge_1.Badge>)}
                          <badge_1.Badge variant={patient.totalLifetimeValue > 5000 ? 'default' : 'secondary'}>
                            {formatCurrency(patient.totalLifetimeValue)} LTV
                          </badge_1.Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Valor por Visita</p>
                          <p className="font-medium">{formatCurrency(patient.averageVisitValue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Frequência</p>
                          <p className="font-medium">{patient.visitFrequency.toFixed(1)} visitas/ano</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Retenção</p>
                          <p className="font-medium">{formatPercent(patient.retentionRate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Próxima Visita</p>
                          <p className="font-medium">{formatPercent(patient.nextVisitProbability)}</p>
                        </div>
                      </div>
                      {patient.recommendedActions.length > 0 && (<div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Ações Recomendadas:</p>
                          <div className="flex flex-wrap gap-1">
                            {patient.recommendedActions.map(function (action, index) { return (<badge_1.Badge key={index} variant="outline" className="text-xs">
                                {action}
                              </badge_1.Badge>); })}
                          </div>
                        </div>)}
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="forecast" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Previsão de Receita</card_1.CardTitle>
              <card_1.CardDescription>Projeções baseadas em dados históricos e tendências</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {forecastData.map(function (forecast, index) { return (<div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{forecast.period}</h4>
                        <badge_1.Badge variant={forecast.trend === 'increasing' ? 'default' : forecast.trend === 'decreasing' ? 'destructive' : 'secondary'}>
                          {forecast.trend === 'increasing' ? <lucide_react_1.TrendingUp className="h-3 w-3 mr-1"/> :
                forecast.trend === 'decreasing' ? <lucide_react_1.TrendingDown className="h-3 w-3 mr-1"/> : null}
                          {forecast.trend}
                        </badge_1.Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Receita Prevista</p>
                          <p className="font-medium">{formatCurrency(forecast.forecastedRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Intervalo de Confiança</p>
                          <p className="font-medium">
                            {formatCurrency(forecast.confidenceInterval.lower)} - {formatCurrency(forecast.confidenceInterval.upper)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Taxa de Crescimento</p>
                          <p className={"font-medium ".concat(forecast.growthRate > 0 ? 'text-green-600' : 'text-red-600')}>
                            {forecast.growthRate > 0 ? '+' : ''}{formatPercent(forecast.growthRate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
