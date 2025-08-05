// Transactions List - Display and manage cash flow transactions
// Following financial dashboard patterns from Context7 research
"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsList = TransactionsList;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var use_cash_flow_1 = require("../hooks/use-cash-flow");
var use_cash_registers_1 = require("../hooks/use-cash-registers");
var calculations_1 = require("../utils/calculations");
function TransactionsList(_a) {
  var clinicId = _a.clinicId,
    initialFilters = _a.initialFilters;
  var _b = (0, react_1.useState)(""),
    searchTerm = _b[0],
    setSearchTerm = _b[1];
  var _c = (0, react_1.useState)(initialFilters || {}),
    filters = _c[0],
    setFilters = _c[1];
  var registers = (0, use_cash_registers_1.useCashRegisters)(clinicId).registers;
  var _d = (0, use_cash_flow_1.useCashFlow)(
      clinicId,
      __assign(__assign({}, filters), { search: searchTerm }),
    ),
    entries = _d.entries,
    loading = _d.loading,
    totalPages = _d.totalPages,
    currentPage = _d.currentPage,
    loadEntries = _d.loadEntries,
    updateEntry = _d.updateEntry,
    deleteEntry = _d.deleteEntry;
  var handleFilterChange = function (key, value) {
    var _a;
    var newFilters = __assign(__assign({}, filters), ((_a = {}), (_a[key] = value), _a));
    setFilters(newFilters);
    loadEntries(newFilters);
  };
  var handleSearch = function (term) {
    setSearchTerm(term);
    loadEntries(__assign(__assign({}, filters), { search: term }));
  };
  var getRegisterName = function (registerId) {
    var register = registers.find(function (r) {
      return r.id === registerId;
    });
    return (register === null || register === void 0 ? void 0 : register.register_name) || "N/A";
  };
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <card_1.CardTitle>Transações</card_1.CardTitle>
            <card_1.CardDescription>Histórico de movimentações financeiras</card_1.CardDescription>
          </div>
          <button_1.Button size="sm">Nova Transação</button_1.Button>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent>
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input_1.Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={function (e) {
                  return handleSearch(e.target.value);
                }}
                className="pl-10"
              />
            </div>
            <button_1.Button variant="outline" size="icon">
              <lucide_react_1.Filter className="h-4 w-4" />
            </button_1.Button>
          </div>

          <div className="flex gap-2">
            <select_1.Select
              value={filters.transactionType || ""}
              onValueChange={function (value) {
                return handleFilterChange("transactionType", value || undefined);
              }}
            >
              <select_1.SelectTrigger className="w-[180px]">
                <select_1.SelectValue placeholder="Tipo" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="">Todos os tipos</select_1.SelectItem>
                <select_1.SelectItem value="receipt">Recebimento</select_1.SelectItem>
                <select_1.SelectItem value="payment">Pagamento</select_1.SelectItem>
                <select_1.SelectItem value="transfer">Transferência</select_1.SelectItem>
                <select_1.SelectItem value="adjustment">Ajuste</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>

            <select_1.Select
              value={filters.paymentMethod || ""}
              onValueChange={function (value) {
                return handleFilterChange("paymentMethod", value || undefined);
              }}
            >
              <select_1.SelectTrigger className="w-[180px]">
                <select_1.SelectValue placeholder="Forma de pagamento" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="">Todas as formas</select_1.SelectItem>
                <select_1.SelectItem value="cash">Dinheiro</select_1.SelectItem>
                <select_1.SelectItem value="credit_card">Cartão de Crédito</select_1.SelectItem>
                <select_1.SelectItem value="debit_card">Cartão de Débito</select_1.SelectItem>
                <select_1.SelectItem value="pix">PIX</select_1.SelectItem>
                <select_1.SelectItem value="bank_transfer">Transferência</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>

            <select_1.Select
              value={filters.registerId || ""}
              onValueChange={function (value) {
                return handleFilterChange("registerId", value || undefined);
              }}
            >
              <select_1.SelectTrigger className="w-[180px]">
                <select_1.SelectValue placeholder="Caixa" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="">Todos os caixas</select_1.SelectItem>
                {registers.map(function (register) {
                  return (
                    <select_1.SelectItem key={register.id} value={register.id}>
                      {register.register_name}
                    </select_1.SelectItem>
                  );
                })}
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </div>{" "}
        {/* Transactions Table */}
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Data/Hora</th>
                  <th className="text-left p-4 font-medium">Tipo</th>
                  <th className="text-left p-4 font-medium">Descrição</th>
                  <th className="text-left p-4 font-medium">Categoria</th>
                  <th className="text-left p-4 font-medium">Valor</th>
                  <th className="text-left p-4 font-medium">Pagamento</th>
                  <th className="text-left p-4 font-medium">Caixa</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <tr>
                      <td colSpan={9} className="text-center py-8 text-muted-foreground">
                        Carregando transações...
                      </td>
                    </tr>
                  : entries.length === 0
                    ? <tr>
                        <td colSpan={9} className="text-center py-8 text-muted-foreground">
                          Nenhuma transação encontrada
                        </td>
                      </tr>
                    : entries.map(function (entry) {
                        return (
                          <TransactionRow
                            key={entry.id}
                            entry={entry}
                            registerName={getRegisterName(entry.register_id || "")}
                            onUpdate={updateEntry}
                            onDelete={deleteEntry}
                          />
                        );
                      })}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button_1.Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={function () {
                  return loadEntries(filters, currentPage - 1);
                }}
              >
                Anterior
              </button_1.Button>
              <button_1.Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={function () {
                  return loadEntries(filters, currentPage + 1);
                }}
              >
                Próxima
              </button_1.Button>
            </div>
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
function TransactionRow(_a) {
  var entry = _a.entry,
    registerName = _a.registerName,
    onUpdate = _a.onUpdate,
    onDelete = _a.onDelete;
  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-4">
        <div className="text-sm">{(0, calculations_1.formatDateTime)(entry.created_at)}</div>
      </td>
      <td className="p-4">
        <badge_1.Badge
          variant="outline"
          className={(0, calculations_1.getTransactionTypeColor)(entry.transaction_type)}
        >
          {(0, calculations_1.getTransactionTypeDisplayName)(entry.transaction_type)}
        </badge_1.Badge>
      </td>
      <td className="p-4">
        <div className="max-w-[200px] truncate">{entry.description}</div>
        {entry.reference_number && (
          <div className="text-xs text-muted-foreground">Ref: {entry.reference_number}</div>
        )}
      </td>
      <td className="p-4">
        <span className="text-sm">
          {(0, calculations_1.getCategoryDisplayName)(entry.category)}
        </span>
      </td>
      <td className="p-4">
        <span
          className={"font-medium ".concat(
            ["receipt", "opening_balance"].includes(entry.transaction_type)
              ? "text-green-600"
              : "text-red-600",
          )}
        >
          {["receipt", "opening_balance"].includes(entry.transaction_type) ? "+" : "-"}
          {(0, calculations_1.formatCurrency)(entry.amount)}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {(0, calculations_1.getPaymentMethodIcon)(entry.payment_method)}
          </span>
          <span className="text-sm">
            {(0, calculations_1.getPaymentMethodDisplayName)(entry.payment_method)}
          </span>
        </div>
      </td>
      <td className="p-4">
        <span className="text-sm">{registerName}</span>
      </td>
      <td className="p-4">
        <badge_1.Badge variant={entry.is_reconciled ? "default" : "secondary"}>
          {entry.is_reconciled ? "Conciliado" : "Pendente"}
        </badge_1.Badge>
      </td>
      <td className="p-4">
        <button_1.Button variant="ghost" size="sm">
          <lucide_react_1.MoreHorizontal className="h-4 w-4" />
        </button_1.Button>
      </td>
    </tr>
  );
}
