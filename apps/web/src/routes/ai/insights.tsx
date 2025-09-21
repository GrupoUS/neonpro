import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs } from '@/components/ui/tabs';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Heart,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Types
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
  data: {
    labels: string[];
    values: number[];
  };
  createdAt: string;
  expiresAt?: string;
}

interface AIModel {
  id: string;
  name: string;
  type: 'prediction' | 'classification' | 'clustering' | 'nlp';
  status: 'active' | 'training' | 'maintenance' | 'error';
  accuracy: number;
  lastTrained: string;
  predictionsCount: number;
  description: string;
}

interface PredictionTrend {
  date: string;
  accuracy: number;
  predictions: number;
  impact: number;
}

function AIInsightsPage() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [trends, setTrends] = useState<PredictionTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('7d');

  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        setLoading(true);

        // Mock AI insights data
        const mockInsights: AIInsight[] = [
          {
            id: '1',
            type: 'health_risk',
            title: 'Risco Elevado de Não Comparecimento',
            description:
              'Análise preditiva identifica 45 pacientes com alto risco (>80%) de não comparecimento a consultas esta semana',
            confidence: 92,
            priority: 'high',
            category: 'Predição de Comparecimento',
            patientCount: 45,
            impact: 'Redução potencial de 15% na receita',
            recommendations: [
              'Envio automático de lembretes via SMS e WhatsApp',
              'Telefonema de confirmação para pacientes de alto risco',
              'Oferecer reagendamento online flexível',
            ],
            data: {
              labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
              values: [12, 19, 8, 15, 25],
            },
            createdAt: '2024-01-15T09:00:00Z',
            expiresAt: '2024-01-22T09:00:00Z',
          },
          {
            id: '2',
            type: 'prevention',
            title: 'Otimização de Estoque de Medicamentos',
            description:
              'IA identifica padrão de consumo que permite otimização de estoque com redução de custos de 23%',
            confidence: 87,
            priority: 'medium',
            category: 'Gestão de Estoque',
            impact: 'Economia estimada de R$ 45.000/mês',
            recommendations: [
              'Ajustar níveis de reposição automática',
              'Implementar sistema de pedidos inteligente',
              'Negociar novos lotes com fornecedores',
            ],
            data: {
              labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
              values: [85000, 92000, 78000, 88000, 65000],
            },
            createdAt: '2024-01-14T14:30:00Z',
          },
          {
            id: '3',
            type: 'treatment_optimization',
            title: 'Oportunidade de Tratamento Preventivo',
            description:
              '128 pacientes elegíveis para programas preventivos baseados em histórico e fatores de risco',
            confidence: 85,
            priority: 'medium',
            category: 'Medicina Preventiva',
            patientCount: 128,
            impact: 'Redução estimada de 30% em internações',
            recommendations: [
              'Iniciar campanha de vacinação influenza',
              'Implementar programa de check-ups preventivos',
              'Criar grupos de apoio para condições crônicas',
            ],
            data: {
              labels: ['Diabetes', 'Hipertensão', 'Cardíacos', 'Respiratórios'],
              values: [45, 38, 25, 20],
            },
            createdAt: '2024-01-13T11:15:00Z',
          },
          {
            id: '4',
            type: 'operational',
            title: 'Otimização de Agendamento',
            description:
              'Recomendação de redistribuição de horários para reduzir tempo de espera em 40%',
            confidence: 89,
            priority: 'high',
            category: 'Operacional',
            impact: 'Melhoria na satisfação do paciente e eficiência operacional',
            recommendations: [
              'Alocar mais profissionais nos períodos de pico',
              'Implementar check-in digital',
              'Criar sistema de triagem inteligente',
            ],
            data: {
              labels: ['8h', '9h', '10h', '14h', '15h', '16h'],
              values: [45, 78, 65, 82, 71, 58],
            },
            createdAt: '2024-01-12T16:45:00Z',
          },
          {
            id: '5',
            type: 'health_risk',
            title: 'Alerta de Saúde Pública - Região',
            description: 'Aumento de 35% em casos de dengue na região, recomenda ações preventivas',
            confidence: 94,
            priority: 'critical',
            category: 'Saúde Pública',
            patientCount: 0,
            impact: 'Prevenção de surto e sobrecarga do sistema',
            recommendations: [
              'Intensificar campanha de prevenção',
              'Preparar estoques de medicamentos',
              'Treinar equipe para identificação de sintomas',
            ],
            data: {
              labels: ['Sem1', 'Sem2', 'Sem3', 'Sem4'],
              values: [12, 18, 25, 34],
            },
            createdAt: '2024-01-15T08:00:00Z',
            expiresAt: '2024-01-18T08:00:00Z',
          },
        ];

        const mockModels: AIModel[] = [
          {
            id: '1',
            name: 'No-Show Predictor',
            type: 'prediction',
            status: 'active',
            accuracy: 92.3,
            lastTrained: '2024-01-14T02:00:00Z',
            predictionsCount: 15420,
            description: 'Predição de não comparecimento a consultas',
          },
          {
            id: '2',
            name: 'Health Risk Classifier',
            type: 'classification',
            status: 'active',
            accuracy: 87.8,
            lastTrained: '2024-01-13T03:30:00Z',
            predictionsCount: 8934,
            description: 'Classificação de riscos de saúde baseada em histórico',
          },
          {
            id: '3',
            name: 'Treatment Optimizer',
            type: 'clustering',
            status: 'training',
            accuracy: 78.5,
            lastTrained: '2024-01-10T01:00:00Z',
            predictionsCount: 5621,
            description: 'Otimização de planos de tratamento',
          },
          {
            id: '4',
            name: 'Medical Text Analyzer',
            type: 'nlp',
            status: 'active',
            accuracy: 91.2,
            lastTrained: '2024-01-12T04:15:00Z',
            predictionsCount: 12450,
            description: 'Análise de texto em prontuários médicos',
          },
        ];

        const mockTrends: PredictionTrend[] = [
          {
            date: '2024-01-09',
            accuracy: 89.5,
            predictions: 1520,
            impact: 12.3,
          },
          {
            date: '2024-01-10',
            accuracy: 90.2,
            predictions: 1645,
            impact: 13.8,
          },
          {
            date: '2024-01-11',
            accuracy: 91.1,
            predictions: 1589,
            impact: 14.2,
          },
          {
            date: '2024-01-12',
            accuracy: 90.8,
            predictions: 1723,
            impact: 15.1,
          },
          {
            date: '2024-01-13',
            accuracy: 91.5,
            predictions: 1687,
            impact: 16.4,
          },
          {
            date: '2024-01-14',
            accuracy: 92.1,
            predictions: 1754,
            impact: 17.8,
          },
          {
            date: '2024-01-15',
            accuracy: 92.3,
            predictions: 1820,
            impact: 18.2,
          },
        ];

        setInsights(mockInsights);
        setModels(mockModels);
        setTrends(mockTrends);
      } catch (error) {
        setError('Erro ao carregar insights de IA');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAIInsights();
  }, [timeRange]);

  const getPriorityBadge = (_priority: any) => {
    const variants = {
      low: { variant: 'outline' as const, label: 'Baixa', icon: CheckCircle },
      medium: { variant: 'default' as const, label: 'Média', icon: Clock },
      high: {
        variant: 'secondary' as const,
        label: 'Alta',
        icon: AlertTriangle,
      },
      critical: {
        variant: 'destructive' as const,
        label: 'Crítica',
        icon: AlertTriangle,
      },
    };
    return variants[priority as keyof typeof variants] || variants.low;
  };

  const getModelStatusBadge = (_status: any) => {
    const variants = {
      active: {
        variant: 'default' as const,
        label: 'Ativo',
        color: 'bg-green-500',
      },
      training: {
        variant: 'secondary' as const,
        label: 'Treinando',
        color: 'bg-blue-500',
      },
      maintenance: {
        variant: 'outline' as const,
        label: 'Manutenção',
        color: 'bg-yellow-500',
      },
      error: {
        variant: 'destructive' as const,
        label: 'Erro',
        color: 'bg-red-500',
      },
    };
    return variants[status as keyof typeof variants] || variants.active;
  };

  const getTypeIcon = (_type: any) => {
    const icons = {
      health_risk: Heart,
      treatment_optimization: Activity,
      prevention: Target,
      compliance: CheckCircle,
      operational: Zap,
    };
    return icons[type as keyof typeof icons] || Brain;
  };

  const filteredInsights = insights.filter(insight => {
    const categoryMatch = selectedCategory === 'all' || insight.category === selectedCategory;
    const priorityMatch = selectedPriority === 'all' || insight.priority === selectedPriority;
    return categoryMatch && priorityMatch;
  });

  const calculateImpactScore = () => {
    if (trends.length === 0) return 0;
    const latest = trends[trends.length - 1];
    return Math.round(latest.impact);
  };

  const calculateTotalPatientsImpacted = () => {
    return insights.reduce(
      (total, insight) => total + (insight.patientCount || 0),
      0,
    );
  };

  const getAverageAccuracy = () => {
    if (models.length === 0) return 0;
    return Math.round(
      models.reduce((sum, model) => sum + model.accuracy, 0) / models.length,
    );
  };

  const refreshInsights = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => setLoading(false), 1000);
  };

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-6'>
        <div className='flex items-center gap-4 mb-6'>
          <Skeleton className='h-10 w-10' />
          <Skeleton className='h-8 w-48' />
        </div>
        <div className='grid gap-6'>
          <Skeleton className='h-64' />
          <Skeleton className='h-64' />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-6'>
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-4 sm:py-6 max-w-7xl'>
      {/* Header - Mobile-first responsive */}
      <header className='mb-6 space-y-4 sm:space-y-0'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-start sm:items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => navigate({ to: '/dashboard' })}
              className='h-10 px-3 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              aria-label='Voltar para dashboard principal'
            >
              <ArrowLeft className='h-4 w-4 mr-2' aria-hidden='true' />
              Voltar
            </Button>
            <div className='min-w-0 flex-1'>
              <h1 className='text-xl sm:text-2xl font-bold text-gray-900'>
                Insights de IA
              </h1>
              <p className='text-sm sm:text-base text-gray-600 mt-1'>
                Análise inteligente para tomada de decisões clínicas e operacionais
              </p>
            </div>
          </div>

          {/* Action buttons - Mobile-optimized */}
          <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
            <Button
              variant='outline'
              size='sm'
              className='h-10 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto'
              aria-label='Exportar relatório de insights'
            >
              <Download className='h-4 w-4 mr-2' aria-hidden='true' />
              Exportar Relatório
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={refreshInsights}
              className='h-10 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto'
              aria-label='Atualizar insights de inteligência artificial'
            >
              <RefreshCw className='h-4 w-4 mr-2' aria-hidden='true' />
              Atualizar
            </Button>
          </div>
        </div>
      </header>

      {/* Key Metrics - Enhanced accessibility and mobile-first */}
      <section aria-labelledby='metrics-heading' className='mb-6'>
        <h2 id='metrics-heading' className='sr-only'>
          Métricas principais dos insights de IA
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card className='transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2'>
            <CardContent className='p-4 sm:p-6'>
              <div className='flex items-center justify-between'>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm sm:text-base font-medium text-gray-600'>
                    Impacto Total
                  </p>
                  <p className='text-2xl sm:text-3xl font-bold text-gray-900 mt-1'>
                    {calculateImpactScore()}%
                  </p>
                </div>
                <TrendingUp
                  className='h-8 w-8 sm:h-10 sm:w-10 text-green-500 flex-shrink-0'
                  aria-hidden='true'
                />
              </div>
              <p className='text-xs sm:text-sm text-gray-500 mt-2 flex items-center gap-1'>
                <span
                  className='text-green-600 font-medium'
                  aria-label='aumento de'
                >
                  +2.3%
                </span>
                <span>vs semana anterior</span>
              </p>
            </CardContent>
          </Card>

          <Card className='transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2'>
            <CardContent className='p-4 sm:p-6'>
              <div className='flex items-center justify-between'>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm sm:text-base font-medium text-gray-600'>
                    Pacientes Impactados
                  </p>
                  <p className='text-2xl sm:text-3xl font-bold text-gray-900 mt-1'>
                    {calculateTotalPatientsImpacted().toLocaleString()}
                  </p>
                </div>
                <Users
                  className='h-8 w-8 sm:h-10 sm:w-10 text-blue-500 flex-shrink-0'
                  aria-hidden='true'
                />
              </div>
              <p className='text-xs sm:text-sm text-gray-500 mt-2'>
                Nos últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card className='transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2'>
            <CardContent className='p-4 sm:p-6'>
              <div className='flex items-center justify-between'>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm sm:text-base font-medium text-gray-600'>
                    Acurácia Média
                  </p>
                  <p className='text-2xl sm:text-3xl font-bold text-gray-900 mt-1'>
                    {getAverageAccuracy()}%
                  </p>
                </div>
                <Brain
                  className='h-8 w-8 sm:h-10 sm:w-10 text-purple-500 flex-shrink-0'
                  aria-hidden='true'
                />
              </div>
              <p className='text-xs sm:text-sm text-gray-500 mt-2'>
                Todos os modelos ativos
              </p>
            </CardContent>
          </Card>

          <Card className='transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2'>
            <CardContent className='p-4 sm:p-6'>
              <div className='flex items-center justify-between'>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm sm:text-base font-medium text-gray-600'>
                    Alertas Ativos
                  </p>
                  <p className='text-2xl sm:text-3xl font-bold text-gray-900 mt-1'>
                    {insights.filter(
                      i => i.priority === 'critical' || i.priority === 'high',
                    ).length}
                  </p>
                </div>
                <AlertTriangle
                  className='h-8 w-8 sm:h-10 sm:w-10 text-red-500 flex-shrink-0'
                  aria-hidden='true'
                />
              </div>
              <p className='text-xs sm:text-sm text-gray-500 mt-2'>
                Requerem atenção imediata
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Filters - Mobile-first responsive */}
      <section aria-labelledby='filters-heading' className='mb-6'>
        <h2 id='filters-heading' className='sr-only'>
          Filtros para insights de IA
        </h2>
        <div className='bg-gray-50 p-4 rounded-lg space-y-4 sm:space-y-0'>
          <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4'>
            <div className='flex items-center gap-2 text-gray-700'>
              <Filter className='h-4 w-4 flex-shrink-0' aria-hidden='true' />
              <span className='text-sm font-medium'>Filtros:</span>
            </div>

            <div className='flex flex-col sm:flex-row gap-3 flex-1 sm:flex-none'>
              <div className='space-y-1'>
                <label
                  htmlFor='category-filter'
                  className='text-xs font-medium text-gray-600 block sm:sr-only'
                >
                  Categoria
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger
                    id='category-filter'
                    className='w-full sm:w-48 h-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <SelectValue placeholder='Categoria' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todas Categorias</SelectItem>
                    <SelectItem value='Predição de Comparecimento'>
                      Comparecimento
                    </SelectItem>
                    <SelectItem value='Gestão de Estoque'>Estoque</SelectItem>
                    <SelectItem value='Medicina Preventiva'>
                      Preventivo
                    </SelectItem>
                    <SelectItem value='Operacional'>Operacional</SelectItem>
                    <SelectItem value='Saúde Pública'>Saúde Pública</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1'>
                <label
                  htmlFor='priority-filter'
                  className='text-xs font-medium text-gray-600 block sm:sr-only'
                >
                  Prioridade
                </label>
                <Select
                  value={selectedPriority}
                  onValueChange={setSelectedPriority}
                >
                  <SelectTrigger
                    id='priority-filter'
                    className='w-full sm:w-40 h-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <SelectValue placeholder='Prioridade' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todas Prioridades</SelectItem>
                    <SelectItem value='critical'>Crítica</SelectItem>
                    <SelectItem value='high'>Alta</SelectItem>
                    <SelectItem value='medium'>Média</SelectItem>
                    <SelectItem value='low'>Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1'>
                <label
                  htmlFor='time-filter'
                  className='text-xs font-medium text-gray-600 block sm:sr-only'
                >
                  Período
                </label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger
                    id='time-filter'
                    className='w-full sm:w-32 h-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <SelectValue placeholder='Período' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='24h'>24 horas</SelectItem>
                    <SelectItem value='7d'>7 dias</SelectItem>
                    <SelectItem value='30d'>30 dias</SelectItem>
                    <SelectItem value='90d'>90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count for screen readers */}
            <div className='sr-only' aria-live='polite'>
              {filteredInsights.length > 0
                ? `${filteredInsights.length} insight${
                  filteredInsights.length !== 1 ? 's' : ''
                } encontrado${filteredInsights.length !== 1 ? 's' : ''}`
                : 'Nenhum insight encontrado com os filtros aplicados'}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Mobile-responsive tabs */}
      <main>
        <Tabs
          defaultValue='insights'
          className='space-y-4'
          orientation='horizontal'
        >
          <div className='overflow-x-auto'>
            <TabsList className='grid w-full min-w-max grid-cols-3 h-auto p-1 bg-gray-100'>
              <TabsTrigger
                value='insights'
                className='text-sm px-4 py-3 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              >
                Insights
              </TabsTrigger>
              <TabsTrigger
                value='models'
                className='text-sm px-4 py-3 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              >
                Modelos
              </TabsTrigger>
              <TabsTrigger
                value='analytics'
                className='text-sm px-4 py-3 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              >
                Análise
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='insights' className='space-y-4'>
            {filteredInsights.length > 0
              ? (
                <div className='grid gap-4'>
                  {filteredInsights.map(insight => {
                    const TypeIcon = getTypeIcon(insight.type);
                    const PriorityBadge = getPriorityBadge(insight.priority);
                    const PriorityIcon = PriorityBadge.icon;

                    return (
                      <Card
                        key={insight.id}
                        className='hover:shadow-md transition-shadow'
                      >
                        <CardHeader>
                          <div className='flex items-start justify-between'>
                            <div className='flex items-center gap-3'>
                              <TypeIcon className='h-5 w-5 text-muted-foreground' />
                              <div>
                                <CardTitle className='text-lg'>
                                  {insight.title}
                                </CardTitle>
                                <p className='text-sm text-muted-foreground'>
                                  {insight.category}
                                </p>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge variant='outline'>
                                {insight.confidence}% confiança
                              </Badge>
                              <Badge
                                variant={PriorityBadge.variant}
                                className='flex items-center gap-1'
                              >
                                <PriorityIcon className='h-3 w-3' />
                                {PriorityBadge.label}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                          <div>
                            <p className='text-sm mb-2'>{insight.description}</p>
                            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                              <span>Impacto: {insight.impact}</span>
                              {insight.patientCount && (
                                <span>Pacientes: {insight.patientCount}</span>
                              )}
                              <span>•</span>
                              <span>
                                {format(
                                  new Date(insight.createdAt),
                                  'dd/MM/yyyy HH:mm',
                                  {
                                    locale: ptBR,
                                  },
                                )}
                              </span>
                              {insight.expiresAt && (
                                <>
                                  <span>•</span>
                                  <span>
                                    Expira: {format(
                                      new Date(insight.expiresAt),
                                      'dd/MM/yyyy',
                                      {
                                        locale: ptBR,
                                      },
                                    )}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Data Visualization */}
                          <div className='grid grid-cols-2 md:grid-cols-5 gap-2'>
                            {insight.data.labels.map((label, index) => (
                              <div key={index} className='text-center'>
                                <div className='text-xs text-muted-foreground'>
                                  {label}
                                </div>
                                <div className='text-sm font-medium'>
                                  {insight.data.values[index]}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Recommendations */}
                          <div>
                            <h4 className='text-sm font-medium mb-2'>
                              Recomendações:
                            </h4>
                            <ul className='text-sm space-y-1'>
                              {insight.recommendations.map(
                                (recommendation, index) => (
                                  <li
                                    key={index}
                                    className='flex items-start gap-2'
                                  >
                                    <CheckCircle className='h-3 w-3 text-green-500 mt-0.5 flex-shrink-0' />
                                    <span>{recommendation}</span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>

                          {/* Actions */}
                          <div className='flex items-center gap-2 pt-2'>
                            <Button size='sm' variant='outline'>
                              Ver Detalhes
                            </Button>
                            <Button size='sm' variant='outline'>
                              Implementar
                            </Button>
                            <Button size='sm' variant='outline'>
                              <Share2 className='h-3 w-3 mr-1' />
                              Compartilhar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )
              : (
                <Card>
                  <CardContent className='text-center py-8'>
                    <Brain className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <p className='text-muted-foreground'>
                      Nenhum insight encontrado com os filtros selecionados
                    </p>
                  </CardContent>
                </Card>
              )}
          </TabsContent>

          <TabsContent value='models' className='space-y-4'>
            <div className='grid gap-4'>
              {models.map(model => {
                const StatusBadge = getModelStatusBadge(model.status);

                return (
                  <Card key={model.id}>
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div>
                          <CardTitle>{model.name}</CardTitle>
                          <p className='text-sm text-muted-foreground'>
                            {model.description}
                          </p>
                        </div>
                        <Badge
                          variant={StatusBadge.variant}
                          className='flex items-center gap-1'
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${StatusBadge.color}`}
                          />
                          {StatusBadge.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                        <div>
                          <p className='text-sm font-medium'>Acurácia</p>
                          <p className='text-lg font-bold'>{model.accuracy}%</p>
                        </div>
                        <div>
                          <p className='text-sm font-medium'>Predições</p>
                          <p className='text-lg font-bold'>
                            {model.predictionsCount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm font-medium'>Tipo</p>
                          <p className='text-sm text-muted-foreground'>
                            {model.type}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm font-medium'>Último Treino</p>
                          <p className='text-sm text-muted-foreground'>
                            {format(new Date(model.lastTrained), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Accuracy Progress */}
                      <div className='mt-4'>
                        <div className='flex items-center justify-between mb-1'>
                          <span className='text-sm'>Performance</span>
                          <span className='text-sm font-medium'>
                            {model.accuracy}%
                          </span>
                        </div>
                        <Progress value={model.accuracy} className='h-2' />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value='analytics' className='space-y-4'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Tendência de Acurácia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    {trends.map((trend, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between'
                      >
                        <span className='text-sm'>
                          {format(new Date(trend.date), 'dd/MM', {
                            locale: ptBR,
                          })}
                        </span>
                        <div className='flex items-center gap-2'>
                          <Progress
                            value={trend.accuracy}
                            className='w-20 h-2'
                          />
                          <span className='text-sm font-medium'>
                            {trend.accuracy}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Impacto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm'>
                        Total de Predições (7 dias)
                      </span>
                      <span className='text-lg font-bold'>
                        {trends
                          .reduce((sum, trend) => sum + trend.predictions, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm'>Impacto Médio Diário</span>
                      <span className='text-lg font-bold'>
                        {Math.round(
                          trends.reduce((sum, trend) => sum + trend.impact, 0)
                            / trends.length,
                        )}
                        %
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm'>Melhor Dia</span>
                      <span className='text-lg font-bold text-green-600'>
                        {trends.length > 0
                          ? format(
                            new Date(trends[trends.length - 1].date),
                            'dd/MM',
                            {
                              locale: ptBR,
                            },
                          )
                          : '-'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export const Route = createFileRoute('/ai/insights')({
  component: AIInsightsPage,
});
