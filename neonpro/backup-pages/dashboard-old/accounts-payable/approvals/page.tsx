import { createClient } from "@/app/utils/supabase/server";
import ApprovalDashboard from "@/components/dashboard/accounts-payable/approval-dashboard";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { redirect } from "next/navigation";

export default async function ApprovalsPage() {
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
    { title: "Contas a Pagar", href: "/dashboard/accounts-payable" },
    { title: "Aprovações" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <ApprovalDashboard />
    </DashboardLayout>
  );
}
