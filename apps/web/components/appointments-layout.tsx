/**
 * 📅 Appointments Layout - NeonPro Healthcare
 * ==========================================
 * 
 * Layout for appointment management with calendar integration
 * and scheduling tools.
 */

'use client';

import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { MainNavigation } from '@/components/main-navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AppointmentsLayout() {
  const today = new Date();
  const todayStr = today.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
              <div className="space-y-1">
                <Breadcrumbs />
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{todayStr}</span>
                  <Badge variant="outline" className="ml-2">
                    <Clock className="h-3 w-3 mr-1" />
                    {today.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Vista
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar
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