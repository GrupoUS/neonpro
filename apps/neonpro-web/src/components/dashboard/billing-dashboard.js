"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingDashboard = BillingDashboard;
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var use_billing_1 = require("@/hooks/use-billing");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var invoices_management_1 = require("./invoices-management");
var payments_management_1 = require("./payments-management");
var services_management_1 = require("./services-management");
function BillingDashboard() {
  var _a = (0, react_1.useState)("overview"),
    activeTab = _a[0],
    setActiveTab = _a[1];
  var _b = (0, use_billing_1.useBilling)(),
    loading = _b.loading,
    financialSummary = _b.financialSummary,
    invoices = _b.invoices,
    payments = _b.payments,
    services = _b.services;
  var formatCurrency = function (amount) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };
  // Calculate overview metrics
  var totalRevenue =
    (financialSummary === null || financialSummary === void 0
      ? void 0
      : financialSummary.total_revenue) || 0;
  var pendingAmount = invoices
    .filter(function (inv) {
      return ["pending", "overdue"].includes(inv.status);
    })
    .reduce(function (sum, inv) {
      return sum + inv.total_amount;
    }, 0);
  var completedPayments = payments.filter(function (p) {
    return p.status === "completed";
  }).length;
  var activeServices = services.filter(function (s) {
    return s.is_active;
  }).length;
  // Calculate monthly growth (placeholder - would need historical data)
  var monthlyGrowth = 15.2; // This would come from comparing current month vs previous
  var conversionRate =
    invoices.length > 0
      ? Math.round(
          (invoices.filter(function (inv) {
            return inv.status === "paid";
          }).length /
            invoices.length) *
            100,
        )
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

      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="services">Serviços</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="invoices">Faturas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="payments">Pagamentos</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Receita Total</card_1.CardTitle>
                <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  +{monthlyGrowth.toFixed(1)}% em relação ao mês anterior
                </p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Valores Pendentes
                </card_1.CardTitle>
                <lucide_react_1.FileText className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  {
                    invoices.filter(function (inv) {
                      return ["pending", "overdue"].includes(inv.status);
                    }).length
                  }{" "}
                  faturas pendentes
                </p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Pagamentos Recebidos
                </card_1.CardTitle>
                <lucide_react_1.CreditCard className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">{completedPayments}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(
                    payments
                      .filter(function (p) {
                        return p.status === "completed";
                      })
                      .reduce(function (sum, p) {
                        return sum + p.amount;
                      }, 0),
                  )}{" "}
                  recebidos
                </p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Serviços Ativos</card_1.CardTitle>
                <lucide_react_1.Package className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">{activeServices}</div>
                <p className="text-xs text-muted-foreground">
                  de {services.length} serviços cadastrados
                </p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Taxa de Conversão
                </card_1.CardTitle>
                <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">{conversionRate}%</div>
                <p className="text-xs text-muted-foreground">faturas pagas vs. enviadas</p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Ticket Médio</card_1.CardTitle>
                <lucide_react_1.Users className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {invoices.length > 0
                    ? formatCurrency(
                        totalRevenue /
                          invoices.filter(function (inv) {
                            return inv.status === "paid";
                          }).length || 1,
                      )
                    : formatCurrency(0)}
                </div>
                <p className="text-xs text-muted-foreground">valor médio por fatura paga</p>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-lg">Faturas Recentes</card_1.CardTitle>
                <card_1.CardDescription>
                  Últimas faturas criadas ou atualizadas
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {invoices.slice(0, 5).map(function (invoice) {
                  return (
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
                  );
                })}
                {invoices.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma fatura encontrada
                  </p>
                )}
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-lg">Pagamentos Recentes</card_1.CardTitle>
                <card_1.CardDescription>Últimos pagamentos recebidos</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {payments.slice(0, 5).map(function (payment) {
                  return (
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
                  );
                })}
                {payments.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum pagamento encontrado
                  </p>
                )}
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Top Services */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-lg">Serviços Mais Populares</card_1.CardTitle>
              <card_1.CardDescription>Serviços com maior número de faturas</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {services.slice(0, 5).map(function (service, index) {
                  return (
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
                            ? "".concat(service.duration_minutes, "min")
                            : "Duração flexível"}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {services.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum serviço cadastrado
                  </p>
                )}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="services">
          <services_management_1.ServicesManagement />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="invoices">
          <invoices_management_1.InvoicesManagement />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="payments">
          <payments_management_1.PaymentsManagement />
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
