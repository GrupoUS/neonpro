// app/dashboard/page.tsx
import { createClient } from "@/app/utils/supabase/server";
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
  Activity,
  Calendar,
  CalendarPlus,
  DollarSign,
  UserPlus,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Se não houver sessão, redireciona para login
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Mock data para demonstração
  const stats = {
    totalPatients: 1247,
    todayAppointments: 12,
    monthlyRevenue: 45680,
    activePatients: 892,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              NeonPro Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Bem-vindo,{" "}
              {user?.user_metadata?.full_name || user?.email?.split("@")[0]}!
            </p>
          </div>
          <form action="/api/auth/signout" method="post">
            <Button type="submit" variant="outline">
              Sair
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Olá,{" "}
              {user?.user_metadata?.full_name || user?.email?.split("@")[0]}!
            </h2>
            <p className="text-muted-foreground">
              Aqui está um resumo da sua clínica hoje.
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Nova Consulta
            </Button>
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Pacientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalPatients.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> em relação ao mês
                passado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Consultas Hoje
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.todayAppointments}
              </div>
              <p className="text-xs text-muted-foreground">
                7 concluídas, 5 pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Mensal
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.monthlyRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> em relação ao mês
                passado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pacientes Ativos
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePatients}</div>
              <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos de Hoje</CardTitle>
              <CardDescription>Suas consultas programadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">João Silva</p>
                    <p className="text-sm text-muted-foreground">
                      09:00 - Consulta
                    </p>
                  </div>
                  <Badge variant="default">Confirmado</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Maria Santos</p>
                    <p className="text-sm text-muted-foreground">
                      10:30 - Retorno
                    </p>
                  </div>
                  <Badge variant="secondary">Concluído</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Pedro Costa</p>
                    <p className="text-sm text-muted-foreground">
                      14:00 - Consulta
                    </p>
                  </div>
                  <Badge variant="outline">Pendente</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Rápido</CardTitle>
              <CardDescription>Estatísticas importantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Taxa de Ocupação</span>
                  <span className="font-medium">87%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Novos Pacientes</span>
                  <span className="font-medium">+23 esta semana</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Próxima Consulta</span>
                  <span className="font-medium">Em 30 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Receita Hoje</span>
                  <span className="font-medium">R$ 1.250</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades principais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <CalendarPlus className="h-6 w-6" />
                <span>Agendar Consulta</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <UserPlus className="h-6 w-6" />
                <span>Cadastrar Paciente</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Activity className="h-6 w-6" />
                <span>Ver Relatórios</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <DollarSign className="h-6 w-6" />
                <span>Financeiro</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
