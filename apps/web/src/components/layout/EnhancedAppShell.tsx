/**
 * EnhancedAppShell Component - Complete Navigation System (FR-009, FR-010)
 * Integrates EnhancedSidebar and BreadcrumbNavigation with real-time features
 * 
 * Features:
 * - Enhanced collapsible sidebar navigation
 * - Route-aware breadcrumb navigation
 * - Real-time patient and appointment subscriptions
 * - Mobile-responsive design
 * - Accessibility compliance (WCAG 2.1 AA+)
 * - Brazilian healthcare context
 * - Performance optimization with prefetching
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { queryClient, setupQueryErrorHandling } from '@/lib/query-client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet, useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import FloatingAIChatSimple from '@/components/ui/floating-ai-chat-simple';
import { EnhancedSidebar } from './EnhancedSidebar';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
import { cn } from '@/lib/utils';

// Real-time subscription hook for patients
const usePatientRealtimeSubscription = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('patient-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
          filter: `clinic_id=eq.${user.id}`,
        },
        payload => {
          console.log('Patient change:', payload);
          queryClient.invalidateQueries({ queryKey: ['patients'] });

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

// Real-time subscription hook for appointments
const useAppointmentRealtimeSubscription = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('appointment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `clinic_id=eq.${user.id}`,
        },
        payload => {
          console.log('Appointment change:', payload);
          queryClient.invalidateQueries({ queryKey: ['appointments'] });

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
};

// Route-based prefetching hook
const useRoutePrefetch = () => {
  const location = useLocation();

  useEffect(() => {
    // Prefetch data based on current route
    if (location.pathname.startsWith('/patients')) {
      queryClient.prefetchQuery({
        queryKey: ['patients', 'stats'],
        queryFn: async () => {
          const { data } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true });
          return { total: data?.length || 0 };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
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
        staleTime: 2 * 60 * 1000, // 2 minutes
      });
    }
  }, [location.pathname]);
};

function EnhancedAppShellContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);

  // Activate real-time subscriptions
  usePatientRealtimeSubscription();
  useAppointmentRealtimeSubscription();
  useRoutePrefetch();

  // Setup error handling
  useEffect(() => {
    setupQueryErrorHandling();
  }, []);

  // Monitor real-time connection status
  useEffect(() => {
    const handleConnectionChange = (status: string) => {
      if (status === 'SUBSCRIBED') {
        console.log('Real-time connection established');
        setIsRealTimeConnected(true);
        toast.success('Conexão em tempo real ativada!');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Real-time connection error');
        setIsRealTimeConnected(false);
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

  return (
    <div className='flex h-screen bg-background'>
      {/* Enhanced Sidebar */}
      <EnhancedSidebar
        onCollapseChange={setSidebarCollapsed}
        className='z-50'
      />

      {/* Main Content Area */}
      <div 
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-70'
        )}
      >
        {/* Header with Breadcrumbs */}
        <header className='sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border'>
          <div className='container mx-auto px-4 py-3'>
            <BreadcrumbNavigation 
              className='mb-2'
              maxItems={4}
            />
            
            {/* Page Title Area - can be customized per route */}
            <div className='flex items-center justify-between'>
              <div className='min-w-0 flex-1'>
                {/* This will be filled by individual pages if needed */}
              </div>
              
              {/* Real-time Status Indicator */}
              <div className='flex items-center gap-2'>
                <div className={cn(
                  'flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors',
                  isRealTimeConnected 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                )}>
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    isRealTimeConnected 
                      ? 'bg-green-500 animate-pulse' 
                      : 'bg-red-500'
                  )} />
                  <span>
                    {isRealTimeConnected ? 'Tempo Real Ativo' : 'Desconectado'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='flex-1 overflow-y-auto'>
          <div className='container mx-auto p-4 md:p-6'>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating AI Chat */}
      <FloatingAIChatSimple />
    </div>
  );
}

export default function EnhancedAppShell() {
  return (
    <QueryClientProvider client={queryClient}>
      <EnhancedAppShellContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
