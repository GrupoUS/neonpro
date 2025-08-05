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
exports.default = FinancialReportsPage;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var financial_reports_service_1 = require("@/lib/services/financial-reports-service");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function FinancialReportsPage(_a) {
    var _this = this;
    var clinicId = _a.clinicId;
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)("summary"), activeTab = _c[0], setActiveTab = _c[1];
    // Estados para dados dos relatórios
    var _d = (0, react_1.useState)(null), summary = _d[0], setSummary = _d[1];
    var _e = (0, react_1.useState)([]), agingData = _e[0], setAgingData = _e[1];
    var _f = (0, react_1.useState)([]), vendorPerformance = _f[0], setVendorPerformance = _f[1];
    var _g = (0, react_1.useState)([]), categoryExpenses = _g[0], setCategoryExpenses = _g[1];
    var _h = (0, react_1.useState)(null), budgetTracking = _h[0], setBudgetTracking = _h[1];
    // Filtros de período
    var _j = (0, react_1.useState)("current-month"), selectedPeriod = _j[0], setSelectedPeriod = _j[1];
    var loadReportsData = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, summaryData, agingReport, performanceData, categoryData, budgetData, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, Promise.all([
                            financial_reports_service_1.financialReportsService.getFinancialSummary(clinicId),
                            financial_reports_service_1.financialReportsService.getAgingReport(clinicId),
                            financial_reports_service_1.financialReportsService.getVendorPerformanceReport(clinicId, "2025-01-01", "2025-07-21"),
                            financial_reports_service_1.financialReportsService.getCategoryExpenseReport(clinicId, 2025, 7),
                            financial_reports_service_1.financialReportsService.getBudgetTrackingReport(clinicId, "2025-07"),
                        ])];
                case 1:
                    _a = _b.sent(), summaryData = _a[0], agingReport = _a[1], performanceData = _a[2], categoryData = _a[3], budgetData = _a[4];
                    setSummary(summaryData);
                    setAgingData(agingReport);
                    setVendorPerformance(performanceData);
                    setCategoryExpenses(categoryData);
                    setBudgetTracking(budgetData);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error("Error loading reports data:", error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadReportsData();
    }, [clinicId, selectedPeriod]);
    var handleExportReport = function (reportType) {
        console.log("Exporting ".concat(reportType, " report..."));
        // Implementar exportação
    };
    var handleRefreshData = function () {
        loadReportsData();
    };
    return (<div className="container mx-auto py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Relatórios Financeiros
          </h1>
          <p className="text-muted-foreground">
            Análises e relatórios do sistema de contas a pagar
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button_1.Button variant="outline" size="sm" onClick={handleRefreshData} disabled={loading}>
            <lucide_react_1.RefreshCw className={"h-4 w-4 mr-2 ".concat(loading ? "animate-spin" : "")}/>
            Atualizar
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Filter className="h-4 w-4 mr-2"/>
            Filtros
          </button_1.Button>
        </div>
      </div>

      {/* Resumo Executivo */}
      {summary && (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Total a Pagar
              </card_1.CardTitle>
              <lucide_react_1.BarChart3 className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">
                {financial_reports_service_1.financialReportsService.formatCurrency(summary.total_payables)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <badge_1.Badge variant={summary.total_overdue > 0 ? "destructive" : "secondary"} className="text-xs">
                  {summary.total_overdue > 0 ? "Em atraso" : "Em dia"}
                </badge_1.Badge>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Fornecedores Ativos
              </card_1.CardTitle>
              <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{summary.active_vendors}</div>
              <p className="text-xs text-muted-foreground">
                de {summary.vendor_count} cadastrados
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Prazo Médio de Pagamento
              </card_1.CardTitle>
              <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">
                {summary.avg_payment_period.toFixed(1)} dias
              </div>
              <p className="text-xs text-muted-foreground">
                Média dos últimos 90 dias
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Economia YTD
              </card_1.CardTitle>
              <lucide_react_1.TrendingDown className="h-4 w-4 text-green-600"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-green-600">
                {financial_reports_service_1.financialReportsService.formatCurrency(summary.cost_savings_ytd)}
              </div>
              <p className="text-xs text-muted-foreground">
                Descontos e otimizações
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </div>)}

      {/* Tabs de Relatórios */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="summary">Resumo</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="aging">Aging</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="vendors">Fornecedores</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="categories">Categorias</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="budget">Orçamento</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Gráfico de Aging */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Distribuição por Vencimento</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {agingData.map(function (item) { return (<div key={item.vendor_id} className="flex items-center justify-between">
                      <span className="text-sm">{item.vendor_name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {financial_reports_service_1.financialReportsService.formatCurrency(item.total_amount)}
                        </span>
                        {item.overdue_count > 0 && (<badge_1.Badge variant="destructive" className="text-xs">
                            {item.overdue_count} em atraso
                          </badge_1.Badge>)}
                      </div>
                    </div>); })}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Top Categorias */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Gastos por Categoria (Mês Atual)</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {categoryExpenses.slice(0, 5).map(function (category) { return (<div key={category.category_id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {category.category_name}
                        </span>
                        <span className="text-lg">
                          {financial_reports_service_1.financialReportsService.getTrendIcon(category.trend)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {financial_reports_service_1.financialReportsService.formatCurrency(category.current_month)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {financial_reports_service_1.financialReportsService.formatPercentage(category.budget_used_percentage)}{" "}
                          do orçamento
                        </div>
                      </div>
                    </div>); })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="aging" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between">
              <card_1.CardTitle>Relatório de Aging - Contas a Pagar</card_1.CardTitle>
              <button_1.Button variant="outline" size="sm" onClick={function () { return handleExportReport("aging"); }}>
                <lucide_react_1.Download className="h-4 w-4 mr-2"/>
                Exportar
              </button_1.Button>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fornecedor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Atual (0-30)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        31-60 dias
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        61-90 dias
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        +90 dias
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {agingData.map(function (item) { return (<tr key={item.vendor_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.vendor_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.vendor_document}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {financial_reports_service_1.financialReportsService.formatCurrency(item.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {financial_reports_service_1.financialReportsService.formatCurrency(item.current)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {financial_reports_service_1.financialReportsService.formatCurrency(item.days_31_60)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {financial_reports_service_1.financialReportsService.formatCurrency(item.days_61_90)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {financial_reports_service_1.financialReportsService.formatCurrency(item.days_over_90)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.overdue_count > 0 ? (<badge_1.Badge variant="destructive">
                              <lucide_react_1.AlertTriangle className="w-3 h-3 mr-1"/>
                              {item.overdue_count} em atraso
                            </badge_1.Badge>) : (<badge_1.Badge variant="secondary">
                              <lucide_react_1.CheckCircle className="w-3 h-3 mr-1"/>
                              Em dia
                            </badge_1.Badge>)}
                        </td>
                      </tr>); })}
                  </tbody>
                </table>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="vendors" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between">
              <card_1.CardTitle>Performance de Fornecedores</card_1.CardTitle>
              <button_1.Button variant="outline" size="sm" onClick={function () { return handleExportReport("vendors"); }}>
                <lucide_react_1.Download className="h-4 w-4 mr-2"/>
                Exportar
              </button_1.Button>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {vendorPerformance.map(function (vendor) { return (<div key={vendor.vendor_id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{vendor.vendor_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {vendor.total_invoices} faturas •{" "}
                          {financial_reports_service_1.financialReportsService.formatCurrency(vendor.total_amount)}
                        </p>
                      </div>
                      <badge_1.Badge variant={financial_reports_service_1.financialReportsService.getRiskColor(vendor.risk_score)} className="text-sm">
                        Risco: {vendor.risk_score}/10
                      </badge_1.Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Prazo Médio:
                        </span>
                        <p className="font-medium">
                          {vendor.avg_payment_time.toFixed(1)} dias
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Pontualidade:
                        </span>
                        <p className="font-medium">
                          {financial_reports_service_1.financialReportsService.formatPercentage(vendor.on_time_percentage)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Descontos:
                        </span>
                        <p className="font-medium text-green-600">
                          {financial_reports_service_1.financialReportsService.formatCurrency(vendor.total_discounts_taken)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Último Pagamento:
                        </span>
                        <p className="font-medium">
                          {new Date(vendor.last_payment_date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="categories" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between">
              <card_1.CardTitle>Análise por Categoria</card_1.CardTitle>
              <button_1.Button variant="outline" size="sm" onClick={function () { return handleExportReport("categories"); }}>
                <lucide_react_1.Download className="h-4 w-4 mr-2"/>
                Exportar
              </button_1.Button>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {categoryExpenses.map(function (category) { return (<div key={category.category_id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">
                          {category.category_name}
                        </h3>
                        <span className="text-lg">
                          {financial_reports_service_1.financialReportsService.getTrendIcon(category.trend)}
                        </span>
                      </div>
                      <badge_1.Badge variant={financial_reports_service_1.financialReportsService.getBudgetHealthColor(category.budget_used_percentage)}>
                        {financial_reports_service_1.financialReportsService.formatPercentage(category.budget_used_percentage)}{" "}
                        do orçamento
                      </badge_1.Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Mês Atual:
                        </span>
                        <p className="font-medium">
                          {financial_reports_service_1.financialReportsService.formatCurrency(category.current_month)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Mês Anterior:
                        </span>
                        <p className="font-medium">
                          {financial_reports_service_1.financialReportsService.formatCurrency(category.previous_month)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Ano até agora:
                        </span>
                        <p className="font-medium">
                          {financial_reports_service_1.financialReportsService.formatCurrency(category.year_to_date)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Faturas:</span>
                        <p className="font-medium">
                          {category.invoice_count} • Média:{" "}
                          {financial_reports_service_1.financialReportsService.formatCurrency(category.avg_invoice_amount)}
                        </p>
                      </div>
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="budget" className="space-y-4">
          {budgetTracking && (<>
              {/* Alertas de Orçamento */}
              {budgetTracking.alerts.length > 0 && (<card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="flex items-center">
                      <lucide_react_1.AlertTriangle className="h-5 w-5 mr-2 text-yellow-600"/>
                      Alertas de Orçamento
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-3">
                      {budgetTracking.alerts.map(function (alert, index) { return (<div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <lucide_react_1.AlertTriangle className="h-5 w-5 mt-0.5 text-yellow-600"/>
                          <div>
                            <p className="font-medium">{alert.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {alert.message}
                            </p>
                            <p className="text-sm font-medium text-red-600">
                              Valor:{" "}
                              {financial_reports_service_1.financialReportsService.formatCurrency(alert.amount)}
                            </p>
                          </div>
                        </div>); })}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>)}

              {/* Resumo do Orçamento */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>
                    Resumo Orçamentário - {budgetTracking.period}
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Orçado</p>
                      <p className="text-2xl font-bold">
                        {financial_reports_service_1.financialReportsService.formatCurrency(budgetTracking.total_budget)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Gasto</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {financial_reports_service_1.financialReportsService.formatCurrency(budgetTracking.total_spent)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Comprometido
                      </p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {financial_reports_service_1.financialReportsService.formatCurrency(budgetTracking.total_committed)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Disponível
                      </p>
                      <p className={"text-2xl font-bold ".concat(budgetTracking.remaining_budget < 0
                ? "text-red-600"
                : "text-green-600")}>
                        {financial_reports_service_1.financialReportsService.formatCurrency(budgetTracking.remaining_budget)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {budgetTracking.categories.map(function (category, index) { return (<div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">
                            {category.category_name}
                          </h4>
                          <badge_1.Badge variant={financial_reports_service_1.financialReportsService.getBudgetHealthColor(category.utilization_percentage)}>
                            {financial_reports_service_1.financialReportsService.formatPercentage(category.utilization_percentage)}
                          </badge_1.Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Orçado:
                            </span>
                            <p className="font-medium">
                              {financial_reports_service_1.financialReportsService.formatCurrency(category.budgeted)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Gasto:
                            </span>
                            <p className="font-medium">
                              {financial_reports_service_1.financialReportsService.formatCurrency(category.spent)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Disponível:
                            </span>
                            <p className={"font-medium ".concat(category.remaining < 0
                    ? "text-red-600"
                    : "text-green-600")}>
                              {financial_reports_service_1.financialReportsService.formatCurrency(category.remaining)}
                            </p>
                          </div>
                        </div>
                      </div>); })}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </>)}
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
