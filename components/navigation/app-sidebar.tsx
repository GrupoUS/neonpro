"use client";

import * as React from "react";
import {
  Activity,
  Calendar,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Settings,
  Users,
  UserPlus,
  Bell,
  BarChart3,
  Shield,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// Dados de navegação
const navigationData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Pacientes",
      url: "/dashboard/patients",
      icon: Users,
      items: [
        {
          title: "Lista de Pacientes",
          url: "/dashboard/patients",
        },
        {
          title: "Novo Paciente",
          url: "/dashboard/patients/new",
        },
        {
          title: "Histórico Médico",
          url: "/dashboard/patients/history",
        },
      ],
    },
    {
      title: "Agendamentos",
      url: "/dashboard/appointments",
      icon: Calendar,
      items: [
        {
          title: "Agenda",
          url: "/dashboard/appointments",
        },
        {
          title: "Nova Consulta",
          url: "/dashboard/appointments/new",
        },
        {
          title: "Consultas do Dia",
          url: "/dashboard/appointments/today",
        },
      ],
    },
    {
      title: "Financeiro",
      url: "/dashboard/financial",
      icon: CreditCard,
      items: [
        {
          title: "Receitas",
          url: "/dashboard/financial/revenue",
        },
        {
          title: "Pagamentos",
          url: "/dashboard/financial/payments",
        },
        {
          title: "Relatórios",
          url: "/dashboard/financial/reports",
        },
      ],
    },
    {
      title: "Prontuários",
      url: "/dashboard/records",
      icon: FileText,
      items: [
        {
          title: "Todos os Prontuários",
          url: "/dashboard/records",
        },
        {
          title: "Novo Prontuário",
          url: "/dashboard/records/new",
        },
        {
          title: "Modelos",
          url: "/dashboard/records/templates",
        },
      ],
    },
    {
      title: "Relatórios",
      url: "/dashboard/reports",
      icon: BarChart3,
      items: [
        {
          title: "Relatórios Gerais",
          url: "/dashboard/reports",
        },
        {
          title: "Análise de Dados",
          url: "/dashboard/reports/analytics",
        },
        {
          title: "Exportar Dados",
          url: "/dashboard/reports/export",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Notificações",
      url: "/dashboard/notifications",
      icon: Bell,
    },
    {
      title: "Configurações",
      url: "/dashboard/settings",
      icon: Settings,
    },
    {
      title: "Suporte",
      url: "/dashboard/support",
      icon: HelpCircle,
    },
  ],
  // Páginas de autenticação (para referência)
  authPages: [
    {
      title: "Login",
      url: "/login",
      icon: Shield,
    },
    {
      title: "Cadastro",
      url: "/signup",
      icon: UserPlus,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: any;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Activity className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">NeonPro</span>
                  <span className="truncate text-xs">Gestão Clínica</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Navegação Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Aplicação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationData.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === subItem.url}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navegação Secundária */}
        <SidebarGroup>
          <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationData.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={user?.user_metadata?.avatar_url}
                  alt={user?.user_metadata?.full_name || user?.email}
                />
                <AvatarFallback className="rounded-lg">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário"}
                </span>
                <span className="truncate text-xs">
                  {user?.email || "email@exemplo.com"}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action="/api/auth/signout" method="post" className="w-full">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
