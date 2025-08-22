'use client';

import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CreditCard,
  FileCheck,
  FileText,
  Heart,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Stethoscope,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

// Healthcare navigation items with Brazilian Portuguese labels
const navigationItems = [
  {
    title: 'Emergência',
    href: '/emergency',
    icon: AlertTriangle,
    description: 'Acesso rápido para emergências médicas',
    isEmergency: true,
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral do sistema',
  },
  {
    title: 'Pacientes',
    href: '/dashboard/patients',
    icon: Users,
    description: 'Gestão de pacientes',
  },
  {
    title: 'Consultas',
    href: '/dashboard/appointments',
    icon: Calendar,
    description: 'Agendamentos e consultas',
  },
  {
    title: 'Tratamentos',
    href: '/dashboard/treatments',
    icon: Heart,
    description: 'Tratamentos e procedimentos',
  },
  {
    title: 'Equipe',
    href: '/team',
    icon: UserCheck,
    description: 'Coordenação e gestão da equipe',
  },
];

const analyticsItems = [
  {
    title: 'Análises',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Relatórios e análises',
  },
  {
    title: 'Financeiro',
    href: '/dashboard/financial',
    icon: CreditCard,
    description: 'Gestão financeira',
  },
  {
    title: 'Relatórios',
    href: '/dashboard/reports',
    icon: FileText,
    description: 'Relatórios detalhados',
  },
];

const systemItems = [
  {
    title: 'Compliance',
    href: '/dashboard/compliance',
    icon: Shield,
    description: 'LGPD e conformidade',
  },
  {
    title: 'Consentimentos',
    href: '/consent',
    icon: FileCheck,
    description: 'Gestão de consentimentos e direitos LGPD',
  },
  {
    title: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Configurações do sistema',
  },
];

export function HealthcareSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-healthcare-border border-r bg-sidebar-bg">
      {/* Healthcare Header */}
      <SidebarHeader className="border-healthcare-border border-b">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-healthcare-primary">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold font-serif text-lg text-sidebar-text">
              NeonPro
            </span>
            <span className="text-sidebar-text/60 text-xs">
              Healthcare Management
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Principal Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-medium text-sidebar-text/70">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isEmergency = item.isEmergency;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      className={`group transition-all duration-200 ${
                        isEmergency
                          ? isActive
                            ? 'bg-red-600 text-white shadow-md'
                            : 'border border-red-400/30 text-red-400 hover:bg-red-600 hover:text-white'
                          : isActive
                            ? 'bg-sidebar-active text-white shadow-md'
                            : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
                      }`}
                      isActive={isActive}
                      tooltip={item.description}
                    >
                      <Link
                        className="flex items-center gap-3"
                        href={item.href}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            isEmergency
                              ? isActive
                                ? 'text-white'
                                : 'text-red-400'
                              : isActive
                                ? 'text-white'
                                : 'text-sidebar-text/70'
                          }`}
                        />
                        <span className="font-medium">{item.title}</span>
                        {isEmergency && (
                          <span className="ml-auto font-bold text-xs">🚨</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-sidebar-text/20" />

        {/* Analytics & Reports */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-medium text-sidebar-text/70">
            Análises & Relatórios
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      className={`group transition-all duration-200 hover:bg-sidebar-hover ${
                        isActive
                          ? 'bg-sidebar-active text-white shadow-md'
                          : 'text-sidebar-text hover:text-white'
                      }`}
                      isActive={isActive}
                      tooltip={item.description}
                    >
                      <Link
                        className="flex items-center gap-3"
                        href={item.href}
                      >
                        <Icon
                          className={`h-4 w-4 ${isActive ? 'text-white' : 'text-sidebar-text/70'}`}
                        />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-sidebar-text/20" />

        {/* System & Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-medium text-sidebar-text/70">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      className={`group transition-all duration-200 hover:bg-sidebar-hover ${
                        isActive
                          ? 'bg-sidebar-active text-white shadow-md'
                          : 'text-sidebar-text hover:text-white'
                      }`}
                      isActive={isActive}
                      tooltip={item.description}
                    >
                      <Link
                        className="flex items-center gap-3"
                        href={item.href}
                      >
                        <Icon
                          className={`h-4 w-4 ${isActive ? 'text-white' : 'text-sidebar-text/70'}`}
                        />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Healthcare Footer */}
      <SidebarFooter className="border-healthcare-border border-t px-2">
        <SidebarMenu>
          {/* Help */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-sidebar-text transition-all duration-200 hover:bg-sidebar-hover hover:text-white"
              tooltip="Central de ajuda"
            >
              <Link className="flex items-center gap-3" href="/help">
                <HelpCircle className="h-4 w-4 text-sidebar-text/70" />
                <span className="font-medium">Ajuda</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* User Profile */}
          <SidebarMenuItem>
            <SidebarMenuButton
              className="p-3 text-sidebar-text transition-all duration-200 hover:bg-sidebar-hover hover:text-white"
              tooltip="Perfil do usuário"
            >
              <div className="flex w-full items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage alt="User" src="" />
                  <AvatarFallback className="bg-healthcare-primary font-medium text-sm text-white">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col text-left">
                  <span className="truncate font-medium text-sidebar-text text-sm">
                    Dr. Admin
                  </span>
                  <span className="truncate text-sidebar-text/60 text-xs">
                    admin@neonpro.com
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Logout */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-sidebar-text transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
              tooltip="Sair do sistema"
            >
              <button className="flex w-full items-center gap-3">
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Sair</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
