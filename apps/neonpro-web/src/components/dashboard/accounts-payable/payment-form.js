"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.default = PaymentForm;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var calendar_1 = require("@/components/ui/calendar");
var card_1 = require("@/components/ui/card");
var checkbox_1 = require("@/components/ui/checkbox");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var popover_1 = require("@/components/ui/popover");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var paymentMethods = [
    { value: "cash", label: "Dinheiro", icon: lucide_react_1.DollarSign },
    { value: "check", label: "Cheque", icon: lucide_react_1.FileText },
    { value: "bank_transfer", label: "Transferência Bancária", icon: lucide_react_1.CreditCard },
    { value: "pix", label: "PIX", icon: lucide_react_1.Receipt },
    { value: "credit_card", label: "Cartão de Crédito", icon: lucide_react_1.CreditCard },
    { value: "other", label: "Outro", icon: lucide_react_1.FileText },
];
var paymentStatuses = [
    {
        value: "pending",
        label: "Pendente",
        color: "bg-yellow-100 text-yellow-800",
    },
    {
        value: "completed",
        label: "Concluído",
        color: "bg-green-100 text-green-800",
    },
    {
        value: "cancelled",
        label: "Cancelado",
        color: "bg-gray-100 text-gray-800",
    },
    { value: "failed", label: "Falhou", color: "bg-red-100 text-red-800" },
];
function PaymentForm(_a) {
    var _this = this;
    var payable = _a.payable, open = _a.open, onOpenChange = _a.onOpenChange, onSuccess = _a.onSuccess;
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(false), showCalendar = _c[0], setShowCalendar = _c[1];
    var _d = (0, react_1.useState)([]), previousPayments = _d[0], setPreviousPayments = _d[1];
    var _e = (0, react_1.useState)(false), loadingPayments = _e[0], setLoadingPayments = _e[1];
    var _f = (0, react_1.useState)({
        accounts_payable_id: "",
        payment_date: new Date(),
        amount_paid: 0,
        payment_method: "pix",
        reference_number: "",
        bank_account: "",
        notes: "",
        is_partial_payment: false,
    }), formData = _f[0], setFormData = _f[1];
    // Calculate remaining balance
    var totalPaid = previousPayments
        .filter(function (p) { return p.status === "completed"; })
        .reduce(function (sum, p) { return sum + p.amount_paid; }, 0);
    var remainingBalance = ((payable === null || payable === void 0 ? void 0 : payable.net_amount) || 0) - totalPaid;
    var isOverpayment = formData.amount_paid > remainingBalance;
    var canMakePartialPayment = remainingBalance > 0;
    (0, react_1.useEffect)(function () {
        if (payable && open) {
            setFormData(function (prev) { return (__assign(__assign({}, prev), { accounts_payable_id: payable.id, amount_paid: remainingBalance > 0 ? remainingBalance : 0 })); });
            loadPreviousPayments();
        }
    }, [payable, open]);
    var loadPreviousPayments = function () { return __awaiter(_this, void 0, void 0, function () {
        var mockPayments;
        return __generator(this, function (_a) {
            if (!(payable === null || payable === void 0 ? void 0 : payable.id))
                return [2 /*return*/];
            setLoadingPayments(true);
            try {
                mockPayments = [
                    {
                        id: "1",
                        accounts_payable_id: payable.id,
                        payment_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        amount_paid: payable.net_amount * 0.3, // 30% paid
                        payment_method: "bank_transfer",
                        reference_number: "TRF001234",
                        status: "completed",
                        created_by: "user1",
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        payable_invoice_number: payable.invoice_number,
                        vendor_name: payable.vendor_name,
                        original_amount: payable.net_amount,
                        remaining_balance: payable.net_amount * 0.7,
                    },
                ];
                // Only show if there are actual previous payments (simulate some history)
                if (Math.random() > 0.5) {
                    setPreviousPayments(mockPayments);
                }
            }
            catch (error) {
                console.error("Error loading payments:", error);
                sonner_1.toast.error("Erro ao carregar histórico de pagamentos");
            }
            finally {
                setLoadingPayments(false);
            }
            return [2 /*return*/];
        });
    }); };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var paymentData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!formData.accounts_payable_id || formData.amount_paid <= 0) {
                        sonner_1.toast.error("Preencha todos os campos obrigatórios");
                        return [2 /*return*/];
                    }
                    if (isOverpayment && !formData.is_partial_payment) {
                        sonner_1.toast.error("Valor do pagamento excede o saldo devedor");
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    paymentData = __assign(__assign({}, formData), { payment_date: formData.payment_date.toISOString(), status: "completed", created_by: "current_user", reference_number: formData.reference_number || "PAY".concat(Date.now()) });
                    // In real implementation, this would call payment service
                    console.log("Processing payment:", paymentData);
                    // Simulate API call
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 2:
                    // Simulate API call
                    _a.sent();
                    sonner_1.toast.success("Pagamento processado com sucesso");
                    onSuccess();
                    onOpenChange(false);
                    // Reset form
                    setFormData({
                        accounts_payable_id: "",
                        payment_date: new Date(),
                        amount_paid: 0,
                        payment_method: "pix",
                        reference_number: "",
                        bank_account: "",
                        notes: "",
                        is_partial_payment: false,
                    });
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error processing payment:", error_1);
                    sonner_1.toast.error("Erro ao processar pagamento");
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var updateField = function (field, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    var getPaymentMethodIcon = function (method) {
        var methodConfig = paymentMethods.find(function (m) { return m.value === method; });
        return (methodConfig === null || methodConfig === void 0 ? void 0 : methodConfig.icon) || lucide_react_1.DollarSign;
    };
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(amount);
    };
    if (!payable)
        return null;
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.Receipt className="h-5 w-5"/>
            Processar Pagamento
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Registre o pagamento para a conta a pagar #{payable.invoice_number}
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-6">
          {/* Payable Information */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-sm">
                Informações da Conta a Pagar
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">
                    Fornecedor
                  </p>
                  <p>{payable.vendor_name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Invoice</p>
                  <p>{payable.invoice_number}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Valor Original
                  </p>
                  <p className="font-semibold">
                    {formatCurrency(payable.net_amount)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Saldo Devedor
                  </p>
                  <p className={(0, utils_1.cn)("font-semibold", remainingBalance > 0 ? "text-red-600" : "text-green-600")}>
                    {formatCurrency(remainingBalance)}
                  </p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Previous Payments */}
          {previousPayments.length > 0 && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-sm">
                  Histórico de Pagamentos
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  {previousPayments.map(function (payment) {
                var IconComponent = getPaymentMethodIcon(payment.payment_method);
                var statusConfig = paymentStatuses.find(function (s) { return s.value === payment.status; });
                return (<div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-4 w-4 text-muted-foreground"/>
                          <div>
                            <p className="font-medium text-sm">
                              {formatCurrency(payment.amount_paid)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(0, date_fns_1.format)(new Date(payment.payment_date), "dd/MM/yyyy", { locale: locale_1.ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <badge_1.Badge className={(0, utils_1.cn)("text-xs", statusConfig === null || statusConfig === void 0 ? void 0 : statusConfig.color)}>
                            {statusConfig === null || statusConfig === void 0 ? void 0 : statusConfig.label}
                          </badge_1.Badge>
                          {payment.reference_number && (<span className="text-xs text-muted-foreground">
                              {payment.reference_number}
                            </span>)}
                        </div>
                      </div>);
            })}
                </div>
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-sm">Dados do Pagamento</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Payment Date */}
                  <div className="space-y-2">
                    <label_1.Label htmlFor="payment_date">Data do Pagamento *</label_1.Label>
                    <popover_1.Popover open={showCalendar} onOpenChange={setShowCalendar}>
                      <popover_1.PopoverTrigger asChild>
                        <button_1.Button variant="outline" className={(0, utils_1.cn)("w-full justify-start text-left font-normal", !formData.payment_date && "text-muted-foreground")}>
                          <lucide_react_1.CalendarIcon className="mr-2 h-4 w-4"/>
                          {formData.payment_date ? ((0, date_fns_1.format)(formData.payment_date, "dd/MM/yyyy", {
            locale: locale_1.ptBR,
        })) : (<span>Selecione a data</span>)}
                        </button_1.Button>
                      </popover_1.PopoverTrigger>
                      <popover_1.PopoverContent className="w-auto p-0">
                        <calendar_1.Calendar mode="single" selected={formData.payment_date} onSelect={function (date) {
            if (date) {
                updateField("payment_date", date);
                setShowCalendar(false);
            }
        }} initialFocus/>
                      </popover_1.PopoverContent>
                    </popover_1.Popover>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label_1.Label htmlFor="payment_method">
                      Método de Pagamento *
                    </label_1.Label>
                    <select_1.Select value={formData.payment_method} onValueChange={function (value) {
            return updateField("payment_method", value);
        }}>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Selecione o método"/>
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {paymentMethods.map(function (method) {
            var IconComponent = method.icon;
            return (<select_1.SelectItem key={method.value} value={method.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4"/>
                                {method.label}
                              </div>
                            </select_1.SelectItem>);
        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Amount */}
                  <div className="space-y-2">
                    <label_1.Label htmlFor="amount_paid">Valor do Pagamento *</label_1.Label>
                    <div className="relative">
                      <lucide_react_1.DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                      <input_1.Input id="amount_paid" type="number" step="0.01" value={formData.amount_paid || ""} onChange={function (e) {
            return updateField("amount_paid", parseFloat(e.target.value) || 0);
        }} className={(0, utils_1.cn)("pl-9", isOverpayment && "border-red-500 focus:border-red-500")} placeholder="0,00" required/>
                    </div>
                    {isOverpayment && (<div className="flex items-center gap-1 text-sm text-red-600">
                        <lucide_react_1.AlertCircle className="h-3 w-3"/>
                        Valor excede o saldo devedor
                      </div>)}
                    {formData.amount_paid > 0 &&
            formData.amount_paid < remainingBalance && (<div className="flex items-center gap-1 text-sm text-blue-600">
                          <lucide_react_1.AlertCircle className="h-3 w-3"/>
                          Pagamento parcial - Saldo restante:{" "}
                          {formatCurrency(remainingBalance - formData.amount_paid)}
                        </div>)}
                  </div>

                  {/* Reference Number */}
                  <div className="space-y-2">
                    <label_1.Label htmlFor="reference_number">
                      Número de Referência
                    </label_1.Label>
                    <input_1.Input id="reference_number" value={formData.reference_number} onChange={function (e) {
            return updateField("reference_number", e.target.value);
        }} placeholder="Número do documento, TED, etc."/>
                  </div>
                </div>

                {/* Bank Account (conditional) */}
                {(formData.payment_method === "bank_transfer" ||
            formData.payment_method === "pix") && (<div className="space-y-2">
                    <label_1.Label htmlFor="bank_account">Conta Bancária</label_1.Label>
                    <input_1.Input id="bank_account" value={formData.bank_account} onChange={function (e) {
                return updateField("bank_account", e.target.value);
            }} placeholder="Banco, agência, conta..."/>
                  </div>)}

                {/* Notes */}
                <div className="space-y-2">
                  <label_1.Label htmlFor="notes">Observações</label_1.Label>
                  <textarea_1.Textarea id="notes" value={formData.notes} onChange={function (e) { return updateField("notes", e.target.value); }} placeholder="Informações adicionais sobre o pagamento..." rows={2}/>
                </div>

                {/* Partial Payment Checkbox */}
                {canMakePartialPayment && (<div className="flex items-center space-x-2">
                    <checkbox_1.Checkbox id="is_partial_payment" checked={formData.is_partial_payment} onCheckedChange={function (checked) {
                return updateField("is_partial_payment", checked);
            }}/>
                    <label_1.Label htmlFor="is_partial_payment" className="text-sm">
                      Este é um pagamento parcial
                    </label_1.Label>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </form>
        </div>

        <dialog_1.DialogFooter>
          <button_1.Button type="button" variant="outline" onClick={function () { return onOpenChange(false); }}>
            Cancelar
          </button_1.Button>
          <button_1.Button onClick={handleSubmit} disabled={loading ||
            formData.amount_paid <= 0 ||
            (isOverpayment && !formData.is_partial_payment)}>
            {loading && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            {loading ? "Processando..." : "Processar Pagamento"}
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
