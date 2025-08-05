/**
 * NeonPro - Clinical Navigation Enhanced (FASE 2)
 * Sistema de navegação otimizado para fluxos clínicos
 *
 * Melhorias Fase 2:
 * - Navegação contextual baseada no papel do usuário
 * - Atalhos de teclado para ações frequentes
 * - Indicadores visuais de status e alertas
 * - Breadcrumbs inteligentes para contexto médico
 * - Busca rápida de pacientes integrada
 * - Performance otimizada para uso intensivo
 */

"use client";

import type {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Home,
  Keyboard,
  LogOut,
  Menu,
  Phone,
  Plus,
  Search,
  Settings,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import type { usePathname, useRouter } from "next/navigation";
import type { useEffect, useMemo, useState } from "react";
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
import type { Input } from "@/components/ui/input";
import type { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { useAccessibility } from "@/contexts/accessibility-context";
import type { cn } from "@/lib/utils";

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  shortcut?: string;
  roles: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "doctor" | "coordinator" | "admin";
  avatar?: string;
}

interface Alert {
  id: string;
  type: "urgent" | "warning" | "info";
  message: string;
  count: number;
}

interface ClinicalNavigationProps {
  user: User;
  alerts?: Alert[];
  className?: string;
}

export function ClinicalNavigationEnhanced({
  user,
  alerts = [],
  className,
}: ClinicalNavigationProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { announceToScreenReader } = useAccessibility();

  // Items de navegação baseados no papel do usuário
  const navigationItems: NavigationItem[] = useMemo(
    () =>
      [
        {
          id: "dashboard",
          label: "Dashboard",
          href: "/dashboard",
          icon: Home,
          shortcut: "Alt+D",
          roles: ["doctor", "coordinator", "admin"],
        },
        {
          id: "agenda",
          label: "Agenda",
          href: "/agenda",
          icon: Calendar,
          badge: 5, // Número de conflitos/pendências
          shortcut: "Alt+A",
          roles: ["doctor", "coordinator"],
        },
        {
          id: "pacientes",
          label: "Pacientes",
          href: "/pacientes",
          icon: Users,
          shortcut: "Alt+P",
          roles: ["doctor", "coordinator", "admin"],
        },
        {
          id: "consultas",
          label: "Consultas",
          href: "/consultas",
          icon: Stethoscope,
          badge: 3, // Consultas pendentes
          shortcut: "Alt+C",
          roles: ["doctor"],
        },
        {
          id: "financeiro",
          label: "Financeiro",
          href: "/financeiro",
          icon: BarChart3,
          shortcut: "Alt+F",
          roles: ["doctor", "admin"],
        },
        {
          id: "relatorios",
          label: "Relatórios",
          href: "/relatorios",
          icon: FileText,
          shortcut: "Alt+R",
          roles: ["doctor", "admin"],
        },
        {
          id: "configuracoes",
          label: "Configurações",
          href: "/configuracoes",
          icon: Settings,
          roles: ["admin"],
        },
      ].filter((item) => item.roles.includes(user.role)),
    [user.role],
  );

  // Ações rápidas baseadas no papel
  const quickActions = useMemo(() => {
    const actions = [];

    if (user.role === "doctor" || user.role === "coordinator") {
      actions.push(
        { id: "novo-paciente", label: "Novo Paciente", icon: Plus, shortcut: "Ctrl+N" },
        { id: "agendar", label: "Agendar Consulta", icon: Calendar, shortcut: "Ctrl+A" },
      );
    }

    if (user.role === "coordinator") {
      actions.push({
        id: "ligar-paciente",
        label: "Ligar para Paciente",
        icon: Phone,
        shortcut: "Ctrl+L",
      });
    }

    return actions;
  }, [user.role]);

  // Contador total de alertas
  const totalAlerts = alerts.reduce((sum, alert) => sum + alert.count, 0);

  // Breadcrumbs inteligentes
  const breadcrumbs = useMemo(() => {
    const paths = pathname.split("/").filter(Boolean);
    const crumbs = [{ label: "Início", href: "/dashboard" }];

    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const item = navigationItems.find((item) => item.href === currentPath);
      if (item) {
        crumbs.push({ label: item.label, href: currentPath });
      } else {
        // Fallback para paths não mapeados
        crumbs.push({
          label: path.charAt(0).toUpperCase() + path.slice(1),
          href: currentPath,
        });
      }
    });

    return crumbs;
  }, [pathname, navigationItems]);

  // Atalhos de teclado globais
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Busca rápida (Ctrl+K ou Cmd+K)
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
        announceToScreenReader("Busca rápida ativada", "assertive");
        return;
      }

      // Mostrar atalhos (Ctrl+?)
      if ((event.ctrlKey || event.metaKey) && event.key === "/") {
        event.preventDefault();
        setShowShortcuts(!showShortcuts);
        return;
      }

      // Navegação por atalhos Alt+
      if (event.altKey) {
        const item = navigationItems.find((item) =>
          item.shortcut?.toLowerCase().includes(event.key.toLowerCase()),
        );
        if (item) {
          event.preventDefault();
          router.push(item.href);
          announceToScreenReader(`Navegando para ${item.label}`, "assertive");
          return;
        }
      }

      // Ações rápidas Ctrl+
      if (event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case "n":
            if (user.role === "doctor" || user.role === "coordinator") {
              event.preventDefault();
              router.push("/pacientes/novo");
              announceToScreenReader("Abrindo formulário de novo paciente", "assertive");
            }
            break;
          case "a":
            if (user.role === "doctor" || user.role === "coordinator") {
              event.preventDefault();
              router.push("/agenda/novo");
              announceToScreenReader("Abrindo agendamento de consulta", "assertive");
            }
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigationItems, router, user.role, showShortcuts, announceToScreenReader]);

  // Busca de pacientes
  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/pacientes?busca=${encodeURIComponent(query)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      announceToScreenReader(`Buscando por ${query}`, "assertive");
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "urgent":
        return "destructive";
      case "warning":
        return "secondary";
      case "info":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div
      className={cn(
        "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="flex h-16 items-center px-4">
        {/* Logo / Brand */}
        <div className="flex items-center space-x-4">
          <div className="font-bold text-xl">NeonPro</div>

          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                  <h2 className="mb-2 px-4 text-lg font-semibold">Navegação</h2>
                  <div className="space-y-1">
                    {navigationItems.map((item) => (
                      <Button
                        key={item.id}
                        variant={pathname === item.href ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push(item.href)}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Breadcrumbs - Desktop */}
        <div className="hidden md:flex items-center space-x-2 ml-6">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center space-x-2">
              {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <button
                onClick={() => router.push(crumb.href)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </button>
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente... (Ctrl+K)"
              className="w-64 pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(searchQuery);
                }
              }}
            />
          </div>

          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Plus className="h-5 w-5" />
                <span className="sr-only">Ações rápidas</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações Rápidas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {quickActions.map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => {
                    // Implementar ação
                    announceToScreenReader(`Executando ${action.label}`, "assertive");
                  }}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                  {action.shortcut && (
                    <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                      {action.shortcut}
                    </kbd>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Alerts */}
          {totalAlerts > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {totalAlerts}
                  </Badge>
                  <span className="sr-only">
                    {totalAlerts} alerta{totalAlerts > 1 ? "s" : ""}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Alertas Ativos</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {alerts.map((alert) => (
                  <DropdownMenuItem key={alert.id} className="flex items-start space-x-2 p-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      {alert.count > 1 && (
                        <Badge variant={getAlertVariant(alert.type)} className="mt-1">
                          {alert.count} ocorrências
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Keyboard shortcuts help */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowShortcuts(!showShortcuts)}
            title="Atalhos de teclado (Ctrl+/)"
          >
            <Keyboard className="h-5 w-5" />
            <span className="sr-only">Atalhos de teclado</span>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <Badge variant="outline" className="w-fit text-xs">
                    {user.role === "doctor"
                      ? "Médico"
                      : user.role === "coordinator"
                        ? "Coordenador"
                        : "Administrador"}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Keyboard shortcuts overlay */}
      {showShortcuts && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Atalhos de Teclado</h3>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Navegação:</strong>
              </div>
              {navigationItems
                .filter((item) => item.shortcut)
                .map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">{item.shortcut}</kbd>
                  </div>
                ))}

              <div className="text-sm mt-4">
                <strong>Ações:</strong>
              </div>
              <div className="flex justify-between text-sm">
                <span>Busca rápida</span>
                <kbd className="bg-muted px-2 py-1 rounded text-xs">Ctrl+K</kbd>
              </div>
              {quickActions.map((action) => (
                <div key={action.id} className="flex justify-between text-sm">
                  <span>{action.label}</span>
                  <kbd className="bg-muted px-2 py-1 rounded text-xs">{action.shortcut}</kbd>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => setShowShortcuts(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
