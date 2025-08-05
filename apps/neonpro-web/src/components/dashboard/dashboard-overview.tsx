"use client";

import type {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  Plus,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import type { useState } from "react";

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
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { formatCurrency, formatDate } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    type: "increase" | "decrease";
    value: string;
    period: string;
  };
  icon: React.ElementType;
  description?: string;
}

function KPICard({ title, value, change, icon: Icon, description }: KPICardProps) {
  return (
    <Card className="medical-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {change.type === "increase" ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={change.type === "increase" ? "text-green-600" : "text-red-600"}>
              {change.value}
            </span>
            {change.period}
          </p>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

interface RecentActivity {
  id: string;
  type: "appointment" | "patient" | "payment" | "alert";
  title: string;
  description: string;
  time: string;
  status?: "completed" | "pending" | "cancelled";
}

interface UpcomingAppointment {
  id: string;
  patient_name: string;
  service: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
  is_new_patient: boolean;
}

export function DashboardOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  // Mock data - replace with real API calls
  const kpiData = {
    totalPatients: 1247,
    monthlyRevenue: 89750,
    todayAppointments: 12,
    patientSatisfaction: 4.8,
    averageTicket: 435,
    conversionRate: 78,
  };

  const recentActivities: RecentActivity[] = [
    {
      id: "1",
      type: "appointment",
      title: "Nova consulta agendada",
      description: "Maria Silva - Botox facial - 14:30",
      time: "5 min atrás",
      status: "pending",
    },
    {
      id: "2",
      type: "payment",
      title: "Pagamento recebido",
      description: "João Costa - R$ 890,00 - Preenchimento labial",
      time: "15 min atrás",
      status: "completed",
    },
    {
      id: "3",
      type: "patient",
      title: "Novo paciente cadastrado",
      description: "Ana Rodrigues - 28 anos - Indicação de paciente",
      time: "32 min atrás",
    },
    {
      id: "4",
      type: "alert",
      title: "Estoque baixo",
      description: "Ácido hialurônico - Restam apenas 3 unidades",
      time: "1h atrás",
    },
  ];

  const upcomingAppointments: UpcomingAppointment[] = [
    {
      id: "1",
      patient_name: "Maria Silva",
      service: "Botox facial",
      time: "14:30",
      status: "confirmed",
      is_new_patient: false,
    },
    {
      id: "2",
      patient_name: "Carlos Oliveira",
      service: "Preenchimento labial",
      time: "15:15",
      status: "confirmed",
      is_new_patient: true,
    },
    {
      id: "3",
      patient_name: "Ana Rodrigues",
      service: "Consulta avaliação",
      time: "16:00",
      status: "pending",
      is_new_patient: true,
    },
    {
      id: "4",
      patient_name: "Patricia Lima",
      service: "Limpeza de pele",
      time: "16:45",
      status: "confirmed",
      is_new_patient: false,
    },
  ];

  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case "appointment":
        return status === "completed" ? CheckCircle2 : Calendar;
      case "payment":
        return DollarSign;
      case "patient":
        return Users;
      case "alert":
        return AlertCircle;
      default:
        return Activity;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Confirmado
          </Badge>
        );
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da sua clínica estética - {formatDate(new Date())}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Hoje</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>

          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total de Pacientes"
          value={kpiData.totalPatients.toLocaleString("pt-BR")}
          change={{
            type: "increase",
            value: "+12%",
            period: "vs. mês anterior",
          }}
          icon={Users}
          description="Pacientes ativos na base"
        />

        <KPICard
          title="Receita Mensal"
          value={formatCurrency(kpiData.monthlyRevenue)}
          change={{
            type: "increase",
            value: "+8.2%",
            period: "vs. mês anterior",
          }}
          icon={DollarSign}
          description="Faturamento do mês atual"
        />

        <KPICard
          title="Agendamentos Hoje"
          value={kpiData.todayAppointments}
          icon={Calendar}
          description="Consultas e procedimentos"
        />

        <KPICard
          title="Satisfação"
          value={`${kpiData.patientSatisfaction}/5.0`}
          change={{
            type: "increase",
            value: "+0.2",
            period: "vs. mês anterior",
          }}
          icon={Star}
          description="Avaliação média dos pacientes"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpiData.averageTicket)}</div>
            <div className="mt-2">
              <Progress value={72} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Meta mensal: {formatCurrency(600)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.conversionRate}%</div>
            <div className="mt-2">
              <Progress value={kpiData.conversionRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Consultas → Procedimentos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ocupação Agenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <div className="mt-2">
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Horários preenchidos esta semana</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Atividades Recentes</CardTitle>
                <CardDescription>Últimas movimentações da clínica</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => {
                const IconComponent = getActivityIcon(activity.type, activity.status);
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                    {activity.status && (
                      <div className="flex-shrink-0">{getStatusBadge(activity.status)}</div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Today's Appointments */}
        <div>
          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Agenda de Hoje
                </CardTitle>
                <CardDescription>{upcomingAppointments.length} agendamentos</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Ver Todos
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {appointment.patient_name}
                      </p>
                      {appointment.is_new_patient && (
                        <Badge variant="secondary" className="text-xs">
                          Novo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{appointment.service}</p>
                    <p className="text-xs text-muted-foreground">{appointment.time}</p>
                  </div>
                  <div className="flex-shrink-0">{getStatusBadge(appointment.status)}</div>
                </div>
              ))}

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesso rápido às funcionalidades mais utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="w-6 h-6" />
              <span className="text-sm">Novo Paciente</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Agendar Consulta</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Activity className="w-6 h-6" />
              <span className="text-sm">Novo Prontuário</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="w-6 h-6" />
              <span className="text-sm">Registrar Pagamento</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
