// =====================================================================================
// NeonPro Inventory Management Dashboard Page
// Epic 6: Real-time Stock Tracking System
// Created: 2025-01-26
// =====================================================================================

import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { InventoryDashboard } from "@/components/inventory/inventory-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// =====================================================================================
// LOADING COMPONENTS
// =====================================================================================

function InventoryLoadingSkeleton() {
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

      {/* Main Content Loading */}
      <div className="bg-card rounded-lg border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex space-x-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Skeleton className="h-10 flex-1" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
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
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Skeleton className="h-5 w-16 mb-1" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="flex space-x-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================================
// MAIN PAGE COMPONENT
// =====================================================================================

export default async function InventoryPage() {
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

  // Breadcrumb configuration
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Inventory Management" },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Inventory Management
            </h1>
            <p className="text-muted-foreground">
              Track stock levels, manage items, and monitor inventory across all
              locations
            </p>
          </div>
        </div>

        {/* Main Content with Suspense */}
        <Suspense fallback={<InventoryLoadingSkeleton />}>
          <InventoryDashboard />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}

// =====================================================================================
// METADATA
// =====================================================================================

export const metadata = {
  title: "Inventory Management - NeonPro",
  description:
    "Real-time stock tracking and inventory management system for your clinic",
};
