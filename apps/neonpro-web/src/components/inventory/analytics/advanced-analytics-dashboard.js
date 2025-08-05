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
exports.AdvancedAnalyticsDashboard = AdvancedAnalyticsDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var date_range_picker_1 = require("@/components/ui/date-range-picker");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var use_inventory_1 = require("@/hooks/inventory/use-inventory");
var use_reports_1 = require("@/hooks/inventory/use-reports");
var custom_report_builder_1 = require("./custom-report-builder");
var COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];
function AdvancedAnalyticsDashboard() {
    var _this = this;
    var _a = (0, react_1.useState)(), dateRange = _a[0], setDateRange = _a[1];
    var _b = (0, react_1.useState)('all'), selectedCategory = _b[0], setSelectedCategory = _b[1];
    var _c = (0, react_1.useState)('all'), selectedSupplier = _c[0], setSelectedSupplier = _c[1];
    var _d = (0, react_1.useState)(0), refreshKey = _d[0], setRefreshKey = _d[1];
    var _e = (0, use_inventory_1.useInventory)(), inventoryState = _e.state, isLoading = _e.isLoading;
    var _f = (0, use_reports_1.useReports)(), generateAnalytics = _f.generateAnalytics, exportReport = _f.exportReport, isGenerating = _f.isGenerating;
    // Mock data - in production, this would come from useReports hook
    var analyticsData = (0, react_1.useMemo)(function () { return ({
        stockTurnoverData: [
            { product: 'Produto A', turnoverRate: 12.5, daysInStock: 29, value: 85000 },
            { product: 'Produto B', turnoverRate: 8.2, daysInStock: 44, value: 62000 },
            { product: 'Produto C', turnoverRate: 15.8, daysInStock: 23, value: 78000 },
            { product: 'Produto D', turnoverRate: 6.1, daysInStock: 60, value: 45000 },
            { product: 'Produto E', turnoverRate: 11.3, daysInStock: 32, value: 69000 },
        ],
        categoryPerformance: [
            { category: 'Medicamentos', value: 45, volume: 2800, margin: 32, fill: '#8884d8' },
            { category: 'Materiais', value: 28, volume: 1900, margin: 28, fill: '#82ca9d' },
            { category: 'Equipamentos', value: 15, volume: 680, margin: 45, fill: '#ffc658' },
            { category: 'Consumíveis', value: 12, volume: 1200, margin: 18, fill: '#ff7c7c' },
        ],
        movementTrends: [
            { date: '01/01', stockIn: 850, stockOut: 720, netMovement: 130 },
            { date: '02/01', stockIn: 920, stockOut: 890, netMovement: 30 },
            { date: '03/01', stockIn: 780, stockOut: 950, netMovement: -170 },
            { date: '04/01', stockIn: 1100, stockOut: 820, netMovement: 280 },
            { date: '05/01', stockIn: 890, stockOut: 1050, netMovement: -160 },
            { date: '06/01', stockIn: 1200, stockOut: 980, netMovement: 220 },
            { date: '07/01', stockIn: 950, stockOut: 1100, netMovement: -150 },
        ],
        abcAnalysis: [
            { category: 'A', products: 15, revenue: 75, percentage: 75, fill: '#ff4444' },
            { category: 'B', products: 35, revenue: 20, percentage: 20, fill: '#ffaa44' },
            { category: 'C', products: 50, revenue: 5, percentage: 5, fill: '#44ff44' },
        ],
        seasonalTrends: [
            { month: 'Jan', demand: 85, supply: 90, shortage: 5 },
            { month: 'Fev', demand: 92, supply: 88, shortage: 12 },
            { month: 'Mar', demand: 78, supply: 95, shortage: 2 },
            { month: 'Abr', demand: 105, supply: 82, shortage: 18 },
            { month: 'Mai', demand: 98, supply: 105, shortage: 0 },
            { month: 'Jun', demand: 112, supply: 98, shortage: 14 },
        ],
        supplierPerformance: [
            { supplier: 'Fornecedor A', deliveryTime: 85, qualityScore: 92, costEfficiency: 78, reliability: 90 },
            { supplier: 'Fornecedor B', deliveryTime: 72, qualityScore: 88, costEfficiency: 85, reliability: 85 },
            { supplier: 'Fornecedor C', deliveryTime: 95, qualityScore: 78, costEfficiency: 92, reliability: 80 },
            { supplier: 'Fornecedor D', deliveryTime: 68, qualityScore: 95, costEfficiency: 80, reliability: 95 },
        ],
    }); }, [refreshKey]);
    var kpis = (0, react_1.useMemo)(function () { return [
        {
            id: 'turnover',
            title: 'Giro de Estoque',
            value: '11.2x',
            change: 8.5,
            changeType: 'increase',
            icon: lucide_react_1.RotateCcw,
            description: 'Velocidade média de rotação do estoque'
        },
        {
            id: 'accuracy',
            title: 'Acurácia do Estoque',
            value: '98.7%',
            change: 2.1,
            changeType: 'increase',
            icon: lucide_react_1.Target,
            description: 'Precisão entre estoque físico e sistema'
        },
        {
            id: 'carrying-cost',
            title: 'Custo de Estoque',
            value: 'R$ 485.2K',
            change: -5.8,
            changeType: 'decrease',
            icon: lucide_react_1.DollarSign,
            description: 'Valor total investido em estoque'
        },
        {
            id: 'stockout-rate',
            title: 'Taxa de Ruptura',
            value: '2.3%',
            change: -15.2,
            changeType: 'decrease',
            icon: lucide_react_1.AlertTriangle,
            description: 'Percentual de produtos em falta'
        },
        {
            id: 'fill-rate',
            title: 'Taxa de Atendimento',
            value: '97.8%',
            change: 3.2,
            changeType: 'increase',
            icon: lucide_react_1.Package,
            description: 'Percentual de pedidos atendidos completamente'
        },
        {
            id: 'avg-lead-time',
            title: 'Lead Time Médio',
            value: '12.5 dias',
            change: -8.1,
            changeType: 'decrease',
            icon: lucide_react_1.Clock,
            description: 'Tempo médio de reposição'
        },
    ]; }, []);
    var handleRefreshData = function () {
        setRefreshKey(function (prev) { return prev + 1; });
    };
    var handleExportReport = function (type) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exportReport({
                            type: type,
                            dateRange: dateRange,
                            category: selectedCategory,
                            supplier: selectedSupplier,
                            includeCharts: true,
                            includeKPIs: true,
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Erro ao exportar relatório:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return (<div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>);
    }
    return (<div className="container mx-auto p-6 space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Avançados de Estoque</h1>
          <p className="text-muted-foreground mt-1">
            Análise detalhada de performance e otimização de inventário
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <date_range_picker_1.DatePickerWithRange value={dateRange} onChange={setDateRange} placeholder="Selecionar período"/>
          
          <select_1.Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <select_1.SelectTrigger className="w-40">
              <select_1.SelectValue placeholder="Categoria"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todas</select_1.SelectItem>
              <select_1.SelectItem value="medicamentos">Medicamentos</select_1.SelectItem>
              <select_1.SelectItem value="materiais">Materiais</select_1.SelectItem>
              <select_1.SelectItem value="equipamentos">Equipamentos</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>

          <select_1.Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
            <select_1.SelectTrigger className="w-40">
              <select_1.SelectValue placeholder="Fornecedor"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos</select_1.SelectItem>
              <select_1.SelectItem value="fornecedor-a">Fornecedor A</select_1.SelectItem>
              <select_1.SelectItem value="fornecedor-b">Fornecedor B</select_1.SelectItem>
              <select_1.SelectItem value="fornecedor-c">Fornecedor C</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>

          <button_1.Button variant="outline" size="sm" onClick={handleRefreshData}>
            <lucide_react_1.RotateCcw className="h-4 w-4 mr-2"/>
            Atualizar
          </button_1.Button>

          <button_1.Button variant="outline" size="sm" onClick={function () { return handleExportReport('pdf'); }}>
            <lucide_react_1.Download className="h-4 w-4 mr-2"/>
            Exportar PDF
          </button_1.Button>

          <button_1.Button variant="outline" size="sm" onClick={function () { return handleExportReport('excel'); }}>
            <lucide_react_1.Download className="h-4 w-4 mr-2"/>
            Exportar Excel
          </button_1.Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map(function (kpi) {
            var Icon = kpi.icon;
            return (<card_1.Card key={kpi.id} className="relative overflow-hidden">
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  {kpi.title}
                </card_1.CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {kpi.changeType === 'increase' ? (<lucide_react_1.TrendingUp className="h-3 w-3 text-green-500"/>) : kpi.changeType === 'decrease' ? (<lucide_react_1.TrendingDown className="h-3 w-3 text-red-500"/>) : (<lucide_react_1.Activity className="h-3 w-3 text-blue-500"/>)}
                  <span className={kpi.changeType === 'increase' ? 'text-green-500' :
                    kpi.changeType === 'decrease' ? 'text-red-500' : 'text-blue-500'}>
                    {Math.abs(kpi.change)}%
                  </span>
                  <span>vs período anterior</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.description}
                </p>
              </card_1.CardContent>
            </card_1.Card>);
        })}
      </div>

      {/* Analytics Tabs */}
      <tabs_1.Tabs defaultValue="turnover" className="space-y-6">
        <tabs_1.TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
          <tabs_1.TabsTrigger value="turnover">Giro de Estoque</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="categories">Categorias</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="movements">Movimentações</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="abc">Análise ABC</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="seasonal">Sazonalidade</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="suppliers">Fornecedores</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="reports">Relatórios</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Stock Turnover Analysis */}
        <tabs_1.TabsContent value="turnover" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Taxa de Giro por Produto</card_1.CardTitle>
                <card_1.CardDescription>
                  Velocidade de rotação dos principais produtos
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.BarChart data={analyticsData.stockTurnoverData}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                    <recharts_1.XAxis dataKey="product" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end"/>
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip formatter={function (value, name) { return [
            "".concat(value).concat(name === 'turnoverRate' ? 'x' : name === 'daysInStock' ? ' dias' : ''),
            name === 'turnoverRate' ? 'Giro' : name === 'daysInStock' ? 'Dias em Estoque' : 'Valor'
        ]; }}/>
                    <recharts_1.Legend />
                    <recharts_1.Bar dataKey="turnoverRate" fill="#8884d8" name="Taxa de Giro"/>
                  </recharts_1.BarChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Dias em Estoque</card_1.CardTitle>
                <card_1.CardDescription>
                  Tempo médio de permanência no estoque
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.LineChart data={analyticsData.stockTurnoverData}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                    <recharts_1.XAxis dataKey="product" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end"/>
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip formatter={function (value) { return ["".concat(value, " dias"), 'Dias em Estoque']; }}/>
                    <recharts_1.Legend />
                    <recharts_1.Line type="monotone" dataKey="daysInStock" stroke="#82ca9d" strokeWidth={3} name="Dias em Estoque"/>
                  </recharts_1.LineChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>        {/* Category Performance Analysis */}
        <tabs_1.TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Performance por Categoria</card_1.CardTitle>
                <card_1.CardDescription>
                  Distribuição de valor por categoria de produtos
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.PieChart>
                    <recharts_1.Pie data={analyticsData.categoryPerformance} cx="50%" cy="50%" labelLine={false} label={function (_a) {
        var category = _a.category, value = _a.value;
        return "".concat(category, ": ").concat(value, "%");
    }} outerRadius={100} fill="#8884d8" dataKey="value">
                      {analyticsData.categoryPerformance.map(function (entry, index) { return (<recharts_1.Cell key={"cell-".concat(index)} fill={entry.fill}/>); })}
                    </recharts_1.Pie>
                    <recharts_1.Tooltip formatter={function (value) { return ["".concat(value, "%"), 'Participação']; }}/>
                  </recharts_1.PieChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Volume vs Margem</card_1.CardTitle>
                <card_1.CardDescription>
                  Análise de volume de vendas versus margem de lucro
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.BarChart data={analyticsData.categoryPerformance}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                    <recharts_1.XAxis dataKey="category"/>
                    <recharts_1.YAxis yAxisId="left"/>
                    <recharts_1.YAxis yAxisId="right" orientation="right"/>
                    <recharts_1.Tooltip />
                    <recharts_1.Legend />
                    <recharts_1.Bar yAxisId="left" dataKey="volume" fill="#8884d8" name="Volume"/>
                    <recharts_1.Bar yAxisId="right" dataKey="margin" fill="#82ca9d" name="Margem %"/>
                  </recharts_1.BarChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        {/* Stock Movements Analysis */}
        <tabs_1.TabsContent value="movements" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Tendências de Movimentação</card_1.CardTitle>
              <card_1.CardDescription>
                Análise temporal das entradas e saídas de estoque
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <recharts_1.ResponsiveContainer width="100%" height={400}>
                <recharts_1.AreaChart data={analyticsData.movementTrends}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                  <recharts_1.XAxis dataKey="date"/>
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip />
                  <recharts_1.Legend />
                  <recharts_1.Area type="monotone" dataKey="stockIn" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Entradas"/>
                  <recharts_1.Area type="monotone" dataKey="stockOut" stackId="2" stroke="#ff7c7c" fill="#ff7c7c" name="Saídas"/>
                  <recharts_1.Line type="monotone" dataKey="netMovement" stroke="#8884d8" strokeWidth={3} name="Movimento Líquido"/>
                </recharts_1.AreaChart>
              </recharts_1.ResponsiveContainer>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* ABC Analysis */}
        <tabs_1.TabsContent value="abc" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Análise ABC - Receita</card_1.CardTitle>
                <card_1.CardDescription>
                  Classificação dos produtos por importância na receita
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.FunnelChart>
                    <recharts_1.Tooltip />
                    <recharts_1.Funnel dataKey="revenue" data={analyticsData.abcAnalysis} isAnimationActive>
                      <recharts_1.LabelList position="right" fill="#000" stroke="none"/>
                    </recharts_1.Funnel>
                  </recharts_1.FunnelChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Distribuição ABC</card_1.CardTitle>
                <card_1.CardDescription>
                  Percentual de produtos em cada categoria
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {analyticsData.abcAnalysis.map(function (item) { return (<div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <badge_1.Badge variant={item.category === 'A' ? 'destructive' :
                item.category === 'B' ? 'default' : 'secondary'} className="w-8 h-8 rounded-full flex items-center justify-center">
                        {item.category}
                      </badge_1.Badge>
                      <div>
                        <p className="text-sm font-medium">Categoria {item.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.products} produtos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.revenue}%</p>
                      <p className="text-xs text-muted-foreground">da receita</p>
                    </div>
                  </div>); })}
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        {/* Seasonal Analysis */}
        <tabs_1.TabsContent value="seasonal" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Análise Sazonal</card_1.CardTitle>
              <card_1.CardDescription>
                Padrões de demanda e suprimento ao longo do ano
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <recharts_1.ResponsiveContainer width="100%" height={400}>
                <recharts_1.LineChart data={analyticsData.seasonalTrends}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                  <recharts_1.XAxis dataKey="month"/>
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip />
                  <recharts_1.Legend />
                  <recharts_1.Line type="monotone" dataKey="demand" stroke="#8884d8" strokeWidth={3} name="Demanda"/>
                  <recharts_1.Line type="monotone" dataKey="supply" stroke="#82ca9d" strokeWidth={3} name="Suprimento"/>
                  <recharts_1.Line type="monotone" dataKey="shortage" stroke="#ff7c7c" strokeWidth={3} name="Falta"/>
                </recharts_1.LineChart>
              </recharts_1.ResponsiveContainer>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Supplier Performance Analysis */}
        <tabs_1.TabsContent value="suppliers" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Performance dos Fornecedores</card_1.CardTitle>
              <card_1.CardDescription>
                Análise multidimensional da performance dos fornecedores
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <recharts_1.ResponsiveContainer width="100%" height={400}>
                <recharts_1.RadarChart data={analyticsData.supplierPerformance}>
                  <recharts_1.PolarGrid />
                  <recharts_1.PolarAngleAxis dataKey="supplier"/>
                  <recharts_1.PolarRadiusAxis angle={30} domain={[0, 100]}/>
                  <recharts_1.Radar name="Tempo de Entrega" dataKey="deliveryTime" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6}/>
                  <recharts_1.Radar name="Qualidade" dataKey="qualityScore" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6}/>
                  <recharts_1.Radar name="Custo-Eficiência" dataKey="costEfficiency" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6}/>
                  <recharts_1.Radar name="Confiabilidade" dataKey="reliability" stroke="#ff7c7c" fill="#ff7c7c" fillOpacity={0.6}/>
                  <recharts_1.Legend />
                  <recharts_1.Tooltip />
                </recharts_1.RadarChart>
              </recharts_1.ResponsiveContainer>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Custom Reports */}
        <tabs_1.TabsContent value="reports" className="space-y-6">
          <custom_report_builder_1.CustomReportBuilder />
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Additional Insights Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center space-x-2">
              <lucide_react_1.Zap className="h-5 w-5 text-yellow-500"/>
              <span>Insights Automáticos</span>
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-blue-800">
                Produto A tem alta rotação mas baixo estoque de segurança
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <p className="text-sm text-yellow-800">
                Categoria Medicamentos apresenta sazonalidade no Q2
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-green-800">
                Fornecedor D oferece melhor custo-benefício
              </p>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center space-x-2">
              <lucide_react_1.Target className="h-5 w-5 text-green-500"/>
              <span>Recomendações</span>
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
              <div>
                <p className="text-sm font-medium">Aumentar estoque de Produto A</p>
                <p className="text-xs text-muted-foreground">Risco de ruptura em 7 dias</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
              <div>
                <p className="text-sm font-medium">Revisar política de Categoria C</p>
                <p className="text-xs text-muted-foreground">Baixa rotação, alto custo</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <p className="text-sm font-medium">Negociar com Fornecedor B</p>
                <p className="text-xs text-muted-foreground">Oportunidade de redução de 8%</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center space-x-2">
              <lucide_react_1.BarChart3 className="h-5 w-5 text-purple-500"/>
              <span>Próximas Ações</span>
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm">Atualizar previsão Q2</p>
              <badge_1.Badge variant="outline">Em 2 dias</badge_1.Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Auditoria física</p>
              <badge_1.Badge variant="outline">Próxima semana</badge_1.Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Reunião fornecedores</p>
              <badge_1.Badge variant="outline">15/02</badge_1.Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Relatório mensal</p>
              <badge_1.Badge variant="outline">Fim do mês</badge_1.Badge>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </div>);
}
