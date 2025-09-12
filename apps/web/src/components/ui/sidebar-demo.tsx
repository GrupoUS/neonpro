import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  IconArrowLeft,
  IconCalendar,
  IconChartBar,
  IconHome,
  IconLogout,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import { Link, useRouter } from '@tanstack/react-router';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { AnimatedThemeToggler } from './animated-theme-toggler';

export default function SidebarDemo({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: '/' });
  };

  const links = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <IconHome className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
      ),
    },
    {
      label: 'Pacientes',
      href: '/patients',
      icon: (
        <IconUsers className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
      ),
    },
    {
      label: 'Agendamentos',
      href: '/appointments',
      icon: (
        <IconCalendar className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
      ),
    },
    {
      label: 'Relatórios',
      href: '/reports',
      icon: (
        <IconChartBar className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
      ),
    },
    {
      label: 'Governança',
      href: '/governance',
      icon: (
        <IconSettings className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
      ),
    },
  ];

  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        'mx-auto flex h-screen w-full max-w-7xl flex-1 overflow-hidden rounded-md border border-neutral-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800',
      )}
    >
      <Sidebar open={open} setOpen={setOpen} animate={true}>
        <SidebarBody className='justify-between gap-10'>
          <div className='flex flex-1 flex-col overflow-x-hidden overflow-y-auto'>
            <div className='flex items-center justify-between pr-2'>
              {open ? <Logo /> : <LogoIcon />}
              <div className='ml-auto pl-2'>
                {/* Theme toggler visible on all pages */}
                {import.meta.env.VITE_ENABLE_THEME_TOGGLE !== 'false' && (
                  <AnimatedThemeToggler size='sm' />
                )}
              </div>
            </div>
            <div className='mt-6 flex flex-col gap-2'>
              {links.map((link, idx) => <SidebarLink key={idx} link={link} />)}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: 'Sair',
                href: '#',
                icon: (
                  <IconLogout className='h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200' />
                ),
                onClick: handleLogout,
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard>{children}</Dashboard>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      to='/dashboard'
      className='relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black'
    >
      <div className='h-5 w-6 flex-shrink-0 rounded-bl-sm rounded-br-lg rounded-tl-lg rounded-tr-sm bg-black dark:bg-white' />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='whitespace-pre font-medium text-black dark:text-white'
      >
        NeonPro
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      to='/dashboard'
      className='relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black'
    >
      <div className='h-5 w-6 flex-shrink-0 rounded-bl-sm rounded-br-lg rounded-tl-lg rounded-tr-sm bg-black dark:bg-white' />
    </Link>
  );
};

// Sidebar components
export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <>
      <DesktopSidebar open={open} setOpen={setOpen} animate={animate}>
        {children}
      </DesktopSidebar>
      <MobileSidebar open={open} setOpen={setOpen}>
        {children}
      </MobileSidebar>
    </>
  );
};

export const DesktopSidebar = ({
  children,
  open,
  setOpen,
  animate = false,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <>
      <motion.div
        className={cn(
          'hidden h-full w-[300px] flex-shrink-0 px-4 py-4 md:flex md:flex-col',
          'bg-neutral-100 dark:bg-neutral-900',
        )}
        animate={{
          width: animate ? (open ? 300 : 60) : 300,
        }}
        onMouseEnter={() => animate && setOpen?.(true)}
        onMouseLeave={() => animate && setOpen?.(false)}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  children,
  open,
  setOpen,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-50 h-full w-full bg-neutral-950/20 backdrop-blur-sm md:hidden',
        )}
        style={{
          display: open ? 'block' : 'none',
        }}
      >
        <motion.div
          className={cn(
            'fixed left-0 top-0 z-50 h-full w-[300px] bg-neutral-100 px-4 py-4 dark:bg-neutral-900',
          )}
          initial={{ x: '-100%' }}
          animate={{ x: open ? 0 : '-100%' }}
        >
          <div
            className='absolute right-4 top-4 z-50 text-neutral-800 dark:text-neutral-200'
            onClick={() => setOpen?.(false)}
          >
            <IconArrowLeft />
          </div>
          {children}
        </motion.div>
      </div>
    </>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <motion.div
      className={cn('flex h-full flex-1 flex-col overflow-hidden', props.className)}
      {...props}
    />
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: {
    label: string;
    href: string;
    icon: React.JSX.Element | React.ReactNode;
    onClick?: () => void;
  };
  className?: string;
  props?: React.LinkHTMLAttributes<HTMLAnchorElement>;
}) => {
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const isActive = pathname === link.href;

  const handleClick = (e: React.MouseEvent) => {
    if (link.onClick) {
      e.preventDefault();
      link.onClick();
    }
  };

  return (
    <Link
      to={link.href}
      className={cn(
        'group/sidebar flex items-center justify-start gap-2 rounded-md px-2 py-2 text-sm font-normal text-neutral-700 transition duration-150 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-700',
        isActive && 'bg-neutral-200 dark:bg-neutral-700',
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: 'inline-block',
          opacity: 1,
        }}
        className='!m-0 inline-block whitespace-pre !p-0 text-sm text-neutral-700 transition duration-150 group-hover/sidebar:translate-x-1 dark:text-neutral-200'
      >
        {link.label}
      </motion.span>
    </Link>
  );
};

export const Dashboard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-1'>
      <div className='flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900 md:p-10'>
        {children}
      </div>
    </div>
  );
};

