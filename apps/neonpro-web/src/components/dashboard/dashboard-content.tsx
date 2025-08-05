"use client";

import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Users,
  Calendar,
  DollarSign,
  Activity,
  TrendingUp,
  Clock,
  UserPlus,
  CalendarPlus,
} from "lucide-react";

interface DashboardContentProps {
  user: any;
}

export function DashboardContent({ user }: DashboardContentProps) {
  // Mock data - em produção, estes dados viriam de uma API
  const stats = {
    totalPatients: 1247,
    todayAppointments: 12,
    monthlyRevenue: 45680,
    activePatients: 892,
    pendingAppointments: 5,
    completedToday: 7,
  };

  const recentAppointments = [
    {
      id: 1,
      patient: "João Silva",
      time: "09:00",
      type: "Consulta",
      status: "confirmed",
    },
    {
      id: 2,
      patient: "Maria Santos",
      time: "10:30",
      type: "Retorno",
      status: "completed",
    },
    {
      id: 3,
      patient: "Pedro Costa",
      time: "14:00",
      type: "Consulta",
      status: "pending",
    },
    {
      id: 4,
      patient: "Ana Oliveira",
      time: "15:30",
      type: "Exame",
      status: "confirmed",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default">Confirmado</Badge>;
      case "completed":
        return <Badge variant="secondary">Concluído</Badge>;
      case "pending":
        return <Badge variant="outline">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Olá, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}!
          </h2>
          <p className="text-muted-foreground">Aqui está um resumo da sua clínica hoje.</p>
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
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedToday} concluídas, {stats.pendingAppointments} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePatients}</div>
            <p className="text-xs text-muted-foreground">
              Pacientes com consultas nos últimos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Appointments Today */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Agendamentos de Hoje</CardTitle>
            <CardDescription>Suas consultas programadas para hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.patient}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.time} - {appointment.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(appointment.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Resumo Rápido</CardTitle>
            <CardDescription>Estatísticas importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Taxa de Ocupação</span>
                </div>
                <span className="font-medium">87%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Novos Pacientes</span>
                </div>
                <span className="font-medium">+23 esta semana</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Próxima Consulta</span>
                </div>
                <span className="font-medium">Em 30 min</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Receita Hoje</span>
                </div>
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
          <CardDescription>Acesso rápido às funcionalidades mais utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
}
