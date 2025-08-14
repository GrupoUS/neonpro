import { createClient } from "@/app/utils/supabase/server";
import { APDashboardStats } from "@/components/dashboard/accounts-payable/ap-dashboard-stats";
import { DashboardAlerts } from "@/components/dashboard/accounts-payable/dashboard-alerts";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bell,
  Building,
  Calculator,
  Calendar,
  CreditCard,
  FileText,
  Receipt,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AccountsPayablePage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Obter clinic_id do usuário
  const clinicId = user?.user_metadata?.clinic_id;

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Contas a Pagar" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contas a Pagar</h2>
          <p className="text-muted-foreground">
            Gerencie fornecedores, contas a pagar e pagamentos
          </p>
        </div>

        {/* Quick Stats */}
        <APDashboardStats />

        {/* Alertas e Notificações */}
        {clinicId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Placeholder para outros componentes */}
            </div>
            <div>
              <DashboardAlerts clinicId={clinicId} limit={5} />
            </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Vendor Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Fornecedores
              </CardTitle>
              <CardDescription>
                Gerencie informações de fornecedores e prestadores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Cadastre e gerencie fornecedores, suas informações de contato,
                dados fiscais e termos de pagamento.
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm">
                  <Link href="/dashboard/accounts-payable/vendors">
                    Ver Fornecedores
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Payable */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contas a Pagar
              </CardTitle>
              <CardDescription>
                Gerencie todas as contas a pagar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Registre faturas, controle vencimentos e acompanhe o status dos
                pagamentos pendentes.
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm">
                  <Link href="/dashboard/accounts-payable/payables">
                    Ver Contas
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Approval Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Aprovações
              </CardTitle>
              <CardDescription>
                Sistema de aprovação de pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Gerencie solicitações de aprovação, configure hierarquias e
                acompanhe o status das aprovações.
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm">
                  <Link href="/dashboard/accounts-payable/approvals">
                    Ver Aprovações
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Processing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pagamentos
              </CardTitle>
              <CardDescription>Processe e registre pagamentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Execute pagamentos individuais, registre comprovantes e mantenha
                histórico de transações.
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm">
                  <Link href="/dashboard/accounts-payable/payments">
                    Ver Pagamentos
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Payment Processing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Pagamentos em Lote
              </CardTitle>
              <CardDescription>Processe múltiplos pagamentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Selecione e processe várias contas a pagar simultaneamente,
                otimizando o fluxo de pagamentos.
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/accounts-payable/bulk-payments">
                    Processar Lote
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Vouchers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Comprovantes
              </CardTitle>
              <CardDescription>Gere e gerencie comprovantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Gere comprovantes de pagamento, imprima ou compartilhe
                documentos oficiais.
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/accounts-payable/vouchers">
                    Ver Comprovantes
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Schedules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Agendamentos
              </CardTitle>
              <CardDescription>
                Configure pagamentos recorrentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Automatize pagamentos recorrentes e configure lembretes para
                datas de vencimento.
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/accounts-payable/schedules">
                    Ver Agendamentos
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Relatórios
              </CardTitle>
              <CardDescription>Analise gastos e performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Visualize relatórios de gastos por categoria, fornecedor e
                período para melhor controle.
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/accounts-payable/reports">
                    Ver Relatórios
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Categorias
              </CardTitle>
              <CardDescription>Organize gastos por categorias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Configure categorias de despesas para melhor organização e
                controle dos gastos.
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/accounts-payable/categories">
                    Ver Categorias
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications and Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>Lembretes e alertas automáticos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Monitor automático de vencimentos, alertas de pagamentos e
                sistema de lembretes configurável.
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm">
                  <Link href="/dashboard/accounts-payable/notifications">
                    Ver Notificações
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas movimentações no sistema de contas a pagar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>Nenhuma atividade recente encontrada</p>
              <p className="text-sm mt-1">
                Comece cadastrando fornecedores ou criando contas a pagar
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
