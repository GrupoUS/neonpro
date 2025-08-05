"use client";
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
exports.default = PricingPage;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var plans_1 = require("@/lib/constants/plans");
var lucide_react_1 = require("lucide-react");
var navigation_1 = require("next/navigation");
var react_1 = require("react");
var sonner_1 = require("sonner");
function PricingPage() {
  var _a = (0, react_1.useState)(null),
    loading = _a[0],
    setLoading = _a[1];
  var router = (0, navigation_1.useRouter)();
  var formatPrice = (price) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price / 100);
  var handleSelectPlan = (planId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, url, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setLoading(planId);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, 5, 6]);
            return [
              4 /*yield*/,
              fetch("/api/stripe/create-checkout-session", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  planId: planId,
                  successUrl: "".concat(window.location.origin, "/dashboard/subscription/success"),
                  cancelUrl: "".concat(window.location.origin, "/pricing"),
                }),
              }),
            ];
          case 2:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to create checkout session");
            }
            return [4 /*yield*/, response.json()];
          case 3:
            url = _a.sent().url;
            if (url) {
              window.location.href = url;
            } else {
              throw new Error("No checkout URL received");
            }
            return [3 /*break*/, 6];
          case 4:
            error_1 = _a.sent();
            console.error("Error creating checkout session:", error_1);
            sonner_1.toast.error("Erro ao processar pagamento. Tente novamente.");
            return [3 /*break*/, 6];
          case 5:
            setLoading(null);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  var plans = Object.entries(plans_1.NEONPRO_PLANS);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal para sua Clínica
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Todos os planos incluem suporte técnico e atualizações gratuitas. Comece sua avaliação
            gratuita de 14 dias hoje mesmo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((_a, index) => {
            var planId = _a[0],
              plan = _a[1];
            return (
              <card_1.Card
                key={planId}
                className={"relative overflow-hidden transition-all duration-300 hover:shadow-xl ".concat(
                  index === 1
                    ? "border-2 border-blue-500 scale-105"
                    : "border hover:border-blue-300",
                )}
              >
                {index === 1 && (
                  <badge_1.Badge className="absolute top-4 right-4 bg-blue-500 text-white">
                    Mais Popular
                  </badge_1.Badge>
                )}

                <card_1.CardHeader className="text-center">
                  <card_1.CardTitle className="text-2xl font-bold">{plan.name}</card_1.CardTitle>
                  <card_1.CardDescription className="text-gray-600">
                    {plan.description}
                  </card_1.CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </card_1.CardHeader>

                <card_1.CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <lucide_react_1.Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </card_1.CardContent>

                <card_1.CardFooter>
                  <button_1.Button
                    className={"w-full ".concat(
                      index === 1
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-900 hover:bg-gray-800",
                    )}
                    onClick={() => handleSelectPlan(planId)}
                    disabled={loading !== null}
                  >
                    {loading === planId
                      ? <>
                          <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      : <>
                          Começar Teste Grátis
                          <span className="ml-2 text-xs opacity-75">14 dias</span>
                        </>}
                  </button_1.Button>
                </card_1.CardFooter>
              </card_1.Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Por que escolher o NeonPro?</h2>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold text-gray-900">100% Seguro</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Dados protegidos com criptografia de ponta
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="font-semibold text-gray-900">Acesso Mobile</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Funciona perfeitamente em qualquer dispositivo
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="font-semibold text-gray-900">Suporte 24/7</h3>
                <p className="text-gray-600 text-sm mt-1">Equipe especializada sempre disponível</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Dúvidas? Entre em contato conosco:{" "}
            <a href="mailto:suporte@neonpro.com" className="text-blue-600 hover:underline">
              suporte@neonpro.com
            </a>{" "}
            ou{" "}
            <a href="tel:+551199999999" className="text-blue-600 hover:underline">
              (11) 99999-9999
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
