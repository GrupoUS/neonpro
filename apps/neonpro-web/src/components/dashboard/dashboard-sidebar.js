"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardSidebar = DashboardSidebar;
var avatar_1 = require("@/components/ui/avatar");
var button_1 = require("@/components/ui/button");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
var navigation_1 = require("next/navigation");
var navigationItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: lucide_react_1.Home,
        description: "Visão geral e métricas principais",
    },
    {
        title: "Pacientes",
        href: "/dashboard/patients",
        icon: lucide_react_1.Users,
        description: "Gestão de pacientes",
    },
    {
        title: "Agendamentos",
        href: "/dashboard/appointments",
        icon: lucide_react_1.Calendar,
        description: "Agenda e consultas",
    },
    {
        title: "Financeiro",
        href: "/dashboard/financial",
        icon: lucide_react_1.CreditCard,
        description: "Controle financeiro",
    },
    {
        title: "Inventário",
        href: "/dashboard/inventory",
        icon: lucide_react_1.Package,
        description: "Gestão de estoque",
    },
    {
        title: "Fornecedores",
        href: "/dashboard/suppliers",
        icon: lucide_react_1.Building2,
        description: "Gestão de fornecedores",
    },
    {
        title: "Manutenção",
        href: "/dashboard/maintenance",
        icon: lucide_react_1.Wrench,
        description: "Manutenção de equipamentos",
    },
    {
        title: "Segmentação",
        href: "/dashboard/segmentation",
        icon: lucide_react_1.Target,
        description: "Segmentação de pacientes e análise inteligente",
    },
    {
        title: "Campanhas",
        href: "/dashboard/marketing-campaigns",
        icon: lucide_react_1.MessageCircle,
        description: "Campanhas de marketing automatizadas",
    },
    {
        title: "Follow-up",
        href: "/dashboard/treatment-followup",
        icon: lucide_react_1.Activity,
        description: "Acompanhamento automatizado de tratamentos",
    },
    {
        title: "Predição IA",
        href: "/dashboard/treatment-prediction",
        icon: lucide_react_1.Brain,
        description: "Predição de sucesso de tratamentos com IA",
    },
    {
        title: "Retenção de Pacientes",
        href: "/dashboard/retention-analytics",
        icon: lucide_react_1.Target,
        description: "Analytics e predições de retenção de pacientes",
    },
    {
        title: "Recomendações Personalizadas",
        href: "/dashboard/personalized-recommendations",
        icon: lucide_react_1.Target,
        description: "Recomendações de tratamento personalizadas com IA",
    },
    {
        title: "Otimização de Protocolos",
        href: "/dashboard/automated-protocol-optimization",
        icon: lucide_react_1.Settings,
        description: "Otimização automatizada de protocolos com IA",
    },
    {
        title: "Relatórios",
        href: "/dashboard/reports",
        icon: lucide_react_1.BarChart3,
        description: "Relatórios e análises",
    },
    {
        title: "Report Builder",
        href: "/dashboard/report-builder",
        icon: lucide_react_1.FileText,
        description: "Construtor de relatórios personalizados",
    },
    {
        title: "Prontuários",
        href: "/dashboard/records",
        icon: lucide_react_1.FileText,
        description: "Prontuários médicos",
    },
];
var secondaryItems = [
    {
        title: "Atividades",
        href: "/dashboard/activities",
        icon: lucide_react_1.Activity,
        description: "Log de atividades",
    },
    {
        title: "Notificações",
        href: "/dashboard/notifications",
        icon: lucide_react_1.Bell,
        description: "Central de notificações",
    },
    {
        title: "Configurações",
        href: "/dashboard/settings",
        icon: lucide_react_1.Settings,
        description: "Configurações do sistema",
    },
];
function DashboardSidebar(_a) {
    var _b, _c, _d, _e, _f, _g;
    var open = _a.open, onOpenChange = _a.onOpenChange, user = _a.user;
    var pathname = (0, navigation_1.usePathname)();
    var NavItem = function (_a) {
        var item = _a.item;
        var isActive = pathname === item.href;
        var Icon = item.icon;
        return (<link_1.default href={item.href} className={(0, utils_1.cn)("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent", isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground")} onClick={function () { return onOpenChange(false); }}>
        <Icon className="h-4 w-4"/>
        <span>{item.title}</span>
      </link_1.default>);
    };
    return (<>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <lucide_react_1.Activity className="h-4 w-4 text-primary-foreground"/>
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
                  {navigationItems.map(function (item) { return (<li key={item.title}>
                      <NavItem item={item}/>
                    </li>); })}
                </ul>
              </li>

              <li>
                <div className="text-xs font-semibold leading-6 text-muted-foreground">
                  FERRAMENTAS
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {secondaryItems.map(function (item) { return (<li key={item.title}>
                      <NavItem item={item}/>
                    </li>); })}
                </ul>
              </li>
            </ul>
          </nav>

          {/* User Profile */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <avatar_1.Avatar className="h-8 w-8">
                <avatar_1.AvatarImage src={(_b = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _b === void 0 ? void 0 : _b.avatar_url}/>
                <avatar_1.AvatarFallback>
                  {(_c = user === null || user === void 0 ? void 0 : user.email) === null || _c === void 0 ? void 0 : _c.charAt(0).toUpperCase()}
                </avatar_1.AvatarFallback>
              </avatar_1.Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {((_d = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _d === void 0 ? void 0 : _d.full_name) || (user === null || user === void 0 ? void 0 : user.email)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user === null || user === void 0 ? void 0 : user.email}
                </p>
              </div>
            </div>

            <form action="/api/auth/signout" method="post" className="mt-2">
              <button_1.Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
                <lucide_react_1.LogOut className="h-4 w-4"/>
                Sair
              </button_1.Button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={(0, utils_1.cn)("fixed inset-y-0 z-50 flex w-64 flex-col transition-transform duration-300 ease-in-out lg:hidden", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
          {/* Same content as desktop sidebar */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <lucide_react_1.Activity className="h-4 w-4 text-primary-foreground"/>
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
                  {navigationItems.map(function (item) { return (<li key={item.title}>
                      <NavItem item={item}/>
                    </li>); })}
                </ul>
              </li>

              <li>
                <div className="text-xs font-semibold leading-6 text-muted-foreground">
                  FERRAMENTAS
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {secondaryItems.map(function (item) { return (<li key={item.title}>
                      <NavItem item={item}/>
                    </li>); })}
                </ul>
              </li>
            </ul>
          </nav>

          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <avatar_1.Avatar className="h-8 w-8">
                <avatar_1.AvatarImage src={(_e = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _e === void 0 ? void 0 : _e.avatar_url}/>
                <avatar_1.AvatarFallback>
                  {(_f = user === null || user === void 0 ? void 0 : user.email) === null || _f === void 0 ? void 0 : _f.charAt(0).toUpperCase()}
                </avatar_1.AvatarFallback>
              </avatar_1.Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {((_g = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _g === void 0 ? void 0 : _g.full_name) || (user === null || user === void 0 ? void 0 : user.email)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user === null || user === void 0 ? void 0 : user.email}
                </p>
              </div>
            </div>

            <form action="/api/auth/signout" method="post" className="mt-2">
              <button_1.Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
                <lucide_react_1.LogOut className="h-4 w-4"/>
                Sair
              </button_1.Button>
            </form>
          </div>
        </div>
      </div>
    </>);
}
