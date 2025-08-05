/**
 * Subscription Feature Gate Component
 *
 * Guards features behind subscription tiers and statuses.
 * Automatically blocks access for users without proper subscription.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */
"use client";
"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureGate = FeatureGate;
exports.ProFeatureGate = ProFeatureGate;
exports.EnterpriseFeatureGate = EnterpriseFeatureGate;
exports.UsageLimitGate = UsageLimitGate;
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var use_subscription_status_1 = require("../../hooks/use-subscription-status");
var badge_1 = require("../ui/badge");
var button_1 = require("../ui/button");
var card_1 = require("../ui/card");
function FeatureGate(_a) {
    var children = _a.children, feature = _a.feature, _b = _a.requiredPlan, requiredPlan = _b === void 0 ? "basic" : _b, _c = _a.requiredStatus, requiredStatus = _c === void 0 ? "active_or_trial" : _c, className = _a.className, fallback = _a.fallback, _d = _a.showUpgrade, showUpgrade = _d === void 0 ? true : _d, onUpgrade = _a.onUpgrade;
    var _e = (0, use_subscription_status_1.useSubscriptionStatus)(), status = _e.status, tier = _e.tier, features = _e.features, isLoading = _e.isLoading;
    // Show loading state
    if (isLoading) {
        return (<div className={(0, utils_1.cn)("animate-pulse", className)}>
        <div className="h-20 bg-gray-200 rounded-md"/>
      </div>);
    }
    // Check status requirement
    var hasValidStatus = (function () {
        switch (requiredStatus) {
            case "active":
                return status === "active";
            case "trialing":
                return status === "trialing";
            case "active_or_trial":
                return status === "active" || status === "trialing";
            default:
                return false;
        }
    })();
    // Check plan requirement
    var planHierarchy = { basic: 1, pro: 2, enterprise: 3 };
    var userPlanLevel = planHierarchy[tier] || 0;
    var requiredPlanLevel = planHierarchy[requiredPlan];
    var hasValidPlan = userPlanLevel >= requiredPlanLevel;
    // Check if user has access to the specific feature
    var hasFeatureAccess = features.includes(feature);
    // Allow access if all requirements are met
    if (hasValidStatus && hasValidPlan && hasFeatureAccess) {
        return <>{children}</>;
    }
    // Show custom fallback if provided
    if (fallback) {
        return <>{fallback}</>;
    }
    // Default blocked UI
    var getPlanIcon = function (plan) {
        switch (plan) {
            case "pro":
                return <lucide_react_1.Zap className="h-5 w-5"/>;
            case "enterprise":
                return <lucide_react_1.Crown className="h-5 w-5"/>;
            default:
                return <lucide_react_1.Sparkles className="h-5 w-5"/>;
        }
    };
    var getPlanLabel = function (plan) {
        switch (plan) {
            case "pro":
                return "Pro";
            case "enterprise":
                return "Enterprise";
            default:
                return "Básico";
        }
    };
    var getBlockReason = function () {
        if (!hasValidStatus) {
            if (status === "cancelled" || status === "canceled") {
                return {
                    title: "Assinatura Cancelada",
                    description: "Sua assinatura foi cancelada. Reative para acessar esta funcionalidade.",
                    action: "Reativar Assinatura",
                    variant: "destructive",
                };
            }
            if (status === "past_due") {
                return {
                    title: "Pagamento Pendente",
                    description: "Atualize sua forma de pagamento para continuar usando esta funcionalidade.",
                    action: "Atualizar Pagamento",
                    variant: "destructive",
                };
            }
            return {
                title: "Assinatura Necessária",
                description: "Uma assinatura ativa é necessária para acessar esta funcionalidade.",
                action: "Assinar Agora",
                variant: "default",
            };
        }
        if (!hasValidPlan) {
            return {
                title: "Upgrade para ".concat(getPlanLabel(requiredPlan)),
                description: "Esta funcionalidade est\u00E1 dispon\u00EDvel no plano ".concat(getPlanLabel(requiredPlan), " ou superior."),
                action: "Fazer Upgrade para ".concat(getPlanLabel(requiredPlan)),
                variant: "default",
            };
        }
        return {
            title: "Funcionalidade Não Disponível",
            description: "Esta funcionalidade não está incluída no seu plano atual.",
            action: "Ver Planos",
            variant: "secondary",
        };
    };
    var blockInfo = getBlockReason();
    return (<card_1.Card className={(0, utils_1.cn)("border-2 border-dashed border-gray-300", className)}>
      <card_1.CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <lucide_react_1.Lock className="h-6 w-6 text-gray-600"/>
        </div>
        <card_1.CardTitle className="flex items-center justify-center gap-2">
          {blockInfo.title}
          <badge_1.Badge variant="secondary" className="flex items-center gap-1">
            {getPlanIcon(requiredPlan)}
            {getPlanLabel(requiredPlan)}
          </badge_1.Badge>
        </card_1.CardTitle>
        <card_1.CardDescription className="max-w-sm mx-auto">
          {blockInfo.description}
        </card_1.CardDescription>
      </card_1.CardHeader>

      {showUpgrade && (<card_1.CardContent className="text-center">
          <button_1.Button onClick={onUpgrade} variant={blockInfo.variant} className="w-full max-w-xs">
            {blockInfo.variant === "default" ? (<lucide_react_1.TrendingUp className="h-4 w-4 mr-2"/>) : blockInfo.variant === "destructive" ? (<lucide_react_1.Lock className="h-4 w-4 mr-2"/>) : (<lucide_react_1.Crown className="h-4 w-4 mr-2"/>)}
            {blockInfo.action}
          </button_1.Button>
        </card_1.CardContent>)}
    </card_1.Card>);
}
// Specific feature gates for common use cases
function ProFeatureGate(_a) {
    var children = _a.children, props = __rest(_a, ["children"]);
    return (<FeatureGate {...props} requiredPlan="pro">
      {children}
    </FeatureGate>);
}
function EnterpriseFeatureGate(_a) {
    var children = _a.children, props = __rest(_a, ["children"]);
    return (<FeatureGate {...props} requiredPlan="enterprise">
      {children}
    </FeatureGate>);
}
function UsageLimitGate(_a) {
    var children = _a.children, current = _a.current, limit = _a.limit, feature = _a.feature, className = _a.className, onUpgrade = _a.onUpgrade;
    var isLimitReached = current >= limit;
    var usagePercentage = Math.min((current / limit) * 100, 100);
    if (!isLimitReached) {
        return <>{children}</>;
    }
    return (<card_1.Card className={(0, utils_1.cn)("border-2 border-dashed border-orange-300", className)}>
      <card_1.CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <lucide_react_1.Lock className="h-6 w-6 text-orange-600"/>
        </div>
        <card_1.CardTitle>Limite de Uso Atingido</card_1.CardTitle>
        <card_1.CardDescription>
          Você atingiu o limite de {limit} para {feature} em seu plano atual.
        </card_1.CardDescription>

        {/* Usage progress bar */}
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span>Uso atual</span>
            <span className="font-medium">
              {current} / {limit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-orange-600 h-2 rounded-full transition-all" style={{ width: "".concat(usagePercentage, "%") }}/>
          </div>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent className="text-center">
        <button_1.Button onClick={onUpgrade} className="w-full max-w-xs">
          <lucide_react_1.TrendingUp className="h-4 w-4 mr-2"/>
          Fazer Upgrade
        </button_1.Button>
      </card_1.CardContent>
    </card_1.Card>);
}
