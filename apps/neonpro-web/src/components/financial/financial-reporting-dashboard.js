// =====================================================================================
// Financial Reporting Dashboard - Real-time Analytics
// Epic 5, Story 5.1: Advanced Financial Reporting + Real-time Insights
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
exports.default = FinancialReportingDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var separator_1 = require("@/components/ui/separator");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var financial_reporting_1 = require("@/lib/types/financial-reporting");
var analytics_core_1 = require("@/lib/financial/analytics-core");
function FinancialReportingDashboard(_a) {
    // =====================================================================================
    // STATE MANAGEMENT
    // =====================================================================================
    var _this = this;
    var clinicId = _a.clinicId, _b = _a.className, className = _b === void 0 ? '' : _b;
    var _c = (0, react_1.useState)(null), dashboardData = _c[0], setDashboardData = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(false), refreshing = _e[0], setRefreshing = _e[1];
    var _f = (0, react_1.useState)('current_month'), selectedPeriod = _f[0], setSelectedPeriod = _f[1];
    var _g = (0, react_1.useState)(true), autoRefresh = _g[0], setAutoRefresh = _g[1];
    var _h = (0, react_1.useState)(null), lastUpdated = _h[0], setLastUpdated = _h[1];
    var analyticsCore = (0, react_1.useState)(function () { return new analytics_core_1.FinancialAnalyticsCore(); })[0];
    // =====================================================================================
    // DATA FETCHING AND REFRESH LOGIC
    // =====================================================================================
    var fetchDashboardData = (0, react_1.useCallback)(function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (showLoading) {
            var data, error_1;
            if (showLoading === void 0) { showLoading = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        if (showLoading)
                            setLoading(true);
                        setRefreshing(true);
                        return [4 /*yield*/, analyticsCore.generateDashboardData(clinicId)];
                    case 1:
                        data = _a.sent();
                        setDashboardData(data);
                        setLastUpdated(new Date());
                        if (!showLoading) {
                            sonner_1.toast.success('Dashboard atualizado com sucesso');
                        }
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error fetching dashboard data:', error_1);
                        sonner_1.toast.error('Erro ao carregar dados do dashboard');
                        return [3 /*break*/, 4];
                    case 3:
                        setLoading(false);
                        setRefreshing(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }, [clinicId, analyticsCore]);
    // Auto-refresh effect
    (0, react_1.useEffect)(function () {
        fetchDashboardData();
        if (autoRefresh) {
            var interval_1 = setInterval(function () {
                fetchDashboardData(false);
            }, financial_reporting_1.DASHBOARD_REFRESH_INTERVALS.FINANCIAL_OVERVIEW);
            return function () { return clearInterval(interval_1); };
        }
    }, [fetchDashboardData, autoRefresh]);
    // =====================================================================================
    // UTILITY FUNCTIONS
    // =====================================================================================
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    var formatPercentage = function (value) {
        return "".concat(value.toFixed(2), "%");
    };
    var getTrendIcon = function (trend) {
        switch (trend) {
            case 'up':
                return <lucide_react_1.TrendingUp className="h-4 w-4"/>;
            case 'down':
                return <lucide_react_1.TrendingDown className="h-4 w-4"/>;
            default:
                return <lucide_react_1.Activity className="h-4 w-4"/>;
        }
    };
    var getTrendColor = function (trend, color) {
        if (trend === 'stable')
            return 'text-muted-foreground';
        return color === 'green' ? 'text-green-600' : 'text-red-600';
    };
    // =====================================================================================
    // COMPONENT RENDERING
    // =====================================================================================
    if (loading) {
        return (<div className={"space-y-8 ".concat(className)}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios Financeiros</h1>
            <p className="text-muted-foreground">
              Análise avançada e insights em tempo real
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <lucide_react_1.RefreshCw className="h-4 w-4 animate-spin"/>
            <span className="text-sm text-muted-foreground">Carregando...</span>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map(function (_, i) { return (<card_1.Card key={i}>
              <card_1.CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted animate-pulse rounded"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-8 bg-muted animate-pulse rounded mb-2"/>
                <div className="h-3 bg-muted animate-pulse rounded w-1/2"/>
              </card_1.CardContent>
            </card_1.Card>); })}
        </div>
      </div>);
    }
    if (!dashboardData) {
        return (<div className={"space-y-8 ".concat(className)}>
        <alert_1.Alert>
          <lucide_react_1.AlertTriangle className="h-4 w-4"/>
          <alert_1.AlertTitle>Erro ao Carregar Dados</alert_1.AlertTitle>
          <alert_1.AlertDescription>
            Não foi possível carregar os dados do dashboard. Tente novamente.
          </alert_1.AlertDescription>
        </alert_1.Alert>
        <button_1.Button onClick={function () { return fetchDashboardData(); }}>
          <lucide_react_1.RefreshCw className="mr-2 h-4 w-4"/>
          Tentar Novamente
        </button_1.Button>
      </div>);
    }
    return (<div className={"space-y-8 ".concat(className)}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">
            Análise avançada e insights em tempo real
            {lastUpdated && (<span className="ml-2 text-xs">
                • Atualizado em {lastUpdated.toLocaleTimeString('pt-BR')}
              </span>)}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select_1.Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <select_1.SelectTrigger className="w-[180px]">
              <select_1.SelectValue placeholder="Período"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="current_month">Mês Atual</select_1.SelectItem>
              <select_1.SelectItem value="last_month">Mês Anterior</select_1.SelectItem>
              <select_1.SelectItem value="current_quarter">Trimestre Atual</select_1.SelectItem>
              <select_1.SelectItem value="current_year">Ano Atual</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>

          <button_1.Button variant="outline" size="sm" onClick={function () { return setAutoRefresh(!autoRefresh); }}>
            <lucide_react_1.Activity className={"mr-2 h-4 w-4 ".concat(autoRefresh ? 'text-green-600' : 'text-muted-foreground')}/>
            Auto
          </button_1.Button>

          <button_1.Button variant="outline" size="sm" onClick={function () { return fetchDashboardData(false); }} disabled={refreshing}>
            <lucide_react_1.RefreshCw className={"mr-2 h-4 w-4 ".concat(refreshing ? 'animate-spin' : '')}/>
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button_1.Button>

          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Download className="mr-2 h-4 w-4"/>
            Exportar
          </button_1.Button>
        </div>
      </div>

      {/* Financial Alerts */}
      {dashboardData.alerts && dashboardData.alerts.length > 0 && (<div className="space-y-2">
          {dashboardData.alerts.map(function (alert, index) { return (<alert_1.Alert key={index} variant={alert.type === 'danger' ? 'destructive' : 'default'}>
              <lucide_react_1.AlertTriangle className="h-4 w-4"/>
              <alert_1.AlertTitle>{alert.title}</alert_1.AlertTitle>
              <alert_1.AlertDescription>{alert.message}</alert_1.AlertDescription>
            </alert_1.Alert>); })}
        </div>)}

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Revenue */}
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Receita Total</card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.summary_cards.total_revenue.value)}
            </div>
            <div className={"flex items-center text-xs ".concat(getTrendColor(dashboardData.summary_cards.total_revenue.trend, dashboardData.summary_cards.total_revenue.color))}>
              {getTrendIcon(dashboardData.summary_cards.total_revenue.trend)}
              <span className="ml-1">
                {formatCurrency(Math.abs(dashboardData.summary_cards.total_revenue.change_from_previous))} vs mês anterior
              </span>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Total Expenses */}
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Despesas Totais</card_1.CardTitle>
            <lucide_react_1.PieChart className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.summary_cards.total_expenses.value)}
            </div>
            <div className={"flex items-center text-xs ".concat(getTrendColor(dashboardData.summary_cards.total_expenses.trend, dashboardData.summary_cards.total_expenses.color))}>
              {getTrendIcon(dashboardData.summary_cards.total_expenses.trend)}
              <span className="ml-1">
                {formatCurrency(Math.abs(dashboardData.summary_cards.total_expenses.change_from_previous))} vs mês anterior
              </span>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Net Profit */}
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Lucro Líquido</card_1.CardTitle>
            <lucide_react_1.Target className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.summary_cards.net_profit.value)}
            </div>
            <div className={"flex items-center text-xs ".concat(getTrendColor(dashboardData.summary_cards.net_profit.trend, dashboardData.summary_cards.net_profit.color))}>
              {getTrendIcon(dashboardData.summary_cards.net_profit.trend)}
              <span className="ml-1">
                {formatCurrency(Math.abs(dashboardData.summary_cards.net_profit.change_from_previous))} vs mês anterior
              </span>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Cash Flow */}
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Fluxo de Caixa</card_1.CardTitle>
            <lucide_react_1.BarChart3 className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.summary_cards.cash_flow.value)}
            </div>
            <div className={"flex items-center text-xs ".concat(getTrendColor(dashboardData.summary_cards.cash_flow.trend, dashboardData.summary_cards.cash_flow.color))}>
              {getTrendIcon(dashboardData.summary_cards.cash_flow.trend)}
              <span className="ml-1">
                {formatCurrency(Math.abs(dashboardData.summary_cards.cash_flow.change_from_previous))} vs mês anterior
              </span>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Patient Count */}
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Taxa de Retenção</card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(dashboardData.summary_cards.patient_count.value)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <lucide_react_1.Activity className="h-3 w-3 mr-1"/>
              <span>Estável este mês</span>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Average Transaction Value */}
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Ticket Médio</card_1.CardTitle>
            <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.summary_cards.avg_transaction_value.value)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <lucide_react_1.Activity className="h-3 w-3 mr-1"/>
              <span>Por consulta</span>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* KPI Dashboard */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Indicadores de Performance (KPIs)</card_1.CardTitle>
          <card_1.CardDescription>
            Principais métricas financeiras e operacionais
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-6">
          {/* Profitability KPIs */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Rentabilidade</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Margem Bruta</span>
                  <span className="text-xs font-medium">
                    {formatPercentage(dashboardData.charts_data.kpi_dashboard.gross_margin)}
                  </span>
                </div>
                <progress_1.Progress value={dashboardData.charts_data.kpi_dashboard.gross_margin}/>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Margem Operacional</span>
                  <span className="text-xs font-medium">
                    {formatPercentage(dashboardData.charts_data.kpi_dashboard.operating_margin)}
                  </span>
                </div>
                <progress_1.Progress value={Math.max(0, dashboardData.charts_data.kpi_dashboard.operating_margin)}/>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Margem Líquida</span>
                  <span className="text-xs font-medium">
                    {formatPercentage(dashboardData.charts_data.kpi_dashboard.net_margin)}
                  </span>
                </div>
                <progress_1.Progress value={Math.max(0, dashboardData.charts_data.kpi_dashboard.net_margin)}/>
              </div>
            </div>
          </div>

          <separator_1.Separator />

          {/* Liquidity and Leverage KPIs */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Liquidez e Alavancagem</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Liquidez Corrente</span>
                  <span className="text-xs font-medium">
                    {dashboardData.charts_data.kpi_dashboard.current_ratio.toFixed(2)}
                  </span>
                </div>
                <progress_1.Progress value={Math.min(100, dashboardData.charts_data.kpi_dashboard.current_ratio * 50)}/>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Endividamento</span>
                  <span className="text-xs font-medium">
                    {formatPercentage(dashboardData.charts_data.kpi_dashboard.debt_ratio * 100)}
                  </span>
                </div>
                <progress_1.Progress value={dashboardData.charts_data.kpi_dashboard.debt_ratio * 100}/>
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Recommendations */}
      {dashboardData.recommendations && dashboardData.recommendations.length > 0 && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Recomendações</card_1.CardTitle>
            <card_1.CardDescription>
              Sugestões baseadas em análise financeira avançada
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            {dashboardData.recommendations.map(function (rec, index) { return (<div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{rec.title}</h4>
                  <badge_1.Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                    {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                  </badge_1.Badge>
                </div>
                <p className="text-xs text-muted-foreground">{rec.description}</p>
                <p className="text-xs font-medium text-green-600">{rec.expected_impact}</p>
              </div>); })}
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
