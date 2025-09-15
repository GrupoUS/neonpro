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

import { RealTimeStatusIndicator } from '@/components/realtime/RealTimeStatusIndicator';
import FloatingAIChatSimple from '@/components/ui/floating-ai-chat-simple';
import { useAuth } from '@/hooks/useAuth';
import { useEnhancedRealTime, useRealTimePatientSync } from '@/hooks/useEnhancedRealTime';
import { supabase } from '@/integrations/supabase/client';
import { queryClient, setupQueryErrorHandling } from '@/lib/query-client';
import { cn } from '@/lib/utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet, useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
import { EnhancedSidebar } from './EnhancedSidebar';

// Enhanced real-time subscription hooks using the new system
const useEnhancedRealtimeSubscriptions = () => {
  const { user } = useAuth();
  const { subscribe } = useEnhancedRealTime();

  useEffect(() => {
    if (!user) return;

    // Subscribe to patient changes with enhanced features
    const patientSubscription = subscribe({
      tableName: 'patients',
      filter: `clinic_id=eq.${user.id}`,
      enableNotifications: true,
      rateLimitMs: 500,
    });

    return () => {
      patientSubscription?.unsubscribe();
    };
  }, [user, subscribe]);
};

// Enhanced appointment subscription hook
const useEnhancedAppointmentSubscription = () => {
  const { user } = useAuth();
  const { subscribe } = useEnhancedRealTime();

  useEffect(() => {
    if (!user) return;

    // Subscribe to appointment changes with enhanced features
    const appointmentSubscription = subscribe({
      tableName: 'appointments',
      filter: `clinic_id=eq.${user.id}`,
      enableNotifications: true,
      rateLimitMs: 500,
      onInsert: _payload => {
        toast.success('Novo agendamento criado!');
      },
      onUpdate: payload => {
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
      },
      onDelete: () => {
        toast.info('Agendamento removido!');
      },
    });

    return () => {
      appointmentSubscription?.unsubscribe();
    };
  }, [user, subscribe]);
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
  const { user } = useAuth();

  // Activate enhanced real-time subscriptions
  useEnhancedRealtimeSubscriptions();
  useEnhancedAppointmentSubscription();
  useRoutePrefetch();

  // Activate patient-specific real-time sync
  useRealTimePatientSync(user?.id || '');

  // Setup error handling
  useEffect(() => {
    setupQueryErrorHandling();
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
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-70',
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

              {/* Enhanced Real-time Status Indicator */}
              <div className='flex items-center gap-2'>
                <RealTimeStatusIndicator
                  showMetrics={true}
                  className='transition-all duration-200'
                />
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
