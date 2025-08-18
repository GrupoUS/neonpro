'use client';

import {
  Alert,
  AlertDescription,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@neonpro/ui';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Heart,
  PieChart,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ClinicMetrics {
  totalPatients: number;
  appointmentsToday: number;
  pendingResults: number;
  revenue: number;
  patientSatisfaction: number;
  occupancyRate: number;
  averageWaitTime: number;
  completedAppointments: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'result' | 'payment' | 'registration';
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface DoctorStats {
  id: string;
  name: string;
  specialty: string;
  appointmentsToday: number;
  patientsSeen: number;
  rating: number;
  availability: 'available' | 'busy' | 'offline';
  avatar?: string;
}

const MOCK_METRICS: ClinicMetrics = {
  totalPatients: 1247,
  appointmentsToday: 18,
  pendingResults: 7,
  revenue: 45_780,
  patientSatisfaction: 4.8,
  occupancyRate: 87,
  averageWaitTime: 12,
  completedAppointments: 156,
};

const MOCK_ACTIVITIES: RecentActivity[] = [
  {
    id: '1',
    type: 'appointment',
    description: 'Nova consulta agendada - Maria Silva (Cardiologia)',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: 'success',
  },
  {
    id: '2',
    type: 'result',
    description: 'Resultado de exame disponível - João Santos',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'info',
  },
  {
    id: '3',
    type: 'payment',
    description: 'Pagamento recebido - Consulta #1234',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    status: 'success',
  },
  {
    id: '4',
    type: 'appointment',
    description: 'Consulta cancelada - Pedro Costa',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    status: 'warning',
  },
];

const MOCK_DOCTORS: DoctorStats[] = [
  {
    id: '1',
    name: 'Dr. Ana Silva',
    specialty: 'Cardiologia',
    appointmentsToday: 8,
    patientsSeen: 156,
    rating: 4.9,
    availability: 'available',
  },
  {
    id: '2',
    name: 'Dr. João Santos',
    specialty: 'Clínica Geral',
    appointmentsToday: 12,
    patientsSeen: 234,
    rating: 4.7,
    availability: 'busy',
  },
  {
    id: '3',
    name: 'Dr. Maria Costa',
    specialty: 'Pediatria',
    appointmentsToday: 6,
    patientsSeen: 89,
    rating: 4.8,
    availability: 'available',
  },
];

export default function ClinicDashboard() {
  const [metrics, setMetrics] = useState<ClinicMetrics>(MOCK_METRICS);
  const [activities, setActivities] =
    useState<RecentActivity[]>(MOCK_ACTIVITIES);
  const [doctors, setDoctors] = useState<DoctorStats[]>(MOCK_DOCTORS);
  const [timeRange, setTimeRange] = useState('today');

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'result':
        return <FileText className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'registration':
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityStatusColor = (status: RecentActivity['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAvailabilityBadge = (availability: DoctorStats['availability']) => {
    const variants = {
      available: 'bg-green-100 text-green-800',
      busy: 'bg-orange-100 text-orange-800',
      offline: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      available: 'Disponível',
      busy: 'Ocupado',
      offline: 'Offline',
    };

    return (
      <Badge className={variants[availability]}>{labels[availability]}</Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m atrás`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;

    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Dashboard da Clínica
          </h1>
          <p className="text-muted-foreground">
            Visão geral das operações e métricas em tempo real
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Relatório</Button>
          <Button>Exportar Dados</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Pacientes Total
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {metrics.totalPatients.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              <TrendingUp className="mr-1 inline h-3 w-3" />
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Consultas Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {metrics.appointmentsToday}
            </div>
            <p className="text-muted-foreground text-xs">
              {metrics.completedAppointments} concluídas este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Receita Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {formatCurrency(metrics.revenue)}
            </div>
            <p className="text-muted-foreground text-xs">
              <TrendingUp className="mr-1 inline h-3 w-3" />
              +8% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Satisfação</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {metrics.patientSatisfaction}/5.0
            </div>
            <p className="text-muted-foreground text-xs">
              Baseado em 127 avaliações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ocupação da Clínica</CardTitle>
            <CardDescription>
              Taxa de ocupação e tempo médio de espera
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-sm">Taxa de Ocupação</span>
                <span className="text-muted-foreground text-sm">
                  {metrics.occupancyRate}%
                </span>
              </div>
              <Progress className="h-2" value={metrics.occupancyRate} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Tempo médio de espera</span>
              </div>
              <span className="font-medium text-sm">
                {metrics.averageWaitTime} min
              </span>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {metrics.occupancyRate > 85
                  ? 'Alta ocupação - considere otimizar os agendamentos'
                  : 'Ocupação normal - fluxo de pacientes adequado'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultados Pendentes</CardTitle>
            <CardDescription>Exames aguardando liberação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="mb-2 font-bold text-3xl text-orange-600">
                {metrics.pendingResults}
              </div>
              <p className="mb-4 text-muted-foreground text-sm">
                exames pendentes de análise
              </p>
              <Button className="w-full" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Ver Todos os Resultados
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs className="space-y-6" defaultValue="doctors">
        <TabsList>
          <TabsTrigger value="doctors">Equipe Médica</TabsTrigger>
          <TabsTrigger value="activities">Atividades Recentes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Doctors Tab */}
        <TabsContent className="space-y-6" value="doctors">
          <Card>
            <CardHeader>
              <CardTitle>Status da Equipe Médica</CardTitle>
              <CardDescription>
                Disponibilidade e performance dos médicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctors.map((doctor) => (
                  <div
                    className="flex items-center justify-between rounded-lg border p-4"
                    key={doctor.id}
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={doctor.avatar} />
                        <AvatarFallback>
                          {doctor.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{doctor.name}</h4>
                        <p className="text-muted-foreground text-sm">
                          {doctor.specialty}
                        </p>
                        <div className="mt-1 flex items-center space-x-4">
                          <span className="text-muted-foreground text-xs">
                            {doctor.appointmentsToday} consultas hoje
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {doctor.patientsSeen} pacientes atendidos
                          </span>
                          <div className="flex items-center">
                            <Star className="mr-1 h-3 w-3 text-yellow-500" />
                            <span className="text-xs">{doctor.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getAvailabilityBadge(doctor.availability)}
                      <Button size="sm" variant="outline">
                        Ver Agenda
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent className="space-y-6" value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>
                Últimas ações e eventos na clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div className="flex items-start space-x-4" key={activity.id}>
                    <div
                      className={`rounded-full p-2 ${getActivityStatusColor(activity.status)} bg-opacity-10`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent className="space-y-6" value="analytics">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Consultas</CardTitle>
                <CardDescription>Por especialidade médica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  <PieChart className="h-16 w-16" />
                  <span className="ml-2">Gráfico de distribuição</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendência de Pacientes</CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16" />
                  <span className="ml-2">Gráfico de tendência</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
