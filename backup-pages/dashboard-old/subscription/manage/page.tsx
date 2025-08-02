"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  AlertTriangle,
  Calendar,
  Check,
  CreditCard,
  DollarSign,
  ExternalLink,
  Loader2,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SubscriptionData {
  id: string;
  plan_id: string;
  status: string;
  current_period_end: string;
  current_period_start: string;
  cancel_at_period_end: boolean;
  plan: {
    name: string;
    price: number;
    currency: string;
    interval: string;
    features: string[];
  };
}

export default function SubscriptionManagePage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [billingLoading, setBillingLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch subscription data from your API or Supabase
      const response = await fetch("/api/subscription/current");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
      toast.error("Erro ao carregar dados da assinatura");
    } finally {
      setLoading(false);
    }
  };

  const handleBillingPortal = async () => {
    setBillingLoading(true);
    try {
      const response = await fetch(
        "/api/stripe/create-billing-portal-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            return_url: `${window.location.origin}/dashboard/subscription/manage`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create billing portal session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error creating billing portal session:", error);
      toast.error("Erro ao acessar portal de cobrança");
    } finally {
      setBillingLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: {
      [key: string]: {
        label: string;
        variant: "default" | "destructive" | "outline" | "secondary";
      };
    } = {
      active: { label: "Ativa", variant: "default" },
      trialing: { label: "Período de Teste", variant: "outline" },
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

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Nenhuma Assinatura Encontrada</CardTitle>
            <CardDescription>
              Você não possui uma assinatura ativa no momento.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/pricing")}>
              Ver Planos Disponíveis
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gerenciar Assinatura
        </h1>
        <p className="text-gray-600">
          Gerencie sua assinatura, métodos de pagamento e faturas.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Status da Assinatura */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Status da Assinatura
              </CardTitle>
              {getStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {subscription.plan.name}
                </h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  {formatPrice(
                    subscription.plan.price,
                    subscription.plan.currency
                  )}
                  <span className="text-sm font-normal text-gray-500">
                    /{subscription.plan.interval === "month" ? "mês" : "ano"}
                  </span>
                </p>
                {subscription.cancel_at_period_end && (
                  <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Cancelamento agendado</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Período atual</p>
                    <p className="text-sm font-medium">
                      {formatDate(subscription.current_period_start)} -{" "}
                      {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Próxima cobrança</p>
                    <p className="text-sm font-medium">
                      {subscription.cancel_at_period_end
                        ? "Não haverá próxima cobrança"
                        : formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recursos do Plano */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos Incluídos</CardTitle>
            <CardDescription>
              Funcionalidades disponíveis no seu plano atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {subscription.plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gerenciar Cobrança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Gerenciar Cobrança
            </CardTitle>
            <CardDescription>
              Altere métodos de pagamento, veja faturas e gerencie sua
              assinatura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Use o portal de cobrança do Stripe para gerenciar seus métodos
                de pagamento, baixar faturas, atualizar informações de cobrança
                e muito mais.
              </p>

              <Button
                onClick={handleBillingPortal}
                disabled={billingLoading}
                className="w-full sm:w-auto"
              >
                {billingLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                Acessar Portal de Cobrança
              </Button>

              <Separator />

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">No portal você pode:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Atualizar métodos de pagamento</li>
                    <li>• Baixar faturas anteriores</li>
                    <li>• Alterar informações de cobrança</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Também é possível:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Cancelar ou pausar assinatura</li>
                    <li>• Alterar plano</li>
                    <li>• Ver histórico de pagamentos</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suporte */}
        <Card>
          <CardHeader>
            <CardTitle>Precisa de Ajuda?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Se você tiver dúvidas sobre sua assinatura ou precisar de suporte,
              nossa equipe está aqui para ajudar.
            </p>
            <Button variant="outline" asChild>
              <a href="mailto:suporte@neonpro.com">Entrar em Contato</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
