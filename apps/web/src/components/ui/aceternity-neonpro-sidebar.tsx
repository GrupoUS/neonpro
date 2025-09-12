'use client';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/aceternity-sidebar';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
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
import { Link, useRouter } from '@tanstack/react-router';
import { motion } from 'motion/react';
import React, { useState } from 'react';

export default function AceternityNeonProSidebar({ children }: { children: React.ReactNode }) {
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

  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-full flex-1 flex-col overflow-hidden bg-background md:flex-row dark:bg-background',
        'h-screen', // Full screen height
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className='justify-between gap-10'>
          <div className='flex flex-1 flex-col overflow-x-hidden overflow-y-auto'>
            {open ? <NeonProLogo /> : <NeonProLogoIcon />}
            <div className='mt-8 flex flex-col gap-2'>
              {links.map((link, idx) => <SidebarLink key={idx} link={link} />)}
            </div>
          </div>
          <div>
            <button
              onClick={handleLogout}
              className='flex items-center justify-start gap-2 group/sidebar py-2 w-full text-left hover:bg-accent/50 dark:hover:bg-accent/10 rounded-md px-2 transition-colors'
            >
              <IconArrowLeft className='h-5 w-5 shrink-0 text-muted-foreground group-hover/sidebar:text-foreground' />
              <motion.span
                animate={{
                  display: open ? 'inline-block' : 'none',
                  opacity: open ? 1 : 0,
                }}
                className='text-muted-foreground group-hover/sidebar:text-foreground text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0'
              >
                Sair
              </motion.span>
            </button>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className='flex flex-1'>
        <div className='flex h-full w-full flex-1 flex-col rounded-tl-2xl border border-border bg-card dark:border-border dark:bg-card'>
          {children}
        </div>
      </div>
    </div>
  );
}

export const NeonProLogo = () => {
  return (
    <Link
      to='/dashboard'
      className='relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-foreground'
    >
      <div className='h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-gradient-to-br from-primary to-accent dark:from-primary dark:to-accent' />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='font-medium whitespace-pre text-foreground dark:text-foreground'
      >
        NeonPro
      </motion.span>
    </Link>
  );
};

export const NeonProLogoIcon = () => {
  return (
    <Link
      to='/dashboard'
      className='relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-foreground'
    >
      <div className='h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-gradient-to-br from-primary to-accent dark:from-primary dark:to-accent' />
    </Link>
  );
};