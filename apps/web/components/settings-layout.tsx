/**
 * ⚙️ Settings Layout - NeonPro Healthcare
 * =====================================
 * 
 * Layout for settings pages with tabbed navigation
 * and role-based settings access.
 */

'use client';

import React from 'react';
import { Outlet, Link, useLocation } from '@tanstack/react-router';
import { MainNavigation } from '@/components/main-navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useAuth } from '@/contexts/auth-context';
import { 
  Settings, 
  User, 
  Shield, 
  Building, 
  Plug,
  Bell,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    return user && ['clinic_owner', 'clinic_manager'].includes(user.role);
  };

  const settingsTabs: SettingsTab[] = [
    {
      label: 'Geral',
      href: '/settings',
      icon: Settings,
    },
    {
      label: 'Perfil',
      href: '/settings/profile',
      icon: User,
    },
    {
      label: 'Segurança',
      href: '/settings/security',
      icon: Shield,
    },
    {
      label: 'Notificações',
      href: '/settings/notifications',
      icon: Bell,
    },
    {
      label: 'Clínica',
      href: '/settings/clinic',
      icon: Building,
      permission: canAccessClinicSettings,
    },
    {
      label: 'Integrações',
      href: '/settings/integrations',
      icon: Plug,
      permission: canAccessClinicSettings,
    },
    {
      label: 'Billing',
      href: '/settings/billing',
      icon: CreditCard,
      permission: canAccessClinicSettings,
    },
  ];

  const visibleTabs = settingsTabs.filter(tab => !tab.permission || tab.permission());

  const isActiveTab = (href: string) => {
    if (href === '/settings') {
      return location.pathname === '/settings';
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
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="px-4 py-3">
            <Breadcrumbs />
          </div>
        </header>

        {/* Settings Content */}
        <main className="flex-1">
          <div className="px-4 py-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Configurações</h1>
                <p className="text-muted-foreground">
                  Gerencie suas preferências e configurações da conta
                </p>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Settings Navigation */}
                <aside className="lg:w-64 flex-shrink-0">
                  <nav className="space-y-1">
                    {visibleTabs.map((tab) => (
                      <Link
                        key={tab.href}
                        to={tab.href}
                        className={cn(
                          "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActiveTab(tab.href)
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        <tab.icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                      </Link>
                    ))}
                  </nav>
                </aside>

                {/* Settings Content */}
                <div className="flex-1 min-w-0">
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