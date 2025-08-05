"use client";

import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { useBilling } from "@/hooks/use-billing";
import type { CreditCard, DollarSign, FileText, Package, TrendingUp, Users } from "lucide-react";
import type { useState } from "react";
import type { InvoicesManagement } from "./invoices-management";
import type { PaymentsManagement } from "./payments-management";
import type { ServicesManagement } from "./services-management";

export function BillingDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { loading, financialSummary, invoices, payments, services } = useBilling();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  // Calculate overview metrics
  const totalRevenue = financialSummary?.total_revenue || 0;
  const pendingAmount = invoices
    .filter((inv) => ["pending", "overdue"].includes(inv.status))
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const completedPayments = payments.filter((p) => p.status === "completed").length;
  const activeServices = services.filter((s) => s.is_active).length;

  // Calculate monthly growth (placeholder - would need historical data)
  const monthlyGrowth = 15.2; // This would come from comparing current month vs previous
  const conversionRate =
    invoices.length > 0
      ? Math.round((invoices.filter((inv) => inv.status === "paid").length / invoices.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Sistema de Faturamento</h1>
        <p className="text-muted-foreground">
          Gerencie serviços, faturas e pagamentos da sua clínica
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  +{monthlyGrowth.toFixed(1)}% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valores Pendentes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  {invoices.filter((inv) => ["pending", "overdue"].includes(inv.status)).length}{" "}
                  faturas pendentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagamentos Recebidos</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedPayments}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(
                    payments
                      .filter((p) => p.status === "completed")
                      .reduce((sum, p) => sum + p.amount, 0),
                  )}{" "}
                  recebidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Serviços Ativos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeServices}</div>
                <p className="text-xs text-muted-foreground">
                  de {services.length} serviços cadastrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{conversionRate}%</div>
                <p className="text-xs text-muted-foreground">faturas pagas vs. enviadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {invoices.length > 0
                    ? formatCurrency(
                        totalRevenue / invoices.filter((inv) => inv.status === "paid").length || 1,
                      )
                    : formatCurrency(0)}
                </div>
                <p className="text-xs text-muted-foreground">valor médio por fatura paga</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Faturas Recentes</CardTitle>
                <CardDescription>Últimas faturas criadas ou atualizadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">#{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.issue_date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.total_amount)}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {invoice.status === "paid" && "Pago"}
                        {invoice.status === "pending" && "Pendente"}
                        {invoice.status === "draft" && "Rascunho"}
                        {invoice.status === "overdue" && "Vencido"}
                        {invoice.status === "cancelled" && "Cancelado"}
                      </p>
                    </div>
                  </div>
                ))}
                {invoices.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma fatura encontrada
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pagamentos Recentes</CardTitle>
                <CardDescription>Últimos pagamentos recebidos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">#{payment.payment_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.payment_date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {payment.status === "completed" && "Concluído"}
                        {payment.status === "processing" && "Processando"}
                        {payment.status === "pending" && "Pendente"}
                        {payment.status === "failed" && "Falhou"}
                        {payment.status === "cancelled" && "Cancelado"}
                      </p>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum pagamento encontrado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Serviços Mais Populares</CardTitle>
              <CardDescription>Serviços com maior número de faturas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.slice(0, 5).map((service, index) => (
                  <div key={service.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.category || "Sem categoria"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(service.base_price)}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.duration_minutes
                          ? `${service.duration_minutes}min`
                          : "Duração flexível"}
                      </p>
                    </div>
                  </div>
                ))}
                {services.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum serviço cadastrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <ServicesManagement />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoicesManagement />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
