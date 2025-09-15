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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, Outlet } from '@tanstack/react-router';
import { useState } from 'react';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppShellWithSidebar() {
  const [open, setOpen] = useState(false);

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
    {
      label: 'Configurações',
      href: '/settings',
      icon: (
        <IconSettings className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
      ),
    },
  ];

  return (
    <QueryClientProvider client={queryClient}>
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
            </div>{' '}
            <div>
              <SidebarLink
                link={{
                  label: 'Perfil',
                  href: '/profile',
                  icon: (
                    <IconUser className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />
                  ),
                }}
              />
            </div>
          </SidebarBody>
        </Sidebar>

        {/* Main Content */}
        <div
          className={cn(
            'transition-all duration-300',
            open
              ? 'w-full md:w-[calc(100%-16rem)]'
              : 'w-full md:w-[calc(100%-4rem)]',
          )}
        >
          <div className='flex h-full w-full flex-col overflow-hidden'>
            {/* Page Content */}
            <div className='flex-1 overflow-auto bg-background p-4'>
              <Outlet />
            </div>
          </div>
        </div>

        {/* Floating AI Chat Button */}
        <FloatingAIChatSimple
          context='procedures'
          userRole='professional'
          lgpdCompliant={true}
        />
      </div>
    </QueryClientProvider>
  );
}

export default AppShellWithSidebar;
