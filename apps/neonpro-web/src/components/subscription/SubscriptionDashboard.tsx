/**
 * Subscription Dashboard Component
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
 */

"use client";

import type {
  AlertTriangle,
  Calendar,
  Check,
  CreditCard,
  Crown,
  Rocket,
  Star,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";
import type { formatCurrency } from "@/lib/utils";

interface SubscriptionData {
  id: string;
  status: "trial" | "active" | "past_due" | "canceled" | "unpaid";
  plan: {
    id: string;
    name: string;
    display_name: string;
    features: Record<string, boolean>;
    limits: Record<string, number>;
    price_monthly: number;
    price_quarterly: number;
    price_yearly: number;
  };
  billing_cycle: "monthly" | "quarterly" | "yearly";
  current_period_end: string;
  trial_end?: string;
  next_billing_date?: string;
  cancel_at_period_end: boolean;
  status_info: {
    status: string;
    message: string;
    action_required: boolean;
  };
  usage_stats: Record<
    string,
    {
      current: number;
      limit: number | string;
      percentage: number;
      remaining: number;
    }
  >;
  formatted_dates: {
    current_period_end: string;
    trial_end?: string;
    next_billing_date?: string;
  };
}

interface SubscriptionDashboardProps {
  onUpgrade?: () => void;
  onManageBilling?: () => void;
  onCancelSubscription?: () => void;
}

export default function SubscriptionDashboard({
  onUpgrade,
  onManageBilling,
  onCancelSubscription,
}: SubscriptionDashboardProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscription/current");
      const result = await response.json();

      if (result.success) {
        setSubscription(result.data);
      } else {
        setError(result.message || "Erro ao carregar dados da assinatura");
      }
    } catch (err) {
      setError("Erro de conexão ao carregar assinatura");
      console.error("Error fetching subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "basic":
        return <Star className="h-5 w-5 text-blue-500" />;
      case "professional":
        return <Rocket className="h-5 w-5 text-purple-500" />;
      case "enterprise":
        return <Crown className="h-5 w-5 text-yellow-500" />;
      default:
        return <Star className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      trial: { variant: "secondary" as const, label: "Período de Teste" },
      active: { variant: "default" as const, label: "Ativo" },
      past_due: { variant: "destructive" as const, label: "Vencido" },
      canceled: { variant: "outline" as const, label: "Cancelado" },
      unpaid: { variant: "destructive" as const, label: "Não Pago" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !subscription) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma Assinatura Encontrada</CardTitle>
          <CardDescription>
            Você ainda não possui uma assinatura ativa. Escolha um plano para começar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onUpgrade} className="w-full">
            Escolher Plano
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {subscription.status_info.action_required && (
        <Alert
          variant={subscription.status_info.status === "trial_ending" ? "default" : "destructive"}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{subscription.status_info.message}</AlertDescription>
        </Alert>
      )}

      {/* Subscription Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
            {getPlanIcon(subscription.plan.name)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscription.plan.display_name}</div>
            <div className="flex items-center space-x-2 mt-2">
              {getStatusBadge(subscription.status)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Pagamento</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription.status === "trial" && subscription.formatted_dates.trial_end
                ? subscription.formatted_dates.trial_end
                : subscription.formatted_dates.next_billing_date || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription.status === "trial" ? "Fim do teste" : "Data de cobrança"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Mensal</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(subscription.plan.price_monthly)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ciclo:{" "}
              {subscription.billing_cycle === "monthly"
                ? "Mensal"
                : subscription.billing_cycle === "quarterly"
                  ? "Trimestral"
                  : "Anual"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription.usage_stats.max_users?.current || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              de{" "}
              {subscription.usage_stats.max_users?.limit === "Unlimited"
                ? "ilimitados"
                : subscription.usage_stats.max_users?.limit || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Uso do Plano</CardTitle>
          <CardDescription>Acompanhe o uso dos recursos do seu plano atual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(subscription.usage_stats).map(([key, usage]) => {
            const isUnlimited = usage.limit === "Unlimited" || usage.limit === -1;
            const percentage = isUnlimited ? 0 : usage.percentage;

            const labels: Record<string, string> = {
              max_patients: "Pacientes",
              max_appointments_per_month: "Consultas/mês",
              max_users: "Usuários",
              storage_gb: "Armazenamento (GB)",
              sms_notifications: "SMS/mês",
              email_notifications: "E-mails/mês",
            };

            return (
              <div key={key} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{labels[key] || key}</span>
                  <span>
                    {usage.current} / {isUnlimited ? "∞" : usage.limit}
                  </span>
                </div>
                <Progress
                  value={percentage}
                  className="h-2"
                  // Add color coding based on usage
                  // @ts-ignore
                  variant={
                    percentage > 90 ? "destructive" : percentage > 70 ? "warning" : "default"
                  }
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Feature List */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos do Plano</CardTitle>
          <CardDescription>
            Funcionalidades incluídas no seu plano {subscription.plan.display_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(subscription.plan.features).map(([feature, enabled]) => {
              const featureLabels: Record<string, string> = {
                appointment_management: "Gestão de Consultas",
                patient_records: "Prontuários Digitais",
                basic_reports: "Relatórios Básicos",
                advanced_reports: "Relatórios Avançados",
                bi_dashboard: "Dashboard BI",
                inventory_management: "Gestão de Estoque",
                financial_management: "Gestão Financeira",
                email_notifications: "Notificações por E-mail",
                sms_notifications: "Notificações por SMS",
                mobile_app: "Aplicativo Mobile",
                api_access: "Acesso à API",
                priority_support: "Suporte Prioritário",
                lgpd_compliance: "Conformidade LGPD",
              };

              return (
                <div key={feature} className="flex items-center space-x-2">
                  {enabled ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={enabled ? "text-foreground" : "text-muted-foreground"}>
                    {featureLabels[feature] || feature}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={onUpgrade} className="flex-1">
          <TrendingUp className="mr-2 h-4 w-4" />
          Fazer Upgrade
        </Button>
        <Button variant="outline" onClick={onManageBilling} className="flex-1">
          <CreditCard className="mr-2 h-4 w-4" />
          Gerenciar Cobrança
        </Button>
        {subscription.status === "active" && !subscription.cancel_at_period_end && (
          <Button variant="destructive" onClick={onCancelSubscription} className="flex-1">
            <X className="mr-2 h-4 w-4" />
            Cancelar Assinatura
          </Button>
        )}
      </div>
    </div>
  );
}
