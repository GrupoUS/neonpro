import { useAuth } from '@/hooks/useAuth';
import { getCurrentSession } from '@/integrations/supabase/client';
import {
  fetchAvailableReports,
  fetchReportHistory,
  fetchReportsSummary,
  formatCurrency,
  formatDate,
  getReportCategoryLabel,
  type ReportItem,
  type ReportsSummary,
} from '@/services/reports.service';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neonpro/ui';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { BarChart3, FileText, Loader2, PieChart, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/reports')({
  beforeLoad: async () => {
    const session = await getCurrentSession();
    if (!session) {
      throw redirect({
        to: '/',
        search: { redirect: '/reports' },
      });
    }
    return { session };
  },
  component: ReportsPage,
});

function ReportsPage() {
  const { profile, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [availableReports, setAvailableReports] = useState<ReportItem[]>([]);
  const [reportHistory, setReportHistory] = useState<ReportItem[]>([]);

  const clinicId = profile?.clinicId || profile?.tenantId || null;

  useEffect(() => {
    const loadData = async () => {
      if (!clinicId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [summaryData, reports, history] = await Promise.all([
          fetchReportsSummary(clinicId),
          fetchAvailableReports(clinicId),
          fetchReportHistory(clinicId, 5),
        ]);

        setSummary(summaryData);
        setAvailableReports(reports);
        setReportHistory(history);
      } catch (error) {
        console.error('Error loading reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadData();
    }
  }, [clinicId, authLoading]);

  if (authLoading || loading) {
    return (
      <div className='flex items-center justify-center h-full min-h-[200px]'>
        <div className='flex flex-col items-center gap-2'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
          <span className='text-sm text-muted-foreground'>Carregando relatórios...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='flex items-center justify-center h-full min-h-[200px]'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold mb-2'>Acesso Negado</h2>
          <p className='text-muted-foreground'>
            Você precisa estar logado para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  if (!clinicId) {
    return (
      <div className='container mx-auto p-6'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-lg font-semibold text-amber-600'>Clínica não configurada</p>
              <p className='mt-2 text-sm text-muted-foreground'>
                Você precisa estar associado a uma clínica para visualizar relatórios.
              </p>
              <Button
                variant='outline'
                onClick={() => window.location.href = '/settings'}
                className='mt-4'
              >
                Ir para Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default report types if no reports configured in database
  const defaultReportTypes = [
    {
      id: 'billing',
      name: 'Relatório de Faturamento',
      description: 'Análise detalhada do faturamento mensal',
      category: 'financial',
    },
    {
      id: 'clients',
      name: 'Relatório de Clientes',
      description: 'Estatísticas e dados dos clientes',
      category: 'patients',
    },
    {
      id: 'procedures',
      name: 'Relatório de Procedimentos',
      description: 'Análise dos procedimentos realizados',
      category: 'procedures',
    },
  ];

  const reportsToShow = availableReports.length > 0
    ? availableReports
    : defaultReportTypes.map(r => ({
      id: r.id,
      reportName: r.name,
      reportType: r.category,
      reportCategory: r.category,
      description: r.description,
      lastExecutedAt: null,
      executionCount: 0,
      isScheduled: false,
    }));

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Relatórios</h1>
        <div className='text-sm text-muted-foreground'>
          Análises e insights da clínica
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card enableShineBorder>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Relatório Financeiro</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summary ? formatCurrency(summary.revenueTotal) : 'R$ 0'}
            </div>
            <p className='text-xs text-muted-foreground flex items-center'>
              {summary && summary.revenueChange !== 0 ? (
                <>
                  {summary.revenueChange > 0 ? (
                    <TrendingUp className='h-3 w-3 mr-1 text-green-500' />
                  ) : (
                    <TrendingDown className='h-3 w-3 mr-1 text-red-500' />
                  )}
                  {summary.revenueChange > 0 ? '+' : ''}{summary.revenueChange.toFixed(1)}% em relação ao mês anterior
                </>
              ) : (
                'Este mês'
              )}
            </p>
          </CardContent>
        </Card>

        <Card enableShineBorder>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Procedimentos</CardTitle>
            <BarChart3 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summary?.proceduresCount ?? 0}
            </div>
            <p className='text-xs text-muted-foreground flex items-center'>
              {summary && summary.proceduresChange !== 0 ? (
                <>
                  {summary.proceduresChange > 0 ? (
                    <TrendingUp className='h-3 w-3 mr-1 text-green-500' />
                  ) : (
                    <TrendingDown className='h-3 w-3 mr-1 text-red-500' />
                  )}
                  {summary.proceduresChange > 0 ? '+' : ''}{summary.proceduresChange.toFixed(0)}% este mês
                </>
              ) : (
                'Este mês'
              )}
            </p>
          </CardContent>
        </Card>

        <Card enableShineBorder>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Taxa de Satisfação</CardTitle>
            <PieChart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summary?.satisfactionRate ? `${summary.satisfactionRate.toFixed(1)}%` : '--'}
            </div>
            <p className='text-xs text-muted-foreground'>
              {summary?.satisfactionRate ? (
                summary.satisfactionChange !== 0 ? (
                  `${summary.satisfactionChange > 0 ? '+' : ''}${summary.satisfactionChange.toFixed(1)}% este mês`
                ) : 'Sem variação'
              ) : (
                'Sem dados disponíveis'
              )}
            </p>
          </CardContent>
        </Card>

        <Card enableShineBorder>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Relatórios Gerados</CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{summary?.reportsGenerated ?? 0}</div>
            <p className='text-xs text-muted-foreground'>Total configurados</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Disponíveis</CardTitle>
            <CardDescription>
              Gere relatórios personalizados para sua clínica
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {reportsToShow.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-8'>
                Nenhum relatório configurado
              </p>
            ) : (
              reportsToShow.slice(0, 5).map((report) => (
                <div key={report.id} className='flex items-center justify-between p-4 border rounded-lg'>
                  <div>
                    <h4 className='font-medium'>{report.reportName}</h4>
                    <p className='text-sm text-muted-foreground'>
                      {report.description || getReportCategoryLabel(report.reportCategory)}
                    </p>
                  </div>
                  <Button size='sm'>
                    Gerar
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Relatórios</CardTitle>
            <CardDescription>
              Relatórios gerados recentemente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {reportHistory.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-8'>
                  Nenhum relatório gerado ainda
                </p>
              ) : (
                reportHistory.map((report) => (
                  <div key={report.id} className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>{report.reportName}</p>
                      <p className='text-sm text-muted-foreground'>
                        Gerado em {report.lastExecutedAt ? formatDate(report.lastExecutedAt) : '--'}
                      </p>
                    </div>
                    <Button variant='link' size='sm'>
                      Download
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

