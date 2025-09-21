/**
 * Advanced Analytics Dashboard
 *
 * Enhanced analytics dashboard with AI-powered predictive insights
 * and LGPD-compliant healthcare analytics visualization.
 */

import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Lightbulb,
  RefreshCw,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Types for the advanced analytics
interface PredictiveInsight {
  id: string;
  type:
    | 'no_show_risk'
    | 'revenue_forecast'
    | 'patient_outcome'
    | 'capacity_optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
  data: Record<string, any>;
  createdAt: Date;
}

interface AnalyticsMetrics {
  attendanceRate: number;
  revenuePerPatient: number;
  operationalEfficiency: number;
  patientSatisfaction: number;
  capacityUtilization: number;
  avgWaitTime: number;
  npsScore: number;
  returnRate: number;
}

interface AdvancedAnalyticsDashboardProps {
  className?: string;
}

export function AdvancedAnalyticsDashboard({
  className,
}: AdvancedAnalyticsDashboardProps) {
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock data for demonstration (in production, this would fetch from API)
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setMetrics({
        attendanceRate: 0.84,
        revenuePerPatient: 312.75,
        operationalEfficiency: 0.91,
        patientSatisfaction: 4.6,
        capacityUtilization: 0.78,
        avgWaitTime: 8,
        npsScore: 8.7,
        returnRate: 0.73,
      });

      setInsights([
        {
          id: 'insight-1',
          type: 'no_show_risk',
          title: 'Alto Risco de Faltas Detectado',
          description: 'Terças-feiras às 14h apresentam 31% mais cancelamentos que a média.',
          confidence: 0.87,
          impact: 'high',
          recommendation:
            'Implementar confirmações automáticas 24h antes para este horário específico.',
          data: { riskScore: 0.87, timeSlot: 'Terça 14h' },
          createdAt: new Date(),
        },
        {
          id: 'insight-2',
          type: 'revenue_forecast',
          title: 'Oportunidade de Pacotes Identificada',
          description: '52% dos pacientes de hidratação facial retornam em 21 dias.',
          confidence: 0.82,
          impact: 'high',
          recommendation:
            'Oferecer pacotes de 3 sessões com desconto de 20% no momento do agendamento.',
          data: { returnRate: 0.52, avgDays: 21, service: 'Hidratação Facial' },
          createdAt: new Date(),
        },
        {
          id: 'insight-3',
          type: 'capacity_optimization',
          title: 'Horário de Baixa Demanda',
          description: 'Sextas-feiras 8h-10h têm apenas 41% de ocupação.',
          confidence: 0.94,
          impact: 'medium',
          recommendation: 'Criar promoção "Sexta Matinal" com 25% de desconto.',
          data: { occupancy: 0.41, timeSlot: 'Sexta 8h-10h' },
          createdAt: new Date(),
        },
      ]);

      setLastUpdate(new Date());
      setIsLoading(false);
    }, 1500);
  };

  const getInsightIcon = (_type: any) => {
    switch (type) {
      case 'no_show_risk':
        return AlertTriangle;
      case 'revenue_forecast':
        return DollarSign;
      case 'capacity_optimization':
        return Clock;
      case 'patient_outcome':
        return Users;
      default:
        return Lightbulb;
    }
  };

  const getImpactColor = (_impact: any) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Real-time Status */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight flex items-center gap-2'>
            <Brain className='h-8 w-8 text-blue-600' />
            Analytics Avançado com IA
          </h2>
          <p className='text-muted-foreground flex items-center gap-2 mt-1'>
            <Shield className='h-4 w-4' />
            Insights preditivos com proteção LGPD
            <Badge variant='secondary' className='ml-2'>
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </Badge>
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={loadAnalyticsData}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
          />
          {isLoading ? 'Processando...' : 'Atualizar IA'}
        </Button>
      </div>

      {/* Enhanced KPI Cards with AI Insights */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='border-l-4 border-l-green-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Taxa de Presença
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            {isLoading
              ? <Skeleton className='h-8 w-16 mb-2' />
              : (
                <div className='text-2xl font-bold text-green-600'>
                  {metrics
                    ? `${(metrics.attendanceRate * 100).toFixed(1)}%`
                    : '---'}
                </div>
              )}
            <p className='text-xs text-muted-foreground'>
              +5.2% vs mês anterior
            </p>
            <div className='flex items-center gap-1 mt-1'>
              <CheckCircle className='h-3 w-3 text-green-500' />
              <span className='text-xs text-green-600'>IA Otimizada</span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-blue-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Receita por Paciente
            </CardTitle>
            <DollarSign className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            {isLoading
              ? <Skeleton className='h-8 w-20 mb-2' />
              : (
                <div className='text-2xl font-bold text-blue-600'>
                  {metrics ? `R$ ${metrics.revenuePerPatient.toFixed(2)}` : '---'}
                </div>
              )}
            <p className='text-xs text-muted-foreground'>
              +8.7% vs média anual
            </p>
            <div className='flex items-center gap-1 mt-1'>
              <Lightbulb className='h-3 w-3 text-blue-500' />
              <span className='text-xs text-blue-600'>Insight Disponível</span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-purple-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Satisfação NPS
            </CardTitle>
            <Users className='h-4 w-4 text-purple-600' />
          </CardHeader>
          <CardContent>
            {isLoading
              ? <Skeleton className='h-8 w-16 mb-2' />
              : (
                <div className='text-2xl font-bold text-purple-600'>
                  {metrics ? metrics.npsScore.toFixed(1) : '---'}
                </div>
              )}
            <p className='text-xs text-muted-foreground'>
              Baseado em 248 avaliações
            </p>
            <div className='flex items-center gap-1 mt-1'>
              <TrendingUp className='h-3 w-3 text-purple-500' />
              <span className='text-xs text-purple-600'>
                Tendência Positiva
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-orange-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Eficiência Operacional
            </CardTitle>
            <Activity className='h-4 w-4 text-orange-600' />
          </CardHeader>
          <CardContent>
            {isLoading
              ? <Skeleton className='h-8 w-16 mb-2' />
              : (
                <div className='text-2xl font-bold text-orange-600'>
                  {metrics
                    ? `${(metrics.operationalEfficiency * 100).toFixed(0)}%`
                    : '---'}
                </div>
              )}
            <p className='text-xs text-muted-foreground'>
              Tempo médio: {metrics ? `${metrics.avgWaitTime}min` : '---'}
            </p>
            <div className='flex items-center gap-1 mt-1'>
              <Target className='h-3 w-3 text-orange-500' />
              <span className='text-xs text-orange-600'>Meta Atingida</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <Card className='border-l-4 border-l-blue-600'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Brain className='h-5 w-5 text-blue-600' />
            Insights Preditivos de IA
          </CardTitle>
          <CardDescription>
            Análises inteligentes e recomendações baseadas em padrões detectados nos dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading
            ? (
              <div className='space-y-4'>
                {[1, 2, 3].map(i => (
                  <div key={i} className='flex items-start gap-3'>
                    <Skeleton className='w-2 h-2 rounded-full mt-2' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-3/4' />
                      <Skeleton className='h-3 w-full' />
                    </div>
                  </div>
                ))}
              </div>
            )
            : (
              <div className='space-y-4'>
                {insights.map(insight => {
                  const IconComponent = getInsightIcon(insight.type);
                  return (
                    <Card
                      key={insight.id}
                      className={`border ${getImpactColor(insight.impact)}`}
                    >
                      <CardContent className='pt-4'>
                        <div className='flex items-start gap-3'>
                          <IconComponent className='h-5 w-5 mt-0.5' />
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                              <h4 className='font-medium'>{insight.title}</h4>
                              <Badge variant='outline' className='text-xs'>
                                {(insight.confidence * 100).toFixed(0)}% confiança
                              </Badge>
                              <Badge
                                variant={insight.impact === 'high'
                                  ? 'destructive'
                                  : insight.impact === 'medium'
                                  ? 'default'
                                  : 'secondary'}
                              >
                                {insight.impact === 'high'
                                  ? 'Alto Impacto'
                                  : insight.impact === 'medium'
                                  ? 'Médio Impacto'
                                  : 'Baixo Impacto'}
                              </Badge>
                            </div>
                            <p className='text-sm text-muted-foreground mb-2'>
                              {insight.description}
                            </p>
                            <Alert className='bg-blue-50 border-blue-200'>
                              <Lightbulb className='h-4 w-4' />
                              <AlertDescription className='text-sm'>
                                <strong>Recomendação:</strong> {insight.recommendation}
                              </AlertDescription>
                            </Alert>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
        </CardContent>
      </Card>

      {/* Compliance and Privacy Status */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <Shield className='h-4 w-4 text-green-600' />
              Status LGPD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Anonimização</span>
                <Badge
                  variant='default'
                  className='bg-green-100 text-green-800'
                >
                  Ativa
                </Badge>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Consentimento</span>
                <Badge
                  variant='default'
                  className='bg-green-100 text-green-800'
                >
                  99.2%
                </Badge>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Auditoria</span>
                <Badge
                  variant='default'
                  className='bg-green-100 text-green-800'
                >
                  Conforme
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <Eye className='h-4 w-4 text-blue-600' />
              Qualidade dos Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Completude</span>
                <span className='font-medium'>97.8%</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Precisão</span>
                <span className='font-medium'>96.1%</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Atualização</span>
                <span className='font-medium'>2min atrás</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <Zap className='h-4 w-4 text-purple-600' />
              Performance IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Tempo Resposta</span>
                <span className='font-medium'>1.2s</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Precisão Modelo</span>
                <span className='font-medium'>94.7%</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Insights Gerados</span>
                <span className='font-medium'>{insights.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
