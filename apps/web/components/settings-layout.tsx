/**
 * ⚙️ Settings Layout - NeonPro Healthcare
 * =====================================
 *
 * Layout for settings pages with tabbed navigation
 * and role-based settings access.
 */

"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { MainNavigation } from "@/components/main-navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  Bell,
  Building,
  CreditCard,
  Plug,
  Settings,
  Shield,
  User,
} from "lucide-react";
import type React from "react";

interface SettingsTab {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: () => boolean;
}

export function SettingsLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const canAccessClinicSettings = () => {
    return user && ["clinic_owner", "clinic_manager"].includes(user.role);
  };

  const settingsTabs: SettingsTab[] = [
    {
      label: "Geral",
      href: "/settings",
      icon: Settings,
    },
    {
      label: "Perfil",
      href: "/settings/profile",
      icon: User,
    },
    {
      label: "Segurança",
      href: "/settings/security",
      icon: Shield,
    },
    {
      label: "Notificações",
      href: "/settings/notifications",
      icon: Bell,
    },
    {
      label: "Clínica",
      href: "/settings/clinic",
      icon: Building,
      permission: canAccessClinicSettings,
    },
    {
      label: "Integrações",
      href: "/settings/integrations",
      icon: Plug,
      permission: canAccessClinicSettings,
    },
    {
      label: "Billing",
      href: "/settings/billing",
      icon: CreditCard,
      permission: canAccessClinicSettings,
    },
  ];

  const visibleTabs = settingsTabs.filter(
    (tab) => !tab.permission || tab.permission(),
  );

  const isActiveTab = (href: string) => {
    if (href === "/settings") {
      return location.pathname === "/settings";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Navigation */}
      <MainNavigation />

      {/* Main Content Area */}
      <div className="md:pl-64">
        {/* Top Header with Breadcrumbs */}
        <header className="sticky top-0 z-10 border-b bg-card">
          <div className="px-4 py-3">
            <Breadcrumbs />
          </div>
        </header>

        {/* Settings Content */}
        <main className="flex-1">
          <div className="px-4 py-6">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8">
                <h1 className="font-bold text-3xl">Configurações</h1>
                <p className="text-muted-foreground">
                  Gerencie suas preferências e configurações da conta
                </p>
              </div>

              <div className="flex flex-col gap-8 lg:flex-row">
                {/* Settings Navigation */}
                <aside className="flex-shrink-0 lg:w-64">
                  <nav className="space-y-1">
                    {visibleTabs.map((tab) => (
                      <Link
                        className={cn(
                          "flex items-center space-x-3 rounded-lg px-3 py-2 font-medium text-sm transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActiveTab(tab.href)
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground",
                        )}
                        key={tab.href}
                        to={tab.href}
                      >
                        <tab.icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                      </Link>
                    ))}
                  </nav>
                </aside>

                {/* Settings Content */}
                <div className="min-w-0 flex-1">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
