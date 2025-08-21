/**
 * 👥 Patients Layout - NeonPro Healthcare
 * =====================================
 * 
 * Layout for patient management with context-aware navigation
 * and healthcare-specific patient tools.
 */

'use client';

import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { MainNavigation } from '@/components/main-navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';

export function PatientsLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Navigation */}
      <MainNavigation />
      
      {/* Main Content Area */}
      <div className="md:pl-64">
        {/* Top Header with Breadcrumbs and Actions */}
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <Breadcrumbs />
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Paciente
                </Button>
              </div>
            </div>
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