/**
 * NEONPROV1 Design System - AppSidebar Component
 * Main navigation sidebar with NEONPROV1 branding
 */
"use client";

import React from "react";
import Link from "next/link";
import type { usePathname } from "next/navigation";
import type { cn } from "@/lib/utils";
import type {
  Calendar,
  Users,
  DollarSign,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface AppSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "agenda",
    label: "Agenda",
    href: "/agenda",
    icon: Calendar,
  },
  {
    id: "pacientes",
    label: "Pacientes",
    href: "/pacientes",
    icon: Users,
  },
  {
    id: "financeiro",
    label: "Financeiro",
    href: "/financeiro",
    icon: DollarSign,
  },
];

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen = true, onToggle, className }) => {
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
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
        className={cn(
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
              <Activity className="w-5 h-5 text-white" />
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
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn("neon-sidebar-item group relative", {
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
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/profile" className="neon-sidebar-item flex-1">
              <Settings className="w-5 h-5" />
              <span>Configurações</span>
            </Link>
          </div>

          <button className="neon-sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};
