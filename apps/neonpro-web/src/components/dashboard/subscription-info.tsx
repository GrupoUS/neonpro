"use client";

import type {
  AlertTriangle,
  Building,
  Calendar,
  CreditCard,
  Loader2,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { useEffect, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SubscriptionData {
  id: string;
  plan_id: string;
  status: string;
  current_period_end: string;
  current_period_start: string;
  cancel_at_period_end: boolean;
  plan_name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  max_patients?: number;
  max_clinics?: number;
}

export function SubscriptionInfo() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const response = await fetch("/api/subscription/current");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else if (response.status === 401) {
        setError("Não autorizado");
      } else {
        setError("Erro ao carregar assinatura");
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price / 100);
  };

  const getStatusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) {
      return <Badge variant="destructive">Cancelando</Badge>;
    }

    const statusMap: {
      [key: string]: {
        label: string;
        variant: "default" | "destructive" | "outline" | "secondary";
      };
    } = {
      active: { label: "Ativa", variant: "default" },
      trialing: { label: "Teste", variant: "outline" },
      past_due: { label: "Em Atraso", variant: "destructive" },
      canceled: { label: "Cancelada", variant: "destructive" },
      unpaid: { label: "Não Paga", variant: "destructive" },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      variant: "outline" as const,
    };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getDaysUntilRenewal = (dateString: string) => {
    const renewalDate = new Date(dateString);
    const today = new Date();
    const diffTime = renewalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            Assinatura Necessária
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700 mb-4">
            Você precisa de uma assinatura ativa para usar o NeonPro.
          </p>
          <Button asChild size="sm">
            <Link href="/pricing">Ver Planos</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const daysUntilRenewal = getDaysUntilRenewal(subscription.current_period_end);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Assinatura
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(subscription.status, subscription.cancel_at_period_end)}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/subscription/manage">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{subscription.plan_name}</h3>
          <p className="text-lg font-bold text-blue-600">
            {formatPrice(subscription.price, subscription.currency)}
            <span className="text-sm font-normal text-gray-500">/mês</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-gray-600">Renovação</p>
              <p className="font-medium">
                {subscription.cancel_at_period_end
                  ? "Cancelada"
                  : formatDate(subscription.current_period_end)}
              </p>
            </div>
          </div>

          {subscription.max_patients && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-gray-600">Pacientes</p>
                <p className="font-medium">
                  Até {subscription.max_patients.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          )}

          {subscription.max_clinics && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-gray-600">Clínicas</p>
                <p className="font-medium">Até {subscription.max_clinics}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-gray-600">Dias restantes</p>
              <p className="font-medium">
                {subscription.cancel_at_period_end
                  ? `${daysUntilRenewal} dias`
                  : `${daysUntilRenewal} dias`}
              </p>
            </div>
          </div>
        </div>

        {subscription.cancel_at_period_end && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Sua assinatura será cancelada em {formatDate(subscription.current_period_end)}.
              </p>
            </div>
          </div>
        )}

        {daysUntilRenewal <= 7 && !subscription.cancel_at_period_end && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-800">
                Sua assinatura será renovada automaticamente em {daysUntilRenewal} dias.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
