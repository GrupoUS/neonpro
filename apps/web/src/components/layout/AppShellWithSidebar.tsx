import FloatingAIChatSimple from '@/components/ui/floating-ai-chat-simple';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import {
  IconCalendar,
  IconDashboard,
  IconFileText,
  IconMoneybag,
  IconReport,
  IconSettings,
  IconStethoscope,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Link, Outlet, useLocation } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { queryClient, setupQueryErrorHandling } from '@/lib/query-client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// Real-time subscription hook para pacientes
const usePatientRealtimeSubscription = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;

    // Canal para real-time updates de pacientes
    const channel = supabase
      .channel('patient-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
          filter: `clinic_id=eq.${user.id}`, // Filtrar por clínica do usuário
        },
        (payload) => {
          console.log('Patient change:', payload);
          
          // Invalidar queries relacionadas a pacientes
          queryClient.invalidateQueries({ queryKey: ['patients'] });
          
          // Mostrar notificação para mudanças importantes
          if (payload.eventType === 'INSERT') {
            toast.success('Novo paciente cadastrado!');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Dados do paciente atualizados!');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
};

// Real-time subscription hook para agendamentos
const useAppointmentRealtimeSubscription = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;

    // Canal para real-time updates de agendamentos
    const channel = supabase
      .channel('appointment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `clinic_id=eq.${user.id}`, // Filtrar por clínica do usuário
        },
        (payload) => {
          console.log('Appointment change:', payload);
          
          // Invalidar queries relacionadas a agendamentos
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
          
          // Mostrar notificação para mudanças importantes
          if (payload.eventType === 'INSERT') {
            toast.success('Novo agendamento criado!');
          } else if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new?.status;
            const oldStatus = payload.old?.status;
            
            if (newStatus !== oldStatus) {
              if (newStatus === 'confirmed') {
                toast.success('Agendamento confirmado!');
              } else if (newStatus === 'cancelled') {
                toast.error('Agendamento cancelado!');
              } else if (newStatus === 'completed') {
                toast.success('Agendamento concluído!');
              }
            }
          } else if (payload.eventType === 'DELETE') {
            toast.info('Agendamento removido!');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Monitorar conexão do Supabase
  useEffect(() => {
    const handleConnectionChange = (status: string) => {
      if (status === 'SUBSCRIBED') {
        console.log('Real-time connection established');
        toast.success('Conexão em tempo real ativada!');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Real-time connection error');
        toast.error('Erro na conexão em tempo real!');
      }
    };

    const channel = supabase.channel('connection-monitor');
    channel.on('system', { event: 'connection' }, handleConnectionChange);
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};

// Hook para prefetch de dados com base na rota atual
const useRoutePrefetch = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Prefetch dados com base na rota
    if (location.pathname.startsWith('/patients')) {
      queryClient.prefetchQuery({
        queryKey: ['patients', 'stats'],
        queryFn: async () => {
          const { data } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true });
          return { total: data?.length || 0 };
        },
        staleTime: 5 * 60 * 1000,
      });
    }
    
    if (location.pathname.startsWith('/appointments')) {
      queryClient.prefetchQuery({
        queryKey: ['appointments', 'today'],
        queryFn: async () => {
          const today = new Date().toISOString().split('T')[0];
          const { data } = await supabase
            .from('appointments')
            .select('*')
            .gte('start_time', `${today}T00:00:00`)
            .lte('start_time', `${today}T23:59:59`);
          return data;
        },
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [location.pathname]);
};

function AppShellContent() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  
  // Ativar real-time subscriptions
  usePatientRealtimeSubscription();
  useAppointmentRealtimeSubscription();
  useRoutePrefetch();

  // Configurar tratamento de erros
  useEffect(() => {
    setupQueryErrorHandling();
  }, []);

  const links = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <IconDashboard className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    },
    {
      label: 'Pacientes',
      href: '/patients',
      icon: (
        <IconUsers className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    },
    {
      label: 'Agenda',
      href: '/appointments',
      icon: (
        <IconCalendar className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    },
    {
      label: 'Serviços',
      href: '/services',
      icon: (
        <IconStethoscope className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    },
    {
      label: 'Financeiro',
      href: '/financial',
      icon: (
        <IconMoneybag className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    },
    {
      label: 'Documentos',
      href: '/documents',
      icon: (
        <IconFileText className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    },
    {
      label: 'Relatórios',
      href: '/reports',
      icon: (
        <IconReport className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    },
  ];

  // Adicionar link de configurações apenas para usuários autenticados
  if (user) {
    links.push({
      label: 'Configurações',
      href: '/settings',
      icon: (
        <IconSettings className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    });
  }

  return (
    <div className='flex h-screen'>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody>
          <div className='flex flex-col gap-y-4 p-4'>
            <div className='flex items-center gap-x-2 px-2'>
              <IconStethoscope className='h-6 w-6 text-primary' />
              <span className='text-lg font-semibold'>NeonPro</span>
            </div>
            <nav className='space-y-1'>
              {links.map((link) => (
                <SidebarLink
                  key={link.href}
                  link={link}
                  setOpen={setOpen}
                />
              ))}
            </nav>
          </div>
        </SidebarBody>
      </Sidebar>

      <main className='flex-1 overflow-y-auto'>
        <div className='container mx-auto p-4 md:p-6'>
          <Outlet />
        </div>
      </main>

      <FloatingAIChatSimple />
      
      {/* Status indicator para real-time */}
      <div className='fixed bottom-4 right-4 z-50'>
        <div className='flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm'>
          <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
          <span>Real-time Ativo</span>
        </div>
      </div>
    </div>
  );
}

export default function AppShellWithSidebar() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShellContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}