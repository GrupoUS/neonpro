"use client";
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
exports.default = FinancialKPIDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var label_1 = require("@/components/ui/label");
var scroll_area_1 = require("@/components/ui/scroll-area");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var switch_1 = require("@/components/ui/switch");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
// Mock data generator for demonstration
var generateMockKPIs = function () {
    var baseDate = new Date();
    return [
        {
            id: 'revenue-total',
            name: 'Receita Total',
            value: 125000,
            previousValue: 118000,
            target: 130000,
            unit: 'currency',
            trend: 'up',
            changePercentage: 5.93,
            category: 'revenue',
            description: 'Receita total do período selecionado',
            drillDownData: [
                { id: 'facial', label: 'Tratamentos Faciais', value: 45000, percentage: 36, trend: 'up' },
                { id: 'body', label: 'Tratamentos Corporais', value: 38000, percentage: 30.4, trend: 'up' },
                { id: 'laser', label: 'Laser e Luz', value: 25000, percentage: 20, trend: 'stable' },
                { id: 'products', label: 'Produtos', value: 17000, percentage: 13.6, trend: 'down' }
            ],
            alerts: [
                {
                    id: 'revenue-target',
                    type: 'info',
                    message: 'Receita 3.8% abaixo da meta mensal',
                    threshold: 130000,
                    currentValue: 125000,
                    createdAt: new Date(),
                    acknowledged: false
                }
            ],
            benchmarkData: {
                industryAverage: 110000,
                topPerformers: 150000,
                clinicRanking: 15,
                totalClinics: 100
            }
        },
        {
            id: 'profit-margin',
            name: 'Margem de Lucro',
            value: 32.5,
            previousValue: 28.3,
            target: 35,
            unit: 'percentage',
            trend: 'up',
            changePercentage: 14.84,
            category: 'profitability',
            description: 'Margem de lucro líquido sobre receita',
            drillDownData: [
                { id: 'gross-margin', label: 'Margem Bruta', value: 65.2, percentage: 100, trend: 'up' },
                { id: 'operating-margin', label: 'Margem Operacional', value: 42.1, percentage: 64.6, trend: 'up' },
                { id: 'net-margin', label: 'Margem Líquida', value: 32.5, percentage: 49.8, trend: 'up' }
            ],
            benchmarkData: {
                industryAverage: 25.8,
                topPerformers: 40.2,
                clinicRanking: 8,
                totalClinics: 100
            }
        },
        {
            id: 'ebitda',
            name: 'EBITDA',
            value: 48500,
            previousValue: 42300,
            target: 52000,
            unit: 'currency',
            trend: 'up',
            changePercentage: 14.66,
            category: 'profitability',
            description: 'Lucro antes de juros, impostos, depreciação e amortização',
            drillDownData: [
                { id: 'operating-income', label: 'Receita Operacional', value: 125000, percentage: 100, trend: 'up' },
                { id: 'operating-expenses', label: 'Despesas Operacionais', value: -76500, percentage: -61.2, trend: 'down' },
                { id: 'ebitda-result', label: 'EBITDA', value: 48500, percentage: 38.8, trend: 'up' }
            ]
        },
        {
            id: 'cash-flow',
            name: 'Fluxo de Caixa',
            value: 35200,
            previousValue: 28900,
            target: 40000,
            unit: 'currency',
            trend: 'up',
            changePercentage: 21.8,
            category: 'liquidity',
            description: 'Fluxo de caixa operacional do período',
            alerts: [
                {
                    id: 'cash-flow-warning',
                    type: 'warning',
                    message: 'Fluxo de caixa projetado para próxima semana abaixo do ideal',
                    threshold: 40000,
                    currentValue: 35200,
                    createdAt: new Date(),
                    acknowledged: false
                }
            ]
        },
        {
            id: 'roi',
            name: 'ROI',
            value: 18.7,
            previousValue: 16.2,
            target: 20,
            unit: 'percentage',
            trend: 'up',
            changePercentage: 15.43,
            category: 'efficiency',
            description: 'Retorno sobre investimento',
            benchmarkData: {
                industryAverage: 14.5,
                topPerformers: 25.3,
                clinicRanking: 12,
                totalClinics: 100
            }
        },
        {
            id: 'patient-ltv',
            name: 'LTV do Paciente',
            value: 2850,
            previousValue: 2650,
            target: 3000,
            unit: 'currency',
            trend: 'up',
            changePercentage: 7.55,
            category: 'efficiency',
            description: 'Valor vitalício médio do paciente'
        }
    ];
};
var generateMockWidgets = function () { return [
    { id: 'revenue-kpi', type: 'kpi', title: 'Receita Total', size: 'medium', position: { x: 0, y: 0 }, visible: true, config: {} },
    { id: 'profit-kpi', type: 'kpi', title: 'Margem de Lucro', size: 'medium', position: { x: 1, y: 0 }, visible: true, config: {} },
    { id: 'ebitda-kpi', type: 'kpi', title: 'EBITDA', size: 'medium', position: { x: 2, y: 0 }, visible: true, config: {} },
    { id: 'cash-flow-kpi', type: 'kpi', title: 'Fluxo de Caixa', size: 'medium', position: { x: 0, y: 1 }, visible: true, config: {} },
    { id: 'roi-kpi', type: 'kpi', title: 'ROI', size: 'medium', position: { x: 1, y: 1 }, visible: true, config: {} },
    { id: 'ltv-kpi', type: 'kpi', title: 'LTV Paciente', size: 'medium', position: { x: 2, y: 1 }, visible: true, config: {} }
]; };
function FinancialKPIDashboard(_a) {
    var _this = this;
    var clinicId = _a.clinicId, userId = _a.userId, userRole = _a.userRole, onKPIClick = _a.onKPIClick, onExport = _a.onExport, _b = _a.className, className = _b === void 0 ? '' : _b;
    // State management
    var _c = (0, react_1.useState)([]), kpis = _c[0], setKpis = _c[1];
    var _d = (0, react_1.useState)([]), widgets = _d[0], setWidgets = _d[1];
    var _e = (0, react_1.useState)(null), selectedKPI = _e[0], setSelectedKPI = _e[1];
    var _f = (0, react_1.useState)(true), isLoading = _f[0], setIsLoading = _f[1];
    var _g = (0, react_1.useState)(new Date()), lastUpdated = _g[0], setLastUpdated = _g[1];
    var _h = (0, react_1.useState)(true), autoRefresh = _h[0], setAutoRefresh = _h[1];
    var _j = (0, react_1.useState)(30), refreshInterval = _j[0], setRefreshInterval = _j[1]; // seconds
    var _k = (0, react_1.useState)(false), isCustomizing = _k[0], setIsCustomizing = _k[1];
    var _l = (0, react_1.useState)('overview'), activeTab = _l[0], setActiveTab = _l[1];
    // Filter state
    var _m = (0, react_1.useState)({
        dateRange: {
            start: (0, date_fns_1.startOfMonth)(new Date()),
            end: (0, date_fns_1.endOfMonth)(new Date()),
            preset: 'current-month'
        },
        services: [],
        providers: [],
        locations: [],
        patientSegments: []
    }), filters = _m[0], setFilters = _m[1];
    // Load dashboard data
    var loadDashboardData = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var mockKPIs, mockWidgets, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    // Simulate API call with realistic delay
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 800); })];
                case 2:
                    // Simulate API call with realistic delay
                    _a.sent();
                    mockKPIs = generateMockKPIs();
                    mockWidgets = generateMockWidgets();
                    setKpis(mockKPIs);
                    setWidgets(mockWidgets);
                    setLastUpdated(new Date());
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error loading dashboard data:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [filters]);
    // Auto-refresh effect
    (0, react_1.useEffect)(function () {
        loadDashboardData();
        if (autoRefresh) {
            var interval_1 = setInterval(loadDashboardData, refreshInterval * 1000);
            return function () { return clearInterval(interval_1); };
        }
    }, [loadDashboardData, autoRefresh, refreshInterval]);
    // Format currency
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    // Format percentage
    var formatPercentage = function (value) {
        return "".concat(value.toFixed(1), "%");
    };
    // Format number
    var formatNumber = function (value) {
        return new Intl.NumberFormat('pt-BR').format(value);
    };
    // Get formatted value based on unit
    var getFormattedValue = function (kpi) {
        switch (kpi.unit) {
            case 'currency':
                return formatCurrency(kpi.value);
            case 'percentage':
                return formatPercentage(kpi.value);
            case 'number':
                return formatNumber(kpi.value);
            default:
                return kpi.value.toString();
        }
    };
    // Get trend icon
    var getTrendIcon = function (trend) {
        switch (trend) {
            case 'up':
                return <lucide_react_1.TrendingUp className="h-4 w-4 text-green-500"/>;
            case 'down':
                return <lucide_react_1.TrendingDown className="h-4 w-4 text-red-500"/>;
            case 'stable':
                return <lucide_react_1.Activity className="h-4 w-4 text-yellow-500"/>;
        }
    };
    // Get category icon
    var getCategoryIcon = function (category) {
        switch (category) {
            case 'revenue':
                return <lucide_react_1.DollarSign className="h-5 w-5"/>;
            case 'profitability':
                return <lucide_react_1.PieChart className="h-5 w-5"/>;
            case 'efficiency':
                return <lucide_react_1.Target className="h-5 w-5"/>;
            case 'liquidity':
                return <lucide_react_1.Activity className="h-5 w-5"/>;
            default:
                return <lucide_react_1.BarChart3 className="h-5 w-5"/>;
        }
    };
    // Handle KPI click for drill-down
    var handleKPIClick = function (kpi) {
        setSelectedKPI(kpi);
        onKPIClick === null || onKPIClick === void 0 ? void 0 : onKPIClick(kpi);
    };
    // Handle export
    var handleExport = function (format) {
        onExport === null || onExport === void 0 ? void 0 : onExport(format);
    };
    // Filter KPIs by category
    var getKPIsByCategory = function (category) {
        return kpis.filter(function (kpi) { return kpi.category === category; });
    };
    // Get active alerts
    var activeAlerts = (0, react_1.useMemo)(function () {
        return kpis.flatMap(function (kpi) { return kpi.alerts || []; }).filter(function (alert) { return !alert.acknowledged; });
    }, [kpis]);
    if (isLoading) {
        return (<div className={"space-y-6 ".concat(className)}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <lucide_react_1.RefreshCw className="h-6 w-6 animate-spin"/>
            <span>Carregando dashboard financeiro...</span>
          </div>
        </div>
      </div>);
    }
    return (<div className={"space-y-6 ".concat(className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">
            Última atualização: {(0, date_fns_1.format)(lastUpdated, "dd/MM/yyyy 'às' HH:mm", { locale: locale_1.ptBR })}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Auto-refresh toggle */}
          <div className="flex items-center space-x-2">
            <switch_1.Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} id="auto-refresh"/>
            <label_1.Label htmlFor="auto-refresh" className="text-sm">
              Auto-refresh
            </label_1.Label>
          </div>
          
          {/* Refresh button */}
          <button_1.Button variant="outline" size="sm" onClick={loadDashboardData} disabled={isLoading}>
            <lucide_react_1.RefreshCw className={"h-4 w-4 mr-2 ".concat(isLoading ? 'animate-spin' : '')}/>
            Atualizar
          </button_1.Button>
          
          {/* Customize button */}
          <button_1.Button variant="outline" size="sm" onClick={function () { return setIsCustomizing(!isCustomizing); }}>
            <lucide_react_1.Settings className="h-4 w-4 mr-2"/>
            Personalizar
          </button_1.Button>
          
          {/* Export dropdown */}
          <select_1.Select onValueChange={function (value) { return handleExport(value); }}>
            <select_1.SelectTrigger className="w-32">
              <lucide_react_1.Download className="h-4 w-4 mr-2"/>
              <select_1.SelectValue placeholder="Exportar"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="pdf">PDF</select_1.SelectItem>
              <select_1.SelectItem value="excel">Excel</select_1.SelectItem>
              <select_1.SelectItem value="csv">CSV</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (<div className="space-y-2">
          {activeAlerts.map(function (alert) { return (<alert_1.Alert key={alert.id} className={"border-l-4 ".concat(alert.type === 'critical' ? 'border-red-500 bg-red-50' :
                    alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                        alert.type === 'info' ? 'border-blue-500 bg-blue-50' :
                            'border-green-500 bg-green-50')}>
              <lucide_react_1.AlertTriangle className="h-4 w-4"/>
              <alert_1.AlertDescription>{alert.message}</alert_1.AlertDescription>
            </alert_1.Alert>); })}
        </div>)}

      {/* Main Dashboard */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="revenue">Receita</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="profitability">Lucratividade</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="efficiency">Eficiência</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpis.map(function (kpi) { return (<card_1.Card key={kpi.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={function () { return handleKPIClick(kpi); }}>
                <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <card_1.CardTitle className="text-sm font-medium">{kpi.name}</card_1.CardTitle>
                  {getCategoryIcon(kpi.category)}
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-2xl font-bold">{getFormattedValue(kpi)}</div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    {getTrendIcon(kpi.trend)}
                    <span className={"".concat(kpi.trend === 'up' ? 'text-green-600' :
                kpi.trend === 'down' ? 'text-red-600' :
                    'text-yellow-600')}>
                      {kpi.changePercentage > 0 ? '+' : ''}{kpi.changePercentage.toFixed(1)}%
                    </span>
                    <span>vs período anterior</span>
                  </div>
                  
                  {kpi.target && (<div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Meta</span>
                        <span>{kpi.unit === 'currency' ? formatCurrency(kpi.target) :
                    kpi.unit === 'percentage' ? formatPercentage(kpi.target) :
                        formatNumber(kpi.target)}</span>
                      </div>
                      <progress_1.Progress value={(kpi.value / kpi.target) * 100} className="h-2"/>
                    </div>)}
                  
                  {kpi.alerts && kpi.alerts.length > 0 && (<div className="mt-2">
                      <badge_1.Badge variant="outline" className="text-xs">
                        {kpi.alerts.length} alerta{kpi.alerts.length > 1 ? 's' : ''}
                      </badge_1.Badge>
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </tabs_1.TabsContent>

        {/* Revenue Tab */}
        <tabs_1.TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getKPIsByCategory('revenue').map(function (kpi) { return (<card_1.Card key={kpi.id} className="cursor-pointer" onClick={function () { return handleKPIClick(kpi); }}>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center space-x-2">
                    <lucide_react_1.DollarSign className="h-5 w-5"/>
                    <span>{kpi.name}</span>
                  </card_1.CardTitle>
                  <card_1.CardDescription>{kpi.description}</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-3xl font-bold mb-4">{getFormattedValue(kpi)}</div>
                  
                  {kpi.drillDownData && (<div className="space-y-2">
                      <h4 className="font-medium text-sm">Detalhamento:</h4>
                      {kpi.drillDownData.map(function (item) { return (<div key={item.id} className="flex justify-between items-center">
                          <span className="text-sm">{item.label}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {formatCurrency(item.value)}
                            </span>
                            <badge_1.Badge variant="outline" className="text-xs">
                              {item.percentage.toFixed(1)}%
                            </badge_1.Badge>
                          </div>
                        </div>); })}
                    </div>)}
                  
                  {kpi.benchmarkData && (<div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-sm mb-2">Benchmark:</h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Média do setor: {formatCurrency(kpi.benchmarkData.industryAverage)}</div>
                        <div>Top performers: {formatCurrency(kpi.benchmarkData.topPerformers)}</div>
                        <div>Ranking: {kpi.benchmarkData.clinicRanking}º de {kpi.benchmarkData.totalClinics}</div>
                      </div>
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </tabs_1.TabsContent>

        {/* Profitability Tab */}
        <tabs_1.TabsContent value="profitability" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getKPIsByCategory('profitability').map(function (kpi) { return (<card_1.Card key={kpi.id} className="cursor-pointer" onClick={function () { return handleKPIClick(kpi); }}>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center space-x-2">
                    <lucide_react_1.PieChart className="h-5 w-5"/>
                    <span>{kpi.name}</span>
                  </card_1.CardTitle>
                  <card_1.CardDescription>{kpi.description}</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-3xl font-bold mb-4">{getFormattedValue(kpi)}</div>
                  
                  {kpi.drillDownData && (<div className="space-y-2">
                      <h4 className="font-medium text-sm">Análise:</h4>
                      {kpi.drillDownData.map(function (item) { return (<div key={item.id} className="flex justify-between items-center">
                          <span className="text-sm">{item.label}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {kpi.unit === 'percentage' ? formatPercentage(item.value) : formatCurrency(item.value)}
                            </span>
                            {getTrendIcon(item.trend)}
                          </div>
                        </div>); })}
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </tabs_1.TabsContent>

        {/* Efficiency Tab */}
        <tabs_1.TabsContent value="efficiency" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getKPIsByCategory('efficiency').map(function (kpi) { return (<card_1.Card key={kpi.id} className="cursor-pointer" onClick={function () { return handleKPIClick(kpi); }}>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center space-x-2">
                    <lucide_react_1.Target className="h-5 w-5"/>
                    <span>{kpi.name}</span>
                  </card_1.CardTitle>
                  <card_1.CardDescription>{kpi.description}</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-3xl font-bold mb-4">{getFormattedValue(kpi)}</div>
                  
                  {kpi.benchmarkData && (<div className="space-y-2">
                      <h4 className="font-medium text-sm mb-2">Performance vs Mercado:</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Sua clínica</span>
                          <span className="font-medium">{getFormattedValue(kpi)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Média do setor</span>
                          <span>{kpi.unit === 'percentage' ?
                    formatPercentage(kpi.benchmarkData.industryAverage) :
                    formatCurrency(kpi.benchmarkData.industryAverage)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Top 10%</span>
                          <span>{kpi.unit === 'percentage' ?
                    formatPercentage(kpi.benchmarkData.topPerformers) :
                    formatCurrency(kpi.benchmarkData.topPerformers)}</span>
                        </div>
                        <progress_1.Progress value={(kpi.value / kpi.benchmarkData.topPerformers) * 100} className="h-2 mt-2"/>
                      </div>
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Drill-down Modal/Panel */}
      {selectedKPI && (<card_1.Card className="fixed inset-4 z-50 bg-background shadow-lg">
          <card_1.CardHeader className="flex flex-row items-center justify-between">
            <div>
              <card_1.CardTitle className="flex items-center space-x-2">
                {getCategoryIcon(selectedKPI.category)}
                <span>{selectedKPI.name} - Análise Detalhada</span>
              </card_1.CardTitle>
              <card_1.CardDescription>{selectedKPI.description}</card_1.CardDescription>
            </div>
            <button_1.Button variant="ghost" size="sm" onClick={function () { return setSelectedKPI(null); }}>
              <lucide_react_1.Minimize2 className="h-4 w-4"/>
            </button_1.Button>
          </card_1.CardHeader>
          <card_1.CardContent>
            <scroll_area_1.ScrollArea className="h-96">
              <div className="space-y-6">
                {/* KPI Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{getFormattedValue(selectedKPI)}</div>
                    <div className="text-sm text-muted-foreground">Valor Atual</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold flex items-center justify-center space-x-1">
                      {getTrendIcon(selectedKPI.trend)}
                      <span className={"".concat(selectedKPI.trend === 'up' ? 'text-green-600' :
                selectedKPI.trend === 'down' ? 'text-red-600' :
                    'text-yellow-600')}>
                        {selectedKPI.changePercentage > 0 ? '+' : ''}{selectedKPI.changePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">Variação</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedKPI.target ?
                (selectedKPI.unit === 'currency' ? formatCurrency(selectedKPI.target) :
                    selectedKPI.unit === 'percentage' ? formatPercentage(selectedKPI.target) :
                        formatNumber(selectedKPI.target)) : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Meta</div>
                  </div>
                </div>

                {/* Drill-down Data */}
                {selectedKPI.drillDownData && (<div>
                    <h3 className="font-semibold mb-4">Detalhamento por Categoria</h3>
                    <div className="space-y-3">
                      {selectedKPI.drillDownData.map(function (item) { return (<div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="font-medium">{item.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.percentage.toFixed(1)}% do total
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">
                              {selectedKPI.unit === 'currency' ? formatCurrency(item.value) :
                        selectedKPI.unit === 'percentage' ? formatPercentage(item.value) :
                            formatNumber(item.value)}
                            </span>
                            {getTrendIcon(item.trend)}
                          </div>
                        </div>); })}
                    </div>
                  </div>)}

                {/* Benchmark Data */}
                {selectedKPI.benchmarkData && (<div>
                    <h3 className="font-semibold mb-4">Benchmark de Mercado</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Média do Setor</div>
                        <div className="font-semibold">
                          {selectedKPI.unit === 'currency' ? formatCurrency(selectedKPI.benchmarkData.industryAverage) :
                    selectedKPI.unit === 'percentage' ? formatPercentage(selectedKPI.benchmarkData.industryAverage) :
                        formatNumber(selectedKPI.benchmarkData.industryAverage)}
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Top Performers</div>
                        <div className="font-semibold">
                          {selectedKPI.unit === 'currency' ? formatCurrency(selectedKPI.benchmarkData.topPerformers) :
                    selectedKPI.unit === 'percentage' ? formatPercentage(selectedKPI.benchmarkData.topPerformers) :
                        formatNumber(selectedKPI.benchmarkData.topPerformers)}
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg col-span-2">
                        <div className="text-sm text-muted-foreground">Posição no Ranking</div>
                        <div className="font-semibold">
                          {selectedKPI.benchmarkData.clinicRanking}º lugar de {selectedKPI.benchmarkData.totalClinics} clínicas
                        </div>
                        <progress_1.Progress value={((selectedKPI.benchmarkData.totalClinics - selectedKPI.benchmarkData.clinicRanking + 1) / selectedKPI.benchmarkData.totalClinics) * 100} className="h-2 mt-2"/>
                      </div>
                    </div>
                  </div>)}

                {/* Alerts */}
                {selectedKPI.alerts && selectedKPI.alerts.length > 0 && (<div>
                    <h3 className="font-semibold mb-4">Alertas Ativos</h3>
                    <div className="space-y-2">
                      {selectedKPI.alerts.map(function (alert) { return (<alert_1.Alert key={alert.id} className={"".concat(alert.type === 'critical' ? 'border-red-500' :
                        alert.type === 'warning' ? 'border-yellow-500' :
                            alert.type === 'info' ? 'border-blue-500' :
                                'border-green-500')}>
                          <lucide_react_1.AlertTriangle className="h-4 w-4"/>
                          <alert_1.AlertDescription>
                            <div className="flex justify-between items-start">
                              <span>{alert.message}</span>
                              <badge_1.Badge variant="outline" className="ml-2">
                                {alert.type}
                              </badge_1.Badge>
                            </div>
                          </alert_1.AlertDescription>
                        </alert_1.Alert>); })}
                    </div>
                  </div>)}
              </div>
            </scroll_area_1.ScrollArea>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
