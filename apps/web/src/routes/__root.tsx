import { ConsentBanner } from '@/components/ConsentBanner';
import { ErrorBoundary } from '@/components/error-pages/ErrorBoundary';
import { NotFoundPage } from '@/components/error-pages/NotFoundPage';
import SidebarDemo from '@/components/ui/sidebar-demo';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

const queryClient = new QueryClient();

function RootComponent() {
  // Initialize analytics based on consent
  useAnalytics();
  const router = useRouter();

  // Listen for auth state changes and redirect to dashboard
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Only redirect if we're on the root page
          if (window.location.pathname === '/') {
            router.navigate({ to: '/dashboard' });
          }
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const pathname = router.state.location.pathname;
  const showSidebar = pathname.startsWith('/dashboard') || pathname.startsWith('/patients') || pathname.startsWith('/appointments');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {showSidebar ? (
            <SidebarDemo>
              <main className='flex-1'>
                <Outlet />
              </main>
            </SidebarDemo>
          ) : (
            <div className='flex min-h-screen flex-col'>
              <main className='flex-1'>
                <Outlet />
              </main>
            </div>
          )}
          <ConsentBanner />
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
});
