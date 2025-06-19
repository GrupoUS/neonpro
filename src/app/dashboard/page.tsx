import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { MetricCard } from '@/components/dashboard/metric-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { AppointmentChart } from '@/components/dashboard/appointment-chart'
import { 
  Calendar, 
  Users, 
  Stethoscope, 
  CreditCard,
  TrendingUp,
  Activity
} from 'lucide-react'

// Enable Partial Prerendering for this page
export const experimental_ppr = true

// Static components that can be prerendered
function DashboardHeader() {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-foreground">
        Dashboard Overview
      </h1>
      <p className="text-muted-foreground">
        Welcome back! Here's what's happening with your clinic today.
      </p>
    </div>
  )
}

function MetricsGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Today's Appointments"
        value="12"
        change="+2 from yesterday"
        icon={Calendar}
        trend="up"
      />
      
      <MetricCard
        title="Total Patients"
        value="1,234"
        change="+15 this month"
        icon={Users}
        trend="up"
      />
      
      <MetricCard
        title="Active Treatments"
        value="45"
        change="+8 this week"
        icon={Stethoscope}
        trend="up"
      />
      
      <MetricCard
        title="Revenue (Month)"
        value="$12,450"
        change="+12% from last month"
        icon={CreditCard}
        trend="up"
      />
    </div>
  )
}

// Skeleton components for loading states
function MetricCardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="space-y-1 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Static Header - Prerendered */}
      <DashboardHeader />
      
      {/* Static Metrics Grid - Prerendered */}
      <MetricsGrid />
      
      {/* Dynamic Content Grid - Streamed */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<ChartSkeleton />}>
          <AppointmentChart />
        </Suspense>
        
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
      </div>
      
      {/* Additional Metrics Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Suspense fallback={<MetricCardSkeleton />}>
          <MetricCard
            title="Patient Satisfaction"
            value="4.8/5"
            change="+0.2 this month"
            icon={TrendingUp}
            trend="up"
          />
        </Suspense>
        
        <Suspense fallback={<MetricCardSkeleton />}>
          <MetricCard
            title="Treatment Success Rate"
            value="94%"
            change="+2% this quarter"
            icon={Activity}
            trend="up"
          />
        </Suspense>
        
        <Suspense fallback={<MetricCardSkeleton />}>
          <MetricCard
            title="Average Wait Time"
            value="8 min"
            change="-3 min improved"
            icon={Calendar}
            trend="down"
          />
        </Suspense>
      </div>
    </div>
  )
}
