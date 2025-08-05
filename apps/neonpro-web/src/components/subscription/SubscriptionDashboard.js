/**
 * Subscription Dashboard Component
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
 */
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
exports.default = SubscriptionDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function SubscriptionDashboard(_a) {
  var _this = this;
  var _b, _c, _d;
  var onUpgrade = _a.onUpgrade,
    onManageBilling = _a.onManageBilling,
    onCancelSubscription = _a.onCancelSubscription;
  var _e = (0, react_1.useState)(null),
    subscription = _e[0],
    setSubscription = _e[1];
  var _f = (0, react_1.useState)(true),
    loading = _f[0],
    setLoading = _f[1];
  var _g = (0, react_1.useState)(null),
    error = _g[0],
    setError = _g[1];
  (0, react_1.useEffect)(function () {
    fetchSubscriptionData();
  }, []);
  var fetchSubscriptionData = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, result, err_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoading(true);
            return [4 /*yield*/, fetch("/api/subscription/current")];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            if (result.success) {
              setSubscription(result.data);
            } else {
              setError(result.message || "Erro ao carregar dados da assinatura");
            }
            return [3 /*break*/, 5];
          case 3:
            err_1 = _a.sent();
            setError("Erro de conexão ao carregar assinatura");
            console.error("Error fetching subscription:", err_1);
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
  var getPlanIcon = function (planName) {
    switch (planName) {
      case "basic":
        return <lucide_react_1.Star className="h-5 w-5 text-blue-500" />;
      case "professional":
        return <lucide_react_1.Rocket className="h-5 w-5 text-purple-500" />;
      case "enterprise":
        return <lucide_react_1.Crown className="h-5 w-5 text-yellow-500" />;
      default:
        return <lucide_react_1.Star className="h-5 w-5 text-gray-500" />;
    }
  };
  var getStatusBadge = function (status) {
    var statusConfig = {
      trial: { variant: "secondary", label: "Período de Teste" },
      active: { variant: "default", label: "Ativo" },
      past_due: { variant: "destructive", label: "Vencido" },
      canceled: { variant: "outline", label: "Cancelado" },
      unpaid: { variant: "destructive", label: "Não Pago" },
    };
    var config = statusConfig[status] || statusConfig.active;
    return <badge_1.Badge variant={config.variant}>{config.label}</badge_1.Badge>;
  };
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {__spreadArray([], Array(4), true).map(function (_, i) {
            return (
              <card_1.Card key={i}>
                <card_1.CardHeader className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </card_1.CardHeader>
              </card_1.Card>
            );
          })}
        </div>
      </div>
    );
  }
  if (error && !subscription) {
    return (
      <alert_1.Alert>
        <lucide_react_1.AlertTriangle className="h-4 w-4" />
        <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  if (!subscription) {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Nenhuma Assinatura Encontrada</card_1.CardTitle>
          <card_1.CardDescription>
            Você ainda não possui uma assinatura ativa. Escolha um plano para começar.
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <button_1.Button onClick={onUpgrade} className="w-full">
            Escolher Plano
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {subscription.status_info.action_required && (
        <alert_1.Alert
          variant={subscription.status_info.status === "trial_ending" ? "default" : "destructive"}
        >
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription>{subscription.status_info.message}</alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Subscription Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Plano Atual</card_1.CardTitle>
            {getPlanIcon(subscription.plan.name)}
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{subscription.plan.display_name}</div>
            <div className="flex items-center space-x-2 mt-2">
              {getStatusBadge(subscription.status)}
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Próximo Pagamento</card_1.CardTitle>
            <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {subscription.status === "trial" && subscription.formatted_dates.trial_end
                ? subscription.formatted_dates.trial_end
                : subscription.formatted_dates.next_billing_date || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription.status === "trial" ? "Fim do teste" : "Data de cobrança"}
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Valor Mensal</card_1.CardTitle>
            <lucide_react_1.CreditCard className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {(0, utils_1.formatCurrency)(subscription.plan.price_monthly)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ciclo:{" "}
              {subscription.billing_cycle === "monthly"
                ? "Mensal"
                : subscription.billing_cycle === "quarterly"
                  ? "Trimestral"
                  : "Anual"}
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Usuários</card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {((_b = subscription.usage_stats.max_users) === null || _b === void 0
                ? void 0
                : _b.current) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              de{" "}
              {((_c = subscription.usage_stats.max_users) === null || _c === void 0
                ? void 0
                : _c.limit) === "Unlimited"
                ? "ilimitados"
                : ((_d = subscription.usage_stats.max_users) === null || _d === void 0
                    ? void 0
                    : _d.limit) || 0}
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Usage Statistics */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Uso do Plano</card_1.CardTitle>
          <card_1.CardDescription>
            Acompanhe o uso dos recursos do seu plano atual
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          {Object.entries(subscription.usage_stats).map(function (_a) {
            var key = _a[0],
              usage = _a[1];
            var isUnlimited = usage.limit === "Unlimited" || usage.limit === -1;
            var percentage = isUnlimited ? 0 : usage.percentage;
            var labels = {
              max_patients: "Pacientes",
              max_appointments_per_month: "Consultas/mês",
              max_users: "Usuários",
              storage_gb: "Armazenamento (GB)",
              sms_notifications: "SMS/mês",
              email_notifications: "E-mails/mês",
            };
            return (
              <div key={key} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{labels[key] || key}</span>
                  <span>
                    {usage.current} / {isUnlimited ? "∞" : usage.limit}
                  </span>
                </div>
                <progress_1.Progress
                  value={percentage}
                  className="h-2"
                  // Add color coding based on usage
                  // @ts-ignore
                  variant={
                    percentage > 90 ? "destructive" : percentage > 70 ? "warning" : "default"
                  }
                />
              </div>
            );
          })}
        </card_1.CardContent>
      </card_1.Card>

      {/* Feature List */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Recursos do Plano</card_1.CardTitle>
          <card_1.CardDescription>
            Funcionalidades incluídas no seu plano {subscription.plan.display_name}
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(subscription.plan.features).map(function (_a) {
              var feature = _a[0],
                enabled = _a[1];
              var featureLabels = {
                appointment_management: "Gestão de Consultas",
                patient_records: "Prontuários Digitais",
                basic_reports: "Relatórios Básicos",
                advanced_reports: "Relatórios Avançados",
                bi_dashboard: "Dashboard BI",
                inventory_management: "Gestão de Estoque",
                financial_management: "Gestão Financeira",
                email_notifications: "Notificações por E-mail",
                sms_notifications: "Notificações por SMS",
                mobile_app: "Aplicativo Mobile",
                api_access: "Acesso à API",
                priority_support: "Suporte Prioritário",
                lgpd_compliance: "Conformidade LGPD",
              };
              return (
                <div key={feature} className="flex items-center space-x-2">
                  {enabled
                    ? <lucide_react_1.Check className="h-4 w-4 text-green-500" />
                    : <lucide_react_1.X className="h-4 w-4 text-gray-400" />}
                  <span className={enabled ? "text-foreground" : "text-muted-foreground"}>
                    {featureLabels[feature] || feature}
                  </span>
                </div>
              );
            })}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button_1.Button onClick={onUpgrade} className="flex-1">
          <lucide_react_1.TrendingUp className="mr-2 h-4 w-4" />
          Fazer Upgrade
        </button_1.Button>
        <button_1.Button variant="outline" onClick={onManageBilling} className="flex-1">
          <lucide_react_1.CreditCard className="mr-2 h-4 w-4" />
          Gerenciar Cobrança
        </button_1.Button>
        {subscription.status === "active" && !subscription.cancel_at_period_end && (
          <button_1.Button variant="destructive" onClick={onCancelSubscription} className="flex-1">
            <lucide_react_1.X className="mr-2 h-4 w-4" />
            Cancelar Assinatura
          </button_1.Button>
        )}
      </div>
    </div>
  );
}
