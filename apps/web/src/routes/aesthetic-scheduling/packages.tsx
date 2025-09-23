import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TreatmentPackageScheduler } from "@/components/aesthetic-scheduling/TreatmentPackageScheduler";

export const Route = createFileRoute("/aesthetic-scheduling/packages/")({
  component: TreatmentPackageSchedulerPage,
  loader: () => {
    // Pre-load data for better UX
    return {
      packages: api.aestheticScheduling.getTreatmentPackages(),
      procedures: api.aestheticScheduling.getAestheticProcedures(),
    };
  },
});

function TreatmentPackageSchedulerPage() {
  const { data: packages } = useQuery({
    queryKey: ["treatment-packages"],
    queryFn: () => api.aestheticScheduling.getTreatmentPackages(),
  });

  const { data: procedures } = useQuery({
    queryKey: ["aesthetic-procedures"],
    queryFn: () => api.aestheticScheduling.getAestheticProcedures(),
  });

  return (
    <TreatmentPackageScheduler
      packages={packages || []}
      procedures={procedures || []}
      onSchedulePackage={async (data) => {
        try {
          const result = await api.aestheticScheduling.scheduleTreatmentPackage(data);
          return result;
        } catch (error) {
          console.error("Error scheduling treatment package:", error);
          throw error;
        }
      }}
    />
  );
}