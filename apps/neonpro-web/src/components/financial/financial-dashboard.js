/**
 * Financial Dashboard Component - Real-time Analytics Interface
 * Story 4.2: Financial Analytics & Business Intelligence
 * Phase 1: Real-time Cash Flow Dashboard
 *
 * This component provides a comprehensive financial dashboard with:
 * - Real-time financial metrics and KPIs
 * - Interactive charts and visualizations
 * - Automated alerts and notifications
 * - Predictive analytics and forecasting
 * - Performance indicators and benchmarks
 * - Actionable recommendations
 */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialDashboard = FinancialDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var separator_1 = require("@/components/ui/separator");
var scroll_area_1 = require("@/components/ui/scroll-area");
var lucide_react_1 = require("lucide-react");
var financial_dashboard_engine_1 = require("@/lib/financial/financial-dashboard-engine");
var formatters_1 = require("@/lib/utils/formatters");
var utils_1 = require("@/lib/utils");
// Chart components (simplified for now)
var LineChartComponent = function (_a) {
    var data = _a.data, className = _a.className;
    return (<div className={(0, utils_1.cn)('h-64 bg-muted/20 rounded-lg flex items-center justify-center', className)}>
    <lucide_react_1.LineChart className="h-8 w-8 text-muted-foreground"/>
    <span className="ml-2 text-sm text-muted-foreground">Chart: {data.length} data points</span>
  </div>);
};
var BarChartComponent = function (_a) {
    var data = _a.data, className = _a.className;
    return (<div className={(0, utils_1.cn)('h-64 bg-muted/20 rounded-lg flex items-center justify-center', className)}>
    <lucide_react_1.BarChart3 className="h-8 w-8 text-muted-foreground"/>
    <span className="ml-2 text-sm text-muted-foreground">Chart: {data.length} data points</span>
  </div>);
};
var PieChartComponent = function (_a) {
    var data = _a.data, className = _a.className;
    return (<div className={(0, utils_1.cn)('h-64 bg-muted/20 rounded-lg flex items-center justify-center', className)}>
    <lucide_react_1.PieChart className="h-8 w-8 text-muted-foreground"/>
    <span className="ml-2 text-sm text-muted-foreground">Chart: {data.length} segments</span>
  </div>);
};
function FinancialDashboard(_a) {
    var _this = this;
    var clinicId = _a.clinicId, _b = _a.refreshInterval, refreshInterval = _b === void 0 ? 300 : _b, // 5 minutes default
    className = _a.className;
    var _c = (0, react_1.useState)(null), dashboardData = _c[0], setDashboardData = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(null), error = _e[0], setError = _e[1];
    var _f = (0, react_1.useState)(null), lastUpdated = _f[0], setLastUpdated = _f[1];
    var _g = (0, react_1.useState)(true), autoRefresh = _g[0], setAutoRefresh = _g[1];
    var _h = (0, react_1.useState)('30d'), selectedTimeframe = _h[0], setSelectedTimeframe = _h[1];
    var dashboardEngine = new financial_dashboard_engine_1.FinancialDashboardEngine();
    var fetchDashboardData = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setError(null);
                    return [4 /*yield*/, dashboardEngine.getDashboardData(clinicId, {
                            refresh_interval: refreshInterval,
                            cache_duration: refreshInterval,
                            alert_thresholds: {},
                            display_preferences: {
                                currency: 'BRL',
                                date_format: 'DD/MM/YYYY',
                                number_format: 'pt-BR',
                                timezone: 'America/Sao_Paulo'
                            },
                            widgets_enabled: ['cash_flow', 'metrics', 'alerts', 'forecasts', 'recommendations'],
                            custom_metrics: []
                        })];
                case 1:
                    data = _a.sent();
                    setDashboardData(data);
                    setLastUpdated(new Date());
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    console.error('Error fetching dashboard data:', err_1);
                    setError(err_1 instanceof Error ? err_1.message : 'Failed to load dashboard data');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [clinicId, refreshInterval]);
    // Initial load
    (0, react_1.useEffect)(function () {
        fetchDashboardData();
    }, [fetchDashboardData]);
    // Auto-refresh
    (0, react_1.useEffect)(function () {
        if (!autoRefresh)
            return;
        var interval = setInterval(fetchDashboardData, refreshInterval * 1000);
        return function () { return clearInterval(interval); };
    }, [autoRefresh, refreshInterval, fetchDashboardData]);
    var getTrendIcon = function (trend) {
        switch (trend) {
            case 'up': return <lucide_react_1.ArrowUp className="h-4 w-4 text-green-500"/>;
            case 'down': return <lucide_react_1.ArrowDown className="h-4 w-4 text-red-500"/>;
            case 'stable': return <lucide_react_1.Minus className="h-4 w-4 text-yellow-500"/>;
        }
    };
    var getAlertIcon = function (severity) {
        switch (severity) {
            case 'critical': return <lucide_react_1.XCircle className="h-4 w-4 text-red-500"/>;
            case 'high': return <lucide_react_1.AlertTriangle className="h-4 w-4 text-orange-500"/>;
            case 'medium': return <lucide_react_1.Clock className="h-4 w-4 text-yellow-500"/>;
            case 'low': return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>;
            default: return <lucide_react_1.Bell className="h-4 w-4 text-blue-500"/>;
        }
    };
    var getPriorityColor = function (priority) {
        switch (priority) {
            case 'critical': return 'destructive';
            case 'high': return 'destructive';
            case 'medium': return 'default';
            case 'low': return 'secondary';
            default: return 'outline';
        }
    };
    if (loading && !dashboardData) {
        return (<div className={(0, utils_1.cn)('space-y-6', className)}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Dashboard Financeiro</h2>
            <p className="text-sm text-muted-foreground">Carregando dados financeiros...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {__spreadArray([], Array(4), true).map(function (_, i) { return (<card_1.Card key={i} className="animate-pulse">
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </card_1.CardContent>
            </card_1.Card>); })}
        </div>
      </div>);
    }
    if (error) {
        return (<div className={(0, utils_1.cn)('space-y-6', className)}>
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertTriangle className="h-4 w-4"/>
          <alert_1.AlertTitle>Erro ao carregar dashboard</alert_1.AlertTitle>
          <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
        </alert_1.Alert>
        <button_1.Button onClick={fetchDashboardData} variant="outline">
          <lucide_react_1.RefreshCw className="mr-2 h-4 w-4"/>
          Tentar novamente
        </button_1.Button>
      </div>);
    }
    if (!dashboardData) {
        return null;
    }
    return (<div className={(0, utils_1.cn)('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard Financeiro</h2>
          <p className="text-sm text-muted-foreground">
            Última atualização: {lastUpdated === null || lastUpdated === void 0 ? void 0 : lastUpdated.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button variant="outline" size="sm" onClick={function () { return setAutoRefresh(!autoRefresh); }}>
            <lucide_react_1.RefreshCw className={(0, utils_1.cn)('mr-2 h-4 w-4', autoRefresh && 'animate-spin')}/>
            {autoRefresh ? 'Auto' : 'Manual'}
          </button_1.Button>
          <button_1.Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <lucide_react_1.RefreshCw className="mr-2 h-4 w-4"/>
            Atualizar
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Download className="mr-2 h-4 w-4"/>
            Exportar
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Settings className="mr-2 h-4 w-4"/>
            Configurar
          </button_1.Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {dashboardData.alerts.filter(function (alert) { return alert.severity === 'critical'; }).length > 0 && (<alert_1.Alert variant="destructive">
          <lucide_react_1.AlertTriangle className="h-4 w-4"/>
          <alert_1.AlertTitle>Alertas Críticos</alert_1.AlertTitle>
          <alert_1.AlertDescription>
            {dashboardData.alerts.filter(function (alert) { return alert.severity === 'critical'; }).length} alertas críticos requerem atenção imediata.
          </alert_1.AlertDescription>
        </alert_1.Alert>)}

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Receita Total</card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {(0, formatters_1.formatCurrency)(dashboardData.metrics.total_revenue)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(dashboardData.metrics.revenue_growth.monthly > 0 ? 'up' : 'down')}
              <span className="ml-1">
                {(0, formatters_1.formatPercentage)(Math.abs(dashboardData.metrics.revenue_growth.monthly))} vs mês anterior
              </span>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Lucro Líquido</card_1.CardTitle>
            <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {(0, formatters_1.formatCurrency)(dashboardData.metrics.net_profit)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Margem: {(0, formatters_1.formatPercentage)(dashboardData.metrics.net_margin)}</span>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Fluxo de Caixa</card_1.CardTitle>
            <lucide_react_1.BarChart3 className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {(0, formatters_1.formatCurrency)(dashboardData.cash_flow.current_balance)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(dashboardData.cash_flow.net_cash_flow > 0 ? 'up' : 'down')}
              <span className="ml-1">
                {(0, formatters_1.formatCurrency)(Math.abs(dashboardData.cash_flow.net_cash_flow))} hoje
              </span>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Score Geral</card_1.CardTitle>
            <lucide_react_1.Target className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {Math.round(dashboardData.performance_indicators.overall_score)}/100
            </div>
            <progress_1.Progress value={dashboardData.performance_indicators.overall_score} className="mt-2"/>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Dashboard Tabs */}
      <tabs_1.Tabs defaultValue="overview" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="cash-flow">Fluxo de Caixa</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="forecasts">Previsões</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="alerts">Alertas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="recommendations">Recomendações</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Performance Indicators */}
            <card_1.Card className="col-span-1">
              <card_1.CardHeader>
                <card_1.CardTitle>Indicadores de Performance</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Saúde Financeira</span>
                    <span className="text-sm font-medium">
                      {Math.round(dashboardData.performance_indicators.financial_health_score)}/100
                    </span>
                  </div>
                  <progress_1.Progress value={dashboardData.performance_indicators.financial_health_score}/>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Crescimento</span>
                    <span className="text-sm font-medium">
                      {Math.round(dashboardData.performance_indicators.growth_score)}/100
                    </span>
                  </div>
                  <progress_1.Progress value={dashboardData.performance_indicators.growth_score}/>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Eficiência</span>
                    <span className="text-sm font-medium">
                      {Math.round(dashboardData.performance_indicators.efficiency_score)}/100
                    </span>
                  </div>
                  <progress_1.Progress value={dashboardData.performance_indicators.efficiency_score}/>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risco</span>
                    <span className="text-sm font-medium">
                      {Math.round(dashboardData.performance_indicators.risk_score)}/100
                    </span>
                  </div>
                  <progress_1.Progress value={dashboardData.performance_indicators.risk_score} className="[&>div]:bg-red-500"/>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Revenue Breakdown */}
            <card_1.Card className="col-span-1">
              <card_1.CardHeader>
                <card_1.CardTitle>Receita por Serviço</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <PieChartComponent data={dashboardData.metrics.revenue_by_service}/>
              </card_1.CardContent>
            </card_1.Card>

            {/* Expense Breakdown */}
            <card_1.Card className="col-span-1">
              <card_1.CardHeader>
                <card_1.CardTitle>Despesas por Categoria</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <PieChartComponent data={dashboardData.metrics.expense_by_category}/>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Trends Chart */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Tendências Financeiras</card_1.CardTitle>
              <card_1.CardDescription>
                Análise de tendências de receita, despesas e lucro
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <LineChartComponent data={[]}/>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="cash-flow" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Fluxo de Caixa Diário</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <BarChartComponent data={[]}/>
              </card_1.CardContent>
            </card_1.Card>
            
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Resumo do Fluxo de Caixa</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Saldo Inicial</span>
                  <span className="font-medium">
                    {(0, formatters_1.formatCurrency)(dashboardData.cash_flow.opening_balance)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Total de Entradas</span>
                  <span className="font-medium text-green-600">
                    +{(0, formatters_1.formatCurrency)(dashboardData.cash_flow.total_inflows)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">Total de Saídas</span>
                  <span className="font-medium text-red-600">
                    -{(0, formatters_1.formatCurrency)(dashboardData.cash_flow.total_outflows)}
                  </span>
                </div>
                <separator_1.Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Saldo Atual</span>
                  <span className="font-bold text-lg">
                    {(0, formatters_1.formatCurrency)(dashboardData.cash_flow.current_balance)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fluxo Líquido</span>
                  <span className={(0, utils_1.cn)('font-medium', dashboardData.cash_flow.net_cash_flow > 0 ? 'text-green-600' : 'text-red-600')}>
                    {dashboardData.cash_flow.net_cash_flow > 0 ? '+' : ''}
                    {(0, formatters_1.formatCurrency)(dashboardData.cash_flow.net_cash_flow)}
                  </span>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="forecasts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {dashboardData.forecasts.map(function (forecast, index) { return (<card_1.Card key={index}>
                <card_1.CardHeader>
                  <card_1.CardTitle className="capitalize">
                    Previsão de {forecast.type.replace('_', ' ')}
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    Próximos {forecast.period} - Confiança: {(0, formatters_1.formatPercentage)(forecast.confidence)}
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Valor Atual</span>
                    <span className="font-medium">
                      {(0, formatters_1.formatCurrency)(forecast.current_value)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Valor Previsto</span>
                    <span className="font-medium">
                      {(0, formatters_1.formatCurrency)(forecast.predicted_value)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Variação</span>
                    <div className="flex items-center">
                      {getTrendIcon(forecast.trend)}
                      <span className={(0, utils_1.cn)('ml-1 font-medium', forecast.change_percentage > 0 ? 'text-green-600' : 'text-red-600')}>
                        {forecast.change_percentage > 0 ? '+' : ''}
                        {(0, formatters_1.formatPercentage)(forecast.change_percentage / 100)}
                      </span>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="alerts" className="space-y-4">
          <scroll_area_1.ScrollArea className="h-96">
            <div className="space-y-4">
              {dashboardData.alerts.length === 0 ? (<card_1.Card>
                  <card_1.CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <lucide_react_1.CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4"/>
                      <h3 className="text-lg font-medium">Nenhum alerta ativo</h3>
                      <p className="text-sm text-muted-foreground">
                        Todos os indicadores financeiros estão dentro dos parâmetros normais.
                      </p>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>) : (dashboardData.alerts.map(function (alert, index) { return (<alert_1.Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                    {getAlertIcon(alert.severity)}
                    <alert_1.AlertTitle className="flex items-center justify-between">
                      <span>{alert.title}</span>
                      <badge_1.Badge variant={getPriorityColor(alert.severity)}>
                        {alert.severity}
                      </badge_1.Badge>
                    </alert_1.AlertTitle>
                    <alert_1.AlertDescription>
                      <p className="mb-2">{alert.description}</p>
                      <div className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString('pt-BR')}
                      </div>
                    </alert_1.AlertDescription>
                  </alert_1.Alert>); }))}
            </div>
          </scroll_area_1.ScrollArea>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="recommendations" className="space-y-4">
          <scroll_area_1.ScrollArea className="h-96">
            <div className="space-y-4">
              {dashboardData.recommendations.map(function (recommendation, index) { return (<card_1.Card key={index}>
                  <card_1.CardHeader>
                    <div className="flex items-center justify-between">
                      <card_1.CardTitle className="text-base">{recommendation.title}</card_1.CardTitle>
                      <badge_1.Badge variant={getPriorityColor(recommendation.priority)}>
                        {recommendation.priority}
                      </badge_1.Badge>
                    </div>
                    <card_1.CardDescription>{recommendation.description}</card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent className="space-y-4">
                    <div className="grid gap-2 md:grid-cols-3">
                      <div>
                        <span className="text-xs text-muted-foreground">Impacto Financeiro</span>
                        <p className="font-medium">
                          {(0, formatters_1.formatCurrency)(recommendation.expected_impact.financial_impact)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Prazo</span>
                        <p className="font-medium">{recommendation.expected_impact.timeframe}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Confiança</span>
                        <p className="font-medium">
                          {(0, formatters_1.formatPercentage)(recommendation.expected_impact.confidence)}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-muted-foreground">Próximos Passos</span>
                      <ul className="mt-1 text-sm space-y-1">
                        {recommendation.action_steps.slice(0, 3).map(function (step, stepIndex) { return (<li key={stepIndex} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{step}</span>
                          </li>); })}
                      </ul>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-muted-foreground">
                        Prazo: {new Date(recommendation.deadline).toLocaleDateString('pt-BR')}
                      </span>
                      <button_1.Button size="sm" variant="outline">
                        Ver Detalhes
                      </button_1.Button>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>); })}
            </div>
          </scroll_area_1.ScrollArea>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
exports.default = FinancialDashboard;
