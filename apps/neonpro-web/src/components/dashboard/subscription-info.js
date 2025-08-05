"use client";
"use strict";
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
exports.SubscriptionInfo = SubscriptionInfo;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
var react_1 = require("react");
function SubscriptionInfo() {
  var _this = this;
  var _a = (0, react_1.useState)(null),
    subscription = _a[0],
    setSubscription = _a[1];
  var _b = (0, react_1.useState)(true),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  (0, react_1.useEffect)(function () {
    loadSubscriptionData();
  }, []);
  var loadSubscriptionData = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, 6, 7]);
            return [4 /*yield*/, fetch("/api/subscription/current")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setSubscription(data);
            return [3 /*break*/, 4];
          case 3:
            if (response.status === 401) {
              setError("Não autorizado");
            } else {
              setError("Erro ao carregar assinatura");
            }
            _a.label = 4;
          case 4:
            return [3 /*break*/, 7];
          case 5:
            error_1 = _a.sent();
            console.error("Error loading subscription:", error_1);
            setError("Erro de conexão");
            return [3 /*break*/, 7];
          case 6:
            setLoading(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  var formatDate = function (dateString) {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  var formatPrice = function (price, currency) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price / 100);
  };
  var getStatusBadge = function (status, cancelAtPeriodEnd) {
    if (cancelAtPeriodEnd) {
      return <badge_1.Badge variant="destructive">Cancelando</badge_1.Badge>;
    }
    var statusMap = {
      active: { label: "Ativa", variant: "default" },
      trialing: { label: "Teste", variant: "outline" },
      past_due: { label: "Em Atraso", variant: "destructive" },
      canceled: { label: "Cancelada", variant: "destructive" },
      unpaid: { label: "Não Paga", variant: "destructive" },
    };
    var statusInfo = statusMap[status] || {
      label: status,
      variant: "outline",
    };
    return <badge_1.Badge variant={statusInfo.variant}>{statusInfo.label}</badge_1.Badge>;
  };
  var getDaysUntilRenewal = function (dateString) {
    var renewalDate = new Date(dateString);
    var today = new Date();
    var diffTime = renewalDate.getTime() - today.getTime();
    var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  if (loading) {
    return (
      <card_1.Card>
        <card_1.CardContent className="p-6">
          <div className="flex items-center justify-center">
            <lucide_react_1.Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (error) {
    return (
      <card_1.Card>
        <card_1.CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <lucide_react_1.AlertTriangle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (!subscription) {
    return (
      <card_1.Card className="border-yellow-200 bg-yellow-50">
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2 text-yellow-800">
            <lucide_react_1.AlertTriangle className="h-5 w-5" />
            Assinatura Necessária
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <p className="text-sm text-yellow-700 mb-4">
            Você precisa de uma assinatura ativa para usar o NeonPro.
          </p>
          <button_1.Button asChild size="sm">
            <link_1.default href="/pricing">Ver Planos</link_1.default>
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  var daysUntilRenewal = getDaysUntilRenewal(subscription.current_period_end);
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.CreditCard className="h-5 w-5" />
            Assinatura
          </card_1.CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(subscription.status, subscription.cancel_at_period_end)}
            <button_1.Button variant="ghost" size="sm" asChild>
              <link_1.default href="/dashboard/subscription/manage">
                <lucide_react_1.Settings className="h-4 w-4" />
              </link_1.default>
            </button_1.Button>
          </div>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{subscription.plan_name}</h3>
          <p className="text-lg font-bold text-blue-600">
            {formatPrice(subscription.price, subscription.currency)}
            <span className="text-sm font-normal text-gray-500">/mês</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <lucide_react_1.Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-gray-600">Renovação</p>
              <p className="font-medium">
                {subscription.cancel_at_period_end
                  ? "Cancelada"
                  : formatDate(subscription.current_period_end)}
              </p>
            </div>
          </div>

          {subscription.max_patients && (
            <div className="flex items-center gap-2">
              <lucide_react_1.Users className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-gray-600">Pacientes</p>
                <p className="font-medium">
                  Até {subscription.max_patients.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          )}

          {subscription.max_clinics && (
            <div className="flex items-center gap-2">
              <lucide_react_1.Building className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-gray-600">Clínicas</p>
                <p className="font-medium">Até {subscription.max_clinics}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <lucide_react_1.Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-gray-600">Dias restantes</p>
              <p className="font-medium">
                {subscription.cancel_at_period_end
                  ? "".concat(daysUntilRenewal, " dias")
                  : "".concat(daysUntilRenewal, " dias")}
              </p>
            </div>
          </div>
        </div>

        {subscription.cancel_at_period_end && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Sua assinatura será cancelada em {formatDate(subscription.current_period_end)}.
              </p>
            </div>
          </div>
        )}

        {daysUntilRenewal <= 7 && !subscription.cancel_at_period_end && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <lucide_react_1.Calendar className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-800">
                Sua assinatura será renovada automaticamente em {daysUntilRenewal} dias.
              </p>
            </div>
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
