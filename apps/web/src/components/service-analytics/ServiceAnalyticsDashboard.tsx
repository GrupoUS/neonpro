import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useAnalyticsDashboard } from '@/hooks/useServiceAnalytics';
import { Button } from '@neonpro/ui';
import { formatBRL } from '@neonpro/utils';
import {
  Activity,
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Filter,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

export function ServiceAnalyticsDashboard() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const clinicId = user?.user_metadata?.clinic_id;

  // Calculate date filters based on selected range
  const getDateFilters = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    return {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };
  };

  const { data: dashboard, isLoading } = useAnalyticsDashboard(clinicId, {
    ...getDateFilters(),
    comparison_period: 'previous_month',
  });

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  const kpis = dashboard?.kpis || {
    total_revenue: 0,
    total_appointments: 0,
    average_appointment_value: 0,
    completion_rate: 0,
    growth_rate: 0,
    client_satisfaction: null,
  };

  const formatCurrency = (value: number) => formatBRL(value);

  const formatPercentage = (_value: [a-zA-Z][a-zA-Z]*) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-4 justify-between'>
        <div className='flex gap-2'>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className='w-40'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='7d'>Últimos 7 dias</SelectItem>
              <SelectItem value='30d'>Últimos 30 dias</SelectItem>
              <SelectItem value='90d'>Últimos 90 dias</SelectItem>
              <SelectItem value='1y'>Último ano</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='Todas as categorias' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todas as categorias</SelectItem>
              <SelectItem value='consultation'>Consultas</SelectItem>
              <SelectItem value='procedure'>Procedimentos</SelectItem>
              <SelectItem value='exam'>Exames</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex gap-2'>
          <Button variant='outline'>
            <Filter className='h-4 w-4 mr-2' />
            Filtros Avançados
          </Button>
          <Button variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Receita Total</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(kpis.total_revenue)}
            </div>
            <div className='flex items-center text-xs text-muted-foreground'>
              {kpis.growth_rate >= 0
                ? <TrendingUp className='h-3 w-3 mr-1 text-green-500' />
                : <TrendingDown className='h-3 w-3 mr-1 text-red-500' />}
              <span
                className={kpis.growth_rate >= 0 ? 'text-green-500' : 'text-red-500'}
              >
                {formatPercentage(kpis.growth_rate)}
              </span>
              <span className='ml-1'>vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Agendamentos</CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{kpis.total_appointments}</div>
            <p className='text-xs text-muted-foreground'>
              {kpis.completion_rate.toFixed(1)}% taxa de conclusão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Ticket Médio</CardTitle>
            <BarChart3 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(kpis.average_appointment_value)}
            </div>
            <p className='text-xs text-muted-foreground'>Por agendamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Satisfação</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {kpis.client_satisfaction
                ? `${kpis.client_satisfaction.toFixed(1)}/5`
                : 'N/A'}
            </div>
            <p className='text-xs text-muted-foreground'>
              Avaliação média dos clientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance dos Serviços</CardTitle>
          <CardDescription>
            Serviços mais populares e rentáveis do período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {dashboard?.service_performance
              ?.slice(0, 5)
              .map((service, index) => (
                <div
                  key={service.service_id}
                  className='flex items-center justify-between'
                >
                  <div className='flex items-center space-x-3'>
                    <div className='flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm'>
                      {index + 1}
                    </div>
                    <div>
                      <p className='font-medium'>{service.service_name}</p>
                      <p className='text-sm text-muted-foreground'>
                        {service.total_appointments} agendamentos
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium'>
                      {formatCurrency(service.total_revenue)}
                    </p>
                    <Badge
                      variant={service.growth_rate >= 0 ? 'default' : 'secondary'}
                    >
                      {formatPercentage(service.growth_rate)}
                    </Badge>
                  </div>
                </div>
              )) || (
              <div className='text-center py-8 text-muted-foreground'>
                <Activity className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>Nenhum dado de performance disponível</p>
                <p className='text-sm'>
                  Os dados aparecerão conforme os agendamentos forem realizados
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Receita por Categoria</CardTitle>
            <CardDescription>
              Distribuição da receita por tipo de serviço
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {dashboard?.category_breakdown?.map(category => (
                <div
                  key={category.category_name}
                  className='flex items-center justify-between'
                >
                  <div className='flex items-center space-x-2'>
                    <div
                      className='w-3 h-3 rounded-full'
                      style={{ backgroundColor: '#3b82f6' }}
                    />
                    <span className='font-medium'>
                      {category.category_name}
                    </span>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium'>
                      {formatCurrency(category.revenue)}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {category.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )) || (
                <p className='text-center text-muted-foreground py-4'>
                  Nenhuma categoria encontrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance dos Profissionais</CardTitle>
            <CardDescription>
              Top profissionais por receita gerada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {dashboard?.professional_performance
                ?.slice(0, 5)
                .map((professional, index) => (
                  <div
                    key={professional.professional_id}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center space-x-3'>
                      <div className='flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-medium text-sm'>
                        {index + 1}
                      </div>
                      <div>
                        <p className='font-medium'>
                          {professional.professional_name}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {professional.total_appointments} agendamentos
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium'>
                        {formatCurrency(professional.total_revenue)}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {professional.completion_rate.toFixed(1)}% conclusão
                      </p>
                    </div>
                  </div>
                )) || (
                <p className='text-center text-muted-foreground py-4'>
                  Nenhum profissional encontrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {dashboard?.insights && dashboard.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Insights e Recomendações</CardTitle>
            <CardDescription>
              Análises automáticas baseadas nos dados da clínica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {dashboard.insights.map((insight, index) => (
                <div
                  key={index}
                  className='flex items-start space-x-3 p-3 rounded-lg bg-muted/50'
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      insight.type === 'growth'
                        ? 'bg-green-500'
                        : insight.type === 'decline'
                        ? 'bg-red-500'
                        : insight.type === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div>
                    <p className='font-medium'>{insight.title}</p>
                    <p className='text-sm text-muted-foreground'>
                      {insight.description}
                    </p>
                    {insight.recommendation && (
                      <p className='text-sm text-primary mt-1'>
                        💡 {insight.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
