'use client'

import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Lazy load heavy dashboard components
export const LazyAppointmentCalendar = lazy(() => 
  import('./appointments/calendar/calendar-view').then(module => ({
    default: module.CalendarView
  }))
)

export const LazyFinancialDashboard = lazy(() =>
  import('./financial/financial-overview').then(module => ({
    default: module.FinancialOverview
  }))
)

export const LazyPatientManagement = lazy(() =>
  import('./patients/patient-management').then(module => ({
    default: module.PatientManagement  
  }))
)

export const LazyStockDashboard = lazy(() =>
  import('./stock/stock-dashboard').then(module => ({
    default: module.StockDashboard
  }))
)

export const LazyReportsAnalytics = lazy(() =>
  import('./reports/analytics-dashboard').then(module => ({
    default: module.AnalyticsDashboard
  }))
)

// Loading components with skeleton UI
export const AppointmentCalendarSkeleton = () => (
  <Card className="w-full h-[600px]">
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-32" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </CardContent>
  </Card>
)

export const FinancialDashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </CardHeader>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  </div>
)

export const PatientManagementSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <Card>
      <CardContent className="p-0">
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)

export const StockDashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16" />
          </CardHeader>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

export const ReportsAnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-20" />
          </CardHeader>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-80 w-full" />
      </CardContent>
    </Card>
  </div>
)

// Higher-order component for lazy loading with error boundary
export function withLazyLoading<T extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<T>>,
  LoadingSkeleton: React.ComponentType,
  componentName: string
) {
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={<LoadingSkeleton />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Preload functions for critical routes
export const preloadComponents = {
  appointments: () => import('./appointments/calendar/calendar-view'),
  financial: () => import('./financial/financial-overview'),
  patients: () => import('./patients/patient-management'),
  stock: () => import('./stock/stock-dashboard'),
  reports: () => import('./reports/analytics-dashboard'),
}

// Preload based on user interaction
export const preloadOnHover = (componentKey: keyof typeof preloadComponents) => {
  return {
    onMouseEnter: () => preloadComponents[componentKey](),
    onFocus: () => preloadComponents[componentKey](),
  }
}
