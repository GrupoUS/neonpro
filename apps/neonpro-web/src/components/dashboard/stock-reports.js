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
exports.StockReports = StockReports;
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var tabs_1 = require("@/components/ui/tabs");
var use_toast_1 = require("@/hooks/use-toast");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var reportTypeIcons = {
    consumption: lucide_react_1.BarChart3,
    valuation: lucide_react_1.DollarSign,
    movement: lucide_react_1.TrendingUp,
    expiration: lucide_react_1.Clock,
    custom: lucide_react_1.FileText,
    performance: lucide_react_1.PieChart,
};
var reportTypeLabels = {
    consumption: "Relatório de Consumo",
    valuation: "Relatório de Valorização",
    movement: "Relatório de Movimentação",
    expiration: "Relatório de Vencimentos",
    custom: "Relatório Personalizado",
    performance: "Métricas de Performance",
};
function StockReports(_a) {
    var _this = this;
    var className = _a.className;
    var _b = (0, react_1.useState)([]), reports = _b[0], setReports = _b[1];
    var _c = (0, react_1.useState)(null), kpis = _c[0], setKpis = _c[1];
    var _d = (0, react_1.useState)([]), consumptionTrend = _d[0], setConsumptionTrend = _d[1];
    var _e = (0, react_1.useState)([]), topProducts = _e[0], setTopProducts = _e[1];
    var _f = (0, react_1.useState)([]), wasteAnalysis = _f[0], setWasteAnalysis = _f[1];
    var _g = (0, react_1.useState)(true), isLoading = _g[0], setIsLoading = _g[1];
    var _h = (0, react_1.useState)("dashboard"), selectedTab = _h[0], setSelectedTab = _h[1];
    var _j = (0, react_1.useState)("all"), filterType = _j[0], setFilterType = _j[1];
    var _k = (0, react_1.useState)(false), showCreateDialog = _k[0], setShowCreateDialog = _k[1];
    var toast = (0, use_toast_1.useToast)().toast;
    // Load dashboard data and reports
    var loadData = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, dashboardRes, reportsRes, dashboardData, reportsData, error_1;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    setIsLoading(true);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 7, 8, 9]);
                    return [4 /*yield*/, Promise.all([
                            fetch("/api/stock/reports?type=dashboard"),
                            fetch("/api/stock/reports"),
                        ])];
                case 2:
                    _a = _e.sent(), dashboardRes = _a[0], reportsRes = _a[1];
                    if (!dashboardRes.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, dashboardRes.json()];
                case 3:
                    dashboardData = _e.sent();
                    setKpis(dashboardData.kpis || null);
                    setConsumptionTrend(((_b = dashboardData.charts) === null || _b === void 0 ? void 0 : _b.consumptionTrend) || []);
                    setTopProducts(((_c = dashboardData.charts) === null || _c === void 0 ? void 0 : _c.topProducts) || []);
                    setWasteAnalysis(((_d = dashboardData.charts) === null || _d === void 0 ? void 0 : _d.wasteAnalysis) || []);
                    _e.label = 4;
                case 4:
                    if (!reportsRes.ok) return [3 /*break*/, 6];
                    return [4 /*yield*/, reportsRes.json()];
                case 5:
                    reportsData = _e.sent();
                    setReports(reportsData.reports || []);
                    _e.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7:
                    error_1 = _e.sent();
                    toast({
                        title: "Erro ao carregar dados",
                        description: "Não foi possível carregar os dados do dashboard e relatórios.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 9];
                case 8:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    // Generate report
    var generateReport = function (reportId) { return __awaiter(_this, void 0, void 0, function () {
        var response, blob, url, a, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/stock/reports/generate", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ reportId: reportId }),
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.blob()];
                case 2:
                    blob = _a.sent();
                    url = window.URL.createObjectURL(blob);
                    a = document.createElement("a");
                    a.href = url;
                    a.download = "relatorio-estoque-".concat(Date.now(), ".pdf");
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    toast({
                        title: "Relatório gerado",
                        description: "O relatório foi gerado e está sendo baixado.",
                    });
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    toast({
                        title: "Erro",
                        description: "Não foi possível gerar o relatório.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Filter reports
    var filteredReports = reports.filter(function (report) {
        if (filterType !== "all" && report.reportType !== filterType)
            return false;
        return true;
    });
    (0, react_1.useEffect)(function () {
        loadData();
    }, []);
    if (isLoading) {
        return (<card_1.Card className={className}>
        <card_1.CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <lucide_react_1.RefreshCw className="h-6 w-6 animate-spin"/>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.BarChart3 className="h-5 w-5"/>
            Relatórios e Analytics de Estoque
          </card_1.CardTitle>
          <button_1.Button onClick={loadData} variant="outline" size="sm">
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2"/>
            Atualizar
          </button_1.Button>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent>
        <tabs_1.Tabs value={selectedTab} onValueChange={function (value) { return setSelectedTab(value); }}>
          <tabs_1.TabsList className="grid w-full grid-cols-2">
            <tabs_1.TabsTrigger value="dashboard" className="flex items-center gap-2">
              <lucide_react_1.PieChart className="h-4 w-4"/>
              Dashboard
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="reports" className="flex items-center gap-2">
              <lucide_react_1.FileText className="h-4 w-4"/>
              Relatórios ({filteredReports.length})
            </tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="dashboard" className="space-y-6">
            {/* KPIs */}
            {kpis && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <card_1.Card>
                  <card_1.CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Valor Total
                        </p>
                        <p className="text-2xl font-bold">
                          R$ {kpis.totalValue.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <lucide_react_1.DollarSign className="h-8 w-8 text-green-600"/>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Taxa de Giro
                        </p>
                        <p className="text-2xl font-bold">
                          {kpis.turnoverRate.toFixed(1)}x
                        </p>
                      </div>
                      <lucide_react_1.TrendingUp className="h-8 w-8 text-blue-600"/>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Cobertura (Dias)
                        </p>
                        <p className="text-2xl font-bold">
                          {kpis.daysCoverage}
                        </p>
                      </div>
                      <lucide_react_1.Calendar className="h-8 w-8 text-orange-600"/>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Alertas Ativos
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {kpis.activeAlerts}
                        </p>
                      </div>
                      <lucide_react_1.AlertTriangle className="h-8 w-8 text-red-600"/>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              </div>)}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-lg">
                    Produtos Mais Consumidos
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  {topProducts.length === 0 ? (<alert_1.Alert>
                      <lucide_react_1.Package className="h-4 w-4"/>
                      <alert_1.AlertDescription>
                        Nenhum dado de consumo disponível.
                      </alert_1.AlertDescription>
                    </alert_1.Alert>) : (<div className="space-y-3">
                      {topProducts.slice(0, 5).map(function (product, index) { return (<div key={product.productId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.sku && (<p className="text-sm text-muted-foreground">
                                  {product.sku}
                                </p>)}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{product.consumption}</p>
                            <p className="text-sm text-muted-foreground">
                              R$ {product.value.toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>); })}
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>

              {/* Waste Analysis */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-lg">
                    Análise de Desperdício
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  {wasteAnalysis.length === 0 ? (<alert_1.Alert>
                      <lucide_react_1.TrendingDown className="h-4 w-4"/>
                      <alert_1.AlertDescription>
                        Nenhum dado de desperdício disponível.
                      </alert_1.AlertDescription>
                    </alert_1.Alert>) : (<div className="space-y-3">
                      {wasteAnalysis.map(function (waste, index) { return (<div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{waste.period}</p>
                            <p className="text-sm text-muted-foreground">
                              {waste.percentage.toFixed(1)}% de desperdício
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-red-600">
                              R$ {waste.waste.toLocaleString("pt-BR")}
                            </p>
                            {waste.trend && (<div className="flex items-center gap-1">
                                {waste.trend === "improving" && (<lucide_react_1.TrendingDown className="h-4 w-4 text-green-600"/>)}
                                {waste.trend === "worsening" && (<lucide_react_1.TrendingUp className="h-4 w-4 text-red-600"/>)}
                                <span className="text-sm capitalize">
                                  {waste.trend}
                                </span>
                              </div>)}
                          </div>
                        </div>); })}
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="reports" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <lucide_react_1.Filter className="h-4 w-4"/>
                  <label_1.Label>Filtrar por tipo:</label_1.Label>
                </div>

                <select_1.Select value={filterType} onValueChange={function (value) { return setFilterType(value); }}>
                  <select_1.SelectTrigger className="w-48">
                    <select_1.SelectValue placeholder="Tipo de relatório"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                    <select_1.SelectItem value="consumption">Consumo</select_1.SelectItem>
                    <select_1.SelectItem value="valuation">Valorização</select_1.SelectItem>
                    <select_1.SelectItem value="movement">Movimentação</select_1.SelectItem>
                    <select_1.SelectItem value="expiration">Vencimentos</select_1.SelectItem>
                    <select_1.SelectItem value="performance">Performance</select_1.SelectItem>
                    <select_1.SelectItem value="custom">Personalizado</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <dialog_1.Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <dialog_1.DialogTrigger asChild>
                  <button_1.Button>
                    <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
                    Novo Relatório
                  </button_1.Button>
                </dialog_1.DialogTrigger>
                <dialog_1.DialogContent className="sm:max-w-[525px]">
                  <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>Novo Relatório Personalizado</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                      Configure um novo relatório personalizado para análise de
                      estoque.
                    </dialog_1.DialogDescription>
                  </dialog_1.DialogHeader>
                  <ReportForm onSave={function (report) {
            setShowCreateDialog(false);
            loadData();
        }} onCancel={function () { return setShowCreateDialog(false); }}/>
                </dialog_1.DialogContent>
              </dialog_1.Dialog>
            </div>

            {filteredReports.length === 0 ? (<alert_1.Alert>
                <lucide_react_1.FileText className="h-4 w-4"/>
                <alert_1.AlertDescription>
                  Nenhum relatório encontrado. Crie um novo relatório para
                  começar.
                </alert_1.AlertDescription>
              </alert_1.Alert>) : (<table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Nome</table_1.TableHead>
                    <table_1.TableHead>Tipo</table_1.TableHead>
                    <table_1.TableHead>Última Execução</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Ações</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {filteredReports.map(function (report) {
                var Icon = reportTypeIcons[report.reportType];
                return (<table_1.TableRow key={report.id}>
                        <table_1.TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4"/>
                            <div>
                              <p className="font-medium">{report.reportName}</p>
                              <p className="text-sm text-muted-foreground">
                                {report.executionCount} execuções
                              </p>
                            </div>
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <badge_1.Badge variant="secondary" className="text-xs">
                            {reportTypeLabels[report.reportType]}
                          </badge_1.Badge>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          {report.lastExecutedAt ? (<span className="text-sm">
                              {(0, date_fns_1.format)(new Date(report.lastExecutedAt), "dd/MM/yy HH:mm", { locale: locale_1.pt })}
                            </span>) : (<span className="text-sm text-muted-foreground">
                              Nunca executado
                            </span>)}
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <badge_1.Badge variant={report.isActive ? "default" : "secondary"} className="text-xs">
                            {report.isActive ? "Ativo" : "Inativo"}
                          </badge_1.Badge>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex items-center gap-2">
                            <button_1.Button variant="outline" size="sm" onClick={function () { return generateReport(report.id); }}>
                              <lucide_react_1.Download className="h-4 w-4"/>
                            </button_1.Button>
                            <button_1.Button variant="outline" size="sm">
                              <lucide_react_1.Eye className="h-4 w-4"/>
                            </button_1.Button>
                            <button_1.Button variant="outline" size="sm">
                              <lucide_react_1.Settings className="h-4 w-4"/>
                            </button_1.Button>
                          </div>
                        </table_1.TableCell>
                      </table_1.TableRow>);
            })}
                </table_1.TableBody>
              </table_1.Table>)}
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </card_1.CardContent>
    </card_1.Card>);
}
// Report Form Component (placeholder)
function ReportForm(_a) {
    var onSave = _a.onSave, onCancel = _a.onCancel;
    return (<div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Formulário de criação de relatório será implementado na próxima
        iteração.
      </p>
      <dialog_1.DialogFooter>
        <button_1.Button variant="outline" onClick={onCancel}>
          Cancelar
        </button_1.Button>
        <button_1.Button onClick={function () { return onSave({}); }}>Criar Relatório</button_1.Button>
      </dialog_1.DialogFooter>
    </div>);
}
