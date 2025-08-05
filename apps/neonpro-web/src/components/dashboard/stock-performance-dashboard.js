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
exports.StockPerformanceDashboard = StockPerformanceDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var progress_1 = require("@/components/ui/progress");
var separator_1 = require("@/components/ui/separator");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#6366f1',
    neutral: '#6b7280'
};
var ALERT_COLORS = {
    low_stock: '#ef4444',
    expiring: '#f59e0b',
    expired: '#dc2626',
    overstock: '#6366f1'
};
function StockPerformanceDashboard(_a) {
    var _this = this;
    var clinicId = _a.clinicId, _b = _a.refreshInterval, refreshInterval = _b === void 0 ? 30000 : _b;
    var _c = (0, react_1.useState)([]), kpis = _c[0], setKpis = _c[1];
    var _d = (0, react_1.useState)([]), topProducts = _d[0], setTopProducts = _d[1];
    var _e = (0, react_1.useState)([]), alertsSummary = _e[0], setAlertsSummary = _e[1];
    var _f = (0, react_1.useState)([]), performanceData = _f[0], setPerformanceData = _f[1];
    var _g = (0, react_1.useState)(true), loading = _g[0], setLoading = _g[1];
    var _h = (0, react_1.useState)(null), error = _h[0], setError = _h[1];
    var _j = (0, react_1.useState)({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
        to: new Date()
    }), selectedDateRange = _j[0], setSelectedDateRange = _j[1];
    var _k = (0, react_1.useState)('30d'), selectedPeriod = _k[0], setSelectedPeriod = _k[1];
    var _l = (0, react_1.useState)(true), autoRefresh = _l[0], setAutoRefresh = _l[1];
    // Fetch dashboard data
    var fetchDashboardData = function () { return __awaiter(_this, void 0, void 0, function () {
        var params, _a, kpisRes, productsRes, alertsRes, metricsRes, _b, kpisData, productsData, alertsData, metricsData, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, 4, 5]);
                    setError(null);
                    params = new URLSearchParams(__assign(__assign({ clinicId: clinicId, period: selectedPeriod }, ((selectedDateRange === null || selectedDateRange === void 0 ? void 0 : selectedDateRange.from) && { startDate: selectedDateRange.from.toISOString() })), ((selectedDateRange === null || selectedDateRange === void 0 ? void 0 : selectedDateRange.to) && { endDate: selectedDateRange.to.toISOString() })));
                    return [4 /*yield*/, Promise.all([
                            fetch("/api/stock/dashboard/kpis?".concat(params)),
                            fetch("/api/stock/dashboard/top-products?".concat(params)),
                            fetch("/api/stock/dashboard/alerts-summary?".concat(params)),
                            fetch("/api/stock/dashboard/performance-metrics?".concat(params))
                        ])];
                case 1:
                    _a = _c.sent(), kpisRes = _a[0], productsRes = _a[1], alertsRes = _a[2], metricsRes = _a[3];
                    if (!kpisRes.ok || !productsRes.ok || !alertsRes.ok || !metricsRes.ok) {
                        throw new Error('Erro ao carregar dados do dashboard');
                    }
                    return [4 /*yield*/, Promise.all([
                            kpisRes.json(),
                            productsRes.json(),
                            alertsRes.json(),
                            metricsRes.json()
                        ])];
                case 2:
                    _b = _c.sent(), kpisData = _b[0], productsData = _b[1], alertsData = _b[2], metricsData = _b[3];
                    setKpis(kpisData.data);
                    setTopProducts(productsData.data);
                    setAlertsSummary(alertsData.data);
                    setPerformanceData(metricsData.data);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    setError(err_1 instanceof Error ? err_1.message : 'Erro desconhecido');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Auto refresh effect
    (0, react_1.useEffect)(function () {
        fetchDashboardData();
        if (autoRefresh && refreshInterval > 0) {
            var interval_1 = setInterval(fetchDashboardData, refreshInterval);
            return function () { return clearInterval(interval_1); };
        }
    }, [clinicId, selectedPeriod, selectedDateRange, autoRefresh, refreshInterval]);
    // Render KPI card
    var renderKPICard = function (kpi) {
        var TrendIcon = kpi.trend === 'up' ? lucide_react_1.ArrowUp : kpi.trend === 'down' ? lucide_react_1.ArrowDown : lucide_react_1.Minus;
        var trendColor = kpi.trend === 'up' ? COLORS.success : kpi.trend === 'down' ? COLORS.danger : COLORS.neutral;
        var statusColor = kpi.status === 'good' ? COLORS.success : kpi.status === 'warning' ? COLORS.warning : COLORS.danger;
        return (<card_1.Card key={kpi.key} className="relative overflow-hidden">
        <card_1.CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="text-sm font-medium text-gray-600">{kpi.label}</card_1.CardTitle>
            <badge_1.Badge variant={kpi.status === 'good' ? 'default' : kpi.status === 'warning' ? 'secondary' : 'destructive'} className="text-xs">
              {kpi.status === 'good' ? 'Bom' : kpi.status === 'warning' ? 'Atenção' : 'Crítico'}
            </badge_1.Badge>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold">
              {kpi.value.toLocaleString('pt-BR', { minimumFractionDigits: kpi.unit === '%' ? 1 : 0 })}
              <span className="text-sm font-normal ml-1">{kpi.unit}</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendIcon size={16} style={{ color: trendColor }}/>
              <span className="text-sm" style={{ color: trendColor }}>
                {Math.abs(kpi.trendValue)}%
              </span>
            </div>
          </div>
          
          {kpi.target && (<div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Meta: {kpi.target}{kpi.unit}</span>
                <span>{((kpi.value / kpi.target) * 100).toFixed(1)}%</span>
              </div>
              <progress_1.Progress value={(kpi.value / kpi.target) * 100} className="h-2" style={{ backgroundColor: statusColor }}/>
            </div>)}
          
          <p className="text-xs text-gray-500 mt-2">{kpi.description}</p>
        </card_1.CardContent>
      </card_1.Card>);
    };
    // Render top products chart
    var renderTopProductsChart = function () { return (<recharts_1.ResponsiveContainer width="100%" height={300}>
      <recharts_1.BarChart data={topProducts.slice(0, 10)}>
        <recharts_1.CartesianGrid strokeDasharray="3 3"/>
        <recharts_1.XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} fontSize={12}/>
        <recharts_1.YAxis />
        <recharts_1.Tooltip labelFormatter={function (label) { return "Produto: ".concat(label); }} formatter={function (value, name) { return [
            name === 'consumption' ? "".concat(value, " un.") : "R$ ".concat(value.toLocaleString('pt-BR')),
            name === 'consumption' ? 'Consumo' : 'Valor'
        ]; }}/>
        <recharts_1.Legend />
        <recharts_1.Bar dataKey="consumption" fill={COLORS.primary} name="Consumo"/>
        <recharts_1.Bar dataKey="value" fill={COLORS.success} name="Valor (R$)"/>
      </recharts_1.BarChart>
    </recharts_1.ResponsiveContainer>); };
    // Render alerts summary chart
    var renderAlertsSummaryChart = function () {
        var alertsData = alertsSummary.map(function (alert) { return ({
            name: alert.type.replace('_', ' ').toUpperCase(),
            value: alert.count,
            color: ALERT_COLORS[alert.type]
        }); });
        return (<recharts_1.ResponsiveContainer width="100%" height={300}>
        <recharts_1.PieChart>
          <recharts_1.Pie data={alertsData} cx="50%" cy="50%" labelLine={false} label={function (_a) {
            var name = _a.name, percent = _a.percent;
            return "".concat(name, " ").concat((percent * 100).toFixed(0), "%");
        }} outerRadius={80} fill="#8884d8" dataKey="value">
            {alertsData.map(function (entry, index) { return (<recharts_1.Cell key={"cell-".concat(index)} fill={entry.color}/>); })}
          </recharts_1.Pie>
          <recharts_1.Tooltip formatter={function (value) { return ["".concat(value, " alertas"), 'Quantidade']; }}/>
        </recharts_1.PieChart>
      </recharts_1.ResponsiveContainer>);
    };
    // Render performance trends chart
    var renderPerformanceTrendsChart = function () { return (<recharts_1.ResponsiveContainer width="100%" height={400}>
      <recharts_1.ComposedChart data={performanceData}>
        <recharts_1.CartesianGrid strokeDasharray="3 3"/>
        <recharts_1.XAxis dataKey="date"/>
        <recharts_1.YAxis yAxisId="left"/>
        <recharts_1.YAxis yAxisId="right" orientation="right"/>
        <recharts_1.Tooltip labelFormatter={function (label) { return "Data: ".concat(label); }} formatter={function (value, name) {
            switch (name) {
                case 'turnoverRate': return ["".concat(value, "x"), 'Giro de Estoque'];
                case 'accuracy': return ["".concat(value, "%"), 'Acuracidade'];
                case 'wastePercentage': return ["".concat(value, "%"), 'Desperdício'];
                case 'daysCoverage': return ["".concat(value, " dias"), 'Cobertura'];
                default: return [value, name];
            }
        }}/>
        <recharts_1.Legend />
        <recharts_1.Line yAxisId="left" type="monotone" dataKey="turnoverRate" stroke={COLORS.primary} name="Giro"/>
        <recharts_1.Line yAxisId="left" type="monotone" dataKey="accuracy" stroke={COLORS.success} name="Acuracidade"/>
        <recharts_1.Area yAxisId="right" type="monotone" dataKey="wastePercentage" fill={COLORS.danger} fillOpacity={0.3} stroke={COLORS.danger} name="Desperdício"/>
        <recharts_1.Bar yAxisId="right" dataKey="daysCoverage" fill={COLORS.warning} fillOpacity={0.7} name="Cobertura"/>
      </recharts_1.ComposedChart>
    </recharts_1.ResponsiveContainer>); };
    if (loading) {
        return (<div className="flex items-center justify-center h-96">
        <lucide_react_1.RefreshCw className="animate-spin" size={32}/>
        <span className="ml-2">Carregando dashboard...</span>
      </div>);
    }
    if (error) {
        return (<alert_1.Alert variant="destructive">
        <lucide_react_1.AlertTriangle className="h-4 w-4"/>
        <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
      </alert_1.Alert>);
    }
    return (<div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard de Performance</h2>
          <p className="text-muted-foreground">
            Métricas e indicadores de performance do estoque em tempo real
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select_1.Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <select_1.SelectTrigger className="w-32">
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="7d">7 dias</select_1.SelectItem>
              <select_1.SelectItem value="30d">30 dias</select_1.SelectItem>
              <select_1.SelectItem value="90d">90 dias</select_1.SelectItem>
              <select_1.SelectItem value="1y">1 ano</select_1.SelectItem>
              <select_1.SelectItem value="custom">Personalizado</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          
          <button_1.Button variant="outline" size="sm" onClick={function () { return setAutoRefresh(!autoRefresh); }} className={autoRefresh ? 'text-green-600' : 'text-gray-600'}>
            <lucide_react_1.Activity size={16} className="mr-1"/>
            {autoRefresh ? 'Auto' : 'Manual'}
          </button_1.Button>
          
          <button_1.Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <lucide_react_1.RefreshCw size={16} className="mr-1"/>
            Atualizar
          </button_1.Button>
          
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Download size={16} className="mr-1"/>
            Exportar
          </button_1.Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map(renderKPICard)}
      </div>

      {/* Charts Section */}
      <tabs_1.Tabs defaultValue="trends" className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="trends">Tendências</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="products">Top Produtos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="alerts">Alertas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Analytics</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="trends" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Tendências de Performance</card_1.CardTitle>
              <card_1.CardDescription>
                Evolução das principais métricas de estoque ao longo do tempo
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {renderPerformanceTrendsChart()}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="products" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Top 10 Produtos por Consumo</card_1.CardTitle>
              <card_1.CardDescription>
                Produtos com maior impacto no consumo e valor financeiro
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {renderTopProductsChart()}
            </card_1.CardContent>
          </card_1.Card>
          
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Análise Detalhada de Produtos</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {topProducts.slice(0, 5).map(function (product, index) { return (<div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.consumption} un. • R$ {product.value.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <badge_1.Badge variant={product.impact === 'high' ? 'destructive' : product.impact === 'medium' ? 'secondary' : 'outline'}>
                        {product.impact === 'high' ? 'Alto Impacto' : product.impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'}
                      </badge_1.Badge>
                      {product.trend === 'up' ? (<lucide_react_1.TrendingUp size={16} className="text-green-600"/>) : product.trend === 'down' ? (<lucide_react_1.TrendingDown size={16} className="text-red-600"/>) : (<lucide_react_1.Minus size={16} className="text-gray-600"/>)}
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Distribuição de Alertas</card_1.CardTitle>
                <card_1.CardDescription>
                  Breakdown de alertas ativos por categoria
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                {renderAlertsSummaryChart()}
              </card_1.CardContent>
            </card_1.Card>
            
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Status dos Alertas</card_1.CardTitle>
                <card_1.CardDescription>
                  Resumo detalhado dos alertas por tipo
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {alertsSummary.map(function (alert) { return (<div key={alert.type} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ALERT_COLORS[alert.type] }}/>
                        <span className="font-medium capitalize">
                          {alert.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <badge_1.Badge variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'high' ? 'secondary' : 'outline'}>
                          {alert.count} alertas
                        </badge_1.Badge>
                        {alert.trend === 'up' ? (<lucide_react_1.TrendingUp size={16} className="text-red-600"/>) : alert.trend === 'down' ? (<lucide_react_1.TrendingDown size={16} className="text-green-600"/>) : (<lucide_react_1.Minus size={16} className="text-gray-600"/>)}
                      </div>
                    </div>); })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center">
                  <lucide_react_1.Target className="mr-2" size={20}/>
                  Metas vs Realizado
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Giro de Estoque</span>
                      <span>85%</span>
                    </div>
                    <progress_1.Progress value={85} className="h-2"/>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Acuracidade</span>
                      <span>92%</span>
                    </div>
                    <progress_1.Progress value={92} className="h-2"/>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Redução Desperdício</span>
                      <span>78%</span>
                    </div>
                    <progress_1.Progress value={78} className="h-2"/>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
            
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center">
                  <lucide_react_1.DollarSign className="mr-2" size={20}/>
                  Impacto Financeiro
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Valor Total Estoque:</span>
                    <span className="font-medium">R$ 125.430</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economia Perdas:</span>
                    <span className="font-medium text-green-600">R$ 3.245</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo Oportunidade:</span>
                    <span className="font-medium text-orange-600">R$ 1.890</span>
                  </div>
                  <separator_1.Separator className="my-2"/>
                  <div className="flex justify-between font-semibold">
                    <span>ROI Mensal:</span>
                    <span className="text-green-600">+12.3%</span>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
            
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center">
                  <lucide_react_1.BarChart3 className="mr-2" size={20}/>
                  Previsões
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Próxima Reposição:</span>
                    <span className="font-medium">3 dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risco de Falta:</span>
                    <span className="font-medium text-orange-600">Médio</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Produtos Críticos:</span>
                    <span className="font-medium text-red-600">12 itens</span>
                  </div>
                  <separator_1.Separator className="my-2"/>
                  <div className="flex justify-between font-semibold">
                    <span>Confiabilidade:</span>
                    <span className="text-blue-600">87%</span>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
exports.default = StockPerformanceDashboard;
