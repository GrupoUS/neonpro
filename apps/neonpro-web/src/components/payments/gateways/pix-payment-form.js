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
exports.PixPaymentForm = PixPaymentForm;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var pix_integration_1 = require("@/lib/payments/gateways/pix-integration");
function PixPaymentForm(_a) {
    var _this = this;
    var amount = _a.amount, description = _a.description, onPaymentSuccess = _a.onPaymentSuccess, onPaymentError = _a.onPaymentError, className = _a.className;
    var _b = (0, react_1.useState)({
        amount: amount,
        currency: 'BRL',
        description: description,
        expirationMinutes: 30
    }), formData = _b[0], setFormData = _b[1];
    var _c = (0, react_1.useState)(null), payment = _c[0], setPayment = _c[1];
    var _d = (0, react_1.useState)(null), status = _d[0], setStatus = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(0), timeRemaining = _f[0], setTimeRemaining = _f[1];
    var _g = (0, react_1.useState)({}), errors = _g[0], setErrors = _g[1];
    // Countdown timer for payment expiration
    (0, react_1.useEffect)(function () {
        if (payment && payment.expiresAt) {
            var interval_1 = setInterval(function () {
                var now = new Date().getTime();
                var expiry = new Date(payment.expiresAt).getTime();
                var remaining = Math.max(0, expiry - now);
                setTimeRemaining(remaining);
                if (remaining === 0) {
                    setStatus(pix_integration_1.PixPaymentStatus.EXPIRED);
                    clearInterval(interval_1);
                }
            }, 1000);
            return function () { return clearInterval(interval_1); };
        }
    }, [payment]);
    // Poll payment status
    (0, react_1.useEffect)(function () {
        if (payment && status === pix_integration_1.PixPaymentStatus.PENDING) {
            var pollInterval_1 = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                var response, data, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, fetch("/api/payments/pix/status/".concat(payment.id))];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            if (data.status !== pix_integration_1.PixPaymentStatus.PENDING) {
                                setStatus(data.status);
                                if (data.status === pix_integration_1.PixPaymentStatus.PAID) {
                                    onPaymentSuccess === null || onPaymentSuccess === void 0 ? void 0 : onPaymentSuccess(payment);
                                    sonner_1.toast.success('Pagamento PIX confirmado!');
                                }
                                else if (data.status === pix_integration_1.PixPaymentStatus.EXPIRED) {
                                    sonner_1.toast.error('Pagamento PIX expirou');
                                }
                                clearInterval(pollInterval_1);
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            console.error('Error polling payment status:', error_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); }, 3000); // Poll every 3 seconds
            return function () { return clearInterval(pollInterval_1); };
        }
    }, [payment, status, onPaymentSuccess]);
    var validateForm = function () {
        var _a, _b, _c;
        var newErrors = {};
        if (!((_a = formData.payerName) === null || _a === void 0 ? void 0 : _a.trim())) {
            newErrors.payerName = 'Nome é obrigatório';
        }
        if (!((_b = formData.payerDocument) === null || _b === void 0 ? void 0 : _b.trim())) {
            newErrors.payerDocument = 'CPF/CNPJ é obrigatório';
        }
        else if (!isValidDocument(formData.payerDocument)) {
            newErrors.payerDocument = 'CPF/CNPJ inválido';
        }
        if (!((_c = formData.payerEmail) === null || _c === void 0 ? void 0 : _c.trim())) {
            newErrors.payerEmail = 'E-mail é obrigatório';
        }
        else if (!isValidEmail(formData.payerEmail)) {
            newErrors.payerEmail = 'E-mail inválido';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var response, paymentData, error_2, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!validateForm()) {
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/payments/pix/create', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(formData)
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Falha ao criar pagamento PIX');
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    paymentData = _a.sent();
                    setPayment(paymentData);
                    setStatus(pix_integration_1.PixPaymentStatus.PENDING);
                    sonner_1.toast.success('QR Code PIX gerado com sucesso!');
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    errorMessage = error_2 instanceof Error ? error_2.message : 'Erro desconhecido';
                    onPaymentError === null || onPaymentError === void 0 ? void 0 : onPaymentError(errorMessage);
                    sonner_1.toast.error(errorMessage);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var copyQRCode = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(payment === null || payment === void 0 ? void 0 : payment.qrCode)) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, navigator.clipboard.writeText(payment.qrCode)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success('Código PIX copiado!');
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    sonner_1.toast.error('Falha ao copiar código');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var formatTime = function (milliseconds) {
        var minutes = Math.floor(milliseconds / 60000);
        var seconds = Math.floor((milliseconds % 60000) / 1000);
        return "".concat(minutes.toString().padStart(2, '0'), ":").concat(seconds.toString().padStart(2, '0'));
    };
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    var getStatusIcon = function () {
        switch (status) {
            case pix_integration_1.PixPaymentStatus.PENDING:
                return <lucide_react_1.Clock className="h-4 w-4"/>;
            case pix_integration_1.PixPaymentStatus.PAID:
                return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>;
            case pix_integration_1.PixPaymentStatus.EXPIRED:
                return <lucide_react_1.AlertCircle className="h-4 w-4 text-red-500"/>;
            default:
                return <lucide_react_1.QrCode className="h-4 w-4"/>;
        }
    };
    var getStatusColor = function () {
        switch (status) {
            case pix_integration_1.PixPaymentStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800';
            case pix_integration_1.PixPaymentStatus.PAID:
                return 'bg-green-100 text-green-800';
            case pix_integration_1.PixPaymentStatus.EXPIRED:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    if (payment && status) {
        return (<card_1.Card className={className}>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle className="flex items-center gap-2">
                {getStatusIcon()}
                Pagamento PIX
              </card_1.CardTitle>
              <card_1.CardDescription>
                {formatCurrency(payment.amount)}
              </card_1.CardDescription>
            </div>
            <badge_1.Badge className={getStatusColor()}>
              {status === pix_integration_1.PixPaymentStatus.PENDING && 'Aguardando Pagamento'}
              {status === pix_integration_1.PixPaymentStatus.PAID && 'Pago'}
              {status === pix_integration_1.PixPaymentStatus.EXPIRED && 'Expirado'}
            </badge_1.Badge>
          </div>
        </card_1.CardHeader>
        
        <card_1.CardContent className="space-y-6">
          {status === pix_integration_1.PixPaymentStatus.PENDING && (<>
              <alert_1.Alert>
                <lucide_react_1.Clock className="h-4 w-4"/>
                <alert_1.AlertDescription>
                  Tempo restante: <strong>{formatTime(timeRemaining)}</strong>
                </alert_1.AlertDescription>
              </alert_1.Alert>
              
              <div className="text-center space-y-4">
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <img src={payment.qrCodeImage} alt="QR Code PIX" className="w-48 h-48 mx-auto"/>
                </div>
                
                <div className="space-y-2">
                  <label_1.Label>Código PIX (Copia e Cola)</label_1.Label>
                  <div className="flex gap-2">
                    <input_1.Input value={payment.qrCode} readOnly className="font-mono text-xs"/>
                    <button_1.Button variant="outline" size="icon" onClick={copyQRCode}>
                      <lucide_react_1.Copy className="h-4 w-4"/>
                    </button_1.Button>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Escaneie o QR Code ou copie o código PIX</p>
                <p>O pagamento será confirmado automaticamente</p>
              </div>
            </>)}
          
          {status === pix_integration_1.PixPaymentStatus.PAID && (<div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <lucide_react_1.CheckCircle className="h-8 w-8 text-green-500"/>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-700">
                  Pagamento Confirmado!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Seu pagamento PIX foi processado com sucesso
                </p>
              </div>
            </div>)}
          
          {status === pix_integration_1.PixPaymentStatus.EXPIRED && (<div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <lucide_react_1.AlertCircle className="h-8 w-8 text-red-500"/>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-700">
                  Pagamento Expirado
                </h3>
                <p className="text-sm text-muted-foreground">
                  O tempo limite para pagamento foi excedido
                </p>
              </div>
              <button_1.Button onClick={function () {
                    setPayment(null);
                    setStatus(null);
                }} variant="outline">
                <lucide_react_1.RefreshCw className="h-4 w-4 mr-2"/>
                Gerar Novo QR Code
              </button_1.Button>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.QrCode className="h-5 w-5"/>
          Pagamento PIX
        </card_1.CardTitle>
        <card_1.CardDescription>
          Pague instantaneamente com PIX - {formatCurrency(amount)}
        </card_1.CardDescription>
      </card_1.CardHeader>
      
      <card_1.CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="payerName">Nome Completo *</label_1.Label>
              <input_1.Input id="payerName" value={formData.payerName || ''} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { payerName: e.target.value })); }); }} placeholder="Seu nome completo" className={errors.payerName ? 'border-red-500' : ''}/>
              {errors.payerName && (<p className="text-sm text-red-500">{errors.payerName}</p>)}
            </div>
            
            <div className="space-y-2">
              <label_1.Label htmlFor="payerDocument">CPF/CNPJ *</label_1.Label>
              <input_1.Input id="payerDocument" value={formData.payerDocument || ''} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { payerDocument: e.target.value })); }); }} placeholder="000.000.000-00" className={errors.payerDocument ? 'border-red-500' : ''}/>
              {errors.payerDocument && (<p className="text-sm text-red-500">{errors.payerDocument}</p>)}
            </div>
          </div>
          
          <div className="space-y-2">
            <label_1.Label htmlFor="payerEmail">E-mail *</label_1.Label>
            <input_1.Input id="payerEmail" type="email" value={formData.payerEmail || ''} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { payerEmail: e.target.value })); }); }} placeholder="seu@email.com" className={errors.payerEmail ? 'border-red-500' : ''}/>
            {errors.payerEmail && (<p className="text-sm text-red-500">{errors.payerEmail}</p>)}
          </div>
          
          <div className="space-y-2">
            <label_1.Label htmlFor="additionalInfo">Informações Adicionais</label_1.Label>
            <textarea_1.Textarea id="additionalInfo" value={formData.additionalInfo || ''} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { additionalInfo: e.target.value })); }); }} placeholder="Observações sobre o pagamento (opcional)" rows={3}/>
          </div>
          
          <separator_1.Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor a pagar</p>
              <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
            </div>
            
            <button_1.Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? (<lucide_react_1.RefreshCw className="h-4 w-4 animate-spin"/>) : (<>
                  <lucide_react_1.QrCode className="h-4 w-4 mr-2"/>
                  Gerar PIX
                </>)}
            </button_1.Button>
          </div>
        </form>
      </card_1.CardContent>
    </card_1.Card>);
}
// Utility functions
function isValidEmail(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function isValidDocument(document) {
    // Remove non-numeric characters
    var cleanDoc = document.replace(/\D/g, '');
    // Check CPF (11 digits) or CNPJ (14 digits)
    if (cleanDoc.length === 11) {
        return isValidCPF(cleanDoc);
    }
    else if (cleanDoc.length === 14) {
        return isValidCNPJ(cleanDoc);
    }
    return false;
}
function isValidCPF(cpf) {
    // Basic CPF validation
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    var sum = 0;
    for (var i = 0; i < 9; i++) {
        sum += parseInt(cpf[i]) * (10 - i);
    }
    var digit1 = 11 - (sum % 11);
    if (digit1 > 9)
        digit1 = 0;
    if (parseInt(cpf[9]) !== digit1) {
        return false;
    }
    sum = 0;
    for (var i = 0; i < 10; i++) {
        sum += parseInt(cpf[i]) * (11 - i);
    }
    var digit2 = 11 - (sum % 11);
    if (digit2 > 9)
        digit2 = 0;
    return parseInt(cpf[10]) === digit2;
}
function isValidCNPJ(cnpj) {
    // Basic CNPJ validation
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
        return false;
    }
    var weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    var weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    var sum = 0;
    for (var i = 0; i < 12; i++) {
        sum += parseInt(cnpj[i]) * weights1[i];
    }
    var digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (parseInt(cnpj[12]) !== digit1) {
        return false;
    }
    sum = 0;
    for (var i = 0; i < 13; i++) {
        sum += parseInt(cnpj[i]) * weights2[i];
    }
    var digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return parseInt(cnpj[13]) === digit2;
}
