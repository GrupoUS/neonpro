// Report Builder Page
// Story 8.2: Custom Report Builder (Drag-Drop Interface)

import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ReportBuilderMain } from "@/components/dashboard/report-builder-main";
import { redirect } from "next/navigation";

export default async function ReportBuilderPage() {
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
      <ReportBuilderMain />
    </DashboardLayout>
  );
}
