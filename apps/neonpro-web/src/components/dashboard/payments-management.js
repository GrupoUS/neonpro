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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsManagement = PaymentsManagement;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var separator_1 = require("@/components/ui/separator");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var use_billing_1 = require("@/hooks/use-billing");
var billing_1 = require("@/types/billing");
function PaymentsManagement() {
  var _this = this;
  var _a, _b;
  var _c = (0, use_billing_1.useBilling)(),
    loading = _c.loading,
    payments = _c.payments,
    invoices = _c.invoices,
    fetchPayments = _c.fetchPayments,
    fetchInvoices = _c.fetchInvoices,
    createPayment = _c.createPayment,
    updatePayment = _c.updatePayment;
  var _d = (0, react_1.useState)(""),
    searchTerm = _d[0],
    setSearchTerm = _d[1];
  var _e = (0, react_1.useState)({}),
    filters = _e[0],
    setFilters = _e[1];
  var _f = (0, react_1.useState)(null),
    selectedPayment = _f[0],
    setSelectedPayment = _f[1];
  var _g = (0, react_1.useState)(false),
    isCreateDialogOpen = _g[0],
    setIsCreateDialogOpen = _g[1];
  var _h = (0, react_1.useState)(false),
    isViewDialogOpen = _h[0],
    setIsViewDialogOpen = _h[1];
  var _j = (0, react_1.useState)({
      invoice_id: "",
      amount: "",
      payment_method: "cash",
      payment_date: new Date().toISOString().split("T")[0],
      reference_number: "",
      notes: "",
    }),
    formData = _j[0],
    setFormData = _j[1];
  // Load payments and invoices on component mount
  (0, react_1.useEffect)(
    function () {
      fetchPayments(filters);
      if (invoices.length === 0) {
        fetchInvoices({});
      }
    },
    [fetchPayments, fetchInvoices, filters, invoices.length],
  );
  // Filter payments based on search term
  var filteredPayments = payments.filter(function (payment) {
    var _a, _b, _c;
    return (
      ((_a = payment.reference_number) === null || _a === void 0
        ? void 0
        : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((_b = payment.invoice_id) === null || _b === void 0
        ? void 0
        : _b.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((_c = payment.notes) === null || _c === void 0
        ? void 0
        : _c.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  var resetForm = function () {
    setFormData({
      invoice_id: "",
      amount: "",
      payment_method: "cash",
      payment_date: new Date().toISOString().split("T")[0],
      reference_number: "",
      notes: "",
    });
  };
  var openCreateDialog = function () {
    resetForm();
    setIsCreateDialogOpen(true);
  };
  var openViewDialog = function (payment) {
    setSelectedPayment(payment);
    setIsViewDialogOpen(true);
  };
  var handleSubmit = function (e) {
    return __awaiter(_this, void 0, void 0, function () {
      var paymentData, success;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            e.preventDefault();
            if (!formData.invoice_id || !formData.amount) {
              sonner_1.toast.error("Fatura e valor são obrigatórios");
              return [2 /*return*/];
            }
            if (parseFloat(formData.amount) <= 0) {
              sonner_1.toast.error("Valor deve ser maior que zero");
              return [2 /*return*/];
            }
            paymentData = {
              invoice_id: formData.invoice_id,
              amount: parseFloat(formData.amount),
              payment_method: formData.payment_method,
              payment_date: formData.payment_date,
              reference_number: formData.reference_number || undefined,
              notes: formData.notes || undefined,
            };
            return [4 /*yield*/, createPayment(paymentData)];
          case 1:
            success = _a.sent() !== null;
            if (success) {
              setIsCreateDialogOpen(false);
              resetForm();
            }
            return [2 /*return*/];
        }
      });
    });
  };
  var handleStatusUpdate = function (payment, status) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, updatePayment(payment.id, { status: status })];
          case 1:
            _a.sent();
            sonner_1.toast.success("Status do pagamento atualizado");
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Erro ao atualizar status:", error_1);
            sonner_1.toast.error("Erro ao atualizar status do pagamento");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var getStatusColor = function (status) {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var getStatusLabel = function (status) {
    var statusOption = billing_1.PAYMENT_STATUSES.find(function (s) {
      return s.value === status;
    });
    return (
      (statusOption === null || statusOption === void 0 ? void 0 : statusOption.label) || status
    );
  };
  var getMethodLabel = function (method) {
    var methodOption = billing_1.PAYMENT_METHODS.find(function (m) {
      return m.value === method;
    });
    return (
      (methodOption === null || methodOption === void 0 ? void 0 : methodOption.label) || method
    );
  };
  var formatCurrency = function (amount) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };
  var formatDate = function (dateString) {
    try {
      return (0, date_fns_1.format)(new Date(dateString), "dd/MM/yyyy", { locale: locale_1.ptBR });
    } catch (_a) {
      return "Data inválida";
    }
  };
  // Get outstanding invoices for payment creation
  var outstandingInvoices = invoices.filter(function (invoice) {
    return ["sent", "viewed", "overdue", "partially_paid"].includes(invoice.status);
  });
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Pagamentos</h2>
          <p className="text-muted-foreground">Registre e controle todos os pagamentos recebidos</p>
        </div>

        <button_1.Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <lucide_react_1.Plus className="h-4 w-4 mr-2" />
          Registrar Pagamento
        </button_1.Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Recebido</card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                payments
                  .filter(function (p) {
                    return p.status === "completed";
                  })
                  .reduce(function (sum, p) {
                    return sum + p.amount;
                  }, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {
                payments.filter(function (p) {
                  return p.status === "completed";
                }).length
              }{" "}
              pagamentos
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Processando</card_1.CardTitle>
            <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                payments
                  .filter(function (p) {
                    return p.status === "processing";
                  })
                  .reduce(function (sum, p) {
                    return sum + p.amount;
                  }, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {
                payments.filter(function (p) {
                  return p.status === "processing";
                }).length
              }{" "}
              pagamentos
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Falharam</card_1.CardTitle>
            <lucide_react_1.CreditCard className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {
                payments.filter(function (p) {
                  return p.status === "failed";
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(
                payments
                  .filter(function (p) {
                    return p.status === "failed";
                  })
                  .reduce(function (sum, p) {
                    return sum + p.amount;
                  }, 0),
              )}
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Taxa de Sucesso</card_1.CardTitle>
            <lucide_react_1.CheckCircle className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {payments.length > 0
                ? Math.round(
                    (payments.filter(function (p) {
                      return p.status === "completed";
                    }).length /
                      payments.length) *
                      100,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">nos últimos 30 dias</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Search and Filters */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg">Filtros</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input_1.Input
                  placeholder="Buscar pagamentos..."
                  value={searchTerm}
                  onChange={function (e) {
                    return setSearchTerm(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select_1.Select
                value={((_a = filters.status) === null || _a === void 0 ? void 0 : _a[0]) || "all"}
                onValueChange={function (value) {
                  return setFilters(function (prev) {
                    return __assign(__assign({}, prev), {
                      status: value === "all" ? undefined : [value],
                    });
                  });
                }}
              >
                <select_1.SelectTrigger className="w-[150px]">
                  <select_1.SelectValue placeholder="Status" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos os status</select_1.SelectItem>
                  {billing_1.PAYMENT_STATUSES.map(function (status) {
                    return (
                      <select_1.SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </select_1.SelectItem>
                    );
                  })}
                </select_1.SelectContent>
              </select_1.Select>

              <select_1.Select
                value={
                  ((_b = filters.payment_method) === null || _b === void 0 ? void 0 : _b[0]) ||
                  "all"
                }
                onValueChange={function (value) {
                  return setFilters(function (prev) {
                    return __assign(__assign({}, prev), {
                      payment_method: value === "all" ? undefined : [value],
                    });
                  });
                }}
              >
                <select_1.SelectTrigger className="w-[150px]">
                  <select_1.SelectValue placeholder="Método" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos os métodos</select_1.SelectItem>
                  {billing_1.PAYMENT_METHODS.map(function (method) {
                    return (
                      <select_1.SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </select_1.SelectItem>
                    );
                  })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Payments Table */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Pagamentos</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          {loading
            ? <div className="space-y-3">
                {Array.from({ length: 5 }).map(function (_, i) {
                  return <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>;
                })}
              </div>
            : filteredPayments.length === 0
              ? <div className="text-center py-12">
                  <lucide_react_1.CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum pagamento encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? "Tente ajustar os filtros de busca"
                      : "Comece registrando seu primeiro pagamento"}
                  </p>
                  {!searchTerm && (
                    <button_1.Button onClick={openCreateDialog}>
                      <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                      Registrar Primeiro Pagamento
                    </button_1.Button>
                  )}
                </div>
              : <table_1.Table>
                  <table_1.TableHeader>
                    <table_1.TableRow>
                      <table_1.TableHead>Referência</table_1.TableHead>
                      <table_1.TableHead>Fatura</table_1.TableHead>
                      <table_1.TableHead>Valor</table_1.TableHead>
                      <table_1.TableHead>Método</table_1.TableHead>
                      <table_1.TableHead>Data</table_1.TableHead>
                      <table_1.TableHead>Status</table_1.TableHead>
                      <table_1.TableHead>Ações</table_1.TableHead>
                    </table_1.TableRow>
                  </table_1.TableHeader>
                  <table_1.TableBody>
                    {filteredPayments.map(function (payment) {
                      return (
                        <table_1.TableRow key={payment.id}>
                          <table_1.TableCell className="font-medium">
                            {payment.reference_number || "N/A"}
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <div className="flex items-center gap-2">
                              <lucide_react_1.CreditCard className="h-4 w-4" />
                              <span>{payment.invoice_id}</span>
                            </div>
                          </table_1.TableCell>
                          <table_1.TableCell className="font-medium">
                            {formatCurrency(payment.amount)}
                          </table_1.TableCell>
                          <table_1.TableCell>
                            {getMethodLabel(payment.payment_method)}
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <div className="flex items-center gap-2">
                              <lucide_react_1.Calendar className="h-4 w-4" />
                              {formatDate(payment.payment_date)}
                            </div>
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <badge_1.Badge className={getStatusColor(payment.status)}>
                              {getStatusLabel(payment.status)}
                            </badge_1.Badge>
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <div className="flex gap-1">
                              <button_1.Button
                                variant="ghost"
                                size="sm"
                                onClick={function () {
                                  return openViewDialog(payment);
                                }}
                              >
                                <lucide_react_1.Eye className="h-4 w-4" />
                              </button_1.Button>

                              <button_1.Button
                                variant="ghost"
                                size="sm"
                                onClick={function () {
                                  // Simulate download receipt
                                  sonner_1.toast.success("Comprovante baixado");
                                }}
                              >
                                <lucide_react_1.Download className="h-4 w-4" />
                              </button_1.Button>

                              <select_1.Select
                                value={payment.status}
                                onValueChange={function (value) {
                                  return handleStatusUpdate(payment, value);
                                }}
                              >
                                <select_1.SelectTrigger className="w-auto h-8">
                                  <select_1.SelectValue />
                                </select_1.SelectTrigger>
                                <select_1.SelectContent>
                                  {billing_1.PAYMENT_STATUSES.map(function (status) {
                                    return (
                                      <select_1.SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                      </select_1.SelectItem>
                                    );
                                  })}
                                </select_1.SelectContent>
                              </select_1.Select>
                            </div>
                          </table_1.TableCell>
                        </table_1.TableRow>
                      );
                    })}
                  </table_1.TableBody>
                </table_1.Table>}
        </card_1.CardContent>
      </card_1.Card>

      {/* Create Payment Dialog */}
      <dialog_1.Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <dialog_1.DialogContent className="max-w-2xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Registrar Pagamento</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Registre um novo pagamento recebido de uma fatura
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="invoice_id">Fatura *</label_1.Label>
                <select_1.Select
                  value={formData.invoice_id}
                  onValueChange={function (value) {
                    var invoice = invoices.find(function (inv) {
                      return inv.id === value;
                    });
                    setFormData(function (prev) {
                      return __assign(__assign({}, prev), {
                        invoice_id: value,
                        amount: invoice ? invoice.total_amount.toString() : "",
                      });
                    });
                  }}
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecionar fatura" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {outstandingInvoices.map(function (invoice) {
                      return (
                        <select_1.SelectItem key={invoice.id} value={invoice.id}>
                          #{invoice.invoice_number} - {formatCurrency(invoice.total_amount)}
                        </select_1.SelectItem>
                      );
                    })}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="amount">Valor (R$) *</label_1.Label>
                <input_1.Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={function (e) {
                    return setFormData(function (prev) {
                      return __assign(__assign({}, prev), { amount: e.target.value });
                    });
                  }}
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="payment_method">Método de Pagamento *</label_1.Label>
                <select_1.Select
                  value={formData.payment_method}
                  onValueChange={function (value) {
                    return setFormData(function (prev) {
                      return __assign(__assign({}, prev), { payment_method: value });
                    });
                  }}
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {billing_1.PAYMENT_METHODS.map(function (method) {
                      return (
                        <select_1.SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </select_1.SelectItem>
                      );
                    })}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="payment_date">Data do Pagamento *</label_1.Label>
                <input_1.Input
                  id="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={function (e) {
                    return setFormData(function (prev) {
                      return __assign(__assign({}, prev), { payment_date: e.target.value });
                    });
                  }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="reference_number">Número de Referência</label_1.Label>
              <input_1.Input
                id="reference_number"
                value={formData.reference_number}
                onChange={function (e) {
                  return setFormData(function (prev) {
                    return __assign(__assign({}, prev), { reference_number: e.target.value });
                  });
                }}
                placeholder="ID da transação, número do cheque, etc."
              />
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="notes">Observações</label_1.Label>
              <textarea_1.Textarea
                id="notes"
                value={formData.notes}
                onChange={function (e) {
                  return setFormData(function (prev) {
                    return __assign(__assign({}, prev), { notes: e.target.value });
                  });
                }}
                placeholder="Observações sobre o pagamento..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button_1.Button
                type="button"
                variant="outline"
                onClick={function () {
                  return setIsCreateDialogOpen(false);
                }}
              >
                Cancelar
              </button_1.Button>
              <button_1.Button type="submit" disabled={loading}>
                Registrar Pagamento
              </button_1.Button>
            </div>
          </form>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* View Payment Dialog */}
      <dialog_1.Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <dialog_1.DialogContent className="max-w-2xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>
              Pagamento #
              {(selectedPayment === null || selectedPayment === void 0
                ? void 0
                : selectedPayment.reference_number) ||
                (selectedPayment === null || selectedPayment === void 0
                  ? void 0
                  : selectedPayment.id)}
            </dialog_1.DialogTitle>
            <dialog_1.DialogDescription>Detalhes completos do pagamento</dialog_1.DialogDescription>
          </dialog_1.DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label_1.Label className="text-sm text-muted-foreground">Status</label_1.Label>
                  <badge_1.Badge className={"mt-1 ".concat(getStatusColor(selectedPayment.status))}>
                    {getStatusLabel(selectedPayment.status)}
                  </badge_1.Badge>
                </div>
                <div>
                  <label_1.Label className="text-sm text-muted-foreground">Valor</label_1.Label>
                  <div className="text-lg font-bold">{formatCurrency(selectedPayment.amount)}</div>
                </div>
                <div>
                  <label_1.Label className="text-sm text-muted-foreground">Método</label_1.Label>
                  <div>{getMethodLabel(selectedPayment.payment_method)}</div>
                </div>
                <div>
                  <label_1.Label className="text-sm text-muted-foreground">
                    Data do Pagamento
                  </label_1.Label>
                  <div>{formatDate(selectedPayment.payment_date)}</div>
                </div>
                <div>
                  <label_1.Label className="text-sm text-muted-foreground">Fatura</label_1.Label>
                  <div className="font-medium">{selectedPayment.invoice_id}</div>
                </div>
                <div>
                  <label_1.Label className="text-sm text-muted-foreground">
                    Referência
                  </label_1.Label>
                  <div>{selectedPayment.reference_number || "N/A"}</div>
                </div>
              </div>

              {selectedPayment.notes && (
                <>
                  <separator_1.Separator />
                  <div>
                    <label_1.Label className="text-base font-medium mb-2 block">
                      Observações
                    </label_1.Label>
                    <p className="text-sm text-muted-foreground">{selectedPayment.notes}</p>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <button_1.Button
                  variant="outline"
                  onClick={function () {
                    // Simulate download receipt
                    sonner_1.toast.success("Comprovante baixado");
                  }}
                >
                  <lucide_react_1.Download className="h-4 w-4 mr-2" />
                  Baixar Comprovante
                </button_1.Button>
              </div>
            </div>
          )}
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>
  );
}
