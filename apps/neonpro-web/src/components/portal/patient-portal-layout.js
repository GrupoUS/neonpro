// Patient Portal Layout Component
// Story 1.3, Task 2: Main layout component for patient portal with responsive design
// Created: Mobile-first, accessible layout for healthcare patient portal
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientPortalLayout = PatientPortalLayout;
var React = require("react");
var patient_navigation_1 = require("./patient-navigation");
var patient_breadcrumbs_1 = require("./patient-breadcrumbs");
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
// Account status configurations
var statusConfig = {
  active: {
    label: "Conta Ativa",
    variant: "default",
    icon: lucide_react_1.CheckCircle,
    color: "text-green-600",
  },
  pending_verification: {
    label: "Verificação Pendente",
    variant: "secondary",
    icon: lucide_react_1.Clock,
    color: "text-yellow-600",
  },
  suspended: {
    label: "Conta Suspensa",
    variant: "destructive",
    icon: lucide_react_1.XCircle,
    color: "text-red-600",
  },
  inactive: {
    label: "Conta Inativa",
    variant: "outline",
    icon: lucide_react_1.XCircle,
    color: "text-gray-600",
  },
};
function PatientPortalLayout(_a) {
  var children = _a.children,
    patient = _a.patient,
    breadcrumbs = _a.breadcrumbs,
    title = _a.title,
    description = _a.description,
    className = _a.className;
  var _b = React.useState(false),
    isNavigationOpen = _b[0],
    setIsNavigationOpen = _b[1];
  var status =
    (patient === null || patient === void 0 ? void 0 : patient.account_status) || "active";
  var statusInfo = statusConfig[status];
  return (
    <div className="min-h-screen bg-background">
      {/* Account Status Alert */}
      {patient && status !== "active" && (
        <alert_1.Alert className="rounded-none border-l-0 border-r-0 border-t-0">
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription>
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
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Navigation Sidebar - Desktop & Mobile */}
        <patient_navigation_1.PatientNavigation
          patient={patient}
          className="w-80 lg:w-72 xl:w-80"
        />

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
                        <badge_1.Badge
                          variant={statusInfo.variant}
                          className="flex items-center gap-1 text-xs"
                        >
                          <statusInfo.icon className="h-3 w-3" />
                          {statusInfo.label}
                        </badge_1.Badge>
                      )}
                    </div>
                    {description && (
                      <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                  </div>
                )}

                {/* Breadcrumbs */}
                <patient_breadcrumbs_1.PatientBreadcrumbs items={breadcrumbs} />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main
            className={(0, utils_1.cn)(
              "flex-1 overflow-y-auto p-4 lg:p-6",
              "focus:outline-none",
              className,
            )}
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
