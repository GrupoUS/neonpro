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

import type { cn } from "@/lib/utils";
import type { formatDistanceToNow } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  Settings,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { useSubscriptionStatus } from "../../hooks/use-subscription-status";
import type { Badge } from "../ui/badge";
import type { Button } from "../ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import type { Progress } from "../ui/progress";
import type { Separator } from "../ui/separator";
import type { Skeleton } from "../ui/skeleton";

export interface SubscriptionStatusCardProps {
  className?: string;
  variant?: "default" | "compact" | "detailed";
  showActions?: boolean;
  showFeatures?: boolean;
  showBilling?: boolean;
  onUpgrade?: () => void;
  onManage?: () => void;
  onCancel?: () => void;
}

export function SubscriptionStatusCard({
  className,
  variant = "default",
  showActions = true,
  showFeatures = true,
  showBilling = true,
  onUpgrade,
  onManage,
  onCancel,
}: SubscriptionStatusCardProps) {
  const { status, tier, features, gracePeriodEnd, nextBilling, isLoading, error, refresh } =
    useSubscriptionStatus();

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn("w-full border-destructive", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Erro na Assinatura
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={refresh} variant="outline">
            Tentar Novamente
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Status configuration
  const statusConfig = {
    active: {
      icon: CheckCircle2,
      label: "Ativa",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      badgeVariant: "default" as const,
    },
    trialing: {
      icon: Clock,
      label: "Período de Teste",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      badgeVariant: "secondary" as const,
    },
    past_due: {
      icon: AlertTriangle,
      label: "Pagamento Pendente",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      badgeVariant: "destructive" as const,
    },
    cancelled: {
      icon: Clock,
      label: "Cancelada",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      badgeVariant: "destructive" as const,
    },
    canceled: {
      icon: Clock,
      label: "Cancelada",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      badgeVariant: "destructive" as const,
    },
    incomplete: {
      icon: CreditCard,
      label: "Pagamento Incompleto",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      badgeVariant: "destructive" as const,
    },
  } as const;

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.cancelled;
  const StatusIcon = config.icon;

  // Calculate trial progress if applicable
  const getTrialProgress = () => {
    if (status !== "trialing" || !gracePeriodEnd) return null;

    const now = new Date();
    const end = new Date(gracePeriodEnd);
    const start = new Date(end.getTime() - 14 * 24 * 60 * 60 * 1000); // Assume 14-day trial

    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const progress = Math.max(0, Math.min(100, (elapsed / total) * 100));

    return {
      progress,
      daysLeft: Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
    };
  };

  const trialInfo = getTrialProgress();

  return (
    <Card className={cn("w-full", config.borderColor, className)}>
      <CardHeader className={cn("pb-3", config.bgColor)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={cn("h-6 w-6", config.color)} />
            <div>
              <CardTitle className="flex items-center gap-2">
                Status da Assinatura
                <Badge variant={config.badgeVariant}>{config.label}</Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                {tier && (
                  <span className="flex items-center gap-1">
                    <Crown className="h-4 w-4" />
                    Plano {tier}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          {variant !== "compact" && (
            <Button variant="ghost" size="sm" onClick={refresh}>
              Atualizar
            </Button>
          )}
        </div>

        {/* Trial progress */}
        {status === "trialing" && trialInfo && variant !== "compact" && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Período de teste</span>
              <span className="font-medium">{trialInfo.daysLeft} dias restantes</span>
            </div>
            <Progress value={trialInfo.progress} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Billing Information */}
        {showBilling && nextBilling && variant !== "compact" && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Próxima cobrança
            </div>
            <span className="text-sm font-medium">
              {formatDistanceToNow(new Date(nextBilling), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
        )}

        {/* Grace Period Warning */}
        {gracePeriodEnd && status === "past_due" && (
          <div className="rounded-md bg-orange-50 p-3 border border-orange-200">
            <div className="flex items-center gap-2 text-orange-800 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Período de Graça</span>
            </div>
            <p className="text-orange-700 text-sm mt-1">
              Acesso expira em{" "}
              {formatDistanceToNow(new Date(gracePeriodEnd), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        )}

        {/* Features List */}
        {showFeatures && features.length > 0 && variant === "detailed" && (
          <div>
            <Separator />
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-3">Funcionalidades Incluídas</h4>
              <div className="grid grid-cols-2 gap-2">
                {features.slice(0, 6).map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    {feature}
                  </div>
                ))}
              </div>
              {features.length > 6 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{features.length - 6} funcionalidades adicionais
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {showActions && variant !== "compact" && (
        <CardFooter className="flex gap-2">
          {status === "trialing" && (
            <Button onClick={onUpgrade} className="flex-1">
              <Crown className="h-4 w-4 mr-2" />
              Assinar Agora
            </Button>
          )}

          {status === "past_due" && (
            <Button onClick={onManage} variant="destructive" className="flex-1">
              <CreditCard className="h-4 w-4 mr-2" />
              Atualizar Pagamento
            </Button>
          )}

          {status === "cancelled" && (
            <Button onClick={onUpgrade} className="flex-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              Reativar Assinatura
            </Button>
          )}

          {status === "active" && (
            <>
              <Button onClick={onManage} variant="outline" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Gerenciar
              </Button>
              <Button onClick={onUpgrade} className="flex-1">
                <Zap className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
            </>
          )}

          {status === "incomplete" && (
            <Button onClick={onManage} variant="destructive" className="flex-1">
              <CreditCard className="h-4 w-4 mr-2" />
              Completar Pagamento
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
