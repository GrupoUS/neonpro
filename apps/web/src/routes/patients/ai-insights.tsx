'use client';

import { AccessiblePatientCard } from '@/components/accessibility/AccessiblePatientCard';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs } from '@/components/ui/tabs';
import { UniversalButton } from '@/components/ui/universal-button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Heart,
  LineChart,
  Mail,
  MessageSquare,
  Phone,
  PieChart,
  Pill,
  RefreshCw,
  Shield,
  Stethoscope,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export const Route = createFileRoute('/patients/ai-insights')({
  component: PatientAIInsights,
});

interface PatientAIInsight {
  id: string;
  type:
    | 'health_risk'
    | 'treatment_optimization'
    | 'prevention'
    | 'compliance'
    | 'engagement'
    | 'no_show_prediction';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  patientId?: string;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  riskScore?: number;
  impact: string;
  recommendations: string[];
  actionItems: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
  }[];
  data?: {
    labels: string[];
    values: number[];
  };
  timestamp: Date;
  expiresAt?: Date;
  status: 'active' | 'resolved' | 'dismissed';
}

interface PatientPrediction {
  patientId: string;
  patientName: string;
  predictionType:
    | 'no_show'
    | 'treatment_response'
    | 'health_risk'
    | 'engagement';
  probability: number;
  confidence: number;
  factors: string[];
  recommendedAction: string;
  timeframe: string;
}

interface AIModelMetrics {
  modelId: string;
  modelName: string;
  type: string;
  accuracy: number;
  predictionsToday: number;
  avgConfidence: number;
  lastUpdated: Date;
  status: 'active' | 'training' | 'maintenance' | 'error';
}

interface TreatmentEffectiveness {
  treatmentId: string;
  treatmentName: string;
  patientCount: number;
  effectiveness: number;
  improvement: number;
  duration: string;
  cost: number;
  recommendation: string;
}

