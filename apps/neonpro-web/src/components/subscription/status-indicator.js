"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatusIndicator = SubscriptionStatusIndicator;
exports.SubscriptionBadge = SubscriptionBadge;
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var use_subscription_status_1 = require("@/hooks/use-subscription-status");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
function SubscriptionStatusIndicator(_a) {
  var _b = _a.showFullCard,
    showFullCard = _b === void 0 ? false : _b,
    className = _a.className;
  var _c = (0, use_subscription_status_1.useSubscriptionStatus)(),
    isActive = _c.isActive,
    isTrialing = _c.isTrialing,
    isPastDue = _c.isPastDue,
    isCanceled = _c.isCanceled,
    hasAccess = _c.hasAccess,
    inGracePeriod = _c.inGracePeriod,
    isLoading = _c.isLoading,
    status = _c.status,
    currentPeriodEnd = _c.currentPeriodEnd,
    cancelAtPeriodEnd = _c.cancelAtPeriodEnd,
    message = _c.message,
    error = _c.error;
  if (isLoading) {
    return (
      <div className={(0, utils_1.cn)("flex items-center gap-2", className)}>
        <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" />
        <span className="text-sm text-muted-foreground">Checking subscription...</span>
      </div>
    );
  }
  if (error) {
    return (
      <alert_1.Alert variant="destructive" className={className}>
        <lucide_react_1.AlertCircle className="h-4 w-4" />
        <alert_1.AlertTitle>Subscription Error</alert_1.AlertTitle>
        <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  var getStatusConfig = function () {
    if (isActive) {
      return {
        icon: lucide_react_1.CheckCircle,
        color: "green",
        label: "Active",
        variant: "default",
        description: cancelAtPeriodEnd
          ? "Will cancel at period end"
          : "Your subscription is active",
      };
    }
    if (isTrialing) {
      return {
        icon: lucide_react_1.Clock,
        color: "blue",
        label: "Trial",
        variant: "secondary",
        description: "You are on a trial period",
      };
    }
    if (isPastDue && inGracePeriod) {
      return {
        icon: lucide_react_1.AlertCircle,
        color: "yellow",
        label: "Payment Due",
        variant: "destructive",
        description: "Payment is overdue - please update your payment method",
      };
    }
    if (isCanceled || !hasAccess) {
      return {
        icon: lucide_react_1.XCircle,
        color: "red",
        label: "Inactive",
        variant: "destructive",
        description: "Subscription required for premium features",
      };
    }
    return {
      icon: lucide_react_1.AlertCircle,
      color: "gray",
      label: "Unknown",
      variant: "secondary",
      description: "Unable to determine subscription status",
    };
  };
  var statusConfig = getStatusConfig();
  var StatusIcon = statusConfig.icon;
  if (!showFullCard) {
    return (
      <div className={(0, utils_1.cn)("flex items-center gap-2", className)}>
        <StatusIcon
          className={(0, utils_1.cn)(
            "h-4 w-4",
            statusConfig.color === "green" && "text-green-600",
            statusConfig.color === "blue" && "text-blue-600",
            statusConfig.color === "yellow" && "text-yellow-600",
            statusConfig.color === "red" && "text-red-600",
            statusConfig.color === "gray" && "text-gray-600",
          )}
        />
        <badge_1.Badge variant={statusConfig.variant}>{statusConfig.label}</badge_1.Badge>
        {inGracePeriod && (
          <badge_1.Badge variant="outline" className="text-xs">
            Grace Period
          </badge_1.Badge>
        )}
      </div>
    );
  }
  return (
    <card_1.Card className={className}>
      <card_1.CardHeader className="pb-3">
        <card_1.CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <StatusIcon
              className={(0, utils_1.cn)(
                "h-5 w-5",
                statusConfig.color === "green" && "text-green-600",
                statusConfig.color === "blue" && "text-blue-600",
                statusConfig.color === "yellow" && "text-yellow-600",
                statusConfig.color === "red" && "text-red-600",
                statusConfig.color === "gray" && "text-gray-600",
              )}
            />
            Subscription Status
          </span>
          <badge_1.Badge variant={statusConfig.variant}>{statusConfig.label}</badge_1.Badge>
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{message || statusConfig.description}</p>

        {currentPeriodEnd && (
          <div className="text-sm">
            <span className="font-medium">{cancelAtPeriodEnd ? "Ends on: " : "Renews on: "}</span>
            <span className="text-muted-foreground">
              {currentPeriodEnd.toLocaleDateString("pt-BR")}
            </span>
          </div>
        )}

        {inGracePeriod && (
          <alert_1.Alert variant="destructive">
            <lucide_react_1.AlertCircle className="h-4 w-4" />
            <alert_1.AlertTitle>Payment Required</alert_1.AlertTitle>
            <alert_1.AlertDescription>
              Your subscription payment is overdue. Please update your payment method to continue
              accessing premium features.
            </alert_1.AlertDescription>
          </alert_1.Alert>
        )}

        {!hasAccess && (
          <div className="space-y-2">
            <alert_1.Alert>
              <lucide_react_1.AlertCircle className="h-4 w-4" />
              <alert_1.AlertTitle>Premium Features Locked</alert_1.AlertTitle>
              <alert_1.AlertDescription>
                Upgrade your subscription to access all NeonPro features.
              </alert_1.AlertDescription>
            </alert_1.Alert>
            <div className="flex gap-2">
              <button_1.Button asChild size="sm">
                <link_1.default href="/dashboard/subscription">Upgrade Now</link_1.default>
              </button_1.Button>
              <button_1.Button asChild variant="outline" size="sm">
                <link_1.default href="/dashboard/billing">View Billing</link_1.default>
              </button_1.Button>
            </div>
          </div>
        )}

        {isPastDue && inGracePeriod && (
          <button_1.Button asChild className="w-full">
            <link_1.default href="/dashboard/billing">Update Payment Method</link_1.default>
          </button_1.Button>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
// Simpler component for navigation bars
function SubscriptionBadge(_a) {
  var className = _a.className;
  var _b = (0, use_subscription_status_1.useSubscriptionStatus)(),
    hasAccess = _b.hasAccess,
    isLoading = _b.isLoading,
    status = _b.status;
  if (isLoading) {
    return (
      <div className={(0, utils_1.cn)("h-6 w-16 bg-gray-200 rounded animate-pulse", className)} />
    );
  }
  if (!hasAccess) {
    return (
      <badge_1.Badge variant="outline" className={(0, utils_1.cn)("text-xs", className)}>
        <lucide_react_1.XCircle className="h-3 w-3 mr-1" />
        Upgrade
      </badge_1.Badge>
    );
  }
  if (status === "trialing") {
    return (
      <badge_1.Badge variant="secondary" className={(0, utils_1.cn)("text-xs", className)}>
        <lucide_react_1.Clock className="h-3 w-3 mr-1" />
        Trial
      </badge_1.Badge>
    );
  }
  return (
    <badge_1.Badge variant="default" className={(0, utils_1.cn)("text-xs", className)}>
      <lucide_react_1.CheckCircle className="h-3 w-3 mr-1" />
      Pro
    </badge_1.Badge>
  );
}
