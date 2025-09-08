/**
 * 📅 Appointments Layout - NeonPro Healthcare
 * ==========================================
 *
 * Layout for appointment management with calendar integration
 * and scheduling tools.
 */

'use client'

import { Breadcrumbs, } from '@/components/breadcrumbs'
import { MainNavigation, } from '@/components/main-navigation'
import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { Outlet, } from '@tanstack/react-router'
import { Calendar, Clock, Filter, Plus, } from 'lucide-react'

export function AppointmentsLayout() {
  const today = new Date()
  const todayStr = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },)

  return (
    <div className="min-h-screen bg-background">
      {/* Main Navigation */}
      <MainNavigation />

      {/* Main Content Area */}
      <div className="md:pl-64">
        {/* Top Header with Breadcrumbs and Actions */}
        <header className="sticky top-0 z-10 border-b bg-card">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Breadcrumbs />
                <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{todayStr}</span>
                  <Badge className="ml-2" variant="outline">
                    <Clock className="mr-1 h-3 w-3" />
                    {today.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    },)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
                <Button size="sm" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Vista
                </Button>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
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
  )
}
