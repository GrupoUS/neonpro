'use client';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  IconArrowLeft,
  IconBrandTabler,
  IconCalendar,
  IconChartBar,
  IconCreditCard,
  IconSettings,
  IconUserBolt,
  IconUsers,
} from '@tabler/icons-react';
import { Link, useRouter } from '@tanstack/react-router';
import { motion } from 'motion/react';
import React, { useState } from 'react';

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
      icon: <IconBrandTabler className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />,
    },
    {
      label: 'Pacientes',
      href: '/patients',
      icon: <IconUsers className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />,
    },
    {
      label: 'Agendamentos',
      href: '/appointments',
      icon: <IconCalendar className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />,
    },
    {
      label: 'Relatórios',
      href: '/reports',
      icon: <IconChartBar className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />,
    },
    {
      label: 'Financeiro',
      href: '/financial',
      icon: <IconCreditCard className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />,
    },
    {
      label: 'Perfil',
      href: '/profile',
      icon: <IconUserBolt className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />,
    },
    {
      label: 'Configurações',
      href: '/settings',
      icon: <IconSettings className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />,
    },
  ];

  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-full flex-1 flex-col overflow-hidden bg-gray-50 md:flex-row dark:bg-neutral-900',
        'h-screen', // Full screen height
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className='justify-between gap-10'>
          <div className='flex flex-1 flex-col overflow-x-hidden overflow-y-auto'>
            {open ? <Logo /> : <LogoIcon />}
            <div className='mt-8 flex flex-col gap-2'>
              {links.map((link, idx) => <SidebarLink key={idx} link={link} />)}
            </div>
          </div>
          <div>
            <button
              onClick={handleLogout}
              className='flex items-center justify-start gap-2 group/sidebar py-2 w-full text-left'
            >
              <IconArrowLeft className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />
              <motion.span
                animate={{
                  display: open ? 'inline-block' : 'none',
                  opacity: open ? 1 : 0,
                }}
                className='text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0'
              >
                Sair
              </motion.span>
            </button>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className='flex flex-1'>
        <div className='flex h-full w-full flex-1 flex-col rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900'>
          {children}
        </div>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      to='/dashboard'
      className='relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black'
    >
      <div className='h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700' />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='font-medium whitespace-pre text-black dark:text-white'
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
      <div className='h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700' />
    </Link>
  );
};
