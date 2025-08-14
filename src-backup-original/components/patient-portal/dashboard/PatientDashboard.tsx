'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  Clock, 
  TrendingUp, 
  Heart,
  ArrowRight,
  Plus,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import type { PatientSession } from '@/types/patient-portal';

interface PatientDashboardProps {
  patient: PatientSession;
}

interface DashboardStats {
  nextAppointment?: {
    date: string;
    time: string;
    professional: string;
    procedure: string;
  };
  totalAppointments: number;
  documentsCount: number;
  treatmentProgress?: {
    name: string;
    progress: number;
    nextSession: string;
  };
  recentActivity: Array<{
    id: string;
    type: 'appointment' | 'document' | 'evaluation' | 'message';
    title: string;
    description: string;
    date: string;
    read: boolean;
  }>;
}

export function PatientDashboard({ patient }: PatientDashboardProps) {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    documentsCount: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulated data - will be replaced with real API calls
      setStats({
        nextAppointment: {
          date: '2025-08-05',
          time: '14:30',
          professional: 'Dr. Ana Silva',
          procedure: 'Consulta de Acompanhamento'
        },
        totalAppointments: 12,
        documentsCount: 8,
        treatmentProgress: {
          name: 'Tratamento Facial',
          progress: 75,
          nextSession: '2025-08-12'
        },
        recentActivity: [
          {
            id: '1',
            type: 'appointment',
            title: 'Agendamento confirmado',
            description: 'Consulta em 05/08 às 14:30',
            date: '2025-07-29',
            read: false
          },
          {
            id: '2',
            type: 'document',
            title: 'Novo documento',
            description: 'Resultado de exame disponível',
            date: '2025-07-28',
            read: true
          },
          {
            id: '3',
            type: 'message',
            title: 'Mensagem da equipe',
            description: 'Orientações pós-procedimento',
            date: '2025-07-27',
            read: false
          }
        ]
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'document':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'message':
        return <Bell className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Olá, {patient.patient_name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bem-vindo ao seu portal de atendimento
          </p>
        </div>
        
        <Button onClick={() => router.push('/portal/appointments/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Next Appointment */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próxima Consulta
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.nextAppointment ? (
              <div>
                <div className="text-2xl font-bold">
                  {formatDate(stats.nextAppointment.date)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.nextAppointment.time} - {stats.nextAppointment.professional}
                </p>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-gray-400">
                  Nenhuma
                </div>
                <p className="text-xs text-muted-foreground">
                  Agende sua próxima consulta
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Consultas
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Desde o início do tratamento
            </p>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Documentos
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documentsCount}</div>
            <p className="text-xs text-muted-foreground">
              Arquivos disponíveis
            </p>
          </CardContent>
        </Card>

        {/* Treatment Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Progresso do Tratamento
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.treatmentProgress ? (
              <div>
                <div className="text-2xl font-bold">{stats.treatmentProgress.progress}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.treatmentProgress.name}
                </p>
                <Progress value={stats.treatmentProgress.progress} className="mt-2" />
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-gray-400">--</div>
                <p className="text-xs text-muted-foreground">
                  Nenhum tratamento ativo
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Suas últimas interações com a clínica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      {!activity.read && (
                        <Badge variant="secondary" className="ml-2">
                          Novo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => router.push('/portal/notifications')}
            >
              Ver todas as notificações
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso direto às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => router.push('/portal/appointments')}
              >
                <Calendar className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Gerenciar Agendamentos</div>
                  <div className="text-sm text-muted-foreground">
                    Agende, reagende ou cancele consultas
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => router.push('/portal/uploads')}
              >
                <FileText className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Enviar Documentos</div>
                  <div className="text-sm text-muted-foreground">
                    Upload de exames e documentos
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => router.push('/portal/progress')}
              >
                <TrendingUp className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Acompanhar Progresso</div>
                  <div className="text-sm text-muted-foreground">
                    Veja a evolução do seu tratamento
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}