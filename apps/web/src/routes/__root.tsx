import { ConsentBanner } from '@/components/ConsentBanner';
import { ErrorBoundary } from '@/components/error-pages/ErrorBoundary';
import { NotFoundPage } from '@/components/error-pages/NotFoundPage';
import { BeamsBackground } from '@/components/ui/beams-background';
import FloatingAIChat from '@/components/ui/floating-ai-chat';
import SidebarDemo from '@/components/ui/sidebar-demo';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

const queryClient = new QueryClient();

function RootComponent() {
  useAnalytics();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          if (router.state.location.pathname === '/') {
            router.navigate({ to: '/dashboard' });
          }
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const pathname = router.state.location.pathname;
  const excludedRoutes = [
    '/',
    '/login',
    '/signup',
    '/signup-demo',
    '/auth/callback',
    '/auth/confirm',
    '/404',
  ];
  const showSidebar = !excludedRoutes.includes(pathname) && !pathname.startsWith('/auth/');
  const isAuthLike = excludedRoutes.includes(pathname) || pathname.startsWith('/auth/');

  const content = (
    <main className='flex-1'>
      <Outlet />
    </main>
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {showSidebar
            ? <SidebarDemo>{content}</SidebarDemo>
            : isAuthLike
            ? <BeamsBackground>{content}</BeamsBackground>
            : <div className='flex min-h-screen flex-col'>{content}</div>}

          {/* Single toast provider mounted via Sonner at root */}
          <Sonner />
          <ConsentBanner />

          {/* Floating AI Chat - only show on protected pages */}
          {showSidebar && (
            <FloatingAIChat
              context='procedures'
              userRole='professional'
              lgpdCompliant={true}
            />
          )}
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
});
