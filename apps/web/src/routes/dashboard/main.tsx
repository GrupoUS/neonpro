'use client';

import { AIInsightsDashboard } from '@/components/ai/insights-dashboard';
import { BentoGrid } from '@/components/ui/bento-grid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EnhancedTable } from '@/components/ui/enhanced-table';
import { FocusCards } from '@/components/ui/focus-cards';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs } from '@/components/ui/tabs';
import { UniversalButton } from '@/components/ui/universal-button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePatientStats } from '@/hooks/usePatientStats';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { cn } from '@/lib/utils';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { format, isThisWeek, isToday, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Heart,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Shield,
  Stethoscope,
  Target,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export const Route = createFileRoute('/dashboard/main')({
  component: DashboardMain,
});

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  riskScore?: number;
  lastVisit?: string;
  nextAppointment?: {
    date: string;
    time: string;
  };
  healthInsurance?: {
    provider: string;
  };
  age?: number;
  address?: {
    city: string;
    state: string;
  };
}

interface DashboardMetrics {
  totalPatients: number;
  newThisMonth: number;
  appointmentsToday: number;
  monthlyRevenue: number;
  highRiskPatients: number;
  patientSatisfaction: number;
  treatmentCompletion: number;
  noShowRate: number;
}

interface AIInsight {
  id: string;
  type:
    | 'health_risk'
    | 'treatment_optimization'
    | 'prevention'
    | 'compliance'
    | 'operational';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  patientCount?: number;
  impact: string;
  recommendations: string[];
  timestamp: Date;
}

interface RealTimeUpdate {
  type:
    | 'new_patient'
    | 'appointment_update'
    | 'status_change'
    | 'risk_level_change';
  message: string;
  timestamp: Date;
  patientId?: string;
}

