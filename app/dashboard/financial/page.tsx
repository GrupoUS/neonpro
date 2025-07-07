import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  PiggyBank,
  Calendar,
  BarChart3,
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function FinancialPage() {
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

  // Mock data para demonstração
  const financialData = {
    monthlyRevenue: 45680,
    monthlyExpenses: 18500,
    netProfit: 27180,
    pendingPayments: 8950,
    recentTransactions: [
      {
        id: 1,
        type: "Receita",
        description: "Consulta - João Silva",
        amount: 150,
        date: "2024-01-15",
        status: "Pago",
      },
      {
        id: 2,
        type: "Despesa",
        description: "Material médico",
        amount: -350,
        date: "2024-01-14",
        status: "Pago",
      },
      {
        id: 3,
        type: "Receita",
        description: "Exame - Maria Santos",
        amount: 280,
        date: "2024-01-14",
        status: "Pendente",
      },
    ],
  };

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Financeiro" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Financeiro</h2>
            <p className="text-muted-foreground">
              Controle financeiro da sua clínica
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/financial/reports">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Relatórios
              </Button>
            </Link>
            <Button>
              <Receipt className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Mensal
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {financialData.monthlyRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12%
                </span>
                vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Despesas Mensais
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {financialData.monthlyExpenses.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +5%
                </span>
                vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Lucro Líquido
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                R$ {financialData.netProfit.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +18%
                </span>
                vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pagamentos Pendentes
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                R$ {financialData.pendingPayments.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                15 transações pendentes
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>
                Últimas movimentações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            transaction.type === "Receita" ? "default" : "secondary"
                          }
                        >
                          {transaction.type}
                        </Badge>
                        <span className="text-sm font-medium">
                          {transaction.description}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-bold ${
                          transaction.amount > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}R${" "}
                        {Math.abs(transaction.amount).toLocaleString()}
                      </div>
                      <Badge
                        variant={
                          transaction.status === "Pago" ? "default" : "outline"
                        }
                        className="text-xs"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/dashboard/financial/payments">
                  <Button variant="outline" className="w-full">
                    Ver Todas as Transações
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às funcionalidades financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Link href="/dashboard/financial/revenue">
                  <Button variant="outline" className="w-full h-16 flex-col gap-2">
                    <DollarSign className="h-6 w-6" />
                    <span>Gerenciar Receitas</span>
                  </Button>
                </Link>
                <Link href="/dashboard/financial/payments">
                  <Button variant="outline" className="w-full h-16 flex-col gap-2">
                    <CreditCard className="h-6 w-6" />
                    <span>Controlar Pagamentos</span>
                  </Button>
                </Link>
                <Link href="/dashboard/financial/reports">
                  <Button variant="outline" className="w-full h-16 flex-col gap-2">
                    <BarChart3 className="h-6 w-6" />
                    <span>Relatórios Financeiros</span>
                  </Button>
                </Link>
                <Button variant="outline" className="w-full h-16 flex-col gap-2">
                  <Receipt className="h-6 w-6" />
                  <span>Emitir Nota Fiscal</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro do Mês</CardTitle>
            <CardDescription>
              Visão geral das finanças de {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  R$ {financialData.monthlyRevenue.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total de Receitas</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  R$ {financialData.monthlyExpenses.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total de Despesas</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  R$ {financialData.netProfit.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Lucro Líquido</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}