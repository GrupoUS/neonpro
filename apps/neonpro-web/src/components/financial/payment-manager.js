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
exports.PaymentManager = PaymentManager;
/**
 * Payment Manager Component
 * Created: January 27, 2025
 * Purpose: Comprehensive payment management UI for Epic 4
 * Features: Create, edit, view, manage payments with installments
 */
var navigation_1 = require("next/navigation");
var react_1 = require("react");
var sonner_1 = require("sonner");
// UI Components
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var tabs_1 = require("@/components/ui/tabs");
// Icons
var lucide_react_1 = require("lucide-react");
// Services
var financial_1 = require("@/lib/supabase/financial");
function PaymentManager(_a) {
  var _this = this;
  var invoiceId = _a.invoiceId,
    _b = _a.defaultView,
    defaultView = _b === void 0 ? "list" : _b,
    selectedPaymentId = _a.selectedPaymentId;
  var router = (0, navigation_1.useRouter)();
  // State Management
  var _c = (0, react_1.useState)(defaultView),
    activeTab = _c[0],
    setActiveTab = _c[1];
  var _d = (0, react_1.useState)([]),
    payments = _d[0],
    setPayments = _d[1];
  var _e = (0, react_1.useState)(null),
    selectedPayment = _e[0],
    setSelectedPayment = _e[1];
  var _f = (0, react_1.useState)(false),
    loading = _f[0],
    setLoading = _f[1];
  var _g = (0, react_1.useState)(""),
    searchTerm = _g[0],
    setSearchTerm = _g[1];
  // Form State for Create/Edit
  var _h = (0, react_1.useState)({
      invoice_id: invoiceId || "",
      payment_method: "credit_card",
      amount: 0,
      external_transaction_id: "",
      authorization_code: "",
    }),
    formData = _h[0],
    setFormData = _h[1];
  // Load Data
  (0, react_1.useEffect)(
    function () {
      if (invoiceId) {
        loadPayments();
      }
    },
    [invoiceId],
  );
  (0, react_1.useEffect)(
    function () {
      if (selectedPaymentId && activeTab === "edit") {
        loadPaymentDetails(selectedPaymentId);
      }
    },
    [selectedPaymentId, activeTab],
  );
  var loadPayments = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var result, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!invoiceId) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            setLoading(true);
            return [4 /*yield*/, (0, financial_1.listPaymentsByInvoice)(invoiceId)];
          case 2:
            result = _a.sent();
            setPayments(result);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Failed to load payments:", error_1);
            sonner_1.toast.error("Erro ao carregar pagamentos");
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var loadPaymentDetails = function (paymentId) {
    return __awaiter(_this, void 0, void 0, function () {
      var result, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            return [4 /*yield*/, (0, financial_1.getPaymentById)(paymentId)];
          case 1:
            result = _a.sent();
            setSelectedPayment(result);
            setFormData({
              invoice_id: result.invoice_id,
              payment_method: result.payment_method,
              amount: result.amount / 100, // Convert from centavos
              external_transaction_id: result.external_transaction_id || "",
              authorization_code: result.authorization_code || "",
              status: result.status,
            });
            return [3 /*break*/, 4];
          case 2:
            error_2 = _a.sent();
            console.error("Failed to load payment details:", error_2);
            sonner_1.toast.error("Erro ao carregar detalhes do pagamento");
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Handlers
  var handleCreatePayment = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var paymentData, result, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            paymentData = __assign(__assign({}, formData), {
              invoice_id: invoiceId || formData.invoice_id || "",
            });
            return [4 /*yield*/, (0, financial_1.createPayment)(paymentData)];
          case 1:
            result = _a.sent();
            sonner_1.toast.success("Pagamento criado com sucesso!");
            setActiveTab("list");
            setFormData({
              invoice_id: invoiceId || "",
              payment_method: "credit_card",
              amount: 0,
              external_transaction_id: "",
              authorization_code: "",
            });
            loadPayments();
            return [3 /*break*/, 4];
          case 2:
            error_3 = _a.sent();
            console.error("Failed to create payment:", error_3);
            sonner_1.toast.error("Erro ao criar pagamento");
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleUpdatePayment = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var updateData, result, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!selectedPayment) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            setLoading(true);
            updateData = {
              status: formData.status,
              external_transaction_id: formData.external_transaction_id,
              authorization_code: formData.authorization_code,
            };
            return [4 /*yield*/, (0, financial_1.updatePayment)(selectedPayment.id, updateData)];
          case 2:
            result = _a.sent();
            sonner_1.toast.success("Pagamento atualizado com sucesso!");
            setActiveTab("list");
            loadPayments();
            return [3 /*break*/, 5];
          case 3:
            error_4 = _a.sent();
            console.error("Failed to update payment:", error_4);
            sonner_1.toast.error("Erro ao atualizar pagamento");
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleUpdateStatus = function (paymentId, status) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, (0, financial_1.updatePayment)(paymentId, { status: status })];
          case 1:
            _a.sent();
            sonner_1.toast.success("Status atualizado com sucesso!");
            loadPayments();
            return [3 /*break*/, 3];
          case 2:
            error_5 = _a.sent();
            console.error("Failed to update status:", error_5);
            sonner_1.toast.error("Erro ao atualizar status");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Filter payments by search term
  var filteredPayments = payments.filter(function (payment) {
    var _a, _b;
    return (
      ((_a = payment.external_transaction_id) === null || _a === void 0
        ? void 0
        : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((_b = payment.authorization_code) === null || _b === void 0
        ? void 0
        : _b.toLowerCase().includes(searchTerm.toLowerCase())) ||
      payment.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  // Status badge color mapping
  var getStatusColor = function (status) {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      case "refunded":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };
  var getStatusText = function (status) {
    switch (status) {
      case "completed":
        return "Concluído";
      case "processing":
        return "Processando";
      case "pending":
        return "Pendente";
      case "failed":
        return "Falhou";
      case "cancelled":
        return "Cancelado";
      case "refunded":
        return "Reembolsado";
      default:
        return "Desconhecido";
    }
  };
  var getStatusIcon = function (status) {
    switch (status) {
      case "completed":
        return <lucide_react_1.CheckCircle className="h-4 w-4" />;
      case "processing":
        return <lucide_react_1.Clock className="h-4 w-4" />;
      case "pending":
        return <lucide_react_1.AlertCircle className="h-4 w-4" />;
      case "failed":
        return <lucide_react_1.XCircle className="h-4 w-4" />;
      case "cancelled":
        return <lucide_react_1.XCircle className="h-4 w-4" />;
      case "refunded":
        return <lucide_react_1.RefreshCw className="h-4 w-4" />;
      default:
        return <lucide_react_1.AlertCircle className="h-4 w-4" />;
    }
  };
  var getMethodText = function (method) {
    switch (method) {
      case "credit_card":
        return "Cartão de Crédito";
      case "debit_card":
        return "Cartão de Débito";
      case "bank_transfer":
        return "Transferência Bancária";
      case "pix":
        return "PIX";
      case "cash":
        return "Dinheiro";
      case "financing":
        return "Financiamento";
      case "installment":
        return "Parcelado";
      default:
        return method;
    }
  };
  return (
    <div className="space-y-6">
      {/* Main Interface */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Gestão de Pagamentos</card_1.CardTitle>
          <card_1.CardDescription>
            Gerencie pagamentos e atualize status de transações
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <tabs_1.Tabs
            value={activeTab}
            onValueChange={function (value) {
              return setActiveTab(value);
            }}
          >
            <tabs_1.TabsList className="grid w-full grid-cols-3">
              <tabs_1.TabsTrigger value="list">Lista de Pagamentos</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="create">Criar Pagamento</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="edit" disabled={!selectedPayment}>
                Editar Pagamento
              </tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            {/* Payment List Tab */}
            <tabs_1.TabsContent value="list" className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input_1.Input
                    placeholder="Buscar pagamentos..."
                    value={searchTerm}
                    onChange={function (e) {
                      return setSearchTerm(e.target.value);
                    }}
                    className="pl-8"
                  />
                </div>
                <button_1.Button
                  onClick={function () {
                    return setActiveTab("create");
                  }}
                >
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Novo Pagamento
                </button_1.Button>
              </div>

              <div className="space-y-2">
                {loading
                  ? <div className="text-center py-8">Carregando...</div>
                  : filteredPayments.length === 0
                    ? <div className="text-center py-8 text-muted-foreground">
                        Nenhum pagamento encontrado
                      </div>
                    : filteredPayments.map(function (payment) {
                        return (
                          <card_1.Card key={payment.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(payment.status)}
                                  <badge_1.Badge className={getStatusColor(payment.status)}>
                                    {getStatusText(payment.status)}
                                  </badge_1.Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {getMethodText(payment.payment_method)}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Valor: R$ {(payment.amount / 100).toFixed(2)}
                                </div>
                                {payment.external_transaction_id && (
                                  <div className="text-sm text-muted-foreground">
                                    ID: {payment.external_transaction_id}
                                  </div>
                                )}
                                {payment.processed_at && (
                                  <div className="text-sm text-muted-foreground">
                                    Processado:{" "}
                                    {new Date(payment.processed_at).toLocaleDateString("pt-BR")}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center space-x-2">
                                {payment.status === "pending" && (
                                  <>
                                    <button_1.Button
                                      variant="outline"
                                      size="sm"
                                      onClick={function () {
                                        return handleUpdateStatus(payment.id, "completed");
                                      }}
                                    >
                                      <lucide_react_1.CheckCircle className="h-4 w-4 mr-1" />
                                      Confirmar
                                    </button_1.Button>
                                    <button_1.Button
                                      variant="outline"
                                      size="sm"
                                      onClick={function () {
                                        return handleUpdateStatus(payment.id, "failed");
                                      }}
                                    >
                                      <lucide_react_1.XCircle className="h-4 w-4 mr-1" />
                                      Falhar
                                    </button_1.Button>
                                  </>
                                )}

                                <button_1.Button
                                  variant="outline"
                                  size="sm"
                                  onClick={function () {
                                    setSelectedPayment(payment);
                                    setActiveTab("edit");
                                  }}
                                >
                                  <lucide_react_1.Edit className="h-4 w-4" />
                                </button_1.Button>
                              </div>
                            </div>
                          </card_1.Card>
                        );
                      })}
              </div>
            </tabs_1.TabsContent>

            {/* Create Payment Tab */}
            <tabs_1.TabsContent value="create" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label_1.Label htmlFor="invoice_id">ID da Fatura</label_1.Label>
                  <input_1.Input
                    id="invoice_id"
                    placeholder="ID da fatura"
                    value={formData.invoice_id || ""}
                    onChange={function (e) {
                      return setFormData(
                        __assign(__assign({}, formData), { invoice_id: e.target.value }),
                      );
                    }}
                    disabled={!!invoiceId}
                  />
                </div>

                <div className="grid gap-2">
                  <label_1.Label htmlFor="payment_method">Método de Pagamento</label_1.Label>
                  <select_1.Select
                    value={formData.payment_method}
                    onValueChange={function (value) {
                      return setFormData(
                        __assign(__assign({}, formData), { payment_method: value }),
                      );
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="credit_card">
                        Cartão de Crédito
                      </select_1.SelectItem>
                      <select_1.SelectItem value="debit_card">Cartão de Débito</select_1.SelectItem>
                      <select_1.SelectItem value="bank_transfer">
                        Transferência Bancária
                      </select_1.SelectItem>
                      <select_1.SelectItem value="pix">PIX</select_1.SelectItem>
                      <select_1.SelectItem value="cash">Dinheiro</select_1.SelectItem>
                      <select_1.SelectItem value="financing">Financiamento</select_1.SelectItem>
                      <select_1.SelectItem value="installment">Parcelado</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="grid gap-2">
                  <label_1.Label htmlFor="amount">Valor (R$)</label_1.Label>
                  <input_1.Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount || ""}
                    onChange={function (e) {
                      return setFormData(
                        __assign(__assign({}, formData), {
                          amount: parseFloat(e.target.value) || 0,
                        }),
                      );
                    }}
                  />
                </div>

                <div className="grid gap-2">
                  <label_1.Label htmlFor="external_transaction_id">
                    ID da Transação Externa
                  </label_1.Label>
                  <input_1.Input
                    id="external_transaction_id"
                    placeholder="ID da transação do processador"
                    value={formData.external_transaction_id || ""}
                    onChange={function (e) {
                      return setFormData(
                        __assign(__assign({}, formData), {
                          external_transaction_id: e.target.value,
                        }),
                      );
                    }}
                  />
                </div>

                <div className="grid gap-2">
                  <label_1.Label htmlFor="authorization_code">Código de Autorização</label_1.Label>
                  <input_1.Input
                    id="authorization_code"
                    placeholder="Código de autorização"
                    value={formData.authorization_code || ""}
                    onChange={function (e) {
                      return setFormData(
                        __assign(__assign({}, formData), { authorization_code: e.target.value }),
                      );
                    }}
                  />
                </div>
              </div>

              <separator_1.Separator />

              <div className="flex justify-end space-x-2">
                <button_1.Button
                  variant="outline"
                  onClick={function () {
                    return setActiveTab("list");
                  }}
                >
                  Cancelar
                </button_1.Button>
                <button_1.Button onClick={handleCreatePayment} disabled={loading}>
                  {loading ? "Criando..." : "Criar Pagamento"}
                </button_1.Button>
              </div>
            </tabs_1.TabsContent>

            {/* Edit Payment Tab */}
            <tabs_1.TabsContent value="edit" className="space-y-4">
              {selectedPayment && (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label_1.Label>ID do Pagamento</label_1.Label>
                    <input_1.Input value={selectedPayment.id} disabled />
                  </div>

                  <div className="grid gap-2">
                    <label_1.Label htmlFor="edit_status">Status</label_1.Label>
                    <select_1.Select
                      value={formData.status}
                      onValueChange={function (value) {
                        return setFormData(__assign(__assign({}, formData), { status: value }));
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="pending">Pendente</select_1.SelectItem>
                        <select_1.SelectItem value="processing">Processando</select_1.SelectItem>
                        <select_1.SelectItem value="completed">Concluído</select_1.SelectItem>
                        <select_1.SelectItem value="failed">Falhou</select_1.SelectItem>
                        <select_1.SelectItem value="cancelled">Cancelado</select_1.SelectItem>
                        <select_1.SelectItem value="refunded">Reembolsado</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div className="grid gap-2">
                    <label_1.Label htmlFor="edit_external_transaction_id">
                      ID da Transação Externa
                    </label_1.Label>
                    <input_1.Input
                      id="edit_external_transaction_id"
                      value={formData.external_transaction_id || ""}
                      onChange={function (e) {
                        return setFormData(
                          __assign(__assign({}, formData), {
                            external_transaction_id: e.target.value,
                          }),
                        );
                      }}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label_1.Label htmlFor="edit_authorization_code">
                      Código de Autorização
                    </label_1.Label>
                    <input_1.Input
                      id="edit_authorization_code"
                      value={formData.authorization_code || ""}
                      onChange={function (e) {
                        return setFormData(
                          __assign(__assign({}, formData), { authorization_code: e.target.value }),
                        );
                      }}
                    />
                  </div>
                </div>
              )}

              <separator_1.Separator />

              <div className="flex justify-end space-x-2">
                <button_1.Button
                  variant="outline"
                  onClick={function () {
                    return setActiveTab("list");
                  }}
                >
                  Cancelar
                </button_1.Button>
                <button_1.Button onClick={handleUpdatePayment} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </button_1.Button>
              </div>
            </tabs_1.TabsContent>
          </tabs_1.Tabs>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
