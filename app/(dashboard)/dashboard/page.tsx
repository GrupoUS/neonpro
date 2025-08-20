import {
  Activity,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
} from 'lucide-react';
import type * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{value}</div>
        <p className="text-muted-foreground text-xs">{description}</p>
        {trend && (
          <div
            className={`flex items-center space-x-1 text-xs ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            <TrendingUp className="h-3 w-3" />
            <span>
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RecentActivityItem {
  id: string;
  type: 'appointment' | 'patient' | 'payment';
  title: string;
  description: string;
  time: string;
}

function RecentActivity() {
  const activities: RecentActivityItem[] = [
    {
      id: '1',
      type: 'appointment',
      title: 'Consulta agendada',
      description: 'Maria Silva - Limpeza de Pele',
      time: 'há 2 minutos',
    },
    {
      id: '2',
      type: 'patient',
      title: 'Novo paciente',
      description: 'João Santos cadastrado',
      time: 'há 15 minutos',
    },
    {
      id: '3',
      type: 'payment',
      title: 'Pagamento recebido',
      description: 'R$ 250,00 - Ana Costa',
      time: 'há 1 hora',
    },
    {
      id: '4',
      type: 'appointment',
      title: 'Consulta concluída',
      description: 'Pedro Lima - Botox',
      time: 'há 2 horas',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'patient':
        return <Users className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>Últimas atividades da sua clínica</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div className="flex items-center space-x-4" key={activity.id}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-medium text-sm">{activity.title}</p>
              <p className="text-muted-foreground text-xs">
                {activity.description}
              </p>
            </div>
            <div className="text-muted-foreground text-xs">{activity.time}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface UpcomingAppointment {
  id: string;
  patient: string;
  service: string;
  time: string;
  professional: string;
}

function UpcomingAppointments() {
  const appointments: UpcomingAppointment[] = [
    {
      id: '1',
      patient: 'Ana Costa',
      service: 'Botox',
      time: '14:00',
      professional: 'Dra. Maria',
    },
    {
      id: '2',
      patient: 'Carlos Silva',
      service: 'Limpeza de Pele',
      time: '15:30',
      professional: 'Esteticista João',
    },
    {
      id: '3',
      patient: 'Fernanda Oliveira',
      service: 'Preenchimento',
      time: '16:00',
      professional: 'Dra. Maria',
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Próximos Agendamentos</CardTitle>
          <CardDescription>Agendamentos para hoje</CardDescription>
        </div>
        <Button size="sm" variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Ver Agenda
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map((appointment) => (
          <div
            className="flex items-center justify-between border-primary border-l-2 pl-4"
            key={appointment.id}
          >
            <div className="space-y-1">
              <p className="font-medium text-sm">{appointment.patient}</p>
              <p className="text-muted-foreground text-xs">
                {appointment.service} • {appointment.professional}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium text-sm">{appointment.time}</span>
            </div>
          </div>
        ))}
        {appointments.length === 0 && (
          <p className="py-4 text-center text-muted-foreground text-sm">
            Nenhum agendamento para hoje
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const stats = [
    {
      title: 'Pacientes Ativos',
      value: 1248,
      description: 'Total de pacientes cadastrados',
      icon: Users,
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Agendamentos Hoje',
      value: 8,
      description: 'Consultas agendadas',
      icon: Calendar,
      trend: { value: 5, isPositive: true },
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 45.230',
      description: 'Faturamento do mês',
      icon: DollarSign,
      trend: { value: 18, isPositive: true },
    },
    {
      title: 'Taxa de Ocupação',
      value: '87%',
      description: 'Agenda ocupada',
      icon: TrendingUp,
      trend: { value: 3, isPositive: true },
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da sua clínica estética
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div>
            <UpcomingAppointments />
          </div>
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
            <div className="flex flex-wrap gap-2">
              <Button>
                <Users className="mr-2 h-4 w-4" />
                Novo Paciente
              </Button>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Consulta
              </Button>
              <Button variant="outline">
                <Activity className="mr-2 h-4 w-4" />
                Relatórios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
