"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  CreditCard,
  FileText,
  Home,
  Settings,
  Users,
  Activity,
  Bell,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Visão geral e métricas principais",
  },
  {
    title: "Pacientes",
    href: "/dashboard/patients",
    icon: Users,
    description: "Gestão de pacientes",
  },
  {
    title: "Agendamentos",
    href: "/dashboard/appointments",
    icon: Calendar,
    description: "Agenda e consultas",
  },
  {
    title: "Financeiro",
    href: "/dashboard/financial",
    icon: CreditCard,
    description: "Controle financeiro",
  },
  {
    title: "Relatórios",
    href: "/dashboard/reports",
    icon: BarChart3,
    description: "Relatórios e análises",
  },
  {
    title: "Prontuários",
    href: "/dashboard/records",
    icon: FileText,
    description: "Prontuários médicos",
  },
];

const secondaryItems = [
  {
    title: "Atividades",
    href: "/dashboard/activities",
    icon: Activity,
    description: "Log de atividades",
  },
  {
    title: "Notificações",
    href: "/dashboard/notifications",
    icon: Bell,
    description: "Central de notificações",
  },
  {
    title: "Configurações",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Configurações do sistema",
  },
];

export function DashboardSidebar({ open, onOpenChange, user }: DashboardSidebarProps) {
  const pathname = usePathname();

  const NavItem = ({ item }: { item: typeof navigationItems[0] }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
          isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        )}
        onClick={() => onOpenChange(false)}
      >
        <Icon className="h-4 w-4" />
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  NeonPro
                </span>
                <span className="text-xs text-muted-foreground">
                  Gestão Clínica
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <div className="text-xs font-semibold leading-6 text-muted-foreground">
                  PRINCIPAL
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {navigationItems.map((item) => (
                    <li key={item.title}>
                      <NavItem item={item} />
                    </li>
                  ))}
                </ul>
              </li>
              
              <li>
                <div className="text-xs font-semibold leading-6 text-muted-foreground">
                  FERRAMENTAS
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {secondaryItems.map((item) => (
                    <li key={item.title}>
                      <NavItem item={item} />
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>

          {/* User Profile */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <form action="/api/auth/signout" method="post" className="mt-2">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 z-50 flex w-64 flex-col transition-transform duration-300 ease-in-out lg:hidden",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
          {/* Same content as desktop sidebar */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  NeonPro
                </span>
                <span className="text-xs text-muted-foreground">
                  Gestão Clínica
                </span>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <div className="text-xs font-semibold leading-6 text-muted-foreground">
                  PRINCIPAL
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {navigationItems.map((item) => (
                    <li key={item.title}>
                      <NavItem item={item} />
                    </li>
                  ))}
                </ul>
              </li>
              
              <li>
                <div className="text-xs font-semibold leading-6 text-muted-foreground">
                  FERRAMENTAS
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {secondaryItems.map((item) => (
                    <li key={item.title}>
                      <NavItem item={item} />
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>

          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <form action="/api/auth/signout" method="post" className="mt-2">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
