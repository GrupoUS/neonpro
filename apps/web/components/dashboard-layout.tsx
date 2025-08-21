/**
 * 📊 Dashboard Layout - NeonPro Healthcare
 * =======================================
 *
 * Main dashboard layout with navigation, breadcrumbs,
 * and healthcare-specific context providers.
 */

'use client';

import { Outlet } from '@tanstack/react-router';
import React from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { MainNavigation } from '@/components/main-navigation';
import { useAuth } from '@/contexts/auth-context';

export function DashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-primary border-b-2" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

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

        {/* Page Content */}
        <main className="flex-1">
          <div className="px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
