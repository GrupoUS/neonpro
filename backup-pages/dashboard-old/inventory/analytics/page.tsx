// =====================================================================================
// NeonPro Advanced Inventory Analytics Page
// Epic 6, Story 6.2: Advanced Inventory Analytics + Reports
// Created: 2025-01-26
// =====================================================================================

import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AdvancedAnalyticsDashboard } from "@/components/inventory/analytics/advanced-analytics-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// =====================================================================================
// LOADING COMPONENTS
// =====================================================================================

function AnalyticsLoadingSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Loading */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <Skeleton className="h-8 w-96 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* KPIs Grid Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-24 mt-1" />
          </div>
        ))}
      </div>

      {/* Analytics Tabs Loading */}
      <div className="space-y-6">
        <div className="grid w-full grid-cols-2 lg:grid-cols-7 gap-2">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        
        {/* Chart Loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border p-6">
            <div className="space-y-2 mb-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="space-y-2 mb-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================================
// MAIN PAGE COMPONENT
// =====================================================================================

export default async function InventoryAnalyticsPage() {
  // Authentication check
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <DashboardLayout user={user}>
      {/* Main Content with Suspense */}
      <Suspense fallback={<AnalyticsLoadingSkeleton />}>
        <AdvancedAnalyticsDashboard />
      </Suspense>
    </DashboardLayout>
  );
}

// =====================================================================================
// METADATA
// =====================================================================================

export const metadata = {
  title: "Inventory Analytics - NeonPro",
  description:
    "Advanced analytics and reporting for inventory management and optimization",
};