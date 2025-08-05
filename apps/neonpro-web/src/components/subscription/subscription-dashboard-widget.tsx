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

import type { format, formatDistanceToNow } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { Activity, Calendar, Crown, DollarSign, TrendingUp, Zap } from "lucide-react";
import type { cn } from "@/lib/utils";
import type { useSubscriptionStatus } from "../../hooks/use-subscription-status";
import type { Badge } from "../ui/badge";
import type { Button } from "../ui/button";
import type { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import type { Progress } from "../ui/progress";
import type { Skeleton } from "../ui/skeleton";

export interface SubscriptionDashboardWidgetProps {
  className?: string;
  variant?: "default" | "compact" | "detailed";
  showMetrics?: boolean;
  showQuickActions?: boolean;
  onManage?: () => void;
  onUpgrade?: () => void;
}

export function SubscriptionDashboardWidget({
  className,
  variant = "default",
  showMetrics = true,
  showQuickActions = true,
  onManage,
  onUpgrade,
}: SubscriptionDashboardWidgetProps) {
  const { status, tier, gracePeriodEnd, nextBilling, features, isLoading, metrics } =
    useSubscriptionStatus();

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  // Status configuration
  const statusConfig = {
    active: {
      label: "Ativa",
      color: "text-green-600",
      bgColor: "bg-green-50",
      badgeVariant: "default" as const,
      icon: <Activity className="h-4 w-4" />,
    },
    trialing: {
      label: "Teste",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      badgeVariant: "secondary" as const,
      icon: <Zap className="h-4 w-4" />,
    },
    past_due: {
      label: "Atraso",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      badgeVariant: "destructive" as const,
      icon: <DollarSign className="h-4 w-4" />,
    },
    cancelled: {
      label: "Cancelada",
      color: "text-red-600",
      bgColor: "bg-red-50",
      badgeVariant: "destructive" as const,
      icon: <TrendingUp className="h-4 w-4" />,
    },
    canceled: {
      label: "Cancelada",
      color: "text-red-600",
      bgColor: "bg-red-50",
      badgeVariant: "destructive" as const,
      icon: <TrendingUp className="h-4 w-4" />,
    },
    incomplete: {
      label: "Pendente",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      badgeVariant: "destructive" as const,
      icon: <DollarSign className="h-4 w-4" />,
    },
  } as const;

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.cancelled;

  // Calculate trial progress
  const getTrialProgress = () => {
    if (status !== "trialing" || !gracePeriodEnd) return null;

    const now = new Date();
    const end = new Date(gracePeriodEnd);
    const start = new Date(end.getTime() - 14 * 24 * 60 * 60 * 1000); // 14-day trial

    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const progress = Math.max(0, Math.min(100, (elapsed / total) * 100));
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    return { progress, daysLeft };
  };

  const trialInfo = getTrialProgress();

  // Get key metrics for detailed view
  const getKeyMetrics = () => {
    if (!showMetrics || variant === "compact") return [];

    const keyMetrics = [
      {
        label: "Funcionalidades",
        value: features.length.toString(),
        icon: <Crown className="h-4 w-4" />,
        color: "text-purple-600",
      },
    ];

    if (metrics?.uptime) {
      keyMetrics.push({
        label: "Uptime",
        value: `${Math.round(metrics.uptime / 60)}min`,
        icon: <Activity className="h-4 w-4" />,
        color: "text-green-600",
      });
    }

    if (nextBilling) {
      keyMetrics.push({
        label: "Próxima Cobrança",
        value: format(new Date(nextBilling), "dd/MM", { locale: ptBR }),
        icon: <Calendar className="h-4 w-4" />,
        color: "text-blue-600",
      });
    }

    return keyMetrics;
  };

  const keyMetrics = getKeyMetrics();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className={cn("pb-3", variant === "compact" && "pb-2")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.icon}
            <div>
              <CardTitle className="text-sm font-medium">
                Assinatura
                {tier && (
                  <span className="text-xs font-normal text-muted-foreground ml-1">{tier}</span>
                )}
              </CardTitle>
              {variant !== "compact" && (
                <CardDescription className="text-xs">
                  Status da conta e funcionalidades
                </CardDescription>
              )}
            </div>
          </div>
          <Badge variant={config.badgeVariant} className="text-xs">
            {config.label}
          </Badge>
        </div>

        {/* Trial Progress */}
        {status === "trialing" && trialInfo && variant !== "compact" && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Período de teste</span>
              <span>{trialInfo.daysLeft} dias restantes</span>
            </div>
            <Progress value={trialInfo.progress} className="h-1.5" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Key Metrics */}
        {keyMetrics.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {keyMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className={cn("text-lg font-semibold", metric.color)}>{metric.value}</div>
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
              <Calendar className="h-3 w-3" />
              Próxima cobrança
            </span>
            <span className="font-medium">
              {formatDistanceToNow(new Date(nextBilling), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
        )}

        {/* Grace Period Warning */}
        {gracePeriodEnd && status === "past_due" && (
          <div className="text-xs p-2 bg-orange-50 border border-orange-200 rounded text-orange-800">
            <div className="flex items-center gap-1 font-medium">
              <DollarSign className="h-3 w-3" />
              Período de Graça
            </div>
            <div className="mt-0.5">
              Expira{" "}
              {formatDistanceToNow(new Date(gracePeriodEnd), {
                addSuffix: true,
                locale: ptBR,
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {showQuickActions && variant !== "compact" && (
          <div className="flex gap-2 pt-2">
            {status === "trialing" && (
              <Button size="sm" onClick={onUpgrade} className="flex-1 text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Assinar
              </Button>
            )}

            {status === "active" && (
              <>
                <Button size="sm" variant="outline" onClick={onManage} className="flex-1 text-xs">
                  Gerenciar
                </Button>
                <Button size="sm" onClick={onUpgrade} className="flex-1 text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Upgrade
                </Button>
              </>
            )}

            {(status === "past_due" || status === "incomplete") && (
              <Button size="sm" variant="destructive" onClick={onManage} className="flex-1 text-xs">
                <DollarSign className="h-3 w-3 mr-1" />
                Pagar Agora
              </Button>
            )}

            {(status === "cancelled" || status === "canceled") && (
              <Button size="sm" onClick={onUpgrade} className="flex-1 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Reativar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact variant for sidebars
export function CompactSubscriptionWidget(
  props: Omit<SubscriptionDashboardWidgetProps, "variant">,
) {
  return <SubscriptionDashboardWidget {...props} variant="compact" />;
}

// Detailed variant for main dashboard
export function DetailedSubscriptionWidget(
  props: Omit<SubscriptionDashboardWidgetProps, "variant">,
) {
  return <SubscriptionDashboardWidget {...props} variant="detailed" />;
}
