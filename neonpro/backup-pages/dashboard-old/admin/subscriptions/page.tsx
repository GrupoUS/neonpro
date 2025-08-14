import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  AlertTriangle,
  Calendar,
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface SubscriptionStats {
  total_subscriptions: number;
  active_subscriptions: number;
  monthly_revenue: number;
  canceled_subscriptions: number;
  expiring_soon: number;
  new_this_month: number;
}

export default async function SubscriptionAdminPage() {
  const supabase = createServerComponentClient({ cookies });

  // Check if user is authenticated and is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has admin role (you might want to implement role-based access)
  // For now, we'll assume only certain email domains or specific users are admins
  const isAdmin =
    user.email?.includes("@neonpro.com") || user.email === "admin@example.com";

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Fetch subscription statistics
  const stats: SubscriptionStats = {
    total_subscriptions: 0,
    active_subscriptions: 0,
    monthly_revenue: 0,
    canceled_subscriptions: 0,
    expiring_soon: 0,
    new_this_month: 0,
  };

  try {
    // Get total subscriptions count
    const { count: totalSubs } = await supabase
      .from("user_subscriptions")
      .select("*", { count: "exact", head: true });

    stats.total_subscriptions = totalSubs || 0;

    // Get active subscriptions
    const { count: activeSubs } = await supabase
      .from("user_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    stats.active_subscriptions = activeSubs || 0;

    // Get canceled subscriptions
    const { count: canceledSubs } = await supabase
      .from("user_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("cancel_at_period_end", true);

    stats.canceled_subscriptions = canceledSubs || 0;

    // Get subscriptions expiring soon (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { count: expiringSoon } = await supabase
      .from("user_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .lte("current_period_end", sevenDaysFromNow.toISOString());

    stats.expiring_soon = expiringSoon || 0;

    // Get new subscriptions this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newThisMonth } = await supabase
      .from("user_subscriptions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());

    stats.new_this_month = newThisMonth || 0;

    // Calculate monthly revenue (simplified - you'd want more sophisticated logic)
    const { data: activeSubscriptions } = await supabase
      .from("user_subscriptions_view")
      .select("price")
      .eq("status", "active");

    if (activeSubscriptions) {
      stats.monthly_revenue = activeSubscriptions.reduce(
        (sum, sub) => sum + (sub.price || 0),
        0
      );
    }
  } catch (error) {
    console.error("Error fetching subscription stats:", error);
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard de Assinaturas
        </h1>
        <p className="text-gray-600">
          Visão geral das assinaturas e métricas do NeonPro
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Subscriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Assinaturas
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_subscriptions}
            </div>
            <p className="text-xs text-muted-foreground">
              Todas as assinaturas criadas
            </p>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assinaturas Ativas
            </CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active_subscriptions}
            </div>
            <p className="text-xs text-muted-foreground">Pagantes ativos</p>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.monthly_revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita recorrente mensal
            </p>
          </CardContent>
        </Card>

        {/* New This Month */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novos Este Mês
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.new_this_month}
            </div>
            <p className="text-xs text-muted-foreground">
              Novos assinantes este mês
            </p>
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Expirando em Breve
            </CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.expiring_soon}
            </div>
            <p className="text-xs text-muted-foreground">
              Expiram nos próximos 7 dias
            </p>
          </CardContent>
        </Card>

        {/* Canceled Subscriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cancelamentos Agendados
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.canceled_subscriptions}
            </div>
            <p className="text-xs text-muted-foreground">
              Cancelam no final do período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Performance</CardTitle>
            <CardDescription>Indicadores chave do negócio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Taxa de Conversão</span>
              <span className="text-sm font-medium">
                {stats.total_subscriptions > 0
                  ? (
                      (stats.active_subscriptions / stats.total_subscriptions) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                Taxa de Cancelamento
              </span>
              <span className="text-sm font-medium">
                {stats.active_subscriptions > 0
                  ? (
                      (stats.canceled_subscriptions /
                        stats.active_subscriptions) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Crescimento Mensal</span>
              <span className="text-sm font-medium text-green-600">
                +{stats.new_this_month}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Recomendadas</CardTitle>
            <CardDescription>Baseado nos dados atuais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.expiring_soon > 0 && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  {stats.expiring_soon} assinaturas expirando - considere
                  campanha de retenção
                </span>
              </div>
            )}

            {stats.canceled_subscriptions > 0 && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  {stats.canceled_subscriptions} cancelamentos agendados -
                  investigar motivos
                </span>
              </div>
            )}

            {stats.new_this_month < 5 && (
              <div className="flex items-center gap-2 text-blue-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">
                  Poucos novos assinantes - intensificar marketing
                </span>
              </div>
            )}

            {stats.active_subscriptions === 0 && (
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span className="text-sm">
                  Nenhuma assinatura ativa - revisar estratégia de preços
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
