/**
 * Dashboard Layout Component
 * FASE 4: Frontend Components - AI-Powered Dashboards
 * Compliance: LGPD/ANVISA/CFM
 */

'use client'

import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger, } from '@/components/ui/tabs'
import {
  Activity,
  BarChart3,
  Gauge,
  Grid3X3,
  List,
  Maximize2,
  RefreshCw,
  Settings,
  Shield,
} from 'lucide-react'
import { Suspense, useState, } from 'react'

// Import all dashboards
import { DASHBOARD_REGISTRY, } from './ai-powered'
import type { DashboardType, } from './ai-powered'
import { AIAnalyticsDashboard, } from './ai-powered/AIAnalyticsDashboard'
import { ComplianceStatusDashboard, } from './ai-powered/ComplianceStatusDashboard'
import { HealthMonitoringDashboard, } from './ai-powered/HealthMonitoringDashboard'
import { PerformanceMetricsDashboard, } from './ai-powered/PerformanceMetricsDashboard'
import { RealTimeActivityDashboard, } from './ai-powered/RealTimeActivityDashboard'

interface DashboardLayoutProps {
  defaultView?: 'grid' | 'tabs' | 'single'
  defaultDashboard?: DashboardType
  showSettings?: boolean
  className?: string
}

const DASHBOARD_COMPONENTS = {
  analytics: AIAnalyticsDashboard,
  health: HealthMonitoringDashboard,
  compliance: ComplianceStatusDashboard,
  performance: PerformanceMetricsDashboard,
  activity: RealTimeActivityDashboard,
} as const

const DASHBOARD_ICONS = {
  analytics: BarChart3,
  health: Activity,
  compliance: Shield,
  performance: Gauge,
  activity: Activity,
} as const

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4,].map((i,) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-20 mb-2" />
              <div className="h-8 bg-muted rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-64 bg-muted rounded" />
        </CardContent>
      </Card>
    </div>
  )
}

export function DashboardLayout({
  defaultView = 'tabs',
  defaultDashboard = 'analytics',
  showSettings = true,
  className = '',
}: DashboardLayoutProps,) {
  const [viewMode, setViewMode,] = useState<'grid' | 'tabs' | 'single'>(
    defaultView,
  )
  const [selectedDashboard, setSelectedDashboard,] = useState<DashboardType>(defaultDashboard,)
  const [refreshing, setRefreshing,] = useState(false,)

  const handleRefresh = async () => {
    setRefreshing(true,)
    // Simulate refresh delay
    await new Promise((resolve,) => setTimeout(resolve, 1000,))
    setRefreshing(false,)
  }

  const renderDashboard = (dashboardType: DashboardType,) => {
    const Component = DASHBOARD_COMPONENTS[dashboardType]
    return (
      <Suspense fallback={<LoadingSkeleton />}>
        <Component />
      </Suspense>
    )
  }

  const renderGridView = () => (
    <div className="space-y-8">
      {/* Quick Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Análise Inteligente</h3>
          {renderDashboard('analytics',)}
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Monitoramento de Saúde</h3>
          {renderDashboard('health',)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Conformidade</h3>
          {renderDashboard('compliance',)}
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Performance</h3>
          {renderDashboard('performance',)}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Atividade em Tempo Real</h3>
        {renderDashboard('activity',)}
      </div>
    </div>
  )

  const renderTabsView = () => (
    <Tabs defaultValue={selectedDashboard} className="space-y-6">
      <div className="flex items-center justify-between">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          {Object.entries(DASHBOARD_REGISTRY,).map(([key, config,],) => {
            const Icon = DASHBOARD_ICONS[key as DashboardType]
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">
                  {config.title.split(' ',)[0]}
                </span>
              </TabsTrigger>
            )
          },)}
        </TabsList>

        {showSettings && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {Object.entries(DASHBOARD_REGISTRY,).map(([key, config,],) => (
        <TabsContent key={key} value={key} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{config.title}</h2>
              <p className="text-muted-foreground">{config.description}</p>
            </div>
            <div className="flex gap-2">
              {config.compliance.map((framework,) => (
                <Badge key={framework} variant="secondary">
                  {framework}
                </Badge>
              ))}
            </div>
          </div>
          {renderDashboard(key as DashboardType,)}
        </TabsContent>
      ))}
    </Tabs>
  )

  const renderSingleView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            value={selectedDashboard}
            onValueChange={(value,) => setSelectedDashboard(value as DashboardType,)}
          >
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DASHBOARD_REGISTRY,).map(([key, config,],) => {
                const Icon = DASHBOARD_ICONS[key as DashboardType]
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {config.title}
                    </div>
                  </SelectItem>
                )
              },)}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('tabs',)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {showSettings && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        )}
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold">
            {DASHBOARD_REGISTRY[selectedDashboard].title}
          </h2>
          <p className="text-muted-foreground">
            {DASHBOARD_REGISTRY[selectedDashboard].description}
          </p>
        </div>
        {renderDashboard(selectedDashboard,)}
      </div>
    </div>
  )

  return (
    <div
      className={`space-y-6 ${className}`}
      role="main"
      aria-label="AI-Powered Dashboards"
    >
      {/* View Mode Selector */}
      {showSettings && (
        <header className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold" id="dashboard-main-title">
              Dashboards AI-Powered
            </h1>
            <p
              className="text-muted-foreground"
              aria-describedby="dashboard-main-title"
            >
              Monitoramento inteligente e análise em tempo real
            </p>
          </div>

          <div
            className="flex items-center gap-2"
            role="toolbar"
            aria-label="Dashboard View Controls"
          >
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid',)}
              aria-label="Grid View"
              aria-pressed={viewMode === 'grid'}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'tabs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('tabs',)}
              aria-label="Tabs View"
              aria-pressed={viewMode === 'tabs'}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'single' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('single',)}
              aria-label="Single View"
              aria-pressed={viewMode === 'single'}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </header>
      )}

      {/* Dashboard Content */}
      <section aria-labelledby="dashboard-main-title" aria-live="polite">
        {viewMode === 'grid' && renderGridView()}
        {viewMode === 'tabs' && renderTabsView()}
        {viewMode === 'single' && renderSingleView()}
      </section>
    </div>
  )
}
