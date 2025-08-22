'use client';

import {
  BarChart3,
  Calendar,
  CreditCard,
  FileCheck,
  FileText,
  Heart,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
  LogOut,
  HelpCircle,
  Stethoscope,
  AlertTriangle,
  UserCheck,
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
    <Sidebar className="border-r border-healthcare-border bg-sidebar-bg">
      {/* Healthcare Header */}
      <SidebarHeader className="border-b border-healthcare-border">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-healthcare-primary">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold text-sidebar-text">
              NeonPro
            </span>
            <span className="text-xs text-sidebar-text/60">
              Healthcare Management
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Principal Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-text/70 font-medium">
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
                      isActive={isActive}
                      tooltip={item.description}
                      className={`group transition-all duration-200 ${
                        isEmergency
                          ? isActive
                            ? 'bg-red-600 text-white shadow-md'
                            : 'text-red-400 hover:bg-red-600 hover:text-white border border-red-400/30'
                          : isActive 
                            ? 'bg-sidebar-active text-white shadow-md' 
                            : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
                      }`}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${
                          isEmergency 
                            ? isActive ? 'text-white' : 'text-red-400'
                            : isActive ? 'text-white' : 'text-sidebar-text/70'
                        }`} />
                        <span className="font-medium">{item.title}</span>
                        {isEmergency && (
                          <span className="ml-auto text-xs font-bold">🚨</span>
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
          <SidebarGroupLabel className="text-sidebar-text/70 font-medium">
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
                      isActive={isActive}
                      tooltip={item.description}
                      className={`group transition-all duration-200 hover:bg-sidebar-hover ${
                        isActive 
                          ? 'bg-sidebar-active text-white shadow-md' 
                          : 'text-sidebar-text hover:text-white'
                      }`}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-sidebar-text/70'}`} />
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
          <SidebarGroupLabel className="text-sidebar-text/70 font-medium">
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
                      isActive={isActive}
                      tooltip={item.description}
                      className={`group transition-all duration-200 hover:bg-sidebar-hover ${
                        isActive 
                          ? 'bg-sidebar-active text-white shadow-md' 
                          : 'text-sidebar-text hover:text-white'
                      }`}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-sidebar-text/70'}`} />
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
      <SidebarFooter className="border-t border-healthcare-border px-2">
        <SidebarMenu>
          {/* Help */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Central de ajuda"
              className="text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-all duration-200"
            >
              <Link href="/help" className="flex items-center gap-3">
                <HelpCircle className="h-4 w-4 text-sidebar-text/70" />
                <span className="font-medium">Ajuda</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* User Profile */}
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-all duration-200 p-3"
              tooltip="Perfil do usuário"
            >
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-healthcare-primary text-white text-sm font-medium">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-sm font-medium text-sidebar-text truncate">
                    Dr. Admin
                  </span>
                  <span className="text-xs text-sidebar-text/60 truncate">
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
              tooltip="Sair do sistema"
              className="text-sidebar-text hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
            >
              <button className="flex items-center gap-3 w-full">
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