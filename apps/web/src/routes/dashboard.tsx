import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { createFileRoute } from '@tanstack/react-router';
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
import { useEffect } from 'react';

function DashboardComponent() {
  // Handle OAuth callback and clean up URL
  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Check if we have OAuth tokens in the URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');

      if (accessToken) {
        console.log('OAuth callback detected, cleaning up URL...');
        // Clean up the URL by removing the hash
        window.history.replaceState({}, document.title, window.location.pathname);

        // Verify the session is established
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('OAuth session established successfully');
        }
      }
    };

    handleOAuthCallback();
  }, []);

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
            </div>

            <div className='flex items-center space-x-2'>
              <Button variant='ghost' size='sm'>
                <Bell className='h-4 w-4' />
              </Button>
              <Button variant='ghost' size='sm'>
                <Settings className='h-4 w-4' />
              </Button>
              <Button variant='ghost' size='sm'>
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
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Consultas Hoje
              </CardTitle>
              <Calendar className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>12</div>
              <p className='text-xs text-muted-foreground'>
                +2 desde ontem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pacientes Ativos
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>248</div>
              <p className='text-xs text-muted-foreground'>
                +12% este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Receita Mensal
              </CardTitle>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>R$ 45.231</div>
              <p className='text-xs text-muted-foreground'>
                +8% desde o mês passado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Taxa de Conversão
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>73%</div>
              <p className='text-xs text-muted-foreground'>
                +5% desde a semana passada
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
                <div className='flex items-center space-x-4'>
                  <div className='w-2 h-2 bg-primary rounded-full'></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>Nova consulta agendada</p>
                    <p className='text-xs text-muted-foreground'>Maria Silva - Botox - 14:30</p>
                  </div>
                  <Badge variant='secondary'>Há 5 min</Badge>
                </div>

                <div className='flex items-center space-x-4'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>Pagamento recebido</p>
                    <p className='text-xs text-muted-foreground'>João Santos - R$ 850,00</p>
                  </div>
                  <Badge variant='secondary'>Há 12 min</Badge>
                </div>

                <div className='flex items-center space-x-4'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>Novo paciente cadastrado</p>
                    <p className='text-xs text-muted-foreground'>Ana Costa - Preenchimento</p>
                  </div>
                  <Badge variant='secondary'>Há 25 min</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às funcionalidades principais
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button className='w-full justify-start' variant='outline'>
                <Calendar className='h-4 w-4 mr-2' />
                Nova Consulta
              </Button>
              <Button className='w-full justify-start' variant='outline'>
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
        </div>
      </main>
    </div>
  );
}

export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
});
