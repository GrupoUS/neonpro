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

import type { cn } from "@/lib/utils";
import type { Crown, Lock, Sparkles, TrendingUp, Zap } from "lucide-react";
import type { ReactNode } from "react";
import type { useSubscriptionStatus } from "../../hooks/use-subscription-status";
import type { Badge } from "../ui/badge";
import type { Button } from "../ui/button";
import type { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export interface FeatureGateProps {
  children: ReactNode;
  feature: string;
  requiredPlan?: "basic" | "pro" | "enterprise";
  requiredStatus?: "active" | "trialing" | "active_or_trial";
  className?: string;
  fallback?: ReactNode;
  showUpgrade?: boolean;
  onUpgrade?: () => void;
}

export function FeatureGate({
  children,
  feature,
  requiredPlan = "basic",
  requiredStatus = "active_or_trial",
  className,
  fallback,
  showUpgrade = true,
  onUpgrade,
}: FeatureGateProps) {
  const { status, tier, features, isLoading } = useSubscriptionStatus();

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-20 bg-gray-200 rounded-md" />
      </div>
    );
  }

  // Check status requirement
  const hasValidStatus = (() => {
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
  const planHierarchy = { basic: 1, pro: 2, enterprise: 3 };
  const userPlanLevel = planHierarchy[tier as keyof typeof planHierarchy] || 0;
  const requiredPlanLevel = planHierarchy[requiredPlan];
  const hasValidPlan = userPlanLevel >= requiredPlanLevel;

  // Check if user has access to the specific feature
  const hasFeatureAccess = features.includes(feature);

  // Allow access if all requirements are met
  if (hasValidStatus && hasValidPlan && hasFeatureAccess) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default blocked UI
  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "pro":
        return <Zap className="h-5 w-5" />;
      case "enterprise":
        return <Crown className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case "pro":
        return "Pro";
      case "enterprise":
        return "Enterprise";
      default:
        return "Básico";
    }
  };

  const getBlockReason = () => {
    if (!hasValidStatus) {
      if (status === "cancelled" || status === "canceled") {
        return {
          title: "Assinatura Cancelada",
          description: "Sua assinatura foi cancelada. Reative para acessar esta funcionalidade.",
          action: "Reativar Assinatura",
          variant: "destructive" as const,
        };
      }
      if (status === "past_due") {
        return {
          title: "Pagamento Pendente",
          description: "Atualize sua forma de pagamento para continuar usando esta funcionalidade.",
          action: "Atualizar Pagamento",
          variant: "destructive" as const,
        };
      }
      return {
        title: "Assinatura Necessária",
        description: "Uma assinatura ativa é necessária para acessar esta funcionalidade.",
        action: "Assinar Agora",
        variant: "default" as const,
      };
    }

    if (!hasValidPlan) {
      return {
        title: `Upgrade para ${getPlanLabel(requiredPlan)}`,
        description: `Esta funcionalidade está disponível no plano ${getPlanLabel(requiredPlan)} ou superior.`,
        action: `Fazer Upgrade para ${getPlanLabel(requiredPlan)}`,
        variant: "default" as const,
      };
    }

    return {
      title: "Funcionalidade Não Disponível",
      description: "Esta funcionalidade não está incluída no seu plano atual.",
      action: "Ver Planos",
      variant: "secondary" as const,
    };
  };

  const blockInfo = getBlockReason();

  return (
    <Card className={cn("border-2 border-dashed border-gray-300", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Lock className="h-6 w-6 text-gray-600" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          {blockInfo.title}
          <Badge variant="secondary" className="flex items-center gap-1">
            {getPlanIcon(requiredPlan)}
            {getPlanLabel(requiredPlan)}
          </Badge>
        </CardTitle>
        <CardDescription className="max-w-sm mx-auto">{blockInfo.description}</CardDescription>
      </CardHeader>

      {showUpgrade && (
        <CardContent className="text-center">
          <Button onClick={onUpgrade} variant={blockInfo.variant} className="w-full max-w-xs">
            {blockInfo.variant === "default" ? (
              <TrendingUp className="h-4 w-4 mr-2" />
            ) : blockInfo.variant === "destructive" ? (
              <Lock className="h-4 w-4 mr-2" />
            ) : (
              <Crown className="h-4 w-4 mr-2" />
            )}
            {blockInfo.action}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

// Specific feature gates for common use cases
export function ProFeatureGate({ children, ...props }: Omit<FeatureGateProps, "requiredPlan">) {
  return (
    <FeatureGate {...props} requiredPlan="pro">
      {children}
    </FeatureGate>
  );
}

export function EnterpriseFeatureGate({
  children,
  ...props
}: Omit<FeatureGateProps, "requiredPlan">) {
  return (
    <FeatureGate {...props} requiredPlan="enterprise">
      {children}
    </FeatureGate>
  );
}

// Usage counter with upgrade prompt
export interface UsageLimitGateProps {
  children: ReactNode;
  current: number;
  limit: number;
  feature: string;
  className?: string;
  onUpgrade?: () => void;
}

export function UsageLimitGate({
  children,
  current,
  limit,
  feature,
  className,
  onUpgrade,
}: UsageLimitGateProps) {
  const isLimitReached = current >= limit;
  const usagePercentage = Math.min((current / limit) * 100, 100);

  if (!isLimitReached) {
    return <>{children}</>;
  }

  return (
    <Card className={cn("border-2 border-dashed border-orange-300", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <Lock className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle>Limite de Uso Atingido</CardTitle>
        <CardDescription>
          Você atingiu o limite de {limit} para {feature} em seu plano atual.
        </CardDescription>

        {/* Usage progress bar */}
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span>Uso atual</span>
            <span className="font-medium">
              {current} / {limit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="text-center">
        <Button onClick={onUpgrade} className="w-full max-w-xs">
          <TrendingUp className="h-4 w-4 mr-2" />
          Fazer Upgrade
        </Button>
      </CardContent>
    </Card>
  );
}