function DashboardMain() {
  const { session, loading, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState<RealTimeUpdate[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: '/auth/login' });
    }
  }, [loading, isAuthenticated, navigate]);

  // Enhanced mock data for Brazilian healthcare context
  const mockMetrics: DashboardMetrics = {
    totalPatients: 1250,
    newThisMonth: 45,
    appointmentsToday: 24,
    monthlyRevenue: 125000,
    highRiskPatients: 89,
    patientSatisfaction: 4.7,
    treatmentCompletion: 87,
    noShowRate: 8.5,
  };

  const mockAIInsights: AIInsight[] = [
    {
      id: '1',
      type: 'health_risk',
      title: 'Alto risco de não comparecimento',
      description:
        'Pacientes com histórico de faltas apresentam 85% de probabilidade de não comparecimento',
      confidence: 0.85,
      priority: 'high',
      category: 'Gestão de Consultas',
      patientCount: 12,
      impact: 'Alto impacto na receita',
      recommendations: [
        'Enviar lembretes personalizados',
        'Oferecer reagenda fácil',
        'Contato telefônico proativo',
      ],
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'treatment_optimization',
      title: 'Otimização de protocolos estéticos',
      description: 'Análise indica oportunidade de otimizar protocolos de tratamento facial',
      confidence: 0.92,
      priority: 'medium',
      category: 'Tratamentos',
      patientCount: 45,
      impact: 'Melhoria de resultados',
      recommendations: [
        'Revisar protocolo atual',
        'Implementar nova técnica',
        'Monitorar resultados',
      ],
      timestamp: new Date(),
    },
    {
      id: '3',
      type: 'compliance',
      title: 'Documentação médica pendente',
      description: 'Identificados 23 prontuários com documentação incompleta',
      confidence: 0.78,
      priority: 'critical',
      category: 'Conformidade',
      patientCount: 23,
      impact: 'Risco regulatório',
      recommendations: [
        'Atualizar prontuários',
        'Implementar checklist',
        'Treinar equipe',
      ],
      timestamp: new Date(),
    },
  ];

  const mockRealTimeUpdates: RealTimeUpdate[] = [
    {
      type: 'new_patient',
      message: 'Novo paciente cadastrado: Ana Costa',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      type: 'appointment_update',
      message: 'Consulta confirmada: Roberto Almeida - Harmonização facial',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
    },
  ];

  const mockRecentPatients: Patient[] = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '+55 11 99999-8888',
      status: 'Ativo',
      riskScore: 0.3,
      age: 45,
      lastVisit: '2024-01-15',
      nextAppointment: {
        date: '2024-02-01',
        time: '14:30',
      },
      healthInsurance: {
        provider: 'Unimed',
      },
      address: {
        city: 'São Paulo',
        state: 'SP',
      },
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '+55 11 98888-7777',
      status: 'Ativo',
      riskScore: 0.7,
      age: 32,
      lastVisit: '2024-01-10',
      healthInsurance: {
        provider: 'Amil',
      },
      address: {
        city: 'São Paulo',
        state: 'SP',
      },
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      phone: '+55 11 97777-6666',
      status: 'Inativo',
      riskScore: 0.9,
      age: 58,
      lastVisit: '2023-12-20',
      healthInsurance: {
        provider: 'Bradesco Saúde',
      },
      address: {
        city: 'Santos',
        state: 'SP',
      },
    },
  ];

  // Initialize data
  useEffect(() => {
    setAiInsights(mockAIInsights);
    setRealTimeUpdates(mockRealTimeUpdates);
  }, []);

  const metrics = mockMetrics;
  const patients = mockRecentPatients.filter(
    patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
      || patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      || patient.phone.includes(searchTerm),
  );

  // Enhanced metrics cards for Brazilian healthcare
  const metricsCards = [
    {
      title: 'Total de Pacientes',
      value: metrics.totalPatients.toLocaleString('pt-BR'),
      change: `+${metrics.newThisMonth}`,
      changeType: 'increase' as const,
      description: 'Novos este mês',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${(metrics.monthlyRevenue / 1000).toFixed(0)}k`,
      change: '+15.2%',
      changeType: 'increase' as const,
      description: 'Variação mensal',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Consultas Hoje',
      value: metrics.appointmentsToday,
      change: '+12%',
      changeType: 'increase' as const,
      description: 'Comparado ontem',
      icon: Calendar,
      color: 'text-purple-600',
    },
    {
      title: 'Satisfação',
      value: metrics.patientSatisfaction.toFixed(1),
      change: '+0.3',
      changeType: 'increase' as const,
      description: 'Nota média',
      icon: Heart,
      color: 'text-pink-600',
    },
    {
      title: 'Conclusão de Trat.',
      value: `${metrics.treatmentCompletion}%`,
      change: '+5.2%',
      changeType: 'increase' as const,
      description: 'Taxa de sucesso',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Alto Risco',
      value: metrics.highRiskPatients,
      change: '-5%',
      changeType: 'decrease' as const,
      description: 'Melhoria este mês',
      icon: AlertTriangle,
      color: 'text-orange-600',
    },
  ];

  const handlePatientClick = (_patientId: any) => {
    navigate({ to: '/patients/$patientId', params: { patientId } });
  };

  const getPriorityColor = (_priority: any) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (_priority: any) => {
    switch (priority) {
      case 'critical':
        return 'Crítico';
      case 'high':
        return 'Alto';
      case 'medium':
        return 'Médio';
      case 'low':
        return 'Baixo';
      default:
        return 'Normal';
    }
  };

  const getRiskColor = (_riskScore: any) => {
    if (riskScore >= 0.8) return 'destructive';
    if (riskScore >= 0.6) return 'warning';
    return 'default';
  };

  const getRiskLabel = (_riskScore: any) => {
    if (riskScore >= 0.8) return 'Alto Risco';
    if (riskScore >= 0.6) return 'Médio Risco';
    return 'Baixo Risco';
  };

  const tableColumns = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: (info: any) => <div className='font-medium'>{info.getValue()}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info: any) => <Badge variant='outline'>{info.getValue()}</Badge>,
    },
    {
      accessorKey: 'riskScore',
      header: 'Risco',
      cell: (_info: any) => {
        const score = info.getValue();
        let variant: 'default' | 'destructive' | 'outline' | 'secondary' = 'default';
        let label = 'Baixo';

        if (score >= 0.8) {
          variant = 'destructive';
          label = 'Alto';
        } else if (score >= 0.6) {
          variant = 'outline';
          label = 'Médio';
        }

        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: (_info: any) => {
        const patient = info.row.original;
        return (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePatientClick(patient.id)}
              aria-label={`Ver detalhes do paciente ${patient.name}`}
            >
              <Eye className='h-4 w-4' />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className='container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl'>
      {/* Header with CFM compliance */}
      <header className='space-y-4 sm:space-y-0'>
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <Shield className='h-5 w-5 text-blue-600' />
              <span className='text-sm sm:text-base font-medium text-blue-900'>
                CRM/SP 123456 - Dr. João Silva
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Bell className='h-4 w-4 text-blue-600' />
              <span className='text-xs sm:text-sm text-blue-700'>
                Sistema conforme LGPD - Resolução CFM 2.314/2022
              </span>
            </div>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-gray-900'>
              Dashboard Principal
            </h1>
            <p className='text-sm sm:text-base text-muted-foreground mt-1 sm:mt-0'>
              Visão completa da clínica com inteligência artificial e analytics em tempo real
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
            <UniversalButton
              variant='primary'
              onClick={() => navigate({ to: '/patients/register' })}
              className='bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-11 sm:h-10 text-base sm:text-sm font-medium w-full sm:w-auto'
              aria-label='Cadastrar novo paciente no sistema'
            >
              <UserPlus className='h-4 w-4 mr-2' />
              Novo Paciente
            </UniversalButton>
            <UniversalButton
              variant='outline'
              onClick={() => navigate({ to: '/ai/insights' })}
              className='h-11 sm:h-10 text-base sm:text-sm font-medium w-full sm:w-auto focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              aria-label='Visualizar insights de inteligência artificial'
            >
              <Brain className='h-4 w-4 mr-2' />
              Insights de IA
            </UniversalButton>
          </div>
        </div>
      </header>

      {/* Real-time Updates Banner */}
      {realTimeUpdates.length > 0 && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <RefreshCw className='h-4 w-4 text-green-600 animate-pulse' />
            <span className='text-sm font-medium text-green-900'>
              Atualizações em tempo real
            </span>
          </div>
          <div className='space-y-1'>
            {realTimeUpdates.slice(0, 2).map((update, _index) => (
              <div
                key={index}
                className='text-xs sm:text-sm text-green-700 flex items-center gap-1'
              >
                <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                {update.message}
                <span className='text-green-600'>
                  • {format(update.timestamp, 'HH:mm', { locale: ptBR })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <TabsList className='grid w-full grid-cols-2 lg:grid-cols-4'>
          <TabsTrigger value='overview' className='text-sm'>
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value='patients' className='text-sm'>
            Pacientes
          </TabsTrigger>
          <TabsTrigger value='analytics' className='text-sm'>
            Analytics
          </TabsTrigger>
          <TabsTrigger value='insights' className='text-sm'>
            Insights IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          {/* Key Metrics */}
          <section aria-labelledby='metrics-heading'>
            <h2 id='metrics-heading' className='sr-only'>
              Métricas principais
            </h2>
            <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
              {metricsCards.map((metric, _index) => (
                <Card
                  key={metric.title}
                  className='transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2'
                >
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm sm:text-base font-medium text-gray-900 flex items-center gap-2'>
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                      {metric.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='pt-2'>
                    <div className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'>
                      {metric.value}
                    </div>
                    <p className='text-xs sm:text-sm text-muted-foreground'>
                      <span
                        className={`inline-flex items-center font-medium ${
                          metric.changeType === 'increase'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                        aria-label={`${
                          metric.changeType === 'increase'
                            ? 'Aumento'
                            : 'Diminuição'
                        } de ${metric.change}`}
                      >
                        <span aria-hidden='true'>
                          {metric.changeType === 'increase' ? '↑' : '↓'}
                        </span>
                        <span className='ml-1'>{metric.change}</span>
                      </span>{' '}
                      <span className='text-gray-600'>
                        {metric.description}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section aria-labelledby='quick-actions-heading'>
            <h2 id='quick-actions-heading' className='sr-only'>
              Ações rápidas
            </h2>
            <BentoGrid className='grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <BentoGridItem
                title='Novo Paciente'
                description='Cadastre um novo paciente no sistema'
                header={<UserPlus className='h-6 w-6 text-blue-600' />}
                className='cursor-pointer hover:shadow-lg transition-shadow'
                onClick={() => navigate({ to: '/patients/register' })}
                aria-label='Ir para página de cadastro de novo paciente'
              />
              <BentoGridItem
                title='Agendar Consulta'
                description='Agende uma nova consulta estética'
                header={<Calendar className='h-6 w-6 text-purple-600' />}
                className='cursor-pointer hover:shadow-lg transition-shadow'
                onClick={() => navigate({ to: '/appointments/new' })}
                aria-label='Ir para página de agendamento de consulta'
              />
              <BentoGridItem
                title='Analytics'
                description='Visualize métricas e desempenho'
                header={<BarChart3 className='h-6 w-6 text-green-600' />}
                className='cursor-pointer hover:shadow-lg transition-shadow'
                onClick={() => setActiveTab('analytics')}
                aria-label='Ir para aba de analytics'
              />
              <BentoGridItem
                title='Insights IA'
                description='Recomendações inteligentes'
                header={<Brain className='h-6 w-6 text-pink-600' />}
                className='cursor-pointer hover:shadow-lg transition-shadow'
                onClick={() => setActiveTab('insights')}
                aria-label='Ir para aba de insights de IA'
              />
            </BentoGrid>
          </section>
        </TabsContent>

        <TabsContent value='patients' className='space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div>
                  <CardTitle className='text-lg sm:text-xl font-semibold text-gray-900'>
                    Pacientes Recentes
                  </CardTitle>
                  <CardDescription className='text-sm sm:text-base'>
                    Pacientes com atividades recentes no sistema
                  </CardDescription>
                </div>
                <UniversalButton
                  variant='outline'
                  onClick={() => navigate({ to: '/patients/dashboard' })}
                  className='h-10 text-sm font-medium'
                >
                  Ver Todos
                </UniversalButton>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='overflow-x-auto'>
                <EnhancedTable
                  columns={tableColumns}
                  data={patients}
                  searchable={false}
                  pagination={false}
                  className='min-w-full'
                  aria-label='Lista de pacientes recentes'
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-6'>
          <ServiceAnalyticsDashboard
            clinicId={session?.user?.id || 'default-clinic'}
            compact={true}
          />
        </TabsContent>

        <TabsContent value='insights' className='space-y-6'>
          <AIInsightsDashboard
            clinicId={session?.user?.id || 'default-clinic'}
            compact={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
