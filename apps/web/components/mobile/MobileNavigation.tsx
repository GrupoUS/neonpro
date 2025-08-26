/**
 * Mobile Navigation Component
 * FASE 4: Frontend Components - Mobile First Design
 * Compliance: LGPD/ANVISA/CFM
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart3,
  Calendar,
  FileText,
  Home,
  Menu,
  MessageSquare,
  Settings,
  Shield,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  category: "main" | "dashboard" | "tools" | "settings";
  description?: string;
  compliance?: string[];
}

const navigationItems: NavigationItem[] = [
  // Main Navigation
  {
    label: "Início",
    href: "/",
    icon: Home,
    category: "main",
    description: "Página principal",
  },
  {
    label: "Consultas",
    href: "/appointments",
    icon: Calendar,
    category: "main",
    description: "Agendamentos e consultas",
    compliance: ["LGPD", "CFM"],
  },
  {
    label: "Pacientes",
    href: "/patients",
    icon: Users,
    category: "main",
    description: "Gestão de pacientes",
    compliance: ["LGPD", "ANVISA"],
  },
  {
    label: "Prontuários",
    href: "/records",
    icon: FileText,
    category: "main",
    description: "Registros médicos",
    compliance: ["LGPD", "ANVISA", "CFM"],
  },

  // Dashboard Navigation
  {
    label: "Dashboard Principal",
    href: "/dashboard",
    icon: BarChart3,
    category: "dashboard",
    description: "Visão geral do sistema",
  },
  {
    label: "Análise IA",
    href: "/dashboard/analytics",
    icon: Activity,
    category: "dashboard",
    description: "Insights inteligentes",
    badge: "IA",
  },
  {
    label: "Monitoramento",
    href: "/dashboard/health",
    icon: Stethoscope,
    category: "dashboard",
    description: "Status do sistema",
  },
  {
    label: "Conformidade",
    href: "/dashboard/compliance",
    icon: Shield,
    category: "dashboard",
    description: "LGPD/ANVISA/CFM",
    compliance: ["LGPD", "ANVISA", "CFM"],
  },

  // Tools
  {
    label: "Mensagens",
    href: "/messages",
    icon: MessageSquare,
    category: "tools",
    description: "Comunicação segura",
    badge: "3",
    compliance: ["LGPD"],
  },
  {
    label: "Telemedicina",
    href: "/telemedicine",
    icon: Stethoscope,
    category: "tools",
    description: "Consultas remotas",
    compliance: ["CFM", "LGPD"],
  },

  // Settings
  {
    label: "Perfil",
    href: "/profile",
    icon: User,
    category: "settings",
    description: "Configurações do usuário",
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: Settings,
    category: "settings",
    description: "Configurações do sistema",
  },
];

interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close navigation when route changes
  useEffect(() => {
    setIsOpen(false);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const groupedItems = navigationItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, NavigationItem[]>,
  );

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "main": {
        return "Principal";
      }
      case "dashboard": {
        return "Dashboards";
      }
      case "tools": {
        return "Ferramentas";
      }
      case "settings": {
        return "Configurações";
      }
      default: {
        return category;
      }
    }
  };

  return (
    <div className={cn("md:hidden", className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-80 px-0">
          <SheetHeader className="px-6 pb-4">
            <SheetTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-primary-foreground" />
              </div>
              NeonPro Healthcare
            </SheetTitle>
            <SheetDescription>
              Sistema de gestão médica inteligente
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col h-full">
            <nav className="flex-1 px-6 pb-4">
              <div className="space-y-6">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      {getCategoryTitle(category)}
                    </h3>
                    <div className="space-y-1">
                      {items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="truncate">{item.label}</span>
                                {item.badge && (
                                  <Badge
                                    variant={
                                      item.badge === "IA"
                                        ? "secondary"
                                        : "default"
                                    }
                                    className="ml-2 text-xs"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </nav>

            {/* Footer */}
            <div className="border-t px-6 py-4">
              <div className="text-xs text-muted-foreground">
                <p className="mb-1">
                  <strong>Compliance:</strong> LGPD, ANVISA, CFM
                </p>
                <p>© 2024 NeonPro Healthcare</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Quick Access Bottom Navigation for Mobile
export function MobileBottomNavigation() {
  const pathname = usePathname();

  const quickItems = [
    {
      label: "Início",
      href: "/",
      icon: Home,
    },
    {
      label: "Consultas",
      href: "/appointments",
      icon: Calendar,
    },
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
    },
    {
      label: "Mensagens",
      href: "/messages",
      icon: MessageSquare,
      badge: "3",
    },
    {
      label: "Menu",
      href: "#",
      icon: Menu,
      action: true,
    },
  ];

  const isActive = (href: string) => {
    if (href === "#") {
      return false;
    }
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <nav className="flex items-center justify-around py-2">
        {quickItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.action) {
            return (
              <div key={item.label} className="flex flex-col items-center">
                <MobileNavigation />
                <span className="text-xs text-muted-foreground mt-1">
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
