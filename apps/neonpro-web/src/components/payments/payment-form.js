'use client';
"use strict";
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
var react_1 = require("react");
var react_stripe_js_1 = require("@stripe/react-stripe-js");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function PaymentForm(_a) {
    var _this = this;
    var invoiceId = _a.invoiceId, amount = _a.amount, _b = _a.currency, currency = _b === void 0 ? 'brl' : _b, onSuccess = _a.onSuccess, onError = _a.onError;
    var stripe = (0, react_stripe_js_1.useStripe)();
    var elements = (0, react_stripe_js_1.useElements)();
    var _c = (0, react_1.useState)(false), isLoading = _c[0], setIsLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(null), success = _e[0], setSuccess = _e[1];
    var cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#9e2146',
            },
        },
    };
    var handleSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var cardElement, response, _a, clientSecret, apiError, _b, stripeError, paymentIntent, err_1, errorMessage;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    event.preventDefault();
                    if (!stripe || !elements) {
                        setError('Stripe não foi carregado corretamente');
                        return [2 /*return*/];
                    }
                    cardElement = elements.getElement(react_stripe_js_1.CardElement);
                    if (!cardElement) {
                        setError('Elemento do cartão não encontrado');
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    setError(null);
                    setSuccess(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, fetch('/api/payments/create-intent', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                invoiceId: invoiceId,
                                amount: amount,
                                currency: currency,
                            }),
                        })];
                case 2:
                    response = _c.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    _a = _c.sent(), clientSecret = _a.clientSecret, apiError = _a.error;
                    if (apiError) {
                        throw new Error(apiError);
                    }
                    if (!clientSecret) {
                        throw new Error('Client secret não foi retornado');
                    }
                    return [4 /*yield*/, stripe.confirmCardPayment(clientSecret, {
                            payment_method: {
                                card: cardElement,
                            },
                        })];
                case 4:
                    _b = _c.sent(), stripeError = _b.error, paymentIntent = _b.paymentIntent;
                    if (stripeError) {
                        throw new Error(stripeError.message || 'Erro no pagamento');
                    }
                    if ((paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.status) === 'succeeded') {
                        setSuccess('Pagamento processado com sucesso!');
                        sonner_1.toast.success('Pagamento realizado com sucesso');
                        if (onSuccess) {
                            onSuccess(paymentIntent.id);
                        }
                    }
                    else {
                        throw new Error('Pagamento não foi processado corretamente');
                    }
                    return [3 /*break*/, 7];
                case 5:
                    err_1 = _c.sent();
                    errorMessage = err_1 instanceof Error ? err_1.message : 'Erro desconhecido';
                    setError(errorMessage);
                    sonner_1.toast.error("Erro no pagamento: ".concat(errorMessage));
                    if (onError) {
                        onError(errorMessage);
                    }
                    return [3 /*break*/, 7];
                case 6:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var formatAmount = function (value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value / 100);
    };
    if (success) {
        return (<card_1.Card className="w-full max-w-md mx-auto">
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2 text-green-600">
            <lucide_react_1.CheckCircle className="h-5 w-5"/>
            Pagamento Concluído
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <alert_1.Alert className="border-green-200 bg-green-50">
            <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600"/>
            <alert_1.AlertDescription className="text-green-800">
              {success}
            </alert_1.AlertDescription>
          </alert_1.Alert>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className="w-full max-w-md mx-auto">
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.CreditCard className="h-5 w-5"/>
          Pagamento Seguro
        </card_1.CardTitle>
        <card_1.CardDescription>
          Total: <span className="font-semibold text-lg">{formatAmount(amount)}</span>
        </card_1.CardDescription>
      </card_1.CardHeader>

      <form onSubmit={handleSubmit}>
        <card_1.CardContent className="space-y-4">
          {error && (<alert_1.Alert variant="destructive">
              <lucide_react_1.AlertTriangle className="h-4 w-4"/>
              <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
            </alert_1.Alert>)}

          <div className="space-y-2">
            <label htmlFor="card-element" className="text-sm font-medium">
              Dados do Cartão
            </label>
            <div className="p-3 border border-gray-300 rounded-md">
              <react_stripe_js_1.CardElement id="card-element" options={cardElementOptions}/>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Pagamentos processados de forma segura via Stripe</p>
            <p>• Seus dados são protegidos por criptografia SSL</p>
            <p>• Não armazenamos informações do cartão</p>
          </div>
        </card_1.CardContent>

        <card_1.CardFooter>
          <button_1.Button type="submit" disabled={!stripe || isLoading} className="w-full">
            {isLoading ? (<>
                <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                Processando Pagamento...
              </>) : (<>
                <lucide_react_1.CreditCard className="mr-2 h-4 w-4"/>
                Pagar {formatAmount(amount)}
              </>)}
          </button_1.Button>
        </card_1.CardFooter>
      </form>
    </card_1.Card>);
}
