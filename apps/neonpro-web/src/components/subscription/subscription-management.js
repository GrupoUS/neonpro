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
exports.SubscriptionManagement = SubscriptionManagement;
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
var use_subscription_1 = require("@/hooks/use-subscription");
var use_subscription_status_1 = require("@/hooks/use-subscription-status");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var status_indicator_1 = require("./status-indicator");
var plans = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    description: "Perfect for small clinics just getting started",
    features: [
      "Up to 100 patients",
      "Basic appointment scheduling",
      "Patient records management",
      "Email notifications",
      "Basic reports",
    ],
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 79,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    description: "Everything you need to grow your clinic",
    features: [
      "Unlimited patients",
      "Advanced scheduling",
      "Treatment plans",
      "Financial tracking",
      "Advanced analytics",
      "SMS notifications",
      "Custom forms",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 149,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    description: "For large clinics and multi-location practices",
    features: [
      "Everything in Professional",
      "Multi-location support",
      "Team collaboration",
      "Advanced integrations",
      "Custom branding",
      "Priority support",
      "API access",
    ],
    popular: false,
  },
];
function SubscriptionManagement() {
  var _this = this;
  var _a = (0, use_subscription_1.useSubscription)(),
    subscription = _a.subscription,
    refreshSubscription = _a.refreshSubscription;
  var _b = (0, use_subscription_status_1.useSubscriptionStatus)(),
    hasAccess = _b.hasAccess,
    isActive = _b.isActive,
    isTrialing = _b.isTrialing,
    isPastDue = _b.isPastDue,
    inGracePeriod = _b.inGracePeriod,
    currentPeriodEnd = _b.currentPeriodEnd,
    cancelAtPeriodEnd = _b.cancelAtPeriodEnd,
    status = _b.status;
  var _c = (0, react_1.useState)(false),
    isLoading = _c[0],
    setIsLoading = _c[1];
  var handleSubscribe = function (priceId) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, url, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!priceId) {
              alert("Price ID not configured for this plan");
              return [2 /*return*/];
            }
            setIsLoading(true);
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
                  priceId: priceId,
                  successUrl: "".concat(
                    window.location.origin,
                    "/dashboard/subscription?success=true",
                  ),
                  cancelUrl: "".concat(
                    window.location.origin,
                    "/dashboard/subscription?canceled=true",
                  ),
                }),
              }),
            ];
          case 2:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 3:
            url = _a.sent().url;
            if (url) {
              window.location.href = url;
            } else {
              throw new Error("No checkout URL returned");
            }
            return [3 /*break*/, 6];
          case 4:
            error_1 = _a.sent();
            console.error("Error creating checkout session:", error_1);
            alert("Failed to start checkout process. Please try again.");
            return [3 /*break*/, 6];
          case 5:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleManageBilling = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, url, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setIsLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, 5, 6]);
            return [
              4 /*yield*/,
              fetch("/api/stripe/create-portal-session", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  returnUrl: "".concat(window.location.origin, "/dashboard/subscription"),
                }),
              }),
            ];
          case 2:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 3:
            url = _a.sent().url;
            if (url) {
              window.location.href = url;
            } else {
              throw new Error("No portal URL returned");
            }
            return [3 /*break*/, 6];
          case 4:
            error_2 = _a.sent();
            console.error("Error creating portal session:", error_2);
            alert("Failed to open billing portal. Please try again.");
            return [3 /*break*/, 6];
          case 5:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  // Check for success/cancel parameters
  (0, react_1.useEffect)(
    function () {
      var urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("success")) {
        refreshSubscription();
      }
    },
    [refreshSubscription],
  );
  var currentPlan = plans.find(function (plan) {
    return plan.priceId === subscription.priceId;
  });
  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <status_indicator_1.SubscriptionStatusIndicator showFullCard className="h-fit" />

        {hasAccess && (
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.CreditCard className="h-5 w-5" />
                Current Plan
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              {currentPlan
                ? <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{currentPlan.name}</h3>
                        <p className="text-sm text-muted-foreground">${currentPlan.price}/month</p>
                      </div>
                      {currentPlan.popular && (
                        <badge_1.Badge variant="default">Popular</badge_1.Badge>
                      )}
                    </div>

                    {currentPeriodEnd && (
                      <div className="flex items-center gap-2 text-sm">
                        <lucide_react_1.Calendar className="h-4 w-4" />
                        <span>
                          {cancelAtPeriodEnd ? "Expires" : "Renews"} on{" "}
                          {currentPeriodEnd.toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    )}
                  </>
                : <p className="text-sm text-muted-foreground">Plan details not available</p>}

              <button_1.Button
                onClick={handleManageBilling}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Manage Billing
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>
        )}
      </div>

      {/* Grace Period Warning */}
      {inGracePeriod && (
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertCircle className="h-4 w-4" />
          <alert_1.AlertTitle>Payment Required</alert_1.AlertTitle>
          <alert_1.AlertDescription>
            Your subscription payment is overdue. Please update your payment method to continue
            accessing premium features.
            <button_1.Button
              onClick={handleManageBilling}
              size="sm"
              variant="outline"
              className="ml-2"
            >
              Update Payment
            </button_1.Button>
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Trial Info */}
      {isTrialing && (
        <alert_1.Alert>
          <lucide_react_1.Clock className="h-4 w-4" />
          <alert_1.AlertTitle>Free Trial Active</alert_1.AlertTitle>
          <alert_1.AlertDescription>
            You're currently on a free trial.
            {currentPeriodEnd && (
              <> Your trial expires on {currentPeriodEnd.toLocaleDateString("pt-BR")}.</>
            )}{" "}
            Upgrade now to continue accessing all features after your trial ends.
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Available Plans */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Choose Your Plan</h2>
          <p className="text-muted-foreground">
            {hasAccess
              ? "Upgrade or change your subscription plan"
              : "Select a plan to get started with NeonPro"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map(function (plan) {
            var isCurrentPlan = plan.priceId === subscription.priceId;
            return (
              <card_1.Card
                key={plan.id}
                className={"relative ".concat(plan.popular ? "border-primary" : "")}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <badge_1.Badge variant="default">Most Popular</badge_1.Badge>
                  </div>
                )}

                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {isCurrentPlan && <badge_1.Badge variant="secondary">Current</badge_1.Badge>}
                  </card_1.CardTitle>
                  <card_1.CardDescription>{plan.description}</card_1.CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </card_1.CardHeader>

                <card_1.CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map(function (feature, index) {
                      return (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
                          {feature}
                        </li>
                      );
                    })}
                  </ul>

                  <separator_1.Separator />

                  <button_1.Button
                    onClick={function () {
                      return handleSubscribe(plan.priceId);
                    }}
                    disabled={isLoading || isCurrentPlan || !plan.priceId}
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {isCurrentPlan ? "Current Plan" : hasAccess ? "Switch Plan" : "Get Started"}
                  </button_1.Button>
                </card_1.CardContent>
              </card_1.Card>
            );
          })}
        </div>
      </div>

      {/* Features Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Why Choose NeonPro?</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <lucide_react_1.Users className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Patient Management</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete patient records, appointment history, and treatment tracking.
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <lucide_react_1.Calendar className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Smart Scheduling</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Advanced appointment scheduling with automated reminders.
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <lucide_react_1.BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Analytics</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Detailed reports and insights to grow your clinic business.
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <lucide_react_1.Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Secure & Compliant</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                HIPAA-compliant platform with enterprise-grade security.
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>
    </div>
  );
}
