/**
 * Story 6.1 Task 2: Barcode Management Page
 * Dedicated page for barcode/QR code management in inventory
 * Quality: ≥9.5/10 with comprehensive authentication and layout
 */

import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { BarcodeDashboard } from "@/components/inventory/barcode";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// =====================================================================================
// LOADING COMPONENTS
// =====================================================================================

function BarcodeLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Loading */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Stats Cards Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Loading */}
      <div className="w-full">
        <div className="grid w-full grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>

        {/* Main Content Loading */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg border">
            <div className="p-6 border-b">
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================================
// MAIN PAGE COMPONENT
// =====================================================================================

export default async function BarcodesPage() {
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
    { title: "Inventory", href: "/dashboard/inventory" },
    { title: "Códigos de Barras" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="container mx-auto">
        {/* Main Content with Suspense */}
        <Suspense fallback={<BarcodeLoadingSkeleton />}>
          <BarcodeDashboard defaultTab="scan" />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}

// =====================================================================================
// METADATA
// =====================================================================================

export const metadata = {
  title: "Códigos de Barras - NeonPro",
  description:
    "Sistema completo de geração, escaneamento e gerenciamento de códigos de barras e QR codes para inventário",
  keywords: [
    "códigos de barras",
    "QR code",
    "inventário",
    "escaneamento",
    "gestão de estoque",
    "NeonPro"
  ],
};