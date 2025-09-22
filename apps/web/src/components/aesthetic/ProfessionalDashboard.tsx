'use client';

import { Button } from '@neonpro/ui';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  DollarSign,
  FileText,
  Shield,
  Star,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import React from 'react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export interface DashboardMetrics {
  patientsToday: number;
  totalPatients: number;
  revenue: {
    today: number;
    month: number;
    currency: string;
  };
  procedures: {
    completed: number;
    scheduled: number;
    pending: number;
  };
  compliance: {
    lgpdCompliance: number;
    anvisaCompliance: number;
    auditScore: number;
  };
  satisfaction: {
    averageRating: number;
    totalReviews: number;
    npsScore: number;
  };
}

export interface RecentActivity {
  id: string;
  type: 'assessment' | 'procedure' | 'consultation' | 'follow_up';
  patientName: string;
  patientAge: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'scheduled' | 'cancelled';
  procedureType?: string;
  price?: number;
  currency?: string;
}

export interface ComplianceAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  dueDate?: string;
  actionRequired: string;
}

export interface ProfessionalDashboardProps {
  metrics: DashboardMetrics;
  recentActivities: RecentActivity[];
  complianceAlerts: ComplianceAlert[];
  upcomingAppointments: Array<{
    id: string;
    patientName: string;
    patientAge: number;
    procedure: string;
    time: string;
    duration: string;
    type: 'consultation' | 'procedure' | 'follow_up';
  }>;
  professionalInfo: {
    name: string;
    specialization: string;
    registrationNumber: string;
    clinic: string;
  };
  onNavigateToPatients: () => void;
  onNavigateToSchedule: () => void;
  onNavigateToCompliance: () => void;
  onViewActivity: (activityId: string) => void;
}

