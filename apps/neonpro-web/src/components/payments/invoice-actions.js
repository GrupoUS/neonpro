'use client';
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
exports.default = InvoiceActions;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var payment_form_1 = require("./payment-form");
var stripe_provider_1 = require("./stripe-provider");
var dialog_1 = require("@/components/ui/dialog");
function InvoiceActions(_a) {
    var _this = this;
    var invoice = _a.invoice, onStatusUpdate = _a.onStatusUpdate;
    var _b = (0, react_1.useState)({
        email: false,
        pdf: false,
        payment: false,
    }), isLoading = _b[0], setIsLoading = _b[1];
    var _c = (0, react_1.useState)(false), showPaymentDialog = _c[0], setShowPaymentDialog = _c[1];
    var _d = (0, react_1.useState)(false), showPdfPreview = _d[0], setShowPdfPreview = _d[1];
    var _e = (0, react_1.useState)(null), pdfData = _e[0], setPdfData = _e[1];
    var handleSendEmail = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(function (prev) { return (__assign(__assign({}, prev), { email: true })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/email/send-invoice', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                invoiceId: invoice.id,
                                includeAttachment: true,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (!response.ok) {
                        throw new Error(data.error || 'Erro ao enviar email');
                    }
                    sonner_1.toast.success('Email enviado com sucesso!');
                    if (onStatusUpdate) {
                        onStatusUpdate();
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    errorMessage = error_1 instanceof Error ? error_1.message : 'Erro desconhecido';
                    sonner_1.toast.error("Erro ao enviar email: ".concat(errorMessage));
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(function (prev) { return (__assign(__assign({}, prev), { email: false })); });
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleDownloadPDF = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, blob, url, a, error_2, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(function (prev) { return (__assign(__assign({}, prev), { pdf: true })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch("/api/pdf/invoice?id=".concat(invoice.id), {
                            method: 'GET',
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.error || 'Erro ao gerar PDF');
                case 4: return [4 /*yield*/, response.blob()];
                case 5:
                    blob = _a.sent();
                    url = window.URL.createObjectURL(blob);
                    a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = "fatura-".concat(invoice.invoice_number, ".pdf");
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    sonner_1.toast.success('PDF baixado com sucesso!');
                    return [3 /*break*/, 8];
                case 6:
                    error_2 = _a.sent();
                    errorMessage = error_2 instanceof Error ? error_2.message : 'Erro desconhecido';
                    sonner_1.toast.error("Erro ao baixar PDF: ".concat(errorMessage));
                    return [3 /*break*/, 8];
                case 7:
                    setIsLoading(function (prev) { return (__assign(__assign({}, prev), { pdf: false })); });
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handlePreviewPDF = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_3, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(function (prev) { return (__assign(__assign({}, prev), { pdf: true })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/pdf/invoice', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                invoiceId: invoice.id,
                                preview: true,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (!response.ok) {
                        throw new Error(data.error || 'Erro ao gerar PDF');
                    }
                    setPdfData(data.pdfData);
                    setShowPdfPreview(true);
                    return [3 /*break*/, 6];
                case 4:
                    error_3 = _a.sent();
                    errorMessage = error_3 instanceof Error ? error_3.message : 'Erro desconhecido';
                    sonner_1.toast.error("Erro ao visualizar PDF: ".concat(errorMessage));
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(function (prev) { return (__assign(__assign({}, prev), { pdf: false })); });
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handlePaymentSuccess = function (paymentIntentId) {
        sonner_1.toast.success('Pagamento processado com sucesso!');
        setShowPaymentDialog(false);
        if (onStatusUpdate) {
            onStatusUpdate();
        }
    };
    var handlePaymentError = function (error) {
        sonner_1.toast.error("Erro no pagamento: ".concat(error));
    };
    var canPay = invoice.status === 'pending' || invoice.status === 'overdue';
    var isPaid = invoice.status === 'paid';
    return (<>
      <dropdown_menu_1.DropdownMenu>
        <dropdown_menu_1.DropdownMenuTrigger asChild>
          <button_1.Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
          </button_1.Button>
        </dropdown_menu_1.DropdownMenuTrigger>
        
        <dropdown_menu_1.DropdownMenuContent align="end">
          {/* Visualizar PDF */}
          <dropdown_menu_1.DropdownMenuItem onClick={handlePreviewPDF} disabled={isLoading.pdf}>
            {isLoading.pdf ? (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>) : (<lucide_react_1.Eye className="mr-2 h-4 w-4"/>)}
            Visualizar PDF
          </dropdown_menu_1.DropdownMenuItem>

          {/* Baixar PDF */}
          <dropdown_menu_1.DropdownMenuItem onClick={handleDownloadPDF} disabled={isLoading.pdf}>
            {isLoading.pdf ? (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>) : (<lucide_react_1.Download className="mr-2 h-4 w-4"/>)}
            Baixar PDF
          </dropdown_menu_1.DropdownMenuItem>

          <dropdown_menu_1.DropdownMenuSeparator />

          {/* Enviar Email */}
          <dropdown_menu_1.DropdownMenuItem onClick={handleSendEmail} disabled={isLoading.email}>
            {isLoading.email ? (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>) : (<lucide_react_1.Mail className="mr-2 h-4 w-4"/>)}
            {invoice.email_sent_at ? 'Reenviar Email' : 'Enviar Email'}
            {invoice.email_sent_at && <lucide_react_1.CheckCircle className="ml-1 h-3 w-3 text-green-600"/>}
          </dropdown_menu_1.DropdownMenuItem>

          <dropdown_menu_1.DropdownMenuSeparator />

          {/* Pagamento */}
          {canPay && (<dropdown_menu_1.DropdownMenuItem onClick={function () { return setShowPaymentDialog(true); }} disabled={isLoading.payment}>
              <lucide_react_1.CreditCard className="mr-2 h-4 w-4"/>
              Realizar Pagamento
            </dropdown_menu_1.DropdownMenuItem>)}

          {isPaid && (<dropdown_menu_1.DropdownMenuItem disabled>
              <lucide_react_1.CheckCircle className="mr-2 h-4 w-4 text-green-600"/>
              Pago
            </dropdown_menu_1.DropdownMenuItem>)}
        </dropdown_menu_1.DropdownMenuContent>
      </dropdown_menu_1.DropdownMenu>

      {/* Dialog de Pagamento */}
      <dialog_1.Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <dialog_1.DialogContent className="sm:max-w-[500px]">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Realizar Pagamento</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Fatura #{invoice.invoice_number} - Vencimento: {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          
          <stripe_provider_1.default>
            <payment_form_1.default invoiceId={invoice.id} amount={invoice.total} onSuccess={handlePaymentSuccess} onError={handlePaymentError}/>
          </stripe_provider_1.default>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Dialog de Preview PDF */}
      <dialog_1.Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <dialog_1.DialogContent className="sm:max-w-[900px] max-h-[90vh]">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Visualizar Fatura #{invoice.invoice_number}</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          
          {pdfData && (<div className="flex-1 min-h-[600px]">
              <iframe src={pdfData} className="w-full h-[600px] border rounded-md" title={"Fatura ".concat(invoice.invoice_number)}/>
            </div>)}
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </>);
}
