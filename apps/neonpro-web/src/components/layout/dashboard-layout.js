"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardLayout = DashboardLayout;
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
var navigation_1 = require("next/navigation");
var react_1 = require("react");
var avatar_1 = require("@/components/ui/avatar");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var navigationItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: lucide_react_1.Home,
        badge: null,
    },
    {
        title: "Pacientes",
        href: "/patients",
        icon: lucide_react_1.Users,
        badge: null,
    },
    {
        title: "Agendamentos",
        href: "/appointments",
        icon: lucide_react_1.Calendar,
        badge: "3",
    },
    {
        title: "Prontuários",
        href: "/medical-records",
        icon: lucide_react_1.FileText,
        badge: null,
    },
    {
        title: "Procedimentos",
        href: "/procedures",
        icon: lucide_react_1.Stethoscope,
        badge: null,
    },
    {
        title: "Inventário",
        href: "/inventory",
        icon: lucide_react_1.Package,
        badge: null,
    },
    {
        title: "Analytics",
        href: "/analytics",
        icon: lucide_react_1.BarChart3,
        badge: null,
    },
    {
        title: "Dashboard Negócios",
        href: "/dashboard/business-dashboard",
        icon: lucide_react_1.Activity,
        badge: "NEW",
    },
    {
        title: "Análise Preditiva",
        href: "/dashboard/predictive-analytics",
        icon: lucide_react_1.Brain,
        badge: "NEW",
    },
    {
        title: "Taxa de Sucesso",
        href: "/dashboard/treatment-success",
        icon: lucide_react_1.TrendingUp,
        badge: "NEW",
    },
    {
        title: "LGPD",
        href: "/lgpd",
        icon: lucide_react_1.Shield,
        badge: "NEW",
    },
    {
        title: "Configurações",
        href: "/settings",
        icon: lucide_react_1.Settings,
        badge: null,
    },
];
function DashboardLayout(_a) {
    var _b;
    var children = _a.children, currentUser = _a.currentUser;
    var _c = (0, react_1.useState)(false), sidebarOpen = _c[0], setSidebarOpen = _c[1];
    var pathname = (0, navigation_1.usePathname)();
    var defaultUser = {
        name: "Dr. Maria Silva",
        email: "dra.maria@neonpro.com.br",
        role: "Dermatologista",
        avatar: "",
    };
    var user = currentUser || defaultUser;
    return (<div className="clinic-layout">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (<div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={function () { return setSidebarOpen(false); }}/>)}

      {/* Sidebar */}
      <aside className={"\n        fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border transition-transform duration-300 ease-in-out\n        ".concat(sidebarOpen ? "translate-x-0" : "-translate-x-full", "\n        lg:translate-x-0 lg:static\n      ")}>
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <lucide_react_1.Stethoscope className="w-5 h-5 text-primary-foreground"/>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  NeonPro
                </h1>
                <p className="text-xs text-muted-foreground">
                  Clínica Estética
                </p>
              </div>
            </div>
            <button_1.Button variant="ghost" size="sm" className="lg:hidden" onClick={function () { return setSidebarOpen(false); }}>
              <lucide_react_1.X className="w-4 h-4"/>
            </button_1.Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map(function (item) {
            var isActive = pathname === item.href;
            return (<link_1.default key={item.href} href={item.href} className={"\n                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors\n                    ".concat(isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent", "\n                  ")} onClick={function () { return setSidebarOpen(false); }}>
                  <item.icon className="w-4 h-4"/>
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (<badge_1.Badge variant={item.badge === "NEW" ? "default" : "secondary"} className="text-xs">
                      {item.badge}
                    </badge_1.Badge>)}
                </link_1.default>);
        })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <dropdown_menu_1.DropdownMenu>
              <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button_1.Button variant="ghost" className="w-full justify-start p-2">
                  <div className="flex items-center gap-3">
                    <avatar_1.Avatar className="w-8 h-8">
                      <avatar_1.AvatarImage src={user.avatar} alt={user.name}/>
                      <avatar_1.AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user.name
            .split(" ")
            .map(function (n) { return n[0]; })
            .join("")}
                      </avatar_1.AvatarFallback>
                    </avatar_1.Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.role}
                      </p>
                    </div>
                    <lucide_react_1.ChevronDown className="w-4 h-4 text-muted-foreground"/>
                  </div>
                </button_1.Button>
              </dropdown_menu_1.DropdownMenuTrigger>
              <dropdown_menu_1.DropdownMenuContent align="end" className="w-56">
                <dropdown_menu_1.DropdownMenuLabel>Minha Conta</dropdown_menu_1.DropdownMenuLabel>
                <dropdown_menu_1.DropdownMenuSeparator />
                <dropdown_menu_1.DropdownMenuItem>
                  <lucide_react_1.User className="w-4 h-4 mr-2"/>
                  Perfil
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem>
                  <lucide_react_1.Settings className="w-4 h-4 mr-2"/>
                  Configurações
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuSeparator />
                <dropdown_menu_1.DropdownMenuItem className="text-destructive">
                  <lucide_react_1.LogOut className="w-4 h-4 mr-2"/>
                  Sair
                </dropdown_menu_1.DropdownMenuItem>
              </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <div className="flex items-center gap-4">
            <button_1.Button variant="ghost" size="sm" className="lg:hidden" onClick={function () { return setSidebarOpen(true); }}>
              <lucide_react_1.Menu className="w-4 h-4"/>
            </button_1.Button>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {((_b = navigationItems.find(function (item) { return item.href === pathname; })) === null || _b === void 0 ? void 0 : _b.title) || "Dashboard"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Bem-vinda, {user.name.split(" ")[1] || user.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button_1.Button variant="ghost" size="sm" className="relative">
              <lucide_react_1.Bell className="w-4 h-4"/>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-xs text-destructive-foreground font-bold">
                  2
                </span>
              </span>
            </button_1.Button>

            {/* Quick Actions */}
            <dropdown_menu_1.DropdownMenu>
              <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button_1.Button variant="outline" size="sm">
                  Ações Rápidas
                  <lucide_react_1.ChevronDown className="w-4 h-4 ml-2"/>
                </button_1.Button>
              </dropdown_menu_1.DropdownMenuTrigger>
              <dropdown_menu_1.DropdownMenuContent align="end">
                <dropdown_menu_1.DropdownMenuItem>
                  <lucide_react_1.Users className="w-4 h-4 mr-2"/>
                  Novo Paciente
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem>
                  <lucide_react_1.Calendar className="w-4 h-4 mr-2"/>
                  Novo Agendamento
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem>
                  <lucide_react_1.FileText className="w-4 h-4 mr-2"/>
                  Novo Prontuário
                </dropdown_menu_1.DropdownMenuItem>
              </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="clinic-main">{children}</main>
      </div>
    </div>);
}
