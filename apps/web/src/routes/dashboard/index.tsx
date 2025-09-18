import { NotificationCard } from '@/components';
import { BentoGridItem } from '@/components/ui/bento-grid';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardCard, DashboardLayout } from '@neonpro/ui';
import { Badge } from '@neonpro/ui';
import { Button } from '@neonpro/ui';

import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Activity, Bell, Calendar, DollarSign, Settings, TrendingUp, Users } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import { formatBRL } from '@neonpro/utils';

function DashboardComponent() {
  const { session, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate(); // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: '/' as const });
    }
  }, [loading, isAuthenticated, navigate]);

  // Clean OAuth hash when session established
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const nextUrl = searchParams.get('next');
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');

    if (session && accessToken) {
      const cleanUrl = nextUrl ? decodeURIComponent(nextUrl) : '/dashboard';
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [session]);

  // Data queries
  const todayRange = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
  }, []);

  const { data: appointmentsTodayCount, isLoading: loadingAppt } = useQuery({
    queryKey: ['appointmentsTodayCount', todayRange],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .gte('start_time', todayRange.start)
        .lte('start_time', todayRange.end)
        .neq('status', 'cancelled');
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: activeClientsCount, isLoading: loadingClients } = useQuery({
    queryKey: ['activeClientsCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('patients')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: monthlyRevenue, isLoading: loadingRevenue } = useQuery({
    queryKey: ['monthlyRevenue'],
    queryFn: async () => {
      // Sum income transactions for current month
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      end.setMilliseconds(-1);

      const { data, error } = await supabase
        .from('financial_transactions')
        .select('amount, transaction_date, transaction_type')
        .gte('transaction_date', start.toISOString())
        .lte('transaction_date', end.toISOString())
        .eq('transaction_type', 'income');
      if (error) throw error;
      const total = (data ?? []).reduce((sum, t: any) => sum + (t?.amount ?? 0), 0);
      return total;
    },
  });

  const sevenDays = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start: start.toISOString(), end: end.toISOString() };
  }, []);

  const { data: showRate = 0, isLoading: showRateLoading } = useQuery({
    queryKey: ['showRate7d', sevenDays],
    queryFn: async () => {
      // Try analytics_appointments first if exists, else compute from appointments
      const { data: analytics, error: aErr } = await supabase
        .from('analytics_appointments')
        .select('is_completed, is_no_show, status, start_time')
        .gte('start_time', sevenDays.start)
        .lte('start_time', sevenDays.end)
        .limit(1000);

      if (!aErr && analytics && analytics.length > 0) {
        const completed = analytics.reduce(
          (acc: number, r: any) => acc + (r.is_completed ? 1 : 0),
          0,
        );
        const noshow = analytics.reduce((acc: number, r: any) => acc + (r.is_no_show ? 1 : 0), 0);
        const denom = completed + noshow;
        return denom > 0 ? completed / denom : 0;
      }

      // Fallback: use appointments.status
      const { data: appts, error } = await supabase
        .from('appointments')
        .select('status, start_time')
        .gte('start_time', sevenDays.start)
        .lte('start_time', sevenDays.end)
        .limit(1000);
      if (error) throw error;
      const relevant = (appts ?? []).filter((a: any) =>
        ['completed', 'no_show', 'cancelled'].includes(a.status ?? '')
      );
      const completed = relevant.filter((a: any) => a.status === 'completed').length;
      const noshow = relevant.filter((a: any) => a.status === 'no_show').length;
      const denom = completed + noshow;
      return denom > 0 ? completed / denom : 0;
    },
  });

  const { data: recentActivity, isLoading: loadingActivity } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      // Last 5 appointments and patient registrations merged
      const [apptRes, patientRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('id, start_time, status, created_at, patient_id, service_type_id')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('patients')
          .select('id, full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);
      if (apptRes.error) throw apptRes.error;
      if (patientRes.error) throw patientRes.error;
      const items = [
        ...(apptRes.data ?? []).map(a => ({
          type: 'appointment' as const,
          id: a.id,
          created_at: a.created_at,
          label: 'Nova consulta agendada',
          detail: `${
            a.start_time
              ? new Date(a.start_time).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })
              : '00:00'
          }`,
        })),
        ...(patientRes.data ?? []).map(p => ({
          type: 'patient' as const,
          id: p.id,
          created_at: p.created_at,
          label: 'Novo paciente cadastrado',
          detail: p.full_name ?? 'Paciente',
        })),
      ];
      return items
        .filter(x => !!x.created_at)
        .sort((a, b) => (a.created_at! < b.created_at! ? 1 : -1))
        .slice(0, 5);
    },
  });

  if (loading) {
    return (
      <div className='flex min-h-full h-full items-center justify-center bg-background'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'>
          </div>
          <p className='text-sm text-muted-foreground'>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className='h-full bg-background'>
      {/* Main Content */}
      <main className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <h2 className='text-3xl font-bold tracking-tight mb-2'>
            Bem-vindo ao Dashboard
          </h2>
          <p className='text-muted-foreground'>
            Gerencie sua clínica de estética com inteligência artificial
          </p>
        </div>

        {/* Stats Cards - Enhanced with TiltedCard Effect */}
        <DashboardLayout>
          <DashboardCard>
            <BentoGridItem
              title='Consultas Hoje'
              description={loadingAppt
                ? 'Carregando...'
                : `${appointmentsTodayCount} consultas agendadas para hoje`}
              icon={<Calendar className='h-5 w-5' />}
              variant='primary'
              size='sm'
              enhanced={true}
              elevation='md'
              emphasis='brand'
            >
              <div className='text-3xl font-bold text-white'>
                {loadingAppt ? '—' : appointmentsTodayCount}
              </div>
            </BentoGridItem>
          </DashboardCard>

          <DashboardCard>
            <BentoGridItem
              title='Pacientes Ativos'
              description={loadingClients
                ? 'Carregando...'
                : `${activeClientsCount} pacientes cadastrados e ativos`}
              icon={<Users className='h-5 w-5' />}
              variant='secondary'
              size='sm'
              enhanced={true}
              elevation='md'
            >
              <div className='text-3xl font-bold text-white'>
                {loadingClients ? '—' : activeClientsCount}
              </div>
            </BentoGridItem>
          </DashboardCard>

          <DashboardCard>
            <BentoGridItem
              title='Receita Mensal'
              description={loadingRevenue ? 'Carregando...' : `Receita total do mês atual`}
              icon={<DollarSign className='h-5 w-5' />}
              variant='accent'
              size='sm'
              enhanced={true}
              elevation='md'
            >
              <div className='text-3xl font-bold text-white'>
                {loadingRevenue ? '—' : formatBRL(monthlyRevenue ?? 0)}
              </div>
            </BentoGridItem>
          </DashboardCard>

          <DashboardCard>
            <BentoGridItem
              title='Taxa de Presença'
              description={showRateLoading
                ? 'Carregando...'
                : `${(showRate * 100).toFixed(0)}% dos pacientes compareceram nos últimos 7 dias`}
              icon={<TrendingUp className='h-5 w-5' />}
              variant='default'
              size='sm'
              enhanced={true}
              elevation='md'
            >
              <div className='text-3xl font-bold'>
                {showRateLoading ? '—' : `${(showRate * 100).toFixed(0)}%`}
              </div>
            </BentoGridItem>
          </DashboardCard>
        </DashboardLayout>

        {/* Main Dashboard Content - Enhanced with Drag & Drop and Tilted Cards */}
        <DashboardLayout>
          {/* Recent Activity - Large card */}
          <DashboardCard>
            <BentoGridItem
              title='Atividade Recente'
              description='Últimas ações na sua clínica'
              icon={<Activity className='h-5 w-5' />}
              variant='default'
              size='lg'
              enhanced={true}
              elevation='sm'
            >
              <div className='space-y-4 mt-4'>
                {loadingActivity && <p className='text-xs text-muted-foreground'>Carregando...</p>}
                {!loadingActivity && (recentActivity?.length ?? 0) === 0 && (
                  <p className='text-xs text-muted-foreground'>Sem atividades recentes.</p>
                )}
                {!loadingActivity
                  && (recentActivity ?? []).map((item, idx) => (
                    <div key={item.id + idx} className='flex items-center space-x-4'>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.type === 'appointment' ? 'bg-primary' : 'bg-blue-500'
                        }`}
                      >
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>{item.label}</p>
                        <p className='text-xs text-muted-foreground'>{item.detail}</p>
                      </div>
                      <Badge variant='secondary'>
                        {new Date(item.created_at!).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Badge>
                    </div>
                  ))}
              </div>
            </BentoGridItem>
          </DashboardCard>

          {/* Quick Actions */}
          <DashboardCard>
            <BentoGridItem
              title='Ações Rápidas'
              description='Acesso rápido às funcionalidades principais'
              icon={<Settings className='h-5 w-5' />}
              variant='primary'
              size='md'
              enhanced={true}
              elevation='md'
            >
              <div className='space-y-3 mt-4'>
                <Button
                  className='w-full justify-start'
                  variant='outline'
                  onClick={() => navigate({ to: '/appointments/new' })}
                >
                  <Calendar className='h-4 w-4 mr-2' />
                  Nova Consulta
                </Button>
                <Button
                  className='w-full justify-start'
                  variant='outline'
                  onClick={() => navigate({ to: '/clients' })}
                >
                  <Users className='h-4 w-4 mr-2' />
                  Cadastrar Paciente
                </Button>
                <Button
                  className='w-full justify-start'
                  variant='outline'
                  onClick={() => navigate({ to: '/services' })}
                >
                  <Settings className='h-4 w-4 mr-2' />
                  Gerenciar Serviços
                </Button>
                <Button className='w-full justify-start' variant='outline'>
                  <DollarSign className='h-4 w-4 mr-2' />
                  Registrar Pagamento
                </Button>
                <Button className='w-full justify-start' variant='outline'>
                  <TrendingUp className='h-4 w-4 mr-2' />
                  Ver Relatórios
                </Button>
              </div>
            </BentoGridItem>
          </DashboardCard>

          {/* Notifications */}
          <DashboardCard>
            <BentoGridItem
              title='Notificações'
              description='Alertas e informações importantes'
              icon={<Bell className='h-5 w-5' />}
              variant='secondary'
              size='sm'
              enhanced={true}
              elevation='md'
            >
              <div className='mt-4'>
                <NotificationCard />
              </div>
            </BentoGridItem>
          </DashboardCard>
        </DashboardLayout>
      </main>
    </div>
  );
}

export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
});
