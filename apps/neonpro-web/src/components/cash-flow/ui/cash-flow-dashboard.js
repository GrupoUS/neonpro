"use client";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
exports.CashFlowDashboard = CashFlowDashboard;
var react_1 = require("react");
var date_fns_1 = require("date-fns");
var lucide_react_1 = require("lucide-react");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
// Hooks para dados
var useCashFlow_1 = require("../hooks/useCashFlow");
// Utilitários
var calculations_1 = require("../utils/calculations");
// Componentes
var transaction_entry_form_1 = require("./transaction-entry-form");
// Helper functions for dashboard calculations and formatting
var formatDate = (date) => {
  var d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
var getDateRange = (period) => {
  var now = new Date();
  var start;
  switch (period) {
    case "today":
      start = (0, date_fns_1.startOfDay)(now);
      break;
    case "week":
      start = (0, date_fns_1.subWeeks)((0, date_fns_1.startOfDay)(now), 1);
      break;
    case "month":
      start = (0, date_fns_1.subMonths)((0, date_fns_1.startOfDay)(now), 1);
      break;
    case "year":
      start = (0, date_fns_1.subYears)((0, date_fns_1.startOfDay)(now), 1);
      break;
    default:
      start = (0, date_fns_1.startOfDay)(now);
  }
  return {
    start: (0, date_fns_1.format)(start, "yyyy-MM-dd"),
    end: (0, date_fns_1.format)((0, date_fns_1.endOfDay)(now), "yyyy-MM-dd"),
  };
};
function CashFlowDashboard(_a) {
  var clinicId = _a.clinicId,
    userId = _a.userId;
  var _b = (0, react_1.useState)("today"),
    selectedPeriod = _b[0],
    setSelectedPeriod = _b[1];
  var _c = (0, react_1.useState)(),
    selectedRegisterId = _c[0],
    setSelectedRegisterId = _c[1];
  var _d = (0, react_1.useState)(false),
    showNewTransaction = _d[0],
    setShowNewTransaction = _d[1];
  var _e = (0, react_1.useState)("overview"),
    activeTab = _e[0],
    setActiveTab = _e[1];
  // Get date range for current period
  var _f = getDateRange(selectedPeriod),
    start = _f.start,
    end = _f.end;
  // Create filters for current selection
  var filters = (0, react_1.useMemo)(
    () => ({
      dateFrom: start,
      dateTo: end,
      registerId: selectedRegisterId,
    }),
    [start, end, selectedRegisterId],
  );
  // Fetch data using hooks
  var _g = (0, useCashFlow_1.useCashRegisters)(clinicId),
    registers = _g.registers,
    registersLoading = _g.loading,
    refetchRegisters = _g.refetch;
  var _h = (0, useCashFlow_1.useCashFlowEntries)(clinicId, filters),
    entries = _h.entries,
    entriesLoading = _h.loading,
    refetchEntries = _h.refetch;
  var _j = (0, useCashFlow_1.useCashFlowAnalytics)(clinicId, filters),
    analytics = _j.analytics,
    analyticsLoading = _j.loading,
    refetchAnalytics = _j.refetch;
  var loading = registersLoading || entriesLoading || analyticsLoading;
  // Handle refresh of all data
  var handleRefresh = () =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              Promise.all([refetchRegisters(), refetchEntries(), refetchAnalytics()]),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  // Calculate derived data
  var totalBalance = registers.reduce((sum, register) => sum + register.current_balance, 0);
  var activeRegisters = registers.filter((r) => r.is_active).length;
  var lowBalanceRegisters = registers.filter((r) => r.is_active && r.current_balance < 500).length;
  // Recent transactions for overview
  var recentTransactions = entries.slice(0, 10).map((t) => {
    var _a;
    return __assign(__assign({}, t), {
      registerName:
        ((_a = registers.find((r) => r.id === t.register_id)) === null || _a === void 0
          ? void 0
          : _a.register_name) || "Desconhecido",
    });
  });
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">
            Gerencie entradas, saídas e conciliação de pagamentos
          </p>
        </div>
        <div className="flex gap-2">
          <button_1.Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <lucide_react_1.RefreshCw
              className={"h-4 w-4 mr-2 ".concat(loading ? "animate-spin" : "")}
            />
            Atualizar
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Settings className="h-4 w-4 mr-2" />
            Configurações
          </button_1.Button>
          <button_1.Button size="sm" onClick={() => setShowNewTransaction(true)}>
            <lucide_react_1.Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </button_1.Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <lucide_react_1.Calendar className="h-4 w-4" />
          <select_1.Select
            value={selectedPeriod}
            onValueChange={(value) => setSelectedPeriod(value)}
          >
            <select_1.SelectTrigger className="w-32">
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="today">Hoje</select_1.SelectItem>
              <select_1.SelectItem value="week">Esta Semana</select_1.SelectItem>
              <select_1.SelectItem value="month">Este Mês</select_1.SelectItem>
              <select_1.SelectItem value="year">Este Ano</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>

        <div className="flex items-center gap-2">
          <lucide_react_1.Filter className="h-4 w-4" />
          <select_1.Select
            value={selectedRegisterId || "all"}
            onValueChange={(value) => setSelectedRegisterId(value === "all" ? undefined : value)}
          >
            <select_1.SelectTrigger className="w-48">
              <select_1.SelectValue placeholder="Todos os caixas" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos os caixas</select_1.SelectItem>
              {registers.map((register) => (
                <select_1.SelectItem key={register.id} value={register.id}>
                  {register.register_name} -{" "}
                  {(0, calculations_1.formatCurrency)(register.current_balance)}
                </select_1.SelectItem>
              ))}
            </select_1.SelectContent>
          </select_1.Select>
        </div>

        {lowBalanceRegisters > 0 && (
          <badge_1.Badge variant="outline" className="text-yellow-600 border-yellow-200">
            <lucide_react_1.AlertTriangle className="h-3 w-3 mr-1" />
            {lowBalanceRegisters} caixa(s) com saldo baixo
          </badge_1.Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Saldo Total</card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {(0, calculations_1.formatCurrency)(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Em {activeRegisters} caixa(s) ativo(s)</p>
            {lowBalanceRegisters > 0 && (
              <div className="mt-2">
                <progress_1.Progress
                  value={((activeRegisters - lowBalanceRegisters) / activeRegisters) * 100}
                  className="h-1"
                />
                <p className="text-xs text-yellow-600 mt-1">
                  {lowBalanceRegisters} caixa(s) com saldo baixo
                </p>
              </div>
            )}
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Entradas</card_1.CardTitle>
            <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics ? (0, calculations_1.formatCurrency)(analytics.totalIncome) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {entries.filter((e) => e.transaction_type === "receipt").length} transações
            </p>
            {analytics && analytics.totalIncome > 0 && (
              <p className="text-xs text-green-600">
                Média:{" "}
                {(0, calculations_1.formatCurrency)(
                  analytics.totalIncome /
                    Math.max(1, entries.filter((e) => e.transaction_type === "receipt").length),
                )}
              </p>
            )}
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Saídas</card_1.CardTitle>
            <lucide_react_1.TrendingDown className="h-4 w-4 text-red-600" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics ? (0, calculations_1.formatCurrency)(analytics.totalExpenses) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {entries.filter((e) => e.transaction_type === "payment").length} transações
            </p>
            {analytics && analytics.totalExpenses > 0 && (
              <p className="text-xs text-red-600">
                Média:{" "}
                {(0, calculations_1.formatCurrency)(
                  analytics.totalExpenses /
                    Math.max(1, entries.filter((e) => e.transaction_type === "payment").length),
                )}
              </p>
            )}
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Saldo Líquido</card_1.CardTitle>
            <lucide_react_1.BarChart3 className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div
              className={"text-2xl font-bold ".concat(
                analytics && analytics.netCashFlow >= 0 ? "text-green-600" : "text-red-600",
              )}
            >
              {analytics ? (0, calculations_1.formatCurrency)(analytics.netCashFlow) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">No período selecionado</p>
            <div className="flex items-center mt-2">
              {analytics && analytics.netCashFlow >= 0
                ? <lucide_react_1.CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                : <lucide_react_1.AlertTriangle className="h-3 w-3 text-red-600 mr-1" />}
              <span
                className={"text-xs ".concat(
                  analytics && analytics.netCashFlow >= 0 ? "text-green-600" : "text-red-600",
                )}
              >
                {analytics && analytics.netCashFlow >= 0 ? "Positivo" : "Negativo"}
              </span>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Content Tabs */}
      <tabs_1.Tabs defaultValue="overview" className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="transactions">Transações</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="registers">Caixas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Relatórios</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="reconciliation">Conciliação</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Transactions */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Clock className="h-4 w-4" />
                  Transações Recentes
                </card_1.CardTitle>
                <card_1.CardDescription>Últimas 10 transações registradas</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={"h-2 w-2 rounded-full ".concat(
                            transaction.transaction_type === "receipt"
                              ? "bg-green-500"
                              : "bg-red-500",
                          )}
                        />
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.registerName} • {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div
                        className={"text-sm font-medium ".concat(
                          transaction.transaction_type === "receipt"
                            ? "text-green-600"
                            : "text-red-600",
                        )}
                      >
                        {transaction.transaction_type === "receipt" ? "+" : "-"}
                        {(0, calculations_1.formatCurrency)(transaction.amount)}
                      </div>
                    </div>
                  ))}
                  {recentTransactions.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <div className="mb-2">
                        <lucide_react_1.BarChart3 className="h-8 w-8 mx-auto text-muted-foreground/50" />
                      </div>
                      <p className="text-sm">Nenhuma transação encontrada</p>
                      <p className="text-xs">Adicione transações para ver o resumo aqui</p>
                    </div>
                  )}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Cash Registers Status */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Wallet className="h-4 w-4" />
                  Status dos Caixas
                </card_1.CardTitle>
                <card_1.CardDescription>Saldos atuais de todos os caixas</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {registers.map((register) => (
                    <div key={register.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={"h-2 w-2 rounded-full ".concat(
                            register.is_active ? "bg-green-500" : "bg-gray-400",
                          )}
                        />
                        <div>
                          <p className="text-sm font-medium">{register.register_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {register.is_active ? "Ativo" : "Inativo"}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {(0, calculations_1.formatCurrency)(register.current_balance)}
                      </div>
                    </div>
                  ))}
                  {registers.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <div className="mb-2">
                        <lucide_react_1.Wallet className="h-8 w-8 mx-auto text-muted-foreground/50" />
                      </div>
                      <p className="text-sm">Nenhum caixa configurado</p>
                      <p className="text-xs">Configure caixas para começar</p>
                    </div>
                  )}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="transactions" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Transações Recentes</card_1.CardTitle>
              <card_1.CardDescription>
                Gerencie todas as transações de entrada e saída
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {/* TransactionsList component will be implemented next */}
              <div className="text-center py-8 text-muted-foreground">
                <p>Lista de transações será implementada</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="registers" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Gestão de Caixas</card_1.CardTitle>
              <card_1.CardDescription>
                Configure e monitore os caixas da clínica
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {/* Cash register management will be implemented */}
              <div className="text-center py-8 text-muted-foreground">
                <p>Gestão de caixas será implementada</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="analytics" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Análises e Relatórios</card_1.CardTitle>
              <card_1.CardDescription>Análises detalhadas do fluxo de caixa</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {/* Analytics charts will be implemented */}
              <div className="text-center py-8 text-muted-foreground">
                <p>Relatórios serão implementados</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="reconciliation" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Conciliação de Pagamentos</card_1.CardTitle>
              <card_1.CardDescription>
                Reconcilie pagamentos com gateways externos
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {/* Reconciliation tools will be implemented */}
              <div className="text-center py-8 text-muted-foreground">
                <p>Ferramentas de conciliação serão implementadas</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Transaction Entry Form Modal */}
      {showNewTransaction && (
        <transaction_entry_form_1.TransactionEntryForm
          clinicId={clinicId}
          userId={userId}
          registers={registers}
          onClose={() => setShowNewTransaction(false)}
          onSuccess={() => {
            setShowNewTransaction(false);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
