// Patient Portal Navigation Component
// Story 1.3, Task 2: Patient portal layout and navigation with mobile-first design
// Created: Healthcare-optimized navigation for patient portal

"use client";

import * as React from "react";
import Link from "next/link";
import type { usePathname } from "next/navigation";
import type {
  Calendar,
  User,
  History,
  CreditCard,
  Home,
  Phone,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { cn } from "@/lib/utils";
import type { Button } from "@/components/ui/button";
import type { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { PatientProfile } from "@/app/lib/auth/patient-auth";

interface PatientNavigationProps {
  patient?: PatientProfile | null;
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: number;
}

const navigationItems: NavItem[] = [
  {
    title: "Início",
    href: "/portal",
    icon: Home,
    description: "Visão geral da sua conta",
  },
  {
    title: "Agendamentos",
    href: "/portal/appointments",
    icon: Calendar,
    description: "Agende e gerencie suas consultas",
  },
  {
    title: "Histórico",
    href: "/portal/history",
    icon: History,
    description: "Histórico de consultas e tratamentos",
  },
  {
    title: "Pagamentos",
    href: "/portal/payments",
    icon: CreditCard,
    description: "Faturas e formas de pagamento",
  },
  {
    title: "Perfil",
    href: "/portal/profile",
    icon: User,
    description: "Dados pessoais e preferências",
  },
  {
    title: "Contato",
    href: "/portal/contact",
    icon: Phone,
    description: "Entre em contato com a clínica",
  },
];

export function PatientNavigation({ patient, className }: PatientNavigationProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const NavContent = () => (
    <nav className="flex flex-col space-y-2">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground focus:outline-none",
              "active:bg-accent/80",
              isActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{item.title}</div>
              <div className="text-xs opacity-70 truncate hidden sm:block">{item.description}</div>
            </div>
            {item.badge && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Navigation Trigger */}
      <div className="flex items-center justify-between p-4 border-b lg:hidden">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{patient?.full_name || "Paciente"}</p>
            <p className="text-xs text-muted-foreground truncate">Portal do Paciente</p>
          </div>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate">
                      {patient?.full_name || "Paciente"}
                    </p>
                    <p className="text-xs text-muted-foreground">Portal do Paciente</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fechar menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-4">
                <NavContent />
              </div>

              {/* Footer */}
              <div className="border-t p-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    // Handle logout
                    window.location.href = "/portal/login";
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation Sidebar */}
      <div className={cn("hidden lg:flex flex-col border-r bg-background", className)}>
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold truncate">{patient?.full_name || "Paciente"}</h2>
              <p className="text-sm text-muted-foreground">Portal do Paciente</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-6">
          <NavContent />
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Status: {patient?.account_status === "active" ? "Ativo" : "Pendente"}
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => {
                // Handle logout
                window.location.href = "/portal/login";
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
