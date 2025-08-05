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
exports.default = PaymentVoucherGenerator;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var separator_1 = require("@/components/ui/separator");
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var paymentMethodLabels = {
    cash: "Dinheiro",
    check: "Cheque",
    bank_transfer: "Transferência Bancária",
    pix: "PIX",
    credit_card: "Cartão de Crédito",
    other: "Outro",
};
function PaymentVoucherGenerator(_a) {
    var _this = this;
    var payment = _a.payment, open = _a.open, onOpenChange = _a.onOpenChange, onGenerated = _a.onGenerated;
    var _b = (0, react_1.useState)(false), generating = _b[0], setGenerating = _b[1];
    var _c = (0, react_1.useState)(null), voucher = _c[0], setVoucher = _c[1];
    // Mock company data - In real implementation, this would come from settings/profile
    var companyData = {
        company_name: "NeonPro Clínica Estética",
        company_document: "12.345.678/0001-90",
        company_address: "Av. das Clínicas, 123 - Centro - São Paulo/SP - CEP: 01234-567",
        company_phone: "(11) 3456-7890",
        company_email: "contato@neonpro.com.br",
    };
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(amount);
    };
    var formatDocument = function (document) {
        // Format CNPJ or CPF
        if (document.length === 14) {
            return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
        }
        else if (document.length === 11) {
            return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        }
        return document;
    };
    var generateVoucher = function () { return __awaiter(_this, void 0, void 0, function () {
        var newVoucher, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!payment)
                        return [2 /*return*/];
                    setGenerating(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    // Simulate voucher generation
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 2:
                    // Simulate voucher generation
                    _a.sent();
                    newVoucher = __assign({ id: "voucher_".concat(Date.now()), voucher_number: "CV".concat(new Date().getFullYear()).concat(String(Date.now()).slice(-6)), payment_id: payment.id || "payment_1", accounts_payable_id: payment.accounts_payable_id || "ap_1", payment_date: payment.payment_date || new Date().toISOString(), amount_paid: payment.amount_paid || 1500.0, payment_method: payment.payment_method || "pix", reference_number: payment.reference_number || "PIX123456789", bank_account: payment.bank_account, notes: payment.notes, status: "generated", created_at: new Date().toISOString(), 
                        // Mock related data
                        invoice_number: "INV-2024-001", vendor_name: "Fornecedor Alpha Ltda", vendor_document: "12345678000190", vendor_address: "Rua do Fornecedor, 456 - Distrito Industrial - São Paulo/SP", original_amount: payment.original_amount || 1500.0, remaining_balance: (payment.original_amount || 1500.0) - (payment.amount_paid || 1500.0) }, companyData);
                    setVoucher(newVoucher);
                    onGenerated === null || onGenerated === void 0 ? void 0 : onGenerated(newVoucher);
                    sonner_1.toast.success("Comprovante gerado com sucesso!");
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error generating voucher:", error_1);
                    sonner_1.toast.error("Erro ao gerar comprovante");
                    return [3 /*break*/, 5];
                case 4:
                    setGenerating(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDownloadPDF = function () {
        // In real implementation, this would generate and download a PDF
        sonner_1.toast.success("PDF baixado com sucesso!");
    };
    var handlePrint = function () {
        // In real implementation, this would trigger browser print
        if (typeof window !== "undefined") {
            window.print();
        }
    };
    var handleShare = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(navigator.share && voucher)) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, navigator.share({
                            title: "Comprovante de Pagamento ".concat(voucher.voucher_number),
                            text: "Comprovante de pagamento no valor de ".concat(formatCurrency(voucher.amount_paid), " para ").concat(voucher.vendor_name),
                            url: window.location.href,
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    // Fallback to clipboard
                    handleCopyLink();
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 6];
                case 5:
                    handleCopyLink();
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleCopyLink = function () {
        if (typeof window !== "undefined" && voucher) {
            var link = "".concat(window.location.origin, "/dashboard/payments/voucher/").concat(voucher.id);
            navigator.clipboard.writeText(link);
            sonner_1.toast.success("Link copiado para a área de transferência!");
        }
    };
    var PaymentMethodIcon = function (_a) {
        var method = _a.method;
        switch (method) {
            case "pix":
                return <lucide_react_1.Receipt className="h-4 w-4"/>;
            case "bank_transfer":
                return <lucide_react_1.CreditCard className="h-4 w-4"/>;
            case "check":
                return <lucide_react_1.FileText className="h-4 w-4"/>;
            default:
                return <lucide_react_1.CreditCard className="h-4 w-4"/>;
        }
    };
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.Receipt className="h-5 w-5"/>
            Comprovante de Pagamento
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Gere e gerencie comprovantes de pagamento
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-6">
          {!voucher ? (
        // Generation Form
        <div className="text-center py-8">
              <lucide_react_1.Receipt className="h-16 w-16 mx-auto text-muted-foreground mb-4"/>
              <h3 className="text-lg font-semibold mb-2">Gerar Comprovante</h3>
              <p className="text-muted-foreground mb-6">
                Clique no botão abaixo para gerar o comprovante deste pagamento
              </p>
              <button_1.Button onClick={generateVoucher} disabled={generating} size="lg">
                {generating ? (<>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"/>
                    Gerando...
                  </>) : (<>
                    <lucide_react_1.Receipt className="h-4 w-4 mr-2"/>
                    Gerar Comprovante
                  </>)}
              </button_1.Button>
            </div>) : (
        // Voucher Display
        <div className="space-y-6" id="voucher-content">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h1 className="text-2xl font-bold">COMPROVANTE DE PAGAMENTO</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Nº {voucher.voucher_number}
                </p>
              </div>

              {/* Company Info */}
              <card_1.Card>
                <card_1.CardHeader className="pb-3">
                  <card_1.CardTitle className="text-lg flex items-center gap-2">
                    <lucide_react_1.Building className="h-5 w-5"/>
                    Dados da Empresa
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="pt-0">
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold">{voucher.company_name}</p>
                      <p className="text-sm text-muted-foreground">
                        CNPJ: {formatDocument(voucher.company_document)}
                      </p>
                    </div>
                    <p className="text-sm">{voucher.company_address}</p>
                    {voucher.company_phone && (<p className="text-sm">Tel: {voucher.company_phone}</p>)}
                    {voucher.company_email && (<p className="text-sm">E-mail: {voucher.company_email}</p>)}
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Vendor Info */}
              <card_1.Card>
                <card_1.CardHeader className="pb-3">
                  <card_1.CardTitle className="text-lg flex items-center gap-2">
                    <lucide_react_1.User className="h-5 w-5"/>
                    Dados do Fornecedor
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="pt-0">
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold">{voucher.vendor_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {voucher.vendor_document.length > 11 ? "CNPJ" : "CPF"}:{" "}
                        {formatDocument(voucher.vendor_document)}
                      </p>
                    </div>
                    {voucher.vendor_address && (<p className="text-sm">{voucher.vendor_address}</p>)}
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Payment Details */}
              <card_1.Card>
                <card_1.CardHeader className="pb-3">
                  <card_1.CardTitle className="text-lg flex items-center gap-2">
                    <lucide_react_1.CreditCard className="h-5 w-5"/>
                    Detalhes do Pagamento
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Invoice
                        </p>
                        <p className="font-semibold">
                          {voucher.invoice_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Data do Pagamento
                        </p>
                        <div className="flex items-center gap-2">
                          <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
                          <p className="font-semibold">
                            {(0, date_fns_1.format)(new Date(voucher.payment_date), "dd/MM/yyyy 'às' HH:mm", { locale: locale_1.ptBR })}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Método de Pagamento
                        </p>
                        <div className="flex items-center gap-2">
                          <PaymentMethodIcon method={voucher.payment_method}/>
                          <p className="font-semibold">
                            {paymentMethodLabels[voucher.payment_method] ||
                voucher.payment_method}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Valor Original
                        </p>
                        <p className="font-semibold">
                          {formatCurrency(voucher.original_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Valor Pago
                        </p>
                        <p className="font-bold text-lg text-green-600">
                          {formatCurrency(voucher.amount_paid)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Saldo Remanescente
                        </p>
                        <p className={(0, utils_1.cn)("font-semibold", voucher.remaining_balance > 0
                ? "text-yellow-600"
                : "text-green-600")}>
                          {formatCurrency(voucher.remaining_balance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {voucher.reference_number && <separator_1.Separator className="my-4"/>}

                  {voucher.reference_number && (<div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Número de Referência
                      </p>
                      <p className="font-semibold">
                        {voucher.reference_number}
                      </p>
                    </div>)}

                  {voucher.bank_account && (<div className="mt-3">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Conta Bancária
                      </p>
                      <p className="font-semibold">{voucher.bank_account}</p>
                    </div>)}

                  {voucher.notes && (<div className="mt-3">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Observações
                      </p>
                      <p className="text-sm">{voucher.notes}</p>
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>

              {/* Status and Timestamp */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <lucide_react_1.CheckCircle className="h-5 w-5 text-green-600"/>
                  <div>
                    <p className="font-semibold text-green-600">
                      Pagamento Confirmado
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Comprovante gerado em{" "}
                      {(0, date_fns_1.format)(new Date(voucher.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: locale_1.ptBR })}
                    </p>
                  </div>
                </div>

                <badge_1.Badge variant="outline" className="text-green-700 border-green-200">
                  <lucide_react_1.CheckCircle className="h-3 w-3 mr-1"/>
                  Válido
                </badge_1.Badge>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <button_1.Button onClick={handleDownloadPDF} variant="default">
                  <lucide_react_1.Download className="h-4 w-4 mr-2"/>
                  Baixar PDF
                </button_1.Button>

                <button_1.Button onClick={handlePrint} variant="outline">
                  <lucide_react_1.Printer className="h-4 w-4 mr-2"/>
                  Imprimir
                </button_1.Button>

                <button_1.Button onClick={handleShare} variant="outline">
                  <lucide_react_1.Share className="h-4 w-4 mr-2"/>
                  Compartilhar
                </button_1.Button>

                <button_1.Button onClick={handleCopyLink} variant="outline">
                  <lucide_react_1.Copy className="h-4 w-4 mr-2"/>
                  Copiar Link
                </button_1.Button>

                <button_1.Button onClick={function () {
                return window.open("/dashboard/payments/voucher/".concat(voucher.id), "_blank");
            }} variant="outline">
                  <lucide_react_1.ExternalLink className="h-4 w-4 mr-2"/>
                  Abrir em Nova Aba
                </button_1.Button>
              </div>
            </div>)}
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
