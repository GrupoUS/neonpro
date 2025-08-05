"use client";
var __rest =
  (this && this.__rest) ||
  ((s, e) => {
    var t = {};
    for (var p in s) if (Object.hasOwn(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppSidebar = AppSidebar;
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
var navigation_1 = require("next/navigation");
var React = require("react");
var avatar_1 = require("@/components/ui/avatar");
var button_1 = require("@/components/ui/button");
var sidebar_1 = require("@/components/ui/sidebar");
// Dados de navegação
var navigationData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: lucide_react_1.Home,
      isActive: true,
    },
    {
      title: "Pacientes",
      url: "/dashboard/patients",
      icon: lucide_react_1.Users,
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
      icon: lucide_react_1.Calendar,
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
      title: "Faturamento",
      url: "/dashboard/billing",
      icon: lucide_react_1.CreditCard,
      items: [
        {
          title: "Visão Geral",
          url: "/dashboard/billing",
        },
        {
          title: "Serviços",
          url: "/dashboard/billing?tab=services",
        },
        {
          title: "Faturas",
          url: "/dashboard/billing?tab=invoices",
        },
        {
          title: "Pagamentos",
          url: "/dashboard/billing?tab=payments",
        },
      ],
    },
    {
      title: "Financeiro",
      url: "/dashboard/financial",
      icon: lucide_react_1.BarChart3,
      items: [
        {
          title: "KPI Dashboard",
          url: "/dashboard/financial/kpi",
        },
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
        {
          title: "Sistema Fiscal BR",
          url: "/dashboard/financial/tax",
        },
      ],
    },
    {
      title: "Contas a Pagar",
      url: "/dashboard/accounts-payable",
      icon: lucide_react_1.CreditCard,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/accounts-payable",
        },
        {
          title: "Fornecedores",
          url: "/dashboard/suppliers",
        },
        {
          title: "Contas a Pagar",
          url: "/dashboard/accounts-payable/payables",
        },
        {
          title: "Analytics",
          url: "/dashboard/accounts-payable/analytics",
        },
        {
          title: "Relatórios Financeiros",
          url: "/dashboard/accounts-payable/reports",
        },
        {
          title: "Pagamentos",
          url: "/dashboard/accounts-payable/payments",
        },
        {
          title: "Aprovações",
          url: "/dashboard/accounts-payable/approvals",
        },
        {
          title: "Notificações",
          url: "/dashboard/accounts-payable/notifications",
        },
      ],
    },
    {
      title: "Prontuários",
      url: "/dashboard/records",
      icon: lucide_react_1.FileText,
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
      title: "Assistente Virtual",
      url: "/dashboard/assistant",
      icon: lucide_react_1.Bot,
    },
    {
      title: "Retenção de Pacientes",
      url: "/dashboard/patient-retention",
      icon: lucide_react_1.Activity,
      items: [
        {
          title: "Analytics de Retenção",
          url: "/dashboard/patient-retention",
        },
        {
          title: "Predições de Churn",
          url: "/dashboard/patient-retention?tab=predictions",
        },
        {
          title: "Intervenções",
          url: "/dashboard/patient-retention?tab=interventions",
        },
        {
          title: "Insights IA",
          url: "/dashboard/patient-retention?tab=insights",
        },
      ],
    },
    {
      title: "Relatórios",
      url: "/dashboard/reports",
      icon: lucide_react_1.BarChart3,
      items: [
        {
          title: "Relatórios Gerais",
          url: "/dashboard/reports",
        },
        {
          title: "Análise de Dados",
          url: "/dashboard/analytics",
        },
        {
          title: "Exportar Dados",
          url: "/dashboard/reports/export",
        },
      ],
    },
    {
      title: "Risk Assessment",
      url: "/dashboard/risk-assessment",
      icon: lucide_react_1.AlertTriangle,
      items: [
        {
          title: "Análise de Riscos",
          url: "/dashboard/risk-assessment",
        },
        {
          title: "Validações",
          url: "/dashboard/risk-assessment?tab=validations",
        },
        {
          title: "Alertas",
          url: "/dashboard/risk-assessment?tab=alerts",
        },
        {
          title: "Configurações",
          url: "/dashboard/risk-assessment?tab=settings",
        },
      ],
    },
    {
      title: "Base de Conhecimento Médico",
      url: "/dashboard/medical-knowledge",
      icon: lucide_react_1.BookOpen,
      items: [
        {
          title: "Visão Geral",
          url: "/dashboard/medical-knowledge",
        },
        {
          title: "Medicamentos",
          url: "/dashboard/medical-knowledge?tab=drugs",
        },
        {
          title: "Interações",
          url: "/dashboard/medical-knowledge?tab=interactions",
        },
        {
          title: "Validação de Evidências",
          url: "/dashboard/medical-knowledge?tab=validation",
        },
      ],
    },
    {
      title: "Análise Antes/Depois",
      url: "/dashboard/automated-analysis",
      icon: lucide_react_1.Camera,
      items: [
        {
          title: "Visão Geral",
          url: "/dashboard/automated-analysis",
        },
        {
          title: "Sessões de Análise",
          url: "/dashboard/automated-analysis?tab=sessions",
        },
        {
          title: "Processamento",
          url: "/dashboard/automated-analysis?tab=analysis",
        },
        {
          title: "Relatórios",
          url: "/dashboard/automated-analysis?tab=reports",
        },
        {
          title: "Qualidade",
          url: "/dashboard/automated-analysis?tab=quality",
        },
      ],
    },
    {
      title: "Acompanhamento de Progresso",
      url: "/dashboard/progress-tracking",
      icon: lucide_react_1.TrendingUp,
      items: [
        {
          title: "Visão Geral",
          url: "/dashboard/progress-tracking",
        },
        {
          title: "Sessões de Acompanhamento",
          url: "/dashboard/progress-tracking?tab=tracking",
        },
        {
          title: "Marcos de Progresso",
          url: "/dashboard/progress-tracking?tab=milestones",
        },
        {
          title: "Alertas",
          url: "/dashboard/progress-tracking?tab=alerts",
        },
        {
          title: "Análises Avançadas",
          url: "/dashboard/progress-tracking?tab=analytics",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Notificações",
      url: "/dashboard/notifications",
      icon: lucide_react_1.Bell,
    },
    {
      title: "Configurações",
      url: "/dashboard/settings",
      icon: lucide_react_1.Settings,
    },
    {
      title: "Suporte",
      url: "/dashboard/support",
      icon: lucide_react_1.HelpCircle,
    },
  ],
  // Páginas de autenticação (para referência)
  authPages: [
    {
      title: "Login",
      url: "/login",
      icon: lucide_react_1.Shield,
    },
    {
      title: "Cadastro",
      url: "/signup",
      icon: lucide_react_1.UserPlus,
    },
  ],
};
function AppSidebar(_a) {
  var _b, _c, _d, _e, _f;
  var user = _a.user,
    props = __rest(_a, ["user"]);
  var pathname = (0, navigation_1.usePathname)();
  return (
    <sidebar_1.Sidebar variant="inset" {...props}>
      <sidebar_1.SidebarHeader>
        <sidebar_1.SidebarMenu>
          <sidebar_1.SidebarMenuItem>
            <sidebar_1.SidebarMenuButton size="lg" asChild>
              <link_1.default href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <lucide_react_1.Activity className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">NeonPro</span>
                  <span className="truncate text-xs">Gestão Clínica</span>
                </div>
              </link_1.default>
            </sidebar_1.SidebarMenuButton>
          </sidebar_1.SidebarMenuItem>
        </sidebar_1.SidebarMenu>
      </sidebar_1.SidebarHeader>

      <sidebar_1.SidebarContent>
        {/* Navegação Principal */}
        <sidebar_1.SidebarGroup>
          <sidebar_1.SidebarGroupLabel>Aplicação</sidebar_1.SidebarGroupLabel>
          <sidebar_1.SidebarGroupContent>
            <sidebar_1.SidebarMenu>
              {navigationData.navMain.map((item) => {
                var _a;
                return (
                  <sidebar_1.SidebarMenuItem key={item.title}>
                    <sidebar_1.SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <link_1.default href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </link_1.default>
                    </sidebar_1.SidebarMenuButton>
                    {((_a = item.items) === null || _a === void 0 ? void 0 : _a.length)
                      ? <sidebar_1.SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <sidebar_1.SidebarMenuSubItem key={subItem.title}>
                              <sidebar_1.SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <link_1.default href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </link_1.default>
                              </sidebar_1.SidebarMenuSubButton>
                            </sidebar_1.SidebarMenuSubItem>
                          ))}
                        </sidebar_1.SidebarMenuSub>
                      : null}
                  </sidebar_1.SidebarMenuItem>
                );
              })}
            </sidebar_1.SidebarMenu>
          </sidebar_1.SidebarGroupContent>
        </sidebar_1.SidebarGroup>

        {/* Navegação Secundária */}
        <sidebar_1.SidebarGroup>
          <sidebar_1.SidebarGroupLabel>Ferramentas</sidebar_1.SidebarGroupLabel>
          <sidebar_1.SidebarGroupContent>
            <sidebar_1.SidebarMenu>
              {navigationData.navSecondary.map((item) => (
                <sidebar_1.SidebarMenuItem key={item.title}>
                  <sidebar_1.SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <link_1.default href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </link_1.default>
                  </sidebar_1.SidebarMenuButton>
                </sidebar_1.SidebarMenuItem>
              ))}
            </sidebar_1.SidebarMenu>
          </sidebar_1.SidebarGroupContent>
        </sidebar_1.SidebarGroup>
      </sidebar_1.SidebarContent>

      <sidebar_1.SidebarFooter>
        <sidebar_1.SidebarMenu>
          <sidebar_1.SidebarMenuItem>
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <avatar_1.Avatar className="h-8 w-8 rounded-lg">
                <avatar_1.AvatarImage
                  src={
                    (_b = user === null || user === void 0 ? void 0 : user.user_metadata) ===
                      null || _b === void 0
                      ? void 0
                      : _b.avatar_url
                  }
                  alt={
                    ((_c = user === null || user === void 0 ? void 0 : user.user_metadata) ===
                      null || _c === void 0
                      ? void 0
                      : _c.full_name) || (user === null || user === void 0 ? void 0 : user.email)
                  }
                />
                <avatar_1.AvatarFallback className="rounded-lg">
                  {((_d = user === null || user === void 0 ? void 0 : user.email) === null ||
                  _d === void 0
                    ? void 0
                    : _d.charAt(0).toUpperCase()) || "U"}
                </avatar_1.AvatarFallback>
              </avatar_1.Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {((_e = user === null || user === void 0 ? void 0 : user.user_metadata) ===
                    null || _e === void 0
                    ? void 0
                    : _e.full_name) ||
                    ((_f = user === null || user === void 0 ? void 0 : user.email) === null ||
                    _f === void 0
                      ? void 0
                      : _f.split("@")[0]) ||
                    "Usuário"}
                </span>
                <span className="truncate text-xs">
                  {(user === null || user === void 0 ? void 0 : user.email) || "email@exemplo.com"}
                </span>
              </div>
            </div>
          </sidebar_1.SidebarMenuItem>
          <sidebar_1.SidebarMenuItem>
            <form action="/api/auth/signout" method="post" className="w-full">
              <button_1.Button
                type="submit"
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
              >
                <lucide_react_1.LogOut className="h-4 w-4" />
                Sair
              </button_1.Button>
            </form>
          </sidebar_1.SidebarMenuItem>
        </sidebar_1.SidebarMenu>
      </sidebar_1.SidebarFooter>

      <sidebar_1.SidebarRail />
    </sidebar_1.Sidebar>
  );
}
