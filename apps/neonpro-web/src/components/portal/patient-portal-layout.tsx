// Patient Portal Layout Component
// Story 1.3, Task 2: Main layout component for patient portal with responsive design
// Created: Mobile-first, accessible layout for healthcare patient portal

"use client";

import * as React from "react";
import type { PatientNavigation } from "./patient-navigation";
import type { PatientBreadcrumbs } from "./patient-breadcrumbs";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import type { cn } from "@/lib/utils";
import type { PatientProfile } from "@/app/lib/auth/patient-auth";

interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface PatientPortalLayoutProps {
  children: React.ReactNode;
  patient?: PatientProfile | null;
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  description?: string;
  className?: string;
}

// Account status configurations
const statusConfig = {
  active: {
    label: "Conta Ativa",
    variant: "default" as const,
    icon: CheckCircle,
    color: "text-green-600",
  },
  pending_verification: {
    label: "Verificação Pendente",
    variant: "secondary" as const,
    icon: Clock,
    color: "text-yellow-600",
  },
  suspended: {
    label: "Conta Suspensa",
    variant: "destructive" as const,
    icon: XCircle,
    color: "text-red-600",
  },
  inactive: {
    label: "Conta Inativa",
    variant: "outline" as const,
    icon: XCircle,
    color: "text-gray-600",
  },
};

export function PatientPortalLayout({
  children,
  patient,
  breadcrumbs,
  title,
  description,
  className,
}: PatientPortalLayoutProps) {
  const [isNavigationOpen, setIsNavigationOpen] = React.useState(false);
  const status = patient?.account_status || "active";
  const statusInfo = statusConfig[status];

  return (
    <div className="min-h-screen bg-background">
      {/* Account Status Alert */}
      {patient && status !== "active" && (
        <Alert className="rounded-none border-l-0 border-r-0 border-t-0">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {status === "pending_verification" && (
              <>
                Sua conta está pendente de verificação. Verifique seu email para ativar sua conta.
                <a href="/portal/verify" className="ml-2 underline hover:no-underline">
                  Reenviar verificação
                </a>
              </>
            )}
            {status === "suspended" && (
              <>
                Sua conta foi temporariamente suspensa. Entre em contato com a clínica para mais
                informações.
                <a href="/portal/contact" className="ml-2 underline hover:no-underline">
                  Entrar em contato
                </a>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Navigation Sidebar - Desktop & Mobile */}
        <PatientNavigation patient={patient} className="w-80 lg:w-72 xl:w-80" />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-background border-b px-4 py-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                {title && (
                  <div className="mb-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-semibold text-foreground truncate">{title}</h1>
                      {patient && (
                        <Badge
                          variant={statusInfo.variant}
                          className="flex items-center gap-1 text-xs"
                        >
                          <statusInfo.icon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      )}
                    </div>
                    {description && (
                      <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                  </div>
                )}

                {/* Breadcrumbs */}
                <PatientBreadcrumbs items={breadcrumbs} />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main
            className={cn("flex-1 overflow-y-auto p-4 lg:p-6", "focus:outline-none", className)}
          >
            {/* Skip to content link for accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md"
            >
              Pular para o conteúdo principal
            </a>

            <div id="main-content" tabIndex={-1} className="focus:outline-none">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
