/**
 * Subscription Banner Component
 *
 * Displays subscription-related notifications at the top of pages.
 * Shows trial remaining time, payment reminders, and upgrade prompts.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionBanner = SubscriptionBanner;
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var use_subscription_status_1 = require("../../hooks/use-subscription-status");
var badge_1 = require("../ui/badge");
var button_1 = require("../ui/button");
var progress_1 = require("../ui/progress");
function SubscriptionBanner(_a) {
  var className = _a.className,
    onUpgrade = _a.onUpgrade,
    onDismiss = _a.onDismiss,
    _b = _a.dismissible,
    dismissible = _b === void 0 ? true : _b,
    _c = _a.showProgress,
    showProgress = _c === void 0 ? true : _c,
    _d = _a.compact,
    compact = _d === void 0 ? false : _d;
  var _e = (0, react_1.useState)(false),
    dismissed = _e[0],
    setDismissed = _e[1];
  var _f = (0, use_subscription_status_1.useSubscriptionStatus)(),
    status = _f.status,
    tier = _f.tier,
    gracePeriodEnd = _f.gracePeriodEnd,
    nextBilling = _f.nextBilling,
    isLoading = _f.isLoading;
  var handleDismiss = function () {
    setDismissed(true);
    onDismiss === null || onDismiss === void 0 ? void 0 : onDismiss();
  };
  // Don't show if loading, dismissed, or subscription is active
  if (isLoading || dismissed || status === "active") {
    return null;
  }
  var getBannerConfig = function () {
    var now = new Date();
    switch (status) {
      case "trialing": {
        var trialEnd = nextBilling ? new Date(nextBilling) : null;
        var daysRemaining = trialEnd
          ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;
        return {
          variant: daysRemaining <= 3 ? "urgent" : "info",
          icon: daysRemaining <= 3 ? lucide_react_1.AlertTriangle : lucide_react_1.Sparkles,
          title: "Free Trial Active",
          message:
            daysRemaining > 0
              ? "".concat(daysRemaining, " days remaining in your free trial")
              : "Your free trial expires today",
          badge: "".concat(daysRemaining, " days left"),
          ctaText: "Choose Plan",
          progress: trialEnd ? Math.max(0, 100 - (daysRemaining / 14) * 100) : 100,
        };
      }
      case "past_due": {
        var graceEnd = gracePeriodEnd ? new Date(gracePeriodEnd) : null;
        var daysRemaining = graceEnd
          ? Math.max(0, Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;
        return {
          variant: "urgent",
          icon: lucide_react_1.AlertTriangle,
          title: "Payment Overdue",
          message:
            daysRemaining > 0
              ? "Update payment method within ".concat(
                  daysRemaining,
                  " days to avoid service interruption",
                )
              : "Update your payment method immediately to restore access",
          badge: "Action Required",
          ctaText: "Update Payment",
          progress: graceEnd ? Math.max(0, 100 - (daysRemaining / 7) * 100) : 100,
        };
      }
      case "cancelled":
      case "canceled": {
        var graceEnd = gracePeriodEnd ? new Date(gracePeriodEnd) : null;
        var daysRemaining = graceEnd
          ? Math.max(0, Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;
        return {
          variant: "urgent",
          icon: lucide_react_1.AlertTriangle,
          title: "Subscription Cancelled",
          message:
            daysRemaining > 0
              ? "Access will end in ".concat(
                  daysRemaining,
                  " days. Reactivate to continue using all features",
                )
              : "Your subscription has ended. Reactivate to restore access",
          badge: "Cancelled",
          ctaText: "Reactivate",
          progress: graceEnd ? Math.max(0, 100 - (daysRemaining / 30) * 100) : 100,
        };
      }
      case "expired": {
        return {
          variant: "urgent",
          icon: lucide_react_1.AlertTriangle,
          title: "Subscription Expired",
          message:
            "Your subscription has expired. Renew now to continue accessing premium features",
          badge: "Expired",
          ctaText: "Renew Now",
          progress: 100,
        };
      }
      case "unpaid":
      case "incomplete": {
        return {
          variant: "warning",
          icon: lucide_react_1.Clock,
          title: "Payment Required",
          message: "Complete your payment to activate your subscription",
          badge: "Payment Pending",
          ctaText: "Complete Payment",
          progress: 50,
        };
      }
      default:
        return null;
    }
  };
  var config = getBannerConfig();
  if (!config) return null;
  var variantStyles = {
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-900",
      badge: "bg-blue-100 text-blue-800",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-900",
      badge: "bg-yellow-100 text-yellow-800",
      button: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    urgent: {
      container: "bg-red-50 border-red-200 text-red-900",
      badge: "bg-red-100 text-red-800",
      button: "bg-red-600 hover:bg-red-700 text-white",
    },
  };
  var styles = variantStyles[config.variant];
  var Icon = config.icon;
  if (compact) {
    return (
      <div
        className={(0, utils_1.cn)(
          "flex items-center justify-between px-4 py-2 border rounded-lg",
          styles.container,
          className,
        )}
      >
        <div className="flex items-center space-x-3">
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">{config.title}</span>
          <badge_1.Badge variant="secondary" className={styles.badge}>
            {config.badge}
          </badge_1.Badge>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button
            size="sm"
            onClick={onUpgrade}
            className={(0, utils_1.cn)("text-xs", styles.button)}
          >
            {config.ctaText}
          </button_1.Button>
          {dismissible && (
            <button_1.Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-current opacity-70 hover:opacity-100"
            >
              <lucide_react_1.X className="h-3 w-3" />
            </button_1.Button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={(0, utils_1.cn)("relative border rounded-lg p-4", styles.container, className)}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-2 rounded-lg bg-white/50">
          <Icon className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <h3 className="font-semibold text-lg">{config.title}</h3>
              <badge_1.Badge variant="secondary" className={styles.badge}>
                {config.badge}
              </badge_1.Badge>
            </div>
            {dismissible && (
              <button_1.Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0 text-current opacity-70 hover:opacity-100"
              >
                <lucide_react_1.X className="h-4 w-4" />
              </button_1.Button>
            )}
          </div>

          <p className="text-sm mb-4 text-current/80">{config.message}</p>

          {showProgress && config.progress !== undefined && (
            <div className="mb-4">
              <progress_1.Progress value={config.progress} className="h-2 bg-white/30" />
            </div>
          )}

          <div className="flex items-center space-x-3">
            <button_1.Button onClick={onUpgrade} className={styles.button}>
              <lucide_react_1.Crown className="h-4 w-4 mr-2" />
              {config.ctaText}
            </button_1.Button>

            {status === "trialing" && (
              <button_1.Button variant="outline" size="sm" className="border-current/20">
                <lucide_react_1.Zap className="h-4 w-4 mr-2" />
                See Features
              </button_1.Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
exports.default = SubscriptionBanner;
