"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionGuard = SubscriptionGuard;
exports.PremiumFeatureGuard = PremiumFeatureGuard;
exports.ActiveSubscriptionGuard = ActiveSubscriptionGuard;
exports.useSubscriptionAccess = useSubscriptionAccess;
var alert_1 = require("@/components/ui/alert");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var use_subscription_status_1 = require("@/hooks/use-subscription-status");
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
function SubscriptionGuard(_a) {
  var children = _a.children,
    fallback = _a.fallback,
    _b = _a.requireActive,
    requireActive = _b === void 0 ? false : _b,
    _c = _a.showUpgrade,
    showUpgrade = _c === void 0 ? true : _c,
    _d = _a.feature,
    feature = _d === void 0 ? "this feature" : _d,
    className = _a.className;
  var _e = (0, use_subscription_status_1.useSubscriptionStatus)(),
    hasAccess = _e.hasAccess,
    isActive = _e.isActive,
    isTrialing = _e.isTrialing,
    inGracePeriod = _e.inGracePeriod,
    isLoading = _e.isLoading,
    status = _e.status,
    message = _e.message,
    error = _e.error;
  // Show loading state
  if (isLoading) {
    return (
      <card_1.Card className={className}>
        <card_1.CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-muted-foreground">Checking subscription...</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  // Show error state
  if (error) {
    return (
      <alert_1.Alert variant="destructive" className={className}>
        <lucide_react_1.AlertCircle className="h-4 w-4" />
        <alert_1.AlertTitle>Subscription Error</alert_1.AlertTitle>
        <alert_1.AlertDescription>
          {error}
          <button_1.Button asChild variant="outline" size="sm" className="ml-2">
            <link_1.default href="/dashboard/subscription">Check Subscription</link_1.default>
          </button_1.Button>
        </alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  // Check access requirements
  var shouldShowContent = requireActive ? isActive : hasAccess;
  // Show content if user has access
  if (shouldShowContent) {
    // Show grace period warning if applicable
    if (inGracePeriod && children) {
      return (
        <div className={className}>
          <alert_1.Alert variant="destructive" className="mb-4">
            <lucide_react_1.Clock className="h-4 w-4" />
            <alert_1.AlertTitle>Payment Required</alert_1.AlertTitle>
            <alert_1.AlertDescription>
              {message ||
                "Your subscription payment is overdue. Please update your payment method to continue accessing premium features."}
              <button_1.Button asChild variant="outline" size="sm" className="ml-2">
                <link_1.default href="/dashboard/billing">Update Payment</link_1.default>
              </button_1.Button>
            </alert_1.AlertDescription>
          </alert_1.Alert>
          {children}
        </div>
      );
    }
    return <div className={className}>{children}</div>;
  }
  // Show custom fallback if provided
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }
  // Show default upgrade prompt
  if (!showUpgrade) {
    return null;
  }
  return (
    <card_1.Card className={className}>
      <card_1.CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <lucide_react_1.Lock className="h-6 w-6 text-primary" />
        </div>
        <card_1.CardTitle className="text-xl">
          {requireActive ? "Active Subscription Required" : "Subscription Required"}
        </card_1.CardTitle>
        <card_1.CardDescription>
          {requireActive
            ? "An active subscription is required to access "
                .concat(feature, ". ")
                .concat(status === "trialing" ? "Trial users cannot access this feature." : "")
            : "Upgrade to NeonPro to unlock ".concat(feature, " and many other premium features.")}
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        {status === "trialing" && (
          <alert_1.Alert>
            <lucide_react_1.Zap className="h-4 w-4" />
            <alert_1.AlertTitle>Trial Limitation</alert_1.AlertTitle>
            <alert_1.AlertDescription>
              This feature is not available during the trial period. Upgrade to a paid plan to
              access all features.
            </alert_1.AlertDescription>
          </alert_1.Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <button_1.Button asChild className="flex-1">
            <link_1.default href="/dashboard/subscription">
              {status === "trialing" ? "Upgrade Now" : "View Plans"}
            </link_1.default>
          </button_1.Button>
          <button_1.Button asChild variant="outline" className="flex-1">
            <link_1.default href="/dashboard/billing">Manage Billing</link_1.default>
          </button_1.Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Questions?{" "}
            <link_1.default href="/dashboard/settings" className="underline">
              Contact Support
            </link_1.default>
          </p>
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
// Specialized guards for common use cases
function PremiumFeatureGuard(_a) {
  var children = _a.children,
    feature = _a.feature,
    className = _a.className;
  return (
    <SubscriptionGuard
      requireActive={false}
      feature={feature || "premium features"}
      className={className}
    >
      {children}
    </SubscriptionGuard>
  );
}
function ActiveSubscriptionGuard(_a) {
  var children = _a.children,
    feature = _a.feature,
    className = _a.className;
  return (
    <SubscriptionGuard
      requireActive={true}
      feature={feature || "this advanced feature"}
      className={className}
    >
      {children}
    </SubscriptionGuard>
  );
}
// Hook for conditional rendering based on subscription
function useSubscriptionAccess() {
  var _a = (0, use_subscription_status_1.useSubscriptionStatus)(),
    hasAccess = _a.hasAccess,
    isActive = _a.isActive,
    isTrialing = _a.isTrialing,
    isLoading = _a.isLoading;
  return {
    canAccessPremium: hasAccess,
    canAccessActive: isActive,
    isTrialUser: isTrialing,
    isLoading: isLoading,
    // Helper functions
    renderIfPremium: (content) => (hasAccess ? content : null),
    renderIfActive: (content) => (isActive ? content : null),
    renderIfTrial: (content) => (isTrialing ? content : null),
  };
}
