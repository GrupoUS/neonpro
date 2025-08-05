"use client";

import type {
  Activity,
  BarChart3,
  Bell,
  Brain,
  Calendar,
  ChevronDown,
  FileText,
  Home,
  LogOut,
  Menu,
  Package,
  Settings,
  Shield,
  Stethoscope,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import type { usePathname } from "next/navigation";
import type { useState } from "react";

import type { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentUser?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    badge: null,
  },
  {
    title: "Pacientes",
    href: "/patients",
    icon: Users,
    badge: null,
  },
  {
    title: "Agendamentos",
    href: "/appointments",
    icon: Calendar,
    badge: "3",
  },
  {
    title: "Prontuários",
    href: "/medical-records",
    icon: FileText,
    badge: null,
  },
  {
    title: "Procedimentos",
    href: "/procedures",
    icon: Stethoscope,
    badge: null,
  },
  {
    title: "Inventário",
    href: "/inventory",
    icon: Package,
    badge: null,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    badge: null,
  },
  {
    title: "Dashboard Negócios",
    href: "/dashboard/business-dashboard",
    icon: Activity,
    badge: "NEW",
  },
  {
    title: "Análise Preditiva",
    href: "/dashboard/predictive-analytics",
    icon: Brain,
    badge: "NEW",
  },
  {
    title: "Taxa de Sucesso",
    href: "/dashboard/treatment-success",
    icon: TrendingUp,
    badge: "NEW",
  },
  {
    title: "LGPD",
    href: "/lgpd",
    icon: Shield,
    badge: "NEW",
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
    badge: null,
  },
];

export function DashboardLayout({ children, currentUser }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const defaultUser = {
    name: "Dr. Maria Silva",
    email: "dra.maria@neonpro.com.br",
    role: "Dermatologista",
    avatar: "",
  };

  const user = currentUser || defaultUser;

  return (
    <div className="clinic-layout">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static
      `}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">NeonPro</h1>
                <p className="text-xs text-muted-foreground">Clínica Estética</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge
                      variant={item.badge === "NEW" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.role}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {navigationItems.find((item) => item.href === pathname)?.title || "Dashboard"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Bem-vinda, {user.name.split(" ")[1] || user.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-xs text-destructive-foreground font-bold">2</span>
              </span>
            </Button>

            {/* Quick Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Ações Rápidas
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Users className="w-4 h-4 mr-2" />
                  Novo Paciente
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="w-4 h-4 mr-2" />
                  Novo Prontuário
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="clinic-main">{children}</main>
      </div>
    </div>
  );
}
