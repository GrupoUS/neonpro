// Patient Portal Navigation Component
// Story 1.3, Task 2: Patient portal layout and navigation with mobile-first design
// Created: Healthcare-optimized navigation for patient portal
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientNavigation = PatientNavigation;
var React = require("react");
var link_1 = require("next/link");
var navigation_1 = require("next/navigation");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var button_1 = require("@/components/ui/button");
var sheet_1 = require("@/components/ui/sheet");
var navigationItems = [
    {
        title: "Início",
        href: "/portal",
        icon: lucide_react_1.Home,
        description: "Visão geral da sua conta"
    },
    {
        title: "Agendamentos",
        href: "/portal/appointments",
        icon: lucide_react_1.Calendar,
        description: "Agende e gerencie suas consultas"
    },
    {
        title: "Histórico",
        href: "/portal/history",
        icon: lucide_react_1.History,
        description: "Histórico de consultas e tratamentos"
    },
    {
        title: "Pagamentos",
        href: "/portal/payments",
        icon: lucide_react_1.CreditCard,
        description: "Faturas e formas de pagamento"
    },
    {
        title: "Perfil",
        href: "/portal/profile",
        icon: lucide_react_1.User,
        description: "Dados pessoais e preferências"
    },
    {
        title: "Contato",
        href: "/portal/contact",
        icon: lucide_react_1.Phone,
        description: "Entre em contato com a clínica"
    }
];
function PatientNavigation(_a) {
    var patient = _a.patient, className = _a.className;
    var pathname = (0, navigation_1.usePathname)();
    var _b = React.useState(false), isOpen = _b[0], setIsOpen = _b[1];
    var NavContent = function () { return (<nav className="flex flex-col space-y-2">
      {navigationItems.map(function (item) {
            var isActive = pathname === item.href || pathname.startsWith("".concat(item.href, "/"));
            var Icon = item.icon;
            return (<link_1.default key={item.href} href={item.href} onClick={function () { return setIsOpen(false); }} className={(0, utils_1.cn)("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all", "hover:bg-accent hover:text-accent-foreground", "focus:bg-accent focus:text-accent-foreground focus:outline-none", "active:bg-accent/80", isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground")} aria-current={isActive ? "page" : undefined}>
            <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true"/>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{item.title}</div>
              <div className="text-xs opacity-70 truncate hidden sm:block">
                {item.description}
              </div>
            </div>
            {item.badge && (<span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {item.badge}
              </span>)}
          </link_1.default>);
        })}
    </nav>); };
    return (<>
      {/* Mobile Navigation Trigger */}
      <div className="flex items-center justify-between p-4 border-b lg:hidden">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <lucide_react_1.User className="h-4 w-4 text-primary"/>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {(patient === null || patient === void 0 ? void 0 : patient.full_name) || "Paciente"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Portal do Paciente
            </p>
          </div>
        </div>
        <sheet_1.Sheet open={isOpen} onOpenChange={setIsOpen}>
          <sheet_1.SheetTrigger asChild>
            <button_1.Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu de navegação">
              <lucide_react_1.Menu className="h-5 w-5"/>
            </button_1.Button>
          </sheet_1.SheetTrigger>
          <sheet_1.SheetContent side="left" className="w-80 p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <lucide_react_1.User className="h-4 w-4 text-primary"/>
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate">
                      {(patient === null || patient === void 0 ? void 0 : patient.full_name) || "Paciente"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Portal do Paciente
                    </p>
                  </div>
                </div>
                <button_1.Button variant="ghost" size="icon" onClick={function () { return setIsOpen(false); }} aria-label="Fechar menu">
                  <lucide_react_1.X className="h-5 w-5"/>
                </button_1.Button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-4">
                <NavContent />
              </div>

              {/* Footer */}
              <div className="border-t p-4">
                <button_1.Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={function () {
            // Handle logout
            window.location.href = "/portal/login";
        }}>
                  <lucide_react_1.LogOut className="h-4 w-4 mr-2"/>
                  Sair
                </button_1.Button>
              </div>
            </div>
          </sheet_1.SheetContent>
        </sheet_1.Sheet>
      </div>

      {/* Desktop Navigation Sidebar */}
      <div className={(0, utils_1.cn)("hidden lg:flex flex-col border-r bg-background", className)}>
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <lucide_react_1.User className="h-5 w-5 text-primary"/>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold truncate">
                {(patient === null || patient === void 0 ? void 0 : patient.full_name) || "Paciente"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Portal do Paciente
              </p>
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
              Status: {(patient === null || patient === void 0 ? void 0 : patient.account_status) === 'active' ? 'Ativo' : 'Pendente'}
            </div>
            <button_1.Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={function () {
            // Handle logout
            window.location.href = "/portal/login";
        }}>
              <lucide_react_1.LogOut className="h-4 w-4 mr-2"/>
              Sair
            </button_1.Button>
          </div>
        </div>
      </div>
    </>);
}
