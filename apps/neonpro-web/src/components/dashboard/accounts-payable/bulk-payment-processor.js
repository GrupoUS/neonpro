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
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BulkPaymentProcessor;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var checkbox_1 = require("@/components/ui/checkbox");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var table_1 = require("@/components/ui/table");
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var paymentMethods = [
  { value: "bank_transfer", label: "Transferência Bancária", icon: lucide_react_1.CreditCard },
  { value: "pix", label: "PIX", icon: lucide_react_1.Receipt },
  { value: "check", label: "Cheque", icon: lucide_react_1.FileText },
  { value: "cash", label: "Dinheiro", icon: lucide_react_1.DollarSign },
];
var filterOptions = [
  { value: "all", label: "Todos" },
  { value: "overdue", label: "Em Atraso" },
  { value: "due_today", label: "Vencem Hoje" },
  { value: "due_week", label: "Vencem Esta Semana" },
  { value: "high_priority", label: "Alta Prioridade" },
  { value: "high_amount", label: "Alto Valor (>R$ 1.000)" },
];
function BulkPaymentProcessor(_a) {
  var _this = this;
  var open = _a.open,
    onOpenChange = _a.onOpenChange,
    onSuccess = _a.onSuccess;
  var _b = (0, react_1.useState)(false),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(false),
    processing = _c[0],
    setProcessing = _c[1];
  var _d = (0, react_1.useState)(0),
    processedCount = _d[0],
    setProcessedCount = _d[1];
  var _e = (0, react_1.useState)(""),
    searchTerm = _e[0],
    setSearchTerm = _e[1];
  var _f = (0, react_1.useState)("all"),
    filterType = _f[0],
    setFilterType = _f[1];
  var _g = (0, react_1.useState)("pix"),
    selectedPaymentMethod = _g[0],
    setSelectedPaymentMethod = _g[1];
  var _h = (0, react_1.useState)(0),
    maxPaymentAmount = _h[0],
    setMaxPaymentAmount = _h[1];
  // Mock data - In real implementation, this would come from API
  var _j = (0, react_1.useState)([
      {
        id: "1",
        invoice_number: "INV-2024-001",
        vendor_name: "Fornecedor Alpha Ltda",
        vendor_id: "v1",
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days overdue
        net_amount: 1500.0,
        paid_amount: 0,
        remaining_balance: 1500.0,
        priority: "high",
        category: "Equipamentos",
        status: "overdue",
        days_overdue: 2,
        selected: false,
        suggested_payment: 1500.0,
      },
      {
        id: "2",
        invoice_number: "INV-2024-002",
        vendor_name: "Beta Suprimentos",
        vendor_id: "v2",
        due_date: new Date().toISOString(), // Due today
        net_amount: 850.0,
        paid_amount: 200.0,
        remaining_balance: 650.0,
        priority: "medium",
        category: "Material de Consumo",
        status: "partial",
        selected: false,
        suggested_payment: 650.0,
      },
      {
        id: "3",
        invoice_number: "INV-2024-003",
        vendor_name: "Gamma Serviços",
        vendor_id: "v3",
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        net_amount: 2200.0,
        paid_amount: 0,
        remaining_balance: 2200.0,
        priority: "high",
        category: "Serviços",
        status: "pending",
        selected: false,
        suggested_payment: 2200.0,
      },
      {
        id: "4",
        invoice_number: "INV-2024-004",
        vendor_name: "Delta Tecnologia",
        vendor_id: "v4",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        net_amount: 450.0,
        paid_amount: 0,
        remaining_balance: 450.0,
        priority: "low",
        category: "Software",
        status: "pending",
        selected: false,
        suggested_payment: 450.0,
      },
    ]),
    payableItems = _j[0],
    setPayableItems = _j[1];
  // Filtered items based on search and filter
  var filteredItems = (0, react_1.useMemo)(
    function () {
      var items = payableItems;
      // Apply search filter
      if (searchTerm) {
        items = items.filter(function (item) {
          return (
            item.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      }
      // Apply type filter
      switch (filterType) {
        case "overdue":
          items = items.filter(function (item) {
            return item.status === "overdue";
          });
          break;
        case "due_today":
          var today_1 = new Date().toDateString();
          items = items.filter(function (item) {
            return new Date(item.due_date).toDateString() === today_1;
          });
          break;
        case "due_week":
          var weekFromNow_1 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          items = items.filter(function (item) {
            return new Date(item.due_date) <= weekFromNow_1;
          });
          break;
        case "high_priority":
          items = items.filter(function (item) {
            return item.priority === "high";
          });
          break;
        case "high_amount":
          items = items.filter(function (item) {
            return item.remaining_balance > 1000;
          });
          break;
      }
      return items;
    },
    [payableItems, searchTerm, filterType],
  );
  // Selected items calculations
  var selectedItems = filteredItems.filter(function (item) {
    return item.selected;
  });
  var totalSelectedAmount = selectedItems.reduce(function (sum, item) {
    return sum + item.suggested_payment;
  }, 0);
  var selectedCount = selectedItems.length;
  var formatCurrency = function (amount) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };
  var getPriorityColor = function (priority) {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var getStatusColor = function (status) {
    switch (status) {
      case "overdue":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var handleSelectAll = function (checked) {
    setPayableItems(function (items) {
      return items.map(function (item) {
        var isVisible = filteredItems.some(function (fi) {
          return fi.id === item.id;
        });
        return isVisible ? __assign(__assign({}, item), { selected: checked }) : item;
      });
    });
  };
  var handleSelectItem = function (itemId, checked) {
    setPayableItems(function (items) {
      return items.map(function (item) {
        return item.id === itemId ? __assign(__assign({}, item), { selected: checked }) : item;
      });
    });
  };
  var handleUpdateSuggestedPayment = function (itemId, amount) {
    setPayableItems(function (items) {
      return items.map(function (item) {
        return item.id === itemId
          ? __assign(__assign({}, item), {
              suggested_payment: Math.min(amount, item.remaining_balance),
            })
          : item;
      });
    });
  };
  var handleApplyMaxPayment = function () {
    if (maxPaymentAmount <= 0) return;
    var remainingBudget = maxPaymentAmount;
    var sortedItems = __spreadArray([], selectedItems, true).sort(function (a, b) {
      // Prioritize overdue items first, then by priority, then by amount
      if (a.status === "overdue" && b.status !== "overdue") return -1;
      if (b.status === "overdue" && a.status !== "overdue") return 1;
      var priorityOrder = { high: 3, medium: 2, low: 1 };
      var priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.remaining_balance - a.remaining_balance;
    });
    setPayableItems(function (items) {
      return items.map(function (item) {
        if (
          !selectedItems.some(function (si) {
            return si.id === item.id;
          })
        )
          return item;
        var suggestedAmount = Math.min(item.remaining_balance, remainingBudget);
        remainingBudget = Math.max(0, remainingBudget - suggestedAmount);
        return __assign(__assign({}, item), { suggested_payment: suggestedAmount });
      });
    });
  };
  var handleProcessPayments = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var i, item, paymentData, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (selectedItems.length === 0) {
              sonner_1.toast.error("Selecione pelo menos um item para processar");
              return [2 /*return*/];
            }
            setProcessing(true);
            setProcessedCount(0);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            i = 0;
            _a.label = 2;
          case 2:
            if (!(i < selectedItems.length)) return [3 /*break*/, 5];
            item = selectedItems[i];
            paymentData = {
              accounts_payable_id: item.id,
              payment_date: new Date().toISOString(),
              amount_paid: item.suggested_payment,
              payment_method: selectedPaymentMethod,
              reference_number: "BULK".concat(Date.now(), "-").concat(i + 1),
              notes: "Pagamento em lote - ".concat(selectedItems.length, " itens"),
              status: "completed",
            };
            console.log("Processing payment:", paymentData);
            // Simulate processing time
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 1500);
              }),
            ];
          case 3:
            // Simulate processing time
            _a.sent();
            setProcessedCount(i + 1);
            _a.label = 4;
          case 4:
            i++;
            return [3 /*break*/, 2];
          case 5:
            sonner_1.toast.success(
              "".concat(selectedItems.length, " pagamentos processados com sucesso"),
            );
            onSuccess();
            onOpenChange(false);
            // Reset selections
            setPayableItems(function (items) {
              return items.map(function (item) {
                return __assign(__assign({}, item), { selected: false });
              });
            });
            return [3 /*break*/, 8];
          case 6:
            error_1 = _a.sent();
            console.error("Error processing bulk payments:", error_1);
            sonner_1.toast.error("Erro ao processar pagamentos em lote");
            return [3 /*break*/, 8];
          case 7:
            setProcessing(false);
            setProcessedCount(0);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleExportSelected = function () {
    var csvContent = __spreadArray(
      [
        "Invoice,Fornecedor,Vencimento,Valor Original,Saldo Devedor,Pagamento Sugerido,Prioridade,Status",
      ],
      selectedItems.map(function (item) {
        return [
          item.invoice_number,
          item.vendor_name,
          (0, date_fns_1.format)(new Date(item.due_date), "dd/MM/yyyy"),
          item.net_amount.toFixed(2),
          item.remaining_balance.toFixed(2),
          item.suggested_payment.toFixed(2),
          item.priority,
          item.status,
        ].join(",");
      }),
      true,
    ).join("\n");
    var blob = new Blob([csvContent], { type: "text/csv" });
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "pagamentos-lote-".concat(
      (0, date_fns_1.format)(new Date(), "yyyy-MM-dd"),
      ".csv",
    );
    a.click();
    window.URL.revokeObjectURL(url);
  };
  return (
    <dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.Calculator className="h-5 w-5" />
            Processamento de Pagamentos em Lote
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Selecione e processe múltiplas contas a pagar simultaneamente
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <card_1.Card>
              <card_1.CardContent className="flex items-center p-4">
                <lucide_react_1.FileText className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{filteredItems.length}</p>
                  <p className="text-xs text-muted-foreground">Itens Disponíveis</p>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="flex items-center p-4">
                <lucide_react_1.CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{selectedCount}</p>
                  <p className="text-xs text-muted-foreground">Selecionados</p>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="flex items-center p-4">
                <lucide_react_1.DollarSign className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalSelectedAmount)}</p>
                  <p className="text-xs text-muted-foreground">Valor Total</p>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="flex items-center p-4">
                <lucide_react_1.AlertCircle className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {
                      filteredItems.filter(function (i) {
                        return i.status === "overdue";
                      }).length
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Em Atraso</p>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Filters and Search */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-sm">Filtros e Configurações</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label_1.Label>Pesquisar</label_1.Label>
                  <div className="relative">
                    <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input_1.Input
                      placeholder="Invoice, fornecedor, categoria..."
                      value={searchTerm}
                      onChange={function (e) {
                        return setSearchTerm(e.target.value);
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label_1.Label>Filtrar por</label_1.Label>
                  <select_1.Select value={filterType} onValueChange={setFilterType}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {filterOptions.map(function (option) {
                        return (
                          <select_1.SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </select_1.SelectItem>
                        );
                      })}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label>Método de Pagamento</label_1.Label>
                  <select_1.Select
                    value={selectedPaymentMethod}
                    onValueChange={setSelectedPaymentMethod}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {paymentMethods.map(function (method) {
                        return (
                          <select_1.SelectItem key={method.value} value={method.value}>
                            <div className="flex items-center gap-2">
                              <method.icon className="h-4 w-4" />
                              {method.label}
                            </div>
                          </select_1.SelectItem>
                        );
                      })}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>

              <separator_1.Separator />

              {/* Budget Management */}
              <div className="space-y-2">
                <label_1.Label>Orçamento Máximo (opcional)</label_1.Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input_1.Input
                      type="number"
                      step="0.01"
                      value={maxPaymentAmount || ""}
                      onChange={function (e) {
                        return setMaxPaymentAmount(parseFloat(e.target.value) || 0);
                      }}
                      placeholder="Valor máximo para distribuir"
                    />
                  </div>
                  <button_1.Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyMaxPayment}
                    disabled={maxPaymentAmount <= 0 || selectedCount === 0}
                  >
                    <lucide_react_1.Calculator className="h-4 w-4 mr-2" />
                    Aplicar
                  </button_1.Button>
                </div>
                {maxPaymentAmount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    O valor será distribuído priorizando contas em atraso e de alta prioridade
                  </p>
                )}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Items Table */}
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <checkbox_1.Checkbox
                    id="select-all"
                    checked={selectedCount === filteredItems.length && filteredItems.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <label_1.Label htmlFor="select-all" className="text-sm">
                    Selecionar todos ({filteredItems.length})
                  </label_1.Label>
                </div>
              </div>

              <div className="flex gap-2">
                <button_1.Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportSelected}
                  disabled={selectedCount === 0}
                >
                  <lucide_react_1.Download className="h-4 w-4 mr-2" />
                  Exportar
                </button_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="rounded-md border">
                <table_1.Table>
                  <table_1.TableHeader>
                    <table_1.TableRow>
                      <table_1.TableHead className="w-12"></table_1.TableHead>
                      <table_1.TableHead>Invoice</table_1.TableHead>
                      <table_1.TableHead>Fornecedor</table_1.TableHead>
                      <table_1.TableHead>Vencimento</table_1.TableHead>
                      <table_1.TableHead>Valor Original</table_1.TableHead>
                      <table_1.TableHead>Saldo Devedor</table_1.TableHead>
                      <table_1.TableHead>Pagamento Sugerido</table_1.TableHead>
                      <table_1.TableHead>Prioridade</table_1.TableHead>
                      <table_1.TableHead>Status</table_1.TableHead>
                    </table_1.TableRow>
                  </table_1.TableHeader>
                  <table_1.TableBody>
                    {filteredItems.length === 0
                      ? <table_1.TableRow>
                          <table_1.TableCell colSpan={9} className="h-24 text-center">
                            Nenhum item encontrado.
                          </table_1.TableCell>
                        </table_1.TableRow>
                      : filteredItems.map(function (item) {
                          return (
                            <table_1.TableRow
                              key={item.id}
                              className={(0, utils_1.cn)(item.selected && "bg-muted/50")}
                            >
                              <table_1.TableCell>
                                <checkbox_1.Checkbox
                                  checked={item.selected}
                                  onCheckedChange={function (checked) {
                                    return handleSelectItem(item.id, checked);
                                  }}
                                />
                              </table_1.TableCell>
                              <table_1.TableCell className="font-medium">
                                {item.invoice_number}
                                {item.days_overdue && item.days_overdue > 0 && (
                                  <div className="text-xs text-red-600">
                                    {item.days_overdue} dias em atraso
                                  </div>
                                )}
                              </table_1.TableCell>
                              <table_1.TableCell>{item.vendor_name}</table_1.TableCell>
                              <table_1.TableCell>
                                {(0, date_fns_1.format)(new Date(item.due_date), "dd/MM/yyyy", {
                                  locale: locale_1.ptBR,
                                })}
                              </table_1.TableCell>
                              <table_1.TableCell>
                                {formatCurrency(item.net_amount)}
                              </table_1.TableCell>
                              <table_1.TableCell className="font-semibold">
                                {formatCurrency(item.remaining_balance)}
                              </table_1.TableCell>
                              <table_1.TableCell>
                                <input_1.Input
                                  type="number"
                                  step="0.01"
                                  value={item.suggested_payment || ""}
                                  onChange={function (e) {
                                    return handleUpdateSuggestedPayment(
                                      item.id,
                                      parseFloat(e.target.value) || 0,
                                    );
                                  }}
                                  className="w-24"
                                  max={item.remaining_balance}
                                  disabled={!item.selected}
                                />
                              </table_1.TableCell>
                              <table_1.TableCell>
                                <badge_1.Badge
                                  className={(0, utils_1.cn)(
                                    "text-xs",
                                    getPriorityColor(item.priority),
                                  )}
                                >
                                  {item.priority.toUpperCase()}
                                </badge_1.Badge>
                              </table_1.TableCell>
                              <table_1.TableCell>
                                <badge_1.Badge
                                  className={(0, utils_1.cn)(
                                    "text-xs",
                                    getStatusColor(item.status),
                                  )}
                                >
                                  {item.status === "overdue"
                                    ? "Em Atraso"
                                    : item.status === "partial"
                                      ? "Parcial"
                                      : "Pendente"}
                                </badge_1.Badge>
                              </table_1.TableCell>
                            </table_1.TableRow>
                          );
                        })}
                  </table_1.TableBody>
                </table_1.Table>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Processing Progress */}
          {processing && (
            <card_1.Card>
              <card_1.CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Processando pagamentos...</span>
                    <span className="text-sm text-muted-foreground">
                      {processedCount}/{selectedCount}
                    </span>
                  </div>
                  <progress_1.Progress
                    value={(processedCount / selectedCount) * 100}
                    className="w-full"
                  />
                </div>
              </card_1.CardContent>
            </card_1.Card>
          )}
        </div>

        <dialog_1.DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedCount > 0 && (
                <>
                  {selectedCount} itens selecionados • Total: {formatCurrency(totalSelectedAmount)}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button_1.Button
                type="button"
                variant="outline"
                onClick={function () {
                  return onOpenChange(false);
                }}
                disabled={processing}
              >
                Cancelar
              </button_1.Button>
              <button_1.Button
                onClick={handleProcessPayments}
                disabled={selectedCount === 0 || processing}
              >
                {processing
                  ? <>
                      <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando... {processedCount}/{selectedCount}
                    </>
                  : <>
                      <lucide_react_1.CreditCard className="mr-2 h-4 w-4" />
                      Processar {selectedCount} Pagamentos
                    </>}
              </button_1.Button>
            </div>
          </div>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
