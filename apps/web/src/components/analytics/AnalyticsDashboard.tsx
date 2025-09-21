import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Activity,
  BarChart3,
  Brain,
  Calendar,
  DollarSign,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            Analytics Dashboard
          </h2>
          <p className='text-muted-foreground'>
            Análise inteligente de dados clínicos e operacionais
          </p>
        </div>
        <Button variant='outline' size='sm'>
          <RefreshCw className='h-4 w-4 mr-2' />
          Atualizar Dados
        </Button>
      </div>

      {/* KPI Cards Section */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Taxa de Presença
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-8 w-16 mb-2' />
            <p className='text-xs text-muted-foreground'>
              +2.5% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Satisfação do Cliente
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-8 w-16 mb-2' />
            <p className='text-xs text-muted-foreground'>
              Baseado em 127 avaliações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Receita por Paciente
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-8 w-20 mb-2' />
            <p className='text-xs text-muted-foreground'>
              +12.3% vs média anual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Eficiência Operacional
            </CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-8 w-16 mb-2' />
            <p className='text-xs text-muted-foreground'>
              Tempo médio por consulta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Left Column */}
        <div className='space-y-6'>
          {/* Trends Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BarChart3 className='h-5 w-5' />
                Tendências de Agendamento
              </CardTitle>
              <CardDescription>
                Análise temporal dos agendamentos e comparação com períodos anteriores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-64 bg-muted rounded-lg flex items-center justify-center'>
                <div className='text-center space-y-2'>
                  <BarChart3 className='h-12 w-12 text-muted-foreground mx-auto' />
                  <p className='text-sm text-muted-foreground'>
                    Gráfico de tendências será exibido aqui
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Brain className='h-5 w-5' />
                Insights de IA
              </CardTitle>
              <CardDescription>
                Recomendações inteligentes baseadas em padrões de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>
                      Padrão de Cancelamentos Detectado
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Terças-feiras têm 23% mais cancelamentos. Considere implementar confirmações
                      automáticas.
                    </p>
                    <Badge variant='secondary' className='mt-1'>
                      Recomendação
                    </Badge>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-green-500 rounded-full mt-2'></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>
                      Oportunidade de Upselling
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      45% dos pacientes de limpeza de pele retornam em 30 dias. Ideal para pacotes.
                    </p>
                    <Badge variant='secondary' className='mt-1'>
                      Oportunidade
                    </Badge>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-orange-500 rounded-full mt-2'></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>
                      Capacidade Ociosa Identificada
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Quintas 14h-16h têm baixa ocupação. Considere promoções direcionadas.
                    </p>
                    <Badge variant='secondary' className='mt-1'>
                      Otimização
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className='space-y-6'>
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Target className='h-5 w-5' />
                Métricas de Performance
              </CardTitle>
              <CardDescription>
                Indicadores chave de performance da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Taxa de Ocupação</span>
                  <div className='flex items-center gap-2'>
                    <div className='w-24 bg-muted rounded-full h-2'>
                      <div
                        className='bg-blue-500 h-2 rounded-full'
                        style={{ width: '78%' }}
                      >
                      </div>
                    </div>
                    <span className='text-sm font-medium'>78%</span>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Tempo Médio de Espera</span>
                  <div className='flex items-center gap-2'>
                    <div className='w-24 bg-muted rounded-full h-2'>
                      <div
                        className='bg-green-500 h-2 rounded-full'
                        style={{ width: '65%' }}
                      >
                      </div>
                    </div>
                    <span className='text-sm font-medium'>12min</span>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm'>NPS Score</span>
                  <div className='flex items-center gap-2'>
                    <div className='w-24 bg-muted rounded-full h-2'>
                      <div
                        className='bg-emerald-500 h-2 rounded-full'
                        style={{ width: '85%' }}
                      >
                      </div>
                    </div>
                    <span className='text-sm font-medium'>8.5</span>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Taxa de Retorno</span>
                  <div className='flex items-center gap-2'>
                    <div className='w-24 bg-muted rounded-full h-2'>
                      <div
                        className='bg-purple-500 h-2 rounded-full'
                        style={{ width: '72%' }}
                      >
                      </div>
                    </div>
                    <span className='text-sm font-medium'>72%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Analytics Actions */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Zap className='h-5 w-5' />
                Ações Rápidas
              </CardTitle>
              <CardDescription>
                Análises e relatórios com um clique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <Button variant='outline' className='w-full justify-start'>
                  <Calendar className='h-4 w-4 mr-2' />
                  Relatório de Agendamentos
                </Button>

                <Button variant='outline' className='w-full justify-start'>
                  <Users className='h-4 w-4 mr-2' />
                  Análise de Pacientes
                </Button>

                <Button variant='outline' className='w-full justify-start'>
                  <DollarSign className='h-4 w-4 mr-2' />
                  Relatório Financeiro
                </Button>

                <Button variant='outline' className='w-full justify-start'>
                  <TrendingUp className='h-4 w-4 mr-2' />
                  Previsões de IA
                </Button>

                <Button variant='outline' className='w-full justify-start'>
                  <Activity className='h-4 w-4 mr-2' />
                  Análise de Eficiência
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Status */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Status dos Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='flex justify-between text-xs'>
                  <span>Última sincronização</span>
                  <span className='text-muted-foreground'>2 min atrás</span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span>Registros processados</span>
                  <span className='text-muted-foreground'>1,247</span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span>Qualidade dos dados</span>
                  <Badge variant='default' className='text-xs'>
                    95%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
