/**
 * Subscription Status Card Component
 *
 * Comprehensive card component that displays detailed subscription information
 * including status, billing, features, and quick actions.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatusCard = SubscriptionStatusCard;
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var use_subscription_status_1 = require("../../hooks/use-subscription-status");
var badge_1 = require("../ui/badge");
var button_1 = require("../ui/button");
var card_1 = require("../ui/card");
var progress_1 = require("../ui/progress");
var separator_1 = require("../ui/separator");
var skeleton_1 = require("../ui/skeleton");
function SubscriptionStatusCard(_a) {
  var className = _a.className,
    _b = _a.variant,
    variant = _b === void 0 ? "default" : _b,
    _c = _a.showActions,
    showActions = _c === void 0 ? true : _c,
    _d = _a.showFeatures,
    showFeatures = _d === void 0 ? true : _d,
    _e = _a.showBilling,
    showBilling = _e === void 0 ? true : _e,
    onUpgrade = _a.onUpgrade,
    onManage = _a.onManage,
    onCancel = _a.onCancel;
  var _f = (0, use_subscription_status_1.useSubscriptionStatus)(),
    status = _f.status,
    tier = _f.tier,
    features = _f.features,
    gracePeriodEnd = _f.gracePeriodEnd,
    nextBilling = _f.nextBilling,
    isLoading = _f.isLoading,
    error = _f.error,
    refresh = _f.refresh;
  // Loading skeleton
  if (isLoading) {
    return (
      <card_1.Card className={(0, utils_1.cn)("w-full", className)}>
        <card_1.CardHeader>
          <skeleton_1.Skeleton className="h-6 w-40" />
          <skeleton_1.Skeleton className="h-4 w-60" />
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <skeleton_1.Skeleton className="h-4 w-full" />
          <skeleton_1.Skeleton className="h-4 w-3/4" />
          <skeleton_1.Skeleton className="h-4 w-1/2" />
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  // Error state
  if (error) {
    return (
      <card_1.Card className={(0, utils_1.cn)("w-full border-destructive", className)}>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2 text-destructive">
            <lucide_react_1.AlertTriangle className="h-5 w-5" />
            Erro na Assinatura
          </card_1.CardTitle>
          <card_1.CardDescription>{error}</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardFooter>
          <button_1.Button onClick={refresh} variant="outline">
            Tentar Novamente
          </button_1.Button>
        </card_1.CardFooter>
      </card_1.Card>
    );
  }
  // Status configuration
  var statusConfig = {
    active: {
      icon: lucide_react_1.CheckCircle2,
      label: "Ativa",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      badgeVariant: "default",
    },
    trialing: {
      icon: lucide_react_1.Clock,
      label: "Período de Teste",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      badgeVariant: "secondary",
    },
    past_due: {
      icon: lucide_react_1.AlertTriangle,
      label: "Pagamento Pendente",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      badgeVariant: "destructive",
    },
    cancelled: {
      icon: lucide_react_1.Clock,
      label: "Cancelada",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      badgeVariant: "destructive",
    },
    canceled: {
      icon: lucide_react_1.Clock,
      label: "Cancelada",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      badgeVariant: "destructive",
    },
    incomplete: {
      icon: lucide_react_1.CreditCard,
      label: "Pagamento Incompleto",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      badgeVariant: "destructive",
    },
  };
  var config = statusConfig[status] || statusConfig.cancelled;
  var StatusIcon = config.icon;
  // Calculate trial progress if applicable
  var getTrialProgress = function () {
    if (status !== "trialing" || !gracePeriodEnd) return null;
    var now = new Date();
    var end = new Date(gracePeriodEnd);
    var start = new Date(end.getTime() - 14 * 24 * 60 * 60 * 1000); // Assume 14-day trial
    var total = end.getTime() - start.getTime();
    var elapsed = now.getTime() - start.getTime();
    var progress = Math.max(0, Math.min(100, (elapsed / total) * 100));
    return {
      progress: progress,
      daysLeft: Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
    };
  };
  var trialInfo = getTrialProgress();
  return (
    <card_1.Card className={(0, utils_1.cn)("w-full", config.borderColor, className)}>
      <card_1.CardHeader className={(0, utils_1.cn)("pb-3", config.bgColor)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={(0, utils_1.cn)("h-6 w-6", config.color)} />
            <div>
              <card_1.CardTitle className="flex items-center gap-2">
                Status da Assinatura
                <badge_1.Badge variant={config.badgeVariant}>{config.label}</badge_1.Badge>
              </card_1.CardTitle>
              <card_1.CardDescription className="mt-1">
                {tier && (
                  <span className="flex items-center gap-1">
                    <lucide_react_1.Crown className="h-4 w-4" />
                    Plano {tier}
                  </span>
                )}
              </card_1.CardDescription>
            </div>
          </div>
          {variant !== "compact" && (
            <button_1.Button variant="ghost" size="sm" onClick={refresh}>
              Atualizar
            </button_1.Button>
          )}
        </div>

        {/* Trial progress */}
        {status === "trialing" && trialInfo && variant !== "compact" && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Período de teste</span>
              <span className="font-medium">{trialInfo.daysLeft} dias restantes</span>
            </div>
            <progress_1.Progress value={trialInfo.progress} className="h-2" />
          </div>
        )}
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-4">
        {/* Billing Information */}
        {showBilling && nextBilling && variant !== "compact" && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <lucide_react_1.Calendar className="h-4 w-4" />
              Próxima cobrança
            </div>
            <span className="text-sm font-medium">
              {(0, date_fns_1.formatDistanceToNow)(new Date(nextBilling), {
                addSuffix: true,
                locale: locale_1.ptBR,
              })}
            </span>
          </div>
        )}

        {/* Grace Period Warning */}
        {gracePeriodEnd && status === "past_due" && (
          <div className="rounded-md bg-orange-50 p-3 border border-orange-200">
            <div className="flex items-center gap-2 text-orange-800 text-sm">
              <lucide_react_1.AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Período de Graça</span>
            </div>
            <p className="text-orange-700 text-sm mt-1">
              Acesso expira em{" "}
              {(0, date_fns_1.formatDistanceToNow)(new Date(gracePeriodEnd), {
                addSuffix: true,
                locale: locale_1.ptBR,
              })}
            </p>
          </div>
        )}

        {/* Features List */}
        {showFeatures && features.length > 0 && variant === "detailed" && (
          <div>
            <separator_1.Separator />
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-3">Funcionalidades Incluídas</h4>
              <div className="grid grid-cols-2 gap-2">
                {features.slice(0, 6).map(function (feature, index) {
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <lucide_react_1.CheckCircle2 className="h-3 w-3 text-green-600" />
                      {feature}
                    </div>
                  );
                })}
              </div>
              {features.length > 6 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{features.length - 6} funcionalidades adicionais
                </p>
              )}
            </div>
          </div>
        )}
      </card_1.CardContent>

      {/* Actions */}
      {showActions && variant !== "compact" && (
        <card_1.CardFooter className="flex gap-2">
          {status === "trialing" && (
            <button_1.Button onClick={onUpgrade} className="flex-1">
              <lucide_react_1.Crown className="h-4 w-4 mr-2" />
              Assinar Agora
            </button_1.Button>
          )}

          {status === "past_due" && (
            <button_1.Button onClick={onManage} variant="destructive" className="flex-1">
              <lucide_react_1.CreditCard className="h-4 w-4 mr-2" />
              Atualizar Pagamento
            </button_1.Button>
          )}

          {status === "cancelled" && (
            <button_1.Button onClick={onUpgrade} className="flex-1">
              <lucide_react_1.TrendingUp className="h-4 w-4 mr-2" />
              Reativar Assinatura
            </button_1.Button>
          )}

          {status === "active" && (
            <>
              <button_1.Button onClick={onManage} variant="outline" className="flex-1">
                <lucide_react_1.Settings className="h-4 w-4 mr-2" />
                Gerenciar
              </button_1.Button>
              <button_1.Button onClick={onUpgrade} className="flex-1">
                <lucide_react_1.Zap className="h-4 w-4 mr-2" />
                Upgrade
              </button_1.Button>
            </>
          )}

          {status === "incomplete" && (
            <button_1.Button onClick={onManage} variant="destructive" className="flex-1">
              <lucide_react_1.CreditCard className="h-4 w-4 mr-2" />
              Completar Pagamento
            </button_1.Button>
          )}
        </card_1.CardFooter>
      )}
    </card_1.Card>
  );
}
