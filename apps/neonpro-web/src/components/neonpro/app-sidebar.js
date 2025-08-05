/**
 * NEONPROV1 Design System - AppSidebar Component
 * Main navigation sidebar with NEONPROV1 branding
 */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppSidebar = void 0;
var react_1 = require("react");
var link_1 = require("next/link");
var navigation_1 = require("next/navigation");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var sidebarItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: lucide_react_1.LayoutDashboard,
  },
  {
    id: "agenda",
    label: "Agenda",
    href: "/agenda",
    icon: lucide_react_1.Calendar,
  },
  {
    id: "pacientes",
    label: "Pacientes",
    href: "/pacientes",
    icon: lucide_react_1.Users,
  },
  {
    id: "financeiro",
    label: "Financeiro",
    href: "/financeiro",
    icon: lucide_react_1.DollarSign,
  },
];
var AppSidebar = function (_a) {
  var _b = _a.isOpen,
    isOpen = _b === void 0 ? true : _b,
    onToggle = _a.onToggle,
    className = _a.className;
  var pathname = (0, navigation_1.usePathname)();
  var isActiveRoute = function (href) {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <aside
        className={(0, utils_1.cn)(
          "fixed left-0 top-0 h-full w-64 z-50",
          "neon-sidebar transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          {
            "translate-x-0": isOpen,
            "-translate-x-full": !isOpen,
          },
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-neon-primary to-neon-accent rounded-lg flex items-center justify-center">
              <lucide_react_1.Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">NEONPROV1</h1>
              <p className="text-xs text-slate-400">Healthcare Management</p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <lucide_react_1.X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map(function (item) {
              var Icon = item.icon;
              var isActive = isActiveRoute(item.href);
              return (
                <li key={item.id}>
                  <link_1.default
                    href={item.href}
                    className={(0, utils_1.cn)("neon-sidebar-item group relative", {
                      "neon-sidebar-item-active": isActive,
                    })}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>

                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 bg-neon-accent text-neon-primary text-xs font-medium rounded-full">
                        {item.badge}
                      </span>
                    )}

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-neon-accent rounded-r-full" />
                    )}
                  </link_1.default>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <link_1.default href="/profile" className="neon-sidebar-item flex-1">
              <lucide_react_1.Settings className="w-5 h-5" />
              <span>Configurações</span>
            </link_1.default>
          </div>

          <button className="neon-sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <lucide_react_1.LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};
exports.AppSidebar = AppSidebar;
