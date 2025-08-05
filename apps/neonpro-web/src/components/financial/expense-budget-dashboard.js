// Expense & Budget Management Dashboard
// Epic 5, Story 5.1, Task 5: Expense & Budget Management UI
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================
"use client";
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExpenseBudgetDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var expense_budget_engine_1 = require("@/lib/financial/expense-budget-engine");
function ExpenseBudgetDashboard() {
  var _a = (0, react_1.useState)(true),
    loading = _a[0],
    setLoading = _a[1];
  var _b = (0, react_1.useState)("current_month"),
    period = _b[0],
    setPeriod = _b[1];
  var _c = (0, react_1.useState)([]),
    categories = _c[0],
    setCategories = _c[1];
  var _d = (0, react_1.useState)([]),
    alerts = _d[0],
    setAlerts = _d[1];
  var _e = (0, react_1.useState)([]),
    vendors = _e[0],
    setVendors = _e[1];
  var _f = (0, react_1.useState)([]),
    trends = _f[0],
    setTrends = _f[1];
  var _g = (0, react_1.useState)([]),
    insights = _g[0],
    setInsights = _g[1];
  var _h = (0, react_1.useState)([]),
    costCenters = _h[0],
    setCostCenters = _h[1];
  var expenseEngine = new expense_budget_engine_1.ExpenseBudgetEngine();
  (0, react_1.useEffect)(() => {
    loadExpenseData();
  }, [period]);
  var loadExpenseData = () =>
    __awaiter(this, void 0, void 0, function () {
      var clinicId,
        dateRange,
        _a,
        budgetReport,
        vendorData,
        trendData,
        optimizationInsights,
        costCenterData,
        error_1;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            setLoading(true);
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, 4, 5]);
            clinicId = "clinic-1";
            dateRange = parsePeriodToDates(period);
            return [
              4 /*yield*/,
              Promise.all([
                expenseEngine.generateBudgetVarianceReport(clinicId, period),
                expenseEngine.analyzeVendorExpenses(clinicId, dateRange),
                expenseEngine.analyzeExpenseTrends(clinicId, dateRange),
                expenseEngine.generateCostOptimizationInsights(clinicId, dateRange),
                expenseEngine.allocateCostsByCenter(clinicId, dateRange),
              ]),
            ];
          case 2:
            (_a = _b.sent()),
              (budgetReport = _a[0]),
              (vendorData = _a[1]),
              (trendData = _a[2]),
              (optimizationInsights = _a[3]),
              (costCenterData = _a[4]);
            setCategories(budgetReport.categories);
            setAlerts(budgetReport.alerts);
            setVendors(vendorData);
            setTrends(trendData);
            setInsights(optimizationInsights);
            setCostCenters(costCenterData);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _b.sent();
            console.error("Failed to load expense data:", error_1);
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var parsePeriodToDates = (period) => {
    var now = new Date();
    switch (period) {
      case "current_month":
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
      case "current_quarter": {
        var quarterStart = Math.floor(now.getMonth() / 3) * 3;
        return {
          start: new Date(now.getFullYear(), quarterStart, 1),
          end: new Date(now.getFullYear(), quarterStart + 3, 0),
        };
      }
      case "current_year":
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: new Date(now.getFullYear(), 11, 31),
        };
      default:
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
    }
  };
  var formatCurrency = (amount) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  var formatPercent = (percent) => "".concat(percent.toFixed(1), "%");
  var getAlertColor = (alertType) => {
    switch (alertType) {
      case "warning":
        return "bg-yellow-100 border-yellow-200 text-yellow-800";
      case "critical":
        return "bg-orange-100 border-orange-200 text-orange-800";
      case "exceeded":
        return "bg-red-100 border-red-200 text-red-800";
      default:
        return "bg-gray-100 border-gray-200 text-gray-800";
    }
  };
  var totalBudget = categories.reduce((sum, cat) => sum + cat.budgetAllocation, 0);
  var totalActual = categories.reduce((sum, cat) => sum + cat.actualSpending, 0);
  var totalVariance = totalActual - totalBudget;
  var variancePercent = totalBudget > 0 ? (totalVariance / totalBudget) * 100 : 0;
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados de despesas...</span>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Despesas & Orçamento</h2>
          <p className="text-muted-foreground">
            Controle orçamentário, análise de variação e otimização de custos
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select_1.Select value={period} onValueChange={setPeriod}>
            <select_1.SelectTrigger className="w-48">
              <select_1.SelectValue placeholder="Selecionar período" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="current_month">Mês Atual</select_1.SelectItem>
              <select_1.SelectItem value="current_quarter">Trimestre Atual</select_1.SelectItem>
              <select_1.SelectItem value="current_year">Ano Atual</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          <button_1.Button onClick={loadExpenseData} variant="outline">
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button_1.Button>
          <button_1.Button variant="outline">
            <lucide_react_1.Download className="h-4 w-4 mr-2" />
            Exportar
          </button_1.Button>
        </div>
      </div>

      {/* Budget Alerts */}
      {alerts.filter((alert) => !alert.isResolved).length > 0 && (
        <div className="space-y-2">
          {alerts
            .filter((alert) => !alert.isResolved)
            .slice(0, 3)
            .map((alert) => (
              <alert_1.Alert key={alert.alertId} className={getAlertColor(alert.alertType)}>
                <lucide_react_1.AlertTriangle className="h-4 w-4" />
                <alert_1.AlertTitle>
                  {alert.alertType === "warning"
                    ? "Atenção"
                    : alert.alertType === "critical"
                      ? "Crítico"
                      : "Orçamento Excedido"}
                  : {alert.categoryName}
                </alert_1.AlertTitle>
                <alert_1.AlertDescription>{alert.message}</alert_1.AlertDescription>
              </alert_1.Alert>
            ))}
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Orçamento Total</card_1.CardTitle>
            <lucide_react_1.Target className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">Alocação total do período</p>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Gasto Real</card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalActual)}</div>
            <p className="text-xs text-muted-foreground">Execução orçamentária</p>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Variação</card_1.CardTitle>
            {totalVariance > 0
              ? <lucide_react_1.TrendingUp className="h-4 w-4 text-red-500" />
              : <lucide_react_1.TrendingDown className="h-4 w-4 text-green-500" />}
          </card_1.CardHeader>
          <card_1.CardContent>
            <div
              className={"text-2xl font-bold ".concat(
                totalVariance > 0 ? "text-red-600" : "text-green-600",
              )}
            >
              {totalVariance > 0 ? "+" : ""}
              {formatCurrency(totalVariance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercent(Math.abs(variancePercent))} do orçamento
            </p>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Alertas Ativos</card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter((alert) => !alert.isResolved).length}
            </div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Tabs */}
      <tabs_1.Tabs defaultValue="budget" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="budget">Variação Orçamentária</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="vendors">Fornecedores</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="trends">Tendências</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="optimization">Otimização</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="centers">Centros de Custo</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="budget" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Variação Orçamentária por Categoria</card_1.CardTitle>
              <card_1.CardDescription>Análise de execução vs planejamento</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.categoryId} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{category.categoryName}</h4>
                      <div className="flex items-center space-x-2">
                        {category.isOverBudget && (
                          <badge_1.Badge variant="destructive">Excedido</badge_1.Badge>
                        )}
                        <badge_1.Badge
                          variant={
                            Math.abs(category.variancePercent) < 5
                              ? "default"
                              : Math.abs(category.variancePercent) < 10
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {formatPercent(category.variancePercent)} variação
                        </badge_1.Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Orçado: {formatCurrency(category.budgetAllocation)}</span>
                        <span>Realizado: {formatCurrency(category.actualSpending)}</span>
                      </div>
                      <progress_1.Progress
                        value={Math.min(
                          100,
                          (category.actualSpending / category.budgetAllocation) * 100,
                        )}
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground">
                        Variação: {category.variance > 0 ? "+" : ""}
                        {formatCurrency(category.variance)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="vendors" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Análise de Fornecedores</card_1.CardTitle>
              <card_1.CardDescription>Performance e gastos por fornecedor</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {vendors.map((vendor) => (
                  <div
                    key={vendor.vendorId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{vendor.vendorName}</h4>
                        <div className="flex items-center space-x-2">
                          <badge_1.Badge variant="outline">{vendor.category}</badge_1.Badge>
                          <badge_1.Badge
                            variant={
                              vendor.performanceScore > 8
                                ? "default"
                                : vendor.performanceScore > 6
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {vendor.performanceScore.toFixed(1)} score
                          </badge_1.Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Gasto</p>
                          <p className="font-medium">{formatCurrency(vendor.totalSpent)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Transações</p>
                          <p className="font-medium">{vendor.transactionCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Valor Médio</p>
                          <p className="font-medium">{formatCurrency(vendor.averageAmount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pendente</p>
                          <p className="font-medium">{formatCurrency(vendor.outstandingAmount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Último Pagamento</p>
                          <p className="font-medium">
                            {vendor.lastPayment.toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="trends" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Tendências de Despesas</card_1.CardTitle>
              <card_1.CardDescription>
                Análise temporal e identificação de padrões
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {trends.map((trend, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{trend.period}</h4>
                        <badge_1.Badge variant={trend.growthRate > 0 ? "destructive" : "default"}>
                          {trend.growthRate > 0
                            ? <lucide_react_1.TrendingUp className="h-3 w-3 mr-1" />
                            : <lucide_react_1.TrendingDown className="h-3 w-3 mr-1" />}
                          {trend.growthRate > 0 ? "+" : ""}
                          {formatPercent(trend.growthRate)}
                        </badge_1.Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Despesas</p>
                          <p className="font-medium">{formatCurrency(trend.totalExpenses)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Volatilidade</p>
                          <p className="font-medium">{formatPercent(trend.volatility)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Economia Potencial</p>
                          <p className="font-medium text-green-600">
                            {formatCurrency(trend.costSavingPotential)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="optimization" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Oportunidades de Otimização</card_1.CardTitle>
              <card_1.CardDescription>
                Insights para redução de custos e melhoria de eficiência
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{insight.category}</h4>
                      <div className="flex items-center space-x-2">
                        <badge_1.Badge
                          variant={
                            insight.priority === "high"
                              ? "destructive"
                              : insight.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {insight.priority}
                        </badge_1.Badge>
                        <badge_1.Badge variant="outline">
                          {formatCurrency(insight.savingsPotential)} economia
                        </badge_1.Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-muted-foreground">Gasto Atual</p>
                        <p className="font-medium">{formatCurrency(insight.currentSpending)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Benchmark</p>
                        <p className="font-medium">{formatCurrency(insight.benchmarkSpending)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Esforço</p>
                        <p className="font-medium">{insight.implementationEffort}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Recomendações:</p>
                      <div className="flex flex-wrap gap-1">
                        {insight.recommendations.map((rec, recIndex) => (
                          <badge_1.Badge key={recIndex} variant="outline" className="text-xs">
                            {rec}
                          </badge_1.Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="centers" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Centros de Custo</card_1.CardTitle>
              <card_1.CardDescription>
                Alocação departamental e análise de eficiência
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {costCenters.map((center) => (
                  <div
                    key={center.costCenterId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{center.costCenterName}</h4>
                        <badge_1.Badge variant="outline">{center.department}</badge_1.Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Orçamento</p>
                          <p className="font-medium">{formatCurrency(center.allocatedBudget)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Executado</p>
                          <p className="font-medium">{formatCurrency(center.actualExpenses)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Utilização</p>
                          <div className="flex items-center space-x-2">
                            <progress_1.Progress
                              value={center.utilizationRate}
                              className="flex-1"
                            />
                            <span className="text-xs">{formatPercent(center.utilizationRate)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Contribuição</p>
                          <p className="font-medium">{formatCurrency(center.profitContribution)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
