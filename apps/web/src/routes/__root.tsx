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
          // Only redirect if we're on the root page (use router state, not window)
          if (router.state.location.pathname === '/') {
            router.navigate({ to: '/dashboard' });
          }
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const pathname = router.state.location.pathname;

  // Define routes that should NOT show the sidebar (login, sales, auth pages)
  const excludedRoutes = [
    '/', // Landing/sales page
    '/login', // Login page
    '/signup', // Signup page
    '/signup-demo', // Signup demo page
    '/auth/callback', // Auth callback
    '/auth/confirm', // Auth confirmation
    '/404', // Error page
  ];

  // Show sidebar on all routes EXCEPT excluded ones
  const showSidebar = !excludedRoutes.includes(pathname) && !pathname.startsWith('/auth/');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {showSidebar
            ? (
              <SidebarDemo>
                <main className='flex-1'>
                  <Outlet />
                </main>
              </SidebarDemo>
            )
            : (
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