export function ProfessionalDashboard({
  metrics,
  recentActivities,
  complianceAlerts,
  upcomingAppointments,
  professionalInfo,
  onNavigateToPatients,
  onNavigateToSchedule,
  onNavigateToCompliance,
}: ProfessionalDashboardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (_status: any) => {
    const statusConfig = {
      completed: { variant: 'default' as const, label: 'Concluído' },
      in_progress: { variant: 'secondary' as const, label: 'Em andamento' },
      scheduled: { variant: 'outline' as const, label: 'Agendado' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelado' },
    };

    return (
      statusConfig[status as keyof typeof statusConfig] || {
        variant: 'outline' as const,
        label: status,
      }
    );
  };

  const getActivityIcon = (_type: any) => {
    switch (type) {
      case 'assessment':
        return <FileText className='h-4 w-4' />;
      case 'procedure':
        return <Zap className='h-4 w-4' />;
      case 'consultation':
        return <Users className='h-4 w-4' />;
      case 'follow_up':
        return <UserCheck className='h-4 w-4' />;
      default:
        return <Activity className='h-4 w-4' />;
    }
  };

  const criticalAlerts = complianceAlerts.filter(
    alert => alert.type === 'critical',
  );
  const todayAppointments = upcomingAppointments.filter(apt => {
    const today = new Date().toDateString();
    return new Date(apt.time).toDateString() === today;
  });

  return (
    <div className='max-w-7xl mx-auto space-y-6'>
      {/* Cabeçalho do Dashboard */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Bem-vindo, Dr(a). {professionalInfo.name}
          </h1>
          <p className='text-gray-600 mt-1'>
            {professionalInfo.specialization} • {professionalInfo.clinic}
          </p>
          <p className='text-sm text-gray-500'>
            Registro: {professionalInfo.registrationNumber}
          </p>
        </div>
        <div className='mt-4 lg:mt-0'>
          <Button onClick={onNavigateToSchedule} className='mr-2'>
            <Calendar className='h-4 w-4 mr-2' />
            Ver Agenda
          </Button>
          <Button variant='outline' onClick={onNavigateToPatients}>
            <Users className='h-4 w-4 mr-2' />
            Pacientes
          </Button>
        </div>
      </div>

      {/* Alertas Críticos de Conformidade */}
      {criticalAlerts.length > 0 && (
        <div className='space-y-2'>
          {criticalAlerts.map(alert => (
            <Card key={alert.id} className='border-red-200 bg-red-50'>
              <CardContent className='pt-4'>
                <div className='flex items-start space-x-3'>
                  <AlertTriangle className='h-5 w-5 text-red-500 mt-0.5' />
                  <div className='flex-1'>
                    <h3 className='font-semibold text-red-800'>
                      {alert.title}
                    </h3>
                    <p className='text-sm text-red-700 mt-1'>
                      {alert.description}
                    </p>
                    <p className='text-xs text-red-600 mt-2'>
                      Ação necessária: {alert.actionRequired}
                      {alert.dueDate
                        && ` • Prazo: ${new Date(alert.dueDate).toLocaleDateString('pt-BR')}`}
                    </p>
                  </div>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={onNavigateToCompliance}
                  >
                    Resolver
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Métricas Principais */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pacientes Hoje
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.patientsToday}</div>
            <p className='text-xs text-muted-foreground'>
              Total: {metrics.totalPatients} pacientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Receita do Mês
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(metrics.revenue.month, metrics.revenue.currency)}
            </div>
            <p className='text-xs text-muted-foreground'>
              Hoje: {formatCurrency(metrics.revenue.today, metrics.revenue.currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Procedimentos</CardTitle>
            <BarChart3 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {metrics.procedures.completed}
            </div>
            <p className='text-xs text-muted-foreground'>
              {metrics.procedures.scheduled} agendados • {metrics.procedures.pending} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Satisfação</CardTitle>
            <Star className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {metrics.satisfaction.averageRating}/5
            </div>
            <p className='text-xs text-muted-foreground'>
              NPS: {metrics.satisfaction.npsScore} • {metrics.satisfaction.totalReviews} avaliações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conformidade LGPD/ANVISA */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            Status de Conformidade
          </CardTitle>
          <CardDescription>
            Monitoramento de conformidade LGPD, ANVISA e auditoria interna
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>LGPD</span>
                <Badge
                  className={metrics.compliance.lgpdCompliance >= 95
                    ? 'bg-green-100 text-green-800'
                    : metrics.compliance.lgpdCompliance >= 80
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'}
                >
                  {metrics.compliance.lgpdCompliance}%
                </Badge>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${metrics.compliance.lgpdCompliance}%` }}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>ANVISA</span>
                <Badge
                  className={metrics.compliance.anvisaCompliance >= 95
                    ? 'bg-green-100 text-green-800'
                    : metrics.compliance.anvisaCompliance >= 80
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'}
                >
                  {metrics.compliance.anvisaCompliance}%
                </Badge>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-green-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${metrics.compliance.anvisaCompliance}%` }}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Auditoria</span>
                <Badge
                  className={metrics.compliance.auditScore >= 95
                    ? 'bg-green-100 text-green-800'
                    : metrics.compliance.auditScore >= 80
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'}
                >
                  {metrics.compliance.auditScore}%
                </Badge>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-purple-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${metrics.compliance.auditScore}%` }}
                />
              </div>
            </div>
          </div>

          <div className='mt-4 flex justify-end'>
            <Button
              variant='outline'
              size='sm'
              onClick={onNavigateToCompliance}
            >
              Ver Relatório Completo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agenda do Dia e Atividades */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Agenda do Dia */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              Agenda de Hoje
            </CardTitle>
            <CardDescription>
              {todayAppointments.length} compromissos agendados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0
              ? (
                <p className='text-gray-500 text-center py-4'>
                  Nenhum compromisso agendado para hoje
                </p>
              )
              : (
                <div className='space-y-3'>
                  {todayAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                    >
                      <div>
                        <p className='font-medium'>{appointment.patientName}</p>
                        <p className='text-sm text-gray-600'>
                          {appointment.procedure}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {new Date(appointment.time).toLocaleTimeString(
                            'pt-BR',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )} • {appointment.duration}
                        </p>
                      </div>
                      <Badge variant='outline'>
                        {appointment.type === 'consultation'
                          ? 'Consulta'
                          : appointment.type === 'procedure'
                          ? 'Procedimento'
                          : 'Follow-up'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            <div className='mt-4'>
              <Button
                variant='outline'
                className='w-full'
                onClick={onNavigateToSchedule}
              >
                Ver Agenda Completa
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='h-5 w-5' />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas atividades realizadas na clínica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {recentActivities.slice(0, 5).map(activity => (
                <div
                  key={activity.id}
                  className='flex items-start space-x-3 p-3 bg-gray-50 rounded-lg'
                >
                  <div className='mt-0.5'>{getActivityIcon(activity.type)}</div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between'>
                      <p className='text-sm font-medium truncate'>
                        {activity.patientName} ({activity.patientAge} anos)
                      </p>
                      <Badge
                        {...getStatusBadge(activity.status)}
                        className='ml-2 text-xs'
                      >
                        {getStatusBadge(activity.status).label}
                      </Badge>
                    </div>
                    <p className='text-sm text-gray-600 truncate'>
                      {activity.description}
                    </p>
                    <div className='flex items-center justify-between mt-1'>
                      <p className='text-xs text-gray-500'>
                        {new Date(activity.timestamp).toLocaleString('pt-BR')}
                      </p>
                      {activity.price && (
                        <p className='text-xs font-medium text-green-600'>
                          {formatCurrency(
                            activity.price,
                            activity.currency || 'R$',
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className='mt-4'>
              <Button variant='outline' className='w-full'>
                Ver Todas as Atividades
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