function PatientAIInsights() {
  const [insights, setInsights] = useState<PatientAIInsight[]>([]);
  const [predictions, setPredictions] = useState<PatientPrediction[]>([]);
  const [models, setModels] = useState<AIModelMetrics[]>([]);
  const [treatments, setTreatments] = useState<TreatmentEffectiveness[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [selectedInsight, setSelectedInsight] = useState<PatientAIInsight | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock data for development
  const mockInsights: PatientAIInsight[] = [
    {
      id: '1',
      type: 'no_show_prediction',
      title: 'Alto Risco de Não Comparecimento - Grupo de Pacientes',
      description:
        'Análise preditiva identifica 23 pacientes com probabilidade >85% de não comparecer às consultas desta semana',
      confidence: 0.89,
      priority: 'high',
      category: 'Gestão de Agenda',
      patientCount: 23,
      impact: 'Redução potencial de R$ 18.500 na receita semanal',
      recommendations: [
        'Envio imediato de lembretes via WhatsApp',
        'Telefonema de confirmação para pacientes de altíssimo risco',
        'Oferecer reagendamento online com horários flexíveis',
      ],
      actionItems: [
        {
          title: 'Contatar pacientes de alto risco',
          description: 'Realizar contato telefônico com os 8 pacientes com risco >90%',
          priority: 'high',
          dueDate: '2024-01-20',
        },
        {
          title: 'Configurar lembretes automáticos',
          description: 'Habilitar envio de SMS/WhatsApp para todos pacientes',
          priority: 'medium',
          dueDate: '2024-01-19',
        },
      ],
      data: {
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
        values: [12, 19, 8, 15, 25],
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'active',
    },
    {
      id: '2',
      type: 'health_risk',
      title: 'Pacientes Necessitando Acompanhamento Intensivo',
      description:
        'IA identifica 15 pacientes com fatores de risco que requerem monitoramento mais frequente',
      confidence: 0.94,
      priority: 'critical',
      category: 'Monitoramento de Saúde',
      patientCount: 15,
      impact: 'Prevenção de complicações de saúde graves',
      recommendations: [
        'Agendar consultas de acompanhamento quinzenal',
        'Implementar monitoramento remoto de sinais vitais',
        'Educação sobre autocuidado e prevenção',
      ],
      actionItems: [
        {
          title: 'Revisar protocolos de acompanhamento',
          description: 'Atualizar protocolos para pacientes de alto risco',
          priority: 'high',
          dueDate: '2024-01-18',
        },
      ],
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active',
    },
    {
      id: '3',
      type: 'treatment_optimization',
      title: 'Otimização de Protocolos de Tratamento Facial',
      description:
        'Análise de 89 pacientes indica oportunidade de melhoria de 32% na eficácia dos tratamentos faciais',
      confidence: 0.87,
      priority: 'medium',
      category: 'Otimização Clínica',
      patientCount: 89,
      impact: 'Aumento de 32% na satisfação e eficácia do tratamento',
      recommendations: [
        'Implementar novo protocolo de aplicação',
        'Treinar equipe em técnicas atualizadas',
        'Monitorar resultados por 90 dias',
      ],
      actionItems: [
        {
          title: 'Capacitação da equipe',
          description: 'Realizar treinamento em novas técnicas faciais',
          priority: 'medium',
          dueDate: '2024-01-25',
        },
      ],
      data: {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        values: [65, 72, 85, 97],
      },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'active',
    },
    {
      id: '4',
      type: 'engagement',
      title: 'Oportunidades de Engajamento Pós-Tratamento',
      description:
        '134 pacientes elegíveis para programas de manutenção e acompanhamento preventivo',
      confidence: 0.82,
      priority: 'medium',
      category: 'Engajamento e Retenção',
      patientCount: 134,
      impact: 'Aumento de 28% na retenção de pacientes',
      recommendations: [
        'Implementar programa de fidelidade',
        'Oferecer check-ups preventivos personalizados',
        'Criar campanha de Remarketing segmentada',
      ],
      actionItems: [
        {
          title: 'Desenvolver programa de fidelidade',
          description: 'Criar estrutura de benefícios para pacientes frequentes',
          priority: 'medium',
          dueDate: '2024-01-30',
        },
      ],
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      status: 'active',
    },
    {
      id: '5',
      type: 'compliance',
      title: 'Atualização de Documentação Médica Necessária',
      description: 'Identificados 45 pacientes com documentação médica desatualizada ou incompleta',
      confidence: 0.95,
      priority: 'critical',
      category: 'Conformidade e Documentação',
      patientCount: 45,
      impact: 'Garantir conformidade com regulamentações CFM e LGPD',
      recommendations: [
        'Notificar pacientes para atualização cadastral',
        'Implementar sistema de verificação automática',
        'Realizar auditoria de documentação',
      ],
      actionItems: [
        {
          title: 'Contatar pacientes para atualização',
          description: 'Enviar comunicados aos 45 pacientes identificados',
          priority: 'high',
          dueDate: '2024-01-22',
        },
      ],
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'active',
    },
  ];

  const mockPredictions: PatientPrediction[] = [
    {
      patientId: '1',
      patientName: 'João Silva',
      predictionType: 'no_show',
      probability: 0.87,
      confidence: 0.92,
      factors: [
        'Histórico de faltas',
        'Consulta agendada há 60 dias',
        'Sem confirmação',
      ],
      recommendedAction: 'Contato telefônico imediato + WhatsApp',
      timeframe: 'Próximas 48h',
    },
    {
      patientId: '2',
      patientName: 'Maria Santos',
      predictionType: 'treatment_response',
      probability: 0.78,
      confidence: 0.85,
      factors: [
        'Tipo de pele',
        'Resposta histórica positiva',
        'Idade adequada',
      ],
      recommendedAction: 'Aumentar frequência do tratamento',
      timeframe: 'Próximas 2 semanas',
    },
    {
      patientId: '3',
      patientName: 'Carlos Oliveira',
      predictionType: 'health_risk',
      probability: 0.92,
      confidence: 0.88,
      factors: ['Pressão elevada', 'Histórico familiar', 'Sedentarismo'],
      recommendedAction: 'Encaminhamento para cardiologista + monitoramento',
      timeframe: 'Imediato',
    },
  ];

  const mockModels: AIModelMetrics[] = [
    {
      modelId: '1',
      modelName: 'No-Show Prediction v3.2',
      type: 'classification',
      accuracy: 0.94,
      predictionsToday: 1250,
      avgConfidence: 0.89,
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'active',
    },
    {
      modelId: '2',
      modelName: 'Treatment Response Predictor',
      type: 'regression',
      accuracy: 0.87,
      predictionsToday: 890,
      avgConfidence: 0.85,
      lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'active',
    },
    {
      modelId: '3',
      modelName: 'Health Risk Assessment',
      type: 'classification',
      accuracy: 0.91,
      predictionsToday: 650,
      avgConfidence: 0.88,
      lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: 'active',
    },
  ];

  const mockTreatments: TreatmentEffectiveness[] = [
    {
      treatmentId: '1',
      treatmentName: 'Harmonização Facial com Ácido Hialurônico',
      patientCount: 156,
      effectiveness: 0.94,
      improvement: 0.12,
      duration: '12 meses',
      cost: 2800,
      recommendation: 'Manter protocolo atual com excelente eficácia',
    },
    {
      treatmentId: '2',
      treatmentName: 'Peeling Químico Profundo',
      patientCount: 89,
      effectiveness: 0.87,
      improvement: 0.08,
      duration: '6 meses',
      cost: 450,
      recommendation: 'Considerar ajuste na concentração para melhor resultados',
    },
    {
      treatmentId: '3',
      treatmentName: 'Laser Fracionado CO2',
      patientCount: 67,
      effectiveness: 0.91,
      improvement: 0.15,
      duration: '18 meses',
      cost: 3500,
      recommendation: 'Expandir indicação para mais casos',
    },
  ];

  useEffect(() => {
    // Simulate API loading
    const loadData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setInsights(mockInsights);
        setPredictions(mockPredictions);
        setModels(mockModels);
        setTreatments(mockTreatments);
      } catch (_error) {
        console.error('Error loading AI insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
      const categoryMatch = selectedCategory === 'all' || insight.category === selectedCategory;
      const priorityMatch = selectedPriority === 'all' || insight.priority === selectedPriority;
      return categoryMatch && priorityMatch;
    });
  }, [insights, selectedCategory, selectedPriority]);

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

  const getStatusColor = (_status: any) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'resolved':
        return 'default';
      case 'dismissed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleInsightAction = async (_insight: any) => {
    toast({
      title: 'Ação de IA executada',
      description: `Iniciando ações para: ${insight.title}`,
    });

    // Simulate action execution
    setTimeout(() => {
      toast({
        title: 'Ação concluída',
        description: 'As ações recomendadas foram iniciadas com sucesso.',
      });
    }, 2000);
  };

  const handleInsightDetails = (_insight: any) => {
    setSelectedInsight(insight);
    setIsModalOpen(true);
  };

  const exportReport = () => {
    toast({
      title: 'Relatório exportado',
      description: 'Relatório de insights de IA exportado com sucesso.',
    });
  };

  if (loading) {
    return (
      <div className='container mx-auto p-4 sm:p-6 max-w-7xl'>
        <div className='space-y-6'>
          <div className='h-8 bg-gray-200 rounded animate-pulse'></div>
          <div className='grid gap-4 grid-cols-1 md:grid-cols-3'>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className='h-32 bg-gray-200 rounded animate-pulse'
              >
              </div>
            ))}
          </div>
          <div className='h-64 bg-gray-200 rounded animate-pulse'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl'>
      {/* Header */}
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
              <Brain className='h-4 w-4 text-blue-600' />
              <span className='text-xs sm:text-sm text-blue-700'>
                Insights de IA - Conforme CFM 2.314/2022
              </span>
            </div>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-gray-900'>
              Insights de IA para Pacientes
            </h1>
            <p className='text-sm sm:text-base text-muted-foreground mt-1 sm:mt-0'>
              Análise preditiva e recomendações inteligentes para gestão de pacientes
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
            <UniversalButton
              variant='outline'
              onClick={exportReport}
              className='h-11 sm:h-10 text-base sm:text-sm font-medium w-full sm:w-auto'
              aria-label='Exportar relatório de insights'
            >
              <Download className='h-4 w-4 mr-2' />
              Exportar Relatório
            </UniversalButton>
            <UniversalButton
              variant='primary'
              onClick={() => navigate({ to: '/patients/dashboard' })}
              className='h-11 sm:h-10 text-base sm:text-sm font-medium w-full sm:w-auto'
              aria-label='Voltar para dashboard de pacientes'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar
            </UniversalButton>
          </div>
        </div>
      </header>

      {/* AI Model Status */}
      <section aria-labelledby='model-status-heading'>
        <h2 id='model-status-heading' className='sr-only'>
          Status dos modelos de IA
        </h2>
        <div className='grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4'>
          {models.map(model => (
            <Card
              key={model.modelId}
              className='transition-all hover:shadow-lg'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-sm font-medium text-gray-900'>
                    {model.modelName}
                  </CardTitle>
                  <Badge
                    variant={model.status === 'active' ? 'default' : 'secondary'}
                  >
                    {model.status === 'active' ? 'Ativo' : 'Indisponível'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='pt-2 space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Acurácia:</span>
                  <span className='font-medium'>
                    {(model.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Previsões hoje:</span>
                  <span className='font-medium'>{model.predictionsToday}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Confiança média:</span>
                  <span className='font-medium'>
                    {(model.avgConfidence * 100).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <Tabs defaultValue='insights' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-2 lg:grid-cols-4'>
          <TabsTrigger value='insights' className='text-sm'>
            Insights
          </TabsTrigger>
          <TabsTrigger value='predictions' className='text-sm'>
            Predições
          </TabsTrigger>
          <TabsTrigger value='treatments' className='text-sm'>
            Eficácia
          </TabsTrigger>
          <TabsTrigger value='analytics' className='text-sm'>
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value='insights' className='space-y-4'>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg font-semibold'>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col sm:flex-row gap-4'>
                <div className='flex-1'>
                  <label
                    htmlFor='category-filter'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Categoria
                  </label>
                  <select
                    id='category-filter'
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className='w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value='all'>Todas as categorias</option>
                    <option value='Gestão de Agenda'>Gestão de Agenda</option>
                    <option value='Monitoramento de Saúde'>
                      Monitoramento de Saúde
                    </option>
                    <option value='Otimização Clínica'>
                      Otimização Clínica
                    </option>
                    <option value='Engajamento e Retenção'>
                      Engajamento e Retenção
                    </option>
                    <option value='Conformidade e Documentação'>
                      Conformidade
                    </option>
                  </select>
                </div>
                <div className='flex-1'>
                  <label
                    htmlFor='priority-filter'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Prioridade
                  </label>
                  <select
                    id='priority-filter'
                    value={selectedPriority}
                    onChange={e => setSelectedPriority(e.target.value)}
                    className='w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value='all'>Todas as prioridades</option>
                    <option value='critical'>Crítico</option>
                    <option value='high'>Alto</option>
                    <option value='medium'>Médio</option>
                    <option value='low'>Baixo</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights Grid */}
          <div className='grid gap-4 grid-cols-1 lg:grid-cols-2'>
            {filteredInsights.map(insight => (
              <Card
                key={insight.id}
                className='transition-all hover:shadow-lg cursor-pointer border-l-4'
                style={{
                  borderLeftColor: insight.priority === 'critical'
                    ? '#ef4444'
                    : insight.priority === 'high'
                    ? '#f97316'
                    : insight.priority === 'medium'
                    ? '#eab308'
                    : '#6b7280',
                }}
                onClick={() => handleInsightDetails(insight)}
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-base font-medium flex items-center gap-2'>
                      {insight.type === 'no_show_prediction' && (
                        <Clock className='h-4 w-4 text-orange-600' />
                      )}
                      {insight.type === 'health_risk' && <Heart className='h-4 w-4 text-red-600' />}
                      {insight.type === 'treatment_optimization' && (
                        <Target className='h-4 w-4 text-blue-600' />
                      )}
                      {insight.type === 'engagement'
                        && <Users className='h-4 w-4 text-green-600' />}
                      {insight.type === 'compliance' && (
                        <Shield className='h-4 w-4 text-purple-600' />
                      )}
                      {insight.title}
                    </CardTitle>
                    <div className='flex gap-2'>
                      <Badge variant={getPriorityColor(insight.priority)}>
                        {getPriorityLabel(insight.priority)}
                      </Badge>
                      <Badge variant={getStatusColor(insight.status)}>
                        {insight.status === 'active'
                          ? 'Ativo'
                          : insight.status === 'resolved'
                          ? 'Resolvido'
                          : 'Ignorado'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className='text-sm'>
                    {insight.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className='pt-2 space-y-3'>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-gray-600'>Confiança:</span>
                      <span className='ml-1 font-medium'>
                        {(insight.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    {insight.patientCount && (
                      <div>
                        <span className='text-gray-600'>Pacientes:</span>
                        <span className='ml-1 font-medium'>
                          {insight.patientCount}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className='text-xs text-gray-500'>
                    Impacto: {insight.impact}
                  </div>
                  <div className='text-xs text-gray-500'>
                    Criado há {formatDistanceToNow(insight.timestamp, {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='predictions' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg font-semibold'>
                Predições por Paciente
              </CardTitle>
              <CardDescription>
                Análise preditiva individualizada para cada paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {predictions.map(prediction => (
                  <div
                    key={prediction.patientId}
                    className='border rounded-lg p-4'
                  >
                    <div className='flex items-center justify-between mb-3'>
                      <div>
                        <h3 className='font-medium'>
                          {prediction.patientName}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          {prediction.predictionType}
                        </p>
                      </div>
                      <Badge
                        variant={prediction.probability > 0.8
                          ? 'destructive'
                          : 'warning'}
                      >
                        {(prediction.probability * 100).toFixed(0)}% probabilidade
                      </Badge>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                      <div>
                        <span className='text-gray-600'>Confiança:</span>
                        <span className='ml-1 font-medium'>
                          {(prediction.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-600'>Prazo:</span>
                        <span className='ml-1 font-medium'>
                          {prediction.timeframe}
                        </span>
                      </div>
                    </div>
                    <div className='mt-3'>
                      <p className='text-sm font-medium text-gray-700'>
                        Fatores:
                      </p>
                      <ul className='text-sm text-gray-600 list-disc list-inside'>
                        {prediction.factors.map((factor, index) => <li key={index}>{factor}</li>)}
                      </ul>
                    </div>
                    <div className='mt-3 p-3 bg-blue-50 rounded'>
                      <p className='text-sm font-medium text-blue-900'>
                        Ação recomendada: {prediction.recommendedAction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='treatments' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg font-semibold'>
                Eficácia de Tratamentos
              </CardTitle>
              <CardDescription>
                Análise da eficácia dos tratamentos baseada em dados reais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {treatments.map(treatment => (
                  <div
                    key={treatment.treatmentId}
                    className='border rounded-lg p-4'
                  >
                    <div className='flex items-center justify-between mb-3'>
                      <div>
                        <h3 className='font-medium'>
                          {treatment.treatmentName}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          {treatment.patientCount} pacientes
                        </p>
                      </div>
                      <div className='text-right'>
                        <div className='text-lg font-bold text-green-600'>
                          {(treatment.effectiveness * 100).toFixed(0)}%
                        </div>
                        <div className='text-xs text-green-600'>
                          +{(treatment.improvement * 100).toFixed(0)}% melhoria
                        </div>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                      <div>
                        <span className='text-gray-600'>Duração:</span>
                        <span className='ml-1 font-medium'>
                          {treatment.duration}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-600'>Custo:</span>
                        <span className='ml-1 font-medium'>
                          R$ {treatment.cost.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className='mt-3 p-3 bg-green-50 rounded'>
                      <p className='text-sm font-medium text-green-900'>
                        {treatment.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-4'>
          <div className='grid gap-4 grid-cols-1 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>
                  Distribuição de Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='h-64 flex items-center justify-center text-gray-500'>
                  <div className='text-center'>
                    <PieChart className='h-12 w-12 mx-auto mb-2' />
                    <p>Gráfico de distribuição de insights por categoria</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>
                  Tendências de Previsões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='h-64 flex items-center justify-center text-gray-500'>
                  <div className='text-center'>
                    <LineChart className='h-12 w-12 mx-auto mb-2' />
                    <p>Gráfico de tendências de precisão das previsões</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Insight Details Modal */}
      {selectedInsight && (
        <AnimatedModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInsight(null);
          }}
          title={selectedInsight.title}
          size='lg'
        >
          <div className='space-y-6'>
            <div>
              <h3 className='font-medium mb-2'>Descrição</h3>
              <p className='text-sm text-gray-700'>
                {selectedInsight.description}
              </p>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <h3 className='font-medium mb-2'>Detalhes</h3>
                <div className='space-y-1 text-sm'>
                  <div>
                    <span className='text-gray-600'>Confiança:</span>{' '}
                    {(selectedInsight.confidence * 100).toFixed(0)}%
                  </div>
                  <div>
                    <span className='text-gray-600'>Prioridade:</span>{' '}
                    {getPriorityLabel(selectedInsight.priority)}
                  </div>
                  <div>
                    <span className='text-gray-600'>Impacto:</span> {selectedInsight.impact}
                  </div>
                  {selectedInsight.patientCount && (
                    <div>
                      <span className='text-gray-600'>Pacientes afetados:</span>{' '}
                      {selectedInsight.patientCount}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className='font-medium mb-2'>Tempo</h3>
                <div className='space-y-1 text-sm'>
                  <div>
                    <span className='text-gray-600'>Criado:</span>{' '}
                    {format(selectedInsight.timestamp, 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </div>
                  {selectedInsight.expiresAt && (
                    <div>
                      <span className='text-gray-600'>Expira:</span>{' '}
                      {format(selectedInsight.expiresAt, 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className='font-medium mb-2'>Recomendações</h3>
              <ul className='space-y-1 text-sm'>
                {selectedInsight.recommendations.map((rec, index) => (
                  <li key={index} className='flex items-start gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-600 mt-0.5 flex-shrink-0' />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedInsight.actionItems.length > 0 && (
              <div>
                <h3 className='font-medium mb-2'>Ações Necessárias</h3>
                <div className='space-y-2'>
                  {selectedInsight.actionItems.map((action, index) => (
                    <div key={index} className='border rounded p-3'>
                      <div className='flex items-center justify-between mb-1'>
                        <h4 className='font-medium text-sm'>{action.title}</h4>
                        <Badge variant={getPriorityColor(action.priority)}>
                          {getPriorityLabel(action.priority)}
                        </Badge>
                      </div>
                      <p className='text-sm text-gray-700 mb-1'>
                        {action.description}
                      </p>
                      {action.dueDate && (
                        <p className='text-xs text-gray-500'>
                          Prazo: {format(new Date(action.dueDate), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className='flex justify-end gap-3'>
              <UniversalButton
                variant='outline'
                onClick={() => setIsModalOpen(false)}
              >
                Fechar
              </UniversalButton>
              <UniversalButton
                variant='primary'
                onClick={() => handleInsightAction(selectedInsight)}
              >
                Executar Ações
              </UniversalButton>
            </div>
          </div>
        </AnimatedModal>
      )}
    </div>
  );
}
