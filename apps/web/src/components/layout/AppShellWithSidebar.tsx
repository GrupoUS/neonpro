import FloatingAIChatSimple from '@/components/ui/floating-ai-chat-simple';
import { cn } from '@/lib/utils';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { queryClient, setupQueryErrorHandling } from '@/lib/query-client';
import {
  IconCalendar,
  IconChevronDown,
  IconDashboard,
  IconFileText,
  IconLogout,
  IconMoneybag,
  IconReport,
  IconSettings,
  IconStethoscope,
  IconUsers,
} from '@tabler/icons-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet, useLocation } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
        payload => {
          console.log('Patient change:', payload);

          // Invalidar queries relacionadas a pacientes
          queryClient.invalidateQueries({ queryKey: ['patients'] });

          // Mostrar notificação para mudanças importantes
          if (payload.eventType === 'INSERT') {
            toast.success('Novo paciente cadastrado!');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Dados do paciente atualizados!');
          }
        },
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
        payload => {
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
        },
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Ativar real-time subscriptions
  usePatientRealtimeSubscription();
  useAppointmentRealtimeSubscription();
  useRoutePrefetch();

  // Configurar tratamento de erros
  useEffect(() => {
    setupQueryErrorHandling();
  }, []);

  // Rotas públicas que não devem mostrar sidebar/chat
  const publicRoutes = ['/login', '/signup', '/auth/callback', '/auth/confirm'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

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
    /*     {
          label: 'Documentos',
          href: '/documents',
          icon: (
            <IconFileText className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
          ),
        }, */
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

  // Se for rota pública ou usuário não autenticado, renderizar apenas o conteúdo
  if (isPublicRoute || !user) {
    return (
      <div className='h-screen bg-background'>
        <Outlet />
      </div>
    );
  }

  return (
    <div className={cn(
      "flex w-full flex-1 flex-col overflow-hidden md:flex-row rounded-md border border-neutral-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800",
      "h-screen bg-background"
    )}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className='flex flex-col flex-1 overflow-y-auto overflow-x-hidden'>
            {/* Logo */}
            <div className={cn(
              'flex items-center mb-6 transition-all duration-200',
              open ? 'gap-x-3 px-1' : 'justify-center'
            )}>
              <div className='flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0'>
                <IconStethoscope className='h-5 w-5 text-primary' />
              </div>
              <AnimatePresence>
                {open && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className='text-lg font-semibold text-foreground whitespace-nowrap overflow-hidden'
                  >
                    NeonPro
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Links */}
            <nav className={cn(
              'flex flex-col',
              open ? 'gap-1' : 'gap-2 items-center'
            )}>
              {links.map(link => (
                <SidebarLink
                  key={link.href}
                  link={link}
                />
              ))}
            </nav>
          </div>

          {/* User Profile Section */}
          {user && (
            <div className={cn(
              'border-t border-sidebar-border pt-4 transition-all duration-200',
              open ? '' : 'flex justify-center'
            )}>
              {open ? (
                <div className='relative'>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className='w-full flex items-center gap-x-3 px-2 py-2 rounded-lg hover:bg-accent/50 dark:hover:bg-accent/20 transition-colors'
                    aria-expanded={userMenuOpen}
                    aria-haspopup='true'
                  >
                    <div className='h-9 w-9 shrink-0 rounded-full bg-primary/15 flex items-center justify-center'>
                      <IconUsers className='h-4 w-4 text-primary' />
                    </div>
                    <div className='flex flex-col min-w-0 flex-1 text-left'>
                      <span className='text-sm font-medium text-foreground truncate'>{user.email}</span>
                      <span className='text-xs text-muted-foreground'>Admin</span>
                    </div>
                    <IconChevronDown className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform duration-200',
                      userMenuOpen && 'rotate-180'
                    )} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className='absolute bottom-full left-0 right-0 mb-2 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50'
                      >
                        <button
                          onClick={async () => {
                            setUserMenuOpen(false);
                            await supabase.auth.signOut();
                            window.location.href = '/login';
                          }}
                          className='w-full flex items-center gap-3 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors'
                        >
                          <IconLogout className='h-4 w-4' />
                          <span>Sair</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className='relative'>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className='h-11 w-11 rounded-full bg-primary/15 flex items-center justify-center cursor-pointer hover:bg-primary/25 transition-colors'
                    title={user.email}
                    aria-expanded={userMenuOpen}
                    aria-haspopup='true'
                  >
                    <IconUsers className='h-5 w-5 text-primary' />
                  </button>

                  {/* Dropdown Menu (collapsed) */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className='absolute bottom-full left-0 mb-2 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-[120px]'
                      >
                        <button
                          onClick={async () => {
                            setUserMenuOpen(false);
                            await supabase.auth.signOut();
                            window.location.href = '/login';
                          }}
                          className='w-full flex items-center gap-3 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors'
                        >
                          <IconLogout className='h-4 w-4' />
                          <span>Sair</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </SidebarBody>
      </Sidebar>

      <main className='flex-1 overflow-y-auto bg-background'>
        <div className='h-full p-4 md:p-8'>
          <Outlet />
        </div>
      </main>

      <FloatingAIChatSimple />

      {/* Status indicator para real-time */}
      {user && (
        <div className='fixed bottom-4 right-20 z-40'>
          <div className='flex items-center gap-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-3 py-1 rounded-full text-xs shadow-lg'>
            <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
            <span>Online</span>
          </div>
        </div>
      )}
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
