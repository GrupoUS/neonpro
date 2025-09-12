import { ConsentBanner } from '@/components/ConsentBanner';
import { ErrorBoundary } from '@/components/error-pages/ErrorBoundary';
import { NotFoundPage } from '@/components/error-pages/NotFoundPage';
import { BeamsBackground } from '@/components/ui/beams-background';
import FloatingAIChat from '@/components/ui/floating-ai-chat';
import FloatingAIChatSimple from '@/components/ui/floating-ai-chat-simple';
import SidebarDemo from '@/components/ui/sidebar-demo';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { AnimatedThemeToggler as ThemeToggleButton } from '@neonpro/ui';
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

  const isTest = typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'test';
  const canShowToggle = !isTest && import.meta.env.VITE_ENABLE_THEME_TOGGLE !== 'false';

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
    isTest ? (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {/* Ensure main root has bg/text from theme */}
          <div className='min-h-screen bg-background text-foreground'>
            {showSidebar ? <SidebarDemo>{content}</SidebarDemo> : isAuthLike
              ? (
                <BeamsBackground>
                  <div className='flex w-full justify-end p-2'>
                    {canShowToggle && <ThemeToggleButton />}
                  </div>
                  {content}
                </BeamsBackground>
              )
              : (
                <div className='flex min-h-screen flex-col'>
                  <div className='flex w-full justify-end p-2'>
                    {canShowToggle && <ThemeToggleButton />}
                  </div>
                  {content}
                </div>
              )}

            {/* Single toast provider mounted via Sonner at root */}
            <Sonner />
            <ConsentBanner />

            {/* Floating AI Chat - only show on protected pages */}
            {showSidebar && (
              <FloatingAIChatSimple
                context='procedures'
                userRole='professional'
                lgpdCompliant={true}
              />
            )}
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    ) : (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {/* Ensure main root has bg/text from theme */}
            <div className='min-h-screen bg-background text-foreground'>
              {showSidebar ? <SidebarDemo>{content}</SidebarDemo> : isAuthLike
                ? (
                  <BeamsBackground>
                    <div className='flex w-full justify-end p-2'>
                      {canShowToggle && <ThemeToggleButton />}
                    </div>
                    {content}
                  </BeamsBackground>
                )
                : (
                  <div className='flex min-h-screen flex-col'>
                    <div className='flex w-full justify-end p-2'>
                      {canShowToggle && <ThemeToggleButton />}
                    </div>
                    {content}
                  </div>
                )}

              {/* Single toast provider mounted via Sonner at root */}
              <Sonner />
              <ConsentBanner />

              {/* Floating AI Chat - only show on protected pages */}
              {showSidebar && (
                <FloatingAIChatSimple
                  context='procedures'
                  userRole='professional'
                  lgpdCompliant={true}
                />
              )}
            </div>
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    )
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
});
