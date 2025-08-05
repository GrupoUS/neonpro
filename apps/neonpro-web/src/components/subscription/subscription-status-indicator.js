/**
 * Real-time Subscription Status Indicator Component
 *
 * Displays subscription status with real-time updates and interactive features.
 * Provides visual feedback for status changes and access to subscription management.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */
"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatusIndicator = SubscriptionStatusIndicator;
var react_1 = require("react");
var badge_1 = require("../ui/badge");
var button_1 = require("../ui/button");
var card_1 = require("../ui/card");
var progress_1 = require("../ui/progress");
var separator_1 = require("../ui/separator");
var tooltip_1 = require("../ui/tooltip");
var use_toast_1 = require("../ui/use-toast");
var use_subscription_status_1 = require("../../hooks/use-subscription-status");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("../../lib/utils");
var statusConfig = {
  active: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    icon: lucide_react_1.CheckCircle2,
    label: "Active",
    description: "Your subscription is active and all features are available",
  },
  trialing: {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: lucide_react_1.Clock,
    label: "Trial",
    description: "You are currently in your trial period",
  },
  expired: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    icon: lucide_react_1.XCircle,
    label: "Expired",
    description: "Your subscription has expired. Please renew to continue",
  },
  cancelled: {
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    icon: lucide_react_1.AlertTriangle,
    label: "Cancelled",
    description: "Your subscription has been cancelled",
  },
  incomplete: {
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    icon: lucide_react_1.AlertTriangle,
    label: "Incomplete",
    description: "Payment is required to complete your subscription",
  },
};
var tierConfig = {
  free: { label: "Free", icon: lucide_react_1.Shield, color: "text-gray-600" },
  basic: { label: "Basic", icon: lucide_react_1.Zap, color: "text-blue-600" },
  premium: { label: "Premium", icon: lucide_react_1.Crown, color: "text-purple-600" },
  enterprise: { label: "Enterprise", icon: lucide_react_1.TrendingUp, color: "text-gold-600" },
};
function SubscriptionStatusIndicator(_a) {
  var _b = _a.variant,
    variant = _b === void 0 ? "default" : _b,
    _c = _a.showMetrics,
    showMetrics = _c === void 0 ? false : _c,
    _d = _a.showEvents,
    showEvents = _d === void 0 ? false : _d,
    _e = _a.showActions,
    showActions = _e === void 0 ? true : _e,
    className = _a.className,
    onUpgradeClick = _a.onUpgradeClick,
    onManageClick = _a.onManageClick,
    _f = _a.options,
    options = _f === void 0 ? {} : _f;
  var toast = (0, use_toast_1.useToast)().toast;
  var _g = (0, react_1.useState)(false),
    showDetails = _g[0],
    setShowDetails = _g[1];
  var subscription = (0, use_subscription_status_1.useSubscriptionStatus)(
    __assign(
      {
        autoConnect: true,
        enableLogging: process.env.NODE_ENV === "development",
        onStatusChange: function (status, previous) {
          if (previous && status !== previous) {
            toast({
              title: "Subscription Status Updated",
              description: "Your subscription status changed from "
                .concat(previous, " to ")
                .concat(status),
              variant: status === "active" ? "default" : "destructive",
            });
          }
        },
        onError: function (error) {
          toast({
            title: "Subscription Error",
            description: error,
            variant: "destructive",
          });
        },
      },
      options,
    ),
  );
  var status = subscription.status,
    tier = subscription.tier,
    features = subscription.features,
    gracePeriodEnd = subscription.gracePeriodEnd,
    nextBilling = subscription.nextBilling,
    isLoading = subscription.isLoading,
    isConnected = subscription.isConnected,
    lastUpdate = subscription.lastUpdate,
    error = subscription.error,
    isExpired = subscription.isExpired,
    isActive = subscription.isActive,
    canAccessFeature = subscription.canAccessFeature,
    refresh = subscription.refresh,
    clearError = subscription.clearError,
    metrics = subscription.metrics,
    events = subscription.events;
  // Auto-refresh on reconnect
  (0, react_1.useEffect)(
    function () {
      if (isConnected && !isLoading && !status) {
        refresh();
      }
    },
    [isConnected, isLoading, status, refresh],
  );
  if (!status && isLoading) {
    return (
      <card_1.Card className={(0, utils_1.cn)("animate-pulse", className)}>
        <card_1.CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <lucide_react_1.RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading subscription status...</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (!status && !isLoading) {
    return null;
  }
  var config = statusConfig[status] || statusConfig.expired;
  var tierInfo = tierConfig[tier] || tierConfig.free;
  var StatusIcon = config.icon;
  var TierIcon = tierInfo.icon;
  // Calculate grace period progress
  var gracePeriodProgress = gracePeriodEnd
    ? Math.max(
        0,
        Math.min(
          100,
          ((new Date(gracePeriodEnd).getTime() - Date.now()) / (3 * 24 * 60 * 60 * 1000)) * 100,
        ),
      )
    : 0;
  var renderMinimal = function () {
    return (
      <tooltip_1.TooltipProvider>
        <tooltip_1.Tooltip>
          <tooltip_1.TooltipTrigger>
            <div className={(0, utils_1.cn)("flex items-center space-x-1", className)}>
              <div className="relative">
                <StatusIcon className={(0, utils_1.cn)("h-4 w-4", config.color)} />
                {isConnected
                  ? <lucide_react_1.Wifi className="absolute -bottom-1 -right-1 h-2 w-2 text-green-500" />
                  : <lucide_react_1.WifiOff className="absolute -bottom-1 -right-1 h-2 w-2 text-red-500" />}
              </div>
              <badge_1.Badge variant={isActive ? "default" : "destructive"}>
                {config.label}
              </badge_1.Badge>
            </div>
          </tooltip_1.TooltipTrigger>
          <tooltip_1.TooltipContent>
            <div className="text-sm">
              <p className="font-medium">{config.description}</p>
              {tier && <p className="text-muted-foreground mt-1">Plan: {tierInfo.label}</p>}
              {lastUpdate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {new Date(lastUpdate).toLocaleTimeString()}
                </p>
              )}
            </div>
          </tooltip_1.TooltipContent>
        </tooltip_1.Tooltip>
      </tooltip_1.TooltipProvider>
    );
  };
  var renderCompact = function () {
    return (
      <card_1.Card
        className={(0, utils_1.cn)("w-full", config.bgColor, config.borderColor, className)}
      >
        <card_1.CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StatusIcon className={(0, utils_1.cn)("h-5 w-5", config.color)} />
              <div>
                <div className="flex items-center space-x-2">
                  <span className={(0, utils_1.cn)("font-medium", config.color)}>
                    {config.label}
                  </span>
                  {tier && (
                    <badge_1.Badge
                      variant="outline"
                      className={(0, utils_1.cn)("text-xs", tierInfo.color)}
                    >
                      <TierIcon className="h-3 w-3 mr-1" />
                      {tierInfo.label}
                    </badge_1.Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Connection indicator */}
              {isConnected
                ? <lucide_react_1.Wifi className="h-4 w-4 text-green-500" />
                : <lucide_react_1.WifiOff className="h-4 w-4 text-red-500" />}

              {showActions && (
                <div className="flex space-x-1">
                  <button_1.Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}>
                    <lucide_react_1.RefreshCw
                      className={(0, utils_1.cn)("h-3 w-3", { "animate-spin": isLoading })}
                    />
                  </button_1.Button>
                  {isExpired && onUpgradeClick && (
                    <button_1.Button size="sm" onClick={onUpgradeClick}>
                      Upgrade
                    </button_1.Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  var renderDetailed = function () {
    return (
      <card_1.Card className={(0, utils_1.cn)("w-full", className)}>
        <card_1.CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="flex items-center space-x-2">
              <StatusIcon className={(0, utils_1.cn)("h-5 w-5", config.color)} />
              <span>Subscription Status</span>
              {isConnected
                ? <lucide_react_1.Activity className="h-4 w-4 text-green-500" />
                : <lucide_react_1.WifiOff className="h-4 w-4 text-red-500" />}
            </card_1.CardTitle>

            {showActions && (
              <div className="flex space-x-2">
                <button_1.Button
                  variant="outline"
                  size="sm"
                  onClick={function () {
                    return setShowDetails(!showDetails);
                  }}
                >
                  <lucide_react_1.Settings className="h-4 w-4 mr-1" />
                  Details
                </button_1.Button>
                <button_1.Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
                  <lucide_react_1.RefreshCw
                    className={(0, utils_1.cn)("h-4 w-4", { "animate-spin": isLoading })}
                  />
                </button_1.Button>
              </div>
            )}
          </div>
        </card_1.CardHeader>

        <card_1.CardContent className="space-y-4">
          {/* Status Overview */}
          <div className={(0, utils_1.cn)("p-3 rounded-lg", config.bgColor, config.borderColor)}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <badge_1.Badge variant={isActive ? "default" : "destructive"}>
                  {config.label}
                </badge_1.Badge>
                {tier && (
                  <badge_1.Badge variant="outline" className={tierInfo.color}>
                    <TierIcon className="h-3 w-3 mr-1" />
                    {tierInfo.label}
                  </badge_1.Badge>
                )}
              </div>

              {lastUpdate && (
                <span className="text-xs text-muted-foreground">
                  Updated: {new Date(lastUpdate).toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground">{config.description}</p>

            {/* Grace period progress */}
            {gracePeriodEnd && gracePeriodProgress > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Grace period</span>
                  <span>{Math.round(gracePeriodProgress)}% remaining</span>
                </div>
                <progress_1.Progress value={gracePeriodProgress} className="h-2" />
              </div>
            )}
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Available Features</h4>
              <div className="flex flex-wrap gap-1">
                {features.slice(0, showDetails ? features.length : 3).map(function (feature) {
                  return (
                    <badge_1.Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </badge_1.Badge>
                  );
                })}
                {!showDetails && features.length > 3 && (
                  <badge_1.Badge variant="outline" className="text-xs">
                    +{features.length - 3} more
                  </badge_1.Badge>
                )}
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
                <button_1.Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="text-red-600 hover:text-red-700"
                >
                  Dismiss
                </button_1.Button>
              </div>
            </div>
          )}

          {/* Metrics */}
          {showDetails && showMetrics && (
            <>
              <separator_1.Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Connection Metrics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Messages:</span>
                    <span className="ml-1">{metrics.messagesReceived}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Latency:</span>
                    <span className="ml-1">{metrics.latency}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uptime:</span>
                    <span className="ml-1">{Math.round(metrics.uptime / 1000)}s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reconnects:</span>
                    <span className="ml-1">{metrics.reconnectAttempts}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Recent Events */}
          {showDetails && showEvents && events.length > 0 && (
            <>
              <separator_1.Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Updates</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {events.slice(0, 5).map(function (event, index) {
                    return (
                      <div
                        key={"".concat(event.timestamp, "-").concat(index)}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-muted-foreground">
                          {event.event.replace(/_/g, " ")}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          {showActions && (
            <>
              <separator_1.Separator />
              <div className="flex space-x-2">
                {isExpired && onUpgradeClick && (
                  <button_1.Button onClick={onUpgradeClick} className="flex-1">
                    <lucide_react_1.Crown className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </button_1.Button>
                )}
                {onManageClick && (
                  <button_1.Button variant="outline" onClick={onManageClick} className="flex-1">
                    <lucide_react_1.Settings className="h-4 w-4 mr-2" />
                    Manage
                  </button_1.Button>
                )}
              </div>
            </>
          )}
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  // Render based on variant
  switch (variant) {
    case "minimal":
      return renderMinimal();
    case "compact":
      return renderCompact();
    case "detailed":
      return renderDetailed();
    default:
      return renderCompact();
  }
}
