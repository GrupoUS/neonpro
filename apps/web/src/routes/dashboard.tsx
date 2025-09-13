import { NotificationCard } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { signOut, supabase } from '@/integrations/supabase/client';
import { Badge } from '@neonpro/ui';
import { Button } from '@neonpro/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neonpro/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  Activity,
  Bell,
  Calendar,
  DollarSign,
  LogOut,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';

function formatBRL(value: number | null | undefined) {
  const v = typeof value === 'number' ? value : 0;
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  } catch {
    return `R$ ${v.toFixed(2)}`;
  }
}

function DashboardComponent() {
  const { user, session, loading, isAuthenticated } = useAuth();
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
            new Date(a.start_time).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })
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
  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate({ to: '/' as const });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
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
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <h1 className='text-2xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent'>
                NEON PRO
              </h1>
              <Badge variant='secondary' className='text-xs'>
                Dashboard
              </Badge>
              {user && (
                <Badge variant='outline' className='text-xs'>
                  {user.email}
                </Badge>
              )}
            </div>

            <div className='flex items-center space-x-2'>
              <Button variant='ghost' size='sm'>
                <Bell className='h-4 w-4' />
              </Button>
              <Button variant='ghost' size='sm'>
                <Settings className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleLogout}
                title='Sair'
              >
                <LogOut className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </header>

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

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <Card enableShineBorder>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Consultas Hoje
              </CardTitle>
              <Calendar className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{loadingAppt ? '—' : appointmentsTodayCount}</div>
              <p className='text-xs text-muted-foreground'>
                {/* We can compute diff vs yesterday in a future iteration */}
                Hoje
              </p>
            </CardContent>
          </Card>

          <Card enableShineBorder>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pacientes Ativos
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {loadingClients ? '—' : activeClientsCount}
              </div>
              <p className='text-xs text-muted-foreground'>
                Total ativos
              </p>
            </CardContent>
          </Card>

          <Card enableShineBorder>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Receita Mensal
              </CardTitle>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {loadingRevenue ? '—' : formatBRL(monthlyRevenue)}
              </div>
              <p className='text-xs text-muted-foreground'>
                Mês atual
              </p>
            </CardContent>
          </Card>

          <Card enableShineBorder>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Taxa de Presença (7 dias)
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {showRateLoading ? '—' : `${(showRate * 100).toFixed(0)}%`}
              </div>
              <p className='text-xs text-muted-foreground'>
                Com base em consultas concluídas vs. faltas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Recent Activity */}
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Activity className='h-5 w-5' />
                Atividade Recente
              </CardTitle>
              <CardDescription>
                Últimas ações na sua clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
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
            </CardContent>
          </Card>

          {/* Quick Actions and Notifications */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesso rápido às funcionalidades principais
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
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
                <Button className='w-full justify-start' variant='outline'>
                  <DollarSign className='h-4 w-4 mr-2' />
                  Registrar Pagamento
                </Button>
                <Button className='w-full justify-start' variant='outline'>
                  <TrendingUp className='h-4 w-4 mr-2' />
                  Ver Relatórios
                </Button>
              </CardContent>
            </Card>

            <NotificationCard />
          </div>
        </div>
      </main>
    </div>
  );
}

export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
});
