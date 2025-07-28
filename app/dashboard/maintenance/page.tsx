// =====================================================================================
// MAINTENANCE DASHBOARD PAGE
// Epic 6 - Story 6.4: Equipment maintenance management dashboard with real-time alerts
// =====================================================================================

import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import MaintenanceDashboard from "@/components/dashboard/maintenance/MaintenanceDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// =====================================================================================
// LOADING COMPONENTS
// =====================================================================================

function MaintenanceLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Tabs Loading */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================================================
// MAIN PAGE COMPONENT
// =====================================================================================

export default async function MaintenancePage() {
  // Server-side authentication check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // For now, we'll use a default clinic ID or get it from user profile
  // TODO: Implement proper clinic selection in future iterations
  const defaultClinicId = "default-clinic-id";

  return (
    <DashboardLayout user={user}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Equipment Maintenance
            </h1>
            <p className="text-muted-foreground">
              Manage maintenance schedules and monitor equipment alerts
            </p>
          </div>
        </div>

        {/* Main Content with Suspense */}
        <Suspense fallback={<MaintenanceLoadingSkeleton />}>
          <MaintenanceDashboard clinicId={defaultClinicId} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}

// =====================================================================================
// METADATA
// =====================================================================================

export const metadata = {
  title: "Equipment Maintenance - NeonPro",
  description:
    "Equipment maintenance management dashboard with scheduling and alerts",
};
