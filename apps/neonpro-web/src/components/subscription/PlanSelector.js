/**
 * Plan Selector Component
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
 */
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PlanSelector;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var switch_1 = require("@/components/ui/switch");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
function PlanSelector(_a) {
  var currentPlanId = _a.currentPlanId,
    onSelectPlan = _a.onSelectPlan,
    _b = _a.isUpgrade,
    isUpgrade = _b === void 0 ? false : _b,
    _c = _a.loading,
    loading = _c === void 0 ? false : _c;
  var _d = (0, react_1.useState)([]),
    plans = _d[0],
    setPlans = _d[1];
  var _e = (0, react_1.useState)("monthly"),
    billingCycle = _e[0],
    setBillingCycle = _e[1];
  var _f = (0, react_1.useState)(true),
    fetchLoading = _f[0],
    setFetchLoading = _f[1];
  (0, react_1.useEffect)(() => {
    fetchPlans();
  }, []);
  var fetchPlans = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, result, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            return [4 /*yield*/, fetch("/api/subscription/plans")];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            if (result.success) {
              setPlans(result.data);
            }
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Error fetching plans:", error_1);
            return [3 /*break*/, 5];
          case 4:
            setFetchLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var getPlanIcon = (planName) => {
    switch (planName) {
      case "basic":
        return <lucide_react_1.Star className="h-6 w-6 text-blue-500" />;
      case "professional":
        return <lucide_react_1.Rocket className="h-6 w-6 text-purple-500" />;
      case "enterprise":
        return <lucide_react_1.Crown className="h-6 w-6 text-yellow-500" />;
      default:
        return <lucide_react_1.Star className="h-6 w-6 text-gray-500" />;
    }
  };
  var getPlanPrice = (plan) => {
    switch (billingCycle) {
      case "monthly":
        return { price: plan.price_monthly, formatted: plan.formatted_prices.monthly };
      case "quarterly":
        return { price: plan.price_quarterly, formatted: plan.formatted_prices.quarterly };
      case "yearly":
        return { price: plan.price_yearly, formatted: plan.formatted_prices.yearly };
    }
  };
  var getSavings = (plan) => {
    switch (billingCycle) {
      case "quarterly":
        return plan.savings.quarterly;
      case "yearly":
        return plan.savings.yearly;
      default:
        return 0;
    }
  };
  var getFeaturesList = (plan) => {
    var featureLabels = {
      appointment_management: {
        label: "Gestão de Consultas",
        icon: <lucide_react_1.BarChart3 className="h-4 w-4" />,
      },
      patient_records: {
        label: "Prontuários Digitais",
        icon: <lucide_react_1.Users className="h-4 w-4" />,
      },
      basic_reports: {
        label: "Relatórios Básicos",
        icon: <lucide_react_1.BarChart3 className="h-4 w-4" />,
      },
      advanced_reports: {
        label: "Relatórios Avançados",
        icon: <lucide_react_1.BarChart3 className="h-4 w-4" />,
      },
      bi_dashboard: {
        label: "Dashboard BI",
        icon: <lucide_react_1.BarChart3 className="h-4 w-4" />,
      },
      inventory_management: {
        label: "Gestão de Estoque",
        icon: <lucide_react_1.BarChart3 className="h-4 w-4" />,
      },
      financial_management: {
        label: "Gestão Financeira",
        icon: <lucide_react_1.BarChart3 className="h-4 w-4" />,
      },
      email_notifications: {
        label: "Notificações E-mail",
        icon: <lucide_react_1.Zap className="h-4 w-4" />,
      },
      sms_notifications: {
        label: "Notificações SMS",
        icon: <lucide_react_1.Zap className="h-4 w-4" />,
      },
      mobile_app: { label: "App Mobile", icon: <lucide_react_1.Zap className="h-4 w-4" /> },
      api_access: { label: "Acesso à API", icon: <lucide_react_1.Zap className="h-4 w-4" /> },
      priority_support: {
        label: "Suporte Prioritário",
        icon: <lucide_react_1.Shield className="h-4 w-4" />,
      },
      lgpd_compliance: {
        label: "Conformidade LGPD",
        icon: <lucide_react_1.Shield className="h-4 w-4" />,
      },
      multi_location: {
        label: "Múltiplas Localizações",
        icon: <lucide_react_1.BarChart3 className="h-4 w-4" />,
      },
      custom_templates: {
        label: "Templates Personalizados",
        icon: <lucide_react_1.BarChart3 className="h-4 w-4" />,
      },
    };
    return Object.entries(plan.features)
      .filter((_a) => {
        var _ = _a[0],
          enabled = _a[1];
        return enabled;
      })
      .map((_a) => {
        var feature = _a[0],
          _ = _a[1];
        return (
          featureLabels[feature] || {
            label: feature,
            icon: <lucide_react_1.Check className="h-4 w-4" />,
          }
        );
      })
      .slice(0, 8); // Show top 8 features
  };
  var getLimitsText = (plan) => {
    var limits = plan.limits;
    var limitTexts = [];
    if (limits.max_patients !== undefined) {
      limitTexts.push(
        "".concat(limits.max_patients === -1 ? "Ilimitados" : limits.max_patients, " pacientes"),
      );
    }
    if (limits.max_users !== undefined) {
      limitTexts.push(
        "".concat(limits.max_users === -1 ? "Ilimitados" : limits.max_users, " usu\u00E1rios"),
      );
    }
    if (limits.storage_gb !== undefined) {
      limitTexts.push("".concat(limits.storage_gb, "GB armazenamento"));
    }
    return limitTexts.slice(0, 3).join(" • ");
  };
  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {__spreadArray([], Array(3), true).map((_, i) => (
            <card_1.Card key={i} className="animate-pulse">
              <card_1.CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  {__spreadArray([], Array(6), true).map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center space-x-4 p-4 bg-muted rounded-lg">
        <label_1.Label
          htmlFor="billing-monthly"
          className={billingCycle === "monthly" ? "font-semibold" : ""}
        >
          Mensal
        </label_1.Label>
        <switch_1.Switch
          id="billing-toggle"
          checked={billingCycle !== "monthly"}
          onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
        />
        <label_1.Label
          htmlFor="billing-yearly"
          className={billingCycle === "yearly" ? "font-semibold" : ""}
        >
          Anual
        </label_1.Label>
        {billingCycle === "yearly" && (
          <badge_1.Badge variant="secondary" className="ml-2">
            Economize até 20%
          </badge_1.Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          var planPrice = getPlanPrice(plan);
          var savings = getSavings(plan);
          var features = getFeaturesList(plan);
          var limits = getLimitsText(plan);
          var isCurrentPlan = plan.id === currentPlanId;
          return (
            <card_1.Card
              key={plan.id}
              className={"relative ".concat(plan.is_featured ? "border-primary shadow-lg" : "")}
            >
              {plan.is_featured && (
                <badge_1.Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  Mais Popular
                </badge_1.Badge>
              )}

              <card_1.CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">{getPlanIcon(plan.name)}</div>
                <card_1.CardTitle className="text-xl">{plan.display_name}</card_1.CardTitle>
                <card_1.CardDescription className="text-sm px-2">
                  {plan.description}
                </card_1.CardDescription>
              </card_1.CardHeader>

              <card_1.CardContent className="space-y-4">
                {/* Price */}
                <div className="text-center">
                  <div className="text-3xl font-bold">{planPrice.formatted}</div>
                  <div className="text-sm text-muted-foreground">
                    por{" "}
                    {billingCycle === "monthly"
                      ? "mês"
                      : billingCycle === "quarterly"
                        ? "trimestre"
                        : "ano"}
                  </div>
                  {savings > 0 && (
                    <badge_1.Badge variant="outline" className="mt-1">
                      Economize {savings}%
                    </badge_1.Badge>
                  )}
                </div>

                {/* Limits */}
                <div className="text-center text-sm text-muted-foreground border-t pt-4">
                  {limits}
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <lucide_react_1.Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature.label}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrentPlan
                    ? <button_1.Button variant="outline" className="w-full" disabled>
                        Plano Atual
                      </button_1.Button>
                    : <button_1.Button
                        className="w-full"
                        variant={plan.is_featured ? "default" : "outline"}
                        onClick={() => onSelectPlan(plan.id, billingCycle)}
                        disabled={loading}
                      >
                        {isUpgrade ? "Fazer Upgrade" : "Selecionar Plano"}
                      </button_1.Button>}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>• Todos os planos incluem suporte técnico e atualizações automáticas</p>
        <p>• Cancele a qualquer momento • Política de reembolso de 30 dias</p>
        <p>• Conformidade total com LGPD e regulamentações de saúde</p>
      </div>
    </div>
  );
}
