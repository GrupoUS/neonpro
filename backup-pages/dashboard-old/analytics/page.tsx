// app/dashboard/analytics/page.tsx
import { createClient } from "@/app/utils/supabase/server";
import { AnalyticsDashboard } from "@/components/dashboard/analytics/analytics-dashboard";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
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
    { title: "Analytics" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <AnalyticsDashboard />
    </DashboardLayout>
  );
}
