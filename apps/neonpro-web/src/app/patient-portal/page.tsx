"use client";

import React, { Suspense } from "react";
import type { PatientDashboard } from "@/components/patient-portal/patient-dashboard";
import type { PortalLayout } from "@/components/patient-portal/portal-layout";
import type { LoadingSpinner } from "@/components/ui/loading-spinner";

// Disable static generation for this page since it uses client-side auth
export const dynamic = "force-dynamic";

export default function PatientPortalPage() {
  return (
    <PortalLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-muted-foreground">Carregando portal do paciente...</span>
          </div>
        }
      >
        <PatientDashboard />
      </Suspense>
    </PortalLayout>
  );
}
