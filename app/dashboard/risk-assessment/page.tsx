/**
 * Risk Assessment Automation Dashboard Page
 * Story 9.4: Comprehensive automated risk assessment with medical validation
 *
 * This page provides the main dashboard interface for managing:
 * - Automated risk scoring and assessment management
 * - Human-in-the-loop medical validation workflow
 * - Real-time alert monitoring and management
 * - Risk mitigation strategy execution
 * - Performance analytics and reporting
 */

import RiskAssessmentDashboard from "@/app/components/dashboard/risk-assessment-automation";
import { createClient } from "@/app/utils/supabase/server";
import DashboardLayout from "@/components/navigation/dashboard-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Loading component for dashboard data
function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Data fetching function
async function fetchDashboardData() {
  try {
    const supabase = await createClient();

    // Fetch all required data in parallel
    const [assessmentsRes, validationsRes, alertsRes, mitigationsRes] =
      await Promise.all([
        supabase
          .from("risk_assessments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("risk_validations")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("risk_alerts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("risk_mitigations")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

    return {
      assessments: assessmentsRes.data || [],
      validations: validationsRes.data || [],
      alerts: alertsRes.data || [],
      mitigations: mitigationsRes.data || [],
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      assessments: [],
      validations: [],
      alerts: [],
      mitigations: [],
    };
  }
}

// Main dashboard component with data
async function DashboardContent() {
  const data = await fetchDashboardData();

  return <RiskAssessmentDashboard initialData={data} />;
}

// Main page component
export default async function RiskAssessmentPage() {
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
    { title: "Risk Assessment Automation" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="min-h-screen bg-background">
        <Suspense fallback={<DashboardLoading />}>
          <DashboardContent />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}

// Metadata for the page
export const metadata = {
  title: "Risk Assessment Automation - NeonPro",
  description:
    "Comprehensive automated risk assessment with medical validation for aesthetic procedures",
};

// Dynamic rendering for real-time data
export const dynamic = "force-dynamic";
export const revalidate = 0;
