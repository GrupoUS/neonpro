/**
 * Subscription Status Widget Component
 *
 * Dashboard widget that shows current subscription status, usage metrics,
 * and quick actions. Designed for dashboard integration.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatusWidget = SubscriptionStatusWidget;
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var use_subscription_status_1 = require("../../hooks/use-subscription-status");
var badge_1 = require("../ui/badge");
var button_1 = require("../ui/button");
var card_1 = require("../ui/card");
var progress_1 = require("../ui/progress");
var separator_1 = require("../ui/separator");
var subscription_status_indicator_1 = require("./subscription-status-indicator");
var upgrade_prompt_1 = require("./upgrade-prompt");
function SubscriptionStatusWidget(_a) {
  var className = _a.className,
    _b = _a.showUsageMetrics,
    showUsageMetrics = _b === void 0 ? true : _b,
    _c = _a.showQuickActions,
    showQuickActions = _c === void 0 ? true : _c,
    onUpgrade = _a.onUpgrade,
    onManageBilling = _a.onManageBilling,
    _d = _a.variant,
    variant = _d === void 0 ? "default" : _d;
  var _e = (0, react_1.useState)(false),
    showUpgradeModal = _e[0],
    setShowUpgradeModal = _e[1];
  var _f = (0, use_subscription_status_1.useSubscriptionStatus)(),
    status = _f.status,
    tier = _f.tier,
    features = _f.features,
    nextBilling = _f.nextBilling,
    gracePeriodEnd = _f.gracePeriodEnd,
    isLoading = _f.isLoading,
    error = _f.error,
    refresh = _f.refresh;
  var getStatusColor = function () {
    switch (status) {
      case "active":
        return "text-green-600";
      case "trialing":
        return "text-blue-600";
      case "past_due":
        return "text-orange-600";
      case "cancelled":
      case "canceled":
      case "expired":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };
  var getNextActionDate = function () {
    if (status === "trialing") return nextBilling;
    if (status === "past_due" && gracePeriodEnd) return gracePeriodEnd;
    if (status === "active") return nextBilling;
    return null;
  };
  var getActionDateLabel = function () {
    if (status === "trialing") return "Trial ends";
    if (status === "past_due") return "Grace period ends";
    if (status === "active") return "Next billing";
    return null;
  };
  var formatDate = function (dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  var getDaysUntil = function (dateString) {
    var targetDate = new Date(dateString);
    var now = new Date();
    var diffTime = targetDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  // Mock usage metrics - in real app, these would come from API
  var usageMetrics = [
    { label: "Patients", current: 87, limit: 100, icon: lucide_react_1.Users },
    { label: "Storage", current: 2.3, limit: 5, icon: lucide_react_1.TrendingUp, unit: "GB" },
  ];
  if (variant === "compact") {
    return (
      <card_1.Card className={(0, utils_1.cn)("w-full", className)}>
        <card_1.CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <subscription_status_indicator_1.SubscriptionStatusIndicator
                variant="minimal"
                className="scale-75"
              />
              <div>
                <p className="font-medium">{tier || "Free"} Plan</p>
                <p className={(0, utils_1.cn)("text-sm", getStatusColor())}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </p>
              </div>
            </div>
            {status !== "active" && (
              <button_1.Button
                size="sm"
                onClick={function () {
                  return setShowUpgradeModal(true);
                }}
              >
                <lucide_react_1.Crown className="h-3 w-3 mr-1" />
                Upgrade
              </button_1.Button>
            )}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <>
      <card_1.Card className={(0, utils_1.cn)("w-full", className)}>
        <card_1.CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle className="flex items-center space-x-2">
                <lucide_react_1.Crown className="h-5 w-5 text-primary" />
                <span>Subscription Status</span>
              </card_1.CardTitle>
              <card_1.CardDescription>Manage your subscription and usage</card_1.CardDescription>
            </div>
            <subscription_status_indicator_1.SubscriptionStatusIndicator variant="minimal" />
          </div>
        </card_1.CardHeader>

        <card_1.CardContent className="space-y-6">
          {/* Subscription Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="font-semibold text-lg">{tier || "Free"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <badge_1.Badge
                variant={status === "active" ? "default" : "secondary"}
                className={getStatusColor()}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </badge_1.Badge>
            </div>
          </div>

          {/* Next Action Date */}
          {getNextActionDate() && (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{getActionDateLabel()}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatDate(getNextActionDate())}</p>
                  <p className="text-xs text-muted-foreground">
                    {getDaysUntil(getNextActionDate())} days
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Usage Metrics */}
          {showUsageMetrics && variant === "detailed" && (
            <div>
              <h4 className="font-medium mb-3">Usage Overview</h4>
              <div className="space-y-3">
                {usageMetrics.map(function (metric, index) {
                  var Icon = metric.icon;
                  var percentage = Math.round((metric.current / metric.limit) * 100);
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{metric.label}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {metric.current}
                          {metric.unit || ""} / {metric.limit}
                          {metric.unit || ""}
                        </span>
                      </div>
                      <progress_1.Progress value={percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">{percentage}% used</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Features */}
          {variant === "detailed" && features.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Active Features</h4>
              <div className="flex flex-wrap gap-2">
                {features.slice(0, 6).map(function (feature, index) {
                  return (
                    <badge_1.Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </badge_1.Badge>
                  );
                })}
                {features.length > 6 && (
                  <badge_1.Badge variant="outline" className="text-xs">
                    +{features.length - 6} more
                  </badge_1.Badge>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {showQuickActions && (
            <>
              <separator_1.Separator />
              <div className="flex flex-col gap-2">
                {status !== "active" && (
                  <button_1.Button
                    onClick={function () {
                      return setShowUpgradeModal(true);
                    }}
                    className="w-full"
                  >
                    <lucide_react_1.Crown className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </button_1.Button>
                )}

                <div className="flex gap-2">
                  <button_1.Button variant="outline" onClick={onManageBilling} className="flex-1">
                    <lucide_react_1.CreditCard className="h-4 w-4 mr-2" />
                    Billing
                  </button_1.Button>

                  <button_1.Button variant="outline" onClick={refresh} className="flex-1">
                    <lucide_react_1.Zap className="h-4 w-4 mr-2" />
                    Refresh
                  </button_1.Button>
                </div>
              </div>
            </>
          )}
        </card_1.CardContent>
      </card_1.Card>

      {/* Upgrade Modal */}
      <upgrade_prompt_1.UpgradePrompt
        isOpen={showUpgradeModal}
        onClose={function () {
          return setShowUpgradeModal(false);
        }}
        reason={status === "trialing" ? "trial_ended" : "expired"}
        currentPlan={tier || "Free"}
        suggestedPlan="Professional"
        onUpgrade={onUpgrade}
      />
    </>
  );
}
exports.default = SubscriptionStatusWidget;
