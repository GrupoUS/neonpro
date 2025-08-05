/**
 * NEONPROV1 Design System - AppHeader Component
 * Main header with breadcrumbs and user menu
 */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppHeader = void 0;
var react_1 = require("react");
var link_1 = require("next/link");
var navigation_1 = require("next/navigation");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var input_1 = require("@/components/ui/input");
var routeLabels = {
  dashboard: "Dashboard",
  agenda: "Agenda",
  pacientes: "Pacientes",
  financeiro: "Financeiro",
  profile: "Perfil",
  settings: "Configurações",
};
var AppHeader = function (_a) {
  var onMenuToggle = _a.onMenuToggle,
    className = _a.className;
  var pathname = (0, navigation_1.usePathname)();
  var generateBreadcrumbs = function (pathname) {
    var segments = pathname.split("/").filter(Boolean);
    var breadcrumbs = [{ label: "Home", href: "/dashboard" }];
    segments.forEach(function (segment, index) {
      var href = "/" + segments.slice(0, index + 1).join("/");
      var label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      var isActive = index === segments.length - 1;
      breadcrumbs.push({
        label: label,
        href: isActive ? undefined : href,
        isActive: isActive,
      });
    });
    return breadcrumbs;
  };
  var breadcrumbs = generateBreadcrumbs(pathname);
  return (
    <header
      className={(0, utils_1.cn)(
        "sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700",
        "backdrop-blur-sm bg-white/95 dark:bg-slate-900/95",
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button_1.Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden p-2"
          >
            <lucide_react_1.Menu className="w-5 h-5" />
          </button_1.Button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center space-x-2 text-sm">
            {breadcrumbs.map(function (item, index) {
              return (
                <react_1.default.Fragment key={index}>
                  {index > 0 && <lucide_react_1.ChevronRight className="w-4 h-4 text-slate-400" />}
                  {item.href && !item.isActive
                    ? <link_1.default
                        href={item.href}
                        className="text-slate-600 hover:text-neon-primary dark:text-slate-400 dark:hover:text-neon-accent transition-colors"
                      >
                        {item.label}
                      </link_1.default>
                    : <span
                        className={(0, utils_1.cn)(
                          "font-medium",
                          item.isActive
                            ? "text-neon-primary dark:text-neon-accent"
                            : "text-slate-600 dark:text-slate-400",
                        )}
                      >
                        {item.label}
                      </span>}
                </react_1.default.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:block relative">
            <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input_1.Input placeholder="Buscar..." className="pl-10 w-64 neon-input" />
          </div>

          {/* Notifications */}
          <button_1.Button variant="ghost" size="sm" className="relative p-2">
            <lucide_react_1.Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-healthcare-critical rounded-full text-xs" />
          </button_1.Button>

          {/* User Menu */}
          <dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
              <button_1.Button variant="ghost" size="sm" className="p-2">
                <div className="w-8 h-8 bg-neon-primary rounded-full flex items-center justify-center">
                  <lucide_react_1.User className="w-4 h-4 text-white" />
                </div>
              </button_1.Button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">Dr. João Silva</p>
                <p className="text-xs text-slate-500">joao@neonprov1.com</p>
              </div>
              <dropdown_menu_1.DropdownMenuSeparator />
              <dropdown_menu_1.DropdownMenuItem asChild>
                <link_1.default href="/profile" className="flex items-center gap-2">
                  <lucide_react_1.User className="w-4 h-4" />
                  <span>Perfil</span>
                </link_1.default>
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem asChild>
                <link_1.default href="/settings" className="flex items-center gap-2">
                  <lucide_react_1.Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </link_1.default>
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuSeparator />
              <dropdown_menu_1.DropdownMenuItem className="text-red-600 dark:text-red-400">
                <lucide_react_1.LogOut className="w-4 h-4 mr-2" />
                <span>Sair</span>
              </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
          </dropdown_menu_1.DropdownMenu>
        </div>
      </div>
    </header>
  );
};
exports.AppHeader = AppHeader;
