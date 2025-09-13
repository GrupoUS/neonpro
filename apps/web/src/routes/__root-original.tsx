import { ConsentBanner } from '@/components/ConsentBanner';
import { ErrorBoundary } from '@/components/error-pages/ErrorBoundary';
import { NotFoundPage } from '@/components/error-pages/NotFoundPage';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { BeamsBackground } from '@/components/ui/beams-background';
import FloatingAIChatSimple from '@/components/ui/floating-ai-chat-simple';
import React, { useState } from 'react';

function AppShellWithSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <IconBrandTabler className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    },
    {
      label: 'Clientes',
      href: '/clients',
      icon: (
        <IconUsers className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    },
    {
      label: 'Agendamentos',
      href: '/appointments',
      icon: (
        <IconCalendar className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    },
    {
      label: 'Relatórios',
      href: '/reports',
      icon: (
        <IconChartBar className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    },
    {
      label: 'Financeiro',
      href: '/financial',
      icon: (
        <IconCreditCard className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    },
    {
      label: 'Governança',
      href: '/governance',
      icon: (
        <IconBuildingBank className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    },
    {
      label: 'Perfil',
      href: '/profile',
      icon: (
        <IconUserBolt className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    },
    {
      label: 'Configurações',
      href: '/settings',
      icon: (
        <IconSettings className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    },
  ];

  return (
    <div className='mx-auto flex w-full max-w-full flex-1 flex-col overflow-hidden bg-background md:flex-row dark:bg-background h-screen'>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className='justify-between gap-10'>
          <div className='flex flex-1 flex-col overflow-x-hidden overflow-y-auto'>
            <div className='flex items-center justify-between pr-2'>
              <Link
                to='/dashboard'
                className='relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-foreground'
              >
                <img
                  src='/brand/simboloneonpro.png'
                  alt='NeonPro'
                  className='h-6 w-6 shrink-0 rounded-md object-contain'
                  onError={e => {
                    // First fallback to SVG version, then to favicon
                    if ((e.currentTarget as HTMLImageElement).src.includes('.png')) {
                      (e.currentTarget as HTMLImageElement).src = '/brand/simboloneonpro.svg';
                    } else {
                      (e.currentTarget as HTMLImageElement).src = '/neonpro-favicon.svg';
                    }
                  }}
                />
                <span className='font-medium whitespace-pre text-foreground dark:text-foreground'>
                  NeonPro
                </span>
              </Link>
            </div>
            <div className='mt-6 flex flex-col gap-2'>
              {links.map((link, idx) => <SidebarLink key={idx} link={link as any} />)}
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            {/* Theme Toggle Button */}
            <div className='flex items-center justify-center py-2'>
              <AnimatedThemeToggler size='md' />
            </div>

            <Link
              to='/'
              className='flex items-center justify-start gap-2 group/sidebar py-2 w-full text-left hover:bg-accent/50 dark:hover:bg-accent/10 rounded-md px-2 transition-colors'
            >
              <IconArrowLeft className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
              <span className='text-muted-foreground group-hover/sidebar:text-foreground text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0'>
                Sair
              </span>
            </Link>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className='flex flex-1 overflow-hidden'>
        <div className='flex h-full w-full flex-1 flex-col rounded-tl-2xl border border-border bg-card dark:border-border dark:bg-card overflow-y-auto'>
          {children}
        </div>
      </div>
    </div>
  );
}

import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import {
  IconArrowLeft,
  IconBrandTabler,
  IconBuildingBank,
  IconCalendar,
  IconChartBar,
  IconCreditCard,
  IconSettings,
  IconUserBolt,
  IconUsers,
} from '@tabler/icons-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
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
    isTest
      ? (
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {/* Ensure main root has bg/text from theme */}
            <div className='min-h-full h-full bg-background text-foreground'>
              {showSidebar ? <AppShellWithSidebar>{content}</AppShellWithSidebar> : isAuthLike
                ? (
                  <BeamsBackground>
                    <div className='flex w-full justify-end p-2'>
                      {canShowToggle && <AnimatedThemeToggler />}
                    </div>
                    {content}
                  </BeamsBackground>
                )
                : (
                  <div className='flex min-h-full h-full flex-col'>
                    <div className='flex w-full justify-end p-2'>
                      {canShowToggle && <AnimatedThemeToggler />}
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
      )
      : (
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              {/* Ensure main root has bg/text from theme */}
              <div className='min-h-full h-full bg-background text-foreground'>
                {showSidebar ? <AppShellWithSidebar>{content}</AppShellWithSidebar> : isAuthLike
                  ? (
                    <BeamsBackground>
                      <div className='flex w-full justify-end p-2'>
                        {canShowToggle && <AnimatedThemeToggler />}
                      </div>
                      {content}
                    </BeamsBackground>
                  )
                  : (
                    <div className='flex min-h-full h-full flex-col'>
                      <div className='flex w-full justify-end p-2'>
                        {canShowToggle && <AnimatedThemeToggler />}
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

export const Route = createRootRoute('/__root-original')({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
});
