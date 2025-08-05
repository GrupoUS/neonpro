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
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicalNavigationEnhanced = ClinicalNavigationEnhanced;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var avatar_1 = require("@/components/ui/avatar");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var sheet_1 = require("@/components/ui/sheet");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var accessibility_context_1 = require("@/contexts/accessibility-context");
function ClinicalNavigationEnhanced(_a) {
    var user = _a.user, _b = _a.alerts, alerts = _b === void 0 ? [] : _b, className = _a.className;
    var _c = (0, react_1.useState)(false), isSearchOpen = _c[0], setIsSearchOpen = _c[1];
    var _d = (0, react_1.useState)(''), searchQuery = _d[0], setSearchQuery = _d[1];
    var _e = (0, react_1.useState)(false), showShortcuts = _e[0], setShowShortcuts = _e[1];
    var router = (0, navigation_1.useRouter)();
    var pathname = (0, navigation_1.usePathname)();
    var announceToScreenReader = (0, accessibility_context_1.useAccessibility)().announceToScreenReader;
    // Items de navegação baseados no papel do usuário
    var navigationItems = (0, react_1.useMemo)(function () { return [
        {
            id: 'dashboard',
            label: 'Dashboard',
            href: '/dashboard',
            icon: lucide_react_1.Home,
            shortcut: 'Alt+D',
            roles: ['doctor', 'coordinator', 'admin']
        },
        {
            id: 'agenda',
            label: 'Agenda',
            href: '/agenda',
            icon: lucide_react_1.Calendar,
            badge: 5, // Número de conflitos/pendências
            shortcut: 'Alt+A',
            roles: ['doctor', 'coordinator']
        },
        {
            id: 'pacientes',
            label: 'Pacientes',
            href: '/pacientes',
            icon: lucide_react_1.Users,
            shortcut: 'Alt+P',
            roles: ['doctor', 'coordinator', 'admin']
        },
        {
            id: 'consultas',
            label: 'Consultas',
            href: '/consultas',
            icon: lucide_react_1.Stethoscope,
            badge: 3, // Consultas pendentes
            shortcut: 'Alt+C',
            roles: ['doctor']
        },
        {
            id: 'financeiro',
            label: 'Financeiro',
            href: '/financeiro',
            icon: lucide_react_1.BarChart3,
            shortcut: 'Alt+F',
            roles: ['doctor', 'admin']
        },
        {
            id: 'relatorios',
            label: 'Relatórios',
            href: '/relatorios',
            icon: lucide_react_1.FileText,
            shortcut: 'Alt+R',
            roles: ['doctor', 'admin']
        },
        {
            id: 'configuracoes',
            label: 'Configurações',
            href: '/configuracoes',
            icon: lucide_react_1.Settings,
            roles: ['admin']
        }
    ].filter(function (item) { return item.roles.includes(user.role); }); }, [user.role]);
    // Ações rápidas baseadas no papel
    var quickActions = (0, react_1.useMemo)(function () {
        var actions = [];
        if (user.role === 'doctor' || user.role === 'coordinator') {
            actions.push({ id: 'novo-paciente', label: 'Novo Paciente', icon: lucide_react_1.Plus, shortcut: 'Ctrl+N' }, { id: 'agendar', label: 'Agendar Consulta', icon: lucide_react_1.Calendar, shortcut: 'Ctrl+A' });
        }
        if (user.role === 'coordinator') {
            actions.push({ id: 'ligar-paciente', label: 'Ligar para Paciente', icon: lucide_react_1.Phone, shortcut: 'Ctrl+L' });
        }
        return actions;
    }, [user.role]);
    // Contador total de alertas
    var totalAlerts = alerts.reduce(function (sum, alert) { return sum + alert.count; }, 0);
    // Breadcrumbs inteligentes
    var breadcrumbs = (0, react_1.useMemo)(function () {
        var paths = pathname.split('/').filter(Boolean);
        var crumbs = [{ label: 'Início', href: '/dashboard' }];
        var currentPath = '';
        paths.forEach(function (path, index) {
            currentPath += "/".concat(path);
            var item = navigationItems.find(function (item) { return item.href === currentPath; });
            if (item) {
                crumbs.push({ label: item.label, href: currentPath });
            }
            else {
                // Fallback para paths não mapeados
                crumbs.push({
                    label: path.charAt(0).toUpperCase() + path.slice(1),
                    href: currentPath
                });
            }
        });
        return crumbs;
    }, [pathname, navigationItems]);
    // Atalhos de teclado globais
    (0, react_1.useEffect)(function () {
        var handleKeyDown = function (event) {
            // Busca rápida (Ctrl+K ou Cmd+K)
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                setIsSearchOpen(true);
                announceToScreenReader('Busca rápida ativada', 'assertive');
                return;
            }
            // Mostrar atalhos (Ctrl+?)
            if ((event.ctrlKey || event.metaKey) && event.key === '/') {
                event.preventDefault();
                setShowShortcuts(!showShortcuts);
                return;
            }
            // Navegação por atalhos Alt+
            if (event.altKey) {
                var item = navigationItems.find(function (item) { var _a; return (_a = item.shortcut) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(event.key.toLowerCase()); });
                if (item) {
                    event.preventDefault();
                    router.push(item.href);
                    announceToScreenReader("Navegando para ".concat(item.label), 'assertive');
                    return;
                }
            }
            // Ações rápidas Ctrl+
            if (event.ctrlKey) {
                switch (event.key.toLowerCase()) {
                    case 'n':
                        if (user.role === 'doctor' || user.role === 'coordinator') {
                            event.preventDefault();
                            router.push('/pacientes/novo');
                            announceToScreenReader('Abrindo formulário de novo paciente', 'assertive');
                        }
                        break;
                    case 'a':
                        if (user.role === 'doctor' || user.role === 'coordinator') {
                            event.preventDefault();
                            router.push('/agenda/novo');
                            announceToScreenReader('Abrindo agendamento de consulta', 'assertive');
                        }
                        break;
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return function () { return document.removeEventListener('keydown', handleKeyDown); };
    }, [navigationItems, router, user.role, showShortcuts, announceToScreenReader]);
    // Busca de pacientes
    var handleSearch = function (query) {
        if (query.trim()) {
            router.push("/pacientes?busca=".concat(encodeURIComponent(query)));
            setIsSearchOpen(false);
            setSearchQuery('');
            announceToScreenReader("Buscando por ".concat(query), 'assertive');
        }
    };
    var getAlertIcon = function (type) {
        switch (type) {
            case 'urgent': return <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-500"/>;
            case 'warning': return <lucide_react_1.Clock className="h-4 w-4 text-yellow-500"/>;
            case 'info': return <lucide_react_1.CheckCircle2 className="h-4 w-4 text-blue-500"/>;
            default: return null;
        }
    };
    var getAlertVariant = function (type) {
        switch (type) {
            case 'urgent': return 'destructive';
            case 'warning': return 'secondary';
            case 'info': return 'default';
            default: return 'secondary';
        }
    };
    return (<div className={(0, utils_1.cn)('border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
      <div className="flex h-16 items-center px-4">
        
        {/* Logo / Brand */}
        <div className="flex items-center space-x-4">
          <div className="font-bold text-xl">NeonPro</div>
          
          {/* Mobile menu trigger */}
          <sheet_1.Sheet>
            <sheet_1.SheetTrigger asChild>
              <button_1.Button variant="ghost" size="icon" className="md:hidden">
                <lucide_react_1.Menu className="h-5 w-5"/>
                <span className="sr-only">Abrir menu</span>
              </button_1.Button>
            </sheet_1.SheetTrigger>
            <sheet_1.SheetContent side="left" className="w-80">
              <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                  <h2 className="mb-2 px-4 text-lg font-semibold">Navegação</h2>
                  <div className="space-y-1">
                    {navigationItems.map(function (item) { return (<button_1.Button key={item.id} variant={pathname === item.href ? "secondary" : "ghost"} className="w-full justify-start" onClick={function () { return router.push(item.href); }}>
                        <item.icon className="mr-2 h-4 w-4"/>
                        {item.label}
                        {item.badge && (<badge_1.Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </badge_1.Badge>)}
                      </button_1.Button>); })}
                  </div>
                </div>
              </div>
            </sheet_1.SheetContent>
          </sheet_1.Sheet>
        </div>

        {/* Breadcrumbs - Desktop */}
        <div className="hidden md:flex items-center space-x-2 ml-6">
          {breadcrumbs.map(function (crumb, index) { return (<div key={index} className="flex items-center space-x-2">
              {index > 0 && <lucide_react_1.ChevronRight className="h-4 w-4 text-muted-foreground"/>}
              <button onClick={function () { return router.push(crumb.href); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {crumb.label}
              </button>
            </div>); })}
        </div>

        {/* Spacer */}
        <div className="flex-1"/>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <lucide_react_1.Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
            <input_1.Input placeholder="Buscar paciente... (Ctrl+K)" className="w-64 pl-8" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} onKeyDown={function (e) {
            if (e.key === 'Enter') {
                handleSearch(searchQuery);
            }
        }}/>
          </div>
          
          {/* Quick Actions */}
          <dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
              <button_1.Button variant="ghost" size="icon">
                <lucide_react_1.Plus className="h-5 w-5"/>
                <span className="sr-only">Ações rápidas</span>
              </button_1.Button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="end">
              <dropdown_menu_1.DropdownMenuLabel>Ações Rápidas</dropdown_menu_1.DropdownMenuLabel>
              <dropdown_menu_1.DropdownMenuSeparator />
              {quickActions.map(function (action) { return (<dropdown_menu_1.DropdownMenuItem key={action.id} onClick={function () {
                // Implementar ação
                announceToScreenReader("Executando ".concat(action.label), 'assertive');
            }}>
                  <action.icon className="mr-2 h-4 w-4"/>
                  {action.label}
                  {action.shortcut && (<kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                      {action.shortcut}
                    </kbd>)}
                </dropdown_menu_1.DropdownMenuItem>); })}
            </dropdown_menu_1.DropdownMenuContent>
          </dropdown_menu_1.DropdownMenu>

          {/* Alerts */}
          {totalAlerts > 0 && (<dropdown_menu_1.DropdownMenu>
              <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button_1.Button variant="ghost" size="icon" className="relative">
                  <lucide_react_1.Bell className="h-5 w-5"/>
                  <badge_1.Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                    {totalAlerts}
                  </badge_1.Badge>
                  <span className="sr-only">
                    {totalAlerts} alerta{totalAlerts > 1 ? 's' : ''}
                  </span>
                </button_1.Button>
              </dropdown_menu_1.DropdownMenuTrigger>
              <dropdown_menu_1.DropdownMenuContent align="end" className="w-80">
                <dropdown_menu_1.DropdownMenuLabel>Alertas Ativos</dropdown_menu_1.DropdownMenuLabel>
                <dropdown_menu_1.DropdownMenuSeparator />
                {alerts.map(function (alert) { return (<dropdown_menu_1.DropdownMenuItem key={alert.id} className="flex items-start space-x-2 p-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      {alert.count > 1 && (<badge_1.Badge variant={getAlertVariant(alert.type)} className="mt-1">
                          {alert.count} ocorrências
                        </badge_1.Badge>)}
                    </div>
                  </dropdown_menu_1.DropdownMenuItem>); })}
              </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>)}

          {/* Keyboard shortcuts help */}
          <button_1.Button variant="ghost" size="icon" onClick={function () { return setShowShortcuts(!showShortcuts); }} title="Atalhos de teclado (Ctrl+/)">
            <lucide_react_1.Keyboard className="h-5 w-5"/>
            <span className="sr-only">Atalhos de teclado</span>
          </button_1.Button>

          {/* User menu */}
          <dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
              <button_1.Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <avatar_1.Avatar className="h-8 w-8">
                  <avatar_1.AvatarImage src={user.avatar} alt={user.name}/>
                  <avatar_1.AvatarFallback>
                    {user.name.split(' ').map(function (n) { return n[0]; }).join('').toUpperCase()}
                  </avatar_1.AvatarFallback>
                </avatar_1.Avatar>
              </button_1.Button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent className="w-56" align="end" forceMount>
              <dropdown_menu_1.DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <badge_1.Badge variant="outline" className="w-fit text-xs">
                    {user.role === 'doctor' ? 'Médico' :
            user.role === 'coordinator' ? 'Coordenador' : 'Administrador'}
                  </badge_1.Badge>
                </div>
              </dropdown_menu_1.DropdownMenuLabel>
              <dropdown_menu_1.DropdownMenuSeparator />
              <dropdown_menu_1.DropdownMenuItem>
                <lucide_react_1.User className="mr-2 h-4 w-4"/>
                <span>Perfil</span>
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem>
                <lucide_react_1.Settings className="mr-2 h-4 w-4"/>
                <span>Configurações</span>
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuSeparator />
              <dropdown_menu_1.DropdownMenuItem>
                <lucide_react_1.LogOut className="mr-2 h-4 w-4"/>
                <span>Sair</span>
              </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
          </dropdown_menu_1.DropdownMenu>
        </div>
      </div>

      {/* Keyboard shortcuts overlay */}
      {showShortcuts && (<div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Atalhos de Teclado</h3>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Navegação:</strong>
              </div>
              {navigationItems
                .filter(function (item) { return item.shortcut; })
                .map(function (item) { return (<div key={item.id} className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">
                      {item.shortcut}
                    </kbd>
                  </div>); })}
              
              <div className="text-sm mt-4">
                <strong>Ações:</strong>
              </div>
              <div className="flex justify-between text-sm">
                <span>Busca rápida</span>
                <kbd className="bg-muted px-2 py-1 rounded text-xs">Ctrl+K</kbd>
              </div>
              {quickActions.map(function (action) { return (<div key={action.id} className="flex justify-between text-sm">
                  <span>{action.label}</span>
                  <kbd className="bg-muted px-2 py-1 rounded text-xs">
                    {action.shortcut}
                  </kbd>
                </div>); })}
            </div>
            <button_1.Button variant="outline" size="sm" className="mt-4 w-full" onClick={function () { return setShowShortcuts(false); }}>
              Fechar
            </button_1.Button>
          </div>
        </div>)}
    </div>);
}
