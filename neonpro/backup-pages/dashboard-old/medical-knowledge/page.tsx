// Medical Knowledge Base Dashboard Page
// Story 9.5: Medical knowledge base management dashboard

import MedicalKnowledgeBaseDashboard from "@/app/components/dashboard/medical-knowledge-base";
import { KnowledgeBaseDashboard } from "@/app/types/medical-knowledge-base";
import { createClient } from "@/app/utils/supabase/server";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function getMedicalKnowledgeDashboardData(): Promise<KnowledgeBaseDashboard | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/medical-knowledge?action=dashboard`,
      {
        cache: "no-store",
      }
    );

    if (response.ok) {
      const result = await response.json();
      return result.data;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch medical knowledge dashboard data:", error);
    return null;
  }
}

export default async function MedicalKnowledgePage() {
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

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Medical Knowledge Base" },
  ];

  const dashboardData = await getMedicalKnowledgeDashboardData();

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        <MedicalKnowledgeBaseDashboard initialData={dashboardData} />
      </Suspense>
    </DashboardLayout>
  );
}
