/**
 * Subscription Dashboard Widget
 *
 * Compact widget for displaying subscription status on the dashboard.
 * Shows key metrics, status, and quick actions.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionDashboardWidget = SubscriptionDashboardWidget;
exports.CompactSubscriptionWidget = CompactSubscriptionWidget;
exports.DetailedSubscriptionWidget = DetailedSubscriptionWidget;
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var use_subscription_status_1 = require("../../hooks/use-subscription-status");
var badge_1 = require("../ui/badge");
var button_1 = require("../ui/button");
var card_1 = require("../ui/card");
var progress_1 = require("../ui/progress");
var skeleton_1 = require("../ui/skeleton");
function SubscriptionDashboardWidget(_a) {
  var className = _a.className,
    _b = _a.variant,
    variant = _b === void 0 ? "default" : _b,
    _c = _a.showMetrics,
    showMetrics = _c === void 0 ? true : _c,
    _d = _a.showQuickActions,
    showQuickActions = _d === void 0 ? true : _d,
    onManage = _a.onManage,
    onUpgrade = _a.onUpgrade;
  var _e = (0, use_subscription_status_1.useSubscriptionStatus)(),
    status = _e.status,
    tier = _e.tier,
    gracePeriodEnd = _e.gracePeriodEnd,
    nextBilling = _e.nextBilling,
    features = _e.features,
    isLoading = _e.isLoading,
    metrics = _e.metrics;
  // Loading skeleton
  if (isLoading) {
    return (
      <card_1.Card className={(0, utils_1.cn)("w-full", className)}>
        <card_1.CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <skeleton_1.Skeleton className="h-5 w-32 mb-2" />
              <skeleton_1.Skeleton className="h-4 w-20" />
            </div>
            <skeleton_1.Skeleton className="h-8 w-16" />
          </div>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-3">
          <skeleton_1.Skeleton className="h-4 w-full" />
          <skeleton_1.Skeleton className="h-4 w-3/4" />
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  // Status configuration
  var statusConfig = {
    active: {
      label: "Ativa",
      color: "text-green-600",
      bgColor: "bg-green-50",
      badgeVariant: "default",
      icon: <lucide_react_1.Activity className="h-4 w-4" />,
    },
    trialing: {
      label: "Teste",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      badgeVariant: "secondary",
      icon: <lucide_react_1.Zap className="h-4 w-4" />,
    },
    past_due: {
      label: "Atraso",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      badgeVariant: "destructive",
      icon: <lucide_react_1.DollarSign className="h-4 w-4" />,
    },
    cancelled: {
      label: "Cancelada",
      color: "text-red-600",
      bgColor: "bg-red-50",
      badgeVariant: "destructive",
      icon: <lucide_react_1.TrendingUp className="h-4 w-4" />,
    },
    canceled: {
      label: "Cancelada",
      color: "text-red-600",
      bgColor: "bg-red-50",
      badgeVariant: "destructive",
      icon: <lucide_react_1.TrendingUp className="h-4 w-4" />,
    },
    incomplete: {
      label: "Pendente",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      badgeVariant: "destructive",
      icon: <lucide_react_1.DollarSign className="h-4 w-4" />,
    },
  };
  var config = statusConfig[status] || statusConfig.cancelled;
  // Calculate trial progress
  var getTrialProgress = () => {
    if (status !== "trialing" || !gracePeriodEnd) return null;
    var now = new Date();
    var end = new Date(gracePeriodEnd);
    var start = new Date(end.getTime() - 14 * 24 * 60 * 60 * 1000); // 14-day trial
    var total = end.getTime() - start.getTime();
    var elapsed = now.getTime() - start.getTime();
    var progress = Math.max(0, Math.min(100, (elapsed / total) * 100));
    var daysLeft = Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return { progress: progress, daysLeft: daysLeft };
  };
  var trialInfo = getTrialProgress();
  // Get key metrics for detailed view
  var getKeyMetrics = () => {
    if (!showMetrics || variant === "compact") return [];
    var keyMetrics = [
      {
        label: "Funcionalidades",
        value: features.length.toString(),
        icon: <lucide_react_1.Crown className="h-4 w-4" />,
        color: "text-purple-600",
      },
    ];
    if (metrics === null || metrics === void 0 ? void 0 : metrics.uptime) {
      keyMetrics.push({
        label: "Uptime",
        value: "".concat(Math.round(metrics.uptime / 60), "min"),
        icon: <lucide_react_1.Activity className="h-4 w-4" />,
        color: "text-green-600",
      });
    }
    if (nextBilling) {
      keyMetrics.push({
        label: "Próxima Cobrança",
        value: (0, date_fns_1.format)(new Date(nextBilling), "dd/MM", { locale: locale_1.ptBR }),
        icon: <lucide_react_1.Calendar className="h-4 w-4" />,
        color: "text-blue-600",
      });
    }
    return keyMetrics;
  };
  var keyMetrics = getKeyMetrics();
  return (
    <card_1.Card className={(0, utils_1.cn)("w-full", className)}>
      <card_1.CardHeader className={(0, utils_1.cn)("pb-3", variant === "compact" && "pb-2")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.icon}
            <div>
              <card_1.CardTitle className="text-sm font-medium">
                Assinatura
                {tier && (
                  <span className="text-xs font-normal text-muted-foreground ml-1">{tier}</span>
                )}
              </card_1.CardTitle>
              {variant !== "compact" && (
                <card_1.CardDescription className="text-xs">
                  Status da conta e funcionalidades
                </card_1.CardDescription>
              )}
            </div>
          </div>
          <badge_1.Badge variant={config.badgeVariant} className="text-xs">
            {config.label}
          </badge_1.Badge>
        </div>

        {/* Trial Progress */}
        {status === "trialing" && trialInfo && variant !== "compact" && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Período de teste</span>
              <span>{trialInfo.daysLeft} dias restantes</span>
            </div>
            <progress_1.Progress value={trialInfo.progress} className="h-1.5" />
          </div>
        )}
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-3">
        {/* Key Metrics */}
        {keyMetrics.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {keyMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className={(0, utils_1.cn)("text-lg font-semibold", metric.color)}>
                  {metric.value}
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  {metric.icon}
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Next Billing Info */}
        {nextBilling && variant === "detailed" && (
          <div className="text-xs text-muted-foreground flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="flex items-center gap-1">
              <lucide_react_1.Calendar className="h-3 w-3" />
              Próxima cobrança
            </span>
            <span className="font-medium">
              {(0, date_fns_1.formatDistanceToNow)(new Date(nextBilling), {
                addSuffix: true,
                locale: locale_1.ptBR,
              })}
            </span>
          </div>
        )}

        {/* Grace Period Warning */}
        {gracePeriodEnd && status === "past_due" && (
          <div className="text-xs p-2 bg-orange-50 border border-orange-200 rounded text-orange-800">
            <div className="flex items-center gap-1 font-medium">
              <lucide_react_1.DollarSign className="h-3 w-3" />
              Período de Graça
            </div>
            <div className="mt-0.5">
              Expira{" "}
              {(0, date_fns_1.formatDistanceToNow)(new Date(gracePeriodEnd), {
                addSuffix: true,
                locale: locale_1.ptBR,
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {showQuickActions && variant !== "compact" && (
          <div className="flex gap-2 pt-2">
            {status === "trialing" && (
              <button_1.Button size="sm" onClick={onUpgrade} className="flex-1 text-xs">
                <lucide_react_1.Crown className="h-3 w-3 mr-1" />
                Assinar
              </button_1.Button>
            )}

            {status === "active" && (
              <>
                <button_1.Button
                  size="sm"
                  variant="outline"
                  onClick={onManage}
                  className="flex-1 text-xs"
                >
                  Gerenciar
                </button_1.Button>
                <button_1.Button size="sm" onClick={onUpgrade} className="flex-1 text-xs">
                  <lucide_react_1.TrendingUp className="h-3 w-3 mr-1" />
                  Upgrade
                </button_1.Button>
              </>
            )}

            {(status === "past_due" || status === "incomplete") && (
              <button_1.Button
                size="sm"
                variant="destructive"
                onClick={onManage}
                className="flex-1 text-xs"
              >
                <lucide_react_1.DollarSign className="h-3 w-3 mr-1" />
                Pagar Agora
              </button_1.Button>
            )}

            {(status === "cancelled" || status === "canceled") && (
              <button_1.Button size="sm" onClick={onUpgrade} className="flex-1 text-xs">
                <lucide_react_1.TrendingUp className="h-3 w-3 mr-1" />
                Reativar
              </button_1.Button>
            )}
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
// Compact variant for sidebars
function CompactSubscriptionWidget(props) {
  return <SubscriptionDashboardWidget {...props} variant="compact" />;
}
// Detailed variant for main dashboard
function DetailedSubscriptionWidget(props) {
  return <SubscriptionDashboardWidget {...props} variant="detailed" />;
}
